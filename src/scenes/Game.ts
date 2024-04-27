import Phaser from "phaser";
import Intro from "./Intro";
import Preloader from "./Preload";
import Boulder from "../containers/Boulder";
import "phaser/plugins/spine/dist/SpinePlugin";
import "../containers/SpineContainer";
import simplify from "simplify-js";
import SpineContainer from "../containers/SpineContainer";
import PhaserRaycaster from "phaser-raycaster";
import { BONES, hello } from "./constants";
import { Vulture } from "../containers/Vulture";
import { InfoBoard } from "../containers/Info";
import Menu from "./Menu";
// import VultureContainer from "../containers/Vulture";

let gameOptions = {
  // start vertical point of the terrain, 0 = very top; 1 = very bottom
  startTerrainHeight: 0.7,

  // max slope amplitude, in pixels
  amplitude: 100,

  // slope length range, in pixels
  slopeLength: [150, 1050],

  // a mountain is a a group of slopes.
  mountainsAmount: 1,

  // amount of slopes for each mountain
  slopesPerMountain: 40,
};

class Game extends Phaser.Scene {
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  // player!: ISpineContainer;
  player!: SpineContainer;
  boulder!: Boulder;
  isTouchingGround = false;
  level: number = 1;
  emitter = new Phaser.Events.EventEmitter();
  music!:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;
  canPushBoulder = false;
  vases!: Phaser.Physics.Matter.Image[];
  canTakeVase = false;
  lightningBolt!: Phaser.Physics.Matter.Sprite;
  sizifSays!: Phaser.GameObjects.Text;
  vaseHelperText!: Phaser.GameObjects.Text;
  vulture!: Vulture;
  board!: InfoBoard;
  constraint!: Phaser.Physics.Matter.Factory;
  info!: Phaser.Physics.Matter.Image;
  infoHelperText!: Phaser.GameObjects.Text;
  canReadInfo = false;
  thunderSound!:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;
  melody!:
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
    this.vaseHelperText = this.add.text(0, 0, "drag vase");
    this.vaseHelperText.setAlpha(0);
    this.vaseHelperText.setDepth(130);
    // this.vulture = new Vulture(
    //   this,
    //   Phaser.Math.Between(-1000, 1000),
    //   -500,
    //   "vulture",
    //   "vulture"
    // );
    this.vulture = new Vulture(this, -100, -300, "vulture", "vulture");

    this.boulder = new Boulder(this, 600, 300, "boulder_gray", undefined);
    this.info = this.matter.add.image(350, 542, "info", undefined);

    this.info.setRectangle(150, 150, {
      isStatic: true,
      isSensor: true,
    });
    this.info.setDepth(100);
    this.infoHelperText = this.add.text(
      this.info.x - 100,
      this.info.y - 80,
      "Press E to read info"
    );
    this.infoHelperText.setDepth(100);
    this.infoHelperText.alpha = 0;

    const eKey = this.input.keyboard?.addKey("E");
    this.board = new InfoBoard(this, 200, 200, 500, 500, hello);

    let toggler = false;
    eKey?.on("down", () => {
      if (this.canReadInfo) {
        if (!toggler) {
          this.board.setDepth(250);
          toggler = true;
        } else {
          this.board.setDepth(-1);

          toggler = false;
        }
      } else {
        toggler = false;
        this.board.setDepth(-1);
      }
    });

    this.sizifSays = this.add.text(0, 0, "Holy sh#t!", {
      fontSize: 24,
    });

    this.sizifSays.alpha = 0;
    this.sizifSays.setDepth(110);
    this.player = this.add.spineContainer(0, 140, "sizif2", "idle", true);

    this.player.spine.setCollisionCategory(2);
    this.boulder.setCollisionCategory(4);
    this.player.rightArmHitBox.setCollisionCategory(0);
    this.player.leftArmHitBox.setCollisionCategory(8);
    this.vulture.setCollisionCategory(16);

