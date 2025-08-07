"use client";

// Main Comics Page Component
import { NavBar } from "../../components/ui/tubelight-navbar";
import { PromptInputBox } from "../../components/ui/ai-prompt-box";
import { ComicGenerationProgress } from "../../components/ui/comic-generation-progress";
import { ComicBookDisplay } from "../../components/ui/comic-book-display";
import { Home, MessageCircle, User, Compass, BookOpen, CheckCircle, XCircle, Edit3, RefreshCw } from "lucide-react";
import { useState } from "react";

// Types for comic generation
interface ComicPanel {
  id: number;
  title: string;
  story: string;
  imagePrompt: string;
  imageUrl?: string;
}

interface StoryApproval {
  panels: ComicPanel[];
  isApproved: boolean;
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
  const [currentPhase, setCurrentPhase] = useState<'input' | 'story-generation' | 'story-approval' | 'rewrite-input' | 'image-generation' | 'complete'>('input');
  const [comicTopic, setComicTopic] = useState('');
  const [storyContent, setStoryContent] = useState<StoryApproval>({ panels: [], isApproved: false });
  const [comicPanels, setComicPanels] = useState<ComicPanel[]>([]);
  const [rewriteInstructions, setRewriteInstructions] = useState('');
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress>({
    currentPanel: 0,
    totalPanels: 6,
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
    setCurrentPhase('story-generation');
    setIsLoading(true);
    
    // Start the story generation process
    await generateStory(message);
  };

  const generateStory = async (topic: string) => {
    try {
      setGenerationProgress({
        currentPanel: 0,
        totalPanels: 6,
        isGeneratingStory: true,
        isGeneratingImage: false,
        status: 'Generating story content...'
      });

      // Call the backend API to generate the comic story
      const response = await fetch('http://localhost:8001/comic/create-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic,
          additional_notes: 'Create a 6-panel educational comic story'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Parse the story content and create panels
        const storyPanels = parseStoryIntoPages(data.result, topic);
        setStoryContent({ panels: storyPanels, isApproved: false });
        setCurrentPhase('story-approval');
      } else {
        throw new Error(data.error || 'Failed to generate story');
      }
    } catch (error) {
      console.error('Error generating story:', error);
      // Fallback to dummy story for now
      const fallbackPanels = generateFallbackStory(topic);
      setStoryContent({ panels: fallbackPanels, isApproved: false });
      setCurrentPhase('story-approval');
    } finally {
      setIsLoading(false);
      setGenerationProgress(prev => ({
        ...prev,
        isGeneratingStory: false,
        status: 'Story ready for review'
      }));
    }
  };

  const parseStoryIntoPages = (apiResult: any, topic: string): ComicPanel[] => {
    // Parse the API result and extract story content
    const storyText = apiResult.task_results?.comic_script || apiResult.final_output || '';
    
    // For now, create 6 panels with the story content
    // In a real implementation, you'd parse the structured comic script
    const panels: ComicPanel[] = [];
    for (let i = 1; i <= 6; i++) {
      panels.push({
        id: i,
        title: `Page ${i}: ${getDummyChapterTitle(i, topic)}`,
        story: extractPanelStory(storyText, i, topic),
        imagePrompt: getDummyImagePrompt(i, topic)
      });
    }
    return panels;
  };

  const extractPanelStory = (fullStory: string, panelNumber: number, topic: string): string => {
    // Simple extraction logic - in production, you'd have better parsing
    const sentences = fullStory.split('.').filter(s => s.trim().length > 0);
    const startIndex = Math.floor((sentences.length / 6) * (panelNumber - 1));
    const endIndex = Math.floor((sentences.length / 6) * panelNumber);
    const panelSentences = sentences.slice(startIndex, endIndex);
    
    if (panelSentences.length > 0) {
      return panelSentences.join('. ') + '.';
    }
    
    return getDummyStory(panelNumber, topic);
  };

  const generateFallbackStory = (topic: string): ComicPanel[] => {
    const panels: ComicPanel[] = [];
    for (let i = 1; i <= 6; i++) {
      panels.push({
        id: i,
        title: `Page ${i}: ${getDummyChapterTitle(i, topic)}`,
        story: getDummyStory(i, topic),
        imagePrompt: getDummyImagePrompt(i, topic)
      });
    }
    return panels;
  };

  const handleApproveStory = async () => {
    setStoryContent(prev => ({ ...prev, isApproved: true }));
    setCurrentPhase('image-generation');
    setIsLoading(true);
    
    // Start image generation process
    await generateImages();
  };

  const handleRejectStory = () => {
    setCurrentPhase('input');
    setStoryContent({ panels: [], isApproved: false });
    setComicTopic('');
  };

  const handleRewriteStory = () => {
    setCurrentPhase('rewrite-input');
    setRewriteInstructions('');
  };

  const handleRewriteWithInstructions = async (instructions: string) => {
    setRewriteInstructions(instructions);
    setCurrentPhase('story-generation');
    setIsLoading(true);
    setStoryContent({ panels: [], isApproved: false });
    
    // Regenerate the story with the same topic and rewrite instructions
    await generateStoryWithInstructions(comicTopic, instructions);
  };

  const generateStoryWithInstructions = async (topic: string, instructions: string) => {
    try {
      setGenerationProgress({
        currentPanel: 0,
        totalPanels: 6,
        isGeneratingStory: true,
        isGeneratingImage: false,
        status: 'Rewriting story with your feedback...'
      });

      // Call the backend API to generate the comic story with rewrite instructions
      const response = await fetch('http://localhost:8001/comic/create-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic,
          additional_notes: `Create a 6-panel educational comic story. REWRITE INSTRUCTIONS: ${instructions}`
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Parse the story content and create panels
        const storyPanels = parseStoryIntoPages(data.result, topic);
        setStoryContent({ panels: storyPanels, isApproved: false });
        setCurrentPhase('story-approval');
      } else {
        throw new Error(data.error || 'Failed to generate story');
      }
    } catch (error) {
      console.error('Error generating story:', error);
      // Fallback to dummy story for now
      const fallbackPanels = generateFallbackStory(topic);
      setStoryContent({ panels: fallbackPanels, isApproved: false });
      setCurrentPhase('story-approval');
    } finally {
      setIsLoading(false);
      setGenerationProgress(prev => ({
        ...prev,
        isGeneratingStory: false,
        status: 'Rewritten story ready for review'
      }));
    }
  };

  const generateImages = async () => {
    const panels: ComicPanel[] = [...storyContent.panels];
    
    // Generate images for each panel
    for (let i = 0; i < panels.length; i++) {
      setGenerationProgress({
        currentPanel: i + 1,
        totalPanels: panels.length,
        isGeneratingStory: false,
        isGeneratingImage: true,
        status: `Generating image for page ${i + 1}...`
      });

      // Simulate image generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For now, use placeholder images
      panels[i].imageUrl = getDummyImageUrl(i + 1);
      setComicPanels([...panels]);

      setGenerationProgress(prev => ({
        ...prev,
        status: i === panels.length - 1 ? 'Comic generation complete!' : `Page ${i + 1} complete!`
      }));

      // Small delay before next panel
      if (i < panels.length - 1) {
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
    setStoryContent({ panels: [], isApproved: false });
    setRewriteInstructions('');
    setGenerationProgress({
      currentPanel: 0,
      totalPanels: 6,
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
      <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
      
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
                  Transform any topic into an exciting 6-page comic adventure with AI-generated stories and visuals
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

        {/* Story Generation Phase */}
        {currentPhase === 'story-generation' && (
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="w-full max-w-4xl space-y-6">
              <div className="text-center space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-2xl">
                  Generating Your Story
                </h1>
                <p className="text-lg text-yellow-200 drop-shadow-lg">
                  Creating an engaging story about: <span className="font-semibold text-yellow-100">"{comicTopic}"</span>
                </p>
              </div>
              
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center justify-center space-x-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  <span className="text-lg font-medium text-gray-800">{generationProgress.status}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rewrite Input Phase */}
        {currentPhase === 'rewrite-input' && (
          <div className="min-h-screen px-4 py-8 pt-20 sm:pt-24" style={{ position: 'relative', zIndex: 50 }}>
            <div className="w-full max-w-4xl mx-auto space-y-6">
              <div className="text-center space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-2xl">
                  What Would You Like to Change?
                </h1>
                <p className="text-lg text-yellow-200 drop-shadow-lg">
                  Tell us what you'd like to improve about the story for: <span className="font-semibold text-yellow-100">"{comicTopic}"</span>
                </p>
              </div>
              
              <div 
                className="bg-gradient-to-br from-yellow-100 via-orange-50 to-red-100 rounded-3xl p-8 shadow-2xl border-4 border-orange-400"
                style={{ 
                  position: 'relative', 
                  zIndex: 51,
                  backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255, 193, 7, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 152, 0, 0.1) 0%, transparent 50%)'
                }}
              >
                <div className="space-y-6">
                  {/* Comic-style speech bubble effect */}
                  <div className="relative">
                    <div className="bg-white rounded-2xl p-6 border-3 border-orange-300 shadow-lg relative">
                      <div 
                        className="absolute -top-3 left-8 w-6 h-6 bg-white border-l-3 border-t-3 border-orange-300 transform rotate-45"
                        style={{ clipPath: 'polygon(0 0, 0 100%, 100% 0)' }}
                      ></div>
                      
                      <label className="block text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <Edit3 className="w-6 h-6 mr-3 text-orange-500" />
                        What changes would you like to see in the story?
                      </label>
                      
                      <textarea
                        value={rewriteInstructions}
                        onChange={(e) => setRewriteInstructions(e.target.value)}
                        placeholder="Tell me what you'd like to change... Make it more adventurous? Add more humor? Include different characters? Be as specific as you want!"
                        className="w-full h-36 px-4 py-3 border-3 border-orange-200 rounded-xl focus:border-orange-400 focus:outline-none resize-none text-gray-800 bg-yellow-50/50"
                        style={{
                          fontSize: '16px',
                          lineHeight: '1.6',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Button Container */}
                                 <div 
                   style={{ 
                     position: 'relative', 
                     zIndex: 52,
                     display: 'flex',
                     justifyContent: 'center',
                     gap: '16px',
                     marginTop: '32px',
                     pointerEvents: 'auto',
                     flexWrap: 'wrap'
                   }}
                 >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (rewriteInstructions.trim()) {
                        console.log('Rewrite with instructions:', rewriteInstructions);
                        handleRewriteWithInstructions(rewriteInstructions.trim());
                      }
                    }}
                    disabled={!rewriteInstructions.trim()}
                    style={{
                      position: 'relative',
                      zIndex: 53,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '16px 24px',
                      background: rewriteInstructions.trim() 
                        ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                        : '#9ca3af',
                      color: 'white',
                      border: rewriteInstructions.trim() ? '3px solid #92400e' : '3px solid #6b7280',
                      borderRadius: '16px',
                      fontSize: '16px',
                      fontWeight: '700',
                      cursor: rewriteInstructions.trim() ? 'pointer' : 'not-allowed',
                      boxShadow: rewriteInstructions.trim() 
                        ? '0 8px 16px -4px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
                        : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s ease',
                      pointerEvents: 'auto',
                      minHeight: '60px',
                      minWidth: '200px',
                      textShadow: rewriteInstructions.trim() ? '0 1px 2px rgba(0, 0, 0, 0.3)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (rewriteInstructions.trim()) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #d97706 0%, #92400e 100%)';
                        e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 12px 20px -4px rgba(245, 158, 11, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (rewriteInstructions.trim()) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
                        e.currentTarget.style.transform = 'scale(1) translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 16px -4px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                      }
                    }}
                    type="button"
                  >
                    <RefreshCw style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                    Rewrite Story
                  </button>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Back to story approval');
                      setCurrentPhase('story-approval');
                    }}
                    style={{
                      position: 'relative',
                      zIndex: 53,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '16px 24px',
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: 'white',
                      border: '3px solid #991b1b',
                      borderRadius: '16px',
                      fontSize: '16px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: '0 8px 16px -4px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                      transition: 'all 0.2s ease',
                      pointerEvents: 'auto',
                      minHeight: '60px',
                      minWidth: '200px',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)';
                      e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 12px 20px -4px rgba(239, 68, 68, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                      e.currentTarget.style.transform = 'scale(1) translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 16px -4px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                    }}
                    type="button"
                  >
                    <XCircle style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                    Back to Story
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Story Approval Phase */}
        {currentPhase === 'story-approval' && (
          <div className="min-h-screen px-4 py-8 pt-20 sm:pt-24" style={{ position: 'relative', zIndex: 50 }}>
            <div className="w-full max-w-6xl mx-auto space-y-6">
              <div className="text-center space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-2xl">
                  Review Your Story
                </h1>
                <p className="text-lg text-yellow-200 drop-shadow-lg">
                  Please review the generated story. If you like it, we'll proceed to create the comic visuals!
                </p>
              </div>
              
              <div 
                className="bg-gradient-to-br from-yellow-100 via-orange-50 to-red-100 rounded-3xl p-8 shadow-2xl border-4 border-orange-400" 
                style={{ 
                  position: 'relative', 
                  zIndex: 51,
                  backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255, 193, 7, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 152, 0, 0.1) 0%, transparent 50%)'
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {storyContent.panels.map((panel) => (
                    <div 
                      key={panel.id} 
                      className="bg-white rounded-2xl p-6 border-3 border-orange-300 shadow-lg relative transform hover:scale-105 transition-all duration-200"
                      style={{
                        backgroundImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(254, 243, 199, 0.5) 100%)',
                        boxShadow: '0 8px 16px -4px rgba(251, 146, 60, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                      }}
                    >
                      {/* Comic panel number badge */}
                      <div 
                        className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center border-3 border-white shadow-lg"
                        style={{
                          fontSize: '14px',
                          fontWeight: '800',
                          color: 'white',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                        }}
                      >
                        {panel.id}
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <BookOpen className="w-6 h-6 mr-3 text-orange-500" />
                        <span style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>
                          {panel.title}
                        </span>
                      </h3>
                      
                      <p 
                        className="text-gray-800 leading-relaxed text-base"
                        style={{
                          fontFamily: 'inherit',
                          lineHeight: '1.6'
                        }}
                      >
                        {panel.story}
                      </p>
                      
                      {/* Comic-style corner decoration */}
                      <div 
                        className="absolute bottom-2 right-2 w-4 h-4 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full opacity-60"
                        style={{
                          boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.8)'
                        }}
                      ></div>
                    </div>
                  ))}
                </div>
                
                {/* Button Container with maximum isolation */}
                <div 
                  style={{ 
                    position: 'relative', 
                    zIndex: 52,
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '16px',
                    marginTop: '32px',
                    pointerEvents: 'auto',
                    flexWrap: 'wrap'
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Approve button clicked!');
                      handleApproveStory();
                    }}
                    style={{
                      position: 'relative',
                      zIndex: 53,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '16px 24px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: '3px solid #047857',
                      borderRadius: '16px',
                      fontSize: '16px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: '0 8px 16px -4px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                      transition: 'all 0.2s ease',
                      pointerEvents: 'auto',
                      minHeight: '60px',
                      minWidth: '200px',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                      e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 12px 20px -4px rgba(16, 185, 129, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                      e.currentTarget.style.transform = 'scale(1) translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 16px -4px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                    }}
                    type="button"
                  >
                    <CheckCircle style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                    I Love It! Generate Comic
                  </button>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Rewrite button clicked!');
                      handleRewriteStory();
                    }}
                    style={{
                      position: 'relative',
                      zIndex: 53,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '16px 24px',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      border: '3px solid #92400e',
                      borderRadius: '16px',
                      fontSize: '16px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: '0 8px 16px -4px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                      transition: 'all 0.2s ease',
                      pointerEvents: 'auto',
                      minHeight: '60px',
                      minWidth: '200px',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #d97706 0%, #92400e 100%)';
                      e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 12px 20px -4px rgba(245, 158, 11, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
                      e.currentTarget.style.transform = 'scale(1) translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 16px -4px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                    }}
                    type="button"
                  >
                    <RefreshCw style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                    Rewrite Story
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Reject button clicked!');
                      handleRejectStory();
                    }}
                    style={{
                      position: 'relative',
                      zIndex: 53,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '16px 24px',
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      color: 'white',
                      border: '3px solid #991b1b',
                      borderRadius: '16px',
                      fontSize: '16px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: '0 8px 16px -4px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                      transition: 'all 0.2s ease',
                      pointerEvents: 'auto',
                      minHeight: '60px',
                      minWidth: '200px',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)';
                      e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 12px 20px -4px rgba(239, 68, 68, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                      e.currentTarget.style.transform = 'scale(1) translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 16px -4px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                    }}
                    type="button"
                  >
                    <XCircle style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                    Try Different Topic
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Generation Phase */}
        {currentPhase === 'image-generation' && (
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