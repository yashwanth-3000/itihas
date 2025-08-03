"use client";

interface GradientSectionProps {
  rotation?: number;
  children?: React.ReactNode;
  className?: string;
}

function GradientSection({ rotation = 0, children, className = "" }: GradientSectionProps) {
  return (
    <div 
      className={`w-full min-h-screen relative ${className}`}
      style={{
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {/* Content wrapper that counter-rotates to keep content upright */}
      <div 
        className="absolute inset-0"
        style={{
          transform: `rotate(${-rotation}deg)`,
        }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="container mx-auto px-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// Pre-built sections with content
function SecondSection() {
  return (
    <GradientSection rotation={180}>
      <div className="text-center text-white">
        <h2 className="text-4xl md:text-6xl font-bold mb-6">
          Advanced AI Features
        </h2>
        <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
          Experience the future of AI interaction with our cutting-edge technology. 
          From natural language processing to intelligent context understanding.
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-3">Voice Recognition</h3>
            <p className="text-white/70">Advanced speech-to-text capabilities for seamless interaction</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-3">Image Analysis</h3>
            <p className="text-white/70">Intelligent image processing and visual understanding</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-xl font-semibold mb-3">Context Aware</h3>
            <p className="text-white/70">Maintains conversation context for meaningful dialogue</p>
          </div>
        </div>
      </div>
    </GradientSection>
  );
}

function ThirdSection() {
  return (
    <GradientSection rotation={0}>
      <div className="text-center text-white">
        <h2 className="text-4xl md:text-6xl font-bold mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed mb-12">
          Join thousands of users who are already experiencing the power of Itihas AI. 
          Start your journey today and discover what intelligent conversation feels like.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="bg-white text-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/90 transition-colors">
            Start Free Trial
          </button>
          <button className="bg-white/10 text-white px-8 py-4 rounded-lg text-lg font-semibold border border-white/30 hover:bg-white/20 transition-colors backdrop-blur-sm">
            View Documentation
          </button>
        </div>
      </div>
    </GradientSection>
  );
}

export { GradientSection, SecondSection, ThirdSection }; 