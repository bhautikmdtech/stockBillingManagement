'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PageContainerProps {
  children: ReactNode;
  scrollable?: boolean;
  className?: string;
}

export default function PageContainer({
  children,
  scrollable = true,
  className,
}: PageContainerProps) {
  return (
    <>
      {scrollable ? (
        <ScrollArea className='h-[calc(100dvh-52px)]'>
          <div className={cn('flex flex-1 p-4 md:px-6', className)}>
            {children}
          </div>
        </ScrollArea>
      ) : (
        <div className={cn('flex flex-1 p-4 md:px-6', className)}>
          {children}
        </div>
      )}
    </>
  );
}
