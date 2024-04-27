import Phaser from "phaser";

declare global {
  interface ISpineContainer extends Phaser.GameObjects.Container {
    readonly spine: SpineGameObject;
    direction: number;
    faceDirection(dir: 1 | -1): void;
    setPhysicsSize(width: number, height: number): void;
  }
}

export default class SpineContainer extends Phaser.GameObjects.Container implements ISpineContainer {
  private sgo!: SpineGameObject;
  private physicsObject!: Phaser.GameObjects.Arc;
  //   private rightArmHitBox!: Phaser.GameObjects.Arc;
  public rightArmHitBox!: Phaser.Physics.Matter.Image;
  public leftArmHitBox!: Phaser.Physics.Matter.Image;
  private canDoublejump!: boolean = false;
  healthBar!: Phaser.GameObjects.Graphics;
  public hp = 100;
  direction: number = 1;
  isPlaying = false;
  pointerX = 0;
  pointerY = 0;
  canPushBoulder = false;
  isPushing = false;
  movementMode: "push" | "walk" = "push";

  get rightHitBox() {
    return this.rightArmHitBox.body as Phaser.Physics.Arcade.Body;
  }

  get spine() {
    return this.sgo;
  }

  constructor(scene: Phaser.Scene, x: number, y: number, key: string, anim: string, loop = false) {
    super(scene, x, y);

    // this.sgo = scene.add.spine(1500, 500, key, anim, loop).refresh();
    this.sgo = scene.add.spine(300, 0, key, anim, loop).refresh();
    this.sgo.setMix("idle", "jump", 0.1);
    this.sgo.setMix("idle", "step_right", 0.1);
    this.sgo.setMix("idle", "step_left", 0.1);
    this.sgo.setMix("idle", "step_right_without_arms", 0.1);
    this.sgo.setMix("idle", "step_left_without_arms", 0.1);

    this.sgo.setMix("idle", "idle_left", 0.1);
    this.sgo.setMix("idle", "idle_right", 0.1);

    this.sgo.setMix("idle_right", "idle_left", 0.1);
    this.sgo.setMix("idle_left", "idle_right", 0.1);

    this.sgo.setMix("step_right_without_arms", "idle_right", 0.1);
    this.sgo.setMix("step_left_without_arms", "idle_left", 0.1);

    this.sgo.setMix("walk", "idle", 0.1);

    this.sgo.state.timeScale = 4.0;

    // const leftArm = this.sgo.skeleton.findBone("bone11");
    // const rightArm = this.sgo.skeleton.findBone("bone8");
    const rightArm = this.sgo.skeleton.findBone("bone7");
    const leftArm = this.sgo.skeleton.findBone("bone10");

    this.rightArmHitBox = scene.matter.add.image(rightArm.x, rightArm.y, "", undefined, {
      isSensor: false,
    });

    // this.rightArmHitBox.setBody({
    //   type: "circle",
    //   radius: 20,
    // });

    // this.rightArmHitBox.alpha = 0;

    this.leftArmHitBox = scene.matter.add.image(leftArm.x, leftArm.y, "boulder", undefined, {
      isSensor: true,
    });

    // this.leftArmHitBox.setBody({
    //   type: "circle",
    //   radius: 20,
    // });
    this.leftArmHitBox.setBody({
      type: "circle",
      radius: 30,
    });

    this.leftArmHitBox.alpha = 0;

    const IK_ruka_l = this.sgo.skeleton.findBone("ik_ruka_l");
    const IK_ruka_r = this.sgo.skeleton.findBone("ik_ruka_r");

    this.control = scene.add.circle(IK_ruka_l.worldX, IK_ruka_l.worldY, 11, 0xff00ff).setData("bones", [IK_ruka_l, IK_ruka_r]);

    this.control.setInteractive();
    // this.control2.setInteractive();

    scene.input.setDraggable(this.control);
    // scene.input.setDraggable(this.control2);

    scene.input.on("pointermove", (pointer, gameObject, dragX, dragY) => {
      this.pointerX = pointer.worldX;
      this.pointerY = pointer.worldY;

      if (gameObject.length) {
        const bones = gameObject[0].getData("bones");
        if (bones) {
          const coords1 = scene.spine.worldToLocal(pointer.x, pointer.y, this.sgo.skeleton, bones[0]);
          const coords2 = scene.spine.worldToLocal(pointer.x, pointer.y, this.sgo.skeleton, bones[1]);
          // left arm
          bones[0].x = coords1.x;
          bones[0].y = coords1.y;

          bones[0].update();
          // right arm
          bones[1].x = coords2.x;
          bones[1].y = coords2.y;

          bones[1].update();
        }
      }

      this.control.copyPosition(pointer.x, pointer.y);
    });

    // const debugLineTo = scene.add.graphics();
    // debugLineTo.lineTo(this.x, this.y);
    // debugLineTo.lineTo(control.x, control.y);
    // scene.add.existing(control);

    // this.leftArmHitBox = scene.add.circle(rightArm.worldX, this.scene.game.canvas.height - rightArm.worldY, 40, undefined, 0);
    // this.physicsObject = scene.add.circle(leftArm.worldX, this.scene.game.canvas.height - leftArm.worldY, 40, undefined, 0);

    this.body = scene.matter.add
      .gameObject(this.spine, {
        ignorePointer: true,
      })
      .setFixedRotation();

    // this.body.setCollisionCategory(0);

    // this.scene.matter.world.on("collisionend", (e, bodyA, bodyB) => {});

    this.sgo.setScale(0.7);
    this.sgo.setFriction(1, 0.005, 0);
    // this.leftArmHitBox.setFrictionStatic(0.6);
    // this.leftArmHitBox.setFriction(0.2);
    // this.leftArmHitBox.setBounce(0.5);
    // TODO: Friction
    this.leftArmHitBox.setFriction(1, 1, 0.6);

    this.setPhysicsSize(this.sgo.width * 0.65, this.sgo.height * 0.9);
    this.add(this.sgo);
    this.setDepth(102);
    scene.add.existing(this);

    const dKey = this.scene.input.keyboard?.addKey("D");
    let isRightLeg = true;

    this.sgo.state.addListener({
      start: (entry) => {
        if (
          entry.animation.name === "step_left" ||
          entry.animation.name === "step_right" ||
          entry.animation.name === "step_right_without_arms" ||
          entry.animation.name === "step_left_without_arms"
        ) {
          this.isPlaying = true;
        }
      },
      complete: (entry) => {
        if (entry.animation.name === "step_right" || entry.animation.name === "step_right_without_arms") {
          this.sgo.play("idle_right", true);
          this.isPlaying = false;
          isRightLeg = false;
        } else if (entry.animation.name === "step_left" || entry.animation.name === "step_left_without_arms") {
          this.sgo.play("idle_left", true);
          this.isPlaying = false;
          isRightLeg = true;
        }
      },
    });

    dKey?.on("down", () => {
      if (this.movementMode === "push" && !this.isPlaying) {
        this.sgo.scaleX = 0.7;
        if (isRightLeg) {
          this.rightLegStep();
        } else {
          this.leftLegStep();
        }
      }
    });

    const qKey = this.scene.input.keyboard?.addKey("Q");
    qKey?.on("down", () => {
      this.spine.setPosition(150, 500);
    });

    // this.pushText = this.scene.add.text(0, 0, "Press E to Push", {
    //   fontSize: "16px",
    //   backgroundColor: "#000",
    //   color: "#fff",
    //   padding: { x: 5, y: 2 },
    // });
    // this.pushText.setVisible(false);

    // this.add(this.pushText);
    // TODO: demo mechanic
    //   const eKey = this.scene.input.keyboard?.addKey("E");
    //   eKey?.on(
    //     "down",
    //     () => {
    //       if (this.canPushBoulder) {
    //         this.isPushing = true;
    //         this.sgo.play("idle_right", true);
    //         this.sgo.state.timeScale = 4.0;
    //       } else {
    //         this.isPushing = false;
    //         this.sgo.play("idle", true);
    //         this.sgo.state.timeScale = 1.2;
    //       }
    //     },
    //     this.scene
    //   );
  }

