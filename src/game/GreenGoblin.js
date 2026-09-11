// ==========================================================================
// GREEN GOBLIN - 6 Goblins on Gliders (High-Visibility & Fast Performance)
// Full Aerial Kidnapping Sequence with Continuous Flight Camera Tracking
// ==========================================================================

import * as THREE from 'three';

export class GreenGoblin {
  constructor(scene, goblinId, fixedTileNumber, audioManager, comicFX) {
    this.scene = scene;
    this.id = goblinId;
    this.name = `Green Goblin #${goblinId}`;
    this.fixedTileNumber = fixedTileNumber;
    this.audioManager = audioManager;
    this.comicFX = comicFX;

    this.root = new THREE.Group();
    this.root.name = `GreenGoblin_${goblinId}`;

    this.baseY = 0.85;
    this.hoverTime = Math.random() * 10;
    this.isKidnapping = false;

    this.buildModel();
    this.scene.add(this.root);
  }

  createScalyMaterial() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Rich villainous emerald green
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 0, 256, 256);

    // Goblin scale texture
    ctx.strokeStyle = '#052e16';
    ctx.lineWidth = 1.8;
    const scaleSize = 16;
    for (let y = 0; y <= 256; y += scaleSize) {
      const rowOffset = (y / scaleSize) % 2 === 0 ? 0 : scaleSize / 2;
      for (let x = -scaleSize; x <= 256 + scaleSize; x += scaleSize) {
        ctx.beginPath();
        ctx.arc(x + rowOffset, y, scaleSize * 0.65, 0, Math.PI);
        ctx.stroke();
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);

    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.42,
      metalness: 0.18
    });
  }

  buildModel() {
    // --- Authentic Classic Green Goblin Materials ---
    const greenScalyMat = this.createScalyMaterial();

    const purpleMat = new THREE.MeshStandardMaterial({
      color: 0x7e22ce, // Classic royal villain purple
      roughness: 0.38,
      metalness: 0.22
    });

    const purpleDarkMat = new THREE.MeshStandardMaterial({
      color: 0x581c87,
      roughness: 0.35,
      metalness: 0.25
    });

    const satchelLeatherMat = new THREE.MeshStandardMaterial({
      color: 0x78350f, // Brown leather satchel
      roughness: 0.65,
      metalness: 0.1
    });

    const eyeYellowMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xeab308,
      emissiveIntensity: 1.2,
      roughness: 0.1
    });

    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });

    const teethMat = new THREE.MeshStandardMaterial({
      color: 0xfef9c3,
      roughness: 0.2,
      metalness: 0.1
    });

    const gliderMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.25,
      metalness: 0.88
    });

    const gliderChromeMat = new THREE.MeshStandardMaterial({
      color: 0xcfd8dc,
      roughness: 0.15,
      metalness: 0.95
    });

    const pumpkinMat = new THREE.MeshStandardMaterial({
      color: 0xea580c,
      emissive: 0xf97316,
      emissiveIntensity: 1.3,
      roughness: 0.35
    });

    // --- 1. BAT-GLIDER WITH GLOWING AURA EFFECTS ---
    this.gliderGroup = new THREE.Group();
    this.gliderGroup.position.y = 0.25;
    this.root.add(this.gliderGroup);

    // Aerodynamic central fuselage
    const fuselage = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.14, 1.5),
      gliderMat
    );
    fuselage.position.set(0, 0, 0.1);
    this.gliderGroup.add(fuselage);

    // Front ram / nose cone
    const nose = new THREE.Mesh(
      new THREE.ConeGeometry(0.35, 0.65, 4),
      gliderMat
    );
    nose.rotation.x = Math.PI / 2;
    nose.rotation.y = Math.PI / 4;
    nose.position.set(0, 0, 1.1);
    this.gliderGroup.add(nose);

    // Twin forward scythe cutting blades
    [-1, 1].forEach(side => {
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.18, 0.75),
        gliderChromeMat
      );
      blade.position.set(side * 0.28, -0.02, 1.15);
      blade.rotation.x = 0.2;
      this.gliderGroup.add(blade);
    });

    // Swept-Back Aggressive Bat-Wings
    [-1, 1].forEach(side => {
      const wingRoot = new THREE.Group();
      wingRoot.position.set(side * 0.35, 0, 0);
      this.gliderGroup.add(wingRoot);

      // Main bat wing blade
      const wing = new THREE.Mesh(
        new THREE.BoxGeometry(1.08, 0.06, 0.95),
        gliderMat
      );
      wing.position.set(side * 0.54, 0.02, -0.12);
      wing.rotation.y = side * 0.28;
      wing.rotation.z = side * -0.12;
      wingRoot.add(wing);

      // Polished leading edge blade
      const leadingEdge = new THREE.Mesh(
        new THREE.BoxGeometry(1.10, 0.05, 0.12),
        gliderChromeMat
      );
      leadingEdge.position.set(side * 0.54, 0.03, 0.30);
      leadingEdge.rotation.y = side * 0.28;
      leadingEdge.rotation.z = side * -0.12;
      wingRoot.add(leadingEdge);

      // Wingtip vertical fin
      const tipFin = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.34, 0.65),
        gliderChromeMat
      );
      tipFin.position.set(side * 1.20, 0.12, -0.22);
      tipFin.rotation.z = side * 0.25;
      wingRoot.add(tipFin);
    });

    // Dual Jet Turbines with Flaming Exhaust Plumes
    this.thrusters = [];
    this.flames = [];
    [-1, 1].forEach(side => {
      const engineCowl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.16, 0.55, 12),
        gliderMat
      );
      engineCowl.rotation.x = Math.PI / 2;
      engineCowl.position.set(side * 0.26, 0.02, -0.72);
      this.gliderGroup.add(engineCowl);

      const nozzleRing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.145, 0.145, 0.08, 12),
        purpleDarkMat
      );
      nozzleRing.rotation.x = Math.PI / 2;
      nozzleRing.position.set(side * 0.26, 0.02, -0.98);
      this.gliderGroup.add(nozzleRing);

      // Inner glowing core
      const plasma = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.06, 0.22, 10),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      plasma.rotation.x = Math.PI / 2;
      plasma.position.set(side * 0.26, 0.02, -1.08);
      this.gliderGroup.add(plasma);
      this.thrusters.push(plasma);

      // Fiery jet exhaust flame plume shooting out
      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.13, 0.75, 8),
        new THREE.MeshBasicMaterial({
          color: 0xf97316,
          transparent: true,
          opacity: 0.85
        })
      );
      flame.rotation.x = -Math.PI / 2;
      flame.position.set(side * 0.26, 0.02, -1.55);
      this.gliderGroup.add(flame);
      this.flames.push(flame);
    });

    // --- HOVERBOARD GLOWING AURA FIELD ---
    // Pulsing translucent electromagnetic energy aura hovering beneath and around the glider
    const auraCanvas = document.createElement('canvas');
    auraCanvas.width = 256;
    auraCanvas.height = 256;
    const aCtx = auraCanvas.getContext('2d');
    const aGrad = aCtx.createRadialGradient(128, 128, 20, 128, 128, 128);
    aGrad.addColorStop(0, 'rgba(168, 85, 247, 0.85)'); // Vibrant purple core
    aGrad.addColorStop(0.5, 'rgba(34, 197, 94, 0.55)');  // Electric green halo
    aGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');     // Fading cyan edge
    aCtx.fillStyle = aGrad;
    aCtx.fillRect(0, 0, 256, 256);

    const auraTex = new THREE.CanvasTexture(auraCanvas);
    const auraGeo = new THREE.PlaneGeometry(3.6, 2.6);
    this.auraMat = new THREE.MeshBasicMaterial({
      map: auraTex,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.auraMesh = new THREE.Mesh(auraGeo, this.auraMat);
    this.auraMesh.rotation.x = -Math.PI / 2;
    this.auraMesh.position.y = -0.15;
    this.gliderGroup.add(this.auraMesh);

    // Magnetic Foot Clamps
    [-1, 1].forEach(side => {
      const clamp = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.06, 0.36),
        purpleDarkMat
      );
      clamp.position.set(side * 0.22, 0.10, 0.12);
      this.gliderGroup.add(clamp);
    });

    // --- 2. AUTHENTIC GREEN GOBLIN BODY ---
    this.goblinBody = new THREE.Group();
    this.goblinBody.position.y = 0.15;
    this.gliderGroup.add(this.goblinBody);

    // Hips & Pelvis
    this.pelvis = new THREE.Group();
    this.pelvis.position.y = 0.88;
    this.goblinBody.add(this.pelvis);

    const scalyHips = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.19, 0.12, 6, 12),
      greenScalyMat
    );
    scalyHips.scale.set(1.15, 1.0, 0.9);
    this.pelvis.add(scalyHips);

    // Purple belt
    const purpleBelt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.05, 12),
      purpleDarkMat
    );
    purpleBelt.position.y = 0.09;
    this.pelvis.add(purpleBelt);

    // Torso with Scaly Green Bodysuit & Purple Vest / Tunic
    this.torso = new THREE.Group();
    this.torso.position.y = 0.16;
    this.pelvis.add(this.torso);

    // Scaly green waist (Smooth Capsule)
    const waist = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.18, 0.10, 6, 12),
      greenScalyMat
    );
    waist.position.y = 0.09;
    waist.scale.set(1.1, 1.0, 0.85);
    this.torso.add(waist);

    // Green scaly muscular chest (Smooth Capsule)
    const chestPlate = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.22, 0.16, 6, 12),
      greenScalyMat
    );
    chestPlate.position.set(0, 0.26, 0.02);
    chestPlate.scale.set(1.22, 1.0, 0.90);
    this.torso.add(chestPlate);

    // Classic Purple Sleeveless Tunic / Vest with jagged scalloped bottom
    const purpleVest = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.23, 0.15, 6, 12),
      purpleMat
    );
    purpleVest.position.set(0, 0.27, 0.02);
    purpleVest.scale.set(1.24, 1.0, 0.92);
    this.torso.add(purpleVest);

    // Brown Leather Satchel with Shoulder Strap (for Pumpkin Bombs)
    const strap = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.65, 0.36),
      satchelLeatherMat
    );
    strap.position.set(0, 0.26, 0.02);
    strap.rotation.z = -0.55;
    this.torso.add(strap);

    // Leather satchel pouch at hip
    const pouch = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.20, 0.12),
      satchelLeatherMat
    );
    pouch.position.set(-0.25, 0.02, 0.05);
    pouch.rotation.z = 0.15;
    this.torso.add(pouch);

    // --- 3. CLASSIC GREEN GOBLIN HEAD WITH PURPLE HOODED COWL ---
    this.head = new THREE.Group();
    this.head.position.y = 0.52;
    this.torso.add(this.head);

    // Scaly green face & head dome
    const headMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.20, 12, 12),
      greenScalyMat
    );
    headMesh.scale.set(0.95, 1.15, 1.05);
    this.head.add(headMesh);

    // Classic Purple Cowl / Hood covering crown and forehead
    const cowlHood = new THREE.Mesh(
      new THREE.SphereGeometry(0.21, 12, 12),
      purpleMat
    );
    cowlHood.position.set(0, 0.04, -0.04);
    cowlHood.scale.set(1.02, 1.12, 1.08);
    this.head.add(cowlHood);

    // Long Drooping Pointed Cowl Tail hanging down back!
    const cowlTail = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.55, 8),
      purpleMat
    );
    cowlTail.position.set(0, 0.12, -0.32);
    cowlTail.rotation.x = -1.15;
    this.head.add(cowlTail);

    // Large Pointed Goblin Ears extending out sideways
    [-1, 1].forEach(side => {
      const ear = new THREE.Mesh(
        new THREE.ConeGeometry(0.07, 0.28, 6),
        greenScalyMat
      );
      ear.position.set(side * 0.22, 0.04, -0.06);
      ear.rotation.z = side * -1.25;
      ear.rotation.x = 0.15;
      this.head.add(ear);
    });

    // Bulging Menacing Golden-Yellow Eyes with Slit Pupils
    [-1, 1].forEach(side => {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(side * 0.08, 0.05, 0.18);
      eyeGroup.rotation.z = side * 0.22;
      this.head.add(eyeGroup);

      const eyeSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 8, 8),
        eyeYellowMat
      );
      eyeSphere.scale.set(1.1, 0.9, 0.8);
      eyeGroup.add(eyeSphere);

      // Black slit pupil
      const pupil = new THREE.Mesh(
        new THREE.BoxGeometry(0.015, 0.07, 0.02),
        pupilMat
      );
      pupil.position.set(0, 0, 0.05);
      eyeGroup.add(pupil);
    });

    // Maniacal Demonic Grinning Mouth with Jagged Teeth
    const mouthCavity = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.08, 0.05),
      new THREE.MeshBasicMaterial({ color: 0x1f0404 })
    );
    mouthCavity.position.set(0, -0.08, 0.18);
    this.head.add(mouthCavity);

    // Jagged pointed teeth
    for (let t = -3; t <= 3; t++) {
      const tooth = new THREE.Mesh(
        new THREE.ConeGeometry(0.015, 0.035, 4),
        teethMat
      );
      tooth.position.set(t * 0.028, -0.075, 0.20);
      tooth.rotation.x = Math.PI;
      this.head.add(tooth);
    }

    // Pointed chin
    const chin = new THREE.Mesh(
      new THREE.ConeGeometry(0.10, 0.18, 6),
      greenScalyMat
    );
    chin.position.set(0, -0.15, 0.09);
    chin.rotation.x = Math.PI - 0.2;
    this.head.add(chin);

    // --- 4. ARMS WITH PURPLE FLARED GLOVES & PUMPKIN BOMB ---
    this.arms = {};
    [-1, 1].forEach(side => {
      const isLeft = side === -1;
      const key = isLeft ? 'left' : 'right';

      const shoulder = new THREE.Group();
      shoulder.position.set(side * 0.32, 0.36, 0);
      this.torso.add(shoulder);

      // Upper arm in green scale suit (Smooth Capsule)
      const upperArm = new THREE.Group();
      shoulder.add(upperArm);
      const upperMesh = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.068, 0.18, 6, 10),
        greenScalyMat
      );
      upperMesh.position.y = -0.15;
      upperArm.add(upperMesh);

      const forearm = new THREE.Group();
      forearm.position.y = -0.30;
      upperArm.add(forearm);

      // Purple Glove with flared cuff
      const gloveCuff = new THREE.Mesh(
        new THREE.CylinderGeometry(0.085, 0.07, 0.08, 10),
        purpleMat
      );
      gloveCuff.position.y = -0.05;
      forearm.add(gloveCuff);

      const foreMesh = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.062, 0.16, 6, 10),
        purpleMat
      );
      foreMesh.position.y = -0.15;
      forearm.add(foreMesh);

      const fist = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 8, 8),
        purpleMat
      );
      fist.position.y = -0.28;
      forearm.add(fist);

      // Clawed fingers on glove
      for (let f = -1; f <= 1; f++) {
        const finger = new THREE.Mesh(
          new THREE.ConeGeometry(0.015, 0.05, 4),
          purpleMat
        );
        finger.position.set(f * 0.025, -0.32, 0.02);
        finger.rotation.x = 0.5;
        forearm.add(finger);
      }

      // --- GLOWING VOLCANIC PUMPKIN BOMB IN RIGHT HAND ---
      if (!isLeft) {
        this.pumpkinBomb = new THREE.Group();
        this.pumpkinBomb.position.set(0, -0.36, 0.08);
        forearm.add(this.pumpkinBomb);

        const pumpkinSphere = new THREE.Mesh(
          new THREE.SphereGeometry(0.14, 12, 12),
          pumpkinMat
        );
        this.pumpkinBomb.add(pumpkinSphere);

        // Jack-o'-lantern carved eyes
        [-1, 1].forEach(pSide => {
          const pEye = new THREE.Mesh(
            new THREE.ConeGeometry(0.035, 0.045, 3),
            eyeYellowMat
          );
          pEye.position.set(pSide * 0.05, 0.03, 0.13);
          pEye.rotation.x = Math.PI / 2;
          this.pumpkinBomb.add(pEye);
        });

        // Wicked carved pumpkin grin
        const pMouth = new THREE.Mesh(
          new THREE.BoxGeometry(0.10, 0.03, 0.03),
          eyeYellowMat
        );
        pMouth.position.set(0, -0.04, 0.13);
        this.pumpkinBomb.add(pMouth);

        // Bronze stem
        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.025, 0.06, 6),
          satchelLeatherMat
        );
        stem.position.y = 0.15;
        this.pumpkinBomb.add(stem);
      }

      this.arms[key] = { shoulder, upperArm, forearm };
    });

    // --- 5. GREEN LEGS & POINTED PURPLE ELF BOOTS (CURLED TOES) ---
    [-1, 1].forEach(side => {
      const hipJoint = new THREE.Group();
      hipJoint.position.set(side * 0.16, -0.06, 0);
      this.pelvis.add(hipJoint);

      // Muscular scaly thigh (Smooth Capsule)
      const thigh = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.088, 0.22, 6, 12),
        greenScalyMat
      );
      thigh.position.y = -0.20;
      hipJoint.add(thigh);

      // Muscular scaly calf (Smooth Capsule)
      const calf = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.076, 0.22, 6, 12),
        greenScalyMat
      );
      calf.position.set(0, -0.42, 0);
      hipJoint.add(calf);

      // Purple pointed elf boot with curled-upward toe tip!
      const boot = new THREE.Mesh(
        new THREE.BoxGeometry(0.13, 0.16, 0.26),
        purpleMat
      );
      boot.position.set(0, -0.60, 0.04);
      hipJoint.add(boot);

      // Curled upward pointed toe
      const curledToe = new THREE.Mesh(
        new THREE.ConeGeometry(0.06, 0.18, 6),
        purpleMat
      );
      curledToe.position.set(0, -0.64, 0.22);
      curledToe.rotation.x = -Math.PI / 4;
      hipJoint.add(curledToe);
    });

    // Enable real-time soft shadow casting & receiving on character meshes
    this.root.traverse(child => {
      if (child.isMesh && child !== this.auraMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Dynamic Menacing Comic Flight Pose
    this.arms.left.upperArm.rotation.set(-0.55, 0, 0.45);
    this.arms.left.forearm.rotation.set(0.45, 0, 0);
    this.arms.right.upperArm.rotation.set(-0.75, 0.2, -0.35); // Ready to lob the pumpkin bomb!
    this.arms.right.forearm.rotation.set(0.65, 0, 0);
    this.torso.rotation.x = 0.22; // Leaning into the wind
  }

  setPosition(worldPos) {
    this.root.position.copy(worldPos);
    this.root.position.y = this.baseY;
  }

  // Full 3D kidnapping sequence with real-time camera tracking callback
  triggerKidnapping(targetMJ, destinationWorldPos, onComplete, onFlightUpdate) {
    if (this.isKidnapping) return;
    this.isKidnapping = true;

    // 1. Cackle & React
    this.audioManager.playGoblinLaugh();
    this.comicFX.spawnAt(this.root.position, 'HAHAHA!', '#8e44ad', '#fde047', 1.8);
    this.comicFX.showBanner('GREEN GOBLIN HOVERBOARD KIDNAPPING!');

    this.head.rotation.x = -0.4;
    this.arms.left.upperArm.rotation.set(-1.2, 0, 0.7);
    this.arms.right.upperArm.rotation.set(-1.2, 0, -0.7);

    setTimeout(() => {
      // 2. Scoop MJ onto hoverboard
      const originalGoblinPos = this.root.position.clone();

      targetMJ.animator.setState('kidnapped');
      this.audioManager.playGliderRoar(3.5);

      const flightDuration = 3.4; // 3.4 seconds for a clear, suspenseful flight
      const startTime = performance.now();

      // Parabolic flight arc
      const peakY = 12.0;
      const midPoint = new THREE.Vector3()
        .addVectors(originalGoblinPos, destinationWorldPos)
        .multiplyScalar(0.5);
      midPoint.y = peakY;

      const curve = new THREE.QuadraticBezierCurve3(
        originalGoblinPos.clone(),
        midPoint,
        new THREE.Vector3(destinationWorldPos.x, this.baseY, destinationWorldPos.z)
      );

      const animateFlight = () => {
        const now = performance.now();
        const progress = (now - startTime) / (flightDuration * 1000);

        if (progress < 1.0) {
          const currentPos = curve.getPoint(progress);
          this.root.position.copy(currentPos);

          const tangent = curve.getTangent(progress);
          this.root.lookAt(currentPos.clone().add(tangent));
          this.gliderGroup.rotation.z = Math.sin(progress * Math.PI * 2) * 0.45;

          // MJ is visibly hanging/carried under the glider
          targetMJ.root.position.copy(currentPos);
          targetMJ.root.position.y -= 0.7;
          targetMJ.root.rotation.copy(this.root.rotation);

          // Update camera in real time so the user sees the flight and destination!
          if (onFlightUpdate) {
            onFlightUpdate(currentPos, destinationWorldPos, progress);
          }

          requestAnimationFrame(animateFlight);
        } else {
          // 3. Touchdown! Drop MJ safely onto destination tile
          this.root.position.set(destinationWorldPos.x, this.baseY + 0.8, destinationWorldPos.z);
          targetMJ.root.position.set(destinationWorldPos.x, 0.1, destinationWorldPos.z);
          targetMJ.root.rotation.set(0, 0, 0);
          targetMJ.animator.setState('idle');

          this.comicFX.spawnAt(destinationWorldPos, 'BONK!', '#f97316', '#ffffff', 2.2);
          this.audioManager.playFootstep();

          // Camera locks onto the destination tile so player clearly sees where MJ was taken!
          if (onFlightUpdate) {
            onFlightUpdate(destinationWorldPos, destinationWorldPos, 1.0);
          }

          // 4. Hold for 1.4 seconds so the player clearly sees the destination tile & landing
          setTimeout(() => {
            this.audioManager.playGoblinLaugh();
            this.returnToPost(originalGoblinPos, onComplete);
          }, 1400);
        }
      };

      requestAnimationFrame(animateFlight);
    }, 600);
  }

  returnToPost(originalPos, onComplete) {
    const startPos = this.root.position.clone();
    const returnDuration = 1.2;
    const startTime = performance.now();

    const animateReturn = () => {
      const now = performance.now();
      const progress = (now - startTime) / (returnDuration * 1000);

      if (progress < 1.0) {
        const t = Math.sin(progress * Math.PI / 2);
        const p = new THREE.Vector3().lerpVectors(startPos, originalPos, t);
        p.y += Math.sin(progress * Math.PI) * 4.5;
        this.root.position.copy(p);
        this.root.lookAt(originalPos.x, p.y, originalPos.z);

        requestAnimationFrame(animateReturn);
      } else {
        this.root.position.copy(originalPos);
        this.root.rotation.set(0, 0, 0);
        this.gliderGroup.rotation.set(0, 0, 0);
        this.head.rotation.set(0, 0, 0);
        this.arms.left.upperArm.rotation.set(-0.55, 0, 0.45);
        this.arms.left.forearm.rotation.set(0.45, 0, 0);
        this.arms.right.upperArm.rotation.set(-0.75, 0.2, -0.35);
        this.arms.right.forearm.rotation.set(0.65, 0, 0);
        this.torso.rotation.x = 0.22;
        this.isKidnapping = false;

        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(animateReturn);
  }

  update(delta) {
    if (this.isKidnapping) return;

    this.hoverTime += delta * 2.5;
    const bob = Math.sin(this.hoverTime) * 0.12;
    const tilt = Math.cos(this.hoverTime * 0.8) * 0.08;

    this.root.position.y = this.baseY + bob;
    this.gliderGroup.rotation.x = tilt;
    this.gliderGroup.rotation.z = -tilt * 0.8;

    // Pulse plasma thrusters
    if (this.thrusters) {
      this.thrusters.forEach((t, idx) => {
        const pulse = 1.0 + Math.sin(this.hoverTime * 14 + idx * Math.PI) * 0.2;
        t.scale.set(pulse, pulse, 1.0 + pulse * 0.3);
      });
    }

    // Animate pulsating hoverboard electromagnetic energy aura field
    if (this.auraMesh && this.auraMat) {
      const auraPulse = 1.0 + Math.sin(this.hoverTime * 6.0) * 0.12;
      this.auraMesh.scale.set(auraPulse, auraPulse, 1.0);
      this.auraMat.opacity = 0.65 + Math.sin(this.hoverTime * 8.0) * 0.25;
      this.auraMesh.rotation.z = Math.sin(this.hoverTime * 2.0) * 0.08;
    }

    // Flicker rocket jet exhaust flames
    if (this.flames) {
      this.flames.forEach((flame, idx) => {
        const flameNoise = 0.85 + Math.sin(this.hoverTime * 28 + idx * 7) * 0.35;
        flame.scale.set(1.0, 1.0, flameNoise);
        flame.material.opacity = 0.75 + Math.sin(this.hoverTime * 20 + idx) * 0.2;
      });
    }

    // Pulse volcanic orange pumpkin bomb glow
    if (this.pumpkinBomb && this.pumpkinBomb.children[0]) {
      this.pumpkinBomb.children[0].material.emissiveIntensity = 1.0 + Math.sin(this.hoverTime * 5) * 0.4;
    }
  }
}
