<template>
  <div class="pb100" style="padding: 0 20px 20px;">
    <Tabs :value="saveName" @on-click="tabClick">
      <TabPane label="英语" name="EN"></TabPane>
      <TabPane label="德语" name="GER"></TabPane>
      <TabPane label="法语" name="FRA"></TabPane>
      <TabPane label="西班牙语" name="SPN"></TabPane>
      <TabPane label="意大利语" name="IT"></TabPane>
      <TabPane label="葡萄牙语" name="POR"></TabPane>
      <TabPane label="中文" name="CN"></TabPane>
    </Tabs>
    <p>
      <span class="text-label">标题：</span>
      <Input style="width: 540px" v-model="desTitle" :maxlength="100" clearable :disabled="
          ($store.state.curNodeId !== 0 &&
            $store.state.descriptionCurNodeId !== 1) ||
          $store.state.curNodeControl !== 999
        " @on-blur="saveDescript" placeholder="最大长度为100" />
    </p>
    <p class="mt10">
      <span class="text-label">关键词：</span>
      <local-tag-input style="width: 540px; display: inline-block" :disabled="
          ($store.state.curNodeId !== 0 &&
            $store.state.descriptionCurNodeId !== 1) ||
          $store.state.curNodeControl !== 999
        " :tags="keyWords"></local-tag-input>
    </p>
    <ButtonGroup class="mt10 mb10">
      <Button v-for="(item, index) in descriptionGrade" :key="index" :class="{ 'ivu-btn-primary': item.checked }" @click="
          tagStepBtn(item, descriptionGrade);
          changeDescription(item);
        ">{{ item.text }}</Button>
    </ButtonGroup>
    <Input v-show="isChecked === 'textDescription'" :disabled="
        ($store.state.curNodeId !== 0 &&
          $store.state.descriptionCurNodeId !== 1) ||
        $store.state.curNodeControl !== 999
      " type="textarea" :autosize="{ minRows: 12, maxRows: 12 }" :maxlength="65536" v-model="simDes" @on-change="changeTextarea" placeholder="请输入..." />
    <div v-show="isChecked !== 'textDescription'">
      <vue-ueditor-wrap v-model="description" :config="myConfig" @ready="ueReady" @before-init="addCustomButtom">
      </vue-ueditor-wrap>
    </div>

    <!-- 表格弹框 -->
    <table-edit :isVisible.sync="isVisible" :type="type" @tableEditcontent="tableEditcontent"></table-edit>
  </div>
</template>

<script>
import api from "@/api/api";
import CommonMixin from "@/components/mixin/commonMixin";
import VueUeditorWrap from "vue-ueditor-wrap";
import tableData from "../utils/tableData";
import tableEdit from "@/components/tableEdit";
/**
 * *** UE编辑器 修改了ueditor.all.min js
 *
 * */
