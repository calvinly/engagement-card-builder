import type { CardConfig } from "./ECBuilderForm";

const DB_NAME = "ec-builder";
const DB_VERSION = 1;
const STORE_NAME = "drafts";
const DRAFT_KEY = "current";

interface StoredCard {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  imageFileName: string;
  imageClassName: string;
  scale: number;
  posX: number;
  posY: number;
  imageData: ArrayBuffer | null;
  imageMimeType: string;
}

interface StoredDraft {
  cards: StoredCard[];
  activeIndex: number;
  a11yMode: boolean;
  savedAt: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveDraft(
  cards: CardConfig[],
  activeIndex: number,
  a11yMode: boolean,
): Promise<void> {
  const storedCards: StoredCard[] = await Promise.all(
    cards.map(async (card) => {
      let imageData: ArrayBuffer | null = null;
      let imageMimeType = "";

      if (card.imageFile) {
        imageData = await card.imageFile.arrayBuffer();
        imageMimeType = card.imageFile.type || "image/png";
      }

      return {
        id: card.id,
        title: card.title,
        subtitle: card.subtitle,
        cta: card.cta,
        imageFileName: card.imageFileName,
        imageClassName: card.imageClassName,
        scale: card.scale,
        posX: card.posX,
        posY: card.posY,
        imageData,
        imageMimeType,
      };
    }),
  );

  const draft: StoredDraft = {
    cards: storedCards,
    activeIndex,
    a11yMode,
    savedAt: new Date().toISOString(),
  };

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(draft, DRAFT_KEY);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export async function loadDraft(): Promise<{
  cards: CardConfig[];
  activeIndex: number;
  a11yMode: boolean;
} | null> {
  const db = await openDB();
  const draft = await new Promise<StoredDraft | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(DRAFT_KEY);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });

  if (!draft?.cards?.length) return null;

  const cards: CardConfig[] = draft.cards.map((stored) => {
    let image: string | null = null;
    let imageFile: File | null = null;

    if (stored.imageData) {
      const blob = new Blob([stored.imageData], { type: stored.imageMimeType || "image/png" });
      imageFile = new File([blob], stored.imageFileName, { type: blob.type });
      image = URL.createObjectURL(blob);
    }

    return {
      id: stored.id,
      image,
      imageFile,
      imageFileName: stored.imageFileName,
      imageClassName: stored.imageClassName,
      scale: stored.scale,
      posX: stored.posX,
      posY: stored.posY,
      title: stored.title,
      subtitle: stored.subtitle,
      cta: stored.cta,
    };
  });

  return { cards, activeIndex: draft.activeIndex, a11yMode: draft.a11yMode };
}

export async function clearDraft(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(DRAFT_KEY);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}
