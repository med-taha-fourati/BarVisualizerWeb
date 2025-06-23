import { initAudioAnalyser, getFFTTable, getCurrentFFTData } from "../AudioCapture/Audio";

const BAR_COUNT = 64;

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

export function glContextInit(gl: WebGLRenderingContext, program: WebGLProgram, canvas: HTMLCanvasElement) {
    
    let barIndices = new Float32Array(BAR_COUNT).fill(0);
    
    barIndices.forEach((_, i) => barIndices[i] = i);

    getFFTTable().then((fftData) => {
        barIndices = fftData;
    }).catch(() => {
        throw new Error("Error fetching FFT data:");
    });

    console.log("Bar Indices: ", barIndices);
        
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
        
    console.log("WebGL context initialized");
        
        function render() {
            gl?.clearColor(0, 0, 0, 1);
            gl?.clear(gl.COLOR_BUFFER_BIT);

            gl?.uniform1f(uBarCount, BAR_COUNT);
            gl?.uniform1f(uResolutionY, canvas.height);
            gl?.uniform1f(uGapY, 0.8);
            gl?.uniform1f(uResolutionX, canvas.width);

            //console.log(getFFTTable());
            initAudioAnalyser().then(() => {
                // if (fftData.length !== BAR_COUNT) {
                //     throw new Error(`FFT data length (${fftData.length}) does not match BAR_COUNT (${BAR_COUNT})`);
                // }
                const fftData = getCurrentFFTData();
                console.log("FFT Data: ", fftData);
                const maxAmplitude = Math.max(...fftData);
                const normalizedHeights = fftData.map(value => (value / maxAmplitude) * canvas.height);
                //console.log("Normalized Heights: ", normalizedHeights);

                for (let i = 0; i < normalizedHeights.length; i++) {
                    const height = normalizedHeights[i];
                    gl?.uniform1f(uBarHeight, height);
                    gl?.vertexAttrib1f(aBarIndex, i);
                    gl?.drawArrays(gl.POINTS, 0, i);
                }

                //console.clear();
            }).catch((error) => {
                console.error("Error fetching FFT data:", error);
            });

            // const AMPLITUDE = ((canvas.height / canvas.width) * canvas.height);
            // for (let i = 0; i < BAR_COUNT; i++) {
            //     const height = AMPLITUDE + ((-i) / BAR_COUNT) * AMPLITUDE;
            //     gl?.uniform1f(uBarHeight, height);
            //     gl?.uniform1f(uBarCount, BAR_COUNT);
            //     gl?.vertexAttrib1f(aBarIndex, i);
            //     gl?.drawArrays(gl.POINTS, 0, i);
            // }

            requestAnimationFrame(render);
        }

        render();
}