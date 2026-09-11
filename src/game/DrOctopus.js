// ==========================================================================
// DR. OCTOPUS (DOCTOR OTTO OCTAVIUS) - Iconic Spider-Man Arch-Nemesis
// 4 Articulated Segmented Mechanical Tentacles with 3-Pronged Steel Claws.
// Dramatic ambush sequence at Tile 100: "JUST LIKE I PLANNED!"
// ==========================================================================

import * as THREE from 'three';

export class DrOctopus {
  constructor(scene, audioManager, comicFX) {
    this.scene = scene;
    this.audioManager = audioManager;
    this.comicFX = comicFX;

    this.root = new THREE.Group();
    this.root.name = 'DoctorOctopus';

    this.animTime = 0;
    this.isAbducting = false;

    this.buildModel();
    this.scene.add(this.root);
    this.root.visible = false; // Hidden until Tile 100 is reached!
  }

  buildModel() {
    // --- Materials ---
    // Emerald green trenchcoat & suit
    const suitMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.42,
      metalness: 0.15
    });

    // Dark leather harness & straps
    const harnessMat = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.35,
      metalness: 0.25
    });

    // Titanium / steel mechanical tentacle metal
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.22,
      metalness: 0.85
    });

    // Darker joint metal
    const jointMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.3,
      metalness: 0.75
    });

    // Glowing amber power core rings on tentacles
    const powerCoreMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.6,
      roughness: 0.2
    });

    // Skin & face
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xfbd0b0,
      roughness: 0.6,
      metalness: 0.05
    });

    // Brown bowl-cut hair
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x451a03,
      roughness: 0.45,
      metalness: 0.05
    });

    // Yellow tinted goggles with brass frames
    const goggleFrameMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.25,
      metalness: 0.8
    });
    const goggleLensMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    // --- 1. BODY & COAT ---
    this.bodyGroup = new THREE.Group();
    this.bodyGroup.position.y = 1.0;
    this.root.add(this.bodyGroup);

    // Sturdy torso
    const chest = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.58, 0.38),
      suitMat
    );
    chest.position.y = 0.29;
    this.bodyGroup.add(chest);

    // Coat tails / lower jacket
    const coatTails = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.42, 0.40),
      suitMat
    );
    coatTails.position.y = -0.15;
    this.bodyGroup.add(coatTails);

    // Spinal Harness Backplate (where tentacles connect)
    const backplate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.20, 0.20, 0.42, 8),
      harnessMat
    );
    backplate.position.set(0, 0.30, -0.19);
    backplate.rotation.x = Math.PI / 2;
    this.bodyGroup.add(backplate);

    // Center fusion power core on back
    const backCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.10, 8, 8),
      powerCoreMat
    );
    backCore.position.set(0, 0.30, -0.25);
    this.bodyGroup.add(backCore);

    // --- 2. HEAD & GOGGLES ---
    this.head = new THREE.Group();
    this.head.position.y = 0.68;
    this.bodyGroup.add(this.head);

    const headMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.20, 12, 12),
      skinMat
    );
    headMesh.scale.set(0.95, 1.1, 0.95);
    this.head.add(headMesh);

    // Iconic Otto Octavius bowl-cut hair
    const hairCrown = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 12, 12),
      hairMat
    );
    hairCrown.position.set(0, 0.06, -0.02);
    hairCrown.scale.set(1.05, 1.05, 1.08);
    this.head.add(hairCrown);

    const bangs = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.08, 0.08),
      hairMat
    );
    bangs.position.set(0, 0.12, 0.16);
    this.head.add(bangs);

    // Circular Cybernetic Goggles with yellow tinted lenses
    [-1, 1].forEach(side => {
      const goggleRim = new THREE.Mesh(
        new THREE.TorusGeometry(0.045, 0.012, 8, 16),
        goggleFrameMat
      );
      goggleRim.position.set(side * 0.08, 0.03, 0.18);
      this.head.add(goggleRim);

      const lens = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.015, 8),
        goggleLensMat
      );
      lens.rotation.x = Math.PI / 2;
      lens.position.set(side * 0.08, 0.03, 0.185);
      this.head.add(lens);
    });

    // Sinister sneer mouth
    const mouth = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.025, 0.02),
      harnessMat
    );
    mouth.position.set(0, -0.08, 0.18);
    this.head.add(mouth);

    // --- 3. ARMS & HANDS ---
    this.arms = {};
    [-1, 1].forEach(side => {
      const key = side === -1 ? 'left' : 'right';
      const shoulder = new THREE.Group();
      shoulder.position.set(side * 0.35, 0.46, 0);
      this.bodyGroup.add(shoulder);

      const upperArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.07, 0.32, 8),
        suitMat
      );
      upperArm.position.y = -0.16;
      shoulder.add(upperArm);

      const forearm = new THREE.Group();
      forearm.position.y = -0.32;
      shoulder.add(forearm);

      const foreMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.06, 0.28, 8),
        suitMat
      );
      foreMesh.position.y = -0.14;
      forearm.add(foreMesh);

      const glove = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.10, 0.06),
        harnessMat
      );
      glove.position.y = -0.30;
      forearm.add(glove);

      this.arms[key] = { shoulder, forearm };
    });

    // --- 4. LEGS & BOOTS ---
    [-1, 1].forEach(side => {
      const hip = new THREE.Group();
      hip.position.set(side * 0.18, -0.2, 0);
      this.bodyGroup.add(hip);

      const thigh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.09, 0.45, 8),
        suitMat
      );
      thigh.position.y = -0.22;
      hip.add(thigh);

      const boot = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.40, 0.24),
        harnessMat
      );
      boot.position.set(0, -0.55, 0.04);
      hip.add(boot);
    });

    // --- 5. FOUR GIANT MECHANICAL TENTACLES (ROBOTIC ARMS) ---
    this.tentacles = [];
    const tentacleConfigs = [
      { name: 'upperLeft', rootPos: new THREE.Vector3(-0.25, 0.42, -0.22), isUpper: true, side: -1 },
      { name: 'upperRight', rootPos: new THREE.Vector3(0.25, 0.42, -0.22), isUpper: true, side: 1 },
      { name: 'lowerLeft', rootPos: new THREE.Vector3(-0.24, 0.18, -0.22), isUpper: false, side: -1 },
      { name: 'lowerRight', rootPos: new THREE.Vector3(0.24, 0.18, -0.22), isUpper: false, side: 1 }
    ];

    tentacleConfigs.forEach(tConfig => {
      const tentacle = this.createArticulatedTentacle(
        tConfig,
        metalMat,
        jointMat,
        powerCoreMat
      );
      this.bodyGroup.add(tentacle.root);
      this.tentacles.push(tentacle);
    });

    // Enable soft shadow casting & receiving on all Dr. Octopus meshes
    this.root.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  createArticulatedTentacle(cfg, metalMat, jointMat, powerCoreMat) {
    const root = new THREE.Group();
    root.position.copy(cfg.rootPos);

    const segmentCount = 6;
    const segmentLength = 0.42;
    const joints = [];
    let parentGroup = root;

    for (let i = 0; i < segmentCount; i++) {
      const joint = new THREE.Group();
      if (i > 0) joint.position.y = segmentLength;
      parentGroup.add(joint);

      // Ribbed metallic segment
      const radius = 0.08 - i * 0.007;
      const segMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(radius * 0.9, radius, segmentLength, 8),
        metalMat
      );
      segMesh.position.y = segmentLength * 0.5;
      joint.add(segMesh);

      // Glowing power core ring
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius * 1.05, 0.015, 6, 12),
        powerCoreMat
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = segmentLength * 0.5;
      joint.add(ring);

      // Joint sphere
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(radius * 1.15, 8, 8),
        jointMat
      );
      sphere.position.y = segmentLength;
      joint.add(sphere);

      joints.push(joint);
      parentGroup = joint;
    }

    // Three-Pronged Hydraulic Steel Claw / Pincer at the tip
    const clawGroup = new THREE.Group();
    clawGroup.position.y = segmentLength;
    parentGroup.add(clawGroup);

    // Claw central base
    const clawBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.07, 0.08, 6),
      jointMat
    );
    clawGroup.add(clawBase);

    // Red laser center tracker dot
    const centerLaser = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    centerLaser.position.y = 0.05;
    clawGroup.add(centerLaser);

    // 3 Curved articulated pincer fingers
    const fingers = [];
    for (let f = 0; f < 3; f++) {
      const angle = (f / 3) * Math.PI * 2;
      const fingerRoot = new THREE.Group();
      fingerRoot.position.set(Math.cos(angle) * 0.05, 0.04, Math.sin(angle) * 0.05);
      fingerRoot.rotation.y = angle;
      clawGroup.add(fingerRoot);

      // Tapered claw blade
      const finger = new THREE.Mesh(
        new THREE.ConeGeometry(0.022, 0.22, 4),
        metalMat
      );
      finger.position.set(0, 0.10, 0.04);
      finger.rotation.x = -0.35;
      fingerRoot.add(finger);
      fingers.push(fingerRoot);
    }

    return {
      config: cfg,
      root,
      joints,
      clawGroup,
      fingers
    };
  }

  setPosition(worldPos) {
    this.root.position.copy(worldPos);
  }

  // Menacing organic procedural tentacle coiling and breathing
  update(delta) {
    this.animTime += delta;
    const t = this.animTime;

    if (!this.isAbducting) {
      this.tentacles.forEach((tentacle, idx) => {
        const { config, joints, clawGroup, fingers } = tentacle;
        const phase = t * 2.2 + idx * 1.5;

        if (config.isUpper) {
          // Arching menacingly overhead and forward
          joints.forEach((j, jIdx) => {
            const flex = Math.sin(phase + jIdx * 0.4) * 0.12;
            j.rotation.x = -0.45 + flex;
            j.rotation.z = config.side * (0.25 + Math.cos(phase * 0.8) * 0.1);
          });

          // Claws gently pulsing / opening and closing
          const clawPinch = Math.sin(t * 3.5 + idx) * 0.15;
          fingers.forEach(f => {
            f.rotation.x = clawPinch;
          });
        } else {
          // Lower tentacles supporting his weight on the floor
          joints.forEach((j, jIdx) => {
            const flex = Math.cos(phase + jIdx * 0.3) * 0.08;
            j.rotation.x = 0.35 + flex;
            j.rotation.z = config.side * (0.35 + Math.sin(phase * 0.7) * 0.08);
          });
        }
      });

      // Subtle sinister breathing
      this.head.rotation.y = Math.sin(t * 1.2) * 0.15;
    }
  }

  // --- DRAMATIC TILE 100 AMBUSH & ABDUCTION SEQUENCE ---
  triggerAbduction(targetMJ, onComplete, onCameraUpdate) {
    this.isAbducting = true;
    this.root.visible = true;

    const tilePos = targetMJ.root.position.clone();
    // Start high in the sky above Tile 100
    this.root.position.set(tilePos.x, 14.0, tilePos.z);
    this.root.lookAt(tilePos.x, this.root.position.y, tilePos.z + 10);

    // 1. Play Heavy Mechanical Servos & Hydraulic Clamp
    this.audioManager.playDocOckEmergence();

    // 2. Descend smoothly from the sky onto Tile 100
    const descentDuration = 1.4;
    const descentStart = performance.now();

    const animateDescent = () => {
      const now = performance.now();
      const p = Math.min(1.0, (now - descentStart) / (descentDuration * 1000));

      // Ease out quad
      const t = 1 - Math.pow(1 - p, 2);
      this.root.position.y = THREE.MathUtils.lerp(14.0, 0.2, t);

      if (onCameraUpdate) {
        onCameraUpdate(this.root.position, targetMJ.root.position, p * 0.5);
      }

      if (p < 1.0) {
        requestAnimationFrame(animateDescent);
      } else {
        // Landed on Tile 100!
        this.executeClawGrab(targetMJ, onComplete, onCameraUpdate);
      }
    };

    requestAnimationFrame(animateDescent);
  }

  executeClawGrab(targetMJ, onComplete, onCameraUpdate) {
    // 1. Dramatic Sinister Banner & Speech Bubble: "JUST LIKE I PLANNED"
    this.comicFX.spawnAt(this.root.position, 'JUST LIKE I PLANNED', '#15803d', '#fef08a', 3.0);
    this.comicFX.showBanner('DR. OCTOPUS: "JUST LIKE I PLANNED!"', 3000);
    this.audioManager.playDocOckVoiceChime();

    // 2. Extend Upper & Lower Tentacles to Wrap Around MJ's Waist & Torso!
    const grabDuration = 0.8;
    const grabStart = performance.now();

    const animateGrab = () => {
      const now = performance.now();
      const p = Math.min(1.0, (now - grabStart) / (grabDuration * 1000));

      // Wrap tentacles forward and clamp around MJ
      this.tentacles.forEach(t => {
        if (t.config.isUpper) {
          t.joints.forEach((j, jIdx) => {
            j.rotation.x = THREE.MathUtils.lerp(-0.45, -0.92, p);
            j.rotation.z = THREE.MathUtils.lerp(t.config.side * 0.25, t.config.side * 0.40, p);
          });
          // Clamp steel pincers firmly shut around MJ
          t.fingers.forEach(f => {
            f.rotation.x = THREE.MathUtils.lerp(0, -0.55, p);
          });
        } else {
          // Lower tentacles anchor to ground to prepare for rocket leap
          t.joints.forEach((j, jIdx) => {
            j.rotation.x = THREE.MathUtils.lerp(0.35, 0.65, p);
          });
        }
      });

      if (p < 1.0) {
        requestAnimationFrame(animateGrab);
      } else {
        // Claws firmly clamped! Switch MJ to shocked struggling abducted state
        targetMJ.animator.setState('abducted');
        this.comicFX.spawnAt(targetMJ.root.position, 'CLANK!', '#e62429', '#ffffff', 1.8);
        this.audioManager.playDocOckEmergence();

        setTimeout(() => {
          this.executeAscentAndEscape(targetMJ, onComplete, onCameraUpdate);
        }, 600);
      }
    };

    requestAnimationFrame(animateGrab);
  }

  executeAscentAndEscape(targetMJ, onComplete, onCameraUpdate) {
    // 3. Dr. Octopus and his tentacles lift MJ high into the sky and carry her away
    const escapeDuration = 3.2;
    const escapeStart = performance.now();
    const startY = this.root.position.y;

    const animateEscape = () => {
      const now = performance.now();
      const p = Math.min(1.0, (now - escapeStart) / (escapeDuration * 1000));

      // Ease in cubic for powerful rocket-like tentacle leap into the sky
      const t = p * p * (3 - 2 * p);

      const curY = THREE.MathUtils.lerp(startY, 34.0, t);
      this.root.position.y = curY;
      this.root.position.x += Math.sin(p * Math.PI) * 0.05;

      // Mechanical tentacles hold and carry MJ right in front of Dr. Octopus!
      this.tentacles.forEach(tObj => {
        if (tObj.config.isUpper) {
          tObj.joints.forEach((j, jIdx) => {
            j.rotation.x = -0.92 + Math.sin(p * 12 + jIdx) * 0.04;
            j.rotation.z = tObj.config.side * (0.38 + Math.cos(p * 10) * 0.03);
          });
          // Pincers remain tightly clamped around MJ's body
          tObj.fingers.forEach(f => {
            f.rotation.x = -0.55;
          });
        } else {
          // Lower tentacles trailing downward and flexing dynamically
          tObj.joints.forEach((j, jIdx) => {
            j.rotation.x = 0.65 + Math.sin(p * 14 + jIdx) * 0.08;
            j.rotation.z = tObj.config.side * 0.42;
          });
        }
      });

      // MJ is physically carried by Dr. Octopus's mechanical claws
      targetMJ.root.position.y = curY + 1.1;
      targetMJ.root.position.x = this.root.position.x;
      targetMJ.root.position.z = this.root.position.z + 0.65;
      targetMJ.root.lookAt(this.root.position.x, targetMJ.root.position.y, this.root.position.z);

      if (onCameraUpdate) {
        onCameraUpdate(this.root.position, targetMJ.root.position, 0.5 + p * 0.5);
      }

      if (p < 1.0) {
        requestAnimationFrame(animateEscape);
      } else {
        // Escaped into unknown skies!
        this.root.visible = false;
        targetMJ.root.visible = false;
        this.isAbducting = false;

        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(animateEscape);
  }

  update(delta) {
    if (!this.root.visible || this.isAbducting) return;
    this.animTime = (this.animTime || 0) + delta;

    // Organic mechanical tentacle writhing while standing at Tile 100
    if (this.tentacles) {
      this.tentacles.forEach((tObj, tIdx) => {
        tObj.joints.forEach((j, jIdx) => {
          const wave = Math.sin(this.animTime * 2.2 + tIdx * 1.5 + jIdx * 0.8) * 0.04;
          j.rotation.z += wave * 0.1;
        });
      });
    }
  }
}
