<template>
  <div class="editPage" ref="editSpu" v-show="editProductModal">
    <!-- 头部工具条 -->
    <div class="topBtn">
      <div class="head-tabs">
        <RadioGroup v-model="pageEditTag" type="button">
          <template v-for="(tag, index) in tagList">
            <Radio
              v-if="!tag.powerKey || (tag.powerKey && permission[tag.powerKey])"
              :label="tag.value"
              :key="`tag-${index}`"
            >{{ tag.label }}</Radio>
          </template>
        </RadioGroup>
      </div>
      <div class="top-buttons">
        <div v-show="!isDisabled" style="display: inline-block;">
          <Button type="primary" :loading="waitingOk || spinShow" @click="beforeSave(false)"
            v-if="isSupplierTalg">暂存</Button>
          <Button type="primary" class="ml10" v-if="!initFinished || skuData.length > 0" :loading="waitingOk || spinShow"
            @click="beforeSave(true)">{{ isSupplierTalg ? '提交审批' : '保存' }}</Button>
          <Button class="ml10" type="warning" v-if="initFinished && skuData.length === 0" :loading="waitingOk || spinShow"
            @click="del">删除</Button>
        </div>
        <Button @click="turnBack" class="ml10">取消</Button>
      </div>
    </div>
    <Form ref="productInfo" class="edit-page-form" :model="productInfo" :label-width="110" label-position="right">
      <div class="tag-content-baseInfo tag-comtent-item" v-show="pageEditTag == 'baseInfo'">
        <div style="display:flex">
          <div style="flex-direction:column">
            <!-- 基础信息 -->
            <div class="productsCont formItemLeft">
              <div class="productsTit padding-10">
                <div id="basic">
                  基本信息
                </div>
              </div>
              <div class="products-content padding-10">
                <!-- 商品中文名称 -->
                <Form-item label="中文名称" prop="cnName"
                  :rules="{ required: true, message: '商品中文名称' + '不能为空', trigger: 'blur' }">
                  <Input :disabled="isDisabled" :maxlength="1000" v-model.trim="productInfo.cnName"
                    placeholder="请输入商品中文名称"></Input>
                </Form-item>
                <!-- 商品英文名称 -->
                <Form-item label="英文名称" prop="enName">
                  <Input :maxlength="1000" :disabled="isDisabled" v-model.trim="productInfo.enName"
                    placeholder="请输入商品英文名称"></Input>
                </Form-item>
                <!-- SPU/商品编码 -->
                <Form-item label="SPU" prop="spu"
                  :rules="[{ required: true, message: 'SPU/商品编码' + '不能为空', trigger: 'blur' }, { validator: validateFormSku, trigger: 'blur' }]">
                  <Input :maxlength="100" disabled v-model.trim="productInfo.spu" placeholder="请输入SPU/商品编码"></Input>
                  <!-- :disabled="isDisabled" -->
                </Form-item>
                <!-- 分类 -->
                <Form-item label="所属分类" prop="productCategoryId" v-if="!isSupplierTalg" :rules="[
                  { required: true, message: '请选择所属分类', trigger: 'change' }
                ]">
                  <erpTreeSelect v-if="!isLoadInfo" :disabled="isDisabled" v-model="treeSelectCategoryValue"
                    :multiple="false" :normalizer="treeNormalizer" :options="productCategoryTree"
                    :default-expand-level="Infinity" placeholder="请选择所属分类" noResultsText="无匹配数据" @input="getTreeData" />
                </Form-item>
                <Form-item label="云卖分类" prop="ymsProductCategoryId" v-if="isSupplierTalg" class="classify_style"
                  :class="{ 'ivu-form-item-error': productInfo.ymsProductCategoryId === null }">
                  <treeSelect ref="productCategoryTree1" :disabled="isDisabled" :treeData="ymsMenuList"
                    @on-change="getYmsTreeData" filterable placeholder="请选择云卖分类" />
                  <div v-show="productInfo.ymsProductCategoryId === null" class="ivu-form-item-error-tip">
                    请选择云卖分类！
                  </div>
                </Form-item>
                <!-- 品牌 -->
                <Form-item label="品牌" prop="productBrandId">
                  <dyt-select v-model.trim="productInfo.productBrandId" :disabled="isDisabled" :transfer="true" filterable
                    placeholder="请选择品牌">
                    <Option v-for="(item, index) in productBrandList" :key="index"
                      :class="{ productBrandRed: item.status === 0, hidden: item.status === 0 && item.productBrandId !== productInfo.productBrandId }"
                      :value="item.productBrandId">{{ item.name }}
                    </Option>
                  </dyt-select>
                </Form-item>
                <!-- 商品开发员 -->
                <Form-item label="开发员" v-if="!isSupplierTalg">
                  <dyt-select v-model="productInfo.productDeveloperUserId" :disabled="isDisabled">
                    <Option v-for="item in businessRoleTypeList" :value="item.userId" :key="item.userId">{{ item.userName
                    }}</Option>
                  </dyt-select>
                </Form-item>
                <Form-item label="编织类型" v-if="isClothingType">
                  <dyt-select v-model="productInfo.braidType" :disabled="isDisabled">
                    <Option v-for="item in braidDataList" :value="item.value" :key="item.value">{{ item.label }}</Option>
                  </dyt-select>
                </Form-item>
                <FormItem label="材质中文描述:" prop="materialCnDesc">
                  <!-- :rules="[
                        { required: true, message:'材质中文描述不能为空', trigger: 'blur' },
                        { required: true, message:'材质中文描述不能为空', trigger: 'change' }
                      ]" -->
                  <Input v-model="productInfo.materialCnDesc" placeholder="请输入" :maxlength="50" clearable
                    :disabled="isDisabled" />
                </FormItem>
                <FormItem label="材质英文描述:" prop="materialEnDesc">
                  <!-- :rules="[
                        { required: true, message:'材质英文描述不能为空', trigger: 'blur' },
                        { required: true, message:'材质英文描述不能为空', trigger: 'change' }
                      ]" -->
                  <Input v-model="productInfo.materialEnDesc" placeholder="请输入" :maxlength="50" clearable
                    :disabled="isDisabled" />
                </FormItem>
                <FormItem label="用途中文描述:" prop="usageCnDesc">
                  <!-- :rules="[
                        { required: true, message:'用途中文描述不能为空', trigger: 'blur' },
                        { required: true, message:'用途中文描述不能为空', trigger: 'change' }
                      ]"
                    > -->
                  <Input v-model="productInfo.usageCnDesc" placeholder="请输入" :maxlength="50" clearable
                    :disabled="isDisabled" />
                </FormItem>
                <FormItem label="用途英文描述:" prop="usageEnDesc">
                  <!-- :rules="[
                        { required: true, message:'用途英文描述不能为空', trigger: 'blur' },
                        { required: true, message:'用途英文描述不能为空', trigger: 'change' }
                      ]"
                    > -->
                  <Input v-model="productInfo.usageEnDesc" placeholder="请输入" :maxlength="50" clearable
                    :disabled="isDisabled" />
                </FormItem>
                <Form-item label="发货时效" prop="deliveryInterval" v-if="isSupplierTalg">
                  <dyt-select v-model="productInfo.deliveryInterval" :disabled="isDisabled">
                    <Option v-for="(item, index) in deliveryIntervalList" :value="item.value" :key="index">{{ item.name }}
                    </Option>
                  </dyt-select>
                </Form-item>
                <FormItem label="特殊标识:" prop="specialMarkList">
                  <dyt-select v-model="productInfo.specialMarkList" :disabled="isDisabled" :max-tag-count="1" multiple>
                    <Option v-for="item in specialMarkOption" :value="item.value" :key="item.value">{{ item.label
                    }}</Option>
                  </dyt-select>
                </FormItem>
              </div>
            </div>
          </div>
          <!-- 图片信息 -->
          <div class="productsCont" style="width:69.5%;margin-left:20px;position:relative;height:654px">
            <div class="productsTit padding-10" v-show="!isDisabled">
              <div id="producstPic">
                图片信息
              </div>
            </div>
            <div class="products-content" style="overflow:auto;height:540px">
              <!-- 占位图 -->
              <div class="picBox padding-10" v-if="productInfo.productImages && productInfo.productImages.length === 0">
                <Icon type="image" size="50" color="#d4d4d4"></Icon>
                <p>未添加图片</p>
              </div>
              <div class="padding-10 product-img-box">
                <!-- 显示图片 -->
                <CheckboxGroup v-model="delImgsValue">
                  <template>
                    <transition-group name="flip-list">
                      <div v-for="(path, index) in productInfo.productImages" :key="`${index}-${path}`"
                        style="display:inline" v-show="isShowPicList ? true : index < 5"
                        :style="isShowPicList ? 'width:100px;height:100px' : 'width:200px;height:200px'" draggable="true"
                        :class="{ active: oldVal == path && isActive == path }" @dragstart="dragStart(path, index)"
                        @dragenter="dragEnter(path, index)" @dragend="dragend(path, index)">
                        <div class="product-upload-list" :style="isShowPicList ? 'width:100px;height:100px' : ''">
                          <Checkbox :label="index">
                            <img :src="filenodeViewTargetUrl + path" :key="`${index}-${path}`">
                            <div class="product-upload-list-cover" style="padding-top:30%">
                              <Icon title="放大预览" type="ios-eye-outline" @click.native="showViewer(index)" />
                              <Icon title="设为主图" type="ios-home-outline" @click.native="setProductPrimaryImg(index)"
                                v-if="!isDisabled"></Icon>
                              <Icon title="删除" type="ios-trash-outline" @click.native="removeProductImg(index)"
                                v-if="!isDisabled"></Icon>
                            </div>
                          </Checkbox>
                          <!-- <img v-else :src="filenodeViewTargetUrl + path" :key="`${index}-${path}`"> -->
                        </div>
                      </div>
                    </transition-group>
                  </template>
                  <template v-for="(file, index) in uploadFiles">
                    <div :key="index" v-if="file.status !== 'finished'" class="product-upload-list">
                      <Progress v-if="file.showProgress" :percent="file.percentage"></Progress>
                    </div>
                  </template>
                </CheckboxGroup>
              </div>
              <Spin size="large" fix v-if="uploadFilesLoading"></Spin>
            </div>

            <div style="position:absolute;right:10px;top:45%">
              <Button class="pictureBtn" @click="loadingPicture">{{ isShowPicList ? '隐藏列表' : '展开列表' }}</Button>
            </div>

            <div style="margin-top:30px">
              <div class="urlBtn" style="position:absolute;right:30px;bottom:20px">
                <Button style="margin-right:10px;" @click="selectAllPic">{{ isAllSelectPic ? '取消全选' : '全选' }}</Button>
                <Button style="margin-right:10px;" @click="downloadSelectPic" :loading="downPicLoading">下载选中图片</Button>
                <Button @click="delImgs" style="margin-right:10px;" v-if="!isDisabled">删除选中图片</Button>
                <dytUpload v-if="!isDisabled" ref="uploadProductInfoImg" name="files" :headers="uploadFilesHeader"
                  :max-size="uploadFilesMaxSize" :on-exceeded-size="uploadExceedSize" :show-upload-list="false"
                  :format="['jpg', 'png', 'gif']" accept="image/*" :on-success="uploadFilesSuccess"
                  :on-error="uploadFilesError" :on-format-error="handleFormatError" multiple :before-upload="beforeUpload"
                  :action="uploadFilesUrl">
                  <Button icon="image" class="mr10">上传本地图片</Button>
                </dytUpload>
                <Button icon="link" @click="addNetWorkImg" v-if="!isDisabled">上传图片URL</Button>
              </div>
            </div>
          </div>
        </div>
        <!-- 报关信息 -->
        <div class="sxContent flex-30" v-if="!isSupplierTalg">
          <div class="productsTit padding-10">
            <div id="customs">
              报关信息
            </div>
          </div>
          <div class="products-content padding-10 form-item-flex-wrap">
            <!-- 报关中文名称 -->
            <Form-item label="报关中文名称" prop="cnHsName" :label-width="130"
              :rules="{ required: true, validator: hsNameMaxVerify, msg: '请输入报关中文名称', maxLength: 200, trigger: 'blur' }">
              <Input :disabled="isDisabled" v-model.trim="productInfo.cnHsName" placeholder="请输入报关中文名称" />
            </Form-item>
            <!-- 报关英文名称 -->
            <Form-item label="报关英文名称" prop="enHsName" :label-width="130"
              :rules="{ required: true, validator: enNameMaxVerify, msg: '请输入报关英文名称', maxLength: 200, trigger: 'blur' }">
              <Input :disabled="isDisabled" v-model.trim="productInfo.enHsName" placeholder="请输入报关英文名称" />
            </Form-item>
            <!-- 报关编码 -->
            <Form-item label="报关编码(HS Code)" prop="hsCode" :label-width="150"
              :rules="{ required: true, validator: hsCodeVerify, msg: '请输入报关编码(HS Code)', minLength: 10, maxLength: 10, trigger: 'blur' }">
              <Input :disabled="isDisabled" v-model.trim="productInfo.hsCode" placeholder="请输入报关编码（HS Code）"></Input>
            </Form-item>
          </div>
        </div>
        <!-- 商品属性 -->
        <div class="sxContent">
          <div class="productsCont">
            <div class="productsTit padding-10">
              <div id="basic">
                商品属性
              </div>
            </div>
            <div class="products-content padding-20 attrForm">
              <Row>
                <Col v-for="(attr, aIndex) in productInfo.attributeFomNew.attributeValueQOList" :key="`attr-${aIndex}`">
                <Form-item :label="`${attr.aliasName || ''}：`" :label-width="240"
                  :prop="`attributeFomNew.attributeValueQOList.${aIndex}.attributeValueIdList`"
                  :class="{ 'important-attribute': [2, '2'].includes(attr.isMandatory) }" :rules="[
                    { required: attr.isMandatory == 1, message: '必填项不能为空', trigger: 'blur', type: attr.type == 1 ? 'array' : 'number' },
                    { required: attr.isMandatory == 1, message: '必填项不能为空', trigger: 'change', type: attr.type == 1 ? 'array' : 'number' }
                  ]">
                  <dyt-select clearable v-model="attr.attributeValueIdList" :multiple="attr.type == 1"
                    style="width: 280px;" :disabled="isDisabled" filterable>
                    <Option v-for="(attrVal, vIndex) in attr.valueVOList" :value="attrVal.attributeValueId"
                      :key="`attrVal-${vIndex}`">{{ `${attrVal.cnValue}:${attrVal.enValue}` }}</Option>
                  </dyt-select>
                </Form-item>
                </Col>
              </Row>
            </div>
          </div>
        </div>
        <!-- 质检标准 -->
        <div class="productsCont normalTop">
          <!-- v-if="treeSelectCategoryJson[treeSelectCategoryValue] && !$common.isEmpty(treeSelectCategoryJson[treeSelectCategoryValue].qualityClassificationId)" -->
          <div class="productsTit padding-10">
            质检标准
          </div>
          <div class="products-content padding-20">
            <div>
              <Form-item label="质检类型" prop="checkType" style="display: inline-block;">
                <RadioGroup v-model="productInfo.checkType">
                  <Radio label="0">免检</Radio>
                  <Radio label="2">全检</Radio>
                  <Radio label="1">抽检</Radio>
                </RadioGroup>
              </Form-item>
              <Form-item label="质检比例(%)" prop="checkRate" style="display: inline-block;"
                :rules="{ validator: validateCheckRate, trigger: 'change' }">
                <Input :disabled="isDisabled || ![1, '1'].includes(productInfo.checkType)"
                  v-model.trim="productInfo.checkRate" placeholder="请输入质检比例" />
              </Form-item>
            </div>
            <qualityInspectionStandard v-if="!isLoadInfo" ref="qualityInspection" :product-id="productId"
              :disabled="isDisabled" :product-info="productInfo" :editProductModal="editProductModal"
              :product-category-list-data="productCategoryListData" />
          </div>
        </div>
        <!-- 商品描述 -->
        <div class="productsCont normalTop">
          <div class="productsTit padding-10">
            <div id="productDis">
              商品描述
            </div>
          </div>
          <div class="products-content padding-10 tabs-textmaterial">
            <div class="components-container">
              <Tabs v-model="langActiveTab" @on-click="langTabsSwitch" name="langTabName">
                <TabPane v-for="(item, index) in languageTab" :label="item.label" :name="item.key"
                  :key="`${index}-${item.key}`" tab="langTabName" />
              </Tabs>
              <!-- <Button class="tabs-btnpos" size="small" @click="openSizeChart">生成尺码图</Button> -->
              <Dropdown transfer @on-click="openSizeChart" class="tabs-btnpos" trigger="click">
                <Button size="small" type="primary">生成尺码图 <Icon type="ios-arrow-down"></Icon></Button>
                <DropdownMenu slot="list">
                  <DropdownItem :name="1">通用尺码图</DropdownItem>
                  <DropdownItem :name="2">婴童尺码图</DropdownItem>
                  <DropdownItem :name="3">儿童尺码图</DropdownItem>
                  <DropdownItem :name="4">女鞋尺码图</DropdownItem>
                </DropdownMenu>
              </Dropdown>

              <Form-item :label-width="90" label="关键词：">
                <local-tag-input style="width: 100%; display: inline-block" :disabled="isDisabled"
                  :tags="descriptionBOJson[langActiveTab]['keywords']" />
              </Form-item>
              <Tabs v-model="descActiveTab" type="card" @on-click="descTabsSwitch" name="descTabName">
                <TabPane v-for="(desc, dIndex) in descriptionTab" :label="desc.label" :name="desc.key"
                  :key="`${dIndex}-${desc.key}`" tab="descTabName" />
              </Tabs>
              <div class="editor-container">
                <UE :disabled="isDisabled" :content.sync="descriptionBOJson[langActiveTab][descActiveTab]"
                  :htmlStatus="false" v-show="initFinished && descActiveTab !== 'textDescription'"
                  id="productInfo.description.edit" :config=ueditorConfig ref="descdomeue" :isVisible.sync="isVisible"
                  @childType="getChildType" />
                <Input v-show="initFinished && descActiveTab === 'textDescription'" style="width: 100%;" type="textarea"
                  :autosize="{ minRows: 26, maxRows: 26 }" :maxlength="65536"
                  v-model="descriptionBOJson[langActiveTab][descActiveTab]" placeholder="请输入..." :disabled="isDisabled" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="tag-content-multiattribute tag-comtent-item" v-show="pageEditTag == 'multiattribute'">
        <!-- 商品多属性 -->
        <div class="productsCont normalTop">
          <div class="productsTit padding-10">
            <div id="productProperty">
              商品多属性
            </div>
          </div>
          <div class="products-content padding-10">
            <div class="propertyCont"> <!-- 云卖网产品 -->
              <Button @click="editAttributes"
                v-if="!isDisabled && productInfo.type != 1 && productInfo.productCategoryId !== '615703264498811431'">编辑多属性</Button>
              <Table class="normalTop" :columns="skuColumns" :data="skuData" :disabled-hover="true" border></Table>
            </div>
          </div>
        </div>
      </div>
      <div class="tag-content-productionInfo tag-comtent-item" v-show="pageEditTag == 'productionInfo'">
        <!-- 采购要求信息 -->
        <div class="sxContent flex-70" v-if="!isSupplierTalg">
          <div class="productsTit padding-10">
            <div id="customs">
              采购要求信息
            </div>
          </div>
          <div class="products-content purchase-content padding-10">
            <FormItem label="水洗唛:" prop="washedLabel" :label-width="90">
              <Input class="textarea-resize-none" v-model="productInfo.washedLabel" placeholder="请输入水洗唛，最多300字符"
                type="textarea" :maxlength="300" clearable :autosize="{ minRows: 2, maxRows: 4 }"
                :disabled="isDisabled" />
            </FormItem>
            <Form-item prop="washedLabelPdfPath" :label-width="120">
              <div slot="label">
                <div>水洗唛文件：</div>
                <div>(PDF/JPG/PNG)</div>
              </div>
              <dytUpload v-show="false" ref="washedUploadRef" name="files" :show-upload-list="false"
                accept="application/pdf,image/jpg,image/jpeg,image/png" :before-upload="washedUploadBefore"
                :action="uploadFilesUrl" />
              <div class="washed-operate">
                <Poptip trigger="hover" placement="left" v-if="!$common.isEmpty(productInfo.washedLabelPdfPath)" transfer>
                  <div class="washed-image-content">
                    <img :src="pdfFirstImgPreview" @click="previewWashedPdf" />
                    <Spin fix v-if="isWashedUploadLoading"></Spin>
                  </div>
                  <div class="washed-image-preview-content" slot="content">
                    <img :src="pdfFirstImgPreview" @click="previewWashedPdf" />
                  </div>
                </Poptip>
                <span class="click-text-underline" @click="opentCheckFile"
                  v-if="!isDisabled && $common.isEmpty(productInfo.washedLabelPdfPath)">
                  点击上传
                  <Spin fix v-if="isWashedUploadLoading"></Spin>
                </span>
                <template v-if="!$common.isEmpty(productInfo.washedLabelPdfPath)">
                  <span class="click-text-underline" @click="previewWashedPdf">预览</span>
                  <span class="click-text-underline" @click="opentCheckFile" v-if="!isDisabled">更换</span>
                  <span class="click-text-underline" v-if="!isDisabled" @click="removeWashedPdf">删除</span>
                </template>
              </div>
            </Form-item>
            <Form-item label="水洗唛word文件：" prop="washedLabelWordPath" :label-width="130">
              <uploadSampleFile v-model="productInfo.washedLabelWordFile" :disabled="isDisabled"
                accept-error-txt="文件格式不对，请上传格式为 docx、doc 的 word文档格式文件" :file-max-size="30" :upload-props="{
                  multiple: false,
                  accept: [
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                  ]
                }" />
            </Form-item>
            <Form-item label="纸样文件：" prop="patternFile" :label-width="120">
              <uploadSampleFile v-model="productInfo.patternFile" :disabled="isDisabled"
                accept-error-txt="文件格式不对，请上传格式为 pdf、excel、prj 的文件" :file-max-size="30" :upload-props="{
                  multiple: true,
                  accept: [
                    '.prj',
                    'application/pdf',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                  ]
                }" />
            </Form-item>
            <FormItem label="SPU生产要求:" prop="outerPackageRequirement"
              :rules="{ validator: validateOutPack, trigger: 'change' }" :label-width="90">
              <Input class="textarea-resize-none" v-model.trim="productInfo.outerPackageRequirement"
                placeholder="请输入SPU生产要求，最多200字符" type="textarea" clearable :autosize="{ minRows: 2, maxRows: 4 }"
                :disabled="isDisabled" />
            </FormItem>
            <Form-item label="生产尺码图：" :label-width="120">
              <div class="washed-operate">
                <Poptip trigger="hover" placement="left" v-if="!$common.isEmpty(dimensionPlan)">
                  <div class="washed-image-content">
                    <img :src="dimensionPlan" @click="previewImg(dimensionPlan)" />
                  </div>
                  <div class="washed-image-preview-content" slot="content">
                    <img :src="dimensionPlan" @click="previewImg(dimensionPlan)" />
                  </div>
                </Poptip>
                <img v-else :src="placeholderSrc"
                  style="width: 46px; height: 46px; object-fit: cover; vertical-align: middle; cursor: pointer;">
                <template v-if="!$common.isEmpty(dimensionPlan)">
                  <span class="click-text-underline" @click="previewImg(dimensionPlan)">预览</span>
                  <span class="click-text-underline" v-if="!isDisabled" @click="removePlanImg">删除</span>
                </template>
              </div>
            </Form-item>
          </div>
        </div>
        <!-- 物料资料 -->
        <div class="sxContent products-content flex-70">
          <div class="productsTit padding-10">
            <div id="customs">
              物料资料
            </div>
          </div>
          <materialData ref="materialRefDemo" :productData="productInfo" :disabled="isDisabled"
            :modelVisible="!spinShow" />
        </div>
        <!-- 车缝工价 -->
        <div class="sxContent products-content flex-70">
          <div class="productsTit padding-10">
            <div id="customs">
              车缝工价
            </div>
          </div>
          <sewingLaborRrate ref="sewingLaborRrateDemo" :productData="productInfo" :disabled="isDisabled"
            :modelVisible="!spinShow" />
        </div>
        <!-- 工艺要求 -->
        <div class="sxContent products-content flex-70">
          <div class="productsTit padding-10">
            <div id="customs">
              工艺要求
            </div>
          </div>
          <technologicalRequire ref="technologicalDemo" :productData="productInfo" :disabled="isDisabled"
            :modelVisible="!spinShow" />
        </div>
        <!-- 二次工艺要求 -->
        <div class="sxContent products-content flex-70">
          <div class="productsTit padding-10">
            <div id="customs">
              二次工艺要求
            </div>
          </div>
          <twiceCraftRequire ref="twiceCraftDemo" :productData="productInfo" :disabled="isDisabled"
            :modelVisible="!spinShow" />
        </div>
        <!-- 生产尺码图 -->
        <div class="sxContent products-content flex-70">
          <div class="productsTit padding-10">
            <div id="customs">
              生产尺码图
            </div>
          </div>
          <frameHoppingData ref="frameHoppingDemo" :productData="productInfo" :disabled="isDisabled"
            :modelVisible="!spinShow" :sizeList="sizeList" />
        </div>
      </div>
      <div class="tag-comtent-item" v-show="pageEditTag == 'salesLink'">
        <salesLinkView v-if="isDisabled" :module-data="salesViewData" :module-visible="pageEditTag == 'salesLink' && isDisabled" />
      </div>
    </Form>
    <!-- 上传图片url -->
    <Modal :transfer="false" v-model="addNetWorkUrlModal" title="从地址添加图片" :loading="waitingUrlOk"
      @on-ok="addNetWorkImgOk">
      <Form :label-width="100" label-position="left">
        <Form-item label="图片地址：">
          <Input ref="addNetWorkUrlInput" placeholder="http://"></Input>
        </Form-item>
      </Form>
    </Modal>

    <keep-alive>
      <Modal v-model="modifyProductGoodsImgModal" v-if="renderModifyProductGoodsImgModal" title="变参SKU图片选择">
        <div>
          <span style="font-size:24px;font-weight:600;margin-right:40px">SKU图片</span>
          <Checkbox v-model="isSynchroAllSkc" style="font-size:18px;font-weight:500">应用到所有SKC</Checkbox>
        </div>
        <div style="width:100px;height:100px;" class="product-upload-list"
          v-for="(productGoodsImage, index) in productGoodsImageArray" :key="`${productGoodsImage}-${index}`">
          <img :src="filenodeViewTargetUrl + productGoodsImage">
          <div class="product-upload-list-cover" style="padding-top:50px;">
            <Icon class="ml10" title="设为主图" type="ios-home-outline"
              @click.native="setProductGoodsPrimaryImg(productGoodsImage)"></Icon>
            <Icon class="mr10" title="删除" type="ios-trash-outline"
              @click.native="removeProductGoodsImg(productGoodsImage)"></Icon>
          </div>
        </div>
        <template v-for="(file, index) in uploadList">
          <div v-if="file.status !== 'finished'" class="product-upload-list" style="width:100px;height:100px;"
            :key="index">
            <Progress v-if="file.showProgress" :percent="file.percentage"></Progress>
          </div>
        </template>
        <dytUpload name="files" ref="uploadProductGoodsImg" :headers="uploadFilesHeader" :show-upload-list="false"
          :max-size="uploadFilesMaxSize" :on-exceeded-size="uploadExceedSizeModal" :format="['jpg', 'png', 'gif']"
          :on-error="uploadFilesErrorModal" :on-success="uploadFilesSuccessModal"
          :on-format-error="handleFormatErrorModal" :action="uploadFilesUrl" multiple :before-upload="beforeUploadModal"
          type="drag" style="display: inline-block;width:100px;">
          <div style="width: 100px;height:100px;line-height: 100px;">
            <Icon type="md-add" size="20"></Icon>
          </div>
        </dytUpload>
        <p style="margin-top:5px;margin-bottom:10px;">说明：
          <span style="color:red">上传图片会自动添加至SPU图库中</span>
        </p>
        <hr>
        <h2 style="margin-top:5px;margin-bottom:5px;">从SPU图库选择</h2>
        <template v-for="(productGoodsImage, index) in productInfo.productImages">
          <div style="width:100px;height:100px;" class="product-upload-list" v-if="productInfo.productImages"
            :key="productGoodsImage + index">
            <img :src="filenodeViewTargetUrl + productGoodsImage">
            <div class="product-upload-list-cover" style="padding-top:50px;">
              <Button @click="addSkuPic(index)" style="outline:none;box-shadow:none;" size="small" type="text">添加至SKU
              </Button>
            </div>
          </div>
        </template>
        <div style="width:100px;height:100px;" class="product-spu-list"
          v-if="productInfo.productImages && productInfo.productImages.length === 0">
          <Icon type="image" size="30" color="#d4d4d4"></Icon>
          <p>未添加图片</p>
        </div>
        <div slot="footer">
          <Button @click="confirModifyProductGoodsImg
            " type="primary">确定
          </Button>
          <Button @click="uploadModalCancel">取消</Button>
        </div>
      </Modal>
    </keep-alive>

    <Modal v-model="editVisible" :mask-closable="false" title="编辑多属性" @on-cancel="closeEdit" @on-ok="saveEdit"
      width="800px">
      <Table :columns="columns1" :data.sync="skuPropertyList" :border="true">
        <template slot-scope="{ row }" slot="name">
          <div>
            {{ row.name }}
          </div>
        </template>
        <template slot-scope="{ row, index }" slot="value">
          <div id="customTagInput">
            <template v-for="(value, index1) in row.values">
              <Tag v-if="index === 0" closable :key="`color-${index1}`"
                @on-close="delSkuPropertyValue(skuPropertyList[index], value, index1)"
                :style="`margin-left:4px;${getColorAll.includes(value) || isOldData ? '' : 'border:1px solid #f30;'}`">
                {{ value }}
              </Tag>
              <Tag v-else-if="index === 1" closable :key="`size-${index1}`"
                @on-close="delSkuPropertyValue(skuPropertyList[index], value, index1)"
                :style="`margin-left:4px;${getSizeVal.includes(value) || isOldData ? '' : 'border:1px solid #f30;'}`">
                {{ value }}
              </Tag>
              <Tag v-else closable :key="`tag-${index1}`"
                @on-close="delSkuPropertyValue(skuPropertyList[index], value, index1)" style="margin-left:4px;">
                {{ value }}
              </Tag>
            </template>

            <Input
              v-if="!skuPropertyList[index].isEdit && [0, 1, '0', '1'].includes(index) && (sizeList.length == 0 || isOldData)"
              class="inputValue" :disabled="row.isEdit" :ref="row.name" :maxlength="100"
              @keyup.native.enter="addSkuPropertyValue(skuPropertyList[index], index, 1)" placeholder="请输入属性值，按回车确认" />
            <Select
              v-if="skuPropertyList[index] && !skuPropertyList[index].isEdit && sizeList.length != 0 && index === 0 && !isOldData"
              class="inputValue" filterable :ref="row.name" placeholder="请选择商品颜色"
              @on-change="addSkuPropertyValue(skuPropertyList[index], index, 2)" :transfer="true">
              <Option v-for="(sitem, sindex) in colorList" :value="sitem.color" :key="sindex">{{ sitem.color }}</Option>
            </Select>
            <Cascader v-if="!skuPropertyList[index].isEdit && sizeList.length != 0 && index === 1 && !isOldData"
              class="inputValue" filterable :data="sizeList" :ref="row.name" placeholder="请选择商品尺码"
              @on-change="addSkuPropertyValue(skuPropertyList[index], index, 3)" :transfer="true">
            </Cascader>
          </div>
        </template>
        <template slot-scope="{ row, index }" slot="operate">
          <div>
            <Icon type="md-add-circle" style="font-size:25px" @click="addAttribute(skuPropertyList[index])" />
          </div>
        </template>
      </Table>
      <div v-if="isAttrTips" style="padding:10px 10px 0px 10px; color:#f30;font-size: 12px;">
        红色边框的属性不可用，新增多属性时，不再生成该属性的多属性信息</div>
    </Modal>

    <!-- 表格弹框 -->
    <table-edit :isVisible.sync="isVisible" :type="type" :languageType="langActiveTab"
      @tableEditcontent="tableEditcontent"></table-edit>

    <!-- 返回顶部 -->
    <!-- <BackTop></BackTop> -->
    <!-- 添加组装模态框 -->
    <addAssembleModal ref="addAssembleModal" @addTabData="addTabData" :openType="openType"
      :editAssembleIndex="editAssembleIndex"></addAssembleModal>

    <!-- 通用、女鞋尺码图 -->
    <sizeChart :chartModalVisible.sync="chartModalVisible" :productCategoryListData="productCategoryListData"
      :productInfo="productInfo" :sizeTypeFar="sizeTypeFar" :colorList="colorList" :sizeList="sizeList"
      :planType="planType" :skuPropertyList="skuPropertyList" @getSizePicture="getSizePicture"
      @insetDescription="insetDescription" />

    <!-- 婴童、儿童尺码图 -->
    <child-size-chart :isVisible.sync="childVisible" :childType="planType" :productInfo="productInfo"
      @getSizePicture="getSizePicture" :productCategoryListData="productCategoryListData"
      @insetDescription="insetDescription" />
    <!-- 分销编辑 -->
    <editDistribution :modelVisible.sync="distributionVisible" :distribution-info="distributionInfo"
      @distributionConfirm="distributionConfirm" />
    <!-- 绑定尺码组弹窗 -->
    <bindSizeGroupModal :modelVisible.sync="bindSizeGroupVisible" :moduleData="bindSizeModuleData"
      @confirmModal="editAttributes" />
    <Spin size="large" fix v-if="spinShow"></Spin>
  </div>
