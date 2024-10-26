<template>
  <div class="product-goods-main">
    <div style="position:relative" :style="productShow == 'editNew' ? 'visibility:hidden' : ''">
      <div class="commonFilter">
        <div class="card-container">
          <div class="card-content platformParamsSelect">
            <Form ref="pageParams" class="normalTop newproductgoods-filter" :model="pageParams" :label-width="110">
              <dyt-filter ref="dytFilter" :filter-row="1">
                <Form-item label="待办项名称" class="form-filter-item" v-if="tabType == 'skuWaitDone'">
                  <dyt-input v-model.trim="pageParams.backlogName" placeholder="请输入待办项名称" />
                </Form-item>
                <Form-item label="商品状态" class="form-filter-item" v-if="tabType != 'skuWaitDone'">
                  <div style="display: inline-block;vertical-align: middle;">
                    <dyt-select v-if="tabType == 'spu'"
                      style="width: 253px; display: inline-block;vertical-align: middle;"
                      v-model="pageParams.spuStatusList" multiple :max-tag-count="1">
                      <Option v-for="(item, index) in productStatusSpu" :value='item.value' :key="`status-${index}`" :label="item.label" />
                    </dyt-select>
                    <dyt-select v-else style="width: 253px; display: inline-block;vertical-align: middle;"
                      v-model="pageParams.skuStatusList" multiple :max-tag-count="1">
                      <Option v-for="(item, index) in productStatus" :value='item.value' :key="`status-${index}`" :label="item.label" />
                    </dyt-select>
                    <Poptip class="product-tooltip" trigger="hover" transfer placement="right-start">
                      <Icon type="ios-help-circle-outline"
                        style="color: #f60; font-size: 18px;cursor: pointer;font-weight: bold;" />
                      <div slot="content">
                        <p v-for="(text, index) in (tabType == 'spu' ? statusTipsSpu : statusTipsSku)"
                          :key="`tips-${index}`">{{ text }}</p>
                      </div>
                    </Poptip>
                  </div>
                </Form-item>
                <Form-item label="SPU/SKU" class="form-filter-item">
                  <dyt-input-tag type="textarea" :limit="1" :string="true" placeholder="请输入SPU/SKU, 多个逗号或回车分隔"
                    v-model="searchCode" />
                  <!-- <dyt-input type="textarea" placeholder="请输入SPU/SKU, 多个逗号或回车分隔" v-model.trim="searchCode" resize="none" /> -->
                </Form-item>
                <Form-item label="到期时间段" class="form-filter-item" v-if="tabType == 'skuWaitDone'">
                  <DatePicker
                    ref="expireDatePicker"
                    transfer
                    :editable="false"
                    style="width: 100%"
                    v-model="pageParams.expireTime"
                    :options="dateOptions"
                    placeholder="选择日期"
                    type="datetimerange"
                    format="yyyy-MM-dd HH:mm:ss"
                    placement="bottom-end"
                  />
                </Form-item>
                <Form-item label="创建人" class="form-filter-item" v-if="tabType == 'skuWaitDone'">
                  <dyt-select
                    v-model="pageParams.createdByList"
                    :max-tag-count="1"
                    :multiple="true"
                    placeholder="请选择创建人"
                  >
                    <Option
                      v-for="(item, oIndex) in allUserData"
                      :value="item.userId"
                      :key="`c-${oIndex}`"
                      :label="item.userName"
                    />
                  </dyt-select>
                </Form-item>
                <Form-item label="商品分类" class="form-filter-item" v-if="tabType != 'skuWaitDone'">
                  <!-- :default-expand-level="Infinity" -->
                  <erpTreeSelect v-model="treeSelectCategoryValue" :limit="1" :multiple="true"
                    :normalizer="treeNormalizer" :options="selectTreeProductCategory" :default-expand-level="1"
                    :appendToBody="true" placeholder="请选择" noResultsText="无匹配数据" @input="treeSelectCategoryChange" />
                </Form-item>
                <Form-item label="搜索字符" class="form-filter-item" v-if="tabType != 'skuWaitDone'">
                  <dyt-input placeholder="可输入SPU、SKU、商品名称、品牌、特性标签" v-model.trim="pageParams.searchValue"></dyt-input>
                </Form-item>
                <Form-item label="商品属性" class="form-filter-item" v-if="tabType != 'skuWaitDone'">
                  <dyt-select v-model="pageParams.attributeValueIds" :max-tag-count="1" multiple placeholder="请选择商品属性">
                    <template v-for="(item, aIndex) in attributeList">
                      <Option v-if="item" :value="item.attributeValueId" :key="`s-${aIndex}`" :label="item.cnValue" />
                      <!-- <Option v-if="item" :value="item.attributeClassifyId" :key="`s-${aIndex}`">{{ item.aliasName||'' }}</Option> -->
                    </template>
                  </dyt-select>
                </Form-item>
                <!-- <Form-item label="云卖分类" class="form-filter-item">
                  <treeSelect transfer :max-tag-count="1" ref="ymsProductCategoryTree1" :treeData="menuList" @on-change="getYmsClassifyTree" filterable clearable :value="classifyValue" placeholder="请选择云卖分类">
                  </treeSelect>
                </Form-item> -->
                <Form-item label="所属事业部" class="form-filter-item" v-if="tabType != 'skuWaitDone'">
                  <dyt-select v-model="pageParams.businessDeptIds" placeholder="请选择所属事业部" multiple :max-tag-count="1">
                    <Option v-for="(item, oIndex) in allBusinessDept" :value="item.id" :key="`b-${oIndex}`" :label="item.name" />
                  </dyt-select>
                </Form-item>
                <Form-item label="产品开发人员" class="form-filter-item" v-if="tabType != 'skuWaitDone'">
                  <dyt-select v-model="pageParams.productDeveloperUserId" placeholder="请选择开发人员">
                    <Option v-for="(item, oIndex) in personnelRoleTypeList" :value="item.userId" :key="`o-${oIndex}`" :label="item.userName" />
                  </dyt-select>
                </Form-item>
                <Form-item label="商品中文名称" class="form-filter-item" v-if="tabType != 'skuWaitDone'">
                  <dyt-input-tag type="textarea" :limit="1" placeholder="请输入(支持查询多个关键字，用逗号或回车分隔)"
                    v-model="cnNameList"></dyt-input-tag>
                  <!-- <dyt-input type="textarea" placeholder="请输入(支持查询多个关键字，用逗号或回车分隔)" v-model="cnNameList"></dyt-input> -->
                </Form-item>
                <Form-item label="品牌" class="form-filter-item" v-if="tabType != 'skuWaitDone'">
                  <dyt-select v-model="pageParams.productBrandIds" :max-tag-count="1" multiple>
                    <Option v-for="(item, index) in productBrandList" :key="index" :label="item.name"
                      :class="{ productBrandRed: item.status === 0 }" :value="item.productBrandId" />
                  </dyt-select>
                </Form-item>
                <Form-item label="特性标签" class="form-filter-item" v-if="tabType != 'skuWaitDone'">
                  <!-- :allow-create="true"
                  @on-create="addCustomTag" -->
                  <dyt-select
                    :max-tag-count="1"
                    ref="productGoodsTagsSelect"
                    v-model="pageParams.tagNames"
                    multiple
                  >
                    <Option v-for="(name, index) in customTagList" :key="index" :value="name.value" :label="name.name" />
                  </dyt-select>
                </Form-item>
                <Form-item label="UPC/EAN/ISBN" class="form-filter-item" v-if="tabType != 'skuWaitDone'">
                  <dyt-input v-model.trim="pageParams.key"></dyt-input>
                </Form-item>
                <Form-item label="商品英文名称" class="form-filter-item" v-if="tabType != 'skuWaitDone'">
                  <dyt-input-tag type="textarea" :limit="1" placeholder="请输入(支持查询多个关键字，用逗号或回车分隔)"
                    v-model="enNameList"></dyt-input-tag>
                  <!-- <dyt-input type="textarea" placeholder="请输入(支持查询多个关键字，用逗号或回车分隔)" v-model="enNameList"></dyt-input> -->
                </Form-item>
                <Form-item label="报关名称" class="form-filter-item" v-if="tabType != 'skuWaitDone'">
                  <dyt-input v-model.trim="pageParams.hsName"></dyt-input>
                </Form-item>
                <Form-item label="海关编码" class="form-filter-item" v-if="tabType != 'skuWaitDone'">
                  <dyt-input v-model.trim="pageParams.hsCode"></dyt-input>
                </Form-item>
                <Form-item label="质检模板" class="form-filter-item" prop="qualityTemplateId" v-if="tabType != 'skuWaitDone'">
                  <dyt-select v-model="pageParams.qualityTemplateId" placeholder="请选择质检模板">
                    <Option value="checkNotQualityTemplateId">未绑定质检模板</Option>
                    <Option v-for="(item, oIndex) in qualityTemplateList" :value="item.qualityClassificationId"
                      :key="`quality--${oIndex}`" :label="item.qualityClassification" />
                  </dyt-select>
                </Form-item>
                <Form-item label="创建时间" class="form-filter-item" v-if="tabType != 'skuWaitDone'">
                  <DatePicker transfer style="width: 100%" v-model="createdTimeProduct" placeholder="选择日期" :options="dateOptions"
                    @on-change="getDateValue" type="datetimerange" format="yyyy-MM-dd HH:mm:ss" placement="bottom-end">
                  </DatePicker>
                </Form-item>
                <Form-item label="有替代SKU" class="form-filter-item" prop="hasReplace" v-if="tabType != 'skuWaitDone'">
                  <dyt-select v-model="pageParams.hasReplace" placeholder="请选择是否有替代SKU">
                    <Option :value="1">有</Option>
                    <Option :value="0">无</Option>
                  </dyt-select>
                </Form-item>
                <!-- <Form-item label="货主" class="form-filter-item">
                  <dyt-select v-model="pageParams.cargoOwnerId">
                    <Option value="_NO_CARGO_OWNER">无货主</Option>
                    <template v-for="(item, hIndex) in $store.state.userInfoList">
                      <template v-if="isCargoOwner(item.businessRoleTypeList)">
                        <Option :value="item.userId" :key="hIndex">{{item.userName}}</Option>
                      </template>
                    </template>
                  </dyt-select>
                </Form-item> -->
                <div slot="operation">
                  <Button type="primary" @click="search" :disabled="SearchDisabled" icon="md-search">查询</Button>
                  <Button style="margin-left:10px;" @click="reset" v-once icon="md-refresh">重置</Button>
                </div>
              </dyt-filter>
            </Form>
          </div>
        </div>
      </div>
      <!-- <div class="dataSort grayBg">
        <span>排序方式：</span>
        <Button-group>
          <template v-for="(item,index) in buttonGroupModel">
            <Button :key="index" v-if="item.selected" type="primary" @click="modifyTheSort(index,item.status)">
              {{ item.title }}
              <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
              <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
            </Button>
            <Button :key="index" v-if="!item.selected" @click="modifyTheSort(index,item.status)">
              {{ item.title }}
              <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
              <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
            </Button>
          </template>
        </Button-group>
      </div> -->
      <div class="order-table-top">
        <Tabs :value="tabType" @on-click="changeTabType" class="tabs-tab-pane-content">
          <TabPane label="SPU视图" name="spu"></TabPane>
          <TabPane label="SKU视图" name="sku"></TabPane>
          <TabPane label="SKU待办项" name="skuWaitDone" v-if="permission.skuAwaitTab"></TabPane>
        </Tabs>
        <div class="table-top-right">
          <div class="stoppage-record" v-if="permission.ymsHaltSales" @click="openHaltSalesAdjust">YMS停售调整记录</div>
        </div>
      </div>
      <div class="orderTable showTable" :style="tabType == 'spu' ? '' : 'visibility: hidden'">
        <div class="mb5">
          <Buttons type="primary" trigger="click" @on-click="exportExcel" :disabled="!permission.excelExport">
            <Button type="primary" @click="exportExcel(0)" :disabled="!permission.excelExport">
              导出
            </Button>
            <Buttons-menu slot="list">
              <Buttons-item :name="1" :disabled="!permission.excelExport">导出（所有结果集）</Buttons-item>
            </Buttons-menu>
          </Buttons>
          <Dropdown @on-click='synchronousRemind' class="ml10" v-if="permission.synchronous">
            <Button type="primary" :loading="syncDataLoading">同步数据 <Icon type="ios-arrow-down"></Icon></Button>
            <DropdownMenu slot="list" v-if="!syncDataLoading">
              <DropdownItem name='cost' style="text-align:center;">同步商品成本价</DropdownItem>
              <DropdownItem name='attribute' style="text-align:center;">同步商品属性+状态+标签</DropdownItem>
              <DropdownItem name='all' style="text-align:center;">同步所有数据</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Dropdown @on-click='batchOperation' class="ml10">
            <Button type="primary">批量操作 <Icon type="ios-arrow-down"></Icon></Button>
            <DropdownMenu slot="list">
              <DropdownItem name='quality' style="text-align:center;" :disabled="!spuQualityOperation">批量编辑质检模板
              </DropdownItem>
              <DropdownItem name='checkType' style="text-align:center;" :disabled="!spuBatchUpdateCheckType">批量编辑质检类型比例
              </DropdownItem>
              <DropdownItem name='copy' style="text-align:center;">复制当前列表所有SPU</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Button class="ml10" @click='batchSyncInfoTomdy' type="primary" v-if="permission.syncMingDao">同步信息至明道云</Button>
          <Button
            class="ml10"
            @click='batchSyncInfoYms(selectedProductGoodsListSpu)'
            type="primary"
            v-if="permission.syncYms"
          >同步商品至YMS</Button>
          <Button class="ml10" @click='batchCopyProduct' type="primary" v-if="permission.copyProduct">产品复制</Button>
        </div>
        <Table highlight-row :loading="tableLoadingSpu" border :height="tableHeight" :columns="productGoodsColumnSpu"
          :data="productGoodsDataSpu" @on-selection-change="getSelectValueSpu" @on-select="onSelect"
          @on-select-cancel="onSelectCancel" @on-select-all="onSelectAll" @on-sort-change="tableSortChange" />
        <div class="mt5">
          <Checkbox v-model="allPageStatus">所有页全选</Checkbox>
        </div>
        <div style="text-align:right;padding-right:10px">
          <Page :total="totalSpu" @on-change="changePageSpu" show-total :page-size="pageSizeSpu" show-elevator
            :current="pageNumSpu || 1" show-sizer @on-page-size-change="changePageSizeSpu" placement="top"
            :page-size-opts="pageArray">
          </Page>
        </div>
      </div>
      <div class="orderTable showTable" :style="tabType == 'sku' ? '' : 'visibility: hidden'">
        <div class="mb5">
          <Button type="primary" @click="infoImport" v-if="permission.assembleImport">组装信息导入</Button>
          <Dropdown @on-click='ymsImport' class="ml10">
            <Button type="primary">导入 <Icon type="ios-arrow-down"></Icon></Button>
            <DropdownMenu slot="list">
              <DropdownItem name='yms' v-if="permission.excelImportCloud">产品导入</DropdownItem>
              <DropdownItem name='special' v-if="permission.specialImport">特殊分销产品导入</DropdownItem>
              <DropdownItem name='replaceSku' v-if="permission.importReplaceSku">替代SKU导入</DropdownItem>
              <DropdownItem name='salesLinkImport' v-if="permission.salesImport">销售链接导入</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <!-- <Button type="primary" @click="ymsImport('yms')" class="ml10" v-if="permission.excelImportCloud">产品导入</Button>
          <Button type="primary" @click="ymsImport('special')" class="ml10"
            v-if="permission.specialImport">特殊分销产品导入</Button> -->
          <Buttons type="primary" class="ml10" trigger="click" @on-click="exportExcel"
            :disabled="!permission.excelExport">
            <Button type="primary" @click="exportExcel(0)" :disabled="!permission.excelExport">
              EXCEL导出
            </Button>
            <Buttons-menu slot="list">
              <Buttons-item :name="1" :disabled="!permission.excelExport">导出（所有结果集）</Buttons-item>
            </Buttons-menu>
          </Buttons>
          <Dropdown @on-click='batchOption' class="ml10">
            <Button type="primary">批量操作 <Icon type="ios-arrow-down"></Icon></Button>
            <DropdownMenu slot="list">
              <DropdownItem :disabled="!permission.batchDelete" name='1' style="text-align:center;">删除</DropdownItem>
              <DropdownItem name='2' :disabled="!permission.batchGoodsUpdate" style="text-align:center;">修改</DropdownItem>
              <!-- 需求编号为 2475 时删除 批量编辑质检模板、批量编辑质检类型比例 -->
              <!-- <DropdownItem name='quality' style="textAlign:center;" :disabled="!skuQualityOperation">批量编辑质检模板</DropdownItem>
              <DropdownItem name='checkType' style="textAlign:center;" :disabled="!skuBatchUpdateCheckType">批量编辑质检类型比例</DropdownItem> -->
              <DropdownItem name='3' style="text-align:center;" :disabled="!permission.printLable">批量打印</DropdownItem>
              <DropdownItem name='4'>复制当前列表所有SKU</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Button class="ml10" @click='batchRecoverSku' type="primary" v-if="permission.restoreSpuSku">恢复已删除的SKU</Button>
          <Button type="primary" @click="openSubstituteModal({})" class="ml10"
            v-if="permission.replaceSku">新增替代SKU</Button>
        </div>
        <Table highlight-row :loading="tableLoadingSku" border :height="tableHeight" :columns="productGoodsColumnSku"
          :data="productGoodsDataSku" @on-selection-change="getSelectValueSku" @on-select="onSelect"
          @on-select-cancel="onSelectCancel" @on-select-all="onSelectAll" @on-sort-change="tableSortChange" />
        <div class="mt5">
          <Checkbox v-model="allPageStatus">所有页全选</Checkbox>
        </div>
        <div style="text-align:right;padding-right:10px">
          <Page :total="totalSku" @on-change="changePageSku" show-total :page-size="pageSizeSku" show-elevator
            :current="pageNumSku || 1" show-sizer @on-page-size-change="changePageSizeSku" placement="top"
            :page-size-opts="pageArray">
          </Page>
        </div>
      </div>
      <div class="orderTable showTable" :style="tabType == 'skuWaitDone' ? '' : 'visibility: hidden'" v-if="permission.skuAwaitTab">
        <skuWaitToDone
          ref="sku-wait-done"
          :get-seatch-filter="getListQuery"
        />
      </div>
    </div>

    <!-- 编辑spu -->
    <editProduct :productBrandList="productBrandList" :productGoodsListDictionary="productGoodsListDictionarySku"
      :productTagList="productTagList" :productId="productId" :ymsMenuList="menuList"
      :originalCategoryData="originalCategoryData" :editProductModal.sync="editProductModal"
      :productCategoryListData="productCategoryList" :editStatus="editStatus" @goBack="goBack" @updateList="updateList" />
    <!--导入组装信息-->
    <importModal
      ref="importModal"
      :importModal="importModal"
      :action="import_url"
      title="组装信息导入"
      name="files"
      :upload-data="assembleUploadData"
      :loadTemplateLocalApi="'/product-service/template/productGoodsAssemble.xlsx'"
      :service="'/product-service'"
      @refreshTable="getList('sku')"
    >
      <div class="skuUpdate mt10">
        导入模板发现相同SKU时：
        <RadioGroup v-model="assembleUploadData.updateIgnore">
          <Radio label="0">覆盖</Radio>
          <Radio label="1">忽略</Radio>
        </RadioGroup>
      </div>
    </importModal>

    <!--导入云卖产品-->
    <Modal v-model="ymsModal" :title="importFile.title" :loading="ymsModalLoading" @on-ok="upload3"
      @on-cancel="cancelImport">
      <div style="margin-top:15px" v-if="ymsModal">
        <dytUpload ref="upload3" :name="importFileName" :headers="headObj" :show-upload-list="false"
          :on-success="handleSuccess3" :on-format-error="handleFormatError3" :on-error="handleError3"
          :action="importFile.uploadUrl" :data="uploadParams" :format="['xlsx', 'xls']"
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          :before-upload="handleUpload3">
          <Button type="primary">选择文件</Button>
          <div style="display: inline-block;margin-left:20px;">
            <template v-if="isReplaceSku">
              <Button type="text" @click.stop="loadTemplate3('replaceSku')" style="color:#2d8cf0">下载模板</Button>
            </template>
            <template v-else-if="isSalesLinkModal">
              <Button type="text" @click.stop="loadTemplate3('salesLinkModal')" style="color:#2d8cf0">下载模板</Button>
            </template>
            <template v-else>
              <Button type="text" @click.stop="loadTemplate3('ordinary')" style="color:#2d8cf0">下载普通模板</Button>
              <Button type="text" @click.stop="loadTemplate3('append')"
                style="margin-left:10px;color:#2d8cf0">下载追加模板</Button>
            </template>
          </div>
        </dytUpload>
        <div v-if="file3 !== null" class="mt10">{{ file3.name }}</div>
        <Form ref="pageParams" class="mt10" :model="uploadParams" :label-width="70" v-if="!isSalesLinkModal">
          <Form-item label="导入类型: ">
            <RadioGroup v-model="uploadParams.importType" class="products-radio">
              <template v-if="isReplaceSku">
                <Radio label="0">新增</Radio>
                <Radio label="1">覆盖</Radio>
              </template>
              <template v-else>
                <Radio label="1">普通</Radio>
                <Radio label="2">追加</Radio>
              </template>
            </RadioGroup>
          </Form-item>
        </Form>
      </div>
    </Modal>

    <!-- 导入SKU -->
    <Modal v-model="addSku" title="导入SKU" :loading="addSkuModalLoading">
      <div class="import-sku-modal-step" v-if="isSupplierTalg">
        <Button type="primary" v-if="stepModel !== 0" @click="fallbackBtn" style="margin: 0 0 15px 0;">回退</Button>
        <Steps :current="stepModel">
          <Step title="选择分类"></Step>
          <Step title="选择文件"></Step>
        </Steps>
      </div>
      <div v-if="stepModel === 0 && isSupplierTalg">
        <Form class="category-box">
          <Form-item label="云卖分类：">
            <dyt-select v-model="uploadData.ymsProductCategoryId" @on-query-change="filterCategoryChange"
              @on-change="ymsProductCategoryChange">
              <Option v-for="(item, yIndex) in menuFilterList" :value="item.ymsProductCategoryId"
                :label="item.productCategoryNavigation" :key="`menuFilterList-${yIndex}`"></Option>
            </dyt-select>
          </Form-item>
        </Form>
      </div>
      <div v-else style="position: relative">
        <p class="urlText">选择导入文件：</p>
        <div>
          <dytUpload ref="upload" name="files" :data="uploadData" :headers="headObj" :show-upload-list="false"
            :on-success="handleSuccess" :on-format-error="handleFormatError" :action="uploadFiles"
            :format="['xlsx', 'xls']"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            :before-upload="handleUpload">
            <Button style="margin-left:10px;margin-top:10px;">选择文件</Button>
          </dytUpload>
          <div v-if="file !== null" style="margin-top:10px"> 上传文件：{{ file.name }}
          </div>
        </div>
        <div class="skuModalBtn" style="top:10px">
          <Button type="text" @click="loadTemplate">下载模板</Button>
        </div>
        <p class="skuText">注：一次最多支持导入5000条数据，商品导入模板，【特性标签】改为允许导入多个数据，每个标签用逗号分隔： 添加标签时，包含逗号特殊字符不能创建成功</p>
        <div class="skuUpdate">
          导入模板发现相同SPU时：
          <RadioGroup v-model="uploadData.updateIgnore">
            <Radio label="0">覆盖</Radio>
            <Radio label="1">忽略</Radio>
          </RadioGroup>
        </div>
      </div>
      <div slot="footer">
        <Button @click="addSku = false">取消</Button>
        <Button type="primary" @click="upload" v-if="stepModel === 1 || !isSupplierTalg">导入
        </Button>
      </div>
    </Modal>
    <!-- 标签导入与解绑 -->
    <Modal v-model="addTagSku" title="标签导入与解绑" :loading="addSkuModalLoading" @on-ok="upload1" @on-cancel="addSkuCancel">
      <div>
        <!-- 选择导入文件 -->
        <p class="urlText">选择导入文件</p>
        <div>
          <dytUpload ref="upload1" name="files" :data="uploadData" :headers="headObj" :show-upload-list="false"
            :on-success="handleSuccess1" :on-format-error="handleFormatError"
            :action="upType === 'add' ? uploadFiles1 : uploadFiles2" :format="['xlsx', 'xls']"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            :before-upload="handleUpload1">
            <Button style="margin-left:10px;margin-top:10px;">选择文件</Button>
          </dytUpload>
          <div v-if="file1 !== null" style="margin-top:10px"> 上传文件：{{ file1.name }}
          </div>
        </div>
      </div>
      <RadioGroup v-model="upType" style="margin-top: 10px;">
        <Radio label="add">
          <span>标签导入</span>
        </Radio>
        <Radio label="remove">
          <span>解绑标签</span>
        </Radio>
      </RadioGroup>

      <div v-if="upType === 'add'">
        <RadioGroup v-model="addition" style="margin-top: 10px;">
          <Radio label="1">
            <span>覆盖</span>
          </Radio>
          <Radio label="2">
            <span>追加</span>
          </Radio>
        </RadioGroup>
      </div>
      <!-- <div>
         <p class="urlText">选择标签解绑文件</p>
         <div>
           <dytUpload
                   ref="upload2"
                   name="files"
                   :data="uploadData"
                   :headers="headObj"
                   :show-upload-list="false"
                   :on-success="handleSuccess2"
                   :on-format-error="handleFormatError"
                   :action="uploadFiles2"
                   :format="['xlsx','xls']"
                   :before-upload="handleUpload2">
             <Button style="margin-left:10px;margin-top:10px;">选择文件</Button>
           </dytUpload>
           <div v-if="file2 !== null" style="margin-top:10px"> 上传文件：{{ file2.name }}</div>
         </div>
       </div>-->
      <div style="margin-top: 15px;float: right">
        <!-- 下载模板 -->
        <Button type="text" @click="loadTemplate1">下载模板</Button>
      </div>
      <p class="skuText">注：商品标签不能包含逗号</p>
    </Modal>
    <!-- 批量修改 -->
    <Modal v-model="updateModal" v-if="updateModalStatus" @on-ok="updateOk" @on-cancel="updateCancel" title="批量修改商品"
      :width="850" :loading="updateLoading">
      <Form ref="updateParams" class="normalTop" :model="updateParams" :label-width="110" label-position="left">
        <!-- 商品中文名称 -->
        <Row>
          <Col span="1" style="margin-top:5px;">
          <Checkbox v-model="updateParams.cnNameSelected"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="商品中文名称：" prop="cnNameSelected">
            <dyt-select v-model="updateParams.cnNameSelectedId" style="width:100px;margin-right:5px"
              :disabled="!updateParams.cnNameSelected">
              <Option v-for="item in cnNameSelectedIdList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </dyt-select>
            <Input style="width:460px" :maxlength="1000" v-model="updateParams.updateCnName"
              :disabled="!updateParams.cnNameSelected"></Input>
          </Form-item>
          </Col>
        </Row>
        <!-- 商品英文名称 -->
        <Row>
          <Col span="1" style="margin-top:5px;">
          <Checkbox v-model="updateParams.enNameSelected"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="商品英文名称：" prop="enNameSelected">
            <Input style="width:460px" :maxlength="1000" v-model="updateParams.updateEnName"
              :disabled="!updateParams.enNameSelected"></Input>
          </Form-item>
          </Col>
        </Row>
        <!-- 水洗唛 -->
        <Row>
          <Col span="1" style="margin-top:5px;">
          <Checkbox v-model="updateParams.isChangeWashedLabel"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="水洗唛：" prop="washedLabel">
            <Input style="width:460px" placeholder="请输入水洗唛，最多300字符" type="textarea" :maxlength="300"
              :autosize="{ minRows: 1, maxRows: 4 }" v-model="updateParams.washedLabel"
              :disabled="!updateParams.isChangeWashedLabel" />
          </Form-item>
          </Col>
        </Row>
        <!-- 水洗唛PDF文件 -->
        <Row>
          <Col span="1" style="margin-top:5px;">
          <Checkbox v-model="updateParams.isChangeWashedLabelPdf"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item prop="washedLabelPdfPath">
            <div slot="label">
              <div>水洗唛文件：</div>
              <div>(PDF/JPG/PNG)</div>
            </div>
            <dytUpload v-show="false" ref="washedUploadRef" name="files" :show-upload-list="false"
            accept="application/pdf,image/jpg,image/jpeg,image/png" :before-upload="washedUploadBefore" :action="uploadFilesUrl" />
            <div class="washed-operate">
              <Poptip trigger="hover" placement="right-start" v-if="!$common.isEmpty(updateParams.washedLabelPdfPath)">
                <div class="washed-image-content">
                  <img :src="pdfFirstImgPreview" @click="previewWashedPdf" />
                  <Spin fix v-if="isWashedUploadLoading"></Spin>
                </div>
                <div class="washed-image-preview-content" slot="content">
                  <img :src="pdfFirstImgPreview" />
                </div>
              </Poptip>
              <Button v-if="$common.isEmpty(updateParams.washedLabelPdfPath)" type="primary" @click="opentCheckFile"
                :disabled="!updateParams.isChangeWashedLabelPdf" :loading="isWashedUploadLoading">点击上传</Button>
              <template v-if="!$common.isEmpty(updateParams.washedLabelPdfPath)">
                <span class="click-text-underline" @click="previewWashedPdf">预览</span>
                <span class="click-text-underline" @click="opentCheckFile"
                  v-if="updateParams.isChangeWashedLabelPdf">更换</span>
                <span class="click-text-underline" @click="removeWashedPdf"
                  v-if="updateParams.isChangeWashedLabelPdf">删除</span>
              </template>
            </div>
          </Form-item>
          </Col>
        </Row>
        <!-- 水洗唛 WORD 文件 -->
        <Row>
          <Col span="1" style="margin-top:5px;">
          <Checkbox v-model="updateParams.isChangeWashedLabelWord"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="水洗唛word文件:" prop="washedLabelWordPath">
            <uploadSampleFile style="max-width: 400px;" v-model="washedLabelWordFile"
              :disabled="!updateParams.isChangeWashedLabelWord" accept-error-txt="文件格式不对，请上传格式为 docx、doc 的 word文档格式文件"
              :file-max-size="30" :upload-props="{
                'show-upload-list': false,
                multiple: false,
                accept: [
                  'application/msword',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                ]
              }" />
          </Form-item>
          </Col>
        </Row>
        <!-- SPU生产要求 -->
        <Row>
          <Col span="1" style="margin-top:5px;">
          <Checkbox v-model="updateParams.isChangeOuterPackageRequirement"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="SPU生产要求：" prop="outerPackageRequirement"
            :rules="{ validator: validateOutPack, trigger: 'change' }">
            <Input style="width:460px" type="textarea" placeholder="请输入SPU生产要求，最多200字符"
              :autosize="{ minRows: 1, maxRows: 4 }" v-model="updateParams.outerPackageRequirement"
              :disabled="!updateParams.isChangeOuterPackageRequirement" />
          </Form-item>
          </Col>
        </Row>
        <!-- SKU生产要求 -->
        <Row>
          <Col span="1" style="margin-top:5px;">
          <Checkbox v-model="updateParams.isChangeProductionRequirement"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="SKU生产要求：" prop="productionRequirement"
            :rules="{ validator: validateSkuPack, trigger: 'change' }">
            <Input style="width:460px" type="textarea" placeholder="请输入SKU生产要求，特殊收货要求请用“【” “】”符号进行圈中, 最多200字符"
              :autosize="{ minRows: 1, maxRows: 4 }" v-model="updateParams.productionRequirement"
              :disabled="!updateParams.isChangeProductionRequirement" />
          </Form-item>
          </Col>
        </Row>
        <!-- UPC,EAN,ISBN -->
        <Row v-if="!isSupplierTalg">
          <Col span="1" style="margin-top:5px;">
          <Checkbox v-model="updateParams.upcSelected"></Checkbox>
          </Col>
          <Col span="8">
          <Form-item label="UPC：" prop="updateUpc">
            <Input style="width:150px" :maxlength="100" v-model.trim="updateParams.updateUpc"
              :disabled="!updateParams.upcSelected"></Input>
          </Form-item>
          </Col>
          <Col span="1" style="margin-top:5px;">
          <Checkbox v-model="updateParams.eanSelected"></Checkbox>
          </Col>
          <Col span="7">
          <Form-item label="EAN：" :label-width="50" prop="updateEan">
            <Input style="width:150px" :maxlength="100" v-model.trim="updateParams.updateEan"
              :disabled="!updateParams.eanSelected"></Input>
          </Form-item>
          </Col>
          <Col span="1" style="margin-top:5px;">
          <Checkbox v-model="updateParams.isbnSelected"></Checkbox>
          </Col>
          <Col span="6">
          <Form-item label="ISBN：" :label-width="50" prop="updateIsbn">
            <Input style="width:150px" :maxlength="100" v-model.trim="updateParams.updateIsbn"
              :disabled="!updateParams.isbnSelected"></Input>
          </Form-item>
          </Col>
        </Row>
        <!-- 所属分类 -->
        <Row v-if="!isSupplierTalg">
          <Col span="1" style="margin-top:5px;">
          <Checkbox v-model="updateParams.productCategoryIdSelected" :disabled="productTypeValidation"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="所属分类：" prop="productCategoryId">
            <!-- <treeSelect
              ref="productCategoryTree"
              style="width:300px"
              :treeData="updateCategoryTree"
              @on-change="getTreeData"
              filterable
              :disabled="!updateParams.productCategoryIdSelected || productTypeValidation"
            /> -->
            <!-- :default-expand-level="Infinity" -->
            <erpTreeSelect style="width:300px"
              :disabled="!updateParams.productCategoryIdSelected || productTypeValidation"
              v-model="updateParams.updateProductCategoryId" :multiple="false" :normalizer="treeNormalizer"
              :options="batProductCategoryTree" :default-expand-level="1" placeholder="请选择所属分类" noResultsText="无匹配数据"
              @input="getTreeData" />
          </Form-item>
          </Col>
        </Row>
        <!--云卖分类-->
        <!-- <Row>
          <Col span="1" style="margin-top:5px;">
          <Checkbox v-model="updateParams.ymsProductCategoryIdSelected"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="云卖分类：" prop="ymsProductCategoryId">
            <treeSelect ref="productCategoryTree1" style="width:300px" :treeData="menuList" @on-change="getYmsTreeData"
              filterable :disabled="!updateParams.ymsProductCategoryIdSelected" placeholder="请选择云卖分类"></treeSelect>
          </Form-item>
          </Col>
        </Row> -->
        <!-- 品牌 -->
        <Row>
          <Col span="1" style="margin-top:5px;">
          <Checkbox v-model="updateParams.productBrandIdSelected"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="品牌：" prop="updateProductBrandId">
            <dyt-select v-model.trim="updateParams.updateProductBrandId" :transfer="true"
              :disabled="!updateParams.productBrandIdSelected">
              <Option v-for="(item, index) in productBrandList" :key="index"
                :class="{ productBrandRed: item.status == 0 }" :value="item.productBrandId">{{ item.name }}
              </Option>
            </dyt-select>
          </Form-item>
          </Col>
        </Row>
        <!-- 特性标签 -->
        <Row v-if="!isSupplierTalg">
          <Col span="1" style="margin-top:5px;">
          <Checkbox v-model="updateParams.productGoodsTagsSelected"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="特性标签：" prop="updateProductGoodsTags">
            <dyt-select v-model="updateParams.productGoodsTagsSelectedId" style="width:100px;margin-right:5px" :hidden-placeholder="false"
              :disabled="!updateParams.productGoodsTagsSelected">
              <Option
                v-for="item in productGoodsTagsSelectedIdList"
                :value="item.value"
                :key="item.value"
                :label="item.label"
              />
            </dyt-select>
            <dytStoreSelect
              ref="specialityTagsSelect"
              v-model="updateParams.updateProductGoodsTags"
              :option-data="customTagList"
              :disabled="!updateParams.productGoodsTagsSelected"
              :replace-option-key="{ value: 'value', label: 'name' }"
              :hidden-placeholder="false"
              placeholder="请选择特性标签"
              input-placeholder="请输入，多个可用逗号或换行隔开"
            />
          </Form-item>
          </Col>
        </Row>
        <!-- 采购成本价 -->
        <Row>
          <Col span="1" style="margin-top:5px;">
          <Checkbox v-model="updateParams.suggestPriceSelected"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="采购成本价：" prop="updateSuggestPrice" :rules="[
            { validator: $common.validatorMaxNumber, min: 0, max: 10000000000, trigger: 'blur' },
            { validator: $common.validatorMaxNumber, min: 0, max: 10000000000, trigger: 'change' }
          ]">
            <dytInput :disabled="!updateParams.suggestPriceSelected" style="width:300px"
              placeholder="请输入 0 到 10000000000 之间最多2位小数的数字" v-model="updateParams.updateSuggestPrice" />
          </Form-item>
          </Col>
        </Row>
        <!-- 分销 -->
        <Row>
          <Col span="1" style="margin-top:5px;">
          <Checkbox v-model="updateParams.distributionPriceSelected"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="分销价格：" prop="distributionPriceType" style="display:inline-block; width: 200px;"
            :rules="updateParams.distributionPriceSelected ? { required: true, message: '请选择分销类型', trigger: 'change' } : {}">
            <dyt-select :disabled="!updateParams.distributionPriceSelected" v-model="updateParams.distributionPriceType"
              :clearable="false">
              <Option value="1">按比例增加</Option>
              <Option value="0">按数值增加</Option>
            </dyt-select>
          </Form-item>
          <Form-item label="" prop="distributionPriceValue" :label-width="5" style="display:inline-block; width: 300px;">
            <dytInput
              :disabled="!updateParams.distributionPriceSelected || $common.isEmpty(updateParams.distributionPriceType)"
              v-model="updateParams.distributionPriceValue" placeholder="请输入数字" :clearable="false" type="number">
              <div slot="suffix" class="distribution-price-suffix">{{ `${updateParams.distributionPriceType == 0 ? 'RMB' :
                '%'}` }}</div>
            </dytInput>
          </Form-item>
          </Col>
        </Row>
        <!-- 商品状态 -->
        <Row v-if="!isSupplierTalg">
          <Col span="1" style="margin-top:5px;">
          <Checkbox v-model="updateParams.statusSelected"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item prop="updateStatus">
            <label slot="label">
              <span>商品状态：</span>
              <Tooltip class="product-tooltip" placement="right-start" style="vertical-align: middle;">
                <Icon type="ios-help-circle-outline"
                  style="color: #f60; font-size: 18px;cursor: pointer;font-weight: bold;" />
                <div slot="content">
                  <p v-for="(text, index) in statusTipsSku" :key="`tips-${index}`">{{ text }}</p>
                </div>
              </Tooltip>
            </label>
            <RadioGroup v-model="updateParams.updateStatus">
              <Radio v-for="(item, index) in productStatus" :key="`raidio-${index}`"
                :disabled="!updateParams.statusSelected" :label="item.value">{{ item.label }}</Radio>
            </RadioGroup>
          </Form-item>
          </Col>
        </Row>
        <!-- 报关中文名称 -->
        <Row v-if="!isSupplierTalg">
          <Col span="1" style="margin-top:5px;">
          <Checkbox v-model="updateParams.cnHsNameSelected"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="报关中文名称：" prop="updateCnHsName" :rules="updateParams.cnHsNameSelected ? {
            required: true, validator: hsNameMaxVerify, msg: '请输入报关中文名称', maxLength: 200, trigger: 'blur'
          } : {}">
            <Input :disabled="!updateParams.cnHsNameSelected" style="width:330px" v-model="updateParams.updateCnHsName"
              placeholder="请输入报关中文名称" />
          </Form-item>
          </Col>
        </Row>
        <!-- 报关英文名称 -->
        <Row v-if="!isSupplierTalg">
          <Col span="1" style="margin-top:5px;">
          <Checkbox v-model="updateParams.enHsNameSelected"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="报关英文名称：" prop="updateEnHsName" :rules="updateParams.enHsNameSelected ? {
            required: true, validator: enNameMaxVerify, msg: '请输入报关英文名称', maxLength: 200, trigger: 'blur'
          } : {}">
            <Input :disabled="!updateParams.enHsNameSelected" style="width:330px" v-model="updateParams.updateEnHsName"
              placeholder="请输入报关英文名称" />
          </Form-item>
          </Col>
        </Row>
        <!-- 海关编码 -->
        <Row v-if="!isSupplierTalg">
          <Col span="1" style="margin-top:5px;">
          <Checkbox v-model="updateParams.hsCodeSelected"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="海关编码：" prop="updateHsCode"
            :rules="updateParams.hsCodeSelected ? { required: true, validator: hsCodeVerify, msg: '请输入海关编码', minLength: 10, maxLength: 10, trigger: 'blur' } : {}">
            <Input :disabled="!updateParams.hsCodeSelected" style="width:330px" v-model.trim="updateParams.updateHsCode" ></Input>
          </Form-item>
          </Col>
        </Row>
        <!-- 产品类型 -->
        <Row v-if="!isSupplierTalg">
          <Col span="1" style="margin-top:5px;">
          <Checkbox v-model="updateParams.acceptableTypeSelected"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="产品类型：" prop="acceptableType">
            <dyt-select :disabled="!updateParams.acceptableTypeSelected" @on-change="changeSelect"
              ref="goodsTypeSelect" v-model="updateParams.acceptableType" :max-tag-count="1" multiple>
              <Option v-for="(item, index) in productTypeList" :key="index" :value="item.value" :disabled="item.disabled">
                {{ item.name }}
              </Option>
            </dyt-select>
          </Form-item>
          </Col>
        </Row>
        <!-- 商品开发人员 -->
        <Row v-if="!isSupplierTalg">
          <Col span="1" style="margin-top:5px;">
          <Checkbox v-model="updateParams.productDeveloperUserIdSelected"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="商品开发员：" prop="productDeveloperUserId">
            <dyt-select :disabled="!updateParams.productDeveloperUserIdSelected" ref="productDeveSelect"
              v-model="updateParams.updateDroductDeveloperUserId">
              <Option v-for="item in businessRoleTypeList" :value="item.userId" :key="item.userId"
                :disabled="[0, '0'].includes(item.status)">{{ item.userName }}</Option>
            </dyt-select>
          </Form-item>
          </Col>
        </Row>
        <!-- 商品重量 -->
        <Row>
          <Col span="1" style="margin-top:5px;">
          <Checkbox v-model="updateParams.weightSelected"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="商品重量（g）:" prop="weight">
            <InputNumber :disabled="!updateParams.weightSelected" :min="0" :precision="0" style="width:330px"
              v-model.trim="updateParams.weight"></InputNumber>
          </Form-item>
          </Col>
        </Row>
        <!-- 商品尺寸 -->
        <Row>
          <Col span="1" style="margin-top:5px;">
          <Checkbox v-model="updateParams.sizeSelected"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="商品尺寸（cm）:">
            <InputNumber :disabled="!updateParams.sizeSelected" :min="0" :max="9999.99" style="width:90px"
              placeholder="长：" v-model.trim="updateParams.length"></InputNumber>
            <InputNumber :disabled="!updateParams.sizeSelected" :min="0" :max="9999.99"
              style="width:90px; margin-left:27px;" placeholder="宽：" v-model.trim="updateParams.width"></InputNumber>
            <InputNumber :disabled="!updateParams.sizeSelected" :min="0" :max="9999.99"
              style="width:90px; margin-left:27px;" placeholder="高：" v-model.trim="updateParams.height"></InputNumber>
          </Form-item>
          </Col>
        </Row>
      </Form>
      <Spin v-if="batchUpdateLoading" fix></Spin>
    </Modal>
    <!-- 查看导入任务 -->
    <exportTaskModal :taskModal="taskModal" :type="1" v-if="renderTaskModal"></exportTaskModal>
    <!-- 删除确认框 -->
    <delConfirmModal ref="delConfirmModal" @ok="del"></delConfirmModal>
    <!-- 操作日志 -->
    <Modal v-model="modal1" title="操作日志" width="800" @on-visible-change="logVisible">
      <Table :columns="columns1" :loading="spinShow" :data="data1"></Table>
      <div class="table-page pb20">
        <div class="table-page-right">
          <Page :total="logTotal" @on-change="changeLogPage" show-total :page-size="logParams.pageSize" show-elevator
            :current="logParams.pageNum" show-sizer @on-page-size-change="changeLogPageSize" placement="top"
            :page-size-opts="pageArray"></Page>
        </div>
      </div>
      <div slot="footer"></div>
    </Modal>
    <!-- 商品历史状态查看 -->
    <goodsHistoryStatusModal v-if="permission.statusHistory" :module-visible.sync="goodsHistoryStatusVisible" :module-data="pageTableRowModalData" />
    <!-- 产品复制 -->
    <Modal v-model="visibleCopyProduct" title="产品复制" :loading="copyProductModalLoading" width="650">
      <Form :model="copyProductData" :label-width="100">
        <FormItem label="SPU">
          <Input style="width:260px" v-model="copyProductData.productSpu" disabled></Input>
        </FormItem>
        <Form-item label="复制至：" prop="">
          <!-- :default-expand-level="Infinity" -->
          <erpTreeSelect v-model="copyTreeSelectCategoryValue" :multiple="true" :normalizer="treeNormalizer"
            :options="copyProductCategoryTree" :default-expand-level="1" placeholder="商品分类数据" noResultsText="无匹配数据"
            @input="treeSelectCategoryChange" />
        </Form-item>
        <Table width="560" height="500" style="margin-left:35px" :columns="copyProductColumns"
          :data="copyProductTableData" border></Table>
      </Form>
      <div slot="footer" style="display:flex;justify-content: space-between;">
        <div style="font-size:15px;font-weight: 700;">复制总数量：<span style="color:red">{{ copyProductTableData.length || 0
        }}</span></div>
        <div>
          <Button type="primary" @click="confirmCopy">确定</Button>
          <Button @click="visibleCopyProduct = false">取消</Button>
        </div>
      </div>

    </Modal>
    <print ref="print" :printData="printData" :printColumns="printColumns"></print>
    <!-- 第三方标签管理 -->
    <thirdpartyTagManage :model-visible.sync="prindThirdpartyModal" :view-type="thirdpartyModalViewType"
      :module-data="thirdpartyModalData" />
    <!-- 批量修改质检信息 -->
    <batchQualityEdit :modal-visible.sync="qualityEditVisual" :refresh-table.sync="refreshTable"
      :quality-edit-data="qualityEditData" :classification-id="qualityClassificationId" :selectAll="allPageStatus"
      :spu-total="totalSpu" :searchParams="getListQuery" />
    <exportDataModal :modal-visible.sync="visibleExportData" :modal-data="exportDataParams" />
    <!-- 批量编辑质检类型比例 -->
    <editCheckType :selectAll="allPageStatus" :module-visible.sync="openEditCheckType"
      :module-data="moduleEditCheckTypeData" :spu-total="totalSpu" :getListQuery="getListQuery"
      @updateList="getListBoth" />
    <!-- 批量恢复已删除的SKU -->
    <recoverSkuModal :module-visible.sync="visibleRecoverSku" @updateList="getListBoth" />
    <!-- 编辑采购信息 -->
    <editPurchaseInfo :modal-visible.sync="editPurchaseInfoModal" :modal-data="curPurchaseInfo"
      @getEditPurchaseInfo="getEditPurchaseInfo" />
    <!-- 替代SKU弹窗 -->
    <substituteSkuModal :module-visible.sync="substituteVisibleModal" :module-data="selectTableRow"
      @updateList="getListBoth" />
    <!-- 同步至明道云确认弹窗 -->
    <confirmModal
      :model-visible.sync="confirmVisibleModal"
      :module-data="confirmData"
      :loading="mingDaoLoading"
      @modalConfirm="mingDaoConfirm"
      @closeConfirm="mingDaoClose"
    />
    <!-- 同步到YMS弹窗 -->
    <syncInfoYmsModal
      :modal-visible.sync="syncYmsVisibleModal"
      system="product"
      :modal-data="{
        productCategory: selectTreeProductCategory,
        data: checkTableRow
      }"
    />
    <!-- 查看YMS停售调整记录弹窗 -->
    <haltSalesAdjustModal :module-visible.sync="haltSalesAdjustVisible" :module-data="{permission: permission}" />
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import productMixin from '@/components/mixin/product_mixin';
import tableMixin from '@/components/mixin/table_mixin';
import addProduct from './addProduct';
import editProduct from './editProduct';
import productGoodsDetailModal from './productGoodsDetailModal';
import exportTaskModal from './exportTaskModal';
import delConfirmModal from './delConfirmModal';
import batchQualityEdit from './batchQualityEdit';
import exportDataModal from './exportDataModal';
import editCheckType from './editCheckType';
import recoverSkuModal from './recoverSkuModal';
import thirdpartyTagManage from './thirdpartyTagManage_old';
import print from '@/components/common/print';
import publicService from '@/components/mixin/publicService_mixin';
import importModal from '@/components/common/importModal';
import confirmModal from '@/components/common/confirmModal.vue';
import editPurchaseInfo from './editPurchaseInfo.vue'
import uploadSampleFile from './uploadSampleFile';
import substituteSkuModal from './substituteSkuModal';
import syncInfoYmsModal from './syncInfoYmsModal.vue';
import skuWaitToDone from './skuWaitToDone';
import haltSalesAdjustModal from '@/views/productCenter/components/productCenter/haltSalesAdjustModal';
import goodsHistoryStatusModal from '@/views/productCenter/components/productCenter/goodsHistoryStatusModal';
// import { getToken } from '@/utils/cookie';
import productData from '@/views/productCenter/components/productCenter/staticData/productData';

