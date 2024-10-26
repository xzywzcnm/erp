<template>
  <div class="sellStockOut">
    <div v-if="workShow === 'list'" class="listPage">
      <div class="searchMain">
        <Form ref="searchParams" :model="searchParams" :label-width="90">
          <dyt-filter ref="dyt-filter" @expand="expand">
            <Form-item label="出库单状态：" prop="outListStatus">
              <dyt-select v-model="searchParams.outListStatus" :multiple="true" :max-tag-count="1">
                <Option v-for="item in outListStatusList" :value="item.value" :key="item.value" :label="item.label">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="出库单类型：" prop="outListType">
              <dyt-select v-model="searchParams.outListType" :multiple="true" :max-tag-count="1">
                <template v-for="(item, index) in outListTypeList">
                  <Option :value="item.value" :label="item.label" v-if="!item.importHide" :key="index + 'im'" />
                </template>
              </dyt-select>
            </Form-item>
            <Form-item label="创建时间：" prop="createTime">
              <DatePicker type="daterange" transfer placeholder="选择日期" style="width: 100%"
                v-model="searchParams.createTime"></DatePicker>
            </Form-item>
            <Form-item label="创建人：" prop="createdBys">
              <dyt-select v-model="searchParams.createdBys" :multiple="true" :max-tag-count="1">
                <Option v-for="item in $store.getters.userInfoList" :key="item.userId" :label="item.userName"
                  :value="item.userId"></Option>
              </dyt-select>
            </Form-item>
            <Form-item label="出库单编号：" prop="outListNo">
              <dyt-input-tag :limit="1" :string="true" type="textarea" v-model.trim="searchParams.outListNo"
                placeholder="多个出库单请用逗号或回车分隔" />
            </Form-item>
            <Form-item label="参考编号：" prop="referenceNo">
              <dyt-input-tag :limit="1" :string="true" type="textarea" v-model.trim="searchParams.referenceNo"
                placeholder="多个编号请用逗号或回车分隔" />
            </Form-item>
            <Form-item label="销售渠道：" prop="channelSell">
              <dyt-select v-model="searchParams.channelSell" :multiple="true" :max-tag-count="1">
                <Option v-for="item in channelSellList" :value="item.value" :key="item.value" :label="item.label">
                </Option>
              </dyt-select>
            </Form-item>
            <Form-item label="物流方式：">
              <Cascader transfer :load-data="loadData" @on-change="changeShippingMethod" :data="shippingMethodData"
                filterable v-model="shippingMethodModel" change-on-select></Cascader>
            </Form-item>
            <Form-item label="包裹类型：" prop="packType">
              <dyt-select v-model="searchParams.packType" :multiple="true" :max-tag-count="1">
                <Option v-for="item in packTypeList" :value="item.value" :key="item.value" :label="item.label"></Option>
              </dyt-select>
            </Form-item>
            <Form-item label="拣货完成：" prop="picked">
              <dyt-select v-model="searchParams.picked">
                <Option value="1">Y</Option>
                <Option value="0">N</Option>
              </dyt-select>
            </Form-item>
            <Form-item label="拣货单号：" prop="pickNo">
              <dyt-input-tag :limit="1" :string="true" type="textarea" v-model.trim="searchParams.pickNo"
                placeholder="多个编号请用逗号回车分隔" />
            </Form-item>
            <!-- <Form-item label="增值服务：" prop="valueAddedServiceList">
              <dyt-select v-model="searchParams.valueAddedServiceList">
                <Option v-for="(item, i) in valueAddServicesOption" :key="i + 'valueAddedServiceList'" :label="item.label"
                  :value="item.value">
                </Option>
              </dyt-select>
            </Form-item> -->
            <div slot="operation">
              <Button type="primary" @click="searchData" :disabled="SearchDisabled" icon="ios-search" class="mr10">查询
              </Button>
              <Button @click="reset" v-once icon="md-refresh">重置</Button>
            </div>
          </dyt-filter>
        </Form>
      </div>
      <!--工具栏-->
      <div class="funMain">
        <div class="funMain__flex">
          <div style="display:flex;align-items:center;">
            <Button type="primary" @click="newStockOutList" icon="md-add"
              :disabled="!getPermission('wmsPicking_createPicking')">创建出库单
            </Button>
            <Button type="primary" @click="clickAssignBatch(0)" class="ml10"
              :disabled="!getPermission('wmsPicking_createOtherPickingGoods_batch')">生成拣货单
            </Button>
            <Dropdown @on-click="exportAllOrSlt" style="margin-left: 5px">
              <Button type="primary"><span class="icon iconfont" style="font-size: 12px">&#xe639;</span>导出
                <Icon type="md-arrow-dropdown"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem name="0" v-if="getPermission('wmsPicking_export_batch')">导出选中列表</DropdownItem>
                <DropdownItem name="1" v-if="getPermission('wmsPicking_export_all')">导出所有列表</DropdownItem>
                <DropdownItem name="2" v-if="getPermission('wmsPicking_export_batch')">导出选中明细</DropdownItem>
                <DropdownItem name="3" v-if="getPermission('wmsPicking_export_all')">导出所有明细</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Button type="primary" @click="openInportModal" icon="md-archive" style="margin-left: 5px"
              :disabled="!getPermission('wmsPicking_import')">导入
            </Button>
            <Dropdown @on-click="batchOption" style="margin-left: 5px">
              <Button icon="ios-copy-outline">批量操作
                <Icon type="md-arrow-dropdown"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem name="3" v-if="getPermission('wmsPicking_modifyDistributionAll_batch')">批量分配
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
          <div>
            <dyt-sortBySelect :sortButtonList="sortButtonList" @sortInfo="getSortInfoAndFetch">
            </dyt-sortBySelect>
          </div>
        </div>
      </div>
      <!--表格-->
      <div class="tableMain">
        <div class="tableBox">
          <Table border highlight-row ref="selection" :columns="columns" :loading="TableLoading" :data="data"
            @on-selection-change="tableChange" :height="tableHeight"></Table>
        </div>
      </div>
      <!--分页-->
      <div class="pagesMain">
        <Page :total="tableItemTotal" :current="searchParams.pageNum" :page-size="searchParams.pageSize" show-total
          show-sizer show-elevator @on-change="pageNumChange" @on-page-size-change="pageSizeChange"
          :page-size-opts="pageArray"></Page>
      </div>
    </div>
    <!--生成拣货单-->
    <div v-if="createPickListModel">
      <Modal class="createPick" v-model="createPickListModel" title="生成拣货单">
        <createPickList :apiParams="tableSltData" :apiCondition="searchParams" type="other" :createType="createType"
          @closeSuccess="closeSuccess" :sortedType="true" :maxsku="true"></createPickList>
      </Modal>
    </div>
    <!--详情-->
    <div v-if="workShow === 'detail'">
      <sellStockOutDtl ref="sellStockOutDtl" :pickingNo="pickingNo" :workType="workType" :workShow="workShow"
        :warehouseOverseaType="warehouseOverseaType" :pickingRow="pickingRow"></sellStockOutDtl>
    </div>
    <!--新建出库单-->
    <div v-if="workShow === 'create'">
      <newStockOutList></newStockOutList>
    </div>
    <!-- 导入前的模态框 -->
    <Modal v-model="switchInportModal" :styles="{ top: '80px', width: '520px' }" title="导入库位" class="headerBar">
      <inportBeforeDownload @insertSuccess="switchInportModal = false" :importUrl="importUrl" :headObj="headObj"
        :wareId="wareId" :templateTypes="['O12'].includes(pickingType) ? 'TemuImport' : '1'" :pickingType='pickingType'>
      </inportBeforeDownload>
      <span>导入出库单类型：</span>
      <dyt-select v-model="pickingType" style="width:200px;margin:10px 0 0 0" :clearable="false">
        <template v-for="(item, index) in outListTypeList">
          <Option :value="item.value" :label="item.label" v-if="!item.importHide" :key="index + 'im'" />
        </template>
      </dyt-select>
      <div slot="footer">
        <Button @click="cancelInport">取消</Button>
      </div>
    </Modal>
    <!-- amazonFba 发货 -->
    <Modal v-model="amazonFbaModal" v-if="amazonFbaModalStatus" :styles="{ top: '80px', width: '800px' }" title="发货"
      class="headerBar">
      <div style="marginLeft:20px;">
        <!-- 步骤条 -->
        <Steps :current="deliveryStep" style="marginLeft:50px;">
          <Step title="上传物流信息"></Step>
          <Step title="上传装箱清单"></Step>
          <Step title="打印外箱标签"></Step>
          <Step title="发货"></Step>
        </Steps>
        <div style="marginTop:20px;">
          <Card dis-hover>
            <!-- 步骤1 -->
            <div v-if="deliveryStep === 0">
              <h3>1. 上传物流信息</h3>
              <div style="margin:20px;">
                <span>运输类型：</span>
                <RadioGroup v-model="shipmentType" style="marginLeft:10px;">
                  <Radio label="SP">小包裹快递</Radio>
                  <Radio label="LTL">零担货运/货车荷载 (LTL/FTL)</Radio>
                </RadioGroup>
              </div>
              <div style="marginLeft:20px;">
                <span>承运人：</span> <Select style="width:220px;marginLeft:20px;" v-model="carrierName">
                  <Option v-for="item in carrierNameList" :value="item.id" :key="item.id"> {{ item.label }}</Option>
                </Select>
              </div>
            </div>
            <!-- 步骤2 -->
            <div v-if="deliveryStep === 1">
              <h3>2. 上传装箱清单</h3>
              <Table style="marginTop:15px;" :columns="boxColumns" :data="boxData"></Table>
            </div>
            <!-- 步骤3 -->
            <div v-if="deliveryStep === 2">
              <h3>3. 打印外箱标签</h3>
              <div style="marginTop:10px;">
                <span>请选择纸张类型：</span> <Select style="width:220px;marginLeft:20px;" v-model="pageType">
                  <Option v-for="item in pageTypeList" :value="item.value" :key="item.value"> {{ item.label }}</Option>
                </Select>
              </div>
              <Table style="marginTop:15px;" :columns="printBoxColumns" :data="boxData"></Table>
            </div>
            <!-- 步骤4 -->
            <div v-if="deliveryStep === 3">
              <h3>4. 发货</h3>
              <div style="margin:20px;">
                <span style="color: red;"> * </span> <span>跟踪单号：</span> <Input v-model.trim="trackingNumber"
                  style="width:220px;marginLeft:80px;"></Input>
              </div>
              <div style="margin:20px;">
                <span>计费类型：</span>
                <RadioGroup v-model="billingType" style="marginLeft:80px;">
                  <Radio label="kg">千克（KG）</Radio>
                  <Radio label="cmb">立方米（CBM）</Radio>
                </RadioGroup>
              </div>
              <div style="margin:20px;">
                <span>头程运费（CNY）：</span> <Input v-model.trim="firstShippingFee"
                  style="width:220px;marginLeft:20px;"></Input>
              </div>
              <div style="margin:20px;">
                <span>头程报关（CNY）：</span> <Input v-model.trim="firstTariff" style="width:220px;marginLeft:20px;"></Input>
              </div>
              <div style="margin:20px;">
                <span>其他费用（CNY）：</span> <Input v-model.trim="otherFee" style="width:220px;marginLeft:20px;"></Input>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <div slot="footer" style="text-align: center;">
        <Button style="marginRight:15px;" v-if="deliveryStep === 2" type="primary" @click="print">打印</Button>
        <Button v-if="deliveryStep !== 3" type="primary" @click="nextOne">下一步</Button>
        <Button v-if="deliveryStep === 3" type="primary" @click="delivery">发货</Button>
      </div>
    </Modal>
    <!-- 打印条码 -->
    <Modal v-model="printModal" v-if="printModalStatus" :styles="{ top: '80px', width: '870px' }" class="headerBar"
      :closable="false" title="打印FNSKU标签" :mask-closable="false">
      <div>
        <Card dis-hover>
          <div>
            <span>介质材料</span> <span style="marginLeft:20px;marginRight:10px;">宽</span>
            <InputNumber v-model.trim="printParams.width" :max="100" @on-change="changeWidth"
              style="width:50px;marginRight:10px;" size="small"></InputNumber>
            mm <span style="marginLeft:20px;marginRight:10px;">高</span>
            <InputNumber v-model.trim="printParams.height" :max="100" @on-change="changeHeight"
              style="width:50px;marginRight:10px;" size="small"></InputNumber>
            mm <span style="marginLeft:20px;color:red;fontSize:12px;">最大支持100mm X 100mm</span>
          </div>
          <div style="marginTop:15px;">
            <span>标签大小</span> <span style="marginLeft:20px;marginRight:10px;">条码字体</span>
            <InputNumber v-model.trim="printParams.barcodeSize" style="width:50px;marginRight:10px;" size="small"
              @on-change="changeBarSize"></InputNumber>
            pt <span style="marginLeft:20px;marginRight:10px;">条码高度</span>
            <InputNumber v-model.trim="printParams.barcodeHeight" style="width:50px;marginRight:10px;" size="small"
              @on-change="changeBarHeight"></InputNumber>
            pt <span style="marginLeft:20px;color:red;fontSize:12px;">每pt约占0.35mm宽，请确保最长的SKU字符数*左侧pt值*0.35小于介质尺寸</span>
          </div>
          <div style="marginTop:15px;">
            <span>商品编号</span> <Select style="width:150px;marginLeft:35px;" v-model="printParams.productNo"
              @on-change="changeProNo">
              <Option :value="0">不打印SKU</Option>
              <Option :value="1">打印SKU</Option>
            </Select>
          </div>
          <div style="marginTop:15px;">
            <span>自定义内容</span> <Select style="width:150px;marginLeft:20px;" v-model="printParams.custom">
              <Option :value="0">不打印自定义内容</Option>
              <Option :value="1">打印自定义内容</Option>
            </Select> <Input v-if="printParams.custom" v-model.trim="tagContent"
              style="width:150px;marginLeft:20px;"></Input>
            <Button v-if="printParams.custom" style="marginLeft:10px;" type="primary" size="small" @click="addTag">增加
            </Button>
            <Tag class="tag" v-if="printParams.custom" v-for="(item, index) in tagList" :key="index" closable
              @on-close="delConfirm(index)" style="margin:5px;">
              {{ item }}
            </Tag>
            <span style="float:right;fontSize:12px;color:green;marginTop:20px;">注:打印内容可拖动改变位置</span>
          </div>
        </Card>
      </div>
      <div style="marginTop:15px;">
        <Row>
          <Col span="12">
          <div>
            <Row style="marginBottom:10px;">
              <Col span="14">货品</Col>
              <Col span="10">
              统一设置打印数量
              <InputNumber :active-change="false" v-model.trim="printParams.printNum" style="width:50px" size="small"
                @on-blur="changePrintNum"></InputNumber>
              </Col>
            </Row>
            <Table border :columns="printColumns" :data="printData"></Table>
          </div>
          </Col>
          <Col span="12">
          <Card dis-hover
            style="marginLeft:5px;height:300px;background:#e8e8e8;overflow:auto;display:flex;justify-content:center;align-items:center;">
            <div :style="pageClass" ref="container" class="container">
              <div ref="draggable0" class="draggable" :style="barCodeClass" v-if="printData.length">
                {{ printData[0].fnskuBarCode }}
              </div>
              <div ref="draggable1" class="draggable">NEW</div>
              <div ref="draggable2" class="draggable" v-if="printData.length">
                {{ printData[0].fnsku }}
              </div>
              <div ref="draggable3" class="draggable" v-if="printData.length">
                {{ printData[0].title }}
              </div>
              <div ref="draggable4" class="draggable" v-if="printData.length && printParams.productNo">
                {{ printData[0].sku }}
              </div>
              <template v-if="tagList.length">
                <div v-for="(item, index) in tagList" style="float:left;" :ref="`draggable${(index + 5)}`"
                  class="draggable" :key="`draggable-${index}`">
                  {{ item }}
                </div>
              </template>
            </div>
          </Card>
          </Col>
        </Row>
      </div>
      <div slot="footer">
        <Button type="primary" @click="printBarcode">确定</Button>
        <Button @click="cancelPrintBarcode">取消</Button>
      </div>
    </Modal>
    <!-- 打印超重标签 -->
    <Modal v-model="printWeightModal" v-if="printWeightModalStatus" :styles="{ top: '80px', width: '400px' }" title="语言选择"
      class="headerBar">
      <div style="marginLeft:20px;">
        <RadioGroup v-model="printLanguage" vertical>
          <Radio label="uk">英语</Radio>
          <Radio label="de">德语</Radio>
          <Radio label="fr">法语</Radio>
          <Radio label="es">西班牙语</Radio>
          <Radio label="it">意大利语</Radio>
        </RadioGroup>
      </div>
      <div slot="footer">
        <Button type="primary" @click="printWeight">确定</Button>
        <Button @click="cancelPrintWeight">取消</Button>
      </div>
    </Modal>
    <div ref="tagTemp" style="display: none;"></div>
    <!--冻结分配弹窗-->
    <freezeAssignmentModal ref="frozenModal" :frozenModalTalg="frozenModalTalg" :deliveryOrder="deliveryOrder"
      @updateData="updateData" :mulSearchInput="true"></freezeAssignmentModal>
  </div>
