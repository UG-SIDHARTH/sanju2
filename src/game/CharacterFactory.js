// ==========================================================================
// CHARACTER FACTORY - High-Fidelity Human Mary Jane (MJ) Character Model
// Beautiful feminine anatomy, stylish layered clothing, flowing hair,
// and realistic procedural human bipedal gait & kinematics.
// ==========================================================================

import * as THREE from 'three';

export const MJ_CONFIGS = [
  { id: 1, name: 'MJ-1', hairColor: 0xd94826, hairName: 'Auburn Red', hex: '#d94826', eyeColor: 0x10b981 },
  { id: 2, name: 'MJ-2', hairColor: 0x06b6d4, hairName: 'Neon Cyan', hex: '#06b6d4', eyeColor: 0x38bdf8 },
  { id: 3, name: 'MJ-3', hairColor: 0xf59e0b, hairName: 'Golden Honey', hex: '#f59e0b', eyeColor: 0x059669 },
  { id: 4, name: 'MJ-4', hairColor: 0x10b981, hairName: 'Emerald Wave', hex: '#10b981', eyeColor: 0x8b5cf6 }
];

export class CharacterFactory {
  static createAnimeFaceTexture(config) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;

    // 1. Luminous Anime Porcelain Skin Tone
    const skinGrad = ctx.createRadialGradient(256, 256, 30, 256, 256, 260);
    skinGrad.addColorStop(0, '#fff5f0'); // Radiant anime highlight
    skinGrad.addColorStop(0.65, '#fed7aa'); // Soft anime peach
    skinGrad.addColorStop(1, '#fdba74'); // Warm anime cel contour
    ctx.fillStyle = skinGrad;
    ctx.fillRect(0, 0, 512, 512);

    // 2. Cute Anime Manga Cheek Blush & Sparkle Dashes
    [-1, 1].forEach(side => {
      const cx = 256 + side * 122;
      const cy = 295;
      const blush = ctx.createRadialGradient(cx, cy, 4, cx, cy, 55);
      blush.addColorStop(0, 'rgba(244, 63, 94, 0.45)');
      blush.addColorStop(0.7, 'rgba(251, 113, 133, 0.22)');
      blush.addColorStop(1, 'rgba(251, 113, 133, 0)');
      ctx.fillStyle = blush;
      ctx.beginPath();
      ctx.arc(cx, cy, 55, 0, Math.PI * 2);
      ctx.fill();

      // Anime diagonal cute blush dashes (///)
      ctx.strokeStyle = 'rgba(225, 29, 72, 0.65)';
      ctx.lineWidth = 3.5;
      for (let d = -1; d <= 1; d++) {
        ctx.beginPath();
        ctx.moveTo(cx + d * 14 - 10, cy + 12);
        ctx.lineTo(cx + d * 14 + 10, cy - 12);
        ctx.stroke();
      }
    });

