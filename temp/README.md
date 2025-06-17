# DataMatic Bot

An intelligent assistant that automatically suggests and implements the most suitable machine learning model for your dataset.

## Features

- Upload and analyze datasets
- Automatic ML model suggestion
- Code generation for model implementation
- Clean and intuitive user interface
- Integration with LLaMA 3.2 via Ollama

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Install and run Ollama with LLaMA 3.2:
```bash
# Follow instructions at https://ollama.ai to install Ollama
ollama pull llama3.2
```

3. Start the backend server:
```bash
uvicorn app.main:app --reload
```

4. Start the frontend development server:
```bash
cd frontend
npm install
npm start
```

## Project Structure

```
datamatic-bot/
├── app/
│   ├── main.py
│   ├── ml_analyzer.py
│   └── utils.py
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── requirements.txt
└── README.md
```

## API Endpoints

- POST `/api/analyze`: Upload and analyze dataset
- GET `/api/models`: Get available ML models
- POST `/api/generate-code`: Generate implementation code

## License

MIT 