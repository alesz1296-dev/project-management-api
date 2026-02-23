export interface JwtPayload {
  id: number;
  email: string;
  iat?: number; // iat => issued at
  exp?: number;
}

//DTO => Data transfer object
export interface LoginDto {
  email: string;
  password: string;
}

export interface SignupDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  accessToken?: string;
  refreshToken?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}