    // 3. Cute Minimalist Anime Nose (Tiny dot)
    ctx.fillStyle = 'rgba(225, 29, 72, 0.45)';
    ctx.beginPath();
    ctx.arc(256, 282, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 4. Cute Stylized Anime Mouth (Sweet smile with anime gloss)
    ctx.save();
    ctx.fillStyle = '#f43f5e';
    ctx.strokeStyle = '#be123c';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(232, 350);
    ctx.quadraticCurveTo(256, 370, 280, 350);
    ctx.quadraticCurveTo(256, 384, 232, 350);
    ctx.fill();
    ctx.stroke();

    // Anime lip gloss specular glint
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.ellipse(256, 360, 10, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 5. Large, Sparkling Expressive Anime Eyes
    [-1, 1].forEach(side => {
      const eyeX = 256 + side * 86;
      const eyeY = 210;

      ctx.save();

      // Eye contour: Large vertical anime oval
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY, 46, 56, side * 0.05, 0, Math.PI * 2);
      ctx.clip();

      // Bright white eye background (Sclera)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(eyeX - 60, eyeY - 70, 120, 140);

      // Soft upper shadow on eye
      const upperShadow = ctx.createLinearGradient(eyeX, eyeY - 56, eyeX, eyeY - 20);
      upperShadow.addColorStop(0, 'rgba(148, 163, 184, 0.55)');
      upperShadow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = upperShadow;
      ctx.fillRect(eyeX - 60, eyeY - 56, 120, 40);

      // Big Sparkling Anime Iris
      const irisRadiusX = 36;
      const irisRadiusY = 46;
      const irisColor = config.eyeColor ? '#' + config.eyeColor.toString(16).padStart(6, '0') : '#06b6d4';

      // Outer limbal ring
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY + 2, irisRadiusX + 2, irisRadiusY + 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Iris vibrant color gradient
      const irisGrad = ctx.createLinearGradient(eyeX, eyeY - irisRadiusY, eyeX, eyeY + irisRadiusY);
      irisGrad.addColorStop(0, '#090d16');
      irisGrad.addColorStop(0.35, irisColor);
      irisGrad.addColorStop(0.85, '#ffffff');
      ctx.fillStyle = irisGrad;
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY + 2, irisRadiusX, irisRadiusY, 0, 0, Math.PI * 2);
      ctx.fill();

      // Large anime pupil
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY - 2, 16, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glowing lower anime light ring
      ctx.fillStyle = irisColor;
      ctx.beginPath();
      ctx.ellipse(eyeX, eyeY + 24, 22, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Signature Anime Highlights (Glints/Sparkles)
      // Primary large highlight (top-left)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(eyeX - 12 * side, eyeY - 18, 12, 16, -0.3 * side, 0, Math.PI * 2);
      ctx.fill();

      // Secondary smaller round highlight (bottom-right)
      ctx.beginPath();
      ctx.arc(eyeX + 14 * side, eyeY + 16, 6, 0, Math.PI * 2);
      ctx.fill();

      // Micro star twinkle
      ctx.beginPath();
      ctx.arc(eyeX - 4 * side, eyeY + 24, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Bold Top Anime Eyelash Line with Winged Flick
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(eyeX - side * 50, eyeY - 14);
      ctx.quadraticCurveTo(eyeX, eyeY - 60, eyeX + side * 54, eyeY - 26);
      ctx.stroke();

      // Anime side wing lash
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(eyeX + side * 44, eyeY - 32);
      ctx.lineTo(eyeX + side * 58, eyeY - 42);
      ctx.stroke();

      // Lower subtle anime lash line
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.beginPath();
      ctx.moveTo(eyeX - side * 28, eyeY + 54);
      ctx.quadraticCurveTo(eyeX, eyeY + 60, eyeX + side * 34, eyeY + 48);
      ctx.stroke();

      // Anime Double-Eyelid Crease
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(eyeX - side * 36, eyeY - 66);
      ctx.quadraticCurveTo(eyeX, eyeY - 76, eyeX + side * 38, eyeY - 50);
      ctx.stroke();

      // Elegant Arched Anime Eyebrows
      ctx.strokeStyle = config.hex || '#d94826';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(eyeX - side * 44, eyeY - 88);
      ctx.quadraticCurveTo(eyeX, eyeY - 108, eyeX + side * 48, eyeY - 84);
      ctx.stroke();
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }

  static createDenimMaterial() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Rich dark indigo base
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, 0, 256, 256);

    // Diagonal twill weave
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.4)';
    ctx.lineWidth = 1.5;
    for (let i = -256; i <= 512; i += 6) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 256, 256);
      ctx.stroke();
    }

    // Subtle stonewash horizontal threads
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.15)';
    ctx.lineWidth = 1;
    for (let y = 0; y <= 256; y += 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }

    // Golden-orange side seam stitching
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(30, 0);
    ctx.lineTo(30, 256);
    ctx.moveTo(38, 0);
    ctx.lineTo(38, 256);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 4);

    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.65,
      metalness: 0.05
    });
  }

  static createLeatherMaterial() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Charcoal biker leather
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 256, 256);

    // Fine pebbled leather grain
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    for (let i = 0; i < 600; i++) {
      const rx = Math.random() * 256;
      const ry = Math.random() * 256;
      ctx.beginPath();
      ctx.arc(rx, ry, Math.random() * 2 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);

    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.36,
      metalness: 0.22
    });
  }

  static createMJ(playerIndex = 0) {
    const config = MJ_CONFIGS[playerIndex % MJ_CONFIGS.length];
    const root = new THREE.Group();
    root.name = `Character_${config.name}`;

    // --- Anime Cel-Shaded Materials & Expressive Anime Face ---
    const faceTex = CharacterFactory.createAnimeFaceTexture(config);
    const headMat = new THREE.MeshStandardMaterial({
      map: faceTex,
      roughness: 0.42,
      metalness: 0.02
    });

    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xfcd5b5,
      roughness: 0.55,
      metalness: 0.05
    });

    const jacketMat = CharacterFactory.createLeatherMaterial();
    const jacketTrimMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.30,
      metalness: 0.25
    });

    const shirtMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.65,
      metalness: 0.0
    });

    const jeansMat = CharacterFactory.createDenimMaterial();

    const sneakerWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.45,
      metalness: 0.05
    });
    const sneakerDarkMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
      metalness: 0.1
    });

    // Lustrous hair material with rich specular gloss
    const hairMat = new THREE.MeshStandardMaterial({
      color: config.hairColor,
      roughness: 0.32,
      metalness: 0.12,
      emissive: config.hairColor,
      emissiveIntensity: 0.14
    });

    // --- 1. PELVIS & HIPS (Contoured Feminine Anatomy) ---
    const pelvis = new THREE.Group();
    pelvis.position.y = 1.05;
    root.add(pelvis);

    // Contoured feminine hips (Smooth Capsule)
    const hipsMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.18, 0.12, 6, 12),
      jeansMat
    );
    hipsMesh.scale.set(1.18, 1.0, 0.90);
    pelvis.add(hipsMesh);

    // Jeans waistband & belt loops
    const waistband = new THREE.Mesh(
      new THREE.CylinderGeometry(0.23, 0.23, 0.04, 14),
      jacketTrimMat
    );
    waistband.position.y = 0.09;
    waistband.scale.set(1.10, 1.0, 0.92);
    pelvis.add(waistband);

    // --- 2. TORSO & CHEST ---
    const torso = new THREE.Group();
    torso.position.y = 0.16;
    pelvis.add(torso);

    // Slender waist (Smooth Capsule)
    const waistMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.16, 0.10, 6, 12),
      shirtMat
    );
    waistMesh.position.y = 0.08;
    waistMesh.scale.set(1.08, 1.0, 0.82);
    torso.add(waistMesh);

    // Feminine jacket chest
    const chestGroup = new THREE.Group();
    chestGroup.position.y = 0.24;
    torso.add(chestGroup);

    // Main jacket body (Smooth Capsule)
    const chestMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.18, 0.14, 6, 12),
      jacketMat
    );
    chestMesh.scale.set(1.14, 1.0, 0.88);
    chestGroup.add(chestMesh);

    // Inner V-neck top
    const innerTop = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.22, 0.12),
      shirtMat
    );
    innerTop.position.set(0, 0.02, 0.12);
    chestGroup.add(innerTop);

    // Open jacket lapels
    [-1, 1].forEach(side => {
      const lapel = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.24, 0.06),
        jacketTrimMat
      );
      lapel.position.set(side * 0.12, 0.02, 0.145);
      lapel.rotation.y = side * 0.2;
      lapel.rotation.z = side * -0.1;
      chestGroup.add(lapel);
    });

    // Jacket collar
    const collar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.16, 0.08, 12),
      jacketTrimMat
    );
    collar.position.set(0, 0.15, -0.02);
    chestGroup.add(collar);

    // --- 3. NECK & HEAD ---
    const neck = new THREE.Group();
    neck.position.y = 0.44;
    torso.add(neck);

    const neckMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.085, 0.14, 10),
      skinMat
    );
    neck.add(neckMesh);

    const head = new THREE.Group();
    head.position.y = 0.14;
    neck.add(head);

    // Sculpted feminine human head (Photorealistic Face Texture)
    const headMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.185, 24, 24),
      headMat
    );
    headMesh.scale.set(0.94, 1.12, 0.98);
    headMesh.rotation.y = Math.PI; // Face forward (+Z towards camera)
    head.add(headMesh);

    // Anatomical soft chin contour
    const chin = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 12, 12),
      skinMat
    );
    chin.position.set(0, -0.14, 0.08);
    chin.scale.set(0.9, 0.8, 0.9);
    head.add(chin);

    // Anatomical delicate ears with silver stud earrings
    [-1, 1].forEach(side => {
      const ear = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 8, 8),
        skinMat
      );
      ear.position.set(side * 0.17, 0, 0);
      ear.scale.set(0.35, 0.9, 0.6);
      head.add(ear);

      // Silver stud earring
      const earring = new THREE.Mesh(
        new THREE.SphereGeometry(0.012, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 })
      );
      earring.position.set(side * 0.18, -0.025, 0.01);
      head.add(earring);
    });

    // --- 4. FLOWING LAYERED HAIR ---
    const hairGroup = new THREE.Group();
    head.add(hairGroup);

    // Volumetric crown
    const hairCrown = new THREE.Mesh(
      new THREE.SphereGeometry(0.21, 14, 14),
      hairMat
    );
    hairCrown.position.set(0, 0.04, -0.04);
    hairCrown.scale.set(1.05, 1.15, 1.15);
    hairGroup.add(hairCrown);

    // Sweeping bangs
    const leftBang = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.02, 0.26, 6),
      hairMat
    );
    leftBang.position.set(-0.09, 0.07, 0.14);
    leftBang.rotation.set(-0.2, 0.2, 0.6);
    hairGroup.add(leftBang);

    const rightBang = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.03, 0.30, 6),
      hairMat
    );
    rightBang.position.set(0.08, 0.05, 0.13);
    rightBang.rotation.set(-0.2, -0.2, -0.5);
    hairGroup.add(rightBang);

    // Front cascading shoulder locks
    [-1, 1].forEach(side => {
      const frontLock = new THREE.Mesh(
        new THREE.CylinderGeometry(0.065, 0.03, 0.44, 8),
        hairMat
      );
      frontLock.position.set(side * 0.16, -0.14, 0.05);
      frontLock.rotation.z = side * 0.12;
      frontLock.rotation.x = 0.1;
      hairGroup.add(frontLock);
    });

    // Flowing back hair
    const backHair = new THREE.Mesh(
      new THREE.CylinderGeometry(0.19, 0.13, 0.55, 10),
      hairMat
    );
    backHair.position.set(0, -0.18, -0.13);
    backHair.rotation.x = -0.1;
    hairGroup.add(backHair);

    // --- 5. ARMS & HANDS ---
    const arms = {};
    [-1, 1].forEach(side => {
      const isLeft = side === -1;
      const prefix = isLeft ? 'left' : 'right';

      const shoulder = new THREE.Group();
      shoulder.position.set(side * 0.25, 0.35, 0);
      torso.add(shoulder);

      // Shoulder cap
      const shoulderCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.075, 8, 8),
        jacketMat
      );
      shoulder.add(shoulderCap);

      const upperArm = new THREE.Group();
      shoulder.add(upperArm);

      // Upper arm jacket sleeve (Smooth Capsule)
      const upperArmMesh = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.052, 0.18, 6, 12),
        jacketMat
      );
      upperArmMesh.position.y = -0.15;
      upperArm.add(upperArmMesh);

      const forearm = new THREE.Group();
      forearm.position.y = -0.30;
      upperArm.add(forearm);

      // Slender skin forearm (Smooth Capsule)
      const forearmMesh = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.042, 0.16, 6, 12),
        skinMat
      );
      forearmMesh.position.y = -0.13;
      forearm.add(forearmMesh);

      // Delicate hand with palm, thumb & fingers
      const handGroup = new THREE.Group();
      handGroup.position.y = -0.28;
      forearm.add(handGroup);

      const palm = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.032, 0.038, 4, 8),
        skinMat
      );
      palm.position.y = -0.03;
      handGroup.add(palm);

      const thumb = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.012, 0.024, 4, 6),
        skinMat
      );
      thumb.position.set(side * 0.022, -0.02, 0.015);
      thumb.rotation.z = side * -0.4;
      handGroup.add(thumb);

      // Subtle fingers
      [-0.016, -0.005, 0.005, 0.016].forEach(fx => {
        const finger = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.008, 0.032, 3, 6),
          skinMat
        );
        finger.position.set(fx, -0.062, 0);
        handGroup.add(finger);
      });

      arms[prefix] = { shoulder, upperArm, forearm, hand: handGroup };
    });

    // --- 6. LEGS & SNEAKERS (Smooth Capsule Anatomy) ---
    const legs = {};
    [-1, 1].forEach(side => {
      const isLeft = side === -1;
      const prefix = isLeft ? 'left' : 'right';

      const hipJoint = new THREE.Group();
      hipJoint.position.set(side * 0.12, -0.06, 0);
      pelvis.add(hipJoint);

      const thigh = new THREE.Group();
      hipJoint.add(thigh);

      // Contoured feminine thigh (Smooth Capsule)
      const thighMesh = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.082, 0.24, 8, 14),
        jeansMat
      );
      thighMesh.position.y = -0.22;
      thigh.add(thighMesh);

      // Feminine kneecap (Patella)
      const kneeCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.036, 8, 8),
        jeansMat
      );
      kneeCap.position.set(0, -0.42, 0.06);
      kneeCap.scale.set(0.9, 1.1, 0.6);
      thigh.add(kneeCap);

      const calf = new THREE.Group();
      calf.position.y = -0.44;
      thigh.add(calf);

      // Tapered slender calf (Smooth Capsule)
      const calfMesh = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.064, 0.24, 8, 14),
        jeansMat
      );
      calfMesh.position.y = -0.22;
      calf.add(calfMesh);

      // Sneaker assembly
      const foot = new THREE.Group();
      foot.position.y = -0.44;
      calf.add(foot);

      // Rubber Sole
      const sole = new THREE.Mesh(
        new THREE.BoxGeometry(0.11, 0.04, 0.25),
        sneakerWhiteMat
      );
      sole.position.set(0, 0.02, 0.04);
      foot.add(sole);

      // Sneaker Upper Body
      const shoeBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.10, 0.08, 0.22),
        sneakerDarkMat
      );
      shoeBody.position.set(0, 0.06, 0.03);
      foot.add(shoeBody);

      // White Toe Cap
      const toeCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 8, 8),
        sneakerWhiteMat
      );
      toeCap.position.set(0, 0.04, 0.12);
      toeCap.scale.set(0.95, 0.65, 0.95);
      foot.add(toeCap);

      legs[prefix] = { hipJoint, thigh, calf, foot };
    });

    // Overhead high-clarity player indicator text badge (e.g. MJ-1, MJ-2, etc.)
    const badgeCanvas = document.createElement('canvas');
    badgeCanvas.width = 256;
    badgeCanvas.height = 80;
    const bCtx = badgeCanvas.getContext('2d');
    bCtx.imageSmoothingEnabled = true;

    // Glowing rounded pill
    bCtx.fillStyle = 'rgba(15, 23, 42, 0.90)';
    bCtx.strokeStyle = config.hex || '#38bdf8';
    bCtx.beginPath();
    if (typeof bCtx.roundRect === 'function') {
      bCtx.roundRect(10, 10, 236, 60, 24);
    } else {
      bCtx.rect(10, 10, 236, 60);
    }
    bCtx.fill();
    bCtx.stroke();

    // Bold, crisp text "MJ-1", "MJ-2", etc.
    bCtx.font = '900 38px "Outfit", sans-serif';
    bCtx.textAlign = 'center';
    bCtx.textBaseline = 'middle';
    bCtx.fillStyle = '#ffffff';
    bCtx.fillText(`MJ-${playerIndex + 1}`, 128, 40);

    const badgeTex = new THREE.CanvasTexture(badgeCanvas);
    const badgeSpriteMat = new THREE.SpriteMaterial({
      map: badgeTex,
      transparent: true,
      depthTest: false
    });
    const badgeSprite = new THREE.Sprite(badgeSpriteMat);
    badgeSprite.scale.set(1.4, 0.44, 1.0);
    badgeSprite.position.y = 2.45;
    root.add(badgeSprite);

    const animator = new CharacterAnimator({
      root,
      pelvis,
      torso,
      neck,
      head,
      leftArm: arms.left,
      rightArm: arms.right,
      leftLeg: legs.left,
      rightLeg: legs.right,
      badgeSprite,
      hairGroup,
      config
    });

    // Enable real-time soft shadows on all character meshes (excluding 2D text sprite)
    root.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return {
      root,
      config,
      animator,
      playerIndex
    };
  }
}

