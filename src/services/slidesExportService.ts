import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { GameStore } from '../store/useGameStore';

// Alustetaan Firebase sovellus
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/presentations');
provider.addScope('https://www.googleapis.com/auth/drive.file');

let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuthListener = (
  onSuccess?: (user: User, token: string) => void,
  onFail?: () => void
) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user && cachedAccessToken) {
      if (onSuccess) onSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        if (onFail) onFail();
      }
    }
  });
};

export const getGoogleAccessToken = async (): Promise<string> => {
  if (cachedAccessToken) return cachedAccessToken;

  isSigningIn = true;
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Google OAuth -käyttöoikeustunnisteen (Access Token) nouto epäonnistui.');
    }
    cachedAccessToken = credential.accessToken;
    return cachedAccessToken;
  } finally {
    isSigningIn = false;
  }
};

export interface PitchDeckExportResult {
  presentationId: string;
  presentationUrl: string;
  title: string;
}

/**
 * Luo yrityksen ja sijoitussalkun pohjalta valmiin sijoittajaesityksen (Pitch Deck) Google Slidesiin.
 */
export async function exportPitchDeckToGoogleSlides(
  store: GameStore
): Promise<PitchDeckExportResult> {
  const token = await getGoogleAccessToken();

  const title = `${store.company.name || 'Yritys'} – Sijoittaja- ja Kasvukatsaus (Vk ${store.week})`;

  // 1. Luodaan esitys Google Slides API:lla
  const createRes = await fetch('https://slides.googleapis.com/v1/presentations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err.error?.message || 'Google Slides -esityksen luominen epäonnistui');
  }

  const presentation = await createRes.json();
  const presentationId = presentation.presentationId;

  // 2. Koostetaan datasta diaesityksen sisältö
  const totalPortfolioVal = store.getPortfolioValue ? store.getPortfolioValue() : 0;
  const pl = store.getPortfolioProfitLoss ? store.getPortfolioProfitLoss() : { amount: 0, percent: 0 };
  const risk = ((store.loan.principal / store.loan.homeCollateralValue) * 100).toFixed(1);

  // batchUpdate diojen ja tekstien lisäämiseksi
  const slide1Id = 'slide_financials';
  const slide2Id = 'slide_portfolio';

  const requests = [
    // Dia 2: Talous & Lainanhoito
    {
      createSlide: {
        objectId: slide1Id,
        slideLayoutReference: { predefinedLayout: 'TITLE_AND_BODY' },
      },
    },
    // Dia 3: Sijoitussalkku ja Raaka-aineet
    {
      createSlide: {
        objectId: slide2Id,
        slideLayoutReference: { predefinedLayout: 'TITLE_AND_BODY' },
      },
    },
  ];

  await fetch(`https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  });

  return {
    presentationId,
    presentationUrl: `https://docs.google.com/presentation/d/${presentationId}/edit`,
    title,
  };
}
