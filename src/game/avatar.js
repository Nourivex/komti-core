import * as THREE from "three";
import { frameObjects, normalizeSize } from "../lib/scene3d.js";

function glowMaterial(color, opacity = 1) {
    return new THREE.MeshBasicMaterial({
        color,
        transparent: opacity < 1,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
    });
}

function makeGlowTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext("2d");
    const gradient = context.createRadialGradient(128, 128, 3, 128, 128, 124);
    gradient.addColorStop(0, "rgba(255,230,235,1)");
    gradient.addColorStop(0.12, "rgba(255,120,150,.92)");
    gradient.addColorStop(0.43, "rgba(178,58,90,.32)");
    gradient.addColorStop(1, "rgba(109,23,48,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

function createRing(radius, tube, color, rotation) {
    const group = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 8, 120), glowMaterial(color, 0.72));
    group.add(ring);

    for (let index = 0; index < 5; index += 1) {
        const angle = index * Math.PI * 0.4 + 0.18;
        const marker = new THREE.Mesh(new THREE.SphereGeometry(tube * 2.6, 10, 10), glowMaterial(index === 2 ? 0xffc0cb : color, 0.95));
        marker.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
        group.add(marker);
    }

    group.rotation.set(...rotation);
    return group;
}

function createSegmentedRing(radius, color) {
    const group = new THREE.Group();
    for (let index = 0; index < 14; index += 1) {
        const start = index * (Math.PI * 2 / 14);
        const arc = new THREE.Mesh(
            new THREE.TorusGeometry(radius, index % 4 === 0 ? 0.018 : 0.009, 6, 18, 0.25),
            glowMaterial(index % 5 === 0 ? 0xff8aaa : color, index % 3 === 0 ? 0.92 : 0.55),
        );
        arc.rotation.z = start;
        group.add(arc);
    }
    group.rotation.set(1.12, 0.18, -0.28);
    return group;
}

function createSignals() {
    const positions = [];
    const colors = [];
    const cyan = new THREE.Color(0xe05070);
    const coral = new THREE.Color(0xffb0c0);
    for (let index = 0; index < 58; index += 1) {
        const radius = 1.2 + Math.random() * 0.75;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions.push(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi) * 0.68,
            radius * Math.sin(phi) * Math.sin(theta),
        );
        const color = index % 8 === 0 ? coral : cyan;
        colors.push(color.r, color.g, color.b);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    const points = new THREE.Points(
        geometry,
        new THREE.PointsMaterial({
            size: 0.026,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true,
        }),
    );
    return points;
}

function buildCore() {
    const root = new THREE.Group();
    root.name = "TIKA_Holographic_Core";
    root.userData = { id: "tika-core", type: "holographic-ai" };

    const glowTexture = makeGlowTexture();
    const aura = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0xb23a5a,
        transparent: true,
        opacity: 0.78,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    }));
    aura.scale.set(3.25, 3.25, 1);
    root.add(aura);

    const shellMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xb23a5a,
        emissive: 0x6d1730,
        emissiveIntensity: 2.4,
        roughness: 0.1,
        metalness: 0.08,
        transparent: true,
        opacity: 0.38,
        transmission: 0.35,
        thickness: 0.32,
        depthWrite: false,
    });
    const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(0.67, 5), shellMaterial);
    root.add(shell);

    const lattice = new THREE.LineSegments(
        new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(0.73, 2)),
        new THREE.LineBasicMaterial({
            color: 0xe07090,
            transparent: true,
            opacity: 0.38,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        }),
    );
    root.add(lattice);

    const innerMaterial = glowMaterial(0xffe0e8, 1);
    const inner = new THREE.Mesh(new THREE.OctahedronGeometry(0.25, 2), innerMaterial);
    root.add(inner);

    const iris = new THREE.Mesh(new THREE.RingGeometry(0.105, 0.18, 48), glowMaterial(0xffd0d8, 0.96));
    iris.position.z = 0.69;
    root.add(iris);

    const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.058, 32), glowMaterial(0x6d1730, 1));
    pupil.position.z = 0.705;
    root.add(pupil);

    const rings = [
        createRing(1.0, 0.014, 0xb23a5a, [0.52, 0.12, 0.18]),
        createRing(1.25, 0.009, 0x8a1f3f, [1.16, -0.32, 0.35]),
        createSegmentedRing(1.47, 0xe05070),
    ];
    rings.forEach((ring) => root.add(ring));

    const signals = createSignals();
    root.add(signals);
    normalizeSize(root, 3.65);

    return { root, aura, shell, lattice, inner, iris, pupil, rings, signals, glowTexture };
}

