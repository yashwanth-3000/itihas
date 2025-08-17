# Itihas

## About

Itihas started with a thought, our culture, heritage, and history are treasures, but they often get lost with time. We wanted to make a space where anyone can easily learn about them, in a way that feels simple and welcoming.

It's a platform where you can:
- Learn about festivals, monuments, legends, art, and customs.
- Understand the meaning and history behind them.
- Preserve these stories by sharing them with others.

It's about knowing where we come from, and keeping that knowledge alive for the future.

## Features

### Itihas Chat - Your Cultural Guide

When you open the Chat page, you'll meet our Culture AI guide. The Chat page is your path through culture and history. Ask a question in natural language, short and simple or long and specific. Our AI agent responds with context-rich, easy-to-read answers.

Behind the scenes, we use the IBM Granite 3 8B model for answering questions, and OpenAI embeddings to find the most relevant information for you.

**Chat options you can use:**
- **Search** – Ask the chatbot to search the web while generating your answer so it can bring in fresh details.
- **Logs** – Click Logs to open a side panel showing live backend logs for your request, great for transparency and debugging.

**Example:**
If a user asks "What are the cultural sites in Uttar Pradesh?" the chatbot searches for the top five famous cultural places in Uttar Pradesh, lists them with short descriptions, provides basic history and a brief timeline for each, and includes article links for further reading. Users can also ask follow-up questions (like visit plans, or deeper history) and get clear answers.

### Explore - Find cultural places near you or anywhere

Explore helps you discover cultural and historic sites quickly, either nearby or in any place you choose.

When you open Explore we first ask for permission to access your location (or you can also type a location instead).

You can either ask to "Locate temples/cultural sites near me" or "Locate temples/cultural sites in 'location name'"

**What you get back:**
The AI agent finds 3 relevant cultural locations for the area you requested and returns, name of the place, a short description and historical significance, precise location (map link) and approximate distance from your location (if you shared it).

### Communities - Share and protect local treasures

Communities is where locals and travelers can surface hidden gems and bring attention to places that matter. It's run by you, the community.

**Share a place**
Anyone can add a place by providing a few details: name, significance, short story or facts, location, and optional photos.

**Community feed**
All shared places appear in a browsable list. Each item shows summary info, vote count. Click any place for full details and the conversation thread.

**Engage**
Users can upvote/downvote entries, leave comments, and start discussions to share memories, restoration ideas, or volunteer plans.

**Raise Your Voice**
Each community place includes a "Raise Your Voice" button that opens a pre-filled Twitter message so people can quickly start awareness campaigns. The message is editable before posting.

## Technology

### Agentic AI and IBM Watsonx

In Itihas, we use agentic AI to power both the Chat and Explore features. Instead of relying on a single model, we run a small set of AI agents that each have a clear role. For example, one agent plans how to handle a user's query, another searches for cultural information on the web, another extracts exact location details, and a final agent brings everything together into a structured and easy-to-read answer. This setup allows the system to handle multi-step tasks, such as answering cultural questions in Chat or finding three verified cultural sites in Explore with names, descriptions, and map links.

All of this is built on IBM watsonx, which provides the core language model (IBM Granite 3 8B). We use it to generate answers, manage the agents' reasoning steps, and ensure reliable orchestration. The models are configured to balance accuracy and readability, while tool calls (like web search or location lookup) are strictly defined and logged for transparency. In practice, this means Chat can give context-rich, well-sourced answers, and Explore can return accurate, location-aware cultural site recommendations. Together, agentic AI and IBM watsonx form the backbone of our platform.

## Bringing It All Together

Itihas brings friendly AI and community power together — learn from experts and locals, then act. Use Chat when you want curated answers and context; use Explore to locate real places quickly; use Communities to share, discuss, and raise awareness about the cultural sites that matter to you.

## Getting Started

This is a Next.js project with TypeScript. To get started:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables in `.env.local`

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `src/app/` - Next.js app router pages
- `src/components/` - React components
- `src/contexts/` - React contexts
- `backend/` - Backend services for chat and explore features 