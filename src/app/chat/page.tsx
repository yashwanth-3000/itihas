"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { ModelSelector } from "@/components/ui/model-selector";
import { Moon, Sun, Bot, User, ArrowLeft, Home, MessageCircle, Compass, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import AgentPlan from "@/components/ui/agent-plan";
import { AgentWorkflow, WorkflowPlan } from "@/lib/agent-workflow";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  files?: File[];
  workflowId?: string; // Link to workflow plan
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [currentWorkflow, setCurrentWorkflow] = useState<AgentWorkflow | null>(null);
  const [workflowPlan, setWorkflowPlan] = useState<WorkflowPlan | null>(null);
  const [isThinkMode, setIsThinkMode] = useState(false);
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [chatLogs, setChatLogs] = useState<Array<{
    timestamp: Date;
    type: 'user_input' | 'model_selection' | 'api_call' | 'response' | 'error';
    data: Record<string, unknown>;
    message?: string;
  }>>([]);
  const [logsPanelWidth, setLogsPanelWidth] = useState(384); // 24rem in pixels
  const [isResizing, setIsResizing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'Chat', url: '/chat', icon: MessageCircle },
    { name: 'Explore', url: '/explore', icon: Compass },
    { name: 'Comics', url: '/comics', icon: BookOpen },
    { name: 'About', url: '/sharable-link', icon: User }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initialize messages after hydration to avoid hydration mismatch
  useEffect(() => {
    if (messages.length === 0) {
      const modelNames: { [key: string]: string } = {
        'gpt-3.5-turbo': 'GPT-3.5 Turbo',
        'gpt-4': 'GPT-4',
        'gpt-4-turbo': 'GPT-4 Turbo'
      };
      
      setMessages([{
        id: '1',
        content: `Hello! I'm your AI assistant powered by ${modelNames[selectedModel] || selectedModel}. I can help you with web development, data analysis, research, and more. You can change my model using the dropdown in the header. What would you like me to work on?`,
        sender: 'bot',
        timestamp: new Date(),
      }]);
    }
  }, [messages.length, selectedModel]);

  useEffect(() => {
    scrollToBottom();
    // Check if chat has started (more than 1 message means user has sent something)
    setIsChatStarted(messages.length > 1);
  }, [messages]);

  useEffect(() => {
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Clean up workflow on unmount
  useEffect(() => {
    return () => {
      if (currentWorkflow) {
        currentWorkflow.destroy();
      }
    };
  }, [currentWorkflow]);

  const handleTaskStatusChange = (taskId: string, status: string) => {
    // This could be used to manually override task status if needed
    console.log(`Task ${taskId} status change requested: ${status}`);
  };

  const handleThinkModeChange = (newThinkMode: boolean) => {
    setIsThinkMode(newThinkMode);
    
    // If think mode is disabled, clean up any existing workflow
    if (!newThinkMode && currentWorkflow) {
      currentWorkflow.destroy();
      setCurrentWorkflow(null);
      setWorkflowPlan(null);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    console.log('Model changed to:', model);
  };

  const addChatLog = (type: 'user_input' | 'model_selection' | 'api_call' | 'response' | 'error', data: Record<string, unknown>, message?: string) => {
    setChatLogs(prev => [...prev, {
      timestamp: new Date(),
      type,
      data,
      message
    }]);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = containerRect.right - e.clientX;
    const minWidth = 256; // 16rem
    const maxWidth = containerRect.width * 0.6; // 60% of container
    
    setLogsPanelWidth(Math.max(minWidth, Math.min(maxWidth, newWidth)));
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const handleSendMessage = async (message: string, files?: File[]) => {
    if (!message.trim() && !files?.length) return;

    // Log user input
    addChatLog('user_input', { message, filesCount: files?.length || 0 }, `User sent: ${message}`);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call the real chat API
      addChatLog('api_call', { 
        model: 'IBM Granite-3-8B', 
        think_mode: isThinkMode,
        force_research: isThinkMode,
        timestamp: new Date() 
      }, `Calling chat API... ${isThinkMode ? '[RESEARCH MODE]' : '[SIMPLE MODE]'}`);
      
      const requestBody = {
        message: message,
        force_simple: false,  // Always allow research capability
        force_research: isThinkMode  // Force research when think mode is enabled
      };
      
      addChatLog('api_call', { 
        request_body: requestBody,
        endpoint: 'http://localhost:8001/chat'
      }, 'Request payload prepared');
      
      const response = await fetch('http://localhost:8001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      addChatLog('api_call', { 
        status: response.status,
        status_text: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      }, `HTTP Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      addChatLog('api_call', { 
        response_data: {
          success: data.success,
          conversation_id: data.conversation_id,
          metadata: data.metadata,
          response_length: data.response?.length || 0
        }
      }, `API Response received: ${data.success ? 'SUCCESS' : 'FAILED'}`);
      
      if (data.success) {
        // Add bot response
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          sender: 'bot',
          timestamp: new Date(),
        };

        addChatLog('response', { 
          content: data.response, 
          type: data.metadata?.response_type || 'unknown',
          research_used: data.metadata?.research_used || false,
          agents_used: data.metadata?.agents_used || [],
          response_length: data.response.length,
          think_mode_was_on: isThinkMode
        }, `AI response generated (${data.metadata?.response_type || 'unknown'}) - ${data.metadata?.research_used ? 'WITH SEARCH' : 'NO SEARCH'}`);
        
        // Log research details if available
        if (data.metadata?.research_used) {
          addChatLog('response', {
            research_details: {
              agents_used: data.metadata.agents_used,
              response_type: data.metadata.response_type,
              analysis: data.metadata.analysis
            }
          }, 'Research was performed successfully');
        } else if (isThinkMode) {
          addChatLog('response', {
            warning: 'Think mode was enabled but no research was performed',
            possible_reasons: ['Query did not trigger research keywords', 'Backend logic issue']
          }, 'WARNING: Expected research but got simple response');
        }
        
        setMessages(prev => [...prev, botResponse]);

        // Show workflow info if think mode was used
        if (isThinkMode && data.metadata) {
          const workflowInfo: WorkflowPlan = {
            id: data.conversation_id,
            title: `${data.metadata.response_type === 'research_chat' ? 'Research' : 'Analysis'} Chat`,
            description: data.metadata.research_used ? 'AI chat with web search capabilities' : 'Direct AI conversation',
            type: data.metadata.response_type === 'research_chat' ? 'research' : 'analysis',
            status: 'completed',
            createdAt: new Date(),
            estimatedCompletion: new Date(),
            tasks: data.metadata.research_used ? 
              [
                { 
                  id: '1', 
                  title: 'Research Information', 
                  description: 'Search for current information relevant to user query',
                  status: 'completed' as const,
                  priority: 'high' as const,
                  level: 1,
                  dependencies: [],
                  subtasks: [],
                  estimatedDuration: 30,
                  progress: 100
                }, 
                { 
                  id: '2', 
                  title: 'Generate Response', 
                  description: 'Create comprehensive response using research findings',
                  status: 'completed' as const,
                  priority: 'high' as const,
                  level: 2,
                  dependencies: ['1'],
                  subtasks: [],
                  estimatedDuration: 15,
                  progress: 100
                }
              ] :
              [
                { 
                  id: '1', 
                  title: 'Generate Chat Response', 
                  description: 'Provide direct conversational response',
                  status: 'completed' as const,
                  priority: 'medium' as const,
                  level: 1,
                  dependencies: [],
                  subtasks: [],
                  estimatedDuration: 10,
                  progress: 100
                }
              ]
          };
          setWorkflowPlan(workflowInfo);
        }
      } else {
        throw new Error(data.error || 'Chat API returned an error');
      }
      
    } catch (error) {
      console.error('Error calling chat API:', error);
      addChatLog('error', { error: error instanceof Error ? error.message : 'Unknown error' }, 'Chat API call failed');
      
      // Fallback response
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting to the chat service right now. Please try again in a moment. If the problem persists, the chat API might not be running.",
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if we should show the workflow plan
  const lastUserMessage = messages.filter(m => m.sender === 'user').pop();

  return (
    <div className={`h-screen flex flex-col transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-black text-gray-300' 
        : 'bg-white text-black'
    }`}>
      <NavBar items={navItems} isDarkMode={isDarkMode} isMinimized={isChatStarted} />
      
      {/* Chat Container - takes remaining space */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        {/* Main Chat Area */}
        <div className={`${showLogs ? 'flex-1' : 'w-full'} flex flex-col transition-all duration-300`}>
          {/* Header moved to chat area */}
          <div className={`sticky transition-all duration-300 z-40 border-b transition-colors top-0 ${
            isDarkMode 
              ? 'bg-black/95 border-gray-800 backdrop-blur-sm' 
              : 'bg-white/95 border-gray-200 backdrop-blur-sm'
          }`}>
            <div className="max-w-4xl mx-auto px-4 py-2">
              {/* Desktop layout */}
              <div className="hidden sm:flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link 
                    href="/"
                    className={`p-2 rounded-full transition-colors ${
                      isDarkMode 
                        ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200' 
                        : 'hover:bg-gray-100 text-gray-600 hover:text-black'
                    }`}
                    aria-label="Back to home"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                  <div className={`p-2 rounded-full ${
                    isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                  }`}>
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="font-semibold text-sm">AI Assistant</h1>
                    <p className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {workflowPlan && isThinkMode
                        ? `Working on: ${workflowPlan.type} workflow`
                        : isThinkMode
                          ? 'Think mode enabled - Ready for deep analysis'
                          : 'Always here to help'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-52">
                    <ModelSelector
                      selectedModel={selectedModel}
                      onModelChange={handleModelChange}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                  
                  <button
                    onClick={toggleTheme}
                    className={`p-2 rounded-full transition-colors ${
                      isDarkMode 
                        ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200' 
                        : 'hover:bg-gray-100 text-gray-600 hover:text-black'
                    }`}
                    aria-label="Toggle theme"
                  >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Mobile layout */}
              <div className="sm:hidden space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link 
                      href="/"
                      className={`p-2 rounded-full transition-colors ${
                        isDarkMode 
                          ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200' 
                          : 'hover:bg-gray-100 text-gray-600 hover:text-black'
                      }`}
                      aria-label="Back to home"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className={`p-2 rounded-full ${
                      isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h1 className="font-semibold text-sm">AI Assistant</h1>
                    </div>
                  </div>
                  
                  <button
                    onClick={toggleTheme}
                    className={`p-2 rounded-full transition-colors ${
                      isDarkMode 
                        ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200' 
                        : 'hover:bg-gray-100 text-gray-600 hover:text-black'
                    }`}
                    aria-label="Toggle theme"
                  >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                </div>
                
                <div className="px-1">
                  <ModelSelector
                    selectedModel={selectedModel}
                    onModelChange={handleModelChange}
                    isDarkMode={isDarkMode}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {messages.map((message, index) => (
            <div key={message.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                    message.sender === 'user'
                      ? 'rounded-br-lg bg-black text-white dark:bg-gray-300 dark:text-black'
                      : 'rounded-bl-lg bg-blue-600 text-white dark:bg-blue-700 dark:text-white'
                  }`}
                >
                  <p className="text-xs leading-relaxed">{message.content}</p>
                  {message.files && message.files.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.files.map((file, index) => (
                        <div
                          key={index}
                          className={`px-2 py-1 rounded text-[10px] ${
                            message.sender === 'user'
                              ? 'bg-gray-200 text-black'
                              : 'bg-white/20 text-white border border-white/30'
                          }`}
                        >
                          📎 {file.name}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className={`text-[10px] mt-1 text-right ${
                    message.sender === 'user'
                      ? 'text-gray-400 dark:text-gray-600'
                      : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </motion.div>

              {/* Show Workflow Plan after user messages that trigger workflows */}
              {message.sender === 'user' && lastUserMessage?.id === message.id && workflowPlan && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-4"
                >

                  <div className="max-w-full">
                    <AgentPlan 
                      workflowPlan={workflowPlan}
                      onTaskStatusChange={handleTaskStatusChange}
                    />
                  </div>
                </motion.div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex justify-start"
            >
              <div className="max-w-[70%] rounded-2xl px-4 py-3 shadow-sm rounded-bl-lg bg-blue-600 text-white dark:bg-blue-700">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full animate-bounce bg-white/70" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full animate-bounce bg-white/70" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full animate-bounce bg-white/70" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </motion.div>
          )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area - Fixed at bottom of chat */}
          <div className="flex-shrink-0">
            <div className="max-w-4xl mx-auto px-4 py-4">
            <PromptInputBox 
              onSend={handleSendMessage}
              placeholder="Ask me to build a website, analyze data, research a topic, or anything else..."
              isLoading={isLoading}
              onThinkModeChange={handleThinkModeChange}
              isThinkMode={isThinkMode}
              onShowLogsToggle={() => setShowLogs(!showLogs)}
              showLogs={showLogs}
              className={`transition-colors ${
                isDarkMode 
                  ? 'bg-black border-gray-800' 
                  : 'bg-white border-gray-200'
              }`}
            />
            </div>
          </div>
        </div>

        {/* Resizable Divider */}
        {showLogs && (
          <div 
            className="w-1 bg-gray-600 cursor-col-resize hover:bg-green-400 transition-colors relative group"
            onMouseDown={handleMouseDown}
          >
            <div className="absolute inset-y-0 -inset-x-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-0.5 h-8 bg-green-400 rounded-full"></div>
            </div>
          </div>
        )}

        {/* Terminal Logs Panel */}
        {showLogs && (
          <div 
            className="flex flex-col"
            style={{ width: `${logsPanelWidth}px` }}
          >
            <div className="h-full bg-black border-l border-gray-600 font-mono text-sm">
              {/* Terminal Header */}
              <div className="bg-gray-900 border-b border-gray-600 px-4 py-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-green-400 text-xs font-bold">chat.log</span>
                </div>
                <div className="text-gray-400 text-xs">
                  {chatLogs.length} entries
                </div>
              </div>
              
              {/* Terminal Content */}
              <div className="h-full overflow-y-auto p-4 space-y-1 text-xs">
                {chatLogs.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    <p>~ Waiting for logs...</p>
                    <p className="text-gray-600 mt-2">$ tail -f chat.log</p>
                  </div>
                ) : (
                  chatLogs.map((log, index) => {
                    const timestamp = log.timestamp.toLocaleTimeString('en-US', { 
                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    });
                    const ms = log.timestamp.getMilliseconds().toString().padStart(3, '0');
                    
                    const getLogSymbol = (type: string) => {
                      switch (type) {
                        case 'user_input': return '→';
                        case 'model_selection': return '⚙';
                        case 'api_call': return '↗';
                        case 'response': return '←';
                        case 'error': return '✗';
                        default: return '•';
                      }
                    };
                    
                    const getLogColor = (type: string) => {
                      switch (type) {
                        case 'user_input': return 'text-blue-400';
                        case 'model_selection': return 'text-purple-400';
                        case 'api_call': return 'text-yellow-400';
                        case 'response': return 'text-green-400';
                        case 'error': return 'text-red-400';
                        default: return 'text-gray-400';
                      }
                    };
                    
                    return (
                      <div key={index} className="group hover:bg-gray-900/50 -mx-2 px-2 py-1 rounded transition-colors">
                        <div className="flex items-start space-x-2">
                          <span className="text-gray-500 shrink-0">
                            [{timestamp}.{ms}]
                          </span>
                          <span className={`${getLogColor(log.type)} shrink-0 font-bold`}>
                            {getLogSymbol(log.type)}
                          </span>
                          <span className={`${getLogColor(log.type)} shrink-0 uppercase text-[10px] font-bold`}>
                            {log.type.replace('_', '-')}
                          </span>
                          <span className="text-gray-300 flex-1 break-all">
                            {log.message || 'Processing...'}
                          </span>
                        </div>
                        
                        {/* Expandable details */}
                        <details className="mt-1 ml-8">
                          <summary className="cursor-pointer text-gray-500 hover:text-gray-400 text-[10px] select-none">
                            [DEBUG] Show raw data
                          </summary>
                          <div className="mt-1 p-2 bg-gray-900 border border-gray-700 rounded text-[10px] overflow-x-auto">
                            <pre className="text-gray-400 whitespace-pre-wrap">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          </div>
                        </details>
                      </div>
                    );
                  })
                )}
                
                {/* Terminal status line */}
                <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-800">
                  <div className="flex items-center space-x-1 opacity-75">
                    <span className="text-green-400">$</span>
                    <span className="text-gray-400">tail -f chat.log</span>
                    <span className="inline-block w-2 h-4 bg-green-400 animate-pulse"></span>
                  </div>
                  <div className="text-gray-600 text-[10px]">
                    {chatLogs.length > 0 && `Last: ${chatLogs[chatLogs.length - 1].timestamp.toLocaleTimeString()}`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 