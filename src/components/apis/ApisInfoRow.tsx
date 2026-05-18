import { memo } from 'react';
import { cn } from '../../lib/utils.ts';

interface ApisInfoRowProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export const ApisInfoRow = memo(({ label, value, className }: ApisInfoRowProps) => {
  return (
    <div className={cn("flex items-center justify-between text-sm hover:bg-white/[0.02] p-2 -mx-2 rounded-lg transition-colors duration-200", className)}>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold flex items-center gap-1">{value}</span>
    </div>
  );
});

ApisInfoRow.displayName = 'ApisInfoRow';
