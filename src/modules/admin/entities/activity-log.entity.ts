export class ActivityLogEntity {
  id: string;
  action: string; // Ej: 'MESSAGE_SENT', 'USER_LOGIN', 'CHAT_CREATED'
  timestamp: Date;
  userId: string;
}