</template>

<script>
import api from '@/api/api';
import UE from '@/components/ue/ue.vue';
import Mixin from '@/components/mixin/common_mixin';
import tableMixin from '@/components/mixin/table_mixin';
import productMixin from '@/components/mixin/product_mixin';
// import { getToken } from '@/utils/cookie';
import addAssembleModal from './addAssembleModal';
import productData from '@/views/productCenter/components/productCenter/staticData/productData';
import sizeChart from '@/views/productCenter/components/productCenter/sizeChart/sizeChart';
import childSizeChart from '@/views/productCenter/components/productCenter/sizeChart/childSizeChart';
import tableEdit from '@/components/tableEdit/index.vue';
import 'viewerjs/dist/viewer.css'
import qualityInspectionStandard from './qualityInspectionStandard';
// import washedSginModal from './washedSginModal';
import bindSizeGroupModal from './bindSizeGroupModal';
import editDistribution from './editDistribution';
import uploadSampleFile from './uploadSampleFile';
import materialData from './materialData';
import sewingLaborRrate from './sewingLaborRrate';
import technologicalRequire from './technologicalRequire';
import twiceCraftRequire from './twiceCraftRequire';
import frameHoppingData from './frameHoppingData';
import salesLinkView from './salesLinkView';

// import { checkWashedData } from './productData';
import { api as viewerApi } from 'v-viewer'

