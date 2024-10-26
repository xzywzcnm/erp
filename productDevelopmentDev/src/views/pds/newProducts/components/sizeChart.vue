<template>
  <div>
    <Modal v-model="modelVisible" width="90%" :title="title" :mask-closable="false" class="sizecharts">
      <div class="fmb0 sizeContent" :class="{'woman-shoe-plan': [4].includes(planType)}">
        <Form :model="formItem" :label-width="100" label-position="left">
          <div v-if="defaultLanguage">
            <div class="flex-sty size-form">
              <div class="flex-form" v-if="JSON.stringify(landataItem) !== '{}' && [1].includes(planType)">
                <div class="mb15">
                  <FormItem
                    :label="`${landataItem&&!$common.isEmpty(landataItem.labellist[0])?landataItem.labellist[0].label:''}:`"
                    class="form-border--bot"
                    :label-width="80"
                  >
                    <div class="lan-inputs flex-center">
                      <div v-for="(item,key) in language" :key="key+'lan'">
                        <div v-if="!item.hidden && validLanguage.includes(item.type)" class="input-items flex-center">
                          <span class="input-item-l">{{item.label}}:</span>
                          <dyt-input v-model="language[key].fabric" class="input-item-c" />
                        </div>
                      </div>
                    </div>
                  </FormItem>
                  <FormItem
                    :label="`${landataItem&&!$common.isEmpty(landataItem.labellist[1])?landataItem.labellist[1].label:''}:`"
                    class="form-border--bot mt5"
                    :label-width="80"
                  >
                    <div class="tag-item-content">
                      <div class="tag-item-text-content">
                        <span
                          class="tag-item-lable ml5 mb5"
                          v-for="(cTag, cIndex) in colorlistTxt"
                          :key="`c-${cIndex}`"
                          :style="`${!cTag.old && toopropSecect.color ? 'color: #f20;':''}`"
                        >
                          <span
                            class="tag-item-txt"
                            contenteditable="true"
                            @input="inputTagItem(cTag, $event, 'color')"
                            @focus="focusInput"
                            @blur="blurInput"
                          >{{cTag.colorName}}</span>
                        </span>
                      </div>
                      <Icon
                        type="ios-create-outline"
                        :style="`visibility:${toopropSecect.color?'hidden':'visible'};`"
                        @click="isVisibleToopropSecect('color', true)"
                      />
                      <div class="tooprop-secect-content" v-if="toopropSecect.color" style="z-index: 12;">
                        <dyt-select
                          v-model="checkColorVal"
                          multiple
                          :max-tag-count="1"
                          :transfer="false"
                          :allow-create="true"
                          @on-create="createColorHandle"
                          placeholder="请选择颜色或自由输入后新增"
                        >
                          <Option
                            v-for="(item, index) in colorDataList"
                            :value='item.colorId'
                            :disabled="oldColorVal.includes(item.colorId)"
                            :key="`status-${index}`"
                          >{{`${item.color}(${item.colorEn})`}}</Option>
                        </dyt-select>
                        <Icon type="md-checkmark-circle-outline" @click="toopropSecectConfirm('color')" title="确认" />
                        <Icon type="ios-close-circle-outline" @click="isVisibleToopropSecect('color', false)" title="取消" />
                      </div>
                    </div>
                  </FormItem>
                  <template v-if="totalColumns[0]&&totalColumns[0].children.length">
                    <FormItem
                      :label="`${landataItem&&!$common.isEmpty(landataItem.labellist[2])?landataItem.labellist[2].label:''}:`"
                      class="form-border--bot mt5"
                      :label-width="80"
                    >
                      <div class="tag-item-content">
                        <div class="tag-item-text-content">
                          <span
                            class="tag-item-lable mb5 ml5"
                            v-for="(tag, tIndex) in tagMulfun"
                            :key="`tag-${tIndex}`"
                            :style="`${!tag.old && toopropSecect.size ? 'color: #f20;':''}`"
                          >
                            <span
                              class="tag-item-txt"
                              contenteditable="true"
                              @input="inputTagItem(tag, $event, 'size')"
                              @focus="focusInput"
                              @blur="blurInput"
                            >{{tag.size}}</span>
                          </span>
                        </div>
                        <Icon
                          type="ios-create-outline"
                          :style="`visibility:${toopropSecect.size?'hidden':'visible'};`"
                          @click="isVisibleToopropSecect('size', true)"
                        />
                      <div class="tooprop-secect-content" v-if="toopropSecect.size">
                        <Cascader
                          :data="cascaderSecectData"
                          v-model="checkTagVal.first"
                          style="width: calc(50% - 25px);"
                          :disabled="isDisabledCascader"
                          :filterable="true"
                          @on-change="cascaderChange"
                          v-show="false"
                        />
                        <dyt-select
                          v-model="checkTagVal.second"
                          multiple
                          :max-tag-count="1"
                          :transfer="false"
                          :allow-create="true"
                          @on-create="createTagHandle"
                          style="width: calc(100% - 40px);"
                          placeholder="请选择尺码或自由输入后新增"
                        >
                          <Option
                            v-for="(item, index) in allProductSizData"
                            :value='item.sizeId'
                            :key="`sizetype-${index}`"
                            :disabled="oldSize.includes(item.sizeId)"
                          >{{item.size}}</Option>
                        </dyt-select>
                        <Icon type="md-checkmark-circle-outline" @click="toopropSecectConfirm('size')" title="确认" />
                        <Icon type="ios-close-circle-outline" @click="isVisibleToopropSecect('size', false)" title="取消" />
                      </div>
                      </div>
                    </FormItem>
                  </template>
                </div>

                <!-- 多属性 -->
                <div v-for="(item,index) in landataItem.attrLists" :key="index+'attr'">
                  <FormItem :label="item.attr+':'">
                    <Button class="mr10 btn-mb" :class="{'active-btn':(item.attrValue==citem.attributeValueId)}" @click="attrBtnclick(citem,index,cindex)" v-for="(citem,cindex) in item.value" :key="cindex+'attrvalue'">{{citem.name}}</Button>
                  </FormItem>
                </div>
              </div>
              <div class="img-top-txt" v-if="[4].includes(planType)">Product Attributes</div>
              <div class="picture-content ml20" v-if="partImgList[defaultLanguage]">
                <Checkbox
                  v-model="partImgList[defaultLanguage].isChecked"
                  :disabled="!(goodsPicJson[defaultLanguage] && goodsPicJson[defaultLanguage].isChecked)"
                  v-if="[1].includes(planType)"
                  @on-change="picCheckChange($event, 'partImgList')"
                />
                <div class="img-father mr5">
                  <img :src="partImgList[defaultLanguage].pictureUrl" alt="">
                </div>
                <Dropdown style="margin-top: 270px;" trigger="click" @on-click="chosePicture($event, 'partImgList')" transfer v-if="[1].includes(planType)">
                  <Icon type="ios-create-outline" title="更换图片" />
                  <DropdownMenu slot="list">
                    <DropdownItem name="allPartPicList">选择尺寸图片</DropdownItem>
                    <DropdownItem name="goodsAllPic">选择图库图片</DropdownItem>
                    <DropdownItem name="local">选择本地图片</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
              <div class="picture-content ml20" v-if="goodsPicJson[defaultLanguage] && [1].includes(planType)">
                <Checkbox v-model="goodsPicJson[defaultLanguage].isChecked" @on-change="picCheckChange($event, 'goodsPicJson')" />
                <div class="img-father mr5">
                  <img :src="goodsPicJson[defaultLanguage].pictureUrl" alt="">
                </div>
                <Dropdown style="margin-top: 270px;" trigger="click" @on-click="chosePicture($event, 'goodsPicJson')" transfer>
                  <Icon type="ios-create-outline" title="更换图片" />
                  <DropdownMenu slot="list">
                    <DropdownItem name="allPartPicList">选择尺寸图片</DropdownItem>
                    <DropdownItem name="goodsAllPic">选择图库图片</DropdownItem>
                    <DropdownItem name="local">选择本地图片</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
            <div class="table-color-set mt15" v-if="[1].includes(planType)">
              <div class="color-set-row">
                <div>
                  表头底色
                  <ColorPicker
                    v-model="tableConfig.headBackground" @on-change="colorChange($event, 'headBackground')"
                    :transfer="true"
                    :recommend="true"
                    transfer-class-name="table-color-picker"
                  />
                </div>
                <div class="ml15">
                  表头边框
                  <ColorPicker
                    v-model="tableConfig.headBorderColor" @on-change="colorChange($event, 'headBorderColor')"
                    :transfer="true"
                    :recommend="true"
                    transfer-class-name="table-color-picker"
                  />
                </div>
                <div class="ml15">
                  表头字体颜色
                  <ColorPicker
                    v-model="tableConfig.headFontColor" @on-change="colorChange($event, 'headFontColor')"
                    :transfer="true"
                    :recommend="true"
                    transfer-class-name="table-color-picker"
                  />
                </div>
              </div>
              <div class="color-set-row mt10">
                <div>
                  表格底色
                  <ColorPicker
                    v-model="tableConfig.tableBackground" @on-change="colorChange($event, 'tableBackground')"
                    :transfer="true"
                    :recommend="true"
                    transfer-class-name="table-color-picker"
                  />
                </div>
                <div class="ml15">
                  表格边框
                  <ColorPicker
                    v-model="tableConfig.tableBorderColor" @on-change="colorChange($event, 'tableBorderColor')"
                    :transfer="true"
                    :recommend="true"
                    transfer-class-name="table-color-picker"
                  />
                </div>
                <div class="ml15">
                  表格字体颜色
                  <ColorPicker
                    v-model="tableConfig.tableFontColor" @on-change="colorChange($event, 'tableFontColor')"
                    :transfer="true"
                    :recommend="true"
                    transfer-class-name="table-color-picker"
                  />
                </div>
              </div>
            </div>
            <div class="mt10" :class="{'not-select-self-size': !selectSelfSize}">
              <Table :columns="totalColumns" :data="tableData" border id="sizechart-table" class="size-table-view">
                <template slot-scope="{column, index}" slot="nameValue">
                  <dyt-input
                    v-model="tableData[index].size"
                    @on-change="sizeChangeHand(tableData[index])"
                    :ref="`${index}-${column.slot}`"
                  />
                </template>
                <template slot-scope="{index}" slot="anValue">
                  <dyt-input v-model="tableData[index].anValue" />
                </template>
                <template slot-scope="{index}" slot="enValue">
                  <dyt-input v-model="tableData[index].enValue" />
                </template>
                <template slot-scope="{index}" slot="gerValue">
                  <dyt-input v-model="tableData[index].gerValue" />
                </template>
                <template slot-scope="{index}" slot="fraValue">
                  <dyt-input v-model="tableData[index].fraValue" />
                </template>
                <template slot-scope="{index}" slot="spnValue">
                  <dyt-input v-model="tableData[index].spnValue" />
                </template>
                <template slot-scope="{index}" slot="itValue">
                  <dyt-input v-model="tableData[index].itValue" />
                </template>
                <template slot-scope="{index}" slot="porValue">
                  <dyt-input v-model="tableData[index].porValue" />
                </template>
                <template slot-scope="{index}" slot="polValue">
                  <dyt-input v-model="tableData[index].polValue" />
                </template>
                <template slot-scope="{index}" slot="cnValue">
                  <dyt-input v-model="tableData[index].cnValue" />
                </template>
                <template slot-scope="{row,index,column}" slot="cmInputs">
                  <dyt-input v-model="tableData[index][column.attr+'cm']" @on-keyup="cmInputFocus(row, index, column, true)" />
                </template>
                <template slot-scope="{index,column}" slot="inchInputs">
                  <dyt-input v-model="tableData[index][column.attr+'inch']" />
                </template>
              </Table>
            </div>
          </div>
        </Form>
        <Spin fix v-if="createPicLoading">生成尺码图中,请勿中断操作...</Spin>
        <Spin fix v-if="pageLoading">加载数据中...</Spin>
      </div>
      <div slot="footer">
        <div>
          <div class="footers__left">
            <span class="mr10">选择生成的尺码图语言:</span>
            <CheckboxGroup v-model="formItem.language" @on-change="lanChecked">
              <template v-for="(oItem, oIndex) in otherCheck">
                <Checkbox :label="oItem.value" class="mr15" :key="`oIndex-${oIndex}`" v-if="!oItem.hidden">{{oItem.label}}</Checkbox>
              </template>
              <template v-for="(item,index) in language">
                <!-- <Checkbox :label="item.type" class="mr15" :key="index" v-if="!item.hidden" :disabled="item.disabled">{{item.label}}</Checkbox> -->
                <Checkbox :label="item.type" class="mr15" :key="index" v-if="!item.hidden">{{item.label}}</Checkbox>
              </template>
            </CheckboxGroup>
          </div>
          <div class="footers__right">
            <div></div>
            <div>
              <Checkbox v-model="syncInformation" style="margin-right: 100px;">同步生成文本资料尺码图表格</Checkbox>
              <Button @click="modelVisible = false">取消</Button>
              <Button type="primary" :loading="pageLoading || createPicLoading" @click="confirm">确定</Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
    <!-- 选择图片弹窗 -->
    <Modal v-model="modelPicVisible" width="800" title="选择图片" :mask-closable="false" class="size-charts-modal">
      <div class="pic-list-content">
        <template v-for="(pic, pIndex) in chosePicData">
          <Checkbox
            v-model="pic.isModalChecked"
            :key="`pic-${pIndex}`"
            v-if="pic.pictureUrl"
            @on-change="modalCheckedChange($event, pIndex)"
          >
            <div class="pic-item">
              <img :src="pic.pictureUrl">
            </div>
          </Checkbox>
        </template>
      </div>
      <div slot="footer">
        <div class="footers__right">
          <div></div>
          <div>
            <Button @click="closePicModal">取消</Button>
            <Button type="primary" @click="confirmChosePic">确定</Button>
          </div>
          </div>
      </div>
    </Modal>
    <input id="temporaryFile" type="file" accept="image/*" @input="onFileChange" />
  </div>
