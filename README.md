# ChatPilot — AI Chatbot

A clean, responsive, and secure full-stack AI chatbot built with **React 18 + Vite**, **Express 4 (ES modules)**, **Supabase Auth & PostgreSQL**, and **Google Gemini (Official `@google/genai` SDK)**.

---

## 🌟 Key Features

1. **Authentication**: Email + password sign up, login, and logout powered by Supabase Auth.
2. **Protected Route Architecture**: Automatic redirects to `/login` for unauthenticated visitors.
3. **Conversations Sidebar**: Chronological conversation history (newest first), single-click conversation deletion, and "New Chat" button.
4. **Interactive Chat Window**:
   - User messages right-aligned, assistant messages left-aligned.
   - Assistant replies formatted with rich GitHub-flavored Markdown via `react-markdown`.
   - Send with <kbd>Enter</kbd> and insert line breaks with <kbd>Shift</kbd> + <kbd>Enter</kbd>.
5. **Real-time Thinking Indicator**: "Gemini is thinking..." animation with disabled input state during generation.
6. **Persistence**: All conversations and messages securely stored in Supabase PostgreSQL and preserved across browser refreshes.
7. **Smart Titling**: New conversation titles automatically generated from the first 50 characters of the initial user prompt.
8. **Toast Notifications**: Friendly error/info banners for failed operations and status updates.
9. **Strict Server-Side Security**: Gemini API keys and Supabase service role keys reside strictly on the server; the frontend communicates exclusively via protected Express REST endpoints using Supabase JWT Bearer authentication.

---

## 📁 Project Architecture

```
demo/
├── package.json              # Root workspace orchestrating client and server
├── .gitignore
├── README.md
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Database schema (conversations, messages, triggers, RLS)
├── server/
│   ├── package.json          # Express 4, @google/genai, @supabase/supabase-js, zod, helmet, cors
│   ├── .env.example          # Server environment variable template
│   ├── .env                  # Local server environment configuration
│   ├── scripts/
│   │   └── migrate.js        # Automated migration runner using pg
│   └── src/
│       ├── index.js          # Express entrypoint with helmet, cors & rate-limiting
│       ├── config.js         # Environment loader & configuration validator
│       ├── db.js             # Supabase service role client
│       ├── gemini.js         # Official @google/genai integration
│       ├── middleware/
│       │   ├── auth.js       # Supabase JWT Bearer token validator
│       │   └── errorHandler.js
│       └── routes/
│           ├── conversations.js # Conversation listing, history & deletion
│           └── chat.js          # Conversation creation, Gemini querying & persistence
└── client/
    ├── package.json          # React 18, Vite, Tailwind CSS v3, React Router v6, react-markdown
    ├── vite.config.js        # Vite config with backend API proxy (/api -> :5000)
    ├── tailwind.config.js    # Tailwind v3 styling
    ├── index.html            # Main HTML document with Inter typography
    ├── .env.example          # Client environment variable template
    ├── .env                  # Local client environment configuration
    └── src/
        ├── index.css         # Styling, custom scrollbars & markdown prose styles
        ├── main.jsx          # React DOM entrypoint
        ├── App.jsx           # React Router v6 route configuration
        ├── context/
        │   └── AuthContext.jsx # Supabase auth provider & state management
        ├── lib/
        │   ├── supabase.js   # Supabase browser client
        │   └── api.js        # Authenticated backend API communication layer
        ├── components/
        │   ├── ProtectedRoute.jsx
        │   ├── Sidebar.jsx
        │   ├── MessageList.jsx
        │   ├── MessageItem.jsx
        │   ├── ChatInput.jsx
        │   └── Toast.jsx
        └── pages/
            ├── Login.jsx
            ├── SignUp.jsx
            └── ChatPage.jsx
```

---

## ⚙️ Configuration & Environment Variables

### 1. Backend Configuration (`server/.env`)
Copy `server/.env.example` to `server/.env` and update the values:

```env
PORT=5000
CLIENT_URL=http://localhost:5173

# Supabase Project Credentials (from Supabase Dashboard -> Project Settings -> API)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Direct PostgreSQL Connection String for Database Migrations (Settings -> Database -> Connection string URI)
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Google Gemini API Key (from Google AI Studio)
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
```

### 2. Frontend Configuration (`client/.env`)
Copy `client/.env.example` to `client/.env`:

```env
# Public Supabase credentials
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# API Server URL (or leave blank to use the Vite proxy)
VITE_API_URL=http://localhost:5000
```

---

## 🗄️ Database Setup

Run the migration script to apply the schema, indexes, trigger, and Row Level Security policies:

```bash
npm run migrate
```

*Or manually copy the SQL content from `supabase/migrations/001_initial_schema.sql` and run it in the Supabase SQL Editor.*

---

## 🚀 Running the Application

### Option A: Run Both Apps Together (from Workspace Root)
```bash
npm run dev
```

### Option B: Run Individually
In one terminal (Backend):
```bash
cd server
npm run dev
```

In a second terminal (Frontend):
```bash
cd client
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## ☁️ Deployment on Render

This repository is pre-configured with a Render Blueprint (`render.yaml` / `render.yml`) for instant deployment:

### 1. Deploy with Render Blueprint (Recommended)
1. Push your code to your GitHub repository.
2. In the [Render Dashboard](https://dashboard.render.com), click **New +** > **Blueprint**.
3. Connect your GitHub repository (`CropPilot-Arificial-Intelligence`).
4. Render will automatically detect `render.yaml` and configure both services:
   - **`croppilot-server`**: Node.js Web Service running the Express REST API.
   - **`croppilot-client`**: High-performance Static Site running the React + Vite frontend.
5. Provide the required environment variables when prompted:
   - For `croppilot-server`:
     - `SUPABASE_URL`: Your Supabase Project URL (`https://xyz.supabase.co`)
     - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Secret Key
     - `GEMINI_API_KEY`: Your Google Gemini API Key
     - `CLIENT_URL`: The URL of your deployed frontend (e.g., `https://croppilot-client.onrender.com`)
   - For `croppilot-client`:
     - `VITE_SUPABASE_URL`: Your Supabase Project URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anonymous Public Key
     - `VITE_API_URL`: The URL of your deployed backend (e.g., `https://croppilot-server.onrender.com`)
6. Click **Apply** to deploy both services simultaneously!
