<template>
  <div>
    <Modal v-model="isVisible" title="账单付款抵扣" width="1340" :mask-closable="false" class="deductionManagePage">
      <div class="fmb0">
        <Form ref="searchParams" :model="searchParams" :label-width="76" inline class="deSearchStyle">
          <div class="inline-form">
            <FormItem label="供应商名称:" prop="supplierName">
              <Input v-model="searchParams.supplierName" placeholder="请输入" clearable />
            </FormItem>
            <FormItem label="记账月份:" prop="billMonth">
              <DatePicker type="month" placeholder="请选择月份" format="yyyy-MM" :value="searchParams.billMonth"
                @on-change="billMothChange"></DatePicker>
            </FormItem>
            <FormItem label="账单状态:" prop="billStatusList">
              <dyt-select v-model="searchParams.billStatusList" :max-tag-count="1" multiple>
                <template v-for="(item, index) in billOptionList">
                  <Option :value="item.value" :key="index" v-if="!item.hideSelect">{{ item.label }}</Option>
                </template>
              </dyt-select>
            </FormItem>
            <FormItem label="汇总状态:" prop="deductionStatus">
              <dyt-select v-model="searchParams.deductionStatus">
                <Option v-for="(item, index) in deductionList" :value="item.value" :key="index">{{
                  item.label }}
                </Option>
              </dyt-select>
            </FormItem>
            <FormItem label="创建时间:" prop="createTime">
              <DatePicker transfer type="datetimerange" placement="bottom-end" placeholder="选择日期" split-panels
                :value="createTime" format="yyyy-MM-dd HH:mm:ss" :options="dateOptions" @on-change="getDateValue" />
            </FormItem>
            <FormItem :label-width="0" class="autoLong">
              <Button type="primary" class="ml10" @click="search">查询</Button>
            </FormItem>
            <FormItem label="手动完成:" prop="manualCompletion" class="mt10">
              <dyt-select v-model="searchParams.manualCompletion">
                <Option  :value="2">否 </Option>
                <Option  :value="1">是 </Option>
              </dyt-select>
            </FormItem>
          </div>
        </Form>
        <div class="mt20">
          <Button type="primary" class="mr10" @click="billDeduction('add')"
            v-if="getPermission('supplierBillApply_deduction_insert')">新增</Button>
          <Dropdown class="mr10" @on-click="exportExcel" v-if="getPermission('supplierBillApply_deduction_export')">
            <Button type="primary" :loading="exportLoading">
              导出
              <Icon type="ios-arrow-down"></Icon>
            </Button>
            <DropdownMenu slot="list">
              <DropdownItem :name="1">导出选中</DropdownItem>
              <DropdownItem :name="2">导出所有</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <div class="mt10">
          <Table highlight-row :columns="columns" :data="tableList" :loading="loading" border
            @on-selection-change="getSelectValue" max-height="550" class="selfStyleTable" ref="tables" @on-sort-change='changeSort'></Table>
          <div class="mt10" style="text-align:right;">
            <Page :total="tableItemTotal" :current="searchParams.pageNum" :page-size="searchParams.pageSize" show-total
              show-sizer show-elevator @on-change="pageNumChange" @on-page-size-change="pageSizeChange"
              :page-size-opts="pageArray" size="small"></Page>
          </div>
        </div>

        <!-- 抵扣 -->
        <deductionDetails :modelVisible.sync="deductionInfo.visible" :data="deductionInfo.data"
          :deductType="deductionInfo.type" @renewList="search" :createUserArr="createUserArr" />
      </div>
      <div slot="footer"></div>
    </Modal>
  </div>
