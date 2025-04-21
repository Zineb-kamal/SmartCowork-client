// src/app/core/models/space.model.ts
export interface Space {
  id: string; 
  name: string;
  description: string;
  capacity: number;
  type: SpaceType;
  status: SpaceStatus;
  // Pricing
  pricePerHour: number;
  pricePerDay: number;
  pricePerWeek: number;
  pricePerMonth: number;
  pricePerYear: number;
  // Pour l'UI
  imageUrl?: string;
  city?: string;
}

export enum SpaceType {
  Desk = 0,
  MeetingRoom = 1,
  PrivateOffice = 2,
  ConferenceRoom = 3
}

export enum SpaceStatus {
  Available = 0,
  Occupied = 1,
  Maintenance = 2
}