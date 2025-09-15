import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MapPin, BarChart3, Globe, Thermometer } from 'lucide-react';
import { Mic } from "lucide-react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
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
  const [selectedLang, setSelectedLang] = useState("en-US");

  // 🎙️ Speech recognition
  const { transcript, listening, resetTranscript } = useSpeechRecognition();

     const handleVoiceInput = () => {
    if (!listening) {
      resetTranscript();
      SpeechRecognition.startListening({ language: selectedLang, continuous: true });
    } else {
      SpeechRecognition.stopListening();
      if (transcript) {
        setInputMessage(transcript);
      }
    }
  }; 

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
        responseText = '🌐 This interactive 3D visualization presents data collected from ARGO floats, allowing you to explore the ocean in a highly engaging way. The visualization highlights how temperature and salinity vary across different depths of the ocean, giving a layered view of the underwater environment. By navigating through the model, you can observe patterns such as warmer surface waters gradually cooling with depth, or areas where salinity concentrations shift due to factors like evaporation, rainfall, or currents. This helps in understanding key oceanographic processes, including heat transfer, water density variations, and the circulation of ocean currents that influence global climate. The tool not only makes complex scientific data more accessible but also provides valuable insights for researchers, students, and anyone curious about how our oceans function beneath the surface.';
      } 
      else if (message.includes('profile') || message.includes('temperature') || message.includes('salinity') || message.includes('depth')) {
        responseType = 'component';
        componentToRender = 'profile_plots';
        responseText = '📊 The temperature and salinity profiles from the selected ARGO float provide a vertical snapshot of the ocean’s physical properties, showing how these parameters change with depth. The temperature profile typically reveals warmer waters near the surface, influenced by sunlight and atmospheric conditions, which gradually cool as depth increases. In contrast, the salinity profile highlights variations caused by processes such as rainfall, evaporation, river inflow, or ocean circulation. Together, these profiles are essential for understanding the ocean’s stratification, density gradients, and mixing patterns. By analyzing them, scientists can better interpret ocean dynamics, track climate-related changes, and study how energy and matter are exchanged between the ocean and the atmosphere.';
      } 
      else if (message.includes('map') || message.includes('location') || message.includes('float') || message.includes('position')) {
        responseType = 'component';
        componentToRender = 'float_map';
        responseText = '🗺️This interactive map shows the locations of all active ARGO floats currently operating in the Indian Ocean. 📍 Each marker represents the position of an individual float, pinpointing where it is collecting data beneath the ocean surface. By exploring the map, you can observe how floats are distributed across the basin, from nearshore coastal zones 🏝️ to deep offshore waters 🌊.\n The visualization highlights not only the geographic spread of floats 🌐 but also how their strategic positioning supports large-scale ocean monitoring 🔬. For instance, one float near 85°E, 5°S may record warm surface waters 🌡️ influenced by equatorial heating, while another positioned farther south could capture cooler, saltier waters 🧂 driven by deep ocean circulation.\n Together, these floats form a dynamic observing network ⚓, continuously measuring temperature, salinity, and pressure. This data is vital for tracking climate patterns 🌍, understanding ocean circulation arrows ➡️, and supporting long-term studies of the Indian Ocean’s role in the global climate system.  '
      }
      else if (message.includes('summary') || message.includes('data') || message.includes('overview')) {
        responseText = '📈At present, we are tracking 3 active ARGO floats in the Indian Ocean, each contributing valuable insights into the region’s oceanography. 🌊 These floats have together collected 448 profiles, offering a detailed view of how conditions change with depth. The most recent measurements were recorded in April 2022, providing up-to-date data for analysis. 📍 The floats are spread across the eastern Indian Ocean, covering a geographic range from 85°E to 86°E longitude and 5°S to 4°S latitude. They continuously measure key parameters such as 🌡️ Temperature, 🧂 Salinity, and ⬇️ Pressure, which are crucial for understanding ocean circulation, climate variability, and marine ecosystems. For example, a float might record warmer surface waters near the equator while detecting cooler, saltier waters at greater depths, illustrating the vertical structure of the ocean.';
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
                  className={`rounded-2xl px-4 py-1 max-w-none ${
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

        {/* 🌍 Language selector */}
   
          <select
  value={selectedLang}
  onChange={(e) => setSelectedLang(e.target.value)}
  className="absolute left-3 top-1/2 transform -translate-y-1/2 
             text-white text-sm 
             bg-gray-600 border border-gray-400 
             py-1 rounded-full
             focus:outline-none focus:ring-2 focus:ring-white focus:border-green-500 
             hover:bg-gray-400 transition-all duration-200 cursor-pointer"
>
        <option value="en-US">EN</option>
        <option value="hi-IN">हिंदी</option>
        <option value="es-ES">ES</option>
        <option value="fr-FR">FR</option>
        <option value="zh-CN">中文</option>
      </select>



        {/* ✍️ Input box */}
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Ask about ARGO data visualizations, profiles, or locations..."
          className="w-full border border-gray-300 rounded-full pl-16 pr-24 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          disabled={isLoading}
        />

        {/* 🎙️ Voice button */}
        <button
          onClick={handleVoiceInput}
          className={`absolute right-12 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all duration-200 ${
            listening ? "bg-red-500 text-white" : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* 📩 Send button */}
        <button
          onClick={handleSendMessage}
          disabled={isLoading || !inputMessage.trim()}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-2 rounded-full hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  

      </div>

    </div>
  );
};

export default Chatbot;
