export const cloudinaryTransform = (url, transformation = "f_auto,q_75") => {
  if (!url) return url;
  return url.replace("/upload/", `/upload/${transformation}/`);
};

export const cloudinaryProductImage = (url, size = "desktop") => {
  const transforms = {
    // ✅ Super tiny LQIP - loads in milliseconds
    lqip: "f_auto,q_30,w_20,h_26,e_blur:1000",

    // Thumbnail for sidebar
    thumbnail: "f_auto,q_50,w_100,h_140,c_fill",

    mobile: "f_auto,q_65,w_500,c_limit",
    tablet: "f_auto,q_70,w_800,c_limit",
    desktop: "f_auto,q_75,w_1000,c_limit",
  };

  return cloudinaryTransform(url, transforms[size] || transforms.desktop);
};

// ✅ NEW: Generate LQIP placeholder (real image, super optimized)
export const generateLQIPPlaceholder = (url) => {
  return cloudinaryProductImage(url, "lqip");
};

export const generateImageSrcSet = (url) => {
  if (!url) return "";
  return `
${cloudinaryProductImage(url, "mobile")} 500w,
${cloudinaryProductImage(url, "tablet")} 800w,
${cloudinaryProductImage(url, "desktop")} 1000w
`.trim();
};

// ✅ Generate inline base64 blur placeholder (no extra fetch!)
export const generateBlurPlaceholder = (url) => {
  // Tiny inline blur SVG - loads instantly
  return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 1300'%3E%3Cfilter id='b'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Crect width='1000' height='1300' fill='%23E8DDD0' filter='url(%23b)'/%3E%3C/svg%3E";
};