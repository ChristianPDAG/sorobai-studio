'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Rocket, Sparkles } from 'lucide-react';

interface ComingSoonModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ComingSoonModal({ open, onOpenChange }: ComingSoonModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                            <Rocket className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <DialogTitle className="text-center text-2xl">
                        Deploy Feature Coming Soon!
                    </DialogTitle>
                    <DialogDescription className="text-center space-y-4 pt-4">
                        <p className="text-base">
                            We're working hard to bring you seamless smart contract deployment to Stellar testnet.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Sparkles className="h-4 w-4 text-yellow-500" />
                            <span>Features in development:</span>
                        </div>
                        <ul className="text-sm text-left space-y-2 max-w-xs mx-auto">
                            <li className="flex items-start gap-2">
                                <span className="text-yellow-500">•</span>
                                <span>Automatic Rust to WASM compilation</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-yellow-500">•</span>
                                <span>One-click deployment to testnet</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-yellow-500">•</span>
                                <span>Contract verification & monitoring</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-yellow-500">•</span>
                                <span>Deployment history tracking</span>
                            </li>
                        </ul>
                        <p className="text-xs text-muted-foreground pt-2">
                            Stay tuned for updates!
                        </p>
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center pt-2">
                    <Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                        Got it
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}