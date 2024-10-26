<template>
  <div>
    <div class="usersFilter">
      <div class="card-container ">
        <div class="card-content">
          <div class="platformParamsSelect">
            <Form ref="pageParams" :model="pageParams" :label-width="labelWidth">
              <dyt-filter :filter-row="1">
                <!--库区状态按钮组-->
                <Form-item label="库区状态：">
                  <dyt-select v-model="pageParams.wareStatusFlag">
                    <Option
                      v-for="(item, cIndex) in wareStatusFlagList"
                      :value="item.value"
                      :key="`${cIndex}-${item.value}`"
                    >{{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <!--库区类型按钮组-->
                <Form-item label="库区类型：">
                  <dyt-select v-model="pageParams.wareAreaFlag">
                    <template v-for="(item, cIndex) in wareAreaFlagList">
                      <Option
                        :value="item.value"
                        v-if="item.value != 20"
                        :key="`${cIndex}-${item.value}`"
                      >{{ item.label }}</Option>
                    </template>
                  </dyt-select>
                </Form-item>
                <Form-item label="仓库：">
                  <dyt-select
                    v-model="pageParams.warehouseId"
                    filterable
                    clearable
                    @on-change="getWareAreaGroup"><Option
                    v-for="(item, cIndex) in wareHouseTypeList"
                    :value="item.warehouseId"
                    :key="`${cIndex}-${item.warehouseId}`"
                  >{{ item.warehouseName }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="库区代码/名称：">
                  <Input placeholder="输入库区代码/名称" v-model.trim="pageParams.searchWareArea"></Input>
                </Form-item>
                <Form-item label="库区组：">
                  <dyt-select v-model="pageParams.warehouseBlockGroupId" filterable>
                    <Option
                      v-for="(item, kIndex) in wareAreaGroupList"
                      :value="item.warehouseBlockGroupId"
                      :key="`${kIndex}-${item.warehouseBlockGroupId}`"
                    >{{ item.name }}</Option></dyt-select>
                </Form-item>
                <div slot="operation">
                  <Button
                  v-if="getPermission('wmsWarehouseBlock_list')"
                  type="primary"
                  @click="wareBlockSearch"
                  :disabled="SearchDisabled"
                  icon="md-search">查询 </Button>
                  <Button style="marginLeft:10px;" @click="resetSearch" v-once icon="md-refresh">重置</Button>
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
    </div>

    <div class='fr' style='margin-right: 10px'>

    </div>
    <!--新建库区按钮-->
    <div class="addBinding" style="display: flex;">
      <div style="flex: 100;">
        <Button
          type="primary"
          icon="plus-round"
          style="margin-right: 5px;"
          v-if="getPermission('wmsWarehouseBlock_create')"
          @click="createWareBlockBtn">新建库区 </Button>
        <Button
          type="primary"
          style="margin-right: 5px;"
          v-if="getPermission('wmsWarehouseBlockGroup_query')"
          @click="maintenanceGroup">库区组维护 </Button>

        <Dropdown style="margin-right: 5px;" @on-click="batchHandel">
          <Button>
            批量操作
            <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem name="0" v-if="getPermission('wmsWarehouseBlock_modify_batch')">批量修改库区
            </DropdownItem>
            <DropdownItem name="1" v-if="getPermission('wmsWarehouseLocation_printTag')">批量打印库位标签
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Dropdown style="margin-right: 5px;" @on-click='exportAllOrSlt' v-if="getPermission('wmsWarehouseBlock_exportWarehouseBlock')">
          <Button type="default" icon='log-in'>导出 </Button>
          <DropdownMenu slot="list">
            <DropdownItem name='0'>导出选中数据</DropdownItem>
            <DropdownItem name='1'>导出所有结果集</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Button
          type="default"
          @click='openInportModal'
          v-if="getPermission('wmsWarehouseBlock_importWarehouseBlock')">导入 </Button>
      </div>
      <!--按SortID 或 按库区状态排序-->
      <div class="dataSort grayBg" style="display: inline-block;background: none;border: none;padding: 0;margin: 0;">
        <span>排序方式：</span>
        <Button-group>
          <Button
            :type="item.checked?'primary':'default'"
            v-for='(item, pIndex) in sortData'
            @click='clickSortButton(item)'
            :key="`${pIndex}-${item.value}`"
          >{{ item.label }}
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
    <!-- 新建库区模态框 -->
    <div v-if="addWareBlockModal">
      <Modal v-model="addWareBlockModal" :styles="{top: '80px',width:'520px'}" class="headerBar">
        <p slot="header">
          <span>{{ addNewWareAreaTitle }}</span>
        </p>
        <div>
          <wareAreaModal
            ref='addNewBlockFlag'
            @createSuccess="createSuccess"
            @createFail="createFail"
            :editType="'edit'"
            :wareAreaModalStatus='addStatus'></wareAreaModal>
        </div>
        <div slot="footer">
          <Button type="primary" @click="addNewWareAreaBtn">确定新增 </Button>
          <Button @click="cancelAddBtn">取消</Button>
        </div>
      </Modal>
    </div>
    <!-- 查看和编辑库区模态框 -->
    <Modal
      v-model="editWareBlockModal"
      :styles="{top: '80px',width:'520px'}"
      class="headerBar"
      @on-cancel="cancelEditBtn">
      <p slot="header">
        <span>{{ editType === 'look' ? '查看' : '编辑' }}</span>
      </p>
      <div>
        <wareAreaModal
          ref='editBlockFlag'
          @editSuccess="editSuccess"
          @editFail="editFail"
          :wareId='rowWareId'
          :wareBlockId='wareBlockId'
          :openFlag='$store.state.wareAreaWatchFlag'
          :curSingleDtl='curSingleDtl'
          :editType="editType"
          :wareAreaModalStatus='editStatus'></wareAreaModal>
      </div>
      <div slot="footer">
        <Button type="primary" v-if="editType === 'edit'" @click="editWareAreaBtn">确定编辑 </Button>
        <Button @click="cancelEditBtn">取消</Button>
      </div>
    </Modal>
    <!-- 导入 -->
    <Modal
      v-model="switchInportModal"
      v-if="importModalStatus"
      title="导入库区"
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
          导入已经存在的库区时：
          <RadioGroup v-model="updateIgnore">
            <Radio label="0">覆盖</Radio>
            <Radio label="1">忽略</Radio>
          </RadioGroup>
        </div>
      </div>
    </Modal>
    <!-- 库区组维护 -->
    <Modal v-model="groupModal" v-if="groupModalStatus" :styles="{top: '80px',width:'620px'}">
      <p slot="header">
        <span>库区组</span>
      </p>
      <div>
        <div style="marginBottom:20px;">
          <span>仓库：</span> <dyt-select
          v-model="groupWarehouseId" style="width: 240px;marginLeft:45px;" filterable clearable><Option
          v-for="(item, index) in wareHouseIdList"
          :value="item.warehouseId"
          :key="`${index}${item.warehouseId}`"
          style="width:220px;">{{ item.warehouseName }}</Option>
          </dyt-select>
        </div>
        <span>库区组名称：</span> <Input v-model.trim="wareAreaGroupName" style="width: 240px;marginLeft:10px;"></Input>
        <Button
          style="marginLeft:10px;"
          v-if="getPermission('wmsWarehouseBlockGroup_save')"
          @click="addWareAreaGroup">新增 </Button>
      </div>
      <div style="marginTop: 30px;">
        <h3>库区组</h3>
        <Divider/>
        <Table highlight-row border max-height="450" :columns="wareAreaGroupColumns" :data="wareAreaGroupData"></Table>
      </div>
      <p slot="footer"></p>
    </Modal>
    <!-- 更新库区组 -->
    <Modal v-model="updateModal" title="编辑库区组名称" v-if="updateModalStatus" @on-ok="updateOK">
      <div style="margin: 20px;fontSize: 14px;">
        <span>编辑库区组名称：</span> <Input
        v-model.trim="editWareAreaGroupName" style="width: 240px;marginLeft:10px;"></Input>
      </div>
    </Modal>
    <!-- 确认删除 -->
    <Modal v-model="delModal" title="删除" v-if="delModalStatus" @on-ok="delOK">
      <div style="margin: 20px;fontSize: 14px;">
        <p>确认删除?</p>
      </div>
    </Modal>
    <!--批量修改-->
    <Modal v-model="modal1" title="批量修改库区" width="1000">
      <Table highlight-row border max-height="500" :columns="columns1" :data="data1"></Table>
      <div slot="footer">
        <Button @click="batchEdit" type="primary">保存 </Button>
        <Button @click="modal1 = false">关闭</Button>
      </div>
    </Modal>
    <!--打印-->
    <Modal v-model='selectSizeModal' title="打印" width="1000" @on-visible-change="openPrintBox">
      <div>
        <printBox ref="printBox" localStorageName="PRINT_wareArea"></printBox>
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
        <Button @click='selectSizeModal = false'>取消</Button>
        <Button type='primary' :loading="printLoading" @click='okPrint'>确定 </Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import printBox from '@/components/common/newPrint';
import wareAreaModal from './wareAreaModal';
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import print_mixin from '@/components/mixin/print_mixin';
// import { getToken } from '@/utils/cookie';

export default {
  mixins: [Mixin, print_mixin],
  components: {
    wareAreaModal,
    printBox
  },
  data () {
    let self = this;
    return {
      tableHeight: 500,
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: '库区名称',
          key: 'warehouseBlockName',
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
      selectSizeModal: false,
      updateIgnore: '0',
      editType: 'look',
      modal1: false,
      columns1: [
        {
          type: 'index',
          title: '序号',
          width: 80,
          align: 'center'
        }, {
          title: '库区代码',
          key: 'warehouseBlockCode',
          width: 120,
          align: 'center'
        }, {
          title: '库区名称',
          key: 'name',
          align: 'center',
          renderHeader (h, params) {
            return h('div', {}, [
              h('span', '库区名称'), h('Input', {
                props: {
                  value: self.wareAreaName,
                  size: 'small'
                },
                on: {
                  'on-change': (e) => {
                    self.data1.forEach((i, index) => {
                      let an = index > 0 ? index : '';
                      i.warehouseBlockName = e.target.value + an;
                    });
                  }
                }
              })
            ]);
          },
          render (h, params) {
            return h('Input', {
              props: {
                value: self.data1[params.index].warehouseBlockName,
                size: 'small'
              },
              on: {
                'on-change': (e) => {
                  self.data1[params.index].warehouseBlockName = e.target.value;
                }
              }
            });
          }
        }, {
          title: '所属仓库',
          align: 'center',
          key: 'warehouseName'
        }, {
          title: '库区类型',
          align: 'center',
          renderHeader (h, params) {
            return h('div', {}, [
              h('span', '库区类型'), h('Select', {
                props: {
                  value: self.warehouseBlockType,
                  size: 'small',
                  transfer: true
                },
                on: {
                  'on-change' (e) {
                  }
                }
              }, self.wareAreaTypeList.map(i => {
                return h('Option', {
                  props: {
                    value: i.value
                  },
                  nativeOn: {
                    'click' () {
                      self.warehouseBlockType = '';
                      self.data1.forEach(j => {
                        j.warehouseBlockType = i.value;
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
                value: self.data1[params.index].warehouseBlockType,
                transfer: true,
                size: 'small'
              },
              on: {
                'on-change' (e) {
                  self.data1[params.index].warehouseBlockType = e;
                }
              }
            }, self.wareAreaTypeList.map(i => {
              return h('Option', {
                props: {
                  value: i.value
                }
              }, i.label);
            }));
          }
        }, {
          title: '状态',
          align: 'center',
          renderHeader (h, params) {
            return h('div', {}, [
              h('span', '状态'), h('Select', {
                props: {
                  value: self.warehouseBlockStatus,
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
                      self.warehouseBlockStatus = '';
                      self.data1.forEach(j => {
                        j.warehouseBlockStatus = i.value;
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
                value: self.data1[params.index].warehouseBlockStatus,
                transfer: true,
                size: 'small'
              },
              on: {
                'on-change' (e) {
                  self.data1[params.index].warehouseBlockStatus = e;
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
          title: '拣货优先级',
          align: 'center',
          renderHeader (h, params) {
            return h('div', {}, [
              h('span', '拣货优先级'), h('InputNumber', {
                props: {
                  value: self.sortId == '' ? null : self.sortId,
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
                value: self.data1[params.index].sortId == '' ? null : self.data1[params.index].sortId,
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
        }, {
          align: 'center',
          renderHeader (h, params) {
            return h('div', {}, [
              h('span', '库区组'), h('Select', {
                props: {
                  value: self.warehouseBlockGroupId,
                  size: 'small',
                  transfer: true
                },
                on: {
                  'on-change' (e) {
                  }
                }
              }, self.wareAreaGroupEditList.map(i => {
                return h('Option', {
                  props: {
                    value: i.warehouseBlockGroupId
                  },
                  nativeOn: {
                    'click' () {
                      self.warehouseBlockGroupId = '';
                      self.data1.forEach(j => {
                        j.warehouseBlockGroupId = i.warehouseBlockGroupId;
                      });
                    }
                  }
                }, i.name);
              }))
            ]);
          },
          render (h, params) {
            return h('Select', {
              props: {
                value: self.data1[params.index].warehouseBlockGroupId,
                transfer: true,
                size: 'small'
              },
              on: {
                'on-change' (e) {
                  self.data1[params.index].warehouseBlockGroupId = e;
                }
              }
            }, self.wareAreaGroupEditList.map(i => {
              return h('Option', {
                props: {
                  value: i.warehouseBlockGroupId
                }
              }, i.name);
            }));
          }
        }
      ],
      wareAreaTypeList: [
        {
          label: '收货区',
          value: '00'
        }, {
          label: '标准区',
          value: '10'
        }, {
          label: '良品区',
          value: '11'
        }, {
          label: '不良品区',
          value: '12'
        }
      ],
      data1: [],
      filenodeViewTargetUrl: self.$store.state.erpConfig.filenodeViewTargetUrl, // filenode根路径
      switchInportModal: false,
      loading: false,
      rowWareId: '', // 编辑当前行的仓库ID
      wareBlockId: '', // 编辑当前行的库区ID
      curSingleDtl: {}, // 查看当前行的库区信息
      cacheClickVal: 'CT', // 排序缓存值
      // 库区状态选择
      wareStatusFlagList: [
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
      ], // 库区类型选择
      wareAreaFlagList: [
        {
          label: '全部',
          value: '*',
          checked: true
        }, {
          label: '收货区',
          value: '00',
          checked: false
        }, {
          label: '标准区',
          value: '10',
          checked: false
        }, {
          label: '良品区',
          value: '11',
          checked: false
        }, {
          label: '不良品区',
          value: '12',
          checked: false
        }, {
          label: '退货区',
          value: '20',
          checked: false
        }, {
          label: '异常处理库区',
          value: '30',
          checked: false
        }
      ], // 选择仓库
      wareHouseTypeList: [
        {
          warehouseId: 'null',
          warehouseName: '全部'
        }
      ],
      wareHouseIdList: [], // 库区组新增所属仓库Id
      // 排序的数据
      sortData: [
        {
          label: '按创建时间',
          value: 'CT',
          checked: true,
          toogle: true
        }, {
          label: '按库区代码',
          value: 'WC',
          checked: false,
          toogle: true
        }, {
          label: '按库区状态',
          value: 'WS',
          checked: false,
          toogle: true
        }
      ],
      pageParams: {
        warehouseId: 'null',
        wareStatusFlag: '*', // 库区状态
        wareAreaFlag: '*', // 库区类型
        DESC: 'DESC', // 降序
        CT: 'CT', // 排序的标记
        searchWareArea: '', // 搜索库区名称
        warehouseBlockGroupId: 'null', // 库区组
        pageNum: 1,
        pageSize: 20
      },
      addNewWareAreaTitle: '新建库区',
      editWareAreaTitle: '查看和编辑库区',
      addWareBlockModal: false, // 新增库区的模态框
      editWareBlockModal: false, // 编辑库区的模态框
      totalRecords: 0, // 总条数
      columns6: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          type: 'index',
          title: '序号',
          width: 65,
          align: 'center'
        }, {
          title: '拣货优先级',
          key: 'sortId',
          width: 100,
          align: 'center'
        }, {
          title: '库区代码',
          key: 'warehouseBlockCode',
          width: 120,
          align: 'center'
        }, {
          title: '库区名称',
          key: 'warehouseBlockName',
          width: 120,
          align: 'center'
        }, {
          title: '状态',
          key: 'warehouseBlockStatus',
          align: 'center',
          width: 120,
          render: (h, params) => {
            return params.row.warehouseBlockStatus === '0' ? h('span', {
              class: 'openStatus'
            }, '可用') : h('span', {
              class: 'stopStatus'
            }, '停用');
          }
        }, {
          title: '仓库',
          key: 'warehouseName',
          width: 120,
          align: 'center'
        }, {
          title: '库区类型',
          key: 'warehouseBlockType',
          align: 'center',
          width: 120,
          render: (h, params) => {
            if (params.row.warehouseBlockType === '00') {
              return h('p', '收货区');
            } else if (params.row.warehouseBlockType === '10') {
              return h('p', '标准区');
            } else if (params.row.warehouseBlockType === '11') {
              return h('p', '良品区');
            } else if (params.row.warehouseBlockType === '12') {
              return h('p', '不良品区');
            } else if (params.row.warehouseBlockType === '20') {
              return h('p', '退货区');
            } else if (params.row.warehouseBlockType === '30') {
              return h('p', '异常处理库区');
            }
          }
        }, {
          title: '库区组',
          key: 'warehouseBlockGroupName',
          align: 'center',
          minWidth: 80,
          render: (h, params) => {
            // let str = null;
            // if (params.row.warehouseBlockGroupId) {
            //   this.wareAreaGroupList.forEach((n, i) => {
            //     if (n.warehouseBlockGroupId === params.row.warehouseBlockGroupId) {
            //       str = n.name;
            //     }
            //   });
            //   return h('div', str);
            // }
            return h('div', params.row.warehouseBlockGroupName);
          }
        }, {
          title: '绑定分类',
          key: 'productCategoryIdList',
          align: 'center',
          minWidth: 160,
          render (h, params) {
            if (params.row.productCategoryIdList && self.$store.state.productCategoryList) {
              let name = params.row.productCategoryIdList.map(i => {
                let item = self.$store.state.productCategoryList.filter(j => i === j.productCategoryId);
                if (item.length > 0) {
                  return item[0].cnName;
                }
              });
              let datas = name.filter((i, index) => {
                if (index < 3) {
                  return i;
                }
              });
              return h('div', {}, [
                ...datas.map(i => {
                  return h('span', i + '；');
                }), name.length <= 3 || h('Poptip', {
                  props: {
                    trigger: 'hover',
                    title: '绑定分类',
                    width: 300,
                    wordWrap: true,
                    transfer: true,
                    content: name.map(i => i).join('；')
                  }
                }, [
                  h('Icon', {
                    props: {
                      type: 'ios-more',
                      size: 22
                    }
                  })
                ])
              ]);
            }
          }
        }, {
          title: '创建时间',
          key: 'createdTime',
          align: 'center',
          minWidth: 120
        }, {
          title: '操作',
          key: 'action',
          align: 'center',
          width: 200,
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
                      return self.getPermission('wmsWarehouseBlock_examine') ? 'line-block' : 'none';
                    })()
                  },
                  on: {
                    click: () => {
                      self.editType = 'look';
                      self.rowWareId = params.row.warehouseId; // 编辑当前行的仓库ID
                      self.wareBlockId = params.row.warehouseBlockId; // 编辑当前行的库区ID
                      self.curSingleDtl = params.row;
                      self.$refs.editBlockFlag.disabledStatus = true;
                      self.$nextTick(() => {
                        self.$store.commit('wareAreaWatchFlag', true);
                        self.editWareBlockModal = true;
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
                      return self.getPermission('wmsWarehouseBlock_modify') ? 'line-block' : 'none';
                    })()
                  },
                  on: {
                    click: () => {
                      self.editType = 'edit';
                      self.rowWareId = params.row.warehouseId; // 编辑当前行的仓库ID
                      self.wareBlockId = params.row.warehouseBlockId; // 编辑当前行的库区ID
                      self.curSingleDtl = params.row;
                      self.$refs.editBlockFlag.disabledStatus = true;
                      self.$nextTick(() => {
                        self.$store.commit('wareAreaWatchFlag', true);
                        self.editWareBlockModal = true;
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
                    click () {
                      params.row.printNumber = 1;
                      self.printData = [params.row];
                      self.selectSizeModal = true;
                    }
                  }
                }, '打印库区标签')
              ]);
            }
          }
        }
      ],
      wareAreaName: '',
      warehouseBlockType: '',
      warehouseBlockStatus: '',
      sortId: '',
      warehouseBlockGroupId: '',
      warehouseStatus: '',
      data6: [],
      tableSltData: [],
      importUrl: api.wmsService + api.importWarehouseBlock,
      editStatus: 'edit',
      addStatus: 'add',
      importModalLoading: true,
      confirmUpload: false,
      importModalStatus: false,
      file: null,
      templateTypes: '6',
      warehouseStatusList: [
        {
          label: '可用',
          value: '0'
        }, {
          label: '停用',
          value: '1'
        }
      ],
      wareAreaGroupEditList: [],
      wareAreaGroupList: [
        {
          name: '全部',
          warehouseBlockGroupId: 'null'
        }
      ],
      groupModal: false,
      groupModalStatus: false,
      wareAreaGroupName: null,
      groupWarehouseId: null,
      wareAreaGroupColumns: [
        {
          title: '序号',
          key: 'index',
          align: 'center',
          width: 70,
          render: (h, params) => {
            return h('div', params.index + 1);
          }
        }, {
          title: '仓库',
          key: 'warehouseId',
          align: 'center',
          render: (h, params) => {
            let pos = null;
            if (this.wareHouseIdList) {
              this.wareHouseIdList.forEach((n, i) => {
                if (params.row.warehouseId === n.warehouseId) {
                  pos = n.warehouseName;
                }
              });
              return h('div', pos);
            }
          }
        }, {
          title: '库区组',
          key: 'name',
          align: 'center',
          render: (h, params) => {
            return h('div', params.row.name);
          }
        }, {
          title: '操作',
          key: 'action',
          align: 'center',
          width: 100,
          render: (h, params) => {
            return h('div', [
              h('span', {
                style: {
                  color: '#3cb034',
                  cursor: 'pointer',
                  display: (() => {
                    return this.getPermission('wmsWarehouseBlockGroup_update') ? 'inline-block' : 'none';
                  })()
                },
                on: {
                  click: () => {
                    this.editGroup(params.row.warehouseBlockGroupId, params.row.name);
                  }
                }
              }, '编辑'), h('span', {
                style: {
                  color: '#FF0000',
                  cursor: 'pointer',
                  marginLeft: '10px',
                  display: (() => {
                    return this.getPermission('wmsWarehouseBlockGroup_delete') ? 'inline-block' : 'none';
                  })()
                },
                on: {
                  click: () => {
                    this.delGroup(params.row.warehouseBlockGroupId);
                  }
                }
              }, '删除')
            ]);
            // return h('span', {
            //   style: {
            //     color: '#FF0000',
            //     cursor: 'pointer'
            //   },
            //   on: {
            //     click: () => {
            //       this.delGroup(params.row.warehouseBlockGroupId);
            //     }
            //   }
            // }, '删除');
          }
        }
      ],
      wareAreaGroupData: [],
      delModal: false, // 删除确认
      delModalStatus: false,
      delGroupId: null, // 删除库区组参数ID
      updateModal: false,
      updateModalStatus: false,
      editWareAreaGroupName: null,
      updateGroupId: null // 更新库区组名称参数ID
    };
  },
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
    v.getPermissionCallback('logistics_wareArea').then(() => {
      v.getProductCategoryListMt().then(() => {
        this.searchData();
        this.getWareHouseName(); // 调用仓库下拉列表
        this.getWareAreaGroup(); // 获取库区组下拉
      });
    });
  },
  methods: {
    resetSearch () {
      this.pageParams = {
        warehouseId: 'null',
        wareStatusFlag: '*', // 库区状态
        wareAreaFlag: '*', // 库区类型
        searchWareArea: '', // 搜索库区名称
        warehouseBlockGroupId: 'null' // 库区组
      }
      this.getWareAreaGroup('null')
    },
    openPrintBox () {
      this.getBar('warehouseBlockName').then(() => {
        // 设置哪些值展示
        this.$refs.printBox.onSetPrintView().then(data => {
          data.forEach(i => {
            if (i.IdName === 'PRINT_011') {
              i.show = 1;
              i.settingShow = true;
            }
          });
        });
        // 设置打印初始展示值
        this.$refs.printBox.setInitData(JSON.parse(JSON.stringify(this.printData[0])));
      });
    },
    okPrint () {
      let v = this;
      v.$refs.printBox.onPrint(v.printData);
    },
    batchEdit () {
      let v = this;
      let valid1 = false;
      v.data1.forEach(i => {
        if (!i.warehouseBlockName) {
          valid1 = true;
        }
      });
      if (valid1) {
        v.$Message.error('库区名称不能为空');
        return;
      }
      v.axios.post(api.blockBatchModify, v.data1).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.modal1 = false;
          v.wareBlockSearch();
        }
      });
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
    tableSelectionChange (selection) {
      this.tableSltData = selection;
    },
    exportFn (obj) {
      let newTab = window.open('about:blank');
      let v = this;
      this.axios.post(api.wmsService + api.exportWarehouseBlock, obj).then(res => {
        if (res.data.code === 0) {
          let erpCommon = v.$store.state.erpConfig;
          newTab.location.href = '/wms-service/' + erpCommon.filenodeViewTargetUrl.replace('./', '') + res.data.datas;
          setTimeout(function () {
            newTab.close();
          }, 2000);
          this.$Message.success('导出成功');
        } else {
          newTab.close();
          this.$Message.warning({
            content: res.data.message,
            duration: 5
          });
        }
      });
    },
    batchHandel (name) {
      if (name === '0') {
        if (this.tableSltData.length > 0) {
          let arr = [...new Set(this.tableSltData.map(i => i.warehouseId))];
          if (arr.length > 1) {
            this.$Message.warning('只能批量修改一个仓库的数据');
            return;
          }
          this.wareAreaName = '';
          this.warehouseBlockType = '';
          this.warehouseBlockStatus = '';
          this.sortId = '';
          this.warehouseBlockGroupId = '';
          this.modal1 = true;
          this.wareAreaGroupEditList = this.wareAreaGroupList.filter(i => {
            if (i.warehouseId && i.warehouseId === this.tableSltData[0].warehouseId) {
              return i;
            }
          });
          this.data1 = JSON.parse(JSON.stringify(this.tableSltData));
        } else {
          this.$Message.warning('未选择数据');
        }
      } else if (name === '1') {
        // 批量打印
        if (this.tableSltData.length > 0) {
          this.printData = this.tableSltData.map(i => {
            i.printNumber = 1;
            return i;
          });
          this.selectSizeModal = true;
        } else {
          this.$Message.warning('未选择数据');
        }
      }
    }, // 导出
    exportAllOrSlt (name) {
      let obj = this.getParamsObj();
      if (name === '0') {
        // 选中
        if (this.tableSltData.length === 0) {
          this.$Message.warning('请选择导出数据');
          return;
        }
        obj.warehouseBlockCodes = this.tableSltData.map(val => val.warehouseBlockCode);
        obj.warehouseBlockIds = this.tableSltData.map(val => val.warehouseBlockId);
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
      var v = this;
      var paramsObj = {
        pageNum: this.pageParams.pageNum,
        pageSize: this.pageParams.pageSize,
        orderSeq: this.pageParams.DESC,
        orderBy: this.pageParams.CT,
        warehouseId: this.pageParams.warehouseId !== 'null' ? this.pageParams.warehouseId : null,
        warehouseBlockGroupId: this.pageParams.warehouseBlockGroupId !== 'null'
          ? this.pageParams.warehouseBlockGroupId
          : ''
      };
      if (v.pageParams.wareStatusFlag !== '*') paramsObj.warehouseBlockStatus = v.pageParams.wareStatusFlag; // 库区状态
      if (v.pageParams.wareAreaFlag !== '*') paramsObj.warehouseBlockTypeList = [v.pageParams.wareAreaFlag]; // 库区类型
      if (v.pageParams.searchWareArea) paramsObj.warehouseBlockIdOrName = v.pageParams.searchWareArea; // 输入库区ID/名称
      return paramsObj;
    }, // 查询数据
    searchData () {
      let v = this;
      if (!v.getPermission('wmsWarehouseBlock_list')) return;
      let paramsObj = this.getParamsObj();
      if (paramsObj.warehouseId === 'null') {
        paramsObj.warehouseId = null;
      }
      v.axios.post(api.wmsService + api.wareAreaSearchData, paramsObj).then(res => {
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
    wareBlockSearch () {
      this.pageParams.pageNum = 1; // 页码重置为1
      this.searchData();
    }, // 点击排序的按钮
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
    }, // 新建库区按钮
    addNewWareAreaBtn () {
      this.$refs.addNewBlockFlag.addNewWareArea();
    }, // 取消新增库区按钮
    cancelAddBtn () {
      var v = this;
      v.addWareBlockModal = false;
      v.$Message.info('取消新增库区' + '！');
      v.$refs.addNewBlockFlag.resetNewWareArea(); // 取消之后，重置表单
    }, // 新增库区成功
    createSuccess () {
      var v = this;
      v.addWareBlockModal = false;
      v.$refs.addNewBlockFlag.resetNewWareArea(); // 新增成功之后，重置表单
      v.searchData();
    }, // 新增库区失败
    createFail () {
      this.addWareBlockModal = true;
    }, // 编辑库区按钮
    editWareAreaBtn () {
      this.$refs.editBlockFlag.editOrWatchWareBlock();
    }, // 取消编辑库区按钮
    cancelEditBtn () {
      var v = this;
      v.editWareBlockModal = false;
      v.$store.commit('wareAreaWatchFlag', false);
      v.$Message.info('取消编辑库区' + '！');
    }, // 编辑库区成功
    editSuccess () {
      var v = this;
      v.editWareBlockModal = false;
      v.$store.commit('wareAreaWatchFlag', false);
      v.searchData();
    }, // 编辑库区失败
    editFail () {
      this.editWareBlockModal = true;
    },
    // 获取仓库下拉列表
    getWareHouseName () {
      var v = this;
      v.axios.get(api.wmsService + api.query_warehouse + '?time=' + new Date().getTime()).then(res => {
        if (res.data.code === 0) {
          // v.wareHouseTypeList = res.data.datas;
          v.wareHouseIdList = res.data.datas;
          let data = res.data.datas;
          data.forEach((n, i) => {
            v.wareHouseTypeList.push(n);
          });
        }
      });
    }, // 表格分页
    changePage (page) {
      var v = this;
      v.pageParams.pageNum = page;
      v.searchData();
    }, // 切换每页条数
    changePageSize (size) {
      var v = this;
      v.pageParams.pageSize = size;
      v.searchData();
    }, // 新建库区按钮
    createWareBlockBtn () {
      var v = this;
      v.$nextTick(function () {
        v.editType = 'edit';
        v.addWareBlockModal = true;
      });
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
          window.open(api.wmsService + this.filenodeViewTargetUrl + data[0].templateUrl, '_self');
        } else {
          this.$Message.warning({
            content: res.data.message,
            duration: 5
          });
        }
      });
    },

    getWareAreaGroup (warehouseId) { // 获取库区组下拉
      let v = this;
      let pos = [];
      let params = '';
      if (warehouseId && warehouseId !== 'null') {
        params = '?warehouseId=' + warehouseId;
      } else {
        params = '?warehouseId=';
      }

      v.axios.get(api.wmsService + api.get_wareAreaGroupList + params).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            v.wareAreaGroupData = this.$common.copy(data);
            data.forEach((n, i) => {
              pos.push(n);
            });
            pos.unshift({
              name: '全部',
              warehouseBlockGroupId: 'null'
            });
            v.wareAreaGroupList = this.$common.copy(pos);
          } else {
            v.wareAreaGroupData = [
              {
                name: '全部',
                warehouseBlockGroupId: 'null'
              }
            ];
          }
        }
      });
    },
    maintenanceGroup () { // 库区组维护
      let v = this;
      v.groupModal = true;
      v.groupModalStatus = true;
    },
    delGroup (id) { // 删除库区组
      let v = this;
      v.delModal = true;
      v.delModalStatus = true;
      v.delGroupId = id;
    },
    addWareAreaGroup () { // 新增库区组
      let v = this;
      if (!v.groupWarehouseId) {
        v.$Message.error('请选择仓库');
      } else if (!v.wareAreaGroupName) {
        v.$Message.error('库区组名称不能为空');
      } else {
        v.axios.post(api.wmsService + api.add_wareAreaGroup + '?name=' + v.wareAreaGroupName + '&warehouseId=' + v.groupWarehouseId).then(response => {
          if (response.data.code === 0) {
            v.getWareAreaGroup();
            v.$refs.editBlockFlag.getWareAreaGroup();
            v.wareAreaGroupName = null;
            v.groupWarehouseId = null;
            v.$Message.success('操作成功');
          }
        });
      }
    },
    delOK () { // 确认删除
      let v = this;
      v.axios.delete(api.wmsService + api.del_wareAreaGroup + '?warehouseBlockGroupId=' + v.delGroupId).then(response => {
        if (response.data.code === 0) {
          v.getWareAreaGroup();
          v.$refs.editBlockFlag.getWareAreaGroup();
          v.$Message.success('操作成功');
        }
      });
    },
    editGroup (id, name) { // 编辑库区组名称
      let v = this;
      v.updateModal = true;
      v.updateModalStatus = true;
      v.updateGroupId = id;
      v.editWareAreaGroupName = name;
    },
    updateOK () { // 更新库区组名称
      let v = this;
      if (!v.editWareAreaGroupName) {
        v.$Message.error('库区组名称不能为空');
        return false;
      }
      let obj = {
        name: v.editWareAreaGroupName,
        warehouseBlockGroupId: v.updateGroupId
      };
      v.axios.put(api.wmsService + api.put_wareAreaGroupName, obj).then(response => {
        if (response.data.code === 0) {
          // v.getWareAreaGroup();
          v.$refs.editBlockFlag.getWareAreaGroup();
          v.$Message.success('操作成功');
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
</style>
