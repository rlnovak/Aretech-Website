import { useEffect, useRef, useState } from 'react';
import { Calendar, MessageCircle, Mail, Phone, CheckCircle, Sparkles, Zap, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const CTASection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'call' | 'chat' | ''>('');

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

  const openDialog = (type: 'call' | 'chat') => {
    setDialogType(type);
    setIsDialogOpen(true);
  };

  const benefits = [
    { icon: Clock, text: 'Resposta em até 2 horas' },
    { icon: Zap, text: 'Orçamento em 24h' },
    { icon: CheckCircle, text: 'Sem compromisso' },
  ];

  const contactMethods = [
    {
      icon: Calendar,
      title: 'Agende uma Call',
      description: 'Videochamada de 15 minutos para entender suas necessidades',
      action: 'Agendar agora',
      onClick: () => openDialog('call'),
      primary: true,
    },
    {
      icon: MessageCircle,
      title: 'Fale pelo Chat',
      description: 'Converse com nosso agente de IA disponível 24/7',
      action: 'Iniciar conversa',
      onClick: () => openDialog('chat'),
      primary: false,
    },
    {
      icon: Mail,
      title: 'Envie um Email',
      description: 'contato@aretech.com.br',
      action: 'Enviar email',
      onClick: () => window.open('mailto:contato@aretech.com.br', '_blank'),
      primary: false,
    },
    {
      icon: Phone,
      title: 'Ligue para nós',
      description: 'Disponível em horário comercial',
      action: 'Ligar agora',
      onClick: () => openDialog('call'),
      primary: false,
    },
  ];

  return (
    <section
      id="contato"
      ref={sectionRef}
      className="relative py-24 bg-white overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-aretech-green/5 via-transparent to-aretech-orange/5" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-aretech-green/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-aretech-orange/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full section-padding">
        <div className="max-w-6xl mx-auto">
          {/* Main CTA Card */}
          <div className="reveal opacity-0 bg-gradient-to-br from-aretech-black to-gray-900 rounded-3xl p-8 md:p-12 lg:p-16 mb-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
                  <Sparkles className="w-4 h-4 text-aretech-green" />
                  <span className="text-white/80 text-sm font-medium">
                    Transforme seu negócio hoje
                  </span>
                </div>
                
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                  Pronto para{' '}
                  <span className="text-gradient">revolucionar</span>{' '}
                  sua empresa?
                </h2>
                
                <p className="text-white/70 text-lg mb-8 leading-relaxed">
                  Nossa equipe está pronta para conversar sobre as suas necessidades 
                  e desenvolver um projeto personalizado que vai transformar a forma 
                  como sua empresa opera.
                </p>

                {/* Benefits */}
                <div className="flex flex-wrap gap-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 text-white/80">
                      <benefit.icon className="w-5 h-5 text-aretech-green" />
                      <span className="text-sm">{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Content - Contact Methods */}
              <div className="grid sm:grid-cols-2 gap-4">
                {contactMethods.map((method, index) => (
                  <button
                    key={index}
                    onClick={method.onClick}
                    className={`group text-left p-6 rounded-2xl transition-all duration-300 ${
                      method.primary
                        ? 'bg-aretech-green hover:bg-aretech-green-dark hover:shadow-glow'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <method.icon className={`w-8 h-8 mb-4 ${
                      method.primary ? 'text-white' : 'text-aretech-green'
                    }`} />
                    <h3 className={`font-semibold mb-2 ${
                      method.primary ? 'text-white' : 'text-white'
                    }`}>
                      {method.title}
                    </h3>
                    <p className={`text-sm mb-4 ${
                      method.primary ? 'text-white/80' : 'text-white/60'
                    }`}>
                      {method.description}
                    </p>
                    <span className={`text-sm font-medium ${
                      method.primary ? 'text-white' : 'text-aretech-green'
                    }`}>
                      {method.action} →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="reveal opacity-0 grid grid-cols-2 md:grid-cols-4 gap-6" style={{ animationDelay: '0.2s' }}>
            {[
              { value: '50+', label: 'Projetos Entregues' },
              { value: '98%', label: 'Clientes Satisfeitos' },
              { value: '24h', label: 'Tempo de Resposta' },
              { value: '3x', label: 'Aumento de Produtividade' },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
              >
                <div className="text-3xl md:text-4xl font-bold text-aretech-green mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-aretech-black">
              {dialogType === 'call' ? 'Agendar uma Call' : 'Iniciar Conversa'}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {dialogType === 'call' 
                ? 'Em breve você poderá agendar diretamente pelo calendário. Por enquanto, entre em contato pelo email ou WhatsApp.'
                : 'Nosso agente de IA está em desenvolvimento. Por enquanto, entre em contato pelo email ou WhatsApp.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <a
              href="mailto:contato@aretech.com.br"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Mail className="w-5 h-5 text-aretech-green" />
              <span className="font-medium">contato@aretech.com.br</span>
            </a>
            <p className="text-sm text-gray-500 text-center">
              Ou fale diretamente pelo chat no canto inferior direito
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default CTASection;
