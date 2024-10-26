<template>
  <div>
    <Modal v-model="isVisible" title="海外仓入库下单" width="1200" :mask-closable="false" class="fillOrderDataPage">
      <div class="formDetail detail-form">
        <Form ref="formCustom" :model="formData" :rules="formDataRules" :label-width="160" class="fmb18">
          <div class="formWidth300 fmb18">
            <FormItem label="入库单类型:">
              <span>{{ warehousingType[formData.receiptType] && warehousingType[formData.receiptType].label }}</span>
            </FormItem>
            <FormItem label="参考号:" v-if="type === 'reOrder'">
              <span>{{ formData.referenceNumber }}</span>
            </FormItem>
            <FormItem label="目的仓:" prop="targetWarehouseCode">
              <dyt-select v-model="formData.targetWarehouseCode" @on-change="targetWarehouseChange">
                <Option v-for="(item, index) in destyWarehouseList" :value="item.targetWarehouseCode" :key="index"
                  :label="item.targetWarehouseCode + '[' + item.targetWarehouse + ']'"></Option>
              </dyt-select>
            </FormItem>
            <FormItem label="目的仓地址:" prop="targetWarehouseAddressCode">
              <dyt-select v-model="formData.targetWarehouseAddressCode" @on-change="targetWarehouseAddressChange">
                <Option v-for="(item, index) in destyAddressList" :value="item.targetWarehouseAddressCode"
                  :key="index + 'destyAddress'" :label="item.targetWarehouseAddress"></Option>
              </dyt-select>
            </FormItem>
            <FormItem label="运输方式:" prop="transportType">
              <dyt-select v-model="formData.transportType">
                <Option v-for="(item, index) in expressList" :value="item.value" :key="index + 'userId'"
                  :label="item.label"></Option>
              </dyt-select>
            </FormItem>
            <FormItem label="预计到达时间:" prop="arriveDate">
              <DatePicker :options="options3" type="date" format="yyyy-MM-dd" @on-change="timeChange"
                :value="formData.arriveDate">
              </DatePicker>
            </FormItem>
            <FormItem label="跟踪号/海柜号:" prop="trackingNumber">
              <dytInput v-model="formData.trackingNumber" maxlength="200" show-word-limit />
            </FormItem>
            <div class="flexCenter">
              <FormItem label="进口商:" prop="importCompany">
                <dyt-select v-model="formData.importCompany">
                  <Option v-for="(item, index) in importCompanyList" :value="item.importCompany" :key="index + 'userId'"
                    :label="item.importCompany + '-' + item.companyName"></Option>
                </dyt-select>
              </FormItem>
              <div class="desc">目的仓库对应的国家需要提供VAT(目前英国、德国、法国需要提供)</div>
            </div>
            <FormItem label="备注:" prop="remark">
              <dytInput type="textarea" v-model="formData.remark" :autosize="{ minRows: 3, maxRows: 6 }" />
            </FormItem>
          </div>
        </Form>
        <div class="stock-block">
          <div class="title">下单LAPA出库单信息</div>
          <div>
            <Table highlight-row border :columns="columns" :data="tableList">
              <template slot-scope="{ row }" slot="packingTime">
                <div class="timeWidth" v-if="row.packingTime">{{ $uDate.dealTime(row.packingTime) }}</div>
              </template>
            </Table>
          </div>
        </div>
      </div>
      <div slot="footer">
        <Button type="primary" @click="submitSave" :disabled="loading">
          确 定
        </Button>
        <Button @click="isVisible = false">取 消</Button>
      </div>
      <Spin fix v-if="pageLoading"></Spin>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
import { expressList, warehousingType } from './fileData.js';