// ==========================================================================
// CHARACTER ANIMATOR - Lifelike Human Biomechanics & Kinematics
// Full skeletal contrapposto idle, pelvic drop & twist walking,
// thoracic breathing, spine counter-rotation, and emotional reaction states.
// ==========================================================================

export class CharacterAnimator {
  constructor(nodes) {
    this.nodes = nodes;
    this.state = 'idle';
    this.walkCycle = 0;
    this.idleTimer = Math.random() * 5;
    this.basePelvisY = 1.05;

    this.resetPose();
  }

  setState(newState) {
    this.state = newState;
    if (newState === 'idle') {
      this.resetPose();
    }
  }

  resetPose() {
    this.nodes.pelvis.position.y = this.basePelvisY;
    this.nodes.pelvis.rotation.set(0, 0, 0);
    this.nodes.torso.rotation.set(0, 0, 0);
    this.nodes.head.rotation.set(0, 0, 0);

    this.nodes.leftArm.upperArm.rotation.set(0.06, 0, 0.12);
    this.nodes.leftArm.forearm.rotation.set(0.15, 0, 0);

    this.nodes.rightArm.upperArm.rotation.set(0.06, 0, -0.12);
    this.nodes.rightArm.forearm.rotation.set(0.15, 0, 0);

    this.nodes.leftLeg.thigh.rotation.set(0, 0, 0);
    this.nodes.leftLeg.calf.rotation.set(0, 0, 0);
    this.nodes.leftLeg.foot.rotation.set(0, 0, 0);

    this.nodes.rightLeg.thigh.rotation.set(0, 0, 0);
    this.nodes.rightLeg.calf.rotation.set(0, 0, 0);
    this.nodes.rightLeg.foot.rotation.set(0, 0, 0);
  }

