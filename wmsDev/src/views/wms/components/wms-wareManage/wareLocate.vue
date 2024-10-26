<template >
  <div>
    <div class="usersFilter">
      <div class="card-container">
        <div class="card-content">
          <!--库位状态-->
          <div class="platformParamsSelect">
            <Form :model="pageParams" :label-width="116">
              <div class="filterItem">
                <Form-item label="库位状态：">
                  <Button-group>
                    <Button v-for="item in wareLocateFlagList" :key="item.value" :type="item.checked ? 'primary' : 'default'" @click="checkWareLocateStatus(item.value)">{{ item.label }} </Button>
                  </Button-group>
                </Form-item>
              </div>
            </Form>
          </div>
          <!--库位类型-->
          <div class="platformParamsSelect">
            <Form :model="pageParams" :label-width="116">
              <div class="filterItem">
                <Form-item label="库位类型：">
                  <Button-group>
                    <Button v-for="item in wareLocateTypeFlagList" :key="item.value" :type="item.checked ? 'primary' : 'default'" @click="checkWareLocateTypeStatus(item.value)">
                      {{ item.label }} </Button>
                  </Button-group>
                </Form-item>
              </div>
            </Form>
          </div>
          <!--库位使用-->
          <div class="platformParamsSelect">
            <Form :model="pageParams" :label-width="116" style="margin-left:5px;">
              <div class="filterItem">
                <Form-item label="库位类型：">
                  <Button-group>
                    <Button v-for="item in wareLocateUseFlagList" :key="item.value" :type="item.checked ? 'primary' : 'default'" @click="checkWareLocateUseStatus(item.value)">
                      {{ item.label }} </Button>
                  </Button-group>
                </Form-item>
              </div>
            </Form>
          </div>
          <div class="platformSearch clear">
            <!--<Row>-->
            <!--<Col span="4" style="margin-left: 7px;">-->
            <!--<Form :model="pageParams" label-position="left">-->
            <!--<div class="filterItem">-->
            <!--<Form-item>-->
            <!--<Select v-model="pageParams.warehouseId" style="width: 220px" filterable-->
            <!--placeholder="选择仓库" @on-change='selectWareBlock'>-->
            <!--<Option v-for="item in wareHouseTypeList" :value="item.warehouseId"-->
            <!--:key="item.warehouseId">{{item.warehouseName}}-->
            <!--</Option>-->
            <!--</Select>-->
            <!--</Form-item>-->
            <!--</div>-->
            <!--</Form>-->
            <!--</Col>-->
            <!--<Col span="7">-->
            <!--<Form :model="pageParams" label-position="left">-->
            <!--<div class="filterItem">-->
            <!--<Form-item>-->
            <!--<Select v-model="pageParams.wareBlockType" style="width: 220px" filterable-->
            <!--placeholder="选择库区">-->
            <!--<Option v-for="item in wareBlockNameList" :value="item.warehouseBlockId"-->
            <!--:key="item.warehouseBlockId">{{item.warehouseBlockName}}-->
            <!--</Option>-->
            <!--</Select>-->
            <!--</Form-item>-->
            <!--</div>-->
            <!--</Form>-->
            <!--</Col>-->
            <!--</Row>-->
            <Row>
              <Col span="3" style="margin-left: 7px;">
              <Form :model="pageParams" label-position="left">
                <div class="filterItem">
                  <Form-item>
                    <Input placeholder="输入库位ID/名称" v-model.trim="pageParams.searchWareArea" style="width: 220px"></Input>
                  </Form-item>
                </div>
              </Form>
              </Col>
              <Col span="5">
              <div class="filterItem filterConfirm">
                <Button type="primary" @click="wareLocationSearch" :disabled="SearchDisabled" icon="ios-search">查询</Button>
              </div>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </div>
    <!--按SortID 或 按库位状态排序-->
    <div class="dataSort grayBg" >
      <span >排序方式：</span >
      <Button-group >
        <Button
            :type="item.checked ? 'primary' : 'default'"
            v-for="item in sortData"
            :disabled="SearchDisabled"
            @click="clickSortButton(item)"
            :key="item.value" >{{ item.label }}
          <Icon type="md-arrow-up" v-if="item.checked && !item.toogle" ></Icon >
          <Icon type="md-arrow-down" v-if="item.checked && item.toogle" ></Icon >
        </Button >
      </Button-group >
    </div >
    <!--新建库位按钮-->
    <div class="addBinding">
      <Button type="primary" icon="md-add" @click="createWareLocateBtn">新建库位</Button>
      <div class="fr">
        <!---->
        <Dropdown @on-click="batchOption">
          <Button icon="ios-copy-outline">批量操作</Button>
          <DropdownMenu slot="list">
            <DropdownItem name="1">批量打印库位标签</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <!---->
        <Dropdown @on-click="exportAllOrSlt">
          <Button icon="md-log-in" style="margin-right: 4px">导出</Button>
          <DropdownMenu slot="list">
            <DropdownItem name="0">导出选中数据</DropdownItem>
            <DropdownItem name="1">导出所有结果集</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <dytUpload :action="importUrl" class="fr" :show-upload-list="false" :headers="headObj" :before-upload="beforeUp" name="excleFile" :data="{ warehouseId: wareId }" :on-success="uploadSuccess" :on-error="uploadError">
          <Button :loading="loading">导入</Button>
        </dytUpload>
      </div>
      <div class="fr defaultLocate">
        <span>收货质检默认库位：</span><span>{{ checkedLocate }}</span> <span><a href="javascript:;" @click="selectLocateModal = true">更改</a></span>
      </div>
    </div>
    <div class="shopTable">
      <!--表格-->
      <Table highlight-row border :columns="columns6" :data="data6" :loading="TableLoading" ref="selection" @on-selection-change="tableSelectionChange"></Table>
      <!--分页按钮-->
      <div class="table-page">
        <div class="table-page-right">
          <Page :total="totalRecords" :current="pageParams.pageNum" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray"></Page>
        </div>
      </div>
    </div>
    <!-- 新建库位模态框 -->
    <div v-if="addWareLocateModal">
      <Modal v-model="addWareLocateModal" :styles="{ top: '80px', width: '520px' }" class="headerBar" :title="addNewWareLocateTitle">
        <div>
          <addWareLocate ref="addNewLocateFlag" @createSuccess="createSuccess" @createFail="createFail"></addWareLocate>
        </div>
        <div slot="footer">
          <Button type="primary" @click="addNewWareLocateBtn">确定新增</Button>
          <Button @click="cancelAddBtn">取消</Button>
        </div>
      </Modal>
    </div>
    <!-- 查看和编辑库位模态框 -->
    <!-- <div v-if="editWareLocateModal"> -->
    <Modal v-model="editWareLocateModal" :styles="{ top: '80px', width: '520px' }" class="headerBar" :title="editWareLocateTitle" @on-cancel="cancelEditBtn">
      <div>
        <editWareLocate ref="editLocateFlag" @editSuccess="editSuccess" @editFail="editFail" :wareId="rowWareId" :wareBlockId="wareBlockId" :wareLocateId="wareLocateId" :curSingleDtl="curSingleDtl" :openFlag="$store.state.wareLocateWatchFlag"></editWareLocate>
      </div>
      <div slot="footer">
        <Button type="primary" @click="editWareLocateBtn">确定编辑</Button>
        <Button @click="cancelEditBtn">取消</Button>
      </div>
    </Modal>
    <!-- </div> -->
    <Modal v-model="selectSizeModal" title="打印">
      <div>
        <Form :label-width="100">
          <form-item label="打印条码尺寸：">
            <Select v-model="selectSize">
              <Option value="0">70*30</Option>
              <Option value="1">100*30</Option>
              <Option value="2">100*100</Option>
            </Select>
          </form-item>
        </Form>
      </div>
      <div slot="footer">
        <Button>取消</Button>
        <Button type="primary" @click="okPrint">确定</Button>
      </div>
    </Modal>
    <Modal v-model="selectLocateModal" :styles="{ top: '80px', width: '720px' }" title="库位选择">
      <selectWareLocate :fromLocateParams="pageParams" workType="fromLocateManage" @sendData="receiptLocateData"></selectWareLocate>
    </Modal>
  </div>
