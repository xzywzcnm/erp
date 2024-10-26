<template >
  <div class="stockout-order-main">
    <!--筛选-->
    <div class="interceptOrderFilter">
      <div class="card-container">
        <div class="card-content">
          <div class="platformParamsSelect">
            <Form ref="pageParams" :model="pageParams" :label-width="labelWidth">
              <FormItem label="渠道" class="notplatformParamsSelect">
                <Button-group>
                  <template v-for="(item, index) in platformGroup" v-if="index < 5">
                    <Button v-if="item.selected" type="primary" @click="getPlatformData(index, item)" :key="index">
                      {{ item.name }} </Button>
                    <Button class="pseudoButton" v-if="!item.selected" @click="getPlatformData(index, item)"
                      :key="index">{{ item.name }} </Button>
                  </template>
                  <template v-if="platformGroup.length > 5">
                    <Dropdown style="margin-left: 10px">
                      <Button>
                        更多渠道
                        <Icon type="md-arrow-dropdown" />
                      </Button>
                      <Dropdown-menu slot="list">
                        <Dropdown-item v-for="(item, index) in platformGroup" v-if="index >= 5" :key="index">
                          <div @click="getPlatformData(index, item)">{{ item.name }}</div>
                        </Dropdown-item>
                      </Dropdown-menu>
                    </Dropdown>
                  </template>
                </Button-group>
              </FormItem>
              <dyt-filter ref="filterRef" tableClassName="orderTable">
                <Form-item label="店铺" prop="saleAccountIds">
                  <dytStoreSelect
                    v-model="pageParams.saleAccountIds"
                    :option-data="shopList"
                    :replace-option-key="{value: 'saleAccountId', label: 'accountCode'}"
                    placeholder="请选择店铺，可输入搜索"
                    input-placeholder="请输入店铺，多个店铺可用逗号或换行隔开"
                  />
                </Form-item>
                <Form-item label="付款时间" prop="payTime">
                  <Date-picker
                    transfer
                    type="datetimerange"
                    style="width:100%"
                    :clearable="true"
                    :options="dateOptions"
                    format="yyyy-MM-dd HH:mm:ss"
                    placement="bottom-end"
                    placeholder="选择日期"
                    v-model="pageParams.payTime"
                  />
                </Form-item>
                <Form-item label="异常类型" prop="outOfStockStatusList">
                  <dyt-select v-model="pageParams.outOfStockStatusList" :max-tag-count="1" multiple>
                    <Option v-for="item in failTypeList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="国家/地区" prop="buyerCountryCodeList">
                  <dyt-select v-model="pageParams.buyerCountryCodeList" @on-change="countryChange" :max-tag-count="1" multiple placeholder="请选择或输入所在地">
                    <Option v-for="(item,index) in formValidate.country" :key="index" :value="item.twoCode" :v="item.cnName">{{ item.enName }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="仓库" prop="warehouseIdList">
                  <dyt-select v-model="pageParams.warehouseIdList" :max-tag-count="1" multiple placeholder="请选择仓库">
                    <Option v-for="(item, index) in warehouseList" :value='item.warehouseId' :label="item.warehouseName" :key="`ware-${index}`" />
                  </dyt-select>
                </Form-item>
                <Form-item label="标签" prop="tagIdList">
                  <dyt-select v-model="pageParams.tagIdList" :max-tag-count="1" multiple placeholder="请选择或搜索标签">
                    <Option v-for="item in tagsList" :key="item.tagId" :value="item.tagId" :v="item.tagId">{{ item.tagName }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="商品状态" prop="productStatus">
                  <div style="display: inline-block;vertical-align: middle;">
                    <dyt-select v-model="pageParams.productStatus" placeholder="请选择商品状态">
                      <Option v-for="(item, index) in productStatuList" :value='item.value' :key="`status-${index}`">{{item.label}}</Option>
                    </dyt-select>
                  </div>
                </Form-item>
                <Form-item label="订单号" prop="orderNo">
                  <dyt-input-tag type="textarea" v-model="pageParams.orderNo" :limit="1" :string="true" placeholder="请输入订单号,多个请用逗号隔开" />
                </Form-item>
                <Form-item label="买家姓名" prop="buyerName">
                  <dyt-input placeholder="请输入买家姓名" v-model.trim="pageParams.buyerName"></dyt-input>
                </Form-item>
                <Form-item label="买家ID" prop="buyerAccountId">
                  <dyt-input placeholder="请输入买家ID" v-model.trim="pageParams.buyerAccountId"></dyt-input>
                </Form-item>
                <Form-item label="平台产品编码" prop="webstoreItemId">
                  <dyt-input placeholder="请输入平台产品编码" v-model.trim="pageParams.webstoreItemId"></dyt-input>
                </Form-item>
                <Form-item label="SPU/SKU" prop="webstoreSku">
                  <dyt-input-tag type="textarea" placeholder="请输入SPU/SKU, 多个请用逗号隔开" :limit="1" :string="true" v-model="pageParams.webstoreSku" />
                </Form-item>
                <Form-item label="搜索字符" prop="searchValue">
                  <dyt-input class="filterSearch" placeholder="可输入订单号、买家ID、买家姓名、SKU、平台产品编码" v-model.trim="pageParams.searchValue"></dyt-input>
                </Form-item>
                <div slot="operation">
                  <Button type="primary" @click="getList(true)" :disabled="SearchDisabled" icon="md-search">查询 </Button>
                  <Button @click="resetFilter" style="margin-left: 10px;" v-once icon="md-refresh">重置 </Button>
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
    </div>

    <div class="tableControl" style="display: flex;">
      <div style="flex: 100;">
        <!-- <Button type="primary" @click="startCancelDelivery" class="iconbuttons" v-if="getPermission.cancelOrder">
          <span class="icon iconfont">&#xe67e;</span>取消订单
        </Button> -->
        <Dropdown class="tcDropDown ml10" v-if="permission.insertTag || permission.clearTag" transfer>
          <Poptip v-model="setTagListStatus" placement="bottom" :transfer="true">
            <Button icon="md-pricetag">
              打标签
              <Icon type="md-arrow-dropdown" />
            </Button>
            <div slot="content">
              <order-label-tag v-model="tagIdList" :tags-list="tagsList" />
              <div class="tagsSelectFooter">
                <Button size="small" @click="setTag" :disabled="!permission.insertTag">打标签</Button>
                <Button size="small" @click="dropOrderTag" :disabled="!permission.clearTag">清空标签</Button>
              </div>
            </div>
          </Poptip>
        </Dropdown>
        <Dropdown class="ml10" trigger="click" v-if="permission.batchExport || permission.exportAll" transfer>
          <Button type="primary" class="iconbuttons">
            导出
            <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem @click.native="exportOrder" v-if="permission.batchExport">导出选中</DropdownItem>
            <DropdownItem @click.native="exportOrderHasCondition" v-if="permission.exportAll">导出（所有结果集）</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <!-- <Dropdown class="ml10" v-if="permission.batchWarehouse || permission.batchShipping">
          <Button type="primary">
            批量操作
            <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem
              @click.native="batchModifyWarehouse"
              v-if="permission.batchWarehouse"
            >批量修改仓库</DropdownItem>
            <DropdownItem
              @click.native="batchModifyShippingMethod"
              v-if="permission.batchShipping"
            >批量修改邮寄方式</DropdownItem>
          </DropdownMenu>
        </Dropdown> -->
        <!-- <Dropdown class="ml10" v-if="permission.batchSuspend">
          <Button type="primary">
            批量截留
            <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem @click.native="suspendedSelect">批量截留选中
            </DropdownItem>
            <DropdownItem @click.native="suspendedSelectAll">批量截留所有
            </DropdownItem>
          </DropdownMenu>
        </Dropdown> -->
        <Dropdown class="ml10" v-if="permission.batchRemark" transfer>
          <Button type="primary">
            批量备注
            <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem @click.native="batchUpdateRemark('check')">
              批量备注选中
            </DropdownItem>
            <DropdownItem @click.native="batchUpdateRemark('all')">
              批量备注所有
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <!--排序-->
      <div class="dataSort grayBg" style="display: inline-block;background: none;border: none;padding: 0;margin: 0;">
        <span>排序：</span>
        <Button-group>
          <template v-for="(item, index) in buttonGroupModel">
            <Button v-if="item.selected" :disabled="SearchDisabled" type="primary" @click="modifyTheSort(index, item.status)" :key="index">
              {{ item.title }}
              <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
              <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
            </Button>
            <Button v-if="!item.selected" :disabled="SearchDisabled" @click="modifyTheSort(index, item.status)" :key="index">
              {{ item.title }}
              <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
              <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
            </Button>
          </template>
        </Button-group>
      </div>
    </div>
    <div class="orderTable normalTop">
      <Table
        highlight-row
        border
        :height="tableHeight"
        :loading="tableLoading"
        :columns="orderColumn"
        :data="orderData"
        @on-selection-change="getSelectValue"
      />
      <div class="table-page flexBox">
        <Page
          :total="total"
          @on-change="changePage"
          show-total
          :page-size="pageParams.pageSize"
          show-elevator
          :current="curPage"
          show-sizer
          @on-page-size-change="changePageSize"
          placement="top"
          :page-size-opts="pageArray"
        />
      </div>
    </div>
    <!-- 导出 -->
    <Modal v-model="exportModel.status" :mask-closable="false" width="400" v-if="exportModelStatus" @on-ok="exportExcel">
      <div class="ivu-modal-confirm">
        <div class="ivu-modal-confirm-head" style="font-size: 16px;">{{ exportModel.title }}</div>
        <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
          <div style="display: flex;align-items: center;margin-top:20px;padding-left: 20px;">
            <Icon type="md-information-circle" color="#ff9900" size="24"></Icon>
            <span style="padding-left: 10px;">确认是否导出</span>
          </div>
        </div>
      </div>
    </Modal>
    <sliderModal v-model="orderDetails" :spinShow="spinShow" :styles="{}" class="slider-model" v-if="orderDetailsBegin">
      <orderDetails :orderDetailsId="orderDetailsId" @reloadTag="reloadTag" :orderNo="orderNo" :timestamp="timestamp"
        @spinLoading="spinLoading" @resetSpinShow="resetSpinShow" @updateList="getList" :orderTagList="orderTagList"
        :webstoreItemSite="webstoreItemSite" :moal-visible.sync="orderDetails"
      />
    </sliderModal>
    <batchModifyModal ref="batchModifyModal" :order-id-lists="orderIdList" :orderDataProp="orderData" @getList="getList" />
    <Modal v-model="dialogVisible" title="操作提示" @on-ok="confirm">
      <span> 确认是否要截留订单，数量：</span>
      <span style="color:#ff995c">{{ suspendedWay == 0 ? selectList.length : total }}</span>
      <div style="margin-top:20px">
        截留原因：<Input v-model="suspendedReason" maxlength="200" show-word-limit type="textarea" style="width: 400px" />
      </div>
      <p style="margin-top:30px"> 提示：无法截留的订单将会自动忽略</p>
    </Modal>
    <Modal v-model="productModal" v-if="productStatus" :width="600">
      <div class="orderDetailsProductItem">
        <Row v-for="(item,index) in productDetails" :key="index" class="normalTop">
          <Col :span="2">
          <div class="orderDetailsProductItemPic">
            <img
              :src="`${$common.isEmpty(item.pictureUrl) ? '' : item.pictureUrl.includes('/filenode/') ? item.pictureUrl : `./filenode/s/thumb${item.pictureUrl}`}`"
              :alt="item.title"
            />
          </div>
          </Col>
          <Col :span="17" :offset="1">
          <div class="odpidProductID">
            <span
              class="productID"
              @click="goItemUrl(item)"
              :class="{'cursor-pointer': platformIdUrlKey.includes(item.platformId)}"
              v-if="item.webstoreItemId"
            >itemID：{{ item.webstoreItemId }}</span>
            <span class="productHaveATitle">SKU: <em>{{ item.webstoreSku }}</em></span>
            <span class="productLogsticService">物流服务：<em>{{ item.buyerShippingMethod }}</em></span>
          </div>
          <div class="odpidProductDetails">
            {{ item.title }}
          </div>
          <div class="odpidProductParams" v-if="item.variations !== null">
            <span class="productHaveATitle" v-if="item.variations.indexOf('color') >=0 && item.variations.indexOf(';') > 0">Color:<em>{{ item.variations.split(': ')[1].split(';')[0] }} </em></span>
            <span class="productHaveATitle" v-if="item.variations.indexOf('color') >=0 && item.variations.indexOf(';') < 0">Color:<em>{{ item.variations.split(': ')[1] }} </em></span>
            <span class="productHaveATitle" v-if="item.variations.toLowerCase().indexOf('pack of') >= 0">Pack of:<em>{{ item.variations.split(';')[1].split(': ')[1] }}</em></span>
          </div>
          </Col>
          <Col :span="2" :offset="2">
          X {{ item.quantity }}
          </Col>
        </Row>
      </div>
      <div slot="footer">
        <Button @click="closeModal">关闭</Button>
      </div>
    </Modal>
    <cancelDelivery ref="cancelDelivery" :orderIdList.sync="orderIdList"></cancelDelivery>
    <!-- 批量备注 -->
    <batchRemarkModal :module-visible.sync="moduleRemarkVisible" :module-data="moduleRemarkData" @updateList="getList" />
    <!-- 缺货商品订单详情 -->
    <Modal
      v-model="stockoutOrderVisible"
      :width="90"
      title="缺货商品订单详情"
      class-name="stockout-order-modal"
    >
      <stockoutOrderDetails :component-data="orderDetailData" :slider-visible="stockoutOrderVisible" @closeModal="stockoutOrderCancel"/>
      <div slot="footer">
        <Button type="info" @click="stockoutOrderCancel">取消</Button>
      </div>
    </Modal>
    <Spin v-if="pageDataLoading" fix>加载数据中...</Spin>
  </div>
</template>

<script>
import api from '@/api/api';
import orderDetails from "@/views/commonOrder/components/commonOrder/orderDetails";
import Mixin from '@/components/mixin/common_mixin';
import orderSys from '@/components/mixin/orderSys_mixin';
import batchModifyModal from '@/components/common/batchModifyModal';
import batchRemarkModal from "@/views/commonOrder/components/commonOrder/batchUpdateRemark";
import productData from '@/views/productCenter/components/productCenter/staticData/productData';
import cancelDelivery from '@/components/common/order/cancelOrder';
import { platformReceptionUrl } from '@/utils/enum';
import stockoutOrderDetails from '@/views/commonOrder/components/commonOrder/stockoutOrderDetails';

export default {
  mixins: [Mixin, orderSys],
  props: {
    isCancelOrder: { // 已取消订单
      type: Boolean,
      default: false
    },
    tableColumns: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  components: {
    orderDetails,
    batchModifyModal,
    batchRemarkModal,
    cancelDelivery,
    stockoutOrderDetails
  },
  data () {
    return {
      moduleRemarkVisible: false,
      moduleRemarkData: {},
      warehouseList: [], // 仓库数据
      warehouseJson: [],
      orderDetailData: {},
      stockoutOrderVisible: false,
      productStatuList: productData.productStatus,
      current: 0,
      platformItemUrl: platformReceptionUrl,
      platformGroup: [],
      buttonGroupModel: [
        {
          type: 'payTime',
          selected: true,
          status: true, // true up false down
          title: '按付款时间'
        },
        {
          type: 'salesTime',
          selected: false,
          status: true, // true up false down
          title: '按下单时间'
        },
        // {
        //   type: 'surplusTime',
        //   selected: false,
        //   status: true, // true up false down
        //   title: '发货剩余时间'
        // }
      ],
      orderDetails: false,
      formValidate: {
        country: []
      },
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      totalPage: 0,
      total: 0,
      curPage: 1,
      pageParams: {
        pageNum: 1,
        pageSize: 50,
        payTime: this.$common.getRangeTime('', -1, 'month'),
        outOfStockStatusList: [],
        buyerCountryCodeList: [],
        tagIdList: [],
        warehouseIdList: [],
        saleAccountIds: [],
        platformId: [],
        buyerAccountId: null,
        buyerName: null,
        webstoreItemId: null,
        webstoreSku: null,
        orderNo: null,
        orderBy: 'payTime',
        upDown: 'up',
        searchValue: '',
        productStatus: null
      },
      exportModel: {
        title: '',
        content: '',
        status: false
      },
      exportModelStatus: false,
      orderColumn: [
        {
          type: 'selection',
          width: 50,
          fixed: 'left',
          align: 'center'
        },
        {
          title: "基本信息",
          key: "salesRecordNumber",
          minWidth: 230,
          fixed: "left",
          render: (h, { row }) => {
            const text = `${row.accountCode || ''}-${row.salesRecordNumber || ''}`;
            let orderItem = [
              h('span', {}, '订单号：'),
              h('span', {
                style: {
                  'color': this.permission.detail ? '#0054A6' : '#515a6e',
                  'cursor': 'pointer'
                },
                on: {
                  click: () => {
                    if (this.permission.detail) {
                      this.show(row.orderId);
                      this.orderNo = text;
                      this.orderTagList = row.orderTagList;
                      this.webstoreItemSite = row.webstoreItemSite;
                    }
                  }
                }
              }, text),
              h('icon', {
                class: 'icon lapa lapa-copy',
                attrs: {
                  title: '复制订单号'
                },
                style: {
                  cursor: "pointer",
                  'margin-left': '6px'
                },
                on: {
                  click: () => {
                    this.$common.copyToClip(text).then(() => {
                      this.$Message.success('复制订单号成功');
                    }).catch(() => {
                      this.$Message.error('当前浏览器不支持复制功能');
                    })
                  }
                }
              }, '')
            ];
            if (!this.$common.isEmpty(row.emailGroups)) {
              orderItem.push(h('Icon', {
                style: { 'cursor': 'pointer', 'margin-left': '5px', 'font-size': '22px', 'color': '#f20' },
                class: 'lapa lapa-solid-core-mail',
                on: {
                  click: () => {
                    const openUrl = `/cs-service/customer.html#/ebayMail`;
                    localStorage.setItem('erp-order-stockoutOrder', JSON.stringify({
                      buyerAccountId: row.buyerAccountId,
                      messageGroupId: row.emailGroups
                    }));
                    window.open(openUrl);
                  }
                }
              }));
            }
            let rowItem = [];
            if (!this.$common.isEmpty(row.accountCode)) {
              rowItem.push(h('span', {
                attrs: {
                  title: '店铺'
                },
                class: 'table-row-td-tag',
                style: {
                  color: 'rgba(45, 140, 240)',
                  background: 'rgba(45, 140, 240, 0.1)'
                },
              }, row.accountCode));
            }
            if (!this.$common.isEmpty(row.buyerCountryCodeList)) {
              rowItem.push(h('span', {
                attrs: {
                  title: '国家/地区'
                },
                class: 'table-row-td-tag',
                style: {
                  color: 'rgba(20, 118, 2)',
                  background: 'rgba(20, 118, 2, 0.1)'
                },
              }, row.buyerCountryCodeList));
            }
            if (!this.$common.isEmpty(row.productStatus)) {
              row.productStatus.split(',').forEach(txt => {
                rowItem.push(h('span', {
                  attrs: {
                    title: '商品状态'
                  },
                  class: 'table-row-td-tag',
                  style: {
                    color: 'rgba(43, 185, 43)',
                    background: 'rgba(43, 185, 43, 0.1)'
                  },
                }, txt));
              })
            }
            if ([3, '3'].includes(row.synDeliverStatus) || !this.$common.isEmpty(row.synDeliverDate)) {
              rowItem.push(h('span', {
                attrs: {
                  title: '标发货'
                },
                class: 'table-row-td-tag',
                style: {
                  color: 'rgba(53 190 255)',
                  background: 'rgba(53, 190, 255, 0.1)'
                },
              }, '已标发货'))
            }
            if ([7, '7'].includes(row.orderStatus)) {
              rowItem.push(h('span', {
                attrs: {
                  title: '已发货'
                },
                class: 'table-row-td-tag',
                style: {
                  color: 'rgba(93, 53, 255)',
                  background: 'rgba(93, 53, 255, 0.1)'
                },
              }, '已发货'))
            }
            if ([1, '1'].includes(row.isHand) && !['JIT'].includes(row.orderType)) {
              rowItem.push(h('span', {
                attrs: {
                  title: '手工单'
                },
                class: 'table-row-td-tag',
                style: {
                  color: 'rgba(187, 53, 255)',
                  background: 'rgba(187, 53, 255, 0.1)'
                },
              }, '手工单'))
            }
            if (!this.$common.isEmpty(row.trusteeshipType) && [0, 1].includes(Number(row.trusteeshipType))) {
              const txt = row.trusteeshipType == 1 ? '半托管' : '全托管';
              rowItem.push(h('span', {
                attrs: {
                  title: txt
                },
                class: 'table-row-td-tag',
                style: {
                  color: 'rgba(98 89 102)',
                  background: 'rgba(103, 82, 114, 0.1)'
                },
              }, txt))
            }
            if (typeof row.redelivery === 'boolean' && row.redelivery) {
              rowItem.push(h('span', {
                attrs: {
                  title: '有补发'
                },
                class: 'table-row-td-tag',
                style: {
                  color: 'rgba(156, 0, 185)',
                  background: 'rgba(156, 0, 185, 0.1)'
                },
              }, '有补发'))
            }
            if ([1, 2, '1', '2'].includes(row.isInvalid)) {
              rowItem.push(h('span', {
                attrs: {
                  title: '作废订单'
                },
                class: 'table-row-td-tag',
                style: {
                  color: 'rgba(225, 67, 67)',
                  background: 'rgba(225, 67, 67, 0.1)'
                },
              }, '已作废'))
            }
            if (typeof row.goodMiss === 'boolean' && row.goodMiss) {
              rowItem.push(h('span', {
                attrs: {
                  title: '缺货订单'
                },
                class: 'table-row-td-tag',
                style: {
                  color: 'rgba(255, 165, 0)',
                  background: 'rgba(255, 165, 0, 0.1)'
                },
              }, '缺货'))
            }
            if ([1, '1'].includes(row.isRefunded)) {
              rowItem.push(h('span', {
                attrs: {
                  title: '有退款'
                },
                class: 'table-row-td-tag',
                style: {
                  color: 'rgba(247, 93, 207)',
                  background: 'rgba(247, 93, 207, 0.1)'
                },
              }, '有退款'))
            }
            if ([1, '1'].includes(row.isPartRefunded)) {
              rowItem.push(h('span', {
                attrs: {
                  title: '部分退款'
                },
                class: 'table-row-td-tag',
                style: {
                  color: 'rgba(187, 80, 159)',
                  background: 'rgba(187, 80, 159, 0.1)'
                },
              }, '部分退款'))
            }
            if ([1, '1'].includes(row.hasAfterSales)) {
              rowItem.push(h('span', {
                attrs: {
                  title: '有售后单'
                },
                class: 'table-row-td-tag',
                style: {
                  color: 'rgba(68, 0, 201)',
                  background: 'rgba(68, 0, 201, 0.1)'
                },
              }, '有售后单'))
            }
            if (['ozon'].includes(row.platformId) && !this.$common.isEmpty(row.ozonSplitOrderRecordList)) {
              let oItem = [
                h('div', {}, '已拆单'),
                h('div', {}, `主单：${row.accountCode || ''}-${row.salesRecordNumber || ''}，数量：${row.notSpiltTotal}`),
              ];
              (row.ozonSplitOrderRecordList || []).forEach((item, cIndex) => {
                oItem.push(h('div', {}, `拆分订单${cIndex + 1}：${row.accountCode || ''}-${item.subWebstoreOrderId || ''}，数量：${item.quantity}`));
              });
              oItem.push(h('div', {}, '点击图标可查询主单以及拆分订单'));

              rowItem.push(h('Poptip', {
                props: {
                  placement: 'right',
                  trigger: 'hover',
                  transfer: true
                },
                style: {},
              }, [
                h('span', {
                  class: 'table-row-td-tag',
                  style: {
                    color: 'rgb(44 141 44)',
                    background: 'rgba(0, 111, 0, 0.2)',
                    cursor: 'pointer'
                  },
                  on: {
                    click: () => {
                      this.updateLoadTable({
                        orderNo: [
                          `${row.accountCode || ''}-${row.salesRecordNumber || ''}`,
                          ...(row.ozonSplitOrderRecordList || []).map(item => {
                            return `${row.accountCode || ''}-${item.subWebstoreOrderId || ''}`
                          })
                        ].join(',')
                      })
                    }
                  }
                }, '已拆单'),
                h('div', {
                  slot: 'content',
                  style: {
                    'width': '350px',
                    'white-space': 'initial',
                    'max-height': '50vh',
                    'overflow': 'auto',
                  },
                }, oItem)
              ]))
            }
            if ([1].includes(Number(row.isReply))) {
              rowItem.push(h('span', {
                attrs: {
                  title: '回复状态'
                },
                class: 'table-row-td-tag',
                style: {
                  color: 'rgba(222, 138, 255)',
                  background: 'rgba(222, 138, 255, 0.1)'
                },
              }, '自动回复'))
            }
            return h('div', {
              style: {
                'text-align': 'left'
              }
            }, [...orderItem, h('div', {}, rowItem)]);
          }
        },
        {
          title: '渠道',
          key: 'channel',
          align: 'center',
          // fixed: 'left',
          width: 100,
          render: (h, params) => {
            let v = this;
            let channel = '';
            v.platformGroup.map(item => {
              if (item.platformId === params.row.platformId) {
                channel = item.name;
              }
            });
            return h('div', channel);
          }
        },
        {
          title: '产品',
          key: 'productList',
          width: 120,
          align: 'center',
          resizable: true,
          render: (h, params) => {
            let data = params.row.productList;
            let pos = [];
            data.forEach((n, i) => {
              let item = this.tableImg(h, params, "", n.pictureUrl, () => {
                this.showPicModal(data);
              }, "right-end", this.$common.isEmpty(n.quantity) ? 0 : n.quantity);
              if (i < 3) {
                pos.push(item);
                if (i === 2) {
                  pos.push(
                    h(
                      'span',
                      {
                        style: {
                          marginLeft: '5px'
                        }
                      },
                      '...'
                    )
                  );
                }
              }
            });
            return h('div', pos);
          }
        },
        {
          title: '异常类型',
          key: 'outOfStockStatusConcat',
          align: 'center',
          className: 'stockout-info-column',
          width: 90,
          render: (h, params) => {
            return this.setOutOfStockStatusConcatRender(h, params);
          }
        },
        {
          title: '异常原因',
          key: 'wmsOrderFailReasons',
          align: 'center',
          minWidth: 160,
          render: (h, { row }) => {
            const { orderId, wmsOrderFailReasons } = row;
            if (this.$common.isEmpty(wmsOrderFailReasons)) return h('div', {}, '');
            let demo = [];
            let txt = [];
            let beforeMsg = [];
            let beforeTxt = [];
            // 筛选订单
            wmsOrderFailReasons.forEach(k => {
              if (orderId === k.orderId) {
                if (!this.$common.isEmpty(k.abnormalOutOfStockMsg)) {
                  beforeTxt.push(`${k.packageCode}-${k.abnormalOutOfStockMsg}`);
                  beforeMsg.push(h('p', `${k.packageCode}-${k.abnormalOutOfStockMsg}`));
                }
                if (!this.$common.isEmpty(k.distributionLogisticsMsg)) {
                  txt.push(`${k.packageCode}-${k.distributionLogisticsMsg}`);
                  demo.push(h('p', `${k.packageCode}-${k.distributionLogisticsMsg}`));
                } else if (!this.$common.isEmpty(k.abnormalMessage)) {
                  txt.push(`${k.packageCode}-${k.abnormalMessage}`);
                  demo.push(h('p', `${k.packageCode}-${k.abnormalMessage}`));
                }
              }
            });
            txt = [...beforeTxt, ...txt];
            demo = [...beforeMsg, ...demo];
            if (this.$common.isEmpty(txt)) return h('div', {}, '');
            return h("Tooltip", {
              style: {
                textAlign: "center",
              },
              props: {
                'transfer-class-name': 'table-row-td-tooltip',
                transfer: true,
              }
            }, [
              h('div', {
                slot: 'content'
              }, demo),
              h('div', {
                class: 'lapa-row-td-tooltip',
              }, txt.join('\n'))
            ])
          }
        },
        {
          title: '买家ID/姓名',
          key: 'buyerNames',
          align: 'center',
          width: 130,
          render: (h, params) => {
            return h('div', [
              h('div', {
                style: {
                  color: '#0054A6'
                }
              }, params.row.buyerAccountId), h('div', {
                style: {
                  color: '#ff3300'
                }
              }, params.row.buyerName)
            ]);
          }
        },
        {
          title: '金额',
          key: 'totalPrice',
          width: 100,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('div', params.row.totalPrice), params.row.totalPriceCurrency && h('div', '(' + params.row.totalPriceCurrency + ')')
            ]);
          }
        },
        {
          title: "时间信息",
          key: "payTime",
          minWidth: 200,
          render: (h, { row }) => {
            let rowItem = [];
            if (!this.$common.isEmpty(row.payTime)) {
              rowItem.push(h('div', {}, [
                h('span', {}, '付款时间：'),
                h('span', {}, row.payTime || '')
              ]));
            }
            const synDeliverDate = this.getDataToLocalTime(row.synDeliverDate, 'fulltime');
            if (row.synDeliverStatus == 3 && !this.$common.isEmpty(synDeliverDate)) {
              rowItem.push(h('div', {}, [
                h('span', {}, '已发货，标发货时间：'),
                h('span', {}, synDeliverDate)
              ]));
            } else {
              const remainTime = this.computedTime(row.remainTime);
              if (!this.$common.isEmpty(remainTime)) {
                rowItem.push(h('div', {}, [
                  h('span', {}, '发货剩余：'),
                  h('span', {
                    style: { color: '#f20' }
                  }, remainTime)
                ]));
              }
            }
            return h('div', {}, rowItem);
          }
        },
        {
          title: '标签',
          key: 'tags',
          width: 130,
          render: (h, params) => {
            let orderTagList = params.row.orderTagList;
            let pos = [];
            if (!this.$common.isEmpty(orderTagList)) {
              orderTagList.forEach((n, i) => {
                let item = h('div', [
                  h('Icon', {
                    props: {
                      type: 'pricetag',
                      color: '#f00'
                    },
                    style: {
                      marginRight: '5px'
                    }
                  }),
                  h('span', n.tagName)
                ]);
                pos.push(item);
              });
              return h('div', pos);
            }
          }
        },
        {
          title: '备注',
          key: 'remarkContent',
          align: 'center',
          resizable: true,
          minWidth: 140
        },
        {
          title: '操作',
          key: 'operate',
          align: 'center',
          fixed: 'right',
          className: 'stockout-operate-column',
          width: 180,
          render: (h, { row }) => {
            let operate = [];
            const statusList = row.outOfStockStatusConcat.split(',');
            this.permission.detail && operate.push(h('Button', {
              props: { size: 'small' },
              style: { marginRight: '5px' },
              on: {
                click: () => {
                  this.show(row.orderId);
                  this.orderNo = `${row.accountCode || ''}-${row.salesRecordNumber || ''}`;
                  this.orderTagList = row.orderTagList;
                  this.webstoreItemSite = row.webstoreItemSite;
                }
              }
            }, '订单详情'));
            statusList.includes('4') && operate.push(h('Button', {
              props: { size: 'small' },
              on: {
                click: () => {
                  this.orderDetailData = this.$common.copy(row);
                  this.stockoutOrderVisible = true;
                }
              }
            }, '缺货商品数据'));
            return h('div', operate);
          }
        }
      ],
      orderData: [],
      orderIdList: [],
      setTagListStatus: false,
      shippingMethodModel: [],
      shippingMethodData: [],
      productStatus: false, // 点击产品列表详情状态控制
      productModal: false,
      productDetails: '', // modal产品数据
      orderDetailsBegin: false,
      orderDetailsId: null,
      orderNo: null,
      timestamp: null,
      orderTagList: null,
      webstoreItemSite: null,
      pageDataLoading: false,
      CascaderData: [],
      // 挑选的list
      selectList: [],
      suspendedWay: 0, // 0是选择选中，1是选择所有
      // 截留原因
      suspendedReason: '',
      // 对话框视图
      dialogVisible: false
    };
  },
  watch: {
    pageParamsStatus (n) {
      let v = this;
      if (n) {
        v.getList();
        v.pageParamsStatus = false;
      }
    }
  },
  computed: {
    // 权限
    permission () {
      return {
        // 批量修改邮寄方式
        batchShipping: this.getPermission('orderShippingInfo_batchReplaceShippingMethod'),
        // 批量修改仓库
        batchWarehouse: this.getPermission('orderShippingInfo_batchUpdateWarehouse'),
        // 打标签
        insertTag: this.getPermission('orderTag_insert_batch'),
        // 清空标签
        clearTag: this.getPermission('orderTag_clear'),
        // 导出所有
        exportAll: this.getPermission('orderInfo_exportOrders_all'),
        // 导出选中
        batchExport: this.getPermission('orderInfo_exportOrders_batch'),
        // 批量截留
        batchSuspend: this.getPermission('orderInfo_batch_suspend'),
        // 批量备注
        batchRemark: this.getPermission('orderRemark_insert'),
        // 查询权限
        query: this.getPermission('orderInfo_stockoutOrder'),
        // 查看详情
        detail: this.getPermission('orderInfo_detail'),
        // 取消订单
        cancelOrder: this.getPermission('orderInfo_cancelOrder_batch'),
      }
    },
    platformIdUrlKey () {
      return Object.keys(this.platformItemUrl || {});
    },
    tableHeight () {
      return this.getTableHeight(310);
    }
  },
  created () {
    this.initData();
  },
  activated () {},
  methods: {
    initData () {
      this.pageDataLoading = true;
      this.$common.promiseAll([
        this.GetPlatformGroup,
        this.getWarehouseData,
        this.getOrderListTag
      ]).finally(() => {
        this.pageDataLoading = false;
        this.getList();
      })
    },
    // 获取仓库数据
    getWarehouseData () {
      return new Promise((resolve) => {
        this.axios.post(api.get_warehouseList, { warehouseStatus: '0' }).then(res => {
          if (res && res.data && res.data.code === 0 && res.data.datas) {
            (res.data.datas || []).forEach(item => {
              this.warehouseJson[item.warehouseCode] = item;
            })
            this.warehouseList = res.data.datas || [];
            return resolve(res.data.datas || []);
          }
          resolve([]);
        }).catch(() => {
          resolve([]);
        })
      })
    },
    downloadTemplate () {
      window.open(`${window.location.origin}/order-service/filenode/s/order-service/template/orderImportTemplate.xlsx`);
    },
    // 获取渠道
    GetPlatformGroup () {
      return new Promise((resolve) => {
        this.getHavePlatformGroup().then(res => {
          this.pageParams.platformId = this.$common.isEmpty(res.platformData) ? [] : res.platformData[0].platformId;
          this.shopList = this.$common.copy(res.shopData);
          this.CascaderData = this.$common.copy(res.cascaderData);
          this.platformGroup = this.$common.copy(res.platformData);
          this.$nextTick(() => {
            resolve(true);
          })
        });
      })
    },
    isSearch (obj) {
      let copyParams = JSON.parse(JSON.stringify(obj));
      delete copyParams.pageNum;
      delete copyParams.pageSize;
      delete copyParams.upDown;
      delete copyParams.orderBy;
      let availed = false;
      for (let key in copyParams) {
        if (this.typeOf(copyParams[key]) === 'array') {
          if (copyParams[key].length > 0) {
            availed = true;
          }
        } else if (copyParams[key]) {
          availed = true;
        }
      }
      return availed;
    },
    getParams () {
      let obj = this.deepCopy(this.pageParams);
      obj.payStartTime = null;
      obj.payEndTime = null;
      if (!this.$common.isEmpty(obj.payTime) && !this.$common.isEmpty(obj.payTime[0])) {
        obj.payStartTime = this.getUniversalTime(new Date(obj.payTime[0]).getTime(), 'fulltime');
      }
      if (!this.$common.isEmpty(obj.payTime) && !this.$common.isEmpty(obj.payTime[1])) {
        obj.payEndTime = this.getUniversalTime(new Date(obj.payTime[1]).getTime(), 'fulltime');
      }
      delete obj.payTime;
      let outOfStockStatusList = [];
      obj.outOfStockStatusList.forEach(f => {
        if (this.$common.isString(f) && f.includes(',')) {
          f.split(',').forEach(k => {
            outOfStockStatusList.push(k);
          })
        } else {
          outOfStockStatusList.push(f);
        }
      });
      obj.outOfStockStatusList = outOfStockStatusList;
      return obj;
    },
    getList (type) {
      if (!this.permission.query) return this.$Message.error('您暂无查询权限');
      if (type) {
        this.curPage = 1;
        this.pageParams.pageNum = 1;
      }
      let obj = this.getParams();
      this.orderIdList = [];
      this.orderData = [];
      this.selectList = [];

      this.loadingTrue();
      this.axios.post(api.get_queryForGoodsMissing, obj).then(response => {
        if (response.data.code === 0) {
          let pos = [];
          let orderIdPos = [];
          let saleAccountIdPos = [];
          let data = response.data.datas;
          if (data.list !== null) {
            data.list.forEach((n, i) => {
              pos.push({
                ...n,
                orderCount: n.orderCount, // 订单数量
                webstoreItemSite: n.webstoreItemSite,
                buyerShippingMethod: n.buyerShippingMethod,
                totalPrice: n.totalPrice,
                totalProductsPrice: n.totalProductsPrice,
                buyerAccountId: n.buyerAccountId,
                buyerName: n.buyerName,
                totalShippingFeeIncome: n.totalShippingFeeIncome,
                orderTagList: n.orderTags,
                orderId: n.orderId,
                productList: [],
                payTime: n.payTime,
                isInvalid: n.isInvalid,
                isRefunded: n.isRefunded,
                invalidReason: n.invalidReason,
                salesRecordNumber: n.salesRecordNumber,
                saleAccountId: n.saleAccountId,
                buyerCountryCode: n.buyerCountryCode,
                platformId: n.platformId,
                totalPriceCurrency: n.totalPriceCurrency,
                creationTime: this.getDataToLocalTime(n.createdTime, 'fulltime'),
                salesTime: this.getDataToLocalTime(n.salesTime, 'fulltime'),
                buyerAddress: n.buyerAddress1 + n.buyerAddress2,
                wmsOrderFailReasons: n.wmsOrderFailReasons,
                orderShippingIdAndwarehouseId: n.orderShippingIdAndwarehouseId
              });
              saleAccountIdPos.push(n.saleAccountId);
              orderIdPos.push(n.orderId);
            });
            if (saleAccountIdPos.length > 0) { // 匹配订单号
              const getData = async() => {
                try {
                  const Arr = await this.getAccountCode(pos, saleAccountIdPos);
                  let newArr = await this.getProductList(Arr, orderIdPos);
                  newArr = await this.getOrderRemark(newArr, orderIdPos);// 匹配订单备注
                  this.orderData = newArr;
                } catch (err) {
                  console.error(err);
                }
                this.getImg();
                this.loadingFalse();
              }
              getData();
            } else {
              this.loadingFalse();
            }
            this.$nextTick(() => {
              this.total = Number(data.total);
              this.totalPage = Number(data.pages);
            });
          } else {
            this.orderData = [];
            this.loadingFalse();
            this.$nextTick(() => {
              this.total = 0;
              this.totalPage = 0;
            });
          }
        } else {
          this.loadingFalse();
        }
      }).catch(() => {
        this.loadingFalse();
      })
    },
    // 缺货商品详情隐藏
    stockoutOrderCancel () {
      this.stockoutOrderVisible = false;
    },
    getCarrierBaseSetting (shippingMethodId) {
      let v = this;
      v.axios.get(api.get_shippingMethodParams + '?shippingMethodId=' + shippingMethodId).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          data.forEach((n, i) => {
            v.shippingMethodModel.push({
              value: n.paramType === '1' ? [] : '',
              paramKey: n.paramKey,
              paramValue: n.paramValue
            });
          });
          v.carrierBaseSetting = data;
        } else {
          v.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    show (params) {
      let v = this;
      v.orderDetailsBegin = true;
      v.orderDetailsId = params;
      let date = new Date().getTime();
      v.$nextTick(function () {
        v.orderDetails = true;
        v.timestamp = date;
      });
    },
    showPicModal (data) {
      this.productStatus = true;
      this.$nextTick(() => {
        this.productModal = true;
        this.productDetails = data;
      });
    },
    getSelectValue (value) { // table获取所选值
      this.selectList = value
      let v = this;
      let pos = [];
      Promise.resolve(value.forEach((n, i) => {
        pos.push(n.orderId);
      })).then(() => {
        v.orderIdList = pos;
      });
    },
    tagChange (value) {
      let v = this;
      if (value.indexOf('null') >= 0) {
        v.pageParams.tagIdList = [];
      } else {
        v.pageParams.tagIdList = value;
      }
    },
    getMarkCountryList (h) {
      let pos = [];
      this.formValidate.country.forEach((n, i) => {
        pos.push(h('Option', {
          props: {
            value: n.twoCode,
            key: n
          }
        }, n.cnName));
      });
      return pos;
    },
    resetFilter () {
      this.$refs['pageParams'].resetFields();
      this.$nextTick(() => {
        this.pageParams.payTime = this.$common.getRangeTime('', -1, 'month');
      })
    },
    setShippingMethod (type) {
      let v = this;
      let obj;
      if ((v.orderIdList.length === 0 || v.orderIdList === null) && type !== 'all') {
        v.$Message.error('请选择订单');
        return false;
      }
      if (type !== 'all') {
        obj = {
          orderIdList: v.orderIdList,
          timeZone: localStorage.getItem('timezoom')
        };
      } else {
        obj = v.deepCopy(v.pageParams);
        obj.orderIdList = v.orderIdList;
      }
      v.axios.put(api.export_orders, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.pageParamsStatus = true;
        } else {
          v.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    // 导出所有
    exportOrderHasCondition () {
      if (this.orderData.length < 1) {
        this.$Message.error('没有相关数据');
        return false;
      }
      this.exportOrder('all');
    },
    // 导出
    exportOrder (type) {
      let v = this;
      if ((v.orderIdList.length === 0 || v.orderIdList === null) && type !== 'all') {
        v.$Message.error('请选择订单');
        return false;
      }
      v.exportModelStatus = true;
      if (type === 'all') {
        v.exportModel.title = '导出（所有结果集）';
        v.exportModel.content = '导出所有结果集，系统将符合您当前查询选择的所有订单导出到excel，系统限制一次性只能导出不超过10000单。';
      } else {
        v.exportModel.title = '导出';
        v.exportModel.content = '已取消订单导出';
      }
      v.$nextTick(function () {
        v.exportModel.status = true;
      });
    },
    exportExcel (type) {
      let pageParams = this.getParams();
      let obj = {
        orderIdList: this.orderIdList,
        platformId: [`${this.inGroup}`],
        timeZone: localStorage.getItem('timezoom') === undefined ? 8 : localStorage.getItem('timezoom'),
        orderBy: this.pageParams.orderBy,
        upDown: this.pageParams.upDown
      };
      if (this.exportModel.title === '导出（所有结果集）') {
        obj = Object.assign(obj, pageParams);
        delete obj.orderIdList;
      }
      this.axios.post(api.export_stockOutOrder, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          this.$Message.success({
            content: '已生成导入/导出任务，任务编号' + '：' + data,
            duration: 10,
            closable: true
          });
        }
      });
    },
    // 切换渠道
    getPlatformData (index, item) {
      this.$set(this.pageParams, 'platformId', []);
      this.$set(this.pageParams, 'saleAccountIds', []);
      if (index !== 0) {
        this.pageParams.platformId.push(item.platformId);
      } else {
        this.pageParams.platformId = item.platformId;
      }
      this.platformGroup.map((item, idx) => {
        item.selected = idx === index;
      });
      if (index > 4) {
        let talg = this.platformGroup[1];
        this.platformGroup[1] = this.platformGroup[index];
        this.platformGroup[index] = talg;
      }
      let platformShopData = [];
      this.CascaderData.forEach(getRes => {
        if (this.pageParams.platformId.includes(getRes.value)) {
          platformShopData = [...platformShopData, ...getRes.children];
        }
      });
      this.shopList = this.$common.copy(platformShopData);
      this.$nextTick(() => {
        this.getList();
      })
    },
    // 批量备注
    batchUpdateRemark (str) {
      let updateFilter = this.getParams();
      if (str !== "all") {
        if (this.selectList.length == 0) {
          return this.$Message.error("请选择订单");
        }
        updateFilter = {
          orderNo: this.selectList.map(m => `${m.accountCode}-${m.salesRecordNumber}`).join(',')
        }
      }
      this.moduleRemarkData = {
        filterParams: updateFilter,
        url: api.orderRetrievalBatchInsertRemark
      };
      this.$nextTick(() => {
        this.moduleRemarkVisible = true;
      })
    },
    getImg () {
      let busineseIdList = []
      this.orderData.forEach(itema => {
        itema.productList.forEach(itemb => {
          if (itemb.businessId) busineseIdList.push(itemb.businessId)
        })
      })
      this.axios.post(api.query_imageByProductGoodsIds, busineseIdList).then(res => {
        this.orderData.forEach(itema => {
          itema.productList.forEach(itemb => {
            res.data.datas.forEach(itemc => {
              if (itemc.businessId == itemb.businessId) {
                itemb.pictureUrl = itemc.path;
              }
            })
          })
        })
      })
    },
    suspendedSelect () {
      if (this.selectList.length == 0) return this.$Message.warning('请先选择要截留的订单')
      this.suspendedWay = 0
      this.suspendedReason = ''
      this.dialogVisible = true
    },
    suspendedSelectAll () {
      if (this.orderData.length == 0) return this.$Message.warning('请先查询要截留的订单')
      this.suspendedWay = 2
      this.suspendedReason = ''
      this.dialogVisible = true
    },
    confirm () {
      let pageParams = JSON.parse(JSON.stringify(this.pageParams))
      if (pageParams.isSuspended == 2) pageParams.isSuspended = null
      this.axios.put('/order-service/orderInfo/batchSuspendOrderInfo', {
        batchSuspendedReason: this.suspendedReason,
        orderIdList: this.suspendedWay == 0 ? this.selectList.map(item => { return item.orderId }) : [],
        queryOrderListBo: this.suspendedWay == 2 ? pageParams : {},
        operateType: this.suspendedWay
      }).then(res => {
        this.$Message.success('截留成功')
        this.getList()
      })
    },
    /**
     * 跳转到对应平台
     * @params item 当前操作对象
     * customer 是客服系统
    * */
    goItemUrl (item) {
      if (this.$common.isEmpty(this.platformItemUrl[item.platformId])) return;
      const itemId = item.webstoreItemId || '';
      let amazonAsin = '';
      if (!this.$common.isEmpty(item.orderTransactions) && !this.$common.isEmpty(itemId)) {
        let orderTranInfo = item.orderTransactions.find(op => op.webstoreItemId == itemId);
        orderTranInfo = this.$common.isEmpty(orderTranInfo) ? {} : orderTranInfo.orderTransactionExtend;
        amazonAsin = orderTranInfo.amazonAsin || '';
      }
      const shopeeShopId = item.accountInfo ? item.accountInfo.shopeeShopId || '' : '';
      const openUrl = this.platformItemUrl[item.platformId](itemId, amazonAsin, shopeeShopId);
      window.open(openUrl);
    },
    closeModal () {
      this.productModal = false;
    },
    startCancelDelivery () {
      this.$refs['cancelDelivery'].cancelDelivery();
    },
  },
  mounted () {
    setTimeout(this.getCountrys(), 2000); // 获取国家区域列表
  }
};
</script>
<style lang='less' scoped>
.headerBar {
  .title {
    font-size: 14px;
    color: #333;
  }

  .select_box {
    :deep(.ivu-form-item){
      display: flex;
    }
    :deep(.ivu-select-selection){
      min-width: 200px;
    }
  }

  .lines_box {
    display: flex;
    align-items: center;
    margin-bottom: 30px;

    .spacing_style {
      margin: 0 15px;
    }
  }

  .table_box {
    width: 100%;
    max-height: 381px;
    overflow-y: auto;
    margin: 15px 0 30px 0;
    padding-right: 10px;
    box-sizing: border-box;

    .modal_table {
      width: 100%;
      border: 1px solid #9a9a9a;
      box-sizing: border-box;

      .title {
        font-size: 13px;
        height: 35px;
        line-height: 35px;
        text-align: center;
        color: #000;
        border: none;

        th {
          border: 1px solid #9a9a9a;
        }
      }

      .table_body {
        tr {
          text-align: center;

          td {
            padding: 5px 10px;
            color: #333;
            font-size: 12px;
            border: 1px solid #9a9a9a;
            word-wrap: break-word;
            word-break: break-all;
          }

          .active {
            color: #ff0000;
          }
        }
      }
    }
  }

  .radio_box {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    .radio_title {
      color: #333;
      font-weight: bold;
      font-size: 13px;
    }

    :deep(.ivu-radio-wrapper){
      margin-left: 25px;
    }
  }

  .tips_box {
    width: 100%;
    padding: 30px 0;
    text-align: center;
    font-size: 16px;
    color: #333;
  }
}
.orderTable{
  :deep(.gross-profit-style) {
    .ivu-table-cell{
      text-align: left;
    }
  }
}
</style>
