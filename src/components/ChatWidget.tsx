import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// URL do Worker de chat na Cloudflare. Definida em build via VITE_CHAT_API_URL.
const CHAT_API_URL =
  import.meta.env.VITE_CHAT_API_URL ?? 'http://localhost:8787/api/chat';

// sessionId estável por visitante, persistido no navegador.
function getSessionId(): string {
  try {
    let id = localStorage.getItem('aretech_chat_session');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('aretech_chat_session', id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Olá! Sou o assistente da Aretech. Me conta: qual desafio do seu negócio você gostaria de resolver com automação ou IA?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>(getSessionId());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendToBackend = async (text: string) => {
    setIsTyping(true);
    try {
      const res = await fetch(
        `${CHAT_API_URL}?sessionId=${encodeURIComponent(sessionIdRef.current)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text }),
        }
      );
      const data = (await res.json()) as { reply?: string; error?: string };
      const reply =
        data.reply ||
        'Desculpe, tive um problema. Fale com a gente no WhatsApp: https://wa.me/5547989007623';

      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, text: reply, sender: 'bot', timestamp: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: 'Estou com uma instabilidade agora. Fale com a gente no WhatsApp: https://wa.me/5547989007623',
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (overrideText?: string) => {
    const text = (overrideText ?? inputValue).trim();
    if (!text || isTyping) return;

    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, text, sender: 'user', timestamp: new Date() },
    ]);
    setInputValue('');
    await sendToBackend(text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  const quickReplies = [
    'Quero agendar uma call',
    'Quero saber mais sobre chatbots',
    'Como funciona a automação?',
    'Qual o investimento?',
  ];

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl 
                   transition-all duration-500 flex items-center justify-center
                   ${isOpen 
                     ? 'bg-gray-800 rotate-90 scale-0' 
                     : 'bg-aretech-green hover:bg-aretech-green-dark hover:scale-110 animate-pulse-glow'
                   }`}
        aria-label={isOpen ? 'Fechar chat' : 'Abrir chat'}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Close Button (when open) */}
      {isOpen && (
        <button
          onClick={() => setIsOpen(false)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl 
                     bg-gray-800 hover:bg-gray-700 transition-all duration-300
                     flex items-center justify-center hover:scale-110"
          aria-label="Fechar chat"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Chat Window */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)]
                   bg-white rounded-3xl shadow-2xl overflow-hidden
                   transition-all duration-500 origin-bottom-right
                   ${isOpen 
                     ? 'opacity-100 scale-100 translate-y-0' 
                     : 'opacity-0 scale-95 translate-y-10 pointer-events-none'
                   }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-aretech-green to-aretech-green-dark p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Aretech Assistant</h4>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white/80 text-xs">Online agora</span>
              </div>
            </div>
            <Sparkles className="w-5 h-5 text-white/60 ml-auto" />
          </div>
        </div>

        {/* Messages */}
        <div className="h-[350px] overflow-y-auto p-4 bg-gray-50">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'user'
                      ? 'bg-aretech-green'
                      : 'bg-aretech-black'
                  }`}
                >
                  {message.sender === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div
                  className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                    message.sender === 'user'
                      ? 'bg-aretech-green text-white rounded-br-md'
                      : 'bg-white text-gray-700 shadow-sm rounded-bl-md'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-aretech-black flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-bl-md shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick Replies */}
        <div className="px-4 py-2 bg-white border-t border-gray-100">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(reply)}
                disabled={isTyping}
                className="flex-shrink-0 px-3 py-1.5 bg-gray-100 hover:bg-aretech-green/10 disabled:opacity-50
                         text-gray-600 hover:text-aretech-green text-xs font-medium
                         rounded-full transition-colors whitespace-nowrap"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="flex-1 px-4 py-3 bg-gray-100 rounded-full text-sm
                       focus:outline-none focus:ring-2 focus:ring-aretech-green/50
                       placeholder:text-gray-400"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isTyping}
              className="w-11 h-11 bg-aretech-green rounded-full flex items-center justify-center
                       hover:bg-aretech-green-dark transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">
            Powered by Aretech AI
          </p>
        </div>
      </div>
    </>
  );
};

export default ChatWidget;
