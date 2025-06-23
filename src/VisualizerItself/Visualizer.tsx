import React, { useRef, useEffect } from "react";
import { WebGLInit, createProgram, glContextInit } from "./WebGLInit";
import { VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE } from "./Shaders";

const Visualizer: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current!;
        const gl = WebGLInit(canvas);

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
        };

        resize();
        window.addEventListener("resize", resize);
        
        const program = createProgram(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
        gl.useProgram(program);
        
        glContextInit(gl, program, canvas);

        return () => {
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{ width: "100vw", height: "100vh", display: "block" }}
        />
    );
};

export default Visualizer;