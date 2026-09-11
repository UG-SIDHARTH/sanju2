// ==========================================================================
// CHARACTER FACTORY - High-Fidelity Human Mary Jane (MJ) Character Model
// Beautiful feminine anatomy, stylish layered clothing, flowing hair,
// and realistic procedural human bipedal gait & kinematics.
// ==========================================================================

import * as THREE from 'three';

export const MJ_CONFIGS = [
  { id: 1, name: 'MJ-1', hairColor: 0xd94826, hairName: 'Auburn Red', hex: '#d94826', eyeColor: 0x10b981 },
  { id: 2, name: 'MJ-2', hairColor: 0x06b6d4, hairName: 'Neon Cyan', hex: '#06b6d4', eyeColor: 0x38bdf8 },
  { id: 3, name: 'MJ-3', hairColor: 0xf59e0b, hairName: 'Golden Honey', hex: '#f59e0b', eyeColor: 0x059669 },
  { id: 4, name: 'MJ-4', hairColor: 0x10b981, hairName: 'Emerald Wave', hex: '#10b981', eyeColor: 0x8b5cf6 }
];

export class CharacterFactory {
  static createMJ(playerIndex = 0) {
    const config = MJ_CONFIGS[playerIndex % MJ_CONFIGS.length];
    const root = new THREE.Group();
    root.name = `Character_${config.name}`;

    // --- High-Quality Stylized Realistic Materials ---
    // Warm peach human skin with soft specular response
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xfcd5b5,
      roughness: 0.55,
      metalness: 0.05
    });

    // Charcoal biker leather jacket with realistic sheen
    const jacketMat = new THREE.MeshStandardMaterial({
      color: 0x242d38,
      roughness: 0.38,
      metalness: 0.18
    });

    // Darker jacket collar & lapel trim
    const jacketTrimMat = new THREE.MeshStandardMaterial({
      color: 0x151b22,
      roughness: 0.32,
      metalness: 0.22
    });

    // Crisp white ribbed camisole
    const shirtMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.65,
      metalness: 0.0
    });

    // Fitted indigo denim jeans with soft cloth sheen
    const jeansMat = new THREE.MeshStandardMaterial({
      color: 0x22487a,
      roughness: 0.72,
      metalness: 0.05
    });

    // White sneakers with dark accents
    const sneakerWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.45,
      metalness: 0.05
    });
    const sneakerDarkMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
      metalness: 0.1
    });

    // Facial feature materials
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const irisMat = new THREE.MeshBasicMaterial({ color: config.eyeColor || 0x10b981 });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });
    const catchlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const lipMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      roughness: 0.3,
      metalness: 0.05
    });
    const browMat = new THREE.MeshBasicMaterial({ color: 0x451a03 });

    // Lustrous hair material with rich specular gloss
    const hairMat = new THREE.MeshStandardMaterial({
      color: config.hairColor,
      roughness: 0.32,
      metalness: 0.12,
      emissive: config.hairColor,
      emissiveIntensity: 0.14
    });

    // --- 1. PELVIS & HIPS (Contoured Feminine Anatomy) ---
    const pelvis = new THREE.Group();
    pelvis.position.y = 1.05;
    root.add(pelvis);

    // Contoured hip curve
    const hipsMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.23, 0.21, 0.22, 12),
      jeansMat
    );
    hipsMesh.scale.set(1.05, 1.0, 0.9);
    pelvis.add(hipsMesh);

    // Jeans waistband & belt loops
    const waistband = new THREE.Mesh(
      new THREE.CylinderGeometry(0.235, 0.235, 0.04, 12),
      jacketTrimMat
    );
    waistband.position.y = 0.09;
    waistband.scale.set(1.06, 1.0, 0.92);
    pelvis.add(waistband);

    // --- 2. TORSO & CHEST ---
    const torso = new THREE.Group();
    torso.position.y = 0.16;
    pelvis.add(torso);

    // Slender waist
    const waistMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.20, 0.22, 0.16, 12),
      shirtMat
    );
    waistMesh.position.y = 0.08;
    waistMesh.scale.set(1.0, 1.0, 0.85);
    torso.add(waistMesh);

    // Feminine jacket chest
    const chestGroup = new THREE.Group();
    chestGroup.position.y = 0.24;
    torso.add(chestGroup);

    // Main jacket body
    const chestMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.20, 0.26, 12),
      jacketMat
    );
    chestMesh.scale.set(1.08, 1.0, 0.88);
    chestGroup.add(chestMesh);

    // Inner V-neck top
    const innerTop = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.22, 0.12),
      shirtMat
    );
    innerTop.position.set(0, 0.02, 0.12);
    chestGroup.add(innerTop);

    // Open jacket lapels
    [-1, 1].forEach(side => {
      const lapel = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.24, 0.06),
        jacketTrimMat
      );
      lapel.position.set(side * 0.12, 0.02, 0.145);
      lapel.rotation.y = side * 0.2;
      lapel.rotation.z = side * -0.1;
      chestGroup.add(lapel);
    });

    // Jacket collar
    const collar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.16, 0.08, 12),
      jacketTrimMat
    );
    collar.position.set(0, 0.15, -0.02);
    chestGroup.add(collar);

    // --- 3. NECK & HEAD ---
    const neck = new THREE.Group();
    neck.position.y = 0.44;
    torso.add(neck);

    const neckMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.085, 0.14, 10),
      skinMat
    );
    neck.add(neckMesh);

    const head = new THREE.Group();
    head.position.y = 0.14;
    neck.add(head);

    // Sculpted feminine head (tapered jaw & chin)
    const headMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.185, 16, 16),
      skinMat
    );
    headMesh.scale.set(0.92, 1.12, 0.96);
    head.add(headMesh);

    // Soft chin contour
    const chin = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 10, 10),
      skinMat
    );
    chin.position.set(0, -0.14, 0.10);
    chin.scale.set(0.9, 0.8, 0.9);
    head.add(chin);

    // Subtle nose tip
    const nose = new THREE.Mesh(
      new THREE.ConeGeometry(0.025, 0.05, 5),
      skinMat
    );
    nose.position.set(0, -0.01, 0.185);
    nose.rotation.x = Math.PI / 2;
    head.add(nose);

    // Contoured rose lips
    const lips = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.022, 0.02),
      lipMat
    );
    lips.position.set(0, -0.065, 0.178);
    head.add(lips);

    // Expressive human eyes
    [-1, 1].forEach(side => {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(side * 0.07, 0.025, 0.165);
      eyeGroup.rotation.y = side * 0.15;
      head.add(eyeGroup);

      // Sclera (White)
      const eyeWhite = new THREE.Mesh(
        new THREE.SphereGeometry(0.038, 8, 8),
        eyeWhiteMat
      );
      eyeWhite.scale.set(1.1, 0.85, 0.4);
      eyeGroup.add(eyeWhite);

      // Iris (Emerald Green)
      const iris = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022, 0.022, 0.01, 8),
        irisMat
      );
      iris.rotation.x = Math.PI / 2;
      iris.position.z = 0.016;
      eyeGroup.add(iris);

      // Pupil (Dark)
      const pupil = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.012, 8),
        pupilMat
      );
      pupil.rotation.x = Math.PI / 2;
      pupil.position.z = 0.020;
      eyeGroup.add(pupil);

      // Catchlight (Life gleam)
      const catchlight = new THREE.Mesh(
        new THREE.SphereGeometry(0.005, 4, 4),
        catchlightMat
      );
      catchlight.position.set(0.008, 0.008, 0.025);
      eyeGroup.add(catchlight);

      // Arched Eyebrow
      const brow = new THREE.Mesh(
        new THREE.BoxGeometry(0.065, 0.012, 0.015),
        browMat
      );
      brow.position.set(0, 0.045, 0.015);
      brow.rotation.z = side * -0.15;
      eyeGroup.add(brow);
    });

    // --- 4. FLOWING LAYERED HAIR ---
    const hairGroup = new THREE.Group();
    head.add(hairGroup);

    // Volumetric crown
    const hairCrown = new THREE.Mesh(
      new THREE.SphereGeometry(0.21, 14, 14),
      hairMat
    );
    hairCrown.position.set(0, 0.04, -0.04);
    hairCrown.scale.set(1.05, 1.15, 1.15);
    hairGroup.add(hairCrown);

    // Sweeping bangs
    const leftBang = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.02, 0.26, 6),
      hairMat
    );
    leftBang.position.set(-0.09, 0.07, 0.14);
    leftBang.rotation.set(-0.2, 0.2, 0.6);
    hairGroup.add(leftBang);

    const rightBang = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.03, 0.30, 6),
      hairMat
    );
    rightBang.position.set(0.08, 0.05, 0.13);
    rightBang.rotation.set(-0.2, -0.2, -0.5);
    hairGroup.add(rightBang);

    // Front cascading shoulder locks
    [-1, 1].forEach(side => {
      const frontLock = new THREE.Mesh(
        new THREE.CylinderGeometry(0.065, 0.03, 0.44, 8),
        hairMat
      );
      frontLock.position.set(side * 0.16, -0.14, 0.05);
      frontLock.rotation.z = side * 0.12;
      frontLock.rotation.x = 0.1;
      hairGroup.add(frontLock);
    });

    // Flowing back hair
    const backHair = new THREE.Mesh(
      new THREE.CylinderGeometry(0.19, 0.13, 0.55, 10),
      hairMat
    );
    backHair.position.set(0, -0.18, -0.13);
    backHair.rotation.x = -0.1;
    hairGroup.add(backHair);

    // --- 5. ARMS & HANDS ---
    const arms = {};
    [-1, 1].forEach(side => {
      const isLeft = side === -1;
      const prefix = isLeft ? 'left' : 'right';

      const shoulder = new THREE.Group();
      shoulder.position.set(side * 0.25, 0.35, 0);
      torso.add(shoulder);

      // Shoulder cap
      const shoulderCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.075, 8, 8),
        jacketMat
      );
      shoulder.add(shoulderCap);

      const upperArm = new THREE.Group();
      shoulder.add(upperArm);

      // Upper arm jacket sleeve
      const upperArmMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.065, 0.055, 0.30, 8),
        jacketMat
      );
      upperArmMesh.position.y = -0.15;
      upperArm.add(upperArmMesh);

      const forearm = new THREE.Group();
      forearm.position.y = -0.30;
      upperArm.add(forearm);

      // Slender skin forearm
      const forearmMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.052, 0.042, 0.26, 8),
        skinMat
      );
      forearmMesh.position.y = -0.13;
      forearm.add(forearmMesh);

      // Delicate hand with palm & thumb
      const handGroup = new THREE.Group();
      handGroup.position.y = -0.28;
      forearm.add(handGroup);

      const palm = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.065, 0.035),
        skinMat
      );
      palm.position.y = -0.03;
      handGroup.add(palm);

      const thumb = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.035, 0.02),
        skinMat
      );
      thumb.position.set(side * 0.025, -0.02, 0.015);
      handGroup.add(thumb);

      arms[prefix] = { shoulder, upperArm, forearm, hand: handGroup };
    });

    // --- 6. LEGS & SNEAKERS ---
    const legs = {};
    [-1, 1].forEach(side => {
      const isLeft = side === -1;
      const prefix = isLeft ? 'left' : 'right';

      const hipJoint = new THREE.Group();
      hipJoint.position.set(side * 0.12, -0.06, 0);
      pelvis.add(hipJoint);

      const thigh = new THREE.Group();
      hipJoint.add(thigh);

      // Tapered thigh
      const thighMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.095, 0.075, 0.44, 10),
        jeansMat
      );
      thighMesh.position.y = -0.22;
      thigh.add(thighMesh);

      const calf = new THREE.Group();
      calf.position.y = -0.44;
      thigh.add(calf);

      // Tapered slender calf
      const calfMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.075, 0.058, 0.44, 10),
        jeansMat
      );
      calfMesh.position.y = -0.22;
      calf.add(calfMesh);

      // Sneaker assembly
      const foot = new THREE.Group();
      foot.position.y = -0.44;
      calf.add(foot);

      // Rubber Sole
      const sole = new THREE.Mesh(
        new THREE.BoxGeometry(0.11, 0.04, 0.25),
        sneakerWhiteMat
      );
      sole.position.set(0, 0.02, 0.04);
      foot.add(sole);

      // Sneaker Upper Body
      const shoeBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.10, 0.08, 0.22),
        sneakerDarkMat
      );
      shoeBody.position.set(0, 0.06, 0.03);
      foot.add(shoeBody);

      // White Toe Cap
      const toeCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.055, 8, 8),
        sneakerWhiteMat
      );
      toeCap.position.set(0, 0.04, 0.12);
      toeCap.scale.set(0.95, 0.65, 0.95);
      foot.add(toeCap);

      legs[prefix] = { hipJoint, thigh, calf, foot };
    });

    // Overhead glowing player indicator diamond
    const badgeGroup = new THREE.Group();
    badgeGroup.position.y = 2.45;
    root.add(badgeGroup);

    const diamondGeo = new THREE.OctahedronGeometry(0.18, 0);
    const diamondMat = new THREE.MeshBasicMaterial({ color: config.hairColor });
    const diamond = new THREE.Mesh(diamondGeo, diamondMat);
    badgeGroup.add(diamond);

    const animator = new CharacterAnimator({
      root,
      pelvis,
      torso,
      neck,
      head,
      leftArm: arms.left,
      rightArm: arms.right,
      leftLeg: legs.left,
      rightLeg: legs.right,
      diamond,
      hairGroup,
      config
    });

    return {
      root,
      config,
      animator,
      playerIndex
    };
  }
}

