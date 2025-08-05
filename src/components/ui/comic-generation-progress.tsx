"use client";

// Comic Generation Progress Component
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Sparkles, Image, PenTool, Clock, CheckCircle } from "lucide-react";
import { cn } from "../../lib/utils";

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

interface ComicGenerationProgressProps {
  topic: string;
  progress: GenerationProgress;
  panels: ComicPanel[];
}

export function ComicGenerationProgress({ topic, progress, panels }: ComicGenerationProgressProps) {
  const progressPercentage = (panels.length / progress.totalPanels) * 100;

  return (
    <div className="min-h-screen flex flex-col px-4 py-8 sm:py-16">
      {/* Header */}
      <div className="text-center mb-8 space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-5xl font-bold text-white drop-shadow-2xl"
        >
          Creating Your Comic
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg sm:text-xl text-yellow-200 drop-shadow-lg max-w-2xl mx-auto"
        >
          Transforming "{topic}" into an epic 10-panel adventure
        </motion.p>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto w-full mb-8">
        <div className="bg-black/30 backdrop-blur-md rounded-full h-4 border border-orange-400/30 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-orange-500 to-yellow-400 h-full rounded-full shadow-lg"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-sm text-yellow-200 mt-2">
          <span>Panel {progress.currentPanel} of {progress.totalPanels}</span>
          <span>{Math.round(progressPercentage)}% Complete</span>
        </div>
      </div>

      {/* Current Status */}
      <motion.div 
        key={progress.status}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-3 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-orange-400/50">
          {progress.isGeneratingStory && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <PenTool className="w-5 h-5 text-orange-400" />
            </motion.div>
          )}
          {progress.isGeneratingImage && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image className="w-5 h-5 text-yellow-400" />
            </motion.div>
          )}
          {!progress.isGeneratingStory && !progress.isGeneratingImage && panels.length > 0 && (
            <CheckCircle className="w-5 h-5 text-green-400" />
          )}
          <span className="text-white font-medium">{progress.status}</span>
        </div>
      </motion.div>

      {/* Generated Panels Grid */}
      <div className="max-w-6xl mx-auto w-full flex-1">
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
        >
          <AnimatePresence>
            {panels.map((panel, index) => (
              <motion.div
                key={panel.id}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 200
                }}
                layout
                className="relative group"
              >
                <ComicPanelCard panel={panel} isLatest={index === panels.length - 1} />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Placeholder for next panel */}
          {progress.currentPanel <= progress.totalPanels && panels.length < progress.totalPanels && (
            <motion.div
              className="aspect-[3/4] bg-black/20 backdrop-blur-sm border-2 border-dashed border-orange-400/40 rounded-xl flex items-center justify-center"
              animate={{ 
                borderColor: progress.isGeneratingStory || progress.isGeneratingImage 
                  ? ["rgba(251, 146, 60, 0.4)", "rgba(251, 146, 60, 0.8)", "rgba(251, 146, 60, 0.4)"]
                  : "rgba(251, 146, 60, 0.4)"
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="text-center space-y-2">
                <Clock className="w-8 h-8 text-orange-400 mx-auto animate-pulse" />
                <p className="text-sm text-orange-200">Panel {progress.currentPanel}</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Live Activity Indicator */}
      <motion.div 
        className="fixed bottom-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-orange-400/50"
        animate={{ 
          scale: progress.isGeneratingStory || progress.isGeneratingImage ? [1, 1.05, 1] : 1
        }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white text-sm">Generating...</span>
        </div>
      </motion.div>
    </div>
  );
}

interface ComicPanelCardProps {
  panel: ComicPanel;
  isLatest: boolean;
}

function ComicPanelCard({ panel, isLatest }: ComicPanelCardProps) {
  return (
    <motion.div
      className={cn(
        "relative aspect-[3/4] bg-white/95 backdrop-blur-md rounded-xl border-2 overflow-hidden shadow-2xl",
        isLatest ? "border-yellow-400 ring-2 ring-yellow-400/50" : "border-orange-400/60"
      )}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Panel Number Badge */}
      <div className="absolute top-2 left-2 z-10 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
        #{panel.id}
      </div>

      {/* New Badge for latest panel */}
      {isLatest && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 z-10 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1"
        >
          <Sparkles className="w-3 h-3" />
          NEW
        </motion.div>
      )}

      {/* Image */}
      <div className="h-2/3 w-full overflow-hidden">
        {panel.imageUrl ? (
          <motion.img
            src={panel.imageUrl}
            alt={panel.title}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-200 to-yellow-200 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Image className="w-8 h-8 text-orange-500" />
            </motion.div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="h-1/3 p-3 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-sm text-gray-900 line-clamp-1 mb-1">
            {panel.title}
          </h3>
          <p className="text-xs text-gray-700 line-clamp-2">
            {panel.story}
          </p>
        </div>
        
        {/* Progress indicator for this panel */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span className="text-xs text-green-600 font-medium">Complete</span>
          </div>
          <ChevronRight className="w-3 h-3 text-gray-400" />
        </div>
      </div>
    </motion.div>
  );
} 