export class AvatarScene {
    constructor(mount) {
        this.mount = mount;
        this.mode = "idle";
        this.pointer = new THREE.Vector2();
        this.time = 0;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(37, 1, 0.1, 30);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.1;
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.domElement.className = "tika-canvas";
        mount.append(this.renderer.domElement);

        const ambient = new THREE.AmbientLight(0xffd0d8, 1.6);
        const rose = new THREE.PointLight(0xb23a5a, 22, 8);
        rose.position.set(-1.6, 1.5, 2.4);
        const crimson = new THREE.PointLight(0x8a1f3f, 18, 8);
        crimson.position.set(1.8, -1.2, 1.8);
        this.scene.add(ambient, rose, crimson);

        this.core = buildCore();
        this.scene.add(this.core.root);

        this.onPointerMove = (event) => {
            const rect = mount.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            this.pointer.x = THREE.MathUtils.clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
            this.pointer.y = THREE.MathUtils.clamp(-(((event.clientY - rect.top) / rect.height) * 2 - 1), -1, 1);
        };
        mount.addEventListener("pointermove", this.onPointerMove, { passive: true });

        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(mount);
        this.resize();
        this.renderer.setAnimationLoop((timestamp) => this.render(timestamp));
    }

    resize() {
        const rect = this.mount.getBoundingClientRect();
        if (rect.width < 2 || rect.height < 2) return;
        this.renderer.setSize(rect.width, rect.height, false);
        this.camera.aspect = rect.width / rect.height;
        this.camera.updateProjectionMatrix();
        frameObjects(this.camera, [this.core.root], {
            padding: this.camera.aspect < 0.85 ? 1.14 : 1.25,
            direction: new THREE.Vector3(0, 0.03, 1),
        });
    }

    setMode(mode) {
        this.mode = mode;
    }

    render(timestamp) {
        const time = timestamp * 0.001;
        const delta = Math.min(0.05, Math.max(0, time - this.time));
        this.time = time;
        const { root, aura, shell, lattice, inner, iris, pupil, rings, signals } = this.core;
        const speaking = this.mode === "speaking";
        const thinking = this.mode === "thinking";
        const bright = this.mode === "bright";

        root.position.y = Math.sin(time * 0.92) * 0.055;
        root.rotation.y = THREE.MathUtils.lerp(root.rotation.y, this.pointer.x * 0.16, 1 - Math.exp(-delta * 2.8));
        root.rotation.x = THREE.MathUtils.lerp(root.rotation.x, -this.pointer.y * 0.1, 1 - Math.exp(-delta * 2.8));

        const voicePulse = speaking ? 0.5 + Math.abs(Math.sin(time * 9.8)) * 0.5 : 0;
        const idlePulse = 0.5 + Math.sin(time * 1.35) * 0.5;
        const pulse = voicePulse || idlePulse * 0.18;
        shell.scale.setScalar(1 + pulse * (speaking ? 0.075 : 0.018));
        shell.material.emissiveIntensity = 1.8 + pulse * (speaking ? 2.7 : 0.8);
        inner.scale.setScalar(0.9 + pulse * (speaking ? 0.75 : 0.25));
        inner.rotation.y += delta * (speaking ? 2.8 : 0.8);
        inner.rotation.x -= delta * 0.55;
        lattice.rotation.y -= delta * (thinking ? 1.1 : 0.28);
        lattice.rotation.x += delta * 0.16;
        aura.material.opacity = 0.52 + pulse * (speaking ? 0.42 : 0.16);
        aura.scale.setScalar(3.15 + pulse * (speaking ? 0.55 : 0.2));
        iris.scale.setScalar(1 + voicePulse * 0.38);
        pupil.scale.setScalar(speaking ? 0.72 + voicePulse * 0.2 : 1);

        rings[0].rotation.z += delta * (speaking ? 1.45 : 0.26);
        rings[1].rotation.z -= delta * (speaking ? 1.1 : 0.19);
        rings[2].rotation.z += delta * (thinking ? 1.4 : speaking ? 0.72 : 0.11);
        rings.forEach((ring, index) => {
            const offset = Math.sin(time * (1.25 + index * 0.2) + index) * (speaking ? 0.045 : 0.012);
            ring.scale.setScalar(1 + offset + (bright ? 0.025 : 0));
        });
        signals.rotation.y -= delta * (thinking ? 0.62 : 0.16);
        signals.rotation.z += delta * 0.06;
        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        this.renderer.setAnimationLoop(null);
        this.resizeObserver.disconnect();
        this.mount.removeEventListener("pointermove", this.onPointerMove);
        this.scene.traverse((object) => {
            object.geometry?.dispose();
            if (object.material) {
                const materials = Array.isArray(object.material) ? object.material : [object.material];
                materials.forEach((entry) => entry.dispose());
            }
        });
        this.core.glowTexture.dispose();
        this.renderer.dispose();
        this.renderer.domElement.remove();
    }
}
