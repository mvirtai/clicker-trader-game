import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { sound } from '../services/soundService';
import { Volume2, VolumeX, BookOpen, RotateCcw } from 'lucide-react';

interface HeaderProps {
  onOpenArchitecture: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenArchitecture }) => {
  const { week, dayOfWeek, hour, minute, cash, player, loan, advanceDay, restartGame } = useGameStore();
  const [isMuted, setIsMuted] = React.useState(sound.getIsMuted());

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleNextDay = () => {
    sound.playClick();
    advanceDay();
  };

  const handleRestart = () => {
    if (window.confirm('Haluatko aloittaa pelin alusta?')) {
      restartGame();
    }
  };

  const formattedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold tracking-tight text-zinc-100">
            From Gigs to Giants
          </span>
          <span className="text-xs text-zinc-500 hidden sm:inline">
            · Studio Tycoon
          </span>
        </div>

        {/* Essential Metrics Zone */}
        <div className="flex items-center gap-6 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Aika:</span>
            <span className="font-mono text-zinc-200">Vk {week}, {dayOfWeek} {formattedTime}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Kassa:</span>
            <span className="font-mono tabular-nums text-amber-400 font-medium text-sm">
              {cash.toLocaleString('fi-FI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span className="text-zinc-500">Stamina:</span>
            <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  player.stamina > 30 ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                style={{ width: `${(player.stamina / player.maxStamina) * 100}%` }}
              />
            </div>
            <span className="font-mono text-zinc-300">{Math.round(player.stamina)}%</span>
          </div>

          {loan?.principal > 0 && (
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-zinc-500">Kodin velkariski:</span>
              <span className="font-mono tabular-nums text-rose-400">
                {((loan.principal / loan.homeCollateralValue) * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        {/* Actions Zone */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleNextDay}
            className="px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors"
            title="Siirry seuraavaan työpäivään"
          >
            Seuraava päivä
          </button>

          <button
            onClick={onOpenArchitecture}
            className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Arkkitehdin muistio & Go/TS-mallit"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleSound}
            className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
            title={isMuted ? 'Ota äänet käyttöön' : 'Mykistä äänet'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleRestart}
            className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Aloita alusta"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
