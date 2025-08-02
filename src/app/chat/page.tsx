"use client";

import { useState, useRef, useEffect } from "react";
import { PromptInputBox } from "@/components/ui/ai-prompt-box";
import { Moon, Sun, Bot, User } from "lucide-react";
import { motion } from "framer-motion";
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI assistant. I can help you with web development, data analysis, research, and more. What would you like me to work on?",
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentWorkflow, setCurrentWorkflow] = useState<AgentWorkflow | null>(null);
  const [workflowPlan, setWorkflowPlan] = useState<WorkflowPlan | null>(null);
  const [isThinkMode, setIsThinkMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
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
  }, []);

  const handleSendMessage = async (message: string, files?: File[]) => {
    if (!message.trim() && !files?.length) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      sender: 'user',
      timestamp: new Date(),
      files: files,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Only create workflow if think mode is enabled or message has [Think: prefix
    const shouldCreateWorkflow = isThinkMode || message.startsWith('[Think:');

    if (shouldCreateWorkflow) {
      // Stop previous workflow if exists
      if (currentWorkflow) {
        currentWorkflow.destroy();
      }

      // Create new workflow based on user message
      const workflow = new AgentWorkflow({
        onPlanUpdate: (plan: WorkflowPlan) => {
          setWorkflowPlan({ ...plan }); // Force re-render with new object
        },
        onTaskComplete: (taskId: string) => {
          // Could add completion notifications here
          console.log(`Task completed: ${taskId}`);
        },
        onWorkflowComplete: () => {
          // Add completion message
          const completionMessage: Message = {
            id: (Date.now() + 100).toString(),
            content: "🎉 Workflow completed successfully! All tasks have been finished. Is there anything else you'd like me to help you with?",
            sender: 'bot',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, completionMessage]);
        }
      });

      try {
        // Generate workflow plan
        const plan = workflow.generatePlan(message);
        setCurrentWorkflow(workflow);
        setWorkflowPlan(plan);

        // Start execution
        workflow.startExecution();

        // Generate initial response
        setTimeout(() => {
          const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            content: workflow.generateResponse(),
            sender: 'bot',
            timestamp: new Date(),
            workflowId: plan.id,
          };

          setMessages(prev => [...prev, botResponse]);
          setIsLoading(false);
        }, 1000);

      } catch (error) {
        console.error('Error creating workflow:', error);
        
        // Fallback response
        setTimeout(() => {
          const errorResponse: Message = {
            id: (Date.now() + 1).toString(),
            content: "I understand your request, but I'm having trouble creating a workflow plan right now. Could you try rephrasing your request or ask me something else?",
            sender: 'bot',
            timestamp: new Date(),
          };

          setMessages(prev => [...prev, errorResponse]);
          setIsLoading(false);
        }, 1000);
      }
    } else {
      // Simple response without workflow
      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: "I understand your request. For more detailed analysis and step-by-step processing, try enabling Think mode using the brain icon in the input area!",
          sender: 'bot',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, botResponse]);
        setIsLoading(false);
      }, 1000);
    }
  };

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

  // Check if we should show the workflow plan
  const shouldShowWorkflow = workflowPlan && 
    workflowPlan.status !== 'completed' && 
    isThinkMode &&
    messages.some(m => m.workflowId === workflowPlan.id);
  const lastUserMessage = messages.filter(m => m.sender === 'user').pop();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-black text-gray-300' 
        : 'bg-white text-black'
    }`}>
      {/* Header */}
      <div className={`sticky top-0 z-50 border-b transition-colors ${
        isDarkMode 
          ? 'bg-black/95 border-gray-800 backdrop-blur-sm' 
          : 'bg-white/95 border-gray-200 backdrop-blur-sm'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">AI Assistant</h1>
              <p className={`text-sm ${
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

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
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
                      : 'rounded-bl-lg bg-gray-100 text-black dark:bg-gray-800 dark:text-gray-200'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  {message.files && message.files.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.files.map((file, index) => (
                        <div
                          key={index}
                          className={`px-2 py-1 rounded text-xs ${
                            message.sender === 'user'
                              ? 'bg-gray-200 text-black'
                              : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-gray-200'
                          }`}
                        >
                          📎 {file.name}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className={`text-xs mt-1 text-right ${
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
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
                    🤖 AI Assistant workflow in progress...
                  </div>
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
              <div className="max-w-[70%] rounded-2xl px-4 py-3 shadow-sm rounded-bl-lg bg-gray-100 text-black dark:bg-gray-800">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full animate-bounce bg-gray-500" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full animate-bounce bg-gray-500" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full animate-bounce bg-gray-500" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-4 pb-4">
          <PromptInputBox 
            onSend={handleSendMessage}
            placeholder="Ask me to build a website, analyze data, research a topic, or anything else..."
            isLoading={isLoading}
            onThinkModeChange={handleThinkModeChange}
            isThinkMode={isThinkMode}
            className={`transition-colors ${
              isDarkMode 
                ? 'bg-black border-gray-800' 
                : 'bg-white border-gray-200'
            }`}
          />
        </div>
      </div>
    </div>
  );
} 