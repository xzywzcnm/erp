<template>
  <div class="addProduct">
    <!-- 顶部工具条 -->
    <Affix :offset-top="50">
      <div class='back'>
        <div class="backText float-left">
          <Icon type="ios-arrow-back"></Icon>
          <a @click='backPage'>返回列表</a>
        </div>
        <div class="float-right" v-show="!isDisabled">
          <Button style="marginRight:10px;"
            type="primary"
            :loading="waitingOk"
            @click="beforeSave(false)"
            v-if="isSupplierTalg"
            >暂存
          </Button>
          <Button style="marginRight:10px;"
            type="primary"
            :loading="waitingOk"
            @click="beforeSave(true)"
            >
            {{
              isSupplierTalg
                ? '提交审批'
                : '保存'
            }}
          </Button>
          <Button @click="productCancel">取消</Button>
        </div>
      </div>
    </Affix>
    <Form ref="productInfo" :model="productInfo" :label-width="150" label-position="left">
      <!-- 基础信息 -->
      <div class="productsCont" @mouseenter="mouseEnterAnchor('#basic')">
        <div class="productsTit padding-10">
          <div id="basic">
            基本信息
          </div>
        </div>
        <div class="products-content padding-10">
          <!-- 商品中文名称 -->
          <Form-item label="商品中文名称："
            prop="cnName"
            :rules="{ required: true, message:'商品中文名称' + '不能为空', trigger: 'blur' }">
            <Input style="width:460px"
              :maxlength="1000"
              v-model.trim="productInfo.cnName"
              :disabled="isDisabled"
              placeholder="请输入商品中文名称"></Input>
          </Form-item>
          <!-- 商品英文名称 -->
          <Form-item label="商品英文名称：" prop="enName">
            <Input style="width:460px"
              :maxlength="1000"
              :disabled="isDisabled"
              v-model.trim="productInfo.enName"
              placeholder="请输入商品英文名称"></Input>
          </Form-item>
          <!-- SPU/商品编码 -->
          <Form-item label="SPU/商品编码："
            prop="spu"
            :rules="[{ required: true, message:'SPU/商品编码' + '不能为空', trigger: 'blur' }, { validator: validateFormSku, trigger: 'blur' }]">
            <Input style="width:300px"
              :maxlength="100"
              :disabled="isDisabled"
              v-model.trim="productInfo.spu"
              placeholder="请输入SPU/商品编码"></Input>
          </Form-item>
          <Form-item
            label="SKC:"
            prop="skc"
            :rules="[
              { required: productShow === 'add', validator: validateFormSkc, trigger: 'blur' },
              { required: productShow === 'add', validator: validateFormSkc, trigger: 'change' }
            ]"
          >
            <Input style="width:300px"
              :maxlength="100"
              :disabled="isDisabled || productShow !== 'add'"
              v-model="productInfo.skc"
              placeholder="请输入SKC"
            />
          </Form-item>
          <Row v-if="!isSupplierTalg">
            <Col span="10">
              <Form-item label="UPC：" prop="upc">
                <Input :disabled="skuData.length > 0 || isDisabled"
                  style="width:150px"
                  :maxlength="100"
                  v-model.trim="productInfo.productGoodsList[0].upc"
                  placeholder="请输入UPC"
                />
              </Form-item>
            </Col>
            <Col span="7">
              <Form-item label="EAN：" :label-width="50" prop="ean">
                <Input :disabled="skuData.length > 0 || isDisabled"
                  style="width:150px"
                  :maxlength="100"
                  v-model.trim="productInfo.productGoodsList[0].ean"
                  placeholder="请输入EAN"></Input>
              </Form-item>
            </Col>
            <Col span="7">
              <Form-item label="ISBN：" :label-width="50" prop="isbn">
                <Input :disabled="skuData.length > 0 || isDisabled"
                  style="width:150px"
                  :maxlength="100"
                  v-model.trim="productInfo.productGoodsList[0].isbn"
                  placeholder="请输入ISBN"></Input>
              </Form-item>
            </Col>
          </Row>
          <!-- 分类 -->
          <Form-item label="所属分类：" prop="productCategoryId" v-if="!isSupplierTalg">
            <!-- <treeSelect ref="productCategoryTree"
              style="width:300px"
              :disabled="isDisabled"
              :treeData="productCategoryTree"
              @on-change="getTreeData"
              filterable
              placeholder="请选择所属分类"
            /> -->
            <erpTreeSelect
              style="width:300px"
              :disabled="isDisabled"
              v-model="treeSelectCategoryValue"
              :multiple="false"
              :normalizer="treeNormalizer"
              :options="productCategoryTree"
              :default-expand-level="1"
              placeholder="请选择所属分类"
              noResultsText="无匹配数据"
              :always-open="treeAlwaysOpen"
              @input="getTreeData"
            />
          </Form-item>
          <!-- 分类 -->
          <Form-item v-if="isSupplierTalg"
            label="云卖分类："
            class="classify_style"
            prop="ymsProductCategoryId"
            :class="{'ivu-form-item-error': productInfo.ymsProductCategoryId === null}">
            <treeSelect ref="productCategoryTree1"
              style="width:300px"
              :disabled="isDisabled"
              :treeData="ymsMenuList"
              @on-change="getYmsTreeData"
              filterable
              placeholder="请选择所属分类"></treeSelect>
            <div v-show="productInfo.ymsProductCategoryId === null" class="ivu-form-item-error-tip">
              请选择云卖分类！
            </div>
          </Form-item>
          <!-- 品牌 -->
          <Form-item label="品牌：" prop="productBrandId">
            <dyt-select v-model.trim="productInfo.productBrandId"
              :disabled="isDisabled"
              :transfer="true"
              filterable
              clearable
              style="width:300px"
              placeholder="请选择品牌">
              <Option v-for="(item, index) in productBrandList"
                :key="index"
                :class="{ productBrandRed : item.status === 0, hidden : item.status === 0 && item.productBrandId !== productInfo.productBrandId}"
                :value="item.productBrandId">{{ item.name }}
             </Option>
            </dyt-select>
          </Form-item>
          <!-- 特性标签 -->
          <Form-item label="特性标签：" prop="productGoodsTags" v-if="!isSupplierTalg">
            <dyt-select :disabled="skuData.length > 0 || isDisabled"
              ref="productGoodsTagsSelect"
              @on-enter="addCustomTag"
              v-model="productInfo.productGoodsList[0].productGoodsTags"
              transfer
              filterable
              multiple
              style="width:300px"
              placeholder="请选择特性标签">
              <Option v-for="(name, index) in customProductTagList" :key="index" :value="name">{{ name }}</Option>
            </dyt-select>
          </Form-item>
          <!-- 采购成本价 -->
          <Form-item :label="textTalg + '：'" prop="suggestPrice">
            <InputNumber :disabled="skuData.length > 0 || isDisabled"
              :min="0"
              style="width:300px"
              v-model="productInfo.productGoodsList[0].suggestPrice"
              clearable></InputNumber>
          </Form-item>
          <!--样品价格-->
          <Form-item label="样品价格：" prop="samplePrice" v-if="isSupplierTalg">
            <InputNumber :disabled="skuData.length > 0 || isDisabled"
              :min="0"
              style="width:300px"
              v-model="productInfo.productGoodsList[0].samplePrice"
              clearable></InputNumber>
          </Form-item>
          <!--样品运费-->
          <Form-item label="样品运费：" prop="sampleFreight" v-if="isSupplierTalg">
            <InputNumber :disabled="skuData.length > 0 || isDisabled"
              :min="0"
              style="width:300px"
              v-model="productInfo.productGoodsList[0].sampleFreight"
              clearable></InputNumber>
          </Form-item>
          <!-- 商品状态 -->
          <Form-item v-if="!isSupplierTalg">
            <label slot="label">
              <span>商品状态：</span>
              <Tooltip placement="right-start" style="vertical-align: middle;">
                <Icon type="ios-help-circle-outline" style="color: #f60; font-size: 18px;cursor: pointer; font-weight: bold;" />
                <div slot="content">
                  <p v-for="(text, index) in statusTips" :key="`tips-${index}`">{{text}}</p>
                </div>
              </Tooltip>
            </label>
            <RadioGroup v-model="productInfo.productGoodsList[0].status">
              <Radio
                v-for="(item, index) in productStatus"
                :key="`radio-${index}`"
                :disabled="skuData.length > 0 || isDisabled"
                :label="item.value"
                style="marginRight:15px"
              >{{item.label}}</Radio>
            </RadioGroup>
          </Form-item>
          <Form-item label="商品开发员" v-if="!isSupplierTalg">
            <dyt-select v-model="productInfo.productDeveloperUserId" style="width: 300px;" :disabled="isDisabled">
              <Option v-for="item in businessRoleTypeList" :value="item.userId" :key="item.userId">{{ item.userName }}
             </Option>
            </dyt-select>
          </Form-item>
          <Form-item label="发货时效" prop="deliveryInterval" v-if="isSupplierTalg">
            <dyt-select v-model="productInfo.deliveryInterval" style="width: 300px;" :disabled="isDisabled">
              <Option v-for="(item, index) in deliveryIntervalList" :value="item.value" :key="index">{{ item.name }}
             </Option>
            </dyt-select>
          </Form-item>
        </div>
      </div>
      <!-- 属性信息 -->
      <div class="productsCont normalTop"
        @mouseenter="mouseEnterAnchor('#attribute')"
        v-if="attributeFom.attributeValueQOList.length > 0"
      >
        <div class="productsTit padding-10">
          <div id="attribute">
            属性信息
          </div>
        </div>
        <div class="products-content padding-10">
          <Form ref="attributeDome" :model="attributeFom" :label-width="150" label-position="left">
            <Form-item
              v-for="(attr, aIndex) in attributeFom.attributeValueQOList"
              :label="`${attr.cnName}：`"
              :key="`attr-${aIndex}`"
              :prop="`attributeValueQOList.${aIndex}.attributeValueIdList`"
              :rules="[
                {required: attr.isMandatory == 1, message: '必填项不能为空', trigger: 'blur', type: attr.type == 1 ? 'array' : 'number'},
                {required: attr.isMandatory == 1, message: '必填项不能为空', trigger: 'change', type: attr.type == 1 ? 'array' : 'number'}
              ]"
            >
              <dyt-select
                clearable
                v-model="attr.attributeValueIdList"
                :multiple="attr.type == 1"
                :disabled="isDisabled"
                style="width: 300px;"
              >
                <Option
                  v-for="(attrVal, vIndex) in attr.valueVOList"
                  :value="attrVal.attributeValueId"
                  :key="`attrVal-${vIndex}`"
                >{{`${attrVal.cnValue}:${attrVal.enValue}`}}</Option>
              </dyt-select>
            </Form-item>
          </Form>
        </div>
      </div>
      <!-- 规格与包装 -->
      <div class="productsCont normalTop" @mouseenter="mouseEnterAnchor('#spec')">
        <div class="productsTit padding-10">
          <div id="spec">
            规格与包装
          </div>
        </div>
        <div class="products-content padding-10">
          <!-- 商品重量 -->
          <Form-item label="商品重量（g）：" prop="weight">
            <InputNumber :disabled="skuData.length > 0 || isDisabled"
              :min="0"
              :precision="0"
              style="width:330px"
              v-model.trim="productInfo.productGoodsList[0].weight"></InputNumber>
          </Form-item>
          <!-- 商品尺寸 -->
          <Form-item label="商品尺寸（cm）：">
            <InputNumber :disabled="skuData.length > 0 || isDisabled"
              :min="0"
              :max="9999.99"
              style="width:90px"
              placeholder="长："
              v-model.trim="productInfo.productGoodsList[0].length"></InputNumber>
            <InputNumber :disabled="skuData.length > 0 || isDisabled"
              :min="0"
              :max="9999.99"
              style="width:90px; marginLeft:27px;"
              placeholder="宽："
              v-model.trim="productInfo.productGoodsList[0].width"></InputNumber>
            <InputNumber :disabled="skuData.length > 0 || isDisabled"
              :min="0"
              :max="9999.99"
              style="width:90px; marginLeft:27px;"
              placeholder="高："
              v-model.trim="productInfo.productGoodsList[0].height"></InputNumber>
          </Form-item>
          <!-- 商品体积 -->
          <Form-item label="商品体积（cm³）：" prop="bulk">
            {{ Math.round(productInfo.productGoodsList[0].length * productInfo.productGoodsList[0].width * productInfo.productGoodsList[0].height * 100) / 100 }}
          </Form-item>
        </div>
      </div>
      <!-- 报关信息 -->
      <div class="productsCont normalTop" @mouseenter="mouseEnterAnchor('#customs')" v-if="!isSupplierTalg">
        <div class="productsTit padding-10">
          <div id="customs">
            报关信息
          </div>
        </div>
        <div class="products-content padding-10">
          <!-- 报关中文名称 -->
          <Form-item label="报关中文名称：" prop="cnHsName">
            <Input style="width:330px"
              :disabled="isDisabled"
              :maxlength="200"
              v-model.trim="productInfo.cnHsName"
              placeholder="请输入报关中文名称"></Input>
          </Form-item>
          <!-- 报关英文名称 -->
          <Form-item label="报关英文名称：" prop="enHsName">
            <Input style="width:330px"
              :disabled="isDisabled"
              :maxlength="200"
              v-model.trim="productInfo.enHsName"
              placeholder="请输入报关英文名称"></Input>
          </Form-item>
          <!-- 报关编码 -->
          <Form-item label="报关编码（HS Code）：" prop="hsCode">
            <Input style="width:330px"
              :disabled="isDisabled"
              :maxlength="30"
              v-model.trim="productInfo.hsCode"
              placeholder="请输入报关编码（HS Code）"></Input>
          </Form-item>
        </div>
      </div>
      <!--物流匹配属性-->
      <div class="productsCont normalTop" @mouseenter="mouseEnterAnchor('#matchingLogistics')" v-if="!isSupplierTalg">
        <div class="productsTit padding-10">
          <div id="matchingLogistics">
            物流匹配属性
          </div>
        </div>
        <div class="products-content padding-10">
          <FormItem label="产品类型:">
            <CheckboxGroup v-model="productTypeListValue" @on-change="productTypeChange">
              <Checkbox :disabled="skuData.length > 0 || isDisabled "
                v-for="(item,index) in productTypeList"
                :key="index"
                :label="item.value">
                <span>{{ item.name }}</span>
              </Checkbox>
            </CheckboxGroup>
          </FormItem>
        </div>
      </div>
      <!-- 图片信息 -->
      <div class="productsCont normalTop" @mouseenter="mouseEnterAnchor('#producstPic')">
        <div class="productsTit padding-10">
          <div id="producstPic">
            图片信息
          </div>
          <div class="urlBtn" v-show="!isDisabled">
            <Button @click="delImgs" style="marginRight:10px;">删除选中图片</Button>
            <dytUpload ref="uploadProductInfoImg"
              name="files"
              :headers="uploadFilesHeader"
              :max-size="uploadFilesMaxSize"
              :on-exceeded-size="uploadExceedSize"
              :show-upload-list="false"
              :format="['jpg', 'png', 'gif']"
              :on-success="uploadFilesSuccess"
              :on-error="uploadFilesError"
              :on-format-error="handleFormatError"
              multiple
              :before-upload="beforeUpload"
              :action="uploadFilesUrl">
              <Button icon="image" style="marginRight:10px;">上传本地图片</Button>
            </dytUpload>
            <Button icon="link" @click="addNetWorkImg">上传图片URL</Button>
          </div>
        </div>
        <div class="products-content" style="overflow:auto;">
          <!-- 占位图 -->
          <div class="picBox padding-10" v-if="productInfo.productImages  && productInfo.productImages.length === 0">
            <Icon type="image" size="50" color="#d4d4d4"></Icon>
            <p>未添加图片</p>
          </div>
          <div class="padding-10 product-img-box">
            <!-- 显示图片 -->
            <CheckboxGroup v-model="delImgsValue">
              <template v-for="(path, index) in productInfo.productImages">
                <div class="product-upload-list"
                  v-if="productInfo.productImages"
                  :key="`${index}-${path}`">
                  <Checkbox :label="index" v-if="!isDisabled">
                    <img :src="filenodeViewTargetUrl + path">
                    <div class="product-upload-list-cover">
                      <Icon title="设为主图" type="ios-home-outline" @click.native="setProductPrimaryImg(index)"></Icon>
                      <Icon title="删除" type="ios-trash-outline" @click.native="removeProductImg(index)"></Icon>
                    </div>
                  </Checkbox>
                  <img v-else :src="filenodeViewTargetUrl + path">
                </div>
              </template>
              <template v-for="(file,index) in uploadFiles">
                <div :key="index" v-if="file.status !== 'finished'" class="product-upload-list">
                  <Progress v-if="file.showProgress" :percent="file.percentage"></Progress>
                </div>
              </template>
            </CheckboxGroup>
          </div>
        </div>
      </div>
      <!-- 商品描述 -->
      <div class="productsCont normalTop" @mouseenter="mouseEnterAnchor('#productDis')">
        <div class="productsTit padding-10">
          <div id="productDis">
            商品描述
          </div>
        </div>
        <div class="products-content padding-10">
          <div class="components-container">
            <Tabs v-model="langActiveTab" @on-click="langTabsSwitch" name="langTabName">
              <TabPane
                v-for="(item, index) in languageTab"
                :label="item.label"
                :name="item.key"
                :key="`${index}-${item.key}`"
                tab="langTabName"
              />
            </Tabs>
            <!-- <Form-item :label-width="90" label="标题：">
              <Input :disabled="isDisabled" v-model.trim="descriptionBOJson[langActiveTab]['title']" />
            </Form-item> -->
            <Form-item :label-width="90" label="关键词：">
              <local-tag-input
                style="width: 100%; display: inline-block"
                :disabled="isDisabled"
                :tags="descriptionBOJson[langActiveTab]['keywords']"
              />
            </Form-item>
            <Tabs v-model="descActiveTab" type="card" @on-click="descTabsSwitch" name="descTabName">
              <TabPane
                v-for="(desc, dIndex) in descriptionTab"
                :label="desc.label"
                :name="desc.key"
                :key="`${dIndex}-${desc.key}`"
                tab="descTabName"
              />
            </Tabs>
            <div class="editor-container">
              <UE
                :disabled="isDisabled"
                :content.sync="descriptionBOJson[langActiveTab][descActiveTab]"
                :htmlStatus="false"
                v-show="initFinished && descActiveTab !== 'textDescription'"
                id="productInfo.description.edit"
                :config=config
                ref="descdomeue"
              />
              <Input
                v-show="initFinished && descActiveTab === 'textDescription'"
                style="width: 100%;"
                type="textarea"
                :autosize="{ minRows: 12, maxRows: 12 }"
                :maxlength="65536"
                v-model="descriptionBOJson[langActiveTab][descActiveTab]"
                placeholder="请输入..."
                :disabled="isDisabled"
              />
            </div>
          </div>
        </div>
      </div>
      <!-- 质检标准 -->
      <div class="productsCont normalTop" @mouseenter="mouseEnterAnchor('#quality')" v-if="!isSupplierTalg">
        <div class="productsTit padding-10">
          <div id="quality">
            质检标准
            <Button v-show="!isDisabled" style="marginLeft:15px;" size="small" @click="addQuality">新增质检类目</Button>
          </div>
        </div>
        <div class="products-content padding-10">
          <div v-for="(item, index) in categoryList" :key="index">
            <Card dis-hover style="marginBottom:10px;">
              <!-- 质检类目 -->
              <Form-item :label-width="90" label="质检类目：" prop="measureName">
                <Input style="width:300px;" :disabled="isDisabled" v-model.trim="item.measureName"></Input>
                <Icon @click="addQualityItem(index)"
                  v-show="!isDisabled"
                  type="md-add"
                  size="20"
                  style="marginLeft:15px;cursor:pointer;"/>
                <Icon @click="delQualityItem(index)"
                  v-show="!isDisabled"
                  type="md-remove"
                  size="20"
                  style="marginLeft:15px;cursor:pointer;"/>
              </Form-item>
              <!-- 质检项 -->
              <Card dis-hover>
                <div v-for="(s, t) in item.measureVal" :key="t">
                  <Row>
                    <Col span="10">
                      <Form-item :label-width="80" label="质检项 ：" prop="itemName">
                        <Input style="width:300px;" :disabled="isDisabled" v-model.trim="s.itemName"></Input>
                      </Form-item>
                    </Col>
                    <Col span="14">
                      <Form-item :label-width="90" label="质检标准：" prop="itemValue">
                        <Input style="width:300px;" :disabled="isDisabled" v-model.trim="s.itemValue"></Input>
                        <Icon @click="delMeasureItem(index, t)"
                          v-show="!isDisabled"
                          type="md-remove"
                          size="20"
                          style="marginLeft:20px;cursor:pointer;"/>
                      </Form-item>
                    </Col>
                  </Row>
                </div>
              </Card>
            </Card>
          </div>
        </div>
      </div>
      <!-- 组装信息 -->
      <div v-if="!skuData.length && !isSupplierTalg" class="productsCont normalTop" @mouseenter="mouseEnterAnchor('#productAss')">
        <div class="productsTit padding-10">
          <div id="productAss">
            组装信息
          </div>
        </div>
        <div class="products-content padding-10">
          <div class="isAssemble">
            是否组装：
            <i-switch style="marginLeft:20px;" v-model="isAssemble" @on-change="assembleChange" :disabled="isDisabled">
              <span slot="open">开启</span>
              <span slot="close">关闭</span>
            </i-switch>
          </div>
          <div style="marginTop:10px;" v-if="isAssemble">
            组装信息：
            <span @click="addAssemble"
              style="color:#349EFA;text-decoration:underline;cursor:pointer;marginLeft:10px;">添加组装信息</span>
            <Table style="margin:20px 70px 10px;"
              :show-header="false"
              v-show="addAssembleData.length > 0"
              :columns="addAssembleColumns"
              :data="addAssembleData"></Table>
          </div>
        </div>
      </div>
      <!-- 商品多属性 -->
      <div class="productsCont normalTop" @mouseenter="mouseEnterAnchor('#productProperty')">
        <div class="productsTit padding-10">
          <div id="productProperty">
            商品多属性
          </div>
        </div>
        <div class="products-content padding-10">
          <div class="propertyText" v-if="!showAddCustomProperty">
            <p>如果商品存在变体版本，如不同颜色或尺寸，请点此
              <span v-show="!isDisabled" class="text-underline cursor blueColor" @click="showAddProperty">添加</span>
            </p>
          </div>
          <div class="propertyCont" v-if="showAddCustomProperty">
            <div class="proCont">
              <Row>
                <Col class="text-align-center" span="4">属性名称
                </Col>
                <Col class="h30" span="2"></Col>
                <Col class="text-align-center" span="14">属性值
                </Col>
                <Col class="h30" span="4"></Col>
              </Row>
              <Row :key="index" v-for="(skuProperty, index) in skuPropertyList">
                <Col span="4" style="display: flex;">
                  <Checkbox v-model="skuProperty.selected"
                    @on-change="changeCheckbox($event, skuProperty)"
                    v-if="isSupplierTalg && (skuProperty.name === '颜色' || skuProperty.name === '尺码')"
                    style="position: relative;top: 9px;"></Checkbox>
                  <Form-item :class="{'ivu-form-item-error':skuProperty.invalid}" :label-width="1">
                    <Input :disabled="skuProperty.values.length > 0 || isDisabled || skuProperty.disabled"
                      :maxlength="100"
                      @on-change="validatePropertyName(skuProperty)"
                      placeholder="添加属性"
                      v-model.trim="skuProperty.name"></Input>
                    <div v-show="skuProperty.invalid && !skuProperty.selected" class="ivu-form-item-error-tip">
                      属性有重复
                    </div>
                  </Form-item>
                </Col>
                <Col class="h30" span="2"></Col>
                <Col span="14" style="margin-bottom: 10px">
                  <div class="custom-tag-input" id="customTagInput">
                    <Tag style="margin-left:4px;"
                      v-for="(value, index1) in skuProperty.values"
                      :key="value"
                      closable
                      @on-close="delSkuPropertyValue(skuProperty, value, index1)">
                      {{ value }}
                    </Tag>
                    <Input @on-change="tagInputValueChange(index)"
                      :id="'tagInput' + index"
                      :disabled="skuProperty.name == '' || skuProperty.invalid || isDisabled || ( isSupplierTalg && !skuProperty.selected)"
                      :ref="skuProperty.name"
                      :maxlength="100"
                      @keyup.native.enter="addSkuPropertyValue(skuProperty, index)"
                      placeholder="多个属性值请用回车分隔"></Input>
                  </div>
                </Col>
                <Col class="text-align-center" span="4" v-show="!isDisabled && skuProperty.name !== '颜色' && skuProperty.name !== '尺码'">
                  <Button @click="delSkuProperty(skuProperty, index)" type="text">X</Button>
                </Col>
              </Row>
            </div>
            <Button v-show="!isDisabled" @click="addSkuProperty()">添加</Button>
            <dTable class="normalTop" v-show="skuData.length > 0" :columns="skuColumns" :data="skuData"></dTable>
          </div>
        </div>
        <!--尺码表-->
        <Table v-if="productInfo.ymsProductCategoryId !== null && hideSizeChart"
          class="sizeChartTable"
          style="margin:20px"
          :columns="sizeChartColumns"
          :data="sizeChartdata"></Table>
      </div>
    </Form>
    <!-- 保存&取消 -->
    <div class="float-right normalTop" v-show="!isDisabled">
      <Button style="marginRight:10px;"
        type="primary"
        :loading="waitingOk"
        @click="beforeSave(false)"
        v-if="isSupplierTalg"
        >暂存
      </Button>
      <Button style="marginRight:10px;"
        type="primary"
        :loading="waitingOk"
        @click="beforeSave(true)"
        >
        {{
          isSupplierTalg
            ? '提交审批'
            : '保存'
        }}
      </Button>
      <Button @click="productCancel">取消</Button>
    </div>
    <!-- 锚点 -->
    <div class="anchor">
      <ul>
        <li>
          <a href="javascript:;"
            @click="goAnchor('#basic') + '：'"
            :class="{ anchorChange : anchorStatus == '#basic' }">基本信息
          </a>
        </li>
        <li v-if="attributeFom.attributeValueQOList.length > 0">
          <a href="javascript:;"
            @click="goAnchor('#attribute') + '：'"
            :class="{ anchorChange : anchorStatus == '#attribute' }">属性信息
          </a>
        </li>
        <li>
          <a href="javascript:;"
            @click="goAnchor('#spec') + '：'"
            :class="{ anchorChange : anchorStatus == '#spec' }">规格与包装
          </a>
        </li>
        <li>
          <a href="javascript:;"
            @click="goAnchor('#customs') + '：'"
            :class="{ anchorChange : anchorStatus == '#customs' }">报关信息
          </a>
        </li>
        <li>
          <a href="javascript:;"
            @click="goAnchor('#producstPic') + '：'"
            :class="{ anchorChange : anchorStatus == '#producstPic' }">图片信息
          </a>
        </li>
        <li>
          <a href="javascript:;"
            @click="goAnchor('#productDis') + '：'"
            :class="{ anchorChange : anchorStatus == '#productDis' }">商品描述
          </a>
        </li>
        <li>
          <a href="javascript:;"
            @click="goAnchor('#quality') + '：'"
            :class="{ anchorChange : anchorStatus == '#quality' }">质检标准
          </a>
        </li>
        <li>
          <a href="javascript:;"
            @click="goAnchor('#productAss') + '：'"
            :class="{ anchorChange : anchorStatus == '#productAss' }">组装信息
          </a>
        </li>
        <li>
          <a href="javascript:;"
            @click="goAnchor('#productProperty') + '：'"
            :class="{ anchorChange : anchorStatus == '#productProperty' }">商品多属性
          </a>
        </li>
      </ul>
    </div>
    <!-- 上传图片url -->
    <Modal v-model="addNetWorkUrlModal" :loading="waitingUrlOk" title="从地址添加图片" @on-ok="addNetWorkImgOk">
      <Form :label-width="100" label-position="left">
        <Form-item label="图片地址：">
          <Input ref="addNetWorkUrlInput" placeholder="http://"></Input>
        </Form-item>
      </Form>
    </Modal>

    <keep-alive>
      <Modal v-model="modifyProductGoodsImgModal" v-if="renderModifyProductGoodsImgModal" title="变参SKU图片选择">
        <h2>SKU图片</h2>
        <div style="width:100px;height:100px;"
          class="product-upload-list"
          v-for="productGoodsImage in productGoodsImageArray"
          :key="productGoodsImage">
          <img :src="filenodeViewTargetUrl + productGoodsImage">
          <div class="product-upload-list-cover" style="padding-top:50px;">
            <Icon style="marginLeft:5px"
              title="设为主图"
              type="ios-home-outline"
              @click.native="setProductGoodsPrimaryImg(productGoodsImage)"></Icon>
            <Icon style="marginRight:5px"
              title="删除"
              type="ios-trash-outline"
              @click.native="removeProductGoodsImg(productGoodsImage)"></Icon>
          </div>
        </div>

        <template v-for="(file,index) in uploadList">
          <div v-if="file.status !== 'finished'"
            class="product-upload-list"
            style="width:100px;height:100px;"
            :key="index">
            <Progress v-if="file.showProgress" :percent="file.percentage"></Progress>
          </div>
        </template>
        <dytUpload name="files"
          ref="uploadProductGoodsImg"
          :headers="uploadFilesHeader"
          :show-upload-list="false"
          :max-size="uploadFilesMaxSize"
          :on-exceeded-size="uploadExceedSizeModal"
          :format="['jpg', 'png', 'gif', 'jpeg']"
          :on-error="uploadFilesErrorModal"
          :on-success="uploadFilesSuccessModal"
          :on-format-error="handleFormatErrorModal"
          :action="uploadFilesUrl"
          multiple
          :before-upload="beforeUploadModal"
          type="drag"
          style="display: inline-block;width:100px;">
          <div style="width: 100px;height:100px;line-height: 100px;">
            <Icon type="md-add" size="20"></Icon>
          </div>
        </dytUpload>
        <p style="margin-top:5px;margin-bottom:10px;">说明：
          <span style="color:red">上传图片会自动添加至SPU图库中</span>
        </p>
        <hr>
        <h2 style="margin-top:5px;margin-bottom:5px;">从SPU图库选择</h2>
        <template v-for="(productGoodsImage,index) in productInfo.productImages">
          <div style="width:100px;height:100px;"
            class="product-upload-list"
            v-if="productInfo.productImages"
            :key="productGoodsImage">
            <img :src="filenodeViewTargetUrl + productGoodsImage">
            <div class="product-upload-list-cover" style="padding-top:50px;">
              <Button @click="addSkuPic(index)" style="outline:none;box-shadow:none;" size="small" type="text">添加至SKU
              </Button>
            </div>
          </div>
        </template>
        <div style="width:100px;height:100px;"
          class="product-spu-list"
          v-if="productInfo.productImages  && productInfo.productImages.length === 0">
          <Icon type="image" size="30" color="#d4d4d4"></Icon>
          <p>未添加图片</p>
        </div>
        <div slot="footer">
          <Button @click="confirModifyProductGoodsImg" type="primary">确定</Button>
          <Button @click="uploadModalCancel">取消</Button>
        </div>
      </Modal>
    </keep-alive>
    <!-- 返回顶部 -->
    <BackTop></BackTop>
    <!-- 添加组装模态框 -->
    <addAssembleModal ref="addAssembleModal" @addTabData="addTabData" :openType="openType"></addAssembleModal>
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
// import sizeChartTable from './sizeChartTable';
// import draggable from 'vuedraggable';
import productData from '@/views/productCenter/components/productCenter/staticData/productData';

