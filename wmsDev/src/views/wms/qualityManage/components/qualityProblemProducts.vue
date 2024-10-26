<template>
  <div>
    <Modal v-model="isVisible" :title="title[type] || '查看详情'" :width="1200" :mask-closable="false"
      :closable="modalClose" class="qualityProblemProducts-page formDetail">
      <div>
        <Alert v-if="type==2">提示：按产品合格数量生成上架需求，请把转为合格产品上架</Alert>
        <Form ref="formCustom" :model="formData" :label-width="0" class="fmb0">
          <Table highlight-row border :columns="columns" :data="formData.tableList" :loading="tableLoading"
            maxHeight="600">
            <template slot-scope="{ row }" slot="basicInfo">
              <div class="order-item">
                <div class="order-li">质检记录号：{{row.receiptBatchCheckDetailNo || ''}}</div>
                <div class="order-li">SKU：{{row.sku || ''}}</div>
                <div class="order-li--text">
                  <Tooltip :content="row.description" :disabled="!row.description" placement="top">
                    {{row.description || ''}}</Tooltip>
                </div>
                <div class="order-li order-li--tag">{{row.goodsAttributes || ''}}</div>
              </div>
            </template>
            <template slot-scope="{ row }" slot="checkAttachmentList">
              <div class="picture-width">
                <dyt-previewImg :fileList="returnList(row)"
                  :imgOption="{ listWidth: 50, listHeight: 50, mode: 'multiple' }">
                </dyt-previewImg>
              </div>
            </template>
            <template slot-scope="{ row, index }" slot="turnQualifiedNumber">
              <FormItem label="" :prop="'tableList.' + index + '.turnQualifiedNumber'"
                :rules="{ validator: validateQualifyNum, trigger: 'change', remainNumber: row.remainNumber }">
                <Input v-model.number="formData.tableList[index].turnQualifiedNumber" type="number"
                  class="spinButton" />
              </FormItem>
            </template>
          </Table>
        </Form>
      </div>
      <div slot="footer">
        <Button type="primary" @click="submitProblem" v-if="type==2" :disabled="btnLoading">确定</Button>
        <Button @click="isVisible = false">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
import Big from 'big.js';
import regular from '@/utils/regular.js';
export default {
  name: 'qualityProblemProducts',
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return false
      }
    },
    modalData: {
      type: Object,
      default() {
        return {}
      }
    },
    type: { // 1、查看详情 2、转合格产品上架
      type: Number,
      default() {
        return 1
      }
    },
  },
  data() {
    return {
      isVisible: false,
      title: {
        1: "质检问题产品详情",
        2: "质检问题产品转为合格产品上架",
      },
      formData: {
        tableList: []
      },
      columns: [],
      tableLoading: false, // 表格加载
      btnLoading: false, // 表单提交加载
      copyTableList: [], // 备份表格数据，比较改动数据
    }
  },
  watch: {
    modelVisible: {
      handler(val) {
        val && this.open();
      },
      deep: true
    },
    isVisible: {
      handler(val) {
        if (val) return;
        this.$emit('update:modelVisible', val);
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
    // 窗口打开
    open() {
      this.isVisible = true;
      this.getColumns();
      this.getDetail();
    },
    resetData() {
      this.formData.tableList = [];
      this.copyTableList = [];
      this.btnLoading = false;
      this.tableLoading = false;
    },
    // 获取质检问题产品详情数据
    getDetail() {
      let [modalData, params] = [this.modalData, {}];
      params.receiptCheckNo = modalData.receiptCheckNo;
      if (modalData.apiType === 'detail') params.productGoodsId = modalData.productGoodsId;
      let url = this.type == 2 ? api.quality_queryQualifiedData : api.quality_getReceiptProblem;
      // console.log(this.modalData, params);
      this.tableLoading = true;
      this.axios.post(url, params).then(({ data }) => {
        if (data.code !== 0) return;
        let list = (data.datas || []).map(k => {
          k.turnQualifiedNumber = 0;
          return k;
        });
        this.formData.tableList = list;
        this.copyTableList = this.$common.copy(list);
      }).finally(() => {
        this.tableLoading = false;
      })
    },
    getColumns() {
      let columnsList = [
        {
          title: '基本信息',
          slot: 'basicInfo',
          align: 'center',
          minWidth: 240,
        },
        {
          title: '问题原因',
          key: 'problemCheckReason',
          align: 'center',
          minWidth: 120,
          tooltip: true,
        },
        {
          title: '质检图片',
          slot: 'checkAttachmentList',
          align: 'center',
          width: 150,
        },
        {
          title: '备注',
          key: 'remark',
          align: 'center',
          minWidth: 120,
          tooltip: true,
        },
        {
          title: '问题数量',
          key: 'problemCheckNumber',
          align: 'center',
          minWidth: 100,
        },
        {
          title: '退货数量',
          key: 'refundNumber',
          align: 'center',
          width: 100,
        },
        {
          title: '销毁数量',
          key: 'destructionNumber',
          align: 'center',
          width: 100,
        },
        {
          title: '剩余数量',
          key: 'remainNumber',
          align: 'center',
          width: 100,
        },
      ]
      if (this.type == 2) {
        columnsList.push({
          title: '转为合格数量',
          slot: 'turnQualifiedNumber',
          align: 'center',
          minWidth: 120,
        })
      }
      this.columns = columnsList;
    },
    // 处理图片列表
    returnList(row) {
      let list = (row.checkAttachmentList || []).map((k, i) => {
        return { url: k };
      })
      return list;
    },
    // 合格数量限制
    validateQualifyNum(rule, value, callback) {
      if (value === '' || value === undefined || value === null) {
        return callback(new Error('请输入内容'));
      }
      if (!regular.integer.test(value)) {
        return callback(new Error('限大于或等于0的整数'));
      }
      if (new Big(value || 0).minus(rule.remainNumber || 0) > 0) {
        return callback(new Error('不能小于SKU剩余数量'));
      }
      return callback();
    },
    // 提交合格数
    submitProblem() {
      this.$refs['formCustom'].validate((valid) => {
        if (!valid) return;
        let list = this.formData.tableList;
        let copyList = this.copyTableList;
        let filterList = [];
        list.forEach((k, i) => {
          if (k.turnQualifiedNumber !== copyList[i].turnQualifiedNumber) filterList.push(k);
        })
        if (!filterList.length) return this.$Message.warning('数据无改动~');
        let params = filterList.map(k => {
          return {
            receiptBatchCheckDetailNo: k.receiptBatchCheckDetailNo,
            sku: k.sku,
            turnQualifiedNumber: k.turnQualifiedNumber,
          }
        })
        // console.log(params, 'params')
        this.btnLoading = true;
        this.axios.post(api.quality_createShelve, params).then(({ data }) => {
          if (data.code !== 0) return;
          this.$Message.success('操作成功');
          this.isVisible = false;
          this.$emit('checkSearch');
        }).finally(() => {
          this.btnLoading = false;
        })
      })
    }
  }
}
</script>

<style lang="less">
.qualityProblemProducts-page {}
</style>
