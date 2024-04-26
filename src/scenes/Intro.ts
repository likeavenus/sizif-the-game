import Phaser from "phaser";

export default class Intro extends Phaser.Scene {
  constructor() {
    super("intro");
  }

  preload() {
    this.load.image("phaser-logo", "assets/phaser-logo.png");
    this.load.image("cover", "assets/menu/cover.png");
  }

  create() {
    const phaserImage = this.add.image(this.sys.canvas.width / 2 - 382 / 2, this.sys.canvas.height / 3, "phaser-logo").setOrigin(0);
    const introText = this.add
      .text(this.sys.canvas.width / 2 - 72.5, phaserImage.y - 50, "Powered by", {
        fontSize: 24,
      })
      .setOrigin(0);

    phaserImage.setScale(0.5);
    phaserImage.alpha = 0;

    introText.alpha = 0;

    this.tweens.add({
      targets: [phaserImage, introText],
      alpha: 1,
      ease: "linear", // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: 800,
      onComplete: () => {
        this.tweens.add({
          targets: [phaserImage, introText],
          alpha: 0,
          ease: "linear",
          duration: 800,
          delay: 2200,
          onComplete: () => {
            this.scene.start("Menu");
          },
        });
      },
    });
  }
}
