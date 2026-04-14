import { useRef, useState, useCallback } from "react";
import JSZip from "jszip";
import { ECBuilderForm, createCardConfig, type CardConfig } from "./ECBuilderForm";
import { ECBuilderPreview } from "./ECBuilderPreview";

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
  const [cards, setCards] = useState<CardConfig[]>([createCardConfig()]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [a11yMode, setA11yMode] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

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
      setCards(imported);
      setActiveIndex(0);
    }
  }, []);

  const handleCopyClipboard = useCallback(async () => {
    const data = {
      cards: cards.map(exportCardConfig),
      createdAt: new Date().toISOString(),
    };
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
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
    a.download = `engagement-cards-${Date.now()}.zip`;
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
            onActiveIndexChange={setActiveIndex}
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
              onClick={handleCopyClipboard}
              disabled={!hasContent}
              className="flex-1 px-4 py-2.5 rounded-full bg-white text-black font-label font-medium text-sm disabled:opacity-40 hover:bg-white/90 transition-colors"
            >
              Copy JSON
            </button>
            <button
              onClick={handleDownloadZip}
              disabled={!hasContent}
              className="flex-1 px-4 py-2.5 rounded-full bg-white/10 text-white font-label font-medium text-sm disabled:opacity-40 hover:bg-white/20 transition-colors"
            >
              Download ZIP
            </button>
          </div>
          <button
            onClick={() => importInputRef.current?.click()}
            className="w-full px-4 py-2.5 rounded-full bg-white/10 text-white font-label font-medium text-sm hover:bg-white/20 transition-colors"
          >
            Import ZIP
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
        <ECBuilderPreview cards={cards} activeIndex={activeIndex} onActiveIndexChange={setActiveIndex} a11yMode={a11yMode} />
      </div>
    </div>
  );
}
