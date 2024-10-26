<template>
  <div class="twice-craft-require-page">
    <div>
      <div class="mb10">
        <Button type="primary" @click="add" v-if="isEdit">新增</Button>
      </div>
      <Form
        label-position="right"
        ref="tableRefsDome"
        :model="formTableObj"
        :label-width="80"
      >
        <Table border :columns="technoColumns" :data="formTableObj.tableData" v-if="!pageLoading" class="form-table-contain">
          <!-- 供应商 -->
          <template slot-scope="{ index }" slot="supplierId">
            <FormItem label="" :label-width="0" :prop="`tableData[${index}].supplierId`" :rules="tableValidate.supplierId">
              <dytSelect
                v-model="formTableObj.tableData[index].supplierId"
                :disabled="!isEdit"
                @on-change="supplierIdChange(formTableObj.tableData[index], index)"
                @on-open-change="supplierSelectOpen($event, index)"
              >
                <Option
                  v-for="(item, sIndex) in (formTableObj.tableData[index].supplyDataList || [])"
                  :key="`supp-${sIndex}`"
                  :value="item.supplierId"
                  :disabled="item.disabled"
                >{{ item.supplierName }}</Option>
              </dytSelect>
            </FormItem>
          </template>
          <template slot-scope="{ index }" slot="unitNetUsage">
            <FormItem
              label=""
              :prop="`tableData[${index}].unitNetUsage`"
              :label-width="0"
              :rules="tableValidate.unitNetUsage"
            >
              <Input
                v-model="formTableObj.tableData[index].unitNetUsage"
                placeholder="请输入单位净用量"
                clearable
                @input="unitNetChange($event, formTableObj.tableData[index])"
                :disabled="!isEdit"
              />
            </FormItem>
          </template>
        </Table>
        <div style="padding: 10px 10px 0 10px;text-align: right;">
          合计：{{ $common.isEmpty(amountTotal) ? '0.00' : amountTotal.toFixed(2) }}
        </div>
      </Form>
    </div>
    <Spin v-if="pageLoading" fix></Spin>
    <Modal v-model="productInfo.dialogVisible" width="800" title="新增二次工艺" :mask-closable="false" :closable="false">
      <div>
        <Form ref="productInfo" :model="productInfo.formValidate" inline :label-width="100" class="fmb16 formSearch">
          <FormItem label="二次工艺类型:" prop="secondaryProcessTypeList">
            <dyt-select v-model="productInfo.formValidate.secondaryProcessTypeList" placeholder="请选择" multiple :max-tag-count="1">
              <Option v-for="(item, index) in productInfo.techTypeList" :key="`b-${index}`" :value="item.value">
                {{ item.label }}</Option>
            </dyt-select>
          </FormItem>
          <FormItem label="二次工艺名称:" prop="secondaryProcessName">
            <dytInput v-model="productInfo.formValidate.secondaryProcessName" placeholder="请输入" />
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
import pageCommon from './pageCommon';
import { twiceCraftType } from './productData';
import md5 from 'blueimp-md5';

