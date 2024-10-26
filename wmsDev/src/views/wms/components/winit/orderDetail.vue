<template >
  <div class="stockOutDlt" >
    <!--返回-->
    <div >
      <!-- <h3> -->
      <Icon type="ios-arrow-back" ></Icon >
      <!-- <a href="javascript:;" style='color:#657180' @click='backList'>返回列表</a> -->
      <a @click="backList" >返回列表</a >
      <!-- </h3> -->
    </div>
    <div style="background-color: #fff;margin-bottom: 20px;text-align: center;">
      <div style="font-size: 14px;padding: 10px 0">
        <h4>出库单详情:{{ mainInfo.num }}</h4>
      </div>
      <div :style="`width: 800px;margin: 0 auto;height: 74px;`">
        <Steps :current="currentStatus">
          <Step title="等待下单"
                icon="md-cart"
                :content="detailApiObj.createdTime ? $uDate.getDataToLocalTime(detailApiObj.createdTime, 'fulltime') : ''"></Step>
          <!--已创建-->
          <Step title="下单成功"
                icon="md-cash"
                :content="detailApiObj.trackingNumberTime ? $uDate.getDataToLocalTime(detailApiObj.trackingNumberTime, 'fulltime') : ''"></Step><!--已配货-->
          <Step title="已发货"  :content="currentIconStatus.despatchTime ? $uDate.getDataToLocalTime(currentIconStatus.despatchTime, 'fulltime') : ''" icon="md-car"></Step><!--已上传物流商-->
        </Steps>
      </div>
    </div>
    <div style="background-color: #fff">
      <Tabs value="main">
        <TabPane label="主信息" name="main">
          <Form :label-width="100">
            <Row>
              <Col span="6">
                <FormItem label="出库单编号：">
                  <!--<Input v-model.trim="mainInfo.num" placeholder="" style='width: 220px' :disabled='true'></Input>-->
                  <span >{{ mainInfo.num }}</span >
                </FormItem >
              </Col >
              <Col span="6" >
                <FormItem label="出库单类型：" >
                  <!--<Select v-model="mainInfo.type" style='width: 220px' :disabled='true'>-->
                  <!--<Option value="*">全部</Option>-->
                  <!--<Option v-for="item in outListTypeList" :value="item.value"-->
                  <!--:key="item.value">-->
                  <!--{{ item.label }}-->
                  <!--</Option>-->
                  <!--</Select>-->
                  <span >{{ outWareLable }}</span >
                </FormItem >
              </Col >
              <Col span="6" v-if="workType === 'otherStock'" >
                <FormItem label="出库单状态：" >
                  <span >{{
                    mainInfo.status === '0'
                      ? '订单创建'
                      : mainInfo.status === '1'
                      ? '部分分配'
                      : mainInfo.status === '2'
                      ? '分配完成'
                      : mainInfo.status === '3'
                      ? '部分发货'
                      : mainInfo.status === '4'
                      ? '完全发货'
                      : mainInfo.status === '5'
                      ? '订单完成'
                      : ''
                  }}</span >
                </FormItem >
              </Col >
            </Row >
            <Row >
              <Col span="6" >
                <FormItem label="发货仓库：" >
                  <!--<Input v-model.trim="mainInfo.ware" placeholder="" style='width: 220px' :disabled='true'></Input>-->
                  <span >{{ mainInfo.ware }}</span >
                </FormItem >
              </Col >
              <!--其他出库显示参考编号-->
              <Col span="6" v-if="workType === 'otherStock'" >
                <FormItem label="参考编号：" >
                  <!--<Input v-model.trim="mainInfo.referenceNum" placeholder="" style='width: 220px' :disabled='true'></Input>-->
                  <span >{{ mainInfo.referenceNum }}</span > <span style="marginLeft:10px;" >{{
                    mainInfo.shipmentID
                  }}</span >
                </FormItem >
              </Col >
              <!--销售出库显示订单号-->
              <Col span="6" v-if="workType !== 'otherStock'" >
                <FormItem label="订单号：" >
                  <!--<Input v-model.trim="mainInfo.orderNos" placeholder="" style='width: 220px' :disabled='true'></Input>-->
                  <!-- <span>{{mainInfo.orderNos}}</span> -->
                  <template
                      v-if="mainInfo.packageOrderBoList.length" v-for="(item, index) in mainInfo.packageOrderBoList" >
                    <span v-if="item.accountCode" :key="index" >{{
                      item.accountCode + '-' + item.salesRecordNumber
                    }}</span > <span v-else :key="index" >{{
                      item.salesRecordNumber
                    }}</span >
                  </template >
                </FormItem >
              </Col >
              <Col span="6" v-if="workType === 'otherStock'" >
                <FormItem label="拣货状态：" >
                  <span >{{
                    mainInfo.pickingGoodsStatus === '0'
                      ? '未拣货'
                      : mainInfo.pickingGoodsStatus === '1'
                      ? '已拣货'
                      : ''
                  }}</span >
                </FormItem >
              </Col >
            </Row >
            <Row >
              <Col span="6" >
                <FormItem label="创建时间：" >
                  <!--<Input v-model.trim="mainInfo.createTime" placeholder="" style='width: 220px' :disabled='true'></Input>-->
                  <span >{{ mainInfo.createTime }}</span >
                </FormItem >
              </Col >
              <Col span="6" >
                <FormItem label="创建人：" >
                  <!--<Input v-model.trim="mainInfo.creator" placeholder="" style='width: 220px' :disabled='true'></Input>-->
                  <span >{{ mainInfo.createdBy }}</span >
                </FormItem >
              </Col >
              <Col span="6" v-if="workType === 'otherStock' && detailApiObj.needBox === 1" >
                <FormItem label="装箱状态：" >
                  <span >{{
                    mainInfo.boxStatus === 0
                      ? '未装箱'
                      : mainInfo.boxStatus === 2
                      ? '已装箱'
                      : ''
                  }}</span >
                </FormItem >
              </Col >
            </Row >
            <Row >
              <Col span="6" >
                <FormItem label="最后修改时间：" >
                  <!--<Input v-model.trim="mainInfo.lastModifyTime" placeholder="" style='width: 220px' :disabled='true'></Input>-->
                  <span >{{ mainInfo.lastModifyTime }}</span >
                </FormItem >
              </Col >
              <Col span="6" >
                <FormItem label="最后修改人：" >
                  <!--<Input v-model.trim="mainInfo.updateName" placeholder="" style='width: 220px' :disabled='true'></Input>-->
                  <span >{{ mainInfo.updatedBy }}</span >
                </FormItem >
              </Col >
            </Row >
          </Form >
        </TabPane >
        <TabPane label="收货人信息" name="receiver" >
          <Form :label-width="100" >
            <Row >
              <Col span="6" >
                <FormItem label="收货人名称：" >
                  <!--<Input v-model.trim="receiver.receiverName" placeholder="" style='width: 220px' :disabled='true'></Input>-->
                  <span >{{ receiver.buyerName }}</span >
                </FormItem >
              </Col >
              <Col span="6" >
                <FormItem label="国家：" >
                  <!--<Input v-model.trim="receiver.country" placeholder="" style='width: 220px' :disabled='true'></Input>-->
                  <span >{{ receiver.country }}</span >
                </FormItem >
              </Col >
            </Row >
            <Row >
              <Col span="6" >
                <FormItem label="联系人：" >
                  <!--<Input v-model.trim="receiver.linkman" placeholder="" style='width: 220px' :disabled='true'></Input>-->
                  <span >{{ receiver.linkman }}</span >
                </FormItem >
              </Col >
              <Col span="6" >
                <FormItem label="省/州：" >
                  <!--<Input v-model.trim="receiver.region" placeholder="" style='width: 220px' :disabled='true'></Input>-->
                  <span >{{ receiver.region }}</span >
                </FormItem >
              </Col >
            </Row >
            <Row >
              <Col span="6" >
                <FormItem label="固定电话：" >
                  <!--<Input v-model.trim="receiver.tel" placeholder="" style='width: 220px' :disabled='true'></Input>-->
                  <span >{{ receiver.tel }}</span >
                </FormItem >
              </Col >
              <Col span="6" >
                <FormItem label="城市：" >
                  <!--<Input v-model.trim="receiver.city" placeholder="" style='width: 220px' :disabled='true'></Input>-->
                  <span >{{ receiver.city }}</span >
                </FormItem >
              </Col >
              <Col span="6" >
                <FormItem label="邮箱：" >
                  <span >{{ receiver.email }}</span >
                </FormItem >
              </Col >
            </Row >
            <Row >
              <Col span="6" >
                <!--<FormItem label="邮箱：">-->
                <!--<Input v-model.trim="receiver.email" placeholder="" style='width: 220px' :disabled='true'></Input>-->
                <!--</FormItem>-->
                <FormItem label="详细地址1：" >
                  <!--<Input v-model.trim="receiver.address" placeholder="" style='width: 220px' :disabled='true'></Input>-->
                  <span >{{ receiver.address }}</span >
                </FormItem >
              </Col >
              <Col span="6" >
                <FormItem label="详细地址2：" >
                  <!--<Input v-model.trim="receiver.consigneeAddressOther" placeholder="" style='width: 220px' :disabled='true'></Input>-->
                  <span >{{ receiver.consigneeAddressOther }}</span >
                </FormItem >
              </Col >
              <Col span="6" >
                <FormItem label="邮政编码：" >
                  <!--<Input v-model.trim="receiver.postalcode" placeholder="" style='width: 220px' :disabled='true'></Input>-->
                  <span >{{ receiver.postalcode }}</span >
                </FormItem >
              </Col >
            </Row >
          </Form >
        </TabPane >
        <TabPane label="物流商信息" name="logistic" >
          <Form :label-width="100" >
            <Row >
              <Col span="6" >
                <FormItem label="物流商：" >
                  <!--<Input v-model.trim="logister.logisticDealer" placeholder="" style='width: 220px' :disabled='true'></Input>-->
                  <span >{{ logister.logisticDealer }}</span >
                </FormItem >
              </Col >
              <Col span="6" >
                <FormItem label="物流商单号：" >
                  <!--<Input v-model.trim="logister.logisticNum" placeholder="" style='width: 220px' :disabled='true'></Input>-->
                  <span >{{ logister.logisticNum }}</span >
                </FormItem >
              </Col >
            </Row >
            <Row >
              <Col span="6" >
                <FormItem label="邮寄方式：" >
                  <!--<Input v-model.trim="logister.sendType" placeholder="" style='width: 220px' :disabled='true'></Input>-->
                  <span >{{ logister.sendType }}</span >
                </FormItem >
              </Col >
              <Col span="6" >
                <FormItem label="运单号：" >
                  <!--<Input v-model.trim="logister.trackingNum" placeholder="" style='width: 220px' :disabled='true'></Input>-->
                  <span >{{logister.trackingNum}}</span >
                </FormItem >
              </Col >
            </Row >
            <!-- <Row>
                            <Col span="6">
                                <FormItem label="联系人："  v-if='this.workType === "otherStock"'>
                                    &lt;!&ndash;<Input v-model.trim="logister.linkman" placeholder="" style='width: 220px' :disabled='true'></Input>&ndash;&gt;
                                    <span>{{logister.linkman}}</span>
                                </FormItem>
                            </Col>
                            <Col span="6">
                                <FormItem label="固定电话："  v-if='this.workType === "otherStock"'>
                                    &lt;!&ndash;<Input v-model.trim="logister.tel" placeholder="" style='width: 220px' :disabled='true'></Input>&ndash;&gt;
                                    <span>{{logister.tel}}</span>
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span="6">
                                <FormItem label="邮箱："  v-if='this.workType === "otherStock"'>
                                    &lt;!&ndash;<Input v-model.trim="logister.email" placeholder="" style='width: 220px' :disabled='true'></Input>&ndash;&gt;
                                    <span>{{logister.email}}</span>
                                </FormItem>
                            </Col>
                        </Row>-->
          </Form >
        </TabPane >
      </Tabs >
    </div >
    <div class="clear p20" >
      <Button
          class="fr" type="primary" v-if="
          ttStatus !== '下单成功' &&
            detailApiObj.trackingNumberStatus !== '3' &&
            getPermission('wmsPicking_createLog')
        " @click="uploadWinitOnePackage" >下单</Button >
    </div >
    <Table :columns="columns1" :data="deliveryListData" @on-selection-change="sltTableItemFn" ></Table >
    <!-- 操作日志 -->
    <optionDaily
        :operationLog="optionNoteData"
        @showNoteFunc="showNoteFunc"
        from="outStock"
        :params="{ pickingId, relatedBusinessNo: mainInfo.num }"
        @addSuccessBack="addSuccessBack"
        :falgType="falgType" ></optionDaily >
  </div >
