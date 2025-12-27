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
import { Loader2, TrendingUp, Cpu, Database, Coins } from 'lucide-react';

interface CostEstimateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    estimate: {
        cpu_insns: number;
        ledger_buckets: number;
        fee: number;
        min_resource_fee: number;
        total_fee_stroops: number;
        xlm_cost_estimate: number;
    } | null;
    loading?: boolean;
    onDeploy?: () => void;
}

export function CostEstimateModal({
    open,
    onOpenChange,
    estimate,
    loading = false,
    onDeploy,
}: CostEstimateModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Deployment Cost Estimate</DialogTitle>
                    <DialogDescription>
                        Estimated resources and costs for deploying your contract to Stellar Testnet
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : estimate ? (
                    <div className="space-y-4 py-4">
                        {/* Main Cost */}
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <div className="flex items-center gap-2 mb-2">
                                <Coins className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                                    Estimated Cost
                                </p>
                            </div>
                            <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">
                                {estimate.xlm_cost_estimate.toFixed(7)} XLM
                            </p>
                            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                ≈ {estimate.total_fee_stroops.toLocaleString()} stroops
                            </p>
                        </div>

                        {/* Breakdown */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold">Resource Breakdown</h4>

                            <div className="grid gap-3">
                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Cpu className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">CPU Instructions</span>
                                    </div>
                                    <span className="text-sm font-mono font-medium">
                                        {estimate.cpu_insns.toLocaleString()}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Database className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">Ledger Buckets</span>
                                    </div>
                                    <span className="text-sm font-mono font-medium">
                                        {estimate.ledger_buckets.toLocaleString()}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">Base Fee</span>
                                    </div>
                                    <span className="text-sm font-mono font-medium">
                                        {estimate.fee.toLocaleString()} stroops
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Coins className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">Resource Fee</span>
                                    </div>
                                    <span className="text-sm font-mono font-medium">
                                        {estimate.min_resource_fee.toLocaleString()} stroops
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Note */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-xs text-blue-800 dark:text-blue-200">
                                <strong>Note:</strong> This is an estimated cost. Actual deployment cost may vary
                                based on network conditions and contract complexity.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="py-8 text-center text-muted-foreground">
                        No estimate available
                    </div>
                )}

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Close
                    </Button>
                    {estimate && onDeploy && (
                        <Button
                            onClick={onDeploy}
                            disabled={loading}
                            className="bg-yellow-400 text-black hover:bg-yellow-500"
                        >
                            Deploy Contract
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