export default {
  mixins: [Mixin, tableMixin, productMixin],
  components: {
    UE,
    addAssembleModal,
    sizeChart,
    childSizeChart,
    tableEdit,
    editDistribution,
    qualityInspectionStandard,
    uploadSampleFile,
    materialData,
    sewingLaborRrate,
    technologicalRequire,
    twiceCraftRequire,
    frameHoppingData,
    // washedSginModal,
    bindSizeGroupModal,
    salesLinkView
  },
  // 分类  品牌  特性标签  详情数据id
  props: {
    editProductModal: {
      type: Boolean,
      default: false
    },
    productCategoryListData: {
      type: Array,
      default: () => []
    },
    productCategoryIds: {
      type: Array,
      default: () => []
    },
    productBrandList: {
      type: Array,
      default: () => []
    },
    productTagList: {
      type: Array,
      default: () => []
    },
    productId: {
      type: String,
      default: ''
    },
    ymsMenuList: {
      type: Array,
      default: () => []
    },
    editStatus: {
      type: String,
      default: ''
    },
    originalCategoryData: {
      type: Array,
      default: () => []
    },
    productGoodsListDictionary: {
      type: Object,
      default: () => { }
    }
  },
  data() {
    var self = this;
    return {
      uploadFilesList: [],
      // checkWashedData: checkWashedData,
      isUploading: false,
      pageEditTag: 'baseInfo',
      tagList: [
        { label: '基础资料', value: 'baseInfo' },
        { label: '多属性资料', value: 'multiattribute' },
        { label: '生产资料', value: 'productionInfo' },
        { label: '销售链接', value: 'salesLink', powerKey: 'sales' }
      ],
      bindSizeGroupVisible: false,
      bindSizeModuleData: {},
      distributionVisible: false,
      specificationsObj: {},
      distributionInfo: {},
      uploadFilesTime: null,
      uploadFilesCalLback: () => { },
      uploadFilesLoading: false,
      qualityProductArray: [],
      childVisible: false,
      planType: null,
      downPicLoading: false,
      isWashedUploadLoading: false,
      // 编织类型：0-针织 1-梭织 2-毛织
      braidDataList: [
        { label: '针织', value: 0 },
        { label: '梭织', value: 1 },
        { label: '毛织', value: 2 }
      ],
      validateCol: {
        isWeight: [],
        isLength: [],
        isWidth: [],
        isHeight: [],
        isSuggestPrice: []
      },
      languageTab: [
        { key: 'EN', label: '英语' },
        { key: 'GER', label: '德语' },
        { key: 'FRA', label: '法语' },
        { key: 'SPN', label: '西班牙语' },
        { key: 'IT', label: '意大利语' },
        { key: 'POR', label: '葡萄牙语' },
        { key: 'CN', label: '中文' },
        { key: 'PLN', label: '波兰语' }
      ],
      descriptionTab: [
        { key: 'description', label: '复杂描述' },
        { key: 'simpleDescription', label: '简易描述' },
        { key: 'textDescription', label: '纯文本描述' },
        { key: 'highlightDescription', label: '亮点描述' },
        { key: 'packageDescription', label: '包裹描述' },
        { key: 'mobileDescription', label: '移动端描述' }
      ],
      langActiveTab: 'EN',
      descActiveTab: 'description',
      oldActiveLang: 'EN', // 语言类型切换时给变量赋值
      oldActiveDesc: 'description', // 描述类型切换时给变量赋值
      descriptionBOJson: {},
      productStatus: productData.productStatus,
      initGetTreeData: true,
      treeSelectCategoryValue: '',
      treeSelectCategoryJson: {},
      delImgsValue: [],
      businessRoleTypeList: [],
      editIndex: -1, // 修改货品图片(货品下标)
      minWidth: 200, // 表格制定列最小宽度
      waitingOk: false, // 点击确认按钮是否需要显示loading遮罩
      addNetWorkUrlModal: false, // 添加网络图片模态框标识
      initFinished: false, // 是否初始化完成
      customProductTagList: [], // 这个标签列表包含自定义标签
      productInfoPrototype: null, // 当前商品信息原型
      modifyProductGoodsImgModal: false, // 修改货品图片模态窗口显示隐藏标识
      renderModifyProductGoodsImgModal: false, // 渲染修改货品图片模态窗口
      checkedProductGoodsImages: [], // 已被选中的货品图片
      productGoodsImageArray: [], // 临时存放上传图片的数组
      productGoodsPrimaryImage: null, // 货品主图
      filenodeViewTargetUrl: self.$store.state.erpConfig.filenodeViewTargetUrl, // filenode根路径
      uploadFiles: [], // 商品图片信息列表
      uploadList: [], // 新增的图片列表
      waitingUrlOk: true, // 上传网络图片点击确认按钮是否需要显示loading遮罩
      uploadFilesUrl: api.upload_files + '?basePath=/product', // 上传url
      uploadFilesMaxSize: 10240, // 上传文件大小上线（kb）
      uploadMaxLength: 20, // 一次最多选中20个图片上传
      skuPropertyList: [], // 商品多属性列表
      productCategoryTree: [ // 商品分类树
        {
          title: '全部',
          expand: true,
          productCategoryId: 'productCategoryId1',
          disabled: true,
          children: []
        }
      ],
      specificationColorList: [ // 规格颜色
        '#169BD5', '#009900', '#763EAF', '#CC0033', '#FF9900', '#999999', '#33CC99', '#663300'
      ],
      salesViewData: {},
      // 属性信息
      attributeFom: {
        attributeValueQOList: [],
        productCategoryId: '',
        productId: ''
      },
      productInfo: { // 产品信息
        materialCnDesc: '',
        materialEnDesc: '',
        usageCnDesc: '',
        usageEnDesc: '',
        productId: '',
        braidType: null,
        type: 1,
        cnName: null,
        enName: null,
        spu: null,
        cnHsName: null,
        enHsName: null,
        // description: '',
        descriptionBOList: [],
        hsCode: null,
        checkType: '0',
        checkRate: '0',
        productBrandId: null,
        productCategoryId: null,
        ymsProductCategoryId: null,
        productImages: [],
        washedLabel: "", // 水洗唛
        patternFile: '', // 纸样文件
        washedLabelWordFile: {}, // 水洗唛WORD 文件
        washedLabelWordPath: '', // 水洗唛WORD路径
        washedLabelWordName: '', // 水洗唛WORD名称
        productGoodsMaterialInfoVOList: [], // 物料信息
        laPaApiProductTechnologyVOList: [], // 工艺信息
        machiningRate: null, // 工序(车缝工价)-加工倍率
        productProcessVOList: [], // 工序信息
        productManufactureVOList: [], // 尺码信息(跳码表)
        washedLabelPdfPath: null,
        washedLabelPdfName: null,
        outerPackageRequirement: '', //  生产要求
        productGoodsList: [
          {
            productGoodsId: null,
            sku: null,
            ean: null,
            upc: null,
            isbn: null,
            width: 0,
            height: 0,
            length: 0,
            weight: 0,
            status: 1,
            suggestPrice: 0,
            samplePrice: 0,
            sampleFreight: 0,
            productGoodsTags: [],
            productGoodsImages: [],
            productGoodsSpecifications: [],
            productTypeListValue: ['01'],
            productionRequirement: '', // sku 生产要求
            isAssemble: false, // 是否组装
            editStatus: false, // 是否重新编辑
            productGoodsAssembles: [] // 组装信息
          }
        ],
        operationType: 1, // 操作类型 0 暂存 1 提交
        deliveryInterval: 1,
        attributeFomNew: {
          attributeValueQOList: [],
          productCategoryId: '',
          productId: ''
        },
        specialMarkList: [],
      },
      specialMarkOption: [
        {
          value: '0',
          label: '抽真空'
        },
      ],
      deliveryIntervalList: [
        {
          value: 1,
          name: '1天'
        },
        {
          value: 2,
          name: '2天'
        },
        {
          value: 3,
          name: '3天'
        },
        {
          value: 4,
          name: '4天'
        },
        {
          value: 5,
          name: '5天'
        },
        {
          value: 6,
          name: '6天'
        },
        {
          value: 7,
          name: '7天'
        }
      ],
      skuData: [], // 货品数据
      skuColumns: [ // 货品表格
        {
          title: '图片',
          key: 'img',
          width: 80,
          fixed: 'left',
          align: 'center',
          render: (h, params) => {
            return h('img', {
              attrs: {
                src: self.productInfo.productGoodsList[params.index].productGoodsImages.length === 0
                  ? self.placeholderSrc
                  : self.filenodeViewTargetUrl + self.productInfo.productGoodsList[params.index].productGoodsImages[0],
                class: 'thumb-image thumb-image-pointer'
              },
              on: {
                'click': () => {
                  self.renderModifyProductGoodsImgModal = true;
                  self.$nextTick(() => {
                    self.modifyProductGoodsImgModal = true;
                    self.productGoodsImageArray = self.deepCopy(self.productInfo.productGoodsList[params.index].productGoodsImages);
                    self.isSynchroAllSkc = false;
                  });
                  self.editIndex = params.index;
                }
              }
            });
          }
        },
        {
          title: 'Color',
          key: 'color',
          minWidth: 100,
          align: 'center',
          render: (h, { row }) => {
            const productAttribute = this.treeSelectCategoryJson[this.productInfo.productCategoryId];
            let rowVal = '';
            if (row.productGoodsSpecifications && row.productGoodsSpecifications[0] && !this.$common.isEmpty(row.productGoodsSpecifications[0].value)) {
              rowVal = row.productGoodsSpecifications[0].value;
            }
            if ([1, '1'].includes(this.$common.isEmpty(productAttribute) ? '' : productAttribute.productType || '')) {
              return h('Input', {
                props: {
                  value: rowVal,
                  maxlength: 100,
                  placeholder: '请输入Color',
                  disabled: (() => {
                    return self.isDisabled;
                  })()
                },
                on: {
                  'input': (val) => {
                    rowVal = self.trim(val);
                  },
                  'on-blur': (val) => {
                    let newVal = [];
                    const oldRowVal = row.productGoodsSpecifications && row.productGoodsSpecifications[0] ? row.productGoodsSpecifications[0].value || '' : '';
                    // 赋值
                    this.skuData.forEach((item, index) => {
                      if (item.productGoodsSpecifications && item.productGoodsSpecifications[0] && oldRowVal === item.productGoodsSpecifications[0].value) {
                        this.$set(this.skuData[index].productGoodsSpecifications[0], 'value', rowVal);
                      }
                    })
                    this.skuPropertyList[0].values.forEach(item => {
                      newVal.push(oldRowVal === item ? rowVal : item);
                    })
                    this.$set(this.skuPropertyList[0], 'values', newVal);
                    this.productInfo.productGoodsList = this.deepCopy(this.skuData);
                    this.saveEdit();
                  }
                }
              });
            }
            return h('div', {}, rowVal);
          }
        },
        {
          title: `${this.columnSizeOrModal}`,
          key: 'size',
          minWidth: 100,
          align: 'center',
          renderHeader: (h, params) => {
            return h('div', {
            }, this.columnSizeOrModal);
          },
          render: (h, { row }) => {
            const productAttribute = this.treeSelectCategoryJson[this.productInfo.productCategoryId];
            let rowVal = '';
            if (row.productGoodsSpecifications && row.productGoodsSpecifications[1] && !this.$common.isEmpty(row.productGoodsSpecifications[1].value)) {
              rowVal = row.productGoodsSpecifications[1].value;
            }
            if ([1, '1'].includes(this.$common.isEmpty(productAttribute) ? '' : productAttribute.productType || '')) {
              return h('Input', {
                props: {
                  value: rowVal,
                  maxlength: 100,
                  placeholder: '请输入Size',
                  disabled: (() => {
                    return self.isDisabled;
                  })()
                },
                on: {
                  'input': (val) => {
                    rowVal = self.trim(val);
                  },
                  'on-blur': (val) => {
                    let newVal = [];
                    const oldRowVal = row.productGoodsSpecifications && row.productGoodsSpecifications[1] ? row.productGoodsSpecifications[1].value || '' : '';
                    // 赋值
                    this.skuData.forEach((item, index) => {
                      if (item.productGoodsSpecifications && item.productGoodsSpecifications[1] && oldRowVal === item.productGoodsSpecifications[1].value) {
                        this.$set(this.skuData[index].productGoodsSpecifications[1], 'value', rowVal);
                      }
                    })
                    this.skuPropertyList[1].values.forEach(item => {
                      newVal.push(oldRowVal === item ? rowVal : item);
                    });
                    this.$set(this.skuPropertyList[1], 'values', newVal);
                    this.productInfo.productGoodsList = this.deepCopy(this.skuData);
                    this.saveEdit();
                  }
                }
              });
            }
            return h('div', {}, rowVal);
          }
        },
        {
          title: 'SKU',
          key: 'sku',
          width: 90,
          align: 'center',
          renderHeader: (h, params) => {
            return h('div', {
            }, params.column.title);
          },
          render: (h, params) => {
            return h('div', [
              h('Input', {
                props: {
                  placeholder: '请输入' + 'SKU',
                  maxlength: 100,
                  value: self.productInfo.productGoodsList[params.index].sku,
                  disabled: true
                },
                on: {
                  'input': (val) => {
                    self.productInfo.productGoodsList[params.index].sku = self.trim(val);
                  }
                }
              })
            ]);
          }
        },
        {
          title: 'SKC',
          key: 'skc',
          width: 85,
          align: 'center',
          renderHeader: (h, params) => {
            return h('div', {
            }, params.column.title);
          },
          render: (h, params) => {
            return h('div', [
              h('Input', {
                props: {
                  placeholder: '请输入SKC',
                  maxlength: 100,
                  value: self.productInfo.productGoodsList[params.index].skc,
                  disabled: true
                },
                on: {
                  'input': (val) => {
                    self.productInfo.productGoodsList[params.index].skc = val;
                  }
                }
              })
            ]);
          }
        },
        {
          title: '重量',
          key: 'weight',
          width: 80,
          align: 'center',
          renderHeader: (h, params) => {
            return self.checkIdenticalDon(h, params, '重量', self.productInfo.productGoodsList, 'weight', this.skuData);
          },
          render: (h, params) => {
            return h('InputNumber', {
              props: {
                min: 0,
                precision: 0,
                value: self.productInfo.productGoodsList[params.index].weight || 0,
                disabled: (() => {
                  return self.isDisabled;
                })()
              },
              class: `isWeight-${params.index}`,
              style: {
                width: '70px'
              },
              on: {
                'input': (val) => {
                  self.productInfo.productGoodsList[params.index].weight = val;
                }
              }
            });
          }
        },
        {
          title: '尺寸（长，宽，高）cm',
          key: 'spuTableSize',
          width: 140,
          align: 'center',
          renderHeader: (h, params) => {
            return self.checkIdenticalDon(h, params, '尺寸（长，宽，高）cm', self.productInfo.productGoodsList, [
              'length', 'width', 'height'
            ], this.skuData);
          },
          render: (h, params) => {
            return h('div', { style: { display: 'flex', flexDirection: 'column' } }, [
              h('div', [
                h('span', {}, '长：'),
                h('InputNumber', {
                  style: {
                    width: '70px',
                    margin: '5px 0'
                  },
                  props: {
                    min: 0,
                    value: self.productInfo.productGoodsList[params.index].length || 0,
                    placeholder: '长',
                    disabled: (() => {
                      return self.isDisabled;
                    })()
                  },
                  class: `isLength-${params.index}`,
                  on: {
                    'input': (val) => {
                      self.productInfo.productGoodsList[params.index].length = val;
                    }
                  }
                })
              ]),
              h('div', [
                h('span', {}, '宽：'),
                h('InputNumber', {
                  style: {
                    width: '70px',
                    margin: '5px 0'
                  },
                  props: {
                    min: 0,
                    value: self.productInfo.productGoodsList[params.index].width || 0,
                    placeholder: '宽',
                    disabled: (() => {
                      return self.isDisabled;
                    })()
                  },
                  class: `isWidth-${params.index}`,
                  on: {
                    'input': (val) => {
                      self.productInfo.productGoodsList[params.index].width = val;
                    }
                  }
                })
              ]),
              h('div', [
                h('span', {}, '高：'),
                h('InputNumber', {
                  style: {
                    width: '70px',
                    margin: '5px 0'

                  },
                  props: {
                    min: 0,
                    value: self.productInfo.productGoodsList[params.index].height || 0,
                    placeholder: '高',
                    disabled: (() => {
                      return self.isDisabled;
                    })()
                  },
                  class: `isHeight-${params.index}`,
                  on: {
                    'input': (val) => {
                      self.productInfo.productGoodsList[params.index].height = val;
                    }
                  }
                })
              ])
            ]);
          }
        },
        {
          title: '特性标签',
          key: 'tagName',
          align: 'center',
          minWidth: 200,
          renderHeader: (h, params) => {
            return self.checkIdenticalDon(h, params, '特性标签', self.productInfo.productGoodsList, 'productGoodsTags', this.skuData);
          },
          render: (h, params) => {
            let productTagBox = [];
            self.customProductTagList.forEach((n, i) => {
              productTagBox.push(h('Option', {
                props: {
                  value: n
                }
              }, n));
            });
            let productLabelSelect = h('Select', {
              props: {
                placeholder: '请选择' + '特性标签',
                filterable: true,
                transfer: true,
                multiple: true,
                value: self.productInfo.productGoodsList[params.index].productGoodsTags,
                disabled: (() => {
                  return self.isDisabled;
                })()
              },
              on: {
                'on-enter': (event) => {
                  let productGoodsTagsSelectInput = event.target;
                  let value = productGoodsTagsSelectInput.value === null
                    ? ''
                    : self.trim(productGoodsTagsSelectInput.value);
                  if (value !== '' && value.length <= 50 && self.customProductTagList.indexOf(value) === -1) {
                    self.customProductTagList.push(value);
                    self.productInfo.productGoodsList[params.index].productGoodsTags.push(value);
                  } else {
                    self.$Message.error('新增标签长度不能超过50且不能与已存在标签重复');
                  }
                },
                'on-change': (event) => {
                  self.productInfo.productGoodsList[params.index].productGoodsTags = event;
                }
              }
            }, productTagBox);
            return productLabelSelect;
          }
        },
        {
          title: self.textTalg,
          key: 'suggestPrice',
          minWidth: 80,
          align: 'center',
          renderHeader: (h, params) => {
            // return h('div', self.textTalg);
            return self.checkIdenticalDon(h, params, self.textTalg, self.productInfo.productGoodsList, 'suggestPrice', this.skuData);
          },
          render: (h, params) => {
            // const suggestPriceIsEmpty = this.$common.isEmpty(self.productInfo.productGoodsList[params.index].suggestPrice);
            // if (this.$common.isEmpty(self.productInfo.productGoodsList[params.index].productId)) {
            //   return h('InputNumber', {
            //     props: {
            //       min: 0,
            //       value: self.productInfo.productGoodsList[params.index].suggestPrice || 0,
            //       disabled: (() => {
            //         return self.isDisabled;
            //       })()
            //     },
            //     style: {
            //       width: '60px'
            //     },
            //     class: `isSuggestPrice-${params.index}`,
            //     on: {
            //       'input': (val) => {
            //         self.productInfo.productGoodsList[params.index].suggestPrice = val;
            //       }
            //     }
            //   });
            // }
            // return h('span', suggestPriceIsEmpty ? '' : self.productInfo.productGoodsList[params.index].suggestPrice);
            return h('InputNumber', {
              props: {
                min: 0,
                value: self.productInfo.productGoodsList[params.index].suggestPrice || 0,
                disabled: (() => {
                  return self.isDisabled;
                })()
              },
              style: {
                width: '60px'
              },
              on: {
                'input': (val) => {
                  self.productInfo.productGoodsList[params.index].suggestPrice = val;
                }
              }
            });
          }
        },
        {
          title: '分销',
          key: 'distributionPriceValue',
          minWidth: 80,
          align: 'center',
          renderHeader: (h, params) => {
            return this.checkIdenticalDon(h, params, '分销', this.productInfo.productGoodsList, ['distributionPriceType', 'distributionPriceValue'], this.skuData);
          },
          render: (h, { row, index }) => {
            let text = '';
            if (this.$common.isEmpty(row.distributionPriceType) || this.$common.isEmpty(row.distributionPriceValue)) {
              text = `0${(this.$common.isEmpty(row.distributionPriceType) || row.distributionPriceType == 1) ? ' %' : ''}`;
            } else {
              const distributionPriceValue = Number(row.distributionPriceValue);
              const isMaxZeno = distributionPriceValue > 0;
              if (distributionPriceValue == 0) {
                text = `${distributionPriceValue} ${row.distributionPriceType == 1 ? '%' : ''}`;
              } else {
                text = `${isMaxZeno ? '+' : '-'} ${distributionPriceValue * (isMaxZeno ? 1 : -1)}${row.distributionPriceType == 1 ? ' %' : ''}`;
              }
            }
            let item = [h('div', {
              style: {
                'line-height': '20px'
              },
            }, text)];
            if (!this.isDisabled) {
              item.push(h('div', {
                style: {
                  'cursor': 'pointer',
                  'text-decoration': 'underline',
                  'color': '#2d8cf0',
                  'line-height': '20px'
                },
                on: {
                  'click': () => {
                    this.distributionInfo = {
                      index: index,
                      row: row
                    }
                    this.$nextTick(() => {
                      this.distributionVisible = true;
                    })
                  }
                }
              }, '修改'));
            }
            return h('div', item);
          }
        },
        {
          title: '商品状态',
          key: 'status',
          width: 90,
          align: 'center',
          renderHeader: (h, params) => {
            return self.checkIdenticalDon(h, params, '商品状态', self.productInfo.productGoodsList, 'status', this.skuData);
          },
          render: (h, params) => {
            let list = []
            this.productStatus.forEach(item => {
              list.push(h('Option', {
                props: {
                  value: item.value
                }
              }, item.label))
            });
            return h('Select', {
              style: {
                width: '70px'
              },
              props: {
                transfer: true,
                value: self.productInfo.productGoodsList[params.index].status === null || self.productInfo.productGoodsList[params.index].status === undefined
                  ? 1
                  : self.productInfo.productGoodsList[params.index].status,
                disabled: (() => {
                  return self.isDisabled;
                })()
              },
              on: {
                'input': (val) => {
                  self.productInfo.productGoodsList[params.index].status = val;
                }
              }
            }, list);
          }
        },
        {
          title: '组装信息',
          key: 'assemble',
          width: 90,
          align: 'center',
          renderHeader: (h, params) => {
            return self.checkIdenticalDon(h, params, '组装信息', self.productInfo.productGoodsList, [
              'isAssemble', 'productGoodsAssembles'
            ], this.skuData);
          },
          render: (h, params) => {
            if (self.productInfo.productGoodsList[params.index].isAssemble) {
              return h('div', [
                h('i-switch', {
                  props: {
                    value: !!self.productInfo.productGoodsList[params.index].isAssemble,
                    disabled: (() => {
                      return self.isDisabled;
                    })()
                  },
                  on: {
                    'on-change': (val) => {
                      if (val) {
                        self.productInfo.productGoodsList[params.index].isAssemble = true;
                      } else {
                        self.productInfo.productGoodsList[params.index].isAssemble = false;
                      }
                    }
                  }
                }), h('span', {
                  style: {
                    cursor: 'pointer',
                    color: '#0000FF',
                    marginLeft: '10px',
                    textDecoration: 'underline',
                    display: (() => {
                      if (self.isDisabled) {
                        return 'none';
                      } else {
                        return 'inline';
                      }
                    })()
                  },
                  on: {
                    click: () => {
                      self.editAssemble(params.index);
                    }
                  }
                }, '编辑')
              ]);
            } else {
              return h('i-switch', {
                props: {
                  value: !!self.productInfo.productGoodsList[params.index].isAssemble,
                  disabled: (() => {
                    return self.isDisabled;
                  })()
                },
                on: {
                  'on-change': (val) => {
                    if (val) {
                      self.productInfo.productGoodsList[params.index].isAssemble = true;
                    } else {
                      self.productInfo.productGoodsList[params.index].isAssemble = false;
                    }
                  }
                }
              });
            }
          }
        },
        {
          title: '产品类型',
          width: 125,
          key: 'productType',
          align: 'center',
          renderHeader: (h, params) => {
            return self.checkIdenticalDon(h, params, '产品类型', self.productInfo.productGoodsList, 'productTypeListValue', this.skuData);
          },
          render: (h, params) => {
            return h('Select', {
              props: {
                multiple: true,
                filterable: true,
                transfer: true,
                value: self.productInfo.productGoodsList[params.index].productTypeListValue,
                disabled: (() => {
                  return self.isDisabled;
                })()
              },
              on: {
                'on-change'(value) {
                  if (value.length > 1 && value.indexOf('01') > -1) {
                    value.forEach((i, j) => {
                      if (i === '01') {
                        value.splice(j, 1);
                      }
                    });
                    self.productInfo.productGoodsList[params.index].productTypeListValue = value;
                  } else if (value.length === 0) {
                    self.productInfo.productGoodsList[params.index].productTypeListValue = ['01'];
                  } else {
                    self.productInfo.productGoodsList[params.index].productTypeListValue = value;
                  }
                }
              }
            }, self.productTypeList.map(i => {
              return h('Option', { props: { value: i.value } }, i.name);
            }));
          }
        },
        {
          title: 'UPC',
          key: 'upc',
          minWidth: 100,
          align: 'center',
          renderHeader: (h, params) => {
            return self.checkIdenticalDon(h, params, 'UPC', self.productInfo.productGoodsList, 'upc', this.skuData);
          },
          render: (h, params) => {
            return h('Input', {
              props: {
                value: self.productInfo.productGoodsList[params.index].upc,
                maxlength: 100,
                placeholder: '请输入' + 'UPC',
                disabled: (() => {
                  return self.isDisabled;
                })()
              },
              on: {
                'input': (val) => {
                  self.productInfo.productGoodsList[params.index].upc = self.trim(val);
                }
              }
            });
          }
        },
        {
          title: 'EAN',
          key: 'ean',
          width: 100,
          align: 'center',
          renderHeader: (h, params) => {
            return self.checkIdenticalDon(h, params, 'EAN', self.productInfo.productGoodsList, 'ean', this.skuData);
          },
          render: (h, params) => {
            return h('Input', {
              props: {
                value: self.productInfo.productGoodsList[params.index].ean,
                maxlength: 100,
                placeholder: '请输入' + 'EAN',
                disabled: (() => {
                  return self.isDisabled;
                })()
              },
              on: {
                'input': (val) => {
                  self.productInfo.productGoodsList[params.index].ean = self.trim(val);
                }
              }
            });
          }
        },
        {
          title: 'ISBN',
          key: 'isbn',
          width: 100,
          align: 'center',
          renderHeader: (h, params) => {
            return self.checkIdenticalDon(h, params, 'ISBN', self.productInfo.productGoodsList, 'isbn', this.skuData);
          },
          render: (h, params) => {
            return h('Input', {
              props: {
                value: self.productInfo.productGoodsList[params.index].isbn,
                maxlength: 100,
                placeholder: '请输入' + 'ISBN',
                disabled: (() => {
                  return self.isDisabled;
                })()
              },
              on: {
                'input': (val) => {
                  self.productInfo.productGoodsList[params.index].isbn = self.trim(val);
                }
              }
            });
          }
        },
        {
          title: 'SKU生产要求',
          key: 'productionRequirement',
          width: 160,
          align: 'center',
          renderHeader: (h, params) => {
            return self.checkIdenticalDon(h, params, 'SKU生产要求', self.productInfo.productGoodsList, 'productionRequirement', this.skuData);
          },
          render: (h, params) => {
            // return h('Input', {
            //   props: {
            //     value: self.productInfo.productGoodsList[params.index].productionRequirement,
            //     maxlength: 200,
            //     placeholder: '请输入SKU生产要求',
            //     disabled: (() => {
            //       return self.isDisabled;
            //     })()
            //   },
            //   on: {
            //     'input': (val) => {
            //       self.productInfo.productGoodsList[params.index].productionRequirement = self.trim(val);
            //     }
            //   }
            // });
            return h('dyt-input-tag', {
              style: {
                minWidth: 'auto',
              },
              props: {
                type: 'textarea',
                string: true,
                limit: 1,
                value: self.productInfo.productGoodsList[params.index].productionRequirement,
                placeholder: '请输入SKU生产要求，特殊收货要求请用“【” “】”符号进行圈中, 最多200字符',
                disabled: (() => {
                  return self.isDisabled;
                })(),
                inputConfig: {
                  maxlength: 200,
                },
              },
              on: {
                'change': (val) => {
                  self.productInfo.productGoodsList[params.index].productionRequirement = self.trim(val);
                }
              }
            });
          }
        },
        {
          title: '操作',
          fixed: 'right',
          align: 'center',
          key: 'options',
          width: 75,
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'text',
                  disabled: (() => {
                    return self.isDisabled;
                  })()
                },
                on: {
                  click: () => {
                    self.skuData.splice(params.index, 1);
                    if (self.skuData.length !== 0) {
                      self.productInfo.productGoodsList.splice(params.index, 1);
                    } else {
                      self.productInfo.productGoodsList[0].productGoodsSpecifications = [];
                    }
                  }
                }
              }, '删除')
            ]);
          }
        }
      ],
      editAssembleIndex: null, // 变参组装信息  当前编辑的下表
      openType: null, // 1 普通商品  2 变参商品
      categoryList: [], // 类目
      sizeChartdata: [],
      sizeChartColumns: [],
      classifyTalg: 'edit', // 记录在编辑页面云卖分类的状态： look -- 查看状态， edit-- 编辑状态， change -- 切换其他云卖分类模板
      templateObj: {},
      editObj: {},
      sizeJsonData: {},
      hideSizeChart: true,
      editor: null,
      isShowPicList: false,
      picNum: 5,
      editVisible: false,
      columns1: [
        {
          title: '名称',
          slot: 'name',
          width: 200
        },
        {
          title: '属性值',
          slot: 'value'
        },
        {
          title: '操作',
          slot: 'operate',
          width: 80,
          align: 'center'
        }
      ],
      selectedValue: '',
      colorList: [],
      sizeList: [],
      visible: false,
      skuDataOld: [],
      skuPropertyListOld: [],
      productInfoOld: {},
      chartModalVisible: false,
      commodiAttr: {
        laPaProductVariQuotationList: []
      },
      categoryChange: false,
      sizeTypeFar: null,
      productTypeFar: '',
      spinShow: true,
      isLoadInfo: true,
      isActive: 0,
      oldVal: 0,
      oldValIndex: null,
      newOld: 0,
      newOldIndex: null,
      isClick: false,
      firstProductInfo: {},
      isOldData: false,
      columnSizeOrModal: '',
      isVisible: false,
      type: null,
      viewerImages: [],
      pdfFirstImgPreview: '',
      isSynchroAllSkc: false
    };
  },
  watch: {
    // 监听多文本输入
    initFinished(n) {
      if (n) {
        this.$nextTick(() => {
          this.editor = this.$refs['descdomeue'].editor;
          let userInfo = this.$store.state.erpConfig.userInfo;
          this.editor.addListener('ready', () => {
            this.editor.execCommand('serverparam', {
              'basePath': 'product-service',
              'userId': userInfo.merchantId + ',' + userInfo.userId
            })
          })
          this.$nextTick(() => {
            let content = this.descriptionBOJson[this.langActiveTab] && this.descriptionBOJson[this.langActiveTab][this.descActiveTab];
            this.editor.setContent(content);
          })
        })
      }
    },
    addNetWorkUrlModal(n, o) { // 重置网络图片模态窗
      if (!n) {
        this.$refs.addNetWorkUrlInput.$refs.input.value = '';
      }
    },
    checkedProductGoodsImages(n, o) { // 如果不勾选图片那么切换主图
      if (this.checkedProductGoodsImages.indexOf(this.productGoodsPrimaryImage) === -1) {
        this.productGoodsPrimaryImage = this.checkedProductGoodsImages[0] || null;
      }
    },
    productGoodsPrimaryImage(n, o) { // 勾选主图时如果没有选择那么默认勾选上
      if (this.checkedProductGoodsImages.indexOf(n) === -1) {
        this.checkedProductGoodsImages.push(n);
      }
    },
    // 监听窗口显示隐藏,隐藏时重置数据
    editProductModal: {
      immediate: true,
      deep: true,
      handler(n) {
        if (n) { // 初始化数据
          this.categoryChange = false;
          this.isOldData = false;
          this.spinShow = true;
          this.delImgsValue = [];
          // 获取商品详情
          this.axios.get(api.productInfo_detail + this.productId).then(response => {
            if (response.data.code === 0) {
              let productInfo = response.data.datas;
              this.$set(productInfo, 'washedLabelWordFile', {});
              if (!this.$common.isEmpty(productInfo.washedLabelWordPath)) {
                productInfo.washedLabelWordFile.fileName = productInfo.washedLabelWordName || productInfo.washedLabelWordPath;
                productInfo.washedLabelWordFile.fileUrl = productInfo.washedLabelWordPath;
              }
              const url = productInfo.washedLabelPdfPath;
              if (!this.$common.isEmpty(url)) {
                this.isWashedUploadLoading = true;
                const suffix = url.substring(url.lastIndexOf('.'), url.length);
                if (suffix.toLocaleLowerCase() == '.pdf') {
                  this.$common.getPdfRes({
                    pdfUrl: `./filenode/s${url}`,
                    pageNumber: 1,
                    scale: 10
                  }).then(img => {
                    this.pdfFirstImgPreview = img;
                  }).finally(() => {
                    this.isWashedUploadLoading = false;
                  })
                } else {
                  this.pdfFirstImgPreview = `./filenode/s${url}`;
                  this.isWashedUploadLoading = false;
                }
              }
              this.firstProductInfo = this.deepCopy(response.data.datas)
              this.initCategoryTree(productInfo.productCategoryId);
              this.$set(this.attributeFom, 'productCategoryId', productInfo.productCategoryId);
              this.$set(this.attributeFom, 'productId', productInfo.productId);
              // 销售链接数据
              this.salesViewData = {
                productGoodsList: productInfo.productGoodsList || [],
                list: productInfo.productGoodsPlatformUrls || []
              };
              // 获取分类属性值
              this.getAttributeData(productInfo, true);
              if (this.isSupplierTalg) {
                if (productInfo.ymsProductCategoryId) {
                  this.initYmsCategoryTree(productInfo.ymsProductCategoryId);
                  if (this.isDisabled) {
                    this.handlerTemplate(productInfo.productSizeList, productInfo.ymsProductCategoryId);
                    this.classifyTalg = 'look';
                  } else {
                    // 判断当前的商品是否已经过尺码模板
                    if (productInfo.sizeJson === null) {
                      this.classifyTalg = 'change';
                      this.getTemplateData(productInfo.ymsProductCategoryId);
                    } else {
                      this.classifyTalg = 'edit';
                      this.handlerTemplate(productInfo.productSizeList, productInfo.ymsProductCategoryId);
                      this.sizeJsonData = JSON.parse(productInfo.sizeJson);
                    }
                  }
                }
              }
              this.$nextTick(() => {
                this.checkOldData();
                this.initProductInfo(productInfo);
                this.reloadSkuColumn();
                this.getSizeList().then(() => {
                  this.disabledTreeItem();
                });
                this.loadPicture();
                setTimeout(() => {
                  this.initFinished = true;
                  this.initProductGoods(productInfo.productGoodsList);
                  /* if (this.skuPropertyList.length == 0) {
                    this.addColorSize();
                  } */
                }, 100)
                this.spinShow = false;
              });
              this.isLoadInfo = false;
            } else {
              this.spinShow = false;
            }
          }).catch(() => {
            this.spinShow = false;
          });
          this.$parent.$parent.productId = null;
          this.$refs.editSpu.scrollTop = 0;
          this.uploadFiles = this.$refs.uploadProductInfoImg && this.$refs.uploadProductInfoImg.fileList;
          this.isShowPicList = false;
          this.customProductTagList = this.deepCopy(this.productTagList);
        } else {
          this.locationErrorInput('baseInfo');
          this.isLoadInfo = true;
          this.spinShow = true;
        }
      }
    },
    renderModifyProductGoodsImgModal(n, o) {
      if (n) {
        this.$nextTick(() => {
          this.uploadList = this.$refs.uploadProductGoodsImg.fileList;
        });
      }
    },
    skuPropertyList: {
      handler(data) {
        if (this.classifyTalg === 'edit') {
          if (data.length > 0) {
            data.map((item) => {
              if (item.name === '尺码') {
                item.values.map((ele) => {
                  this.sizeChartdata.push(Object.assign({}, this.editObj, { sizeCode: ele }));
                });
              }
            });
            this.sizeChartdata = this.uniqueFunc(this.sizeChartdata, 'sizeCode');
          }
        } else if (this.classifyTalg === 'change') {
          this.sizeChartdata = [];
          if (data.length > 0) {
            data.map((item) => {
              if (item.name === '尺码') {
                item.values.map((ele) => {
                  this.sizeChartdata.push(Object.assign({}, { size: ele }, this.templateObj));
                });
              }
            });
          }
        }
      },
      deep: true
    },
    'productInfo.productImages': {
      handler(val) {
        if (val) {
          let arr = []
          val.forEach(k => {
            let temp = {
              'dataSource': this.filenodeViewTargetUrl + k
            }
            arr.push(temp)
          })
          this.viewerImages = arr
        }
      },
      immediate: true,
      deep: true
    },
    'productInfo.checkType': {
      deep: true,
      handler(val) {
        if ([0, '0'].includes(val)) {
          this.$set(this.productInfo, 'checkRate', '0');
          return;
        }
        if ([1, '1'].includes(val)) {
          const rate = Number(this.productInfo.checkRate);
          const lastRate = this.$common.isEmpty(rate) ? '1' : rate > 1 && rate < 100 ? Math.floor(rate).toString() : '1';
          this.$set(this.productInfo, 'checkRate', lastRate);
          return;
        }
        if ([2, '2'].includes(val)) {
          this.$set(this.productInfo, 'checkRate', '100');
        }
      }
    },
    isUploading(val) {
      val && this.uploadFilesListHand();
    }
  },
  beforeCreate() {

  },
  created() {
    this.textInit();
    this.productInfoPrototype = this.deepCopy(this.productInfo);
    this.getCommodityDeveloper();
    this.getColorList();
  },
  computed: {
    uploadFilesHeader() {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    },
    // 是否为服装分类类型
    isClothingType() {
      const selectCategoryType = this.getTypeInfo(this.treeSelectCategoryValue);
      if (this.$common.isEmpty(selectCategoryType)) return false;
      return selectCategoryType.productType == '0';
    },
    // 颜色所有值
    getColorAll() {
      if (this.$common.isEmpty(this.colorList)) return [];
      return this.colorList.map(m => m.color);
    },
    // 获取尺码末级的值
    getSizeVal() {
      if (this.$common.isEmpty(this.sizeList)) return [];
      const sizeVal = this.handSizeList(this.sizeList);
      return sizeVal;
    },
    // 是否存在多余的多属性
    isAttrTips() {
      const notItem = this.skuPropertyList.filter((item, index) => {
        if (index == 0 && this.sizeList.length != 0 && !this.isOldData) {
          return !this.$common.isEmpty(item.values.find(f => {
            return !this.getColorAll.includes(f);
          }));
        } else if (index == 1 && this.sizeList.length != 0 && !this.isOldData) {
          return !this.$common.isEmpty(item.values.find(f => {
            return !this.getSizeVal.includes(f);
          }));
        }
        return false;
      })
      return !this.$common.isEmpty(notItem);
    },
    isAllSelectPic() {
      if (this.$common.isEmpty(this.productInfo.productImages) || this.$common.isEmpty(this.delImgsValue)) return false;
      return this.productInfo.productImages.length == this.delImgsValue.length;
    },
    // 尺码图
    dimensionPlan() {
      if (this.$common.isEmpty(this.productInfo)) return '';
      let productImageList = this.productInfo.productImageTypeList || [];
      if (this.$common.isEmpty(productImageList)) {
        productImageList = this.productInfo.productImageList || [];
      }
      if (this.$common.isEmpty(productImageList)) return '';
      const planImgObj = productImageList.find(f => {
        return [2, 3, 4, '2', '3', '4'].includes(f.imageType);
      })
      if (this.$common.isEmpty(planImgObj)) return;
      return `${this.filenodeViewTargetUrl}${planImgObj.path}`;
    },
    permission() {
      return {
        synchronous: this.getPermission('productInfo_synListing'), // 同步Listing权限
        update: this.getPermission('productInfo_update'), // 编辑商品详情权限
        sales: this.isDisabled,
      }
    },
    // 是否禁用编辑
    isDisabled() {
      if (this.editStatus === 'add') return false;
      if (this.editStatus === 'eidt') return !this.permission.update;
      return this.editStatus === 'look';
    },
    // 是否是供应商商户
    isSupplierTalg() {
      return this.$store.state.erpConfig.merchant.isSupplier === 1;
    },
    // 登录人信息
    securityUser() {
      if (!this.$store.getters['authUserInfo']) return {};
      return this.$store.getters['authUserInfo'].securityUser || {};
    },
    // 百度编辑器设置(富文本编辑器 配置)
    ueditorConfig() {
      let ueditorServer = `${api.product_ueditor_enter}?basePath=product-service`;
      if (!this.$common.isEmpty(this.securityUser) && !this.$common.isEmpty(this.securityUser.erpUserId)) {
        ueditorServer = `${ueditorServer}&userId=${this.securityUser.erpUserId}`
      }
      return {
        initialFrameWidth: null,
        initialFrameHeight: 500,
        serverUrl: ueditorServer,
        wordCount: false
      }
    },
    textTalg() {
      return this.$store.state.erpConfig.merchant.isSupplier === 1
        ? '分销价格'
        : '采购成本价';
    }
  },
  methods: {
    handSizeList(data, oldVal = [], key) {
      let valList = [...oldVal];
      data.forEach(item => {
        if (!item.disabled) {
          if (item.children) {
            valList = [...valList, ...this.handSizeList(item.children, valList, 'key')];
          } else {
            valList.push(item.size);
          }
        }
      });
      return this.$common.arrRemoveRepeat(valList);
    },
    // 往前追溯分类类型，直到找到为止或全部
    getTypeInfo(id) {
      if (this.$common.isEmpty(this.treeSelectCategoryJson) || this.$common.isEmpty(id)) return null;
      const getInfo = this.treeSelectCategoryJson[id];
      if (this.$common.isEmpty(getInfo)) return null;
      if (this.$common.isEmpty(getInfo.productType)) {
        if (this.$common.isEmpty(getInfo.parentId)) return null;
        return this.getTypeInfo(getInfo.parentId);
      }
      return getInfo;
    },
    // 过滤多属性列表（新增的属性信息将不匹配尺码组和颜色属性的数据过滤掉）
    // filterSkuData (defualtList) {
    //   const newTableData = defualtList.filter(row => {
    //     if (this.$common.isEmpty(row.productGoodsId) && !this.$common.isEmpty(row.productGoodsSpecifications)) {
    //       const notMatch = row.productGoodsSpecifications.find(item => {
    //         if (item.name == 'Color') {
    //           return !this.getColorAll.includes(item.value)
    //         } else if (item.name == 'Size') {
    //           return !this.getSizeVal.includes(item.value)
    //         }
    //       })
    //       return this.$common.isEmpty(notMatch);
    //     }
    //     return true;
    //   })
    //   return newTableData
    // },
    // 数据格式
    textInit(data = [], productId) {
      const additional = ['productId', 'title', 'keywords', 'language', 'descriptionId'];
      this.languageTab.forEach(item => {
        this.$set(this.descriptionBOJson, item.key, {});
        const langCont = data.filter(cont => {
          return item.key == cont.language;
        })
        additional.forEach(key => {
          if (langCont[0]) {
            let val = langCont[0][key];
            if (key == 'keywords') {
              val = langCont[0][key] || [];
              if (!Array.isArray(langCont[0][key]) && !this.$common.isEmpty(langCont[0][key])) {
                val = (langCont[0][key].split(',')).filter(isVal => {
                  return !!isVal
                }).map(newVal => {
                  return { attrVal: newVal }
                })
              }
            } else if (key == 'productId') {
              val = langCont[0][key] ? langCont[0][key] : productId || '';
            }
            this.$set(this.descriptionBOJson[item.key], key, val);
          } else {
            this.$set(this.descriptionBOJson[item.key], key, key == 'keywords' ? [] : '');
          }
        })
        this.descriptionTab.forEach(text => {
          if (langCont[0]) {
            this.$set(this.descriptionBOJson[item.key], text.key, langCont[0][text.key] || '');
          } else {
            this.$set(this.descriptionBOJson[item.key], text.key, '');
          }
        })
      })
    },
    // 语言切换时更新数据多文本数据
    langTabsSwitch() {
      if (this.descActiveTab == 'textDescription') return;
      this.descriptionBOJson[this.oldActiveLang][this.oldActiveDesc] = this.editor.getContent();
      this.$nextTick(() => {
        const content = this.descriptionBOJson[this.langActiveTab][this.descActiveTab];
        this.editor.setContent(content);
        this.oldActiveLang = this.langActiveTab;
      })
    },
    // 描述类型切换时更新数据多文本数据
    descTabsSwitch() {
      if (this.descActiveTab == 'textDescription') return;
      this.descriptionBOJson[this.oldActiveLang][this.oldActiveDesc] = this.editor.getContent();
      this.$nextTick(() => {
        const content = this.descriptionBOJson[this.langActiveTab][this.descActiveTab];
        this.editor.setContent(content);
        this.oldActiveDesc = this.descActiveTab;
      })
    },
    // 数据转换
    textTranform(productInfo) {
      return new Promise((resolve) => {
        this.descriptionBOJson[this.oldActiveLang][this.oldActiveDesc] = this.editor.getContent();
        this.$nextTick(() => {
          let newData = Object.values(JSON.parse(JSON.stringify(this.descriptionBOJson)));
          const keys = Object.keys(this.descriptionBOJson);
          newData.forEach((item, index) => {
            !item.productId && (item.productId = productInfo.productId || '');
            !item.language && (item.language = keys[index]);
            item.keywords = item.keywords.map(val => {
              return val.attrVal;
            }).join(',');
          })
          resolve(newData);
        })
      })
    },
    // skc 验证
    validateFormSkc(value) {
      let reg = /^[0-9]*$/g;
      if (!reg.test(value)) {
        return false;
      }
      return true;
    },
    delImgs() {
      if (this.delImgsValue.length === 0) {
        this.$Message.error('未选择图片');
      }
      let arr = [];
      this.productInfo.productImages.forEach((i, index) => {
        if (this.delImgsValue.indexOf(index) === -1) {
          arr.push(i);
        }
      });
      this.productInfo.productImages = arr;
      this.delImgsValue = [];
    },
    getCommodityDeveloper() {
      // commodityDeveloper（即商品开发员）
      this.axios.get(api.get_queryByBusinessRoleType + 'commodityDeveloper').then((res) => {
        if (res && res.data && res.data.code === 0) {
          // this.businessRoleTypeList = res.data.datas;
          this.businessRoleTypeList = res.data.datas.filter(k => {
            return k.status === '1'
          })
        }
      });
    },
    addSkuPic(index) { // 添加至SKU
      this.productGoodsImageArray.push(this.productInfo.productImages[index]);
    },
    removeProductGoodsImg(productGoodsImage) { // 删除货品图片
      let productGoodsImages = this.productGoodsImageArray;
      productGoodsImages.splice(productGoodsImages.indexOf(productGoodsImage), 1);
    },
    setProductGoodsPrimaryImg(productGoodsImage) { // 设置货品主图
      this.removeProductGoodsImg(productGoodsImage);
      let productGoodsImages = this.productGoodsImageArray;
      productGoodsImages.unshift(productGoodsImage);
    },
    confirModifyProductGoodsImg() { // 确认修改图片
      // this.productInfo.productGoodsList[this.editIndex].productGoodsImages = this.productGoodsImageArray;
      let list = this.productInfo.productGoodsList;
      let skc = list[this.editIndex].skc || '';
      if (skc && this.isSynchroAllSkc) {
        list.forEach(k => {
          if (k.skc == skc) {
            k.productGoodsImages = this.productGoodsImageArray;
          }
        })
      } else {
        list[this.editIndex].productGoodsImages = this.productGoodsImageArray
      }
      this.modifyProductGoodsImgModal = false;
    },
    uploadModalCancel() { // 上传图片模态框取消
      this.productGoodsImageArray = [];
      this.modifyProductGoodsImgModal = false;
    },
    // 处理树节点
    treeNormalizer(node) {
      return {
        id: node.productCategoryId,
        label: node.title,
        children: node.children
      }
    },
    // 所属分类改变
    getTreeData(treeId) { // 选择分类时把id赋值给商品模型分类ID
      let productCategory = this.treeSelectCategoryJson[treeId] || {};
      if (['productCategoryId1'].includes(treeId)) {
        this.$nextTick(() => {
          this.$Message.error('“全部” 选项不可选中');
          this.treeSelectCategoryValue = this.productInfo.productCategoryId
        })
        return
      }
      if (['productCategoryId1', 'noCategory'].includes(treeId)) {
        delete productCategory.productCategoryId
      }
      const hand = {
        findExistValue: () => {
          if (!productCategory || this.productInfo.productCategoryId != productCategory.productCategoryId) {
            // 当 productId 为空是，切换属性不提示
            if (!this.attributeFom.productId) {
              hand.changeData();
              return;
            }
            if (this.categoryChange) {
              this.axios.post(api.query_findExistValue, { productId: this.attributeFom.productId }).then(res => {
                if (res.data.code == 0 && res.data.datas.isMandatory == 0) {
                  this.$Modal.confirm({
                    title: '提示',
                    width: 600,
                    content: `
                      <p>1、该商品所属分类已有属性信息，是否确认修改所属分类；</p>
                      ${treeId != this.productInfo.productCategoryId ? '<p>2、该操作会清空原质检信息，是否确认更换商品分类；</p>' : ''}
                    `,
                    onOk: () => {
                      hand.changeData();
                    },
                    onCancel: () => {
                      this.initCategoryTree(this.productInfo.productCategoryId);
                      this.initGetTreeData = true
                    }
                  });
                } else {
                  hand.changeData();
                }
              })
            } else if (treeId != this.productInfo.productCategoryId) {
              this.$Modal.confirm({
                title: '提示',
                content: '<p>该操作会清空原质检信息，是否确认更换商品分类</p>',
                onOk: () => {
                  hand.changeData();
                },
                onCancel: () => {
                  this.initCategoryTree(this.productInfo.productCategoryId);
                  this.initGetTreeData = true
                }
              });
            }
          }
        },
        changeData: () => {
          if (productCategory && productCategory.productCategoryId) {
            this.productInfo.productCategoryId = productCategory.productCategoryId;
            this.$set(this.attributeFom, 'productCategoryId', productCategory.productCategoryId);
            this.productInfo.cnHsName = productCategory.cnHsName;
            this.productInfo.enHsName = productCategory.enHsName;
            this.productInfo.hsCode = productCategory.hsCode;
            this.$nextTick(() => {
              this.getAttributeData({
                productCategoryId: productCategory.productCategoryId,
                productId: productCategory.productId || ''
              }, false);
              this.$nextTick(() => {
                this.$refs['attributeDome'] && this.$refs['attributeDome'].resetFields();
              });
            });
          } else {
            this.productInfo.productCategoryId = null;
            this.productInfo.cnHsName = null;
            this.productInfo.enHsName = null;
            this.productInfo.hsCode = null;
            this.$set(this.attributeFom, 'attributeValueQOList', []);
            this.$nextTick(() => {
              this.$refs['attributeDome'] && this.$refs['attributeDome'].resetFields();
            });
          }
          this.getSizeList();
        }
      };
      if (!this.initGetTreeData) {
        this.initGetTreeData = false
        hand.findExistValue();
      }
    },
    getYmsTreeData(productCategory) {
      if (productCategory && productCategory.ymsProductCategoryId) {
        this.productInfo.ymsProductCategoryId = productCategory.ymsProductCategoryId;
        this.classifyTalg = 'change';
        this.getTemplateData(productCategory.ymsProductCategoryId);
      } else {
        this.productInfo.ymsProductCategoryId = null;
      }
    },
    validateCustomFields(newProduct) { // 校验货品属性
      let error = false;
      this.validateCol = {
        isWeight: [],
        isLength: [],
        isWidth: [],
        isHeight: [],
        isSuggestPrice: []
      }
      const reg = /^([1-9]\d*(\.\d{1,2})?|([0](\.([0][1-9]|[1-9]\d{0,1}))))$/;
      if (!newProduct.productGoodsList) return !error;
      for (let i = 0; i < newProduct.productGoodsList.length; i++) {
        let productGoods = newProduct.productGoodsList[i];
        !reg.test(productGoods.weight) && this.validateCol.isWeight.push(i);
        !reg.test(productGoods.length) && this.validateCol.isLength.push(i)
        !reg.test(productGoods.width) && this.validateCol.isWidth.push(i);
        !reg.test(productGoods.height) && this.validateCol.isHeight.push(i)
        // !reg.test(productGoods.suggestPrice) && this.validateCol.isSuggestPrice.push(i);
        if (productGoods.productGoodsSpecifications) {
          productGoods.productGoodsSpecifications.forEach((productGoodsSpecification, index) => {
            if (productGoodsSpecification.value === null || productGoodsSpecification.value === '') {
              error = true;
            }
          });
          if (error) {
            this.activeTab = 'baseInfo';
            break;
          }
        }
      }
      return !error;
    },
    // 保存前校验
    beforeSave(value) {
      // let status = null; // 1 质检项为空  2 质检项中的内容为空  3 质检类目为空
      // let itemFlg = null; // 1 质检项为空  2 质检标准为空
      this.productInfo.operationType = value ? 1 : 0;

      // 处理及校验质检标准数据
      /* if (this.categoryList && this.categoryList.length) {
        this.categoryList.forEach((s, v) => {
          if (!s.measureVal.length) {
            status = 1;
          } else {
            s.measureVal.forEach((j, k) => {
              if (!j.itemName) {
                status = 2;
                itemFlg = 1;
              } else if (!j.itemValue) {
                status = 2;
                itemFlg = 2;
              }
            });
          }
          if (!s.measureName) {
            status = 3;
          }
        });
        if (status === 1) {
          this.$Message.error('有无质检项的类目，请删除改类目或添加质检项后保存');
          this.waitingOk = false;
          return false;
        } else if (status === 2) {
          if (itemFlg === 1) {
            this.$Message.error('质检项不能为空');
            this.waitingOk = false;
            return false;
          } else if (itemFlg === 2) {
            this.$Message.error('质检标准不能为空');
            this.waitingOk = false;
            return false;
          }
        }
        if (status === 3) {
          this.$Message.error('质检类目不能为空');
          this.waitingOk = false;
          return false;
        }
        // 若无异常，则组装质检数据
        let pos = [];
        this.categoryList.forEach((n, i) => {
          n.measureVal.forEach((m, t) => {
            pos.push({
              itemName: m.itemName,
              itemValue: m.itemValue,
              measureName: n.measureName
            });
          });
        });
        this.productInfo.productQualityMeasureList = pos;
      } */

      const hand = {
        productInfoValid: (newProduct) => {
          this.showSpin('处理中...');
          this.waitingOk = true;
          this.$refs['productInfo'].validate((valid) => {
            let isPass = false;
            isPass = this.validateCustomFields(newProduct);

            if (valid && isPass) {
              const keys = Object.keys(this.validateCol);
              const nowKey = keys.find(key => {
                return this.validateCol[key].length > 0;
              })
              if (this.$common.isEmpty(nowKey)) {
                hand.attributeValidate();
                return;
              }
              const getDemo = document.querySelector(`.${nowKey}-${this.validateCol[nowKey][0]}`);
              if (getDemo) {
                this.locationErrorInput('multiattribute', '多属性资料列表中的价格，重量，尺寸需大于 0 并且最多2位小数的数字');
                this.$nextTick(() => {
                  getDemo.querySelector('input').focus();
                })
              }
              this.waitingOk = false;
              this.hideSpin();
            } else {
              this.locationErrorInput('baseInfo', '基础资料中存在必填项未填写或格式有误，请确保正确填写');
              this.waitingOk = false;
              this.hideSpin();
            }
          });
        },
        attributeValidate: () => {
          this.$refs.attributeDome ? this.$refs.attributeDome.validate((attrvalid) => {
            if (!attrvalid) {
              this.waitingOk = false;
              this.hideSpin();
              this.locationErrorInput('baseInfo', '商品属性信息存在必填项未填写');
              document.querySelectorAll('.editProductDome .ivu-sliderModal-body')[0].scrollTop = 0;
              return;
            }
            hand.productInfo();
          }) : hand.productInfo();
        },
        productInfo: () => {
          new Promise((resolve, reject) => {
            this.save(resolve);
          }).then(() => {
            this.waitingOk = false;
            this.hideSpin();
          }).catch(() => {
            this.waitingOk = false;
            this.hideSpin();
          });
        }
      };

      const qualityDemo = this.$refs.qualityInspection;
      let qualityInspection = '';
      if (qualityDemo) {
        const getFormData = qualityDemo.getFormData();
        qualityInspection = getFormData.data;
      }
      // this.productInfo.qualityTemplateId = qualityInspection;
      this.productInfo.qualityClassificationId = qualityInspection || null;
      this.$nextTick(() => {
        hand.productInfoValid(this.productInfo);
      })
    },
    // 定位到验证不通过的地方
    locationErrorInput(errorTag, errTxt, type = false) {
      this.pageEditTag = errorTag;
      if (type) return;
      if (!this.$common.isEmpty(errTxt)) {
        this.$Message.error(errTxt);
      }
      this.$nextTick(() => {
        this.hideSpin();
        this.waitingOk = false;
        // 定位到第一个验证不通过项位置
        this.$nextTick(() => {
          let errorDemo = document.querySelector(`.tag-content-${errorTag} .ivu-form-item-error`);
          if (!this.$common.isEmpty(errorDemo)) {
            errorDemo = errorDemo.querySelector('input[type="text"]');
            if (this.$common.isEmpty(errorDemo)) {
              errorDemo = errorDemo.querySelector('textarea');
            }
            if (!this.$common.isEmpty(errorDemo)) {
              errorDemo.focus();
            }
          }
        })
      })
    },
    async save(resolve) { // 保存
      // 深拷贝，防止修改到表单值
      let newProductInfo = this.$common.copy(this.productInfo);
      if (newProductInfo.productGoodsList.length === 1 &&
        (!newProductInfo.productGoodsList[0].productGoodsSpecifications || newProductInfo.productGoodsList[0].productGoodsSpecifications.length == 0)
      ) {
        newProductInfo.productGoodsList[0].sku = newProductInfo.spu;
        newProductInfo.productGoodsList[0].productGoodsAcceptableTc = this.productTypeListValue.join(',');
        delete newProductInfo.productGoodsList[0].productTypeListValue;
      }
      // 当不是服装分类类型时，braidType 要设置为空
      if (!this.isClothingType) {
        newProductInfo.braidType = null;
      }
      if (!this.$common.isEmpty(newProductInfo.washedLabelWordFile)) {
        newProductInfo.washedLabelWordPath = newProductInfo.washedLabelWordFile.fileUrl;
        newProductInfo.washedLabelWordName = newProductInfo.washedLabelWordFile.fileName;
        delete newProductInfo.washedLabelWordFile;
      } else {
        newProductInfo.washedLabelWordPath = '';
        newProductInfo.washedLabelWordName = '';
      }
      // 组装信息
      if (newProductInfo.productGoodsList) {
        newProductInfo.productGoodsList.forEach((n, i) => {
          if (n.upc === '') {
            n.upc = null;
          }
          if (n.isAssemble) { // 先判断是否是组装产品
            if (n.editStatus) { // 判断是否重新编辑
              n.isAssemble = 1;
              if (n.productGoodsAssembles) {
                let pos = [];
                for (let m = 0; m < n.productGoodsAssembles.length; m++) {
                  pos.push({
                    materialProductGoodsId: n.productGoodsAssembles[m].productGoodsId,
                    quantity: n.productGoodsAssembles[m].quantity
                  });
                }
                n.productGoodsAssembles = pos;
              } else {
                n.isAssemble = 0;
                n.productGoodsAssembles = [];
              }
            } else {
              n.isAssemble = 1;
              if (n.productGoodsAssembles) {
                let box = [];
                for (let t = 0; t < n.productGoodsAssembles.length; t++) {
                  box.push({
                    materialProductGoodsId: n.productGoodsAssembles[t].materialProductGoodsId
                      ? n.productGoodsAssembles[t].materialProductGoodsId
                      : n.productGoodsAssembles[t].productGoodsId,
                    quantity: n.productGoodsAssembles[t].quantity
                  });
                }
                n.productGoodsAssembles = box;
              } else {
                n.isAssemble = 0;
                n.productGoodsAssembles = [];
              }
            }
          } else {
            n.isAssemble = 0;
            n.productGoodsAssembles = [];
          }
          n.productGoodsAcceptableTc = n.productTypeListValue && n.productTypeListValue.length ? n.productTypeListValue.join(',') : null;
          delete n.productTypeListValue;
        });
      }
      newProductInfo.descriptionBOList = await this.textTranform(newProductInfo);
      // 是供应商用户才做校验
      if (this.isSupplierTalg) {
        if (newProductInfo.ymsProductCategoryId === null) {
          this.locationErrorInput('baseInfo', '请选择云卖分类！');
          this.waitingOk = false;
          this.hideSpin();
          return false;
        }
        // 处理尺码表的参数
        if (this.classifyTalg === 'edit') {
          if (this.sizeChartdata.length > 0 && Object.keys(this.sizeJsonData).length > 0) {
            let insetProductSizeBoList = [];
            let data = this.sizeJsonData.productSizePartsBos;
            this.sizeChartdata.forEach((item) => {
              let obj = {
                sizeCode: '',
                ukSize: '',
                euSize: '',
                usSize: '',
                sizeDetailBos: []
              };
              data.forEach((ele, index) => {
                obj.sizeDetailBos.push({
                  partsName: item['partsName_' + index],
                  unitName: item['unitName_' + index],
                  unitValue: item['unitValue_' + index]
                });
              });
              obj.sizeCode = item.sizeCode;
              obj.ukSize = item.ukSize;
              obj.euSize = item.euSize;
              obj.usSize = item.usSize;
              insetProductSizeBoList.push(obj);
            });
            newProductInfo.insetProductSizeBoList = insetProductSizeBoList;
            newProductInfo.sizeJson = JSON.stringify(this.sizeJsonData);
            if (newProductInfo.insetProductSizeBoList.length > 0) {
              let list = newProductInfo.insetProductSizeBoList;

              let valid = false;
              let obj = {};

              for (let i = 0; i < list.length; i++) {
                for (let key in list[i]) {
                  if (key !== 'sizeDetailBos') {
                    if (!obj[key]) {
                      obj[key] = [list[i][key]];
                    }
                    obj[key].push(list[i][key]);
                  }
                }
                for (let j = 0; j < list[i].sizeDetailBos.length; j++) {
                  let t = list[i].sizeDetailBos[j];
                  if (!obj[t.partsName]) {
                    obj[t.partsName] = [];
                  }
                  obj[t.partsName].push(t.unitValue);
                }
              }
              for (let key in obj) {
                if (obj[key].some(k => k && k !== '0') && obj[key].some(k => !k || Number(k) === 0)) {
                  valid = true;
                }
              }
              if (valid) {
                this.$Message.error('尺码表单独规格必须填写完整！');
                this.waitingOk = false;
                this.hideSpin();
                return false;
              }
            }
          } else {
            delete newProductInfo.insetProductSizeBoList;
          }
        } else if (this.classifyTalg === 'change') {
          if (this.sizeChartdata.length > 0 && Object.keys(this.sizeJsonData).length > 0) {
            let insetProductSizeBoList = [];
            let data = this.sizeJsonData.productSizePartsBos;
            this.sizeChartdata.forEach(item => {
              let obj = {
                sizeCode: '',
                ukSize: '',
                euSize: '',
                usSize: '',
                sizeDetailBos: []
              };
              data.forEach(ele => {
                obj.sizeDetailBos.push({
                  partsName: item[ele.ymsProductSizePartsId + '_partName'],
                  unitName: item[ele.ymsProductSizePartsId + '_defaultUnitName'],
                  unitValue: item[ele.ymsProductSizePartsId + '_defaultValue']
                });
              });
              obj.sizeCode = item.size;
              obj.ukSize = item.ukSize;
              obj.euSize = item.euSize;
              obj.usSize = item.usSize;
              insetProductSizeBoList.push(obj);
            });
            newProductInfo.insetProductSizeBoList = insetProductSizeBoList;
            newProductInfo.sizeJson = JSON.stringify(this.sizeJsonData);
            if (newProductInfo.insetProductSizeBoList.length > 0) {
              let list = newProductInfo.insetProductSizeBoList;
              let valid = false;
              let obj = {};
              for (let i = 0; i < list.length; i++) {
                for (let key in list[i]) {
                  if (key !== 'sizeDetailBos') {
                    if (!obj[key]) {
                      obj[key] = [list[i][key]];
                    }
                    obj[key].push(list[i][key]);
                  }
                }
                for (let j = 0; j < list[i].sizeDetailBos.length; j++) {
                  let t = list[i].sizeDetailBos[j];
                  if (!obj[t.partsName]) {
                    obj[t.partsName] = [];
                  }
                  obj[t.partsName].push(t.unitValue);
                }
              }
              for (let key in obj) {
                if (obj[key].some(k => k && k !== '0') && obj[key].some(k => !k || Number(k) === 0)) {
                  valid = true;
                }
              }
              if (valid) {
                this.$Message.error('尺码表单独规格必须填写完整!');
                this.waitingOk = false;
                this.hideSpin();
                return false;
              }
            }
          } else {
            delete newProductInfo.insetProductSizeBoList;
          }
        }
      }
      if (newProductInfo.type == 2) {
        newProductInfo.productGoodsList.forEach(k => {
          (k.productGoodsSpecifications || []).forEach(j => {
            if (this.$common.isEmpty(j.value)) {
              this.$set(j, 'value', '');
            }
            if (j.name == 'Color' && !this.isOldData) {
              if (this.getColorAll.includes(j.value)) {
                this.colorList.forEach(m => {
                  if (j.value == m.color) {
                    this.$set(j, 'skcCode', m.skcCode);
                    this.$set(j, 'typeValueId', m.colorId);
                  }
                })
              } else if (this.specificationsObj[`${j.name}${j.value}`]) {
                this.$set(j, 'typeValueId', this.specificationsObj[`${j.name}${j.value}`].typeValueId);
              }
              j.type = 1;
            } else if (j.name == 'Size' && !this.isOldData) {
              if (this.getSizeVal.includes(j.value)) {
                this.sizeList.forEach(m => {
                  if (!m.disabled) {
                    m.children.forEach(n => {
                      if (j.value == n.size) {
                        this.$set(j, 'sizeCode', n.sizeCode);
                        this.$set(j, 'typeValueId', n.sizeId);
                      }
                    })
                  }
                })
              } else if (this.specificationsObj[`${j.name}${j.value}`]) {
                this.$set(j, 'typeValueId', this.specificationsObj[`${j.name}${j.value}`].typeValueId);
              }
              j.type = 2;
            } else {
              j.type = 3;
            }
          })
        })
      }

      let awaitRes = [];
      // 获取物料表单信息
      if (this.$refs.materialRefDemo) {
        awaitRes.push(() => {
          return new Promise((resolve, reject) => {
            this.$refs.materialRefDemo.getFormData(1).then(res => {
              if (!res.success) return reject(res);
              newProductInfo.productGoodsMaterialInfoVOList = res.data;
              newProductInfo.updateProductMaterialInfo = 1;
              resolve(res);
            }).catch((err) => {
              console.error(err);
              reject(err);
            })
          })
        })
      }
      // 获取工序表单信息(车缝工价)
      if (this.$refs.sewingLaborRrateDemo) {
        awaitRes.push(() => {
          return new Promise((resolve, reject) => {
            this.$refs.sewingLaborRrateDemo.getFormData(1).then(res => {
              if (!res.success) return reject(res);
              newProductInfo.productProcessVOList = res.data.list;
              newProductInfo.machiningRate = res.data.machiningRate;
              newProductInfo.updateProductTechnology = 1;
              resolve(res);
            }).catch((err) => {
              console.error(err);
              reject(err);
            })
          })
        })
      }
      // 获取工艺表单信息(工艺要求)
      if (this.$refs.technologicalDemo) {
        awaitRes.push(() => {
          return new Promise((resolve, reject) => {
            this.$refs.technologicalDemo.getFormData(1).then(res => {
              if (!res.success) return reject(res);
              // newProductInfo.fileUrlList = res.data.fileUrlList;
              newProductInfo.laPaApiProductTechnologyVOList = res.data.list;
              newProductInfo.updateProductProcess = 1;
              resolve(res);
            }).catch((err) => {
              console.error(err);
              reject(err);
            })
          })
        })
      }
      // 获取二次工艺表单信息(二次工艺要求)
      if (this.$refs.twiceCraftDemo) {
        awaitRes.push(() => {
          return new Promise((resolve, reject) => {
            this.$refs.twiceCraftDemo.getFormData(1).then(res => {
              if (!res.success) return reject(res);
              newProductInfo.updateSecondaryProcess = 1;
              newProductInfo.productSecondaryProcessBOS = res.data;
              resolve(res);
            }).catch((err) => {
              console.error(err);
              reject(err);
            })
          })
        })
      }
      // 生产尺码图
      if (this.$refs.frameHoppingDemo) {
        awaitRes.push(() => {
          return new Promise((resolve, reject) => {
            this.$refs.frameHoppingDemo.getFormData(1).then(res => {
              if (!res.success) return reject(res);
              newProductInfo.productManufactureVOList = res.data;
              newProductInfo.updateProductManufacture = 1;
              resolve(res);
            }).catch((err) => {
              console.error(err);
              reject(err);
            })
          })
        })
      }

      this.$common.promiseAll(awaitRes).then(() => {
        if (newProductInfo.productId) {
          resolve(this.axios.put(api.productInfo_update, newProductInfo).then(response => {
            if (response.data.code === 0) {
              this.insertAttributeSpu('edit', newProductInfo);
              this.$Message.success('更新成功');
            }
          }));
        } else {
          let attributeFom = this.insertAttributeSpu('add');
          delete attributeFom.productId;
          delete attributeFom.productCategoryId;
          resolve(this.axios.post(api.productInfo_insert, { ...newProductInfo, ...attributeFom }).then(response => {
            if (response.data.code === 0) {
              this.$Message.success('新增成功');
              this.synchronousRemind({ ...newProductInfo, ...attributeFom, productId: response.data.datas.productId || '' }, 'add');
            }
          }));
        }
      }).catch(err => {
        this.locationErrorInput('productionInfo');
        console.error(err);
        this.hideSpin();
        this.waitingOk = false;
      })
    },
    // 保存属性信息
    insertAttributeSpu(type, productInfo) {
      let attributeFom = JSON.parse(JSON.stringify(this.attributeFom));
      const attributeValueQOList = attributeFom.attributeValueQOList.map(item => {
        return {
          attributeValueIdList: typeof item.attributeValueIdList === 'number' ? [item.attributeValueIdList] : item.attributeValueIdList
        };
      });
      attributeFom.attributeValueQOList = attributeValueQOList.filter(item => {
        return typeof item.attributeValueIdList === 'number' || (item.attributeValueIdList && item.attributeValueIdList.length > 0);
      });
      if (type == 'add') {
        return attributeFom;
      }
      if (attributeFom.attributeValueQOList.length == 0) {
        this.synchronousRemind(productInfo);
        return;
      }
      this.axios.post(api.insert_attributeSpu, attributeFom).then(res => {
        if (res.data.code !== 0) {
          this.$Message.error('属性信息保存失败');
          this.synchronousRemind(productInfo);
        } else {
          this.synchronousRemind({ ...productInfo, ...attributeFom });
        }
      }).catch(() => {
        this.synchronousRemind(productInfo);
        this.$Message.error('属性信息保存失败');
      });
    },
    /* del () { // 删除
      let self = this;
      self.productInfo.productGoodsList = [];
      self.axios.put(api.productInfo_update, self.productInfo).then(response => {
        if (response.data.code === 0) {
          self.$Message.success('删除成功');
          self.$parent.$parent.pageParamsStatus = true;
          // self.$parent.$parent.editProductModal = false;
          this.$emit('update:editProductModal', false)
        }
      });
    }, */
    del() {
      this.$Modal.confirm({
        title: '温馨提示',
        okText: '确定',
        content: '是否删除该SPU？',
        onOk: () => {
          let temp = this.firstProductInfo.productGoodsList.map(k => {
            return k.productGoodsId
          })
          let reqParams = {
            productGoodsIds: temp
          }
          this.axios.post(api.productGoods_batchDelete, reqParams).then((res) => {
            if (res.data.code === 0) {
              this.$Message.success(res.data.message);
              this.turnBack();
              this.turnUpdate();
            } else {
              this.$Message.error(res.data.message)
            }
          });
        }
      });
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
          this.$set(this.productInfo, 'washedLabelPdfPath', res.data.datas[0]);
          this.$set(this.productInfo, 'washedLabelPdfName', file.name);
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
      this.$Modal.confirm({
        width: 500,
        title: '操作提示',
        content: '<div>确认删除水洗唛文件？</div><div style="font-size:12px;color:#f60;">注意：删除后需要保存才生效</div>',
        onOk: () => {
          this.$set(this.productInfo, 'washedLabelPdfPath', null);
          this.$set(this.productInfo, 'washedLabelPdfName', null);
        },
        onCancel: () => { }
      })
    },
    // 水洗唛PDF文件预览
    previewWashedPdf() {
      if (this.$common.isEmpty(this.productInfo.washedLabelPdfPath)) return;
      const url = this.productInfo.washedLabelPdfPath;
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
    // 图片预览
    previewImg(imgUrl) {
      window.open(imgUrl);
    },
    // 移除尺码图
    removePlanImg() {
      if (this.$common.isEmpty(this.productInfo)) return;
      const imgUrl = this.dimensionPlan.substring(this.filenodeViewTargetUrl.length);
      this.productInfo.productImages = (this.productInfo.productImages || []).filter(item => {
        return imgUrl != item;
      });
      if (!this.$common.isEmpty(this.productInfo.productImageTypeList)) {
        this.productInfo.productImageTypeList = [];
      }
      this.productInfo.productImageList = (this.productInfo.productImageList || []).filter(item => {
        return imgUrl != item.path;
      })
    },
    // 验证外包装
    validateOutPack(rule, value, callback) {
      if (this.isDisabled) return callback();
      if (!this.$common.isEmpty(value) && value.trim().length > 200) {
        return callback(new Error('输入字符超出规定，最多200字符'));
      }
      return callback();
    },
    turnBack() { // 关闭
      this.initFinished = false;
      this.$refs['productInfo'] && this.$refs['productInfo'].resetFields();
      this.$refs['attributeDome'] && this.$refs['attributeDome'].resetFields();
      this.locationErrorInput('baseInfo', '', true);
      this.productInfo = this.deepCopy(this.productInfoPrototype);
      this.skuData = [];
      this.skuPropertyList = [];
      this.classifyTalg = 'edit';
      this.$emit('goBack');
      this.$emit('update:editProductModal', false)
    },
    turnUpdate() {
      this.$emit('updateList');
    },
    setProductPrimaryImg(index) { // 设置商品主图
      let path = this.productInfo.productImages.splice(index, 1);
      this.productInfo.productImages.unshift(path[0]);
    },
    removeProductImg(index) { // 删除图片
      this.productInfo.productImages.splice(index, 1);
    },
    uploadFilesSuccess(res, file, uploadFiles) { // 上传成功
      this.productInfo.productImages.push(file.response.datas[0]);
    },
    uploadFilesSuccessModal(response, file, fileList) { // sku列表上传成功
      this.productGoodsImageArray.push(file.response.datas[0]);
      this.productInfo.productImages.push(file.response.datas[0]);
    },
    uploadExceedSizeModal() {
      this.$Message.error('文件大小超出限制，最大为10M');
    },
    uploadFilesErrorModal() {
      this.$Message.error('系统繁忙，请重新尝试');
    },
    handleFormatErrorModal() { // sku列表上传失败
      this.$Message.error('文件格式有误');
    },
    beforeUploadModal(file) {
      let selectedFiles = this.$refs.uploadProductGoodsImg.$refs.input.files;
      let curFileIndex = -1;
      for (let i = 0; i < selectedFiles.length; i++) {
        if (selectedFiles[i] === file) {
          curFileIndex = i;
        }
      }
      if (curFileIndex === 0 && selectedFiles.length > this.uploadMaxLength) {
        this.$Message.error('文件数量超出限制，一次最多可上传20张');
        return false;
      } else if (selectedFiles.length > this.uploadMaxLength) {
        return false;
      }
      let newForm = new FormData(); // 创建form对象
      newForm.append('files', file);
      this.uploadFilesTime && clearTimeout(this.uploadFilesTime);
      this.uploadFilesList.push(newForm);
      this.uploadFilesTime = setTimeout(() => {
        this.isUploading = true;
        this.uploadFilesCalLback = (arr) => {
          arr.forEach((newres) => {
            this.productGoodsImageArray.push(newres.data.datas[0]);
            this.productInfo.productImages.push(newres.data.datas[0]);
          });
          this.$nextTick(() => {
            this.uploadFilesCalLback = () => { }
          })
        }
      }, 300);
      return false;
    },
    uploadExceedSize() { // 控制上传图片大小
      this.$Message.error('文件大小超出限制，最大为10M');
    },
    beforeUpload(file) { // 控制图片多选数量
      let selectedFiles = this.$refs.uploadProductInfoImg.$refs.input.files;
      let curFileIndex = -1;
      for (let i = 0; i < selectedFiles.length; i++) {
        if (selectedFiles[i] === file) {
          curFileIndex = i;
        }
      }
      if (curFileIndex === 0 && selectedFiles.length > this.uploadMaxLength) {
        this.$Message.error('文件数量超出限制，一次最多可上传20张');
        return false;
      } else if (selectedFiles.length > this.uploadMaxLength) {
        return false;
      }
      let newForm = new FormData(); // 创建form对象
      newForm.append('files', file);
      this.uploadFilesTime && clearTimeout(this.uploadFilesTime);
      this.uploadFilesList.push(newForm);
      this.uploadFilesTime = setTimeout(() => {
        this.isUploading = true;
        this.uploadFilesCalLback = (arr) => {
          arr.forEach((newres) => {
            this.productInfo.productImages.push(newres.data.datas[0]);
          });
          this.$nextTick(() => {
            this.uploadFilesCalLback = () => { }
          })
        }
      }, 300);
      return false;
    },
    // 按顺序上传
    uploadFilesListHand() {
      this.uploadFilesLoading = true;
      const awaitList = this.uploadFilesList.map(file => {
        return this.axios.post(`${this.uploadFilesUrl}&random=${(Math.random()).toString().substring(2)}`, file)
      })
      Promise.all(awaitList).then(arr => {
        this.uploadFilesCalLback(arr);
        this.uploadFilesList = [];
        this.isUploading = false;
        this.uploadFilesLoading = false;
      }).catch(() => {
        // this.$Message.error('系统繁忙，请重新尝试');
        this.uploadFilesList = [];
        this.isUploading = false;
        this.uploadFilesLoading = false;
      });
    },
    uploadFilesError() { // 上传文件异常
      this.$Message.error('系统繁忙，请重新尝试');
    },
    handleFormatError() { // 上传文件格式异常
      this.$Message.error('文件格式有误');
    },
    // 全选所有图片
    selectAllPic() {
      if (this.isAllSelectPic) {
        this.delImgsValue = [];
        return;
      }
      this.delImgsValue = this.productInfo.productImages.map((pic, index) => {
        return index;
      });
    },
    // 下载选中的图片
    downloadSelectPic() {
      if (this.downPicLoading) return;
      if (this.delImgsValue.length === 0) {
        this.$Message.error('未选择图片');
        return;
      }
      const downPicList = this.productInfo.productImages.filter((i, index) => {
        return this.delImgsValue.includes(index);
      });
      this.downPicLoading = true;
      this.axios.post(`${api.imageExport}?spu=${this.productInfo.spu}`, downPicList, {
        responseType: 'blob'
      }).then(res => {
        if (!res || !res.resData) {
          this.downPicLoading = false;
          return this.$Message.error('下载失败');
        }
        // type: 'application/vnd.ms-excel' suffix: 'zip'
        this.$common.downloadFile(res.resData, { name: res.filename }).finally(() => {
          this.downPicLoading = false;
        })
      }).catch(() => {
        this.downPicLoading = false;
      })
    },
    addNetWorkImg() { // 控制上传图片url模态框
      this.addNetWorkUrlModal = true;
    },
    addNetWorkImgOk() { // 上传图片url模态框 确定
      let reg = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?/;
      if (this.$refs.addNetWorkUrlInput.$refs.input.value && !reg.test(this.$refs.addNetWorkUrlInput.$refs.input.value)) {
        this.$Message.error('输入格式有误');
        this.waitingUrlOk = false;
        this.$nextTick(() => {
          this.waitingUrlOk = true;
        });
        return false;
      }
      if (this.$refs.addNetWorkUrlInput.$refs.input.value) {
        this.axios.post(api.upload_URlFiles + '?basePath=/product', [this.$refs.addNetWorkUrlInput.$refs.input.value]).then(response => {
          if (response.data.code === 0) {
            this.productInfo.productImages.push(response.data.datas[0]);
            this.addNetWorkUrlModal = false;
          } else if (response.data.code === 900001) {
            if (response.data.datas.networkErrorFilePaths.length > 0) {
              this.$Message.error('网络异常');
            } else if (response.data.datas.formatErrorFilePaths.length > 0) {
              this.$Message.error('格式不对');
            }
          }
          this.waitingUrlOk = false;
          this.$nextTick(() => {
            this.waitingUrlOk = true;
          });
        });
      } else {
        this.$Message.error('不能为空');
        this.waitingUrlOk = false;
        this.$nextTick(() => {
          this.waitingUrlOk = true;
        });
      }
    },
    initProductInfo(productInfo) { // 初始化商品信息
      return new Promise((resolve, reject) => {
        this.productInfo = {
          ...productInfo,
          checkType: this.$common.isEmpty(productInfo.checkType) ? '0' : productInfo.checkType.toString(),
          descriptionBOList: productInfo.descriptionBOList || [],
          productImages: [],
          productGoodsList: [],
          deliveryInterval: productInfo.deliveryInterval || 1,
          attributeFomNew: {
            attributeValueQOList: [],
            productCategoryId: '',
            productId: ''
          }
        };
        const includeKey = ['materialCnDesc', 'materialEnDesc', 'usageCnDesc', 'usageEnDesc'];
        includeKey.forEach(key => {
          this.$set(this.productInfo, key, productInfo[key] || '');
        });
        // 初始化 商品描述数据
        this.textInit(productInfo.descriptionBOList || [], productInfo.productId);
        // 处理质检数据
        if (productInfo.productQualityMeasureList && productInfo.productQualityMeasureList.length > 0) {
          let pos = [];
          productInfo.productQualityMeasureList.forEach((n, i) => {
            if (i === 0) {
              pos.push({
                measureName: n.measureName,
                measureVal: [
                  {
                    itemName: n.itemName,
                    itemValue: n.itemValue
                  }
                ]
              });
            } else {
              pos.forEach((m, t) => {
                if (m.measureName === n.measureName) { // 类目一致
                  m.measureVal.push({
                    itemName: n.itemName,
                    itemValue: n.itemValue
                  });
                } else if (t === pos.length - 1 && m.measureName !== n.measureName) {
                  pos.push({
                    measureName: n.measureName,
                    measureVal: [
                      {
                        itemName: n.itemName,
                        itemValue: n.itemValue
                      }
                    ]
                  });
                }
              });
            }
          });
          this.categoryList = pos;
        } else {
          this.categoryList = [];
        }
        // End
        if (productInfo.productImageList && productInfo.productImageList.length > 0) {
          let selfPic = [];
          let productPath = [];
          let isPush = this.$common.isEmpty(this.productInfo.productImageTypeList);
          productInfo.productImageList.forEach((productImage, i) => {
            productPath.push(productImage.path);
            if ([2, 3, 4, '2', '3', '4'].includes(productImage.imageType) && isPush) {
              selfPic.push({
                path: productImage.path,
                imageType: productImage.imageType
              });
            }
          });
          this.productInfo.productImages = productPath;
          if (isPush) {
            this.$set(this.productInfo, 'productImageTypeList', selfPic);
          }
        }
        resolve();
      })
    },
    initProductGoods(productGoodsList) { // 初始化货品信息
      let self = this;
      productGoodsList.forEach((productGoods, index) => {
        let newProductGoods = {
          ...(this.$common.copy(productGoods)),
          productGoodsTags: [],
          productGoodsImages: [],
          isAssemble: productGoods.isAssemble === 1, // 是否组装
          editStatus: false, // 是否重新编辑
          productTypeListValue: (productGoods.productGoodsAcceptableTypes || []).map(i => {
            return i.typeCode;
          })
        };
        // 组装信息
        if (productGoods.productGoodsAssembles) {
          let pos = [];
          let pic = null;
          productGoods.productGoodsAssembles.forEach((m, t) => {
            pic = m.productGoodsImages ? m.productGoodsImages[0].path : null;
            pos.push({
              productGoodsId: m.materialProductGoodsId,
              sku: m.sku,
              skc: m.skc,
              name: m.cnName,
              value: m.productGoodsSpecifications,
              quantity: m.quantity,
              pictureUrl: pic
            });
          });
          self.addAssembleData = pos;
          self.addData = pos;
        }
        let productGoodsTagNames = [];
        let productGoodsImagePaths = [];
        let productGoodsTags = productGoods.productGoodsTags;
        let productGoodsImages = productGoods.productGoodsImages;
        if (productGoodsTags) {
          productGoodsTags.forEach((productGoodsTag, i) => {
            productGoodsTagNames.push(productGoodsTag.tagName);
            if (self.customProductTagList.indexOf(productGoodsTag.tagName) === -1) {
              self.customProductTagList.push(productGoodsTag.tagName);
            }
          });
        }
        newProductGoods.productGoodsTags = productGoodsTagNames;
        if (productGoodsImages) {
          productGoodsImages.forEach((productGoodsImage, i) => {
            productGoodsImagePaths.push(productGoodsImage.path);
          });
        }
        newProductGoods.productGoodsImages = productGoodsImagePaths;
        // 初始化规格属性
        if (productGoods.productGoodsSpecifications) {
          let skuList = this.$common.copy(self.skuPropertyList);
          productGoods.productGoodsSpecifications.forEach((productGoodsSpecification, i) => {
            this.$set(this.specificationsObj, `${productGoodsSpecification.name}${productGoodsSpecification.value}`, productGoodsSpecification);
            if (!skuList[i]) {
              skuList[i] = {
                name: productGoodsSpecification.name,
                invalid: false,
                values: [productGoodsSpecification.value],
                selected: true,
                isEdit: true
              };
            } else if (skuList[i].values.indexOf(productGoodsSpecification.value) === -1) {
              skuList[i].values.push(productGoodsSpecification.value);
              skuList[i].selected = true;
            }
          });
          self.skuPropertyList = skuList;
        }
        self.productInfo.productGoodsList.push(newProductGoods);
      });
      if (self.productInfo.productGoodsList.length === 1 && self.productInfo.productGoodsList[0].productGoodsAcceptableTypes) {
        self.productTypeListValue = self.productInfo.productGoodsList[0].productGoodsAcceptableTypes.map(i => {
          return i.typeCode;
        });
      }
      self.skuData = self.deepCopy(self.productInfo.productGoodsList);
    },
    getProductCategoryTree(productCategoryListData, parentId, currentProductCategoryId) { // 组装商品分类树
      // let self = this;
      let tree = [];
      let children;
      if (!productCategoryListData) {
        return [];
      }
      productCategoryListData.forEach((n, i) => {
        if (n.parentId === parentId) {
          n.title = n.cnName;
          n.expand = true;
          if (n.productCategoryId === currentProductCategoryId) {
            this.treeSelectCategoryValue = currentProductCategoryId;
          } else {
            n.selected = false;
          }
          children = this.getProductCategoryTree(productCategoryListData, n.productCategoryId, currentProductCategoryId);
          if (children.length > 0) {
            n.children = children;
          }
          this.$set(this.treeSelectCategoryJson, n.productCategoryId, n);
          tree.push(n);
        }
      });
      return tree;
    },
    initCategoryTree(currentProductCategoryId) { // 初始化分类树
      let productCategoryTree = this.getProductCategoryTree(this.$common.copy(this.productCategoryListData), null, currentProductCategoryId);
      let noCategory = {
        title: '未分类',
        productCategoryId: 'noCategory'
      };
      this.treeSelectCategoryJson['noCategory'] = JSON.parse(JSON.stringify(noCategory))
      if (currentProductCategoryId === null || currentProductCategoryId == '') {
        this.treeSelectCategoryValue = 'noCategory'
        noCategory.selected = true;
      }
      productCategoryTree.unshift(noCategory);
      this.$set(this.productCategoryTree[0], 'children', productCategoryTree);
      this.treeSelectCategoryJson['productCategoryId1'] = JSON.parse(JSON.stringify(this.productCategoryTree[0]))
      this.$nextTick(() => {
        this.initGetTreeData = false;
        this.categoryChange = true;
        this.disabledTreeItem();
      })
    },
    initYmsCategoryTree(ymsProductCategoryId) {
      if (this.originalCategoryData) {
        let obj = this.originalCategoryData.filter(i => i.ymsProductCategoryId === ymsProductCategoryId);
        this.$refs.productCategoryTree1.treeSelectGetValue(obj);
      }
    },
    editAssemble(index) { // 编辑变参商品组装信息
      this.$refs.addAssembleModal.matchingGoodsStatus = true;
      this.$refs.addAssembleModal.matchingGoodsModal = true;
      this.$refs.addAssembleModal.getNormalGoodsData();
      this.openType = 2; // 变参商品
      this.editAssembleIndex = index; // 记录当前下标
      let value = this.productInfo.productGoodsList[index].productGoodsAssembles;
      if (value) {
        this.$refs.addAssembleModal.matchingGoodsList = value;
        this.$refs.addAssembleModal.openStatus = true;
      }
    },
    addTabData(val) { // 接收子组件传值
      this.productInfo.productGoodsList[this.editAssembleIndex].productGoodsAssembles = val;
    },
    addQuality() { // 新增质检类目
      this.categoryList.push({
        measureName: null,
        measureVal: [
          {
            itemName: null,
            itemValue: null
          }
        ]
      });
    },
    addQualityItem(index) { // 给当前类目添加质检项
      this.categoryList[index].measureVal.push({
        itemName: null,
        itemValue: null
      });
    },
    delQualityItem(index) { // 删除当前类目
      this.categoryList.splice(index, 1);
    },
    delMeasureItem(index, t) { // 删除当前质检项
      this.categoryList[index].measureVal.splice(t, 1);
    },
    // 获取尺码模板的数据
    getTemplateData(ymsProductCategoryId) {
      this.axios.get(api.get_ymsProductSizeTemplate + `${ymsProductCategoryId}`).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            this.hideSizeChart = true;
            this.sizeJsonData = data;
            if (this.classifyTalg === 'change') {
              this.handlerTemplate(data);
              if (this.skuPropertyList.length > 0) {
                this.sizeChartdata = [];
                this.skuPropertyList.map((item) => {
                  if (item.name === '尺码') {
                    item.values.map((ele) => {
                      this.sizeChartdata.push(Object.assign({}, { size: ele }, this.templateObj));
                    });
                  }
                });
              }
            }
          } else {
            // 没有绑定尺码模板时，隐藏尺码表
            this.sizeChartdata = [];
            this.hideSizeChart = false;
          }
        }
      });
    },
    // 处理尺码表的单位
    handlerUnit(data, value) {
      let children = [];
      let obj = {};
      if (data.productSizeUnitBos.length > 0) {
        let list = data.productSizeUnitBos;
        list.map((item) => {
          if (item.isDefault === 1) {
            this.templateObj[value + '_defaultUnitName'] = item.name;
            obj = {
              title: item.name,
              key: value + '_defaultValue',
              align: 'center',
              render: (h, params) => {
                return h('InputNumber', {
                  props: {
                    value: params.row[value + '_defaultValue'],
                    min: 0,
                    disabled: (() => {
                      return this.isDisabled;
                    })()
                  },
                  on: {
                    'on-change': val => {
                      this.sizeChartdata[params.index][value + '_defaultValue'] = val;
                    }
                  }
                });
              }
            };
          } else {
            obj = {
              title: item.name,
              key: value + '_value',
              align: 'center',
              render: (h, params) => {
                let num = params.row[value + '_value'];
                let unitValue = params.row[value + '_defaultValue'];
                // 英寸转化厘米
                if (item.name === 'cm') {
                  if (unitValue > 0) {
                    num = unitValue * 2.54;
                    // Math.floor(num * 100) / 100;
                    num = num.toFixed(2);
                  }
                } else {
                  // 厘米转化成英寸
                  if (unitValue > 0) {
                    num = unitValue * 0.393701;
                    // Math.floor(num * 100) / 100;
                    num = num.toFixed(2);
                  }
                }
                this.sizeChartdata[params.index][value + '_value'] = Number(num) === 0
                  ? null
                  : Number(num);
                return h('span', num);
              }
            };
          }
          children.push(obj);
        });
        return children;
      }
    },
    // 处理尺码表的数据
    handlerTemplate(data, ymsProductCategoryId) {
      // 查看的时候
      this.sizeChartColumns = [];
      const fixColumn = [
        {
          title: 'UK Size',
          key: 'ukSize',
          align: 'center',
          render: (h, params) => {
            return h('Input', {
              props: {
                value: isNaN(Number(params.row.ukSize)) ? 0 : params.row.ukSize
              },
              style: {
                width: '70px'
              },
              on: {
                'on-change'(e) {
                  if (!isNaN(Number(e.target.value))) {
                    this.sizeChartdata[params.index]['ukSize'] = e.target.value;
                  } else {
                    this.sizeChartdata[params.index]['ukSize'] = 0;
                  }
                }
              }
            });
          }
        }, {
          title: 'EU Size',
          key: 'euSize',
          align: 'center',
          render: (h, params) => {
            return h('Input', {
              props: {
                value: isNaN(Number(params.row.euSize)) ? 0 : params.row.euSize
              },
              style: {
                width: '70px'
              },
              on: {
                'on-change'(e) {
                  if (!isNaN(Number(e.target.value))) {
                    this.sizeChartdata[params.index]['euSize'] = e.target.value;
                  } else {
                    this.sizeChartdata[params.index]['euSize'] = 0;
                  }
                }
              }
            });
          }
        }, {
          title: 'US Size',
          key: 'usSize',
          align: 'center',
          render: (h, params) => {
            return h('Input', {
              props: {
                value: isNaN(Number(params.row.usSize)) ? 0 : params.row.usSize
              },
              style: {
                width: '70px'
              },
              on: {
                'on-change'(e) {
                  if (!isNaN(Number(e.target.value))) {
                    this.sizeChartdata[params.index]['usSize'] = e.target.value;
                  } else {
                    this.sizeChartdata[params.index]['usSize'] = 0;
                  }
                }
              }
            });
          }
        }];

      if (this.classifyTalg === 'look' || this.classifyTalg === 'edit') {
        // 判断当前的单位
        this.axios.get(api.get_ymsProductSizeTemplate + `${ymsProductCategoryId}`).then(response => {
          if (response.data.code === 0) {
            let unitData = response.data.datas;
            if (data) {
              let size = {
                title: 'Tag Size',
                key: 'sizeCode',
                align: 'center',
                render: (h, params) => {
                  return h('Input', {
                    props: {
                      size: 'small',
                      value: params.row.sizeCode
                    },
                    style: {
                      width: '70px'
                    }
                  });
                }
              };
              // 部位
              data.forEach((item) => {
                let obj = {};
                this.sizeChartColumns = [];
                item.sizeDetailBos.forEach((ele, index) => {
                  item['partsName_' + index] = ele.partsName;
                  item['unitName_' + index] = ele.unitName;
                  item['unitValue_' + index] = ele.unitValue;
                  this.editObj['partsName_' + index] = ele.partsName;
                  this.editObj['unitName_' + index] = ele.unitName;
                  this.editObj['unitValue_' + index] = null;
                  if (unitData.productSizeUnitBos.length > 0) {
                    let list = unitData.productSizeUnitBos;
                    let objs = {};
                    let children = [];
                    list.forEach((item) => {
                      if (item.isDefault === 1) {
                        objs = {
                          title: item.name,
                          key: 'unitValue_' + index,
                          align: 'center',
                          render: (h, params) => {
                            let unitValue = Number(params.row['unitValue_' + index]);
                            return h('InputNumber', {
                              props: {
                                value: unitValue,
                                min: 0,
                                disabled: (() => {
                                  return this.isDisabled;
                                })()
                              },
                              on: {
                                'on-change': val => {
                                  this.sizeChartdata[params.index]['unitValue_' + index] = val;
                                }
                              }
                            });
                          }
                        };
                      } else {
                        objs = {
                          title: item.name,
                          key: 'unitValue_' + index,
                          align: 'center',
                          render: (h, params) => {
                            // 英寸转化厘米
                            let unitValue = Number(params.row['unitValue_' + index]);
                            let num = '';
                            if (item.name === 'cm') {
                              if (unitValue > 0) {
                                num = unitValue * 2.54;
                                // Math.floor(num * 100) / 100;
                                num = num.toFixed(2);
                              }
                            } else {
                              // 厘米转化成英寸
                              if (unitValue > 0) {
                                num = unitValue * 0.393701;
                                // Math.floor(num * 100) / 100;
                                num = num.toFixed(2);
                              }
                            }
                            return h('span', num);
                          }
                        };
                      }
                      children.push(objs);
                      obj = {
                        title: ele.partsName,
                        align: 'center',
                        maxWidth: 220,
                        children: children
                      };
                    });
                  }
                  this.sizeChartColumns.push(obj);
                });
              });
              this.sizeChartColumns.unshift(size, ...fixColumn);
              this.sizeChartdata = data;
            }
          }
        });
      } else {
        // 切换选取其他云卖分类的时候
        if (data) {
          let size = {
            title: 'Tag Size',
            key: 'size',
            align: 'center',
            render: (h, params) => {
              return h('Input', {
                props: {
                  value: params.row.size,
                  disabled: true
                },
                style: {
                  width: '100px'
                }
              });
            }
          };
          // 部位
          let place = {};
          if (data.productSizePartsBos.length > 0) {
            data.productSizePartsBos.map((item, index) => {
              this.templateObj[item.ymsProductSizePartsId + '_partName'] = item.name;
              this.templateObj[item.ymsProductSizePartsId + '_defaultValue'] = null;
              this.templateObj[item.ymsProductSizePartsId + '_value'] = null;
              place = {
                title: item.name,
                align: 'center',
                maxWidth: 220,
                children: this.handlerUnit(data, item.ymsProductSizePartsId)
              };
              this.sizeChartColumns.push(place);
            });
          }
          this.sizeChartColumns.unshift(size, ...fixColumn);
        }
      }
    },
    // 处理添加尺码属性的数据
    handlerSizeData(data) {
      if (this.classifyTalg === 'edit') {
        if (data) {
          if (data.name === '尺码') {
            data.values.map((ele) => {
              this.sizeChartdata.push(Object.assign({}, this.editObj, { sizeCode: ele, ukSize: '', euSize: '', usSize: '' }));
            });
          }
          this.sizeChartdata = this.uniqueFunc(this.sizeChartdata, 'sizeCode');
        }
      } else if (this.classifyTalg === 'change') {
        this.sizeChartdata = [];
        if (data) {
          if (data.name === '尺码') {
            data.values.map((ele) => {
              this.sizeChartdata.push(Object.assign({}, { size: ele }, this.templateObj));
            });
          }
        }
      }
    },
    // 获取分类属性值
    getAttributeData(attr, type) {
      this.getAttributeValueList(attr).then(res => {
        (res.attributeClassifyVOList || []).forEach(item => {
          if (type) {
            if (item.type == 0) {
              const itemVal = (item.attributeValueList || []).filter(op => {
                return res.attributeValueIds.includes(op.attributeValueId)
              }).map(vItem => {
                return vItem.attributeValueId
              })
              const val = itemVal.join('')
              item.attributeValueIdList = isNaN(val) ? val : val ? Number(val) : ''
            } else {
              item.attributeValueIdList = (item.attributeValueList || []).filter(op => {
                return res.attributeValueIds.includes(op.attributeValueId)
              }).map(vItem => {
                return vItem.attributeValueId
              })
            }
          } else {
            item.attributeValueIdList = item.type == 0 ? '' : []
          }
          item.valueVOList = item.attributeValueList
        })
        this.$set(this.attributeFom, 'attributeValueQOList', res.attributeClassifyVOList || []);
        this.$set(this.productInfo, 'attributeFomNew', this.attributeFom);
      })
    },
    // 所属分类下拉
    getAttributeValueList(attr) {
      return new Promise(resolve => {
        this.axios.post(api.query_findAttribute, {
          productCategoryId: attr.productCategoryId,
          productId: attr.productId
        }).then(res => {
          if (res.data.code == 0) {
            resolve(res.data.datas || []);
            return;
          }
          resolve([])
        }).catch(() => {
          resolve([])
        })
      })
    },
    // 咨询是否同步数据
    synchronousRemind(resolve) {
      if (!this.permission.synchronous) {
        this.$emit('update:editProductModal', false);
        this.$parent.$parent.pageParamsStatus = true;
        return
      }
      this.$Modal.confirm({
        width: 500,
        title: '商品信息变更',
        content: `是否自动同步商品信息至Listing？
        <div style="margin-top:10px; color:#f20;">
          注意：该操作会同步覆盖Listing中的商品基础资料，所有基础信息，多属性信息，属性信息，以ERP系统为主。
        </div>`,
        onOk: () => {
          this.turnBack();
          this.turnUpdate();
          this.$parent.$parent.pageParamsStatus = true;
          // 同步商品信息
          this.axios.post(api.synProductInfoToListing, {
            productInfoIds: [resolve.productId],
            type: 0
          }).then(res => {
            if (res.data.code == 0 && res.data.datas) {
              const failTotal = res.data.datas.addFailNum + res.data.datas.updateFailNum;
              if (failTotal == 0) {
                this.$Message.success('同步数据成功！')
              } else {
                this.$Message.error('同步商品信息失败')
              }
            } else {
              this.$Message.error('同步商品信息失败')
            }
          }).catch(() => {
            this.$Message.error('同步商品信息失败')
          })
        },
        onCancel: () => {
          this.$parent.$parent.pageParamsStatus = true;
          this.turnBack();
          this.turnUpdate();
        }
      })
    },
    loadingPicture() {
      this.isShowPicList = !this.isShowPicList;
      this.picNum = this.isShowPicList ? this.productInfo.productImages.length + 5 : 5;
    },
    // 编辑多属性
    editAttributes(info) {
      if (!this.$common.isEmpty(info.sizeGroupNo)) {
        this.$set(this.productInfo, 'sizeGroupNo', info.sizeGroupNo);
      }
      this.$nextTick(() => {
        let sizeGroupNo = this.productInfo.sizeGroupNo;
        this.editVisible = true;
        if (!this.$common.isEmpty(sizeGroupNo) && !this.$common.isEmpty(this.sizeList)) {
          // 只能选商品绑定的尺码组
          this.sizeList.forEach((item, index) => {
            this.$set(this.sizeList[index], 'disabled', sizeGroupNo != item.sizeGroupNo);
          })
        }
        for (let i in this.skuPropertyList) {
          this.skuPropertyList[i].isEdit = true;
        }
        this.skuDataOld = this.deepCopy(this.skuData);
        this.skuPropertyListOld = this.deepCopy(this.skuPropertyList);
        this.productInfoOld = this.deepCopy(this.productInfo);
      })
    },
    // 绑定尺码组弹窗
    bindSizeGroupNo() {
      this.$Modal.confirm({
        title: '操作提示',
        content: '请先绑定商品尺码组',
        onOk: () => {
          this.bindSizeModuleData = {
            sizeList: this.$common.copy(this.sizeList),
            skuData: this.$common.copy(this.skuData),
            productInfo: this.$common.copy(this.productInfo)
          }
          this.$nextTick(() => {
            setTimeout(() => {
              this.bindSizeGroupVisible = true;
            }, 310)
          })
        },
        onCancel: () => {
          this.$nextTick(() => {
            setTimeout(() => {
              this.editAttributes({});
            }, 310)
          })
        }
      });
    },
    // 获取颜色
    getColorList() {
      this.axios.get(api.getColorList, { hiddenError: true }).then(res => {
        if (res.data.code === 0) {
          this.colorList = res.data.datas;
        }
      });
    },
    // 获取尺码
    getSizeList() {
      return new Promise((resolve, reject) => {
        let productCategoryId = this.treeSelectCategoryValue;
        let productType = null;
        let sizeType = null;
        this.productCategoryListData.forEach(k => {
          if (k.productCategoryId == productCategoryId) {
            sizeType = k.sizeType
            productType = k.productType
          } else if (k.children) {
            k.children.forEach(j => {
              if (j.productCategoryId == productCategoryId) {
                sizeType = j.sizeType
                productType = j.productType
              }
            })
          }
        })
        this.sizeTypeFar = sizeType;
        this.productTypeFar = productType;
        // 判断商品类型： 服饰 家居 饰品
        if ((productType == 0 || productType == 2) && (sizeType || sizeType == 0)) {
          this.columnSizeOrModal = 'Size'
        } else {
          this.columnSizeOrModal = 'Modal'
        }
        if (sizeType || sizeType === 0) {
          // this.axios.get(api.getSizeList, { params: { sizeTypeId: sizeType } }).then(res => {
          this.axios.get(api.getSizeHistory, { params: { erpProductId: this.productId } }).then(res => {
            if (res.data.code === 0) {
              let list = [];
              let datas = res.data.datas;
              for (let i = 0; i < datas.length; i++) {
                let temp = {
                  ...datas[i],
                  value: 'arr' + (i + 1),
                  label: '尺码组' + (i + 1),
                  children: datas[i].sizeList
                };
                list.push(temp);
              }
              for (let i in list) {
                for (let j in list[i].children) {
                  list[i].children[j].value = list[i].children[j].size;
                  list[i].children[j].label = list[i].children[j].size
                }
              }
              this.sizeList = list || []
            }
          });
        } else {
          this.sizeList = []
        }
        resolve();
      })
    },
    addAttribute(item) {
      if (this.$common.isEmpty(this.productInfo.sizeGroupNo) && !this.isOldData && !this.$common.isEmpty(this.sizeList)) {
        this.editVisible = false;
        this.$nextTick(() => {
          this.bindSizeGroupNo();
        })
        return;
      }
      item.isEdit = false;
    },
    closeEdit() {
      this.skuData = this.$common.copy(this.skuDataOld);
      this.skuPropertyList = this.$common.copy(this.skuPropertyListOld);
      this.productInfo = this.$common.copy(this.productInfoOld);
    },
    saveEdit() {
      this.skuDataOld = this.$common.copy(this.skuData);
      this.skuPropertyListOld = this.$common.copy(this.skuPropertyList);
      this.productInfoOld = this.$common.copy(this.productInfo);
    },
    deleteTag(row, Dvalue, Dindex) {
      let skuDataNew = this.skuData.filter(k => {
        if (k.productGoodsSpecifications[Dindex].value !== Dvalue) {
          return k
        }
      })
      // 删除标签
      for (let i in row.values) {
        if (row.values[i] === Dvalue) {
          row.values.splice(i, 1)
        }
      }
      this.skuData = skuDataNew;
    },
    openSizeChart(type) {
      // if (!type) return;
      this.planType = type;
      const obj = { 1: 'chartModalVisible', 2: 'childVisible', 3: 'childVisible', 4: 'chartModalVisible' };
      if ([1, '1'].includes(type)) {
        this.getProductDetail();
      }
      this.$nextTick(() => {
        this[obj[type]] = true;
      })
    },
    getProductDetail() {
      return new Promise((resolve, reject) => {
        this.axios.get(api.queryLaPaProductGoodsInfo, {
          params: { productId: this.productInfo.productId }
        }).then((res) => {
          if (res.data.code === 0) {
            // 商品多属性(用于尺码图的左侧属性)
            this.$set(this.commodiAttr, 'laPaProductVariQuotationList', res.data.datas.laPaProductVariQuotationList || []);
            resolve(res.data.datas.attributeValueVOList || []);
          }
        }).catch(err => {
          reject(err);
        });
      })
    },
    // 禁用 所属分类下拉树
    disabledTreeItem() {
      return new Promise((resolve) => {
        const handTreeData = (arr, parent) => {
          if (!this.$common.isEmpty(parent) && parent.productCategoryId !== 'productCategoryId') {
            this.$set(parent, 'isDisabled', !parent.productChildType.includes(this.productTypeFar));
          }
          arr.forEach(item => {
            if (!this.$common.isEmpty(item.children)) {
              this.$set(item, 'productChildType', this.getChildAllType(item.children, item.productType));
              handTreeData(item.children, item);
            } else {
              if (item.productCategoryId !== 'productCategoryId') {
                this.$set(item, 'isDisabled', item.productType !== this.productTypeFar);
              }
            }
          });
          return arr;
        }
        this.productCategoryTree = handTreeData(this.$common.copy(this.productCategoryTree));
        // let tree = this.productCategoryTree[0].children;
        // tree.forEach(k => {
        //   if (k.children) {
        //     k.productType = k.children[0].productType
        //   } else {
        //     k.productType = null
        //   }
        //   if (k.productType !== this.productTypeFar) {
        //     this.$set(k, 'isDisabled', true)
        //   }
        //   if ((k.productType === '1' && this.productTypeFar === null) || (k.productType === null && this.productTypeFar === '1')) {
        //     this.$set(k, 'isDisabled', false)
        //   }
        // })
        resolve()
      })
    },
    // 获取子级所有 productType (包含自身)
    getChildAllType(arr, productType) {
      let list = [productType];
      arr.forEach(item => {
        list.push(item.productType);
        if (!this.$common.isEmpty(item.children)) {
          list = [...list, ...this.getChildAllType(item.children, item.productType)];
        }
      });
      return this.$common.arrRemoveRepeat(list).filter(f => !this.$common.isEmpty(f));
    },
    // 更新图片
    getSizePicture(data) {
      let list = [];
      let selfPic = [];
      const imgPathList = [...(this.productInfo.productImageList || []), ...(this.productInfo.productImageTypeList || [])].filter(item => {
        return [2, 3, 4, '2', '3', '4'].includes(item.imageType);
      }).map(m => m.path);
      const getImages = this.productInfo.productImages.filter(item => {
        return !imgPathList.includes(item);
      });
      (data || []).forEach(item => {
        list.push(item.pictureUrl);
        if (![0, 1, '0', '1'].includes(item.pictureType)) {
          selfPic.push({
            path: item.pictureUrl,
            imageType: item.pictureType
          });
        }
      });
      this.productInfo.productImages = getImages.concat(list);
      this.productInfo.productImageTypeList = selfPic;
      this.isShowPicList = false;
    },
    loadPicture() {
      for (let img of this.productInfo.productImages) {
        let image = new Image();
        image.src = this.filenodeViewTargetUrl + img
      }
    },
    dragStart(val, index) {
      this.oldVal = val;
      this.oldValIndex = index;
      this.isActive = val;
      this.isClick = true;
    },
    dragend(val, index) {
      if (this.oldValIndex != this.newOldIndex) {
        let newItems = [...this.productInfo.productImages];
        newItems.splice(this.oldValIndex, 1);
        newItems.splice(this.newOldIndex, 0, this.oldVal);
        this.productInfo.productImages = [...newItems];
        this.isActive = -1;
        setTimeout(() => {
          this.isClick = false;
        }, 1000)
      }
    },
    dragEnter(val, index) {
      this.newOld = val;
      this.newOldIndex = index;
    },
    checkOldData() {
      /*
        1、当 productGoodsList 数组下的所有 productGoodsSpecifications 为空时即为旧数据
        2、当 productGoodsList 数组下的 productGoodsSpecifications 有非空存在时，并且数组 productGoodsSpecifications 中的 typeValueId 存在空值时即为旧数据
      */
      const getOldItem = this.firstProductInfo.productGoodsList.filter(f => {
        if (!this.$common.isEmpty(f.productGoodsSpecifications)) {
          const findItem = f.productGoodsSpecifications.find(item => {
            return this.$common.isEmpty(item.typeValueId);
          })
          return !this.$common.isEmpty(findItem);
        }
        return true;
      })
      this.isOldData = !this.$common.isEmpty(getOldItem);
    },
    getChildType(type) {
      this.type = type;
    },
    tableEditcontent(html) {
      this.$refs.descdomeue.tableEditcontent(html)
    },
    // viewer放大预览图片
    showViewer(index) {
      // const $viewer = viewerApi({
      viewerApi({
        options: {
          toolbar: true,
          url: 'dataSource',
          initialViewIndex: index
        },
        images: this.viewerImages
      })
    },
    // 分销变更
    distributionConfirm(option) {
      this.$set(this.productInfo.productGoodsList[option.index], 'distributionPriceType', option.distributionPriceType);
      this.$set(this.productInfo.productGoodsList[option.index], 'distributionPriceValue', option.distributionPriceValue);
      this.$set(this.skuData[option.index], 'distributionPriceType', option.distributionPriceType);
      this.$set(this.skuData[option.index], 'distributionPriceValue', option.distributionPriceValue);
    },
    // 验证质检比例
    validateCheckRate(rule, value, callback) {
      if (![1, '1'].includes(this.productInfo.checkType)) {
        return callback();
      }
      if (this.$common.isEmpty(value, true)) {
        return callback(new Error('请输入质检比例'));
      }
      const re = /^[0-9]+$/;
      if (!re.test(value)) {
        return callback(new Error('请输入 1 - 99 之间的整数'));
      }
      const rate = Number(value);
      if (rate < 1 || rate > 99) {
        return callback(new Error('请输入 1 - 99 之间的整数'));
      }
      callback();
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
    // 向对应语言的复杂描述插入尺码模板
    insetDescription(data) {
      if (this.$common.isEmpty(this.descriptionBOJson[data.tabName])) return;
      let divDemo = document.createElement('div');
      divDemo.id = `${data.tableId}-content`;
      divDemo.style.position = 'absolute';
      divDemo.style.zIndex = '-10';
      divDemo.style.width = '100vw';
      divDemo.style.height = '100vh';
      divDemo.style.top = '100vh';
      divDemo.innerHTML = this.descriptionBOJson[data.tabName].description;
      document.body.appendChild(divDemo);
      this.$nextTick(() => {
        const tableHtml = divDemo.querySelector(`#${data.tableId}`);
        if (tableHtml) {
          tableHtml.remove();
          this.descriptionBOJson[data.tabName].description = divDemo.innerHTML + data.html;
        } else {
          this.descriptionBOJson[data.tabName].description += data.html;
        }
        divDemo.remove();
        if (this.langActiveTab == data.tabName && this.descActiveTab == 'description') {
          // 插入描述
          this.editor.setContent(this.descriptionBOJson[this.langActiveTab].description);
        }
      });
    }
  }
};
</script>

