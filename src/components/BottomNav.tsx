import React from 'react';
import { Map, Award, HeartHandshake, User } from 'lucide-react';

export type NavTab = 'path' | 'cards' | 'ministering' | 'profile';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  unlockedBadgesCount: number;
}

const TABS = [
  {
    id: 'path' as NavTab,
    label: 'Camino',
    Icon: Map,
    activeColor: '#1cb0f6',
    activeBg: '#e8f7ff',
  },
  {
    id: 'cards' as NavTab,
    label: 'Cartas',
    Icon: Award,
    activeColor: '#ffc800',
    activeBg: '#fffbe0',
  },
  {
    id: 'ministering' as NavTab,
    label: 'Ministrar',
    Icon: HeartHandshake,
    activeColor: '#ff4b4b',
    activeBg: '#fff0f0',
  },
  {
    id: 'profile' as NavTab,
    label: 'Perfil',
    Icon: User,
    activeColor: '#a560f0',
    activeBg: '#f5eeff',
  },
];

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  unlockedBadgesCount,
}) => {
  return (
    <nav
      className="shrink-0 w-full bg-white border-t-2 border-[#e5e5e5] z-30"
      style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
    >
      <div className="w-full flex items-stretch justify-around px-1 pt-1">
        {TABS.map(({ id, label, Icon, activeColor, activeBg }) => {
          const isActive = currentTab === id;
          const showBadge = id === 'cards' && unlockedBadgesCount > 0;

          return (
            <button
              key={id}
              id={`nav-tab-${id}`}
              onClick={() => onSelectTab(id)}
              className="flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl mx-0.5 transition-all active:scale-95"
              style={{
                backgroundColor: isActive ? activeBg : 'transparent',
                color: isActive ? activeColor : '#afafaf',
              }}
            >
              <div className="relative">
                <Icon
                  className="transition-all"
                  style={{
                    width: 26,
                    height: 26,
                    strokeWidth: isActive ? 2.5 : 2,
                  }}
                />
                {showBadge && (
                  <span
                    className="absolute -top-1.5 -right-2 w-5 h-5 rounded-full text-white flex items-center justify-center font-bold border-2 border-white"
                    style={{ fontSize: 10, backgroundColor: '#ff4b4b' }}
                  >
                    {unlockedBadgesCount}
                  </span>
                )}
              </div>
              <span
                className="font-display leading-none"
                style={{
                  fontSize: 12,
                  fontWeight: isActive ? 700 : 600,
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
