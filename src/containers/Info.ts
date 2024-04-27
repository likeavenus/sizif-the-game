import Phaser from "phaser";
import { hello } from "../scenes/constants";

export class InfoBoard extends Phaser.GameObjects.Container {
  private rectangle: Phaser.GameObjects.Rectangle;
  private boardText: Phaser.GameObjects.Text;
  board!: Phaser.GameObjects.Image;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    text: string
  ) {
    super(scene, x, y);

    this.board = new Phaser.GameObjects.Image(scene, 0, 0, "board");
    this.board.setScale(0.4);
    this.add(this.board);

    this.setSize(width, height);

    // this.boardText.setPosition(this.width / 2 - width + 16, this.height / 2 - this.height + 16);
    const screenCenterX =
      this.scene.cameras.main.worldView.x + this.scene.cameras.main.width / 2;
    const screenCenterY =
      this.scene.cameras.main.worldView.y + this.scene.cameras.main.height / 2;
    this.boardText = new Phaser.GameObjects.Text(scene, 0, 0, text, {
      wordWrap: { width: width - 16 },
      fontSize: 22,
    });
    this.add(this.boardText);

    this.setDepth(-1);
    this.setPosition(screenCenterX, screenCenterY);
    this.boardText.setPosition(
      this.boardText.x - this.boardText.width / 2,
      this.boardText.y - this.boardText.height / 2
    );

    scene.add.existing(this);

    // this.board.setScale(0.5);
    this.setScrollFactor(0, 0);
    // this.boardText = scene.add.text(this.board.x - this.board.width / 2, this.board.y, hello, {
    //   wordWrap: { width: 450 },
    //   fontSize: 24,
    // });
    // this.boardText.setScrollFactor(0, 0);

    // this.boardText.setPosition(this.width / 2 - width + 16, this.height / 2 - this.height + 16);
  }
}
