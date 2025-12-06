import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { forwardRef } from 'react';
function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export const Input = forwardRef(({ className, label, error, icon, ...props }, ref) => {
    return (_jsxs("div", { className: "space-y-2 w-full", children: [label && (_jsx("label", { className: "text-sm font-medium text-white/70 block ml-1", children: label })), _jsxs("div", { className: "relative group", children: [icon && (_jsx("div", { className: "absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary transition-colors", children: icon })), _jsx("input", { ref: ref, className: cn("w-full bg-surface/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all duration-200", icon && "pl-11", error && "border-error/50 focus:border-error focus:ring-error/50", className), ...props })] }), error && (_jsx("p", { className: "text-sm text-error ml-1 animate-fade-in", children: error }))] }));
});
Input.displayName = 'Input';