export default {
  mixins: [Mixin, tableMixin, productMixin, publicService],
  components: {
    addProduct,
    editProduct,
    productGoodsDetailModal,
    exportTaskModal,
    delConfirmModal,
    print,
    thirdpartyTagManage,
    importModal,
    batchQualityEdit,
    exportDataModal,
    editCheckType,
    recoverSkuModal,
    uploadSampleFile,
    confirmModal,
    substituteSkuModal,
    skuWaitToDone,
    syncInfoYmsModal,
    editPurchaseInfo,
    goodsHistoryStatusModal,
    haltSalesAdjustModal
  },
  data() {
    var self = this;
    return {
      importFile: {
        title: '产品导入',
        type: 'yms',
        uploadUrl: api.productImport_ymsImport, // 上传文件接口--云卖产品
      },
      customTagList: [],
      visibleExportData: false,
      haltSalesAdjustVisible: false, // 查看YMS停售调整记录弹窗
      batchUpdateLoading: false,
      checkTableRow: {},
      qualityTemplateList: [],
      visibleRecoverSku: false,
      confirmVisibleModal: false,
      syncYmsVisibleModal: false,
      mingDaoLoading: false,
      confirmData: {},
      // 点击行按钮选中的行数据
      selectTableRow: {},
      // 替代SKU弹窗显示与否
      substituteVisibleModal: false,
      exportDataParams: {},
      oldAcceptableType: [],
      syncDataLoading: false, // 是否同步数据中
      uploadParams: {},
      spuQuality: {
        spu: false,
        sku: false
      },
      openEditCheckType: false,
      moduleEditCheckTypeData: {
        row: []
      },
      oldProductCategoryId: null,
      refreshTable: false,
      pdfFirstImgPreview: '',
      isWashedUploadLoading: false,
      uploadFilesUrl: api.upload_files + '?basePath=/product', // 上传url
      qualityClassificationId: null,
      qualityEditVisual: false,
      qualityEditData: [],
      tableHeight: 600,
      batProductCategoryTree: [],
      copyProductCategoryTree: [],
      productTypeValidation: false,
      productStatus: productData.productStatus,
      productStatusSpu: productData.productStatusSpu,
      statusTipsSku: productData.statusTipsSku,
      statusTipsSpu: productData.statusTipsSpu,
      selectTreeProductCategory: [],
      selectTreeProductData: {},
      treeSelectCategoryValue: [],
      copyTreeSelectCategoryValue: [],
      attributeList: [], // 商品属性
      productShow: 'list',
      assembleUploadData: {
        updateIgnore: '0'
      },
      awaitSearchCode: '',
      oldSearchCode: '',
      personnelRoleTypeList: [],
      allUserData: this.$store.state.userInfoList,
      stepModel: 0,
      menuList: [],
      menuFilterList: [],
      originalCategoryData: [],
      importModal: false,
      import_url: api.assembleImport_import,
      upType: 'add',
      addition: '1',
      file1: null,
      file2: null,
      file3: null,
      createdTimeProduct: [],
      printData: [],
      editStatus: 'look',
      printName: ['skuBarCode', 'sku', 'cnName'],
      printColumns: [
        {
          title: 'SKU',
          key: 'sku',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('div', [h('div', params.row.sku)]);
          }
        },
        {
          title: '名称',
          key: 'cnName',
          align: 'center',
          minWidth: 120
        },
        {
          title: '打印数量',
          key: 'num',
          align: 'center',
          minWidth: 100,
          render: (h, params) => {
            return h('Input', {
              props: {
                value: this.printData[params.index].num,
                size: 'small'
              },
              on: {
                input: (val) => {
                  this.printData[params.index].num = val;
                }
              }
            });
          }
        }
      ],
      modal1: false,
      goodsHistoryStatusVisible: false,
      pageTableRowModalData: {},
      spinShow: false,
      logPageArray: [10, 20, 50, 100],
      logTotal: 0,
      uploadFiles: api.productImport_inport, // 上传文件
      uploadFiles1: api.productImport_tagImport, // 上传文件
      uploadFiles2: api.productImport_tagDeleteImport, // 上传文件
      filenodeViewTargetUrl: self.$store.state.erpConfig.filenodeViewTargetUrl, // filenode根路径
      editProductGoods: null, // 编辑时中间变量
      productGoodsDetailModal: false, // 是否显示货品详情模态窗
      renderProductGoodsDetailModal: false, // 是否渲染货品详情模态窗
      renderSpuDetailModal: false, // 是否渲染spu详情模态框
      editProductModal: false, // 是否显示spu详情模态框
      confirmUpload: false, // 是否确认上传文件
      taskModal: false, // 导入任务模态框
      renderTaskModal: false, // 是否渲染任务模态框
      productId: null, // 编辑商品时使用
      moreFilter: false, // 是否高级筛选
      moreFilterIcon: 'md-arrow-dropdown',
      total: 0, // 总记录数
      productBrandList: [], // 商品品牌列表
      productCategoryList: [], // 商品分类列表
      productCategoryTree: [
        // 商品分类树
        {
          title: '全部',
          productCategoryId: 'productCategoryId',
          expand: true,
          children: []
        }
      ],
      ymsProductCategoryTree: [
        // 商品分类树
        {
          title: '全部',
          expand: true,
          children: []
        }
      ],
      updateCategoryTree: [
        // 商品分类树
        {
          title: '全部',
          expand: true,
          disabled: true,
          children: []
        }
      ],
      selectedProductGoodsListSku: [], // 已选货品列表SKU
      selectedProductGoodsListSpu: [], // 已选货品列表SPU
      productDetail: {}, // 详情页面数据
      pageParamsStatus: false, // 是否重新加载货品列表数据
      productGoodsListDictionarySpu: {
        // 商品列表转字典需要的数据
        productCategoryMap: null,
        goodsImageMap: null
      },
      productGoodsListDictionarySku: {
        // 商品列表转字典需要的数据
        productCategoryMap: null,
        goodsImageMap: null
      },
      productDetailId: null, // spu详情页所需id
      addSku: false, // 导入sku 模态框显示隐藏
      addTagSku: false, // 导入sku 模态框显示隐藏
      file: null,
      uploadData: {
        updateIgnore: '0',
        ymsProductCategoryId: null
      },
      addSkuModalLoading: true,
      copyProductModalLoading: false,
      pageParamsPrototype: null, // 当前货品信息原型(重置用到)
      cnNameList: [],
      enNameList: [],
      // expireOptions: {
      //   disabledDate: (date) => {
      //     // console.log(this.$common.toLocaleDate(date, 'fulltime', 0), document.querySelectorAll('.ivu-date-picker-cells-cell-selected'));
      //   }
      // },
      pageParams: {
        // 新页面标识
        flag: 1,
        // 待办事项名称
        backlogName: '',
        // 到期时间段
        expireTime: [],
        // 创建人
        createdByList: [],
        // 货品列表筛选参数
        name: '', // 商品名称
        statusList: [],
        spuStatusList: [],
        skuStatusList: [],
        searchValue: null,
        codeType: 2,
        code: null,
        cnName: null,
        enName: null,
        productBrandIds: [],
        tagNames: [],
        productCategoryList: [],
        orderBy: 'createdTime',
        upDown: 'down',
        pageSize: 50,
        pageNum: 1,
        key: '',
        qualityTemplateId: '',
        productDeveloperUserId: '', // 产品开发人员
        attributeValueIds: [],
        businessDeptIds: [],
        hsName: '',
        hsCode: '',
        startCreatedTime: '',
        endCreatedTime: '',
        hasReplace: null, // 是否有替代SKU
        ymsProductCategoryId: null,
        cargoOwnerType: null,
        cargoOwnerId: null
      },
      logParams: {
        pageSize: 10,
        pageNum: 1,
        productGoodsId: '',
        productId: ''
      },
      searchCode: null,
      allPageStatus: false,
      buttonGroupModel: [
      ],
      prindThirdpartyModal: false, // 是否显示 管理第三方标签 弹窗
      thirdpartyModalViewType: 'operate',
      thirdpartyModalData: {}, // 操作第三方标签时弹窗内容
      productGoodsDataSpu: [], // 货品数据
      productGoodsDataSku: [], // spu 视图
      productGoodsColumnSpu: [
        // 货品列定义
        {
          type: 'selection',
          width: 60,
          key: 'selection',
          align: 'center',
          fixed: 'left'
        },
        {
          title: 'SPU',
          key: 'spu',
          minWidth: 120,
          align: 'center',
          render: (h, params) => {
            if (params.row.type === 2) {
              // 变参
              return h(
                'span',
                {
                  style: {
                    color: '#0054A6',
                    cursor: 'pointer'
                  },
                  props: {
                    vIf: self.permission.detail
                  },
                  on: {
                    click: () => {
                      self.editStatus = 'look';
                      self.editSpu(params.row.productId, 2);
                    }
                  }
                },
                params.row.spu
              );
            } else if (params.row.type === 1) {
              // 普通
              return h(
                'span',
                {
                  style: {
                    color: '#0054A6',
                    cursor: 'pointer'
                  },
                  props: {
                    vIf: self.permission.detail
                  },
                  on: {
                    click: () => {
                      self.editStatus = 'look';
                      self.editSpu(params.row.productId, 2);
                    }
                  }
                },
                params.row.spu
              );
            }
          }
        },
        {
          title: '商品图片',
          key: 'productPic',
          align: 'center',
          minWidth: 70,
          render: (h, params) => {
            let productPic = null;
            let goodsImageMap = self.productGoodsListDictionarySpu.goodsImageMap;
            if (goodsImageMap && goodsImageMap[params.row.productGoodsId]) {
              productPic = goodsImageMap[params.row.productGoodsId][0];
            }
            return this.tableImg(h, params, 'null', productPic);
          }
        },
        {
          title: '商品中文名称',
          key: 'cnName',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h('div', params.row.cnName);
          }
        },
        {
          title: '商品成本',
          key: 'suggestPriceList',
          align: 'center',
          minWidth: 120,
          render: (h, { row }) => {
            let priceList = row.suggestPriceList || [];
            let suggest = '';
            let price = [];
            if (!this.$common.isEmpty(priceList)) {
              const height = Math.max.apply(null, priceList);
              const low = Math.min.apply(null, priceList);
              suggest = height != low ? `${low} ~ ${height}` : low;
            } else {
              suggest = '';
            }
            const costPriceList = row.costPriceList.filter(item => {
              return item != 0;
            })
            if (!this.$common.isEmpty(costPriceList)) {
              const height = Math.max.apply(null, costPriceList);
              const low = Math.min.apply(null, costPriceList);
              price.push(h('div', {}, [
                h('span', {}, '成本价：'),
                h('span', {}, height != low ? `${low} ~ ${height}` : low)
              ]));
            }
            price.push(h('div', {}, [
              h('span', {}, '采购价：'),
              h('span', {}, suggest)
            ]));
            const distributionPriceList = row.distributionPriceList.filter(item => {
              return item != 0;
            })
            if (!this.$common.isEmpty(distributionPriceList)) {
              const height = Math.max.apply(null, distributionPriceList);
              const low = Math.min.apply(null, distributionPriceList);
              price.push(h('div', {}, [
                h('span', {}, '分销价：'),
                h('span', {}, height != low ? `${low} ~ ${height}` : low)
              ]))
            }
            return h('div', price);
          }
        },
        {
          title: '所属分类',
          key: 'productCategoryId',
          minWidth: 120,
          align: 'center',
          render: (h, params) => {
            let productCategoryMap =
              self.productGoodsListDictionarySpu.productCategoryMap;
            if (
              productCategoryMap &&
              productCategoryMap[params.row.productCategoryId]
            ) {
              params.row.productCategoryNavigation =
                productCategoryMap[params.row.productCategoryId].productCategoryNavigation;
              return h('span', params.row.productCategoryNavigation);
            }
          }
        },
        {
          title: '商品状态',
          key: 'spuStatus',
          minWidth: 80,
          align: 'center',
          render: (h, params) => {
            let text = '';
            this.productStatusSpu.forEach(item => {
              if (item.value == params.row.spuStatus) {
                text = h('span', item.label)
              }
            })
            return text;
          }
        },
        {
          title: '开发员', // 商品开发员
          key: 'productDeveloperUserId',
          minWidth: 120,
          align: 'center',
          render: (h, params) => {
            let userInfoMap = self.$store.state.userInfoList;
            if (userInfoMap && userInfoMap[params.row.productDeveloperUserId]) {
              return h(
                'span',
                userInfoMap[params.row.productDeveloperUserId].userName
              );
            }
          }
        },
        {
          title: '创建信息',
          key: 'createdBy',
          minWidth: 130,
          align: 'center',
          sortable: 'custom',
          events: {},
          render: (h, params) => {
            let userInfoMap = self.productCommonDictionary.userInfoMap || {};
            const time = this.getDataToLocalTime(params.row.createdTime, 'fulltime');
            if (userInfoMap && userInfoMap[params.row.createdBy]) {
              return h('div', [
                h('div', userInfoMap[params.row.createdBy].userName),
                h('div', time)
              ]);
            }
            return h('div', [
              h('div', ''),
              h('div', time)
            ]);
          }
        },
        {
          title: '特性标签',
          key: 'tagName',
          align: 'center',
          minWidth: 200,
          render: (h, params) => {
            // <Icon type="pricetag"></Icon>
            let list = params.row.productGoodsTagList
              ? params.row.productGoodsTagList
              : [];
            return h(
              'div',
              {},
              list.map((i) => {
                return h('p', {}, [
                  h('Icon', {
                    props: {
                      type: 'ios-pricetag',
                      color: '#f00',
                      size: '16'
                    }
                  }),
                  h('span', i.tagName)
                ]);
              })
            );
          }
        },
        {
          title: '操作',
          width: 120,
          key: 'operate',
          fixed: 'right',
          align: 'center',
          render: (h, params) => {
            const handOper = h('local-down-button', {
              props: {
                data: {
                  btn: {
                    text: '查看', // 标记为付款
                    clickFn: () => {
                      self.editStatus = 'look';
                      self.editSpu(params.row.productId, 2);
                    }
                  },
                  list: [
                    {
                      text: '编辑',
                      value: 1,
                      hide: !self.permission.update,
                      clickFn: () => {
                        let toEdit = () => {
                          self.editStatus = 'edit';
                          if (params.row.type === 1) {
                            self.editSpu(params.row.productId, 1);
                          } else {
                            self.editSpu(params.row.productId, 2);
                          }
                        }
                        if (self.isCommodityDeveloper && !self.isProductDeveloperSupervisor) { // 当前账号角色为产品开发员
                          if (self.currentUserInfo.userId !== params.row.productDeveloperUserId) {
                            self.$Message.error('您没有权限操作他人的产品');
                          } else {
                            toEdit();
                          }
                        } else if (self.isProductDeveloperSupervisor) {
                          toEdit();
                        } else {
                          self.$Message.error('您没有操作权限');
                        }
                      }
                    },
                    {
                      text: '操作日志', // 操作日志
                      value: 2,
                      hide: !self.permission.logQuery,
                      clickFn: () => {
                        self.logParams.productId = params.row.productId;
                        self.modal1 = true;
                      }
                    },
                    {
                      text: '打印标签', // 打印标签
                      value: 3,
                      hide: !self.permission.printLable,
                      clickFn: () => {
                        self.printData = [params.row];
                        self.$refs.print.printModal = true;
                      }
                    },
                    {
                      text: '管理第三方标签',
                      value: 'thirdpartyTagManage',
                      hide: !self.permission.thirdPartyLabel,
                      clickFn: () => {
                        this.thirdpartyModalData = { ...params.row, openTrigger: 'spu' };
                        this.thirdpartyModalViewType = 'operate';
                        this.$nextTick(() => {
                          this.prindThirdpartyModal = true;
                        })
                      }
                    },
                    {
                      text: '下架SPU', // 下架SPU
                      value: 4,
                      hide: params.row.shelveStatus !== 1,
                      clickFn: () => {
                        self.shelfBtn(params.row.productId);
                      }
                    },
                    {
                      text: '删除', // 删除
                      value: 5,
                      hide: (params.row.auditStatus !== 0), // 只有草稿状态的商品可以删除
                      clickFn: () => {
                        self.deleteControl(2, params.row.productGoodsId);
                      }
                    },
                    {
                      text: '同步商品至YMS',
                      value: 'syncInfoToYms',
                      hide: !self.permission.syncYms,
                      clickFn: () => {
                        this.batchSyncInfoYms([params.row]);
                      }
                    },
                  ]
                }
              }
            });
            return handOper;
          }
        }
      ],
      // sku 视图
      productGoodsColumnSku: [
        // 货品列定义
        {
          type: 'selection',
          key: 'selection',
          width: 60,
          fixed: 'left',
          align: 'center'
        },
        {
          title: 'SPU',
          key: 'spu',
          minWidth: 120,
          align: 'center',
          render: (h, params) => {
            if (params.row.type === 2) {
              // 变参
              return h(
                'span',
                {
                  style: {
                    color: '#0054A6',
                    cursor: 'pointer'
                  },
                  props: {
                    vIf: self.permission.detail
                  },
                  on: {
                    click: () => {
                      self.editStatus = 'look';
                      self.editSpu(params.row.productId, 2);
                    }
                  }
                },
                params.row.spu
              );
            } else if (params.row.type === 1) {
              // 普通
              return h(
                'span',
                {
                  style: {
                    color: '#0054A6',
                    cursor: 'pointer'
                  },
                  props: {
                    vIf: self.permission.detail
                  },
                  on: {
                    click: () => {
                      self.editStatus = 'look';
                      self.editSpu(params.row.productId, 2);
                    }
                  }
                },
                params.row.spu
              );
            }
          }
        },
        {
          title: 'SKC',
          key: 'skc',
          minWidth: 120,
          align: 'center',
          render: (h, params) => {
            if (params.row.type === 1) {
              // 普通
              return h(
                'span',
                {
                  style: {
                    color: '#0054A6',
                    cursor: 'pointer'
                  },
                  props: {
                    vIf: self.permission.detail
                  },
                  on: {
                    click: () => {
                      self.editStatus = 'look';
                      self.editSpu(params.row.productId, 2);
                    }
                  }
                },
                params.row.skc
              );
            }
            // 变参
            return h(
              'span',
              {
                style: {
                  color: '#0054A6',
                  cursor: 'pointer'
                },
                props: {
                  vIf: self.permission.detail
                },
                on: {
                  click: () => {
                    self.editStatus = 'look';
                    self.editSpu(params.row.productId, 2);
                  }
                }
              },
              params.row.skc
            );
          }
        },
        {
          title: '商品图片',
          key: 'productPic',
          align: 'center',
          minWidth: 125,
          render: (h, params) => {
            let productPic = null;
            let goodsImageMap = self.productGoodsListDictionarySku.goodsImageMap;
            if (goodsImageMap && goodsImageMap[params.row.productGoodsId]) {
              productPic = goodsImageMap[params.row.productGoodsId][0];
            }
            return this.tableImg(h, params, 'null', productPic);
          }
        },
        {
          title: 'SKU',
          key: 'sku',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            return h(
              'span',
              {
                style: {
                  color: '#0054A6',
                  cursor: 'pointer'
                },
                props: {
                  vIf: self.permission.detail
                },
                on: {
                  click: () => {
                    self.editStatus = 'look';
                    self.editSpu(params.row.productId, 2);
                  }
                }
              },
              params.row.sku
            );
          }
        },
        {
          title: '采购信息',
          key: 'purchaseInfo',
          minWidth: 140,
          align: 'center',
          render: (h, { row }) => {
            let item = [];
            if (!this.$common.isEmpty(row.costPrice) && row.costPrice != 0) {
              item.push(h('div', [
                h('span', { style: { marginLeft: '12px' } }, '成本价：'),
                h('span', row.costPrice)
              ]));
            }
            item.push(h('div', [
              h('span', { style: { marginLeft: '12px' } }, '采购价：'),
              h('span', row.suggestPrice)
            ]));
            if (!this.$common.isEmpty(row.distributionPrice) && row.distributionPrice != 0) {
              item.push(h('div', [
                h('span', { style: { marginLeft: '12px' } }, '分销价：'),
                h('span', row.distributionPrice)
              ]));
            }
            item.push(h('div', { style: { width: '100%' } }, [
              h('span', {}, '商品重量：'),
              h('span', row.weight)
            ]));
            item.push(h('div', {
              class: 'productGoods_skuTextOver',
              attrs: {
                title: row.purchaserName
              }
            }, [
              h('span', { style: { marginLeft: '12px' } }, '采购员：'),
              h('span', row.purchaserName || '')
            ]));
            return h('div', { style: { textAlign: 'left', paddingLeft: '5px' } }, item);
          }
        },
        {
          title: '商品中文名称',
          key: 'cnName',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            let pos = '';
            if (params.row.productGoodsSpecifications) {
              params.row.productGoodsSpecifications.forEach((n, i) => {
                if (i !== params.row.productGoodsSpecifications.length - 1) {
                  pos += n.value + '·';
                } else {
                  pos += n.value;
                }
              });
              return h('div', [
                h('div', params.row.cnName),
                h(
                  'div',
                  {
                    style: {
                      color: '#349EFA'
                    }
                  },
                  pos
                )
              ]);
            } else {
              return h('div', params.row.cnName);
            }
          }
        },
        {
          title: '尺寸(cm)',
          key: 'length',
          minWidth: 120,
          align: 'center',
          render: (h, params) => {
            return h('div', { style: { textAlign: 'left', paddingLeft: '24px' } }, [
              h('div', { style: { margin: '5px' } }, '长：' + params.row.length),
              h('div', { style: { margin: '5px' } }, '宽：' + params.row.width),
              h('div', { style: { margin: '5px' } }, '高：' + params.row.height)
            ])
          }
        },
        {
          title: '所属分类',
          key: 'productCategoryId',
          minWidth: 120,
          align: 'center',
          render: (h, params) => {
            let productCategoryMap =
              self.productGoodsListDictionarySku.productCategoryMap;
            if (
              productCategoryMap &&
              productCategoryMap[params.row.productCategoryId]
            ) {
              params.row.productCategoryNavigation =
                productCategoryMap[params.row.productCategoryId].productCategoryNavigation;
              return h('span', params.row.productCategoryNavigation);
            }
          }
        },
        {
          title: '商品状态',
          key: 'status',
          minWidth: 120,
          align: 'center',
          render: (h, params) => {
            let text = '';
            this.productStatus.forEach(item => {
              if (item.value == params.row.status) {
                text = h('span', item.label)
              }
            })
            return text;
          }
        },
        {
          title: '创建信息',
          key: 'createInfo',
          minWidth: 220,
          align: 'center',
          render: (h, params) => {
            let productDeveloperUser = self.$store.state.userInfoList; // 商品开发员
            let creator = self.productCommonDictionary.userInfoMap || {}; // 创建人
            return h('div', { style: { textAlign: 'left' } }, [
              h('div', {
                class: 'productGoods_skuTextOver',
                attrs: {
                  title: productDeveloperUser[params.row.productDeveloperUserId] ? productDeveloperUser[params.row.productDeveloperUserId].userName : ''
                }
              }, [
                h('span', {}, '商品开发员：'),
                h('span', {}, productDeveloperUser[params.row.productDeveloperUserId] ? productDeveloperUser[params.row.productDeveloperUserId].userName : '')
              ]),
              h('div', {
                class: 'productGoods_skuTextOver',
                attrs: {
                  title: creator[params.row.createdBy] ? creator[params.row.createdBy].userName : ''
                }
              }, [
                h('span', { style: { marginLeft: '24px' } }, '创建人：'),
                h('span', {}, creator[params.row.createdBy] ? creator[params.row.createdBy].userName : '')
              ]),
              h('div', {}, [
                h('span', { style: { marginLeft: '12px' } }, '创建时间：'),
                h('span', {}, this.getDataToLocalTime(params.row.createdTime, 'fulltime'))
              ])
            ])
          }
        },
        {
          title: '特性标签',
          key: 'tagName',
          align: 'center',
          minWidth: 200,
          render: (h, params) => {
            // <Icon type="pricetag"></Icon>
            let list = params.row.productGoodsTagList
              ? params.row.productGoodsTagList
              : [];
            return h(
              'div',
              {},
              list.map((i) => {
                return h('p', {}, [
                  h('Icon', {
                    props: {
                      type: 'ios-pricetag',
                      color: '#f00',
                      size: '16'
                    }
                  }),
                  h('span', i.tagName)
                ]);
              })
            );
          }
        },
        {
          title: '替代SKU',
          key: 'createInfo',
          minWidth: 220,
          align: 'center',
          render: (h, { row }) => {
            if (this.$common.isEmpty(row.replaceGoodsId) || this.$common.isEmpty(row.replaceRelVO)) return h('div', {}, '');
            if (this.$common.isEmpty(row.replaceRelVO.productSku) || this.$common.isEmpty(row.replaceRelVO.replaceSku)) return h('div', {}, '');
            let rendrItem = [h('div', {
              class: 'replace-sku-box',
            }, [
              h('div', {
                class: 'replace-sku-row',
              }, [
                h('span', {
                  class: 'replace-sku-label',
                }, '替代SKU：'),
                h('span', {
                  class: 'replace-sku-txt',
                }, row.replaceRelVO.replaceSku)
              ]),
              h('div', {
                class: 'replace-sku-row',
              }, [
                h('span', {
                  class: 'replace-sku-label',
                }, '被替代SKU：'),
                h('div', {
                  class: 'replace-sku-txt',
                }, row.replaceRelVO.productSku.map(sItem => {
                  return h('div', {}, sItem)
                }))
              ])
            ])];

            if (this.permission.replaceSku) {
              rendrItem.push(h('div', {
                class: 'replace-sku-btn',
                on: {
                  click: () => {
                    this.openSubstituteModal(row);
                  }
                }
              }, '设置'));
            }
            return h('div', { class: 'replace-sku-col' }, rendrItem);
          }
        },
        {
          title: '操作',
          key: 'operate',
          width: 150,
          fixed: 'right',
          align: 'center',
          render: (h, params) => {
            const handOper = h('local-down-button', {
              props: {
                data: {
                  btn: {
                    text: '查看', // 标记为付款
                    clickFn: () => {
                      self.editStatus = 'look';
                      self.editSpu(params.row.productId, 2);
                    }
                  },
                  list: [
                    {
                      text: '编辑',
                      value: 1,
                      hide: !self.permission.update,
                      clickFn: () => {
                        let toEdit = () => {
                          self.editStatus = 'edit';
                          if (params.row.type === 1) {
                            self.editSpu(params.row.productId, 1);
                          } else {
                            self.editSpu(params.row.productId, 2);
                          }
                        }
                        if (self.isCommodityDeveloper && !self.isProductDeveloperSupervisor) { // 当前账号角色为产品开发员
                          if (self.currentUserInfo.userId !== params.row.productDeveloperUserId) {
                            self.$Message.error('您没有权限操作他人的产品');
                          } else {
                            toEdit();
                          }
                        } else if (self.isProductDeveloperSupervisor) {
                          toEdit();
                        } else {
                          self.$Message.error('您没有操作权限');
                        }
                      }
                    },
                    {
                      text: '操作日志', // 操作日志
                      value: 2,
                      hide: !self.permission.logQuery,
                      clickFn: () => {
                        self.logParams.productGoodsId = params.row.productGoodsId;
                        self.modal1 = true;
                      }
                    },
                    {
                      text: '历史商品状态',
                      value: 'openHistoryStatus',
                      hide: !self.permission.statusHistory,
                      clickFn: () => {
                        self.pageTableRowModalData = params.row;
                        self.goodsHistoryStatusVisible = true;
                      }
                    },
                    {
                      text: '打印标签', // 打印标签
                      value: 3,
                      hide: !self.permission.printLable,
                      clickFn: () => {
                        self.printData = [params.row];
                        self.$refs.print.printModal = true;
                      }
                    },
                    {
                      text: '打印第三方标签',
                      value: 'prindThirdparty',
                      hide: !self.permission.thirdpartyTagPprint,
                      clickFn: () => {
                        this.thirdpartyModalData = { ...params.row, openTrigger: 'sku' };
                        this.thirdpartyModalViewType = 'print';
                        this.$nextTick(() => {
                          this.prindThirdpartyModal = true;
                        })
                      }
                    },
                    {
                      text: '管理第三方标签',
                      value: 'thirdpartyTagManage',
                      hide: !self.permission.thirdPartyLabel,
                      clickFn: () => {
                        this.thirdpartyModalData = { ...params.row, openTrigger: 'sku' };
                        this.thirdpartyModalViewType = 'operate';
                        this.$nextTick(() => {
                          this.prindThirdpartyModal = true;
                        })
                      }
                    },
                    {
                      text: '下架SPU', // 下架SPU
                      value: 5,
                      hide: params.row.shelveStatus !== 1,
                      clickFn: () => {
                        self.shelfBtn(params.row.productId);
                      }
                    },
                    {
                      text: '删除', // 删除
                      value: 4,
                      hide:
                        (params.row.auditStatus !== 0), // 只有草稿状态的商品可以删除
                      clickFn: () => {
                        self.deleteControl(2, params.row.productGoodsId);
                      }
                    }
                  ]
                }
              }
            });
            return handOper;
          }
        }
      ],

      updateModal: false,
      updateModalStatus: false,
      updateLoading: true,
      updateParamsPrototype: null, // 重置数据用到
      updateFlag: false, // 批量修改 true,所有结果集  false,选择数据.
      visibleCopyProduct: false, // 产品复制弹窗判断
      copyProductTableData: [],
      copyProductColumns: [
        {
          type: "index",
          title: '序号',
          width: 50,
          align: "center"
        },
        {
          title: '复制至分类',
          key: 'productCategoryNavigation',
        },
        {
          title: '操作',
          width: 150,
          align: "center",
          render: (h, params) => {
            return [
              h('a', {
                props: {},
                style: {
                  color: params.row.isClicked ? '#771caa' : ''
                },
                on: {
                  click: () => {
                    params.row.isClicked = true
                    this.$set(this.copyProductTableData[params.index], 'isClicked', true)
                    // 这里传tableData的是因为table组件会有个数据缓冲原因导致更新的tableData无法params无法拿到
                    this.openEditPurchaseInfo(this.copyProductTableData[params.index])
                  }
                }
              }, '编辑采购信息'),
              h('a', {
                props: {},
                style: {
                  marginLeft: '5px',
                },
                on: {
                  click: () => {
                    this.deleteCopyProduct(params.row.productCategoryId)
                  }
                }
              }, '删除')]
          }
        }
      ],
      copyProductData: {
        productSpu: '',
        productId: '',
        productCategoryIdList: [],
        copyProductGoodsQOList: []
      },
      washedLabelWordFile: {},
      updateParams: {
        cnNameSelected: false,
        updateCnName: null,
        enNameSelected: false,
        updateEnName: null,
        washedLabel: null,
        isChangeWashedLabel: false,
        isChangeOuterPackageRequirement: false,
        outerPackageRequirement: '', // spu 生产要求
        isChangeProductionRequirement: false,
        productionRequirement: '', // sku 生产要求
        upcSelected: false,
        updateUpc: null,
        eanSelected: false,
        updateEan: null,
        isbnSelected: false,
        updateIsbn: null,
        distributionPriceSelected: false,
        distributionPriceType: '',
        distributionPriceValue: '',
        productCategoryIdSelected: false,
        ymsProductCategoryIdSelected: false,
        updateProductCategoryId: null,
        updateYmsProductCategoryId: null,
        productBrandIdSelected: false,
        updateProductBrandId: null,
        productGoodsTagsSelected: false,
        updateProductGoodsTags: [],
        suggestPriceSelected: false,
        updateSuggestPrice: null,
        statusSelected: false,
        updateStatus: 1,
        cnHsNameSelected: false,
        updateCnHsName: null,
        enHsNameSelected: false,
        updateEnHsName: null,
        hsCodeSelected: false,
        updateHsCode: null,
        acceptableTypeSelected: false,
        acceptableType: ['01'],
        productDeveloperUserIdSelected: false,
        updateDroductDeveloperUserId: null,
        weightSelected: false,
        weight: 0,
        sizeSelected: false,
        length: 0,
        width: 0,
        height: 0,
        cargoOwnerType: null,
        cargoOwnerId: null,
        cnNameSelectedId: null,
        productGoodsTagsSelectedId: null,
        washedLabelPdfPath: '',
        washedLabelPdfName: '',
        isChangeWashedLabelPdf: false,
        isChangeWashedLabelWord: false,
        washedLabelWordPath: '',
        washedLabelWordName: '',
      },
      columns1: [
        {
          title: '日志内容', // 日志内容
          key: 'operateContent'
        },
        {
          title: '操作日期', // 操作日期
          key: 'updatedTime',
          width: 150,
          render: (h, params) => {
            return h(
              'div',
              this.getDataToLocalTime(params.row.updatedTime, 'fulltime')
            );
          }
        },
        {
          title: '操作人', // 操作人
          width: 150,
          key: 'updatedBy',
          render: (h, params) => {
            return h('span', self.getUserName(params.row.updatedBy));
          }
        }
      ],
      data1: [],
      urlParams: true,
      classifyValue: [],
      //  1已上架 2已下架 3待审核 4审核驳回 5已审核
      statusList: [
        {
          value: '1',
          name: '已上架'
        },
        {
          value: '2',
          name: '已下架'
        },
        {
          value: '3',
          name: '待审核'
        },
        {
          value: '4',
          name: '审核驳回'
        },
        {
          value: '5',
          name: '待提交'
        }
      ],
      trackingTab: '1',
      tabType: 'spu',
      totalSpu: 0,
      totalSku: 0,
      pageSizeSpu: 50,
      pageSizeSku: 50,
      pageNumSpu: 1,
      pageNumSku: 1,
      select1: '',
      select2: '',
      cnNameSelectedIdList: [
        {
          value: 1,
          label: '修改名称'
        },
        {
          value: 2,
          label: '添加前缀'
        },
        {
          value: 4,
          label: '删除前缀'
        },
        {
          value: 3,
          label: '添加后缀'
        },
        {
          value: 5,
          label: '删除后缀'
        }
      ],
      productGoodsTagsSelectedIdList: [
        {
          value: 1,
          label: '新增标签'
        },
        {
          value: 2,
          label: '删除标签'
        }
      ],
      tableLoadingSpu: false,
      tableLoadingSku: false,
      currentUserInfo: {},
      isCommodityDeveloper: false,
      isProductDeveloperSupervisor: false,
      ymsModal: false,
      ymsModalLoading: false,
      curPurchaseInfo: {},
      editPurchaseInfoModal: false,
      productPriceInfoList: [],
      copyProductGoodsQOList: []
    };
  },
  computed: {
    headObj() {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    },
    businessDeptId() {
      if (!this.$store.getters['authUserInfo'] || !this.$store.getters['authUserInfo'].securityUser) return '';
      return this.$store.getters['authUserInfo'].securityUser.businessDeptId;
    },
    businessDeptIds () {
      if (!this.$store.getters['authUserInfo'] || !this.$store.getters['authUserInfo'].securityUser) return '';
      // console.log(this.$store.getters['authUserInfo'].securityUser.businessDeptIds);
      return this.$store.getters['authUserInfo'].securityUser.businessDeptIds;
    },
    // 获取所有事业部
    allBusinessDept() {
      return this.$store.getters.getBusinessDeptList || [];
    },
    wrapClass() {
      return {
        width:
          ((this.domWidth / 24) * (24 - this.$store.state.spanLeft) * 100) /
          this.domWidth +
          '%'
      };
    },
    permission() {
      return {
        thirdpartyTagPprint: this.getPermission('productGoodsOperationThirdpartyTag_print'),
        thirdpartyTagManage: this.getPermission('productGoodsOperationThirdpartyTag_manage'),
        query: this.getPermission('productGoods_query'), // 列表数据查询权限
        excelExport: this.getPermission('productInfo_excelExport'), // 导出
        synchronous: this.getPermission('productInfo_synListing'), // 同步Listing权限
        update: this.getPermission('productInfo_update'), // 编辑商品详情权限
        detail: this.getPermission('productInfo_detail'), // 查看商品详情权限
        batchUpdate: this.getPermission('productQualityProjectInfo_batchUpdate'), // 批量编辑质检模板
        batchUpdateCheckType: this.getPermission('productQualityProjectInfo_batchUpdateCheckType'), // 批量编辑质检类型比例
        assembleImport: this.getPermission('productGoods_assembleImport'), // 组装信息导入
        excelImportCloud: this.getPermission('productInfo_excelImportCloudSell'), // 云卖网产品导入
        specialImport: this.getPermission('productInfo_importSpecialDistributionProduct'), // 特殊分销产品导入
        batchDelete: this.getPermission('productGoods_batchDelete'), // 批量删除
        batchGoodsUpdate: this.getPermission('productGoods_batchUpdate'), // 批量修改
        thirdPartyLabel: this.getPermission('productGoods_thirdPartyLabel'), // 管理第三方标签权限
        printLable: this.getPermission('productInfo_printLable'), // 打印标签
        logQuery: this.getPermission('productGoodsOperationLog_query'), // 查看操作日志
        statusHistory: this.getPermission('productInfo_statusHistory'), // 查看历史商品状态
        restoreSpuSku: this.getPermission('productGoods_restoreSpuSku'), // 恢复已删除的SKU
        copyProduct: this.getPermission('productGoods_copyProduct'), // 产品复制
        replaceSku: this.getPermission('productGoods_setReplaceSku'), // 替代SKU
        syncMingDao: this.getPermission('productInfo_synMingDao'), // 同步到明道云权限
        syncYms: this.getPermission('productGoods_syncYms'), // 同步到 YMS 权限
        importReplaceSku: this.getPermission('productGoods_importReplaceSku'), // 替代SKU
        salesImport: this.getPermission('productGoods_importPlatformUrl'), // 销售链接导入
        ymsHaltSales: this.getPermission('haltTheSales_query'), // 查看YMS停售调整记录权限
        exportHaltSales: this.getPermission('haltTheSales_export'), // 导出YMS停售调整记录权限
        skuAwaitTab: this.getPermission('productBacklog_lable'), // SKU 待办项标签权限
      }
    },
    // 判断当前商户是否是供应商
    isSupplierTalg() {
      return this.$store.state.erpConfig.merchant.isSupplier === 1;
    },
    spuQualityOperation() {
      return !(this.spuQuality['spu'] || this.productGoodsDataSpu.length === 0) && this.permission.batchUpdate;
    },
    skuQualityOperation() {
      return !(this.spuQuality['sku'] || this.productGoodsDataSku.length === 0) && this.permission.batchUpdate;
    },
    spuBatchUpdateCheckType() {
      return !(this.spuQuality['spu'] || this.productGoodsDataSpu.length === 0) && this.permission.batchUpdateCheckType;
    },
    skuBatchUpdateCheckType() {
      return !(this.spuQuality['sku'] || this.productGoodsDataSku.length === 0) && this.permission.batchUpdateCheckType;
    },
    // 是否替换sku
    isReplaceSku() {
      return ['replaceSku'].includes(this.importFile.type);
    },
    // 是否销售链接导入
    isSalesLinkModal () {
      return ['salesLinkImport'].includes(this.importFile.type);
    },
    // 导入文件入参字段名
    importFileName () {
      if (this.isReplaceSku || this.isSalesLinkModal) return 'excelFile';
      return 'files';
    },
  },
  created() {
    this.getUserInfo();
    this.getAllAttribute();
    this.tableHeight = this.getTableHeight(310);
    this.pageParamsPrototype = this.deepCopy(this.pageParams);
    this.updateParamsPrototype = this.deepCopy(this.updateParams);
    this.getEditRole();
    this.getCommodityDeveloper();
    this.getProductTagList();
    this.getProductBrandList();
    this.getProductCategoryList();
    this.getAllQuality();
    if (this.isSupplierTalg) {
      this.getClassificationData();
    }
    // this.getList('spu');
  },
  activated() {
    this.reset();
    this.startLoading();
    this.bindCategory();
  },
  watch: {
    customProductTagList: {
      deep: true,
      immediate: true,
      handler(value) {
        this.customTagList = (value || []).map(m => {
          return { name: m, value: m }
        })
      }
    },
    'updateParams.isChangeOuterPackageRequirement': {
      immediate: true,
      handler(value) {
        this.$refs.updateParams && this.$refs.updateParams.validateField('outerPackageRequirement');
      }
    },
    'updateParams.isChangeProductionRequirement': {
      immediate: true,
      handler(value) {
        this.$refs.updateParams && this.$refs.updateParams.validateField('productionRequirement');
      }
    },
    addition: {
      handler(value) {
        if (this.upType === 'add') {
          this.uploadData.addition = value;
        }
      },
      immediate: true
    },
    upType: {
      handler(value) {
        if (value !== 'add') {
          // eslint-disable-next-line no-unused-vars
          let { addition, ...data } = this.uploadData;
          this.uploadData = data;
        }
      },
      immediate: true
    },
    tabType: {
      handler(val) {
        if (val == 'spu') {
          this.pageParams.pageSize = this.pageSizeSpu;
          this.pageParams.pageNum = this.pageNumSpu;
          this.total = this.totalSpu;
        } else {
          this.pageParams.pageSize = this.pageSizeSku;
          this.pageParams.pageNum = this.pageNumSku;
          this.total = this.totalSku;
        }
      }
    },
    modal1: {
      handler(val) {
        if (val) {
          this.logParams.pageSize = 10;
          this.logParams.pageNum = 1;
        }
      }
    },
    'updateParams.productCategoryIdSelected': {
      deep: true,
      handler(val) {
        if (!val) return;
        if (this.allPageStatus) {
          this.batchUpdateCategoryValidation();
          return;
        }
        const allProductId = this.selectedProductGoodsListSku.map(item => {
          return item.productGoodsId;
        });
        this.batchUpdateCategoryValidation(allProductId);
      }
    },
    'pageParams.spuStatusList': {
      deep: true,
      handler(val) {
        const skuStatus = (this.productStatus || []).filter(f => (val || []).includes(f.value)).map(m => m.value);
        if (JSON.stringify(skuStatus) != JSON.stringify(this.pageParams.skuStatusList)) {
          this.pageParams.skuStatusList = skuStatus;
        }
      }
    },
    'pageParams.skuStatusList': {
      deep: true,
      handler(val) {
        const sku = (this.productStatus || []).map(m => m.value);
        const other = (this.productStatusSpu || []).filter(f => !sku.includes(f.value)).map(m => m.value);
        const check = (this.pageParams.spuStatusList || []).filter(f => other.includes(f));
        const spuStatus = [...(val || []), ...check];
        if (JSON.stringify(spuStatus) != JSON.stringify(this.pageParams.spuStatusList)) {
          this.pageParams.spuStatusList = spuStatus;
        }
      }
    },
    qualityEditVisual: {
      handler(val) {
        if (val) return;
        if (this.refreshTable) {
          this.refreshTable = false;
          this.getList(this.tabType);
        }
      }
    },
    'updateParams.cnHsNameSelected': {
      handler(val) {
        if (val) return;
        this.$nextTick(() => {
          this.$refs.updateParams && this.$refs.updateParams.validateField('updateCnHsName');
        })
      }
    },
    'updateParams.enHsNameSelected': {
      handler(val) {
        if (val) return;
        this.$nextTick(() => {
          this.$refs.updateParams && this.$refs.updateParams.validateField('updateEnHsName');
        })
      }
    },
    'updateParams.hsCodeSelected': {
      handler(val) {
        if (val) return;
        this.$nextTick(() => {
          this.$refs.updateParams && this.$refs.updateParams.validateField('updateHsCode');
        })
      }
    }
  },
  methods: {
    batchUpdateCategoryValidation(productIdList = []) {
      this.productTypeValidation = true;
      let pageParams = this.getListQuery(this.tabType);
      pageParams.productGoodsIds = productIdList;
      // pageParams.businessDeptId = this.businessDeptId;
      this.axios.post(api.batchUpdateCategory, pageParams).then(res => {
        this.productTypeValidation = false;
        if (res && res.data) {
          if ([210064, '210064'].includes(res.data.code)) {
            this.$Message.error('选中的数据，分类有冲突');
            this.$nextTick(() => {
              this.$set(this.updateParams, 'productCategoryIdSelected', false);
            })
            return;
          }
          if (res.data.datas && res.data.datas[0] && typeof res.data.datas[0].productType !== 'undefined') {
            const handTreeData = (arr, parent) => {
              if (!this.$common.isEmpty(parent) && parent.productCategoryId !== 'productCategoryId') {
                this.$set(parent, 'isDisabled', !parent.productChildType.includes(res.data.datas[0].productType));
              }
              arr.forEach(item => {
                if (!this.$common.isEmpty(item.children)) {
                  this.$set(item, 'productChildType', this.getChildType(item.children, item.productType));
                  handTreeData(item.children, item);
                } else {
                  if (item.productCategoryId !== 'productCategoryId') {
                    this.$set(item, 'isDisabled', item.productType !== res.data.datas[0].productType);
                  }
                }
              });
              return arr;
            }
            this.batProductCategoryTree = handTreeData(this.$common.copy(this.batProductCategoryTree));
          }
        }
      }).catch(() => {
        this.productTypeValidation = false;
      })
    },
    // 获取子级所有 productType (包含自身)
    getChildType(arr, productType) {
      let list = [productType];
      arr.forEach(item => {
        list.push(item.productType);
        if (!this.$common.isEmpty(item.children)) {
          list = [...list, ...this.getChildType(item.children, item.productType)];
        }
      });
      return this.$common.arrRemoveRepeat(list).filter(f => !this.$common.isEmpty(f));
    },
    // 获取所有分类的数据
    getClassificationData() {
      this.menuList = [];
      this.originalCategoryData = [];
      this.axios.get(api.post_ymsProductCategory_shopping_queryAll, { hiddenError: true }).then((response) => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          this.originalCategoryData = data;
          this.menuFilterList = JSON.parse(JSON.stringify(data));
          this.menuList = this.handlerData(data, 'productCategoryNavigation', '->');
          this.$set(this.ymsProductCategoryTree[0], 'children', this.menuList);
        }
      });
    },
    // 处理分类的数据
    handlerData(data, key, sign) {
      let obj = {};
      if (data.length > 0) {
        let newArr = [];
        data.forEach((i) => {
          let matchName;
          let name = i[key];
          if (name.lastIndexOf(sign) > -1) {
            matchName = name.slice(0, name.lastIndexOf(sign));
            i.title = name.slice(name.lastIndexOf(sign) + 2, name.length);
            i.expand = true;
          } else {
            matchName = name;
            i.title = matchName;
            i.expand = true;
            newArr.push(i);
          }
          if (obj[matchName]) {
            obj[matchName].children.push(i);
          }
          obj[name] = i;
          obj[name].children = [];
        });
        return newArr;
      }
    },
    // 搜索分类
    filterCategoryChange(value) {
      this.uploadData.ymsProductCategoryId = null;
      this.menuFilterList = this.originalCategoryData.filter((i) => {
        return i.productCategoryNavigation.includes(value);
      });
    },
    ymsProductCategoryChange(value) {
      if (value) {
        this.stepModel = 1;
      }
    },
    setTreeDate(selectId) {
      if (!selectId) return;
      let arr = this.productCategoryTree[0].children;
      let item = [];

      const makeTree = (a) => {
        a.forEach((i) => {
          selectId.forEach((j) => {
            if (i.productCategoryId === j) {
              this.$set(i, 'checked', true);
              item.push(i);
            }
          });
          if (i.children) {
            makeTree(i.children);
          }
        });
      }

      makeTree(arr);
      setTimeout(() => {
        this.$refs['categoryTree'].treeSelectCheckChange(item);
      }, 300);
    },
    getDateValue(value) {
      // 选择日期
      if (!value) {
        return false;
      }
      if (value[0] && value[1]) {
        this.pageParams.startCreatedTime = this.getUniversalTime(
          new Date(value[0]).getTime(),
          'fulltime'
        );
        this.pageParams.endCreatedTime = this.getUniversalTime(
          new Date(value[1]).getTime(),
          'fulltime'
        );
      } else {
        this.pageParams.startCreatedTime = null;
        this.pageParams.endCreatedTime = null;
      }
    },
    logVisible(open) {
      if (open) {
        this.getLogList();
      }
    },
    changeLogPage(page) {
      this.logParams.pageNum = page;
      this.getLogList();
    },
    changeLogPageSize(pageSize) {
      this.logParams.pageSize = pageSize;
      this.getLogList();
    },
    getLogList() {
      let reqApi = this.tabType == 'sku' ? api.getLog_productBrandSku : api.getLog_productBrandSpu;
      if (this.tabType == 'spu') {
        delete this.logParams.productGoodsId;
      } else if (this.tabType == 'sku') {
        delete this.logParams.productId;
      }
      this.data1 = [];
      this.spinShow = true;
      this.axios.post(reqApi, this.logParams).then((response) => {
        this.spinShow = false;
        if (response.data.code === 0) {
          this.logTotal = response.data.datas.total;
          this.data1 = response.data.datas.list;
        }
      }).catch(() => {
        this.spinShow = false;
      });
    },
    startLoading() {
      // 初始方法
      // this.getProductTagList();
      // this.getProductBrandList();
      // this.getProductCategoryList();
      //  如果是从分页管理跳转过来的 直接查询
      if (
        this.pageParams.productCategoryList.length === 0 &&
        this.$route.query.categoryId
      ) {
        this.pageParamsStatus = true;
      } else {
        this.productGoodsDataSpu = [];
        this.total = 0;
      }
      // this.pageParamsStatus = true;
      this.urlParams = true;
    },
    getProductBrandList() {
      // 获取品牌列表(筛选下拉)
      this.axios.get(api.getAll_productBrand, { hiddenError: true }).then((response) => {
        if (response.data.code === 0) {
          this.productBrandList = response.data.datas;
        }
      });
    },
    getProductCategoryList() {
      // 获取商品分类(筛选下拉)
      this.axios.get(api.get_productCategory, { hiddenError: true }).then((response) => {
        if (response.data.code === 0) {
          this.productCategoryList = response.data.datas;
          let productCategoryTree = this.getProductCategoryTree(response.data.datas, null);
          this.selectTreeProductData = (response.data.datas || [])
          this.$set(this.productCategoryTree[0], 'children', []);
          this.$set(this.updateCategoryTree[0], 'children', []);
          this.$nextTick(() => {
            this.$set(
              this.productCategoryTree[0],
              'children',
              productCategoryTree
            );
            this.$set(
              this.updateCategoryTree[0],
              'children',
              productCategoryTree
            );
            productCategoryTree.unshift({
              title: '未分类',
              productCategoryId: 'noCategory',
              expand: true
            });
            this.selectTreeProductCategory = this.$common.copy(this.productCategoryTree);
            this.batProductCategoryTree = this.$common.copy(this.productCategoryTree);
            this.copyProductCategoryTree = this.$common.copy(this.productCategoryTree);
            if (this.$route.query.categoryId) {
              this.setTreeDate([this.$route.query.categoryId]);
            }
          });
        }
      });
    },
    getProductCategoryTree(productCategoryList, parentId) {
      // 组装商品分类树
      var tree = [];
      var children;
      productCategoryList.forEach((n, i) => {
        if (n.parentId === parentId) {
          n.title = n.cnName;
          n.expand = true;
          children = this.getProductCategoryTree(productCategoryList, n.productCategoryId);
          if (children.length > 0) {
            n.children = children;
          }
          tree.push(n);
        }
      });
      return tree;
    },
    search() {
      this.pageParams.pageNum = 1;
      this.getListBoth();
      // this.getProductCategoryList();
    },
    reset() {
      // 重置
      this.createdTimeProduct = [];
      this.pageParams = this.deepCopy(this.pageParamsPrototype);
      this.pageParams.ymsProductCategoryId = null;
      this.classifyValue = [];
      this.searchCode = null;
      this.cnNameList = [];
      this.enNameList = [];
      this.treeSelectCategoryValue = [];
      // this.search();
    },
    deleteControl(val, productGoodsId) {
      // 弹出确认删除框
      if (val === 0 && this.selectedProductGoodsListSku.length === 0) {
        // 批量删除
        this.$Message.error('无删除数据,请选择后再试');
      } else {
        this.$refs.delConfirmModal.show(val, productGoodsId);
      }
    },
    showDeleteTip(response) {
      // 删除结果提示
      let code = response.data.code;
      let datas = response.data.datas || [];
      if (datas.length > 0) {
        for (let i = 0; i < datas.length; i++) {
          let data = datas[i];
          if (data.code === 210018) {
            this.$Message.warning(`SKU：${data.sku}，该商品正在被映射商品使用，不能删除`);
          } else if (data.code === 210015) {
            this.$Message.warning(`SKU：${data.sku}，SKU不存在`);
          } else if (data.code === 210058) {
            this.$Message.warning(`SKU：${data.sku}，该SKU有库存不允许删除`);
          } else if (data.code === 999999) {
            this.$Message.warning(`SKU：${data.sku}，系统繁忙，请重新尝试`);
          } else if (data.code !== 0) {
            this.$Message.warning(this.$common.isEmpty(data.message) ? `SKU：${data.sku}，系统繁忙，请重新尝试` : data.message);
          }
        }
      } else if (code === 0) {
        this.$Message.success('删除成功');
        this.search();
      }
      this.$refs.delConfirmModal.hide();
      // this.pageParamsStatus = true;
    },
    del(val, productGoodsId) {
      // 删除
      let pageParams = this.getListQuery(this.tabType);
      pageParams.selectAll = this.allPageStatus === true ? 1 : 0;
      if (val === 0) {
        // 批量删除
        let productGoodsIds = [];
        this.selectedProductGoodsListSku.forEach((n, i) => {
          productGoodsIds.push(n.productGoodsId);
        });
        pageParams.productGoodsIds = productGoodsIds;
        this.axios.post(api.productGoods_batchDelete, pageParams).then((response) => {
          this.pageParams.productGoodsIds = [];
          this.showDeleteTip(response);
          this.selectedProductGoodsListSku = [];
        });
      } else if (val === 1) {
        // 删除所有结果集
        let productCategoryIds = [];
        this.pageParams.productCategoryList.forEach((n, i) => {
          if (n.productCategoryId) {
            productCategoryIds.push(n.productCategoryId);
          }
        });
        pageParams.productCategoryIds = productCategoryIds;
        this.axios.post(api.productGoods_batchDelete, pageParams).then((response) => {
          this.showDeleteTip(response);
        });
      } else if (val === 2) {
        // 单个删除
        this.axios.delete(api.del_productGoods + productGoodsId).then((response) => {
          this.showDeleteTip(response);
        });
      }
    },
    editSpu(productId, type) {
      // 编辑spu
      this.productId = productId;
      this.renderSpuDetailModal = true;
      this.$nextTick(() => {
        this.editProductModal = true;
        this.productShow = 'editNew'
      });
    },
    addProduct() {
      // 新增商品
      this.productId = null;
      this.editStatus = 'add';
      // this.$store.commit('productShow', 'add');
      this.$nextTick(() => {
        this.productShow = 'add'
      })
    },
    handleUpload(file) {
      // Excel 导入
      this.file = file;
      return this.confirmUpload;
    },
    handleUpload1(file) {
      // Excel 导入
      this.file1 = file;
      return this.confirmUpload;
    },
    handleUpload2(file) {
      // Excel 导入
      this.file2 = file;
      return this.confirmUpload;
    },
    handleUpload3(file) {
      // Excel 导入
      this.file3 = file;
      return this.confirmUpload;
    },
    upload() {
      // 导入sku模态框 确认
      if (this.file !== null) {
        this.confirmUpload = true;
        this.$refs.upload.upload(this.file);
      } else {
        this.addSkuModalLoading = false;
        this.$nextTick(() => {
          this.addSkuModalLoading = true;
        });
        this.$Message.error('请选择文件');
      }
    },
    upload1() {
      // 导入sku模态框 确认
      if (this.file1 !== null) {
        this.confirmUpload = true;
        this.$refs.upload1.upload(this.file1);
      } else {
        this.addSkuModalLoading = false;
        this.$nextTick(() => {
          this.addSkuModalLoading = true;
        });
      }
      if (this.file2 !== null) {
        this.confirmUpload = true;
        this.$refs.upload2.upload(this.file2);
      } else {
        this.addSkuModalLoading = false;
        this.$nextTick(() => {
          this.addSkuModalLoading = true;
        });
      }
    },
    upload3() {
      // 导入云卖产品 确认
      if (this.file3 !== null) {
        this.confirmUpload = true;
        this.$refs.upload3.upload(this.file3);
      } else {
        this.ymsModalLoading = false;
        this.$nextTick(() => {
          this.ymsModalLoading = true;
        });
        this.$Message.error('请选择文件');
      }
    },
    // 导出数据咨询弹窗
    exportDataHand() { },
    exportExcel(val) {
      // this.visibleExportData = true;
      // 0 导出商品, 1 导出所有结果集
      let reqApi0 = api.productInfo_excelExport;
      let reqApi1 = api.productInfo_excelExport;
      let selectedList = this.selectedProductGoodsListSpu;
      let total = this.totalSpu;
      let params = this.getListQuery(this.tabType);
      if (this.tabType == 'sku') {
        reqApi0 = api.productGoods_exportByIds;
        reqApi1 = api.productGoods_excelExport;
        selectedList = this.selectedProductGoodsListSku;
        total = this.totalSku;
      }
      if (val === 0) {
        let reqList = [];
        selectedList.forEach(n => {
          let temp = this.tabType == 'sku' ? n.productGoodsId : n.productId;
          reqList.push(temp);
        });
        if (reqList.length === 0) {
          this.$Message.error('无导出数据,请选择后再试');
          return;
        }
        // let newTab = window.open('about:blank');
        this.$set(params, 'productIdList', reqList);
        this.exportDataParams = {
          reqApi: reqApi0,
          params: params,
          tabType: this.tabType == 'sku' ? 'SKU' : 'SPU',
          total: reqList.length
        };
        this.$nextTick(() => {
          this.visibleExportData = true;
        })
      } else if (val === 1 && total) {
        // let newTab = window.open('about:blank');
        if (params.cargoOwnerId) {
          if (params.cargoOwnerId === '_NO_CARGO_OWNER') {
            // 无货主
            params.cargoOwnerType = 0;
            params.cargoOwnerId = null;
          } else {
            params.cargoOwnerType = 1;
          }
        } else {
          params.cargoOwnerType = null;
          params.cargoOwnerId = null;
        }
        if (this.tabType == 'spu') {
          this.$set(params, 'productIdList', [])
        }
        this.exportDataParams = {
          reqApi: reqApi1,
          params: params,
          tabType: this.tabType == 'sku' ? 'SKU' : 'SPU',
          total: this.tabType == 'sku' ? this.totalSku : this.totalSpu
        };
        this.$nextTick(() => {
          this.visibleExportData = true;
        })
      } else if (val === 1 && !total) {
        this.$Message.error('无导出数据');
      }
    },
    importExcel(val) {
      // 0,导入商品; 1,查看导入任务
      if (val === 0) {
        this.addSku = true;
      } else if (val === 1) {
        this.$router.push('importTask');
      } else if (val === 2) {
        // 导入组装信息
        this.$refs.importModal.modal = true;
      }
    },
    importTagExcel(val) {
      // 0,导入商品; 1,查看导入任务
      if (val === 0) {
        this.addTagSku = true;
      } else if (val === 1) {
        this.$router.push('importTask');
      }
    },
    loadTemplate() {
      // 下载模板
      let newTab = window.open('about:blank');
      this.axios.get(api.loadTemplate).then((response) => {
        if (response.data.code === 0) {
          newTab.location.href = this.filenodeViewTargetUrl + response.data.datas;
        }
      });
    },
    loadTemplate1() {
      // 下载模板
      let newTab = window.open('about:blank');
      this.axios.get(api.productInfo_DownExcel).then((response) => {
        if (response.data.code === 0) {
          newTab.location.href = this.filenodeViewTargetUrl + response.data.datas;
        }
      });
    },
    // 下载云卖产品表格模版
    loadTemplate3 (type) {
      // 下载模板
      let newTab = window.open('about:blank');
      if (this.importFile.type == 'special') {
        const template = {
          ordinary: '/product-service/template/specialProductImport.xlsx',
          append: '/product-service/template/specialProductImport-append.xlsx',
        };
        newTab.location.href = this.filenodeViewTargetUrl + template[type];
        return;
      }
      if (['replaceSku', 'salesLinkModal'].includes(type)) {
        const templateUrl = {
          replaceSku: '/product-service/template/replaceSkuImport.xlsx',
          salesLinkModal: '/product-service/template/platformUrlImport.xlsx',
        }
        newTab.location.href = this.filenodeViewTargetUrl + templateUrl[type];
        return;
      }
      const typeJson = {
        ordinary: '1',
        append: '2'
      }
      this.axios.get(`${api.productInfo_DownYmsExcel}?importType=${typeJson[type]}`).then((response) => {
        if (response.data.code === 0) {
          newTab.location.href = this.filenodeViewTargetUrl + response.data.datas;
        } else {
          newTab.close();
        }
      }).catch(() => {
        newTab.close();
      });
    },
    // 回退到选择云卖分类
    fallbackBtn() {
      this.stepModel = 0;
      this.uploadData.ymsProductCategoryId = null;
      this.uploadData.updateIgnore = '0';
      this.file = null;
    },
    // 打开选择水洗唛word文件弹窗
    opentCheckFile() {
      if (!this.$refs.washedUploadRef || !this.$refs.washedUploadRef.$el) return;
      const demo = this.$refs.washedUploadRef.$el.querySelector('.ivu-upload-select');
      if (!demo) return;
      demo.click();
    },
    // 水洗唛PDF文件上传
    washedUploadBefore(file) {
      if (this.isWashedUploadLoading || this.isDisabled) return false;
      if (['application/pdf', 'image/jpg', 'image/png', 'image/jpeg'].includes(file.type)) {
        this.isWashedUploadLoading = true;
        let newForm = new FormData(); // 创建form对象
        newForm.append('files', file);
        const uploadUrl = `${this.uploadFilesUrl}&random=${(Math.random()).toString().substring(2, 5) + (new Date().getTime()).toString()}`;
        this.axios.post(uploadUrl, newForm).then(res => {
          if (!res.data || res.data.code != 0) return;
          this.$set(this.updateParams, 'washedLabelPdfPath', res.data.datas[0]);
          this.$set(this.updateParams, 'washedLabelPdfName', file.name);
          if (['application/pdf'].includes(file.type)) {
            this.$common.getPdfRes({
              pdfUrl: `./filenode/s${res.data.datas[0]}`,
              pageNumber: 1,
              scale: 10
            }).then(img => {
              this.pdfFirstImgPreview = img;
            }).finally(() => {
              this.isWashedUploadLoading = false;
            })
          } else {
            this.pdfFirstImgPreview = `./filenode/s${res.data.datas[0]}`;
            this.isWashedUploadLoading = false;
          }
        }).catch(() => {
          this.isWashedUploadLoading = false;
        })
        return false;
      }
      this.$Message.error('文件格式不对，请上传 PDF 文件或 PNG、JPG 类型的图片');
      return false;
    },
    // 移除水洗唛PDF文件
    removeWashedPdf() {
      this.$set(this.updateParams, 'washedLabelPdfPath', null);
      this.$set(this.updateParams, 'washedLabelPdfName', null);
    },
    // 水洗唛PDF文件预览
    previewWashedPdf() {
      const url = this.updateParams.washedLabelPdfPath;
      const suffix = url.substring(url.lastIndexOf('.'), url.length);
      if (suffix.toLocaleLowerCase() == '.pdf') {
        this.axios.get(`./filenode/s${url}`, { responseType: 'blob' }).then(res => {
          this.$common.blobToBase64(res.data || res.resData).then(data => {
            const fileBold = this.$common.base64ToBlob(data, 'application/pdf');
            this.$common.previewFile(fileBold);
          })
        })
      } else {
        window.open(`./filenode/s${url}`);
      }
    },
    addSkuCancel() {
      // 导入sku模态框 取消
      // this.$refs.upload.fileList = [];
      this.file = null;
    },
    handleSuccess(res, file, fileList) {
      // 上传成功
      if (res.code === 0) {
        this.file = null;
        this.$Message.success(
          '已生成导入任务，可在“查看导入任务”中查询导入结果'
        );
        this.confirmUpload = false;
        this.addSku = false;
      }
    },
    handleSuccess1(res, file, fileList) {
      // 上传成功
      if (res.code === 0) {
        this.file1 = null;
        this.$Message.success('导入成功');
        this.confirmUpload = false;
        this.addTagSku = false;
        this.getListBoth();
      }
    },
    /* handleSuccess2 (res, file, fileList) { // 上传成功
     if (res.code === 0) {
     this.file2 = null;
     this.$Message.success('标签解绑导入成功');
     this.confirmUpload = false;
     }
     }, */
    handleSuccess3(res, file, fileList) {
      // 上传成功
      if (res.code === 0) {
        this.file3 = null;
        this.$Message.success('导入产品成功');
        this.confirmUpload = false;
        this.ymsModal = false;
        // this.getListBoth();
      }
    },
    handleFormatError() {
      // 上传失败
      this.$Message.error('文件格式有误');
      this.addSkuModalLoading = false;
      this.$nextTick(() => {
        this.addSkuModalLoading = true;
        this.confirmUpload = false;
      });
    },
    handleFormatError3() {
      // 上传失败
      this.$Message.error('文件格式有误');
      this.ymsModalLoading = false;
      this.$nextTick(() => {
        this.ymsModalLoading = true;
        this.confirmUpload = false;
        this.cancelImport();
      });
    },
    handleError3() {
      this.ymsModalLoading = false;
      this.$nextTick(() => {
        this.ymsModalLoading = true;
        this.confirmUpload = false;
        this.cancelImport();
      });
    },
    getSelectValueSpu(value) {
      this.selectedProductGoodsListSpu = value;
    },
    getSelectValueSku(value) {
      this.selectedProductGoodsListSku = value;
    },
    // 打开替代 SKU 弹窗
    openSubstituteModal(row) {
      this.selectTableRow = this.$common.copy(row);
      this.$nextTick(() => {
        this.substituteVisibleModal = true;
      })
    },
    onSelect(selection, row) { },
    onSelectCancel(selection, row) { },
    onSelectAll(selection, row) { },
    getProductCategoryMap(productCategoryIds, type) {
      // 获取产品分类Map
      let reqParams = [...new Set(productCategoryIds)];
      let repeat = {
        repeatVal: 'sku/spu'
      }
      if (productCategoryIds && productCategoryIds.length > 0) {
        this.axios.post(
          api.productCategory_queryByProductCategoryIds,
          reqParams,
          repeat
          // productCategoryIds
        ).then((response) => {
          if (response.data.code === 0) {
            if (type == 'spu') {
              this.productGoodsListDictionarySpu.productCategoryMap = response.data.datas;
            } else {
              this.productGoodsListDictionarySku.productCategoryMap = response.data.datas;
            }
          }
        });
      }
    },
    getGoodsImageMap(productGoodsIds, type) {
      // 获取货品图片Map
      let reqParams = [...new Set(productGoodsIds)];
      let repeat = {
        repeatVal: 'sku/spu'
      }
      return new Promise((resolve) => {
        if (productGoodsIds && productGoodsIds.length > 0) {
          // .post(api.productGoodsImage_queryByProductGoodsIds, productGoodsIds)
          this.axios.post(api.productGoodsImage_queryByProductGoodsIds, reqParams, repeat).then((response) => {
            if (response.data.code === 0) {
              if (type == 'spu') {
                this.productGoodsListDictionarySpu.goodsImageMap = response.data.datas;
              } else {
                this.productGoodsListDictionarySku.goodsImageMap = response.data.datas;
              }
            }
            resolve(true);
          });
        } else {
          resolve(true);
        }
      });
    },
    getListQuery(str) {
      const type = this.$common.isEmpty(str) ? this.tabType : str;
      let productCategoryIds = [];
      let params = this.$common.copy(this.pageParams);
      if (this.urlParams) {
        if (params.productCategoryList.length === 0 && this.$route.query.categoryId) {
          params.productCategoryIds = [this.$route.query.categoryId];
        } else {
          params.productCategoryList.forEach((n, i) => {
            if (n.productCategoryId) {
              productCategoryIds.push(n.productCategoryId);
            }
          });
          params.productCategoryIds = productCategoryIds;
        }
        if (this.$route.query.tagId) {
          params.tagNames = [this.$route.query.tagId];
        }
      } else {
        params.productCategoryList.forEach((n, i) => {
          if (n.productCategoryId) {
            productCategoryIds.push(n.productCategoryId);
          }
        });
        params.productCategoryIds = productCategoryIds;
      }
      params.code = this.searchCode ? this.searchCode.split('\n').toString() : null;
      if (this.isSupplierTalg) {
        params.shelveStatus = Number(this.trackingTab);
      }
      params.cnNameList = this.$common.isEmpty(this.cnNameList) ? null : this.cnNameList;
      params.enNameList = this.$common.isEmpty(this.enNameList) ? null : this.enNameList;
      params.businessDeptIds = params.businessDeptIds.join(',');
      if (params.cargoOwnerId) {
        if (params.cargoOwnerId === '_NO_CARGO_OWNER') {
          // 无货主
          params.cargoOwnerType = 0;
          params.cargoOwnerId = null;
        } else {
          params.cargoOwnerType = 1;
        }
      } else {
        params.cargoOwnerType = null;
        params.cargoOwnerId = null;
      }

      if (this.businessDeptId) {
        params.businessDeptId = this.businessDeptId;
      }
      if (['spu', 'sku'].includes(type)) {
        if (type == 'spu') {
          this.pageSizeSpu = params.pageSize;
          this.pageNumSpu = params.pageNum;
        } else {
          this.pageSizeSku = params.pageSize;
          this.pageNumSku = params.pageNum;
        }
        params.statusList = type == 'spu' ? params.spuStatusList : params.skuStatusList;
        params.codeType = type == 'spu' ? 2 : 1;
        params.flag = type == 'spu' ? 1 : 0;
        ['backlogName', 'createdByList', 'expireTime'].forEach(key => {
          delete params[key];
        });
      }
      if (this.$common.isEmpty(params.qualityTemplateId)) {
        params.qualityTemplateId = null;
      } else if (params.qualityTemplateId === 'checkNotQualityTemplateId') {
        params.qualityTemplateId = '';
        params.isBindQualityTemplate = 1;
      }
      delete params.spuStatusList;
      delete params.skuStatusList;
      return params
    },
    // 点击查询按钮时
    getListBoth () {
      if (['spu', 'sku'].includes(this.tabType)) {
        this.getList('spu');
        this.getList('sku');
        return;
      }
      this.getList('skuWaitDone');
    },
    // 验证外包装要求（SPU生产要求）
    validateOutPack(rule, value, callback) {
      if (!this.updateParams.isChangeOuterPackageRequirement) return callback();
      if (!this.$common.isEmpty(value) && value.trim().length > 200) {
        return callback(new Error('输入字符超出规定，最多200字符'));
      }
      return callback();
    },
    // 验证SKU生产要求
    validateSkuPack(rule, value, callback) {
      if (!this.updateParams.isChangeProductionRequirement) return callback();
      if (!this.$common.isEmpty(value) && value.trim().length > 200) {
        return callback(new Error('输入字符超出规定，最多200字符'));
      }
      return callback();
    },
    getList(type) {
      if (type == 'skuWaitDone' && this.$refs['sku-wait-done'] && this.$refs['sku-wait-done'].searchTable) {
        this.$refs['sku-wait-done'].searchTable(true);
        return;
      }
      if (!this.permission.query) {
        return this.$Message.error('您暂没有查看该模块数据的权限，请联系管理员');
      }
      type == 'spu' ? this.tableLoadingSpu = true : this.tableLoadingSku = true;
      type == 'spu' ? this.selectedProductGoodsListSpu = [] : this.selectedProductGoodsListSku = [];
      let reqApi = type == 'spu' ? api.productGoods_querySpu : api.productGoods_querySku;
      const reqParams = this.getListQuery(type);
      this.axios.post(reqApi, reqParams).then((response) => {
        let pos = [];
        this.urlParams = false;
        let productGoodsIds = [];
        let productCategoryIds = [];
        let userIds = [];
        if (response.data.code === 0) {
          var data = response.data.datas || [];
          data.list.forEach((i) => {
            i.num = 1;
          });
          if (data.list !== null && data.list.length > 0) {
            data.list.forEach((n, i) => {
              pos.push(n);
              productGoodsIds.push(n.productGoodsId);
              productCategoryIds.push(n.productCategoryId);
              userIds.push(n.createdBy);
            });
          }

          return new Promise(resolve => {
            let temp = [...new Set(userIds)];
            Promise.all([
              this.getGoodsImageMap(productGoodsIds, type),
              this.getProductCategoryMap(productCategoryIds, type),
              this.getUserInfoMap(temp)
              // this.getUserInfoMap(userIds)
            ]).then(() => {
              if (type == 'spu') {
                this.productGoodsDataSpu = pos;
                this.totalSpu = data.total;
              } else {
                this.productGoodsDataSku = pos;
                this.totalSku = data.total;
              }
              this.loadingFalse(type);
              this.$nextTick(() => {
                this.total = Number(data.total);
                this.loadingFalse(type);
                this.$nextTick(() => {
                  this.total = Number(data.total);
                  this.loadingFalse(type);
                });
              });
            }).catch(() => {
              this.loadingFalse(type);
            });
            resolve();
          })
        } else {
          this.loadingFalse(type);
        }
      }).catch(() => {
        this.loadingFalse(type);
      });
    },
    loadingFalse(type) {
      type == 'spu' ? this.tableLoadingSpu = false : this.tableLoadingSku = false;
    },
    addCustomTag(val) {
      // 添加自定义标签
      let value = val === null ? '' : this.trim(val);
      const hasd = this.customTagList.find(item => item.name == val);
      if (value !== '' && value.length <= 50 && this.$common.isEmpty(hasd)) {
        this.customTagList.push({ name: value, value: value });
        let arr = this.pageParams.tagNames;
        arr.push(value);
        this.$nextTick(() => {
          this.pageParams.tagNames = arr;
        });
      } else {
        this.$Message.error('新增标签长度不能超过50且不能与已存在标签重复');
      }
    },
    selectedEdit(bol) {
      this.updateModalStatus = true;
      this.$nextTick(() => {
        this.updateModal = true;
        this.updateFlag = bol;
        this.$set(this.updateParams, 'updateProductCategoryId', null);
      })
    },
    // 打开批量恢复 SKU 弹窗
    batchRecoverSku() {
      this.visibleRecoverSku = true;
    },
    // 验证报关中文
    hsNameMaxVerify(rule, value, callback) {
      const newVal = this.$common.isEmpty(value) ? '' : value.trim();
      const regex = this.$regular.MatchChinese;
      if (!this.$common.isEmpty(newVal) && !regex.test(newVal)) {
        return callback(new Error('只允许填中文'));
      }
      this.$common.strMaxVerify(rule, value, callback);
    },
    // 验证报关英文
    enNameMaxVerify(rule, value, callback) {
      const newVal = this.$common.isEmpty(value) ? '' : value.trim();
      // eslint-disable-next-line no-useless-escape
      const regex = /^(?!_)([A-Za-z ~!@#$%^*()_+\/*\-,.;'\[\]<>?\\:"{}，。、；‘’【】《》？：“”\|`·——]+)$/;
      if (!this.$common.isEmpty(newVal) && this.$common.isEmpty(newVal.match(regex))) {
        return callback(new Error('只允许填英文+空格+除&以外的符号'));
      }
      this.$common.strMaxVerify(rule, value, callback);
    },
    hsCodeVerify(rule, value, callback) {
      const newVal = this.$common.isEmpty(value) ? '' : value.trim();
      const regex = this.$regular.AllNumber;
      if (!this.$common.isEmpty(newVal) && !regex.test(newVal)) {
        return callback(new Error('请输入数字'));
      }
      this.$common.strMaxVerify(rule, value, callback);
    },
    batchOption(name) {
      // 批量操作
      if (name === '4') {
        this.copyTableSpu('sku');
        return;
      }
      // if (['quality', 'checkType'].includes(name)) {
      //   this.batchOperation(name);
      //   return;
      // }
      let isEdit = true;
      if (name === '1') {
        // 删除
        if (!this.productGoodsDataSku.length) {
          this.$Message.error('无数据');
        } else {
          if (this.allPageStatus) {
            // 所有结果集
            this.$refs.delConfirmModal.changeText(`是否确认选中的<span style="color:#f20;">${this.totalSku || 0}个SKU</span>删除?`);
            this.$nextTick(() => {
              this.$refs.delConfirmModal.show(1);
            })
          } else {
            // 选择数据
            if (this.selectedProductGoodsListSku.length) {
              if (this.isCommodityDeveloper && !this.isProductDeveloperSupervisor) {
                for (let i = 0; i < this.selectedProductGoodsListSku.length; i++) {
                  if (this.selectedProductGoodsListSku[i].productDeveloperUserId !== this.currentUserInfo.userId) {
                    this.$Message.error('无权限编辑他人账号下产品，请重新勾选您账号下的产品进行批量删除');
                    isEdit = false;
                    break;
                  }
                }
                if (isEdit) {
                  this.$refs.delConfirmModal.changeText(`
                    是否确认选中的<span style="color:#f20;">${this.selectedProductGoodsListSku.length}个SKU</span>删除?
                  `);
                  this.$nextTick(() => {
                    this.$refs.delConfirmModal.show(0);
                  })
                }
              } else if (this.isProductDeveloperSupervisor) {
                this.$refs.delConfirmModal.changeText(`
                  是否确认选中的<span style="color:#f20;">${this.selectedProductGoodsListSku.length}个SKU</span>删除?
                `);
                this.$nextTick(() => {
                  this.$refs.delConfirmModal.show(0);
                })
              }
            } else {
              this.$Message.error('请选择数据');
            }
          }
        }
      } else if (name === '2') {
        // 修改
        if (!this.productGoodsDataSku.length) {
          this.$Message.error('无数据');
        } else {
          if (this.allPageStatus) {
            // 所有结果集
            this.selectedEdit(true);
          } else {
            // 选择数据
            if (this.selectedProductGoodsListSku.length) {
              if (this.isCommodityDeveloper && !this.isProductDeveloperSupervisor) {
                for (let i = 0; i < this.selectedProductGoodsListSku.length; i++) {
                  if (this.selectedProductGoodsListSku[i].productDeveloperUserId !== this.currentUserInfo.userId) {
                    this.$Message.error('无权限编辑他人账号下产品，请重新勾选您账号下的产品进行批量修改');
                    isEdit = false;
                    break;
                  }
                }
                isEdit && this.selectedEdit(false);
              } else if (this.isProductDeveloperSupervisor) {
                this.selectedEdit(false);
              } else {
                this.$Message.error('您暂时无权限编辑产品信息！');
              }

              /* this.updateModal = true;
              this.updateModalStatus = true;
              this.updateFlag = false; */
            } else {
              this.$Message.error('请选择数据');
            }
          }
        }
      } else if (name === '3') {
        if (this.selectedProductGoodsListSku.length === 0) {
          this.$Message.error('请选择数据');
        } else {
          this.printData = this.selectedProductGoodsListSku;
          this.$refs.print.printModal = true;
        }
      }
    },
    updateOk() {
      this.$refs.updateParams && this.$refs.updateParams.validate((valid) => {
        if (!valid) {
          this.$Message.error('验证不通过');
          this.updateLoading = false;
          this.$nextTick(() => {
            this.updateLoading = true;
          });
          return;
        }
        // 校验
        if (!this.updateParams.updateCnName && this.updateParams.cnNameSelectedId) {
          this.updateLoading = false;
          this.$nextTick(() => {
            this.updateLoading = true;
          });
          this.$Message.error('商品中文名称不能为空');
          return false;
        }
        if (this.updateParams.updateCnName && !this.updateParams.cnNameSelectedId) {
          this.updateLoading = false;
          this.$nextTick(() => {
            this.updateLoading = true;
          });
          this.$Message.error('商品中文名称下拉框不能为空');
          return false;
        }
        if (this.$common.isEmpty(this.updateParams.updateProductGoodsTags) && this.updateParams.productGoodsTagsSelected) {
          this.updateLoading = false;
          this.$nextTick(() => {
            this.updateLoading = true;
          });
          this.$Message.error('特性标签多选框不能为空');
          return false;
        }
        if (!this.$common.isEmpty(this.updateParams.updateProductGoodsTags) && !this.updateParams.productGoodsTagsSelectedId) {
          this.updateLoading = false;
          this.$nextTick(() => {
            this.updateLoading = true;
          });
          this.$Message.error('特性标签下拉框不能为空');
          return false;
        }

        if (this.updateParams.productCategoryIdSelected && this.$common.isEmpty(this.updateParams.updateProductCategoryId)) {
          this.updateLoading = false;
          this.$nextTick(() => {
            this.updateLoading = true;
          });
          this.$Message.error('所属分类不能为空');
          return false;
        }

        let num = this.allPageStatus ? this.totalSku : this.selectedProductGoodsListSku.length;
        let washedTip = [];
        if (this.updateParams.isChangeWashedLabelPdf && this.$common.isEmpty(this.updateParams.washedLabelPdfPath)) {
          washedTip.push(`<div style="padding:5px 0; color: red;">注意：水洗唛PDF为空，提交后会删除选中数据的水洗唛文件</div>`);
        }
        if (this.updateParams.isChangeWashedLabelWord && this.$common.isEmpty(this.washedLabelWordFile)) {
          washedTip.push(`<div style="padding:5px 0; color: red;">注意：水洗唛word文件为空，提交后会删除选中数据的水洗唛word文件</div>`);
        }
        this.$Modal.confirm({
          title: '确认是否批量修改数据？',
          content: `<div>
            <span>这次修改数据：</span>
            <span style="color:red;font-size:18px">${num}</span>
            <span style="margin-left:15px">条</span>
          </div>
          ${this.$common.isEmpty(washedTip) ? '' : washedTip.join('')}`,
          onOk: () => {
            this.secondUpdateOk();
          },
          onCancel: () => {
            this.updateLoading = false;
            this.$nextTick(() => {
              this.updateLoading = true;
            });
            // this.updateCancel();
            // this.updateModal = false;
          }
        });
      })
    },
    secondUpdateOk() {
      // 批量修改确认
      let pageParamsOld = this.getListQuery(this.tabType);

      let obj = {
        cnNameSelected: this.updateParams.cnNameSelected ? 1 : 0,
        updateCnName: this.updateParams.updateCnName,
        enNameSelected: this.updateParams.enNameSelected ? 1 : 0,
        updateEnName: this.updateParams.updateEnName,
        upcSelected: this.updateParams.upcSelected ? 1 : 0,
        updateUpc: this.updateParams.updateUpc,
        eanSelected: this.updateParams.eanSelected ? 1 : 0,
        updateEan: this.updateParams.updateEan,
        isbnSelected: this.updateParams.isbnSelected ? 1 : 0,
        updateIsbn: this.updateParams.updateIsbn,
        productCategoryIdSelected: this.updateParams.productCategoryIdSelected ? 1 : 0,
        updateProductCategoryId: this.updateParams.updateProductCategoryId,
        ymsProductCategoryIdSelected: this.updateParams.ymsProductCategoryIdSelected ? 1 : 0,
        updateYmsProductCategoryId: this.updateParams.updateYmsProductCategoryId,
        productBrandIdSelected: this.updateParams.productBrandIdSelected ? 1 : 0,
        updateProductBrandId: this.updateParams.updateProductBrandId,
        productGoodsTagsSelected: this.updateParams.productGoodsTagsSelected ? 1 : 0,
        productGoodsTagsSelectedId: this.updateParams.productGoodsTagsSelectedId,
        updateProductGoodsTags: this.updateParams.updateProductGoodsTags,
        suggestPriceSelected: this.updateParams.suggestPriceSelected ? 1 : 0,
        updateSuggestPrice: Number(this.updateParams.updateSuggestPrice),
        statusSelected: this.updateParams.statusSelected ? 1 : 0,
        updateStatus: this.updateParams.updateStatus,
        cnHsNameSelected: this.updateParams.cnHsNameSelected ? 1 : 0,
        updateCnHsName: this.updateParams.updateCnHsName,
        enHsNameSelected: this.updateParams.enHsNameSelected ? 1 : 0,
        updateEnHsName: this.updateParams.updateEnHsName,
        hsCodeSelected: this.updateParams.hsCodeSelected ? 1 : 0,
        updateHsCode: this.updateParams.updateHsCode,
        productDeveloperUserIdSelected: this.updateParams.productDeveloperUserIdSelected ? 1 : 0,
        updateDroductDeveloperUserId: this.updateParams.updateDroductDeveloperUserId,
        acceptableTypeSelected: this.updateParams.acceptableTypeSelected ? 1 : 0,
        acceptableType: this.updateParams.acceptableType,
        weightSelected: this.updateParams.weightSelected ? 1 : 0,
        weight: this.updateParams.weight,
        sizeSelected: this.updateParams.sizeSelected ? 1 : 0,
        length: this.updateParams.length,
        width: this.updateParams.width,
        height: this.updateParams.height,
        cargoOwnerType: this.updateParams.cargoOwnerType,
        cargoOwnerId: this.updateParams.cargoOwnerId,
        cnNameSelectedId: this.updateParams.cnNameSelectedId,
        flag: this.tabType == 'spu' ? 1 : 0,
        codeType: this.tabType == 'spu' ? 2 : 1,
        distributionPriceSelected: this.updateParams.distributionPriceSelected ? 1 : 0,
        distributionPriceType: this.updateParams.distributionPriceType,
        distributionPriceValue: this.updateParams.distributionPriceValue,
        selectAll: (this.allPageStatus === true || this.updateFlag) ? 1 : 0,
        isChangeWashedLabel: this.updateParams.isChangeWashedLabel ? 1 : 0,
        washedLabel: this.updateParams.washedLabel,
        isChangeWashedLabelPdf: this.updateParams.isChangeWashedLabelPdf ? 1 : 0,
        washedLabelPdfPath: this.updateParams.washedLabelPdfPath,
        washedLabelPdfName: this.updateParams.washedLabelPdfName,
        isChangeOuterPackageRequirement: this.updateParams.isChangeOuterPackageRequirement ? 1 : 0,
        outerPackageRequirement: this.updateParams.outerPackageRequirement,
        isChangeProductionRequirement: this.updateParams.isChangeProductionRequirement ? 1 : 0,
        productionRequirement: this.updateParams.productionRequirement,
        isChangeWashedLabelWord: this.updateParams.isChangeWashedLabelWord ? 1 : 0,
        washedLabelWordPath: this.washedLabelWordFile.fileUrl || '',
        washedLabelWordName: this.washedLabelWordFile.fileName || '',
      }
      if (this.updateFlag || this.allPageStatus) {
        // 所有结果集
        let productCategoryIds = [];
        pageParamsOld.productCategoryList.forEach((n, i) => {
          if (n.productCategoryId) {
            productCategoryIds.push(n.productCategoryId);
          }
        });
        pageParamsOld.productCategoryIds = productCategoryIds;
        obj = Object.assign(pageParamsOld, obj);
      } else {
        // 选择数据
        obj.productGoodsIds = (this.selectedProductGoodsListSku || []).map((n, i) => {
          return n.productGoodsId;
        })
      }
      this.batchUpdateLoading = true;
      this.axios.post(api.put_batchUpdate, obj).then((response) => {
        if (response.data.code === 0) {
          this.$Message.success('修改成功');
          this.updateCancel();
          this.updateModal = false;
          this.getListBoth();
        } else {
          this.updateLoading = false;
          this.$nextTick(() => {
            this.updateLoading = true;
          });
        }
        this.batchUpdateLoading = false;
      }).catch(() => {
        this.batchUpdateLoading = false;
        this.updateLoading = false;
        this.$nextTick(() => {
          this.updateLoading = true;
        });
      });
      this.selectedProductGoodsListSku = [];
    },
    updateCancel() {
      // 批量修改取消
      this.updateParams = this.deepCopy(this.updateParamsPrototype);
      // 清空选择的分类数据
      this.updateParams.updateProductCategoryId = null;
      this.updateParams.updateYmsProductCategoryId = null;
      // this.$refs.productCategoryTree.model = [];
      // this.$refs.productCategoryTree.query = '';
      this.productTypeValidation = false;
      this.washedLabelWordFile = {};
      this.$nextTick(() => {
        this.$refs.updateParams && this.$refs.updateParams.resetFields();
      })
    },
    getTreeData(productCategory) {
      // 选择分类时把id赋值给商品模型分类ID
      // if (productCategory && productCategory.productCategoryId) {
      //   this.updateParams.updateProductCategoryId = productCategory.productCategoryId;
      // } else {
      //   this.updateParams.updateProductCategoryId = null;
      // }
      if (productCategory === 'productCategoryId') {
        this.$Message.error('“全部” 选项不可选中');
        this.$nextTick(() => {
          this.updateParams.updateProductCategoryId = this.oldProductCategoryId;
        })
        return;
      }
      this.updateParams.updateProductCategoryId = productCategory || null;
      this.oldProductCategoryId = productCategory || null;
    },
    getYmsTreeData(productCategory) {
      if (productCategory && productCategory.ymsProductCategoryId) {
        this.updateParams.updateYmsProductCategoryId =
          productCategory.ymsProductCategoryId;
      } else {
        this.updateParams.updateYmsProductCategoryId = null;
      }
    },
    // 批量修改商品--产品类型：选择普货时，限制其他选项
    changeSelect(value) {
      if (JSON.stringify(value) === JSON.stringify(this.oldAcceptableType)) return;
      if (value.includes('01')) {
        this.updateParams.acceptableType = value.filter(v => v !== '01');
      }
      if (value.length <= 0) {
        this.updateParams.acceptableType = ['01'];
      }
      this.oldAcceptableType = this.updateParams.acceptableType;
    },
    // 下架SPU
    shelfBtn(productId) {
      this.axios.put(api.put_productInfo + `${productId}`).then((response) => {
        if (response.data.code === 0) {
          this.$Message.success('操作成功!');
          this.getListBoth();
        }
      });
    },
    // 选中云卖分类
    getYmsClassifyTree(productCategory) {
      // 选择分类时把id赋值给商品模型分类ID
      if (productCategory && productCategory.ymsProductCategoryId) {
        this.pageParams.ymsProductCategoryId =
          productCategory.ymsProductCategoryId;
      } else {
        this.pageParams.ymsProductCategoryId = null;
      }
    },
    getUserInfo() {
      this.axios.get(api.query_allDeveloper, { hiddenError: true }).then(res => {
        if (res.data.code == 0 && res.data.datas) {
          let newList = {}
          res.data.datas.forEach(item => {
            newList[item.userId] = item
          })
          this.personnelRoleTypeList = Object.values(newList)
        }
      })
    },
    // 获取所有属性
    getAllAttribute() {
      this.isEdit = ['add', 'edit'].includes(this.modalType)
      this.axios.get(api.attributeAll, { hiddenError: true }).then(res => {
        if (res.data.code == 0 && res.data.datas) {
          let list = [];
          (res.data.datas || []).forEach(item => {
            if (item.attributeValueList) {
              list = [...list, ...(item.attributeValueList || [])]
            }
          })
          this.attributeList = list;
          // this.attributeList = (res.data.datas || []);
        }
      })
    },
    // 表格自定义排序方法
    tableSortChange({ key, order }) {
      const hand = {
        public: () => {
          if (['desc', 'normal'].includes(order)) {
            this.pageParams.upDown = 'down'
          } else {
            this.pageParams.upDown = 'up'
          }
          hand[key]();
          this.$nextTick(() => {
            this.getList(this.tabType)
          })
        },
        createdBy: () => {
          this.pageParams.orderBy = 'createdTime'
        },
        status: () => {
          this.pageParams.orderBy = 'status'
        }
      }
      hand.public();
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
      let newList = []
      let newTree = this.selectTreeProductData.filter(item => {
        return value.includes(item.productCategoryId)
      })
      if (value.includes('noCategory')) {
        newTree.unshift({
          title: '未分类',
          productCategoryId: 'noCategory',
          expand: true
        });
      }
      if (value.includes('productCategoryId')) {
        newList.push({
          title: '全部',
          expand: true,
          children: newTree
        })
      }
      if (this.visibleCopyProduct) {
        let productPriceList = []
        productPriceList = this.productPriceInfoList
        this.copyProductData.productCategoryIdList = newList.length > 0 ? newList : newTree
        const isClickedArr = this.copyProductTableData.filter(item => {
          return item.isClicked === true
        }).map(el => el.productCategoryId)
        // 如果copyProductData.productCategoryIdList中没有的值，在copyProductGoodsQOList存在则删除
        this.copyProductGoodsQOList = this.copyProductGoodsQOList.flat().filter(item => {
          const productCategoryIdList = this.copyProductData.productCategoryIdList.map(item => item.productCategoryId)
          if (productCategoryIdList.includes(item.productCategoryId)) {
            return true
          } else return false
        })
        this.copyProductTableData = this.copyProductTableData.filter(item => {
          const productCategoryIdList = this.copyProductData.productCategoryIdList.map(item => item.productCategoryId)
          if (productCategoryIdList.includes(item.productCategoryId)) {
            return true
          } else return false
        })
        // 判断如果copyProductGoodsQOList中不存在当前遍历的分类id，则添加进去
        this.copyProductData.productCategoryIdList.forEach((item) => {
          const productCategoryIdList = this.copyProductGoodsQOList.flat().map(item => item.productCategoryId)
          if (!productCategoryIdList.includes(item.productCategoryId)) {
            // 处理copyProductGoodsQOList列表
            const childProductData = productPriceList.productGoodsPriceBOList.map(el => {
              return {
                productCategoryId: item.productCategoryId,
                productGoodsId: el.productGoodsId,
                supplierGoodsCode: el.supplierGoodsCode,
                supplierPurchaseLink: el.supplierPurchaseLink,
                supplierId: productPriceList.supplierId,
                priceDetails: el.suggestPrice
              }
            })
            this.copyProductGoodsQOList.push(childProductData)
            // 结束
            // 处理copyProductTableData列表
            const copyProductGoodsQOList = productPriceList.productGoodsPriceBOList.map(list => {
              return {
                productCategoryId: item.productCategoryId,
                productGoodsId: list.productGoodsId,
                supplierGoodsCode: list.supplierGoodsCode,
                supplierPurchaseLink: list.supplierPurchaseLink,
                supplierId: productPriceList.supplierId,
                priceDetails: list.suggestPrice,
                image: list.image,
                specificationList: list.specificationList
              }
            })
            const obj = {
              copyProductGoodsQOList: copyProductGoodsQOList,
              productCategoryId: item.productCategoryId,
              productCategoryNavigation: item.productCategoryNavigation,
              productSpu: this.copyProductData.productSpu, // 商品Spu
              productId: this.copyProductData.productId, // 产品ID
              supplierId: productPriceList.supplierId,
              supplierName: productPriceList.supplierName,
              isClicked: !!isClickedArr.includes(item.productCategoryId),
            }
            this.copyProductTableData.push(obj)
            // 结束
          }
        })
        this.copyProductGoodsQOList = this.copyProductGoodsQOList.flat()
      } else {
        this.$set(this.pageParams, 'productCategoryList', newList.length > 0 ? newList : newTree)
      }
    },
    // SPU批量操作
    batchOperation(name) {
      if (name == 'copy') {
        this.copyTableSpu(this.tabType);
        return;
      }
      if (((!this.selectedProductGoodsListSpu.length && this.tabType == 'spu') || (!this.selectedProductGoodsListSku.length && this.tabType == 'sku')) && !this.allPageStatus == true) {
        this.$Message.error('请选择数据');
        return;
      }
      const checkList = this.$common.copy(this.tabType == 'spu' ? this.selectedProductGoodsListSpu : this.selectedProductGoodsListSku);
      if (name === 'checkType') {
        this.moduleEditCheckTypeData.row = checkList;
        this.$nextTick(() => {
          this.openEditCheckType = true;
        })
        return;
      }
      let checkJson = {};
      // let ids = [];
      checkList.forEach(item => {
        // !this.$common.isEmpty(item.productCategoryId) && ids.push(item.productCategoryId);
        !checkJson[item.productId] && (checkJson[item.productId] = item);
      });
      this.qualityEditData = Object.values(checkJson);
      this.$nextTick(() => {
        this.qualityEditVisual = true;
      });
      // this.spuQuality[this.tabType] = true;
      // let obj = {}
      // if (this.allPageStatus === true) {
      //   obj = {
      //     ...this.getListQuery(this.tabType),
      //     selectAll: 1
      //   }
      // } else {
      //   obj = {
      //     productCategoryIdList: this.$common.arrRemoveRepeat(ids),
      //     selectAll: 0
      //   }
      // }

      // this.axios.post(api.qualityClassificationByProductCategoryIdList, obj).then(res => {
      //   this.spuQuality[this.tabType] = false;
      //   if (res && res.data && res.data.code == 0) {
      //     this.qualityClassificationId = res.data.datas;
      //     this.$nextTick(() => {
      //       this.qualityEditVisual = true;
      //     });
      //   }
      // }).catch(() => {
      //   this.spuQuality[this.tabType] = false;
      // });
    },
    batchCopyProduct() {
      this.copyTreeSelectCategoryValue = []
      this.copyProductTableData = []
      this.copyProductData = {
        productSpu: '',
        productId: '',
        productCategoryIdList: []
      }
      if (this.selectedProductGoodsListSpu.length === 0) {
        return this.$Message.error('请选择商品~');
      }
      // 判断是否选择超过一个以上商品
      if (this.selectedProductGoodsListSpu.length > 1) {
        return this.$Message.error('一次不能复制多个SPU');
      }
      this.copyProductData.productSpu = this.selectedProductGoodsListSpu[0].spu
      this.copyProductData.productId = this.selectedProductGoodsListSpu[0].productId
      this.getProductPrice()
      this.visibleCopyProduct = true
    },
    // 同步信息到明到云
    batchSyncInfoTomdy () {
      if (this.selectedProductGoodsListSpu.length <= 0) return this.$Message.error('请选择需要同步的商品');
      this.confirmData = {
        title: '同步信息至明道云',
        width: '500px',
        isHtml: true,
        content: `<div>
          <div>是否确认同步商品信息(SPU/SKC/SKU平台信息)至明道云。</div>
          <div>选中SPU数量：<span style="color:#f20;">${this.selectedProductGoodsListSpu.length}</span></div>
        </div>`
      };
      this.$nextTick(() => {
        this.confirmVisibleModal = true;
      });
    },
    // 明道云确认
    mingDaoConfirm () {
      this.mingDaoLoading = true;
      const params = this.selectedProductGoodsListSpu.map(m => m.productId);
      this.axios.post(api.synProductInfoToMingDao, params).then((res) => {
        if (!res || !res.data || res.data.code != 0) return;
        this.confirmVisibleModal = false;
        this.$Message.success('同步成功!');
      }).finally(() => {
        this.mingDaoLoading = false;
      });
    },
    // 明道云关闭
    mingDaoClose () {
      this.mingDaoLoading = false;
      this.confirmData = {};
    },
    // 同步信息到YMS
    batchSyncInfoYms (row) {
      if (this.$common.isEmpty(row)) return this.$Message.error('请选择一个需要同步的商品数据');
      if (row.length > 1) return this.$Message.error('只能选择一个商品进行同步');
      this.checkTableRow = this.$common.copy(row[0] || {});
      this.$nextTick(() => {
        this.syncYmsVisibleModal = true;
      });
    },
    // 删除复制SPU分类
    deleteCopyProduct(val) {
      this.copyProductTableData = this.copyProductTableData.filter(item => {
        return item.productCategoryId !== val
      })
      this.copyTreeSelectCategoryValue = this.copyTreeSelectCategoryValue.filter(item => {
        return item !== val
      })
    },
    // 产品复制
    confirmCopy() {
      if (this.copyProductData.productCategoryIdList.length === 0) {
        return this.$Message.error('请选择商品分类数据')
      }
      this.copyProductData.productCategoryIdList = this.copyProductData.productCategoryIdList.map(item => item.productCategoryId)
      // 将所有的priceDetailds字段值转为字符串
      for (let i = 0; i < this.copyProductGoodsQOList.length; i++) {
        this.copyProductGoodsQOList[i].priceDetails = this.copyProductGoodsQOList[i].priceDetails.toString();
      }
      let obj = {
        productId: this.copyProductData.productId,
        productCategoryIdList: this.copyProductData.productCategoryIdList,
        copyProductGoodsQOList: this.copyProductGoodsQOList
      }
      this.copyProductModalLoading = true
      this.axios.post(api.copyProductSpu, obj).then((response) => {
        if (response.data.code === 0) {
          this.$Message.success('复制成功');
        }
        this.copyProductModalLoading = false
        this.visibleCopyProduct = false;
      }).catch(() => {
        this.$Message.error('复制失败，请稍后重试')
        this.copyProductModalLoading = false
        this.visibleCopyProduct = false;
      })
    },
    // 同步数据处理
    synchronousRemind(name) {
      if (this.syncDataLoading) return;
      if (!this.productGoodsDataSpu.length) {
        this.$Message.error('无数据');
        return;
      }
      if (!this.selectedProductGoodsListSpu.length && !this.allPageStatus) {
        this.$Message.error('请选择数据');
        return;
      }

      const constParams = {
        // 成本价
        cost: {
          params: {
            type: 2
          },
          modal: {
            title: '同步商品成本价',
            content: `是否确认同步商品信息至Listing？
            <div style="margin-top:10px; color:#f20;">
              注意：该操作会同步覆盖Listing中的商品采购价格，以ERP系统为主。
            </div>`,
          }
        },
        // 属性
        attribute: {
          params: {
            type: 1
          },
          modal: {
            title: '同步商品属性信息',
            content: `是否确认同步商品信息至Listing？
            <div style="margin-top:10px; color:#f20;">
              注意：该操作会同步覆盖Listing中的商品基础资料，所有基础信息，多属性信息，属性信息，以ERP系统为主。
            </div>`,
          }
        },
        // 所有
        all: {
          params: {
            type: 0
          },
          modal: {
            title: '同步商品所有信息',
            content: `是否确认同步商品信息至Listing？
            <div style="margin-top:10px; color:#f20;">
              注意：该操作会同步覆盖Listing中的商品基础资料，所有基础信息，多属性信息，属性信息，以ERP系统为主。
            </div>`,
          }
        },
      }
      if (this.$common.isEmpty(constParams[name])) return;
      let syncParams = constParams[name].params;
      // 选中所有页全选
      if (this.allPageStatus) {
        syncParams = {
          ...syncParams,
          ...this.getListQuery(this.tabType),
          selectAll: 1
        }
      } else {
        syncParams.selectAll = 0;
        syncParams.productInfoIds = this.selectedProductGoodsListSpu.map(item => {
          return item.productId
        });
      }

      this.$Modal.confirm({
        width: 500,
        ...constParams[name].modal,
        onOk: () => {
          this.syncDataLoading = true;
          // 同步商品信息
          this.axios.post(api.synProductInfoToListing, syncParams).then(res => {
            if (res.data.code == 0 && res.data.datas) {
              const data = res.data.datas;
              const total = data.addSuccessNum + data.addFailNum + data.updateSuccessNum + data.updateFailNum;
              const text = `共同步${total}条数据，其中${data.addSuccessNum}新增成功，${data.addFailNum}新增失败，
              ${data.updateSuccessNum}更新成功，${data.updateFailNum}更新失败`
              this.$Message.success(text);
              this.$nextTick(() => {
                this.search();
              })
            } else {
              this.$Message.error('同步商品信息失败')
            }
            this.syncDataLoading = false;
          }).catch(() => {
            this.$Message.error('同步商品信息失败');
            this.syncDataLoading = false;
          })
        }
      })
    },
    // 标签切换
    changeTabType(value) {
      if (value == this.tabType) return;
      if (['spu', 'sku'].includes(value)) {
        this.pageParams.flag = value == 'spu' ? 1 : 0;
        if (this.tabType == 'skuWaitDone') {
          this.oldSearchCode = this.searchCode;
          this.searchCode = this.awaitSearchCode;
        }
      } else if (['spu', 'sku'].includes(this.tabType)) {
        this.awaitSearchCode = this.searchCode;
        this.searchCode = this.oldSearchCode;
      }
      this.tabType = value;
      this.$nextTick(() => {
        this.$refs.dytFilter && this.$refs.dytFilter.resizeHand();
      })
    },
    // 打开YMS停售记录弹窗
    openHaltSalesAdjust () {
      this.haltSalesAdjustVisible = true;
    },
    // 返回列表
    goBack() {
      this.productShow = 'list';
    },
    updateList() {
      this.getListBoth();
    },
    // 返回pageSize
    changePageSizeSpu(pageSize) {
      this.pageParams.pageSize = pageSize;
      this.getList(this.tabType);
    },
    changePageSizeSku(pageSize) {
      this.pageParams.pageSize = pageSize;
      this.getList(this.tabType);
    },
    // 返回page
    changePageSpu(page) {
      this.pageParams.pageNum = page;
      this.getList(this.tabType);
    },
    changePageSku(page) {
      this.pageParams.pageNum = page;
      this.getList(this.tabType);
    },
    infoImport() {
      this.$refs.importModal.modal = true;
    },
    getEditRole() {
      this.currentUserInfo = this.$store.state.erpConfig.userInfo;
      if (this.currentUserInfo.businessRoleTypeList.indexOf('commodityDeveloper') != -1) {
        this.isCommodityDeveloper = true;
      }
      if (this.currentUserInfo.businessRoleTypeList.indexOf('productDeveloperSupervisor') != -1) {
        this.isProductDeveloperSupervisor = true
      }
    },
    // 导入云卖产品表格
    ymsImport(type) {
      let importTypes = {
        'yms': {
          title: '产品导入',
          uploadUrl: api.productImport_ymsImport,
          data: {
            importType: '1'
          }
        },
        'special': {
          title: '特殊分销产品导入',
          uploadUrl: api.specialProductImport,
          data: {
            importType: '1'
          }
        },
        'replaceSku': {
          title: '替代SKU导入',
          uploadUrl: api.importReplaceSku,
          data: {
            importType: '0'
          }
        },
        'salesLinkImport': {
          title: '销售链接导入',
          uploadUrl: api.importPlatformUrl,
          data: {
            businessDeptIds: this.businessDeptIds
          }
        }
      }
      let item = importTypes[type];
      if (!item) return;
      this.cancelImport();
      this.importFile.type = type;
      this.importFile.title = item.title;
      if (this.$common.isEmpty(item.params)) {
        this.importFile.uploadUrl = item.uploadUrl;
      } else {
        this.importFile.uploadUrl = `${item.uploadUrl}?${this.$common.getParams(item.params)}`;
      }
      this.$nextTick(() => {
        this.uploadParams = { ...this.uploadParams, ...item.data };
        this.ymsModal = true;
      })
    },
    cancelImport() {
      this.ymsModal = false;
      this.file3 = null;
    },
    // 从分类管理跳转进来时，搜索框显示已选择的分类
    bindCategory() {
      let id = this.$route.query.categoryId;
      if (id) {
        this.treeSelectCategoryValue.push(id);
      }
    },
    // 复制 spu
    copyTableSpu(type) {
      const handCopy = {
        spu: () => {
          if (this.productGoodsDataSpu.length === 0) {
            this.$Message.warning('无可复制的SPU');
            return;
          }
          const spuList = this.productGoodsDataSpu.map(item => item.spu).join('\n');
          this.$common.copyToClip(spuList);
          this.$Message.success('SPU复制成功');
        },
        sku: () => {
          if (this.productGoodsDataSku.length === 0) {
            this.$Message.warning('无可复制的SKU');
            return;
          }
          const skuList = this.productGoodsDataSku.map(item => item.sku).join('\n');
          this.$common.copyToClip(skuList);
          this.$Message.success('SKU复制成功');
        }
      }
      handCopy[type]();
    },
    // 获取所有质检模板
    getAllQuality() {
      this.qualityTemplateList = [];
      this.axios.get(api.getAllQualityTemplate).then((res) => {
        if (res && res.data && res.data.code === 0) {
          this.qualityTemplateList = res.data.datas || [];
        }
      })
    },
    // 打开编辑采购信息弹窗
    openEditPurchaseInfo(val) {
      this.curPurchaseInfo = val
      this.editPurchaseInfoModal = true
    },
    // 获取当前商品产品报价信息
    getProductPrice() {
      this.axios.get(`${api.getProductPrice}?productId=${this.copyProductData.productId}`).then((res) => {
        if (res.data.code === 0) {
          this.productPriceInfoList = res.data.datas || [];
        }
      })
    },
    // 获取保存编辑采购信息
    getEditPurchaseInfo(val) {
      this.copyProductGoodsQOList = this.copyProductGoodsQOList.filter(item => item.productCategoryId !== val.resultArr[0].productCategoryId)
      this.copyProductGoodsQOList.push(val.resultArr)
      this.copyProductGoodsQOList = this.copyProductGoodsQOList.flat()
      // 将tableData里面的当前已经编辑的所在分类id进行替换
      for (let i = 0; i < this.copyProductTableData.length; i++) {
        if (this.copyProductTableData[i].productCategoryId === val.curData.productCategoryId) {
          this.copyProductTableData[i] = val.curData
        }
      }
    }
  }
};
</script>
<style scoped lang="less">
.product-goods-main{
  position: relative;
  .order-table-top{
    display: flex;
    justify-content: space-between;
    align-items: center;
    .tabs-tab-pane-content{
      flex: 100;
      margin-bottom: -8px;
      :deep(.ivu-tabs-bar){
        margin-bottom: 10px;
      }
    }
    .table-top-right{
      display: flex;
      align-items: center;
      padding-left: 20px;
      height: 33px;
      border-bottom: 1px solid #dcdee2;
    }
    .stoppage-record{
      padding-right: 15px;
      color: #03A9F4;
      font-weight: bold;
      line-height: 33px;
      text-decoration: underline;
      text-underline-position: under;
      cursor: pointer;
    }
  }
}
.click-text-underline {
  display: inline-block;
  position: relative;
  padding: 0px 5px;
  cursor: pointer;
  color: #57a3f3;
  text-decoration: underline;
  text-underline-offset: 3px;

  &.click-text-disabled {
    color: #f3f3f3;
    cursor: no-drop;
  }
}
.commonFilter{
  .card-container{
    margin-bottom: 10px;
  }
}
.washed-operate {
  display: flex;

  >button {
    margin-left: 15px;
  }

  .washed-image-content {
    position: relative;
    width: 60px;
    height: 60px;
    box-shadow: 0 0 5px #ccc;
    border-radius: 5px;

    img {
      cursor: pointer;
      height: 100%;
      width: 100%;
    }
  }

  .washed-image-preview-content {
    position: relative;

    img {
      max-width: 600px;
      max-height: 600px;
      min-width: 200px;
    }
  }
}

