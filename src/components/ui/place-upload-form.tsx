"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Star, Plus, Trash2, Camera, Map } from "lucide-react";

interface PlaceFormData {
  name: string;
  significance: string;
  facts: string[];
  location: {
    address: string;
    lat?: number;
    lng?: number;
  };
  category: 'cultural' | 'natural' | 'historical' | 'spiritual';
  images: File[];
  rating: number;
  // Optional maps and street view data
  mapsUrl?: string;
  streetViewUrl?: string;
  hasStreetView?: boolean;
}

interface PlaceUploadFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PlaceFormData) => void;
  isSubmitting?: boolean;
}

export function PlaceUploadForm({ isOpen, onClose, onSubmit, isSubmitting = false }: PlaceUploadFormProps) {
  
  // Reset form when it closes
  React.useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        significance: '',
        facts: [''],
        location: { address: '' },
        category: 'cultural',
        images: [],
        rating: 8,
        mapsUrl: '',
        streetViewUrl: '',
        hasStreetView: false
      });
      setCurrentStep(1);
      setValidationErrors([]);
    }
  }, [isOpen]);
  const [formData, setFormData] = useState<PlaceFormData>({
    name: '',
    significance: '',
    facts: [''],
    location: { address: '' },
    category: 'cultural',
    images: [],
    rating: 8,
    mapsUrl: '',
    streetViewUrl: '',
    hasStreetView: false
  });

  const [dragActive, setDragActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: 'cultural', name: 'Cultural', icon: '🏛️', description: 'Temples, monuments, traditional sites' },
    { id: 'natural', name: 'Natural', icon: '🌿', description: 'Caves, springs, viewpoints, forests' },
    { id: 'historical', name: 'Historical', icon: '📜', description: 'Ancient sites, battlefields, ruins' },
    { id: 'spiritual', name: 'Spiritual', icon: '🕉️', description: 'Sacred places, meditation spots' }
  ];

  const handleInputChange = (field: keyof PlaceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (field: keyof PlaceFormData['location'], value: any) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [field]: value }
    }));
  };

  const handleFactChange = (index: number, value: string) => {
    const newFacts = [...formData.facts];
    newFacts[index] = value;
    setFormData(prev => ({ ...prev, facts: newFacts }));
  };

  const addFact = () => {
    if (formData.facts.length < 5) {
      setFormData(prev => ({ ...prev, facts: [...prev.facts, ''] }));
    }
  };

  const removeFact = (index: number) => {
    if (formData.facts.length > 1) {
      const newFacts = formData.facts.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, facts: newFacts }));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      setFormData(prev => ({ 
        ...prev, 
        images: [...prev.images, ...files].slice(0, 5) 
      }));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      setFormData(prev => ({ 
        ...prev, 
        images: [...prev.images, ...files].slice(0, 5) 
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    if (!formData.name?.trim()) {
      errors.push('Place name is required');
    } else if (formData.name.trim().length < 2) {
      errors.push('Place name must be at least 2 characters');
    }
    
    if (!formData.significance?.trim()) {
      errors.push('Place significance/description is required');
    } else if (formData.significance.trim().length < 10) {
      errors.push('Place description must be at least 10 characters');
    }
    
    if (!formData.location?.address?.trim()) {
      errors.push('Location address is required');
    }
    
    if (!formData.category) {
      errors.push('Category is required');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (isSubmitting) {
      return; // Prevent double submission
    }
    
    onSubmit(formData);
  };

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1: return formData.name.trim() && formData.category;
      case 2: return formData.significance.trim() && formData.facts.some(fact => fact.trim());
      case 3: return formData.location.address.trim();
      case 4: return formData.images.length > 0;
      default: return false;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/20">
            <div>
              <h2 className="text-white text-2xl font-bold">Share a Hidden Place</h2>
              <p className="text-white/70 text-sm">Help others discover the beauty known only to locals</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl"
            >
              <X size={24} />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 border-b border-white/20">
            <div className="flex items-center justify-between">
              {[
                { step: 1, title: "Basic Info", icon: "📝" },
                { step: 2, title: "Details", icon: "✨" },
                { step: 3, title: "Location", icon: "📍" },
                { step: 4, title: "Photos", icon: "📷" }
              ].map((item) => (
                <div key={item.step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    currentStep >= item.step 
                      ? 'bg-white text-black' 
                      : isStepComplete(item.step)
                        ? 'bg-green-500 text-white'
                        : 'bg-white/20 text-white/60'
                  }`}>
                    {isStepComplete(item.step) && currentStep > item.step ? '✓' : item.step}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className="text-white text-sm font-medium">{item.title}</p>
                    <p className="text-white/60 text-xs">{item.icon}</p>
                  </div>
                  {item.step < 4 && (
                    <div className={`hidden sm:block w-16 h-0.5 ml-6 ${
                      currentStep > item.step ? 'bg-white' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 max-h-[60vh] overflow-y-auto">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-white font-medium mb-2">Place Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Hidden Temple of Serenity"
                    className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">Category *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleInputChange('category', category.id)}
                        className={`p-4 rounded-xl text-left transition-all duration-200 ${
                          formData.category === category.id
                            ? 'bg-white text-black'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{category.icon}</span>
                          <span className="font-bold">{category.name}</span>
                        </div>
                        <p className={`text-sm ${
                          formData.category === category.id ? 'text-black/70' : 'text-white/70'
                        }`}>
                          {category.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-white font-medium mb-2">Significance *</label>
                  <textarea
                    value={formData.significance}
                    onChange={(e) => handleInputChange('significance', e.target.value)}
                    placeholder="Describe why this place is special and its cultural or natural importance..."
                    rows={4}
                    className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Interesting Facts</label>
                  <div className="space-y-3">
                    {formData.facts.map((fact, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="text"
                          value={fact}
                          onChange={(e) => handleFactChange(index, e.target.value)}
                          placeholder={`Fact ${index + 1}...`}
                          className="flex-1 bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/50"
                        />
                        {formData.facts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFact(index)}
                            className="p-2 text-white/60 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                    {formData.facts.length < 5 && (
                      <button
                        type="button"
                        onClick={addFact}
                        className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm"
                      >
                        <Plus size={16} />
                        Add another fact
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-4">
                    Preservation Importance Rating
                  </label>
                  
                  <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white/70 text-sm">How critical is preserving this place?</span>
                      <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-white font-bold">{formData.rating}/10</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={formData.rating}
                        onChange={(e) => handleInputChange('rating', Number(e.target.value))}
                        className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                      />
                      
                      <div className="flex justify-between text-xs text-white/60">
                        <span>Low Priority</span>
                        <span>Medium Priority</span>
                        <span>Critical</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-white/5 rounded-lg">
                      <p className="text-white/80 text-sm">
                        {formData.rating <= 3 && "This place has some cultural value but is not at immediate risk."}
                        {formData.rating > 3 && formData.rating <= 6 && "This place has significant cultural importance and should be documented."}
                        {formData.rating > 6 && formData.rating <= 8 && "This place is highly important and needs active preservation efforts."}
                        {formData.rating > 8 && "This place is critical to cultural heritage and requires urgent protection."}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Location */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-white font-medium mb-2">Location Address *</label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.location.address}
                      onChange={(e) => handleLocationChange('address', e.target.value)}
                      placeholder="e.g., Hidden Valley, Northern Mountains, State"
                      className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/50"
                      required
                    />
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all duration-200"
                    >
                      <MapPin size={18} />
                      Use Current Location
                    </button>
                  </div>
                </div>

                {formData.location.lat && formData.location.lng && (
                  <div className="bg-white/10 border border-white/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <Map size={16} />
                      <span>
                        Coordinates: {formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Optional Maps and Street View Section */}
                <div className="space-y-4">
                  <div className="border-t border-white/20 pt-4">
                    <h3 className="text-white font-medium mb-3">Optional: Maps & Street View (Recommended)</h3>
                    
                    {/* Maps URL */}
                    <div className="space-y-2">
                      <label className="block text-white/80 text-sm">Custom Maps URL</label>
                      <input
                        type="url"
                        value={formData.mapsUrl || ''}
                        onChange={(e) => handleInputChange('mapsUrl', e.target.value)}
                        placeholder="https://maps.google.com/... (Optional)"
                        className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/50"
                      />
                      <p className="text-white/50 text-xs">Leave blank to auto-generate from coordinates</p>
                    </div>

                    {/* Street View Toggle */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.hasStreetView || false}
                          onChange={(e) => handleInputChange('hasStreetView', e.target.checked)}
                          className="w-4 h-4 rounded border-white/30 bg-white/10 text-white focus:ring-white/50"
                        />
                        <span className="text-white/80 text-sm">Street View is available for this location</span>
                      </label>
                    </div>

                    {/* Street View URL (only if checkbox is checked) */}
                    {formData.hasStreetView && (
                      <div className="space-y-2">
                        <label className="block text-white/80 text-sm">Custom Street View URL</label>
                        <input
                          type="url"
                          value={formData.streetViewUrl || ''}
                          onChange={(e) => handleInputChange('streetViewUrl', e.target.value)}
                          placeholder="https://www.google.com/maps/@?api=1&map_action=pano... (Optional)"
                          className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/60 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/50"
                        />
                        <p className="text-white/50 text-xs">Leave blank to auto-generate from coordinates</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <p className="text-yellow-200 text-sm">
                    💡 <strong>Privacy Note:</strong> Only provide general location information. 
                    Avoid exact coordinates for sensitive or protected areas.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 4: Photos */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-white font-medium mb-3">Photos *</label>
                  
                  {/* Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                      dragActive 
                        ? 'border-white bg-white/10' 
                        : 'border-white/40 hover:border-white/60 hover:bg-white/5'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Camera className="w-12 h-12 text-white/60 mx-auto mb-4" />
                    <p className="text-white text-lg font-medium mb-2">
                      Drop photos here or click to browse
                    </p>
                    <p className="text-white/60 text-sm mb-4">
                      Up to 5 photos • JPG, PNG, WebP
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-white/90 transition-all duration-200"
                    >
                      Choose Photos
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </div>

                  {/* Image Preview */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                      {formData.images.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-xl"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
                <h4 className="text-red-400 font-medium mb-2">Please fix the following errors:</h4>
                <ul className="text-red-300 text-sm space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/20">
              <button
                type="button"
                onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onClose()}
                disabled={isSubmitting}
                className="bg-white/10 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentStep === 1 ? 'Cancel' : 'Previous'}
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!isStepComplete(currentStep) || isSubmitting}
                  className="bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isStepComplete(4) || isSubmitting}
                  className="bg-green-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-green-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    'Share Place'
                  )}
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}