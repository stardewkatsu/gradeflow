import { LayoutDashboard, Calculator, Sparkles, Eye } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { path: '/', icon: LayoutDashboard, label: 'Home' },
  { path: '/calculator', icon: Calculator, label: 'Calculator' },
  { path: '/predictor', icon: Sparkles, label: 'AI' },
  { path: '/insights', icon: Eye, label: 'Insights' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav safe-bottom">
      <div className="mx-auto flex max-w-md items-center justify-around py-1.5 px-2">
        {tabs.map(tab => {
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center gap-0.5 px-4 py-1 transition-colors"
            >
              <tab.icon
                className={`h-[22px] w-[22px] ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
                strokeWidth={active ? 2 : 1.5}
              />
              <span
                className={`text-[10px] ${
                  active ? 'text-primary font-medium' : 'text-muted-foreground'
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
