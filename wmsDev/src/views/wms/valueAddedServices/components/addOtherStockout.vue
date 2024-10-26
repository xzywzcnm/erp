<template>
  <Modal v-model="isVisible" title="添加（其他出库）" :mask-closable="false" width="1000px">
    <div class="formDetail" style="padding: 10px 16px 0;">
      <Alert type="warning" show-icon style="display:inline-block;padding: 8px 8px 8px 36px;line-height: 16px;">
        温馨提示：只允许添加“其他出库单”的增值服务，其他出库包括：{{ stockoutList }}
      </Alert>
      <Form ref="formData" :model="formData" :rules="formRule" :label-width="90" class="fmb18">
        <Form-item label="增值服务：" prop="serviceType">
          <RadioGroup v-model="formData.serviceType" type="button" button-style="solid">
            <Radio :label="item.value" v-for="(item, index) in valAddList" :key="index">{{ item.label }}</Radio>
          </RadioGroup>
        </Form-item>
        <Row :gutter="20">
          <Col span="12">
          <Form-item label="出库单号：" prop="pickingNo">
            <div class="flexCenter">
              <!--  @on-blur="searchDetail" -->
              <dyt-input v-model.trim="formData.pickingNo" placeholder="回车查询出库单详情" @on-enter="searchDetail"
                @on-clear="searchDetail" />
              <Icon type="md-checkmark" size="24" color="#008000" class="ml10" v-if="stockDetail.pickingId" />
              <Icon type="md-close" size="24" color="#FF0000" class="ml10" v-else />
            </div>
          </Form-item>
          <Form-item label="单据类型：">
            <div v-if="documTypeList[stockDetail.invoicesType]">{{ documTypeList[stockDetail.invoicesType].label }}</div>
          </Form-item>
          <Form-item label="事业部：">
            <div v-if="businessDeptList[stockDetail.businessDeptId]">
              {{ businessDeptList[stockDetail.businessDeptId].name }}
            </div>
          </Form-item>
          <Form-item label="SKU数量：">{{ stockDetail.skuSum }}</Form-item>
          <Form-item label="商品数量：">{{ stockDetail.productSum }}</Form-item>
          <Form-item label="箱数量：">{{ stockDetail.boxSum }}</Form-item>
          <Spin fix v-if="pageLoading"></Spin>
          </Col>
          <Col span="12">
          <Form-item label="操作日期：" prop="operateTime">
            <DatePicker type="date" format="yyyy-MM-dd" style="width: 240px;" transfer placeholder="请选择"
              @on-change="timeChange" :value="formData.operateTime"></DatePicker>
          </Form-item>
          <Form-item label="备注：" prop="remark">
            <Input v-model="formData.remark" maxlength="200" show-word-limit type="textarea" />
          </Form-item>
          <Form-item label="提示：" style="background-color:#f3f3f3;" class="autoLong">
            <div>1、增值服务的报表，按“操作日期”统计</div>
            <div>2、操作数量不能大于商品数量</div>
            <div>3、海外仓装车，操作数量不能大于箱数量</div>
            <div>4、出库单同个增值服务的共同完成操作人不能超过4个</div>
          </Form-item>
          </Col>
        </Row>
      </Form>
      <Table border highlight-row :columns="columns" :data="data">
        <template slot-scope="{ row, index }" slot="operator">
          <dyt-select v-model="data[index].operateUser">
            <Option v-for="item in userInfoList" :key="item.erpUserId" :label="item.name" :value="item.erpUserId"
              :disabled="operateUserList.includes(item.erpUserId)">
            </Option>
          </dyt-select>
        </template>
        <template slot-scope="{ row, index }" slot="operatorNum">
          <InputNumber v-model="data[index].operateQuantity" style="width: 100%;" :min="1"></InputNumber>
        </template>
      </Table>
    </div>
    <div slot="footer">
      <Button @click="closeModal">取消</Button>
      <Button type="primary" @click="modalConfirm" :loading="loading">确定</Button>
    </div>
  </Modal>
