export const VERTEX_SHADER_SOURCE = `
attribute float aBarIndex;
uniform float uBarCount;
uniform float uBarHeight;
uniform float uResolutionY;
uniform float uResolutionX;
uniform float uGapY;
void main() {
    float barWidth = 2.0 / uBarCount;
    float x = -1.0 + barWidth * aBarIndex + barWidth / 2.0;
    float y = -1.0 + uBarHeight / uResolutionY;
    float top = y + 2.0 * uBarHeight / uResolutionY;
    gl_Position = vec4(x, top, 0, 1);
    gl_PointSize = barWidth * uGapY * uResolutionY; // 0.95 leaves a small gap
}
`;

export const FRAGMENT_SHADER_SOURCE = `
precision mediump float;
void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
`;