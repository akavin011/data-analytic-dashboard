from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import json
from typing import Dict, Any
import requests
from .ml_analyzer import analyze_dataset, generate_model_suggestion
from .utils import save_uploaded_file

app = FastAPI(title="DataMatic Bot API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze")
async def analyze_data(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Analyze uploaded dataset and suggest appropriate ML model
    """
    try:
        # Save uploaded file temporarily
        file_path = await save_uploaded_file(file)
        
        # Read and analyze dataset
        df = pd.read_csv(file_path)
        analysis = analyze_dataset(df)
        
        # Generate model suggestion using LLaMA
        model_suggestion = generate_model_suggestion(analysis)
        
        return {
            "status": "success",
            "analysis": analysis,
            "model_suggestion": model_suggestion
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/models")
async def get_available_models() -> Dict[str, Any]:
    """
    Get list of available ML models
    """
    return {
        "models": [
            {
                "name": "Classification",
                "algorithms": ["Random Forest", "XGBoost", "SVM", "Logistic Regression"]
            },
            {
                "name": "Regression",
                "algorithms": ["Linear Regression", "Random Forest", "XGBoost", "SVR"]
            },
            {
                "name": "Clustering",
                "algorithms": ["K-Means", "DBSCAN", "Hierarchical Clustering"]
            }
        ]
    }

@app.post("/api/generate-code")
async def generate_code(analysis: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate implementation code for the suggested model
    """
    try:
        # Prepare prompt for LLaMA
        prompt = f"""
        Generate Python code for implementing a {analysis['model_type']} model using {analysis['algorithm']}.
        Dataset characteristics:
        - Features: {analysis['features']}
        - Target variable: {analysis['target']}
        - Number of samples: {analysis['n_samples']}
        - Number of features: {analysis['n_features']}
        
        Include necessary imports, data preprocessing, model training, and evaluation code.
        """
        
        # Call LLaMA via Ollama
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3.2:latest",
                "prompt": prompt,
                "stream": False
            }
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to generate code")
        
        generated_code = response.json()["response"]
        
        return {
            "status": "success",
            "code": generated_code
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def chat_with_llama(
    message: str = Body(...),
    analysis: dict = Body(...)
):
    """
    Chat with LLaMA 3.2:latest about the dataset.
    """
    prompt = (
        f"You are a professional machine learning assistant. Here is the dataset summary:\n"
        f"{analysis}\n\n"
        f"User: {message}\n"
        f"Assistant:"
    )
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3.2:latest",
            "prompt": prompt,
            "stream": False
        }
    )
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to get response from LLaMA")
    return {"response": response.json()["response"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 