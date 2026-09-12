// ==========================================================================
// MEGA GREEN GOBLIN - Giant Boss Model & Climax Antagonist
// 2.5x Size, Spiked Titanium War-Glider, Glowing Yellow Eyes, Cybernetic Armor
// Climax Sequence: Emerges from Aerial Portal -> "Right into the trap." -> Throws MJ
// ==========================================================================

import * as THREE from 'three';

export class MegaGreenGoblin {
  constructor(scene, audioManager, comicFX) {
    this.scene = scene;
    this.audioManager = audioManager;
    this.comicFX = comicFX;

    this.root = new THREE.Group();
    this.root.name = 'MegaGreenGoblin';
    this.root.visible = false;

    this.animTime = 0;
    this.isFlying = false;

    this.buildModel();
    this.scene.add(this.root);
  }

  buildModel() {
    this.scale = 2.4; // Giant Boss Scale

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Dark emerald scaly skin
      roughness: 0.35,
      metalness: 0.25
    });

    const armorMat = new THREE.MeshStandardMaterial({
      color: 0x581c87, // Deep royal purple cybernetic armor
      roughness: 0.25,
      metalness: 0.75
    });

    const goldSpikeMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.2,
      metalness: 0.85
    });

    const eyeMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a // Intense glowing yellow eyes
    });

    const gliderMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.2,
      metalness: 0.9
    });

    const plasmaMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e // Toxic green thruster plasma
    });

    // 1. Torso & Armor
    this.torso = new THREE.Group();
    this.torso.position.y = 1.3 * this.scale;
    this.root.add(this.torso);

    const chestMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.48 * this.scale, 0.36 * this.scale, 0.95 * this.scale, 8),
      skinMat
    );
    this.torso.add(chestMesh);

    // Purple Chest Carapace Plate
    const chestPlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.75 * this.scale, 0.65 * this.scale, 0.48 * this.scale),
      armorMat
    );
    chestPlate.position.set(0, 0.05 * this.scale, 0.12 * this.scale);
    this.torso.add(chestPlate);

    // Spiked Pauldrons
    [-1, 1].forEach(side => {
      const pauldron = new THREE.Mesh(
        new THREE.SphereGeometry(0.32 * this.scale, 8, 8),
        armorMat
      );
      pauldron.position.set(side * 0.58 * this.scale, 0.35 * this.scale, 0);
      this.torso.add(pauldron);

      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.12 * this.scale, 0.45 * this.scale, 6),
        goldSpikeMat
      );
      spike.position.set(side * 0.62 * this.scale, 0.62 * this.scale, 0);
      spike.rotation.z = -side * 0.35;
      this.torso.add(spike);
    });

    // 2. Head & Menacing Face
    this.head = new THREE.Group();
    this.head.position.y = 0.65 * this.scale;
    this.torso.add(this.head);

    const headMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.34 * this.scale, 10, 10),
      skinMat
    );
    this.head.add(headMesh);

    // Purple Hood
    const hood = new THREE.Mesh(
      new THREE.ConeGeometry(0.42 * this.scale, 0.85 * this.scale, 8),
      armorMat
    );
    hood.position.set(0, 0.35 * this.scale, -0.15 * this.scale);
    hood.rotation.x = -0.45;
    this.head.add(hood);

    // Glowing Yellow Eyes
    [-1, 1].forEach(side => {
      const eye = new THREE.Mesh(
        new THREE.BoxGeometry(0.14 * this.scale, 0.07 * this.scale, 0.08 * this.scale),
        eyeMat
      );
      eye.position.set(side * 0.14 * this.scale, 0.06 * this.scale, 0.28 * this.scale);
      eye.rotation.y = side * 0.25;
      eye.rotation.z = -side * 0.15;
      this.head.add(eye);
    });

    // Wide Wicked Goblin Grin
    const grin = new THREE.Mesh(
      new THREE.TorusGeometry(0.18 * this.scale, 0.035 * this.scale, 6, 12, Math.PI),
      goldSpikeMat
    );
    grin.position.set(0, -0.12 * this.scale, 0.28 * this.scale);
    grin.rotation.x = Math.PI * 0.9;
    this.head.add(grin);

    // Long Pointed Goblin Ears
    [-1, 1].forEach(side => {
      const ear = new THREE.Mesh(
        new THREE.ConeGeometry(0.1 * this.scale, 0.45 * this.scale, 5),
        skinMat
      );
      ear.position.set(side * 0.42 * this.scale, 0.05 * this.scale, -0.05 * this.scale);
      ear.rotation.z = -side * 1.1;
      this.head.add(ear);
    });

    // 3. Arms with Heavy Gauntlets & Claws
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.6 * this.scale, 0.3 * this.scale, 0);
    this.torso.add(this.leftArm);

    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.6 * this.scale, 0.3 * this.scale, 0);
    this.torso.add(this.rightArm);

    [-1, 1].forEach((side, idx) => {
      const armGroup = idx === 0 ? this.leftArm : this.rightArm;

      const upperArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15 * this.scale, 0.14 * this.scale, 0.55 * this.scale, 6),
        skinMat
      );
      upperArm.position.y = -0.25 * this.scale;
      armGroup.add(upperArm);

      const gauntlet = new THREE.Mesh(
        new THREE.BoxGeometry(0.24 * this.scale, 0.5 * this.scale, 0.24 * this.scale),
        armorMat
      );
      gauntlet.position.y = -0.62 * this.scale;
      armGroup.add(gauntlet);

      // Steel Claws
      const claw = new THREE.Mesh(
        new THREE.ConeGeometry(0.08 * this.scale, 0.25 * this.scale, 4),
        goldSpikeMat
      );
      claw.position.y = -0.95 * this.scale;
      armGroup.add(claw);
    });

    // 4. Legs
    this.legs = new THREE.Group();
    this.legs.position.y = 0.65 * this.scale;
    this.root.add(this.legs);

    [-1, 1].forEach(side => {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16 * this.scale, 0.13 * this.scale, 0.7 * this.scale, 6),
        armorMat
      );
      leg.position.set(side * 0.28 * this.scale, 0, 0);
      this.legs.add(leg);

      const boot = new THREE.Mesh(
        new THREE.ConeGeometry(0.18 * this.scale, 0.45 * this.scale, 6),
        skinMat
      );
      boot.position.set(side * 0.28 * this.scale, -0.4 * this.scale, 0.1 * this.scale);
      boot.rotation.x = Math.PI / 2;
      this.legs.add(boot);
    });

    // 5. Heavy Armored Spiked War-Glider (Bat-Wing Platform)
    this.glider = new THREE.Group();
    this.glider.position.y = 0.15 * this.scale;
    this.root.add(this.glider);

    const gliderBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.9 * this.scale, 0.2 * this.scale, 1.8 * this.scale),
      gliderMat
    );
    this.glider.add(gliderBody);

    // Swept Bat Wings
    [-1, 1].forEach(side => {
      const wing = new THREE.Mesh(
        new THREE.BoxGeometry(1.6 * this.scale, 0.08 * this.scale, 0.9 * this.scale),
        gliderMat
      );
      wing.position.set(side * 1.1 * this.scale, 0.05 * this.scale, -0.2 * this.scale);
      wing.rotation.y = -side * 0.35;
      this.glider.add(wing);

      // Wing-tip blades
      const blade = new THREE.Mesh(
        new THREE.ConeGeometry(0.12 * this.scale, 0.7 * this.scale, 4),
        goldSpikeMat
      );
      blade.position.set(side * 1.9 * this.scale, 0.05 * this.scale, 0.2 * this.scale);
      blade.rotation.z = -side * (Math.PI / 2);
      this.glider.add(blade);
    });

    // Dual Thrusters with Green Plasma Flames
    this.thrusters = [];
    [-0.32, 0.32].forEach(tx => {
      const nozzle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16 * this.scale, 0.22 * this.scale, 0.45 * this.scale, 8),
        gliderMat
      );
      nozzle.position.set(tx * this.scale, 0, -0.9 * this.scale);
      nozzle.rotation.x = Math.PI / 2;
      this.glider.add(nozzle);

      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.18 * this.scale, 0.85 * this.scale, 8),
        plasmaMat
      );
      flame.position.set(tx * this.scale, 0, -1.35 * this.scale);
      flame.rotation.x = -Math.PI / 2;
      this.glider.add(flame);
      this.thrusters.push(flame);
    });
  }

  // --- CLIMAX STEP 1: EMERGE FROM AERIAL PORTAL ABOVE TILE 100 ---
  emergeFromPortal(targetHoverPos, onEmerged = null) {
    this.root.visible = true;
    this.isFlying = true;

    // Start high up inside the aerial rift
    const spawnPos = targetHoverPos.clone().add(new THREE.Vector3(0, 10, -6));
    this.root.position.copy(spawnPos);
    this.root.lookAt(targetHoverPos.x, targetHoverPos.y, targetHoverPos.z);

    this.audioManager.playGoblinCackle();

    const duration = 1.6;
    const startTime = performance.now();

    const animateEmerge = () => {
      const now = performance.now();
      const p = Math.min(1.0, (now - startTime) / (duration * 1000));

      const easeOut = 1 - Math.pow(1 - p, 3);
      this.root.position.lerpVectors(spawnPos, targetHoverPos, easeOut);
      this.root.lookAt(targetHoverPos.x, targetHoverPos.y, targetHoverPos.z + 5);

      if (p < 1.0) {
        requestAnimationFrame(animateEmerge);
      } else {
        this.root.position.copy(targetHoverPos);
        if (onEmerged) onEmerged();
      }
    };

    requestAnimationFrame(animateEmerge);
  }

  // --- CLIMAX STEP 2: DRAMATIC QUOTE "Right into the trap." ---
  sayQuote(onDone = null) {
    // Show comic action banner & manga speech balloon
    this.comicFX.showBanner('MEGA GREEN GOBLIN: "Right into the trap."');
    this.comicFX.spawnAt(
      this.root.position.clone().add(new THREE.Vector3(0, 2.8, 0)),
      '"RIGHT INTO THE TRAP."',
      '#22c55e',
      '#ffffff',
      3.2
    );

    this.audioManager.playGoblinCackle();

    setTimeout(() => {
      if (onDone) onDone();
    }, 2200);
  }

  // --- CLIMAX STEP 3: GRAB MJ & THROW HER OFF ROOFTOP INTO VOID ---
  grabAndThrowMJ(playerMJ, onThrown = null) {
    const startHover = this.root.position.clone();
    const mjPos = playerMJ.root.position.clone();
    const roofEdgePos = mjPos.clone().add(new THREE.Vector3(12, 6, 8)); // Over the precipice

    // Swoop down to grab MJ
    const swoopDuration = 1.0;
    const swoopStart = performance.now();

    const animateSwoop = () => {
      const now = performance.now();
      const p = Math.min(1.0, (now - swoopStart) / (swoopDuration * 1000));

      const curPos = new THREE.Vector3().lerpVectors(startHover, mjPos, p);
      curPos.y = Math.max(mjPos.y + 0.8, curPos.y);
      this.root.position.copy(curPos);
      this.root.lookAt(mjPos.x, mjPos.y, mjPos.z);

      if (p < 1.0) {
        requestAnimationFrame(animateSwoop);
      } else {
        // Grab MJ!
        this.comicFX.spawnAt(mjPos, 'SNATCH!', '#ef4444', '#ffffff', 2.0);
        this.audioManager.playGliderSwoop();

        // Carry to rooftop edge
        const carryDuration = 1.4;
        const carryStart = performance.now();

        const animateCarry = () => {
          const cNow = performance.now();
          const cp = Math.min(1.0, (cNow - carryStart) / (carryDuration * 1000));

          const curCarryPos = new THREE.Vector3().lerpVectors(mjPos, roofEdgePos, cp);
          curCarryPos.y += Math.sin(cp * Math.PI) * 4.0;
          this.root.position.copy(curCarryPos);

          playerMJ.root.position.set(curCarryPos.x, curCarryPos.y - 1.2, curCarryPos.z);
          playerMJ.animator?.setState?.('jump');

          if (cp < 1.0) {
            requestAnimationFrame(animateCarry);
          } else {
            // HURL MJ DOWN TOWARDS THE CITY BELOW!
            this.comicFX.spawnAt(this.root.position, 'HURL!', '#e11d48', '#ffffff', 2.5);
            this.audioManager.playSuspenseHeartbeat();

            // MJ begins falling trajectory
            const fallStartTime = performance.now();
            const fallOrigin = playerMJ.root.position.clone();
            const fallTarget = fallOrigin.clone().add(new THREE.Vector3(6, -18, 10));

            const animateMJFall = () => {
              const fNow = performance.now();
              const fp = Math.min(1.0, (fNow - fallStartTime) / 4500);

              playerMJ.root.position.lerpVectors(fallOrigin, fallTarget, fp * fp);
              playerMJ.root.rotation.x += 0.05;
              playerMJ.root.rotation.z += 0.04;

              if (fp < 1.0) {
                requestAnimationFrame(animateMJFall);
              }
            };
            requestAnimationFrame(animateMJFall);

            if (onThrown) onThrown(playerMJ);
          }
        };

        requestAnimationFrame(animateCarry);
      }
    };

    requestAnimationFrame(animateSwoop);
  }

  // --- CLIMAX STEP 4: TAKE DAMAGE HITS FROM BLACK SPIDER-MAN ---
  takeCombatHit(hitWord = 'SMASH!') {
    this.comicFX.spawnAt(
      this.root.position.clone().add(new THREE.Vector3(0, 1.5, 0)),
      hitWord,
      '#e11d48',
      '#ffffff',
      2.0
    );
    this.audioManager.playHeroicCatch();

    // Recoil stagger animation
    const origPos = this.root.position.clone();
    this.root.position.x += (Math.random() - 0.5) * 1.5;
    this.root.position.y += (Math.random() - 0.5) * 0.8;
    this.root.rotation.z += (Math.random() - 0.5) * 0.4;

    setTimeout(() => {
      this.root.position.copy(origPos);
      this.root.rotation.set(0, 0, 0);
    }, 250);
  }

  // --- CLIMAX STEP 5: DEFEAT & CRASH INTO SKYLINE ---
  defeatCollapse(onDefeated = null) {
    this.audioManager.playVictory();
    this.comicFX.spawnAt(this.root.position, 'DEFEATED!', '#f59e0b', '#ffffff', 3.0);

    const defeatStart = performance.now();
    const defeatDuration = 2.0;
    const startPos = this.root.position.clone();

    const animateCrash = () => {
      const now = performance.now();
      const p = Math.min(1.0, (now - defeatStart) / (defeatDuration * 1000));

      // Spiraling plunge into the city below
      this.root.position.y = startPos.y - p * p * 35;
      this.root.position.x = startPos.x + Math.sin(p * Math.PI * 4) * 4;
      this.root.position.z = startPos.z + Math.cos(p * Math.PI * 4) * 4;
      this.root.rotation.z += 0.25;
      this.root.rotation.x += 0.18;

      if (p < 1.0) {
        requestAnimationFrame(animateCrash);
      } else {
        this.root.visible = false;
        if (onDefeated) onDefeated();
      }
    };

    requestAnimationFrame(animateCrash);
  }

  update(delta) {
    if (!this.root.visible) return;
    this.animTime += delta;

    // Hoverboard dynamic thruster pulsation
    if (this.thrusters) {
      this.thrusters.forEach((t, i) => {
        const flicker = 1.0 + Math.sin(this.animTime * 18 + i * Math.PI) * 0.35;
        t.scale.set(1.0, flicker, 1.0);
      });
    }

    // Natural airborne hover sway
    if (this.isFlying) {
      const bob = Math.sin(this.animTime * 3.2) * 0.15;
      this.glider.position.y = 0.15 * this.scale + bob;
      this.torso.position.y = 1.3 * this.scale + bob;
    }
  }
}