    this.boulder.setCollidesWith([1, 8, 16]);
    this.player.rightArmHitBox.setCollidesWith([0]);
    this.player.leftArmHitBox.setCollidesWith([4]);
    this.vulture.setCollidesWith([1, 4, 32]);

    const { width, height } = this.scale;
    this.add
      .tileSprite(0, 0, width, height, "sky_1")
      .setOrigin(0, 0)
      .setScrollFactor(0, 0);

    this.backgrounds.push(
      {
        ratioX: 0.07,
        ratioY: 0.009,
        sprite: this.add
          .tileSprite(0, 0, width, height, "sky")
          .setOrigin(0, 0)
          .setScrollFactor(0, 0)
          .setDepth(1)
          .setScale(1, 1),
      }
      // {
      //   ratioX: 0.07,
      //   ratioY: 0.009,
      //   sprite: this.add.tileSprite(0, 0, width, height, "sky_2").setOrigin(0, 0).setScrollFactor(0, 0).setDepth(1).setScale(1, 0.3),
      // },
      // {
      //   ratioX: 0.07,
      //   ratioY: 0.009,
      //   sprite: this.add
      //     .tileSprite(0, height / 2, width, height, "sky_3")
      //     .setOrigin(0, 0.3)
      //     .setScrollFactor(0, 0)
      //     .setDepth(2)
      //     .setScale(1, 0.3),
      // },
      // {
      //   ratioX: 0.09,
      //   ratioY: 0.02,
      //   sprite: this.add.tileSprite(0, height, width, height, "sky_4").setOrigin(0, 1).setScrollFactor(0, 0).setDepth(3).setScale(1, 0.3),
      // }
    );

    this.matter.add.mouseSpring();
    // this.boulder.enableDra

    const debugLayer = this.add.graphics();

    this.cameras.main.startFollow(this.player.spine);
    this.cameras.main.setFollowOffset(undefined, 20);
    // this.cameras.main.zoomTo(0.5);

    this.mountainGraphics = [];
    this.mountainStart = new Phaser.Math.Vector2(0, 0);
    this.bodyPool = [];
    this.bodyPoolId = [];

    for (let i = 0; i < gameOptions.mountainsAmount; i++) {
      // each mountain is a graphics object
      this.mountainGraphics[i] = this.add.graphics();

      // generateTerrain is the method to generate the terrain. The arguments are the graphics object and the start position
      this.mountainStart = this.generateTerrain(
        this.mountainGraphics[i],
        this.mountainStart
      );
    }

    this.vases = this.generateVases();
    this.lightningBolt = this.matter.add.sprite(
      -2500,
      this.player.spine.y,
      "bolt",
      undefined,
      {
        isStatic: true,
        isSensor: true,
      }
    );
    this.lightningBolt.alpha = 0;
    this.lightningBolt.setDepth(103);

    this.matter.world.on(
      "collisionstart",
      (e, bodyA, bodyB) => {
        if (
          (bodyA === this.player.spine.body &&
            bodyB === this.lightningBolt.body) ||
          (bodyA === this.lightningBolt.body &&
            bodyB === this.player.spine.body)
        ) {
          this.playerGetDamage();
        }

        if (bodyA === this.vulture.body && bodyB === this.boulder.body) {
          this.constraint = this.matter.add.constraint(
            this.vulture.body,
            this.boulder.body,
            30,
            0.05,
            {
              pointA: { x: 0, y: 80 },
              pointB: { x: 0, y: -150 },
            }
          );

          this.vulture.setCollidesWith([1, 10, 32]);
          this.boulder.setCollidesWith([8, 1]);

          this.vulture.withBoulder = true;
        }

        if (
          (bodyA === this.vulture.body &&
            bodyB?.gameObject?.body?.label === "vase") ||
          (bodyA?.gameObject?.body?.label === "vase" &&
            bodyB === this.vulture.body)
        ) {
          this.vulture.withBoulder = false;
          this.vulture.canAttack = false;
          // TODO: Destroy vases
          // bodyB.gameObject.destroy(true);

          if (this.constraint) {
            this.matter.world.removeConstraint(this.constraint);
          }
        }

        if (
          (bodyA === this.info.body && bodyB === this.player.spine.body) ||
          (bodyA === this.player.spine.body && bodyB === this.info.body)
        ) {
          this.canReadInfo = true;
          this.infoHelperText.alpha = 1;
        }
      },
      this
    );

