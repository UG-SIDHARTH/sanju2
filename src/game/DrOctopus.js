// ==========================================================================
// DOCTOR OCTOPUS - Masterpiece Ditko/Romita Comic & Anime 3D Boss Model
// Articulated Tentacles, Cybernetic Claws, Yellow Goggles & Bowl Cut
// Dramatic Tile 100 Multiverse Climax: Doctor Octopus Throw-Down & 6 Spider-Men Battle
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

    // Classic comic vibrant yellow gloves, boots & harness
    const yellowMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // Classic comic bright yellow
      roughness: 0.35,
      metalness: 0.15
    });

    // --- 1. BODY & COAT ---
    this.bodyGroup = new THREE.Group();
    this.bodyGroup.position.y = 1.0;
    this.root.add(this.bodyGroup);

    // Sturdy torso in emerald green jumpsuit
    const chest = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.58, 0.38),
      suitMat
    );
    chest.position.y = 0.29;
    this.bodyGroup.add(chest);

    // Classic Comic Yellow Chest Harness Bands
    [-1, 1].forEach(side => {
      const strap = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.54, 0.04),
        yellowMat
      );
      strap.position.set(side * 0.16, 0.29, 0.18);
      this.bodyGroup.add(strap);
    });

    // Classic Comic Yellow Utility Belt with buckle
    const yellowBelt = new THREE.Mesh(
      new THREE.BoxGeometry(0.57, 0.09, 0.40),
      yellowMat
    );
    yellowBelt.position.y = 0.04;
    this.bodyGroup.add(yellowBelt);

    const buckle = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.11, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 })
    );
    buckle.position.set(0, 0.04, 0.21);
    this.bodyGroup.add(buckle);

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

      // Classic Comic Bright Yellow Gauntlet Glove
      const gloveCuff = new THREE.Mesh(
        new THREE.CylinderGeometry(0.088, 0.07, 0.08, 8),
        yellowMat
      );
      gloveCuff.position.y = -0.25;
      forearm.add(gloveCuff);

      const glove = new THREE.Mesh(
        new THREE.BoxGeometry(0.085, 0.10, 0.065),
        yellowMat
      );
      glove.position.y = -0.32;
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

      // Classic Comic Bright Yellow Boots with Cuffs
      const bootCuff = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.10, 0.08, 8),
        yellowMat
      );
      bootCuff.position.y = -0.40;
      hip.add(bootCuff);

      const boot = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.36, 0.24),
        yellowMat
      );
      boot.position.set(0, -0.57, 0.04);
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

  // --- DRAMATIC TILE 100 CLIMAX: THROW DOWN & MULTIVERSE SHOWDOWN ---
  triggerAbduction(targetMJ, onThrown, onCameraUpdate) {
    this.isAbducting = true;
    this.root.visible = true;

    const tilePos = targetMJ.root.position.clone();
    // Start high in the sky above Tile 100
    this.root.position.set(tilePos.x, 14.0, tilePos.z);
    this.root.lookAt(tilePos.x, this.root.position.y, tilePos.z + 10);

    // 1. Play Heavy Mechanical Servos & Hydraulic Clamp
    this.audioManager.playDocOckEmergence();

    // 2. Descend smoothly from the sky onto Tile 100
    const descentDuration = 1.3;
    const descentStart = performance.now();

    const animateDescent = () => {
      const now = performance.now();
      const p = Math.min(1.0, (now - descentStart) / (descentDuration * 1000));

      // Ease out quad
      const t = 1 - Math.pow(1 - p, 2);
      this.root.position.y = THREE.MathUtils.lerp(14.0, 0.2, t);

      if (onCameraUpdate) {
        onCameraUpdate(this.root.position, targetMJ.root.position, p * 0.4);
      }

      if (p < 1.0) {
        requestAnimationFrame(animateDescent);
      } else {
        // Landed on Tile 100!
        this.executeClawGrabAndThrow(targetMJ, onThrown, onCameraUpdate);
      }
    };

    requestAnimationFrame(animateDescent);
  }

  executeClawGrabAndThrow(targetMJ, onThrown, onCameraUpdate) {
    // 1. Claws clamp around MJ
    const grabDuration = 0.7;
    const grabStart = performance.now();

    const animateGrab = () => {
      const now = performance.now();
      const p = Math.min(1.0, (now - grabStart) / (grabDuration * 1000));

      this.tentacles.forEach(t => {
        if (t.config.isUpper) {
          t.joints.forEach((j) => {
            j.rotation.x = THREE.MathUtils.lerp(-0.45, -0.92, p);
            j.rotation.z = THREE.MathUtils.lerp(t.config.side * 0.25, t.config.side * 0.40, p);
          });
          t.fingers.forEach(f => {
            f.rotation.x = THREE.MathUtils.lerp(0, -0.55, p);
          });
        }
      });

      if (p < 1.0) {
        requestAnimationFrame(animateGrab);
      } else {
        targetMJ.animator.setState('abducted');
        this.comicFX.spawnAt(targetMJ.root.position, 'CLANK!', '#e62429', '#ffffff', 1.8);
        this.audioManager.playDocOckEmergence();

        // 2. Lift MJ high above head and THROW HER DOWN!
        setTimeout(() => {
          this.executeThrowDown(targetMJ, onThrown, onCameraUpdate);
        }, 500);
      }
    };

    requestAnimationFrame(animateGrab);
  }

  executeThrowDown(targetMJ, onThrown, onCameraUpdate) {
    const liftDuration = 1.0;
    const liftStart = performance.now();

    const animateLift = () => {
      const now = performance.now();
      const p = Math.min(1.0, (now - liftStart) / (liftDuration * 1000));
      const ease = p * p * (3 - 2 * p);

      // Lift MJ up into the air
      targetMJ.root.position.y = 0.1 + ease * 6.5;
      targetMJ.root.position.x = this.root.position.x + Math.sin(p * Math.PI) * 0.4;
      targetMJ.root.position.z = this.root.position.z + 0.5;

      // Tentacles raise upward
      this.tentacles.forEach(t => {
        if (t.config.isUpper) {
          t.joints.forEach((j) => {
            j.rotation.x = THREE.MathUtils.lerp(-0.92, 0.45, ease);
          });
        }
      });

      if (onCameraUpdate) {
        onCameraUpdate(this.root.position, targetMJ.root.position, 0.5 + p * 0.3);
      }

      if (p < 1.0) {
        requestAnimationFrame(animateLift);
      } else {
        // HURL MJ DOWN!
        this.comicFX.spawnAt(targetMJ.root.position, 'HURL!', '#ef4444', '#fef08a', 2.2);
        this.comicFX.showBanner('DR. OCTOPUS THROWS MJ DOWN! SPIDER-MEN ASSEMBLE!');
        this.audioManager.playSuspenseHeartbeat();

        // Open claws wide
        this.tentacles.forEach(t => {
          if (t.config.isUpper) {
            t.fingers.forEach(f => {
              f.rotation.x = 0.45; // open claws
            });
          }
        });

        // MJ falls rapidly downward
        const fallStart = performance.now();
        const fallDuration = 1.6;
        const initialY = targetMJ.root.position.y;

        const animateFall = () => {
          const fNow = performance.now();
          const fp = Math.min(1.0, (fNow - fallStart) / (fallDuration * 1000));
          // Acceleration due to gravity
          const gravityT = fp * fp;

          targetMJ.root.position.y = initialY - gravityT * 12.0;
          targetMJ.root.position.z += 0.08;
          targetMJ.root.rotation.x += 0.05;
          targetMJ.root.rotation.z += 0.03;

          if (fp < 1.0) {
            requestAnimationFrame(animateFall);
          }
        };
        requestAnimationFrame(animateFall);

        // Notify that MJ has been thrown down! All Spider-Men must assemble!
        if (onThrown) onThrown(targetMJ);
      }
    };

    requestAnimationFrame(animateLift);
  }

  // React violently to Spider-Man team attack strikes
  takeHit(damageVector, comicText = 'SMASH!') {
    this.comicFX.spawnAt(this.root.position, comicText, '#f59e0b', '#ffffff', 2.0);
    this.audioManager.playBonusChime();

    const origPos = this.root.position.clone();
    const recoilX = (Math.random() - 0.5) * 1.2;
    const recoilZ = (Math.random() - 0.5) * 1.2;

    this.root.position.x += recoilX;
    this.root.position.z += recoilZ;

    // Tentacles fling backward in pain
    this.tentacles.forEach(t => {
      t.joints.forEach(j => {
        j.rotation.x += (Math.random() - 0.5) * 0.8;
        j.rotation.z += (Math.random() - 0.5) * 0.8;
      });
    });

    setTimeout(() => {
      this.root.position.lerp(origPos, 0.5);
    }, 150);
  }

  // Defeated: sparks fly, tentacles collapse, and Doc Ock falls off the rooftop
  defeatCollapse(onDefeated) {
    this.comicFX.spawnAt(this.root.position, 'K.O.!', '#dc2626', '#fef08a', 3.0);
    this.comicFX.showBanner('DOCTOR OCTOPUS DEFEATED BY ALL 6 SPIDER-MEN!');
    this.audioManager.playDefeatGong();

    const defeatDuration = 2.4;
    const startY = this.root.position.y;
    const startZ = this.root.position.z;
    const startTime = performance.now();

    const animateDefeat = () => {
      const now = performance.now();
      const p = Math.min(1.0, (now - startTime) / (defeatDuration * 1000));
      const t = p * p; // plunging acceleration

      this.root.position.y = startY - t * 24.0;
      this.root.position.z = startZ - t * 16.0;
      this.root.rotation.x -= 0.05;
      this.root.rotation.z += 0.03;

      // Tentacles go limp and flail
      this.tentacles.forEach(tent => {
        tent.joints.forEach((j, idx) => {
          j.rotation.x = Math.sin(p * 18 + idx) * 0.6;
        });
      });

      if (p < 1.0) {
        requestAnimationFrame(animateDefeat);
      } else {
        this.root.visible = false;
        this.isAbducting = false;
        if (onDefeated) onDefeated();
      }
    };

    requestAnimationFrame(animateDefeat);
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
