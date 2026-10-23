import math
from datetime import datetime
from typing import Dict, Any, Tuple, Optional
from PIL import Image, ExifTags

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance in meters between two points
    on the earth (specified in decimal degrees).
    """
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0)**2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def get_exif_gps(image_path: str) -> Optional[Tuple[float, float, Optional[str]]]:
    """
    Extract GPS Latitude, Longitude and DateTimeOriginal from an image's EXIF metadata.
    """
    try:
        with Image.open(image_path) as img:
            exif = img._getexif()
            if not exif:
                return None

            gps_info = {}
            date_time_orig = None

            for tag, val in exif.items():
                tag_name = ExifTags.TAGS.get(tag, tag)
                if tag_name == "GPSInfo":
                    for key in val.keys():
                        sub_tag = ExifTags.GPSTAGS.get(key, key)
                        gps_info[sub_tag] = val[key]
                elif tag_name == "DateTimeOriginal":
                    date_time_orig = str(val)

            if "GPSLatitude" not in gps_info or "GPSLongitude" not in gps_info:
                return None

            def _to_degrees(dms, ref):
                # Handles rational or float tuples: (deg, min, sec)
                d = float(dms[0])
                m = float(dms[1])
                s = float(dms[2])
                dec = d + (m / 60.0) + (s / 3600.0)
                if ref in ['S', 'W']:
                    dec = -dec
                return dec

            lat = _to_degrees(gps_info["GPSLatitude"], gps_info.get("GPSLatitudeRef", "N"))
            lon = _to_degrees(gps_info["GPSLongitude"], gps_info.get("GPSLongitudeRef", "E"))
            return lat, lon, date_time_orig

    except Exception as e:
        return None

def check_photo_geotag(
    image_path: str,
    declared_lat: float,
    declared_lon: float,
    max_tolerance_meters: float = 1500.0,
    mock_override_coords: Optional[Tuple[float, float]] = None
) -> Dict[str, Any]:
    """
    Compares image GPS EXIF against declared campus site coordinates.
    Flags uncertainty or deviations with plain-language reasons.
    """
    exif_result = get_exif_gps(image_path)
    
    if mock_override_coords:
        photo_lat, photo_lon = mock_override_coords
        photo_time = "2026-05-15 11:24:00"
    elif exif_result:
        photo_lat, photo_lon, photo_time = exif_result
    else:
        return {
            "has_geotag": False,
            "status": "WARN",
            "distance_meters": None,
            "reason": "Photo lacks EXIF GPS tags. Standard AICTE guidelines require GPS-enabled camera capture during physical site inspection.",
            "confidence": 0.82
        }

    distance = haversine_distance(declared_lat, declared_lon, photo_lat, photo_lon)

    if distance <= max_tolerance_meters:
        return {
            "has_geotag": True,
            "status": "PASS",
            "photo_lat": round(photo_lat, 6),
            "photo_lon": round(photo_lon, 6),
            "declared_lat": round(declared_lat, 6),
            "declared_lon": round(declared_lon, 6),
            "distance_meters": round(distance, 1),
            "capture_timestamp": photo_time,
            "reason": f"Photo geotag verified: captured within {round(distance, 1)}m of declared campus coordinates (Tolerance: {int(max_tolerance_meters)}m).",
            "confidence": 0.98
        }
    else:
        dist_km = round(distance / 1000.0, 2)
        return {
            "has_geotag": True,
            "status": "FAIL",
            "photo_lat": round(photo_lat, 6),
            "photo_lon": round(photo_lon, 6),
            "declared_lat": round(declared_lat, 6),
            "declared_lon": round(declared_lon, 6),
            "distance_meters": round(distance, 1),
            "distance_km": dist_km,
            "capture_timestamp": photo_time,
            "reason": f"CRITICAL GEOLOCATION ANOMALY: Photograph was taken {dist_km} km away from declared campus site. Potential fraudulent submission or spoofed location.",
            "confidence": 0.96
        }
