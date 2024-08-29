import clsx from 'clsx';
import React from 'react';

interface AvailabilityBarProps {
    available: number;
    total: number;
    className?: string;
}

const AvailabilityBar: React.FC<AvailabilityBarProps> = ({ available, total, className }) => {
    const filledDots = Math.round((available / total) * 15);
    const emptyDots = 15 - filledDots;

    return (
        <div className={clsx('flex flex-col my-5 gap-2', className)}>
            <div className='flex justify-between items-center'>
                <span className='font-bold text-foreground text-lg'>{available} Available</span>
                <span className='text-sm text-[#71717A]'>(out of {total})</span>
            </div>
            <div className='flex justify-between'>
                {Array.from({ length: filledDots }).map((_, i) => (
                    <div
                        key={i}
                        className='w-[8px] h-[8px] bg-black dark:bg-[#DADADA] rounded-full'
                    />
                ))}
                {Array.from({ length: emptyDots }).map((_, i) => (
                    <div
                        key={i + filledDots}
                        className='w-[8px] h-[8px] bg-[#DADADA] dark:bg-black rounded-full'
                    />
                ))}
            </div>
        </div>
    );
};

export default AvailabilityBar;
