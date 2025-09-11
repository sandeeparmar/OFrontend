import React, { useState, useRef, useEffect } from 'react';

// Mock API services
const chatApi = {

  sendQuery: async (query) => {

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock responses based on query content
    if (query.toLowerCase().includes('temperature')) {
      return {
        reply: "I found temperature data for your query. The ocean temperature at the specified location is approximately 12.5°C.",
        data: {
          temperature: 12.5,
          salinity: 34.8,
          oxygen: 6.2
        },
        downloadUrl: { type: 'temperature', location: 'specified' }
      };
    } else if (query.toLowerCase().includes('salinity')) {
      return {
        reply: "Here's the salinity information. The salinity levels show typical oceanic conditions with good data coverage.",
        data: {
          temperature: 15.2,
          salinity: 35.1,
          oxygen: 5.8
        },
        downloadUrl: { type: 'salinity', location: 'indian_ocean' }
      };
    } else if (query.toLowerCase().includes('oxygen')) {
      return {
        reply: "Oxygen level data retrieved successfully. The dissolved oxygen concentration indicates healthy marine conditions.",
        data: {
          temperature: 8.9,
          salinity: 34.5,
          oxygen: 7.1
        },
        downloadUrl: { type: 'oxygen', depth: '1000m' }
      };
    } else {
      return {
        reply: "I can help you with ocean data queries. Try asking about temperature, salinity, or oxygen levels at specific coordinates or depths.",
        data: null,
        downloadUrl: null
      };
    }
  }
};

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
    <div className="h-screen flex flex-col">
      
      {/* Chat Header */}
      <div className="fixed top-0 w-full z-50 bg-gradient-to-r from-[#3f2b96] to-[#a8c0ff] shadow-lg border-b-4 border-blue-800">
        <div className="container mx-auto  py-5">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3 mr-60" >
              
              {/* Logo ocean */}
              <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg overflow-hidden cursor-pointer">
                <img 
                  src="https://as1.ftcdn.net/jpg/03/10/42/46/1000_F_310424659_USd3Coot4FUrJivOmDhCA5g0vNk3CVUW.jpg" 
                  alt="ocean_logo" 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Centered content */}
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
                  Ocean Data Assistant
                </h1>
                <p className="text-gray-100 text-sm font-medium mt-1">
                  Explore oceanographic insights with AI
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 mt-24 mb-20 overflow-y-auto p-4 bg-gray-50">
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
                      ? 'bg-teal-600 text-white'
                      : 'bg-white text-gray-800 shadow'
                  }`}
                >
                  <p>{message.text}</p>
                  
                  {message.data && (
                    <div className="mt-3 p-2 bg-gray-100 rounded">
                      <p className="text-sm font-medium text-gray-800">Data Summary:</p>
                      <p className="text-xs text-gray-600">Temperature: {message.data.temperature}°C</p>
                      <p className="text-xs text-gray-600">Salinity: {message.data.salinity} PSU</p>
                      <p className="text-xs text-gray-600">Oxygen: {message.data.oxygen} ml/l</p>
                    </div>
                  )}
                  
                  {message.downloadUrl && (
                    <button
                      onClick={() => handleDownload(message.downloadUrl)}
                      className="mt-2 px-3 py-1 bg-teal-600 text-white text-xs rounded hover:bg-teal-700 transition-colors"
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
      <div className="fixed bottom-0 w-full bg-white p-4 border-t shadow-lg">
        <div className="flex max-w-[60rem]  gap-4 ">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your question..."
            className="flex-1 w-70 border border-gray-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={loading}
          />

          <button
            onClick={handleSendMessage}
            disabled={loading || !inputMessage.trim()}
            className="bg-blue-600 w-30% text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div> 

    </div>
  );
};

export default Chatbot;