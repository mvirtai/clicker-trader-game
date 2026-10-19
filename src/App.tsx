import React, { useEffect, useState } from 'react';
import { useGameStore } from './store/useGameStore';
import { Header } from './components/Header';
import { NavigationTabs } from './components/NavigationTabs';
import { WorkstationView } from './components/WorkstationView';
import { GigMarketView } from './components/GigMarketView';
import { WeekCalendarView } from './components/WeekCalendarView';
import { CompanyLoanView } from './components/CompanyLoanView';
import { UpgradesView } from './components/UpgradesView';
import { GameOverModal } from './components/GameOverModal';
import { ArchitectureModal } from './components/ArchitectureModal';

export const App: React.FC = () => {
  const { activeTab, processPassiveTick } = useGameStore();
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);

  // Passiivinen tulosilmukka (5 kertaa sekunnissa tasaisen kassavirran varmistamiseksi)
  useEffect(() => {
    const interval = setInterval(() => {
      processPassiveTick(0.2);
    }, 200);

    return () => clearInterval(interval);
  }, [processPassiveTick]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      <Header onOpenArchitecture={() => setIsArchitectureOpen(true)} />
      <NavigationTabs />

      <main className="px-6 pb-20">
        {activeTab === 'workstation' && <WorkstationView />}
        {activeTab === 'gigs' && <GigMarketView />}
        {activeTab === 'calendar' && <WeekCalendarView />}
        {activeTab === 'company' && <CompanyLoanView />}
        {activeTab === 'upgrades' && <UpgradesView />}
      </main>

      <GameOverModal />
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />
    </div>
  );
};

export default App;
