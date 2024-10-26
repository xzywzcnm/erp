<template>
  <div class="form-contain form-contain-disabled">
    <div class="form-line-flex mb10">
      <b style="font-size:120%;">{{productCategory}}</b>
      <!-- <dyt-select v-model="sku" style="width:200px" class="mr10" @on-change="skuchange" clearable disabled>
        <Option v-for="item in skuList" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </dyt-select>
      <Button type="primary" @click="becomeSku()" :loading="loading">生成SKU</Button> -->
    </div>

    <Table :columns="columns" :data="tableList" border highlight-row>
      <template slot-scope="{ index }" slot="upc">
        <div class="form-line-flex">
          <Input v-model="tableList[index].upc" placeholder="请输入" clearable style="width:80%;" :disabled="!permissionStatus"></Input>
          <a href="javascript:;" class="ml10" @click="generateUpc(index)" v-if="permissionStatus">生成</a>
        </div>
      </template>
      <template slot-scope="{ row }" slot="ean">
        <Input v-model="row.ean" placeholder="请输入" clearable style="width:100%;" disabled></Input>
      </template>
      <template slot-scope="{ row }" slot="isbn">
        <Input v-model="row.isbn" placeholder="请输入" clearable style="width:100%;" disabled></Input>
      </template>
    </Table>

    <!--生成UPC弹窗-->
    <Modal v-model="upcTalg" :mask-closable="false" title="生成UPC" class="clearMarginAuto" class-name="modal_codeStyle" width="650">
      <p slot="header" class="moveHead">
        <span>生成UPC</span>
      </p>
      <div style="margin-bottom: 15px;" v-for="(item, index) in upc_data" :key="index">
        <label slot="label" :class="item.isInitId !=1 ? 'redDot' : ''" v-if="(item.isInitId !=1) || item.initIdCode !== null" style="margin-right: 8px; width: 130px; text-align: right; display: inline-block;">{{ item.upcCodeName }}</label>
        <dyt-select v-if="item.isInitId !=1" v-model="item.upcCode" style="width:200px;" filterable>
          <Option v-for="(ele,index) in item.upcSettingItemBoList" :value="ele.upcCode" :key="index">{{ ele.upcCodeName }}
          </Option>
        </dyt-select>
        <span v-else>{{item.initIdCode === null ? '' : item.initIdCode}}</span>
        <div style="display: inline-block;" v-if="item.isInitId !=1 && item.upcCode != null">
          <span style="margin-left:12px;">编码：</span> <span>{{ item.upcCode }}</span>
        </div>
      </div>
      <div slot="footer" style="text-align: center;">
        <Button @click="setUpcBtn()" type="primary">确认</Button>
        <Button @click="upcTalg = false">取消</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import api from "@/api/api";

