// Wallet Authentication Types

export interface User {
    id: string;
    wallet_address: string;
    created_at: string;
    updated_at: string;
}

export interface UserProfile {
    user_id: string;
    username: string | null;
    email: string | null;
    avatar_url: string | null;
    bio: string | null;
    created_at: string;
    updated_at: string;
}

export interface UserWithProfile extends User {
    user_profiles: UserProfile | null;
}

export interface NonceResponse {
    success: boolean;
    nonce?: string;
    expiresAt?: string;
    error?: string;
}

export interface AuthResponse {
    success: boolean;
    user?: UserWithProfile;
    message?: string;
    error?: string;
}

export interface ProfileUpdateData {
    username?: string;
    email?: string;
    avatar_url?: string;
    bio?: string;
}
