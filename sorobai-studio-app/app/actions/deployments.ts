'use server';

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import {
    Contract,
    //SorobanRpc,
    TransactionBuilder,
    Networks,
    BASE_FEE,
    Operation,
    Keypair,
    xdr
} from '@stellar/stellar-sdk';

/**
 * Get current user from wallet address stored in cookies
 */
async function getCurrentUser() {
    const cookieStore = await cookies();
    const walletAddress = cookieStore.get('authenticated_wallet')?.value;

    if (!walletAddress) {
        return null;
    }

    const supabase = await createClient();
    const { data: dbUser, error } = await supabase
        .from('users')
        .select('id, wallet_address')
        .eq('wallet_address', walletAddress)
        .single();

    if (error || !dbUser) {
        return null;
    }

    return dbUser;
}

/**
 * Verify user owns the project
 */
async function verifyProjectOwnership(projectId: string, userId: string) {
    const supabase = await createClient();
    const { data: project, error } = await supabase
        .from('projects')
        .select('user_id')
        .eq('id', projectId)
        .single();

    if (error || !project || project.user_id !== userId) {
        return false;
    }

    return true;
}

/**
 * SAVE - Save project code only
 */
export async function saveProjectCode(projectId: string, code: string) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                error: 'User not authenticated',
            };
        }

        // Verify ownership
        const isOwner = await verifyProjectOwnership(projectId, currentUser.id);
        if (!isOwner) {
            return {
                success: false,
                error: 'Access denied',
            };
        }

        const supabase = await createClient();

        // Calculate byte length
        const byteLength = new TextEncoder().encode(code).length;

        const { error } = await supabase
            .from('projects')
            .update({
                code,
                byte_length: byteLength,
                updated_at: new Date().toISOString()
            })
            .eq('id', projectId);

        if (error) {
            console.error('Error saving code:', error);
            return {
                success: false,
                error: 'Failed to save code',
            };
        }

        return {
            success: true,
            byteLength,
        };
    } catch (error) {
        console.error('Error in saveProjectCode:', error);
        return {
            success: false,
            error: 'An unexpected error occurred',
        };
    }
}

/**
 * ESTIMATE COST - Simulate deployment cost
 * Note: This is a simplified estimation. In production, you'd compile to WASM 
 * and use actual Soroban RPC simulation
 */
export async function estimateCost(projectId: string) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                error: 'User not authenticated',
            };
        }

        // Verify ownership
        const isOwner = await verifyProjectOwnership(projectId, currentUser.id);
        if (!isOwner) {
            return {
                success: false,
                error: 'Access denied',
            };
        }

        const supabase = await createClient();
        const { data: project, error } = await supabase
            .from('projects')
            .select('code, byte_length')
            .eq('id', projectId)
            .single();

        if (error || !project) {
            return {
                success: false,
                error: 'Project not found',
            };
        }

        // Simplified cost estimation
        // In production: compile Rust->WASM, use simulateTransaction
        const codeSize = project.byte_length || new TextEncoder().encode(project.code).length;

        // Estimated resources (simplified)
        const cpuInsns = Math.ceil(codeSize * 100); // Rough estimate
        const ledgerBuckets = Math.ceil(codeSize / 1024);
        const baseFee = 100; // Base fee in stroops
        const resourceFee = cpuInsns + (ledgerBuckets * 1000);
        const totalFee = baseFee + resourceFee;

        // Convert stroops to XLM (1 XLM = 10,000,000 stroops)
        const xlmCost = totalFee / 10_000_000;

        const breakdown = {
            cpu_insns: cpuInsns,
            ledger_buckets: ledgerBuckets,
            fee: baseFee,
            min_resource_fee: resourceFee,
            total_fee_stroops: totalFee,
            xlm_cost_estimate: xlmCost,
        };

        // Optionally save estimate
        await supabase
            .from('project_deployments')
            .insert({
                project_id: projectId,
                user_id: currentUser.id,
                network: 'testnet',
                status: 'pending',
                estimate_cost_result_json: breakdown,
            });

        return {
            success: true,
            data: breakdown,
        };
    } catch (error) {
        console.error('Error in estimateCost:', error);
        return {
            success: false,
            error: 'Failed to estimate cost',
        };
    }
}

/**
 * PREPARE DEPLOY - Generate unsigned transaction
 * This creates the deploy transaction that will be signed by the user's wallet
 */
