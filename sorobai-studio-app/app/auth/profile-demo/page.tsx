'use client';

import { RequireWalletAuth } from '@/components/auth/require-wallet-auth';
import { useWalletAuth } from '@/lib/hooks/use-wallet-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { updateUserProfile } from '@/app/actions/wallet-auth';

export default function ProfilePage() {
    return (
        <RequireWalletAuth fallbackUrl="/auth/wallet-test">
            <ProfileContent />
        </RequireWalletAuth>
    );
}

function ProfileContent() {
    const { user, logout, refreshUser } = useWalletAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.user_profiles?.username || '',
        email: user?.user_profiles?.email || '',
        bio: user?.user_profiles?.bio || '',
    });

    const handleSave = async () => {
        if (!user) return;

        setIsSaving(true);
        try {
            const result = await updateUserProfile(user.wallet_address, formData);

            if (result.success) {
                await refreshUser();
                setIsEditing(false);
            } else {
                alert('Failed to update profile: ' + result.error);
            }
        } catch (error: any) {
            alert('Error: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-4xl font-bold">Profile</h1>
                    <Button onClick={logout} variant="outline">
                        Disconnect Wallet
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Wallet Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm text-muted-foreground">Wallet Address</label>
                            <p className="font-mono text-sm break-all bg-muted p-2 rounded mt-1">
                                {user?.wallet_address}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">User ID</label>
                            <p className="font-mono text-sm break-all bg-muted p-2 rounded mt-1">
                                {user?.id}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground">Member Since</label>
                            <p className="text-sm mt-1">
                                {new Date(user?.created_at || '').toLocaleDateString()}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Profile Details</CardTitle>
                        <Button
                            onClick={() => setIsEditing(!isEditing)}
                            variant="outline"
                            size="sm"
                        >
                            {isEditing ? 'Cancel' : 'Edit'}
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isEditing ? (
                            <>
                                <div>
                                    <label className="text-sm font-medium">Username</label>
                                    <input
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full p-2 border rounded mt-1"
                                        placeholder="Enter username"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full p-2 border rounded mt-1"
                                        placeholder="Enter email"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Bio</label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full p-2 border rounded mt-1"
                                        rows={4}
                                        placeholder="Tell us about yourself"
                                    />
                                </div>
                                <Button onClick={handleSave} disabled={isSaving} className="w-full">
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="text-sm text-muted-foreground">Username</label>
                                    <p className="text-sm mt-1">
                                        {user?.user_profiles?.username || 'Not set'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground">Email</label>
                                    <p className="text-sm mt-1">
                                        {user?.user_profiles?.email || 'Not set'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground">Bio</label>
                                    <p className="text-sm mt-1">
                                        {user?.user_profiles?.bio || 'Not set'}
                                    </p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Authentication Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <div className="h-2 w-2 bg-green-500 rounded-full" />
                            <span>Authenticated via Stellar wallet</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Your identity is secured by Stellar cryptography. No passwords needed!
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
