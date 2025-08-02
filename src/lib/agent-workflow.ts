// Agent Workflow System
export interface Subtask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'need-help' | 'failed';
  priority: 'low' | 'medium' | 'high';
  tools: string[];
  estimatedDuration: number; // in seconds
  progress: number; // 0-100
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'need-help' | 'failed';
  priority: 'low' | 'medium' | 'high';
  level: number;
  dependencies: string[];
  subtasks: Subtask[];
  estimatedDuration: number;
  progress: number;
}

export interface WorkflowPlan {
  id: string;
  title: string;
  description: string;
  type: 'analysis' | 'development' | 'research' | 'creative' | 'problem-solving';
  tasks: Task[];
  status: 'planning' | 'executing' | 'completed' | 'paused';
  createdAt: Date;
  estimatedCompletion: Date;
}

// Template workflows for different types of requests
const WORKFLOW_TEMPLATES = {
  'web-development': {
    type: 'development' as const,
    tasks: [
      {
        title: 'Project Analysis & Planning',
        description: 'Analyze requirements and create development plan',
        priority: 'high' as const,
        subtasks: [
          { title: 'Understand requirements', tools: ['analysis-engine', 'requirements-parser'], duration: 30 },
          { title: 'Define project scope', tools: ['project-planner'], duration: 45 },
          { title: 'Choose tech stack', tools: ['tech-advisor', 'compatibility-checker'], duration: 60 }
        ]
      },
      {
        title: 'Environment Setup',
        description: 'Set up development environment and tools',
        priority: 'high' as const,
        subtasks: [
          { title: 'Initialize project structure', tools: ['file-system', 'project-generator'], duration: 45 },
          { title: 'Install dependencies', tools: ['package-manager', 'dependency-resolver'], duration: 90 },
          { title: 'Configure build tools', tools: ['build-configurator'], duration: 60 }
        ]
      },
      {
        title: 'Core Development',
        description: 'Implement main features and functionality',
        priority: 'high' as const,
        subtasks: [
          { title: 'Create UI components', tools: ['code-generator', 'ui-builder'], duration: 180 },
          { title: 'Implement business logic', tools: ['code-assistant', 'logic-analyzer'], duration: 240 },
          { title: 'Add styling and animations', tools: ['css-processor', 'animation-engine'], duration: 120 }
        ]
      },
      {
        title: 'Testing & Quality Assurance',
        description: 'Test functionality and ensure code quality',
        priority: 'medium' as const,
        subtasks: [
          { title: 'Write unit tests', tools: ['test-generator', 'test-runner'], duration: 120 },
          { title: 'Perform integration testing', tools: ['integration-tester'], duration: 90 },
          { title: 'Code review and optimization', tools: ['code-analyzer', 'performance-optimizer'], duration: 60 }
        ]
      }
    ]
  },
  'data-analysis': {
    type: 'analysis' as const,
    tasks: [
      {
        title: 'Data Collection & Preparation',
        description: 'Gather and prepare data for analysis',
        priority: 'high' as const,
        subtasks: [
          { title: 'Identify data sources', tools: ['data-discovery', 'source-scanner'], duration: 45 },
          { title: 'Extract and collect data', tools: ['data-extractor', 'api-client'], duration: 120 },
          { title: 'Clean and validate data', tools: ['data-cleaner', 'validator'], duration: 180 }
        ]
      },
      {
        title: 'Exploratory Data Analysis',
        description: 'Explore data patterns and characteristics',
        priority: 'high' as const,
        subtasks: [
          { title: 'Statistical analysis', tools: ['stats-engine', 'correlation-analyzer'], duration: 90 },
          { title: 'Data visualization', tools: ['chart-generator', 'visualization-engine'], duration: 120 },
          { title: 'Pattern identification', tools: ['pattern-detector', 'anomaly-finder'], duration: 150 }
        ]
      },
      {
        title: 'Advanced Analytics',
        description: 'Apply advanced analytical techniques',
        priority: 'medium' as const,
        subtasks: [
          { title: 'Machine learning modeling', tools: ['ml-trainer', 'model-selector'], duration: 300 },
          { title: 'Predictive analysis', tools: ['predictor', 'forecast-engine'], duration: 180 },
          { title: 'Results interpretation', tools: ['insight-generator', 'report-builder'], duration: 120 }
        ]
      }
    ]
  },
  'research': {
    type: 'research' as const,
    tasks: [
      {
        title: 'Research Planning',
        description: 'Define research scope and methodology',
        priority: 'high' as const,
        subtasks: [
          { title: 'Define research questions', tools: ['research-planner'], duration: 60 },
          { title: 'Literature review', tools: ['academic-search', 'paper-analyzer'], duration: 180 },
          { title: 'Methodology selection', tools: ['method-advisor'], duration: 45 }
        ]
      },
      {
        title: 'Data Gathering',
        description: 'Collect relevant information and evidence',
        priority: 'high' as const,
        subtasks: [
          { title: 'Primary source research', tools: ['web-crawler', 'document-parser'], duration: 240 },
          { title: 'Expert consultation', tools: ['expert-network', 'interview-scheduler'], duration: 120 },
          { title: 'Fact verification', tools: ['fact-checker', 'source-validator'], duration: 90 }
        ]
      },
      {
        title: 'Analysis & Synthesis',
        description: 'Analyze findings and synthesize insights',
        priority: 'medium' as const,
        subtasks: [
          { title: 'Content analysis', tools: ['text-analyzer', 'sentiment-engine'], duration: 180 },
          { title: 'Cross-reference findings', tools: ['correlation-finder'], duration: 120 },
          { title: 'Generate conclusions', tools: ['insight-synthesizer', 'conclusion-generator'], duration: 90 }
        ]
      }
    ]
  }
};

