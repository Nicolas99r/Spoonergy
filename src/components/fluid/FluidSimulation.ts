import * as THREE from 'three';

// Shaders GLSL
const baseVertexShader = `
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform vec2 texelSize;
    void main () {
        vUv = uv;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(position, 1.0);
    }
`;

const clearShader = `
    uniform float value;
    void main () {
        gl_FragColor = vec4(value);
    }
`;

const displayShader = `
    varying vec2 vUv;
    uniform sampler2D uTexture;
    
    void main () {
        vec3 C = texture2D(uTexture, vUv).rgb;
        // Agregamos un poco de sutil color correction para "incienso premium oscuro"
        float a = max(C.r, max(C.g, C.b));
        gl_FragColor = vec4(C, a);
    }
`;

const splatShader = `
    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform vec3 color;
    uniform vec2 point;
    uniform float radius;
    
    void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
    }
`;

const advectionShader = `
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform float dt;
    uniform float dissipation;
    
    void main () {
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        gl_FragColor = dissipation * texture2D(uSource, coord);
    }
`;

const divergenceShader = `
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    uniform vec2 texelSize;
    
    void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;
        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
    }
`;

const jacobiShader = `
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    uniform float alpha;
    uniform float rBeta;
    
    void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float bC = texture2D(uDivergence, vUv).x;
        gl_FragColor = vec4((L + R + B + T + alpha * bC) * rBeta, 0.0, 0.0, 1.0);
    }
`;

const gradientSubtractShader = `
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    
    void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
`;

// Interfaces
interface FBOInfo {
    read: THREE.WebGLRenderTarget;
    write: THREE.WebGLRenderTarget;
    swap: () => void;
}

interface WebGLMaterialMap {
    clear: THREE.ShaderMaterial;
    display: THREE.ShaderMaterial;
    splat: THREE.ShaderMaterial;
    advection: THREE.ShaderMaterial;
    divergence: THREE.ShaderMaterial;
    jacobi: THREE.ShaderMaterial;
    gradientSubtract: THREE.ShaderMaterial;
}

export class FluidEngine {
    private renderer: THREE.WebGLRenderer;
    private camera: THREE.OrthographicCamera;
    private scene: THREE.Scene;
    private mesh: THREE.Mesh;
    private materials!: WebGLMaterialMap;
    
    private density!: FBOInfo;
    private velocity!: FBOInfo;
    private divergence!: THREE.WebGLRenderTarget;
    private pressure!: FBOInfo;
    
    private lastTime: number = 0;
    
    // Revertido a los parámetros originales que el usuario amaba
    private ITERATIONS = 12; // 12 iteraciones = efecto algodonoso original
    private DENSITY_DISSIPATION = 0.992; // Persistencia de humo alta
    private VELOCITY_DISSIPATION = 0.98;
    private SPLAT_RADIUS = 0.004; // Sutileza extrema
    
    constructor(gl: THREE.WebGLRenderer) {
        this.renderer = gl;
        
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.scene = new THREE.Scene();
        this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
        this.scene.add(this.mesh);

        this.initFramebuffers();
        this.initMaterials();
        this.clear();
        
        // No longer managing resize here, R3F does it
    }

    private clear() {
        const mat = this.materials.clear;
        mat.uniforms.value.value = 0.0;
        
        this.renderTarget(this.density.read, mat);
        this.renderTarget(this.density.write, mat);
        this.renderTarget(this.velocity.read, mat);
        this.renderTarget(this.velocity.write, mat);
        this.renderTarget(this.pressure.read, mat);
        this.renderTarget(this.pressure.write, mat);
        this.renderTarget(this.divergence, mat);
    }

    public getTexture() {
        return this.density.read.texture;
    }

    private createFBO(w: number, h: number, format: any, type: any): THREE.WebGLRenderTarget {
        return new THREE.WebGLRenderTarget(w, h, {
            wrapS: THREE.ClampToEdgeWrapping,
            wrapT: THREE.ClampToEdgeWrapping,
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: format,
            type: type,
            depthBuffer: false,
        });
    }

    private createDoubleFBO(w: number, h: number, format: any, type: any): FBOInfo {
        let fbo1 = this.createFBO(w, h, format, type);
        let fbo2 = this.createFBO(w, h, format, type);
        const obj: FBOInfo = {
            read: fbo1,
            write: fbo2,
            swap: () => {
                let temp = obj.read;
                obj.read = obj.write;
                obj.write = temp;
            }
        };
        return obj;
    }

    private initFramebuffers() {
        // Capar la resolución de simulación para mantener 60fps constantes incluso con el modelo 3D activo
        // El valor 512 es el "sweet spot" para MacBook Retina entre nitidez y velocidad de GPU
        const simRes = 512;
        const aspect = window.innerWidth / window.innerHeight;
        const w = simRes;
        const h = Math.round(simRes / aspect);
        
        const type = THREE.HalfFloatType;
        const format = THREE.RGBAFormat;
        
        this.density = this.createDoubleFBO(w, h, format, type);
        this.velocity = this.createDoubleFBO(w, h, format, type);
        this.pressure = this.createDoubleFBO(w, h, format, type);
        this.divergence = this.createFBO(w, h, format, type);
    }

