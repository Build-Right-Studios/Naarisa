import dotenv from "dotenv";
import ImageKit from "imagekit";

dotenv.config();

export const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export const uploadImagesToImageKit = async (files, folder = "/naarisa/variants") => {
  const uploads = await Promise.all(
    files.map((file) =>
      imagekit.upload({
        file: file.buffer.toString("base64"),
        fileName: `${Date.now()}-${file.originalname}`,
        folder,
        useUniqueFileName: true,
      })
    )
  );

  return uploads.map((res) => ({
    url: res.url,
    fileId: res.fileId,
  }));
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