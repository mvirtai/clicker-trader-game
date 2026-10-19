import { StateCreator } from 'zustand';
import { GameStore } from '../useGameStore';
import { TransactionRecord } from '../../types/game';

/**
 * Taloushallinnon tila ja toiminnot (Financial Slice)
 *
 * Senioriarkkitehdin opetus juniorille:
 * 1. Liukulukujen epätarkkuus (IEEE 754 Floating-point drift):
 *    JavaScriptissä `0.1 + 0.2 === 0.30000000000000004`. Rahapeleissä tämä
 *    aiheuttaa ärsyttäviä senttiheittoja. Siksi pyöristämme jokaisen
 *    rahansiirron 2 desimaalin tarkkuudelle (`Math.round(val * 100) / 100`).
 * 2. Tapahtumaloki (Ledger):
 *    Sen sijaan että vain muuttaisimme `cash`-lukua hiljaisesti, jokainen
 *    rahansiirto kirjaa `TransactionRecord`-olion. Tämä mahdollistaa
 *    reaaliaikaisen kassavirtakaavion ja tilinpäätökset!
 */

export interface FinancialSlice {
  cash: number;
  lifetimeCash: number;
  transactions: TransactionRecord[];

  // Toiminnot (Actions)
  addCash: (
    amount: number,
    category: TransactionRecord['category'],
    description: string,
    type?: TransactionRecord['type']
  ) => void;

  spendCash: (
    amount: number,
    category: TransactionRecord['category'],
    description: string
  ) => boolean;

  performManualClick: (comboMultiplier?: number) => number;
  processPassiveTick: (deltaTimeSeconds: number) => void;
  resetLedger: () => void;
}

export const createFinancialSlice: StateCreator<
  GameStore,
  [['zustand/devtools', never]],
  [],
  FinancialSlice
