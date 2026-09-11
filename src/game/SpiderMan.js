// ==========================================================================
// SPIDER-MAN - Masterpiece Cinematic Model (Classic Red & Blue Suit)
// Heroic Muscular Anatomy, Embossed Spider Emblems, Metallic Web-Shooters,
// Movie-Accurate White Webbing & Side-by-Side Hand-Holding Team-Up Stance!
// ==========================================================================

import * as THREE from 'three';

export class SpiderMan {
  constructor(scene, spideyId, fixedTileNumber, audioManager, comicFX, board = null) {
    this.scene = scene;
    this.id = spideyId;
    this.name = `Spider-Man #${spideyId}`;
    this.fixedTileNumber = fixedTileNumber;
    this.triggerTileNumber = 1;
    this.audioManager = audioManager;
    this.comicFX = comicFX;
    this.board = board;

    this.root = new THREE.Group();
    this.root.name = `SpiderMan_${spideyId}`;

    this.baseWorldPos = new THREE.Vector3();
    this.webGroup = null;
    this.animTime = 0;
    this.partnerMJ = null;
    this.isHoldingHands = false;

    this.buildModel();
    this.scene.add(this.root);
  }

  createWebbedSuitMaterial(isMask = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Rich Spider-Man crimson red
    ctx.fillStyle = '#be123c';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle dark red hexagonal fabric honeycomb weave texture
    ctx.strokeStyle = 'rgba(136, 19, 55, 0.45)';
    ctx.lineWidth = 1;
    for (let y = 0; y <= 512; y += 16) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    // Iconic Black Spider Webbing lines
    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 3.5;

    if (isMask) {
      // Concentric spider-web radial arcs from bridge of nose (center)
      const cx = 256;
      const cy = 256;
      const rays = 16;
      for (let r = 0; r < rays; r++) {
        const angle = (r / rays) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * 360, cy + Math.sin(angle) * 360);
        ctx.stroke();
      }

      // Connecting web arcs
      for (let radius = 40; radius <= 280; radius += 36) {
        ctx.beginPath();
        for (let r = 0; r <= rays; r++) {
          const angle = (r / rays) * Math.PI * 2;
          const px = cx + Math.cos(angle) * radius;
          const py = cy + Math.sin(angle) * radius;
          if (r === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
    } else {
      // Suit body web grid (longitudinal lines & scalloped horizontal web lines)
      for (let x = 0; x <= 512; x += 42) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }

      for (let y = 20; y <= 512; y += 42) {
        ctx.beginPath();
        for (let x = 0; x <= 512; x += 42) {
          ctx.quadraticCurveTo(x + 21, y - 10, x + 42, y);
        }
        ctx.stroke();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.generateMipmaps = true;

    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.38,
      metalness: 0.12
    });
  }

  createSpiderHand(side, redMat, webMat) {
    const handGroup = new THREE.Group();
    // side: -1 for left hand, 1 for right hand

    // 1. Palm Base (Front anterior face with +Z, Back dorsal face with -Z)
    const palm = new THREE.Mesh(
      new THREE.BoxGeometry(0.078, 0.082, 0.036),
      webMat || redMat
    );
    palm.position.y = -0.042;
    handGroup.add(palm);

    // Palm Cushion / Thenar Eminence at base of thumb (front side +Z)
    const thenarPad = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.015, 0.032, 4, 8),
      redMat
    );
    thenarPad.position.set(side * 0.024, -0.038, 0.014);
    thenarPad.rotation.z = side * 0.35;
    handGroup.add(thenarPad);