export default {
  name: "technologicalRequire",
  components: { pageCommon },
  props: {
    openType: { type: String, default: 'info' },
    btnoperat: { type: String, default: '' },
    modelVisible: { type: Boolean, default: false },
    // 是否禁用
    disabled: { type: Boolean, default: false },
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
      formTableObj: {
        tableData: [],
      },
      supplyJson: {},
      tableTecColumns: [
        {
          title: '二次工艺名称',
          key: 'secondaryProcessName',
          align: 'center',
          minWidth: 120,
          render: (h, { row }) => {
            if (row.isDelete == 0 || this.$common.isEmpty(row.isDelete)) return h('span', {}, row.secondaryProcessName);
            return h('div', {}, [
              h('div', {}, row.secondaryProcessName),
              h('div', {
                style: {
                  color: '#f20'
                }
              }, '(已删除)')
            ])
          }
        },
        {
          title: '二次工艺类型',
          key: 'secondaryProcessType',
          align: 'center',
          width: 120,
          render: (h, params) => {
            let item = twiceCraftType[params.row.secondaryProcessType] || {};
            return h('span', item.label || '');
          }
        },
        {
          title: '供应商名称',
          slot: 'supplierId',
          align: 'center',
          minWidth: 150,
          renderHeader: (h, params) => {
            return h('div', {
              class: 'table-col-required'
            }, '供应商名称');
          }
        },
        {
          title: '单价',
          key: 'price',
          width: 120,
          align: 'center',
          render: (h, { row }) => {
            const price = Number(row.price);
            if (this.$common.isEmpty(price)) return h('span', row.price);
            return h('span', price.toFixed(2));
          }
        },
        {
          title: '单件用量(净用量)',
          slot: 'unitNetUsage',
          align: 'center',
          minWidth: 150,
          renderHeader: (h, params) => {
            return h('div', {
              class: 'table-col-required'
            }, '单件用量(净用量)');
          }
        },
        {
          title: '金额',
          key: 'amount',
          width: 120,
          align: 'center',
          render: (h, { row }) => {
            const amount = Number(row.amount);
            if (this.$common.isEmpty(amount)) return h('span', row.amount);
            return h('span', amount.toFixed(2));
          }
        }
      ],
      productInfo: {
        dialogVisible: false,
        formValidate: { secondaryProcessTypeList: [], secondaryProcessName: '' },
        modalTableColumns: [
          {
            type: 'selection',
            width: 60,
            align: 'center'
          },
          {
            title: '二次工艺名称',
            key: 'secondaryProcessName',
            align: 'center',
            width: '120',
          },
          {
            title: '二次工艺类型',
            key: 'secondaryProcessType',
            align: 'center',
            width: '120',
            render: (h, { row }) => {
              if (this.$common.isEmpty(row.secondaryProcessType)) return h('span', '');
              const item = twiceCraftType[row.secondaryProcessType] || {};
              return h('span', item.label || '');
            }
          },
          {
            title: '首选供应商',
            key: 'supplierName',
            align: 'center',
          },
          {
            title: '单价',
            key: 'price',
            align: 'center',
          }
        ],
        modalTableData: [],
        checkedList: [],
        techTypeList: twiceCraftType,
        proPage: {
          total: 0,
          pageNum: 1,
          pageSize: 10,
        },
        tableLoading: false,
      },
      // 验证
      tableValidate: {
        supplierId: [
          { required: true, message: '请选择供应商', trigger: 'change', type: 'string' }
        ],
        unitNetUsage: [
          { required: true, validator: this.$common.validatorMaxNumber, min: 0, notIncludes: ['min'], point: 2, msg: '请输入单件用量', trigger: 'change' },
          { required: true, validator: this.$common.validatorMaxNumber, min: 0, notIncludes: ['min'], point: 2, msg: '请输入单件用量', trigger: 'blur' },
        ]
      },
    };
  },
  watch: {
    modelVisible: {
      immediate: true,
      handler (val) {
        if (!val) {
          this.resetData();
          return;
        }
        this.$nextTick(() => {
          setTimeout(() => {
            this.pageInit(this.secondaryCraftData);
          }, 300);
        })
      }
    },
    // secondaryCraftData: {
    //   immediate: true,
    //   deep: true,
    //   handler (val, oldVal) {
    //     if (!this.$common.isEmpty(val) && JSON.stringify(val) == JSON.stringify(oldVal)) return;
    //     this.$nextTick(() => {
    //       if (!this.modelVisible) return;
    //       this.pageInit(val);
    //     })
    //   }
    // },
  },
  computed: {
    // 二次工艺数据
    secondaryCraftData () {
      if (this.$common.isEmpty(this.productData)) return [];
      if (this.$common.isEmpty(this.productData.productSecondaryProcessBOS)) return [];
      return this.productData.productSecondaryProcessBOS;
    },
    // 是否可编辑
    isEdit () {
      return !this.disabled;
    },
    // 商品ID
    productId () {
      if (this.$common.isEmpty(this.productData) || this.$common.isEmpty(this.productData.productId)) return '';
      return this.productData.productId;
    },
    // 列表列设置
    technoColumns () {
      const operation = {
        title: '操作',
        key: 'index',
        width: '80',
        align: 'center',
        render: (h, { row, index }) => {
          return h('div', {
            style: {
              display: 'inline-block',
              cursor: 'pointer',
              color: '#2d8cf0',
            },
            on: {
              'click': () => {
                this.removeRow(row, index);
              }
            }
          }, '移除')
        },
      };
      return this.isEdit ? [operation, ...this.tableTecColumns] : this.tableTecColumns;
    },
    // 合计金额
    amountTotal () {
      if (this.$common.isEmpty(this.formTableObj.tableData)) return 0;
      return this.formTableObj.tableData.reduce((curr, row) => {
        return curr + (this.$common.isEmpty(Number(row.amount)) ? 0 : Number(row.amount));
      }, 0);
    }
  },
  created() {},
  methods: {
    pageInit (val) {
      this.pageLoading = true;
      this.resetData();
      let awaitRes = [
        () => {
          return this.detail(val);
        }
      ];
      this.$common.promiseAll(awaitRes).then(resArr => {
        this.pageLoading = false;
        // console.log(resArr);
      }).catch(() => {
        this.pageLoading = false;
      })
    },
    // 重置组件缓存数据
    resetData () {
      this.supplyJson = {};
    },
    // 获取工艺数据
    detail(val) {
      return new Promise((resolve) => {
        const awaitRes = val.map(row => {
          return () => {
            return this.getPlateListBySupply(row, row.secondaryProcessName);
          }
        })
        this.$common.promiseAll(awaitRes).then(resArr => {
          let findSupplyInfo = {};
          this.formTableObj.tableData = resArr.map(row => {
            findSupplyInfo = row.supplyDataList.find(item => row.supplierId == item.supplierId);
            if (this.$common.isEmpty(findSupplyInfo)) return { ...row, price: null, amount: null };
            return row;
          });
          resolve(resArr);
        }).catch(() => {
          resolve([]);
        })
      })
    },
    // 获取对应工艺下的供应商信息
    getPlateListBySupply (row, secondaryName) {
      return new Promise((resolve) => {
        const secondaryMd5 = md5(secondaryName);
        if (this.$common.isEmpty(secondaryName)) {
          return resolve({ ...row, secondaryProcessMd5: secondaryMd5, supplyDataList: [] });
        }
        if (!this.$common.isEmpty(this.supplyJson[secondaryMd5])) {
          return resolve({
            ...row,
            secondaryProcessMd5: secondaryMd5,
            supplyDataList: this.supplyJson[secondaryMd5]
          });
        }
        let list = [{
          supplierName: row.supplierName,
          supplierId: row.supplierId,
          price: row.price,
          secondaryProcessName: row.secondaryProcessName,
          secondaryProcessType: row.secondaryProcessType
        }];
        this.axios.get(api.queryPlateListByName, {
          params: {
            secondaryProcessName: secondaryName
          }
        }).then((res) => {
          if (!res || !res.data || res.data.code != 0) {
            return resolve({
              ...row,
              secondaryProcessMd5: secondaryMd5,
              supplyDataList: list
            });
          }
          const resList = res.data.datas || [];
          const finSupply = resList.filter(item => row.supplierId == item.supplierId);
          if (this.$common.isEmpty(finSupply)) {
            list = [
              {
                supplierName: row.supplierName,
                supplierId: row.supplierId,
                price: row.price,
                secondaryProcessName: row.secondaryProcessName,
                secondaryProcessType: row.secondaryProcessType
              },
              ...resList
            ];
          }
          this.$set(this.supplyJson, secondaryMd5, list);
          resolve({
            ...row,
            secondaryProcessMd5: secondaryMd5,
            supplyDataList: list
          });
        }).catch(() => {
          resolve({
            ...row,
            secondaryProcessMd5: secondaryMd5,
            supplyDataList: list
          });
        })
      })
    },
    // 返回表单值 type 为 1 时验证， 其他值不验证
    getFormData (type) {
      return new Promise((resolve) => {
        let paramsData = this.$common.copy(this.formTableObj.tableData);
        const removeKey = ['supplyDataList', 'secondaryProcessMd5', 'createdBy', 'createdTime', 'updatedBy', 'updatedTime'];
        paramsData.forEach(row => {
          row.productId = this.productId;
          row.unitNetUsage = Number(row.unitNetUsage);
          row.price = Number(row.price);
          row.amount = Number(row.amount);
          removeKey.forEach(key => {
            delete row[key];
          })
        });
        if (type == 1) {
          // if (this.$common.isEmpty(paramsData)) {
          //   this.$Message.error('“二次工艺要求”至少添加一个');
          //   return resolve({ success: false, message: '“二次工艺要求”至少添加一个' });
          // }
          const findDeleteRow = paramsData.find(fin => {
            return fin.isDelete == 1;
          });
          if (!this.$common.isEmpty(findDeleteRow)) {
            this.$Message.error('“二次工艺要求”存在已删除的工艺，请移除后再保存');
            return resolve({ success: false, message: '“二次工艺要求”存在已删除的工艺，请移除后再保存' });
          }
          this.$refs.tableRefsDome.validate((valid) => {
            if (!valid) {
              this.$Message.error('“二次工艺要求”表单验证不通过，请检查');
              return resolve({ success: false, message: '“二次工艺要求”表单验证不通过，请检查' });
            }
            resolve({ success: true, data: paramsData });
          })
          return;
        }
        resolve({ success: true, data: paramsData });
      })
    },
    // 保存当前值 type 为 1 时验证， 其他值不验证
    saveFormData (type) {
      return new Promise((resolve) => {
        this.getFormData(type).then(res => {
          if (!res.success) return resolve({ success: false, message: '表单验证不通过' });
          this.pageLoading = true;
          this.axios.post(api.savePlateTwiceCraft, res.data).then(({ code, datas }) => {
            if (code != 0) return resolve({ success: false, message: '请求失败' });
            resolve({ success: true, data: datas, isColose: type != 1 });
          }).catch(err => {
            resolve({ success: false, data: err });
          }).finally(() => {
            this.pageLoading = false;
          })
        })
      })
    },
    removeRow (row, index) {
      this.$Modal.confirm({
        title: '操作',
        content: `<p>确认移除该工艺：${row.secondaryProcessName || ''}？</p>`,
        loading: true,
        onOk: () => {
          this.$Modal.remove();
          this.formTableObj.tableData.splice(index, 1);
        }
      });
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
    // 查询工艺
    getList () {
      let temp = this.$common.copy({ ...this.productInfo.formValidate, ...this.productInfo.proPage });
      delete temp.total;
      this.productInfo.tableLoading = true;
      this.productInfo.checkedList = [];
      this.productInfo.modalTableData = [];
      this.axios.post(api.queryPlateTwiceCraftList, temp).then((res) => {
        if (!res || !res.data || res.data.code != 0) return;
        // const disabledRow = this.formTableObj.tableData.map(row => row.secondaryProcessName);
        this.productInfo.modalTableData = (res.data.datas.list || []).map((row) => {
          return {
            ...row,
            amount: null,
            // _disabled: disabledRow.includes(row.secondaryProcessName),
            secondaryProcessMd5: md5(row.secondaryProcessName)
          }
        });
        this.productInfo.proPage.total = res.data.datas.total || 0;
        this.$refs.selection.selectAll(false);
      }).finally(() => {
        this.productInfo.tableLoading = false;
      });
    },
    // 确认选中的工艺
    handleNext() {
      if (!this.productInfo.checkedList.length) {
        this.$Message.warning('请勾选要添加的工艺!');
        return;
      }
      const md5Key = this.formTableObj.tableData.map(row => {
        // return `${row.supplierId}-${row.secondaryProcessMd5}`;
        return row.secondaryProcessMd5;
      })
      const addArr = this.productInfo.checkedList.filter(row => {
        // return !md5Key.includes(`${row.supplierId}-${row.secondaryProcessMd5}`);
        return !md5Key.includes(row.secondaryProcessMd5);
      });
      const awaitRes = [...this.formTableObj.tableData, ...addArr].map(row => {
        return () => {
          return this.getPlateListBySupply(row, row.secondaryProcessName);
        }
      });
      this.$common.promiseAll(awaitRes).then(resArr => {
        let findSupplyInfo = {};
        this.formTableObj.tableData = resArr.map(row => {
          findSupplyInfo = row.supplyDataList.find(item => row.supplierId == item.supplierId);
          if (this.$common.isEmpty(findSupplyInfo)) return { ...row, price: null, amount: null };
          return row;
        });
        this.productInfo.dialogVisible = false;
      }).catch((err) => {
        console.error(err);
        this.productInfo.dialogVisible = false;
      })
    },
    // 表格-供应商改变时
    supplierIdChange (row) {
      if (this.$common.isEmpty(row) || this.$common.isEmpty(row.supplierId) || this.$common.isEmpty(row.supplyDataList)) {
        row.price = null;
        row.secondaryProcessType = '';
        row.amount = null;
        row.unitNetUsage = null;
        return;
      }
      const supplyInfo = row.supplyDataList.find(fin => fin.supplierId == row.supplierId) || {};
      row.price = this.$common.isEmpty(supplyInfo.price) ? null : supplyInfo.price;
      row.secondaryProcessType = supplyInfo.secondaryProcessType || '';
      const unitNetUsage = Number(row.unitNetUsage);
      const price = Number(row.price);
      if (this.$common.isEmpty(unitNetUsage) || unitNetUsage <= 0 || this.$common.isEmpty(price)) {
        row.amount = null;
        return;
      }
      row.amount = (unitNetUsage * price).toFixed(2);
    },
    // 单位净用量改变
    unitNetChange (val, row) {
      const price = Number(row.price);
      const unitNetUsage = Number(val);
      if (this.$common.isEmpty(unitNetUsage) || unitNetUsage <= 0 || this.$common.isEmpty(price)) {
        row.amount = null;
        return;
      }
      row.amount = (unitNetUsage * price).toFixed(2);
    },
    // 表格-供应商下拉展开时
    supplierSelectOpen (open, rowIndex) {},
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
  }
};
</script>
<style lang="less" scoped>
.twice-craft-require-page {
  position: relative;
  padding: 10px;
  .form-table-contain{
    :deep(.ivu-table-header) {
      .table-col-required{
        &:before{
          content: '*';
          display: inline-block;
          margin-right: 4px;
          line-height: 1;
          font-size: 14px;
          color: #ed4014;
        }
      }
    }
    :deep(.ivu-table-tbody){
      .ivu-form-item{
        margin-bottom: 0;
      }
      .ivu-select{
        text-align: left;
      }
    }
  }
}
</style>
