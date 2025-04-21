import { User } from "./user.model";

export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface LoginResponse {
    token: string;
    user: User;
  }
  
  export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }

export type { User };
