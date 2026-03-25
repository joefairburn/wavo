import DynamicWaveformShowcase from "../components/DynamicWaveformShowcase";
import { siteConfig } from "../config/site";

export default function HomePage() {
  return (
    <main className="flex-grow flex flex-col items-center w-full">
      <section className="w-full max-w-[1400px] border-x-2 border-white/5 relative">
        <div
          className="absolute inset-0 z-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16 border-b-2 lg:border-b-0 lg:border-r-2 border-white/10 bg-background-dark/90 backdrop-blur-sm">
            <div className="inline-flex items-center gap-2 mb-6 border border-primary/30 bg-primary/5 px-3 py-1 w-fit">
              <span className="size-2 bg-primary rounded-full animate-pulse" />
              <span className="text-primary font-mono text-xs uppercase tracking-widest">
                v{siteConfig.version}
              </span>
            </div>

            <h2
              className="text-white text-6xl sm:text-7xl lg:text-8xl font-black leading-[0.85] tracking-tighter mb-8"
              style={{ textTransform: "none" }}
            >
              Waveforms for React
            </h2>

            <p className="text-white/60 text-lg sm:text-xl font-medium max-w-md mb-10 leading-relaxed">
              Performant, SVG-based visualization primitives for the modern web.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/docs/guides/installation"
                className="h-14 px-8 bg-primary text-black font-bold uppercase tracking-wider hover:bg-white transition-colors flex items-center justify-center gap-2"
              >
                <span>Install Package</span>
                <span className="material-symbols-outlined text-lg">download</span>
              </a>
              <a
                href="/docs"
                className="h-14 px-8 border-2 border-white/20 text-white font-bold uppercase tracking-wider hover:border-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
              >
                <span>Read the Docs</span>
                <span className="material-symbols-outlined text-lg">arrow_outward</span>
              </a>
            </div>
          </div>

          <div className="relative flex flex-col items-center justify-center p-8 lg:p-16 bg-[#111]">
            <div className="absolute top-8 left-8 size-4 border-l-2 border-t-2 border-white/30" />
            <div className="absolute top-8 right-8 size-4 border-r-2 border-t-2 border-white/30" />
            <div className="absolute bottom-8 left-8 size-4 border-l-2 border-b-2 border-white/30" />
            <div className="absolute bottom-8 right-8 size-4 border-r-2 border-b-2 border-white/30" />

            <div className="w-full max-w-md bg-[#1a1a1a] border-2 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col relative z-10">
              <div className="flex items-center justify-between px-4 py-3 bg-[#222] border-b border-white/5">
                <div className="flex gap-2 opacity-50">
                  <div className="size-3 rounded-full bg-white/20" />
                  <div className="size-3 rounded-full bg-white/20" />
                  <div className="size-3 rounded-full bg-white/20" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/30">
                  App.jsx
                </span>
                <div className="w-10" />
              </div>

              <div className="p-5 bg-[#161616] font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto">
                <div className="text-gray-500 mb-2">{"// 1. Import component"}</div>
                <div className="text-white/80 mb-4">
                  <span className="text-[#c678dd]">import</span> {"{ Waveform }"}{" "}
                  <span className="text-[#c678dd]">from</span>{" "}
                  <span className="text-[#98c379]">&apos;wavo&apos;</span>;
                </div>
                <div className="text-gray-500 mb-2">{"// 2. Render with data"}</div>
                <div className="text-white/80">
                  <span className="text-[#e5c07b]">return</span> (
                  <div className="pl-4">
                    &lt;<span className="text-[#e06c75]">Waveform</span>
                    <div className="pl-4">
                      <span className="text-[#d19a66]">data</span>={"{waveformData}"}
                    </div>
                    /&gt;
                  </div>
                  )
                </div>
              </div>

              <div className="bg-[#0a0a0a] border-y border-white/10 py-2 px-5 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-primary font-bold text-xs">&#10132;</span>
                  <code className="text-white/60 text-xs font-mono">
                    npm install <span className="text-white font-bold">wavo</span>
                  </code>
                </div>
                <span className="material-symbols-outlined text-white/20 text-sm group-hover:text-primary transition-colors">
                  content_copy
                </span>
              </div>

              <DynamicWaveformShowcase />
            </div>
          </div>
        </div>
      </section>

      <section className="w-full max-w-[1400px] border-x-2 border-b-2 border-white/10 bg-[#151515]">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x-2 divide-y-2 md:divide-y-0 divide-white/10">
          <div className="p-6 flex flex-col items-start gap-1 group hover:bg-white/5 transition-colors">
            <span className="text-white/40 font-mono text-xs uppercase tracking-widest">
              Bundle Size
            </span>
            <span className="text-white text-3xl font-black tracking-tighter group-hover:text-primary transition-colors">
              &lt; 2KB
            </span>
          </div>
          <div className="p-6 flex flex-col items-start gap-1 group hover:bg-white/5 transition-colors">
            <span className="text-white/40 font-mono text-xs uppercase tracking-widest">
              Dependencies
            </span>
            <span className="text-white text-3xl font-black tracking-tighter group-hover:text-primary transition-colors">
              ZERO
            </span>
          </div>
          <div className="p-6 flex flex-col items-start gap-1 group hover:bg-white/5 transition-colors">
            <span className="text-white/40 font-mono text-xs uppercase tracking-widest">
              Render Engine
            </span>
            <span className="text-white text-3xl font-black tracking-tighter group-hover:text-primary transition-colors">
              SVG
            </span>
          </div>
          <div className="p-6 flex flex-col items-start gap-1 group hover:bg-white/5 transition-colors">
            <span className="text-white/40 font-mono text-xs uppercase tracking-widest">
              License
            </span>
            <span className="text-white text-3xl font-black tracking-tighter group-hover:text-primary transition-colors">
              MIT
            </span>
          </div>
        </div>
      </section>

      <footer className="w-full bg-black border-t-2 border-white/20 pt-20 pb-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
            <div>
              <h2 className="text-white text-[15vw] md:text-[8rem] font-black uppercase leading-[0.8] tracking-tighter text-outline hover:text-white transition-colors duration-500 cursor-default">
                WAVO
              </h2>
            </div>
            <div className="flex flex-col gap-4 text-right">
              <a
                href="/docs"
                className="text-white text-2xl font-bold uppercase hover:text-primary transition-colors"
              >
                Documentation
              </a>
              <a
                href={siteConfig.github}
                className="text-white text-2xl font-bold uppercase hover:text-primary transition-colors"
              >
                GitHub Repo
              </a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 text-white/40 text-sm font-mono uppercase gap-4">
            <p>
              &copy; {new Date().getFullYear()} {siteConfig.name}
            </p>
            <p>MIT License</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

export const getConfig = async () => {
  return {
    render: "static",
  } as const;
};
