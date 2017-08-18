var CONFIG = {
  _config: {
    'GAME_WIDTH': 720,
    'GAME_HEIGHT': 1230,
    'SOUND_ONOFF_BUTTON_X': 580,
    'SOUND_ONOFF_BUTTON_Y': 20,
    'CLOSE_BUTTON_X': 659,
    'CLOSE_BUTTON_Y': 20,
    'DEFAULT_MUTE': true  //  디폴트 사운드 켜기
  },
  getConfig: function(key) {
    var configData = this._config[key];
    if(configData === undefined) {
      throw new Error('[' + key + '] is not included in the configuration!!');
    }
    return configData;
  }
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