// ==========================================================================
// CHARACTER ANIMATOR - Lifelike Human Biomechanics & Kinematics
// Full skeletal contrapposto idle, pelvic drop & twist walking,
// thoracic breathing, spine counter-rotation, and emotional reaction states.
// ==========================================================================

export class CharacterAnimator {
  constructor(nodes) {
    this.nodes = nodes;
    this.state = 'idle';
    this.walkCycle = 0;
    this.idleTimer = Math.random() * 5;
    this.basePelvisY = 1.05;

    this.resetPose();
  }

  setState(newState) {
    this.state = newState;
    if (newState === 'idle') {
      this.resetPose();
    }
  }

  resetPose() {
    this.nodes.pelvis.position.y = this.basePelvisY;
    this.nodes.pelvis.rotation.set(0, 0, 0);
    this.nodes.torso.rotation.set(0, 0, 0);
    this.nodes.head.rotation.set(0, 0, 0);

    this.nodes.leftArm.upperArm.rotation.set(0.06, 0, 0.12);
    this.nodes.leftArm.forearm.rotation.set(0.15, 0, 0);

    this.nodes.rightArm.upperArm.rotation.set(0.06, 0, -0.12);
    this.nodes.rightArm.forearm.rotation.set(0.15, 0, 0);

    this.nodes.leftLeg.thigh.rotation.set(0, 0, 0);
    this.nodes.leftLeg.calf.rotation.set(0, 0, 0);
    this.nodes.leftLeg.foot.rotation.set(0, 0, 0);

    this.nodes.rightLeg.thigh.rotation.set(0, 0, 0);
    this.nodes.rightLeg.calf.rotation.set(0, 0, 0);
    this.nodes.rightLeg.foot.rotation.set(0, 0, 0);
  }