export default {
  name: "generateSku",
  components: {},
  data () {
    return {
      sku: '',
      skuList: [
        { label: "服装", value: 0 },
        { label: "家品", value: 1 },
      ],
      loading: false,
      normalColumns: [
        {
          title: 'SPU',
          key: 'spu',
          minWidth: 160,
        },
        {
          title: 'SKU',
          key: 'sku',
          minWidth: 160,
        },
        {
          title: 'SKC',
          key: 'skc',
          minWidth: 160,
        },
        {
          title: 'UPC',
          slot: 'upc',
          minWidth: 220,
        },
        {
          title: 'EAN',
          slot: 'ean',
          minWidth: 200,
        },
        {
          title: 'ISBN',
          slot: 'isbn',
          minWidth: 200,
        },
        {
          title: '属性',
          key: 'sizeOrModelName',
          width: 160,
        },
        {
          title: '变参',
          key: 'color',
          width: 160,
        },
      ],
      columns: [],
      tableList: [],
      upc_data: [],
      upcTalg: false,
      upcIndex: null,
      productCategory: ""
    };
  },
  props: {
    platformType: { type: String, default: '' },
    productData: {
      type: Object,
      default () {
        return {};
      }
    },
    operatList: {
      type: Array,
      default () {
        return [];
      }
    },
    openType: {
      type: String,
      default () {
        return '';
      }
    }
  },
  created () {
    this.init();
    this.findGoodTypeName();
  },
  methods: {
    init () {
      if (JSON.stringify(this.productData) === '{}') return;
      this.sku = this.categoryData(this.productData.goodTypeId) ? 0 : 1;
      this.skuchange(this.sku);
      this.becomeSku();
    },
    skuchange () {
      this.columns = [...this.normalColumns];
    },
    // 生产sku
    becomeSku () {
      if (!(this.sku || this.sku === 0)) {
        this.$Message.error("请选择sku类型~");
        return;
      }
      let temp = {};
      let { productId } = this.productData;
      temp.productId = productId;
      temp.productType = this.sku;

      this.loading = true;
      this.$axios.get(api.getSkuList, {params:{productId:productId}}).then(({ code, datas }) => {
        if (code !== 0) return;
        let rowList = [];
        datas.forEach(k => {
          if(k.choiceStatus === 0) rowList.push(k)
        });
        this.tableList = rowList;
        this.$emit('getSkuData', this.$common.copy(rowList));
      }).finally(() => {
        this.loading = false;
      });
    },
    // 获取UPC的编码项数据
    generateUpc (index) {
      this.upcIndex = index;
      this.upcTalg = true;
      let query = {
        initIdCount: null,
        isInitId: null,
        sort: null,
        upcCode: null,
        upcCodeName: "",
        upcId: null,
      };
      this.upc_data = [];
      this.$axios.post(api.post_queryProductUpcAll, query).then((response) => {
        if (response.code === 0) {
          let data = response.datas;
          if (data.length > 0) {
            data.map((item) => {
              item["upcCode"] = null;
            });
          }
          this.upc_data = data;
        }
      });
    },
    // 生成UPC弹窗的确认按钮
    setUpcBtn () {
      let upc_code = "";
      if (this.upc_data.length > 0) {
        for (let i = 0; i < this.upc_data.length; i++) {
          let talg = this.upc_data[i];
          if (talg.isInitId !== 1) {
            if (talg.upcCode === null) {
              this.$Message.error({
                content: `${talg.upcCodeName} 的编码项，属性和编码不能为空！`,
                duration: 4,
              });
              return false;
            }
            upc_code += talg.upcCode;
          } else {
            let initIdCode = talg.initIdCode === null ? "" : talg.initIdCode;
            upc_code = upc_code + initIdCode;
          }
        }
        this.tableList[this.upcIndex].upc = upc_code;
        this.upcTalg = false;
        this.upc_data = [];
        this.$Message.success("生成UPC成功！");
      }
    },
    // 处理商品分类
    categoryData (productCategoryId) {
      let productList = this.getProductCategoryTree(this.operatList, null);
      let result = null;
      let a = (list, id) => {
        list.forEach(k => {
          if (id === k.productCategoryId) {
            if (k.sizeType || k.sizeType === 0) {
              result = k;
            } else {
              if (k.parentId) {
                a(productList, k.parentId);
              }
            }
          } else {
            if (k.children && k.children.length) {
              a(k.children, id);
            }
          }
        });
      };
      a(productList, productCategoryId);
      return result;
    },
    // 组装商品分类树
    getProductCategoryTree (productCategoryList, parentId) {
      var tree = [];
      var children;
      productCategoryList.forEach((n) => {
        if (n.parentId === parentId) {
          n.label = n.cnName;
          n.value = n.productCategoryId;
          children = this.getProductCategoryTree(productCategoryList, n.productCategoryId);
          if (children.length > 0) {
            n.children = children;
          }
          tree.push(n);
        }
      });
      return tree;
    },
    // 保存upc
    handleData (num, config) {
      return new Promise((resolve) => {
        let tableList = this.tableList;
        let list = [];
        list = tableList.map(k => {
          return {
            quotationId: k.quotationId,
            productId: k.productId,
            upc: k.upc,
          };
        });
        // console.log(list);
        // return;
        config && !config.notSpin && this.$Spin.show();
        this.$axios.post(api.saveUpc, list).then((res) => {
          if (res && res.code === 0) {
            let temp = {};
            temp.type = num == 2 ? 18 : 17;
            temp.productId = this.productData.productId;
            if (config && config.notConfirm) {
              this.$axios.post(api.productVerify, temp).then((res) => {
                if (res.code === 0) {
                  resolve({fail: false});
                }
              }).catch((err) => {
                console.error(err);
                resolve({fail: true});
              });
            } else {
              this.confirmVerify(num, config, temp);
            }
          }
        }).catch((err) => {
          console.error(err);
          resolve({fail: true});
        }).finally(() => {
          config && !config.notSpin && this.$Spin.hide();
        });
      })
    },
    // 提交审核
    confirmVerify (num, config = {}, temp) {
      this.$Modal.confirm({
        title: config.title ? config.title : '同步Listing/商品系统',
        content: `<p>${config.content ? config.content : '确定生成SKU并同步？确定后不可修改'}</p>`,
        loading: true,
        onOk: () => {
          this.$axios.post(api.productVerify, temp).then((res) => {
            if (res.code === 0) {
              this.$Message.success('操作成功~');
              this.$emit('closeDialog');
            }
          }).finally(() => {
            this.$Modal.remove();
          });
        },
        onCancel: () => {}
      });
    },
    
    // 根据商品分类id找到对应的分类名称
    findGoodTypeName () {
      let { goodTypeId } = this.productData;
      this.operatList.forEach(k => {
        if (k.productCategoryId === goodTypeId) {
          let pcId = k.productCategoryNavigation;
          this.productCategory = pcId.replace(/->/g, "/")
        }
      });
    }
  },
  computed: {
    // 是否可编辑
    permissionStatus () {
      let userInfo = this.$store.state.erpConfig && this.$store.state.erpConfig.userInfo;
      const status = this.productData.requireVerifyBy === userInfo.userId && this.openType !== 'view';
      if (['plate'].includes(this.platformType)) {
        return this.productData.status === 11 && status;
      }
      return this.productData.status === 7 && status;
    }
  }
};
</script>