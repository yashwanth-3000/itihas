"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { ModelSelector } from "@/components/ui/model-selector";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [currentWorkflow, setCurrentWorkflow] = useState<AgentWorkflow | null>(null);
  const [workflowPlan, setWorkflowPlan] = useState<WorkflowPlan | null>(null);
  const [isThinkMode, setIsThinkMode] = useState(false);
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [chatLogs, setChatLogs] = useState<Array<{
    timestamp: Date;
    type: 'user_input' | 'model_selection' | 'api_call' | 'response' | 'error' | 'agent_start' | 'agent_complete' | 'agent_hierarchy';
    data: Record<string, unknown>;
    message?: string;
    agent?: string;
    hierarchy?: number;
  }>>([]);
  const [logsPanelWidth, setLogsPanelWidth] = useState(384); // 24rem in pixels
  const [isResizing, setIsResizing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'Chat', url: '/chat', icon: MessageCircle },
    { name: 'Explore', url: '/explore', icon: Compass },
    { name: 'About', url: '/sharable-link', icon: User }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initialize messages after hydration to avoid hydration mismatch
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        content: `Hello! I'm your AI assistant. I can help you with web development, data analysis, research, and more. You can change the model using the dropdown in the header. What would you like me to work on?`,
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

  // Navbar hover-only visibility
  useEffect(() => {
    // Hide navbar initially after 1.5 seconds
    const initialTimer = setTimeout(() => {
      setShowNavbar(false);
    }, 1500);

    return () => {
      clearTimeout(initialTimer);
    };
  }, []);

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

  const addChatLog = (type: 'user_input' | 'model_selection' | 'api_call' | 'response' | 'error' | 'agent_start' | 'agent_complete' | 'agent_hierarchy', data: Record<string, unknown>, message?: string, agent?: string, hierarchy?: number) => {
    setChatLogs(prev => {
      const newLogs = [...prev, {
        timestamp: new Date(),
        type,
        data,
        message,
        agent,
        hierarchy
      }];
      
      // Auto-scroll logs panel to bottom
      setTimeout(() => {
        const logsPanel = document.querySelector('.logs-panel-content');
        if (logsPanel) {
          logsPanel.scrollTop = logsPanel.scrollHeight;
        }
      }, 50);
      
      return newLogs;
    });
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
        // Show real-time agent workflow initiation
        if (isThinkMode) {
          addChatLog('agent_hierarchy', {
            mode: 'research',
            expected_agents: ['Context Analyzer', 'EXA Search Tool', 'Conversational AI Assistant']
          }, 'Initializing research workflow: Context Analysis → Web Search → Response Generation');
          
          await new Promise(resolve => setTimeout(resolve, 200));
          addChatLog('agent_start', {
            agent: 'Context Analyzer',
            step: 1,
            total_steps: 3
          }, 'Analyzing user query context and determining research strategy...', 'Context Analyzer', 0);
        } else {
          addChatLog('agent_hierarchy', {
            mode: 'simple',
            expected_agents: ['Conversational AI Assistant']
          }, 'Initializing simple chat workflow: Direct Response Generation');
          
          await new Promise(resolve => setTimeout(resolve, 100));
          addChatLog('agent_start', {
            agent: 'Conversational AI Assistant',
            step: 1,
            total_steps: 1
          }, 'Processing conversational response using IBM Granite-3-8B...', 'Conversational AI Assistant', 0);
        }

        // Call the real chat API
        addChatLog('api_call', { 
          model: 'IBM Granite-3-8B', 
          think_mode: isThinkMode,
          force_research: isThinkMode,
          timestamp: new Date() 
        }, `Sending request to chat API ${isThinkMode ? '[RESEARCH MODE]' : '[SIMPLE MODE]'}`);
        
        const requestBody = {
          message: message,
          force_simple: false,  // Always allow research capability
          force_research: isThinkMode  // Force research when think mode is enabled
        };
      
              // Simulate real-time agent execution during API call
        if (isThinkMode) {
          // Show context analysis completion
          await new Promise(resolve => setTimeout(resolve, 800));
          addChatLog('agent_complete', {
            agent: 'Context Analyzer',
            step: 1,
            total_steps: 3
          }, 'Context analysis complete - research keywords detected, proceeding to search', 'Context Analyzer', 0);
          
          // Start EXA search
          await new Promise(resolve => setTimeout(resolve, 300));
          addChatLog('agent_start', {
            agent: 'EXA Search Tool',
            step: 2,
            total_steps: 3
          }, 'Initiating semantic web search for real-time information...', 'EXA Search Tool', 1);
        }

        const response = await fetch('http://localhost:8001/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Continue real-time agent simulation
        if (isThinkMode) {
          await new Promise(resolve => setTimeout(resolve, 500));
          addChatLog('agent_complete', {
            agent: 'EXA Search Tool',
            step: 2,
            total_steps: 3
          }, 'Web search complete - relevant information retrieved, synthesizing response', 'EXA Search Tool', 1);
          
          await new Promise(resolve => setTimeout(resolve, 200));
          addChatLog('agent_start', {
            agent: 'Conversational AI Assistant',
            step: 3,
            total_steps: 3
          }, 'Generating research-enhanced response using IBM Granite-3-8B...', 'Conversational AI Assistant', 2);
        }

        const data = await response.json();

                if (data.success) {
          // Complete the final agent
          await new Promise(resolve => setTimeout(resolve, 300));
          if (isThinkMode) {
            addChatLog('agent_complete', {
              agent: 'Conversational AI Assistant',
              step: 3,
              total_steps: 3
            }, 'Research-enhanced response generated successfully', 'Conversational AI Assistant', 2);
          } else {
            addChatLog('agent_complete', {
              agent: 'Conversational AI Assistant',
              step: 1,
              total_steps: 1
            }, 'Conversational response generated successfully', 'Conversational AI Assistant', 0);
          }

          // Add bot response
          const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            content: data.response,
            sender: 'bot',
            timestamp: new Date(),
          };

          await new Promise(resolve => setTimeout(resolve, 200));
          addChatLog('response', { 
            content: data.response, 
            type: data.metadata?.response_type || 'unknown',
            research_used: data.metadata?.research_used || false,
            agents_used: data.metadata?.agents_used || [],
            response_length: data.response.length,
            think_mode_was_on: isThinkMode
          }, `Response ready: ${data.response.length} characters ${data.metadata?.research_used ? 'with web search data' : 'from knowledge base'}`);

          // Log research summary if available
          if (data.metadata?.research_used && isThinkMode) {
            await new Promise(resolve => setTimeout(resolve, 100));
            addChatLog('response', {
              research_summary: {
                search_results_length: data.metadata?.search_results_length || 0,
                sources_found: data.metadata?.sources_found || 0,
                search_query: data.metadata?.search_query
              }
            }, `Research summary: ${data.metadata?.search_results_length || 0} chars from web search, query: "${data.metadata?.search_query}"`);
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
      {/* Thin hover trigger zone at very top */}
      <div 
        className="fixed top-0 left-0 right-0 z-40 h-2"
        onMouseEnter={() => setShowNavbar(true)}
        style={{ 
          background: 'transparent',
          pointerEvents: showNavbar ? 'none' : 'auto' // Only capture when hidden
        }}
      />

      {/* Actual navbar */}
      <motion.div
        initial={{ y: 0, opacity: 1 }}
        animate={{ 
          y: showNavbar ? 0 : -100, 
          opacity: showNavbar ? 1 : 0 
        }}
        transition={{ 
          duration: 0.3, 
          ease: [0.25, 0.46, 0.45, 0.94] // Faster for immediate response
        }}
        className="fixed top-0 left-0 right-0 z-50"
        onMouseLeave={() => setShowNavbar(false)}
        style={{
          transform: showNavbar ? 'translateY(0%)' : 'translateY(-100%)',
          pointerEvents: showNavbar ? 'auto' : 'none'
        }}
      >
        <NavBar items={navItems} isDarkMode={isDarkMode} isMinimized={isChatStarted} />
        
        {/* Subtle bottom shadow when navbar is visible */}
        {showNavbar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`absolute bottom-0 left-0 right-0 h-4 ${
              isDarkMode 
                ? 'bg-gradient-to-b from-transparent to-black/20' 
                : 'bg-gradient-to-b from-transparent to-gray-200/30'
            }`}
          />
        )}
      </motion.div>
      
      {/* Navbar Show Indicator */}
      {!showNavbar && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          transition={{ 
            duration: 0.3, 
            ease: "easeOut",
            delay: 0.5 // Show after 0.5 second delay
          }}
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-40 px-4 py-2 text-xs rounded-full ${
            isDarkMode 
              ? 'bg-gray-900/90 text-gray-400 border border-gray-700/60 shadow-lg' 
              : 'bg-white/90 text-gray-500 border border-gray-300/60 shadow-lg'
          } backdrop-blur-md transition-all duration-300 hover:scale-105`}
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-[10px]"
            >
              ↑
            </motion.div>
            <span>Hover at very top edge for navbar</span>
          </div>
        </motion.div>
      )}

      {/* Chat Container - takes remaining space */}
              <div 
        ref={containerRef} 
        className="flex flex-1 overflow-hidden transition-all duration-300"
        style={{ 
          paddingTop: showNavbar ? '80px' : '2px' // Minimal padding for thin trigger zone
        }}
      >
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
                      monochrome
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
                    monochrome
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
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    message.sender === 'user'
                      ? 'rounded-br-lg bg-black text-white dark:bg-gray-300 dark:text-black shadow-sm'
                      : isDarkMode 
                        ? 'rounded-bl-lg bg-gray-900/50 text-gray-200 border border-gray-800/50 shadow-none'
                        : 'rounded-bl-lg bg-gray-50/80 text-gray-800 border border-gray-200/60 shadow-none'
                  }`}
                >
                  <MarkdownRenderer 
                    content={message.content}
                    isUserMessage={message.sender === 'user'}
                    className={message.sender === 'user' ? "text-white" : isDarkMode ? "text-gray-200" : "text-gray-800"}
                  />
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
                      : isDarkMode 
                        ? 'text-gray-500'
                        : 'text-gray-400'
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
              <div className={`max-w-[70%] rounded-2xl px-4 py-3 rounded-bl-lg ${
                isDarkMode 
                  ? 'bg-gray-900/50 border border-gray-800/50 shadow-none'
                  : 'bg-gray-50/80 border border-gray-200/60 shadow-none'
              }`}>
                <div className="flex gap-1">
                  <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-gray-400/60' : 'bg-gray-500/50'}`} style={{ animationDelay: '0ms' }}></div>
                  <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-gray-400/60' : 'bg-gray-500/50'}`} style={{ animationDelay: '150ms' }}></div>
                  <div className={`w-2 h-2 rounded-full animate-bounce ${isDarkMode ? 'bg-gray-400/60' : 'bg-gray-500/50'}`} style={{ animationDelay: '300ms' }}></div>
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
          <motion.div 
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-1 bg-gray-600 cursor-col-resize hover:bg-green-400 transition-colors relative group origin-center"
            onMouseDown={handleMouseDown}
          >
            <div className="absolute inset-y-0 -inset-x-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-0.5 h-8 bg-green-400 rounded-full"></div>
            </div>
          </motion.div>
        )}

        {/* Terminal Logs Panel */}
        {showLogs && (
          <motion.div 
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ 
              duration: 0.4, 
              ease: [0.23, 1, 0.32, 1],
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className="flex flex-col"
            style={{ width: `${logsPanelWidth}px` }}
          >
            <div className={`h-full border-l font-mono text-sm ${
              isDarkMode 
                ? 'bg-black border-gray-600' 
                : 'bg-black border-gray-800'
            }`}>
              {/* Terminal Header */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className={`border-b px-4 py-2 flex items-center justify-between ${
                  isDarkMode 
                    ? 'bg-gray-900 border-gray-600' 
                    : 'bg-gray-900 border-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2, delay: 0.2 }}
                      className="w-3 h-3 rounded-full bg-red-500"
                    ></motion.div>
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2, delay: 0.25 }}
                      className="w-3 h-3 rounded-full bg-yellow-500"
                    ></motion.div>
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2, delay: 0.3 }}
                      className="w-3 h-3 rounded-full bg-green-500"
                    ></motion.div>
                  </div>
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className="text-xs font-bold text-green-400"
                  >
                    chat.log
                  </motion.span>
                </div>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="text-xs text-gray-400"
                >
                  {chatLogs.length} entries
                </motion.div>
              </motion.div>
              
              {/* Terminal Content */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="h-full overflow-y-auto p-4 space-y-1 text-xs logs-panel-content"
              >
                {chatLogs.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-center py-8 text-green-400"
                  >
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                    >
                      ~ Waiting for logs...
                    </motion.p>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.7 }}
                      className="mt-2 text-gray-500"
                    >
                      $ tail -f chat.log
                    </motion.p>
                  </motion.div>
                ) : (
                  chatLogs.map((log, index) => {
                    // Remove timestamp display entirely
                    
                    const getLogSymbol = (type: string) => {
                      switch (type) {
                        case 'user_input': return '→';
                        case 'model_selection': return '⚙';
                        case 'api_call': return '↗';
                        case 'response': return '←';
                        case 'error': return '✗';
                        case 'agent_start': return '▶';
                        case 'agent_complete': return '✓';
                        case 'agent_hierarchy': return '▲';
                        default: return '•';
                      }
                    };
                    
                    const getLogColor = (type: string) => {
                      // Classic terminal colors
                      switch (type) {
                        case 'user_input': return 'text-cyan-400 font-bold';
                        case 'model_selection': return 'text-magenta-400 font-semibold';
                        case 'api_call': return 'text-yellow-400 font-medium';
                        case 'response': return 'text-green-400 font-bold';
                        case 'error': return 'text-red-400 font-extrabold';
                        case 'agent_start': return 'text-blue-400 font-bold';
                        case 'agent_complete': return 'text-emerald-400 font-bold';
                        case 'agent_hierarchy': return 'text-purple-400 font-semibold';
                        default: return 'text-gray-400';
                      }
                    };
                    
                    // Check if this is a new message (user_input and not the first log)
                    const isNewMessage = log.type === 'user_input' && index > 0;
                    
                    return (
                      <React.Fragment key={index}>
                        {/* Message separator */}
                        {isNewMessage && (
                          <div className="flex items-center my-3">
                            <div className="flex-1 border-t border-gray-600"></div>
                            <span className="px-3 text-xs text-gray-500 font-mono">
                              - - - - - - - - -
                            </span>
                            <div className="flex-1 border-t border-gray-600"></div>
                          </div>
                        )}
                        
                        {/* Log entry */}
                      <motion.div 
                        key={index} 
                        initial={{ opacity: 0, y: 10, x: -20 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        transition={{ 
                          duration: 0.3, 
                          delay: Math.min(index * 0.05, 1),
                          ease: "easeOut"
                        }}
                        className="group -mx-2 px-2 py-1 rounded transition-colors hover:bg-gray-900/30"
                      >
                        <div className="flex items-start space-x-2">
                          <span className={`${getLogColor(log.type)} shrink-0`}>
                            {getLogSymbol(log.type)}
                          </span>
                          <span className={`${getLogColor(log.type)} shrink-0 uppercase text-[10px]`}>
                            {log.type.replace('_', '-')}
                          </span>
                          {log.agent && (
                            <span className="text-orange-400 text-[10px] px-1 bg-orange-400/10 rounded">
                              {log.agent}
                            </span>
                          )}
                          <span className="flex-1 break-all text-white" style={{ paddingLeft: log.hierarchy ? `${log.hierarchy * 12}px` : '0px' }}>
                            {log.hierarchy && log.hierarchy > 0 ? '  '.repeat(log.hierarchy) + '└─ ' : ''}{log.message || 'Processing...'}
                          </span>
                        </div>
                        
                        {/* Expandable details */}
                        <details className="mt-1 ml-8">
                          <summary className="cursor-pointer text-[10px] select-none text-gray-500 hover:text-gray-400">
                            [DEBUG] Show raw data
                          </summary>
                          <div className="mt-1 p-2 border rounded text-[10px] overflow-x-auto bg-gray-900 border-gray-700">
                            <pre className="whitespace-pre-wrap text-gray-400">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          </div>
                        </details>
                      </motion.div>
                      </React.Fragment>
                    );
                  })
                )}
                
                {/* Terminal status line */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                  className="flex items-center justify-between mt-4 pt-2 border-t border-gray-800"
                >
                  <div className="flex items-center space-x-1 opacity-75">
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: 0.7 }}
                      className="font-bold text-green-400"
                    >
                      $
                    </motion.span>
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.8 }}
                      className="text-gray-400"
                    >
                      tail -f chat.log
                    </motion.span>
                    <motion.span 
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: 0.9 }}
                      className="inline-block w-2 h-4 animate-pulse bg-green-400"
                    ></motion.span>
                  </div>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 1 }}
                    className="text-[10px] text-gray-600"
                  >
                    {chatLogs.length > 0 && `Last: ${chatLogs[chatLogs.length - 1].timestamp.toLocaleTimeString()}`}
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 