export default {
  name: "description", // 详细描述
  mixins: [CommonMixin],
  components: { VueUeditorWrap, tableEdit },
  data () {
    return {
      myConfig: {
        UEDITOR_HOME_URL: "./static/ueditor/", // 你的UEditor资源存放的路径,相对于打包后的index.html
        autoHeightEnabled: false, // 编辑器是否自动被内容撑高
        autoFloatEnabled: false, // 工具栏是否可以浮动
        initialFrameHeight: 240, // 初始容器高度
        initialFrameWidth: "100%", // 初始容器高度
        serverUrl: api.ueditorEnter,
        enableAutoSave: false, // 自动保存
        scaleEnabled: true, //设置自动调整高度
        zIndex: 9999,
      },
      keyWords: [],
      grade: "",
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
      ],
      descriptionList: [
        {
          description: "", // 复杂描述
          simpleDescription: "", // 建议描述
          textDescription: "", // 纯文本描述
          highlightDescription: "", // 亮点描述
          packageDescription: "", // 包裹描述
          keywords: null,
          language: "EN",
          title: "",
        },
        {
          description: "", // 复杂描述
          simpleDescription: "", // 建议描述
          textDescription: "", // 纯文本描述
          highlightDescription: "", // 亮点描述
          packageDescription: "", // 包裹描述
          keywords: null,
          language: "GER",
          title: "",
        },
        {
          description: "", // 复杂描述
          simpleDescription: "", // 建议描述
          textDescription: "", // 纯文本描述
          highlightDescription: "", // 亮点描述
          packageDescription: "", // 包裹描述
          keywords: null,
          language: "FRA",
          title: "",
        },
        {
          description: "", // 复杂描述
          simpleDescription: "", // 建议描述
          textDescription: "", // 纯文本描述
          highlightDescription: "", // 亮点描述
          packageDescription: "", // 包裹描述
          keywords: null,
          language: "SPN",
          title: "",
        },
        {
          description: "", // 复杂描述
          simpleDescription: "", // 建议描述
          textDescription: "", // 纯文本描述
          highlightDescription: "", // 亮点描述
          packageDescription: "", // 包裹描述
          keywords: null,
          language: "IT",
          title: "",
        },
        {
          description: "", // 复杂描述
          simpleDescription: "", // 建议描述
          textDescription: "", // 纯文本描述
          highlightDescription: "", // 亮点描述
          packageDescription: "", // 包裹描述
          keywords: null,
          language: "POR",
          title: "",
        },
        {
          description: "", // 复杂描述
          simpleDescription: "", // 建议描述
          textDescription: "", // 纯文本描述
          highlightDescription: "", // 亮点描述
          packageDescription: "", // 包裹描述
          keywords: null,
          language: "CN",
          title: "",
        },
      ],
      desIndex: 0,
      isShowDescription: false,
      demandLang: "",
      desTitle: "", // 'EN'英语，'GER'德语，'FRA'法语，'SPN'西班牙语，'IT'意大利语，'POR'葡萄牙语，'CN'中文
      langList: [
        {
          value: "CN",
          label: "中文",
        },
        {
          value: "EN",
          label: "英语",
        },
        {
          value: "FRA",
          label: "法语",
        },
        {
          value: "GER",
          label: "德语",
        },
        {
          value: "SPN",
          label: "西班牙语",
        },
        {
          value: "IT",
          label: "意大利语",
        },
        {
          value: "POR",
          label: "葡萄牙语",
        },
      ],
      description: "",
      simDes: "",
      saveDesc: [
        {
          description: "",
          language: "",
          title: "",
        },
      ],
      saveName: "EN",
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
      type: 0
    };
  },
  props: {
    open: {
      type: Boolean,
    },
  },
  methods: {
    ueReady (editorInstance) {
      let v = this;
      v.$nextTick(function () {
        v.editor = editorInstance;
        let userInfo = v.$store.state.erpConfig.userInfo;
        v.editor.execCommand("serverparam", {
          basePath: "/pds-service",
          userId: userInfo.merchantId + "," + userInfo.userId,
        });
        if (
          (v.$store.state.curNodeId !== 0 &&
            v.$store.state.descriptionCurNodeId !== 1) ||
          v.$store.state.curNodeControl !== 999
        ) {
          editorInstance.setDisabled("fullscreen");
        }
        editorInstance.addListener("contentChange", () => {
          v.description = editorInstance.getContent();
          v.saveDescript();
        });
      });
    },
    setContent (data) {
      /**
       * 设置值
       * */
      this.description = data;
      this.editor.setContent(data);
    },
    getContent () {
      /**
       * 获取值
       * */
      return this.editor.getContent();
    },
    changeTextarea () {
      /**
       * 简单描述 changes
       * */
      let v = this;
      v.saveDescript();
    },
    changeDescription (data) {
      /**
       * 描述切换
       * */
      let v = this;
      v.descriptionList.forEach((item) => {
        if (item.language === v.saveName) {
          v.setKeyword(item);
          if (v.isChecked === "textDescription") {
            v.simDes = item[data.value];
          } else {
            v.setContent(item[data.value]);
          }
        }
      });
    },
    setKeyword (data) {
      let v = this;
      if (data.keywords === null) {
        v.keyWords = [];
      } else {
        let arr = [];
        JSON.parse(data.keywords).forEach((item) => {
          arr.push({ attrVal: item.keyword });
        });
        v.keyWords = arr;
      }
    },
    tabClick (name) {
      let v = this;
      v.saveName = name;
      v.descriptionGrade.forEach((item, index) => {
        index === 0 ? (item.checked = true) : (item.checked = false);
      });
      v.descriptionList.forEach((item) => {
        if (item.language === name) {
          v.setKeyword(item);
          v.desTitle = item.title;
          if (v.isChecked === "textDescription") {
            v.simDes = item.textDescription;
          } else {
            v.setContent(item.description);
          }
        }
      });
    },
    saveDescript () {
      let v = this;
      v.descriptionList.forEach((item) => {
        if (item.language === v.saveName) {
          if (v.isChecked === "textDescription") {
            item[v.isChecked] = v.simDes;
          } else {
            item[v.isChecked] = v.getContent();
          }

          // item.description = v.$refs.descriptionRichText.content;
          item.title = v.desTitle;
        }
      });
    },
    richTextContent (data) {
      let v = this;
      v.description = data;
      v.saveDescript();
    },
    // 保存描述
    save () {
      return new Promise((resolve, reject) => {
        let [v, param, saveDesc, vaild, vaildKey] = [
          this,
          [],
          null,
          true,
          true,
        ];
        saveDesc =
          typeof v.saveDesc !== "object" ? JSON.parse(v.saveDesc) : v.saveDesc;

        v.descriptionList.forEach((item, index) => {
          if (index < saveDesc.length) {
            if (
              item.title !== saveDesc[index].title ||
              item.language !== saveDesc[index].language ||
              item.description !== saveDesc[index].description
            ) {
              item.productId = v.$store.state.createId;
              param.push(item);
            }
          } else {
            item.productId = v.$store.state.createId;
            param.push(item);
          }
        });

        v.descriptionList.forEach((item) => {
          if (item.description !== "") {
            if (item.title === "") {
              item.title = "title";
            }
          }
        });

        if (param.length > 0) {
          let messageLang = [];
          param.forEach((item) => {
            if (item.keywords && item.keywords.length > 300) {
              v.langList.forEach((lang) => {
                if (lang.value === item.language) {
                  messageLang.push(lang.label);
                }
              });
              vaildKey = false;
            }
          });
          if (!vaildKey) {
            v.$msg.error({
              content:
                "描述保存失败!" + messageLang.join(",") + "关键词内容太长",
              duration: 5,
            });
            resolve();
            return;
          }

          param.forEach((item) => {
            if (item.description && item.description.length > 65536) {
              v.langList.forEach((lang) => {
                if (lang.value === item.language) {
                  messageLang.push(lang.label + "复杂描述");
                }
              });
              vaild = false;
            }
            if (
              item.simpleDescription &&
              item.simpleDescription.length > 65536
            ) {
              v.langList.forEach((lang) => {
                if (lang.value === item.language) {
                  messageLang.push(lang.label + "简易描述");
                }
              });
              vaild = false;
            }
            if (
              item.highlightDescription &&
              item.highlightDescription.length > 65536
            ) {
              v.langList.forEach((lang) => {
                if (lang.value === item.language) {
                  messageLang.push(lang.label + "亮点描述");
                }
              });
              vaild = false;
            }
            if (
              item.packageDescription &&
              item.packageDescription.length > 65536
            ) {
              v.langList.forEach((lang) => {
                if (lang.value === item.language) {
                  messageLang.push(lang.label + "包裹描述");
                }
              });
              vaild = false;
            }
          });

          if (!vaild) {
            v.$msg.error({
              content: "描述保存失败!" + messageLang.join(",") + "描述过长",
              duration: 5,
            });
            resolve();
            return;
          }

          v.$axios
            .post(api.saveProductDescription, param)
            .then((res) => {
              if (res.code === 0) {
                resolve();
                v.queryDescriptionMt();
                // if (callback) {
                //   //   callback({
                //   //     success: "详细描述保存成功",
                //   //   });
                //   // } else {
                //   v.$msg.success("详细描述保存成功");
                // }
              } else if (res.code === -2) {
                v.$msg.error("详细描述过长");
                reject();
              } else {
                v.$msg.error("详细描述保存失败");
                reject();
              }
            })
            .catch(() => {
              reject();
              // if (callback) {
              //   callback("请求出错");
              // } else {
              v.$msg.error("请求出错");
              // }
            });
        } else {
          resolve();
        }
      });
    },
    // 查询描述信息
    queryDescriptionMt (callback) {
      let v = this;
      v.$axios
        .get(api.queryDescription + "?productId=" + v.$store.state.createId)
        .then((res) => {
          if (res && res.code === 0) {
            if (res.datas.length === 0) {
              v.descriptionList = [
                {
                  description: "",
                  language: "EN",
                  title: "",
                },
                {
                  description: "",
                  language: "GER",
                  title: "",
                },
                {
                  description: "",
                  language: "FRA",
                  title: "",
                },
                {
                  description: "",
                  language: "SPN",
                  title: "",
                },
                {
                  description: "",
                  language: "IT",
                  title: "",
                },
                {
                  description: "",
                  language: "POR",
                  title: "",
                },
                {
                  description: "",
                  language: "CN",
                  title: "",
                },
              ];
              v.saveDesc = [
                {
                  description: "",
                  language: "",
                  title: "",
                },
              ];
            } else {
              v.descriptionList = res.datas;
              callback && callback(res.datas);
            }
          }
        });
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
              if (v.saveName === 'EN') {
                v.isVisible = true;
                v.type = Number(value);
              } else {
                // 插入表格内容
                this.execCommand("inserthtml", v.createTable(value));
              }
            },
            queryCommandValue: function () {
              return selector.label; // 查询结果并返回
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

          //创建下拉框
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
              //拿到选中条目的值
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
    // 表格编辑返回内容
    tableEditcontent (html) {
      // 插入表格内容
      this.editor.execCommand("inserthtml", html);
    }
  },
  computed: {
    isChecked () {
      let v = this;
      let lev = "";
      v.descriptionGrade.forEach((item) => {
        if (item.checked) lev = item.value;
      });
      return lev;
    },
  },
  watch: {
    open (n, o) {
      if (n && n !== o) {
        let v = this;
        v.$nextTick(() => {
          if (
            (v.$store.state.curNodeId !== 0 &&
              v.$store.state.descriptionCurNodeId !== 1) ||
            v.$store.state.curNodeControl !== 999
          ) {
            v.editor.setDisabled("fullscreen");
          } else {
            v.editor.setEnabled();
          }
        });
      }
    },
    description (n, o) {
      if (n && n !== o) {
        this.saveDescript();
      }
    },
    keyWords () {
      let v = this;
      let arr = [];
      v.keyWords.forEach((item) => {
        arr.push({ keyword: item.attrVal });
      });
      v.descriptionList.forEach((item) => {
        if (item.language === v.saveName) {
          if (arr.length === 0) {
            item.keywords = null;
          } else {
            item.keywords = JSON.stringify(arr);
          }
        }
      });
    }
  },
};
</script>

<style scoped>
.text-label {
  width: 56px;
  display: inline-block;
  float: left;
  line-height: 32px;
}
</style>
