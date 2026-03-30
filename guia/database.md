Aquí tienes el archivo Markdown estructurado para tu proyecto. He organizado las tablas por orden de dependencia (quién necesita a quién para existir) y los DTOs siguiendo las mejores prácticas de TypeScript.

---

# Documentación de Base de Datos y DTOs - Chat App

Este documento detalla la estructura física de la base de datos (PostgreSQL) y los objetos de transferencia de datos (DTOs) para la lógica de negocio.

## 1. Orden de Creación de Tablas
Para evitar errores de llaves foráneas (`Foreign Keys`), las tablas deben crearse o poblarse en este orden:

1.  **`users`**: Independiente.
2.  **`conversations`**: Independiente.
3.  **`messages`**: Depende de `users` y `conversations`.
4.  **`participants`**: Tabla de unión, depende de `users` y `conversations`.
5.  **`activity_logs`**: Depende de `users`.

---

## 2. Diccionario de Datos (Columnas)

### Tabla: `users`
| Columna | Tipo | Restricciones |
| :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL |
| `password` | VARCHAR(255) | NOT NULL |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL |
| `role` | VARCHAR(20) | DEFAULT 'USER' |
| `is_online` | BOOLEAN | DEFAULT false |
| `is_banned` | BOOLEAN | DEFAULT false |
| `created_at` | TIMESTAMP | DEFAULT now() |
| `updated_at` | TIMESTAMP | ON UPDATE now() |

### Tabla: `conversations`
| Columna | Tipo | Restricciones |
| :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY |
| `title` | VARCHAR(100) | NULLABLE |
| `is_group` | BOOLEAN | DEFAULT false |
| `created_at` | TIMESTAMP | DEFAULT now() |
| `updated_at` | TIMESTAMP | ON UPDATE now() |

### Tabla: `messages`
| Columna | Tipo | Restricciones |
| :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY |
| `content` | TEXT | NOT NULL |
| `is_read` | BOOLEAN | DEFAULT false |
| `created_at` | TIMESTAMP | DEFAULT now() |
| `conversation_id`| UUID | FK -> conversations(id) ON DELETE CASCADE |
| `sender_id` | UUID | FK -> users(id) |

### Tabla: `participants`
| Columna | Tipo | Restricciones |
| :--- | :--- | :--- |
| `conversation_id`| UUID | FK -> conversations(id), PK |
| `user_id` | UUID | FK -> users(id), PK |

---

## 3. Data Transfer Objects (DTOs)

He definido estos DTOs pensando en una implementación típica con **class-validator** o interfaces de TypeScript.

### Usuario
```typescript
// Registro de usuario
export class CreateUserDto {
  email!: string;
  password!: string;
  username!: string;
}

// Actualización de perfil/estado
export class UpdateUserDto {
  username?: string;
  isOnline?: boolean;
  isBanned?: boolean;
}
```

### Chat y Mensajería
```typescript
// Crear conversación (ej. al iniciar chat con alguien)
export class CreateConversationDto {
  title?: string;
  isGroup: boolean = false;
  participantIds!: string[]; // Array de IDs de usuarios
}

// Enviar mensaje
export class SendMessageDto {
  content!: string;
  conversationId!: string;
  senderId!: string;
}
```

### Logs
```typescript
export class CreateActivityLogDto {
  action!: string;
  userId!: string;
}
```

---

> **Nota para el desarrollador:** > En el modelo `ActivityLogs` que pasaste, recuerda que en Prisma, para que la relación sea bidireccional, deberías añadir `activityLogs ActivityLogs[]` dentro del modelo `User`. Si no lo haces, Prisma se quejará de que falta la "back-relation".

¿Te gustaría que te ayude a crear las funciones de servicio en TypeScript para crear una conversación incluyendo a los participantes de una sola vez?