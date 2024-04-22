import Phaser from "phaser";

export default class Preloader extends Phaser.Scene {
  constructor() {
    super("preloader");
  }

  onLoad() {
    const loadingText = this.add.text(this.sys.canvas.width / 2 - 50, this.sys.canvas.height / 2, "Загрузка...", {
      fontSize: 18,
    });
    const loadingPercent = this.add.text(loadingText.x + 20, loadingText.y + 20, "0");
    this.load.on("progress", function (value: number) {
      loadingPercent.text = `${Math.floor(value * 100)}%`;
    });
  }

  preload() {
    this.onLoad();
    /** Tiles */
    // this.load.image(
    //   "mountains_lightened",
    //   "assets/background/mountains_lightened.png"
    // );
    // this.load.image("sky_lightened", "assets/background/sky_lightened.png");
    this.load.image("mountains", "assets/background/mountains.png");
    this.load.image("sky", "assets/background/sky.png");
    this.load.image("s", "assets/sizif/sizif-example.png");
    /** Atlases */

    /** objects */

    /** Images */
    this.load.image("boulder", "assets/boulder/boulder.png");
    /** Spine */
    this.load.spine("sizif", "assets/sizif/sizif.json", "assets/sizif/sizif.atlas");

    this.load.spine("sizif2", "assets/sizif2/sizif.json", "assets/sizif2/sizif.atlas");
  }

  create() {
    this.scene.start("Game");
    // this.scene.start("Menu");
  }
}
