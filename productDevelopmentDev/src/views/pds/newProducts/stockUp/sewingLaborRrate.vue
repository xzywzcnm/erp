<template>
  <div class="sewingLaborRratePage">
    <div class="mb10">
      <Button type="primary" @click="add" v-if="isEdit">新增</Button>
    </div>
    <Table border :columns="sewingColumns" :data="tableData"></Table>
    <div class="table-footer">
      <div class="seat"></div>
      <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80" class="fmb0 flex1">
        <FormItem label="加工倍率" prop="processingRatio">
          <Input v-model="formValidate.processingRatio" placeholder="必填，最多2位小数" type="number" style="width: 160px;" :disabled="!isEdit" />
        </FormItem>
      </Form>
      <div class="flex1">合计：{{ totalPrice }}</div>
    </div>
    <Spin v-if="pageLoading" fix></Spin>
    <Modal v-model="productInfo.dialogVisible" width="800" title="新增工序" :mask-closable="false" :closable="false">
      <div>
        <Form ref="productInfo" :model="productInfo.formValidate" inline :label-width="80" class="fmb16 formSearch">
          <FormItem label="工序描述:" prop="description">
            <Input v-model="productInfo.formValidate.description" placeholder="请输入，支持模糊查询" />
          </FormItem>
          <FormItem label="" :label-width="0">
            <Button type="primary" @click="search">查询</Button>
          </FormItem>
        </Form>
        <Table border :columns="productInfo.modalTableColumns" :data="productInfo.modalTableData" max-height="460"
          @on-selection-change="selectChange" ref="selection" :loading="productInfo.tableLoading"></Table>
        <div style="text-align:right;" class="mt10"><page-common :pageConfig="productInfo.proPage"
            @ChangePage="ChangePage" @ChangePageSize="ChangePageSize"></page-common></div>
      </div>
      <div slot="footer">
        <Button @click="productInfo.dialogVisible = false">取消</Button>
        <Button type="primary" @click="handleNext">保存</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import api from '@/api/api.js';
import pageCommon from '@/components/pageCommon';

