// src/app/features/booking/models/booking.model.ts
export interface Booking {
  id: string;
  spaceId: string;
  userId: string;
  startTime: string | Date;
  endTime: string | Date;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export enum BookingStatus {
  Pending = 0,
  Confirmed = 1,
  Cancelled = 2,
  Completed = 3
}

export interface BookingCreateDto {
  userId: string;
  spaceId: string;
  startTime: string | Date;
  endTime: string | Date;
}

export interface BookingUpdateDto {
  id: string;
  spaceId?: string;
  status? :BookingStatus;
  startTime?: string | Date;
  endTime?: string | Date;
}