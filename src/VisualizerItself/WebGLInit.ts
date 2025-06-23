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
    const barIndices = new Float32Array(BAR_COUNT);
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

            gl?.uniform1f(uBarCount, BAR_COUNT);
            gl?.uniform1f(uResolutionY, canvas.height);
            gl?.uniform1f(uGapY, 0.8);
            gl?.uniform1f(uResolutionX, canvas.width);

            //console.log("Rendering at time:", performance.now());
            //console.log("Canvas size:", canvas.width, canvas.height);
            //const AMPLITUDE = canvas.width / canvas.height;
            //console.log("Amplitude:", AMPLITUDE);
            //const FREQUENCY = 0.1;
            //const now = performance.now() * 0.002;
            for (let i = BAR_COUNT; i > 0; i--) {
                const height = i;
                gl?.uniform1f(uBarHeight, height);
                gl?.uniform1f(uBarCount, BAR_COUNT);
                gl?.vertexAttrib1f(aBarIndex, 0);
                gl?.drawArrays(gl.POINTS, 0, i);
            }

            requestAnimationFrame(render);
        }

        render();
}