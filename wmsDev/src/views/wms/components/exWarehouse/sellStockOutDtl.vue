<template>
  <div class="stockOutDlt">
    <!--返回-->
    <div>
      <!-- <h3> -->
      <Icon type="ios-arrow-back"></Icon>
      <!-- <a href="javascript:;" style='color:#657180' @click='backList'>返回列表</a> -->
      <a @click="backList">返回列表</a>
      <!-- </h3> -->
    </div>
    <div style="background-color: #fff; margin-bottom: 20px; text-align: center">
      <div style="font-size: 14px; padding: 10px 0">
        <h4>出库单详情:{{ mainInfo.num }}</h4>
      </div>
      <div :style="`width: ${workType === 'sellStock' ? '1100' : '1100'
        }px;margin: 0 auto;height: 74px;`">
        <Steps v-if="currentIconStatus.createdTime ||
          currentIconStatus.pickingTime ||
          currentIconStatus.getLabelTime ||
          currentIconStatus.pickingGoodsTime
          " :current="workType === 'sellStock'
    ? currentIconStatus.salesPickingStatus
    : currentIconStatus.otherPickingStatus
    ">
          <!--已创建-->
          <Step title="已创建" icon="md-cart" :content="currentIconStatus.createdTime"></Step>
          <Step title="已上传物流商" icon="md-car" v-if="workType === 'sellStock' &&
            currentIconStatus.pickingTime &&
            currentIconStatus.getLabelTime &&
            currentIconStatus.pickingTime > currentIconStatus.getLabelTime
            " :content="currentIconStatus.getLabelTime">
          </Step>
          <!--已上传物流商 getLabelTime-->
          <Step title="已配货" icon="md-cash" :content="currentIconStatus.pickingTime"></Step>
          <!--已配货 pickingTime -->
          <Step title="已拣货" icon="ios-basket" v-if="currentIconStatus.pickingGoodsTime &&
            currentIconStatus.getLabelTime &&
            currentIconStatus.pickingGoodsTime < currentIconStatus.getLabelTime
            " :content="currentIconStatus.pickingGoodsTime"></Step>
          <!--已拣货 pickingGoodsTime-->
          <Step title="已上传物流商" icon="md-car" v-if="workType === 'sellStock' &&
            (!currentIconStatus.pickingTime ||
              !currentIconStatus.getLabelTime ||
              currentIconStatus.pickingTime <= currentIconStatus.getLabelTime)
            " :content="currentIconStatus.getLabelTime"></Step>
          <!--已上传物流商 getLabelTime-->
          <Step title="已拣货" icon="ios-basket" v-if="!currentIconStatus.pickingGoodsTime ||
            !currentIconStatus.getLabelTime ||
            currentIconStatus.pickingGoodsTime >= currentIconStatus.getLabelTime
            " :content="currentIconStatus.pickingGoodsTime"></Step>
          <!--已拣货 pickingGoodsTime-->
          <Step title="已打印" icon="md-print" v-if="workType === 'sellStock'" :content="currentIconStatus.printTime">
          </Step>
          <!--打印 printTime-->
          <Step title="已装箱" icon="md-cube" v-if="workType === 'otherStock' && detailApiObj.needBox === 1"
            :content="detailApiObj.boxFinishTime"></Step>
          <!--已装箱-->
          <Step title="已发货" icon="ios-send" :content="currentIconStatus.despatchTime"></Step>
          <!--已发货-->
        </Steps>
      </div>
    </div>
    <div style="background-color: #fff">
      <Tabs value="main" @on-click="tabClick">
        <TabPane label="主信息" name="main">
          <Form :label-width="180">
            <Row>
              <Col span="6">
              <FormItem label="出库单编号：">
                <span>{{ mainInfo.num }}</span>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="出库单类型：">
                <span>{{ outListTypeListLabel }}</span>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="拣货单编号：">
                <!--<Select v-model="mainInfo.type" style='width: 220px' :disabled='true'>-->
                <!--<Option value="*">全部</Option>-->
                <!--<Option v-for="item in outListTypeList" :value="item.value"-->
                <!--:key="item.value">-->
                <!--{{ item.label }}-->
                <!--</Option>-->
                <!--</Select>-->
                <!-- <span>{{ mainInfo.pickingGoodsNo }}</span> -->
                <div v-if="Array.isArray(pickingRow.pickingGoodsNos)" style="word-break: break-all">
                  {{ pickingRow.pickingGoodsNos.join(",") }}
                </div>
              </FormItem>
              </Col>
              <Col span="6" v-if="workType === 'otherStock'">
              <FormItem label="出库单状态：">
                <span>{{
                  mainInfo.status === "0"
                  ? "订单创建"
                  : mainInfo.status === "1"
                    ? "部分分配"
                    : mainInfo.status === "2"
                      ? "分配完成"
                      : mainInfo.status === "3"
                        ? "部分发货"
                        : mainInfo.status === "4"
                          ? "完全发货"
                          : mainInfo.status === "5"
                            ? "订单完成"
                            : ""
                }}</span>
              </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span="6">
              <FormItem label="发货仓库：">
                <span>{{ mainInfo.ware }}</span>
              </FormItem>
              </Col>
              <!--其他出库显示参考编号-->
              <Col span="6" v-if="workType === 'otherStock'">
              <FormItem label="参考编号：">
                <span>{{ mainInfo.referenceNum }}</span>
                <span style="margin-left: 10px">{{ mainInfo.shipmentID }}</span>
              </FormItem>
              </Col>
              <!--销售出库显示订单号-->
              <Col span="6" v-if="workType !== 'otherStock'">
              <FormItem label="订单号：">
                <template v-if="mainInfo.packageOrderBoList.length" v-for="(item, index) in mainInfo.packageOrderBoList">
                  <span v-if="item.accountCode" :key="index">{{
                    item.accountCode + "-" + item.salesRecordNumber
                  }}</span>
                  <span v-else :key="`else-${index}`">{{
                    item.salesRecordNumber
                  }}</span>
                </template>
              </FormItem>
              </Col>
              <Col span="6" v-if="workType === 'otherStock'">
              <FormItem label="拣货状态：">
                <span>{{
                  mainInfo.pickingGoodsStatus === "0"
                  ? "未拣货"
                  : mainInfo.pickingGoodsStatus === "1"
                    ? "已拣货"
                    : ""
                }}</span>
              </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span="6">
              <FormItem label="创建时间：">
                <span>{{ mainInfo.createTime }}</span>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="创建人：">
                <span>{{ mainInfo.creator }}</span>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="订单付款时间：">
                <span>{{ mainInfo.payTime }}</span>
              </FormItem>
              </Col>
              <Col span="6" v-if="workType === 'otherStock' && detailApiObj.needBox === 1">
              <FormItem label="装箱状态：">
                <span>{{
                  mainInfo.boxStatus === 0
                  ? "未装箱"
                  : mainInfo.boxStatus === 2
                    ? "已装箱"
                    : ""
                }}</span>
              </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span="6">
              <FormItem label="最后修改时间：">
                <span>{{ mainInfo.lastModifyTime }}</span>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="最后修改人：">
                <span>{{ mainInfo.updateName }}</span>
              </FormItem>
              </Col>
            </Row>
            <Row v-if="workType === 'sellStock'">
              <Col span="6">
              <FormItem label="LAPA估算重量:">
                <span>{{ mainInfo.totalWeight }}</span>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="LAPA称重重量:">
                <span>{{ mainInfo.userWeight }}</span>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="LAPA估算运费:">
                <span>{{ mainInfo.estimateFreight }}</span>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="LAPA称重后运费:">
                <span>{{ mainInfo.postage }}</span>
              </FormItem>
              </Col>
            </Row>
          </Form>
        </TabPane>
        <TabPane label="收货人信息" name="receiver">
          <Form :label-width="180">
            <Row>
              <Col span="6">
              <FormItem label="收货人名称：">
                <Input v-model.trim="receiver.receiverName" style="display: none" />
                <Input type="text" v-if="otherIsEdit" v-model.trim="receiver.receiverName" :maxlength="50"
                  style="width: 220px"></Input>
                <span v-else>{{ receiver.receiverName }}</span>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="国家：">
                <Select v-if="otherIsEdit" v-model="receiver.country" style="width: 220px">
                  <Option v-for="(item, index) in formValidate.country" :key="index" :value="item.twoCode">{{ item.cnName
                  }}
                  </Option>
                </Select>
                <span v-else>{{ receiver.country }}</span>
              </FormItem>
              </Col>
              <Col span="6" v-if="workType !== 'otherStock'">
              <FormItem label="买家识别号：">
                <span>{{ receiver.buyerPassportCode }}</span>
              </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span="6">
              <FormItem label="联系人：">
                <Input v-if="otherIsEdit" v-model.trim="receiver.linkman" :maxlength="50" style="width: 220px"></Input>
                <span v-else>{{ receiver.linkman }}</span>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="省/州：">
                <Input v-if="otherIsEdit" v-model.trim="receiver.region" :maxlength="50" style="width: 220px"></Input>
                <span v-else>{{ receiver.region }}</span>
              </FormItem>
              </Col>
              <Col span="6" v-if="workType !== 'otherStock'">
              <FormItem label="手机：">
                <span>{{ receiver.MobilePhone }}</span>
              </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span="6">
              <FormItem label="固定电话：">
                <Input v-if="otherIsEdit" v-model.trim="receiver.tel" :maxlength="50" style="width: 220px"></Input>
                <span v-else>{{ receiver.tel }}</span>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="城市：">
                <Input v-if="otherIsEdit" v-model.trim="receiver.city" :maxlength="50" style="width: 220px"></Input>
                <span v-else>{{ receiver.city }}</span>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="邮箱：">
                <Input v-if="otherIsEdit" v-model.trim="receiver.email" :maxlength="50" style="width: 220px"></Input>
                <span v-else>{{ receiver.email }}</span>
              </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span="6">
              <FormItem label="详细地址1：">
                <Input v-if="otherIsEdit" v-model.trim="receiver.address" :maxlength="50" style="width: 220px"></Input>
                <span v-else>{{ receiver.address }}</span>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="详细地址2：">
                <Input v-if="otherIsEdit" v-model.trim="receiver.consigneeAddressOther" :maxlength="50"
                  style="width: 220px"></Input>
                <span v-else>{{ receiver.consigneeAddressOther }}</span>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="邮政编码：">
                <Input v-if="otherIsEdit" v-model.trim="receiver.postalcode" :maxlength="50" style="width: 220px"></Input>
                <span v-else>{{ receiver.postalcode }}</span>
              </FormItem>
              </Col>
            </Row>
          </Form>
        </TabPane>
        <TabPane label="物流商信息" name="logistic">
          <Form :label-width="180">
            <Row>
              <Col span="6">
              <FormItem label="物流商：">
                <Select v-if="otherIsEdit" v-model="mainInfo.logisticsDealerCode" label-in-value style="width: 220px"
                  filterable @on-change="logisticDealerChange">
                  <Option v-for="v in apiLogisterList" :value="v.code" :key="v.code">{{
                    v.name
                  }}</Option>
                </Select>
                <span v-else>{{ logister.logisticDealer }}</span>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="物流商单号：">
                <Input v-if="otherIsEdit" v-model.trim="logister.logisticNum" :maxlength="50"
                  style="width: 220px"></Input>
                <span v-else>{{ logister.logisticNum }}</span>
              </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span="6">
              <FormItem label="邮寄方式：">
                <Select v-model="mainInfo.logisticsMailCode" v-if="otherIsEdit" style="width: 220px" label-in-value
                  filterable placeholder="请先选择物流商">
                  <Option v-for="v in apiSendTypeList" :value="v.code" :key="v.code">{{
                    v.name
                  }}</Option>
                </Select>
                <span v-else>{{ logister.sendType }}</span>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="运单号1：">
                <Input v-if="otherIsEdit" v-model.trim="logister.trackingNum" :maxlength="50"
                  style="width: 220px"></Input>
                <span v-else>{{ logister.trackingNum }}</span>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="运单号2：">
                <span>{{ logister.virtualTrackingNumber }}</span>
              </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span="6">
              <FormItem label="联系人：" v-if="workType === 'otherStock'">
                <Input v-if="otherIsEdit" v-model.trim="logister.linkman" :maxlength="50" style="width: 220px"></Input>
                <span v-else>{{ logister.linkman }}</span>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="固定电话：" v-if="workType === 'otherStock'">
                <Input v-if="otherIsEdit" v-model.trim="logister.tel" :maxlength="50" style="width: 220px"></Input>
                <span v-else>{{ logister.tel }}</span>
              </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span="6">
              <FormItem label="邮箱：" v-if="workType === 'otherStock'">
                <Input v-if="otherIsEdit" v-model.trim="logister.email" :maxlength="50" style="width: 220px"></Input>
                <span v-else>{{ logister.email }}</span>
              </FormItem>
              </Col>
            </Row>
            <Row v-if="workType === 'sellStock'">
              <Col span="6">
              <FormItem label="物流商称重:">
                <Input v-if="otherIsEdit" v-model.trim="logister.linkman" :maxlength="50" style="width: 220px"></Input>
                <span v-else>{{ logister.carrierWeight }}</span>
              </FormItem>
              </Col>
              <Col span="6">
              <FormItem label="物流商运费:">
                <Input v-if="otherIsEdit" v-model.trim="logister.tel" :maxlength="50" style="width: 220px"></Input>
                <span v-else>{{ logister.postage }}</span>
              </FormItem>
              </Col>
            </Row>
            <Row v-if="logister.packageCarrierParamList">
              <Col span="6" v-for="(item, index) in logister.packageCarrierParamList" :key="index">
              <FormItem :label="item.paramKey + '：'" v-if="item.paramValue">
                <span>{{ item.paramValue }}</span>
              </FormItem>
              </Col>
            </Row>
          </Form>
        </TabPane>
        <TabPane label="仓库费用" name="wareExpenses" v-if="wareExpenses" class="formDetail">
          <Form :label-width="100" :inline="true" class="formWidth100">
            <FormItem label="操作费：">
              <span>{{ detailApiObj.operatingFee || 0 }} CNY</span>
            </FormItem>
            <FormItem label="仓储费：">
              <span>{{ detailApiObj.storageFee || 0 }} CNY</span>
            </FormItem>
            <FormItem label="出仓费：">
              <span>{{ detailApiObj.warehouseOutFee || 0 }} CNY</span>
            </FormItem>
          </Form>
        </TabPane>
        <TabPane :label="label" name="declareInfo">
          <div class="clear" v-if="!ymsMerchant">
            <div class="fr">
              <Button type="primary" v-if="dataDeclare.length === 0 && !openEditStatus"
                style="margin-bottom: 20px; margin-right: 20px" @click="addDeclareRow">新增
              </Button>
              <Button type="primary" v-if="!openEditStatus && dataDeclare.length > 0"
                style="margin-bottom: 20px; margin-right: 20px" @click="editDeclareInfo">编辑
              </Button>
              <div v-if="openEditStatus" style="margin-bottom: 20px; margin-right: 20px">
                <Button type="primary" @click="saveDeclareInfo">保存</Button>
                <Button @click="cancelSaveDeclareInfo">取消</Button>
              </div>
            </div>
          </div>
          <Table border :columns="columnsDeclare" :data="dataDeclare"></Table>
        </TabPane>
        <!-- <TabPane label="增值服务" name="valueAddServices" v-if="showValAddService">
          <Form :label-width="100" inline>
            <FormItem label="抽真空：">
              <span v-for="(item, index) in (valueAddedServiceList.vacuumizeProduct || [])" :key="index" class="mr10">
                {{ item.sku }}*{{ item.num }}
              </span>
            </FormItem>
            <FormItem label="换包装：">
              <span v-for="(item, index) in (valueAddedServiceList.inventoryOverTime || [])" :key="index" class="mr10">
                {{ item.sku }}*{{ item.num }}
              </span>
            </FormItem>
          </Form>
        </TabPane> -->
      </Tabs>
    </div>
    <!--工具栏-->
    <div class="clear" style="padding: 10px 0" v-if="!ymsMerchant">
      <div class="fl" v-if="(mainInfo.status === '0' || mainInfo.status === '1') &&
        getPermission('wmsPicking_updatePicking')
        ">
        <!--亚马逊 调拨不能添加商品-->
        <Button type="primary" icon="md-add" :disabled="warehouseOverseaType === 'AMAZON_FBA' && mainInfo.type === 'O1'"
          @click="showAddProductModal" style="margin-right: 10px">添加货品
        </Button>
        <Button type="error" v-if="workType === 'otherStock' &&
          getPermission('wmsPicking_updatePicking') &&
          (mainInfo.status === '0' || mainInfo.status === '1')
          " icon="md-trash" @click="deleteProductBtn">移除货品</Button>
      </div>
      <div class="fr">
        <span v-if="detailApiObj.pickingOutStatus !== 2">
          <!-- <Button type="primary" @click="outByThirdLabel" class="mr10"
            v-if="getPermission('wmsPicking_matchOverseaTag') && ['O12'].includes(mainInfo.type) && !mainInfo.pickingGoodsNo"
            :loading="thrdLableInfo.loading" :disabled="thrdLabelDisable" title="商品变动需要保存再进行匹配">
            匹配第三方标签出库
          </Button> -->
          <Button type="primary" v-if="workType === 'sellStock'
            ? +currentIconStatus.salesPickingStatus < 3
            : currentIconStatus.otherPickingStatus < 1
            " @click="assignInventory" :loading="waitLoading" :disabled="!getPermission('wmsPicking_modifySalesDistributionSingle') &&
    !getPermission('wmsPicking_modifyDistributionSingle')
    ">分配库存
          </Button>
          <Button type="primary" v-if="workType === 'sellStock'
            ? +currentIconStatus.salesPickingStatus < 3
            : currentIconStatus.otherPickingStatus < 1
            " @click="FreezeAssignmentBtn" :loading="waitLoading" style="margin-left: 10px"
            :disabled="!getPermission('wmsPicking_otherPickingDistributionFrozen')">
            冻结分配
          </Button>
          <Button type="primary" :loading="waitLoading" v-if="workType === 'sellStock'
            ? +currentIconStatus.salesPickingStatus < 3
            : +currentIconStatus.otherPickingStatus < 2
            " @click="cancelAssign" style="margin-left: 10px" :disabled="!getPermission('wmsPicking_modifySalesDistributionCancelSingle') &&
    !getPermission('wmsPicking_modifyDistributionCancelSingle')
    ">取消分配
          </Button>
        </span>
        <Button v-if="currentIconStatus.otherPickingStatus === 2 &&
          detailApiObj.needBox === 1 &&
          detailApiObj.boxStatus !== 2 &&
          boxShowStatus
          " type="primary" @click="encasement" style="margin-left: 10px">装箱
        </Button>

        <!--更新装箱信息-->
        <Button v-if="detailApiObj.boxStatus == 2 && detailApiObj.uploadBoxStatus === 0" type="primary"
          @click="encasement" style="margin-left: 10px">更新装箱信息
        </Button>
      </div>
    </div>
    <!--出库单表格-->
    <!--<div>-->
    <Table :columns="columns1" highlight-row border :data="deliveryListData" height="500"
      @on-selection-change="sltTableItemFn">
    </Table>
    <div style="margin: 10px 0; text-align: center">
      <Button type="error" style="margin-left: 10px" v-if="workType === 'otherStock' &&
        getPermission('wmsPicking_obsoletePicking') &&
        mainInfo.status === '0'
        " @click="delObsoletePicking">删除
      </Button>
      <Button type="primary" style="margin-left: 10px" v-if="workType === 'otherStock' &&
        getPermission('wmsPicking_updatePicking') &&
        (mainInfo.status === '0' || mainInfo.status === '1')
        " @click="saveObsoletepick('refresh')">保存
      </Button>
    </div>
    <!--分配列表-->
    <div style="font-size: 16px; padding: 15px 0">
      <span>分配列表</span>
      <span v-if="assignListShow" @click="changeShow">
        <Icon type="ios-arrow-up" style="font-size: 18px; cursor: pointer"></Icon>
      </span>
      <span v-if="!assignListShow" @click="changeShow">
        <Icon type="ios-arrow-down" style="font-size: 18px; cursor: pointer"></Icon>
      </span>
    </div>
    <!--分配表格-->
    <div style="margin-bottom: 20px" v-if="assignListShow">
      <Table highlight-row border :columns="columns2" :data="data2"></Table>
    </div>
    <!-- 装箱信息 -->
    <div style="font-size: 16px; padding: 15px 0" v-if="boxDetailData.length">
      <span>装箱信息</span>
      <span v-if="assignListShowBox" @click="changeShowBox">
        <Icon type="ios-arrow-up" style="font-size: 18px; cursor: pointer"></Icon>
      </span>
      <span v-if="!assignListShowBox" @click="changeShowBox">
        <Icon type="ios-arrow-down" style="font-size: 18px; cursor: pointer"></Icon>
      </span>
    </div>
    <div style="margin-bottom: 60px" v-if="assignListShowBox && boxDetailData.length">
      <Table highlight-row :columns="boxColumns" :data="boxDetailData"></Table>
    </div>
    <!-- 操作日志 -->
    <optionDaily :operationLog="optionNoteData" @showNoteFunc="showNoteFunc" from="outStock"
      :params="{ pickingId, relatedBusinessNo: mainInfo.num }" @addSuccessBack="addSuccessBack" :falgType="falgType">
    </optionDaily>
    <!--模态框-->
    <div v-if="showLocationModal">
      <Modal v-model="showLocationModal" title="库位选择" :styles="{ top: '80px', width: '1100px' }" class="headerBar">
        <div class="content">
          <wareLocateSlt @sendData="getData" :wareId="wareId" :sku="objSku" :open="showLocationModal"
            :productId="productId" :pickingType="mainInfo.type"></wareLocateSlt>
        </div>
        <div slot="footer"></div>
      </Modal>
    </div>
    <Modal v-model="encasementModel" v-if="encasementStatus" :width="600" @on-ok="setEncasement">
      <div class="ivu-modal-confirm">
        <div class="ivu-modal-confirm-head">
          <div class="ivu-modal-confirm-head-title">装箱</div>
        </div>
      </div>
      <div class="normalPadding">
        <div class="d-flex justify-content-start align-items-center">
          <span>请选择装箱方式：</span>
          <RadioGroup v-model="encasementMethodsModel">
            <Radio label="1">Web表单填写装箱</Radio>
            <Radio label="2">Excel导入装箱</Radio>
          </RadioGroup>
        </div>
        <template v-if="encasementMethodsModel === '2'">
          <div class="normalTop d-flex justify-content-start align-items-center">
            <dytUpload v-if="uploadPath && uploadHeader.hasOwnProperty('Authorization')" :data="uploadData"
              :action="uploadPath" :show-upload-list="false" :before-upload="handleBeforeUpload" :headers="uploadHeader"
              :on-success="uploadSuccess" :on-error="uploadError" :multiple="true" :format="['xlsx', 'XLSX']"
              name="excleFile">
              <Button type="primary" class="normalRMargin">上传文件</Button>
            </dytUpload>
            <div class="normalLmargin">
              <span @click="downloadFile" style="color: #1890ff; cursor: pointer">下载模板</span>
            </div>
          </div>
        </template>
      </div>
    </Modal>
    <Modal v-model="encasementWebModel" v-if="encasementWebStatus" :width="encasementWebWidth" title="装箱">
      <div class="normalPadding">
        <div class="d-flex justify-content-start align-items-center">
          出库单号：{{ mainInfo.num }}
        </div>
        <div class="d-flex justify-content-start align-items-center normalTop">
          出库单中有多少箱子？
          <InputNumber :min="1" :max="15" class="normalLMargin" size="small" v-model.trim="showBoxNum"
            style="width: 60px" />
          <Button type="primary" @click="confirmBoxNum" class="normalLMargin" size="small">确定</Button>
          <div class="normalLMargin" v-if="boxTypeStatus">
            <Select v-model="boxType">
              <Option value="1">FBA箱号</Option>
              <Option value="2">标准箱号</Option>
            </Select>
          </div>
        </div>
        <div class="orderTable normalTop">
          <Table highlight-row border height="400" :columns="boxColumn" :data="boxDataList"></Table>
        </div>
        <div class="orderTable normalTop" v-if="boxNumData.length > 0">
          <Table highlight-row border :columns="boxNumDataColumn" :data="boxNumData"></Table>
        </div>
      </div>
      <div slot="footer">
        <Button type="primary" :loading="boxLoading" @click="setWebEncasement">确定</Button>
        <Button @click="encasementWebModel = false">取消</Button>
      </div>
    </Modal>
    <div v-if="addProductModal">
      <Modal v-model="addProductModal" :styles="{ top: '80px', width: '1200px' }" class="headerBar addProductBar"
        :title="addProductTitle">
        <div class="content">
          <addProduct from="inware" :disabledSlt="false" @addProductSuccess="addProductSuccess"
            @addProductCancel="addProductCancel" :wareId="wareId" :eliminateData="productData"
            :queryTagInfo="['O12'].includes(mainInfo.type)">
          </addProduct>
        </div>
      </Modal>
    </div>
    <!--冻结分配弹窗-->
    <freezeAssignmentModal ref="frozenModal" :frozenModalTalg="frozenModalTalg" @updateData="updateData"
      :deliveryOrder="pickingNo"></freezeAssignmentModal>
    <!-- 第三方标签出库 @searchData="searchData" -->
    <!-- <outByThirdLabel ref="outByThirdLabel" :modelVisible.sync="thrdLableInfo.visible" @confirmLabel="confirmLabel"
      :list="thrdLableInfo.labelList" /> -->
  </div>
</template>
<script>
import wareLocateSlt from "./wareLocateSlt";
import dropDown from "@/views/wms/components/common/dropDownOpt";
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import optionDaily from "@/views/wms/components/common/commonDaily";
import addProduct from "@/views/wms/components/wms-inStock/newAddProduct";
import freezeAssignmentModal from "./freezeAssignmentModal";
// import outByThirdLabel from './sellStockOutDtl/outByThirdLabel';
import { outListTypeList } from "./otherStockOut/fileData";
export default {
  components: {
    wareLocateSlt,
    optionDaily,
    addProduct,
    freezeAssignmentModal,
    // outByThirdLabel,
  },
  props: {
    pickingNo: {
      default: null,
    },
    workType: {
      default: null,
    },
    warehouseOverseaType: {
      default: "",
    },
    waitLoading: {
      default: false,
    },
    ymsMerchant: {
      default: false,
    },
    workShow: {
      default: "list",
    },
    wareExpenses: {
      // 是否显示仓库费用
      type: Boolean,
      default: false,
    },
    pickingRow: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  mixins: [Mixin],
  created() {
    /** 销售出库要隐藏体积和重量 **/
    if (this.workType === "sellStock") this.columns1.splice(-3, 2);
    if (this.workShow === "detail") {
      this.searchData();
      this.getCurrencyInfo();
    }
    // 清空store的otherStockInfo，这个数据在库存调拨存，这里需要清掉
    this.$store.commit("otherStockInfo", null);
  },
  data() {
    var v = this;
    return {
      queryPickingBatchResult: [],
      boxNumDataColumn: [
        {
          title: "箱子",
          render(h, params) {
            return h("span", "箱子" + (params.index + 1));
          },
        },
        {
          title: "重量(kg)",
          render(h, params) {
            return h("Input", {
              props: {
                size: "small",
                placeholder: "请输入重量",
                value: params.row.weight,
              },
              on: {
                input: (val) => {
                  v.boxNumData[params.index].weight = val;
                },
              },
            });
          },
        },
        {
          title: "长宽高(cm)",
          minWidth: 320,
          render(h, params) {
            return h("div", {}, [
              h("Input", {
                style: {
                  width: "80px",
                  marginRight: "10px",
                },
                props: {
                  size: "small",
                  placeholder: "长",
                  value: params.row.length,
                },
                on: {
                  input: (val) => {
                    v.boxNumData[params.index].length = val;
                  },
                },
              }),
              h("Input", {
                style: {
                  width: "80px",
                  marginRight: "10px",
                },
                props: {
                  size: "small",
                  placeholder: "宽",
                  value: params.row.width,
                },
                on: {
                  input: (val) => {
                    v.boxNumData[params.index].width = val;
                  },
                },
              }),
              h("Input", {
                style: {
                  width: "80px",
                  marginRight: "10px",
                },
                props: {
                  size: "small",
                  placeholder: "高",
                  value: params.row.height,
                },
                on: {
                  input: (val) => {
                    v.boxNumData[params.index].height = val;
                  },
                },
              }),
              h(
                "span",
                {
                  style: {
                    color: "#4798af",
                    display: (() => {
                      return params.index === 0 && v.boxNumData.length > 1
                        ? "line-block"
                        : "none";
                    })(),
                  },
                  on: {
                    click() {
                      v.boxNumData.forEach((i, j) => {
                        if (j !== 0) {
                          i.length = v.boxNumData[0].length;
                          i.width = v.boxNumData[0].width;
                          i.height = v.boxNumData[0].height;
                        }
                      });
                    },
                  },
                },
                "应用到所有"
              ),
            ]);
          },
        },
      ],
      boxNumData: [],
      frozenModalTalg: "details",
      addProductTitle: "添加产品",
      addProductModal: false,
      apiSendTypeList: [],
      downloadName: "0",
      uploadData: {
        pickingId: null,
      },
      uploadPath: api.set_uploadPickingExcel,
      boxLoading: false,
      boxDataList: [], //  装箱 参数 start
      boxColumn: [],
      boxCacheColumn: [
        {
          title: "箱内物品",
          minWidth: 100,
          key: "title",
          combine: true,
          render: (h, params) => {
            if (params.index !== v.boxDataList.length - 1) {
              const obj = {
                childrens: [
                  [
                    "div",
                    {
                      class: "d-flex justify-content-center normalTop",
                    },
                    params.row.goodsSku,
                  ],
                  [
                    "div",
                    {
                      class: "d-flex justify-content-center normalTop",
                    },
                    params.row.goodsCnDesc,
                  ],
                ],
                props: {},
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
              let value = "总数量" + "：" + pos;
              const obj = {
                childrens: [
                  [
                    "div",
                    {
                      class: "d-flex justify-content-end",
                    },
                    value,
                  ],
                ],
                props: {},
              };
              obj.props.colSpan = 2;
              return obj;
            }
          },
        },
        {
          title: "货件数量",
          minWidth: 120,
          key: "expectedNumber",
          render: (h, params) => {
            if (params.index !== v.boxDataList.length - 1) {
              return h("span", params.row.expectedNumber);
            } else if (params.index === v.boxDataList.length - 1) {
              return h("span", "123");
            }
          },
        },
        {
          title: "已装箱数量",
          minWidth: 120,
          fixed: "right",
          render: (h, params) => {
            if (
              v.getBoxedNum(params.index, params.row) > params.row.notAssignedNumber ||
              v.getBoxedNum(params.index, params.row) < params.row.notAssignedNumber
            ) {
              return h(
                "span",
                {
                  style: {
                    color: "#F00",
                    fontWight: "bold",
                  },
                },
                v.getBoxedNum(params.index, params.row) + "(装箱数量必须等于货件数量)"
              );
            } else {
              return h("span", v.getBoxedNum(params.index, params.row));
            }
          },
        },
      ],
      boxData: [],
      boxTypeStatus: false,
      boxType: "1",
      boxNum: 1,
      showBoxNum: 1,
      encasementWebModel: false,
      encasementWebStatus: false,
      encasementMethodsModel: null,
      encasementStatus: false,
      encasementModel: true, // 装箱参数 End
      falgType: "otherStockOut",
      currentIconStatus: {},
      addOrEdit: "",
      productId: "",
      batchTotal: 0,
      pageParams: {},
      objSku: "",
      apiLogisterList: [], // 物流商下拉
      cacheOptionNoteData: [], // 缓存留言信息以便过滤
      pickingId: "", // 新增留言需要带的参数
      sltTableItem: [], // 表格选择的数据
      wareId: "",
      clickIndex: 0,
      outListStatusList: [
        {
          label: "订单创建",
          value: "0",
        },
        {
          label: "分配完成",
          value: "2",
        },
        {
          label: "部分分配",
          value: "1",
        },
        {
          label: "完成发货",
          value: "4",
        },
        {
          label: "订单完成",
          value: "5",
        },
      ],
      outListTypeList: outListTypeList,
      // outListTypeList: [
      //   {
      //     label: "销售出库",
      //     value: "S1",
      //   },
      //   {
      //     label: "其他出库",
      //     value: "O3",
      //   },
      //   {
      //     label: "调拨出库",
      //     value: "O1",
      //   },
      //   {
      //     label: "组装加工",
      //     value: "O2",
      //   },
      //   {
      //     label: "退货",
      //     value: "O4",
      //   },
      // ],
      mainInfo: {
        num: "", // 出库单编号
        type: "", // 出库单类型
        status: "", // 出库单状态
        ware: "", // 发货仓库(中文)
        referenceNum: "", // 参考编号
        shipmentID: "",
        createTime: "", // 创建时间
        creator: "", // 创建人
        payTime: "", // 订单付款时间
        lastModifyTime: "", // 最后修改时间
        lastModifyPerson: "", // 最后修改人
        orderNos: "",
        boxStatus: "",
        packageOrderBoList: [],
        pickingGoodsStatus: "", // 拣货状态
        userWeight: "", // LAPA估算重量
        totalWeight: "", //  LAPA称重重量
        estimateFreight: "", // 估算运费
        pickingGoodsNo: "", // 拣货单编号
        postage: "", // 称重后运费
      },
      receiver: {
        receiverName: "", // 收货人名称
        country: "", // 国家
        linkman: "", // 联系人
        region: "", // 省/洲
        tel: "", // 联系电话
        MobilePhone: "", // 手机
        city: "", // 城市
        address: "", // 详细地址
        consigneeAddressOther: "",
        email: "", // 邮箱
        buyerPassportCode: "", // 识别号
        postalcode: "", // 邮政编码
      },
      logister: {
        logisticDealer: "", // 物流商
        logisticNum: "", // 物流商单号
        sendType: "", // 邮寄方式
        trackingNum: "", // 跟踪号
        virtualTrackingNumber: "", // 运单号2
        linkman: "", // 联系人
        tel: "", // 联系电话
        email: "", // 邮箱
        carrierWeight: "", // 物流商称重
        postage: "", // 物流商运费
        packageCarrierParamList: [], // 动态参数
      },
      columns1: [
        {
          type: "selection",
          width: 56,
          align: "center",
        },
        {
          title: "行号",
          width: 66,
          align: "center",
          render: (h, params) => {
            return h("span", params.index + 1);
          },
        },
        {
          title: "行状态",
          align: "center",
          width: 100,
          key: "perRowStatus",
        },
        {
          title: "分配异常原因",
          align: "center",
          minWidth: 120,
          resizable: true,
          key: "outOfStockStatus",
          render(h, params) {
            if (params.row.outOfStockStatus) {
              let obj = v.failTypeList.filter((j) => {
                if (j.value === params.row.outOfStockStatus) {
                  return j;
                }
              })[0];
              return h(
                "Tag",
                {
                  props: {
                    color: obj.color,
                  },
                },
                obj.label
              );
            }
          },
        },
        {
          title: "产品图片",
          key: "b",
          width: 86,
          align: "center",
          render: (h, params) => {
            return v.tableImg(h, params, "goodsUrl");
          },
        },
        {
          // title: ['O12'].includes(v.mainInfo.type) ? "产品sku" : "产品sku/条码编码",
          title: "产品sku",
          align: "center",
          width: 120,
          // key: "goodsSku",
          render: (h, params) => {
            return h("div", [
              h("div", params.row.goodsSku),
              h("div", params.row.barCode),
            ]);
          },
          // renderHeader: (h, column, index) => {
          //   const title = ['O12'].includes(v.mainInfo.type) ? "产品sku/条码编码" : "产品sku";
          //   return h('div', title);
          // }
        },
        {
          title: "SKU属性",
          width: 120,
          key: "goodsAttributes",
        },
        {
          title: "中文描述",
          align: "center",
          width: 150,
          key: "goodsCnDesc",
        },
        {
          title: "英文描述",
          align: "center",
          width: 120,
          key: "goodsEnDesc",
        },
        {
          title: "订单数量",
          align: "center",
          width: 120,
          renderHeader(h, params) {
            let isCheck = false;
            if (v.warehouseOverseaType === "AMAZON_FBA" && v.otherIsEdit) {
              return h("div", [
                h("p", "订单数量"),
                h("p", {}, [
                  h(
                    "Checkbox",
                    {
                      props: {
                        value: isCheck,
                      },
                      on: {
                        "on-change"(val) {
                          isCheck = val;
                          if (val) {
                            v.deliveryListData.forEach((i) => {
                              i.expectedNumberInit = i.expectedNumber;
                              i.expectedNumber = i.plannedAllotInventoryNumber;
                            });
                          } else {
                            v.deliveryListData.forEach((i) => {
                              i.expectedNumber = i.expectedNumberInit;
                            });
                          }
                        },
                      },
                    },
                    "填入计划调拨数量"
                  ),
                ]),
              ]);
            } else {
              return h("p", "订单数量");
            }
          },
          render(h, params) {
            if (v.otherIsEdit) {
              return h("Input", {
                props: {
                  value: params.row.expectedNumber,
                },
                style: {
                  width: "80px",
                  margin: "0 auto",
                },
                on: {
                  "on-change"(val) {
                    params.row.expectedNumber = val.target.value;
                    v.deliveryListData[params.index] = params.row;
                  },
                },
              });
            } else {
              return h("span", params.row.expectedNumber);
            }
          },
        },
        {
          title: "已发货数量",
          align: "center",
          width: 100,
          key: "doneDeliveredNumber",
        },
        {
          title: "分配库位",
          width: 120,
          align: "center",
          key: "warehouseLocationName",
          render: (h, params) => {
            let productGoodsId = v.deliveryListData[params.index].productGoodsId;
            let warehouseLocationName = "";
            if (v.queryPickingBatchResult.length > 0) {
              v.queryPickingBatchResult.map((item) => {
                if (item.productGoodsId === productGoodsId) {
                  warehouseLocationName = item.warehouseLocationName;
                }
              });
            } else {
              warehouseLocationName =
                v.deliveryListData[params.index].warehouseLocationName;
            }
            return h("div", [
              h("Input", {
                props: {
                  size: "small",
                  placeholder: "",
                  value: warehouseLocationName,
                  disabled:
                    !!(
                      v.deliveryListData[params.index].pickingDetailStatus !== "0" &&
                      v.deliveryListData[params.index].pickingDetailStatus !== "1"
                    ) || v.ymsMerchant,
                },
                style: {
                  marginRight: "5px",
                },
                on: {
                  "on-focus": () => {
                    v.clickIndex = params.index;
                    v.objSku = params.row.goodsSku;
                    v.productId = params.row.productGoodsId;
                    v.showLocationModal = true;
                  },
                },
              }),
            ]);
          },
        },
        {
          title: "已分配数量",
          align: "center",
          width: 100,
          key: "doneAssignedNumber",
        },
        {
          title: "未分配数量",
          align: "center",
          width: 100,
          key: "notAssignedNumber",
        },
        {
          title: "已拣货数量",
          align: "center",
          width: 100,
          key: "actualPickingNumber",
        },
        {
          title: "身份码",
          align: "center",
          width: 100,
          key: "mobileImies",
          render: (h, params) => {
            let list = [];
            let data = params.row.mobileImies;
            if (data) {
              data.map((item) => {
                list.push(item.mobileImieCode);
              });
            }
            return h("div", list.join());
          },
        },
        {
          title: "体积",
          align: "center",
          width: 80,
          key: "goodsVolume",
        },
        {
          title: "重量",
          align: "center",
          width: 80,
          key: "goodsWeight",
        },
        {
          title: "操作",
          align: "center",
          key: "m",
          fixed: "right",
          width: 130,
          render: (h, params) => {
            return !v.ymsMerchant
              ? h(
                dropDown,
                {
                  props: {
                    dropList: [
                      {
                        code: "分配库存",
                        value: "1",
                        flagCode: ["0", "1"],
                        status: this.getPermission(
                          "wmsPicking_modifyDistributionSingle"
                        )
                          ? params.row.pickingDetailStatus
                          : -1,
                      },
                      {
                        code: "取消分配",
                        value: "2",
                        flagCode: ["1", "2"],
                        status: this.getPermission(
                          "wmsPicking_modifySalesDistributionCancelSingle"
                        )
                          ? params.row.pickingDetailStatus
                          : -1,
                      },
                    ],
                    styleData: { width: "120px" },
                    txt: "操作",
                    type: "small",
                    listenNormal: false,
                  },
                  style: {
                    display:
                      params.row.pickingDetailStatus === "0" ||
                        params.row.pickingDetailStatus === "1" ||
                        params.row.pickingDetailStatus === "2"
                        ? "block"
                        : "none",
                  },
                  on: {
                    nameValBack: (val) => {
                      var obj = {
                        doneAssignedNumber: params.row.doneAssignedNumber, // 已分配数量
                        expectedNumber: params.row.expectedNumber, // 预期出库数量
                        productGoodsId: params.row.productGoodsId, // 产品sku
                        receiptBatchNo: params.row.receiptBatchNo,
                        inventoryId: params.row.inventoryId, // 库存id
                        pickingDetailId: params.row.pickingDetailId, // 出库单货品详情id
                        pickingNo: this.mainInfo.num, // 出库单编号
                        //                                            thisAssignedNumber: null, //本次分配数量
                        warehouseId: this.wareId, // 仓库id
                        warehouseLocationId: this.deliveryListData[params.index]
                          .warehouseLocationId, // 库位id
                        availableNumber: params.row.availableNumber,
                        goodsSku: params.row.goodsSku,
                      };
                      if (val === "1") {
                        // 分配库存
                        if (!params.row.warehouseLocationId) {
                          this.$Message.warning({
                            content: "库位为空或者输入的库位不存在，请选择库位",
                            duration: 3,
                          });
                          return;
                        }
                        v.saveDo().then(() => {
                          this.assignFn([obj], params.index);
                        });
                      } else {
                        // 取消分配
                        this.cancelAssignFn([obj], params.index);
                      }
                    },
                  },
                },
                []
              )
              : "";
          },
        },
      ],
      deliveryListData: [],
      showLocationModal: false, // 库位模态框
      columns2: [
        {
          title: "行号",
          width: 90,
          align: "center",
          render: (h, params) => {
            return h("span", params.index + 1);
          },
        },
        {
          title: "产品sku",
          align: "center",
          key: "goodsSku",
        },
        {
          title: "中文描述",
          align: "center",
          key: "goodsCnDesc",
          render: (h, params) => {
            return h(
              "Poptip",
              {
                props: {
                  content: params.row.goodsCnDesc,
                  trigger: "hover",
                },
              },
              [h("span", {}, params.row.goodsCnDesc)]
            );
          },
        },
        {
          title: "英文描述",
          align: "center",
          key: "goodsEnDesc",
          render: (h, params) => {
            return h(
              "Poptip",
              {
                props: {
                  content: params.row.goodsEnDesc,
                  trigger: "hover",
                },
              },
              [h("span", {}, params.row.goodsEnDesc)]
            );
          },
        },
        {
          title: "分配批次",
          align: "center",
          key: "receiptBatchNo",
        },
        {
          title: "分配库位",
          align: "center",
          key: "warehouseLocationName",
        },
        {
          title: "分配数量",
          align: "center",
          key: "batchNumber",
        },
        {
          title: "分配完成时间",
          align: "center",
          key: "createdTime",
        },
        {
          title: "操作人",
          align: "center",
          key: "createdBy",
        },
      ],
      data2: [],
      openEditStatus: false,
      declareOpt: {
        title: "操作",
        align: "center",
        key: "",
        render: (h, params) => {
          return h("div", {}, [
            h(
              "span",
              {
                on: {
                  click: () => {
                    v.dataDeclare.splice(params.index + 1, 0, {
                      goodsNameCn: "",
                      goodsNameEn: "",
                      unitPrice: "",
                      unitWeight: "",
                      quantity: "",
                      hsCode: "",
                      declareCurrency: "",
                    });
                    v.openEditStatus = true;
                  },
                },
                style: {
                  display:
                    params.index === v.dataDeclare.length - 1 && v.openEditStatus
                      ? "inline-block"
                      : "none",
                },
              },
              [
                h("Icon", {
                  props: {
                    type: "ios-add-circle",
                  },
                  style: {
                    marginRight: "10px",
                    fontSize: "20px",
                    cursor: "pointer",
                  },
                }),
              ]
            ),
            h(
              "span",
              {
                on: {
                  click: () => {
                    v.dataDeclare.splice(params.index, 1);
                  },
                },
                style: {
                  display: v.openEditStatus ? "inline-block" : "none",
                },
              },
              [
                h("Icon", {
                  props: {
                    type: "ios-remove-circle",
                  },
                  style: {
                    fontSize: "20px",
                    cursor: "pointer",
                  },
                }),
              ]
            ),
          ]);
        },
      },
      columnsDeclare: [
        {
          title: "中文申报名",
          align: "center",
          key: "",
          render: (h, params) => {
            return h("div", {}, [
              h("Input", {
                props: {
                  value: params.row.goodsNameCn,
                },
                style: {
                  width: "90px",
                  display: v.openEditStatus ? "block" : "none",
                  margin: "0 auto",
                },
                on: {
                  "on-change"(val) {
                    params.row.goodsNameCn = val.target.value;
                    v.dataDeclare[params.index] = params.row;
                  },
                },
              }),
              h(
                "span",
                {
                  style: {
                    display: !v.openEditStatus ? "block" : "none",
                  },
                },
                params.row.goodsNameCn
              ),
            ]);
          },
        },
        {
          title: "英文申报名",
          align: "center",
          key: "",
          render: (h, params) => {
            return h("div", {}, [
              h("Input", {
                props: {
                  value: params.row.goodsNameEn,
                },
                style: {
                  width: "90px",
                  display: v.openEditStatus ? "block" : "none",
                  margin: "0 auto",
                },
                on: {
                  "on-change"(val) {
                    params.row.goodsNameEn = val.target.value;
                    v.dataDeclare[params.index] = params.row;
                  },
                },
              }),
              h(
                "span",
                {
                  style: {
                    display: !v.openEditStatus ? "block" : "none",
                  },
                },
                params.row.goodsNameEn
              ),
            ]);
          },
        },
        {
          title: "申报价值",
          align: "center",
          key: "",
          render: (h, params) => {
            return h("div", {}, [
              h("InputNumber", {
                props: {
                  value: params.row.unitPrice,
                },
                style: {
                  width: "90px",
                  display: v.openEditStatus ? "block" : "none",
                  margin: "0 auto",
                },
                on: {
                  "on-change"(val) {
                    params.row.unitPrice = val;
                    v.dataDeclare[params.index] = params.row;
                  },
                },
              }),
              h(
                "span",
                {
                  style: {
                    display: !v.openEditStatus ? "block" : "none",
                  },
                },
                params.row.unitPrice
              ),
            ]);
          },
        },
        {
          title: "币种",
          align: "center",
          key: "",
          render: (h, params) => {
            return (
              "div",
              {},
              [
                h(
                  "Select",
                  {
                    props: {
                      size: "small",
                      value: params.row.declareCurrency,
                      transfer: true,
                    },
                    style: {
                      display: v.openEditStatus ? "block" : "none",
                    },
                    on: {
                      "on-change"(val) {
                        params.row.declareCurrency = val;
                        v.dataDeclare[params.index] = params.row;
                      },
                    },
                  },
                  v.currencyList.map((i, index) => {
                    return h(
                      "Option",
                      {
                        props: {
                          key: index,
                          value: i.value,
                        },
                      },
                      i.label
                    );
                  })
                ),
                h(
                  "span",
                  {
                    style: {
                      display: !v.openEditStatus ? "block" : "none",
                    },
                  },
                  params.row.declareCurrency
                ),
              ]
            );
          },
        },
        {
          title: "申报重量",
          align: "center",
          key: "",
          render: (h, params) => {
            return h("div", {}, [
              h("InputNumber", {
                props: {
                  value: params.row.unitWeight,
                },
                style: {
                  width: "90px",
                  margin: "0 auto",
                  display: v.openEditStatus ? "block" : "none",
                },
                on: {
                  "on-change"(val) {
                    params.row.unitWeight = val;
                    v.dataDeclare[params.index] = params.row;
                  },
                },
              }),
              h(
                "span",
                {
                  style: {
                    display: !v.openEditStatus ? "block" : "none",
                  },
                },
                params.row.unitWeight
              ),
            ]);
          },
        },
        {
          title: "申报数量",
          align: "center",
          key: "",
          render: (h, params) => {
            return h("div", {}, [
              h("InputNumber", {
                props: {
                  value: params.row.quantity,
                },
                style: {
                  width: "90px",
                  margin: "0 auto",
                  display: v.openEditStatus ? "block" : "none",
                },
                on: {
                  "on-change"(val) {
                    params.row.quantity = val;
                    v.dataDeclare[params.index] = params.row;
                    // console.log(v.dataDeclare);
                  },
                },
              }),
              h(
                "span",
                {
                  style: {
                    display: !v.openEditStatus ? "block" : "none",
                  },
                },
                params.row.quantity
              ),
            ]);
          },
        },
        {
          title: "海关编码",
          align: "center",
          key: "",
          render: (h, params) => {
            return h("div", {}, [
              h("Input", {
                props: {
                  value: params.row.hsCode,
                },
                style: {
                  width: "90px",
                  display: v.openEditStatus ? "block" : "none",
                  margin: "0 auto",
                },
                on: {
                  "on-change"(val) {
                    params.row.hsCode = val.target.value;
                    v.dataDeclare[params.index] = params.row;
                  },
                },
              }),
              h(
                "span",
                {
                  style: {
                    display: !v.openEditStatus ? "block" : "none",
                  },
                },
                params.row.hsCode
              ),
            ]);
          },
        },
        {
          title: "销售链接",
          align: "center",
          key: "productUrl ",
          render: (h, params) => {
            return h("div", {}, [
              h("Input", {
                props: {
                  value: params.row.productUrl,
                },
                style: {
                  width: "90px",
                  display: v.openEditStatus ? "block" : "none",
                  margin: "0 auto",
                },
                on: {
                  "on-change"(val) {
                    params.row.productUrl = val.target.value;
                    v.dataDeclare[params.index] = params.row;
                  },
                },
              }),
              h(
                "span",
                {
                  style: {
                    display: !v.openEditStatus ? "block" : "none",
                  },
                },
                params.row.productUrl
              ),
            ]);
          },
        },
      ], // 申报信息表头
      //                dataDeclare:[{goodsNameEn:123,goodsNameCn:54545,quantity:6768,unitWeight:2222222,unitPrice:32242}], // 申报信息数据
      dataDeclare: [], // 申报信息数据
      assignListShow: true,
      assignListShowBox: true,
      showNotes: true,
      addNotesInput: "",
      optionNoteData: [],
      detailApiObj: "",
      ruleMainInfo: {},
      label: (h) => {
        return h("div", [
          h("span", "申报信息"),
          h("Icon", {
            props: { type: "md-close" },
            style: {
              color: "#f00",
              marginLeft: "5px",
              display: v.dataDeclare.length === 0 ? "inline-block" : "none",
            },
          }),
          h("Icon", {
            props: { type: "md-checkmark" },
            style: {
              color: "#18b566",
              marginLeft: "5px",
              display: v.dataDeclare.length !== 0 ? "inline-block" : "none",
            },
          }),
        ]);
      }, // 装箱信息
      userInfoMap: [], // 操作人
      boxDetailData: [],
      boxColumns: [
        {
          title: "行号",
          width: 90,
          align: "center",
          render: (h, params) => {
            return h("span", params.index + 1);
          },
        },
        {
          title: "箱号",
          minWidth: 120,
          align: "center",
          key: "boxCode",
        },
        {
          title: "SKU",
          minWidth: 90,
          align: "center",
          key: "goodsSku",
        },
        {
          title: "中文描述",
          minWidth: 100,
          align: "center",
          key: "goodsCnDesc",
        },
        {
          title: "英文描述",
          minWidth: 100,
          align: "center",
          key: "goodsEnDesc",
        },
        {
          title: "装箱数量",
          minWidth: 80,
          align: "center",
          key: "quantity",
        },
        {
          title: "操作时间",
          minWidth: 80,
          align: "center",
          key: "updatedTime",
          render: (h, params) => {
            return h("div", this.$uDate.dealTime(params.row.updatedTime));
          },
        },
        {
          title: "操作人",
          minWidth: 80,
          align: "center",
          key: "updatedBy",
          render: (h, params) => {
            return h("div", this.userInfoMap[params.row.updatedBy].userName);
          },
        },
      ],
      carrierId: "",
      boxShowStatus: true, // 控制装箱按钮的显示
      deProductList: [], // 用来比较产品列表是否更改
      wareInfo: {}, // 仓库费用

      // thrdLableInfo: {
      //   allLabelList: [],
      //   labelList: [],
      //   copyLabelList: [],
      //   visible: false,
      //   loading: false,
      //   deliveryCopyList: [],
      // },
    };
  },
  computed: {
    uploadHeader() {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders,
      };
    },
    productData() {
      return this.deliveryListData;
    },
    otherIsEdit() {
      // 其他出库 未出库状态
      return (
        this.workType === "otherStock" &&
        this.mainInfo.status === "0" &&
        this.getPermission("wmsPicking_updatePicking")
      );
    },
    outListTypeListLabel() {
      let obj = null;
      if (this.outListTypeList) {
        obj = this.outListTypeList.find((val) => val.value === this.mainInfo.type);
      }
      return obj && obj.label ? obj.label : "";
    },
    encasementWebWidth() {
      let v = this;
      if (v.domWidth > 1500) {
        return 1400;
      } else if (v.domWidth > 1400) {
        return 1200;
      } else {
        return 800;
      }
    },
    // thrdLabelDisable() {
    //   // 比较sku，变动要求业务保存再进行匹配第三方标签
    //   let copyList = (this.thrdLableInfo.deliveryCopyList || []).map(k => k.productGoodsId);
    //   let list = (this.deliveryListData || []).map(k => k.productGoodsId);
    //   return !(JSON.stringify(copyList) === JSON.stringify(list));
    // }
    // valueAddedServiceList() {
    //   let temp = {
    //     vacuumizeProduct: [],
    //     inventoryOverTime: [],
    //   };
    //   this.deliveryListData.forEach(k => {
    //     let vacuumizeNumber = k.vacuumizeNumber || 0;
    //     let replacePackingNumber = k.replacePackingNumber || 0;
    //     if (vacuumizeNumber > 0) {
    //       temp.vacuumizeProduct.push({
    //         sku: k.goodsSku,
    //         num: vacuumizeNumber,
    //       });
    //     }
    //     if (replacePackingNumber > 0) {
    //       temp.inventoryOverTime.push({
    //         sku: k.goodsSku,
    //         num: replacePackingNumber,
    //       });
    //     }
    //   })
    //   return temp;
    // },
    // showValAddService() {
    //   return this.$route.path === '/searchPackage';
    // },
  },
  watch: {
    boxNum(n, o) {
      if (n !== o && n <= 15) {
        this.makeBoxDeliveryListData();
      }
    },
    workShow: {
      handler(value) {
        if (value === "detail") {
          this.searchData();
          this.getCurrencyInfo();
        }
      },
      deep: true,
    },
  },
  methods: {
    tabClick(name) {
      if (name === "logistic") {
        this.axios.get(api.get_logisterList + `?carrierId=${null}`).then((res) => {
          if (res.data.code === 0) {
            this.apiLogisterList = res.data.datas;
            if (this.mainInfo.logisticsDealerCode) {
              let obj = this.apiLogisterList.filter((i) => {
                return i.code === this.mainInfo.logisticsDealerCode;
              });
              this.logisticDealerChange({
                value: obj[0].code,
                code: obj[0].code,
              });
            }
          }
        });
      } else if (name === "receiver") {
        this.getCountrys();
      }
    },
    logisticDealerChange(item) {
      this.carrierId = this.apiLogisterList.find((val) => {
        return val.code === item.value;
      }).code;
      this.axios.get(api.get_sendType + `?carrierId=${this.carrierId}`).then((res) => {
        if (res.data.code === 0) {
          this.apiSendTypeList = res.data.datas;
        }
      });
    }, // 添加货品模态框
    showAddProductModal() {
      this.addProductModal = true;
    },
    deleteProductBtn(selectTransferTableList, allSelectTransferList) {
      // 批量删除
      let v = this;
      if (v.sltTableItem.length === 0) {
        v.$Message.warning("未选择数据");
        return;
      }
      let length = v.deliveryListData.length;
      let valid = false;
      while (length--) {
        if (
          v.sltTableItem
            .map((i) => i.goodsSku)
            .includes(v.deliveryListData[length].goodsSku)
        ) {
          if (v.deliveryListData[length].pickingDetailStatus === "0") {
            v.deliveryListData.splice(length, 1);
          } else {
            valid = true;
          }
        }
      }
      if (valid) {
        v.$Message.success("操作成功，部分分配和全部分配的不能移出");
      } else {
        v.$Message.success("成功删除选中的货品！");
      }
    },
    addProductSuccess(data) {
      let productList = this.$common.copy(data || []);
      // 存在第三方标签，判断添加商品内是否存在对应的标签，存在才能添加进来
      let { overseaTagId } = this.mainInfo;
      let [exsitList, failList] = [[], []];
      if ([null, "null", undefined, "undefined", ""].includes(overseaTagId)) {
        exsitList = productList;
      } else {
        productList.forEach((k) => {
          let list = k.overseaTagIdList || [];
          if (list.includes(overseaTagId)) {
            exsitList.push(k);
          } else {
            failList.push(k.goodsSku);
          }
        });
      }
      let goodsSku = this.deliveryListData.map((i) => i.productGoodsId);
      exsitList.forEach((j) => {
        if (!goodsSku.includes(j.productGoodsId)) {
          j.pickingDetailStatus = "0";
          j.goodsVolume = j.goodsLength * j.goodsWidth * j.goodsHeight;
          j.perRowStatus = "订单创建";
          j.expectedNumber = 1;
          j.doneDeliveredNumber = 0;
          j.doneAssignedNumber = 0;
          j.notAssignedNumber = 1;
          this.deliveryListData.push(j);
        }
      });
      this.addProductModal = false;

      if (failList.length) {
        return this.$Modal.warning({
          title: "操作提示",
          width: 600,
          content: `添加商品失败，没有匹配的第三方标签：<span style="color:#f90;">${failList.join(
            "，"
          )}</span>`,
        });
      }
    },
    addProductCancel() {
      this.addProductModal = false;
    },
    saveObsoletepick(type) {
      let v = this;
      if (v.deliveryListData.length === 0) {
        v.$Message.error("商品为空");
        return;
      }
      return new Promise((resolve) => {
        let params = {
          pickingId: v.mainInfo.pickingId,
          updatePickingDetailParamList: v.deliveryListData.map((i) => {
            return {
              expectedNumber: i.expectedNumber,
              pickingDetailId: i.pickingDetailId,
              productGoodsId: i.productGoodsId,
            };
          }),
          updatePickingExtendParam: {
            consigneeAddress: v.receiver.address,
            consigneeAddressOther: v.receiver.consigneeAddressOther,
            consigneeCity: v.receiver.city,
            consigneeCountry: v.receiver.country, // "consigneeDistrict": "string",
            consigneeLinkMan: v.receiver.linkman,
            consigneeLinkTel: v.receiver.tel,
            consigneeLinkMobile: v.receiver.MobilePhone,
            consigneeMail: v.receiver.email,
            consigneeName: v.receiver.receiverName,
            consigneeProvince: v.receiver.region,
            consigneeZipCode: v.receiver.postalcode,
            logisticsDealerCode: v.mainInfo.logisticsDealerCode,
            logisticsDealerName: v.logister.logisticDealer,
            logisticsLinkMail: v.logister.email,
            logisticsLinkMan: v.logister.linkman,
            logisticsLinkTel: v.logister.tel,
            logisticsMailCode: v.mainInfo.logisticsMailCode,
            logisticsMailName: v.logister.sendType,
            logisticsNo: v.logister.logisticNum,
            logisticsTrackingNo: v.logister.trackingNum,
            virtualTrackingNumber: v.logister.virtualTrackingNumber,
            pickingExtendId: v.mainInfo.pickingExtendId,
          },
        };
        v.$Spin.show();
        v.axios
          .post(api.update_Picking, params)
          .then((response) => {
            v.$Spin.hide();
            if (response.data.code === 0) {
              v.$Message.success("保存成功");
              type == "refresh" && this.searchData("edit");
              resolve();
            }
          })
          .catch(() => {
            v.$Spin.hide();
          });
      });
    },
    delObsoletePicking() {
      let v = this;
      v.isDelModal(() => {
        v.$Spin.show();
        v.axios
          .put(api.del_obsoletePicking + v.pickingId)
          .then((response) => {
            v.$Spin.hide();
            if (response.data.code === 0) {
              if (response.data.datas && response.data.datas.errorCode === 999993) {
                v.$Message.error(response.data.datas.error);
              } else {
                v.$Message.success("删除成功");
                v.backList();
              }
            }
          })
          .catch(() => {
            v.$Spin.hide();
          });
      });
    },
    downloadFile() {
      let v = this;
      // if (v.downloadName === '0') return;
      // let name = encodeURIComponent(v.downloadName);
      // window.location.href = './download/' + name + '.xlsx';
      v.axios.get(api.get_boxTemplet).then((response) => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          window.location.href = v.$store.state.imgUrlPrefix + data;
        }
      });
    },
    handleBeforeUpload() {
      // let v = this;
    },
    uploadSuccess(response, file, fileList) {
      let v = this;
      if (response.code === 0) {
        v.downloadName = "0";
        v.searchData();
        v.boxShowStatus = false;
        v.encasementModel = false;
        v.$Message.success("创建导入成功");
      }
    },
    uploadError() {
      this.$Message.error("操作失败，请重新尝试");
    },
    insertColumn(num) {
      let v = this;
      let obj = {
        title: "箱子" + num,
        minWidth: 120,
        render: (h, params) => {
          if (params.index !== v.boxDataList.length - 1) {
            return h("InputNumber", {
              props: {
                size: "small",
                value: v.boxDataList[params.index]["box" + (params.column._index - 2)],
                disabled: !v.boxTypeStatus,
                min: 0,
                precision: 0,
              },
              on: {
                "on-change": (value) => {
                  if (!value) {
                    value = 0;
                  }
                  v.boxDataList[params.index]["box" + (params.column._index - 2)] = value;
                  v.$nextTick(function () {
                    v.getColumnTotalNum(params.column._index);
                  });
                },
              },
            });
          } else if (params.index === v.boxDataList.length - 1) {
            return h("span", params.row["total" + (params.column._index - 2)]);
          }
        },
      };
      return obj;
    },
    getBoxedNum(index, row) {
      let v = this;
      let num = 0;
      if (index < v.boxDataList.length - 1) {
        for (let t = 0; t < v.boxNum; t++) {
          num = num + row["box" + t];
        }
      } else {
        for (let t = 0; t < v.boxNum; t++) {
          num = num + row["total" + t];
        }
      }
      return num;
    },
    getColumnTotalNum(index) {
      let v = this;
      let num = 0;
      v.boxDataList.forEach((n, i) => {
        if (i < v.boxDataList.length - 1) {
          num = num + n["box" + (index - 2)];
        }
      });
      v.boxDataList[v.boxDataList.length - 1]["total" + (index - 2)] = num;
      v.$nextTick(function () {
        v.setLastLineTotalNum();
      });
    },
    setLastLineTotalNum() {
      let v = this;
      let num = 0;
      v.boxDataList.forEach((n, i) => {
        if (i === v.boxDataList.length - 1) {
          for (let t = 0; t < v.boxNum; t++) {
            num = num + n["total" + t];
          }
        }
      });
      v.boxDataList[v.boxDataList.length - 1]["total"] = num;
    },
    confirmBoxNum() {
      // 确认箱子数量
      let v = this;
      v.boxTypeStatus = true;
      v.boxNum = v.showBoxNum;
      v.boxNumData = Array.from({ length: v.boxNum }, (i) => {
        return {
          weight: "",
          length: "",
          width: "",
          height: "",
        };
      });
      v.boxNumDataCache = JSON.parse(JSON.stringify(v.boxNumData));
    },
    setEncasement() {
      // 装箱内容
      let v = this;
      if (v.encasementMethodsModel === "1") {
        v.resetEncasement();
        v.makeBoxDeliveryListData().then((result) => {
          if (result) {
            v.encasementMethodsModel = null;
            v.downloadName = "0";
            v.encasementWebStatus = true;
            v.$nextTick(function () {
              v.encasementWebModel = true;
            });
          }
        });
      }
    },
    resetEncasement() {
      let v = this;
      v.boxDataList = [];
      v.boxNum = 1;
      v.showBoxNum = 1;
      v.boxType = "1";
      v.boxTypeStatus = false;
      v.boxColumn = [];
    },
    makeBoxDeliveryListData() {
      // 整合数据
      let v = this;
      let arr = [];
      return new Promise((resolve) => {
        if (v.boxDataList.length === 0) {
          let deliveryListData = v.deliveryListData;
          deliveryListData.forEach((n, i) => {
            for (let t = 0; t < v.boxNum; t++) {
              n["box" + t] = 1;
            }
            arr.push(n);
          });
          let lastLine = {
            type: "last",
            total: deliveryListData.length * v.boxNum,
          };
          for (let t = 0; t < v.boxNum; t++) {
            lastLine["total" + t] = deliveryListData.length;
          }
          arr.push(lastLine);
        } else {
          let len = v.boxColumn.length - 3;
          v.boxDataList.forEach((n, i) => {
            for (let t = len; t < v.boxNum; t++) {
              n["box" + t] = 1;
              n["total" + t] = v.boxDataList.length - 1;
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
    setWebEncasement() {
      // 装箱1
      let v = this;
      let arr = [];
      if (v.boxLoading) return;
      v.boxLoading = true;
      //   console.log('mainInfo:', v.mainInfo);
      if (v.boxNumData.some((i) => !i.weight || !i.length || !i.width || !i.height)) {
        v.$Message.info("箱子重量和体积需填写完整");
        v.boxLoading = false;
        return;
      }
      for (let t = 0; t < v.boxNum; t++) {
        arr.push({
          boxCode:
            v.boxType === "1"
              ? "box" + t + "_" + v.mainInfo.num
              : v.mainInfo.shipmentID + "_" + t,
          pickingBoxDetails: [],
          pickingId: v.mainInfo.pickingId,
          weight: v.boxNumData[t].weight,
          length: v.boxNumData[t].length,
          width: v.boxNumData[t].width,
          height: v.boxNumData[t].height,
        });
      }
      //   console.log('boxDataList:', v.boxDataList);
      v.boxDataList.forEach((n, i) => {
        let num = n.expectedNumber;
        if (i < v.boxDataList.length - 1) {
          // console.log('n:', n);
          for (let t = 0; t < v.boxNum; t++) {
            num = num - n["box" + t];
          }
          if (num !== 0) {
            v.$Message.error("装箱数量必须等于货件数量");
            v.boxLoading = false;
            return false;
          } else {
            for (let t = 0; t < v.boxNum; t++) {
              arr[t].pickingBoxDetails.push({
                productGoodsId: n.productGoodsId,
                quantity: n["box" + t],
              });
            }
          }
          if (i === v.boxDataList.length - 2) {
            // console.log('arr:', arr);
            v.$Spin.show();
            v.axios
              .post(api.set_saveWmsPickingBox, JSON.stringify(arr))
              .then((response) => {
                v.$Spin.hide();
                if (response.data.code === 0) {
                  v.$Message.success("保存成功");
                  v.encasementWebModel = false;
                  v.boxLoading = false;
                  v.boxShowStatus = false;
                  v.searchData();
                }
              })
              .catch(() => {
                v.$Spin.hide();
              });
          }
        }
      });
    },
    encasement() {
      // 装箱 弹出框
      let v = this;
      v.encasementStatus = true;
      v.$nextTick(function () {
        v.encasementModel = true;
      });
    },
    showNoteFunc(bool) {
      if (!bool) {
        let optionData = [...this.optionNoteData];
        this.optionNoteData = optionData.filter((val) => {
          return val.logTypeDesc !== "10";
        });
      } else {
        this.searchData();
      }
    },
    addSuccessBack() {
      this.searchData();
    },
    addDeclareRow() {
      this.dataDeclare.splice(1, 0, {
        goodsNameCn: "",
        goodsNameEn: "",
        unitPrice: "",
        unitWeight: "",
        quantity: "",
        hsCode: "",
        productUrl: "",
      });
      this.columnsDeclare.push(this.declareOpt);
      this.openEditStatus = true;
      this.addOrEdit = "add";
    },
    cancelSaveDeclareInfo() {
      // 取消编辑
      this.dataDeclare = [...this.detailApiObj.packageDeclareList];
      this.columnsDeclare.pop();
      this.openEditStatus = false;
    },
    saveDeclareInfoValidate() {
      // 保存申报信息前的校验
      let flag = true;
      // let reg = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/
      this.dataDeclare.forEach((val) => {
        if (
          !val.goodsNameEn ||
          !val.goodsNameCn ||
          !val.quantity ||
          !val.unitWeight ||
          !val.unitPrice ||
          !val.declareCurrency
        ) {
          flag = false;
        }
      });
      return flag;
    },
    saveDeclareInfo() {
      // 保存申报信息
      if (this.saveDeclareInfoValidate()) {
        let obj = {
          packageDeclareList: this.dataDeclare,
          packageIdList: [this.detailApiObj.pickingId],
          warehouseId: this.getWarehouseId(),
        };
        if (this.addOrEdit === "edit") {
          delete obj.packageIdList;
          obj.packageId = this.detailApiObj.pickingId;
          this.$Spin.show();
          this.axios
            .put(this.addOrEdit === "edit" ? api.updateDeclare : api.saveDeclareInfo, obj)
            .then((res) => {
              this.$Spin.hide();
              if (res.data.code === 0) {
                this.$Message.success("保存成功");
                this.openEditStatus = false;
                this.columnsDeclare.pop();
              }
            })
            .catch(() => {
              this.$Spin.hide();
            });
        } else {
          if (this.dataDeclare.length === 0) {
            this.$Message.warning("无新增数据");
            return;
          }
          this.$Spin.show();
          this.axios
            .post(
              this.addOrEdit === "edit" ? api.updateDeclare : api.saveDeclareInfo,
              obj
            )
            .then((res) => {
              this.$Spin.hide();
              if (res.data.code === 0) {
                this.$Message.success("保存成功");
                this.openEditStatus = false;
                this.columnsDeclare.pop();
              }
            })
            .catch(() => {
              this.$Spin.hide();
            });
        }
      } else {
        this.$Message.warning("新增行请填写完整");
      }
    },
    editDeclareInfo() {
      this.columnsDeclare.push(this.declareOpt);
      this.openEditStatus = true;
      this.addOrEdit = "edit";
    },
    changeShow() {
      this.assignListShow = !this.assignListShow;
    },
    changeShowBox() {
      this.assignListShowBox = !this.assignListShowBox;
    },
    fromStatusCloseOption() {
      if (this.workType === "sellStock") {
        if (this.currentIconStatus.salesPickingStatus > 2) {
          this.columns1.splice(-1, 1);
          this.columns1.splice(0, 1);
        }
      } else {
        if (this.currentIconStatus.otherPickingStatus > 1) {
          this.columns1.splice(-1, 1);
          this.columns1.splice(0, 1);
        }
      }
    },
    getOrderPrefix(params) {
      // 获取订单前缀
      this.axios.post(api.getOrderFront + "?saleAccountIds=" + [params]).then((res) => {
        if (res.data.code === 0) {
          let data = this.mainInfo.packageOrderBoList || [];
          if (data.length > 0) {
            let resultData = res.data.datas || [];
            data[0].accountCode = resultData[0] ? resultData[0].accountCode : null;
          }
          //         if (this.mainInfo.orderNos && res.data.datas) {
          //           let orderNosArr = this.mainInfo.orderNos.split(',');
          //           this.mainInfo.orderNos = orderNosArr.map(val => res.data.datas[0].accountCode + '-' + val).join(',');
          //         }
        }
      });
    },
    searchData(type) {
      let pos = [];
      var obj = {
        pickingNo: this.pickingNo,
        warehouseId: this.getWarehouseId(),
      };
      this.axios
        .post(
          this.workType === "otherStock" ? api.get_stockOutDtl : api.get_sellStockOutDtl,
          obj
        )
        .then((res) => {
          if (res.data.code === 0) {
            let resData = res.data.datas;
            resData.zkList = [
              {
                sku: '2389473',
                num: 2,
              },
              {
                sku: '6783453',
                num: 5,
              },
            ]
            resData.bzList = [
              {
                sku: '2389473',
                num: 1,
              },
              {
                sku: '6783453',
                num: 4,
              },
            ]

            this.detailApiObj = res.data.datas;
            this.detailApiObj.operatingFee = this.detailApiObj.operatingFee
              ? this.detailApiObj.operatingFee.toFixed(2)
              : 0;
            this.detailApiObj.storageFee = this.detailApiObj.storageFee
              ? this.detailApiObj.storageFee.toFixed(2)
              : 0;
            this.detailApiObj.warehouseOutFee = this.detailApiObj.warehouseOutFee
              ? this.detailApiObj.warehouseOutFee.toFixed(2)
              : 0;
            this.dataDeclare = this.detailApiObj.packageDeclareList
              ? [...this.detailApiObj.packageDeclareList]
              : [];
            this.mainInfo.overseaTagId = resData.overseaTagId;
            this.mainInfo.pickingId = resData.pickingId;
            this.uploadData.pickingId = resData.pickingId;
            this.mainInfo.num = resData.pickingNo;
            this.mainInfo.type = resData.pickingType;
            this.mainInfo.status = resData.pickingStatus;
            this.mainInfo.ware = resData.warehouseName;
            this.wareId = resData.warehouseId;
            this.mainInfo.referenceNum = resData.referenceNo;
            this.mainInfo.pickingGoodsNo = resData.pickingGoodsNo;
            this.mainInfo.orderNos = resData.orderNos;
            this.mainInfo.shipmentID = resData.shipmentId;
            this.mainInfo.packageOrderBoList = resData.packageOrderBoList;
            this.getOrderPrefix(resData.saleAccountId);
            this.mainInfo.createTime = this.$uDate.dealTime(resData.createdTime);
            this.mainInfo.payTime = this.$uDate.dealTime(resData.payTime);
            this.mainInfo.creator = resData.createName;
            this.mainInfo.lastModifyTime = this.$uDate.dealTime(resData.updatedTime);
            this.mainInfo.updateName = resData.updateName;
            this.mainInfo.lastModifyPerson = resData.updatedBy;
            this.mainInfo.boxStatus = resData.boxStatus;
            this.mainInfo.pickingGoodsStatus = resData.pickingGoodsStatus;
            this.mainInfo.userWeight = resData.userWeight;
            this.mainInfo.pickingExtendId = resData.pickingExtendId;
            this.mainInfo.logisticsDealerCode = resData.logisticsDealerCode;
            this.mainInfo.logisticsMailCode = resData.logisticsMailCode;
            this.mainInfo.totalWeight = resData.totalWeight
              ? resData.totalWeight + "(g)"
              : "";
            if (resData.estimateFreight) {
              this.mainInfo.estimateFreight = resData.estimateFreight + "RMB";
            }
            this.receiver.receiverName = resData.consigneeName;
            this.receiver.country = resData.consigneeCountry;
            this.receiver.buyerPassportCode = resData.buyerPassportCode;
            this.receiver.linkman = resData.consigneeLinkMan;
            this.receiver.region = resData.consigneeProvince;
            this.receiver.tel = resData.consigneeLinkTel;
            this.receiver.MobilePhone = resData.consigneeLinkMobile;
            this.receiver.city = resData.consigneeCity;
            this.receiver.address = resData.consigneeAddress;
            this.receiver.email = resData.consigneeMail;
            this.receiver.consigneeAddressOther = resData.consigneeAddressOther;
            this.receiver.postalcode = resData.consigneeZipCode;

            this.logister.logisticDealer = resData.logisticsDealerName;
            this.logister.logisticNum = resData.logisticsNo;
            this.logister.sendType = resData.logisticsMailName;
            this.logister.trackingNum = resData.logisticsTrackingNo;
            this.logister.virtualTrackingNumber = resData.virtualTrackingNumber;
            this.logister.linkman = resData.logisticsLinkMan;
            this.logister.tel = resData.logisticsLinkTel;
            this.logister.email = resData.logisticsLinkMail;
            this.logister.carrierWeight = resData.carrierWeight
              ? resData.carrierWeight + "(g)"
              : "";
            // if (resData.postage) {
            this.logister.packageCarrierParamList = resData.packageCarrierParamList;
            if (resData.postage) {
              if (resData.postageCurrency) {
                this.logister.postage = resData.postage + "" + resData.postageCurrency;
                this.mainInfo.postage = resData.postage + "" + resData.postageCurrency;
              } else {
                this.logister.postage = resData.postage;
                this.mainInfo.postage = resData.postage;
              }
            }
            this.pickingId = resData.pickingId;
            // --------------------------------------------
            let goodsArr = resData.queryPickingGoodsResult;
            // goodsArr.forEach(val => {
            //   // val.warehouseLocationName = ''
            // });
            if (goodsArr && goodsArr.length > 0) {
              goodsArr.forEach((val) => {
                val.pickingNo = resData.pickingNo;
                val.perRowStatus =
                  val.pickingDetailStatus === "0"
                    ? "订单创建"
                    : val.pickingDetailStatus === "1"
                      ? "部分分配"
                      : val.pickingDetailStatus === "2"
                        ? "分配完成"
                        : val.pickingDetailStatus === "4"
                          ? "完成发货"
                          : val.pickingDetailStatus === "5"
                            ? "订单完成"
                            : "";
              });
              this.queryPickingBatchResult = resData.queryPickingBatchResult;
              this.deliveryListData = goodsArr;
              // this.thrdLableInfo.deliveryCopyList = this.$common.copy(goodsArr);
              this.data2 = this.processTimeData(
                resData.queryPickingBatchResult,
                "createdTime"
              );
              if (resData.wmsPickingBoxDetails) {
                resData.wmsPickingBoxDetails.forEach((n, i) => {
                  pos.push(n.updatedBy);
                });
              }
              Promise.resolve(this.getUserInfoMap(pos)).then((result) => {
                if (resData.wmsPickingBoxDetails) {
                  this.boxDetailData = this.processTimeData(
                    resData.wmsPickingBoxDetails,
                    "createdTime"
                  );
                }
              });
              // this.boxDetailData = this.processTimeData(resData.wmsPickingBoxDetails, 'createdTime');
              this.batchTotal = resData.queryPickingBatchResult.total;
              resData.wmsPickingLog.forEach((n, i) => {
                n.updatedTime = this.$uDate.dealTime(n.updatedTime);
              });
              this.cacheOptionNoteData = resData.wmsPickingLog;
              this.optionNoteData = this.processTimeData(
                resData.wmsPickingLog,
                "createdTime"
              ); // 留言信息
            }
            // }

            // !type && ['O12'].includes(resData.pickingType) && (this.getThridLabelAll());
          } else {
            this.$Message.warning({
              content: "详情加载失败",
              duration: 3,
            });
          }
        });
      // 查询状态
      let apiUrl =
        this.workType === "sellStock"
          ? api.getSalesPickingStatus
          : api.getOtherPickingStatus;
      this.axios.get(apiUrl + this.pickingNo).then((res) => {
        if (res.data.code === 0) {
          // this.currentIconStatus
          let obj = { ...res.data.datas };
          obj.createdTime = obj.createdTime ? this.$uDate.dealTime(obj.createdTime) : "";
          obj.despatchTime = obj.despatchTime
            ? this.$uDate.dealTime(obj.despatchTime)
            : "";
          obj.pickingGoodsTime = obj.pickingGoodsTime
            ? this.$uDate.dealTime(obj.pickingGoodsTime)
            : "";
          obj.pickingTime = obj.pickingTime ? this.$uDate.dealTime(obj.pickingTime) : "";
          obj.printTime = obj.printTime ? this.$uDate.dealTime(obj.printTime) : "";
          obj.getLabelTime = obj.getLabelTime
            ? this.$uDate.dealTime(obj.getLabelTime)
            : "";
          this.currentIconStatus = obj;
          this.currentIconStatus.salesPickingStatus = -1;
          this.currentIconStatus.otherPickingStatus = Number(obj.otherPickingStatus);
          delete obj.trackingNumberTime; // 这个字段暂时没用且会影响步骤条，所以这里删掉
          for (let key in obj) {
            if (key.indexOf("Time") > -1 && obj[key]) {
              this.currentIconStatus.salesPickingStatus++;
              // this.currentIconStatus.otherPickingStatus++;
            }
          }
          // 有装箱情况下的步骤条
          if (Number(obj.otherPickingStatus) === 3 && this.detailApiObj.needBox === 1) {
            this.currentIconStatus.otherPickingStatus = 4; // 已发货
          } else if (
            Number(obj.otherPickingStatus) === 2 &&
            this.detailApiObj.needBox === 1 &&
            this.detailApiObj.boxStatus === 2
          ) {
            this.currentIconStatus.otherPickingStatus = 3; // 已发货
          }
          this.fromStatusCloseOption();
        }
      });
    },
    stockChangePage(page) {
      // 表格分页
      this.pageParams.stockPageNum = page;
      this.searchData();
    },
    stockChangePageSize(size) {
      // 切页
      this.pageParams.stockPageSize = size;
      this.searchData();
    },
    batchChangePage(page) {
      // 批次表格分页
      this.pageParams.batchPageNum = page;
      this.searchData();
    },
    batchChangePageSize(size) {
      this.pageParams.batchPageSize = size;
      this.searchData();
    },
    addMsg() {
      // 添加备注按钮
      if (!this.addNotesInput) {
        this.$Message.warning({
          content: "备注不能为空",
          duration: 3,
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
        updatedTime: null,
      };
      this.$Spin.show();
      this.axios
        .post(api.add_Note, obj)
        .then((res) => {
          this.$Spin.hide();
          if (res.data.code === 0) {
            this.$Message.success("新增成功");
            this.refreshMsgNote();
          } else {
            this.$Message.warning({
              content: "新增失败",
              duration: 3,
            });
          }
        })
        .catch(() => {
          this.$Spin.hide();
        });
    },
    backList() {
      this.$parent.workShow = "list";
    },
    showNoteFn(bool) {
      // 过滤留言
      if (!bool) {
        let optionData = [...this.optionNoteData];
        this.optionNoteData = optionData.filter((val) => {
          return val.logTypeDesc !== "手动添加";
        });
      } else {
        this.optionNoteData = this.cacheOptionNoteData;
      }
    },
    closeMessage(item, i) {
      // 删除留言(废弃功能)
    },
    sltTableItemFn(data) {
      this.sltTableItem = data;
    },
    cancelAssignValid() {
      // 批量取消的校验
      let valid = true;
      if (this.sltTableItem.length === 0) {
        this.$Message.warning({
          content: "请选择要操作的数据",
          duration: 3,
        });
        valid = false;
        return valid;
      }
      // 只有部分分配和分配完成才能取消
      let hasAssign = false;
      for (let i = 0; i < this.sltTableItem.length; i++) {
        if (
          this.sltTableItem[i].pickingDetailStatus === "2" ||
          this.sltTableItem[i].pickingDetailStatus === "1"
        ) {
          hasAssign = true;
          break;
        }
      }
      if (!hasAssign) {
        this.$Message.warning({
          content: "只有部分分配和分配完成才能取消",
          duration: 3,
        });
        valid = false;
        return valid;
      }
      return valid;
    },
    cancelAssign() {
      // 批量取消
      if (this.cancelAssignValid()) {
        this.sltTableItem.forEach((val) => {
          val.warehouseId = this.wareId;
        });
        let obj = this.sltTableItem.filter((val) => {
          return val.pickingDetailStatus === "2" || val.pickingDetailStatus === "1";
        });
        this.cancelAssignFn(obj);
      }
    },
    assignInventoryValid() {
      // 批量分配前的校验
      let valid = true;
      // 勾选数据校验
      if (this.sltTableItem.length === 0) {
        this.$Message.warning({
          content: "请选择要操作的数据",
          duration: 3,
        });
        valid = false;
        return valid;
      }
      // 分配完成的订单不能再分配
      let hasAssign = true;
      for (let i = 0; i < this.sltTableItem.length; i++) {
        if (this.sltTableItem[i].pickingDetailStatus !== "2") {
          hasAssign = false;
          break;
        }
      }
      if (hasAssign) {
        this.$Message.warning({
          content: "存在分配完成的订单",
          duration: 3,
        });
        valid = false;
        return valid;
      }
      //* *********************
      // 判断是否填了库位信息
      var flag = true;
      this.sltTableItem.forEach((val) => {
        if (!val.warehouseLocationName && val.pickingDetailStatus !== "2") {
          flag = false;
        }
      });
      if (!flag) {
        this.$Message.warning({
          content: "请填写库位",
          duration: 3,
        });
        valid = false;
        return valid;
      }
      return valid;
    },
    saveDo() {
      let v = this;
      return new Promise((resolve) => {
        if (this.workType === "otherStock") {
          v.$Modal.confirm({
            title: "温馨提示",
            content: "是否保存并分配库存",
            onOk: () => {
              v.saveObsoletepick().then(() => {
                resolve();
              });
            },
            onCancel: () => { },
          });
        } else {
          resolve();
        }
      });
    },
    assignInventory() {
      // 批量分配
      let v = this;
      v.saveDo().then(() => {
        if (this.assignInventoryValid()) {
          this.sltTableItem.forEach((val) => {
            val.warehouseId = this.wareId;
          });
          let skus = this.sltTableItem.filter((i) => i.pickingDetailStatus === "2");
          let params = this.sltTableItem.filter((i) => i.pickingDetailStatus !== "2");
          if (skus && skus.length > 0) {
            setTimeout(() => {
              v.$Modal.confirm({
                title: "温馨提示",
                content:
                  "有已分配的sku，点击确定时忽略已分配库存的SKU，对未分配的SKU进行分配库存",
                onOk: () => {
                  v.assignFn(params);
                },
                onCancel: () => { },
              });
            }, 500);
          } else {
            this.assignFn(params);
          }
        }
      });
    },
    // 冻结分配
    FreezeAssignmentBtn() {
      // 冻结分配之前判断是否有改动，如果有改动，弹框提示保存再冻结分配
      const flag =
        JSON.stringify(this.deliveryListData) === JSON.stringify(this.deProductList);
      if (this.workType === "otherStock" && !flag) {
        this.$Modal.confirm({
          title: "温馨提示",
          content: "是否保存并冻结分配",
          onOk: () => {
            this.saveObsoletepick().then(() => {
              this.refreshAssignList();
              this.$refs.frozenModal.frozenModal = true;
            });
          },
          onCancel: () => { },
        });
      } else {
        this.$refs.frozenModal.frozenModal = true;
      }
    },
    assignFn(params, index) {
      // 分配函数
      this.$Spin.show();
      let apiUrl =
        this.workType === "otherStock"
          ? api.assign_stockSingle
          : api.assign_sellStockSingle;
      this.axios
        .post(apiUrl, params)
        .then((res) => {
          this.$Spin.hide();
          if (res.data.code === 0) {
            this.searchData();
            this.$Message.success("分配成功");
            this.sltTableItem = [];
            this.refreshAssignList(index);
            this.currentIconStatus.otherPickingStatus += 1;
          }
        })
        .catch(() => {
          this.$Spin.hide();
        });
    },
    cancelAssignFn(params, index) {
      // 取消函数
      this.$Spin.show();
      this.axios
        .post(
          this.workType === "otherStock" ? api.cancel_stock : api.cancel_sellStock,
          params
        )
        .then((res) => {
          this.$Spin.hide();
          if (res.data.code === 0) {
            this.$Message.success("取消成功");
            this.sltTableItem = [];
            this.refreshAssignList(index);
            this.currentIconStatus.otherPickingStatus -= 1;
          } else {
            // this.$Message.warning({
            //   content: res.data.message,
            //   duration: this.$store.state.messageTipsDuration
            // });
          }
        })
        .catch(() => {
          this.$Spin.hide();
        });
    },
    getData(data) {
      // 选择库位框返回数据
      this.$set(
        this.deliveryListData[this.clickIndex],
        "warehouseLocationName",
        data.warehouseLocationName
      );
      this.deliveryListData[this.clickIndex].warehouseLocationId =
        data.warehouseLocationId;
      this.deliveryListData[this.clickIndex].receiptBatchNo = data.receiptBatchNo;
      this.deliveryListData[this.clickIndex].inventoryId = data.inventoryId;
      this.deliveryListData[this.clickIndex].availableNumber = data.availableNumber;
      this.sltTableItem = [];
    },
    refreshAssignList(index) {
      // 更新分配列表
      var obj = {
        pickingNo: this.mainInfo.num,
        warehouseId: this.getWarehouseId(),
      };
      let url =
        this.workType === "otherStock" ? api.get_stockOutDtl : api.get_sellStockOutDtl;
      this.axios
        .post(url, obj)
        .then((res) => {
          // this.axios.post(api.get_sellStockOutDtl, obj).then(res => {
          if (res.data.code === 0) {
            if (index === undefined) {
              let processData = res.data.datas.queryPickingGoodsResult;
              processData.forEach((val) => {
                //                                 val.warehouseLocationName = ''
                // val.warehouseLocationId = '';
                // val.receiptBatchNo = '';
                // val.inventoryId = '';
                // val.availableNumber = '';
                val.pickingNo = this.pickingNo;
                val.perRowStatus =
                  val.pickingDetailStatus === "0"
                    ? "订单创建"
                    : val.pickingDetailStatus === "1"
                      ? "部分分配"
                      : val.pickingDetailStatus === "2"
                        ? "分配完成"
                        : val.pickingDetailStatus === "4"
                          ? "完成发货"
                          : val.pickingDetailStatus === "5"
                            ? "订单完成"
                            : "";
              });
              this.queryPickingBatchResult = res.data.datas.queryPickingBatchResult;
              this.deliveryListData = processData;
              // this.thrdLableInfo.deliveryCopyList = this.$common.copy(processData);
              this.deProductList = this.$common.copy(processData);
            } else {
              let obj = {
                ...res.data.datas.queryPickingGoodsResult.list[index],
              };
              //								obj.warehouseLocationName = ''
              // obj.warehouseLocationId = '';
              // obj.receiptBatchNo = '';
              // obj.inventoryId = '';
              // obj.availableNumber = '';
              obj.pickingNo = this.pickingNo;
              obj.perRowStatus =
                obj.pickingDetailStatus === "0"
                  ? "订单创建"
                  : obj.pickingDetailStatus === "1"
                    ? "部分分配"
                    : obj.pickingDetailStatus === "2"
                      ? "分配完成"
                      : obj.pickingDetailStatus === "4"
                        ? "完成发货"
                        : obj.pickingDetailStatus === "5"
                          ? "订单完成"
                          : "";
              this.deliveryListData.splice(index, 1, obj);
            }
            // this.columns1 = this.deepCopy(this.columns1);
            this.columns1 = [...this.columns1];
            this.data2 = this.processTimeData(
              res.data.datas.queryPickingBatchResult,
              "createdTime"
            );
            this.optionNoteData = this.processTimeData(
              res.data.datas.wmsPickingLog,
              "createdTime"
            ); // 留言信息
            this.mainInfo.status = res.data.datas.pickingStatus; // 更新状态
          }
        })
        .catch(() => { });
    },
    refreshMsgNote() {
      // 添加成功后刷新留言
      this.axios.get(api.refresh_msgNote + "?pickingId=" + this.pickingId).then((res) => {
        if (res.data.code === 0) {
          this.optionNoteData = res.data.datas;
          this.cacheOptionNoteData = res.data.datas; // 更新缓存
          this.addNotesInput = "";
        }
      });
    },
    getUserInfoMap(userIds) {
      let v = this;
      return new Promise((resolve) => {
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
    },
    updateData(value) {
      // 解冻并分配后，更新列表数据
      if (value === this.frozenModalTalg) {
        this.searchData();
      }
    },
    // // 获取所有的第三方标签
    // getThridLabelAll() {
    //   this.axios.post(api.productOverseaTagList).then(({ data }) => {
    //     if (data.code !== 0) return;
    //     this.thrdLableInfo.allLabelList = data.datas || [];
    //   });
    // },
    // // 按第三方标签出库
    // async outByThirdLabel() {
    //   let productGoodsIdList = this.deliveryListData.map(k => k.productGoodsId);
    //   if (!productGoodsIdList.length) {
    //     this.thrdLableInfo.copyLabelList = [];
    //   }
    //   if (JSON.stringify(productGoodsIdList) !== JSON.stringify(this.thrdLableInfo.copyLabelList)) {
    //     this.thrdLableInfo.copyLabelList = productGoodsIdList;
    //     this.thrdLableInfo.loading = true;
    //     await this.getStorckLabel();
    //     this.thrdLableInfo.loading = false;
    //   }
    //   this.thrdLableInfo.visible = true;
    // },
    // // 获取入库单的共有标签初始化值(所有的SKU都有了该“标签名称”)
    // getStorckLabel() {
    //   return new Promise((resolve) => {
    //     this.axios.post(api.queryOtherPickingCommonOverseaTag, this.thrdLableInfo.copyLabelList)
    //       .then(({ data }) => {
    //         if (data.code !== 0) return;
    //         let list = data.datas || [];
    //         this.thrdLableInfo.labelList = this.thrdLableInfo.allLabelList.filter(k => {
    //           return list.includes(k.overseaTagId);
    //         })
    //       }).finally(() => {
    //         resolve(true);
    //       })
    //   })
    // },
    // // 选择第三方标签返回
    // confirmLabel(temp) {
    //   let dom = this.$refs['outByThirdLabel'];
    //   dom.loading = true;
    //   this.axios.put(`${api.modifyOtherPickingOverseaTag}${this.pickingId}?overseaTagId=${temp.overseaTagId}`)
    //     .then(({ data }) => {
    //       if (data.code !== 0) return;
    //       this.$Message.success("操作成功");
    //       dom.isVisible = false;
    //       this.searchData('edit');
    //     }).finally(() => {
    //       dom.loading = false;
    //     })
    // }
  },
};
</script>
<style scoped>
.totalNum {
  font-weight: bold;
}

.op-box {
  margin: 15px 0;
}
</style>
<style>
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

.stockOutDlt>div:first-child h3 {
  background-color: #ffffff;
  padding: 10px;
}

.stockOutDlt .ivu-table-tip {
  overflow-x: hidden;
}
</style>
