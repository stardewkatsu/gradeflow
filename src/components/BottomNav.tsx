import { LayoutDashboard, Calculator, Sparkles, Eye } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const tabs = [
  { path: '/', icon: LayoutDashboard, label: 'Home', emoji: '🏠' },
  { path: '/calculator', icon: Calculator, label: 'Calc', emoji: '📊' },
  { path: '/predictor', icon: Sparkles, label: 'AI', emoji: '✨' },
  { path: '/insights', icon: Eye, label: 'Insights', emoji: '🔍' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav safe-bottom">
      <div className="mx-auto flex max-w-md items-center justify-around py-2 px-2">
        {tabs.map(tab => {
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-col items-center gap-0.5 rounded-2xl px-5 py-2 transition-all duration-200"
            >
              {active && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-2xl bg-primary/10"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <tab.icon
                className={`relative z-10 h-[18px] w-[18px] transition-colors duration-200 ${
                  active ? 'text-primary' : 'text-muted-foreground/50'
                }`}
                strokeWidth={active ? 2.2 : 1.6}
              />
              <span
                className={`relative z-10 text-[9px] tracking-wide transition-colors duration-200 ${
                  active ? 'text-primary font-semibold' : 'text-muted-foreground/50 font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
