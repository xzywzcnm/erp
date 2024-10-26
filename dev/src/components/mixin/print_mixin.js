import api from '@/api/api';
import Mixin from './common_mixin';

export default {
  mixins: [Mixin],
  data () {
    return {
      printData: [],
      printChecked: [],
      printAmount: 1,
      printLoading: false
    };
  },
  methods: {
    batchDelete () {
      let i = this.printData.length;
      while (i--) {
        if (this.printChecked.indexOf(this.printData[i].warehouseLocationId) > -1) {
          this.printData.splice(i, 1);
        }
      }
      this.printChecked = [];
    },
    uniteSetAmount (num) {
      this.$nextTick(() => {
        this.printData.forEach(val => {
          this.$set(val, 'printNumber', num);
        });
        let data = JSON.parse(JSON.stringify(this.printData));
        this.printData = [];
        this.printData = data;
      });
    },
    changeTable (data) {
      this.printChecked = data.map(i => {
        return i.warehouseLocationId;
      });
    },
    getBar (matchKey) {
      let v = this;
      return new Promise((resolve) => {
        this.axios.post(api.wmsService + api.getBarCode, v.printData.map(i => i[matchKey])).then(res => {
          if (res.data.code === 0) {
            this.printData.forEach(val1 => {
              res.data.datas.forEach(val2 => {
                let key = Object.getOwnPropertyNames(val2)[0];
                if (val1[matchKey] === key) {
                  let value = val2[key] ? val2[key] : '';
                  this.$set(val1, 'skuBarcode', value);
                }
              });
            });
            resolve();
          }
        });
      });
    }
  },
  watch: {}
};
