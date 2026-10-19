import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../../services/soundService';
import { Gig } from '../../types/game';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface TimingMinigameProps {
  gig: Gig;
  onComplete: (precision: number) => void;
  onCancel: () => void;
}

export const TimingMinigame: React.FC<TimingMinigameProps> = ({
  gig,
  onComplete,
  onCancel,
}) => {
  const [position, setPosition] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(3);
  const [scores, setScores] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const targetStart = 42;
  const targetEnd = 58;
  const targetCenter = (targetStart + targetEnd) / 2; // 50

  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning || isFinished) return;

    let pos = position;
    let dir = direction;

    const loop = () => {
      pos += dir * 1.6;
      if (pos >= 100) {
        pos = 100;
        dir = -1;
      } else if (pos <= 0) {
        pos = 0;
        dir = 1;
      }
      setPosition(pos);
      setDirection(dir);
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isRunning, direction, isFinished]);

  const handleAction = () => {
    if (!isRunning || isFinished) return;

    // Lasketaan tarkkuus suhteessa keskipisteeseen (50)
    const distance = Math.abs(position - targetCenter);
    // Jos osuma on tarkalleen keskellä, 100%. Jos ulkona, laskee
    let score = Math.max(0, Math.round(100 - distance * 2.2));
    if (position >= targetStart && position <= targetEnd) {
      score = Math.max(score, 85);
      sound.playClick();
    } else {
      sound.playError();
    }

    const nextScores = [...scores, score];
    setScores(nextScores);

    const nextAttempts = attemptsLeft - 1;
    setAttemptsLeft(nextAttempts);

    if (nextAttempts <= 0) {
      setIsRunning(false);
      setIsFinished(true);
      const avg = Math.round(nextScores.reduce((a, b) => a + b, 0) / nextScores.length);
      sound.playSuccess();
      setTimeout(() => {
        onComplete(avg);
      }, 900);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h3 className="text-base font-semibold text-zinc-100">Vaihetahdistus ja momenttikiristys</h3>
          <p className="text-xs text-zinc-400 mt-1">{gig.clientName} · {gig.description}</p>
        </div>
        <button
          onClick={onCancel}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Keskeytä
        </button>
      </div>

      <div className="text-center space-y-2">
        <span className="text-xs text-zinc-400">
          Paina välilyöntiä tai klikkaa painiketta, kun osoitin on vihreällä alueella.
        </span>
        <div className="text-xs text-zinc-500 font-mono">
          Suorituksia jäljellä: {attemptsLeft} / 3
        </div>
      </div>

      {/* Mittariura */}
      <div className="relative w-full h-10 bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden flex items-center">
        {/* Tavoitealue */}
        <div
          className="absolute h-full bg-emerald-500/20 border-x border-emerald-500/50 flex items-center justify-center"
          style={{
            left: `${targetStart}%`,
            width: `${targetEnd - targetStart}%`,
          }}
        >
          <span className="text-[10px] font-mono text-emerald-400 select-none">OPTIMI</span>
        </div>

        {/* Liikkuva osoitin */}
        <div
          className="absolute top-0 bottom-0 w-1.5 bg-amber-400 shadow-sm transition-transform"
          style={{ left: `${position}%` }}
        />
      </div>

      {/* Tulokset */}
      {scores.length > 0 && (
        <div className="flex justify-center gap-4 text-xs font-mono">
          {scores.map((s, idx) => (
            <span
              key={idx}
              className={`px-2 py-1 rounded ${
                s >= 80 ? 'text-emerald-400 bg-emerald-950/40' : 'text-zinc-400 bg-zinc-800/40'
              }`}
            >
              #{idx + 1}: {s}%
            </span>
          ))}
        </div>
      )}

      {/* Toimintapainike */}
      <div className="pt-2">
        <button
          onClick={handleAction}
          disabled={!isRunning || isFinished}
          className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-semibold text-sm rounded-lg transition-all active:scale-[0.99]"
        >
          {isFinished ? 'Valmis! Lasketaan tulosta...' : 'Lukitse ajoitus (Klikkaa)'}
        </button>
      </div>
    </div>
  );
};
