import Header from './components/Header';
import ChatWidget from './components/ChatWidget';
import HeroSection from './sections/HeroSection';
import ServicesSection from './sections/ServicesSection';
import ProcessSection from './sections/ProcessSection';
import CTASection from './sections/CTASection';
import Footer from './sections/Footer';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <ServicesSection />
        <ProcessSection />
        <CTASection />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}

export default App;
