import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        // Here you could send to Sentry or other error tracking
    }
    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (_jsx("div", { className: "min-h-screen bg-background flex items-center justify-center p-4", children: _jsxs("div", { className: "max-w-md w-full bg-surface border border-white/10 rounded-2xl p-8 text-center", children: [_jsx("div", { className: "w-16 h-16 mx-auto mb-4 rounded-full bg-error/20 flex items-center justify-center", children: _jsx("svg", { className: "w-8 h-8 text-error", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }) }), _jsx("h2", { className: "text-xl font-display font-semibold text-white mb-2", children: "\u00A1Algo sali\u00F3 mal!" }), _jsx("p", { className: "text-white/60 mb-6", children: "Ha ocurrido un error inesperado. Por favor, recarga la p\u00E1gina." }), _jsx("button", { onClick: () => window.location.reload(), className: "px-6 py-3 bg-primary text-background font-semibold rounded-xl hover:bg-primary-hover transition-colors", children: "Recargar p\u00E1gina" }), import.meta.env.DEV && this.state.error && (_jsx("pre", { className: "mt-4 p-4 bg-black/50 rounded-lg text-xs text-left text-error overflow-auto max-h-40", children: this.state.error.toString() }))] }) }));
        }
        return this.props.children;
    }
}
