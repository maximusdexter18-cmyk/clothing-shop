"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollVideoProps {
  videoSrc: string;
  // Place your poster image at: /public/fallback.jpg
  posterSrc?: string; 
}

export default function ScrollVideo({ videoSrc, posterSrc = "/fallback.jpg" }: ScrollVideoProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;

    if (!video || !section) return;

    // Requirement #3: Wait for loadedmetadata before setting up ScrollTrigger
    const handleLoadedMetadata = () => {
      // Initialize GSAP Timeline with ScrollTrigger
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: true, // Ties progress to scroll
          pin: true,   // Pins the section while scrolling
          // Requirement #4: Native scroll sync via gsap.ticker
          // (If you add Lenis later, add: scrollerProxy: lenis, or use gsap.ticker as shown below)
        },
      });

      // Requirement #3: Map scroll progress linearly to video duration
      tl.to(video, {
        currentTime: video.duration,
        ease: "none", // Linear mapping
        duration: 1,
      });

      // Sets up the ticker for smooth scrolling (native fallback)
      gsap.ticker.add(() => {
        ScrollTrigger.update();
      });

      setIsReady(true);
    };

    // Wait for the metadata to load
    if (video.readyState >= 1) {
      handleLoadedMetadata();
    } else {
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      gsap.ticker.remove(() => ScrollTrigger.update());
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [videoSrc]);

  return (
    <div ref={sectionRef} className="relative h-screen w-full overflow-hidden bg-black">
      {/* Requirement #5: Add a poster attribute and note */}
      <video
        ref={videoRef}
        src={videoSrc}
        poster={posterSrc} 
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover"
      />
    </div>
  );
}