import { useState, useRef, useCallback, useEffect } from "react";
import type { CardConfig } from "./ECBuilderForm";
import { createCardConfig } from "./ECBuilderForm";

type SnapshotCard = Omit<CardConfig, "imageFile">;

interface UndoSnapshot {
  cards: SnapshotCard[];
  activeIndex: number;
}

function stripImageFiles(cards: CardConfig[]): SnapshotCard[] {
  return cards.map(({ imageFile: _, ...rest }) => rest);
}

export function useUndoHistory({ maxHistory }: { maxHistory: number }) {
  const [cards, _setCards] = useState<CardConfig[]>([createCardConfig()]);
  const [activeIndex, _setActiveIndex] = useState(0);

  const cardsRef = useRef(cards);
  const activeIndexRef = useRef(activeIndex);
  const undoStackRef = useRef<UndoSnapshot[]>([]);
  const redoStackRef = useRef<UndoSnapshot[]>([]);
  const fileMapRef = useRef<Map<string, File>>(new Map());
  const pausedRef = useRef(false);

  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const pushSnapshot = useCallback(
    (currentCards: CardConfig[], currentIndex: number) => {
      if (pausedRef.current) return;
      const snapshot: UndoSnapshot = {
        cards: stripImageFiles(currentCards),
        activeIndex: currentIndex,
      };
      const stack = undoStackRef.current;
      if (stack.length >= maxHistory) {
        stack.shift();
      }
      stack.push(snapshot);
      redoStackRef.current = [];
    },
    [maxHistory],
  );

  const rehydrateCards = useCallback((snapshotCards: SnapshotCard[]): CardConfig[] => {
    return snapshotCards.map((card) => ({
      ...card,
      imageFile: card.image ? fileMapRef.current.get(card.image) ?? null : null,
    }));
  }, []);

  const setCards = useCallback(
    (nextCards: CardConfig[]) => {
      pushSnapshot(cardsRef.current, activeIndexRef.current);
      cardsRef.current = nextCards;
      _setCards(nextCards);
    },
    [pushSnapshot],
  );

  const setActiveIndex = useCallback(
    (index: number) => {
      pushSnapshot(cardsRef.current, activeIndexRef.current);
      activeIndexRef.current = index;
      _setActiveIndex(index);
    },
    [pushSnapshot],
  );

  const setActiveIndexSilent = useCallback((index: number) => {
    activeIndexRef.current = index;
    _setActiveIndex(index);
  }, []);

  const setCardsAndIndex = useCallback(
    (nextCards: CardConfig[], index: number) => {
      pushSnapshot(cardsRef.current, activeIndexRef.current);
      cardsRef.current = nextCards;
      activeIndexRef.current = index;
      _setCards(nextCards);
      _setActiveIndex(index);
    },
    [pushSnapshot],
  );

  const replaceState = useCallback((nextCards: CardConfig[], index: number) => {
    cardsRef.current = nextCards;
    activeIndexRef.current = index;
    _setCards(nextCards);
    _setActiveIndex(index);
  }, []);

  const registerFile = useCallback((url: string, file: File) => {
    fileMapRef.current.set(url, file);
  }, []);

  const canUndo = undoStackRef.current.length > 0;
  const canRedo = redoStackRef.current.length > 0;

  const undo = useCallback(() => {
    const stack = undoStackRef.current;
    if (stack.length === 0) return;
    const redoSnapshot: UndoSnapshot = {
      cards: stripImageFiles(cardsRef.current),
      activeIndex: activeIndexRef.current,
    };
    redoStackRef.current.push(redoSnapshot);
    const snapshot = stack.pop()!;
    const restored = rehydrateCards(snapshot.cards);
    cardsRef.current = restored;
    activeIndexRef.current = snapshot.activeIndex;
    _setCards(restored);
    _setActiveIndex(snapshot.activeIndex);
  }, [rehydrateCards]);

  const redo = useCallback(() => {
    const stack = redoStackRef.current;
    if (stack.length === 0) return;
    const undoSnapshot: UndoSnapshot = {
      cards: stripImageFiles(cardsRef.current),
      activeIndex: activeIndexRef.current,
    };
    undoStackRef.current.push(undoSnapshot);
    const snapshot = stack.pop()!;
    const restored = rehydrateCards(snapshot.cards);
    cardsRef.current = restored;
    activeIndexRef.current = snapshot.activeIndex;
    _setCards(restored);
    _setActiveIndex(snapshot.activeIndex);
  }, [rehydrateCards]);

  const pauseSnapshots = useCallback(() => {
    if (!pausedRef.current) {
      pushSnapshot(cardsRef.current, activeIndexRef.current);
    }
    pausedRef.current = true;
  }, [pushSnapshot]);

  const resumeSnapshots = useCallback(() => {
    pausedRef.current = false;
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "z" && e.metaKey && !e.ctrlKey) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  return {
    cards,
    activeIndex,
    setCards,
    setActiveIndex,
    setActiveIndexSilent,
    setCardsAndIndex,
    replaceState,
    registerFile,
    undo,
    canUndo,
    redo,
    canRedo,
    pauseSnapshots,
    resumeSnapshots,
  };
}
