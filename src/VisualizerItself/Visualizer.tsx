import React, { useRef, useEffect, useState } from "react";
import { WebGLInit, createProgram, glContextInit } from "./WebGLInit";
import { VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE } from "./Shaders";

const Visualizer: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [barIndices, setBarIndices] = useState<Float32Array | null>(null);

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
        
        glContextInit(gl, program, canvas, setBarIndices, 192);

        return () => {
            window.removeEventListener("resize", resize);
        };
    }, [barIndices]);

    return (
        <>
        {/* <div style={{ 
            position: "absolute", 
            top: 0, 
            left: 0, 
            color: "white", 
            zIndex: 1, 
            backgroundColor: "rgb(131, 131, 131)" }}>
            barIndices: {barIndices ? barIndices.join(", ") : "Loading..."}
        </div> */}
        <div>
        <canvas
            ref={canvasRef}
            style={{ width: "100vw", height: "100vh", display: "block" }}
        />
        </div>
        </>
    );
};

export default Visualizer;