import zlib
import struct
import math
import os

def create_png(width, height, pixel_func):
    """Generate raw PNG bytes using stdlib zlib and struct."""
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # Filter type 0 (None)
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

def pwa_pixel_generator(is_maskable=False):
    def get_pixel(x, y, w, h):
        # Normalize coordinates 0..1
        nx = x / float(w)
        ny = y / float(h)
        
        # Center coordinates -0.5 .. 0.5
        cx = nx - 0.5
        cy = ny - 0.5
        dist = math.sqrt(cx*cx + cy*cy)
        
        # Background gradient: emerald to teal
        # #059669 -> rgb(5, 150, 105) to #0d9488 -> rgb(13, 148, 136)
        bg_r = int(5 + (13 - 5) * (nx + ny) * 0.5)
        bg_g = int(150 + (148 - 150) * (nx + ny) * 0.5)
        bg_b = int(105 + (136 - 105) * (nx + ny) * 0.5)
        
        if is_maskable:
            # Full bleed with safe zone
            fridge_scale = 0.65
        else:
            fridge_scale = 0.75
            
        # Check rounded corners for non-maskable icon
        if not is_maskable:
            corner_r = 0.22
            # Check 4 corners
            for c_x, c_y in [(corner_r, corner_r), (1 - corner_r, corner_r), (corner_r, 1 - corner_r), (1 - corner_r, 1 - corner_r)]:
                if (nx < corner_r or nx > 1 - corner_r) and (ny < corner_r or ny > 1 - corner_r):
                    d_c = math.sqrt((nx - c_x)**2 + (ny - c_y)**2)
                    if d_c > corner_r:
                        return (0, 0, 0, 0) # transparent outside rounded rect

        # Draw fridge box in center
        fw = 0.55 * fridge_scale
        fh = 0.72 * fridge_scale
        fx1 = 0.5 - fw/2.0
        fx2 = 0.5 + fw/2.0
        fy1 = 0.5 - fh/2.0
        fy2 = 0.5 + fh/2.0
        
        # Fridge outline / border
        border_thickness = 0.02 * fridge_scale
        
        if fx1 <= nx <= fx2 and fy1 <= ny <= fy2:
            # Inside fridge
            # Divider line between freezer and lower fridge at 38%
            divider_y = fy1 + fh * 0.38
            divider_half = 0.012 * fridge_scale
            
            # Fridge door handles
            hx1 = fx1 + 0.05 * fw
            hx2 = fx1 + 0.12 * fw
            
            # Handle 1 (freezer)
            if hx1 <= nx <= hx2 and (fy1 + fh*0.12) <= ny <= (fy1 + fh*0.28):
                return (52, 211, 153, 255) # emerald-400
                
            # Handle 2 (fridge)
            if hx1 <= nx <= hx2 and (divider_y + fh*0.10) <= ny <= (divider_y + fh*0.35):
                return (52, 211, 153, 255) # emerald-400
                
            # Divider bar
            if abs(ny - divider_y) <= divider_half:
                return (16, 185, 129, 255) # emerald-500
                
            # Fridge border
            if (nx - fx1) < border_thickness or (fx2 - nx) < border_thickness or (ny - fy1) < border_thickness or (fy2 - ny) < border_thickness:
                return (16, 185, 129, 255) # emerald-500
                
            # Inner body dark slate
            return (28, 25, 23, 255)
            
        # Outside fridge: return gradient background
        return (bg_r, bg_g, bg_b, 255)
        
    return get_pixel

os.makedirs('public', exist_ok=True)

# Generate 192x192
png_192 = create_png(192, 192, pwa_pixel_generator(is_maskable=False))
with open('public/pwa-192x192.png', 'wb') as f:
    f.write(png_192)

# Generate 512x512
png_512 = create_png(512, 512, pwa_pixel_generator(is_maskable=False))
with open('public/pwa-512x512.png', 'wb') as f:
    f.write(png_512)

# Generate 512x512 maskable (full bleed safe zone)
png_maskable = create_png(512, 512, pwa_pixel_generator(is_maskable=True))
with open('public/pwa-maskable-512x512.png', 'wb') as f:
    f.write(png_maskable)

# Generate apple-touch-icon 180x180
png_apple = create_png(180, 180, pwa_pixel_generator(is_maskable=False))
with open('public/apple-touch-icon.png', 'wb') as f:
    f.write(png_apple)

# Favicon 32x32
png_favicon = create_png(32, 32, pwa_pixel_generator(is_maskable=False))
with open('public/favicon.ico', 'wb') as f:
    f.write(png_favicon)

print("PWA icons generated successfully!")
