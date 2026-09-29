export function drawShape(ctx: CanvasRenderingContext2D, shape: any) {
    ctx.strokeStyle = shape.color || "#ffffff";
    ctx.fillStyle = shape.color || "#ffffff";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();

    if (shape.type === "clear") {
        ctx.fillStyle = "#111"; // background color
        ctx.fillRect(0, 0, 10000, 10000);
    } else if (shape.type === "rect") {
        ctx.strokeRect(
            shape.startX,
            shape.startY,
            shape.endX - shape.startX,
            shape.endY - shape.startY
        );
    } else if (shape.type === "circle") {
        const radius = Math.sqrt(
            Math.pow(shape.endX - shape.startX, 2) + Math.pow(shape.endY - shape.startY, 2)
        );
        ctx.arc(shape.startX, shape.startY, radius, 0, 2 * Math.PI);
        ctx.stroke();
    } else if (shape.type === "pencil" && shape.points && shape.points.length > 0) {
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        for (let i = 1; i < shape.points.length; i++) {
            ctx.lineTo(shape.points[i].x, shape.points[i].y);
        }
        ctx.stroke();
    } else if (shape.type === "eraser" && shape.points && shape.points.length > 0) {
        ctx.strokeStyle = "#111"; // Erase using background color
        ctx.lineWidth = 20;       // Thick brush for erasing
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        for (let i = 1; i < shape.points.length; i++) {
            ctx.lineTo(shape.points[i].x, shape.points[i].y);
        }
        ctx.stroke();
    } else if (shape.type === "arrow") {
        const headlen = 15; 
        const dx = shape.endX - shape.startX;
        const dy = shape.endY - shape.startY;
        const angle = Math.atan2(dy, dx);
        
        ctx.moveTo(shape.startX, shape.startY);
        ctx.lineTo(shape.endX, shape.endY);
        ctx.lineTo(shape.endX - headlen * Math.cos(angle - Math.PI / 6), shape.endY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(shape.endX, shape.endY);
        ctx.lineTo(shape.endX - headlen * Math.cos(angle + Math.PI / 6), shape.endY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
    }
}
