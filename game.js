
import * as THREE from
  "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const loading = document.getElementById("loading");
const errorBox = document.getElementById("error");
const statusText = document.getElementById("status");

try {
  startGame();
} catch (error) {
  showError(error);
}

function showError(error) {
  console.error(error);
  errorBox.style.display = "block";
  errorBox.textContent =
    "Game error: " + error.message +
    ". Please reload the page.";
  loading.style.display = "none";
}

function startGame() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.Fog(0x87ceeb, 90, 260);

  const camera = new THREE.PerspectiveCamera(
    65, window.innerWidth / window.innerHeight,
    0.1, 500
  );

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
  });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 1.5)
  );
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  document.body.appendChild(renderer.domElement);

  // LIGHTING
  scene.add(new THREE.HemisphereLight(
    0xe4f4ff, 0x53613a, 2
  ));

  const sun = new THREE.DirectionalLight(0xfff1d4, 2.5);
  sun.position.set(-35, 65, 25);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -65;
  sun.shadow.camera.right = 65;
  sun.shadow.camera.top = 65;
  sun.shadow.camera.bottom = -65;
  scene.add(sun);

  // MATERIAL HELPER
  function material(color, extra = {}) {
    return new THREE.MeshStandardMaterial({
      color, roughness: 0.88, ...extra
    });
  }

  const grassMat = material(0x568747);
  const roadMat = material(0x777b7d);
  const whiteMat = material(0xf0e9db);
  const redMat = material(0xb83f3b);
  const glassMat = material(0x397c9b, {
    metalness: 0.25, roughness: 0.3
  });
  const darkMat = material(0x34383b);
  const leafMat = material(0x347442);
  const trunkMat = material(0x725037);

  // BOX BUILDER
  function box(w, h, d, x, y, z, mat, parent = scene) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d), mat
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  // CAMPUS GROUND
  box(240, 1, 240, 0, -0.5, 0, grassMat);

  // MAIN ROAD
  box(15, 0.12, 120, 0, 0.06, 22, roadMat);

  // FRONT WALKWAY
  box(25, 0.14, 24, 0, 0.08, 8,
      material(0xb8b5ac));

  // BUILDING PLATFORM
  box(52, 0.8, 22, 0, 0.4, -13,
      material(0xb7b2a8));

  // MAIN BUILDING: four-storey approximation
  const building = new THREE.Group();
  scene.add(building);

  const width = 46;
  const depth = 16;
  const floorHeight = 3.5;
  const floors = 4;
  const buildingHeight = floors * floorHeight;

  
  // BUILDING SHELL: walls with a real entrance gap
  const wallH = buildingHeight;
  const wallY = wallH / 2 + 0.8;

  // Back wall
  box(width, wallH, 0.45,
      0, wallY, -20.8, whiteMat, building);

  // Left and right side walls
  box(0.45, wallH, depth,
      -23, wallY, -13, whiteMat, building);

  box(0.45, wallH, depth,
      23, wallY, -13, whiteMat, building);

  // Front wall: leave central doorway open
  // Door opening is approximately 7 units wide
  box(19.5, wallH, 0.45,
      -13.25, wallY, -5, whiteMat, building);

  box(19.5, wallH, 0.45,
      13.25, wallY, -5, whiteMat, building);

  // Front wall above the doorway
  box(7, 9.2, 0.45,
      0, 10.6, -5, whiteMat, building);


  // Red architectural columns
  for (let x = -width / 2; x <= width / 2; x += 11.5) {
    box(0.9, buildingHeight + 0.5, 0.9,
        x, buildingHeight / 2 + 0.8, -4.7,
        redMat, building);
  }

  // Red floor bands
  for (let f = 0; f <= floors; f++) {
    box(width + 0.8, 0.28, depth + 0.5,
        0, 0.8 + f * floorHeight, -13,
        redMat, building);
  }

  // Windows on the front of every floor
  for (let f = 0; f < floors; f++) {
    const y = 0.8 + f * floorHeight + 1.8;

    for (let x = -20; x <= 20; x += 3.2) {
      box(2.35, 1.8, 0.16,
          x, y, -4.78, glassMat, building);
    }
  }

  // CENTRAL ENTRANCE
  
  // ===== ABSSIT BUILDING DETAIL UPGRADE =====

  const frameMat = material(0xe6e1d6);
  const balconyMat = material(0xc8c4bc);
  const railingMat = material(0x414b50);
  const trimMat = material(0x8f2928);

  // WINDOW FRAMES
  for (let f = 0; f < floors; f++) {
    const y = 0.8 + f * floorHeight + 1.8;

    for (let x = -20; x <= 20; x += 3.2) {
      // Left and right frame
      box(0.12, 2.05, 0.22,
          x - 1.25, y, -4.83,
          frameMat, building);

      box(0.12, 2.05, 0.22,
          x + 1.25, y, -4.83,
          frameMat, building);

      // Top and bottom frame
      box(2.6, 0.12, 0.22,
          x, y + 1.0, -4.83,
          frameMat, building);

      box(2.6, 0.12, 0.22,
          x, y - 1.0, -4.83,
          frameMat, building);

      // Vertical window divider
      box(0.07, 1.8, 0.24,
          x, y, -4.87,
          railingMat, building);
    }
  }

  // FLOOR LEDGES / BALCONY EDGES
  for (let f = 1; f < floors; f++) {
    const y = 0.8 + f * floorHeight;

    // Projecting concrete ledge
    box(width + 1.5, 0.22, 1.0,
        0, y, -4.85,
        balconyMat, building);

    // Slim dark railing
    box(width - 1, 0.08, 0.08,
        0, y + 0.9, -5.3,
        railingMat, building);

    // Railing supports
    for (let x = -21; x <= 21; x += 3) {
      box(0.07, 0.9, 0.07,
          x, y + 0.45, -5.3,
          railingMat, building);
    }
  }

  // ENTRANCE CANOPY
  box(12, 0.38, 4.0,
      0, 5.9, -6.1,
      balconyMat, building);

  // Canopy supports
  for (const x of [-5, 5]) {
    box(0.3, 2.8, 0.3,
        x, 2.6, -7.6,
        frameMat, building);
  }

  // Entrance side pillars
  for (const x of [-5.2, 5.2]) {
    box(0.45, 5.2, 0.5,
        x, 3.4, -4.2,
        redMat, building);
  }

  // Roof parapet
  box(width + 1, 0.65, 0.65,
      0, buildingHeight + 1.15, -5.0,
      trimMat, building);

  box(0.65, 0.65, depth + 0.5,
      -width / 2, buildingHeight + 1.15, -13,
      trimMat, building);

  box(0.65, 0.65, depth + 0.5,
      width / 2, buildingHeight + 1.15, -13,
      trimMat, building);

  // ===== CAMPUS LANDSCAPING =====

  const pathMat = material(0xc9c5b9);
  const borderMat = material(0xd6d0c2);
  const flowerColors = [
    0xffd166, 0xf28c9b, 0xf7f4e8
  ];

  // Wider entrance path
  box(21, 0.1, 32,
      0, 0.04, 11,
      pathMat);

  // Red-and-white curb blocks
  for (let i = 0; i < 16; i++) {
    const curbColor =
      i % 2 === 0 ? redMat : whiteMat;

    for (const side of [-1, 1]) {
      box(0.38, 0.22, 1.8,
          side * 10.7, 0.13, -2 + i * 1.8,
          curbColor);
    }
  }

  // Garden beds near the entrance
  for (const side of [-1, 1]) {
    box(5.5, 0.18, 12,
        side * 16, 0.09, 3,
        material(0x425f35));

    for (let i = 0; i < 8; i++) {
      const x = side * (14 + (i % 3) * 1.5);
      const z = -1 + i * 1.5;

      // Small decorative plants
      const plant = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 7, 6),
        leafMat
      );
      plant.position.set(x, 0.45, z);
      plant.scale.y = 0.8;
      plant.castShadow = true;
      scene.add(plant);

      // Small flowers
      const flower = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 6, 5),
        material(flowerColors[i % flowerColors.length])
      );
      flower.position.set(x, 0.72, z);
      scene.add(flower);
    }
  }

  // Small entrance lights
  const lampMat = material(0xffe2a1, {
    emissive: 0xffb347,
    emissiveIntensity: 0.45
  });

  for (const x of [-7, 7]) {
    box(0.16, 2.2, 0.16,
        x, 1.1, 1,
        darkMat);

    box(0.48, 0.35, 0.48,
        x, 2.25, 1,
        lampMat);
  }

  // ===== END BUILDING UPGRADE =====

  // GLASS DOOR: visual panel only
