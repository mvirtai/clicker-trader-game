import React from 'react';
import { X, Code2, Server, Laptop, Cpu, BookOpen, TrendingUp } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-3xl w-full p-8 space-y-6 my-auto shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-zinc-100">Senioriarkkitehdin Muistio & Arkkitehtuurikatsaus</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 text-xs text-zinc-300 leading-relaxed max-h-[70vh] overflow-y-auto pr-2">
          {/* Osa 1: Miksi Go ja TypeScript yhdessä? */}
          <section className="space-y-2">
            <h4 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>1. Vastuunjako: Go-taustamoottori vs. TypeScript-käyttöliittymä</span>
            </h4>
            <p>
              Tässä projektissa yhdistimme kaksi kieltä niiden parhailla osa-alueilla:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>
                <strong className="text-zinc-200">Go (backend/internal/engine):</strong> Vastaa deterministisestä taloussimulaatiosta, viikoittaisista velkakoroista ja transaktioista. Gon gorutiinit ja vahva tyypitys takaavat pienen muistijalanjäljen ja tarkan suoritusnopeuden.
              </li>
              <li>
                <strong className="text-zinc-200">TypeScript (src/):</strong> Vastaa reaktiivisesta käyttöliittymästä, 60fps-minipeleistä ja Web Audio API -äänistä. TypeScriptin ansiosta UI reagoi alle millisekunnissa ilman verkkolatenssia.
              </li>
            </ul>
          </section>

          {/* Osa 2: Liukulukujen tarkkuus ja senttivirheet */}
          <section className="space-y-2">
            <h4 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>2. IEEE 754 Liukulukuongelma (Floating-Point Drift)</span>
            </h4>
            <p>
              Perinteisessä JavaScriptissä <code className="text-amber-300 bg-zinc-950 px-1 py-0.5 rounded">0.1 + 0.2 === 0.30000000000000004</code>. Rahapeleissä tämä aiheuttaa kumuloituvia senttivirheitä.
            </p>
            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 font-mono text-[11px] text-zinc-300">
              <div className="text-zinc-500">// Arkkitehtuuriratkaisu: Jokainen rahansiirto pyöristetään 2 desimaaliin</div>
              <div>const newCash = Math.round((currentCash + delta) * 100) / 100;</div>
            </div>
          </section>

          {/* Osa 3: Eksponentiaalinen kustannuskäyrä */}
          <section className="space-y-2">
            <h4 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>3. Eksponentiaalinen kustannuskäyrä klikkeripeleissä</span>
            </h4>
            <p>
              Jos päivitysten hinnat kasvaisivat lineaarisesti, pelaaja saisi liian nopeasti äärettömän kassavirran. Siksi käytämme vakiintunutta kaavaa:
            </p>
            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 font-mono text-[11px] text-zinc-300">
              <div className="text-zinc-500">// Kaava: BaseCost * (CostMultiplier ^ Level)</div>
              <div>const cost = Math.round(baseCost * Math.pow(1.45, currentLevel));</div>
            </div>
          </section>

          {/* Osa 4: Vakuusriskin kaava */}
          <section className="space-y-2">
            <h4 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Laptop className="w-4 h-4 text-rose-400" />
              <span>4. Kodin panttiriski (Collateral Risk Calculation)</span>
            </h4>
            <p>
              Pelin dramaattisin mekaniikka perustuu suoraan suhteeseen jäljellä olevan lainapääoman ja kodin kiinteän vakuusarvon (180 000 €) välillä:
            </p>
            <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 font-mono text-[11px] text-zinc-300">
              <div>collateralRiskPercent = (principal / homeCollateralValue) * 100;</div>
              <div className="text-zinc-500">// 45 000 € / 180 000 € = 25.0 % aloitusriski. 3 rästiä = konkurssi.</div>
            </div>
          </section>
        </div>

        <div className="pt-2 border-t border-zinc-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors"
          >
            Sulje muistio
          </button>
        </div>
      </div>
    </div>
  );
};