<style scoped lang="less">
.product-upload-list {
  width: 200px;
  height: 200px;
}

.custom-tag-input {
  line-height: normal;
  border: 1px solid #dddee1;
  border-radius: 4px;
  padding: 0 0 0 0;
}

.product-upload-list-cover i {
  margin: 0 6px;
}

.classify_style {
  :deep(.ivu-form-item-label) {
    &:before {
      content: "*";
      display: inline-block;
      margin-right: 4px;
      line-height: 1;
      font-family: SimSun;
      font-size: 14px;
      color: #ed4014;
    }
  }
}

.pictureBtn {
  width: 20px;
  height: 100px;
  white-space: inherit;
  text-align: center;
  padding-right: 24px
}

.box100 {
  width: 100px;
  height: 100px;
}

.box200 {
  width: 200px;
  height: 200px;
}

.box500 {
  width: 500px;
  height: 500px;
}

.attrForm {
  :deep(.ivu-form-item-label) {
    padding-left: 25px;
  }
}

.inputValue {
  display: inline-block;
  width: 160px;
}

.formItemLeft {
  width: 480px;

  :deep(.ivu-form-item-label) {
    padding-left: 10px;
  }
}

.bgContent {
  :deep(.ivu-form-item-label) {
    padding-left: 10px;
  }
}

