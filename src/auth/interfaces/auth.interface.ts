import { UserDocument } from '../schema/user.schema';

export interface SessionData {
    userId: string;
    refreshToken: string;
    createdAt: number;
}

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
}

export interface LoginResponse extends TokenResponse {
    user: UserDocument;
}

export interface UsersResponse {
    users: UserDocument[];
    total: number;
}