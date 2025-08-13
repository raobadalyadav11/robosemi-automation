export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'operator';
  password?: string;
  image?: string;
  thingspeakApiKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StreetLight {
  _id: string;
  name: string;
  ledNumber: number;
  status: 'on' | 'off';
  thingSpeakField: string;
  inputStatusUrl?: string;
  currentStatusUrl?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiConfig {
  _id: string;
  name: string;
  apiKey: string;
  channelId: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'user' | 'operator';