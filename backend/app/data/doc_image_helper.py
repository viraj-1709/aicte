import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import random

def draw_official_stamp(draw: ImageDraw.ImageDraw, x: int, y: int, text: str, color=(30, 64, 175)):
    """Draws a circular official government / registrar seal stamp"""
    r = 45
    draw.ellipse([x - r, y - r, x + r, y + r], outline=color, width=3)
    draw.ellipse([x - r + 6, y - r + 6, x + r - 6, y + r - 6], outline=color, width=1)
    draw.text((x - 35, y - 10), text[:12], fill=color)
    draw.text((x - 25, y + 5), "SEAL / MOCK", fill=color)

def generate_document_image(
    output_path: str,
    title: str,
    header_subtitle: str,
    fields: dict,
    doc_type: str,
    is_tampered: bool = False,
    stamp_text: str = "OFFICIAL REGISTRAR"
):
    """
    Generates a realistic high-resolution statutory document image (800x1100)
    with official borders, emblems, field labels, seals, and signatures.
    If is_tampered is True, injects localized high-frequency pixel manipulation (ELA).
    """
    width, height = 800, 1100
    # Aged government parchment background
    bg_color = (252, 250, 245)
    img = Image.new('RGB', (width, height), color=bg_color)
    draw = ImageDraw.Draw(img)

    # Double border
    draw.rectangle([20, 20, width - 20, height - 20], outline=(15, 44, 89), width=3)
    draw.rectangle([26, 26, width - 26, height - 26], outline=(180, 83, 9), width=1)

    # Header Emblem / Banner
    draw.rectangle([40, 40, width - 40, 120], fill=(241, 245, 249), outline=(203, 213, 225))
    draw.text((width // 2 - 160, 50), "GOVERNMENT OF INDIA / STATUTORY AUTHORITY", fill=(15, 44, 89))
    draw.text((width // 2 - 140, 72), header_subtitle.upper(), fill=(180, 83, 9))
    draw.text((width // 2 - 120, 95), "AICTE APPROVAL PROCESS REPOSITORY", fill=(71, 85, 105))

    # Title
    draw.text((width // 2 - 170, 145), title.upper(), fill=(15, 44, 89))
    draw.line([60, 175, width - 60, 175], fill=(203, 213, 225), width=2)

    # Preamble text
    draw.text((60, 195), "This is to certify the official verification and statutory registration of the following particulars:", fill=(51, 65, 85))

    # Field Rows
    y_pos = 230
    for key, val in fields.items():
        label = key.replace('_', ' ').title()
        # Field box
        draw.rectangle([60, y_pos - 4, width - 60, y_pos + 32], fill=(248, 250, 252), outline=(226, 232, 240))
        draw.text((80, y_pos + 6), f"{label}:", fill=(71, 85, 105))
        draw.text((320, y_pos + 6), f"{val}", fill=(15, 23, 42))
        y_pos += 46

    # QR Code placeholder box
    qr_x, qr_y = 60, height - 240
    draw.rectangle([qr_x, qr_y, qr_x + 110, qr_y + 110], outline=(30, 41, 59), width=2, fill=(255, 255, 255))
    # Simulated QR matrix dots
    for qx in range(qr_x + 10, qr_x + 100, 12):
        for qy in range(qr_y + 10, qr_y + 100, 12):
            if (qx + qy) % 5 == 0 or (qx * qy) % 3 == 0:
                draw.rectangle([qx, qy, qx + 8, qy + 8], fill=(0, 0, 0))
    draw.text((qr_x, qr_y + 115), "AICTE e-Vault QR", fill=(100, 116, 139))

    # Seal & Signature
    draw_official_stamp(draw, width - 150, height - 180, stamp_text)
    draw.line([width - 240, height - 120, width - 60, height - 120], fill=(15, 23, 42), width=1)
    draw.text((width - 220, height - 110), "AUTHORIZED SIGNATORY / SEAL", fill=(71, 85, 105))

    # Injected Tampering (for Tampered Demo Twin)
    if is_tampered:
        # Intentionally alter a specific text region with high-contrast sharp box
        # and non-uniform noise to create measurable ELA disparity!
        tamper_x, tamper_y = 310, 316
        draw.rectangle([tamper_x, tamper_y, tamper_x + 140, tamper_y + 26], fill=(255, 255, 200), outline=(239, 68, 68))
        draw.text((tamper_x + 10, tamper_y + 5), "2027-06-09 [MODIFIED]", fill=(185, 28, 28))

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path, 'JPEG', quality=95)
    return output_path

def generate_blueprint_image(output_path: str, title: str, classrooms: int, labs: int):
    """Generates an architectural blueprint image (blue canvas with white architectural lines)"""
    width, height = 900, 600
    img = Image.new('RGB', (width, height), color=(15, 45, 95)) # Blueprint blue
    draw = ImageDraw.Draw(img)

    # Title & border
    draw.rectangle([15, 15, width - 15, height - 15], outline=(255, 255, 255), width=2)
    draw.text((30, 25), f"ARCHITECTURAL FLOOR PLAN & LAYOUT SCHEMATIC - {title.upper()}", fill=(255, 255, 255))
    draw.text((30, 45), f"COMPLIANCE CAPACITY: {classrooms} CLASSROOMS | {labs} LABORATORIES | TOTAL AREA: 4,850 SQM", fill=(180, 210, 255))
    draw.line([25, 68, width - 25, 68], fill=(255, 255, 255), width=1)

    # Grid of rooms
    cols, rows = 4, 3
    room_w = (width - 120) // cols
    room_h = (height - 150) // rows
    start_x, start_y = 60, 95

    room_num = 1
    for r in range(rows):
        for c in range(cols):
            rx = start_x + (c * room_w)
            ry = start_y + (r * room_h)
            draw.rectangle([rx + 4, ry + 4, rx + room_w - 4, ry + room_h - 4], outline=(255, 255, 255), width=2)
            # Door opening gap
            draw.line([rx + 15, ry + room_h - 4, rx + 45, ry + room_h - 4], fill=(15, 45, 95), width=3)
            # Room label
            lbl = f"Classroom {room_num}" if (r > 0 or c >= 2) else f"Lab {c + 1}"
            draw.text((rx + 15, ry + 20), lbl, fill=(255, 255, 255))
            draw.text((rx + 15, ry + 40), "66.0 Sq.m", fill=(180, 210, 255))
            room_num += 1

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path, 'JPEG', quality=90)
    return output_path

def generate_campus_photo(output_path: str, institution_name: str, lat: float, lon: float):
    """Generates a synthetic campus quadrangle photograph"""
    width, height = 800, 500
    img = Image.new('RGB', (width, height), color=(220, 235, 245)) # Sky
    draw = ImageDraw.Draw(img)

    # Ground lawn
    draw.rectangle([0, 320, width, height], fill=(74, 124, 89))
    # Building facade
    draw.rectangle([100, 120, width - 100, 320], fill=(240, 230, 220), outline=(120, 110, 100), width=2)
    # Institutional sign
    draw.rectangle([200, 140, width - 200, 180], fill=(15, 44, 89))
    draw.text((220, 155), institution_name[:35].upper(), fill=(255, 255, 255))

    # Windows
    for wx in range(140, width - 140, 80):
        for wy in range(200, 300, 50):
            draw.rectangle([wx, wy, wx + 40, wy + 35], fill=(120, 180, 220), outline=(80, 80, 80))

    # GPS stamp overlay (typical for AICTE inspection photos)
    draw.rectangle([20, height - 60, 420, height - 15], fill=(0, 0, 0, 180))
    draw.text((30, height - 52), f"GPS: {lat:.6f} N, {lon:.6f} E", fill=(255, 255, 255))
    draw.text((30, height - 35), "Time: 2026-05-15 11:24:00 IST | AICTE Physical Geo-Tag", fill=(255, 215, 0))

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path, 'JPEG', quality=90)
    return output_path
