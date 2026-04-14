import { useRef, type CSSProperties, type ChangeEvent, type DragEvent } from "react";
import { OsloPlus, cn } from "@oslo/design-system";

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
    transform: `scale(${scale})`,
    transformOrigin: `${posX}% ${posY}%`,
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

  const imageStyle = buildImageStyle(config.scale, config.posX, config.posY);

  const inputClass = "w-full px-3 py-2 rounded-xl border border-white/15 bg-white/5 text-white font-body text-sm focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/30";

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full">
      <div>
        <h1 className="font-heading font-black text-4xl leading-[var(--oslo-leading-4xl)] tracking-[var(--oslo-tracking-tighter)] text-white">Engagement Card Builder</h1>
        <p className="font-body text-sm text-white/50 mt-1">
          Create engagement cards for the homepage collection deck.
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
          <OsloPlus size={14} />
          Add Card
        </button>
      </div>

      {/* Image Upload */}
      <div className="rounded-2xl border border-white/10 p-4">
        <h3 className="font-heading font-black text-lg text-white mb-3">Background Image</h3>
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

        {config.image && (
          <div className="mt-4 space-y-4">
            <p className="font-label text-xs font-medium text-white/50">Image Preview</p>
            <div className="relative w-full h-[200px] rounded-2xl overflow-hidden bg-gray-900">
              <img
                src={config.image}
                alt="Preview"
                className="absolute inset-0 w-full h-full object-cover"
                style={imageStyle}
              />
              <div className="absolute inset-0 bg-black/50" />
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-label text-xs font-medium text-white">Scale</span>
                  <span className="font-body text-xs text-white/50">{config.scale.toFixed(1)}x</span>
                </div>
                <input
                  type="range" min="0.5" max="3" step="0.1"
                  value={config.scale}
                  onChange={(e) => updateCard({ scale: parseFloat(e.target.value) })}
                  className="w-full accent-blue-400"
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
                  onChange={(e) => updateCard({ posX: parseInt(e.target.value) })}
                  className="w-full accent-blue-400"
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
                  onChange={(e) => updateCard({ posY: parseInt(e.target.value) })}
                  className="w-full accent-blue-400"
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
