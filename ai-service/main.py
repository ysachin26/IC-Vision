import os
import asyncio
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any
import uvicorn
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import cv2
import numpy as np
from PIL import Image
import io
import tempfile

# Import our custom modules
from src.ocr.ocr_engine import OCREngine
from src.preprocessing.image_processor import ImageProcessor
from src.comparison.similarity_matcher import SimilarityMatcher

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="MarkSure AI Service",
    description="AI-powered IC marking analysis and verification service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
ocr_engine = None
image_processor = None
similarity_matcher = None

# Pydantic models
class AnalysisResult(BaseModel):
    inspection_id: str
    extracted_text: str
    ocr_confidence: float
    bounding_boxes: List[Dict[str, Any]] = []
    alternatives: List[str] = []
    preprocessing_steps: List[str] = []
    processing_time: float
    image_quality_metrics: Dict[str, Any] = {}

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    services: Dict[str, str]
    version: str

# Initialize AI services
async def initialize_services():
    """Initialize AI services on startup"""
    global ocr_engine, image_processor, similarity_matcher
    
    try:
        logger.info("🔧 Initializing AI services...")
        
        # Initialize image processor
        image_processor = ImageProcessor()
        logger.info("✅ Image processor initialized")
        
        # Initialize OCR engine
        ocr_engine = OCREngine(
            primary_engine='easyocr',
            fallback_engine='tesseract',
            languages=['en']
        )
        await ocr_engine.initialize()
        logger.info("✅ OCR engine initialized")
        
        # Initialize similarity matcher
        similarity_matcher = SimilarityMatcher()
        logger.info("✅ Similarity matcher initialized")
        
        logger.info("🎉 All AI services initialized successfully!")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize AI services: {e}")
        raise

# Startup event
@app.on_event("startup")
async def startup_event():
    """Run initialization tasks on startup"""
    await initialize_services()
    
    # Create necessary directories
    os.makedirs("temp", exist_ok=True)
    os.makedirs("logs", exist_ok=True)
    
    logger.info("🚀 MarkSure AI Service is ready!")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup tasks on shutdown"""
    logger.info("🔄 Shutting down AI service...")
    
    # Cleanup temporary files
    import shutil
    temp_dir = Path("temp")
    if temp_dir.exists():
        shutil.rmtree(temp_dir)
        os.makedirs("temp", exist_ok=True)
    
    logger.info("🔒 AI service shutdown complete")

# Health check endpoint
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    services_status = {}
    
    # Check OCR engine
    if ocr_engine and ocr_engine.is_initialized:
        services_status["ocr"] = "healthy"
    else:
        services_status["ocr"] = "unhealthy"
    
    # Check image processor
    if image_processor:
        services_status["image_processor"] = "healthy"
    else:
        services_status["image_processor"] = "unhealthy"
    
    # Check similarity matcher
    if similarity_matcher:
        services_status["similarity_matcher"] = "healthy"
    else:
        services_status["similarity_matcher"] = "unhealthy"
    
    overall_status = "healthy" if all(
        status == "healthy" for status in services_status.values()
    ) else "unhealthy"
    
    return HealthResponse(
        status=overall_status,
        timestamp=datetime.now().isoformat(),
        services=services_status,
        version="1.0.0"
    )

# Main analysis endpoint
@app.post("/analyze", response_model=AnalysisResult)
async def analyze_image(
    image: UploadFile = File(..., description="IC image to analyze"),
    ocr_engine_type: str = Form("easyocr", description="OCR engine to use"),
    inspection_id: str = Form(..., description="Inspection ID from backend"),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Analyze IC marking image and extract text with confidence scores
    """
    start_time = datetime.now()
    
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    if not ocr_engine or not image_processor:
        raise HTTPException(status_code=503, detail="AI services not initialized")
    
    temp_file_path = None
    
    try:
        # Read image data
        image_data = await image.read()
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
            temp_file.write(image_data)
            temp_file_path = temp_file.name
        
        # Load image with OpenCV
        cv_image = cv2.imread(temp_file_path)
        if cv_image is None:
            raise HTTPException(status_code=400, detail="Unable to load image")
        
        # Step 1: Preprocess image
        logger.info(f"📸 Processing image for inspection {inspection_id}")
        processed_image, preprocessing_steps, quality_metrics = await image_processor.process_image(
            cv_image,
            auto_enhance=True,
            target_size=(1024, 768)
        )
        
        # Step 2: OCR text extraction
        logger.info(f"🔍 Extracting text using {ocr_engine_type}")
        ocr_results = await ocr_engine.extract_text(
            processed_image,
            engine=ocr_engine_type,
            min_confidence=0.1
        )
        
        # Step 3: Post-process results
        extracted_text = ocr_results.get('text', '').strip()
        confidence = ocr_results.get('confidence', 0.0)
        bounding_boxes = ocr_results.get('bounding_boxes', [])
        alternatives = ocr_results.get('alternatives', [])
        
        # Calculate processing time
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # Schedule cleanup of temporary file
        background_tasks.add_task(cleanup_temp_file, temp_file_path)
        
        logger.info(f"✅ Analysis complete for {inspection_id}: '{extracted_text}' (confidence: {confidence:.2f})")
        
        return AnalysisResult(
            inspection_id=inspection_id,
            extracted_text=extracted_text,
            ocr_confidence=confidence,
            bounding_boxes=bounding_boxes,
            alternatives=alternatives,
            preprocessing_steps=preprocessing_steps,
            processing_time=processing_time,
            image_quality_metrics=quality_metrics
        )
        
    except Exception as e:
        logger.error(f"❌ Analysis failed for {inspection_id}: {e}")
        
        # Cleanup temp file on error
        if temp_file_path and os.path.exists(temp_file_path):
            os.unlink(temp_file_path)
        
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

