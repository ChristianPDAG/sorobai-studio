'use server';

import { createClient } from '@/lib/supabase/server';
import { CreateProjectInput, UpdateProjectInput, Project, ProjectWithStats } from '@/types';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

/**
 * Get current user from wallet address stored in cookies
 * Since we're using wallet authentication, there's no auth.users session
 */
async function getCurrentUser() {
    const cookieStore = await cookies();
    const walletAddress = cookieStore.get('authenticated_wallet')?.value;

    if (!walletAddress) {
        return null;
    }

    const supabase = await createClient();

    // Get user from public.users table by wallet_address
    const { data: dbUser, error } = await supabase
        .from('users')
        .select('id, wallet_address')
        .eq('wallet_address', walletAddress)
        .single();

    if (error || !dbUser) {
        console.error('Failed to get user:', error);
        return null;
    }

    return dbUser;
}

/**
 * Create a new project
 */
export async function createProject(input: CreateProjectInput) {
    try {
        const supabase = await createClient();
        const currentUser = await getCurrentUser();
        console.log('Current user:', currentUser);
        if (!currentUser) {
            return {
                success: false,
                error: 'User not authenticated',
            };
        }

        // Insert project
        const { data: project, error } = await supabase
            .from('projects')
            .insert({
                user_id: currentUser.id,
                name: input.name,
                description: input.description,
                code: input.code || '',
                language: input.language,
                is_public: input.is_public ?? false,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating project:', error);
            return {
                success: false,
                error: 'Failed to create project',
            };
        }

        revalidatePath('/studio');
        revalidatePath('/hub');

        return {
            success: true,
            data: project,
        };
    } catch (error) {
        console.error('Error in createProject:', error);
        return {
            success: false,
            error: 'An unexpected error occurred',
        };
    }
}

/**
 * Get all projects for the current user
 */
export async function getUserProjects() {
    try {
        const supabase = await createClient();
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return {
                success: false,
                error: 'User not authenticated',
            };
        }

        const { data: projects, error } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error fetching projects:', error);
            return {
                success: false,
                error: 'Failed to fetch projects',
            };
        }

        return {
            success: true,
            data: projects as Project[],
        };
    } catch (error) {
        console.error('Error in getUserProjects:', error);
        return {
            success: false,
            error: 'An unexpected error occurred',
        };
    }
}

/**
 * Get a single project by ID
 */
export async function getProject(projectId: string) {
    try {
        const supabase = await createClient();
        const currentUser = await getCurrentUser();

        const { data: project, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();

        if (error) {
            console.error('Error fetching project:', error);
            return {
                success: false,
                error: 'Project not found',
            };
        }

        // Check if user has access (owner or public project)
        if (!project.is_public && (!currentUser || project.user_id !== currentUser.id)) {
            return {
                success: false,
                error: 'Access denied',
            };
        }

        return {
            success: true,
            data: project as Project,
        };
    } catch (error) {
        console.error('Error in getProject:', error);
        return {
            success: false,
            error: 'An unexpected error occurred',
        };
    }
}

/**
 * Update a project
 */
export async function updateProject(projectId: string, input: UpdateProjectInput) {
    try {
        const supabase = await createClient();
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return {
                success: false,
                error: 'User not authenticated',
            };
        }

        // Check ownership
        const { data: existingProject } = await supabase
            .from('projects')
            .select('user_id')
            .eq('id', projectId)
            .single();

        if (!existingProject || existingProject.user_id !== currentUser.id) {
            return {
                success: false,
                error: 'Access denied',
            };
        }

        const { data: project, error } = await supabase
            .from('projects')
            .update(input)
            .eq('id', projectId)
            .select()
            .single();

        if (error) {
            console.error('Error updating project:', error);
            return {
                success: false,
                error: 'Failed to update project',
            };
        }

        revalidatePath('/studio');
        revalidatePath(`/studio/${projectId}`);
        if (project.is_public) {
            revalidatePath('/hub');
        }

        return {
            success: true,
            data: project,
        };
    } catch (error) {
        console.error('Error in updateProject:', error);
        return {
            success: false,
            error: 'An unexpected error occurred',
        };
    }
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string) {
    try {
        const supabase = await createClient();
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return {
                success: false,
                error: 'User not authenticated',
            };
        }

        // Check ownership
        const { data: existingProject } = await supabase
            .from('projects')
            .select('user_id, is_public')
            .eq('id', projectId)
            .single();

        if (!existingProject || existingProject.user_id !== currentUser.id) {
            return {
                success: false,
                error: 'Access denied',
            };
        }

        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', projectId);

        if (error) {
            console.error('Error deleting project:', error);
            return {
                success: false,
                error: 'Failed to delete project',
            };
        }

        revalidatePath('/studio');
        if (existingProject.is_public) {
            revalidatePath('/hub');
        }

        return {
            success: true,
        };
    } catch (error) {
        console.error('Error in deleteProject:', error);
        return {
            success: false,
            error: 'An unexpected error occurred',
        };
    }
}

/**
 * Get all public projects for the Hub (with stats)
 */
