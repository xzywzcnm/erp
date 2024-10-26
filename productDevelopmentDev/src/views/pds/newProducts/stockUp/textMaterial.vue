<template>
  <div class="form-contain form-contain-disabled tabs-textmaterial">
    <Tabs :value="languageType" @on-click="tabClick">
      <TabPane :label="item.label" :name="item.value" v-for="item in langList" :key="item.value"></TabPane>
    </Tabs>

    <!-- <Button class="tabs-btnpos" size="small" @click="generatePic()" v-if="permissionStatus">生成尺码图</Button> -->
    <Dropdown v-if="permissionStatus" transfer @on-click="generatePic" class="tabs-btnpos" trigger="click">
      <Button size="small" type="primary">生成尺码图 <Icon type="ios-arrow-down"></Icon></Button>
      <DropdownMenu slot="list">
        <DropdownItem :name="1">通用尺码图</DropdownItem>
        <DropdownItem :name="2">婴童尺码图</DropdownItem>
        <DropdownItem :name="3">儿童尺码图</DropdownItem>
        <DropdownItem :name="4">女鞋尺码图</DropdownItem>
      </DropdownMenu>
    </Dropdown>

    <!-- <p>
      <span class="text-label">标题：</span>
      <Input style="width: 540px" v-model="desTitle" :maxlength="100" clearable @on-blur="saveTitle()" placeholder="最大长度为100" :disabled="!permissionStatus" />
    </p> -->

    <p class="mt10" style="display:flex;">
      <span class="text-label">关键词：</span>
      <local-tag-input style="flex:1; display: inline-block" :tags="keyWords" @tagsMt="tagsMt" :disabled="!permissionStatus">
      </local-tag-input>
    </p>

    <ButtonGroup class="mt10 mb10">
      <Button v-for="(item, index) in descriptionGrade" :key="index" :class="{ 'ivu-btn-primary': item.checked }" @click="tagStepBtn(item, descriptionGrade);changeDescription();">{{ item.text }}</Button>
    </ButtonGroup>

    <!-- 纯文本描述 begin -->
    <div style="width: 100%;">
      <Input v-show="isChecked === 'textDescription'" style="width: 100%;" type="textarea" :autosize="{ minRows: 12, maxRows: 12 }" :maxlength="65536" v-model="simDes" @on-blur="changeTextarea" placeholder="请输入..." :disabled="!permissionStatus" />
    </div>
    <!-- 纯文本描述 end -->

    <div v-show="isChecked !== 'textDescription'">
      <vue-ueditor-wrap v-model="description" :config="myConfig" @ready="ueReady" @before-init="addCustomButtom">
      </vue-ueditor-wrap>
    </div>

    <!-- 表格弹框 -->
    <table-edit :isVisible.sync="isVisible" :type="type" :languageType="languageType" @tableEditcontent="tableEditcontent"></table-edit>

    <!-- 通用、女鞋尺码图 -->
    <size-chart
      :isVisible.sync="sizeVisible"
      :planType="planType"
      :productData="productData"
      :commodiAttr="commodiAttr"
      :colorList="colorList"
      v-bind="$attrs"
      @insetDescription="insetDescription"
    />

    <!-- 婴童、儿童尺码图 -->
    <child-size-chart
      :isVisible.sync="childVisible"
      :childType="planType"
      :productInfo="productData"
      :colorList="colorList"
      v-bind="$attrs"
      @insetDescription="insetDescription"
    />
  </div>
</template>

<script>
import api from "@/api/api";
import CommonMixin from "@/components/mixin/commonMixin";
import VueUeditorWrap from "vue-ueditor-wrap";
import tableData from "@/views/pds/utils/tableData";
import tableEdit from "@/components/tableEdit";
import sizeChart from "../components/sizeChart";
import childSizeChart from "../components/childSizeChart";
/**
 * *** UE编辑器 修改了ueditor.all.min js
 * */
