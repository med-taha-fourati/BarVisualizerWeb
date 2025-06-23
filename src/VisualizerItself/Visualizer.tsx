import React, { useRef, useEffect } from "react";
import { WebGLInit, createProgram } from "./WebGLInit";

const VERTEX_SHADER_SOURCE = `
attribute float aBarIndex;
uniform float uBarCount;
uniform float uBarHeight;
uniform float uResolutionY;
void main() {
    float barWidth = 2.0 / uBarCount;
    float x = -1.0 + barWidth * aBarIndex + barWidth / 2.0;
    float y = -1.0 + uBarHeight / uResolutionY;
    float top = y + 2.0 * uBarHeight / uResolutionY;
    gl_Position = vec4(x, top, 0, 1);
    gl_PointSize = barWidth * 0.95 * uResolutionY;
}
`;

const FRAGMENT_SHADER_SOURCE = `
precision mediump float;
void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
`;

const BAR_COUNT = 64;

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
        
        const barIndices = new Float32Array(BAR_COUNT);
        barIndices.forEach((_, i) => barIndices[i] = i);

        const barIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, barIndexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, barIndices, gl.STATIC_DRAW);

        const aBarIndex = gl.getAttribLocation(program, "aBarIndex");
        gl.enableVertexAttribArray(aBarIndex);
        gl.vertexAttribPointer(aBarIndex, 1, gl.FLOAT, false, 0, 0);

        const uBarCount = gl.getUniformLocation(program, "uBarCount");
        const uBarHeight = gl.getUniformLocation(program, "uBarHeight");
        const uResolutionY = gl.getUniformLocation(program, "uResolutionY");

        function render() {
            gl?.clearColor(0, 0, 0, 1);
            gl?.clear(gl.COLOR_BUFFER_BIT);

            gl?.uniform1f(uBarCount, BAR_COUNT);
            gl?.uniform1f(uResolutionY, canvas.height);

            //console.log("Rendering at time:", performance.now());
            //console.log("Canvas size:", canvas.width, canvas.height);
            const AMPLITUDE = 50;
            const FREQUENCY = 0.1;
            const now = performance.now() * 0.002;
            for (let i = 0; i < BAR_COUNT; i++) {
                const height = AMPLITUDE * Math.sin(now + i * FREQUENCY) + AMPLITUDE;
                gl?.uniform1f(uBarHeight, height);
                gl?.uniform1f(uBarCount, BAR_COUNT);
                gl?.vertexAttrib1f(aBarIndex, 0);
                gl?.drawArrays(gl.LINE_LOOP, 0, i);
            }

            requestAnimationFrame(render);
        }

        render();

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