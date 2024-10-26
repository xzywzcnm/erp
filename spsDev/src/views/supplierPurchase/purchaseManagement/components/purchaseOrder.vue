<template>
  <div>
    <template v-if="purchaseShow == 'purchaseOrder'">
      <div class="supplierTabsBar commonFilter normalTop pos-rel tabsBgcolor" style="margin-top: -10px">
        <template>
          <Tabs v-model="currentTabItem" @on-click="showCurrentPage" class="tabsBox">
            <TabPane v-for="(item, index) in tabItems" :label="item.value" :key="`${index}-${item.key}`"
              :name="String(item.key)"></TabPane>
          </Tabs>
          <!-- 隐藏右上角的筛选 -->
          <filterColumns ref="filterColumns" :columns="sampleColumns" :filterName="filterName"
            @setTableColumns="setTableColumns" style="display: none"></filterColumns>
        </template>
      </div>
      <div class="commonFilter searchBox">
        <div class="card-container">
          <div class="card-content" style="border-color: #fff; margin: -15px 0 -8px 0">
            <div class="platformParamsSelect">
              <Form ref="pageParams" class="formSearch fmb16" :model="pageParams" inline :label-width="120">
                <dyt-filter class="supOrderForm">
                  <FormItem class="form-item-label">
                    <dyt-select v-model="timeType" style="width: 110px" slot="label" :clearable="false">
                      <Option v-for="(item, index) in timeTypeArr" :value="item.key" :key="index" :label="item.value" />
                    </dyt-select>
                    <Date-picker
                      style="width: 100%"
                      type="datetimerange"
                      @on-clear="resetDate1"
                      @on-change="pickDataChange"
                      transfer
                      separator=" - "
                      :clearable="clearAble"
                      :options="dateOptions"
                      format="yyyy-MM-dd HH:mm"
                      placement="bottom-end"
                      placeholder="选择日期"
                      :value="pickData"
                    />
                  </FormItem>
                  <FormItem label="采购单号">
                    <dyt-input-tag :limit="1" v-model="pageParams.orderNoList" placeholder="多个用逗号或回车分开" type="textarea">
                    </dyt-input-tag>
                  </FormItem>
                  <FormItem label="SKU">
                    <dyt-input-tag :limit="1" v-model="pageParams.skuList" placeholder="多个用逗号或回车分开" type="textarea">
                    </dyt-input-tag>
                  </FormItem>
                  <FormItem label="采购员" prop="purchaserId">
                    <dyt-select v-model="pageParams.purchaserId" filterable clearable>
                      <Option v-for="(item, index) in purchaserArr" :value="item.id" :label="item.name" :key="index">{{
                        item.name }}</Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="供应商" prop="supplierId">
                    <dyt-select v-model="pageParams.supplierId" filterable clearable ref="resetSelect">
                      <Option v-for="(item, index) in supplierArr" :value="item.supplierId" :label="item.supplierName"
                        :key="index">{{ item.supplierName }}</Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="SPU">
                    <dyt-input-tag :limit="1" v-model="pageParams.spuList" placeholder="多个用逗号或回车分开" type="textarea">
                    </dyt-input-tag>
                  </FormItem>
                  <FormItem label="备货计划编号">
                    <dyt-input-tag :limit="1" v-model="pageParams.planSerialNumberList" placeholder="多个用逗号或回车分开"
                      type="textarea">
                    </dyt-input-tag>
                  </FormItem>
                  <FormItem label="结算方式" prop="settlementType">
                    <dyt-select v-model="pageParams.settlementType" clearable>
                      <Option v-for="(item, index) in settlementMethodArr" :value="item.dataValue" :label="item.dataDesc"
                        :key="index">{{ item.dataDesc }}</Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="外部流水号" prop="externalSerialNo">
                    <dyt-input v-model="pageParams.externalSerialNo" placeholder="请输入外部流水号" />
                  </FormItem>
                  <FormItem label="入库状态" prop="receiptStatusList">
                    <dyt-select v-model="pageParams.receiptStatusList" :max-tag-count="1" clearable multiple>
                      <Option v-for="(item, index) in arrivalStatusArr" :value="item.value" :label="item.label"
                        :key="index">{{ item.label }}</Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="收货异常状态" prop="abnormalStatus">
                    <dyt-select v-model="pageParams.abnormalStatus" clearable>
                      <Option v-for="(item, index) in abnormalStatusArr" :value="item.code" :label="item.value"
                        :key="index">{{ item.value }}</Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="付款状态" prop="payStatus">
                    <dyt-select v-model="pageParams.payStatus" filterable clearable>
                      <Option v-for="(item, index) in payStatusArr" :value="item.value" :label="item.label" :key="index">
                        {{ item.label }}</Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="备货类型" prop="readyType">
                    <dyt-select v-model="pageParams.readyType" clearable>
                      <Option v-for="(item, index) in stockTypeArr" :value="item.value" :key="index">{{ item.label }}
                      </Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="1688账号类型" prop="alibabaAccountType">
                    <dyt-select v-model="pageParams.alibabaAccountType" clearable>
                      <Option v-for="(item, index) in alibabaList" :value="item.label" :label="item.label" :key="index">
                        {{ item.label }}</Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="备货仓库" prop="warehouseId">
                    <dyt-select v-model="pageParams.warehouseId" clearable>
                      <Option v-for="(item, index) in warehouseList" :value="item.id" :label="item.name" :key="index">{{
                        item.name }}</Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="采购标签" prop="tagNames">
                    <dyt-select v-model="pageParams.tagNames" clearable :max-tag-count="1" multiple>
                      <Option v-for="(item, index) in tagsList" v-show="item != ''" :value="item" :key="index">{{ item }}
                      </Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="质检类型" prop="tagNames">
                    <dyt-select v-model="pageParams.checkType" clearable :max-tag-count="1">
                      <Option label="免检" :value="0"></Option>
                      <Option label="抽检" :value="1"></Option>
                      <Option label="全检" :value="2"></Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="退款状态" prop="refundStatus">
                    <dyt-select v-model="pageParams.refundStatus" clearable :max-tag-count="1">
                      <Option label="未申请退款" value="0"></Option>
                      <Option label="已申请退款" value="1"></Option>
                      <Option label="已取消退款" value="2"></Option>
                      <Option label="部分退款" value="3"></Option>
                      <Option label="已退款" value="4"></Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="所属事业部" prop="businessDeptIdList">
                    <dyt-select v-model="pageParams.businessDeptIdList" filterable clearable multiple :max-tag-count="1">
                      <Option v-for="item in businessDeptInfoList" :key="item.id" :label="item.name" :value="item.id">
                      </Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="超发" prop="overshootStateList">
                    <dyt-select v-model="pageParams.overshootStateList" multiple :max-tag-count="1">
                      <Option label="允许超发中" :value="1"></Option>
                      <Option label="允许超发结束" :value="2"></Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="收货情况" prop="receivingSituation">
                    <dyt-select v-model="pageParams.receivingSituation">
                      <Option label="未收货" :value="1"></Option>
                      <Option label="收货未完成" :value="2"></Option>
                      <Option label="收货已完成" :value="3"></Option>
                    </dyt-select>
                  </FormItem>
                  <div slot="operation">
                    <Button type="primary" @click="getList" :disabled="SearchDisabled" icon="ios-search">查询</Button>
                    <Button @click="reset" style="margin-left: 10px" v-once icon="md-refresh">重置</Button>
                  </div>
                </dyt-filter>
              </Form>
            </div>
          </div>
        </div>
      </div>
      <!-- v-if="currentTabItem == '5'" -->
      <div class="flexBox spaceBetween">
        <div class="tableControl">
          <Dropdown @on-click="clickDrop" v-if="getPermission('purchase_exportByIds')">
            <Button type="primary" style="margin-left: 12px; font-size: 12px">
              <span class="icon iconfont">&#xe639;</span> Excel导出
              <Icon type="md-arrow-dropdown"></Icon>
            </Button>
            <DropdownMenu slot="list">
              <DropdownItem name="2" v-if="getPermission('purchase_exportPurchaseByIds')">导出选中列表</DropdownItem>
              <DropdownItem name="3" v-if="getPermission('purchase_exportPurchase')">导出所有列表</DropdownItem>
              <DropdownItem name="0" v-if="getPermission('purchase_exportByIds')">导出选中明细</DropdownItem>
              <DropdownItem name="1" v-if="getPermission('purchase_export')">导出所有明细</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Button type="primary" class="iconbuttons purchaseBtn" v-if="getPermission('purchase_submit_add')"
            @click="addPurOrder">
            新增采购单
          </Button>

          <Button type="primary" v-if="getPermission('purchase_batchOperation') && currentTabItem == '2'
            " class="iconbuttons purchaseBtn" @click="showModal('3')">
            审核通过
          </Button>

          <Button type="primary" v-if="getPermission('purchase_applyPayment') && currentTabItem == '4'
            " class="iconbuttons purchaseBtn" @click="applyPayment()">
            批量申请付款
          </Button>
          <Button type="primary" v-if="getPermission('purchase_applyRefund') &&
            ['4', '5'].includes(currentTabItem)
            " class="iconbuttons purchaseBtn" @click="applyRefund()">
            批量申请退款
          </Button>
          <Button type="primary" v-if="getPermission('purchase_batchOperation') && currentTabItem == '2'
            " class="iconbuttons purchaseBtn" @click="showModal('1')">
            驳回
          </Button>
          <!-- <Button  type="primary" v-if="getPermission('purchase_batchOperation') && (currentTabItem == '1' || currentTabItem == '2' || currentTabItem == '4')" class="iconbuttons purchaseBtn"  @click="showModal('4')">
            作废
          </Button> -->
          <Button type="primary" v-if="getPermission('purchase_batchOperation') &&
            (currentTabItem == '1' ||
              currentTabItem == '2' ||
              currentTabItem == '3')
            " class="iconbuttons purchaseBtn" @click="showModal('5')">
            取消采购
          </Button>
          <Button type="primary" v-if="getPermission('purchase_batchOperation') && currentTabItem == '3'
            " class="iconbuttons purchaseBtn" @click="orderForsupply()">
            向供应商下单
          </Button>
          <Dropdown class="tcDropDown" style="margin-left: 12px" v-if="currentTabItem == '4'">
            <Poptip v-model="setTagListStatus" placement="right">
              <Button type="primary"> 采购标签 </Button>
              <div slot="content">
                <div style="overflow: auto; max-height: 200px; width: 300px">
                  <Checkbox-group v-model="tagIdList" class="purchaseOrderCheBox">
                    <ul class="purchaseOrderCheUl">
                      <li class="purchaseOrderCheLi" v-for="(item, tagIndex) in tagsList" v-show="item != ''"
                        :key="tagIndex">
                        <Checkbox :label="item">{{ item }}</Checkbox>
                      </li>
                    </ul>
                  </Checkbox-group>
                </div>
                <div class="tagsSelectFooter">
                  <Button size="small" type="primary" @click="setTag"
                    :disabled="!getPermission('purchase_batchFlagTag')">确定</Button>
                  <Button size="small" @click="dropOrderTag" :disabled="!getPermission('purchase_batchDeleteTag')">重置
                  </Button>
                </div>
              </div>
            </Poptip>
          </Dropdown>
          <Dropdown @on-click="updatePrice" v-if="currentTabItem == 1 && getPermission('purchase_updateAliAmount')">
            <Button type="primary" style="margin-left: 12px">更新价格
              <Icon type="md-arrow-dropdown"></Icon>
            </Button>
            <DropdownMenu slot="list">
              <DropdownItem name="0">批量更新价格</DropdownItem>
              <DropdownItem name="1">所有更新价格</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Button type="primary" v-if="isShowExceed" class="iconbuttons purchaseBtn" @click="finishExceed"
            :disabled="isDisabledExceed || selectionArr.length <= 0" :loading="isHaandExceed">
            批量结束超发
          </Button>
          <!-- <Button
            type="primary"
            class="ml10"
            @click="updatePrice"
            v-if="currentTabItem == '1'"
            >更新价格</Button
          > -->

          <!-- <Button type="primary" v-if="getPermission('purchase_batchImport')" class="iconbuttons purchaseBtn" @click="importExcel = true">
            导入物流信息
          </Button> -->
        </div>
        <div style="margin-right: 20px">
          <span>排序方式：</span>
          <Button-group>
            <Button :type="item.checked ? 'primary' : 'default'" v-for="item in sortData" @click="clickSortButton(item)"
              :key="item.value">{{ item.label }}
              <Icon type="md-arrow-up" v-if="item.checked && !item.toogle"></Icon>
              <Icon type="md-arrow-down" v-if="item.checked && item.toogle"></Icon>
            </Button>
          </Button-group>
        </div>
      </div>

      <div class="commonFilter">
        <div class="orderTable">
          <keep-alive>
            <Table highlight-row :height="tableHeight" :border="true" :loading="Tableloading" :columns="orderColumn"
              :data="ordersData" @on-selection-change="getSelectValue">
            </Table>
          </keep-alive>
          <div class="table-page clear">
            <div class="table-page-right">
              <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
                :current="pageParams.pageNum" show-sizer @on-page-size-change="changePageSize" placement="top"
                :page-size-opts="pageArray"></Page>
            </div>
          </div>
        </div>
      </div>
    </template>
    <transition name="bounce">
      <!-- 新增 -->
      <template v-if="purchaseShow === 'addPurchaseOrder'">
        <div class="subLayer infoDetails">
          <div class="topper">
            <span class="arrowLeft" @click="goBackFromAdd">
              <Icon type="ios-arrow-back" class="IconBack"></Icon>返回
            </span>
          </div>
          <div class="mainContent">
            <addPurchaseOrder @goBackFromAdd="goBackFromAdd" @addOrderGoBack="addOrderGoBack" :orderData="orderData"
              :orderSource="orderSource" :orderType="orderType" :purchaseWarehouseArr="purchaseWarehouseArr"
              :purchaserArray="purchaserArr"></addPurchaseOrder>
          </div>
        </div>
      </template>
    </transition>
    <transition name="bounce">
      <template v-if="purchaseShow === 'showPurchaseOrder' && this.showType != 3">
        <div class="subLayer infoDetails">
          <div class="topper">
            <span class="arrowLeft" @click="goBackFromAdd">
              <Icon type="ios-arrow-back" class="IconBack"></Icon>返回
            </span>
          </div>
          <div class="mainContent">
            <showOrder :purchaserArrT="purchaserArr" @goBackFromAdd="goBackFromAdd" @getList="getList"
              @addOrderGoBack="addOrderGoBack" :orderData="orderData" :editType="editType"
              :purchaseOrderIds="purchaseOrderIds" :showType="showType"></showOrder>
          </div>
        </div>
      </template>
    </transition>
    <transition name="bounce">
      <!-- 查看 -->
      <template v-if="purchaseShow === 'showOrderDetail'">
        <div class="subLayer infoDetails">
          <div>
            <purchase-detail :dialogObj="dialogDetail" :purchaserArrT="purchaserArr" @getList="getList"
              @goBackFromAdd="goBackFromAdd" @addOrderGoBack="addOrderGoBack" :orderData="orderData" :editType="editType"
              :purchaseOrderIds="purchaseOrderIds" :showType="showType"></purchase-detail>
          </div>
        </div>
      </template>
    </transition>
    <!--导出Excel-->
    <Modal v-model="isShowExportExcel" title="导出Excel" width="420">
      <div style="padding: 10px 30px; font-size: 14px; height: 150px">
        <p>您是否需要在表格中导出产品图片</p>
        <div class="normalTop20">
          <RadioGroup v-model="exportObj.isExportPic" @on-change="picRadioChangeFn">
            <Radio label="false">
              <span>不导出图片</span>
            </Radio>
            <Radio label="true">
              <span>导出图片</span>
            </Radio>
          </RadioGroup>
        </div>
        <div class="normalTop" v-if="exportObj.isExportPic == 'true'">
          <RadioGroup v-model="exportObj.picType">
            <Radio label="smallPic">
              <span>缩略图</span>
            </Radio>
            <Radio label="bigPic">
              <span>原图</span>
            </Radio>
          </RadioGroup>
        </div>
      </div>
      <div slot="footer" style="text-align: center">
        <Button type="primary" style="width: 100px" @click="exportEcxel">导出表格</Button>
        <p style="padding: 10px 0; color: #ff0000">
          说明：导出文件中的“备注”只包含采购单编辑的备注内容
        </p>
      </div>
    </Modal>
    <!--提示-->
    <Modal v-model="isShowTips" title="提示" width="420">
      <div>采购单号{{ purchaseOrderId }}{{ statusText }}</div>
      <div slot="footer" style="text-align: center">
        <Button type="primary" style="width: 100px" @click="isShowTips = false">关闭</Button>
      </div>
    </Modal>
    <!--采购单相关备货计划-->
    <Modal v-model="isShowRelatedPlan" title="采购单相关备货计划" width="640">
      <div>
        <Table :border="true" :height="300" :columns="planColumns" :loading="Tableloading" :data="planData"></Table>
      </div>
      <div slot="footer" style="text-align: center">
        <Button type="primary" style="width: 100px" @click="isShowRelatedPlan = false">关闭</Button>
      </div>
    </Modal>
    <!--批量导入-->
    <Modal v-model="importExcel" title="批量导入" @on-ok="importExcel = false" class-name="verticalCenterModal"
      @on-cancel="importExcel = false" :styles="{ top: '280px' }" width="400">
      <template v-if="uploadList.length == 0 ||
        (uploadList.length > 0 &&
          uploadList[uploadList.length - 1].status === 'finished')
        ">
        <div style="text-align: center; margin: 20px 0">
          <dytUpload ref="import" type="drag" :format="['XLS', 'XLSX']" :action="batchImport" name="file"
            :headers="headObj" :on-success="okUpload" :on-error="uploadError" :show-upload-list="false"
            :onFormatError="formatError">
            <div style="padding: 20px 0">
              <Icon type="ios-cloud-upload" size="60"></Icon>
              <p>导入</p>
            </div>
          </dytUpload>
        </div>
        <div style="text-align: center">
          <a href="javascript:void(0)" @click="downloadEcxel()">下载Excel文件模板</a>
        </div>
      </template>
      <template v-else>
        <div style="margin: 20px 0">
          <Progress v-if="uploadList[uploadList.length - 1].showProgress"
            :percent="uploadList[uploadList.length - 1].percentage" hide-info></Progress>
        </div>
      </template>
      <div slot="footer"></div>
    </Modal>
    <!--到货记录-->
    <Modal v-model="model1" title="收货记录" width="860">
      <Table :columns="columns1" highlight-row border max-height="550" :loading="Tableloading" :data="data1">
      </Table>
    </Modal>

    <!-- 申请付款 -->
    <Modal v-model="showPayModal" title="申请付款" :mask-closable="false" width="1200" @on-visible-change="showPayModalChange"
      class-name="purchase-order-modal">
      <div class="supplierTabsBar commonFilter normalTop" v-if="paySupplierList.length != 1">
        <Tabs @on-click="showCurrentSupplierId" :value="supplierInfoListItem">
          <TabPane v-for="(item, index) in paySupplierList" :label="item.supplierName" :key="index" :name="String(index)">
          </TabPane>
          <!-- <TabPane v-for="(item, index) in supplierIdArr" :label="item.supplierName" :key="index" :name="String(index)"></TabPane> -->
        </Tabs>
      </div>
      <Form ref="supplierInfoForm" class="supplier-info-form" :label-width="100">
        <template v-if="supplierInfoList.length > 0">
          <!-- 供应商信息 -->
          <div style="margin-left: 20px">
            <div class="titleLeft titleFont">基本信息</div>
            <div style="border-top: 1px dashed #dddee1; margin: 5px 0"></div>
            <div style="margin-left: 20px">
              <Row>
                <Col :span="8">
                <FormItem label="供应商名称：">
                  {{
                    paySupplierList[supplierInfoListItem] &&
                    paySupplierList[supplierInfoListItem].supplierName
                  }}
                  <!-- {{ supplierIdArr[supplierInfoListItem].supplierName }} -->
                </FormItem>
                </Col>
                <Col :span="8">
                <FormItem label="申请人：">
                  {{ userName }}
                </FormItem>
                </Col>
                <Col :span="8">
                <FormItem label="支付方式：">
                  {{
                    paySupplierList[supplierInfoListItem] &&
                    paySupplierList[supplierInfoListItem].paymentTypeName
                  }}
                  <!-- {{ supplierInfoList[supplierInfoListItem].purchasePaymentInfo.paymentTypeName }} -->
                </FormItem>
                </Col>
              </Row>
              <Row>
                <Col :span="8">
                <FormItem label="开户行：">
                  <div v-for="(item, index) in bankArr" :key="index">
                    <div v-if="paySupplierList[supplierInfoListItem] &&
                      item.dataValue ==
                      paySupplierList[supplierInfoListItem].paymentBank
                      ">
                      {{ item.dataDesc }}
                    </div>
                    <!-- <div v-if="item.dataValue == supplierInfoList[supplierInfoListItem].purchasePaymentInfo.paymentBank">{{ item.dataDesc }}</div> -->
                  </div>
                </FormItem>
                </Col>
                <Col :span="8">
                <FormItem label="开户名：">
                  {{
                    paySupplierList[supplierInfoListItem] &&
                    paySupplierList[supplierInfoListItem].paymentAccountName
                  }}
                  <!-- {{ supplierInfoList[supplierInfoListItem].purchasePaymentInfo.paymentAccountName }} -->
                </FormItem>
                </Col>
                <Col :span="8">
                <FormItem label="账号：">
                  {{
                    paySupplierList[supplierInfoListItem] &&
                    paySupplierList[supplierInfoListItem].paymentAccount
                  }}
                  <!-- {{ supplierInfoList[supplierInfoListItem].purchasePaymentInfo.paymentAccount }} -->
                </FormItem>
                </Col>
              </Row>
              <Row>
                <Col :span="8">
                <FormItem label="未付款金额：">
                  {{ payAmountData }}
                </FormItem>
                </Col>
                <Col :span="8">
                <FormItem label="币种：">
                  {{
                    supplierInfoList[supplierInfoListItem].purchasePaymentInfo
                      .currency
                  }}
                </FormItem>
                </Col>
                <Col :span="8">
                <FormItem label="所属事业部：">
                  {{
                    supplierInfoList[supplierInfoListItem]
                      .purchasePaymentRelatedList[0].businessDeptName
                  }}
                </FormItem>
                </Col>
              </Row>
              <Row>
                <Col>
                <FormItem label="付款备注：">
                  <!-- <Input style="width:400px" v-model.trim="paySupplierList[supplierInfoListItem].paymentRemark" type="textarea" :rows="3" :maxlength="1000" v-if="paySupplierList[supplierInfoListItem] && paySupplierList[supplierInfoListItem].settlementRemark!=null"></Input> -->
                  <Input style="width: 400px" v-model.trim="supplierInfoList[supplierInfoListItem]
                        .purchasePaymentInfo.paymentRemark
                      " type="textarea" :rows="3" :maxlength="1000"></Input>
                </FormItem>
                </Col>
              </Row>
            </div>
            <div class="titleLeft titleFont">付款信息</div>
            <div style="border-top: 1px dashed #dddee1; margin: 5px 0"></div>
            <div style="margin-left: 40px">
              <Row>
                <Col :span="6">
                <FormItem label="结算方式：">
                  {{
                    supplierInfoList[supplierInfoListItem].purchasePaymentInfo
                      .settlementTypeName
                  }}
                </FormItem>
                </Col>
                <Col :span="18">
                <div>
                  提示：款到发货，本次申请付款金额=订单金额-退款金额-已付款-已申请付款；本次申请付款金额不能大于订单金额；
                </div>
                <div style="margin-left: 42px">
                  阿里账期，本次申请付款金额=订单金额-退款金额-已付款-已申请付款；本次申请付款金额不能大于订单金额；
                </div>
                <div style="margin-left: 42px">
                  线下账期，本次申请付款金额=订单金额-退款金额-已付款-已申请付款；本次申请付款金额不能大于（收库商品金额+运费）；
                </div>
                </Col>
              </Row>
              <!-- <Row>
                <Col :span="24">
                  <FormItem label="应付总额计算：">
                    <div style="display: flex">
                      <div>
                        <RadioGroup
                          v-model="
                            payAmountStatusList[supplierInfoListItem].status
                          "
                          @on-change="changeAmount"
                        >
                          <Radio :label="0">按下单金额</Radio>
                          <Radio :label="1" class="ml10">按收库上架金额</Radio>
                        </RadioGroup>
                      </div>
                      <div
                        style="
                          color: #ff0000;
                          display: block;
                          margin: 2px 0 0 15px;
                        "
                      >
                        {{
                          payAmountStatusList[supplierInfoListItem].status == 0
                            ? "按下单金额：以下单商品金额来计算应付总额"
                            : "按收库上架金额：以实际已收库上架商品金额来计算应付总额"
                        }}
                      </div>
                    </div>
                  </FormItem>
                </Col>
              </Row> -->
            </div>
            <div class="orderTable normalTop deleteLabelWidth"
              v-if="supplierInfoList[supplierInfoListItem] && supplierInfoList[supplierInfoListItem].purchasePaymentRelatedList">
              <Table highlight-row :border="true" :columns="supplierOrderColums"
                :data="supplierInfoList[supplierInfoListItem].purchasePaymentRelatedList">
                <template slot-scope="{ index }" slot="applyAmount">
                  <FormItem label="" :label-width="0" :prop="`supplierInfoList.${index}.applyAmount`"
                    :rules="tableValidate.applyAmount" class="table-form-item">
                    <Input
                      v-model.trim="supplierInfoList[supplierInfoListItem].purchasePaymentRelatedList[index].applyAmount"
                      placeholder="请输入申请金额" clearable @on-change="tableAmountChange($event, index)" />
                  </FormItem>
                </template>
              </Table>
            </div>
          </div>
        </template>
      </Form>
      <div slot="footer">
        <Button type="text" @click="showPayModal = false">取消</Button>
        <Button type="primary" @click="submitPayOrder">确定</Button>
      </div>
      <Spin fix v-if="model4Loading || payLoading"></Spin>
    </Modal>

    <!-- 申请退款 -->
    <Modal v-model="model4" title="申请退款" :mask-closable="false" width="1200" @on-visible-change="showPayModalChange"
      class-name="purchase-order-modal">
      <div class="supplierTabsBar commonFilter normalTop" v-if="paySupplierList.length != 1">
        <Tabs @on-click="showCurrentSupplierId" :value="supplierInfoListItem">
          <TabPane v-for="(item, index) in paySupplierList" :label="item.supplierName" :key="index" :name="String(index)">
          </TabPane>
          <!-- <TabPane v-for="(item, index) in supplierIdArr" :label="item.supplierName" :key="index" :name="String(index)"></TabPane> -->
        </Tabs>
      </div>
      <Form ref="supplierInfoList" :label-width="100">
        <template v-if="supplierInfoList.length > 0">
          <!-- 供应商信息 -->
          <div style="margin-left: 20px">
            <div class="titleLeft titleFont">基本信息</div>
            <div style="border-top: 1px dashed #dddee1; margin: 5px 0"></div>
            <div style="margin-left: 20px">
              <Row>
                <Col :span="8">
                <FormItem label="供应商名称：">
                  {{
                    paySupplierList[supplierInfoListItem] &&
                    paySupplierList[supplierInfoListItem].supplierName
                  }}
                  <!-- {{ supplierIdArr[supplierInfoListItem].supplierName }} -->
                </FormItem>
                </Col>
                <Col :span="8">
                <FormItem label="申请人：">
                  {{ userName }}
                </FormItem>
                </Col>
                <Col :span="8">
                <FormItem label="支付方式：">
                  {{
                    paySupplierList[supplierInfoListItem] &&
                    paySupplierList[supplierInfoListItem].paymentTypeName
                  }}
                  <!-- {{ supplierInfoList[supplierInfoListItem].purchasePaymentInfo.paymentTypeName }} -->
                </FormItem>
                </Col>
              </Row>
              <Row>
                <Col :span="8">
                <FormItem label="开户行：">
                  <div v-for="(item, index) in bankArr" :key="index">
                    <div v-if="paySupplierList[supplierInfoListItem] &&
                      item.dataValue ==
                      paySupplierList[supplierInfoListItem].paymentBank
                      ">
                      {{ item.dataDesc }}
                    </div>
                    <!-- <div v-if="item.dataValue == supplierInfoList[supplierInfoListItem].purchasePaymentInfo.paymentBank">{{ item.dataDesc }}</div> -->
                  </div>
                </FormItem>
                </Col>
                <Col :span="8">
                <FormItem label="开户名：">
                  {{
                    paySupplierList[supplierInfoListItem] &&
                    paySupplierList[supplierInfoListItem].paymentAccountName
                  }}
                  <!-- {{ supplierInfoList[supplierInfoListItem].purchasePaymentInfo.paymentAccountName }} -->
                </FormItem>
                </Col>
                <Col :span="8">
                <FormItem label="账号：">
                  {{
                    paySupplierList[supplierInfoListItem] &&
                    paySupplierList[supplierInfoListItem].paymentAccount
                  }}
                  <!-- {{ supplierInfoList[supplierInfoListItem].purchasePaymentInfo.paymentAccount }} -->
                </FormItem>
                </Col>
              </Row>
              <Row>
                <Col :span="8">
                <FormItem label="未付款金额：">
                  {{ payAmountData }}
                </FormItem>
                </Col>
                <Col :span="8">
                <FormItem label="币种：">
                  {{
                    supplierInfoList[supplierInfoListItem].purchasePaymentInfo
                      .currency
                  }}
                </FormItem>
                </Col>
                <Col :span="8">
                <FormItem label="所属事业部：">
                  {{
                    supplierInfoList[supplierInfoListItem]
                      .purchasePaymentRelatedList[0].businessDeptName
                  }}
                </FormItem>
                </Col>
              </Row>
            </div>
            <div class="titleLeft titleFont">付款信息</div>
            <div style="border-top: 1px dashed #dddee1; margin: 5px 0"></div>
            <div style="margin-left: 40px">
              <Row>
                <Col :span="6">
                <FormItem label="结算方式：">
                  {{
                    supplierInfoList[supplierInfoListItem].purchasePaymentInfo
                      .settlementTypeName
                  }}
                </FormItem>
                </Col>
                <Col :span="18">
                <div>
                  提示：款到发货，填写采购单确认的退款金额，并提供退款截图；
                </div>
                <div style="margin-left: 42px">
                  阿里账期，填写与阿里账期退款一致的金额，并提供成功退款截图；
                </div>
                <div style="margin-left: 42px">
                  线下账期，填写与供应商对账后冲账的退款金额，并提供与供应商对账确认退款截图；
                </div>
                </Col>
              </Row>
              <!-- <Row>
                <Col :span="24">
                  <FormItem label="应付总额计算：">
                    <div style="display: flex">
                      <div>
                        <RadioGroup
                          v-model="
                            payAmountStatusList[supplierInfoListItem].status
                          "
                          @on-change="changeAmount"
                        >
                          <Radio :label="0">按下单金额</Radio>
                          <Radio :label="1" class="ml10">按收库上架金额</Radio>
                        </RadioGroup>
                      </div>
                      <div
                        style="
                          color: #ff0000;
                          display: block;
                          margin: 2px 0 0 15px;
                        "
                      >
                        {{
                          payAmountStatusList[supplierInfoListItem].status == 0
                            ? "按下单金额：以下单商品金额来计算应付总额"
                            : "按收库上架金额：以实际已收库上架商品金额来计算应付总额"
                        }}
                      </div>
                    </div>
                  </FormItem>
                </Col>
              </Row> -->
            </div>
            <div class="orderTable normalTop deleteLabelWidth">
              <Table highlight-row :border="true" :columns="supplierOrderColums1" :data="supplierInfoList[supplierInfoListItem]
                .purchasePaymentRelatedList
                ">
              </Table>

              <div style="display: flex; align-items: center" class="mt10">
                <span style="font-size: 12px; margin-right: 15px">退款凭证：</span>
                <div class="demo-upload-list" v-for="(item, index) in supplierInfoList[supplierInfoListItem]
                  .purchasePaymentInfo.relatedImageList" :key="index">
                  <template>
                    <!-- <Icon
                      type="md-close"
                      @click.native="handleRemove(index)"
                      style="
                        color: red;
                        position: absolute;
                        top: 0px;
                        right: 0px;
                        cursor: pointer;
                        z-index: 99999999;
                      "
                    ></Icon> -->
                    <largePicture :url="item" imageHigh="60px" ref="largePicture">
                      <slot name="picslot"></slot>
                    </largePicture>
                    <div class="demo-upload-list-cover">
                      <Icon type="ios-eye-outline" @click.native="handleView(index)"></Icon>
                      <Icon type="ios-trash-outline" @click.native="handleRemove(item)"></Icon>
                    </div>
                  </template>
                </div>
                <pictureList ref="pictureList" @updatePicture="updatePicture" class="mt10"></pictureList>
              </div>
              <div class="mt10">
                <Form ref="formValidate" :model="supplierInfoList[supplierInfoListItem].purchasePaymentInfo
                  " :label-width="75" :rules="markRules">
                  <FormItem label="退款备注：" prop="paymentRemark">
                    <Input style="width: 400px" v-model.trim="supplierInfoList[supplierInfoListItem]
                        .purchasePaymentInfo.paymentRemark
                      " type="textarea" :rows="3" :maxlength="1000"></Input>
                  </FormItem>
                </Form>
                <!-- <span>退款备注：</span>
                <Input
                  style="width: 400px"
                  v-model.trim="
                    supplierInfoList[supplierInfoListItem].purchasePaymentInfo
                      .paymentRemark
                  "
                  type="textarea"
                  :rows="3"
                  :maxlength="1000"
                ></Input> -->
              </div>
            </div>
          </div>
        </template>
      </Form>
      <div slot="footer">
        <Button type="text" @click="model4 = false">取消</Button>
        <Button type="primary" @click="submitRefundOrder">确定</Button>
      </div>
      <Spin fix v-if="payLoading"></Spin>
    </Modal>

    <Modal v-model="model2" title="温馨提示">
      <p>您是否需要在表格中导出产品图片？</p>
      <RadioGroup v-model="exportImgSetting">
        <Radio :label="0">不导出图片</Radio>
        <Radio :label="1">导出图片</Radio>
      </RadioGroup>
      <div slot="footer">
        <Button type="text" @click="model2 = false">取消</Button>
        <Button type="primary" @click="exportHasImg">导出</Button>
      </div>
    </Modal>

    <Modal v-model="model3" title="操作提示" width="600px">
      <div class="purchaseVoidModal">
        <div>
          <Icon type="md-alert" class="mr10 iconAlert" />
        </div>
        <div v-if="voidPurchaseNumber">
          确认是否要作废采购单：
          <span style="color: orange">{{ voidPurchaseNumber }}</span>
        </div>
        <div v-else>
          <span>确认是否要{{ showModalName }}采购单，数量：</span>
          <span style="color: orange">{{ selectionArr.length }}</span>
        </div>
      </div>
      <!-- <div class="btnWarningTips" style="width:420px;margin: 20px;padding:5px" v-if="showModalType == 4 || showModalType == 1 ">提示：已下单的采购单，所有SKU都是已取消状态，才允许作废</div> -->
      <div class="btnWarningTips" style="width: 420px; margin: 20px; padding: 5px" v-if="showModalType == 2">
        提示：已下单的采购单，所有SKU都是已取消状态，才允许作废
      </div>
      <div class="btnWarningTips" style="width: 420px; margin: 20px; padding: 5px" v-else-if="showModalType == 5">
        提示：取消采购单后，返回采购需求管理，在1688系统已经下单，如需取消，请前往1688进行取消订单
      </div>

      <div slot="footer">
        <Button type="text" @click="cancelModal">取消</Button>
        <Button type="primary" @click="submitModal">确定</Button>
      </div>
    </Modal>

    <order-forsupply :dialogObj.sync="dialogObj" @search="search"></order-forsupply>
    <!-- 查看采购单详情 -->
    <!-- <purchase-detail :dialogObj="dialogDetail"></purchase-detail> -->
    <!-- 导出图片询问 -->
    <export-dialog :dialogObj="dialogExport" @dialogExportReturn="dialogExportReturn"></export-dialog>
    <!-- 入库单详情 -->
    <warehouse-order-detail :dialogObj="dialogWare" :isVisible.sync="isVisible"></warehouse-order-detail>
  </div>
