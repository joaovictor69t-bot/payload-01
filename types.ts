export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum RecordType {
  INDIVIDUAL = 'INDIVIDUAL',
  DAILY = 'DAILY'
}

export interface User {
  username: string;
  role: UserRole;
  createdAt: number;
}

export interface DeliveryRecord {
  id: string;
  userId: string;
  date: string; // ISO Date string YYYY-MM-DD
  type: RecordType;
  
  // Fields for Individual
  individualId?: string;
  parcels?: number;
  collections?: number;

  // Fields for Daily
  dailyIds?: string[]; // Array of strings for 1 or 2 IDs
  totalParcels?: number;

  // Shared
  photos: string[]; // Base64 strings
  calculatedValue: number;
  createdAt: number;
}

export type ViewState = 'LOGIN' | 'DASHBOARD' | 'HISTORY' | 'PROFILE' | 'ADMIN';
