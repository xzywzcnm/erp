// import axios from "axios";
import Vue from "vue";
// import api from "@/api/api";
import { Message, Modal } from "view-design";
import PayPage from "../views/pds/common/payPage";

Vue.component("Message", Message);
Vue.component("Modal", Modal);
Vue.component("PayPage", PayPage);
export const showPurchaseModal = (value, moduleName, suiteId, gotoUrl) => {
  // 1 可购买 2 可试用
  Modal.confirm({
    width: 800,
    render: (h) => {
      return h("PayPage", {
        props: {
          value: value,
          moduleName: moduleName,
          suiteId: suiteId,
          gotoUrl: gotoUrl
        }
      });
    }
  });
};

export const deleteTicket = (url) => {
  /**
   * @Description: 删除ticket参数
   * @author gan
   * @date: 2020/9/27 11:21
   * @params: url
   */
  if (url.includes("ticket")) {
    let arr = url.split("?");
    let params = arr[1].split("&");
    let paramsR = params.filter((i) => !i.includes("ticket"));
    return arr[0] + "?" + paramsR.join("");
  } else {
    return url;
  }
};