export default {
  name: 'fillOrderData',
  props: {
    dialogVisible: {
      type: Boolean,
      default() {
        return false
      }
    },
    modalData: {
      type: Array,
      default() {
        return []
      }
    },
    type: {// 'reOrder'是下了单的重新下单，否则是待下单的出库单下单
      type: String,
      default() {
        return ''
      }
    },
    importCompany: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      options3: {
        disabledDate(date) {
          return date && date.valueOf() < Date.now() - 86400000;
        }
      },
      pageLoading: false,
      isVisible: false,
      loading: false,
      formData: {
        receiptType: 0, // 入库单类型
        referenceNumber: '', // 参考号
        targetWarehouse: '', // 目标仓
        targetWarehouseCode: '', // 目标仓code
        trackingNumber: '', // 跟踪号
        transportType: '', // 运输方式
        targetWarehouseAddress: '', // 目标仓地址
        targetWarehouseAddressCode: '', // 目标仓地址code
        importCompany: '', // 进口商编码
        arriveDate: '', // 到达时间
        remark: '', // 备注
      },
      // 表单验证
      formDataRules: {
        targetWarehouseCode: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        targetWarehouseAddressCode: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        transportType: [
          { required: true, message: '请选择', trigger: 'change', type: 'number' }
        ],
        arriveDate: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
      },
      columns: [
        {
          title: 'LAPA出库单号',
          key: 'pickingNo',
          align: 'center',
          minWidth: 200,
        },
        {
          title: '完成装箱时间',
          slot: 'packingTime',
          align: 'left',
          width: 110,
        }, {
          title: '参考编号',
          key: 'referenceNo',
          align: 'center',
          minWidth: 100,
        },
        {
          title: '谷仓账号',
          key: 'gcAccount',
          align: 'center',
          minWidth: 100,
        },
        {
          title: '总箱数',
          key: 'boxQuantity',
          align: 'center',
          width: 80,
        },
        {
          title: '总实重kg',
          key: 'totalWeight',
          align: 'center',
          width: 100,
        },
        {
          title: '总抛重kg',
          key: 'totalThrowWeight',
          align: 'center',
          width: 100,
        },
        {
          title: '总SKU数',
          key: 'skuQuantity',
          align: 'center',
          width: 90,
        },
        {
          title: '总件数',
          key: 'productQuantity',
          align: 'center',
          width: 80,
        },
        {
          title: '备注',
          key: 'remark',
          align: 'center',
          minWidth: 100,
        },
      ],
      tableList: [],
      destyWarehouseList: [], // 目的仓
      destyAddressList: [], // 目的仓地址
      expressList: expressList, // 运输方式
      warehousingType: warehousingType, // 入库单类型
      importCompanyList: []
    }
  },
  watch: {
    dialogVisible: {
      handler(val) {
        val && this.openModal();
      },
      deep: true
    },
    isVisible: {
      handler(val) {
        if (val) return;
        this.$emit('update:dialogVisible', val);
      },
      deep: true
    },
    importCompany: {
      handler(val) {
        if (val.length > 0) {
          this.importCompanyList = this.importCompany
        };
      },
    }
  },
  computed: {
    // 是否为可编辑
    isEdit() {
      return ['create', 'edit'].includes(this.type);
    },
  },
  methods: {
    // 窗口打开
    async openModal() {
      this.isVisible = true;
      this.$refs['formCustom'].resetFields();

      this.pageLoading = true;
      await this.getLogistics();
      if (this.type === 'reOrder') {
        await this.getDetail();
      } else {
        this.formData.referenceNumber = this.modalData.map(k => { return k.pickingNo }).toString();
        this.tableList = this.$common.copy(this.modalData);
      }
      this.pageLoading = false;
    },
    // 根据下单任务号
    getDetail() {
      return new Promise((resolve) => {
        let item = this.modalData[0] || {};
        let { receiptTaskNo } = item;
        let apiUrl = `${api.queryOrderInProgressByPlaceAndOrder}?receiptTaskNo=${receiptTaskNo}`;
        this.axios.post(apiUrl).then(({ data }) => {
          if (data.code !== 0) return;
          let temp = data.datas || {};
          this.tableList = temp.placeAndOrders || [];
          let paramJson = temp.paramJson ? JSON.parse(temp.paramJson) : {};
          Object.keys(this.formData).forEach(k => {
            this.formData[k] = paramJson[k];
          })
          this.targetWarehouseChange(paramJson.targetWarehouseCode);
        }).finally(() => {
          resolve();
        })
      })
    },
    // 获取仓库地址信息
    getLogistics() {
      return new Promise((resolve) => {
        this.axios.get(api.getGcWarehouseInfo, { params: { warehouseId: this.$store.state.warehouseId } })
          .then(({ data }) => {
            if (data.code !== 0) return;
            this.destyWarehouseList = data.datas || [];
          }).finally(() => {
            resolve();
          })
      })
    },
    // 提交保存数据
    submitSave() {
      this.$refs.formCustom.validate((valid) => {
        if (!valid) return false;
        let requestInfo = {};
        if (this.type === 'reOrder') {
          requestInfo = this.reOrder();
        } else {
          requestInfo = this.mulOrder();
        }
        // console.log(requestInfo, 'requestInfo');
        this.loading = true;
        this.axios.post(requestInfo.url, requestInfo.temp).then(({ data }) => {
          if (data.code !== 0) return;
          this.isVisible = false;
          this.$Message.success('操作成功~');
          this.$emit('search');
        }).finally(() => {
          this.loading = false;
        });
      })
    },
    // 批量等待入库下单
    mulOrder() {
      let temp = {};
      temp.forecastInfoIdList = this.tableList.map(k => { return k.forecastInfoId });
      temp.paramsVO = Object.assign({}, this.formData);
      temp.warehouseId = this.$store.state.warehouseId;
      return { temp, url: api.placeOrder };
    },
    // 已下单失败重新入库下单
    reOrder() {
      let temp = Object.assign({}, this.formData);
      let item = this.modalData[0] || {};
      let { receiptTaskNo } = item;
      return { temp, url: `${api.batchPlaceOrder}?receiptTaskNos=${receiptTaskNo}` };
    },
    // 目的仓切换
    targetWarehouseChange(e) {
      let list = this.destyWarehouseList.filter(k => {
        return k.targetWarehouseCode === e;
      })
      let item = list[0] || {};
      this.formData.targetWarehouse = item.targetWarehouse;
      this.destyAddressList = item.codeList || [];
    },
    // 目的仓地址切换
    targetWarehouseAddressChange(e) {
      let list = this.destyAddressList.filter(k => {
        return k.targetWarehouseAddressCode === e;
      })
      let item = list[0] || {};
      this.formData.targetWarehouseAddress = item.targetWarehouseAddress;
    },
    timeChange(e) {
      this.formData.arriveDate = e || '';
    }
  }
}
</script>

<style lang="less">
.fillOrderDataPage {
  .flexCenter {
    .desc {
      line-height: 32px;
      margin-bottom: 18px;
      margin-left: 30px;
    }
  }
}
</style>