  rightLegStep() {
    // this.sgo.play("push_right_no_arms", false);
    this.sgo.play("step_right_without_arms", false, false);

    // this.scene.tweens.add({
    //   targets: this.body?.velocity,
    //   x: 10,
    //   duration: 700,
    //   ease: "cubic.in",
    // });
    this.scene.tweens.add({
      targets: this.sgo,
      x: this.sgo.x + 115,
      duration: 700,
      ease: "cubic.in",
    });
  }

  leftLegStep() {
    // this.sgo.play("push_left_leg", false);
    this.sgo.play("step_left_without_arms", false, false);

    this.scene.tweens.add({
      targets: this.sgo,
      x: this.sgo.x + 115,
      duration: 700,
      ease: "cubic.in",
    });
  }

  faceDirection(dir: 1 | -1) {
    if (this.sgo.scaleX === dir) {
      return;
    }
    this.direction = dir;
    this.sgo.scaleX = dir;
  }

  setPhysicsSize(width: number, height: number) {
    const body = this.body;
    this.sgo.setSize(width, height);
    // this.sgo.setOffset(width * -0.5, height);
    // body.setSize(width, height);
  }

  // TODO: demo mechanic
  // public checkCanPush(x1: number, y1: number, x2: number, y2: number) {
  //   const distance = Phaser.Math.Distance.Between(x1, y1, x2, y2);

