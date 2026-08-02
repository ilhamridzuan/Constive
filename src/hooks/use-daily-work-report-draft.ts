'use client';

import { WeatherCondition } from '@/types/domain/daily-work-report';
import { useCallback, useEffect, useState } from 'react';

export interface DailyWorkReportDraftData {
  logDate: string;
  weather: WeatherCondition;
  laborCount: number;
  notes: string;
  photoUrls: string[];
}

export function useDailyWorkReportDraft(projectId: string, initialDate: string) {
  const [draftKey, setDraftKey] = useState<string>(
    `draft:daily-work-report:${projectId}:${initialDate}`
  );
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    setDraftKey(`draft:daily-work-report:${projectId}:${initialDate}`);
  }, [projectId, initialDate]);

  // Load existing draft from localStorage
  const loadDraft = useCallback((): DailyWorkReportDraftData | null => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const parsed = JSON.parse(saved) as DailyWorkReportDraftData;
        setHasDraft(true);
        setIsDraftLoaded(true);
        return parsed;
      }
    } catch (e) {
      console.error('Gagal memuat draf dari localStorage:', e);
    }
    setIsDraftLoaded(true);
    return null;
  }, [draftKey]);

  // Save current form state as draft
  const saveDraft = useCallback(
    (data: Partial<DailyWorkReportDraftData>) => {
      if (typeof window === 'undefined') return;
      try {
        const currentDraft = localStorage.getItem(draftKey);
        const existing = currentDraft ? JSON.parse(currentDraft) : {};
        const updated = { ...existing, ...data };
        localStorage.setItem(draftKey, JSON.stringify(updated));
        setHasDraft(true);
        setLastSaved(new Date());
      } catch (e) {
        console.error('Gagal menyimpan draf ke localStorage:', e);
      }
    },
    [draftKey]
  );

  // Clear draft upon successful submission
  const clearDraft = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(draftKey);
      setHasDraft(false);
      setLastSaved(null);
    } catch (e) {
      console.error('Gagal menghapus draf:', e);
    }
  }, [draftKey]);

  return {
    loadDraft,
    saveDraft,
    clearDraft,
    hasDraft,
    isDraftLoaded,
    lastSaved,
  };
}
