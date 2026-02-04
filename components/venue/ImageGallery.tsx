"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  alt: string;
  className?: string;
}

export function ImageGallery({ images, alt, className = "" }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance for a swipe to be registered
  const minSwipeDistance = 50;

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
  };

  // Touch handlers for swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrev();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFullscreen) {
        if (e.key === "ArrowLeft") goToPrev();
        if (e.key === "ArrowRight") goToNext();
        if (e.key === "Escape") setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Prevent body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  if (images.length === 0) {
    return (
      <div className={`aspect-[16/10] bg-slate flex items-center justify-center ${className}`}>
        <span className="text-muted">No images available</span>
      </div>
    );
  }

  return (
    <>
      {/* Main Gallery */}
      <div 
        ref={containerRef}
        className={`relative overflow-hidden rounded-lg ${className}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Main Image */}
        <div className="aspect-[16/10] relative">
          <img
            src={images[currentIndex]}
            alt={`${alt} - Image ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-deep-black/60 via-transparent to-transparent" />

          {/* Navigation Arrows - Desktop */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-deep-black/80 items-center justify-center text-cream hover:bg-masters-green hover:text-deep-black transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToNext}
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-deep-black/80 items-center justify-center text-cream hover:bg-masters-green hover:text-deep-black transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Fullscreen button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-deep-black/80 flex items-center justify-center text-cream hover:bg-masters-green hover:text-deep-black transition-colors"
            aria-label="View fullscreen"
          >
            <Expand className="w-5 h-5" />
          </button>

          {/* Image counter */}
          <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-deep-black/80 text-cream text-sm font-mono">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {/* Dot Indicators - Touch friendly */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToIndex(index)}
                className={`
                  w-3 h-3 rounded-full transition-all duration-200
                  ${index === currentIndex 
                    ? "bg-masters-green w-6" 
                    : "bg-cream/50 hover:bg-cream/80"
                  }
                `}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Swipe hint - Mobile only */}
        {images.length > 1 && (
          <div className="md:hidden absolute bottom-12 left-1/2 -translate-x-1/2 text-cream/60 text-xs animate-pulse">
            Swipe to browse
          </div>
        )}
      </div>

      {/* Thumbnail Strip - Desktop */}
      {images.length > 1 && (
        <div className="hidden md:flex gap-2 mt-4 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={`
                flex-shrink-0 w-20 h-14 rounded-md overflow-hidden 
                border-2 transition-all duration-200
                ${index === currentIndex 
                  ? "border-masters-green" 
                  : "border-transparent hover:border-cream/50"
                }
              `}
            >
              <img
                src={image}
                alt={`${alt} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-50 bg-deep-black/95 flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-charcoal flex items-center justify-center text-cream hover:bg-masters-green hover:text-deep-black transition-colors z-10"
            aria-label="Close fullscreen"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-charcoal flex items-center justify-center text-cream hover:bg-masters-green hover:text-deep-black transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-charcoal flex items-center justify-center text-cream hover:bg-masters-green hover:text-deep-black transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image */}
          <div 
            className="max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <img
              src={images[currentIndex]}
              alt={`${alt} - Image ${currentIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain"
            />
          </div>

          {/* Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-charcoal text-cream font-mono">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); goToIndex(index); }}
                  className={`
                    w-3 h-3 rounded-full transition-all duration-200
                    ${index === currentIndex 
                      ? "bg-masters-green w-6" 
                      : "bg-cream/50 hover:bg-cream/80"
                    }
                  `}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

// Single hero image with optional expand
export function HeroImage({ 
  src, 
  alt, 
  className = "" 
}: { 
  src: string | null; 
  alt: string; 
  className?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!src) {
    return (
      <div className={`aspect-[16/10] bg-slate flex items-center justify-center rounded-lg ${className}`}>
        <span className="text-muted">No image available</span>
      </div>
    );
  }

  return (
    <>
      <div className={`relative aspect-[16/10] rounded-lg overflow-hidden ${className}`}>
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
        <button
          onClick={() => setIsExpanded(true)}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-deep-black/80 flex items-center justify-center text-cream hover:bg-masters-green hover:text-deep-black transition-colors"
          aria-label="View fullscreen"
        >
          <Expand className="w-5 h-5" />
        </button>
      </div>

      {isExpanded && (
        <div 
          className="fixed inset-0 z-50 bg-deep-black/95 flex items-center justify-center cursor-zoom-out"
          onClick={() => setIsExpanded(false)}
        >
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-charcoal flex items-center justify-center text-cream hover:bg-masters-green hover:text-deep-black transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={src}
            alt={alt}
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />
        </div>
      )}
    </>
  );
}
