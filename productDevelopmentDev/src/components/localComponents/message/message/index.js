import Notification from "../base/notification";

const prefixCls = "ivu-message";
const iconPrefixCls = "ivu-icon";
const prefixKey = "ivu_message_key_";
const defaults = {
  top: 24,
  duration: 1.5,
};
window.mesLevel = [];
let messageInstance;
let name = 1;
const iconTypes = {
  info: "ios-information-circle",
  success: "ios-checkmark-circle",
  warning: "ios-alert",
  error: "ios-close-circle",
  loading: "ios-loading",
};
function getMessageInstance(level) {
  messageInstance =
    messageInstance ||
    Notification.newInstance({
      prefixCls: prefixCls,
      styles: {
        top: `${defaults.top}px`,
      },
      level: level,
    });
  return messageInstance;
}
function notice(
  content = "",
  duration = defaults.duration,
  type,
  onClose = function () {},
  closable = true,
  render = function () {},
  level = null
) {
  const iconType = iconTypes[type];
  // if loading
  const loadCls = type === "loading" ? " ivu-load-loop" : "";
  if (type === "error") {
    duration = 5;
  }
  let instance = getMessageInstance(level);
  instance.notice({
    name: `${prefixKey}${name}`,
    duration: duration,
    styles: {},
    transitionName: "move-up",
    content: `
            <div class="${prefixCls}-custom-content ${prefixCls}-${type}">
                <i class="${iconPrefixCls} ${iconPrefixCls}-${iconType} ${loadCls}"></i>
                <span>${content}</span>
            </div>
        `,
    render: render,
    onClose: onClose,
    closable: closable,
    type: "message",
    level: level,
  });
  // 用于手动消除
  return (function () {
    let target = name++;
    return function () {
      instance.remove(`${prefixKey}${target}`);
    };
  })();
}
export default {
  name: "Message",
  info(options) {
    return this.message("info", options);
  },
  success(options) {
    return this.message("success", options);
  },
  warning(options) {
    return this.message("warning", options);
  },
  error(options) {
    return this.message("error", options);
  },
  loading(options) {
    return this.message("loading", options);
  },
  message(type, options) {
    if (typeof options === "string") {
      options = {
        content: options,
      };
    }
    return notice(
      options.content,
      options.duration,
      type,
      options.onClose,
      options.closable,
      options.render,
      options.level
    );
  },
  config(options) {
    if (options.top || options.top === 0) {
      defaults.top = options.top;
    }
    if (options.duration || options.duration === 0) {
      defaults.duration = options.duration;
    }
  },
  destroy() {
    let instance = getMessageInstance();
    messageInstance = null;
    instance.destroy("ivu-message");
  },
};
