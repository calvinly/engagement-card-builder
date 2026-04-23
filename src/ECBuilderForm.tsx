import { useRef, useState, type CSSProperties, type ChangeEvent, type DragEvent } from "react";
import { Plus, Images, Upload, LayoutGrid, Grid3X3 } from "lucide-react";
import { cn } from "./oslo";
import { IMAGE_LIBRARY, IMAGE_CATEGORIES, libraryImageUrl, type LibraryImage } from "./imageLibrary";

export interface CardConfig {
  id: string;
  image: string | null;
  imageFile: File | null;
  imageFileName: string;
  imageClassName: string;
  scale: number;
  posX: number;
  posY: number;
  title: string;
  subtitle: string;
  cta: string;
}

export function createCardConfig(): CardConfig {
  return {
    id: crypto.randomUUID(),
    image: null,
    imageFile: null,
    imageFileName: "",
    imageClassName: "scale-[1] object-[50%_50%]",
    scale: 1,
    posX: 50,
    posY: 50,
    title: "Product title\ngoes here",
    subtitle: "",
    cta: "CTA goes here",
  };
}

function buildImageClassName(scale: number, posX: number, posY: number) {
  return `scale-[${scale}] object-[${posX}%_${posY}%]`;
}

export function buildImageStyle(scale: number, posX: number, posY: number): CSSProperties {
  return {
    objectPosition: `${posX}% ${posY}%`,
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: scale !== 1 ? `${posX}% ${posY}%` : undefined,
  };
}

interface ECBuilderFormProps {
  cards: CardConfig[];
  activeIndex: number;
  onCardsChange: (cards: CardConfig[]) => void;
  onActiveIndexChange: (index: number) => void;
  a11yMode: boolean;
  onA11yModeChange: (enabled: boolean) => void;
}