  update(delta) {
    if (this.nodes.diamond) {
      this.nodes.diamond.rotation.y += delta * 2.5;
    }

    if (this.state === 'idle') {
      this.updateIdle(delta);
    } else if (this.state === 'walking') {
      this.updateWalking(delta);
    } else if (this.state === 'web_pull') {
      this.updateWebPull(delta);
    } else if (this.state === 'carried') {
      this.updateCarried(delta);
    } else if (this.state === 'holding_hands') {
      this.updateHoldingHands(delta);
    } else if (this.state === 'kidnapped') {
      this.updateKidnapped(delta);
    } else if (this.state === 'abducted') {
      this.updateAbducted(delta);
    } else if (this.state === 'victory') {
      this.updateVictory(delta);
    } else if (this.state === 'defeat') {
      this.updateDefeat(delta);
    }
  }

  // Heroic side-by-side hand-holding team-up with Spider-Man
  updateHoldingHands(delta) {
    this.idleTimer += delta;
    const t = this.idleTimer;
    const breath = Math.sin(t * 2.0) * 0.015;

    // Upright proud stance
    this.nodes.torso.rotation.set(-0.02 + breath, 0, 0);
    this.nodes.pelvis.position.y = this.basePelvisY + breath * 0.006;
    this.nodes.pelvis.rotation.set(0, 0, 0);

    // Left arm extends down and outward to interlock hands with Spider-Man!
    this.nodes.leftArm.upperArm.rotation.set(0.20, 0, 0.32);
    this.nodes.leftArm.forearm.rotation.set(0.15, -0.08, 0.12);

    // Right arm rests relaxed at her side
    this.nodes.rightArm.upperArm.rotation.set(0.06, 0, -0.12);
    this.nodes.rightArm.forearm.rotation.set(0.15, 0, 0);

    // Head turns slightly toward Spider-Man with a friendly tilt
    this.nodes.head.rotation.set(0, 0.20, 0);
  }