.newproductgoods-filter {
  .col_margin_bottom {
    .ivu-col {
      margin-bottom: 0px !important;
    }
  }
}

.showTable {
  margin-top: 5px;
  position: absolute;
  width: 100%
}

.productGoods_skuTextOver {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipse;
  word-break: break-all
}
</style>
<style lang="less">
.product-tooltip {
  vertical-align: middle;
  margin: 0 0 0 8px;

  .ivu-tooltip-popper {
    top: 0 !important;
    width: 320px;
  }
}

.productGoods_skuTextOver {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.distribution-price-suffix {
  height: 100%;
  line-height: 32px;
}

// 替换SKU 列设置
.replace-sku-col {
  display: flex;
  align-items: center;

  .replace-sku-label {
    display: inline-block;
    width: 75px;
    text-align: right;
  }

  .replace-sku-row {
    display: flex;
  }

  .replace-sku-box {
    max-width: calc(100% - 31px);
    padding-right: 5px;
  }

  .replace-sku-btn {
    width: 30px;
    color: #2d8cf0;
    cursor: pointer;
    text-decoration: underline;
    text-underline-position: under;
  }

  .replace-sku-txt {
    display: inline-block;
    flex: 100;
    text-align: left;
  }
}

.products-radio {
  display: flex;
  align-items: center;
}
</style>