</template>
<script>
import Big from 'big.js';
import api from '@/api/api';
import { valAddList, documTypeList } from "./fileData";
import { getWarehouseId } from '@/utils/getService';
export default {
  name: "valueAddedOtherStockout",
  components: {},
  props: {
    modelVisible: {
      type: Boolean,
      default: false
    },
    userInfoList: {
      type: Array,
      default: () => {
        return [];
      }
    },
  },
  data() {
    return {
      loading: false,
      isVisible: false,
      pageLoading: false,
      formData: {
        pickingNo: null,
        serviceType: null,
        operateTime: null,
        remark: null,
      },
      formRule: {
        serviceType: [
          { required: true, message: '请选择', trigger: 'change', type: 'number' }
        ],
        pickingNo: [
          { required: true, message: '请输入', trigger: 'blur' }
        ],
        operateTime: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
      },
      columns: [
        {
          title: "操作人",
          align: "left",
          slot: 'operator',
          renderHeader: (h, params) => {
            return h('div', {}, [
              h('span', {
                style: {
                  color: 'red',
                  fontSize: '14px',
                  padding: '0 6px',
                }
              }, '*'),
              h('span', {}, '操作人'),
            ])
          },
        },
        {
          title: "操作数量",
          align: "left",
          slot: 'operatorNum',
          renderHeader: (h, params) => {
            return h('div', {}, [
              h('span', {
                style: {
                  color: 'red',
                  fontSize: '14px',
                  padding: '0 6px',
                }
              }, '*'),
              h('span', {}, '操作数量'),
            ])
          },
        },
      ],
      data: [],
      stockDetail: {},
      documTypeList: documTypeList,
      isChange: false,
    };
  },
  watch: {
    modelVisible(newVal) {
      newVal && this.init();
    },
    isVisible(newVal) {
      this.$emit('update:modelVisible', newVal);
      !newVal && this.closeModal();
    },
  },
  computed: {
    valAddList() {
      return Object.keys(valAddList).map(k => valAddList[k]).filter(k => k.type && k.type.includes(2));
    },
    stockoutList() {
      return Object.keys(documTypeList).map(k => documTypeList[k].label).filter(k => !['销售出库'].includes(k)).join('，');
    },
    warehouseId() {
      return this.$store.state.warehouseId || getWarehouseId();
    },
    businessDeptList() {
      let businessDeptList = this.$store.getters.getBusinessDeptList || [];
      return this.$common.arrayToObj(businessDeptList, 'id');
    },
    operateUserList() {
      return this.data.map(k => k.operateUser).filter(k => !this.$common.isEmpty(k));
    },
  },
  methods: {
    init() {
      this.isVisible = true;
      this.isChange = false;
      this.reset();
      // this.getUserInfoList();
    },
    reset() {
      this.stockDetail = {};
      this.data = [];
      for (let i = 0; i < 4; i++) {
        this.data.push({ operateUser: null, operateQuantity: null });
      }
      this.$nextTick(() => {
        this.$refs['formData'].resetFields();
      })
    },
    // getUserInfoList() {
    //   this.axios.post(api.valAddService_queryAffiliatedBusinessDeptPersonByIds, [16]).then((res) => {
    //     if (res.data.status === 200) {
    //       this.userInfoList = res.data.data || [];
    //     }
    //   })
    // },
    // 关闭弹窗
    closeModal() {
      if (this.isChange) this.$emit('refreshAll');
      this.isVisible = false;
    },
    timeChange(e) {
      this.formData.operateTime = e;
    },
    // 查询出库单信息
    searchDetail() {
      let pickingNo = this.formData.pickingNo;
      this.stockDetail = {};
      if (this.$common.isEmpty(pickingNo)) {
        // this.$Message.warning('请输入出库单号！');
        return;
      }
      this.pageLoading = true;
      this.axios.post(`${api.valAddService_queryPickingInfo}${this.warehouseId}?pickingNo=${pickingNo}`, {}, { hiddenError: true })
        .then(({ data }) => {
          if (data.code === 0) {
            const temp = data.datas || {};
            this.stockDetail = temp;
            this.timeChange(temp.createdTime)
          } else if ([555143].includes(data.code)) {
            this.$Message.warning('出库单不存在！');
            return;
          } else {
            this.$Message.warning(data.message || '操作失败');
          }
        }).finally(() => {
          this.pageLoading = false;
        });
    },
    modalConfirm() {
      this.$refs['formData'].validate((valid) => {
        if (!valid) return;
        if (!this.stockDetail.pickingId) {
          this.$Message.warning('请在线检测出库单号是否正确！');
          return;
        }
        // 所有“操作人”的“操作数量”之和，不可以大于出库单的“商品数量”；
        // 四组操作人与操作数量，最少填写一组；
        let list = this.data.filter(k => {
          return !(this.$common.isEmpty(k.operateUser) || this.$common.isEmpty(k.operateQuantity));
        });
        if (!list.length) {
          this.$Message.warning('操作人与操作数量，最少填写一组');
          return;
        }
        const operateQuantityTotal = list.reduce((accumulator, item) => accumulator + item.operateQuantity, 0);
        const subNum = new Big(operateQuantityTotal).minus(this.stockDetail.productSum || 0) - 0;
        if (subNum > 0) {
          this.$Message.warning('所有“操作人”的“操作数量”之和，不可以大于出库单的“商品数量”');
          return;
        }
        let temp = Object.assign({}, this.formData);
        temp.warehouseId = this.warehouseId;
        temp.pickingDetailBOList = list;

        this.loading = true;
        this.axios.post(api.valAddService_savePicking, temp).then(res => {
          if (!res || !res.data || res.data.code !== 0) return;
          this.isChange = true;
          this.$Message.success('操作成功');
          this.reset();
          // this.isVisible = false;
          // this.$emit('refreshAll');
        }).finally(() => {
          this.loading = false;
        })
      })
    },
  }
};
</script>
<!-- <style lang="less" scoped>
</style> -->