</template>

<style scoped>
.spaceBetween {
  margin-bottom: 10px;
}

.spaceBetween .tagsSelectFooter {
  border-top: 1px solid #e8e8e8;
  margin-top: 5px;
}

.spaceBetween .tagsSelectFooter button {
  margin-top: 5px;
  margin-right: 5px;
}

::v-deep .ivu-form-item-error-tip {
  left: 73px;
}
</style>

<script>
import api from "@/api/api";
// import common from '@/assets/common.js';
import pagemixin from "@/components/mixin/page_mixin";

import Mixin from "@/components/mixin/common_mixin";
import tableMixin from "@/components/mixin/table_mixin";
import addPurchaseOrder from "./common/addPurchaseOrder";
import showOrder from "./common/showOrder";
import { getAllUser } from "@/utils/index";
import exportDialog from "@/components/exportDialog";
import filterColumns from "@/components/common/filterColumns";
import orderForsupply from "./purchaseOrder/orderForsupply";
import PurchaseDetail from "../supplyOrder/purchaseDetail.vue";
import warehouseOrderDetail from "../supplyOrder/warehouseOrderDetail.vue";
import { alibabaList } from "../supplyOrder/configFile";
import { fun_date } from "@/utils/comfun.js";
import pictureList from "./common/pictureList.vue";
import { Promise } from "q";
// import Icon from '../../../../components/localComponents/d-Table/relation/icon';
import largePicture from "@/components/largePicture";

