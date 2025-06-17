import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple
import requests
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, mean_squared_error, silhouette_score

def analyze_dataset(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Analyze dataset characteristics and determine the type of ML problem
    """
    analysis = {
        "n_samples": len(df),
        "n_features": len(df.columns),
        "features": list(df.columns),
        "dtypes": df.dtypes.astype(str).to_dict(),
        "missing_values": df.isnull().sum().to_dict(),
        "categorical_features": [],
        "numerical_features": [],
        "target": None,
        "model_type": None
    }
    
    # Identify categorical and numerical features
    for col in df.columns:
        if df[col].dtype == 'object' or df[col].dtype.name == 'category':
            analysis["categorical_features"].append(col)
        else:
            analysis["numerical_features"].append(col)
    
    # Determine target variable (assuming last column is target)
    analysis["target"] = df.columns[-1]
    
    # Determine model type based on target variable
    if df[analysis["target"]].dtype == 'object' or df[analysis["target"]].dtype.name == 'category':
        analysis["model_type"] = "classification"
    elif len(df[analysis["target"]].unique()) < 10:
        analysis["model_type"] = "classification"
    else:
        analysis["model_type"] = "regression"
    
    return analysis

def generate_model_suggestion(analysis: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate ML model suggestion using LLaMA
    """
    prompt = f"""
    You are a professional machine learning expert. Based on the following dataset description, analyze it and provide a model suggestion in the following format:

    **Model Suggestion:** <write the most suitable model name here, e.g., "K-Nearest Neighbors (KNN)" or "Random Forest">
    
    **Model Description:** <briefly explain why this model is suitable for the dataset and task>

    Dataset Details:
    - Number of rows: {analysis['n_samples']}
    - Features: {analysis['features']}
    - Target Column: {analysis['target']}
    - Column Types: {analysis['dtypes']}

    Provide a clear and concise response following the exact format above, with the description on a new line after the model suggestion.
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
        raise Exception("Failed to generate model suggestion")
    
    suggestion = response.json()["response"]
    
    # Generate implementation code
    code_prompt = f"""
    Based on the previous analysis, generate complete Python code for implementing the suggested model.
    Include:
    1. Data preprocessing (handling categorical variables, scaling)
    2. Train-test split
    3. Model training
    4. Model evaluation
    5. Performance metrics
    
    Use the following dataset characteristics:
    - Features: {analysis['features']}
    - Target: {analysis['target']}
    - Categorical features: {analysis['categorical_features']}
    - Numerical features: {analysis['numerical_features']}
    """
    
    code_response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3.2:latest",
            "prompt": code_prompt,
            "stream": False
        }
    )
    
    if code_response.status_code != 200:
        raise Exception("Failed to generate implementation code")
    
    implementation_code = code_response.json()["response"]
    
    return {
        "suggestion": suggestion,
        "model_type": analysis["model_type"],
        "code": implementation_code
    }

def evaluate_model(model, X_test, y_test, model_type: str) -> Dict[str, float]:
    """
    Evaluate model performance based on model type
    """
    y_pred = model.predict(X_test)
    
    if model_type == "classification":
        return {
            "accuracy": accuracy_score(y_test, y_pred)
        }
    elif model_type == "regression":
        return {
            "mse": mean_squared_error(y_test, y_pred),
            "rmse": np.sqrt(mean_squared_error(y_test, y_pred))
        }
    else:  # clustering
        return {
            "silhouette_score": silhouette_score(X_test, y_pred)
        } 