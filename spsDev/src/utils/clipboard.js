import Clipboard from "clipboard";
import { Message } from 'view-design';

let copy = (e, text) => {
  if (!(e && text)) {
    Message.success("目标丢失或复制文字不存在~");
    return;
  }
  // console.log(e);
  // console.log(text, 'text');
  const clipboard = new Clipboard(e.target, { text: () => text });
  let resetClipboard = () => {
    // 释放内存
    clipboard.off("error");
    clipboard.off("success");
    clipboard.destroy();
  }
  clipboard.on("success", (e) => {
    Message.success("复制成功");
    resetClipboard();
  });
  clipboard.on("error", (e) => {
    // 不支持复制
    Message.warning("该浏览器不支持自动复制");
    resetClipboard();
  });
  clipboard.onClick(e);
}
export default copy;