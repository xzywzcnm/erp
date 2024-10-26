const synthesis = window.speechSynthesis;
const synthesisUtterance = new SpeechSynthesisUtterance();

// 播放语音
export function playVoice (options) {
  const {
    text = '', // 需要播放的文字内容
    lang = 'zh-CN', // 播放语言
    volume = 1, // 播放音量
    rate = 1, // 播放语速
    pitch = 1, // 播放音高
    push = false, // 是否追加播放(当前有语音正在播放时，是否等播放完之后再播放)
    complete = () => { }, // 播放完成触发
    pause = () => { }, // 暂停播放触发
    resume = () => { }, // 当暂停的播放恢复时触发
    start = () => { }, // 开始播放时触发
    error = () => { }, // 当发生错误时触发
    boundary = () => { } // 到达单词或句子边界时触发
  } = options;

  if (!(text.trim())) return;
  // 当处于正在播放语音时触发新的播放，则停止正在播放内容
  !push && synthesis.speaking && synthesis.cancel();
  // 播放完成触发
  synthesisUtterance.onend = complete;
  // 暂停播放触发
  synthesisUtterance.onpause = pause;
  // 当暂停的播放恢复时触发
  synthesisUtterance.onresume = resume;
  // 开始播放时触发
  synthesisUtterance.onstart = start;
  // 开始播放时触发
  synthesisUtterance.onerror = error;
  // 到达单词或句子边界时触发
  synthesisUtterance.onboundary = boundary;

  synthesisUtterance.text = text;
  synthesisUtterance.lang = lang;
  synthesisUtterance.volume = volume;
  synthesisUtterance.rate = rate;
  synthesisUtterance.pitch = pitch;
  synthesis.speak(synthesisUtterance);
}
// 停止所有语音播放
export function stopVoice () {
  // synthesis.speaking // 获取播放状态
  synthesis.cancel();
}
// 暂停语音播放
export function pauseVoice () {
  synthesis.pause();
}
// 当处于暂停状态时，重新开始播放
export function restoreVoice () {
  synthesis.resume();
}

export default {
  playVoice: playVoice,
  stopVoice: stopVoice,
  pauseVoice: pauseVoice,
  restoreVoice: restoreVoice
}
