import Phaser from "phaser";
import Intro from "./Intro";
import Preloader from "./Preload";
import Boulder from "../containers/Boulder";
import "phaser/plugins/spine/dist/SpinePlugin";
import "../containers/SpineContainer";

class Game extends Phaser.Scene {
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  player!: ISpineContainer;
  boulder!: Boulder;
  isTouchingGround = false;
  level: number = 1;
  emitter = new Phaser.Events.EventEmitter();
  music!:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;

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
    const montain = this.add.rectangle(0, innerHeight, 5000, 20, 0xffffff);
    montain.setDepth(100);
    this.matter.add.gameObject(montain, {
      isStatic: true,
      angle: Phaser.Math.DegToRad(160),
    });

    this.boulder = new Boulder(this, 600, 100, "boulder", undefined);
    this.player = this.add.spineContainer(0, 100, "sizif", "animation", true);
    this.player.spine.setCollisionCategory(1);
    this.boulder.setCollisionCategory(2);
    this.player.rightArmHitBox.setCollisionCategory(3);
    this.player.leftArmHitBox.setCollisionCategory(4);

    this.player.spine.setCollidesWith([1, 2]);
    this.boulder.setCollidesWith([3, 4]);
    this.player.rightArmHitBox.setCollidesWith([2]);
    this.player.leftArmHitBox.setCollidesWith([2]);

    const { width, height } = this.scale;

    this.backgrounds.push(
      {
        ratioX: 0.07,
        ratioY: 0.009,
        sprite: this.add
          .tileSprite(0, 0, width, height, "sky")
          .setOrigin(0, 0)
          .setScrollFactor(0, 0)
          .setScale(3, 4),
        // .setDepth(0),
      },
      {
        ratioX: 0.09,
        ratioY: 0.02,
        sprite: this.add
          .tileSprite(0, 0, width, height, "mountains")
          .setOrigin(0, 0)
          .setScrollFactor(0, 0)
          .setScale(3, 3),
        // .setDepth(0),
      }
    );

    // this.player.spine.setCollisionGroup(group1);

    // this.boulder.setCollidesWith([group2, group1]);

    // this.player.rightArmHitBox.setCollisionGroup(group2);
    // this.player.leftArmHitBox.setCollisionGroup(group2);

    // this.player.rightArmHitBox.setCollidesWith([group2]);
    // this.player.leftArmHitBox.setCollidesWith([group2]);

    // this.physics.add.existing(this.player);

    // const text = this.add.text(1200, 20, "Sizif", { fontSize: 18 });
    // this.matter.add.gameObject(text);

    this.input.on("pointerdown", (pointer) => {});

    // const eKey = this.input.keyboard?.addKey("E");
    // const space = this.input.keyboard.addKey("space");
    // space.on("down", () => {});

    this.matter.add.mouseSpring();

    const debugLayer = this.add.graphics();

    // this.cameras.main.setFollowOffset(-30, 80);
    this.cameras.main.startFollow(this.player.sgo);
  }

  update(time: number, delta: number) {
    this.boulder.update(this.cursors);
    this.player.update(this.cameras.main, this.cursors);

    for (let i = 0; i < this.backgrounds.length; ++i) {
      const bg = this.backgrounds[i];
      if (bg.sprite) {
        bg.sprite.tilePositionX = this.cameras.main.scrollX * bg.ratioX;
        // bg.sprite.tilePositionY = this.cameras.main.scrollY * bg.ratioY;
      }
    }
  }
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
        right: false,
        top: true,
        bottom: true,
      },
    },
  },
  // scene: [Intro, Preloader, Game],
  scene: [Preloader, Game],
  plugins: {
    scene: [
      { key: "SpinePlugin", plugin: window.SpinePlugin, mapping: "spine" },
    ],
  },
};

export const game = new Phaser.Game(config);
