import cv2
import numpy as np
from typing import Dict, List, Tuple, Optional, Any
import logging

logger = logging.getLogger(__name__)

class ImageProcessor:
    """
    Image preprocessing for IC marking analysis
    """
    
    def __init__(self):
        self.preprocessing_steps = []
    
    async def process_image(self, 
                          image: np.ndarray, 
                          auto_enhance: bool = True,
                          target_size: Optional[Tuple[int, int]] = None,
                          return_intermediate: bool = False) -> Tuple[np.ndarray, List[str], Dict[str, Any]]:
        """
        Process IC image for optimal OCR recognition
        
        Args:
            image: Input image as numpy array
            auto_enhance: Apply automatic enhancement
            target_size: Target size for resizing (width, height)
            return_intermediate: Return intermediate processing steps
            
        Returns:
            Tuple of (processed_image, preprocessing_steps, quality_metrics)
        """
        steps = []
        quality_metrics = {}
        
        if image is None or image.size == 0:
            raise ValueError("Invalid input image")
        
        processed = image.copy()
        
        # Step 1: Convert to grayscale if needed
        if len(processed.shape) == 3:
            processed = cv2.cvtColor(processed, cv2.COLOR_BGR2GRAY)
            steps.append("convert_to_grayscale")
        
        # Step 2: Resize if target size specified
        if target_size:
            h, w = processed.shape
            target_w, target_h = target_size
            
            # Calculate scale factor to maintain aspect ratio
            scale = min(target_w / w, target_h / h)
            if scale < 1.0:  # Only downsize
                new_w, new_h = int(w * scale), int(h * scale)
                processed = cv2.resize(processed, (new_w, new_h), interpolation=cv2.INTER_AREA)
                steps.append(f"resize_to_{new_w}x{new_h}")
        
        # Step 3: Noise reduction
        processed = cv2.bilateralFilter(processed, 9, 75, 75)
        steps.append("bilateral_filter")
        
        # Step 4: Contrast enhancement
        if auto_enhance:
            # CLAHE (Contrast Limited Adaptive Histogram Equalization)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
            processed = clahe.apply(processed)
            steps.append("clahe_enhancement")
        
        # Step 5: Sharpening
        kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
        processed = cv2.filter2D(processed, -1, kernel)
        steps.append("sharpening")
        
        # Step 6: Calculate quality metrics
        quality_metrics = self._calculate_quality_metrics(processed)
        
        logger.info(f"✅ Image processed with steps: {', '.join(steps)}")
        
        return processed, steps, quality_metrics
    
    def _calculate_quality_metrics(self, image: np.ndarray) -> Dict[str, Any]:
        """Calculate image quality metrics"""
        metrics = {}
        
        # Brightness
        metrics['brightness'] = float(np.mean(image))
        
        # Contrast (standard deviation)
        metrics['contrast'] = float(np.std(image))
        
        # Sharpness (Laplacian variance)
        laplacian = cv2.Laplacian(image, cv2.CV_64F)
        metrics['sharpness'] = float(laplacian.var())
        
        # Signal-to-noise ratio estimate
        if metrics['contrast'] > 0:
            metrics['snr_estimate'] = metrics['brightness'] / metrics['contrast']
        else:
            metrics['snr_estimate'] = 0.0
        
        return metrics