import { useRef, useState, useCallback, useEffect } from "react";
import JSZip from "jszip";
import { ECBuilderForm, createCardConfig, type CardConfig } from "./ECBuilderForm";
import { ECBuilderPreview } from "./ECBuilderPreview";
import { exportForDevelopment } from "./exportDev";
import { saveDraft, loadDraft } from "./autosave";
import { useUndoHistory } from "./useUndoHistory";

function formatTimestamp(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${mm}${dd}${yyyy}-${hh}${min}${ss}`;
}

function exportCardConfig(card: CardConfig) {
  return {
    title: card.title,
    subtitle: card.subtitle,
    cta: card.cta,
    imageFileName: card.imageFileName,
    imageClassName: card.imageClassName,
  };
}

function parseImageClassName(cls: string): { scale: number; posX: number; posY: number } {
  let scale = 1, posX = 50, posY = 50;
  const scaleMatch = cls.match(/scale-\[([.\d]+)\]/);
  if (scaleMatch) scale = parseFloat(scaleMatch[1]);
  const posMatch = cls.match(/object-\[(\d+)%[_ ](\d+)%\]/);
  if (posMatch) {
    posX = parseInt(posMatch[1]);
    posY = parseInt(posMatch[2]);
  }
  return { scale, posX, posY };
}

export function ECBuilder() {
  const {
    cards, activeIndex,
    setCards, setActiveIndexSilent,
    setCardsAndIndex, replaceState,
    registerFile,
    pauseSnapshots, resumeSnapshots,
  } = useUndoHistory({ maxHistory: 20 });
  const [a11yMode, setA11yMode] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    loadDraft().then((draft) => {
      if (draft) {
        replaceState(draft.cards, draft.activeIndex);
        setA11yMode(draft.a11yMode);
        for (const card of draft.cards) {
          if (card.image && card.imageFile) {
            registerFile(card.image, card.imageFile);
          }
        }
      }
      loadedRef.current = true;
    });
  }, []);

  useEffect(() => {
    if (!loadedRef.current) return;
    const timeout = setTimeout(() => {
      saveDraft(cards, activeIndex, a11yMode);
    }, 500);
    return () => clearTimeout(timeout);
  }, [cards, activeIndex, a11yMode]);

  const hasContent = cards.some((c) => c.title || c.image);

  const handleImportZip = useCallback(async (file: File) => {
    const zip = await JSZip.loadAsync(file);
    const jsonFile = zip.file("engagement-cards.json");
    if (!jsonFile) return;

    const jsonText = await jsonFile.async("text");
    const data = JSON.parse(jsonText);
    if (!data.cards || !Array.isArray(data.cards)) return;

    const imported: CardConfig[] = await Promise.all(
      data.cards.map(async (entry: ReturnType<typeof exportCardConfig>) => {
        const config = createCardConfig();
        config.title = entry.title || "";
        config.subtitle = entry.subtitle || "";
        config.cta = entry.cta || "";
        config.imageFileName = entry.imageFileName || "";
        config.imageClassName = entry.imageClassName || "";

        if (entry.imageClassName) {
          const parsed = parseImageClassName(entry.imageClassName);
          config.scale = parsed.scale;
          config.posX = parsed.posX;
          config.posY = parsed.posY;
        }

        if (entry.imageFileName) {
          const imgFile = zip.file(`images/${entry.imageFileName}`);
          if (imgFile) {
            const blob = await imgFile.async("blob");
            const imageFile = new File([blob], entry.imageFileName, { type: blob.type || "image/png" });
            config.image = URL.createObjectURL(blob);
            config.imageFile = imageFile;
          }
        }

        return config;
      }),
    );

    if (imported.length > 0) {
      for (const card of imported) {
        if (card.image && card.imageFile) {
          registerFile(card.image, card.imageFile);
        }
      }
      setCardsAndIndex(imported, 0);
    }
  }, [setCardsAndIndex, registerFile]);

  const handleExportDev = useCallback(async () => {
    await exportForDevelopment(cards);
  }, [cards]);

  const handleDownloadZip = useCallback(async () => {
    const zip = new JSZip();

    const data = {
      cards: cards.map(exportCardConfig),
      createdAt: new Date().toISOString(),
    };
    zip.file("engagement-cards.json", JSON.stringify(data, null, 2));

    const imagesFolder = zip.folder("images");
    for (const card of cards) {
      if (card.imageFile && imagesFolder) {
        imagesFolder.file(card.imageFileName, card.imageFile);
      }
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `oslo-biz-engage-cards-${formatTimestamp()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }, [cards]);

  return (
    <div className="flex h-screen bg-bg-base text-content-base">
      {/* Left: Builder Form */}
      <div className="w-[440px] shrink-0 border-r border-white/10 flex flex-col bg-black text-white">
        <div className="flex-1 overflow-y-auto">
          <ECBuilderForm
            cards={cards}
            activeIndex={activeIndex}
            onCardsChange={setCards}
            onActiveIndexChange={setActiveIndexSilent}
            onCardsAndIndexChange={setCardsAndIndex}
            registerFile={registerFile}
            pauseSnapshots={pauseSnapshots}
            resumeSnapshots={resumeSnapshots}
            a11yMode={a11yMode}
            onA11yModeChange={setA11yMode}
          />
        </div>

        {/* Export/Import Actions */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <p className="font-label text-xs font-medium text-white/50 text-center">
            {cards.length} card{cards.length !== 1 ? "s" : ""} configured
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDownloadZip}
              disabled={!hasContent}
              className="flex-1 px-4 py-2.5 rounded-full bg-white/10 text-white font-label font-medium text-sm disabled:opacity-40 hover:bg-white/20 transition-colors"
            >
              Download ZIP
            </button>
            <button
              onClick={() => importInputRef.current?.click()}
              className="flex-1 px-4 py-2.5 rounded-full bg-white/10 text-white font-label font-medium text-sm hover:bg-white/20 transition-colors"
            >
              Import ZIP
            </button>
          </div>
          <button
            onClick={handleExportDev}
            disabled={!hasContent}
            className="w-full px-4 py-2.5 rounded-full bg-blue-500 text-white font-label font-medium text-sm disabled:opacity-40 hover:bg-blue-600 transition-colors"
          >
            Export to Development
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept=".zip"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImportZip(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {/* Right: Live Preview */}
      <div className="flex-1 bg-gray-100 overflow-hidden">
        <ECBuilderPreview cards={cards} activeIndex={activeIndex} onActiveIndexChange={setActiveIndexSilent} a11yMode={a11yMode} />
      </div>
    </div>
  );
}
