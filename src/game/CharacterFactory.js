// ==========================================================================
// CHARACTER FACTORY - Human MJ Character Model (Fast Performance)
// Identical face, body, proportions; differentiated by vivid hair colors.
// Full skeletal procedural animation for natural walking and reactions.
// ==========================================================================

import * as THREE from 'three';

export const MJ_CONFIGS = [
  { id: 1, name: 'MJ-1', hairColor: 0xff3b30, hairName: 'Auburn Red', hex: '#ff3b30' },
  { id: 2, name: 'MJ-2', hairColor: 0x00e5ff, hairName: 'Neon Blue', hex: '#00e5ff' },
  { id: 3, name: 'MJ-3', hairColor: 0xffd700, hairName: 'Golden Blonde', hex: '#ffd700' },
  { id: 4, name: 'MJ-4', hairColor: 0x39ff14, hairName: 'Toxic Emerald', hex: '#39ff14' }
];

export class CharacterFactory {
  static createMJ(playerIndex = 0) {
    const config = MJ_CONFIGS[playerIndex % MJ_CONFIGS.length];
    const root = new THREE.Group();
    root.name = `Character_${config.name}`;

    // Fast, lightweight materials for Intel Pentium 60 FPS
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xf5d0b5 });
    const jacketMat = new THREE.MeshLambertMaterial({ color: 0x334155 }); // Slate bomber jacket
    const innerShirtMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const jeansMat = new THREE.MeshLambertMaterial({ color: 0x1d4ed8 }); // Blue jeans
    const shoeMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc }); // White sneakers
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Radiant Hair Material
    const hairMat = new THREE.MeshLambertMaterial({
      color: config.hairColor,
      emissive: config.hairColor,
      emissiveIntensity: 0.25
    });

    // Rig structure
    const pelvis = new THREE.Group();
    pelvis.position.y = 1.05;
    root.add(pelvis);

    const hipMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.2, 8), jeansMat);
    pelvis.add(hipMesh);

    const torso = new THREE.Group();
    torso.position.y = 0.15;
    pelvis.add(torso);

    const chestMesh = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.45, 0.28), jacketMat);
    chestMesh.position.y = 0.22;
    torso.add(chestMesh);

    const shirtV = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.05), innerShirtMat);
    shirtV.position.set(0, 0.32, 0.13);
    torso.add(shirtV);

    const neck = new THREE.Group();
    neck.position.y = 0.48;
    torso.add(neck);

    const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.14, 8), skinMat);
    neck.add(neckMesh);

    const head = new THREE.Group();
    head.position.y = 0.16;
    neck.add(head);

    const faceMesh = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), skinMat);
    faceMesh.scale.set(0.9, 1.1, 0.95);
    head.add(faceMesh);

    [-1, 1].forEach(side => {
      const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), eyeWhiteMat);
      eyeWhite.position.set(side * 0.075, 0.02, 0.17);
      head.add(eyeWhite);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), eyeMat);
      pupil.position.set(side * 0.075, 0.02, 0.195);
      head.add(pupil);
    });

    // Hair layers
    const hairGroup = new THREE.Group();
    head.add(hairGroup);

    const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.23, 12, 12), hairMat);
    hairTop.position.set(0, 0.05, -0.03);
    hairTop.scale.set(1.05, 1.1, 1.1);
    hairGroup.add(hairTop);

    [-1, 1].forEach(side => {
      const strand = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.03, 0.45, 6), hairMat);
      strand.position.set(side * 0.17, -0.12, 0.02);
      strand.rotation.z = side * 0.15;
      hairGroup.add(strand);
    });

    const hairBack = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 0.5, 8), hairMat);
    hairBack.position.set(0, -0.15, -0.12);
    hairGroup.add(hairBack);

    const bangs = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.08), hairMat);
    bangs.position.set(0, 0.15, 0.17);
    bangs.rotation.x = -0.3;
    hairGroup.add(bangs);

    // Arms
    const arms = {};
    [-1, 1].forEach(side => {
      const isLeft = side === -1;
      const prefix = isLeft ? 'left' : 'right';

      const shoulder = new THREE.Group();
      shoulder.position.set(side * 0.28, 0.38, 0);
      torso.add(shoulder);

      const upperArm = new THREE.Group();
      shoulder.add(upperArm);
      const upperArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.32, 6), jacketMat);
      upperArmMesh.position.y = -0.16;
      upperArm.add(upperArmMesh);

      const forearm = new THREE.Group();
      forearm.position.y = -0.32;
      upperArm.add(forearm);
      const forearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.3, 6), skinMat);
      forearmMesh.position.y = -0.15;
      forearm.add(forearmMesh);

      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), skinMat);
      hand.position.y = -0.32;
      forearm.add(hand);

      arms[prefix] = { shoulder, upperArm, forearm };
    });

    // Legs
    const legs = {};
    [-1, 1].forEach(side => {
      const isLeft = side === -1;
      const prefix = isLeft ? 'left' : 'right';

      const hipJoint = new THREE.Group();
      hipJoint.position.set(side * 0.14, -0.05, 0);
      pelvis.add(hipJoint);

      const thigh = new THREE.Group();
      hipJoint.add(thigh);
      const thighMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.44, 6), jeansMat);
      thighMesh.position.y = -0.22;
      thigh.add(thighMesh);

      const calf = new THREE.Group();
      calf.position.y = -0.44;
      thigh.add(calf);
      const calfMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.065, 0.44, 6), jeansMat);
      calfMesh.position.y = -0.22;
      calf.add(calfMesh);

      const foot = new THREE.Group();
      foot.position.y = -0.44;
      calf.add(foot);

      const shoeTop = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.24), shoeMat);
      shoeTop.position.set(0, 0.05, 0.05);
      foot.add(shoeTop);

      legs[prefix] = { hipJoint, thigh, calf, foot };
    });

    // Overhead glowing diamond badge
    const badgeGroup = new THREE.Group();
    badgeGroup.position.y = 2.4;
    root.add(badgeGroup);

    const diamondGeo = new THREE.OctahedronGeometry(0.2, 0);
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

