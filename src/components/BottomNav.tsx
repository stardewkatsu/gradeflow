import { LayoutDashboard, Calculator, Sparkles, Eye } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const tabs = [
  { path: '/', icon: LayoutDashboard, label: 'Home' },
  { path: '/calculator', icon: Calculator, label: 'Grades' },
  { path: '/predictor', icon: Sparkles, label: 'AI' },
  { path: '/insights', icon: Eye, label: 'Insights' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl safe-bottom">
      <div className="mx-auto flex max-w-md items-center justify-around py-1.5 px-2">
        {tabs.map(tab => {
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-col items-center gap-0.5 rounded-2xl px-4 py-2 transition-all duration-200"
            >
              {active && (
                <motion.div
                  layoutId="nav-bg"
                  className="absolute inset-0 rounded-2xl bg-primary/8"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <tab.icon
                className={`relative z-10 h-[18px] w-[18px] transition-colors duration-200 ${
                  active ? 'text-primary' : 'text-muted-foreground/60'
                }`}
                strokeWidth={active ? 2.2 : 1.8}
              />
              <span
                className={`relative z-10 text-[9px] tracking-wide transition-colors duration-200 ${
                  active ? 'text-primary font-semibold' : 'text-muted-foreground/60 font-medium'
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
