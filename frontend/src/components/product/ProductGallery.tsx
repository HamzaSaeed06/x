import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play, ZoomIn, Maximize2 } from 'lucide-react';

export type GalleryItem =
  | { type: 'image'; url: string }
  | { type: 'video'; url: string };

export function ProductGallery({
  images,
  videoUrl,
  productName,
  isFlashSale,
  discount,
}: {
  images: string[];
  videoUrl?: string;
  productName: string;
  isFlashSale: boolean;
  discount: number;
}) {
  const validImages =
    images.length > 0
      ? images
      : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'];

  const items: GalleryItem[] = [
    ...validImages.map((url) => ({ type: 'image' as const, url })),
    ...(videoUrl ? [{ type: 'video' as const, url: videoUrl }] : []),
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const touchStartX = useRef<number | null>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const mainImageRef = useRef<HTMLDivElement>(null);

  const getVideoData = useCallback((url: string) => {
    if (!url) return { type: 'none' as const };
    const cleanUrl = url.trim();
    const ytMatch = cleanUrl.match(/^.*(?:youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/);
    const ytId = (ytMatch && ytMatch[1] && ytMatch[1].length === 11) ? ytMatch[1] : null;
    if (ytId) {
      return {
        type: 'youtube' as const,
        id: ytId,
        embedUrl: `https://www.youtube.com/embed/${ytId}?autoplay=1&controls=1&rel=0&modestbranding=1`,
        thumbnail: `https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg`,
      };
    }
    const isDirectVideo = /\.(mp4|webm|ogg|mov|m4v)(?:\?.*)?$/i.test(cleanUrl);
    if (isDirectVideo) return { type: 'direct' as const, url: cleanUrl };
    return { type: 'unsupported' as const, url: cleanUrl };
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [images, videoUrl]);

  useEffect(() => {
    if (thumbsRef.current) {
      const btn = thumbsRef.current.children[activeIndex] as HTMLElement;
      btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [activeIndex]);

  const goNext = useCallback(() => {
    setActiveIndex(prev => (prev + 1) % items.length);
  }, [items.length]);

  const goPrev = useCallback(() => {
    setActiveIndex(prev => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { diff > 0 ? goNext() : goPrev(); }
    touchStartX.current = null;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isZoomed || !mainImageRef.current) return;
    const rect = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const imageItems = items.filter(i => i.type === 'image');
  const lightboxPrev = useCallback(() => setLightboxIndex(i => (i === 0 ? imageItems.length - 1 : i - 1)), [imageItems.length]);
  const lightboxNext = useCallback(() => setLightboxIndex(i => (i === imageItems.length - 1 ? 0 : i + 1)), [imageItems.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') lightboxPrev();
      if (e.key === 'ArrowRight') lightboxNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxOpen, lightboxPrev, lightboxNext]);

  const openLightbox = (i: number) => {
    if (items[i]?.type !== 'image') return;
    setLightboxIndex(i);
    setLightboxOpen(true);
  };

  const activeItem = items[activeIndex];

  const renderVideo = (item: GalleryItem & { type: 'video' }) => {
    const vd = getVideoData(item.url);
    if (vd.type === 'direct') return (
      <video key={vd.url} src={vd.url} autoPlay muted loop playsInline controls className="w-full h-full object-contain" />
    );
    if (vd.type === 'youtube') return (
      <iframe key={vd.embedUrl} src={vd.embedUrl}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
    return <div className="w-full h-full flex items-center justify-center bg-neutral-900"><span className="text-white/60 text-sm">Invalid video URL</span></div>;
  };

  return (
    <>
      <div className="w-full select-none lg:sticky lg:top-24">
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
          {/* Vertical Thumbnails — Desktop */}
          {items.length > 1 && (
            <div
              ref={thumbsRef}
              className="hidden md:flex flex-col gap-2 sm:gap-3 flex-shrink-0 max-h-[380px] lg:max-h-[480px] xl:max-h-[520px] overflow-y-auto scrollbar-hide"
            >
              {items.map((item, i) => (
                <motion.button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  whileHover={{ x: -2, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative w-16 h-16 lg:w-20 lg:h-20 rounded-none overflow-hidden border-2 transition-all duration-200 flex-shrink-0 ${
                    activeIndex === i 
                      ? 'border-neutral-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' 
                      : 'border-neutral-300 hover:border-neutral-900 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  {item.type === 'image' ? (
                    <img 
                      src={item.url} 
                      alt={`${productName} ${i + 1}`} 
                      loading="lazy" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                      <Play size={16} className="lg:w-5 lg:h-5 text-white" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          )}

          {/* Main Image */}
          <div className="flex-1 min-w-0">
            <div
              ref={mainImageRef}
              className={`relative w-full aspect-[4/5] md:aspect-[4/5] lg:aspect-square max-h-[480px] sm:max-h-[520px] lg:max-h-[560px] xl:max-h-[600px] rounded-none overflow-hidden bg-neutral-100 border-2 border-neutral-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${
                activeItem?.type === 'image' ? 'cursor-zoom-in' : ''
              }`}
              onClick={() => activeItem?.type === 'image' && openLightbox(activeIndex)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              {/* Badges */}
              {isFlashSale && discount > 0 && (
                <span className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 bg-neutral-900 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-none border border-neutral-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  -{Math.round(discount)}% OFF
                </span>
              )}

              {/* Zoom/Expand Hint */}
              {activeItem?.type === 'image' && (
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 hidden sm:flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-sm rounded-none border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 size={14} className="sm:w-[18px] sm:h-[18px] text-neutral-700" />
                  </div>
                </div>
              )}

              {/* Main Image with Zoom */}
              {activeItem?.type === 'image' && (
                <motion.div
                  className="w-full h-full"
                  animate={isZoomed ? { scale: 1.5 } : { scale: 1 }}
                  style={isZoomed ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : {}}
                  transition={{ duration: 0.2 }}
                >
                  <img
                    src={activeItem.url}
                    alt={productName}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              )}

              {/* Video */}
              {activeItem?.type === 'video' && (
                <div className="w-full h-full bg-neutral-900">
                  {renderVideo(activeItem)}
                </div>
              )}

              {/* Navigation Arrows */}
              {items.length > 1 && (
                <>
                  <button
                    onClick={e => { e.stopPropagation(); goPrev(); }}
                    className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 bg-white border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none flex items-center justify-center hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={16} className="sm:w-5 sm:h-5" strokeWidth={2} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); goNext(); }}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 bg-white border-2 border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none flex items-center justify-center hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                    aria-label="Next image"
                  >
                    <ChevronRight size={16} className="sm:w-5 sm:h-5" strokeWidth={2} />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {items.length > 1 && (
                <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur-sm text-neutral-700 text-[10px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-md">
                  {activeIndex + 1} / {items.length}
                </div>
              )}
            </div>

            {/* Mobile Dots */}
            {items.length > 1 && (
              <div className="flex justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 md:hidden">
                {items.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`rounded-full transition-all duration-300 ${
                      activeIndex === i 
                        ? 'w-5 sm:w-6 h-1.5 sm:h-2 bg-neutral-900' 
                        : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-neutral-300 hover:bg-neutral-400'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Mobile Thumbnail Strip */}
            {items.length > 1 && (
              <div className="flex gap-1.5 sm:gap-2 mt-3 sm:mt-4 overflow-x-auto pb-2 md:hidden scrollbar-hide">
                {items.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-none overflow-hidden border-2 transition-all ${
                      activeIndex === i 
                        ? 'border-neutral-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                        : 'border-neutral-300 hover:border-neutral-900'
                    }`}
                  >
                    {item.type === 'image' ? (
                      <img src={item.url} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                        <Play size={12} className="sm:w-3.5 sm:h-3.5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close Button */}
            <button
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              onClick={() => setLightboxOpen(false)}
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>

            {/* Counter */}
            <div className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 text-white/70 text-xs sm:text-sm font-medium tabular-nums">
              {lightboxIndex + 1} / {imageItems.length}
            </div>

            {/* Navigation */}
            {imageItems.length > 1 && (
              <>
                <button
                  className="absolute left-2 sm:left-4 z-10 w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                  onClick={e => { e.stopPropagation(); lightboxPrev(); }}
                >
                  <ChevronLeft size={20} className="sm:w-7 sm:h-7" />
                </button>
                <button
                  className="absolute right-2 sm:right-4 z-10 w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                  onClick={e => { e.stopPropagation(); lightboxNext(); }}
                >
                  <ChevronRight size={20} className="sm:w-7 sm:h-7" />
                </button>
              </>
            )}

            {/* Image */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-[90vw] sm:max-w-4xl max-h-[75vh] sm:max-h-[85vh]"
              onClick={e => e.stopPropagation()}
            >
              {imageItems[lightboxIndex] && (
                <img
                  src={imageItems[lightboxIndex].url}
                  alt={`${productName} ${lightboxIndex + 1}`}
                  className="w-full h-full object-contain"
                />
              )}
            </motion.div>

            {/* Thumbnails */}
            {imageItems.length > 1 && (
              <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 max-w-[90vw] sm:max-w-lg overflow-x-auto px-2 sm:px-4">
                {imageItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={e => { e.stopPropagation(); setLightboxIndex(i); }}
                    className={`w-10 h-10 sm:w-14 sm:h-14 flex-shrink-0 rounded-md sm:rounded-lg overflow-hidden border-2 transition-all ${
                      lightboxIndex === i 
                        ? 'border-white scale-105' 
                        : 'border-white/30 hover:border-white/60 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={item.url} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
