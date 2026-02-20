# Neon Twin Forge - AI Digital Twin Platform

## 🚀 Project Overview

Neon Twin Forge is a production-ready AI Digital Twin platform. It allows users to create a digital counterpart that evolves based on their personality, health metrics, and interactions. The system features real-time AI simulation, advanced analytics, and a secure, scalable architecture.

## ✨ Key Features

- **AI Digital Twin**: Real-time simulation using OpenAI or Gemini.
- **Advanced Metrics**: Tracks heart rate, stress, sleep, and mood.
- **Secure Authentication**: JWT Access/Refresh tokens, Password Hashing, Role-Based Access Control (RBAC).
- **Interactive Dashboard**: Global stats, user analytics, and twin management.
- **Survey System**: Comprehensive onboarding survey to initialize the twin.
- **File Uploads**: Cloudinary integration for avatar management.
- **API Documentation**: Integrated Swagger/OpenAPI documentation.
- **Containerization**: Docker support for easy deployment.

## 🏗️ Architecture

The project follows a modular Layered Architecture:

\`\`\`
backend/
 ├── config/         # Database and third-party configs
 ├── models/         # Mongoose schemas (User, Twin, Metrics, etc.)
 ├── controllers/    # Request handling logic
 ├── routes/         # API Route definitions
 ├── middleware/     # Auth, Error handling, Validation
 ├── services/       # Business logic (AI, Analytics)
 ├── utils/          # Helper functions
 ├── docs/           # Swagger documentation
 ├── tests/          # Unit and Integration tests
 ├── app.js          # Express app setup
 └── server.js       # Entry point
\`\`\`

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT, bcryptjs
- **AI Integration**: OpenAI API / Google Gemini
- **Storage**: Cloudinary
- **Documentation**: Swagger UI
- **Testing**: Jest, Supertest

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas)
- Cloudinary Account
- OpenAI or Google Gemini API Key

### Installation

1.  **Clone the repository**
    \`\`\`bash
    git clone https://github.com/yourusername/neon-twin-forge.git
    cd neon-twin-forge/backend
    \`\`\`

2.  **Install Dependencies**
    \`\`\`bash
    npm install
    \`\`\`

3.  **Environment Setup**
    Copy `.env.example` to `.env` and fill in your credentials:
    \`\`\`bash
    cp .env.example .env
    \`\`\`

4.  **Start the Server**
    \`\`\`bash
    # Development Mode
    npm run dev

    # Production Mode
    npm start
    \`\`\`

5.  **Access API Docs**
    Open [http://localhost:5000/api/docs](http://localhost:5000/api/docs) to view the Swagger documentation.

## 🧪 Running Tests

\`\`\`bash
npm test
\`\`\`

## 🐳 Docker Deployment

1.  **Build the Image**
    \`\`\`bash
    docker-compose build
    \`\`\`

2.  **Run Containers**
    \`\`\`bash
    docker-compose up
    \`\`\`

## 📦 Deployment Guide

### Deployment to Render

1.  Create a new Web Service on Render.
2.  Connect your repository.
3.  Set Build Command: `npm install`
4.  Set Start Command: `npm start`
5.  Add Environment Variables from your `.env` file.

### Deployment to MongoDB Atlas

1.  Create a Cluster on MongoDB Atlas.
2.  Whitelist your IP (or 0.0.0.0/0 for production).
3.  Get the Connection String and set it as `MONGO_URI` in Render.

## 🔮 Future Improvements

- Email Verification & Forgot Password flow.
- WebSocket integration for real-time chat with Twin.
- Advanced visualization graphs for Metrics.
- Gamification elements (XP, Levels).

---

Developed with ❤️ by the Neon Twin Forge Team.