export default {
  name: "sewingLaborRrate",
  components: { pageCommon },
  props: {
    openType: {type: String, default: 'info'},
    btnoperat: {type: String, default: ''},
    modelVisible: { type: Boolean, default: false },
    productData: {
      type: Object,
      default() {
        return {};
      }
    },
  },
  data() {
    return {
      pageLoading: false,
      tableData: [],
      sewingTableCol: [
        {
          title: '工序描述',
          key: 'description',
          align: 'center',
        },
        {
          title: '工序金额（元）',
          key: 'price',
          align: 'center',
        }
      ],
      formValidate: {
        processingRatio: '',
      },
      ruleValidate: {
        processingRatio: [
          { required: true, validator: this.validatorMaxNumber, point: 2, msg: '请输入不小于0的整数或两位小数', trigger: 'change', type: 'number' },
          { required: true, validator: this.validatorMaxNumber, point: 2, msg: '请输入不小于0的整数或两位小数', trigger: 'blur', type: 'number' },
        ],
      },
      productInfo: {
        dialogVisible: false,
        formValidate: {
          description: '',
        },
        proPage: {
          total: 0,
          pageNum: 1,
          pageSize: 10,
        },
        modalTableColumns: [
          {
            type: 'selection',
            width: 60,
            align: 'center'
          },
          {
            title: '工序描述',
            key: 'description',
            align: 'center',
          },
          {
            title: '工序单价（元）',
            width: 200,
            key: 'price',
            align: 'center',
          }
        ],
        modalTableData: [],
        checkedList: [],
        tableLoading: false,
      },
    };
  },
  watch: {
    modelVisible: {
      immediate: true,
      handler (val) {
        this.$nextTick(() => {
          setTimeout(() => {
            val && this.pageInit();
          }, 300);
        })
      }
    }
  },
  computed: {
    // 是否可编辑
    isEdit () {
      return ['edit'].includes(this.openType) && ['pEvaluationConfirm'].includes(this.btnoperat);
    },
    // 价格计算
    totalPrice() {
      const values = this.tableData.map(item => Number(item['price'] || 0));
      const v = values.reduce((prev, curr) => {
        const value = Number(curr);
        if (!isNaN(value)) {
          return prev + curr;
        } else {
          return prev;
        }
      }, 0)
      return v.toFixed(2);
    },
    // 列表列设置
    sewingColumns () {
      const operation = {
        title: '操作',
        key: 'index',
        width: '120',
        align: 'center',
        render: (h, { index }) => {
          return h('div', {
            style: {
              display: 'inline-block',
              cursor: 'pointer',
              color: '#2d8cf0',
            },
            on: {
              'click': () => {
                this.$Modal.confirm({
                  title: '操作',
                  content: '<p>确认移除该工序？</p>',
                  loading: true,
                  onOk: () => {
                    this.$Modal.remove();
                    this.tableData.splice(index, 1);
                  }
                });
              }
            }
          }, '移除')
        },
      }
      return this.isEdit ? [operation, ...this.sewingTableCol] : this.sewingTableCol;
    },
  },
  created() {},
  methods: {
    pageInit () {
      this.pageLoading = true;
      let awaitRes = [this.detail];
      this.$common.promiseAll(awaitRes).then(resArr => {
        this.pageLoading = false;
        // console.log(resArr);
      }).catch(() => {
        this.pageLoading = false;
      })
    },
    detail() {
      return new Promise((resolve) => {
        const rqApi = `${api.queryProcesses}?productId=${this.productData.productId}`;
        this.axios.get(rqApi).then((data) => {
          if (data && data.datas) {
            let temps = data.datas || {};
            Object.keys(this.formValidate).forEach(key => {
              this.formValidate[key] = temps[key];
            })
            this.tableData = (temps.laPaProductProcessesList || []).map(k => {
              return {
                description: k.processes,
                processId: k.processesId,
                price: k.amount,
                ...k,
              }
            })
            return resolve(temps);
          }
        }).catch((err) => {
          console.error(err);
          resolve({});
        })
      })
    },
    // 返回表单值 type 为 1 时验证， 其他值不验证
    getFormData (type) {
      return new Promise((resolve) => {
        const list = this.tableData.map(k => {
          return {
            processes: k.description,
            processesId: k.processId,
            amount: k.price
          }
        })
        if (type == 1) {
          this.$refs['formValidate'].validate((valid) => {
            if (!valid) {
              this.$Message.error('“车缝工价”表单验证不通过，请检查');
              return resolve({ success: false, message: '“车缝工价”表单验证不通过，请检查' });
            }
            if (this.$common.isEmpty(list)) {
              this.$Message.error('“车缝工价”的工序至少选一个');
              return resolve({ success: false, message: '“车缝工价”的工序至少选一个' });
            }
            resolve({
              success: true,
              data: {
                list: list,
                params: `?productId=${this.productData.productId}&processingRatio=${this.formValidate.processingRatio}`
              }
            });
          })
          return;
        }
        resolve({
          success: true,
          data: {
            list: list,
            params: `?productId=${this.productData.productId}&processingRatio=${this.formValidate.processingRatio}`
          }
        });
      })
    },
    // 保存当前值 type 为 1 时验证， 其他值不验证
    saveFormData (type) {
      return new Promise((resolve) => {
        this.getFormData(type).then(res => {
          if (!res.success) return resolve({ success: false, message: '表单验证不通过' });
          this.pageLoading = true;
          this.$axios.post(`${api.saveProcesses}${res.data.params}`, res.data.list).then(({ code, datas }) => {
            if (code != 0) return resolve({ success: false, message: '请求失败' });
            type != 1 && this.$Message.success('操作成功!');
            resolve({ success: true, data: datas, isColose: type != 1  });
          }).catch(err => {
            resolve({ success: false, data: err  });
          }).finally(() => {
            this.pageLoading = false;
          })
        })
      })
    },
    add() {
      this.productInfo.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs['productInfo'].resetFields();
        this.$refs.selection.selectAll(false);
      })
      this.search();
    },
    search() {
      this.productInfo.proPage.pageNum = 1;
      this.getList();
    },
    getList() {
      let temp = this.$common.removeEmpty({ ...this.productInfo.formValidate, ...this.productInfo.proPage });
      delete temp.total;
      this.productInfo.tableLoading = true;
      this.axios.post(api.queryProductProcessList, temp).then((data) => {
        if (data && data.datas) {
          this.productInfo.modalTableData = data.datas.list || [];
          this.productInfo.proPage.total = data.datas.total || 0;
          this.$refs.selection.selectAll(false);
          this.productInfo.checkedList = [];
        }
      }).finally(() => {
        this.productInfo.tableLoading = false;
      });
    },
    // 验证大于0的小数
    validatorMaxNumber (rule, value, callback) {
      this.$nextTick(() => {
        if (rule.required && this.$common.isEmpty(value)) {
          return callback(new Error(rule.msg || '必填项不能为空'));
        }
        const point = rule.point;
        if (!this.$common.isEmpty(value) && !this.$common.isEmpty(point)) {
          const newVal = Number(value);
          const decimals = (value.toString()).split('.');
          if (decimals.length > 1 && this.$common.isEmpty(decimals[0])) {
            return callback(new Error('请输入数字'));
          }
          if (this.$common.isEmpty(newVal) || newVal <= 0 || (!this.$common.isEmpty(decimals[1]) && decimals[1].length > point)) {
            if (point == 0) {
              return callback(new Error(`请输入不小于0的整数`));
            }
            return callback(new Error(`请输入不小于0且最多${point}位小数的数字`));
          }
        }
        callback();
      })
    },
    // 表格多项选择
    selectChange(list) {
      this.productInfo.checkedList = list;
    },
    // 返回pageSize
    ChangePageSize(pageSize) {
      this.productInfo.proPage.pageSize = pageSize;
      this.getList();
    },
    // 返回page
    ChangePage(page) {
      this.productInfo.proPage.pageNum = page;
      this.getList();
    },
    handleNext() {
      let list = this.productInfo.checkedList;
      if (!list.length) {
        this.$Message.warning('请勾选要添加的工序!');
        return;
      }
      let temp = {};
      let arr = [...this.tableData, ...list];
      arr.forEach(k => { temp[k.processId] = k });
      this.tableData = Object.values(temp);
      this.productInfo.dialogVisible = false;
    },
  }
};
</script>
<style lang="less" scoped>
.sewingLaborRratePage {
  position: relative;

  .table-footer {
    display: flex;
    align-items: center;
    padding: 10px 0;
    border: 1px solid #dcdee2;
    border-top: none;
    background-color: #f8f8f9;

    .seat {
      width: 120px;
    }

    .flex1 {
      flex: 1;
      display: flex;
      justify-content: center;
    }
  }
}
</style>
