import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MapPin, BarChart3, Globe, Thermometer, Droplets } from 'lucide-react';
import { Mic } from 'lucide-react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { GoogleGenAI } from '@google/genai';
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
  const [selectedLang, setSelectedLang] = useState('en-US');
  const [showSidebar, setShowSidebar] = useState(true);

  const ai = new GoogleGenAI({ apiKey: process.env.REACT_APP_GOOGLE_API_KEY || 'REPLACE_WITH_YOUR_KEY' });
  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  const handleVoiceInput = () => {
    if (!listening) {
      resetTranscript();
      SpeechRecognition.startListening({ language: selectedLang, continuous: true });
    } else {
      SpeechRecognition.stopListening();
      if (transcript) setInputMessage(prev => (prev ? prev + ' ' + transcript : transcript));
    }
  };

  const quickActions = [
    { label: '3D Visualization', icon: Globe, query: 'Show me a 3D visualization of the data', parameter: 'both' },
    { label: 'Temperature Profiles', icon: Thermometer, query: 'Show temperature profiles', parameter: 'temperature' },
    { label: 'Salinity Profiles', icon: Droplets, query: 'Show salinity profiles', parameter: 'salinity' },
    { label: 'Both Profiles', icon: BarChart3, query: 'Show both temperature and salinity profiles', parameter: 'both' },
    { label: 'Float Locations', icon: MapPin, query: 'Show me the map with float locations', parameter: 'both' },
    { label: 'Data Summary', icon: BarChart3, query: 'Give me a summary of available data', parameter: 'both' },
  ];

  const getParameterFromMessage = (messageText) => {
    const lowerMessage = messageText.toLowerCase();
    if (lowerMessage.includes('temperature') && !lowerMessage.includes('salinity')) {
      return 'temperature';
    } else if (lowerMessage.includes('salinity') && !lowerMessage.includes('temperature')) {
      return 'salinity';
    } else if (lowerMessage.includes('both') || 
              (lowerMessage.includes('temperature') && lowerMessage.includes('salinity'))) {
      return 'both';
    }
    return 'both'; // default
  };

  const getGeminiResponse = async (userMessage) => {
    try {
      const chatHistory = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content, type: 'text' }]
      }));

      chatHistory.push({ role: 'user', parts: [{ text: userMessage, type: 'text' }] });

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          ...chatHistory
        ]
      });

      const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try { return JSON.parse(jsonMatch[0]); } catch (e) {}
      }

      return { responseType: 'text', responseText, componentToRender: null, data: null };
    } catch (error) {
      console.error('Error getting response:', error);
      return { responseType: 'text', responseText: "⚠️ Error processing request. Try again.", componentToRender: null, data: null };
    }
  };

  const streamText = (text, messageId, speed = 40) => {
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
        setMessages(prev => prev.map(m => (m.id === messageId ? { ...m, isStreamingComplete: true } : m)));
      }
    }, speed);
    return () => clearInterval(streamInterval);
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    const welcomeMessage = {
      id: Date.now(), type: 'bot',
      content: 'Welcome to the ARGO Data Assistant! 🌊\n\nAsk me about maps, profiles, 3D visualizations, or summaries.\n\nYou can request specific parameters like "Show me temperature profiles" or "Display salinity data".',
      timestamp: new Date().toISOString(), responseType: 'text', component: null, data: null, isStreamingComplete: true
    };
    setMessages([welcomeMessage]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderComponent = (queryType, data = null, parameter = 'both') => {
    switch (queryType) {
      case '3d_visualization': 
        return (
          <div className="h-96 w-full">
            <ThreeDVisualization argoData={data?.argoData || []} />
          </div>
        );
      case 'profile_plots': 
        return (
          <div className="h-96 w-full">
            <ProfilePlots 
              argoData={data?.argoData || []} 
              parameter={parameter} 
            />
          </div>
        );
      case 'float_map': 
        return (
          <div className="space-y-4">
            <div className="h-96 w-full">
              <ArgoFloatMap argoFloats={data?.argoFloats || []} />
            </div>
            <div className="max-h-64 overflow-y-auto">
              <FloatList argoFloats={data?.argoFloats || []} />
            </div>
          </div>
        );
      default: return null;
    }
  };

  const handleSendMessage = async (messageText = inputMessage, parameter = null) => {
    if (!messageText.trim()) return;
    
    // Determine parameter if not provided
    const messageParameter = parameter || getParameterFromMessage(messageText);
    
    const userMessage = { 
      id: Date.now(), 
      type: 'user', 
      content: messageText, 
      timestamp: new Date().toISOString(),
      parameter: messageParameter
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setStreamingComplete(false);

    try {
      const geminiResponse = await getGeminiResponse(messageText);
      const botMessageId = Date.now() + Math.random();
      const botMessage = { 
        id: botMessageId, 
        type: 'bot', 
        content: '', 
        responseType: geminiResponse.responseType || 'text', 
        component: geminiResponse.componentToRender || null, 
        data: geminiResponse.data || null, 
        timestamp: new Date().toISOString(), 
        isStreamingComplete: false,
        parameter: messageParameter
      };
      setMessages(prev => [...prev, botMessage]);
      setStreamingMessageId(botMessageId);
      streamText(geminiResponse.responseText || 'No response text provided.', botMessageId);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    handleSendMessage(action.query, action.parameter);
  };

  const formatTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen flex items-stretch bg-gradient-to-b from-slate-900 to-slate-950 p-6 pt-24">
      <div className="mx-auto w-full max-w-6xl rounded-2xl shadow-2xl bg-slate-900/90 border border-slate-700 grid grid-cols-1 lg:grid-cols-4 h-[85vh] min-h-0">

        {/* Sidebar */}
        <aside className={`lg:col-span-1 px-4 py-6 border-r border-slate-700/50 bg-slate-900/60 hidden lg:flex flex-col`}>
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-cyan-400" />
            <h3 className="text-white font-semibold">ARGO Assistant</h3>
          </div>

          <div className="mt-6 space-y-3">
            {quickActions.map((action, i) => (
              <button key={i} onClick={() => handleQuickAction(action)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-sm text-white">
                <action.icon className="w-4 h-4 text-cyan-300" /> {action.label}
              </button>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700/40">
            <h4 className="text-slate-300 text-sm font-medium mb-2">Parameter Options:</h4>
            <div className="flex flex-col gap-2">
              <div className="px-3 py-2 rounded-lg text-sm bg-slate-800/40 text-slate-300">
                Temperature
              </div>
              <div className="px-3 py-2 rounded-lg text-sm bg-slate-800/40 text-slate-300">
                Salinity
              </div>
              <div className="px-3 py-2 rounded-lg text-sm bg-slate-800/40 text-slate-300">
                Both Parameters
              </div>
            </div>
          </div>
        </aside>

        {/* Chat area */}
        <main className="lg:col-span-3 flex flex-col h-full min-h-0">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-700/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-md bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-lg">ARGO Data Assistant</h2>
                  <p className="text-sm text-slate-300">Ask questions, or use quick actions to explore data.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-slate-300 text-sm hidden sm:block">Language</div>
                <select value={selectedLang} onChange={(e) => setSelectedLang(e.target.value)} className="bg-slate-800 text-slate-200 rounded-md px-2 py-1 text-sm border border-slate-700">
                  <option value="en-US">English</option>
                  <option value="hi-IN">हिंदी</option>
                  <option value="es-ES">Español</option>
                  <option value="fr-FR">Français</option>
                  <option value="zh-CN">中文</option>
                </select>
              </div>
            </div>
          </div>

          {/* Messages (scrollable only here) - important: min-h-0 so flex can shrink and overflow works */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide min-h-0">
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-end gap-3 max-w-[95%]`}>
                    {/* Avatar */}
                    {message.type === 'bot' && (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md flex-shrink-0">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}

                    {/* Message bubble */}
                    <div className={`message-content relative rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-full ${message.type === 'user' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-2xl' : 'bg-slate-800 text-slate-200 border border-slate-700/40'}`}>
                      <div className="whitespace-pre-wrap break-words">{message.content}</div>

                      {/* component rendering area */}
                      {message.responseType === 'component' && message.component && message.isStreamingComplete && (
                        <div className="mt-3 bg-slate-900/70 rounded-xl border border-slate-700/50 shadow-inner overflow-hidden">
                          {renderComponent(message.component, message.data, message.parameter)}
                        </div>
                      )}

                      {/* streaming indicator */}
                      {streamingMessageId === message.id && (
                        <div className="absolute -right-3 top-3 w-2 h-6 bg-cyan-400 rounded animate-pulse" />
                      )}

                      <div className="text-[11px] mt-2 text-slate-400">{formatTime(message.timestamp)}</div>
                    </div>

                    {/* user avatar on right */}
                    {message.type === 'user' && (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-md flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3 max-w-[95%]">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-slate-800 rounded-2xl px-4 py-3 shadow border border-slate-700/40">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.08s' }} />
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.16s' }} />
                        <div className="text-xs text-slate-300 ml-2">Analyzing data...</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Fixed Input area - always visible (outside scrollable messages) */}
          <div className="px-6 py-4 bg-gradient-to-t from-slate-900/80 to-slate-800/50 border-t border-slate-700/50">
            <div className="max-w-4xl mx-auto flex items-center gap-3">
              <div className="relative flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  rows={1}
                  placeholder="Ask about ARGO data, e.g. 'Show me temperature profiles' or 'Display salinity data'"
                  className="w-full resize-none bg-slate-800 text-slate-100 placeholder-slate-500 rounded-full pl-4 pr-28 py-3 text-sm max-h-36 overflow-y-auto"
                  disabled={isLoading || streamingMessageId !== null}
                />

                {/* Mic button */}
                <button
                  onClick={handleVoiceInput}
                  disabled={isLoading || streamingMessageId !== null}
                  aria-label="Toggle microphone"
                  className={`absolute right-20 top-1/2 -translate-y-1/2 p-2 rounded-full ${listening ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}>
                  <Mic className="w-4 h-4" />
                </button>

                {/* Send button */}
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputMessage.trim() || streamingMessageId !== null}
                  aria-label="Send message"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white p-2 rounded-full shadow">
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Extra tools */}
              <div className="flex items-center gap-2">
                <div className="text-sm text-slate-300 hidden sm:block">Voice: {listening ? <span className="text-emerald-300">On</span> : <span className="text-slate-400">Off</span>}</div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        /* important: allow flex children to shrink properly */
        .min-h-0 { min-height: 0; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        /* constrain media inside message bubbles so they don't overflow */
        .message-content img, .message-content video, .message-content iframe {
          max-width: 100%;
          height: auto;
          display: block;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default Chatbot;