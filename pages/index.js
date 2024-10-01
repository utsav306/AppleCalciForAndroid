import { useRef, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEraser, faTrash, faUndo, faRedo } from "@fortawesome/free-solid-svg-icons";

const Draw = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const isDrawingRef = useRef(false);
  const [color, setColor] = useState("white");
  const [isErasing, setIsErasing] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const context = canvas.getContext("2d");
    contextRef.current = context;
    context.strokeStyle = color;
    context.lineWidth = 5;
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = () => {
    isDrawingRef.current = true;
    contextRef.current.beginPath();
  };

  const endDrawing = () => {
    isDrawingRef.current = false;
    contextRef.current.closePath();
    saveCanvasState();
  };

  const draw = (event) => {
    if (!isDrawingRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    contextRef.current.lineTo(
      event.clientX - rect.left,
      event.clientY - rect.top
    );
    contextRef.current.stroke();
  };

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    const imageData = contextRef.current.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );
    setUndoStack((prev) => [...prev, imageData]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const lastState = undoStack.pop();
    setRedoStack((prev) => [...prev, lastState]);
    setUndoStack([...undoStack]);
    contextRef.current.putImageData(lastState, 0, 0);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const lastState = redoStack.pop();
    setUndoStack((prev) => [...prev, lastState]);
    setRedoStack([...redoStack]);
    contextRef.current.putImageData(lastState, 0, 0);
  };

  const handleColorChange = (newColor) => {
    setColor(newColor);
    setIsErasing(false);
    contextRef.current.strokeStyle = newColor;
    contextRef.current.lineWidth = 5;
  };

  const handleEraserToggle = () => {
    setIsErasing((prev) => !prev);
    contextRef.current.strokeStyle = isErasing ? color : "black";
    contextRef.current.lineWidth = 15;
  };

  const handleClearScreen = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
    saveCanvasState();
  };

  // Function for wrapping text
  const wrapText = (context, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(" ");
    let line = "";
    let lineY = y;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + " ";
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && i > 0) {
        context.fillText(line, x, lineY);
        line = words[i] + " ";
        lineY += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, lineY); // Draw the last line
  };

  const handleRun = async () => {
    const canvas = canvasRef.current;
    const imageDataURL = canvas.toDataURL("image/jpeg");

    const response = await fetch(imageDataURL);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append("imageBlob", blob, "drawing.jpg");

    try {
      const analysisResponse = await fetch("/api/analyzeImage", {
        method: "POST",
        body: formData,
      });

      if (!analysisResponse.ok) {
        throw new Error("Failed to analyze image");
      }

      const result = await analysisResponse.json();
      const analysisArray = JSON.parse(result.analysis.replace(/'/g, '"'));

      if (Array.isArray(analysisArray) && analysisArray.length > 0) {
        const { expr, result: calcResult } = analysisArray[0];

        const context = contextRef.current;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "black";
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = "white";
        context.font = "40px Arial";
        context.textAlign = "center";
        context.textBaseline = "middle";

        const outputText = `${expr} = ${calcResult}`;
        const maxWidth = canvas.width * 0.8; // Set the max width as 80% of the canvas width
        const lineHeight = 50; // Adjust the line height as needed

        // Use wrapText to draw the result with wrapping
        wrapText(
          context,
          outputText,
          canvas.width / 2, // Center horizontally
          canvas.height / 2, // Start vertically centered
          maxWidth,
          lineHeight
        );
      }
    } catch (error) {
      console.error("Error during analysis:", error);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center bg-black h-screen">
      <div className="absolute top-4 flex items-center">
        <div className="flex justify-center items-center space-x-2">
          {["red", "green", "blue", "yellow", "white"].map((colorName) => (
            <button
              key={colorName}
              onClick={() => handleColorChange(colorName)}
              className={`w-5 h-5 rounded-full border-2 border-white transition-transform transform hover:scale-110`}
              style={{
                backgroundColor: colorName,
                boxShadow: `0 0 10px ${colorName}`,
              }}
            />
          ))}
        </div>

        <div
          className="ml-4 w-5 h-5 rounded-full border-2 border-white"
          style={{ backgroundColor: color }}
        />

        <button onClick={handleEraserToggle} className="ml-4">
          <FontAwesomeIcon icon={faEraser} className="text-white" size="lg" />
        </button>

        <button onClick={handleClearScreen} className="ml-4">
          <FontAwesomeIcon icon={faTrash} className="text-white" size="lg" />
        </button>

        <button onClick={handleUndo} className="ml-4">
          <FontAwesomeIcon icon={faUndo} className="text-white" size="lg" />
        </button>

        <button onClick={handleRedo} className="ml-4">
          <FontAwesomeIcon icon={faRedo} className="text-white" size="lg" />
        </button>

        <button
          onClick={handleRun}
          className="ml-4 px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition"
        >
          Run
        </button>
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={endDrawing}
        onMouseMove={draw}
        className="cursor-crosshair"
      />
    </div>
  );
};

export default Draw;
