<template >
  <div>
    <!--返回列表按钮-->
    <div class="addBinding" style="margin-bottom:10px;">
      <Icon type="ios-arrow-back"></Icon>
      <a @click="backPage">返回列表</a>
    </div>
    <div class="dataSort grayBg">
      <h3>基本信息</h3>
    </div>
    <div style="background-color: #fff;margin:0 10px 0 10px;">
      <Form ref="pageParams" :model="pageParams" label-position="right" :label-width="140" :rules="ruleValidate">
        <Tabs value="main">
          <TabPane label="主信息" name="main" style="padding-left:12px;">
            <Row v-show="isShowNoAndStatus">
              <Col span="5">
              <Form-item label="调拨单号：">
                <span>{{ saveDetailData.inventoryAllotNo }}</span>
              </Form-item>
              </Col>
              <Col span="5">
              <!-- <Form-item label="状态：">
                  <span style="color:green;" v-if="showStatus.allotStatus==='0'">待审核</span>
                  <span style="color:green;" v-if="showStatus.allotStatus==='1'">已审核</span>
                  <span style="color:green;" v-if="showStatus.allotStatus==='2'">出库完成</span>
                  <span style="color:green;" v-if="showStatus.allotStatus==='3'">出库取消</span>
                  <span style="color:green;" v-if="showStatus.allotStatus==='4'">入库完成</span>
                  <span style="color:green;" v-if="showStatus.allotStatus==='5'">入库取消</span>
                </Form-item> -->
              <Form-item label="调拨类型：">
                <span>{{
                  saveDetailData.warehouseOverseaType
                  ? '第三方仓调拨'
                  : '本地仓调拨'
                }}</span>
              </Form-item>
              </Col>
            </Row>
            <Row>
              <Col span="5">
              <Form-item label="发货仓库：" prop="fromWareHouse">
                <span>{{ fromWareName }}</span>
              </Form-item>
              </Col>
              <Col span="2">
              <Icon type="md-arrow-dropright-circle" size="32" color="#2d8cf0" v-if="isShowSelect"
                style="position:relative;left:80px;"></Icon>
              <Icon type="md-arrow-dropright-circle" size="32" color="#2d8cf0" v-else></Icon>
              </Col>
              <Col span="5">
              <Form-item label="目的仓库：" prop="toWareHouse">
                <Select v-model="pageParams.toWareHouse" style="width: 180px" filterable placeholder="输入仓库可查找"
                  v-if="isShowSelect" @on-change="changeToWareName">
                  <Option v-for="item in wareHouseTypeList" :value="item.warehouseId" :key="item.toWareHouse">{{
                    item.warehouseName }}</Option>
                </Select>
                <span v-else>{{ showStatus.toWarehouseName }}</span>
              </Form-item>
              </Col>
            </Row>
            <Row>
              <Col span="12">
              <Form-item label="运费/报关费/其他费用：">
                <Row :gutter="8">
                  <Col span="6">
                  <Select v-model="pageParams.currency" style="width: 120px" filterable
                    :disabled="showStatus.allotStatus === '1'">
                    <Option v-for="item in currencyTypeList" :value="item.money" :key="item.money">{{ item.currencyName }}
                    </Option>
                  </Select>
                  </Col>
                  <Col span="3">
                  <Form-item prop="feeFreight">
                    <Input v-model.trim="pageParams.feeFreight" @on-blur="freightFloatPoint" style="width: 70px"
                      :disabled="showStatus.allotStatus === '1'" placeholder="0.00"></Input>
                  </Form-item>
                  </Col>
                  <Col span="3">
                  <Form-item prop="feeDeclaration">
                    <Input v-model.trim="pageParams.feeDeclaration" @on-blur="declareFloatPoint" style="width: 70px"
                      :disabled="showStatus.allotStatus === '1'" placeholder="0.00"></Input>
                  </Form-item>
                  </Col>
                  <Col span="3">
                  <Form-item prop="feeOther">
                    <Input v-model.trim="pageParams.feeOther" @on-blur="amountFloatPoint" style="width: 70px"
                      :disabled="showStatus.allotStatus === '1'" placeholder="0.00"></Input>
                  </Form-item>
                  </Col>
                </Row>
              </Form-item>
              </Col>
            </Row>
            <Row>
              <Form-item label="计费类型：">
                <RadioGroup v-model="pageParams.freeType">
                  <Radio label="H" :disabled="showStatus.allotStatus === '1'">按重量</Radio>
                  <Radio label="V" :disabled="showStatus.allotStatus === '1'">按体积</Radio>
                </RadioGroup>
              </Form-item>
            </Row>
            <Row>
              <Col span="6">
              <Form-item label="备注：">
                <Input type="textarea" :autosize="{ minRows: 5, maxRows: 6 }" placeholder="填写备注"
                  v-model.trim="pageParams.remarks" :disabled="showStatus.allotStatus === '1'"></Input>
              </Form-item>
              </Col>
            </Row>
          </TabPane>
          <!-- pageParams -->
          <!-- 新需求中收货人信息和物流商信息这两个改了，当前先隐藏掉 TWMS-1148 -->
          <!-- <TabPane label="收货人信息" name="receiver">
            <Row>
              <Col span="6">
                <Form-item label="收货人名称：">
                  <Input v-model.trim="pageParams.consigneeName" placeholder="" style='width: 220px' :disabled="showStatus.allotStatus==='1'"></Input>
                </Form-item>
              </Col>
              <Col span="6">
                <Form-item label="国家：">
                  <Input v-model.trim="pageParams.consigneeCountry" placeholder="" style='width: 220px' :disabled="showStatus.allotStatus==='1'"></Input>
                </Form-item>
              </Col>
            </Row>
            <Row>
              <Col span="6">
                <Form-item label="联系人：">
                  <Input v-model.trim="pageParams.consigneeLinkMan" placeholder="" style='width: 220px' :disabled="showStatus.allotStatus==='1'"></Input>
                </Form-item>
              </Col>
              <Col span="6">
                <Form-item label="省/州：">
                  <Input v-model.trim="pageParams.consigneeProvince" placeholder="" style='width: 220px' :disabled="showStatus.allotStatus==='1'"></Input>
                </Form-item>
              </Col>
            </Row>
            <Row>
              <Col span="6">
                <Form-item label="手机号码：" prop="consigneeLinkTel">
                  <Input v-model.trim="pageParams.consigneeLinkTel" placeholder="" style='width: 220px' :disabled="showStatus.allotStatus==='1'"></Input>
                </Form-item>
              </Col>
              <Col span="6">
                <Form-item label="城市：">
                  <Input v-model.trim="pageParams.consigneeCity" placeholder="" style='width: 220px' :disabled="showStatus.allotStatus==='1'"></Input>
                </Form-item>
              </Col>
              <Col span="6">
                <Form-item label="邮政编码：" prop="consigneeZipCode">
                  <Input v-model.trim="pageParams.consigneeZipCode" placeholder="" style='width: 220px' :disabled="showStatus.allotStatus==='1'"></Input>
                </Form-item>
              </Col>
            </Row>
            <Row>
              <Col span="6">
                <Form-item label="邮箱：" prop="consigneeMail">
                  <Input v-model.trim="pageParams.consigneeMail" placeholder="" style='width: 220px' :disabled="showStatus.allotStatus==='1'"></Input>
                </Form-item>
              </Col>
              <Col span="6">
                <Form-item label="详细地址1：">
                  <Input v-model.trim="pageParams.consigneeAddress" placeholder="" style='width: 220px' :disabled="showStatus.allotStatus==='1'"></Input>
                </Form-item>
              </Col>
              <Col span="6">
                <Form-item label="详细地址2：" prop="consigneeAddressOther">
                  <Input v-model.trim="pageParams.consigneeAddressOther" placeholder="" style='width: 220px' :disabled="showStatus.allotStatus==='1'"></Input>
                </Form-item>
              </Col>
            </Row>
          </TabPane>
          <TabPane label="物流商信息" name="logistic">
            <Row>
              <Col span="6">
                <Form-item label="物流商：">
                  <Select v-model="pageParams.logisticsDealerCode" style="width: 220px" filterable :disabled="showStatus.allotStatus==='1'" @on-change="changeLogisit" label-in-value>
                    <Option v-for="item in logisticList" :value="item.code" :key="item.code">{{item.name}}</Option>
                  </Select>
                </Form-item>
              </Col>
              <Col span="6">
                <Form-item label="物流商单号：">
                  <Input v-model.trim="pageParams.logisticsNo" placeholder="" style='width: 220px' :disabled="showStatus.allotStatus==='1'"></Input>
                </Form-item>
              </Col>
            </Row>
            <Row>
              <Col span="6">
                <Form-item label="邮寄方式：">
                  <Select v-model="pageParams.logisticsMailCode" style="width: 220px" filterable :disabled="showStatus.allotStatus==='1'" @on-change="changeMailWay" label-in-value>
                    <Option v-for="item in logisticsMailList" :value="item.code" :key="item.code">{{item.name}}</Option>
                  </Select>
                </Form-item>
              </Col>
              <Col span="6">
                <Form-item label="运单号：">
                  <Input v-model.trim="pageParams.logisticsTrackingNo" placeholder="" style='width: 220px' :disabled="showStatus.allotStatus==='1'"></Input>
                </Form-item>
              </Col>
            </Row>
            <Row>
              <Col span="6">
                <Form-item label="联系人：">
                  <Input v-model.trim="pageParams.logisticsLinkMan" placeholder="" style='width: 220px' :disabled="showStatus.allotStatus==='1'"></Input>
                </Form-item>
              </Col>
              <Col span="6">
                <Form-item label="手机号码：" prop="logisticsLinkTel">
                  <Input v-model.trim="pageParams.logisticsLinkTel" placeholder="" style='width: 220px' :disabled="showStatus.allotStatus==='1'"></Input>
                </Form-item>
              </Col>
            </Row>
            <Row>
              <Col span="6">
                <Form-item label="邮箱：" prop="logisticsLinkMail">
                  <Input v-model.trim="pageParams.logisticsLinkMail" placeholder="" style='width: 220px' :disabled="showStatus.allotStatus==='1'"></Input>
                </Form-item>
              </Col>
            </Row>
          </TabPane> -->
        </Tabs>
      </Form>
    </div>
    <!-- 明细信息 -->
    <div class="dataSort grayBg">
      <h3>明细信息</h3>
    </div>
    <!-- :添加货品和删除货品按钮 -->
    <div class="addBinding" v-show="isShowBtn">
      <Button type="primary" icon="md-add" @click="showAddProductModal">添加货品</Button>
      <Button style="marginLeft:10px;" type="error" icon="md-trash" @click="
        deleteProductBtn(selectTransferTableList, allSelectTransferList)
      ">移除货品</Button>
    </div>
    <!-- :待审核表格 -->
    <div class="shopTable" v-if="$store.state.adjustDetailTableShow === 'noCheck'">
      <!--表格-->
      <Table highlight-row border :columns="columns6" :data="data6" ref="selection" @on-selection-change="selectItem"
        @on-select-all="allSelectItemBtn"></Table>
      <!--分页按钮-->
      <!-- <div class="table-page">
        <div class="table-page-right">
          <Page :total="totalRecords" :current="pageParams.pageNum" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray"></Page>
        </div>
      </div> -->
    </div>
    <!-- :已审核表格 -->
    <div class="shopTable" v-if="$store.state.adjustDetailTableShow === 'isChecked'">
      <!--表格-->
      <Table highlight-row border :columns="columns7" :data="data7"></Table>
      <!--分页按钮-->
      <!-- <div class="table-page">
        <div class="table-page-right">
          <Page :total="totalRecords" :current="pageParams.pageNum" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray"></Page>
        </div>
      </div> -->
    </div>
    <!-- :创建库存调拨单和取消按钮 -->
    <div class="addBinding" style="margin-top:80px; text-align:center;">
      <!-- 创建库存调拨单 -->
      <Button type="primary" style="margin-right:50px;" @click="createTransferOrderBtn('pageParams')"
        v-if="isCreateShow">创建库存调拨单</Button>
      <!-- 生成出库单 -->
      <Button type="primary" style="margin-right:50px;" v-if="
        (showStatus.allotStatus === '0' || showStatus.allotStatus === '1') &&
        !saveDetailData.warehouseOverseaType
      " @click="creatOutStock" :disabled="!getPermission('wmsInventoryAllot_createPicking')">生成出库单</Button>
      <!-- 申报 -->
      <Button type="primary" style="margin-right:50px;" v-if="
        (showStatus.allotStatus === '0' || showStatus.allotStatus === '1') &&
        saveDetailData.warehouseOverseaType
      " @click="declare">申报</Button>
      <!-- 保存 -->
      <Button type="primary" style="margin-right:50px;" @click="saveTransferOrderBtn('pageParams')" icon="md-checkmark"
        v-if="isShow" :disabled="!getPermission('wmsInventoryAllot_modify')">保存</Button>
      <!-- 返回列表 -->
      <Button type="default" icon="md-close" @click="cancelcreateTransferOrderBtn">返回列表</Button>
    </div>
    <div class="addBinding" style="display:inline-block;">
      <Affix :offset-bottom="10">
        <Alert show-icon style="width:355px;">
          <p>温馨提示：</p>
          <p>1、创建库存调拨单之前，请先添加货品！</p>
          <p>2、在添加货品之前，请先选择仓库！</p>
          <p>3、修改表格数据之后，请记得点保存！</p>
          <p>4、审核通过后，不能再进行添加、删除、修改！</p>
        </Alert>
      </Affix>
    </div>
    <!-- 关联出库单 -->
    <div class="dataSort grayBg" v-if="cognateData.length">
      <h3>关联出库单</h3>
    </div>
    <div class="shopTable" v-if="cognateData.length">
      <!--关联出库单表格-->
      <Table highlight-row border :columns="cognateColumns" :data="cognateData"></Table>
      <!--分页按钮-->
      <div class="table-page">
        <div class="table-page-right">
          <Page :total="cognateTotal" :current="cognatePageParams.pageNum" @on-change="changePage" show-total
            :page-size="cognatePageParams.pageSize" show-elevator show-sizer @on-page-size-change="changePageSize"
            placement="top" :page-size-opts="pageArray"></Page>
        </div>
      </div>
    </div>
    <!-- :新建货品模态框 -->
    <div v-if="addProductModal">
      <Modal v-model="addProductModal" :styles="{ top: '80px', width: '1500px' }" class="headerBar addProductBar"
        :title="transferProductModalTitle">
        <div class="content">
          <addProduct :from="'allGoods'" :disabledSlt="false" :categoryOption="false"
            @addProductSuccess="addProductSuccess" @addProductCancel="addProductCancel" :wareId="wareId"
            :eliminateData="data6"></addProduct>
        </div>
        <div slot="footer">
          <Button type="primary" @click="addNewProduct">确认添加货品</Button>
          <Button @click="cancelButton">取消</Button>
        </div>
      </Modal>
    </div>
    <!-- 生成出库单模态框 -->
    <Modal v-model="creatOutStockModal" v-if="creatOutStockModalStatus" width="1000" title="生成出库单">
      <div>
        <!-- 出库货品 -->
        <h3>出库货品</h3>
        <div style="marginTop:10px;">
          <Table highlight-row border :height="tableHeight" :columns="productColumn" :data="productData"></Table>
        </div>
        <!-- 收货人信息 -->
        <h3 style="marginTop:20px;">
          收货人信息 </h3>
        <div style="marginTop:10px;">
          <Form :model="outStockParams" label-position="left" :label-width="85">
            <Row style="marginLeft:15px;">
              <Col span="12">
              <Form-item label="收货人名称：">
                <Input v-model.trim="outStockParams.consigneeName" style="width: 200px"></Input>
              </Form-item>
              </Col>
              <Col span="8">
              <Form-item label="国家：">
                <Input v-model.trim="outStockParams.consigneeCountry" style="width: 200px"></Input>
              </Form-item>
              </Col>
            </Row>
            <Row style="marginLeft:15px;">
              <Col span="12">
              <Form-item label="联系人：">
                <Input v-model.trim="outStockParams.consigneeLinkMan" style="width: 200px"></Input>
              </Form-item>
              </Col>
              <Col span="8">
              <Form-item label="省/洲：">
                <Input v-model.trim="outStockParams.consigneeProvince" style="width: 200px"></Input>
              </Form-item>
              </Col>
            </Row>
            <Row style="marginLeft:15px;">
              <Col span="12">
              <Form-item label="联系电话：">
                <Input v-model.trim="outStockParams.consigneeLinkTel" style="width: 200px"></Input>
              </Form-item>
              </Col>
              <Col span="8">
              <Form-item label="城市：">
                <Input v-model.trim="outStockParams.consigneeCity" style="width: 200px"></Input>
              </Form-item>
              </Col>
            </Row>
            <Row style="marginLeft:15px;">
              <Col span="12">
              <Form-item label="邮箱：">
                <Input v-model.trim="outStockParams.consigneeMail" style="width: 200px"></Input>
              </Form-item>
              </Col>
              <Col span="8">
              <Form-item label="详细地址：">
                <Input v-model.trim="outStockParams.consigneeAddress" style="width: 200px"></Input>
              </Form-item>
              </Col>
            </Row>
          </Form>
        </div>
        <!-- 物流商信息 -->
        <h3 style="marginTop:20px;">
          物流商信息 </h3>
        <div style="marginTop:10px;marginLeft:15px;">
          <Form :model="outStockParams" label-position="left" :label-width="85">
            <Row style="marginLeft:15px;">
              <Col span="12">
              <Form-item label="物流商：">
                <Select v-model="outStockParams.logisticsDealerCode" style="width: 200px" filterable clearable
                  @on-change="changeLogisit" label-in-value>
                  <Option v-for="item in logisticList" :value="item.code" :key="item.code">{{ item.name }}</Option>
                </Select>
              </Form-item>
              </Col>
              <Col span="8">
              <Form-item label="邮寄方式：">
                <Select v-model="outStockParams.logisticsMailCode" style="width: 200px" filterable clearable
                  @on-change="changeMailWay" label-in-value>
                  <Option v-for="item in logisticsMailList" :value="item.code" :key="item.code">{{ item.name }}</Option>
                </Select>
              </Form-item>
              </Col>
            </Row>
            <Row style="marginLeft:15px;">
              <Col span="12">
              <Form-item label="联系人">
                <Input v-model.trim="outStockParams.logisticsLinkMan" style="width: 200px"></Input>
              </Form-item>
              </Col>
              <Col span="8">
              <Form-item label="联系电话">
                <Input v-model.trim="outStockParams.logisticsLinkTel" style="width: 200px"></Input>
              </Form-item>
              </Col>
            </Row>
            <Row style="marginLeft:15px;">
              <Col span="12">
              <Form-item label="邮箱">
                <Input v-model.trim="outStockParams.logisticsLinkMail" style="width: 200px"></Input>
              </Form-item>
              </Col>
              <Col span="8">
              <Form-item label="物流商单号：">
                <Input v-model.trim="outStockParams.logisticsNo" style="width: 200px"></Input>
              </Form-item>
              </Col>
            </Row>
            <Row style="marginLeft:15px;">
              <Col span="14">
              <Form-item label="运单号：">
                <Input v-model.trim="outStockParams.logisticsTrackingNo" style="width: 200px"></Input>
              </Form-item>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
      <div slot="footer" style="text-align:center;">
        <Button type="primary" style="marginRight:10px;" @click="creatOutStockSave">生成出库单</Button>
        <Button @click="creatOutStockCancel">取消</Button>
      </div>
    </Modal>
    <!-- 申报 -->
    <Modal v-model="declareModal" v-if="declareModalStatus" width="1000" title="生成货件计划">
      <div>
        <!-- 平台备货信息 -->
        <h3>平台备货信息</h3>
        <div style="marginTop:10px;">
          <span style="marginLeft:15px;">包装类型：</span>
          <RadioGroup @on-change="changeType" style="marginLeft:10px;" v-model="areCasesRequired">
            <Radio :label="0">混装发货</Radio>
            <Radio style="marginLeft:20px;" :label="1">原箱发货</Radio>
          </RadioGroup>
        </div>
        <!-- 货品信息  -->
        <h3 style="marginTop:20px;">
          货品信息 </h3>
        <div style="marginTop:10px;">
          <dTable highlight-row border :height="tableHeight" :columns="declareColumn" :data="declareData"></dTable>
        </div>
      </div>
      <!-- 发货地址 -->
      <h3 style="marginTop:20px;">
        发货地址 </h3>
      <Form :model="declarePageParams" label-position="left" :label-width="95">
        <Row style="marginLeft:15px;">
          <Col span="12">
          <Form-item label="Country/Region：">
            <Input v-model.trim="declarePageParams.countryCode" style="width: 200px"></Input>
          </Form-item>
          </Col>
          <Col span="8">
          <Form-item label="Province：">
            <Input v-model.trim="declarePageParams.provinceCode" style="width: 200px"></Input>
          </Form-item>
          </Col>
        </Row>
        <Row style="marginLeft:15px;">
          <Col span="12">
          <Form-item label="City：">
            <Input v-model.trim="declarePageParams.city" style="width: 200px"></Input>
          </Form-item>
          </Col>
          <Col span="8">
          <Form-item label="Region：">
            <Input v-model.trim="declarePageParams.districtOrCounty" style="width: 200px"></Input>
          </Form-item>
          </Col>
        </Row>
        <Row style="marginLeft:15px;">
          <Col span="12">
          <Form-item label="Full Name：">
            <Input v-model.trim="declarePageParams.name" style="width: 200px"></Input>
          </Form-item>
          </Col>
          <Col span="8">
          <Form-item label="Zip：">
            <Input v-model.trim="declarePageParams.postalCode" style="width: 200px"></Input>
          </Form-item>
          </Col>
        </Row>
        <div style="marginLeft:15px;">
          <Form-item label="Address：">
            <Input type="textarea" :autosize="{ minRows: 4, maxRows: 6 }" v-model.trim="declarePageParams.addressLine1"
              style="width: 400px"></Input>
          </Form-item>
        </div>
      </Form>
      <div slot="footer" style="text-align:center;">
        <Button type="primary" style="marginRight:10px;" @click="declareSave"
          :disabled="declareSaveStatus">提交货件至Amazon</Button>
        <Button @click="declareCancel">取消</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import addProduct from './newAddProduct';
