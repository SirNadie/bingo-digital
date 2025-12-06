/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0a0a0f',
                surface: '#12121a',
                primary: {
                    DEFAULT: '#00f0ff',
                    hover: '#00cbe6',
                    glow: 'rgba(0, 240, 255, 0.5)',
                },
                secondary: {
                    DEFAULT: '#7000ff',
                    hover: '#5e00d6',
                },
                accent: '#ff0055',
                success: '#00ff9d',
                warning: '#ffb700',
                error: '#ff0055',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Space Grotesk', 'system-ui', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #0a0a0f 0deg, #12121a 180deg, #0a0a0f 360deg)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'slide-up': 'slideUp 0.5s ease-out forwards',
                'glow-pulse': 'glowPulse 2s infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                glowPulse: {
                    '0%, 100%': { boxShadow: '0 0 5px rgba(0, 240, 255, 0.2)' },
                    '50%': { boxShadow: '0 0 20px rgba(0, 240, 255, 0.6)' },
                },
            },
        },
    },
    plugins: [],
}
