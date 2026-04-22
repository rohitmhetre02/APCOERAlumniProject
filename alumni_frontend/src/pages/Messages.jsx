import { useState } from 'react';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { 
  ChatBubbleLeftRightIcon, 
  PaperAirplaneIcon, 
  MagnifyingGlassIcon,
  UserCircleIcon,
  PhoneIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';

const Messages = () => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const conversations = [
    {
      id: 1,
      name: 'Jane Smith',
      avatar: 'JS',
      lastMessage: 'Hey! Are you attending the alumni meet?',
      time: '2 min ago',
      unread: 2,
      online: true,
      messages: [
        { id: 1, sender: 'Jane', text: 'Hi John! How are you?', time: '10:30 AM', isMe: false },
        { id: 2, sender: 'Me', text: 'Hey Jane! I\'m good, thanks! How about you?', time: '10:32 AM', isMe: true },
        { id: 3, sender: 'Jane', text: 'Great! Just wanted to ask about the upcoming alumni meet', time: '10:33 AM', isMe: false },
        { id: 4, sender: 'Jane', text: 'Hey! Are you attending the alumni meet?', time: '10:35 AM', isMe: false }
      ]
    },
    {
      id: 2,
      name: 'Mike Johnson',
      avatar: 'MJ',
      lastMessage: 'Thanks for the job referral!',
      time: '1 hour ago',
      unread: 0,
      online: false,
      messages: [
        { id: 1, sender: 'Mike', text: 'Hi John, I saw your post about the job opening', time: '9:00 AM', isMe: false },
        { id: 2, sender: 'Me', text: 'Yes! Would you be interested?', time: '9:15 AM', isMe: true },
        { id: 3, sender: 'Mike', text: 'Definitely! Could you refer me?', time: '9:20 AM', isMe: false },
        { id: 4, sender: 'Me', text: 'Sure, I\'ll send your resume to HR', time: '9:25 AM', isMe: true },
        { id: 5, sender: 'Mike', text: 'Thanks for the job referral!', time: '9:30 AM', isMe: false }
      ]
    },
    {
      id: 3,
      name: 'Sarah Williams',
      avatar: 'SW',
      lastMessage: 'Let\'s catch up soon!',
      time: '2 days ago',
      unread: 0,
      online: true,
      messages: [
        { id: 1, sender: 'Sarah', text: 'Hey John! Long time no see', time: '2 days ago', isMe: false },
        { id: 2, sender: 'Me', text: 'Sarah! How have you been?', time: '2 days ago', isMe: true },
        { id: 3, sender: 'Sarah', text: 'Great! Just moved to Pune', time: '2 days ago', isMe: false },
        { id: 4, sender: 'Me', text: 'That\'s awesome! We should meet up', time: '2 days ago', isMe: true },
        { id: 5, sender: 'Sarah', text: 'Let\'s catch up soon!', time: '2 days ago', isMe: false }
      ]
    },
    {
      id: 4,
      name: 'Alumni Association',
      avatar: 'AA',
      lastMessage: 'Don\'t forget about tomorrow\'s event',
      time: '3 days ago',
      unread: 1,
      online: true,
      messages: [
        { id: 1, sender: 'Alumni Association', text: 'Reminder: Tech Talk tomorrow at 6 PM', time: '3 days ago', isMe: false },
        { id: 2, sender: 'Me', text: 'Thanks! I\'ll be there', time: '3 days ago', isMe: true },
        { id: 3, sender: 'Alumni Association', text: 'Don\'t forget about tomorrow\'s event', time: '3 days ago', isMe: false }
      ]
    }
  ];

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentChat = conversations.find(conv => conv.id === selectedChat);

  const handleSendMessage = () => {
    if (message.trim() && currentChat) {
      // In real app, this would send message to backend
      console.log('Sending message:', message);
      setMessage('');
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
       

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-6">

  {/* Left Side */}
  <div className='pb-5'>
    <h1 className="text-3xl  font-bold text-gray-800">
      Messages
    </h1>
    <p className="text-gray-500">
      Connect with fellow alumni
    </p>
  </div>

  {/* Right Side Button */}
  <button className="px-4 py-2 mb-5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
    New Message
  </button>

</div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-6rem)]">
        {/* Chat List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="overflow-y-auto h-[calc(100%-5rem)]">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedChat(conv.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedChat === conv.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">{conv.avatar}</span>
                      </div>
                      {conv.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 truncate">{conv.name}</p>
                        <span className="text-xs text-gray-500">{conv.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unread > 0 && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">{conv.unread}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2">
          {currentChat ? (
            <Card className="h-full flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">{currentChat.avatar}</span>
                      </div>
                      {currentChat.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{currentChat.name}</p>
                      <p className="text-xs text-gray-500">
                        {currentChat.online ? 'Active now' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <PhoneIcon className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <VideoCameraIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentChat.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.isMe
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.isMe ? 'text-blue-100' : 'text-gray-500'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