  //   if (distance < 370 && !this.isPushing) {
  //     this.canPushBoulder = true;
  //     this.pushText.setVisible(true);
  //     this.pushText.setPosition(this.sgo.x - this.sgo.width / 2, this.sgo.y - this.sgo.height + 50);
  //   } else {
  //     this.pushText.setVisible(false);
  //     this.canPushBoulder = false;
  //     this.isPushing = false;
  //   }
  // }

  update(camera: Phaser.Cameras.Scene2D.Camera, cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    const { left, right, up, space } = cursors;
    const { W, A, S, D } = this.scene.input.keyboard?.addKeys("W,A,S,D");

    // const rightArm = this.sgo.skeleton.findBone("bone7");
    const leftArm = this.sgo.skeleton.findBone("bone10");
    const initialBone = this.sgo.skeleton.findBone("bone2");
    const backBone = this.sgo.skeleton.findBone("bone3");

    this.control.copyPosition({
      x: this.pointerX,
      y: this.pointerY,
    });

    const controlY = this.control.y - camera.scrollY;

    backBone.rotation = -controlY * 0.09 + 10;
    initialBone.rotation = -controlY * 0.1 + 125;

    initialBone.y = -controlY * 0.1 + 60;

    backBone.update();
    initialBone.update();

    // this.rightArmHitBox.copyPosition({
    //   x: rightArm.worldX + camera.midPoint.x - this.scene.game.canvas.width / 2 + 5,
    //   y: rightArm.worldY * -1 + this.scene.game.canvas.height + camera.midPoint.y - this.scene.game.canvas.height / 2 - 10,
    // });

    // Subtract the position of the hitboxes
    this.leftArmHitBox.copyPosition({
      x: leftArm.worldX + camera.midPoint.x - this.scene.game.canvas.width / 2 - 5,
      y: leftArm.worldY * -1 + this.scene.game.canvas.height + camera.midPoint.y - this.scene.game.canvas.height / 2 - 10,
    });

    // TODO: Walking mechanic;
    const speed = 3;
    if (this.movementMode === "walk") {
      if (A.isDown) {
        this.sgo.state.timeScale = 1.2;
        this.sgo.setPosition(this.sgo.x - speed, this.sgo.y);
        this.sgo.scaleX = -0.7;
        this.sgo.play("walk", true, true);
      } else if (D.isDown) {
        this.sgo.state.timeScale = 1.2;
        this.sgo.setPosition(this.sgo.x + speed, this.sgo.y);
        this.sgo.scaleX = 0.7;
        this.sgo.play("walk", true, true);
      }
    }
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  "spineContainer",
  function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, key: string, anim: string, loop = false) {
    const container = new SpineContainer(this.scene, x, y, key, anim, loop);
    this.displayList.add(container);

    return container;
  }
);
