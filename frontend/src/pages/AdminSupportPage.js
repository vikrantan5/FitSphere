import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, User, Clock, Send, Search } from 'lucide-react';
import Layout from '../components/Layout';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminSupportPage() {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [users, setUsers] = useState({});

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    filterMessages();
  }, [searchQuery, messages]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get(`${API}/chat/admin/messages`, config);
      setMessages(response.data);
      setFilteredMessages(response.data);
      
      // Extract unique users
      const uniqueUsers = {};
      response.data.forEach(msg => {
        if (msg.sender_role === 'user' && !uniqueUsers[msg.sender_id]) {
          uniqueUsers[msg.sender_id] = msg.sender_name;
        }
      });
      setUsers(uniqueUsers);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load support messages');
    } finally {
      setLoading(false);
    }
  };

  const filterMessages = () => {
    if (!searchQuery) {
      setFilteredMessages(messages);
      return;
    }

    const filtered = messages.filter(msg =>
      msg.sender_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.message?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMessages(filtered);
  };

  const handleReply = async (receiverId) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const admin = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Use Socket.IO or REST API to send message
      // For now, we'll use REST API
      const payload = {
        sender_id: admin.id,
        sender_name: admin.name || 'Admin',
        sender_role: 'admin',
        receiver_id: receiverId,
        message: replyText
      };

      await axios.post(`${API}/chat/send`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Reply sent successfully');
      setReplyText('');
      fetchMessages();
    } catch (error) {
      console.error('Failed to send reply:', error);
      toast.error('Failed to send reply');
    }
  };

  const groupMessagesByUser = () => {
    const grouped = {};
    filteredMessages.forEach(msg => {
      const userId = msg.sender_role === 'user' ? msg.sender_id : msg.receiver_id;
      if (!grouped[userId]) {
        grouped[userId] = [];
      }
      grouped[userId].push(msg);
    });
    return grouped;
  };

  const groupedMessages = groupMessagesByUser();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-500">Loading support messages...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6" data-testid="admin-support-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-normal text-[#0f5132] mb-2" style={{fontFamily: 'Tenor Sans, serif'}}>Support Messages</h1>
            <p className="text-[#5a5a5a]">View and respond to user support requests</p>
          </div>
        </div>

        {/* Search */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search by user name or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="search-input"
            />
          </div>
        </Card>

        {/* Messages List */}
        <div className="space-y-4">
          {Object.keys(groupedMessages).length === 0 ? (
            <Card className="p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No support messages yet</p>
            </Card>
          ) : (
            Object.entries(groupedMessages).map(([userId, userMessages]) => (
              <Card key={userId} className="p-6" data-testid={`user-messages-${userId}`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff7f50] to-[#8b5cf6] flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#0f5132]">
                      {users[userId] || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-gray-500">{userMessages.length} messages</p>
                  </div>
                  <Button
                    onClick={() => setSelectedUserId(selectedUserId === userId ? null : userId)}
                    variant="outline"
                    size="sm"
                  >
                    {selectedUserId === userId ? 'Hide' : 'View & Reply'}
                  </Button>
                </div>

                {selectedUserId === userId && (
                  <div className="space-y-4 mt-4 border-t pt-4">
                    {/* Messages */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {userMessages.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex ${msg.sender_role === 'admin' ? 'justify-end' : 'justify-start'}`}
                          data-testid={`message-${index}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              msg.sender_role === 'admin'
                                ? 'bg-[#0f5132] text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <p className="text-sm mb-1">{msg.message}</p>
                            <div className="flex items-center gap-2 text-xs opacity-70">
                              <Clock className="w-3 h-3" />
                              <span>
                                {new Date(msg.created_at).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Reply Box */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleReply(userId);
                          }
                        }}
                        data-testid="reply-input"
                      />
                      <Button
                        onClick={() => handleReply(userId)}
                        className="bg-gradient-to-r from-[#ff7f50] to-[#8b5cf6]"
                        data-testid="send-reply-btn"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
