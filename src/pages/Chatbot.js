import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MapPin, BarChart3, Globe, Thermometer } from 'lucide-react';
import { Mic } from "lucide-react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { GoogleGenAI} from '@google/genai';
import ThreeDVisualization from '../components/Dashboard/ThreeDVisualization.js';
import ProfilePlots from '../components/Dashboard/ProfilePlots.js';
import ArgoFloatMap from '../components/Dashboard/ArgoFloatMap.js';
import FloatList from '../components/Dashboard/FloatList.js';
import { systemPrompt } from '../components/systemPrompt.js';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const [streamingComplete, setStreamingComplete] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [selectedLang, setSelectedLang] = useState("en-US");

  // Initialize Google GenAI
  const ai = new GoogleGenAI({ apiKey: 'AIzaSyB-J5Hmifh6VAculo2LhWWHCTetdl1dnso'});

 // 🎙 Speech recognition
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

  // Function to get response from Gemini
  const getGeminiResponse = async (userMessage) => {
    try {
      const chatHistory = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content, type: "text" }]
      }));

      chatHistory.push({
        role: "user",
        parts: [{ text: userMessage, type: "text" }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          { role: "user", parts: [{ text: systemPrompt }] },
          ...chatHistory
        ]
      });

      const responseText = response.candidates[0].content.parts[0].text;
      console.log(responseText);

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error("No JSON found in response");
    } catch (error) {
      console.error("Error getting response from Gemini:", error);
      return {
        responseType: "text",
        responseText: "I'm having trouble processing your request right now. Please try again later.",
        componentToRender: null,
        data: null
      };
    }
  };

  // Stream text word by word
  const streamText = (text, messageId, speed = 100) => {
    const words = text.split(' ');
    let index = 0;

    const streamInterval = setInterval(() => {
      if (index < words.length) {
        setMessages(prev => prev.map(msg =>
          msg.id === messageId
            ? { ...msg, content: msg.content + (index > 0 ? ' ' : '') + words[index] }
            : msg
        ));
        index++;
      } else {
        clearInterval(streamInterval);
        setStreamingMessageId(null);
        setStreamingComplete(true);
      }
    }, speed);
  };

  // Smooth scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Welcome message
  useEffect(() => {
    const welcomeMessage = {
      id: Date.now(),
      type: 'bot',
      content: 'Welcome to the ARGO Data Assistant! 🌊\n\nI can help you explore oceanographic data from ARGO floats...',
      timestamp: new Date().toISOString(),
      responseType: 'text',
      component: null,
      data: null,
      isStreamingComplete: true
    };
    setMessages([welcomeMessage]);
  }, []);

  // Component rendering
  const renderComponent = (queryType, data = null) => {
    switch (queryType) {
      case '3d_visualization':
        return <ThreeDVisualization argoData={data?.argoData || []} />;
      case 'profile_plots':
        return <ProfilePlots argoData={data?.argoData || []} />;
      case 'float_map':
        return (
          <div className="space-y-4">
            <ArgoFloatMap argoFloats={data?.argoFloats || []} />
            <FloatList argoFloats={data?.argoFloats || []} />
          </div>
        );
      default:
        return null;
    }
  };

const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setStreamingComplete(false);

    try {
      // Get response from Gemini
      const geminiResponse = await getGeminiResponse(messageText);
      
      const botMessageId = Date.now() + 1;
      const botMessage = {
        id: botMessageId,
        type: 'bot',
        content: '', // Start with empty content for streaming
        responseType: geminiResponse.responseType,
        component: geminiResponse.componentToRender,
        data: geminiResponse.data || null,
        timestamp: new Date().toISOString(),
        isStreamingComplete: false
      };

      setMessages(prev => [...prev, botMessage]);
      setStreamingMessageId(botMessageId);
      
      // Stream the text response word by word
      streamText(geminiResponse.responseText, botMessageId);
      
    } catch (error) {
      console.error("Error handling message:", error);
      
      // Fallback response
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: '🌊 I\'d be happy to help you explore ARGO float data! \n\nTry asking about:\n• *3D visualizations* of ocean data\n• *Temperature and salinity profiles\n• **Float locations* on the map\n• *Data summaries* and analysis\n\nWhat interests you most?',
        timestamp: new Date().toISOString(),
        responseType: 'text',
        component: null,
        data: null,
        isStreamingComplete: true
      };
      
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quick action clicks
  const handleQuickAction = (query) => {
    handleSendMessage(query);
  };

  return (
    <div className="flex flex-col mt-20  h-screen max-h-screen  bg-gray-300">
      {/* Quick actions */}
      {messages.length <= 1 && (
        <div className="px-6 py-4 bg-white border-b border-gray-100">
          <p className="text-ocean-medium text-gray-600 mb-3">Top :</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, idx) => (
              <button key={idx}
                      onClick={() => handleQuickAction(action.query)}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full text-sm transition-colors duration-200 group"
                      disabled={isLoading || streamingMessageId !== null}>
                <action.icon className="w-4 h-4"/>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <div ref={chatContainerRef} className="h-full overflow-y-auto px-6 py-4 space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="flex items-start space-x-3 max-w-4xl">
                {message.type === 'bot' && (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white"/>
                  </div>
                )}

                <div className={`rounded-2xl px-4 py-3 max-w-none ${message.type === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                  : 'bg-white text-gray-800 shadow-md border border-gray-100'}`}>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                    {streamingMessageId === message.id && <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-blink"/>}
                  </div>

                  {message.responseType === 'component' && message.component && streamingComplete && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-sm">
                      {renderComponent(message.component, message.data)}
                    </div>
                  )}

                  {/* ✅ Fixed template literal here */}
                  <div className={`text-sm mt-2 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {message.type === 'user' && (
                  <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white"/>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3 max-w-4xl">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white"/>
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

          <div ref={messagesEndRef}/>
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            {/* 🌍 Language selector */}
            <select value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-sm bg-gray-600 border border-gray-400 py-1 rounded-full focus:outline-none">
              <option value="en-US">EN</option>
              <option value="hi-IN">हिंदी</option>
              <option value="es-ES">ES</option>
              <option value="fr-FR">FR</option>
              <option value="zh-CN">中文</option>
            </select>

            {/* Input box */}
            <input type="text"
                   value={inputMessage}
                   onChange={(e) => setInputMessage(e.target.value)}
                   onKeyDown={(e) => {
                     if (e.key === "Enter" && !e.shiftKey) {
                       e.preventDefault();
                       handleSendMessage();
                     }
                   }}
                   placeholder="Ask about ARGO data..."
                   className="w-full border border-gray-300 rounded-full pl-16 pr-24 py-3 focus:ring-2 focus:ring-blue-500"
                   disabled={isLoading || streamingMessageId !== null}/>

            {/* 🎤 Voice button */}
            <button onClick={handleVoiceInput}
                    className={`absolute right-12 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all ${listening ? "bg-red-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
                    disabled={isLoading || streamingMessageId !== null}>
              <Mic size={20} />
            </button>

            {/* 📩 Send button */}
            <button onClick={handleSendMessage}
                    disabled={isLoading || !inputMessage.trim() || streamingMessageId !== null}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-2 rounded-full">
              <Send className="w-5 h-5"/>
            </button>
          </div>
        </div>
      </div>

      {/* Blinking cursor animation */}
      <style>
        {`
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
          .animate-blink {
            animation: blink 1s infinite;
          }
        `}
      </style>
    </div>
  );
};

export default Chatbot;