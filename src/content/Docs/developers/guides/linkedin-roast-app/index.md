---
categories: ["Developers"]
tags: ["Tutorial", "AkashML", "DeepSeek", "React", "Bun"]
weight: 1
title: "Build a LinkedIn Profile Roaster with AkashML"
linkTitle: "LinkedIn Roast App"
description: "Learn how to build a fun AI-powered app that roasts LinkedIn profiles using AkashML (DeepSeek-V3) and deploy it on Akash Network"
---

# Build a LinkedIn Profile Roaster with AkashML

In this tutorial, you'll build a fun web application that generates AI-powered roasts of LinkedIn profiles. Users can upload their LinkedIn PDF or paste their profile text, and the app will deliver a savage (but clever) roast of their corporate jargon and buzzwords.

**What you'll learn:**
- How to integrate AkashML's API with DeepSeek-V3
- Using AI to extract structured data from unstructured text
- Building a full-stack app with Bun, React, and TypeScript
- Deploying to Akash Network

**Source Code:** [github.com/baktun14/linkedin-roast](https://github.com/baktun14/linkedin-roast)

![LinkedIn Roast App - Upload Form](./assets/linkedin-roast-upload.png)

![LinkedIn Roast App - Roast Result](./assets/linkedin-roast-result.png)

## Tech Stack

- **Runtime:** [Bun](https://bun.sh/) - Fast JavaScript runtime
- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **AI:** [AkashML](https://akashml.com) (DeepSeek-V3)
- **PDF Parsing:** pdf-parse
- **Deployment:** Akash Network

---

## Prerequisites

Before starting, make sure you have:

1. **Bun v1.0+** installed ([install guide](https://bun.sh/docs/installation))
2. **AkashML API Key** - Get one at [akashml.com](https://akashml.com)
3. Basic knowledge of React and TypeScript

---

## Step 1: Project Setup

### Initialize the Project

```bash
# Create a new Vite + React + TypeScript project
bun create vite linkedin-roast --template react-ts
cd linkedin-roast

# Install dependencies
bun add pdf-parse react react-dom
bun add -d @types/react @types/react-dom tailwindcss postcss autoprefixer typescript vite @vitejs/plugin-react
```

### Configure Environment Variables

Create a `.env` file in your project root:

```env
VITE_AKASHML_API_KEY=your-akashml-api-key-here
```

> **Important:** Never commit your API key to version control. Add `.env` to your `.gitignore`.

---

## Step 2: Integrating AkashML

AkashML provides an OpenAI-compatible API, making integration straightforward. Here's the core pattern for making API calls:

### API Configuration

```typescript
const AKASH_API_BASE = 'https://api.akashml.com/v1'
const akashApiKey = process.env.VITE_AKASHML_API_KEY

async function callAkashML(systemPrompt: string, userPrompt: string, temperature = 0.7) {
  const response = await fetch(`${AKASH_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${akashApiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-ai/DeepSeek-V3.2',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: 1000,
    }),
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content?.trim()
}
```

### Key Parameters

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `model` | `deepseek-ai/DeepSeek-V3.2` | High-quality reasoning model |
| `temperature` | `0.1` for extraction, `0.9` for creative | Controls randomness |
| `max_tokens` | `300-1000` | Limits response length |

---

## Step 3: Building the Backend API

Create `api-server.ts` in your project root. This server handles PDF parsing and roast generation.

### Define the Profile Type

```typescript
interface LinkedInProfile {
  name: string;
  headline: string;
  about: string;
  linkedinUrl?: string;
  experience: string[];
  education: string[];
  skills: string[];
}
```

### AI-Powered Profile Extraction

The magic happens here - we use AI to extract structured data from messy PDF text:

```typescript
const pdf = require('pdf-parse')

async function extractProfileWithAI(pdfText: string): Promise<LinkedInProfile> {
  const response = await fetch(`${AKASH_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${akashApiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-ai/DeepSeek-V3.2',
      messages: [
        {
          role: 'system',
          content: `You are a data extraction assistant. Extract LinkedIn profile information from the provided PDF text and return it as valid JSON only.

Return ONLY a JSON object with these fields:
{
  "name": "Full name of the person",
  "headline": "Their professional headline/title",
  "about": "Their summary/about section (first 300 chars)",
  "linkedinUrl": "Their LinkedIn URL if found",
  "experience": ["Job 1 title at Company", "Job 2 title at Company"],
  "skills": ["Skill 1", "Skill 2", "Skill 3"]
}

Return ONLY the JSON, no markdown or explanations.`,
        },
        {
          role: 'user',
          content: `Extract the LinkedIn profile data from this PDF text:\n\n${pdfText.slice(0, 8000)}`,
        },
      ],
      temperature: 0.1, // Low temperature for accurate extraction
      max_tokens: 1000,
    }),
  })

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content?.trim()

  // Parse JSON response (handle potential markdown code blocks)
  let jsonStr = content
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```\n?/g, '')
  }

  return JSON.parse(jsonStr)
}
```

### Roast Generation

```typescript
function generateRoastPrompt(profile: LinkedInProfile): string {
  const parts = [
    `Roast ${profile.name}'s LinkedIn profile.`,
    profile.headline && `Headline: "${profile.headline}"`,
    profile.about && `About: "${profile.about}"`,
    profile.experience.length && `Experience: ${profile.experience.join('; ')}`,
    profile.skills.length && `Skills they're proud of: ${profile.skills.join(', ')}`,
  ].filter(Boolean)

  return parts.join('\n') + '\n\nCreate a brutal but clever roast under 280 characters. Start with their name for personalization. Mock the corporate jargon, not the person.'
}

async function generateRoast(profile: LinkedInProfile): Promise<string> {
  const response = await fetch(`${AKASH_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${akashApiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-ai/DeepSeek-V3.2',
      messages: [
        {
          role: 'system',
          content: `You are a professional comedy roast writer specializing in LinkedIn profiles. Create brutally funny roasts under 280 characters. Be savage but clever - mock corporate jargon and LinkedIn culture, not the person themselves.`,
        },
        {
          role: 'user',
          content: generateRoastPrompt(profile),
        },
      ],
      temperature: 0.9, // High temperature for creativity
      max_tokens: 300,
    }),
  })

  const data = await response.json()
  return data.choices?.[0]?.message?.content?.trim()
}
```

### Complete API Server

```typescript
const server = Bun.serve({
  port: 8787,
  async fetch(req) {
    const url = new URL(req.url)

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    // PDF parsing endpoint
    if (url.pathname === '/api/parse-pdf' && req.method === 'POST') {
      const formData = await req.formData()
      const pdfFile = formData.get('pdf') as File

      const arrayBuffer = await pdfFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const pdfData = await pdf(buffer)

      const profile = await extractProfileWithAI(pdfData.text)
      return Response.json({ profile }, { headers: corsHeaders })
    }

    // Roast generation endpoint
    if (url.pathname === '/api/roast' && req.method === 'POST') {
      const { profile, bioText } = await req.json()
      const roast = await generateRoast(profile)
      return Response.json({ roast, name: profile?.name }, { headers: corsHeaders })
    }

    return new Response('Not Found', { status: 404 })
  },
})

console.log(`API server running at http://localhost:${server.port}`)
```

---

## Step 4: Building the Frontend

### RoastForm Component

Create a form that supports both PDF upload and text paste:

```tsx
// src/components/RoastForm.tsx
import { useState, useRef } from 'react';

function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768;
}

export function RoastForm({ onSubmitPDF, onSubmitText, isLoading }) {
  // Auto-detect mobile and show text input by default
  const [mode, setMode] = useState(() => isMobileDevice() ? 'text' : 'pdf');
  const [pdfFile, setPdfFile] = useState(null);
  const [text, setText] = useState('');
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'pdf' && pdfFile) {
      onSubmitPDF(pdfFile);
    } else if (mode === 'text' && text.length >= 50) {
      onSubmitText(text);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Mode Toggle */}
      <div className="flex mb-6 bg-gray-900 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setMode('pdf')}
          className={`flex-1 py-2 px-4 rounded-md ${
            mode === 'pdf' ? 'bg-orange-500 text-white' : 'text-gray-400'
          }`}
        >
          Upload PDF
        </button>
        <button
          type="button"
          onClick={() => setMode('text')}
          className={`flex-1 py-2 px-4 rounded-md ${
            mode === 'text' ? 'bg-orange-500 text-white' : 'text-gray-400'
          }`}
        >
          Paste Text
        </button>
      </div>

      {/* PDF Upload or Text Input based on mode */}
      {mode === 'pdf' ? (
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={(e) => setPdfFile(e.target.files?.[0])}
        />
      ) : (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your LinkedIn profile text here..."
          className="w-full h-48 p-4 bg-gray-900 rounded-xl"
        />
      )}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Generating Roast...' : 'Roast Me!'}
      </button>
    </form>
  );
}
```

---

## Step 5: Deploying on Akash Network

### Create a Dockerfile

```dockerfile
FROM oven/bun:1 as builder
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install
COPY . .
RUN bun run build

FROM oven/bun:1
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/api-server.ts .
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 80 8787
CMD ["bun", "run", "start"]
```

### Create the SDL File (deploy.yaml)

```yaml
---
version: "2.0"

services:
  web:
    image: your-docker-image:latest
    env:
      - VITE_AKASHML_API_KEY=<your-api-key>
    expose:
      - port: 80
        as: 80
        to:
          - global: true

profiles:
  compute:
    web:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 512Mi
        storage:
          size: 1Gi

  placement:
    dcloud:
      attributes:
        host: akash
      signedBy:
        anyOf:
          - akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63
          - akash18qa2a2ltfyvkyj0ggj3hkvuj6twzyumuaru9s4
      pricing:
        web:
          denom: uakt
          amount: 10000

deployment:
  web:
    dcloud:
      profile: web
      count: 1
```

### Deploy via Akash Console

1. Go to [console.akash.network](https://console.akash.network)
2. Connect your wallet with at least 5 AKT
3. Create a new deployment
4. Upload your `deploy.yaml`
5. Set your `VITE_AKASHML_API_KEY` environment variable
6. Select a provider and deploy

---

## Running Locally

```bash
# Terminal 1: Start the API server
bun run api-server.ts

# Terminal 2: Start the frontend
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Conclusion

You've built a complete AI-powered application that:

1. **Parses PDFs** using pdf-parse
2. **Extracts structured data** using AkashML's DeepSeek-V3
3. **Generates creative content** with high-temperature prompts
4. **Deploys to decentralized cloud** on Akash Network

### Key Takeaways

- **Use low temperature (0.1)** for data extraction tasks
- **Use high temperature (0.9)** for creative generation
- **AI beats regex** for extracting data from unstructured text
- **Akash Network** provides cost-effective, decentralized hosting

### Resources

- [AkashML](https://akashml.com) - Get your API key
- [Akash Console](https://console.akash.network) - Deploy your apps
- [Akash Network](https://akash.network) - Learn more about decentralized cloud
- [Source Code](https://github.com/baktun14/linkedin-roast) - Full project repository

---

**Built with AkashML on Akash Network**
