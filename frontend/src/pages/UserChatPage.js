import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle } from 'lucide-react';
import { chatAPI } from '../utils/api';
import { initializeSocket, sendMessage, onNewMessage, disconnectSocket } from '../utils/socket';
import { toast } from 'sonner';
import { UserLayout } from '@/components/user/UserLayout';

export default function UserChatPage() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const messagesEndRef = useRef(null);

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
      title="Support Chat"
      subtitle="Get instant help from the FitSphere team for sessions, orders, and account queries."
    >
      <Card
        className="saas-glass-card mx-auto max-w-4xl overflow-hidden"
        data-testid="chat-container"
      >
        {/* Messages Area */}
        <div
          className="h-[520px] overflow-y-auto bg-zinc-950/40 p-6"
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
                No messages yet. Start a conversation.
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
                          : 'border-white/15 bg-white/5 text-zinc-100'
                      }`}
                    >
                      {!isMyMessage && (
                        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.1em] text-cyan-300">
                          {message.sender_name} ({message.sender_role})
                        </p>
                      )}

                      <p className="break-words">{message.message}</p>

                      <p
                        className={`mt-1 text-xs ${
                          isMyMessage
                            ? 'text-cyan-100/80'
                            : 'text-zinc-400'
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
              placeholder="Type your message"
              className="border-white/10 bg-zinc-950 text-zinc-100"
              data-testid="message-input"
            />

            <Button
              onClick={handleSendMessage}
              className="bg-cyan-500 text-zinc-950 hover:bg-cyan-400"
              disabled={!newMessage.trim()}
              data-testid="send-message-btn"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>
    </UserLayout>
  );
}