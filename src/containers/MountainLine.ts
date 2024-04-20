class MountainLine extends Phaser.GameObjects.Line {
  constructor(scene, x, y, x1, y1, x2, y2, strokeColor) {
    super(scene, x, y, x1, y1, x2, y2, strokeColor);
    // ...
    scene.add.existing(this);
  }
  // ...

  // preUpdate(time, delta) {}
}
