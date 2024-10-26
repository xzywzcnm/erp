<template>
  <div class="confirmDetail">
    <Modal v-model="modalVisible" width="1350" :title="title[titleType] || '查看'" :mask-closable="false"
      class="confirmDetail-dialog">
      <div>
        <Form ref="formValidate" :model="formValidate" :label-width="70" :inline="true" class="formDetail">
          <div class="fmb10 formDesc">
            <Row>
              <Col span="6">
              <FormItem label="SKU:">
                <div>{{ warehousingPicking.goodsSku || '' }}</div>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="SPU:">
                <div>{{ warehousingPicking.spu || '' }}</div>
              </FormItem>
              </Col>
              <Col span="12">
              <FormItem label="名称:">
                <div>{{ warehousingPicking.goodsCnDesc || '' }}</div>
              </FormItem>
              </Col>
            </Row>

            <Row>
              <Col span="6">
              <FormItem label="规格:">
                <div>{{ warehousingPicking.goodsAttributes || '' }}</div>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="海外仓:">
                <span v-for="(item, index) in warehouseList" :key="index + 'warehouseList'">
                  {{ warehousingPicking.warehousingOverseas === item.warehouseId ? item.warehouseName : '' }}
                </span>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="商品类目:">
                <div>
                  <span v-for="(item, index) in productCategoryList" :key="index + 'productCategoryList'">{{
                      warehousingPicking.productCategory === item.value ? item.label
                        : ''
                  }}</span>
                </div>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="重量(g):">
                <div>{{ warehousingPicking.goodsWeight || '' }}</div>
              </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span="6">
              <FormItem label="体积(cm):">
                <div>{{ warehousingPicking.goodsLength || 0 }}*{{ warehousingPicking.goodsWidth ||
                    0
                }}*{{ warehousingPicking.goodsHeight || 0 }}</div>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="店铺:">
                <div class="detail-width">{{ warehousingPicking.account || '' }}</div>
              </FormItem>
              </Col>
            </Row>
          </div>
          <div class="fmb0 mt20">
            <FormItem label="商品类别:">
              <Select v-model="formValidate.productTypes" placeholder="请选择" transfer style="width: 200px;"
                :disabled="isDisabled">
                <Option v-for="item in commodityCategoryList" :value="item.value" :key="item.value">{{ item.label }}
                </Option>
              </Select>
            </FormItem>
            <FormItem label="平台SKU:" prop="platformSku" :label-width="100">
              <Input v-model.number="formValidate.platformSku" :disabled="isDisabled"></Input>
            </FormItem>
          </div>
          <div class="mt20">
            <h6 class="detail-title mb10">海外仓发货记录</h6>
            <!-- 表格 -->
            <Table border highlight-row ref="selection" :columns="columns" :data="formValidate.tableList"
              maxHeight="400" class="fmb0" :loading="tableLoading">
              <template slot-scope="{ row, index }" slot="deliveryTime">
                <div v-if="row.deliveryTime">{{ $uDate.dealTime(row.deliveryTime).slice(0, 10) }}</div>
              </template>
              <template slot-scope="{ row, index }" slot="warehousingTime">
                <div v-if="row.warehousingTime">{{ row.warehousingTime.slice(0, 10) }}</div>
              </template>
              <!-- <template slot-scope="{ row, index }" slot="destroyedQuantity">
                <FormItem :label-width="0" :prop="'tableList.'+index+'.destroyedQuantity'"
                  :rules="{ validator: validateMax, trigger: 'blur' }">
                  <Input v-model="formValidate.tableList[index].destroyedQuantity" placeholder="请输入" type="number"
                    :disabled="isDisabled || (row.batchSaleStatus!==1)" @input="destroyedQuantityChange(index)"></Input>
                </FormItem>
              </template> -->
              <template slot-scope="{ row, index }" slot="batchSaleStatus">
                <span v-if="row.batchSaleStatus || row.batchSaleStatus === 0">{{
                    batchSaleStatusList[row.batchSaleStatus]
                    && batchSaleStatusList[row.batchSaleStatus].label
                }}</span>
              </template>
            </Table>
            <!--分页-->
            <div class="pagesMain">
              <Page :total="pageTotal" :current="searchParams.pageNum" :page-size="searchParams.pageSize" show-total
                show-sizer show-elevator @on-change="pageNumChange" @on-page-size-change="pageSizeChange"
                :page-size-opts="pageArray"></Page>
            </div>
          </div>
        </Form>
      </div>
      <div slot="footer">
        <template v-if="titleType == 1">
          <Button @click="modalVisible = false">取消</Button>
          <Button type="primary" @click="handleSubmit" :loading="loading">确定</Button>
        </template>
      </div>
    </Modal>
  </div>
