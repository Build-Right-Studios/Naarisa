import { useEffect, useRef, useState } from "react";

const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // ✅ Repeats every time element enters/leaves viewport
        setInView(entry.isIntersecting);
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
};

export default useInView;