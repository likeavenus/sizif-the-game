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

  get physicsBody() {
    console.log(this);
    return this.physicsObject.body as Phaser.Physics.Arcade.Body;
  }

  get rightHitBox() {
    return this.rightArmHitBox.body as Phaser.Physics.Arcade.Body;
  }

  get spine() {
    return this.sgo;
  }

  constructor(scene: Phaser.Scene, x: number, y: number, key: string, anim: string, loop = false) {
    super(scene, x, y);

    this.sgo = scene.add.spine(100, innerHeight - 155, key, anim, loop).refresh();
    this.sgo.setMix("idle", "walk", 0.1);
    this.sgo.setMix("idle", "jump", 0.1);
    this.sgo.setMix("idle", "push_right_leg", 0.5);
    this.sgo.setMix("idle", "push_left_leg", 0.5);
    this.sgo.setMix("idle", "push_right_no_arms", 0.5);

    this.sgo.setMix("walk", "push_right_leg", 0.1);
    this.sgo.setMix("walk", "push_left_leg", 0.1);

    this.sgo.state.timeScale = 4.0;

    const leftArm = this.sgo.skeleton.findBone("bone11");
    const rightArm = this.sgo.skeleton.findBone("bone8");

    this.rightArmHitBox = scene.matter.add.image(rightArm.x, rightArm.y, "boulder", undefined, {
      isSensor: true,
    });

    this.rightArmHitBox.setBody({
      type: "circle",
      radius: 20,
    });

    this.rightArmHitBox.alpha = 0;

    this.leftArmHitBox = scene.matter.add.image(leftArm.x, leftArm.y, "boulder", undefined, {
      isSensor: true,
    });

    this.leftArmHitBox.setBody({
      type: "circle",
      radius: 20,
    });

    this.leftArmHitBox.alpha = 0;

    const IK_ruka_l = this.sgo.skeleton.findBone("IK_ruka_l");
    const IK_ruka_r = this.sgo.skeleton.findBone("IK_ruka_r");

    this.control = scene.add.circle(IK_ruka_l.worldX, IK_ruka_l.worldY, 11, 0xff00ff).setData("bones", [IK_ruka_l, IK_ruka_r]);
    // this.control2 = scene.add.circle(IK_ruka_r.worldX, IK_ruka_r.worldY, 11, 0xffffff).setData("bone", IK_ruka_r);

    this.control.setInteractive();
    // this.control2.setInteractive();

    scene.input.setDraggable(this.control);
    // scene.input.setDraggable(this.control2);

    scene.input.on("pointermove", (pointer, gameObject, dragX, dragY) => {
      this.pointerX = pointer.worldX;
      this.pointerY = pointer.worldY;

      if (gameObject.length) {
        const bones = gameObject[0].getData("bones");

        const coords1 = scene.spine.worldToLocal(pointer.x, pointer.y, this.sgo.skeleton, bones[0]);
        const coords2 = scene.spine.worldToLocal(pointer.x, pointer.y, this.sgo.skeleton, bones[1]);

        bones[0].x = coords1.x;
        bones[0].y = coords1.y;

        bones[0].update();

        bones[1].x = coords2.x;
        bones[1].y = coords2.y;

        bones[1].update();
      }

      //   this.control.copyPosition(pointer.x, pointer.y);
    });
    // const debugLineTo = scene.add.graphics();
    // debugLineTo.lineTo(this.x, this.y);
    // debugLineTo.lineTo(control.x, control.y);
    // scene.add.existing(control);

    // scene.input.on(
    //   "drag",
    //   (pointer, gameObject, dragX, dragY) => {
    //     console.log("dragX: ", dragX);
    //     console.log("gameObject", gameObject);
    //     gameObject.x = dragX;
    //     gameObject.y = dragY;

    //     const bone = gameObject.getData("bone");
    //     console.log("bone: ", bone);

    //     const coords = scene.spine.worldToLocal(dragX, dragY, this.sgo.skeleton, bone);
    //     console.log("coords: ", coords);

    //     bone.x = coords.x;
    //     bone.y = coords.y;

    //     bone.update();
    //   },
    //   scene
    // );

    // this.leftArmHitBox = scene.add.circle(rightArm.worldX, this.scene.game.canvas.height - rightArm.worldY, 40, undefined, 0);
    // this.physicsObject = scene.add.circle(leftArm.worldX, this.scene.game.canvas.height - leftArm.worldY, 40, undefined, 0);

    // this.rightArmHitBox.body.setData("bone", rightArm).setInteractive();

    scene.matter.add.gameObject(this.sgo);
    // this.sgo.body.mass = this.sgo.body.mass * 2;
    this.sgo.setScale(0.27);
    // this.sgo.setFixedRotation();
    // this.sgo.setFriction(1, 0.5);
    this.sgo.setFriction(1, 1, 0);
    this.leftArmHitBox.setFriction(1, 0.1, 10);
    this.rightArmHitBox.setFriction(1, 0.1, 10);

    scene.add.existing(this);

    const bounds = this.sgo.getBounds();
    const width = bounds.size.x;
    const height = bounds.size.y;
    this.setPhysicsSize(this.sgo.width * 0.65, this.sgo.height * 0.9);
    this.add(this.sgo);

    const dKey = this.scene.input.keyboard?.addKey("D");
    let isRightLeg = true;

    this.sgo.state.addListener({
      start: (entry) => {
        if (entry.animation.name === "push_right_leg" || entry.animation.name === "push_left_leg") {
          this.isPlaying = true;
        }
      },
      complete: (entry) => {
        if (entry.animation.name === "push_right_leg") {
          this.sgo.play("idle_right_leg", true);
          this.isPlaying = false;
          isRightLeg = false;
        } else if (entry.animation.name === "push_left_leg") {
          this.sgo.play("idle_left_leg", true);
          this.isPlaying = false;
          isRightLeg = true;
        }
      },
    });

    dKey?.on("down", () => {
      if (!this.isPlaying) {
        if (isRightLeg) {
          this.rightLegStep();
        } else {
          this.leftLegStep();
        }
      }
    });

    this.sgo.play("idle", true, true);
  }

  rightLegStep() {
    // this.sgo.play("push_right_no_arms", false);
    this.sgo.play("push_right_leg", false);

    this.scene.tweens.add({
      targets: this.sgo,
      x: this.sgo.x + 100,
      duration: 700,
      ease: "cubic.in",
    });
  }

  leftLegStep() {
    this.sgo.play("push_left_leg", false);
    this.scene.tweens.add({
      targets: this.sgo,
      x: this.sgo.x + 100,
      duration: 700,
      ease: "cubic.in",
    });
  }

  drawHealthBar() {
    const width = 350;
    const height = 15;
    const x = -width / 2;
    const healthPercentage = this.hp / 100;

    this.healthBar.clear();

    this.healthBar.fillStyle(0xff0000);
    // const redWidth = width * healthPercentage;
    this.healthBar.fillRect(50, 61, width, height);

    this.healthBar.fillStyle(0x00ff00);
    const greenWidth = width * healthPercentage;
    this.healthBar.fillRect(50, 61, greenWidth, height);
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

  update(camera: Phaser.Cameras.Scene2D.Camera, cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    // const { left, right, up, space, q } = cursors;
    // const leftArm = this.sgo.skeleton.findBone("bone11");
    // const rightArm = this.sgo.skeleton.findBone("bone8");
    // const isAttack = this.spine.getData("attack");

    const rightArm = this.sgo.skeleton.findBone("bone8");
    const leftArm = this.sgo.skeleton.findBone("bone11");
    // const IK_ruka_l = this.sgo.skeleton.findBone("IK_ruka_l");

    this.rightArmHitBox.copyPosition({
      x: rightArm.worldX + camera.midPoint.x - this.scene.game.canvas.width / 2 + 5,
      y: rightArm.worldY * -1 + this.scene.game.canvas.height + camera.midPoint.y - this.scene.game.canvas.height / 2 + 10,
    });

    this.leftArmHitBox.copyPosition({
      x: leftArm.worldX + camera.midPoint.x - this.scene.game.canvas.width / 2 + 5,
      y: leftArm.worldY * -1 + this.scene.game.canvas.height + camera.midPoint.y - this.scene.game.canvas.height / 2,
    });

    this.control.copyPosition({
      x: this.pointerX,
      y: this.pointerY,
    });

    // this.control2.copyPosition({
    //   x: this.pointerX,
    //   y: this.pointerY,
    // });

    // this.rightArmHitBox.setPosition(rightArm.x, rightArm.y);

    // const leftHitboxCoords = {
    //   x: leftArm.worldX + camera.midPoint.x - this.scene.game.canvas.width / 2,
    //   y: leftArm.worldY * -1 + this.scene.game.canvas.height + camera.midPoint.y - this.scene.game.canvas.height / 2 - 10,
    // };
    // const rightHitboxCoords = {
    //   x: rightArm.worldX + camera.midPoint.x - this.scene.game.canvas.width / 2 - 10,
    //   y: rightArm.worldY * -1 + this.scene.game.canvas.height + camera.midPoint.y - this.scene.game.canvas.height / 2,
    // };

    // if (this.direction > 0) {
    //   rightHitboxCoords.x += 60;
    // } else {
    //   rightHitboxCoords.x -= 90;
    // }

    // this.physicsBody.position.copy(leftHitboxCoords);
    // this.rightHitBox.position.copy(rightHitboxCoords);

    // if (left.isDown && !this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q).isDown) {
    //   this.faceDirection(-1);
    //   this.body.setVelocityX(-550);
    //   if (this.body.blocked.down) {
    //     this.sgo.play("walk", true, true);
    //   }
    // } else if (right.isDown && !this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q).isDown) {
    //   this.faceDirection(1);
    //   this.body.setVelocityX(550);
    //   this.faceDirection(1);
    //   if (this.body.blocked.down) {
    //     this.sgo.play("walk", true, true);
    //   }
    // } else if (!isAttack && this.body.blocked.down) {
    //   this.sgo.play("idle", true, true);
    // }
    // // controls up
    // if (up.isDown && this.body.blocked.down) {
    //   // this.spine.play("jump", false, true);
    //   // this.body.setVelocityY(-600);
    // }
    // if (this.body.blocked.down) {
    // }
    // // TODO: сделать отдельную анимацию падения
    // if (!this.body.blocked.down) {
    //   // this.spine.play("jump", false, true);
    // }

    // if (this.hp > 0) {
    //   this.drawHealthBar();
    // } else {
    //   this.healthBar.clear();
    //   // this.destroy(true);
    // }
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
