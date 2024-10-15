import { cn } from "@/lib/utils"
import React from 'react'
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> { }

function SkeletonCard({ className, ...props }: SkeletonCardProps) {
  return (
    <Card className={cn(className)} {...props}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="rounded-full h-12 w-12" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
        <div className="flex">
          <Skeleton className="h-8 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export { SkeletonCard }
