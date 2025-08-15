"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  CircleAlert,
  CircleDotDashed,
  CircleX,
  Clock,
  Play,
} from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { WorkflowPlan } from "@/lib/agent-workflow";

interface AgentPlanProps {
  workflowPlan?: WorkflowPlan | null;
  onTaskStatusChange?: (taskId: string, status: string) => void;
}

export default function AgentPlan({ workflowPlan, onTaskStatusChange }: AgentPlanProps) {
  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);
  const [expandedSubtasks, setExpandedSubtasks] = useState<{
    [key: string]: boolean;
  }>({});
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  // Add support for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Auto-manage task expansion based on workflow state
  useEffect(() => {
    if (!workflowPlan) return;

    // If workflow is completed, collapse all tasks
    if (workflowPlan.status === 'completed') {
      setExpandedTasks([]);
      return;
    }

    const inProgressTasks = workflowPlan.tasks.filter(task => task.status === 'in-progress');
    const completedTasks = workflowPlan.tasks.filter(task => task.status === 'completed');
    
    // Expand in-progress tasks, collapse completed ones
    const newExpandedTasks = inProgressTasks.map(task => task.id);
    
    // Also expand tasks that have in-progress subtasks
    workflowPlan.tasks.forEach(task => {
      const hasActiveSubtask = task.subtasks.some(subtask => 
        subtask.status === 'in-progress' || subtask.progress > 0
      );
      if (hasActiveSubtask && !newExpandedTasks.includes(task.id)) {
        newExpandedTasks.push(task.id);
      }
    });

    setExpandedTasks(newExpandedTasks);
  }, [workflowPlan?.tasks, workflowPlan?.status]);

  if (!workflowPlan) {
    return (
      <div className="bg-white dark:bg-black text-black dark:text-gray-300 h-full overflow-auto p-2">
        <motion.div 
          className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <Clock className="w-8 h-8 mx-auto mb-2" />
            <p>Waiting for workflow plan...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Toggle task expansion (manual override)
  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  // Toggle subtask expansion
  const toggleSubtaskExpansion = (taskId: string, subtaskId: string) => {
    const key = `${taskId}-${subtaskId}`;
    setExpandedSubtasks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Get status icon for tasks/subtasks - simplified without progress text
  const getStatusIcon = (status: string, progress?: number, size: 'sm' | 'md' = 'md') => {
    const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    
    switch (status) {
      case 'completed':
        return <CheckCircle2 className={`${iconSize} text-black dark:text-white fill-current`} />;
      case 'in-progress':
        return <CircleDotDashed className={`${iconSize} text-gray-600 dark:text-gray-400`} />;
      case 'need-help':
        return <CircleAlert className={`${iconSize} text-gray-500 dark:text-gray-500`} />;
      case 'failed':
        return <CircleX className={`${iconSize} text-gray-700 dark:text-gray-300`} />;
      default:
        return <Circle className={`text-gray-400 dark:text-gray-600 ${iconSize}`} />;
    }
  };

  // Animation variants
  const taskVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : -5 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: prefersReducedMotion ? ("tween" as const) : ("spring" as const), 
        stiffness: 500, 
        damping: 30,
        duration: prefersReducedMotion ? 0.2 : undefined
      }
    },
    exit: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : -5,
      transition: { duration: 0.15 }
    }
  };

  const subtaskListVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      height: "auto", 
      opacity: 1,
      transition: { 
        duration: 0.25, 
        staggerChildren: prefersReducedMotion ? 0 : 0.05
      }
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const subtaskVariants = {
    hidden: { opacity: 0, x: prefersReducedMotion ? 0 : -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: prefersReducedMotion ? ("tween" as const) : ("spring" as const), 
        stiffness: 500, 
        damping: 25,
        duration: prefersReducedMotion ? 0.2 : undefined
      }
    },
    exit: {
      opacity: 0,
      x: prefersReducedMotion ? 0 : -10,
      transition: { duration: 0.15 }
    }
  };

  const subtaskDetailsVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: "auto",
      transition: { duration: 0.25 }
    }
  };

  const statusBadgeVariants = {
    initial: { scale: 1 },
    animate: { 
      scale: prefersReducedMotion ? 1 : [1, 1.08, 1],
      transition: { duration: 0.35 }
    }
  };

  const formatTimeRemaining = (estimatedCompletion: Date): string => {
    const now = new Date();
    const remaining = estimatedCompletion.getTime() - now.getTime();
    
    if (remaining <= 0) return "Completing soon...";
    
    const minutes = Math.ceil(remaining / (1000 * 60));
    if (minutes < 60) return `~${minutes}m remaining`;
    
    const hours = Math.ceil(minutes / 60);
    return `~${hours}h remaining`;
  };

  return (
    <div className="bg-white dark:bg-black text-black dark:text-gray-300 h-full overflow-auto p-2">
      <motion.div 
        className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.3,
            ease: [0.2, 0.65, 0.3, 0.9]
          }
        }}
      >
        <LayoutGroup>
          <div className="p-4 overflow-hidden">
            {/* Workflow Header */}
            <div className="mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-200">
                  {workflowPlan.title}
                </h3>
                <div className="flex items-center gap-2">
                  {workflowPlan.status === 'executing' && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Play className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </motion.div>
                  )}
                  <span className={`px-2 py-1 rounded text-[10px] font-medium ${
                    workflowPlan.status === 'completed'
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : workflowPlan.status === 'executing'
                        ? 'bg-gray-700 dark:bg-gray-300 text-white dark:text-black'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                  }`}>
                    {workflowPlan.status}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {workflowPlan.description}
              </p>
              <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-500">
                <span>Type: {workflowPlan.type}</span>
                <span>{formatTimeRemaining(workflowPlan.estimatedCompletion)}</span>
              </div>
            </div>

            {/* Task List */}
            <ul className="space-y-1 overflow-hidden">
              {workflowPlan.tasks.map((task, index) => {
                const isExpanded = expandedTasks.includes(task.id);
                const isCompleted = task.status === 'completed';
                const isActive = task.status === 'in-progress';

                return (
                  <motion.li
                    key={task.id}
                    className={` ${index !== 0 ? "mt-1 pt-2" : ""} `}
                    initial="hidden"
                    animate="visible"
                    variants={taskVariants}
                  >
                    {/* Task row */}
                    <motion.div 
                      className={`group flex items-center px-3 py-2 rounded-md transition-colors ${
                        isActive 
                          ? 'bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                      }`}
                    >
                      <motion.div
                        className="mr-3 flex-shrink-0 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskStatusChange?.(task.id, task.status);
                        }}
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={task.status + task.progress}
                            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                            transition={{
                              duration: 0.2,
                              ease: [0.2, 0.65, 0.3, 0.9]
                            }}
                          >
                            {getStatusIcon(task.status, task.progress)}
                          </motion.div>
                        </AnimatePresence>
                      </motion.div>

                      <motion.div
                        className="flex min-w-0 flex-grow cursor-pointer items-center justify-between"
                        onClick={() => toggleTaskExpansion(task.id)}
                      >
                        <div className="mr-3 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-medium ${
                                isCompleted 
                                  ? "text-gray-500 dark:text-gray-500 line-through" 
                                  : isActive
                                    ? "text-black dark:text-white"
                                    : "text-gray-900 dark:text-gray-200"
                              }`}
                            >
                              {task.title}
                            </span>
                            {task.progress > 0 && task.status !== 'completed' && (
                              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-20 overflow-hidden">
                                <motion.div
                                  className="bg-gray-600 dark:bg-gray-400 h-full rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${task.progress}%` }}
                                  transition={{ duration: 0.5 }}
                                />
                              </div>
                            )}
                            {task.progress > 0 && task.status !== 'completed' && (
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                                {Math.round(task.progress)}%
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-1">
                            {task.description}
                          </p>
                        </div>

                        <div className="flex flex-shrink-0 items-center space-x-2 text-[10px]">
                          {task.dependencies.length > 0 && (
                            <div className="flex items-center mr-2">
                              <div className="flex flex-wrap gap-1">
                                {task.dependencies.map((dep, idx) => (
                                  <motion.span
                                    key={idx}
                                    className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded px-2 py-1 text-[10px] font-medium border border-gray-300 dark:border-gray-700"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{
                                      duration: 0.2,
                                      delay: idx * 0.05
                                    }}
                                  >
                                    dep:{dep.split('-').pop()}
                                  </motion.span>
                                ))}
                              </div>
                            </div>
                          )}

                          <motion.span
                            className={`rounded px-2 py-1 text-[10px] font-medium border ${
                              task.status === "completed"
                                ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                                : task.status === "in-progress"
                                  ? "bg-gray-700 dark:bg-gray-300 text-white dark:text-black border-gray-700 dark:border-gray-300"
                                  : task.status === "need-help"
                                    ? "bg-gray-500 dark:bg-gray-500 text-white dark:text-white border-gray-500 dark:border-gray-500"
                                    : task.status === "failed"
                                      ? "bg-gray-800 dark:bg-gray-200 text-white dark:text-black border-gray-800 dark:border-gray-200"
                                      : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700"
                            }`}
                            variants={statusBadgeVariants}
                            initial="initial"
                            animate="animate"
                            key={task.status}
                          >
                            {task.status}
                          </motion.span>
                        </div>
                      </motion.div>
                    </motion.div>

                    {/* Subtasks */}
                    <AnimatePresence mode="wait">
                      {isExpanded && task.subtasks.length > 0 && (
                        <motion.div 
                          className="relative overflow-hidden"
                          variants={subtaskListVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          layout
                        >
                          <div className="absolute top-0 bottom-0 left-[26px] border-l-2 border-dashed border-gray-300 dark:border-gray-700" />
                          <ul className="border-gray-200 dark:border-gray-700 mt-2 mr-2 mb-2 ml-4 space-y-1">
                            {task.subtasks.map((subtask) => {
                              const subtaskKey = `${task.id}-${subtask.id}`;
                              const isSubtaskExpanded = expandedSubtasks[subtaskKey];
                              const isSubtaskActive = subtask.status === 'in-progress';

                              return (
                                <motion.li
                                  key={subtask.id}
                                  className="group flex flex-col py-1 pl-6"
                                  onClick={() =>
                                    toggleSubtaskExpansion(task.id, subtask.id)
                                  }
                                  variants={subtaskVariants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="exit"
                                  layout
                                >
                                  <motion.div 
                                    className={`flex flex-1 items-center rounded-md p-2 transition-colors ${
                                      isSubtaskActive 
                                        ? 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600' 
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                                    }`}
                                    layout
                                  >
                                    <motion.div
                                      className="mr-3 flex-shrink-0 cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                      }}
                                      whileTap={{ scale: 0.9 }}
                                      whileHover={{ scale: 1.1 }}
                                      layout
                                    >
                                      <AnimatePresence mode="wait">
                                        <motion.div
                                          key={subtask.status + subtask.progress}
                                          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                          exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                                          transition={{
                                            duration: 0.2,
                                            ease: [0.2, 0.65, 0.3, 0.9]
                                          }}
                                        >
                                          {getStatusIcon(subtask.status, subtask.progress, 'sm')}
                                        </motion.div>
                                      </AnimatePresence>
                                    </motion.div>

                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`cursor-pointer text-xs ${
                                            subtask.status === "completed" 
                                              ? "text-gray-500 dark:text-gray-500 line-through" 
                                              : isSubtaskActive
                                                ? "text-black dark:text-white font-medium"
                                                : "text-gray-800 dark:text-gray-300"
                                          }`}
                                        >
                                          {subtask.title}
                                        </span>
                                        {subtask.progress > 0 && subtask.status !== 'completed' && (
                                          <>
                                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 w-16 overflow-hidden">
                                              <motion.div
                                                className="bg-gray-600 dark:bg-gray-400 h-full rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${subtask.progress}%` }}
                                                transition={{ duration: 0.5 }}
                                              />
                                            </div>
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                                              {Math.round(subtask.progress)}%
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>

                                  <AnimatePresence mode="wait">
                                    {isSubtaskExpanded && (
                                      <motion.div 
                                        className="text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 mt-1 ml-2 border-l border-dashed pl-6 text-[10px] overflow-hidden"
                                        variants={subtaskDetailsVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden"
                                        layout
                                      >
                                        <p className="py-2 leading-relaxed">{subtask.description}</p>
                                        {subtask.tools && subtask.tools.length > 0 && (
                                          <div className="mt-1 mb-2 flex flex-wrap items-center gap-2">
                                            <span className="text-gray-600 dark:text-gray-400 font-medium">
                                              Tools:
                                            </span>
                                            <div className="flex flex-wrap gap-1">
                                              {subtask.tools.map((tool, idx) => (
                                                <motion.span
                                                  key={idx}
                                                  className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded px-2 py-1 text-[10px] font-medium border border-gray-300 dark:border-gray-700"
                                                  initial={{ opacity: 0, y: -5 }}
                                                  animate={{ 
                                                    opacity: 1, 
                                                    y: 0,
                                                    transition: {
                                                      duration: 0.2,
                                                      delay: idx * 0.05
                                                    }
                                                  }}
                                                  whileHover={{ 
                                                    y: -1, 
                                                    backgroundColor: "rgba(0,0,0,0.1)",
                                                    transition: { duration: 0.2 } 
                                                  }}
                                                >
                                                  {tool}
                                                </motion.span>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.li>
                              );
                            })}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </LayoutGroup>
      </motion.div>
    </div>
  );
} 