"use client";

/**
 * Compresse une image côté navigateur avant de l'enregistrer dans Firestore
 * (limite d'un document : 1 Mo). On réduit progressivement la qualité puis
 * la taille jusqu'à obtenir un fichier raisonnable.
 */
export async function compressImage(
  file: File,
  maxDim = 1000,
  maxBytes = 450 * 1024
): Promise<string> {
  const dataUrl = await fileToDataUrl(file);
  const img = await loadImage(dataUrl);

  let width = img.naturalWidth;
  let height = img.naturalHeight;
  // Première réduction des dimensions si l'image est très grande
  if (Math.max(width, height) > maxDim) {
    const ratio = maxDim / Math.max(width, height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  let quality = 0.82;
  let result = drawToDataUrl(img, width, height, quality);

  // On baisse la qualité, puis les dimensions, jusqu'à être sous la limite
  while (result.length * 0.75 > maxBytes) {
    if (quality > 0.45) {
      quality -= 0.12;
    } else if (width > 200 && height > 200) {
      width = Math.round(width * 0.8);
      height = Math.round(height * 0.8);
      quality = 0.7;
    } else {
      break; // on garde le dernier résultat, même si un peu lourd
    }
    result = drawToDataUrl(img, width, height, quality);
  }

  return result;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Impossible de lire l'image."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Format d'image non supporté."));
    img.src = src;
  });
}

function drawToDataUrl(
  img: HTMLImageElement,
  width: number,
  height: number,
  quality: number
): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Impossible de traiter l'image.");
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}
