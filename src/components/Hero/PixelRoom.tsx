"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * 3D isometric pixel-art workspace.
 *
 * The entire diorama is built from unit cubes rendered through a SINGLE
 * InstancedMesh with per-instance colors (never one Mesh per cube). The CRT
 * monitor shows a live terminal via a CanvasTexture updated each frame. The
 * camera slowly orbits the Y axis and performs a cinematic zoom-in on load.
 */

type Voxel = { x: number; y: number; z: number; color: string };

function buildVoxels(): Voxel[] {
  const v: Voxel[] = [];
  const box = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    color: string
  ) => {
    for (let i = 0; i < w; i++)
      for (let j = 0; j < h; j++)
        for (let k = 0; k < d; k++)
          v.push({ x: x + i, y: y + j, z: z + k, color });
  };

  const C = {
    deskTop: "#3a3550",
    deskTop2: "#332f47",
    leg: "#221f33",
    monitor: "#0e0e16",
    bezel: "#1b1b29",
    keyboard: "#2a2a3f",
    key: "#3c3c58",
    floppyA: "#16161f",
    floppyB: "#1d1d2a",
    labelG: "#2fae28",
    labelA: "#caa000",
    labelR: "#b53030",
    mug: "#214a3a",
    mugRim: "#2fae28",
    shelf: "#2a2436",
    bookG: "#2e9e2a",
    bookA: "#c79a00",
    bookR: "#a83232",
    bookB: "#3a6ea5",
    lamp: "#26233a",
    lampHead: "#ffb000",
    mat: "#101019",
  };

  // ---- desk top (checker for subtle pixel texture) ----
  for (let i = 0; i < 16; i++)
    for (let k = 0; k < 11; k++)
      v.push({
        x: i,
        y: 4,
        z: k,
        color: (i + k) % 2 === 0 ? C.deskTop : C.deskTop2,
      });

  // ---- legs ----
  box(0, 0, 0, 1, 4, 1, C.leg);
  box(15, 0, 0, 1, 4, 1, C.leg);
  box(0, 0, 10, 1, 4, 1, C.leg);
  box(15, 0, 10, 1, 4, 1, C.leg);

  // ---- desk mat under keyboard ----
  box(4, 5, 6, 8, 1, 3, C.mat);

  // ---- CRT monitor (back-center), sits on desk ----
  box(5, 5, 1, 6, 6, 4, C.monitor); // body
  box(5, 5, 5, 6, 6, 1, C.bezel); // front bezel (screen recess sits just in front)
  box(6, 4, 2, 4, 1, 3, C.bezel); // little foot/stand base
  box(7, 5, 2, 2, 1, 2, C.bezel); // neck

  // ---- keyboard ----
  box(5, 5, 7, 6, 1, 2, C.keyboard);
  for (let i = 0; i < 6; i++)
    for (let k = 0; k < 2; k++)
      if ((i + k) % 2 === 0) v.push({ x: 5 + i, y: 6, z: 7 + k, color: C.key });

  // ---- stacked floppy disks (right) ----
  box(12, 5, 1, 3, 1, 3, C.floppyA);
  box(12, 5, 1, 3, 1, 1, C.labelG); // green label edge
  box(12, 6, 1, 3, 1, 3, C.floppyB);
  box(12, 6, 1, 3, 1, 1, C.labelA);
  box(12, 7, 1, 3, 1, 3, C.floppyA);
  box(12, 7, 1, 3, 1, 1, C.labelR);

  // ---- coffee mug (left-front) ----
  box(2, 5, 7, 2, 2, 2, C.mug);
  box(2, 7, 7, 2, 1, 2, C.mugRim);
  v.push({ x: 4, y: 6, z: 8, color: C.mug }); // handle

  // ---- mini bookshelf (left-back) ----
  box(1, 5, 1, 1, 4, 4, C.shelf);
  v.push({ x: 2, y: 6, z: 1, color: C.bookG });
  v.push({ x: 2, y: 6, z: 2, color: C.bookA });
  v.push({ x: 2, y: 6, z: 3, color: C.bookR });
  v.push({ x: 2, y: 7, z: 1, color: C.bookB });
  v.push({ x: 2, y: 7, z: 2, color: C.bookG });
  v.push({ x: 2, y: 7, z: 3, color: C.bookA });

  // ---- desk lamp (right-back) ----
  box(14, 5, 8, 1, 1, 1, C.lamp); // base
  box(14, 6, 8, 1, 3, 1, C.lamp); // post
  box(12, 9, 8, 3, 1, 1, C.lamp); // arm
  box(11, 8, 8, 1, 1, 1, C.lampHead); // head

  return v;
}

