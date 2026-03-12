'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { useAppContext } from '@/context/app-context';

export const ChatInterface: React.FC = () => {
  // Destructure the new startNewChat function
  const { messages, isLoading, error, sendMessage, setMessages, startNewChat } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { professionalName } = useAppContext();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Re-focus input after each message exchange or when loading finishes
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [messages, isLoading]);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: 'How can I help you today?',
        },
      ]);
    }
  }, [setMessages, messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const currentInput = input;
    setInput('');
    inputRef.current?.focus();
    await sendMessage(currentInput);
  };

  const menuOptions = [
    {
      title: 'Manage Booking Slots',
      options: ['Open booking slot', 'Edit booking slot', 'Delete booking slot'],
    },
    {
      title: 'Manage Bookings',
      options: ['Create booking', 'Edit booking', 'Delete booking'],
    },
    {
      title: 'View Schedule',
      options: [
        "View today's schedule",
        'View schedule by date',
        'View schedule by client',
        'View upcoming bookings',
      ],
    },
  ];

  const handleMenuClick = (option: string) => {
    sendMessage(option);
  };

  const renderTableAsCards = (tableText: string, key: string) => {
    const lines = tableText.trim().split('\n');
    if (lines.length < 3) return renderText(tableText, key);

    const rawHeaders = lines[0].split('|').map(h => h.trim()).filter(Boolean);
    const rows = lines.slice(2).map(row => {
      const cells = row.split('|').map(c => c.trim()).filter(Boolean);
      const rowObj: any = {};
      rawHeaders.forEach((header, i) => {
        rowObj[header.toLowerCase()] = cells[i];
      });
      return rowObj;
    });

    return (
      <div key={key} className="grid grid-cols-1 gap-4 my-4 ml-11">
        {rows.map((row, i) => {
          const start = row['start'] || row['time'] || '';
          const end = row['end'] || '';
          const client = row['client'] || row['name'] || '';
          const status = row['status'] || '';
          const id = row['slot id'] || row['booking id'] || row['id'] || 'N/A';
          const isBooking = !!row['booking id'] || !!row['client'];

          return (
            <div key={i} className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300 overflow-hidden max-w-sm border-none">
              <div className="p-6">
                <div className="text-lg font-semibold text-gray-800">
                  {start}{end ? ` – ${end}` : ''} {client ? `- Session with ${client}` : ''}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="text-xs text-gray-400">
                    ID: <span className="font-mono">{id}</span>
                  </div>
                  {status && (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.toLowerCase() === 'available' ? 'bg-green-100 text-green-700' :
                        status.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                      {status}
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-white px-6 py-4 border-t border-gray-50 flex justify-around">
                <button
                  onClick={() => sendMessage(`Edit ${isBooking ? 'booking' : 'slot'} ${id}`)}
                  className="text-sm font-semibold text-gray-700 hover:text-blue-600 hover:scale-[1.05] active:scale-[0.95] transition-all duration-200"
                >
                  Edit {isBooking ? 'Booking' : 'Slot'}
                </button>
                <div className="w-[1px] h-4 bg-gray-100 self-center"></div>
                <button
                  onClick={() => sendMessage(`Delete ${isBooking ? 'booking' : 'slot'} ${id}`)}
                  className="text-sm font-semibold text-red-500 hover:text-red-700 hover:scale-[1.05] active:scale-[0.95] transition-all duration-200"
                >
                  Delete {isBooking ? 'Booking' : 'Slot'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderText = (text: string, baseKey: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, index) => {
      const key = `${baseKey}-${index}`;
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={key} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={key} className="bg-gray-100 px-1.5 py-0.5 rounded text-blue-600 font-mono text-xs border border-gray-200">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  const renderContent = (content: string, messageIndex: number) => {
    // Detect markdown tables
    if (content.includes('|') && content.includes('---')) {
      // Split content into text and table parts
      const parts = content.split(/(\n?\|.*\|\n(?:\|.*\|\n?)*)/g);
      return parts.map((part, partIndex) => {
        const key = `msg-${messageIndex}-part-${partIndex}`;
        if (part.trim().startsWith('|') && part.includes('---')) {
          return renderTableAsCards(part, key);
        }
        return <span key={key}>{renderText(part, key)}</span>;
      });
    }
    return renderText(content, `msg-${messageIndex}`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white max-w-5xl mx-auto w-full p-6 relative">

      {/* ADDED: A subtle header with a "New Chat" button */}
      <div className="flex justify-between items-center px-4 pb-4 border-b border-gray-100 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-6 bg-green-500 rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Mirror Assistant</h2>
        </div>
        <button
          onClick={startNewChat}
          className="text-xs font-semibold text-gray-500 hover:text-green-600 bg-gray-50 hover:bg-green-50 px-4 py-2 rounded-xl transition-all duration-200 border border-transparent hover:border-green-100 shadow-sm"
        >
          + New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 px-4">
        {messages.map((msg, index) => (
          <div key={index} className="flex flex-col">
            <div className={`flex items-start space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${msg.role === 'user' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-600'
                }`}>
                {msg.role === 'user' ? getInitials(professionalName) : 'M'}
              </div>
              <div className={`max-w-[85%] rounded-[1.25rem] px-5 py-3 text-sm ${msg.role === 'user' ? 'bg-green-600 text-white shadow-sm shadow-green-100' : 'bg-white border border-green-50/50 text-gray-800 shadow-sm'
                }`}>
                {renderContent(msg.content, index)}
              </div>
            </div>

            {/* Menu Options (Only for initial assistant message) */}
            {msg.role === 'assistant' && index === 0 && (
              <div className="ml-11 mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
                {menuOptions.map((section) => (
                  <div key={section.title} className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border-none">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-1">{section.title}</h3>
                    <div className="space-y-2">
                      {section.options.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleMenuClick(option)}
                          className="w-full text-left text-sm text-gray-700 bg-gray-50/50 hover:bg-white hover:shadow-md hover:scale-[1.02] active:scale-[0.98] px-4 py-3 rounded-xl border border-transparent hover:border-blue-100 transition-all duration-200"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold">M</div>
            <div className="flex space-x-1.5 py-4 px-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center py-4">
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-xs border border-red-100 shadow-sm">
              Error: {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Section (Unchanged) */}
      <div className="p-4 border-t border-gray-100 mt-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3 bg-white rounded-xl px-4 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-100 focus-within:bg-white transition-all">
          <button type="button" className="text-gray-400 hover:text-gray-600">
            🎤
          </button>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Write message"
            className="flex-1 bg-white text-black border-none focus:ring-0 text-sm py-2 outline-none"
          />
          <div className="flex items-center space-x-3">
            <button type="button" className="text-gray-400 hover:text-gray-600 text-lg">📎</button>
            <button type="button" className="text-gray-400 hover:text-gray-600 text-lg">🖼️</button>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all hover:shadow-lg hover:shadow-green-100 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:shadow-none disabled:scale-100"
            >
              <span>Send</span>
              <span>✈️</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};