</template>
<script>
import dropDown from '@/views/wms/components/common/dropDownOpt';
import createPickList from './createPickList';
import sellStockOutDtl from './otherStockOut/sellStockOutDtl';
import freezeAssignmentModal from './freezeAssignmentModal';
import newStockOutList from './newStockOutList';
import inportBeforeDownload from '../wms-inWareManage/inportBeforeDownload';
import api from '@/api/api';
import common from '@/components/mixin/common_mixin';
// import Draggabilly from 'draggabilly';
import tableHeight_mixin from '@/components/mixin/tableHeight_mixin';
import { outListTypeList } from './otherStockOut/fileData';

export default {
  mixins: [common, tableHeight_mixin],
  components: {
    dropDown,
    createPickList,
    sellStockOutDtl,
    newStockOutList,
    inportBeforeDownload,
    freezeAssignmentModal,
    // Draggabilly
  },
  data() {
    var v = this;
    return {
      frozenModalTalg: 'list',
      switchInportModal: false,
      warehouseOverseaType: '',
      loading: false,
      createType: '',
      workShow: 'list',
      workType: 'otherStock',
      pickingNo: '', // 传入详情的参数
      createPickListModel: false,
      tableItemTotal: 0,
      tableSltData: [],
      importUrl: api.importUrl,
      assignList: [
        {
          label: '生成拣货单（所有结果集）',
          value: '1',
          flagCode: ['1'],
          status: '1'
        }
      ],
      wareId: v.getWarehouseId(),
      searchParams: {
        // ware: ['*'], // 仓库
        cargoOwnerType: null,
        cargoOwnerId: null,
        createdBys: [],
        createTime: [],
        outListStatus: [], // 出库单状态
        outListType: [], // 出库单类型
        outListNo: '', // 出库单编号
        referenceNo: '', // 参考编号
        channelSell: [], // 销售渠道
        logisticType: null, // 物流方式
        packType: [], // 包裹类型
        picked: '', // 拣货完成
        pickNo: '', // 拣货单号
        pageNum: 1,
        pageSize: 50,
        cacheClickVal: 'CT', // 排序缓存值
        orderSeq: 'DESC',
        // valueAddedServiceList: null,
      },
      searchMore: false,
      wareList: [], // 仓库列表
      apiLogisterList: [], // 物流商
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
          label: '完全发货',
          value: '4'
        }
        // { label: '分配失败', value: '7' }
        // { label: '出库取消', value: '6' }
      ],
      outListTypeList: outListTypeList,
      channelSellList: [
        {
          label: 'Ebay',
          value: '00'
        }, {
          label: 'Amazon',
          value: '01'
        }, {
          label: 'Aliexpress',
          value: '02'
        }
      ],
      packTypeList: [
        {
          label: '单品',
          value: 'SS'
        }, // { label: '单品多件', value: 'SM' },
        {
          label: '多品',
          value: 'MM'
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
          sortHeader: "按出库单状态",
          sortField: "WS",
          sortType: "DESC",
        },
      ],
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: '出库单编号',
          key: 'pickingNo',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            if (this.getPermission('wmsPicking_queryPickingDetail')) {
              return h('a', {
                on: {
                  click: () => {
                    // v.$store.commit('pickingType', params.row.pickingType);
                    v.pickingNo = params.row.pickingNo;
                    v.warehouseOverseaType = params.row.warehouseOverseaType;
                    v.pickingRow = v.$common.copy(params.row);
                    v.workShow = 'detail';
                  }
                }
              }, params.row.pickingNo);
            } else {
              return h('div', params.row.pickingNo);
            }
          }
        }, {
          title: '出库单类型',
          width: 120,
          align: 'center',
          key: 'type',
          render: (h, params) => {
            let list = (this.outListTypeList || []).filter(k => params.row.pickingType === k.value);
            const type = list[0] && list[0].label;

            if (params.row.warehouseOverseaType) {
              return h('div', [
                h('div', type), h('div', {
                  style: {
                    color: '#169bd5'
                  }
                }, params.row.warehouseOverseaType)
              ]);
            } else {
              return h('div', type);
            }
          }
        }, {
          title: '出库单状态',
          width: 110,
          align: 'center',
          key: 'status'
        }, {
          title: '参考编号',
          align: 'center',
          width: 170,
          key: 'referenceNo',
          render(h, params) {
            if (params.row.referenceNo2) {
              return h('div', {}, [
                h('span', params.row.referenceNo + '/'), h('span', v.sepCommasFn(params.row.referenceNo2).join('/'))
              ]);
            } else {
              return h('div', {}, [h('span', params.row.referenceNo)]);
            }
          }
        }, {
          title: '发货数量',
          align: 'center',
          width: 120,
          key: 'expectedNumberSum'
        }, {
          title: '拣货单',
          align: 'center',
          minWidth: 120,
          // key: 'pickingGoodsNo',
          render: (h, params) => {
            return h('div', params.row.pickingGoodsNo);
          }
        }, {
          title: '拣货状态',
          width: 100,
          align: 'center',
          key: 'pickStatus'
        }, {
          title: '发货完成时间',
          align: 'center',
          width: 160,
          key: 'deliverFinishTime'
        }, {
          title: '创建人',
          align: 'center',
          width: 100,
          key: 'createdName',
          render(h, { row }) {
            return h('div', [
              h('div', row.createdName || '-'),
              h('div', row.businessUnit || '-'),
            ])
          }
        }, {
          title: '创建时间',
          align: 'center',
          width: 160,
          key: 'createdTime'
        }, {
          title: '操作',
          key: 'h',
          align: 'center',
          width: 160,
          fixed: 'right',
          render: (h, params) => {
            let list = [];
            if (params.row.pickingGoodsNo !== null) {
              list = [
                {
                  code: '发货',
                  value: '3',
                  flagCode: ['2'],
                  status: v.getPermission('wmsPicking_moidfyDeliverGoods')
                    ? params.row.pickingStatus
                    : -1
                },
              ]
            } else {
              list = [
                {
                  code: '取消分配',
                  value: '2',
                  flagCode: ['1', '2'],
                  status: v.getPermission('wmsPicking_modifyDistributionCancelAll')
                    ? params.row.pickingStatus
                    : -1
                }, {
                  code: '发货',
                  value: '3',
                  flagCode: ['2'],
                  status: v.getPermission('wmsPicking_moidfyDeliverGoods')
                    ? params.row.pickingStatus && params.row.pickingGoodsNo
                    : -1
                }, {
                  code: '删除',
                  flagCode: ['1'],
                  status: v.getPermission('wmsPicking_obsoletePicking') && params.row.pickingStatus < 3
                    ? '1'
                    : '',
                  value: '7'
                }
              ]
            }
            return h(dropDown, {
              props: {
                dropList: [
                  {
                    code: '查看',
                    value: '0',
                    flagCode: ['0', '1', '2', '3', '4', '5', '6'],
                    status: v.getPermission('wmsPicking_queryPickingDetail')
                      ? params.row.pickingStatus
                      : -1
                  },
                  {
                    code: '分配按订单',
                    value: '1',
                    flagCode: ['0', '1'],
                    status: v.getPermission('wmsPicking_modifyDistributionAll_single')
                      ? params.row.pickingStatus
                      : -1
                  },
                  {
                    code: '打印条码',
                    value: '4',
                    flagCode: ['1'],
                    status: params.row.warehouseOverseaType !== null
                      ? '1'
                      : '0'
                  },
                  {
                    code: '打印超重标签',
                    value: '5',
                    flagCode: ['1'],
                    status: params.row.warehouseOverseaType !== null
                      ? '1'
                      : '0'
                  },
                  {
                    code: '装箱',
                    value: '6',
                    flagCode: ['1'],
                    status: params.row.boxStatus !== 2 && params.row.needBox === 1 && params.row.packageGoodsStatus === '1'
                      ? '1'
                      : '0'
                  },
                  {
                    code: '冻结分配',
                    value: '8',
                    flagCode: ['0', '1', '8'],
                    status: v.getPermission('wmsPicking_otherPickingDistributionFrozen')
                      ? params.row.pickingStatus
                      : -1
                  },
                  ...list,
                ],
                styleData: { width: '110px' },
                txt: '操作',
                listenNormal: false
              },
              on: {
                nameValBack: val => {
                  v.pickingRow = v.$common.copy(params.row);
                  if (val === '1') {
                    // 分配按订单
                    this.dropOption(api.assign_all, '不能重复分配', params.row);
                  } else if (val === '0') {
                    v.pickingNo = params.row.pickingNo;
                    v.warehouseOverseaType = params.row.warehouseOverseaType;
                    v.workShow = 'detail';
                  } else if (val === '2') {
                    // 取消
                    this.dropOption(api.cancel_stockAll, '不能重复取消', params.row);
                  } else if (val === '3') {
                    // 发货
                    // uploadCarrierStatusint 上传物流状态(0:未上传 3:上传成功)
                    // uploadBoxStatusint 上传装箱清单状态(0:未上传 3:上传成功)
                    // printBoxLabelStatusint 打印箱子标签状态(0:未打印 3:已打印)
                    if (params.row.uploadCarrierStatus === 3) {
                      if (params.row.uploadBoxStatus === 3) {
                        if (params.row.printBoxLabelStatus === 3) {
                          v.deliveryStep = 3;
                        } else {
                          v.deliveryStep = 2;
                        }
                      } else {
                        v.deliveryStep = 1;
                      }
                    } else {
                      v.deliveryStep = 0;
                    }
                    if (params.row.warehouseOverseaType === 'AMAZON_FBA') {
                      this.amazonFbaModal = true;
                      this.amazonFbaModalStatus = true;
                      this.pickingId = params.row.pickingId;
                      this.getBoxList(params.row.pickingId);
                      if (v.deliveryStep === 2) {
                        let colunm = [
                          {
                            title: '装箱状态',
                            key: 'status',
                            align: 'center',
                            minWidth: 120,
                            render: (h, params) => {
                              return h('div', {
                                style: {
                                  color: '#008000'
                                }
                              }, '已上传');
                            }
                          }
                        ];
                        this.printBoxColumns = this.boxColumns.concat(colunm);
                      }
                    } else {
                      if (params.row.packageGoodsStatus === '0') {
                        this.$Message.warning({
                          content: '未拣货不能发货',
                          duration: 5
                        });
                        return;
                      }
                      this.dropOption(api.deliver_goods, '不能重复发货', params.row);
                    }
                  } else if (val === '4') {
                    // 打印条码
                    this.printModal = true;
                    this.printModalStatus = true;
                    this.fnPickingNo = params.row.pickingNo;
                    this.getPrintData();
                    this.showPrint();
                  } else if (val === '5') {
                    // 打印超重标签
                    this.printWeightModal = true;
                    this.printWeightModalStatus = true;
                  } else if (val === '6') {
                    // 装箱
                    v.pickingNo = params.row.pickingNo;
                    v.warehouseOverseaType = params.row.warehouseOverseaType;
                    v.workShow = 'detail';
                    v.$nextTick(function () {
                      v.$refs.sellStockOutDtl.encasement();
                    });
                  } else if (val === '7') {
                    v.isDelModal(() => {
                      v.axios.put(api.del_obsoletePicking + params.row.pickingId).then(response => {
                        if (response.data.code === 0) {
                          if (response.data.datas && response.data.datas.errorCode === 999993) {
                            v.$Message.error(response.data.datas.error);
                          } else {
                            v.$Message.success('删除成功');
                            v.searchFn();
                          }
                        }
                      });
                    });
                  } else if (val === '8') { // 冻结分配
                    v.$refs.frozenModal.frozenModal = true;
                    v.deliveryOrder = params.row.pickingNo;
                  }
                }
              }
            }, []);
          }
        }
      ],
      data: [],
      amazonFbaModal: false, // fba发货
      amazonFbaModalStatus: false,
      deliveryStep: 0, // 步骤条
      pickingId: null, // 上传物流信息
      shipmentType: 'SP',
      carrierName: null,
      carrierNameList: [
        {
          id: 'other',
          label: 'other'
        }
      ], // 上传装箱清单
      boxColumns: [
        {
          title: 'NO.',
          key: '',
          align: 'center',
          width: 100,
          render: (h, params) => {
            return h('div', params.index + 1);
          }
        }, {
          title: '箱号',
          key: 'boxCode',
          align: 'center',
          minWidth: 120
        }, {
          title: 'SKU',
          key: 'goodsSku',
          align: 'center',
          minWidth: 120
        }, {
          title: '中文描述',
          key: 'goodsCnDesc',
          align: 'center',
          minWidth: 120
        }, {
          title: '英文描述',
          key: 'goodsEnDesc',
          align: 'center',
          minWidth: 120
        }, {
          title: '装箱数量',
          key: 'quantity',
          align: 'center',
          minWidth: 120
        }
      ], //  打印外箱标签
      pageType: null,
      pageTypeList: [
        {
          label: 'PackageLabel_Letter_2',
          value: 'PackageLabel_Letter_2'
        }, {
          label: 'PackageLabel_Letter_6',
          value: 'PackageLabel_Letter_6'
        }, {
          label: 'PackageLabel_A4_2',
          value: 'PackageLabel_A4_2'
        }, {
          label: 'PackageLabel_A4_4',
          value: 'PackageLabel_A4_4'
        }, {
          label: 'PackageLabel_Plain_Paper',
          value: 'PackageLabel_Plain_Paper'
        }
      ],
      printBoxColumns: [],
      boxData: [], // 发货
      trackingNumber: null,
      billingType: 'kg',
      firstShippingFee: null,
      firstTariff: null,
      otherFee: null,
      nextStatus: false, // 打印外箱标签状态控制，需先打印，才能继续下一步
      printModal: false,
      printModalStatus: false,
      printWeightModal: false,
      printWeightModalStatus: false,
      printLanguage: 'uk',
      printParams: {
        width: 60,
        height: 40,
        barcodeSize: 12,
        barcodeHeight: 20,
        siteInfo: 0,
        productNo: 0,
        custom: 0,
        printNum: 1
      },
      printParamsCopy: null,
      printColumns: [
        {
          title: 'SKU/FNSKU',
          key: 'sku',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('div', [
              h('div', params.row.sku), h('div', params.row.fnsku)
            ]);
          }
        }, {
          title: '标题',
          key: 'title',
          align: 'center',
          minWidth: 120
        }, {
          title: '打印数量',
          key: 'num',
          align: 'center',
          minWidth: 100,
          render: (h, params) => {
            return h('Input', {
              props: {
                value: this.printData[params.index].number,
                size: 'small'
              },
              on: {
                input: val => {
                  this.printData[params.index].number = val;
                }
              }
            });
          }
        }
      ],
      printData: [],
      fnPickingNo: null, // 1mm=3.5146pt
      pageClass: {
        width: '210pt',
        height: '140pt',
        background: '#fff',
        textAlign: 'center',
        overflow: 'hidden'
      },
      pageClassCopy: null,
      barCodeClass: {
        fontFamily: 'IDAutomationC128S',
        lineHeight: '22pt',
        fontSize: '12pt',
        height: '20pt'
      },
      barCodeClassCopy: null,
      tagContent: null,
      tagList: [],
      deliveryOrder: null,
      pickingType: 'O3',
      pickingRow: {},
      // valueAddServicesOption: [
      //   {
      //     label: '抽真空',
      //     value: 0
      //   },
      //   {
      //     label: '质检',
      //     value: 1
      //   },
      //   {
      //     label: '换包装',
      //     value: 2
      //   },
      // ], // 增值服务
    };
  },
  created() {
    this.initData();
    this.searchData();
    this.showShippingData(true); // 查询物流方式下拉数据
    // 处理库存调拨跳转出库单详情
    let otherStockInfo = this.$store.state.otherStockInfo;
    if (otherStockInfo) {
      this.pickingNo = otherStockInfo.pickingNo;
      this.workType = otherStockInfo.workType;
      this.workShow = otherStockInfo.workShow;
    }
    // copy打印fnsku标签数据,初始化用到
    this.printParamsCopy = this.deepCopy(this.printParams);
    this.pageClassCopy = this.deepCopy(this.pageClass);
    this.barCodeClassCopy = this.deepCopy(this.barCodeClass);
  },
  watch: {
    workShow: function (val) {
      if (val === 'list') {
        // this.searchData()
        this.searchFn();
        this.tableSltData = [];

        this.$nextTick(() => {
          this.computedTableHeight();
        })
      }
    }
  },
  computed: {
    headObj() {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    },
  },
  methods: {
    closeSuccess() {
      this.createPickListModel = false;
      this.searchFn();
    },
    openInportModal() {
      this.switchInportModal = true;
    },
    okInport() {
    },
    cancelInport() {
      this.switchInportModal = false;
    },
    clickAssignBatch(val) {
      if (!val) {
        if (this.tableSltData.length === 0) {
          this.$Message.warning('请勾选数据');
          return;
        }
        this.createType = 'select';
        this.openCreateList();
      } else {
        this.createType = 'all';
        if (this.data.length === 0) {
          this.$Message.warning('暂无数据');
          return;
        }
        this.openCreateList();
      }
    },
    batchOption(name) {
      if (name === '2') {
      } else {
        // 批量分配
        this.dropOption(api.assign_all, '不能重复分配', this.tableSltData);
      }
    },
    beforeUp() {
      // 导入
    },
    uploadSuccess(res, file, fileList) {
      // let v = this;
      if (res.code === 0) {
        this.$Message.success('导入成功');
      } else {
        // this.$Message.warning({
        //   content: res.data.message,
        //   duration: 5
        // });
      }
    },
    uploadError() {
    },
    exportFn(obj) {
      this.axios.post(api.exportUrl, obj).then(res => {
        if (res.data.code === 0) {
          this.$Message.success('导出成功');
        }
      });
    },
    // 导出
    exportAllOrSlt(name) {
      let obj = this.paramsFn();
      const pickingExportType = ['0', '1'].includes(name) ? 0 : 1;
      // 选中
      if (['0', '2'].includes(name)) {
        if (this.tableSltData.length === 0) {
          this.$Message.warning('请选择导出数据');
          return;
        }
        obj.pickingNo = this.tableSltData.map(val => val.pickingNo);
        obj.exportType = '0';
        obj.pickingExportType = pickingExportType;
        this.exportFn(obj);
      } else {
        // 所有
        if (this.data.length === 0) {
          this.$Message.warning({
            content: '无数据导出',
            duration: 5,
          });
          return;
        }
        let obj2 = {
          exportType: '1',
          pickingExportType: pickingExportType,
          warehouseId: this.wareId,
          ...obj
        };
        this.exportFn(obj2);
      }
    },
    changeShippingMethod(value) {
      let v = this;
      if (value.length === 0) {
        v.searchParams.logisticType = null;
      } else if (value.length === 1) {
        v.searchParams.logisticType = [
          {
            logisticsDealerCode: value[0]
          }
        ];
      } else if (value.length === 2) {
        v.searchParams.logisticType = [
          {
            logisticsDealerCode: value[0],
            logisticsMailCode: value[1][0]
          }
        ];
      }
    },
    dropOption(insertApi, tips, rowObj) {
      let v = this;
      let obj = null;
      if (Array.isArray(rowObj)) {
        obj = rowObj.map(val => val.pickingNo);
      } else {
        obj = [rowObj.pickingNo];
      }
      if (!obj || obj.length === 0) {
        v.$Message.info('未选择数据');
        return;
      }
      if (insertApi === api.assign_all) {
        obj = {
          pickingNoList: obj,
          warehouseId: v.wareId
        };
      }
      this.axios.post(insertApi, obj).then(res => {
        if (res.data.code === 0) {
          let data = res.data.datas;
          if (data.length && insertApi === api.assign_all) {
            if (data[0].errorCode === 551001) {
              this.$Message.error('无对应库存数据,无法分配');
            } else if (data[0].errorCode === 553209) {
              this.$Message.error('未找到可以分配的库存，无法分配');
            }
          } else {
            this.$Message.success('操作成功');
            this.searchFn();
          }
        }
      });
      // }
      // })
    },
    paramsFn() {
      let v = this;
      this.searchParams.pageSize = this.getPageSizeCache();
      let searchParams = this.searchParams;

      let obj = {
        orderBy: searchParams.cacheClickVal || null,
        createdBys: searchParams.createdBys,
        createdStartTime: searchParams.createTime[0]
          ? this.$uDate.getDateTime(searchParams.createTime[0], 'fulltime')
          : null,
        createdEndTime: searchParams.createTime[1]
          ? this.$uDate.getDateTime(searchParams.createTime[1], 'fulltime')
          : null,
        orderSeq: searchParams.orderSeq,
        packageGoodsStatus: searchParams.picked,
        packageType: searchParams.packType,
        pageNum: searchParams.pageNum,
        pageSize: searchParams.pageSize,
        pickingGoodsNo: searchParams.pickNo === ''
          ? null
          : this.chEnCsv(searchParams.pickNo),
        pickingNo: searchParams.outListNo === ''
          ? null
          : this.chEnCsv(searchParams.outListNo),
        pickingStatus: searchParams.outListStatus, // 出库单状态
        pickingType: searchParams.outListType || [],
        referenceNo: searchParams.referenceNo === ''
          ? null
          : this.chEnCsv(searchParams.referenceNo),
        saleChannel: searchParams.channelSell,
        warehouseId: [this.wareId],
        pickingExtendList: searchParams.logisticType,
        // valueAddedServiceList: !this.$common.isEmpty(searchParams.valueAddedServiceList) ? [searchParams.valueAddedServiceList] : [],
      };
      if (v.searchParams.cargoOwnerId) {
        if (v.searchParams.cargoOwnerId === '_NO_CARGO_OWNER') {
          // 无货主
          obj.cargoOwnerType = 0;
          obj.cargoOwnerId = null;
        } else {
          obj.cargoOwnerType = 1;
          obj.cargoOwnerId = v.searchParams.cargoOwnerId;
        }
      } else {
        obj.cargoOwnerType = null;
        obj.cargoOwnerId = null;
      }
      return this.$common.removeEmpty(obj);
    },
    chEnCsv(params) {
      // 中英文逗号分隔
      let arr = [];
      if (params.indexOf(',') > -1) {
        arr = params.split(',');
      } else if (params.indexOf('，') > -1) {
        arr = params.split('，');
      } else {
        arr.push(params);
      }
      return arr;
    },
    initData() {
      // 仓库数据
      // let v = this;
      // 查询物流商
      this.axios.get(api.get_logisterList + `?carrierId=${null}`).then(res => {
        if (res.data.code === 0) {
          let data = res.data.datas;
          let processData = data.map(val => {
            return {
              label: val.name,
              value: val.code,
              id: val.code,
              children: [],
              loading: false
            };
          });
          this.apiLogisterList = [
            {
              label: '全部',
              value: '*'
            }, ...processData
          ];
        }
      });
    }, // loadData (item, callback) { // 动态根据选择的物流商查对应的物流方式
    //   item.loading = true;
    //   let v = this;
    //   this.axios.get(api.get_sendType + `?carrierId=${item.id}`)
    //     .then(res => {
    //       if (res.data.code === 0) {
    //         if (res.data.datas.length > 0) {
    //           let data = res.data.datas;
    //           let child = data.map(val => {
    //             return {
    //               label: val.name,
    //               value: val.code,
    //               id: val.code
    //             };
    //           });
    //           item.children = child;
    //         } else {
    //           item.children = [{ label: '暂无数据', value: '-', disabled: true }];
    //         }
    //         item.loading = false;
    //         callback();
    //       }
    //     });
    // },
    searchFn() {
      let v = this;
      v.TableLoading = true;
      v.SearchDisabled = true;
      if (v.getPermission('wmsPicking_queryOtherPicking')) {
        let obj = this.paramsFn();
        this.axios.post(api.get_outStockList, obj).then(res => {
          v.TableLoading = false;
          v.SearchDisabled = false;
          if (res.data.code === 0) {
            this.data = this.processData(res.data.datas.list);
            this.tableItemTotal = res.data.datas.total;
          }
        });
      } else {
        v.gotoError(); // 无权限
      }
    },
    processData(listData) {
      // 对返回的list表格数据作中文匹配
      // let v = this;
      listData.forEach(val => {
        // val.type = val.pickingType === 'S1'
        //   ? '销售出库'
        //   : val.pickingType === 'O3'
        //     ? '其他出库'
        //     : val.pickingType === 'O1'
        //       ? '调拨出库'
        //       : val.pickingType === 'O2'
        //         ? '组装加工'
        //         : val.pickingType === 'O4'
        //           ? '退货'
        //           : '';
        val.status = val.pickingStatus === '0'
          ? '订单创建'
          : val.pickingStatus === '1'
            ? '部分分配'
            : val.pickingStatus === '2'
              ? '分配完成'
              : val.pickingStatus === '3'
                ? '部分发货'
                : val.pickingStatus === '4'
                  ? '完全发货'
                  : val.pickingStatus === '5'
                    ? '订单完成'
                    : val.pickingStatus === '7'
                      ? '分配失败'
                      : '';
        val.pickStatus = val.packageGoodsStatus === '0'
          ? '未拣货'
          : val.packageGoodsStatus === '1'
            ? '已拣货'
            : '';
        val.deliverFinishTime = val.deliverFinishTime
          ? this.$uDate.dealTime(val.deliverFinishTime)
          : '';
        val.createdTime = val.createdTime
          ? this.$uDate.dealTime(val.createdTime)
          : '';
      });
      return listData;
    },
    searchData() {
      // 查询按钮
      this.searchParams.pageNum = 1;
      this.searchFn();
    },
    // 获取排序方式、prop并发起请求获取表格信息
    getSortInfoAndFetch(type, feild) {
      this.searchParams.orderSeq = type;
      this.searchParams.cacheClickVal = feild;
      this.searchFn();
    },
    openCreateList() {
      // 打开生成拣货单模态框
      // let v = this;
      if (this.selectType === 'select') {
        if (this.tableSltData.length === 0) {
          this.$Message.warning({
            content: '请选择要操作的数据',
            duration: 3
          });
          return;
        }
      }
      // 只有分配完成的单才能生成拣货单
      let flag = true;
      for (let i = 0; i < this.tableSltData.length; i++) {
        if (this.tableSltData[i].pickingStatus !== '2') {
          flag = false;
          break;
        } else {
          flag = true;
        }
      }
      if (!flag) {
        this.$Message.warning({
          content: '存在分配未完成的出库单',
          duration: 5
        });
        return;
      }
      // 没有拣货单编号才可以生成拣货单
      let flag2 = true;
      for (let i = 0; i < this.tableSltData.length; i++) {
        if (this.tableSltData[i].pickingGoodsNo) {
          flag2 = false;
          break;
        } else {
          flag2 = true;
        }
      }
      if (!flag2) {
        this.$Message.warning({
          content: '存在已经生成的拣货单',
          duration: 5
        });
        return;
      }
      this.createPickListModel = true;
    },
    // sltChangeProcess(val, string) {
    //   // 多选模式下全部和选项的切换
    //   if (val.length > 1) {
    //     if (val[val.length - 1] === '*') {
    //       this.searchParams[string] = ['*'];
    //     } else {
    //       if (val.indexOf('*') > -1) {
    //         val.splice(val.indexOf('*'), 1);
    //         this.searchParams[string] = val;
    //       }
    //     }
    //   }
    // },
    // wareChange(val) {
    //   // 仓库选择
    //   this.sltChangeProcess(val, 'ware');
    // },
    // outListStatusChange(val) {
    //   // 出库单状态选择
    //   this.sltChangeProcess(val, 'outListStatus');
    // },
    // outListTypeChange(val) {
    //   // 出库单类型选择
    //   this.sltChangeProcess(val, 'outListType');
    // },
    // channelSellChange(val) {
    //   // 销售渠道改变
    //   this.sltChangeProcess(val, 'channelSell');
    // },
    // packTypeChange(val) {
    //   // 包裹类型改变
    //   this.sltChangeProcess(val, 'packType');
    // },
    tableChange(data) {
      // 表格选择项变化
      this.tableSltData = data;
    },
    newStockOutList() {
      // 创建出库单
      this.workShow = 'create';
    },
    pageNumChange(page) {
      this.searchParams.pageNum = page;
      this.searchFn();
    },
    pageSizeChange(size) {
      this.setPageSizeCache(size);
      this.searchParams.pageSize = size;
      this.searchFn();
    },
    nextOne() {
      // fba发货(共四个步骤)
      let v = this;
      if (v.deliveryStep === 0) {
        // one
        if (v.carrierName) {
          let obj = {
            pickingId: v.pickingId,
            carrierName: v.carrierName,
            shipmentType: v.shipmentType
          };
          v.axios.post(api.put_transport, obj).then(response => {
            if (response.data.code === 0) {
              v.deliveryStep = 1; // 下一步
            }
          });
        } else {
          v.$Message.error('请选择承运人');
        }
      } else if (v.deliveryStep === 1) {
        // two
        v.axios.post(api.put_fbaSubmitFeed + v.pickingId).then(response => {
          if (response.data.code === 0) {
            v.deliveryStep = 2; // 下一步
            // 这里修改第三步中表格的表头
            let colunm = [
              {
                title: '装箱状态',
                key: 'status',
                align: 'center',
                minWidth: 120,
                render: (h, params) => {
                  return h('div', {
                    style: {
                      color: '#008000'
                    }
                  }, '已上传');
                }
              }
            ];
            this.printBoxColumns = this.boxColumns.concat(colunm);
          }
        });
      } else if (v.deliveryStep === 2) {
        // three
        if (v.nextStatus) {
          v.deliveryStep = 3; // 下一步
        } else {
          v.$Message.error('未打印，不能进行下一步操作');
        }
      }
    },
    getBoxList(id) {
      // 获取上传装箱清单
      let v = this;
      let obj = {
        pickingId: id
      };
      v.axios.post(api.get_boxDetail, obj).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          v.boxData = data;
        }
      });
    },
    print() {
      // 打印外箱标签
      let v = this;
      if (v.pageType) {
        v.axios.get(api.print_fbaLables + '?pickingId=' + v.pickingId + '&pageType=' + v.pageType).then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            let filenodeViewTargetUrl = v.$store.state.imgUrlPrefix;
            window.open(filenodeViewTargetUrl + data, '_blank');
            v.nextStatus = true;
          }
        });
      } else {
        v.$Message.error('请选择纸张类型');
      }
    },
    delivery() {
      // fba发货
      let v = this;
      if (!v.trackingNumber) {
        v.$Message.error('跟踪单号不能为空');
        return false;
      }
      let obj = {
        trackingNumber: v.trackingNumber,
        billingType: v.billingType,
        firstShippingFee: v.firstShippingFee,
        firstTariff: v.firstTariff,
        otherFee: v.otherFee,
        pickingId: v.pickingId
      };
      v.axios.post(api.get_fbaShipping, obj).then(response => {
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.amazonFbaModal = false;
          // 清空数据
          v.shipmentType = 'SP';
          v.carrierName = null;
          v.trackingNumber = null;
          v.billingType = 'kg';
          v.firstShippingFee = null;
          v.firstTariff = null;
          v.otherFee = null;
          v.searchFn();
        }
      });
    },
    printWeight() {
      // 打印超重标签
      let v = this;
      v.axios.get(api.get_printWeightLabel + '?language=' + v.printLanguage).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          let filenodeViewTargetUrl = v.$store.state.imgUrlPrefix;
          window.open(filenodeViewTargetUrl + data, '_blank');
          v.printWeightModal = false;
        }
      });
    },
    cancelPrintWeight() {
      // 取消打印超重标签
      let v = this;
      v.printWeightModal = false;
    },
    printBarcode() {
      // 打印条码
      let v = this;
      let instance = this.axios.create({
        timeout: 3000,
        transformRequest: [
          function (data) {
            let ret = '';
            for (let it in data) {
              ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&';
            }
            return ret;
          }
        ],
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      instance.post('http://localhost:10099/print', {
        content: this.htm5Doc(),
        postId: '1'
      }).then(response => {
        if (response.status === 200) {
          this.$Message.success('操作成功');
          this.cancelPrintBarcode();
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
    },
    htm5Doc() {
      return (`<!DOCTYPE html>
        <html lang="en">
          <head>
          <meta charset="UTF-8">
          <title>Title</title>
          <style type="text/css">
        @media print {.btn{display: none;}}
        .bug-free{background:url('${window.location.origin}/wms-service/static/css/printFont/IDAutomationC128S.eot?#iefix')}
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
        .bug-free{background:url('${window.location.origin}/wms-service/static/css/printFont/IDAutomationSC39S.eot?#iefix')}
        @font-face {
            font-family: 'IDAutomationSC39S';
            src: url('${window.location.origin}/wms-service/static/css/printFont/IDAutomationSC39S.eot'); /* IE9 Compat Modes */
            src: url('${window.location.origin}/wms-service/static/css/printFont/IDAutomationSC39S.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
            url('${window.location.origin}/wms-service/static/css/printFont/IDAutomationSC39S.ttf') format('truetype');
        }
    </style>
          </head>
          <body>` + this.htmlText() + `
        </body>
        </html>`);
    },
    htmlText() {
      let v = this;
      let str = '';
      let dom = v.deepCopy(v.$refs.container);
      let tagTemp = v.$refs.tagTemp;
      tagTemp.innerHTML = dom.parentNode.innerHTML;
      let container = tagTemp.childNodes[0];
      if (v.printData.length) {
        v.printData.forEach((n, i) => {
          container.childNodes[0].innerText = n.fnskuBarCode;
          container.childNodes[2].innerText = n.fnsku;
          container.childNodes[3].innerText = n.title;
          if (v.printParams.productNo) {
            container.childNodes[4].innerText = n.sku;
          }
          str += tagTemp.innerHTML;
        });
        return str;
      }
    },
    cancelPrintBarcode() {
      // 取消打印条码
      this.printModal = false;
      this.printParams = this.deepCopy(this.printParamsCopy);
      this.pageClass = this.deepCopy(this.pageClassCopy);
      this.barCodeClass = this.deepCopy(this.barCodeClassCopy);
      this.tagList = [];
    },
    getPrintData() {
      // 获取打印
      let v = this;
      return new Promise(resolve => {
        v.axios.get(api.get_fbaPickDetail + v.fnPickingNo).then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            data.forEach((n, i) => {
              n.number = 1;
            });
            v.printData = data;
            resolve(true);
          }
        });
      });
    },
    changeWidth(val) {
      let v = this;
      v.pageClass.width = val * 3.5 + 'pt';
    },
    changeHeight(val) {
      let v = this;
      v.pageClass.height = val * 3.5 + 'pt';
    },
    changeBarSize(val) {
      let v = this;
      v.barCodeClass.fontSize = val + 'pt';
    },
    changeBarHeight(val) {
      let v = this;
      v.barCodeClass.fontSize = val + 'pt';
    },
    changeProNo(val) {
      if (val) {
        this.showPrint();
      }
    },
    showPrint() {
      Promise.resolve(this.getPrintData()).then(result => {
        let el = [];
        el.push(this.$refs.draggable0);
        el.push(this.$refs.draggable1);
        el.push(this.$refs.draggable2);
        el.push(this.$refs.draggable3);
        if (this.printParams.productNo) {
          el.push(this.$refs.draggable4);
        }
        el.forEach((n, i) => {
          // let draggie = new Draggabilly(n, {
          //   // 选项...
          //   containment: true,
          //   axis: 'y'
          // });
          // console.log(draggie);
        });
      });
    },
    changePrintNum() {
      let v = this;
      // console.log(v.printParams.printNum);
      if (v.printParams.printNum) {
        v.printData.forEach((n, i) => {
          n.number = v.printParams.printNum;
        });
      }
    },
    addTag() {
      let v = this;
      if (v.tagContent) {
        v.tagList.push(v.tagContent);
        v.tagContent = null;
        // v.$nextTick(() => {
        // let draggie = new Draggabilly(this.$refs['draggable' + (v.tagList.length + 4)][0], {
        //   containment: true,
        //   axis: 'xy'
        // });
        // console.log(draggie);
        // });
      }
    },
    delConfirm(idnex) {
      let v = this;
      v.tagList.splice(idnex, 1);
    },
    updateData(value) { // 解冻并分配后，更新列表数据
      if (value === this.frozenModalTalg) {
        this.searchFn();
      }
    }, // 重置按钮
    reset() {
      this.shippingMethodModel = [];
      this.searchParams.logisticType = null;
      this.$refs['searchParams'].resetFields();
    },
  }
};
</script>
<style lang="less">
.sellStockOut {
  height: 100%;

  .grayBg {
    margin: 0;
  }
}

.createPick {
  .ivu-modal-header-inner {
    color: #fff !important;
  }

  .ivu-modal-footer {
    display: none !important;
  }

  .ivu-modal {
    width: 600px !important;
  }
}
</style>
<style scoped>
.container {
  height: 200px;
}

.draggable.is-pointer-down {
  background: #09f;
  z-index: 2;
}

.draggable.is-dragging {
  opacity: 0.7;
}
</style>
