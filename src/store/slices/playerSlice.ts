import { StateCreator } from 'zustand';
import { GameStore } from '../useGameStore';
import { PlayerState } from '../../types/game';
import { INITIAL_PLAYER } from '../../data/initialData';

/**
 * Pelaajan henkilökohtainen tila ja kehitys (Player Slice)
 *
 * Senioriarkkitehdin opetus juniorille:
 * Pelaajan stamina ja maine (Rep) ovat pelillisiä resursseja,
 * jotka rajoittavat sitä, kuinka usein ja mihin hintaan töitä voidaan tehdä.
 * Reunaehtojen tarkistus (`Math.clamp` 0 - max) pitää huolen siitä, ettei
 * stamina karkaa negatiiviseksi tai maine yli maksimin (200).
 */

export interface PlayerSlice {
  player: PlayerState;

  // Toiminnot (Actions)
  consumeStamina: (amount: number) => void;
  restoreStamina: (amount: number) => void;
  addXp: (amount: number) => { levelUp: boolean; newLevel: number };
  addReputation: (amount: number, reason?: string) => void;
  addCertification: (certId: string) => void;
  resetPlayerStats: () => void;
}

export const createPlayerSlice: StateCreator<
  GameStore,
  [['zustand/devtools', never]],
  [],
  PlayerSlice
> = (set, get) => ({
  player: INITIAL_PLAYER,

  consumeStamina: (amount) => {
    if (amount <= 0) return;
    set(
      (s) => {
        const nextStamina = Math.max(0, Math.round((s.player.stamina - amount) * 10) / 10);
        return {
          player: {
            ...s.player,
            stamina: nextStamina,
            burnoutTurnsRemaining: nextStamina === 0 ? 2 : s.player.burnoutTurnsRemaining,
          },
        };
      },
      false,
      'player/consumeStamina'
    );
  },

  restoreStamina: (amount) => {
    if (amount <= 0) return;
    set(
      (s) => ({
        player: {
          ...s.player,
          stamina: Math.min(s.player.maxStamina, Math.round((s.player.stamina + amount) * 10) / 10),
          burnoutTurnsRemaining: 0,
        },
      }),
      false,
      'player/restoreStamina'
    );
  },

  addXp: (amount) => {
    const s = get();
    const currentXp = s.player.xp + amount;
    const reqXp = s.player.level * 150;

    if (currentXp >= reqXp) {
      const nextLevel = s.player.level + 1;
      const remainderXp = currentXp - reqXp;

      set(
        (state) => ({
          player: {
            ...state.player,
            level: nextLevel,
            xp: remainderXp,
            maxStamina: Math.min(150, state.player.maxStamina + 5),
          },
        }),
        false,
        'player/levelUp'
      );

      return { levelUp: true, newLevel: nextLevel };
    }

    set(
      (state) => ({
        player: { ...state.player, xp: currentXp },
      }),
      false,
      'player/addXp'
    );

    return { levelUp: false, newLevel: s.player.level };
  },

  addReputation: (amount, _reason) => {
    set(
      (s) => ({
        player: {
          ...s.player,
          personalRep: Math.min(200, Math.max(0, s.player.personalRep + amount)),
        },
      }),
      false,
      'player/addReputation'
    );
  },

  addCertification: (certId) => {
    set(
      (s) => {
        if (s.player.certifications.includes(certId)) return s;
        return {
          player: {
            ...s.player,
            certifications: [...s.player.certifications, certId],
          },
        };
      },
      false,
      'player/addCert'
    );
  },

  resetPlayerStats: () => {
    set({ player: INITIAL_PLAYER }, false, 'player/reset');
  },
});
