# *Backend Messaging System, Login & Admin Dashboard*

### Resume
Este proyecto consiste en una infraestructura robusta ( gracias al sistema modular de **NestJs** y **TypeScript** ), para un sistema de mensajería en tiempo real y un panel administrativo de métricas. La solución ha sido construida bajo una arquitectura escalable utilizando **NestJS**, garantizando una separación clara de responsabilidades y una gestión de datos eficiente mediante **Prisma ORM** y **PostgreSQL**. El objetivo principal es ofrecer una plataforma segura, tipada y fácil de auditar a través de documentación interactiva y registros de actividad.

---

## 1. Organización del Proyecto
src/
├── common/                # Helpers, filtros de excepciones, interceptores globales
│   ├── decorators/        # Decoradores personalizados -> @GetUser
│   ├── dto/               # DTOs globales -> rolesDto
│   └── guards/            # JwtGuard, BannedGuard, OwnerGuard, RolesGuard, WsBannedGuard, WsJwtGuard
│
├── config/                # Para validación de variables de entorno en el futuro (Joi/class-transformer)
│   └── configuration.ts
│
├── database/              # Migraciones de PostgreSQL ( tambien podri contener semillas (seeds) )
│
├── modules/               # Los modulos 
│   ├── dashboard/         # Consultas complejas y agregaciones para estadísticas
│   ├── auth/              # Registro, Login, JWT Strategy   
│   ├── chat/              # Lógica de conversaciones (chats)
│   ├── message/           # Lógica de mensajes y status
│   │   └── gateways/      # WebSockets (Socket.io)
│   └── users/             # Gestión de perfiles y búsqueda de usuarios
│
├── providers/             # Posibles integraciones externas a futuro (S3, Redis, Mailer)
│
├── main.ts                # Punto de entrada
└── app.module.ts          # Orquestador principal

La estructura sigue el estándar modular de NestJS, facilitando el mantenimiento y la escalabilidad:
* **`src/auth`**: Gestión de sesiones y seguridad JWT.
* **`src/users` & `src/chat`**: Lógica de negocio y persistencia.
* **`src/admin`**: Controladores de renderizado (EJS) y servicios de agregación.
* **`views/`**: Plantillas de servidor para el dashboard administrativo.
* **`src/message`**: Mensajeria instantanea y logica de WebSocket.

## 2. Diseño de Entidades y Relaciones
Se implementó un modelo relacional normalizado en PostgreSQL:
* **Users**: Creacion de usuario para: Inicio de seccion, Registro y CRUD general.
* **Conversaciones y Participantes**: Relación *Many-to-Many* explícita para control total sobre los miembros del chat.
* **Mensajería**: Integración de integridad referencial con `ON DELETE CASCADE` en cascada para limpieza de datos.
* **MensajeEnviados**: Integracion de relacion para localizar en tiempo los chats leidos y por cuantos usuarios.
* **Activity Logs**: Entidad dedicada a la auditoría, permitiendo rastrear eventos críticos sin comprometer la tabla principal de usuarios. **( No hay eventos que se guarden aqui por ahora es mas una prevencion para futuro )**.

## 3. Dashboard
Para el Dashboard, se priorizó el rendimiento mediante:
* **Consultas Paralelas**: Uso de `Promise.all` en el servicio de estadísticas para reducir el tiempo de respuesta.
* **Agregaciones de Prisma**: Uso de `_count`, `groupBy` y `orderBy` para generar métricas complejas (Top 5 usuarios, mensajes leídos vs no leídos) directamente desde el motor de base de datos.

## 4. Uso de TypeScript y Validaciones
* **Tipado Estricto**: Uso de interfaces y clases para definir el flujo de datos.
* **DTOs**: Implementación de `class-validator` para asegurar que cada entrada de datos cumpla con el formato esperado antes de llegar a la lógica de negocio.

