import Phaser from "phaser";

export default class Boulder extends Phaser.Physics.Matter.Image {
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(scene.matter.world, x, y, texture, frame, {
      label: "boulder",
      frictionAir: 0.006,
      shape: scene.cache.json.get("boulder_shapes").boulder,
    });

    const shapes = this.scene.cache.json.get("boulder_shapes");

    // this.setScale(0.3);
    // this.setCircle(178, {});
    // old boulder
    // this.setScale(0.15);
    // this.setCircle(90, {});
    // this.setCircle(170, {
    //   shape: shapes.boulder,
    // });
    console.log(this);

    // this.setBounce(0.1);
    // this.setFriction(0.001, 0.005, 0);
    // this.setDensity(1);
    this.setFriction(1, 0.01, 10);

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
