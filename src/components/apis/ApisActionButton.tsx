import { Button } from '../ui/Button.tsx';
import { ArrowRight } from 'lucide-react';
import { memo } from 'react';
import { cn } from '../../lib/utils.ts';

interface ApisActionButtonProps extends React.ComponentProps<typeof Button> {
  icon: any;
  label: string;
  iconClassName?: string;
  badge?: React.ReactNode;
}

export const ApisActionButton = memo(({ icon: Icon, label, iconClassName, badge, className, ...props }: ApisActionButtonProps) => {
  return (
    <Button 
      variant="outline" 
      className={cn("w-full justify-between h-14 bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/20 group active:scale-[0.98] transition-all duration-300", className)}
      {...props}
    >
      <div className="flex items-center gap-3">
        <Icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", iconClassName)} />
        <span className="font-semibold">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        {badge}
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform duration-300" />
      </div>
    </Button>
  );
});

ApisActionButton.displayName = 'ApisActionButton';
