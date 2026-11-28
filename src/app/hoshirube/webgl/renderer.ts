import { LINE_FS, LINE_VS, POINT_FS, POINT_VS } from './shaders';

export interface Renderer {
    draw(points: number[], lines: number[], time: number): void;
    dispose(): void;
}

export function createRenderer(canvas: HTMLCanvasElement): Renderer | null {
    const gl = canvas.getContext('webgl2', { antialias: true, alpha: true, premultipliedAlpha: true });
    if (!gl) return null;

    const compile = (type: number, source: string, label: string) => {
        const shader = gl.createShader(type)!;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const log = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(`WebGL failed to compile the ${label} shader: ${log ?? 'No compiler log was provided.'}`);
        }
        return shader;
    };

    const makeProgram = (vertexSource: string, fragmentSource: string) => {
        const program = gl.createProgram()!;
        const vertex = compile(gl.VERTEX_SHADER, vertexSource, 'vertex');
        const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource, 'fragment');
        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error(`WebGL failed to link: ${gl.getProgramInfoLog(program)}`);
        }
        gl.deleteShader(vertex);
        gl.deleteShader(fragment);
        return program;
    };

    const setup = (program: WebGLProgram, attributes: [string, number, number][], stride: number) => {
        const vao = gl.createVertexArray()!;
        const buffer = gl.createBuffer()!;
        gl.bindVertexArray(vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        attributes.forEach(([name, size, offset]) => {
            const location = gl.getAttribLocation(program, name);
            gl.enableVertexAttribArray(location);
            gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride, offset);
        });
        return { vao, buffer };
    };

    const pointProgram = makeProgram(POINT_VS, POINT_FS);
    const lineProgram = makeProgram(LINE_VS, LINE_FS);
    const pointBuffers = setup(pointProgram, [['p', 2, 0], ['a', 3, 8], ['c', 3, 20]], 32);
    const lineBuffers = setup(lineProgram, [['p', 2, 0], ['al', 1, 8]], 12);
    const pointUniforms = {
        resolution: gl.getUniformLocation(pointProgram, 'r'),
        time: gl.getUniformLocation(pointProgram, 't'),
    };
    const lineResolution = gl.getUniformLocation(lineProgram, 'r');

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const createUploadBuffer = (buffer: WebGLBuffer, initialCapacity: number) => {
        let data = new Float32Array(initialCapacity);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data.byteLength, gl.DYNAMIC_DRAW);

        return (values: number[]) => {
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            if (values.length > data.length) {
                data = new Float32Array(Math.max(values.length, data.length * 2));
                gl.bufferData(gl.ARRAY_BUFFER, data.byteLength, gl.DYNAMIC_DRAW);
            }
            for (let index = 0; index < values.length; index++) data[index] = values[index];
            if (values.length > 0) gl.bufferSubData(gl.ARRAY_BUFFER, 0, data, 0, values.length);
        };
    };

    const uploadPoints = createUploadBuffer(pointBuffers.buffer, 2048);
    const uploadLines = createUploadBuffer(lineBuffers.buffer, 1024);

    return {
        draw(points, lines, time) {
            const ratio = window.devicePixelRatio || 1;
            const width = Math.round(canvas.clientWidth * ratio);
            const height = Math.round(canvas.clientHeight * ratio);
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
            }
            gl.viewport(0, 0, width, height);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.useProgram(lineProgram);
            gl.bindVertexArray(lineBuffers.vao);
            uploadLines(lines);
            gl.uniform2f(lineResolution, width, height);
            gl.drawArrays(gl.LINES, 0, lines.length / 3);

            gl.useProgram(pointProgram);
            gl.bindVertexArray(pointBuffers.vao);
            uploadPoints(points);
            gl.uniform2f(pointUniforms.resolution, width, height);
            gl.uniform1f(pointUniforms.time, time);
            gl.drawArrays(gl.POINTS, 0, points.length / 8);
        },
        dispose() {
            gl.deleteProgram(pointProgram);
            gl.deleteProgram(lineProgram);
            gl.deleteBuffer(pointBuffers.buffer);
            gl.deleteBuffer(lineBuffers.buffer);
            gl.deleteVertexArray(pointBuffers.vao);
            gl.deleteVertexArray(lineBuffers.vao);
        },
    };
}
