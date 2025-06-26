import { initAudioAnalyser,  getCurrentFFTData, BAR_COUNT, bands, getBandEnergies, FFT_SIZE } from "../AudioCapture/Audio";

export const WebGLInit = (canvas: HTMLCanvasElement) => {
    const gl = canvas.getContext("webgl");
    if (!gl) {
        throw new Error("WebGL not supported");
    }
    
    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return gl;
}

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader) || "Shader compile failed");
    }
    return shader;
}

export function createProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string) {
    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) || "Program link failed");
    }
    return program;
}

export function glContextInit(gl: WebGLRenderingContext, program: WebGLProgram, canvas: HTMLCanvasElement, setBarIndices: (indices: Float32Array) => void, barCount: number = BAR_COUNT) {
    
    const barIndices = new Float32Array(barCount).fill(0);
    
    barIndices.forEach((_, i) => barIndices[i] = i);
        
    const barIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, barIndexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, barIndices, gl.DYNAMIC_DRAW);
        
    const aBarIndex = gl.getAttribLocation(program, "aBarIndex");
    gl.enableVertexAttribArray(aBarIndex);
    gl.vertexAttribPointer(aBarIndex, 1, gl.FLOAT, false, 0, 0);
        
    const uBarCount = gl.getUniformLocation(program, "uBarCount");
    const uBarHeight = gl.getUniformLocation(program, "uBarHeight");
    const uResolutionY = gl.getUniformLocation(program, "uResolutionY");
    const uGapY = gl.getUniformLocation(program, "uGapY");
    const uResolutionX = gl.getUniformLocation(program, "uResolutionX");
        
    function render() {
            gl?.clearColor(0, 0, 0, 1);
            gl?.clear(gl.COLOR_BUFFER_BIT);

            gl?.uniform1f(uBarCount, barCount);
            gl?.uniform1f(uResolutionY, canvas.height);
            gl?.uniform1f(uGapY, 0.8);
            gl?.uniform1f(uResolutionX, canvas.width);

            const fftData = getCurrentFFTData();
 
            const bandDefs = bands(48000, barCount);

            const bandEnergies = getBandEnergies(fftData, bandDefs, 48000, FFT_SIZE);

            const minEnergy = Math.min(...bandEnergies);
            const maxEnergy = Math.max(...bandEnergies);
            const normalizedHeights = bandEnergies.map(e => {
                if (maxEnergy === minEnergy) return 0;
                return ((e - minEnergy) / (maxEnergy - minEnergy)) * canvas.height / 2;
            });

            for (let i = 0; i < normalizedHeights.length; i++) {
                const height = normalizedHeights[i];
                gl.uniform1f(uBarHeight, height);
                gl.uniform1f(uBarCount, normalizedHeights.length);
                gl.vertexAttrib1f(aBarIndex, i);
                gl.drawArrays(gl.POINTS, i, 1);
            }

            requestAnimationFrame(render);
        }

    initAudioAnalyser().then(() => {
        render();
    }).catch((error) => {
        console.error("Error initializing audio analyser:", error);
    });
}

