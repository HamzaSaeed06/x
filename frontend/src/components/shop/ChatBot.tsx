import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { MessageCircle, X, Send } from 'lucide-react';
import { getMyOrders } from '@/lib/services/orderService';
import { getStoreSettings } from '@/lib/services/storeSettingsService';
import toast from 'react-hot-toast';

interface Message {
  role: 'bot' | 'user';
  text: string;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initChat = () => {
    const greeting = user
      ? `Hi ${user.displayName || user.name || 'there'}! I can help you with your recent orders, store policies, or payment info. What would you like to know?`
      : 'Hi! I can help with store policies and shipping info. Sign in to track your orders.';
    setMessages([{ role: 'bot', text: greeting }]);
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) initChat();
  }, [isOpen, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const userMessage = inputText.trim();
    setInputText('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    let botResponse = 'I\'m not sure how to help with that yet. Try asking about your "order status", "return policy", "shipping", or "payment".';
    const lower = userMessage.toLowerCase();

    try {
      if (!user && (lower.includes('order') || lower.includes('status'))) {
        botResponse = 'Please sign in to track your orders.';
      } else if (user && (lower.includes('order') || lower.includes('status') || lower.includes('track'))) {
        const orders = await getMyOrders();
        if (orders.length === 0) {
          botResponse = 'You don\'t have any recent orders.';
        } else {
          const latest = orders[0];
          botResponse = `Your latest order #${(latest.id ?? '').slice(-6).toUpperCase()} is **${(latest.status ?? 'pending').toUpperCase()}** · Total: PKR ${latest.total?.toLocaleString() ?? 0}`;
        }
      } else if (lower.includes('return') || lower.includes('refund')) {
        const settings = await getStoreSettings();
        botResponse = settings.returnPolicy ?? '30-day hassle-free returns on unused items.';
      } else if (lower.includes('shipping') || lower.includes('delivery')) {
        const settings = await getStoreSettings();
        botResponse = `We deliver in ${settings.deliveryEstimate ?? '3–5 working days'}. Free shipping on orders over PKR ${(settings.freeDeliveryThreshold ?? 5000).toLocaleString()}.`;
      } else if (lower.includes('payment') || lower.includes('pay')) {
        botResponse = 'We support Cash on Delivery (COD), Stripe, JazzCash, and EasyPaisa at checkout.';
      } else if (lower.includes('warranty')) {
        const settings = await getStoreSettings();
        botResponse = settings.warrantyPolicy ?? '1-year manufacturer warranty on all products.';
      } else if (lower.includes('contact') || lower.includes('support')) {
        botResponse = 'Contact us via email at support@zestandpartners.com or call +92-300-0000000. We\'re here Mon–Sat, 9 AM–6 PM PKT.';
      } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        botResponse = 'Hello! How can I help you today?';
      }
    } catch {
      botResponse = 'Sorry, I couldn\'t fetch that right now. Please try again.';
    }

    setMessages((prev) => [...prev, { role: 'bot', text: botResponse }]);
    setIsLoading(false);
  };

  const quickReplies = ['Order Status', 'Return Policy', 'Shipping Info', 'Payment Methods'];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-black text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[340px] h-[480px] bg-white border border-[var(--border-default)] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-black text-white">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="font-semibold text-sm">Zest Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)}><X className="w-4 h-4" /></button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 text-[13px] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-black text-white'
                      : 'bg-[var(--neutral-100)] text-[var(--text-primary)]'
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                  }}
                />
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[var(--neutral-100)] px-4 py-2 text-xs text-[var(--text-muted)]">
                  <span className="animate-pulse">Typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          {messages.length === 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {quickReplies.map((q) => (
                <button
                  key={q}
                  onClick={() => { setInputText(q); }}
                  className="text-[11px] px-2.5 py-1 border border-[var(--border-default)] hover:border-black hover:text-black transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-[var(--border-default)] flex">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              placeholder="Ask anything..."
              className="flex-1 px-3 py-3 text-[13px] outline-none bg-transparent"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !inputText.trim()}
              className="px-4 text-[var(--text-muted)] hover:text-black transition-colors disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
