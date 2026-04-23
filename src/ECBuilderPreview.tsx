import { CollectionDeck, FlickerCard, BottomNav, BottomNavItem } from "./oslo";
import { Home, Send, ArrowDownToLine, Wallet } from "lucide-react";
import { buildImageStyle, type CardConfig } from "./ECBuilderForm";

interface ECBuilderPreviewProps {
  cards: CardConfig[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  a11yMode: boolean;
}

export function ECBuilderPreview({ cards, activeIndex, onActiveIndexChange, a11yMode }: ECBuilderPreviewProps) {
  const deckCards = cards.map((config) => (
    <FlickerCard
      key={config.id}
      image={config.image ?? undefined}
      imageStyle={buildImageStyle(config.scale, config.posX, config.posY)}
      title={config.title}
      subtitle={config.subtitle}
      cta={config.cta}
      onDismiss={() => {}}
    />
  ));

  return (
    <div className="flex items-center justify-center h-full">
      {/* Device frame */}
      <div className="relative rounded-[3rem] border-[12px] border-gray-900 bg-gray-900 shadow-2xl">
        {/* Dynamic Island */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 w-[120px] h-[32px] bg-gray-900 rounded-b-[1.25rem]" />

        {/* Screen */}
        <div
          className="relative w-[402px] h-[874px] rounded-[2.25rem] overflow-hidden bg-white"
          data-theme="light"
          style={{
            colorScheme: 'light',
            '--safe-area-top': '66px',
            '--safe-area-bottom': '34px',
            '--bottom-nav-offset': '106px',
          } as React.CSSProperties}
        >
          {/* iOS Status Bar */}
          <div className="absolute top-0 inset-x-0 z-[60] flex items-center justify-between px-8 h-[32px] pointer-events-none text-white">
            <span className="text-[15px] font-semibold leading-none">9:41</span>
            <div className="flex items-center gap-1.5">
              <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
                <rect x="0" y="8" width="3" height="4" rx="0.5"/>
                <rect x="5" y="5" width="3" height="7" rx="0.5"/>
                <rect x="10" y="2" width="3" height="10" rx="0.5"/>
                <rect x="15" y="0" width="3" height="12" rx="0.5"/>
              </svg>
              <svg width="18" height="13" viewBox="0 0 18 13" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M8.5713 2.46628C11.0584 2.46639 13.4504 3.38847 15.2529 5.04195C15.3887 5.1696 15.6056 5.16799 15.7393 5.03834L17.0368 3.77487C17.1045 3.70911 17.1422 3.62004 17.1417 3.52735C17.1411 3.43467 17.1023 3.34603 17.0338 3.28104C12.3028 -1.09368 4.83907 -1.09368 0.108056 3.28104C0.039524 3.34598 0.000639766 3.4346 7.82398e-06 3.52728C-0.000624118 3.61996 0.0370483 3.70906 0.104689 3.77487L1.40255 5.03834C1.53615 5.16819 1.75327 5.1698 1.88893 5.04195C3.69167 3.38836 6.08395 2.46628 8.5713 2.46628ZM8.56795 6.68656C9.92527 6.68647 11.2341 7.19821 12.2403 8.12234C12.3763 8.2535 12.5907 8.25065 12.7234 8.11593L14.0106 6.79663C14.0784 6.72742 14.1161 6.63355 14.1151 6.536C14.1141 6.43844 14.0746 6.34536 14.0054 6.27757C10.9416 3.38672 6.19688 3.38672 3.13305 6.27757C3.06384 6.34536 3.02435 6.43849 3.02345 6.53607C3.02254 6.63366 3.06028 6.72752 3.12822 6.79663L4.41513 8.11593C4.54778 8.25065 4.76215 8.2535 4.89823 8.12234C5.90368 7.19882 7.21152 6.68713 8.56795 6.68656ZM11.0924 9.48011C11.0943 9.58546 11.0572 9.68703 10.9899 9.76084L8.81327 12.2156C8.74946 12.2877 8.66247 12.3283 8.5717 12.3283C8.48093 12.3283 8.39394 12.2877 8.33013 12.2156L6.1531 9.76084C6.08585 9.68697 6.04886 9.58537 6.05085 9.48002C6.05284 9.37467 6.09365 9.27491 6.16364 9.20429C7.55374 7.8904 9.58966 7.8904 10.9798 9.20429C11.0497 9.27497 11.0904 9.37476 11.0924 9.48011Z"/>
              </svg>
              <svg width="27" height="13" viewBox="0 0 27 13">
                <rect x="0.5" y="0.5" width="22" height="12" rx="2.5" stroke="currentColor" fill="none" strokeWidth="1"/>
                <rect x="2" y="2" width="19" height="9" rx="1.5" fill="currentColor"/>
                <path d="M24 4.5v4a2 2 0 0 0 0-4Z" fill="currentColor" opacity="0.4"/>
              </svg>
            </div>
          </div>

          {/* Top Nav */}
          <div className="bg-black px-4 pb-4 pt-[66px]">
            <div className="flex items-center gap-3 h-10">
              <div className="flex-1 min-w-0 flex items-center gap-2 opacity-50">
                <div className="size-6 rounded-full bg-white/20" />
                <span className="font-label font-medium text-sm text-white">Search or ask a question</span>
              </div>
            </div>
          </div>

          {/* Collection Deck */}
          <div
            className="pt-4 pb-4"
            style={a11yMode ? {
              '--ec-title-scale': '1.25',
              '--ec-subtitle-scale': '2',
              '--ec-cta-scale': '2',
            } as React.CSSProperties : undefined}
          >
            <CollectionDeck cards={deckCards} activeIndex={activeIndex} onActiveIndexChange={onActiveIndexChange} />
          </div>

          {/* Bottom nav */}
          <div className="absolute bottom-0 inset-x-0 z-[55]">
            <BottomNav>
              <BottomNavItem icon={<Home size={20} />} label="Home" active />
              <BottomNavItem icon={<Send size={20} />} label="Pay" />
              <BottomNavItem icon={<ArrowDownToLine size={20} />} label="Get Paid" />
              <BottomNavItem icon={<Wallet size={20} />} label="Me" />
            </BottomNav>
          </div>
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[140px] h-[5px] bg-gray-600 rounded-full" />
      </div>

    </div>
  );
}
