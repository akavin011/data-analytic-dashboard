# Data Matic 📊

## Overview
Data Matic is a powerful MERN (MongoDB, Express, React, Node.js) stack web application designed to streamline data management and visualization, powered by Llama 3.2 through Ollama for intelligent data analysis.

## 🚀 Features
- Comprehensive data analysis with Llama 3.2
- Intuitive user interface
- Responsive design
- Natural language data querying
- Dataset visualization and correlation analysis

## 💻 Tech Stack
- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **State Management:** Redux
- **Styling:** Tailwind CSS
- **AI Integration:** Ollama with Llama 3.2
- **Vector Database:** Chroma
- **Embeddings:** HuggingFace BGE

## 🛠️ Prerequisites
- Node.js (v16.0.0 or later)
- npm (v8.0.0 or later)
- MongoDB
- Python 3.8 or later
- Ollama with Llama 3.2 installed locally

## 🔧 Installation

### Clone the Repository
```bash
git clone https://github.com/AravindhPrabu2005/Data_Matic.git
cd Data_Matic
```

### Install Python Dependencies
```bash
pip install -r requirements.txt
```

### Install Backend Dependencies
```bash
cd server
npm install
```

### Install Frontend Dependencies
```bash
cd client
npm install
```

### Install Ollama and Llama 3.2
1. Install Ollama from [https://ollama.ai/](https://ollama.ai/)
2. Pull the Llama 3.2 model:
```bash
ollama pull llama3.2
```

## 🚀 Running the Application

### Start Ollama Server
```bash
ollama serve
```

### Start Python Backend (AI Server)
```bash
python ollama_api.py
```

### Start Node.js Backend
```bash
cd server
npm start
```

### Start Frontend Development Server
```bash
cd client
npm start
```

## 📦 Build for Production
```bash
# Build frontend
cd client
npm run build

# Start production server
cd ../server
npm run prod
```

## 🧪 Running Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## 📞 Contact
Aravindh Prabu - aravindhprabu2005@gmail.com

Project Link: [https://github.com/AravindhPrabu2005/Data_Matic.git](https://github.com/AravindhPrabu2005/Data_Matic.git)

---

**Made with ❤️ by Aravindh Prabu**