</template>

<script>
import api from "@/api/api";
import { selfAttrList, selfLabelList, selfTitlist, tableLangInfo } from "./sizeConfig";
export default {
  name: "sizeChart",
  components: {},
  props: {
    isVisible: { //弹框
      type: Boolean,
      default: false
    },
    // 尺码类型
    planType: {
      type: [Number, String],
      default: 1
    },
    productData: { //订单详情
      type: Object,
      default () { return {} }
    },
    commodiAttr: { //商品属性
      type: Object,
      default () { return {} }
    },
    // 颜色
    colorList: {
      type: Array,
      default () { return [] }
    },
    operatList: { // requiredetail.vue 组件传过来的商品分类列表
      type: Array,
      default () {
        return [];
      }
    },
  },
  watch: {
    isVisible: {
      deep: true,
      immediate: true,
      handler (newVal) {
        newVal ? this.open() : '';
      }
    },
    modelVisible: {
      deep: true,
      immediate: true,
      handler (newVal) {
        if (!newVal) {
          this.$emit('update:isVisible', newVal);
          this.cancelKeydown();
          this.removeIframe();
          this.syncInformation = false;
        }
      }
    },
    sizeType: {
      deep: true,
      immediate: true,
      handler (newVal) {
        if (!(newVal || newVal === 0)) return;
        let result = this.sizeTypeList.filter(k => {
          return k.sizeTypeId === this.sizeType;
        })
        this.title = result[0] && result[0].typeName;
      }
    },
    colorInputChange: {
      deep: true,
      handler (newVal) {
        if (this.focusTagSizeInput) return;
        this.colorlistTxt = newVal;
      }
    }
  },
  data () {
    return {
      title: '生成尺码图',
      syncInformation: false,
      pageLoading: false,
      otherCheck: [{ label: '生产尺码图', value: 'selfUseSize' }],
      modelVisible: false,
      oldSizeVal: [],
      createPicLoading: false,
      sizeType: '',//尺码类型id
      sizeTypeList: [],//尺码类型
      sizeAllRes: [],
      // 跳码数据
      subsectionData: {
        enabled: false,
        listData: [],
      },
      // 对应列的跳码数据
      colSubsectionList: {},
      sizGroupDataJson: {},
      measurementJson: {
        method: '测量方法',
        tableTitle: 'Size-Details',
        partName: 'Tag Size'
      },
      toopropSecect: {
        color: false,
        size: false
      },
      // 表单信息
      formItem: {
        fabric: '',
        language: [],
      },
      oldAllColorlist: {
        data: {},
        isInit: true
      },
      // 语言列表
      language: [
        { label: 'Tag Size', name: 'name', value: 'size', type: 'name', hidden: true, otherLabel: 'Tag Size', disabled: true },
        { label: '美语', name: 'anName', value: 'anValue', type: 'an', hidden: true, otherLabel: 'US', disabled: true },
        { label: '英语', name: 'enName', value: 'enValue', type: 'en', fabric: '', otherLabel: 'UK-AU', disabled: false },
        { label: '德语', name: 'gerName', value: 'gerValue', type: 'ger', fabric: '', otherLabel: 'EU-DE', disabled: false },
        { label: '法语', name: 'fraName', value: 'fraValue', type: 'fra', fabric: '', otherLabel: 'FR', disabled: true },
        { label: '西班牙语', name: 'spnName', value: 'spnValue', type: 'spn', fabric: '', otherLabel: 'ESP', disabled: true },
        { label: '意大利语', name: 'itName', value: 'itValue', type: 'it', fabric: '', otherLabel: 'IT', disabled: true },
        { label: '葡萄牙语', name: 'porName', value: 'porValue', type: 'por', fabric: '', otherLabel: 'POR', disabled: true },
        { label: '波兰语', name: 'polName', value: 'polValue', type: 'pol', fabric: '', otherLabel: 'PL', disabled: true },
        { label: '中文', name: 'cnName', value: 'cnValue', type: 'cn', fabric: '', otherLabel: 'CHN', disabled: true },
      ],
      focusTagSizeInput: false,
      defaultLanguage: '',// 默认显示的语言
      sizePartlist: {},// 尺码部位列表
      sizeGroupNo: '',// 尺码组
      tableData: [],// 表格默认数据
      languageList: ["en", "ger", "fra", "spn", "it", "por", "pol", "cn", "an"],//语言区分 以此为标准
      categoryResult: {},//分类信息
      sizeTemList: {},//存放尺码模板（以语言为key区分）
      sizeLanlist: [],//尺码模板列表
      attrLists: [],//多属性列表
      attrallColorlist: {},//属性语言颜色列表
      attrallSizelist: {},//属性语言尺码列表
      sizeTemplateList: {},//全部语言表头columns
      defaultColumns: ['name'],//表格要固定美英德
      selfTitlist: selfTitlist,//自定义文字
      allAttrLists: selfAttrList,//全部语言属性列表
      selfLabelList: selfLabelList,//自定义语言label头
      allList: {},//全部语言数据
      landataItem: {},//某语言下的数据
      iframeId: `iframe-${Math.random().toString(36).substring(2)}`,
      langeList: {
        en: 'colorAmerican',
        ger: 'colorGerman',
        fra: 'colorFrance',
        spn: 'colorSpanish',
        it: 'colorIt',
        por: 'colorPor',
        pol: 'colorPoland',
        cn: 'color',
        an: 'colorAn'
      },
      colorDataList: [],
      checkColorVal: [],
      colorlistTxt: [],
      cascaderSecectData: [],
      isDisabledCascader: false,
      allProductSizData: [],
      sizeStand: {
        default: {
          1: { name: '尺码组1' }, 2: { name: '尺码组2' }
        },
        cashSize: {
          1: { name: '现货款' }, 2: { name: '打版款' }
        }
      },
      checkTagVal: { first: [], second: [] },
      oldTableList: [],
      // 新增尺码
      addSizeData: [],
      partImgList: {}, // 对应语言部位默认图片
      allPartPicList: {}, // 对应语言所有部位图片
      goodsPicJson: {}, // 对应语言商品默认图片
      goodsAllPic: [], // 所有商品图片
      modelPicVisible: false,
      chosePicData: [],
      tableConfig: {},  // 表格颜色设置
    }
  },
  computed: {
    // 选中的语言(排除指定值)
    validLanguage () {
      const notIncludes = this.otherCheck.map(m => m.value);
      const choseVal = this.$common.copy(this.formItem.language || []);
      let newVal = [];
      if (choseVal.includes('en') && !choseVal.includes('an')) {
        choseVal.forEach(item => {
          if (item == 'en') {
            newVal.push('an');
          }
          newVal.push(item);
        });
      } else {
        newVal = choseVal;
      }
      newVal = newVal.filter(item => {
        return !notIncludes.includes(item)
      });
      return newVal;
    },
    // 是否已存在自用尺码图
    isSelfUsePic () {
      const findPic = this.goodsAllPic.find(item => {
        return [2, 3, 4, '2', '3', '4'].includes(item.pictureType);
      });
      return !this.$common.isEmpty(findPic);
    },
    // 是否选中了自用尺码图
    selectSelfSize () {
      if (this.$common.isEmpty(this.formItem.language)) return false;
      return this.formItem.language.includes('selfUseSize');
    },
    // 表格头部
    totalColumns () {
      // 使用表格合并
      let arr = [
        {
          title: this.measurementJson.tableTitle,
          align: 'center',
          children: [],
          renderHeader: (h, params) => {
            return h('Input', {
              style: {
                width: '300px'
              },
              props: {
                type: 'text',
                value: params.column.title
              },
              on: {
                'on-change': (val) => {
                  this.$nextTick(() => {
                    this.$set(this.measurementJson, 'tableTitle', val.target._value);
                  })
                }
              }
            });
          }
        }
      ];
      let listitem = this.allList['default'] ? this.allList['default'].columnlist || [] : [];
      if (!listitem) return [];
      if (!this.$common.isEmpty(this.defaultLanguage)) {
        listitem = this.allList[this.defaultLanguage] ? this.allList[this.defaultLanguage].columnlist || [] : [];
      }
      const list = listitem.filter(f => !this.$common.isEmpty(f));
      let [sIndex, eIndex, columnslist] = [null, null, []];
      const notHasDefault = this.validLanguage.filter(lanType => {
        return !this.defaultColumns.includes(lanType) && this.defaultLanguage != lanType;
      });
      list.forEach((litem, key) => {
        if (litem.isLanguage) {
          if (this.$common.isEmpty(sIndex)) {
            sIndex = key;
          }
          eIndex = key;
        }
      });
      notHasDefault.forEach(lanType => {
        if (!this.$common.isEmpty(this.allList[lanType]) && !this.$common.isEmpty(this.allList[lanType].columnlist)) {
          this.allList[lanType].columnlist.forEach(item => {
            if (item.lanType == lanType) {
              columnslist.push(item);
            }
          })
        }
      });
      const startlist = list.slice(0, sIndex);
      const endlist = list.slice(eIndex, list.length);
      arr[0].children = [...startlist, ...columnslist, ...endlist];
      return arr;
    },
    // 展示的 尺码
    tagMulfun () {
      let list = (this.tableData || []).filter(k => !this.$common.isEmpty(k['sizeId']) && (this.$common.isUndefined(k.old) || k.old));
      let tableSzieId = [];
      const second = this.checkTagVal.second || [];
      list.forEach(item => {
        tableSzieId.push(item.sizeId);
        item.old = !second.includes(item.sizeId);
      });
      const addSzie = this.allProductSizData.filter(item => {
        return !tableSzieId.includes(item.sizeId) && second.includes(item.sizeId);
      }).map(m => {
        return { ...m, old: false };
      });
      return [...list, ...addSzie];
    },
    // 已默认选择的颜色
    oldColorVal () {
      if (this.$common.isEmpty(this.oldAllColorlist) || this.$common.isEmpty(this.oldAllColorlist.data)) return [];
      if (this.$common.isEmpty(this.oldAllColorlist.data[this.defaultLanguage])) return [];
      return this.oldAllColorlist.data[this.defaultLanguage].map(m => m.colorId);
    },
    // 颜色
    colorLangList () {
      let newList = {};
      (this.colorDataList || []).forEach(k => {
        Object.keys(this.langeList).forEach(lan => {
          !newList[lan] && this.$set(newList, lan, []);
          newList[lan].push({ ...k, colorName: k[this.langeList[lan]] });
        })
      });
      return newList;
    },
    // 颜色输入框改变时返回值
    colorInputChange () {
      if (this.$common.isEmpty(this.colorLangList) || this.$common.isEmpty(this.colorLangList[this.defaultLanguage])) return [];
      const oldVal = this.colorLangList[this.defaultLanguage].filter(f => this.oldColorVal.includes(f.colorId)).map(item => {
        return { colorName: item.colorName, old: true, colorId: item.colorId };
      });
      const newVal = this.colorLangList[this.defaultLanguage].filter(f => this.checkColorVal.includes(f.colorId)).map(item => {
        return { colorName: item.colorName, old: false, colorId: item.colorId };
      });
      return [...oldVal, ...newVal];
    },
    // 表格本来就已选中的尺码数据
    oldSize () {
      if (this.$common.isEmpty(this.oldTableList)) return [];
      let list = this.oldTableList.filter(k => {
        return !this.$common.isEmpty(k['sizeId']);
      }).map(k => {
        return k['sizeId'];
      });
      return list;
    },
  },
  created () {},
  // 组件销毁时
  destroyed () {
    this.cancelKeydown();
  },
  methods: {
    // 获取尺码类型
    getTypelist () {
      return new Promise((resolve) => {
        this.$axios.get(api.queryProductSizeTypeList).then(({ code, datas }) => {
          if (code !== 0) return resolve();
          this.sizeTypeList = datas || [];
          resolve();
        }).catch(() => {
          resolve();
        })
      })
    },
    // 获取尺码组跳码分段
    getSubsectionInfo (sizeTypeId, sizeGroupNo) {
      return new Promise((resolve) => {
        this.subsectionData = {
          enabled: false,
          listData: [],
        };
        this.axios.get(api.queryHoppingCode, {
          params: {
            sizeTypeId: sizeTypeId,
            sizeGroupNo: sizeGroupNo,
          }
        }).then((data) => {
          if (!data || data.code != 0) return resolve([]);
          let isEnabled = null;
          let hoppingList = [];
          let ids = [];
          (data.datas || []).forEach((item) => {
            if (!isEnabled) {
              isEnabled = item.status;
            }
            if (!this.$common.isEmpty(item.sizeIds)) {
              ids = item.sizeIds.split(',').map(m => Number(m));
              hoppingList.push({
                sizeIds: ids,
                startId: ids[0],
                endId: ids.slice(-1)[0],
                hoppingCode: item.hoppingCode,
                sortNo: item.sortNo
              });
            }
          });
          hoppingList.sort((min, big) => {
            return min.sortNo - big.sortNo
          });
          this.subsectionData.enabled = this.$common.isEmpty(isEnabled) ? false : isEnabled == 1 ? true : false;
          this.subsectionData.listData = hoppingList;
          resolve(data.datas || []);
        }).catch((err) => {
          console.error(err);
          resolve([]);
        })
      })
    },
    // 重置表单
    resetForm () {
      this.formItem.language = ['en', 'ger', 'selfUseSize'];//默认勾选英德
      if (this.formItem.language.length > 1) {
        this.defaultLanguage = this.formItem.language[this.formItem.language.length - 2];
      } else {
        this.defaultLanguage = this.formItem.language[0];
      }
      this.tableData = [];
      this.oldTableList = [];
      this.isDisabledCascader = false;
      this.toopropSecect = { color: false, size: false };
      this.checkColorVal = [];
      this.addSizeData = [];
      this.cascaderSecectData = [];
      this.allProductSizData = [];
      this.checkTagVal= { first: [], second: [] };
      this.allPartPicList = {};
      this.goodsPicJson = {};
      this.goodsAllPic = [];
      this.measurementJson = { method: '测量方法', tableTitle: 'Size-Details' };
      const langVal = Object.values(this.langeList);
      this.colorDataList = this.$common.copy(this.colorList).map(item => {
        langVal.forEach(key => {
          if (!Object.keys(item).includes(key)) {
            item[key] = '';
          }
        })
        return item;
      });
      // 属性默认选中第一个
      let list = this.$common.copy(selfAttrList);
      Object.keys(list).forEach(k => {
        list[k].forEach(j => {
          if (!j.value.length) return;
          j.attrValue = j.value[0].attributeValueId;
        })
      })
      this.allAttrLists = list;
      // 清空材质输入框
      this.language.forEach(k => {
        'fabric' in k ? k.fabric = '' : '';
      });
      this.tableConfig = {
        headBackground: '#f2f2f2',
        headFontColor: '#262626',
        headBorderColor: '#BBBBBB',
        tableBackground: '#fff',
        tableFontColor: '#262626',
        tableBorderColor: '#BBBBBB',
      }
      Object.keys(this.tableConfig).forEach(key => {
        this.colorChange(this.tableConfig[key], key);
      });
      Object.keys(this.partImgList).forEach(key => {
        this.partImgList[key].isChecked = true;
      });
    },
    // 创建截图的 iframe
    createIframe () {
      let iframe = document.createElement('iframe');
      iframe.id = this.iframeId;
      iframe.src = `${window.location.pathname}#/sizePicture`;
      // iframe.style.display = 'none';
      iframe.style.position = 'absolute';
      iframe.style.zIndex = '-10';
      iframe.style.width = '100vw';
      iframe.style.height = '100vh';
      iframe.style.top = '100vh';
      document.body.appendChild(iframe);
      window.frames[this.iframeId].contentWindow.iframeId = this.iframeId;
      // 方法需要放到此次，不可以放到参数传递
      window.frames[this.iframeId].contentWindow.events = {
        finishModel: this.finishModel, // 生成尺码图成功时回调
      }
    },
    // 移除截图的 iframe
    removeIframe () {
      const oldIframe = document.querySelector(`#${this.iframeId}`);
      if (this.$common.isEmpty(oldIframe)) return;
      oldIframe.remove();
    },
    // 获取云仓图库
    getPicStock () {
      return new Promise((resolve) => {
        const { productId } = this.productData;
        this.goodsAllPic = [];
        this.$axios.get(api.getCloudPicture, { params: { productId } }).then(({ code, datas }) => {
          if (code !== 0) return;
          let picUrl = '';
          this.goodsAllPic = (datas || []).map(pic => {
            if (this.$common.isEmpty(pic.pictureUrl) || pic.pictureUrl.includes('filenode/s/')) {
              picUrl = pic.pictureUrl;
            } else {
              picUrl = `/pds-service/filenode/s${pic.pictureUrl}`
            }
            return {
              ...pic,
              isModalChecked: false,
              pictureUrl: picUrl
            }
          });
          this.languageList.forEach(l => {
            this.$set(this.goodsPicJson, l, {...(this.goodsAllPic[0] || {}), isChecked: false });
          });
          resolve(datas || []);
        }).catch(() => {
          resolve([]);
        })
      })
    },
    // 窗口打开事件
    open () {
      this.modelVisible = this.isVisible;
      let { goodTypeId, productId } = this.productData;
      this.createPicLoading = false;
      this.pageLoading = true;
      this.createIframe();
      this.resetForm();
      // 获取新品详情信息
      this.$common.promiseAll([
        this.getTypelist,
        () => {
          return this.categoryData(goodTypeId); // 获取挂载分类的分类信息
        },
        () => {
          return this.getProductDetail(productId);
        }
      ]).finally(() => {
        if (this.$common.isEmpty(this.sizeType)) {
          this.sizeType = this.categoryResult.sizeType;
        }
        this.$common.promiseAll([
          () => {
            return this.getSubsectionInfo(this.sizeType, this.sizeGroupNo); // 获取商品绑定尺码组对应的跳码信息
          },
          () => {
            return this.getProductSizeTypeRel(this.sizeType);
          },
          this.getPicStock
        ]).then(async (arrRes) => {
          try{
            // 只调用一次
            if (JSON.stringify(this.sizePartlist) === '{}') {
              let res = await this.getSizePartList();//获取尺码部位
              await this.getSizeDetail(res);//根据尺码类型获取详情
            }
            await this.laPaProductInfo();
            await this.allLanguageInfo();
            await this.preTemplate();
            this.keyChange();
            this.$nextTick(() => {
              if ([4].includes(this.planType)) {
                const thList = [...(document.querySelectorAll('.measurement-tag-size') || [])];
                thList.forEach(rowTh => {
                  rowTh.setAttribute('rowspan', 2)
                })
              }
            });
          }catch(err) {
            console.error(err);
          }
          this.pageLoading = false;
        }).catch((err) => {
          console.error(err);
          this.pageLoading = false;
        })
      })
    },
    // 展示(隐藏)下拉
    isVisibleToopropSecect (key, visible) {
      this.toopropSecect[key] = visible;
      !visible && this[`${key}SecectHand`](true);
    },
    // 确认选项
    toopropSecectConfirm (key) {
      this[`${key}SecectHand`]().then(() => {
        this.isVisibleToopropSecect(key, false);
      })
    },
    // 颜色选择处理
    colorSecectHand (type) {
      return new Promise((resolve) => {
        if (type) {
          this.checkColorVal = (this.landataItem.colorlist || []).filter(f => !this.oldColorVal.includes(f.colorId)).map(m => m.colorId);
          return resolve();
        }
        let remove = [];
        let colorIds = [];
        (this.landataItem.colorlist || []).forEach(item => {
          if (!this.checkColorVal.includes(item.colorId)) {
            remove.push(item.colorId);
          }
          colorIds.push(this.$common.isEmpty(Number(item.colorId)) ? item.colorId : Number(item.colorId));
        });
        const checkItem = this.colorDataList.filter(f => this.checkColorVal.includes(f.colorId));
        Object.keys(this.langeList).forEach(lan => {
          this.attrallColorlist[lan] = (this.attrallColorlist[lan] || []).filter(item => {
            return !remove.includes(item.colorId);
          })
        });
        checkItem.forEach(k => {
          if (colorIds.includes(k.colorId)) return;
          Object.keys(this.langeList).forEach(lan => {
            if (!this.attrallColorlist[lan]) this.attrallColorlist[lan] = [];
            if (this.attrallColorlist[lan].map(m => m.colorId).includes(k.colorId)) return;
            this.attrallColorlist[lan].push({ colorName: k[this.langeList[lan]] || '', colorId: k.colorId, skcCode: k.skcCode });
          })
        });
        this.landataItem.colorlist = this.attrallColorlist[this.defaultLanguage];
        this.$nextTick(() => {
          setTimeout(() => {
            resolve()
          }, 200)
        });
      })
    },
    // 新增颜色处理
    createColorHandle (val) {
      const allId = this.colorDataList.map(m => {
        return Number(m.colorId)
      }).filter(item => !this.$common.isEmpty(item));
      if (allId.includes(val)) return;
      const langeData = this.$common.arrRemoveRepeat([
        ...Object.keys(this.colorList[0] || {}),
        ...Object.values(this.langeList).filter(lag => !this.$common.isEmpty(lag)),
        ...['colorId', 'colorName']
      ]);
      let obj = {};
      langeData.forEach(key => {
        obj[key] = ['colorId'].includes(key) ? Math.max(...allId) + 1 : val;
      });
      this.checkColorVal.forEach(item => {
        if (Number(item) == obj.colorId) {
          item = obj.colorId
        }
      });
      if (!this.checkColorVal.includes(obj.colorId)) {
        this.checkColorVal.push(obj.colorId);
      }
      this.colorDataList.splice(0, 0, obj);
    },
    // 尺码选择
    sizeSecectHand (type) {
      return new Promise((resolve) => {
        let res = null;
        if (type) {
          this.checkTagVal.second = this.$common.copy(this.oldSizeVal);
        } else {
          this.oldSizeVal = this.$common.copy(this.checkTagVal.second);
        }
        (async () => {
          this.categoryResult = await this.categoryData(this.productData.goodTypeId); // 获取挂载分类的分类信息
          if (this.$common.isEmpty(this.sizePartlist)) {
            res = await this.getSizePartList();// 获取尺码部位
            await this.getSizeDetail(res);// 根据尺码类型获取详情
          }
          await this.laPaProductInfo();
          await this.allLanguageInfo();
          await this.preTemplate(true, true);
          resolve();
        })();
      })
    },
    // 颜色(尺码)输入改变
    inputTagItem (tag, event, type) {
      if (this.$common.isEmpty(tag) || !event || !event.target) return;
      const target = event.target;
      const val = (target.innerText).trim();
      if (type == 'size') {
        let isChangeId = [];
        this.tableData.forEach((row, index) => {
          if (row.sizeId == tag.sizeId) {
            this.tableData[index].size = val;
            isChangeId.push(row.sizeId);
            this.sizeChangeHand(this.tableData[index]);
          }
        });
        this.allProductSizData.forEach((item, index) => {
          if (!isChangeId.includes(item.sizeId) &&  item.sizeId == tag.sizeId && this.checkTagVal.second.includes(item.sizeId)) {
            this.allProductSizData[index].size = val;
            this.sizeChangeHand(this.allProductSizData[index]);
          }
        });
        this.$nextTick(() => {
          target.focus();
          let range = document.createRange();
          range.selectNodeContents(target);
          range.collapse(false);
          let sel = window.getSelection();
          //判断光标位置，如不需要可删除
          if(sel.anchorOffset!=0) return;
          sel.removeAllRanges();
          sel.addRange(range);
        })
        return;
      }
      if (type == 'color') {
        let langColorKey = this.langeList[this.defaultLanguage];
        this.colorDataList = this.colorDataList.map(item => {
          return item.colorId == tag.colorId ? { ...item, [langColorKey]: val } : item;
        });
        if (!this.$common.isEmpty(this.landataItem)) {
          (this.landataItem.colorlist || []).forEach((item, index) => {
            if (item.colorId == tag.colorId) {
              this.$set(this.landataItem.colorlist[index], langColorKey, val);
              // 生成图片那边使用 colorName;
              this.$set(this.landataItem.colorlist[index], 'colorName', val);
            }
          });
        }
      }
    },
    // 获取尺码类型关联
    getProductSizeTypeRel (sizeTypeId) {
      this.allProductSizData = [];
      return new Promise((resolve) => {
        this.getAllSizeData().then(sizeRes => {
          this.sizeAllRes = sizeRes;
          this.$axios.get(api.queryProductSizeTypeRel,{
            params: {
              sizeTypeId: sizeTypeId || ''
            }
          }).then(res => {
            if (!res || res.code !== 0) return resolve([]);
            let sizeTypeJson = {};
            (res.datas || []).forEach(item => {
            this.$common.isEmpty(sizeTypeJson[item.sizeTypeId]) ? (sizeTypeJson[item.sizeTypeId] = [item]) : sizeTypeJson[item.sizeTypeId].push(item);
            });
            this.cascaderSecectData = this.sizeTypeList.filter(f => !this.$common.isEmpty(sizeTypeJson[f.sizeTypeId])).map(m => {
              return {
                ...m,
                value: m.sizeTypeId,
                label: m.typeName,
                children: this.$common.isEmpty(sizeTypeJson[m.sizeTypeId]) ? [] : sizeTypeJson[m.sizeTypeId].map(cm => {
                  return {
                    ...cm,
                    value: `${m.sizeTypeId}_${cm.sizeGroupNo}`,
                    label: (() => {
                      if ([0, 1].includes(Number(m.sizeTypeId)) && this.sizeStand.cashSize[cm.sizeGroupNo] && this.sizeStand.cashSize[cm.sizeGroupNo].name) {
                        return this.sizeStand.cashSize[cm.sizeGroupNo].name;
                      }
                      if (this.sizeStand.default[cm.sizeGroupNo] && this.sizeStand.default[cm.sizeGroupNo].name) {
                        return this.sizeStand.default[cm.sizeGroupNo].name;
                      }
                      return '尺码组';
                    })()
                  }
                })
              }
            });
            const getSizeType = this.$common.isEmpty(this.categoryResult.sizeType) ? null : Number(this.categoryResult.sizeType);
            let defaultType = [];
            if (!this.$common.isEmpty(getSizeType)) {
              defaultType = this.cascaderSecectData.filter(f => f.sizeTypeId === getSizeType);
            }
            if (!this.$common.isEmpty(this.sizeGroupNo) && !this.$common.isEmpty(defaultType)) {
              this.isDisabledCascader = true;
              this.$set(this.checkTagVal, 'first', [defaultType[0].sizeTypeId, `${defaultType[0].sizeTypeId}_${this.sizeGroupNo}`]);
            }
            let goodsSize = [];
            let binSize = [];
            let gorudId = [];
            if (!this.$common.isEmpty(this.checkTagVal.first) && !this.$common.isEmpty(this.checkTagVal.first[0])) {
              this.cascaderSecectData.forEach(item => {
                if (item.value == this.checkTagVal.first[0] && !this.$common.isEmpty(item.children) && !this.$common.isEmpty(this.checkTagVal.first[1])) {
                  item.children.forEach(cItem => {
                    if (cItem.value == this.checkTagVal.first[1]) {
                      binSize = cItem.sizeList || [];
                      binSize.sort((min, big) => {
                        return min.sortNo - big.sortNo
                      });
                    } else {
                      goodsSize = cItem.sizeList || [];
                      goodsSize.sort((min, big) => {
                        return min.sortNo - big.sortNo
                      });
                    }
                  })
                }
              })
            }
            const binId = binSize.map(m => m.sizeId);
            goodsSize.forEach(gItem => {
              if (!binId.includes(gItem.sizeId)) {
                gorudId.push(gItem.sizeId);
                binSize.push(gItem);
              }
            });
            (sizeRes || []).forEach((sItem) => {
              if (!binId.includes(sItem.sizeId) && !gorudId.includes(sItem.sizeId)) {
                binSize.push(sItem);
              }
            });
            binSize.forEach(sItem => {
              this.$set(this.sizGroupDataJson, sItem.sizeId, sItem);
            });
            this.allProductSizData = binSize;
            return resolve(this.cascaderSecectData);
          }).catch(() => {
            resolve([]);
          })
        });
      })
    },
    // 获取所有尺码数据
    getAllSizeData () {
      return new Promise((resolve) => {
        this.axios.get(api.queryProductSizeList).then((res) => {
          if (!res || !res.datas || res.code != 0) return resolve([]);
          resolve(res.datas);
        }).catch((err) => {
          console.error(err);
          resolve([]);
        })
      });
    },
    // 尺码组改变时
    cascaderChange (cValue, selectedData) {
      const value = [cValue[0], (cValue[1] ? cValue[1].split('_')[1] : null)];
      this.checkTagVal.second = [];
      this.sizeType = this.$common.isEmpty(value[0]) ? null : value[0];
      this.sizeGroupNo = this.$common.isEmpty(value[1]) ? null : value[1];
    },
    // 新增尺码
    createTagHandle (val) {
      const addTag = this.addSizeData.map(m => m.name);
      if (addTag.includes(val)) return;
      const obj = {
        merchantId: null,
        size: val,
        sizeCode: val,
        sizeId: Math.max(...([...this.allProductSizData, ...this.sizeAllRes]).map(m => m.sizeId)) + 1,
        sortNo: 1
      }
      if (!this.$common.isEmpty(this.checkTagVal.first)) {
        // 插入数据
        this.cascaderSecectData.forEach(item => {
          if (item.value == this.checkTagVal.first[0]) {
            item.children.forEach(sItem => {
              if (sItem.value == this.checkTagVal.first[1]) {
                sItem.sizeList.push(obj);
              }
            })
          }
        });
      } else {
        this.allProductSizData.push(obj);
      }
      this.addSizeData.push({
        name: obj.size,
        value: obj.size,
        sizeId: obj.sizeId
      });
      this.$nextTick(() => {
        setTimeout(() => {
          const newVal = this.checkTagVal.second.filter(f => f != val);
          newVal.push(obj.sizeId);
          this.checkTagVal.second = newVal;
        }, 300)
      })
    },
    // 聚焦时
    focusInput () {
      this.focusTagSizeInput = true;
    },
    // 失去焦点
    blurInput () {
      this.focusTagSizeInput = false;
    },
    // 尺码改变时
    sizeChangeHand (row) {
      this.$nextTick(() => {
        // 手动修改显示值时
        if (!this.$common.isEmpty(this.checkTagVal.first)) {
          this.cascaderSecectData.forEach(item => {
            (item.children || []).forEach(sItem => {
              (sItem.sizeList || []).forEach(tItem => {
                if (tItem.sizeId == row.sizeId) {
                  tItem.size = row.size;
                }
              })
            })
          });
        } else {
          this.allProductSizData.forEach(item => {
            if (item.sizeId == row.sizeId) {
              item.size = row.size;
            }
          });
        }
        // 改变新增的显示值
        this.addSizeData.forEach(item => {
          if (item.sizeId == row.sizeId) {
            item.name = row.size;
            item.size = row.size;
          }
        });
      })
    },
    // 处理商品分类
    categoryData (productCategoryId) {
      return new Promise((resolve, reject) => {
        let productList = this.getProductCategoryTree(this.operatList, null);
        let result = null;
        let a = (list, id) => {
          list.forEach(k => {
            if (id === k.productCategoryId) {
              if (k.sizeType || k.sizeType === 0) {
                result = k;
              } else {
                if (k.parentId) {
                  a(productList, k.parentId);
                }
              }
            } else {
              if (k.children && k.children.length) {
                a(k.children, id);
              }
            }
          });
        };
        a(productList, productCategoryId);
        this.categoryResult = (result || {});
        resolve(result || {});
      })
    },
    // 组装商品分类树
    getProductCategoryTree (productCategoryList, parentId) {
      var tree = [];
      var children;
      productCategoryList.forEach((n) => {
        if (n.parentId === parentId) {
          n.label = n.cnName;
          n.value = n.productCategoryId;
          children = this.getProductCategoryTree(productCategoryList, n.productCategoryId);
          if (children.length > 0) {
            n.children = children;
          }
          tree.push(n);
        }
      });
      return tree;
    },
    // 获取新品详情
    getProductDetail (productId) {
      return new Promise((resolve) => {
        if (this.sizeType) return resolve();
        this.$axios.get(api.queryLaPaProductInfo, { params: { productId: productId } }).then(({ code, datas }) => {
          if (code === 0 && datas) {
            let laPaProductSizeRelList = datas.laPaProductSizeRelList || [];
            // 尺码组
            if (!this.$common.isEmpty(laPaProductSizeRelList[0])) {
              this.sizeGroupNo = this.$common.isEmpty(laPaProductSizeRelList[0].sizeGroupNo) ? 1 : laPaProductSizeRelList[0].sizeGroupNo;
            } else {
              this.sizeGroupNo = 1;
            }
            // 尺码类型id
            let { sizeType } = datas.laPaProductInfo || {};
            if (sizeType || sizeType === 0) {
              this.sizeType = sizeType;
              return resolve();
            }
          } else {
            this.$Spin.hide();
          }
          resolve();
        }).catch(() => {
          this.$Spin.hide();
          resolve();
        })
      })
    },
    // 获取尺码部位列表
    getSizePartList () {
      return new Promise((resolve, reject) => {
        this.$axios.get(api.queryAllProductSizePartList).then(({ code, datas }) => {
          if (code !== 0) {
            this.$Spin.hide();
            resolve({});
            return;
          }
          let list = datas || [];
          let obj = {};
          list.forEach(k => { obj[k.partId] = k; });
          resolve(obj);
        }).catch(err => {
          this.$Spin.hide();
          resolve({});
        })
      })
    },
    // 根据尺码类型获取详情
    getSizeDetail (list) {
      let { classificationId } = this.categoryResult;
      if (!classificationId) return;
      return this.$axios.get(api.queryProductSizeClassificationInfo,
        { params: { classificationId: classificationId } }
      ).then(({ code, datas }) => {
        if (code !== 0 || !datas) {
          this.$Spin.hide();
          return;
        }
        let { laPaProductPictureLanguageList, laPaProductSizePartInfoVOList } = datas;
        // 区分语言的图片
        let lan = { EN: 'en', GER: 'ger', FRA: 'fra', SPN: 'spn', IT: 'it', POR: 'por', POL: 'pol', CN: 'cn' };
        Object.keys(lan).forEach(key => {
          if (this.$common.isUndefined(this.partImgList[lan[key]])) {
            this.$set(this.partImgList, lan[key], { isChecked: true, pictureUrl: '' });
          }
          if (this.$common.isUndefined(this.allPartPicList[lan[key]])) {
            this.$set(this.allPartPicList, lan[key], [{pictureUrl: ''}]);
          }
        });
        laPaProductPictureLanguageList.forEach(k => {
          if (this.$common.isUndefined(this.partImgList[lan[k.language]])) {
            this.$set(this.partImgList, lan[k.language], { isChecked: true, pictureUrl: '' });
          }
          if (this.$common.isUndefined(this.allPartPicList[lan[k.language]])) {
            this.$set(this.allPartPicList, lan[k.language], [{pictureUrl: ''}]);
          }
          if (this.$common.isEmpty(this.partImgList[lan[k.language]]) || this.$common.isEmpty(this.partImgList[lan[k.language]].pictureId)) {
            this.partImgList[lan[k.language]] = {...k, isChecked: true };
            this.allPartPicList[lan[k.language]] = [k];
          } else {
            this.allPartPicList[lan[k.language]].push(k);
          }
        });
        // 根据挂钩的部位id找到对应的区分语言的部位
        let obj = {};
        (laPaProductSizePartInfoVOList || []).forEach(k => {
          if (!this.$common.isEmpty(k.partId)) {
            this.$set(this.colSubsectionList, k.partId, this.$common.copy(this.subsectionData.listData));
          }
          let temp = list[k.partId];
          if (!temp) return;
          const tempKeys = Object.keys(temp);
          let NewPushItem = {};
          tempKeys.forEach(key => {
            if (!key.includes('Name')) {
              NewPushItem[key] = temp[key];
            }
          });
          tempKeys.forEach(key => {
            let oname = key.replace('Name', '');
            if (this.languageList.includes(oname)) {
              if (!obj[oname]) obj[oname] = [];
              obj[oname].push({
                ...NewPushItem,
                [oname + 'Name']: temp[key]
              })
            }
          });
        });
        this.sizePartlist = this.$common.copy(obj);
      }).catch(() => {
        this.$Spin.hide();
      })
    },
    // 获取尺码模板
    getSizeTemplate () {
      let temp = {};
      temp.sizeTypeId = this.sizeType;
      temp.sizeGroupNo = this.sizeGroupNo;
      temp.templateType = 0; //模板类型,0:常规款尺码模版,1:下装尺码模版
      return this.$axios.post(api.queryProductSizeTemplateToSizePicture, temp).then(({ code, datas }) => {
        if (code !== 0) {
          this.$Spin.hide();
          return;
        }
        let temp = {};
        let list = (datas || []);
        let addList = [];
        const fChildItem = list[0];
        let optionsObj = {};
        // 额外插入的尺码, 需要添加到模板中
        if (!this.$common.isEmpty(fChildItem)) {
          let obj = {};
          this.addSizeData.forEach(item => {
            if (this.checkTagVal.second.includes(item.sizeId)) {
              obj = this.$common.copy(fChildItem);
              Object.keys(fChildItem).forEach(key => {
                if (!['sizeId', 'templateType', 'templateId', 'sizeTypeId', 'name'].includes(key) && !key.includes('Name')) {
                  obj[key] = item.name || null;
                }
              });
              obj.size = item.size;
              obj.sizeId = item.sizeId;
              addList.push(obj);
            }
          })
        }
        const checkedId = [...addList, ...list].map(m => m.sizeId);
        let otherObj = {};
        const otherGroup = (this.allProductSizData.filter(f => !checkedId.includes(f.sizeId))).map(item => {
          otherObj = this.$common.copy(fChildItem);
          Object.keys(fChildItem).forEach(key => {
            if (!['sizeId', 'templateType', 'templateId', 'sizeTypeId', 'name'].includes(key) && !key.includes('Name')) {
              otherObj[key] = item.name || null;
            }
          });
          otherObj.size = item.size;
          otherObj.sizeId = item.sizeId;
          return otherObj;
        });
        list = [...addList.reverse(), ...otherGroup.reverse(), ...list];
        this.allProductSizData.forEach(item => {
          optionsObj[item.sizeId] = item;
        });
        list.forEach(k => {
          if (!this.$common.isEmpty(optionsObj[k.sizeId]) && optionsObj[k.sizeId].size != k.size) {
            k.size = optionsObj[k.sizeId].size;
          }
          Object.keys(k).forEach(ck => {
            let oname = ck.replace('Name', '');
            if (this.languageList.includes(oname)) {
              if (!temp[oname]) temp[oname] = [];
              temp[oname].push({
                [oname + 'Name']: k[oname + 'Name'],
                [oname + 'Value']: k[oname + 'Value'],
                sizeId: k.sizeId,
              })
            }
            // 多了一个size列
            if (ck === 'name') {
              if (!temp[ck]) temp[ck] = [];
              temp[ck].push({
                [ck]: k[ck],
                size: k.size,
                sizeId: k.sizeId,
              })
            }
          })
        });
        this.sizeLanlist = list;
        this.sizeTemList = temp;
      }).catch(() => {
        this.$Spin.hide();
      })
    },
    // 处理商品属性
    async laPaProductInfo () {
      await this.getSizeTemplate();
      let data = this.commodiAttr;
      let [colorlist, sizelist] = [{}, {}];
      let fun = {
        // 属性信息(旧)
        attrFun: () => {
          let temp = {};
          let list = data.attributeClassifyVOList || [];// 多属性
          let lan = { en: 'en', de: 'ger', fr: 'fra', es: 'spn', it: 'it', pt: 'por', pl: 'pol', cn: 'cn' };
          let arr = Object.keys(lan) || [];
          list.forEach(k => {
            let attributeClassifyId = k.attributeClassifyId;
            let attributeValueList = k.attributeValueList || [];
            Object.keys(k).forEach(ck => {
              let oname = ck.replace('Name', '');
              if (arr.includes(oname)) {
                let obj = {};
                obj.attributeClassifyId = attributeClassifyId;
                obj.attr = k[ck];
                obj.value = [];

                obj.attrValue = data.attrlist; //挂钩选择的属性
                attributeValueList.forEach(vk => {
                  let attributeValueId = vk.attributeValueId;
                  Object.keys(vk).forEach(cvk => {
                    if (oname === cvk.replace('Value', '')) {
                      obj.value.push({ name: vk[cvk], attributeValueId })
                    }
                  })
                })
                if (!temp[lan[oname]]) {
                  temp[lan[oname]] = [];
                }
                obj.value.length ? temp[lan[oname]].push(obj) : '';
              }
            })
          })
          this.allAttrLists = temp;
          this.attrLists = temp[this.defaultLanguage] || [];
        },
        // 尺码信息
        partFun: () => {
          return new Promise((resolve, reject) => {
            let list = data.laPaProductVariQuotationList || [];
            list.forEach(k => {
              if (k.colorId) {//颜色
                colorlist[k.colorId] = {
                  color: k.color,
                  colorId: k.colorId,
                }
              }
              if (k.sizeId) {//尺码
                sizelist[k.sizeId] = {
                  sizeOrModelName: k.sizeOrModelName,
                  sizeId: k.sizeId,
                }
              }
            })
            // 额外手动添加的尺码
            this.addSizeData.forEach(item => {
              sizelist[item.sizeId] = {
                size: item.name,
                sizeId: item.sizeId
              }
            })
            resolve();
          })
        },
        // 获取颜色的多语言列表
        getLanColorlist: () => {
          let [temp] = [{}];
          const colorIds = Object.keys(colorlist).map(k => { return Number(k) });
          Object.keys(this.colorLangList).forEach(lan => {
            temp[lan] = this.colorLangList[lan].filter(f => colorIds.includes(f.colorId));
          });
          this.attrallColorlist = temp;
          if (this.oldAllColorlist.isInit) {
            this.$set(this.oldAllColorlist, 'isInit', false);
            this.$set(this.oldAllColorlist, 'data', this.$common.copy(temp));
          }
        },
        // 获取对应尺码的多语言列表
        getLanPartlist: () => {
          return new Promise(resolve => {
            let list = this.sizeTemList;
            let [temp, sizeArr] = [{}, []];
            Object.keys(sizelist).forEach(k => {
              sizeArr.push(Number(sizelist[k].sizeId));
            });
            Object.keys(list).forEach(k => {
              list[k].forEach(item => {
                if (!sizeArr.includes(item.sizeId)) return;
                if (!temp[k]) temp[k] = [];
                temp[k].push(item);
              })
            })
            this.attrallSizelist = temp;
            resolve();
          })
        }
      }
      await fun.partFun();
      // await fun.getLanColorlist();
      fun.getLanColorlist();
      await fun.getLanPartlist();
    },
    // 确定生成图片
    confirm () {
      if (this.pageLoading || this.createPicLoading) return;
      if (this.$common.isEmpty(this.formItem.language)) {
        this.$Message.error('请勾选要生成尺码图的语言!');
        return;
      }
      let lanFlag = false;
      this.language.forEach(k => {
        if (!k.hidden && this.validLanguage.includes(k.type) && !k.fabric) lanFlag = true;
      })
      if (!this.$common.isEmpty(this.validLanguage) && lanFlag && ![4].includes(this.planType)) {
        this.$Message.error(`请填写${this.landataItem.labellist.length ? this.landataItem.labellist[0].label + '下对应的' : ''}语言！`);
        return;
      }
      if (this.isSelfUsePic && this.selectSelfSize) {
        this.$Modal.confirm({
          title: '操作提醒',
          content: `<div style="font-size: 16px;">该次生成的“自用尺码图”会覆盖之前生成的“自用尺码图”，是否继续？</div>`,
          onOk: () => {
            this.startCreatePic();
          },
          onCancel: () => {}
        });
        return;
      }
      this.startCreatePic();
    },
    startCreatePic () {
      let colList = this.$common.copy(this.allList);
      let anLang = [];
      if (!this.$common.isEmpty(colList['an'])) {
        anLang = colList['an'].columnlist || [];
      }
      anLang = anLang.find(item => item.lanType == 'an') || {};
      Object.keys(colList).forEach(key => {
        if (!this.$common.isEmpty(colList[key])) {
          if (key == 'en' && !this.$common.isEmpty(anLang)) {
            colList[key].columnlist.forEach((item, index) => {
              if (item.lanType == 'an') {
                colList[key].columnlist[index] = anLang;
              }
            });
          }
          Object.keys(colList[key]).forEach(cKey => {
            if (cKey == 'columnlist' && !this.$common.isEmpty(colList[key][cKey])) {
              this.removeColRender(colList[key][cKey]);
            }
          })
        }
      });
      this.createPicLoading = true;
      this.$bus.emit(this.iframeId, {
        detailInfo: {
          allList: colList,
          tableData: this.tableData,
          language: this.language,
          formItem: this.formItem,
          measurementJson: this.measurementJson,
          productData: this.productData
        },
        planType: this.planType,
        otherCheck: this.otherCheck,
        checkLanguage: this.$common.arrRemoveRepeat([...this.validLanguage, ...this.formItem.language]),
        tableConfig: this.tableConfig,
        partImgList: this.partImgList,
        goodsPicJson: this.goodsPicJson,
      });
      this.syncInformation && this.handSynccontent(colList);
    },
    // 处理对应语言，并且填充到复杂描述里面
    handSynccontent (colList) {
      let heandCol = this.$common.copy(colList);
      let addCol = {};
      Object.keys(heandCol).forEach(key => {
        if (key != 'selfUseSize' && this.formItem.language.includes(key)) {
          if (!this.$common.isEmpty(heandCol[key])) {
            if (!this.$common.isEmpty(heandCol[key].columnlist)) {
              heandCol[key].allColToal = 0;
              heandCol[key].html = '';
              heandCol[key].columnlist.forEach((col, index) => {
                if (!this.$common.isEmpty(col.children)) {
                  if (!this.$common.isEmpty(col.lanType)) {
                    col.colspan = 1;
                    col.rowspan = 2;
                    heandCol[key].allColToal += 1;
                    if (col.isLanguage) {
                      col.rowKey = col.children[0].slot;
                    } else if (col.children[0].slot == 'nameValue') {
                      col.rowKey = 'size';
                    }
                    delete col.children;
                  } else {
                    col.colspan = 2;
                    col.rowspan = 1;
                    heandCol[key].allColToal += 2;
                    col.children.forEach((child) => {
                      child.colspan = 1;
                      child.rowspan = 1;
                    });
                  }
                }
              });
            }
            addCol[key] = heandCol[key];
          }
        }
      });
      let thHtml = '';
      let tdHtml = '';
      let tableInfo = tableLangInfo.default;
      let tableId = '';
      Object.keys(addCol).forEach(key => {
        tableId = `size-chart-${key}`;
        if (!this.$common.isEmpty(tableLangInfo[key])) {
          tableInfo = tableLangInfo[key];
        }
        addCol[key].html = `<table border="1" id="${tableId}" style="text-align:center"><tbody>`;
        addCol[key].html += `<tr style="background:#ffc035;">
          <td colspan="${addCol[key].allColToal}" rowspan="1" style="border:1px solid black;">
            <p>${tableInfo.headTitle || tableLangInfo.default.headTitle}</p>
          </td>
        </tr>`;
        // 表头配置
        addCol[key].html += `<tr style="background:#ffc035;">`;
        thHtml = '';
        addCol[key].columnlist.forEach((item, index) => {
          addCol[key].html += `<td colspan="${item.colspan}" rowspan="${item.rowspan}" style="border:1px solid black;">
            <p>${this.$common.isEmpty(item.title) ? '' : item.title}</p>
          </td>`;
          if (!this.$common.isEmpty(item.children)) {
            item.children.forEach(td => {
              thHtml += `<td colspan="${td.colspan}" rowspan="${td.rowspan}" style="border:1px solid black;">
                <p>${this.$common.isEmpty(td.title) ? '' : td.title}</p>
              </td>`;
            });
            if (index + 1 == addCol[key].columnlist.length) {
              addCol[key].html += `<tr style="background:#ffc035;">${thHtml}</tr>`;
            }
          }
        });
        addCol[key].html += `</tr>`;
        // 表格数据配置
        this.tableData.forEach(row => {
          tdHtml = '';
          addCol[key].columnlist.forEach(item => {
            if (this.$common.isEmpty(item.children)) {
              tdHtml += `<td colspan="1" rowspan="1" style="border:1px solid black;">
                <p>${this.$common.isEmpty(row[item.rowKey]) ? '' : row[item.rowKey]}</p>
              </td>`;
            } else {
              item.children.forEach(td => {
                if (!this.$common.isEmpty(`${td.attr}${td.title}`)) {
                  tdHtml += `<td colspan="1" rowspan="1" style="border:1px solid black;">
                    <p>${this.$common.isEmpty(row[`${td.attr}${td.title}`]) ? '' : row[`${td.attr}${td.title}`]}</p>
                  </td>`;
                }
              });
            }
          });
          addCol[key].html += `<tr style="background:#fff;">${tdHtml}</tr>`;
        });
        addCol[key].html += `</tbody></table>`;
        this.$emit('insetDescription', {
          html: addCol[key].html,
          tabName: key.toLocaleUpperCase(),
          lang: key,
          tableId: tableId
        });
      });
    },
    // 移除列表自定义头方法
    removeColRender (colList) {
      colList.forEach((cItem, index) => {
        if (this.$common.isEmpty(cItem)) return;
        if (!this.$common.isEmpty(cItem.selfChildren) && !this.$common.isEmpty(cItem.children) && !this.$common.isEmpty(cItem.children[0].children)) {
          cItem.children = cItem.children[0].children;
        }
        Object.keys(cItem).forEach(key => {
          if (this.$common.isFunction(cItem[key])) {
            delete cItem[key];
          }
        });
        if (!this.$common.isEmpty(cItem.children)) {
          if (!this.$common.isEmpty(cItem.children[0].isAllChange) && !this.$common.isEmpty(cItem.children[0].children)) {
            cItem.children = cItem.children[0].children;
          }
          if (!!cItem.children[0].notChart && !this.$common.isEmpty(cItem.children[0].children)) {
            cItem.children = cItem.children[0].children;
          }
          this.removeColRender(cItem.children);
        }
        if (!this.$common.isEmpty(cItem.selfChildren)) {
          this.removeColRender(cItem.selfChildren);
        }
      })
    },
    // 生成尺码图成功
    finishModel (type = false) {
      this.createPicLoading = false;
      if (type) {
        this.pageLoading = false;
        this.$nextTick(() => {
          this.modelVisible = false;
        })
      }
    },
    // inch值根据cm填写而变化
    cmInputFocus (row, index, column, isChange) {
      const rate = 0.3937;
      const colKey = `${column.attr}cm`;
      const changeKey = `${column.attr}inch`;
      let cmValue = (this.$common.isEmpty(row[colKey]) ? '' : row[colKey]).trim();
      if (this.$common.isEmpty(cmValue)) return this.$set(this.tableData[index], changeKey, '');
      cmValue = Number(cmValue);
      if (this.$common.isEmpty(cmValue)) return this.$set(this.tableData[index], changeKey, '');
      const inchValue = (Number((cmValue * rate).toFixed(2))).toString();
      this.$set(this.tableData[index], changeKey, inchValue);
      // 以下为手动修改时执行
      if (!this.subsectionData.enabled || ![1].includes(this.planType)) return;
      if (!isChange) return;
      if (this.$common.isEmpty(this.colSubsectionList[column.attr])) return;
      let colSubList = this.$common.copy(this.colSubsectionList[column.attr]);
      const changeSizeId = this.tableData[index].sizeId;
      let subInfo = colSubList.find(f => f.startId == changeSizeId);
      let startSubIndex = null;
      if (this.$common.isEmpty(subInfo)) {
        let startIndex = null;
        colSubList.forEach((f, fIndex) => {
          if (f.sizeIds.includes(changeSizeId) && this.$common.isEmpty(startSubIndex)) {
            startSubIndex = fIndex;
            subInfo = f;
          }
        });
        if (this.$common.isEmpty(subInfo)) return;
        subInfo.sizeIds.forEach((sId, sIndex) => {
          if (sId == changeSizeId && this.$common.isEmpty(startIndex)) {
            startIndex = sIndex;
          }
        });
        if (!this.$common.isEmpty(startIndex)) {
          subInfo.sizeIds = subInfo.sizeIds.slice(startIndex);
        }
      } else {
        colSubList.forEach((f, fIndex) => {
          if (f.startId == changeSizeId && this.$common.isEmpty(startSubIndex)) {
            startSubIndex = fIndex;
            subInfo = f;
          }
        });
      }
      if (!this.$common.isEmpty(startSubIndex)) {
        colSubList = colSubList.slice(startSubIndex);
      }
      colSubList.forEach((cItem) => {
        this.changTableColData(cItem, column);
      });
    },
    // 取某语言下的数据
    preTemplate (type = false, fillSize = false) {
      return new Promise(resolve => {
        let defaultLanguage = this.defaultLanguage;
        let sizePartlist = this.sizePartlist[defaultLanguage] || [];
        
        // 根据选中的多属性筛选出语言模板数据
        let sizelist = this.allList['name'] ? this.allList['name'].sizelist : [];
        sizelist = sizelist.map(s => s.sizeId);
        const newSizes = this.allProductSizData.filter((item, index) => {
          return !sizelist.includes(item.sizeId) && this.checkTagVal.second.includes(item.sizeId);
        }).map(m => {
          return m.sizeId;
        });
        let list = this.sizeLanlist.filter(k => {
          return [...sizelist, ...newSizes].includes(k.sizeId);
        });
        let tablelist = this.$common.copy(this.tableData.reverse());
        let rowInfo = {};
        let notNullCol = [];
        let getData = list.map((k, index) => {
          let [obj, arr] = [{}, []];
          rowInfo = tablelist.find(item => item.sizeId == k.sizeId);
          Object.keys(k).forEach(itemKey => {
            if (!this.$common.isEmpty(rowInfo) && !this.$common.isUndefined(rowInfo[itemKey])) {
              obj[itemKey] = rowInfo[itemKey];
            } else if (itemKey.includes('Value') && this.$common.isString(k[itemKey]) && k[itemKey].includes('=')) {
              obj[itemKey] = k[itemKey].substr(k[itemKey].lastIndexOf('=')).match(/(\d*)[^0-9]*$/)[1];
            }
          })
          sizePartlist.forEach(item => {
            obj[item.partId + 'cm'] = rowInfo && rowInfo[item.partId + 'cm'] ? rowInfo[item.partId + 'cm'] : '';
            obj[item.partId + 'inch'] = rowInfo && rowInfo[item.partId + 'inch'] ? rowInfo[item.partId + 'inch'] : '';
            if (!notNullCol.includes(item.partId) && !this.$common.isEmpty(obj[item.partId + 'cm'])) {
              notNullCol.push(item.partId);
            }
            arr.push(item.partId);
          });
          if (this.$common.isEmpty(obj.sizeId) && this.$common.isEmpty(k.sizeId)) {
            obj['sizeId'] = `defualt-${index}`;
          }
          return { ...k, ...obj, partIdList: arr };
        });

        let newd = this.$common.copy(getData.reverse());
        this.tableData = newd;
        !type && (this.oldTableList = newd);
        this.landataItem = this.allList[defaultLanguage];
        // 有设置跳码，并且新增尺码时，自动填充跳码数据
        this.$nextTick(() => {
          if (fillSize && this.subsectionData.enabled && [1].includes(this.planType)) {
            let nullIndexJson = {};
            notNullCol.forEach(key => {
              this.tableData.find((row, rIndex) => {
                if (this.$common.isEmpty(row[`${key}cm`])) {
                  nullIndexJson[key] = rIndex - 1;
                  return true;
                }
              });
              if (!this.$common.isEmpty(nullIndexJson[key]) && nullIndexJson[key] >= 0 && (nullIndexJson[key] + 2) < this.tableData.length) {
                this.cmInputFocus(this.tableData[nullIndexJson[key]], nullIndexJson[key], {attr: key}, true);
              }
            });
          }
        });
        resolve();
      })
    },
    // 配置表格
    setTemColumns (lan) {
      let item = this.sizeTemList[lan.type] || [];
      let titleName = item[0] ? item[0][lan.name] : ''; //第二行表头
      let headChild = [{
        title: titleName,
        align: 'center',
        minWidth: 100,
        className: 'measurement-value',
        slot: lan.type + 'Value'
      }];
      if (this.subsectionData.enabled && [1].includes(this.planType)) {
        headChild = [{
          title: lan.type === 'name' ? '跳码' : ' ',
          align: 'center',
          minWidth: 100,
          className: 'hopping-method',
          notChart: true,
          notRenderHand: true,
          children: headChild
        }]
      }
      return {
        title: lan.otherLabel,
        align: 'center',
        minWidth: 100,
        isLanguage: lan.type === 'name' ? null : true,//用于尺码图片语言分离标识
        lanType: lan.type,
        className: 'measurement-tag-size',
        children: [{
          title: lan.type != 'name' ? ' ' : this.measurementJson.method,
          align: 'center',
          minWidth: 100,
          className: 'measurement-method',
          notRenderHand: lan.type != 'name',
          isAllChange: lan.type == 'name',
          // 测量方法的名称改变时，所有语言的都同时改变
          valueChange: (val) => {
            this.$set(this.measurementJson, 'method', val);
            Object.keys(this.allList).forEach((key) => {
              (this.allList[key].columnlist || []).forEach((item, fIndex) => {
                if (!this.$common.isEmpty(item) && !this.$common.isEmpty(item.children)) {
                  item.children.forEach((sRow, sIndex) => {
                    if (sRow.isAllChange) {
                      this.$set(this.allList[key].columnlist[fIndex].children[sIndex], 'title', val);
                    }
                  })
                }
              })
            })
          },
          children: headChild,
        }],
        valueChange: (val) => {
          if (this.defaultLanguage == 'cn') {
            this.$set(this.measurementJson, 'partName', val);
          }
        }
      }
    },
    // 全部语言信息
    allLanguageInfo () {
      return new Promise(resolve => {
        let language = this.language;
        let defaultColumns = this.defaultColumns;
        let [detemColumns, lanTemplateList, partTemplateList, allList] = [[], {}, {}, {}];
        let mLang = {};
        let fun = {
          // 模板
          getTemColumns: () => {
            // 固定列
            language.forEach(lan => {
              mLang[lan.type] = lan;
              if (!defaultColumns.includes(lan.type)) return;
              let columns = this.setTemColumns(lan);
              detemColumns.push(columns);
            });
            language.forEach(lan => {
              if (!lanTemplateList[lan.type]) lanTemplateList[lan.type] = [];
              // 过滤固定列
              if (defaultColumns.includes(lan.type)) {
                lanTemplateList[lan.type] = this.$common.copy(detemColumns);
                return;
              }
              let lantemColumns = [];
              let columns = this.setTemColumns(lan);
              if (lan.type == 'en') {
                lantemColumns.push(...detemColumns, this.setTemColumns(mLang['an']));
                lantemColumns.push(columns);
              } else {
                lantemColumns.push(...detemColumns, columns);
              }
              // lantemColumns.push(...detemColumns, columns);
              lanTemplateList[lan.type] = this.$common.copy(lantemColumns);
            })
          },
          // 尺码部位
          setParts: () => {
            let headChild = [];
            Object.keys(this.sizePartlist).forEach(size => {
              let sizelist = this.sizePartlist[size] || [];
              let sizeColumns = [];
              sizelist.forEach((sl, index) => {
                headChild = [
                  {
                    attr: sl.partId,
                    title: 'cm',
                    align: 'center',
                    minWidth: 100,
                    slot: 'cmInputs',
                    valueChange: (val) => {
                      const partId = this.sizePartlist[size][index].partId;
                      Object.keys(this.allList).forEach((key) => {
                        (this.allList[key].columnlist || []).forEach((item, fIndex) => {
                          if (!this.$common.isEmpty(item) && !this.$common.isEmpty(item.selfChildren)) {
                            item.selfChildren.forEach((sRow, sIndex) => {
                              if (partId == sRow.partId) {
                                this.$set(this.allList[key].columnlist[fIndex].selfChildren[sIndex].children[0], 'title', val);
                              }
                            })
                          }
                        })
                      })
                    }
                  },
                  {
                    attr: sl.partId,
                    title: 'inch',
                    align: 'center',
                    minWidth: 100,
                    slot: 'inchInputs',
                    valueChange: (val) => {
                      const partId = this.sizePartlist[size][index].partId;
                      Object.keys(this.allList).forEach((key) => {
                        (this.allList[key].columnlist || []).forEach((item, fIndex) => {
                          if (!this.$common.isEmpty(item) && !this.$common.isEmpty(item.selfChildren)) {
                            item.selfChildren.forEach((sRow, sIndex) => {
                              if (partId == sRow.partId) {
                                this.$set(this.allList[key].columnlist[fIndex].selfChildren[sIndex].children[1], 'title', val);
                              }
                            })
                          }
                        })
                      })
                    }
                  }
                ];
                if (this.subsectionData.enabled && [1].includes(this.planType)) {
                  headChild = [{
                    title: ' ',
                    className: 'hopping-method',
                    align: 'center',
                    minWidth: 200,
                    notChart: true,
                    partId: sl.partId,
                    renderHeader: (h, params) => {
                      if (this.$common.isEmpty(this.colSubsectionList[sl.partId])) return h('div', {}, '');
                      let startInfo = {};
                      let endInfo = {};
                      const headItem = this.colSubsectionList[sl.partId].map((m, sIndex) => {
                        startInfo = this.sizGroupDataJson[m.startId];
                        endInfo = this.sizGroupDataJson[m.endId];
                        return h('div', {
                          class: 'subsection-head',
                        }, [
                          h('span', {
                            class: 'subsection-label',
                          }, `${startInfo ? startInfo.size : ''} - ${endInfo ? endInfo.size : ''}`),
                          h('Input', {
                            style: {},
                            props: {
                              type: 'text',
                              value: this.colSubsectionList[sl.partId][sIndex].hoppingCode
                            },
                            on: {
                              'on-change': (val) => {
                                this.$nextTick(() => {
                                  if (this.$common.isEmpty(val.target._value)) return;
                                  const hoppingCode = Number(val.target._value);
                                  const decimals = hoppingCode.toString().split('.');
                                  if (this.$common.isEmpty(hoppingCode) || hoppingCode <= 0 || (decimals.length > 1 && decimals[1].length > 1)) {
                                    return this.$Message.error('输入值不符合大于0最多一位小数，不进行跳码计算操作');
                                  }
                                  this.$set(this.colSubsectionList[sl.partId][sIndex], 'hoppingCode', hoppingCode);
                                  this.colSubsectionList[sl.partId].forEach((sItem, cIndex) => {
                                    if (cIndex >= sIndex && !this.$common.isEmpty(params.column) && !this.$common.isEmpty(params.column.children)) {
                                      this.changTableColData(this.$common.copy(sItem), params.column.children[0]);
                                    }
                                  });
                                })
                              }
                            }
                          })
                        ])
                      });
                      return h('div', {}, headItem);
                    },
                    children: headChild
                  }]
                }
                let obj = {
                  title: sl[size + 'Name'],
                  align: 'center',
                  minWidth: 200,
                  selfChildren: [{
                    ...sl,
                    align: 'center',
                    title: sl.measurementDescription,
                    children: [
                      {
                        attr: sl.partId,
                        title: 'cm',
                        align: 'center',
                        slot: 'cmInputs'
                      }
                    ]
                  }],
                  children: [{
                    title: sl.measurementDescription,
                    className: 'measurement-method',
                    align: 'center',
                    minWidth: 200,
                    partId: sl.partId,
                    inputType: 'textarea',
                    // 无论在哪个语言下修改测量方法，全部语言下的测量方法文本都改变，
                    valueChange: (val) => {
                      this.$set(this.sizePartlist[size][index], 'measurementDescription', val);
                      const partId = this.sizePartlist[size][index].partId;
                      Object.keys(this.allList).forEach((key) => {
                        (this.allList[key].columnlist || []).forEach((item, fIndex) => {
                          if (!this.$common.isEmpty(item) && !this.$common.isEmpty(item.selfChildren)) {
                            item.selfChildren.forEach((sRow, sIndex) => {
                              if (partId == sRow.partId) {
                                this.$set(this.allList[key].columnlist[fIndex].selfChildren[sIndex], 'measurementDescription', val);
                                this.$set(this.allList[key].columnlist[fIndex].selfChildren[sIndex], 'title', val);
                              }
                            })
                            item.children.forEach((sRow, sIndex) => {
                              if (partId == sRow.partId) {
                                this.$set(this.allList[key].columnlist[fIndex].children[sIndex], 'measurementDescription', val);
                                this.$set(this.allList[key].columnlist[fIndex].children[sIndex], 'title', val);
                              }
                            })
                          }
                        })
                      })
                    },
                    children: headChild
                  }]
                }
                sizeColumns.push(obj);
              })
              partTemplateList[size] = this.$common.copy(sizeColumns);
            })
          },
          // 整合全部语言数据
          getAllList: () => {
            language.forEach(lan => {
              if (!allList[lan.type]) allList[lan.type] = {};
              let obj = {};
              obj.language = lan.type && lan.type.toUpperCase();
              obj.attrLists = this.allAttrLists[lan.type] || []; //对应语言的属性列表
              obj.colorlist = this.attrallColorlist[lan.type] || []; //对应语言的颜色列表
              obj.sizelist = this.attrallSizelist[lan.type] || []; //对应语言的尺码列表
              obj.labellist = this.selfLabelList[lan.type] || []; //对应语言的label列表
              obj.titlelist = this.selfTitlist[lan.type] || []; //对应语言的label列表
              obj.piclist = this.allPartPicList[lan.type] || []; //对应语言的图片列表
              obj.columnlist = [].concat(lanTemplateList[lan.type], (partTemplateList[lan.type] || [])); //表头
              allList[lan.type] = obj;
            })
            allList['default'] = allList[this.defaultLanguage];
          }
        }
        fun.getTemColumns();
        fun.setParts();
        fun.getAllList();
        this.allList = allList;
        // 设置列头可以编辑
        Object.keys(allList).forEach(key => {
          if (!this.$common.isEmpty(allList[key])) {
            Object.keys(allList[key]).forEach(cKey => {
              if (cKey == 'columnlist' && !this.$common.isEmpty(allList[key][cKey])) {
                this.setColInput(allList[key][cKey], this.allList[key][cKey]);
              }
            })
          }
        });
        resolve();
      })
    },
    // 跳码改变时，更新表格数据
    changTableColData (hoppingInfo, column) {
      if (!this.subsectionData.enabled || ![1].includes(this.planType)) return;
      if (this.$common.isEmpty(hoppingInfo.sizeIds) || this.$common.isEmpty(column)) return;
      const startId = hoppingInfo.sizeIds[0];
      const colKey = column.attr;
      const baseRow = this.tableData.find(row => row.sizeId == startId);
      if (this.$common.isEmpty(baseRow) || this.$common.isEmpty(baseRow[`${colKey}cm`])) return;
      const baseVal = Number(baseRow[`${colKey}cm`]);
      let scale = 1;
      let jumpHz = 0;
      let preSzieIndex = null;
      let nowSizeIndex = null;
      this.tableData.forEach((row, index) => {
        if (hoppingInfo.sizeIds.includes(row.sizeId) && row.sizeId != startId) {
          jumpHz = 0;
          if (index > 0) {
            preSzieIndex = hoppingInfo.sizeIds.indexOf(this.tableData[index - 1].sizeId);
            nowSizeIndex = hoppingInfo.sizeIds.indexOf(row.sizeId);
            if (preSzieIndex > -1 && nowSizeIndex > -1) {
              jumpHz = (nowSizeIndex - preSzieIndex -1);
            }
          }
          this.$set(this.tableData[index], `${colKey}cm`, (Number(((hoppingInfo.hoppingCode * (scale + jumpHz)) + baseVal).toFixed(2))).toString());
          scale++;
          this.cmInputFocus(row, index, column, false);
        }
      });
    },
    // 设置输入框
    setColInput (colList, change) {
      colList.forEach((cItem, index) => {
        if (this.$common.isEmpty(cItem)) return;
        if (this.$common.isEmpty(cItem.renderHeader) && !cItem.notRenderHand) {
          cItem.renderHeader = (h, params) => {
            return h('Input', {
              style: {},
              props: {
                type: this.$common.isEmpty(cItem.inputType) ? 'text' : cItem.inputType,
                value: params.column.title
              },
              on: {
                'on-change': (val) => {
                  this.$nextTick(() => {
                    this.$set(change[index], 'title', val.target._value);
                    this.$set(change[index], 'isValueChange', true);
                    if (this.$common.isFunction(cItem.valueChange)) {
                      cItem.valueChange(val.target._value);
                    }
                  })
                }
              }
            });
          }
        }
        if (!this.$common.isEmpty(cItem.children)) {
          this.setColInput(cItem.children, change[index].children);
        }
      })
    },
    // 按钮点击(更新每个语言下的attrValue)
    attrBtnclick (citem, index, cindex) {
      if (!this.landataItem.attrLists[index]) return;
      this.landataItem.attrLists[index].attrValue = citem.attributeValueId;
      Object.keys(this.allList).forEach(k => {
        let list = this.allList[k].attrLists || [];
        list.forEach((item, key) => {
          if (index === key) {
            item.attrValue = item.value[cindex] && item.value[cindex].attributeValueId;
          }
        })
      })
    },
    // 语言切换
    lanChecked (val) {
      this.$nextTick(() => {
        if (!this.$common.isEmpty(val)) {
          if (this.$common.isEmpty(this.validLanguage)) {
            this.defaultLanguage = 'cn';
          } else {
            this.defaultLanguage = this.validLanguage.slice(-1);
          }
        } else {
          this.defaultLanguage = '';
        }
        this.preTemplate(true);
      })
    },
    // 上下左右
    tableKeydown (event) {
      var e = event || window.event;
      let codelist = [37, 38, 39, 40]; //左、上、右、下
      if (e && !codelist.includes(e.keyCode)) return;
      // 聚焦节点的父亲节点=>兄弟节点的子节点
      let parenTarget = this.$common.parents(e.target, 'td');
      if (!parenTarget) return;
      let tdIndex = null;//记录行所在的td的位置
      if (parenTarget && parenTarget.parentNode && parenTarget.parentNode.children) {
        let children = Array.prototype.slice.call(parenTarget.parentNode.children) || [];
        children.forEach((k, i) => {
          if (k === parenTarget) {
            tdIndex = i;
          }
        })
      }

      if (e.keyCode == 38) {
        if (!(tdIndex || tdIndex === 0)) return;
        if (parenTarget && parenTarget.parentNode && parenTarget.parentNode.previousElementSibling && parenTarget.parentNode.previousElementSibling.children) {
          let td = parenTarget.parentNode.previousElementSibling.children[tdIndex];
          td && td.querySelector('.ivu-input') ? td.querySelector('.ivu-input').focus() : '';
        }
      }

      if (e.keyCode == 37) {
        if (parenTarget && parenTarget.previousElementSibling && parenTarget.previousElementSibling.querySelector('.ivu-input')) {
          parenTarget.previousElementSibling.querySelector('.ivu-input').focus();
        }
      }

      if (e.keyCode == 40) {
        if (!(tdIndex || tdIndex === 0)) return;
        if (parenTarget && parenTarget.parentNode && parenTarget.parentNode.nextElementSibling && parenTarget.parentNode.nextElementSibling.children) {
          let td = parenTarget.parentNode.nextElementSibling.children[tdIndex];
          td && td.querySelector('.ivu-input') ? td.querySelector('.ivu-input').focus() : '';
        }
      }

      if (e.keyCode == 39) {
        if (parenTarget && parenTarget.nextElementSibling && parenTarget.nextElementSibling.querySelector('.ivu-input')) {
          parenTarget.nextElementSibling.querySelector('.ivu-input').focus();
        }
      }
    },
    // 键盘事件
    keyChange () {
      let table = document.getElementById('sizechart-table');
      if (!table) return;
      this.cancelKeydown();
      table.addEventListener('keydown', (e) => {
        this.tableKeydown(e)
      }, false);
    },
    // 销毁键盘事件
    cancelKeydown () {
      let table = document.getElementById('sizechart-table');
      if (!table) return;
      table.removeEventListener('keydown', (e) => {
        this.tableKeydown(e);
      }, false);
    },
    // 勾选(取消)商品图片
    picCheckChange (val, key) {
      if (key == 'goodsPicJson') {
        this.languageList.forEach(item => {
          if (!this.$common.isEmpty(this.goodsPicJson[item]) && this.goodsPicJson[item].isChecked != val) {
            this.$set(this.goodsPicJson[item], 'isChecked', val);
          }
          if (!val && !this.$common.isEmpty(this.partImgList[item]) && !this.partImgList[item].isChecked) {
            this.$set(this.partImgList[item], 'isChecked', true);
          }
        });
        return;
      }
      this.languageList.forEach(item => {
        if (this.$common.isEmpty(this.partImgList[item]) || this.partImgList[item].isChecked == val) return;
        this.$set(this.partImgList[item], 'isChecked', val);
      });
    },
    // 选择图片
    chosePicture (event, key) {
      if (!['allPartPicList', 'goodsAllPic', 'local'].includes(event)) return;
      if (event == 'allPartPicList') {
        Object.keys(this[event]).forEach(lang => {
          this[key][lang].pictureUrl = this[event][lang][0].pictureUrl;
        });
        return;
      }
      if (event == 'goodsAllPic') {
        this.chosePicData = this.$common.copy(this[event]);
        this.changPicKey = key;
        this.$nextTick(() => {
          this.modelPicVisible = true;
        });
        return;
      }
      if (event == 'local') {
        const fileInput = document.querySelector('#temporaryFile');
        if(!fileInput) return;
        this.changPicKey = key;
        fileInput.click();
      }
    },
    // 弹窗勾选(取消)图片
    modalCheckedChange (val, index, valKey) {
      if (!val) return;
      this.chosePicData.forEach((item, fIndex) => {
        if (fIndex != index) {
          item.isModalChecked = false;
        }
      });
    },
    // 关闭选图片弹窗
    closePicModal () {
      this.chosePicData = [];
      this.modelPicVisible = false;
    },
    // 确认选择图片
    confirmChosePic () {
      const chosePic = this.chosePicData.find(item => item.isModalChecked);
      if (this.$common.isEmpty(chosePic)) {
        return this.$Message.error('请选择图片');
      }
      let newImg = this.$common.copy(this[this.changPicKey]);
      Object.keys(newImg).forEach(key => {
        newImg[key].pictureUrl = chosePic.pictureUrl;
      });
      this[this.changPicKey] = newImg;
      this.closePicModal();
    },
    // 文件改变
    onFileChange (val) {
      const newFile = val.target.files[0];
      if (!newFile || newFile.size == 0) return;
      this.$common.fileToBase64(newFile).then(res => {
        let newImg = this.$common.copy(this[this.changPicKey]);
        Object.keys(newImg).forEach(key => {
          newImg[key].pictureUrl = res;
        });
        this[this.changPicKey] = newImg;
        this.$nextTick(() => {
          const fileInput = document.querySelector('#temporaryFile');
          if(!fileInput) return;
          fileInput.value = null;
        })
      });
    },
    // 颜色值改变时修改 CSS 变量
    colorChange (color, key) {
      let root = document.documentElement;
      if (!root) return;
      // 修改 CSS 变量的值
      root.style.setProperty(`--size-chart-${key}`, color);
    },
  }
}
</script>
<style lang="less" scoped>
.tag-item-content{
  position: relative;
  display: flex;
  // width: calc(100% - 200px);
  // min-width: 400px;
  .tag-item-text-content{
    display: flex;
    flex: 100;
    padding-right: 15px;
    flex-wrap: wrap;
  }
  .tag-item-lable{
    margin-left: 5px;
    &:first-child{
      margin-left: 0;
    }
    .tag-item-txt{
      display: inline-block;
      min-width: 25px;
      padding: 1px 5px;
      line-height: 24px;
      border: 1px solid #dcdfe6;
      border-radius: 3px;
      &:focus-visible{
        outline: none;
      }
    }
  }
}
.ivu-icon-ios-create-outline{
  line-height: 32px;
  font-size: 20px;
  cursor: pointer;
  visibility: visible;
}
.tooprop-secect-content{
  position: absolute;
  display: flex;
  width: 300px;
  padding: 0 10px 0 0;
  left: 100%;
  top: 0;
  border-radius: 5px;
  background: #fff;
  z-index: 10;
  box-shadow: 0 0 5px 0px #000;
  :deep(.dyt-select-demo){
    .ivu-select-selection{
      border: none;
      outline: none;
    }
  }
  .ivu-icon-md-checkmark-circle-outline{
    color: #2d8cf0;
  }
  .ivu-icon-ios-close-circle-outline{
    color: #f20;
  }
  .ivu-icon-md-checkmark-circle-outline,
  .ivu-icon-ios-close-circle-outline{
    margin-left: 10px;
    font-size: 20px;
    line-height: 32px;
    cursor: pointer;
  }
}
.not-select-self-size{
  :deep(.measurement-method){
    display: none;
  }
}
.woman-shoe-plan{
  &.sizeContent {
    :deep(.ivu-form) {
      .ivu-table-header{
        thead tr {
          &:nth-child(1), &:nth-child(3) {
            display: none;
          }
          &:nth-child(4) {
            th {
              &.measurement-value {
                display: none;
              }
            }
          }
        }
      }
      .flex-sty {
        display: block;
        min-width: initial;
        min-height: auto;
        width: 100%;
        padding-right: 0;
        padding-left: 0;
      }
      .img-top-txt{
        padding-bottom: 10px;
        font-size: 30px;
        font-weight: bold;
        text-align: center;
      }
      .img-father{
        position: relative;
        width: 100%;
        height: auto;
        overflow: hidden;
        display: flex;
        align-items: center;
        border-radius: 0;
        margin-left: 0;
        justify-content: center;
        img{
          width: auto;
          height: auto;
          max-width: 90%;
          max-height: 300px;
        }
      }
    }
  }
}
.size-charts-modal{
  position: relative;
}
.pic-list-content{
  :deep(.ivu-checkbox-wrapper){
    position: relative;
    vertical-align: top;
    margin-right: 10px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    box-shadow: 0 0 5px #aaa;
    &:last-child{
      margin-right: 0;
    }
    .ivu-checkbox{
      position: absolute;
      top: 0;
      left: 0;
      .ivu-checkbox-inner{
        width: 20px;
        height: 20px;
        &:after {
          width: 8px;
          height: 15px;
          top: -1px;
          left: 5px;
        }
      }
    }
    .pic-item{
      width: 100px;
      height: 100px;
      overflow: hidden;
      display: flex;
      // align-items: center;
      img{
        width: 100%;
        height: auto;
        object-fit: cover;
      }
    }
  }
}
.table-color-set{
  position: relative;
  .color-set-row{
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 80px;
  }
}
</style>
<style lang="less">
.sizecharts .ivu-modal {
  min-width: 1000px;
}
.sizeContent {
  position: relative;
  overflow: hidden;
  .size-form {
    padding-left: 20px;
  }
  .ivu-table th.is-leaf,
  .ivu-table-border th{
    border-color: var(--size-chart-headBorderColor);
    font-weight: bold;
  }
  .ivu-table td,
  .ivu-table-border td,
  .ivu-table-wrapper-with-border {
    border-color: var(--size-chart-tableBorderColor);
    font-weight: bold;
  }
  .ivu-table:before{
    background-color: var(--size-chart-tableBorderColor);
  }
  .ivu-table-border {
    &:after {
      background-color: var(--size-chart-tableBorderColor);
    }
    .ivu-table-header{
      position: relative;      
      &:after {
        background-color: var(--size-chart-headBorderColor);
        z-index: 10;
      }
    }
  }

  .ivu-table {
    th {
      color: var(--size-chart-headFontColor);
      background: var(--size-chart-headBackground);
      .ivu-input{
        color: var(--size-chart-headFontColor);
        background: var(--size-chart-headBackground);
        border-color: var(--size-chart-headBorderColor);
      }
      .dyt-custom-input-box .dyt-custom-input .ivu-input-icon{
        color: var(--size-chart-headFontColor);
        background: var(--size-chart-headBackground);
      }
    }
    td {
      color: var(--size-chart-tableFontColor);
      background: var(--size-chart-tableBackground);
      .ivu-input{
        color: var(--size-chart-tableFontColor);
        background: var(--size-chart-tableBackground);
        border-color: var(--size-chart-tableBorderColor);
      }
      .dyt-custom-input-box .dyt-custom-input .ivu-input-icon{
        color: var(--size-chart-tableFontColor);
        background: var(--size-chart-tableBackground);
      }
    }
  }
  .flex-sty {
    position: relative;
    display: flex;
    justify-content: center;
    .flex-form{
      width: 450px;
    }
    .ivu-form-item-label,
    .ivu-form-item,
    .ivu-btn,
    .ivu-table,
    .ivu-input {
      color: #262626;
    }
    .form-border--bot {
      border-bottom: 1px solid #ccc;
      .ivu-form-item-label {
        text-align: left;
      }
    }
    .ivu-btn {
      padding: 0 10px;
      border-radius: 0;
      &:hover,
      &:active {
        border-color: #dcdee2;
      }
    }
    .active-btn {
      background-color: #ccc;
      border-color: #ccc;
      color: #292929;
    }
    .btn-mb {
      margin-bottom: 10px;
    }
  }
  .flex-center {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }
  .input-items {
    margin-bottom: 10px;
    margin-right: 10px;
    .input-item-c {
      width: 100px;
    }
    .input-item-l {
      width: 70px;
    }
  }
  .picture-content{
    position: relative;
    display: flex;
    height: 300px;
  }
  .img-father {
    position: relative;
    width: 300px;
    height: 100%;
    overflow: hidden;
    display: flex;
    align-items: center;
    img {
      width: 100%;
      height: auto;
      object-fit: cover;
    }
  }
}
.footers,
.footers__left {
  display: flex;
  align-items: center;
}
.footers__right{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.footers {
  justify-content: space-between;
}
.table-color-picker{
  width: 300px;
}
.subsection-head{
  display: flex;
  align-items: center;
  margin-bottom: 3px;
  &:last-child{
    margin-bottom: 0;
  }
  .subsection-label{
    padding-right: 5px;
    flex: 100;
    text-align: right;
    font-size: 12px;
    font-weight: initial;
  }
  .ivu-input-wrapper{
    width: 80px;
  }
}
</style>