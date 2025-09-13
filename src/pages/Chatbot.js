import React, { useState, useRef, useEffect } from 'react';
import ThreeDVisualization from '../components/Dashboard/ThreeDVisualization.js';
import { TemperatureProfile, SalinityProfile } from '../components/Dashboard/ProfilePlots.js';
import { Send, Bot, User, MapPin, BarChart3, Globe, Waves, MessageCircle, Sparkles, Activity, Navigation, Thermometer } from 'lucide-react';
import { argoFloats } from '../data/argoFloats.js';
import { generateMockData } from '../utils/dataHandlers.js';
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
  const [currentData, setCurrentData] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Quick action buttons
  const quickActions = [
    { label: '3D Visualization', icon: Globe, query: 'Show me a 3D visualization of the data' },
    { label: 'Temperature Profiles', icon: Thermometer, query: 'Show temperature and salinity profiles' },
    { label: 'Float Locations', icon: MapPin, query: 'Show me the map with float locations' },
    { label: 'Data Summary', icon: BarChart3, query: 'Give me a summary of available data' },
  ];

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

  // Add welcome message on first load
  useEffect(() => {
    const welcomeMessage = {
      id: Date.now(),
      type: 'bot',
      content: 'Welcome to the ARGO Data Assistant! 🌊\n\nI can help you explore oceanographic data from ARGO floats. Try asking about:\n• 3D visualizations\n• Temperature and salinity profiles\n• Float locations and maps\n• Data summaries and analysis\n\nWhat would you like to explore first?',
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  }, []);

  // Component rendering logic
  const renderComponent = (queryType, data = null) => {
    const displayData = data || generateMockData();
    
    switch(queryType) {
      case '3d_visualization':
        return (
          <>
            <DataInfoTable argoData={displayData} />
            <ThreeDVisualization argoData={displayData} />
          </>
        );
      case 'temperature_profile':
        return (
          <>
            <DataInfoTable argoData={displayData} />
            <TemperatureProfile argoData={displayData} />
          </>
        );
      case 'salinity_profile':
        return (
          <>
            <DataInfoTable argoData={displayData} />
            <SalinityProfile argoData={displayData} />
          </>
        );
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
      case 'data_info':
        return <DataInfoTable argoData={displayData} />;
      default:
        return null;
    }
  };

  // Enhanced message handling
  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Generate mock data for this query
    const queryData = generateMockData();
    setCurrentData(queryData);

    // Simulate API delay with more realistic timing
    setTimeout(() => {
      let responseType = 'text';
      let componentToRender = null;
      let responseText = '';

      // Simple query detection - in real app, use NLP or more sophisticated detection
      if (inputMessage.toLowerCase().includes('3d') || inputMessage.toLowerCase().includes('three') || inputMessage.toLowerCase().includes('visualization')) {
        responseType = 'component';
        componentToRender = '3d_visualization';
        responseText = 'Here is the 3D visualization of the ARGO float data:';
      } 
      else if (inputMessage.toLowerCase().includes('profile') || inputMessage.toLowerCase().includes('temperature') || inputMessage.toLowerCase().includes('salinity')) {
        responseType = 'component';
        componentToRender = 'profile_plots';
        responseText = 'Here are the temperature and salinity profiles:';
      } 
      else if (inputMessage.toLowerCase().includes('map') || inputMessage.toLowerCase().includes('location') || inputMessage.toLowerCase().includes('float')) {
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
        component: componentToRender
      };

      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, Math.random() * 1000 + 800); // Variable delay for realism
  };

  // Handle quick action clicks
  const handleQuickAction = (query) => {
    handleSendMessage(query);
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      
      <div className="bg-white border-b bg-[#3f2b96] border-gray-400 shadow-sm px-6 py-[1.7rem]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            
           <div className="w-10 h-11 sm:w-12 sm:h-12 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg overflow-hidden cursor-pointer">
            <img 
              src="https://as1.ftcdn.net/jpg/03/10/42/46/1000_F_310424659_USd3Coot4FUrJivOmDhCA5g0vNk3CVUW.jpg" 
              alt="Ocean Logo" 
              className="w-full h-full object-cover"
            />
          </div>


            <div>
              <h1 className="text-xl font-bold text-gray-800">ARGO Data Assistant</h1>
              <p className="text-sm text-gray-600">Explore oceanographic data with AI</p>
            </div>

          </div>
        </div>
      </div>

      {/* Quick Actions - Show when no messages or few messages */}
      {messages.length <= 1 && (
        <div className="px-6 py-4 bg-white border-b border-gray-100">
          <p className="text-sm text-gray-600 mb-3">Top Search:</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickAction(action.query)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full text-sm transition-colors duration-200 group"
                disabled={isLoading}
              >
                <action.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-hidden">
        <div
          ref={chatContainerRef}
          className="h-full overflow-y-auto px-6 py-4 space-y-6"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
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
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start animate-fadeIn">
              <div className="flex items-start space-x-3 max-w-4xl">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white rounded-2xl px-4 py-3 shadow-md border border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <span className="text-sm text-gray-600 ml-2">Analyzing data...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask about ARGO data visualizations, profiles, or locations..."
              className="w-full border border-gray-300 rounded-full px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-2 rounded-full hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <Sparkles className="w-3 h-3" />
            <span>Powered by AI • Press Enter to send</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>{argoFloats.length} active floats</span>
            <span>448 total profiles</span>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default Chatbot;
