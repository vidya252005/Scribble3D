import React, { useRef, useState, useEffect } from "react";

const BRUSH_COLORS = ["#2b2b2b", "#c0392b", "#2e6da4", "#3d8b4c", "#d9b93c"];

export default function Sketchpad() {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [brushColor, setBrushColor] = useState(BRUSH_COLORS[0]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const start = (e) => {
    drawing.current = true;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const move = (e) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const end = () => {
    drawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="panel-block">
      <div className="panel-block-header">
        <span>Sketch</span>
        <div className="brush-swatches">
          {BRUSH_COLORS.map((c) => (
            <button
              key={c}
              className={"swatch" + (c === brushColor ? " swatch-active" : "")}
              style={{ background: c }}
              onClick={() => setBrushColor(c)}
              aria-label={`brush color ${c}`}
            />
          ))}
          <button className="btn-tiny" onClick={clearCanvas}>Clear</button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={340}
        height={220}
        className="sketch-canvas"
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
      />
      <p className="hint-text">
        Optional — doodle a rough layout for your own reference. Generation is
        driven by the prompt below.
      </p>
    </div>
  );
}
