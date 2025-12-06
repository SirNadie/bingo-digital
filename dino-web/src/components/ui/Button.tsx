import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'glow';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export function Button({
    className,
    variant = 'primary',
    size = 'md',
    isLoading,
    children,
    ...props
}: ButtonProps) {
    const baseStyles = "relative inline-flex items-center justify-center font-display font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl";

    const variants = {
        primary: "bg-primary text-background hover:bg-primary-hover shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)]",
        secondary: "bg-surface border border-white/10 text-white hover:bg-white/5",
        ghost: "bg-transparent text-white/70 hover:text-white hover:bg-white/5",
        glow: "bg-transparent border border-primary text-primary shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:bg-primary/10 hover:shadow-[0_0_25px_rgba(0,240,255,0.4)]"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
    };

    // Convert generic props to motion props for animation
    const MotionButton = motion.button;

    return (
        <MotionButton
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            disabled={isLoading || props.disabled}
            {...(props as HTMLMotionProps<"button">)}
        >
            {isLoading ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading...
                </span>
            ) : children}
        </MotionButton>
    );
}
