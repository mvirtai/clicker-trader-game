import React, { useState } from 'react';
import { useGameStore, calculateBusinessMetrics } from '../store/useGameStore';
import { sound } from '../services/soundService';
import {
  Building2,
  Home,
  AlertTriangle,
  UserPlus,
  TrendingUp,
  DollarSign,
  ShieldAlert,
  CheckCircle,
} from 'lucide-react';

export const CompanyLoanView: React.FC = () => {
  const store = useGameStore();
  const {
    hasCompanyBought,
    buyCompanyWithLoan,
    loan,
    company,
    cash,
    repayLoanPrincipal,
    hireEmployee,
    fireEmployee,
    promoteEmployee,
  } = store;

  const [notification, setNotification] = useState<string | null>(null);

  const metrics = calculateBusinessMetrics(store);

  const handleBuyCompany = () => {
    sound.playUpgrade();
    const res = buyCompanyWithLoan();
    setNotification(res.message);
  };

  const handleRepay = (amount: number) => {
    const res = repayLoanPrincipal(amount);
    if (res.success) {
      sound.playSuccess();
    } else {
      sound.playError();
    }
    setNotification(res.message);
  };

  const handleHireCandidate = () => {
    const res = hireEmployee({
      name: 'Ville Koskinen',
      role: 'Sähköasentaja (Valmis)',
      skillLevel: 2,
      weeklyCostEur: 360,
      dailyOutputEur: 80,
      staminaEfficiency: 0.1,
    });
    if (res.success) {
      sound.playSuccess();
    } else {
      sound.playError();
    }
    setNotification(res.message);
  };

  // Jos yritystä ei ole vielä ostettu (Phase 1)
  if (!hasCompanyBought) {
    return (
      <div className="max-w-3xl mx-auto py-12 space-y-8">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-semibold text-zinc-100 tracking-tight">
            Harppaus Yrittäjäksi: Yrityskauppa & Pankkilaina
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Olet tähän asti tehnyt manuaalisia keikkoja freelancerina. Nyt sinulle tarjotaan mahdollisuutta ostaa toimiva sähköasennusliike asiakaskantoineen ja pakettiautoineen.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-zinc-200">Lainan ja vakuuden ehdot</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="text-zinc-500 block">Lainasumma</span>
                <span className="text-amber-400 font-semibold text-base">45 000 €</span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="text-zinc-500 block">Viikkolyhennys</span>
                <span className="text-zinc-200 font-semibold text-base">450 € / vk</span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                <span className="text-zinc-500 block">Vakuus (Perheen koti)</span>
                <span className="text-rose-400 font-semibold text-base">180 000 €</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Korkean riskin vastuu</span>
              </div>
              <p className="leading-relaxed text-zinc-300">
                Pankki vaatii yrityslainalle vakuuden. Olet kiinnittänyt perheesi omakotitalon. Jos viikoittaisia maksuja jää rästiin 3 kertaa, pankki realisoi asuntosi ja peli päättyy välittömästi konkurssiin.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleBuyCompany}
              className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm rounded-xl transition-all shadow-sm active:scale-[0.99]"
            >
              Hyväksy laina ja osta yritys (45 000 €)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Phase 2: Yritys ostettu, lainan ja henkilöstön hallinta
  const riskPercent = metrics.collateralRiskPercent;
  const isDebtFree = loan.principal <= 0;

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      {/* Ilmoitusviesti */}
      {notification && (
        <div className="p-4 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-200 flex items-center justify-between">
          <span>{notification}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-zinc-500 hover:text-zinc-300 text-sm ml-4"
          >
            ×
          </button>
        </div>
      )}

      {/* Yleiskatsaus & Panttiriski */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-zinc-100">{company.name}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                {company.tier}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Yrityksen talouskeskus · Viikkoburn: {metrics.burnRatePerWeek} € · Kassan riittävyys: {metrics.cashRunwayWeeks} vk
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-zinc-500 block">Yrityksen maine (Rep)</span>
            <span className="text-lg font-semibold font-mono text-zinc-200">{company.companyRep} REP</span>
          </div>
        </div>

        {/* Lainan ja kodin kiinnityksen tilanne */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-zinc-400" />
              <span className="text-sm font-semibold text-zinc-200">Perheen kodin panttiriski</span>
            </div>
            <span className={`text-xs font-mono font-medium ${isDebtFree ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isDebtFree ? 'Turvassa (0 % pantti)' : `${riskPercent}% riskitaso`}
            </span>
          </div>

          {/* Riskin etenemispalkki */}
          <div className="w-full h-3 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
            <div
              className={`h-full transition-all duration-500 ${
                isDebtFree
                  ? 'bg-emerald-500'
                  : riskPercent > 20
                  ? 'bg-rose-500'
                  : 'bg-amber-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, riskPercent))}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono pt-2">
            <div>
              <span className="text-zinc-500 block">Jäljellä oleva velka</span>
              <span className="text-amber-400 font-medium text-sm">
                {loan.principal.toLocaleString('fi-FI')} €
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block">Viikkolyhennys</span>
              <span className="text-zinc-200 font-medium">{loan.weeklyPayment} € / vk</span>
            </div>
            <div>
              <span className="text-zinc-500 block">Maksurästit</span>
              <span className={`font-medium ${loan.missedPayments > 0 ? 'text-rose-400' : 'text-zinc-400'}`}>
                {loan.missedPayments} / {loan.maxMissedPayments}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block">Kodin arvo</span>
              <span className="text-zinc-200 font-medium">{loan.homeCollateralValue.toLocaleString('fi-FI')} €</span>
            </div>
          </div>

          {/* Lainan lyhennyspainikkeet */}
          {!isDebtFree ? (
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <span className="text-xs text-zinc-400">Ylimääräinen lyhennys:</span>
              <button
                onClick={() => handleRepay(500)}
                disabled={cash < 500}
                className="px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 rounded-lg transition-colors font-mono"
              >
                -500 €
              </button>
              <button
                onClick={() => handleRepay(2000)}
                disabled={cash < 2000}
                className="px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 rounded-lg transition-colors font-mono"
              >
                -2 000 €
              </button>
              <button
                onClick={() => handleRepay(loan.principal)}
                disabled={cash < loan.principal}
                className="px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg transition-colors font-mono"
              >
                Kuittaa koko laina ({loan.principal.toLocaleString('fi-FI')} €)
              </button>
            </div>
          ) : (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Laina on maksettu kokonaan pois! Perheen koti on vapaa pankin pantista.</span>
            </div>
          )}
        </div>
      </div>

      {/* Henkilöstö & Palkat */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-zinc-100">Henkilöstö ja asentajat</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Työntekijät tuottavat automaattista kassavirtaa, mutta kasvattavat viikkopalkkakuluja.
            </p>
          </div>

          <button
            onClick={handleHireCandidate}
            disabled={company.employees.length >= company.vanCapacity * 2}
            className="px-3.5 py-2 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-40"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Palkkaa asentaja (500 €)</span>
          </button>
        </div>

        <div className="space-y-3">
          {company.employees.length > 0 ? (
            company.employees.map((emp) => (
              <div
                key={emp.id}
                className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-200">{emp.name}</span>
                    <span className="text-zinc-500">·</span>
                    <span className="text-zinc-400">{emp.role} (Taso {emp.skillLevel})</span>
                  </div>
                  <div className="flex items-center gap-4 text-zinc-500 font-mono text-[11px]">
                    <span>Palkka: {emp.weeklyCostEur} €/vk</span>
                    <span>Tuotto: +{emp.dailyOutputEur} €/pv</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const res = promoteEmployee(emp.id);
                      setNotification(res.message);
                    }}
                    className="px-2.5 py-1 text-[11px] font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
                  >
                    Kouluta ({emp.skillLevel * 450} €)
                  </button>
                  <button
                    onClick={() => {
                      const res = fireEmployee(emp.id);
                      setNotification(res.message);
                    }}
                    className="px-2.5 py-1 text-[11px] font-medium text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                  >
                    Irtisano
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
              Ei palkattuja työntekijöitä. Palkkaa ensimmäinen asentaja kasvattaaksesi yrityksen tuottavuutta.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
