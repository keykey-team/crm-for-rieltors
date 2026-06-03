const DEFAULT_MAX_DIMENSION = 1920;
const DEFAULT_QUALITY = 0.82;

function getWebpFileName(name: string) {
  const baseName = name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9._ -]+/g, '-').trim();
  return `${baseName || 'property-photo'}.webp`;
}

function getScaledDimensions(width: number, height: number, maxDimension: number) {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }

  const ratio = width / height;
  if (ratio >= 1) {
    return { width: maxDimension, height: Math.round(maxDimension / ratio) };
  }

  return { width: Math.round(maxDimension * ratio), height: maxDimension };
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load image'));
    image.src = source;
  });
}

export async function convertImageToWebp(
  file: File,
  options: { maxDimension?: number; quality?: number } = {},
) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are supported');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    const { width, height } = getScaledDimensions(
      image.naturalWidth || image.width,
      image.naturalHeight || image.height,
      options.maxDimension ?? DEFAULT_MAX_DIMENSION,
    );
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas is not available');
    }

    context.drawImage(image, 0, 0, width, height);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (value) => {
          if (value) resolve(value);
          else reject(new Error('Failed to encode image'));
        },
        'image/webp',
        options.quality ?? DEFAULT_QUALITY,
      );
    });

    return new File([blob], getWebpFileName(file.name), {
      type: 'image/webp',
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}