</template>
<script>
import api from "@/api/api";
// import { arrayToObj } from "./fileData";
const searchParams = {
  supplierName: "",
  billMonth: "",
  billStatusList: [],
  deductionStatus: "",
  manualCompletion: null,
  createdStartTime: "",
  createdEndTime: "",
  businessDeptId: '',//用户可查看事业部
  upDown: '', //记账月份升降序
  pageNum: 1,
  pageSize: 10,
};
import Mixin from "@/components/mixin/common_mixin";
import deductionDetails from './deductionDetails';
import { billOptionList, deductionList } from './fileData.js';
export default {
  name: "deductionManage",
  mixins: [Mixin],
  components: { deductionDetails },
  props: {
    modelVisible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    let _this = this;
    return {
      isVisible: false,
      tableList: [],
      columns: [
        {
          type: "selection",
          width: 40,
          align: "center",
        },
        {
          title: "供应商名称",
          key: "supplierName",
          minWidth: 130,
          align: 'center',
          render: (h, { row }) => {
            let [str, color, bgColor] = ['', '', ''];
            if ([99].includes(row.billStatus)) {
              str = '账单作废';
              color = '#ed4014';
              bgColor = 'rgba(237, 64, 20, .1)';
            }
            if ([999].includes(row.billStatus)) {
              str = '手动完成';
              color = '#ff9900';
              bgColor = 'rgba(255, 153, 0, .1)';
            }
            return h("div", {
              style: {
                textAlign: 'left'
              }
            }, [
              h('div', row.supplierName),
              h('div', {
                style: {
                  display: str ? 'inline-block' : 'none',
                  color: color,
                  backgroundColor: bgColor,
                  padding: '2px 4px',
                }
              }, str),
            ]);
          },
        },
        {
          title: "结算方式",
          key: "settlementType",
          width: 90,
          align: 'center',
        },
        {
          title: "记账月份",
          key: "billMonth",
          width: 80,
          align: 'center',
          sortable: 'custom',
          
        },
        {
          title: "运费抵扣金额",
          key: "freightTotalPrice",
          width: 90,
          align: 'center',
        },
        {
          title: "出库抵扣金额",
          key: "outboundTotalPrice",
          width: 90,
          align: 'center',
        },
        {
          title: "罚款抵扣金额",
          key: "fineTotalPrice",
          width: 90,
          align: 'center',
        },
        {
          title: "其它抵扣金额",
          key: "otherTotalPrice",
          width: 90,
          align: 'center',
        },
        {
          title: "账单状态",
          key: "billStatus",
          width: 80,
          align: 'center',
          render: (h, { row }) => {
            let billOptionList = _this.billOptionList;
            let item = billOptionList[row.billStatus] || {};
            return h("div", item.label || '');
          },
        },
        {
          title: "汇总状态",
          width: 80,
          key: "deductionStatus",
          align: 'center',
          render: (h, { row }) => {
            let deductionList = _this.deductionList;
            let item = deductionList[row.deductionStatus] || {};
            return h("div", item.label || '');
          },
        },
        {
          title: "备注说明",
          minWidth: 110,
          key: "remark",
          tooltip: true,
          align: 'center',
        },
        {
          title: "创建信息",
          width: 140,
          align: 'center',
          render: (h, { row }) => {
            return h("div", [
              h('div', _this.createUserArr[row.createdBy] ? _this.createUserArr[row.createdBy].userName : ''),
              h('div', row.createdTime),
            ]);
          },
        },
        {
          title: "操作",
          width: 100,
          align: 'center',
          render: (h, { row, index }) => {
            let getPower = this.getPermission('supplierBillApply_deduction_get');
            let updatePower = this.getPermission('supplierBillApply_deduction_update');
            let deletePower = this.getPermission('supplierBillApply_deduction_delete');
            let list = [];
            if (getPower) {
              list.push(h('div', {
                class: 'clickText',
                on: {
                  click() {
                    _this.billDeduction('detail', row);
                  }
                }
              }, '详情'))
            }
            // 账单状态，0无账单,1待提交,2待审核,3待复核,4待付款,5已完成，99：账单作废，999：手动完成
            if (updatePower && [0, 99].includes(row.billStatus) && row.updateFlag) {
              list.push(h('div', {
                class: 'clickText',
                on: {
                  click() {
                    _this.billDeduction('edit', row);
                  }
                }
              }, '编辑'))
            }
            // 无账单下“运费抵扣金额、出库抵扣金额”为0才可删除
            let costGeneration = (row.freightTotalPrice || 0) > 0 || (row.outboundTotalPrice || 0) > 0;
            if (deletePower && [0, 99].includes(row.billStatus) && !costGeneration  && row.deleteFlag) {
              list.push(h('div', {
                class: 'clickText errorText',
                on: {
                  click() {
                    _this.billDelete(row);
                  }
                }
              }, '删除'))
            }
            return h("div", list);
          },
        },
      ],
      billOptionList: billOptionList,
      deductionList: deductionList,
      createTime: [],
      selectionArr: [],
      exportLoading: false,

      tableItemTotal: 0, // 分页总条数
      searchParams: {},
      pageArray: [10, 20, 50, 100],
      // totalData: {}, // 详情信息
      loading: false,
      typeList: {
        0: { label: "正在装箱" },
        1: { label: "已装箱" },
      },
      formData: {},
      deductionInfo: {
        visible: false,
        type: null,
        data: {},
      },
      createUserArr: {},
    };
  },
  watch: {
    modelVisible: {
      handler(val) {
        val && this.open();
      },
      deep: true,
    },
    isVisible: {
      handler(val) {
        !val && this.$emit("update:modelVisible", val);
      },
      deep: true,
    },
  },
  computed: {
    // 获取当前登录账号可查看的事业部ID列表 
    allowBusinessDeptIds() {
      return this.$store.getters["allowBusinessDeptIds"].join(",");
    },
  },
  created() {
    this.getUserList();
  },
  methods: {
    reset() {
      this.tableList = [];
      this.tableItemTotal = 0;
      this.searchParams = this.$common.copy(searchParams);
      this.$nextTick(() => {
        this.$refs.searchParams.resetFields();
      })
    },
    // 窗口打开
    open() {
      this.isVisible = true;
      this.reset();
      this.getList();
    },
    searchHandle(deleteList = []) {
      let searchParams = this.$common.removeEmpty(this.searchParams);
      searchParams.businessDeptId = this.allowBusinessDeptIds;
      // 要删除的字段
      deleteList.forEach(k => {
        delete searchParams[k];
      })
      return searchParams;
    },
    // 数据请求
    getList() {
      this.loading = true;
      this.axios.post(api.deduction_list, this.searchHandle())
        .then(({ data }) => {
          if (!(data && data.code === 0)) return;
          let totalData = data.datas || {};
          this.tableItemTotal = totalData.total || 0;
          this.tableList = totalData.list || [];
          this.$refs.tables.selectAll(false);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 查询
    search() {
      this.searchParams.pageNum = 1;
      this.getList();
    },
    pageNumChange(page) {
      this.searchParams.pageNum = page;
      this.getList();
    },
    pageSizeChange(size) {
      this.searchParams.pageSize = size;
      this.search();
    },
    getSelectValue(selection) {
      this.selectionArr = selection;
    },
    // 导出
    exportExcel(e) {
      let [temp, str] = [{}, '所有'];
      if (e == 1) {
        if (this.selectionArr.length === 0) {
          this.$Message.error("请选择要导出的数据!");
          return;
        }
        const billApplyDeductionIds = this.selectionArr.map(
          (item) => item.billApplyDeductionId
        );
        temp = { billApplyDeductionIds: billApplyDeductionIds };
        str = '选中';
      } else {
        temp = this.searchHandle(['pageNum', 'pageSize'])
      }
      this.$Modal.confirm({
        title: '提示',
        content: `<p>确认导出${str}账单付款抵扣？</p>`,
        loading: true,
        onOk: () => {
          this.axios.post(api.deduction_exportList, temp)
            .then(({ data }) => {
              if (!(data && data.code === 0)) return;
              this.$Message.success("操作成功");
              this.$refs.tables.selectAll(false);
            })
            .finally(() => {
              this.$Modal.remove();
            });
        }
      });
    },
    billDeduction(type, row) {
      this.deductionInfo.data = row || {};
      this.deductionInfo.type = type;
      this.deductionInfo.visible = true;
    },
    // 创建时间
    getDateValue(e) {
      let list = Array.isArray(e) ? e : [];
      this.searchParams.createdStartTime = list[0] || '';
      this.searchParams.createdEndTime = list[1] || '';
      this.createTime = e;
    },
    billMothChange(e) {
      this.searchParams.billMonth = e;
    },
    billDelete({ billApplyDeductionId }) {
      this.$Modal.confirm({
        title: '提示',
        content: '<p>确认删除该账单付款抵扣？</p>',
        loading: true,
        onOk: () => {
          this.axios.post(`${api.deduction_delete}?billApplyDeductionId=${billApplyDeductionId}`)
            .then(({ data }) => {
              if (!(data && data.code === 0)) return;
              this.$Message.success("操作成功");
              this.getList();
            })
            .finally(() => {
              this.$Modal.remove();
            });
        }
      });
    },
    // 获取创建人数组
    getUserList() {
      this.axios.get(api.userInfo_getAllUser).then(({ data }) => {
        if (!(data && data.code === 0)) return;
        this.createUserArr = data.datas || {};
      });
    },
    changeSort({ column, key, order }) {
      console.log(column, key, order);
      if(key == 'billMonth') {
        this.searchParams.upDown = order == 'desc' ? 'down' : order == 'asc' ? 'up' : ''
        this.getList()
      }
    }
  },
};
</script>
<style lang="less">
.deductionManagePage {
  .deSearchStyle {
    .ivu-form-item {
      .ivu-form-item-content {
        width: 160px;
      }
    }

    .autoLong.ivu-form-item {
      .ivu-form-item-content {
        width: auto;
      }
    }
  }

  .clickText {
    display: inline-block;
    color: #6290FF;
    cursor: pointer;

    &:not(:last-child) {
      margin-right: 4px;
    }
  }

  .errorText {
    color: #ed4014;
  }
}
</style>