  update(delta) {
    if (this.nodes.badgeSprite) {
      this.idleTimer += delta;
      this.nodes.badgeSprite.position.y = 2.45 + Math.sin(this.idleTimer * 2.5) * 0.04;
    }

    if (this.state === 'idle') {
      this.updateIdle(delta);
    } else if (this.state === 'walking') {
      this.updateWalking(delta);
    } else if (this.state === 'web_pull') {
      this.updateWebPull(delta);
    } else if (this.state === 'carried') {
      this.updateCarried(delta);
    } else if (this.state === 'holding_hands') {
      this.updateHoldingHands(delta);
    } else if (this.state === 'kidnapped') {
      this.updateKidnapped(delta);
    } else if (this.state === 'abducted') {
      this.updateAbducted(delta);
    } else if (this.state === 'victory') {
      this.updateVictory(delta);
    } else if (this.state === 'defeat') {
      this.updateDefeat(delta);
    }
  }

  // Heroic side-by-side hand-holding team-up with Spider-Man
  updateHoldingHands(delta) {
    this.idleTimer += delta;
    const t = this.idleTimer;
    const breath = Math.sin(t * 2.0) * 0.015;

    // Upright proud stance
    this.nodes.torso.rotation.set(-0.02 + breath, 0, 0);
    this.nodes.pelvis.position.y = this.basePelvisY + breath * 0.006;
    this.nodes.pelvis.rotation.set(0, 0, 0);

    // Left arm extends down and outward to interlock hands with Spider-Man!
    this.nodes.leftArm.upperArm.rotation.set(0.20, 0, 0.32);
    this.nodes.leftArm.forearm.rotation.set(0.15, -0.08, 0.12);

    // Right arm rests relaxed at her side
    this.nodes.rightArm.upperArm.rotation.set(0.06, 0, -0.12);
    this.nodes.rightArm.forearm.rotation.set(0.15, 0, 0);

    // Head turns slightly toward Spider-Man with a friendly tilt
    this.nodes.head.rotation.set(0, 0.20, 0);
  }

