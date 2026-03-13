import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#servicos', label: 'Serviços' },
    { href: '#como-funciona', label: 'Como Funciona' },
    { href: '#contato', label: 'Contato' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-lg py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="w-full section-padding">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-3 group"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <img
              src="/images/pantera-logo.png"
              alt="Aretech"
              className="h-10 w-auto transition-transform duration-300 group-hover:scale-110"
            />
            <span
              className={`text-xl font-semibold tracking-tight transition-colors duration-300 ${
                isScrolled ? 'text-aretech-black' : 'text-aretech-black'
              }`}
            >
              Aretech.
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className={`text-sm font-medium transition-all duration-300 hover:text-aretech-green relative group ${
                  isScrolled ? 'text-aretech-black' : 'text-aretech-black'
                }`}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-aretech-green transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <button
              onClick={() => scrollToSection('#contato')}
              className="px-6 py-2.5 bg-aretech-green text-white text-sm font-medium rounded-full
                         transition-all duration-300 hover:bg-aretech-green-dark hover:shadow-glow"
            >
              Agendar Call
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-aretech-black" />
            ) : (
              <Menu className="w-6 h-6 text-aretech-black" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            isMobileMenuOpen ? 'max-h-64 mt-4' : 'max-h-0'
          }`}
        >
          <nav className="flex flex-col gap-2 py-4 border-t border-gray-100">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="text-left px-4 py-3 text-aretech-black font-medium rounded-lg
                           hover:bg-gray-50 transition-colors"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => scrollToSection('#contato')}
              className="mx-4 mt-2 px-6 py-3 bg-aretech-green text-white font-medium rounded-full
                         transition-all duration-300 hover:bg-aretech-green-dark"
            >
              Agendar Call
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
