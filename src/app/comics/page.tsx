"use client";

// Main Comics Page Component
import { NavBar } from "../../components/ui/tubelight-navbar";
import { PromptInputBox } from "../../components/ui/ai-prompt-box";
import { ComicGenerationProgress } from "../../components/ui/comic-generation-progress";
import { ComicBookDisplay } from "../../components/ui/comic-book-display";
import { Home, MessageCircle, User, Compass, BookOpen } from "lucide-react";
import { useState } from "react";

// Types for comic generation
interface ComicPanel {
  id: number;
  title: string;
  story: string;
  imagePrompt: string;
  imageUrl?: string;
}

interface GenerationProgress {
  currentPanel: number;
  totalPanels: number;
  isGeneratingStory: boolean;
  isGeneratingImage: boolean;
  status: string;
}

export default function ComicsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isThinkMode, setIsThinkMode] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'input' | 'generating' | 'complete'>('input');
  const [comicTopic, setComicTopic] = useState('');
  const [comicPanels, setComicPanels] = useState<ComicPanel[]>([]);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress>({
    currentPanel: 0,
    totalPanels: 10,
    isGeneratingStory: false,
    isGeneratingImage: false,
    status: 'Ready to start'
  });

  const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'Chat', url: '/chat', icon: MessageCircle },
    { name: 'Explore', url: '/explore', icon: Compass },
    { name: 'Comics', url: '/comics', icon: BookOpen },
    { name: 'About', url: '/sharable-link', icon: User }
  ];

  const handleSendMessage = async (message: string, files?: File[]) => {
    if (!message.trim() && !files?.length) return;
    
    setComicTopic(message);
    setCurrentPhase('generating');
    setIsLoading(true);
    
    // Start the comic generation process
    await generateComic(message);
  };

  const generateComic = async (topic: string) => {
    const panels: ComicPanel[] = [];
    
    // Simulate generating 10 comic panels
    for (let i = 1; i <= 10; i++) {
      setGenerationProgress({
        currentPanel: i,
        totalPanels: 10,
        isGeneratingStory: true,
        isGeneratingImage: false,
        status: `Generating story for panel ${i}...`
      });

      // Simulate story generation delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const panel: ComicPanel = {
        id: i,
        title: `Chapter ${i}: ${getDummyChapterTitle(i, topic)}`,
        story: getDummyStory(i, topic),
        imagePrompt: getDummyImagePrompt(i, topic),
      };

      setGenerationProgress(prev => ({
        ...prev,
        isGeneratingStory: false,
        isGeneratingImage: true,
        status: `Generating image for panel ${i}...`
      }));

      // Simulate image generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      panel.imageUrl = getDummyImageUrl(i);
      panels.push(panel);
      setComicPanels([...panels]);

      setGenerationProgress(prev => ({
        ...prev,
        isGeneratingImage: false,
        status: i === 10 ? 'Comic generation complete!' : `Panel ${i} complete!`
      }));

      // Small delay before next panel
      if (i < 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setIsLoading(false);
    setCurrentPhase('complete');
  };

  const handleThinkModeChange = (newThinkMode: boolean) => {
    setIsThinkMode(newThinkMode);
  };

  const handleBackToInput = () => {
    setCurrentPhase('input');
    setComicPanels([]);
    setComicTopic('');
    setGenerationProgress({
      currentPanel: 0,
      totalPanels: 10,
      isGeneratingStory: false,
      isGeneratingImage: false,
      status: 'Ready to start'
    });
  };

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/comic.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative z-10">
        <NavBar items={navItems} comicTheme={true} />
        
        {/* Input Phase */}
        {currentPhase === 'input' && (
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="w-full max-w-2xl space-y-6">
              <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-2xl">
                  Create Your Comic
                </h1>
                <p className="text-lg md:text-xl text-yellow-200 drop-shadow-lg max-w-lg mx-auto">
                  Transform any topic into an exciting 10-panel comic adventure with AI-generated stories and visuals
                </p>
              </div>
              <PromptInputBox 
                onSend={handleSendMessage}
                placeholder="Enter your comic topic (e.g., 'A superhero learning about photosynthesis')"
                isLoading={isLoading}
                onThinkModeChange={handleThinkModeChange}
                isThinkMode={isThinkMode}
                className="bg-white/95 backdrop-blur-md border-2 border-orange-400/60 shadow-2xl ring-2 ring-yellow-400/30"
              />
            </div>
          </div>
        )}

        {/* Generation Phase */}
        {currentPhase === 'generating' && (
          <ComicGenerationProgress
            topic={comicTopic}
            progress={generationProgress}
            panels={comicPanels}
          />
        )}

        {/* Complete Phase */}
        {currentPhase === 'complete' && (
          <ComicBookDisplay
            topic={comicTopic}
            panels={comicPanels}
            onBackToInput={handleBackToInput}
          />
        )}
      </div>
    </div>
  );
}

