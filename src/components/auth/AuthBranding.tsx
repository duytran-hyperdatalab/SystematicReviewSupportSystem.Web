import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { useNavigate } from "react-router";
import { FiArrowLeft } from "react-icons/fi";
import SystemSignature from "../logo/SystemSignature";

const AuthBranding: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const nodesRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Initial State Setup
      gsap.set(textRef.current, { opacity: 0, scale: 0.9, y: 20 });
      gsap.set(".slr-node", { opacity: 0, scale: 0 });
      gsap.set(".slr-line", { opacity: 0, scaleX: 0, transformOrigin: "left center" });
      gsap.set(".slr-card", { opacity: 0, y: 20 });
      
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // 2. Main Entrance Sequence
      tl.to(textRef.current, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 1.2,
      })
      .to(".slr-node", {
        opacity: 0.6,
        scale: 1,
        duration: 0.8,
        stagger: 0.1,
      }, "-=0.6")
      .to(".slr-line", {
        opacity: 0.3,
        scaleX: 1,
        duration: 1.0,
        stagger: 0.05,
      }, "-=0.8")
      .to(".slr-card", {
        opacity: 0.5,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
      }, "-=0.8");

      // 3. Ambient Animations (Looping)
      
      // Gentle floating for nodes
      gsap.to(".slr-node-float", {
        y: "-=15",
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: {
          amount: 2,
          from: "random"
        }
      });

      // Pulsing effect for the "core" nodes
      gsap.to(".slr-node-pulse", {
        boxShadow: "0 0 20px 5px rgba(255, 255, 255, 0.2)",
        scale: 1.1,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Slow rotation for the abstract filtering ring
      gsap.to(".slr-ring", {
        rotation: 360,
        duration: 60,
        repeat: -1,
        ease: "none",
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={containerRef}
      className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center bg-brand-900 overflow-hidden text-white"
    >
      {/* Background Gradient & overlaid texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 z-0" />
      
      {/* Abstract Background Shapes (Process Visualization) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        
        {/* Top Right: Exploration/Searching Nodes */}
        <div ref={nodesRef} className="absolute top-[15%] right-[10%] w-64 h-64">
           {/* Random scattered nodes representing search results */}
           <div className="slr-node slr-node-float absolute top-0 right-10 w-3 h-3 rounded-full bg-brand-300/40" />
           <div className="slr-node slr-node-float absolute top-10 right-0 w-2 h-2 rounded-full bg-brand-200/30" />
           <div className="slr-node slr-node-float absolute top-20 right-20 w-4 h-4 rounded-full bg-brand-400/50" />
           <div className="slr-node slr-node-float absolute bottom-10 right-12 w-2.5 h-2.5 rounded-full bg-white/20" />
           <div className="slr-node slr-node-float absolute top-1/2 left-10 w-3 h-3 rounded-full bg-brand-300/40" />
           
           {/* Connecting lines */}
           <div className="slr-line absolute top-[6px] right-[46px] w-24 h-[1px] bg-brand-400/20 rotate-45 transform-origin-left" />
           <div className="slr-line absolute top-[45px] right-[8px] w-16 h-[1px] bg-brand-400/20 rotate-[120deg]" />
        </div>

        {/* Bottom Left: Synthesis/Cards */}
        <div className="absolute bottom-[15%] left-[10%] w-56 h-56">
           {/* Stacked abstract cards representing extracted data */}
           <div className="slr-card absolute bottom-0 left-0 w-32 h-20 bg-white/5 border border-white/10 rounded-lg transform -rotate-6 backdrop-blur-sm" />
           <div className="slr-card absolute bottom-4 left-4 w-32 h-20 bg-white/10 border border-white/20 rounded-lg transform -rotate-3 backdrop-blur-md" />
           <div className="slr-card absolute bottom-8 left-8 w-32 h-20 bg-white/15 border border-white/25 rounded-lg transform rotate-0 backdrop-blur-lg flex items-center justify-center">
              <div className="w-16 h-1 bg-white/40 rounded-full" />
           </div>
        </div>

        {/* Center Background: Filtering Ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-brand-700/30 slr-ring opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full border border-brand-600/20 slr-ring opacity-40 animation-delay-2000" />
        
      </div>

      {/* Back Button (Top Left) */}
      <button 
        onClick={() => navigate("/")}
        className="absolute top-8 left-8 z-50 p-3 bg-white/5 hover:bg-white/20 backdrop-blur-sm rounded-full text-white/70 hover:text-white transition-all duration-300 border border-white/10 hover:border-white/30 group"
        aria-label="Back to Home"
      >
        <FiArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform duration-300" />
      </button>

      {/* Main Content (Foreground) */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Central visual anchor */}
        <div className="mb-8 relative">
           <div className="slr-node slr-node-pulse w-4 h-4 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/20 slr-node scale-0" />
           <div ref={linesRef} className="absolute top-2 left-1/2 -translate-x-1/2 h-16 w-[1px] bg-gradient-to-b from-transparent via-white/40 to-transparent -translate-y-full" />
        </div>

        <SystemSignature ref={textRef} />
        
        <div className="slr-line h-[1px] w-24 bg-brand-400/50 mt-2 mb-8" />
        
        <p className="slr-node text-brand-100/80 text-sm font-medium tracking-widest uppercase opacity-0 text-center max-w-xs leading-relaxed">
          Systematic Literature Review<br/>Simplified
        </p>
      </div>

      {/* Footer / Disclaimer */}
      <div className="absolute bottom-8 text-brand-400/40 text-xs tracking-wider">
        SLR Support System &copy; 2026
      </div>
    </div>
  );
};

export default AuthBranding;
