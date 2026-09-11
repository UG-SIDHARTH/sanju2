// ==========================================================================
// GREEN GOBLIN - 6 Goblins on Gliders (High-Visibility & Fast Performance)
// Crystal-Clear Aerial Kidnapping Sequence
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
    // High-performance, high-contrast materials
    const skinMat = new THREE.MeshLambertMaterial({ color: 0x16a34a }); // Emerald green
    const purpleMat = new THREE.MeshLambertMaterial({ color: 0x7e22ce }); // Royal purple
    const gliderMat = new THREE.MeshLambertMaterial({ color: 0x334155 }); // Slate dark metal
    const thrusterGlowMat = new THREE.MeshBasicMaterial({ color: 0xf97316 }); // Orange jet
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xfde047 }); // Sinister yellow

    // --- 1. THE HOVERBOARD / GLIDER ---
    this.gliderGroup = new THREE.Group();
    this.gliderGroup.position.y = 0.2;
    this.root.add(this.gliderGroup);

    // Main glider body
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.12, 1.4), gliderMat);
    this.gliderGroup.add(body);

    // Bat-wings (swept back)
    [-1, 1].forEach(side => {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.8), gliderMat);
      wing.position.set(side * 0.7, 0.02, -0.1);
      wing.rotation.y = side * 0.25;
      wing.rotation.z = side * -0.15;
      this.gliderGroup.add(wing);

      const tip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.5), gliderMat);
      tip.position.set(side * 1.15, 0.05, -0.2);
      this.gliderGroup.add(tip);
    });

    // Dual Jet Thrusters (Rear)
    this.thrusters = [];
    [-1, 1].forEach(side => {
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.4, 8), gliderMat);
      tube.rotation.x = Math.PI / 2;
      tube.position.set(side * 0.25, 0.02, -0.7);
      this.gliderGroup.add(tube);

      const glow = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.1, 8), thrusterGlowMat);
      glow.rotation.x = Math.PI / 2;
      glow.position.set(side * 0.25, 0.02, -0.9);
      this.gliderGroup.add(glow);
      this.thrusters.push(glow);
    });

    // --- 2. GREEN GOBLIN BODY ---
    this.goblinBody = new THREE.Group();
    this.goblinBody.position.y = 0.2;
    this.gliderGroup.add(this.goblinBody);

    this.pelvis = new THREE.Group();
    this.pelvis.position.y = 0.85;
    this.goblinBody.add(this.pelvis);

    const hip = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.2, 8), purpleMat);
    this.pelvis.add(hip);

    this.torso = new THREE.Group();
    this.torso.position.y = 0.15;
    this.pelvis.add(this.torso);

    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.46, 0.28), skinMat);
    chest.position.y = 0.23;
    this.torso.add(chest);

    const vest = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.35, 0.3), purpleMat);
    vest.position.y = 0.22;
    this.torso.add(vest);

    // Head
    this.head = new THREE.Group();
    this.head.position.y = 0.58;
    this.torso.add(this.head);

    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.19, 10, 10), skinMat);
    headMesh.scale.set(0.9, 1.15, 0.95);
    this.head.add(headMesh);

    // Purple cowl hat
    const cowl = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.4, 8), purpleMat);
    cowl.position.set(0, 0.18, -0.1);
    cowl.rotation.x = -0.6;
    this.head.add(cowl);

    // Pointed ears
    [-1, 1].forEach(side => {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 6), skinMat);
      ear.position.set(side * 0.2, 0.05, -0.05);
      ear.rotation.z = side * -1.1;
      this.head.add(ear);
    });

    // Sinister yellow eyes
    [-1, 1].forEach(side => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), eyeMat);
      eye.position.set(side * 0.07, 0.04, 0.17);
      this.head.add(eye);
    });

    // Arms
    this.arms = {};
    [-1, 1].forEach(side => {
      const isLeft = side === -1;
      const key = isLeft ? 'left' : 'right';

      const shoulder = new THREE.Group();
      shoulder.position.set(side * 0.28, 0.38, 0);
      this.torso.add(shoulder);

      const upperArm = new THREE.Group();
      shoulder.add(upperArm);
      const upperMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.3, 6), skinMat);
      upperMesh.position.y = -0.15;
      upperArm.add(upperMesh);

      const forearm = new THREE.Group();
      forearm.position.y = -0.3;
      upperArm.add(forearm);
      const foreMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.26, 6), skinMat);
      foreMesh.position.y = -0.13;
      forearm.add(foreMesh);

      const claw = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 6), purpleMat);
      claw.position.y = -0.28;
      forearm.add(claw);

      this.arms[key] = { shoulder, upperArm, forearm };
    });

    // Legs
    [-1, 1].forEach(side => {
      const hipJoint = new THREE.Group();
      hipJoint.position.set(side * 0.16, -0.05, 0);
      this.pelvis.add(hipJoint);

      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.4, 6), skinMat);
      thigh.position.y = -0.2;
      hipJoint.add(thigh);

      const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.38, 6), purpleMat);
      calf.position.set(0, -0.4, 0);
      hipJoint.add(calf);
    });

    this.arms.left.upperArm.rotation.set(-0.3, 0, 0.4);
    this.arms.right.upperArm.rotation.set(-0.3, 0, -0.4);
    this.torso.rotation.x = 0.15;

    // Menacing hazard ring on tile
    const hazardRing = new THREE.Mesh(
      new THREE.RingGeometry(0.8, 1.0, 16),
      new THREE.MeshBasicMaterial({ color: 0xa855f7, side: THREE.DoubleSide })
    );
    hazardRing.rotation.x = -Math.PI / 2;
    hazardRing.position.y = 0.03;
    this.root.add(hazardRing);
  }

  setPosition(worldPos) {
    this.root.position.copy(worldPos);
    this.root.position.y = this.baseY;
  }

  // Clear, unmistakable kidnapping sequence:
  // Catches MJ -> soars into sky with glider -> flies to random destination tile -> drops MJ -> flies back!
  triggerKidnapping(targetMJ, destinationWorldPos, onComplete) {
    if (this.isKidnapping) return;
    this.isKidnapping = true;

    // 1. Cackle & React
    this.audioManager.playGoblinLaugh();
    this.comicFX.spawnAt(this.root.position, 'HAHAHA!', '#8e44ad', '#fde047', 1.8);
    this.comicFX.showBanner('GREEN GOBLIN HOVERBOARD KIDNAPPING!');

    // Head cackle pose
    this.head.rotation.x = -0.4;
    this.arms.left.upperArm.rotation.set(-1.2, 0, 0.7);
    this.arms.right.upperArm.rotation.set(-1.2, 0, -0.7);

    setTimeout(() => {
      // 2. Scoop MJ onto hoverboard
      const originalGoblinPos = this.root.position.clone();

      targetMJ.animator.setState('kidnapped');
      this.audioManager.playGliderRoar(3.2);

      const flightDuration = 3.2; // 3.2 seconds of clearly visible flight
      const startTime = performance.now();

      // Parabolic flight arc
      const peakY = 11.0;
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

          // MJ is visibly hanging/carried under the glider!
          targetMJ.root.position.copy(currentPos);
          targetMJ.root.position.y -= 0.7; // Suspended visibly in mid-air
          targetMJ.root.rotation.copy(this.root.rotation);

          requestAnimationFrame(animateFlight);
        } else {
          // 3. Drop MJ onto destination tile!
          targetMJ.root.position.set(destinationWorldPos.x, 0.1, destinationWorldPos.z);
          targetMJ.root.rotation.set(0, 0, 0);
          targetMJ.animator.setState('idle');

          this.comicFX.spawnAt(destinationWorldPos, 'BONK!', '#f97316', '#ffffff', 1.6);
          this.audioManager.playFootstep();

          // 4. Return to post
          this.returnToPost(originalGoblinPos, onComplete);
        }
      };

      requestAnimationFrame(animateFlight);
    }, 600);
  }

  returnToPost(originalPos, onComplete) {
    const startPos = this.root.position.clone();
    const returnDuration = 1.4;
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
        this.arms.left.upperArm.rotation.set(-0.3, 0, 0.4);
        this.arms.right.upperArm.rotation.set(-0.3, 0, -0.4);
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
  }
}
