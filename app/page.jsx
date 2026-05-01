"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const heroImages = [
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1920&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1920&auto=format&fit=crop",
];

// Scroll fade hook
function useScrollFade() {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef(null);

  useEffect(() => {
    const currentRef = domRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  return { ref: domRef, isVisible };
}

// Fade section
function FadeInSection({ children, delay = 0 }) {
  const { ref, isVisible } = useScrollFade();

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0px)" : "translateY(40px)",
        transition: `all 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function Gympage() {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % heroImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-white font-sans selection:bg-red-500 selection:text-white">

      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/80 to-transparent p-6 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center gap-2 group justify-between">

         <div className="flex items-center gap-2 group cursor-pointer">
  <svg
    className="w-8 h-8 text-red-600 group-hover:rotate-12 transition-transform duration-300"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h18M3 14h18M5 6v12m14-12v12"
    />
  </svg>

  <span className="text-2xl font-black uppercase">
    Fit<span className="text-red-600">core</span>
  </span>
</div>
          <nav className="md:flex gap-8 text-sm text-zinc-300">
            <a href="#about" className="hover:text-red-500">About</a>
            <a href="#plans" className="hover:text-red-500">Plans</a>
            <a href="#join" className="hover:text-red-500">Join</a>
          </nav>


        </div>
      </header>

      {/* HERO */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">

        {heroImages.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImgIndex ? "opacity-100" : "opacity-0"
              }`}
          >
            <img
              src={src}
              className="object-cover w-full h-full scale-105"
              alt="gym"
            />

            <div className="absolute inset-0 bg-black/40 bg-gradient-to-t from-zinc-900 via-transparent to-black/80"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-transparent pointer-events-none"></div>
          </div>
        ))}

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tight mb-6 drop-shadow-2xl">
            Push Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-orange-500 drop-shadow-[0_0_25px_rgba(220,38,38,0.5)]">Limits</span>
          </h1>

          <p className="text-lg md:text-2xl text-zinc-300 font-light tracking-wide max-w-2xl mx-auto">
            Build strength, endurance, and confidence in a sanctuary designed for your transformation.
          </p>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 px-6 max-w-7xl mx-auto">

        <FadeInSection>
          <div className="grid md:grid-cols-2 gap-12 items-center">

            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
                Forge Your Legacy
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed">
                At Fitcore, we provide a sanctuary for transformation. Step into an environment engineered for peak performance and unlock your true potential.
              </p>
              <div className="mt-8 flex gap-3">
                <div className="h-1 w-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"></div>
                <div className="h-1 w-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-full opacity-60"></div>
                <div className="h-1 w-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full opacity-30"></div>
              </div>
            </div>

            <div className="relative h-96 rounded-2xl overflow-hidden group shadow-[0_0_40px_rgba(220,38,38,0.15)] ring-1 ring-white/10">
              <div className="absolute inset-0 bg-gradient-to-tr from-red-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 pointer-events-none"></div>
              <img
                src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1470&auto=format&fit=crop"
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 relative z-0"
                alt="Gym equipment"
              />
            </div>

          </div>
        </FadeInSection>

      </section>

      {/* PLANS */}
      <section id="plans" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 to-black pointer-events-none"></div>
        
        {/* Decorative background blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">

          <FadeInSection>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black uppercase">
                Membership <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Plans</span>
              </h2>
              <p className="text-zinc-400 mt-4 max-w-xl mx-auto">Select a plan that aligns with your goals and start your journey today.</p>
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

            {[
              { name: "Basic", price: "4500", desc: "Full access to gym floor and standard equipment." },
              { name: "Pro", price: "8000", desc: "Includes personal trainer sessions and premium classes.", featured: true },
            ].map((plan, i) => (
              <FadeInSection key={i} delay={i * 200}>

                <div className={`relative p-[1px] rounded-2xl h-full flex flex-col transition-transform duration-300 hover:-translate-y-2 ${plan.featured ? "bg-gradient-to-br from-red-500 via-red-600 to-orange-500 shadow-[0_0_30px_rgba(220,38,38,0.2)]" : "bg-gradient-to-br from-zinc-700 to-zinc-900 hover:from-zinc-600 hover:to-zinc-800"}`}>
                  <div className={`p-8 rounded-2xl flex flex-col h-full bg-zinc-950/95 backdrop-blur-xl`}>
                    
                    {plan.featured && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-red-500/30">
                        Most Popular
                      </div>
                    )}

                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>

                    <div className="mb-6 mt-4 flex items-end">
                      <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">Rs {plan.price}</span>
                      <span className="text-zinc-500 ml-2 mb-1">/mo</span>
                    </div>

                    <p className="text-zinc-400 flex-grow leading-relaxed">{plan.desc}</p>
                    
                    <button className={`mt-8 w-full py-4 rounded-xl font-bold transition-all duration-300 flex justify-center items-center gap-2 ${plan.featured ? "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-lg shadow-red-500/25" : "bg-zinc-800 hover:bg-zinc-700 text-white"}`}>
                      Select {plan.name}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

              </FadeInSection>
            ))}

          </div>

        </div>
      </section>

      {/* JOIN */}
      <section id="join" className="py-32 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="relative z-10">
          <FadeInSection>
            <h2 className="text-5xl md:text-7xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-200 to-zinc-600">
              Ready to Transform?
            </h2>
            <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
              Join Fitcore today and take the first step towards a stronger, healthier you.
            </p>

            <button
              className="group px-12 py-5 font-bold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(220,38,38,0.4)] bg-gradient-to-r from-red-600 via-orange-500 to-red-600 bg-[length:200%_auto] hover:bg-right text-white flex items-center justify-center mx-auto gap-3 text-xl"
              onClick={() => router.push("/Login")}
            >
              <span>Get Started Now</span>
              <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </FadeInSection>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black border-t border-zinc-900 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">

          <div>
            <h3 className="text-xl font-black">
              Fit<span className="text-red-600">core</span>
            </h3>
            <p className="text-zinc-500 text-sm">
              Build strength. Build discipline.
            </p>
          </div>



          <div className="text-zinc-600 text-sm">
            © {new Date().getFullYear()} Fitcore
          </div>

        </div>
      </footer>

    </div>
  );
}