# Text similarity endpoint
@app.post("/similarity")
async def calculate_similarity(
    text1: str = Form(..., description="First text for comparison"),
    text2: str = Form(..., description="Second text for comparison"),
    method: str = Form("rapidfuzz", description="Similarity method to use")
):
    """
    Calculate similarity between two text strings
    """
    if not similarity_matcher:
        raise HTTPException(status_code=503, detail="Similarity matcher not initialized")
    
    try:
        similarity_score = similarity_matcher.calculate_similarity(
            text1, text2, method=method
        )
        
        return {
            "text1": text1,
            "text2": text2,
            "method": method,
            "similarity": similarity_score,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Similarity calculation failed: {str(e)}")

# Batch analysis endpoint (for future use)
@app.post("/analyze/batch")
async def analyze_batch(
    images: List[UploadFile] = File(..., description="List of IC images to analyze"),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Analyze multiple IC images in batch
    """
    if len(images) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 images per batch")
    
    results = []
    
    for i, image in enumerate(images):
        try:
            # Process each image (simplified version)
            result = await analyze_image(
                image=image,
                inspection_id=f"batch-{datetime.now().timestamp()}-{i}",
                background_tasks=background_tasks
            )
            results.append(result)
            
        except Exception as e:
            results.append({
                "error": str(e),
                "filename": image.filename
            })
    
    return {
        "total_images": len(images),
        "successful": len([r for r in results if "error" not in r]),
        "failed": len([r for r in results if "error" in r]),
        "results": results,
        "timestamp": datetime.now().isoformat()
    }

# Image preview endpoint
@app.post("/preview")
async def preview_preprocessing(
    image: UploadFile = File(..., description="IC image to preview"),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Preview image preprocessing results
    """
    if not image_processor:
        raise HTTPException(status_code=503, detail="Image processor not initialized")
    
    temp_file_path = None
    
    try:
        # Read and save image temporarily
        image_data = await image.read()
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
            temp_file.write(image_data)
            temp_file_path = temp_file.name
        
        # Load with OpenCV
        cv_image = cv2.imread(temp_file_path)
        if cv_image is None:
            raise HTTPException(status_code=400, detail="Unable to load image")
        
        # Get preprocessing steps
        processed_image, steps, quality_metrics = await image_processor.process_image(
            cv_image,
            auto_enhance=True,
            return_intermediate=True
        )
        
        # Schedule cleanup
        background_tasks.add_task(cleanup_temp_file, temp_file_path)
        
        return {
            "preprocessing_steps": steps,
            "quality_metrics": quality_metrics,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        if temp_file_path and os.path.exists(temp_file_path):
            os.unlink(temp_file_path)
        raise HTTPException(status_code=500, detail=f"Preview failed: {str(e)}")

# Utility functions
async def cleanup_temp_file(file_path: str):
    """Background task to cleanup temporary files"""
    try:
        if os.path.exists(file_path):
            os.unlink(file_path)
            logger.info(f"🗑️ Cleaned up temp file: {file_path}")
    except Exception as e:
        logger.warning(f"⚠️ Failed to cleanup temp file {file_path}: {e}")

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "MarkSure AI Service",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "analyze": "/analyze",
            "similarity": "/similarity",
            "batch": "/analyze/batch",
            "preview": "/preview",
            "docs": "/docs"
        },
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    # Get configuration from environment
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    log_level = os.getenv("LOG_LEVEL", "info").lower()
    
    # Run the server
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        log_level=log_level,
        reload=True if os.getenv("PYTHON_ENV") == "development" else False
    )