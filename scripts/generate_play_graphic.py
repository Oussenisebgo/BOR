import zlib
import struct
import math
import os

def create_png(width, height, pixel_func):
    """Generate raw PNG bytes using stdlib zlib and struct."""
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # Filter type 0
        for x in range(width):
            r, g, b, a = pixel_func(x, y, width, height)
            raw_data.extend((r, g, b, a))
            
    compressed = zlib.compress(bytes(raw_data), 9)
    
    def chunk(tag, data):
        length = len(data)
        crc = zlib.crc32(tag + data) & 0xffffffff
        return struct.pack('>I', length) + tag + data + struct.pack('>I', crc)
    
    header = b'\x89PNG\r\n\x1a\n'
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr = chunk(b'IHDR', ihdr_data)
    idat = chunk(b'IDAT', compressed)
    iend = chunk(b'IEND', b'')
    return header + ihdr + idat + iend

def feature_graphic_pixel(x, y, w, h):
    # Normalized coordinates
    nx = x / float(w)
    ny = y / float(h)
    
    # Modern dark emerald gradient with culinary accents
    # Deep slate background with radial emerald glow in center-left
    glow_x = 0.35
    glow_y = 0.5
    dist = math.sqrt((nx - glow_x)**2 + ((ny - glow_y)*0.7)**2)
    
    # Base dark gradient
    base_r = int(12 + (6 - 12) * ny)
    base_g = int(24 + (18 - 24) * ny)
    base_b = int(22 + (20 - 22) * ny)
    
    # Radial glow from emerald (#059669 / #10b981)
    glow_intensity = max(0.0, 1.0 - (dist / 0.55))
    glow_intensity = glow_intensity * glow_intensity # smooth quadratic
    
    r = min(255, int(base_r + (16 - base_r) * glow_intensity))
    g = min(255, int(base_g + (185 - base_g) * glow_intensity))
    b = min(255, int(base_b + (129 - base_b) * glow_intensity))
    
    # Add subtle accent border at bottom
    if ny > 0.985:
        return (16, 185, 129, 255) # emerald line
        
    return (r, g, b, 255)

print("Generating 1024x500 Feature Graphic for Google Play Store...")
png_bytes = create_png(1024, 500, feature_graphic_pixel)
with open('public/play-feature-graphic.png', 'wb') as f:
    f.write(png_bytes)
print("Created public/play-feature-graphic.png (1024x500)")
