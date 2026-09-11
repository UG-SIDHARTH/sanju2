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

  buildModel() {
    // --- Masterpiece Cinematic Materials ---
    // Deep crimson suit fabric with subtle specular sheen
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
      new THREE.CylinderGeometry(0.24, 0.20, 0.22, 12),
      blueMat
    );
    this.pelvis.add(hips);

    // Red suit belt
    const belt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.245, 0.245, 0.05, 12),
      redMat
    );
    belt.position.y = 0.08;
    this.pelvis.add(belt);

    // --- 2. HEROIC V-TAPER TORSO ---
    this.torso = new THREE.Group();
    this.torso.position.y = 0.16;
    this.pelvis.add(this.torso);

    // Tapered muscular waist
    const waist = new THREE.Mesh(
      new THREE.CylinderGeometry(0.23, 0.21, 0.20, 12),
      blueMat
    );
    waist.position.y = 0.10;
    this.torso.add(waist);

    // Muscular chest & broad shoulders
    const chest = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.23, 0.32, 12),
      redMat
    );
    chest.position.y = 0.26;
    chest.scale.set(1.15, 1.0, 0.88);
    this.torso.add(chest);

    // Navy blue side rib contour panels
    [-1, 1].forEach(side => {
      const ribPanel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.06, 0.26, 8),
        blueMat
      );
      ribPanel.position.set(side * 0.21, 0.24, 0);
      ribPanel.scale.set(1.0, 1.0, 0.9);
      this.torso.add(ribPanel);
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

    // --- 3. HEAD & MASK ---
    this.head = new THREE.Group();
    this.head.position.y = 0.48;
    this.torso.add(this.head);

    const headMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.19, 16, 16),
      redMat
    );
    headMesh.scale.set(0.92, 1.12, 0.96);
    this.head.add(headMesh);

    // Jawline mask taper
    const maskJaw = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.16, 10),
      redMat
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

    // --- 4. MUSCULAR ARMS & SILVER WEB-SHOOTERS ---
    this.arms = {};
    [-1, 1].forEach(side => {
      const isLeft = side === -1;
      const key = isLeft ? 'left' : 'right';

      const shoulder = new THREE.Group();
      shoulder.position.set(side * 0.30, 0.38, 0);
      this.torso.add(shoulder);

      // Muscular deltoid
      const deltoid = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 10, 10),
        redMat
      );
      shoulder.add(deltoid);

      const upperArm = new THREE.Group();
      shoulder.add(upperArm);

      // Muscular bicep/tricep
      const upperMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.075, 0.065, 0.30, 8),
        redMat
      );
      upperMesh.position.y = -0.15;
      upperArm.add(upperMesh);

      const forearm = new THREE.Group();
      forearm.position.y = -0.30;
      upperArm.add(forearm);

      // Navy blue forearm
      const foreMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.068, 0.058, 0.28, 8),
        blueMat
      );
      foreMesh.position.y = -0.14;
      forearm.add(foreMesh);

      // Chrome silver web-shooter gauntlet ring
      const shooterRing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.069, 0.069, 0.04, 10),
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

      // Red glove
      const glove = new THREE.Mesh(
        new THREE.CylinderGeometry(0.065, 0.055, 0.12, 8),
        redMat
      );
      glove.position.y = -0.24;
      forearm.add(glove);

      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.052, 8, 8), redMat);
      hand.position.y = -0.30;
      forearm.add(hand);

      this.arms[key] = { shoulder, upperArm, forearm, hand };
    });

    // --- 5. MUSCULAR LEGS & ATHLETIC BOOTS ---
    this.legs = {};
    [-1, 1].forEach(side => {
      const isLeft = side === -1;
      const key = isLeft ? 'left' : 'right';

      const hip = new THREE.Group();
      hip.position.set(side * 0.14, -0.06, 0);
      this.pelvis.add(hip);

      // Muscular thigh
      const thigh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.105, 0.085, 0.40, 10),
        blueMat
      );
      thigh.position.y = -0.20;
      hip.add(thigh);

      const calfGroup = new THREE.Group();
      calfGroup.position.y = -0.40;
      hip.add(calfGroup);

      // Muscular calf
      const calf = new THREE.Mesh(
        new THREE.CylinderGeometry(0.085, 0.072, 0.40, 10),
        blueMat
      );
      calf.position.y = -0.20;
      calfGroup.add(calf);

      // Red boots with defined athletic soles
      const boot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.088, 0.076, 0.24, 10),
        redMat
      );
      boot.position.y = -0.26;
      calfGroup.add(boot);

      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.075, 0.24), redMat);
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
  }

  setPerchPose() {
    this.arms.left.upperArm.rotation.set(0.3, 0, 0.4);
    this.arms.left.forearm.rotation.set(0.8, 0, 0);
    this.arms.right.upperArm.rotation.set(0.3, 0, -0.4);
    this.arms.right.forearm.rotation.set(0.8, 0, 0);
    this.pelvis.position.y = 0.95;
    this.torso.rotation.set(0, 0, 0);
    this.head.rotation.set(0, 0, 0);
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

    // Right arm extends down and outward to interlock hands with MJ!
    this.arms.right.upperArm.rotation.set(0.20, 0, -0.32);
    this.arms.right.forearm.rotation.set(0.15, 0.08, -0.12);

    // Head turns slightly toward MJ with a friendly tilt
    this.head.rotation.set(0, -0.20, 0);

    // Trigger MJ's holding_hands animation state
    if (targetMJ.animator) {
      targetMJ.animator.setState('holding_hands');
    }

    // Play chime & celebrate team-up!
    this.audioManager.playHeroicCatch();
    const bannerPos = centerPos.clone();
    bannerPos.y += 2.5;
    this.comicFX.spawnAt(bannerPos, 'TEAM UP!', '#be123c', '#ffffff', 2.2);
    this.comicFX.showBanner('SPIDER-MAN & MJ TEAM UP!');
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
    this.arms.right.upperArm.rotation.set(-1.55, 0, -0.15);
    this.arms.right.forearm.rotation.set(0, 0, 0);

    this.audioManager.playThwip();

    const spideyHeadPos = this.root.position.clone();
    spideyHeadPos.y += 2.6;
    this.comicFX.spawnAt(spideyHeadPos, 'THWIP!', '#be123c', '#ffffff', 1.8);
    this.comicFX.showBanner('SPIDER-MAN WEB LINE DEPLOYED!');

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
      this.head.rotation.y = Math.sin(this.animTime * 1.5) * 0.15;
    }
  }
}
