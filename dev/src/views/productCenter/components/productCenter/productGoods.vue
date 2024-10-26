<template>
  <div>
    <div v-if="productShow == 'list'">
      <div class="commonFilter">
        <div class="card-container">
          <div class="card-content">
            <Form ref="pageParams" class="normalTop" :model="pageParams" :label-width="labelWidth">
              <Row type="flex" :gutter="gutterItem" class="col_margin_bottom">
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol">
                <Form-item label="商品状态" style="width: calc(100% - 30px);display: inline-block;vertical-align: middle;">
                  <dyt-select v-model="pageParams.statusList" filterable multiple>
                    <Option v-for="(item, index) in productStatus" :value='item.value' :key="`status-${index}`">
                      {{item.label}}
                   </Option>
                  </dyt-select>
                </Form-item>
                <Tooltip class="product-tooltip" placement="right-start" style="vertical-align: middle;margin:0 0 15px 8px;">
                  <Icon type="ios-help-circle-outline" style="color: #f60; font-size: 18px;cursor: pointer;font-weight: bold;" />
                  <div slot="content">
                    <p v-for="(text, index) in statusTips" :key="`tips-${index}`">{{text}}</p>
                  </div>
                </Tooltip>
                </Col>

                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" v-if="!isSupplierTalg">
                <Form-item label="上架绑定分类">
                  <!-- <treeSelect refs="categoryTree" :treeData="productCategoryTree"
                    v-model="pageParams.productCategoryList" filterable showCheckbox>
                  </treeSelect> -->
                  <erpTreeSelect v-model="treeSelectCategoryValue" :multiple="true" :normalizer="treeNormalizer" :options="selectTreeProductCategory" :default-expand-level="1" placeholder="请选择" noResultsText="无匹配数据" @input="treeSelectCategoryChange" />
                </Form-item>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol">
                <Form-item label="云卖分类">
                  <treeSelect ref="ymsProductCategoryTree1" :treeData="menuList" @on-change="getYmsClassifyTree" filterable clearable :value="classifyValue" placeholder="请选择云卖分类">
                  </treeSelect>
                </Form-item>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol">
                <Form-item label="搜索字符">
                  <Input placeholder="可输入SPU、SKU、商品名称、品牌、特性标签" v-model.trim="pageParams.searchValue"></Input>
                </Form-item>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol">
                <div style="display: flex;">
                  <dyt-select v-model="pageParams.codeType" style="width:98px">
                    <Option :value="1">SKU</Option>
                    <Option :value="2">SPU</Option>
                  </dyt-select>
                  <Input type="textarea" :autosize="true" placeholder="请输入(支持多个，按行分隔)" v-model.trim="searchCode"></Input>
                </div>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" v-show="moreFilter">
                <Form-item label="商品中文名称">
                  <Input placeholder="请输入(支持查询多个关键字，用空格分隔)" v-model.trim="cnName" type="textarea" @keyup="aaa()"></Input>
                </Form-item>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" v-show="moreFilter">
                <Form-item label="品牌">
                  <dyt-select v-model="pageParams.productBrandIds" filterable multiple>
                    <Option v-for="(item,index) in productBrandList" :key="index" :class="{ productBrandRed : item.status === 0 }" :value="item.productBrandId">{{ item.name }}
                   </Option>
                  </dyt-select>
                </Form-item>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" v-show="moreFilter">
                <Form-item label="商品英文名称">
                  <Input placeholder="请输入(支持查询多个关键字，用空格分隔)" v-model.trim="enName" type="textarea"></Input>
                </Form-item>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" v-show="moreFilter && !isSupplierTalg">
                <Form-item label="特性标签">
                  <dyt-select @on-enter="addCustomTag" ref="productGoodsTagsSelect" v-model="pageParams.tagNames" filterable multiple>
                    <Option v-for="(name,index) in customProductTagList" :key="index" :value="name">
                      {{ name }}
                   </Option>
                  </dyt-select>
                </Form-item>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" v-show="moreFilter  && !isSupplierTalg">
                <Form-item label="UPC">
                  <Input v-model.trim="pageParams.upc"></Input>
                </Form-item>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" v-show="moreFilter  && !isSupplierTalg">
                <Form-item label="EAN">
                  <Input v-model.trim="pageParams.ean"></Input>
                </Form-item>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" v-show="moreFilter  && !isSupplierTalg">
                <Form-item label="ISBN">
                  <Input v-model.trim="pageParams.isbn"></Input>
                </Form-item>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" v-show="moreFilter  && !isSupplierTalg">
                <Form-item label="报关中文名称">
                  <Input v-model.trim="pageParams.cnHsName"></Input>
                </Form-item>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" v-show="moreFilter  && !isSupplierTalg">
                <Form-item label="报关英文名称">
                  <Input v-model.trim="pageParams.enHsName"></Input>
                </Form-item>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" v-show="moreFilter  && !isSupplierTalg">
                <Form-item label="海关编码">
                  <Input v-model.trim="pageParams.hsCode"></Input>
                </Form-item>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" v-show="moreFilter">
                <Form-item label="创建时间">
                  <DatePicker style="width: 100%" v-model="createdTimeProduct" placeholder="选择日期" @on-change="getDateValue" type="datetimerange" format="yyyy-MM-dd HH:mm:ss" placement="bottom-end">
                  </DatePicker>
                </Form-item>
                </Col>
                <!-- <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" v-show="moreFilter && !isCargoOwner()">
                  <Form-item label="货主">
                    <dyt-select v-model="pageParams.cargoOwnerId">
                      <Option value="_NO_CARGO_OWNER">无货主</Option>
                      <template v-for="(item, hIndex) in $store.state.userInfoList">
                        <template v-if="isCargoOwner(item.businessRoleTypeList)">
                          <Option :value="item.userId" :key="hIndex">{{item.userName}}</Option>
                        </template>
                      </template>
                    </dyt-select>
                  </Form-item>
                </Col> -->
              </Row>
              <Row type="flex" justify="space-between" :gutter="gutterItem" class="filter_options_button">
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" :offset="1">
                <Button type="primary" size="small" @click="search" :disabled="SearchDisabled" icon="md-search">查询
                </Button>
                <Button style="marginLeft:10px;" @click="reset" size="small" v-once icon="md-refresh">重置</Button>
                </Col>
                <Col :xxl="fourItemCol" :xl="threeItemCol" :lg="twoItemCol" :md="oneItemCol" style="text-align: right;">
                <Button size="small" @click="toggleMoreFilter">{{ moreFilterMes }}
                  <Icon :type="moreFilterIcon" size="small"></Icon>
                </Button>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      </div>
      <div class="dataSort grayBg">
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
      </div>
      <div class="tableControl">
        <Button style="margin-right:10px;" type="primary" @click="addProduct" class="iconbuttons" :disabled="!getPermission('productInfo_insert')">
          手工添加商品
        </Button>

        <Buttons type="primary" trigger="click" @on-click="importExcel" :disabled="!getPermission('productInfo_excelImport')">
          <Button type="primary" @click="importExcel(0)" :disabled="!getPermission('productInfo_excelImport')">
            EXCEL导入
          </Button>
          <Buttons-menu slot="list">
            <Buttons-item :name="2" :disabled="!getPermission('productGoods_assembleImport')">组装信息导入
            </Buttons-item>
            <Buttons-item :name="1" :disabled="!getPermission('productImportTaskInfo_query')">查看导入任务
            </Buttons-item>
          </Buttons-menu>
        </Buttons>

        <Buttons type="primary" style="margin-left: 24px" t trigger="click" @on-click="importTagExcel">
          <!-- 标签导入 -->
          <Button type="primary" @click="importTagExcel(0)">
            标签导入
          </Button>
          <Buttons-menu slot="list">
            <Buttons-item :name="1">查看导入任务</Buttons-item>
          </Buttons-menu>
        </Buttons>

        <Buttons type="primary" style="margin-left: 24px" trigger="click" @on-click="exportExcel" :disabled="!getPermission('productGoods_exportByIds')">
          <Button type="primary" @click="exportExcel(0)" :disabled="!getPermission('productGoods_exportByIds')">
            EXCEL导出
          </Button>
          <Buttons-menu slot="list">
            <Buttons-item :name="1" :disabled="!getPermission('productGoods_excelExport')">导出（所有结果集）
            </Buttons-item>
          </Buttons-menu>
        </Buttons>
        <!-- <Buttons type="primary" style="margin-left: 24px" trigger="click" @on-click="deleteControl" :disabled="!getPermission('productGoods_batchDelete')">
          <Button type="primary" @click="deleteControl(0)" :disabled="!getPermission('productGoods_batchDelete')">
             批量删除
          </Button>
          <Buttons-menu slot="list">
              <Buttons-item :name="1" :disabled="!getPermission('productGoods_batchDelete_all')">删除（所有结果集）</Buttons-item>
          </Buttons-menu>
        </Buttons> -->
        <!-- 批量操作 -->
        <Dropdown @on-click='batchOption' style="margin-left: 24px">
          <Button type="default" icon='ios-copy-outline'>批量操作</Button>
          <DropdownMenu slot="list">
            <DropdownItem :disabled="!getPermission('productGoods_batchDelete')" name='1' style="textAlign:center;">删除
            </DropdownItem>
            <DropdownItem name='2' style="textAlign:center;">修改
            </DropdownItem>
            <!-- 批量打印 -->
            <DropdownItem name='3' style="textAlign:center;">批量打印
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      <div style="marginTop:10px;">
        <Checkbox v-model="allPageStatus">所有页全选</Checkbox>
      </div>
      <!--供应商商户的列表-->
      <div class="orderTable normalTop" v-if="isSupplierTalg">
        <Tabs v-model="trackingTab" class="plr10" :animated="false" @on-click="selectTabs">
          <TabPane v-for="(item, index) in statusList" :key="index" :label="item.name" :name="item.value">
            <div class="normalTop" v-if="trackingTab === item.value">
              <Table highlight-row :loading="tableLoading" border :height="tableHeight" :columns="supplierProductGoodsColumn" :data="productGoodsData" @on-selection-change="getSelectValue" @on-select="onSelect" @on-select-cancel="onSelectCancel" @on-select-all="onSelectAll">
              </Table>
              <div class="table-page">
                <div class="table-page-right">
                  <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator :current="pageParams.pageNum" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray">
                  </Page>
                </div>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </div>
      <!--普通商户列表-->
      <div class="orderTable normalTop" v-else>
        <Table highlight-row :loading="tableLoading" border :height="tableHeight" :columns="productGoodsColumn" :data="productGoodsData" @on-selection-change="getSelectValue" @on-select="onSelect" @on-select-cancel="onSelectCancel" @on-select-all="onSelectAll">
        </Table>
        <div class="table-page">
          <div class="table-page-right">
            <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator :current="pageParams.pageNum" show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray">
            </Page>
          </div>
        </div>
      </div>
    </div>
    <!-- 手工添加商品 -->
    <div v-if="['edit', 'add'].includes(productShow)">
      <addProduct :productBrandList="productBrandList" :productTagList="productTagList" :editStatus="editStatus" :productId="productId" :ymsMenuList="menuList" :originalCategoryData="originalCategoryData" :product-show.sync="productShow" :productCategoryListData="productCategoryList" />
    </div>
    <!-- 编辑spu -->
    <sliderModal v-model="editProductModal" v-if="renderSpuDetailModal" :spinShow="spinShow" :styles="wrapClass" class="slider-model editProductDome">
      <div v-if="editProductModal">
        <editProduct :productBrandList="productBrandList" :productTagList="productTagList" :productId="productId" :ymsMenuList="menuList" :originalCategoryData="originalCategoryData" :edit-product-modal.sync="editProductModal" :productCategoryListData="productCategoryList" :editStatus="editStatus" />
      </div>
    </sliderModal>
    <!-- 编辑sku -->
    <sliderModal v-model="productGoodsDetailModal" v-if="renderProductGoodsDetailModal" :spinShow="spinShow" :styles="wrapClass" class="slider-model">
      <productGoodsDetailModal :productGoodsDetailModal="productGoodsDetailModal" :productTagList="productTagList" :editProductGoods="editProductGoods" :editStatus="editStatus"></productGoodsDetailModal>
    </sliderModal>
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
    >
      <div class="skuUpdate mt10">
        导入模板发现相同SKU时：
        <RadioGroup v-model="assembleUploadData.updateIgnore">
          <Radio label="0">覆盖</Radio>
          <Radio label="1">忽略</Radio>
        </RadioGroup>
      </div>
    </importModal>
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
            <dyt-select v-model="uploadData.ymsProductCategoryId" filterable @on-query-change="filterCategoryChange" @on-change="ymsProductCategoryChange">
              <Option v-for="(item, yIndex) in menuFilterList" :value="item.ymsProductCategoryId" :label="item.productCategoryNavigation" :key="`menuFilterList-${yIndex}`"></Option>
            </dyt-select>
          </Form-item>
        </Form>
      </div>
      <div v-else style="position: relative">
        <p class="urlText">选择导入文件：</p>
        <div>
          <dytUpload ref="upload" name="files" :data="uploadData" :headers="headObj" :show-upload-list="false" :on-success="handleSuccess" :on-format-error="handleFormatError" :action="uploadFiles" :format="['xlsx','xls']" :before-upload="handleUpload">
            <Button style="marginLeft:10px;marginTop:10px;">选择文件</Button>
          </dytUpload>
          <div v-if="file !== null" style="marginTop:10px"> 上传文件：{{ file.name }}
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
          <dytUpload ref="upload1" name="files" :data="uploadData" :headers="headObj" :show-upload-list="false" :on-success="handleSuccess1" :on-format-error="handleFormatError" :action="upType === 'add' ?uploadFiles1:uploadFiles2" :format="['xlsx','xls']" :before-upload="handleUpload1">
            <Button style="marginLeft:10px;marginTop:10px;">选择文件</Button>
          </dytUpload>
          <div v-if="file1 !== null" style="marginTop:10px"> 上传文件：{{ file1.name }}
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
             <Button style="marginLeft:10px;marginTop:10px;">选择文件</Button>
           </dytUpload>
           <div v-if="file2 !== null" style="marginTop:10px"> 上传文件：{{ file2.name }}</div>
         </div>
       </div>-->
      <div style="margin-top: 15px;float: right">
        <!-- 下载模板 -->
        <Button type="text" @click="loadTemplate1">下载模板</Button>
      </div>
      <p class="skuText">注：商品标签不能包含逗号</p>
    </Modal>
    <!-- 批量修改 -->
    <Modal v-model="updateModal" v-if="updateModalStatus" @on-ok="updateOk" @on-cancel="updateCancel" title="批量修改商品" :width="850" :loading="updateLoading">
      <Form ref="updateParams" class="normalTop" :model="updateParams" :label-width="100" label-position="left">
        <!-- 商品中文名称 -->
        <Row>
          <Col span="1" style="marginTop:5px;">
          <Checkbox v-model="updateParams.cnNameSelected"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="商品中文名称：" prop="cnNameSelected">
            <Input style="width:460px" :maxlength="1000" v-model.trim="updateParams.updateCnName" :disabled="!updateParams.cnNameSelected"></Input>
          </Form-item>
          </Col>
        </Row>
        <!-- 商品英文名称 -->
        <Row>
          <Col span="1" style="marginTop:5px;">
          <Checkbox v-model="updateParams.enNameSelected"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="商品英文名称：" prop="enNameSelected">
            <Input style="width:460px" :maxlength="1000" v-model.trim="updateParams.updateEnName" :disabled="!updateParams.enNameSelected"></Input>
          </Form-item>
          </Col>
        </Row>
        <!-- UPC,EAN,ISBN -->
        <Row v-if="!isSupplierTalg">
          <Col span="1" style="marginTop:5px;">
          <Checkbox v-model="updateParams.upcSelected"></Checkbox>
          </Col>
          <Col span="8">
          <Form-item label="UPC：" prop="updateUpc">
            <Input style="width:150px" :maxlength="100" v-model.trim="updateParams.updateUpc" :disabled="!updateParams.upcSelected"></Input>
          </Form-item>
          </Col>
          <Col span="1" style="marginTop:5px;">
          <Checkbox v-model="updateParams.eanSelected"></Checkbox>
          </Col>
          <Col span="7">
          <Form-item label="EAN：" :label-width="50" prop="updateEan">
            <Input style="width:150px" :maxlength="100" v-model.trim="updateParams.updateEan" :disabled="!updateParams.eanSelected"></Input>
          </Form-item>
          </Col>
          <Col span="1" style="marginTop:5px;">
          <Checkbox v-model="updateParams.isbnSelected"></Checkbox>
          </Col>
          <Col span="6">
          <Form-item label="ISBN：" :label-width="50" prop="updateIsbn">
            <Input style="width:150px" :maxlength="100" v-model.trim="updateParams.updateIsbn" :disabled="!updateParams.isbnSelected"></Input>
          </Form-item>
          </Col>
        </Row>
        <!-- 所属分类 -->
        <Row v-if="!isSupplierTalg">
          <Col span="1" style="marginTop:5px;">
          <Checkbox v-model="updateParams.productCategoryIdSelected"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="所属分类：" prop="productCategoryId">
            <treeSelect ref="productCategoryTree" style="width:300px" :treeData="updateCategoryTree" @on-change="getTreeData" filterable :disabled="!updateParams.productCategoryIdSelected"></treeSelect>
          </Form-item>
          </Col>
        </Row>
        <!--云卖分类-->
        <Row>
          <Col span="1" style="marginTop:5px;">
          <Checkbox v-model="updateParams.ymsProductCategoryIdSelected"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="云卖分类：" prop="ymsProductCategoryId">
            <treeSelect ref="productCategoryTree1" style="width:300px" :treeData="menuList" @on-change="getYmsTreeData" filterable :disabled="!updateParams.ymsProductCategoryIdSelected" placeholder="请选择云卖分类"></treeSelect>
          </Form-item>
          </Col>
        </Row>
        <!-- 品牌 -->
        <Row>
          <Col span="1" style="marginTop:5px;">
          <Checkbox v-model="updateParams.productBrandIdSelected"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="品牌：" prop="updateProductBrandId">
            <dyt-select v-model.trim="updateParams.updateProductBrandId" :transfer="true" filterable clearable style="width:300px" :disabled="!updateParams.productBrandIdSelected">
              <Option v-for="(item, index) in productBrandList" :key="index" :class="{ productBrandRed : item.status == 0 }" :value="item.productBrandId">{{ item.name }}
             </Option>
            </dyt-select>
          </Form-item>
          </Col>
        </Row>
        <!-- 特性标签 -->
        <Row v-if="!isSupplierTalg">
          <Col span="1" style="marginTop:5px;">
          <Checkbox v-model="updateParams.productGoodsTagsSelected"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="特性标签：" prop="updateProductGoodsTags">
            <dyt-select :disabled="!updateParams.productGoodsTagsSelected" ref="productGoodsTagsSelect" v-model="updateParams.updateProductGoodsTags" transfer filterable multiple style="width:300px">
              <Option v-for="(name, index) in customProductTagList" :key="index" :value="name">{{ name }}</Option>
            </dyt-select>
          </Form-item>
          </Col>
        </Row>
        <!-- 采购成本价 -->
        <Row>
          <Col span="1" style="marginTop:5px;">
          <Checkbox v-model="updateParams.suggestPriceSelected"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="采购成本价：" prop="updateSuggestPrice">
            <InputNumber :disabled="!updateParams.suggestPriceSelected" :min="0" style="width:300px" v-model="updateParams.updateSuggestPrice" clearable></InputNumber>
          </Form-item>
          </Col>
        </Row>
        <!-- 商品状态 -->
        <Row v-if="!isSupplierTalg">
          <Col span="1" style="marginTop:5px;">
          <Checkbox v-model="updateParams.statusSelected"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item prop="updateStatus">
            <label slot="label">
              <span>商品状态：</span>
              <Tooltip class="product-tooltip" placement="right-start" style="vertical-align: middle;">
                <Icon type="ios-help-circle-outline" style="color: #f60; font-size: 18px;cursor: pointer;font-weight: bold;" />
                <div slot="content">
                  <p v-for="(text, index) in statusTips" :key="`tips-${index}`">{{text}}</p>
                </div>
              </Tooltip>
            </label>
            <RadioGroup v-model="updateParams.updateStatus">
              <Radio v-for="(item, index) in productStatus" :key="`raidio-${index}`" :disabled="!updateParams.statusSelected" :label="item.value">{{item.label}}</Radio>
            </RadioGroup>
          </Form-item>
          </Col>
        </Row>
        <!-- 报关中文名称 -->
        <Row v-if="!isSupplierTalg">
          <Col span="1" style="marginTop:5px;">
          <Checkbox v-model="updateParams.cnHsNameSelected"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="报关中文名称：" prop="updateCnHsName">
            <Input :disabled="!updateParams.cnHsNameSelected" style="width:330px" :maxlength="200" v-model.trim="updateParams.updateCnHsName"></Input>
          </Form-item>
          </Col>
        </Row>
        <!-- 报关英文名称 -->
        <Row v-if="!isSupplierTalg">
          <Col span="1" style="marginTop:5px;">
          <Checkbox v-model="updateParams.enHsNameSelected"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="报关英文名称：" prop="updateEnHsName">
            <Input :disabled="!updateParams.enHsNameSelected" style="width:330px" :maxlength="200" v-model.trim="updateParams.updateEnHsName"></Input>
          </Form-item>
          </Col>
        </Row>
        <!-- 海关编码 -->
        <Row v-if="!isSupplierTalg">
          <Col span="1" style="marginTop:5px;">
          <Checkbox v-model="updateParams.hsCodeSelected"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="海关编码：" prop="updateHsCode">
            <Input :disabled="!updateParams.hsCodeSelected" style="width:330px" :maxlength="200" v-model.trim="updateParams.updateHsCode"></Input>
          </Form-item>
          </Col>
        </Row>
        <!-- 产品类型 -->
        <Row v-if="!isSupplierTalg">
          <Col span="1" style="marginTop:5px;">
          <Checkbox v-model="updateParams.acceptableTypeSelected"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="产品类型：" prop="acceptableType">
            <dyt-select :disabled="!updateParams.acceptableTypeSelected" @on-change="changeSelect" ref="productGoodsTagsSelect" v-model="updateParams.acceptableType" transfer filterable multiple style="width:300px">
              <Option v-for="(item, index) in productTypeList" :key="index" :value="item.value" :disabled="item.disabled">{{ item.name }}
             </Option>
            </dyt-select>
          </Form-item>
          </Col>
        </Row>
        <!-- 商品开发人员 -->
        <Row v-if="!isSupplierTalg">
          <Col span="1" style="marginTop:5px;">
          <Checkbox v-model="updateParams.productDeveloperUserIdSelected"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="商品开发员：" prop="productDeveloperUserId">
            <dyt-select :disabled="!updateParams.productDeveloperUserIdSelected" ref="productGoodsTagsSelect" v-model="updateParams.productDeveloperUserId" style="width:300px">
              <Option v-for="item in businessRoleTypeList" :value="item.userId" :key="item.userId">{{ item.userName }}
             </Option>
            </dyt-select>
          </Form-item>
          </Col>
        </Row>
        <!-- 商品重量 -->
        <Row>
          <Col span="1" style="marginTop:5px;">
          <Checkbox v-model="updateParams.weightSelected"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="商品重量（g）:" prop="weight">
            <InputNumber :disabled="!updateParams.weightSelected" :min="0" :precision="0" style="width:330px" v-model.trim="updateParams.weight"></InputNumber>
          </Form-item>
          </Col>
        </Row>
        <!-- 商品尺寸 -->
        <Row>
          <Col span="1" style="marginTop:5px;">
          <Checkbox v-model="updateParams.sizeSelected"></Checkbox>
          </Col>
          <Col span="20">
          <Form-item label="商品尺寸（cm）:">
            <InputNumber :disabled="!updateParams.sizeSelected" :min="0" :max="9999.99" style="width:90px" placeholder="长：" v-model.trim="updateParams.length"></InputNumber>
            <InputNumber :disabled="!updateParams.sizeSelected" :min="0" :max="9999.99" style="width:90px; marginLeft:27px;" placeholder="宽：" v-model.trim="updateParams.width"></InputNumber>
            <InputNumber :disabled="!updateParams.sizeSelected" :min="0" :max="9999.99" style="width:90px; marginLeft:27px;" placeholder="高：" v-model.trim="updateParams.height"></InputNumber>
          </Form-item>
          </Col>
        </Row>
        <!-- 批量修改货主 -->
        <!-- <Row v-if="!isCargoOwner()">
          <Col span="1" style="marginTop:5px;">
            <Checkbox v-model="updateParams.cargoOwnerType" :true-value=1 :false-value=0 ></Checkbox>
          </Col>
          <Col span="20">
            <Form-item label="货主:">
              <dyt-select v-model="updateParams.cargoOwnerId" :disabled="updateParams.cargoOwnerType !== 1">
                <template v-for="(item, tIndex) in $store.state.userInfoList">
                  <template v-if="isCargoOwner(item.businessRoleTypeList)">
                    <Option :value="item.userId" :key="`r-${tIndex}`">{{item.userName}}</Option>
                  </template>
                </template>
              </dyt-select>
            </Form-item>
          </Col>
        </Row> -->
      </Form>
    </Modal>
    <!-- 查看导入任务 -->
    <exportTaskModal :taskModal="taskModal" :type="1" v-if="renderTaskModal"></exportTaskModal>
    <!-- 删除确认框 -->
    <delConfirmModal ref="delConfirmModal" @ok="del"></delConfirmModal>
    <!-- 操作日志 -->
    <Modal v-model="modal11" title="操作日志" width="800" @on-visible-change="logVisible">
      <Table :columns="columns1" :loading="spinShow" :data="data1"></Table>
      <div class="table-page pb20">
        <div class="table-page-right">
          <Page :total="logTotal" @on-change="changeLogPage" show-total :page-size="logParams.pageSize" show-elevator :current="logParams.pageNum" show-sizer @on-page-size-change="changeLogPageSize" placement="top" :page-size-opts="pageArray"></Page>
        </div>
      </div>
      <div slot="footer"></div>
    </Modal>
    <print ref="print" :printData="printData" :printColumns="printColumns"></print>
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
import print from '@/components/common/print';
import publicService from '@/components/mixin/publicService_mixin';
import importModal from '@/components/common/importModal';
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
    importModal
    // ButtonGroups,
  },
  data () {
    var self = this;
    return {

      businessRoleUserId: '',
      productStatus: productData.productStatus,
      statusTips: productData.statusTips,
      selectTreeProductCategory: [],
      selectTreeProductData: {},
      treeSelectCategoryValue: [],
      productShow: 'list',
      assembleUploadData: {
        updateIgnore: '0'
      },
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
      modal11: false,
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
          expand: true,
          productCategoryId: 'productCategoryId',
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
      selectedProductGoodsList: [], // 已选货品列表
      productDetail: {}, // 详情页面数据
      pageParamsStatus: false, // 是否重新加载货品列表数据
      productGoodsListDictionary: {
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
      pageParamsPrototype: null, // 当前货品信息原型(重置用到)
      cnName: null,
      enName: null,
      pageParams: {
        // 旧页面标识
        flag: 0,
        // 货品列表筛选参数
        statusList: [],
        searchValue: null,
        codeType: 1,
        code: null,
        cnNameList: null,
        enNameList: null,
        productBrandIds: [],
        tagNames: [],
        productCategoryList: [],
        orderBy: 'createdTime',
        upDown: 'down',
        pageSize: 50,
        pageNum: 1,
        upc: '',
        ean: '',
        isbn: '',
        cnHsName: '',
        enHsName: '',
        hsCode: '',
        startCreatedTime: '',
        endCreatedTime: '',
        ymsProductCategoryId: null,
        cargoOwnerType: null,
        cargoOwnerId: null
      },
      logParams: {
        pageSize: 10,
        pageNum: 1,
        productGoodsId: ''
      },
      searchCode: null,
      allPageStatus: false,
      buttonGroupModel: [
        // 排序按钮组
        {
          type: 'createdTime',
          selected: true,
          status: false,
          title: '按添加时间'
        },
        {
          type: 'status',
          selected: false,
          status: true,
          title: '按商品状态'
        }
      ],
      productGoodsData: [], // 货品数据
      supplierProductGoodsColumn: [
        {
          type: 'selection',
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
                    vIf: self.controlList.productGoods_update
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
                    vIf: self.controlList.productGoods_update
                  },
                  on: {
                    click: () => {
                      self.editStatus = 'look';
                      self.editSpu(params.row.productId, 1);
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
                    vIf: self.controlList.productGoods_update
                  },
                  on: {
                    click: () => {
                      self.editStatus = 'look';
                      self.editSpu(params.row.productId, 1);
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
                  vIf: self.controlList.productGoods_update
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
            let goodsImageMap = self.productGoodsListDictionary.goodsImageMap;
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
                  vIf: self.controlList.productGoods_update
                },
                on: {
                  click: function () {
                    self.editStatus = 'look';
                    if (params.row.type === 2) {
                      // 变参
                      self.editSku(params.row);
                    } else if (params.row.type === 1) {
                      // 普通
                      self.editSpu(params.row.productId, 1);
                    }
                  }
                }
              },
              params.row.sku
            );
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
          title: '商品英文名称',
          key: 'enName',
          minWidth: 120,
          align: 'center'
        },
        {
          title: '创建人',
          key: 'createdBy',
          minWidth: 120,
          align: 'center',
          render: (h, params) => {
            let userInfoMap = self.productCommonDictionary.userInfoMap || {};
            if (userInfoMap && userInfoMap[params.row.createdBy]) {
              return h('span', userInfoMap[params.row.createdBy].userName);
            }
          }
        },
        {
          title: '创建时间',
          key: 'createdTime',
          align: 'center',
          minWidth: 130,
          render: (h, params) => {
            return h(
              'div',
              this.getDataToLocalTime(params.row.createdTime, 'fulltime')
            );
          }
        },
        {
          title: '操作',
          width: 227,
          fixed: 'right',
          align: 'center',
          render: (h, params) => {
            return h('local-down-button', {
              props: {
                data: {
                  btn: {
                    text: '查看', // 标记为付款
                    clickFn: () => {
                      self.editStatus = 'look';
                      if (params.row.type === 1) {
                        self.editSpu(params.row.productId, 1);
                      } else {
                        self.editSku(params.row);
                      }
                    }
                  },
                  list: [
                    {
                      text: '编辑SPU',
                      value: 1,
                      hide: !self.controlList.productGoods_update,
                      clickFn: () => {
                        if (self.getPermission('productInfo_detail')) {
                          self.editStatus = 'edit';
                          if (params.row.type === 1) {
                            self.editSpu(params.row.productId, 1);
                          } else {
                            self.editSpu(params.row.productId, 2);
                          }
                        }
                      }
                    },
                    {
                      text: '编辑SKU', // 编辑sku
                      value: 1,
                      hide:
                        !self.controlList.productGoods_update ||
                        params.row.type === 1,
                      clickFn: () => {
                        if (self.getPermission('productGoods_detail')) {
                          self.editStatus = 'edit';
                          self.editSku(params.row);
                        }
                      }
                    },
                    {
                      text: '操作日志', // 操作日志
                      value: 2,
                      hide: !self.getPermission(
                        'productGoodsOperationLog_query'
                      ),
                      clickFn: () => {
                        self.logParams.productGoodsId =
                          params.row.productGoodsId;
                        self.modal11 = true;
                      }
                    },
                    {
                      text: '打印标签', // 打印标签
                      value: 3,
                      clickFn: () => {
                        self.printData = [params.row];
                        self.$refs.print.printModal = true;
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
                        !self.controlList.productGoods_delete ||
                        (params.row.auditStatus !== 0), // 只有草稿状态的商品可以删除
                      clickFn: () => {
                        if (self.getPermission('productGoods_delete')) {
                          self.deleteControl(2, params.row.productGoodsId);
                        }
                      }
                    }
                  ]
                }
              }
            });
          }
        }
      ], // 供应商商户的货品列表
      productGoodsColumn: [
        // 货品列定义
        {
          type: 'selection',
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
                    vIf: self.controlList.productGoods_update
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
                    vIf: self.controlList.productGoods_update
                  },
                  on: {
                    click: () => {
                      self.editStatus = 'look';
                      self.editSpu(params.row.productId, 1);
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
                    vIf: self.controlList.productGoods_update
                  },
                  on: {
                    click: () => {
                      self.editStatus = 'look';
                      self.editSpu(params.row.productId, 1);
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
                  vIf: self.controlList.productGoods_update
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
            let goodsImageMap = self.productGoodsListDictionary.goodsImageMap;
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
                  vIf: self.controlList.productGoods_update
                },
                on: {
                  click: function () {
                    self.editStatus = 'look';
                    if (params.row.type === 2) {
                      // 变参
                      self.editSku(params.row);
                    } else if (params.row.type === 1) {
                      // 普通
                      self.editSpu(params.row.productId, 1);
                    }
                  }
                }
              },
              params.row.sku
            );
          }
        },
        {
          title: '是否组装产品',
          key: 'isAssemble',
          align: 'center',
          minWidth: 120,
          render: (h, params) => {
            // 0否 1是
            let str = params.row.isAssemble === 1 ? '是' : '否';
            return h(
              'span',
              {
                style: {
                  color: 'red'
                }
              },
              str
            );
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
          title: '商品英文名称',
          key: 'enName',
          minWidth: 120,
          align: 'center'
        },
        {
          title: '所属分类',
          key: 'productCategoryId',
          minWidth: 120,
          align: 'center',
          render: (h, params) => {
            let productCategoryMap =
              self.productGoodsListDictionary.productCategoryMap;
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
          title: '商品开发员', // 商品开发员
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
        // {
        //   title: '货主',
        //   key: 'cargoOwnerId',
        //   minWidth: 120,
        //   align: 'center',
        //   render: (h, params) => {
        //     let userInfoMap = self.$store.state.userInfoList;
        //     if (userInfoMap && userInfoMap[params.row.cargoOwnerId]) {
        //       return h('span', userInfoMap[params.row.cargoOwnerId].userName);
        //     }
        //   }
        // },
        {
          title: '创建人',
          key: 'createdBy',
          minWidth: 120,
          align: 'center',
          render: (h, params) => {
            let userInfoMap = self.productCommonDictionary.userInfoMap || {};
            if (userInfoMap && userInfoMap[params.row.createdBy]) {
              return h('span', userInfoMap[params.row.createdBy].userName);
            }
          }
        },
        {
          title: '创建时间',
          key: 'createdTime',
          align: 'center',
          minWidth: 130,
          render: (h, params) => {
            return h(
              'div',
              this.getDataToLocalTime(params.row.createdTime, 'fulltime')
            );
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
          width: 227,
          fixed: 'right',
          align: 'center',
          render: (h, params) => {
            return h('local-down-button', {
              props: {
                data: {
                  btn: {
                    text: '查看', // 标记为付款
                    clickFn: () => {
                      self.editStatus = 'look';
                      if (params.row.type === 1) {
                        self.editSpu(params.row.productId, 1);
                      } else {
                        self.editSku(params.row);
                      }
                    }
                  },
                  list: [
                    {
                      text: '编辑SPU',
                      value: 1,
                      hide: !self.controlList.productGoods_update,
                      clickFn: () => {
                        if (self.getPermission('productInfo_detail')) {
                          self.editStatus = 'edit';
                          if (params.row.type === 1) {
                            self.editSpu(params.row.productId, 1);
                          } else {
                            self.editSpu(params.row.productId, 2);
                          }
                        }
                      }
                    },
                    {
                      text: '编辑SKU', // 编辑sku
                      value: 1,
                      hide:
                        !self.controlList.productGoods_update ||
                        params.row.type === 1,
                      clickFn: () => {
                        if (self.getPermission('productGoods_detail')) {
                          self.editStatus = 'edit';
                          self.editSku(params.row);
                        }
                      }
                    },
                    {
                      text: '操作日志', // 操作日志
                      value: 2,
                      hide: !self.getPermission(
                        'productGoodsOperationLog_query'
                      ),
                      clickFn: () => {
                        self.logParams.productGoodsId =
                          params.row.productGoodsId;
                        self.modal11 = true;
                      }
                    },
                    {
                      text: '打印标签', // 打印标签
                      value: 3,
                      clickFn: () => {
                        self.printData = [params.row];
                        self.$refs.print.printModal = true;
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
                        !self.controlList.productGoods_delete ||
                        (params.row.auditStatus !== 0), // 只有草稿状态的商品可以删除
                      clickFn: () => {
                        if (self.getPermission('productGoods_delete')) {
                          self.deleteControl(2, params.row.productGoodsId);
                        }
                      }
                    }
                  ]
                }
              }
            });
          }
        }
      ],
      updateModal: false,
      updateModalStatus: false,
      updateLoading: true,
      updateParamsPrototype: null, // 重置数据用到
      updateFlag: false, // 批量修改 true,所有结果集  false,选择数据
      updateParams: {
        cnNameSelected: false,
        updateCnName: null,
        enNameSelected: false,
        updateEnName: null,
        upcSelected: false,
        updateUpc: null,
        eanSelected: false,
        updateEan: null,
        isbnSelected: false,
        updateIsbn: null,
        productCategoryIdSelected: false,
        ymsProductCategoryIdSelected: false,
        updateProductCategoryId: null,
        updateYmsProductCategoryId: null,
        productBrandIdSelected: false,
        updateProductBrandId: null,
        productGoodsTagsSelected: false,
        updateProductGoodsTags: null,
        suggestPriceSelected: false,
        updateSuggestPrice: 0,
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
        productDeveloperUserId: null,
        weightSelected: false,
        weight: 0,
        sizeSelected: false,
        length: 0,
        width: 0,
        height: 0,
        cargoOwnerType: null,
        cargoOwnerId: null
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
      trackingTab: '1'
    };
  },
  computed: {
    headObj () {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    },
    wrapClass () {
      return {
        width:
          ((this.domWidth / 24) * (24 - this.$store.state.spanLeft) * 100) /
          this.domWidth +
          '%'
      };
    },
    // 判断当前商户是否是供应商
    isSupplierTalg () {
      return this.$store.state.erpConfig.merchant.isSupplier === 1;
    }
  },
  created () {
    this.tableHeight = this.getTableHeight(420);
    this.pageParamsPrototype = this.deepCopy(this.pageParams);
    this.customProductTagList = this.deepCopy(this.productTagList);
    this.updateParamsPrototype = this.deepCopy(this.updateParams);
    this.getCommodityDeveloper();
    if (this.isSupplierTalg) {
      this.getClassificationData();
    }
  },
  activated () {
    this.reset();
    this.startLoading();
  },
  watch: {
    pageParamsStatus (n, o) {
      // 监听重置列表数据
      var v = this;
      if (n) {
        v.$Loading.start();
        Promise.resolve(
          v.getPermission('productGoods_query') ? v.getList() : v.gotoError()
        ).then(function () {
          v.$Loading.finish();
        });
        v.pageParamsStatus = false;
      }
    },
    addition: {
      handler (value) {
        if (this.upType === 'add') {
          this.uploadData.addition = value;
        }
      },
      immediate: true
    },
    upType: {
      handler (value) {
        if (value !== 'add') {
          // eslint-disable-next-line no-unused-vars
          let { addition, ...data } = this.uploadData;
          this.uploadData = data;
        }
      },
      immediate: true
    }
  },
  methods: {
    // 获取所有分类的数据
    getClassificationData () {
      let v = this;
      v.menuList = [];
      v.originalCategoryData = [];
      v.axios
        .get(api.post_ymsProductCategory_shopping_queryAll)
        .then((response) => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            v.originalCategoryData = data;
            v.menuFilterList = JSON.parse(JSON.stringify(data));
            v.menuList = v.handlerData(data, 'productCategoryNavigation', '->');
            v.$set(v.ymsProductCategoryTree[0], 'children', v.menuList);
          }
        });
    },
    // 处理分类的数据
    handlerData (data, key, sign) {
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
    filterCategoryChange (value) {
      this.uploadData.ymsProductCategoryId = null;
      this.menuFilterList = this.originalCategoryData.filter((i) => {
        return i.productCategoryNavigation.includes(value);
      });
    },
    ymsProductCategoryChange (value) {
      if (value) {
        this.stepModel = 1;
      }
    },
    setTreeDate (selectId) {
      let v = this;
      if (!selectId) return;
      let arr = v.productCategoryTree[0].children;
      let item = [];

      function makeTree (a) {
        a.forEach((i) => {
          selectId.forEach((j) => {
            if (i.productCategoryId === j) {
              v.$set(i, 'checked', true);
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
        v.$refs['categoryTree'].treeSelectCheckChange(item);
      }, 300);
    },
    getDateValue (value) {
      // 选择日期
      let v = this;
      if (!value) {
        return false;
      }
      if (value[0] && value[1]) {
        v.pageParams.startCreatedTime = v.getUniversalTime(
          new Date(value[0]).getTime(),
          'fulltime'
        );
        v.pageParams.endCreatedTime = v.getUniversalTime(
          new Date(value[1]).getTime(),
          'fulltime'
        );
      } else {
        v.pageParams.startCreatedTime = null;
        v.pageParams.endCreatedTime = null;
      }
    },
    logVisible (open) {
      if (open) {
        this.getLogList();
      }
    },
    changeLogPage (page) {
      this.logParams.pageNum = page;
      this.getLogList();
    },
    changeLogPageSize (pageSize) {
      this.logParams.pageSize = pageSize;
      this.getLogList();
    },
    getLogList () {
      let v = this;
      v.data1 = [];
      v.spinShow = true;
      v.axios
        .post(api.getLog_productBrandSku, v.logParams)
        .then((response) => {
          v.spinShow = false;
          if (response.data.code === 0) {
            v.logTotal = response.data.datas.total;
            v.data1 = response.data.datas.list;
          }
        })
        .catch(() => {
          v.spinShow = false;
        });
    },
    startLoading: function () {
      // 初始方法
      this.getProductTagList();
      this.getProductBrandList();
      this.getProductCategoryList();
      //  如果是从分页管理跳转过来的 直接查询
      if (
        this.pageParams.productCategoryList.length === 0 &&
        this.$route.query.categoryId
      ) {
        this.pageParamsStatus = true;
      } else {
        this.productGoodsData = [];
        this.total = 0;
      }
      // this.pageParamsStatus = true;
      this.urlParams = true;
    },
    getProductBrandList () {
      // 获取品牌列表(筛选下拉)
      var v = this;
      v.axios.get(api.getAll_productBrand, { hiddenError: true }).then(function (response) {
        if (response.data.code === 0) {
          v.productBrandList = response.data.datas;
        }
      });
    },
    getProductCategoryList () {
      // 获取商品分类(筛选下拉)
      let self = this;
      self.axios.get(api.get_productCategory, { hiddenError: true }).then((response) => {
        if (response.data.code === 0) {
          self.productCategoryList = response.data.datas;
          let productCategoryTree = self.getProductCategoryTree(
            response.data.datas,
            null
          );
          self.selectTreeProductData = (response.data.datas || [])
          self.$set(self.productCategoryTree[0], 'children', []);
          self.$set(self.updateCategoryTree[0], 'children', []);
          self.$nextTick(function () {
            self.$set(
              self.productCategoryTree[0],
              'children',
              productCategoryTree
            );
            self.$set(
              self.updateCategoryTree[0],
              'children',
              productCategoryTree
            );
            productCategoryTree.unshift({
              title: '未分类',
              productCategoryId: 'noCategory',
              expand: true
            });
            self.selectTreeProductCategory = JSON.parse(JSON.stringify(self.productCategoryTree))
            if (self.$route.query.categoryId) {
              self.setTreeDate([self.$route.query.categoryId]);
            }
          });
        }
      });
    },
    getProductCategoryTree (productCategoryList, parentId) {
      // 组装商品分类树
      var tree = [];
      var children;
      productCategoryList.forEach((n, i) => {
        if (n.parentId === parentId) {
          n.title = n.cnName;
          n.expand = true;
          children = this.getProductCategoryTree(
            productCategoryList,
            n.productCategoryId
          );
          if (children.length > 0) {
            n.children = children;
          }
          tree.push(n);
        }
      });
      return tree;
    },
    search () {
      var v = this;
      v.getList();
      v.pageParams.pageNum = 1;
    },
    reset () {
      // 重置
      let v = this;
      v.createdTimeProduct = [];
      // console.log(this.pageParamsPrototype);
      v.pageParams = v.deepCopy(this.pageParamsPrototype);
      v.pageParams.ymsProductCategoryId = null;
      v.classifyValue = [];
      v.searchCode = null;
      v.cnName = null;
      v.enName = null;
      // v.search();
    },
    deleteControl (val, productGoodsId) {
      // 弹出确认删除框
      if (val === 0 && this.selectedProductGoodsList.length === 0) {
        // 批量删除
        this.$Message.error('无删除数据,请选择后再试');
      } else {
        this.$refs.delConfirmModal.show(val, productGoodsId);
      }
    },
    showDeleteTip (response) {
      // 删除结果提示
      let v = this;
      let code = response.data.code;
      let datas = response.data.datas || [];
      if (datas.length > 0) {
        for (let i = 0; i < datas.length; i++) {
          let data = datas[i];
          if (data.code === 210018) {
            v.$Message.warning(
              'SKU:' + data.sku + ',' + '该商品正在被映射商品使用，不能删除'
            );
          } else if (data.code === 210015) {
            v.$Message.warning('SKU:' + data.sku + ',' + 'SKU不存在');
          } else if (data.code === 210058) {
            v.$Message.warning(
              'SKU:' + data.sku + ',' + '该SKU有库存不允许删除'
            );
          } else if (data.code === 999999) {
            v.$Message.warning(
              'SKU:' + data.sku + ',' + '系统繁忙，请重新尝试'
            );
          }
        }
      } else if (code === 0) {
        v.$Message.success('删除成功');
        v.search();
      }
      v.$refs.delConfirmModal.hide();
      // v.pageParamsStatus = true;
    },
    del (val, productGoodsId) {
      // 删除
      let v = this;
      if (val === 0) {
        // 批量删除
        let productGoodsIds = [];
        v.selectedProductGoodsList.forEach((n, i) => {
          productGoodsIds.push(n.productGoodsId);
        });
        v.pageParams.productGoodsIds = productGoodsIds;
        v.axios
          .post(api.productGoods_batchDelete, v.pageParams)
          .then((response) => {
            v.pageParams.productGoodsIds = [];
            v.showDeleteTip(response);
          });
      } else if (val === 1) {
        // 删除所有结果集
        let productCategoryIds = [];
        v.pageParams.productCategoryList.forEach((n, i) => {
          if (n.productCategoryId) {
            productCategoryIds.push(n.productCategoryId);
          }
        });
        v.pageParams.productCategoryIds = productCategoryIds;
        v.axios
          .post(api.productGoods_batchDelete, v.pageParams)
          .then((response) => {
            v.showDeleteTip(response);
          });
      } else if (val === 2) {
        // 单个删除
        v.axios
          .delete(api.del_productGoods + productGoodsId)
          .then((response) => {
            v.showDeleteTip(response);
          });
      }
    },
    editSpu (productId, type) {
      // 编辑spu
      this.productId = productId;
      if (type === 1) {
        // 普通商品
        // v.$store.commit('productShow', 'add');
        this.$nextTick(() => {
          this.productShow = 'edit'
        })
      } else if (type === 2) {
        this.renderSpuDetailModal = true;
        this.$nextTick(() => {
          this.editProductModal = true;
        });
      }
    },
    editSku (productRow) {
      // 编辑sku
      let v = this;
      v.renderProductGoodsDetailModal = true;
      v.$nextTick(function () {
        v.productGoodsDetailModal = true;
        v.editProductGoods = productRow;
      });
    },
    addProduct () {
      // 新增商品
      this.productId = null;
      this.editStatus = 'add';
      // this.$store.commit('productShow', 'add');
      this.$nextTick(() => {
        this.productShow = 'add'
      })
    },
    handleUpload (file) {
      // Excel 导入
      this.file = file;
      return this.confirmUpload;
    },
    handleUpload1 (file) {
      // Excel 导入
      this.file1 = file;
      return this.confirmUpload;
    },
    handleUpload2 (file) {
      // Excel 导入
      this.file2 = file;
      return this.confirmUpload;
    },
    upload () {
      // 导入sku模态框 确认
      if (this.file !== null) {
        this.confirmUpload = true;
        this.$refs.upload.upload(this.file);
      } else {
        this.addSkuModalLoading = false;
        this.$nextTick(function () {
          this.addSkuModalLoading = true;
        });
        this.$Message.error('请选择文件');
      }
    },
    upload1 () {
      // 导入sku模态框 确认
      if (this.file1 !== null) {
        this.confirmUpload = true;
        this.$refs.upload1.upload(this.file1);
      } else {
        this.addSkuModalLoading = false;
        this.$nextTick(function () {
          this.addSkuModalLoading = true;
        });
      }
      if (this.file2 !== null) {
        this.confirmUpload = true;
        this.$refs.upload2.upload(this.file2);
      } else {
        this.addSkuModalLoading = false;
        this.$nextTick(function () {
          this.addSkuModalLoading = true;
        });
      }
    },
    exportExcel (val) {
      // 0 导出商品, 1 导出所有结果集
      let v = this;
      if (val === 0) {
        let productGoodsIdList = [];
        v.selectedProductGoodsList.forEach((n, i) => {
          productGoodsIdList.push(n.productGoodsId);
        });
        if (productGoodsIdList.length === 0) {
          this.$Message.error('无导出数据,请选择后再试');
          return;
        }
        // let newTab = window.open('about:blank');
        v.axios
          .post(api.productGoods_exportByIds, productGoodsIdList)
          .then((response) => {
            if (response.data.code === 0) {
              let data = response.data.datas;
              v.$Message.success({
                content: '已生成导入/导出任务，任务编号' + '：' + data,
                duration: 10,
                closable: true
              });
              v.selectedProductGoodsList = []; // 清空
              v.pageParamsStatus = true;
              // newTab.location.href = v.filenodeViewTargetUrl + response.data.datas;
              // setTimeout(function () {
              //   newTab.close();
              // }, 1000);
            }
          });
      } else if (val === 1 && v.total) {
        // let newTab = window.open('about:blank');
        let params = JSON.parse(JSON.stringify(v.pageParams));
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
        v.axios.post(api.productGoods_excelExport, params).then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            v.$Message.success({
              content: '已生成导入/导出任务，任务编号' + '：' + data,
              duration: 10,
              closable: true
            });
            // newTab.location.href = v.filenodeViewTargetUrl + response.data.datas;
            // setTimeout(function () {
            //   newTab.close();
            // }, 1000);
          }
        });
      } else if (val === 1 && !v.total) {
        this.$Message.error('无导出数据');
      }
    },
    importExcel (val) {
      // 0,导入商品; 1,查看导入任务
      let v = this;
      if (val === 0) {
        v.addSku = true;
      } else if (val === 1) {
        // v.renderTaskModal = true;
        // v.$nextTick(function () {
        //   v.taskModal = true;
        // });
        v.$router.push('importTask');
      } else if (val === 2) {
        // 导入组装信息
        v.$refs.importModal.modal = true;
      }
    },
    importTagExcel (val) {
      // 0,导入商品; 1,查看导入任务
      let v = this;
      if (val === 0) {
        v.addTagSku = true;
      } else if (val === 1) {
        // v.renderTaskModal = true;
        // v.$nextTick(function () {
        //   v.taskModal = true;
        // });
        v.$router.push('importTask');
      }
    },
    loadTemplate () {
      // 下载模板
      let v = this;
      if (!v.getPermission('productInfo_getTemplet')) return;
      let newTab = window.open('about:blank');
      v.axios.get(api.loadTemplate).then((response) => {
        if (response.data.code === 0) {
          newTab.location.href = v.filenodeViewTargetUrl + response.data.datas;
        }
      });
    },
    loadTemplate1 () {
      // 下载模板
      let v = this;
      let newTab = window.open('about:blank');
      v.axios.get(api.productInfo_DownExcel).then((response) => {
        if (response.data.code === 0) {
          newTab.location.href = v.filenodeViewTargetUrl + response.data.datas;
        }
      });
    },
    // 回退到选择云卖分类
    fallbackBtn () {
      this.stepModel = 0;
      this.uploadData.ymsProductCategoryId = null;
      this.uploadData.updateIgnore = '0';
      this.file = null;
    },
    addSkuCancel () {
      // 导入sku模态框 取消
      let v = this;
      // v.$refs.upload.fileList = [];
      v.file = null;
    },
    handleSuccess (res, file, fileList) {
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
    handleSuccess1 (res, file, fileList) {
      // 上传成功
      if (res.code === 0) {
        this.file1 = null;
        this.$Message.success('导入成功');
        this.confirmUpload = false;
        this.addTagSku = false;
        this.getList();
      }
    },
    /* handleSuccess2 (res, file, fileList) { // 上传成功
     if (res.code === 0) {
     this.file2 = null;
     this.$Message.success('标签解绑导入成功');
     this.confirmUpload = false;
     }
     }, */
    handleFormatError () {
      // 上传失败
      this.$Message.error('文件格式有误');
      this.addSkuModalLoading = false;
      this.$nextTick(function () {
        this.addSkuModalLoading = true;
        this.confirmUpload = false;
      });
    },
    getSelectValue (value) {
      // table获取所选值
      let v = this;
      v.selectedProductGoodsList = value;
    },
    onSelect (selection, row) { },
    onSelectCancel (selection, row) { },
    onSelectAll (selection, row) { },
    getProductCategoryMap (productCategoryIds) {
      // 获取产品分类Map
      var v = this;
      if (productCategoryIds && productCategoryIds.length > 0) {
        v.axios
          .post(
            api.productCategory_queryByProductCategoryIds,
            productCategoryIds
          )
          .then(function (response) {
            if (response.data.code === 0) {
              v.productGoodsListDictionary.productCategoryMap =
                response.data.datas;
            }
          });
      }
    },
    getGoodsImageMap (productGoodsIds) {
      // 获取货品图片Map
      var v = this;
      return new Promise((resolve) => {
        if (productGoodsIds && productGoodsIds.length > 0) {
          v.axios
            .post(api.productGoodsImage_queryByProductGoodsIds, productGoodsIds)
            .then(function (response) {
              if (response.data.code === 0) {
                v.productGoodsListDictionary.goodsImageMap =
                  response.data.datas;
              }
              resolve(true);
            });
        } else {
          resolve(true);
        }
      });
    },
    getList (goto) {
      // 获取sku列表
      let v = this;
      let productCategoryIds = [];
      if (this.urlParams) {
        if (
          v.pageParams.productCategoryList.length === 0 &&
          v.$route.query.categoryId
        ) {
          v.pageParams.productCategoryIds = [v.$route.query.categoryId];
        } else {
          v.pageParams.productCategoryList.forEach((n, i) => {
            if (n.productCategoryId) {
              productCategoryIds.push(n.productCategoryId);
            }
          });
          v.pageParams.productCategoryIds = productCategoryIds;
        }
        if (v.$route.query.tagId) {
          v.pageParams.tagNames = [v.$route.query.tagId];
        }
      } else {
        v.pageParams.productCategoryList.forEach((n, i) => {
          if (n.productCategoryId) {
            productCategoryIds.push(n.productCategoryId);
          }
        });
        v.pageParams.productCategoryIds = productCategoryIds;
      }
      if (v.searchCode) {
        let code = v.searchCode.split('\n').toString();
        v.pageParams.code = code;
      } else {
        v.pageParams.code = null;
      }

      v.loadingTrue();
      if (v.isSupplierTalg) {
        v.pageParams.shelveStatus = Number(v.trackingTab);
      }
      let params = JSON.parse(JSON.stringify(v.pageParams));
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

      v.axios.post(api.productGoods_querySpu, v.pageParams).then((response) => {
        let pos = [];
        v.urlParams = false;
        let productGoodsIds = [];
        let productCategoryIds = [];
        let userIds = [];
        if (response.data.code === 0) {
          var data = response.data.datas;
          data.list.forEach((i) => {
            i.num = 1;
          });
          if (data.list !== null && data.list.length > 0) {
            data.list.forEach(function (n, i) {
              pos.push(n);
              productGoodsIds.push(n.productGoodsId);
              productCategoryIds.push(n.productCategoryId);
              userIds.push(n.createdBy);
            });
          }
          Promise.all([
            v.getGoodsImageMap(productGoodsIds),
            v.getProductCategoryMap(productCategoryIds),
            v.getUserInfoMap(userIds)
          ]).then((result) => {
            v.productGoodsData = pos;
            v.loadingFalse();
            v.$nextTick(function () {
              v.total = Number(data.total);
              v.loadingFalse();
              v.$nextTick(function () {
                v.total = Number(data.total);
                v.loadingFalse();
              });
            });
          }).catch(() => {
            v.loadingFalse();
          });
        }
      }).catch(() => {
        v.loadingFalse();
      });
    },
    addCustomTag (event) {
      // 添加自定义标签
      let v = this;
      let productGoodsTagsSelectInput = event.target;
      let value =
        productGoodsTagsSelectInput.value === null
          ? ''
          : v.trim(productGoodsTagsSelectInput.value);
      if (
        value !== '' &&
        value.length <= 50 &&
        v.customProductTagList.indexOf(value) === -1
      ) {
        v.customProductTagList.push(value);
        let arr = v.pageParams.tagNames;
        arr.push(value);
        this.$nextTick(function () {
          v.pageParams.tagNames = arr;
        });
      } else {
        v.$Message.error('新增标签长度不能超过50且不能与已存在标签重复');
      }
    },
    batchOption (name) {
      // 批量操作
      let v = this;
      if (name === '1') {
        // 删除
        if (!v.productGoodsData.length) {
          v.$Message.error('无数据');
        } else {
          if (v.allPageStatus) {
            // 所有结果集
            v.$refs.delConfirmModal.show(1);
          } else {
            // 选择数据
            if (v.selectedProductGoodsList.length) {
              v.$refs.delConfirmModal.show(0);
            } else {
              v.$Message.error('请选择数据');
            }
          }
        }
      } else if (name === '2') {
        // 修改
        if (!v.productGoodsData.length) {
          v.$Message.error('无数据');
        } else {
          if (v.allPageStatus) {
            // 所有结果集
            v.updateModal = true;
            v.updateModalStatus = true;
            v.updateFlag = true;
          } else {
            // 选择数据
            if (v.selectedProductGoodsList.length) {
              v.updateModal = true;
              v.updateModalStatus = true;
              v.updateFlag = false;
            } else {
              v.$Message.error('请选择数据');
            }
          }
        }
      } else if (name === '3') {
        if (v.selectedProductGoodsList.length === 0) {
          v.$Message.error('请选择数据');
        } else {
          v.printData = v.selectedProductGoodsList;
          v.$refs.print.printModal = true;
        }
      }
    },
    updateOk () {
      // 批量修改确认
      let v = this;
      let obj = {};
      // 校验
      if (!v.updateParams.updateCnName && v.updateParams.cnNameSelected) {
        v.updateLoading = false;
        v.$nextTick(function () {
          v.updateLoading = true;
        });
        v.$Message.error('商品中文名称' + '不能为空');
        return false;
      }
      if (v.updateFlag) {
        // 所有结果集
        let productCategoryIds = [];
        v.pageParams.productCategoryList.forEach((n, i) => {
          if (n.productCategoryId) {
            productCategoryIds.push(n.productCategoryId);
          }
        });
        v.pageParams.productCategoryIds = productCategoryIds;
        obj = {
          cnNameSelected: v.updateParams.cnNameSelected ? 1 : 0,
          updateCnName: v.updateParams.updateCnName,
          enNameSelected: v.updateParams.enNameSelected ? 1 : 0,
          updateEnName: v.updateParams.updateEnName,
          upcSelected: v.updateParams.upcSelected ? 1 : 0,
          updateUpc: v.updateParams.updateUpc,
          eanSelected: v.updateParams.eanSelected ? 1 : 0,
          updateEan: v.updateParams.updateEan,
          isbnSelected: v.updateParams.isbnSelected ? 1 : 0,
          updateIsbn: v.updateParams.updateIsbn,
          productCategoryIdSelected: v.updateParams.productCategoryIdSelected
            ? 1
            : 0,
          updateProductCategoryId: v.updateParams.updateProductCategoryId,
          ymsProductCategoryIdSelected: v.updateParams
            .ymsProductCategoryIdSelected
            ? 1
            : 0,
          updateYmsProductCategoryId: v.updateParams.updateYmsProductCategoryId,
          productBrandIdSelected: v.updateParams.productBrandIdSelected ? 1 : 0,
          updateProductBrandId: v.updateParams.updateProductBrandId,
          productGoodsTagsSelected: v.updateParams.productGoodsTagsSelected
            ? 1
            : 0,
          updateProductGoodsTags: v.updateParams.updateProductGoodsTags,
          suggestPriceSelected: v.updateParams.suggestPriceSelected ? 1 : 0,
          updateSuggestPrice: v.updateParams.updateSuggestPrice,
          statusSelected: v.updateParams.statusSelected ? 1 : 0,
          updateStatus: v.updateParams.updateStatus,
          cnHsNameSelected: v.updateParams.cnHsNameSelected ? 1 : 0,
          updateCnHsName: v.updateParams.updateCnHsName,
          enHsNameSelected: v.updateParams.enHsNameSelected ? 1 : 0,
          updateEnHsName: v.updateParams.updateEnHsName,
          hsCodeSelected: v.updateParams.hsCodeSelected ? 1 : 0,
          updateHsCode: v.updateParams.updateHsCode,
          productDeveloperUserIdSelected: v.updateParams
            .productDeveloperUserIdSelected
            ? 1
            : 0,
          productDeveloperUserId: v.updateParams.productDeveloperUserId,
          acceptableTypeSelected: v.updateParams.acceptableTypeSelected ? 1 : 0,
          acceptableType: v.updateParams.acceptableType,
          weightSelected: v.updateParams.weightSelected ? 1 : 0,
          weight: v.updateParams.weight,
          sizeSelected: v.updateParams.sizeSelected ? 1 : 0,
          length: v.updateParams.length,
          width: v.updateParams.width,
          height: v.updateParams.height,
          cargoOwnerType: v.updateParams.cargoOwnerType,
          cargoOwnerId: v.updateParams.cargoOwnerId
        };
        obj = Object.assign(v.pageParams, obj);
      } else {
        // 选择数据
        let productGoodsIds = [];
        v.selectedProductGoodsList.forEach((n, i) => {
          productGoodsIds.push(n.productGoodsId);
        });
        obj = {
          cnNameSelected: v.updateParams.cnNameSelected ? 1 : 0,
          updateCnName: v.updateParams.updateCnName,
          enNameSelected: v.updateParams.enNameSelected ? 1 : 0,
          updateEnName: v.updateParams.updateEnName,
          upcSelected: v.updateParams.upcSelected ? 1 : 0,
          updateUpc: v.updateParams.updateUpc,
          eanSelected: v.updateParams.eanSelected ? 1 : 0,
          updateEan: v.updateParams.updateEan,
          isbnSelected: v.updateParams.isbnSelected ? 1 : 0,
          updateIsbn: v.updateParams.updateIsbn,
          productCategoryIdSelected: v.updateParams.productCategoryIdSelected
            ? 1
            : 0,
          updateProductCategoryId: v.updateParams.updateProductCategoryId,
          ymsProductCategoryIdSelected: v.updateParams
            .ymsProductCategoryIdSelected
            ? 1
            : 0,
          updateYmsProductCategoryId: v.updateParams.updateYmsProductCategoryId,
          productBrandIdSelected: v.updateParams.productBrandIdSelected ? 1 : 0,
          updateProductBrandId: v.updateParams.updateProductBrandId,
          productGoodsTagsSelected: v.updateParams.productGoodsTagsSelected
            ? 1
            : 0,
          updateProductGoodsTags: v.updateParams.updateProductGoodsTags,
          suggestPriceSelected: v.updateParams.suggestPriceSelected ? 1 : 0,
          updateSuggestPrice: v.updateParams.updateSuggestPrice,
          statusSelected: v.updateParams.statusSelected ? 1 : 0,
          updateStatus: v.updateParams.updateStatus,
          cnHsNameSelected: v.updateParams.cnHsNameSelected ? 1 : 0,
          updateCnHsName: v.updateParams.updateCnHsName,
          enHsNameSelected: v.updateParams.enHsNameSelected ? 1 : 0,
          updateEnHsName: v.updateParams.updateEnHsName,
          hsCodeSelected: v.updateParams.hsCodeSelected ? 1 : 0,
          updateHsCode: v.updateParams.updateHsCode,
          productDeveloperUserIdSelected: v.updateParams
            .productDeveloperUserIdSelected
            ? 1
            : 0,
          productDeveloperUserId: v.updateParams.productDeveloperUserId,
          acceptableTypeSelected: v.updateParams.acceptableTypeSelected ? 1 : 0,
          acceptableType: v.updateParams.acceptableType,
          weightSelected: v.updateParams.weightSelected ? 1 : 0,
          weight: v.updateParams.weight,
          sizeSelected: v.updateParams.sizeSelected ? 1 : 0,
          length: v.updateParams.length,
          width: v.updateParams.width,
          height: v.updateParams.height,
          productGoodsIds: productGoodsIds,
          cargoOwnerType: v.updateParams.cargoOwnerType,
          cargoOwnerId: v.updateParams.cargoOwnerId
        };
      }
      v.axios
        .post(api.put_batchUpdate, obj)
        .then((response) => {
          if (response.data.code === 0) {
            v.$Message.success('修改成功');
            v.pageParamsStatus = true;
            v.updateCancel();
            v.updateModal = false;
          } else {
            v.updateLoading = false;
            v.$nextTick(function () {
              v.updateLoading = true;
            });
          }
        })
        .catch(() => {
          v.updateLoading = false;
          v.$nextTick(function () {
            v.updateLoading = true;
          });
        });
    },
    updateCancel () {
      // 批量修改取消
      let v = this;
      v.updateParams = v.deepCopy(this.updateParamsPrototype);
      // 清空选择的分类数据
      v.updateParams.updateProductCategoryId = null;
      v.updateParams.updateYmsProductCategoryId = null;
      v.$refs.productCategoryTree.model = [];
      v.$refs.productCategoryTree.query = '';
    },
    getTreeData (productCategory) {
      // 选择分类时把id赋值给商品模型分类ID
      if (productCategory && productCategory.productCategoryId) {
        this.updateParams.updateProductCategoryId =
          productCategory.productCategoryId;
      } else {
        this.updateParams.updateProductCategoryId = null;
      }
    },
    getYmsTreeData (productCategory) {
      if (productCategory && productCategory.ymsProductCategoryId) {
        this.updateParams.updateYmsProductCategoryId =
          productCategory.ymsProductCategoryId;
      } else {
        this.updateParams.updateYmsProductCategoryId = null;
      }
    },
    // 批量修改商品--产品类型：选择普货时，限制其他选项
    changeSelect (value) {
      let currentIndex = value.indexOf('01');
      if (currentIndex > -1) {
        value.splice(currentIndex, 1);
      }
      if (value.length <= 0) {
        this.updateParams.acceptableType = ['01'];
      }
    },
    // 下架SPU
    shelfBtn (productId) {
      let v = this;
      v.axios.put(api.put_productInfo + `${productId}`).then((response) => {
        if (response.data.code === 0) {
          this.$Message.success('操作成功!');
          v.getList();
        }
      });
    },
    // 选中云卖分类
    getYmsClassifyTree (productCategory) {
      // 选择分类时把id赋值给商品模型分类ID
      if (productCategory && productCategory.ymsProductCategoryId) {
        this.pageParams.ymsProductCategoryId =
          productCategory.ymsProductCategoryId;
      } else {
        this.pageParams.ymsProductCategoryId = null;
      }
    },
    // 切换列表
    selectTabs (name) {
      this.pageParamsStatus = true;
    },
    aaa () {
      console.log(this.pageParams.cnNameList);
    },
    // 处理树节点
    treeNormalizer (node) {
      return {
        id: node.productCategoryId,
        label: node.title,
        children: node.children
      }
    },
    // 树选中值改变
    treeSelectCategoryChange (value) {
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
      this.$set(this.pageParams, 'productCategoryList', newList.length > 0 ? newList : newTree)
    }
  }
};
</script>
<style lang="less">
.product-tooltip {
  .ivu-tooltip-popper {
    top: 0 !important;
    width: 320px;
  }
}
</style>
