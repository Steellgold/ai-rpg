# Chronicles of Destiny: Interactive Storytelling Platform 📚

This interactive storytelling platform enables players to create and play through AI-generated narrative adventures ✨. The application leverages modern web technologies to provide an immersive experience where players' choices influence the direction and outcome of their unique stories 🛤️.

[Demo video](https://www.youtube.com/watch?v=b1l7Ia9oimQ) - [Website URL (plz no spam :joy:)](https://ai-rpg.steellgold.fr)

## Tech Stack 🛠️

### Frontend 💻
- Next.js 15 - React framework with App Router 🔄
- React 19 - JavaScript library for building user interfaces ⚛️
- TypeScript - Static type checking 📝
- Tailwind CSS 4 - Utility-first CSS framework 🎨
- shadcn/ui - Reusable UI components built with Radix UI 🧩
- next-intl - Internationalization for Next.js (English and French support) 🌍
- Lucide React - Icon library 🔣

### Backend 🏗️
- Supabase ⚡
  - Authentication (Discord OAuth) 🔐
  - Storage (for image hosting) 🖼️
  - Database 💾
  - Edge Functions for AI stories generations 🚀
- Prisma and Supabase JS SDK 🔌
- Next.js Server Actions - For handling server-side logic 🖥️

### AI Features 🤖
- OpenAI API 🧠
  - DALL-E 3 - For generating scene images and story covers 🎭
- AI SDK - Interface for AI-assisted content creation with schemas 📋
  - OpenAI integration 🔄

### Environment & Configuration ⚙️
- Server-only enforced environment variables 🔒
- zod - Runtime validation of environment variables and data ✅

## Key Features 🔑

- Interactive Storytelling: Dynamic narrative progression based on player choices 📖
- AI-Generated Content: Stories, scenes, and images created using AI 🎨
- Genre Selection: Players can select from multiple genres 📚
- Dice Rolling: Random elements affecting story outcomes 🎲
- Multilingual Support: English and French interfaces 🌐
- Visual Theming: Dynamic theming with dark/light mode and visual effects 🌓
- Progress Tracking: Save and continue stories at any point 💾

## Authentication 🔐
- The application uses Supabase Authentication with Discord OAuth for user login and session management, with custom middleware for session validation and user creation 👤

## Internationalization 🌍
- The application supports English and French languages using next-intl, with locale detection from browser preferences and persistent language selection 🗣️

## Deployment 🚀
- Vercel ▲