.bottomBtn {
  display: flex;
  padding: 10px;
  flex-direction: row-reverse;
}

.tabs-textmaterial {
  position: relative;

  :deep(.tabs-btnpos) {
    position: absolute;
    top: 10px;
    right: 20px;
  }
}

.editPage {
  position: absolute;
  width: 100%;
  height: calc(100vh - 95px);
  top: 0;
  left: 0;
  background: #fff;
  overflow: hidden;
  z-index: 9;

  .edit-page-form {
    height: calc(100% - 42px);
    overflow: auto;
  }

  :deep(.ivu-select) {
    text-align: left;
  }
}

.topBtn {
  position: sticky;
  display: flex;
  justify-content: space-between;
  top: 0;
  width: 100%;
  text-align: right;
  background: #fff;
  z-index: 9999;
  box-shadow: 0px 1px 5px #bbb;

  .top-tags {
    height: 42px;
  }

  .head-tabs {
    height: 100%;

    .ivu-radio-group {
      height: 100%;

      .ivu-radio-wrapper {
        height: 42px;
        line-height: 42px;
        border: none;

        &.ivu-radio-wrapper-checked {
          color: #fff;
          background: #2d8cf0;
          border-radius: 0;
        }

        &:before {
          content: '';
          display: none;
        }
      }
    }
  }

  .top-buttons {
    margin: 5px;
    padding: 0 10px;
  }
}