export default {
  name: "textMaterial", // 详细描述
  mixins: [CommonMixin],
  components: { VueUeditorWrap, tableEdit, sizeChart, childSizeChart },
  data () {
    return {
      languageType: "EN",
      myConfig: {
        UEDITOR_HOME_URL: "./static/ueditor/", // 你的UEditor资源存放的路径,相对于打包后的index.html
        autoHeightEnabled: false, // 编辑器是否自动被内容撑高
        autoFloatEnabled: false, // 工具栏是否可以浮动
        initialFrameHeight: 290, // 初始容器高度
        initialFrameWidth: "100%", // 初始容器高度
        serverUrl: api.ueditorEnter,
        enableAutoSave: false, // 自动保存
        scaleEnabled: true, //设置自动调整高度
        zIndex: 9999,
      },
      colorList: [],
      keyWords: [],
      // 文本类型
      descriptionGrade: [
        {
          text: "复杂描述",
          checked: true,
          value: "description",
        },
        {
          text: "简易描述",
          checked: false,
          value: "simpleDescription",
        },
        {
          text: "纯文本描述",
          checked: false,
          value: "textDescription",
        },
        {
          text: "亮点描述",
          checked: false,
          value: "highlightDescription",
        },
        {
          text: "包裹描述",
          checked: false,
          value: "packageDescription",
        },
        {
          text: "移动端描述",
          checked: false,
          value: "mobileDescription",
        },
      ],
      // 根据语言存储对应的值
      descriptionList: {
        //英语
        EN: {
          description: "", // 复杂描述
          simpleDescription: "", // 简易描述
          textDescription: "", // 纯文本描述
          highlightDescription: "", // 亮点描述
          packageDescription: "", // 包裹描述
          mobileDescription: "",//移动端描述
          keywords: [],
          language: "EN",//英语
          title: "",
          descriptionId: "",
          attrLanguage: "en"//辨识标识符
        },
        //德语
        GER: {
          description: "", // 复杂描述
          simpleDescription: "", // 简易描述
          textDescription: "", // 纯文本描述
          highlightDescription: "", // 亮点描述
          packageDescription: "", // 包裹描述
          mobileDescription: "",//移动端描述
          keywords: [],
          language: "GER",//德语
          title: "",
          descriptionId: "",
          attrLanguage: "de"
        },
        //法语
        FRA: {
          description: "", // 复杂描述
          simpleDescription: "", // 简易描述
          textDescription: "", // 纯文本描述
          highlightDescription: "", // 亮点描述
          packageDescription: "", // 包裹描述
          mobileDescription: "",//移动端描述
          keywords: [],
          language: "FRA",//法语
          title: "",
          descriptionId: "",
          attrLanguage: "fr"
        },
        //西班牙语
        SPN: {
          description: "", // 复杂描述
          simpleDescription: "", // 简易描述
          textDescription: "", // 纯文本描述
          highlightDescription: "", // 亮点描述
          packageDescription: "", // 包裹描述
          mobileDescription: "",//移动端描述
          keywords: [],
          language: "SPN",//西班牙语
          title: "",
          descriptionId: "",
          attrLanguage: "es"
        },
        //意大利语
        IT: {
          description: "", // 复杂描述
          simpleDescription: "", // 简易描述
          textDescription: "", // 纯文本描述
          highlightDescription: "", // 亮点描述
          packageDescription: "", // 包裹描述
          mobileDescription: "",//移动端描述
          keywords: [],
          language: "IT",//意大利语
          title: "",
          descriptionId: "",
          attrLanguage: "it"
        },
        //葡萄牙语
        POR: {
          description: "", // 复杂描述
          simpleDescription: "", // 简易描述
          textDescription: "", // 纯文本描述
          highlightDescription: "", // 亮点描述
          packageDescription: "", // 包裹描述
          mobileDescription: "",//移动端描述
          keywords: [],
          language: "POR",//葡萄牙语
          title: "",
          descriptionId: "",
          attrLanguage: "pt"
        },
        //中文
        CN: {
          description: "", // 复杂描述
          simpleDescription: "", // 简易描述
          textDescription: "", // 纯文本描述
          highlightDescription: "", // 亮点描述
          packageDescription: "", // 包裹描述
          mobileDescription: "",//移动端描述
          keywords: [],
          language: "CN",//中文
          title: "",
          descriptionId: "",
          attrLanguage: "cn"
        },
        //波兰
        PLN: {
          description: "", // 复杂描述
          simpleDescription: "", // 简易描述
          textDescription: "", // 纯文本描述
          highlightDescription: "", // 亮点描述
          packageDescription: "", // 包裹描述
          mobileDescription: "",//移动端描述
          keywords: [],
          language: "PLN",//波兰语
          title: "",
          descriptionId: "",
          attrLanguage: "pl"
        },
      },
      desTitle: "", // 'EN'英语，'GER'德语，'FRA'法语，'SPN'西班牙语，'IT'意大利语，'POR'葡萄牙语，'CN'中文,'PL'波兰
      langList: {
        EN: {
          value: "EN",
          label: "英语",
        },
        GER: {
          value: "GER",
          label: "德语",
        },
        FRA: {
          value: "FRA",
          label: "法语",
        },
        SPN: {
          value: "SPN",
          label: "西班牙语",
        },
        IT: {
          value: "IT",
          label: "意大利语",
        },
        POR: {
          value: "POR",
          label: "葡萄牙语",
        },
        CN: {
          value: "CN",
          label: "中文",
        },
        PLN: {
          value: "PLN",
          label: "波兰语",
        },
      },
      description: "",
      simDes: "",
      saveDesc: [
        {
          description: "",
          language: "",
          title: "",
        },
      ],
      editor: null,
      //创建下拉菜单中的键值对
      tableType: {
        1: { name: "女装常规款", val: "sizeOne" },
        2: { name: "女装下装", val: "sizeTwo" },
        3: { name: "女装大码常规款", val: "sizeThree" },
        4: { name: "女装大码下装", val: "sizeFour" },
        5: { name: "男装常规款", val: "sizeFive" },
        6: { name: "男装下装", val: "sizeSix" },
        7: { name: "童装常规款", val: "sizeSeven" },
        8: { name: "女鞋常规款", val: "sizeEight" },
      },
      isVisible: false,
      type: 0,
      attributeNameList: [],//关键词的属性名

      sizeVisible: false,//尺码图弹框
      commodiAttr: {
        attrlist: [],
        attributeClassifyVOList: [],
        laPaProductVariQuotationList: [],
      },//商品属性信息

      // 童装尺码图
      childVisible: false,
      planType: null,
    };
  },
  props: {
    productData: {
      type: Object,
      default () {
        return {};
      }
    },
    openType: {
      type: String,
      default () {
        return '';
      }
    },
    btnoperat: {
      type: String,
      default () {
        return '';
      }
    },
  },
  created () {
    this.getColorList();
  },
  methods: {
    // 获取颜色
    getColorList() {
      this.axios.get(api.queryProductColorList, { hiddenError: true }).then(res => {
        if (res.code === 0) {
          this.colorList = res.datas || [];
        }
      });
    },
    // 查询描述信息
    queryDescriptionMt () {
      let { productId } = this.productData;
      this.$Spin.show();
      return this.$axios
        .get(api.queryDescription, { params: { productId } })
        .then(({ code, datas }) => {
          if (code !== 0) return;
          let list = datas || [];

          // 只插入一次，操作人修改后不再补充插入
          if (!list.length) {
            this.productConfig(true);
            return false;
          }

          this.productConfig(false);

          list.forEach(k => {
            let temp = this.descriptionList[k.language];
            if (!temp) return;
            Object.keys(temp).forEach(o => {
              if (o === 'keywords') {
                let keywordlist = k[o] ? k[o].split(',') : [];
                temp[o] = keywordlist.map(j => {
                  return { attrVal: j };
                });
              } else {
                temp[o] = k[o] || '';
              }
            });
          });
          this.$nextTick(() => {
            this.$Spin.hide();
            this.tabClick(this.languageType);
          });
        }).catch(err => {
          this.$Spin.hide();
        });
    },
    // 商品属性配置
    productConfig (isFirst) {
      let { productId, goodTypeId } = this.productData;
      this.getProductDetail(productId).then((list) => {// 获取已勾选的属性
        // this.$set(this.commodiAttr, "attrlist", list || []);//商品属性
        this.getAttribute(goodTypeId, list, isFirst);//获取属性
      })
    },
    // 富文本框准备好后调用接口
    ueReady (editorInstance) {
      if (JSON.stringify(this.productData) === '{}') return;
      this.queryDescriptionMt();
      this.editorInstanceSet(editorInstance);
    },
    // editorInstance 配置获取
    editorInstanceSet (editorInstance) {
      this.editor = editorInstance;
      let userInfo = this.$store.state.erpConfig.userInfo;
      this.editor.execCommand("serverparam", {
        basePath: "/pds-service",
        userId: userInfo.merchantId + "," + userInfo.userId,
      });
      editorInstance.addListener("contentChange", () => {
        this.description = editorInstance.getContent();
      });
      if (!this.permissionStatus) {
        setTimeout(() => {
          editorInstance.setDisabled("fullscreen"); //不可选
        }, 10)
      }
    },
    // 设置值
    setContent (data) {
      const isChecked = this.isChecked;
      if (isChecked === "textDescription") {
        this.simDes = data[isChecked];
      } else {
        this.editor.setContent(data[isChecked]);
        this.description = data[isChecked];
      }
    },
    // 获取值
    getContent () {
      return this.editor && this.editor.getContent();
    },
    // 纯文本简单描述 changes
    changeTextarea () {
      const languageType = this.languageType;
      if (!this.descriptionList[languageType]) return;
      this.descriptionList[languageType].textDescription = this.simDes;
    },
    // 描述切换
    changeDescription () {
      const languageType = this.languageType;
      let item = this.descriptionList[languageType];
      if (item) this.setContent(item);
    },
    // 关键字回传
    tagsMt () {
      const languageType = this.languageType;
      if (!this.descriptionList[languageType]) return;
      this.descriptionList[languageType].keywords = JSON.parse(JSON.stringify(this.keyWords));
    },
    // 切换语种
    tabClick (name) {
      this.languageType = name;
      this.descriptionGrade.forEach((item, index) => {
        item.checked = index === 0;
      });
      let data = this.descriptionList[name];
      if (!data) return;
      this.desTitle = data.title;//设置标题
      this.keyWords = data.keywords || [];//设置关键字
      this.setContent(data);//设置描述
    },
    // 保存标题
    saveTitle () {
      const languageType = this.languageType;
      if (!this.descriptionList[languageType]) return;
      this.descriptionList[languageType].title = this.desTitle;
    },
    // 增加表格模版功能
    addCustomButtom (editorId) {
      let v = this;
      window.UE.registerUI(
        "mulinsertable",
        function (editor, uiName) {
          // 用于下拉默认值显示
          let selector = {
            label: "表格模版",
            value: "",
          };
          //注册按钮执行时的command命令,用uiName作为command名字，使用命令默认就会带有回退操作
          editor.registerCommand(uiName, {
            execCommand: function (cmdName, value) {
              if (v.languageType === 'EN') {
                v.isVisible = true;
                v.type = Number(value);
              } else {
                v.isVisible = true;
                v.type = Number(value);
                // 插入表格内容
                //this.execCommand("inserthtml", v.createTable(value));
              }
            },
            queryCommandValue: function () {
              //查询结果并返回
              return selector.label;
            },
          });

          let items = [];
          for (let ci in v.tableType) {
            items.push({
              //显示的条目
              label: v.tableType[ci].name,
              //选中条目后的返回值
              value: ci,
              //针对每个条目进行特殊的渲染
              renderLabelHtml: function () {
                //这个是希望每个条目的字体是不同的
                return `<div class="edui-label %%-label" style="line-height:20px;">${this.label || ""}</div>`;
              },
            });
          }

          // 创建下拉框
          // eslint-disable-next-line no-undef
          let mulinsertable = new UE.ui.Combox({
            //需要指定当前的编辑器实例
            editor: editor,
            //添加条目
            items: items,
            //当选中时要做的事情
            onselect: function (t, index) {
              let label = this.items[index].value;
              selector.label = label;
              selector.value = index;
              // 拿到选中条目的值
              editor.execCommand(uiName, label);
            },
            //提示
            title: "表格模版",
            //当编辑器没有焦点时，combox默认显示的内容
            initValue: "表格模版",
          });
          //当点到编辑内容上时，按钮要做的状态反射
          editor.addListener(
            "selectionchange",
            function (type, causeByUi, uiReady) {
              if (!uiReady) {
                var state = editor.queryCommandState(uiName);
                if (state == -1) {
                  mulinsertable.setDisabled(true);
                } else {
                  mulinsertable.setDisabled(false);
                  var value = editor.queryCommandValue(uiName);
                  if (!value) {
                    mulinsertable.setValue(uiName);
                    return;
                  }
                  //ie下从源码模式切换回来时，字体会带单引号，而且会有逗号
                  value && (value = value.replace(/['"]/g, "").split(",")[0]);
                  mulinsertable.setValue(value);
                }
              }
            }
          );
          //因为你是添加mulinsertable,所以需要返回这个mulinsertable
          return mulinsertable;
        },
        79 /* 指定添加到工具栏上的哪个位置，默认时追加到最后 */,
        editorId /* 指定这个 UI 是哪个编辑器实例上的，默认是页面上所有的编辑器都会添加这个按钮 */
      );
    },
    // 创建表格
    createTable (value) {
      const tableWay = this.tableType[value] && this.tableType[value].val;
      if (!tableWay) return;
      return tableData[tableWay];
    },
    // 提交资料
    handleData (type, callBack) {
      let list = JSON.parse(JSON.stringify(this.descriptionList));
      let arr = [];
      let { productId, merchantId } = this.productData;
      Object.keys(list).forEach(k => {
        const keywords = list[k].keywords || [];
        const keylist = keywords.map((j) => {
          return j.attrVal;
        });
        list[k].keywords = keylist.toString();
        list[k].productId = productId;
        list[k].merchantId = merchantId;
        arr.push(list[k]);
      });
      this.$Spin.show();
      this.$axios
        .post(api.saveProductDescription, arr)
        .then((res) => {
          if (res.code === 0) {
            if (type === 1) {
              this.confirmVerify();
              // this.$emit('comfirmVerifyText');
            } else {
              typeof callBack != 'function' && this.$Message.success('操作成功~');
            }
          }
          typeof callBack == 'function' && callBack(true);
        })
        .finally(() => {
          this.$Spin.hide();
        }).catch(() => {
          typeof callBack == 'function' && callBack(false);
        })
    },
    // 提交审核
    confirmVerify () {
      this.$Modal.confirm({
        title: '提交审核商品资料',
        content: '<p>确定提交审核商品资料？</p>',
        loading: true,
        onOk: () => {
          let temp = {};
          temp.type = 14;
          temp.productId = this.productData.productId;

          this.$axios
            .post(api.productVerify, temp)
            .then((res) => {
              if (res.code === 0) {
                this.$Message.success('操作成功~');
                this.$emit('closeDialog');
              }
            })
            .finally(() => {
              this.$Modal.remove();
            });
        },
        onCancel: () => {
        }
      });
    },
    // 表格编辑返回内容
    tableEditcontent (html) {
      let editFooter = document.querySelector('.edui-editor-bottomContainer');
      let breadcrumb = editFooter ? editFooter.querySelectorAll('.edui-editor-breadcrumb') : '';
      let spans = breadcrumb ? breadcrumb[0].querySelectorAll('span') : '';
      if (!(spans && spans.length)) return;
      let flag = false;
      spans.forEach(k => {
        ['table', 'tr', 'td'].includes(k.innerText) ? flag = true : '';
      })
      if (flag) {
        this.$Message.error('请把光标移除表格外')
        return;
      }
      // 插入表格内容
      this.editor.execCommand("inserthtml", html);
    },
    //把光标移到末尾
    msgTextLastPos (obj) {
      // 解决浏览器的兼容问题，做如下条件判断
      if (window.getSelection) {
        obj.focus();
        let range = window.getSelection();
        range.selectAllChildren(obj);
        range.collapseToEnd(); //光标移至最后
      }
      else if (document.selection) {
        let range = document.selection.createRange();
        range.moveToElementText(obj);
        range.collapse(false); //光标移至最后
        range.select();
      }
    },
    // 获取商品详情
    getProductDetail (productId) {
      return new Promise((resolve, reject) => {
        this.$axios.get(api.queryLaPaProductGoodsInfo, {
          params: { productId }
        }).then(({ code, datas }) => {
          if (code !== 0) {
            reject(false);
            return;
          }
          // 筛选掉没用的属性
          let laPaProductVariQuotationList = (datas.laPaProductVariQuotationList || []).filter(k => {
            return k.choiceStatus === 0;
          });
          // console.log(laPaProductVariQuotationList, 'laPaProductVariQuotationList');
          //商品多属性(用于尺码图的左侧属性)
          this.$set(this.commodiAttr, "laPaProductVariQuotationList", laPaProductVariQuotationList);
          resolve(datas.attributeValueVOList || []);
        }).catch(err => {
          reject(err);
          this.$Spin.hide();
        });
      })
    },
    //获取属性值
    getAttribute (goodTypeId, attrlist, isFirst) {
      this.$axios.post(api.query_findAttribute, {
        productCategoryId: goodTypeId
      }).then(({ code, datas }) => {
        if (code !== 0) return;
        let tempList = datas && datas.attributeClassifyVOList ? datas.attributeClassifyVOList : [];
        let list = tempList.filter(item => {
          return item.isTitleAndText == 1
        })
        let arr = ["en", "de", "fr", "es", "it", "pt", "cn", "pl"];
        let temp = {};
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
              attributeValueList.forEach(vk => {
                let attributeValueId = vk.attributeValueId;
                if (attrlist.includes(attributeValueId)) {
                  Object.keys(vk).forEach(cvk => {
                    if (oname === cvk.replace('Value', '')) {
                      obj.value.push({ name: vk[cvk], attributeValueId })
                    }
                  })
                }
              })
              if (!temp[oname]) {
                temp[oname] = [];
              }
              obj.value.length ? temp[oname].push(obj) : '';
            }
          })
        })

        // this.$set(this.commodiAttr, "attributeClassifyVOList", list);//作用于生成尺码图(先不要删)

        // 第一次将商品属性填入文本
        if (!isFirst) return;
        Object.keys(this.descriptionList).forEach(k => {
          Object.keys(temp).forEach(vk => {
            if (vk == this.descriptionList[k].attrLanguage) {
              let attr = ""
              let attr2 = ""
              temp[vk].forEach(resa => {
                if (resa.attr == "") return
                let arr = []
                resa.value.forEach(resb => {
                  if (resb.name == "") return;
                  arr.push(resb.name)
                  this.descriptionList[k].keywords.push({ attrVal: resb.name })
                })
                let arrName = resa.attr + ":" + arr.join("/")
                attr = `${attr}<p>${arrName}</p>`;
                attr2 = arrName + "\n" + attr2;
              })

              let textArr = ["description", "simpleDescription", "highlightDescription", "packageDescription", "mobileDescription"];
              this.descriptionList[k].textDescription = attr2;
              textArr.forEach(item => {
                this.descriptionList[k][item] = attr;
              })

              this.keyWords = this.descriptionList[this.languageType].keywords || [];//设置关键字
            }
          })
        })
        let item = this.descriptionList[this.languageType];
        this.setContent(item);

      }).finally(() => {
        this.$Spin.hide();
      })
    },
    // 生成尺码图
    generatePic (e) {
      if (!e) return;
      this.planType = e;
      let obj = { 1: 'sizeVisible', 2: 'childVisible', 3: 'childVisible', 4: 'sizeVisible' };
      this[obj[e]] = true;
    },
    // 向对应语言的复杂描述插入尺码模板
    insetDescription (data) {
      if (this.$common.isEmpty(this.descriptionList[data.tabName])) return;
      let divDemo = document.createElement('div');
      divDemo.id = `${data.tableId}-content`;
      divDemo.style.position = 'absolute';
      divDemo.style.zIndex = '-10';
      divDemo.style.width = '100vw';
      divDemo.style.height = '100vh';
      divDemo.style.top = '100vh';
      divDemo.innerHTML = this.descriptionList[data.tabName].description;
      document.body.appendChild(divDemo);
      this.$nextTick(() => {
        const tableHtml = divDemo.querySelector(`#${data.tableId}`);
        if (tableHtml) {
          tableHtml.remove();
          this.descriptionList[data.tabName].description = divDemo.innerHTML + data.html;
        } else {
          this.descriptionList[data.tabName].description += data.html;
        }
        divDemo.remove();
        if (this.languageType == data.tabName) {
        // 插入描述
          this.setContent(this.descriptionList[this.languageType]);
        }
      });
    }
  },
  computed: {
    isChecked () {
      let lev = "";
      this.descriptionGrade.forEach((item) => {
        if (item.checked) lev = item.value;
      });
      return lev;
    },
    // 是否可编辑
    permissionStatus () {
      let userInfo = this.$store.state.erpConfig && this.$store.state.erpConfig.userInfo;
      let data = this.productData;
      let status = false;
      if (data.textCompleteBy && data.textCompleteBy === userInfo.userId) status = true;
      if ((!data.textCompleteBy) && data.requireVerifyBy === userInfo.userId) status = true;
      return this.productData.status === 5 && this.productData.textVerifyStatus === 1 && status && this.openType !== 'view' && this.btnoperat === 'finishData';
    }
  },
  watch: {
    description () {// 保存描述
      const languageType = this.languageType;
      if (!this.descriptionList[languageType]) return;
      this.descriptionList[languageType][this.isChecked] = this.getContent();
    },
  },
};
</script>
<style lang="less" scoped>
.text-label {
  width: 66px;
  display: inline-block;
  float: left;
  line-height: 32px;
}
.tabs-textmaterial {
  position: relative;
  .tabs-btnpos {
    position: absolute;
    top: 0;
    right: 0;
  }
}
</style>