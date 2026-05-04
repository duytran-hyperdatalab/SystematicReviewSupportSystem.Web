import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { 
  FiSearch, 
  FiFilter, 
  FiCheckCircle, 
  FiLayers, 
  FiBookOpen, 
  FiCpu, 
  FiUsers, 
  FiShield 
} from "react-icons/fi";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import PrismaStep from "../../components/home/PrismaStep";
import FlowArrow from "../../components/home/FlowArrow";

gsap.registerPlugin(ScrollTrigger);

function HomePage() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const prismaRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Text Animation
      gsap.from(".hero-content > *", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out"
      });

      // PRISMA Process Sequential Animation
      const prismaTl = gsap.timeline({ delay: 0.6 });
      
      const steps = gsap.utils.toArray("[data-prisma-step]");
      const arrows = gsap.utils.toArray("[data-flow-arrow]");

      steps.forEach((step, i) => {
        prismaTl.to(step as Element, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out"
        });
        
        if (i < arrows.length) {
          prismaTl.to(arrows[i] as Element, {
            opacity: 1,
            duration: 0.3,
            ease: "power2.inOut"
          }, "-=0.2");
        }
      });

      // Features Scroll Animation
      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 80%",
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out"
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const prismaSteps = [
    { icon: FiSearch, label: "Identification", description: "Search across multiple databases" },
    { icon: FiFilter, label: "Screening", description: "Filter by title and abstract" },
    { icon: FiCheckCircle, label: "Eligibility", description: "Full-text assessment" },
    { icon: FiLayers, label: "Included", description: "Synthesized for analysis" },
  ];

  const coreFeatures = [
    { title: "Justification & Governance", icon: FiBookOpen, desc: "Step-by-step guidance for project justification and governance management." },
    { title: "Smart Screening", icon: FiCpu, desc: "AI-assisted screening tools to accelerate study selection." },
    { title: "Team Collaboration", icon: FiUsers, desc: "Real-time multi-reviewer support with conflict resolution." },
    { title: "Data Integrity", icon: FiShield, desc: "Secure data extraction and reproduction-ready logs." },
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-sans" ref={heroRef}>
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-gray-100 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center hero-content mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-700">PRISMA Framework Support</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
              Empowering Systematic <br />
              <span className="text-indigo-600">Research Excellence</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              A comprehensive platform designed for researchers to conduct systematic literature reviews 
              with transparency, reproducibility, and high-standard academic integrity.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-14 px-8 text-base shadow-lg shadow-indigo-100" onClick={() => navigate("/projects")}>
                Start New Project
              </Button>
              <Button variant="outline" size="lg" className="h-14 px-8 text-base" onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}>
                Explore Process
              </Button>
            </div>
          </div>

          {/* PRISMA Flow Concept Animation */}
          <div className="max-w-5xl mx-auto" ref={prismaRef}>
            <div className="flex flex-col lg:flex-row items-center justify-between gap-2 lg:gap-0 bg-slate-50/50 p-8 rounded-[32px] border border-gray-100">
              {prismaSteps.map((step, index) => (
                <div key={step.label} className="flex flex-col lg:flex-row items-center">
                  <PrismaStep 
                    icon={step.icon} 
                    label={step.label} 
                    description={step.description}
                    isActive={index === 3}
                  />
                  {index < prismaSteps.length - 1 && <FlowArrow />}
                </div>
              ))}
            </div>
            <p className="text-center mt-8 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Standardized PRISMA 2020 Workflow Visualization
            </p>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-24 container mx-auto px-4" ref={featuresRef}>
        <div className="max-w-2xl text-left mb-16">
          <p className="text-indigo-600 text-xs font-black uppercase tracking-widest mb-4 italic">Capabilities</p>
          <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">System Infrastructure</h2>
          <p className="text-slate-500 font-medium">
            Built to handle high-volume data extraction and synthesis while maintaining 
            strict adherence to international research standards.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreFeatures.map((feature) => (
            <div key={feature.title} className="feature-card group">
              <Card className="h-full hover:border-indigo-200 transition-colors border-gray-100/60 shadow-sm hover:shadow-md">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Quote / Footer Hint */}
      <section className="pb-24 container mx-auto px-4">
        <div className="bg-indigo-900 rounded-[40px] p-12 lg:p-20 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-white blur-[120px]"></div>
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-bold mb-8 relative z-10">
            Engineered for Academic Rigor
          </h2>
          <p className="text-indigo-200/80 text-lg max-w-2xl mx-auto mb-10 font-medium z-10 relative">
            "Transparency and reproducibility are the twin pillars of scientific credibility. 
            PRISMA SLR provides the digital scaffolding to uphold them."
          </p>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
