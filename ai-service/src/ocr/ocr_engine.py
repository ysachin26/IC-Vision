import cv2
import numpy as np
import easyocr
import pytesseract
from typing import Dict, List, Optional, Any, Tuple
import logging
import asyncio
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

class OCREngine:
    """
    OCR Engine supporting multiple OCR backends for IC marking text extraction
    """
    
    def __init__(self, primary_engine: str = 'easyocr', fallback_engine: str = 'tesseract', languages: List[str] = ['en']):
        self.primary_engine = primary_engine
        self.fallback_engine = fallback_engine
        self.languages = languages
        self.is_initialized = False
        
        # OCR instances
        self.easyocr_reader = None
        self.executor = ThreadPoolExecutor(max_workers=2)
        
    async def initialize(self):
        """Initialize OCR engines"""
        try:
            # Initialize EasyOCR
            if 'easyocr' in [self.primary_engine, self.fallback_engine]:
                logger.info("🔧 Initializing EasyOCR...")
                self.easyocr_reader = easyocr.Reader(self.languages, gpu=False)
                logger.info("✅ EasyOCR initialized")
            
            # Check Tesseract installation
            if 'tesseract' in [self.primary_engine, self.fallback_engine]:
                try:
                    # Test Tesseract installation
                    version = pytesseract.get_tesseract_version()
                    logger.info(f"✅ Tesseract initialized (version: {version})")
                except Exception as e:
                    logger.warning(f"⚠️ Tesseract not properly installed: {e}")
            
            self.is_initialized = True
            logger.info("🎉 OCR Engine fully initialized")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize OCR engines: {e}")
            raise
    
    async def extract_text(self, image: np.ndarray, engine: str = None, min_confidence: float = 0.5) -> Dict[str, Any]:
        """
        Extract text from image using specified OCR engine
        
        Args:
            image: Input image as numpy array
            engine: OCR engine to use ('easyocr' or 'tesseract')
            min_confidence: Minimum confidence threshold
            
        Returns:
            Dictionary with extracted text, confidence, and bounding boxes
        """
        if not self.is_initialized:
            raise RuntimeError("OCR Engine not initialized")
        
        engine = engine or self.primary_engine
        
        try:
            if engine == 'easyocr':
                return await self._extract_with_easyocr(image, min_confidence)
            elif engine == 'tesseract':
                return await self._extract_with_tesseract(image, min_confidence)
            else:
                raise ValueError(f"Unsupported OCR engine: {engine}")
                
        except Exception as e:
            logger.error(f"❌ OCR extraction failed with {engine}: {e}")
            
            # Try fallback engine if available
            if self.fallback_engine and self.fallback_engine != engine:
                logger.info(f"🔄 Trying fallback engine: {self.fallback_engine}")
                try:
                    return await self.extract_text(image, self.fallback_engine, min_confidence)
                except Exception as fallback_error:
                    logger.error(f"❌ Fallback OCR also failed: {fallback_error}")
            
            # Return empty result if all attempts fail
            return {
                'text': '',
                'confidence': 0.0,
                'bounding_boxes': [],
                'alternatives': [],
                'engine_used': 'none',
                'error': str(e)
            }
    
    async def _extract_with_easyocr(self, image: np.ndarray, min_confidence: float) -> Dict[str, Any]:
        """Extract text using EasyOCR"""
        if not self.easyocr_reader:
            raise RuntimeError("EasyOCR not initialized")
        
        def _run_easyocr():
            # EasyOCR expects RGB image
            if len(image.shape) == 3 and image.shape[2] == 3:
                rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            else:
                rgb_image = image
            
            # Run OCR
            results = self.easyocr_reader.readtext(
                rgb_image,
                detail=1,
                paragraph=False,
                width_ths=0.7,
                height_ths=0.7
            )
            
            return results
        
        # Run EasyOCR in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        results = await loop.run_in_executor(self.executor, _run_easyocr)
        
        # Process results
        text_parts = []
        bounding_boxes = []
        confidences = []
        
        for (bbox, text, confidence) in results:
            if confidence >= min_confidence:
                text_parts.append(text)
                confidences.append(confidence)
                
                # Convert bbox to standard format
                bbox_dict = {
                    'text': text,
                    'confidence': float(confidence),
                    'coordinates': {
                        'x': int(min(point[0] for point in bbox)),
                        'y': int(min(point[1] for point in bbox)),
                        'width': int(max(point[0] for point in bbox) - min(point[0] for point in bbox)),
                        'height': int(max(point[1] for point in bbox) - min(point[1] for point in bbox))
                    }
                }
                bounding_boxes.append(bbox_dict)
        
        # Combine text parts
        combined_text = ' '.join(text_parts).strip()
        overall_confidence = np.mean(confidences) if confidences else 0.0
        
        return {
            'text': combined_text,
            'confidence': float(overall_confidence),
            'bounding_boxes': bounding_boxes,
            'alternatives': text_parts if len(text_parts) > 1 else [],
            'engine_used': 'easyocr'
        }
    
    async def _extract_with_tesseract(self, image: np.ndarray, min_confidence: float) -> Dict[str, Any]:
        """Extract text using Tesseract OCR"""
        
        def _run_tesseract():
            # Convert to grayscale if needed
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image
            
            # Configure Tesseract for IC markings (small text, single line)
            custom_config = r'--oem 3 --psm 8 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-+./'
            
            # Extract text with confidence data
            data = pytesseract.image_to_data(
                gray,
                config=custom_config,
                output_type=pytesseract.Output.DICT
            )
            
            return data
        
        # Run Tesseract in thread pool
        loop = asyncio.get_event_loop()
        data = await loop.run_in_executor(self.executor, _run_tesseract)
        
        # Process results
        text_parts = []
        bounding_boxes = []
        confidences = []
        
        n_boxes = len(data['level'])
        for i in range(n_boxes):
            confidence = int(data['conf'][i])
            if confidence > (min_confidence * 100):  # Tesseract uses 0-100 scale
                text = data['text'][i].strip()
                if text:  # Skip empty text
                    text_parts.append(text)
                    confidences.append(confidence / 100.0)  # Convert to 0-1 scale
                    
                    bbox_dict = {
                        'text': text,
                        'confidence': confidence / 100.0,
                        'coordinates': {
                            'x': int(data['left'][i]),
                            'y': int(data['top'][i]),
                            'width': int(data['width'][i]),
                            'height': int(data['height'][i])
                        }
                    }
                    bounding_boxes.append(bbox_dict)
        
        # Combine text parts
        combined_text = ' '.join(text_parts).strip()
        overall_confidence = np.mean(confidences) if confidences else 0.0
        
        return {
            'text': combined_text,
            'confidence': float(overall_confidence),
            'bounding_boxes': bounding_boxes,
            'alternatives': text_parts if len(text_parts) > 1 else [],
            'engine_used': 'tesseract'
        }
    
    async def extract_with_ensemble(self, image: np.ndarray, min_confidence: float = 0.5) -> Dict[str, Any]:
        """
        Extract text using ensemble of both OCR engines and combine results
        """
        results = {}
        
        # Try both engines
        for engine in ['easyocr', 'tesseract']:
            try:
                result = await self.extract_text(image, engine, min_confidence)
                results[engine] = result
            except Exception as e:
                logger.warning(f"⚠️ Ensemble OCR failed for {engine}: {e}")
                results[engine] = None
        
        # Combine results intelligently
        best_result = self._combine_ocr_results(results)
        best_result['engine_used'] = 'ensemble'
        
        return best_result
    
    def _combine_ocr_results(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Combine results from multiple OCR engines"""
        valid_results = {k: v for k, v in results.items() if v and v.get('text')}
        
        if not valid_results:
            return {
                'text': '',
                'confidence': 0.0,
                'bounding_boxes': [],
                'alternatives': [],
                'engine_used': 'none'
            }
        
        # Find result with highest confidence
        best_engine = max(valid_results.keys(), key=lambda k: valid_results[k]['confidence'])
        best_result = valid_results[best_engine].copy()
        
        # Collect alternatives from all engines
        all_alternatives = []
        for engine, result in valid_results.items():
            if result['text'] and result['text'] not in all_alternatives:
                all_alternatives.append(result['text'])
        
        best_result['alternatives'] = all_alternatives
        return best_result
    
    def cleanup(self):
        """Cleanup resources"""
        if self.executor:
            self.executor.shutdown(wait=True)