## 5. Seguridad Básica y Manejo de Errores
* **Autenticación**: Protección de rutas mediante `Passport JWT` y `Guards` de NestJS.
* **CORS**: Configuración restrictiva para permitir solo orígenes de confianza.
* **Filtros de Excepción**: Manejo centralizado de errores para evitar fugas de información técnica en las respuestas HTTP.

## 6. Documentación del Proyecto
* **Swagger (OpenAPI)**: Documentación interactiva disponible en `api/docs`, detallando cada endpoint, esquemas de entrada/salida y requisitos de seguridad.
* **Websocket**: En la parte inferior se encuentra la guia para la prueba de Websockets.

## 7. Stack, Criterio Técnico en Decisiones Tomadas
* **Base de Datos Postgres**: Tiene un muy buen soporte y cada vez mas amplio, buen estandar en BDD relacionales. 
* **¿Por qué EJS?**: Se eligió para el Dashboard administrativo por su baja latencia de desarrollo y eficiencia al ser SSR (Server Side Rendering), facilitando la implementacion del Dashboard.
* **¿Por qué UUID?**: Uso de identificadores únicos universales en lugar de IDs incrementales para mejorar la seguridad y evitar la enumeración de recursos.
* **¿Por qué Map/@@Map?**: Para mantener la coherencia entre el estándar de código (camelCase) y el estándar de base de datos (snake_case).
* **Documentacion**: Se utilizo Swagger para el protocolo **HTTP** estandar y en el *README* la infromacion necesaria para ejecutar los **WEBSOCKETS** 

---

### ¿Cómo ejecutar el proyecto?
1. Instalar dependecias -> `npm install`
2. Configurar `.env`: `DATABASE_URL`, `JWT_SECRET`.
3. Levantar la base de datos -> `docker-compose up -d`
4. Migrar base de datos -> `npx prisma migrate dev`
4. Build + Dev -> `npm run start:dev`
5. Visitar `api/docs` para la API de Swagger o `/admin/stats/summary` para el panel.

---

# *WEBSOCKETS*

URL: ws://localhost:3000
Auth: Bearer Token en el Handshake (Header: Authorization)

### Evento (Emit) -> Payload (JSON) -> Return -> Descripción

**joinRoom** -> "{ conversationId: UUID }" -> "{ status: 'joined', room: roomName }" -> Se une a una sala de chat a 

**leaveRoom** -> "{ conversationId: UUID, abandon?: boolean }" -> "{ status: 'left', room: roomName }" -> Abandona la sala a la que pertenece, puede borrar su persistencia en el chat y si es el ultimo usuario borra el chat al salir (elimina la persistencia de este chat)

**sendMessage** -> "{ conversationId: UUID; content: string }" ->
-> "{ 
      id: string;
      createdAt: Date;
      conversationId: string;
      content: string;
      senderId: string; 
      }" 
-> Guarda y envía un mensaje al grupo y notifica.

**updateMessage** -> "{ conversationId: UUID; messageId: UUID; content: string }" ->
-> "{ 
      id: string;
      createdAt: Date;
      conversationId: string;
      content: string;
      senderId: string; 
      }" 
-> Actualiza y reenvia un mensaje al grupo y notifica.

**deleteMessage** -> "{ conversationId: UUID; messageId: UUID }" -> "{ success: true }" -> Borra mensaje del grupo y notifica.

**historyMessages** -> "{ conversationId: UUID }" -> [`messageEntity`] -> Devuelve un array de mensajes (lo mismo que devuelve *sendMessage* por ejemplo) pertenecientes a un historial, directo al Websocket.

**markGroupAsRead** -> "{ conversationId: UUID }" -> "{ success: true, count: unreadMessages.length }" -> Marca un gurpo como leido y devuelve el numero de mensajes no leidos en el chat por el usuario (0).

**markAsRead** -> "{ conversationId: UUID; messageId: UUID }" -> "{ success: true }" -> Marca mensajes como leídos y notifica.