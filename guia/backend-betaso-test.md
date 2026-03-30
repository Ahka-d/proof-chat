# 🚀 Prueba Técnica – Backend Developer

## 📌 Contexto

El objetivo de esta prueba es evaluar tu capacidad para diseñar y desarrollar una solución backend clara, bien estructurada y funcional.

Deberás construir una API para un sistema simple de mensajería interna entre usuarios, con autenticación, gestión de usuarios, conversaciones, mensajes en tiempo real y un pequeño módulo de dashboard con métricas básicas.

> 🎯 No buscamos cantidad de funcionalidades, sino buenas decisiones técnicas, código limpio y una solución consistente.

---

## 🧩 Requisitos Generales

### Stack obligatorio
- **Node.js** con **TypeScript**
- **NestJS**
- **Base de datos relacional** a tu elección
- **JWT** para autenticación
- **Swagger / OpenAPI**

Puedes usar las librerías adicionales que consideres apropiadas.  
Esperamos que documentes tus decisiones técnicas en el README.

---

## ⚙️ Funcionalidades Esperadas

### 1️⃣ Autenticación

Implementar un sistema de autenticación que permita:

- Registro de usuario
- Inicio de sesión
- Protección de rutas privadas
- Validaciones básicas

#### Usuario (ejemplo sugerido)
- id
- email
- password
- username
- fullName
- status
- createdAt
- updatedAt

> La estructura anterior es solo una sugerencia.  
> Puedes modificar los campos, agregar otros o ajustar el modelo según tu criterio, siempre que la solución mantenga coherencia.

---

### 2️⃣ Gestión de Usuarios

Implementar la gestión de usuarios dentro del sistema.

#### Reglas
- Solo usuarios autenticados pueden acceder a la información privada
- Un usuario puede consultar y actualizar su propia información
- Un usuario puede ser desactivado
- Los usuarios inactivos no pueden participar en el sistema

---

### 3️⃣ Conversaciones

Implementar un módulo de conversaciones o salas de chat.

#### Entidad sugerida
- Conversation

#### Reglas
- Debe existir soporte para conversaciones entre usuarios
- Un usuario solo puede ver conversaciones donde participa
- La relación entre usuarios y conversaciones debe persistirse correctamente
- Puedes decidir si manejas conversaciones directas, grupales o ambas, siempre que lo documentes y mantengas coherencia

> La entidad y su estructura son sugeridas.  
> No es obligatorio seguir exactamente este modelo si planteas una alternativa bien justificada.

---

### 4️⃣ Mensajes

Implementar el módulo de mensajes asociado a una conversación.

#### Entidad sugerida
- Message

#### Reglas
- Solo usuarios autenticados y activos pueden enviar mensajes
- Un usuario solo puede enviar mensajes dentro de conversaciones donde participa
- Los mensajes deben persistirse en base de datos
- Debe existir la posibilidad de consultar el historial de mensajes

> La entidad y su estructura son sugeridas.  
> Puedes adaptarlas o redefinirlas si tu diseño lo requiere.

---

### 5️⃣ Entidades Complementarias

Agregar hasta **dos entidades adicionales** que complementen el sistema y permitan demostrar modelado relacional, joins y consultas útiles.

Algunos ejemplos posibles:
- Team
- ConversationParticipant
- MessageRead
- Contact
- UserProfile

> Estas entidades son solo sugerencias.  
> No es obligatorio usar exactamente estas ni seguir una estructura específica.  
> Puedes proponer otras si aportan valor al dominio y ayudan a construir una solución coherente.

---

### 6️⃣ Comunicación en Tiempo Real

Implementar comunicación en tiempo real para el envío de mensajes.

#### Reglas
- Solo usuarios autenticados pueden conectarse
- Un usuario solo puede suscribirse a conversaciones donde participa
- Los mensajes deben propagarse en tiempo real a los participantes conectados

> No buscamos un sistema complejo tipo WhatsApp o Slack.  
> Una implementación simple, funcional y bien estructurada es suficiente.

---

### 7️⃣ Dashboard

Implementar un módulo de dashboard con algunas métricas básicas obtenidas desde la base de datos.

#### Requerimiento
El sistema debe exponer métricas agregadas que permitan evaluar consultas, joins, relaciones y agregaciones.

#### Métricas sugeridas
- Total de usuarios activos
- Total de conversaciones
- Total de mensajes enviados
- Top 5 usuarios con más mensajes enviados
- Top 5 conversaciones con más mensajes
- Cantidad de mensajes leídos vs no leídos
- Cantidad de usuarios por equipo

No es necesario implementar todas las métricas sugeridas, pero sí un conjunto pequeño y coherente que permita demostrar consultas útiles sobre el modelo relacional construido.

---

## 🧠 Qué Evaluaremos

- Organización del proyecto
- Calidad y claridad del código
- Uso correcto de TypeScript
- Diseño de entidades y relaciones
- Validaciones y manejo de errores
- Seguridad básica
- Coherencia de la solución
- Calidad de consultas y agregaciones
- Documentación del proyecto
- Criterio técnico en las decisiones tomadas

---

## ⭐ Bonus (Opcional)

No es obligatorio, pero suma puntos:

- **Pruebas unitarias**
- Frontend simple únicamente para visualizar las métricas del dashboard
- Un endpoint que devuelva un **grafo de interacción** entre usuarios, donde se represente qué usuarios han hablado entre sí y la cantidad de mensajes intercambiados

> No hace falta frontend para autenticación, usuarios, conversaciones ni chat.  
> Si decides implementar frontend, debe ser solo para mostrar las métricas del dashboard.

---

## 📦 Entrega

- Repositorio GitHub (preferido) o archivo `.zip`
- Debe incluir un README con:
  - Descripción del proyecto
  - Stack utilizado
  - Decisiones técnicas relevantes
  - Instrucciones para ejecutar el proyecto
  - Variables de entorno necesarias
  - Documentación Swagger o colección Postman

---

## ⏳ Tiempo de Entrega

**72 horas** desde la recepción de la prueba.

Consideramos que una solución sólida puede completarse en aproximadamente **48 horas** de trabajo efectivo.

---

## 📝 Notas Importantes

- **Calidad > Cantidad**
- Es mejor una solución pequeña y consistente que muchas funcionalidades incompletas
- Documenta tus decisiones
- No agregues complejidad innecesaria
- Puedes usar herramientas de IA como apoyo, pero debes entender y poder explicar tu implementación

---

## ❓ Preguntas Frecuentes

**¿Debo implementar frontend?**  
No. La prueba es backend.  
Solo de forma opcional puedes hacer un frontend simple para visualizar métricas del dashboard.

**¿Debo implementar WebSockets obligatoriamente?**  
Sí, pero de forma simple.

**¿Debo implementar roles?**  
No es obligatorio.

**¿Debo usar Docker?**  
No es obligatorio, pero es válido si aporta valor a tu solución.

---

¡Mucho éxito! 🚀
