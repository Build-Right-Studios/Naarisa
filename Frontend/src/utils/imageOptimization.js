export const buildImageUrls = (url) => {
  if (!url) return {};

  return {
    url,

    thumbnail: url
      .replace(/w_\d+/, "w_150")
      .replace(/q_\d+/, "q_70"),

    srcSet: `
      ${url.replace(/w_\d+/, "w_500")} 500w,
      ${url.replace(/w_\d+/, "w_800")} 800w,
      ${url.replace(/w_\d+/, "w_1000")} 1000w
    `.trim(),

    sizes: "(max-width:640px) 100vw, (max-width:1024px) 50vw, 45vw",
  };
};

// Generate a real LQIP image (not SVG)
export const generateLQIPUrl = (url) => {
  if (!url) return '';
  // Real image: 20px wide, blurred, low quality
  return url.replace(/w_\d+/, 'w_20').replace(/q_\d+/, 'q_20');
};