import dotenv from "dotenv";
import ImageKit from "imagekit";
import sharp from "sharp";
import crypto from "crypto";

dotenv.config();

export const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const MAX_MEGAPIXELS = 25;
const MAX_DIMENSION = 4000;

async function optimizeImage(file) {
  const metadata = await sharp(file.buffer).metadata();

  const megapixels = (metadata.width * metadata.height) / 1_000_000;

  // Already within ImageKit limit → upload original
  if (megapixels <= MAX_MEGAPIXELS) {
    return file.buffer;
  }

  console.log(
    `📷 ${file.originalname}: ${megapixels.toFixed(
      2
    )} MP → resizing before upload`
  );

  return sharp(file.buffer)
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 92,
      mozjpeg: true,
    })
    .toBuffer();
}

export const uploadImagesToImageKit = async (
  files,
  folder = "/naarisa/variants"
) => {
  const CONCURRENCY = 2;

  const successful = [];
  const failed = [];

  for (let i = 0; i < files.length; i += CONCURRENCY) {
    const batch = files.slice(i, i + CONCURRENCY);

    const results = await Promise.allSettled(
      batch.map(async (file) => {
        const processedBuffer = await optimizeImage(file);

        return imagekit.upload({
          file: processedBuffer,
          fileName: `${crypto.randomUUID()}-${file.originalname}`,
          folder,
          useUniqueFileName: true,
        });
      })
    );

    results.forEach((result, idx) => {
      const file = batch[idx];

      if (result.status === "fulfilled") {
        successful.push({
          url: result.value.url,
          fileId: result.value.fileId,
          provider: "imagekit",
        });

        console.log(`✅ Uploaded: ${file.originalname}`);
      } else {
        const failure = {
          originalname: file.originalname,
          mimetype: file.mimetype,
          sizeBytes: file.size,
          sizeMB: (file.size / (1024 * 1024)).toFixed(2),
          error: result.reason?.message || String(result.reason),
          timestamp: new Date().toISOString(),
        };

        failed.push(failure);

        console.error("❌ Upload failed:", failure);
      }
    });
  }

  if (failed.length) {
    const err = new Error(
      `${failed.length} of ${files.length} image(s) failed`
    );
    err.failedUploads = failed;
    err.successfulUploads = successful;
    throw err;
  }

  return successful;
};

export const deleteImagesFromImageKit = async (images = []) => {
  const results = await Promise.allSettled(
    images.filter((img) => img.fileId).map((img) => imagekit.deleteFile(img.fileId))
  );

  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error("ImageKit delete failed:", images[i], r.reason?.message);
    }
  });
};