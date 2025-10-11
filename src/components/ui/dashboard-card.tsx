
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  isAvailable: boolean;
  className?: string;
  badgeText?: string;
}

export function DashboardCard({
  title,
  description,
  icon: Icon,
  onClick,
  isAvailable,
  className,
  badgeText,
}: DashboardCardProps) {
  return (
    <Card
      onClick={isAvailable ? onClick : undefined}
      className={cn(
        'flex flex-col text-center transition-all',
        isAvailable
          ? 'cursor-pointer hover:border-primary hover:shadow-lg hover:-translate-y-1'
          : 'cursor-not-allowed opacity-60 bg-muted/50',
        className
      )}
    >
      <CardHeader className="items-center">
        <div className="mb-4 rounded-full bg-foreground/10 p-4 text-foreground">
          <Icon className="h-8 w-8" />
        </div>
        <CardTitle>{title}</CardTitle>
        {badgeText && (
          <Badge variant={className?.includes('bg-gradient') ? 'secondary' : 'default'} className="mt-2">
            {badgeText}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className={cn(className?.includes('bg-gradient') && 'text-primary-foreground/80' )}>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}
