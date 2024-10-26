<template>
  <div>
    <Modal class="modal-main" v-model="modelVisible" :mask-closable="false" title="批量向供应商下单" width="65%">
      <div class="content">
        <Form ref="form" :model="formValidate" :rules="ruleValidate">
          <Alert style="padding: 8px 16px;">备货：要求发货时间=下单时间+SKU货期</Alert>
          <div class="table-box fmb0">
            <Table highlight-row max-height="460" :columns="columns" :data="formValidate.tableList" :border="true"
              :loading="Tableloading">
              <template slot-scope="{ row }" slot="status">
                <span>{{ row.businessStatus === 1 ? '已开通' : '未开通' }}</span>
              </template>
              <template slot-scope="{ row }" slot="createdTime">
                <span>{{ getDataToLocalTime(row.createdTime, "fulltime", true) }}</span>
              </template>
              <template slot-scope="{ row }" slot="readyType">
                <span v-if="row.readyType != null">{{ purchaseList[row.readyType].label }}</span>
              </template>
              <!-- <template slot-scope="{ row, index }" slot="requireDespatchTime"> -->
              <template slot="requireDespatchTime">
                <span>下单时间+货期</span>
                <!-- <span v-if="row.readyType != 0 || row.readyType == null">下单时间+货期</span> -->
                <!-- <FormItem :rules="ruleValidate.requireDespatchTime" :show-message="false"
                  :prop="'tableList.' + index + '.requireDespatchTime'" v-else>
                  <DatePicker type="datetime" format="yyyy-MM-dd HH:mm" placeholder="请选择"
                    :value="formValidate.tableList[index].requireDespatchTime" :options="options" :transfer="true"
                    @on-change="pickDataChange" @on-clear="clearTime(index)" @on-open-change="timeOk(index)">
                  </DatePicker>
                </FormItem> -->
              </template>
              <template slot-scope="{ row, index }" slot="iscrash">
                <i-switch v-model="formValidate.tableList[index].iscrash" @on-change="iscrashChange(row, index)">
                </i-switch>
              </template>
              <template slot-scope="{ index }" slot="requireDespatch">
                <Input v-model="formValidate.tableList[index].requireDespatch" maxlength="500" show-word-limit
                  placeholder="请输入" />
              </template>
            </Table>
          </div>
        </Form>
      </div>
      <div slot="footer" style="text-align: center;">
        <Button type="primary" @click="handleSubmit('form')" :loading="loading">保存 </Button>
        <Button @click="modelVisible = false">关闭</Button>
      </div>
    </Modal>

  </div>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import { getNewData } from '@/utils/comfun.js';
