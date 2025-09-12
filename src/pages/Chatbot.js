import React, { useState, useRef, useEffect } from 'react';
import  ThreeDVisualization from '../components/Dashboard/ThreeDVisualization.js';
import ProfilePlots from '../components/Dashboard/ProfilePlots.js';
import ArgoFloatMap from '../components/Dashboard/ArgoFloatMap.js';
import FloatList from '../components/Dashboard/FloatList.js';
import { argoFloats } from '../data/argoFloats.js';
import { generateMockData } from '../utils/dataHandlers.js';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Smooth scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'nearest'
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle component rendering based on query
  const renderComponent = (queryType, data = null) => {
    switch(queryType) {
      case '3d_visualization':
        return <ThreeDVisualization argoData={data || generateMockData()} />;
      case 'profile_plots':
        return <ProfilePlots argoData={data || generateMockData()} />;
      case 'float_map':
        return (
          <div>
            <ArgoFloatMap 
              argoFloats={argoFloats} 
              handleFloatSelect={() => {}}
            />
            <div className="mt-4">
              <FloatList 
                argoFloats={argoFloats}
                selectedLocation={null}
                handleFloatSelect={() => {}}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Simulate AI response with components
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      let responseType = 'text';
      let componentToRender = null;
      let responseText = '';

      // Simple query detection - in real app, use NLP or more sophisticated detection
      if (inputMessage.toLowerCase().includes('3d') || inputMessage.toLowerCase().includes('three') || inputMessage.toLowerCase().includes('visualization')) {
        responseType = 'component';
        componentToRender = '3d_visualization';
        responseText = 'Here is the 3D visualization of the ARGO float data:';
      } else if (inputMessage.toLowerCase().includes('profile') || inputMessage.toLowerCase().includes('temperature') || inputMessage.toLowerCase().includes('salinity')) {
        responseType = 'component';
        componentToRender = 'profile_plots';
        responseText = 'Here are the temperature and salinity profiles:';
      } else if (inputMessage.toLowerCase().includes('map') || inputMessage.toLowerCase().includes('location') || inputMessage.toLowerCase().includes('float')) {
        responseType = 'component';
        componentToRender = 'float_map';
        responseText = 'Here is the map showing all ARGO float locations:';
      } else {
        responseText = 'I can help you visualize ARGO float data. Try asking about 3D visualizations, temperature/salinity profiles, or float locations on the map.';
      }

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: responseText,
        responseType,
        component: componentToRender,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <div 
          ref={chatContainerRef}
          className="h-full overflow-y-auto p-4 space-y-4 scroll-smooth"
          style={{ scrollBehavior: 'smooth' }}
        >
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-4">🌊</div>
              <p className="text-lg font-semibold">ARGO Data Assistant</p>
              <p className="text-sm">Ask me about float data visualizations, maps, or profiles</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl rounded-lg p-4 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                
                {message.responseType === 'component' && message.component && (
                  <div className="mt-4 p-3 bg-white rounded-lg shadow-md">
                    {renderComponent(message.component)}
                  </div>
                )}

                <p className="text-xs mt-2 opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-3xl rounded-lg p-4 bg-gray-100 text-gray-800">
                <div className="flex items-center">
                  <div className="animate-pulse rounded-full h-3 w-3 bg-gray-400 mr-2"></div>
                  <div className="animate-pulse rounded-full h-3 w-3 bg-gray-400 mr-2"></div>
                  <div className="animate-pulse rounded-full h-3 w-3 bg-gray-400"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about ARGO data visualizations..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <button
            onClick={() => setInputMessage("Show me the 3D visualization")}
            className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
          >
            3D View
          </button>
          <button
            onClick={() => setInputMessage("Show temperature and salinity profiles")}
            className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
          >
            Profiles
          </button>
          <button
            onClick={() => setInputMessage("Show ARGO float locations on map")}
            className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
          >
            Map
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;