</template>
<script>
import wareLocateSlt from '../exWarehouse/wareLocateSlt';
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import optionDaily from '@/views/wms/components/common/commonDaily';
// import { getToken } from '@/utils/cookie';

export default {
  components: {
    wareLocateSlt,
    optionDaily
  },
  props: ['pickingNo', 'workType', 'packageId', 'ttStatus'],
  mixins: [Mixin],
  created () {
    this.getCountrys();
    this.searchData();
    // 清空store的otherStockInfo，这个数据在库存调拨存，这里需要清掉
    this.$store.commit('otherStockInfo', null);
  },
  data () {
    var v = this;
    return {
      downloadName: '0',
      uploadData: {
        pickingId: null
      },
      uploadPath: api.set_uploadPickingExcel,
      boxLoading: true,
      boxDataList: [], //  装箱 参数 start
      boxColumn: [],
      boxCacheColumn: [
        {
          title: '箱内物品',
          minWidth: 100,
          key: 'title',
          combine: true,
          render: (h, params) => {
            if (params.index !== v.boxDataList.length - 1) {
              const obj = {
                childrens: [
                  [
                    'div', {
                      class: 'd-flex justify-content-center normalTop'
                    }, params.row.goodsSku
                  ], [
                    'div', {
                      class: 'd-flex justify-content-center normalTop'
                    }, params.row.goodsCnDesc
                  ]
                ],
                props: {}
              };
              obj.props = 1;
              return obj;
            } else if (params.index === v.boxDataList.length - 1) {
              let pos = 0;
              v.boxDataList.forEach((n, i) => {
                if (i < v.boxDataList.length - 1) {
                  pos += n.expectedNumber;
                }
              });
              let value = '总数量' + '：' + pos;
              const obj = {
                childrens: [
                  [
                    'div', {
                      class: 'd-flex justify-content-end'
                    }, value
                  ]
                ],
                props: {}
              };
              obj.props.colSpan = 2;
              return obj;
            }
          }
        }, {
          title: '货件数量',
          minWidth: 120,
          key: 'expectedNumber',
          render: (h, params) => {
            if (params.index !== v.boxDataList.length - 1) {
              return h('span', params.row.expectedNumber);
            } else if (params.index === v.boxDataList.length - 1) {
              return h('span', '123');
            }
          }
        }, {
          title: '已装箱数量',
          minWidth: 120,
          fixed: 'right',
          render: (h, params) => {
            if (v.getBoxedNum(params.index, params.row) > params.row.notAssignedNumber || v.getBoxedNum(params.index, params.row) < params.row.notAssignedNumber) {
              return h('span', {
                style: {
                  color: '#F00',
                  fontWight: 'bold'
                }
              }, v.getBoxedNum(params.index, params.row) + '(装箱数量必须等于货件数量)');
            } else {
              return h('span', v.getBoxedNum(params.index, params.row));
            }
          }
        }
      ],
      boxData: [],
      boxTypeStatus: false,
      boxType: '1',
      boxNum: 1,
      showBoxNum: 1,
      encasementWebModel: false,
      encasementWebStatus: false,
      encasementMethodsModel: null,
      encasementStatus: false,
      encasementModel: true, // 装箱参数 End
      falgType: 'otherStockOut',
      currentIconStatus: {},
      addOrEdit: '',
      productId: '',
      batchTotal: 0,
      pageParams: {},
      objSku: '',
      cacheOptionNoteData: [], // 缓存留言信息以便过滤
      pickingId: '', // 新增留言需要带的参数
      sltTableItem: [], // 表格选择的数据
      wareId: '',
      clickIndex: 0,
      outListStatusList: [
        {
          label: '订单创建',
          value: '0'
        }, {
          label: '分配完成',
          value: '2'
        }, {
          label: '部分分配',
          value: '1'
        }, {
          label: '完成发货',
          value: '4'
        }, {
          label: '订单完成',
          value: '5'
        }
      ],
      outListTypeList: [
        {
          label: '销售出库',
          value: 'S1'
        }, {
          label: '其他出库',
          value: 'O3'
        }, {
          label: '调拨出库',
          value: 'O1'
        }, {
          label: '组装加工',
          value: 'O2'
        }
      ],
      mainInfo: {
        num: '', // 出库单编号
        type: '', // 出库单类型
        status: '', // 出库单状态
        ware: '', // 发货仓库(中文)
        referenceNum: '', // 参考编号
        shipmentID: '',
        createTime: '', // 创建时间
        creator: '', // 创建人
        lastModifyTime: '', // 最后修改时间
        lastModifyPerson: '', // 最后修改人
        orderNos: '',
        boxStatus: '',
        packageOrderBoList: [],
        pickingGoodsStatus: '' // 拣货状态
      },
      receiver: {
        receiverName: '', // 收货人名称
        country: '', // 国家
        linkman: '', // 联系人
        region: '', // 省/洲
        tel: '', // 联系电话
        city: '', // 城市
        address: '', // 详细地址
        consigneeAddressOther: '',
        email: '', // 邮箱
        postalcode: '' // 邮政编码
      },
      logister: {
        logisticDealer: '', // 物流商
        logisticNum: '', // 物流商单号
        sendType: '', // 邮寄方式
        trackingNum: '', // 跟踪号
        linkman: '', // 联系人
        tel: '', // 联系电话
        email: '' // 邮箱
      },
      columns1: [
        {
          title: '行号',
          align: 'center',
          render (h, params) {
            return h('span', params.index + 1);
          }
        }, {
          title: '产品图片',
          key: 'b',
          align: 'center',
          render: (h, params) => {
            return h('img', {
              attrs: {
                src: params.row.goodsUrl
                     ? v.$store.state.imgUrlPrefix + params.row.goodsUrl
                     : require('../../../../../public/static/images/placeholder.jpg')
              },
              style: {
                width: '60px',
                height: '60px'
              }
            });
          }
        }, {
          title: '产品sku',
          align: 'center',
          key: 'goodsSku'
        }, {
          title: '中文描述',
          align: 'center',
          key: 'goodsCnDesc',
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
          align: 'center',
          key: 'goodsEnDesc',
          render: (h, params) => {
            return h('Poptip', {
              props: {
                content: params.row.goodsEnDesc,
                trigger: 'hover'
              }
            }, [h('span', {}, params.row.goodsEnDesc)]);
          }
        }, {
          title: '订单数量',
          align: 'center',
          key: 'expectedNumber'
        }, {
          title: '重量' + '(g)',
          align: 'center',
          key: 'goodsWeight'
        }
      ],
      deliveryListData: [],
      showLocationModal: false, // 库位模态框
      columns2: [
        {
          title: '行号',
          width: 90,
          align: 'center',
          render: (h, params) => {
            return h('span', params.index + 1);
          }
        }, {
          title: '产品sku',
          align: 'center',
          key: 'goodsSku'
        }, {
          title: '中文描述',
          align: 'center',
          key: 'goodsCnDesc',
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
          align: 'center',
          key: 'goodsEnDesc',
          render: (h, params) => {
            return h('Poptip', {
              props: {
                content: params.row.goodsEnDesc,
                trigger: 'hover'
              }
            }, [h('span', {}, params.row.goodsEnDesc)]);
          }
        }, {
          title: '分配批次',
          align: 'center',
          key: 'receiptBatchNo'
        }, {
          title: '分配库位',
          align: 'center',
          key: 'warehouseLocationName'
        }, {
          title: '分配数量',
          align: 'center',
          key: 'batchNumber'
        }, {
          title: '分配完成时间',
          align: 'center',
          key: 'createdTime'
        }, {
          title: '操作人',
          align: 'center',
          key: 'createdBy'
        }
      ],
      data2: [],
      openEditStatus: false,
      declareOpt: {
        title: '操作',
        align: 'center',
        key: '',
        render: (h, params) => {
          return h('div', {}, [
            h('span', {
              on: {
                click: () => {
                  v.dataDeclare.splice(params.index + 1, 0, {
                    goodsNameCn: '',
                    goodsNameEn: '',
                    unitPrice: '',
                    unitWeight: '',
                    quantity: '',
                    hsCode: '',
                    declareCurrency: ''
                  });
                  v.openEditStatus = true;
                }
              },
              style: {
                display: params.index === v.dataDeclare.length - 1 && v.openEditStatus ? 'inline-block' : 'none'
              }
            }, [
              h('Icon', {
                props: {
                  type: 'plus-circled'
                },
                style: {
                  marginRight: '10px',
                  fontSize: '20px',
                  cursor: 'pointer'
                }
              })
            ]), h('span', {
              on: {
                click: () => {
                  v.dataDeclare.splice(params.index, 1);
                }
              },
              style: {
                display: v.openEditStatus ? 'inline-block' : 'none'
              }
            }, [
              h('Icon', {
                props: {
                  type: 'minus-circled'
                },
                style: {
                  fontSize: '20px',
                  cursor: 'pointer'
                }
              })
            ])
          ]);
        }
      },
      columnsDeclare: [
        {
          title: '中文申报名',
          align: 'center',
          key: '',
          render: (h, params) => {
            return h('div', {}, [
              h('Input', {
                props: {
                  value: params.row.goodsNameCn
                },
                style: {
                  width: '90px',
                  display: v.openEditStatus ? 'block' : 'none',
                  margin: '0 auto'
                },
                on: {
                  'on-change' (val) {
                    params.row.goodsNameCn = val.target.value;
                    v.dataDeclare[params.index] = params.row;
                  }
                }
              }), h('span', {
                style: {
                  display: !v.openEditStatus ? 'block' : 'none'
                }
              }, params.row.goodsNameCn)
            ]);
          }
        }, {
          title: '英文申报名',
          align: 'center',
          key: '',
          render: (h, params) => {
            return h('div', {}, [
              h('Input', {
                props: {
                  value: params.row.goodsNameEn
                },
                style: {
                  width: '90px',
                  display: v.openEditStatus ? 'block' : 'none',
                  margin: '0 auto'
                },
                on: {
                  'on-change' (val) {
                    params.row.goodsNameEn = val.target.value;
                    v.dataDeclare[params.index] = params.row;
                  }
                }
              }), h('span', {
                style: {
                  display: !v.openEditStatus ? 'block' : 'none'
                }
              }, params.row.goodsNameEn)
            ]);
          }
        }, {
          title: '申报价值',
          align: 'center',
          key: '',
          render: (h, params) => {
            return h('div', {}, [
              h('InputNumber', {
                props: {
                  value: params.row.unitPrice
                },
                style: {
                  width: '90px',
                  display: v.openEditStatus ? 'block' : 'none',
                  margin: '0 auto'
                },
                on: {
                  'on-change' (val) {
                    params.row.unitPrice = val;
                    v.dataDeclare[params.index] = params.row;
                  }
                }
              }), h('span', {
                style: {
                  display: !v.openEditStatus ? 'block' : 'none'
                }
              }, params.row.unitPrice)
            ]);
          }
        }, {
          title: '币种',
          align: 'center',
          key: '',
          render: (h, params) => {
            // eslint-disable-next-line no-sequences
            return ('div', {}, [
              h('Select', {
                props: {
                  size: 'small',
                  value: params.row.declareCurrency,
                  transfer: true
                },
                style: {
                  display: v.openEditStatus ? 'block' : 'none'
                },
                on: {
                  'on-change' (val) {
                    params.row.declareCurrency = val;
                    v.dataDeclare[params.index] = params.row;
                  }
                }
              }, [
                h('Option', {
                  props: {
                    key: params.index,
                    value: 'USD'
                  }
                }, 'USD')
              ]), h('span', {
                style: {
                  display: !v.openEditStatus ? 'block' : 'none'
                }
              }, params.row.declareCurrency)
            ]);
          }
        }, {
          title: '申报重量',
          align: 'center',
          key: '',
          render: (h, params) => {
            return h('div', {}, [
              h('InputNumber', {
                props: {
                  value: params.row.unitWeight
                },
                style: {
                  width: '90px',
                  margin: '0 auto',
                  display: v.openEditStatus ? 'block' : 'none'
                },
                on: {
                  'on-change' (val) {
                    params.row.unitWeight = val;
                    v.dataDeclare[params.index] = params.row;
                    //											console.log(v.dataDeclare);
                  }
                }
              }), h('span', {
                style: {
                  display: !v.openEditStatus ? 'block' : 'none'
                }
              }, params.row.unitWeight)
            ]);
          }
        }, {
          title: '申报数量',
          align: 'center',
          key: '',
          render: (h, params) => {
            return h('div', {}, [
              h('InputNumber', {
                props: {
                  value: params.row.quantity
                },
                style: {
                  width: '90px',
                  margin: '0 auto',
                  display: v.openEditStatus ? 'block' : 'none'
                },
                on: {
                  'on-change' (val) {
                    params.row.quantity = val;
                    v.dataDeclare[params.index] = params.row;
                    // console.log(v.dataDeclare);
                  }
                }
              }), h('span', {
                style: {
                  display: !v.openEditStatus ? 'block' : 'none'
                }
              }, params.row.quantity)
            ]);
          }
        }, {
          title: '海关编码',
          align: 'center',
          key: '',
          render: (h, params) => {
            return h('div', {}, [
              h('Input', {
                props: {
                  value: params.row.hsCode
                },
                style: {
                  width: '90px',
                  display: v.openEditStatus ? 'block' : 'none',
                  margin: '0 auto'
                },
                on: {
                  'on-change' (val) {
                    params.row.hsCode = val.target.value;
                    v.dataDeclare[params.index] = params.row;
                  }
                }
              }), h('span', {
                style: {
                  display: !v.openEditStatus ? 'block' : 'none'
                }
              }, params.row.hsCode)
            ]);
          }
        }
      ], // 申报信息表头
      //                dataDeclare:[{goodsNameEn:123,goodsNameCn:54545,quantity:6768,unitWeight:2222222,unitPrice:32242}], // 申报信息数据
      dataDeclare: [], // 申报信息数据
      assignListShow: true,
      assignListShowBox: true,
      showNotes: true,
      addNotesInput: '',
      optionNoteData: [],
      detailApiObj: '',
      ruleMainInfo: {}, // 装箱信息
      userInfoMap: [], // 操作人
      boxDetailData: [],
      boxColumns: [
        {
          title: '行号',
          width: 90,
          align: 'center',
          render: (h, params) => {
            return h('span', params.index + 1);
          }
        }, {
          title: '箱号',
          minWidth: 120,
          align: 'center',
          key: 'boxCode'
        }, {
          title: 'SKU',
          minWidth: 90,
          align: 'center',
          key: 'goodsSku'
        }, {
          title: '中文描述',
          minWidth: 100,
          align: 'center',
          key: 'goodsCnDesc'
        }, {
          title: '英文描述',
          minWidth: 100,
          align: 'center',
          key: 'goodsEnDesc'
        }, {
          title: '装箱数量',
          minWidth: 80,
          align: 'center',
          key: 'quantity'
        }, {
          title: '操作时间',
          minWidth: 80,
          align: 'center',
          key: 'updatedTime',
          render: (h, params) => {
            return h('div', this.$uDate.dealTime(params.row.updatedTime));
          }
        }, {
          title: '操作人',
          minWidth: 80,
          align: 'center',
          key: 'updatedBy',
          render: (h, params) => {
            return h('div', this.userInfoMap[params.row.updatedBy].userName);
          }
        }
      ],
      boxShowStatus: true // 控制装箱按钮的显示
    };
  },
  computed: {
    uploadHeader () {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    },
    encasementWebWidth () {
      let v = this;
      if (v.domWidth > 1500) {
        return 1400;
      } else if (v.domWidth > 1400) {
        return 1200;
      } else {
        return 800;
      }
    },
    currentStatus () {
      let v = this;
      if (v.detailApiObj.packageStatus !== 7) {
        if (v.detailApiObj.trackingNumberStatus === 1 || v.detailApiObj.trackingNumberStatus === 2 || v.detailApiObj.trackingNumberStatus === 4) {
          return 0;
        } else if (v.detailApiObj.trackingNumberStatus === 3) {
          return 1;
        }
      } else {
        return 2;
      }
    },
    outWareLable () {
      if (this.mainInfo.type) {
        return this.outListTypeList.find(val => val.value === this.mainInfo.type).label;
      }
    }
  },
  watch: {
    boxNum (n, o) {
      if (n !== o && n <= 15) {
        this.makeBoxDeliveryListData();
      }
    }
  },
  methods: {
    uploadWinitOnePackage () {
      let v = this;
      v.axios.put(api.set_uploadWinitPackageOne + v.packageId).then(res => {
        if (res.data.code === 0) {
          v.$Message.success('下单成功');
          v.searchData();
        }
      }).catch(() => {});
    },
    downloadFile () {
      let v = this;
      // if (v.downloadName === '0') return;
      // let name = encodeURIComponent(v.downloadName);
      // window.location.href = './download/' + name + '.xlsx';
      v.axios.get(api.get_boxTemplet).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          window.location.href = v.$store.state.imgUrlPrefix + data;
        }
      });
    },
    handleBeforeUpload () {
      // let v = this;
    },
    uploadSuccess (response, file, fileList) {
      let v = this;
      if (response.code === 0) {
        v.downloadName = '0';
        v.searchData();
        v.boxShowStatus = false;
        v.encasementModel = false;
        v.$Message.success('创建导入成功');
      }
    },
    uploadError () {
      this.$Message.error('操作失败，请重新尝试');
    },
    insertColumn (num) {
      let v = this;
      let obj = {
        title: '箱子' + num,
        minWidth: 120,
        render: (h, params) => {
          if (params.index !== v.boxDataList.length - 1) {
            return h('InputNumber', {
              props: {
                size: 'small',
                value: v.boxDataList[params.index]['box' + (params.column._index - 2)],
                disabled: !v.boxTypeStatus,
                min: 0,
                precision: 0
              },
              on: {
                'on-change': value => {
                  v.boxDataList[params.index]['box' + (params.column._index - 2)] = value;
                  v.$nextTick(function () {
                    v.getColumnTotalNum(params.column._index);
                  });
                }
              }
            });
          } else if (params.index === v.boxDataList.length - 1) {
            return h('span', params.row['total' + (params.column._index - 2)]);
          }
        }
      };
      return obj;
    },
    getBoxedNum (index, row) {
      let v = this;
      let num = 0;
      if (index < v.boxDataList.length - 1) {
        for (let t = 0; t < v.boxNum; t++) {
          num = num + row['box' + t];
        }
      } else {
        for (let t = 0; t < v.boxNum; t++) {
          num = num + row['total' + t];
        }
      }
      return num;
    },
    getColumnTotalNum (index) {
      let v = this;
      let num = 0;
      console.log(v.boxDataList);
      v.boxDataList.forEach((n, i) => {
        if (i < v.boxDataList.length - 1) {
          console.log('n:', n);
          num = num + n['box' + (index - 2)];
        }
      });
      v.boxDataList[v.boxDataList.length - 1]['total' + (index - 2)] = num;
      v.$nextTick(function () {
        v.setLastLineTotalNum();
      });
    },
    setLastLineTotalNum () {
      let v = this;
      let num = 0;
      v.boxDataList.forEach((n, i) => {
        if (i === v.boxDataList.length - 1) {
          for (let t = 0; t < v.boxNum; t++) {
            num = num + n['total' + t];
          }
        }
      });
      v.boxDataList[v.boxDataList.length - 1]['total'] = num;
    },
    confirmBoxNum () {
      // 确认箱子数量
      let v = this;
      v.boxTypeStatus = true;
      v.boxNum = v.showBoxNum;
    },
    setEncasement () {
      // 装箱内容
      let v = this;
      if (v.encasementMethodsModel === '1') {
        v.resetEncasement();
        v.makeBoxDeliveryListData().then(result => {
          if (result) {
            v.encasementMethodsModel = null;
            v.downloadName = '0';
            v.encasementWebStatus = true;
            v.$nextTick(function () {
              v.encasementWebModel = true;
            });
          }
        });
      }
    },
    resetEncasement () {
      let v = this;
      v.boxDataList = [];
      v.boxNum = 1;
      v.showBoxNum = 1;
      v.boxType = '1';
      v.boxTypeStatus = false;
      v.boxColumn = [];
    },
    makeBoxDeliveryListData () {
      // 整合数据
      let v = this;
      let arr = [];
      return new Promise(resolve => {
        if (v.boxDataList.length === 0) {
          let deliveryListData = v.deliveryListData;
          deliveryListData.forEach((n, i) => {
            for (let t = 0; t < v.boxNum; t++) {
              n['box' + t] = 1;
            }
            arr.push(n);
          });
          let lastLine = {
            type: 'last',
            total: deliveryListData.length * v.boxNum
          };
          for (let t = 0; t < v.boxNum; t++) {
            lastLine['total' + t] = deliveryListData.length;
          }
          arr.push(lastLine);
        } else {
          let len = v.boxColumn.length - 3;
          v.boxDataList.forEach((n, i) => {
            for (let t = len; t < v.boxNum; t++) {
              n['box' + t] = 1;
              n['total' + t] = v.boxDataList.length - 1;
            }
          });
        }
        v.$nextTick(function () {
          let len = v.boxColumn.length - 3;
          if (v.boxColumn.length === 0) {
            v.boxDataList = arr;
            v.boxColumn = v.boxColumn.concat(v.boxCacheColumn);
            for (let i = v.boxNum; i >= 1; i--) {
              // 插入列
              v.boxColumn.splice(2, 0, v.insertColumn(i));
            }
          } else if (len < v.boxNum) {
            for (let i = len + 1; i <= v.boxNum; i++) {
              // 插入列
              v.boxColumn.splice(v.boxColumn.length - 1, 0, v.insertColumn(i));
            }
          } else if (len > v.boxNum) {
            for (let i = v.boxNum + 2; i < v.boxColumn.length; i++) {
              // 插入列
              v.boxColumn.splice(i, 1);
            }
          }
        });
        resolve(true);
      });
    },
    setWebEncasement () {
      // 装箱1
      let v = this;
      let arr = [];
      console.log('mainInfo:', v.mainInfo);
      for (let t = 0; t < v.boxNum; t++) {
        arr.push({
          boxCode: v.boxType === '1' ? 'box' + t + '_' + v.mainInfo.num : v.mainInfo.shipmentID + '_' + t,
          pickingBoxDetails: [],
          pickingId: v.mainInfo.pickingId
        });
      }
      console.log('boxDataList:', v.boxDataList);
      v.boxDataList.forEach((n, i) => {
        let num = n.expectedNumber;
        if (i < v.boxDataList.length - 1) {
          // console.log('n:', n);
          for (let t = 0; t < v.boxNum; t++) {
            num = num - n['box' + t];
          }
          if (num !== 0) {
            v.$Message.error('装箱数量必须等于货件数量');
            v.boxLoading = false;
            v.$nextTick(function () {
              v.boxLoading = true;
            });
            return false;
          } else {
            for (let t = 0; t < v.boxNum; t++) {
              arr[t].pickingBoxDetails.push({
                productGoodsId: n.productGoodsId,
                quantity: n['box' + t]
              });
            }
          }
          if (i === v.boxDataList.length - 2) {
            console.log('arr:', arr);
            v.axios.post(api.set_saveWmsPickingBox, JSON.stringify(arr)).then(response => {
              if (response.data.code === 0) {
                v.$Message.success('保存成功');
                v.encasementWebModel = false;
                v.boxLoading = false;
                v.$nextTick(function () {
                  v.boxLoading = true;
                });
                v.boxShowStatus = false;
                v.searchData();
              }
            });
          }
        }
      });
    },
    encasement () {
      // 装箱 弹出框
      let v = this;
      v.encasementStatus = true;
      v.$nextTick(function () {
        v.encasementModel = true;
      });
    },
    showNoteFunc (bool) {
      if (!bool) {
        let optionData = [...this.optionNoteData];
        this.optionNoteData = optionData.filter(val => {
          return val.logTypeDesc !== '10';
        });
      } else {
        this.searchData();
      }
    },
    addSuccessBack () {
      this.searchData();
    },
    addDeclareRow () {
      this.dataDeclare.splice(1, 0, {
        goodsNameCn: '',
        goodsNameEn: '',
        unitPrice: '',
        unitWeight: '',
        quantity: '',
        hsCode: ''
      });
      this.columnsDeclare.push(this.declareOpt);
      this.openEditStatus = true;
      this.addOrEdit = 'add';
    },
    cancelSaveDeclareInfo () {
      // 取消编辑
      this.dataDeclare = [...this.detailApiObj.packageDeclareList];
      this.columnsDeclare.pop();
      this.openEditStatus = false;
    },
    saveDeclareInfoValidate () {
      // 保存申报信息前的校验
      let flag = true;
      this.dataDeclare.forEach(val => {
        if (!val.goodsNameEn || !val.goodsNameCn || !val.quantity || !val.unitWeight || !val.unitPrice) {
          flag = false;
        }
      });
      return flag;
    },
    saveDeclareInfo () {
      // 保存申报信息
      if (this.saveDeclareInfoValidate()) {
        let obj = {
          packageDeclareList: this.dataDeclare,
          packageIdList: [this.detailApiObj.pickingId],
          warehouseId: this.getWarehouseId()
        };
        if (this.addOrEdit === 'edit') {
          delete obj.packageIdList;
          obj.packageId = this.detailApiObj.pickingId;
          this.axios.put(this.addOrEdit === 'edit' ? api.updateDeclare : api.saveDeclareInfo, obj).then(res => {
            if (res.data.code === 0) {
              this.$Message.success('保存成功');
              this.openEditStatus = false;
              this.columnsDeclare.pop();
            }
          });
        } else {
          if (this.dataDeclare.length === 0) {
            this.$Message.warning('无新增数据');
            return;
          }
          this.axios.post(this.addOrEdit === 'edit' ? api.updateDeclare : api.saveDeclareInfo, obj).then(res => {
            if (res.data.code === 0) {
              this.$Message.success('保存成功');
              this.openEditStatus = false;
              this.columnsDeclare.pop();
            }
          });
        }
      } else {
        this.$Message.warning('新增行请填写完整');
      }
    },
    editDeclareInfo () {
      this.columnsDeclare.push(this.declareOpt);
      this.openEditStatus = true;
      this.addOrEdit = 'edit';
    },
    changeShow () {
      this.assignListShow = !this.assignListShow;
    },
    changeShowBox () {
      this.assignListShowBox = !this.assignListShowBox;
    },
    fromStatusCloseOption () {}, // getOrderPrefix (params) { // 获取订单前缀
    //   this.axios.post(api.getOrderFront + '?saleAccountIds=' + [params])
    //     .then(res => {
    //       if (res.data.code === 0) {
    //         if (this.mainInfo.orderNos && res.data.datas) {
    //           let orderNosArr = this.mainInfo.orderNos.split(',');
    //           this.mainInfo.orderNos = orderNosArr.map(val => res.data.datas[0].accountCode + '-' + val).join(',');
    //         }
    //       }
    //     });
    // },
    searchData () {
      let pos = [];
      var obj = {
        pickingNo: this.pickingNo,
        warehouseId: this.getWarehouseId()
      };
      this.axios.post(api.queryWinitSalesPackageDetail, obj).then(res => {
        if (res.data.code === 0) {
          let resData = res.data.datas;
          this.detailApiObj = res.data.datas;
          this.dataDeclare = this.detailApiObj.packageDeclareList ? [...this.detailApiObj.packageDeclareList] : [];
          this.mainInfo.pickingId = resData.pickingId;
          this.uploadData.pickingId = resData.pickingId;
          this.mainInfo.num = resData.pickingNo;
          this.mainInfo.type = resData.pickingType;
          this.mainInfo.status = resData.pickingStatus;
          this.mainInfo.ware = resData.warehouseName;
          this.wareId = resData.warehouseId;
          this.mainInfo.referenceNum = resData.referenceNo;
          if (resData.createdBy) {
            try {
              this.mainInfo.createdBy = this.$store.state.userInfoList[resData.createdBy].userName;
            } catch (e) {
              this.mainInfo.createdBy = resData.createdBy;
            }
          }
          if (resData.updatedBy) {
            try {
              this.mainInfo.updatedBy = this.$store.state.userInfoList[resData.updatedBy].userName;
            } catch (e) {
              this.mainInfo.updatedBy = resData.updatedBy;
            }
          }
          this.mainInfo.orderNos = resData.orderNos;
          this.mainInfo.shipmentID = resData.shipmentId;
          // this.getOrderPrefix(resData.saleAccountId);
          this.mainInfo.packageOrderBoList = resData.packageOrderBoList;
          this.mainInfo.createTime = this.$uDate.dealTime(resData.createdTime);
          this.mainInfo.creator = resData.createName;
          this.mainInfo.lastModifyTime = this.$uDate.dealTime(resData.updatedTime);
          this.mainInfo.updateName = resData.updateName;
          this.mainInfo.lastModifyPerson = resData.updatedBy;
          this.mainInfo.boxStatus = resData.boxStatus;
          this.mainInfo.pickingGoodsStatus = resData.pickingGoodsStatus;
          this.receiver.buyerName = resData.buyerName;
          if (resData.buyerCountryCode) {
            let arr = this.formValidate.country.filter(i => {
              if (i.twoCode === resData.buyerCountryCode) {
                return i;
              }
            });
            if (arr.length > 0) {
              this.receiver.country = arr[0].cnName;
            }
          }
          this.receiver.linkman = resData.buyerName;
          this.receiver.region = resData.buyerState;
          this.receiver.tel = resData.buyerMobile;
          this.receiver.city = resData.buyerCity;
          this.receiver.address = resData.buyerAddress1;
          this.receiver.email = resData.buyerEmail;
          this.receiver.consigneeAddressOther = resData.buyerAddress2;
          this.receiver.postalcode = resData.buyerPostalCode;
          this.logister.logisticDealer = resData.carrierName;
          this.logister.logisticNum = resData.thirdPartyNo;
          this.logister.sendType = resData.carrierShippingMethodName;
          this.logister.trackingNum = resData.trackingNumber;
          this.logister.linkman = resData.logisticsLinkMan;
          this.logister.tel = resData.logisticsLinkTel;
          this.logister.email = resData.buyerPostalCode;
          this.pickingId = resData.pickingId;
          // --------------------------------------------
          let goodsArr = resData.packageGoodsResult;
          // goodsArr.forEach(val => {
          //   // val.warehouseLocationName = ''
          // });
          if (goodsArr && goodsArr.length > 0) {
            goodsArr.forEach(val => {
              val.pickingNo = resData.pickingNo;
              val.perRowStatus = val.pickingDetailStatus === '0' ? '订单创建' : val.pickingDetailStatus === '1'
                                                                            ? '部分分配'
                                                                            : val.pickingDetailStatus === '2'
                                                                              ? '分配完成'
                                                                              : val.pickingDetailStatus === '4'
                                                                                ? '完成发货'
                                                                                : val.pickingDetailStatus === '5'
                                                                                  ? '订单完成'
                                                                                  : '';
            });
            this.deliveryListData = goodsArr;
            if (resData.wmsPickingBoxDetails) {
              resData.wmsPickingBoxDetails.forEach((n, i) => {
                pos.push(n.updatedBy);
              });
            }
            Promise.resolve(this.getUserInfoMap(pos)).then(result => {
              if (resData.wmsPickingBoxDetails) {
                this.boxDetailData = this.processTimeData(resData.wmsPickingBoxDetails, 'createdTime');
              }
            });
            // this.boxDetailData = this.processTimeData(resData.wmsPickingBoxDetails, 'createdTime');
            this.cacheOptionNoteData = resData.wmsPickingLog;
            this.optionNoteData = this.processTimeData(resData.wmsPickingLog, 'createdTime'); // 留言信息
          }
          // 查询状态
          this.axios.get((this.workType === 'sellStock'
                          ? api.getSalesPickingStatus
                          : api.getOtherPickingStatus) + this.pickingNo).then(res => {
            if (res.data.code === 0) {
              // this.currentIconStatus
              let obj = { ...res.data.datas };
              obj.createdTime = obj.createdTime ? this.$uDate.dealTime(obj.createdTime) : '';
              obj.despatchTime = obj.despatchTime ? this.$uDate.dealTime(obj.despatchTime) : '';
              obj.pickingGoodsTime = obj.pickingGoodsTime ? this.$uDate.dealTime(obj.pickingGoodsTime) : '';
              obj.pickingTime = obj.pickingTime ? this.$uDate.dealTime(obj.pickingTime) : '';
              obj.printTime = obj.printTime ? this.$uDate.dealTime(obj.printTime) : '';
              obj.getLabelTime = obj.getLabelTime ? this.$uDate.dealTime(obj.getLabelTime) : '';
              this.currentIconStatus = obj;
              this.currentIconStatus.salesPickingStatus = -1;
              this.currentIconStatus.otherPickingStatus = Number(obj.otherPickingStatus);
              delete obj.trackingNumberTime; // 这个字段暂时没用且会影响步骤条，所以这里删掉
              for (let key in obj) {
                if (key.indexOf('Time') > -1 && obj[key]) {
                  this.currentIconStatus.salesPickingStatus++;
                  // this.currentIconStatus.otherPickingStatus++;
                }
              }
              // 有装箱情况下的步骤条
              if (Number(obj.otherPickingStatus) === 3 && this.detailApiObj.needBox === 1) {
                this.currentIconStatus.otherPickingStatus = 4; // 已发货
              } else if (Number(obj.otherPickingStatus) === 2 && this.detailApiObj.needBox === 1 && this.detailApiObj.boxStatus === 2) {
                this.currentIconStatus.otherPickingStatus = 3; // 已发货
              }
              this.fromStatusCloseOption();
            }
          });
        }
      });
    },
    stockChangePage (page) {
      // 表格分页
      this.pageParams.stockPageNum = page;
      this.searchData();
    },
    stockChangePageSize (size) {
      // 切页
      this.pageParams.stockPageSize = size;
      this.searchData();
    },
    batchChangePage (page) {
      // 批次表格分页
      this.pageParams.batchPageNum = page;
      this.searchData();
    },
    batchChangePageSize (size) {
      this.pageParams.batchPageSize = size;
      this.searchData();
    },
    addMsg () {
      // 添加备注按钮
      if (!this.addNotesInput) {
        this.$Message.warning({
          content: '备注不能为空',
          duration: 3
        });
        return;
      }
      let obj = {
        createdBy: null,
        createdTime: null,
        logContentDesc: this.addNotesInput ? this.addNotesInput : null,
        logTypeDesc: null,
        merchantId: null,
        pickingId: this.pickingId,
        pickingLogId: null,
        relatedBusinessNo: this.mainInfo.num,
        updatedBy: null,
        updatedTime: null
      };
      this.axios.post(api.add_Note, obj).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('新增成功');
          this.refreshMsgNote();
        }
      });
    },
    backList () {
      this.$parent.workShow = 'list';
    },
    showNoteFn (bool) {
      // 过滤留言
      if (!bool) {
        let optionData = [...this.optionNoteData];
        this.optionNoteData = optionData.filter(val => {
          return val.logTypeDesc !== '手动添加';
        });
      } else {
        this.optionNoteData = this.cacheOptionNoteData;
      }
    },
    closeMessage (item, i) {
      // 删除留言(废弃功能)
    },
    sltTableItemFn (data) {
      this.sltTableItem = data;
    },
    cancelAssignValid () {
      // 批量取消的校验
      let valid = true;
      if (this.sltTableItem.length === 0) {
        this.$Message.warning({
          content: '请选择要操作的数据',
          duration: 3
        });
        valid = false;
        return valid;
      }
      // 只有部分分配和分配完成才能取消
      let hasAssign = true;
      for (let i = 0; i < this.sltTableItem.length; i++) {
        if (this.sltTableItem[i].pickingDetailStatus !== '2' && this.sltTableItem[i].pickingDetailStatus !== '1') {
          hasAssign = false;
          break;
        }
      }
      if (!hasAssign) {
        this.$Message.warning({
          content: '只有部分分配和分配完成才能取消',
          duration: 3
        });
        valid = false;
        return valid;
      }
      return valid;
    },
    cancelAssign () {
      // 批量取消
      if (this.cancelAssignValid()) {
        this.sltTableItem.forEach(val => {
          val.warehouseId = this.wareId;
        });
        let obj = this.sltTableItem.filter(val => {
          return (val.pickingDetailStatus === '2' || val.pickingDetailStatus === '1');
        });
        this.cancelAssignFn(obj);
      }
    },
    assignInventoryValid () {
      // 批量分配前的校验
      let valid = true;
      // 勾选数据校验
      if (this.sltTableItem.length === 0) {
        this.$Message.warning({
          content: '请选择要操作的数据',
          duration: 3
        });
        valid = false;
        return valid;
      }
      // 分配完成的订单不能再分配
      let hasAssign = true;
      for (let i = 0; i < this.sltTableItem.length; i++) {
        if (this.sltTableItem[i].pickingDetailStatus === '2') {
          hasAssign = false;
          break;
        }
      }
      if (!hasAssign) {
        this.$Message.warning({
          content: '存在分配完成的订单',
          duration: 3
        });
        valid = false;
        return valid;
      }
      //* *********************
      // 判断是否填了库位信息
      var flag = true;
      this.sltTableItem.forEach(val => {
        if (!val.warehouseLocationName) {
          flag = false;
        }
      });
      if (!flag) {
        this.$Message.warning({
          content: '请填写库位',
          duration: 3
        });
        valid = false;
        return valid;
      }
      return valid;
    },
    assignInventory () {
      // 批量分配
      if (this.assignInventoryValid()) {
        console.log('xxx1');
        this.sltTableItem.forEach(val => {
          val.warehouseId = this.wareId;
        });
        this.assignFn(this.sltTableItem);
      }
    },
    assignFn (params, index) {
      // 分配函数
      this.axios.post(this.workType === 'otherStock'
                      ? api.assign_stockSingle
                      : api.assign_sellStockSingle, params).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('分配成功');
          this.sltTableItem = [];
          this.refreshAssignList(index);
          this.currentIconStatus.otherPickingStatus += 1;
        }
      });
    },
    cancelAssignFn (params, index) {
      // 取消函数
      this.axios.post(this.workType === 'otherStock' ? api.cancel_stock : api.cancel_sellStock, params).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('取消成功');
          this.sltTableItem = [];
          this.refreshAssignList(index);
          this.currentIconStatus.otherPickingStatus -= 1;
        } else {
          // this.$Message.warning({
          //   content: res.data.message,
          //   duration: this.$store.state.messageTipsDuration
          // });
        }
      });
    },
    getData (data) {
      // 选择库位框返回数据
      this.$set(this.deliveryListData[this.clickIndex], 'warehouseLocationName', data.warehouseLocationName);
      this.deliveryListData[this.clickIndex].warehouseLocationId = data.warehouseLocationId;
      this.deliveryListData[this.clickIndex].receiptBatchNo = data.receiptBatchNo;
      this.deliveryListData[this.clickIndex].inventoryId = data.inventoryId;
      this.deliveryListData[this.clickIndex].availableNumber = data.availableNumber;
      this.sltTableItem = [];
    },
    refreshAssignList (index) {
      // 更新分配列表
      var obj = {
        pickingNo: this.mainInfo.num,
        warehouseId: this.getWarehouseId()
      };
      let url = this.workType === 'otherStock' ? api.get_stockOutDtl : api.get_sellStockOutDtl;
      this.axios.post(url, obj).then(res => {
        // this.axios.post(api.get_sellStockOutDtl, obj).then(res => {
        if (res.data.code === 0) {
          if (index === undefined) {
            let processData = res.data.datas.queryPickingGoodsResult;
            processData.forEach(val => {
              //                                 val.warehouseLocationName = ''
              // val.warehouseLocationId = '';
              // val.receiptBatchNo = '';
              // val.inventoryId = '';
              // val.availableNumber = '';
              val.pickingNo = this.pickingNo;
              val.perRowStatus = val.pickingDetailStatus === '0' ? '订单创建' : val.pickingDetailStatus === '1'
                                                                            ? '部分分配'
                                                                            : val.pickingDetailStatus === '2'
                                                                              ? '分配完成'
                                                                              : val.pickingDetailStatus === '4'
                                                                                ? '完成发货'
                                                                                : val.pickingDetailStatus === '5'
                                                                                  ? '订单完成'
                                                                                  : '';
            });
            this.deliveryListData = processData;
          } else {
            let obj = {
              ...res.data.datas.queryPickingGoodsResult.list[index]
            };
            //								obj.warehouseLocationName = ''
            // obj.warehouseLocationId = '';
            // obj.receiptBatchNo = '';
            // obj.inventoryId = '';
            // obj.availableNumber = '';
            obj.pickingNo = this.pickingNo;
            obj.perRowStatus = obj.pickingDetailStatus === '0' ? '订单创建' : obj.pickingDetailStatus === '1'
                                                                          ? '部分分配'
                                                                          : obj.pickingDetailStatus === '2'
                                                                            ? '分配完成'
                                                                            : obj.pickingDetailStatus === '4'
                                                                              ? '完成发货'
                                                                              : obj.pickingDetailStatus === '5'
                                                                                ? '订单完成'
                                                                                : '';
            this.deliveryListData.splice(index, 1, obj);
          }
          // this.columns1 = this.deepCopy(this.columns1);
          this.columns1 = [...this.columns1];
          this.optionNoteData = this.processTimeData(res.data.datas.wmsPickingLog, 'createdTime'); // 留言信息
        }
      }).catch(() => {});
    },
    refreshMsgNote () {
      // 添加成功后刷新留言
      this.axios.get(api.refresh_msgNote + '?pickingId=' + this.pickingId).then(res => {
        if (res.data.code === 0) {
          this.optionNoteData = res.data.datas;
          this.cacheOptionNoteData = res.data.datas; // 更新缓存
          this.addNotesInput = '';
        }
      });
    },
    getUserInfoMap (userIds) {
      let v = this;
      return new Promise(resolve => {
        if (userIds.length > 0) {
          v.axios.post(api.get_userInfoMap, userIds).then(function (response) {
            if (response.data.code === 0) {
              v.userInfoMap = response.data.datas;
              resolve(true);
            }
          });
        } else {
          resolve(true);
        }
      });
    }
  }
};
</script>
<style scoped>
.p20 {
  padding: 20px;
}

.totalNum {
  font-weight: bold;
}
</style >
<style >
.ivu-steps .ivu-steps-tail {
  width: 125%;
}

.ivu-steps .ivu-steps-tail:nth-child(1) {
  margin-left: 20px;
}

.stockOutDlt {
  padding-left: 8px;
}

/* .stockOutDlt .ivu-timeline-item-content {
  height: 50px;
} */

.stockOutDlt > div:first-child h3 {
  background-color: #ffffff;
  padding: 10px;
}

.stockOutDlt .ivu-table-tip {
  overflow-x: hidden;
}
</style >