import { getWareHouseItem } from '@/utils/getService';

const wareHouseItem = getWareHouseItem();

export default {
  mixins: [Mixin],
  components: {
    addProduct: addProduct
  },
  data() {
    var self = this;
    return {
      wareId: this.getWarehouseId(),
      goodsFlag: 'allotGoods',
      logisticList: [], // 物流商下拉列表
      logisticsMailList: [], // 邮寄方式下拉列表
      isShowNoAndStatus: false, // 单号和状态隐藏
      isShowSelect: true, // 选择收货仓库默认显示
      isShowBtn: true, // 添加货品和删除货品按钮默认显示
      isCreateShow: true, // 创建库存调整单按钮默认显示
      isShow: false, // 保存按钮默认隐藏
      isCheckShow: false, // 审核通过默认隐藏
      fromWareName: wareHouseItem.warehouseName || '',
      pageParams: {
        toWareHouse: '', // 目的仓库
        currency: '0', // 货币类型
        feeFreight: '', // 运费
        feeDeclaration: '', // 报关费用
        feeOther: '', // 其他费用
        freeType: 'H', // 按重量
        remarks: '', // 填写备注
        pageNum: 1,
        pageSize: 10,
        consigneeName: '', // 收货人名称
        consigneeCountry: '', // 国家
        consigneeLinkMan: '', // 联系人
        consigneeProvince: '', // 省
        consigneeLinkTel: '', // 联系电话
        consigneeCity: '', // 城市
        consigneeMail: '', // 邮箱
        consigneeAddress: '', // 详情地址
        consigneeAddressOther: '', // 详细地址2
        consigneeZipCode: '', // 邮政编码
        logisticsDealerCode: '', // 物流商
        logisticsDealerName: '', // 物流商名称
        logisticsNo: '', // 物流商单号
        logisticsMailCode: '', // 邮寄方式
        logisticsMailName: '', // 邮寄方式名称
        logisticsTrackingNo: '', // 跟踪号
        logisticsLinkMan: '', // 物流商联系人
        logisticsLinkTel: '', // 物流商电话
        logisticsLinkMail: '' // 物流商邮箱
      },
      totalRecords: 0,
      ruleValidate: {
        //            fromWareHouse: [
        //                {required: true, message: '发货仓库不能为空，请选择仓库', trigger: 'change' }
        //            ],
        toWareHouse: [
          {
            required: true,
            message: '目的仓库不能为空，请选择仓库',
            trigger: 'change'
          }
        ],
        consigneeLinkTel: [
          {
            validator: this.validateMobile(),
            trigger: 'blur'
          }
        ],
        consigneeMail: [
          {
            validator: this.validateEmail(),
            trigger: 'blur'
          }
        ],
        consigneeZipCode: [
          {
            validator: this.validateZipCode(),
            trigger: 'blur'
          }
        ],
        logisticsLinkTel: [
          {
            validator: this.validateMobile(),
            trigger: 'blur'
          }
        ],
        logisticsLinkMail: [
          {
            validator: this.validateEmail(),
            trigger: 'blur'
          }
        ],
        feeFreight: [
          {
            validator: this.validateFee(),
            trigger: 'blur'
          } // 运费
        ],
        feeDeclaration: [
          {
            validator: this.validateFee(),
            trigger: 'blur'
          } // 报关费
        ],
        feeOther: [
          {
            validator: this.validateFee(),
            trigger: 'blur'
          } // 其他费用
        ]
      },
      currencyTypeList: [
        {
          money: '0',
          currencyName: 'CNY-人民币'
        }, {
          money: '1',
          currencyName: 'USD-美元'
        }
      ],
      userSelectTable: [], // 用户选择的表格数组集合
      wareHouseTypeList: [], // 仓库选择列表
      addProductModal: false, // 新增货品模态框
      transferProductModalTitle: '选择调拨的产品',
      columns6: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: '序号',
          align: 'center',
          width: 70,
          render: (h, params) => {
            return h('span', params.index + 1);
          }
        }, {
          title: '图片',
          key: 'goodsUrl',
          width: 100,
          align: 'center',
          render: (h, params) => {
            return this.tableImg(h, params, 'goodsUrl');
          }
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
          title: '可用数量',
          key: 'availableNumber',
          align: 'center'
        }, {
          title: '调拨数量',
          key: 'allotInventoryNumber',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('InputNumber', {
                props: {
                  size: 'small',
                  value: params.row.allotInventoryNumber,
                  min: 0
                },
                style: {
                  marginRight: '5px',
                  width: '120px'
                },
                on: {
                  'on-change': value => {
                    self.data6[params.index] = params.row;
                    params.row.allotInventoryNumber = value;
                    if (self.showStatus.allotStatus === '0' && self.data6[params.index].inventoryAllotDetailId) {
                      self.changeAllotNumList.push(self.data6[params.index]);
                    }
                  }
                }
              })
            ]);
          }
        }, {
          title: '操作',
          key: 'action',
          align: 'center',
          width: 150,
          render: (h, params) => {
            return h('Poptip', {
              props: {
                confirm: true,
                title: '您确定要删除这条数据吗？确认删除之后记得点击保存按钮！',
                transfer: true
              },
              on: {
                'on-ok': () => {
                  this.removeProduct(params.index, this.data6[params.index].inventoryAllotDetailId);
                }
              }
            }, [
              h('Button', {
                style: {
                  margin: '0 5px'
                },
                props: {
                  type: 'error',
                  placement: 'top'
                }
              }, '删除')
            ]);
          }
        }
      ],
      data6: [], // 审核通过表格
      columns7: [
        {
          title: '图片',
          key: 'goodsUrl',
          width: 100,
          align: 'center',
          render: (h, params) => {
            return this.tableImg(h, params, 'goodsUrl');
          }
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
          title: '可用数量',
          key: 'availableNumber',
          align: 'center'
        }, {
          title: '调拨数量',
          key: 'allotInventoryNumber',
          align: 'center'
        }
      ],
      data7: [],
      transferOrderData: {}, // 创建成功之后返回的数据
      saveDetailData: {}, // 保存详情数据
      selectTransferTableList: [], // 勾选删除
      allSelectTransferList: [], // 全选删除
      showStatus: {}, // 调拨单状态
      changeAllotNumList: [],
      deleteTransferList: [], // 删除表格行数据
      creatOutStockModal: false, // 生成出库单
      creatOutStockModalStatus: false,
      productColumn: [
        {
          title: 'NO.',
          key: '',
          align: 'center',
          width: 60,
          render: (h, params) => {
            return h('div', params.index + 1);
          }
        }, {
          title: '图片',
          key: 'goodsUrl',
          align: 'center',
          width: 100,
          render: (h, params) => {
            let imgUrlPrefix = this.$store.state.imgUrlPrefix;
            return h('img', {
              attrs: {
                src: params.row.goodsUrl === '' || params.row.goodsUrl === null || params.row.goodsUrl === undefined
                  ? this.placeholderSrc
                  : imgUrlPrefix + params.row.goodsUrl
              },
              style: {
                width: '48px',
                height: '48px',
                border: '1px solid #d7dde4',
                padding: '4px',
                marginRight: '8px',
                marginTop: '6px',
                cursor: 'pointer'
              }
            });
          }
        }, {
          title: 'SKU',
          key: 'goodsSku',
          align: 'center',
          minWidth: 90
        }, {
          title: '中文描述',
          key: 'goodsCnDesc',
          align: 'center',
          minWidth: 100
        }, {
          title: '英文描述',
          key: 'goodsEnDesc',
          align: 'center',
          minWidth: 100
        }, {
          title: '调拨总数量',
          key: 'allotInventoryNumber',
          align: 'center',
          minWidth: 80
        }, {
          title: '已调拨数量',
          key: 'allocatedInventoryNumber',
          align: 'center',
          minWidth: 80
        }, {
          title: '未调拨数量',
          key: 'number',
          align: 'center',
          minWidth: 80,
          render: (h, params) => {
            return h('div', params.row.allotInventoryNumber - params.row.allocatedInventoryNumber);
          }
        }, {
          title: '本次调拨数量',
          key: 'num',
          align: 'center',
          minWidth: 80,
          render: (h, params) => {
            this.productData[params.index].nowAllocateNum = params.row.allotInventoryNumber - params.row.allocatedInventoryNumber;
            return h('InputNumber', {
              props: {
                size: 'small',
                min: 0,
                value: params.row.allotInventoryNumber - params.row.allocatedInventoryNumber
              },
              on: {
                input: val => {
                  this.productData[params.index].nowAllocateNum = val;
                }
              }
            });
          }
        }
      ],
      productData: [],
      outStockParams: {
        // 生成出库单参数
        consigneeName: null,
        consigneeCountry: null,
        consigneeLinkMan: null,
        consigneeProvince: null,
        consigneeLinkTel: null,
        consigneeCity: null,
        consigneeMail: null,
        consigneeAddress: null,
        logisticsDealerCode: '',
        logisticsDealerName: '',
        logisticsMailCode: '',
        logisticsMailName: '',
        logisticsLinkMan: null,
        logisticsLinkTel: null,
        logisticsLinkMail: null,
        logisticsNo: null,
        logisticsTrackingNo: null
      }, // 关联出库单
      cognateColumns: [
        {
          title: 'NO.',
          key: '',
          align: 'center',
          width: 100,
          render: (h, params) => {
            return h('div', params.index + 1);
          }
        }, {
          title: '出库单',
          key: 'pickingNo',
          align: 'center',
          minWidth: 150
        }, {
          title: '出库单状态',
          key: 'pickingStatus',
          align: 'center',
          minWidth: 150,
          render: (h, params) => {
            if (params.row.pickingStatus === '0') {
              return h('div', '订单创建');
            } else if (params.row.pickingStatus === '1') {
              return h('div', '部分分配');
            } else if (params.row.pickingStatus === '2') {
              return h('div', '分配完成');
            } else if (params.row.pickingStatus === '3') {
              return h('div', '部分发货');
            } else if (params.row.pickingStatus === '4') {
              return h('div', '完全发货');
            } else if (params.row.pickingStatus === '5') {
              return h('div', '出库完成');
            } else if (params.row.pickingStatus === '6') {
              return h('div', '出库取消');
            }
          }
        }, {
          title: 'LAPA SKU',
          key: 'goodsSku',
          align: 'center',
          minWidth: 150,
          render: (h, params) => {
            let list = params.row.skuBo;
            let pos = [];
            list.forEach((n, i) => {
              pos.push(h('div', n.goodsSku + ' * ' + n.expectedNumber));
            });
            return h('div', pos);
          }
        }, {
          title: '操作',
          align: 'center',
          minWidth: 150,
          render: (h, params) => {
            return h('Button', {
              props: {
                size: 'small'
              },
              on: {
                click: () => {
                  // 跳到其他出库单列表对应出库单的详情页面
                  this.toGoDownInfo(params.row.pickingNo);
                }
              }
            }, '查看出库单');
          }
        }
      ],
      cognateData: [],
      cognatePageParams: {
        pageNum: 1,
        pageSize: 10,
        merchantId: this.$store.state.userInfo.merchantId,
        pickingType: 'O1',
        inventoryAllotNo: null
      },
      cognateTotal: 0,
      declareModal: false, // 申报
      declareModalStatus: false,
      areCasesRequired: 0,
      declarePageParams: {
        countryCode: null,
        provinceCode: null,
        city: null,
        districtOrCounty: null,
        name: null,
        postalCode: null,
        addressLine1: null
      },
      declareColumn: [
        {
          title: 'NO.',
          key: '',
          align: 'center',
          width: 100,
          render: (h, params) => {
            return h('div', params.index + 1);
          }
        }, {
          title: '图片',
          key: 'goodsUrl',
          align: 'center',
          width: 100,
          render: (h, params) => {
            let imgUrlPrefix = this.$store.state.imgUrlPrefix;
            return h('img', {
              attrs: {
                src: params.row.goodsUrl === '' || params.row.goodsUrl === null || params.row.goodsUrl === undefined
                  ? this.placeholderSrc
                  : imgUrlPrefix + params.row.goodsUrl
              },
              style: {
                width: '48px',
                height: '48px',
                border: '1px solid #d7dde4',
                padding: '4px',
                marginRight: '8px',
                marginTop: '6px',
                cursor: 'pointer'
              }
            });
          }
        }, {
          title: 'LAPA SKU/名称',
          key: 'goodsSku',
          align: 'center',
          minWidth: 150,
          render: (h, params) => {
            return h('div', [h('div', params.row.goodsSku), h('div', params.row.goodsCnDesc)]);
          }
        }, {
          title: '计划调拨数量',
          key: 'allotInventoryNumber',
          align: 'center',
          minWidth: 150
        }, {
          title: 'ASIN/MSKU',
          key: 'asin',
          align: 'center',
          minWidth: 150,
          render: (h, params) => {
            if (params.row.asin && params.row.sellerSku) {
              return h('div', [h('div', params.row.asin), h('div', params.row.sellerSku)]);
            } else {
              return h('div', {
                style: {
                  color: '#008000'
                }
              }, '未关联');
            }
          }
        }
      ],
      declareData: [],
      loading2: false,
      declareSaveStatus: false, // 若有未关联的数据，不允许提交申报
      declareColumnCopy: [] // 拷贝原申报列表表头，在改变表头时用到
    };
  },
  created() {
    var v = this;
    v.getWareHouseName(); // 调用仓库下拉列表
    v.fromStartPage();
    v.getLogisticName(); // 获取物流商
    this.declareColumnCopy = this.deepCopy(this.declareColumn);
  },
  computed: {
    tableHeight() {
      return this.getTableHeight(420);
    }
  },
  methods: {
    addProductSuccess(data) {
      let v = this;
      v.addProductModal = false;
      data.forEach((item, i) => {
        item.oriTotalNumber = Number(item.allottedNumber) + Number(item.frozenNumber) + Number(item.inventoryNumber);
        item.allotInventoryNumber = null; // 调拨数量
      });
      v.data6 = this.data6.concat(data); // 待审核
      if (v.data6[0].inventoryId) {
        v.data6 = v.repeatArrayObject(v.data6, 'inventoryId');
      } else {
        v.data6 = v.repeatArrayObject(v.data6, 'goodsId');
      }
      v.totalRecords = v.data6.length;
      if (v.showStatus.allotStatus === '0' && v.data6.length !== 0) {
        v.isShow = true; // 审核保存按钮显示
        v.isCheckShow = true;
      }
    },
    addProductCancel() {
      this.addProductModal = false;
    },
    fromStartPage() {
      this.$store.commit('adjustDetailTableShow', 'noCheck');
    },
    freightFloatPoint() {
      // 费用转成两位小数
      let v = this;
      // 判断是否为空或非数字
      if (v.pageParams.feeFreight !== null && !isNaN(v.pageParams.feeFreight)) {
        v.pageParams.feeFreight = Number(v.pageParams.feeFreight).toFixed(2);
      }
    },
    declareFloatPoint() {
      let v = this;
      if (v.pageParams.feeDeclaration !== null && !isNaN(v.pageParams.feeDeclaration)) {
        v.pageParams.feeDeclaration = Number(v.pageParams.feeDeclaration).toFixed(2);
      }
    },
    amountFloatPoint() {
      let v = this;
      if (v.pageParams.feeOther !== null && !isNaN(v.pageParams.feeOther)) {
        v.pageParams.feeOther = Number(v.pageParams.feeOther).toFixed(2);
      }
    },
    validateMobile() {
      // 手机号码校验
      let v = this;
      var validateMobile = function (rule, value, callback) {
        var re = v.$regular.isPhone;
        var result = [];
        result = value.match(re);
        if (value !== '') {
          if (!!result === false) {
            callback(new Error('不是有效的手机号码或者格式不正确'));
          } else {
            callback();
          }
        } else {
          callback();
        }
      };
      return validateMobile;
    },
    validateEmail() {
      // 邮箱格式校验
      let v = this;
      var validateEmail = function (rule, value, callback) {
        var re = v.$regular.isMailbox;
        var result = [];
        result = re.test(value);
        if (value !== '') {
          if (result === false) {
            callback(new Error('不是有效的邮箱或者邮箱格式不正确'));
          } else {
            callback();
          }
        } else {
          callback();
        }
      };
      return validateEmail;
    },
    validateZipCode() {
      // 邮政编码校验
      let v = this;
      var validateZipCode = function (rule, value, callback) {
        var re = v.$regular.postalCode;
        var result = [];
        result = re.test(value);
        if (value !== '') {
          if (result === false) {
            callback(new Error('不是有效的邮政编码或者格式不正确'));
          } else {
            callback();
          }
        } else {
          callback();
        }
      };
      return validateZipCode;
    },
    validateFee() {
      // 费用校验
      let v = this;
      var validateFee = function (rule, value, callback) {
        var re = v.$regular.integer;
        var result = [];
        result = re.test(value);
        if (value !== '') {
          if (result === false) {
            callback(new Error('大于0的整数'));
          } else {
            callback();
          }
        } else {
          callback();
        }
      };
      return validateFee;
    },
    backPage() {
      // 返回列表按钮
      this.$store.commit('transferOrderShow', 'transfer');
    },
    selectItem(data) {
      // 勾选当前行删除
      this.selectTransferTableList = data;
    },
    allSelectItemBtn(data) {
      // 全选删除
      this.allSelectTransferList = data;
    },
    pickingObj() {
      // 收货人和物流商信息
      let v = this;
      let newObj = {
        consigneeName: v.pageParams.consigneeName ? v.pageParams.consigneeName : null, // 收货人名称
        consigneeCountry: v.pageParams.consigneeCountry ? v.pageParams.consigneeCountry : null, // 国家
        consigneeLinkMan: v.pageParams.consigneeLinkMan ? v.pageParams.consigneeLinkMan : null, // 联系人
        consigneeProvince: v.pageParams.consigneeProvince ? v.pageParams.consigneeProvince : null, // 省
        consigneeLinkTel: this.pageParams.consigneeLinkTel ? v.pageParams.consigneeLinkTel : null, // 联系电话
        consigneeCity: v.pageParams.consigneeCity ? v.pageParams.consigneeCity : null, // 城市
        consigneeMail: v.pageParams.consigneeMail ? v.pageParams.consigneeMail : null, // 邮箱
        consigneeAddress: v.pageParams.consigneeAddress ? v.pageParams.consigneeAddress : null, // 详情地址
        consigneeAddressOther: v.pageParams.consigneeAddressOther ? v.pageParams.consigneeAddressOther : null, // 详情地址2
        consigneeZipCode: v.pageParams.consigneeZipCode ? v.pageParams.consigneeZipCode : null, // 邮政编码
        logisticsDealerCode: v.pageParams.logisticsDealerCode ? v.pageParams.logisticsDealerCode : null, // 物流商
        logisticsDealerName: v.pageParams.logisticsDealerName ? v.pageParams.logisticsDealerName : null, // 物流商名称
        logisticsNo: v.pageParams.logisticsNo ? v.pageParams.logisticsNo : null, // 物流商单号
        logisticsMailCode: v.pageParams.logisticsMailCode ? v.pageParams.logisticsMailCode : null, // 邮寄方式
        logisticsMailName: v.pageParams.logisticsMailName ? v.pageParams.logisticsMailName : null, // 邮寄方式名称
        logisticsTrackingNo: v.pageParams.logisticsTrackingNo ? v.pageParams.logisticsTrackingNo : null, // 跟踪号
        logisticsLinkMan: v.pageParams.logisticsLinkMan ? v.pageParams.logisticsLinkMan : null, // 物流商联系人
        logisticsLinkTel: v.pageParams.logisticsLinkTel ? v.pageParams.logisticsLinkTel : null, // 物流商电话
        logisticsLinkMail: v.pageParams.logisticsLinkMail ? v.pageParams.logisticsLinkMail : null // 物流商邮箱
      };
      return newObj;
    },
    receiveObjFn() {
      let getObj = this.pickingObj();
      let sendObj;
      if (getObj.consigneeName !== null || getObj.consigneeCountry !== null || getObj.consigneeLinkMan !== null || getObj.consigneeProvince !== null || getObj.consigneeLinkTel !== null || getObj.consigneeCity !== null || getObj.consigneeMail !== null || getObj.consigneeAddress !== null || getObj.consigneeAddressOther !== null || getObj.consigneeZipCode !== null || getObj.logisticsDealerCode !== null || getObj.logisticsNo !== null || getObj.logisticsMailCode !== null || getObj.logisticsTrackingNo !== null || getObj.logisticsLinkMan !== null || getObj.logisticsLinkTel !== null || getObj.logisticsLinkMail !== null) {
        sendObj = getObj;
      } else {
        sendObj = null;
      }
      return sendObj;
    },
    transferValidFn() {
      // 库存调拨校验
      let v = this;
      let valid = true;
      for (var i = 0; i < v.data6.length; i++) {
        if (v.data6[i].allotInventoryNumber === null) {
          v.$Message.info({
            content: '调拨数量不能为空',
            duration: 5
          });
          valid = false;
          return;
        }
        if (v.data6[i].allotInventoryNumber <= 0) {
          v.$Message.info({
            content: '调拨数量不能小于等于0',
            duration: 5
          });
          valid = false;
          return;
        }
        var re = v.$regular.NoDecima;
        if (re.test(v.data6[i].allotInventoryNumber)) {
          v.$Message.info({
            content: '调拨数量不能为小数',
            duration: 5
          });
          valid = false;
          return;
        }
        // 和产品确认：这里不需要校验调拨数量不能大于可用数量了
        // if (v.data6[i].allotInventoryNumber > v.data6[i].availableNumber) {
        //   v.$Message.info({
        //     content: '调拨数量不能大于当前产品的可用数量',
        //     duration: 5
        //   });
        //   valid = false;
        //   return;
        // }
      }
      return valid;
    },
    createTransferOrderBtn(name) {
      // 创建库存调拨单
      var v = this;
      if (!v.pageParams.toWareHouse) {
        v.$Message.info({
          content: '请填写仓库必填项',
          duration: 4
        });
        return;
      }
      if (v.data6.length === 0) {
        v.$Message.info({
          content: '创建之前，请添加货品',
          duration: 4
        });
        return;
      }
      if (v.pageParams.toWareHouse === v.wareId) {
        v.$Message.info({
          content: '发货仓库和目的仓库不能相同',
          duration: 4
        });
        return;
      }
      let sendObj = this.receiveObjFn();
      var obj = {
        feeCurrency: v.pageParams.currency, // 币种
        feeDeclaration: v.pageParams.feeDeclaration ? v.pageParams.feeDeclaration : null, // 报关费
        feeFreight: v.pageParams.feeFreight ? v.pageParams.feeFreight : null, // 运费
        feeOther: v.pageParams.feeOther ? v.pageParams.feeOther : null, // 其他费用
        feeType: v.pageParams.freeType, // 按重量/体积
        remark: v.pageParams.remarks ? v.pageParams.remarks : null, // 备注
        fromWarehouseId: v.wareId, // 发货仓库id
        toWarehouseId: v.pageParams.toWareHouse, // 目的仓库id
        wmsInventoryAllotDetail: v.data6,
        wmsPickingExtend: sendObj, // 收货人和物流商信息
        warehouseId: v.wareId
      };
      v.$refs[name].validate(valid => {
        if (valid) {
          if (this.transferValidFn()) {
            v.axios.post(api.createTransferOrder, obj).then(res => {
              if (res.data.code === 0) {
                v.$Message.success('创建库存调拨单成功！');
                v.isShowNoAndStatus = true;
                v.isCreateShow = false;
                v.isShow = true;
                v.isCheckShow = true;
                v.isShowSelect = false;
                v.transferOrderData = res.data.datas; // 创建成功之后返回的数据
                this.searchData();
                v.cancelcreateTransferOrderBtn();
                v.userSelectTable = []; // 创建成功之后，选择的表格数据置空
              } else {
                v.$Message.warning('创建库存调拨单失败！');
              }
            });
          }
        } else {
          v.$Message.info({
            content: '创建失败，请检查你输入的值是否符合要求！',
            duration: 5
          });
        }
      });
    },
    getLogisticName() {
      // 获取物流商下拉列表
      var v = this;
      v.axios.get(api.get_logisticsDealerList + '?carrierId=' + '').then(res => {
        if (res.data.code === 0) {
          this.logisticList = res.data.datas; // 物流商
        }
      });
    },
    changeLogisit(item) {
      // 改变物流商时触发
      this.pageParams.logisticsDealerCode = item.value;
      this.pageParams.logisticsDealerName = item.label;
      this.outStockParams.logisticsDealerCode = item.value;
      this.outStockParams.logisticsDealerName = item.label;
      this.getLogisticsMailName();
    },
    getLogisticsMailName() {
      // 邮寄方式下拉列表
      var v = this;
      v.axios.get(api.get_logisticsMailList + '?carrierId=' + this.pageParams.logisticsDealerCode).then(res => {
        if (res.data.code === 0) {
          this.logisticsMailList = res.data.datas; // 邮寄方式
        }
      });
    },
    changeMailWay(item) {
      // 改变邮寄方式触发
      this.pageParams.logisticsMailCode = item.value;
      this.pageParams.logisticsMailName = item.label;
      this.outStockParams.logisticsMailCode = item.value;
      this.outStockParams.logisticsMailName = item.label;
    },
    searchData() {
      // 页面查询
      var v = this;
      var obj = {
        // allotStatus: v.transferOrderData.allotStatus,
        // fromWarehouseId: v.wareId,
        // toWarehouseId: v.pageParams.toWareHouse,
        inventoryAllotNo: v.transferOrderData
        // inventoryAllotId: v.transferOrderData.inventoryAllotId,
        // pageNum: v.pageParams.pageNum,
        // pageSize: v.pageParams.pageSize
      };
      v.axios.post(api.get_transferDetailData, obj).then(res => {
        if (res.data.code === 0) {
          v.data6 = res.data.datas.wmsInentoryAllotProductResult;
          v.data7 = res.data.datas.wmsInentoryAllotProductResult;
          v.productData = res.data.datas.wmsInentoryAllotProductResult;
          v.showStatus = res.data.datas; // 调拨单状态
          v.saveDetailData = res.data.datas; // 存储详情数据
          // v.totalRecords = res.data.datas.wmsInentoryAllotProductResult.total; // 总条数
          v.data6.forEach((item, i) => {
            item.oriTotalNumber = Number(item.allottedNumber) + Number(item.frozenNumber) + Number(item.inventoryNumber);
          });
        }
      });
    },
    changePage(page) {
      // 表格分页
      var v = this;
      v.pageParams.pageNum = page;
      v.searchData();
    },
    changePageSize(size) {
      // 切换每页条数
      var v = this;
      v.pageParams.pageSize = size;
      v.searchData();
    },
    filterArrFn(arr) {
      // 数组去重
      return Array.from(new Set(arr));
    },
    filterDeleteArrFn(array) {
      // 去除重复的删除id
      var n = [];
      for (var i = 0; i < array.length; i++) {
        if (n.indexOf(array[i]) === -1) {
          n.push(array[i]);
        }
      }
      return n;
    },
    getSelfProductDtl() {
      // 手动添加的产品信息
      let addSelfList = [];
      for (let i = 0; i < this.data6.length; i++) {
        if (!this.data6[i].inventoryAllotDetailId) {
          addSelfList.push(this.data6[i]);
        }
      }
      return addSelfList;
    },
    transferParamsObj() {
      // 审核通过和保存参数
      var v = this;
      let sendObj = this.receiveObjFn();
      var createPickingObj = {};
      createPickingObj.wmsPickingExtend = sendObj;
      let productSelfList = this.getSelfProductDtl(); // 手动添加的产品
      let newObj = {
        allotStatus: v.showStatus.allotStatus,
        createList: productSelfList,
        feeCurrency: v.pageParams.currency,
        feeDeclaration: v.pageParams.feeDeclaration ? v.pageParams.feeDeclaration : null,
        feeFreight: v.pageParams.feeFreight ? v.pageParams.feeFreight : null,
        feeOther: v.pageParams.feeOther ? v.pageParams.feeOther : null,
        feeType: v.pageParams.freeType,
        remark: v.pageParams.remarks ? v.pageParams.remarks : null,
        inventoryAllotNo: v.saveDetailData.inventoryAllotNo,
        inventoryAllotId: v.saveDetailData.inventoryAllotId,
        wmsInentoryAllotProductParam: v.changeAllotNumList.length !== 0 ? v.filterArrFn(this.changeAllotNumList) : null,
        removeList: v.filterDeleteArrFn(v.deleteTransferList),
        createPickingParam: createPickingObj
      };
      return newObj;
    },
    checkPassBtn(name) {
      // 审核通过按钮  xxxxxxxx
      var v = this;
      var obj = this.transferParamsObj();
      v.$refs[name].validate(valid => {
        if (valid) {
          if (this.transferValidFn()) {
            v.axios.post(api.checkTransferOrder, obj).then(res => {
              if (res.data.code === 0) {
                v.$Message.success('审核成功！');
                v.deleteTransferList = [];
                v.$store.commit('adjustDetailTableShow', 'isChecked');
                v.isShow = false;
                v.isCheckShow = false;
                v.isShowBtn = false;
                this.searchData();
              } else {
                v.$Message.warning('审核失败！');
              }
            });
          }
        } else {
          v.$Message.info({
            content: '审核失败，请检查你输入的值是否符合要求！',
            duration: 5
          });
        }
      });
    },
    saveTransferOrderBtn(name) {
      // 保存按钮
      var v = this;
      var obj = this.transferParamsObj();
      v.$refs[name].validate(valid => {
        if (valid) {
          if (this.transferValidFn()) {
            v.axios.post(api.modifyTransferOrder, obj).then(res => {
              if (res.data.code === 0) {
                v.$Message.success('保存成功！');
                v.deleteTransferList = [];
                v.changeAllotNumList = [];
                v.userSelectTable = [];
                if (v.data6.length === 0) {
                  this.isShow = false;
                  this.isCheckShow = false;
                  this.$store.commit('transferOrderShow', 'transfer');
                } else {
                  this.searchData();
                }
              } else {
                v.$Message.warning('保存失败！');
              }
            });
          }
        } else {
          v.$Message.info({
            content: '保存失败，请检查你输入的值是否符合要求！',
            duration: 5
          });
        }
      });
    },
    userSelectOk(data) {
      // 添加货品勾选表格数据
      var v = this;
      v.userSelectTable = data;
      v.userSelectTable.forEach((item, i) => {
        item.oriTotalNumber = Number(item.allottedNumber) + Number(item.frozenNumber) + Number(item.inventoryNumber);
      });
    },
    cancelcreateTransferOrderBtn() {
      // 取消创建库存移动单
      this.$store.commit('transferOrderShow', 'transfer');
    },
    getWareHouseName() {
      // 获取仓库下拉列表
      var v = this;
      v.axios.get(api.selectAllotWareHouseName).then(res => {
        if (res.data.code === 0) {
          let arr = res.data.datas;
          this.wareHouseTypeList = arr.filter(val => val.warehouseId !== v.wareId);
        }
      });
    },
    changeWarehouseName(val) {
      // 改变仓库，清空当前所属仓库的表格数据
      var v = this;
      v.pageParams.fromWareHouse = val;
      for (var i = 0; i < v.data6.length; i++) {
        if (v.pageParams.fromWareHouse !== v.data6[i].warehouseId) {
          v.data6 = [];
          v.totalRecords = 0;
        }
      }
    },
    changeToWareName(val) {
      // 改变目的仓库
      var v = this;
      v.pageParams.toWareHouse = val;
      if (v.pageParams.toWareHouse === v.wareId) {
        v.$Message.info({
          content: '目的仓库不能和发货仓库相同，请重新选择',
          duration: 5
        });
      }
    },
    removeProduct(index, allotDetailId) {
      // 删除表格行
      var v = this;
      v.data6.splice(index, 1);
      if (allotDetailId) {
        v.deleteTransferList.push(allotDetailId);
      }
      if (v.data6.length === 0) {
        this.isCheckShow = false; // 审核按钮隐藏
      }
      v.userSelectTable = [];
      v.$Message.success('成功删除当前行的货品！');
      v.totalRecords = v.totalRecords - 1;
    },
    deleteProductBtn(selectTransferTableList, allSelectTransferList) {
      // 批量删除表格行
      let v = this;
      if (v.selectTransferTableList.length === 0) {
        v.$Message.info('请勾选你要删除的货品！');
        return;
      }
      let arr = [];
      v.data6.forEach((obj, index) => {
        arr.push(obj);
      });
      arr.forEach((obj, index) => {
        selectTransferTableList.forEach((item, j) => {
          if (obj.goodsSku === item.goodsSku) {
            v.data6.splice(index, 1);
            v.selectTransferTableList = [];
            v.allSelectTransferList = [];
            v.userSelectTable = [];
            if (selectTransferTableList[j].inventoryAllotDetailId) {
              v.deleteTransferList.push(selectTransferTableList[j].inventoryAllotDetailId);
            }
            if (v.data6.length === 0) {
              this.isCheckShow = false; // 审核按钮隐藏
            }
            v.totalRecords = v.totalRecords - selectTransferTableList.length;
          }
        });
      });
      arr.forEach((obj, index) => {
        allSelectTransferList.forEach((item, j) => {
          if (obj.warehouseId === item.warehouseId || obj.receiptBatchNo === item.receiptBatchNo) {
            v.data6.splice(index, 1);
            v.selectTransferTableList = [];
            v.allSelectTransferList = [];
            v.userSelectTable = [];
            if (allSelectTransferList[j].inventoryAllotDetailId) {
              v.deleteTransferList.push(allSelectTransferList[j].inventoryAllotDetailId);
            }
            if (v.data6.length === 0) {
              this.isCheckShow = false; // 审核按钮隐藏
            }
            v.totalRecords = 0;
          }
        });
      });
      v.$Message.success('成功删除选中的货品！');
    },
    showAddProductModal() {
      // 添加货品模态框
      var v = this;
      v.addProductModal = true;
    },
    addNewProduct() {
      // 保存添加产品
      var v = this;
      v.userSelectTable.forEach((n, i) => {
        n.allotInventoryNumber = null; // 调拨数量
      });
      var obj = {};
      for (var i = 0; i < v.userSelectTable.length; i++) {
        obj[v.userSelectTable[i].goodsSku] = 1;
        for (var j = 0; j < v.data6.length; j++) {
          if (obj[v.data6[j].goodsSku]) {
            v.$Message.info({
              content: '添加货品失败，你已经添加了该货品，不能重复添加！',
              duration: 3
            });
            v.addProductModal = true;
            return;
          }
        }
      }
      if (v.userSelectTable.length === 0) {
        v.addProductModal = true;
        this.$Message.info({
          content: '请勾选你要添加的货品！',
          duration: 4
        });
        return;
      }
      v.addProductModal = false;
      v.$Message.success('成功添加调拨的产品！');
      v.data6 = this.data6.concat(v.userSelectTable); // 待审核
      v.totalRecords += v.userSelectTable.length;
      if (v.showStatus.allotStatus === '0' && v.data6.length !== 0) {
        v.isShow = true; // 审核保存按钮显示
        v.isCheckShow = true;
      }
    },
    cancelButton() {
      // 模态框取消按钮
      var v = this;
      v.$Message.info('取消添加调拨的产品！');
      v.addProductModal = false;
    },
    creatOutStock() {
      // 生成出库单
      let v = this;
      if (!v.data6.length) {
        v.$Message.error('请先添加货品');
        return false;
      }
      v.creatOutStockModal = true;
      v.creatOutStockModalStatus = true;
    },
    creatOutStockSave() {
      // 生成出库单 保存
      let v = this;
      let pos = [];
      let status = false; // true 本次调拨数量不符合要求
      // console.log(v.productData);
      // console.log(v.outStockParams);
      let obj = {
        inventoryAllotId: v.saveDetailData.inventoryAllotId,
        wmsInventoryAllotDetail: [],
        wmsPickingExtend: v.outStockParams
      };
      v.productData.forEach((n, i) => {
        if (n.nowAllocateNum && n.nowAllocateNum <= n.allotInventoryNumber - n.allocatedInventoryNumber) {
          pos.push({
            inventoryAllotDetailId: n.inventoryAllotDetailId,
            productGoodsId: n.productGoodsId,
            quantity: n.nowAllocateNum
          });
        } else if (n.nowAllocateNum > n.allotInventoryNumber - n.allocatedInventoryNumber) {
          v.$Message.error('本次调拨数量不能大于未调拨数量');
          status = true;
          return false;
        }
      });
      if (status) {
        return false;
      } else {
        if (pos.length) {
          obj.wmsInventoryAllotDetail = pos;
          // console.log(obj);
          v.axios.post(api.create_allotPicking, obj).then(response => {
            if (response.data.code === 0) {
              v.$Message.success('操作成功');
              v.$store.commit('adjustDetailTableShow', 'isChecked');
              v.isShow = false;
              v.isCheckShow = false;
              v.isShowBtn = false;
              v.creatOutStockModal = false;
              v.productData = [];
              v.outStockParams = {};
              v.searchData();
              v.getCognateData();
            }
          });
        } else {
          v.$Message.error('本次调拨无效，生成出库单无调拨数量大于0的明细');
          return false;
        }
      }
    },
    creatOutStockCancel() {
      // 生成出库单 取消
      let v = this;
      v.creatOutStockModal = false;
    },
    getCognateData() {
      // 获取关联出库单数据
      let v = this;
      v.cognatePageParams.inventoryAllotNo = v.saveDetailData.inventoryAllotNo;
      if (v.saveDetailData.warehouseOverseaType) {
        // 第三方仓
        let thirdClounm = [
          {
            title: 'NO.',
            key: '',
            align: 'center',
            width: 100,
            render: (h, params) => {
              return h('div', params.index + 1);
            }
          }, {
            title: 'SHIPMENT ID',
            key: 'shipmentId',
            align: 'center',
            minWidth: 150
          }, {
            title: '出库单',
            key: 'pickingNo',
            align: 'center',
            minWidth: 150
          }, {
            title: '出库单状态',
            key: 'pickingStatus',
            align: 'center',
            minWidth: 150,
            render: (h, params) => {
              if (params.row.pickingStatus === '0') {
                return h('div', '订单创建');
              } else if (params.row.pickingStatus === '1') {
                return h('div', '部分分配');
              } else if (params.row.pickingStatus === '2') {
                return h('div', '分配完成');
              } else if (params.row.pickingStatus === '3') {
                return h('div', '部分发货');
              } else if (params.row.pickingStatus === '4') {
                return h('div', '完全发货');
              } else if (params.row.pickingStatus === '5') {
                return h('div', '出库完成');
              } else if (params.row.pickingStatus === '6') {
                return h('div', '出库取消');
              }
            }
          }, {
            title: 'LAPA SKU',
            key: 'goodsSku',
            align: 'center',
            minWidth: 150,
            render: (h, params) => {
              let list = params.row.skuBo;
              let pos = [];
              list.forEach((n, i) => {
                pos.push(h('div', n.goodsSku + ' * ' + n.expectedNumber));
              });
              return h('div', pos);
            }
          }, {
            title: 'FNSKU',
            key: 'fnsku',
            align: 'center',
            minWidth: 150,
            render: (h, params) => {
              let list = params.row.skuBo;
              let pos = [];
              list.forEach((n, i) => {
                pos.push(h('div', n.fnsku + ' * ' + n.expectedNumber));
              });
              return h('div', pos);
            }
          }, {
            title: '目的地',
            key: 'consigneeAddress',
            align: 'center',
            minWidth: 150
          }, {
            title: '操作',
            align: 'center',
            minWidth: 150,
            render: (h, params) => {
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
                      this.toGoDownInfo(params.row.pickingNo);
                    }
                  }
                }, '查看'), params.row.createShipmentStatus === 0 ? h('Button', {
                  props: {
                    size: 'small'
                  },
                  style: {
                    marginLeft: '5px'
                  },
                  on: {
                    click: () => {
                      this.updateInfo(params.row.pickingId);
                    }
                  }
                }, '更新货件信息') : ''
              ]);
            }
          }
        ];
        v.cognateColumns = thirdClounm;
        v.axios.post(api.get_otherAllotData, v.cognatePageParams).then(res => {
          if (res.data.code === 0) {
            let data = res.data.datas;
            v.cognateData = data.list;
            v.cognateTotal = data.total;
          }
        });
      } else {
        // 本地仓
        let clounm = [
          {
            title: 'NO.',
            key: '',
            align: 'center',
            width: 100,
            render: (h, params) => {
              return h('div', params.index + 1);
            }
          }, {
            title: '出库单',
            key: 'pickingNo',
            align: 'center',
            minWidth: 150
          }, {
            title: '出库单状态',
            key: 'pickingStatus',
            align: 'center',
            minWidth: 150,
            render: (h, params) => {
              if (params.row.pickingStatus === '0') {
                return h('div', '订单创建');
              } else if (params.row.pickingStatus === '1') {
                return h('div', '部分分配');
              } else if (params.row.pickingStatus === '2') {
                return h('div', '分配完成');
              } else if (params.row.pickingStatus === '3') {
                return h('div', '部分发货');
              } else if (params.row.pickingStatus === '4') {
                return h('div', '完全发货');
              } else if (params.row.pickingStatus === '5') {
                return h('div', '出库完成');
              } else if (params.row.pickingStatus === '6') {
                return h('div', '出库取消');
              }
            }
          }, {
            title: 'LAPA SKU',
            key: 'goodsSku',
            align: 'center',
            minWidth: 150,
            render: (h, params) => {
              let list = params.row.skuBo;
              let pos = [];
              list.forEach((n, i) => {
                pos.push(h('div', n.goodsSku + ' * ' + n.expectedNumber));
              });
              return h('div', pos);
            }
          }, {
            title: '操作',
            align: 'center',
            minWidth: 150,
            render: (h, params) => {
              return h('Button', {
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    // 跳到其他出库单列表对应出库单的详情页面
                    this.toGoDownInfo(params.row.pickingNo);
                  }
                }
              }, '查看出库单');
            }
          }
        ];
        v.cognateColumns = clounm;
        v.axios.post(api.get_allotlocalData, v.cognatePageParams).then(res => {
          if (res.data.code === 0) {
            let data = res.data.datas;
            v.cognateData = data.list;
            v.cognateTotal = data.total;
          }
        });
      }
    },
    toGoDownInfo(pickingNo) {
      // 跳转其他出库列表  出库单详情
      let v = this;
      let obj = {
        pickingNo: pickingNo,
        workType: 'otherStock',
        workShow: 'detail'
      };
      v.$store.commit('otherStockInfo', obj);
      v.$router.push({ path: 'otherStockOut', query: { warehouseId: this.getWarehouseId() } });
    },
    declare() {
      // 申报
      let v = this;
      v.declareModal = true;
      v.declareModalStatus = true;
      v.getDeclareCancel();
    },
    declareSave() {
      // 申报提交
      let v = this;
      v.loading2 = true;
      let pos = [];
      let box = [];
      // console.log(v.declareData);
      // console.log(v.declarePageParams);
      let obj = {
        areCasesRequired: v.areCasesRequired,
        inventoryAllotId: v.saveDetailData.inventoryAllotId,
        shipFromAddress: v.declarePageParams,
        declareDetailBoList: []
      };
      if (v.areCasesRequired) {
        // 原箱发货
        if (v.declareData.length) {
          v.declareData.forEach((n, i) => {
            if (n.asin && n.sellerSku) {
              box.push({
                inventoryAllotDetailId: n.inventoryAllotDetailId,
                productGoodsId: n.productGoodsId,
                asin: n.asin,
                boxQuantity: n.boxNum,
                quantityInCase: n.quantityBox,
                sellerSku: n.sellerSku,
                quantity: n.quantityBox * n.boxNum
              });
            }
          });
        }
        // console.log(box);
        obj.declareDetailBoList = box;
      } else {
        // 混装发货
        if (v.declareData.length) {
          v.declareData.forEach((n, i) => {
            if (n.asin && n.sellerSku) {
              pos.push({
                inventoryAllotDetailId: n.inventoryAllotDetailId,
                productGoodsId: n.productGoodsId,
                sellerSku: n.sellerSku,
                asin: n.asin,
                boxQuantity: 0,
                quantityInCase: 0,
                quantity: n.nowAllocateNum ? n.nowAllocateNum : 0
              });
            }
          });
        }
        // console.log(pos);
        obj.declareDetailBoList = pos;
      }
      v.axios.post(api.create_amazonDeclare, obj).then(response => {
        v.loading2 = false;
        if (response.data.code === 0) {
          v.$Message.success('操作成功');
          v.$store.commit('adjustDetailTableShow', 'isChecked');
          v.isShow = false;
          v.isCheckShow = false;
          v.isShowBtn = false;
          v.declareModal = false;
          v.declareData = [];
          v.declarePageParams = {};
          v.searchData();
          v.getCognateData();
        }
      }).catch(() => { v.loading2 = false; });
    },
    declareCancel() {
      // 申报取消
      let v = this;
      v.declareModal = false;
    },
    changeType(val) {
      // 改变包装类型
      // console.log(val);
      let v = this;
      v.declareColumn = v.deepCopy(v.declareColumnCopy);
      let column = [
        {
          title: '本次申报数量',
          key: 'num',
          align: 'center',
          minWidth: 80,
          render: (h, params) => {
            if (params.row.asin && params.row.sellerSku) {
              return h('InputNumber', {
                props: {
                  size: 'small',
                  min: 0,
                  value: 0
                },
                on: {
                  input: val => {
                    this.declareData[params.index].nowAllocateNum = val;
                  }
                }
              });
            }
          }
        }
      ];
      let boxColumn = [
        {
          // 每箱数量
          title: '每箱数量',
          key: 'num',
          align: 'center',
          minWidth: 110,
          render: (h, params) => {
            if (params.row.asin && params.row.sellerSku) {
              return h('InputNumber', {
                props: {
                  size: 'small',
                  min: 0,
                  value: this.declareData[params.index].quantityBox
                },
                on: {
                  input: val => {
                    this.declareData[params.index].quantityBox = val;
                  }
                }
              });
            }
          }
        }, {
          // 箱数
          title: '箱数',
          key: 'num',
          align: 'center',
          minWidth: 110,
          render: (h, params) => {
            if (params.row.asin && params.row.sellerSku) {
              return h('InputNumber', {
                props: {
                  size: 'small',
                  min: 0,
                  value: this.declareData[params.index].boxNum
                },
                on: {
                  input: val => {
                    this.declareData[params.index].boxNum = val;
                  }
                }
              });
            }
          }
        }, {
          // 本次申报数量
          title: '本次申报数量',
          key: 'num',
          align: 'center',
          minWidth: 100,
          render: (h, params) => {
            let num = params.row.quantityBox * params.row.boxNum;
            return h('div', num || null);
          }
        }
      ];
      if (val) {
        // 原箱发货
        v.declareColumn = v.declareColumn.concat(boxColumn);
      } else {
        // 混装发货
        v.declareColumn = v.declareColumn.concat(column);
      }
    },
    getDeclareCancel() {
      // 获取申报表格数据
      let v = this;
      v.declareColumn = v.deepCopy(v.declareColumnCopy);
      let column = [
        {
          title: '本次申报数量',
          key: 'num',
          align: 'center',
          minWidth: 80,
          render: (h, params) => {
            if (params.row.asin && params.row.sellerSku) {
              return h('InputNumber', {
                props: {
                  size: 'small',
                  min: 0,
                  value: 0
                },
                on: {
                  input: val => {
                    this.declareData[params.index].nowAllocateNum = val;
                  }
                }
              });
            }
          }
        }
      ];
      v.declareColumn = v.declareColumn.concat(column);
      let obj = {
        inventoryAllotNo: v.saveDetailData.inventoryAllotNo
      };
      v.axios.post(api.get_allotDetail, obj).then(res => {
        if (res.data.code === 0) {
          let data = res.data.datas;
          if (data) {
            data.forEach((n, i) => {
              n.quantityBox = 0;
              n.boxNum = 0;
            });
            v.declareData = data;
            if (data.length === 1) {
              // 如果只有一条，且未关联则申报置为不可用
              if (!data[0].asin || !data[0].sellerSku) {
                v.declareSaveStatus = true;
              } else {
                v.declareSaveStatus = false;
              }
            } else {
              // 如果有多条数据，且有已关联的数据则申报按钮置为可用
              data.forEach((m, t) => {
                if (m.asin || m.sellerSku) {
                  v.declareSaveStatus = false;
                }
              });
            }
          }
        }
      });
    },
    updateInfo(id) {
      // 更新货件信息
      let v = this;
      v.axios.put(api.update_fbaInfo + id).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            v.$Message.success('操作成功');
            v.getCognateData();
          } else {
            v.$Message.error('更新失败，请重试');
          }
        }
      });
    }
  }
};
</script >

<style >
.headerBar .ivu-modal-header p,
.headerBar .ivu-modal-header-inner {
  color: #fff;
}
</style >
