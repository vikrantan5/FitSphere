import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dumbbell, Send, MessageCircle } from 'lucide-react';
import { chatAPI } from '../utils/api';
import { initializeSocket, sendMessage, onNewMessage, disconnectSocket } from '../utils/socket';
import { toast } from 'sonner';

export default function UserChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    
    if (userData.id) {
      // Initialize socket
      initializeSocket(userData.id, userData.name, 'user');
      
      // Fetch message history
      fetchMessages();
      
      // Listen for new messages
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

    sendMessage(newMessage, user.id, user.name, 'user', null); // null receiver means admin
    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
              <Dumbbell className="h-6 w-6 text-purple-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                FitSphere
              </span>
            </div>
            <Button onClick={() => navigate('/user/dashboard')} variant="outline">Dashboard</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Chat with Support
          </h1>
          <p className="text-gray-600">Get instant help from our team</p>
        </div>

        <Card className="max-w-4xl mx-auto" data-testid="chat-container">
          {/* Messages Area */}
          <div className="h-[500px] overflow-y-auto p-6 bg-gray-50" data-testid="messages-area">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No messages yet. Start a conversation!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const isMyMessage = message.sender_id === user?.id;
                  return (
                    <div
                      key={index}
                      className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                      data-testid="chat-message"
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                          isMyMessage
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-white border border-gray-200'
                        }`}
                      >
                        {!isMyMessage && (
                          <div className="text-xs font-semibold mb-1 text-purple-600">
                            {message.sender_name} ({message.sender_role})
                          </div>
                        )}
                        <div className="break-words">{message.message}</div>
                        <div
                          className={`text-xs mt-1 ${
                            isMyMessage ? 'text-white/70' : 'text-gray-500'
                          }`}
                        >
                          {new Date(message.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t" data-testid="message-input-area">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1"
                data-testid="message-input"
              />
              <Button
                onClick={handleSendMessage}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
                disabled={!newMessage.trim()}
                data-testid="send-message-btn"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
