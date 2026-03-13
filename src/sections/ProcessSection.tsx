import { useEffect, useRef } from 'react';
import { Phone, FileSearch, Calculator, Rocket, CheckCircle, Trophy, ArrowRight } from 'lucide-react';

const ProcessSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    const elements = sectionRef.current?.querySelectorAll('.reveal');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      icon: Phone,
      number: '1',
      title: 'Diagnóstico Inicial',
      description: 'Agendamos uma call para entender o contexto e as necessidades específicas do seu negócio.',
      duration: '15 minutos',
      color: 'bg-blue-500',
    },
    {
      icon: FileSearch,
      number: '2',
      title: 'Definição do Projeto',
      description: 'Com base nesse primeiro contato, definimos a solução ideal para a sua empresa.',
      duration: '24 horas',
      color: 'bg-purple-500',
    },
    {
      icon: Calculator,
      number: '3',
      title: 'Mapeamento e Orçamento',
      description: 'Nós iremos mapear os processos e então elaborar um orçamento para o seu projeto.',
      duration: '48 horas',
      color: 'bg-aretech-orange',
    },
    {
      icon: Rocket,
      number: '4',
      title: 'Aprovação e Início',
      description: 'Após sua aprovação, iniciaremos imediatamente a implementação utilizando as soluções mais modernas em IA.',
      duration: 'Imediato',
      color: 'bg-aretech-green',
    },
    {
      icon: CheckCircle,
      number: '5',
      title: 'Testes e Entrega',
      description: 'O projeto é testado na sua empresa. Com a superação dos testes, realizamos a entrega final.',
      duration: '1-2 semanas',
      color: 'bg-cyan-500',
    },
    {
      icon: Trophy,
      number: '6',
      title: 'Resultados Transformadores',
      description: 'Parabéns! Sua empresa agora irá operar com mais eficiência, permitindo que sua equipe se concentre em tarefas estratégicas.',
      duration: 'Contínuo',
      color: 'bg-amber-500',
    },
  ];

  return (
    <section
      id="como-funciona"
      ref={sectionRef}
      className="relative py-24 bg-gray-50 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] 
                      bg-gradient-radial from-aretech-green/5 to-transparent rounded-full" />
      </div>

      <div className="relative z-10 w-full section-padding">
        {/* Section Header */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <span className="reveal opacity-0 inline-block text-aretech-green font-semibold text-sm uppercase tracking-wider mb-4">
            Nosso Processo
          </span>
          <h2 className="reveal opacity-0 heading-lg text-aretech-black mb-6" style={{ animationDelay: '0.1s' }}>
            Como funciona o nosso{' '}
            <span className="text-gradient">serviço</span>?
          </h2>
          <p 
            className="reveal opacity-0 body-md max-w-2xl mx-auto"
            style={{ animationDelay: '0.2s' }}
          >
            Um processo simples e transparente para levar a inteligência artificial 
            até a sua empresa de forma rápida e eficiente.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <div
                key={index}
                className="reveal opacity-0 group relative bg-white rounded-2xl p-6 
                         border border-gray-100 hover:border-aretech-green/30
                         shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
                style={{ animationDelay: `${0.1 * (index + 3)}s` }}
              >
                {/* Step Number */}
                <div className={`absolute -top-3 -left-3 w-10 h-10 ${step.color} rounded-xl 
                              flex items-center justify-center text-white font-bold text-lg
                              shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4
                              group-hover:bg-aretech-green/10 transition-colors duration-300">
                  <step.icon className="w-6 h-6 text-gray-600 group-hover:text-aretech-green transition-colors" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-aretech-black mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {step.description}
                </p>

                {/* Duration Badge */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 
                               text-gray-600 text-xs font-medium rounded-full">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {step.duration}
                </span>
              </div>
            ))}
          </div>

          {/* Timeline Connector (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 w-3/4 h-0.5 
                         bg-gradient-to-r from-transparent via-aretech-green/20 to-transparent" />
        </div>

        {/* CTA */}
        <div 
          className="reveal opacity-0 max-w-2xl mx-auto mt-16 text-center"
          style={{ animationDelay: '0.9s' }}
        >
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-black/5 border border-gray-100">
            <h3 className="text-2xl font-bold text-aretech-black mb-4">
              Pronto para começar?
            </h3>
            <p className="text-gray-600 mb-6">
              Agende uma videochamada de 15 minutos e descubra como a IA pode transformar seu negócio.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => document.querySelector('#contato')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-4 bg-aretech-green text-white font-semibold rounded-full
                         transition-all duration-300 hover:bg-aretech-green-dark hover:shadow-glow
                         flex items-center justify-center gap-2 group"
              >
                Agendar chamada gratuita
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-aretech-green" />
                Primeiro contato gratuito
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-aretech-green" />
                Orçamento em 24h
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
