import { useEffect, useRef, useState } from "react";
import { drawShape } from "../utils/draw";

export type Shape = any; // We can define exact types later
export type Tool = "pencil" | "rect" | "circle" | "arrow" | "text" | "eraser";

export function useCanvas(
    initialShapes: Shape[],
    remoteShapes: Shape[],
    sendDraw: (shape: Shape) => void,
    sendCursor: (x: number, y: number) => void,
    sendClearBoard: () => void,
    clearInitialShapes: () => void,
    clearTrigger: number
) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [localShapes, setLocalShapes] = useState<Shape[]>([]);
    const [currentTool, setCurrentTool] = useState<Tool>("rect");
    const [color, setColor] = useState("#ffffff");
    
    const isDrawing = useRef(false);
    const currentShape = useRef<Shape | null>(null);

    const allShapes = [...initialShapes, ...remoteShapes, ...localShapes].sort((a, b) => {
        return (a.timestamp || 0) - (b.timestamp || 0);
    });

    const redraw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        allShapes.forEach(shape => drawShape(ctx, shape));
        if (currentShape.current) {
            drawShape(ctx, currentShape.current);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
                redraw();
            }
        };
        // Setup initial size
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [initialShapes, remoteShapes, localShapes]);

    // Re-draw when shapes change
    useEffect(() => {
        redraw();
    }, [initialShapes, remoteShapes, localShapes]);

    useEffect(() => {
        if (clearTrigger > 0) {
            setLocalShapes([]);
            redraw();
        }
    }, [clearTrigger]);

    const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        isDrawing.current = true;

        if (currentTool === "pencil" || currentTool === "eraser") {
            currentShape.current = { type: currentTool, points: [{x, y}], color };
        } else {
            currentShape.current = { type: currentTool, startX: x, startY: y, endX: x, endY: y, color };
        }
    };

    const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Always send cursor for multiplayer overlay
        sendCursor(x, y);

        if (!isDrawing.current || !currentShape.current) return;

        if (currentShape.current.type === "pencil" || currentShape.current.type === "eraser") {
            currentShape.current.points.push({x, y});
        } else {
            currentShape.current.endX = x;
            currentShape.current.endY = y;
        }

        redraw();
    };

    const onMouseUp = () => {
        if (!isDrawing.current || !currentShape.current) return;
        isDrawing.current = false;
        
        // Finalize shape
        const finalShape = { ...currentShape.current, timestamp: Date.now() };
        setLocalShapes(prev => [...prev, finalShape]);
        sendDraw(finalShape);
        currentShape.current = null;
        redraw();
    };

    const clearBoard = () => {
        setLocalShapes([]);
        clearInitialShapes();
        sendClearBoard();
        redraw();
    };

    return { canvasRef, onMouseDown, onMouseMove, onMouseUp, currentTool, setCurrentTool, color, setColor, clearBoard };
}
