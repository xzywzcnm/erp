<template>
  <dyt-model :modalVisible.sync="modalVisible" @backList="backList" :pageLoading="pageLoading"
    class="inventoryDetailPage">
    <div slot="lefts">
      <h3>
        入库单详情： <span>{{ inWareDetailsDataList.receiptNo }}</span>
      </h3>
    </div>
    <div class="model-content">
      <div class="fmb0">
        <Form label-position="right" :label-width="140">
          <Row>
            <Col span="6">
            <Form-item label="入库单编号：">
              <span>{{ inWareDetailsDataList.receiptNo }}</span>
            </Form-item>
            </Col>
            <Col span="6">
            <Form-item label="入库单类型：">
              <span v-if="inWareTypeList[inWareDetailsDataList.receiptType]">
                {{ inWareTypeList[inWareDetailsDataList.receiptType].label }}
              </span>
              <Icon v-if="inWareDetailsDataList.transitStatus === 1" type="ios-shuffle"
                style="font-size: 20px; color: #2D8CF0; font-weight: bold; position: relative; top: 1px; left: 3px;" />
            </Form-item>
            </Col>
            <Col span="6">
            <Form-item label="入库单状态：">
              <span v-if="inWareDetailsDataList.receiptStatus === '0'">入库单创建</span>
              <span v-if="inWareDetailsDataList.receiptStatus === '1'">入库单取消</span>
              <span v-if="inWareDetailsDataList.receiptStatus === '2'">入库单关闭</span>
              <span v-if="inWareDetailsDataList.receiptStatus === '3'">收货中</span>
            </Form-item>
            </Col>
            <Col span="6">
            <Form-item label="仓库：">
              <span>{{ inWareDetailsDataList.warehouseName }}</span>
            </Form-item>
            </Col>
          </Row>
          <Row>
            <Col span="6">
            <Form-item label="参考编号：">
              <span>{{ inWareDetailsDataList.referenceNo }}</span>
            </Form-item>
            </Col>
            <Col span="6">
            <Form-item label="运费/报关费/其他费用：">
              <span v-if="inWareDetailsDataList.feeFreight !== null &&
                inWareDetailsDataList.feeDeclaration !== null &&
                inWareDetailsDataList.feeOther !== null
                ">
                {{ inWareDetailsDataList.feeFreight }} /
                {{ inWareDetailsDataList.feeDeclaration }} /
                {{ inWareDetailsDataList.feeOther }}
              </span> <span v-else>无</span>
            </Form-item>
            </Col>
            <Col span="6">
            <Form-item label="币种：">
              <span v-if="inWareDetailsDataList.currency === '0'">人民币</span>
              <span v-if="inWareDetailsDataList.currency === '1'">美元</span>
            </Form-item>
            </Col>
          </Row>
          <Row>
            <Col span="6">
            <Form-item label="创建时间：">
              <span>{{ inWareDetailsDataList.createdTime }}</span>
            </Form-item>
            </Col>
            <Col span="6">
            <Form-item label="创建人：">
              <span>{{ inWareDetailsDataList.createdBy }}</span>
            </Form-item>
            </Col>
            <Col span="6">
            <Form-item label="预期到货时间：">
              <p v-if="inWareDetailsDataList.expectedStartTime !== null &&
                inWareDetailsDataList.expectedEndTime !== null
                ">
                <span>{{ inWareDetailsDataList.expectedStartTime }}</span> <span>到</span>
                <span>{{ inWareDetailsDataList.expectedEndTime }}</span>
              </p>
              <p v-else>无</p>
            </Form-item>
            </Col>
            <Col span="6">
            <Form-item label="最后修改时间：">
              <span>{{ inWareDetailsDataList.updatedTime }}</span>
            </Form-item>
            </Col>
          </Row>
          <Row>
            <Col span="6">
            <Form-item label="最后修改人：">
              <span>{{ inWareDetailsDataList.updatedBy }}</span>
            </Form-item>
            </Col>
            <Col span="6">
            <Form-item label="采购员：">
              <span v-if="userInfoList[inWareDetailsDataList.purchaserId]">
                {{ userInfoList[inWareDetailsDataList.purchaserId].name }}
              </span>
            </Form-item>
            </Col>
            <Col span="6">
            <Form-item label="所属事业部：">
              {{
                businessDeptJson[inWareDetailsDataList.businessDeptId] ?
                businessDeptJson[inWareDetailsDataList.businessDeptId].name : inWareDetailsDataList.businessDeptName
              }}
            </Form-item>
            </Col>
            <Col span="6">
            <Form-item label="发出仓库：">
              <span>{{ inWareDetailsDataList.sendWarehouseName }}</span>
            </Form-item>
            </Col>
          </Row>
          <Row>
            <Col span="6">
            <Form-item label="来货特项：">
              <template v-if="inWareDetailsDataList.comingSpecial">
                <span v-for="(item, index) in inWareDetailsDataList.comingSpecial.split(',')" :key="index">
                  <span>
                    {{ index > 0 ? ',' : '' }}
                    {{ productTagList[item] ? productTagList[item].comingSpecial : item }}
                  </span>
                </span>
              </template>
            </Form-item>
            </Col>
            <Col span="6">
            <Form-item label="平台订单号：">
              <span>{{ inWareDetailsDataList.platformOrderNo }}</span>
            </Form-item>
            </Col>
            <Col span="6">
            <Form-item label="是否为质检">
              <span>{{ ['1', '2', 1, 2].includes(inWareDetailsDataList.checkType) ? '是' : '否' }}</span>
            </Form-item>
            </Col>
            <Col>
            <Form-item label="是否为维修">
              <span>{{ [0, 1].includes(inWareDetailsDataList.maintenanceStatus) ? inWareDetailsDataList.maintenanceStatus
                ==
                0 ? '否' : '是' : '-' }}</span>
            </Form-item>
            </Col>
          </Row>
        </Form>
      </div>


      <!-- 000000000000000000000000000000000000000000000000000 -->
      <!-- 收货需质检和收货上架表格 -->
      <div>
        <div class="shopTable">
          <!--表格-->
          <Table highlight-row border :loading="TableLoading" :columns="columns6" :data="data6"></Table>
          <!--分页按钮-->
          <div class="table-page">
            <div class="table-page-right" style="position: relative">
              <Page :total="totalRecords" @on-change="changePage" show-total show-elevator show-sizer
                :page-size="pageParams.pageSize" @on-page-size-change="changePageSize" placement="top"
                :page-size-opts="pageArray"></Page>
            </div>
          </div>
        </div>
      </div>
      <!-- 无源入库表格 -->
      <div v-if="isNoSouceTableShow">
        <div class="dataSort " style="margin-top:60px;">
          <h3>无源入库</h3>
        </div>
        <div class="shopTable">
          <!--表格-->
          <Table highlight-row border :loading="TableLoading" :columns="columns7" :data="data7"></Table>
          <div class="table-page">
            <div class="table-page-right" style="position: relative">
              <Page :total="detailUTotal" :current="pageParams.detailUPageNum" :page-size="pageParams.detailUPageSize"
                show-total show-sizer show-elevator @on-change="changeDtlUPage" @on-page-size-change="changeDtlUPageSize"
                placement="top" :page-size-opts="pageArray"></Page>
            </div>
          </div>
        </div>
      </div>
      <!-- 上架的无源入库表格 -->
      <div v-show="isNoShelfTableShow">
        <div class="dataSort " style="margin-top:60px;">
          <h3>无源入库</h3>
        </div>
        <div class="shopTable">
          <Table highlight-row border :columns="columns10" :loading="TableLoading" :data="data10"
            v-if="notShelfTableStatus"></Table>
        </div>
      </div>
      <!-- 质检的无源入库表格 -->
      <div v-show="isNoQualityTableShow">
        <div class="dataSort " style="margin-top:60px;">
          <h3>无源入库</h3>
        </div>
        <div class="shopTable">
          <Table highlight-row border :columns="columns11" :loading="TableLoading" :data="data11"
            v-if="notQualityTableStatus" ref="selection4"></Table>
        </div>
      </div>
      <!-- 00000000000000000000000000000000000000000000000 -->

      <!-- 收货批次表格 -->
      <div class="dataSort " style="margin-top:60px;">
        <h3>收货记录</h3>
      </div>
      <div class="shopTable" style="margin-bottom:70px;">
        <!--表格-->
        <Table highlight-row border :loading="TableLoading" :columns="batchColumns" :data="batchData"></Table>
        <div class="table-page">
          <div class="table-page-right" style="position: relative">
            <Page :total="batchTableTotal" :current="pageParams.batchPageNum" :page-size="pageParams.batchPageSize"
              show-total show-sizer show-elevator @on-change="changeBatchPage" @on-page-size-change="changeBatchPageSize"
              placement="top" :page-size-opts="pageArray"></Page>
          </div>
        </div>
      </div>
      <!-- 质检记录 -->
      <div class="dataSort " style="margin-top:60px;">
        <h3>
          质检记录
          <Button type="primary" size="small" style="margin-left: 10px" @click="openQcImg">查看质检图片
          </Button>
        </h3>
      </div>
      <div class="shopTable" style="margin-bottom:70px;">
        <!--表格-->
        <Table highlight-row border :columns="CheckQueryColumns" :loading="TableLoading" :data="CheckQueryData"></Table>
        <div class="table-page">
          <div class="table-page-right" style="position: relative">
            <Page :total="CheckQueryTotal" :current="pageParams.CheckQueryPageNum"
              :page-size="pageParams.CheckQueryPageSize" show-total show-sizer show-elevator
              @on-change="changeCheckQueryPage" @on-page-size-change="changeCheckQueryPageSize" placement="top"
              :page-size-opts="pageArray"></Page>
          </div>
        </div>
      </div>
      <!-- 上架记录 -->
      <div class="dataSort " style="margin-top:60px;">
        <h3>上架记录</h3>
      </div>
      <div class="shopTable" style="margin-bottom:70px;">
        <!--表格-->
        <Table highlight-row border :columns="ShelveColumns" :loading="TableLoading" :data="ShelveData"></Table>
        <div class="table-page">
          <div class="table-page-right" style="position: relative">
            <Page :total="ShelveTableTotal" :current="pageParams.ShelvePageNum" :page-size="pageParams.ShelvePageSize"
              show-total show-sizer show-elevator @on-change="changeShelvePage"
              @on-page-size-change="changeShelvePageSize" placement="top" :page-size-opts="pageArray"></Page>
          </div>
        </div>
      </div>
      <div class="dataSort " style="margin-top:60px;">
        <h3>操作日志</h3>
      </div>
      <div class="shopTable">
        <Table border :columns="orderLogColumns" :data="orderLogData" max-height="450" />
      </div>
      <Modal title="质检图片" v-model="qcImgModal" width="800" :mask-closable="false">
        <Card>
          <div v-if="qcImgList.length === 0">
            暂无图片
          </div>
          <div v-else>
            <dyt-previewImg :fileList.sync="qcImgList" :imgOption="{ listWidth: 90, listHeight: 90, mode: 'multiple' }">
            </dyt-previewImg>
          </div>
        </Card>
      </Modal>
    </div>
  </dyt-model>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import { inWareTypeObj } from './receiptType.js';
