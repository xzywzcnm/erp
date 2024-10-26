<template>
  <div class="productProcessing">
    <div class="listPage" v-show="workShow === 'list'">
      <div class="searchMain">
        <Form ref="formItem" :model="formItem" :label-width="80">
          <dyt-filter ref="dyt-filter" @expand="expand">
            <FormItem label="状态：" prop="status" class="notplatformParamsSelect">
              <dyt-select v-model="formItem.status">
                <Option v-for="d in statusList" :value="d.value" :key="d.value" :label="d.txt"></Option>
              </dyt-select>
            </FormItem>
            <FormItem label="加工单号：" prop="moveNum">
              <dyt-input v-model.trim="formItem.moveNum" placeholder="输入加工单号"> </dyt-input>
            </FormItem>
            <div slot="operation">
              <Button type="primary" @click="searchData" :disabled="SearchDisabled" icon="md-search">查询</Button>
              <Button style="margin-left: 10px;" @click="reset" v-once icon="md-refresh">重置 </Button>
            </div>
          </dyt-filter>
        </Form>
      </div>

      <div class="funMain">
        <div class="funMain__flex">
          <div>
            <div class="fl mr10">
              <Button type="primary" icon="md-add" @click="newProcessList"
                :disabled="!getPermission('wmsWorking_create')">新建加工单 </Button>
            </div>
            <div class="fl clear">
              <Dropdown @on-click="exportAllOrSlt" class="mr10 fl">
                <Button type="primary"><span class="icon iconfont" style="font-size: 12px">&#xe639;</span> 导出
                  <Icon type="md-arrow-dropdown"></Icon>
                </Button>
                <DropdownMenu slot="list">
                  <DropdownItem name="0" v-if="getPermission('wmsWorking_export_batch')">导出选中数据
                  </DropdownItem>
                  <DropdownItem name="1" v-if="getPermission('wmsWorking_export_all')">导出所有结果集
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <Button type="primary" class="fl" @click="openInportModal" icon="md-archive"
                :disabled="!getPermission('wmsWorking_import')">导入 </Button>
            </div>
          </div>
          <div>
            <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch">
            </dyt-sortBySelect>
          </div>
        </div>
      </div>

      <div class="tableMain">
        <div class="tableBox">
          <!--表格-->
          <Table border highlight-row :height="tableHeight" ref="selection" :columns="columns" :loading="TableLoading"
            :data="data" @on-selection-change="tableChange"></Table>
        </div>
      </div>

      <!--分页-->
      <div class="pagesMain">
        <Page :total="tableItemTotal" :current="formItem.pageNum" :page-size="formItem.pageSize" show-total show-sizer
          show-elevator @on-change="pageNumChange" @on-page-size-change="pageSizeChange" :page-size-opts="pageArray">
        </Page>
      </div>
    </div>

    <div v-if="workShow === 'detail'">
      <productProcessDtl :apiParams="apiParams" :type="addOrSee" @createSuccess="createSuccess"></productProcessDtl>
    </div>
    <div v-if="startProcess">
      <startProcessDtl :apiParams="apiParams" :proceessHasBeenDone="proceessHasBeenDone"></startProcessDtl>
    </div>
    <!--导入前的模态框  -->
    <Modal v-model="switchInportModal" :styles="{ top: '80px', width: '520px' }" class="headerBar" title="导入">
      <inportBeforeDownload @insertSuccess="switchInportModal = false" :importUrl="importUrl" :headObj="headObj"
        :wareId="wareId" templateTypes="7"></inportBeforeDownload>
      <div slot="footer">
        <Button @click="cancelInport">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import compoundBtn from '@/views/wms/components/common/compoundBtn';
import productProcessDtl from './productProcessingDtl';
import startProcessDtl from './startProcessDtl';
import inportBeforeDownload from '../wms-inWareManage/inportBeforeDownload';
import api from '@/api/api';
import common from '@/components/mixin/common_mixin';
// import { getToken } from '@/utils/cookie';
import tableHeight_mixin from '@/components/mixin/tableHeight_mixin';

