# KisanConnect 🌾

> **Bridging the agricultural gap through smart equipment sharing, labor matching, and AIML-driven recommendations.**

KisanConnect is a full-stack, decoupled platform designed to empower farming communities by allowing them to seamlessly share heavy machinery, rent out equipment, and hire local labor. Powered by an intelligent Natural Language Processing (NLP) matching engine, it pairs farmers' needs with available local resources in real-time.

---

## 🚀 Live Demo
* **Live Web Application:** [https://kisanconnect-web.onrender.com/](https://kisanconnect-web.onrender.com/)

---

## 🛠️ Tech Stack & Architecture

KisanConnect utilizes a modern decoupled mono-repo architecture:

* **Frontend:** React, Vite, Tailwind CSS (Single Page Application)
* **Backend & API Server:** Node.js, Express, TypeScript, Cookie-Parser (Secure Session Management)
* **AI/ML Microservice:** Python, FastAPI, Scikit-learn (TF-IDF Cosine Similarity Matching Engine)
* **Database & Hosting:** PostgreSQL, hosted entirely on Render Cloud Platform

---

## ✨ Key Features

1. **Mobile & PIN Authentication:** Secure, lightweight user onboarding tailored for rural accessibility using phone numbers and 4-digit PINs.
2. **Two-Way Marketplace ("Have" vs "Need"):** Farmers can list equipment they own or post urgent requirements for labor/machinery.
3. **AI-Powered Matching Engine:** A dedicated Python FastAPI microservice using Scikit-learn to parse requests and match optimal resources based on text relevance and category.
4. **Secure Admin Dashboard:** A protected system monitor view locked behind secure HTTP-only cookies and environment-based credentials, allowing administrators to track active listings, total users, and toggle listing statuses.
5. **Real-time Resolution Logic:** Automated booking states that instantly update availability once a match or booking is confirmed.

---

## 📂 Project Structure

```text
KisanConnect-Platform/
├── kisanconnect/          # Node.js backend, React frontend, and database code
│   ├── server.ts          # Express server with security middleware & API routes
│   ├── src/               # Frontend React components (including AdminDashboard.tsx)
│   └── server/            # PostgreSQL database connection and queries
├── kisanconnect-ml/       # Python FastAPI Machine Learning microservice
│   ├── app.py             # TF-IDF matching algorithm endpoints
│   └── requirements.txt   # Python dependencies
└── README.md

---

⚙️ Local Development Setup

If you want to run the project locally on your machine:

1. Clone the Repository
git clone [https://github.com/psampatganesh27-debug/KisanConnect-Platform.git](https://github.com/psampatganesh27-debug/KisanConnect-Platform.git)
cd KisanConnect-Platform

2. Run the ML Microservice
cd kisanconnect-ml
pip install -r requirements.txt
uvicorn app:app --reload --port 8000

3. Run the Node.js / React Application
Open a new terminal window:
cd kisanconnect
npm install
npm run dev

---

🛡️ Environment Variables
The project requires the following environment variables configured on your hosting environment (Render):

DATABASE_URL: PostgreSQL connection string
PYTHON_API_URL: URL pointing to the FastAPI match endpoint
ADMIN_USER: Secure username for the admin dashboard
ADMIN_PASS: Secure password for the admin dashboard

---
