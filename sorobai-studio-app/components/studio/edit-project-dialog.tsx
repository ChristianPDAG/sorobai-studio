'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { updateProject, updateProjectTags, getProject } from '@/app/actions/projects';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

const AVAILABLE_TAGS = ['DeFi', 'NFT', 'DAO', 'Token', 'Escrow', 'Oracle', 'Payments', 'Gaming', 'Social', 'Counter'];

interface EditProjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string;
    onSuccess?: () => void;
}

export function EditProjectDialog({ open, onOpenChange, projectId, onSuccess }: EditProjectDialogProps) {
    const [loading, setLoading] = useState(false);
    const [loadingProject, setLoadingProject] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        language: 'rust' as 'rust' | 'typescript' | 'javascript',
        is_public: false,
    });
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [customTag, setCustomTag] = useState('');

    useEffect(() => {
        if (open && projectId) {
            loadProject();
        }
    }, [open, projectId]);

    const loadProject = async () => {
        setLoadingProject(true);
        const result = await getProject(projectId);

        if (result.success && result.data) {
            const project = result.data;
            setFormData({
                name: project.name,
                description: project.description || '',
                language: project.language,
                is_public: project.is_public,
            });

            // Load tags if project has them
            // Note: We'd need to fetch tags separately or include them in getProject
            // For now, starting with empty tags
            setSelectedTags([]);
        } else {
            toast.error(result.error || 'Failed to load project');
            onOpenChange(false);
        }
        setLoadingProject(false);
    };

    const handleAddTag = (tag: string) => {
        if (!selectedTags.includes(tag) && selectedTags.length < 5) {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleRemoveTag = (tag: string) => {
        setSelectedTags(selectedTags.filter(t => t !== tag));
    };

    const handleAddCustomTag = () => {
        const tag = customTag.trim();
        if (tag && !selectedTags.includes(tag) && selectedTags.length < 5) {
            setSelectedTags([...selectedTags, tag]);
            setCustomTag('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Please enter a project name');
            return;
        }

        setLoading(true);

        try {
            // Update project details
            const result = await updateProject(projectId, {
                name: formData.name.trim(),
                description: formData.description.trim(),
                language: formData.language,
                is_public: formData.is_public,
            });

            if (result.success) {
                // Update tags
                await updateProjectTags(projectId, selectedTags);

                toast.success('Project updated successfully!');
                onOpenChange(false);
                onSuccess?.();
            } else {
                toast.error(result.error || 'Failed to update project');
            }
        } catch (error) {
            console.error('Error updating project:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Project</DialogTitle>
                    <DialogDescription>
                        Update your project details and settings.
                    </DialogDescription>
                </DialogHeader>

                {loadingProject ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            {/* Project Name */}
                            <div className="grid gap-2">
                                <Label htmlFor="edit-name">
                                    Project Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="edit-name"
                                    placeholder="My Awesome Contract"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    disabled={loading}
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="grid gap-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    placeholder="Describe what your contract does..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    disabled={loading}
                                    rows={3}
                                />
                            </div>

                            {/* Language */}
                            <div className="grid gap-2">
                                <Label htmlFor="edit-language">Language</Label>
                                <Select
                                    value={formData.language}
                                    onValueChange={(value: any) => setFormData({ ...formData, language: value })}
                                    disabled={loading}
                                >
                                    <SelectTrigger id="edit-language">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="rust">Rust</SelectItem>
                                        <SelectItem value="typescript">TypeScript</SelectItem>
                                        <SelectItem value="javascript">JavaScript</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Tags */}
                            <div className="grid gap-2">
                                <Label>Tags (max 5)</Label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {AVAILABLE_TAGS.map((tag) => (
                                        <Badge
                                            key={tag}
                                            variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                                            className="cursor-pointer"
                                            onClick={() => selectedTags.includes(tag) ? handleRemoveTag(tag) : handleAddTag(tag)}
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>

                                {/* Selected Tags Display */}
                                {selectedTags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/30">
                                        {selectedTags.map((tag) => (
                                            <Badge key={tag} variant="secondary" className="gap-1">
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTag(tag)}
                                                    className="hover:text-destructive"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {/* Custom Tag Input */}
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add custom tag..."
                                        value={customTag}
                                        onChange={(e) => setCustomTag(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddCustomTag();
                                            }
                                        }}
                                        disabled={loading || selectedTags.length >= 5}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleAddCustomTag}
                                        disabled={loading || selectedTags.length >= 5 || !customTag.trim()}
                                    >
                                        Add
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Selected {selectedTags.length}/5 tags
                                </p>
                            </div>

                            {/* Public Toggle */}
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="edit-is_public">Public Project</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Make this project visible in the Community Hub
                                    </p>
                                </div>
                                <Switch
                                    id="edit-is_public"
                                    checked={formData.is_public}
                                    onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
