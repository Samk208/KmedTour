"use client";

import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';;

interface AgentTestComponentProps {
  className?: string;
}

export function AgentTestComponent({ className }: AgentTestComponentProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <h2 className="text-xl font-bold">{t('demo.title', 'AgentTestComponent')}</h2>
      <p className="text-muted-foreground">{t('demo.description', 'Component scaffolding successful')}</p>
    </div>
  );
}
