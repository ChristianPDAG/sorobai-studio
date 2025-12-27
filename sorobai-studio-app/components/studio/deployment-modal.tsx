'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Rocket, CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface DeploymentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDeploy: () => Promise<void>;
    deploymentResult?: {
        contractId: string;
        transactionHash: string;
        deploymentCost: number;
        network: string;
    } | null;
}

export function DeploymentModal({
    open,
    onOpenChange,
    onDeploy,
    deploymentResult,
}: DeploymentModalProps) {
    const [deploying, setDeploying] = useState(false);
    const [step, setStep] = useState<'confirm' | 'signing' | 'submitting' | 'success'>('confirm');

    const handleDeploy = async () => {
        setDeploying(true);
        setStep('signing');

        try {
            await onDeploy();
            setStep('success');
        } catch (error) {
            console.error('Deployment error:', error);
            toast.error(error instanceof Error ? error.message : 'Deployment failed');
            setStep('confirm');
        } finally {
            setDeploying(false);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard`);
    };

    const renderContent = () => {
        switch (step) {
            case 'confirm':
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>Deploy to Stellar Testnet</DialogTitle>
                            <DialogDescription>
                                You're about to deploy this smart contract to the Stellar testnet.
                                Please confirm to proceed with wallet signature.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-6 space-y-4">
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    <strong>⚠️ Important:</strong> You'll need to sign the transaction with your Freighter wallet.
                                    Make sure you have enough XLM in your testnet account.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Deployment Steps:</h4>
                                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                                    <li>Prepare deployment transaction</li>
                                    <li>Sign with Freighter wallet</li>
                                    <li>Submit to Stellar testnet</li>
                                    <li>Wait for confirmation</li>
                                </ol>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={deploying}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDeploy}
                                disabled={deploying}
                                className="bg-yellow-400 text-black hover:bg-yellow-500"
                            >
                                <Rocket className="mr-2 h-4 w-4" />
                                Deploy Contract
                            </Button>
                        </DialogFooter>
                    </>
                );

            case 'signing':
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>Waiting for Signature</DialogTitle>
                            <DialogDescription>
                                Please sign the transaction in your Freighter wallet
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin text-yellow-500" />
                            <p className="text-sm text-muted-foreground">
                                Check your Freighter wallet extension...
                            </p>
                        </div>
                    </>
                );

            case 'submitting':
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>Submitting Transaction</DialogTitle>
                            <DialogDescription>
                                Your signed transaction is being submitted to the network
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="h-12 w-12 animate-spin text-yellow-500" />
                            <p className="text-sm text-muted-foreground">
                                Please wait while we submit to Stellar testnet...
                            </p>
                        </div>
                    </>
                );

            case 'success':
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                Deployment Successful!
                            </DialogTitle>
                            <DialogDescription>
                                Your contract has been deployed to Stellar testnet
                            </DialogDescription>
                        </DialogHeader>

                        {deploymentResult && (
                            <div className="py-4 space-y-4">
                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs text-green-600 dark:text-green-400 mb-1">
                                                Contract ID
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <code className="text-sm font-mono bg-white dark:bg-gray-900 px-2 py-1 rounded flex-1 break-all">
                                                    {deploymentResult.contractId}
                                                </code>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => copyToClipboard(deploymentResult.contractId, 'Contract ID')}
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-xs text-green-600 dark:text-green-400 mb-1">
                                                Transaction Hash
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <code className="text-sm font-mono bg-white dark:bg-gray-900 px-2 py-1 rounded flex-1 break-all">
                                                    {deploymentResult.transactionHash}
                                                </code>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => copyToClipboard(deploymentResult.transactionHash, 'Transaction hash')}
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-green-200 dark:border-green-800">
                                            <span className="text-sm text-green-600 dark:text-green-400">
                                                Deployment Cost
                                            </span>
                                            <span className="font-semibold text-green-700 dark:text-green-300">
                                                {deploymentResult.deploymentCost} XLM
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-full gap-2"
                                    onClick={() => window.open(`https://stellar.expert/explorer/testnet/tx/${deploymentResult.transactionHash}`, '_blank')}
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    View on Stellar Expert
                                </Button>
                            </div>
                        )}

                        <DialogFooter>
                            <Button onClick={() => onOpenChange(false)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </>
                );
        }
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !deploying && onOpenChange(open)}>
            <DialogContent className="sm:max-w-[500px]">
                {renderContent()}
            </DialogContent>
        </Dialog>
    );
}
