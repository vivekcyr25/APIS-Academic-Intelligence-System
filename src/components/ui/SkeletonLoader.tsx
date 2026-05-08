import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-white/5 border border-white/5",
        className
      )}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full"
        animate={{
          translateX: ["-100%", "100%"],
        }}
        transition={{
          repeat: Infinity,
          duration: 2,
          ease: "linear",
        }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)',
        }}
      />
    </div>
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4 max-w-sm" />
        <Skeleton className="h-6 w-1/2 max-w-xs" />
      </div>
      <Skeleton className="h-64 w-full rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    </div>
  );
};
