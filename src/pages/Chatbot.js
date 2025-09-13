import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MapPin, BarChart3, Globe, Sparkles ,Thermometer } from 'lucide-react';
import { argoFloats } from '../data/argoFloats.js';
import { generateMockData } from '../utils/dataHandlers.js';
import  ThreeDVisualization from '../components/Dashboard/ThreeDVisualization.js';
import ProfilePlots from '../components/Dashboard/ProfilePlots.js';
import ArgoFloatMap from '../components/Dashboard/ArgoFloatMap.js';
import FloatList from '../components/Dashboard/FloatList.js';


const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    switch(queryType) {
      case '3d_visualization':
        return <ThreeDVisualization argoData={data || generateMockData()} />;
      case 'profile_plots':
        return <ProfilePlots argoData={data || generateMockData()} />;
      case 'float_map':
        return (
          <div className="space-y-4">
            <ArgoFloatMap argoFloats={argoFloats} />
            <FloatList argoFloats={argoFloats} />
          </div>
        );
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

    // Simulate API delay with more realistic timing
    setTimeout(() => {
      let responseType = 'text';
      let componentToRender = null;
      let responseText = '';

      // Enhanced query detection with more keywords
      const message = messageText.toLowerCase();
      
      if (message.includes('3d') || message.includes('three') || message.includes('visualization') || message.includes('globe')) {
        responseType = 'component';
        componentToRender = '3d_visualization';
        responseText = '🌐 Here\'s the interactive 3D visualization of ARGO float data. You can explore the temperature and salinity distributions across different depths:';
      } 
      else if (message.includes('profile') || message.includes('temperature') || message.includes('salinity') || message.includes('depth')) {
        responseType = 'component';
        componentToRender = 'profile_plots';
        responseText = '📊 Here are the temperature and salinity profiles from the selected ARGO float. These show how oceanographic parameters change with depth:';
      } 
      else if (message.includes('map') || message.includes('location') || message.includes('float') || message.includes('position')) {
        responseType = 'component';
        componentToRender = 'float_map';
        responseText = '🗺️ Here\'s the interactive map showing all active ARGO float locations in the Indian Ocean region:';
      }
      else if (message.includes('summary') || message.includes('data') || message.includes('overview')) {
        responseText = '📈 **Data Summary**\n\nCurrently tracking **3 active ARGO floats** in the Indian Ocean:\n• Total profiles collected: 448\n• Latest measurements: April 2022\n• Geographic coverage: 85°E - 86°E, 5°S - 4°S\n• Parameters measured: Temperature, Salinity, Pressure\n\nWould you like to explore any specific visualization?';
      }
      else if (message.includes('help') || message.includes('what') || message.includes('how')) {
        responseText = '🤖 **I can help you with:**\n\n🌐 **3D Visualizations** - Interactive 3D plots of ocean data\n📊 **Profile Plots** - Temperature and salinity vs depth charts\n🗺️ **Float Maps** - Geographic locations of ARGO floats\n📈 **Data Analysis** - Summaries and statistics\n\n**Try asking:**\n• "Show me a 3D visualization"\n• "What are the temperature profiles?"\n• "Where are the floats located?"\n• "Give me a data summary"';
      }
      else {
        responseText = '🌊 I\'d be happy to help you explore ARGO float data! \n\nTry asking about:\n• **3D visualizations** of ocean data\n• **Temperature and salinity profiles**\n• **Float locations** on the map\n• **Data summaries** and analysis\n\nWhat interests you most?';
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
          <p className="text-sm text-gray-600 mb-3">Top :</p>
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
              <div className="flex items-start space-x-3 max-w-4xl">
                {message.type === 'bot' && (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div
                  className={`rounded-2xl px-4 py-3 max-w-none ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                      : 'bg-white text-gray-800 shadow-md border border-gray-100'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                  
                  {message.responseType === 'component' && message.component && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                      {renderComponent(message.component)}
                    </div>
                  )}

                  <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {message.type === 'user' && (
                  <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-5 h-5 text-white" />
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
