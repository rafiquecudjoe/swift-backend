export class AuditLogDto {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: any;
  ipAddress?: string;
}

export enum AuditAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  REGISTER = 'REGISTER',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  ASSIGN = 'ASSIGN',
  UNASSIGN = 'UNASSIGN',
}

export enum AuditEntity {
  USER = 'USER',
  DRIVER = 'DRIVER',
  VEHICLE = 'VEHICLE',
  ASSIGNMENT = 'ASSIGNMENT',
}
