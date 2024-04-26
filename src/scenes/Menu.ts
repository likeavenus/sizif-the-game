import Phaser from "phaser";

export default class Menu extends Phaser.Scene {
  window!: Phaser.GameObjects.Rectangle;
  text!: Phaser.GameObjects.Text;
  state: string = "none";
  constructor() {
    super("Menu");
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    this.cameras.main.setBackgroundColor("#89b2fe");

    const cover = this.add.image(centerX, centerY, "cover", undefined);

    const startButton = this.add
      .text(centerX, cover.y + 310, "Play", {
        fontFamily: "Arial",
        fontSize: "30px",
        color: "#ffffff",
        align: "center",
        fixedWidth: 240,
        backgroundColor: "#2d2d2d",
      })
      .setPadding(32)
      .setOrigin(0.5);

    startButton.setInteractive({ useHandCursor: true });
    startButton.on("pointerover", () => {
      startButton.setBackgroundColor("#8d8d8d");
    });

    startButton.on("pointerout", () => {
      startButton.setBackgroundColor("#2d2d2d");
    });

    startButton.on("pointerdown", this.startGame);
  }

  startGame = () => {
    this.scene.start("preloader");
  };
}
