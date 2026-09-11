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

  buildModel() {
    // --- Masterpiece Cinematic Oscorp Combat Materials ---
    const armorEmeraldMat = new THREE.MeshStandardMaterial({
      color: 0x047857,
      roughness: 0.24,
      metalness: 0.86,
      emissive: 0x064e3b,
      emissiveIntensity: 0.12
    });

    const armorAccentMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.8
    });

    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.25,
      metalness: 0.92
    });

    const eyeGlowMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.6,
      roughness: 0.1
    });

    const teethMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.15,
      metalness: 0.95
    });

    const gliderChassisMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.28,
      metalness: 0.85
    });

    const gliderChromeMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.18,
      metalness: 0.92
    });

    const plasmaGlowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8
    });

    const pumpkinMat = new THREE.MeshStandardMaterial({
      color: 0xea580c,
      emissive: 0xf97316,
      emissiveIntensity: 1.2,
      roughness: 0.35
    });

    // --- 1. HIGH-TECH OSCORP BAT-GLIDER ---
    this.gliderGroup = new THREE.Group();
    this.gliderGroup.position.y = 0.25;
    this.root.add(this.gliderGroup);

    // Aerodynamic central fuselage
    const fuselage = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.14, 1.5),
      gliderChassisMat
    );
    fuselage.position.set(0, 0, 0.1);
    this.gliderGroup.add(fuselage);

    // Front ram / nose cone
    const nose = new THREE.Mesh(
      new THREE.ConeGeometry(0.35, 0.6, 4),
      gliderChassisMat
    );
    nose.rotation.x = Math.PI / 2;
    nose.rotation.y = Math.PI / 4;
    nose.position.set(0, 0, 1.05);
    this.gliderGroup.add(nose);

    // Twin forward cutting blades (titanium chrome)
    [-1, 1].forEach(side => {
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.18, 0.7),
        gliderChromeMat
      );
      blade.position.set(side * 0.28, -0.02, 1.1);
      blade.rotation.x = 0.2;
      this.gliderGroup.add(blade);
    });

    // Swept-Back Aggressive Bat-Wings
    [-1, 1].forEach(side => {
      const wingRoot = new THREE.Group();
      wingRoot.position.set(side * 0.35, 0, 0);
      this.gliderGroup.add(wingRoot);

      // Main swept wing blade
      const wing = new THREE.Mesh(
        new THREE.BoxGeometry(1.05, 0.06, 0.9),
        gliderChassisMat
      );
      wing.position.set(side * 0.52, 0.02, -0.12);
      wing.rotation.y = side * 0.28;
      wing.rotation.z = side * -0.12;
      wingRoot.add(wing);

      // Polished leading edge blade
      const leadingEdge = new THREE.Mesh(
        new THREE.BoxGeometry(1.08, 0.05, 0.12),
        gliderChromeMat
      );
      leadingEdge.position.set(side * 0.52, 0.03, 0.28);
      leadingEdge.rotation.y = side * 0.28;
      leadingEdge.rotation.z = side * -0.12;
      wingRoot.add(leadingEdge);

      // Angled stabilizing wingtip fin
      const tipFin = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.32, 0.65),
        gliderChromeMat
      );
      tipFin.position.set(side * 1.18, 0.12, -0.22);
      tipFin.rotation.z = side * 0.25;
      wingRoot.add(tipFin);
    });

    // Dual Plasma Jet Turbines (Rear)
    this.thrusters = [];
    [-1, 1].forEach(side => {
      const engineCowl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.16, 0.55, 12),
        gliderChassisMat
      );
      engineCowl.rotation.x = Math.PI / 2;
      engineCowl.position.set(side * 0.26, 0.02, -0.72);
      this.gliderGroup.add(engineCowl);

      const nozzleRing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.145, 0.145, 0.08, 12),
        goldTrimMat
      );
      nozzleRing.rotation.x = Math.PI / 2;
      nozzleRing.position.set(side * 0.26, 0.02, -0.98);
      this.gliderGroup.add(nozzleRing);

      // Glowing plasma exhaust core
      const plasma = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.06, 0.22, 10),
        plasmaGlowMat
      );
      plasma.rotation.x = Math.PI / 2;
      plasma.position.set(side * 0.26, 0.02, -1.08);
      this.gliderGroup.add(plasma);
      this.thrusters.push(plasma);
    });

    // Magnetic Foot Clamps
    [-1, 1].forEach(side => {
      const clamp = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.06, 0.36),
        goldTrimMat
      );
      clamp.position.set(side * 0.22, 0.10, 0.12);
      this.gliderGroup.add(clamp);
    });

    // --- 2. NORMAN OSBORN OSCORP FLIGHT SUIT ---
    this.goblinBody = new THREE.Group();
    this.goblinBody.position.y = 0.15;
    this.gliderGroup.add(this.goblinBody);

    // Armored Pelvis & Belt
    this.pelvis = new THREE.Group();
    this.pelvis.position.y = 0.88;
    this.goblinBody.add(this.pelvis);

    const armoredHips = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.20, 0.22, 8),
      armorEmeraldMat
    );
    this.pelvis.add(armoredHips);

    const utilityBelt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.245, 0.245, 0.06, 8),
      goldTrimMat
    );
    utilityBelt.position.y = 0.09;
    this.pelvis.add(utilityBelt);

    // Torso with Sculpted Muscular Exoskeleton
    this.torso = new THREE.Group();
    this.torso.position.y = 0.16;
    this.pelvis.add(this.torso);

    // Segmented waist
    const waist = new THREE.Mesh(
      new THREE.CylinderGeometry(0.23, 0.22, 0.18, 8),
      armorAccentMat
    );
    waist.position.y = 0.09;
    this.torso.add(waist);

    // Muscular emerald chestplate
    const chestPlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.50, 0.34, 0.32),
      armorEmeraldMat
    );
    chestPlate.position.set(0, 0.26, 0.02);
    this.torso.add(chestPlate);

    // Oscorp crest emblem on sternum
    const crest = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.14, 4),
      goldTrimMat
    );
    crest.position.set(0, 0.28, 0.19);
    crest.rotation.z = Math.PI;
    this.torso.add(crest);

    // --- 3. MENACING OSCORP BATTLE MASK & HELMET ---
    this.head = new THREE.Group();
    this.head.position.y = 0.52;
    this.torso.add(this.head);

    // Sculpted armored helmet dome
    const helmetDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.20, 12, 12),
      armorEmeraldMat
    );
    helmetDome.scale.set(0.95, 1.15, 1.05);
    this.head.add(helmetDome);

    // Aerodynamic swept-back helmet fins (horns)
    [-1, 1].forEach(side => {
      const fin = new THREE.Mesh(
        new THREE.ConeGeometry(0.06, 0.38, 6),
        armorEmeraldMat
      );
      fin.position.set(side * 0.14, 0.14, -0.12);
      fin.rotation.x = -0.7;
      fin.rotation.z = side * -0.28;
      this.head.add(fin);
    });

    // Brow guard
    const brow = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.06, 0.12),
      armorEmeraldMat
    );
    brow.position.set(0, 0.08, 0.18);
    brow.rotation.x = 0.25;
    this.head.add(brow);

    // Glowing menacing amber slit eye lenses
    [-1, 1].forEach(side => {
      const eyeLense = new THREE.Mesh(
        new THREE.BoxGeometry(0.09, 0.045, 0.03),
        eyeGlowMat
      );
      eyeLense.position.set(side * 0.08, 0.04, 0.19);
      eyeLense.rotation.z = side * 0.35;
      eyeLense.rotation.y = side * 0.22;
      this.head.add(eyeLense);
    });

    // Menacing jagged razor teeth grille
    const mouthGrille = new THREE.Mesh(
      new THREE.BoxGeometry(0.20, 0.06, 0.08),
      teethMat
    );
    mouthGrille.position.set(0, -0.09, 0.17);
    this.head.add(mouthGrille);

    // Tapered predatory jawline
    const jaw = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.18, 6),
      armorEmeraldMat
    );
    jaw.position.set(0, -0.14, 0.08);
    jaw.rotation.x = Math.PI - 0.2;
    this.head.add(jaw);

    // --- 4. ARMORED SHOULDERS & GAUNTLETS WITH PUMPKIN BOMB ---
    this.arms = {};
    [-1, 1].forEach(side => {
      const isLeft = side === -1;
      const key = isLeft ? 'left' : 'right';

      const shoulder = new THREE.Group();
      shoulder.position.set(side * 0.32, 0.36, 0);
      this.torso.add(shoulder);

      // Armored pauldron
      const pauldron = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 8, 8),
        goldTrimMat
      );
      pauldron.scale.set(1.1, 0.9, 1.2);
      shoulder.add(pauldron);

      const upperArm = new THREE.Group();
      shoulder.add(upperArm);
      const upperMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.075, 0.065, 0.30, 8),
        armorEmeraldMat
      );
      upperMesh.position.y = -0.15;
      upperArm.add(upperMesh);

      const forearm = new THREE.Group();
      forearm.position.y = -0.30;
      upperArm.add(forearm);

      const foreMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.06, 0.28, 8),
        armorEmeraldMat
      );
      foreMesh.position.y = -0.14;
      forearm.add(foreMesh);

      // Gauntlet blade fin
      const armBlade = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.16, 0.10),
        goldTrimMat
      );
      armBlade.position.set(side * 0.08, -0.14, -0.04);
      forearm.add(armBlade);

      const fist = new THREE.Mesh(
        new THREE.SphereGeometry(0.058, 8, 8),
        armorAccentMat
      );
      fist.position.y = -0.30;
      forearm.add(fist);

      // --- GLOWING PUMPKIN BOMB IN RIGHT HAND ---
      if (!isLeft) {
        this.pumpkinBomb = new THREE.Group();
        this.pumpkinBomb.position.set(0, -0.35, 0.08);
        forearm.add(this.pumpkinBomb);

        const pumpkinSphere = new THREE.Mesh(
          new THREE.SphereGeometry(0.13, 12, 12),
          pumpkinMat
        );
        this.pumpkinBomb.add(pumpkinSphere);

        // Jack-o'-lantern carved eyes
        [-1, 1].forEach(pSide => {
          const pEye = new THREE.Mesh(
            new THREE.ConeGeometry(0.03, 0.04, 3),
            eyeGlowMat
          );
          pEye.position.set(pSide * 0.05, 0.03, 0.12);
          pEye.rotation.x = Math.PI / 2;
          this.pumpkinBomb.add(pEye);
        });

        // Wicked carved pumpkin grin
        const pMouth = new THREE.Mesh(
          new THREE.BoxGeometry(0.09, 0.025, 0.03),
          eyeGlowMat
        );
        pMouth.position.set(0, -0.04, 0.12);
        this.pumpkinBomb.add(pMouth);

        // Metallic stem
        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.025, 0.06, 6),
          goldTrimMat
        );
        stem.position.y = 0.14;
        this.pumpkinBomb.add(stem);
      }

      this.arms[key] = { shoulder, upperArm, forearm };
    });

    // --- 5. ARMORED COMBAT LEGS LOCKED TO GLIDER ---
    [-1, 1].forEach(side => {
      const hipJoint = new THREE.Group();
      hipJoint.position.set(side * 0.16, -0.06, 0);
      this.pelvis.add(hipJoint);

      const thigh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.095, 0.08, 0.40, 8),
        armorEmeraldMat
      );
      thigh.position.y = -0.20;
      hipJoint.add(thigh);

      const calf = new THREE.Mesh(
        new THREE.CylinderGeometry(0.085, 0.075, 0.42, 8),
        armorEmeraldMat
      );
      calf.position.set(0, -0.42, 0);
      hipJoint.add(calf);

      // Armored boots clamped to glider
      const boot = new THREE.Mesh(
        new THREE.BoxGeometry(0.13, 0.09, 0.26),
        armorAccentMat
      );
      boot.position.set(0, -0.64, 0.04);
      hipJoint.add(boot);
    });

    // Combat Aggressive Hover Pose
    this.arms.left.upperArm.rotation.set(-0.55, 0, 0.45);
    this.arms.left.forearm.rotation.set(0.45, 0, 0);
    this.arms.right.upperArm.rotation.set(-0.75, 0.2, -0.35); // Primed to throw pumpkin bomb!
    this.arms.right.forearm.rotation.set(0.65, 0, 0);
    this.torso.rotation.x = 0.22; // Leaning forward aggressively into the flight

    // Glowing hazardous perimeter ground ring
    const hazardRing = new THREE.Mesh(
      new THREE.RingGeometry(0.85, 1.1, 24),
      new THREE.MeshBasicMaterial({
        color: 0x10b981,
        side: THREE.DoubleSide
      })
    );
    hazardRing.rotation.x = -Math.PI / 2;
    hazardRing.position.y = 0.03;
    this.root.add(hazardRing);
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
          // 3. Drop MJ onto destination tile
          targetMJ.root.position.set(destinationWorldPos.x, 0.1, destinationWorldPos.z);
          targetMJ.root.rotation.set(0, 0, 0);
          targetMJ.animator.setState('idle');

          this.comicFX.spawnAt(destinationWorldPos, 'BONK!', '#f97316', '#ffffff', 1.8);
          this.audioManager.playFootstep();

          // 4. Return to post
          this.returnToPost(originalGoblinPos, onComplete, onFlightUpdate);
        }
      };

      requestAnimationFrame(animateFlight);
    }, 600);
  }

  returnToPost(originalPos, onComplete, onFlightUpdate) {
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

        if (onFlightUpdate) {
          onFlightUpdate(p, originalPos, progress);
        }

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

    // Pulse volcanic orange pumpkin bomb glow
    if (this.pumpkinBomb && this.pumpkinBomb.children[0]) {
      this.pumpkinBomb.children[0].material.emissiveIntensity = 1.0 + Math.sin(this.hoverTime * 5) * 0.4;
    }
  }
}
