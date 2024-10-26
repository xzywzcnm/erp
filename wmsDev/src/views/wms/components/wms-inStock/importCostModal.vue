<template>
  <Modal v-model="modalVisible" title="已导入运费数据" width="1280px" max-height="800nppx">
    <Form ref="modalForm" :model="modalForm" :label-width="80" label-position="right">
      <Row>
        <Col :span="7">
        <FormItem label="导入时间" prop="importTime">
          <DatePicker transfer type="datetimerange" placement="bottom-end" placeholder="选择日期" style="width: 280px"
            split-panels v-model="importTime" @on-clear="resetDate('create')" format="yyyy-MM-dd HH:mm:ss"
            :options="dateOptions" @on-change="(e) => {
              getDateValue(e, 'create');
            }
              " />
        </FormItem>
        </Col>
        <Col :span="7">
        <FormItem label="匹配状态:" prop="status">
          <dyt-select v-model="modalForm.status" clearable placeholder="请选择">
            <Option :value="'0'">未匹配
            </Option>
            <Option :value="'1'">已匹配
            </Option>
          </dyt-select>
        </FormItem>
        </Col>
        <Col :span="7">
        <FormItem label="导入人:" prop="createdByList">
          <dyt-select v-model="modalForm.createdByList" multiple clearable filterable :max-tag-count="1">
            <Option v-for="(item, index) in purchaserList" :value="item.userId" :key="index">{{ item.name }}
            </Option>
          </dyt-select>
        </FormItem>
        </Col>
        <Col :span="3">
        <div class="ml20">
          <Button class="mr10" type="primary" @click="search">查询</Button>
          <Button type="primary" @click="exportData">导出</Button>
        </div>
        </Col>
        <Col :span="7">
          <FormItem label="物流单号" prop="logisticsNoList">
            <dyt-input-tag
              :limit="1"
              type="textarea"
              v-model="modalForm.logisticsNoList"
              placeholder="多个请用逗号或回车分隔"
            />
          </FormItem>
        </Col>
      </Row>

    </Form>
    <Table ref="importTable" highlight-row :border="true" :height="tableHeight" :columns="tableColumn" :data="tableData">
    </Table>
    <div class="table-page clear">
      <div class="table-page-right">
        <Page :total="total" @on-change="changePageNum" show-total :page-size="modalForm.pageSize" show-elevator
          :current="modalForm.pageNum" show-sizer @on-page-size-change="changePageSiz" placement="top"
          :page-size-opts="pageArray"></Page>
      </div>
    </div>
    <div slot="footer" style="">
      <Button @click="modalVisible = false">关闭</Button>
    </div>
    <Spin fix v-if="loading"></Spin>
  </Modal>
</template>
<script>
import Mixin from "@/components/mixin/common_mixin";
import api from "@/api/api";
export default {
  mixins: [Mixin],
  props: {
    moduleVisible: { type: Boolean, default: false },
    purchaserList: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      modalForm: {
        createStartTime: null,
        createEndTime: null,
        createdByList: [],
        logisticsNoList: [],
        status: null,
        pageSize: 20,
        pageNum: 1
      },
      modalVisible: false,
      importTime: [],
      loading: false,
      // tableHeight: this.getTableHeight(500),
      tableData: [],
      tableColumn: [
        {
          key: 'logisticsNo',
          title: '物流单号',
          align: 'center',
          width: 200,
        },
        {
          key: 'freightAmount',
          title: '运费金额',
          align: 'center',
          width: 160,
        }, {
          key: 'freightRemark',
          title: '处理备注',
          align: 'center',
          render: (h, params) => {
            return h(
              "Tooltip",
              {
                props: {
                  content: params.row.freightRemark,
                  maxWidth: "300px",
                },
                style: {},
              },
              [
                h(
                  "div",
                  {
                    style: {
                      width: "260px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    },
                  },
                  params.row.freightRemark
                ),
              ]
            );
          },
        },
        {
          key: 'createdTime',
          title: '导入时间',
          align: 'center',
          width: 260,
        },
        {
          key: 'createdBy',
          title: '导入人',
          align: 'center',
          width: 160,
          render: (h, params) => {
            let createdName = ''
            this.purchaserList.forEach(item => {
              if (item.userId === params.row.createdBy) {
                createdName = item.name
              }
            })
            return h('div', {}, createdName)
          }
        },
        {
          key: 'status',
          title: '匹配状态',
          align: 'center',
          width: 160,
          render: (h, params) => {
            let statusMap = {
              "0": {
                label: '未匹配', color: 'red'
              },
              "1": {
                label: '已匹配', color: 'black'
              }
            }
            return h('div', {
              style: {
                color: statusMap[params.row.status].color
              }
            }, statusMap[params.row.status].label)
          }
        },
      ],
      total: 0
    }
  },
  watch: {
    moduleVisible: {
      deep: true,
      immediate: true,
      handler(val) {
        this.modalVisible = val;
        if (!val) {
          this.importTime = []
          this.modalForm = {
            createStartTime: null,
            createEndTime: null,
            createdByList: [],
            logisticsNoList: [],
            status: null,
            pageSize: 20,
            pageNum: 1
          }
          this.tableData = []
          this.total = 0
        }
      }
    },
    modalVisible: {
      deep: true,
      handler(val) {
        this.$emit('update:moduleVisible', val);
      }
    },
  },
  computed: {
    tableHeight() {
      return this.getTableHeight(500)
    }
  },
  methods: {
    resetDate() {
      this.modalForm.importTime = []
      this.modalForm.createStartTime = null
      this.modalForm.createEndTime = null
    },
    getDateValue(val, type) {
      if (!this.$common.isEmpty(val)) {
        this.modalForm.createStartTime = val[0]
        this.modalForm.createEndTime = val[1]
      }
    },
    search() {
      this.loading = true
      let obj = this.$common.copy(this.modalForm)
      this.axios.post(api.query_freightCheckImport, obj).then(res => {
        if (res.data.code === 0) {
          this.tableData = this.$common.isEmpty(res.data.datas.list) ? [] : res.data.datas.list
          this.total = res.data.datas.total
        }
      }).finally(() => {
        this.loading = false
      })
    },
    changePageSiz(val) {
      this.modalForm.pageSize = val
      this.$set(this.modalForm, 'pageNum', 1)
      this.search()
    },
    changePageNum(val) {
      this.$set(this.modalForm, 'pageNum', val)
      this.search()
    },
    exportData() {
      this.loading = true
      let obj = this.$common.copy(this.modalForm)
      obj.warehouseId = this.getWarehouseId()
      this.axios.post(api.export_freightCheckImport, obj).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('导出成功')
        }
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>
<style lang="less"></style>