    // Web-shooter palm trigger button (center of palm on +Z)
    const triggerBtn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.006, 8),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 })
    );
    triggerBtn.rotation.x = Math.PI / 2;
    triggerBtn.position.set(0, -0.045, 0.019);
    handGroup.add(triggerBtn);

    // Back of Hand Knuckle Guard (dorsal side -Z)
    const knuckleGuard = new THREE.Mesh(
      new THREE.BoxGeometry(0.076, 0.022, 0.010),
      webMat || redMat
    );
    knuckleGuard.position.set(0, -0.074, -0.014);
    handGroup.add(knuckleGuard);

    // 2. Opposable Thumb on the LATERAL side (side * +0.040, pointing forward and inward toward +Z)
    const thumbRoot = new THREE.Group();
    thumbRoot.position.set(side * 0.040, -0.026, 0.012);
    thumbRoot.rotation.z = side * 0.45;
    thumbRoot.rotation.y = side * -0.35;
    thumbRoot.rotation.x = -0.20;
    handGroup.add(thumbRoot);

    const thumbProximal = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.015, 0.032, 4, 8),
      redMat
    );
    thumbProximal.position.y = -0.020;
    thumbRoot.add(thumbProximal);

    const thumbDistal = new THREE.Group();
    thumbDistal.position.y = -0.038;
    thumbRoot.add(thumbDistal);

    const thumbDistalMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.013, 0.026, 4, 8),
      redMat
    );
    thumbDistalMesh.position.y = -0.016;
    thumbDistal.add(thumbDistalMesh);

    // 3. Four Articulated Fingers (Lateral to Medial: Index -> Middle -> Ring -> Pinky)
    const fingerConfigs = [
      { name: 'index', xOffset: side * 0.025, length: 0.072, thickness: 0.015 },
      { name: 'middle', xOffset: side * 0.008, length: 0.078, thickness: 0.016 },
      { name: 'ring', xOffset: side * -0.010, length: 0.072, thickness: 0.015 },
      { name: 'pinky', xOffset: side * -0.026, length: 0.060, thickness: 0.014 }
    ];

    const fingers = [];
    fingerConfigs.forEach(fc => {
      const fingerRoot = new THREE.Group();
      fingerRoot.position.set(fc.xOffset, -0.082, 0);
      handGroup.add(fingerRoot);

      // Proximal Phalanx (Knuckle joint)
      const proxH = fc.length * 0.54;
      const proximal = new THREE.Mesh(
        new THREE.CapsuleGeometry(fc.thickness, proxH - fc.thickness * 2, 4, 8),
        redMat
      );
      proximal.position.y = -proxH * 0.5;
      fingerRoot.add(proximal);

      // Distal Phalanx (Middle/tip joint)
      const distH = fc.length * 0.46;
      const distalJoint = new THREE.Group();
      distalJoint.position.y = -proxH;
      fingerRoot.add(distalJoint);

      const distal = new THREE.Mesh(
        new THREE.CapsuleGeometry(fc.thickness * 0.85, distH - fc.thickness * 1.7, 4, 8),
        redMat
      );
      distal.position.y = -distH * 0.5;
      distalJoint.add(distal);

      fingers.push({
        name: fc.name,
        root: fingerRoot,
        distal: distalJoint
      });
    });

    return { root: handGroup, fingers, thumb: thumbRoot, thumbDistal };
  }

  buildModel() {
    // --- Masterpiece Cinematic Materials ---
    const webMaskMat = this.createWebbedSuitMaterial(true);
    const webSuitMat = this.createWebbedSuitMaterial(false);

    // Deep crimson suit fabric
    const redMat = new THREE.MeshStandardMaterial({
      color: 0xbe123c,
      roughness: 0.38,
      metalness: 0.12
    });

    // Dark midnight navy athletic suit panels
    const blueMat = new THREE.MeshStandardMaterial({
      color: 0x0f2952,
      roughness: 0.32,
      metalness: 0.22
    });

    // High-relief black spider emblem & eye bezels
    const blackMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.25,
      metalness: 0.6
    });

    // White micro-mesh reflective eye lenses
    const eyeLensMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.35,
      roughness: 0.15,
      metalness: 0.05
    });

    // Chrome silver web-shooter gauntlet rings
    const silverMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.18,
      metalness: 0.85
    });

    // Glowing spider-ring on the ground
    const ringGlowMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      side: THREE.DoubleSide
    });

    // --- 1. PELVIS & ATHLETIC HIPS ---
    this.pelvis = new THREE.Group();
    this.pelvis.position.y = 0.95;
    this.root.add(this.pelvis);

    // Contoured athletic hips
    const hips = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.19, 0.12, 6, 12),
      blueMat
    );
    hips.scale.set(1.15, 1.0, 0.92);
    this.pelvis.add(hips);

    // Red suit belt with webbed pattern
    const belt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.05, 14),
      webSuitMat
    );
    belt.position.y = 0.08;
    this.pelvis.add(belt);

    // --- 2. HEROIC ATHLETIC V-TAPER TORSO ---
    this.torso = new THREE.Group();
    this.torso.position.y = 0.16;
    this.pelvis.add(this.torso);

    // Tapered muscular waist
    const waist = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.18, 0.10, 6, 12),
      blueMat
    );
    waist.position.y = 0.10;
    waist.scale.set(1.15, 1.0, 0.85);
    this.torso.add(waist);

    // Ribcage & upper torso core
    const ribcage = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.22, 0.16, 6, 12),
      webSuitMat
    );
    ribcage.position.y = 0.26;
    ribcage.scale.set(1.22, 1.0, 0.88);
    this.torso.add(ribcage);

    // Sculpted Pectoral Slabs (Left & Right Pectoralis Major with Center Sternum Cleft)
    [-1, 1].forEach(side => {
      const pec = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.085, 0.11, 6, 10),
        webSuitMat
      );
      pec.position.set(side * 0.11, 0.32, 0.11);
      pec.rotation.z = side * 0.22;
      pec.rotation.x = 0.10;
      pec.scale.set(1.1, 0.85, 0.65);
      this.torso.add(pec);

      // Latissimus Dorsi V-Taper Back Muscle Wings
      const lat = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.065, 0.18, 6, 8),
        blueMat
      );
      lat.position.set(side * 0.21, 0.24, -0.04);
      lat.rotation.z = side * -0.22;
      this.torso.add(lat);

      // Trapezius muscles sloping from neck to shoulders
      const trap = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.048, 0.10, 4, 8),
        webSuitMat
      );
      trap.position.set(side * 0.14, 0.44, -0.02);
      trap.rotation.z = side * 0.65;
      this.torso.add(trap);
    });

    // Embossed black Spider-Man emblem on chest
    const chestSpider = new THREE.Group();
    chestSpider.position.set(0, 0.28, 0.15);
    this.torso.add(chestSpider);

    const spiderBody = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.10, 0.02), blackMat);
    chestSpider.add(spiderBody);
    const spiderHead = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.02), blackMat);
    spiderHead.position.y = 0.06;
    chestSpider.add(spiderHead);

    // 8 Spider Legs
    [-1, 1].forEach(side => {
      for (let leg = 0; leg < 4; leg++) {
        const legMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.015, 0.015), blackMat);
        legMesh.position.set(side * 0.05, 0.05 - leg * 0.03, 0);
        legMesh.rotation.z = side * (0.35 + leg * 0.15);
        chestSpider.add(legMesh);
      }
    });

    // Large Red Spider emblem on back
    const backSpider = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.20, 0.02), redMat);
    backSpider.position.set(0, 0.26, -0.14);
    this.torso.add(backSpider);

    // --- 3. HEAD & MASK WITH RADIAL WEBBING ---
    this.head = new THREE.Group();
    this.head.position.y = 0.48;
    this.torso.add(this.head);

    const headMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.19, 16, 16),
      webMaskMat
    );
    headMesh.scale.set(0.92, 1.12, 0.96);
    this.head.add(headMesh);

    // Jawline mask taper
    const maskJaw = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.16, 10),
      webMaskMat
    );
    maskJaw.position.set(0, -0.14, 0.04);
    maskJaw.rotation.x = Math.PI;
    this.head.add(maskJaw);

    // Iconic White Expressive Spider-Eyes with Beveled Black Bezels
    [-1, 1].forEach(side => {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(side * 0.075, 0.03, 0.17);
      eyeGroup.rotation.y = side * 0.18;
      eyeGroup.rotation.z = side * 0.32;
      this.head.add(eyeGroup);

      // Black outer rim
      const rim = new THREE.Mesh(
        new THREE.BoxGeometry(0.11, 0.065, 0.025),
        blackMat
      );
      eyeGroup.add(rim);

      // White reflective mesh lens
      const lens = new THREE.Mesh(
        new THREE.BoxGeometry(0.09, 0.05, 0.03),
        eyeLensMat
      );
      lens.position.z = 0.005;
      eyeGroup.add(lens);
    });

    // --- 4. MUSCULAR ARMS & ARTICULATED HANDS (Smooth Capsule Limbs) ---
    this.arms = {};
    [-1, 1].forEach(side => {
      const isLeft = side === -1;
      const key = isLeft ? 'left' : 'right';

      const shoulder = new THREE.Group();
      shoulder.position.set(side * 0.30, 0.38, 0);
      this.torso.add(shoulder);

      // Muscular deltoid cap with web pattern
      const deltoid = new THREE.Mesh(
        new THREE.SphereGeometry(0.082, 12, 12),
        webSuitMat
      );
      deltoid.scale.set(1.0, 1.15, 1.0);
      shoulder.add(deltoid);

      const upperArm = new THREE.Group();
      shoulder.add(upperArm);

      // Muscular bicep/tricep (Smooth Capsule)
      const upperMesh = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.068, 0.18, 6, 12),
        redMat
      );
      upperMesh.position.y = -0.15;
      upperArm.add(upperMesh);

      const forearm = new THREE.Group();
      forearm.position.y = -0.30;
      upperArm.add(forearm);

      // Navy blue muscular forearm (Smooth Capsule)
      const foreMesh = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.060, 0.16, 6, 12),
        blueMat
      );
      foreMesh.position.y = -0.14;
      forearm.add(foreMesh);

      // Chrome silver web-shooter gauntlet ring
      const shooterRing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.068, 0.068, 0.04, 12),
        silverMat
      );
      shooterRing.position.y = -0.22;
      forearm.add(shooterRing);

      // Web shooter nozzle
      const nozzle = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.02, 0.03),
        silverMat
      );
      nozzle.position.set(0, -0.22, 0.07);
      forearm.add(nozzle);

      // Red glove gauntlet with webbed pattern
      const glove = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.058, 0.06, 6, 10),
        webSuitMat
      );
      glove.position.y = -0.24;
      forearm.add(glove);

      // Wrist joint for precise anatomical orientation
      const wrist = new THREE.Group();
      wrist.position.y = -0.28;
      forearm.add(wrist);

      // Fully Articulated Superhero Hand with Palm, Thumb & 4 Fingers!
      const handObj = this.createSpiderHand(side, redMat, webSuitMat);
      wrist.add(handObj.root);

      this.arms[key] = { shoulder, upperArm, forearm, wrist, hand: handObj.root, handObj };
    });

    // --- 5. MUSCULAR LEGS & WEBBED ATHLETIC BOOTS (Smooth Capsule Limbs) ---
    this.legs = {};
    [-1, 1].forEach(side => {
      const isLeft = side === -1;
      const key = isLeft ? 'left' : 'right';

      const hip = new THREE.Group();
      hip.position.set(side * 0.14, -0.06, 0);
      this.pelvis.add(hip);

      // Muscular thigh (Smooth Capsule Quadricep)
      const thigh = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.092, 0.22, 8, 14),
        blueMat
      );
      thigh.position.y = -0.20;
      hip.add(thigh);

      // Anatomical Patella (Kneecap)
      const patella = new THREE.Mesh(
        new THREE.SphereGeometry(0.042, 8, 8),
        blueMat
      );
      patella.position.set(0, -0.38, 0.08);
      patella.scale.set(0.9, 1.2, 0.6);
      hip.add(patella);

      const calfGroup = new THREE.Group();
      calfGroup.position.y = -0.40;
      hip.add(calfGroup);

      // Muscular calf (Smooth Capsule Gastrocnemius)
      const calf = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.078, 0.22, 8, 14),
        blueMat
      );
      calf.position.y = -0.20;
      calfGroup.add(calf);

      // Red boots with webbed pattern
      const boot = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.076, 0.12, 6, 12),
        webSuitMat
      );
      boot.position.y = -0.26;
      calfGroup.add(boot);

      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.075, 0.24), webSuitMat);
      foot.position.set(0, -0.38, 0.05);
      calfGroup.add(foot);

      // Black sole
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.125, 0.02, 0.25), blackMat);
      sole.position.set(0, -0.41, 0.05);
      calfGroup.add(sole);

      this.legs[key] = { hip, thigh, calfGroup };
    });

    // Default heroic superhero perch pose
    this.setPerchPose();

    // Glowing spider web base halo at feet
    const halo = new THREE.Mesh(new THREE.RingGeometry(0.70, 0.92, 24), ringGlowMat);
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.03;
    this.root.add(halo);

    // Enable soft shadow casting & receiving on every mesh
    this.root.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  setPerchPose() {
    // Lifelike superhero standing stance: Left hand rested on hip, right hand relaxed & ready at thigh
    this.arms.left.upperArm.rotation.set(-0.32, 0.22, 0.52);
    this.arms.left.forearm.rotation.set(1.22, -0.18, 0);
    this.arms.left.wrist.rotation.set(0.12, -0.42, -0.12);

    this.arms.right.upperArm.rotation.set(0.18, -0.10, -0.26);
    this.arms.right.forearm.rotation.set(0.38, -0.08, 0);
    this.arms.right.wrist.rotation.set(-0.08, 0.32, -0.05);

    this.pelvis.position.y = 0.95;
    this.torso.rotation.set(0, 0, 0);
    this.head.rotation.set(0, 0, 0);

    // Natural finger curl: thumb hooked / resting, fingers relaxed forward into palm
    if (this.arms.left?.handObj?.fingers) {
      this.arms.left.handObj.fingers.forEach(f => {
        f.root.rotation.x = -0.32;
        f.distal.rotation.x = -0.42;
      });
    }

    if (this.arms.right?.handObj?.fingers) {
      this.arms.right.handObj.fingers.forEach(f => {
        f.root.rotation.x = -0.22;
        f.distal.rotation.x = -0.28;
      });
    }
  }

  setPosition(worldPos) {
    this.baseWorldPos.copy(worldPos);
    this.root.position.copy(worldPos);
  }

  setTriggerTile(tileNumber) {
    this.triggerTileNumber = tileNumber;
  }

  getShooterWorldPosition() {
    const pos = new THREE.Vector3();
    this.arms.right.hand.getWorldPosition(pos);
    return pos;
  }

  // --- 6. HEROIC HAND-HOLDING TEAM-UP STANCE ---
  holdHands(targetMJ) {
    this.partnerMJ = targetMJ;
    this.isHoldingHands = true;

    // Center tile world position
    const centerPos = this.baseWorldPos.clone();

    // Stand side-by-side on the tile: Spider-Man on the left, MJ on the right
    this.root.position.set(centerPos.x - 0.42, 0, centerPos.z);
    this.root.rotation.set(0, 0, 0); // Face forward (+Z towards camera)

    targetMJ.root.position.set(centerPos.x + 0.42, 0.1, centerPos.z);
    targetMJ.root.rotation.set(0, 0, 0);

    // Spider-Man posture:
    // Left hand resting proud on hip
    this.arms.left.upperArm.rotation.set(-0.25, 0.35, 0.65);
    this.arms.left.forearm.rotation.set(1.4, -0.2, 0);
    this.arms.left.wrist.rotation.set(0.2, -0.8, -0.2);

    // Right arm extends down and outward to interlock hands with MJ!
    this.arms.right.upperArm.rotation.set(0.20, 0, -0.32);
    this.arms.right.forearm.rotation.set(0.15, 0.08, -0.12);
    this.arms.right.wrist.rotation.set(-0.1, 0.4, 0.1);

    // Naturally curl fingers to gently hold MJ's hand
    if (this.arms.right.handObj && this.arms.right.handObj.fingers) {
      this.arms.right.handObj.fingers.forEach(f => {
        f.root.rotation.x = -0.16;
        f.distal.rotation.x = -0.22;
      });
    }

    // Head turns slightly toward MJ with a friendly tilt
    this.head.rotation.set(0, -0.20, 0);

    // Trigger MJ's holding_hands animation state
    if (targetMJ.animator) {
      targetMJ.animator.setState('holding_hands');
    }

    // Play subtle friendly chime without any distracting text banners on screen
    this.audioManager.playHeroicCatch();
  }

  releaseHands() {
    if (this.partnerMJ) {
      this.partnerMJ.animator.setState('idle');
      this.partnerMJ = null;
    }
    this.isHoldingHands = false;

    // Move Spider-Man back to the center of his tile
    this.root.position.copy(this.baseWorldPos);
    this.setPerchPose();
  }

  // --- 7. MOVIE-ACCURATE REALISTIC WHITE SPIDER-WEB ---
  triggerWebPull(targetMJ, onComplete) {
    const mjPos = targetMJ.root.position.clone();

    // 1. Spidey turns sharply toward MJ
    this.root.lookAt(mjPos.x, this.root.position.y, mjPos.z);

    // 2. Raise arm straight out in iconic web-shooter pose
    this.arms.right.upperArm.rotation.set(-1.45, 0, -0.12);
    this.arms.right.forearm.rotation.set(0.08, 0, 0);
    // Hyperextend wrist backward so palm faces target MJ directly!
    this.arms.right.wrist.rotation.set(1.15, 0, 0);

    // Iconic Thwip hand: middle & ring fingers curled tightly into the palm button!
    if (this.arms.right.handObj && this.arms.right.handObj.fingers) {
      this.arms.right.handObj.fingers.forEach(f => {
        if (f.name === 'middle' || f.name === 'ring') {
          f.root.rotation.x = -1.35;
          f.distal.rotation.x = -1.35;
        } else {
          f.root.rotation.x = -0.12;
          f.distal.rotation.x = -0.08;
        }
      });
    }

    this.audioManager.playThwip();

    const spideyHeadPos = this.root.position.clone();
    spideyHeadPos.y += 2.6;
    this.comicFX.spawnAt(spideyHeadPos, 'THWIP!', '#be123c', '#ffffff', 1.8);

    targetMJ.animator.setState('web_pull');

    const wristPos = this.getShooterWorldPosition();
    const mjChestPos = mjPos.clone();
    mjChestPos.y += 1.2;

    this.createRealisticWeb(wristPos);

    let shootProgress = 0;
    const shootDuration = 0.32;
    const startTime = performance.now();

    const animateShoot = () => {
      const now = performance.now();
      shootProgress = (now - startTime) / (shootDuration * 1000);

      if (shootProgress < 1.0) {
        const curEnd = new THREE.Vector3().lerpVectors(wristPos, mjChestPos, shootProgress);
        const curWrist = this.getShooterWorldPosition();
        this.updateRealisticWeb(curWrist, curEnd, shootProgress);
        requestAnimationFrame(animateShoot);
      } else {
        this.startReelIn(targetMJ, onComplete);
      }
    };

    requestAnimationFrame(animateShoot);
  }

  createRealisticWeb(wristPos) {
    this.cleanWeb();

    this.webGroup = new THREE.Group();
    this.webGroup.name = `Web_${this.id}`;
    this.scene.add(this.webGroup);

    // Pearlescent organic white silk material
    const silkMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.18,
      metalness: 0.05,
      emissive: 0xffffff,
      emissiveIntensity: 0.45
    });

    const microStrandMat = new THREE.LineBasicMaterial({
      color: 0xf8fafc,
      linewidth: 3,
      transparent: true,
      opacity: 0.95
    });

    // Central high-density silk cable
    const coreGeo = new THREE.CylinderGeometry(0.045, 0.045, 1, 8);
    this.webCoreMesh = new THREE.Mesh(coreGeo, silkMat);
    this.webGroup.add(this.webCoreMesh);

    // Wrist spinneret burst cone
    const coneGeo = new THREE.ConeGeometry(0.14, 0.35, 8, 1, true);
    this.webWristCone = new THREE.Mesh(coneGeo, silkMat);
    this.webGroup.add(this.webWristCone);

    // Chest impact radial web splat
    this.webChestSplat = new THREE.Group();
    this.webGroup.add(this.webChestSplat);

    const hub = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), silkMat);
    this.webChestSplat.add(hub);

    const spokeGeo = new THREE.CylinderGeometry(0.014, 0.006, 0.65, 4);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const spoke = new THREE.Mesh(spokeGeo, silkMat);
      spoke.position.set(Math.cos(angle) * 0.3, Math.sin(angle) * 0.3, 0);
      spoke.rotation.z = angle + Math.PI / 2;
      this.webChestSplat.add(spoke);
    }

    const ringGeo = new THREE.TorusGeometry(0.42, 0.016, 6, 16);
    const ring = new THREE.Mesh(ringGeo, silkMat);
    this.webChestSplat.add(ring);

    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const drop = new THREE.Mesh(new THREE.SphereGeometry(0.032, 6, 6), silkMat);
      drop.position.set(Math.cos(a) * 0.42, Math.sin(a) * 0.42, 0);
      this.webChestSplat.add(drop);
    }

    // 3 Helical braided silk filaments
    this.webBraids = [];
    for (let b = 0; b < 3; b++) {
      const braidGeo = new THREE.BufferGeometry();
      const line = new THREE.Line(braidGeo, microStrandMat);
      this.webGroup.add(line);
      this.webBraids.push(line);
    }
  }

  updateRealisticWeb(start, end, progress = 1.0) {
    if (!this.webGroup) return;

    const dist = start.distanceTo(end);
    if (dist < 0.01) return;

    const dir = new THREE.Vector3().subVectors(end, start).normalize();
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const rotQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

    this.webCoreMesh.scale.set(1, dist, 1);
    this.webCoreMesh.position.copy(mid);
    this.webCoreMesh.quaternion.copy(rotQuat);

    const conePos = start.clone().addScaledVector(dir, 0.18);
    this.webWristCone.position.copy(conePos);
    this.webWristCone.quaternion.copy(rotQuat);

    this.webChestSplat.position.copy(end);
    this.webChestSplat.quaternion.copy(rotQuat);
    this.webChestSplat.rotateX(Math.PI / 2);

    const segments = 24;
    const braidRadius = 0.065;
    this.webBraids.forEach((line, bIdx) => {
      const pts = [];
      const phaseOffset = (bIdx / 3) * Math.PI * 2;
      for (let s = 0; s <= segments; s++) {
        const t = s / segments;
        const pt = new THREE.Vector3().lerpVectors(start, end, t);
        const spiralAngle = t * Math.PI * 8 + phaseOffset;

        const up = Math.abs(dir.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
        const right = new THREE.Vector3().crossVectors(dir, up).normalize();
        const normUp = new THREE.Vector3().crossVectors(right, dir).normalize();

        const offset = right.multiplyScalar(Math.cos(spiralAngle) * braidRadius)
          .add(normUp.multiplyScalar(Math.sin(spiralAngle) * braidRadius));
        pt.add(offset);
        pts.push(pt);
      }
      line.geometry.setFromPoints(pts);
    });
  }

  startReelIn(targetMJ, onComplete) {
    this.audioManager.playWebPull();

    const startPos = targetMJ.root.position.clone();
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.root.quaternion);
    const endPos = this.baseWorldPos.clone().add(new THREE.Vector3(0.42, 0, 0));
    endPos.y = startPos.y;

    let pullProgress = 0;
    const pullDuration = 1.6;
    const startTime = performance.now();

    this.arms.right.upperArm.rotation.set(-0.8, 0.3, -0.2);
    this.pelvis.position.y = 0.88;

    const animatePull = () => {
      const now = performance.now();
      pullProgress = (now - startTime) / (pullDuration * 1000);

      if (pullProgress < 1.0) {
        const t = 1 - Math.pow(1 - pullProgress, 3);
        const currentPos = new THREE.Vector3().lerpVectors(startPos, endPos, t);

        targetMJ.root.position.copy(currentPos);
        targetMJ.root.lookAt(this.root.position.x, targetMJ.root.position.y, this.root.position.z);

        const curWrist = this.getShooterWorldPosition();
        const curChest = currentPos.clone();
        curChest.y += 1.2;

        this.updateRealisticWeb(curWrist, curChest, pullProgress);

        requestAnimationFrame(animatePull);
      } else {
        // Arrived at Spider-Man! Clean up web and hold hands!
        this.cleanWeb();

        this.holdHands(targetMJ);

        setTimeout(() => {
          if (onComplete) onComplete();
        }, 500);
      }
    };

    requestAnimationFrame(animatePull);
  }

  cleanWeb() {
    if (this.webGroup) {
      this.scene.remove(this.webGroup);
      this.webGroup.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
          else child.material.dispose();
        }
      });
      this.webGroup = null;
    }
  }

  update(delta) {
    this.animTime += delta;

    if (this.isHoldingHands) {
      // Gentle shared breathing when holding hands
      const sway = Math.sin(this.animTime * 2.0) * 0.015;
      this.pelvis.position.y = 0.95 + sway;
      this.head.rotation.y = -0.20 + Math.sin(this.animTime * 1.2) * 0.04;
    } else if (this.head && !this.webGroup) {
      // Subtle realistic breathing while standing still on station tile
      const breath = Math.sin(this.animTime * 2.2) * 0.015;
      this.pelvis.position.y = 0.95 + breath * 0.4;
      if (this.torso) {
        this.torso.scale.set(1.0 + breath * 0.3, 1.0 + breath * 0.2, 1.0 + breath * 0.4);
      }

      // Gentle natural head scan
      this.head.rotation.y = Math.sin(this.animTime * 1.2) * 0.14;
      this.head.rotation.x = Math.sin(this.animTime * 1.8) * 0.03;

      // Alive hand breathing: subtle natural finger flex
      const fingerFlex = Math.sin(this.animTime * 2.2) * 0.04;
      if (this.arms.right?.handObj?.fingers) {
        this.arms.right.handObj.fingers.forEach(f => {
          f.root.rotation.x = -0.22 + fingerFlex;
        });
      }
    }
  }
}