    this.matter.world.on("collisionend", (e, bodyA, bodyB) => {
      if (bodyA === this.info.body && bodyB === this.player.spine.body) {
        this.canReadInfo = false;
        this.infoHelperText.alpha = 0;
      }
    });

    this.anims.create({
      key: "strike",
      frames: this.anims.generateFrameNames("bolt", {
        start: 10,
        end: 14,
        prefix: "Explosion_",
        suffix: ".png",
      }),
      // repeat: -1,
      frameRate: 14,
      // hideOnComplete: true,
      hideOnComplete: true,
      showOnStart: true,
    });

    this.thunderSound = this.sound.add("thunder", { volume: 0.2 });
    this.thunderSound.pause();

    this.melody = this.sound.add("melody", {
      volume: 0.4,
    });
    // this.melody.play();

    // this.matter.world.on("collisionstart", this.handleCollision, this);
    this.time.addEvent({
      delay: Phaser.Math.Between(1000, 8000),
      callback: this.zeusAttack,
      callbackScope: this,
      loop: true,
    });

    this.moveBirdToBall();
    // end of create
  }

  playerGetDamage() {
    this.player.leftArmHitBox.setCollidesWith([0]);

    // lightning strike effect
    const initColor = this.player.spine.skeleton.findSlot(BONES[0]).color;
    // this.player.spine.play("bolt_damage");
    BONES.forEach((name) => {
      this.player.spine.skeleton.findSlot(name).color = {
        r: 255,
        g: 255,
        b: 255,
        a: 1,
      };
      this.time.delayedCall(50, () => {
        this.player.spine.skeleton.findSlot(name).color = {
          r: 0,
          g: 0,
          b: 0,
          a: 1,
        };
      });
      this.time.delayedCall(100, () => {
        this.player.spine.skeleton.findSlot(name).color = {
          r: 255,
          g: 255,
          b: 255,
          a: 1,
        };
        this.sizifSays.alpha = 1;
        this.sizifSays.x = this.player.spine.x + 20;
        this.sizifSays.y = this.player.spine.y;
      });

      this.time.delayedCall(150, () => {
        this.player.spine.skeleton.findSlot(name).color = initColor;
        // this.player.spine.play("idle");
      });

      this.time.delayedCall(2000, () => {
        this.sizifSays.alpha = 0;
      });

      // this.player.canPushBoulder = false;
    });

    // this.matter.applyForce(this.player.spine.body, { x: -10, y: -10 });
    // this.player.spine.setPosition(this.player.spine.x - 150, this.player.spine.y - 5);

    this.time.delayedCall(2000, () => {
      this.player.leftArmHitBox.setCollidesWith([4]);
    });
  }

  update(time: number, delta: number) {
    this.boulder.update(this.cursors);
    this.player.update(this.cameras.main, this.cursors);
    this.vulture.update(this.boulder);

    // if (this.boulder.x + 100 < this.player.spine.x) {
    //   // console.log("Boulder is falling!");
    //   this.player.leftArmHitBox.setCollidesWith([]);
    // } else {
    //   this.player.leftArmHitBox.setCollidesWith([4]);
    // }

    // if (Phaser.Math.Distance. )

    for (let i = 0; i < this.backgrounds.length; ++i) {
      const bg = this.backgrounds[i];
      if (bg.sprite) {
        bg.sprite.tilePositionX = this.cameras.main.scrollX * bg.ratioX;
        // bg.sprite.tilePositionY = this.cameras.main.scrollY * bg.ratioY;
      }
    }

    // this.player.checkCanPush(this.player.sgo.x, this.player.sgo.y, this.boulder.x, this.boulder.y);
    this.vases.forEach((item) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.leftArmHitBox.x,
        this.player.leftArmHitBox.y,
        item.x,
        item.y
      );
      item.body.ignorePointer = distance > 100;
      if (!item.body.ignorePointer) {
        this.vaseHelperText.x = item.x;
        this.vaseHelperText.y = item.y;
        this.vaseHelperText.alpha = 1;
      }
    });
  }

  zeusAttack() {
    const playerOffset = 1500;

    const mountainStartX = this.player.spine.x < 1500 ? 120 : 200;
    const attackX = Phaser.Math.Between(
      this.player.spine.x - playerOffset,
      this.player.spine.x + playerOffset
    );
    // const attackY = this.cameras.main.getWorldPoint(0, 500).y;
    const attackY = this.cameras.main.getWorldPoint(
      0,
      this.lightningBolt.height / 2
    ).y;
    // this.lightningBolt.x < this.player.spine.x
    //   ? this.player.spine.y - this.player.spine.height + mountainStartX
    //   : this.player.spine.y - this.player.spine.height + 120;
    // console.log("this.player.spine.x: ", this.player.spine.x);

    const line = new Phaser.Geom.Line(
      attackX,
      this.player.spine.y - 1000,
      attackX,
      0
    );
    const graphics = this.add.graphics({
      lineStyle: { width: 2, color: 0x000fffa },
    });

    this.tweens.add({
      targets: line,
      y2: attackY,
      duration: 1000,
      repeat: 0,
      ease: "ease.in",
      onUpdate: () => {
        graphics.strokeLineShape(line);
      },
      onComplete: () => {
        this.thunderSound.play();
        graphics.destroy(true);
        this.lightningBolt.alpha = 1;
        // this.lightningBolt.x = this.player.spine.x + 400;
        this.lightningBolt.x = attackX;
        this.lightningBolt.y = this.cameras.main.getWorldPoint(
          0,
          this.lightningBolt.height / 2
        ).y;
        this.thunderSound.setDetune(Phaser.Math.Between(-500, 1000));
        this.thunderSound.play();

        this.lightningBolt.anims.play("strike", false);
        this.lightningBolt.on("animationcomplete", () => {
          this.lightningBolt.alpha = 0;
          this.lightningBolt.y = this.player.spine.y - 1900;
        });
      },
    });
  }

  moveBirdToBall = () => {
    this.boulder.setPosition(this.boulder.x, this.boulder.y + 10);
    this.boulder.setCollidesWith([8, 16, 1]);
    this.vulture.setCollidesWith([4, 10, 1]);

    if (this.constraint) {
      this.matter.world.removeConstraint(this.constraint);
    }

    const ballX = this.boulder.x;
    const ballY = this.boulder.y - 200;
    this.tweens.add({
      targets: this.vulture,
      x: ballX,
      y: ballY,
      duration: Phaser.Math.Between(2000, 4000), // Время перемещения (2 секунды)
      onUpdate: () => {
        if (!this.vulture.canAttack) {
        }
      },
      onComplete: () => {
        this.time.delayedCall(
          Phaser.Math.Between(10000, 20000),
          this.moveBirdToBall
        );
        // После завершения перемещения, можно добавить проверку коллизии, например:
        // if (this.matter.overlap(this.bird, this.ball)) {
        //   console.log('Коллизия!');
        // }
      },
    });
    // if (this.vulture.canAttack) {
    //   // Получаем координаты шара
    //   const ballX = this.boulder.x;
    //   const ballY = this.boulder.y;

    //   // Перемещаем птицу к координатам шара
    //   this.tweens.add({
    //     targets: this.vulture,
    //     x: ballX,
    //     y: ballY,
    //     duration: 2000, // Время перемещения (2 секунды)
    //     onUpdate: () => {
    //       console.log(this.vulture.canAttack);
    //     },
    //     onComplete: () => {
    //       // После завершения перемещения, можно добавить проверку коллизии, например:
    //       // if (this.matter.overlap(this.bird, this.ball)) {
    //       //   console.log('Коллизия!');
    //       // }
    //     },
    //   });
    // }
  };

  generateVases = (numVases: number = 30): Phaser.Physics.Matter.Image[] => {
    const vaseWidth = 50;
    const vaseSpacing = 500;

    const vases: Phaser.Physics.Matter.Image[] = [];

    const totalWidth = vaseWidth * numVases + vaseSpacing * (numVases - 1);
    // const totalWidth = this.vaseWidth * this.numVases + this.vaseSpacing * (this.numVases - 1);
    const vaseShape = this.scene.scene.cache.json.get("vase").vaza;

    const startX = 0;

    for (let i = 0; i < numVases; i++) {
      const x = startX + i * (vaseWidth + vaseSpacing);
      const vase = this.matter.add.image(x, -i * 200, "vase", undefined, {
        shape: vaseShape,
        label: "vase",
        ignorePointer: true,
      });
      vase.setScale(0.4);
      vase.setCollisionCategory(32);
      vase.setCollidesWith([1, 16]);
      vase.setDepth(101);

      // vase.setInteractive();

      // vase.preFX.setPadding(32);
      // let fx;
      // vase
      //   .on("pointerover", () => {
      //     if (Phaser.Math.Distance.Between(this.player.spine.x, this.player.spine.y, vase.x, vase.y) < 160) {
      //       if (!fx) {
      //         fx = vase.postFX.addGlow();
      //       }

      //       this.tweens.add({
      //         targets: fx,
      //         outerStrength: 5,
      //         loop: -1,
      //         ease: "ease.in",
      //       });
      //     }
      //   })
      //   .on("pointerout", () => {
      //     if (fx) {
      //       this.tweens.add({
      //         targets: fx,
      //         outerStrength: -1,
      //         ease: "linear",
      //       });
      //     }
      //   });

      vases.push(vase);
    }

    return vases;
  };

  // handleCollision(event) {
  //   const pairs = event.pairs;

  //   for (let i = 0; i < pairs.length; i++) {
  //     const bodyA = pairs[i].bodyA;
  //     const bodyB = pairs[i].bodyB;
  //     if (bodyB.label === "vase" || bodyA.label === "vase") {
  //       // Обрабатываем коллизию игрока с вазой
  //       console.log("Ваза разбита!");
  //       // Здесь можно удалить вазу или сделать что-то другое
  //     }
  //   }
  // }

  interpolate(vFrom, vTo, delta) {
    let interpolation = (1 - Math.cos(delta * Math.PI)) * 0.5;
    return vFrom * (1 - interpolation) + vTo * interpolation;
  }

  // method to generate the terrain. Arguments: the graphics object and the start position
  generateTerrain(graphics, mountainStart) {
    // array to store slope points
    let slopePoints = [];

    // variable to count the amount of slopes
    let slopes = 0;

    // slope start point
    let slopeStart = new Phaser.Math.Vector2(0, mountainStart.y);

    // set a random slope length
    let slopeLength = Phaser.Math.Between(
      gameOptions.slopeLength[0],
      gameOptions.slopeLength[1]
    );

    // determine slope end point, with an exception if this is the first slope of the fist mountain: we want it to be flat
    let slopeEnd =
      mountainStart.x == 0
        ? new Phaser.Math.Vector2(slopeStart.x + gameOptions.slopeLength[1], 0)
        : new Phaser.Math.Vector2(slopeStart.x + slopeLength, Math.random());

    // current horizontal point
    let pointX = 0;

    let deltaY = 2.5;

    // while we have less slopes than regular slopes amount per mountain...
    while (slopes < gameOptions.slopesPerMountain) {
      // slope interpolation value
      let interpolationVal = this.interpolate(
        slopeStart.y,
        slopeEnd.y,
        (pointX - slopeStart.x) / (slopeEnd.x - slopeStart.x)
      );
      // console.log("interpolationVal: ", interpolationVal);

      // if current point is at the end of the slope...
      if (pointX == slopeEnd.x) {
        // increase slopes amount
        slopes++;

        // next slope start position
        slopeStart = new Phaser.Math.Vector2(pointX, slopeEnd.y);
        // next slope end position
        slopeEnd = new Phaser.Math.Vector2(
          slopeEnd.x +
            Phaser.Math.Between(
              gameOptions.slopeLength[0],
              gameOptions.slopeLength[1]
            ),
          slopeEnd.y - deltaY
        );
        // console.log("slopeStart: ", slopeStart);
        // console.log("slopeEnd: ", slopeEnd);

        // no need to interpolate, we use slope start y value
        interpolationVal = slopeStart.y;
      }

      // current vertical point
      let pointY =
        game.config.height * gameOptions.startTerrainHeight +
        interpolationVal * gameOptions.amplitude;

      // add new point to slopePoints array
      slopePoints.push(new Phaser.Math.Vector2(pointX, pointY));
      // move on to next point
      pointX++;
    }

    // simplify the slope
    let simpleSlope = simplify(slopePoints, 1, true);

    // place graphics object
    graphics.x = mountainStart.x;

    // draw the ground
    graphics.clear();
    graphics.moveTo(0, game.config.height);
    graphics.fillStyle(0xfcb95b);
    graphics.beginPath();
    simpleSlope.forEach(
      function (point) {
        graphics.lineTo(point.x, point.y);
      }.bind(this)
    );
    graphics.lineTo(pointX, game.config.height);
    graphics.lineTo(0, game.config.height);
    graphics.closePath();
    graphics.fillPath();

    // draw the grass
    graphics.lineStyle(16, 0xd09b51);
    graphics.beginPath();
    simpleSlope.forEach(function (point) {
      graphics.lineTo(point.x, point.y);
    });
    graphics.strokePath();
    graphics.setDepth(5);

    // loop through all simpleSlope points starting from the second
    for (let i = 1; i < simpleSlope.length; i++) {
      // define a line between previous and current simpleSlope points
      let line = new Phaser.Geom.Line(
        simpleSlope[i - 1].x,
        simpleSlope[i - 1].y,
        simpleSlope[i].x,
        simpleSlope[i].y
      );

      // calculate line length, which is the distance between the two points
      let distance = Phaser.Geom.Line.Length(line);

      // calculate the center of the line
      let center = Phaser.Geom.Line.GetPoint(line, 0.5);

      // calculate line angle
      let angle = Phaser.Geom.Line.Angle(line);

      // if the pool is empty...
      if (this.bodyPool.length == 0) {
        // create a new rectangle body
        this.matter.add.rectangle(
          center.x + mountainStart.x,
          center.y,
          distance,
          10,
          {
            isStatic: true,
            angle: angle,
            friction: 1,
            restitution: 0,
          }
        );
      }

      // if the pool is not empty...
      else {
        // get the body from the pool
        let body = this.bodyPool.shift();
        this.bodyPoolId.shift();

        // reset, reshape and move the body to its new position
        this.matter.body.setPosition(body, {
          x: center.x + mountainStart.x,
          y: center.y,
        });
        let length = body.area / 10;
        this.matter.body.setAngle(body, 0);
        this.matter.body.scale(body, 1 / length, 1);
        this.matter.body.scale(body, distance, 1);
        this.matter.body.setAngle(body, angle);
      }
    }

    // assign a custom "width" property to the graphics object
    graphics.width = pointX - 1;

    // return the coordinates of last mountain point
    return new Phaser.Math.Vector2(graphics.x + pointX - 1, slopeStart.y);
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
      // debug: true,
      setBounds: {
        left: true,
        right: false,
        top: false,
        bottom: true,
      },
    },
  },
  scene: [Intro, Menu, Preloader, Game],
  // scene: [Preloader, Game],
  plugins: {
    scene: [
      { key: "SpinePlugin", plugin: window.SpinePlugin, mapping: "spine" },
      // {
      //   key: "PhaserRaycaster",
      //   plugin: PhaserRaycaster,
      //   mapping: "raycasterPlugin",
      // },
    ],
  },
};

export const game = new Phaser.Game(config);
