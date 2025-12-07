import { jsx as _jsx } from "react/jsx-runtime";
import { Toaster } from 'react-hot-toast';
export function ToastProvider() {
    return (_jsx(Toaster, { position: "top-right", toastOptions: {
            duration: 4000,
            style: {
                background: '#12121a',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '16px',
                fontFamily: 'Inter, system-ui, sans-serif',
            },
            success: {
                iconTheme: {
                    primary: '#00ff9d',
                    secondary: '#0a0a0f',
                },
                style: {
                    borderColor: 'rgba(0, 255, 157, 0.3)',
                },
            },
            error: {
                iconTheme: {
                    primary: '#ff0055',
                    secondary: '#0a0a0f',
                },
                style: {
                    borderColor: 'rgba(255, 0, 85, 0.3)',
                },
            },
            loading: {
                iconTheme: {
                    primary: '#00f0ff',
                    secondary: '#0a0a0f',
                },
            },
        } }));
}