export async function getHubProjects(filters?: { tag?: string; search?: string }) {
    try {
        const supabase = await createClient();

        let query = supabase
            .from('hub_projects_with_stats')
            .select('*')
            .order('updated_at', { ascending: false });

        // Apply search filter
        if (filters?.search) {
            query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }

        // Apply tag filter
        if (filters?.tag && filters.tag !== 'All') {
            query = query.contains('tags', [filters.tag]);
        }

        const { data: projects, error } = await query;

        if (error) {
            console.error('Error fetching hub projects:', error);
            return {
                success: false,
                error: 'Failed to fetch projects',
            };
        }

        return {
            success: true,
            data: projects as ProjectWithStats[],
        };
    } catch (error) {
        console.error('Error in getHubProjects:', error);
        return {
            success: false,
            error: 'An unexpected error occurred',
        };
    }
}

/**
 * Toggle like on a project
 */
export async function toggleProjectLike(projectId: string) {
    try {
        const supabase = await createClient();
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return {
                success: false,
                error: 'User not authenticated',
            };
        }

        // Check if already liked
        const { data: existingLike } = await supabase
            .from('project_likes')
            .select('id')
            .eq('project_id', projectId)
            .eq('user_id', currentUser.id)
            .single();

        if (existingLike) {
            // Unlike
            const { error } = await supabase
                .from('project_likes')
                .delete()
                .eq('id', existingLike.id);

            if (error) {
                console.error('Error unliking project:', error);
                return {
                    success: false,
                    error: 'Failed to unlike project',
                };
            }

            revalidatePath('/hub');
            return {
                success: true,
                liked: false,
            };
        } else {
            // Like
            const { error } = await supabase
                .from('project_likes')
                .insert({
                    project_id: projectId,
                    user_id: currentUser.id,
                });

            if (error) {
                console.error('Error liking project:', error);
                return {
                    success: false,
                    error: 'Failed to like project',
                };
            }

            revalidatePath('/hub');
            return {
                success: true,
                liked: true,
            };
        }
    } catch (error) {
        console.error('Error in toggleProjectLike:', error);
        return {
            success: false,
            error: 'An unexpected error occurred',
        };
    }
}

/**
 * Fork a project
 */
export async function forkProject(projectId: string) {
    try {
        const supabase = await createClient();
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return {
                success: false,
                error: 'User not authenticated',
            };
        }

        // Get the original project
        const { data: originalProject, error: fetchError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .eq('is_public', true)
            .single();

        if (fetchError || !originalProject) {
            return {
                success: false,
                error: 'Project not found or not public',
            };
        }

        // Create the forked project
        const { data: forkedProject, error: createError } = await supabase
            .from('projects')
            .insert({
                user_id: currentUser.id,
                name: `${originalProject.name} (Fork)`,
                description: originalProject.description,
                code: originalProject.code,
                language: originalProject.language,
                is_public: false,
            })
            .select()
            .single();

        if (createError || !forkedProject) {
            console.error('Error creating fork:', createError);
            return {
                success: false,
                error: 'Failed to fork project',
            };
        }

        // Record the fork relationship
        const { error: forkError } = await supabase
            .from('project_forks')
            .insert({
                original_project_id: projectId,
                forked_project_id: forkedProject.id,
                user_id: currentUser.id,
            });

        if (forkError) {
            console.error('Error recording fork:', forkError);
        }

        revalidatePath('/studio');
        revalidatePath('/hub');

        return {
            success: true,
            data: forkedProject,
        };
    } catch (error) {
        console.error('Error in forkProject:', error);
        return {
            success: false,
            error: 'An unexpected error occurred',
        };
    }
}

/**
 * Add or update project tags
 */
export async function updateProjectTags(projectId: string, tags: string[]) {
    try {
        const supabase = await createClient();
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return {
                success: false,
                error: 'User not authenticated',
            };
        }

        // Check ownership
        const { data: project } = await supabase
            .from('projects')
            .select('user_id')
            .eq('id', projectId)
            .single();

        if (!project || project.user_id !== currentUser.id) {
            return {
                success: false,
                error: 'Access denied',
            };
        }

        // Delete existing tags
        await supabase
            .from('project_tags')
            .delete()
            .eq('project_id', projectId);

        // Insert new tags
        if (tags.length > 0) {
            const { error } = await supabase
                .from('project_tags')
                .insert(
                    tags.map(tag => ({
                        project_id: projectId,
                        tag,
                    }))
                );

            if (error) {
                console.error('Error updating tags:', error);
                return {
                    success: false,
                    error: 'Failed to update tags',
                };
            }
        }

        revalidatePath('/hub');
        revalidatePath(`/studio/${projectId}`);

        return {
            success: true,
        };
    } catch (error) {
        console.error('Error in updateProjectTags:', error);
        return {
            success: false,
            error: 'An unexpected error occurred',
        };
    }
}

/**
 * Record a project view
 */
export async function recordProjectView(projectId: string) {
    try {
        const supabase = await createClient();
        const currentUser = await getCurrentUser();

        const { error } = await supabase
            .from('project_views')
            .insert({
                project_id: projectId,
                user_id: currentUser?.id || null,
            });

        if (error) {
            console.error('Error recording view:', error);
        }

        // Don't return error to user, just log it
        return { success: true };
    } catch (error) {
        console.error('Error in recordProjectView:', error);
        return { success: true }; // Silent fail
    }
}
