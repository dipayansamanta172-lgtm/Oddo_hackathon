import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  TrendingUp, 
  Users, 
  Zap, 
  CheckCircle2, 
  Shield, 
  Database, 
  Cpu, 
  Layers, 
  Calendar, 
  Truck, 
  Lock, 
  Terminal, 
  BarChart3, 
  Globe, 
  Activity, 
  Check, 
  ArrowRight,
  Server,
  Workflow,
  Search,
  Sliders,
  Bell
} from 'lucide-react';

// Custom Count Up component for stats widgets
function CountUp({ value, duration = 1.2, suffix = "", trigger }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!trigger) {
      setCount(0);
      return;
    }

    let start = 0;
    const end = value;
    const totalFrames = duration * 60;
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const easeOutQuad = progress * (2 - progress);
      const current = easeOutQuad * end;

      setCount(current);

      if (frame >= totalFrames) {
        setCount(end);
        clearInterval(timer);
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [value, duration, trigger]);

  // Handle integers vs decimals
  const displayVal = Number.isInteger(value) ? Math.floor(count).toLocaleString() : count.toFixed(1);
  return <span>{displayVal}{suffix}</span>;
}

// Live typing cursor effect for mock dashboards
function TypedText({ text, trigger }) {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    if (!trigger) {
      setDisplayedText("");
      return;
    }
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
      }
    }, 150);
    return () => clearInterval(interval);
  }, [text, trigger]);

  return (
    <span className="font-mono text-[10px]">
      {displayedText}
      <span className="animate-pulse">|</span>
    </span>
  );
}

