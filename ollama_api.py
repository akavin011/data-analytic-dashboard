from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel, HttpUrl
from ollama_utils import setup_qa_chain
import os
from pathlib import Path
from datetime import datetime
import aiohttp
import aiofiles
from typing import Optional, List
import shutil
from logger import logger
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="DATAmat Ollama API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Configure download directory
DOWNLOAD_DIR = Path("datasets")
DOWNLOAD_DIR.mkdir(exist_ok=True)

# Initialize QA chain
qa_chain = setup_qa_chain()

class Query(BaseModel):
    question: str

class DatasetDownload(BaseModel):
    url: HttpUrl
    filename: Optional[str] = None

class KaggleDatasetDownload(BaseModel):
    dataset_name: str  # Format: "username/dataset-name"
    filename: Optional[str] = None

@app.post("/ollama/ask")
async def ask_question(query: Query):
    """Endpoint to ask questions using Ollama with Llama 3.2."""
    if qa_chain is None:
        logger.warning("QA chain is not initialized. No dataset available.")
        raise HTTPException(status_code=400, detail="No dataset available. Please upload a CSV file first.")
    try:
        result = qa_chain.invoke({"query": query.question})
        return {"answer": result["result"]}
    except Exception as e:
        logger.error(f"Error processing question: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")

@app.post("/ollama/upload-dataset")
async def upload_dataset(file: UploadFile = File(...)):
    """Upload a dataset and process it."""
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_filename = f"{timestamp}_{file.filename}"
        file_path = DOWNLOAD_DIR / safe_filename

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        global qa_chain
        qa_chain = setup_qa_chain(force_reload=True)

        logger.info(f"Dataset uploaded successfully: {safe_filename}")
        return {
            "message": "Dataset uploaded and processed successfully",
            "filename": safe_filename,
            "path": str(file_path),
            "size_bytes": os.path.getsize(file_path)
        }
    except Exception as e:
        logger.error(f"Error uploading dataset: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error uploading dataset: {str(e)}")

@app.get("/ollama/list-datasets")
async def list_datasets():
    """List all available datasets."""
    try:
        files = []
        for file_path in DOWNLOAD_DIR.glob('*'):
            files.append({
                "filename": file_path.name,
                "size_bytes": os.path.getsize(file_path),
                "created": datetime.fromtimestamp(os.path.getctime(file_path)).isoformat()
            })
        return {"datasets": files}
    except Exception as e:
        logger.error(f"Error listing datasets: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error listing datasets: {str(e)}")

@app.get("/ollama/health")
async def health_check():
    """Health check endpoint."""
    try:
        # Check if Ollama server is running
        async with aiohttp.ClientSession() as session:
            async with session.get("http://localhost:11434/api/tags") as response:
                if response.status != 200:
                    raise Exception("Ollama server is not responding")
        return {"status": "healthy", "backend": "ollama"}
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")

@app.post("/ollama/download-kaggle-dataset")
async def download_kaggle_dataset(dataset: KaggleDatasetDownload):
    """Download a dataset from Kaggle."""
    try:
        import kaggle
    except ImportError:
        raise HTTPException(
            status_code=501,
            detail="Kaggle package not available. Please install it using: pip install kaggle"
        )
    
    try:
        kaggle_dir = Path.home() / '.kaggle'
        if not (kaggle_dir / 'kaggle.json').exists():
            raise HTTPException(
                status_code=400,
                detail="Kaggle API credentials not found. Please configure your Kaggle credentials."
            )

        download_path = DOWNLOAD_DIR / "kaggle"
        download_path.mkdir(exist_ok=True)

        kaggle.api.dataset_download_files(
            dataset.dataset_name,
            path=str(download_path),
            unzip=True
        )

        downloaded_files = list(download_path.glob('*'))
        if not downloaded_files:
            raise Exception("No files were downloaded")

        global qa_chain
        qa_chain = setup_qa_chain(force_reload=True)

        logger.info(f"Kaggle dataset downloaded successfully: {dataset.dataset_name}")
        return {
            "message": "Kaggle dataset downloaded successfully",
            "files": [str(f.name) for f in downloaded_files],
            "download_path": str(download_path)
        }

    except Exception as e:
        logger.error(f"Error downloading Kaggle dataset: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error downloading Kaggle dataset: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001) 