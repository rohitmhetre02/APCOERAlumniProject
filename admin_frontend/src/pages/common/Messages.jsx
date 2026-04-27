import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { connectSocket, disconnectSocket } from '../../socket';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { 
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  XMarkIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const Messages = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const messagesEndRef = useRef(null);

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

      // Listen for new messages
      socket.on('new-message', (data) => {
        console.log('Admin Messages received new message:', data);
        
        // Update unread count for received messages
        if (data.receiverId === user.id && data.senderId !== selectedChat?.id) {
          setUnreadCounts(prev => {
            const newCounts = {
              ...prev,
              [data.senderId]: (prev[data.senderId] || 0) + 1
            };
            console.log('Updated admin unread counts:', newCounts);
            // Save to localStorage for Topbar sync
            localStorage.setItem('admin_unread_counts', JSON.stringify(newCounts));
            return newCounts;
          });
        }
        
        // Add/update contact when receiving message
        if (data.senderId !== user.id) {
          // This is a received message, add/update sender in contacts
          setContacts(prev => {
            const existingContact = prev.find(c => c.id === data.senderId);
            let updatedContacts;
            
            if (!existingContact) {
              // Add new contact with complete sender info
              const newContact = {
                id: data.senderId,
                name: data.senderName || 'Unknown User',
                email: data.senderEmail || 'No email',
                role: data.senderRole || 'alumni',
                department: data.senderDepartment || 'Unknown',
                lastMessage: {
                  text: data.message,
                  timestamp: data.timestamp,
                  isFromMe: false
                }
              };
              updatedContacts = [newContact, ...prev];
            } else {
              // Update existing contact with last message and move to top
              updatedContacts = prev.map(c => 
                c.id === data.senderId ? { 
                  ...c, 
                  lastMessage: {
                    text: data.message,
                    timestamp: data.timestamp,
                    isFromMe: false
                  }
                } : c
              );
              // Move updated contact to top
              const updatedIndex = updatedContacts.findIndex(c => c.id === data.senderId);
              if (updatedIndex > 0) {
                const [updated] = updatedContacts.splice(updatedIndex, 1);
                updatedContacts.unshift(updated);
              }
            }
            
            // Save to localStorage for persistence
            localStorage.setItem('admin_contacts', JSON.stringify(updatedContacts));
            return updatedContacts;
          });
        }
        
        // Only add message if it's for the current chat
        if (selectedChat && (data.senderId === selectedChat.id || data.receiverId === selectedChat.id)) {
          const newMsg = {
            id: `socket-${Date.now()}`,
            sender_id: data.senderId,
            receiver_id: data.receiverId,
            message: data.message,
            created_at: data.timestamp,
            sender_name: data.senderName,
            receiver_name: data.receiverName
          };
          
          setMessages(prev => [...prev, newMsg]);
        }
      });

      return () => {
        disconnectSocket();
      };
    }
  }, [user, selectedChat]);

  // Fetch contacts for admin - showing conversations or all alumni as fallback
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token') || localStorage.getItem('coordinator_token');
      
      let formattedContacts = [];
      
      try {
        // First try to fetch conversations (users with messages)
        const response = await fetch(`${CLEAN_API_BASE_URL}/api/messages/conversations`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const conversations = data.data || [];
          
          // Debug log to see conversations data structure
          console.log('Conversations data from API:', conversations);

          // Format conversations to match contact structure
          formattedContacts = conversations.map(conv => ({
            id: conv.user_id,
            name: conv.name || `${conv.first_name || ''} ${conv.last_name || ''}`.trim() || 'Unknown',
            email: conv.email || 'No email',
            role: conv.role || 'alumni',
            department: conv.department || 'No department',
            graduation_year: conv.graduation_year || conv.graduationYear || '',
            lastMessage: conv.last_message ? {
              text: conv.last_message.message,
              timestamp: conv.last_message.created_at,
              isFromMe: conv.last_message.sender_id === user.id
            } : null
          }));
        }
      } catch (convError) {
        console.error('Error fetching conversations:', convError);
      }

      // If no conversations found, fetch all alumni as fallback
      if (formattedContacts.length === 0) {
        console.log('No conversations found, fetching all alumni...');
        
        try {
          const alumniResponse = await fetch(`${CLEAN_API_BASE_URL}/api/alumni`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (alumniResponse.ok) {
            const alumniData = await alumniResponse.json();
            const alumni = alumniData.data || [];
            
            console.log('Alumni data from API:', alumni);

            // Format all alumni to match contact structure
            formattedContacts = alumni.map(alum => ({
              id: alum.id,
              name: alum.name || `${alum.first_name || ''} ${alum.last_name || ''}`.trim() || 'Unknown',
              email: alum.email || 'No email',
              role: alum.role || 'alumni',
              department: alum.department || 'No department',
              graduation_year: alum.graduation_year || alum.graduationYear || '',
              lastMessage: null
            }));
          }
        } catch (alumniError) {
          console.error('Error fetching alumni:', alumniError);
        }
      }

      // If there's a selected alumni from navigation, ensure they're in the list
      if (location.state?.selectedAlumniId) {
        const existingContact = formattedContacts.find(c => c.id === location.state.selectedAlumniId);
        
        if (!existingContact) {
          // Fetch the specific alumni details
          try {
            const alumniResponse = await fetch(`${CLEAN_API_BASE_URL}/api/users/${location.state.selectedAlumniId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (alumniResponse.ok) {
              const alumniData = await alumniResponse.json();
              const alumni = alumniData.data;
              
              console.log('Selected alumni data from API:', alumni);
              
              // Add alumni to contacts list with flexible name handling
              const newContact = {
                id: alumni.id,
                name: alumni.name || `${alumni.first_name || ''} ${alumni.last_name || ''}`.trim() || 'Unknown',
                email: alumni.email || 'No email',
                role: alumni.role || 'alumni',
                department: alumni.department || 'No department',
                graduation_year: alumni.graduation_year || alumni.graduationYear || '',
                lastMessage: null
              };
              
              formattedContacts = [newContact, ...formattedContacts];
            }
          } catch (error) {
            console.error('Error fetching specific alumni:', error);
          }
        }
      }

      console.log('Final formatted contacts:', formattedContacts);
      setContacts(formattedContacts);
      
      // Save to localStorage for persistence
      localStorage.setItem('admin_contacts', JSON.stringify(formattedContacts));
    } catch (error) {
      console.error('Error fetching contacts:', error);
      
      // Set specific error message based on the error
      if (error.message.includes('function max(uuid) does not exist')) {
        setError('Database error: Cannot fetch conversations. Please contact administrator.');
      } else {
        setError('Failed to load contacts: ' + (error.message || 'Unknown error'));
      }
      
      // Try to load from localStorage as fallback
      try {
        const savedContacts = localStorage.getItem('admin_contacts');
        if (savedContacts) {
          const parsedContacts = JSON.parse(savedContacts);
          console.log('Loaded contacts from localStorage fallback:', parsedContacts);
          setContacts(parsedContacts);
        }
      } catch (parseError) {
        console.error('Error parsing saved contacts:', parseError);
      }
    }
    
    setLoading(false);
  };

  // Fetch all alumni for new message modal
  const fetchAllAlumni = async () => {
    try {
      setLoadingAlumni(true);
      const token = localStorage.getItem('admin_token') || localStorage.getItem('coordinator_token');
      
      const response = await fetch(`${CLEAN_API_BASE_URL}/api/messages/alumni-list`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch alumni list');
      }

      const data = await response.json();
      const alumni = data.data || [];

      setAllAlumni(alumni);
    } catch (error) {
      console.error('Error fetching alumni:', error);
      setAllAlumni([]);
    } finally {
      setLoadingAlumni(false);
    }
  };

  // Fetch messages for selected chat
  const fetchMessages = async (contactId) => {
    if (!contactId || contactId === 'conversations') {
      console.error('Invalid contactId:', contactId);
      return;
    }
    
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('coordinator_token');
      
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
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
      setMessages([]);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!message.trim() || !selectedChat) return;

    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('coordinator_token');
      
      // Real API call only
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
      
      // Add contact to sidebar with last message
      addContactToSidebar({
        id: selectedChat.id,
        name: selectedChat.name,
        email: selectedChat.email,
        role: selectedChat.role,
        department: selectedChat.department,
        lastMessage: {
          text: message.trim(),
          timestamp: new Date(),
          isFromMe: true
        }
      });
      
      // Emit via socket for real-time
      const { getSocket } = await import('../../socket');
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
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  // Handle contact click
  const handleContactClick = (contact) => {
    setSelectedChat(contact);
    fetchMessages(contact.id);
    setError(null);
    
    // Clear unread count for this contact
    setUnreadCounts(prev => {
      const newCounts = {
        ...prev,
        [contact.id]: 0
      };
      // Save to localStorage for Topbar sync
      localStorage.setItem('admin_unread_counts', JSON.stringify(newCounts));
      return newCounts;
    });
  };

  // Add contact to sidebar when message is sent or received
  const addContactToSidebar = (contactData) => {
    setContacts(prev => {
      const exists = prev.find(c => c.id === contactData.id);
      let updatedContacts;
      
      if (!exists) {
        updatedContacts = [contactData, ...prev];
      } else {
        // Update existing contact with last message and move to top
        updatedContacts = prev.map(c => 
          c.id === contactData.id ? { ...c, ...contactData } : c
        );
        // Move the updated contact to top
        const updatedIndex = updatedContacts.findIndex(c => c.id === contactData.id);
        if (updatedIndex > 0) {
          const [updated] = updatedContacts.splice(updatedIndex, 1);
          updatedContacts.unshift(updated);
        }
      }
      
      // Save to localStorage for persistence
      localStorage.setItem('admin_contacts', JSON.stringify(updatedContacts));
      
      return updatedContacts;
    });
  };

  // Initialize on mount and auto-select first contact
  useEffect(() => {
    // Load unread counts from localStorage for persistence
    try {
      const savedCounts = localStorage.getItem('admin_unread_counts');
      if (savedCounts) {
        const counts = JSON.parse(savedCounts);
        setUnreadCounts(counts);
        console.log('Loaded admin unread counts from localStorage:', counts);
      }
    } catch (error) {
      console.error('Error loading admin unread counts from localStorage:', error);
    }
    
    // First try to load from localStorage for immediate display
    const savedContacts = localStorage.getItem('admin_contacts');
    if (savedContacts) {
      try {
        const parsedContacts = JSON.parse(savedContacts);
        if (parsedContacts.length > 0) {
          setContacts(parsedContacts);
        }
      } catch (parseError) {
        console.error('Error parsing saved contacts:', parseError);
      }
    }
    
    // Then fetch fresh data from API
    fetchContacts();
  }, []);

  // Handle navigation state for selected alumni
  useEffect(() => {
    if (location.state?.selectedAlumniId && contacts.length > 0) {
      const selectedContact = contacts.find(contact => contact.id === location.state.selectedAlumniId);
      if (selectedContact) {
        handleContactClick(selectedContact);
        // Clear the state to prevent re-selection
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, contacts]);

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
      case 'alumni':
        return <UserIcon className="w-6 h-6 text-green-600" />;
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
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <p className="text-sm text-gray-500">Chat with Alumnis</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {contacts.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No contacts available
              </h3>
              <p className="text-gray-500 mb-2">
                No alumni found in the system
              </p>
              <p className="text-sm text-gray-400">
                Please check if alumni are registered and approved in the system
              </p>
            </div>
          ) : (
            contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => handleContactClick(contact)}
                className={`p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
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
                      {contact.department && ` • ${contact.department}`}
                    </p>
                    {contact.lastMessage ? (
                      <div className="flex items-center">
                        <p className={`text-sm truncate flex-1 ${
                          unreadCounts[contact.id] > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'
                        }`}>
                          {contact.lastMessage.isFromMe && (
                            <span className="text-gray-400 mr-1">You:</span>
                          )}
                          {contact.lastMessage.text}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No messages yet</p>
                    )}
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
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedChat.name}
                  </h3>
                  <p className="text-sm text-gray-500 capitalize">
                    {selectedChat.role}
                    {selectedChat.department && ` • ${selectedChat.department}`}
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
                        {formatTime(msg.created_at)}
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
                  placeholder="Type your message..."
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
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No conversations yet
              </h3>
              <p className="text-gray-500">
                Start messaging with alumni or coordinators to see conversations here
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
          <button 
            onClick={() => setError('')}
            className="ml-2 text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default Messages;
