"use client";

import { useEffect, useRef } from "react";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260329_050842_be71947f-f16e-4a14-810c-06e83d23ddb5.mp4";

export function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const opacityRef = useRef(0);
  const fadingOutRef = useRef(false);

  const setVideoOpacity = (value: number) => {
    const nextOpacity = Math.max(0, Math.min(1, value));
    opacityRef.current = nextOpacity;

    if (videoRef.current) {
      videoRef.current.style.opacity = String(nextOpacity);
    }
  };

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const cancelCurrentFade = () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };

    const runFade = (targetOpacity: number, duration = 250) => {
      cancelCurrentFade();
      const startOpacity = opacityRef.current;
      const startTime = performance.now();

      const animate = (timestamp: number) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const nextOpacity = startOpacity + (targetOpacity - startOpacity) * progress;
        setVideoOpacity(nextOpacity);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          animationFrameRef.current = null;
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const handleLoadedData = async () => {
      try {
        await video.play();
      } catch {
        return;
      }

      fadingOutRef.current = false;
      runFade(1);
    };

    const handleTimeUpdate = () => {
      const remainingTime = video.duration - video.currentTime;

      if (Number.isFinite(remainingTime) && remainingTime <= 0.55 && !fadingOutRef.current) {
        fadingOutRef.current = true;
        runFade(0);
      }
    };

    const handleEnded = () => {
      cancelCurrentFade();
      setVideoOpacity(0);
      fadingOutRef.current = false;

      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }

      resetTimeoutRef.current = setTimeout(async () => {
        if (!videoRef.current) {
          return;
        }

        videoRef.current.currentTime = 0;

        try {
          await videoRef.current.play();
          runFade(1);
        } catch {
          return;
        }
      }, 100);
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      cancelCurrentFade();

      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }

      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <video
        ref={videoRef}
        src={VIDEO_URL}
        muted
        playsInline
        preload="auto"
        className="absolute left-1/2 top-0 h-[115%] w-[115%] -translate-x-1/2 object-cover object-top"
        style={{ opacity: 0 }}
      />
      <div className="absolute inset-0 bg-white/72" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.22)_0%,rgba(248,248,244,0.86)_100%)]" />
    </div>
  );
}
