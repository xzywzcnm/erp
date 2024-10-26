<template>
  <div>
    <div class="usersFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <Form ref="pageParams" :model="pageParams" :label-width="labelWidth">
              <dyt-filter :filter-row="1">
                <Form-item label="库位状态：">
                  <dyt-select v-model="pageParams.wareLocateFlag">
                    <Option
                      v-for="(item,index) in wareLocateFlagList"
                      :key="index"
                      :value="item.value"
                    >{{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="库位使用：">
                  <dyt-select v-model="pageParams.wareLocateUseFlag">
                    <Option
                      v-for="(item,index) in wareLocateUseFlagList"
                      :key="index"
                      :value="item.value"
                    >{{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="所属仓库：">
                  <dyt-select
                    v-model="pageParams.warehouseId"
                    filterable
                    placeholder="仓库名称"
                    @on-change='selectWareBlock'>
                    <Option
                      v-for="item in wareHouseTypeList"
                      :value="item.warehouseId"
                      :key="item.warehouseId"
                    >{{ item.warehouseName }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="所属库区：">
                  <dyt-select v-model="pageParams.wareBlockType" filterable placeholder="库区名称">
                    <Option
                      v-for="item in wareBlockNameList"
                      :value="item.warehouseBlockId"
                      :key="item.warehouseBlockId">{{ item.warehouseBlockName }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="库位代码/名称：">
                  <dyt-input
                    placeholder="输入库位代码/名称"
                    v-model.trim="pageParams.searchWareArea"
                  ></dyt-input>
                </Form-item>
                <Form-item label="库区组：">
                  <dyt-select v-model="pageParams.warehouseBlockGroupId" filterable>
                    <Option
                      v-for="item in wareAreaGroupList"
                      :value="item.warehouseBlockGroupId"
                      :key="item.warehouseBlockGroupId">{{ item.name }}</Option>
                  </dyt-select>
                </Form-item>
                <div slot="operation">
                  <Button
                    v-if="getPermission('wmsWarehouseLocation_list')"
                    type="primary"
                    @click="wareLocationSearch"
                    :disabled="SearchDisabled"
                    icon="md-search">查询</Button>
                  <Button style="marginLeft:10px;" @click="resetSearch" v-once icon="md-refresh">重置</Button>
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
    </div>
    <!--新建库位按钮-->
    <div class="addBinding" style="display: flex;">
      <div style="flex: 100;">
        <Button
          type="primary"
          icon="plus-round"
          v-if="getPermission('wmsWarehouseLocation_create')"
          @click="createWareLocateBtn"
        >新建库位</Button>
        <Dropdown @on-click='batchOption' class="ml5">
          <Button type="default" icon='ios-copy-outline'>批量操作 </Button>
          <DropdownMenu slot="list">
            <DropdownItem name="0" v-if="getPermission('wmsWarehouseLocation_modify_batch')">批量修改库位
            </DropdownItem>
            <DropdownItem name='1' v-if="getPermission('wmsWarehouseLocation_printTag')">批量打印库位标签
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <!---->
        <Dropdown @on-click='exportAllOrSlt' class="ml5" v-if="getPermission('wmsWarehouseLocation_exportWarehouseLocation')">
          <Button type="default" icon='log-in' style='margin-right: 4px'>导出 </Button>
          <DropdownMenu slot="list">
            <DropdownItem name='0'>导出选中数据</DropdownItem>
            <DropdownItem name='1'>导出所有结果集</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <!--<dytUpload :action="importUrl" class='fr' :show-upload-list='false' :headers='headObj'-->
        <!--:before-upload='beforeUp' name='excleFile'  :data='{warehouseId : wareId}'-->
        <!--:on-success='uploadSuccess' :on-error='uploadError'>-->
        <!--<Button :loading='loading'>导入</Button>-->
        <!--</dytUpload>-->
        <Button
          type="default"
          @click='openInportModal'
          v-if="getPermission('wmsWarehouseLocation_importWarehouseLocation')">导入 </Button>
      </div>
      <!--<div class='fr defaultLocate'>-->
      <!--<span>收货质检默认库位：</span><span>{{checkedLocate}}</span>-->
      <!--<span><a href="javascript:;" @click='selectLocateModal=true'>更改</a></span>-->
      <!--</div>-->
      <!--按SortID 或 按库位状态排序-->
      <div class="dataSort grayBg" style="display: inline-block;background: none;border: none;padding: 0;margin: 0;">
        <span>排序：</span>
        <Button-group>
          <Button
            :type="item.checked?'primary':'default'"
            v-for='item in sortData'
            @click='clickSortButton(item)'
            :key='item.value'>{{ item.label }}
            <Icon type="md-arrow-round-up" v-if="item.checked && !item.toogle"></Icon>
            <Icon type="md-arrow-round-down" v-if="item.checked && item.toogle"></Icon>
          </Button>
        </Button-group>
      </div>
    </div>
    <div class="shopTable">
      <!--表格-->
      <Table
        highlight-row
        border
        :columns="columns6"
        :data="data6"
        ref="selection"
        :height="tableHeight"
        @on-selection-change='tableSelectionChange'></Table>
      <!--分页按钮-->
      <div class="table-page">
        <div class="table-page-right">
          <Page
            :total="totalRecords"
            :current="pageParams.pageNum"
            @on-change="changePage"
            show-total
            :page-size="pageParams.pageSize"
            show-elevator
            show-sizer
            @on-page-size-change="changePageSize"
            placement="top"
            :page-size-opts="pageArray"></Page>
        </div>
      </div>
    </div>
    <!-- 新建库位模态框 -->
    <div v-if="addWareLocateModal">
      <Modal v-model="addWareLocateModal" :styles="{top: '80px',width:'520px'}" class="headerBar">
        <p slot="header">
          <span>{{ addNewWareLocateTitle }}</span>
        </p>
        <div>
          <wareLocateModal
            ref='addNewLocateFlag'
            @createSuccess="createSuccess"
            :editType="'edit'"
            @createFail="createFail"
            :wareLocateModalStatus="addStatus"></wareLocateModal>
        </div>
        <div slot="footer">
          <Button type="primary" @click="addNewWareLocateBtn">确定新增 </Button>
          <Button @click="cancelAddBtn">取消</Button>
        </div>
      </Modal>
    </div>
    <!-- 查看和编辑库位模态框 -->
    <Modal
      v-model="editWareLocateModal"
      :styles="{top: '80px',width:'520px'}"
      class="headerBar"
      @on-cancel="cancelEditBtn">
      <p slot="header">
        <span>{{ editType === 'look' ? '查看' : '编辑' }}</span>
      </p>
      <div>
        <wareLocateModal
          ref='editLocateFlag'
          @editSuccess="editSuccess"
          @editFail="editFail"
          :wareId='rowWareId'
          :editType="editType"
          :wareBlockId='wareBlockId'
          :wareLocateId='wareLocateId'
          :curSingleDtl='curSingleDtl'
          :openFlag='$store.state.wareLocateWatchFlag'
          :wareLocateModalStatus='editStatus'></wareLocateModal>
      </div>
      <div slot="footer">
        <Button type="primary" v-if="editType === 'edit'" @click="editWareLocateBtn">确定编辑 </Button>
        <Button @click="cancelEditBtn">取消</Button>
      </div>
    </Modal>
    <Modal v-model='selectSizeModal' title="打印" width="1000" @on-visible-change="openPrintBox">
      <div>
        <printBox ref="printBox" :startEndShow="false" local-storage-name="PRINT_warelocate"></printBox>
        <Card dis-hover>
          <div class="clear" style="padding-bottom: 10px;padding-right: 10px">
            <div class="fl">
              <Button @click="batchDelete">删除选中</Button>
            </div>
            <div class="fr">
              <span>统一设置打印数量</span>
              <InputNumber
                :min="1" v-model="printAmount" size="small" @on-change="uniteSetAmount"></InputNumber>
            </div>
          </div>
          <Table
            highlight-row
            border
            ref="printTable"
            :columns="columns"
            :data="printData"
            @on-selection-change="changeTable"
            max-height="365"></Table>
          <!--@on-row-click='rowClick'-->
        </Card>
      </div>
      <div slot='footer'>
        <Button @click='cancelPrint'>取消</Button>
        <Button type='primary' :loading="printLoading" @click='okPrint'>确定 </Button>
      </div>
    </Modal>
    <Modal v-model='selectLocateModal' :styles="{top: '80px',width:'720px'}" title="库位选择">
      <selectWareLocate
        :fromLocateParams='pageParams' workType='fromLocateManage' @sendData='receiptLocateData'></selectWareLocate>
    </Modal>
    <!--导入前的模态框  -->
    <!-- <Modal v-model="switchInportModal" :styles="{top: '80px',width:'520px'}" class="headerBar">
      <p slot="header">
          <span>导入库位</span>
      </p>
      <inportBeforeDownload :importUrl='importUrl' :headObj='headObj' :wareId='wareId' templateTypes='5'></inportBeforeDownload>
      <div slot="footer"> -->
    <!--<Button type="primary" @click="okInport">确定</Button>-->
    <!-- <Button @click="cancelInport">取消</Button> -->
    <!-- </div> -->
    <!-- </Modal> -->
    <!-- 导入 -->
    <Modal
      v-model="switchInportModal"
      v-if="importModalStatus"
      title="导入库位"
      :loading="importModalLoading"
      @on-ok="upload"
      @on-cancel="uploadCancel">
      <p style="margin-top: 20px;float: left;">选择导入文件：</p>
      <div>
        <dytUpload
          ref="upload"
          name="excleFile"
          :headers="headObj"
          :show-upload-list="false"
          :data='{warehouseId : pageParams.warehouseId,updateIgnore:updateIgnore}'
          :on-success="handleSuccess"
          :on-format-error="handleFormatError"
          :action="importUrl"
          :before-upload="handleUpload"
          style='display: inline-block'>
          <Button style="marginLeft:10px;marginTop:10px;">选择文件</Button>
        </dytUpload>
        <a href="javascript:;" style='margin-left: 20px' @click='download'>下载模板</a>
        <div v-if="file !== null" style="marginTop:10px"> 上传文件：{{ file.name }}
        </div>
        <div class="skuUpdate mt10">
          导入已经存在的库位时：
          <RadioGroup v-model="updateIgnore">
            <Radio label="0">覆盖</Radio>
            <Radio label="1">忽略</Radio>
          </RadioGroup>
        </div>
      </div>
    </Modal>
    <!--批量修改-->
    <Modal v-model="modal1" title="批量修改库位" width="1000">
      <Table highlight-row border max-height="500" :columns="columns1" :data="data1"></Table>
      <div slot="footer">
        <Button @click="batchEdit" type="primary">保存 </Button>
        <Button @click="modal1 = false">关闭</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
// import addWareLocate from './addWareLocate';
// import editWareLocate from './editWareLocate';
import wareLocateModal from './wareLocateModal';
import printBox from '@/components/common/newPrint';
// import inportBeforeDownload from './inportBeforeDownload';
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import print_mixin from '@/components/mixin/print_mixin';
import selectWareLocate from './selectWareLocate';
// import { getToken } from '@/utils/cookie';

export default {
  mixins: [Mixin, print_mixin],
  components: {
    wareLocateModal,
    selectWareLocate,
    printBox
    // inportBeforeDownload
  },
  data () {
    var self = this;
    var v = this;
    return {
      tableHeight: 500,
      printData: [],
      printChecked: [],
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: '库位名称',
          key: 'warehouseLocationName',
          align: 'center'
        }, {
          title: '打印数量',
          key: 'printNumber',
          align: 'center',
          render (h, params) {
            return h('Input', {
              props: {
                size: 'small',
                value: self.printData[params.index].printNumber
              },
              style: {
                width: '60px'
              },
              on: {
                'on-blur': e => {
                  let value = 1;
                  if (self.typeOf(Number(e.target.value)) === 'number' && Number(e.target.value).toString() !== 'NaN') {
                    value = e.target.value;
                  }
                  self.$nextTick(() => {
                    self.$set(self.printData[params.index], 'printNumber', Number(value));
                  });
                }
              }
            });
          }
        }, {
          title: '操作',
          key: 'name',
          align: 'center'
        }
      ],
      printAmount: 1,
      updateIgnore: '0',
      editType: 'look',
      modal1: false,
      warehouseLocationName: '',
      warehouseBlockId: '',
      warehouseLocationStatus: '',
      sortId: null,
      columns1: [
        {
          type: 'index',
          title: '序号',
          width: 70,
          align: 'center'
        }, {
          title: '库位代码',
          key: 'warehouseLocationCode',
          width: 100,
          align: 'center'
        }, {
          key: 'name',
          minWidth: 120,
          align: 'center',
          renderHeader (h, params) {
            return h('div', {}, [
              h('span', '库位名称'), h('Input', {
                props: {
                  value: self.warehouseLocationName,
                  size: 'small'
                },
                on: {
                  'on-change': (e) => {
                    self.data1.forEach((i, index) => {
                      let an = index > 0 ? index : '';
                      i.warehouseLocationName = e.target.value + an;
                    });
                  }
                }
              })
            ]);
          },
          render (h, params) {
            return h('Input', {
              props: {
                value: self.data1[params.index].warehouseLocationName,
                size: 'small'
              },
              on: {
                'on-change': (e) => {
                  self.data1[params.index].warehouseLocationName = e.target.value;
                }
              }
            });
          }
        }, {
          title: '所属仓库',
          minWidth: 100,
          align: 'center',
          key: 'warehouseName'
        }, {
          title: '库区类型',
          minWidth: 150,
          align: 'center',
          renderHeader (h, params) {
            return h('div', {}, [
              h('span', '所属库区'), h('Select', {
                props: {
                  value: self.warehouseBlockId,
                  size: 'small',
                  transfer: true
                },
                on: {
                  'on-change' (e) {
                  }
                }
              }, self.wareBlockNameListEdit.map(i => {
                return h('Option', {
                  props: {
                    value: i.warehouseBlockId
                  },
                  nativeOn: {
                    'click' () {
                      self.warehouseBlockId = '';
                      self.data1.forEach(j => {
                        j.warehouseBlockId = i.warehouseBlockId;
                      });
                    }
                  }
                }, i.warehouseBlockName);
              }))
            ]);
          },
          render (h, params) {
            return h('Select', {
              props: {
                value: self.data1[params.index].warehouseBlockId,
                transfer: true,
                size: 'small'
              },
              on: {
                'on-change' (e) {
                  self.data1[params.index].warehouseBlockId = e;
                }
              }
            }, self.wareBlockNameListEdit.map(i => {
              return h('Option', {
                props: {
                  value: i.warehouseBlockId
                }
              }, i.warehouseBlockName);
            }));
          }
        }, {
          title: '库位使用',
          key: 'pickingFlag',
          minWidth: 90,
          align: 'center',
          render (h, params) {
            let obj = v.wareLocateUseFlagList.filter(i => i.value === params.row.pickingFlag)[0];
            return h('p', obj.label);
          }
        }, {
          title: '状态',
          minWidth: 150,
          align: 'center',
          renderHeader (h, params) {
            return h('div', {}, [
              h('span', '状态'), h('Select', {
                props: {
                  value: self.warehouseLocationStatus,
                  size: 'small',
                  transfer: true
                },
                on: {
                  'on-change' (e) {
                  }
                }
              }, self.warehouseStatusList.map(i => {
                return h('Option', {
                  props: {
                    value: i.value
                  },
                  nativeOn: {
                    'click' () {
                      self.warehouseLocationStatus = '';
                      self.data1.forEach(j => {
                        j.warehouseLocationStatus = i.value;
                      });
                    }
                  }
                }, i.label);
              }))
            ]);
          },
          render (h, params) {
            return h('Select', {
              props: {
                value: self.data1[params.index].warehouseLocationStatus,
                transfer: true,
                size: 'small'
              },
              on: {
                'on-change' (e) {
                  self.data1[params.index].warehouseLocationStatus = e;
                }
              }
            }, self.warehouseStatusList.map(i => {
              return h('Option', {
                props: {
                  value: i.value
                }
              }, i.label);
            }));
          }
        }, {
          align: 'center',
          minWidth: 120,
          renderHeader (h, params) {
            return h('div', {}, [
              h('span', '拣货优先级'), h('InputNumber', {
                props: {
                  value: self.sortId,
                  size: 'small',
                  min: 1,
                  max: 99999999
                },
                on: {
                  'on-change': (e) => {
                    self.data1.forEach((i, index) => {
                      i.sortId = e;
                    });
                  }
                }
              })
            ]);
          },
          render (h, params) {
            return h('InputNumber', {
              props: {
                value: self.data1[params.index].sortId,
                size: 'small',
                min: 1,
                max: 99999999
              },
              on: {
                'on-change': (val) => {
                  self.data1[params.index].sortId = val;
                }
              }
            });
          }
        }
      ],
      data1: [],
      filenodeViewTargetUrl: self.$store.state.erpConfig.filenodeViewTargetUrl, // filenode根路径
      switchInportModal: false,
      wareId: sessionStorage.getItem('warehouseId'),
      selectLocateModal: false,
      rowWareId: '', // 编辑当前行的仓库ID
      wareBlockId: '', // 编辑当前行的库区ID
      wareLocateId: '', // 编辑当前行的库位ID
      curSingleDtl: {}, // 查看当前行的库位信息
      cacheClickVal: 'CT', // 排序缓存值
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
      ], // 库位使用选择
      wareLocateUseFlagList: [
        {
          label: '全部',
          value: '*',
          checked: true
        }, {
          label: '作为收货库位',
          value: '0',
          checked: false
        }, {
          label: '作为拣货库位',
          value: '1',
          checked: false
        }, {
          label: '作为异常处理库位',
          value: '2',
          checked: false
        }, {
          label: '作为不良品库位',
          value: '3',
          checked: false
        }
      ],
      wareHouseTypeList: [
        {
          warehouseId: 'null',
          warehouseName: '全部'
        }
      ], // 选择仓库
      wareBlockNameListEdit: [],
      wareBlockNameList: [
        {
          warehouseBlockId: 'null',
          warehouseBlockName: '全部'
        }
      ], // 选择库区
      // 排序的数据
      sortData: [
        {
          label: '按创建时间',
          value: 'CT',
          checked: true,
          toogle: true
        }, {
          label: '按库位代码',
          value: 'WC',
          checked: false,
          toogle: true
        }, {
          label: '按库位状态',
          value: 'WS',
          checked: false,
          toogle: true
        }
      ],
      pageParams: {
        warehouseId: 'null',
        wareBlockType: 'null',
        wareLocateFlag: '*', // 库位状态
        wareLocateUseFlag: '*', // 库位使用
        // warehouseId: '', // 选择仓库
        // wareBlockType: '', // 选择库区类型
        searchWareArea: '', // 搜索库位ID或名称
        warehouseBlockGroupId: 'null', // 库区组
        DESC: 'DESC', // 降序
        CT: 'CT', // 排序的标记
        pageNum: 1,
        pageSize: 20
      },
      printStatus: true, // true 单个打印  false 批量打印
      printParams: null, // 单个打印参数
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
          width: 70,
          align: 'center'
        }, {
          title: '拣货优先级',
          key: 'sortId',
          align: 'center',
          minWidth: 80
        }, {
          title: '库位代码',
          key: 'warehouseLocationCode',
          align: 'center',
          width: 130
        }, {
          title: '库位名称',
          key: 'warehouseLocationName',
          align: 'center',
          minWidth: 100
        }, {
          title: '库区组' + '/' + '所属库区' + '/' + '库区类型',
          key: 'warehouseBlockName',
          align: 'center',
          minWidth: 160,
          render: (h, params) => {
            return h('div', {}, [
              h('p', params.row.warehouseBlockGroupName),
              h('p', params.row.warehouseBlockName),
              h('p', params.row.warehouseBlockType === '00' ? '收货区' : params.row.warehouseBlockType === '10'
                ? '标准区'
                : params.row.warehouseBlockType === '11'
                  ? '良品区'
                  : params.row.warehouseBlockType === '12'
                    ? '不良品区'
                    : params.row.warehouseBlockType === '20'
                      ? '退货区'
                      : '')
            ]);
          }
        }, {
          title: '状态',
          key: 'warehouseLocationStatus',
          align: 'center',
          minWidth: 100,
          render: (h, params) => {
            return params.row.warehouseLocationStatus === '0' ? h('span', {
              class: 'openStatus'
            }, '可用') : h('span', {
              class: 'stopStatus'
            }, '停用');
          }
        }, {
          title: '仓库',
          key: 'warehouseName',
          align: 'center',
          minWidth: 100
        },
        {
          title: '库位使用',
          key: 'pickingFlag',
          align: 'center',
          minWidth: 110,
          render (h, params) {
            let obj = v.wareLocateUseFlagList.filter(i => i.value === params.row.pickingFlag)[0];
            return h('p', obj.label);
          }
        }, {
          title: '收货质检默认库位',
          minWidth: 140,
          align: 'center',
          render: (h, params) => {
            // if (params.row.warehouseLocationStatus === '0') {
            //   return h('p', {
            //     display: (() => {
            //       return self.getPermission('wmsWarehouseLocation_modifyCheckLocation') ? 'block' : 'none';
            //     })()
            //   }, [
            //     h('a', {
            //       style: {
            //         display: (params.row.warehouseBlockType === '00' || params.row.warehouseBlockType === '10') && (params.row.pickingCheckFlag === '0' || !params.row.pickingCheckFlag) ? 'block' : 'none'
            //       },
            //       on: {
            //         'click': () => {
            //           this.axios.post(api.wmsService + api.modifyCheckLocation, params.row).then(res => {
            //             if (res.data.code === 0) {
            //               this.searchData();
            //               this.$Message.success(res.data.message);
            //             } else {
            //               this.$Message.warning({
            //                 content: res.data.message,
            //                 duration: 5
            //               });
            //             }
            //           });
            //         }
            //       }
            //     }, '设为默认'),
            //     h('span', {
            //       style: {
            //         display: (params.row.warehouseBlockType === '00' || params.row.warehouseBlockType === '10') && (params.row.pickingCheckFlag === '1') ? 'block' : 'none'
            //       }
            //     }, [
            //       h('Icon', {
            //         props: {
            //           type: 'md-checkmark',
            //           size: '22'
            //         },
            //         style: {
            //           color: 'green'
            //         }
            //       })
            //     ])
            //   ]);
            // } else {
            //   return h('span', '');
            // }
            // if (params.row.pickingFlag === '0') {
            if (params.row.warehouseLocationStatus === '0' && params.row.pickingFlag === '0') {
              return h('p', {
                display: (() => {
                  return self.getPermission('wmsWarehouseLocation_modifyCheckLocation') ? 'block' : 'none';
                })()
              }, [
                h('a', {
                  style: {
                    display: params.row.pickingCheckFlag === '0' || !params.row.pickingCheckFlag ? 'block' : 'none'
                  },
                  on: {
                    'click': () => {
                      this.axios.post(api.wmsService + api.modifyCheckLocation, params.row).then(res => {
                        if (res.data.code === 0) {
                          this.searchData();
                          this.$Message.success(res.data.message);
                        } else {
                          this.$Message.warning({
                            content: res.data.message,
                            duration: 5
                          });
                        }
                      });
                    }
                  }
                }, '设为默认'), h('span', {
                  style: {
                    display: params.row.pickingCheckFlag === '1' ? 'block' : 'none'
                  }
                }, [
                  h('Icon', {
                    props: {
                      type: 'md-checkmark',
                      size: '22'
                    },
                    style: {
                      color: 'green'
                    }
                  })
                ])
              ]);
            } else {
              return h('span', '');
            }
          }
        }, {
          title: '创建时间',
          key: 'createdTime',
          align: 'center',
          minWidth: 150
        }, {
          title: '操作',
          key: 'action',
          align: 'center',
          minWidth: 200,
          render: (h, params) => {
            if (params.row !== undefined) {
              return h('div', [
                h('Button', {
                  props: {
                    size: 'small'
                  },
                  style: {
                    margin: '5px',
                    display: (() => {
                      return self.getPermission('wmsWarehouseLocation_examine') ? 'line-block' : 'none';
                    })()
                  },
                  on: {
                    click: () => {
                      self.editType = 'look';
                      self.rowWareId = params.row.warehouseId; // 编辑当前行的仓库ID
                      self.wareBlockId = params.row.warehouseBlockId; // 编辑当前行的库区ID
                      self.wareLocateId = params.row.warehouseLocationId; // 编辑当前行的库位ID
                      self.$refs.editLocateFlag.disabledStatus = true;
                      self.curSingleDtl = params.row;
                      self.$nextTick(() => {
                        self.editWareLocateModal = true;
                        self.$store.commit('wareLocateWatchFlag', true);
                        self.$refs.selection.selectAll(false);
                      });
                    }
                  }
                }, '查看'), h('Button', {
                  props: {
                    size: 'small'
                  },
                  style: {
                    margin: '5px',
                    display: (() => {
                      return self.getPermission('wmsWarehouseLocation_modify') ? 'line-block' : 'none';
                    })()
                  },
                  on: {
                    click: () => {
                      self.editType = 'edit';
                      self.rowWareId = params.row.warehouseId; // 编辑当前行的仓库ID
                      self.wareBlockId = params.row.warehouseBlockId; // 编辑当前行的库区ID
                      self.wareLocateId = params.row.warehouseLocationId; // 编辑当前行的库位ID
                      self.$refs.editLocateFlag.disabledStatus = true;
                      self.curSingleDtl = params.row;
                      self.$nextTick(() => {
                        self.editWareLocateModal = true;
                        self.$store.commit('wareLocateWatchFlag', true);
                        self.$refs.selection.selectAll(false);
                      });
                    }
                  }
                }, '编辑'), h('Button', {
                  props: {
                    size: 'small'
                  },
                  style: {
                    margin: '5px',
                    display: (() => {
                      return self.getPermission('wmsWarehouseLocation_printTag') ? 'line-block' : 'none';
                    })()
                  },
                  on: {
                    click: () => {
                      self.selectSizeModal = true;
                      params.row.printNumber = 1;
                      self.printData = [params.row];
                      /* self.printStatus = true;
                       self.printParams = params.row; */
                    }
                  }
                }, '打印库位标签')
              ]);
            }
          }
        }
      ],
      warehouseStatusList: [
        {
          label: '可用',
          value: '0'
        }, {
          label: '停用',
          value: '1'
        }
      ],
      data6: [],
      tableSltData: [],
      importUrl: api.wmsService + api.importWarehouseLocation,
      selectSize: '0',
      selectSizeModal: false,
      checkedLocate: '',
      addStatus: 'add',
      editStatus: 'edit',
      printLoading: false, // 打印按钮
      importModalLoading: true,
      confirmUpload: false,
      importModalStatus: false,
      file: null,
      templateTypes: '5',
      wareAreaGroupList: [
        {
          name: '全部',
          warehouseBlockGroupId: 'null'
        }
      ]
    };
  },
  watch: {},
  computed: {
    headObj () {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    }
  },
  created () {
    let v = this;
    this.tableHeight = this.getTableHeight(290);
    v.getPermissionCallback('logistics_wareLocate').then(() => {
      this.searchData();
      this.searchDefaultLocate();
      this.getWareHouseName(); // 调用仓库下拉列表
      this.getWareAreaGroup(); // 获取库区组列表
    });
  },
  methods: {
    resetSearch () {
      this.pageParams = {
        warehouseId: 'null',
        wareBlockType: 'null',
        wareLocateFlag: '*', // 库位状态
        wareLocateUseFlag: '*', // 库位使用
        searchWareArea: '', // 搜索库位ID或名称
        warehouseBlockGroupId: 'null' // 库区组
      }
      this.selectWareBlock(null);
    },
    openPrintBox () {
      this.getBar('warehouseLocationName').then(() => {
        this.$refs.printBox.onSetPrintView().then(data => {
          data.forEach(i => {
            if (i.IdName === 'PRINT_010') {
              i.show = 1;
              i.settingShow = true;
            }
          });
        });
        this.$refs.printBox.setInitData(JSON.parse(JSON.stringify(this.printData[0])));
      });
    },
    batchEdit () {
      let v = this;
      let valid1 = false;
      let valid2 = false;
      let spuRegExp = v.$regular.warelocateTip;
      v.data1.forEach(i => {
        if (!i.warehouseLocationName) {
          valid1 = true;
        }
        if (!spuRegExp.test(i.warehouseLocationName)) {
          valid2 = true;
        }
      });
      if (valid1) {
        v.$Message.error('库位名称不能为空');
        return;
      }
      if (valid2) {
        v.$Message.error('库位名称只能包含只能包含以下字符 0-9, #, &, +, -, ., /, A-Z, [, ], ^, _, a-z, { }, , ~');
        return;
      }
      v.axios.post(api.locationBatchModify, v.data1).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.modal1 = false;
          v.wareLocationSearch();
        }
      });
    },
    cancelPrint () {
      this.selectSizeModal = false;
    },
    openInportModal () {
      let v = this;
      v.switchInportModal = true;
      v.importModalStatus = true;
    },
    okInport () {

    },
    cancelInport () {
      this.switchInportModal = false;
    },
    receiptLocateData (data) {
      let obj = {
        warehouseLocationId: data.warehouseLocationId,
        warehouseId: this.pageParams.warehouseId !== 'null' ? this.pageParams.warehouseId : null
      };
      this.axios.post(api.wmsService + api.modifyCheckLocation, obj).then(res => {
        if (res.data.code === 0) {
          this.selectLocateModal = false;
          this.checkedLocate = data.warehouseLocationName;
        } else {
          this.$Message.warning({
            content: res.data.message,
            duration: 5
          });
        }
      });
    }, // 查询默认库位
    searchDefaultLocate () {
      this.axios.get(api.wmsService + api.getCheckWarehouseLoction + this.wareId).then(res => {
        if (res.data.code === 0) {
          let data = res.data.datas;
          if (data !== null) {
            this.checkedLocate = data.warehouseLocationName;
          }
        }
      });
    },
    batchOption (name) {
      if (name === '1') {
        if (this.tableSltData.length > 0) {
          this.printData = this.tableSltData.map(i => {
            i.printNumber = 1;
            return i;
          });
          this.selectSizeModal = true;
        } else {
          this.$Message.error('请选择数据');
        }
      } else if (name === '0') {
        if (this.tableSltData.length > 0) {
          let arr = [...new Set(this.tableSltData.map(i => i.warehouseId))];
          if (arr.length > 1) {
            this.$Message.warning('只能批量修改一个仓库的数据');
            return;
          }
          this.warehouseLocationName = '';
          this.warehouseBlockId = '';
          this.warehouseLocationStatus = '';
          this.sortId = '';
          this.modal1 = true;
          this.wareAreaGroupEditList = this.wareAreaGroupList.filter(i => {
            if (i.warehouseId && i.warehouseId === this.tableSltData[0].warehouseId) {
              return i;
            }
          });
          this.getWareBlockName(this.tableSltData[0].warehouseId);
          this.data1 = JSON.parse(JSON.stringify(this.tableSltData));
        } else {
          this.$Message.warning('未选择数据');
        }
      }
    },
    tableSelectionChange (selection) {
      this.tableSltData = selection;
    },
    beforeUp () {

    },
    uploadSuccess (res, file, fileList) {
      if (res.code === 0) {
        this.$Message.success('导入成功');
      } else {
        this.$Message.warning({
          content: res.message,
          duration: 5
        });
      }
    },
    uploadError () {

    },
    exportFn (obj) {
      this.axios.post(api.wmsService + api.exportWarehouseLocation, obj).then(res => {
        if (res.data.code === 0) {
          let data = '/wms-service/' + this.$store.state.erpConfig.filenodeViewTargetUrl.replace('./', '') + res.data.datas;
          window.open(data, '_self');
          this.$Message.success('导出成功');
        } else {
          this.$Message.warning({
            content: res.data.message,
            duration: 5
          });
        }
      });
    }, // 导出
    exportAllOrSlt (name) {
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
        this.tableSltData = [];
        this.$refs.selection.selectAll(false);
      } else {
        if (this.data6.length === 0) {
          this.$Message.warning('无数据');
          return;
        }
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
        warehouseId: this.pageParams.warehouseId !== 'null' ? this.pageParams.warehouseId : null,
        warehouseBlockGroupId: this.pageParams.warehouseBlockGroupId !== 'null'
          ? this.pageParams.warehouseBlockGroupId
          : ''
      };
      if (v.pageParams.wareLocateFlag !== '*') paramsObj.warehouseLocationStatus = v.pageParams.wareLocateFlag; // 库位状态
      if (v.pageParams.wareLocateUseFlag !== '*') paramsObj.pickingFlag = v.pageParams.wareLocateUseFlag; // 是否拣货库位
      if (v.pageParams.wareBlockType !== 'null') {
        paramsObj.warehouseBlockName = v.pageParams.wareBlockType; // 选择库区类型
      } else {
        paramsObj.warehouseBlockName = null;
      }
      if (v.pageParams.searchWareArea) paramsObj.warehouseLocationIdOrName = v.pageParams.searchWareArea; // 搜索库位ID或名称
      return paramsObj;
    }, // 查询功能
    searchData () {
      var v = this;
      if (!v.getPermission('wmsWarehouseLocation_list')) return;
      let paramsObj = this.getParamsObj();
      if (paramsObj.warehouseId === 'null') {
        paramsObj.warehouseId = null;
      }
      if (paramsObj.warehouseBlockGroupId === 'null') {
        paramsObj.warehouseBlockGroupId = '';
      }
      this.axios.post(api.wmsService + api.wareLocateSearchData, paramsObj).then(res => {
        if (res.data.code === 0) {
          let resList = res.data.datas.list;
          resList.forEach(val => {
            val.createdTime = v.getDataToLocalTime(val.createdTime, 'fulltime');
          });
          v.data6 = resList;
          v.totalRecords = res.data.datas.total;
        } else {
          this.$Message.warning('操作失败' + '！');
        }
      });
      // this.getWareHouseName(); // 调用仓库下拉列表
    }, // 页面查询
    wareLocationSearch () {
      this.pageParams.pageNum = 1; // 页码重置为1
      this.searchData();
    }, // 确认新建库位按钮
    addNewWareLocateBtn () {
      this.$refs.addNewLocateFlag.addNewWareLocate();
    }, // 取消新增库位
    cancelAddBtn () {
      var v = this;
      v.addWareLocateModal = false;
      v.$Message.info('取消新增库位' + '！');
      v.$refs.addNewLocateFlag.resetNewWareLocate(); // 取消之后，重置表单
    }, // 新增库位成功
    createSuccess () {
      var v = this;
      v.addWareLocateModal = false;
      v.$refs.addNewLocateFlag.resetNewWareLocate(); // 新增成功之后，重置表单
      v.searchData();
    }, // 新增库位失败
    createFail () {
      this.addWareLocateModal = true;
    }, // 确认编辑库位按钮
    editWareLocateBtn () {
      this.$refs.editLocateFlag.editOrWatchWareLocate();
    }, // 取消编辑库位按钮
    cancelEditBtn () {
      var v = this;
      v.editWareLocateModal = false;
      v.$store.commit('wareLocateWatchFlag', false);
      v.$Message.info('取消编辑库位' + '！');
    }, // 编辑库位成功
    editSuccess () {
      var v = this;
      v.editWareLocateModal = false;
      v.$store.commit('wareLocateWatchFlag', false);
      v.searchData();
    }, // 编辑库位失败
    editFail () {
      this.editWareLocateModal = true;
    },
    // 点击排序的按钮
    clickSortButton: function (data) {
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
        n.checked = (data.value === n.value);
      });
      this.pageParams.CT = data.value;
      this.searchData();
    }, // 获取仓库下拉列表
    getWareHouseName () {
      var v = this;
      v.axios.get(api.wmsService + api.query_warehouse + '?delete' + new Date().getTime()).then(res => {
        if (res.data.code === 0) {
          // v.wareHouseTypeList = res.data.datas;
          let data = res.data.datas;
          data.forEach((n, i) => {
            v.wareHouseTypeList.push(n);
          });
        }
      });
    },
    selectWareBlock (val) {
      this.getWareBlockName(); // 调用库区下拉列表
      this.getWareAreaGroup([null, 'null'].includes(val) ? '' : val);
    }, // 获取库区下拉列表，仓库和库区联动选择
    getWareBlockName (warehouseId) {
      var v = this;
      var obj = {
        warehouseBlockStatus: null,
        warehouseBlockTypeList: null,
        warehouseId: warehouseId || (this.pageParams.warehouseId !== 'null' ? this.pageParams.warehouseId : null)
      };
      v.axios.post(api.wmsService + api.selectBlockType, obj).then(res => {
        if (res.data.code === 0) {
          // v.wareBlockNameList = res.data.datas;
          v.wareBlockNameList = [];
          let data = res.data.datas;
          let data1 = JSON.parse(JSON.stringify(res.data.datas));
          data1.forEach(i => {
            if (i.warehouseBlockType === '00') {
              i.warehouseBlockName = i.warehouseBlockName + '(' + '收货区' + ')';
            } else if (i.warehouseBlockType === '10') {
              i.warehouseBlockName = i.warehouseBlockName + '(' + '标准区' + ')';
            } else if (i.warehouseBlockType === '11') {
              i.warehouseBlockName = i.warehouseBlockName + '(' + '良品区' + ')';
            } else if (i.warehouseBlockType === '12') {
              i.warehouseBlockName = i.warehouseBlockName + '(' + '不良品区' + ')';
            }
          });

          v.wareBlockNameListEdit = data1.filter(item => item.warehouseBlockType !== '20');
          v.wareBlockNameList.push({
            warehouseBlockId: 'null',
            warehouseBlockName: '全部'
          });
          data.forEach((n, i) => {
            v.wareBlockNameList.push(n);
          });
        }
      });
    }, // 表格分页
    changePage (page) {
      this.pageParams.pageNum = page;
      this.searchData();
    }, // 切换每页条数
    changePageSize (size) {
      this.pageParams.pageSize = size;
      this.searchData();
    }, // 新建库位按钮
    createWareLocateBtn () {
      var v = this;
      v.$nextTick(function () {
        v.addWareLocateModal = true;
      });
    }, // 打印
    okPrint () {
      let v = this;
      v.$refs.printBox.onPrint(v.printData);
    },
    upload () { // 导入模态框 确认
      if (this.file !== null) {
        this.confirmUpload = true;
        this.$refs.upload.upload(this.file);
      } else {
        this.importModalLoading = false;
        this.$nextTick(function () {
          this.importModalLoading = true;
        });
        this.$Message.error('请选择文件');
      }
    },
    uploadCancel () { // 导入模态框 取消
      this.file = null;
    },
    handleSuccess (res, file, fileList) { // 上传成功
      if (res.code === 0) {
        this.file = null;
        this.$Message.success('导入成功');
        this.confirmUpload = false;
        this.switchInportModal = false;
        this.searchData();
      } else {
        this.file = null;
        this.confirmUpload = false;
        this.importModalLoading = false;
        this.$nextTick(function () {
          this.importModalLoading = true;
        });
        this.$Message.warning({
          content: res.message,
          duration: 5
        });
      }
    },
    handleFormatError () { // 上传失败
      this.$Message.error('文件格式有误');
      this.importModalLoading = false;
      this.$nextTick(function () {
        this.importModalLoading = true;
        this.confirmUpload = false;
      });
    },
    handleUpload (file) { // Excel 导入
      this.file = file;
      return this.confirmUpload;
    },
    download () { // 下载模板
      this.axios.post(api.wmsService + api.downloadModalFile, [this.templateTypes]).then(res => {
        if (res.data.code === 0) {
          let data = res.data.datas;
          // let url = this.filenodeViewTargetUrl.replace('setting-service', 'wms-service');
          // 这里特殊 写死
          window.open(api.wmsService + 'filenode/s' + data[0].templateUrl, '_self');
        } else {
          this.$Message.warning({
            content: res.data.message,
            duration: 5
          });
        }
      });
    },
    htm5Doc () {
      return (`<!DOCTYPE html>
      <html lang="en">
        <head>
        <meta charset="UTF-8">
        <title>Title</title>
        <style type="text/css">
      @media print {.btn{display: none;}}
      .bug-free{background:url('${window.location.origin}/setting-service/static/printFont/IDAutomationC128S.eot?#iefix')}
       #barcode{background:url('${window.location.origin}/setting-service/static/printFont/IDAutomationC128S.eot?#iefix')}
      @font-face {
        font-family: 'IDAutomationC128S';
        src: url('${window.location.origin}/setting-service/static/printFont/IDAutomationC128S.eot'); /* IE9 Compat Modes */
        src: url('${window.location.origin}/setting-service/static/printFont/IDAutomationC128S.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
        url('${window.location.origin}/setting-service/static/printFont/IDAutomationC128S.woff') format('woff'), /* Modern Browsers */
        url('${window.location.origin}/setting-service/static/printFont/IDAutomationC128S.ttf') format('truetype'), /* Safari, Android, iOS */
        url('${window.location.origin}/setting-service/static/printFont/IDAutomationC128S.svg#IDAutomationC128S') format('svg'); /* Legacy iOS */
      }
      .bug-free{background:url('${window.location.origin}/setting-service/printFont/IDAutomationSC39S.eot?#iefix')}
      @font-face {
        font-family: 'IDAutomationSC39S';
        src: url('${window.location.origin}/setting-service/static/printFont/IDAutomationSC39S.eot'); /* IE9 Compat Modes */
        src: url('${window.location.origin}/setting-service/static/printFont/IDAutomationSC39S.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
        url('${window.location.origin}/setting-service/static/printFont/IDAutomationSC39S.ttf') format('truetype');
      }
      </style>
        </head>
        <body>` + this.htmlText() + `
        </body>
        </html>`);
    },
    htmlText () {
      var str = '';
      if (this.printStatus) { // 单个
        str = `
          <div style='width: 210px;margin: 0 auto;text-align: center'>
            <p id='barCode' style='font-family: IDAutomationC128S'>${this.printParams.barcode}</p>
            <p>${this.printParams.warehouseLocationName}</p>
          </div>
          `;
      } else { // 批量
        for (let i = 0; i < this.tableSltData.length; i++) {
          let item = this.tableSltData[i];
          str += `
            <div style='width: 210px;margin: 0 auto;text-align: center'>
              <p id='barCode' style='font-family: IDAutomationC128S'>${item.barcode}</p>
              <p>${item.warehouseLocationName}</p>
            </div>
          `;
        }
      }
      return str;
    },
    getWareAreaGroup (warehouseId) { // 获取库区组下拉
      let v = this;
      let pos = [];
      let params = '';
      if (warehouseId) {
        params = '?warehouseId=' + warehouseId;
      } else {
        params = '?warehouseId=';
      }
      v.axios.get(api.wmsService + api.get_wareAreaGroupList + params).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            data.forEach((n, i) => {
              pos.push(n);
            });
            pos.unshift({
              name: '全部',
              warehouseBlockGroupId: 'null'
            });
            v.wareAreaGroupList = pos;
          }
        }
      });
    }
  }
};
</script>
<style>
.headerBar .ivu-modal-header p,
.headerBar .ivu-modal-header-inner {
  color: #fff;
}

.defaultLocate {
  height: 32px;
  line-height: 32px;
  margin-right: 10px;
}
</style>