export class CharacterAnimator {
  constructor(nodes) {
    this.nodes = nodes;
    this.state = 'idle';
    this.walkCycle = 0;
    this.idleTimer = Math.random() * 5;
    this.basePelvisY = 1.05;
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
    this.nodes.leftArm.upperArm.rotation.set(0, 0, 0.1);
    this.nodes.rightArm.upperArm.rotation.set(0, 0, -0.1);
    this.nodes.leftArm.forearm.rotation.set(0, 0, 0);
    this.nodes.rightArm.forearm.rotation.set(0, 0, 0);
    this.nodes.leftLeg.thigh.rotation.set(0, 0, 0);
    this.nodes.rightLeg.thigh.rotation.set(0, 0, 0);
    this.nodes.leftLeg.calf.rotation.set(0, 0, 0);
    this.nodes.rightLeg.calf.rotation.set(0, 0, 0);
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
    } else if (this.state === 'kidnapped') {
      this.updateKidnapped(delta);
    } else if (this.state === 'victory') {
      this.updateVictory(delta);
    } else if (this.state === 'defeat') {
      this.updateDefeat(delta);
    }
  }

  updateIdle(delta) {
    this.idleTimer += delta;
    const breath = Math.sin(this.idleTimer * 2.2);
    this.nodes.pelvis.position.y = this.basePelvisY + breath * 0.01;
    this.nodes.leftArm.upperArm.rotation.z = 0.1 + Math.sin(this.idleTimer * 1.5) * 0.03;
    this.nodes.rightArm.upperArm.rotation.z = -0.1 - Math.sin(this.idleTimer * 1.5) * 0.03;
  }

  updateWalking(delta, speed = 11) {
    this.walkCycle += delta * speed;
    const cycle = this.walkCycle;

    const legAngle = Math.sin(cycle) * 0.7;
    this.nodes.leftLeg.thigh.rotation.x = legAngle;
    this.nodes.rightLeg.thigh.rotation.x = -legAngle;

    this.nodes.leftLeg.calf.rotation.x = legAngle < 0 ? -legAngle * 1.2 : 0.05;
    this.nodes.rightLeg.calf.rotation.x = -legAngle < 0 ? legAngle * 1.2 : 0.05;

    this.nodes.leftArm.upperArm.rotation.x = -legAngle * 0.7;
    this.nodes.rightArm.upperArm.rotation.x = legAngle * 0.7;

    this.nodes.pelvis.position.y = this.basePelvisY + Math.abs(Math.sin(cycle * 2)) * 0.07;
    this.nodes.torso.rotation.x = 0.1;
  }

  updateWebPull(delta) {
    this.nodes.torso.rotation.x = -0.4;
    this.nodes.leftArm.upperArm.rotation.x = -1.3;
    this.nodes.rightArm.upperArm.rotation.x = -1.3;
    this.nodes.pelvis.position.y = this.basePelvisY - 0.15;
  }

  updateKidnapped(delta) {
    this.idleTimer += delta * 12;
    const flail = Math.sin(this.idleTimer);
    this.nodes.leftArm.upperArm.rotation.x = -1.8 + flail * 0.4;
    this.nodes.rightArm.upperArm.rotation.x = -1.8 - flail * 0.4;
    this.nodes.leftLeg.thigh.rotation.x = flail * 0.5;
    this.nodes.rightLeg.thigh.rotation.x = -flail * 0.5;
  }

  updateVictory(delta) {
    this.idleTimer += delta * 6;
    const pump = Math.abs(Math.sin(this.idleTimer));
    this.nodes.leftArm.upperArm.rotation.x = -2.4 - pump * 0.4;
    this.nodes.rightArm.upperArm.rotation.x = -2.4 - pump * 0.4;
    this.nodes.pelvis.position.y = this.basePelvisY + pump * 0.3;
  }

  updateDefeat(delta) {
    this.nodes.torso.rotation.x = 0.5;
    this.nodes.head.rotation.x = 0.6;
    this.nodes.pelvis.position.y = this.basePelvisY - 0.3;
  }
}
