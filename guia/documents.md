src/
├── common/                # Helpers, filtros de excepciones, interceptores globales
│   ├── decorators/        # Decoradores personalizados (ej. @GetUser)
│   ├── dto/               # DTOs globales (ej. paginación)
│   ├── guards/            # AuthGuard, RolesGuard
│   └── middleware/        # Logging, compresión
│
├── config/                # Validación de variables de entorno (Joi/class-transformer)
│   └── configuration.ts
│
├── database/              # Migraciones y semillas (seeds) de PostgreSQL
│
├── modules/               # El corazón del negocio
│   ├── auth/              # Registro, Login, JWT Strategy
│   ├── users/             # Gestión de perfiles y búsqueda de usuarios
│   ├── chat/              # Lógica de mensajes y conversaciones
│   │   ├── gateways/      # WebSockets (Socket.io)
│   │   ├── services/
│   │   └── controllers/
│   ├── dashboard/         # Consultas complejas y agregaciones para estadísticas
│   └── notifications/     # (Opcional) Push, Email o alertas internas
│
├── providers/             # Integraciones externas (S3, Redis, Mailer)
│
├── main.ts                # Punto de entrada
└── app.module.ts          # Orquestador principal