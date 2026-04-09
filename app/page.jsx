"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export default function Home() {
  const [isTracking, setIsTracking] = useState(true);
  const [status, setStatus] = useState("Tracking location...");

  const watchIdRef = useRef(null);
  const alertTimeoutRef = useRef(null);

  const triggerVoiceAlert = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(
      "You are approaching a crossing. Please be cautious.",
    );

    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;

    synth.speak(utterance);
  }, []);

  const triggerVibration = useCallback((pattern) => {
    if (typeof navigator === "undefined") return;
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern ?? 300);
    }
  }, []);

  const startTracking = () => {
    if (isTracking) return;
    setIsTracking(true);
    setStatus("Tracking location...");
  };

  const stopTracking = () => {
    if (!isTracking) return;
    setIsTracking(false);
    setStatus("Idle");
  };

  useEffect(() => {
    if (!isTracking) {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
        alertTimeoutRef.current = null;
      }

      if (
        typeof navigator !== "undefined" &&
        "geolocation" in navigator &&
        watchIdRef.current !== null
      ) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      return;
    }

    triggerVibration(150);

    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      try {
        const id = navigator.geolocation.watchPosition(
          () => {},
          () => {},
          { enableHighAccuracy: true },
        );
        watchIdRef.current = id;
      } catch {}
    }

    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
    }

    alertTimeoutRef.current = setTimeout(() => {
      setStatus("Simulated crossing detected");
      triggerVoiceAlert();
      triggerVibration([300, 150, 300]);
    }, 5000);

    return () => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
        alertTimeoutRef.current = null;
      }

      if (
        typeof navigator !== "undefined" &&
        "geolocation" in navigator &&
        watchIdRef.current !== null
      ) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isTracking, triggerVoiceAlert, triggerVibration]);

  const handleToggle = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  const buttonLabel = isTracking ? "Stop Assistance" : "Start Assistance";

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-black px-6 text-white">
      <section
        className="w-full max-w-md"
        aria-label="Smart Crossing Assistant"
      >
        <header className="mb-10">
          <h1 className="text-center text-3xl font-semibold tracking-tight">
            Smart Crossing Assistant
          </h1>
        </header>

        <div className="flex flex-col items-center gap-8">
          <button
            type="button"
            onClick={handleToggle}
            aria-label={buttonLabel}
            className="w-full rounded-2xl bg-emerald-500 px-6 py-6 text-2xl font-semibold text-black shadow-lg transition-transform focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.98] active:bg-emerald-400"
          >
            {buttonLabel}
          </button>

          <p
            className="w-full text-center text-2xl font-medium"
            aria-live="polite"
            aria-atomic="true"
          >
            {status}
          </p>
        </div>
      </section>
    </main>
  );
}
