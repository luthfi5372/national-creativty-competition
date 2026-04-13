"use client";

import { useEffect, useState, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function AudioEngine() {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const droneOscRef = useRef<OscillatorNode | null>(null);
  const droneGainRef = useRef<GainNode | null>(null);

  const initAudio = () => {
    if (audioCtxRef.current) return;
    
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    audioCtxRef.current = ctx;

    // Create a low drone sound
    const droneOsc = ctx.createOscillator();
    const droneGain = ctx.createGain();

    droneOsc.type = "sine";
    droneOsc.frequency.setValueAtTime(45, ctx.currentTime); // Low frequency
    
    droneGain.gain.setValueAtTime(0, ctx.currentTime); // Start mute
    
    droneOsc.connect(droneGain);
    droneGain.connect(ctx.destination);
    
    droneOsc.start();

    droneOscRef.current = droneOsc;
    droneGainRef.current = droneGain;

    // Fade in
    droneGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 3);

    setAudioEnabled(true);
  };

  const toggleAudio = () => {
    if (!audioCtxRef.current) {
      initAudio();
      return;
    }

    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
      setAudioEnabled(true);
    } else {
      audioCtxRef.current.suspend();
      setAudioEnabled(false);
    }
  };

  // Add click listener everywhere for "glass clink"
  useEffect(() => {
    if (!audioEnabled || !audioCtxRef.current) return;

    const playClink = () => {
      const ctx = audioCtxRef.current;
      if (!ctx || ctx.state !== "running") return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "sine";
      osc.frequency.setValueAtTime(800 + Math.random() * 400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.1);

      filter.type = "highpass";
      filter.frequency.value = 1000;

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    };

    const handleClick = () => playClink();
    
    // We only playclink on some elements. Actually we can do it on any click.
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [audioEnabled]);

  return (
    <button
      onClick={toggleAudio}
      className={`fixed bottom-6 left-6 z-50 w-12 h-12 flex items-center justify-center rounded-2xl glass-panel transition-all duration-300 hover:scale-110 ${
        audioEnabled ? "glow-cyan" : ""
      }`}
      aria-label="Toggle Audio"
    >
      {audioEnabled ? (
        <Volume2 size={20} className="text-cyan-accent" />
      ) : (
        <VolumeX size={20} className="text-foreground/40" />
      )}
    </button>
  );
}
