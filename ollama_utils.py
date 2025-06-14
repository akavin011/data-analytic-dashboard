import os
import warnings
import shutil
from pathlib import Path
import dotenv
import requests
import json

from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.document_loaders import CSVLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.llms import Ollama
from langchain.chains import RetrievalQA
from logger import logger

dotenv.load_dotenv()

def delete_vector_db(persist_directory):
    """Force delete the existing vector database and recreate it with correct permissions."""
    if os.path.exists(persist_directory):
        try:
            shutil.rmtree(persist_directory, ignore_errors=True)
            os.makedirs(persist_directory, mode=0o777, exist_ok=True)
            logger.info(f"Deleted and recreated vector database at {persist_directory}")
        except Exception as e:
            logger.error(f"Error deleting vector database: {e}")

def setup_qa_chain(force_reload=False):
    """
    Setup the QA chain with the latest dataset using Ollama with Llama 3.2.
    """
    try:
        logger.info("Starting QA chain setup")
        
        # Check if Ollama is running
        try:
            response = requests.get("http://localhost:11434/api/tags")
            if response.status_code != 200:
                raise Exception("Ollama server is not running")
        except Exception as e:
            logger.error(f"Error connecting to Ollama server: {e}")
            raise Exception("Please ensure Ollama server is running on port 11434")
            
        # Check datasets directory
        datasets_dir = Path("datasets")
        if not datasets_dir.exists():
            logger.error("Datasets directory not found")
            raise Exception("No datasets directory found")
        
        # Get latest dataset
        csv_files = list(datasets_dir.glob("*.csv"))
        if not csv_files:
            logger.warning("No CSV files found in datasets directory. QA chain will not be initialized.")
            return None
        
        latest_dataset = max(csv_files, key=lambda x: x.stat().st_mtime)
        logger.info(f"Selected dataset: {latest_dataset}")
        
        # Database directory
        persist_directory = "chroma_db"
        delete_vector_db(persist_directory)  # Ensure a fresh DB
        
        # Initialize Ollama LLM with Llama 3.2
        llm = Ollama(
            model="llama3.2",
            base_url="http://localhost:11434",
            temperature=0.7,
            num_ctx=4096  # Context window size
        )

        # Load & split dataset
        loader = CSVLoader(str(latest_dataset))
        data = loader.load()

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        text = text_splitter.split_documents(data)

        # Create embeddings
        embedding = HuggingFaceEmbeddings(
            model_name="BAAI/bge-base-en",
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )

        # Create new vector database
        vectordb = Chroma.from_documents(
            documents=text,
            embedding=embedding, 
            persist_directory=persist_directory
        )

        retriever = vectordb.as_retriever(search_type="similarity", search_kwargs={"k": 100})

        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever,
            return_source_documents=False
        )
        
        logger.info("QA chain setup completed successfully")
        return qa_chain
        
    except Exception as e:
        logger.error(f"Error in setup_qa_chain: {str(e)}", exc_info=True)
        raise 