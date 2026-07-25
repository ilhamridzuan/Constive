'use client';

import { WeatherCondition } from '@/types/domain/daily-log';
import { Cloud, CloudDrizzle, CloudRain, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeatherSelectorProps {
  value: WeatherCondition;
  onChange: (weather: WeatherCondition) => void;
  disabled?: boolean;
}

const WEATHER_OPTIONS: {
  id: WeatherCondition;
  label: string;
  icon: React.ReactNode;
  activeColor: string;
}[] = [
  {
    id: 'CERAH',
    label: 'Cerah',
    icon: <Sun className="h-6 w-6 text-amber-500" />,
    activeColor: 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-100',
  },
  {
    id: 'BERAWAN',
    label: 'Berawan',
    icon: <Cloud className="h-6 w-6 text-slate-500" />,
    activeColor: 'border-slate-500 bg-slate-500/10 text-slate-900 dark:text-slate-100',
  },
  {
    id: 'GERIMIS',
    label: 'Gerimis',
    icon: <CloudDrizzle className="h-6 w-6 text-blue-400" />,
    activeColor: 'border-blue-400 bg-blue-400/10 text-blue-900 dark:text-blue-100',
  },
  {
    id: 'HUJAN',
    label: 'Hujan',
    icon: <CloudRain className="h-6 w-6 text-indigo-600" />,
    activeColor: 'border-indigo-600 bg-indigo-600/10 text-indigo-900 dark:text-indigo-100',
  },
];

export function WeatherSelector({ value, onChange, disabled }: WeatherSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {WEATHER_OPTIONS.map((opt) => {
        const isSelected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.id)}
            className={cn(
              'flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all duration-200 min-h-[72px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
              isSelected
                ? cn('border-2 shadow-xs', opt.activeColor)
                : 'border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="mb-1.5">{opt.icon}</div>
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
