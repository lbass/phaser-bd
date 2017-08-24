var CONFIG = {
  _config: {
    'GAME_WIDTH': 720,
    'GAME_HEIGHT': 1230,
    'SOUND_ONOFF_BUTTON_X': 580,
    'SOUND_ONOFF_BUTTON_Y': 20,
    'CLOSE_BUTTON_X': 659,
    'CLOSE_BUTTON_Y': 20,
    'DEFAULT_MUTE': true,
    'MY_UNIT_PANEL_XY': [
          { x: 55 + 50, y: 333 }, { x: 145 + 50, y: 333 }, { x: 235 + 50, y: 333 },
          { x: 32 + 50, y: 416 }, { x: 122 + 50, y: 416 }, { x: 212 + 50, y: 416 },
          { x: 10 + 50, y: 499 }, { x: 100 + 50, y: 499 }, { x: 190 + 50, y: 499 }
    ],
    'ENEMY_UNIT_PANEL_XY': [
          { x: 664 + 50, y: 330 }, { x: 574 + 50, y: 330 }, { x: 484 + 50, y: 330 },
          { x: 687 + 50, y: 414 }, { x: 597 + 50, y: 414 }, { x: 507 + 50, y: 414 },
          { x: 710 + 50, y: 498 }, { x: 620 + 50, y: 498 }, { x: 530 + 50, y: 498 }
    ],
    'UNIT_CONFIG': {
      'axeman': {
        name: 'axeman',
        hp:100,
        power:60,
        armor:100,
        agility:100,
        icon_image: 'icon_01',
        unit_image: 'axeman',
        skill: 'skill_axeman',
        type: 'my',
        animations: {
          normal: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
          attack: [0, 1, 14, 15, 16, 17, 17],
          attacked: [0, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
          selected: [0, 34, 35, 36, 37, 38, 39, 40, 41 ,42, 43, 44, 45, 46, 47]
        }
      },
      'swordman': {
        name: 'swordman',
        hp:100,
        power:40,
        armor:100,
        agility:100,
        icon_image: 'icon_02',
        unit_image: 'swordman',
        skill: 'skill_swordman',
        type: 'my',
        animations: {
          normal: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
          attack: [0, 14, 15, 16, 17, 18],
          attacked: [0, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32],
          selected: [0, 33, 34, 35, 36, 37, 38, 39, 40, 41 ,42, 43, 44, 45, 46]
        }
      },
      'skel': {
        name: 'skel',
        hp:100,
        power:100,
        armor:100,
        agility:100,
        unit_image: 'skel',
        skill: 'skill_skel',
        type: 'enemy',
        animations: {
          normal: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
          attack: [0, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41 ,42, 43, 44, 45],
          attacked: [0, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59 ],
          selected: [0]
        }
      },
      'craw' :{
        name: 'craw',
        hp:100,
        power:30,
        armor:100,
        agility:100,
        unit_image: 'craw',
        skill: 'skill_craw',
        type: 'enemy',
        animations: {
          normal: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
          attack: [0, 14, 15, 16, 17, 18, 19, 20],
          attacked: [0, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34],
          selected: [0]
        }
      }
    }
  },
  getConfig: function(key) {
    var configData = this._config[key];
    if(configData === undefined) {
      throw new Error('[' + key + '] is not included in the configuration!!');
    }
    return configData;
  }
};

var IMAGE_RESOURCE = {
  images: [
    { name: 'background', path: 'assets/bg_pattern.jpg' },
    { name: 'bg_1', path: 'assets/bg_1.png' },
    { name: 'bg_2', path: 'assets/bg_2.png' },
    { name: 'close-button', path: 'assets/close.png' },
    { name: 'sound-button-enable', path: 'assets/v_on.png' },
    { name: 'sound-button-disable', path: 'assets/v_off.png' },
    { name: 'tip_01', path: 'assets/tip_1.png' },
    { name: 'footer_ui_basic', path: 'assets/footer_ui_basic.png' },
    { name: 'footer_ui_select', path: 'assets/footer_ui_select.png' },
    { name: 'icon_01', path: 'assets/icon_1.png' },
    { name: 'icon_02', path: 'assets/icon_2.png' },
    { name: 'icon_03', path: 'assets/icon_3.png' },
    { name: 'icon_selected', path: 'assets/select_blue.png' },
    { name: 'btn_start', path: 'assets/btn_start.png' },
    { name: 'btn_member_0', path: 'assets/btn_member0.png' },
    { name: 'btn_member_1', path: 'assets/btn_member1.png' },
    { name: 'btn_member_2', path: 'assets/btn_member2.png' },
    { name: 'btn_member_3', path: 'assets/btn_member3.png' },
    { name: 'small_tip', path: 'assets/speech_bubble.png' },
    { name: 'active_panel', path: 'assets/active_panel.png' },
    { name: 'panel_selected', path: 'assets/red_pan.png' },
    { name: 'flag_1', path: 'assets/flag_1.png' },
    { name: 'flag_2', path: 'assets/flag_2.png' },
    { name: 'flag_3', path: 'assets/flag_3.png' },
    { name: 'skill_swordman', path: 'assets/txt/begi.png' },
    { name: 'skill_craw', path: 'assets/txt/halkigi.png' },
    { name: 'skill_skel', path: 'assets/txt/pokbal.png' },
    { name: 'skill_axeman', path: 'assets/txt/sserutte.png' },
    { name: 'round_1', path: 'assets/round/angel_1.png' },
    { name: 'round_2', path: 'assets/round/angel_2.png' },
    { name: 'round_3', path: 'assets/round/angel_3.png' },
    { name: 'bg_round_1', path: 'assets/round/bg_round1.png' },
    { name: 'bg_round_2', path: 'assets/round/bg_round2.png' },
    { name: 'bg_round_3', path: 'assets/round/bg_round3.png' },
    { name: 'unit_dead', path: 'assets/ko_dead/dead.png' },
    { name: 'win_pop', path: 'assets/popup/victory_popup.png' },
    { name: 'lose_pop', path: 'assets/popup/defeat_popup.png' },
    { name: 'continue_btn', path: 'assets/popup/conti_btn.png' },
    { name: 'replay_btn', path: 'assets/popup/replay_btn.png' },
    { name: 'lose_pop', path: 'assets/popup/defeat_popup.png' },
    { name: 'health_0', path: 'assets/number/health/0.png' },
    { name: 'health_1', path: 'assets/number/health/1.png' },
    { name: 'health_2', path: 'assets/number/health/2.png' },
    { name: 'health_3', path: 'assets/number/health/3.png' },
    { name: 'health_4', path: 'assets/number/health/4.png' },
    { name: 'health_5', path: 'assets/number/health/5.png' },
    { name: 'health_6', path: 'assets/number/health/6.png' },
    { name: 'health_7', path: 'assets/number/health/7.png' },
    { name: 'health_8', path: 'assets/number/health/8.png' },
    { name: 'health_9', path: 'assets/number/health/9.png' },
    { name: 'hpbar_0', path: 'assets/number/our_bar/0.jpg' },
    { name: 'hpbar_25', path: 'assets/number/our_bar/25.jpg' },
    { name: 'hpbar_50', path: 'assets/number/our_bar/50.jpg' },
    { name: 'hpbar_75', path: 'assets/number/our_bar/75.jpg' },
    { name: 'hpbar_100', path: 'assets/number/our_bar/100.jpg' },
    { name: 'enemyhpbar_0', path: 'assets/number/enemy_bar/0.jpg' },
    { name: 'enemyhpbar_25', path: 'assets/number/enemy_bar/25.jpg' },
    { name: 'enemyhpbar_50', path: 'assets/number/enemy_bar/50.jpg' },
    { name: 'enemyhpbar_75', path: 'assets/number/enemy_bar/75.jpg' },
    { name: 'enemyhpbar_100', path: 'assets/number/enemy_bar/100.jpg' },
    { name: 'damage_0', path: 'assets/number/damage/0.png' },
    { name: 'damage_1', path: 'assets/number/damage/1.png' },
    { name: 'damage_2', path: 'assets/number/damage/2.png' },
    { name: 'damage_3', path: 'assets/number/damage/3.png' },
    { name: 'damage_4', path: 'assets/number/damage/4.png' },
    { name: 'damage_5', path: 'assets/number/damage/5.png' },
    { name: 'damage_6', path: 'assets/number/damage/6.png' },
    { name: 'damage_7', path: 'assets/number/damage/7.png' },
    { name: 'damage_8', path: 'assets/number/damage/8.png' },
    { name: 'damage_9', path: 'assets/number/damage/9.png' },
    { name: 'damage_minus', path: 'assets/number/damage/minus.png' },
    { name: 'attack_panel', path: 'assets/green_pan.png' },
    { name: 'left_battle_unit_panel', path: 'assets/red_pan.png' },
    { name: 'right_battle_unit_panel', path: 'assets/red_pan_2.png' },
    { name: 'tutorial_1', path: 'assets/tutorial/1.png' },
    { name: 'tutorial_2', path: 'assets/tutorial/2.png' },
    { name: 'tutorial_3', path: 'assets/tutorial/3.png' },
    { name: 'tutorial_4', path: 'assets/tutorial/4.png' },
    { name: 'tutorial_5', path: 'assets/tutorial/5.png' },
    { name: 'tutorial_6', path: 'assets/tutorial/6.png' },
    { name: 'tutorial_7', path: 'assets/tutorial/7.png' },
    { name: 'tutorial_8', path: 'assets/tutorial/8.png' },
    { name: 'tutorial_9', path: 'assets/tutorial/9.png' },
    { name: 'tutorial_10', path: 'assets/tutorial/10.png' },
    { name: 'tutorial_11', path: 'assets/tutorial/11.png' },
    { name: 'tutorial_12', path: 'assets/tutorial/12.png' },
    { name: 'tutorial_13', path: 'assets/tutorial/13.png' },
    { name: 'tutorial_14', path: 'assets/tutorial/14.png' },
    { name: 'tutorial_15', path: 'assets/tutorial/15.png' },
    { name: 'tutorial_16', path: 'assets/tutorial/16.png' },
    { name: 'tutorial_17', path: 'assets/tutorial/17.png' },
    { name: 'tutorial_18', path: 'assets/tutorial/18.png' },
    { name: 'tutorial_19', path: 'assets/tutorial/19.png' },
    { name: 'tutorial_20', path: 'assets/tutorial/20.png' },
    { name: 'tutorial_21', path: 'assets/tutorial/21.png' },
    { name: 'tutorial_22', path: 'assets/tutorial/22.png' },
    { name: 'popup_close', path: 'assets/tutorial/close.png' }
  ],
  spritesheets: [
    { name: 'axeman', path: 'assets/unit/axeman.png', width: 210, height: 210, frame: 48 },
    { name: 'swordman', path: 'assets/unit/swordman.png', width: 210, height: 210, frame: 47 },
    { name: 'skel', path: 'assets/unit/skel.png', width: 200, height: 200, frame: 60 },
    { name: 'craw', path: 'assets/unit/craw.png', width: 200, height: 200, frame: 35 },
    { name: 'battleStart', path: 'assets/effect/battle_start.png', width: 720, height: 600, frame: 11 },
    { name: 'boomb', path: 'assets/effect/boomb.png', width: 720, height: 600, frame: 8 },
    { name: 'speedX2', path: 'assets/round/round.png', width: 127, height: 137, frame: 7 },
    { name: 'ko', path: 'assets/ko_dead/ko.png', width: 250, height: 450, frame: 6 }
  ]
};

var Message = {
  _message: {
    'modal.message.01': '축하합니다.\n{$}를 획득했습니다.',
    'modal.message.02': '한게임 포커에서 이어서 플레이',
    'modal.message.03': '아쉽지만\n모든 배팅 기회를\n사용 하셨습니다.'
  },
  getMessage: function(key, args) {
    var message = this._message[key];
    if(!message) {
      return '[ERROR] not defined "' + key + '"';
    }
    if(args && args.constructor === Array ) {
      for(var i = 0 ; i < args.length ; i++) {
        message = message.replace('{$}',args[i]);
      }
    }
    return message;
  }
};