  // Natural Human Contrapposto Idle with Weight Shift & Thoracic Breathing
  updateIdle(delta) {
    this.idleTimer += delta;
    const t = this.idleTimer;

    // Lifelike human thoracic breathing
    const breath = Math.sin(t * 2.0);
    this.nodes.torso.rotation.x = -0.02 + breath * 0.015;
    this.nodes.pelvis.position.y = this.basePelvisY + breath * 0.008;

    // Contrapposto weight shift: slight hip tilt to one side
    this.nodes.pelvis.rotation.z = 0.035;
    this.nodes.pelvis.rotation.y = 0.025;

    // Torso counter-balance
    this.nodes.torso.rotation.z = -0.028;

    // Relaxed knees & legs
    this.nodes.leftLeg.thigh.rotation.z = -0.035;
    this.nodes.rightLeg.thigh.rotation.z = 0.035;
    this.nodes.rightLeg.calf.rotation.x = 0.06; // soft right knee bend

    // Natural arm drape
    this.nodes.leftArm.upperArm.rotation.z = 0.12 + Math.sin(t * 1.5) * 0.02;
    this.nodes.rightArm.upperArm.rotation.z = -0.12 - Math.sin(t * 1.5) * 0.02;

    // Subtle natural head awareness glancing
    this.nodes.head.rotation.y = Math.sin(t * 0.6) * 0.08;
    this.nodes.head.rotation.x = Math.cos(t * 0.8) * 0.04;

    // Secondary hair sway
    if (this.nodes.hairGroup) {
      this.nodes.hairGroup.rotation.z = Math.sin(t * 1.8) * 0.015;
    }
  }

