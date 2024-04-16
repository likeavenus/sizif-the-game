import Phaser from "phaser";

export const createKseniaAnims = (
  anims: Phaser.Animations.AnimationManager
) => {
  anims.create({
    key: "ksenia_idle",
    frames: anims.generateFrameNames("ksenia", {
      start: 0,
      end: 4,
      prefix: "ksenia_idle",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 10,
  });

  anims.create({
    key: "ksenia_run",
    frames: anims.generateFrameNames("ksenia_run", {
      start: 0,
      end: 7,
      prefix: "ksenia_run",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 10,
  });

  anims.create({
    key: "ksenia_jump",
    frames: anims.generateFrameNames("ksenia_jump", {
      start: 0,
      end: 3,
      prefix: "Char1_Jump-Up",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 20,
  });

  anims.create({
    key: "ksenia_down",
    frames: anims.generateFrameNames("ksenia_down", {
      start: 0,
      end: 3,
      prefix: "Char1_Jump-Down",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 20,
  });

  /** Elena */

  anims.create({
    key: "elena_idle",
    frames: anims.generateFrameNames("elena_idle", {
      start: 0,
      end: 4,
      prefix: "Char2_Idle",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 10,
  });

  anims.create({
    key: "elena_run",
    frames: anims.generateFrameNames("elena_run", {
      start: 0,
      end: 7,
      prefix: "Char2_Run",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 10,
  });

  anims.create({
    key: "elena_jump",
    frames: anims.generateFrameNames("elena_jump", {
      start: 0,
      end: 3,
      prefix: "Char2_Jump-Up",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 10,
  });

  anims.create({
    key: "elena_down",
    frames: anims.generateFrameNames("elena_down", {
      start: 0,
      end: 3,
      prefix: "Char2_Jump-Down",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 10,
  });

  /** Nat V */
  anims.create({
    key: "natalia_v_idle",
    frames: anims.generateFrameNames("natalia_v_idle", {
      start: 0,
      end: 4,
      prefix: "Char3_Idle",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 10,
  });

  anims.create({
    key: "natalia_v_run",
    frames: anims.generateFrameNames("natalia_v_run", {
      start: 0,
      end: 7,
      prefix: "Char3_Run",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 10,
  });

  anims.create({
    key: "natalia_v_jump",
    frames: anims.generateFrameNames("natalia_v_jump", {
      start: 0,
      end: 3,
      prefix: "Char3_Jump-Up",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 10,
  });

  anims.create({
    key: "natalia_v_down",
    frames: anims.generateFrameNames("natalia_v_down", {
      start: 0,
      end: 3,
      prefix: "Char3_Jump-Down",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 10,
  });

  /** Nastya */
  anims.create({
    key: "nastya_idle",
    frames: anims.generateFrameNames("nastya_idle", {
      start: 0,
      end: 4,
      prefix: "Char4_Idle",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 10,
  });

  anims.create({
    key: "nastya_run",
    frames: anims.generateFrameNames("nastya_run", {
      start: 0,
      end: 7,
      prefix: "Char4_Run",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 10,
  });

  anims.create({
    key: "nastya_jump",
    frames: anims.generateFrameNames("nastya_jump", {
      start: 0,
      end: 3,
      prefix: "Char4_Jump-Up",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 10,
  });

  anims.create({
    key: "nastya_down",
    frames: anims.generateFrameNames("nastya_down", {
      start: 0,
      end: 3,
      prefix: "Char4_Jump-Down",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 10,
  });

  /** Anna */
  anims.create({
    key: "anna_idle",
    frames: anims.generateFrameNames("anna_idle", {
      start: 0,
      end: 4,
      prefix: "Char5_Idle",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 10,
  });

  anims.create({
    key: "anna_run",
    frames: anims.generateFrameNames("anna_run", {
      start: 0,
      end: 7,
      prefix: "Char5_Run",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 10,
  });

  anims.create({
    key: "anna_jump",
    frames: anims.generateFrameNames("anna_jump", {
      start: 0,
      end: 3,
      prefix: "Char5_Jump-Up",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 10,
  });

  anims.create({
    key: "anna_down",
    frames: anims.generateFrameNames("anna_down", {
      start: 0,
      end: 3,
      prefix: "Char5_Jump-Down",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 10,
  });

  /** Natalia P */
  anims.create({
    key: "natalia_p_idle",
    frames: anims.generateFrameNames("natalia_p_idle", {
      start: 0,
      end: 4,
      prefix: "Char6_Idle",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 10,
  });

  anims.create({
    key: "natalia_p_run",
    frames: anims.generateFrameNames("natalia_p_run", {
      start: 0,
      end: 7,
      prefix: "Char6_Run",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 10,
  });

  anims.create({
    key: "natalia_p_jump",
    frames: anims.generateFrameNames("natalia_p_jump", {
      start: 0,
      end: 3,
      prefix: "Char6_Jump-Up",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 10,
  });

  anims.create({
    key: "natalia_p_down",
    frames: anims.generateFrameNames("natalia_p_down", {
      start: 0,
      end: 3,
      prefix: "Char6_Jump-Down",
      suffix: ".png",
    }),
    repeat: -1,
    frameRate: 10,
  });
};
