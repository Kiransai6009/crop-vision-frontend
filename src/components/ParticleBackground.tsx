import { useEffect, useState, memo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

const particleOptions: ISourceOptions = {
  fullScreen: false,
  background: { color: { value: "transparent" } },
  fpsLimit: 60,
  interactivity: {
    events: {
      onHover: { enable: true, mode: "repulse" },
      onClick:  { enable: true, mode: "push"    },
    },
    modes: {
      repulse: { distance: 120, duration: 0.4 },
      push:    { quantity: 6               },
    },
  },
  particles: {
    color: { value: ["#00FF87", "#60EFFF", "#00e67a", "#40ffcc"] },
    links: { enable: false },
    move: {
      enable:    true,
      direction: "top",
      speed:     { min: 0.3, max: 0.9 },
      outModes:  { default: "out" },
      random:    true,
    },
    number: { value: 40, density: { enable: false } },
    opacity: {
      value:     { min: 0.2, max: 0.8 },
      animation: { enable: true, speed: 0.8, sync: false },
    },
    shape: { type: "circle" },
    size: {
      value:     { min: 1, max: 4 },
      animation: { enable: true, speed: 2, sync: false },
    },
  },
  detectRetina: true,
};

const ParticleBackground = memo(() => {
  const [engineReady, setEngineReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setEngineReady(true));
  }, []);

  if (!engineReady) return null;

  return (
    <Particles
      id="crop-particles"
      options={particleOptions}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
});

ParticleBackground.displayName = "ParticleBackground";
export default ParticleBackground;
