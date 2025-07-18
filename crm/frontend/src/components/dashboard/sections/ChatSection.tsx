// components/dashboard/sections/ChatSection.tsx
import React, { useState } from 'react';
import { Send, Paperclip, Phone, Video, MoreVertical, Search } from 'lucide-react';

const ChatSection: React.FC = () => {
    // const [message, setMessage] = useState('');
    // const [selectedContact, setSelectedContact] = useState('support');

    // const contacts = [
    //     {
    //         id: 'support',
    //         name: 'Support Coordinator',
    //         avatar: 'SC',
    //         status: 'online',
    //         lastMessage: 'Hi! How can I help you today?',
    //         time: '10:30 AM',
    //         unread: 0
    //     },
    //     {
    //         id: 'sarah',
    //         name: 'Sarah Johnson',
    //         avatar: 'SJ',
    //         status: 'online',
    //         lastMessage: 'See you tomorrow for our session!',
    //         time: 'Yesterday',
    //         unread: 1
    //     },
    //     {
    //         id: 'case_manager',
    //         name: 'Case Manager',
    //         avatar: 'CM',
    //         status: 'offline',
    //         lastMessage: 'Your plan review is scheduled.',
    //         time: '2 days ago',
    //         unread: 0
    //     }
    // ];

    // const messages = [
    //     {
    //         id: 1,
    //         sender: 'support',
    //         content: 'Hi! How can I help you today?',
    //         time: '10:30 AM',
    //         isOwn: false
    //     },
    //     {
    //         id: 2,
    //         sender: 'me',
    //         content: 'Hi, I have a question about my upcoming session.',
    //         time: '10:32 AM',
    //         isOwn: true
    //     },
    //     {
    //         id: 3,
    //         sender: 'support',
    //         content: 'Of course! What would you like to know about your session?',
    //         time: '10:33 AM',
    //         isOwn: false
    //     }
    // ];

    // const sendMessage = () => {
    //     if (message.trim()) {
    //         // Handle sending message
    //         console.log('Sending message:', message);
    //         setMessage('');
    //     }
    // };

    // const handleKeyPress = (e: React.KeyboardEvent) => {
    //     if (e.key === 'Enter' && !e.shiftKey) {
    //         e.preventDefault();
    //         sendMessage();
    //     }
    // };

    return (
        <div className="h-[calc(100vh-200px)] flex bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <h1>Coming Soon...</h1>
            <div className="w-80 border-r border-gray-200 flex flex-col">
                {/* Search */}
                {/* <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div> */}

                {/* Contacts List */}
                {/* <div className="flex-1 overflow-y-auto">
                    {contacts.map((contact) => (
                        <button
                            key={contact.id}
                            onClick={() => setSelectedContact(contact.id)}
                            className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 ${selectedContact === contact.id ? 'bg-blue-50 border-r-2 border-r-blue-600' : ''
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                                        {contact.avatar}
                                    </div>
                                    {contact.status === 'online' && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium text-gray-900 truncate">{contact.name}</p>
                                        <span className="text-xs text-gray-500">{contact.time}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
                                </div>
                                {contact.unread > 0 && (
                                    <div className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                                        {contact.unread}
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div> */}
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                {/* <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                                SC
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Support Coordinator</h3>
                                <p className="text-sm text-green-600">Online now</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg">
                                <Phone className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg">
                                <Video className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div> */}

                {/* Messages */}
                {/* <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.isOwn
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-900'
                                }`}>
                                <p>{msg.content}</p>
                                <p className={`text-xs mt-1 ${msg.isOwn ? 'text-blue-100' : 'text-gray-500'
                                    }`}>
                                    {msg.time}
                                </p>
                            </div>
                        </div>
                    ))}
                </div> */}

                {/* Message Input */}
                {/* <div className="p-4 border-t border-gray-200">
                    <div className="flex items-end space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                            <Paperclip className="w-5 h-5" />
                        </button>
                        <div className="flex-1 relative">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                rows={1}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                        </div>
                        <button
                            onClick={sendMessage}
                            disabled={!message.trim()}
                            className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div> */}
            </div>
        </div>
    );
};

export default ChatSection ;
