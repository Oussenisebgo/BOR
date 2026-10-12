/**
 * Utility to ensure any image (including SVGs and sample fridges) is converted
 * into a valid rasterized PNG/JPEG base64 data URI before being sent to Gemini Vision.
 */

export async function ensureRasterImageDataUri(inputDataUri: string): Promise<{ dataUri: string; mimeType: string }> {
  // If already a standard raster base64 (jpeg, png, webp)
  if (inputDataUri.startsWith('data:image/jpeg;base64,') ||
      inputDataUri.startsWith('data:image/png;base64,') ||
      inputDataUri.startsWith('data:image/webp;base64,')) {
    const mimeMatch = inputDataUri.match(/^data:(image\/[a-zA-Z0-9]+);base64,/);
    return {
      dataUri: inputDataUri,
      mimeType: mimeMatch ? mimeMatch[1] : 'image/jpeg',
    };
  }

  // If it's an SVG data URI or URL-encoded SVG
  if (inputDataUri.startsWith('data:image/svg+xml') || inputDataUri.includes('<svg')) {
    try {
      const pngUri = await rasterizeSvgToPng(inputDataUri, 800, 840);
      return {
        dataUri: pngUri,
        mimeType: 'image/png',
      };
    } catch (err) {
      console.warn('SVG rasterization fallback:', err);
    }
  }

  // Default fallback
  return {
    dataUri: inputDataUri,
    mimeType: 'image/jpeg',
  };
}

/**
 * Rasterizes an SVG data URI onto an HTML5 canvas to produce a real PNG base64 string
 */
export function rasterizeSvgToPng(svgDataUri: string, width = 800, height = 840): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    // If svgDataUri is not a data URI but raw svg string
    let src = svgDataUri;
    if (!src.startsWith('data:')) {
      src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgDataUri)}`;
    }

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        // Dark background matching fridge exterior
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        // Draw the fridge image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to high-quality PNG data URI
        const pngDataUrl = canvas.toDataURL('image/png', 0.95);
        resolve(pngDataUrl);
      } catch (e) {
        reject(e);
      }
    };

    img.onerror = (e) => {
      reject(new Error('Failed to load SVG into image element for rasterization'));
    };

    img.src = src;
  });
}
