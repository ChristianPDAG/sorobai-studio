'use server';

import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

/**
 * Request a nonce for wallet authentication
 * The nonce is temporarily stored and will be used to verify the signature
 */
export async function requestNonce(walletAddress: string) {
    try {
        if (!walletAddress || typeof walletAddress !== 'string') {
            return {
                success: false,
                error: 'Invalid wallet address',
            };
        }

        // Normalize wallet address (uppercase)
        const normalizedAddress = walletAddress.toUpperCase();

        // Generate a random nonce (32 bytes hex)
        const nonce = crypto.randomBytes(32).toString('hex');

        // Create Supabase client with service role for admin operations
        const supabase = await createClient();

        // Check if there are any unused nonces for this wallet
        const { data: existingNonces } = await supabase
            .from('auth_nonces')
            .select('id')
            .eq('wallet_address', normalizedAddress)
            .eq('used', false)
            .gt('expires_at', new Date().toISOString());

        // Delete existing unused nonces for this wallet
        if (existingNonces && existingNonces.length > 0) {
            await supabase
                .from('auth_nonces')
                .delete()
                .eq('wallet_address', normalizedAddress)
                .eq('used', false);
        }

        // Nonce expires in 5 minutes
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // Store nonce in database
        const { data, error } = await supabase
            .from('auth_nonces')
            .insert({
                wallet_address: normalizedAddress,
                nonce,
                expires_at: expiresAt.toISOString(),
                used: false,
            })
            .select()
            .single();

        if (error) {
            console.error('Error storing nonce:', error);
            return {
                success: false,
                error: 'Failed to generate authentication challenge',
            };
        }

        // Return the nonce to be signed by the client
        return {
            success: true,
            nonce,
            expiresAt: expiresAt.toISOString(),
        };
    } catch (error: any) {
        console.error('Error in requestNonce:', error);
        return {
            success: false,
            error: error.message || 'Internal server error',
        };
    }
}

/**
 * Verify signature and create/login user
 * This validates that the user controls the wallet by verifying their signature
 */
export async function verifySignatureAndLogin(
    walletAddress: string,
    signedMessage: string,
    signature: string
) {
    try {
        if (!walletAddress || !signedMessage || !signature) {
            return {
                success: false,
                error: 'Missing required parameters',
            };
        }

        // Normalize wallet address
        const normalizedAddress = walletAddress;

        const supabase = await createClient();
        console.log('Verifying signature for message:', signedMessage, signature);
        // Get the nonce from database
        const { data: nonceRecord, error: nonceError } = await supabase
            .from('auth_nonces')
            .select('*')
            .eq('wallet_address', normalizedAddress)
            .eq('used', false)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        console.log('Fetched nonce record:', nonceRecord);
        if (nonceError || !nonceRecord) {
            return {
                success: false,
                error: 'Invalid or expired authentication challenge',
            };
        }

        // Verify that the signed message contains the nonce
        if (!signedMessage.includes(nonceRecord.nonce)) {
            return {
                success: false,
                error: 'Message does not contain the expected nonce',
            };
        }

        // Verify the signature using Stellar SDK
        let isValid = false;
        try {
            // Import Stellar SDK utilities
            const { Keypair, hash } = await import('@stellar/stellar-sdk');

            // Freighter uses a specific message format for signing
            // It hashes the message with sha256 before signing
            const SIGN_MESSAGE_PREFIX = "Stellar Signed Message:\n";
            const prefixedMessage = SIGN_MESSAGE_PREFIX + signedMessage;
            const messageHashBuffer = hash(Buffer.from(prefixedMessage, 'utf-8'));

            // Decode signature from base64
            const signatureBuffer = Buffer.from(signature, 'base64');

            // Create keypair from public key
            const keypair = Keypair.fromPublicKey(normalizedAddress);

            // Verify the hashed message
            isValid = keypair.verify(messageHashBuffer, signatureBuffer);

            console.log('Signature verification:', {
                publicKey: normalizedAddress,
                messageLength: signedMessage.length,
                signatureLength: signatureBuffer.length,
                isValid
            });
        } catch (verifyError: any) {
            console.error('Signature verification error:', verifyError);
            return {
                success: false,
                error: 'Invalid signature format',
            };
        }

        if (!isValid) {
            return {
                success: false,
                error: 'Signature verification failed',
            };
        }

        // Mark nonce as used
        await supabase
            .from('auth_nonces')
            .update({ used: true })
            .eq('id', nonceRecord.id);

        // Find or create user
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('wallet_address', normalizedAddress)
            .single();

        let userId: string;

        if (existingUser) {
            // User exists
            userId = existingUser.id;

            // Update last access
            await supabase
                .from('users')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', userId);
        } else {
            // Create new user
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert({
                    wallet_address: normalizedAddress,
                })
                .select()
                .single();

            if (createError || !newUser) {
                console.error('Error creating user:', createError);
                return {
                    success: false,
                    error: 'Failed to create user account',
                };
            }

            userId = newUser.id;

            // Create empty profile
            await supabase
                .from('user_profiles')
                .insert({
                    user_id: userId,
                });
        }

        // Get user data with profile
        const { data: userData } = await supabase
            .from('users')
            .select(`
        *,
        user_profiles (*)
      `)
            .eq('id', userId)
            .single();

        // For proper session management, you would integrate this with Supabase Auth
        // For now, we return the user data and let the client handle session storage
        return {
            success: true,
            user: userData,
            message: existingUser ? 'Login successful' : 'Account created successfully',
        };
    } catch (error: any) {
        console.error('Error in verifySignatureAndLogin:', error);
        return {
            success: false,
            error: error.message || 'Authentication failed',
        };
    }
}

/**
 * Get current authenticated user by wallet address
 */
export async function getCurrentUser(walletAddress: string) {
    try {
        if (!walletAddress) {
            return {
                success: false,
                error: 'Wallet address required',
            };
        }

        const normalizedAddress = walletAddress;
        const supabase = await createClient();

        const { data: user, error } = await supabase
            .from('users')
            .select(`
        *,
        user_profiles (*)
      `)
            .eq('wallet_address', normalizedAddress)
            .single();

        if (error || !user) {
            return {
                success: false,
                error: 'User not found',
            };
        }

        return {
            success: true,
            user,
        };
    } catch (error: any) {
        console.error('Error in getCurrentUser:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch user',
        };
    }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
    walletAddress: string,
    profileData: {
        username?: string;
        email?: string;
        avatar_url?: string;
        bio?: string;
    }
) {
    try {
        if (!walletAddress) {
            return {
                success: false,
                error: 'Wallet address required',
            };
        }

        const normalizedAddress = walletAddress.toUpperCase();
        const supabase = await createClient();

        // Get user ID
        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('wallet_address', normalizedAddress)
            .single();

        if (!user) {
            return {
                success: false,
                error: 'User not found',
            };
        }

        // Update profile
        const { data, error } = await supabase
            .from('user_profiles')
            .update(profileData)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating profile:', error);
            return {
                success: false,
                error: 'Failed to update profile',
            };
        }

        return {
            success: true,
            profile: data,
        };
    } catch (error: any) {
        console.error('Error in updateUserProfile:', error);
        return {
            success: false,
            error: error.message || 'Failed to update profile',
        };
    }
}
