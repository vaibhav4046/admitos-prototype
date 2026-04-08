# AdmitOS.ai

**Your AI Admissions Execution Platform**

AdmitOS.ai is an AI-native, agentic RaaS (Reasoning as a Service) platform designed for students aged 15–18 applying to top universities. It moves beyond simple chatbots to provide a Manus-style execution environment where AI agents plan, execute, verify, and deliver actionable admissions artifacts.

## Product Overview

This MVP prototype demonstrates the core user journey and value proposition:
1. **Profile Intake**: A step-by-step onboarding flow to capture the student's academic and extracurricular profile.
2. **Dashboard**: A premium, centralized hub for tracking readiness, tasks, and agent runs.
3. **AI Agent (Manus-style)**: The core feature where users deploy agents to execute complex tasks (e.g., building a university shortlist, planning essays). The UI visualizes the agent's thought process: Plan -> Tool Call -> Verification -> Deliverable.
4. **Execution Modules**: Dedicated pages for University Shortlisting, Application Planning, Essay Planning, and Test Prep.
5. **Human Handoff**: A seamless upgrade path to premium human services (tutors, counsellors) when 1:1 expertise is needed.

## Architecture & Tech Stack

- **Frontend Framework**: React (via Vite) simulating a Next.js-style routing structure using `react-router-dom`.
- **Styling**: Tailwind CSS for utility-first styling, ensuring a premium, modern SaaS aesthetic.
- **UI Components**: Custom components inspired by `shadcn/ui` (Cards, Buttons, Badges, Progress bars) built with `clsx` and `tailwind-merge`.
- **Animations**: `framer-motion` (via `motion/react`) for smooth transitions and the agent execution timeline.
- **Icons**: `lucide-react` for clean, consistent iconography.

## What is Mocked in this MVP

To ensure the prototype is lightweight, fast, and requires no external dependencies, several systems are mocked:
- **Authentication**: The sign-in flow is simulated and redirects to onboarding.
- **Database**: All data (student profile, universities, tasks, runs) is seeded from a local `mockData.ts` file.
- **AI Agent Execution**: The agent's reasoning, tool calling, and output generation are simulated using `setTimeout` and predefined state updates to demonstrate the UX without requiring a live LLM connection or API keys.
- **Payments**: The pricing and credits system is visual only.

## How to Run

1. Ensure dependencies are installed: `npm install`
2. Start the development server: `npm run dev`
3. Open the provided local URL in your browser.

## Suggested Next Steps for Production

1. **Backend Integration**: Replace `mockData.ts` with a real database (e.g., PostgreSQL via Prisma or Supabase).
2. **Authentication**: Implement real auth using Clerk, NextAuth, or Firebase Auth.
3. **Live LLM Integration**: Connect the AI Agent page to a real LLM (e.g., Gemini 1.5 Pro or GPT-4o) using LangChain or Vercel AI SDK to handle dynamic reasoning and tool calling.
4. **Payment Gateway**: Integrate Stripe for subscription management and credit purchasing.
5. **Framework Migration**: Consider moving the codebase to Next.js App Router for better SSR, SEO, and API route management if the application scales significantly.
