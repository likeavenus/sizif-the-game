import Phaser from "phaser";
import Boulder from "./Boulder";

export class Vulture extends Phaser.Physics.Matter.Sprite {
  withBoulder = false;
  canAttack = true;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    name: string,
    frame?: string | number
  ) {
    super(scene.matter.world, x, y, texture, frame, {
      label: "vulture",
      frictionAir: 0.006,
    });

    scene.anims.create({
      key: "fly",
      frames: scene.anims.generateFrameNames("vulture", {
        start: 10,
        end: 14,
        prefix: "Vulture_",
        suffix: ".png",
      }),
      repeat: -1,
      frameRate: 12,
    });

    this.setDepth(110);
    this.setScale(0.6);
    this.setRectangle(312, 160, {
      ignoreGravity: true,
      ignorePointer: true,
    });
    this.setFixedRotation();
    this.setOrigin(0.45, 0.37);
    this.anims.play("fly");
    this.setInteractive();

    scene.add.existing(this);
  }

  update(boulder: Boulder): void {
    if (this.withBoulder) {
      this.setVelocityY(-2);
    } else {
      // this.setRandomPosition()
    }
  }
}

// export default class VultureContainer extends Phaser.GameObjects.Container {
//   public vulture!: Phaser.GameObjects.Sprite;
//   constructor(scene: Phaser.Scene, x: number, y: number) {
//     super(scene, x, y);

//     this.vulture = scene.add.sprite(0, 0, "vulture", undefined);

//     scene.anims.create({
//       key: "fly",
//       frames: scene.anims.generateFrameNames("vulture", {
//         start: 10,
//         end: 14,
//         prefix: "Vulture_",
//         suffix: ".png",
//       }),
//       repeat: -1,
//       frameRate: 15,
//     });

//     this.add(this.vulture);

//     const containerBody = scene.matter.add.gameObject(this, {
//       friction: 0.5,
//       frictionAir: 0.001,
//       shape: {
//         type: "rectangle",
//       },
//       //   isSensor: true,
//     });
//     containerBody.setBounce(1);
//     containerBody.setCollisionCategory(1);
//     // containerBody.setCollidesWith([1]);

//     this.setSize(200, 200);
//     scene.add.existing(this);
//   }
// }
