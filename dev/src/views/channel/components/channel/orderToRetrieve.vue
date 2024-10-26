<template >
  <div>
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
              <dyt-filter :handleTable="false">
                <!-- <Form-item label="选择店铺" prop="saleAccountIds">
                  <dyt-select v-model="pageParams.saleAccountIds" :max-tag-count="1" multiple placeholder="请选择店铺，可输入搜索">
                    <Option v-for="item in shopList" :key="item.saleAccountId" :value="item.saleAccountId"
                      :v="item.saleAccountId">{{ item.accountCode }}</Option>
                  </dyt-select>
                </Form-item> -->
                <Form-item label="店铺" prop="saleAccountIds">
                  <dytStoreSelect
                    v-model="pageParams.saleAccountIds"
                    :option-data="shopList"
                    :replace-option-key="{value: 'saleAccountId', label: 'accountCode'}"
                    placeholder="请选择店铺，可输入搜索"
                    input-placeholder="请输入店铺，多个店铺可用逗号或换行隔开"
                  />
                </Form-item>
                <Form-item label="标签" prop="tagIdList">
                  <dyt-select v-model="pageParams.tagIdList" :max-tag-count="1" multiple placeholder="请选择或搜索标签">
                    <Option v-for="item in tagsList" :key="item.tagId" :value="item.tagId" :v="item.tagId">{{
                        item.tagName
                    }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="发货状态" prop="deliveryStatus">
                  <dyt-select v-model="pageParams.deliveryStatus" placeholder="请选择发货状态">
                    <Option v-for="item in deliveryStatusList" :key="item.id" :value="item.id">{{ item.title }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="创建时间">
                  <Date-picker transfer type="datetimerange" style="width:100%" @on-clear="resetDate"
                    @on-change="getDateValue" :clearable="clearAble" format="yyyy-MM-dd HH:mm:ss" :options="dateOptions"
                    placement="bottom-end" placeholder="选择日期" :value="payTimeArr"></Date-picker>
                </Form-item>
                <Form-item label="订单号" prop="orderNo">
                  <dyt-input-tag type="textarea" :limit="1" :string="true" placeholder="请输入订单号,多个订单号用逗号分隔"
                    v-model="pageParams.orderNo"></dyt-input-tag>
                </Form-item>
                <Form-item label="商品状态" v-if="!isCancelOrder" prop="productStatus">
                  <dyt-select v-model="pageParams.productStatus" placeholder="请选择商品状态">
                    <Option v-for="(item, index) in productStatuList" :value='item.value' :key="`status-${index}`">{{item.label}}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="SKU" prop="webstoreSku">
                  <dyt-input-tag type="textarea" :limit="1" :string="true" placeholder="请输入SKU,多个SKU用逗号分隔"
                    v-model="pageParams.webstoreSku"></dyt-input-tag>
                </Form-item>
                <Form-item v-if="!isCancelOrder" label="映射商品编码" prop="mapperSkuList">
                  <dyt-input-tag type="textarea" :limit="1" placeholder="请输入主映射商品的映射编码(支持查询多个，用逗号或换行分隔)" v-model.trim="pageParams.mapperSkuList" />
                </Form-item>
                <Form-item label="国家/地区" prop="buyerCountryCodeList">
                  <dyt-select v-model="pageParams.buyerCountryCodeList" @on-change="countryChange" :max-tag-count="1"
                    multiple placeholder="请选择或输入所在地" @on-select="countrySelect">
                    <Option value="allCkeckOption">{{ `${pageParams.buyerCountryCodeList.length ===
                        formValidate.country.length ? '取消全选' : '全选'}`
                    }}</Option>
                    <Option v-for="(item, index) in formValidate.country" :key="index" :value="item.twoCode">{{
                        item.enName
                    }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="买家姓名" prop="buyerName">
                  <Input placeholder="请输入买家姓名" v-model.trim="pageParams.buyerName"></Input>
                </Form-item>
                <Form-item label="买家ID" prop="buyerAccountId">
                  <Input placeholder="请输入买家ID" v-model.trim="pageParams.buyerAccountId"></Input>
                </Form-item>
                <Form-item label="仓库" v-if="!isCancelOrder" prop="warehouseCode">
                  <dyt-select
                    v-model="pageParams.warehouseCode"
                    :max-tag-count="1"
                    multiple placeholder="请选择仓库"
                  >
                    <Option v-for="(item, index) in warehouseList" :value='item.warehouseCode' :key="`ware-${index}`">{{item.warehouseName}}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="包裹号" prop="packageCode">
                  <dyt-input-tag type="textarea" :limit="1" :string="true" placeholder="请输入包裹编号，多个包裹编号逗号隔开"
                    v-model="pageParams.packageCode"></dyt-input-tag>
                </Form-item>
                <Form-item label="运单号" prop="orderNo" v-if="!isCancelOrder">
                  <dyt-input-tag type="textarea" :limit="1" :string="true" placeholder="请输入运单号,多个运单号用逗号分隔"
                    v-model="trackingNumbers"></dyt-input-tag>
                </Form-item>
                <Form-item label="已发货">
                  <dyt-select v-model="pageParams.isDelivery" placeholder="请选择">
                    <Option v-for="item in yesOrNot" :key="`isDelivery-${item.value}`" :value="item.value">{{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="有补发">
                  <dyt-select v-model="pageParams.isRedelivery" placeholder="请选择">
                    <Option v-for="item in haveOrNot" :key="`isRedelivery-${item.value}`" :value="item.value">{{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="有异常">
                  <dyt-select v-model="pageParams.isAbnormal" placeholder="请选择">
                    <Option v-for="item in haveOrNot" :key="`isAbnormal-${item.value}`" :value="item.value">{{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <div slot="operation"
                  v-if="isAdmin || controlList.orderInfo_query || getPermission('orderInfo_queryForInvalid')">
                  <Button type="primary" @click="searchOrder" :disabled="SearchDisabled" icon="md-search">查询 </Button>
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
        <Buttons type="primary" trigger="click" @on-click="exportOrderHasCondition"
          v-if="getPermission('orderInfo_exportOrders_batch') || getPermission('orderInfo_exportInvalidOrders_batch')">
          <Button type="primary" @click="exportOrder" class="iconbuttons"
            v-if="getPermission('orderInfo_exportOrders_batch') || getPermission('orderInfo_exportInvalidOrders_batch')">
            <span class="icon iconfont">&#xe639;</span> 导出选中 </Button>
          <Buttons-menu slot="list">
            <Buttons-item name="1"
              v-if="getPermission('orderInfo_exportOrders_all') || getPermission('orderInfo_exportInvalidOrders_all')">
              导出（所有结果集）
            </Buttons-item>
          </Buttons-menu>
        </Buttons>
        <Button class="ml10" type="primary" @click="openInportModal" v-if="!isCancelOrder && getPermission('orderInfo_prepareImportOrder')">导入</Button>
        <Dropdown class="tcDropDown" v-if="getPermission('orderTag_insert_batch') || getPermission('orderTag_clear')">
          <Poptip v-model="setTagListStatus" placement="bottom" :transfer="true">
            <Button icon="md-pricetag">
              打标签
              <Icon type="md-arrow-dropdown" />
            </Button>
            <div slot="content">
              <order-label-tag v-model="tagIdList" :tags-list="tagsList" />
              <div class="tagsSelectFooter">
                <Button size="small" @click="setTag" :disabled="!getPermission('orderTag_insert_batch')">打标签 </Button>
                <Button size="small" @click="dropOrderTag" :disabled="!getPermission('orderTag_clear')">清空标签 </Button>
              </div>
            </div>
          </Poptip>
        </Dropdown>
        <Dropdown class="ml10" v-if="!isCancelOrder">
          <Button type="primary">
            批量操作
            <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem @click.native="batchModifyWarehouse"
              v-if="getPermission('orderShippingInfo_batchUpdateWarehouse')">批量修改仓库
            </DropdownItem>
            <DropdownItem @click.native="batchModifyShippingMethod"
              v-if="getPermission('orderShippingInfo_batchReplaceShippingMethod')">批量修改邮寄方式
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Dropdown class="ml10" v-if="getPermission('orderInfo_batch_suspend')">
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
        </Dropdown>
        <Dropdown class="ml10" v-if="getPermission('orderRemark_insert')">
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
            <Button v-if="item.selected" type="primary" @click="modifyTheSort(index, item.status)" :key="index">
              {{ item.title }}
              <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
              <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
            </Button>
            <Button v-if="!item.selected" @click="modifyTheSort(index, item.status)" :key="index">
              {{ item.title }}
              <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
              <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
            </Button>
          </template>
        </Button-group>
      </div>
    </div>
    <div class="orderTable normalTop"
      v-if="getPermission('orderInfo_query') || getPermission('orderInfo_queryForInvalid')">
      <keep-alive>
        <div v-if="isCancelOrder">
          <!--已取消订单-->
          <Table highlight-row border :height="tableHeight" :loading="tableLoading" :columns="tableColumns"
            :data="orderData" @on-selection-change="getSelectValue"></Table>
        </div>
        <div v-else>
          <Table highlight-row border :height="tableHeight" :loading="tableLoading" :columns="orderColumn"
            :data="orderData" @on-selection-change="getSelectValue"></Table>
        </div>
      </keep-alive>
      <div class="table-page flexBox">
        <keep-alive>
          <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
            :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top"
            :page-size-opts="pageArray"></Page>
        </keep-alive>
      </div>
    </div>
    <!-- 导出 -->
    <keep-alive>
      <Modal v-model="exportModel.status" :mask-closable="false" width="400" v-if="exportModelStatus"
        @on-ok="exportExcel">
        <div class="ivu-modal-confirm">
          <div class="ivu-modal-confirm-head">
            <div class="ivu-modal-confirm-head-title">{{ exportModel.title }}</div>
          </div>
          <div class="ivu-modal-confirm-body ivu-modal-confirm-body-render">
            <div class="normalTop">
              <p>
                {{ exportModel.content }} </p>
              <p class="mt10" v-if="!isCancelOrder">
                <span class="f14">多品订单SKU导出方式选择：</span>
                <RadioGroup v-model="rowCellSetting">
                  <Radio v-for="(item, index) in rowCellSettingList" :key="index" :label="item.value">{{ item.label }}
                  </Radio>
                </RadioGroup>
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </keep-alive>
    <keep-alive>
      <Modal v-model="productModal" :mask-closable="false" v-if="productStatus" :width="600">
        <div class="orderDetailsProductItem">
          <Row v-for="(item, index) in productDetails" :key="index" class="normalTop">
            <Col :span="2">
            <div class="orderDetailsProductItemPic">
              <img :src="setImgPath(item.pictureUrl, true)" :alt="item.title">
            </div>
            </Col>
            <Col :span="17" :offset="1">
            <div class="odpidProductID">
              <span class="productID">{{ item.webstoreItemId }}</span>
              <span class="productHaveATitle">SKU: <em>{{ item.webstoreSku }}</em></span>
              <span class="productHaveATitle">物品所在地: <em>{{ item.location }}</em></span>
              <span class="productLogsticService">物流服务：<em>{{ item.buyerShippingMethod }}</em></span>
            </div>
            <div class="odpidProductDetails">
              {{ item.title }}
            </div>
            <div class="odpidProductParams" v-if="item.variations !== null">
              <span class="productHaveATitle"
                v-if="item.variations.indexOf('color') >= 0 && item.variations.indexOf(';') > 0">Color:<em>{{
                    item.variations.split(': ')[1].split(';')[0]
                }} </em></span>
              <span class="productHaveATitle"
                v-if="item.variations.indexOf('color') >= 0 && item.variations.indexOf(';') < 0">Color:<em>{{
                    item.variations.split(': ')[1]
                }} </em></span>
              <span class="productHaveATitle" v-if="item.variations.toLowerCase().indexOf('pack of') >= 0">Pack of:<em>{{
                  item.variations.split(';')[1].split(': ')[1]
              }}</em></span>
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
    </keep-alive>
    <keep-alive>
      <sliderModal v-model="orderDetails" :spinShow="spinShow" :styles="{}" class="slider-model"
        v-if="orderDetailsBegin">
        <orderDetails :orderDetailsId="orderDetailsId" @reloadTag="reloadTag" :orderNo="orderNo" :timestamp="timestamp"
          @spinLoading="spinLoading" @resetSpinShow="resetSpinShow" @updateList="getList" :orderTagList="orderTagList"
          :webstoreItemSite="webstoreItemSite" :moal-visible.sync="orderDetails" />
      </sliderModal>
    </keep-alive>
    <batchModifyModal ref="batchModifyModal" :order-id-lists="orderIdList" :orderDataProp="orderData" @getList="getList">
    </batchModifyModal>

    <!--导入模态框-->
    <!-- <Modal :mask-closable="false" v-model="switchInportModal" :styles="{ top: '100px', width: '720px' }"
      class="headerBar" :closable="false">
      <p slot="header"><span>导入</span></p>
      <Steps :current="current" style="margin: 20px 0 30px 0;" v-if="current != 2">
        <Step title="上传导入文件"></Step>
        <Step title="匹配LAPA字段"></Step>
        <Step title="查看导入结果"></Step>
      </Steps>
      <div v-if="current === 0">
        <Form :label-width="100" inline>
          <Form-item label="请选择店铺" prop="saleAccountIds">
            <Cascader style="width: 200px;" :data="CascaderData" :load-data="loadDataApi" placeholder="请选择店铺，可输入搜索"
              v-model="selectShopId" transfer></Cascader>
          </Form-item>
          <Form-item label="" style="width: 50%;text-align: right;">
            <Button @click="downloadTemplate">下载模板</Button>
          </Form-item>
        </Form>
        <div class="lines_box">
          <h2 class="title">选择导入文件：</h2>
          <input class="file" name="file" type="file" accept="xlsx,xls,csv" @change="handleSuccess" />
          <span style="margin-left: 150px">支持的文件类型：xlsx、xls、csv</span>
        </div>
      </div>
      <div v-if="current === 1">
        <h2 class="title">设置导入文件表头对应的LAPA字段</h2>
        <div class="table_box">
          <table align='center' style="border-collapse:collapse;" class="modal_table">
            <thead>
              <tr class="title">
                <th>LAPA字段</th>
                <th>处理方法</th>
                <th>Excel文件列标题</th>
              </tr>
            </thead>
            <tbody class="table_body">
              <tr v-for="(item, index) in ImportData" :key="index">
                <td :class="item.required ? 'active' : ''">{{ item.name }}</td>
                <td>
                  <dyt-select v-model="item.type" placeholder="请选择" style="width:100px; text-align: left;">
                    <Option v-for="(ele, ids) in treatment" :value="ele.type" :key="ids">{{ ele.title }}</Option>
                  </dyt-select>
                </td>
                <td>
                  <dyt-select v-model="item.file_value" placeholder="请选择" style="width:170px; text-align: left;"
                    v-show="item.type === 1" filterable>
                    <Option v-for="(talg, idx) in fileData" :value="talg.value" :key="idx">{{ talg.label }}</Option>
                  </dyt-select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="radio_box">
          <span class="radio_title">文件内出现相同的订单号时：</span>
          <RadioGroup v-model="sameOrderPerform">
            <Radio label="0">认为是包含多个SKU的订单</Radio>
            <Radio label="1">报错</Radio>
          </RadioGroup>
        </div>
        <div class="radio_box">
          <span class="radio_title">文件中订单与系统中已经存在的订单重复时：</span>
          <RadioGroup v-model="existOrderPerform">
            <Radio label="0">忽略并导入其他订单</Radio>
            <Radio label="1">报错</Radio>
          </RadioGroup>
        </div>
      </div>
      <div v-if="current === 2">
        <div class="tips_box">生成导入任务成功，导入任务号：{{ +taskNumber + '，' }}请到【导入查看】中查看导入结果</div>
      </div>
      <div slot="footer" style="text-align: center; margin-bottom: 20px;">
        <Button type="primary" @click="okInport">{{ current === 2 ? '查看' : '下一步' }} </Button>
        <Button @click="cancelInport">取消</Button>
      </div>
    </Modal> -->

    <!--选择新旧模板弹窗-->
    <Modal :mask-closable="false" :closable="false" v-model="selectType">
      <div style="padding: 20px; color:#333; font-size: 16px; text-align: center;">是否使用新的导入模板</div>
      <div slot="footer" style="text-align: center; margin-bottom: 20px;">
        <Button type="primary" @click="confirmBtn">确定 </Button>
        <Button @click="cancelBtn">取消</Button>
      </div>
    </Modal>
    <Modal v-model="dialogVisible" title="操作提示" @on-ok="confirm">
      <span> 确认是否要截留订单，数量：</span>
      <span style="color:#ff995c">{{ suspendedWay == 0 ? selectList.length : total }}</span>
      <div style="margin-top:20px">
        截留原因：<Input v-model="suspendedReason" maxlength="200" show-word-limit type="textarea" style="width: 400px" />
      </div>
      <p style="margin-top:30px"> 提示：无法截留的订单将会自动忽略</p>

    </Modal>
    <!-- 批量备注 -->
    <batchRemarkModal :module-visible.sync="moduleRemarkVisible" :module-data="moduleRemarkData" @updateList="getList" />
    <!-- 导入(新改为这个导入-2024-3-7) -->
    <orderImportModal
      :modelVisible.sync="switchInportModal"
      :moduleData="importModalData"
      :chanel="true"
      :hiddenStore="true"
      @refreshTable="getList"
    />
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
import orderImportModal from "@/views/commonOrder/components/commonOrder/orderImportModal.vue";

import { tableRowStatusTxt } from '@/utils/comConfig';

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
    orderImportModal
  },
  data () {
    var self = this;
    return {
      moduleRemarkVisible: false,
      moduleRemarkData: {},
      warehouseList: [], // 仓库数据
      warehouseJson: [],
      productStatuList: productData.productStatus,
      selectType: false,
      current: 0,
      switchInportModal: false,
      platformGroup: [],
      importModalData: {
        cascaderData: []
      },
      file: null,
      payTimeArr: [],
      clearAble: true,
      buttonGroupModel: [
        {
          type: 'createdTime',
          selected: true,
          status: false, // true up false down
          title: '按创建时间'
        }, {
          type: 'payTime',
          selected: false,
          status: false, // true up false down
          title: '按付款时间'
        }
      ],
      orderDetails: false,
      formValidate: {
        country: []
      },
      deliveryStatusList: [
        {
          selected: true,
          id: 88,
          title: '全部'
        }, {
          selected: false,
          id: 5,
          title: '未指定物流方式'
        }, {
          selected: false,
          id: 4,
          title: '已指定物流方式（待下发物流）'
        }, {
          selected: false,
          id: 3,
          title: '已下发物流（待打印）'
        }, {
          selected: false,
          id: 2,
          title: '已打印'
        }, {
          selected: false,
          id: 1,
          title: '已出库'
        }
      ],
      shopModal: [],
      pageParamsStatus: false, // 每次更新完pageParms都要设置成true触发刷新
      totalPage: 0,
      total: 0,
      curPage: 1,
      trackingNumbers: '',
      pageParams: {
        pageNum: 1,
        pageSize: 50,
        productStatus: '', // 商品状态
        tagIdList: [],
        platformId: [],
        mapperSkuList: [],
        buyerCountryCodeList: [],
        payStartTime: null,
        isRedelivery: null,
        payEndTime: null,
        createdStartTime: null,
        createdEndTime: null,
        saleAccountIds: [],
        hasAfterSalesOrder: null,
        upDown: 'down',
        merchantCarrierId: null,
        warehouseCode: [],
        merchantShippingMethodId: null,
        orderBy: 'createdTime',
        deliveryStatus: 88,
        priceOperator: null,
        webstoreSku: null,
        orderNo: null,
        rehandleStatus: null,
        buyerAccountId: null,
        buyerName: null,
        packageCode: null,
        isDelivery: null,
        isAbnormal: null
      },
      deliveryStatus: 88,
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
          minWidth: 240,
          fixed: "left",
          render: (h, params) => {
            const orderDetailView = this.getPermission("orderInfo_detail");
            let itemText = [
              h('div', {
                style: { margin: '5px 0' }
              },
              [
                h('span', {}, '订单号：'),
                h('span', {
                  attrs: {
                    title: orderDetailView ? '查看订单详情' : ''
                  },
                  style: {
                    color: orderDetailView ? "#0054A6" : "#515a6e",
                    cursor: orderDetailView ? "pointer" : 'initial'
                  },
                  on: {
                    click: () => {
                      if (orderDetailView) {
                        self.show(params.row.orderId);
                        self.orderNo = params.row.accountCode + "-" + params.row.salesRecordNumber;
                        self.orderTagList = params.row.orderTagList;
                        self.webstoreItemSite = params.row.webstoreItemSite;
                      }
                    }
                  }
                }, `${params.row.accountCode || ''}-${params.row.salesRecordNumber || ''}`),
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
                      this.$common.copyToClip(`${params.row.accountCode || ''}-${params.row.salesRecordNumber || ''}`).then(() => {
                        this.$Message.success('复制订单号成功');
                      }).catch(() => {
                        this.$Message.error('当前浏览器不支持复制功能');
                      })
                    }
                  }
                }, '')
              ])
            ];
            if (!this.$common.isEmpty(params.row.accountCode)) {
              itemText.push(h('span', {
                attrs: {
                  title: '店铺'
                },
                class: 'table-row-td-tag',
                style: {
                  color: '#2d8cf0'
                },
              }, params.row.accountCode))
            }
            if (!this.$common.isEmpty(params.row.buyerCountryCode)) {
              itemText.push(h('span', {
                attrs: {
                  title: '国家/地区'
                },
                class: 'table-row-td-tag',
                style: {
                  color: '#147602'
                },
              }, params.row.buyerCountryCode))
            }
            if (!this.$common.isEmpty(params.row.status)) {
              const rowStatus = params.row.status.split(',');
              this.productStatuList.forEach(item => {
                if (rowStatus.includes(item.value.toString())) {
                  itemText.push(h('span', {
                    attrs: {
                      title: '商品状态'
                    },
                    class: 'table-row-td-tag',
                    style: {
                      color: '#2bb92b'
                    },
                  }, item.label))
                }
              })
            }
            if ([3, '3'].includes(params.row.synDeliverStatus) || ([0, '0'].includes(params.row.remainTime) && !this.$common.isEmpty(params.row.remainTime))) {
              itemText.push(h('span', {
                attrs: {
                  title: '标发货'
                },
                class: 'table-row-td-tag',
                style: {
                  color: '#35beff'
                },
              }, '已标发货'))
            }
            if ([7, '7'].includes(params.row.orderStatus)) {
              itemText.push(h('span', {
                attrs: {
                  title: '已发货'
                },
                class: 'table-row-td-tag',
                style: {
                  color: '#5d35ff'
                },
              }, '已发货'))
            }
            if ([1, '1'].includes(params.row.isHand) && !['JIT'].includes(params.row.orderType)) {
              itemText.push(h('span', {
                attrs: {
                  title: '手工单'
                },
                class: 'table-row-td-tag',
                style: {
                  color: '#bb35ff'
                },
              }, '手工单'))
            }
            if (['JIT'].includes(params.row.orderType)) {
              itemText.push(h('span', {
                attrs: {
                  title: 'JIT'
                },
                class: 'table-row-td-tag',
                style: {
                  color: 'rgba(98 89 102)',
                  background: 'rgba(103, 82, 114, 0.1)'
                },
              }, 'JIT'))
            }
            if (typeof params.row.redelivery === 'boolean' && params.row.redelivery) {
              itemText.push(h('span', {
                attrs: {
                  title: '有补发'
                },
                class: 'table-row-td-tag',
                style: {
                  color: '#9c00b9'
                },
              }, '有补发'))
            }
            if (!this.$common.isEmpty(params.row.wmsOrderFailReasons)) {
              // 筛选出异常
              const abnormalOrderlist = params.row.wmsOrderFailReasons.filter((k) => {
                return params.row.orderId === k.orderId && !this.$common.isEmpty(k.abnormalMessage);
              });
              if (abnormalOrderlist.length > 0) {
                itemText.push(h('span', {
                  attrs: {
                    title: '异常订单'
                  },
                  class: 'table-row-td-tag',
                  style: {
                    color: '#ff0000'
                  },
                }, '有异常'))
              }
            }
            if ([1, 2, '1', '2'].includes(params.row.isInvalid)) {
              itemText.push(h('span', {
                attrs: {
                  title: '作废订单'
                },
                class: 'table-row-td-tag',
                style: {
                  color: '#e14343'
                },
              }, '已作废'))
            }
            if (typeof params.row.goodMiss === 'boolean' && params.row.goodMiss) {
              itemText.push(h('span', {
                attrs: {
                  title: '缺货订单'
                },
                class: 'table-row-td-tag',
                style: {
                  color: '#ffa500'
                },
              }, '缺货'))
            }
            if ([1, '1'].includes(params.row.isRefunded)) {
              itemText.push(h('span', {
                attrs: {
                  title: '有退款'
                },
                class: 'table-row-td-tag',
                style: {
                  color: '#f75dcf'
                },
              }, '有退款'))
            }
            if ([1, '1'].includes(params.row.isPartRefunded)) {
              itemText.push(h('span', {
                attrs: {
                  title: '部分退款'
                },
                class: 'table-row-td-tag',
                style: {
                  color: '#bb509f'
                },
              }, '部分退款'))
            }
            if ([1, '1'].includes(params.row.hasAfterSales)) {
              itemText.push(h('span', {
                attrs: {
                  title: '有售后单'
                },
                class: 'table-row-td-tag',
                style: {
                  color: '#4400c9'
                },
              }, '有售后单'))
            }
            return itemText;
          }
        },
        {
          title: '渠道',
          key: 'channel',
          align: 'center',
          // fixed: 'left',
          width: 120,
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
        // {
        //   title: '店铺ID/名称',
        //   key: 'productList',
        //   align: 'center',
        //   width: 150,
        //   render: (h, params) => {
        //     let v = this;
        //     let channel_id = '';
        //     let channel_name = '';
        //     v.shopListData.map(item => {
        //       if (item.saleAccountId === params.row.saleAccountId) {
        //         channel_id = item.accountCode;
        //         channel_name = item.account;
        //       }
        //     });
        //     return h('div', channel_id + ' / ' + channel_name);
        //   }
        // },
        {
          title: '买家ID/姓名',
          key: 'buyerNames',
          align: 'center',
          width: 140,
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
        // {
        //   title: '目的地',
        //   key: 'buyerAddress',
        //   align: 'center',
        //   width: 140
        // },
        // {
        //   title: '运费',
        //   key: 'totalShippingFeeIncome',
        //   align: 'center'
        // },
        {
          title: '金额',
          key: 'totalPrice',
          width: 120,
          align: 'center',
          render: (h, params) => {
            return h('div', {}, `${params.row.totalPrice || 0} ${params.row.totalPriceCurrency || ''}`);
          }
        },
        {
          title: '毛利详情',
          key: 'grossProfit',
          width: 180,
          align: 'center',
          className: 'gross-profit-style',
          render: (h, { row }) => {
            let item = [];
            const grossProfit = this.$common.isEmpty(row.grossProfit) ? '' : Number(row.grossProfit.replace(/[^.|\-|0-9]/g, ''));
            const grossMargin = this.$common.isEmpty(row.grossMargin) ? '' : Number(row.grossMargin.replace(/[^.|\-|0-9]/g, ''));
            const remote = this.$common.isEmpty(row.remote) ? '' : Number(row.remote.replace(/[^.|\-|0-9]/g, ''));
            !this.$common.isEmpty(grossProfit) && grossProfit != 0 && item.push(h('div', {}, `预估毛利润：${row.grossProfit || ''}`));
            !this.$common.isEmpty(grossMargin) && grossMargin != 0 && item.push(h('div', {}, `预估毛利率：${row.grossMargin || ''}`));
            !this.$common.isEmpty(remote) && remote != 0 && item.push(h('div', {}, `偏远地区费用：${row.remote || ''}`));
            return h('div', {}, item);
          }
        },
        {
          title: "异常",
          key: "salesTime",
          align: "left",
          width: 70,
          render: (h, params) => {
            // 筛选出该订单下的异常原因
            const { orderId, wmsOrderFailReasons } = params.row;
            if (this.$common.isEmpty(wmsOrderFailReasons)) return '';
            // 筛选订单
            const messageList = wmsOrderFailReasons.filter((k) => {
              return orderId === k.orderId && !this.$common.isEmpty(k.abnormalMessage);
            }).map(m => {
              return h('p', `${m.packageCode}-${m.abnormalMessage}`)
            })
            if (this.$common.isEmpty(messageList)) return '';
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
              }, messageList),
              h('icon', {
                class: 'icon lapa lapa-warning',
                style: {
                  'color': '#f20',
                  'font-size': '20px',
                  'cursor': 'pointer'
                }
              })
            ])
          }
        },
        {
          title: "时间信息",
          key: "payTime",
          minWidth: 170,
          render: (h, { row }) => {
            let itemTxt = [];
            if (row.creationTime) {
              itemTxt.push(h('div', {}, `创建时间：${row.creationTime.substring(0, 16)}`));
            }
            if (row.salesTime) {
              itemTxt.push(h('div', {}, `下单时间：${row.salesTime.substring(0, 16)}`));
            }
            if (row.payTime) {
              const payTime = this.$common.toLocaleDate(row.payTime, "fulltime");
              itemTxt.push(h('div', {}, `付款时间：${payTime.substring(0, 16)}`));
            }
            if ([3, '3'].includes(row.synDeliverStatus)) {
              if (row.synDeliverDate) {
                const deliverDate = this.$common.toLocaleDate(row.synDeliverDate, "fulltime");
                itemTxt.push(h('div', {}, `标发货时间：${deliverDate.substring(0, 16)}`));
              }
            } else if (!this.$common.isEmpty(row.remainTime)) {
              const time = [0, '0'].includes(row.remainTime) ? '逾期' : this.getLimitTime(row.remainTime, true);
              itemTxt.push(h('div', [
                h('span', '发货剩余：'),
                h('span', {
                  style: {
                    color: '#f20'
                  }
                }, time)
              ]));
            }
            return h('div', {
              style: {
                margin: '5px 0'
              }
            }, itemTxt);
          }
        },
        {
          title: '出库单信息',
          key: 'createdBy',
          minWidth: 190,
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.orderPackageVOS)) return '';
            let itemTxt = [];
            return row.orderPackageVOS.map(m => {
              itemTxt = [];
              if (!this.$common.isEmpty(m.packageCode)) {
                itemTxt.push(h('div', [
                  h('span', {
                    attrs: {
                      title: '出库单号'
                    }
                  }, m.packageCode),
                  h('icon', {
                    class: 'icon lapa lapa-copy',
                    attrs: {
                      title: '复制出库单号'
                    },
                    style: {
                      cursor: "pointer",
                      'margin-left': '6px'
                    },
                    on: {
                      click: () => {
                        this.$common.copyToClip(`${m.packageCode || ''}`).then(() => {
                          this.$Message.success('复制出库单号成功');
                        }).catch(() => {
                          this.$Message.error('当前浏览器不支持复制功能');
                        })
                      }
                    }
                  }, '')
                ]))
              }
              if (!this.$common.isEmpty(m.trackingNumber)) {
                itemTxt.push(h('div', [
                  h('span', {
                    attrs: {
                      title: '跟踪号'
                    }
                  }, m.trackingNumber),
                  h('icon', {
                    class: 'icon lapa lapa-copy',
                    attrs: {
                      title: '复制跟踪号'
                    },
                    style: {
                      cursor: "pointer",
                      'margin-left': '6px'
                    },
                    on: {
                      click: () => {
                        this.$common.copyToClip(`${m.trackingNumber || ''}`).then(() => {
                          this.$Message.success('复制跟踪号成功');
                        }).catch(() => {
                          this.$Message.error('当前浏览器不支持复制功能');
                        })
                      }
                    }
                  }, '')
                ]))
              }
              const statusObj = tableRowStatusTxt(this.warehouseList, m);
              if (!this.$common.isEmpty(m.pickingStatus) && !this.$common.isEmpty(statusObj)) {
                itemTxt.push(h('div', [
                  h('span', {
                    attrs: {
                      title: '出库单状态'
                    },
                    class: 'table-row-td-tag',
                    style: {
                      color: statusObj.color
                    },
                  }, statusObj.txt)
                ]))
              }
              return h('div', {
                style: {
                  margin: '5px 0'
                }
              }, itemTxt);
            })
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
                  }), h('span', n.tagName)
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
          minWidth: 150
        },
        // {
        //   title: '操作',
        //   key: 'operate',
        //   align: 'center',
        //   width: 140,
        //   fixed: 'right',
        //   render: (h, params) => {
        //     if (params.row !== undefined) {
        //       return h('div', [
        //         !self.getPermission('orderInfo_detail') || h('Button', {
        //           props: {
        //             size: 'small'
        //           },
        //           style: {
        //             marginRight: '5px'
        //           },
        //           on: {
        //             click: () => {
        //               self.show(params.row.orderId);
        //               self.orderNo = params.row.accountCode + '-' + params.row.salesRecordNumber;
        //               self.orderTagList = params.row.orderTagList;
        //               self.webstoreItemSite = params.row.webstoreItemSite;
        //             }
        //           }
        //         }, '订单详情')
        //       ]);
        //     }
        //   }
        // }
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
      ImportData: [ // type:1  为--映射  type:2  为--留空
        {
          name: '订单号（必填）',
          type: 1,
          file_value: '',
          required: true,
          key: 'thirdPartyNo'
        }, {
          name: '商品标题（必填）',
          type: 1,
          file_value: '',
          required: true,
          key: 'productTitle'
        }, {
          name: '交易号',
          type: 2,
          file_value: '',
          required: false,
          key: 'webstoreItemId'
        }, // 交易号
        {
          name: '买家账号',
          type: 2,
          file_value: '',
          required: false,
          key: 'buyerAccountId'
        }, // 买家账号
        {
          name: '买家邮箱',
          type: 2,
          file_value: '',
          required: false,
          key: 'buyerEmail'
        }, // 买家邮箱
        {
          name: '收货人姓名（必填）',
          type: 1,
          file_value: '',
          required: true,
          key: 'buyerName'
        }, // 收货人姓名
        {
          name: '地址1（必填）',
          type: 1,
          file_value: '',
          required: true,
          key: 'buyerAddress1'
        }, // 地址1
        {
          name: '地址2',
          type: 2,
          file_value: '',
          required: false,
          key: 'buyerAddress2'
        }, {
          name: '省/州（必填）',
          type: 1,
          file_value: '',
          required: true,
          key: 'buyerState'
        }, // 省/州
        {
          name: '城市（必填）',
          type: 1,
          file_value: '',
          required: true,
          key: 'buyerCity'
        }, // 城市
        {
          name: '邮编',
          type: 2,
          file_value: '',
          required: false,
          key: 'buyerPostalCode'
        }, // 邮编
        {
          name: '(国家/地区)名称/代码（必填）',
          type: 1,
          file_value: '',
          required: true,
          key: 'buyerCountryCode'
        }, // (国家/地区)名称/代码（必填）
        {
          name: '电话',
          type: 2,
          file_value: '',
          required: false,
          key: 'buyerPhone'
        }, // 电话
        {
          name: '手机',
          type: 2,
          file_value: '',
          required: false,
          key: 'buyerMobile'
        }, // 手机
        {
          name: '买家选择的运输方式',
          type: 2,
          file_value: '',
          required: false,
          key: 'buyerShippingMethod'
        }, // 买家选择的运输方式
        {
          name: '订单币种（必填）',
          type: 2,
          file_value: '',
          required: true,
          key: 'totalPriceCurrency'
        }, // 订单币种
        {
          name: '买家支付的运费',
          type: 2,
          file_value: '',
          required: false,
          key: 'totalShippingFeeIncome'
        }, // 买家支付的运费
        {
          name: '买家支付的税金',
          type: 2,
          file_value: '',
          required: false,
          key: 'totalTaxIncome'
        }, // 买家支付的税金
        {
          name: '买家支付的保险',
          type: 2,
          file_value: '',
          required: false,
          key: 'totalInsuranceIncome'
        }, // 买家支付的保险
        {
          name: '订单总金额（必填）',
          type: 2,
          file_value: '',
          required: true,
          key: 'totalPrice'
        }, // 订单总金额
        {
          name: '收件人识别编码',
          type: 2,
          file_value: '',
          required: false,
          key: 'buyerPassportCode'
        }, // 收件人识别编码
        {
          name: '货品SKU（必填）',
          type: 1,
          file_value: '',
          required: true,
          key: 'webstoreSku'
        }, // 货品SKU
        {
          name: '数量（必填）',
          type: 1,
          file_value: '',
          required: true,
          key: 'quantity'
        }, // 数量
        {
          name: '商品总金额',
          type: 2,
          file_value: '',
          required: false,
          key: 'totalProductsPrice'
        }, // 商品总金额
        {
          name: '产品链接',
          type: 2,
          file_value: '',
          required: false,
          key: 'pictureUrl'
        }, // 产品链接
        {
          name: '交易流水号',
          type: 2,
          file_value: '',
          required: false,
          key: 'webstoreOrderTransactionId'
        }, // 交易流水号
        {
          name: '付款时间',
          type: 2,
          file_value: '',
          required: false,
          key: 'payTime'
        } // 付款时间
      ],
      treatment: [
        {
          type: 1,
          title: '映射'
        }, {
          type: 2,
          title: '留空'
        }
      ],
      fileData: [],
      sameOrderPerform: '0',
      existOrderPerform: '0',
      selectShopId: [],
      CascaderData: [],
      importList: {},
      import_data: {},
      taskNumber: '',
      value2: [],
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
    tableHeight () {
      return this.getTableHeight(335);
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
      if (obj.deliveryStatus === 88) {
        obj.deliveryStatus = null;
      }
      let warehouseIds = [];
      obj.warehouseCode.forEach(item => {
        if (this.warehouseJson[item]) {
          warehouseIds.push(this.warehouseJson[item].warehouseId);
        }
      })
      delete obj.warehouseCode;
      obj.warehouseIdList = warehouseIds;
      return this.orderToRetrieveParams(obj);
    },
    getList () {
      if (!this.getPermission('orderInfo_query')) return this.$Message.error('暂无权限');
      let obj = this.getParams();
      this.orderIdList = [];
      this.orderData = [];
      this.selectList = [];
      let apiUrl = '';
      if (this.isCancelOrder) {
        apiUrl = api.get_queryForInvalid;
      } else {
        apiUrl = api.get_searchOrders;
        if (!this.isSearch(obj)) {
          this.$Message.info('请添加搜索条件');
          this.tableLoading = false;
          this.SearchDisabled = false;
          return;
        }
      }

      this.loadingTrue();
      this.axios.post(apiUrl, JSON.stringify(obj)).then(response => {
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
            this.$nextTick(function () {
              this.total = Number(data.total);
              this.totalPage = Number(data.pages);
            });
          } else {
            this.orderData = [];
            this.loadingFalse();
            this.$nextTick(function () {
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
      this.shippingMethodModel = [];
      this.trackingNumbers = '';
      this.resetDate();
      this.payTimeArr = [];
      this.pageParams.hasAfterSalesOrder = null;
      this.pageParams.productStatus = '';
      this.pageParams.tagIdList = [];
      this.pageParams.mapperSkuList = [];
      this.pageParams.buyerCountryCodeList = [];
      this.pageParams.payStartTime = null;
      this.pageParams.isRedelivery = null;
      this.pageParams.payEndTime = null;
      this.pageParams.saleAccountIds = [];
      this.pageParams.merchantCarrierId = null;
      this.pageParams.warehouseCode = [];
      this.pageParams.merchantShippingMethodId = null;
      this.pageParams.deliveryStatus = 88;
      this.pageParams.priceOperator = null;
      this.pageParams.webstoreSku = null;
      this.pageParams.orderNo = null;
      this.pageParams.rehandleStatus = null;
      this.pageParams.buyerAccountId = null;
      this.pageParams.buyerName = null;
      this.pageParams.packageCode = null;
      this.pageParams.isDelivery = null;
      this.pageParams.isAbnormal = null;
      this.$refs['pageParams'].resetFields();
    },
    searchOrder () {
      let v = this;
      // isCancelOrder 已取消订单 也调用这里
      v.search();
    },
    exportOrderHasCondition () { // 导出选中
      if (this.orderData.length < 1) {
        this.$Message.error('没有相关数据');
        return false;
      }
      this.exportOrder('all');
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
    exportOrder (type) {
      let v = this;
      if ((v.orderIdList.length === 0 || v.orderIdList === null) && type !== 'all') {
        v.$Message.error('请选择订单');
        return false;
      }
      v.exportModelStatus = true;
      if (type === 'all') {
        v.exportModel.title = '导出（所有结果集）';
        v.exportModel.content = '导出所有结果集，系统将符合您当前查询选择的所有订单导出到excel，系统限制一次性只能导出不超过100000单。';
      } else {
        v.exportModel.title = '导出选中';
        v.exportModel.content = '系统将您勾选的订单导出到excel';
      }
      v.$nextTick(function () {
        v.exportModel.status = true;
      });
    },
    exportExcel (type) {
      let v = this;
      let obj = {
        orderIdList: v.orderIdList,
        platformId: [this.inGroup],
        timeZone: localStorage.getItem('timezoom') === undefined ? 8 : localStorage.getItem('timezoom'),
        orderBy: v.pageParams.orderBy,
        upDown: v.pageParams.upDown
      };
      if (v.exportModel.title === '导出（所有结果集）') {
        obj = Object.assign(obj, this.getParams());
        delete obj.orderIdList;
      }
      if (obj.deliveryStatus === 88) {
        obj.deliveryStatus = null;
      }
      // let newTab = window.open('about:blank');
      let apiUrl = '';
      if (v.isCancelOrder) {
        apiUrl = api.export_cancelOrder;
      } else {
        apiUrl = api.export_orders;
        obj.rowCellSetting = v.rowCellSetting;
      }
      v.axios.post(apiUrl, JSON.stringify(obj)).then(response => {
        if (response.data.code === 0) {
          v.orderIdList = [];
          v.pageParamsStatus = true;
          let data = response.data.datas;
          v.$Message.success({
            content: '已生成导入/导出任务，任务编号' + '：' + data,
            duration: 10,
            closable: true
          });
          // let erpCommon = v.$store.state.erpConfig;
          // newTab.location.href = erpCommon.filenodeViewTargetUrl + response.data.datas;
          // setTimeout(function () {
          //   newTab.close();
          // }, 1000);
        } else {
          v.$Message.error('操作失败，请重新尝试');
        }
      });
    },
    showPicModal (data) {
      var v = this;
      v.productStatus = true;
      v.$nextTick(function () {
        v.productModal = true;
        v.productDetails = data;
      });
    },
    closeModal () {
      this.productModal = false;
    },
    modifyTheSort (index, status) {
      let v = this;
      v.pageParams.orderBy = v.buttonGroupModel[index].type;
      v.buttonGroupModel.forEach((n, i) => {
        if (i === index && n.selected) {
          v.buttonGroupModel[index].status = !v.buttonGroupModel[index].status;
        } else if (i === index && !n.selected) {
          n.selected = true;
        } else {
          n.selected = false;
        }
      });
      v.pageParams.upDown = v.buttonGroupModel[index].status ? 'up' : 'down';
      if (v.orderData.length > 0) {
        v.pageParamsStatus = true;
      }
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

    // 动态加载渠道下对应的店铺
    loadDataApi (item, callback) {
      item.loading = true;
      let v = this;
      let query = {
        platformIds: [item.value],
        subsystemCode: 'order-service'
      };
      v.axios.post(api.get_querySaleAccounts, JSON.stringify(query)).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          let pos = [];
          if (data.length > 0) {
            data.map((item) => {
              pos.push({
                value: item.saleAccountId,
                label: item.accountCode
              });
            });
            item.children = pos;
            item.loading = false;
            callback();
          } else {
            item.children = pos;
            item.loading = false;
            v.$Message.warning('没有相关记录');
            callback();
          }
        } else {
          item.loading = false;
          item.children = [];
        }
      }).catch(() => {
        item.loading = false;
        item.children = [];
      });
    },

    // 导入按钮
    openInportModal () {
      this.importModalData = {
        uploadUrl: api.import_channel_data,
        templateUrl: `${window.location.origin}/order-service/filenode/s/order-service/template/orderImportTemplate.xlsx`,
        cascaderData: this.CascaderData
      }
      this.$nextTick(() => {
        this.switchInportModal = true;
      });
    },

    // 取消导入
    cancelInport () {
      this.switchInportModal = false;
      this.current = 0;
      this.file = null;
      this.selectShopId = [];
    },

    // 上传文件
    handleSuccess (e) {
      let file = e.target.files[0];
      this.file = file;
    },

    // 导入--下一步
    okInport () {
      if (this.current === 0) {
        if (this.selectShopId.length <= 0) {
          this.$Message.error('请选择店铺');
          return false;
        }

        if (this.file === null) {
          this.$Message.error('选择需要导入的文件');
          return false;
        }

        let index = this.file.name.lastIndexOf('.');
        let file_name = this.file.name.substr(index + 1);
        let file_type = ['xlsx', 'xls', 'csv'];
        if (file_type.indexOf(file_name) > -1) {
          let param = new FormData(); // 创建form对象
          param.append('files', this.file);
          param.append('platformId', this.selectShopId[0]);
          param.append('saleAccountId', this.selectShopId[1]);
          this.axios.post(api.import_channel, param).then((response) => {
            if (response.data.code === 0) {
              let data = response.data.datas;
              this.import_data = data;
              this.handerImport(data);
            }
          });
        } else {
          this.$Message.error('文件格式有误');
          return false;
        }
      }

      if (this.current === 1) {
        let data = this.ImportData;
        for (let i = 0; i < data.length; i++) {
          if (data[i].type === 1 && data[i].file_value === '') {
            this.$Message.error(data[i].name + '不能为空' + '！');
            return false;
          }

          if (data[i].required && data[i].file_value === '') {
            this.$Message.error(data[i].name + '不能为空' + '！');
            return false;
          }
        }

        let templateJson = {};
        data.map((item) => {
          // eslint-disable-next-line eqeqeq
          if (item.type === 1 && item.file_value != '') {
            templateJson[item.key] = item.file_value;
          }
        });
        let query = {
          fileName: this.import_data.fileName,
          filePath: this.import_data.filePath,
          platformId: this.import_data.platformId,
          saleAccountId: this.import_data.saleAccountId,
          sameOrderPerform: this.sameOrderPerform,
          existOrderPerform: this.existOrderPerform,
          templateJson: JSON.stringify(templateJson)
        };
        this.axios.post(api.import_channel_data, JSON.stringify(query)).then((response) => {
          if (response.data.code === 0) {
            this.taskNumber = response.data.datas;
            this.current += 1;
          }
        });
      }
      if (this.current === 2) {
        this.cancelInport();
        this.$router.push('/importTask');
      }
    },

    // 处理模板数据
    handerImport (data) {
      this.fileData = [];
      if (data.previousTemplate === null) {
        this.ImportData.map((item) => {
          item.type = 2;
        });
        this.current += 1;
        if (data.currentTitles.length > 0) {
          data.currentTitles.map((item, index) => {
            this.fileData.push({
              label: item,
              value: item
            });
          });
        }
      } else {
        let sortArr = [];
        for (let key in data.previousTemplate) {
          this.ImportData.map((item, index) => {
            item.type = 2;
            if (item.key === key) {
              sortArr.push({
                currenIndex: index,
                name: data.previousTemplate[key]
              });
            }
          });
        }
        if (data.currentTitles.length > 0 && sortArr.length > 0) {
          let newArr = [];
          for (let i = 0; i < sortArr.length; i++) {
            if (data.currentTitles.indexOf(sortArr[i].name) > -1) {
              newArr.push(sortArr[i]);
            }
            // for (let j = 0; j< data.currentTitles.length; j++) {
            //   if (sortArr[i].name != data.currentTitles[j]) {
            //     this.selectType = true;
            //     return false;
            //   } else {
            //     sortArr.map((ele, ids) => {
            //       this.ImportData[ele.currenIndex].type = 1;
            //       this.ImportData[ele.currenIndex].file_value = ele.name;
            //       this.fileData.push({
            //         label: ele.name,
            //         value: ele.name
            //       })
            //     });
            //     this.current += 1;
            //     this.selectType = false;
            //     return false;
            //   }
            // }
          }
          if (newArr.length > 0) {
            this.current += 1;
            this.selectType = false;
            newArr.map((item) => {
              this.ImportData[item.currenIndex].type = 1;
              this.ImportData[item.currenIndex].file_value = item.name;
            });
            data.currentTitles.map((item) => {
              this.fileData.push({
                label: item,
                value: item
              });
            });
          } else {
            this.selectType = true;
          }
        }
      }
    },

    // 使用新模板的确定按钮
    confirmBtn () {
      let data = this.import_data.currentTitles;
      this.ImportData.map((item) => {
        item.type = 2;
        item.file_value = '';
      });
      data.map((ele, ids) => {
        this.fileData.push({
          label: ele,
          value: ele
        });
      });
      this.current += 1;
      this.selectType = false;
    },

    // 使用新模板的取消按钮
    cancelBtn () {
      let data = this.import_data.previousTemplate;
      let sortArr = [];
      for (let key in data) {
        this.ImportData.map((item, index) => {
          item.type = 2;
          if (item.key === key) {
            sortArr.push({
              currenIndex: index,
              name: data[key]
            });
          }
        });
      }
      sortArr.map((ele, ids) => {
        this.ImportData[ele.currenIndex].type = 1;
        this.ImportData[ele.currenIndex].file_value = ele.name;
        this.fileData.push({
          label: ele.name,
          value: ele.name
        });
      });
      this.current += 1;
      this.selectType = false;
    },
    getDateValue (value) { // 获取日期返回值
      let v = this;
      if (value.length === 0) {
        v.$Message.error('日期格式有误');
        v.resetDate();
      } else {
        if (!value[0]) {
          v.pageParams.createdStartTime = null;
          v.pageParams.createdEndTime = null;
        } else {
          v.pageParams.createdStartTime = v.getUniversalTime(new Date(value[0]).getTime(), 'fulltime');
          v.pageParams.createdEndTime = v.getUniversalTime(new Date(value[1]).getTime(), 'fulltime');
        }
      }
    },
    resetDate () {
      this.pageParams.createdStartTime = null;
      this.pageParams.createdEndTime = null;
    },
    // 批量备注
    batchUpdateRemark (str) {
      let updateFilter = this.getParams();
      updateFilter.orderType = 0;
      if (str !== "all") {
        if (this.selectList.length == 0) {
          return this.$Message.error("请选择订单");
        }
        updateFilter = {
          orderType: 0,
          orderNo: this.selectList.map(m => `${m.accountCode}-${m.salesRecordNumber}`).join(',')
        }
      } else if (!this.isSearch(updateFilter)) {
        return this.$Message.info("请添加搜索条件");
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
              if (itemc.businessId == itemb.businessId) itemb.pictureUrl = itemc.path
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
    // 点击当前选项时
    countrySelect (val) {
      if (!['allCkeckOption'].includes(val.value)) return;
      this.$nextTick(() => {
        const allCheck = this.pageParams.buyerCountryCodeList.filter(f => f !== 'allCkeckOption');
        if (this.formValidate.country.length === allCheck.length) {
          this.$set(this.pageParams, 'buyerCountryCodeList', []);
          return;
        }
        this.$set(this.pageParams, 'buyerCountryCodeList', this.formValidate.country.map(m => m.twoCode));
      })
    },
    setPayTimeArr () {
      let end = new Date();
      let start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 3);
      this.payTimeArr = [start, end];
      this.getDateValue(this.payTimeArr);
    },
    selectChange (val) {
      this.selectList = val
    }
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
