// 存储sku对应的条码编码值
import api from "@/api/api";
export default {
  data() {
    return {
      allBarcodeList: {},
    };
  },
  methods: {
    // 根据sku查询对应平台的条码编码
    getBarcodeBeSku(skuList) {
      return new Promise((resolve) => {
        let allBarcodeList = this.allBarcodeList;
        // 不存在的sku
        let unmateList = skuList.filter((k) => !allBarcodeList[k]);
        if (!unmateList.length) {
          resolve(this.allBarcodeList);
          return;
        }
        this.axios
          .post(api.get_querySkuScanCodes, unmateList)
          .then((response) => {
            if (response.data.code === 0) {
              let resList = response.data.datas || [];
              resList.forEach((k) => (this.allBarcodeList[k.sku] = k));
              resolve(this.allBarcodeList);
              // console.log(this.allBarcodeList, "this.allBarcodeList");
            } else {
              resolve(allBarcodeList);
            }
          })
          .catch(() => {
            resolve(allBarcodeList);
          });
      });
    },
  }
};
