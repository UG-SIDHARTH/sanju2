// ==========================================================================
// BLACK SPIDER-MAN - Symbiote Suit Hero & Climax Savior
// Sleek Obsidian Black Muscular Suit, Stark White Spider Emblem, White Eye Lenses
// Climax Sequence: Web-swings from skyscrapers -> Defeats Mega Goblin -> Mid-air dive rescue
// ==========================================================================

import * as THREE from 'three';

export class BlackSpiderMan {
  constructor(scene, audioManager, comicFX) {
    this.scene = scene;
    this.audioManager = audioManager;
    this.comicFX = comicFX;

    this.root = new THREE.Group();
    this.root.name = 'BlackSpiderMan_Symbiote';
    this.root.visible = false;

    this.animTime = 0;
    this.webLine = null;

    this.buildModel();
    this.scene.add(this.root);
  }

  buildModel() {
    // 1. Materials
    const suitMat = new THREE.MeshStandardMaterial({
      color: 0x090b10, // Midnight obsidian symbiote black
      roughness: 0.22,
      metalness: 0.45
    });

    const emblemMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // Stark white spider emblem
      roughness: 0.15,
      metalness: 0.1,
      emissive: 0xffffff,
      emissiveIntensity: 0.35
    });

    const eyeMat = new THREE.MeshBasicMaterial({
      color: 0xffffff // Glowing sharp white anime eye lenses
    });

    // 2. Pelvis & Torso
    this.pelvis = new THREE.Group();
    this.pelvis.position.y = 0.95;
    this.root.add(this.pelvis);

    const pelvisMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.2, 0.22, 10),
      suitMat
    );
    this.pelvis.add(pelvisMesh);

    this.torso = new THREE.Group();
    this.torso.position.y = 0.18;
    this.pelvis.add(this.torso);

    const chestMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.26, 0.58, 10),
      suitMat
    );
    chestMesh.position.y = 0.32;
    this.torso.add(chestMesh);

    // Stark White Chest Spider Emblem (Symbiote Icon)
    const emblemChest = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.42, 0.08),
      emblemMat
    );
    emblemChest.position.set(0, 0.34, 0.24);
    this.torso.add(emblemChest);

    // Stark White Back Spider Emblem
    const emblemBack = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.42, 0.08),
      emblemMat
    );
    emblemBack.position.set(0, 0.34, -0.24);
    this.torso.add(emblemBack);

    // 3. Head & Sharp Eye Lenses
    this.head = new THREE.Group();
    this.head.position.y = 0.72;
    this.torso.add(this.head);

    const headMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 12, 12),
      suitMat
    );
    this.head.add(headMesh);

    // Classic Angular White Symbiote Eyes
    [-1, 1].forEach(side => {
      const eye = new THREE.Mesh(
        new THREE.ConeGeometry(0.085, 0.22, 4),
        eyeMat
      );
      eye.position.set(side * 0.085, 0.03, 0.18);
      eye.rotation.z = -side * 0.42;
      eye.rotation.x = 0.2;
      this.head.add(eye);
    });

    // 4. Arms
    this.leftArm = this.buildArm(suitMat, -1);
    this.rightArm = this.buildArm(suitMat, 1);
    this.torso.add(this.leftArm.shoulder);
    this.torso.add(this.rightArm.shoulder);

    // 5. Legs
    this.leftLeg = this.buildLeg(suitMat, -1);
    this.rightLeg = this.buildLeg(suitMat, 1);
    this.pelvis.add(this.leftLeg.hip);
    this.pelvis.add(this.rightLeg.hip);
  }

  buildArm(suitMat, side) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.38, 0.52, 0);

    const upperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.08, 0.38, 8),
      suitMat
    );
    upperArm.position.y = -0.19;
    shoulder.add(upperArm);

    const elbow = new THREE.Group();
    elbow.position.y = -0.38;
    shoulder.add(elbow);

    const forearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.07, 0.35, 8),
      suitMat
    );
    forearm.position.y = -0.17;
    elbow.add(forearm);

    const hand = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.12, 0.08),
      suitMat
    );
    hand.position.y = -0.38;
    elbow.add(hand);

    return { shoulder, upperArm, elbow, forearm, hand };
  }

  buildLeg(suitMat, side) {
    const hip = new THREE.Group();
    hip.position.set(side * 0.15, -0.05, 0);

    const thigh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.1, 0.48, 8),
      suitMat
    );
    thigh.position.y = -0.24;
    hip.add(thigh);

    const knee = new THREE.Group();
    knee.position.y = -0.48;
    hip.add(knee);

    const shin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.095, 0.08, 0.45, 8),
      suitMat
    );
    shin.position.y = -0.22;
    knee.add(shin);

    const foot = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.09, 0.24),
      suitMat
    );
    foot.position.set(0, -0.46, 0.06);
    knee.add(foot);

    return { hip, thigh, knee, shin, foot };
  }

  // --- CLIMAX ACTION 1: SWING INTO SCENE FROM DISTANT BUILDINGS ---
  swingIntoScene(targetCombatPos, onArrived = null) {
    this.root.visible = true;

    // Anchor web to a high skyscraper building in the distance
    const buildingAnchor = new THREE.Vector3(-45, 48, -40);
    const startSwingPos = new THREE.Vector3(-38, 28, -30);
    this.root.position.copy(startSwingPos);

    this.audioManager.playThwip();
    this.comicFX.showBanner('BLACK SPIDER-MAN ENTERS THE MULTIVERSE!');

    // Create 3D Silver Web Strand
    const webGeo = new THREE.BufferGeometry().setFromPoints([buildingAnchor, startSwingPos]);
    const webMat = new THREE.LineBasicMaterial({
      color: 0xf8fafc,
      linewidth: 3,
      transparent: true,
      opacity: 0.95
    });
    this.webLine = new THREE.Line(webGeo, webMat);
    this.scene.add(this.webLine);

    const swingDuration = 1.8;
    const startTime = performance.now();

    // Acrobatic swinging pose
    this.leftArm.shoulder.rotation.set(-1.8, 0.2, 0);
    this.rightLeg.hip.rotation.set(-0.8, 0, 0);
    this.leftLeg.hip.rotation.set(0.6, 0, 0);

    const animateSwing = () => {
      const now = performance.now();
      const p = Math.min(1.0, (now - startTime) / (swingDuration * 1000));

      // Parabolic high-speed pendulum swing arc
      const curPos = new THREE.Vector3().lerpVectors(startSwingPos, targetCombatPos, p);
      curPos.y += Math.sin(p * Math.PI) * -8.0 + (1 - p) * 12.0;
      this.root.position.copy(curPos);
      this.root.lookAt(targetCombatPos.x, targetCombatPos.y, targetCombatPos.z);

      // Update web line endpoint
      if (this.webLine) {
        this.webLine.geometry.setFromPoints([buildingAnchor, curPos]);
      }

      if (p < 1.0) {
        requestAnimationFrame(animateSwing);
      } else {
        // Release web and land in combat stance
        if (this.webLine) {
          this.scene.remove(this.webLine);
          this.webLine.geometry.dispose();
          this.webLine.material.dispose();
          this.webLine = null;
        }

        this.root.position.copy(targetCombatPos);
        this.audioManager.playHeroicCatch();
        this.comicFX.spawnAt(targetCombatPos, 'ARRIVAL!', '#38bdf8', '#ffffff', 2.0);

        if (onArrived) onArrived();
      }
    };

    requestAnimationFrame(animateSwing);
  }

  // --- CLIMAX ACTION 2: ENGAGE & DEFEAT MEGA GREEN GOBLIN ---
  executeCombatSequence(megaGoblin, onVictory = null) {
    const goblinPos = megaGoblin.root.position;

    // Strike 1: Aerial Drop Kick
    this.leftArm.shoulder.rotation.set(-0.5, 0, 0);
    this.rightLeg.hip.rotation.set(-1.6, 0, 0); // Extended drop kick
    this.audioManager.playWebPull();

    setTimeout(() => {
      megaGoblin.takeCombatHit('【破】 SMASH!!');

      // Strike 2: Rapid Web Blast Barrage
      setTimeout(() => {
        this.audioManager.playThwip();
        megaGoblin.takeCombatHit('THWIP! WEB BIND!!');

        // Strike 3: Acrobatic Somersault Glider Knockout
        setTimeout(() => {
          this.audioManager.playGliderSwoop();
          megaGoblin.takeCombatHit('【極】 CRITICAL KNOCKOUT!!');

          // Defeat Mega Goblin!
          megaGoblin.defeatCollapse(() => {
            if (onVictory) onVictory();
          });
        }, 650);
      }, 650);
    }, 500);
  }

  // --- CLIMAX ACTION 3: DIVE AFTER FALLING MJ, CATCH MID-AIR & RESCUE ---
  diveAndRescueMJ(fallingMJ, rooftopTilePos, onRescueComplete = null) {
    const heroStart = this.root.position.clone();
    const diveDuration = 1.1;
    const diveStart = performance.now();

    this.audioManager.playThwip();
    this.comicFX.showBanner('BLACK SPIDER-MAN DIVES FOR THE RESCUE!');

    // Head-first dive pose
    this.torso.rotation.x = 1.4;
    this.leftArm.shoulder.rotation.set(2.8, 0, 0);
    this.rightArm.shoulder.rotation.set(2.8, 0, 0);

    const animateDive = () => {
      const now = performance.now();
      const p = Math.min(1.0, (now - diveStart) / (diveDuration * 1000));

      const targetPos = fallingMJ.root.position.clone();
      this.root.position.lerpVectors(heroStart, targetPos, p * p);
      this.root.lookAt(targetPos.x, targetPos.y, targetPos.z);

      if (p < 1.0) {
        requestAnimationFrame(animateDive);
      } else {
        // CATCH MJ IN MID-AIR!
        this.audioManager.playHeroicCatch();
        this.comicFX.spawnAt(this.root.position, 'GOTCHA!', '#38bdf8', '#ffffff', 2.8);

        // Web sling back upward to victory rooftop podium!
        const slingDuration = 1.7;
        const slingStart = performance.now();
        const midAirPos = this.root.position.clone();
        const safeRoofPos = rooftopTilePos.clone().add(new THREE.Vector3(-0.5, 0.1, 0));

        // Create lifeline web strand back up to rooftop edge
        const anchorPos = safeRoofPos.clone().add(new THREE.Vector3(0, 10, 0));
        const lifelineGeo = new THREE.BufferGeometry().setFromPoints([anchorPos, midAirPos]);
        const lifelineMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3 });
        const lifeline = new THREE.Line(lifelineGeo, lifelineMat);
        this.scene.add(lifeline);

        const animateSlingUp = () => {
          const sNow = performance.now();
          const sp = Math.min(1.0, (sNow - slingStart) / (slingDuration * 1000));
          const easeOut = 1 - Math.pow(1 - sp, 2);

          const curPos = new THREE.Vector3().lerpVectors(midAirPos, safeRoofPos, easeOut);
          curPos.y += Math.sin(sp * Math.PI) * 4.2; // High arc leap back to roof
          this.root.position.copy(curPos);
          this.root.rotation.set(0, 0, 0);

          // MJ held securely in hero's arms
          fallingMJ.root.position.set(curPos.x + 0.5, curPos.y, curPos.z);
          fallingMJ.root.rotation.set(0, 0, 0);

          lifeline.geometry.setFromPoints([anchorPos, curPos]);

          if (sp < 1.0) {
            requestAnimationFrame(animateSlingUp);
          } else {
            // Safe touchdown on Tile 100!
            this.scene.remove(lifeline);
            lifeline.geometry.dispose();
            lifeline.material.dispose();

            this.root.position.copy(safeRoofPos);
            fallingMJ.root.position.set(safeRoofPos.x + 0.9, 0.1, safeRoofPos.z);
            fallingMJ.animator?.setState?.('victory');

            this.audioManager.playVictory();
            this.comicFX.spawnAt(safeRoofPos, 'CHAMPION!', '#f59e0b', '#ffffff', 3.5);

            if (onRescueComplete) onRescueComplete();
          }
        };

        requestAnimationFrame(animateSlingUp);
      }
    };

    requestAnimationFrame(animateDive);
  }

  update(delta) {
    if (!this.root.visible) return;
    this.animTime += delta;

    // Subtle breathing animation when standing
    const breath = Math.sin(this.animTime * 2.5) * 0.012;
    this.pelvis.position.y = 0.95 + breath;
  }
}
