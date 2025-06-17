import os
import tempfile
from fastapi import UploadFile
from typing import Optional
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler

async def save_uploaded_file(file: UploadFile) -> str:
    """
    Save uploaded file to temporary directory and return the file path
    """
    # Create temporary directory if it doesn't exist
    temp_dir = os.path.join(tempfile.gettempdir(), "datamatic")
    os.makedirs(temp_dir, exist_ok=True)
    
    # Save file
    file_path = os.path.join(temp_dir, file.filename)
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    return file_path

def preprocess_data(df: pd.DataFrame, categorical_features: list, numerical_features: list) -> tuple:
    """
    Preprocess data for ML model training
    """
    # Handle categorical features
    label_encoders = {}
    for feature in categorical_features:
        label_encoders[feature] = LabelEncoder()
        df[feature] = label_encoders[feature].fit_transform(df[feature])
    
    # Handle numerical features
    scaler = StandardScaler()
    df[numerical_features] = scaler.fit_transform(df[numerical_features])
    
    return df, label_encoders, scaler

def split_data(df: pd.DataFrame, target_column: str, test_size: float = 0.2) -> tuple:
    """
    Split data into training and testing sets
    """
    X = df.drop(columns=[target_column])
    y = df[target_column]
    
    return train_test_split(X, y, test_size=test_size, random_state=42)

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean dataset by handling missing values and outliers
    """
    # Handle missing values
    for col in df.columns:
        if df[col].dtype in ['int64', 'float64']:
            df[col].fillna(df[col].mean(), inplace=True)
        else:
            df[col].fillna(df[col].mode()[0], inplace=True)
    
    # Handle outliers in numerical columns
    for col in df.select_dtypes(include=[np.number]).columns:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        df[col] = df[col].clip(lower_bound, upper_bound)
    
    return df 