export default function PixelRoom() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const width = mount.clientWidth;
    const height = mount.clientHeight || 460;

    // ---- renderer ----
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.domElement.style.imageRendering = "pixelated";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a0f, 28, 64);

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 200);

    // ---- voxel diorama via a single InstancedMesh ----
    const voxels = buildVoxels();
    const geo = new THREE.BoxGeometry(0.96, 0.96, 0.96);
    const mat = new THREE.MeshStandardMaterial({
      roughness: 0.9,
      metalness: 0.05,
      flatShading: true,
    });
    const mesh = new THREE.InstancedMesh(geo, mat, voxels.length);

    // center the model on the origin
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (const p of voxels) {
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
      minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z);
    }
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const cz = (minZ + maxZ) / 2;

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    voxels.forEach((p, i) => {
      dummy.position.set(p.x - cx, p.y - cy, p.z - cz);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      color.set(p.color);
      mesh.setColorAt(i, color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    const world = new THREE.Group();
    world.add(mesh);
    scene.add(world);

    // ---- live CRT screen (canvas texture) ----
    const sc = document.createElement("canvas");
    sc.width = 96;
    sc.height = 80;
    const sctx = sc.getContext("2d")!;
    const screenTex = new THREE.CanvasTexture(sc);
    screenTex.magFilter = THREE.NearestFilter;
    screenTex.minFilter = THREE.NearestFilter;
    const screenMat = new THREE.MeshBasicMaterial({
      map: screenTex,
      toneMapped: false,
    });
    // screen sits just in front of the bezel (z front face ~ 5.5 in model space)
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 4.4), screenMat);
    screen.position.set(8 - cx, 7.5 - cy, 5.55 - cz);
    world.add(screen);

    const drawScreen = (cursorOn: boolean) => {
      sctx.fillStyle = "#06140a";
      sctx.fillRect(0, 0, sc.width, sc.height);
      sctx.fillStyle = "#39ff14";
      sctx.font = "9px monospace";
      sctx.fillText(">RUN", 6, 16);
      sctx.fillText("ANESS", 6, 30);
      sctx.fillRect(6, 38, 70, 2);
      sctx.fillRect(6, 50, 48, 2);
      sctx.fillRect(6, 62, 60, 2);
      if (cursorOn) sctx.fillRect(60, 56, 9, 9);
      screenTex.needsUpdate = true;
    };
    drawScreen(true);

    // ---- lights ----
    scene.add(new THREE.AmbientLight(0x4a4a66, 1.1));
    const key = new THREE.DirectionalLight(0xbfe9ff, 1.2);
    key.position.set(8, 16, 12);
    scene.add(key);
    const greenGlow = new THREE.PointLight(0x39ff14, 0.9, 22);
    greenGlow.position.set(8 - cx, 8 - cy, 7 - cz);
    scene.add(greenGlow);
    const lampGlow = new THREE.PointLight(0xffb000, 1.0, 18);
    lampGlow.position.set(11 - cx, 8 - cy, 8 - cz);
    scene.add(lampGlow);

    // ---- visible lamp light cone ----
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xffb000,
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const cone = new THREE.Mesh(new THREE.ConeGeometry(3, 5, 12, 1, true), coneMat);
    cone.position.set(10 - cx, 5.5 - cy, 7 - cz);
    cone.rotation.z = Math.PI * 0.12;
    world.add(cone);

    // ---- camera orbit + cinematic zoom ----
    const restRadius = 26;
    const startRadius = restRadius * 2.6;
    const camY = 15;
    let angle = -0.6;
    let zoomStart: number | null = reduceMotion ? -1 : null; // -1 => skip zoom

    const beginZoom = () => {
      if (zoomStart === null) zoomStart = performance.now();
    };
    // start the zoom when the boot terminal finishes; fall back after 2.4s
    window.addEventListener("boot:complete", beginZoom, { once: true });
    const fallback = window.setTimeout(beginZoom, 2400);

    const clock = new THREE.Clock();
    let raf = 0;
    const place = (radius: number) => {
      camera.position.set(
        Math.cos(angle) * radius,
        camY,
        Math.sin(angle) * radius
      );
      camera.lookAt(0, -1, 0);
    };
    place(reduceMotion ? restRadius : startRadius);

    let cursorTimer = 0;
    let cursorOn = true;

    const animate = () => {
      const dt = clock.getDelta();

      if (!reduceMotion) {
        angle += 0.002 * (dt * 60); // ~0.002 rad/frame at 60fps
      }

      let radius = restRadius;
      if (zoomStart === -1) {
        radius = restRadius;
      } else if (zoomStart === null) {
        radius = startRadius; // waiting for boot
      } else {
        const t = Math.min((performance.now() - zoomStart) / 1500, 1);
        const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
        radius = startRadius + (restRadius - startRadius) * ease;
      }
      place(radius);

      // blink the terminal cursor ~ every 0.5s
      cursorTimer += dt;
      if (cursorTimer > 0.5) {
        cursorTimer = 0;
        cursorOn = !cursorOn;
        drawScreen(cursorOn);
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    // ---- resize ----
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight || 460;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // ---- cleanup ----
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(fallback);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("boot:complete", beginZoom);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      screenMat.dispose();
      screenTex.dispose();
      coneMat.dispose();
      cone.geometry.dispose();
      screen.geometry.dispose();
      if (renderer.domElement.parentNode === mount)
        mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{ width: "100%", height: "100%", minHeight: 460 }}
    />
  );
}
