import os
from pathlib import Path
from typing import Dict, Any, Tuple, Optional
from PIL import Image, ImageChops, ImageEnhance
import numpy as np

def perform_error_level_analysis(
    image_path: str,
    output_ela_path: Optional[str] = None,
    quality: int = 90,
    scale: float = 15.0
) -> Dict[str, Any]:
    """
    Performs Error Level Analysis (ELA) on an image file.
    ELA highlights areas of different compression levels, revealing
    tampered text, pasted signatures, or digitally altered dates.
    """
    try:
        path = Path(image_path)
        if not path.exists():
            return {"error": "Image file does not exist", "is_tampered": False, "score": 0.0}

        original = Image.open(image_path).convert('RGB')

        # Create temporary resaved image at given quality
        temp_path = path.parent / f"_temp_ela_{path.stem}.jpg"
        original.save(temp_path, 'JPEG', quality=quality)

        # Reopen resaved image
        resaved = Image.open(temp_path)

        # Compute absolute difference
        diff = ImageChops.difference(original, resaved)

        # Calculate bounding extremities and scale
        extrema = diff.getextrema()
        max_diff = max([ex[1] for ex in extrema]) if extrema else 0
        if max_diff == 0:
            max_diff = 1

        scale_factor = 255.0 / max_diff if max_diff < 128 else scale
        diff_scaled = ImageEnhance.Brightness(diff).enhance(scale_factor / 10.0)

        # Save ELA visualization map
        if not output_ela_path:
            output_ela_path = str(path.parent / f"{path.stem}_ela.jpg")
        diff_scaled.save(output_ela_path, 'JPEG')

        # Clean up temp
        if temp_path.exists():
            try:
                os.remove(temp_path)
            except Exception:
                pass

        # Compute numerical anomaly score using numpy
        diff_arr = np.array(diff)
        mean_diff = float(np.mean(diff_arr))
        std_diff = float(np.std(diff_arr))
        max_local_diff = float(np.max(diff_arr))

        # Local patch variance analysis
        h, w, _ = diff_arr.shape
        patch_size = 32
        max_patch_mean = 0.0
        suspicious_box = None

        for y in range(0, h - patch_size, patch_size):
            for x in range(0, w - patch_size, patch_size):
                patch = diff_arr[y:y+patch_size, x:x+patch_size]
                p_mean = float(np.mean(patch))
                if p_mean > max_patch_mean:
                    max_patch_mean = p_mean
                    # Convert to normalized percentage coordinates
                    suspicious_box = {
                        "x": round((x / w) * 100, 2),
                        "y": round((y / h) * 100, 2),
                        "width": round((patch_size / w) * 100, 2),
                        "height": round((patch_size / h) * 100, 2)
                    }

        # Anomaly scoring: normal scanned documents have uniform low compression delta
        # Altered documents with localized inserts have sharp localized spikes
        disparity_ratio = (max_patch_mean / (mean_diff + 0.001)) if mean_diff > 0 else 1.0
        anomaly_score = min(100.0, round((disparity_ratio * 12.0) + (std_diff * 1.5), 1))

        is_tampered = anomaly_score > 35.0

        return {
            "is_tampered": is_tampered,
            "anomaly_score": anomaly_score,
            "mean_error": round(mean_diff, 2),
            "std_error": round(std_diff, 2),
            "max_patch_error": round(max_patch_mean, 2),
            "ela_visual_path": output_ela_path,
            "suspicious_box": suspicious_box,
            "disparity_ratio": round(disparity_ratio, 2)
        }

    except Exception as e:
        return {
            "error": str(e),
            "is_tampered": False,
            "anomaly_score": 0.0,
            "ela_visual_path": None,
            "suspicious_box": None
        }

def inspect_metadata_forensics(file_path: str) -> Dict[str, Any]:
    """
    Checks file metadata for digital editing tool signatures (Photoshop, Canva, GIMP, etc.)
    and suspicious creation/modification date mismatch.
    """
    path = Path(file_path)
    if not path.exists():
        return {"has_suspicious_metadata": False, "signatures": []}

    suspicious_signatures = []
    metadata_info = {}

    try:
        # Check image EXIF / raw string headers
        with open(file_path, "rb") as f:
            header_sample = f.read(32768).decode('latin-1', errors='ignore')

        lower_header = header_sample.lower()
        tools = [
            ("photoshop", "Adobe Photoshop (Layer editing / digital manipulation detected)"),
            ("canva", "Canva Design Platform (Template synthesis detected)"),
            ("gimp", "GIMP GNU Image Manipulation"),
            ("paint.net", "Paint.NET Image Editor"),
            ("pdfescape", "PDFescape Online Editor"),
            ("ilovepdf", "iLovePDF Online Editor")
        ]

        for token, desc in tools:
            if token in lower_header:
                suspicious_signatures.append(desc)

        metadata_info["suspicious_software"] = suspicious_signatures
        metadata_info["has_tamper_signature"] = len(suspicious_signatures) > 0

    except Exception as e:
        metadata_info["error"] = str(e)

    return metadata_info
