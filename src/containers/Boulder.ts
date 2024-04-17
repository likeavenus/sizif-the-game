import Phaser from "phaser";

export default class Boulder extends Phaser.Physics.Matter.Image {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string | number
  ) {
    super(scene.matter.world, x, y, texture, frame, {
      label: "boulder",
      frictionAir: 0.006,
    });

    this.setScale(0.102);
    this.setCircle(60, {});
    this.setBounce(0.1);
    this.setFriction(1, 0.01, 10);

    this.scene.add.existing(this);
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
    const { left, right } = cursors;
    const speed = 2;

    if (right.isDown) {
      this.setVelocity(speed);
    } else if (left.isDown) {
      this.setVelocityX(-speed);
    }
  }
}
