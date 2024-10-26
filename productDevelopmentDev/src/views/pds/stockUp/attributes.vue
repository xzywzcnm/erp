<template>
  <div class="insideBox">
    <ButtonGroup v-show="
        ($store.state.curNodeId === 0 || $store.state.curNodeId === 3) &&
        $store.state.curNodeControl === 999
      ">
      <Button
        type="primary"
        @click="openEditAttr"
      >编辑多属性</Button>
      <Button
        type="primary"
        style="margin-left: 10px"
        @click="addProductMethod"
      >新增子产品
      </Button>
      <Button
        type="primary"
        style="margin-left: 10px"
        @click="batchDelete"
      >批量删除</Button>
    </ButtonGroup>
    <ButtonGroup v-show="erpProductIdTalg">
      <Button
        type="primary"
        @click="openEditAttr"
      >编辑多属性</Button>
      <Button
        type="primary"
        style="margin-left: 10px"
        @click="addProductMethod"
      >新增子产品</Button>
    </ButtonGroup>
    <p v-show="
        $store.state.curNodeId === 3 && $store.state.curNodeControl === 999
      ">
      <span
        class="red"
        style="line-height: 20px"
      >修改多属性之后将会影响多属性报价</span>
    </p>
    <Table
      class="mt15 mb10"
      height="350"
      :columns="attributeColumns"
      highlight-row
      :data="attributeDate"
      @on-selection-change="checkDate"
      :loading="tableLoading"
    ></Table>
    <Modal
      v-model="editAttr"
      title="编辑多属性"
      width="640"
      class="clearMarginAuto"
      :mask-closable="false"
    >
      <p
        slot="header"
        @mousedown="moveMt"
        class="moveHead"
      >
        <span>编辑多属性</span>
      </p>
      <div>
        <Button
          class="mb10"
          @click="addAttrs"
          v-show="!erpProductIdTalg"
        >新增多属性</Button>
      </div>
      <Form
        ref="formAttrs"
        :model="CreateProductVariParam"
        class="demandForm"
      >
        <Row>
          <Col span="6">
          <span class="modalTit">属性名</span>
          </Col>
          <Col span="17">
          <span class="modalTit">属性值</span>
          </Col>
        </Row>
        <Row
          v-for="(item, pIndex) in CreateProductVariParam.item"
          :key="pIndex"
        >
          <Col
            span="6"
            style="padding: 10px 10px 10px 0"
          >
          <FormItem
            :prop="'item.' + pIndex + '.key'"
            :rules="{
                required: true,
                message: '' + '属性名不能为空' + '',
                trigger: 'blur',
              }"
          >
            <div>
              <Input
                placeholder="属性名"
                :disabled="erpProductIdTalg"
                v-model.trim="item.key"
              />
            </div>
          </FormItem>
          </Col>
          <Col
            span="17"
            style="padding: 10px 10px 10px 0"
          >
          <local-tag-input
            :tags="item.val"
            @tagsMt="tagsMt(item.val)"
          ></local-tag-input>
          <!--<div>
              <span class="modalTit" style="padding-left: 15px;">属性值
                <Input
                  size="small"
                  placeholder="enter添加属性"
                  v-model="item.defaultVal"
                  class="ml5 "
                  @on-enter="addAttr(pIndex,item.defaultVal)"
                  style="width: 100px;"/><Button size="small" type="primary" class="ml5"
                                                 @click="addAttr(pIndex,item.defaultVal)">添加属性</Button></span>
              <Row>
                <Col span="5"
                     class="attrItem"
                     v-for="(child,index) in item.val"
                     :key="index"
                     offset="1">
                  <FormItem :class="{'ivu-form-item-error':child.valid}">
                    <Input
                      @on-keyup.alt.8="delAttr(pIndex,index)"
                      @on-blur="attrBlurVaild(pIndex,index,child.attrVal)"
                      placeholder="属性值"
                      v-model="child.attrVal"
                    />
                    <Icon type="close-circled" class="closeAttr" @click="delAttr(pIndex,index)"></Icon>
                    <div class="ivu-form-item-error-tip" v-show="child.valid">属性值不能为空</div>
                  </FormItem>
                </Col>
              </Row>
            </div>-->
          </Col>
          <Icon
            type="ios-close-empty"
            class="closeAttr1"
            @click="delAttrCol(pIndex)"
          ></Icon>
        </Row>
        <FormItem label="是否重新生成">
          <i-switch
            title="属性值删除或者增加属性分类必须重新生成"
            v-model="CreateProductVariParam.status"
            :disabled="isDisabled || erpProductIdTalg"
          ></i-switch>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button
          type="text"
          @click="editAttr = false"
        >取消</Button>
        <Button
          type="primary"
          :loading="btnLoading"
          @click="submitAttrBtn"
        >确定</Button>
      </div>
    </Modal>
    <Modal
      v-model="addProduct"
      title="新增子产品"
      class="clearMarginAuto attrBut"
      width="640"
    >
      <p
        slot="header"
        @mousedown="moveMt"
        class="moveHead"
      >
        <span>新增子产品</span>
      </p>
      <div v-if="variationListS.items.length === 0">暂无子产品添加</div>
      <Form>
        <FormItem
          v-for="(item, index) in variationListS.items"
          :key="index"
          :label="item.variType.variTypeName"
        >
          <dyt-select
            style="width: 200px"
            v-model="item.value"
            filterable
            @on-change="addProductVaild(index, item)"
          >
            <Option
              v-for="(child, index) in item.variationList"
              :key="index"
              :value="child.sortNo"
              :label="child.variationName"
            >{{ child.variationName }}
            </Option>
          </dyt-select>
          <div
            class="ivu-form-item-error-tip"
            style="margin-left: 90px"
            v-show="item.valid"
          >
            请选择属性值
          </div>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button
          type="text"
          @click="addProduct = false"
        >取消</Button>
        <Button
          type="primary"
          @click="addProductBtn"
        >确定</Button>
      </div>
    </Modal>
    <Modal
      v-model="modal1"
      title="设置主属性图"
      width="800"
    >
      <Card
        class="setMainImg"
        dis-hover
      >
        <span v-show="!imgList.length">无可使用橱窗图片</span>
        <CheckboxGroup v-model="checkImg">
          <Row>
            <Col
              span="6"
              v-for="(item, index) in imgList"
              class="setMainImgItem"
              :key="index"
            >
            <Checkbox :label="index">
              <img
                :src="item.pictureUrl"
                width="100%"
              />
            </Checkbox>
            </Col>
          </Row>
        </CheckboxGroup>
      </Card>
      <div slot="footer">
        <Button
          type="text"
          @click="modal1 = false"
        >取消</Button>
        <Button
          type="primary"
          v-show="$store.state.pictureCurNodeId === 1"
          @click="addTableMainImg"
        >确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from "@/api/api";
