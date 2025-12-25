
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { Volume2, VolumeX, Sparkles, Star, Gift, Moon, Compass, Heart, Snowflake, Sun } from 'lucide-react';

// --- Enhanced Particle Engine for Celebration & Ambient Magic ---
const MagicCanvas = ({ mode }: { mode: 'ambient' | 'explosion' | 'off' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      x: number; y: number; size: number; speedX: number; speedY: number; color: string; life: number; decay: number;
      constructor(x: number, y: number, isExplosion = false) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * (isExplosion ? 4 : 2) + 1;
        this.speedX = isExplosion ? (Math.random() - 0.5) * 12 : (Math.random() - 0.5) * 1.5;
        this.speedY = isExplosion ? (Math.random() - 0.5) * 12 : (Math.random() - 0.5) * 1.5;
        const hue = isExplosion ? Math.random() * 60 + 10 : Math.random() * 40 + 180; // Gold/Red vs Blue/Teal
        this.color = `hsla(${hue}, 100%, 75%, ${Math.random()})`;
        this.life = 1;
        this.decay = isExplosion ? 0.015 : 0.005;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
      }
      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (mode !== 'off' && Math.random() > 0.85) {
        particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
      }

      particles = particles.filter(p => p.life > 0);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    if (mode === 'explosion') {
      for (let i = 0; i < 150; i++) {
        particles.push(new Particle(canvas.width / 2, canvas.height / 2, true));
      }
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [mode]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-30" />;
};

const TypewriterMessage = ({ text, onComplete, speed = 250 }: { text: string; onComplete?: () => void, speed?: number }) => {
  const [displayedWords, setDisplayedWords] = useState<string[]>([]);
  const words = useMemo(() => text.split(/(\s+)/), [text]);
  const indexRef = useRef(0);

  useEffect(() => {
  if (indexRef.current < words.length) {
    const current = words[indexRef.current];
    const delay = current.trim() === '' ? 0 : speed;

    const timer = setTimeout(() => {
      setDisplayedWords(prev => [...prev, current]);
      indexRef.current += 1;
    }, delay);

    return () => clearTimeout(timer);
  } else if (onComplete) {
    onComplete();
  }
}, [displayedWords, words, speed, onComplete]);


  return (
    <div className="text-2xl md:text-4xl font-serif text-emerald-950 leading-relaxed text-center">
      {displayedWords.map((word, i) => (
        <span key={i} className="inline-block mr-2 animate-word-pop">
          {word}
        </span>
      ))}
    </div>
  );
};

const App = () => {
  const [stage, setStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [charge, setCharge] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chargeInterval = useRef<number | null>(null);

  const nextStage = () => {
    if (stage === 0) {
      setIsPlaying(true);
      if (audioRef.current) {
  audioRef.current.muted = false;
  audioRef.current.volume = 0.6;
  audioRef.current.play().catch(() => {});
}

    }
    setStage(prev => prev + 1);
  };

  const handleHoldStart = () => {
    chargeInterval.current = window.setInterval(() => {
      setCharge(prev => {
        if (prev >= 100) {
          clearInterval(chargeInterval.current!);
          nextStage();
          return 100;
        }
        return prev + 2;
      });
    }, 30);
  };

  const handleHoldEnd = () => {
    if (charge < 100) {
      clearInterval(chargeInterval.current!);
      setCharge(0);
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
  audioRef.current.muted = false;
  audioRef.current.volume = 0.5;
  audioRef.current.currentTime = 0;
  audioRef.current.play().catch(console.error);
}
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#020617] flex items-center justify-center text-white select-none">
      {/* Dynamic Background Layer */}
      <div 
        className="absolute inset-0 transition-all duration-[3000ms] ease-in-out bg-cover bg-center opacity-40 scale-110"
        style={{ 
          backgroundImage: stage < 2 
            ? 'url("https://images.unsplash.com/photo-1482608110091-c955737483dd?auto=format&fit=crop&q=80&w=2000")' 
            : 'url("https://images.unsplash.com/photo-1511268011861-691ed210aae8?auto=format&fit=crop&q=80&w=2000")' 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617]/40" />
      </div>

      {/* Sparkles & Magic */}
      <MagicCanvas mode={celebrate ? 'explosion' : stage > 0 ? 'ambient' : 'off'} />

      <audio
  ref={audioRef}
  loop
  preload="auto"
  playsInline
  src="/song.mp3"
/>


      
      <button onClick={toggleAudio} className="fixed top-8 right-8 z-50 p-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/20 transition-all shadow-2xl">
        {isPlaying ? <Volume2 size={20} className="text-emerald-200" /> : <VolumeX size={20} className="text-rose-300" />}
      </button>

      {/* Content Container */}
      <div className="relative z-40 w-full max-w-4xl px-6">
        
        {/* ACT 0: THE UNFREEZING */}
        {stage === 0 && (
          <div className="flex flex-col items-center space-y-12 animate-fade-in text-center">
            <div className="relative group">
              <div 
                className="absolute inset-0 bg-cyan-400/30 blur-[60px] animate-pulse rounded-full" 
                style={{ transform: `scale(${1 + charge/100})` }}
              />
              <button 
                onMouseDown={handleHoldStart}
                onMouseUp={handleHoldEnd}
                onTouchStart={handleHoldStart}
                onTouchEnd={handleHoldEnd}
                className="relative w-32 h-32 flex items-center justify-center bg-white/5 rounded-full border-2 border-white/20 hover:border-white/40 transition-all"
              >
                <div 
                  className="absolute inset-0 bg-cyan-500/40 rounded-full transition-all duration-75"
                  style={{ clipPath: `inset(${100 - charge}% 0 0 0)` }}
                />
                <Snowflake size={48} className={`text-cyan-100 transition-transform ${charge > 0 ? 'rotate-180' : ''}`} />
              </button>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-light tracking-[0.4em] uppercase text-cyan-200/80">Hold to Thaw</h2>
              <p className="font-serif text-3xl italic text-white/60">A special warmth is waiting...</p>
            </div>
          </div>
        )}

        {/* ACT 1: THE REASSURANCE (EXAM CHEERING) */}
        {stage === 1 && (
          <div className="flex flex-col items-center space-y-8 animate-pop-in text-center bg-white/5 p-12 rounded-[3rem] backdrop-blur-md border border-white/10 shadow-2xl">
            <Sun className="text-amber-200 animate-spin-slow" size={56} />
            <div className="space-y-6">
              <h3 className="text-4xl font-serif text-amber-100">Listen to me, Tarnija.</h3>
              <p className="text-xl md:text-2xl font-light leading-relaxed max-w-lg opacity-90">
                One exam does not define your magic. You are far more capable, brilliant, and resilient than any piece of paper could ever measure. 
              </p>
              <div className="pt-4 italic text-emerald-300 font-serif text-xl">
                "Winter is just a season; your strength is eternal."
              </div>
            </div>
            <button onClick={nextStage} className="mt-8 px-12 py-4 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full text-sm tracking-widest uppercase font-bold transition-all hover:scale-105">
              Let's Celebrate You
            </button>
          </div>
        )}

        {/* ACT 2: THE MAIN WISH */}
        {stage === 2 && (
          <div className="bg-[#fefce8]/95 backdrop-blur-2xl rounded-[3rem] p-12 md:p-20 shadow-[0_0_80px_rgba(252,211,77,0.2)] border border-amber-900/10 animate-pop-in relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-amber-900/5"><Sparkles size={80} /></div>
            <div className="absolute bottom-0 left-0 p-8 text-emerald-900/5"><Heart size={80} /></div>
            
            <h2 className="text-emerald-900 text-center text-sm tracking-[0.5em] uppercase font-bold mb-10 opacity-60">Heartfelt Greeting</h2>
            
            <TypewriterMessage 
              text="MERRY CHRISTMAS, TARNIJA! May your holiday be as calm as a snowy forest and as bright as a winter star. You bring so much peace and light into the world. May this season wrap you in warmth and wonder."
              onComplete={() => setTimeout(nextStage, 2500)}
            />
            
            <div className="mt-12 flex justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-900/20" />
              <div className="w-8 h-px bg-emerald-900/20 self-center" />
              <div className="w-2 h-2 rounded-full bg-emerald-900/20" />
            </div>
          </div>
        )}

        {/* ACT 3: THE GIFT (SURPRISE REVEAL) */}
        {stage === 3 && (
          <div className="flex flex-col items-center space-y-10 animate-fade-in">
            <h3 className="text-4xl font-serif italic text-white/90">A Gift of Resilience</h3>
            <button 
              onClick={() => { setCelebrate(true); nextStage(); }} 
              className="group relative p-16 bg-gradient-to-br from-rose-600 via-rose-500 to-amber-500 rounded-full shadow-[0_0_50px_rgba(225,29,72,0.4)] transition-all hover:scale-110 active:scale-95 border-8 border-white/20"
            >
              <div className="absolute -inset-8 bg-rose-500/30 blur-3xl group-hover:opacity-100 opacity-0 transition-opacity animate-pulse" />
              <Gift className="text-white group-hover:scale-110 transition-transform" size={96} />
            </button>
            <p className="text-white/60 tracking-[0.3em] uppercase text-xs animate-bounce">Tap to Unleash the Magic</p>
          </div>
        )}

        {/* ACT 4: THE CELEBRATION */}
        {stage === 4 && (
          <div className="text-center space-y-12 animate-pop-in">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-white to-amber-100 drop-shadow-2xl">
                Shine On.
              </h1>
              <p className="text-2xl md:text-3xl font-light text-amber-50/80 max-w-xl mx-auto leading-relaxed italic">
                You are a star that doesn't need an exam to prove its brightness, Tarnija.
              </p>
            </div>
            
            <div className="flex justify-center gap-8 items-center bg-white/5 py-8 px-12 rounded-full backdrop-blur-xl border border-white/10">
              <Heart className="text-rose-400 fill-rose-400 animate-pulse" size={32} />
              <Sparkles className="text-amber-200 animate-bounce" size={40} />
              <Heart className="text-rose-400 fill-rose-400 animate-pulse" size={32} />
            </div>

            <button onClick={() => { setCelebrate(false); setStage(0); setCharge(0); }} className="text-white/40 hover:text-white transition-colors text-xs tracking-[0.4em] uppercase underline decoration-white/20 underline-offset-[12px] block mx-auto">
              Relive the Journey
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Styles */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        @keyframes word-pop {
          0% { opacity: 0; transform: translateY(20px) scale(0.85); filter: blur(8px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        .animate-word-pop {
          animation: word-pop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes pop-in {
          0% { opacity: 0; transform: scale(0.8) translateY(60px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-pop-in {
          animation: pop-in 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 2.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