  // Natural Human Contrapposto Idle with Weight Shift & Thoracic Breathing
  updateIdle(delta) {
    this.idleTimer += delta;
    const t = this.idleTimer;

    // Lifelike human thoracic breathing
    const breath = Math.sin(t * 2.0);
    this.nodes.torso.rotation.x = -0.02 + breath * 0.015;
    this.nodes.pelvis.position.y = this.basePelvisY + breath * 0.008;

    // Contrapposto weight shift: slight hip tilt to one side
    this.nodes.pelvis.rotation.z = 0.035;
    this.nodes.pelvis.rotation.y = 0.025;

    // Torso counter-balance
    this.nodes.torso.rotation.z = -0.028;

    // Relaxed knees & legs
    this.nodes.leftLeg.thigh.rotation.z = -0.035;
    this.nodes.rightLeg.thigh.rotation.z = 0.035;
    this.nodes.rightLeg.calf.rotation.x = 0.06; // soft right knee bend

    // Natural arm drape
    this.nodes.leftArm.upperArm.rotation.z = 0.12 + Math.sin(t * 1.5) * 0.02;
    this.nodes.rightArm.upperArm.rotation.z = -0.12 - Math.sin(t * 1.5) * 0.02;

    // Subtle natural head awareness glancing
    this.nodes.head.rotation.y = Math.sin(t * 0.6) * 0.08;
    this.nodes.head.rotation.x = Math.cos(t * 0.8) * 0.04;

    // Secondary hair sway
    if (this.nodes.hairGroup) {
      this.nodes.hairGroup.rotation.z = Math.sin(t * 1.8) * 0.015;
    }
  }

