import Phaser from "phaser";
import Intro from "./Intro";
import Preloader from "./Preload";
import Boulder from "../containers/Boulder";

class Game extends Phaser.Scene {
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  player!: Phaser.Physics.Matter.Image;
  boulder!: Boulder;
  isTouchingGround = false;
  level: number = 1;
  emitter = new Phaser.Events.EventEmitter();
  music!: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;

  private backgrounds: {
    ratioX: number;
    ratioY: number;

    sprite: Phaser.GameObjects.TileSprite;
  }[] = [];

  collisionCategory1 = 0b0001;
  collisionCategory2 = 0b0010;
  collisionCategory3 = 0b0100;
  collisionCategory4 = 0b1000;

  constructor() {
    super("Game");
  }
  preload() {
    this.cursors = this.input.keyboard!.createCursorKeys();
  }

  create() {
    this.boulder = new Boulder(this, 100, 100, "boulder", undefined);

    this.input.on("pointerdown", (pointer) => {});

    // const eKey = this.input.keyboard?.addKey("E");
    // const space = this.input.keyboard.addKey("space");
    // space.on("down", () => {});

    this.matter.add.mouseSpring();

    const debugLayer = this.add.graphics();

    this.cameras.main.setFollowOffset(-30, 80);
  }

  update(time: number, delta: number) {}
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  canvas: document.querySelector("#phaser") as HTMLCanvasElement,
  fps: {
    limit: 140,
  },
  width: window.innerWidth,
  height: window.innerHeight,
  scale: {
    mode: Phaser.Scale.MAX_ZOOM,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "matter",
    matter: {
      debug: true,
      setBounds: {
        left: true,
        right: true,
        top: true,
        bottom: true,
      },
    },
  },
  // scene: [Intro, Preloader, Game],
  scene: [Preloader, Game],
  plugins: {},
};

export const game = new Phaser.Game(config);
