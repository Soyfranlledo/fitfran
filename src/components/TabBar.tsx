import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, UtensilsCrossed, HeartPulse } from 'lucide-react';

const tabs = [
  { to: '/', label: 'Hoy', Icon: Home, end: true },
  { to: '/entreno', label: 'Entreno', Icon: Dumbbell, end: false },
  { to: '/nutricion', label: 'Nutrición', Icon: UtensilsCrossed, end: false },
  { to: '/salud', label: 'Salud', Icon: HeartPulse, end: false },
];

export function TabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom">
      <div className="mx-auto max-w-md px-4 pb-2">
        <div className="flex items-center justify-around rounded-3xl border border-line bg-card/90 backdrop-blur-xl px-2 py-1.5 shadow-2xl shadow-black/40">
          {tabs.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="flex-1 group"
            >
              {({ isActive }) => (
                <div className="flex flex-col items-center gap-0.5 py-1.5">
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.4 : 2}
                    className={isActive ? 'text-accent' : 'text-faint'}
                  />
                  <span
                    className={`text-[10px] font-semibold ${
                      isActive ? 'text-accent' : 'text-faint'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
