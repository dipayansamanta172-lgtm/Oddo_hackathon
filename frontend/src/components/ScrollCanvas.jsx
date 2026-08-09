import React, { useEffect, useRef, useState } from 'react';
import { frames } from './frameList';

export default function ScrollCanvas({ containerRef, isDark }) {
  const canvasRef = useRef(null);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const imagesRef = useRef([]);

  const totalFrames = frames.length;
  const progressRef = useRef(0);
  const frameRequestRef = useRef(null);

  // Preload images dynamically based on the frameList
  useEffect(() => {
    let count = 0;
    const loadedImages = [];

    for (let i = 0; i < totalFrames; i++) {
      const img = new Image();
      img.src = frames[i];
      
      img.onload = () => {
        count++;
        setLoadedCount(count);
        if (count === totalFrames) {
          setIsLoaded(true);
        }
      };

      img.onerror = () => {
        count++;
        setLoadedCount(count);
        if (count === totalFrames) {
          setIsLoaded(true);
        }
      };

      loadedImages.push(img);
    }
    imagesRef.current = loadedImages;
  }, [totalFrames]);

  // Canvas drawing handler
  const drawFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const images = imagesRef.current;
    if (images.length === 0) return;

    const progress = progressRef.current;
    
    // Map progress [0, 1] to frame index [0, totalFrames - 1]
    const frameIndex = Math.min(
      totalFrames - 1,
      Math.max(0, Math.floor(progress * (totalFrames - 1)))
    );

    const img = images[frameIndex];
    if (img && img.complete) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Keep aspect ratio covering viewport (object-fit: cover logic)
      const imgRatio = img.width / img.height;
      const canvasRatio = canvas.width / canvas.height;
      let drawWidth, drawHeight, drawX, drawY;

      if (imgRatio > canvasRatio) {
        drawHeight = canvas.height;
        drawWidth = canvas.height * imgRatio;
        drawX = (canvas.width - drawWidth) / 2;
        drawY = 0;
      } else {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
        drawX = 0;
        drawY = (canvas.height - drawHeight) / 2;
      }

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    }
  };

  // Scroll listener tracking container boundary scroll progress
  useEffect(() => {
    if (!isLoaded) return;

    const handleScroll = () => {
      const container = containerRef?.current;
      if (!container) return;

      const containerHeight = container.offsetHeight;
      const windowHeight = window.innerHeight;
      const totalScrollableDistance = containerHeight - windowHeight;

      if (totalScrollableDistance <= 0) return;

      const scrollY = window.scrollY || window.pageYOffset;
      const currentScroll = Math.max(0, scrollY - container.offsetTop);
      const progress = Math.min(1, Math.max(0, currentScroll / totalScrollableDistance));
      
      progressRef.current = progress;

      // Fade out canvas during outro to transition smoothly into the animated ambient background
      if (canvasRef.current) {
        if (progress >= 0.90) {
          const fadeProgress = (progress - 0.90) / 0.06; // maps 0.90-0.96 to 0-1
          canvasRef.current.style.opacity = Math.max(0, 1 - fadeProgress).toString();
        } else {
          canvasRef.current.style.opacity = "1";
        }
      }

      // Throttle canvas draw sweeps inside window animation frames
      if (frameRequestRef.current) {
        cancelAnimationFrame(frameRequestRef.current);
      }
      frameRequestRef.current = requestAnimationFrame(drawFrame);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    
    // Perform initial draw
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (frameRequestRef.current) {
        cancelAnimationFrame(frameRequestRef.current);
      }
    };
  }, [isLoaded, containerRef, totalFrames]);

  // Adjust canvas dimensions and redraw on window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawFrame();
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [isLoaded]);

  return (
    <div className="sticky top-0 w-full h-screen overflow-hidden bg-black flex items-center justify-center">
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-[#0D0D0D] text-white space-y-4">
          <span className="text-2xl font-black tracking-widest font-display">REXPO</span>
          <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-dark-accent transition-all duration-100" 
              style={{ width: `${(loadedCount / totalFrames) * 100}%` }}
            />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-mutedGrey">
            Preloading Experience... {Math.round((loadedCount / totalFrames) * 100)}%
          </span>
        </div>
      )}
      
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
