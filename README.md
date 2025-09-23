# chat-app-frontend

This is the frontend of a real-time chat application built with Next.js, Zustand, and TailwindCSS.
It connects with the backend powered by Fastify, Drizzle ORM, JWT, and PostgreSQL to provide a secure, scalable, and modern chat experience.

🚀 Features

🔐 JWT Authentication – login & session handling

💬 One-to-one & group messaging UI

⚡ Real-time updates via WebSockets

🎨 Modern, responsive UI using TailwindCSS

🗂️ Zustand for lightweight state management

🛠️ Tech Stack

Framework: Next.js

State Management: Zustand

Styling: TailwindCSS

API Integration: Axios / Fetch (with JWT auth headers)

📦 Installation

Clone the repository

git clone https://github.com/your-username/chat-app-frontend.git
cd chat-app-frontend


Install dependencies

npm install


Create a .env.local file in the root and add:

NEXT_PUBLIC_API_URL=http://localhost:5000   # Backend Fastify server
NEXT_PUBLIC_WS_URL=ws://localhost:5000      # WebSocket server


Run the development server

npm run dev


Open http://localhost:3000
 in your browser.

📌 Available Scripts

npm run dev – Runs the app in development mode

npm run build – Builds the app for production

npm start – Starts the production build

npm run lint – Runs ESLint checks

🔗 Backend Repo

👉 Chat App Backend

🤝 Contributing

Contributions are welcome! Please fork the repo and submit a pull request.

📜 License

This project is licensed under the MIT License.