export function ECBuilderForm({ cards, activeIndex, onCardsChange, onActiveIndexChange, a11yMode, onA11yModeChange }: ECBuilderFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryView, setLibraryView] = useState<"2col" | "4col">("4col");
  const config = cards[activeIndex];

  const updateCard = (partial: Partial<CardConfig>) => {
    const next = { ...config, ...partial };
    if ("scale" in partial || "posX" in partial || "posY" in partial) {
      next.imageClassName = buildImageClassName(next.scale, next.posX, next.posY);
    }
    const updated = [...cards];
    updated[activeIndex] = next;
    onCardsChange(updated);
  };

  const addCard = () => {
    onCardsChange([createCardConfig(), ...cards]);
    onActiveIndexChange(0);
  };

  const removeCard = (index: number) => {
    if (cards.length <= 1) return;
    const updated = cards.filter((_, i) => i !== index);
    onCardsChange(updated);
    if (activeIndex >= updated.length) {
      onActiveIndexChange(updated.length - 1);
    } else if (activeIndex > index) {
      onActiveIndexChange(activeIndex - 1);
    }
  };

  const handleLibrarySelect = async (img: LibraryImage) => {
    const url = libraryImageUrl(img.filename);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], img.filename, { type: blob.type || "image/jpeg" });
      updateCard({ image: url, imageFile: file, imageFileName: img.filename });
    } catch {
      updateCard({ image: url, imageFile: null, imageFileName: img.filename });
    }
    setShowLibrary(false);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    updateCard({ image: url, imageFile: file, imageFileName: file.name });
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };


  const inputClass = "w-full px-3 py-2 rounded-xl border border-white/15 bg-white/5 text-white font-body text-sm focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/30";

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full">
      <div>
        <h1 className="font-heading font-black text-4xl leading-[var(--oslo-leading-4xl)] tracking-[var(--oslo-tracking-tighter)] text-white">Engagement Card Builder <span className="font-body text-lg font-normal text-white/30">v1.0</span></h1>
        <p className="font-body text-sm text-white/50 mt-1">
          Create engagements cards for the Oslo biz experience home.
        </p>
      </div>

      {/* Card Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {cards.map((card, i) => (
          <button
            key={card.id}
            onClick={() => onActiveIndexChange(i)}
            className={cn(
              "relative px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
              i === activeIndex
                ? "bg-white text-black"
                : "bg-white/10 text-white/70 hover:bg-white/20",
            )}
          >
            Card {i + 1}
            {cards.length > 1 && (
              <span
                onClick={(e) => { e.stopPropagation(); removeCard(i); }}
                className="ml-1.5 text-xs opacity-60 hover:opacity-100"
              >
                ×
              </span>
            )}
          </button>
        ))}
        <button
          onClick={addCard}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-dashed border-white/20 text-sm font-medium text-white/50 hover:border-white/40 hover:text-white/80 transition-colors"
        >
          <Plus size={14} />
          Add Card
        </button>
      </div>

      {/* Image Upload */}
      <div className="rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-black text-lg text-white">Background Image</h3>
          <div className="flex gap-1 p-0.5 rounded-lg bg-white/5 border border-white/10">
            <button
              onClick={() => setShowLibrary(false)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                !showLibrary ? "bg-white text-black" : "text-white/50 hover:text-white/80",
              )}
            >
              <Upload size={12} />
              Upload
            </button>
            <button
              onClick={() => setShowLibrary(true)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                showLibrary ? "bg-white text-black" : "text-white/50 hover:text-white/80",
              )}
            >
              <Images size={12} />
              Library
              {IMAGE_LIBRARY.length > 0 && (
                <span className={cn(
                  "ml-0.5 px-1 py-px rounded text-[10px] leading-none",
                  showLibrary ? "bg-black/10 text-black" : "bg-white/10 text-white/60",
                )}>
                  {IMAGE_LIBRARY.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {showLibrary ? (
          IMAGE_LIBRARY.length === 0 ? (
            <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center">
              <Images size={24} className="mx-auto mb-2 text-white/20" />
              <p className="font-body text-sm text-white/50">No images in the library yet</p>
              <p className="font-body text-xs text-white/30 mt-1">Add images to <code className="text-white/50">public/library/</code> and register them in <code className="text-white/50">src/imageLibrary.ts</code></p>
            </div>
          ) : (
            <>
              {/* View toggle */}
              <div className="flex justify-end mb-2">
                <div className="flex gap-0.5 p-0.5 rounded-md bg-white/5 border border-white/10">
                  <button
                    onClick={() => setLibraryView("2col")}
                    className={cn(
                      "p-1 rounded transition-colors",
                      libraryView === "2col" ? "bg-white/20 text-white" : "text-white/30 hover:text-white/60",
                    )}
                    aria-label="2 per row"
                  >
                    <LayoutGrid size={13} />
                  </button>
                  <button
                    onClick={() => setLibraryView("4col")}
                    className={cn(
                      "p-1 rounded transition-colors",
                      libraryView === "4col" ? "bg-white/20 text-white" : "text-white/30 hover:text-white/60",
                    )}
                    aria-label="4 per row"
                  >
                    <Grid3X3 size={13} />
                  </button>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto space-y-4 pr-0.5">
                {IMAGE_CATEGORIES.map((category) => {
                  const images = IMAGE_LIBRARY.filter((img) => img.category === category);
                  return (
                    <div key={category}>
                      <p className="font-label text-[11px] font-medium text-white/40 uppercase tracking-wider mb-2">{category}</p>

                      <div className={cn(
                        "grid gap-1.5",
                        libraryView === "2col" ? "grid-cols-2" : "grid-cols-4",
                      )}>
                        {images.map((img) => {
                          const isSelected = config.imageFileName === img.filename;
                          return (
                            <button
                              key={img.filename}
                              onClick={() => handleLibrarySelect(img)}
                              title={img.label ?? img.filename}
                              className={cn(
                                "relative rounded-xl overflow-hidden group border-2 transition-all",
                                libraryView === "2col" ? "aspect-[4/3]" : "aspect-square",
                                isSelected ? "border-blue-400" : "border-transparent hover:border-white/30",
                              )}
                            >
                              <img
                                src={libraryImageUrl(img.filename)}
                                alt={img.label ?? img.filename}
                                className="w-full h-full object-cover"
                              />
                              <div className={cn(
                                "absolute inset-0 transition-colors",
                                isSelected ? "bg-blue-400/20" : "bg-black/0 group-hover:bg-black/20",
                              )} />
                              {isSelected && (
                                <span className="absolute top-1 right-1 size-4 rounded-full bg-blue-400 flex items-center justify-center">
                                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                    <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )
        ) : (
          <>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/15 rounded-2xl p-6 text-center cursor-pointer hover:border-white/30 transition-colors"
            >
              {config.image ? (
                <div className="space-y-2">
                  <p className="font-body text-sm text-white/50">{config.imageFileName}</p>
                  <p className="font-body text-sm text-blue-400">Click or drop to replace</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="font-body text-sm text-white">Drop an image here</p>
                  <p className="font-body text-sm text-white/50">or click to browse</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </>
        )}

        {config.image && (
          <div className="mt-4 space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-label text-xs font-medium text-white">Scale</span>
                  <span className="font-body text-xs text-white/50">{config.scale.toFixed(1)}x</span>
                </div>
                <input
                  type="range" min="0.5" max="3" step="0.1"
                  value={config.scale}
                  style={{ "--range-fill": `${((config.scale - 0.5) / 2.5) * 100}%` } as CSSProperties}
                  onChange={(e) => updateCard({ scale: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-label text-xs font-medium text-white">Position X</span>
                  <span className="font-body text-xs text-white/50">{config.posX}%</span>
                </div>
                <input
                  type="range" min="0" max="100" step="1"
                  value={config.posX}
                  style={{ "--range-fill": `${config.posX}%` } as CSSProperties}
                  onChange={(e) => updateCard({ posX: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-label text-xs font-medium text-white">Position Y</span>
                  <span className="font-body text-xs text-white/50">{config.posY}%</span>
                </div>
                <input
                  type="range" min="0" max="100" step="1"
                  value={config.posY}
                  style={{ "--range-fill": `${config.posY}%` } as CSSProperties}
                  onChange={(e) => updateCard({ posY: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="rounded-2xl border border-white/10 p-4">
        <h3 className="font-heading font-black text-lg text-white mb-3">Card Content</h3>
        <div className="space-y-4">
          <div>
            <span className="font-label text-xs font-medium text-white block mb-1">Title</span>
            <textarea
              value={config.title}
              onChange={(e) => updateCard({ title: e.target.value })}
              placeholder={"e.g. Earn\nUnlimited 1%\ncash back"}
              rows={3}
              className={cn(inputClass, "resize-none")}
            />
            <p className="font-body text-xs text-white/40 mt-1">Each line becomes a new line on the card</p>
          </div>
          <div>
            <span className="font-label text-xs font-medium text-white block mb-1">Subtitle (optional)</span>
            <input
              type="text"
              value={config.subtitle}
              onChange={(e) => updateCard({ subtitle: e.target.value })}
              placeholder="e.g. Terms apply"
              className={inputClass}
            />
          </div>
          <div>
            <span className="font-label text-xs font-medium text-white block mb-1">CTA Button Text</span>
            <input
              type="text"
              value={config.cta}
              onChange={(e) => updateCard({ cta: e.target.value })}
              placeholder="e.g. Get the Card"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Accessibility Toggle */}
      <div className="flex items-center justify-between px-1">
        <span className="font-label text-xs font-medium text-white">Accessibility mode</span>
        <button
          onClick={() => onA11yModeChange(!a11yMode)}
          className={cn(
            "relative w-10 h-6 rounded-full transition-colors",
            a11yMode ? "bg-blue-500" : "bg-white/20",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform",
              a11yMode && "translate-x-4",
            )}
          />
        </button>
      </div>
    </div>
  );
}