.form-item-flex-wrap {
  display: flex;
  flex-flow: row wrap;

  .ivu-form-item {
    width: 33.33%;
    min-width: 300px;
  }
}

.flip-list-move {
  transition: transform 0.3s ease-in;
}

.display-flex {
  display: flex;

  .flex-30 {
    flex: 30;
  }

  .flex-70 {
    flex: 70;
  }
}

.products-content {
  &.purchase-content {
    display: flex;
    flex-flow: wrap;

    :deep(.ivu-form-item) {
      padding-left: 15px;
      width: 25%;
      min-width: 300px;
      max-width: 450px;
    }
  }
}
.tag-comtent-item{
  height: 100%;
  overflow: auto;
}
</style>
<style lang="less">
.product-img-box .ivu-checkbox {
  position: absolute;
  z-index: 999;
  left: 0;
  top: 0;
}

.custom-tag-input .ivu-input {
  border: none;
  height: 30px;
}

.custom-tag-input .ivu-input:focus {
  border-color: red;
  border: none;
  box-shadow: none;
}

.custom-tag-input .ivu-input:hover {
  border-color: red;
  border: none;
}

.custom-tag-input .ivu-tag {
  word-break: break-all;
  height: auto;
}

.productsCont {
  background-color: #fff;
  border: 1px solid #d7dde4;

  .sizeChartTable {

    .ivu-table td,
    .ivu-table th {
      border-bottom: 1px solid #e8eaec;
      border-left: 1px solid #e8eaec;
    }

    .ivu-table td:last-child,
    .ivu-table th:last-child {
      border-right: 1px solid #e8eaec;
    }
  }
}

.products-content {
  .important-attribute {
    .ivu-form-item-label {
      color: #f20;
      font-weight: bold;
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

.text-translate-5 {
  transform: translate(0, -5px);
}

.washed-operate {
  display: flex;

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
</style>
