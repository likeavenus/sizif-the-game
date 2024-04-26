import Phaser from "phaser";

export default class Preloader extends Phaser.Scene {
  constructor() {
    super("preloader");
  }

  onLoad() {
    const loadingText = this.add.text(this.sys.canvas.width / 2 - 50, this.sys.canvas.height / 2, "Loading in progress...", {
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
    /** Atlases */

    /** Images */
    this.load.image("boulder", "assets/boulder/boulder.png");
    this.load.image("boulder_gray", "assets/boulder/boulder_gray.png");
    this.load.image("vase", "assets/vase/vase.png");
    this.load.image("leg_1", "assets/vulture/Leg_1.png");
    this.load.image("leg_2", "assets/vulture/Leg_2.png");
    this.load.image("leg_3", "assets/vulture/Leg_3.png");
    this.load.image("info", "assets/info/info.png");
    this.load.image("board", "assets/info/Board.png");
    this.load.image("sky", "assets/sky/sky.png");

    this.load.image("sky_1", "assets/sky/sky_1.png");

    /** Physics editor */
    // this.load.json("boulder_shapes", "assets/boulder/boulder_shapes.json");
    this.load.json("vase", "assets/vase/vase.json");

    /** Spine */
    this.load.spine("sizif2", "assets/sizif2/sizif.json", "assets/sizif2/sizif.atlas");

    /** Sprites */
    this.load.atlas("bolt", "assets/bolt/bolt.png", "assets/bolt/bolt.json");
    this.load.atlas("vulture", "assets/vulture/vulture.png", "assets/vulture/vulture.json");

    /** glsl */
    this.load.glsl("example", "assets/shaders/example.glsl");
    /** sounds */
    this.load.audio("thunder", "assets/sounds/grom-3.mp3");
    this.load.audio("melody", "assets/sounds/melody.mp3");
  }

  create() {
    this.scene.start("Game");
    // this.scene.start("Menu");
  }
}
