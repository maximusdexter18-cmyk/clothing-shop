"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const ImageReveal = ({ src, alt, height = 400, className = "", style = {} }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.4, 1, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      ref={ref}
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        height: `${height}px`,
        margin: "0 auto",
        borderRadius: "8px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        ...style,
      }}
      className={className}
    >
      <motion.img
        src={src}
        alt={alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          position: "absolute",
          top: 0,
          left: 0,
          opacity,
          scale,
        }}
      />
    </motion.div>
  );
};

export default ImageReveal;