  // Realistic Bipedal Human Walking Kinematics:
  // Pelvic drop/tilt, pelvic yaw twist, torso counter-rotation, 3-phase leg cycle
  updateWalking(delta, speed = 10.5) {
    this.walkCycle += delta * speed;
    const c = this.walkCycle;

    // 1. Pelvic Sway (Hip Drop / Roll)
    this.nodes.pelvis.rotation.z = Math.sin(c) * 0.055;

    // 2. Pelvic Twist (Yaw toward forward stepping leg)
    this.nodes.pelvis.rotation.y = Math.sin(c) * 0.10;

    // 3. Spine / Torso Counter-Rotation (Torso twists opposite to hips)
    this.nodes.torso.rotation.y = -Math.sin(c) * 0.10;
    this.nodes.torso.rotation.z = -Math.sin(c) * 0.035;
    this.nodes.torso.rotation.x = 0.07; // Natural forward momentum pitch

    // 4. Double-frequency Pelvic Vertical Bounce
    this.nodes.pelvis.position.y = this.basePelvisY + Math.abs(Math.sin(c)) * 0.055 - 0.02;

    // 5. Realistic Three-Phase Leg Kinematics
    const leftStride = Math.sin(c);
    const rightStride = -leftStride;

    // Thigh hip pitch
    this.nodes.leftLeg.thigh.rotation.x = leftStride * 0.55;
    this.nodes.rightLeg.thigh.rotation.x = rightStride * 0.55;

    // Knee flexion (bends backward during swing phase)
    this.nodes.leftLeg.calf.rotation.x = Math.max(0, -leftStride * 0.85 + 0.18);
    this.nodes.rightLeg.calf.rotation.x = Math.max(0, -rightStride * 0.85 + 0.18);

    // Foot ankle pitch (heel-strike to toe push-off)
    this.nodes.leftLeg.foot.rotation.x = leftStride * 0.28;
    this.nodes.rightLeg.foot.rotation.x = rightStride * 0.28;

    // 6. Fluid Arm Swing with Forearm Lag
    const armSwing = -leftStride;
    this.nodes.leftArm.upperArm.rotation.x = armSwing * 0.42;
    this.nodes.leftArm.upperArm.rotation.z = 0.14;
    this.nodes.leftArm.forearm.rotation.x = 0.22 + Math.max(0, -armSwing * 0.28);

    this.nodes.rightArm.upperArm.rotation.x = -armSwing * 0.42;
    this.nodes.rightArm.upperArm.rotation.z = -0.14;
    this.nodes.rightArm.forearm.rotation.x = 0.22 + Math.max(0, armSwing * 0.28);

    // Head stabilizes forward
    this.nodes.head.rotation.y = -this.nodes.torso.rotation.y * 0.6;
    this.nodes.head.rotation.x = -0.04;

    // Hair inertia dynamics
    if (this.nodes.hairGroup) {
      this.nodes.hairGroup.rotation.x = -Math.abs(Math.sin(c)) * 0.06;
      this.nodes.hairGroup.rotation.z = -this.nodes.pelvis.rotation.z * 0.7;
    }
  }

