// Original, synthesized comic clap + rubbery boing. No downloads or audio assets.
export function createSlapAudio() {
  let context: AudioContext | null = null;
  let noise: AudioBuffer | null = null;

  return {
    prepare() {
      try {
        const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;
        context ??= new AudioContextClass();
        // Called directly from F/click/tap so iOS and desktop autoplay rules allow it.
        if (context.state !== "running") void context.resume().catch(() => {});
      } catch { /* Audio may be unavailable; the animation must still work. */ }
    },
    play() {
      if (!context || context.state !== "running") return;
      try {
        const now = context.currentTime;
        if (!noise) {
          noise = context.createBuffer(1, Math.ceil(context.sampleRate * 0.1), context.sampleRate);
          const samples = noise.getChannelData(0);
          for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
        }
        const clap = context.createBufferSource();
        const filter = context.createBiquadFilter();
        const clapGain = context.createGain();
        clap.buffer = noise;
        filter.type = "bandpass";
        filter.frequency.value = 1400;
        filter.Q.value = 0.7;
        clapGain.gain.setValueAtTime(0.001, now);
        clapGain.gain.linearRampToValueAtTime(0.3, now + 0.003);
        clapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        clap.connect(filter).connect(clapGain).connect(context.destination);
        clap.onended = () => { clap.disconnect(); filter.disconnect(); clapGain.disconnect(); };
        clap.start(now);

        const boing = context.createOscillator();
        const boingGain = context.createGain();
        const vibrato = context.createOscillator();
        const vibratoGain = context.createGain();
        boing.type = "triangle";
        boing.frequency.setValueAtTime(620, now);
        boing.frequency.exponentialRampToValueAtTime(105, now + 0.34);
        vibrato.frequency.value = 22;
        vibratoGain.gain.value = 85;
        vibrato.connect(vibratoGain).connect(boing.detune);
        boingGain.gain.setValueAtTime(0.001, now);
        boingGain.gain.linearRampToValueAtTime(0.1, now + 0.015);
        boingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
        boing.connect(boingGain).connect(context.destination);
        boing.onended = () => { boing.disconnect(); boingGain.disconnect(); vibrato.disconnect(); vibratoGain.disconnect(); };
        vibrato.start(now);
        boing.start(now);
        vibrato.stop(now + 0.42);
        boing.stop(now + 0.42);
      } catch { /* A suspended/closed audio device must never interrupt play. */ }
    },
    dispose() {
      if (context && context.state !== "closed") void context.close().catch(() => {});
      context = null;
      noise = null;
    },
  };
}
