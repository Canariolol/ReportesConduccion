/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        popover: 'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        destructive: 'var(--destructive)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        'chart-1': 'var(--chart-1)',
        'chart-2': 'var(--chart-2)',
        'chart-3': 'var(--chart-3)',
        'chart-4': 'var(--chart-4)',
        'chart-5': 'var(--chart-5)',
        sidebar: 'var(--sidebar)',
        'sidebar-foreground': 'var(--sidebar-foreground)',
        'sidebar-primary': 'var(--sidebar-primary)',
        'sidebar-primary-foreground': 'var(--sidebar-primary-foreground)',
        'sidebar-accent': 'var(--sidebar-accent)',
        'sidebar-accent-foreground': 'var(--sidebar-accent-foreground)',
        'sidebar-border': 'var(--sidebar-border)',
        'sidebar-ring': 'var(--sidebar-ring)',
      },
      keyframes: {
        'aurora1': {
          '0%': { transform: 'translateX(-100px) translateY(-50px) rotate(0deg) scale(1)' },
          '50%': { transform: 'translateX(50px) translateY(30px) rotate(180deg) scale(1.1)' },
          '100%': { transform: 'translateX(100px) translateY(-30px) rotate(360deg) scale(0.9)' },
        },
        'aurora2': {
          '0%': { transform: 'translateX(80px) translateY(40px) rotate(45deg) scale(0.8)' },
          '50%': { transform: 'translateX(-30px) translateY(-20px) rotate(225deg) scale(1.2)' },
          '100%': { transform: 'translateX(-80px) translateY(60px) rotate(405deg) scale(0.9)' },
        },
        'aurora3': {
          '0%': { transform: 'translateX(-50px) translateY(20px) rotate(90deg) scale(1.1)' },
          '50%': { transform: 'translateX(70px) translateY(-40px) rotate(270deg) scale(0.8)' },
          '100%': { transform: 'translateX(-20px) translateY(50px) rotate(450deg) scale(1.0)' },
        },
        'aurora4': {
          '0%': { transform: 'translateX(30px) translateY(-20px) rotate(135deg) scale(0.9)' },
          '50%': { transform: 'translateX(-60px) translateY(10px) rotate(315deg) scale(1.1)' },
          '100%': { transform: 'translateX(40px) translateY(-60px) rotate(495deg) scale(0.8)' },
        }
      },
      animation: {
        'aurora1': 'aurora1 8s ease-in-out infinite alternate',
        'aurora2': 'aurora2 6s ease-in-out infinite alternate-reverse',
        'aurora3': 'aurora3 10s ease-in-out infinite alternate',
        'aurora4': 'aurora4 7s ease-in-out infinite alternate-reverse',
      },
    },
  },
  plugins: [],
}
