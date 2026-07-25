export type DailyLogStatus =
  | 'DRAFT_LOG'
  | 'SUBMITTED'
  | 'VERIFIED_PM'
  | 'REVISION_REQUESTED'
  | 'ARCHIVED';

export type WeatherCondition = 'CERAH' | 'BERAWAN' | 'GERIMIS' | 'HUJAN';

export interface DailyLogMedia {
  id: string;
  dailyLogId: string;
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  createdAt: string;
}

export interface DailyLog {
  id: string;
  projectId: string;
  supervisorId: string;
  supervisorName: string;
  supervisorAvatar?: string;
  logDate: string; // YYYY-MM-DD
  weather: WeatherCondition;
  laborCount: number;
  notes: string;
  status: DailyLogStatus;
  revisionNotes?: string;
  media: DailyLogMedia[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateDailyLogInput {
  logDate: string;
  weather: WeatherCondition;
  laborCount: number;
  notes: string;
  mediaUrls: string[];
}

export interface DailyLogFilter {
  status?: DailyLogStatus | 'ALL';
  weather?: WeatherCondition | 'ALL';
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
}