  // Graceful bridal carry in Spider-Man's arms
  updateCarried(delta) {
    this.idleTimer += delta * 2.2;
    const breath = Math.sin(this.idleTimer) * 0.02;

    // Torso reclined comfortably into Spider-Man's chest
    this.nodes.torso.rotation.set(-0.12 + breath, 0.08, -0.06);
    this.nodes.pelvis.rotation.set(0.1, 0, -0.12);
    this.nodes.pelvis.position.y = this.basePelvisY;

    // Left arm wraps gently up around Spider-Man's shoulder
    this.nodes.leftArm.upperArm.rotation.set(-1.45, 0.25, 0.45);
    this.nodes.leftArm.forearm.rotation.set(0.85, 0.2, 0.15);

    // Right arm rests softly across her midsection
    this.nodes.rightArm.upperArm.rotation.set(-0.65, -0.15, -0.35);
    this.nodes.rightArm.forearm.rotation.set(1.15, -0.25, 0);

    // Legs bent comfortably at hips and knees across Spider-Man's supporting arm
    this.nodes.leftLeg.thigh.rotation.set(0.72, 0.1, 0.1);
    this.nodes.leftLeg.calf.rotation.set(0.9, 0, 0);
    this.nodes.leftLeg.foot.rotation.set(0.2, 0, 0);

    this.nodes.rightLeg.thigh.rotation.set(0.8, -0.15, -0.1);
    this.nodes.rightLeg.calf.rotation.set(1.02, 0, 0);
    this.nodes.rightLeg.foot.rotation.set(0.25, 0, 0);

    // Head gazes warmly toward Spider-Man's mask
    this.nodes.head.rotation.set(-0.15, -0.35, 0.12);

    if (this.nodes.hairGroup) {
      this.nodes.hairGroup.rotation.z = 0.15;
    }
  }

