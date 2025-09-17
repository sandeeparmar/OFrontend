import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MapPin, BarChart3, Globe, Thermometer } from 'lucide-react';
import { Mic } from "lucide-react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ThreeDVisualization from '../components/Dashboard/ThreeDVisualization.js';
import ProfilePlots from '../components/Dashboard/ProfilePlots.js';
import ArgoFloatMap from '../components/Dashboard/ArgoFloatMap.js';
import FloatList from '../components/Dashboard/FloatList.js';

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
  const ai = new GoogleGenerativeAI(process.env.REACT_APP_GOOGLE_API_KEY);


  // System prompt for Gemini with data generation instructions
 const systemPrompt = `You are an ARGO Data Assistant that helps users explore oceanographic data from ARGO floats. 
Respond in JSON format with the following structure:
{
  "responseType": "text" or "component",
  "responseText": "Your comprehensive response here",
  "componentToRender": null or one of ["3d_visualization", "profile_plots", "float_map"],
  "data": null or { // Only include when componentToRender is specified
    "argoData": [ // For 3d_visualization and profile_plots
      {
        "PRES": number, // Pressure in dbar
        "TEMP": number, // Temperature in °C
        "PSAL": number, // Practical salinity
        "LATITUDE": number, // Latitude coordinate
        "LONGITUDE": number, // Longitude coordinate
        "depth": number, // Depth in meters
        "JULD": string // Date in ISO format
      },
      // More data points...
    ],
    "argoFloats": [ // For float_map
      {
        "platform_number": string, // Float identifier
        "latitude": number, 
        "longitude": number,
        "time": string, // Date in ISO format
        "temperature": number, // Current temperature
        "salinity": number // Current salinity
      },
      // More float data...
    ]
  }
}

CRITICAL RULES:
1. You MUST always respond with valid JSON in the specified format
2. For natural language queries (questions, explanations, summaries), provide a comprehensive answer in responseText and set componentToRender and data to null
3. Only generate data when the user specifically requests a visualization (3D, plots, or map)
4. If generating a component, include realistic data in the "data" field
5. Use realistic oceanographic values for any data you generate

DECISION GUIDELINES:
1. If the user asks a question that can be answered with text (e.g., "What is the thermocline?", "Explain salinity variations"), use "text" response type with null component and data
2. If the user explicitly requests a visualization (e.g., "Show me a 3D visualization", "Display temperature profiles"), use the appropriate component type and generate data
3. For map requests, only generate data if the user specifically asks to see float locations on a map

IMPORTANT RULES:
1. Always provide detailed, educational responses about oceanography and ARGO data
2. Use emojis and engaging language when appropriate
3. Stay within the domain of ARGO floats and oceanographic data
4. For text responses, be comprehensive and include relevant data points, facts, and explanations

ENHANCEMENT GUIDELINES:
- Include realistic numbers and data points in text responses
- Use relevant emojis to make the response visually appealing (🌊📊🌡🧭🗺🔍)
- Structure responses with clear sections and line breaks for readability
- Make data come alive with comparisons and context
- Use descriptive language that paints a picture of the ocean environment
- Include interesting facts about oceanography where relevant

EXAMPLE RESPONSES:
For natural language query: 
{
  "responseType": "text",
  "responseText": "🌊 The thermocline is a layer in the ocean where temperature changes rapidly with depth. In tropical regions, it typically occurs between 100-500 meters depth. For example, in the Indian Ocean, surface temperatures might be 28-30°C 🌡, dropping to 10-15°C ❄ at the base of the thermocline. This layer is crucial because it acts as a barrier to mixing between warm surface waters and cold deep waters. ARGO floats have recorded thermocline depths varying from 50m in areas with strong mixing to over 200m in stratified regions. 📊",
  "componentToRender": null,
  "data": null
}

For visualization request:
{
  "responseType": "component",
  "responseText": "🌐✨ Here's your 3D visualization of ocean temperature data from the Indian Ocean! This shows how temperature varies from 29.5°C at the surface to 2.1°C at 2000m depth, with the thermocline clearly visible around 100-300m.",
  "componentToRender": "3d_visualization",
  "data": {
    "argoData": [
      {"PRES": 0, "TEMP": 29.5, "PSAL": 35.2, "LATITUDE": -4.95, "LONGITUDE": 86.092, "depth": 0, "JULD": "2024-05-01T00:00:00Z"},
      {"PRES": 100, "TEMP": 22.1, "PSAL": 35.4, "LATITUDE": -4.95, "LONGITUDE": 86.092, "depth": 100, "JULD": "2024-05-01T00:00:00Z"},
      // More data points...
    ]
  }
}

For map request:
{
  "responseType": "component",
  "responseText": "🗺📍 Here are the current locations of ARGO floats in the Indian Ocean! These floats are continuously monitoring ocean conditions, with surface temperatures ranging from 28°C near the equator to 22°C in southern regions.",
  "componentToRender": "float_map",
  "data": {
    "argoFloats": [
      {"platform_number": "3901", "latitude": 8.5, "longitude": 72.3, "time": "2024-05-20T08:30:00Z", "temperature": 30.2, "salinity": 35.1},
      {"platform_number": "4207", "latitude": -12.8, "longitude": 85.4, "time": "2024-05-19T14:45:00Z", "temperature": 22.5, "salinity": 36.1},
      // More float data...
    ]
  }
}

ERROR HANDLING:
If you cannot process a request, still return valid JSON like:
{
  "responseType": "text",
  "responseText": "I'm having difficulty processing your request. Could you please rephrase or ask about ARGO float data, oceanography, or request a visualization? 🌊🤖",
  "componentToRender": null,
  "data": null
}

Remember to always respond in the specified JSON format with engaging, educational content about oceanography. you always have to send json only and even if any vague query you have to answer always and always in json in responseText whatever you want to say if you don't get context ask user to clearify it in {"responseText": } only with clear things you never and never have to reply in a normal text like "yes this and that" you always strictly reply in json in above format and your concern in responseText otherwise our site will be crashed`;

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

  // Handle messages
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
      const geminiResponse = await getGeminiResponse(messageText);

      const botMessageId = Date.now() + 1;
      const botMessage = {
        id: botMessageId,
        type: 'bot',
        content: '',
        responseType: geminiResponse.responseType,
        component: geminiResponse.componentToRender,
        data: geminiResponse.data || null,
        timestamp: new Date().toISOString(),
        isStreamingComplete: false
      };

      setMessages(prev => [...prev, botMessage]);
      setStreamingMessageId(botMessageId);

      streamText(geminiResponse.responseText, botMessageId);
    } catch (error) {
      console.error("Error handling message:", error);
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: '🌊 I\'d be happy to help you explore ARGO float data!...',
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

  const handleQuickAction = (query) => {
    handleSendMessage(query);
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white border-b py-6 bg-gradient-to-r from-blue-800 to-blue-500 shadow-lg text-white gap-2 z-50 px-6 py-[1.7rem]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-11 sm:w-12 sm:h-12 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg overflow-hidden cursor-pointer">
            <img src="https://as1.ftcdn.net/jpg/03/10/42/46/1000_F_310424659_USd3Coot4FUrJivOmDhCA5g0vNk3CVUW.jpg"
                 alt="Ocean Logo"
                 className="w-full h-full object-cover"/>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-wide drop-shadow-sm">ARGO Data Assistant</h1>
            <p className="text-sm md:text-base font-light opacity-90 drop-shadow-sm">Explore oceanographic data with AI</p>
          </div>
        </div>
      </div>

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