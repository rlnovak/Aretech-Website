import { useEffect, useRef } from 'react';
import { ArrowRight, Sparkles, TrendingUp, Clock } from 'lucide-react';

const HeroSection = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = heroRef.current?.querySelectorAll('.reveal');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const benefits = [
    { icon: TrendingUp, text: 'Mais Produtividade' },
    { icon: Sparkles, text: 'Menos Custos' },
    { icon: Clock, text: 'Menos Perda de Tempo' },
  ];

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white pt-20"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-aretech-green/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-aretech-orange/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-aretech-green/5 to-transparent rounded-full" />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full section-padding py-20">
        <div className="max-w-6xl mx-auto text-center">
          {/* Logo */}
          <div className="reveal opacity-0 mb-8 flex justify-center">
            <img
              src="/images/aretech-logo-original.png"
              alt="Aretech"
              className="h-20 sm:h-24 md:h-28 w-auto"
            />
          </div>

          {/* Badge */}
          <div className="reveal opacity-0 mb-8" style={{ animationDelay: '0.05s' }}>
            <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-aretech-green/10 
                           text-aretech-green text-sm font-semibold rounded-full border border-aretech-green/20">
              <Sparkles className="w-4 h-4" />
              ARETECH: SOLUÇÕES DE IA PARA A SUA EMPRESA
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="reveal opacity-0 heading-xl text-aretech-black mb-6" style={{ animationDelay: '0.1s' }}>
            Automações com{' '}
            <span className="text-gradient">Inteligência Artificial</span>
            <br />
            para Impulsionar Seu Negócio
          </h1>

          {/* Subheadline */}
          <p 
            className="reveal opacity-0 body-lg max-w-3xl mx-auto mb-10 text-aretech-gray-dark"
            style={{ animationDelay: '0.2s' }}
          >
            Elimine gargalos operacionais e transforme a eficiência da sua empresa 
            com soluções personalizadas de automação. Deixe a IA cuidar das tarefas 
            repetitivas enquanto sua equipe foca no que realmente importa: 
            <strong className="text-aretech-black"> crescer o negócio.</strong>
          </p>

          {/* Benefits */}
          <div 
            className="reveal opacity-0 flex flex-wrap justify-center gap-6 mb-12"
            style={{ animationDelay: '0.3s' }}
          >
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-5 py-3 bg-white rounded-full shadow-lg 
                         shadow-black/5 border border-gray-100 hover:shadow-xl hover:-translate-y-0.5
                         transition-all duration-300"
              >
                <benefit.icon className="w-5 h-5 text-aretech-green" />
                <span className="text-sm font-semibold text-aretech-black uppercase tracking-wide">
                  {benefit.text}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div 
            className="reveal opacity-0 flex flex-col sm:flex-row items-center justify-center gap-4"
            style={{ animationDelay: '0.4s' }}
          >
            <button
              onClick={() => scrollToSection('#contato')}
              className="group px-8 py-4 bg-aretech-green text-white font-semibold rounded-full
                       transition-all duration-300 hover:bg-aretech-green-dark hover:shadow-glow
                       hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              Agende uma Consultoria Gratuita
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => scrollToSection('#servicos')}
              className="px-8 py-4 bg-white text-aretech-black font-semibold rounded-full
                       border-2 border-gray-200 transition-all duration-300
                       hover:border-aretech-green hover:text-aretech-green
                       active:scale-95"
            >
              Conheça Nossos Serviços
            </button>
          </div>

          {/* Trust Indicators */}
          <div 
            className="reveal opacity-0 mt-16 pt-8 border-t border-gray-100"
            style={{ animationDelay: '0.5s' }}
          >
            <p className="text-sm text-gray-500 mb-4">
              Empresas que já transformaram suas operações com a Aretech
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
              {['Automação', 'IA', 'Chatbots', 'Consultoria', 'n8n'].map((tech, index) => (
                <span key={index} className="text-lg font-semibold text-gray-400">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
};

export default HeroSection;
