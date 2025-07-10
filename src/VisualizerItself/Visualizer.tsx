import React, { useRef, useEffect, useState } from "react";
import { WebGLInit, createProgram, glContextInit } from "./WebGLInit";
import { VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE } from "./Shaders";

const Visualizer: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [barIndices, setBarIndices] = useState<Float32Array | null>(null);
    const [barCount, setBarCount] = useState<number>(192);
    const [height, setHeight] = useState<number>(0);
    const [open, setOpen] = useState<boolean>(false);
    const [barType, setBarType] = useState<"linear" | "logarithmic" | "STFTLogged">("linear");

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
        
        glContextInit(gl, program, canvas, setBarIndices, barCount, height, barType);

        return () => {
            window.removeEventListener("resize", resize);
        };
    }, [barIndices, barCount, height, barType]);

    return (
        <>
        <div>
        <canvas
            ref={canvasRef}
            style={{ width: "100vw", height: "100vh", display: "block" }}
        />
        </div>
        <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            padding: "10px",
            backgroundColor: "rgba(0, 0, 0, 0.37)",
            color: "white",
            zIndex: 1

        }}>
            <button onClick={() => setOpen(!open)}>{open ? "Close" : "Open"}</button>
            <div style={{ display: open ? "block" : "none" }}>
                <p>
                    <span style={{ color: "white" }}>Bar Count: <input type="range" min="1" max="512" value={barCount} onChange={(e) => setBarCount(Number(e.target.value))} />{barCount}</span>
                </p>
                <p>
                    <span style={{ color: "white" }}>Amplitude: <input type="range" min="0" max="200" value={height} onChange={(e) => setHeight(Number(e.target.value))} />{height}</span>
                </p>
                <p>
                    <input
                        type="radio"
                        name="barType"
                        value="linear"
                        onChange={() => setBarType("linear")}
                        checked={barType === "linear"}
                    /> Linear
                    <input
                        type="radio"
                        name="barType"
                        value="logarithmic"
                        onChange={() => setBarType("logarithmic")}
                        checked={barType === "logarithmic"}
                    /> Logarithmic
                    <input
                        type="radio"
                        name="barType"
                        value="STFTLogged"
                        onChange={() => setBarType("STFTLogged")}
                        checked={barType === "STFTLogged"}
                    /> STFT (Logarithmic)
                </p>
            </div>
        </div>
        </>
    );
};

export default Visualizer;