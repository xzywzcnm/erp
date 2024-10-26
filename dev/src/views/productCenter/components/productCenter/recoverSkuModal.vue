<template>
  <Modal
    title="SKU 恢复"
    class="recover-sku-modal"
    v-model="modalVisible"
    width="90%"
  >
    <div class="filter-content">
      <Form ref="modalForm" :model="fromData" :rules="fromRule" :label-width="80">
        <div class="operation">
          <Button type="primary" @click="searchData(true)" :disabled="loading" icon="md-search">查询</Button>

          <Buttons
            type="primary"
            style="margin-left: 15px"
            trigger="click"
            @on-click="recoverSkuTips"
            v-if="permission.restoreSpuSku"
            :disabled="recoverLoading"
          >
            <Button type="primary" @click="recoverSkuTips('checkSku')" :disabled="recoverLoading">
              恢复选中SKU
            </Button>
            <Buttons-menu slot="list">
              <Buttons-item name="allSku" :disabled="recoverLoading">恢复所有SKU(结果集)</Buttons-item>
            </Buttons-menu>
          </Buttons>
        </div>
        <div class="form-items">
          <Form-item label="SPU/SKU" class="form-filter-item" prop="spuOrSkuList">
            <dyt-input-tag type="textarea" :limit="1" placeholder="请输入SPU/SKU(多个用逗号或回车分隔)" v-model="fromData.spuOrSkuList" />
          </Form-item>
          <Form-item label="删除时间" class="form-filter-item" prop="deleteTime">
            <DatePicker
              transfer
              style="width: 100%"
              v-model="fromData.deleteTime"
              placeholder="选择日期"
              type="datetimerange"
              format="yyyy-MM-dd HH:mm:ss"
              placement="bottom-end"
              :options="datePickerOptions"
              :split-panels="true"
            />
          </Form-item>
        </div>
      </Form>
    </div>
    <div class="content-main">
      <Table
        highlight-row
        :loading="loading"
        border
        :height="tableHeight"
        :columns="tableColumns"
        :data="tableData"
        @on-selection-change="getSelectValueSpu"
      />
      <div class="table-footer">
        <!-- show-total -->
        <div class="table-page-before">
          共{{ pageConfig.total }}条，已选中<span class="selected-sum">{{ selectedData.length }}</span>条
        </div>
        <Page
          class="table-page"
          :total="pageConfig.total"
          @on-change="changePageNum"
          :page-size="pageConfig.pageSize"
          show-elevator
          :current="pageConfig.pageNum"
          show-sizer
          @on-page-size-change="changePageSize"
          placement="top"
          :page-size-opts="pageArray"
        />
      </div>
      <!-- <Spin v-if="loading" fix></Spin> -->
    </div>
    <!-- 按钮需要给空的， modal 默认有按钮 -->
    <div slot="footer"></div>
  </Modal>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  name: 'batchRemarkModal',
  mixins: [Mixin],
  components: {},
  props: {
    moduleVisible: { type: Boolean, default: false }
  },
  data () {
    return {
      tableHeight: '500',
      // 是否展示模块
      modalVisible: false,
      // 是否加载中
      loading: false,
      recoverLoading: false,
      isRefreshParent: false,
      datePickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            value: () => {
              return this.$common.getRangeTime(null, -7, 'day');
            }
          },
          {
            text: '最近两周',
            value: () => {
              return this.$common.getRangeTime(null, -14, 'day');
            }
          },
          {
            text: '最近一个月',
            value: () => {
              return this.$common.getRangeTime(null, -1, 'month');
            }
          }
        ],
        // 禁止选择未来时间
        disabledDate: (date) => {
          // this.$common.dayjs(new Date(date))
          return new Date(date) > new Date();
          // return date && date.valueOf() > Date.now() - 86400000;
        }
      },
      // 表单数据
      fromData: {
        spuOrSkuList: [],
        productGoodsIdList: [],
        deleteTime: [],
        deleteTimeStart: null,
        deleteTimeEnd: null
      },
      // 表单验证
      fromRule: {
        deleteTime: [
          { validator: this.validateDeleteTime, trigger: 'blur' },
          { validator: this.validateDeleteTime, trigger: 'change' }
        ]
      },
      // 存储旧的表单
      oldFromData: {},
      // 选中值
      selectedData: [],
      tableData: [],
      tableColumns: [
        {
          type: 'selection',
          width: 60,
          key: 'selection',
          align: 'center'
        },
        {
          title: 'SPU',
          key: 'spu',
          align: 'center',
          minWidth: 70,
          tooltip: true
        },
        {
          title: 'SKU',
          key: 'sku',
          align: 'center',
          minWidth: 70,
          tooltip: true
        },
        {
          title: '商品中文名称',
          key: 'cnName',
          align: 'center',
          minWidth: 100,
          tooltip: true
        },
        {
          title: '图片',
          key: 'productPic',
          align: 'center',
          Width: 90,
          render: (h, params) => {
            return this.tableImg(h, params, 'null', params.row.path);
          }
        },
        {
          title: '多属性',
          key: 'productGoodsSpecificationVOList',
          align: 'center',
          minWidth: 70,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.productGoodsSpecificationVOList)) return h('div', '');
            const rowItem = (row.productGoodsSpecificationVOList || []).map(item => {
              if (this.$common.isEmpty(item.name) && this.$common.isEmpty(item.value)) return h('span', '');
              return h('div', `${item.name || ''}：${item.value || ''}`);
            })
            return h('div', {
              style: {
                'text-align': 'left',
                'padding': '5px 0'
              }
            }, rowItem);
          }
        },
        {
          title: '开发员',
          key: 'productDeveloperUserId',
          align: 'center',
          width: 120,
          tooltip: true,
          render: (h, { row }) => {
            const userInfoMap = this.$store.state.userInfoList;
            if (userInfoMap && userInfoMap[row.productDeveloperUserId]) {
              return h('span', userInfoMap[row.productDeveloperUserId].userName || '');
            }
          }
        },
        {
          title: '创建/删除信息',
          key: 'createdBy',
          align: 'center',
          width: 190,
          render: (h, { row }) => {
            const userInfoMap = this.$store.state.userInfoList;
            const createdName = userInfoMap && userInfoMap[row.createdBy] ? userInfoMap[row.createdBy].userName || '' : '';
            return h('div', {
              style: {
                'text-align': 'left',
                'padding': '5px 0'
              }
            }, [
              h('div', `创建人：${createdName}`),
              h('div', `创建时间：${row.createdTime || ''}`),
              h('div', `删除时间：${row.deleteTime || ''}`)
            ]);
          }
        },
      ],
      pageConfig: {
        total: 0,
        pageSize: 20,
        pageNum: 1
      },
    }
  },
  watch: {
    moduleVisible: {
      deep: true,
      immediate: true,
      handler (val) {
        this.modalVisible = val;
        this.$nextTick(() => {
          val && this.initData();
        })
      }
    },
    modalVisible: {
      deep: true,
      handler (val) {
        this.$emit('update:moduleVisible', val);
        this.$nextTick(() => {
          !val && this.closeModal();
        })
      }
    }
  },
  computed: {
    permission () {
      return {
        restoreSpuSku: this.getPermission('productGoods_restoreSpuSku')
      }
    },
    // 可查看事业部
    businessDeptIds () {
      if (!this.$store.getters['authUserInfo'] || !this.$store.getters['authUserInfo'].securityUser) return '';
      return this.$store.getters['authUserInfo'].securityUser.businessDeptIds;
    },
    // 所属事业部
    businessDeptId () {
      if (!this.$store.getters['authUserInfo'] || !this.$store.getters['authUserInfo'].securityUser) return '';
      return this.$store.getters['authUserInfo'].securityUser.businessDeptId;
    },
  },
  created () {},
  mounted () {},
  methods: {
    // 初始化数据
    initData () {
      this.oldFromData = this.$common.copy(this.fromData);
    },
    // 查询数据
    searchData (type) {
      if (type) {
        this.pageConfig.pageNum = 1;
      }
      this.getFormData().then(params => {
        if (this.$common.isBoolean(params)) {
          return this.$Message.error('删除时间范围不可以大于一个月');
        }
        delete params.productGoodsIdList;
        this.selectedData = [];
        this.loading = true;
        this.axios.post(`${api.postQueryDeleteSkuPage}?pageNum=${this.pageConfig.pageNum}&pageSize=${this.pageConfig.pageSize}`, params).then((res) => {
          if (res.data && res.data.code === 0 && res.data.datas) {
            this.pageConfig.total = res.data.datas.total || 0;
            this.tableData = res.data.datas.list || [];
          } else {
            this.pageConfig.total = 0;
            this.tableData = [];
          }
        }).finally(() => {
          this.loading = false;
        })
      })
    },
    // 选中值
    getSelectValueSpu (value) {
      this.selectedData = value;
    },
    // 返回搜索栏的值
    getFormData () {
      return new Promise((resolve) => {
        this.$refs.modalForm.validate((valid) => {
          if (!valid) return resolve(false);
          let params = this.$common.copy(this.fromData);
          params.productGoodsIdList = this.selectedData.map(row => row.productGoodsId);
          params.businessDeptIds = this.businessDeptIds;
          params.businessDeptId = this.businessDeptId;
          if (!this.$common.isEmpty(params.deleteTime) && !this.$common.isEmpty(params.deleteTime[0])) {
            params.deleteTimeStart = this.$common.toLocaleDate(params.deleteTime[0], 'fulltime', 0);
            params.deleteTimeEnd = this.$common.toLocaleDate(params.deleteTime[1], 'fulltime', 0);
          } else {
            params.deleteTimeStart = null;
            params.deleteTimeEnd = null;
          }
          delete params.deleteTime;
          resolve(params);
        })
      })
    },
    // 页面条数设置改变
    changePageSize (pageSize) {
      this.pageConfig.pageSize = pageSize;
      this.$nextTick(() => {
        this.searchData(true);
      })
    },
    // 页码改变
    changePageNum (page) {
      this.pageConfig.pageNum = page;
      this.$nextTick(() => {
        this.searchData();
      })
    },
    // 批量恢复SKU 确认弹窗
    recoverSkuTips (name) {
      if (this.recoverLoading) return;
      if (name !== 'checkSku') {
        this.getFormData().then(params => {
          if (this.$common.isBoolean(params)) {
            return this.$Message.error('删除时间范围不可以大于一个月');
          }
          delete params.productGoodsIdList;
          this.postQueryDeleteSpuSkuNumber(params);
        })
      } else {
        if (this.selectedData.length === 0) {
          this.$Message.error('请选择需要还原的数据！');
          return;
        }
        const params = {
          productGoodsIdList: this.selectedData.map(row => row.productGoodsId)
        }
        this.postQueryDeleteSpuSkuNumber(params);
      }
    },
    // 查询删除的 sku 和 SPU 数量
    postQueryDeleteSpuSkuNumber (params) {
      this.recoverLoading = true;
      this.axios.post(api.postQueryDeleteSpuSkuNumber, params).then((res) => {
        if (res && res.data && res.data.code === 0 && res.data.datas) {
          if (!res.data.datas.delSpuNumber && !res.data.datas.delSkuNumber) {
            this.recoverLoading = false;
            this.$Message.error('当前条件无还原的数据！');
            return;
          }
          this.$Modal.confirm({
            title: '操作提示',
            content: `
                <div>恢复的SPU数：<span style="color: #f20;">${res.data.datas.delSpuNumber || 0}</span>个</div>
                <div>恢复的SKU数：<span style="color: #f20;">${res.data.datas.delSkuNumber || 0}</span>个</div>
              `,
            width: '500px',
            onOk: () => {
              this.recoverSkuHand(params);
            },
            onCancel: () => {
              this.recoverLoading = false;
            }
          })
        } else {
          this.recoverLoading = false;
        }
      }).catch(() => {
        this.recoverLoading = false;
      })
    },
    // 批量恢复SKU处理
    recoverSkuHand (params) {
      this.axios.post(api.psotRestoreSpuSku, params).then((res) => {
        if (!res || !res.data || res.data.code !== 0) return;
        this.$Message.success("操作成功");
        this.recoverLoading = false;
        this.searchData(); // 刷新当前列表数据
        this.isRefreshParent = true;
      }).finally(() => {
        this.recoverLoading = false;
      })
    },
    // 关闭弹窗时，重置数据
    closeModal () {
      this.fromData = this.$common.copy(this.oldFromData);
      if (this.isRefreshParent) {
        this.$emit('updateList');
        this.isRefreshParent = false;
      }
      this.$nextTick(() => {
        this.selectedData = [];
        this.tableData = [];
        this.$refs.modalForm.resetFields();
      })
    },
    // 验证删除时间
    validateDeleteTime (rule, value, callback) {
      if (this.$common.isEmpty(value) || this.$common.isEmpty(value[0]) || this.$common.isEmpty(value[1])) {
        return callback();
      }
      const subtractTime = this.$common.dayjs(value[1]).subtract(1, 'month').format('YYYY-MM-DD HH:mm:ss');
      const startTime = this.$common.dayjs(value[0]).format('YYYY-MM-DD HH:mm:ss');
      if (new Date(subtractTime) > new Date(startTime)) {
        return callback(new Error('删除时间范围不可以大于一个月'));
      }
      callback();
    }
  }
};
</script>
<style lang="less" scoped>
.recover-sku-modal{
  position: relative;
  :deep(.ivu-modal){
    max-width: 1600px;
    min-width: 1000px;
    .ivu-modal-footer{
      padding: 0;
    }
  }
  .operation{
    position: relative;
    display: flex;
    float: right;
    margin: 0;
    padding-left: 17px;
    margin-bottom: 11px;
    z-index: 10;
  }
  .form-items{
    position: relative;
    z-index: 9;
    .ivu-form-item{
      position: relative;
      display: inline-block;
      margin: 0 10px 16px 0;
      width: 25%;
      max-width: 500px;
      min-width: 360px;
      vertical-align: top;
      :deep(.ivu-form-item-error-tip){
        padding-top: 2px;
        font-size: 12px;
      }
    }
  }
  .table-footer{
    padding-top: 15px;
    text-align: right;
    .table-page-before{
      display: inline-block;
      padding-right: 10px;
      vertical-align: middle;
      .selected-sum{
        color: #f20;
      }
    }
    .table-page{
      display: inline-block;
      margin: 0;
      vertical-align: middle;
    }
  }
}
</style>
