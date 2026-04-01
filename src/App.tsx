import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { motion } from 'motion/react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
const startDate = new Date('2022-11-30T00:00:00Z');

const labs = [
  {
    name: "OpenAI (GPT)",
    color: "bg-emerald-500",
    textColor: "text-emerald-400",
    releases: [
      { name: "GPT-3.5", date: "2022-11-30" },
      { name: "GPT-4", date: "2023-03-14" },
      { name: "GPT-4 Turbo", date: "2023-11-06" },
      { name: "GPT-4o", date: "2024-05-13" },
      { name: "o1", date: "2024-12-05" },
      { name: "o3", date: "2025-04-16" },
      { name: "GPT-5", date: "2025-08-07" },
      { name: "GPT-5.1", date: "2025-11-12" },
      { name: "GPT-5.2", date: "2025-12-11" },
      { name: "GPT-5.3", date: "2026-02-05" },
      { name: "GPT-5.4", date: "2026-03-05" },
    ]
  },
  {
    name: "Anthropic (Claude)",
    color: "bg-amber-500",
    textColor: "text-amber-400",
    releases: [
      { name: "Claude 1", date: "2023-03-14" },
      { name: "Claude 2", date: "2023-07-11" },
      { name: "Claude 3", date: "2024-03-04" },
      { name: "Claude 3.5", date: "2024-06-20" },
      { name: "Claude 3.7", date: "2025-02-24" },
      { name: "Claude 4", date: "2025-05-22" },
      { name: "Claude 4.5 Sonnet", date: "2025-09-29" },
      { name: "Claude 4.5 Opus", date: "2025-11-24" },
      { name: "Claude 4.6 Sonnet", date: "2026-02-17" },
      { name: "Claude 4.6 Opus", date: "2026-02-05" },
    ]
  },
  {
    name: "Google (Gemini)",
    color: "bg-blue-500",
    textColor: "text-blue-400",
    releases: [
      { name: "Gemini 1.0", date: "2023-12-06" },
      { name: "Gemini 1.5", date: "2024-02-15" },
      { name: "Gemini 2.0", date: "2025-02-05" },
      { name: "Gemini 2.5", date: "2025-03-25" },
      { name: "Gemini 3.0 Pro", date: "2025-11-18" },
      { name: "Gemini 3.1 Pro (Preview)", date: "2026-02-19" },
      { name: "Gemini 3.1 Flash-Image", date: "2026-02-26" },
      { name: "Gemini 3.1 Flash-Lite", date: "2026-03-03" },
    ]
  },
  {
    name: "xAI (Grok)",
    color: "bg-zinc-100",
    textColor: "text-zinc-300",
    releases: [
      { name: "Grok 1", date: "2023-11-04" },
      { name: "Grok 1.5", date: "2024-03-28" },
      { name: "Grok 2", date: "2024-08-13" },
      { name: "Grok 3", date: "2025-02-17" },
      { name: "Grok 4", date: "2025-07-09" },
      { name: "Grok 4.1", date: "2025-11-17" },
      { name: "Grok 4.20", date: "2026-02-17" },
    ]
  }
];

