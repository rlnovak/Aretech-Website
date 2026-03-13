import { useEffect, useRef } from 'react';
import { MessageSquare, Workflow, Lightbulb, ArrowRight, Bot, Cpu, Target } from 'lucide-react';

const ServicesSection = () => {
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

  const services = [
    {
      number: '01',
      icon: MessageSquare,
      title: 'Chatbots Personalizados',
      subtitle: 'Revolucione as interações com seus clientes',
      description: 'Chatbots inteligentes que atendem, qualificam leads e resolvem dúvidas 24/7. Integração completa com WhatsApp, site e outras plataformas.',
      features: ['Atendimento 24/7', 'Qualificação automática de leads', 'Integração multicanal', 'Personalização completa'],
      color: 'from-aretech-green to-emerald-400',
      bgColor: 'bg-emerald-50',
    },
    {
      number: '02',
      icon: Workflow,
      title: 'Automações com IA',
      subtitle: 'Aumente a eficiência das suas equipes',
      description: 'Automatize tarefas repetitivas e processos manuais com fluxos inteligentes que aprendem e se adaptam ao seu negócio.',
      features: ['Fluxos personalizados', 'Integração com APIs', 'Processamento de documentos', 'Relatórios automáticos'],
      color: 'from-aretech-orange to-amber-400',
      bgColor: 'bg-orange-50',
    },
    {
      number: '03',
      icon: Lightbulb,
      title: 'Consultoria em IA',
      subtitle: 'Encontre a melhor solução para o seu negócio',
      description: 'Análise completa dos seus processos e recomendações estratégicas para implementar IA de forma eficiente e rentável.',
      features: ['Diagnóstico gratuito', 'Roadmap de implementação', 'Treinamento da equipe', 'Suporte contínuo'],
      color: 'from-blue-500 to-cyan-400',
      bgColor: 'bg-blue-50',
    },
  ];

  const technologies = [
    { icon: Bot, name: 'Agentes de IA', desc: 'Assistentes virtuais inteligentes' },
    { icon: Cpu, name: 'Automação', desc: 'Fluxos automatizados personalizados' },
    { icon: Target, name: 'Eficiência', desc: 'Resultados mensuráveis e rápidos' },
  ];

  return (
    <section
      id="servicos"
      ref={sectionRef}
      className="relative py-24 bg-white overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gray-50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-aretech-green/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full section-padding">
        {/* Section Header */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-end">
            <div>
              <span className="reveal opacity-0 inline-block text-aretech-green font-semibold text-sm uppercase tracking-wider mb-4">
                Nossos Serviços
              </span>
              <h2 className="reveal opacity-0 heading-lg text-aretech-black" style={{ animationDelay: '0.1s' }}>
                Soluções de{' '}
                <span className="text-gradient">IA de Ponta</span>{' '}
                para sua Empresa
              </h2>
            </div>
            <p 
              className="reveal opacity-0 body-md"
              style={{ animationDelay: '0.2s' }}
            >
              Na Aretech, somos apaixonados por desenvolver soluções usando inteligência 
              artificial de ponta. Seja através de agentes, fluxos de automação personalizados 
              ou chatbots de atendimento, nós iremos automatizar as tarefas repetitivas do 
              seu negócio, liberando a sua equipe para focar no que realmente importa.
            </p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8 mb-20">
          {services.map((service, index) => (
            <div
              key={index}
              className="reveal opacity-0 group relative bg-white rounded-3xl p-8 border border-gray-100
                       shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-black/10
                       transition-all duration-500 hover:-translate-y-2"
              style={{ animationDelay: `${0.1 * (index + 3)}s` }}
            >
              {/* Number */}
              <span className="absolute top-6 right-6 text-6xl font-bold text-gray-100 
                             group-hover:text-aretech-green/10 transition-colors duration-300">
                {service.number}
              </span>

              {/* Icon */}
              <div className={`w-14 h-14 ${service.bgColor} rounded-2xl flex items-center justify-center mb-6
                            group-hover:scale-110 transition-transform duration-300`}>
                <service.icon className="w-7 h-7 text-aretech-green" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-aretech-black mb-2">
                {service.title}
              </h3>
              <p className={`text-sm font-medium bg-gradient-to-r ${service.color} bg-clip-text text-transparent mb-4`}>
                {service.subtitle}
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {service.description}
              </p>

              {/* Features */}
              <ul className="space-y-2 mb-6">
                {service.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-aretech-green" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Link */}
              <button 
                onClick={() => document.querySelector('#contato')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 text-aretech-green font-semibold text-sm
                         group-hover:gap-3 transition-all duration-300"
              >
                Saiba mais
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Technologies Bar */}
        <div className="reveal opacity-0 max-w-4xl mx-auto" style={{ animationDelay: '0.6s' }}>
          <div className="bg-gradient-to-r from-aretech-black to-gray-900 rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-8">
              {technologies.map((tech, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <tech.icon className="w-6 h-6 text-aretech-green" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">{tech.name}</h4>
                    <p className="text-gray-400 text-sm">{tech.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
