import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const location = useLocation();

  useLayoutEffect(() => {
    console.log("Before:", window.scrollY);

    window.scrollTo(0, 0);

    requestAnimationFrame(() => {
      console.log("After RAF:", window.scrollY);

      setTimeout(() => {
        console.log("After 100ms:", window.scrollY);
      }, 100);
    });
  }, [location]);

  return null;
}