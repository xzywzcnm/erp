<template>
  <div>
    <template>
      <div class="commonFilter">
        <div class="card-container">
          <div class="card-content">
            <div class="platformParamsSelect">
              <Form ref="pageParams" :model="pageParams" :label-width="labelWidth">
                <dyt-filter>
                  <FormItem label="供应商" prop="supplierName">
                    <dyt-input placeholder="请输入供应商名称" v-model="pageParams.supplierName" />
                  </FormItem>
                  <FormItem label="SPU" prop="spuList">
                    <dyt-input-tag :limit="1" :string="false" type="textarea" placeholder="请输入SPU，多个用逗号或换行分隔"
                      v-model="pageParams.spuList" />
                  </FormItem>
                  <FormItem label="SKU" prop="skuList">
                    <dyt-input-tag :limit="1" :string="false" type="textarea" placeholder="请输入SKU，多个用逗号或换行分隔"
                      v-model="pageParams.skuList" />
                  </FormItem>
                  <FormItem label="商品中文名称" prop="productGoodsNameList">
                    <dyt-input-tag :limit="1" :string="false" type="textarea" placeholder="请输入商品中文名称，多个用逗号或换行分隔"
                      v-model="pageParams.productGoodsNameList" />
                  </FormItem>
                  <FormItem label="品牌" prop="goodsBrandIdList">
                    <dyt-select v-model="pageParams.goodsBrandIdList" filterable clearable multiple :max-tag-count="1">
                      <Option v-for="item in brandArr" :value="item.code" :key="item.code">{{ item.name }}</Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="商品分类" prop="goodsCategoryIdList">
                    <!-- :default-expand-level="Infinity" -->
                    <erpTreeSelect v-model="treeSelectCategoryValue" :limit="1" :multiple="true"
                      :normalizer="treeNormalizer" :options="proCategoryArr" :default-expand-level="1"
                      :appendToBody="true" placeholder="请选择" noResultsText="无匹配数据" @input="treeSelectCategoryChange" />
                  </FormItem>
                  <FormItem label="1688商品" prop="isAliSupplier">
                    <dyt-select v-model="pageParams.isAliSupplier" filterable clearable>
                      <Option value="1">是</Option>
                      <Option value="0">否</Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="已匹配1688" prop="isMateAli">
                    <dyt-select v-model="pageParams.isMateAli" filterable clearable>
                      <Option value="1">是</Option>
                      <Option value="0">否</Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="1688商品匹配SPU" :label-width="120" prop="platformSpuId">
                    <Input v-model="pageParams.platformSpuId" placeholder="请输入1688商品SPU" :maxlength="50" />
                  </FormItem>
                  <FormItem label="1688商品规格" prop="platformSpecId">
                    <Input v-model="pageParams.platformSpecId" placeholder="请输入1688商品规格ID" :maxlength="100" />
                  </FormItem>
                  <FormItem label="最新报价时间" prop="quotationTime">
                    <DatePicker type="datetimerange" transfer v-model="pageParams.quotationTime"
                      format="yyyy-MM-dd HH:mm:ss" :options="dateOptions" placeholder="选择日期" />
                  </FormItem>
                  <FormItem label="供应商类型" prop="supplierTypeList">
                    <dyt-select v-model="pageParams.supplierTypeList" clearable multiple :max-tag-count="1">
                      <Option v-for="(item, index) in supplierTypeArr" :value="item.dataValue" :key="index">{{
                        item.dataDesc }}</Option>
                    </dyt-select>
                  </FormItem>
                  <div slot="operation">
                    <Button type="primary" @click="searchOrder" :disabled="SearchDisabled" icon="ios-search">搜索</Button>
                    <Button @click="reset" style="margin-left: 10px;" v-once icon="md-refresh">重置</Button>
                  </div>
                </dyt-filter>
              </Form>
            </div>
          </div>
        </div>
      </div>
      <div class="flexBox spaceBetween">
        <div>
          <div class="tableControl" v-if="currentTabItem == '3'">
            <Button type="primary" v-if="getPermission('supplierPrice_save')" @click="editPriceFn(true, null)"
              class="iconbuttons" style="margin-left: 12px">
              添加报价
            </Button>
            <Dropdown @on-click='exportMt' style="margin-left: 20px">
              <Button type="primary" style="margin-left: 12px">
                <span class="icon iconfont" style="font-size: 12px">&#xe639;</span>Excel导出<Icon type="md-arrow-dropdown">
                </Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem name='0'>导出选中数据</DropdownItem>
                <DropdownItem name='1'>导出所有结果集</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Button type="primary" @click="importExcel = true" class="iconbuttons" style="margin-left: 20px">
              批量导入
            </Button>
            <Button type="primary" @click="cloudImportExcel = true" class="iconbuttons" style="margin-left: 20px"
              v-if="getPermission('supplierPrice_importCloudWarehouseGoods')">
              云仓批量导入
            </Button>
            <Button type="primary" @click="batchOperatingFn('4')" class="iconbuttons" style="margin-left: 20px">
              批量作废
            </Button>
          </div>
          <div class="tableControl" v-else-if="currentTabItem == '1'">
            <Button type="primary" v-if="getPermission('supplierPrice_save')" @click="editPriceFn(true, null)"
              class="iconbuttons" style="margin-left: 12px">
              添加报价
            </Button>
            <Button type="primary" v-if="getPermission('supplierPrice_submit')" @click="batchOperatingFn('0')"
              class="iconbuttons" style="margin-left: 20px">
              提交
            </Button>
            <Button type="primary" v-if="getPermission('supplierPrice_importSupplierGoods')" @click="importExcel = true"
              class="iconbuttons" style="margin-left: 20px">
              批量导入
            </Button>
            <Dropdown @on-click='exportMt' v-if="getPermission('supplierPrice_export')" style="margin-left: 20px">
              <Button type="primary" style="margin-left: 12px">
                <span class="icon iconfont" style="font-size: 12px">&#xe639;</span>
                Excel导出<Icon type="md-arrow-dropdown"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem name='0'>导出选中数据</DropdownItem>
                <DropdownItem name='1'>导出所有结果集</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Button type="primary" v-if="getPermission('supplierPrice_batchOperation')" @click="batchOperatingFn('5')"
              class="iconbuttons" style="margin-left: 20px">
              删除
            </Button>
          </div>
          <div class="tableControl" v-else-if="currentTabItem == '2'">
            <Button type="primary" @click="batchOperatingFn('1')" class="iconbuttons" style="margin-left: 12px">
              审核通过
            </Button>
            <!-- <Button type="primary" @click="batchOperatingFn('2')" class="iconbuttons" style="margin-left: 20px"> -->
            <Button type="primary" @click="operationReject(false)" class="iconbuttons" style="margin-left: 20px">
              审核驳回
            </Button>
          </div>
          <div class="tableControl" v-else-if="currentTabItem == '4'">
            <Button type="primary" @click="batchOperatingFn('3')" class="iconbuttons" style="margin-left: 12px">
              移入草稿
            </Button>
          </div>
        </div>
        <div style="margin-right: 20px">
          <span>排序方式：</span>
          <Button-group>
            <Button :type="item.checked ? 'primary' : 'default'" v-for="item in sortData" @click="clickSortButton(item)"
              :key="item.value">
              {{ item.label }}
              <Icon type="md-arrow-up" v-if="item.checked && !item.isDesc" />
              <Icon type="md-arrow-down" v-if="item.checked && item.isDesc" />
            </Button>
          </Button-group>
        </div>
      </div>
      <div class="supplierTabsBar commonFilter normalTop">
        <template>
          <Tabs v-model="currentTabItem" @on-click="showCurrentPage">
            <TabPane v-for="(item) in tabItems" :label="item.name" :key="item.key" :name="String(item.key)"></TabPane>
          </Tabs>
        </template>
      </div>
      <div class="commonFilter">
        <div class="orderTable">
          <keep-alive>
            <Table highlight-row border :height="priceTableHeight" :loading="Tableloading" :columns="productColumns"
              @on-selection-change="getSelectValue" :span-method="handleSpan" :data="priceData">
            </Table>
          </keep-alive>
          <div class="table-page clear">
            <div class="table-page-right">
              <keep-alive>
                <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator
                  :current="pageParams.pageNum" show-sizer @on-page-size-change="changePageSize" placement="top"
                  :page-size-opts="pageArray"></Page>
              </keep-alive>
            </div>
          </div>
        </div>
      </div>
    </template>
    <!--添加/编辑报价-->
    <Modal v-model="isShowEditPrice" :width="priceCurrentTabItem == '0' ? 1200 : 1280"
      :styles="{ top: priceCurrentTabItem == '0' ? '100px' : '20px' }" :mask-closable="!isEditPrice" :closable="false">
      <div class="supplierTabsBar">
        <Tabs v-model="priceCurrentTabItem" @on-click="priceCurrentChangeFn">
          <TabPane v-for="(item, index) in editPriceTabItems" :label="item.value" :key="item.key" :name="String(item.key)"
            v-if="index === 0 || (index == 1 && isShowAddSupplier)"></TabPane>
        </Tabs>
      </div>
      <template v-if="priceCurrentTabItem == '0'">
        <div class="normalTop" v-if="isShowEditPrice">
          <Form ref="editPrice" :model="editPrice" :label-width="110" :rules="ruleValidate" class="edit-price-form">
            <div class="edit-price-content">
              <div class="edit-price-left">
                <FormItem label="SKU编号:" prop="skuNo" class="form-item-line">
                  <Input v-model.trim="editPrice.skuNo" disabled></Input>
                  <Button type="primary" class="iconbuttons" @click="chooseSkuFn" style="margin-left: 12px"
                    v-if="editStatus == 'add'" :loading="skuLoading">
                    选择SKU
                  </Button>
                </FormItem>
                <FormItem label="商品名称:">
                  <Input v-model="editPrice.goodsName" disabled></Input>
                </FormItem>
                <FormItem label="Color:">
                  <Input v-model="editPriceColor" disabled></Input>
                </FormItem>
                <FormItem label="Size:">
                  <Input v-model="editPriceSzie" disabled></Input>
                </FormItem>
                <FormItem label="币种:" prop="currency">
                  <dyt-select v-model="editPrice.currency" clearable filterable :disabled="!isEditPrice || hasInquiryCode"
                    placeholder="请选择币种">
                    <Option v-for="(item) in currencyArr" :value="item.dataValue" :key="item.dataValue">{{ item.dataDesc
                    }}
                    </Option>
                  </dyt-select>
                </FormItem>
                <!-- 价格 -->
                <div class="edit-price-item-line">
                  <div class="price">
                    价格:
                  </div>
                  <div class="flex-100">
                    <div v-for="(parentItem, parentIndex) in editPrice.priceDetailsList" :key="parentIndex"
                      class="edit-price-item-line">
                      <div class="form-line-height"> 数量≥</div>
                      <FormItem :prop="'priceDetailsList.' + parentIndex + '.quantity'" :label-width="0"
                        class="line-item-ml10 flex-100" :rules="[
                          { validator: validateInteger(), trigger: 'blur' },
                          { validator: validateInteger(), trigger: 'change' }
                        ]">
                        <dytInput v-model="parentItem.quantity" :disabled="!isEditPrice || hasInquiryCode"></dytInput>
                      </FormItem>
                      <div class="form-line-height line-item-ml10">价格</div>
                      <FormItem :prop="'priceDetailsList.' + parentIndex + '.price'" :label-width="0"
                        class="line-item-ml10 flex-100" :rules="[
                          { required: true, message: '价格不能为空', trigger: 'blur' },
                          { validator: validatePrice(), trigger: 'change' }
                        ]">
                        <dytInput v-model="parentItem.price" :disabled="!isEditPrice || hasInquiryCode"></dytInput>
                      </FormItem>
                      <div v-if="isEditPrice && !hasInquiryCode" class="form-line-height">
                        <span class="btnAction" @click="addPriceAction"
                          v-if="parentIndex === editPrice.priceDetailsList.length - 1">
                          <Icon type="md-add-circle" size="26" style="margin-left: 6px; margin-top: 5px;" />
                        </span>
                        <span class="btnAction" @click="removePriceAction(parentIndex)"
                          v-if="editPrice.priceDetailsList.length > 1">
                          <Icon type="md-remove-circle" size="26" style="margin-left: 6px; margin-top: 5px;" />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="form-line-height"
                    v-if="(!editPrice.priceDetailsList || editPrice.priceDetailsList.length == 0) && isEditPrice">
                    <span class="btnAction" @click="addPriceAction">
                      <Icon type="md-add-circle" size="26" style="margin-left: 6px; margin-top: 5px;" />
                    </span>
                  </div>
                </div>
                <FormItem label="最少起订量:" prop="minOrderQuantity">
                  <dytInput v-model.trim="editPrice.minOrderQuantity" :disabled="!isEditPrice || hasInquiryCode" number
                    placeholder="请输入最少起订量" />
                </FormItem>
                <FormItem label="预计货期(天):" prop="estimateDeliveryDays">
                  <dytInput v-model.trim="editPrice.estimateDeliveryDays" :disabled="!isEditPrice || hasInquiryCode"
                    number placeholder="请输入预计货期" />
                </FormItem>
                <FormItem label="倍数备货值:" prop="stockMultiple">
                  <dytInput v-model.trim="editPrice.stockMultiple" :disabled="!isEditPrice || hasInquiryCode" number
                    placeholder="请输入倍数备货值" />
                </FormItem>
                <FormItem label="是否首选供应商:">
                  <Checkbox :disabled="!isEditPrice" v-model="isFirstCheck"></Checkbox>
                </FormItem>
              </div>
              <div class="edit-price-right">
                <FormItem label="供应商:" prop="supplierName" class="form-item-line">
                  <dyt-select ref="supplierSelect" v-model="editPrice.supplierName" :disabled="editStatus != 'add'"
                     @on-clear="clearSupplier">
                    <Option v-for="(item, index) in supplierArr" :value="item.supplierName" :key="index"
                      @click.native="supplierChangeFn(item, index); getSupplierDetail(item.supplierId)">{{
                        item.supplierName }}</Option>
                    <Option :value="supplierOption.supplierName"
                      v-if="supplierOption.supplierId || supplierOption.supplierName === '*'" :key="supplierArr.length">{{
                        supplierOption.supplierName }}</Option>
                  </dyt-select>
                  <!-- <Button type="text" shape="circle" @click="addSupplierFn"
                    v-if="isShowAddSupBtn || supplierArr.length == 0">
                    <Icon type="md-add-circle" size="22"></Icon>
                  </Button> -->
                </FormItem>
                <FormItem label="地址:" class="form-item-line">
                  <dyt-select v-model="editPrice.countryId" ref="countrySelect" clearable filterable
                    @on-change="countryChangeFn" :disabled="!isEditPrice">
                    <Option v-for="(item) in countryArr" :value="item.countryId" :key="item.countryId">{{ item.cnName }}
                    </Option>
                  </dyt-select>
                  <dyt-select ref="provinceSelect" clearable filterable v-model="editPrice.provinceId"
                    @on-open-change="getProvinceFn" @on-change="provinceChangeFn" :disabled="!isEditPrice"
                    class="line-item-ml10">
                    <Option v-for="(item) in provinceArr" :value="item.stateId" :key="item.stateId">{{ item.cnName }}
                    </Option>
                  </dyt-select>
                  <dyt-select ref="citySelect" clearable filterable v-model="editPrice.cityId" @on-open-change="getCityFn"
                    :disabled="!isEditPrice" class="line-item-ml10">
                    <Option v-for="(item) in cityArr" :value="item.cityId" :key="item.cityId">{{ item.cnName }}</Option>
                  </dyt-select>
                </FormItem>
                <FormItem label="供应商内部货号:" prop="supplierGoodsCode">
                  <dytInput v-model="editPrice.supplierGoodsCode" :disabled="!isEditPrice" @on-keyup="btKeyUp"
                    placeholder="请输入供应商内部货号" />
                </FormItem>
                <FormItem label="采购链接:" prop="supplierPurchaseLink" class="form-item-line">
                  <dytInput v-model="editPrice.supplierPurchaseLink"
                    :disabled="!isEditPrice || $common.isEmpty(editPrice.supplierId)" :maxlength="1000"
                    :placeholder="`${$common.isEmpty(editPrice.supplierId) ? '请选择供应商后再操作！' : '请输入采购链接'}`" />
                  <Button type="primary" @click="matchingAlibaba({ productUrl: editPrice.supplierPurchaseLink }, true)"
                    v-if="isEditPrice && isAlibabaSupplier" :disabled="$common.isEmpty(editPrice.supplierPurchaseLink)"
                    class="line-item-ml10" :loading="matchingLoading">
                    匹配
                  </Button>
                </FormItem>
                <FormItem v-if="hasInquiryCode" label="询价单:">
                  <div style="color:#2DABF6;text-decoration: underline;cursor:pointer" @click="getInquiryCode(editPrice)">
                    {{ editPrice.inquiryCode }}
                  </div>
                </FormItem>
                <FormItem label="1688商品:" v-if="isAlibabaSupplier">
                  <Table ref="skuTable" highlight-row border height="240" :columns="alibabaColumn"
                    :data="alibabaData.addAliProductDetailVOList"></Table>
                  <Spin fix v-if="matchingLoading"></Spin>
                </FormItem>
                <FormItem label="是否已匹配1688商品:" :label-width="130" prop="mateAli" v-if="isAlibabaSupplier">
                  <Checkbox v-model="editPrice.mateAli" :disabled="true"></Checkbox>
                </FormItem>
              </div>
            </div>
          </Form>
        </div>
        <div slot="footer" style="text-align: center;">
          <Button type="primary" @click="savePriceFn('editPrice', 1)" style="width: 100px;margin-right: 30px;"
            v-if="isEditPrice && getPermission('supplierPrice_supplierSave')" :loading="savePriceLoading">保存至草稿
          </Button>
          <Button type="primary" @click="submitPriceFn('editPrice')" style="width: 100px;margin-right: 30px;"
            v-if="isEditPrice && getPermission('supplierPrice_supplierSubmit')" :loading="submitPriceLoading">提交
          </Button>
          <Button type="primary" @click="isShowEditPrice = false" style="width: 100px;">关闭</Button>
        </div>
      </template>
      <template v-if="priceCurrentTabItem == '1'">
        <addSupplier :editSupplier="editSupplier" :isEditSupplier="true" :editSupplierType="'1'" :source="'price'"
          @save-supplier="saveSupplierFn" @submit-supplier="submitSupplierFn"></addSupplier>
        <div slot="footer" v-show="false">

        </div>
      </template>
    </Modal>
    <div v-if="isShowAddPro">
      <Modal v-model="isShowAddPro" :width="1100" title="添加商品" :styles="{ top: '50px' }" :mask-closable="false"
        class='addProductModal1 headerBar addProductBar'>
        <addProduct :onlyChoseOne=true :disabledSlt='false' :from='true' @addProductSuccess='addProductSuccess'
          @addProductCancel='addProductCancel' :eliminateData='proData'></addProduct>
        <div slot="footer" v-show="false">

        </div>
      </Modal>
    </div>
    <!--选择SKU-->
    <div class="chooseSku">
      <Modal v-model="isShowChooseSku" :width="640" title="选择SKU" :styles="{ top: '50px' }" :mask-closable="false">
        <div>
          <div>
            <Input v-model="searchSku" style="width: 350px;margin: 0 auto;" placeholder="SKU编号" @on-enter="searchSkuFn">
            <Button slot="append" icon="ios-search" type="primary" @click="searchSkuFn"></Button>
            </Input>
          </div>
          <div class="normalTop20">
            <Table ref="skuTable" highlight-row border :loading="Tableloading" :height="skuTableHeight"
              :columns="skuColumn" :data="skuData"></Table>
            <div class="table-page clear">
              <div class="table-page-right">
                <Button icon="chevron-left" style="margin-right: 10px;" @click="skuLeftFn"
                  :disabled="skuParams.disSkuLeft"></Button>
                <Button type="primary">{{ skuParams.pageNum }}</Button>
                <Button icon="chevron-right" style="margin-left: 10px;" @click="skuRightFn"
                  :disabled="skuParams.disSkuRight"></Button>
                <br />
                <!-- <Page :total="skuParams.total" @on-change="skuChangePage" show-total :page-size="skuParams.pageSize" :current="skuParams.pageNum" placement="top"></Page> -->
              </div>
            </div>
          </div>
        </div>
        <div slot="footer">
          <!-- <Button type="primary" @click="confirmSku" size="large" style="width: 80px;margin-right: 30px;">确定</Button>
          <Button type="primary" @click="isShowChooseSku = false" size="large" style="width: 80px;margin-right: 30px;">取消</Button> -->
        </div>
      </Modal>
    </div>
    <!--历史价格-->
    <Modal v-model="isShowHisPrice" :width="820">
      <div class="supplierTabsBar">
        <template>
          <Tabs v-model="hisPriceCurrentTabItem">
            <TabPane v-for="(item, index) in hisPriceTabItems" :label="item.value" :key="item.key" :name="String(index)">
            </TabPane>
          </Tabs>
        </template>
        <div v-if="hisPriceCurrentTabItem === '0'">
          <Table ref="hisPriceTable" highlight-row border :loading="Tableloading" :columns="hisPriceColumn1"
            :data="hisPriceData1"></Table>
        </div>
        <!-- <div class="normalTop20" v-if="hisPriceCurrentTabItem === '1'">
          <dTable ref="hisPriceTable" highlight-row border :columns="hisPriceColumn2" :data="hisPriceData2" @on-selection-change="getSelectSku"></dTable>
        </div> -->
        <div class="table-page clear">
          <div class="table-page-right">
            <Page :total="hisPriceParams.total" @on-change="hisPriceChangePage" show-total
              :page-size="hisPriceParams.pageSize" show-elevator :current="hisPriceParams.pageNum" show-sizer
              @on-page-size-change="hisPriceChangePageSize" placement="top" :page-size-opts="pageArray"></Page>
          </div>
        </div>
      </div>
      <div slot="footer">
        <Button type="primary" @click="isShowHisPrice = false" size="large" style="width: 120px;">关闭</Button>
      </div>
    </Modal>
    <!--批量导入-->
    <Modal v-model="importExcel" title="批量导入" @on-ok="importExcel = false" class-name="verticalCenterModal"
      @on-cancel="importExcel = false" :styles="{ top: '280px' }" width="400">
      <template
        v-if="uploadList.length == 0 || (uploadList.length > 0 && uploadList[uploadList.length - 1].status === 'finished')">
        <div style="text-align:center;margin:20px 0;">
          <dytUpload ref="import" type="drag" :format="['XLS', 'XLSX']" :action="batchImport" name='file'
            :headers='headObj' :on-success='okUpload' :on-error='uploadError' :show-upload-list='false'
            :onFormatError="formatError">
            <div style="padding: 20px 0">
              <Icon type="ios-cloud-upload" size="60"></Icon>
              <p>导入</p>
            </div>
          </dytUpload>
        </div>
        <div style="text-align:center;">
          <a href="javascript:void(0)" @click="downloadEcxel()">下载Excel文件模板</a>
        </div>
      </template>
      <template v-else>
        <div style="margin: 20px 0">
          <Progress v-if="uploadList[uploadList.length - 1].showProgress"
            :percent="uploadList[uploadList.length - 1].percentage" hide-info></Progress>
        </div>
      </template>
      <div slot="footer">

      </div>
    </Modal>
    <!-- 云仓批量导入 -->
    <Modal v-model="cloudImportExcel" title="云仓批量导入" @on-ok="cloudImportExcel = false" class-name="verticalCenterModal"
      @on-cancel="cloudImportExcel = false" :styles="{ top: '280px' }" width="400">
      <template
        v-if="cloudUploadList.length == 0 || (cloudUploadList.length > 0 && cloudUploadList[cloudUploadList.length - 1].status === 'finished')">
        <div style="text-align:center;margin:20px 0;">
          <dytUpload ref="cloudImport" type="drag" :format="['XLS', 'XLSX']" :action="cloudBatchImport" name='file'
            :headers='headObj' :on-success='cloudOkUpload' :on-error='cloudUploadError' :show-upload-list='false'
            :onFormatError="formatError">
            <div style="padding: 20px 0">
              <Icon type="ios-cloud-upload" size="60"></Icon>
              <p>导入</p>
            </div>
          </dytUpload>
        </div>
        <div style="text-align:center;">
          <a href="javascript:void(0)" @click="cloudDownloadEcxel()">下载Excel文件模板</a>
        </div>
      </template>
      <template v-else>
        <div style="margin: 20px 0">
          <Progress v-if="cloudUploadList[cloudUploadList.length - 1].showProgress"
            :percent="cloudUploadList[cloudUploadList.length - 1].percentage" hide-info></Progress>
        </div>
      </template>
      <div slot="footer">

      </div>
    </Modal>
    <!-- 匹配1688商品 -->
    <Modal v-model="isShowProductMatch" title="1688商品匹配" width="1200px">
      <div class="normalTop">
        <Form ref="matchProduct" :model="matchProduct" :label-width="110" class="edit-price-form">
          <div class="edit-price-content">
            <div class="edit-price-left">
              <FormItem label="SKU编号:" prop="skuNo" class="form-item-line">
                <Input v-model.trim="matchProduct.skuNo" disabled></Input>
              </FormItem>
              <FormItem label="商品名称:">
                <Input v-model="matchProduct.goodsName" disabled></Input>
              </FormItem>
              <FormItem label="Color:">
                <Input v-model="goodsColor" disabled></Input>
              </FormItem>
              <FormItem label="Size:">
                <Input v-model="goodsSize" disabled></Input>
              </FormItem>
              <FormItem label="供应商:">
                <Input v-model="matchProduct.supplierName" disabled></Input>
              </FormItem>
              <FormItem label="采购链接:">
                <dytInput v-model="matchProduct.supplierPurchaseLink" :maxlength="1000" />
                <div style="display:flex;justify-content:space-between">
                  <Button type="primary" @click="matchingAlibaba({ productUrl: matchProduct.supplierPurchaseLink }, true)"
                    :disabled="$common.isEmpty(matchProduct.supplierPurchaseLink)"
                    style="margin-top:10px;margin-right:20px" class="line-item-ml10" :loading="matchingLoading">
                    匹配
                  </Button>
                  <div style="margin-top: 10px;">
                    是否已匹配1688商品:<Checkbox v-model="matchProduct.mateAli" disabled></Checkbox>
                  </div>
                </div>
              </FormItem>
            </div>
            <div class="edit-price-right">
              <FormItem label="1688商品:">
                <Table ref="skuTable" highlight-row border :height="skuTableHeight" :columns="alibabaColumn"
                  :data="alibabaData.addAliProductDetailVOList"></Table>
                <Spin fix v-if="matchingLoading"></Spin>
              </FormItem>
            </div>
          </div>
        </Form>
      </div>
      <div slot="footer" style="text-align: center;">
        <Button type="primary" @click="submitPriceFn('matchProduct')" style="width: 100px;margin-right: 20px;">提交</Button>
        <Button type="primary" @click="isShowProductMatch = false" style="width: 100px;">关闭</Button>
      </div>
    </Modal>
    <inquiryFormModal :dialogObj="dialogObj"></inquiryFormModal>
  </div>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/common_mixin";