  // Natural Human Running Kinematics (stride matched to 0.40s tile step pace):
  // Pelvic drop/tilt, pelvic yaw twist, torso counter-rotation, 3-phase leg cycle
  updateWalking(delta, speed = 7.8) {
    this.walkCycle += delta * speed;
    const c = this.walkCycle;

    // 1. Pelvic Sway (Hip Drop / Roll)
    this.nodes.pelvis.rotation.z = Math.sin(c) * 0.055;

    // 2. Pelvic Twist (Yaw toward forward stepping leg)
    this.nodes.pelvis.rotation.y = Math.sin(c) * 0.10;

    // 3. Spine / Torso Counter-Rotation (Torso twists opposite to hips)
    this.nodes.torso.rotation.y = -Math.sin(c) * 0.10;
    this.nodes.torso.rotation.z = -Math.sin(c) * 0.035;
    this.nodes.torso.rotation.x = 0.07; // Natural forward momentum pitch

    // 4. Double-frequency Pelvic Vertical Bounce
    this.nodes.pelvis.position.y = this.basePelvisY + Math.abs(Math.sin(c)) * 0.055 - 0.02;

    // 5. Realistic Three-Phase Leg Kinematics
    const leftStride = Math.sin(c);
    const rightStride = -leftStride;

    // Thigh hip pitch
    this.nodes.leftLeg.thigh.rotation.x = leftStride * 0.55;
    this.nodes.rightLeg.thigh.rotation.x = rightStride * 0.55;

    // Knee flexion (bends backward during swing phase)
    this.nodes.leftLeg.calf.rotation.x = Math.max(0, -leftStride * 0.85 + 0.18);
    this.nodes.rightLeg.calf.rotation.x = Math.max(0, -rightStride * 0.85 + 0.18);

    // Foot ankle pitch (heel-strike to toe push-off)
    this.nodes.leftLeg.foot.rotation.x = leftStride * 0.28;
    this.nodes.rightLeg.foot.rotation.x = rightStride * 0.28;

    // 6. Fluid Arm Swing with Forearm Lag
    const armSwing = -leftStride;
    this.nodes.leftArm.upperArm.rotation.x = armSwing * 0.42;
    this.nodes.leftArm.upperArm.rotation.z = 0.14;
    this.nodes.leftArm.forearm.rotation.x = 0.22 + Math.max(0, -armSwing * 0.28);

    this.nodes.rightArm.upperArm.rotation.x = -armSwing * 0.42;
    this.nodes.rightArm.upperArm.rotation.z = -0.14;
    this.nodes.rightArm.forearm.rotation.x = 0.22 + Math.max(0, armSwing * 0.28);

    // Head stabilizes forward
    this.nodes.head.rotation.y = -this.nodes.torso.rotation.y * 0.6;
    this.nodes.head.rotation.x = -0.04;

    // Hair inertia dynamics
    if (this.nodes.hairGroup) {
      this.nodes.hairGroup.rotation.x = -Math.abs(Math.sin(c)) * 0.06;
      this.nodes.hairGroup.rotation.z = -this.nodes.pelvis.rotation.z * 0.7;
    }
  }