const processedLabs = labs.map(lab => {
  const processedReleases = lab.releases.map((r, index) => {
    const releaseDate = new Date(`${r.date}T00:00:00Z`);
    const globalDay = Math.round((releaseDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let gap = 0;
    if (index > 0) {
      const prevDate = new Date(`${lab.releases[index - 1].date}T00:00:00Z`);
      gap = Math.round((releaseDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    }
    
    return { ...r, globalDay, gap };
  });
  
  const startDay = processedReleases.length > 0 ? processedReleases[0].globalDay : 0;
  
  return { ...lab, startDay, releases: processedReleases };
});

const MAX_DAYS = 1260;

// Generate month and year ticks
const monthTicks: { days: number; label: string }[] = [];
const yearTicks: { days: number; label: number }[] = [];

let currDate = new Date('2022-12-01T00:00:00Z');
const endDate = new Date(startDate.getTime() + MAX_DAYS * 24 * 60 * 60 * 1000);

while (currDate <= endDate) {
  const daysSinceStart = (currDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  if (currDate.getUTCMonth() === 0) {
    yearTicks.push({ days: daysSinceStart, label: currDate.getUTCFullYear() });
  } else {
    monthTicks.push({ days: daysSinceStart, label: currDate.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }) });
  }
  currDate.setUTCMonth(currDate.getUTCMonth() + 1);
}

export default function App() {
  const [zoom, setZoom] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  
  const handleZoomChange = (updater: (z: number) => number) => {
    setZoom(prevZoom => {
      const newZoom = updater(prevZoom);
      if (newZoom === prevZoom) return prevZoom;
      
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        // Calculate the ratio of the center of the viewport relative to the total scrollable width
        const centerRatio = (container.scrollLeft + container.clientWidth / 2) / container.scrollWidth;
        
        // Use requestAnimationFrame to wait for the render with the new zoom
        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            const newContainer = scrollContainerRef.current;
            newContainer.scrollLeft = centerRatio * newContainer.scrollWidth - newContainer.clientWidth / 2;
          }
        });
      }
      return newZoom;
    });
  };

  const handleZoomIn = () => handleZoomChange(z => Math.min(z + 0.5, 4));
  const handleZoomOut = () => handleZoomChange(z => Math.max(z - 0.5, 0.5));
  const handleReset = () => handleZoomChange(() => 1);

  // Scroll to the end on initial load
  useEffect(() => {
    if (isFirstRender.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollLeft = container.scrollWidth;
      isFirstRender.current = false;
    }
  }, []);

  // Calculate current date position
  const today = new Date();
  const currentGlobalDay = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8 md:p-12 font-sans selection:bg-zinc-800">
      <div className="max-w-[1400px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">AI Model Release Timeline</h1>
            <p className="text-zinc-400 max-w-2xl leading-relaxed">
              The pace of innovation across major AI labs, aligned chronologically by release date. 
              The timeline shows the absolute progression while highlighting the days between each significant model release.
            </p>
          </div>
          
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-zinc-900/80 p-1.5 rounded-lg border border-zinc-800/50 backdrop-blur-md shadow-lg">
            <button onClick={handleZoomOut} className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors" title="Zoom Out">
              <ZoomOut size={18} />
            </button>
            <div className="w-14 text-center font-mono text-sm text-zinc-300">
              {Math.round(zoom * 100)}%
            </div>
            <button onClick={handleZoomIn} className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors" title="Zoom In">
              <ZoomIn size={18} />
            </button>
            <div className="w-px h-6 bg-zinc-800 mx-1" />
            <button onClick={handleReset} className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors" title="Reset Zoom">
              <RotateCcw size={18} />
            </button>
          </div>
        </motion.div>
        
        <div ref={scrollContainerRef} className="relative overflow-x-auto pb-32 custom-scrollbar">
          <div 
            className="relative mt-20"
            style={{ minWidth: `${Math.max(1000, 2200 * zoom)}px` }}
          >
            
            {/* X-axis background lines */}
            <div className="absolute top-0 bottom-0 left-[180px] right-0 pointer-events-none">
              {/* Month Lines */}
              {monthTicks.map(tick => (
                <div 
                  key={`m-${tick.days}`} 
                  className="absolute top-0 bottom-0 border-l border-zinc-800/50" 
                  style={{ left: `${(tick.days / MAX_DAYS) * 100}%` }}
                >
                  <div className="absolute -top-6 -translate-x-1/2 text-[10px] font-medium text-zinc-500 bg-zinc-950/80 px-1 rounded">
                    {tick.label}
                  </div>
                </div>
              ))}

              {/* Year Lines */}
              {yearTicks.map(tick => (
                <div 
                  key={`y-${tick.label}`} 
                  className="absolute top-0 bottom-0 border-l-2 border-zinc-500/60 z-0" 
                  style={{ left: `${(tick.days / MAX_DAYS) * 100}%` }}
                >
                  <div className="absolute -top-10 -translate-x-1/2 text-sm font-bold text-zinc-200 bg-zinc-950/90 px-2 py-0.5 rounded border border-zinc-800/50 shadow-sm">
                    {tick.label}
                  </div>
                </div>
              ))}

              {/* Today Line */}
              <div 
                className="absolute top-0 bottom-0 border-l-[3px] border-zinc-300/80 z-20" 
                style={{ left: `${(currentGlobalDay / MAX_DAYS) * 100}%` }}
              >
                <div className="absolute -top-12 -translate-x-1/2 text-sm font-bold text-zinc-950 bg-zinc-200 px-3 py-1 rounded shadow-[0_0_15px_rgba(228,228,231,0.3)] whitespace-nowrap">
                  Today
                </div>
              </div>
            </div>

            {/* Rows */}
            <div className="relative z-10 flex flex-col gap-28 pt-8">
              {processedLabs.map((lab, i) => (
                <div key={lab.name} className="relative flex items-center h-12">
                  
                  {/* Sticky Lab Name */}
                  <div className="w-[180px] shrink-0 sticky left-0 z-20 bg-zinc-950/90 backdrop-blur-md py-2 pl-3 flex items-center pr-4">
                    <div className={`w-2.5 h-2.5 rounded-full ${lab.color} mr-3 shadow-[0_0_8px_currentColor] opacity-80`} />
                    <span className="font-medium text-sm text-zinc-200 tracking-wide">{lab.name}</span>
                  </div>
                  
                  {/* Track */}
                  <div className="flex-1 relative h-full">
                    {/* Base line */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[1px] bg-zinc-800/30" />
                    
                    {/* Connections and Nodes */}
                    {lab.releases.map((release, j) => {
                      const prevRelease = j > 0 ? lab.releases[j - 1] : null;
                      const leftPercent = (release.globalDay / MAX_DAYS) * 100;
                      const prevLeftPercent = prevRelease ? (prevRelease.globalDay / MAX_DAYS) * 100 : (lab.startDay / MAX_DAYS) * 100;
                      const widthPercent = leftPercent - prevLeftPercent;
                      
                      return (
                        <React.Fragment key={release.name}>
                          {/* Connection Line */}
                          {prevRelease && (
                            <motion.div 
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ duration: 0.8, delay: i * 0.15 + j * 0.1, ease: "easeOut" }}
                              className={`absolute top-1/2 -translate-y-1/2 h-[2px] ${lab.color} origin-left opacity-50`}
                              style={{ left: `${prevLeftPercent}%`, width: `${widthPercent}%` }}
                            >
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.4, delay: i * 0.15 + j * 0.1 + 0.4 }}
                                className="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] font-mono text-zinc-400 bg-zinc-950/80 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm"
                              >
                                {release.gap}d
                              </motion.div>
                            </motion.div>
                          )}
                          
                          {/* Node */}
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4, delay: i * 0.15 + j * 0.1 + (prevRelease ? 0.3 : 0), type: "spring" }}
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center group cursor-default z-30"
                            style={{ left: `${leftPercent}%` }}
                          >
                            <div className={`w-3 h-3 rounded-full border-2 border-zinc-950 ${lab.color} z-10 relative group-hover:scale-150 transition-transform duration-300`} />
                            
                            <div className={`absolute -top-3 left-3 origin-bottom-left -rotate-45 whitespace-nowrap text-xs font-medium tracking-wide ${lab.textColor} group-hover:text-white transition-colors duration-300 bg-zinc-950/90 backdrop-blur-md px-2 py-1 rounded-md border border-zinc-800/50 shadow-xl`}>
                              {release.name}
                            </div>

                            {/* Tooltip */}
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
                              <div className="bg-zinc-800 text-zinc-200 text-[10px] font-mono px-2 py-1 rounded border border-zinc-700 shadow-lg whitespace-nowrap">
                                {new Date(`${release.date}T00:00:00Z`).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                            </div>
                          </motion.div>
                        </React.Fragment>
                      );
                    })}

                    {/* Dashed line to Today */}
                    {lab.releases.length > 0 && currentGlobalDay > lab.releases[lab.releases.length - 1].globalDay && (
                      <>
                        <motion.div 
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.8, delay: i * 0.15 + lab.releases.length * 0.1, ease: "easeOut" }}
                          className={`absolute top-1/2 -translate-y-1/2 border-t-2 border-dashed ${lab.color} origin-left opacity-40`}
                          style={{ 
                            left: `${(lab.releases[lab.releases.length - 1].globalDay / MAX_DAYS) * 100}%`, 
                            width: `${((currentGlobalDay - lab.releases[lab.releases.length - 1].globalDay) / MAX_DAYS) * 100}%` 
                          }}
                        />
                        
                        {/* Days since last release label */}
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: i * 0.15 + lab.releases.length * 0.1 + 0.4 }}
                          className={`absolute top-1/2 -translate-y-1/2 flex items-center pl-3 ${lab.textColor} font-mono text-xs font-medium z-30`}
                          style={{ left: `${(currentGlobalDay / MAX_DAYS) * 100}%` }}
                        >
                          <span className="bg-zinc-950/90 backdrop-blur-md px-2 py-1 rounded border border-zinc-800/50 shadow-sm whitespace-nowrap">
                            +{Math.floor(currentGlobalDay - lab.releases[lab.releases.length - 1].globalDay)}d
                          </span>
                        </motion.div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
