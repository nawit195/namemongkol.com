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
        <div
            className={`min-h-screen w-full relative ${className}`}
        >
            <div className="pointer-events-none absolute inset-0 overflow-hidden z-0" aria-hidden="true">
                <div className="absolute inset-0 bg-[#f8f8fc]" />
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(201,147,58,0.08),transparent_28%),linear-gradient(180deg,#ffffff_0%,#f8f8fc_38%,#f3f3f9_100%)]" />
                <div className="absolute inset-0 opacity-[0.045] [background-image:linear-gradient(#1a1a3e_1px,transparent_1px),linear-gradient(90deg,#1a1a3e_1px,transparent_1px)] [background-size:44px_44px]" />
            </div>

            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export const SoftYellowGlowBackground = Component;

export default Component;
