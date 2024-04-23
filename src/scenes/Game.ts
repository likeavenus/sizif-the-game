import Phaser from "phaser";
import Intro from "./Intro";
import Preloader from "./Preload";
import Boulder from "../containers/Boulder";
import "phaser/plugins/spine/dist/SpinePlugin";
import "../containers/SpineContainer";
import simplify from "simplify-js";
import SpineContainer from "../containers/SpineContainer";

let gameOptions = {
  // start vertical point of the terrain, 0 = very top; 1 = very bottom
  startTerrainHeight: 0.7,

  // max slope amplitude, in pixels
  amplitude: 100,

  // slope length range, in pixels
  slopeLength: [150, 350],

  // a mountain is a a group of slopes.
  mountainsAmount: 2,

  // amount of slopes for each mountain
  slopesPerMountain: 10,
};

class Game extends Phaser.Scene {
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  // player!: ISpineContainer;
  player!: SpineContainer;
  boulder!: Boulder;
  isTouchingGround = false;
  level: number = 1;
  emitter = new Phaser.Events.EventEmitter();
  music!: Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;
  canPushBoulder = false;

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
    // const montain = this.add.rectangle(0, innerHeight, 5000, 20, 0xffffff);
    // montain.setDepth(100);
    // this.matter.add.gameObject(montain, {
    //   isStatic: true,
    //   angle: Phaser.Math.DegToRad(160),
    // });
    // const s = this.matter.add.image(600, 300, "s", undefined).setDepth(10);

    this.boulder = new Boulder(this, 600, 300, "boulder", undefined);
    // this.player = this.add.spineContainer(0, 100, "sizif", "animation", true);
    this.player = this.add.spineContainer(0, 130, "sizif2", "idle", true);

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
        sprite: this.add.tileSprite(0, 0, width, height, "sky").setOrigin(0, 0).setScrollFactor(0, 0).setScale(3, 4),
        // .setDepth(0),
      }
      // {
      //   ratioX: 0.09,
      //   ratioY: 0.02,
      //   sprite: this.add.tileSprite(0, 0, width, height, "mountains").setOrigin(0, 0).setScrollFactor(0, 0).setScale(4, 5),
      //   // .setDepth(0),
      // }
    );

    this.matter.add.mouseSpring();

    const debugLayer = this.add.graphics();

    this.cameras.main.startFollow(this.player.sgo);

    this.mountainGraphics = [];
    this.mountainStart = new Phaser.Math.Vector2(0, 0);
    this.bodyPool = [];
    this.bodyPoolId = [];

    for (let i = 0; i < gameOptions.mountainsAmount; i++) {
      // each mountain is a graphics object
      this.mountainGraphics[i] = this.add.graphics();

      // generateTerrain is the method to generate the terrain. The arguments are the graphics object and the start position
      this.mountainStart = this.generateTerrain(this.mountainGraphics[i], this.mountainStart);
    }
  }

  update(time: number, delta: number) {
    this.boulder.update(this.cursors);
    this.player.update(this.cameras.main, this.cursors);

    // for (let i = 0; i < this.backgrounds.length; ++i) {
    //   const bg = this.backgrounds[i];
    //   if (bg.sprite) {
    //     bg.sprite.tilePositionX = this.cameras.main.scrollX * bg.ratioX;
    //     // bg.sprite.tilePositionY = this.cameras.main.scrollY * bg.ratioY;
    //   }
    // }

    this.player.checkCanPush(this.player.sgo.x, this.player.sgo.y, this.boulder.x, this.boulder.y);
  }

  interpolate(vFrom, vTo, delta) {
    let interpolation = (1 - Math.cos(delta * Math.PI)) * 0.5;
    return vFrom * (1 - interpolation) + vTo * interpolation;
  }
  // method to generate the terrain. Arguments: the graphics object and the start position
  generateTerrain(graphics, mountainStart) {
    // array to store slope points (точки наклона)
    let slopePoints = [];

    // variable to count the amount of slopes
    let slopes = 0;

    // slope start point
    let slopeStart = new Phaser.Math.Vector2(0, mountainStart.y);

    // set a random slope length
    let slopeLength = Phaser.Math.Between(gameOptions.slopeLength[0], gameOptions.slopeLength[1]);

    // determine slope end point, with an exception if this is the first slope of the fist mountain: we want it to be flat
    let slopeEnd =
      mountainStart.x == 0
        ? new Phaser.Math.Vector2(slopeStart.x + gameOptions.slopeLength[1] * 1.5, 0)
        : new Phaser.Math.Vector2(slopeStart.x + slopeLength, Math.random());

    // current horizontal point
    let pointX = 0;

    let deltaY = Math.random() * 2 - 0.5;

    // while we have less slopes than regular slopes amount per mountain...
    while (slopes < gameOptions.slopesPerMountain) {
      // slope interpolation value
      let interpolationVal = this.interpolate(slopeStart.y, slopeEnd.y, (pointX - slopeStart.x) / (slopeEnd.x - slopeStart.x));

      // if current point is at the end of the slope...
      if (pointX == slopeEnd.x) {
        // increase slopes amount
        slopes++;
        // slopeEnd.y -= deltaY;

        // next slope start position
        slopeStart = new Phaser.Math.Vector2(pointX, slopeEnd.y);

        // next slope end position
        slopeEnd = new Phaser.Math.Vector2(slopeEnd.x + Phaser.Math.Between(gameOptions.slopeLength[0], gameOptions.slopeLength[1]), Math.random());

        // no need to interpolate, we use slope start y value
        interpolationVal = slopeStart.y;
      }

      // current vertical point
      let pointY = game.config.height * gameOptions.startTerrainHeight + interpolationVal * gameOptions.amplitude;

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

    // loop through all simpleSlope points starting from the second
    for (let i = 1; i < simpleSlope.length; i++) {
      // define a line between previous and current simpleSlope points
      let line = new Phaser.Geom.Line(simpleSlope[i - 1].x, simpleSlope[i - 1].y, simpleSlope[i].x, simpleSlope[i].y);

      // calculate line length, which is the distance between the two points
      let distance = Phaser.Geom.Line.Length(line);

      // calculate the center of the line
      let center = Phaser.Geom.Line.GetPoint(line, 0.5);

      // calculate line angle
      let angle = Phaser.Geom.Line.Angle(line);

      // if the pool is empty...
      if (this.bodyPool.length == 0) {
        // create a new rectangle body
        this.matter.add.rectangle(center.x + mountainStart.x, center.y, distance, 10, {
          isStatic: true,
          angle: angle,
          friction: 1,
          restitution: 0,
        });
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
    scene: [{ key: "SpinePlugin", plugin: window.SpinePlugin, mapping: "spine" }],
  },
};

export const game = new Phaser.Game(config);
