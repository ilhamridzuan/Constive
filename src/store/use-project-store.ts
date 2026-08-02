import { projectService } from '@/services/project.service';
import { CreateProjectInput, Project, ProjectStatus, UpdateProjectInput } from '@/types/domain/project';
import { create } from 'zustand';

interface ProjectState {
  projects: Project[];
  activeProject: Project | null;
  searchQuery: string;
  statusFilter: ProjectStatus | 'ALL';
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProjects: (workspaceId: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: ProjectStatus | 'ALL') => void;

  createProject: (workspaceId: string, input: CreateProjectInput) => Promise<Project>;
  updateProject: (workspaceId: string, projectId: string, input: UpdateProjectInput) => Promise<Project>;
  deleteProject: (workspaceId: string, projectId: string) => Promise<void>;
  setActiveProject: (project: Project | null) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  activeProject: null,
  searchQuery: '',
  statusFilter: 'ALL',
  isLoading: false,
  error: null,

  fetchProjects: async (workspaceId: string) => {
    set({ isLoading: true, error: null });
    try {
      const list = await projectService.getProjects(workspaceId, {
        search: get().searchQuery,
        status: get().statusFilter,
      });

      const uniqueList = Array.from(new Map(list.map((p) => [p.id, p])).values());
      set({ projects: uniqueList, isLoading: false });
    } catch {
      set({ isLoading: false, error: 'Gagal memuat daftar proyek' });
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setStatusFilter: (status: ProjectStatus | 'ALL') => {
    set({ statusFilter: status });
  },

  createProject: async (workspaceId: string, input: CreateProjectInput) => {
    const newProj = await projectService.createProject(workspaceId, input);
    const rawList = [newProj, ...get().projects];
    const list = Array.from(new Map(rawList.map((p) => [p.id, p])).values());
    set({ projects: list });
    return newProj;
  },

  updateProject: async (workspaceId: string, projectId: string, input: UpdateProjectInput) => {
    const updated = await projectService.updateProject(workspaceId, projectId, input);
    const list = get().projects.map((p) => (p.id === projectId ? updated : p));
    set({ projects: list, activeProject: updated });
    return updated;
  },

  deleteProject: async (workspaceId: string, projectId: string) => {
    await projectService.deleteProject(workspaceId, projectId);
    const list = get().projects.filter((p) => p.id !== projectId);
    set({ projects: list, activeProject: get().activeProject?.id === projectId ? null : get().activeProject });
  },

  setActiveProject: (project: Project | null) => {
    set({ activeProject: project });
  },
}));