export default {
  mixins: [common, tableHeight_mixin],
  components: {
    compoundBtn,
    productProcessDtl,
    startProcessDtl,
    inportBeforeDownload
  },
  created() {
    this.getListData();
  },
  data() {
    var v = this;
    return {
      switchInportModal: false,
      wareId: this.getWarehouseId(),
      proceessHasBeenDone: '',
      startProcess: false,
      apiParams: '',
      workShow: 'list',
      addOrSee: '',
      tableItemTotal: 0,
      wareList: [],
      loading: false,
      formItem: {
        ware: '',
        status: '',
        moveNum: '',
        pageNum: 1,
        pageSize: 10,
        cacheClickVal: 'CT',
        orderSeq: 'DESC',
      },
      statusList: [
        {
          txt: '创建状态',
          check: false,
          value: '0'
        }, {
          txt: '已完成',
          check: false,
          value: '3'
        }
      ],
      sortButtonList: [
        {
          sortHeader: "按添加时间",
          sortField: "CT",
          sortType: "DESC",
          default: true,
        },
        {
          sortHeader: "按状态",
          sortField: "AS",
          sortType: "DESC",
        },
      ],
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: '加工作业单号',
          key: 'workingNo',
          align: 'center',
          render: (h, params) => {
            if (v.getPermission('wmsWorking_detail')) {
              return h('a', {
                on: {
                  click: () => {
                    v.startProcess = true;
                    v.workShow = '';
                    v.apiParams = params.row.workingId;
                    v.proceessHasBeenDone = params.row.workingStatus;
                  }
                },
                style: {
                  display: 'inline-block',
                  width: '100%',
                  height: '100%'
                }
              }, params.row.workingNo);
            } else {
              return h('div', params.row.workingNo);
            }
          }
        }, {
          title: '状态',
          key: 'workingStatus',
          align: 'center',
          render: (h, params) => {
            return h('div', {}, params.row.workingStatus === '0' ? '创建状态' : params.row.workingStatus === '1'
              ? '部分分配'
              : params.row.workingStatus === '2'
                ? '分配完成'
                : params.row.workingStatus === '3'
                  ? '加工完成'
                  : params.row.workingStatus === '4'
                    ? '取消分配'
                    : '');
          }
        }, {
          title: '加工商品',
          key: 'finishedProductGoodsSku',
          align: 'center'
        }, {
          title: '数量',
          key: 'workingNumber',
          align: 'center'
        }, {
          title: '创建人',
          key: 'createdUserName',
          align: 'center'
        }, {
          title: '创建时间',
          key: 'createdTime',
          align: 'center'
        }, {
          title: '操作',
          key: 'op',
          width: 220,
          fixed: 'right',
          align: 'center',
          render: (h, params) => {
            return h(compoundBtn, {
              props: {
                dropList: [
                  {
                    label: '编辑',
                    value: 'edit',
                    flagCode: ['0'],
                    status: v.getPermission('wmsWorking_create') ? params.row.workingStatus : -1
                  }, {
                    label: '取消分配',
                    value: 'cancel',
                    flagCode: ['1'],
                    status: v.getPermission('wmsWorking_cancelAllocationArea') ? params.row.workingStatus : -1
                  }, {
                    label: '完成加工',
                    value: 'ok',
                    flagCode: ['0', '1', '2'],
                    status: v.getPermission('wmsWorking_finish') ? params.row.workingStatus : -1
                  }
                ],
                styleData: { width: '80px' },
                title: params.row.workingStatus === '0' || params.row.workingStatus === '1' || params.row.workingStatus === '4'
                  ? '分配库存'
                  : params.row.workingStatus === '2' ? '取消分配' : params.row.workingStatus === '3' ? '查看详情' : '',
                listenNormal: false,
                statusShowDiffText: true,
                status: params.row.workingStatus,
                btnType: '',
                icon: 'md-share',
                disabled: params.row.workingStatus === '0' || params.row.workingStatus === '1' || params.row.workingStatus === '4'
                  ? !v.getPermission('wmsWorking_allocationArea')
                  : params.row.workingStatus === '2'
                    ? !v.getPermission('wmsWorking_cancelAllocationArea')
                    : params.row.workingStatus === '3' ? !v.getPermission('wmsWorking_detail') : ''
              },
              on: {
                click(val) {
                  if (val === '0' || val === '1' || val === '4') {
                    // 分配库存
                    v.axios.get(api.allocationArea + '?workingId=' + params.row.workingId).then(res => {
                      if (res.data.code === 0) {
                        v.$Message.success('分配成功');
                        v.getListData();
                      }
                    });
                  } else if (val === '2' || val === 'cancel') {
                    // 取消分配
                    v.axios.get(api.cancelAllocationArea + '?workingId=' + params.row.workingId).then(res => {
                      if (res.data.code === 0) {
                        v.$Message.success('操作成功');
                        v.getListData();
                      }
                    });
                  } else if (val === '3') {
                    // 查看详情
                    v.startProcess = true;
                    v.workShow = '';
                    v.apiParams = params.row.workingId;
                    v.proceessHasBeenDone = params.row.workingStatus;
                    console.log(val);
                  } else if (val === 'edit') {
                    v.workShow = 'detail';
                    v.addOrSee = 'edit';
                    v.apiParams = params.row.workingId;
                  } else if (val === 'see') {
                    console.log(val);
                  } else if (val === 'cancel') {
                    // console.log(val);
                  } else if (val === 'ok') {
                    v.startProcess = true;
                    v.workShow = '';
                    v.apiParams = params.row.workingId;
                    v.proceessHasBeenDone = params.row.workingStatus;
                  }
                }
              }
            }, []);
          }
        }
      ],
      data: [],
      tableSltData: [],
      importUrl: api.importWorking
    };
  },
  computed: {
    headObj() {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    }
  },
  //   computed: {
  //     tableHeight () {
  //       return this.getTableHeight(295);
  //     }
  //   },
  methods: {
    openInportModal() {
      this.switchInportModal = true;
    },
    okInport() {
    },
    cancelInport() {
      this.switchInportModal = false;
    },
    newProcessList() {
      this.addOrSee = 'add';
      this.workShow = 'detail';
    },
    paramsFn() {
      this.formItem.pageSize = this.getPageSizeCache();
      let obj = {
        warehouseId: this.wareId,
        workingNo: this.formItem.moveNum ? this.formItem.moveNum : null,
        workingStatus: this.formItem.status,
        pageNum: this.formItem.pageNum,
        pageSize: this.formItem.pageSize,
        orderSeq: this.formItem.orderSeq,
        cacheClickVal: this.formItem.cacheClickVal
      };
      return obj;
    },
    getListData() {
      let v = this;
      if (v.getPermission('wmsWorking_list')) {
        let obj = this.paramsFn();
        v.TableLoading = true;
        v.SearchDisabled = true;
        this.axios.post(api.productProList, obj).then(res => {
          v.TableLoading = false;
          v.SearchDisabled = false;
          if (res.data.code === 0) {
            this.data = this.processTimeData(res.data.datas.list, 'createdTime');
            this.tableItemTotal = res.data.datas.total;
          }
        });
      } else {
        v.gotoError(); // 无权限
      }
    },
    searchData() {
      this.formItem.pageNum = 1;
      this.getListData();
    }, // 导入
    beforeUp() {
    },
    uploadSuccess(res, file, fileList) {
      if (res.code === 0) {
        this.$Message.success('导入成功');
      }
    },
    uploadError() {
    },
    exportFn(obj) {
      this.axios.post(api.exportWorking, obj).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('导出成功');
        }
      });
    },
    exportAllOrSlt(name) {
      // 导出
      let obj = this.paramsFn();
      if (name === '0') {
        // 选中
        if (this.tableSltData.length === 0) {
          this.$Message.warning('请选择导出数据');
          return;
        }
        obj.workingNos = this.tableSltData.map(val => val.workingNo);
        obj.exportType = '0';
        this.exportFn(obj);
      } else {
        // 所有
        if (this.data.length === 0) {
          this.$Message.warning({
            content: '无数据导出',
            duration: 5
          });
          return;
        }
        let obj2 = {
          exportType: '1',
          warehouseId: this.wareId,
          ...obj
        };
        this.exportFn(obj2);
      }
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.formItem.orderSeq = type;
      this.formItem.cacheClickVal = feild;
      this.searchData();
    },
    searchFn() {
      this.getListData();
    },
    // statusChange (value) {
    //   this.statusList.forEach(it => {
    //     it.check = value === it.value;
    //   });
    //   this.formItem.status = value;
    // },
    pageNumChange(page) {
      this.formItem.pageNum = page;
      this.searchFn();
    },
    pageSizeChange(size) {
      this.setPageSizeCache(size);
      this.formItem.pageSize = size;
      this.searchFn();
    },
    tableChange(data) {
      this.tableSltData = data;
    },
    createSuccess() {
      this.apiParams = '';
      // this.startProcess = true;
      this.workShow = 'list';
      this.$Message.success('操作成功');
    }, // 重置按钮
    reset() {
      //   this.statusChange(null);
      this.$refs['formItem'].resetFields();
    }
  },
  watch: {
    workShow: function (val) {
      if (val === 'list') {
        this.getListData();
        this.$nextTick(() => {
          this.computedTableHeight();
        })
      }
    }
  }
};
</script>

<style lang="less" scoped>
.productProcessing {
  height: 100%;
}
</style>