    private initMaterials() {
        // Utils
        const createMaterial = (fragmentShader: string, uniforms: any) => {
            return new THREE.ShaderMaterial({
                vertexShader: baseVertexShader,
                fragmentShader: fragmentShader,
                uniforms: uniforms,
                depthWrite: false,
                depthTest: false,
                blending: THREE.NoBlending
            });
        };

        this.materials = {
            clear: createMaterial(clearShader, { value: { value: 0 } }),
            display: createMaterial(displayShader, { uTexture: { value: null } }),
            splat: createMaterial(splatShader, {
                uTarget: { value: null },
                aspectRatio: { value: 1 },
                color: { value: new THREE.Vector3() },
                point: { value: new THREE.Vector2() },
                radius: { value: 0 }
            }),
            advection: createMaterial(advectionShader, {
                uVelocity: { value: null },
                uSource: { value: null },
                texelSize: { value: new THREE.Vector2() },
                dt: { value: 0 },
                dissipation: { value: 1 }
            }),
            divergence: createMaterial(divergenceShader, {
                uVelocity: { value: null },
                texelSize: { value: new THREE.Vector2() }
            }),
            jacobi: createMaterial(jacobiShader, {
                uPressure: { value: null },
                uDivergence: { value: null },
                alpha: { value: -1 },
                rBeta: { value: 0.25 }
            }),
            gradientSubtract: createMaterial(gradientSubtractShader, {
                uPressure: { value: null },
                uVelocity: { value: null }
            })
        };
    }

    private resize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.renderer.setSize(w, h);
    }

    public splat(x: number, y: number, dx: number, dy: number, color: THREE.Vector3) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const tx = x / w;
        const ty = 1.0 - y / h; // flip y
        
        const mat = this.materials.splat;
        mat.uniforms.aspectRatio.value = w / h;
        mat.uniforms.point.value.set(tx, ty);
        mat.uniforms.radius.value = this.SPLAT_RADIUS;

        // Splat Velo
        mat.uniforms.uTarget.value = this.velocity.read.texture;
        mat.uniforms.color.value.set(dx * 4.0, -dy * 4.0, 0); // amplify input velocity
        this.renderTarget(this.velocity.write, mat);
        this.velocity.swap();

        // Splat Density
        mat.uniforms.uTarget.value = this.density.read.texture;
        mat.uniforms.color.value.copy(color);
        this.renderTarget(this.density.write, mat);
        this.density.swap();
    }

    private renderTarget(target: THREE.WebGLRenderTarget | null, material: THREE.ShaderMaterial) {
        this.mesh.material = material;
        this.renderer.setRenderTarget(target);
        this.renderer.render(this.scene, this.camera);
        this.renderer.setRenderTarget(null); // Reset
    }

    public update() {
        const now = performance.now();
        let dt = (now - this.lastTime) / 1000;
        dt = Math.min(dt, 0.016); // Cap a 60fps aprox para estabilidad
        this.lastTime = now;

        const simW = this.density.read.width;
        const simH = this.density.read.height;
        const texelSizeX = 1.0 / simW;
        const texelSizeY = 1.0 / simH;

        // 1. Advection (Velocity)
        const advMat = this.materials.advection;
        advMat.uniforms.texelSize.value.set(texelSizeX, texelSizeY);
        advMat.uniforms.dt.value = dt;
        advMat.uniforms.uVelocity.value = this.velocity.read.texture;
        advMat.uniforms.uSource.value = this.velocity.read.texture;
        advMat.uniforms.dissipation.value = this.VELOCITY_DISSIPATION;
        this.renderTarget(this.velocity.write, advMat);
        this.velocity.swap();

        // 2. Advection (Density)
        advMat.uniforms.uVelocity.value = this.velocity.read.texture;
        advMat.uniforms.uSource.value = this.density.read.texture;
        advMat.uniforms.dissipation.value = this.DENSITY_DISSIPATION;
        this.renderTarget(this.density.write, advMat);
        this.density.swap();

        // 3. Divergence
        const divMat = this.materials.divergence;
        divMat.uniforms.texelSize.value.set(texelSizeX, texelSizeY);
        divMat.uniforms.uVelocity.value = this.velocity.read.texture;
        this.renderTarget(this.divergence, divMat);

        // 4. Clear Pressure
        const clearMat = this.materials.clear;
        clearMat.uniforms.value.value = 0.0;
        this.renderTarget(this.pressure.read, clearMat);

        // 5. Jacobi Iteration (Pressure solver)
        const jacMat = this.materials.jacobi;
        jacMat.uniforms.uDivergence.value = this.divergence.texture;
        for (let i = 0; i < this.ITERATIONS; i++) {
            jacMat.uniforms.uPressure.value = this.pressure.read.texture;
            this.renderTarget(this.pressure.write, jacMat);
            this.pressure.swap();
        }

        // 6. Gradient Subtraction
        const gsMat = this.materials.gradientSubtract;
        gsMat.uniforms.uPressure.value = this.pressure.read.texture;
        gsMat.uniforms.uVelocity.value = this.velocity.read.texture;
        this.renderTarget(this.velocity.write, gsMat);
        this.velocity.swap();
    }
}