</template>
<script>
import addWareLocate from './addWareLocate';
import editWareLocate from './editWareLocate';
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import selectWareLocate from '../wms-inWareManage/selectWareLocate';
// import { getToken } from '@/utils/cookie';

export default {
  mixins: [Mixin],
  components: {
    addWareLocate, // 新增库位组件
    editWareLocate, // 编辑库位组件
    selectWareLocate
  },
  data () {
    var self = this;
    return {
      wareId: this.getWarehouseId(),
      selectLocateModal: false,
      rowWareId: '', // 编辑当前行的仓库ID
      wareBlockId: '', // 编辑当前行的库区ID
      wareLocateId: '', // 编辑当前行的库位ID
      curSingleDtl: {}, // 查看当前行的库位信息
      cacheClickVal: 'sortId', // 排序缓存值
      // 库位状态选择
      wareLocateFlagList: [
        {
          label: '全部',
          value: '*',
          checked: true
        }, {
          label: '可用',
          value: '0',
          checked: false
        }, {
          label: '停用',
          value: '1',
          checked: false
        }
      ], // 库位类型选择
      wareLocateTypeFlagList: [
        {
          label: '全部',
          value: '*',
          checked: true
        }, {
          label: '地面平仓',
          value: '0',
          checked: false
        }, {
          label: '重力式货架',
          value: '1',
          checked: false
        }, {
          label: '窄巷道货架',
          value: '2',
          checked: false
        }
      ], // 库位使用选择
      wareLocateUseFlagList: [
        {
          label: '全部',
          value: '*',
          checked: true
        }, {
          label: '是',
          value: '1',
          checked: false
        }, {
          label: '否',
          value: '0',
          checked: false
        }
      ],
      wareHouseTypeList: [], // 选择仓库
      wareBlockNameList: [], // 选择库区
      // 排序的数据
      sortData: [
        {
          label: '按SortID',
          value: 'sortId',
          checked: true,
          toogle: true
        }, {
          label: '按库区状态',
          value: 'WS',
          checked: false,
          toogle: true
        }
      ],
      pageParams: {
        wareLocateFlag: '*', // 库位状态
        wareLocateTypeFlag: '*', // 库位类型
        wareLocateUseFlag: '*', // 库位使用
        //										warehouseId: '', // 选择仓库
        //										wareBlockType: '', // 选择库区类型
        searchWareArea: '', // 搜索库位ID或名称
        DESC: 'DESC', // 降序
        CT: 'sortId', // 排序的标记
        pageNum: 1,
        pageSize: 10
      },
      addNewWareLocateTitle: '新建库位',
      editWareLocateTitle: '查看和编辑库位',
      addWareLocateModal: false, // 新增库位
      editWareLocateModal: false, // 编辑库位
      totalRecords: 0, // 总条数
      columns6: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          type: 'index',
          title: '序号',
          width: 120,
          align: 'center'
        }, {
          title: 'SortID',
          key: 'sortId',
          align: 'center'
        }, {
          title: '库位代码',
          key: 'warehouseLocationCode',
          align: 'center'
        }, {
          title: '库位名称',
          key: 'warehouseLocationName',
          align: 'center'
        }, {
          title: '所属库区',
          key: 'warehouseBlockName',
          align: 'center'
        }, {
          title: '状态',
          key: 'warehouseLocationStatus',
          align: 'center',
          render (h, params) {
            return params.row.warehouseLocationStatus === '0' ? h('span', {
              class: 'openStatus'
            }, '可用') : h('span', {
              class: 'stopStatus'
            }, '停用');
          }
        }, {
          title: '仓库',
          key: 'warehouseName',
          align: 'center'
        }, {
          title: '是否拣货',
          key: 'warehouseLocationType',
          align: 'center',
          render (h, params) {
            return params.row.warehouseLocationType === '0'
              ? h('span', '地面平仓')
              : params.row.warehouseLocationType === '1' ? h('span', '重力式货架') : h('span', '窄巷道货架');
          }
        }, {
          title: '库位使用',
          key: 'pickingFlag',
          align: 'center',
          render (h, params) {
            return params.row.pickingFlag === '0' ? h('span', '收货库位') : h('span', '拣货库位');
          }
        }, {
          title: '创建时间',
          key: 'createdTime',
          align: 'center'
        }, {
          title: '操作',
          key: 'action',
          align: 'center',
          render: (h, params) => {
            if (params.row !== undefined) {
              return h('div', [
                h('Button', {
                  props: {
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      self.rowWareId = params.row.warehouseId; // 编辑当前行的仓库ID
                      self.wareBlockId = params.row.warehouseBlockId; // 编辑当前行的库区ID
                      self.wareLocateId = params.row.warehouseLocationId; // 编辑当前行的库位ID
                      self.curSingleDtl = params.row;
                      self.$nextTick(() => {
                        self.editWareLocateModal = true;
                        self.$store.commit('wareLocateWatchFlag', true);
                      });
                    }
                  }
                }, '查看')
              ]);
            }
          }
        }
      ],
      data6: [],
      tableSltData: [],
      importUrl: api.importWarehouseLocation,
      selectSize: '0',
      selectSizeModal: false,
      checkedLocate: ''
    };
  },
  watch: {},
  created () {
    this.searchData();
    this.searchDefaultLocate();
  },
  methods: {
    receiptLocateData (data) {
      let obj = {
        warehouseLocationId: data.warehouseLocationId,
        warehouseId: this.getWarehouseId()
      };
      this.axios.post(api.modifyCheckLocation, obj).then(res => {
        if (res.data.code === 0) {
          this.selectLocateModal = false;
          this.checkedLocate = data.warehouseLocationName;
        }
      });
    },
    searchDefaultLocate () {
      // 查询默认库位
      this.axios.get(api.getCheckWarehouseLoction + this.wareId).then(res => {
        if (res.data.code === 0) {
          this.checkedLocate = res.data.datas.warehouseLocationName;
        }
      });
    },
    batchOption (name) {
      if (name === '1') {
        this.selectSizeModal = true;
      }
    },
    tableSelectionChange (selection) {
      this.tableSltData = selection;
    },
    beforeUp () { },
    uploadSuccess (res, file, fileList) {
      if (res.code === 0) {
        this.$Message.success('导入成功');
      }
    },
    uploadError () { },
    exportFn (obj) {
      this.axios.post(api.exportWarehouseLocation, obj).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('导出成功');
        }
      });
    },
    exportAllOrSlt (name) {
      // 导出
      let obj = this.getParamsObj();
      if (name === '0') {
        // 选中
        if (this.tableSltData.length === 0) {
          this.$Message.warning('请选择导出数据');
          return;
        }
        obj.warehouseLocationIds = this.tableSltData.map(val => val.warehouseLocationId);
        obj.exportType = '0';
        this.exportFn(obj);
      } else {
        // 所有
        let obj2 = {
          ...this.getParamsObj(),
          exportType: '1'
        };
        this.exportFn(obj2);
      }
    },
    getParamsObj () {
      let v = this;
      var paramsObj = {
        pageNum: v.pageParams.pageNum,
        pageSize: v.pageParams.pageSize,
        orderSeq: v.pageParams.DESC,
        orderBy: v.pageParams.CT,
        warehouseId: this.wareId
      };
      if (v.pageParams.wareLocateFlag !== '*') { paramsObj.warehouseLocationStatus = v.pageParams.wareLocateFlag; } // 库位状态
      if (v.pageParams.wareLocateTypeFlag !== '*') { paramsObj.warehouseLocationType = v.pageParams.wareLocateTypeFlag; } // 库位类型
      if (v.pageParams.wareLocateUseFlag !== '*') { paramsObj.pickingFlag = v.pageParams.wareLocateUseFlag; } // 库位使用
      if (v.pageParams.searchWareArea) { paramsObj.warehouseLocationIdOrName = v.pageParams.searchWareArea; } // 搜索库位ID或名称
      return paramsObj;
    },
    searchData () {
      // 查询功能
      var v = this;
      let paramsObj = this.getParamsObj();
      v.TableLoading = true;
      v.SearchDisabled = true;
      this.axios.post(api.wareLocateSearchData, paramsObj).then(res => {
        v.TableLoading = false;
        v.SearchDisabled = false;
        if (res.data.code === 0) {
          v.data6 = res.data.datas.list;
          v.totalRecords = res.data.datas.total;
        }
      });
      this.getWareHouseName(); // 调用仓库下拉列表
    },
    wareLocationSearch () {
      // 页面查询
      this.pageParams.pageNum = 1; // 页码重置为1
      this.searchData();
    },
    addNewWareLocateBtn () {
      // 确认新建库位按钮
      this.$refs.addNewLocateFlag.addNewWareLocate();
    },
    cancelAddBtn () {
      // 取消新增库位
      var v = this;
      v.addWareLocateModal = false;
      v.$Message.info('取消新增库位！');
      v.$refs.addNewLocateFlag.resetNewWareLocate(); // 取消之后，重置表单
    },
    createSuccess () {
      // 新增库位成功
      var v = this;
      v.addWareLocateModal = false;
      v.$refs.addNewLocateFlag.resetNewWareLocate(); // 新增成功之后，重置表单
      v.searchData();
    },
    createFail () {
      // 新增库位失败
      this.addWareLocateModal = true;
    },
    editWareLocateBtn () {
      // 确认编辑库位按钮
      this.$refs.editLocateFlag.editOrWatchWareLocate();
    },
    cancelEditBtn () {
      // 取消编辑库位按钮
      var v = this;
      v.editWareLocateModal = false;
      v.$store.commit('wareLocateWatchFlag', false);
      v.$Message.info('取消编辑库位！');
    },
    editSuccess () {
      // 编辑库位成功
      var v = this;
      v.editWareLocateModal = false;
      v.$store.commit('wareLocateWatchFlag', false);
      v.searchData();
    },
    editFail () {
      // 编辑库位失败
      this.editWareLocateModal = true;
    },
    checkWareLocateStatus: function (value) {
      // 库位状态按钮切换
      this.wareLocateFlagList.forEach(function (n) {
        n.checked = n.value === value;
      });
      this.pageParams.wareLocateFlag = value;
    },
    checkWareLocateTypeStatus: function (value) {
      // 库位类型按钮切换
      this.wareLocateTypeFlagList.forEach(function (n) {
        n.checked = n.value === value;
      });
      this.pageParams.wareLocateTypeFlag = value;
    },
    checkWareLocateUseStatus: function (value) {
      // 库位使用按钮切换
      this.wareLocateUseFlagList.forEach(function (n) {
        n.checked = n.value === value;
      });
      this.pageParams.wareLocateUseFlag = value;
    },
    clickSortButton: function (data) {
      // 点击排序的按钮
      if (data.value === this.cacheClickVal) {
        data.toogle = !data.toogle;
      }
      this.cacheClickVal = data.value;
      if (data.toogle) {
        this.pageParams.DESC = 'DESC';
      } else {
        this.pageParams.DESC = 'ASC';
      }
      this.sortData.forEach(function (n) {
        n.checked = data.value === n.value;
      });
      this.pageParams.CT = data.value;
      this.searchData();
    },
    getWareHouseName () {
      // 获取仓库下拉列表
      var v = this;
      v.axios.post(api.selectWareHouseName).then(res => {
        if (res.data.code === 0) {
          v.wareHouseTypeList = res.data.datas;
        }
      });
    },
    selectWareBlock (val) {
      this.pageParams.warehouseId = val;
      this.getWareBlockName(); // 调用库区下拉列表
    },
    getWareBlockName () {
      // 获取库区下拉列表，仓库和库区联动选择
      var v = this;
      var obj = {
        warehouseBlockStatus: null,
        warehouseBlockTypeList: null,
        warehouseId: this.pageParams.warehouseId
      };
      v.axios.post(api.selectBlockType, obj).then(res => {
        if (res.data.code === 0) {
          v.wareBlockNameList = res.data.datas;
        }
      });
    },
    changePage (page) {
      // 表格分页
      this.pageParams.pageNum = page;
      this.searchData();
    },
    changePageSize (size) {
      // 切换每页条数
      this.pageParams.pageSize = size;
      this.searchData();
    },
    createWareLocateBtn () {
      // 新建库位按钮
      var v = this;
      v.$nextTick(function () {
        v.addWareLocateModal = true;
      });
    },
    getBar () {
      return new Promise(resolve => {
        let arr = this.tableSltData.map(val => val.warehouseLocationName);
        this.axios.post(api.getBarCode, arr).then(res => {
          if (res.data.code === 0) {
            this.tableSltData.forEach(val1 => {
              res.data.datas.forEach(val2 => {
                let key = Object.getOwnPropertyNames(val2)[0];
                if (val1.warehouseLocationName === key) {
                  let value = val2[key] ? val2[key] : '';
                  this.$set(val1, 'barcode', value);
                }
              });
            });
            resolve();
          }
        });
      });
    },
    okPrint () {
      // 打印
      this.getBar().then(res => {
        // $.ajax({
        //   type: 'POST',
        //   url: 'http://localhost:10099/print',
        //   data: { content: this.htm5Doc, postId: '1' },
        //   success: () => {
        //
        //   },
        //   error: () => {
        //
        //   }
        // });
        let instance = this.axios.create({
          timeout: 3000,
          headers: {
            'Content-Type': 'multipart/form-data; charset=UTF-8'
          }
        });
        let v = this;
        instance.post('http://localhost:10099/print', {
          content: this.htm5Doc,
          postId: '1'
        }).then(response => {
          if (response.status === 200) {
          }
        }).catch(() => {
          v.axios.get(api.get_downloadPrint).then(response => {
            if (response.data.code === 0) {
              v.$Modal.info({
                title: '提示',
                okText: '取消',
                render: (h, params) => {
                  return h('div', {
                    class: 'normalTop20'
                  }, [
                    h('div', {
                      class: 'flexBox flexBoxJustContent',
                      style: {
                        fontSize: '16px'
                      }
                    }, '该功能需使用打印控件，请下载安装'), h('a', {
                      attrs: {
                        href: v.$store.state.erpConfig.filenodeViewTargetUrl + response.data.datas,
                        target: '_blank'
                      },
                      class: 'flexBox flexBoxJustContent normalTop',
                      style: {
                        fontSize: '16px',
                        fontWeigh: 'bold'
                      }
                    }, '点击下载'), h('div', {
                      class: 'flexBox flexBoxJustContent normalTop',
                      style: {
                        fontSize: '16px'
                      }
                    }, '如果已安装，请开启打印控件')
                  ]);
                }
              });
            }
          });
        });
      });
    }
  },
  computed: {
    headObj () {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    },
    htm5Doc () {
      return (`<!DOCTYPE html>
        <html lang="en">
          <head>
          <meta charset="UTF-8">
          <title>Title</title>
          <style type="text/css">
        @media print {.btn{display: none;}}
         #barcode{background:url('${window.location.origin}/wms-service/static/css/printFont/IDAutomationC128S.eot?#iefix')}
         #printSkuBarCode{background:url('${window.location.origin}/wms-service/static/css/printFont/IDAutomationC128S.eot?#iefix')}
        @font-face {
            font-family: 'IDAutomationC128S';
            src: url('${window.location.origin}/wms-service/static/css/printFont/IDAutomationC128S.eot'); /* IE9 Compat Modes */
            src: url('${window.location.origin}/wms-service/static/css/printFont/IDAutomationC128S.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
            url('${window.location.origin}/wms-service/static/css/printFont/IDAutomationC128S.woff') format('woff'), /* Modern Browsers */
            url('${window.location.origin}/wms-service/static/css/printFont/IDAutomationC128S.ttf') format('truetype'), /* Safari, Android, iOS */
            url('${window.location.origin}/wms-service/static/css/printFont/IDAutomationC128S.svg#IDAutomationC128S') format('svg'); /* Legacy iOS */
        }
        #printSkuBarCode{background:url('${window.location.origin}/wms-service/static/css/printFont/IDAutomationSC39S.eot?#iefix')}
        #barCode{background:url('${window.location.origin}/wms-service/static/css/printFont/IDAutomationSC39S.eot?#iefix')}
        @font-face {
            font-family: 'IDAutomationSC39S';
            src: url('${window.location.origin}/wms-service/static/css/printFont/IDAutomationSC39S.eot'); /* IE9 Compat Modes */
            src: url('${window.location.origin}/wms-service/static/css/printFont/IDAutomationSC39S.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
            url('${window.location.origin}/wms-service/static/css/printFont/IDAutomationSC39S.ttf') format('truetype');
        }
    </style>
          </head>
          <body>` + this.htmlText + `
      </body>
      </html>`);
    },
    htmlText () {
      var str = '';
      for (let i = 0; i < this.tableSltData.length; i++) {
        let item = this.tableSltData[i];
        str += `
        <div style='width: 210px;margin: 0 auto;text-align: center'>
             <p id='barCode'  style='font-family: IDAutomationC128S'>${item.barcode}</p>
             <p>${item.warehouseLocationName}</p>
        </div>
        `;
      }
      return str;
    }
  }
};
</script >
<style >
.headerBar .ivu-modal-header p,
.headerBar .ivu-modal-header-inner {
  color: #fff;
}

.defaultLocate {
  height: 32px;
  line-height: 32px;
  margin-right: 10px;
}
</style >