const doorGroup = new THREE.Group();
scene.add(doorGroup);

const doorGlass = new THREE.Mesh(
  new THREE.BoxGeometry(3.2, 3.7, 0.12),
  glassMat
);

doorGlass.position.set(0, 2.65, -4.72);
doorGroup.add(doorGlass);

for (const x of [-1.7, 1.7]) {
  box(0.12, 3.8, 0.2,
      x, 2.7, -4.72, frameMat, doorGroup);
}

box(3.5, 0.12, 0.2,
    0, 4.6, -4.72, frameMat, doorGroup);

  // ABSSIT SIGN
  box(14, 2.3, 0.45, 0, 14.2, -4.1,
      redMat, building);

  // Text on a canvas texture
  function signTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 180;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#b83f3b";
    ctx.fillRect(0, 0, 1024, 180);
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = "bold 62px Arial";
    ctx.fillText("ABSS INSTITUTE OF TECHNOLOGY", 512, 78);
    ctx.font = "bold 46px Arial";
    ctx.fillText("MEERUT", 512, 140);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(13.5, 2.1),
    new THREE.MeshBasicMaterial({ map: signTexture() })
  );
  sign.position.set(0, 14.2, -3.82);
  building.add(sign);

  // HOSTELS: placeholder buildings for phase 1
  function makeHostel(x, z, color, name) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    scene.add(group);

    box(20, 14, 13, 0, 7, 0,
        material(color), group);

    for (let f = 0; f < 4; f++) {
      for (let wx = -7; wx <= 7; wx += 4.5) {
        box(2.2, 1.8, 0.18, wx,
            2.2 + f * 3.3, 6.6,
            glassMat, group);
      }
    }

    box(20.5, 0.35, 13.5, 0, 14.1, 0,
        darkMat, group);

    return { group, name };
  }

  makeHostel(-42, -17, 0xc7c8c7, "CSA Boys Hostel");
  makeHostel(42, -17, 0xe4d5c3, "Girls Hostel");

  // TREES
  function makeTree(x, z, scale = 1) {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);
    tree.scale.setScalar(scale);
    scene.add(tree);

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.45, 3.4, 7),
      trunkMat
    );
    trunk.position.y = 1.7;
    trunk.castShadow = true;
    tree.add(trunk);

    const crown = new THREE.Mesh(
      new THREE.SphereGeometry(1.9, 9, 7),
      leafMat
    );
    crown.position.y = 4;
    crown.castShadow = true;
    tree.add(crown);

    return tree;
  }

  for (let i = -5; i <= 5; i++) {
    makeTree(i * 8, 30 + (i % 2) * 5,
             0.8 + (Math.abs(i) % 3) * 0.12);
    makeTree(i * 10, -39, 0.9);
  }

  makeTree(-25, 6, 1.2);
  makeTree(25, 6, 1.1);
  makeTree(-55, 25, 1.3);
  makeTree(55, 25, 1.3);

  // PLAYER: simple placeholder character
  const player = new THREE.Group();
  scene.add(player);
  player.position.set(0, 0, 23);

  const shirtMat = material(0xf3f1e9);
  const pantsMat = material(0x202630);
  const skinMat = material(0xc78f68);
  const redTrim = material(0xb83f3b);

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 1.25, 0.48),
    shirtMat
  );
  body.position.y = 1.65;
  body.castShadow = true;
  player.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 12, 10),
    skinMat
  );
  head.position.y = 2.55;
  head.castShadow = true;
  player.add(head);

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.325, 12, 8,
      0, Math.PI * 2, 0, Math.PI / 2),
    darkMat
  );
  hair.position.y = 2.66;
  player.add(hair);

  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.9, 0.4),
      pantsMat
    );
    leg.position.set(side * 0.25, 0.55, 0);
    leg.castShadow = true;
    player.add(leg);

    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(0.27, 0.9, 0.3),
      shirtMat
    );
    arm.position.set(side * 0.62, 1.65, 0);
    player.add(arm);
  }

  // ABSSIT mark on back of shirt
  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 512;
  labelCanvas.height = 128;
  const labelCtx = labelCanvas.getContext("2d");
  labelCtx.fillStyle = "#b83f3b";
  labelCtx.font = "bold 86px Arial";
  labelCtx.textAlign = "center";
  labelCtx.fillText("ABSSIT", 256, 94);

  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.75, 0.19),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(labelCanvas),
      transparent: true,
      side: THREE.DoubleSide
    })
  );
  label.position.set(0, 1.8, 0.247);
  label.rotation.y = Math.PI;
  player.add(label);

  // CAMERA AND MOVEMENT
  
  // ===== SOLID BUILDING COLLISION =====
  // Coordinates must match the building shell.

  const solidWalls = [
    // Left and right walls
    { minX: -23.5, maxX: -22.5, minZ: -21, maxZ: -5 },
    { minX:  22.5, maxX:  23.5, minZ: -21, maxZ: -5 },

    // Back wall
    { minX: -23, maxX: 23, minZ: -21.1, maxZ: -20.5 },

    // Front wall: leave only the central door opening
    { minX: -23, maxX: -3.5, minZ: -5.3, maxZ: -4.7 },
    { minX:   3.5, maxX: 23, minZ: -5.3, maxZ: -4.7 }
  ];

  const playerRadius = 0.6;

  function hitsWall(x, z) {
    return solidWalls.some(w =>
      x + playerRadius > w.minX &&
      x - playerRadius < w.maxX &&
      z + playerRadius > w.minZ &&
      z - playerRadius < w.maxZ
    );
  }

  const keys = {};
  let yaw = 0;
  let pitch = 0.18;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  function setKey(name, pressed) {
    keys[name] = pressed;
  }

  window.addEventListener("keydown", event => {
    const key = event.key.toLowerCase();

    if ([
      "w", "a", "s", "d",
      "arrowup", "arrowdown",
      "arrowleft", "arrowright"
    ].includes(key)) {
      event.preventDefault();
      setKey(key, true);
    }
  });

  window.addEventListener("keyup", event => {
    setKey(event.key.toLowerCase(), false);
  });

  document.querySelectorAll("[data-move]").forEach(button => {
    const direction = button.dataset.move;

    const keyMap = {
      forward: "w",
      backward: "s",
      left: "a",
      right: "d"
    };

    const press = event => {
      event.preventDefault();
      setKey(keyMap[direction], true);
      button.setPointerCapture?.(event.pointerId);
    };

    const release = event => {
      event.preventDefault();
      setKey(keyMap[direction], false);
    };

    button.addEventListener("pointerdown", press);
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
  });

  // Drag to rotate camera
  renderer.domElement.addEventListener("pointerdown", event => {
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
  });

  window.addEventListener("pointerup", () => {
    dragging = false;
  });

  window.addEventListener("pointermove", event => {
    if (!dragging) return;

    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;

    yaw -= dx * 0.005;
    pitch = THREE.MathUtils.clamp(
      pitch + dy * 0.003, -0.25, 0.8
    );

    lastX = event.clientX;
    lastY = event.clientY;
  });

  document.getElementById("lookBtn")
    .addEventListener("click", () => {
      yaw = 0;
      pitch = 0.18;
    });

  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const move = new THREE.Vector3();
  const cameraTarget = new THREE.Vector3();
  const cameraPosition = new THREE.Vector3();

  let previousTime = performance.now();

  function animate(now) {
    requestAnimationFrame(animate);

    const delta = Math.min((now - previousTime) / 1000, 0.05);
    previousTime = now;

    forward.set(-Math.sin(yaw), 0, -Math.cos(yaw));
    right.set(Math.cos(yaw), 0, -Math.sin(yaw));
    move.set(0, 0, 0);

    if (keys.w || keys.arrowup) move.add(forward);
    if (keys.s || keys.arrowdown) move.sub(forward);
    if (keys.d || keys.arrowright) move.add(right);
    if (keys.a || keys.arrowleft) move.sub(right);

    
if (move.lengthSq() > 0) {
  move.normalize();

  const speed = 8 * delta;

  const nextX = player.position.x + move.x * speed;
  const nextZ = player.position.z + move.z * speed;

  // Check each axis separately so the player
  // can slide along a wall instead of getting stuck.
  if (!hitsWall(nextX, player.position.z)) {
    player.position.x = nextX;
  }

  if (!hitsWall(player.position.x, nextZ)) {
    player.position.z = nextZ;
  }

  player.rotation.y = Math.atan2(move.x, move.z);
}

    // Keep player inside the initial campus area
    player.position.x = THREE.MathUtils.clamp(
      player.position.x, -75, 75
    );
    player.position.z = THREE.MathUtils.clamp(
      player.position.z, -75, 75
    );

    cameraTarget.set(
      player.position.x,
      player.position.y + 1.8,
      player.position.z
    );

    const distance = 7.5;
    const horizontal = distance * Math.cos(pitch);

    cameraPosition.set(
      player.position.x + Math.sin(yaw) * horizontal,
      player.position.y + 3 + Math.sin(pitch) * distance,
      player.position.z + Math.cos(yaw) * horizontal
    );

    camera.position.lerp(cameraPosition, 1 - Math.exp(-7 * delta));
    camera.lookAt(cameraTarget);

    statusText.textContent =
      "Campus Explorer · WASD / Touch Controls";

    renderer.render(scene, camera);
  }

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  loading.style.display = "none";
  requestAnimationFrame(animate);
}
