<template>
  <div class="confirmDetail">
    <Modal v-model="modalVisible" width="1400" :title="title[titleType] || '查看'" :mask-closable="false"
      class="confirmDetail-dialog">
      <div>
        <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80" :inline="true"
          class="formDetail">
          <div class="fmb10 formDesc">
            <FormItem label="出库单编号:">
              <div class="detail-width">{{ warehousingConfirm.pickingNo || '' }}</div>
            </FormItem>
            <FormItem label="出库单类型:">
              <div class="detail-width">
                <div v-for="item in outListTypeList" :key="item.value">{{ warehousingConfirm.pickingType === item.value
                  ?
                  item.label : ''
                }}</div>
              </div>
            </FormItem>
            <FormItem label="入库海外仓:">
              <div class="detail-width">
                <span v-for="(item, index) in warehousingOverseasList" :key="index + 'warehousingOverseasList'">
                  {{ warehousingConfirm.warehousingOverseas === item.warehouseId ? item.warehouseName : '' }}
                </span>
              </div>
            </FormItem>
            <FormItem label="参考编号:">
              <div class="detail-width">{{ warehousingConfirm.referenceNo || '' }}</div>
            </FormItem>
            <FormItem label="运单号:">
              <div class="detail-width">{{ warehousingConfirm.trackingNumber || '' }}</div>
            </FormItem>
            <FormItem label="发货时间:">
              <div class="detail-width">
                <span v-if="warehousingConfirm.deliveryTime">{{
                  $uDate.dealTime(warehousingConfirm.deliveryTime).slice(0, 10)
                }}</span>
              </div>
            </FormItem>
            <FormItem label="运输方式:">
              <div class="detail-width">
                <div v-for="item in shippingList" :key="item.value + 'shippingList'">{{
                  warehousingConfirm.transportMethod
                  === item.value ? item.label : ''
                }}</div>
              </div>
            </FormItem>
            <FormItem label="发货件数:">
              <div class="detail-width">{{ warehousingConfirm.allQuantityShipped || '' }}</div>
            </FormItem>
            <FormItem label="入仓状态:">
              <div class="detail-width">{{ wareStatusList[warehousingConfirm.warehousingStatus] &&
                wareStatusList[warehousingConfirm.warehousingStatus].label
              }}</div>
            </FormItem>
            <FormItem label="物流商单号:">
              <div class="detail-width">{{ warehousingConfirm.carrierCode || '' }}</div>
            </FormItem>
            <FormItem label="店铺:">
              <div class="detail-width">{{ warehousingConfirm.account || '' }}</div>
            </FormItem>
          </div>

          <div class="formWidth240 fmb18">
            <div>
              <FormItem label="海外仓入仓时间:" prop="warehousingTime" :label-width="120">
                <DatePicker type="date" placeholder="请选择" transfer @on-change="timeChange"
                  :value="formValidate.warehousingTime" :disabled="isDisabled(true)"></DatePicker>
              </FormItem>
              <div class="tip-content">
                <span class="tips">提示：入仓时间确认后不能更改，入仓时间确定先进先出规则的先后顺序</span>
              </div>
            </div>
            <div>
              <FormItem label="增值费用:" :label-width="120" prop="appreciationFee"
                :rules="{ validator: validateNumber, trigger: 'blur' }">
                <Input v-model.number="formValidate.appreciationFee" placeholder="请输入" type="number"
                  :disabled="isDisabled()"></Input>
              </FormItem>
              <div class="tip-content">
                <span>CNY</span>
                <span class="tips">提示：增值费用，每次修改数据，都会重新刷新分摊，按发货件数分摊到每件商品，毛利计入其它费用</span>
              </div>
            </div>
            <div>
              <FormItem label="头程费用:" :label-width="120" prop="headwayFee"
                :rules="{ validator: validateNumber, trigger: 'blur' }">
                <Input v-model.number="formValidate.headwayFee" placeholder="请输入" type="number"
                  :disabled="isDisabled()"></Input>
              </FormItem>
              <div class="tip-content">
                <span>CNY</span>
                <span class="tips">提示：头程费用，每次修改数据，都会重新刷新分摊，按发货重量分摊到每件商品，毛利计入头程费用</span>
              </div>
            </div>
            <div>
              <FormItem label="关税费用:" :label-width="120" prop="tariffsFee"
                :rules="{ validator: validateNumber, trigger: 'blur' }">
                <Input v-model.number="formValidate.tariffsFee" placeholder="请输入" type="number"
                  :disabled="isDisabled()"></Input>
              </FormItem>
              <div class="tip-content">
                <span>CNY</span>
                <span class="tips">提示：关税费用，每次修改数据，都会重新刷新分摊，按发货件数分摊到每件商品，毛利计入其它费用</span>
              </div>
            </div>
          </div>

          <div class="mt10">
            <h6 class="detail-title mb10">产品列表</h6>
            <!-- 表格 -->
            <Table border highlight-row ref="selection" :columns="columns" :data="formValidate.warehousingPickingList"
              maxHeight="400" class="table-style fmb0">
              <template slot-scope="{ row, index }" slot="goodsUrl">
                <dyt-previewImg :url="row.goodsUrl"></dyt-previewImg>
              </template>
              <template slot-scope="{ row, index }" slot="name">
                <Tooltip v-if="row.goodsCnDesc" :content="row.goodsCnDesc" placement="right" transfer max-width="300">
                  <div class="name-style" style="padding-top:6px;">{{ row.goodsCnDesc }}</div>
                </Tooltip>
                <Tooltip v-if="row.goodsAttributes" :content="row.goodsAttributes" placement="right" transfer
                  max-width="300">
                  <div class="specifications-style name-style">{{ row.goodsAttributes }}</div>
                </Tooltip>
              </template>
              <template slot-scope="{ row, index }" slot="volume">
                <span>{{ row.goodsLength || 0 }}*{{ row.goodsWidth || 0 }}*{{ row.goodsHeight || 0 }}</span>
              </template>
              <template slot-scope="{ row, index }" slot="differenceNumber">
                <!-- 入仓中才可以编辑等额数量 -->
                <FormItem :label-width="0" :prop="'warehousingPickingList.' + index + '.differenceNumber'"
                  :rules="{ validator: validateMax, trigger: 'blur' }" v-if="confirmData.warehousingStatus === '2'">
                  <Input v-model="formValidate.warehousingPickingList[index].differenceNumber" placeholder="请输入"
                    type="number" :disabled="isDisabled()" @input="warehousingPickingChange(index)"></Input>
                </FormItem>
                <span v-else>{{ row.differenceNumber }}</span>
              </template>
            </Table>
          </div>
        </Form>
      </div>
      <div slot="footer">
        <Button @click="modalVisible = false">关闭</Button>
        <Button type="primary" @click="handleSubmit" :loading="loading"
          v-if="['0', '2'].includes(confirmData.warehousingStatus) && [1, 3].includes(titleType)">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import Big from 'big.js';