// Animated progress bar that fills based on trigger state
function ProgressBar({ value, trigger }) {
  return (
    <div className="w-20 md:w-28 h-1.5 bg-black/10 dark:bg-white/5 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-dark-accent origin-left"
        initial={{ scaleX: 0 }}
        animate={trigger ? { scaleX: 1 } : { scaleX: 0 }}
        style={{ width: `${value}%` }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </div>
  );
}

// SVG Line Chart that draws itself on entrance
function SVGLineChart({ trigger }) {
  const path = "M 10 75 Q 60 20, 110 55 T 210 25 T 310 70 T 400 35";
  
  return (
    <svg viewBox="0 0 400 90" className="w-full h-24 overflow-visible">
      {/* Horizontal background lines */}
      <line x1="0" y1="20" x2="400" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      <line x1="0" y1="45" x2="400" y2="45" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      <line x1="0" y1="70" x2="400" y2="70" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      
      {/* Animated Path */}
      <motion.path
        d={path}
        fill="none"
        stroke="#557373"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={trigger ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
      />

      {/* Glow path behind */}
      <motion.path
        d={path}
        fill="none"
        stroke="#557373"
        strokeWidth="6"
        strokeLinecap="round"
        className="opacity-15 blur-[4px]"
        initial={{ pathLength: 0 }}
        animate={trigger ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
      />
    </svg>
  );
}

// Deposit processing audit timeline mockup
function DepositTimeline({ trigger }) {
  const [step, setStep] = useState(1);
  
  useEffect(() => {
    if (!trigger) {
      setStep(1);
      return;
    }
    const timer1 = setTimeout(() => setStep(2), 1000);
    const timer2 = setTimeout(() => setStep(3), 2000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [trigger]);

  return (
    <div className="space-y-3.5 pt-2">
      <div className="flex items-center space-x-3 text-[10px] md:text-xs">
        <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all duration-300 ${
          step >= 1 ? 'border-dark-accent bg-dark-accent/10 text-dark-accent' : 'border-borderGrey/10 text-mutedGrey'
        }`}>
          <Check size={10} />
        </div>
        <div className="flex-1 flex justify-between">
          <span className="font-semibold">Pre-Auth Capture</span>
          <span className="font-mono opacity-80">Secured via Stripe</span>
        </div>
      </div>

      <div className="flex items-center space-x-3 text-[10px] md:text-xs">
        <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all duration-300 ${
          step >= 2 ? 'border-dark-accent bg-dark-accent/10 text-dark-accent' : 'border-borderGrey/10 text-mutedGrey'
        }`}>
          {step >= 2 ? <Check size={10} /> : <div className="w-1.5 h-1.5 rounded-full bg-mutedGrey animate-pulse" />}
        </div>
        <div className="flex-1 flex justify-between">
          <span className="font-semibold">Gear Condition Review</span>
          <span className="font-mono text-dark-accent">
            {step === 1 ? 'Auditing...' : 'Verified OK'}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-3 text-[10px] md:text-xs">
        <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all duration-300 ${
          step >= 3 ? 'border-dark-accent bg-dark-accent/10 text-dark-accent' : 'border-borderGrey/10 text-mutedGrey'
        }`}>
          {step >= 3 ? <Check size={10} /> : step === 2 ? <div className="w-1.5 h-1.5 rounded-full bg-mutedGrey animate-pulse" /> : null}
        </div>
        <div className="flex-1 flex justify-between">
          <span className="font-semibold">Deposit Refund Release</span>
          <span className="font-mono text-dark-accent">
            {step < 3 ? 'Awaiting Hold Release' : 'Hold Released'}
          </span>
        </div>
      </div>
    </div>
  );
}

// Staggered activity feed log for reporting slides
function ActivityFeed({ trigger }) {
  const [visibleItems, setVisibleItems] = useState(0);
  
  useEffect(() => {
    if (!trigger) {
      setVisibleItems(0);
      return;
    }
    const t1 = setTimeout(() => setVisibleItems(1), 500);
    const t2 = setTimeout(() => setVisibleItems(2), 1100);
    const t3 = setTimeout(() => setVisibleItems(3), 1700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [trigger]);

  const items = [
    { id: 1, text: "Order #REX-1048 check-in approved", time: "Just Now" },
    { id: 2, text: "Deposit hold #DEP-301 auto-released", time: "2m ago" },
    { id: 3, text: "Warning: Low battery on device #B-201", time: "10m ago" }
  ];

  return (
    <div className="space-y-2 text-[10px]">
      {items.map((item, idx) => (
        <div 
          key={item.id} 
          className="flex justify-between items-center p-2 rounded bg-black/5 dark:bg-white/5 border border-borderGrey/5 transition-all duration-500"
          style={{
            opacity: visibleItems > idx ? 1 : 0,
            transform: visibleItems > idx ? 'translateY(0)' : 'translateY(8px)'
          }}
        >
          <span>{item.text}</span>
          <span className="text-mutedGrey font-mono text-[8px]">{item.time}</span>
        </div>
      ))}
    </div>
  );
}

// Slide Wrapper Component using Framer Motion scroll tracking
function SlideSection({ children, isDark, id, zIndex }) {
  const ref = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["80px", "0px"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8, 1], [0, 0.95, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.98, 1]);
  const blur = useTransform(scrollYProgress, [0, 1], ["blur(3px)", "blur(0px)"]);

  const borderCol = isDark ? 'border-white/5' : 'border-charcoal/5';
  
  // Solid gradient backgrounds to completely obscure the canvas/hero underneath
  const solidBgStyle = isDark
    ? { background: 'linear-gradient(to bottom, #0D0D0D 0%, #151515 100%)' }
    : { background: 'linear-gradient(to bottom, #F2EFEA 0%, #DFE5F3 100%)' };

  return (
    <div 
      ref={ref} 
      id={id}
      className={`sticky top-0 min-h-screen w-full flex items-center justify-center overflow-hidden border-t ${borderCol}`}
      style={{
        ...solidBgStyle,
        zIndex,
        isolation: 'isolate'
      }}
    >
      <motion.div 
        style={{ y, opacity, scale, filter: blur }}
        className="w-full max-w-7xl mx-auto px-6 py-20 flex flex-col justify-center relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
}

// 220vh Parent Container driving the Workflow sticky animation
function WorkflowSection({ isDark, zIndex }) {
  const containerRef = useRef(null);
  const cardRefs = useRef([]);
  const lineFillRef = useRef(null);
  const mobileLineFillRef = useRef(null);
  const glowRef = useRef(null);

  const [activeStep, setActiveStep] = useState(1);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const borderCol = isDark ? 'border-white/5' : 'border-charcoal/5';
  const cardBg = isDark ? 'bg-charcoal border-white/5' : 'bg-white border-charcoal/5';
  const subText = isDark ? 'text-mutedGrey' : 'text-slateDark/60';
  const textColor = isDark ? 'text-white' : 'text-charcoal';

  const stages = [
    {
      id: 1,
      title: "Product Booking",
      desc: "Client selects available assets, duration timeline, and secures reservation details.",
      icon: Calendar
    },
    {
      id: 2,
      title: "Rental Approval",
      desc: "System reviews inventory counts, runs check-lists, and captures pre-authorized deposits.",
      icon: CheckCircle2
    },
    {
      id: 3,
      title: "Pickup / Delivery",
      desc: "Depot operator executes checkout forms, audits gear parts, and dispatches assets.",
      icon: Truck
    },
    {
      id: 4,
      title: "Active Rental",
      desc: "Client tracks operational periods, requests extensions, and downloads invoice receipts.",
      icon: Clock
    },
    {
      id: 5,
      title: "Return & Deposit Settlement",
      desc: "Gear checks verify components damage-free, instantly releasing credit line locks.",
      icon: Lock
    }
  ];

  useEffect(() => {
    return scrollYProgress.on("change", (progress) => {
      let currentStep = 1;
      if (progress < 0.20) currentStep = 1;
      else if (progress >= 0.20 && progress < 0.40) currentStep = 2;
      else if (progress >= 0.40 && progress < 0.60) currentStep = 3;
      else if (progress >= 0.60 && progress < 0.80) currentStep = 4;
      else currentStep = 5;

      setActiveStep((prev) => (prev !== currentStep ? currentStep : prev));

      const linePercent = Math.min(100, Math.max(0, (progress - 0.10) / 0.70 * 100));
      if (lineFillRef.current) {
        lineFillRef.current.style.width = `${linePercent}%`;
      }
      if (mobileLineFillRef.current) {
        mobileLineFillRef.current.style.height = `${linePercent}%`;
      }

      stages.forEach((_, idx) => {
        const card = cardRefs.current[idx];
        if (!card) return;

        const start = idx * 0.18;
        const end = start + 0.14;
        const cardProgress = Math.min(1, Math.max(0, (progress - start) / (end - start)));
        
        const y = 35 * (1 - cardProgress);
        const opacity = cardProgress;
        const scale = 0.96 + 0.04 * cardProgress;
        const blur = 3 * (1 - cardProgress);

        card.style.transform = `translateY(${y}px) scale(${scale})`;
        card.style.opacity = opacity.toString();
        card.style.filter = blur > 0.1 ? `blur(${blur}px)` : 'none';
      });

      if (glowRef.current) {
        const glowOpacity = Math.min(0.12, Math.max(0, (progress - 0.85) / 0.10 * 0.12));
        glowRef.current.style.opacity = glowOpacity.toString();
      }
    });
  }, [scrollYProgress]);

  const solidBgStyle = isDark
    ? { background: 'linear-gradient(to bottom, #0D0D0D 0%, #151515 100%)' }
    : { background: 'linear-gradient(to bottom, #F2EFEA 0%, #DFE5F3 100%)' };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[220vh]"
    >
      {/* Sticky full-screen slide */}
      <div 
        className={`sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden border-t ${borderCol}`}
        style={{
          ...solidBgStyle,
          zIndex,
          isolation: 'isolate'
        }}
      >
        <div className="w-full max-w-7xl mx-auto px-6 py-20 flex flex-col justify-center space-y-16 relative z-10">
          
          <div className="text-center space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-dark-accent">Operational Lifecycle</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight uppercase">
              COMPLETE RENTAL WORKFLOW
            </h2>
            <p className={`text-sm ${subText} max-w-lg mx-auto`}>
              Follow the automated timeline from client reservation to return settlement.
            </p>
          </div>

          <div className="relative flex flex-col md:flex-row justify-between items-stretch gap-6 md:gap-4 py-8">
            <div className="hidden md:block absolute top-[44px] left-[10%] right-[10%] h-[2px] bg-borderGrey/10 z-0">
              <div 
                ref={lineFillRef}
                className="h-full bg-dark-accent origin-left transition-all duration-75"
                style={{ width: '0%' }}
              />
            </div>

            <div className="md:hidden absolute left-[40px] top-[10%] bottom-[10%] w-[2px] bg-borderGrey/10 z-0">
              <div 
                ref={mobileLineFillRef}
                className="w-full bg-dark-accent origin-top transition-all duration-75"
                style={{ height: '0%' }}
              />
            </div>

            {stages.map((stage, idx) => {
              const IconComp = stage.icon;
              const isStepActive = activeStep === stage.id;
              const isStepCompleted = activeStep > stage.id;

              const borderClass = isStepActive 
                ? "border-dark-accent shadow-[0_0_20px_rgba(85,115,115,0.18)] scale-[1.03] z-20" 
                : isStepCompleted
                  ? "border-dark-accent/40 opacity-80"
                  : "border-borderGrey/5 opacity-30 scale-95";

              const iconClass = isStepActive
                ? "text-dark-accent"
                : isStepCompleted
                  ? "text-dark-accent/60"
                  : "text-mutedGrey";

              const indicatorClass = isStepActive
                ? "bg-dark-accent text-white scale-110"
                : isStepCompleted
                  ? "bg-dark-accent/20 text-dark-accent"
                  : "bg-borderGrey/5 text-mutedGrey";

              return (
                <div
                  key={stage.id}
                  ref={(el) => (cardRefs.current[idx] = el)}
                  className={`flex-1 relative p-6 rounded-xl border ${cardBg} transition-all duration-500 ease-out flex flex-row md:flex-col items-start gap-4 md:gap-5 ${borderClass}`}
                  style={{
                    opacity: 0,
                    transform: 'translateY(35px) scale(0.96)',
                    filter: 'blur(3px)'
                  }}
                >
                  <div className="flex md:flex-col items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-500 ${indicatorClass}`}>
                      {stage.id}
                    </span>
                    <div className={`p-2.5 rounded-lg bg-black/5 dark:bg-white/5 border border-borderGrey/10 transition-colors duration-500 ${iconClass}`}>
                      <IconComp size={18} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className={`font-bold text-xs md:text-sm tracking-tight transition-colors duration-500 ${
                      isStepActive ? textColor : "text-mutedGrey"
                    }`}>
                      {stage.title}
                    </h4>
                    <p className={`text-[10px] md:text-[11px] leading-relaxed transition-colors duration-500 ${
                      isStepActive ? subText : "text-mutedGrey/40"
                    }`}>
                      {stage.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div 
          ref={glowRef}
          className="absolute inset-0 bg-dark-accent/10 blur-[120px] pointer-events-none z-0 transition-opacity duration-300"
          style={{ opacity: 0 }}
        />
      </div>
    </div>
  );
}

export default function StaticSections({ isDark }) {
  const textColor = isDark ? 'text-white' : 'text-charcoal';
  const subText = isDark ? 'text-mutedGrey' : 'text-slateDark/60';
  const borderCol = isDark ? 'border-white/5' : 'border-charcoal/5';
  const cardBg = isDark ? 'bg-charcoal border-white/5' : 'bg-white border-charcoal/5';

  // Refs for checking Intersection observer (in-view slide tracking)
  const invRef = useRef(null);
  const isInvInView = useInView(invRef, { once: false, amount: 0.4 });

  const secRef = useRef(null);
  const isSecInView = useInView(secRef, { once: false, amount: 0.4 });

  const repRef = useRef(null);
  const isRepInView = useInView(repRef, { once: false, amount: 0.4 });

  const admRef = useRef(null);
  const isAdmInView = useInView(admRef, { once: false, amount: 0.4 });

  // State for Accordion rows in "WHAT REXPO CAN DO"
  const [activeRow, setActiveRow] = useState(null);

  const accordionItems = [
    {
      id: 'ops',
      title: 'Rental Operations',
      desc: 'Centralize product booking, duration planning, returns processing, and analytics log entries instantly in one modular operations control panel.',
    },
    {
      id: 'inv',
      title: 'Inventory Management',
      desc: 'Track device availability, verification checklists, battery levels, cleaning updates, and structural damage metrics across multiple product depots.',
    },
    {
      id: 'cust',
      title: 'Customer Rentals',
      desc: 'Provide seamless customer account logins, order calendars, rental timeline extension requests, and instant invoice generation receipts.',
    },
    {
      id: 'pick',
      title: 'Pickup & Returns',
      desc: 'Settle returns, inspect hardware gear components, mark accessories checked, and update catalog inventory status automatically.',
    },
    {
      id: 'dep',
      title: 'Security Deposits',
      desc: 'Hold, track, and clear security deposits on returns. Automatically release credit back to client bank accounts instantly.',
    },
    {
      id: 'anal',
      title: 'Analytics',
      desc: 'Monitor equipment utilization rates, revenue distribution, active return metrics, and upcoming rental trends directly in a customizable widget panel.',
    }
  ];

  // Opaque gradient backgrounds
  const solidBgStyle = isDark
    ? { background: 'linear-gradient(to bottom, #0D0D0D 0%, #151515 100%)' }
    : { background: 'linear-gradient(to bottom, #F2EFEA 0%, #DFE5F3 100%)' };

  return (
    <div className="w-full relative">
      
      {/* SLIDE 1: WHAT REXPO CAN DO */}
      <SlideSection isDark={isDark} id="features" zIndex={21}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-dark-accent">Powerful. Simple. Centralized.</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none uppercase">
              WHAT REXPO <br />CAN DO
            </h2>
            <p className={`text-sm leading-relaxed max-w-md ${subText}`}>
              Everything you need to run your rental business efficiently and scale with confidence.
            </p>
          </div>

          <div className={`border-t ${borderCol} divide-y ${isDark ? 'divide-white/5' : 'divide-charcoal/5'}`}>
            {accordionItems.map((item) => (
              <div key={item.id} className="py-4">
                <button 
                  onClick={() => setActiveRow(activeRow === item.id ? null : item.id)}
                  className="w-full flex justify-between items-center text-left py-2 font-bold text-base md:text-lg focus:outline-none"
                >
                  <span>{item.title}</span>
                  {activeRow === item.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {activeRow === item.id && (
                  <div className={`mt-2 text-xs md:text-sm leading-relaxed ${subText}`}>
                    {item.desc}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </SlideSection>

      {/* SLIDE 2: COMPLETE RENTAL WORKFLOW (Scroll-driven Slide) */}
      <WorkflowSection isDark={isDark} zIndex={22} />

      {/* SLIDE 3: INVENTORY VISIBILITY (Redesigned Slide from Right) */}
      <div 
        ref={invRef} 
        id="inventory-monitoring"
        className={`sticky top-0 min-h-screen w-full flex items-center justify-center overflow-hidden border-t ${borderCol}`}
        style={{
          ...solidBgStyle,
          zIndex: 23,
          isolation: 'isolate'
        }}
      >
        {/* Technical Grid Overlay behind content */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.12]" 
          style={{
            backgroundImage: 'radial-gradient(rgba(85,115,115,0.2) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        <div className="w-full max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-10 gap-12 items-center relative z-10">
          {/* Left Column (40%) */}
          <div className="lg:col-span-4 space-y-6">
            <span className="text-[10px] uppercase font-bold tracking-widest text-dark-accent">Fleet Intelligence</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none uppercase">
              INVENTORY VISIBILITY
            </h2>
            <p className={`text-xs md:text-sm leading-relaxed ${subText}`}>
              Eliminate double-booking conflicts completely. Live inventory statuses let operators see checkout timelines, depot warehouses, and battery charge metrics across all depots.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-xs">
                <CheckCircle2 size={16} className="text-dark-accent shrink-0" />
                <span>Synchronized booking calendars</span>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <CheckCircle2 size={16} className="text-dark-accent shrink-0" />
                <span>Multi-depot status monitoring</span>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <CheckCircle2 size={16} className="text-dark-accent shrink-0" />
                <span>Automated logistics dispatch</span>
              </div>
            </div>
            <button className="bg-dark-accent hover:bg-dark-accent/90 text-white font-bold px-6 py-3 rounded-lg text-[10px] tracking-wider uppercase transition-all shadow-sm">
              Explore Catalog
            </button>
          </div>

          {/* Right Column (60%): Floating Dashboard Mockup */}
          <div className="lg:col-span-6 flex justify-center">
            <motion.div 
              initial={{ x: 120, opacity: 0 }}
              animate={isInvInView ? { x: 0, opacity: 1 } : { x: 120, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`w-full max-w-xl p-6 rounded-2xl border ${cardBg} shadow-2xl space-y-6 bg-black/10 dark:bg-charcoal/80 backdrop-blur-md`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center border-b border-borderGrey/10 pb-4 gap-4">
                <div className="flex items-center space-x-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-dark-accent animate-pulse" />
                  <span className="font-mono text-xs font-semibold tracking-wider">DEPOT MONITOR</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative flex items-center bg-black/10 dark:bg-white/5 border border-borderGrey/10 rounded-md px-2.5 py-1 text-[10px] w-36">
                    <Search size={10} className="text-mutedGrey mr-1.5" />
                    <TypedText text="camera" trigger={isInvInView} />
                  </div>
                  <div className="flex items-center bg-black/10 dark:bg-white/5 border border-borderGrey/10 rounded-md px-2.5 py-1 text-[10px] font-semibold">
                    <span>All Depots</span>
                    <ChevronDown size={10} className="ml-1 text-mutedGrey" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-mutedGrey tracking-wider border-b border-borderGrey/5 pb-2">
                  <span>Product Model</span>
                  <span>Availability / Stock</span>
                  <span>Status</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs p-3 rounded bg-black/5 dark:bg-white/5 border border-borderGrey/5">
                    <span className="font-semibold">Canon EOS R6</span>
                    <div className="flex items-center space-x-3">
                      <ProgressBar value={80} trigger={isInvInView} />
                      <span className="font-mono text-[10px] w-12 text-right">
                        {isInvInView ? <CountUp value={12} trigger={isInvInView} /> : '0'} / 15
                      </span>
                    </div>
                    <span className="text-[9px] bg-dark-accent/15 text-dark-accent px-2 py-0.5 rounded font-bold">Active</span>
                  </div>

                  <div className="flex justify-between items-center text-xs p-3 rounded bg-black/5 dark:bg-white/5 border border-borderGrey/5">
                    <span className="font-semibold">RED V-Raptor</span>
                    <div className="flex items-center space-x-3">
                      <ProgressBar value={40} trigger={isInvInView} />
                      <span className="font-mono text-[10px] w-12 text-right">
                        {isInvInView ? <CountUp value={2} trigger={isInvInView} /> : '0'} / 5
                      </span>
                    </div>
                    <span className="text-[9px] bg-dark-accent/15 text-dark-accent opacity-60 px-2 py-0.5 rounded font-bold">On Rent</span>
                  </div>

                  <div className="flex justify-between items-center text-xs p-3 rounded bg-black/5 dark:bg-white/5 border border-borderGrey/5">
                    <span className="font-semibold">Epson Pro 4K</span>
                    <div className="flex items-center space-x-3">
                      <ProgressBar value={100} trigger={isInvInView} />
                      <span className="font-mono text-[10px] w-12 text-right">
                        {isInvInView ? <CountUp value={8} trigger={isInvInView} /> : '0'} / 8
                      </span>
                    </div>
                    <span className="text-[9px] bg-dark-accent/15 text-dark-accent px-2 py-0.5 rounded font-bold">Ready</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* SLIDE 4: SECURITY DEPOSITS (Redesigned Slide from Left) */}
      <div 
        ref={secRef} 
        id="security-deposits"
        className={`sticky top-0 min-h-screen w-full flex items-center justify-center overflow-hidden border-t ${borderCol}`}
        style={{
          ...solidBgStyle,
          zIndex: 24,
          isolation: 'isolate'
        }}
      >
        {/* Soft Radial Lighting Overlay behind content */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none" 
          style={{
            background: 'radial-gradient(circle at 75% 25%, rgba(85,115,115,0.06) 0%, transparent 65%)'
          }}
        />

        <div className="w-full max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-10 gap-12 items-center relative z-10">
          {/* Left Column (40%) */}
          <div className="lg:col-span-4 space-y-6">
            <span className="text-[10px] uppercase font-bold tracking-widest text-dark-accent">Credit Line Security</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none uppercase">
              SECURITY DEPOSITS
            </h2>
            <p className={`text-xs md:text-sm leading-relaxed ${subText}`}>
              REXPO connects directly with Stripe to pre-authorize deposits at checkout. Liability bounds are audited automatically on return dispatches, releasing the credit hold instantly if no damage check-list discrepancies are found.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-xs">
                <CheckCircle2 size={16} className="text-dark-accent shrink-0" />
                <span>Encrypted pre-authorization logs</span>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <CheckCircle2 size={16} className="text-dark-accent shrink-0" />
                <span>Zero-jitter checklist confirmation</span>
              </div>
            </div>
            <button className="bg-dark-accent hover:bg-dark-accent/90 text-white font-bold px-6 py-3 rounded-lg text-[10px] tracking-wider uppercase transition-all shadow-sm">
              Settle Deposit
            </button>
          </div>

          {/* Right Column (60%): Payment Experience Mockup */}
          <div className="lg:col-span-6 flex justify-center">
            <motion.div 
              initial={{ x: -120, opacity: 0 }}
              animate={isSecInView ? { x: 0, opacity: 1 } : { x: -120, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`w-full max-w-md p-6 rounded-2xl border ${cardBg} shadow-2xl space-y-6 bg-black/10 dark:bg-charcoal/80 backdrop-blur-md`}
            >
              <div className="p-5 rounded-xl bg-gradient-to-br from-charcoal to-slateDark border border-white/10 text-white space-y-8 relative overflow-hidden">
                <div className="flex justify-between items-start z-10 relative">
                  <div className="space-y-1">
                    <span className="text-[7px] uppercase font-mono tracking-widest text-mutedGrey">Hold Amount</span>
                    <p className="text-xl font-mono font-black tracking-wider">
                      ₹{isSecInView ? <CountUp value={25000} trigger={isSecInView} /> : '0'}.00
                    </p>
                  </div>
                  <span className="font-display font-black tracking-widest text-xs">REXPO</span>
                </div>

                <div className="flex justify-between items-end z-10 relative">
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono tracking-widest">•••• •••• •••• 4028</p>
                    <span className="text-[8px] font-mono text-mutedGrey uppercase">Escrow Hold Secure</span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                    <Lock size={12} className="text-white/60" />
                  </div>
                </div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-dark-accent/15 blur-[40px] z-0 pointer-events-none" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-borderGrey/5 pb-2 text-[10px] uppercase font-bold text-mutedGrey tracking-wider">
                  <span>Hold Timeline</span>
                  <span className="text-dark-accent">Stripe Gateway</span>
                </div>
                <DepositTimeline trigger={isSecInView} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* SLIDE 5: ANALYTICS (Redesigned Scale-in Section) */}
      <div 
        ref={repRef} 
        id="rental-analytics"
        className={`sticky top-0 min-h-screen w-full flex items-center justify-center overflow-hidden border-t ${borderCol}`}
        style={{
          ...solidBgStyle,
          zIndex: 25,
          isolation: 'isolate'
        }}
      >
        {/* Blurred Analytics Lines Overlay behind content */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none" 
          style={{
            background: 'radial-gradient(circle at 25% 75%, rgba(85,115,115,0.06) 0%, transparent 65%)'
          }}
        />

        <div className="w-full max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-10 gap-12 items-center relative z-10">
          {/* Left Column (40%) */}
          <div className="lg:col-span-4 space-y-6">
            <span className="text-[10px] uppercase font-bold tracking-widest text-dark-accent">Data-Driven Operations</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none uppercase">
              REAL-TIME REPORTING
            </h2>
            <p className={`text-xs md:text-sm leading-relaxed ${subText}`}>
              Gain deep operational insights. Access fleet utilization rates, revenue distribution, active return metrics, and upcoming rental trends directly in a customizable widget panel.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-xs">
                <CheckCircle2 size={16} className="text-dark-accent shrink-0" />
                <span>Asset utilization distribution ratios</span>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <CheckCircle2 size={16} className="text-dark-accent shrink-0" />
                <span>Damage rate assessment reports</span>
              </div>
            </div>
            <button className="bg-dark-accent hover:bg-dark-accent/90 text-white font-bold px-6 py-3 rounded-lg text-[10px] tracking-wider uppercase transition-all shadow-sm">
              Generate Report
            </button>
          </div>

          {/* Right Column (60%): Live Analytics Dashboard */}
          <div className="lg:col-span-6 flex justify-center">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={isRepInView ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className={`w-full max-w-xl p-6 rounded-2xl border ${cardBg} shadow-2xl space-y-6 bg-black/10 dark:bg-charcoal/80 backdrop-blur-md`}
            >
              <div className="flex justify-between items-center border-b border-borderGrey/10 pb-4">
                <span className="font-mono text-xs font-semibold tracking-wider">REAL-TIME ANALYTICS</span>
                <span className="text-[8px] bg-dark-accent/15 text-dark-accent px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">Live Feed</span>
              </div>

              <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-borderGrey/10">
                <span className="text-[9px] uppercase font-bold text-mutedGrey tracking-wider block mb-2">Revenue Curves</span>
                <SVGLineChart trigger={isRepInView} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-borderGrey/10 space-y-1">
                    <span className="text-[8px] uppercase font-bold text-mutedGrey tracking-widest block">Fleet Utilization</span>
                    <p className="text-2xl font-black tracking-tight text-dark-accent">
                      {isRepInView ? <CountUp value={94.2} trigger={isRepInView} /> : '0.0'}%
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-borderGrey/10 space-y-1">
                    <span className="text-[8px] uppercase font-bold text-mutedGrey tracking-widest block">Active Operations Log</span>
                    <p className="text-2xl font-black tracking-tight text-dark-accent">
                      {isRepInView ? <CountUp value={1240} trigger={isRepInView} /> : '0'}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-borderGrey/10 space-y-3">
                  <span className="text-[8px] uppercase font-bold text-mutedGrey tracking-widest block border-b border-borderGrey/5 pb-1">Activity Feed</span>
                  <ActivityFeed trigger={isRepInView} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* SLIDE 8: ADMIN CONTROL CENTER (Redesigned Section from directions) */}
      <div 
        ref={admRef} 
        id="admin-dashboard"
        className={`sticky top-0 min-h-screen w-full flex items-center justify-center overflow-hidden border-t ${borderCol}`}
        style={{
          ...solidBgStyle,
          zIndex: 26,
          isolation: 'isolate'
        }}
      >
        {/* Technical Grid Overlay behind content */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.08]" 
          style={{
            backgroundImage: 'radial-gradient(rgba(85,115,115,0.2) 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px'
          }}
        />

        <div className="w-full max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-10 gap-12 items-center relative z-10">
          {/* Left Column (40%) */}
          <div className="lg:col-span-4 space-y-6">
            <span className="text-[10px] uppercase font-bold tracking-widest text-dark-accent">Depot Management</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none uppercase">
              ADMIN CONTROL CENTER
            </h2>
            <p className={`text-xs md:text-sm leading-relaxed ${subText}`}>
              Manage returns checkout, settle outstanding balances, verify equipment component checklists, track depot transfers, and evaluate operator audit histories.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-xs">
                <CheckCircle2 size={16} className="text-dark-accent shrink-0" />
                <span>Real-time returns settlement and auditing desks</span>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <CheckCircle2 size={16} className="text-dark-accent shrink-0" />
                <span>Automated checklist forms and accessory verifications</span>
              </div>
            </div>
            <button className="bg-dark-accent hover:bg-dark-accent/90 text-white font-bold px-6 py-3 rounded-lg text-[10px] tracking-wider uppercase transition-all shadow-sm">
              Open Control Center
            </button>
          </div>

          {/* Right Column (60%): Cards Assembled from Multi-directions */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
            
            {/* Card 1: Pending Approvals (Enters from Top) */}
            <motion.div 
              initial={{ y: -70, opacity: 0 }}
              animate={isAdmInView ? { y: 0, opacity: 1 } : { y: -70, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              className={`p-6 rounded-2xl border ${cardBg} shadow-xl bg-black/10 dark:bg-charcoal/80 backdrop-blur-md space-y-4`}
            >
              <div className="flex justify-between items-center border-b border-borderGrey/10 pb-2.5">
                <span className="font-mono text-[9px] uppercase tracking-wider text-mutedGrey">Approvals Queue</span>
                <span className="text-[8px] bg-dark-accent/15 text-dark-accent px-2 py-0.5 rounded font-bold uppercase tracking-wider">3 Pending</span>
              </div>
              
              <div className="space-y-2 text-[10px]">
                <div className="p-2.5 rounded bg-black/5 dark:bg-white/5 border border-borderGrey/10 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Red Cinema Kit</span>
                    <span className="text-mutedGrey font-mono text-[8px]">Depot A</span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="bg-dark-accent text-white px-3 py-1 rounded text-[8px] font-bold uppercase">Approve</button>
                    <button className="border border-borderGrey/10 text-mutedGrey px-3 py-1 rounded text-[8px] font-bold uppercase">Reject</button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Recent Alerts (Enters from Bottom) */}
            <motion.div 
              initial={{ y: 70, opacity: 0 }}
              animate={isAdmInView ? { y: 0, opacity: 1 } : { y: 70, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className={`p-6 rounded-2xl border ${cardBg} shadow-xl bg-black/10 dark:bg-charcoal/80 backdrop-blur-md space-y-4`}
            >
              <div className="flex justify-between items-center border-b border-borderGrey/10 pb-2.5">
                <span className="font-mono text-[9px] uppercase tracking-wider text-mutedGrey">Fulfillment Alerts</span>
                <Bell size={12} className="text-dark-accent animate-swing" />
              </div>
              
              <div className="space-y-2 text-[10px]">
                <div className="p-2.5 rounded bg-black/5 dark:bg-white/5 border border-borderGrey/10 flex items-center justify-between">
                  <span className="font-semibold">Checklist #REX-1048 Audit</span>
                  <span className="text-dark-accent font-semibold font-mono">2 Issues</span>
                </div>
                <div className="p-2.5 rounded bg-black/5 dark:bg-white/5 border border-borderGrey/10 flex items-center justify-between opacity-60">
                  <span>Battery levels #B-201</span>
                  <span className="text-mutedGrey font-mono">10% Charge</span>
                </div>
              </div>
            </motion.div>

            {/* Card 3: Operator Logs (Enters from Right, spanning full width on mobile) */}
            <motion.div 
              initial={{ x: 70, opacity: 0 }}
              animate={isAdmInView ? { x: 0, opacity: 1 } : { x: 70, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
              className={`sm:col-span-2 p-6 rounded-2xl border ${cardBg} shadow-xl bg-black/10 dark:bg-charcoal/80 backdrop-blur-md space-y-4`}
            >
              <div className="flex justify-between items-center border-b border-borderGrey/10 pb-2.5">
                <span className="font-mono text-[9px] uppercase tracking-wider text-mutedGrey">Operations Logs</span>
                <span className="font-mono text-[8px] text-dark-accent">Live Activity</span>
              </div>

              <div className="space-y-2.5 text-[10px]">
                <div className="flex justify-between p-2 rounded bg-black/5 dark:bg-white/5 border border-borderGrey/5">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-dark-accent"></div>
                    <span>Canon EOS R6 returns checklist verified</span>
                  </div>
                  <span className="text-mutedGrey font-mono text-[8px]">Just Now</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-black/5 dark:bg-white/5 border border-borderGrey/5 opacity-70">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-dark-accent opacity-50"></div>
                    <span>Stripe pre-authorization held for RED Kit</span>
                  </div>
                  <span className="text-mutedGrey font-mono text-[8px]">15m ago</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* SLIDE 9: ENTERPRISE READY & POWERFUL INTEGRATIONS */}
      <SlideSection isDark={isDark} id="integrations" zIndex={27}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <span className="text-[10px] uppercase font-bold tracking-widest text-dark-accent">Unified Ecosystem</span>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none uppercase">
              ENTERPRISE INTEGRATIONS
            </h2>
            <p className={`text-sm leading-relaxed ${subText}`}>
              Connect REXPO with the payment gateways, dispatches, analytics, and CRM platforms your operations require. Sync customer profiles and billing histories.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-black/5 dark:bg-white/5 border border-borderGrey/10 rounded-lg text-center text-xs font-semibold">
                Stripe Payments
              </div>
              <div className="p-3 bg-black/5 dark:bg-white/5 border border-borderGrey/10 rounded-lg text-center text-xs font-semibold">
                Twilio SMS
              </div>
              <div className="p-3 bg-black/5 dark:bg-white/5 border border-borderGrey/10 rounded-lg text-center text-xs font-semibold">
                QuickBooks API
              </div>
              <div className="p-3 bg-black/5 dark:bg-white/5 border border-borderGrey/10 rounded-lg text-center text-xs font-semibold">
                Salesforce Sync
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={`p-6 rounded-xl border ${cardBg} flex items-start space-x-4`}>
              <Server size={20} className="text-dark-accent shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Low-Latency Webhooks</h4>
                <p className={`text-xs mt-1 leading-relaxed ${subText}`}>
                  Dispatch real-time webhooks on checkout dispatches, checklist approvals, returns, and extensions.
                </p>
              </div>
            </div>

            <div className={`p-6 rounded-xl border ${cardBg} flex items-start space-x-4`}>
              <Terminal size={20} className="text-dark-accent shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Flexible API Gateway</h4>
                <p className={`text-xs mt-1 leading-relaxed ${subText}`}>
                  Query depot inventory levels, active checkout timelines, damage registers, and customer stats.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SlideSection>

      {/* SLIDE 10: WIDE FINAL CTA & FOOTER */}
      <SlideSection isDark={isDark} id="cta-footer" zIndex={28}>
        <div className="space-y-16 w-full">
          <div className={`p-8 md:p-12 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-6 ${cardBg}`}>
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-2xl font-black tracking-tight uppercase">Ready to simplify your rental operations?</h3>
              <p className={`text-xs ${subText}`}>Create your free developer account today and integrate within minutes.</p>
            </div>
            <div className="flex space-x-3 shrink-0">
              <button className="bg-dark-accent hover:bg-dark-accent/90 text-white font-bold px-6 py-3 rounded-lg text-xs tracking-wider uppercase transition-all shadow-sm">
                Start Renting Now
              </button>
              <button className={`border font-bold px-6 py-3 rounded-lg text-xs tracking-wider uppercase transition-all ${
                isDark ? 'border-white/10 hover:bg-white/5' : 'border-charcoal/10 hover:bg-black/5'
              }`}>
                Explore Platform
              </button>
            </div>
          </div>

          <footer id="about" className={`pt-12 border-t ${borderCol} grid grid-cols-2 md:grid-cols-4 gap-8 text-[11px]`}>
            <div className="space-y-4 col-span-2 md:col-span-1">
              <span className="text-lg font-black tracking-wider font-display">REXPO</span>
              <p className={subText}>Smart Rental Operations platform designed for modern business workflows.</p>
              <span className={`block text-[10px] ${subText}`}>© 2026 REXPO. All rights reserved.</span>
            </div>
            <div className="space-y-3">
              <span className={`font-semibold text-xs ${textColor}`}>Product</span>
              <ul className={`space-y-2 ${subText}`}>
                <li><a href="#features" className="hover:underline">Features</a></li>
                <li><a href="#workflow" className="hover:underline">Workflow</a></li>
                <li><a href="#benefits" className="hover:underline">Benefits</a></li>
                <li><a href="#pricing" className="hover:underline">Pricing Overview</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <span className={`font-semibold text-xs ${textColor}`}>Company</span>
              <ul className={`space-y-2 ${subText}`}>
                <li><a href="#about" className="hover:underline">About Us</a></li>
                <li><a href="#careers" className="hover:underline">Careers</a></li>
                <li><a href="#press" className="hover:underline">Press Kit</a></li>
                <li><a href="#contact" className="hover:underline">Contact Sales</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <span className={`font-semibold text-xs ${textColor}`}>Resources</span>
              <ul className={`space-y-2 ${subText}`}>
                <li><a href="#docs" className="hover:underline">Developer API</a></li>
                <li><a href="#status" className="hover:underline">System Status</a></li>
                <li><a href="#privacy" className="hover:underline">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:underline">Terms of Service</a></li>
              </ul>
            </div>
          </footer>
        </div>
      </SlideSection>

    </div>
  );
}
