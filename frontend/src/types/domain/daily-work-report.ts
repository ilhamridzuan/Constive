export type DailyWorkReportStatus =
  | 'DRAFT_LOG'
  | 'SUBMITTED'
  | 'VERIFIED_PM'
  | 'REVISION_REQUESTED'
  | 'ARCHIVED';

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
  status: DailyWorkReportStatus;
  revisionNotes?: string;
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
  status?: DailyWorkReportStatus | 'ALL';
  weather?: WeatherCondition | 'ALL';
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
}
