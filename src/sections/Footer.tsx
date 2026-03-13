import { Linkedin, Instagram, Youtube, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    servicos: [
      { label: 'Chatbots', href: '#servicos' },
      { label: 'Automações', href: '#servicos' },
      { label: 'Consultoria', href: '#servicos' },
    ],
    empresa: [
      { label: 'Sobre nós', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Carreiras', href: '#' },
    ],
    suporte: [
      { label: 'Contato', href: '#contato' },
      { label: 'FAQ', href: '#' },
      { label: 'Política de Privacidade', href: '#' },
    ],
  };

  const socialLinks = [
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
    { icon: Twitter, href: '#', label: 'Twitter' },
  ];

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="relative bg-aretech-black text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Main Footer */}
        <div className="section-padding py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
              {/* Brand Column */}
              <div className="lg:col-span-2">
                <a href="#" className="flex items-center gap-3 mb-6 group">
                  <img
                    src="/images/pantera-logo.png"
                    alt="Aretech"
                    className="h-12 w-auto invert transition-transform duration-300 group-hover:scale-110"
                  />
                  <span className="text-2xl font-semibold tracking-tight">
                    Aretech.
                  </span>
                </a>
                <p className="text-gray-400 mb-6 max-w-sm leading-relaxed">
                  Transformando empresas através da inteligência artificial. 
                  Automação inteligente para impulsionar seu negócio.
                </p>
                
                {/* Social Links */}
                <div className="flex gap-3">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      aria-label={social.label}
                      className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center
                               hover:bg-aretech-green transition-colors duration-300"
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Links Columns */}
              <div>
                <h4 className="font-semibold mb-4 text-white">Serviços</h4>
                <ul className="space-y-3">
                  {footerLinks.servicos.map((link, index) => (
                    <li key={index}>
                      <button
                        onClick={() => scrollToSection(link.href)}
                        className="text-gray-400 hover:text-aretech-green transition-colors duration-300"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-white">Empresa</h4>
                <ul className="space-y-3">
                  {footerLinks.empresa.map((link, index) => (
                    <li key={index}>
                      <button
                        onClick={() => scrollToSection(link.href)}
                        className="text-gray-400 hover:text-aretech-green transition-colors duration-300"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-white">Suporte</h4>
                <ul className="space-y-3">
                  {footerLinks.suporte.map((link, index) => (
                    <li key={index}>
                      <button
                        onClick={() => scrollToSection(link.href)}
                        className="text-gray-400 hover:text-aretech-green transition-colors duration-300"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="section-padding py-6">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-500 text-sm">
                © {currentYear} Aretech. Todos os direitos reservados.
              </p>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <button className="hover:text-white transition-colors">
                  Termos de Uso
                </button>
                <button className="hover:text-white transition-colors">
                  Política de Privacidade
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
