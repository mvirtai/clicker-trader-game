import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { sound } from '../services/soundService';
import { DayOfWeek } from '../types/game';
import { INITIAL_WEEK_DAYS } from '../data/initialData';
import { Calendar as CalendarIcon, CheckCircle2, Coffee, Wrench, ChevronRight } from 'lucide-react';

export const WeekCalendarView: React.FC = () => {
  const { week, dayOfWeek, weekSchedule, advanceDay, setActiveTab } = useGameStore();

  const handleAdvance = () => {
    sound.playClick();
    advanceDay();
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">Viikkokalenteri ja aikataulutus</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Viikko {week} · Tasapainota tuottavat työpäivät ja lepo. Sunnuntain päättyessä suoritetaan viikkoselvitys.
          </p>
        </div>

        <button
          onClick={handleAdvance}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg flex items-center gap-2 transition-colors shrink-0"
        >
          <span>Päätä päivä ({dayOfWeek})</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {INITIAL_WEEK_DAYS.map((day) => {
          const slot = weekSchedule[day];
          const isCurrent = dayOfWeek === day;
          const isWeekend = day === 'LA' || day === 'SU';
          const isCompleted = !!slot?.result;

          return (
            <div
              key={day}
              className={`p-4 rounded-xl border flex flex-col justify-between min-h-[140px] transition-all ${
                isCurrent
                  ? 'border-amber-400 bg-zinc-900 ring-1 ring-amber-400/50'
                  : 'border-zinc-800 bg-zinc-900/40'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-mono font-semibold ${isCurrent ? 'text-amber-400' : 'text-zinc-400'}`}>
                    {day}
                  </span>
                  {isCurrent && (
                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300">
                      Tänään
                    </span>
                  )}
                  {isCompleted && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>

                <div className="text-xs">
                  {slot?.type === 'gig' ? (
                    <div className="space-y-1">
                      <span className="text-zinc-300 font-medium line-clamp-2">{slot.title || 'Asennuskeikka'}</span>
                      {slot.result && (
                        <div className="text-[11px] font-mono text-emerald-400">
                          +{slot.result.payEarned} €
                        </div>
                      )}
                    </div>
                  ) : slot?.type === 'rest' ? (
                    <div className="flex items-center gap-1.5 text-zinc-500 pt-1">
                      <Coffee className="w-3.5 h-3.5" />
                      <span>Lepo & palautuminen</span>
                    </div>
                  ) : (
                    <span className="text-zinc-600 italic">Vapaa</span>
                  )}
                </div>
              </div>

              <div className="pt-2">
                {isCurrent && slot?.type === 'gig' && !slot.result && (
                  <button
                    onClick={() => setActiveTab('workstation')}
                    className="w-full py-1 text-[11px] font-medium text-amber-400 hover:text-amber-300 text-left transition-colors"
                  >
                    Suorita työpisteellä →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
        <div className="space-y-1">
          <span className="font-semibold text-zinc-200 block">Viikkorytmi ja jaksaminen</span>
          <p className="leading-relaxed">
            Jokainen päivä kuluttaa ja palauttaa staminaa. Viikonloppulepo palauttaa energian ennen seuraavaa työviikkoa.
          </p>
        </div>

        <button
          onClick={handleAdvance}
          className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-lg transition-colors shrink-0"
        >
          Siirry seuraavaan päivään
        </button>
      </div>
    </div>
  );
};
