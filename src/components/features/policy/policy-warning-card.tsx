import React from 'react';
import { AlertTriangle, Video, ShieldAlert } from 'lucide-react';

interface PolicyWarningCardProps {
  title: string;
  description: string;
}

export function PolicyWarningCard({ title, description }: PolicyWarningCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 sm:p-6 mb-8 text-neutral-900">
      <div className="flex items-start gap-3.5">
        <div className="rounded-xl bg-amber-500/20 p-2 text-amber-700 shrink-0 mt-0.5">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-900">
              {title}
            </h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-800 px-2 py-0.5 rounded-full">
              <Video className="h-3 w-3" />
              Bắt buộc
            </span>
          </div>
          <p className="text-xs sm:text-sm text-amber-950/80 leading-relaxed font-medium">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
