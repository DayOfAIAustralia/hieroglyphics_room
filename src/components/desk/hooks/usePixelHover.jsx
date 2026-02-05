import { useState, useEffect, useRef } from "react";

export default function usePixelHover(dictionaryImgRef, ruleBookImgRef) {
  const [isDictionaryHovered, setIsDictionaryHovered] = useState(false);
  const [isRuleBookHovered, setIsRuleBookHovered] = useState(false);
  const dictionaryCanvasRef = useRef(null);
  const ruleBookCanvasRef = useRef(null);

  useEffect(() => {
    const setupPixelHover = (imgRef, canvasRef, setHovered) => {
      const image = imgRef.current;
      if (!image) return;

      const handleImageLoad = () => {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(image, 0, 0);
        canvasRef.current = canvas;
      };

      if (image.complete) {
        handleImageLoad();
      } else {
        image.addEventListener("load", handleImageLoad);
      }

      const isOverOpaquePixel = (e) => {
        const canvas = canvasRef.current;
        if (!image || !canvas) return false;

        const rect = image.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const scaleX = image.naturalWidth / rect.width;
        const scaleY = image.naturalHeight / rect.height;

        const ctx = canvas.getContext("2d");
        const pixel = ctx.getImageData(x * scaleX, y * scaleY, 1, 1).data;
        return pixel[3] > 0;
      };

      const handleMouseMove = (e) => {
        if (isOverOpaquePixel(e)) {
          setHovered(true);
        } else {
          setHovered(false);
        }
      };

      const handleMouseLeave = () => {
        setHovered(false);
      };

      image.addEventListener("mousemove", handleMouseMove);
      image.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        image.removeEventListener("load", handleImageLoad);
        image.removeEventListener("mousemove", handleMouseMove);
        image.removeEventListener("mouseleave", handleMouseLeave);
      };
    };

    const cleanupDic = setupPixelHover(
      dictionaryImgRef,
      dictionaryCanvasRef,
      setIsDictionaryHovered,
    );
    const cleanupRule = setupPixelHover(
      ruleBookImgRef,
      ruleBookCanvasRef,
      setIsRuleBookHovered,
    );

    return () => {
      if (cleanupDic) cleanupDic();
      if (cleanupRule) cleanupRule();
    };
  }, []);

  return { isDictionaryHovered, isRuleBookHovered };
}
