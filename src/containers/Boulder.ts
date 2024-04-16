import Phaser from "phaser";

export default class Boulder extends Phaser.Physics.Matter.Image {
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(scene.matter.world, x, y, texture, frame, {
      label: "boulder",
      frictionAir: 0.006,
    });

    this.setScale(0.102);
    this.setCircle(60, {});
    this.setBounce(0.2);
    this.setFriction(0.005);

    this.scene.add.existing(this);
  }
}
