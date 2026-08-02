export type WeatherCondition = 'CERAH' | 'BERAWAN' | 'GERIMIS' | 'HUJAN';

export interface DailyWorkReportMedia {
  id: string;
  dailyWorkReportId: string;
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  createdAt: string;
}

export interface DailyWorkReport {
  id: string;
  projectId: string;
  supervisorId: string;
  supervisorName: string;
  supervisorAvatar?: string;
  logDate: string; // YYYY-MM-DD
  weather: WeatherCondition;
  laborCount: number;
  notes: string;
  media: DailyWorkReportMedia[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateDailyWorkReportInput {
  logDate: string;
  weather: WeatherCondition;
  laborCount: number;
  notes: string;
  mediaUrls: string[];
}

export interface DailyWorkReportFilter {
  weather?: WeatherCondition | 'ALL';
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
}

export interface DailyWorkReportComment {
  id: string;
  dailyWorkReportId: string;
  workspaceId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  parentCommentId?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCommentInput {
  content: string;
  parentCommentId?: string;
}

export interface UpdateCommentInput {
  content: string;
}

