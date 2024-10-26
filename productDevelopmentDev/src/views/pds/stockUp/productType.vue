<template>
  <div>
    <!--productTypeModel-->
    <Modal
      v-model="productTypeModel"
      width="800"
      class="clearMarginAuto productType"
      title="产品类型"
      :mask-closable="false"
    >
      <p slot="header" @mousedown="moveMt" class="moveHead">
        <span>产品类型</span>
      </p>
      <div>
        <h3
          @click="getProductTypeListMt"
          class="allType"
          v-if="productName.length > 0"
        >
          返回所有分类
        </h3>
        <p v-if="productName.length > 0">
          <span class="f14">已选分类:</span>
          <Breadcrumb>
            <BreadcrumbItem
              v-for="(item, index) in productName"
              :key="index"
              @click.native="breadNav(item, index)"
            >
              <a>{{ item.name }}</a>
            </BreadcrumbItem>
          </Breadcrumb>
        </p>
        <div style="padding: 10px 0 10px 0">
          <Input
            style="width: 400px"
            v-model="searchText"
            clearable
            @on-change="search"
          />
        </div>
        <p v-if="typeSearchHistory">
          <span>历史搜索：</span
          ><span
            v-for="(item, index) in typeSearchHistory"
            :key="index"
            class="typeHistory"
            @click="addProductType(item)"
            >{{ item | categoryNameJoin }}</span
          >
        </p>
        <div v-show="productTyleList.length == 0">{{ loaddingText }}</div>
        <div
          style="max-height: 400px; overflow-y: auto"
          v-show="productTyleList.length > 0"
          ref="typeBox"
          v-on:scroll.passive="handleScroll"
        >
          <p>请选择分类:</p>
          <template v-for="(item, index) in productTyleListDown">
            <Button
              style="margin-right: 10px; margin-bottom: 10px"
              :key="index"
              v-if="item.isShow"
              @click="addType(item)"
            >
              <span>{{ item.categoryName }}</span>
            </Button>
          </template>
        </div>
        <div></div>
      </div>
      <div slot="footer">
        <Button type="text" @click="productTypeModel = false">取消</Button>
        <Button type="primary" @click="addProductType('new')">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import CommonMixin from "../../../components/mixin/commonMixin";
import api from "@/api/api";

export default {
  name: "productType",
  mixins: [CommonMixin],
  components: {},
  data () {
    return {
      productTypeModel: false,
      productTyleList: [],
      searchText: "",
      productName: [],
      loaddingText: "数据加载中...",
      typeSearchHistory: JSON.parse(localStorage.getItem("typeSearchHistory")),
      typeLen: 100
    };
  },
  mounted () {
    this.getProductTypeListMt();
    /* this.$refs.typeBox.addEventListener('scroll',v.handleScroll,true) */
  },
  computed: {
    productTyleListDown () {
      let v = this;
      return this.productTyleList.slice(0, v.typeLen);
    }
  },
  filters: {
    categoryNameJoin (data) {
      let names = [];
      if (data) {
        data.forEach((item) => {
          names.push(item.name);
        });
        return names.join("/");
      }
      /* let name=[];
       data.forEach(item=>{
       name.push(item.name)
       });
       return name.join('/') */
    }
  },
  methods: {
    handleScroll (e) {
      let v = this;
      if (e.target.scrollHeight == e.target.scrollTop + e.target.clientHeight) {
        setTimeout(() => {
          v.typeLen += 100;
        }, 100);
      }
    },
    addProductType (data) {
      let v = this;
      if (data === "new") {
        if (
          JSON.stringify(v.typeSearchHistory).indexOf(
            JSON.stringify(v.productName)
          ) < 0
        ) {
          if (v.typeSearchHistory == null || v.typeSearchHistory.length < 4) {
            if (v.typeSearchHistory == null) {
              v.typeSearchHistory = [];
            }
            v.typeSearchHistory.push(v.productName);
          } else {
            v.typeSearchHistory.push(v.productName);
            v.typeSearchHistory.splice(0, 1);
          }
          localStorage.setItem(
            "typeSearchHistory",
            JSON.stringify(v.typeSearchHistory)
          );
        }
        this.$emit("addProductType", this.productName);
      } else {
        this.$emit("addProductType", data);
      }
      this.productTypeModel = false;
    },
    breadNav (item, index) {
      let v = this;
      v.getChildProductTypeByIdMt(item.categoryId);
      v.productName.splice(index + 1);
    },
    search () {
      let v = this;
      v.productTyleList.forEach((item) => {
        if (item.categoryName.indexOf(v.searchText) == "-1") {
          item.isShow = false;
        } else {
          item.isShow = true;
        }
      });
    },
    addType (item) {
      let v = this;
      v.productTyleList = [];
      v.loaddingText = "数据加载中...";
      v.searchText = "";
      v.getChildProductTypeByIdMt(item.categoryId);
      v.productName.push({
        categoryId: item.categoryId,
        name: item.categoryName
      });
    },
    getChildProductTypeByIdMt (categoryId) {
      let v = this;
      v.loaddingText = "数据加载中...";
      v.$axios
        .post(api.getChildProductTypeById + "?categoryId=" + categoryId)
        .then((res) => {
          if (res.code === 0) {
            res.datas.forEach((item) => {
              item.isShow = true;
            });
            v.productTyleList = res.datas;
            if (v.productTyleList.length === 0) {
              v.loaddingText =
                "已无下级分类，请选择确定或者通过面包屑重新选择分类";
            }
          }
        })
        .catch(() => {});
    },
    getProductTypeListMt () {
      let v = this;
      v.loaddingText = "数据加载中...";
      v.$axios.post(api.getProductTypeList).then((res) => {
        if (res && res.code === 0) {
          res.datas.forEach((item) => {
            item.isShow = true;
          });
          v.productTyleList = res.datas;
          v.productName = [];
          if (v.productTyleList.length === 0) {
            v.loaddingText =
              "已无下级分类，请选择确定或者通过面包屑重新选择分类";
          }
        }
      });
    }
  }
};
</script>

<style>
.productType .ivu-modal-body {
  padding-right: 0;
}

.allType {
  font-size: 16px;
  cursor: pointer;
}

.allType:hover {
  color: #2b85e4;
}
</style>
<style scoped>
.typeHistory {
  margin-right: 10px;
  cursor: pointer;
}

.typeHistory:hover {
  color: #000;
}
</style>