export default {
  mixins: [Mixin, tableMixin, pagemixin],
  components: {
    addPurchaseOrder,
    showOrder,
    filterColumns,
    orderForsupply,
    PurchaseDetail,
    exportDialog,
    warehouseOrderDetail,
    pictureList,
    largePicture,
  },
  data() {
    let self = this;
    let end = new Date(
      new Date(new Date().toLocaleDateString()).getTime() +
      24 * 60 * 60 * 1000 -
      1
    );
    let start = new Date(new Date(new Date().toLocaleDateString()).getTime());
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
    return {
      // 排序的数据
      filterName: "purchaseColumn_0",
      sampleColumns: [],
      statusText: "提交",
      isHaandExceed: false,
      isDisabledExceed: false,
      sortData: [
        {
          label: "下单时间",
          value: "order",
          checked: true,
          toogle: true,
        },
        {
          label: "创建时间",
          value: "create",
          checked: false,
          toogle: true,
        } /*,        { label: this.t('inWareManage.baseWare'), value: 'WS', checked: false, toogle: true } */,
      ],
      clearAble: true,
      purchaseIds: [], // 当前操作的purchaseId
      model2: false,
      model3: false,
      showModalType: "",
      showModalName: "",
      exportType: null,
      exportImgSetting: 0,
      isVisible: false,
      columns1: [
        {
          title: "批次号",
          align: "center",
          key: "receiveBatchNumber",
        },
        {
          title: "产品SKU",
          align: "center",
          key: "goodsSku",
        },
        {
          title: "商品名称",
          align: "center",
          key: "productName",
        },
        {
          title: "收货数量",
          align: "center",
          key: "receiveQuantity",
        },
        {
          title: "收货时间",
          align: "center",
          width: 160,
          key: "receiveTime",
          render: (h, params) => {
            return h(
              "span",
              self.getDataToLocalTime(params.row.receiveTime, "fulltime")
            );
          },
        },
        {
          title: "收货人",
          align: "center",
          key: "receiveBy",
          render(h, params) {
            return h(
              "span",
              self.$store.state.allUser[params.row.receiveBy].userName
            );
          },
        },
      ],
      supplierOrderColums: [
        {
          key: "purchaseNumber",
          align: "center",
          title: "采购单号",
        },
        {
          key: "totalPrice",
          align: "center",
          title: "下单商品金额",
        },
        {
          key: "sumOvershootPrice",
          align: "center",
          title: "超发商品金额",
        },
        {
          key: "freightCharge",
          align: "center",
          title: "运费",
        },
        {
          key: "discountAmount",
          align: "center",
          title: "优惠金额",
        },

        {
          key: "totalAmount",
          align: "center", // title: '应付总额',
          renderHeader: (h) => {
            return h("div", [
              h(
                "span",
                {
                  style: { marginRight: "10px" },
                },
                "订单金额"
              ) /*  h('Checkbox', {
                props: {
                  value: ''
                },
                on: {
                  'on-change': (value) => {
                    if (value) {
                      self.GetTotalNumber();
                    } else {
                      self.applyPayment();
                    }
                  }
                }
              }, '已收库金额') */,
            ]);
          },
          // render: (h, params) => {
          //   return h("InputNumber", {
          //     style: { width: "80px" },
          //     props: {
          //       value:
          //         self.supplierInfoList[self.supplierInfoListItem]
          //           .purchasePaymentRelatedList[params.index].totalAmount, // value: params.row.totalAmount,
          //       min: 0,
          //       step: 0.01,
          //       disabled: true,
          //     },
          //     on: {
          //       "on-change": (value) => {
          //         self.supplierInfoList[
          //           self.supplierInfoListItem
          //         ].purchasePaymentRelatedList[params.index].totalAmount =
          //           value;
          //       },
          //     },
          //   });
          // },
        },
        {
          key: "refundAmountDisplay",
          align: "center",
          title: "退款金额",
          renderHeader: (h, params) => {
            return h(
              "Tooltip",
              {
                props: {
                  content: "已退款+已申请退款",
                  placement: "top",
                  transfer: true,
                },
              },
              [h("span", { style: { color: "green" } }, "退款金额")]
            );
          },
        },
        {
          key: "shelvesTotalprice",
          align: "center",
          title: "收库商品金额",
          renderHeader: (h, params) => {
            return h(
              "Tooltip",
              {
                props: {
                  content: "实际已收库上架商品金额",
                  placement: "top",
                  transfer: true,
                },
              },
              [h("span", { style: { color: "green" } }, "收库商品金额")]
            );
          },
        },
        {
          key: "receiptAmount",
          align: "center",
          title: "收库金额",
          renderHeader: (h, params) => {
            return h(
              "Tooltip",
              {
                props: {
                  content: "收库商品金额+运费-优惠",
                  placement: "top",
                  transfer: true,
                },
              },
              [h("span", { style: { color: "green" } }, "收库金额")]
            );
          },
        },
        {
          key: "paidAmount",
          align: "center",
          title: "已付款",
        },
        {
          key: "waitPayAmount",
          align: "center",
          title: "已申请待支付",
        },
        {
          slot: "applyAmount",
          align: "center",
          title: "本次申请金额"
        },
      ],
      supplierOrderColums1: [
        {
          key: "purchaseNumber",
          align: "center",
          title: "采购单号",
        },
        {
          key: "totalPrice",
          align: "center",
          title: "下单商品金额",
        },
        {
          key: "sumOvershootPrice",
          align: "center",
          title: "超发商品金额",
        },
        {
          key: "freightCharge",
          align: "center",
          title: "运费",
        },
        {
          key: "discountAmount",
          align: "center",
          title: "优惠金额",
        },

        {
          key: "totalAmount",
          align: "center", // title: '应付总额',
          renderHeader: (h) => {
            return h("div", [
              h(
                "span",
                {
                  style: { marginRight: "10px" },
                },
                "订单金额"
              ) /*  h('Checkbox', {
                props: {
                  value: ''
                },
                on: {
                  'on-change': (value) => {
                    if (value) {
                      self.GetTotalNumber();
                    } else {
                      self.applyPayment();
                    }
                  }
                }
              }, '已收库金额') */,
            ]);
          },
          // render: (h, params) => {
          //   return h("InputNumber", {
          //     style: { width: "80px" },
          //     props: {
          //       value:
          //         self.supplierInfoList[self.supplierInfoListItem]
          //           .purchasePaymentRelatedList[params.index].totalAmount, // value: params.row.totalAmount,
          //       min: 0,
          //       step: 0.01,
          //       disabled: true,
          //     },
          //     on: {
          //       "on-change": (value) => {
          //         self.supplierInfoList[
          //           self.supplierInfoListItem
          //         ].purchasePaymentRelatedList[params.index].totalAmount =
          //           value;
          //       },
          //     },
          //   });
          // },
        },

        {
          key: "shelvesTotalprice",
          align: "center",
          title: "收库商品金额",
          renderHeader: (h, params) => {
            return h(
              "Tooltip",
              {
                props: {
                  content: "实际已收库上架商品金额",
                  placement: "top",
                  transfer: true,
                },
              },
              [h("span", { style: { color: "green" } }, "收库商品金额")]
            );
          },
        },
        {
          key: "receiptAmount",
          align: "center",
          title: "收库金额",
          renderHeader: (h, params) => {
            return h(
              "Tooltip",
              {
                props: {
                  content: "收库商品金额+运费-优惠",
                  placement: "top",
                  transfer: true,
                },
              },
              [h("span", { style: { color: "green" } }, "收库金额")]
            );
          },
        },
        {
          key: "refundableAmount",
          align: "center",
          title: "应退金额",
          renderHeader: (h, params) => {
            return h(
              "Tooltip",
              {
                props: {
                  content: "应退金额=订单金额-收库金额",
                  placement: "top",
                  transfer: true,
                },
              },
              [h("span", { style: { color: "green" } }, "应退金额")]
            );
          },
        },
        {
          key: "refundAmount",
          align: "center",
          title: "已退款",
        },
        {
          key: "waitRefundAmount",
          align: "center",
          title: "已申请退款",
        },
        {
          key: "applyRefundAmount",
          align: "center",
          title: "本次申请退款",
          render: (h, params) => {
            return h("InputNumber", {
              style: { width: "80px", textAlign: "center" },
              props: {
                value:
                  self.supplierInfoList[self.supplierInfoListItem]
                    .purchasePaymentRelatedList[params.index].applyRefundAmount, //
                min: 0,
                step: 0.01,
              },
              on: {
                "on-change": (value) => {
                  self.supplierInfoList[
                    self.supplierInfoListItem
                  ].purchasePaymentRelatedList[params.index].applyRefundAmount =
                    value;
                  let totalPay = 0;
                  self.supplierInfoList[
                    self.supplierInfoListItem
                  ].purchasePaymentRelatedList.forEach((item) => {
                    if (!self.$common.isEmpty(item.applyRefundAmount) && !self.$common.isEmpty(Number(item.applyRefundAmount))) {
                      totalPay += Number(item.applyRefundAmount);
                    }
                  });
                  self.supplierInfoList[self.supplierInfoListItem].purchasePaymentInfo.payAmount = totalPay.toFixed(2);
                },
              },
            });
          },
        },
      ],
      data1: [],
      supplierInfoListItem: "0", // 付款申请当前显示数据列表下标，默认第一个
      supplierInfoList: [], // 付款申请当前显示数据列表
      tableValidate: {
        applyAmount: [
          { required: true, validator: this.validatorApplyAmount, min: 0, msg: '请输入不小于0的数字', trigger: 'change' },
          // { required: true, validator: this.validatorApplyAmount, min: 0, msg: '请输入不小于0的数字', trigger: 'blur' },
        ]
      },
      payLoading: false,
      bankArr: [], //
      model1: false,
      showPayModal: false,
      purchaseShow: "purchaseOrder",
      pageParamsStatus: false,
      tableHeight: self.getTableHeight(335),
      purchaseOrderId: "", // 提交成功后返回的采购Id
      totalPage: 0,
      total: 0,
      voidPurchaseNumber: null, //单个作废的采购单号
      curPage: 1,
      currentTabItem: "4", // 标签页
      planCurrentTabItem: null, // 备货计划标签页
      planTabItems: [], //
      orderSource: "2", // '2':从采购单管理添加订单
      orderType: "1", // 1: 新增；2：提交；3：审核；4：向供应商下单
      showType: "", // 1: 查看，2：编辑
      operationType: "",
      payAmountStatusList: [],
      payAmountStatus: 0,
      isShowExportExcel: false, // 导出excel
      isShowRelatedPlan: false, // 相关备货计划
      isShowTips: false,
      importExcel: false, // 导入物流信息
      batchImport: api.purchaseImport, // 导入EXCEL
      uploadList: [],
      alibabaList,
      setTagListStatus: false,
      pageParams: {
        upDown: "down",
        orderBy: "order",
        status: "4",
        type: null, // 1688状态
        overshootStateList: [], // 允许超发
        receiptStatusList: [], // 入库单状态
        abnormalStatus: null, // 收货异常状态
        arrivalEndTime: null, // 到货结束时间
        arrivalStartTime: null, // 到货开始时间
        externalSerialNo: "", // 外部流水号
        orderEndTime: null, // 下单结束时间
        orderStartTime: null, // 下单开始时间
        startCreateTime: null, // 创建开始时间
        endCreateTime: null, // 创建结束时间
        endShelveTimeStart: null, // 上架时间开始时间
        endShelveTimeEnd: null, // 上架时间结束时间
        warehouseId: null, // 仓库
        pageNum: 1,
        pageSize: 50,
        settlementType: "", // 结算方式
        planSerialNumber: "", // 备货计划编号
        sku: "", // sku编号
        purchaseAccountId: "", // 采购帐号ID
        purchaseNumber: "", // 采购单号
        purchaserId: "", // 采购人ID
        qualityStatus: null, // 质检状态
        receivedStatus: null, // 到货状态(1未全部到货,2等待到货,3部分到货等待剩余,4部分到货不等待剩余,5全部到货)
        trackingNumber: "", // 物流跟踪号
        payStatus: null, // 付款状态
        purchaseNumberList: [],
        SkuNoList: null,
        tagNames: [],
        orderNoList: [],
        spuList: [],
        skuList: [],
        planSerialNumberList: [],
        alibabaAccountType: "",
        businessDeptIds: null,
        check: null, //质检类型
        refundStatus: "", //退款状态
        businessDeptIdList: [],
        receivingSituation: null,
      }, //
      tagsList: [],
      tagIdList: [],
      payStatusArr: [
        {
          label: "未申请付款",
          value: 1,
        },
        {
          label: "已申请付款",
          value: 2,
        },
        {
          label: "已取消付款",
          value: 3,
        },
        {
          label: "部分付款",
          value: 4,
        },
        {
          label: "已付款",
          value: 5,
        },
      ],
      //退款状态
      refundTypeArr: [
        {
          label: "未申请退款",
          value: 0,
        },
        {
          label: "已申请退款",
          value: 1,
        },
        {
          label: "已取消退款",
          value: 2,
        },
        {
          label: "部分退款",
          value: 3,
        },
        {
          label: "已退款",
          value: 4,
        },
      ],
      tabItems: [
        {
          key: "0",
          value: "全部",
        },
        {
          key: "1",
          value: "待提交",
        },
        {
          key: "2",
          value: "待审核",
        },
        {
          key: "3",
          value: "待下单",
        },
        {
          key: "4",
          value: "已下单",
        },
        {
          key: "5",
          value: "已作废",
        },
      ],
      selectionArr: [], // 已选中表格行数据
      supplierIdArr: [], // 供应商数组
      ordersData: [], // 主table
      timeType: "",
      timeTypeArr: [
        { value: "创建时间", key: "4", start: 'startCreateTime', end: 'endCreateTime' },
        { value: "下单时间", key: "1", start: 'orderStartTime', end: 'orderEndTime' },
        { value: "收货时间", key: "2", start: 'arrivalStartTime', end: 'arrivalEndTime' },
        { value: "上架时间", key: "5", start: 'endShelveTimeStart', end: 'endShelveTimeEnd' },
        { value: "预计付款日期", key: "3", start: 'starPlanPayDate', end: 'endPlanPayDate'},
      ],
      pickData: [start, end],
      settlementTypeArr: [],
      purchaserArr: [], // 采购人员
      supplierArr: [], // 供应商
      warehouseArr: [], // 仓库
      purchaseWarehouseArr: [], // 采购仓库
      purchase1688Arr: [
        // 1688采购
        {
          value: "是",
          key: 1,
        },
        {
          value: "否",
          key: 0,
        },
      ],
      arrivalStatusArr: [
        /* {
          value: '全部状态',
          key: -1
        },  */ {
          label: "入库单创建",
          value: 0,
        },
        {
          label: "入库单取消",
          value: 1,
        },
        {
          label: "入库单关闭",
          value: 2,
        },
        {
          label: "收货中",
          value: 3,
        },
      ], // 到货状态
      abnormalStatusArr: [
        {
          value: "全部",
          code: -1,
        },
        {
          value: "部分收货",
          code: 2,
        },
        {
          value: "超量收货",
          code: 3,
        },
        {
          value: "无源入库",
          code: 1,
        },
      ],
      statuStyle: {
        primary: {
          color: "#2D8CF0",
          backgroundColor: "rgba(45, 140, 240, .1)",
        },
        error: { color: "#EB2F96", backgroundColor: "rgba(235, 47, 150, .1)" },
        success: { color: "#3CB034", backgroundColor: "rgba(60, 176, 52, .1)" },
        warnning: {
          color: "#FF9E20",
          backgroundColor: "rgba(255, 158, 32, .1)",
        },
        info: { color: "#5D7092", backgroundColor: "rgba(93, 112, 146, 0.1)" },
        textRed: { color: "red", backgroundColor: "rgba(235, 47, 150, .1)" },
        textBlack: {
          color: "black",
          backgroundColor: "rgba(255, 215, 0, 0.8)",
        },
      },
      //备货类型
      stockTypeArr: [
        {
          label: "急采",
          value: 0,
        },
        {
          label: "普通备货",
          value: 1,
        },
        {
          label: "海外仓备货",
          value: 2,
        },
        {
          label: "FBA备货",
          value: 3,
        },
        {
          label: "全托管备货",
          value: 4,
        },
        {
          label: "直发备货",
          value: 5,
        },
      ],
      //采购单状态
      purchaseStatusList: [
        { value: 1, label: "待提交" },
        { value: 2, label: "待审核" },
        { value: 3, label: "待下单" },
        { value: 4, label: "已下单" },
        { value: 5, label: "已作废" },
        { value: 6, label: "采购作废" },
        { value: 7, label: "已关闭" },
      ],
      qualityStatusArr: [], // 质检状态
      settlementMethodArr: [], // 结算方式
      numberValue: "",
      numberType: "2",
      numberTypeArr: [
        {
          value: "备货计划编号",
          key: "2",
        },
        {
          value: "跟踪号",
          key: "3",
        },
        {
          value: "外部流水号",
          key: "4",
        },
        {
          value: "采购单号",
          key: "5",
        },
        {
          value: "SKU",
          key: "6",
        },
      ],
      exportObj: {
        isExportPic: "",
        picType: "",
      },
      orderColumn: [],
      orderData: {},
      initData: {},
      newOrderData: {
        arrivalTime: "",
        createdBy: "",
        buyerMessage: "",
        createdTime: "",
        currency: "",
        deleteDetailsIdList: [],
        deliveryAddress: "",
        detailsResultList: [],
        discountAmount: 0,
        externalSerialNo: "",
        freightCharge: 0,
        orderTime: "",
        paymentStatus: null,
        purchaseAccountId: "",
        purchaseId: "",
        purchaseNumber: "",
        purchaseStatus: null,
        purchaseWarehouseId: "",
        isDeliveryPay: false, // 是否到付
        purchaserId: "",
        qualityStatus: null,
        receivedStatus: null,
        remark: "",
        settleTypeName: "",
        settlementType: "",
        shippingType: "",
        source: null,
        status: null,
        submitDetailsIdList: [],
        supplierId: null,
        supplierName: "",
        totalAmount: null,
        totalPrice: null,
        trackingNumber: "",
        transStatus: null,
        type: null,
        updateQuoteFlag: false,
        updateSupplierFlag: false,
      },
      dialogExport: {
        modelVisible: false,
        data: {},
      },
      dialogWare: {
        data: {},
      },
      planColumns: [
        {
          type: "index",
          width: 70,
          title: "序号",
          align: "center",
        },
        {
          title: "备货计划编号",
          align: "center",
          key: "planSerialNumber",
        },
        {
          title: "备货计划创建时间",
          align: "center",
          key: "createdTime",
          render: (h, params) => {
            return h(
              "span",
              this.getDataToLocalTime(params.row.createdTime, "fulltime", true)
            );
          },
        },
      ],
      planData: [],
      warehouse: {
        transWarehouse: "",
      },
      editType: "",
      time1: null,
      cacheClickVal: "order",
      exportBatchOrSingle: "batch",
      purchaseOrderIds: null,
      statusList: [
        {
          value: "4",
          text: "采购中",
        },
        {
          value: "6",
          text: "已作废",
        },
        {
          value: "7",
          text: "已关闭",
        },
      ],
      dialogObj: {
        modelVisible: false,
        title: "",
        list: {},
      },
      dialogDetail: {
        modelVisible: false,
        data: {},
        supplyList: {},
      },
      paySupplierList: [],
      model4: false,
      businessDeptInfoList: [],
      markRules: {
        paymentRemark: [
          {
            type: "string",
            max: 200,
            message: "字符数不能超过两百个字符",
            trigger: "blur",
          },
        ],
      },
      model4Loading: false
    };
  },
  watch: {
    pageParamsStatus(n) {
      let v = this;
      if (n) {
        v.$nextTick(() => {
          v.getList();
          v.pageParamsStatus = false;
        });
      }
    },
    currentTabItem(n) {
      if (n) {
        this.filterName = "purchaseColumn_" + n;
        this.getColumns();
      }
    },
    showPayModal(n) {
      if (n) {
        let temp = {
          status: null,
        };
        for (let i = 0; i < this.supplierInfoList.length; i++) {
          this.payAmountStatusList.push(temp);
        }
        this.payAmountStatusList[0].status =
          this.supplierInfoList[0].purchasePaymentInfo.settlementTypeName ==
            "款到发货"
            ? 0
            : 1;
        if (this.payAmountStatusList[0].status) {
          this.changeAmount();
        }
      }
    },
    model4(n) {
      if (n) {
        let temp = {
          status: null,
        };
        for (let i = 0; i < this.supplierInfoList.length; i++) {
          this.payAmountStatusList.push(temp);
        }
        this.payAmountStatusList[0].status =
          this.supplierInfoList[0].purchasePaymentInfo.settlementTypeName ==
            "款到发货"
            ? 0
            : 1;
        if (this.payAmountStatusList[0].status) {
          this.changeAmount();
        }
      }
    },
    ordersData(n) {
      if (n && this.pickData.length != 0) {
        let parseTime1 = Date.parse(this.pickData[1].slice(0, -3));
        this.ordersData.forEach((k) => {
          let created = Date.parse(this.getDataToLocalTime(k.createdTime, "fulltime", true));
          let order = Date.parse(this.getDataToLocalTime(k.orderTime, "fulltime", true));
          let arrival = Date.parse(this.getDataToLocalTime(k.arrivalTime, "fulltime", true));
          if (this.timeType == 4 && k.createdTime) {
            if (created > parseTime1) {
              this.ordersData.splice(k, 1);
            }
          } else if (this.timeType == 1 && k.orderTime) {
            if (order > parseTime1) {
              this.ordersData.splice(k, 1);
            }
          } else if (this.timeType == 2 && k.arrivalTime) {
            if (arrival > parseTime1) {
              this.ordersData.splice(k, 1);
            }
          }
        });
      }
    },
  },
  computed: {
    payAmountData() {
      //供应商名称为*屏蔽掉
      if (this.paySupplierList[this.supplierInfoListItem] && this.paySupplierList[this.supplierInfoListItem].supplierName) {
        if (this.paySupplierList[this.supplierInfoListItem].supplierName == "*") {
          return "*";
        }
      }
      if (this.$common.isEmpty(this.supplierInfoList[this.supplierInfoListItem])) {
        return 0;
      }
      if (this.$common.isEmpty(this.supplierInfoList[this.supplierInfoListItem].purchasePaymentRelatedList)) {
        return 0;
      }
      return this.supplierInfoList[this.supplierInfoListItem].purchasePaymentRelatedList.reduce((i, obj1) => {
        return this.$common.isEmpty(Number(obj1.applyAmount)) ? i : i + Number(obj1.applyAmount);
      }, 0);
    },
    userName() {
      return (
        this.$store.state.userName || sessionStorage.getItem("userName") || ""
      );
    },
    authUserInfo() {
      return this.$store.getters["authUserInfo"];
    },
    // 是否展示 批量结束超发 按钮
    isShowExceed() {
      return ['4'].includes(this.currentTabItem) && this.getPermission('purchase_endOvershoot')
    }
  },
  created() {
    this.initData = JSON.parse(JSON.stringify(this.newOrderData));
    this.pageParams.pageSize = this.getPageSizeCache();
    this.getColumns();
    this.getAllWarehouse();
    this.GetProductLabelData();
  },
  mounted() {
    this.uploadList = this.$refs.import.fileList;
    this.$refs.filterColumns.init();
    this.getBusinessDeptInfo();
  },
  activated() {
    this.purchaseShow = "purchaseOrder";
    this.reset();
    this.intiBaseDataList();
    this.startLoading();
  },
  methods: {
    setTableColumns(data) {
      this.$nextTick(() => {
        this.orderColumn = data;
      });
    },
    clickDrop(value) {
      this.exportType = value;
      this.exportBatchOrSingle = "batch"; // 批量导出标识
      if (value == 0 || value == 1) {
        this.model2 = true;
      } else {
        this.dialogExport.modelVisible = true;
        this.dialogExport.type = value;
        this.dialogExport.purExpType = 0;
        if (value == 2) {
          this.dialogExport.title = "导出选中";
        } else if (value == 3) {
          this.dialogExport.title = "导出所有";
        }
      }
    },

    dialogExportReturn(type) {
      //exportType: 导出 下拉框的3个选项；type： 0--不导出图片，1--导出
      if (this.exportBatchOrSingle == "batch") {
        this.exportType == 2 ? this.partExport(type) : this.allExport(type);
      } else {
        //导出明细
        this.batchExport({
          purchaseIds: this.purchaseIds,
          isExportImage: type,
          // isExportImage: this.exportImgSetting
        });
      }
      this.dialogExport.purExpType = null;
    },

    partExport(type) {
      // 导出excel 选中
      let purchaseIds = this.selectionArr.map((k) => {
        return k.purchaseId;
      });
      let temp = {
        businessDeptIds: this.authUserInfo.securityUser.businessDeptIds,
        purchaseIds,
      };
      if (this.selectionArr.length === 0) {
        this.$Message.error("未选择数据");
        return;
      }
      this.axios
        .post(api.export_exportPurchaseByIds, temp)
        .then((res) => {
          if (res.data.code === 0) {
            this.$Message.success("导出成功");
            this.pageParamsStatus = true;
          }
        })
        .catch(() => { });
    },

    allExport(type) {
      // 导出excel 全部
      if (this.ordersData.length == 0) {
        this.$Message.error("无数据导出");
      } else {
        let params = this.getParams();
        this.axios.post(api.export_exportPurchase, params).then((res) => {
          if (res.data.code === 0) {
            this.$Message.success("导出成功");
          }
        }).catch(() => { });
      }
    },

    exportHasImg() {
      if (this.exportBatchOrSingle === "batch") {
        this.exportMt();
      } else if (this.exportBatchOrSingle === "single") {
        this.batchExport({
          purchaseIds: this.purchaseIds,
          isExportImage: this.exportImgSetting,
        });
      }
    },
    exportMt() {
      let v = this;
      let value = v.exportType;
      if (value === "0") {
        // 选中导出
        if (v.selectionArr.length === 0) {
          v.$Message.error("未选择数据");
          return;
        }
        let purchaseIds = this.selectionArr.map((i) => i.purchaseId);
        v.batchExport({
          purchaseIds: purchaseIds,
          isExportImage: v.exportImgSetting,
        });
      } else {
        // 所有导出
        v.exportEcxel();
      }
    },
    batchExport(purchaseIds) {
      /**
       * params
       * purchaseIds 采购单id
       * */
      let v = this;
      //增加事业部id
      purchaseIds.businessDeptIds =
        this.authUserInfo.securityUser.businessDeptIds;
      // 选中导出
      v.axios
        .post(api.export_purchaseByIds, purchaseIds)
        .then((response) => {
          if (response.data.code === 0) {
            v.$Message.success("导出成功");
            v.selectionArr = [];
            v.pageParamsStatus = true; // 刷新list
            this.model2 = false;
            // window.location.href = v.$store.state.imgUrl + response.data.datas;
          }
        })
        .catch(() => { });
    },
    startLoading() {
      this.$Loading.start();
      this.getList();
      this.getbankArr();
      getAllUser();
    },
    //
    getParams() {
      let params = this.deepCopy(this.pageParams);
      params.purchaseNumberList = params.orderNoList;
      delete params.SkuNoList;
      delete params.orderNoList;
      // 已下单
      if (this.currentTabItem === "4") {
        params.status = Number(this.pageParams.status);
      } else if (this.currentTabItem === "0") {
        params.status = null;
      } else {
        params.status = Number(this.currentTabItem);
      }
      for (let item in params) {
        params[item] = params[item] === "" ? null : params[item];
      }
      this.changeTimeValue(params);
      params.businessDeptIds = this.authUserInfo.securityUser.businessDeptIds;
      return params;
    },
    getList() {
      // 獲取分頁
      let v = this;
      if (!v.getPermission("purchase_list")) {
        v.$Message.error("无权限");
        return;
      }
      v.numberTypeChange();
      const params = this.getParams();
      this.selectionArr = [];
      this.isDisabledExceed = false;
      this.Tableloading = true;
      this.SearchDisabled = true;
      v.axios.post(api.purchaseList, params).then((res) => {
        v.Tableloading = false;
        v.SearchDisabled = false;
        if (res.data.code === 0) {
          v.ordersData = res.data.datas.list;
          v.total = res.data.datas.total;
          v.$Loading.finish(); // 隐藏加载条
          v.changeRemark();
        }
      });
    },
    changePage(page) {
      let v = this;
      v.$Loading.start();
      v.pageParams.pageNum = page;
      v.getList();
    },
    reset() {
      this.$nextTick(() => {
        this.$refs["pageParams"].resetFields();
      });
      this.pageParams.orderNoList =
        this.pageParams.skuList =
        this.pageParams.spuList =
        this.pageParams.planSerialNumberList =
        [];

      this.$refs.resetSelect.setQuery(null);
      this.timeType = "4";
      this.numberType = "2";
      this.numberValue = "";
      // this.currentTabItem = '4';
      this.selectionArr = [];
      // let end = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1);
      // let start = new Date(new Date(new Date().toLocaleDateString()).getTime());
      // start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      // this.time1 = [
      //   this.getUniversalTime(new Date(start).getTime(), 'fulltime'),
      //   this.getUniversalTime(new Date(end).getTime(), 'fulltime')
      // ];

      let start = fun_date(-7)[0].slice(0, -8) + "00:00:00";
      let end = fun_date(-7)[1].slice(0, -8) + "23:59:59";
      this.pickData = [start, end];
      this.time1 = [start, end];
    },
    search() {
      this.pageParams.pageNum = 1;
      this.pageParams.abnormalStatus = this.pageParams.abnormalStatus === -1 ? null : this.pageParams.abnormalStatus;
      this.pageParams.receiptStatusList = this.$common.isEmpty(this.pageParams.receiptStatusList) ? null : this.pageParams.receiptStatusList;
      this.pageParamsStatus = true;
    },
    getColumns() {
      let v = this;
      let columns = {
        selection: {
          type: "selection",
          width: 50,
          align: "center",
        },
        purchaseNumber: {
          key: "purchaseNumber",
          title: "采购单",
          minWidth: 353,
          align: "left",
          render: (h, params) => {
            let readyType =
              params.row.readyType != null
                ? this.stockTypeArr[params.row.readyType].label
                : "";
            let status =
              params.row.status || params.row.status == 0
                ? this.purchaseStatusList[params.row.status - 1].label
                : "";
            let payStatus =
              params.row.payStatus || params.row.payStatus == 0
                ? this.payStatusArr[params.row.payStatus - 1].label
                : "";
            let settlementType = params.row.settlementTypeName
              ? params.row.settlementTypeName
              : "";
            let showTips =
              params.row.ruleNameList && params.row.ruleNameList.join("\n");
            let ruleTips = "审核规则：" + showTips;
            let businessStatus = params.row.businessStatus || "";
            let refundType =
              params.row.refundStatus != null
                ? this.refundTypeArr[params.row.refundStatus].label
                : "";
            let a = readyType
              ? [
                h(
                  "div",
                  {
                    style:
                      params.row.readyType == 0
                        ? v.statuStyle["textRed"]
                        : v.statuStyle["primary"],
                    class: "purshaseOrderTag",
                  },
                  [
                    h(
                      "Tooltip",
                      {
                        props: { transfer: true },
                      },
                      [
                        readyType,
                        h(
                          "div",
                          {
                            slot: "content",
                          },
                          "备货类型"
                        ),
                      ]
                    ),
                  ]
                ),
              ]
              : [];

            let b = status
              ? [
                h(
                  "div",
                  {
                    style: v.statuStyle["success"],
                    class: "purshaseOrderTag",
                  },
                  [
                    h(
                      "Tooltip",
                      {
                        props: { transfer: true },
                      },
                      [
                        status,
                        h(
                          "div",
                          {
                            slot: "content",
                          },
                          "状态"
                        ),
                      ]
                    ),
                  ]
                ),
              ]
              : [];
            let c = payStatus
              ? [
                h(
                  "div",
                  {
                    style: v.statuStyle["warnning"],
                    class: "purshaseOrderTag",
                  },
                  [
                    h(
                      "Tooltip",
                      {
                        props: { transfer: true },
                      },
                      [
                        payStatus,
                        h(
                          "div",
                          {
                            slot: "content",
                          },
                          "付款状态"
                        ),
                      ]
                    ),
                  ]
                ),
              ]
              : [];
            let d = settlementType
              ? [
                h(
                  "div",
                  {
                    style: v.statuStyle["error"],
                    class: "purshaseOrderTag",
                  },
                  [
                    h(
                      "Tooltip",
                      {
                        props: { transfer: true },
                      },
                      [
                        settlementType,
                        h(
                          "div",
                          {
                            slot: "content",
                          },
                          "结算方式"
                        ),
                      ]
                    ),
                  ]
                ),
              ]
              : [];
            let e = showTips
              ? [
                h("div", { style: { marginLeft: "20px" } }, [
                  h(
                    "Tooltip",
                    {
                      props: {
                        transfer: true,
                        placement: "right",
                        maxWidth: "200px",
                      },
                    },
                    [
                      h("icon", {
                        attrs: { type: "md-warning" },
                        style: { fontSize: "18px", color: "orange" },
                      }),
                      h(
                        "div",
                        {
                          slot: "content",
                        },
                        ruleTips
                      ),
                    ]
                  ),
                ]),
              ]
              : [];
            let g = businessStatus
              ? [
                h("div", { style: { marginLeft: "5px" } }, [
                  h(
                    "Tooltip",
                    {
                      props: {
                        transfer: true,
                        placement: "right",
                        maxWidth: "200px",
                      },
                    },
                    [
                      h("icon", {
                        attrs: { type: "md-infinite" },
                        style: { fontSize: "20px", color: "#00E5EE" },
                      }),
                      h(
                        "div",
                        {
                          slot: "content",
                        },
                        "商家系统开通状态"
                      ),
                    ]
                  ),
                ]),
              ]
              : [];
            let z = refundType
              ? [
                h(
                  "div",
                  {
                    style:
                      params.row.readyType == 0
                        ? v.statuStyle["textRed"]
                        : v.statuStyle["primary"],
                    class: "purshaseOrderTag",
                  },
                  [
                    h(
                      "Tooltip",
                      {
                        props: { transfer: true },
                      },
                      [
                        refundType,
                        h(
                          "div",
                          {
                            slot: "content",
                          },
                          "退款类型"
                        ),
                      ]
                    ),
                  ]
                ),
              ]
              : [];
            let k = params.row.businessDeptName
              ? [
                h(
                  "div",
                  {
                    style: v.statuStyle["warnning"],
                    class: "purshaseOrderTag",
                  },
                  [
                    h(
                      "Tooltip",
                      {
                        props: { transfer: true },
                      },
                      [
                        params.row.businessDeptName,
                        h(
                          "div",
                          {
                            slot: "content",
                          },
                          "所属事业部"
                        ),
                      ]
                    ),
                  ]
                ),
              ]
              : [];

            return h("div", [
              h(
                "div",
                {
                  style: { display: "flex", margin: "8px 0 1px 0" },
                },
                [
                  h(
                    "div",
                    {
                      style: {},
                    },
                    "采购单："
                  ),
                  h(
                    "span",
                    {
                      style: {
                        cursor: "pointer",
                        color: "#2d8cf0",
                        textDecoration: "underline",
                      },
                      on: {
                        click: () => {
                          v.showPurchaseDetail(1, params.row, params.index);
                        },
                      },
                    },
                    params.row.purchaseNumber
                  ),
                  ...e,
                ]
              ),
              h("div", { style: { display: "flex", marginTop: "5px" } }, [
                h(
                  "span",
                  {
                    class: "textOver",
                    attrs: { title: params.row.supplierName },
                  },
                  params.row.supplierName
                ),
                ...g,
                params.row.type == 2
                  ? h(
                    "span",
                    {
                      class: "textOver",
                      attrs: {},
                      style: { marginLeft: "10px", color: "#fc9a39" },
                    },
                    "1688"
                  )
                  : "",
              ]),
              h(
                "div",
                {
                  style: { display: "flex", flexWrap: "wrap" },
                },
                [...a, ...b, ...d, ...c, ...z, ...k]
              ),
            ]);
          },
        },
        backupWarehouseName: {
          key: "backupWarehouseName",
          align: "left",
          title: "备货仓库/采购员",
          width: 130,
          render(h, params) {
            return h("div", [
              h(
                "div",
                {
                  class: "textOver",
                  attrs: { title: params.row.backupWarehouseName },
                },
                params.row.backupWarehouseName
              ),
              h("div", {}, params.row.purchaserName),
            ]);
          },
        },

        totalPrice: {
          key: "totalPrice",
          align: "left",
          title: "产品总价(CNY)",
          width: 110,
          render: (h, params) => {
            if (params.row.supplierName == "*") {
              return h("div", "*");
            }
            if (
              params.row.totalPrice !== null &&
              params.row.totalPrice !== ""
            ) {
              // return h('div', v.getCurrency(params.row.totalPrice, '', 2));
              return h("div", parseFloat(params.row.totalPrice).toFixed(2));
            } else {
              return h("div", "-");
            }
          },
        },
        totalAmount: {
          key: "totalAmount",
          align: "left",
          title: "订单金额(CNY)",
          width: 110,
          render: (h, params) => {
            if (params.row.supplierName == "*") {
              return h("div", "*");
            }
            if (
              params.row.totalAmount !== null &&
              params.row.totalAmount !== ""
            ) {
              // return h('div', v.getCurrency(params.row.totalAmount, '', 2));
              return h("div", [
                params.row.aliPlatformOrderAmount
                  ? h(
                    "span",
                    {
                      style: { textDecoration: "line-through" },
                    },
                    parseFloat(params.row.totalAmount).toFixed(2)
                  )
                  : h(
                    "span",
                    {
                      style: {},
                    },
                    parseFloat(params.row.totalAmount).toFixed(2)
                  ),
                h(
                  "span",
                  {
                    style: { marginLeft: "10px", color: "#fc9a39" },
                  },
                  params.row.aliPlatformOrderAmount
                    ? parseFloat(params.row.aliPlatformOrderAmount).toFixed(2)
                    : ""
                ),
              ]);
            } else {
              return h("div", "-");
            }
          },
        },
        warehouseOrder: {
          key: "warehouseOrder",
          align: "left",
          title: "入库单",
          minWidth: 170,
          render: (h, params) => {
            let receiptStatus = "";
            if (params.row.receiptStatus != null) {
              receiptStatus =
                this.arrivalStatusArr[params.row.receiptStatus].label;
            }
            let statusArr = [];
            let str = params.row.abnormalStatus;
            statusArr = str && str.split("+");
            let text1 = "无源入库";
            let text2 = "部分收货";
            let text3 = "超量收货";
            let a = receiptStatus
              ? [
                h(
                  "div",
                  {
                    style: v.statuStyle["success"],
                    class: "purshaseOrderTag",
                  },
                  [
                    h(
                      "Tooltip",
                      {
                        props: { transfer: true },
                      },
                      [
                        receiptStatus,
                        h(
                          "div",
                          {
                            slot: "content",
                          },
                          "入库单状态"
                        ),
                      ]
                    ),
                  ]
                ),
              ]
              : [];
            let b =
              str != null
                ? [
                  h(
                    "Tag",
                    {
                      style: {
                        color: "white",
                        background: "#7EC0EE",
                        marginRight: "5px",
                        display: statusArr[0] === "1" ? "inline" : "none",
                      },
                      class: "purshaseOrderTag",
                    },
                    [
                      h(
                        "Tooltip",
                        {
                          props: { transfer: true },
                        },
                        [
                          text1,
                          h(
                            "div",
                            {
                              slot: "content",
                            },
                            "收货状态"
                          ),
                        ]
                      ),
                    ]
                  ),
                  h(
                    "Tag",
                    {
                      style: {
                        color: "white",
                        background: "orange",
                        marginRight: "5px",
                        display: statusArr[1] === "1" ? "inline" : "none",
                      },
                      class: "purshaseOrderTag",
                    },
                    [
                      h(
                        "Tooltip",
                        {
                          props: { transfer: true },
                        },
                        [
                          text2,
                          h(
                            "div",
                            {
                              slot: "content",
                            },
                            "收货状态"
                          ),
                        ]
                      ),
                    ]
                  ),
                  h(
                    "Tag",
                    {
                      style: {
                        color: "white",
                        background: "#EF6AFF",
                        marginRight: "5px",
                        display: statusArr[2] === "1" ? "inline" : "none",
                      },
                      class: "purshaseOrderTag",
                    },
                    [
                      h(
                        "Tooltip",
                        {
                          props: { transfer: true },
                        },
                        [
                          text3,
                          h(
                            "div",
                            {
                              slot: "content",
                            },
                            "收货状态"
                          ),
                        ]
                      ),
                    ]
                  ),
                ]
                : [];
            /* let a = str != null ? [h('Tag', {
              style: {
                color: 'white',
                background: '#7EC0EE',
                marginRight: '5px',
                display: statusArr[0] === '1'
                        ? 'inline'
                        : 'none'
              },
              class: 'purshaseOrderTag',
            }, '无源入库'), h('Tag', {
              style: {
                color: 'white',
                background: 'orange',
                marginRight: '5px',
                display: statusArr[1] === '1'
                        ? 'inline'
                        : 'none'
              },
              attrs: {title: '收货状态'},
              class: 'purshaseOrderTag',
            }, '部分收货'), h('Tag', {
              style: {
                color: 'white',
                background: '#EF6AFF',
                marginRight: '5px',
                display: statusArr[2] === '1'
                        ? 'inline'
                        : 'none'
              },
              attrs: {title: '收货状态'},
              class: 'purshaseOrderTag',
            }, '超量收货')] : []; */
            /* let b = params.row.receiptStatus != null ? [h('div', {
              style: v.statuStyle['success'],
              class: 'purshaseOrderTag',
              attrs: {title: "入库单状态"}
            }, receiptStatus)] : []; */

            return h("div", [
              h(
                "span",
                {
                  class: "clickGesture",
                  on: {
                    click: () => {
                      v.showWareOrderDia(params.row);
                    },
                  },
                },
                params.row.receiptNo
              ),
              h(
                "div",
                {
                  style: { display: "flex", marginTop: "3px" },
                },
                [...a, ...b]
              ),
            ]);
          },
        },
        threeNum: {
          key: "threeNum",
          align: "left",
          width: 100,
          title: "下单",
          render: (h, params) => {

            return h("div", [
              h("div", {}, `下单：${params.row.salesNumberTotal || 0}`),
              h("div", {
                style: {
                  'line-height': '1.6em'
                }
              }, [
                h('span', {}, `超发：${params.row.sumOvershootNumber || 0} `),
                h("Tooltip", {
                  props: { transfer: true },
                },
                [
                  h('span', {
                    class: 'erp sps-huaban',
                    style: {
                      'font-size': '12px',
                      cursor: 'pointer',
                      display: [1, '1', 2, '2'].includes(params.row.overshootState) ? 'inline-block' : 'none',
                      color: [1, '1'].includes(params.row.overshootState) ? '#3cb034' : '#f30'
                    }
                  }, ''),
                  h("div", {
                    slot: "content",
                  }, [1, '1'].includes(params.row.overshootState) ? '允许超发中...' : '允许超发结束')
                ])
              ]),
              h("div", {}, `取消：${params.row.surplusQuantityTotal || 0}`),
              h("div", {
                class: params.row.lessGoodsQuantityTotal > 0 ? "red" : "",
              }, `少货：${params.row.lessGoodsQuantityTotal || 0}`),
            ]);
          },
        },
        deliver: {
          key: "deliver",
          align: "left",
          width: 100,
          title: "发货",
          render: (h, params) => {
            return h("div", [
              h("div", {}, `已发：${params.row.despatchNumberTotal || 0}`),
              h("div", {}, `未发：${params.row.notDespatchNumberTotal || 0}`),
            ]);
          },
        },
        receive: {
          key: "receive",
          align: "left",
          width: 100,
          title: "收货",
          render: (h, params) => {
            return h("div", [
              h("div", {}, `正品：${params.row.shelveNumberTotal || 0}`),
              h("div", {}, `次品：${params.row.substandardNumberTotal || 0}`),
              h("div", {}, `未收：${params.row.notReceivedNumberTotal || 0}`),
            ]);
          },
        },
        purchaseRemark: {
          key: "purchaseRemark",
          align: "left",
          title: "外部流水号/采购备注",
          minWidth: 150,
          render: (h, params) => {
            let remarkArr = params.row.remarks;
            let group = [];
            let showTooltip = "";
            if (remarkArr != null) {
              for (let j = 0; j < remarkArr.length; j++) {
                if (remarkArr[j].remark != "") {
                  showTooltip += remarkArr[j].remark + "\n";
                }
              }
            }
            if (remarkArr != null) {
              for (let i = 0; i < remarkArr.length; i++) {
                if (remarkArr[i].remark != "" && group.length < 3) {
                  group.push(
                    h("div", {}, [
                      h(
                        "Tooltip",
                        {
                          props: {
                            placement: "left",
                            transfer: true,
                          },
                        },
                        [
                          h(
                            "div",
                            {
                              style: {
                                display: "inline-block",
                                width: params.column._width * 0.85 + "px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              },
                            },
                            remarkArr[i].remark || ""
                          ),
                          h(
                            "span",
                            {
                              slot: "content",
                              style: { whiteSpace: "pre-wrap" },
                            },
                            showTooltip
                          ),
                        ]
                      ),
                    ])
                  );
                }
              }
            }
            return h("div", [
              params.row.type == 2
                ? h("div", {}, params.row.aliPlatformOrderNo)
                : h("div", {}, params.row.externalSerialNo),
              h("div", {}, group),
            ]);
          },
          /* render (h, params) {
            return h('div', [
              h('div', {
                style: {whiteSpace: 'pre'},
              }, (params.row.remarks != null && params.row.remarks[0].remark) || '-')
            ])
          } */
        },
        threeTime: {
          key: "threeTime",
          align: "center",
          width: 150,
          title: "创建/下单/收货/上架时间",
          render: (h, params) => {
            return h("div", {
              style: {
                'display': 'inline-block',
                'margin': '0 auto',
                'text-align': 'left',
              }
            }, [
              h("div", {
                attrs: {
                  title: '创建时间'
                }
              }, this.getDataToLocalTime(params.row.createdTime, "fulltime", true) || "—"),
              h("div", {
                attrs: {
                  title: '下单时间'
                }
              }, this.getDataToLocalTime(params.row.orderTime, "fulltime", true) || "—"),
              h("div", {
                attrs: {
                  title: '收货时间'
                }
              }, this.getDataToLocalTime(params.row.arrivalTime, "fulltime", true) || "—"),
              h("div", {
                attrs: {
                  title: '上架时间'
                }
              }, this.getDataToLocalTime(params.row.endShelveDate, "fulltime", true) || "—"),
            ]);
          },
        },
        operation: {
          key: "operation",
          align: "left",
          width: 96,
          title: "操作",
          render: (h, params) => {
            let closeTalg = params.row.receiveQuantity;
            let status = params.row.status;
            // if (true) {
            return h("div", [
              !v.getPermission("purchase_info") ||
              h(
                "Dropdown",
                {
                  props: {
                    trigger: "click",
                    transfer: true,
                    transferClassName: "purchaseOrderDrop",
                  },
                  class: "defaultStyle trimming",
                  on: {
                    "on-click": (val) => {
                      v.purchaseOrderIds = params.row.purchaseId;
                      v.ordersData.forEach((item) => {
                        delete item["_checked"];
                      });
                      v.$set(v.ordersData[params.index], "_checked", true);
                      v.selectionArr = [];
                      v.selectionArr.push(params.row);
                      v.editType = "";
                      switch (val) {
                        /* case '1':
                      // v.purchaseOrderFn('1', params.row.purchaseId);
                      v.getOrderDetail(params.row.purchaseId).then(data => {
                        let obj = Object.assign(v.newOrderData, data);
                        obj.purchaseId = null;
                        v.editType = 'copy';
                        v.addOrderFn('1', obj);
                      });
                      break; */
                        case "2":
                          v.purchaseOrderFn("2", params.row.purchaseId);
                          break;

                        case "3":
                          // v.orderOperation('2', params.row.purchaseId)
                          v.getOrderDetail(params.row.purchaseId).then(
                            (data) => {
                              let obj = Object.assign(v.newOrderData, data);
                              // obj.purchaseId = null;
                              v.editType = "copy";
                              v.addOrderFn("3", obj);
                            }
                          );
                          break;
                        case "4":
                          //  v.orderOperation('3', params.row.purchaseId)
                          v.getOrderDetail(params.row.purchaseId).then(
                            (data) => {
                              let obj = Object.assign(v.newOrderData, data);
                              // obj.purchaseId = null;
                              v.editType = "copy";
                              v.addOrderFn("4", obj);
                            }
                          );
                          break;
                        case "5":
                          // v.orderOperation('4', params.row.purchaseId)
                          // v.purchaseOrderFn('4', params.row.purchaseId)
                          v.purchaseOrderFn("4", params.row.purchaseId);

                          break;

                        case "6":
                          // 单个导出
                          v.exportBatchOrSingle = "single"; // 单个导出标识
                          v.purchaseIds = [params.row.purchaseId];
                          v.dialogExport.purchaseNumber =
                            params.row.purchaseNumber;
                          v.dialogExport.title = "导出采购单";
                          v.dialogExport.purExpType = 1; //
                          v.dialogExport.modelVisible = true;
                          // v.purchaseExportMt(params.row);
                          break;
                        case "7":
                          v.seeRelatedPlan(
                            params.row.purchaseId,
                            params.row.purchaseNumber
                          );
                          break;
                        case "8":
                          //v.purchaseOrderFn('3', params.row.purchaseId);
                          v.getOrderDetail(params.row.purchaseId).then(
                            (data) => {
                              let obj = Object.assign(v.newOrderData, data);
                              v.editType = "copy";
                              v.addOrderFn("2", obj);
                            }
                          );
                          break;
                        case "9":
                          v.model1 = true;
                          v.getPurchaseReceiveRecord(
                            params.row.purchaseNumber
                          ); // 获取到货记录
                          break;
                        case "10":
                          v.applyPayment(params.row.supplierId); // 申请付款
                          break;
                        case "13":
                          v.applyRefund(params.row.supplierId); // 申请付款
                          break;
                        case "11":
                          v.getOrderDetail(params.row.purchaseId).then(
                            (data) => {
                              let obj = Object.assign(v.newOrderData, data);
                              obj.purchaseId = null;
                              v.editType = "copy";
                              // 复制时不需要第三方标签列表数据
                              obj.platformAndAccountCodeStr = ''
                              obj.platformAndAccountCode = ''
                              v.addOrderFn("5", obj);
                            }
                          );
                          break;
                        case "12":
                          this.voidPurchaseNumber = params.row.purchaseNumber;
                          this.showModalType = 2;
                          this.model3 = true;

                          /* v.isModal({
                        content: `是否作废采购单：${params.row.purchaseNumber}`
                      }).then(() => {
                        v.VoidPurchaseOrder(params.row.purchaseNumber, 1); // 作废采购单
                      }); */
                          break;
                        /* case '13':
                      v.VoidPurchaseOrder(params.row.purchaseNumber, 2); // 关闭采购单
                      break; */
                      }
                    },
                  },
                },
                [
                  h(
                    "Button",
                    {
                      attrs: { type: "default" },
                      style: { color: "#2d8cf0" },
                      class: "iconbuttons",
                      props: {},
                    },
                    [
                      h("Span", {}, "操作"),
                      h("Icon", {
                        attrs: { type: "md-arrow-dropdown" },
                        style: { margin: "0 0 2px 5px" },
                      }),
                    ]
                  ),
                  h(
                    "DropdownMenu",
                    {
                      slot: "list",
                    },
                    [
                      (v.currentTabItem == "0" && params.row.status == 4) ||
                        v.currentTabItem == "4"
                        ? h(
                          "DropdownItem",
                          {
                            props: {
                              name: "2",
                            },
                          },
                          "下单后修改"
                        )
                        : "",

                      (v.currentTabItem == "0" && params.row.status == 1) ||
                        v.currentTabItem == "1"
                        ? h(
                          "DropdownItem",
                          {
                            props: {
                              name: "3",
                            },
                          },
                          "提交"
                        )
                        : "",
                      (v.currentTabItem == "0" && params.row.status == 2) ||
                        v.currentTabItem == "2"
                        ? h(
                          "DropdownItem",
                          {
                            props: {
                              name: "4",
                              disabled:
                                v.currentTabItem == "2" &&
                                v.isSelf(params.row.createdBy) &&
                                !v.isSelf(params.row.auditPersonIds),
                            },
                          },
                          "审核"
                        )
                        : "",
                      (v.currentTabItem == "0" && params.row.status == 3) ||
                        v.currentTabItem == "3"
                        ? h(
                          "DropdownItem",
                          {
                            props: {
                              name: "5",
                            },
                          },
                          "向供应商下单"
                        )
                        : "",
                      h(
                        "DropdownItem",
                        {
                          props: {
                            name: "6",
                          },
                        },
                        "导出明细"
                      ),
                      /* h('Buttons-item', {
                 props: {
                 name: '4'
                 }
                 }, '导出采购合同') */
                      !v.getPermission("purchase_queryPlan") ||
                        v.currentTabItem != "5" ||
                        params.row.status != 5
                        ? h(
                          "DropdownItem",
                          {
                            props: {
                              name: "7",
                            },
                          },
                          "相关备货计划"
                        )
                        : "",
                      v.currentTabItem == "1" || params.row.status == 1
                        ? h(
                          "DropdownItem",
                          {
                            props: {
                              name: "8",
                            },
                          },
                          "编辑"
                        )
                        : "", // 和上面编辑不一样 这个是全部编辑
                      // 到货记录只在已下单展示
                      !v.getPermission("purchaseReceiveRecord_query") ||
                        v.currentTabItem == "4" ||
                        params.row.status == 4
                        ? h(
                          "DropdownItem",
                          {
                            props: {
                              name: "9",
                            },
                          },
                          "收货记录"
                        )
                        : "",
                      params.row.payStatus !== 5 &&
                        (v.currentTabItem == "4" || params.row.status == 4) &&
                        v.getPermission("purchase_applyPayment") &&
                        status !== 6
                        ? h(
                          "Buttons-item",
                          {
                            props: {
                              name: "10",
                            },
                          },
                          "申请付款"
                        )
                        : "",
                      //null默认，0未申请退款，3部分退款
                      [null, 0, 3].includes(params.row.refundStatus) &&
                        v.getPermission("purchase_applyRefund")
                        ? h(
                          "Buttons-item",
                          {
                            props: {
                              name: "13",
                            },
                          },
                          "申请退款"
                        )
                        : "",
                      h(
                        "DropdownItem",
                        {
                          /* style: {
                    display: (() => {
                      if ( ((v.currentTabItem == '4' || v.currentTabItem == '3') || (params.row.status == 3 || params.row.status == 4)) && v.getPermission('purchase_copy')) {
                        return 'inline-block';
                      } else {
                        return 'none';
                      }
                    })()
                  }, */
                          props: {
                            name: "11",
                          },
                        },
                        "复制"
                      ),
                      /* closeTalg > 0 && (v.currentTabItem === '4' || params.row.status == 4) && v.getPermission('purchase_closePurchaseInfo') && status !== 7
                  ?
                  h('Buttons-item', { // 关闭采购单
                    props: {
                      name: '13'
                    }
                  }, '关闭采购单')
                  : '', */
                      closeTalg <= 0 &&
                        (v.currentTabItem === "4" || params.row.status == 4) &&
                        v.getPermission("purchase_closePurchaseInfo") &&
                        status !== 6
                        ? h(
                          "DropdownItem",
                          {
                            // 作废采购单
                            props: {
                              name: "12",
                            },
                          },
                          "作废采购单"
                        )
                        : "",
                      /* v.currentTabItem == '5'
                        ? h('Buttons-item', {
                          props: {
                            name: '14'
                          }
                        }, '下单后修改')
                        : '', */
                    ]
                  ),
                ]
              ),
            ]);
            // }
          },
        },
      };
      this.sampleColumns = [];
      if (this.currentTabItem !== "4") {
        ['paymentStatus', 'receivedStatus', 'orderTime', 'arrivalTime'].forEach(key => {
          delete columns[key];
        })
      }
      this.sampleColumns = Object.values(columns);
    }, // 获取开户银行列表信息
    getbankArr() {
      let v = this;
      v.axios.get(api.baseDataList + "?dataType=" + "bank").then((res) => {
        if (res.data.code == 0) {
          v.bankArr = res.data.datas;
        }
      });
    },
    getPurchaseReceiveRecord(id) {
      // 获取到货记录
      let v = this;
      v.Tableloading = true;
      v.axios
        .get(api.purchaseReceiveRecordQuery + "?purchaseNumber=" + id)
        .then((res) => {
          v.Tableloading = false;
          if (res.data.code === 0) {
            v.data1 = res.data.datas;
          }
        })
        .catch(() => {
          v.Tableloading = false;
        });
    },
    pickDataChange(e) {
      // 获取日期返回值
      if (e[0] != "") {
        this.timeTypeArr.forEach(item => {
          this.$set(this.pageParams, item.start, null);
          this.$set(this.pageParams, item.end, null);
        })
        if (e[1].slice(-6) === " 00:00") {
          e[1] = e[1].slice(0, -6) + " 23:59";
        }
        let start = e[0] + ":00";
        let end = e[1] + ":59";
        this.time1 = [start, end];
        this.pickData = [start, end];
      } else {
        this.time1 = null;
      }
    },
    numberTypeChange() {
      let v = this;
      v.pageParams.purchaseNumber = "";
      v.pageParams.planSerialNumber = "";
      v.pageParams.trackingNumber = "";
      // v.pageParams.externalSerialNo = '';
      v.pageParams.purchaseNumberList = "";
      v.pageParams.SkuNoList = "";
      v.pageParams.sku = "";
      if (v.numberType == "1") {
        v.pageParams.purchaseNumber = v.numberValue;
      } else if (v.numberType == "2") {
        v.pageParams.planSerialNumber = v.numberValue;
      } else if (v.numberType == "3") {
        v.pageParams.trackingNumber = v.numberValue;
      } /* else if (v.numberType == '4') {
        v.pageParams.externalSerialNo = v.numberValue;
      } */ else if (v.numberType == "5") {
        v.pageParams.purchaseNumberList = v.numberValue;
      } else if (v.numberType == "6") {
        v.pageParams.SkuNoList = v.numberValue;
      }
    },
    getSelectValue(selection) {
      // table获取所选值
      this.selectionArr = selection;
      // 是否禁用 批量结束超发
      this.isDisabledExceed = !!(selection.find(row => {
        return this.$common.isEmpty(row.overshootState) || [0, '0', 2, '2'].includes(row.overshootState)
      }));
    },
    purchaseExportMt(id) {
      let v = this;
      v.numberTypeChange();
      let params = this.getParams();
      v.axios.post(api.purchaseExport, params).then((res) => {
        if (res.data.code === 0) {
          v.$Message.success("导出成功");
          // window.location = v.$store.state.imgUrl + res.data.datas;
        } else {
          v.$Message.error(res.data.datas);
        }
      });
    },
    showCurrentPage() {
      // tabs页切换
      let v = this;
      this.pageParams.pageNum = 1;
      // this.pageParamsStatus = true
      v.getList();
    },
    async addOrderFn(type, data) {
      // 操作类型、数据
      //   orderType   1--新增  2--编辑 3--提交 4--审核 5--复制
      let v = this;
      await v.axios.post(api.warehouse, { pageParams: 1 }).then((res) => {
        if (res.data.code == 0) {
          v.warehouseArr = res.data.datas;
          v.purchaseWarehouseArr = [];
          v.warehouseArr.forEach((n) => {
            if (n.warehouseType == "0" || n.warehouseType == "5") {
              v.purchaseWarehouseArr.push(n);
            }
          });
        }
      });
      v.warehouseArr.forEach((item) => {
        if (item.warehouseId === v.orderData.purchaseWarehouseId) {
          v.orderData = Object.assign(v.orderData, {
            purchaseWarehouseName: item.warehouseName,
          });
        }
      });
      v.purchaseShow = "addPurchaseOrder";
      v.orderType = type;
      if (v.editType == "copy") {
        v.orderData = v.deepCopy(data);
      } else {
        v.orderData = v.initData;
      }
    },
    orderOperation(type, id) {
      // 2:编辑，3：提交，4：审核
      let v = this;
      let temp = { purchaseIdList: [id] };
      temp.businessDeptIds = this.authUserInfo.securityUser.businessDeptIds;
      v.axios.post(api.purchaseInfo, temp).then((res) => {
        if (res.data.code == 0) {
          v.getProductListInfo(
            res.data.datas.detailsResultList.map((i) => i.goodsId)
          ).then((data) => {
            let productGoodInfo = {};
            res.data.datas.detailsResultList = res.data.datas.detailsResultList.map(i => {
              productGoodInfo = data.find(j => i.goodsId === j.productGoodsId);
              return { ...i, ...(this.$common.isEmpty(productGoodInfo) ? {} : productGoodInfo) };
            });
            let obj = res.data.datas;
            obj.isDeliveryPay = obj.isDeliveryPay == 1;
            obj.updateQuoteFlag = obj.updateQuoteFlag == 1;
            obj.updateSupplierFlag = obj.updateSupplierFlag == 1;
            v.addOrderFn(type, obj);
          });
        }
      });
    },
    getProductName(data) {
      let v = this;
      let arr = [];
      if (data.detailsResultList) {
        arr = data.detailsResultList.map((i) => i.goodsId);
      }
      return new Promise((resolve) => {
        v.axios.post(`${api.get_queryByGoodsIds}?UserId=${v.$store.state.userInfo.merchantId},${v.$store.state.userInfo.userId}`, arr).then((res) => {
          if (res.data.code === 0) {
            let productGoodInfo = {};
            data.detailsResultList = data.detailsResultList.map(i => {
              productGoodInfo = res.data.datas.find(j => i.goodsId === j.productGoodsId) || {};
              return { ...i, ...(this.$common.isEmpty(productGoodInfo) ? {} : productGoodInfo), goodsName: productGoodInfo.cnName };
            });
            resolve(data);
          } else {
            resolve(data);
          }
        });
      });
    },
    purchaseOrderFn(type, id) {
      // 操作类型、接口参数
      let v = this;
      let temp = { purchaseIdList: [id] };
      temp.businessDeptIds = this.authUserInfo.securityUser.businessDeptIds;
      v.axios.post(api.purchaseInfo, temp).then((res) => {
        if (res.data.code == 0) {
          v.showType = type; // 1: 查看，2：编辑
          v.getProductListInfo(
            res.data.datas.detailsResultList.map((i) => i.goodsId)
          ).then((data) => {
            res.data.datas.detailsResultList.forEach((i) => {
              data.forEach((j) => {
                if (i.goodsId === j.productGoodsId) {
                  i.goodsName = j.cnName;
                  Object.keys(j).forEach(key => {
                    i[key] = j[key];
                  });
                }
              });
            });
            v.orderData = res.data.datas;
            v.purchaseShow = "showPurchaseOrder";
          });
        }
      });
    },
    getOrderDetail(id) {
      let v = this;
      let temp = { purchaseIdList: [id] };
      temp.businessDeptIds = this.authUserInfo.securityUser.businessDeptIds;
      return new Promise((resolve) => {
        v.axios.post(api.purchaseInfo, temp).then((res) => {
          if (res.data.code == 0) {
            v.getProductListInfo(
              res.data.datas.detailsResultList.map((i) => i.goodsId)
            ).then((data) => {
              res.data.datas.detailsResultList.forEach((i) => {
                data.forEach((j) => {
                  if (i.goodsId === j.productGoodsId) {
                    i.goodsName = j.cnName;
                    Object.keys(j).forEach(key => {
                      i[key] = j[key];
                    });
                  }
                });
              });
              resolve(res.data.datas);
            });
          }
        });
      });
    },
    clickSortButton: function (data) {
      // 点击排序的按钮
      if (data.value === this.cacheClickVal) {
        data.toogle = !data.toogle;
      }
      this.cacheClickVal = data.value;
      if (data.toogle) {
        this.pageParams.upDown = "down";
      } else {
        this.pageParams.upDown = "up";
      }
      this.sortData.forEach(function (n) {
        n.checked = data.value === n.value;
      });
      this.pageParams.orderBy = data.value;
      this.search();
    },
    seeRelatedPlan(id, purchaseNumber) {
      let v = this;
      v.Tableloading = true;
      v.axios
        .post(api.purchaseQueryPlan, {
          purchaseId: id,
          purchaseNumber: purchaseNumber,
        })
        .then((res) => {
          v.Tableloading = false;
          if (res.data.code == 0) {
            v.planData = res.data.datas.list;
            v.isShowRelatedPlan = true;
          }
        });
    },
    showModal(type) {
      if (!this.selectionArr.length) {
        this.$Message.error("请选择需要操作的数据！！");
        return;
      }
      this.showModalType = type;
      if (type == 1) {
        this.showModalName = "驳回";
      } else if (type == 3) {
        this.showModalName = "审核通过";
      } else if (type == 2) {
        this.showModalName = "作废";
      } else if (type == 5) {
        this.showModalName = "取消采购";
      }
      this.model3 = true;
    },
    submitModal() {
      if (this.voidPurchaseNumber) {
        this.VoidPurchaseOrder(this.voidPurchaseNumber, 1);
      } else {
        this.batchOperation(this.showModalType);
      }
      this.model3 = false;
      this.voidPurchaseNumber = null;
    },
    cancelModal() {
      this.model3 = false;
      this.voidPurchaseNumber = null;
    },
    okUpload(data, file) {
      // 文件上传成功的回调
      // let noTSatisfiableStr = data.datas;
      if (data.code == 0) {
        if (data.datas) {
          let str = "";
          data.datas.forEach((i) => {
            for (let key in i) {
              if (key !== "row") {
                str += key + ":" + i[key] + "</br>";
              }
            }
          });
          this.$Message.error({
            content: str,
            duration: 5,
            closable: true,
          });
          this.importExcel = false;
        } else {
          this.$Message.success(file.name + "导入成功");
          this.importExcel = false;
          this.getList();
        }
      } else if (data.code === 222008) {
        this.$Notice.error({
          title: "导入物流信息失败,详情请下载",
          desc:
            '<a target="_blank" href="' +
            this.$store.state.imgUrl +
            data.datas +
            '">' +
            data.datas +
            "</a>",
          duration: 0,
        });
      } else {
        this.$Message.error("导入失败，请参考模板填写");
      }
    },
    uploadError() {
      // 上传失败回调
      this.$Message.error("导入失败");
      this.importExcel = false;
    },
    formatError(file) {
      // 上传格式错误
      this.$Notice.warning({
        title: "上传文件格式有误",
        desc: "文件 " + file.name + " 格式错误, 请选择[XLS或XLSX]",
      });
      this.importExcel = false;
    },
    downloadEcxel() {
      // 下载标发货导入的模板
      const path =
        this.$store.state.imgUrl +
        "/sps-service/template/shippingTemplate.xlsx";
      window.location.href = path;
    },
    goBackFromAdd() {
      this.purchaseShow = "purchaseOrder";
      this.getList();
    },
    addOrderGoBack(val, id, status) {
      this.purchaseShow = val;
      this.getList();
      if (id) {
        this.purchaseOrderId = id;
        this.statusText = status === 1 ? "待提交" : "已提交";
        this.isShowTips = true;
      }
    },
    showExport() {
      this.isShowExportExcel = true;
      this.exportObj.isExportPic = "";
    },
    // 申请金额改变
    tableAmountChange(value, index) {
      return new Promise((resolve) => {
        this.$nextTick(() => {
          let totalPay = 0;
          this.supplierInfoList[this.supplierInfoListItem].purchasePaymentRelatedList.forEach((item) => {
            if (!this.$common.isEmpty(item.applyAmount) && !this.$common.isEmpty(Number(item.applyAmount))) {
              totalPay += Number(item.applyAmount);
            }
          });
          this.supplierInfoList[this.supplierInfoListItem].purchasePaymentInfo.payAmount = totalPay.toFixed(2);
          resolve({});
        })
      })
    },
    // 验证申请金额
    validatorApplyAmount(rule, value, callback) {
      this.$nextTick(() => {
        setTimeout(() => {
          const fieldList = rule.field.split('.');
          if (fieldList.length != 3) return callback();
          const index = Number(fieldList[1]);
          if (!this.supplierInfoList[this.supplierInfoListItem] || !this.supplierInfoList[this.supplierInfoListItem].purchasePaymentRelatedList) {
            return callback();
          }
          const rowParent = this.supplierInfoList[this.supplierInfoListItem];
          const rowInfo = rowParent.purchasePaymentRelatedList[index];
          if (this.$common.isEmpty(rowInfo)) return callback();
          let newVal = rowInfo.applyAmount;
          let required = this.$common.isEmpty(rule.required) ? rule.getRequired : rule.required;
          if (this.$common.isFunction(required)) {
            required = required(rule, newVal);
          }
          if (!this.$common.isEmpty(required) && required && this.$common.isEmpty(newVal)) {
            return callback(new Error(rule.msg || '必填项不能为空'));
          }
          const val = Number(newVal);
          if (this.$common.isEmpty(val)) {
            return callback(new Error('本次申请金额必须为数字'));
          }
          if (val <= 0) {
            return callback(new Error('本次申请金额不能小于 0'));
          }
          const totalAmount = Number(rowInfo.totalAmount);
          if (val > totalAmount) {
            return callback(new Error('本次申请金额不能大于（应付总额-已付款-已申请待支付）'));
          }
          if (totalAmount <= 0) {
            return callback(new Error('应付金额要大于0'));
          }
          if (rowParent.purchasePaymentInfo) {
            if (rowParent.purchasePaymentInfo.settlementTypeName == "款到发货") {
              //申请金额不能大于订单金额
              if (val > totalAmount) {
                return callback(new Error('本次申请付款金额不能大于订单金额'));
              }
            }
            if (["线下账期"].includes(rowParent.purchasePaymentInfo.settlementTypeName)) {
              //申请付款金额不能大于（收库商品金额+运费）
              if (val > rowInfo.shelvesTotalprice + rowInfo.freightCharge) {
                return callback(new Error('本次申请付款金额不能大于（收库商品金额+运费）'));
              }
            }
          }
          callback();
        }, 100);
      })
    },
    // 
    exportEcxel() {
      let v = this;
      if (v.ordersData.length == 0) {
        v.$Message.error("无数据导出");
      } else {
        v.numberTypeChange();
        let params = this.getParams();
        params.isExportImage = v.exportImgSetting;
        v.axios.post(api.purchaseExport, params).then((res) => {
          if (res.data.code == 0) {
            v.$Message.success("导出成功");
            v.model2 = false;
            // window.location = v.$store.state.imgUrl + res.data.datas;
          } else {
            v.$Message.error(res.data.datas);
          }
        });
      }
    },
    picRadioChangeFn() {
      this.exportObj.picType = "";
    },
    batchOperation(type) {
      let v = this;
      if (v.selectionArr.length == 0) {
        v.$Message.error("请选择需要操作的数据！！");
      } else {
        let param = {
          operationType: type, // 批量操作类型(1取消采购,2审核通过,3驳回,4作废采购单,5标记下单) ----->  更改 （1驳回 2作废 3审核通过 4-- 5取消采购）
          purchaseIdList: [],
        };
        v.selectionArr.forEach((item) => {
          param.purchaseIdList.push(item.purchaseId);
        });
        this.model3 = true;
        v.axios.post(api.purchaseOperation, param).then((res) => {
          if (res.data.code == 0) {
            v.$Message.success("操作成功!");
            v.getList();
          }
        });
      }
    },
    submitFn() {
      let v = this;
      if (v.selectionArr.length == 0) {
        v.$Message.error("请选择需要操作的数据！！");
      } else {
        v.axios.post(api.purchaseSubmit, v.selectionArr).then((res) => {
          if (res.data.code == 0) {
            v.$Message.success("操作成功!");
            v.getList();
          }
        });
      }
    },
    addPurOrder() {
      this.editType = "";
      if (this.showType == 3) {
        //待提交 --> 编辑
        this.addOrderFn("1", this.orderData);
      }
      this.addOrderFn("1", this.initData);
    },
    intiBaseDataList() {
      let v = this;
      v.axios.get(api.userList).then((res) => {
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
          v.purchaserArr = arr;
        }
      });
      // v.axios.post(api.purchaseSupplierData)
      v.axios.get(api.queryIdAndName).then((res) => {
        if (res.data.code == 0) {
          v.supplierArr = res.data.datas;
        }
      });
      v.axios
        .get(api.baseDataList + "?dataType=" + "settlementType")
        .then((res) => {
          if (res.data.code == 0) {
            v.settlementMethodArr = res.data.datas;
          }
        });
    }, // 检查数组元素是否全部相同
    isAllEqual(arr) {
      if (arr.length > 0) {
        return !arr.some((value) => {
          return value.currency !== arr[0].currency;
        });
      } else {
        return true;
      }
    },
    checkOrderPayment(orderList) {
      return orderList.some((item) => {
        return item.payStatus == 5; // 已付款
      });
    }, // 申请付款
    applyPayment(supplierId) {
      /**
       * @parmas
       * supplierId 供应商id
       * */
      let v = this;

      //增加相同事业部才能一起付款
      let noRepetitionList = v.selectionArr.map((item) => {
        return item.businessDeptId;
      });
      noRepetitionList = [...new Set(noRepetitionList)];

      if (noRepetitionList.length > 1) {
        return v.$Message.warning("请选择相同的所属事业部采购单");
      }

      // let supplierIds = null;
      if (v.selectionArr.length == 0) {
        v.$Message.error("请先选择需要付款的订单");
      } else if (!v.isAllEqual(v.selectionArr)) {
        // 不同的币种不能在一起生成付款订单
        v.$Message.error({
          content: "请选择相同币种的订单申请付款",
          duration: 3,
        });
      } else if (v.checkOrderPayment(v.selectionArr)) {
        // 已付完款的订单不能再申请付款
        v.$Message.error({
          content: "已付完款的订单不能再申请付款",
          duration: 3,
        });
      } else {
        // 选中供应商信息数组
        let arr = v.selectionArr.map((item) => {
          let obj = {};
          obj.supplierId = item.supplierId;
          obj.supplierName = item.supplierName;
          obj.purchaseNumber = item.purchaseNumber;
          return obj;
        });
        // 供应商去重
        for (let i = 0; i < arr.length; i++) {
          for (let j = i + 1; j < arr.length; j++) {
            if (arr[i].supplierId == arr[j].supplierId) {
              arr.splice(j, 1);
              j--;
            }
          }
        }
        let reqParams = arr.map((k) => {
          return k.supplierId;
        });
        let reqApi = "/sps-service/sps/purchase/supplier/listbo";
        let temp = {
          supplierIdList: reqParams,
          businessDeptIds: this.authUserInfo.securityUser.businessDeptIds,
        };
        // 选中的订单号数组
        let purchaseNumberArr = v.selectionArr.map((item) => {
          let obj = {};
          obj.purchaseNumber = item.purchaseNumber;
          return obj;
        });
        this.supplierIdArr = arr;
        v.axios.post(reqApi, temp).then((res) => {
          if (res.data.code == 0) {
            let supplierInfoList = []; // 申请付款单的数据列表
            let canShow = true;
            let supplierInfoItem = [];
            let data = res.data.datas;
            for (let i = 0; i < reqParams.length; i++) {
              for (let j = 0; j < data.length; j++) {
                if (data[j].supplierId == reqParams[i]) {
                  supplierInfoItem.push(data[j]);
                }
              }
            }
            v.paySupplierList = supplierInfoItem;
            for (let i = 0; i < arr.length; i++) {
              let supplierInfo = {}; // 一个供应商的申请付款信息
              let infoObj = {}; // 一个供应商的信息对象
              let infoList = []; // 一个供应商下的订单信息数组
              // 用当前供应商id去匹配每一个供应商
              // 用当前供应商id去匹配每个供应商下的订单,可能有多个，返回供应商下所有订单数组
              let supplierOrderList = v.ordersData.filter((item) => {
                return item.supplierId == arr[i].supplierId;
              });
              // 再通过选中的订单号匹配出选中的订单,也可能有多个，返回数组
              let supplierOrderItem = [];
              for (let n = 0; n < purchaseNumberArr.length; n++) {
                supplierOrderList.map((item) => {
                  if (
                    item.purchaseNumber == purchaseNumberArr[n].purchaseNumber
                  ) {
                    supplierOrderItem.push(item);
                  }
                });
              }
              if (supplierInfoItem.length === 0) {
                v.$Message.error({
                  content: "供应商" + arr[i].supplierName + "已停用" + "!",
                  duration: 3,
                });
                canShow = false;
                return;
              }
              // 组装供应商信息
              infoObj.applyId = supplierInfoItem[i].applyId || null;
              infoObj.cancelRemark = supplierInfoItem[i].cancelRemark || null;
              infoObj.cancelTime = supplierInfoItem[i].cancelTime || null;
              infoObj.createdBy = supplierInfoItem[i].createdBy || null;
              infoObj.createdTime = supplierInfoItem[i].createdTime || null;
              infoObj.currency = supplierOrderItem[0].currency || null; // 币种取自订单
              infoObj.merchantId = supplierInfoItem[i].merchantId || null;
              infoObj.payAmount = supplierInfoItem[i].payAmount || null;
              infoObj.payType = supplierInfoItem[i].paymentType || null;
              infoObj.paymentAccount =
                supplierInfoItem[i].paymentAccount || null;
              infoObj.paymentAccountName =
                supplierInfoItem[i].paymentAccountName || null;
              infoObj.paymentBank = supplierInfoItem[i].paymentBank || null;
              infoObj.paymentNumber = supplierInfoItem[i].paymentNumber || null;
              infoObj.paymentRemark = supplierInfoItem[i].paymentRemark || null;
              infoObj.paymentStatus = supplierInfoItem[i].paymentStatus || null;
              infoObj.paymentType = 2; // 固定是2
              infoObj.purchasePaymentInfoId =
                supplierInfoItem[i].purchasePaymentInfoId || null;
              infoObj.supplierId = supplierInfoItem[i].supplierId || null;
              infoObj.updatedBy = supplierInfoItem[i].updatedBy || null;
              infoObj.updatedTime = supplierInfoItem[i].updatedTime || null;
              infoObj.settlementTypeName =
                supplierInfoItem[i].settlementTypeName || null;
              // 增加一个字段
              infoObj.paymentTypeName =
                supplierInfoItem[0].paymentTypeName || null;
              supplierInfo.purchasePaymentInfo = infoObj;

              // 组装订单信息数据
              for (let j = 0; j < supplierOrderItem.length; j++) {
                let obj = {};
                let obj1 = supplierOrderItem[j];
                let applyAmount = Number(
                  (
                    obj1.totalAmount -
                    obj1.paidAmount -
                    obj1.waitPayAmount
                  ).toFixed(2)
                );
                obj.freightCharge = supplierOrderItem[j].freightCharge || 0;
                obj.applyAmount = applyAmount || null;
                obj.createdBy = supplierOrderItem[j].createdBy || null;
                obj.createdTime = supplierOrderItem[j].createdTime || null;
                obj.merchantId = supplierOrderItem[j].merchantId || null;
                obj.purchaseId = supplierOrderItem[j].purchaseId || null;
                obj.purchasePaymentInfoId =
                  supplierOrderItem[j].purchasePaymentInfoId || null;
                obj.purchasePaymentRelatedId =
                  supplierOrderItem[j].purchasePaymentRelatedId || null;
                obj.updatedBy = supplierOrderItem[j].updatedBy || null;
                obj.updatedTime = supplierOrderItem[j].updatedTime || null;
                obj.totalAmount = supplierOrderItem[j].totalAmount || null; // 应付总额
                // 增加几个字段
                obj.purchaseNumber =
                  supplierOrderItem[j].purchaseNumber || null; // 采购单号
                obj.paidAmount =
                  supplierOrderItem[j].paidAmount === null
                    ? "0.00"
                    : supplierOrderItem[j].paidAmount; // 已付款
                //供应商名称为*则屏蔽掉
                if (
                  this.paySupplierList[this.supplierInfoListItem]
                    .supplierName == "*"
                ) {
                  obj.paidAmount = "*";
                }
                obj.waitPayAmount =
                  supplierOrderItem[j].waitPayAmount === null
                    ? "0.00"
                    : supplierOrderItem[j].waitPayAmount; // 已申请待支付
                //供应商名称为*则屏蔽掉
                if (
                  this.paySupplierList[this.supplierInfoListItem]
                    .supplierName == "*"
                ) {
                  obj.waitPayAmount = "*";
                }
                infoList[j] = obj;
              }
              supplierInfo.purchasePaymentRelatedList = infoList;
              supplierInfoList.push(supplierInfo);
            }
            if (canShow) {
              v.showPayModal = true;
              this.supplierInfoList = supplierInfoList; // 当前显示的供应商数据 初始化显示第一条
            }
            //这里申请付款对话框的表格重新申请接口
            let purchaseNumberSearch = this.selectionArr.map((item) => {
              return item.purchaseNumber;
            });
            this.getPurchaseInfo(purchaseNumberSearch).then((res) => {
              let datas = res.data.datas;
              this.supplierInfoList.forEach((itema, indexa) => {
                itema.purchasePaymentRelatedList.forEach((itemb, indexb) => {
                  datas.forEach((itemc) => {
                    if (itemb.purchaseNumber == itemc.purchaseNumber) {
                      itemc.applyAmount = itemb.applyAmount;
                      itemc.purchasePaymentInfoId = itemb.purchasePaymentInfoId;
                      itemc.purchasePaymentRelatedId =
                        itemb.purchasePaymentRelatedId;
                      this.$set(
                        this.supplierInfoList[indexa]
                          .purchasePaymentRelatedList,
                        indexb,
                        itemc
                      );
                    }
                  });
                });
              });
              //重新定义结算方式
              this.supplierInfoList.forEach((itema) => {
                let temp = "";
                itema.purchasePaymentRelatedList.forEach((itemb) => {
                  if (itemb.settlementTypeName && !temp) {
                    temp = itemb.settlementTypeName;
                  }
                });
                itema.purchasePaymentInfo.settlementTypeName = temp;
              });
              this.model4Loading = false
            });
          }
        });
      }
    },
    // 申请退款
    applyRefund(supplierId) {
      /**
       * @parmas
       * supplierId 供应商id
       * */
      let v = this;
      //增加相同事业部才能一起付款
      let noRepetitionList = v.selectionArr.map((item) => {
        return item.businessDeptId;
      });
      noRepetitionList = [...new Set(noRepetitionList)];

      if (noRepetitionList.length > 1) {
        return v.$Message.warning("请选择相同的所属事业部采购单");
      }
      // let supplierIds = null;
      if (v.selectionArr.length == 0) {
        v.$Message.error("请先选择需要退款的订单");
      } else if (!v.isAllEqual(v.selectionArr)) {
        // 不同的币种不能在一起生成付款订单
        v.$Message.error({
          content: "请选择相同币种的订单申请付款",
          duration: 3,
        });
      }
      //提示已付款完成的订单不能再申请付款，退款不需要验证
      //  else if (v.checkOrderPayment(v.selectionArr)) {
      //   // 已付完款的订单不能再申请付款
      //   v.$Message.error({
      //     content: "已付完款的订单不能再申请付款",
      //     duration: 3,
      //   });
      // }
      else {
        //检验是否符合退款状态
        try {
          v.selectionArr.forEach((item) => {
            if ([null, 1, 4].includes(item.refundStatus)) {
              throw Error();
            }
          });
        } catch (e) {
          this.$Message.warning(
            "只有退款状态为“未申请退款”，“部分退款”，“已取消退款”时，才可以发起退款操作"
          );
          return;
        }

        // 选中供应商信息数组
        let arr = v.selectionArr.map((item) => {
          let obj = {};
          obj.supplierId = item.supplierId;
          obj.supplierName = item.supplierName;
          obj.purchaseNumber = item.purchaseNumber;
          return obj;
        });
        // 供应商去重
        for (let i = 0; i < arr.length; i++) {
          for (let j = i + 1; j < arr.length; j++) {
            if (arr[i].supplierId == arr[j].supplierId) {
              arr.splice(j, 1);
              j--;
            }
          }
        }
        let reqParams = arr.map((k) => {
          return k.supplierId;
        });
        let reqApi = "/sps-service/sps/purchase/supplier/listbo";
        let temp = {
          supplierIdList: reqParams,
          businessDeptIds: this.authUserInfo.securityUser.businessDeptIds,
        };
        // 选中的订单号数组
        let purchaseNumberArr = v.selectionArr.map((item) => {
          let obj = {};
          obj.purchaseNumber = item.purchaseNumber;
          return obj;
        });
        this.supplierIdArr = arr;
        v.axios.post(reqApi, temp).then((res) => {
          if (res.data.code == 0) {
            let supplierInfoList = []; // 申请付款单的数据列表
            let canShow = true;
            let supplierInfoItem = [];
            let data = res.data.datas;
            for (let i = 0; i < reqParams.length; i++) {
              for (let j = 0; j < data.length; j++) {
                if (data[j].supplierId == reqParams[i]) {
                  supplierInfoItem.push(data[j]);
                }
              }
            }
            v.paySupplierList = supplierInfoItem;
            for (let i = 0; i < arr.length; i++) {
              let supplierInfo = {}; // 一个供应商的申请付款信息
              let infoObj = {}; // 一个供应商的信息对象
              let infoList = []; // 一个供应商下的订单信息数组
              // 用当前供应商id去匹配每一个供应商
              // 用当前供应商id去匹配每个供应商下的订单,可能有多个，返回供应商下所有订单数组
              let supplierOrderList = v.ordersData.filter((item) => {
                return item.supplierId == arr[i].supplierId;
              });
              // 再通过选中的订单号匹配出选中的订单,也可能有多个，返回数组
              let supplierOrderItem = [];
              for (let n = 0; n < purchaseNumberArr.length; n++) {
                supplierOrderList.map((item) => {
                  if (
                    item.purchaseNumber == purchaseNumberArr[n].purchaseNumber
                  ) {
                    supplierOrderItem.push(item);
                  }
                });
              }
              if (supplierInfoItem.length === 0) {
                v.$Message.error({
                  content: "供应商" + arr[i].supplierName + "已停用" + "!",
                  duration: 3,
                });
                canShow = false;
                return;
              }
              // 组装供应商信息
              infoObj.applyId = supplierInfoItem[i].applyId || null;
              infoObj.cancelRemark = supplierInfoItem[i].cancelRemark || null;
              infoObj.cancelTime = supplierInfoItem[i].cancelTime || null;
              infoObj.createdBy = supplierInfoItem[i].createdBy || null;
              infoObj.createdTime = supplierInfoItem[i].createdTime || null;
              infoObj.currency = supplierOrderItem[0].currency || null; // 币种取自订单
              infoObj.merchantId = supplierInfoItem[i].merchantId || null;
              infoObj.payAmount = supplierInfoItem[i].payAmount || null;
              infoObj.payType = supplierInfoItem[i].paymentType || null;
              infoObj.paymentAccount =
                supplierInfoItem[i].paymentAccount || null;
              infoObj.paymentAccountName =
                supplierInfoItem[i].paymentAccountName || null;
              infoObj.paymentBank = supplierInfoItem[i].paymentBank || null;
              infoObj.paymentNumber = supplierInfoItem[i].paymentNumber || null;
              infoObj.paymentRemark = supplierInfoItem[i].paymentRemark || null;
              infoObj.paymentStatus = supplierInfoItem[i].paymentStatus || null;
              infoObj.paymentType = 2; // 固定是2
              infoObj.purchasePaymentInfoId =
                supplierInfoItem[i].purchasePaymentInfoId || null;
              infoObj.supplierId = supplierInfoItem[i].supplierId || null;
              infoObj.updatedBy = supplierInfoItem[i].updatedBy || null;
              infoObj.updatedTime = supplierInfoItem[i].updatedTime || null;
              infoObj.settlementTypeName =
                supplierInfoItem[i].settlementTypeName || null;
              // 增加一个字段
              infoObj.paymentTypeName =
                supplierInfoItem[0].paymentTypeName || null;
              supplierInfo.purchasePaymentInfo = infoObj;

              // 组装订单信息数据
              for (let j = 0; j < supplierOrderItem.length; j++) {
                let obj = {};
                let obj1 = supplierOrderItem[j];
                let applyAmount = Number(
                  (
                    obj1.totalAmount -
                    obj1.paidAmount -
                    obj1.waitPayAmount
                  ).toFixed(2)
                );
                obj.freightCharge = supplierOrderItem[j].freightCharge || 0;
                obj.applyAmount = applyAmount || null;
                obj.createdBy = supplierOrderItem[j].createdBy || null;
                obj.createdTime = supplierOrderItem[j].createdTime || null;
                obj.merchantId = supplierOrderItem[j].merchantId || null;
                obj.purchaseId = supplierOrderItem[j].purchaseId || null;
                obj.purchasePaymentInfoId =
                  supplierOrderItem[j].purchasePaymentInfoId || null;
                obj.purchasePaymentRelatedId =
                  supplierOrderItem[j].purchasePaymentRelatedId || null;
                obj.updatedBy = supplierOrderItem[j].updatedBy || null;
                obj.updatedTime = supplierOrderItem[j].updatedTime || null;
                obj.totalAmount = supplierOrderItem[j].totalAmount || null; // 应付总额
                // 增加几个字段
                obj.purchaseNumber =
                  supplierOrderItem[j].purchaseNumber || null; // 采购单号
                obj.paidAmount =
                  supplierOrderItem[j].paidAmount === null
                    ? "0.00"
                    : supplierOrderItem[j].paidAmount; // 已付款
                //供应商名称为*则屏蔽掉
                if (
                  this.paySupplierList[this.supplierInfoListItem]
                    .supplierName == "*"
                ) {
                  obj.paidAmount = "*";
                }
                obj.waitPayAmount =
                  supplierOrderItem[j].waitPayAmount === null
                    ? "0.00"
                    : supplierOrderItem[j].waitPayAmount; // 已申请待支付
                //供应商名称为*则屏蔽掉
                if (
                  this.paySupplierList[this.supplierInfoListItem]
                    .supplierName == "*"
                ) {
                  obj.waitPayAmount = "*";
                }
                infoList[j] = obj;
              }
              supplierInfo.purchasePaymentRelatedList = infoList;
              supplierInfoList.push(supplierInfo);
            }
            if (canShow) {
              v.model4 = true;
              this.supplierInfoList = supplierInfoList; // 当前显示的供应商数据 初始化显示第一条
            }
            this.supplierInfoList.forEach((item, index) => {
              this.$set(
                this.supplierInfoList[index].purchasePaymentInfo,
                "relatedImageList",
                []
              );
            });
            //这里申请付款对话框的表格重新申请接口
            let purchaseNumberSearch = this.selectionArr.map((item) => {
              return item.purchaseNumber;
            });
            this.getPurchaseInfo(purchaseNumberSearch).then((res) => {
              let datas = res.data.datas;
              this.supplierInfoList.forEach((itema, indexa) => {
                itema.purchasePaymentRelatedList.forEach((itemb, indexb) => {
                  datas.forEach((itemc) => {
                    if (itemb.purchaseNumber == itemc.purchaseNumber) {
                      itemc.applyRefundAmount = null;
                      itemc.applyAmount = itemb.applyAmount;
                      itemc.purchasePaymentInfoId = itemb.purchasePaymentInfoId;
                      itemc.purchasePaymentRelatedId =
                        itemb.purchasePaymentRelatedId;
                      this.$set(
                        this.supplierInfoList[indexa]
                          .purchasePaymentRelatedList,
                        indexb,
                        itemc
                      );
                    }
                  });
                });
              });
              //重新定义结算方式
              this.supplierInfoList.forEach((itema) => {
                let temp = "";
                itema.purchasePaymentRelatedList.forEach((itemb) => {
                  if (itemb.settlementTypeName && !temp) {
                    temp = itemb.settlementTypeName;
                  }
                });
                itema.purchasePaymentInfo.settlementTypeName = temp;
              });
            });
          }
        });
      }
    },
    showCurrentSupplierId(value) {
      this.supplierInfoListItem = value;
      this.payAmountStatusList[value].status =
        this.supplierInfoList[value].purchasePaymentInfo.settlementTypeName ==
          "款到发货"
          ? 0
          : 1;
    },
    showPayModalChange(value) {
      if (!value) {
        this.supplierInfoList = [];
        this.supplierInfoListItem = "0";
        this.supplierIdArr = [];
      }
    }, // 提交支付申请
    submitPayOrder() {
      if (this.payLoading) return;
      this.$refs.supplierInfoForm && this.$refs.supplierInfoForm.validate((validator) => {
        if (!validator) {
          this.$nextTick(() => {
            setTimeout(() => {
              const errorDemo = document.querySelector('.supplier-info-form .ivu-form-item-error .ivu-form-item-content');
              if (!errorDemo) return;
              const inputDemo = errorDemo.querySelector('.ivu-input-wrapper .ivu-input');
              const tipsTxtDemo = errorDemo.querySelector('.ivu-form-item-error-tip');
              if (tipsTxtDemo) {
                this.$Message.error(tipsTxtDemo.innerText || '');
              }
              if (!inputDemo) return;
              inputDemo.focus();
            })
          }, 300);
          return;
        }
        this.payLoading = true;
        this.tableAmountChange().finally(() => {
          let reqParams = this.deepCopy(this.supplierInfoList);
          for (let i = 0; i < reqParams.length; i++) {
            for (let j = 0; j < reqParams[i].purchasePaymentRelatedList.length; j++) {
              let item = reqParams[i].purchasePaymentRelatedList[j];
              delete reqParams[i].purchasePaymentInfo.paymentTypeName;
              delete item.purchaseNumber;
              delete item.paidAmount;
              delete item.waitPayAmount;
            }
          }
          reqParams.forEach((item) => {
            item.purchasePaymentInfo.applyType = 0;
          });
          //申请付款和申请退款的事业部id传到purchasePaymentInfo
          reqParams.forEach((itema) => {
            itema.purchasePaymentInfo.businessDeptId = itema.purchasePaymentRelatedList[0].businessDeptId;
          });
          this.axios.post(api.applyPayment, reqParams).then((res) => {
            if (res.data.code === 0) {
              this.$Message.success("提交成功！");
              this.supplierInfoList = [];
              this.showPayModal = false;
              this.getList();
            }
          }).finally(() => {
            this.payLoading = false;
          });
        });
      })
    },
    //提交退款申请
    submitRefundOrder() {
      let v = this;
      this.$refs["formValidate"].validate((valid) => {
        if (valid) {
          let reqParams = v.deepCopy(v.supplierInfoList);
          for (let i = 0; i < reqParams.length; i++) {
            for (
              let j = 0;
              j < reqParams[i].purchasePaymentRelatedList.length;
              j++
            ) {
              let item = reqParams[i].purchasePaymentRelatedList[j];
              if (item.totalAmount <= 0 || item.applyRefundAmount <= 0) {
                v.showCurrentSupplierId(String(i));
                v.$Message.error({
                  content: "应付/申请金额要大于0",
                  duration: 3,
                });
                return;
              } else if (item.totalAmount < item.applyRefundAmount) {
                v.showCurrentSupplierId(String(i));
                v.$Message.error({
                  content: "退款金额不能大于订单金额",
                  duration: 3,
                });
                return;
              } else {
                // 删除后台不需要的参数...
                delete reqParams[i].purchasePaymentInfo.paymentTypeName;
                delete item.purchaseNumber;
                delete item.paidAmount;
                delete item.waitPayAmount;
              }
            }
          }
          // if (!v.payLoading) {
          v.payLoading = true;
          reqParams.forEach((item) => {
            item.purchasePaymentInfo.applyType = 1;
          });
          //申请付款和申请退款的事业部id传到purchasePaymentInfo
          reqParams.forEach((itema) => {
            itema.purchasePaymentInfo.businessDeptId =
              itema.purchasePaymentRelatedList[0].businessDeptId;
          });
          v.axios
            .post(api.applyRefund, reqParams)
            .then((res) => {
              if (res.data.code === 0) {
                v.$Message.success("提交成功！");
                v.payLoading = false;
                v.supplierInfoList = [];
                v.model4 = false;
                v.getList();
              } else {
                this.$Message.error(res.data.message);
              }
            })
            .catch(() => {
              v.payLoading = false;
            });
        }
      });

      // }
    },
    // 重置时间筛选
    resetDate1() {
      this.pickData = [];
    },
    changeNumberType() {
      // 切换下拉框选值时，清空输入框
      this.numberValue = "";
    }, // 获取商品标签的数据
    GetProductLabelData() {
      this.axios.get(api.get_TagName).then((res) => {
        if (res.data.code == 0) {
          this.tagsList = res.data.datas;
        }
      });
    },
    dropOrderTag() {
      // 清空标签
      let v = this;
      if (v.selectionArr.length === 0 || v.selectionArr === null) {
        v.$Message.error("请选择订单");
        return false;
      }
      let purchaseIds = [];
      v.selectionArr.map((item) => {
        if (item.purchaseId) {
          purchaseIds.push(item.purchaseId);
        }
      });
      v.axios.put(api.batchDeleteTag, purchaseIds).then((response) => {
        if (response.data.code === 0) {
          v.$Message.success("清空标签成功");
          v.pageParamsStatus = true;
          v.resetTag();
        } else {
          v.$Message.error("系统繁忙，请重新尝试");
          v.resetTag();
        }
      });
    },
    setTag() {
      // 打标签
      let v = this;
      if (v.selectionArr.length === 0) {
        v.$Message.error("请选择订单");
      } else if (v.tagIdList.length === 0) {
        v.$Message.error("请选择标签");
      } else {
        let purchaseIds = [];
        v.selectionArr.map((item) => {
          if (item.purchaseId) {
            purchaseIds.push(item.purchaseId);
          }
        });
        let obj = {
          purchaseIds: purchaseIds,
          tagNames: v.tagIdList,
        };
        v.axios.post(api.batchFlagTag, JSON.stringify(obj)).then((response) => {
          if (response.data.code === 0) {
            v.$Message.success("标记成功");
            v.resetTag();
            v.setTagListStatus = false;
            v.pageParamsStatus = true;
          } else {
            v.$Message.error("操作失败，请重新尝试");
          }
        });
      }
    }, // 获取已入库商品总金额
    GetTotalNumber() {
      let query = [];
      if (this.selectionArr.length > 0) {
        this.selectionArr.map((item) => {
          query.push(item.purchaseId);
        });
      }
      this.axios
        .put(api.get_TotalNumber, query)
        .then((res) => {
          if (res.data.code == 0) {
            let data = res.data.datas;
            if (data.length > 0) {
              data.map((talg) => {
                this.supplierInfoList.forEach((item) => {
                  if (item.purchasePaymentRelatedList.length > 0) {
                    item.purchasePaymentRelatedList.forEach((ele) => {
                      if (ele.purchaseId === talg.purchaseId) {
                        // 加上运费
                        //这里totalAmount暂时注释
                        // ele.totalAmount = Number(
                        //   (talg.receiptTotalPrice + ele.freightCharge).toFixed(
                        //     2
                        //   )
                        // );
                        ele.applyAmount = Number(
                          (
                            talg.receiptTotalPrice +
                            ele.freightCharge -
                            ele.waitPayAmount
                          ).toFixed(2)
                        );
                      }
                    });
                  }
                });
              });
            } else {
              this.supplierInfoList.forEach((item) => {
                if (item.purchasePaymentRelatedList.length > 0) {
                  item.purchasePaymentRelatedList.forEach((ele) => {
                    // 加上运费
                    ele.totalAmount = Number(ele.freightCharge.toFixed(2));
                    ele.applyAmount = Number(
                      (ele.freightCharge - ele.waitPayAmount).toFixed(2)
                    );
                  });
                }
              });
            }
          }
        })
        .then(() => {
          // 暂时解决 '本次申请金额' 没有计算的问题
          //这里加上减去退款金额
          this.supplierInfoList.forEach((i) => {
            i.purchasePaymentRelatedList.forEach((j) => {
              j.applyAmount = Number(
                (
                  j.totalAmount -
                  j.paidAmount -
                  j.waitPayAmount -
                  j.refundAmountDisplay
                ).toFixed(2)
              );
            });
          });
        });
    },
    // 关闭、作废采购单
    VoidPurchaseOrder(purchaseNumber, type) {
      let v = this;
      let query = {
        purchaseNumber: purchaseNumber,
        purchaseStatus: type,
      };
      v.axios
        .put(api.put_closePurchaseInfo, JSON.stringify(query))
        .then((response) => {
          if (response.data.code === 0) {
            v.$Message.success("操作成功");
            v.pageParamsStatus = true;
          }
        });
    },
    // 批量向供应商下单
    orderForsupply() {
      if (!this.selectionArr.length) {
        this.$Message.error("请选择需要操作的数据！！");
        return;
      }
      this.dialogObj.modelVisible = true;
      this.dialogObj.list = [...this.selectionArr];
    },
    // 结束超发
    finishExceed() {
      if (this.isHaandExceed || this.isDisabledExceed) return;
      if (this.selectionArr.length == 0) {
        this.$Message.error("请选择需要操作的数据！！");
        return;
      }
      this.$Modal.confirm({
        title: '操作提示',
        content: `确定是否要结束超发采购单，数量：${this.selectionArr.length}`,
        onOk: () => {
          this.isHaandExceed = true;
          // this.axios.post(api.post_endOvershoot, {
          //   purchaseIdList: this.selectionArr.map(row => row.purchaseId)
          // }).then((res) => {
          this.axios.post(api.post_endOvershoot, this.selectionArr.map(row => row.purchaseId)).then((res) => {
            if (!res.data || res.data.code !== 0) return;
            this.$Message.success('操作成功！');
            this.getList();
          }).finally(() => {
            this.isHaandExceed = false;
          })
        },
        onCancel: () => { }
      });
    },
    showPurchaseDetail(type, row, index) {
      //type 1--查看 2--编辑(下单后修改)
      this.dialogDetail.data = row;
      this.dialogDetail.type = type;
      this.purchaseShow = "showOrderDetail";
    },
    showWareOrderDia(row) {
      this.dialogWare.data = row.receiptNo;
      this.isVisible = true;
    },
    changeAmount() {
      this.payAmountStatusList[this.supplierInfoListItem].status == 1
        ? this.GetTotalNumber()
        : this.applyPayment();
    },
    changeRemark() {
      for (let i in this.ordersData) {
        if (this.ordersData[i].remarks != null) {
          for (let j in this.ordersData[i].remarks) {
            if (
              this.ordersData[i].remarks[j].remark != "" &&
              this.ordersData[i].remarks[j].remark != null
            ) {
              this.ordersData[i].remarks[j].remark = this.ordersData[i].remarks[
                j
              ].remark.replace(/[\r\n]/g, "；");
            }
          }
        }
      }
    },
    // 时间处理
    changeTimeValue(params) {
      if (!this.$common.isEmpty(this.time1)) {
        let time = this.deepCopy(this.time1);
        const start = this.getDateTime((new Date(time[0]).valueOf() - 8 * 60 * 60 * 1000), "fulltime");// 减8小时传给后端
        const end = this.getDateTime((new Date(time[1]).valueOf() - 8 * 60 * 60 * 1000), "fulltime");// 减8小时传给后端
        const tiemJson = this.timeTypeArr.find(f => f.key == this.timeType);
        if (this.$common.isEmpty(tiemJson)) return;
        params[tiemJson.start] = start;
        params[tiemJson.end] = end;
      }
    },
    getPurchaseInfo(ids) {
      this.model4Loading = true
      let listString = ids.join(",");
      return new Promise((reslove, reject) => {
        this.axios.post(`/sps-service/sps/purchase/supplier/purchaseInfo?purchaseNumbers=${listString}`).then((res) => {
          reslove(res);
        });
      });
    },
    updatePicture(list) {
      this.supplierInfoList[
        this.supplierInfoListItem
      ].purchasePaymentInfo.relatedImageList.push(...list);
    },
    handleRemove(index) {
      this.supplierInfoList[
        this.supplierInfoListItem
      ].purchasePaymentInfo.relatedImageList.splice(index, 1);
    },
    handleView(index) {
      this.$refs.largePicture[index].seePic();
    },
    getBusinessDeptInfo() {
      this.axios
        .post("/sps-service/sps/common/businessDeptInfo")
        .then((res) => {
          this.businessDeptInfoList = res.data.datas;
        });
    },
    updatePrice(val) {
      if (val == 1) {
        let temp = JSON.parse(JSON.stringify(this.pageParams));
        temp.purchaseNumberList = [];
        return this.axios
          .post(`/sps-service/sps/purchase/batchUpdateAliAmount`, temp)
          .then((res) => {
            this.$Message.success("更新价格成功");
            this.getList();
          });
      }
      if (this.selectionArr.length == 0) {
        return this.$Message.warning("请选择订单");
      }
      if (val == 0) {
        let temp = this.selectionArr.map((item) => {
          return item.purchaseId;
        });
        this.axios
          .post(`/sps-service/sps/purchase/updateAliAmount`, temp)
          .then((res) => {
            this.$Message.success("更新价格成功");
            this.getList();
          });
      }
    },
  },
};
</script>
<style lang="less">
.verticalCheck .ivu-checkbox {
  margin-right: 20px;
}

