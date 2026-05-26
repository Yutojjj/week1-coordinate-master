"use client";

import React, { forwardRef } from "react";

interface CanvasProps {
  width: number;
  height: number;
}

const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  ({ width, height }, ref) => {
    return (
      <canvas
        ref={ref}
        width={width}
        height={height}
        className="border-2 border-slate-600 rounded w-full"
        style={{ maxWidth: "100%", imageRendering: "pixelated" }}
      />
    );
  }
);

Canvas.displayName = "Canvas";

export default Canvas;
