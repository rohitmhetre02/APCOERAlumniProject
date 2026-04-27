import { useState, useEffect, useRef } from 'react';
import { connectSocket, disconnectSocket } from '../socket';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { 
  ChatBubbleLeftRightIcon, 
  PaperAirplaneIcon, 
  UserIcon,
  AcademicCapIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const Messages = () => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const messagesEndRef = useRef(null);

  // Debug: Log unread counts changes
  useEffect(() => {
    
  }, [unreadCounts]);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// Remove /api from base URL if it exists to avoid double /api
const CLEAN_API_BASE_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (user) {
      const socket = connectSocket(user);

      socket.on('new-message', (data) => {
        
        // Update messages if it's for current chat
        if (selectedChat && 
            (data.senderId === selectedChat.id || data.receiverId === selectedChat.id)) {
          setMessages(prev => [...prev, data]);
        }
        
        // Add/update contact when receiving message
        if (data.senderId !== user.id) {
          // This is a received message, add/update sender in contacts
          setContacts(prev => {
            const existingContact = prev.find(c => c.id === data.senderId);
            let updatedContacts;
            
            if (!existingContact) {
              // Add new contact with sender info
              const newContact = {
                id: data.senderId,
                name: data.senderName || 'Unknown User',
                email: data.senderEmail || 'No email',
                role: data.senderRole || 'unknown',
                department: data.senderDepartment || 'Unknown'
              };
              updatedContacts = [newContact, ...prev];
            } else {
              // Update existing contact with last message and move to top
              updatedContacts = prev.map(c => 
                c.id === data.senderId ? { ...c } : c
              );
              // Move updated contact to top
              const updatedIndex = updatedContacts.findIndex(c => c.id === data.senderId);
              if (updatedIndex > 0) {
                const [updated] = updatedContacts.splice(updatedIndex, 1);
                updatedContacts.unshift(updated);
              }
            }
            
            // Save to localStorage for persistence
            localStorage.setItem('alumni_contacts', JSON.stringify(updatedContacts));
            return updatedContacts;
          });
        }
        
        // Update unread count for received messages
        if (data.receiverId === user.id && data.senderId !== selectedChat?.id) {
          setUnreadCounts(prev => {
            const newCounts = {
              ...prev,
              [data.senderId]: (prev[data.senderId] || 0) + 1
            };
            
            // Save to localStorage for Topbar sync
            localStorage.setItem('alumni_unread_counts', JSON.stringify(newCounts));
            return newCounts;
          });
        }
      });

      return () => {
        disconnectSocket();
      };
    }
  }, [user, selectedChat]);

  // Fetch contacts (Admin + Coordinator)
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('alumni_token');
      
      const response = await fetch(`${CLEAN_API_BASE_URL}/api/messages/contacts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      const data = await response.json();
      setContacts(data.data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for selected chat
  const fetchMessages = async (contactId) => {
    if (!contactId || contactId === 'conversations') {
      
      return;
    }
    
    try {
      const token = localStorage.getItem('alumni_token');
      
      // For demo contacts, return empty messages (no real database)
      if (contactId.startsWith('demo-')) {
        setMessages([]);
        return;
      }
      
      const response = await fetch(`${CLEAN_API_BASE_URL}/api/messages/${contactId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data.data || []);
    } catch (error) {
     
      setError('Failed to load messages');
      setMessages([]);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!message.trim() || !selectedChat) return;

    try {
      const token = localStorage.getItem('alumni_token');
      
      // For demo contacts, create mock message and emit via socket only
      if (selectedChat.id.startsWith('demo-')) {
        const mockMessage = {
          id: `demo-msg-${Date.now()}`,
          sender_id: user.id,
          receiver_id: selectedChat.id,
          message: message.trim(),
          created_at: new Date().toISOString(),
          sender_name: `${user.first_name} ${user.last_name}`,
          receiver_name: selectedChat.name
        };
        
        // Add message to UI instantly
        setMessages(prev => [...prev, mockMessage]);
        setMessage('');
        
        // Emit via socket for real-time demo
        const { getSocket } = await import('../socket');
        const socket = getSocket();
        if (socket) {
          socket.emit('send-message', {
            senderId: user.id,
            senderName: `${user.first_name} ${user.last_name}`,
            senderEmail: user.email,
            senderRole: user.role,
            senderDepartment: user.department,
            receiverId: selectedChat.id,
            message: message.trim(),
            timestamp: new Date()
          });
        }
        
        return;
      }
      
      // Real API call for actual users
      const response = await fetch(`${CLEAN_API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiver_id: selectedChat.id,
          message: message.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      const newMessage = data.data;
      
      // Add message to UI instantly
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      
      // Emit via socket for real-time
      const { getSocket } = await import('../socket');
      const socket = getSocket();
      if (socket) {
        socket.emit('send-message', {
          senderId: user.id,
          senderName: `${user.first_name} ${user.last_name}`,
          receiverId: selectedChat.id,
          message: message.trim(),
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  // Handle contact selection
  const handleContactClick = (contact) => {
    setSelectedChat(contact);
    fetchMessages(contact.id);
    
    // Clear unread count for this contact
    setUnreadCounts(prev => {
      const newCounts = {
        ...prev,
        [contact.id]: 0
      };
      // Save to localStorage for Topbar sync
      localStorage.setItem('alumni_unread_counts', JSON.stringify(newCounts));
      return newCounts;
    });
  };

  // Initialize on mount and load unread counts from localStorage
  useEffect(() => {
    // Load unread counts from localStorage for persistence
    try {
      const savedCounts = localStorage.getItem('alumni_unread_counts');
      if (savedCounts) {
        const counts = JSON.parse(savedCounts);
        setUnreadCounts(counts);
        
      }
    } catch (error) {
      console.error('Error loading unread counts from localStorage:', error);
    }
    
    fetchContacts();
  }, []);

  // Don't auto-select contacts - user must manually select
  // useEffect(() => {
  //   if (contacts.length > 0 && !selectedChat) {
  //     handleContactClick(contacts[0]);
  //   }
  // }, [contacts]);

  // Format time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Format message preview time
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get contact icon
  const getContactIcon = (role) => {
    switch (role) {
      case 'admin':
        return <ShieldCheckIcon className="w-6 h-6 text-purple-600" />;
      case 'coordinator':
        return <AcademicCapIcon className="w-6 h-6 text-blue-600" />;
      default:
        return <UserIcon className="w-6 h-6 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

return (
  <div className="flex h-[95vh] max-h-[80vh] bg-gray-50 overflow-hidden">
    {/* Left Sidebar - Contacts */}
    <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 min-w-0 bg-white border-r border-gray-200 flex flex-col`}>
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
        <p className="text-sm text-gray-500 mt-1">Chat with Admin and Coordinator</p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {contacts.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No contacts available
          </div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => handleContactClick(contact)}
              className={`p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors ${
                selectedChat?.id === contact.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  {getContactIcon(contact.role)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {contact.name}
                    </h3>
                    <div className="flex items-center ml-2 flex-shrink-0">
                      {contact.lastMessage && (
                        <span className="text-xs text-gray-500 mr-2">
                          {formatMessageTime(contact.lastMessage.timestamp)}
                        </span>
                      )}
                      {unreadCounts[contact.id] > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCounts[contact.id] > 9 ? '9+' : unreadCounts[contact.id]}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 capitalize mb-2">
                    {contact.role}
                  </p>
                  
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>

    {/* Right Side - Chat Area */}
    <div className={`${selectedChat ? 'flex' : 'hidden md:flex'} flex-1 min-w-0 flex flex-col`}>
      {selectedChat ? (
        <>
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
            <div className="flex items-center">
              {/* Back button for mobile */}
              <button
                onClick={() => setSelectedChat(null)}
                className="md:hidden mr-3 p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex-shrink-0 mr-3">
                {getContactIcon(selectedChat.role)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {selectedChat.name}
                </h3>
                <p className="text-sm text-gray-500 capitalize">
                  {selectedChat.role}
                </p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender_id === user.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                      msg.sender_id === user.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm break-words">{msg.message}</p>
                    <p className={`text-xs mt-1 ${
                      msg.sender_id === user.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(msg.created_at || msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={sendMessage}
                disabled={!message.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors flex-shrink-0"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Select a conversation
            </h3>
            <p className="text-gray-500">
              Choose a contact from the sidebar to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  </div>
  );
};

export default Messages;