// Dummy data generators
function getDummyChapterTitle(panelNumber: number, topic: string): string {
  const titles = [
    "The Beginning",
    "Discovery",
    "The Challenge",
    "First Steps",
    "The Obstacle",
    "Learning",
    "The Breakthrough",
    "Mastery",
    "The Test",
    "Victory"
  ];
  return titles[panelNumber - 1] || `Adventure ${panelNumber}`;
}

function getDummyStory(panelNumber: number, topic: string): string {
  const stories = [
    `Our adventure begins as we dive deep into the fascinating world of ${topic}. The stage is set for an incredible journey of discovery.`,
    `Something amazing is about to be revealed! Our hero encounters the first clues about ${topic} and realizes there's much more to learn.`,
    `A challenge appears! Understanding ${topic} isn't as simple as it first seemed. Our hero must dig deeper to uncover the truth.`,
    `Taking the first brave steps into the unknown, our hero begins to understand the basic principles behind ${topic}.`,
    `An obstacle blocks the path! Complex concepts about ${topic} create confusion, but our hero won't give up easily.`,
    `Through careful study and determination, our hero starts to grasp the key concepts of ${topic}. Knowledge begins to grow!`,
    `Eureka! A breakthrough moment arrives as everything about ${topic} suddenly starts to make perfect sense.`,
    `With newfound understanding, our hero demonstrates mastery of ${topic}, applying knowledge in creative ways.`,
    `The ultimate test arrives! Our hero must use everything learned about ${topic} to overcome the final challenge.`,
    `Victory! Our hero has successfully mastered ${topic} and can now share this knowledge with others. The adventure concludes triumphantly!`
  ];
  return stories[panelNumber - 1] || `An exciting chapter about ${topic} unfolds...`;
}

function getDummyImagePrompt(panelNumber: number, topic: string): string {
  const prompts = [
    `Comic book style illustration showing the beginning of an adventure about ${topic}, vibrant colors, dynamic composition`,
    `Comic panel showing a character discovering something amazing about ${topic}, expressive face, bright lighting`,
    `Comic book scene depicting a challenge or obstacle related to ${topic}, dramatic lighting, action pose`,
    `Comic illustration of a character taking first steps to learn about ${topic}, determination in their eyes`,
    `Comic panel showing confusion and complexity around ${topic}, swirling thought bubbles, puzzled expression`,
    `Comic book scene of studying and learning about ${topic}, books and diagrams visible, focused character`,
    `Comic illustration of a eureka moment about ${topic}, bright light bulb, excited expression, breakthrough scene`,
    `Comic panel showing mastery and confidence with ${topic}, character demonstrating knowledge, proud pose`,
    `Comic book scene of the final test involving ${topic}, intense action, dramatic composition`,
    `Comic illustration of victory and celebration after mastering ${topic}, triumphant character, colorful background`
  ];
  return prompts[panelNumber - 1] || `Comic book illustration about ${topic}`;
}

function getDummyImageUrl(panelNumber: number): string {
  // Using placeholder images for now
  const imageIds = [400, 401, 402, 403, 404, 405, 406, 407, 408, 409];
  return `https://picsum.photos/800/600?random=${imageIds[panelNumber - 1]}`;
} 