export const cloudinaryTransform = (
    url,
    transformation = "f_auto,q_auto"
) => {
    if (!url) return url;

    return url.replace(
        "/upload/",
        `/upload/${transformation}/`
    );
};