import commonMixix from "../../../components/mixin/commonMixin";

export default {
  name: "attributes",
  mixins: [commonMixix],
  data() {
    return {
      modal1: false,
      activeRow: null,
      checkImg: [],
      isMainAttrText: "",
      setActiveMainImg: 0,
      attrMainVarId: "", // 保存属性图片  variationId
      checkedData: [],
      tableLoading: false,
      btnLoading: false,
      editAttr: false,
      addProduct: false,
      isDel: false, // 是否有删除属性
      attributeColumns: [],
      attributeDate: [],
      CreateProductVariParam: {
        item: [
          {
            key: "",
            defaultVal: "",
            val: [],
          },
        ],
        status: true,
      },
      variationList: {
        items: [],
      }, // 多属性
      variationListS: {
        items: [],
      },
      saveList: [], //保留原属性列表
    };
  },
  components: {},
  computed: {
    isShowMainImg() {
      let v = this;
      // 展示多属性图片
      return v.$store.state.curNodeId > 5;
    },
    imgList() {
      let v = this;
      if (v.$store.state.imgList) {
        return v.$store.state.imgList.filter((item) => {
          // 可使用图片 橱窗图片
          if (
            (item.pictureType === 0 || item.pictureType === "0") &&
            (item.isAcquired === 0 || item.isAcquired === "0")
          ) {
            return item;
          }
        });
      }
      return []
    },
    // 检测属性值删除或者增加
    isDisabled() {
      let v = this;
      let vaild = false;
      if (v.saveList.length > 0) {
        let oldVal = JSON.parse(v.saveList);
        if (v.CreateProductVariParam.item.length !== oldVal.length) {
          vaild = true;
          return vaild;
        }
      }
      if (v.isDel) {
        vaild = true;
      }
      if (vaild) {
        v.CreateProductVariParam.status = true;
      }
      return vaild;
    },
    erpProductIdTalg() {
      let talg = false;
      if (
        this.$store.state.baseInfo.erpProductId &&
        this.$store.state.baseInfo.erpProductId !== null
      ) {
        talg = true;
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.CreateProductVariParam.status = false;
      }
      return talg;
    },
  },
  methods: {
    addTableMainImg() {
      let v = this;
      let arr = [];
      if (v.isMainAttrText === null) {
        v.$msg.error("请先设置主属性");
        return;
      }
      let index = null; // 注意！variTypeNameList: ["分类1", "分类2"]  variationNameList: ["黑外套", "S"] 那么黑外套属于分类1 S属于分类2。没有id匹配
      let nowAttr;
      v.attributeDate[0].variTypeNameList.forEach((i, ind) => {
        if (i === v.isMainAttrText) {
          index = ind;
        }
      });
      nowAttr = v.activeRow.variationNameList[index];
      v.imgList.forEach((i, ind) => {
        v.checkImg.forEach((item) => {
          if (+item === ind) {
            arr.push(i);
          }
        });
      });
      v.attributeDate.forEach((item) => {
        if (item.variationNameList.indexOf(nowAttr) > -1) {
          item.variationPictureMapList[index].variationPictureList = arr;
        }
      });
      let params = [];
      arr.forEach((i) => {
        params.push({
          pictureId: i.pictureId, // 选择的图片有Id时必需传
          pictureUrl: i.pictureUrl, // 必需
          productId: v.$store.state.createId, // 必需
          variationId: v.activeRow.variationPictureMapList[index].variationId, // 必需
        });
      });
      v.saveMainImg(params, "设置成功").then(() => {
        v.modal1 = false;
      });
    },
    saveMainImg(params, message) {
      let v = this;
      // 保存主属性图片和删除主属性图片都是这个接口
      return new Promise((resolve) => {
        v.$axios
          .post(api.saveVariationPictureList, params)
          .then((res) => {
            if (res.code === 0) {
              v.$msg.success(message);
              resolve();
            }
          })
          .catch(() => {});
      });
    },
    checkDate(data) {
      this.checkedData = data;
    },
    // 批量删除
    batchDelete() {
      let v = this;
      if (!v.checkedData.length) {
        v.$msg.error({
          content: "未选择删除数据",
        });
        return;
      }
      let arr = [];
      v.checkedData.forEach((item) => {
        arr.push({
          productId: v.$store.state.createId,
          productGoodsId: item.productGoodsId,
        });
      });
      v.isDelModal(() => {
        v.$axios.post(api.removeProductGoodsList, arr).then((res) => {
          if (res.code === 0) {
            v.$msg.success("删除成功");
            v.getVariList();
            v.checkedData = [];
          }
        });
      });
    },
    // validateVal(rule, value, callback) {},
    // eslint-disable-next-line no-unused-vars
    tagsMt(val, item) {
      item = val;
    },
    addAttr(index, val) {
      let v = this;
      v.CreateProductVariParam.item[index].val.push({
        attrVal: val,
      });
      v.CreateProductVariParam.item[index].defaultVal = "";
    },
    openEditAttr() {
      this.isDel = false;
      this.editAttr = true;
      this.getQueryVariTypeM();
    },
    // 新增子产品提交
    addProductBtn() {
      let v = this;
      let valid = true;
      let arr = [];
      let talg = [];
      let variationNameList = [];
      if (v.variationListS.items.length === 0) {
        v.addProduct = false;
        return;
      }
      v.variationListS.items.forEach((item, index) => {
        if (item.value === "") {
          v.$set(v.variationListS.items[index], "valid", true);
        } else {
          v.$set(v.variationListS.items[index], "valid", false);
        }
      });
      v.variationListS.items.some((item) => {
        if (item.valid) {
          valid = false;
          return true;
        }
      });
      v.variationListS.items.forEach((item) => {
        if (item.value !== "") {
          arr.push(item.value);
        }
        if (item.variationList.length > 0) {
          talg.push({
            productId: item.variationList[item.value].productId,
            variTypeId: item.variationList[item.value].variTypeId,
            variationName: item.variationList[item.value].variationName,
          });
          variationNameList.push(item.variationList[item.value].variationName);
        }
      });
      v.attributeDate.some((item) => {
        if (item.sortNoList.join("") === arr.join("")) {
          valid = false;
          v.$msg.info("子产品已存在");
          return true;
        }
      });
      if (arr.length === 0) {
        v.$msg.info("请选择数据");
        return;
      }
      if (v.erpProductIdTalg && valid) {
        this.$store.commit("editTalg", true);
        let item = {
          editTalg: true,
          goodsPrice: "",
          goodsSku: "",
          goodsWeight: "",
          productId: v.$store.state.createId,
          imgList: [],
          sortNoList: arr,
          isMainAttr: false,
          index: v.attributeDate.length + 1,
          variationNameList: variationNameList,
          variTypeNameList: v.attributeDate[0].variTypeNameList,
          variationPictureMapList: talg,
        };
        v.attributeDate.push(item);
        v.addProduct = false;
        v.$msg.success("添加成功");
        let attrColumns = [];
        v.attributeDate[0].variTypeNameList.forEach((item, index) => {
          v.variationList.items.push({
            label: item,
            value: "",
            valid: false,
          });
          attrColumns.push({
            key: "editText",
            align: "center",
            minWidth: 120,
            title: item,
            index: index,
            render: (h, params) => {
              return h(
                "div",
                {
                  attrs: {
                    class: (() => {
                      return v.isMainAttrText ===
                        params.row.variTypeNameList[index]
                        ? "mainAttr"
                        : "";
                    })(),
                  },
                },
                params.row.variationNameList[index]
              );
            },
          });
        });
        let columns = [
          {
            title: "序号",
            width: 60,
            align: "center",
            key: "index",
            fixed: "left",
          },
          {
            align: "center",
            title: "sku",
            width: 120,
            render: (h, params) => {
              if (params.row.editTalg) {
                return h("Input", {
                  props: {
                    value: params.row.goodsSku,
                  },
                  on: {
                    "on-change": (event) => {
                      let query = event.target.value;
                      v.$set(v.attributeDate[params.index], "goodsSku", query);
                    },
                  },
                });
              } else {
                return h("div", params.row.goodsSku);
              }
            },
          },
          {
            align: "center",
            width: 100,
            title: "重量",
            render: (h, params) => {
              if (params.row.editTalg) {
                return h("Input", {
                  props: {
                    type: "number",
                    value: params.row.goodsWeight,
                  },
                  on: {
                    "on-change": (event) => {
                      let query = event.target.value;
                      v.$set(
                        v.attributeDate[params.index],
                        "goodsWeight",
                        query
                      );
                    },
                  },
                });
              } else {
                return h("div", params.row.goodsWeight);
              }
            },
          },
          {
            align: "center",
            width: 100,
            title: "价格",
            render: (h, params) => {
              if (params.row.editTalg) {
                return h("Input", {
                  props: {
                    type: "number",
                    value: params.row.goodsPrice,
                  },
                  on: {
                    "on-change": (event) => {
                      let query = event.target.value;
                      v.$set(
                        v.attributeDate[params.index],
                        "goodsPrice",
                        query
                      );
                    },
                  },
                });
              } else {
                return h("div", params.row.goodsPrice);
              }
            },
          },
        ];
        let options = [
          {
            key: "enableFlag",
            align: "center",
            width: 80,
            fixed: "right",
            title: "操作",
            render: (h, params) => {
              if (params.row.editTalg) {
                return h("div", {
                  style: {
                    color: "#169BD5",
                    cursor: "pointer",
                  },
                  domProps: {
                    innerHTML: "删除",
                  },
                  on: {
                    click() {
                      v.$store.commit("editTalg", false);
                      v.attributeDate.splice(params.index, 1);
                    },
                  },
                });
              }
            },
          },
        ];
        v.attributeColumns = [...columns, ...attrColumns, ...options];
      }

      if (valid && !v.erpProductIdTalg) {
        v.$axios
          .post(api.createProductGoods, [
            {
              productId: v.$store.state.createId,
              sortNoList: arr,
            },
          ])
          .then((res) => {
            if (res.code === 0) {
              v.addProduct = false;
              v.getVariList();
              v.$msg.success("添加成功");
            }
          })
          .catch(() => {
            v.tableLoading = false;
          });
      }
    },
    // 新增子产品
    addProductMethod() {
      this.getQueryVariTypeM();
      this.addProduct = true;
    },
    addAttrs() {
      let v = this;
      v.CreateProductVariParam.item.push({
        key: "",
        defaultVal: "",
        val: [],
      });
    },
    delAttr(pIndex, index) {
      let v = this;
      v.CreateProductVariParam.item[pIndex].val.splice(index, 1);
      v.isDel = true;
    },
    delAttrCol(pIndex) {
      let v = this;
      v.CreateProductVariParam.item.splice(pIndex, 1);
      v.isDel = true;
    },
    attrBlurVaild(pIndex, index, item) {
      let v = this;
      if (item === "") {
        v.$set(v.CreateProductVariParam.item[pIndex].val[index], "valid", true);
      } else {
        v.$set(
          v.CreateProductVariParam.item[pIndex].val[index],
          "valid",
          false
        );
      }
    },
    // 提交属性
    submitAttrBtn() {
      let v = this;
      let arr = v.CreateProductVariParam.item;
      if (!arr.length) {
        v.btnLoading = true;
        v.$axios
          .post(api.deleteVariInfo + "?productId=" + v.$store.state.createId)
          .then((res) => {
            if (res.code === 0) {
              v.editAttr = false;
              v.getVariList();
              // v.getQueryVariTypeM();
            }
          })
          .finally(() => {
            v.btnLoading = false;
          });
        return;
      }
      /* arr.forEach((item, pIndex) => {
       item.val.forEach((child, index) => {
       v.attrBlurVaild(pIndex, index, child.attrVal);
       });
       }); */
      v.$refs.formAttrs.validate((valid) => {
        let valValid = true;
        // 属性值验证
        /* arr.some((item, pIndex) => {
         item.val.some((child, index) => {
         if (child.valid) {
         valValid = false;
         return true;
         }
         });
         }); */
        if (valid && valValid) {
          let CreateProductVariParam = v.fixVariParam(arr);
          v.btnLoading = true;
          v.$axios
            .post(api.createOrModifyVari, CreateProductVariParam)
            .then((res) => {
              if (res.code === 0) {
                v.editAttr = false;
                v.getVariList();
                // v.getQueryVariTypeM();
              }
            })
            .finally(() => {
              v.btnLoading = false;
            });
        }
      });
    },
    // 处理需要提交的属性数据格式
    fixVariParam(data) {
      let v = this;
      let CreateProductVariParam = [];
      let arr = data.filter((item) => {
        return item.val.length > 0;
      });
      if (arr.length > 0) {
        arr.forEach((item) => {
          let obj = {};
          obj.productId = v.$store.state.createId;
          obj.status = v.CreateProductVariParam.status ? "Y" : "N";
          obj.productVariType = {};
          obj.productVariType.variTypeName = item.key;
          obj.productVariType.variTypeId = item.variTypeId;
          obj.variationList = [];
          item.val.forEach((child) => {
            let obj1 = {
              variationName: child.attrVal,
              variTypeId: item.variTypeId,
              variationId: child.variationId,
            };
            obj.variationList.push(obj1);
          });
          CreateProductVariParam.push(obj);
        });
      }
      return CreateProductVariParam;
    },
    // 查询多属性分类信息
    getQueryVariTypeM() {
      let v = this;
      v.isMainAttrText = ""; // 清空
      return new Promise((resolve) => {
        v.$axios
          .get(api.getQueryVariType + "?productId=" + v.$store.state.createId)
          .then((res) => {
            if (res && res.code === 0) {
              let arr = res.datas || [];
              v.CreateProductVariParam.item = [];
              v.saveList = JSON.stringify(arr);
              // 获取主属性文字
              arr.forEach((i) => {
                if (i.variType.isMain === 1) {
                  v.isMainAttrText = i.variType.variTypeName;
                  v.attrMainVarId = i.variTypeId;
                }
              });
              v.$set(v.variationListS, "items", arr);
              v.variationListS.items.forEach((item) => {
                item.value = "";
                item.vaild = false;
              });
              if (!arr.length) {
                v.CreateProductVariParam.item.push({
                  key: "",
                  defaultVal: "",
                  val: [],
                });
              } else {
                arr.forEach((item) => {
                  let obj = {};
                  obj.key = item.variType.variTypeName;
                  obj.variTypeId = item.variType.variTypeId;
                  obj.val = [];
                  item.variationList.forEach((item) => {
                    obj.val.push({
                      attrVal: item.variationName,
                      variTypeId: item.variTypeId,
                      variationId: item.variationId,
                    });
                  });
                  v.CreateProductVariParam.item.push(obj);
                });
              }
              resolve();
            }
          });
      });
    },
    // 获取多属性列表数据
    getVariList() {
      let v = this;
      const createId = v.$store.state.createId;
      if (createId === "") {
        v.attributeDate = [];
        return;
      }
      v.tableLoading = true;
      v.$axios
        .get(api.getQueryVari + "?productId=" + v.$store.state.createId)
        .then((res) => {
          if (res.code !== 0) return;
          let data = res.datas || [];
          if (!data.length) {
            v.attributeDate = [];
            return;
          }
          v.processData(data);
        })
        .finally(() => {
          v.tableLoading = false;
        });
    },
    // 处理多属性列表数据
    processData(data) {
      let v = this;
      let variTypeNameList = data[0].variTypeNameList || []; // 取表头
      // let attrMainIndex = null;
      // variTypeNameList.forEach((i, d) => {
      //   if (i === v.isMainAttrText) {
      //     attrMainIndex = d;
      //   }
      // });
      v.variationList.items = [];
      let columns;
      let imgColumns = {
        title: "图片",
        align: "center",
        minWidth: 130,
        renderHeader(h) {
          return h("span", {}, [
            h("span", "图片"),
            h(
              "a",
              {
                style: {
                  paddingLeft: "20px",
                  display: (() => {
                    // 没有主属性
                    if (
                      v.isMainAttrText === null ||
                      v.isMainAttrText === "" ||
                      v.$store.state.pictureCurNodeId !== 1
                    ) {
                      return "none";
                    }
                    // 先确定index 位置 在判断有没有图片
                    let mainIndex;
                    variTypeNameList.forEach((text, index) => {
                      if (text === v.isMainAttrText) {
                        mainIndex = index;
                      }
                    });
                    let valid = false;
                    data.some((i) => {
                      if (
                        i.variationPictureMapList[mainIndex]
                          .variationPictureList &&
                        i.variationPictureMapList[mainIndex]
                          .variationPictureList.length > 0
                      ) {
                        valid = true;
                      }
                    });
                    return valid ? "inline" : "none";
                  })(),
                },
                on: {
                  click() {
                    v.isDelModal(() => {
                      v.saveMainImg(
                        [
                          {
                            productId: v.$store.state.createId, // 选择的图片有Id时必需传
                          },
                        ],
                        "删除成功"
                      ).then(() => {
                        v.getVariList();
                      });
                    });
                  },
                },
              },
              "清空所有"
            ),
          ]);
        },
        render(h, params) {
          let index = null;
          if (v.isMainAttrText === null || v.isMainAttrText === "") {
            return h(
              "span",
              {
                attrs: {
                  title: "需设置主属性",
                },
              },
              "无图片"
            );
          }
          params.row.variTypeNameList.forEach((i, ind) => {
            if (i === v.isMainAttrText) {
              index = ind;
            }
          });
          let list;
          let copyList;
          if (params.row.variationPictureMapList[index].variationPictureList) {
            list = v.deepCopy(
              params.row.variationPictureMapList[index].variationPictureList
            ); // 图片列表
            copyList = v.deepCopy(
              params.row.variationPictureMapList[index].variationPictureList
            ); // 图片列表
          }
          let imgLen = 0;
          copyList = copyList || [];
          if (list === null || list === undefined || list.length === 0) {
            list = [];
          } else {
            imgLen = list.length;
            list.length = 1;
          }
          return h("div", {}, [
            list.map((i) => {
              let url = i.pictureUrl; // 图片地址
              let style = {
                width: "30px",
                height: "30px",
                marginRight: "5px",
                objectFit: "cover",
                verticalAlign: "middle",
              };
              return h(
                "Poptip",
                {
                  props: {
                    placement: "right",
                    trigger: "hover",
                  },
                  style: style,
                },
                [
                  h("div", {}, [
                    h("img", {
                      attrs: {
                        src:
                          url === "" || url === null || url === undefined
                            ? v.placeholderSrc
                            : url,
                      },
                      on: {
                        click: () => {},
                      },
                      style: style,
                    }),
                  ]),
                  h("img", {
                    slot: "content",
                    props: {},
                    attrs: {
                      src:
                        url === "" || url === null || url === undefined
                          ? v.placeholderSrc
                          : url,
                    },
                    style: {
                      width: "400px",
                      height: "auto",
                      verticalAlign: "middle",
                    },
                  }),
                ]
              );
            }),
            h(
              "span",
              {
                style: {
                  display: imgLen && imgLen > 1 ? "inline" : "none",
                },
              },
              "(" + imgLen + "张)"
            ),
            h(
              "a",
              {
                props: {
                  size: "small",
                },
                style: {
                  marginRight: "5px",
                },
                on: {
                  click() {
                    v.modal1 = true;
                    v.activeRow = params.row;
                    v.setActiveMainImg = params.index;
                    v.checkImg = [];
                    v.imgList.forEach((a, ind) => {
                      copyList.forEach((b) => {
                        if (a.pictureUrl === b.pictureUrl) {
                          v.checkImg.push(ind);
                        }
                      });
                    });
                    // v.imgList = params.row.variationPictureMapList[index].variationPictureList
                  },
                },
              },
              "设置"
            ),
            h(
              "div",
              {
                style: {
                  marginLeft: "5px",
                  cursor: "pointer",
                  color: "#2d8cf0",
                },
                on: {
                  click: () => {
                    v.goPicrtureUrl(list);
                  },
                },
              },
              "1688同款开发"
            ),
            h(
              "a",
              {
                style: {
                  display: (() => {
                    return list.length === 0 ||
                      v.$store.state.pictureCurNodeId !== 1
                      ? "none"
                      : "inline";
                  })(),
                },
                props: {
                  size: "small",
                },
                on: {
                  click() {
                    v.isDelModal(() => {
                      v.saveMainImg(
                        [
                          {
                            productId: v.$store.state.createId, // 选择的图片有Id时必需传
                            variationId:
                              params.row.variationPictureMapList[index]
                                .variationId,
                          },
                        ],
                        "删除成功"
                      ).then(() => {
                        v.getVariList();
                      });
                    });
                  },
                },
              },
              "清空"
            ),
          ]);
        },
      };
      let attrColumns = []; //添加属性
      let addColumns = []; //根据某属性值是否存在动态添加
      // let basicColumns = v.addAttrList();

      variTypeNameList.forEach((item, index) => {
        v.variationList.items.push({
          label: item,
          value: "",
          valid: false,
        });
        attrColumns.push({
          key: "editText",
          align: "center",
          title: item,
          index: index,
          minWidth: 140,
          renderHeader: (h) => {
            return h("div", {}, [
              h("span", item),
              h("Icon", {
                style: {
                  verticalAlign: "text-bottom",
                  marginLeft: "3px",
                  cursor: "pointer",
                  display: (() => {
                    return v.isShowMainImg ? "inline" : "none";
                  })(),
                },
                attrs: {
                  title: "（处理图片流程）设置主属性",
                },
                props: {
                  type: (() => {
                    return item === v.isMainAttrText
                      ? "ios-home"
                      : "ios-home-outline";
                  })(),
                  size: "18",
                },
                on: {
                  click() {
                    // 设置主属性
                    if (v.$store.state.pictureCurNodeId === 1) {
                      v.isMainAttrText = item;
                      v.setMainVariType({
                        productId: v.$store.state.createId,
                        variTypeId:
                          // eslint-disable-next-line no-undef
                          res.datas[0].variationPictureMapList[index]
                            .variTypeId, //
                      });
                    }
                  },
                },
              }),
            ]);
          },
          render: (h, params) => {
            return h(
              "div",
              {
                attrs: {
                  class: (() => {
                    return v.isMainAttrText ===
                      params.row.variTypeNameList[index]
                      ? "mainAttr"
                      : "";
                  })(),
                },
              },
              params.row.variationNameList[index]
            );
          },
        });
      });

      if (
        (v.$store.state.curNodeId === 0 || v.$store.state.curNodeId === 3) &&
        v.$store.state.curNodeControl === 999
      ) {
        //  待提交需求/待分配询价/待完成询价 可编辑 固定 columns
        columns = [
          {
            type: "selection",
            width: 60,
            fixed: "left",
          },
          {
            title: "序号",
            width: 60,
            align: "center",
            key: "index",
            fixed: "left",
          },
          {
            key: "enableFlag",
            align: "center",
            fixed: "right",
            title: "操作",
            width: 80,
            render: (h, params) => {
              return h("div", {
                style: {
                  color: "#169BD5",
                  cursor: "pointer",
                },
                domProps: {
                  innerHTML: "删除",
                },
                on: {
                  click() {
                    v.isDelModal(() => {
                      v.removeProductGoods(params.row);
                    });
                  },
                },
              });
            },
          },
        ];
      } else {
        //  不可编辑 固定 columns
        columns = [
          {
            title: "序号",
            width: 60,
            align: "center",
            key: "index",
            fixed: "left",
          },
        ];
      }
      if (data[0].goodsSku !== null) {
        addColumns.push({
          align: "center",
          title: "sku",
          minWidth: 130,
          render: (h, params) => {
            return h("div", params.row.goodsSku);
          },
        });
      }
      if (data[0].goodsWeight !== null) {
        addColumns.push({
          align: "center",
          title: "重量",
          width: 100,
          render: (h, params) => {
            return h("div", params.row.goodsWeight);
          },
        });
      }
      if (data[0].goodsPrice !== null) {
        addColumns.push({
          align: "center",
          width: 100,
          title: "价格",
          render: (h, params) => {
            return h("div", params.row.goodsPrice);
          },
        });
      }

      addColumns = [imgColumns, ...addColumns, ...attrColumns];
      // addColumns = [imgColumns, ...addColumns, ...attrColumns, ...basicColumns]; // 不要删
      columns.splice(2, 0, ...addColumns);
      v.$nextTick(() => {
        v.attributeColumns = columns;
      });
      data.forEach((item, index) => {
        item.index = index + 1;
        item.imgList = [];
        item.isMainAttr = false; // 是否为主属性

        // 不要删
        // item.goodsHeight = item.goodsHeight || 0;
        // item.goodsLength = item.goodsLength || 0;
        // item.goodsWidth = item.goodsWidth || 0;
        // item.goodsWeight = item.goodsWeight || 0;
      });
      v.attributeDate = data;
    },
    // 每个属性按长宽高增加“商品尺寸”文本框，增加“重量”文本框 // 不要删
    addAttrList() {
      let v = this;
      return [
        {
          align: "center",
          width: 360,
          renderHeader(h) {
            return h("div", {}, [
              h("span", "商品尺寸(cm)"),
              (() => {
                return h("Checkbox", {
                  style: {
                    marginLeft: "6px",
                  },
                  on: {
                    "on-change"(val) {
                      if (!val) return;
                      if (
                        !(
                          v.attributeDate[0].goodsLength &&
                          v.attributeDate[0].goodsWidth &&
                          v.attributeDate[0].goodsHeight
                        )
                      ) {
                        v.$msg.error({
                          content: "请填写第一个商品尺寸",
                          duration: 5,
                        });
                        return;
                      }
                      v.attributeDate.forEach((item) => {
                        item.goodsLength = v.attributeDate[0].goodsLength;
                        item.goodsWidth = v.attributeDate[0].goodsWidth;
                        item.goodsHeight = v.attributeDate[0].goodsHeight;
                      });
                    },
                  },
                });
              })(),
              h("span", "相同"),
            ]);
          },
          render: (h, params) => {
            return h(
              "div",
              {
                class: "mulInput",
              },
              [
                h("div", {}, [
                  h("span", {}, "长"),
                  h("Input", {
                    props: {
                      value: params.row.goodsLength,
                      disabled:
                        this.$store.state.curNodeId !== 0 ||
                        this.$store.state.curNodeControl !== 999,
                    },
                    class: "shotInput",
                    on: {
                      input: (value) => {
                        this.attributeDate[params.index].goodsLength = value;
                      },
                    },
                  }),
                ]),
                h("div", {}, [
                  h("span", {}, "宽"),
                  h("Input", {
                    props: {
                      value: params.row.goodsWidth,
                      disabled:
                        this.$store.state.curNodeId !== 0 ||
                        this.$store.state.curNodeControl !== 999,
                    },
                    class: "shotInput",
                    on: {
                      input: (value) => {
                        this.attributeDate[params.index].goodsWidth = value;
                      },
                    },
                  }),
                ]),
                h("div", {}, [
                  h("span", {}, "高"),
                  h("Input", {
                    props: {
                      value: params.row.goodsHeight,
                      disabled:
                        this.$store.state.curNodeId !== 0 ||
                        this.$store.state.curNodeControl !== 999,
                    },
                    class: "shotInput",
                    on: {
                      input: (value) => {
                        this.attributeDate[params.index].goodsHeight = value;
                      },
                    },
                  }),
                ]),
              ]
            );
          },
        },
        {
          align: "center",
          width: 130,
          renderHeader(h) {
            return h("div", {}, [
              h("span", "重量(g)"),
              (() => {
                return h("Checkbox", {
                  style: {
                    marginLeft: "6px",
                  },
                  on: {
                    "on-change"(val) {
                      if (!val) return;
                      let weight = v.attributeDate[0].goodsWeight;
                      if (!weight && weight !== 0) {
                        v.$msg.error({
                          content: "请填写第一个重量",
                          duration: 5,
                        });
                        return;
                      }
                      v.attributeDate.forEach((item, index) => {
                        v.attributeDate[index].goodsWeight = weight;
                      });
                    },
                  },
                });
              })(),
              h("span", "相同"),
            ]);
          },
          render: (h, params) => {
            return h("Input", {
              props: {
                type: "number",
                value: params.row.goodsWeight,
                disabled:
                  this.$store.state.curNodeId !== 0 ||
                  this.$store.state.curNodeControl !== 999,
              },
              on: {
                "on-change": (event) => {
                  let query = event.target.value;
                  v.$set(v.attributeDate[params.index], "goodsWeight", query);
                },
              },
            });
          },
        },
      ];
    },
    goPicrtureUrl(pic) {
      let v = this;
      const obj = {
        url: api.get_samePic + "?imgUrl=" + pic[0].pictureUrl,
        type: "GET",
      };
      v.ajaxData(obj).then((response) => {
        window.open(response.datas);
      });
    },
    setMainVariType(params) {
      // 设置主属性
      let v = this;
      v.$axios
        .post(api.setMainVariType, params)
        .then((res) => {
          if (res.code === 0) {
            v.$Message.success("设置成功");
            // v.getVariList();
          }
        })
        .catch(() => {});
    },
    // 删除属性
    removeProductGoods(item) {
      this.$axios
        .post(api.removeProductGoods, {
          productId: this.$store.state.createId,
          productGoodsId: item.productGoodsId,
        })
        .then((res) => {
          if (res.code === 0) {
            this.$msg.success("删除成功");
            this.getVariList();
            // v.getQueryVariTypeM();
          }
        });
    },
    addProductVaild(index, item) {
      /* -新增子产品验证 */
      let v = this;
      if (item.value === "") {
        v.$set(v.variationListS.items[index], "valid", true);
      } else {
        v.$set(v.variationListS.items[index], "valid", false);
      }
    },
    // 保存多属性
    saveMultiple() {
      let query = [];
      for (let i = 0; i < this.attributeDate.length; i++) {
        if (this.attributeDate[i].editTalg) {
          if (this.attributeDate[i].goodsSku === "") {
            this.$msg.info("sku不能为空");
            return false;
          } else if (this.attributeDate[i].goodsPrice === "") {
            this.$msg.info("价格不能为空");
            return false;
          } else if (this.attributeDate[i].goodsWeight === "") {
            this.$msg.info("价格不能为空");
            return false;
          }
          query.push({
            productId: this.attributeDate[i].productId,
            sortNoList: this.attributeDate[i].sortNoList,
            goodsSku: this.attributeDate[i].goodsSku,
            goodsPrice: this.attributeDate[i].goodsPrice,
            goodsWeight: this.attributeDate[i].goodsWeight,
          });
        }
      }
      this.$axios
        .post(api.createProductGoods, query)
        .then((res) => {
          if (res.code === 0) {
            this.getVariList();
            this.$store.commit("editTalg", false);
            this.$msg.success("添加成功");
          }
        })
        .catch(() => {
          this.tableLoading = false;
        });
    },
    // 保存属性 // 不要删
    save() {
      return new Promise((resolve, reject) => {
        let param = [];
        this.attributeDate.forEach((k) => {
          param.push({
            goodsLength: k.goodsLength,
            goodsWidth: k.goodsWidth,
            goodsHeight: k.goodsHeight,
            goodsWeight: k.goodsWeight,
            productGoodsId: k.productGoodsId,
          });
        });
        this.$axios
          .post(api.post_saveProductGoods, param)
          .then((res) => {
            resolve();
            if (res.code === 0) {
              this.getVariList();
            }
          })
          .catch(() => {
            reject();
          });
      });
    },
  },
};
</script>

