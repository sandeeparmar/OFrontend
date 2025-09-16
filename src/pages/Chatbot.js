import React, { useState, useRef, useEffect } from 'react';
import { Send, User } from 'lucide-react';
import { Mic } from "lucide-react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { argoFloats } from '../data/argoFloats.js';
import { generateMockData } from '../utils/dataHandlers.js';
import  ThreeDVisualization from '../components/Dashboard/ThreeDVisualization.js';
import ProfilePlots from '../components/Dashboard/ProfilePlots.js';
import ArgoFloatMap from '../components/Dashboard/ArgoFloatMap.js';
import FloatList from '../components/Dashboard/FloatList.js';
import { quickActions } from './quickActions.js';
import { Header } from '../components/header.js';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [selectedLang, setSelectedLang] = useState("en-US");
  const [wasListening, setWasListening] = useState(false); // Track previous listening state

  // 🎙️ Speech recognition
  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  // Auto-send message when voice recording stops
  useEffect(() => {
    // If we were listening and now we're not, and we have a transcript
    if (wasListening && !listening && transcript.trim()) {
      // Auto-send the voice message after a short delay
      setTimeout(() => {
        handleSendMessage(transcript);
        resetTranscript();
      }, 500);
    }
    setWasListening(listening);
  }, [listening, transcript, wasListening]);

  // Update input field with transcript in real-time
  useEffect(() => {
    if (listening && transcript) {
      setInputMessage(transcript);
    }
  }, [transcript, listening]);

   const handleVoiceInput = () => {
    if (!listening) {
      resetTranscript();
      setInputMessage(''); // Clear input when starting to record
      SpeechRecognition.startListening({ language: selectedLang, continuous: true });
    } else {
      SpeechRecognition.stopListening();
      // Note: Auto-send logic is handled in useEffect above
    }
  }; 


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

  // Enhanced message handling - Fixed the trim error
  const handleSendMessage = async (messageText = inputMessage) => {
    // Ensure messageText is a string and not empty
    const textToSend = String(messageText || '').trim();
    if (!textToSend) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      let responseText = "";
      let componentToRender = null;

      const message = textToSend.toLowerCase();

      if (
        message.includes("3d") ||
        message.includes("three") ||
        message.includes("visualization") ||
        message.includes("globe")
      ) {
        responseText =
          "🌐 This interactive 3D visualization presents ARGO float data. Let me generate the chart for you...";
        componentToRender = "3d_visualization";
      } else if (
        message.includes("profile") ||
        message.includes("temperature") ||
        message.includes("salinity") ||
        message.includes("depth")
      ) {
        responseText =
          "📊 Here are the temperature and salinity profiles with depth. Loading visualization...";
        componentToRender = "profile_plots";
      } else if (
        message.includes("map") ||
        message.includes("location") ||
        message.includes("float") ||
        message.includes("position")
      ) {
        responseText = "🗺️ Displaying float locations on the map...";
        componentToRender = "float_map";
      } else if (
        message.includes("summary") ||
        message.includes("data") ||
        message.includes("overview")
      ) {
        responseText =
          "📈 At present, we are tracking ARGO floats and collecting profiles. Preparing summary...";
      } else {
        responseText =
          "🌊 I'd be happy to help you explore ARGO float data! \n\nTry asking about:\n• **3D visualizations**\n• **Profiles**\n• **Float maps**\n• **Summaries**";
      }

      // Step 1: Push bot text reply
      const textReply = {
        id: Date.now() + 1,
        type: "bot",
        content: responseText,
        responseType: "text",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, textReply]);
      setIsLoading(false);

      // Step 2: If a component is needed, add it with delay
      if (componentToRender) {
        setIsLoading(true);
        setTimeout(() => {
          const componentReply = {
            id: Date.now() + 2,
            type: "bot",
            content: "", // no text, just the graph
            responseType: "component",
            component: componentToRender,
            timestamp: new Date().toISOString(),
          };

          setMessages((prev) => [...prev, componentReply]);
          setIsLoading(false);
        }, 2500); // 2.5s delay before showing graph
      }
    }, Math.random() * 1000 + 800);
  };

  // Handle quick action clicks
  const handleQuickAction = (query) => {
    handleSendMessage(query);
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">

      <Header/>
    
      {/* Quick Actions - Show when no messages or few messages */}
      {messages.length <= 1 && (
        <div className="px-6 py-4 bg-white border-b border-gray-100">
          <p className="text-sm text-gray-600 mb-3">Quick Actions:</p>
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
                     <img 
                        src="https://as1.ftcdn.net/jpg/03/10/42/46/1000_F_310424659_USd3Coot4FUrJivOmDhCA5g0vNk3CVUW.jpg" 
                        alt="Ocean Logo" 
                        className="w-full h-full object-cover rounded-full"
                      />
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
                  {/* <Bot className="w-5 h-5 text-white" /> */}
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
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 
                        text-white text-sm 
                        bg-gray-600 border border-gray-400 
                        py-1 px-2 rounded-full
                        focus:outline-none focus:ring-2 focus:ring-white focus:border-green-500 
                        hover:bg-gray-400 transition-all duration-200 cursor-pointer"
            >
              <option value="en-US">EN</option>
              <option value="hi-IN">हिंदी</option>
              <option value="es-ES">ES</option>
              <option value="fr-FR">FR</option>
              <option value="zh-CN">中文</option>
            </select>

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
              placeholder={listening ? "🎙️ Listening... Speak now!" : "Ask about ARGO data visualizations, profiles, or locations..."}
              className={`w-full border rounded-full pl-16 pr-24 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                listening 
                  ? 'border-red-300 bg-red-50 placeholder-red-600' 
                  : 'border-gray-300'
              }`}
              disabled={isLoading}
            />

            {/* 🎙️ Voice button with enhanced visual feedback */}
            <button
              onClick={handleVoiceInput}
              className={`absolute right-12 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all duration-200 ${
                listening 
                  ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-200" 
                  : "bg-gray-200 hover:bg-gray-300 text-gray-600"
              }`}
              disabled={isLoading}
              title={listening ? "Stop recording (message will auto-send)" : "Start voice recording"}
            >
              <Mic className={`w-4 h-4 ${listening ? 'animate-bounce' : ''}`} />
            </button>

            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim() || listening}
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