// scene3d — a small, code-callable kit for assembling Three.js game scenes.
// Build blocks plus the parts that are hard to get right without seeing the
// result: deterministic spatial checks (bounding boxes for scale and clipping),
// size normalization to real targets, and camera framing. Every function
// returns or mutates ordinary THREE objects; nothing hides the scene graph.
// Spatial helpers use world-space bounding boxes, so call them after adding the
// object to the scene (or to an untransformed group).

import * as THREE from "three";

// --- Primitives: thin factories with sane MeshStandardMaterial defaults ------
const DEFAULT_COLOR = 0xb0b4bd;

function standardMaterial(opts = {}) {
    return new THREE.MeshStandardMaterial({
        color: opts.color ?? DEFAULT_COLOR,
        roughness: opts.roughness ?? 0.75,
        metalness: opts.metalness ?? 0.05,
        flatShading: opts.flatShading ?? false,
    });
}

export function box({ width = 1, height = 1, depth = 1, ...mat } = {}) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), standardMaterial(mat));
    mesh.castShadow = mesh.receiveShadow = true;
    return mesh;
}

export function sphere({ radius = 0.5, segments = 24, ...mat } = {}) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, segments), standardMaterial(mat));
    mesh.castShadow = mesh.receiveShadow = true;
    return mesh;
}

export function cylinder({ radiusTop = 0.5, radiusBottom = 0.5, height = 1, segments = 24, ...mat } = {}) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), standardMaterial(mat));
    mesh.castShadow = mesh.receiveShadow = true;
    return mesh;
}

export function cone({ radius = 0.5, height = 1, segments = 24, ...mat } = {}) {
    const mesh = new THREE.Mesh(new THREE.ConeGeometry(radius, height, segments), standardMaterial(mat));
    mesh.castShadow = mesh.receiveShadow = true;
    return mesh;
}

// A horizontal floor plane centered at the origin, top facing up at y=0.
export function ground({ size = 50, color = 0x5b6b4a, ...mat } = {}) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), standardMaterial({ color, roughness: 0.95, ...mat }));
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    return mesh;
}

// --- Bounding boxes: the deterministic spatial backbone ----------------------
export function boundingBox(object) {
    return new THREE.Box3().setFromObject(object);
}

export function size(object) {
    return boundingBox(object).getSize(new THREE.Vector3());
}

export function center(object) {
    return boundingBox(object).getCenter(new THREE.Vector3());
}

// Do two objects' boxes overlap? A small shrink ignores objects that merely
// touch (a crate resting on the ground is not "clipping").
export function overlaps(a, b, tolerance = 1e-3) {
    const boxA = boundingBox(a).expandByScalar(-tolerance);
    const boxB = boundingBox(b).expandByScalar(-tolerance);
    return boxA.intersectsBox(boxB);
}

// Deterministic clip check: every pair of objects spawned inside each other.
// The cheap, no-render way to catch the classic failure before a screenshot.
export function findClipping(objects, tolerance = 1e-3) {
    const hits = [];
    for (let i = 0; i < objects.length; i++) {
        for (let j = i + 1; j < objects.length; j++) {
            if (overlaps(objects[i], objects[j], tolerance)) hits.push([objects[i], objects[j]]);
        }
    }
    return hits;
}

// --- Placement: position by real extent, not guessed offsets -----------------
export function placeOnGround(object, groundY = 0) {
    object.position.y += groundY - boundingBox(object).min.y;
    return object;
}

export function placeOn(object, target) {
    object.position.y += boundingBox(target).max.y - boundingBox(object).min.y;
    return object;
}

export function centerAt(object, x = 0, z = 0) {
    const c = center(object);
    object.position.x += x - c.x;
    object.position.z += z - c.z;
    return object;
}

// Lay objects along the x axis with a gap between their boxes, centered.
export function row(objects, { gap = 0.5, z = 0 } = {}) {
    const widths = objects.map((o) => size(o).x);
    const total = widths.reduce((a, b) => a + b, 0) + gap * (objects.length - 1);
    let cursor = -total / 2;
    objects.forEach((object, i) => {
        centerAt(object, cursor + widths[i] / 2, z);
        cursor += widths[i] + gap;
    });
    return objects;
}

// --- Scale normalization: always size to a real target, never eyeball --------
export function normalizeSize(object, targetMaxDimension) {
    const max = Math.max(...size(object).toArray());
    if (max > 0) object.scale.multiplyScalar(targetMaxDimension / max);
    return object;
}

export function setHeight(object, targetHeight) {
    const h = size(object).y;
    if (h > 0) object.scale.multiplyScalar(targetHeight / h);
    return object;
}

// --- Camera framing: fixes "the camera is pointed at nothing" ----------------
// Positions a PerspectiveCamera so the objects fill the frame, accounting for
// aspect (works in portrait/mobile), aimed at the combined center.
export function frameObjects(camera, objects, { padding = 1.25, direction } = {}) {
    const objectList = Array.isArray(objects) ? objects : [objects];
    const boxUnion = new THREE.Box3();
    for (const object of objectList) boxUnion.union(boundingBox(object));
    const c = boxUnion.getCenter(new THREE.Vector3());
    const s = boxUnion.getSize(new THREE.Vector3());

    const fov = (camera.fov * Math.PI) / 180;
    const aspect = camera.aspect || 1;
    const fitHeight = s.y / 2 / Math.tan(fov / 2);
    const fitWidth = s.x / 2 / Math.tan(fov / 2) / aspect;
    const distance = Math.max(fitHeight, fitWidth, s.z) * padding;

    const dir = (direction ? direction.clone() : new THREE.Vector3(0, 0.45, 1)).normalize();
    camera.position.copy(c).addScaledVector(dir, distance + s.length() / 2);
    camera.lookAt(c);
    camera.near = Math.max(0.01, distance / 100);
    camera.far = distance * 10 + s.length();
    camera.updateProjectionMatrix();
    return camera;
}

// --- Lighting: a sane default rig so scenes aren't flat or black --------------
export function addDefaultLights(scene, { intensity = 1, sky = 0xcfe3ff, groundColor = 0x444439 } = {}) {
    const hemi = new THREE.HemisphereLight(sky, groundColor, 0.7 * intensity);
    const key = new THREE.DirectionalLight(0xffffff, 1.1 * intensity);
    key.position.set(5, 9, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 60;
    scene.add(hemi, key);
    return { hemi, key };
}