<style >
.attrBut .ivu-modal-body {
  overflow-y: visible;
}

.setMainImg .ivu-checkbox {
  position: absolute;
  right: 0px;
  top: 0px;
  z-index: 5;
}

.ivu-table .mainAttr {
  background-color: #b1b1b1;
  color: #fff;
}

.mulInput {
  display: flex;
  align-items: center;
  justify-content: center;
}
.mulInput .shotInput {
  width: 90px;
  margin: 0 6px;
}
</style>
<style scoped>
.setMainImgItem {
  position: relative;
  padding: 10px;
  border: 1px solid #ddd;
}

.closeAttr {
  position: absolute;
  right: -6px;
  top: -6px;
  font-size: 14px;
  cursor: pointer;
}

.closeAttr1 {
  position: absolute;
  right: 5px;
  top: 11px;
  font-size: 30px;
  cursor: pointer;
}

.closeAttr:hover,
.closeAttr1:hover {
  color: red;
}

.attrBox {
  border: 1px solid #ddd;
  padding: 10px;
  margin-top: 10px;
}

.attrItem {
  margin-bottom: 10px;
}

.modalTit {
  line-height: 32px;
  display: block;
}

.attrColse {
  font-size: 32px;
  float: right;
  cursor: pointer;
}

.attrColse:hover {
  color: red;
}

.insideBox {
  padding: 0 15px;
}
</style>