import { purchaseList } from '@/views/supplierPurchase/purchaseManagement/supplyOrder/configFile.js'
export default {
  mixins: [Mixin],
  data () {
    return {
      Tableloading: false,
      dateTime: '',
      columns: [
        {
          title: '采购单号',
          width: '160',
          key: 'purchaseNumber',
        },
        {
          title: '供应商',
          width: '184',
          key: 'supplierName',
          render (h, params) {
            return h('div', {
              class: 'textOver',
              attrs: { title: params.row.supplierName },
            }, params.row.supplierName)
          },
        },
        {
          title: '商家系统开通状态',
          width: '140',
          slot: 'status',
        },
        {
          title: '下单时间',
          width: '150',
          slot: 'createdTime',
        },
        {
          title: '备货类型',
          width: '120',
          slot: 'readyType'
        },
        {
          title: '要求收货时间',
          width: '220',
          slot: 'requireDespatchTime'
        },
        /* {
          title: '是否急单',
          width: '100',
          slot: 'iscrash'
        }, */
        {
          title: '发货要求',
          width: '240',
          slot: 'requireDespatch'
        }
      ],
      formValidate: {
        tableList: []
      },
      ruleValidate: {
        requireDespatchTime: [
          { required: true, message: '请输入发货时间', trigger: 'change' },
        ],
      },
      options: {
        disabledDate (date) {
          return date && date.valueOf() < Date.now() - 86400000;
        }
      },
      timeIndex: -1,
      modelVisible: false,
      loading: false,
      purchaseList,
    };
  },
  props: {
    dialogObj: {
      type: Object,
      default () {
        return {
          modelVisible: false,
          list: []
        };
      }
    }
  },
  mounted () {
    this.requireDate();
  },
  watch: {
    "dialogObj.modelVisible": {
      immediate: true,
      deep: true,
      handler (val) {
        if (val) this.handleReset();
      }
    },
    modelVisible: {
      deep: true,
      handler (val) {
        val && this.handleReset();
        const newObj = {
          ...this.dialogObj,
          modelVisible: val
        }
        this.$emit('update:dialogObj', newObj);
      }
    },
  },
  methods: {
    requireDate () {
      const myDate = this.$common.dayjs();
      if (myDate.hour() < 12) {
        this.dateTime = `${myDate.format('YYYY-MM-DD')} 23:59`;
      } else {
        this.dateTime = `${myDate.add(1, 'day').format('YYYY-MM-DD')} 23:59`;
      }
    },
    // 提交
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          let flag = false
          this.formValidate.tableList.forEach(item => {
            if(item.readyType == 5 && item.businessStatus !== 1) {
              flag = true
            }
          })
          if(flag) return this.$Message.error('“直发备货”的下单供应商必须开通“供应商系统”')
          let arr = this.formValidate.tableList;
          let [list, ids] = [[], []];
          arr.forEach(k => {
            let obj = {};
            obj.businessStatus = k.businessStatus;
            obj.iscrash = k.iscrash ? 1 : 0;
            obj.purchaseId = k.purchaseId;
            obj.purchaseNumber = k.purchaseNumber;
            obj.readyType = k.readyType;
            obj.requireDespatch = k.requireDespatch;
            //obj.requireDespatchTime = k.iscrash && k.requireDespatchTime ? k.requireDespatchTime + ':59' : null;
            //obj.requireDespatchTime = k.iscrash && k.requireDespatchTime ? k.requireDespatchTime + ':59' : null;
            if (k.readyType == 0) {
              obj.requireDespatchTime = k.requireDespatchTime + ':59';
            } else {
              obj.requireDespatchTime = null
            }
            obj.supplierId = k.supplierId;
            list.push(obj);
            ids.push(k.purchaseId);
          });
          this.beforeHandle(list, ids);
        }
        else {
          this.$Message.warning('不能为空！');
          return;
        }
      });
    },
    // 先进行批量操作
    beforeHandle (list, ids) {
      let temp = {};
      temp.operationType = 4;
      temp.purchaseIdList = ids;
      temp.orderInformationQOList = list;
      this.loading = true;
      this.axios.post(api.purchaseOperation, temp).then((res) => {
        if (res.data.code == 0) {
          this.afterHandle(list);
        } else {
          this.loading = false;
        }
      }).catch(() => {
        this.loading = false;
      });
    },
    // 后面再提交向供应商下单信息(接口这样==)
    afterHandle (list) {
      this.axios.post(api.batchCreateOrderGoods, list).then((res) => {
        if (res.data.code == 0) {
          this.$Message.success("操作成功");
          this.modelVisible = false;
          this.$emit('search');
        }
      }).finally(() => {
        this.loading = false;
      });
    },
    // 列表给的数据太多了，所以做一下数据筛选
    handleReset () {
      this.modelVisible = this.dialogObj.modelVisible;

      let list = this.dialogObj.list;
      let arr = [];
      list.forEach(k => {
        arr.push({
          businessStatus: k.businessStatus || 0,
          purchaseId: k.purchaseId,
          purchaseNumber: k.purchaseNumber,
          supplierId: k.supplierId,
          supplierName: k.supplierName,
          createdTime: k.createdTime,
          readyType: k.readyType,
          requireDespatchTime: k.requireDespatchTime,
          requireDespatch: '',
          iscrash: false,
        });
      });
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].readyType == 0) {
          arr[i].requireDespatchTime = this.dateTime
        }
      }
      this.formValidate.tableList = arr;
    },
    // 时间选择
    pickDataChange (value) {
      this.time = value;
    },
    // 日历打开和关闭时执行
    timeOk (index) {
      this.timeIndex = index
    },
    // 时间选择取消
    clearTime (index) {
      this.formValidate.tableList[index].requireDespatchTime = '';
    },
    // 根据订单的急单类型，根据交期，自动计算要求发货时间
    iscrashChange (row, index) {
      if (!row.iscrash) {
        // 选中状态时，订单每个SKU的要求发货时间可以设置，默认的设置时间为：下单日期+1，时间默认为：23：59；
        this.formValidate.tableList[index].requireDespatchTime = getNewData(row.createdTime, 1) + ' 23:59';
      } else {
        // 不选中状态时，订单每个SKU的要求发货时间=下单时间+交期，计算方法：要求发货日期=下单日期+交期天数，时间默认为23：59
        // this.orderData.requireDespatchTime = getNewData(this.orderData.createdTime) + ' 23:59';
      }
    }
  }
};
</script>