import imagekit from "../config/imagekit.js";

// files: array of multer files (memoryStorage -> file.buffer)
export const uploadImagesToImageKit = async (files, folder = "/products") => {
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
    provider: "imagekit",
  }));
};

export const deleteImagesFromImageKit = async (images = []) => {
  const results = await Promise.allSettled(
    images
      .filter((img) => img.provider === "imagekit" && img.fileId)
      .map((img) => imagekit.deleteFile(img.fileId))
  );

  // log failures instead of throwing — a failed delete shouldn't block the update
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error("ImageKit delete failed:", images[i], r.reason?.message);
    }
  });
};