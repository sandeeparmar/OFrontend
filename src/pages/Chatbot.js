import React, { useState, useRef, useEffect } from 'react';
import { chatApi, oceanDataApi } from '../services/mockApi';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { text: inputMessage, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const data = await chatApi.sendQuery(inputMessage);
      
      const botMessage = { 
        text: data.reply, 
        sender: 'bot',
        data: data.data,
        downloadUrl: data.downloadUrl
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { 
        text: 'Sorry, I encountered an error. Please try again.', 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (params) => {
    try {
      // In a real app, this would download a CSV file
      // For demo, we'll just show a success message
      alert('CSV download functionality would be implemented here with real backend API');
      
      // This would be the actual implementation:
      // const response = await oceanDataApi.downloadCsv(params);
      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.style.display = 'none';
      // a.href = url;
      // a.download = 'ocean_data.csv';
      // document.body.appendChild(a);
      // a.click();
      // window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Ocean Data Assistant</h1>
        <p className="text-gray-600">Ask questions about oceanographic data</p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>Welcome to the Ocean Data Assistant!</p>
            <p className="mt-2">Ask me about ocean temperature, salinity, or other data.</p>
            <div className="mt-6 space-y-2 text-sm">
              <p className="font-medium">Try asking:</p>
              <p>"What's the temperature at 20N, 150W, 1000m?"</p>
              <p>"Show me salinity data for the Indian Ocean"</p>
              <p>"Find oxygen levels at 1000m depth"</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg p-4 ${
                    message.sender === 'user'
                      ? 'bg-ocean-medium text-white'
                      : 'bg-white text-gray-800 shadow'
                  }`}
                >
                  <p>{message.text}</p>
                  
                  {message.data && (
                    <div className="mt-3 p-2 bg-gray-100 rounded">
                      <p className="text-sm font-medium">Data Summary:</p>
                      <p className="text-xs">Temperature: {message.data.temperature}°C</p>
                      <p className="text-xs">Salinity: {message.data.salinity} PSU</p>
                      <p className="text-xs">Oxygen: {message.data.oxygen} ml/l</p>
                    </div>
                  )}
                  
                  {message.downloadUrl && (
                    <button
                      onClick={() => handleDownload(message.downloadUrl)}
                      className="mt-2 px-3 py-1 bg-ocean-medium text-white text-xs rounded hover:bg-ocean-dark"
                    >
                      Download CSV
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 shadow rounded-lg p-4">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your question..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-ocean-medium"
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            disabled={loading || !inputMessage.trim()}
            className="bg-ocean-medium text-white px-4 py-2 rounded-lg hover:bg-ocean-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;