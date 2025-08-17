"use client";

import { NavBar } from '../../components/ui/tubelight-navbar';
import { Home, MessageCircle, User, Info } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'Chat', url: '/chat', icon: MessageCircle },
    { name: 'Communities', url: '/explore/communities', icon: User },
    { name: 'About', url: '/about', icon: Info }
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavBar items={navItems} />
      
      <div className="container mx-auto px-4 py-16 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              About Itihas
            </h1>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>

          {/* Main Introduction */}
          <section className="mb-20">
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Itihas started with a thought, our culture, heritage, and history are treasures, but they often get lost with time. We wanted to make a space where anyone can easily learn about them, in a way that feels simple and welcoming.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              It's a platform where you can:
            </p>
            <ul className="list-disc list-inside text-lg text-muted-foreground space-y-3 mb-8 ml-4">
              <li>Learn about festivals, monuments, legends, art, and customs.</li>
              <li>Understand the meaning and history behind them.</li>
              <li>Preserve these stories by sharing them with others.</li>
            </ul>
            <p className="text-lg text-muted-foreground leading-relaxed">
              It's about knowing where we come from, and keeping that knowledge alive for the future.
            </p>
          </section>

          {/* Features Section */}
          <section className="space-y-16 mb-20">
            {/* Chat Feature */}
            <div className="border-b border-border pb-16">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-foreground">Itihas Chat</h2>
                  <h3 className="text-xl font-medium text-muted-foreground">Your Cultural Guide</h3>
                </div>
              </div>
              
              <div className="space-y-6 text-muted-foreground">
                <p className="text-lg leading-relaxed">
                  When you open the Chat page, you'll meet our Culture AI guide. The Chat page is your path through culture and history. Ask a question in natural language, short and simple or long and specific. Our AI agent responds with context-rich, easy-to-read answers.
                </p>
                <p className="text-lg leading-relaxed">
                  Behind the scenes, we use the IBM Granite 3 8B model for answering questions, and OpenAI embeddings to find the most relevant information for you.
                </p>
                
                <div className="bg-muted/50 rounded-lg p-6">
                  <h4 className="font-semibold text-foreground mb-3">Chat options you can use:</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start">
                      <span className="font-medium text-foreground mr-2">Search</span>
                      <span>– Ask the chatbot to search the web while generating your answer so it can bring in fresh details.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium text-foreground mr-2">Logs</span>
                      <span>– Click Logs to open a side panel showing live backend logs for your request, great for transparency and debugging.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/30 rounded-lg p-6">
                  <h4 className="font-semibold text-foreground mb-3">Example:</h4>
                  <p className="text-muted-foreground">
                    If a user asks "What are the cultural sites in Uttar Pradesh?" the chatbot searches for the top five famous cultural places in Uttar Pradesh, lists them with short descriptions, provides basic history and a brief timeline for each, and includes article links for further reading. Users can also ask follow-up questions (like visit plans, or deeper history) and get clear answers.
                  </p>
                </div>
              </div>
            </div>

            {/* Explore Feature */}
            <div className="border-b border-border pb-16">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <div className="w-6 h-6 bg-green-600 rounded-sm"></div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-foreground">Explore</h2>
                  <h3 className="text-xl font-medium text-muted-foreground">Find cultural places near you or anywhere</h3>
                </div>
              </div>
              
              <div className="space-y-6 text-muted-foreground">
                <p className="text-lg leading-relaxed">
                  Explore helps you discover cultural and historic sites quickly, either nearby or in any place you choose.
                </p>
                <p className="text-lg leading-relaxed">
                  When you open Explore we first ask for permission to access your location (or you can also type a location instead).
                </p>
                <p className="text-lg leading-relaxed">
                  You can either ask to "Locate temples/cultural sites near me" or "Locate temples/cultural sites in 'location name'"
                </p>
                
                <div className="bg-muted/50 rounded-lg p-6">
                  <h4 className="font-semibold text-foreground mb-3">What you get back:</h4>
                  <p className="text-muted-foreground">
                    The AI agent finds 3 relevant cultural locations for the area you requested and returns, name of the place, a short description and historical significance, precise location (map link) and approximate distance from your location (if you shared it).
                  </p>
                </div>

                <div className="bg-muted/30 rounded-lg p-6">
                  <h4 className="font-semibold text-foreground mb-3">Try it out:</h4>
                  <p className="text-muted-foreground mb-4">
                    We haven't perfectly completed the Explore page yet, but you can try it out here to see how it works.
                  </p>
                  <Link 
                    href="/explore" 
                    className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    Open Explore Page
                  </Link>
                </div>
              </div>
            </div>

            {/* Communities Feature */}
            <div>
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-foreground">Communities</h2>
                  <h3 className="text-xl font-medium text-muted-foreground">Share and protect local treasures</h3>
                </div>
              </div>
              
              <div className="space-y-6 text-muted-foreground">
                <p className="text-lg leading-relaxed">
                  Communities is where locals and travelers can surface hidden gems and bring attention to places that matter. It's run by you, the community.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-muted/50 rounded-lg p-6">
                    <h4 className="font-semibold text-foreground mb-3">Share a place</h4>
                    <p className="text-muted-foreground">
                      Anyone can add a place by providing a few details: name, significance, short story or facts, location, and optional photos.
                    </p>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-6">
                    <h4 className="font-semibold text-foreground mb-3">Community feed</h4>
                    <p className="text-muted-foreground">
                      All shared places appear in a browsable list. Each item shows summary info, vote count. Click any place for full details and the conversation thread.
                    </p>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-6">
                    <h4 className="font-semibold text-foreground mb-3">Engage</h4>
                    <p className="text-muted-foreground">
                      Users can upvote/downvote entries, leave comments, and start discussions to share memories, restoration ideas, or volunteer plans.
                    </p>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-6">
                    <h4 className="font-semibold text-foreground mb-3">Raise Your Voice</h4>
                    <p className="text-muted-foreground">
                      Each community place includes a "Raise Your Voice" button that opens a pre-filled Twitter message so people can quickly start awareness campaigns. The message is editable before posting.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Agentic AI and IBM Watsonx Section */}
          <section className="mb-20">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                <div className="w-6 h-6 bg-indigo-600 rounded-sm"></div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground">Agentic AI and IBM Watsonx in our Project</h2>
                <h3 className="text-xl font-medium text-muted-foreground">The technology behind our platform</h3>
              </div>
            </div>
            
            <div className="space-y-6 text-muted-foreground">
              <p className="text-lg leading-relaxed">
                In Itihas, we use agentic AI to power both the Chat and Explore features. Instead of relying on a single model, we run a small set of AI agents that each have a clear role. For example, one agent plans how to handle a user's query, another searches for cultural information on the web, another extracts exact location details, and a final agent brings everything together into a structured and easy-to-read answer. This setup allows the system to handle multi-step tasks, such as answering cultural questions in Chat or finding three verified cultural sites in Explore with names, descriptions, and map links.
              </p>
              
              <p className="text-lg leading-relaxed">
                All of this is built on IBM watsonx, which provides the core language model (IBM Granite 3 8B). We use it to generate answers, manage the agents' reasoning steps, and ensure reliable orchestration. The models are configured to balance accuracy and readability, while tool calls (like web search or location lookup) are strictly defined and logged for transparency. In practice, this means Chat can give context-rich, well-sourced answers, and Explore can return accurate, location-aware cultural site recommendations. Together, agentic AI and IBM watsonx form the backbone of our platform.
              </p>
            </div>
          </section>

          {/* Conclusion */}
          <section className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">Bringing It All Together</h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Itihas brings friendly AI and community power together — learn from experts and locals, then act. Use Chat when you want curated answers and context; use Explore to locate real places quickly; use Communities to share, discuss, and raise awareness about the cultural sites that matter to you.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
