import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export function Card({ className, variant = 'glass', children, ...props }) {
    const variants = {
        default: "bg-surface border border-white/10",
        glass: "bg-surface/60 backdrop-blur-xl border border-white/10 shadow-2xl",
        neo: "bg-[#0f0f13] border border-white/5 shadow-[20px_20px_60px_#0b0b0e,-20px_-20px_60px_#131318]"
    };
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 }, className: cn("rounded-2xl p-6 relative overflow-hidden", variants[variant], className), ...props, children: [variant === 'glass' && (_jsx("div", { className: "absolute -top-32 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" })), _jsx("div", { className: "relative z-10", children: children })] }));
}