/* .supplierTabsBar .ivu-tabs-nav-prev,
.supplierTabsBar .ivu-tabs-nav-next {
  display: none;
} */

.trimming .buttonsArrows .arrowDown {
  margin: 10px 0 0 2px;
}

.tabsBgcolor .ivu-tabs {
  background-color: #fff;
}

.supOrderForm textarea.ivu-input {
  height: 85px;
}

.purchaseBtn {
  margin-left: 12px;
}

.purshaseOrderTag {
  font-size: 12px;
  font-weight: 400;
  padding: 2px 4px;
  line-height: 16px;
  border-radius: 2px;
  margin: 6px 4px;
  width: fit-content;
}

.purshaseOrderOverText {
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

.purchaseOrderDrop {
  max-height: 500px !important;
}

.purchase-order-modal {
  .ivu-modal-body {
    max-height: calc(100vh - 292px);
    overflow: auto;
  }
}
</style>
<style lang="less" scoped>
.pos-rel {
  position: relative;
}

.platformParamsSelect {
  :deep(.ivu-select-selected-value) {
    font-size: 12px;
  }
}

.iconAlert {
  font-size: 26px;
  color: #ff9900;
}

.purchaseVoidModal {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.purchaseOrderCheUl {
  overflow: hidden;
  width: 300px;
  list-style: none;
}

.purchaseOrderCheLi {
  width: 100px;
  float: left;
}

.tabsBox {
  padding: 25px 10px;
}

.searchBox {
  margin-top: -30px;
}

.remarkThree {
  -webkit-line-clamp: 3;
}

.table-form-item {
  margin: 0;
}
</style>