  // Graceful bridal carry in Spider-Man's arms
  updateCarried(delta) {
    this.idleTimer += delta * 2.2;
    const breath = Math.sin(this.idleTimer) * 0.02;

    // Torso reclined comfortably into Spider-Man's chest
    this.nodes.torso.rotation.set(-0.12 + breath, 0.08, -0.06);
    this.nodes.pelvis.rotation.set(0.1, 0, -0.12);
    this.nodes.pelvis.position.y = this.basePelvisY;

    // Left arm wraps gently up around Spider-Man's shoulder
    this.nodes.leftArm.upperArm.rotation.set(-1.45, 0.25, 0.45);
    this.nodes.leftArm.forearm.rotation.set(0.85, 0.2, 0.15);

    // Right arm rests softly across her midsection
    this.nodes.rightArm.upperArm.rotation.set(-0.65, -0.15, -0.35);
    this.nodes.rightArm.forearm.rotation.set(1.15, -0.25, 0);

    // Legs bent comfortably at hips and knees across Spider-Man's supporting arm
    this.nodes.leftLeg.thigh.rotation.set(0.72, 0.1, 0.1);
    this.nodes.leftLeg.calf.rotation.set(0.9, 0, 0);
    this.nodes.leftLeg.foot.rotation.set(0.2, 0, 0);

    this.nodes.rightLeg.thigh.rotation.set(0.8, -0.15, -0.1);
    this.nodes.rightLeg.calf.rotation.set(1.02, 0, 0);
    this.nodes.rightLeg.foot.rotation.set(0.25, 0, 0);

    // Head gazes warmly toward Spider-Man's mask
    this.nodes.head.rotation.set(-0.15, -0.35, 0.12);

    if (this.nodes.hairGroup) {
      this.nodes.hairGroup.rotation.z = 0.15;
    }
  }