> = (set, get) => ({
  cash: 420.0,
  lifetimeCash: 420.0,
  transactions: [
    {
      id: 'tx-init-1',
      timestamp: Date.now() - 86400000,
      week: 1,
      day: 'MA',
      type: 'income',
      category: 'click_labor',
      amount: 420.0,
      description: 'Aloituspääoma ja edellisen viikon urakkasaatavat',
      balanceAfter: 420.0,
    },
  ],

  /**
   * Lisää rahaa kassaan ja kirjaa tapahtuman tilikirjaan
   */
  addCash: (amount, category, description, type = 'income') => {
    if (amount <= 0) return;
    const roundedAmount = Math.round(amount * 100) / 100;

    set(
      (state) => {
        const newCash = Math.round((state.cash + roundedAmount) * 100) / 100;
        const newLifetime = Math.round((state.lifetimeCash + roundedAmount) * 100) / 100;

        const newRecord: TransactionRecord = {
          id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: Date.now(),
          week: state.week,
          day: state.dayOfWeek,
          type,
          category,
          amount: roundedAmount,
          description,
          balanceAfter: newCash,
        };

        // Pidetään loki järkevän kokoisena (viimeisimmät 60 tapahtumaa) suorituskyvyn vuoksi
        const updatedTransactions = [newRecord, ...state.transactions].slice(0, 60);

        return {
          cash: newCash,
          lifetimeCash: newLifetime,
          transactions: updatedTransactions,
        };
      },
      false,
      'financial/addCash'
    );
  },

  /**
   * Veloittaa rahaa kassasta vain, jos saldo riittää.
   * Palauttaa `true` jos osto onnistui, `false` jos varat eivät riitä.
   */
  spendCash: (amount, category, description) => {
    if (amount <= 0) return true;
    const roundedAmount = Math.round(amount * 100) / 100;
    const currentCash = get().cash;

    if (currentCash < roundedAmount) {
      return false; // Estetään negatiivinen saldo ostotapahtumissa
    }

    set(
      (state) => {
        const newCash = Math.round((state.cash - roundedAmount) * 100) / 100;

        const newRecord: TransactionRecord = {
          id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: Date.now(),
          week: state.week,
          day: state.dayOfWeek,
          type: 'expense',
          category,
          amount: -roundedAmount,
          description,
          balanceAfter: newCash,
        };

        return {
          cash: newCash,
          transactions: [newRecord, ...state.transactions].slice(0, 60),
        };
      },
      false,
      'financial/spendCash'
    );

    return true;
  },

  /**
   * Suorittaa manuaalisen työkilkkauksen.
   * Huomioi työkalujen antamat bonukset, staminan kulutuksen ja tasonnousun!
   */
  performManualClick: (comboMultiplier = 1.0) => {
    const state = get();
    const player = state.player;

    // Jos stamina on 0 (burnout), tuottavuus romahtaa 80 %
    const staminaPenalty = player.stamina <= 0 ? 0.2 : 1.0;

    // Lasketaan klikkivoima: perustaso + kaikki aktiiviset työkalubonukset
    let clickPower = player.baseClickValue + player.level * 1.5;
    state.upgrades.forEach((u) => {
      if (u.level > 0 && u.clickBonus > 0) {
        clickPower += u.clickBonus * u.level;
      }
    });

    const finalEarned = Math.round(clickPower * comboMultiplier * staminaPenalty * 100) / 100;

    // Lasketaan staminakulutus (huomioidaan työkalujen ja sertifikaattien helpotukset)
    let staminaReductionRate = 0;
    state.upgrades.forEach((u) => {
      if (u.level > 0 && u.staminaDrainReduction > 0) {
        staminaReductionRate += u.staminaDrainReduction;
      }
    });
    // Rajoitetaan vähennys maksimissaan 75 prosenttiin
    staminaReductionRate = Math.min(staminaReductionRate, 0.75);

    const baseStaminaCost = 1.2;
    const actualStaminaCost = baseStaminaCost * (1.0 - staminaReductionRate);
    const newStamina = Math.max(0, Math.round((player.stamina - actualStaminaCost) * 10) / 10);

    // Kokemuspisteet (XP) ja tasonnousulogiikka
    const xpGained = Math.max(1, Math.round(2 * comboMultiplier));
    let newXp = player.xp + xpGained;
    let newLevel = player.level;
    const requiredXp = player.level * 150;

    if (newXp >= requiredXp) {
      newLevel += 1;
      newXp -= requiredXp;
      // Tasonnousu palauttaa osan staminasta ja nostaa mainetta!
      state.addReputation(5, `Tasonnousu tasolle ${newLevel}!`);
    }

    // Päivitetään pelaajan tila ja kassa atomisesti
    set(
      (prevState) => ({
        cash: Math.round((prevState.cash + finalEarned) * 100) / 100,
        lifetimeCash: Math.round((prevState.lifetimeCash + finalEarned) * 100) / 100,
        player: {
          ...prevState.player,
          stamina: newStamina,
          xp: newXp,
          level: newLevel,
          totalClicks: prevState.player.totalClicks + 1,
        },
      }),
      false,
      'financial/performManualClick'
    );

    // Kellonajan pieni edistyminen jokaisesta työsuoritteesta
    state.advanceMinute(1);

    return finalEarned;
  },

  /**
   * Passiivisen tulon tick-generaattori (kutsutaan peliluupista deltaTime-pohjaisesti).
   * Generoi tuloa automatisoiduista sopimuksista ja palkatuista työntekijöistä.
   */
  processPassiveTick: (deltaTimeSeconds) => {
    if (deltaTimeSeconds <= 0) return;
    const state = get();

    // 1. Päivitysten passiivituotto
    let ratePerSec = 0;
    state.upgrades.forEach((u) => {
      if (u.level > 0 && u.passiveIncomeBonus > 0) {
        ratePerSec += u.passiveIncomeBonus * u.level;
      }
    });

    // 2. Työntekijöiden tuottavuus (€/päivä -> jaettuna sekunneille)
    if (state.company?.employees) {
      state.company.employees.forEach((emp) => {
        ratePerSec += (emp.dailyOutputEur * emp.skillLevel) / 60; // Nopeutettu peliaika
      });
    }

    if (ratePerSec <= 0) return;

    const earned = ratePerSec * deltaTimeSeconds;
    if (earned < 0.01) return; // Vältetään mikroskooppisia turhia päivityksiä

    set(
      (prevState) => ({
        cash: Math.round((prevState.cash + earned) * 100) / 100,
        lifetimeCash: Math.round((prevState.lifetimeCash + earned) * 100) / 100,
      }),
      false,
      'financial/passiveTick'
    );
  },

  resetLedger: () => {
    set({ transactions: [] }, false, 'financial/resetLedger');
  },
});
