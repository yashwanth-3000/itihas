"use client";

// Comic Book Display Component
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Share2, 
  BookOpen,
  Maximize,
  RotateCcw
} from "lucide-react";
import { cn } from "../../lib/utils";

interface ComicPanel {
  id: number;
  title: string;
  story: string;
  imagePrompt: string;
  imageUrl?: string;
}

interface ComicBookDisplayProps {
  topic: string;
  panels: ComicPanel[];
  onBackToInput: () => void;
}

export function ComicBookDisplay({ topic, panels, onBackToInput }: ComicBookDisplayProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<'book' | 'grid'>('book');

  // For book view, we show 2 panels per page
  const panelsPerPage = 2;
  const totalPages = Math.ceil(panels.length / panelsPerPage);

  const handlePrevPage = () => {
    setCurrentPage(Math.max(0, currentPage - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(Math.min(totalPages - 1, currentPage + 1));
  };

  const getCurrentPanels = () => {
    const startIndex = currentPage * panelsPerPage;
    return panels.slice(startIndex, startIndex + panelsPerPage);
  };

  if (viewMode === 'grid') {
    return <ComicGridView 
      topic={topic} 
      panels={panels} 
      onBackToInput={onBackToInput}
      onSwitchToBook={() => setViewMode('book')}
    />;
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8 space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-5xl font-bold text-white drop-shadow-2xl"
        >
          Your Comic Adventure
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg sm:text-xl text-yellow-200 drop-shadow-lg max-w-2xl mx-auto"
        >
          "{topic}" - A 10-Panel Epic
        </motion.p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
        <button
          onClick={onBackToInput}
          className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md text-white rounded-full border border-orange-400/50 hover:bg-black/60 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Create New Comic
        </button>
        
        <button
          onClick={() => setViewMode('grid')}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500/80 backdrop-blur-md text-white rounded-full border border-orange-400/50 hover:bg-orange-500 transition-colors"
        >
          <Maximize className="w-4 h-4" />
          Grid View
        </button>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md text-white rounded-full border border-orange-400/50 hover:bg-black/60 transition-colors">
          <Download className="w-4 h-4" />
          Download
        </button>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md text-white rounded-full border border-orange-400/50 hover:bg-black/60 transition-colors">
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>

      {/* Book Display */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative max-w-6xl w-full">
          {/* Book Container */}
          <motion.div
            className="relative bg-gradient-to-br from-orange-100 to-yellow-100 rounded-2xl shadow-2xl border-4 border-orange-300 p-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Book Pages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[600px]">
              <AnimatePresence mode="wait">
                {getCurrentPanels().map((panel, index) => (
                  <motion.div
                    key={`${currentPage}-${index}`}
                    initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: index === 0 ? -50 : 50 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="relative"
                  >
                    <ComicPagePanel panel={panel} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Page Navigation */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full border transition-colors",
                  currentPage === 0
                    ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                    : "bg-orange-500 text-white border-orange-400 hover:bg-orange-600"
                )}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-orange-600" />
                <span className="text-orange-800 font-medium">
                  Page {currentPage + 1} of {totalPages}
                </span>
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full border transition-colors",
                  currentPage === totalPages - 1
                    ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                    : "bg-orange-500 text-white border-orange-400 hover:bg-orange-600"
                )}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Page Indicator Dots */}
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={cn(
                  "w-3 h-3 rounded-full transition-colors",
                  index === currentPage ? "bg-orange-500" : "bg-orange-200"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ComicPagePanelProps {
  panel: ComicPanel;
}

function ComicPagePanel({ panel }: ComicPagePanelProps) {
  return (
    <div className="bg-white rounded-xl border-2 border-orange-400 shadow-lg overflow-hidden h-full">
      {/* Panel Header */}
      <div className="bg-gradient-to-r from-orange-500 to-yellow-400 p-4">
        <div className="flex items-center justify-between">
          <div className="bg-white/20 px-3 py-1 rounded-full">
            <span className="text-white font-bold text-sm">#{panel.id}</span>
          </div>
          <h2 className="text-white font-bold text-lg flex-1 text-center">
            {panel.title}
          </h2>
          <div className="w-12"></div> {/* Spacer for balance */}
        </div>
      </div>

      {/* Panel Image */}
      <div className="h-72 overflow-hidden">
        {panel.imageUrl ? (
          <img
            src={panel.imageUrl}
            alt={panel.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-200 to-yellow-200 flex items-center justify-center">
            <span className="text-orange-600 font-medium">Image Loading...</span>
          </div>
        )}
      </div>

      {/* Panel Story */}
      <div className="p-4 flex-1">
        <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-orange-400">
          <p className="text-gray-800 leading-relaxed text-sm">
            {panel.story}
          </p>
        </div>
      </div>
    </div>
  );
}

interface ComicGridViewProps {
  topic: string;
  panels: ComicPanel[];
  onBackToInput: () => void;
  onSwitchToBook: () => void;
}

function ComicGridView({ topic, panels, onBackToInput, onSwitchToBook }: ComicGridViewProps) {
  return (
    <div className="min-h-screen px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8 space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl sm:text-5xl font-bold text-white drop-shadow-2xl"
        >
          Complete Comic Collection
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg sm:text-xl text-yellow-200 drop-shadow-lg max-w-2xl mx-auto"
        >
          "{topic}" - All 10 Panels
        </motion.p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
        <button
          onClick={onBackToInput}
          className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md text-white rounded-full border border-orange-400/50 hover:bg-black/60 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Create New Comic
        </button>
        
        <button
          onClick={onSwitchToBook}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500/80 backdrop-blur-md text-white rounded-full border border-orange-400/50 hover:bg-orange-500 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          Book View
        </button>
      </div>

      {/* Grid Display */}
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {panels.map((panel, index) => (
            <motion.div
              key={panel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group"
            >
              <ComicGridPanel panel={panel} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

interface ComicGridPanelProps {
  panel: ComicPanel;
}

function ComicGridPanel({ panel }: ComicGridPanelProps) {
  return (
    <motion.div
      className="bg-white/95 backdrop-blur-md rounded-xl border-2 border-orange-400/60 overflow-hidden shadow-2xl"
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Panel Number Badge */}
      <div className="absolute top-3 left-3 z-10 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
        #{panel.id}
      </div>

      {/* Image */}
      <div className="h-48 overflow-hidden">
        {panel.imageUrl ? (
          <img
            src={panel.imageUrl}
            alt={panel.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-200 to-yellow-200 flex items-center justify-center">
            <span className="text-orange-600 font-medium">Loading...</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
          {panel.title}
        </h3>
        <p className="text-sm text-gray-700 line-clamp-3">
          {panel.story}
        </p>
      </div>
    </motion.div>
  );
} 