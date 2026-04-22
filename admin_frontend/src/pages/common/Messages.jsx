import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Messages = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageInput, setMessageInput] = useState('');

  // Mock conversations data
  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      lastMessage: 'Hi, I wanted to inquire about the upcoming alumni meet.',
      timestamp: '2 hours ago',
      unread: 2,
      status: 'active',
      avatar: 'JD'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      lastMessage: 'Thank you for the job opportunity information.',
      timestamp: '1 day ago',
      unread: 0,
      status: 'active',
      avatar: 'JS'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      lastMessage: 'Is there any way to update my profile information?',
      timestamp: '3 days ago',
      unread: 1,
      status: 'inactive',
      avatar: 'MJ'
    }
  ]);

  // Mock messages for selected conversation
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'user',
      content: 'Hi, I wanted to inquire about the upcoming alumni meet.',
      timestamp: '2 hours ago',
      senderName: 'John Doe'
    },
    {
      id: 2,
      sender: 'admin',
      content: 'Hello John! The alumni meet is scheduled for April 15th at APCOER campus. Registration is now open.',
      timestamp: '2 hours ago',
      senderName: 'Admin'
    },
    {
      id: 3,
      sender: 'user',
      content: 'Great! How can I register for the event?',
      timestamp: '2 hours ago',
      senderName: 'John Doe'
    }
  ]);

  const filteredConversations = conversations.filter(conv => {
    return conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           conv.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedConversation) {
      const newMessage = {
        id: messages.length + 1,
        sender: 'admin',
        content: messageInput,
        timestamp: 'Just now',
        senderName: 'Admin'
      };
      
      setMessages([...messages, newMessage]);
      setMessageInput('');
      
      // Update conversation last message
      setConversations(conversations.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, lastMessage: messageInput, timestamp: 'Just now', unread: 0 }
          : conv
      ));
    }
  };

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    // Mark as read
    setConversations(conversations.map(conv => 
      conv.id === conversation.id ? { ...conv, unread: 0 } : conv
    ));
  };

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Communicate with alumni members</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => selectConversation(conversation)}
                  className={`p-4 border-b cursor-pointer transition-colors ${
                    selectedConversation?.id === conversation.id
                      ? 'bg-blue-50 border-l-4 border-l-blue-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-blue-600">{conversation.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-900 truncate">{conversation.name}</h3>
                        <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`w-2 h-2 rounded-full ${
                          conversation.status === 'active' ? 'bg-green-400' : 'bg-gray-300'
                        }`}></span>
                        {conversation.unread > 0 && (
                          <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                            {conversation.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {selectedConversation.avatar}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{selectedConversation.name}</h3>
                      <p className="text-sm text-gray-500">{selectedConversation.email}</p>
                    </div>
                    <div className="ml-auto">
                      <span className={`w-2 h-2 rounded-full ${
                        selectedConversation.status === 'active' ? 'bg-green-400' : 'bg-gray-300'
                      }`}></span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${
                        message.sender === 'admin' ? 'order-2' : 'order-1'
                      }`}>
                        <div className={`px-4 py-2 rounded-lg ${
                          message.sender === 'admin'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${
                          message.sender === 'admin' ? 'justify-end' : 'justify-start'
                        }`}>
                          <ClockIcon className="w-3 h-3" />
                          <span>{message.timestamp}</span>
                          {message.sender === 'admin' && (
                            <CheckCircleIcon className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Type your message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      className="px-4"
                    >
                      <PaperAirplaneIcon className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messages;