import api from '@/api/api';
import { outListTypeList, shippingList } from '@/views/wms/stockOUt/otherStouck/components/fileData.js';
export default {
  name: 'confirmDetail',
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
    return {
      modalVisible: false,
      title: {
        1: '入仓',
        2: '查看入仓管理',
        3: '修改入仓',
      },
      formValidate: {
        warehousingTime: '',
        headwayFee: '',
        appreciationFee: '',
        tariffsFee: '',
        warehousingPickingList: []
      },
      ruleValidate: {
        warehousingTime: [
          { required: true, message: '请选择入仓时间', trigger: 'change' }
        ],
      },
      columns: [{
        title: '图片',
        slot: 'goodsUrl',
        align: 'center',
        width: 90
      },
      {
        title: 'SKU',
        key: 'goodsSku',
        align: 'center',
        width: 120
      },
      {
        title: 'SPU',
        key: 'spu',
        align: 'center',
        width: 120
      },
      {
        title: '名称/规格',
        slot: 'name',
        align: 'center',
        minWidth: 120
      },
      {
        title: '重量g',
        key: 'goodsWeight',
        align: 'center',
        width: 90
      },
      {
        title: '体积cm',
        slot: 'volume',
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
        title: '头程费CNY',
        key: 'skuHeadwayFee',
        align: 'center',
        width: 100
      },
      {
        title: '关税费CNY',
        key: 'skuTariffsFee',
        align: 'center',
        width: 100
      },
      {
        title: '发货数量',
        key: 'goodsSkuNumber',
        align: 'center',
        width: 90
      },
      {
        title: '入仓数量',
        key: 'importNumber',
        align: 'center',
        width: 90
      },
      {
        title: '差额数量',
        slot: 'differenceNumber',
        align: 'center',
        minWidth: 120
      }
      ],
      warehousingConfirm: {},
      wareStatusList: {
        '0': { label: '未入仓', value: '0' },
        '1': { label: '已入仓', value: '1' },
        '2': { label: '入仓中', value: '2' },
      },
      outListTypeList: outListTypeList, // 出库单类型
      shippingList: shippingList, // 运输方式
      warehousingOverseasList: [], // 入库海外仓
      loading: false
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
    modalClose() {
      return !this.$store.getters.getSelfPreviewDialog;
    }
  },
  methods: {
    // 权限(isTime:区分海外仓入仓时间权限)
    isDisabled(isTime) {
      let statusArr = isTime ? ['0'] : ['0', '2'];
      let titleArr = isTime ? [1] : [1, 3];
      let titleFlag = titleArr.includes(this.titleType);// 入仓/修改入仓
      let statusFlag = statusArr.includes(this.confirmData.warehousingStatus);// 未入仓/入仓中;
      return !(titleFlag && statusFlag);
    },
    open() {
      this.modalVisible = true;
      this.$refs['formValidate'].resetFields();
      this.getWarehousingOverseas();
      this.getDetail();
    },
    // 获取详情
    getDetail() {
      let { pickingNo, warehousingStatus } = this.confirmData || {};
      this.axios.post(api.queryOverseasDetail + '?pickingNo=' + pickingNo).then(({ data }) => {
        if (!(data && data.code === 0)) return;
        let datas = data.datas || {};
        let warehousingConfirm = datas.warehousingConfirm || {};
        this.warehousingConfirm = warehousingConfirm;
        Object.keys(this.formValidate).forEach(k => {
          (k in warehousingConfirm) && (this.formValidate[k] = warehousingConfirm[k]);
        })
        if (warehousingStatus === '0' && this.titleType === 1) {
          // 默认值为当天日期
          const time = this.$uDate.getDataToLocalTime(new Date());
          this.formValidate.warehousingTime = time;
          this.computedWarehousingPicking(datas.warehousingPickingList || []);
        } else {
          this.formValidate.warehousingTime = warehousingConfirm.warehousingTime;
          this.formValidate.warehousingPickingList = datas.warehousingPickingList || [];
        }
      });
    },
    // 复制入仓和等额字段
    computedWarehousingPicking(list) {
      this.formValidate.warehousingPickingList = list.map(k => {
        k.importNumber = k.goodsSkuNumber || 0;// 默认值等于发货数量
        k.differenceNumber = 0;// 默认值0
        return k;
      });
    },
    timeChange(e) {
      this.formValidate.warehousingTime = e || '';
    },
    // 提交表单
    handleSubmit() {
      this.$refs['formValidate'].validate((valid) => {
        if (!valid) return;
        let [temp, formValidate, warehousingConfirm] = [{}, this.$common.copy(this.formValidate), this.warehousingConfirm];
        const dayjs = this.$common.dayjs();
        let fun = () => {
          let temp = {};
          let arr = ['hour', 'minute', 'second'];
          arr.forEach(k => {
            temp[k] = dayjs.get(k);
          })
          return temp;
        }
        let timeArr = fun();
        temp.warehousingConfirm = {
          warehousingTime: formValidate.warehousingTime + ` ${timeArr.hour}:${timeArr.minute}:${timeArr.second}`,
          headwayFee: formValidate.headwayFee || 0,
          appreciationFee: formValidate.appreciationFee || 0,
          tariffsFee: formValidate.tariffsFee || 0,
          warehousingOverseas: warehousingConfirm.warehousingOverseas,
          pickingNo: warehousingConfirm.pickingNo,
          account: warehousingConfirm.account,
          carrierCode: warehousingConfirm.carrierCode,
        }
        temp.warehousingPickingList = formValidate.warehousingPickingList;
        // console.log(temp, 34);
        this.loading = true;
        this.axios.post(api.warehouseConfirmation, temp).then(({ data }) => {
          if (!(data && data.code === 0)) return;
          this.$Message.success('操作成功!');
          this.modalVisible = false;
          this.$emit('search');
        }).finally(() => {
          this.loading = false;
        })
      })
    },
    // 获取启用的第三方仓库列表
    getWarehousingOverseas() {
      let warehouseList = this.$store.state.warehouseList || [];
      this.warehousingOverseasList = warehouseList.filter(k => {
        return k.warehouseType === '1';
      })
    },
    // 验证等额数量
    validateMax(rule, value, callback) {
      let warehousingPickingList = this.formValidate.warehousingPickingList;
      let fieldArr = rule.field && rule.field.split('.');
      let temp = warehousingPickingList[fieldArr[1]] || {};

      if (temp.differenceNumber === '' || temp.differenceNumber === null || temp.differenceNumber === undefined) {
        return callback('请输入等额数量');
      }
      if (!this.$regular.integerZero.test(temp.differenceNumber)) {
        return callback('大于或等于0的整数');
      }
      if ((new Big(temp.differenceNumber || 0).minus(temp.goodsSkuNumber || 0) - 0) > 0) {
        return callback(new Error('不能超过发货数量'));
      }
      callback();
    },
    // 等额数量更改: 入仓数量=发货数量-等额数量
    warehousingPickingChange(index) {
      let warehousingPickingList = this.formValidate.warehousingPickingList;
      let temp = warehousingPickingList[index] || {};
      let num = new Big(temp.goodsSkuNumber || 0).minus(temp.differenceNumber || 0) - 0;
      this.$set(this.formValidate.warehousingPickingList[index], 'importNumber', num <= 0 ? 0 : num);
    },
    // 验证等额数量
    validateNumber(rule, value, callback) {
      if (value && !this.$regular.hasPriceNum.test(value)) {
        return callback('大于或等于0,小数点后不超过两位');
      }
      callback();
    },
  }
}
</script>

<style lang="less">
.confirmDetail-dialog {
  .tip-content {
    display: inline-block;
    line-height: 32px;

    .tips {
      font-size: 12px;
      color: #999;
      display: inline-block;
      margin-left: 20px;
    }
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
}
</style>
