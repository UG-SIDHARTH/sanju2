// ==========================================================================
// SPIDER-MAN - Classic Blue & Red Suit (Fast, High-Visibility, 5 Units)
// Highly Visible 3D Web-Shooter & Physical Reel-In Sequence
// ==========================================================================

import * as THREE from 'three';

export class SpiderMan {
  constructor(scene, spideyId, fixedTileNumber, audioManager, comicFX) {
    this.scene = scene;
    this.id = spideyId;
    this.name = `Spider-Man #${spideyId}`;
    this.fixedTileNumber = fixedTileNumber;
    this.triggerTileNumber = 1;
    this.audioManager = audioManager;
    this.comicFX = comicFX;

    this.root = new THREE.Group();
    this.root.name = `SpiderMan_${spideyId}`;

    this.buildModel();
    this.scene.add(this.root);

    this.webLineMesh = null;
    this.webGlowMesh = null;
    this.webAnchorMesh = null;
    this.animTime = 0;
  }

  buildModel() {
    // High-performance, high-visibility Classic Blue & Red materials
    const redMat = new THREE.MeshLambertMaterial({ color: 0xef4444 });
    const blueMat = new THREE.MeshLambertMaterial({ color: 0x1d4ed8 });
    const blackMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Pelvis
    this.pelvis = new THREE.Group();
    this.pelvis.position.y = 0.95;
    this.root.add(this.pelvis);

    const hip = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.2, 8), blueMat);
    this.pelvis.add(hip);

    // Torso (Red chest with blue side panels)
    this.torso = new THREE.Group();
    this.torso.position.y = 0.15;
    this.pelvis.add(this.torso);

    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.46, 0.28), redMat);
    chest.position.y = 0.23;
    this.torso.add(chest);

    // Blue rib panels
    [-1, 1].forEach(side => {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 0.29), blueMat);
      panel.position.set(side * 0.2, 0.23, 0);
      this.torso.add(panel);
    });

    // Spider emblem
    const spider = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.03), blackMat);
    spider.position.set(0, 0.25, 0.145);
    this.torso.add(spider);

    // Head / Mask
    this.head = new THREE.Group();
    this.head.position.y = 0.58;
    this.torso.add(this.head);

    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), redMat);
    headMesh.scale.set(0.9, 1.1, 0.95);
    this.head.add(headMesh);

    // Big expressive white eye lenses with black rims
    [-1, 1].forEach(side => {
      const rim = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.02), blackMat);
      rim.position.set(side * 0.08, 0.03, 0.175);
      rim.rotation.z = side * 0.35;
      this.head.add(rim);

      const lens = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.045, 0.03), eyeMat);
      lens.position.set(side * 0.08, 0.03, 0.18);
      lens.rotation.z = side * 0.35;
      this.head.add(lens);
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
      const upperMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.065, 0.3, 8), redMat);
      upperMesh.position.y = -0.15;
      upperArm.add(upperMesh);

      const forearm = new THREE.Group();
      forearm.position.y = -0.3;
      upperArm.add(forearm);
      const foreMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.28, 8), blueMat);
      foreMesh.position.y = -0.14;
      forearm.add(foreMesh);

      // Red glove
      const glove = new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.058, 0.14, 8), redMat);
      glove.position.y = -0.2;
      forearm.add(glove);

      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), redMat);
      hand.position.y = -0.28;
      forearm.add(hand);

      this.arms[key] = { shoulder, upperArm, forearm, hand };
    });

    // Legs
    this.legs = {};
    [-1, 1].forEach(side => {
      const isLeft = side === -1;
      const key = isLeft ? 'left' : 'right';

      const hip = new THREE.Group();
      hip.position.set(side * 0.15, -0.05, 0);
      this.pelvis.add(hip);

      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.38, 8), blueMat);
      thigh.position.y = -0.19;
      hip.add(thigh);

      const calfGroup = new THREE.Group();
      calfGroup.position.y = -0.38;
      hip.add(calfGroup);

      const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.38, 8), blueMat);
      calf.position.y = -0.19;
      calfGroup.add(calf);

      // Red boots
      const boot = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.072, 0.24, 8), redMat);
      boot.position.y = -0.25;
      calfGroup.add(boot);

      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.22), redMat);
      foot.position.set(0, -0.38, 0.06);
      calfGroup.add(foot);

      this.legs[key] = { hip, thigh, calfGroup };
    });

    // Heroic superhero perch pose
    this.arms.left.upperArm.rotation.set(0.3, 0, 0.4);
    this.arms.left.forearm.rotation.set(0.8, 0, 0);
    this.arms.right.upperArm.rotation.set(0.3, 0, -0.4);
    this.arms.right.forearm.rotation.set(0.8, 0, 0);

    // Glowing spider web base ring at feet
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(0.75, 0.95, 16),
      new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide })
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.03;
    this.root.add(halo);
  }

  setPosition(worldPos) {
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

  // Shoot thick, ultra-visible 3D web line and reel MJ across the board
  triggerWebPull(targetMJ, onComplete) {
    const mjPos = targetMJ.root.position.clone();

    // 1. Spidey turns sharply toward MJ
    this.root.lookAt(mjPos.x, this.root.position.y, mjPos.z);

    // 2. Raise arm straight out in web-shooter pose
    this.arms.right.upperArm.rotation.set(-1.55, 0, -0.15);
    this.arms.right.forearm.rotation.set(0, 0, 0);

    // Play "THWIP!" sound
    this.audioManager.playThwip();

    // 3. Comic popup & banner
    const spideyHeadPos = this.root.position.clone();
    spideyHeadPos.y += 2.6;
    this.comicFX.spawnAt(spideyHeadPos, 'THWIP!', '#ef4444', '#ffffff', 1.8);
    this.comicFX.showBanner('SPIDER-MAN WEB PULL DEPLOYED!');

    targetMJ.animator.setState('web_pull');

    // 4. Create thick, high-visibility 3D Web Line
    const wristPos = this.getShooterWorldPosition();
    const mjChestPos = mjPos.clone();
    mjChestPos.y += 1.2;

    // Core bright white web line
    const webGeo = new THREE.BufferGeometry().setFromPoints([wristPos, wristPos]);
    const webMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 6,
      transparent: true,
      opacity: 1.0
    });
    this.webLineMesh = new THREE.Line(webGeo, webMat);
    this.scene.add(this.webLineMesh);

    // Glowing cyan web tracer cylinder for maximum visibility
    const glowGeo = new THREE.CylinderGeometry(0.06, 0.06, 1, 6);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    this.webGlowMesh = new THREE.Mesh(glowGeo, glowMat);
    this.scene.add(this.webGlowMesh);

    // Web star impact anchor on MJ's chest
    const anchorGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const anchorMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.webAnchorMesh = new THREE.Mesh(anchorGeo, anchorMat);
    this.scene.add(this.webAnchorMesh);

    let shootProgress = 0;
    const shootDuration = 0.35;
    const startTime = performance.now();

    const animateShoot = () => {
      const now = performance.now();
      shootProgress = (now - startTime) / (shootDuration * 1000);

      if (shootProgress < 1.0) {
        const curEnd = new THREE.Vector3().lerpVectors(wristPos, mjChestPos, shootProgress);
        const curWrist = this.getShooterWorldPosition();

        this.webLineMesh.geometry.setFromPoints([curWrist, curEnd]);
        this.updateWebCylinder(this.webGlowMesh, curWrist, curEnd);
        this.webAnchorMesh.position.copy(curEnd);

        requestAnimationFrame(animateShoot);
      } else {
        // Reached MJ! Start reel-in
        this.startReelIn(targetMJ, onComplete);
      }
    };

    requestAnimationFrame(animateShoot);
  }

  // Update 3D cylinder between two points
  updateWebCylinder(mesh, start, end) {
    const dist = start.distanceTo(end);
    if (dist < 0.01) return;

    mesh.scale.set(1, dist, 1);
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    mesh.position.copy(mid);

    const dir = new THREE.Vector3().subVectors(end, start).normalize();
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  }

  // 5. Spider-Man reels in the web: MJ is physically pulled across the board
  startReelIn(targetMJ, onComplete) {
    this.audioManager.playWebPull();

    const startPos = targetMJ.root.position.clone();
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.root.quaternion);
    const endPos = this.root.position.clone().add(forward.multiplyScalar(1.2));
    endPos.y = startPos.y;

    let pullProgress = 0;
    const pullDuration = 1.6; // 1.6s clearly visible pull
    const startTime = performance.now();

    // Spidey pulling posture
    this.arms.right.upperArm.rotation.set(-0.8, 0.3, -0.2);
    this.pelvis.position.y = 0.85;

    const animatePull = () => {
      const now = performance.now();
      pullProgress = (now - startTime) / (pullDuration * 1000);

      if (pullProgress < 1.0) {
        // Smooth ease-out cubic
        const t = 1 - Math.pow(1 - pullProgress, 3);
        const currentPos = new THREE.Vector3().lerpVectors(startPos, endPos, t);

        targetMJ.root.position.copy(currentPos);
        targetMJ.root.lookAt(this.root.position.x, targetMJ.root.position.y, this.root.position.z);

        const curWrist = this.getShooterWorldPosition();
        const curChest = currentPos.clone();
        curChest.y += 1.2;

        this.webLineMesh.geometry.setFromPoints([curWrist, curChest]);
        this.updateWebCylinder(this.webGlowMesh, curWrist, curChest);
        this.webAnchorMesh.position.copy(curChest);

        requestAnimationFrame(animatePull);
      } else {
        // Arrived at Spider-Man!
        targetMJ.root.position.copy(endPos);
        targetMJ.animator.setState('idle');

        // Clean up web visuals
        this.cleanWeb();

        // Spidey friendly salute
        this.arms.right.upperArm.rotation.set(-1.8, 0, 0.2);
        setTimeout(() => {
          this.arms.right.upperArm.rotation.set(0.3, 0, -0.4);
          this.arms.right.forearm.rotation.set(0.8, 0, 0);
          this.pelvis.position.y = 0.95;
          if (onComplete) onComplete();
        }, 400);
      }
    };

    requestAnimationFrame(animatePull);
  }

  cleanWeb() {
    if (this.webLineMesh) {
      this.scene.remove(this.webLineMesh);
      this.webLineMesh.geometry.dispose();
      this.webLineMesh = null;
    }
    if (this.webGlowMesh) {
      this.scene.remove(this.webGlowMesh);
      this.webGlowMesh.geometry.dispose();
      this.webGlowMesh = null;
    }
    if (this.webAnchorMesh) {
      this.scene.remove(this.webAnchorMesh);
      this.webAnchorMesh.geometry.dispose();
      this.webAnchorMesh = null;
    }
  }

  update(delta) {
    this.animTime += delta;
    if (this.head && !this.webLineMesh) {
      this.head.rotation.y = Math.sin(this.animTime * 1.5) * 0.15;
    }
  }
}
