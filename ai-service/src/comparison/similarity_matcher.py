import re
from typing import Dict, List, Tuple, Optional, Any
from rapidfuzz import fuzz, process
import logging

logger = logging.getLogger(__name__)

class SimilarityMatcher:
    """
    Text similarity matching for IC marking comparison
    """
    
    def __init__(self):
        self.methods = {
            'rapidfuzz': self._rapidfuzz_similarity,
            'ratio': self._ratio_similarity,
            'partial_ratio': self._partial_ratio_similarity,
            'token_sort': self._token_sort_similarity,
            'token_set': self._token_set_similarity,
            'levenshtein': self._levenshtein_similarity
        }
    
    def calculate_similarity(self, text1: str, text2: str, method: str = 'rapidfuzz') -> float:
        """
        Calculate similarity between two text strings
        
        Args:
            text1: First text string
            text2: Second text string  
            method: Similarity method to use
            
        Returns:
            Similarity score between 0.0 and 1.0
        """
        if not text1 or not text2:
            return 0.0
        
        # Normalize texts
        text1_norm = self._normalize_text(text1)
        text2_norm = self._normalize_text(text2)
        
        if text1_norm == text2_norm:
            return 1.0
        
        if method not in self.methods:
            logger.warning(f"Unknown similarity method: {method}, using rapidfuzz")
            method = 'rapidfuzz'
        
        try:
            similarity = self.methods[method](text1_norm, text2_norm)
            return min(max(similarity / 100.0, 0.0), 1.0)  # Ensure 0-1 range
        except Exception as e:
            logger.error(f"Similarity calculation failed: {e}")
            return 0.0
    
    def find_best_matches(self, query_text: str, reference_texts: List[str], 
                         method: str = 'rapidfuzz', limit: int = 5) -> List[Tuple[str, float]]:
        """
        Find best matching texts from a list of references
        
        Args:
            query_text: Text to match
            reference_texts: List of reference texts
            method: Similarity method
            limit: Maximum number of matches to return
            
        Returns:
            List of (text, similarity_score) tuples sorted by similarity
        """
        if not query_text or not reference_texts:
            return []
        
        query_norm = self._normalize_text(query_text)
        
        matches = []
        for ref_text in reference_texts:
            if ref_text:
                similarity = self.calculate_similarity(query_norm, ref_text, method)
                matches.append((ref_text, similarity))
        
        # Sort by similarity score descending
        matches.sort(key=lambda x: x[1], reverse=True)
        
        return matches[:limit]
    
    def _normalize_text(self, text: str) -> str:
        """Normalize text for comparison"""
        if not text:
            return ""
        
        # Convert to uppercase
        normalized = text.upper()
        
        # Remove extra whitespace
        normalized = re.sub(r'\s+', ' ', normalized).strip()
        
        # Optional: Remove common separators for loose matching
        # normalized = re.sub(r'[-_./\\]', '', normalized)
        
        return normalized
    
    def _rapidfuzz_similarity(self, text1: str, text2: str) -> float:
        """RapidFuzz default similarity"""
        return fuzz.ratio(text1, text2)
    
    def _ratio_similarity(self, text1: str, text2: str) -> float:
        """RapidFuzz ratio similarity"""
        return fuzz.ratio(text1, text2)
    
    def _partial_ratio_similarity(self, text1: str, text2: str) -> float:
        """RapidFuzz partial ratio similarity"""
        return fuzz.partial_ratio(text1, text2)
    
    def _token_sort_similarity(self, text1: str, text2: str) -> float:
        """RapidFuzz token sort similarity"""
        return fuzz.token_sort_ratio(text1, text2)
    
    def _token_set_similarity(self, text1: str, text2: str) -> float:
        """RapidFuzz token set similarity"""
        return fuzz.token_set_ratio(text1, text2)
    
    def _levenshtein_similarity(self, text1: str, text2: str) -> float:
        """Levenshtein distance based similarity"""
        distance = fuzz.distance(text1, text2)
        max_len = max(len(text1), len(text2))
        if max_len == 0:
            return 100.0
        return (1 - distance / max_len) * 100.0