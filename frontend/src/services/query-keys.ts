export const queryKeys = {
  auth: {
    user: ['auth', 'user'] as const,
    session: ['auth', 'session'] as const,
  },
  workspaces: {
    all: ['workspaces'] as const,
    detail: (id: string) => ['workspaces', id] as const,
    members: (id: string) => ['workspaces', id, 'members'] as const,
    invites: (id: string) => ['workspaces', id, 'invites'] as const,
  },
  projects: {
    list: (workspaceId: string) => ['workspace', workspaceId, 'projects'] as const,
    detail: (workspaceId: string, projectId: string) =>
      ['workspace', workspaceId, 'project', projectId] as const,
  },
  gantt: {
    tasks: (workspaceId: string, projectId: string) =>
      ['workspace', workspaceId, 'project', projectId, 'gantt', 'tasks'] as const,
  },
  dailyLogs: {
    list: (workspaceId: string, projectId: string) =>
      ['workspace', workspaceId, 'project', projectId, 'dailyLogs'] as const,
    detail: (workspaceId: string, projectId: string, logId: string) =>
      ['workspace', workspaceId, 'project', projectId, 'dailyLogs', logId] as const,
  },
};