export async function prepareDeployTransaction(projectId: string) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                error: 'User not authenticated',
            };
        }

        // Verify ownership
        const isOwner = await verifyProjectOwnership(projectId, currentUser.id);
        if (!isOwner) {
            return {
                success: false,
                error: 'Access denied',
            };
        }

        const supabase = await createClient();
        const { data: project, error } = await supabase
            .from('projects')
            .select('code, name')
            .eq('id', projectId)
            .single();

        if (error || !project) {
            return {
                success: false,
                error: 'Project not found',
            };
        }

        // In production: compile to WASM here
        // For now, we'll simulate with a placeholder WASM
        // const wasmBuffer = await compileToWasm(project.code);

        // Simplified: create a mock WASM hash
        const wasmHash = Buffer.from(project.code).toString('hex').slice(0, 64);

        // Get next version number
        const { data: deployments } = await supabase
            .from('project_deployments')
            .select('version')
            .eq('project_id', projectId)
            .order('version', { ascending: false })
            .limit(1);

        const nextVersion = deployments && deployments.length > 0
            ? (deployments[0].version || 0) + 1
            : 1;

        // Create deployment record
        const { data: deployment, error: deployError } = await supabase
            .from('project_deployments')
            .insert({
                project_id: projectId,
                user_id: currentUser.id,
                network: 'testnet',
                status: 'pending',
                version: nextVersion,
                wasm_hash: wasmHash,
            })
            .select()
            .single();

        if (deployError || !deployment) {
            return {
                success: false,
                error: 'Failed to create deployment record',
            };
        }

        // In production: Build actual Soroban transaction
        // This would use stellar-sdk to create an installContractCode + createContract transaction

        return {
            success: true,
            data: {
                deploymentId: deployment.id,
                wasmHash,
                version: nextVersion,
                // In production: return XDR of unsigned transaction
                transactionXDR: 'PLACEHOLDER_XDR_TO_SIGN',
                network: 'testnet',
            },
        };
    } catch (error) {
        console.error('Error in prepareDeployTransaction:', error);
        return {
            success: false,
            error: 'Failed to prepare deployment',
        };
    }
}

/**
 * SUBMIT DEPLOYMENT - Submit signed transaction and update deployment record
 */
export async function submitDeployment(
    deploymentId: string,
    signedTransactionXDR: string
) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return {
                success: false,
                error: 'User not authenticated',
            };
        }

        const supabase = await createClient();

        // Get deployment record
        const { data: deployment, error: fetchError } = await supabase
            .from('project_deployments')
            .select('*, projects!inner(user_id)')
            .eq('id', deploymentId)
            .single();

        if (fetchError || !deployment) {
            return {
                success: false,
                error: 'Deployment not found',
            };
        }

        // Verify ownership
        if (deployment.projects.user_id !== currentUser.id) {
            return {
                success: false,
                error: 'Access denied',
            };
        }

        // In production: Submit to Stellar testnet
        // const server = new SorobanRpc.Server('https://soroban-testnet.stellar.org');
        // const transaction = TransactionBuilder.fromXDR(signedTransactionXDR, Networks.TESTNET);
        // const response = await server.sendTransaction(transaction);

        // Mock successful deployment
        const mockContractId = `C${Buffer.from(deploymentId).toString('hex').slice(0, 56).toUpperCase()}`;
        const mockTxHash = Buffer.from(Math.random().toString()).toString('hex').slice(0, 64);
        const mockCost = 0.001; // 0.001 XLM

        // Update deployment record
        const { error: updateError } = await supabase
            .from('project_deployments')
            .update({
                status: 'success',
                contract_id: mockContractId,
                contract_address: mockContractId,
                transaction_hash: mockTxHash,
                deployment_cost: mockCost,
                deployed_at: new Date().toISOString(),
            })
            .eq('id', deploymentId);

        if (updateError) {
            console.error('Error updating deployment:', updateError);
            return {
                success: false,
                error: 'Failed to update deployment status',
            };
        }

        return {
            success: true,
            data: {
                contractId: mockContractId,
                transactionHash: mockTxHash,
                deploymentCost: mockCost,
                network: 'testnet',
            },
        };
    } catch (error) {
        console.error('Error in submitDeployment:', error);

        // Update deployment as failed
        const supabase = await createClient();
        await supabase
            .from('project_deployments')
            .update({
                status: 'failed',
                error_message: error instanceof Error ? error.message : 'Unknown error',
            })
            .eq('id', deploymentId);

        return {
            success: false,
            error: 'Deployment failed',
        };
    }
}

/**
 * GET PROJECT DEPLOYMENTS - Get deployment history for a project
 */
export async function getProjectDeployments(projectId: string) {
    try {
        const supabase = await createClient();

        const { data: deployments, error } = await supabase
            .from('project_deployments')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching deployments:', error);
            return {
                success: false,
                error: 'Failed to fetch deployments',
            };
        }

        return {
            success: true,
            data: deployments || [],
        };
    } catch (error) {
        console.error('Error in getProjectDeployments:', error);
        return {
            success: false,
            error: 'An unexpected error occurred',
        };
    }
}