import tableMixin from "@/components/mixin/table_mixin";
// import priceTable from "./common/priceTable";
import addProduct from "@/components/common/addProduct";
import addSupplier from "./common/addSupplier";
import inquiryFormModal from "./common/inquiryFormModal";

export default {
  mixins: [Mixin, tableMixin],
  components: {
    // priceTable,
    addSupplier,
    addProduct,
    inquiryFormModal
  },
  data() {
    let self = this;
    return {
      isShowAddPro: false,
      proData: [],
      sortData: [
        {
          label: "最新报价时间",
          value: "createdTime",
          checked: true,
          isDesc: true,
        }
      ],
      pageParamsStatus: false,
      isShowEditPrice: false,
      isEditPrice: false, // 是否可编辑
      editStatus: "",
      matchingLoading: false, // 是否匹配中
      savePriceLoading: false, // 防止保存请求完之前，再次点击保存
      submitPriceLoading: false, // 防止提交请求完之前，再次点击提交
      skuLoading: false,
      editPriceColor: '',
      editPriceSzie: '',
      isShowChooseSku: false,
      isShowHisPrice: false,
      isFirstCheck: false, // 是否为首选供应商
      importExcel: false, // 批量导入
      cloudImportExcel: false,//云仓批量导入
      isShowAddSupBtn: false, // 是否显示'新增供应商'按钮
      isShowAddSupplier: false, // 是否显示'新增供应商'
      batchImport: api.importSupplierGoods, // 导入EXCEL
      cloudBatchImport: api.cloudImportSupplierGoods, // 导入EXCEL
      uploadList: [],
      cloudUploadList: [],//云仓导入list
      supplierTypeArr: [],  //供应商类型列表数据
      searchSku: "",
      chosenSku: {},
      tableHeight: self.getTableHeight(420),
      skuTableHeight: self.getTableHeight(360),
      priceTableHeight: self.getTableHeight(340),
      totalPage: 0,
      total: 0,
      curPage: 1,
      currentTabItem: "3", // 标签页
      priceCurrentTabItem: "0", // 添加、编辑报价
      hisPriceCurrentTabItem: "0", // 历史价格标签页
      isClickAble: false,
      oldAlibabaColumn: [],
      isShowProductMatch: false,
      goodsColor: '', //1688匹配商品颜色
      goodsSize: '', //1688匹配商品尺寸
      alibabaColumn: [
        {
          key: 'image',
          title: '图片',
          align: 'center',
          width: '90',
          render: (h, params) => {
            let imageUrl = params.row.imagePath;
            let imageKey = 'imagePath';
            // 当对应的 sku 图不存在时使用 主图
            if (this.$common.isEmpty(params.row.imagePath)) {
              imageUrl = params.row.imageUrl;
              imageKey = 'imageUrl';
            }
            return ('div', {
              style: {
                padding: '5px 0'
              }
            }, this.tableImg(h, params, imageKey, imageUrl));
          }
        },
        {
          key: 'operation',
          title: '操作',
          align: 'center',
          minWidth: 90,
          render: (h, { row }) => {
            return h('Button', {
              props: {
                type: 'primary',
                size: 'small',
                disabled: (!this.isEditPrice ? this.isShowProductMatch ? false : true : false) || this.editPrice.platformSkuId === row.platformSkuId || this.matchProduct.platformSkuId === row.platformSkuId
              },
              on: {
                click: () => {
                  // 判断是修改报价的提价还是1688商品匹配提交
                  if (this.isShowProductMatch) {
                    this.checkAlibabaProduct('matchProduct', row)
                  } else {
                    this.checkAlibabaProduct('editPrice', row)
                  }
                }
              }
            }, '选择');
          },

        },
      ],
      alibabaData: {
        addAliProductDetailVOList: []
      },
      tabItems: [
        {
          key: "3",
          name: "正式报价",
        },
        {
          key: "1",
          name: "草稿",
        },
        {
          key: "2",
          name: "待审核",
        },
        {
          key: "4",
          name: "已作废",
        },
      ],
      relatedPro: {
        relatedPlatformGoods: "",
        supplierGoodsId: "",
      },
      hisPriceTabItems: [
        {
          key: 0,
          value: "历史报价",
        } /* {
         key: 1,
         value: '历史采购价'
         } */,
      ],
      editPriceTabItems: [
        {
          key: "0",
          value: "编辑/添加报价",
        },
        {
          key: "1",
          value: "新增供应商",
        },
      ],
      aliStatusArr: [
        {
          title: "全部状态",
          type: 0,
        },
        {
          title: "未关联1688商品",
          type: 1,
        },
        {
          title: "待关联1688商品",
          type: 2,
        },
        {
          title: "已关联1688商品",
          type: 3,
        },
      ],
      treeSelectCategoryValue: [],
      productCategoryJson: {},
      pageParams: {
        pageNum: 1,
        pageSize: 10,
        isAliSupplier: null, // 是否1688商品（0：否 1：是）
        isMateAli: null, // 是否匹配1688商品（0：否，1：是）
        auditStatus: 3, // 1待提交，2待审核，3已审核，4已作废
        relationStatus: null, // null全部 1未关联商品，2待关联链接，3已关联商品
        skuOrName: null, // 商品sku编号或商品名称
        supplierName: '', // 供应商名称
        supplierTypeList: [],
        spuList: [], //
        skuList: [], //
        platformSpuId: null, // 1688商品匹配SPU
        platformSpecId: null,  // 1688商品匹配规格ID
        productGoodsNameList: [], // 商品中文名称
        goodsCategoryIdList: [], // 商品分类
        goodsBrandIdList: [], // 品牌
        startQuotationTime: null, // 开始最新报价时间
        endQuotationTime: null, // 结束最新报价时间
        orderBy: 'createdTime',
        upDown: 'DESC',
        businessDeptIds: null
      },
      selectionArr: [], // 已选中表格行数据
      brandArr: [], // 品牌
      proCategoryArr: [],
      searchTypeArr: [
        {
          title: "按商品SKU编号",
          type: 1,
        },
        {
          title: "按商品名称",
          type: 2,
        },
        {
          title: "按商品名称模糊搜索",
          type: 3,
        },
        {
          title: "按供应商名称搜索",
          type: 4,
        },
      ],
      priceData: [], // 主table数据
      hisPriceColumn1: [
        {
          key: "createdTime",
          title: "报价日期",
          align: "center",
          width: 100,
          render: (h, params) => {
            return h(
              "span",
              self.getDataToLocalTime(params.row.createdTime, "fulltime")
            );
          },
        },
        {
          key: "supplierName",
          align: "center",
          title: "供应商",
        },
        {
          key: "priceDetailsList",
          align: "center",
          title: "采购报价",
          render: (h, params) => {
            let content = [];
            params.row.priceDetailsList.forEach((n, i) => {
              content.push(
                h(
                  "div",
                  {
                    style: {
                      textAlign: "center",
                      padding: "3px",
                      borderTop:
                        params.row.priceDetailsList.length > 1 && i > 0
                          ? "1px solid rgb(233, 234, 236)"
                          : "none",
                    },
                  },
                  n + params.row.currency
                )
              );
            });
            return content;
          },
        },
        {
          key: "supplierPurchaseLink",
          align: "center",
          title: "采购链接",
          render: (h, params) => {
            return h(
              "div",
              {
                attrs: {
                  title: params.row.supplierPurchaseLink,
                },
                style: {
                  display: "-webkit-box",
                  "-webkit-box-orient": "vertical",
                  "-webkit-line-clamp": 3,
                  overflow: "hidden",
                },
              },
              params.row.supplierPurchaseLink
            );
          },
        },
        {
          key: "estimateDeliveryDays",
          align: "center",
          title: "预期采购时间",
          render: (h, params) => {
            return h("span", params.row.estimateDeliveryDays + " 天");
          },
        },
        {
          key: "inquiryCode",
          align: "center",
          title: "询价单记录",
          render: (h, params) => {
            return h('div', {
              style: {
                color: '2D8CF0',
                textDecoration: 'underline',
                cursor: 'pointer'
              },
              on: {
                click: () => {
                  this.getInquiryCode(params.row)
                }
              }
            }, params.row.inquiryCode)
          },
        },
        {
          key: "operator",
          align: "center",
          title: "操作人",
          render: (h, params) => {
            let data = this.$store.state.allUser;
            let userName = "";
            if (data) {
              userName = data[params.row.updatedBy].userName;
            }
            return h("span", userName);
          },
        },
      ],
      hisPriceData1: [],
      hisPriceColumn2: [
        {
          key: "purchaseDate",
          title: "采购日期",
          align: "center",
        },
        {
          key: "supplier",
          align: "center",
          title: "供应商",
        },
        {
          key: "purchasePrice",
          align: "center",
          title: "采购单价",
        },
        {
          key: "purchaseTime",
          align: "center",
          title: "采购耗时",
        },
      ],
      hisPriceData2: [],
      newPrice: {
        auditStatus: 1, // 审批状态（1待提交，2待审核，3已审核，4已作废）
        cityId: null,
        provinceId: null,
        countryId: null,
        currency: "CNY",
        estimateDeliveryDays: null, // 预计交期（天)
        goodsBrandId: null, // 商品品牌
        goodsCategoryId: null, // 商品分类
        goodsName: null, // 商品名称
        productFileNodeUrl: null, // 货品缩略图地址前缀
        goodsThumbUrl: null, // 货品缩略图地址
        priceDetails: null, // 报价明细{quantity:price} ,
        productSkc: '', // 对应商品的 skc
        goodsColor: '', // 对应商品的颜色 格式：Color:颜色
        goodsSize: '', // 对应商品的尺码 格式：Size:XL
        priceDetailsList: [
          {
            quantity: null,
            price: null,
          },
        ],
        // 采购报价
        relatedPlatformGoods: null, // platform:productId:attributeId:attributeName:attributeValueId:attributeValue}
        relationPlatform: null, // 关联平台
        relationStatus: 1, // 关联状态（1待关联链接，2未关联商品，3关联待确认，4已关联商品） ,
        skuNo: null,
        supplierDefaultSort: null, // 供应商默认排序
        supplierGoodsCode: null, // 供应商货品货号
        supplierGoodsId: null, // 供应商产品ID
        supplierId: null,
        supplierName: null,
        supplierPurchaseLink: null, // 供应商采购链接
        minOrderQuantity: null, //最少起订量
        platformSpuId: '', // 平台spuId
        platformSkuId: '', // 平台skuId
        aliImageUrl: '', // 1688图片地址
        aliAttribute: '', // 规格
        mateAli: false, // 是否匹配1688商品（0：否，1：是）
        stockMultiple: null,
      },
      editPrice: {},
      matchProduct: {},
      supplierArr: [],
      countryArr: [],
      provinceArr: [],
      cityArr: [],
      currencyArr: [],
      skuData: [], // SKU表格数据
      supplierOption: {
        supplierName: "",
        supplierId: "",
      },
      skuParams: {
        total: 0,
        pageSize: 10,
        pageNum: 1,
      },
      hisPriceParams: {
        total: 0,
        pageSize: 10,
        pageNum: 1,
        skuNo: "",
      },
      skuColumn: [
        {
          key: "radio",
          title: " ",
          align: "center",
          width: 80,
          render: (h, params) => {
            return h("Radio", {
              props: {
                value: self.skuData[params.index].isCheck,
              },
              on: {
                "on-change": (value) => {
                  self.chosenSku = Object.assign({}, params.row);
                  self.skuData[params.index].isCheck = value;
                  self.skuData.forEach((n, i) => {
                    if (n.isCheck && i !== params.index) {
                      self.skuData[i].isCheck = false;
                    }
                  });
                },
              },
            });
          },
        },
        {
          key: "pic",
          title: "图片",
          align: "center",
          render: (h, params) => {
            return self.tableImg(h, params, "goodsUrl");
          },
        },
        {
          key: "cnName",
          align: "center",
          title: "商品名称",
          render: (h, params) => {
            return h(
              "div",
              {
                style: {
                  display: "-webkit-box",
                  "-webkit-box-orient": "vertical",
                  "-webkit-line-clamp": 3,
                  overflow: "hidden",
                },
              },
              params.row.cnName
            );
          },
        },
        {
          key: "sku",
          align: "center",
          title: "SKU编号",
        },
        {
          key: "productGoodsSpecifications ",
          align: "center",
          title: "属性",
          render: (h, params) => {
            let content = "";
            let arr = [];
            if (
              params.row.productGoodsSpecifications &&
              params.row.productGoodsSpecifications.length > 0
            ) {
              params.row.productGoodsSpecifications.forEach((n, i) => {
                arr.push(n.name + ":" + n.value);
              });
              content = arr.join(", ");
              return h("div", content);
            } else {
              return "";
            }
          },
        },
      ],
      newSupplier: {
        // 新增、编辑供货商
        supplierName: "",
        supplierCode: "",
        supplierLevel: "",
        supplierCategoryId: "",
        developerName: "",
        developerId: "",
        purchaserName: "",
        purchaserId: "",
        countryId: "64961f3d-9e6b-11e7-87bc-0050568e2f6d", // 中国
        provinceId: "",
        cityId: "",
        supplierType: "",
        address: "",
        storeUrl: "",
        useFlag: 0,
        settlementRemark: "",
        settlementType: "",
        supplierPaymentList: [
          // 供应商支付方式表
          /* {
           isDefault: 0,
           merchantId: '',
           paymentAccount: '',
           paymentAccountName: '',
           paymentBank: '',
           paymentType: '',
           subbranch: '',
           supplierIds: [],
           supplierId: '',
           supplierPaymentId: ''
           } */
        ],
        supplierContactList: [
          // 供应商联系人表
          /* {
           contactMan: '',
           email: '',
           faxNumber: '',
           isDefault: 0,
           merchantId: '',
           mobilePhone: '',
           qqNumber: '',
           supplierContactId: '',
           supplierId: '',
           telephone: '',
           wwAccount: ''
           } */
        ],
        supplierAttachmentList: [
          // 供应商附件表
          /* {
           attachmentDesc: '',
           attachmentUrl: '',
           merchantId: '',
           supplierAttachmentId: '',
           supplierId: '',
           } */
        ],
      },
      editSupplier: {}, // 新增、编辑供应商
      ruleValidate: {
        skuNo: [
          {
            required: true,
            message: "SKU编号不能为空",
            trigger: "blur",
          },
        ],
        supplierName: [
          {
            required: true,
            message: "请选择供应商",
            trigger: "change",
          },
        ],
        minOrderQuantity: [
          {
            type: "number",
            required: true,
            message: "最少起订量不能为空",
            trigger: "blur",
          },
          {
            validator: self.validateInteger(),
            trigger: "blur",
          },
        ],
        estimateDeliveryDays: [
          {
            type: "number",
            required: true,
            message: "预计交期不能为空",
            trigger: "blur",
          },
          {
            validator: self.validateInteger(),
            trigger: "blur",
          },
          // { max: 9999, message: '输入数字不能超过6位', trigger: 'change' }
        ],
        currency: [
          {
            required: true,
            message: "请选择货币",
            trigger: "change",
          },
        ],
        supplierGoodsCode: [
          { validator: self.validateSupplierGoodsCode, trigger: "change" },
          { validator: self.validateSupplierGoodsCode, trigger: "blur" },
        ],
        stockMultiple: [
          {
            validator: self.validStockingVal,
            trigger: "blur",
          },
        ],
      },
      productColumns: [
        {
          type: "selection",
          width: 70,
          align: "center",
        },
        {
          title: "图片",
          key: "thumbUrl",
          align: "center",
          width: 100,
          render: (h, params) => {
            return self.tableImg(h, params, "thumbUrl", true);
          },
        },
        {
          title: "SKU编号/商品名称",
          key: "skuNo",
          minWidth: 120,
          align: "center",
          render: (h, params) => {
            return h("div", {
              style: {
                'display': 'inline-block',
                'margin': '0 auto',
                'text-align': 'left',
              }
            }, [
              h(
                "p",
                {
                  style: {
                    color: "rgb(45, 140, 240)",
                  },
                },
                params.row.skuNo
              ),
              h("p", params.row.goodsName),
              h(
                "p",
                {
                  style: {
                    color: "green",
                  },
                },
                params.row.productGoodsSpecifications
              ),
            ]);
          },
        },
        {
          title: "1688商品匹配",
          width: 170,
          key: "productMatch",
          render: (h, params) => {
            let imageUrl = params.row.aliImageUrl;
            let imageKey = 'aliImageUrl';
            // 当对应的 sku 图不存在时使用 主图
            if (this.$common.isEmpty(params.row.aliImageUrl)) {
              imageUrl = params.row.imageUrl;
              imageKey = 'imageUrl';
            }
            if (params.row.mateAli === '1') {
              return h('div', {
                style: {
                  padding: '5px 0',
                  margin: '10px 0',
                  display: 'flex'
                }
              }, [
                this.tableImg(h, params, imageKey, imageUrl),
                h('div', {
                  style: {
                    marginLeft: '10px',
                    marginTop: '10px',
                  }
                }, params.row.aliAttribute),
              ]);
            } else {
              return null;
            }
          }
        },
        {
          title: "首选供应商",
          key: "",
          align: "center",
          width: 130,
          render: (h, params) => {
            let supplierDefaultSort = "";
            let html = [];
            let index = this.$common.isEmpty(params.row.supplierDefaultSort) ? '' : params.row.supplierDefaultSort;
            let icon_01 = false;  // 队列中的第一位
            // let icon_02 = false;  
            let icon_03 = false;  // 队列中间部分
            let icon_04 = false;  // 队列最后一位
            if (params.row.supplierDefaultSort === 1) {
              supplierDefaultSort = "首选供应商";
            } else {
              self.currentTabItem != 2
                ? (supplierDefaultSort = "备选供应商 " + index)
                : (supplierDefaultSort = "备选供应商 ");
            }
            // 下移、置底  排在第一位才有
            if (
              self.getPermission("supplierPrice_adjustSupplierOrder") &&
              params.row.skuNoList.length > 1 &&
              index === 1
            ) {
              icon_01 = true;
            }
            // 下移 暂时不明这里有什么用处
            // if (
            //   self.getPermission("supplierPrice_adjustSupplierOrder") &&
            //   params.row.skuNoList.length > 2 &&
            //   index === 1
            // ) {
            //   icon_02 = true;
            // }
            // 上移、下移
            if (
              self.getPermission("supplierPrice_adjustSupplierOrder") &&
              params.row.skuNoList.length > 2 &&
              index > 1 &&
              index < params.row.skuNoList.length
            ) {
              icon_03 = true;
            }
            // 上移、置顶  排在最后一位
            if (
              self.getPermission("supplierPrice_adjustSupplierOrder") &&
              params.row.skuNoList.length > 1 &&
              index === params.row.skuNoList.length
            ) {
              icon_04 = true;
            }
            let talg = h('div', {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '35px'
              }
            }, [
              h('div', supplierDefaultSort),
              h('div', icon_01 && self.pageParams.auditStatus !== 2
                ? [
                  h('Icon', {
                    props: {
                      type: 'md-arrow-down',
                      title: '下移',
                      size: 18
                    },
                    style: {
                      marginLeft: '5px',
                      color: '#57a3f3',
                      cursor: 'pointer'
                    },
                    on: {
                      click: () => {
                        self.adjustFn('down', params.row);
                      }
                    }
                  })
                  // , h('Icon', {
                  //   props: {
                  //     type: 'arrow-down-a',
                  //     title: '置底',
                  //     size: 18
                  //   },
                  //   style: {
                  //     marginLeft: '5px',
                  //     color: '#75b62d',
                  //     cursor: 'pointer'
                  //   },
                  //   on: {
                  //     click: () => {
                  //       self.adjustFn('floor', params.row);
                  //     }
                  //   }
                  // })
                ]
                : ''),
              // h('div', icon_02 && self.pageParams.auditStatus !== 2
              //   ? [
              //     h('Icon', {
              //       props: {
              //         type: 'md-arrow-down',
              //         title: '下移',
              //         size: 18
              //       },
              //       style: {
              //         marginLeft: '5px',
              //         color: '#57a3f3',
              //         cursor: 'pointer'
              //       },
              //       on: {
              //         click: () => {
              //           self.adjustFn('down', params.row);
              //         }
              //       }
              //     })
              //   ]
              //   : ''),
              h('div', icon_03 && self.pageParams.auditStatus !== 2
                ? [
                  h('Icon', {
                    props: {
                      type: 'md-arrow-up',
                      title: '上移',
                      size: 18
                    },
                    style: {
                      marginLeft: '5px',
                      color: '#f25d3d',
                      cursor: 'pointer'
                    },
                    on: {
                      click: () => {
                        self.adjustFn('up', params.row);
                      }
                    }
                  }), h('Icon', {
                    props: {
                      type: 'md-arrow-down',
                      title: '下移',
                      size: 18
                    },
                    style: {
                      marginLeft: '5px',
                      color: '#57a3f3',
                      cursor: 'pointer'
                    },
                    on: {
                      click: () => {
                        self.adjustFn('down', params.row);
                      }
                    }
                  })
                ]
                : ''),
              h('div', icon_04 && self.pageParams.auditStatus !== 2
                ? [
                  h('Icon', {
                    props: {
                      type: 'md-arrow-up',
                      title: '上移',
                      size: 18
                    },
                    style: {
                      marginLeft: '5px',
                      color: '#f25d3d',
                      cursor: 'pointer'
                    },
                    on: {
                      click: () => {
                        self.adjustFn('up', params.row);
                      }
                    }
                  }),
                  // h('Icon', {
                  //   props: {
                  //     type: 'md-arrow-up',
                  //     title: '置顶',
                  //     size: 18
                  //   },
                  //   style: {
                  //     marginLeft: '5px',
                  //     color: '#4c1413',
                  //     cursor: 'pointer'
                  //   },
                  //   on: {
                  //     click: () => {
                  //       self.adjustFn('top', params.row);
                  //     }
                  //   }
                  // })
                ]
                : '')
            ]);
            html.push(talg);
            return h("div", html);
          },
        },
        {
          title: '供应商类型',
          key: 'supplierTypeName',
          align: 'center',
          width: 100,
          render: (h, params) => {
            if (params.row.supplierTypeName) {
              return h("span", params.row.supplierTypeName);
            } else {
              return h("span", "-");
            }
          },
        },
        {
          title: "供应商名称",
          key: "supplierName",
          align: "center",
          width: 160
        },
        {
          title: "供方货号",
          key: "supplierGoodsCode",
          align: "center",
          width: 100
        },
        {
          title: "最新报价",
          key: "currency",
          align: "center",
          width: 100,
          render: (h, params) => {
            let currency = [];
            params.row.priceDetailsList.map((item) => {
              currency.push(
                h(
                  "div",
                  {
                    style: {
                      // height: "35px",
                      lineHeight: "1.6em",
                    },
                  },
                  item + " " + params.row.currency
                )
              );
            });
            return h("div", currency);
          },
        },
        {
          title: "最少起订量",
          key: "minOrderQuantity",
          align: "center",
          width: 100
        },
        {
          title: "预计货期（天）",
          key: "estimateDeliveryDays",
          align: "center",
          width: 90
        },
        {
          title: "最新报价时间",
          key: "createdTime",
          align: "center",
          width: 150,
          render: (h, params) => {
            return h(
              "div",
              self.getDataToLocalTime(params.row.createdTime, "fulltime")
            );
          },
        },
        {
          title: "历史价格",
          key: "ueryPriceHistory",
          align: "center",
          width: 90,
          render: (h, params) => {
            return self.getPermission('supplierPrice_queryPriceHistory')
              ? h('span', {
                style: {
                  cursor: params.row.supplierName == '*' ? '' : 'pointer',
                  color: params.row.supplierName == '*' ? 'grey' : 'rgb(45, 140, 240)',
                },
                on: {
                  click: () => {
                    if (params.row.supplierName == '*') { return }
                    self.viewHistoryFn(params.row);
                  }
                }
              }, '历史价格')
              : '';
          }
        }, {
          title: '操作',
          key: 'operation',
          align: 'center',
          width: 100,
          render: (h, params) => {
            return self.getPermission('supplierPrice_querySupplierGoods') ? h('local-down-button', {
              props: {
                data: {
                  btn: {
                    text: self.currentTabItem !== '2' ? '查看' : '审核通过',
                    disabled: self.currentTabItem === '2' && self.isSelf(params.row.createdBy) && !self.isSelf(params.row.auditPersonIds),
                    clickFn: () => {
                      self.currentTabItem != 2 ? self.rowOperationFn('1', params.row) : self.rowOperationFn('5', params.row)
                    }
                  },
                  list: [
                    {
                      text: '编辑',
                      value: 2,
                      hide: self.currentTabItem === 2 && !self.getPermission('supplierPrice_update'),
                      clickFn: () => {
                        self.rowOperationFn('2', params.row);
                      }
                    }, {
                      text: '1688商品匹配',
                      value: 8,
                      hide: !self.getPermission('supplierPrice_matchProduct') ? true : self.currentTabItem !== '3' ? true : false,
                      clickFn: () => {
                        self.rowOperationFn('8', params.row);
                      }
                    }, {
                      text: '作废',
                      value: 3,
                      hide: self.currentTabItem === '4' || !self.getPermission('supplierPrice_remove'),
                      clickFn: () => {
                        self.rowOperationFn('3', params.row);
                      }
                    }, {
                      text: '删除',
                      value: 4,
                      hide: self.currentTabItem != 1,
                      clickFn: () => {
                        self.rowOperationFn('4', params.row);
                      }
                    }, {
                      text: '驳回',
                      value: 4,
                      hide: self.currentTabItem != 2,
                      clickFn: () => {
                        self.rowOperationFn('7', params.row);
                      }
                    }
                  ]
                }
              }
            }) : '';
          }
        }
      ],
      spanArr: [],
      pos: null,
      dialogObj: {
        modelVisible: false,
        data: {},
        type: ''
      },
    };
  },
  watch: {
    pageParamsStatus(n, o) {
      let v = this;
      if (n) {
        v.$nextTick(() => {
          v.getList();
          v.pageParamsStatus = false;
        });
      }
    },
    isShowAddPro (val) {
      if (val) return;
      this.skuLoading = false;
    },
    isShowEditPrice(val) {
      if (val) return;
      this.alibabaData = {
        addAliProductDetailVOList: []
      };
      // this.alibabaColumn = this.$common.copy(this.oldAlibabaColumn);
    },
    'editPrice.supplierPurchaseLink'(val) {
      if (this.$common.isEmpty(val)) {
        this.checkAlibabaProduct('editPrice');
        this.alibabaData = {
          addAliProductDetailVOList: []
        };
      }
    },
    'matchProduct.supplierPurchaseLink'(val) {
      if (this.$common.isEmpty(val)) {
        this.checkAlibabaProduct('matchProduct');
        this.alibabaData = {
          addAliProductDetailVOList: []
        };
      }
    },
    // 当 1688 SkuId 不为空表示已匹配 1688
    'editPrice.platformSkuId'(val) {
      this.$set(this.editPrice, 'mateAli', !this.$common.isEmpty(val));
    },
    'matchProduct.aliAttribute'(val) {
      if (!val || val.length === 0) return
      const [color, size] = val.split(",");
      this.goodsColor = color.substring(color.indexOf(":") + 1, color.length),
      this.goodsSize = size.substring(color.indexOf(":") + 1, size.length)
    },
    'editPrice.goodsColor'(val) {
      this.editPriceColor = this.$common.isEmpty(val) ? '' : val.split(':')[1] || '';
    },
    'editPrice.goodsSize'(val) {
      this.editPriceSzie = this.$common.isEmpty(val) ? '' : val.split(':')[1] || '';
    }
  },
  created() {
    this.pageParams.pageSize = this.getPageSizeCache();
    this.oldAlibabaColumn = this.$common.copy(this.alibabaColumn);
    this.getSupplylist()
  },
  mounted() {
    this.uploadList = this.$refs.import.fileList;
    this.cloudUploadList = this.$refs.cloudImport.fileList;
  },
  activated() {
    this.reset();
    this.initBaseData();
    this.startLoading();
  },
  computed: {
    authUserInfo() {
      return this.$store.getters['authUserInfo'];
    },
    // 是否为 1688 供应商
    isAlibabaSupplier() {
      const checkSupplier = this.supplierArr.find(item => {
        return this.editPrice.supplierId === item.supplierId
      })
      // 用 setupStatus 判断是否为 1688 供应商 0：否，1：是
      if (this.$common.isEmpty(checkSupplier)) {
        if (this.$common.isEmpty(this.editPrice.setupStatus)) return true;
        return this.editPrice.setupStatus == 1;
      }
      return checkSupplier.setupStatus == 1;
    },
    hasInquiryCode() {
      return this.editPrice.inquiryCode ? true : false
    }
  },
  methods: {
    exportMt(name) {
      if (name === "0") {
        // 选中
        let obj = {};
        if (this.selectionArr.length == 0) {
          this.$Message.error("请选择数据");
          return;
        }
        obj = {
          auditStatus: this.pageParams.auditStatus,
          // pageNum: this.pageParams.pageNum,
          // pageSize: this.pageParams.pageSize,
          businessDeptIds: this.authUserInfo.securityUser.businessDeptIds,
          supplierGoodsIdList: [],
        };
        obj.supplierGoodsIdList = this.selectionArr.map((n) => {
          return n.supplierGoodsId;
        });
        this.exportEcxel(obj);
      } else {
        this.exportEcxel(this.getPageParams());
      }
    },
    addProductCancel() {
      this.isShowAddPro = false;
    },
    addProductSuccess(datas) {
      let data = datas[0];
      this.editPrice.goodsId = data.productGoodsId;
      this.editPrice.skuNo = data.sku;
      this.editPrice.goodsName = data.cnName;
      this.editPrice.goodsThumbUrl = data.goodsUrl;
      this.editPrice.productSkc = data.skc;
      this.editPrice.goodsColor = '';
      this.editPrice.goodsSize = '';
      if (!this.$common.isEmpty(data.productGoodsSpecifications)) {
        let goodsColorList = [];
        let goodsSizeList = [];
        data.productGoodsSpecifications.forEach(item => {
          if ((item.name || '').toLocaleLowerCase() == 'color') {
            goodsColorList.push(`${item.name}:${item.value}`);
          } else if ((item.name || '').toLocaleLowerCase() == 'size') {
            goodsSizeList.push(`${item.name}:${item.value}`);
          }
        });
        this.editPrice.goodsColor = goodsColorList.join(',');
        this.editPrice.goodsSize = goodsSizeList.join(',');
      }
      
      this.editPrice.goodsBrandId = data.productBrandId;
      this.editPrice.goodsCategoryId = data.productCategoryId;
      this.isShowChooseSku = false;
      this.isShowAddPro = false;
      /* let v = this
       this.skuLoading = true
       let obj = {
       purchaseWarehouseId: this.order.purchaseWarehouseId,
       goodsInfoList: []
       }
       data.forEach((n, i)=> {
       obj.goodsInfoList.push({
       cnName: n.cnName,
       goodsId: n.productGoodsId,
       goodsUrl: n.goodsUrl,
       sku: n.sku
       })
       })
       this.axios.post(api.purchaseQueryGoodsInfo, obj)
       .then(res=> {
       if(res.data.code == 0) {
       res.data.datas.forEach((m, j)=> {
       let exist = false
       this.order.detailsResultList.forEach((l, k)=> {
       if(m.goodsId == l.goodsId) { //当前商品已存在时，下单数量+1
       this.order.detailsResultList[k].replenishQuantity ++
       exist = true
       }
       })
       if(!exist) { //当前商品不存在时，新增一条数据
       this.order.detailsResultList.push(Object.assign(m, {replenishQuantity: 0, unitPrice: 0, onPassageQuantity: m.onWayQuantity}))
       }
       })
       }
       this.skuLoading = false
       this.getProlist()
       this.isShowAddPro = false
       }) */
    },
    startLoading() {
      this.$Loading.start();
      this.getList();
    },
    // 获取供应商类型列表/供应商等级列表
    getSupplylist() {
      this.axios
        .get(api.baseDataList + "?dataType=" + "supplierType")
        .then((res) => {
          if (res.data.code == 0) {
            this.supplierTypeArr = res.data.datas;
          }
        });
    },
    getPageParams() {
      let params = this.deepCopy(this.pageParams);
      params.relationStatus = params.relationStatus == 0 ? null : params.relationStatus;
      params.businessDeptIds = this.authUserInfo.securityUser.businessDeptIds;
      if (!this.$common.isEmpty(params.quotationTime) && !this.$common.isEmpty(params.quotationTime[0])) {
        params.startQuotationTime = this.$common.toISODate(params.quotationTime[0], 'fulltime');
        params.endQuotationTime = this.$common.toISODate(params.quotationTime[1], 'fulltime');
      } else {
        params.startQuotationTime = null;
        params.endQuotationTime = null;
      }
      delete params.quotationTime;
      return params;
    },
    getList() {
      // 獲取分頁
      let v = this;
      if (!v.getPermission("supplierPrice_list")) {
        v.$Message.error("无权限");
        return;
      }
      v.priceData = [];
      v.selectionArr = [];
      v.Tableloading = true;
      v.SearchDisabled = true;
      let produtData = [];
      v.axios.post(api.querySupplierGoodsPage, this.getPageParams()).then((response) => {
        if (response.data.code == 0) {
          let arr = response.data.datas.list;
          v.getProductListInfo(arr.map((i) => i.goodsId)).then((data) => {
            arr.forEach((i) => {
              data.forEach((j) => {
                if (i.goodsId === j.productGoodsId) {
                  Object.keys(j).forEach(key => {
                    if (['productGoodsSpecifications'].includes(key)) {
                      i[key] = j[key];
                    }
                  });
                  if (j.productGoodsSpecifications) {
                    i.productGoodsSpecifications = j.productGoodsSpecifications.map((i) => i.name + ":" + i.value).join(",");
                  } else {
                    i.productGoodsSpecifications = null;
                  }
                }
              });
            });
            arr.forEach((n, i) => {
              if (!produtData || produtData.length == 0) {
                produtData.push({
                  goodsName: n.goodsName,
                  goodsThumbUrl: n.goodsThumbUrl,
                  skuNo: n.skuNo,
                  supplierGoodsResultList: [n],
                  skuNoList: [n.skuNo],
                });
              } else {
                let isExist = false;
                produtData.forEach((m, j) => {
                  // 如果为同一sku,归到同一数组
                  if (n.skuNo == m.skuNo) {
                    m.supplierGoodsResultList.push(n);
                    m.skuNoList.push(n.skuNo);
                    isExist = true;
                  }
                });
                if (!isExist) {
                  // 如果不存在相同sku,数组新增一个对象
                  produtData.push({
                    goodsName: n.goodsName,
                    goodsThumbUrl: n.goodsThumbUrl,
                    skuNo: n.skuNo,
                    supplierGoodsResultList: [n],
                    skuNoList: [n.skuNo],
                  });
                }
              }
            });
            if (produtData.length > 0) {
              produtData.map((item) => {
                item.supplierGoodsResultList.map((ele, index) => {
                  ele["skuNoList"] = item.skuNoList;
                  ele["index"] = index + 1;
                });
                // 对存在有skuNoList的长度大于1的supplierDefaultSort进行排序
                item.supplierGoodsResultList.sort((a, b) => {
                  return a.supplierDefaultSort - b.supplierDefaultSort
                })
                v.priceData = [...v.priceData, ...item.supplierGoodsResultList];
              });
              this.getSpanArr(v.priceData);
            }
            v.total = response.data.datas.total;
            v.$Loading.finish(); // 隐藏加载条
          });
        }
      }).finally(() => {
        v.Tableloading = false;
        v.SearchDisabled = false;
      });
    },
    showCurrentPage(name) {
      // tabs页切换
      this.pageParams.auditStatus = Number(name);
      this.pageParams.pageNum = 1;
      this.pageParamsStatus = true;
      this.selectionArr = [];
    },
    priceCurrentChangeFn(name) {
      this.isShowAddSupBtn = false;
      if (name == "0") {
        this.isShowAddSupplier = false;
      }
    },
    changePage(page) {
      this.$Loading.start();
      this.pageParams.pageNum = page;
      this.getList();
    },
    reset() {
      this.$refs["pageParams"].resetFields();
      this.currentTabItem = "3";
      this.selectionArr = [];
      this.treeSelectCategoryValue = [];
      this.pageParams.auditStatus = Number(this.currentTabItem);
      this.pageParams.skuOrName = null;
    },
    // 处理树节点
    treeNormalizer(node) {
      return {
        id: node.productCategoryId,
        label: node.title,
        children: node.children
      }
    },
    // 树选中值改变
    treeSelectCategoryChange(value) {
      let selectId = [];
      (value || []).forEach(item => {
        if (this.$common.isEmpty(this.productCategoryJson[item])) {
          selectId.push(item);
        } else {
          selectId = [...selectId, ...this.getTreeLastStageId(this.productCategoryJson[item])]
        }
      })
      this.pageParams.goodsCategoryIdList = selectId;
    },
    // 处理选择值
    getTreeLastStageId(arr) {
      let arrVal = [];
      arr.forEach((item) => {
        if (this.$common.isEmpty(item.children)) {
          arrVal.push(item.productCategoryId);
        } else {
          arrVal = [...arrVal, ...this.getTreeLastStageId(item.children)];
        }
      })
      return arrVal;
    },
    // 获取商品分类
    getProductCategoryList() {
      this.proCategoryArr = [];
      return new Promise((resolve) => {
        this.axios.get(api.get_productCategory, { hiddenError: true }).then((res) => {
          if (!res || !res.data || res.data.code != 0) return resolve([]);
          this.proCategoryArr = [{
            title: '全部',
            productCategoryId: 'productCategoryId',
            expand: true,
            children: [
              // {
              //   title: '未分类',
              //   productCategoryId: 'noCategory',
              //   expand: true
              // },
              ...this.getProductCategoryTree(res.data.datas, null)
            ]
          }];
          this.$set(this.productCategoryJson, 'productCategoryId', this.proCategoryArr[0].children);
          resolve(this.proCategoryArr);
        }).catch(() => {
          resolve([]);
        })
      })
    },
    // 组装商品分类树
    getProductCategoryTree(productCategoryList, parentId) {
      let tree = [];
      let children;
      productCategoryList.forEach((n, i) => {
        if (n.parentId === parentId) {
          n.title = n.cnName;
          n.expand = true;
          children = this.getProductCategoryTree(productCategoryList, n.productCategoryId);
          this.$set(this.productCategoryJson, n.productCategoryId, children);
          if (children.length > 0) {
            n.children = children;
          }
          tree.push(n);
        }
      });
      return tree;
    },
    searchOrder() {
      this.pageParams.pageNum = 1;
      this.getList();
    },
    // 点击排序的按钮
    clickSortButton(data) {
      if (data.value === this.pageParams.orderBy) {
        data.isDesc = !data.isDesc;
      }
      this.pageParams.upDown = data.isDesc ? 'DESC' : 'ASC';
      this.sortData.forEach((n) => {
        n.checked = data.value === n.value;
      });
      this.pageParams.orderBy = data.value;
      this.$nextTick(() => {
        this.getList();
      })
    },
    // 获取报价详情
    editPriceFn(name, data) {
      this.editStatus = "";
      this.isEditPrice = name;
      if (data) {
        // 编辑、查看
        this.editPriceTabItems[0].value = name ? "编辑报价" : "查看报价";
        let arr = [];
        arr.push(data.supplierGoodsId);
        let temp = {
          businessDeptIds: this.authUserInfo.securityUser.businessDeptIds,
          supplierGoodsIds: arr
        }
        // 通过接口获取报价详情
        this.axios.post(api.querySupplierGoods, temp).then((res) => {
          if (res.data.code == 0) {
            this.editPrice = res.data.datas[0] || {};
            // 1688 商品列表
            if (!this.$common.isEmpty(this.editPrice.platformSpuId)) {
              this.$nextTick(() => {
                // 当采购链接不为空时，获取采购链接里面的值
                if (!this.$common.isEmpty(this.editPrice.supplierPurchaseLink) && [true, 1, '1'].includes(this.editPrice.mateAli)) {
                  this.matchingAlibaba({
                    productUrl: this.editPrice.supplierPurchaseLink,
                    // 当查看或编辑时，过滤ID，只显示当前选中的，点击匹配按钮时再加载
                    filterId: this.editPrice.platformSkuId
                  }, true);
                }
              })
            }

            this.editPrice.mateAli = this.editPrice.mateAli == 1; // 是否匹配1688商品
            this.isFirstCheck = this.editPrice.supplierDefaultSort === 0; // 是否为首选供应商
            this.supplierOption.supplierId = this.editPrice.supplierId;
            this.supplierOption.supplierName = this.editPrice.supplierName;
            if (this.supplierOption.supplierName == '*') { this.ruleValidate.supplierName[0].required = false }
            this.priceCurrentTabItem = "0";
            this.isShowAddSupplier = false; // 隐藏添加供应商页面
            this.savePriceLoading = false; // 防止保存按钮处于loading状态
            this.submitPriceLoading = false; // 防止提交按钮处于loading状态
            this.isShowAddSupBtn = false; // 隐藏新增供应商按钮
            this.$nextTick(() => {
              this.isShowEditPrice = true;
            });
            this.getPriceList();
            this.getCurrencyFn();
            this.getSupplierFn();
            this.getCountryFn();
            if (this.editPrice.provinceId) {
              this.getProvinceFn(true);
              if (this.editPrice.cityId) {
                this.getCityFn(true);
              }
            }
          }
        });
      } else {
        // 新增
        this.editStatus = "add";
        this.editPriceTabItems[0].value = "新增报价";
        this.editPrice = this.deepCopy(this.newPrice);
        this.supplierOption.supplierName = "";
        this.supplierOption.supplierId = "";
        this.priceCurrentTabItem = "0";
        this.isShowAddSupplier = false; // 隐藏添加供应商页面
        this.savePriceLoading = false; // 防止保存按钮处于loading状态
        this.submitPriceLoading = false; // 防止提交按钮处于loading状态
        this.isShowAddSupBtn = false; // 隐藏新增供应商按钮
        this.isShowEditPrice = true;
        this.getCurrencyFn();
        this.getSupplierFn();
        this.getCountryFn();
      }
    },
    // 获取匹配商品详情
    getMatchProductDetail(data) {
      if (data) {
        this.goodsColor = ''
        this.goodsSize = ''
        this.alibabaData.addAliProductDetailVOList = []
        // 编辑、查看
        let arr = [];
        arr.push(data.supplierGoodsId);
        let temp = {
          businessDeptIds: this.authUserInfo.securityUser.businessDeptIds,
          supplierGoodsIds: arr
        }
        // 通过接口获取详情
        this.axios.post(api.querySupplierGoods, temp).then((res) => {
          if (res.data.code == 0) {
            this.matchProduct = res.data.datas[0] || {};
            // 1688 商品列表
            if (!this.$common.isEmpty(this.matchProduct.platformSpuId)) {
              this.$nextTick(() => {
                // 当采购链接不为空时，获取采购链接里面的值
                if (!this.$common.isEmpty(this.matchProduct.supplierPurchaseLink) && [true, 1, '1'].includes(this.matchProduct.mateAli)) {
                  this.matchingAlibaba({
                    productUrl: this.matchProduct.supplierPurchaseLink,
                    // 当查看或编辑时，过滤ID，只显示当前选中的，点击匹配按钮时再加载
                    filterId: this.matchProduct.platformSkuId
                  }, true);
                }
              })
            }

            this.matchProduct.mateAli = this.matchProduct.mateAli == 1; // 是否匹配1688商品
            this.supplierOption.supplierId = this.editPrice.supplierId;
            this.supplierOption.supplierName = this.editPrice.supplierName;
            if (this.supplierOption.supplierName == '*') { this.ruleValidate.supplierName[0].required = false }
            this.$nextTick(() => {
              this.isShowProductMatch = true;
            });
          }
        });
      }
    },
    // 获取价格列表
    getPriceList() {
      if (this.$common.isEmpty(this.editPrice.priceDetails)) {
        this.editPrice.priceDetailsList = [{ quantity: null, price: null }];
        return;
      }
      const arr1 = this.editPrice.priceDetails.split(",");
      const arr2 = [];
      arr1.forEach((n, i) => {
        arr2.push({
          quantity: n.split(":")[0],
          price: n.split(":")[1],
        });
      });
      this.editPrice.priceDetailsList = this.$common.isEmpty(arr2) ? [{ quantity: null, price: null }] : arr2;
    },
    getCountryFn() {
      // 获取国家列表
      let v = this;
      v.axios.get(api.country).then((res) => {
        if (res.data.code == 0) {
          v.countryArr = res.data.datas;
        }
      });
    },
    countryChangeFn() {
      // 国家改变时，清空省、州和省、州列表
      this.$refs.provinceSelect.clearSingleSelect();
      this.provinceArr = [];
      this.cityArr = [];
    },
    getProvinceFn(name) {
      // 获取省、州列表
      let v = this;
      if (name) {
        if (v.editPrice.countryId) {
          v.axios
            .get(api.province + "?countryId=" + v.editPrice.countryId)
            .then((res) => {
              if (res.data.code == 0) {
                v.provinceArr = res.data.datas;
              }
            });
        } else {
          v.$Message.warning("请先选择国家");
        }
      }
    },
    provinceChangeFn() {
      // 省、州改变时，清空城市和城市列表
      // this.$refs.citySelect.clearSingleSelect()
      this.cityArr = [];
    },
    getCityFn(name) {
      // 获取城市列表
      let v = this;
      if (name) {
        return new Promise((resolve) => {
          if (v.editPrice.provinceId) {
            v.axios
              .get(api.allCity + "?stateId=" + v.editPrice.provinceId)
              .then((res) => {
                if (res.data.code == 0) {
                  v.cityArr = res.data.datas;
                  resolve();
                }
              });
          } else {
            v.$Message.warning("请先选择省州");
          }
        });
      }
    },
    getCurrencyFn() {
      // 货币下拉列表
      let v = this;
      // v.axios.post(api.getCurrencyDropdownList)
      v.axios.get(api.baseDataList + "?dataType=currencyType").then((res) => {
        if (res.data.code == 0) {
          v.currencyArr = res.data.datas;
        }
      });
    },
    getSupplierFn() {
      // 供应商下拉列表
      let v = this;
      v.axios.get(api.queryIdAndName).then((res) => {
        if (res.data.code == 0) {
          let data = res.data.datas;
          if (data.length > 0) {
            v.supplierArr = data.filter((item) => {
              return (item.auditStatus = 3);
            });
          }
          // 以下选项不知道是作用是什么，暂时注释(2023-4-19 10:08)
          // if (v.editPrice.supplierId) {
          //   let isExist = false;
          //   v.supplierArr.forEach((n, i) => {
          //     if (n.supplierId.indexOf(v.editPrice.supplierId) != -1) {
          //       isExist = true;
          //     }
          //   });
          //   if (isExist) {
          //     v.supplierOption.supplierId = "";
          //     v.supplierOption.supplierName = "";
          //   }
          // }
        }
      });
    },
    okUpload(data, file, fileList) {
      // 文件上传成功的回调
      // let noTSatisfiableStr = data.datas;
      if (data.code == 0) {
        if (data.datas) {
          this.$Message.success(file.name + "导入成功");
          this.importExcel = false;
          this.getList();
        } else {
          this.$Message.error({
            content: file.name + "导入失败",
            duration: 2,
            closable: true,
          });
          let winHandle = window.open("about:blank");
          winHandle.location.href = this.$store.state.imgUrl + data.datas;
          this.importExcel = false;
        }
      } else if (data.code === 222002) {
        this.$Message.error("供应商已有未审核的报价单,请先审核");
      } else if (data.code === 222008) {
        this.$Notice.error({
          title: "批量导入失败,详情请下载",
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
      // this.importExcel = false
    },
    downloadEcxel() {
      // 下载标发货导入的模板
      const path =
        this.$store.state.imgUrl +
        "/sps-service/template/supplierGoodsTemplate.xlsx";
      window.location.href = path;
    },
    exportEcxel(obj) {
      // 批量导出
      let v = this;
      if (!v.priceData || v.priceData.length == 0) {
        v.$Message.error("无数据导出");
      } else {
        v.axios.post(api.priceExport, obj).then((res) => {
          if (res.data.code == 0) {
            v.$Message.success("导出成功");
            v.getList();
            // window.location = v.$store.state.imgUrl + res.data.datas
          }
        });
      }
    },
    addPriceAction() {
      if (!this.$common.isArray(this.editPrice.priceDetailsList)) {
        this.editPrice.priceDetailsList = [];
      }
      this.editPrice.priceDetailsList.push({
        quantity: null,
        price: null,
      });
    },
    getPriceDetails() {
      const arr = this.editPrice.priceDetailsList.map((n, i) => {
        return `${n.quantity}:${n.price}`;
      });
      this.editPrice.priceDetails = arr.join(",");
    },
    // 检测是否有相同的数量区间
    checkPrice() {
      // 数组去重
      const priceAssemble = this.$common.arrRemoveRepeat(this.editPrice.priceDetailsList.map(m => m.quantity));
      // 数量去重是否和原来报价数量一致
      return priceAssemble.length !== this.editPrice.priceDetailsList.length;
    },
    // 保存报价
    savePriceFn(name, auditStatus) {
      if (this.checkPrice()) {
        this.$Message.error("数量相同的只能有一个价格");
        return;
      }
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.savePriceLoading = true;
          this.getPriceDetails();
          let obj = this.getSaveParams();
          // 勾选了赋值0，如果原本勾选了去到勾则赋值null，如果原本没勾选，也没勾上则赋给原来的值
          obj.supplierDefaultSort = this.isFirstCheck ? 0 : this.editPrice.supplierDefaultSort == 0 ? null : this.editPrice.supplierDefaultSort;
          if (auditStatus) {
            obj.auditStatus = auditStatus;
          }
          this.axios.post(api.saveSupplierGoods, [obj]).then((res) => {
            if (res.data.code == 0) {
              this.$Message.success("保存成功");
              this.isShowEditPrice = false;
              this.getList();
            }
            this.savePriceLoading = false;
          }).finally(() => {
            this.savePriceLoading = false;
          });
        }
      });
    },
    // 保存时的参数修改
    getSaveParams() {
      let params = this.$common.copy(this.editPrice);
      params.mateAli = params.mateAli ? 1 : 0;
      const transformNull = ['supplierPurchaseLink', 'platformSpuId', 'platformSkuId', 'aliImageUrl'];
      // 空字符转为null
      transformNull.forEach(key => {
        if (this.$common.isEmpty(params[key])) {
          params[key] = null;
        }
      });
      return params;
    },
    submitPriceFn(name) {
      if (name !== 'matchProduct') {
        if (this.checkPrice()) {
          this.$Message.error("数量相同的只能有一个价格");
          return;
        }
        this.$refs[name].validate((valid) => {
          if (valid) {
            this.submitPriceLoading = true;
            this.getPriceDetails();
            let params = this.getSaveParams();
            params.supplierDefaultSort = this.isFirstCheck ? 0 : this.editPrice.supplierDefaultSort == 0 ? null : this.editPrice.supplierDefaultSort;
            this.axios.post(api.submitProductQuotation, [params]).then(res => {
              if (res.data.code == 0) {
                this.$Message.success('提交成功');
                this.isShowEditPrice = false;
                this.getList();
              }
            }).finally(() => {
              this.submitPriceLoading = false;
            });
          }
        });
      } else {
        if (!this.matchProduct.supplierPurchaseLink) {
          return this.$Message.error('请输入采购链接');
        }
        let params = this.$common.copy(this.matchProduct);
        this.submitPriceLoading = true;
        params.supplierDefaultSort = this.isFirstCheck ? 0 : null;
        this.axios.post(api.submitProductQuotation, [params]).then(res => {
          if (res.data.code == 0) {
            this.$Message.success('提交成功');
            this.isShowProductMatch = false;
            this.getList();
          }
        }).finally(() => {
          this.submitPriceLoading = false;
        });
      }

    },
    // 匹配 1688 商品
    matchingAlibaba(optons, type) {
      if (this.$common.isEmpty(optons.productUrl) && !!type) {
        return this.$Message.error('请输入1688宝贝链接');
      }
      let productId = optons.productId;
      if (!this.$common.isEmpty(optons.productUrl)) {
        let productBase = optons.productUrl.split(".html")[0];
        if (this.$common.isEmpty(productBase)) {
          return this.$Message.error('1688宝贝链接有误，请核对后再尝试！');
        }
        productId = productBase.substring(productBase.lastIndexOf("/") + 1, productBase.length);
        if (this.$common.isEmpty(productId)) {
          return this.$Message.error('1688宝贝链接有误，请核对后再尝试！');
        }
      }
      if (this.$common.isEmpty(productId)) return this.$Message.error('无法获取到1688宝贝商品ID');
      this.matchingLoading = true;
      this.axios.get(`${api.get_aliProduct}?platformId=${productId}`).then((res) => {
        if (res.data && res.data.code === 0 && !this.$common.isEmpty(res.data.datas)) {
          let resolves = res.data.datas;
          this.alibabaColumn = this.$common.copy(this.oldAlibabaColumn);
          if (!this.$common.isEmpty(optons.filterId) || optons.isFilter) {
            const rowInfo = (resolves.addAliProductDetailVOList || []).find(row => {
              return optons.filterId === row.platformSkuId;
            });
            resolves.addAliProductDetailVOList = [{
              ...(rowInfo || {}),
              imageUrl: resolves.imageUrl || '',
              platformSpuId: resolves.platformSpuId || '',
              name: resolves.name || ''
            }];
          } else {
            resolves.addAliProductDetailVOList = (resolves.addAliProductDetailVOList || []).map(row => {
              return {
                ...row,
                imageUrl: resolves.imageUrl || '',
                platformSpuId: resolves.platformSpuId || '',
                name: resolves.name || ''
              }
            });
          }
          // 当编辑时， 不删除操作列
          this.handAlibabaCol(resolves.addAliProductDetailVOList, this.isEditPrice ? [] : this.isShowProductMatch ? [] : ['operation']);
          this.$nextTick(() => {
            this.alibabaData = resolves;
          })
        }
      }).finally(() => {
        this.matchingLoading = false;
      });
    },
    handlePic(url) {
      return url ? url.split(",")[0] : "";
    },
    handAlibabaCol(productList, removeKey = []) {
      if (!this.$common.isEmpty(productList)) {
        const aliAttribute = productList[0] || {};
        let attribute = [];
        if (!this.$common.isEmpty(aliAttribute)) {
          let titleVal = [];
          const addColList = (aliAttribute.attribute || '').split(' ').map((item, index) => {
            titleVal = item.split(':');
            return {
              key: `aliAttribute${index + 1}`,
              title: titleVal[0] || `属性${index + 1}`,
              align: 'center',
              minWidth: 90,
              render: (h, { row }) => {
                if (this.$common.isEmpty(row.attribute)) return h('div', {}, '');
                attribute = row.attribute.split(' ');
                if (this.$common.isEmpty(attribute[index])) return h('div', {}, '');
                attribute = attribute[index].split(':');
                if (this.$common.isEmpty(attribute[1])) return h('div', {}, '');
                return h('div', {
                  style: {
                    'text-align': 'left'
                  }
                }, attribute[1]);
              }
            }
          });
          if (this.$common.isEmpty(removeKey)) {
            this.alibabaColumn = [this.oldAlibabaColumn[0], ...addColList, this.oldAlibabaColumn[1]];
          } else {
            const newCol = [this.oldAlibabaColumn[0], ...addColList, this.oldAlibabaColumn[1]];
            this.alibabaColumn = newCol.filter(col => {
              return !removeKey.includes(col.key);
            })
          }
        }
      }
    },
    // 选择1688 商品
    checkAlibabaProduct(type, row) {
      if (type === 'matchProduct') {
        if (this.$common.isEmpty(row)) {
          this.matchProduct.mateAli = false;
          this.matchProduct.platformSpuId = '';
          this.matchProduct.platformSkuId = '';
          this.matchProduct.aliImageUrl = '';
          this.matchProduct.aliAttribute = [];
          return;
        }
        this.matchProduct.platformSpuId = row.platformSpuId;
        this.matchProduct.platformSkuId = row.platformSkuId;
        // 当对应的 sku 图不存在时使用 主图
        this.matchProduct.aliImageUrl = row.imagePath || row.imageUrl;
        this.matchProduct.aliAttribute = row.addAliProductDetailVOList;
      } else {
        if (this.$common.isEmpty(row)) {
          this.editPrice.mateAli = false;
          this.editPrice.platformSpuId = '';
          this.editPrice.platformSkuId = '';
          this.editPrice.aliImageUrl = '';
          this.editPrice.aliAttribute = [];
          return;
        }
        this.editPrice.platformSpuId = row.platformSpuId;
        this.editPrice.platformSkuId = row.platformSkuId;
        // 当对应的 sku 图不存在时使用 主图
        this.editPrice.aliImageUrl = row.imagePath || row.imageUrl;
        this.editPrice.aliAttribute = row.addAliProductDetailVOList;
      }
    },
    saveSupplierFn(data) {
      this.editPrice.supplierId = data.supplierId;
      this.editPrice.supplierName = data.supplierName;
      this.supplierOption = Object.assign({}, data);
      // this.supplierArr.push(data)
      this.priceCurrentTabItem = "0";
      this.isShowAddSupplier = false;
    },
    submitSupplierFn(data) {
      this.editPrice.supplierId = data.supplierId;
      this.editPrice.supplierName = data.supplierName;
      this.supplierOption = Object.assign({}, data);
      // this.supplierArr.push(data)
      this.priceCurrentTabItem = "0";
      this.isShowAddSupplier = false;
    },
    removePriceAction(index) {
      this.editPrice.priceDetailsList.splice(index, 1);
    }, // 勾选列表数据
    getSelectValue(data) {
      // 主table获取所选值
      this.selectionArr = data;
    },
    getSkuList(obj, type) {
      this.skuLoading = true;
      this.Tableloading = true;
      this.axios.post(api.goodsList, obj).then((res) => {
        this.skuLoading = false;
        this.Tableloading = false;
        if (res.data.code == 0) {
          if (res.data.datas.list.length > 0) {
            this.skuData = res.data.datas.list;
            this.skuData.forEach((n, i) => {
              this.$set(this.skuData[i], "isCheck", false);
            });
          }
          if (res.data.datas.list.length > 0) {
            if (type == "left") {
              this.skuParams.pageNum--;
              this.skuParams.disSkuLeft = this.skuParams.pageNum == 1;
              this.skuParams.disSkuRight = false;
            } else if (type == "right") {
              this.skuParams.pageNum++;
              this.skuParams.disSkuLeft = false;
            }
          } else {
            if (type == "left") {
              this.$Message.error("出错了！");
              this.skuParams.disSkuLeft = true;
            } else if (type == "right") {
              this.$Message.error("没有更多数据了！");
              // this.skuParams.disSkuRight = true
            }
          }
        } else {
          if (type == "left") {
            this.skuParams.disSkuLeft = true;
          } else if (type == "right") {
            // this.skuParams.disSkuRight = true
          }
        }
        this.chosenSku = {};
      }).catch(() => {
        this.skuLoading = false;
        this.Tableloading = false;
      });
    },
    chooseSkuFn() {
      this.skuParams.disSkuLeft = true;
      this.skuParams.disSkuRight = false;
      this.skuParams.pageNum = 1;
      let obj = {
        pageSize: this.skuParams.pageSize,
        pageNum: this.skuParams.pageNum,
      };
      this.getSkuList(obj);
      this.searchSku = "";
      this.isShowAddPro = true;
    },
    // 获取供应商详细信息
    getSupplierDetail(data) {
      this.axios.post(api.managementInfo, {
        supplierIds: [data]
      }).then((response) => {
        if (response.data.code === 0) {
          this.editPrice.countryId = response.data.datas.countryId;
          this.editPrice.provinceId = response.data.datas.provinceId;
          this.editPrice.cityId = response.data.datas.cityId;
          this.getProvinceFn(true);
          this.$nextTick(() => {
            this.editPrice.countryId = response.data.datas.countryId;
            this.editPrice.provinceId = response.data.datas.provinceId;
            this.getCityFn(true).then(() => {
              this.editPrice.cityId = null;
              this.editPrice.cityId = response.data.datas.cityId;
            });
          });
        }
      }).catch(() => { });
    },
    skuLeftFn() {
      let v = this;
      if (v.skuParams.pageNum > 1) {
        let obj = {
          pageSize: v.skuParams.pageSize,
          pageNum: v.skuParams.pageNum - 1,
        };
        v.getSkuList(obj, "left");
      }
    },
    skuRightFn() {
      let v = this;
      let obj = {
        pageSize: v.skuParams.pageSize,
        pageNum: v.skuParams.pageNum + 1,
      };
      v.getSkuList(obj, "right");
    },
    // 清空选中的供应商
    clearSupplier(val) {
      this.editPrice.supplierId = '';
      this.editPrice.supplierName = '';
    },
    supplierChangeFn(item, index) {
      this.editPrice.supplierName = item.supplierName;
      this.editPrice.supplierId = item.supplierId;
    },
    // 屏蔽新增供应商功能，相关需求：http://192.168.91.3/www/index.php?m=task&f=view&taskID=9942
    // supQueryChangeFn(query) {
    //   let v = this;
    //   if (query) {
    //     if (v.supplierArr.length > 0) {
    //       let supIsExist = false;
    //       v.supplierArr.forEach((n, i) => {
    //         if (
    //           n.supplierName.toLowerCase().search(query.toLowerCase()) != -1
    //         ) {
    //           supIsExist = true;
    //         }
    //       });
    //       if (!supIsExist) {
    //         v.isShowAddSupBtn = true;
    //       }
    //     }
    //   } else {
    //     v.isShowAddSupBtn = false;
    //   }
    // },
    // addSupplierFn() {
    //   this.isShowAddSupplier = true;
    //   this.priceCurrentTabItem = "1";
    //   this.editSupplier = Object.assign({}, this.newSupplier);
    //   this.editSupplier.supplierPaymentList = [
    //     // 供应商支付方式表
    //     {
    //       isDefault: 0,
    //       merchantId: "",
    //       paymentAccount: "",
    //       paymentAccountName: "",
    //       paymentBank: "",
    //       paymentType: "",
    //       subbranch: "",
    //       supplierIds: [],
    //       supplierId: "",
    //       supplierPaymentId: "",
    //     },
    //   ];
    //   this.editSupplier.supplierContactList = [
    //     // 供应商联系人表
    //     {
    //       contactMan: "",
    //       email: "",
    //       faxNumber: "",
    //       isDefault: 0,
    //       merchantId: "",
    //       mobilePhone: "",
    //       qqNumber: "",
    //       supplierContactId: "",
    //       supplierId: "",
    //       telephone: "",
    //       wwAccount: "",
    //     },
    //   ];
    //   this.editSupplier.supplierAttachmentList = [];
    // },
    searchSkuFn() {
      // 搜索sku
      let v = this;
      let obj = {
        pageNum: 1,
        pageSize: 10,
        skuList: v.searchSku ? v.searchSku : null,
      };
      v.axios.post(api.goodsList, obj).then((res) => {
        if (res.data.code == 0) {
          v.skuData = res.data.datas.list;
          v.skuParams.total = res.data.datas.total;
          v.skuData.forEach((n, i) => {
            v.$set(v.skuData[i], "isCheck", false);
          });
        }
      });
    },
    confirmSku() {
      // 确认SKU
      let v = this;
      if (!v.chosenSku) {
        v.$Message.error({
          content: "请选择需要的SKU！",
          duration: 1,
        });
      } else {
        v.editPrice.goodsId = v.chosenSku.productGoodsId;
        v.editPrice.skuNo = v.chosenSku.sku;
        v.editPrice.goodsName = v.chosenSku.cnName;
        v.editPrice.goodsThumbUrl = v.chosenSku.goodsUrl;
        v.editPrice.goodsBrandId = v.chosenSku.productBrandId;
        v.editPrice.goodsCategoryId = v.chosenSku.productCategoryId;
        v.isShowChooseSku = false;
      }
    },
    batchOperatingFn(val) {
      let v = this;
      if (v.selectionArr.length === 0) {
        switch (val) {
          case "0":
            v.$Message.error("请选择需要提交的数据");
            break;
          case "1":
            v.$Message.error("请选择需要审核通过的数据");
            break;
          case "2":
            v.$Message.error("请选择需要审核驳回的数据");
            break;
          case "3":
            v.$Message.error("请选择需要移入草稿的数据");
            break;
          case "4":
            v.$Message.error("请选择需要批量作废的数据");
            break;
          case "5":
            v.$Message.error("请选择需要删除的数据");
            break;
          case "6":
            v.$Message.error("请选择需要移入待审核的数据");
            break;
          case "7":
            v.$Message.error("请选择需要停用的数据");
            break;
        }
      } else {
        v.operationFn(val, false);
      }
    },
    operationFn(val, data) {
      let v = this;
      let auditFlag = true;
      let priceFlag = true;
      let obj = {
        operationType: val,
        supplierGoodsIds: [],
      };
      if (data) {
        // 行操作
        obj.supplierGoodsIds.push(data.supplierGoodsId);
      } else {
        // 批量操作
        const  { userId } = this.$store.state.userInfo
        v.selectionArr.forEach((n, i) => {
          // 如果val = 0即点击提交按钮时候，如果选中的选项中没有最新报价这个值的时候，给个提示不允许提交
          if(v.$common.isEmpty(n.priceDetailsList)) return priceFlag = false
          // 校验审核通过中auditPersonIds 是否包含当前操作人的id，包含及空则允许通过，如果不存在则不允许通过
          if(!this.$common.isEmpty(n.auditPersonIds) && !n.auditPersonIds.includes(userId)) return auditFlag =  false
          obj.supplierGoodsIds.push(n.supplierGoodsId);
        });
      }
      if(!auditFlag) return this.$Message.error('存在无审核权限商品，请去掉重试')
      if(!priceFlag) return this.$Message.error('选中数据中存在缺少最新报价数据，不允许提交！')
      v.axios
        .post(api.operationProductQuotation, obj)
        .then((response) => {
          if (response.data.code == 0) {
            v.$Message.success("操作成功");
            v.getList();
          }
        })
        .catch((error) => {
          v.$Message.error("异常");
        });
    }, // 审核驳回
    operationReject(val, data) {
      let v = this;
      let supplierGoodsIdList = [];
      if (val) {
        // 行操作
        supplierGoodsIdList.push(data.supplierGoodsId);
      } else {
        // 批量操作
        if (v.selectionArr.length === 0) {
          v.$Message.error("请选择需要审核驳回的数据");
          return;
        }
        v.selectionArr.forEach((n, i) => {
          supplierGoodsIdList.push(n.supplierGoodsId);
        });
      }
      v.axios
        .put(
          api.operationProductReject +
          "?supplierGoodsIdList=" +
          supplierGoodsIdList.join(",")
        )
        .then((response) => {
          if (response.data.code == 0) {
            v.$Message.success("操作成功");
            v.getList();
          }
        })
        .catch((error) => {
          v.$Message.error("异常");
        });
    },
    rowOperationFn(name, data, index) {
      let v = this;
      switch (name) {
        case "1":
          v.editPriceFn(false, data);
          break;
        case "2":
          v.editPriceFn(true, data);
          break;
        case "3":
          v.operationFn("4", data);
          break;
        case "4":
          v.operationFn("5", data);
          break;
        case "5":
          v.operationFn("1", data);
          break;
        case "6":
          v.operationFn("2", data);
          break;
        case "7": // 审核驳回
          v.operationReject(true, data);
          break;
        case "8": // 1688商品匹配
          // v.editPriceFn(true, data);
          v.getMatchProductDetail(data)
          break;
      }
    },
    adjustFn(type, data) {
      let v = this;
      let obj = {
        action: "", // 动作(top:置顶 floor:置底 up:向上 down:向下) ,
        goodsId: data.goodsId, // 商品ID ,
        supplierGoodsId: data.supplierGoodsId, // 商品报价顺序ID
      };
      if (type == "bottom") {
        // 将最后一行的supplierDefaultSort赋值给当前行，当前行后面的依次递减
        // 置底
        obj.action = "floor";
      } else if (type == "top") {
        // 将第一一行的supplierDefaultSort赋值给当前行，当前行前面的依次递加
        // 置顶
        obj.action = "top";
      } else if (type == "down") {
        // 调换本行和下一行的supplierDefaultSort排序值
        // 下移
        obj.action = "down";
      } else if (type == "up") {
        // 调换本行和上一行的supplierDefaultSort排序值
        // 上移
        obj.action = "up";
      }
      v.axios.post(api.adjustSupplierOrder, obj).then((res) => {
        if (res.data.code == 0) {
          v.$Message.success("操作成功");
          v.getList();
        }
      });
    }, // 历史价格按钮
    viewHistoryFn(data, index) {
      this.hisPriceParams.skuNo = data.skuNo;
      this.getHisPrice();
      this.isShowHisPrice = true;
    },
    getHisPrice() {
      let v = this;
      v.Tableloading = true;
      v.axios.post(api.queryPriceHistory, v.hisPriceParams).then((res) => {
        v.Tableloading = false;
        if (res.data.code == 0) {
          v.hisPriceParams.total = res.data.datas.total;
          v.hisPriceData1 = res.data.datas.list;
        }
      });
    },
    hisPriceChangePageSize(pageSize) {
      this.hisPriceParams.pageSize = pageSize;
      this.getHisPrice();
    },
    hisPriceChangePage(page) {
      this.hisPriceParams.pageNum = page;
      this.getHisPrice();
    },
    initBaseData() {
      let v = this;
      v.axios.get(api.brandList + "?brandName=" + "").then((res) => {
        if (res.data.code == 0) {
          v.brandArr = res.data.datas;
        }
      });
      this.getProductCategoryList();
      // v.axios.post(api.categoryList, { allFlag: null }).then((res) => {
      //   if (res.data.code == 0) {
      //     v.proCategoryArr = res.data.datas;
      //   }
      // });
    },
    // 合并列表单元格
    handleSpan({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 1 || columnIndex === 2) {
        const _row = this.spanArr[rowIndex];
        const _col = _row > 0 ? 1 : 0;
        return {
          rowspan: _row,
          colspan: _col,
        };
      }
    },
    getSpanArr(data) {
      this.spanArr = [];
      this.pos = null;
      for (var i = 0; i < data.length; i++) {
        if (i === 0) {
          this.spanArr.push(1);
          this.pos = 0;
          continue;
        }
        if (data[i].skuNo === data[i - 1].skuNo) {
          this.spanArr[this.pos] += 1;
          this.spanArr.push(0);
        } else {
          this.spanArr.push(1);
          this.pos = i;
        }
      }
    },
    //控制不能输入特殊字符
    btKeyUp(name) {
      this.editPrice.supplierGoodsCode = this.editPrice.supplierGoodsCode.replace(/[（）]/g, "");
    },
    limitData(value) {
      if (value.target._value.length > 18) this.$Message.error('供方货号超过最大长度')
    },
    cloudOkUpload(data, file, fileList) {
      // 文件上传成功的回调
      // let noTSatisfiableStr = data.datas;
      if (data.code == 0) {
        if (data.datas) {
          this.$Message.success(file.name + "导入成功");
          this.cloudImportExcel = false;
          this.getList();
        } else {
          this.$Message.error({
            content: file.name + "导入失败",
            duration: 2,
            closable: true,
          });
          let winHandle = window.open("about:blank");
          winHandle.location.href = this.$store.state.imgUrl + data.datas;
          this.cloudImportExcel = false;
        }
      } else if (data.code === 222002) {
        this.$Message.error("供应商已有未审核的报价单,请先审核");
      } else if (data.code === 222008) {
        this.$Notice.error({
          title: "批量导入失败,详情请下载",
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
    cloudUploadError() {
      // 上传失败回调
      this.$Message.error("导入失败");
      this.cloudImportExcel = false;
    },
    cloudDownloadEcxel() {
      // 下载云仓导入导入的模板
      // ./filenode/s 
      const path = this.$store.state.imgUrl +
        "/sps-service/template/cloudWarehouseGoodsTemplate.xlsx";
      window.location.href = path;
    },
    // 验证供应商内部货号
    validateSupplierGoodsCode(rule, value, callback) {
      if (!this.$common.isEmpty(value) && value.length > 18) {
        return callback(new Error('供应商内部货号超过最大长度'));
      }
      callback();
    },
    // 获取询价单
    getInquiryCode(data) {
      this.dialogObj.type = 'view'
      this.axios.post(api.get_supplierInquiryDetail, {
        inquiryId: data.inquiryId,
        inquiryCode: data.inquiryCode
      }).then(res => {
        if (res.data.code === 0) {
          this.dialogObj.data = res.data.datas
          this.dialogObj.data.patternFile = data.patternFile
          this.dialogObj.data.spsSupplierInquiry.firstChoice =
            this.dialogObj.data.spsSupplierInquiry.firstChoice === 0 ? false : true;
          this.dialogObj.modelVisible = true
        }
      })
    },
    validStockingVal(rule, value, callback) {
      if (!this.$common.isEmpty(value)) {
        let reg = this.$regular.validateInteger;
        if ((!reg.test(value)) || (String(value).length > 4)) {
          return callback(new Error('大于0的4位数正整数'));
        }
      }
      callback();
    }
  },
};
</script>
<style lang="less" scoped>
.edit-price-form {
  max-height: calc(100vh - 300px);
  overflow: auto;
}

.edit-price-content {
  display: flex;
  justify-content: space-between;

  .edit-price-left {
    flex: 50;
    padding-right: 10px;
  }

  .edit-price-right {
    flex: 50;
    padding-left: 10px;
    margin-right: 10px;
  }

  .form-item-line {
    :deep(.ivu-form-item-content) {
      display: flex;

      .line-item-ml10 {
        margin-left: 10px;
      }
    }
  }

  .edit-price-item-line {
    display: flex;

    .line-item-ml10 {
      margin-left: 10px;
    }

    .form-line-height {
      line-height: 32px;
    }

    .flex-100 {
      flex: 100;
    }
  }

  :deep(.ivu-table-cell) {
    line-height: 1.6em;
  }
}

.singleSearchBtn {
  margin-left: 20px;
  margin-top: 5px;
}

.price {
  width: 110px;
  text-align: right;
  vertical-align: middle;
  // float: left;
  font-size: 12px;
  color: #495060;
  line-height: 1;
  padding: 10px 12px 10px 0;
  box-sizing: border-box;
}


.price:before {
  content: "*";
  display: inline-block;
  margin-right: 4px;
  line-height: 1;
  font-family: SimSun;
  font-size: 12px;
  color: #ed3f14;
}

.btnAction:hover {
  cursor: pointer;
  color: #2d8cf0;
}

.mb24 {
  margin-bottom: 24px;
}
</style>
<style>
.supplierTabsBar .ivu-tabs-nav-prev,
.supplierTabsBar .ivu-tabs-nav-next {
  display: none;
}

.verticalCheck .ivu-checkbox {
  margin-right: 20px;
}

.trimming .buttonsArrows .arrowDown {
  margin: 10px 0 0 2px;
}

.chooseSku .vertical-center-modal {
  display: flex;
  align-items: center;
  justify-content: center;
}

.chooseSku .vertical-center-modal .ivu-modal {
  top: 0;
}

.multiCols .ivu-table-cell {
  padding: 0;
}
</style>