export default {
  mixins: [Mixin],
  props: {
    dialogObj: {
      type: Object,
      default() {
        return {
          data: {}
        }
      }
    },
    isVisible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      modalVisible: false,
      pageLoading: false,
      TableLoading: false,
      pageArray: [10, 20, 50, 100],
      inWareTypeList: inWareTypeObj(),
      businessDeptJson: {},
      qcImgModal: false,
      qcImgList: [],
      wareId: null,
      isNoSouceTableShow: false, // 无源入库表格隐藏
      needQFlag: 'markQ',
      needSFlag: 'markS',
      checkNum: 0,
      workType: 'shelfFlag', // 默认确认上架添加货品
      locateCheckType: 'checkShelvesP', // 库位选择标记
      notShelfTableStatus: true,
      notQualityTableStatus: true,
      clickIndex: null, // 当前行 库位选择的下标
      receiptWareId: '', // 选择的仓库id
      isNoShelfTableShow: false, // 上架 无源入库表格默认隐藏
      isNoQualityTableShow: false, // 质检 无源入库表格默认隐藏
      pageParams: {
        pageNum: 1,
        pageSize: 100,
        CheckQueryPageNum: 1,
        CheckQueryPageSize: 10,
        ShelvePageNum: 1,
        ShelvePageSize: 10,
        detailUPageNum: 1,
        detailUPageSize: 10,
        batchPageNum: 1,
        batchPageSize: 10,
        addNotes: '' // 添加备注
      },
      totalRecords: 0, // 总条数
      detailUTotal: 0, // 无源入库总条数
      batchTableTotal: 0, // 收货批次分页总条数
      ShelveTableTotal: 0, // 收货批次分页总条数
      CheckQueryTotal: 0, // 收货批次分页总条数
      showLocationModal: false, // 库位选择模态框
      orderLogData: [],
      orderLogColumns: [
        {
          key: "updatedBy",
          title: "操作人", // 操作人
          width: 100,
          // render: (h, params) => {
          //   // let nameInfo = this.userInfoList[params.row.updatedBy] || {};
          //   return h("span", params.row.updatedBy || '');
          // },
        },
        {
          key: "logContentDesc",
          title: "操作内容描述", // 操作内容描述
          minWidth: 230,
          render(h, params) {
            if (params.row.logTypeDesc === "10") {
              return h("span", "备注" + "：" + params.row.logContentDesc);
            } else {
              return h("span", params.row.logContentDesc);
            }
          },
        },
        {
          key: "updatedTime",
          title: "操作时间", // 操作时间
          width: 160,
          align: "center",
          render: (h, params) => {
            return h(
              "div",
              {},
              this.getDataToLocalTime(params.row.updatedTime, "fulltime")
            );
          },
        },
      ],
      columns6: [// 有源入库表格
        {
          type: 'index',
          title: '行号',
          width: 70,
          align: 'center'
        },
        {
          title: '行状态',
          key: 'receiptDetailStatus',
          align: 'center',
          minWidth: 90,
          render: (h, params) => {
            if (params.row.receiptDetailStatus === '0') {
              return h('div', {}, '创建状态');
            } else if (params.row.receiptDetailStatus === '1') {
              return h('div', {}, '部分收货');
            } else if (params.row.receiptDetailStatus === '2') {
              return h('div', {}, '完全收货');
            } else if (params.row.receiptDetailStatus === '3') {
              return h('div', {
                style: {
                  color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
                }
              }, '超量收货');
            }
          }
        },
        {
          title: '图片',
          key: 'goodsUrl',
          align: 'center',
          minWidth: 90,
          render: (h, params) => {
            return this.tableImg(h, params, 'goodsUrl');
          }
        },
        {
          title: 'SKU/条码编码',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('div', [
              h('div', {
                style: {
                  color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
                }
              }, params.row.goodsSku || ''),
              h('div', params.row.barCode || ''),
            ])
            // return h('span', {
            //   style: {
            //     color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
            //   }
            // }, params.row.goodsSku);
          }
        },
        {
          title: 'SKU属性',
          key: 'goodsAttributes',
          align: 'center',
          minWidth: 150,
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.goodsAttributes);
          }
        },
        {
          title: '中英文描述',
          key: 'goodsCnDesc',
          align: 'center',
          minWidth: 150,
          render: (h, params) => {
            return h('div', [
              h('div', {
                style: {
                  color: params.row.receiptDetailStatus === '3' ? '#f00' : '',
                  marginTop: '5px'
                },
                class: 'textOverTwo',
                attrs: { title: params.row.goodsCnDesc }
              }, params.row.goodsCnDesc),
              h('div', {
                style: {
                  color: params.row.receiptDetailStatus === '3' ? '#f00' : '',
                  marginTop: '5px'
                },
                class: 'textOverTwo',
                attrs: { title: params.row.goodsEnDesc }
              }, params.row.goodsEnDesc)
            ]);
          }
        },
        {
          title: '预期数量',
          key: 'expectedNumber',
          align: 'center',
          minWidth: 90,
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.expectedNumber);
          }
        },
        {
          title: '增加数',
          key: 'overshootNumber',
          align: 'center',
          minWidth: 80,
          renderHeader: (h, params) => {
            return h('span', {
              style: { color: '#7CCD7C' },
              attrs: { title: '入库单创建后增加的数量' }
            }, '增加数')
          },
        },
        {
          title: '取消数量',
          key: 'cancelNumber',
          align: 'center',
          minWidth: 90,
          renderHeader: (h, params) => {
            return h('span', {
              style: { color: '#7CCD7C' },
              attrs: { title: '下单后取消的数量，取消数量=取消数+少货数' }
            }, '取消数量')
          },
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.cancelNumber);
          }
        },
        {
          title: '发货数量',
          key: 'despatchNumber',
          align: 'center',
          minWidth: 80,
          renderHeader: (h, params) => {
            return h('span', {
              style: { color: '#7CCD7C' },
              attrs: { title: '已经发货的数量' }
            }, '发货数量')
          },
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.despatchNumber);
          }
        },
        {
          title: '已收货数量', // 已收货数量
          key: 'doneNumber',
          align: 'center',
          minWidth: 90,
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.doneNumber);
          }
        },
        {
          title: '未收货数量',
          key: 'nobatchNumber',
          align: 'center',
          minWidth: 90,
          renderHeader: (h, params) => {
            return h('span', {
              style: { color: '#7CCD7C' },
              attrs: { title: '未收货数量=预期数量+增加数量-取消数量-收货数量' }
            }, '未收货数量')
          },
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.nobatchNumber);
          }
        },
        {
          title: '合格数',
          key: 'qualifiedCheckedNumber',
          align: 'center',
          minWidth: 80,
        },
        {
          title: '问题数',
          key: 'failedCheckedNumber',
          align: 'center',
          minWidth: 80,
        },
        {
          title: '上架数',
          key: 'shelveNumber',
          align: 'center',
          minWidth: 80,
        },

        {
          title: '体积' + '（cm*3）',
          key: 'goodsVolume',
          align: 'center',
          minWidth: 110,
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.goodsVolume);
          }
        },
        {
          title: '重量' + '（g）',
          key: 'goodsWeight',
          align: 'center',
          minWidth: 90,
          render: (h, params) => {
            return h('span', {
              style: {
                color: params.row.receiptDetailStatus === '3' ? '#f00' : ''
              }
            }, params.row.goodsWeight);
          }
        },
        // {
        //   title: '是否免检',
        //   key: 'checkFlag',
        //   align: 'center',
        //   minWidth: 100,
        //   render(h, params) {
        //     return params.row.checkFlag === '0'
        //       ? h('span', {
        //         style: {
        //           color: params.row.receiptDetailStatus === '3'
        //             ? '#f00'
        //             : ''
        //         }
        //       }, 'N')
        //       : h('span', {
        //         style: {
        //           color: params.row.receiptDetailStatus === '3'
        //             ? '#f00'
        //             : ''
        //         }
        //       }, 'Y');
        //   }
        // }
      ],
      data6: [],

      columns7: [// 无源入库表格
        {
          type: 'index',
          title: '行号',
          width: 70,
          align: 'center'
        }, {
          title: '图片',
          key: 'goodsUrl',
          align: 'center',
          minWidth: 100,
          render: (h, params) => {
            return this.tableImg(h, params, 'goodsUrl');
          }
        }, {
          title: 'SKU',
          key: 'goodsSku',
          align: 'center',
          minWidth: 120
        }, {
          title: 'SKU属性',
          key: 'goodsAttributes',
          align: 'center',
          minWidth: 160
        }, {
          title: '中文描述',
          key: 'goodsCnDesc',
          align: 'center',
          minWidth: 160,
          render: (h, params) => {
            return h('Poptip', {
              props: {
                content: params.row.goodsCnDesc,
                trigger: 'hover'
              }
            }, [h('span', {}, params.row.goodsCnDesc)]);
          }
        }, {
          title: '英文描述',
          key: 'goodsEnDesc',
          align: 'center',
          minWidth: 160,
          render: (h, params) => {
            return h('Poptip', {
              props: {
                content: params.row.goodsEnDesc,
                trigger: 'hover'
              }
            }, [h('span', {}, params.row.goodsEnDesc)]);
          }
        }, {
          title: '已收货数量',
          key: 'doneNumber',
          align: 'center',
          minWidth: 80
        }, {
          title: '体积' + '（cm*3）',
          key: 'goodsVolume',
          align: 'center',
          minWidth: 100
        }, {
          title: '重量' + '（g）',
          key: 'goodsWeight',
          align: 'center',
          minWidth: 100
        }, {
          title: '是否免检',
          key: 'checkFlag',
          align: 'center',
          minWidth: 100,
          render(h, params) {
            return params.row.checkFlag === '0' ? 'N' : 'Y';
          }
        }
      ],
      data7: [],
      columns10: [
        {
          type: 'selection',
          width: 60,
          align: 'center',
          fixed: 'left'
        }, {
          type: 'index',
          title: '行号',
          width: 70,
          align: 'center'
        }, {
          title: '图片',
          key: 'goodsUrl',
          align: 'center',
          minWidth: 100,
          render: (h, params) => {
            return this.tableImg(h, params, 'goodsUrl');
          }
        }, {
          title: 'SKU',
          key: 'goodsSku',
          align: 'center',
          minWidth: 120
        }, {
          title: 'SKU属性',
          key: 'goodsAttributes',
          align: 'center',
          minWidth: 160
        }, {
          title: '中文描述',
          key: 'goodsCnDesc',
          align: 'center',
          minWidth: 160,
          render: (h, params) => {
            return h('Poptip', {
              props: {
                content: params.row.goodsCnDesc,
                trigger: 'hover'
              }
            }, [h('span', {}, params.row.goodsCnDesc)]);
          }
        }, {
          title: '英文描述',
          key: 'goodsEnDesc',
          align: 'center',
          minWidth: 160,
          render: (h, params) => {
            return h('Poptip', {
              props: {
                content: params.row.goodsEnDesc,
                trigger: 'hover'
              }
            }, [h('span', {}, params.row.goodsEnDesc)]);
          }
        },
        {
          title: '已收货数量',
          key: 'doneNumber',
          align: 'center',
          minWidth: 80
        },
        {
          title: '本次收货数量',
          key: 'currentbatchNumber',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('div', [
              h('InputNumber', {
                props: {
                  size: 'small',
                  value: params.row.currentbatchNumber ? params.row.currentbatchNumber : 0,
                  min: 0
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  'on-change': value => {
                    params.row.currentbatchNumber = value;
                    self.data10[params.index] = params.row;
                    self.$nextTick(() => {
                      let arr = [];
                      self.$refs.selection3.objData[params.index]._isChecked = false;
                      let data = self.$refs.selection3.objData;
                      for (let key in data) {
                        if (data.hasOwnProperty(key) && data[key]._isChecked) {
                          arr.push(data[key]);
                        }
                      }
                      self.$refs.selection3.$emit('on-selection-change', arr);
                      self.data10[params.index] = params.row;
                    });
                  }
                }
              })
            ]);
          }
        }, {
          title: '收货库位',
          key: 'warehouseLocationName',
          align: 'center',
          minWidth: 250,
          render: (h, params) => {
            return h('div', [
              h('Input', {
                props: {
                  size: 'small',
                  placeholder: '点击查找库位',
                  value: params.row.warehouseLocationName
                },
                style: {
                  width: '60%'
                },
                on: {
                  'on-focus': () => {
                    self.receiptWareId = self.inWareDetailsDataList.warehouseId; // 传仓库id
                    self.showLocationModal = true;
                    self.clickIndex = params.index;
                    self.workType = 'shelfFlag';
                    self.locateCheckType = 'checkShelvesU';
                  }
                }
              }), h('Button', {
                props: {
                  type: 'text',
                  icon: 'md-add'
                },
                style: {
                  color: '#87CEFA'
                },
                on: {
                  click: () => {
                    let obj = JSON.parse(JSON.stringify(self.data10[params.index]));
                    obj.warehouseLocationName = '';
                    obj.warehouseLocationId = '';
                    obj.currentbatchNumber = '';
                    obj.goodsEndDate = '';
                    self.data10.splice(params.index + 1, 0, obj); // 新增库位行
                  }
                }
              }), h('Button', {
                props: {
                  type: 'text',
                  icon: 'md-remove'
                },
                style: {
                  color: '#87CEFA'
                },
                on: {
                  click: () => {
                    self.data10.splice(params.index, 1); // 删除库位行
                  }
                }
              })
            ]);
          }
        }, {
          title: '体积' + '（cm*3）',
          key: 'goodsVolume',
          align: 'center',
          minWidth: 100
        }, {
          title: '重量' + '（g）',
          key: 'goodsWeight',
          align: 'center',
          minWidth: 100
        }, {
          title: '是否免检',
          key: 'checkFlag',
          align: 'center',
          minWidth: 100,
          render(h, params) {
            return params.row.checkFlag === '0' ? 'N' : 'Y';
          }
        }
      ],
      data10: [], // 确认质检的无源入库表格
      columns11: [
        {
          type: 'selection',
          width: 60,
          align: 'center',
          fixed: 'left'
        }, {
          type: 'index',
          title: '行号',
          width: 70,
          align: 'center'
        }, {
          title: '行状态',
          key: 'receiptDetailStatus',
          align: 'center',
          minWidth: 100,
          render: (h, params) => {
            if (params.row.receiptDetailStatus === '0') {
              return h('div', {}, '创建状态');
            } else if (params.row.receiptDetailStatus === '1') {
              return h('div', {}, '部分收货');
            } else if (params.row.receiptDetailStatus === '2') {
              return h('div', {}, '完全收货');
            } else if (params.row.receiptDetailStatus === '3') {
              return h('div', {}, '超量收货');
            }
          }
        }, {
          title: '图片',
          key: 'goodsUrl',
          align: 'center',
          minWidth: 100,
          render: (h, params) => {
            return this.tableImg(h, params, 'goodsUrl');
          }
        }, {
          title: 'SKU',
          key: 'goodsSku',
          align: 'center',
          minWidth: 120
        }, {
          title: 'SKU属性',
          key: 'goodsAttributes',
          align: 'center',
          minWidth: 160
        }, {
          title: '中文描述',
          key: 'goodsCnDesc',
          align: 'center',
          minWidth: 160,
          render: (h, params) => {
            return h('Poptip', {
              props: {
                content: params.row.goodsCnDesc,
                trigger: 'hover'
              }
            }, [h('span', {}, params.row.goodsCnDesc)]);
          }
        }, {
          title: '英文描述',
          key: 'goodsEnDesc',
          align: 'center',
          minWidth: 160,
          render: (h, params) => {
            return h('Poptip', {
              props: {
                content: params.row.goodsEnDesc,
                trigger: 'hover'
              }
            }, [h('span', {}, params.row.goodsEnDesc)]);
          }
        },
        {
          title: '已收货数量',
          key: 'doneNumber',
          align: 'center',
          minWidth: 80
        },
        {
          title: '未收货数量',
          key: 'currentbatchNumber',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('div', [
              h('InputNumber', {
                props: {
                  size: 'small',
                  value: params.row.currentbatchNumber ? params.row.currentbatchNumber : 0,
                  min: 0
                },
                style: {
                  marginRight: '5px'
                },
                on: {
                  'on-change': value => {
                    params.row.currentbatchNumber = value;
                    self.data11[params.index] = params.row;
                    self.$nextTick(() => {
                      let arr = [];
                      self.$refs.selection4.objData[params.index]._isChecked = false;
                      let data = self.$refs.selection4.objData;
                      for (let key in data) {
                        if (data.hasOwnProperty(key) && data[key]._isChecked) {
                          arr.push(data[key]);
                        }
                      }
                      self.$refs.selection4.$emit('on-selection-change', arr);
                      self.data11[params.index] = params.row;
                    });
                  }
                }
              })
            ]);
          }
        }, {
          title: '收货库位',
          key: 'warehouseLocationName',
          align: 'center',
          minWidth: 250,
          render: (h, params) => {
            return h('div', [
              h('Input', {
                props: {
                  size: 'small',
                  placeholder: '点击查找库位',
                  value: params.row.warehouseLocationName
                },
                style: {
                  width: '60%'
                },
                on: {
                  'on-focus': () => {
                    self.receiptWareId = self.inWareDetailsDataList.warehouseId; // 传仓库id
                    self.showLocationModal = true;
                    self.clickIndex = params.index;
                    self.workType = 'qualityFlag';
                    self.locateCheckType = 'checkQualityU';
                  }
                }
              }), h('Button', {
                props: {
                  type: 'text',
                  icon: 'md-add'
                },
                style: {
                  color: '#87CEFA'
                },
                on: {
                  click: () => {
                    let obj = JSON.parse(JSON.stringify(self.data11[params.index]));
                    obj.warehouseLocationName = '';
                    obj.warehouseLocationId = '';
                    obj.currentbatchNumber = '';
                    obj.goodsEndDate = '';
                    self.data11.splice(params.index + 1, 0, obj); // 新增库位行
                  }
                }
              }), h('Button', {
                props: {
                  type: 'text',
                  icon: 'md-remove'
                },
                style: {
                  color: '#87CEFA'
                },
                on: {
                  click: () => {
                    self.data11.splice(params.index, 1); // 删除库位行
                  }
                }
              })
            ]);
          }
        },
        {
          title: '体积' + '（cm*3）',
          key: 'goodsVolume',
          align: 'center',
          minWidth: 100
        }, {
          title: '重量' + '（g）',
          key: 'goodsWeight',
          align: 'center',
          minWidth: 100
        }, {
          title: '是否免检',
          key: 'checkFlag',
          align: 'center',
          minWidth: 100,
          render(h, params) {
            return params.row.checkFlag === '0' ? 'N' : 'Y';
          }
        }
      ],
      data11: [], // 质检记录
      CheckQueryColumns: [
        {
          title: '行号',
          key: 'index',
          align: 'center',
          width: 70,
          render(h, params) {
            return h('span', params.index + 1);
          }
        }, {
          title: '质检记录',
          key: 'receiptBatchCheckDetailNo',
          align: 'center'
        }, {
          title: 'SKU',
          key: 'goodsSku',
          align: 'center'
        }, {
          title: '中文描述',
          key: 'goodsCnDesc',
          align: 'center'
        }, {
          title: '英文描述',
          key: 'goodsEnDesc',
          align: 'center'
        }, {
          title: '本次质检数量',
          key: 'expectedCheckNumber',
          align: 'center',
          width: 120,
          render(h, params) {
            let oldNum = (params.row.oldProblemCheckNumber || 0) - 0;// 重新质检数量
            return h('span', params.row.passCheckNumber + params.row.problemCheckNumber + oldNum);
          }
        }, {
          title: '合格数',
          key: 'passCheckNumber',
          align: 'center',
          width: 90
        }, {
          title: '不合格数',
          key: 'problemCheckNumber',
          align: 'center',
          width: 90
        },
        {
          title: '不良原因',
          key: 'problemCheckReason',
          align: 'center',
          tooltip: true
        },
        {
          title: '备注',
          key: 'remark',
          align: 'center',
          width: 90
        }, {
          title: '质检完成时间',
          key: 'updatedTime',
          align: 'center',
          width: 150,
          render: (h, params) => {
            return h('div', this.getDataToLocalTime(params.row.updatedTime, 'fulltime'));
          }
        }, {
          title: '质检人',
          key: 'checkCreatedByName',
          align: 'center'
        }
      ],
      CheckQueryData: [], // 上架记录
      ShelveColumns: [
        {
          title: '行号',
          key: 'index',
          align: 'center',
          width: 70,
          render(h, params) {
            return h('span', params.index + 1);
          }
        }, {
          title: '上架记录',
          key: 'receiptCheckShelveDetailNo',
          align: 'center'
        }, {
          title: 'SKU',
          key: 'goodsSku',
          align: 'center'
        }, {
          title: '中文描述',
          key: 'goodsCnDesc',
          align: 'center'
        }, {
          title: '英文描述',
          key: 'goodsEnDesc',
          align: 'center'
        }, {
          title: '本次上架数量',
          key: 'shelveNumber',
          align: 'center'
        }, {
          title: '上架库位',
          key: 'warehouseLocationName',
          align: 'center'
        }, {
          title: '备注',
          key: 'remark',
          align: 'center'
        }, {
          title: '上架时间',
          key: 'createdTime',
          align: 'center',
          render: (h, params) => {
            return h('div', this.getDataToLocalTime(params.row.createdTime, 'fulltime'));
          }
        }, {
          title: '上架人',
          key: 'createdBy',
          align: 'center'
        }
      ],
      ShelveData: [], // 添加收货批次号
      batchColumns: [
        {
          title: '批次号',
          key: 'receiptBatchNo',
          align: 'center'
        }, {
          title: '产品SKU',
          key: 'goodsSku',
          align: 'center'
        }, /* {
         title: '产品有效期',
         key: 'goodsEndDate',
         align: 'center'
         }, */
        {
          title: '重量' + '(g)',
          key: 'batchWeight',
          align: 'center'
        }, {
          title: '收货库位',
          key: 'warehouseLocationName',
          align: 'center'
        }, {
          title: '收货时间',
          key: 'createdTime',
          align: 'center',
          render: (h, params) => {
            return h('div', this.getDataToLocalTime(params.row.createdTime, 'fulltime'));
          }
        }, {
          title: '收货数',
          key: 'batchNumber',
          align: 'center'
        }, {
          title: '收货人',
          key: 'createdBy',
          align: 'center'
        }
      ],
      batchData: [], // 收货批次表格数据
      inWareDetailsDataList: {}, // 入库单详情头部数据
      productTagList: {},
      userInfoList: {},
    }
  },
  watch: {
    isVisible: {
      handler(nval) {
        nval && this.open();
      },
      deep: true
    },
    modalVisible: {
      handler(nval) {
        !nval && this.$emit('update:isVisible', nval);
      },
      deep: true
    },
    getBusinessDept: {
      deep: true,
      immediate: true,
      handler(val) {
        this.businessDeptJson = {};
        (val || []).forEach(item => {
          this.$set(this.businessDeptJson, item.id, item);
        })
      }
    }
  },
  computed: {
    getBusinessDept() {
      return this.$store.getters.getBusinessDeptList
    },
  },
  methods: {
    backList() {
      this.modalVisible = false;
    },
    // 窗口打开
    open() {
      this.modalVisible = true;
      this.searchData();
      this.getUserList();
      this.getComingSpecialList();
    },
    // 获取来货特项列表
    getComingSpecialList() {
      this.$store.dispatch('getComingSpecialList').then(list => {
        let temp = {};
        (list || []).forEach(k => {
          temp[k.comingSpecialId] = k;
        })
        this.productTagList = temp;
      })
    },
    openQcImg() {
      this.qcImgModal = true;
    },
    getUserList() {
      this.axios.get(api.userList).then((res) => {
        if (res.data.code == 0) {
          let arr = [];
          let datas = res.data.datas;
          for (let i in datas) {
            if (i != "service") {
              arr.push({
                id: i,
                name: datas[i].userName,
              });
            }
          }
          this.userInfoList = this.$common.arrayToObj(arr, 'id');
        }
      });
    },
    // 页面查询函数
    searchData() {
      var v = this;
      var obj = {
        receiptNo: v.dialogObj.data, // 入库单编号
        receiptDetailPQueryParam: {
          pageNum: v.pageParams.pageNum,
          pageSize: v.pageParams.pageSize
        },
        receiptDetailUQueryParam: {
          pageNum: v.pageParams.detailUPageNum,
          pageSize: v.pageParams.detailUPageSize
        },
        receiptBatchQueryParam: {
          pageNum: v.pageParams.batchPageNum,
          pageSize: v.pageParams.batchPageSize
        },
        receiptBatchCheckQueryParam: {
          // 质检记录
          pageNum: v.pageParams.CheckQueryPageNum,
          pageSize: v.pageParams.CheckQueryPageSize
        },
        receiptShelveQueryParam: {
          // 上架记录
          pageNum: v.pageParams.ShelvePageNum,
          pageSize: v.pageParams.ShelvePageSize
        }
      };
      v.TableLoading = true;
      v.axios.post('/sps-service/erpCommon/wms-service/wmsReceipt/detail', obj).then(res => {
        if (res.data.code === 0) {
          // console.log(res.data.datas)
          let receipt = res.data.datas.receipt || {};
          v.inWareDetailsDataList = v.processObjTime(receipt, ['createdTime', 'updatedTime']); // 入库单详情头部信息
          v.data6 = res.data.datas.receiptDetailPPage.list;
          v.data7 = res.data.datas.receiptDetailUPage.list; // 无源入库表格数据
          if (v.data7.length !== 0) {
            v.isNoSouceTableShow = true;
          } else {
            v.isNoSouceTableShow = false;
          }
          v.batchData = res.data.datas.receiptBatchPage.list; // 收货批次
          v.CheckQueryData = res.data.datas.receiptBatchCheckPage ? res.data.datas.receiptBatchCheckPage.list : [];
          v.ShelveData = res.data.datas.receiptShelvePage ? res.data.datas.receiptShelvePage.list : [];
          v.CheckQueryTotal = res.data.datas.receiptBatchCheckPage ? res.data.datas.receiptBatchCheckPage.total : 0;
          v.ShelveTableTotal = res.data.datas.receiptShelvePage ? res.data.datas.receiptShelvePage.total : 0;
          if (v.CheckQueryData && v.CheckQueryData.length > 0) {
            v.CheckQueryData.forEach(i => {
              try {
                let obj = JSON.parse(i.checkAttachment);
                v.qcImgList.push(...obj);
              } catch (e) {
                if (i.checkAttachment) {
                  v.qcImgList.push(...i.checkAttachment.split(','));
                }
              }
            });
            v.qcImgList = v.qcImgList.map(k => {
              return { url: k }
            })
          }
          v.batchTableTotal = res.data.datas.receiptBatchPage.total;
          if (this.needSFlag === 'markS') {
            v.data10 = res.data.datas.receiptDetailUPage.list;
          }
          if (this.needQFlag === 'markQ') {
            v.data11 = res.data.datas.receiptDetailUPage.list;
          }
          v.detailUTotal = res.data.datas.receiptDetailUPage.total;
          v.isNoQualityTableShow = false;
          v.isNoShelfTableShow = false;
          v.totalRecords = res.data.datas.receiptDetailPPage.total;
          v.orderLogData = res.data.datas.receiptLog; // 备注信息
        }
      }).finally(() => {
        v.TableLoading = false;
      })
    },
    processObjTime(obj, paramsList) {
      paramsList.forEach(val => {
        if (obj[val]) obj[val] = this.dealTime(obj[val]);
      });
      return obj;
    },
    dealTime(time) {
      if (!time) return '';
      // time为世界时间
      let gmtTimeMs = new Date(time).getTime();
      let localTime = gmtTimeMs + +(localStorage.getItem('timezoom') || 8) * 60 * 60 * 1000;
      // 转时间格式
      let returnLocalTime = this.getDateTime(localTime, 'fulltime');
      return returnLocalTime;
    },
    // 有源入库表格分页
    changePage(page) {
      this.pageParams.pageNum = page;
      this.searchData();
    },
    // 有源入库切换每页条数
    changePageSize(size) {
      this.pageParams.pageSize = size;
      this.searchData();
    }, // 无源入库表格分页
    changeDtlUPage(page) {
      this.pageParams.detailUPageNum = page;
      this.searchData();
    }, // 无源入库切换每页条数
    changeDtlUPageSize(size) {
      this.pageParams.detailUPageSize = size;
      this.searchData();
    }, // 收货批次表格分页
    changeBatchPage(page) {
      this.pageParams.batchPageNum = page;
      this.searchData();
    }, // 收货批次表格切换每页条数
    changeBatchPageSize(size) {
      this.pageParams.batchPageSize = size;
      this.searchData();
    }, // 质检记录表格切换每页条数
    changeCheckQueryPage(page) {
      this.pageParams.CheckQueryPageNum = page;
      this.searchData();
    }, // 质检记录表格切换每页条数
    changeCheckQueryPageSize(size) {
      this.pageParams.CheckQueryPageSize = size;
      this.searchData();
    }, // 上架记录表格切换每页条数
    changeShelvePage(page) {
      this.pageParams.ShelvePageNum = page;
      this.searchData();
    }, // 上架记录表格切换每页条数
    changeShelvePageSize(size) {
      this.pageParams.ShelvePageSize = size;
      this.searchData();
    },
    // 返回列表按钮
    backPage() {
      this.$emit('backPage', 'list');
    },
  }
}
</script>
<style lang="less">
.inventoryDetailPage {
  .fmb0 {
    padding: 20px 0;

    .ivu-form-item {
      margin-bottom: 0;
    }
  }
}
</style>