export class AgentWorkflow {
  private currentPlan: WorkflowPlan | null = null;
  private progressInterval: NodeJS.Timeout | null = null;
  private callbacks: {
    onPlanUpdate?: (plan: WorkflowPlan) => void;
    onTaskComplete?: (taskId: string) => void;
    onWorkflowComplete?: () => void;
  } = {};

  constructor(callbacks?: typeof AgentWorkflow.prototype.callbacks) {
    this.callbacks = callbacks || {};
  }

  // Analyze user message and determine workflow type
  analyzeRequest(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('website') || lowerMessage.includes('web app') || 
        lowerMessage.includes('frontend') || lowerMessage.includes('react') ||
        lowerMessage.includes('next.js') || lowerMessage.includes('ui')) {
      return 'web-development';
    }
    
    if (lowerMessage.includes('data') || lowerMessage.includes('analyze') ||
        lowerMessage.includes('statistics') || lowerMessage.includes('chart') ||
        lowerMessage.includes('visualization') || lowerMessage.includes('trends')) {
      return 'data-analysis';
    }
    
    if (lowerMessage.includes('research') || lowerMessage.includes('study') ||
        lowerMessage.includes('investigate') || lowerMessage.includes('find out') ||
        lowerMessage.includes('learn about') || lowerMessage.includes('information')) {
      return 'research';
    }
    
