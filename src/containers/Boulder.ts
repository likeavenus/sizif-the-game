import Phaser from "phaser";

export default class Boulder extends Phaser.Physics.Matter.Image {
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(scene.matter.world, x, y, texture, frame, {
      label: "boulder",
      // frictionAir: 0.006,
      // shape: scene.cache.json.get("boulder_shapes").boulder_gray,
    });

    // this.setFriction(0.2, 0.009, 0.1);

    this.setCircle(170, {
      friction: 0.1,
      frictionAir: 0.009,
      frictionStatic: 8.1,
      ignorePointer: true,
    });
    this.setBounce(0.2);

    this.setDepth(100);

    this.scene.add.existing(this);
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
    const { left, right } = cursors;
    const speed = 2;

    // if (right.isDown) {
    //   this.setVelocity(speed);
    // } else if (left.isDown) {
    //   this.setVelocityX(-speed);
    // }
  }
}