  // Web Pull reaction
  updateWebPull(delta) {
    this.nodes.torso.rotation.x = -0.35;
    this.nodes.leftArm.upperArm.rotation.set(-1.25, 0, 0.2);
    this.nodes.rightArm.upperArm.rotation.set(-1.25, 0, -0.2);
    this.nodes.pelvis.position.y = this.basePelvisY - 0.12;
  }

  // Green Goblin Glider kidnapping
  updateKidnapped(delta) {
    this.idleTimer += delta * 12;
    const flail = Math.sin(this.idleTimer);
    this.nodes.leftArm.upperArm.rotation.x = -1.8 + flail * 0.4;
    this.nodes.rightArm.upperArm.rotation.x = -1.8 - flail * 0.4;
    this.nodes.leftLeg.thigh.rotation.x = flail * 0.5;
    this.nodes.rightLeg.thigh.rotation.x = -flail * 0.5;
  }

  // Dr. Octopus mechanical tentacle abduction reaction
  updateAbducted(delta) {
    this.idleTimer += delta * 14;
    const struggle = Math.sin(this.idleTimer);

    this.nodes.torso.rotation.x = 0.25 + struggle * 0.15;
    this.nodes.head.rotation.x = -0.4;

    // Arms reaching out in shock / struggling against steel claws
    this.nodes.leftArm.upperArm.rotation.set(-1.6 + struggle * 0.3, 0.3, 0.5);
    this.nodes.leftArm.forearm.rotation.set(0.6, 0, 0);
    this.nodes.rightArm.upperArm.rotation.set(-1.6 - struggle * 0.3, -0.3, -0.5);
    this.nodes.rightArm.forearm.rotation.set(0.6, 0, 0);

    // Legs dangling and kicking
    this.nodes.leftLeg.thigh.rotation.x = 0.4 + struggle * 0.45;
    this.nodes.leftLeg.calf.rotation.x = 0.8;
    this.nodes.rightLeg.thigh.rotation.x = 0.4 - struggle * 0.45;
    this.nodes.rightLeg.calf.rotation.x = 0.8;
  }

  // Victory celebration
  updateVictory(delta) {
    this.idleTimer += delta * 6;
    const pump = Math.abs(Math.sin(this.idleTimer));
    this.nodes.leftArm.upperArm.rotation.x = -2.3 - pump * 0.4;
    this.nodes.rightArm.upperArm.rotation.x = -2.3 - pump * 0.4;
    this.nodes.pelvis.position.y = this.basePelvisY + pump * 0.25;
  }

  // Defeat / Elimination
  updateDefeat(delta) {
    this.nodes.torso.rotation.x = 0.45;
    this.nodes.head.rotation.x = 0.55;
    this.nodes.pelvis.position.y = this.basePelvisY - 0.25;
    this.nodes.leftArm.upperArm.rotation.set(0.2, 0, 0.1);
    this.nodes.rightArm.upperArm.rotation.set(0.2, 0, -0.1);
  }
}