    // Default to research for general questions
    return 'research';
  }

  // Generate a dynamic workflow plan based on user request
  generatePlan(userMessage: string): WorkflowPlan {
    const workflowType = this.analyzeRequest(userMessage);
    const template = WORKFLOW_TEMPLATES[workflowType as keyof typeof WORKFLOW_TEMPLATES];
    
    if (!template) {
      throw new Error(`No template found for workflow type: ${workflowType}`);
    }

    const planId = `plan-${Date.now()}`;
    const tasks: Task[] = template.tasks.map((taskTemplate, index) => ({
      id: `task-${planId}-${index + 1}`,
      title: taskTemplate.title,
      description: taskTemplate.description,
      status: index === 0 ? 'in-progress' : 'pending',
      priority: taskTemplate.priority,
      level: 0,
      dependencies: index > 0 ? [`task-${planId}-${index}`] : [],
      progress: 0,
      estimatedDuration: taskTemplate.subtasks.reduce((sum, st) => sum + st.duration, 0),
      subtasks: taskTemplate.subtasks.map((subtaskTemplate, subIndex) => ({
        id: `subtask-${planId}-${index + 1}-${subIndex + 1}`,
        title: subtaskTemplate.title,
        description: `Execute ${subtaskTemplate.title.toLowerCase()} using specialized tools`,
        status: index === 0 && subIndex === 0 ? 'in-progress' : 'pending',
        priority: taskTemplate.priority,
        tools: subtaskTemplate.tools,
        estimatedDuration: subtaskTemplate.duration,
        progress: 0
      }))
    }));

    const totalDuration = tasks.reduce((sum, task) => sum + task.estimatedDuration, 0);
    
    this.currentPlan = {
      id: planId,
      title: this.generatePlanTitle(userMessage, workflowType),
      description: this.generatePlanDescription(userMessage, workflowType),
      type: template.type,
      tasks,
      status: 'executing',
      createdAt: new Date(),
      estimatedCompletion: new Date(Date.now() + totalDuration * 1000)
    };

    return this.currentPlan;
  }

  private generatePlanTitle(userMessage: string, workflowType: string): string {
    const titleMap = {
      'web-development': 'Web Development Project',
      'data-analysis': 'Data Analysis Workflow',
      'research': 'Research Investigation'
    };
    
    return titleMap[workflowType as keyof typeof titleMap] || 'AI Assistant Workflow';
  }

  private generatePlanDescription(userMessage: string, workflowType: string): string {
    const snippet = userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : '');
    return `Executing workflow to address: "${snippet}"`;
  }

  // Start executing the current plan
  startExecution(): void {
    if (!this.currentPlan) return;

    this.progressInterval = setInterval(() => {
      this.updateProgress();
    }, 2000); // Update every 2 seconds
  }

  // Stop execution
  stopExecution(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  // Update task progress simulation
  private updateProgress(): void {
    if (!this.currentPlan) return;

    let hasActiveTask = false;
    
    for (const task of this.currentPlan.tasks) {
      if (task.status === 'in-progress') {
        hasActiveTask = true;
        
        // Update subtasks
        for (const subtask of task.subtasks) {
          if (subtask.status === 'in-progress') {
            subtask.progress = Math.min(100, subtask.progress + Math.random() * 15 + 5);
            
            if (subtask.progress >= 100) {
              subtask.status = 'completed';
              
              // Start next subtask
              const nextSubtask = task.subtasks.find(st => st.status === 'pending');
              if (nextSubtask) {
                nextSubtask.status = 'in-progress';
              }
              
              this.callbacks.onTaskComplete?.(subtask.id);
            }
            break;
          }
        }
        
        // Update task progress
        const completedSubtasks = task.subtasks.filter(st => st.status === 'completed').length;
        task.progress = (completedSubtasks / task.subtasks.length) * 100;
        
        // Complete task if all subtasks are done
        if (task.progress >= 100) {
          task.status = 'completed';
          
          // Start next task
          const nextTask = this.currentPlan.tasks.find(t => t.status === 'pending');
          if (nextTask) {
            nextTask.status = 'in-progress';
            if (nextTask.subtasks.length > 0) {
              nextTask.subtasks[0].status = 'in-progress';
            }
          }
          
          this.callbacks.onTaskComplete?.(task.id);
        }
        break;
      }
    }
    
    // Check if workflow is complete
    if (!hasActiveTask && this.currentPlan.tasks.every(t => t.status === 'completed')) {
      this.currentPlan.status = 'completed';
      this.stopExecution();
      this.callbacks.onWorkflowComplete?.();
    }
    
    this.callbacks.onPlanUpdate?.(this.currentPlan);
  }

  // Get current plan
  getCurrentPlan(): WorkflowPlan | null {
    return this.currentPlan;
  }

  // Generate contextual response based on current progress
  generateResponse(): string {
    if (!this.currentPlan) {
      return "I'm ready to help! What would you like me to work on?";
    }

    const activeTask = this.currentPlan.tasks.find(t => t.status === 'in-progress');
    const completedTasks = this.currentPlan.tasks.filter(t => t.status === 'completed').length;
    const totalTasks = this.currentPlan.tasks.length;

    if (this.currentPlan.status === 'completed') {
      return `Great! I've completed the ${this.currentPlan.title.toLowerCase()}. All ${totalTasks} tasks have been finished successfully. Is there anything else you'd like me to help you with?`;
    }

    if (activeTask) {
      const activeSubtask = activeTask.subtasks.find(st => st.status === 'in-progress');
      if (activeSubtask) {
        return `I'm currently working on "${activeTask.title}" - specifically "${activeSubtask.title}". This involves using ${activeSubtask.tools.join(', ')} to ensure the best results. Progress so far: ${Math.round(activeSubtask.progress)}% complete.`;
      }
    }

    return `I'm making good progress on your request. ${completedTasks} out of ${totalTasks} main tasks completed. Currently working on the next phase of the workflow.`;
  }

  // Clean up resources
  destroy(): void {
    this.stopExecution();
    this.currentPlan = null;
  }
} 