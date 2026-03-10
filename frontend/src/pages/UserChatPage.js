import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { chatAPI } from '../utils/api';
import { initializeSocket, sendMessage, onNewMessage, disconnectSocket } from '../utils/socket';
import { toast } from 'sonner';
import { UserLayout } from '@/components/user/UserLayout';

export default function UserChatPage() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
const [expandedFaq, setExpandedFaq] = useState(null);
  const messagesEndRef = useRef(null);

  // FAQ Data - System Usage Questions
  const faqs = [
    {
      id: 1,
      question: "How do I book a training session?",
      answer: "To book a training session: 1) Go to 'Sessions' page, 2) Browse available programs, 3) Click 'Book Now' on your preferred program, 4) Select trainer, date, time slot, and attendance type (Gym or Home Visit), 5) Complete the booking and proceed to payment. You can pay immediately or later from 'My Bookings' section."
    },
    {
      id: 2,
      question: "How do I cancel an unpaid booking?",
      answer: "To cancel an unpaid booking: 1) Go to 'Sessions' page and scroll to 'My Bookings' section, 2) Find the booking with 'Pending' payment status, 3) Click the 'Cancel Booking' button, 4) Confirm cancellation. Note: You can only cancel bookings that haven't been paid yet."
    },
    {
      id: 3,
      question: "What payment methods are accepted?",
      answer: "We use Razorpay for secure payments. You can pay using: Credit/Debit Cards, Net Banking, UPI, and Digital Wallets. All payments are secure and encrypted. After booking a session, you'll be redirected to Razorpay's payment gateway."
    },
    {
      id: 4,
      question: "What's the difference between Gym and Home Visit?",
      answer: "Gym Attendance: You attend the session at our gym location. Home Visit: The trainer comes to your location for personalized training. Home visits may have an additional charge. Select your preference during booking and provide your location for home visits."
    },
    {
      id: 5,
      question: "How do I view my orders and bookings?",
      answer: "Sessions: Go to 'Sessions' page to view all your training session bookings at the top. Shop Orders: Go to 'Cart' page and your order history will be shown. You can track payment status, delivery times, and manage your bookings from these pages."
    }
  ];

  const toggleFaq = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);

    if (userData.id) {
      initializeSocket(userData.id, userData.name, 'user');

      fetchMessages();

      onNewMessage((message) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      });
    }

    return () => {
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await chatAPI.getMessages();
      setMessages(response.data);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;

    sendMessage(newMessage, user.id, user.name, 'user', null);
    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <UserLayout
      activePath="/user/chat"
      title="Support Center"
      subtitle="Find answers to common questions or chat with our support team"
    >
      <div className="mx-auto max-w-6xl space-y-6">
        {/* FAQ Section */}
        <Card
          className="saas-glass-card overflow-hidden"
          data-testid="faq-section"
        >
          <div className="border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 p-6">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
              <HelpCircle className="h-6 w-6 text-cyan-400" />
              Frequently Asked Questions
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Learn how to use FitSphere effectively
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="overflow-hidden rounded-lg border border-white/10 bg-zinc-900/50 transition-all hover:border-cyan-400/30"
                  data-testid={`faq-item-${faq.id}`}
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-zinc-800/50"
                  >
                    <span className="font-semibold text-white">
                      {faq.question}
                    </span>
                    {expandedFaq === faq.id ? (
                      <ChevronUp className="h-5 w-5 text-cyan-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-zinc-400" />
                    )}
                  </button>

                  {expandedFaq === faq.id && (
                    <div
                      className="border-t border-white/10 bg-zinc-950/50 p-4 text-sm text-zinc-300"
                      data-testid={`faq-answer-${faq.id}`}
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Talk to Admin Section */}
        <Card
          className="saas-glass-card overflow-hidden"
          data-testid="chat-container"
        >
          <div className="border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-6">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
              <MessageCircle className="h-6 w-6 text-purple-400" />
              Talk to Admin
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Need personalized help? Send us a message
            </p>
          </div>

          {/* Messages Area */}
          <div
            className="h-[420px] overflow-y-auto bg-zinc-950/40 p-6"
            data-testid="messages-area"
          >
            {loading ? (
              <div className="py-12 text-center text-zinc-400">
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="py-12 text-center">
                <MessageCircle className="mx-auto mb-3 h-14 w-14 text-zinc-500" />
                <p className="text-zinc-300">
                  No messages yet. Start a conversation with our support team.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const isMyMessage = message.sender_id === user?.id;

                  return (
                    <div
                      key={index}
                      className={`flex ${
                        isMyMessage ? 'justify-end' : 'justify-start'
                      }`}
                      data-testid={`chat-message-${index}`}
                    >
                      <div
                        className={`max-w-xs rounded-xl border px-4 py-3 text-sm lg:max-w-md ${
                          isMyMessage
                            ? 'border-cyan-300/30 bg-cyan-500/20 text-cyan-50'
                            : 'border-purple-300/30 bg-purple-500/20 text-purple-50'
                        }`}
                      >
                        {!isMyMessage && (
                          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.1em] text-purple-300">
                            {message.sender_name} ({message.sender_role})
                          </p>
                        )}

                        <p className="break-words">{message.message}</p>

                        <p
                          className={`mt-1 text-xs ${
                            isMyMessage
                              ? 'text-cyan-100/80'
                              : 'text-purple-100/80'
                          }`}
                        >
                          {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div
            className="border-t border-white/10 bg-zinc-950/70 p-4"
            data-testid="message-input-area"
          >
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message to admin..."
                className="border-white/10 bg-zinc-950 text-zinc-100"
                data-testid="message-input"
              />

              <Button
                onClick={handleSendMessage}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                disabled={!newMessage.trim()}
                data-testid="send-message-btn"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </UserLayout>
  );
}