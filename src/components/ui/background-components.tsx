import type { ReactNode } from 'react';

type BackgroundComponentsProps = {
    children?: ReactNode;
    className?: string;
};

/**
 * White Tech Premium background.
 * Base: warm white (#f8f8fc).
 * Pattern: Clean 44px grid based on the About page design.
 */
export const Component = ({ children, className = '' }: BackgroundComponentsProps) => {
    return (
        <div className={`site-grid-surface min-h-screen w-full relative ${className}`}>
            <div className="relative z-10">{children}</div>
        </div>
    );
};

export const SoftYellowGlowBackground = Component;

export default Component;