  // Web Pull reaction
  updateWebPull(delta) {
    this.nodes.torso.rotation.x = -0.35;
    this.nodes.leftArm.upperArm.rotation.set(-1.25, 0, 0.2);
    this.nodes.rightArm.upperArm.rotation.set(-1.25, 0, -0.2);
    this.nodes.pelvis.position.y = this.basePelvisY - 0.12;
  }

  // Green Goblin Glider kidnapping
  updateKidnapped(delta) {
    this.idleTimer += delta * 12;
    const flail = Math.sin(this.idleTimer);
    this.nodes.leftArm.upperArm.rotation.x = -1.8 + flail * 0.4;
    this.nodes.rightArm.upperArm.rotation.x = -1.8 - flail * 0.4;
    this.nodes.leftLeg.thigh.rotation.x = flail * 0.5;
    this.nodes.rightLeg.thigh.rotation.x = -flail * 0.5;
  }

  // Dr. Octopus mechanical tentacle abduction reaction
  updateAbducted(delta) {
    this.idleTimer += delta * 14;
    const struggle = Math.sin(this.idleTimer);

    this.nodes.torso.rotation.x = 0.25 + struggle * 0.15;
    this.nodes.head.rotation.x = -0.4;

    // Arms reaching out in shock / struggling against steel claws
    this.nodes.leftArm.upperArm.rotation.set(-1.6 + struggle * 0.3, 0.3, 0.5);
    this.nodes.leftArm.forearm.rotation.set(0.6, 0, 0);
    this.nodes.rightArm.upperArm.rotation.set(-1.6 - struggle * 0.3, -0.3, -0.5);
    this.nodes.rightArm.forearm.rotation.set(0.6, 0, 0);

    // Legs dangling and kicking
    this.nodes.leftLeg.thigh.rotation.x = 0.4 + struggle * 0.45;
    this.nodes.leftLeg.calf.rotation.x = 0.8;
    this.nodes.rightLeg.thigh.rotation.x = 0.4 - struggle * 0.45;
    this.nodes.rightLeg.calf.rotation.x = 0.8;
  }

  // Victory celebration
  updateVictory(delta) {
    this.idleTimer += delta * 6;
    const pump = Math.abs(Math.sin(this.idleTimer));
    this.nodes.leftArm.upperArm.rotation.x = -2.3 - pump * 0.4;
    this.nodes.rightArm.upperArm.rotation.x = -2.3 - pump * 0.4;
    this.nodes.pelvis.position.y = this.basePelvisY + pump * 0.25;
  }

  // Defeat / Elimination
  updateDefeat(delta) {
    this.nodes.torso.rotation.x = 0.45;
    this.nodes.head.rotation.x = 0.55;
    this.nodes.pelvis.position.y = this.basePelvisY - 0.25;
    this.nodes.leftArm.upperArm.rotation.set(0.2, 0, 0.1);
    this.nodes.rightArm.upperArm.rotation.set(0.2, 0, -0.1);
  }
}