export default {
  mixins: [Mixin, tableMixin, productMixin],
  components: {
    UE,
    addAssembleModal
  },
  // 分类  品牌  特性标签  详情数据id
  props: {
    productShow: {
      type: String,
      default: 'edit'
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
    }
  },
  data () {
    let self = this;
    return {
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
      statusTips: productData.statusTips,
      treeAlwaysOpen: false,
      initGetTreeData: true,
      treeSelectCategoryValue: '',
      treeSelectCategoryJson: {},
      delImgsValue: [],
      msg: '',
      editIndex: -1, // 修改货品图片(货品下标)
      minWidth: 200, // 表格制定列最小宽度
      waitingOk: false, // 点击确认按钮是否需要显示loading遮罩
      waitingUrlOk: true, // 上传网络图片点击确认按钮是否需要显示loading遮罩
      anchorStatus: '#basic', // 控制锚点点击变色
      addNetWorkUrlModal: false, // 添加网络图片模态框标识
      showAddCustomProperty: false, // 是否显示自定义属性区
      initFinished: false, // 是否初始化完成
      productInfoPrototype: null, // 当前商品信息原型
      modifyProductGoodsImgModal: false, // 修改货品图片模态窗口显示隐藏标识
      renderModifyProductGoodsImgModal: false, // 渲染修改货品图片模态窗口
      checkedProductGoodsImages: [], // 已被选中的货品图片
      productGoodsImageArray: [], // 临时存放上传图片的数组
      productGoodsPrimaryImage: null, // 货品主图
      uploadList: [], // 新增的图片列表
      filenodeViewTargetUrl: self.$store.state.erpConfig.filenodeViewTargetUrl, // filenode根路径
      uploadFiles: [], // 商品图片信息列表
      uploadMaxLength: 5, // 一次最多选中5个图片上传
      uploadFilesUrl: api.upload_files + '?basePath=/product&&action="uploadimage"', // 上传url
      uploadFilesMaxSize: 10240, // 上传文件大小上线（kb）
      skuPropertyList: [ // 商品多属性列表
        {
          name: '',
          invalid: false,
          values: []
        }
      ],
      config: { // 富文本编辑器 配置
        initialFrameWidth: null,
        initialFrameHeight: 500,
        serverUrl: api.product_ueditor_enter,
        wordCount: false
      },
      productCategoryTree: [ // 商品分类树
        {
          title: '全部',
          expand: true,
          productCategoryId: 'productCategoryId1',
          children: []
        }
      ],
      specificationColorList: [ // 规格颜色
        '#169BD5', '#009900', '#763EAF', '#CC0033', '#FF9900', '#999999', '#33CC99', '#663300'
      ],
      attributeFom: {
        attributeValueQOList: [],
        productCategoryId: '',
        productId: ''
      },
      productInfo: { // 产品信息
        productId: '',
        type: 1,
        cnName: null,
        enName: null,
        spu: null,
        skc: null,
        cnHsName: null,
        enHsName: null,
        // description: '',
        descriptionBOList: [],
        hsCode: null,
        productBrandId: null,
        productCategoryId: null,
        ymsProductCategoryId: null,
        productImages: [],
        productQualityMeasureList: [], // 质检标准
        productGoodsList: [
          {
            productGoodsId: null,
            sku: null,
            skc: null,
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
            isAssemble: false, // 是否组装
            productGoodsAssembles: [] // 组装信息
          }
        ],
        operationType: 1, // 操作类型 0 暂存 1 提交
        deliveryInterval: 1
      },
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
          width: 100,
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
                  self.$nextTick(function () {
                    self.modifyProductGoodsImgModal = true;
                    self.productGoodsImageArray = self.deepCopy(self.productInfo.productGoodsList[params.index].productGoodsImages);
                  });
                  self.editIndex = params.index;
                }
              }
            });
          }
        }, {
          title: 'SKU',
          key: 'sku',
          width: 100,
          align: 'center',
          renderHeader: (h, params) => {
            return h('div', {
              class: 'required'
            }, params.column.title);
          },
          render: (h, params) => {
            if (self.productId !== null && params.index === 0) {
              return h('div', [
                h('Input', {
                  class: !self.productInfo.productGoodsList[params.index].sku
                    ? 'ivu-form-item-error'
                    : '',
                  props: {
                    placeholder: '请输入' + 'SKU',
                    maxlength: 100,
                    value: self.productInfo.productGoodsList[params.index].sku
                  },
                  on: {
                    'input': (val) => {
                      self.productInfo.productGoodsList[params.index].sku = self.trim(val);
                    }
                  }
                }),
                !self.productInfo.productGoodsList[params.index].sku
                  ? h('div', {
                    style: {
                      color: 'red',
                      margin: '5px 0',
                      textAlign: 'center'
                    }
                  }, 'SKU' + '不能为空')
                  : '',
                !self.validateSku(self.productInfo.productGoodsList[params.index].sku)
                  ? h('div', {
                    style: {
                      color: 'red',
                      margin: '5px 0',
                      textAlign: 'center'
                    }
                  }, '只能包含以下字符 0-9, #, &, +, -, ., /, A-Z, [, ], ^, _, a-z, { }, , ~')
                  : ''
              ]);
            }
            return h('div', [
              h('Input', {
                class: !self.productInfo.productGoodsList[params.index].sku
                  ? 'ivu-form-item-error'
                  : '',
                props: {
                  placeholder: '请输入' + 'SKU',
                  maxlength: 100,
                  value: self.productInfo.productGoodsList[params.index].sku
                },
                on: {
                  'input': (val) => {
                    self.productInfo.productGoodsList[params.index].sku = self.trim(val);
                  }
                }
              }),
              !self.productInfo.productGoodsList[params.index].sku
                ? h('div', {
                  style: {
                    color: 'red',
                    margin: '5px 0',
                    textAlign: 'center'
                  }
                }, 'SKU' + '不能为空')
                : '',
              !self.validateSku(self.productInfo.productGoodsList[params.index].sku)
                ? h('div', {
                  style: {
                    color: 'red',
                    margin: '5px 0',
                    textAlign: 'center'
                  }
                }, '只能包含以下字符 0-9, #, &, +, -, ., /, A-Z, [, ], ^, _, a-z, { }, , ~')
                : ''
            ]);
          }
        },
        {
          title: 'SKC',
          key: 'skc',
          width: 100,
          align: 'center',
          renderHeader: (h, params) => {
            return h('div', {
              class: 'required'
            }, params.column.title);
          },
          render: (h, params) => {
            if (self.productId !== null && params.index === 0) {
              return h('div', [
                h('Input', {
                  class: !self.productInfo.productGoodsList[params.index].skc
                    ? 'ivu-form-item-error'
                    : '',
                  props: {
                    placeholder: '请输入SKC',
                    maxlength: 100,
                    value: self.productInfo.productGoodsList[params.index].skc
                  },
                  on: {
                    'input': (val) => {
                      self.productInfo.productGoodsList[params.index].skc = self.trim(val);
                    }
                  }
                }),
                !self.productInfo.productGoodsList[params.index].skc
                  ? h('div', {
                    style: {
                      color: 'red',
                      margin: '5px 0',
                      textAlign: 'center'
                    }
                  }, 'SKC不能为空')
                  : !self.validatemSkc(self.productInfo.productGoodsList[params.index].skc)
                  ? h('div', {
                    style: {
                      color: 'red',
                      margin: '5px 0',
                      textAlign: 'center'
                    }
                  }, '请输入数字')
                  : ''
              ]);
            }
            return h('div', [
              h('Input', {
                class: !self.productInfo.productGoodsList[params.index].skc
                  ? 'ivu-form-item-error'
                  : '',
                props: {
                  placeholder: '请输入' + 'SKC',
                  maxlength: 100,
                  value: self.productInfo.productGoodsList[params.index].skc
                },
                on: {
                  'input': (val) => {
                    self.productInfo.productGoodsList[params.index].skc = self.trim(val);
                  }
                }
              }),
              !self.productInfo.productGoodsList[params.index].skc
                ? h('div', {
                  style: {
                    color: 'red',
                    margin: '5px 0',
                    textAlign: 'center'
                  }
                }, 'SKC' + '不能为空')
                : !self.validatemSkc(self.productInfo.productGoodsList[params.index].skc)
                ? h('div', {
                  style: {
                    color: 'red',
                    margin: '5px 0',
                    textAlign: 'center'
                  }
                }, '请输入数字')
                : ''
            ]);
          }
        },
        {
          title: 'UPC',
          key: 'upc',
          width: 100,
          align: 'center',
          renderHeader: (h, params) => {
            return self.checkIdenticalDon(h, params, 'UPC', self.productInfo.productGoodsList, 'upc');
          },
          render: (h, params) => {
            return h('Input', {
              props: {
                value: self.productInfo.productGoodsList[params.index].upc,
                maxlength: 100,
                placeholder: '请输入' + 'UPC'
              },
              on: {
                'input': (val) => {
                  self.productInfo.productGoodsList[params.index].upc = self.trim(val);
                }
              }
            });
          }
        }, {
          title: 'EAN',
          key: 'ean',
          width: 100,
          align: 'center',
          renderHeader: (h, params) => {
            return self.checkIdenticalDon(h, params, 'EAN', self.productInfo.productGoodsList, 'ean');
          },
          render: (h, params) => {
            return h('Input', {
              props: {
                value: self.productInfo.productGoodsList[params.index].ean,
                maxlength: 100,
                placeholder: '请输入' + 'EAN'
              },
              on: {
                'input': (val) => {
                  self.productInfo.productGoodsList[params.index].ean = self.trim(val);
                }
              }
            });
          }
        }, {
          title: 'ISBN',
          key: 'isbn',
          width: 100,
          align: 'center',
          renderHeader: (h, params) => {
            return self.checkIdenticalDon(h, params, 'ISBN', self.productInfo.productGoodsList, 'isbn');
          },
          render: (h, params) => {
            return h('Input', {
              props: {
                value: self.productInfo.productGoodsList[params.index].isbn,
                maxlength: 100,
                placeholder: '请输入' + 'ISBN'
              },
              on: {
                'input': (val) => {
                  self.productInfo.productGoodsList[params.index].isbn = self.trim(val);
                }
              }
            });
          }
        }, {
          title: '重量',
          key: 'weight',
          width: 80,
          align: 'center',
          renderHeader: (h, params) => {
            return self.checkIdenticalDon(h, params, '重量', self.productInfo.productGoodsList, 'weight');
          },
          render: (h, params) => {
            return h('InputNumber', {
              props: {
                min: 0,
                precision: 0,
                value: self.productInfo.productGoodsList[params.index].weight || 0
              },
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
        }, {
          title: '尺寸（长，宽，高）cm',
          key: 'spuTableSize',
          width: 260,
          align: 'center',
          renderHeader: (h, params) => {
            return self.checkIdenticalDon(h, params, '尺寸（长，宽，高）cm', self.productInfo.productGoodsList, [
              'length', 'width', 'height'
            ]);
          },
          render: (h, params) => {
            return h('div', [
              h('InputNumber', {
                style: {
                  width: '70px',
                  float: 'left'
                },
                props: {
                  min: 0,
                  value: self.productInfo.productGoodsList[params.index].length || 0,
                  placeholder: '长'
                },
                on: {
                  'input': (val) => {
                    self.productInfo.productGoodsList[params.index].length = val;
                  }
                }
              }), h('InputNumber', {
                style: {
                  width: '70px',
                  float: 'left',
                  marginLeft: '10px'
                },
                props: {
                  min: 0,
                  value: self.productInfo.productGoodsList[params.index].width || 0,
                  placeholder: '宽'
                },
                on: {
                  'input': (val) => {
                    self.productInfo.productGoodsList[params.index].width = val;
                  }
                }
              }), h('InputNumber', {
                style: {
                  width: '70px',
                  float: 'left',
                  marginLeft: '10px'
                },
                props: {
                  min: 0,
                  value: self.productInfo.productGoodsList[params.index].height || 0,
                  placeholder: '高'
                },
                on: {
                  'input': (val) => {
                    self.productInfo.productGoodsList[params.index].height = val;
                  }
                }
              })
            ]);
          }
        }, {
          title: '特性标签',
          key: 'tagName',
          align: 'left',
          minWidth: 200,
          renderHeader: (h, params) => {
            return self.checkIdenticalDon(h, params, '特性标签', self.productInfo.productGoodsList, 'productGoodsTags');
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
                value: self.productInfo.productGoodsList[params.index].productGoodsTags
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
                'on-change': (value) => {
                  self.productInfo.productGoodsList[params.index].productGoodsTags = value;
                }
              }
            }, productTagBox);
            return productLabelSelect;
          }
        }, {
          title: self.textTalg,
          key: 'suggestPrice',
          minWidth: 100,
          align: 'center',
          renderHeader: (h, params) => {
            return self.checkIdenticalDon(h, params, self.textTalg, self.productInfo.productGoodsList, 'suggestPrice');
          },
          render: (h, params) => {
            return h('InputNumber', {
              props: {
                min: 0,
                value: self.productInfo.productGoodsList[params.index].suggestPrice || 0
              },
              style: {
                width: '80px'
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
          title: '商品状态',
          key: 'status',
          minWidth: 120,
          align: 'center',
          renderHeader: (h, params) => {
            return self.checkIdenticalDon(h, params, '商品状态', self.productInfo.productGoodsList, 'status');
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
                  : self.productInfo.productGoodsList[params.index].status
              },
              on: {
                'input': (val) => {
                  self.productInfo.productGoodsList[params.index].status = val;
                }
              }
            }, list);
          }
        }, {
          title: '组装信息',
          width: 120,
          key: 'assemble',
          align: 'center',
          renderHeader: (h, params) => {
            return self.checkIdenticalDon(h, params, '组装信息', self.productInfo.productGoodsList, [
              'isAssemble', 'productGoodsAssembles'
            ]);
          },
          render: (h, params) => {
            if (self.productInfo.productGoodsList[params.index].isAssemble) {
              return h('div', [
                h('i-switch', {
                  props: {
                    value: self.productInfo.productGoodsList[params.index].isAssemble
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
                    textDecoration: 'underline'
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
                  value: self.productInfo.productGoodsList[params.index].isAssemble
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
        }, {
          title: '产品类型',
          width: 150,
          key: 'productType',
          align: 'center',
          renderHeader: (h, params) => {
            return self.checkIdenticalDon(h, params, '产品类型', self.productInfo.productGoodsList, 'productTypeListValue');
          },
          render: (h, params) => {
            return h('Select', {
              props: {
                multiple: true,
                filterable: true,
                transfer: true,
                value: self.productInfo.productGoodsList[params.index].productTypeListValue === null || self.productInfo.productGoodsList[params.index].productTypeListValue === undefined
                  ? ['01']
                  : self.productInfo.productGoodsList[params.index].productTypeListValue
              },
              on: {
                'on-change' (value) {
                  if (value.length > 1 && value.indexOf('01') > -1) {
                    value.forEach((i, j) => {
                      if (i === '01') {
                        value.splice(j, 1);
                      }
                    });
                    self.$nextTick(() => {
                      self.productInfo.productGoodsList[params.index].productTypeListValue = value;
                    });
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
        }, {
          title: '操作',
          width: 80,
          fixed: 'right',
          align: 'center',
          key: 'options',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                props: {
                  type: 'text'
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
      goodsImageMap: null,
      isAssemble: false, // 是否组装
      openType: null, // 1 普通商品  2 变参商品
      editAssembleIndex: null, // 变参组装信息  当前编辑的下表
      addData: [], // 临时组装信息数据
      addAssembleData: [], // 组装信息数据
      addAssembleColumns: [
        {
          title: 'picture',
          key: '',
          width: 200,
          align: 'center',
          render: (h, params) => {
            let productPic = params.row.pictureUrl;
            return h('img', {
              attrs: {
                src: productPic === '' || productPic == null || productPic === undefined
                  ? self.placeholderSrc
                  : self.filenodeViewTargetUrl + '/thumb' + productPic,
                class: 'thumb-image'
              }
            });
          }
        }, {
          title: 'sku',
          key: 'sku',
          width: 150,
          align: 'center'
        }, {
          title: 'value',
          key: '',
          minWidth: 200,
          align: 'center',
          render: (h, params) => {
            let specificationsList = params.row.value;
            let pos = '';
            if (!this.$common.isEmpty(specificationsList)) {
              if (specificationsList.length) {
                specificationsList.forEach((n, i) => {
                  pos += n.name + ':' + n.value + ';';
                });
                pos = pos.substr(0, pos.length - 1);
              }
              return h('div', [
                h('div', params.row.name), h('div', '(' + pos + ')')
              ]);
            } else {
              return h('div', params.row.name);
            }
          }
        }, {
          title: 'quantity',
          key: '',
          minWidth: 100,
          align: 'center',
          render: (h, params) => {
            return h('InputNumber', {
              props: {
                min: 1,
                value: params.row.quantity
              },
              style: {
                width: '80px'
              },
              on: {
                'input': (val) => {
                  self.addAssembleData[params.index].quantity = val;
                  self.addData[params.index].quantity = val;
                }
              }
            });
          }
        }, {
          title: 'delete',
          key: '',
          width: 100,
          align: 'center',
          render: (h, params) => {
            return h('Icon', {
              props: {
                type: 'md-close-circle',
                color: '#f00',
                size: 20
              },
              class: 'cursor',
              on: {
                click: () => {
                  self.delAssembleData(params.index);
                }
              }
            });
          }
        }
      ],
      /*
       类目结构：
       [{
       measureName: '类目1',
       measureVal: [
       {
       itemName: '长',
       itemValue: '1-10cm'
       },
       {
       itemName: '宽',
       itemValue: '5-15cm'
       }
       ]
       },
       {
       measureName: '类目2',
       measureVal: [
       {
       itemName: '颜色',
       itemValue: '红'
       }
       ]
       }]
       */
      categoryList: [], // 类目
      sizeChartdata: [],
      sizeChartColumns: [],
      templateObj: {},
      sizeJsonData: {},
      originalSizeChartdata: [],
      originalSizeJsonData: {},
      hideSizeChart: true,
      editor: null
    };
  },
  watch: {
    initFinished (n, o) {
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
            this.editor.setContent(this.descriptionBOJson[this.langActiveTab][this.descActiveTab]);
          })
        })
      }
    },
    addNetWorkUrlModal (n, o) { // 重置网络图片模态窗
      let v = this;
      if (!n) {
        v.$refs.addNetWorkUrlInput.$refs.input.value = '';
      }
    },
    checkedProductGoodsImages (n, o) { // 如果不勾选图片那么切换主图
      if (this.checkedProductGoodsImages.indexOf(this.productGoodsPrimaryImage) === -1) {
        this.productGoodsPrimaryImage = this.checkedProductGoodsImages[0] || null;
      }
    },
    productGoodsPrimaryImage (n, o) { // 勾选主图时如果没有选择那么默认勾选上
      if (this.checkedProductGoodsImages.indexOf(n) === -1) {
        this.checkedProductGoodsImages.push(n);
      }
    },
    renderModifyProductGoodsImgModal: function (n, o) {
      if (n) {
        var self = this;
        self.$nextTick(function () {
          self.uploadList = self.$refs.uploadProductGoodsImg.fileList;
        });
      }
    },
    // 尺码 的属性值
    skuPropertyList: {
      handler (data) {
        let v = this;
        if (data.length > 0) {
          data.map((item) => {
            if (item.name === '尺码') {
              if (item.selected) {
                v.sizeChartdata = [];
                v.talgSize = true;
              } else {
                v.talgSize = false;
                v.sizeChartdata = v.originalSizeChartdata;
                v.handlerTemplate(v.originalSizeJsonData);
              }
              item.values.map((ele) => {
                v.sizeChartdata.push(Object.assign({}, { sizeCode: ele }, v.templateObj));
              });
            }
          });
        }
      },
      deep: true
    },
    // 监听尺码表数据的变化
    sizeChartdata: {
      handler (data) {
        console.log('-----sizeChartdata------', data);
      },
      deep: true
    }
  },
  created () { // 页面初始化
    let v = this;
    this.textInit();
    this.productInfoPrototype = this.deepCopy(this.productInfo);
    this.customProductTagList = this.deepCopy(this.productTagList);
    this.getCommodityDeveloper();
    if (v.productId) { // 编辑
      Promise.resolve(v.axios.get(api.productInfo_detail + v.productId).then(response => {
        if (response.data.code === 0) {
          let datas = response.data.datas;

          if (v.isSupplierTalg) {
            v.setYmsCategoryData(datas.ymsProductCategoryId);
            if (datas.ymsProductCategoryId) {
              if (datas.sizeJson === null) {
                v.getTemplateData(datas.ymsProductCategoryId);
              } else {
                let jsonData = JSON.parse(datas.sizeJson);
                v.handlerTemplate(jsonData);
                v.sizeChartdata = datas.productSizeList.map(i => {
                  jsonData.productSizePartsBos.forEach(k => {
                    i.sizeDetailBos.forEach(j => {
                      if (k.name === j.partsName) {
                        i[k.ymsProductSizePartsId + '_partName'] = j.partsName;
                        i[k.ymsProductSizePartsId + '_defaultUnitName'] = j.unitName;
                        i[k.ymsProductSizePartsId + '_defaultValue'] = j.unitValue;
                      }
                    });
                  });
                  return i;
                });
                v.sizeJsonData = jsonData;
                let sizeChartdata = v.sizeChartdata;
                v.originalSizeChartdata = JSON.parse(JSON.stringify(sizeChartdata));
                v.originalSizeJsonData = JSON.parse(JSON.stringify(jsonData));
              }
            }
          }
          v.initCategoryTree(response.data.datas.productCategoryId);
          this.$set(this.attributeFom, 'productCategoryId', datas.productCategoryId);
          this.$set(this.attributeFom, 'productId', datas.productId);
          v.$nextTick(() => {
            v.initEditData(response.data.datas);
            // 获取分类属性值
            this.getAttributeData(datas, true);
          });
          let data = response.data.datas;
          let pos = [];
          let pic = null;
          if (data.type === 1) { // 普通商品
            if (data.productGoodsList[0].productGoodsAssembles) {
              if (data.productGoodsList[0].productGoodsAssembles.length) {
                v.isAssemble = true;
                data.productGoodsList[0].productGoodsAssembles.forEach((n, i) => {
                  pic = n.productGoodsImages
                    ? n.productGoodsImages[0].path
                    : null;
                  pos.push({
                    productGoodsId: n.materialProductGoodsId,
                    sku: n.sku,
                    skc: n.skc,
                    name: n.cnName,
                    value: n.productGoodsSpecifications,
                    quantity: n.quantity,
                    pictureUrl: pic
                  });
                });
                v.addAssembleData = pos;
                v.addData = pos;
              }
            }
          }
          v.initFinished = true;
        }
      }));
    } else { // 新增
      v.initCategoryTree(null);
      v.initFinished = true;
    }
  },
  computed: {
    uploadFilesHeader () {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    },
    permission () {
      return {
        synchronous: this.getPermission('productInfo_synListing')
      }
    },
    isDisabled () {
      if (this.editStatus === 'look') {
        return true;
      } else {
        return false;
      }
    },
    isSupplierTalg () {
      return this.$store.state.erpConfig.merchant.isSupplier === 1;
    },
    textTalg () {
      return this.$store.state.erpConfig.merchant.isSupplier === 1
        ? '分销价格'
        : '采购成本价';
    }
  },
  mounted () {
    this.uploadFiles = this.$refs.uploadProductInfoImg.fileList;
  },
  methods: {
    // 数据格式
    textInit (data = [], productId) {
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
        // console.log(this.descriptionBOJson)
      })
    },
    // 语言切换时更新数据多文本数据
    langTabsSwitch () {
      if (this.descActiveTab == 'textDescription') return;
      this.descriptionBOJson[this.oldActiveLang][this.oldActiveDesc] = this.editor.getContent();
      this.$nextTick(() => {
        const content = this.descriptionBOJson[this.langActiveTab][this.descActiveTab];
        this.editor.setContent(content);
        this.oldActiveLang = this.langActiveTab;
      })
    },
    // 描述类型切换时更新数据多文本数据
    descTabsSwitch () {
      if (this.descActiveTab == 'textDescription') return;
      this.descriptionBOJson[this.oldActiveLang][this.oldActiveDesc] = this.editor.getContent();
      this.$nextTick(() => {
        const content = this.descriptionBOJson[this.langActiveTab][this.descActiveTab];
        this.editor.setContent(content);
        this.oldActiveDesc = this.descActiveTab;
      })
    },
    // 数据转换
    textTranform (productInfo) {
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
          // console.log(newData, productInfo.productId);
          resolve(newData);
        })
      })
    },
    // skc 验证
    validatemSkc (value) {
      let reg = /^[0-9]*$/g;
      if (!reg.test(value)) {
        return false;
      }
      return true;
    },
    validateFormSkc (rule, value, callback) {
      if (this.isDisabled || this.productShow != 'add') {
        callback();
        return;
      }
      if (!value && rule.required) {
        callback(new Error('SKC不能为空'));
        return;
      }
      const valid = this.validatemSkc(value);
      !valid ? callback(new Error('不可输入其他字符，请输入数字')) : callback();
    },
    setYmsCategoryData (ymsProductCategoryId) {
      if (this.originalCategoryData) {
        let obj = this.originalCategoryData.filter(i => i.ymsProductCategoryId === ymsProductCategoryId);
        this.$refs.productCategoryTree1.treeSelectGetValue(obj);
      }
    },
    getYmsTreeData (productCategory) { // 选择分类时把id赋值给商品模型分类ID
      if (productCategory && productCategory.ymsProductCategoryId) {
        this.productInfo.ymsProductCategoryId = productCategory.ymsProductCategoryId;
        this.getTemplateData(this.productInfo.ymsProductCategoryId);
      } else {
        this.productInfo.ymsProductCategoryId = null;
      }
    },
    delImgs () {
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
    addSkuPic (index) { // 添加至SKU
      this.productGoodsImageArray.push(this.productInfo.productImages[index]);
    },
    removeProductGoodsImg (productGoodsImage) { // 删除货品图片
      let productGoodsImages = this.productGoodsImageArray;
      productGoodsImages.splice(productGoodsImages.indexOf(productGoodsImage), 1);
    },
    setProductGoodsPrimaryImg (productGoodsImage) { // 设置货品主图
      this.removeProductGoodsImg(productGoodsImage);
      let productGoodsImages = this.productGoodsImageArray;
      productGoodsImages.unshift(productGoodsImage);
    },
    confirModifyProductGoodsImg () { // 确认修改图片
      this.productInfo.productGoodsList[this.editIndex].productGoodsImages = this.productGoodsImageArray;
      this.modifyProductGoodsImgModal = false;
    },
    uploadModalCancel () { // 上传图片模态框取消
      this.productGoodsImageArray = [];
      this.modifyProductGoodsImgModal = false;
    },
    getProductCategoryTree (productCategoryListData, parentId, currentProductCategoryId) { // 组装商品分类树
      // let self = this;
      let tree = [];
      let children;
      if (!productCategoryListData) {
        return []
      }
      productCategoryListData.forEach((n, i) => {
        if (n.parentId === parentId) {
          n.title = n.cnName;
          n.expand = true;
          if (n.productCategoryId === currentProductCategoryId) {
            this.treeSelectCategoryValue = currentProductCategoryId;
            // self.$refs.productCategoryTree.treeSelectGetValue([n]);
          }
          children = this.getProductCategoryTree(productCategoryListData, n.productCategoryId, currentProductCategoryId);
          if (children.length > 0) {
            n.children = children;
          }
          this.treeSelectCategoryJson[n.productCategoryId] = n;
          tree.push(n);
        }
      });
      return tree;
    },
    mouseEnterAnchor (id) { // 修改锚点
      this.anchorStatus = id;
    },
    // 处理树节点
    treeNormalizer (node) {
      return {
        id: node.productCategoryId,
        label: node.title,
        children: node.children
      }
    },
    getTreeData (treeId) { // 选择分类时把id赋值给商品模型分类ID
      let productCategory = this.treeSelectCategoryJson[treeId] || {};
      // console.log('add', treeId, productCategory, this.productInfo.productCategoryId)
      if (['productCategoryId1'].includes(treeId)) {
        this.$nextTick(() => {
          this.treeAlwaysOpen = true
          this.treeSelectCategoryValue = this.productInfo.productCategoryId
        })
        return
      }
      if (['productCategoryId1', 'noCategory'].includes(treeId)) {
        delete productCategory.productCategoryId
      }
      const hand = {
        findExistValue: () => {
          if (!productCategory || this.productInfo.productCategoryId !== productCategory.productCategoryId) {
            // 当 productId 为空是，切换属性不提示
            if (!this.attributeFom.productId) {
              hand.changeData();
              return;
            }
            this.axios.post(api.query_findExistValue, { productId: this.attributeFom.productId }).then(res => {
              if (res.data.code === 0 && res.data.datas.isMandatory === 0) {
                this.$Modal.confirm({
                  title: '提示',
                  content: '<p>该商品所属分类已有属性信息，是否确认修改所属分类</p>',
                  onOk: () => {
                    hand.changeData();
                  },
                  onCancel: () => {
                    this.initCategoryTree(this.productInfo.productCategoryId);
                    this.initGetTreeData = true
                    this.treeAlwaysOpen = false
                  }
                });
              } else {
                hand.changeData();
              }
            }).catch(() => {
              this.treeAlwaysOpen = false
            });
          }
        },
        changeData: () => {
          this.treeAlwaysOpen = false
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
        }
      };
      if (!this.initGetTreeData) {
        this.initGetTreeData = false
        hand.findExistValue();
      }
    },
    backPage () { // 返回商品管理主页面
      // this.$store.commit('productShow', 'list');
      this.$emit('update:productShow', 'list')
      this.$parent.pageParamsStatus = true;
    },
    goAnchor (selector) { // 锚点
      var anchor = document.querySelectorAll(selector)[0].offsetTop - 50;
      this.anchorStatus = selector;
      document.body.scrollTop = anchor;
      // Firefox
      document.documentElement.scrollTop = anchor;
      // Safari
      window.pageYOffset = anchor;
    },
    validateCustomFields () { // 校验货品属性
      let self = this;
      let error = false;
      for (let i = 0; i < self.productInfo.productGoodsList.length; i++) {
        let productGoods = self.productInfo.productGoodsList[i];
        if ((productGoods.sku == null || productGoods.sku === '' || !self.validateSku(productGoods.sku)) && self.productInfo.productGoodsList[0].productGoodsSpecifications.length !== 0) {
          error = true;
          break;
        }
      }
      return !error;
    },
    beforeSave (value) { // 保存前校验
      let v = this;
      let status = null; // 1 质检项为空  2 质检项中的内容为空  3 质检类目为空
      let itemFlg = null; // 1 质检项为空  2 质检标准为空
      v.waitingOk = true;
      value
        ? v.productInfo.operationType = 1
        : v.productInfo.operationType = 0;
      // 处理及校验质检标准数据
      if (v.categoryList && v.categoryList.length) {
        v.categoryList.forEach((s, v) => {
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
          v.$Message.error('有无质检项的类目，请删除改类目或添加质检项后保存');
          v.waitingOk = false;
          return false;
        } else if (status === 2) {
          if (itemFlg === 1) {
            v.$Message.error('质检项不能为空');
            v.waitingOk = false;
            return false;
          } else if (itemFlg === 2) {
            v.$Message.error('质检标准不能为空');
            v.waitingOk = false;
            return false;
          }
        }
        if (status === 3) {
          v.$Message.error('质检类目不能为空');
          v.waitingOk = false;
          return false;
        }
        // 若无异常，则组装质检数据
        let pos = [];
        v.categoryList.forEach((n, i) => {
          n.measureVal.forEach((m, t) => {
            pos.push({
              itemName: m.itemName,
              itemValue: m.itemValue,
              measureName: n.measureName
            });
          });
        });
        v.productInfo.productQualityMeasureList = pos;
      }
      v.showSpin('处理中...');
      const hand = {
        productInfo: () => {
          v.$refs['productInfo'].validate((valid) => {
            if (valid && v.validateCustomFields()) {
              new Promise((resolve, reject) => {
                v.save(resolve);
              }).then(() => {
                v.waitingOk = false;
                v.hideSpin();
              }).catch((err) => {
                console.log('edit-------', err);
                v.waitingOk = false;
                v.hideSpin();
              });
            } else {
              v.waitingOk = false;
              v.hideSpin();
              this.$Message.error('存在必填项未填写，请确保已填写')
            }
          });
        }
      };
      this.$refs.attributeDome ? this.$refs.attributeDome.validate((attrvalid) => {
        if (!attrvalid) {
          v.waitingOk = false;
          v.hideSpin();
          this.$Message.error('商品属性信息存在必填项未填写，请确保已填写')
          return;
        }
        hand.productInfo();
      }) : hand.productInfo();
    },
    async save (resolve) { // 保存
      let v = this;
      if (v.productInfo.productGoodsList.length === 1 && v.productInfo.productGoodsList[0].productGoodsSpecifications.length === 0) { // 普通商品
        v.productInfo.productGoodsList[0].sku = v.productInfo.spu;
        if (v.productInfo.productGoodsList[0].length === null) {
          v.productInfo.productGoodsList[0].length = 0;
        }
        if (v.productInfo.productGoodsList[0].width === null) {
          v.productInfo.productGoodsList[0].width = 0;
        }
        if (v.productInfo.productGoodsList[0].height === null) {
          v.productInfo.productGoodsList[0].height = 0;
        }
        v.productInfo.productGoodsList[0].productGoodsAcceptableTc = v.productTypeListValue.join(',');
        // delete v.productInfo.productGoodsList[0].productTypeListValue;
        if (v.addAssembleData.length && v.isAssemble) {
          let pos = [];
          v.addAssembleData.forEach((n, i) => {
            pos.push({
              materialProductGoodsId: n.productGoodsId,
              quantity: n.quantity
            });
          });
          v.productInfo.productGoodsList[0].productGoodsAssembles = pos;
        }
      } else { // 变参商品
        v.productInfo.productGoodsList.forEach((m, t) => {
          if (m.isAssemble) {
            if (m.productGoodsAssembles && m.productGoodsAssembles.length) {
              let box = [];
              for (let s = 0; s < m.productGoodsAssembles.length; s++) {
                box.push({
                  materialProductGoodsId: m.productGoodsAssembles[s].materialProductGoodsId,
                  quantity: m.productGoodsAssembles[s].quantity
                });
              }
              m.productGoodsAssembles = box;
            }
          }
          if (m.productTypeListValue) {
            m.productGoodsAcceptableTc = m.productTypeListValue.join(',');
            delete m.productTypeListValue;
          }
        });
      }
      if (v.productInfo.productGoodsList) {
        v.productInfo.productGoodsList.forEach(i => {
          if (i.upc === '') {
            i.upc = null;
          }
        });
      }
      // v.productInfo.description = v.$refs.ue.getUEContent() || '';
      this.productInfo.descriptionBOList = await this.textTranform(this.productInfo);
      // 是供应商用户才做校验
      if (v.isSupplierTalg) {
        if (v.productInfo.ymsProductCategoryId === null) {
          v.$Message.error('请选择云卖分类！');
          v.waitingOk = false;
          v.hideSpin();
          return false;
        }
        // 处理尺码表的参数
        if (v.sizeChartdata.length > 0 && Object.keys(v.sizeJsonData).length > 0) {
          let insetProductSizeBoList = [];
          let data = v.sizeJsonData.productSizePartsBos;
          v.sizeChartdata.forEach(item => {
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
            obj.sizeCode = item.sizeCode;
            obj.ukSize = item.ukSize;
            obj.euSize = item.euSize;
            obj.usSize = item.usSize;
            insetProductSizeBoList.push(obj);
          });
          v.productInfo.insetProductSizeBoList = insetProductSizeBoList;
          v.productInfo.sizeJson = JSON.stringify(v.sizeJsonData);
          if (v.productInfo.insetProductSizeBoList.length > 0) {
            let list = v.productInfo.insetProductSizeBoList;

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
              v.$Message.error('尺码表单独规格必须填写完整！');
              v.waitingOk = false;
              v.hideSpin();
              return false;
            }
          }
        } else {
          delete v.productInfo.insetProductSizeBoList;
        }
      }
      // console.log('++++++++++++++++++++', v.productInfo);
      if (v.productInfo.productId) {
        resolve(v.axios.put(api.productInfo_update, JSON.stringify(v.productInfo)).then(response => {
          if (response.data.code === 0) {
            this.insertAttributeSpu('edit', v.productInfo);
            v.$Message.success('更新成功');
            // v.$store.commit('productShow', 'list');
            // v.$emit('update:productShow', 'list')
            // v.$parent.pageParamsStatus = true;
          }
        }));
      } else {
        let attributeFom = this.insertAttributeSpu('add');
        delete attributeFom.productId;
        delete attributeFom.productCategoryId;
        resolve(v.axios.post(api.productInfo_insert, { ...v.productInfo, ...attributeFom }).then(response => {
          if (response.data.code === 0) {
            v.$Message.success('新增成功');
            // v.$store.commit('productShow', 'list');
            // v.$emit('update:productShow', 'list')
            // v.$parent.pageParamsStatus = true;
            v.synchronousRemind({ ...v.productInfo, ...attributeFom, productId: response.data.datas.productId || '' }, 'add');
          }
        }));
      }
    },
    // 保存属性信息
    insertAttributeSpu (type, productInfo) {
      let attributeFom = JSON.parse(JSON.stringify(this.attributeFom));
      const attributeValueQOList = attributeFom.attributeValueQOList.map(item => {
        return {
          attributeValueIdList: typeof item.attributeValueIdList === 'number' ? [item.attributeValueIdList] : item.attributeValueIdList
        };
      });
      attributeFom.attributeValueQOList = attributeValueQOList.filter(item => {
        return typeof item.attributeValueIdList === 'number' || (item.attributeValueIdList && item.attributeValueIdList.length > 0);
      });
      if (type === 'add') {
        return attributeFom;
      }
      if (attributeFom.attributeValueQOList.length === 0) {
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
    productCancel () { // 取消
      this.skuData = [];
      // this.$store.commit('productShow', 'list');
      this.$emit('update:productShow', 'list')
      this.$refs['attributeDome'] && this.$refs['attributeDome'].resetFields();
    },
    setProductPrimaryImg (index) { // 设置商品主图
      let path = this.productInfo.productImages.splice(index, 1);
      this.productInfo.productImages.unshift(path[0]);
    },
    removeProductImg (index) { // 删除图片
      this.productInfo.productImages.splice(index, 1);
    },
    uploadFilesSuccess (res, file, uploadFiles) { // 上传成功
      this.productInfo.productImages.push(file.response.datas[0]);
    },
    uploadFilesError () { // 上传文件异常
      this.$Message.error('系统繁忙，请重新尝试');
    },
    handleFormatError () { // 上传文件格式异常
      this.$Message.error('文件格式有误');
    },
    addNetWorkImg () { // 控制上传图片url模态框
      this.addNetWorkUrlModal = true;
    },
    uploadExceedSize () { // 控制上传图片大小
      this.$Message.error('文件大小超出限制，最大为10M');
    },
    uploadFilesSuccessModal (response, file, fileList) { // sku列表上传成功
      this.productGoodsImageArray.push(file.response.datas[0]);
      this.productInfo.productImages.push(file.response.datas[0]);
    },
    uploadExceedSizeModal () {
      this.$Message.error('文件大小超出限制，最大为10M');
    },
    uploadFilesErrorModal () {
      this.$Message.error('系统繁忙，请重新尝试');
    },
    handleFormatErrorModal () { // sku列表上传失败
      this.$Message.error('文件格式有误');
    },
    beforeUploadModal (file) {
      let selectedFiles = this.$refs.uploadProductGoodsImg.$refs.input.files;
      let curFileIndex = -1;
      for (let i = 0; i < selectedFiles.length; i++) {
        if (selectedFiles[i] === file) {
          curFileIndex = i;
        }
      }
      if (curFileIndex === 0 && selectedFiles.length > this.uploadMaxLength) {
        this.$Message.error('文件数量超出限制，一次最多可上传5张');
        return false;
      } else if (selectedFiles.length > this.uploadMaxLength) {
        return false;
      }
      return true;
    },
    beforeUpload (file) { // 控制图片多选数量
      let selectedFiles = this.$refs.uploadProductInfoImg.$refs.input.files;
      let curFileIndex = -1;
      for (let i = 0; i < selectedFiles.length; i++) {
        if (selectedFiles[i] === file) {
          curFileIndex = i;
        }
      }
      if (curFileIndex === 0 && selectedFiles.length > this.uploadMaxLength) {
        this.$Message.error('文件数量超出限制，一次最多可上传5张');
        return false;
      } else if (selectedFiles.length > this.uploadMaxLength) {
        return false;
      }
      return true;
    },
    addNetWorkImgOk () { // 上传图片url模态框 确定
      let v = this;
      let reg = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?/;
      if (v.$refs.addNetWorkUrlInput.$refs.input.value && !reg.test(v.$refs.addNetWorkUrlInput.$refs.input.value)) {
        v.$Message.error('输入格式有误');
        v.waitingUrlOk = false;
        v.$nextTick(function () {
          v.waitingUrlOk = true;
        });
        return false;
      }
      if (v.$refs.addNetWorkUrlInput.$refs.input.value) {
        v.axios.post(api.upload_URlFiles + '?basePath=/product', [v.$refs.addNetWorkUrlInput.$refs.input.value]).then(response => {
          if (response.data.code === 0) {
            v.productInfo.productImages.push(response.data.datas[0]);
            v.waitingUrlOk = false;
            v.$nextTick(function () {
              v.waitingUrlOk = true;
            });
            v.addNetWorkUrlModal = false;
          }
        });
      } else {
        v.$Message.error('不能为空');
        v.waitingUrlOk = false;
        v.$nextTick(function () {
          v.waitingUrlOk = true;
        });
      }
    },
    initEditData (productInfo) { // 初始化编辑数据
      let v = this;
      v.productInfo = {
        type: productInfo.type,
        productId: productInfo.productId,
        cnName: productInfo.cnName,
        enName: productInfo.enName,
        spu: productInfo.spu,
        cnHsName: productInfo.cnHsName,
        enHsName: productInfo.enHsName,
        descriptionBOList: productInfo.descriptionBOList || [],
        hsCode: productInfo.hsCode,
        productBrandId: productInfo.productBrandId,
        productCategoryId: productInfo.productCategoryId,
        ymsProductCategoryId: productInfo.ymsProductCategoryId,
        productImages: [],
        productGoodsList: [],
        productDeveloperUserId: productInfo.productDeveloperUserId,
        deliveryInterval: productInfo.deliveryInterval,
        productQualityMeasureList: productInfo.productQualityMeasureList // 质检数据
      };
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
        v.categoryList = pos;
      }
      // End
      if (productInfo.productImageList && productInfo.productImageList.length > 0) {
        productInfo.productImageList.forEach(function (productImage, i) {
          v.productInfo.productImages.push(productImage.path);
        });
      }
      if (productInfo.productGoodsList.length === 1 && productInfo.productGoodsList[0].productGoodsAcceptableTypes) {
        v.productTypeListValue = productInfo.productGoodsList[0].productGoodsAcceptableTypes.map(i => {
          return i.typeCode;
        });
      } else if (productInfo.productGoodsList.length > 1) {
        productInfo.productGoodsList.forEach(i => {
          if (i.productGoodsAcceptableTypes) {
            i.productTypeListValue = i.productGoodsAcceptableTypes.map(i => {
              return i.typeCode;
            });
          }
        });
      }
      productInfo.productGoodsList.forEach((productGoods, index) => {
        let newProductGoods = {
          productGoodsId: productGoods.productGoodsId,
          sku: productGoods.sku,
          skc: productGoods.skc,
          ean: productGoods.ean,
          upc: productGoods.upc,
          isbn: productGoods.isbn,
          width: productGoods.width,
          height: productGoods.height,
          length: productGoods.length,
          weight: productGoods.weight,
          status: productGoods.status,
          suggestPrice: productGoods.suggestPrice,
          samplePrice: productGoods.samplePrice,
          sampleFreight: productGoods.sampleFreight,
          productGoodsTags: [],
          productGoodsImages: [],
          productGoodsSpecifications: [],
          isAssemble: false // 是否组装
        };
        let productGoodsTagNames = [];
        let productGoodsImagePaths = [];
        let productGoodsTags = productGoods.productGoodsTags;
        let productGoodsImages = productGoods.productGoodsImages;
        if (productGoodsTags) {
          productGoodsTags.forEach(function (productGoodsTag, i) {
            productGoodsTagNames.push(productGoodsTag.tagName);
            if (v.customProductTagList.indexOf(productGoodsTag.tagName) === -1) {
              v.customProductTagList.push(productGoodsTag.tagName);
            }
          });
        }
        newProductGoods.productGoodsTags = productGoodsTagNames;
        if (productGoodsImages) {
          productGoodsImages.forEach(function (productGoodsImage, i) {
            productGoodsImagePaths.push(productGoodsImage.path);
          });
        }
        newProductGoods.productGoodsImages = productGoodsImagePaths;
        v.productInfo.productGoodsList.push(newProductGoods);
      });
    },
    initCategoryTree (currentProductCategoryId) { // 初始化分类树
      let v = this;
      let productCategoryTree = v.getProductCategoryTree(v.productCategoryListData, null, currentProductCategoryId);
      let noCategory = {
        title: '未分类',
        productCategoryId: 'noCategory'
      };
      this.treeSelectCategoryJson['noCategory'] = JSON.parse(JSON.stringify(noCategory))
      if (currentProductCategoryId === null || currentProductCategoryId == '') {
        this.treeSelectCategoryValue = 'noCategory'
        noCategory.selected = true;
        // v.$nextTick(function () {
        //   v.$refs.productCategoryTree.treeSelectGetValue([noCategory]);
        // });
      }
      productCategoryTree.unshift(noCategory);
      v.$set(v.productCategoryTree[0], 'children', productCategoryTree);
      this.treeSelectCategoryJson['productCategoryId1'] = JSON.parse(JSON.stringify(v.productCategoryTree[0]))
      this.$nextTick(() => {
        this.initGetTreeData = false
      })
    },
    addCustomTag (event) { // 添加自定义标签
      let v = this;
      let productGoodsTagsSelectInput = event.target;
      let value = productGoodsTagsSelectInput.value === null
        ? ''
        : v.trim(productGoodsTagsSelectInput.value);
      if (value !== '' && value.length <= 50 && v.customProductTagList.indexOf(value) === -1) {
        v.customProductTagList.push(value);
        let arr = v.productInfo.productGoodsList[0].productGoodsTags;
        arr.push(value);
        this.$nextTick(function () {
          v.productInfo.productGoodsList[0].productGoodsTags = arr;
        });
      } else {
        v.$Message.error('新增标签长度不能超过50且不能与已存在标签重复');
      }
    },
    assembleChange (val) { // 是否组装
      let v = this;
      if (val) {
        v.isAssemble = true;
      } else {
        v.isAssemble = false;
      }
    },
    addAssemble () { // 打开组装信息模态框
      let v = this;
      v.$refs.addAssembleModal.matchingGoodsStatus = true;
      v.$refs.addAssembleModal.matchingGoodsModal = true;
      v.$refs.addAssembleModal.getNormalGoodsData();
      v.openType = 1; // 普通商品
    },
    addTabData (val) { // 接收子组件传值
      // console.log(val);
      let v = this;
      // console.log(v.addData);
      if (v.openType === 1) { // 普通商品
        if (v.addData.length) {
          let status = false; // 判断是否有相同项
          let index = null; // 记录相同项的下标
          for (let m = 0; m < val.length; m++) {
            for (let n = 0; n < v.addData.length; n++) {
              if (v.addData[n].productGoodsId === val[m].productGoodsId) {
                status = true;
                index = n;
              }
            }
            if (status) {
              v.addData[index].quantity += val[m].quantity;
            } else {
              v.addData.push(val[m]);
            }
            status = false;
          }
        } else {
          v.addData = val;
        }
        v.addAssembleData = v.addData;
      } else if (v.openType === 2) { // 变参商品
        let pos = [];
        val.forEach((j, k) => { // 为了保持数据一致，这里处理了下数据
          pos.push({
            materialProductGoodsId: j.productGoodsId,
            sku: j.sku,
            skc: j.skc,
            name: j.name,
            value: j.value,
            quantity: j.quantity,
            pictureUrl: j.pictureUrl
          });
        });
        v.productInfo.productGoodsList[v.editAssembleIndex].productGoodsAssembles = pos;
      }
    },
    delAssembleData (index) { // 删除组装数据
      let v = this;
      v.addAssembleData.splice(index, 1);
    },
    editAssemble (index) { // 编辑变参商品组装信息
      let v = this;
      v.$refs.addAssembleModal.matchingGoodsStatus = true;
      v.$refs.addAssembleModal.matchingGoodsModal = true;
      v.$refs.addAssembleModal.getNormalGoodsData();
      v.openType = 2; // 变参商品
      v.editAssembleIndex = index; // 记录当前下标
      let value = v.productInfo.productGoodsList[index].productGoodsAssembles;
      if (value) {
        if (value.length) {
          v.$refs.addAssembleModal.matchingGoodsList = value;
          v.$refs.addAssembleModal.openStatus = true;
          v.$refs.addAssembleModal.addProStatus = true;
        }
      }
    },
    showAddProperty () { // 编辑商品多属性 （先判断是否是组装商品） skuPropertyList
      let v = this;
      v.showAddCustomProperty = true;
      let pos = [];
      if (v.addAssembleData.length) {
        v.addAssembleData.forEach((n, i) => {
          pos.push({
            materialProductGoodsId: n.productGoodsId,
            sku: n.sku,
            skc: n.skc,
            name: n.name,
            value: n.value,
            quantity: n.quantity,
            pictureUrl: n.pictureUrl
          });
        });
      }
      if (v.isAssemble) {
        v.productInfo.productGoodsList[0].isAssemble = true;
        v.productInfo.productGoodsList[0].productGoodsAssembles = pos;
      }
      if (v.isSupplierTalg) {
        v.originalSizeChartdata = JSON.parse(JSON.stringify(v.sizeChartdata));
        v.skuPropertyList = [
          {
            name: '颜色',
            invalid: false,
            values: [],
            selected: false,
            disabled: true
          },
          {
            name: '尺码',
            invalid: false,
            values: [],
            selected: false,
            disabled: true
          }
        ];
      }
    },
    addQuality () { // 新增质检类目
      let v = this;
      v.categoryList.push({
        measureName: null,
        measureVal: [
          {
            itemName: null,
            itemValue: null
          }
        ]
      });
    },
    addQualityItem (index) { // 给当前类目添加质检项
      let v = this;
      v.categoryList[index].measureVal.push({
        itemName: null,
        itemValue: null
      });
    },
    delQualityItem (index) { // 删除当前类目
      let v = this;
      v.categoryList.splice(index, 1);
    },
    delMeasureItem (index, t) { // 删除当前质检项
      let v = this;
      v.categoryList[index].measureVal.splice(t, 1);
    },
    // 获取尺码模板的数据
    getTemplateData (ymsProductCategoryId) {
      let v = this;
      v.axios.get(api.get_ymsProductSizeTemplate + `${ymsProductCategoryId}`).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            v.hideSizeChart = true;
            v.sizeJsonData = data;
            v.sizeChartdata = [
              {
                sizeCode: '',
                ukSize: '',
                euSize: '',
                usSize: '',
                sizeDetailBos: [],
                __edit: true
              }
            ];
            data.productSizePartsBos.forEach(i => {
              v.sizeChartdata[0][i.ymsProductSizePartsId + '_defaultValue'] = null;
              v.sizeChartdata[0][i.ymsProductSizePartsId + '_partName'] = i.name;
              v.sizeChartdata[0][i.ymsProductSizePartsId + '_value'] = null;
              data.productSizeUnitBos.forEach(j => {
                if (j.isDefault === 1) {
                  v.sizeChartdata[0][i.ymsProductSizePartsId + '_defaultUnitName'] = j.name;
                }
              });
            });
            let sizeChartdata = v.sizeChartdata;
            v.originalSizeChartdata = JSON.parse(JSON.stringify(sizeChartdata));
            v.originalSizeJsonData = JSON.parse(JSON.stringify(data));
            v.handlerTemplate(data);
          } else {
            // 没有绑定尺码模板时，隐藏尺码表
            v.sizeChartdata = [];
            v.hideSizeChart = false;
          }
        }
      });
    },
    // 处理尺码表的单位
    handlerUnit (data, value) {
      let children = [];
      let obj = {};
      let v = this;
      if (data.productSizeUnitBos.length > 0) {
        let list = data.productSizeUnitBos;
        list.map((item) => {
          if (item.isDefault === 1) {
            v.templateObj[value + '_defaultUnitName'] = item.name;
            obj = {
              title: item.name,
              key: value + '_defaultValue',
              align: 'center',
              render: (h, params) => {
                return h('InputNumber', {
                  props: {
                    value: params.row[value + '_defaultValue'] ? Number(params.row[value + '_defaultValue']) : null,
                    min: 0,
                    disabled: v.isDisabled
                  },
                  on: {
                    'on-change': val => {
                      params.row[value + '_defaultValue'] = val;
                      v.sizeChartdata[params.index] = params.row;
                      // v.$set(v.sizeChartdata, params.index, params.row);
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
                    // eslint-disable-next-line no-unused-expressions
                    Math.floor(num * 100) / 100;
                    num = num.toFixed(2);
                  }
                } else {
                  // 厘米转化成英寸
                  if (unitValue > 0) {
                    num = unitValue * 0.393701;
                    // eslint-disable-next-line no-unused-expressions
                    Math.floor(num * 100) / 100;
                    num = num.toFixed(2);
                  }
                }
                params.row[value + '_value'] = Number(num) === 0 || isNaN(Number(num))
                  ? null
                  : Number(num);
                v.sizeChartdata[params.index] = params.row;
                // v.$set(v.sizeChartdata, params.index, params.row);
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
    handlerTemplate (data) {
      let v = this;
      v.sizeChartColumns = [];
      const fixColumn = [
        {
          title: 'UK Size',
          key: 'ukSize',
          align: 'center',
          render: (h, params) => {
            return h('Input', {
              props: {
                value: isNaN(Number(params.row.ukSize)) ? 0 : params.row.ukSize,
                disabled: v.isDisabled
              },
              style: {
                width: '70px'
              },
              on: {
                'on-change' (e) {
                  if (!isNaN(Number(e.target.value))) {
                    v.sizeChartdata[params.index]['ukSize'] = e.target.value;
                  } else {
                    v.sizeChartdata[params.index]['ukSize'] = 0;
                  }
                  // params.row['ukSize'] = e.target.value;
                  // v.$set(v.sizeChartdata, params.index, params.row);
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
                value: isNaN(Number(params.row.euSize)) ? 0 : params.row.euSize,
                disabled: v.isDisabled
              },
              style: {
                width: '70px'
              },
              on: {
                'on-change' (e) {
                  if (!isNaN(Number(e.target.value))) {
                    v.sizeChartdata[params.index]['euSize'] = e.target.value;
                  } else {
                    v.sizeChartdata[params.index]['euSize'] = 0;
                  }

                  // params.row['euSize'] = e.target.value;
                  // v.$set(v.sizeChartdata, params.index, params.row);
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
                value: isNaN(Number(params.row.usSize)) ? 0 : params.row.usSize,
                disabled: v.isDisabled
              },
              style: {
                width: '70px'
              },
              on: {
                'on-change' (e) {
                  if (!isNaN(Number(e.target.value))) {
                    v.sizeChartdata[params.index]['usSize'] = e.target.value;
                  } else {
                    v.sizeChartdata[params.index]['usSize'] = 0;
                  }
                  // params.row['usSize'] = e.target.value;
                  // v.$set(v.sizeChartdata, params.index, params.row);
                }
              }
            });
          }
        }];
      if (data) {
        let size = {
          title: 'Tag Size',
          key: 'sizeCode',
          align: 'center',
          render: (h, params) => {
            return h('Input', {
              props: {
                value: params.row.sizeCode,
                disabled: v.isDisabled || v.talgSize
              },
              style: {
                width: '70px'
              },
              on: {
                'on-change' (e) {
                  v.sizeChartdata[params.index]['sizeCode'] = e.target.value;
                  // params.row['sizeCode'] = e.target.value;
                  // v.$set(v.sizeChartdata, params.index, params.row);
                }
              }
            });
          }
        };
        // 部位
        let place = {};
        if (data.productSizePartsBos && data.productSizePartsBos.length > 0) {
          data.productSizePartsBos.map((item, index) => {
            v.templateObj[item.ymsProductSizePartsId + '_partName'] = item.name;
            v.templateObj[item.ymsProductSizePartsId + '_defaultValue'] = null;
            v.templateObj[item.ymsProductSizePartsId + '_value'] = null;
            place = {
              title: item.name,
              align: 'center',
              width: 180,
              children: v.handlerUnit(data, item.ymsProductSizePartsId, index)
            };
            v.sizeChartColumns.push(place);
          });
        }
        v.sizeChartColumns.unshift(size, ...fixColumn);
      }
    },
    // 默认勾选的属性名
    changeCheckbox (event, item) {
      let v = this;
      if (!event) {
        for (let i = item.values.length - 1; i >= 0; i--) {
          let value = item.values[i];
          v.delSkuPropertyValue(item, value, i);
        }
      }
      let input = v.$refs[item.name][0].$refs.input;
      v.$nextTick(() => {
        input.value = '';
      });
    },
    // 校验云卖分类
    validateClassify (rule, value, callback) {
      let v = this;
      if (v.productInfo.ymsProductCategoryId === null || v.productInfo.ymsProductCategoryId === '') {
        callback(new Error('云卖分类' + '不能为空'));
      } else {
        callback();
      }
    },
    // 获取分类属性值
    getAttributeData (attr, type) {
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
      })
    },
    // 所属分类下拉
    getAttributeValueList (attr) {
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
    synchronousRemind (resolve) {
      if (!this.permission.synchronous) {
        this.$emit('update:productShow', 'list');
        this.$parent.pageParamsStatus = true;
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
          this.$emit('update:productShow', 'list');
          this.$parent.pageParamsStatus = true;
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
          this.$emit('update:productShow', 'list');
          this.$parent.pageParamsStatus = true;
        }
      })
    }
  }
};
</script>
<style scoped lang="less">
.custom-tag-input {
  line-height: normal;
  border: 1px solid #dddee1;
  border-radius: 4px;
  padding: 0 0 0 0;
  display: flex;
}

.product-upload-list {
  width: 200px;
  height: 200px;
}

.classify_style{
  :deep(.ivu-form-item-label){
    &:before{
      content: '*';
      display: inline-block;
      margin-right: 4px;
      line-height: 1;
      font-family: SimSun;
      font-size: 14px;
      color: #ed4014;
    }
  }
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
    .ivu-table td, .ivu-table th {
      border-bottom: 1px solid #e8eaec;
      border-left: 1px solid #e8eaec;
    }

    .ivu-table td:last-child, .ivu-table th:last-child {
      border-right: 1px solid #e8eaec;
    }
  }
}
</style>