</template>
<script>
// import Big from 'big.js';
import api from '@/api/api';
export default {
  name: 'productDetail',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    titleType: {
      type: Number,
      default: 1
    },
    confirmData: {
      type: Object,
      default: () => { return {} }
    }
  },
  data() {
    let _self = this;
    return {
      modalVisible: false,
      searchParams: {
        Sku: '',
        warehousingOverseas: '',
        account: '',
        pageNum: 1,
        pageSize: 50
      },
      title: {
        1: '商品资料管理',
        2: '查看商品资料'
      },
      formValidate: {
        productTypes: '',
        platformSku: '',
        tableList: []
      },
      columns: [{
        title: '出库单编号',
        key: 'pickingNo',
        align: 'center',
        minWidth: 120
      },
      {
        title: '发货时间',
        slot: 'deliveryTime',
        align: 'center',
        width: 120
      },
      {
        title: '发货数量',
        key: 'goodsSkuNumbers',
        align: 'center',
        width: 100
      },
      {
        title: '采购价CNY',
        key: 'goodsPrice',
        align: 'center',
        width: 100
      },
      {
        title: '增值费CNY',
        key: 'skuAppreciationFee',
        align: 'center',
        width: 100
      },
      {
        title: '头程费用CNY',
        key: 'headwayFee',
        align: 'center',
        width: 120
      },
      {
        title: '关税CNY',
        key: 'skuTariffsFee',
        align: 'center',
        width: 100
      },
      {
        title: '入仓时间',
        slot: 'warehousingTime',
        align: 'center',
        width: 120
      },
      {
        title: '入仓数量',
        key: 'importNumbers',
        align: 'center',
        width: 100
      },
      {
        title: '售卖数量',
        key: 'calculatedQuantity',
        align: 'center',
        width: 100
      },
      // {
      //   title: '销毁数量',
      //   slot: 'destroyedQuantity',
      //   align: 'center',
      //   minWidth: 120
      // },
      {
        title: '剩余数量',
        key: 'remainingAmount',
        align: 'center',
        width: 100
      },
      {
        title: '批次售卖状态',
        slot: 'batchSaleStatus',
        align: 'center',
        width: 110
      }],
      commodityCategoryList: [
        { label: '常规', value: '0' },
        { label: '童装', value: '1' },
        { label: '宠物', value: '2' }
      ],
      productCategoryList: [
        { label: '服装类', value: '0' },
        { label: '家居类', value: '1' },
        { label: '配饰类', value: '2' },
        { label: '试卖类', value: '3' },
        { label: '常规类', value: '4' }
      ],
      // 列表数据加载中
      tableLoading: false,
      // 列表数据总条数
      pageTotal: 0,
      // 列表页数
      pageArray: [10, 20, 50, 100],
      warehousingPicking: {}, // 详情
      loading: false,
      batchSaleStatusList: {
        0: { label: '未开售', value: 0 },
        1: { label: '售卖中', value: 1 },
        2: { label: '已售罄', value: 2 }
      },
      warehouseList: _self.$store.state.warehouseList || []
    }
  },
  watch: {
    dialogVisible: {
      handler(nval, oval) {
        nval && this.open();
      },
      deep: true
    },
    modalVisible: {
      handler(nval, oval) {
        !nval && this.$emit('update:dialogVisible', nval);
      },
      deep: true
    }
  },
  computed: {
    isDisabled() {
      return !(this.titleType === 1);
    }
  },
  methods: {
    open() {
      this.modalVisible = true;
      this.$refs['formValidate'].resetFields();
      let { goodsSku, warehousingOverseas, account } = this.confirmData || {};
      this.searchParams.Sku = goodsSku;
      this.searchParams.account = account;
      this.searchParams.warehousingOverseas = warehousingOverseas;
      this.getDetail();
      this.getList();
    },
    // 获取详情
    getDetail() {
      let [str, searchParams] = [api.querySkuDetail, this.searchParams];
      Object.keys(searchParams).forEach((field, index) => {
        if (['pageNum', 'pageSize'].includes(field)) return;
        str += str.indexOf('?') >= 0 ? '&' : '?';
        str += field + '=' + searchParams[field];
      })
      this.axios.post(str).then(({ data }) => {
        if (!(data && data.code === 0)) return;
        let warehousingPicking = data.datas || {};
        // console.log(this.warehousingPicking)
        this.formValidate.productTypes = warehousingPicking.productTypes;
        this.formValidate.platformSku = warehousingPicking.platformSku;
        this.warehousingPicking = warehousingPicking;
      })
    },
    // 获取
    getList() {
      let [str, searchParams] = [api.querySkuDetailList, this.searchParams];
      Object.keys(searchParams).forEach((field, index) => {
        str += str.indexOf('?') >= 0 ? '&' : '?';
        str += field + '=' + searchParams[field];
      })
      this.tableLoading = true;
      this.axios.post(str).then(({ data }) => {
        if (!(data && data.code === 0)) return;
        let datas = data.datas || {};
        this.pageTotal = datas.total;
        this.formValidate.tableList = (datas.list || []).map(k => {
          k.remainingAmountCopy = k.remainingAmount || 0;// 备份剩余数量(留着判断)
          // 不存在值，默认给0
          // let arr = ['calculatedQuantity', 'destroyedQuantity', 'remainingAmount', 'importNumbers']
          let arr = ['calculatedQuantity', 'remainingAmount', 'importNumbers']
          arr.forEach(arrItem => {
            k[arrItem] = k[arrItem] || 0;
          })
          return k;
        });
      }).finally(() => {
        this.tableLoading = false;
      })
    },
    // 提交表单
    handleSubmit() {
      this.$refs['formValidate'].validate((valid) => {
        if (!valid) return;
        let [temp, formValidate, warehousingPicking] = [{}, this.formValidate, this.warehousingPicking];
        formValidate.tableList.forEach(k => {
          if (k.batchSaleStatus !== 1) return;
          temp['pickingNo'] = k.pickingNo;
          // temp['destroyedQuantity'] = k.destroyedQuantity;
          temp['remainingAmount'] = k.remainingAmount;
        })
        temp['productTypes'] = formValidate.productTypes;
        temp['platformSku'] = formValidate.platformSku;
        temp['account'] = warehousingPicking.account;
        temp['goodsSku'] = warehousingPicking.goodsSku;
        temp['warehousingOverseas'] = warehousingPicking.warehousingOverseas;
        // console.log(temp, 34);
        // return;
        this.loading = true;
        this.axios.post(api.modifySkuDetail, temp).then(({ data }) => {
          if (!(data && data.code === 0)) return;
          this.$Message.success('操作成功!');
          this.modalVisible = false;
          //   this.pageNumChange(1);
          this.$emit('search');
        }).finally(() => {
          this.loading = false;
        })
      })
    },
    // 页码切换事件
    pageNumChange(val) {
      this.searchParams.pageNum = val;
      this.getList();
    },
    // 页数切换事件
    pageSizeChange(val) {
      this.searchParams.pageSize = val;
      this.getList();
    },
    // // 销毁数量输入
    // destroyedQuantityChange(index) {
    //   let temp = this.formValidate.tableList[index] || {};
    //   // 验证格式是否正确
    //   if (!this.$regular.integerZero.test(temp.destroyedQuantity)) return;
    //   // 计算剩余数量 （入仓数量-售卖数量-销毁数量）
    //   let remainingAmount = new Big(temp.importNumbers || 0).minus(temp.calculatedQuantity || 0).minus(temp.destroyedQuantity || 0) - 0;
    //   this.$set(this.formValidate.tableList[index], 'remainingAmount', remainingAmount < 0 ? 0 : remainingAmount);
    // },
    // 验证销毁数量
    // validateMax(rule, value, callback) {
    //   let tableList = this.formValidate.tableList;
    //   let fieldArr = rule.field && rule.field.split('.');
    //   let temp = tableList[fieldArr[1]] || {};
    //   if (value) {
    //     if (!this.$regular.integerZero.test(value)) {
    //       callback('大于或等于0的整数');
    //     }
    //     if (new Big(value || 0).plus(temp.remainingAmount || 0).plus(temp.calculatedQuantity || 0).minus(temp.importNumbers || 0) > 0) {
    //       callback(new Error('销毁数量过大'));
    //     }
    //     callback();
    //   } else {
    //     callback();
    //   }
    // },
    // 获取仓库列表
    // getWarehousingOverseas() {
    // let warehouseList = this.$store.state.warehouseList || [];
    //   this.warehousingOverseasList = warehouseList.filter(k => {
    //     return k.warehouseType === '1';
    //   })
    // }
  }
}
</script>

<style lang="less">
.confirmDetail-dialog {
  .flex-style .ivu-input-wrapper {
    width: 180px;
  }

  .tips {
    font-size: 12px;
    color: #999;
  }

  .pic {
    height: 50px;
    width: 50px;
    object-fit: cover;
  }

  .ivu-tooltip {
    width: 100%;
  }

  .name-style {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
  }

  .specifications-style {
    color: #08b15c;
  }

  .pagesMain {
    padding: 20px 10px 10px 10px;
    background-color: #fff;
    text-align: right;
  }
}
</style>
