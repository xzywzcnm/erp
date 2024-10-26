<template>
  <div class="mainBox paneMain">
    <Card shadow class="card-self-style">
      <div class="list-page">
        <Form
          ref="searchCriteria"
          class="formSearch resetIvu"
          :model="searchCriteria"
          inline
          :label-width="80"
        >
          <dyt-filter :filter-row="1">
            <FormItem label="状态">
              <dyt-select v-model="searchCriteria.queryStatus">
                <Option
                  v-for="item in taskStatusList"
                  :key="'taskStatusList' + item.value"
                  :value="item.value"
                >
                  {{ item.label }}</Option
                >
              </dyt-select>
            </FormItem>
            <FormItem label="供应商">
              <dyt-select v-model="searchCriteria.supplierId">
                <Option
                  v-for="item in supplyList"
                  :key="item.supplierId"
                  :value="item.supplierId"
                  >{{ item.supplierName }}
                </Option>
              </dyt-select>
            </FormItem>
            <FormItem label="款号">
              <dyt-inputTag
                v-model="searchCriteria.modelNo"
                :string="true"
                :limit="1"
                type="textarea"
              />
            </FormItem>
            <FormItem label="SPU">
              <dyt-input v-model.trim="searchCriteria.referenceSpu"></dyt-input>
            </FormItem>
            <FormItem label="创建人">
              <dyt-select v-model="searchCriteria.createdBy">
                <Option
                  v-for="item in purchaserArr"
                  :key="item.userId"
                  :value="item.userId"
                  >{{ item.userName }}</Option
                >
              </dyt-select>
            </FormItem>
            <FormItem label="创建时间">
              <DatePicker
                type="datetimerange"
                placement="bottom-end"
                placeholder="选择日期"
                split-panels
                v-model="submitTime"
                :options="dateOptions"
                @on-change="getDateValue"
                transfer
              >
              </DatePicker>
            </FormItem>
            <FormItem label="开发类型" :label-width="80">
              <dyt-select v-model="searchCriteria.developmentType">
                <Option
                  v-for="item in developTypeList"
                  :key="'developTypeList' + item.value"
                  :value="item.value"
                >
                  {{ item.label }}</Option
                >
              </dyt-select>
            </FormItem>
            <div slot="operation">
              <Button
                type="primary"
                @click="search()"
                icon="ios-search"
                class="mr10"
                >查询
              </Button>
              <Button @click="resetForm()" icon="md-refresh">重置</Button>
            </div>
          </dyt-filter>
        </Form>
        <div class="operaBtn">
          <sort-by
            :sortData="sortData"
            @search_cli="sortFun"
            class="mt10"
          ></sort-by>
        </div>
        <div class="table-main mt10">
          <div :class="['table-list', tableClass]">
            <Table
              :columns="columns"
              :data="tableList"
              border
              :loading="tableLoading"
              highlight-row
              @on-selection-change="selectChange"
              :height="tableHeight"
            >
              <template slot-scope="{ row }" slot="action">
                <div class="action-btns">
                  <Button
                    @click="seeDetail(row, { tag: 'basicData', openType: 'view' })"
                    class="abtn-left"
                  >查看</Button>
                  <Dropdown
                    trigger="click"
                    class="dropdown-list"
                    :transfer="true"
                    v-if="statusShow(row)"
                  >
                    <Button class="abtn-right">
                      <Icon type="ios-arrow-down"></Icon>
                    </Button>
                    <DropdownMenu slot="list">
                      <template v-for="(item, index) in (row.productSource == 5 ? statusButton : statusList)">
                        <template v-if="row.status === item.value && item.btn && item.productSource.includes(row.productSource)">
                          <template v-for="(citem, cIndex) in item.btn">
                            <template v-if="row.status === 5">
                              <template v-if=" 'pic' + row.pictureVerifyStatus === citem.value">
                                <template v-if="row.pictureVerifyStatus === 0">
                                  <DropdownItem
                                    @click.native="seeDetail(row, citem)"
                                    v-if="row.requireVerifyBy === userInfo.userId"
                                    :key="`item1-${index}-${cIndex}`"
                                  >
                                    {{ citem.name }}
                                  </DropdownItem>
                                </template>
                                <template v-if="row.pictureVerifyStatus === 1">
                                  <DropdownItem
                                    @click.native="seeDetail(row, citem)"
                                    v-if="row.pictureCompleteBy === userInfo.userId"
                                    :key="`item2-${index}-${cIndex}`"
                                  >
                                    {{ citem.name }}
                                  </DropdownItem>
                                </template>
                                <template v-if="row.pictureVerifyStatus === 2">
                                  <DropdownItem
                                    @click.native="seeDetail(row, citem)"
                                    v-if="row.pictureVerifyBy === userInfo.userId"
                                    :key="`item3-${index}-${cIndex}`"
                                  >
                                    {{ citem.name }}
                                  </DropdownItem>
                                </template>
                              </template>
                              <template v-if="'text' + row.textVerifyStatus === citem.value">
                                <template v-if="row.textVerifyStatus === 0">
                                  <DropdownItem
                                    @click.native="seeDetail(row, citem)"
                                    v-if="row.requireVerifyBy === userInfo.userId"
                                    :key="`item4-${index}-${cIndex}`"
                                  >
                                    {{ citem.name }}
                                  </DropdownItem>
                                </template>
                                <template v-if="row.textVerifyStatus === 1">
                                  <DropdownItem
                                    @click.native="seeDetail(row, citem)"
                                    v-if="row.textCompleteBy === userInfo.userId"
                                    :key="`item5-${index}-${cIndex}`"
                                  >
                                    {{ citem.name }}
                                  </DropdownItem>
                                </template>
                                <template v-if="row.textVerifyStatus === 2">
                                  <DropdownItem
                                    @click.native="seeDetail(row, citem)"
                                    v-if="row.textVerifyBy === userInfo.userId"
                                    :key="`item6-${index}-${cIndex}`"
                                  >
                                    {{ citem.name }}
                                  </DropdownItem>
                                </template>
                              </template>
                            </template>
                            <template v-else-if="row.status === 0">
                              <template v-if="(!citem.productSource || citem.productSource.includes(row.productSource))">
                                <DropdownItem @click.native="seeDetail(row,citem)" v-if="row.requireVerifyBy === userInfo.userId" :key="`item8-${index}-${cIndex}`">
                                  {{citem.name}}
                                </DropdownItem>
                              </template>
                            </template>
                            <template v-else>
                              <DropdownItem @click.native="seeDetail(row, citem)" :key="`item7-${index}-${cIndex}`">{{citem.name}}</DropdownItem>
                            </template>
                          </template>
                        </template>
                      </template>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </template>
              <template slot-scope="{ row }" slot="basic">
                <div class="flexCenter">
                  <large-picture
                    :url="handlePic(row.pictureUrl)"
                    class="mr10"
                  ></large-picture>
                  <div>
                    <div>供方货号</div>
                    <span>{{
                      row.supplierNo || row.productSupplierNo || "-"
                    }}</span>
                    <div>{{ row.styleName || "-" }}</div>
                  </div>
                </div>
              </template>
              <template slot-scope="{ row }" slot="supplierName">
                <span
                  v-for="(item, index) in operatList"
                  :key="index + 'supplierName'"
                  >{{
                    item.productCategoryId === row.goodTypeId ? item.cnName : ""
                  }}</span
                >
              </template>
              <template slot-scope="{ row }" slot="referenceSpu">
                <span>{{ row.referenceSpu || "-" }}</span>
              </template>
              <template slot-scope="{ row }" slot="productSource">
                <span>{{
                  sourceTypelist[row.productSource] &&
                  sourceTypelist[row.productSource].name
                }}</span>
              </template>
              <template slot-scope="{ row }" slot="status">
                <span v-for="(item, index) in (row.productSource == 5 ? statusButton : statusList)" :key="index + 'tag'">
                  <template
                    v-if="item.productSource.includes(row.productSource)"
                  >
                    <span v-if="row.status === 5">
                      <Tag
                        color="blue"
                        style="width: 90px; text-align: center"
                        v-if="'text' + row.textVerifyStatus === item.sonValue"
                        >{{ item.label }}</Tag
                      >
                      <Tag
                        color="blue"
                        style="width: 90px; text-align: center"
                        v-if="'pic' + row.pictureVerifyStatus === item.sonValue"
                        >{{ item.label }}</Tag
                      >
                    </span>
                    <span v-else>
                      <Tag
                        color="blue"
                        style="width: 90px; text-align: center"
                        v-if="item.value === row.status"
                      >
                        {{ item.label }}</Tag
                      >
                    </span>
                  </template>
                </span>
              </template>
              <template slot-scope="{ row }" slot="supplierId">
                <span
                  v-for="(item, index) in supplyList"
                  :key="index + 'supplierId'"
                  >{{
                    item.supplierId === row.supplierId ? item.supplierName : ""
                  }}</span
                >
              </template>
              <!-- <template slot-scope="{ row }" slot="isStock">
            <span v-if="row.isStock || row.isStock===0">{{row.isStock === 0 ? '有' : '否' }}</span>
          </template> -->
              <template slot-scope="{ row }" slot="create">
                <span
                  v-for="(item, index) in purchaserArr"
                  :key="index + 'create'"
                  >{{
                    item.userId === row.createdBy ? item.userName : ""
                  }}</span
                >
                <div>
                  {{
                    row.createdTime
                      ? getDataToLocalTime(row.createdTime, "fulltime")
                      : ""
                  }}
                </div>
              </template>
              <template slot-scope="{ row }" slot="finally">
                <span
                  v-for="(item, index) in purchaserArr"
                  :key="index + 'create'"
                  >{{
                    item.userId === row.updatedBy ? item.userName : ""
                  }}</span
                >
                <div>
                  {{
                    row.updatedTime
                      ? getDataToLocalTime(row.updatedTime, "fulltime")
                      : ""
                  }}
                </div>
              </template>
            </Table>
          </div>
          <page-common
            :pageConfig="proPage"
            @ChangePage="ChangePage"
            @ChangePageSize="ChangePageSize"
          ></page-common>
        </div>
      </div>
    </Card>
    <!-- 新品详情 -->
    <require-detail
      v-if="productSource != 5"
      :dialogObj.sync="dialogObj"
      :purchaserArr="purchaserArr"
      :operatList="operatList"
      :supplyList="supplyList"
      @fetch="fetch"
      :productSource="productSource"
    ></require-detail>
    <!-- 打版详情 -->
    <plateDetail
      v-if="productSource == 5"
      :dialogObj.sync="dialogObj"
      :purchaserArr="purchaserArr"
      :operatList="operatList"
      :supplyList="supplyList"
      @fetch="fetch"
      :productSource="productSource"
    />
    <!-- 新建云仓 -->
    <addYunCangPopupTab
      :model-visible.sync="addYunCangVisible"
      :supplyList="supplyList"
      :operatList="operatList"
      @fetch="fetch"
      :yuncangData="yuncangData"
      :productSource="productSource"
    />
    <!-- 云仓详情 -->
    <yuncang-detail
      :dialogObj.sync="yuncangObj"
      :purchaserArr="purchaserArr"
      :operatList="operatList"
      :supplyList="supplyList"
      @fetch="fetch"
      :productSource="productSource"
    ></yuncang-detail>
  </div>
</template>
<script>
import api from "@/api/api.js";
import {
  toDocolumns,
  statusList,
  sourceTypelist,
  taskStatusList,
  statusButton,
  developTypeList,
} from "../components/configFile.js";
import SortBy from "@/components/SortBy";
import pageMixin from "@/components/mixin/page_mixin";
import largePicture from "@/components/largePicture";
import requireDetail from "../stockUp/requireDetail";
import addYunCangPopupTab from "../yuncang/addYunCangPopupTab";
import yuncangDetail from "../yuncang/yuncangDetail";
import plateDetail from "../stockUp/plateDetail";
import table_highly_adaptive from "@/components/mixin/table_highly_adaptive";

export default {
  name: "createRequire",
  mixins: [pageMixin, table_highly_adaptive],
  components: {
    requireDetail,
    largePicture,
    addYunCangPopupTab,
    yuncangDetail,
    plateDetail,
    SortBy,
  },
  data() {
    return {
      searchCriteria: {
        supplierId: "",
        modelNo: "",
        referenceSpu: "",
        createdBy: "",
        createdStartTime: "",
        createdEndTime: "",
        queryStatus: 1,
        developmentType: 0,
        orderBy: "createdTime",
        upDown: "down",
        createdTime: "",
        updatedTime: "",
      },
      submitTime: [],
      sortData: [
        {
          label: "按创建时间",
          value: "createdTime",
          checked: true,
          toogle: "down",
        },
        {
          label: "按最后操作时间",
          value: "updatedTime",
          checked: false,
          toogle: "down",
        },
      ],
      //payTimeArr: [searchCriteria.createdStartTime, searchCriteria.createdEndTime],
      statusList: statusList,
      statusButton: statusButton,
      taskStatusList: taskStatusList,
      developTypeList: developTypeList,
      purchaserArr: [],
      operatList: [],
      supplyList: [],
      columns: toDocolumns,

      dialogObj: {
        modelVisible: false,
        data: {},
        tag: "",
        btnoperat: "",
      },
      userInfo: "",
      sourceTypelist: (() => {
        let newVal = this.$common.copy(sourceTypelist);
        Object.keys(newVal).forEach(key => {
          if (newVal[key].name.includes('-')) {
            newVal[key].name = newVal[key].name.substring(newVal[key].name.indexOf('-') + 1, newVal[key].name.length);
          }
        })
        return newVal;
      })(),
      addYunCangVisible: false,
      yuncangObj: {
        modelVisible: false,
        data: {},
        tag: "",
        btnoperat: "",
      },
      yuncangData: {
        data: {},
        title: "",
        type: "",
      },
      productSource: null,
    };
  },
  created() {
    this.fetch(api.myLaPaProductInfoList, "post");
    //this.getList();
    this.init();
    this.userInfo =
      this.$store.state.erpConfig && this.$store.state.erpConfig.userInfo;
  },
  computed: {
    securityUser() {
      if (this.$store.getters["authUserInfo"] && this.$store.getters["authUserInfo"].securityUser) {
        return this.$store.getters["authUserInfo"].securityUser;
      }
      return {}
    }
  },
  deactivated() {
    this.dialogObj.modelVisible = false;
  },
  watch: {
    // productSource(newVal) {
    //   console.log(newVal, this.sourceTypelist[newVal]?.name);
    // },
  },
  methods: {
    // 重置查询条件
    resetForm() {
      this.reset();
      this.searchCriteria.queryStatus = 0;
      this.searchCriteria.developmentType = 0;
      this.searchCriteria.createdStartTime = "";
      this.searchCriteria.createdEndTime = "";
      this.submitTime = "";
      this.searchCriteria.orderBy = "createdTime";
      this.searchCriteria.upDown = "down";
      this.searchCriteria.updatedTime = "";
      this.sortData[0].checked = true;
      this.sortData[1].checked = false;
    },
    init() {
      // 获取创建人列表
      this.getUserMesCommon().then((result) => {
        if (result) {
          this.purchaserArr = Object.values(this.$store.state.userInfoList);
        }
      });
      this.getSupplierList();
      this.getCategoryList();
    },

    sortFun(row) {
      this.searchCriteria.orderBy = row.value;
      this.searchCriteria.upDown = row.toogle;
      this.fetch();
    },

    getDateValue(e) {
      // 获取日期返回值
      [
        this.searchCriteria.createdStartTime,
        this.searchCriteria.createdEndTime,
      ] = e;
    },

    // 导出
    exporTOut(all) {
      // 全部导出
      if (all) {
        return;
      }
      // 选中导出
      let list = this.columnList || [];
      if (!list.length) {
        this.$Message.error("请勾选款式");
        return;
      }
      let [temp, arr] = [{}, []];
      list.forEach((k) => {
        arr.push(k.electionId);
      });
      temp.electionIdList = arr;
    },
    // 添加/详情
    seeDetail(row, event) {
      if ([0, 1, 5].includes(row.productSource)) {
        this.detail(row, event);
        return;
      }
      this.ycdetail(row, event);
    },
    // 新品
    detail(row, event) {
      this.productSource = row.productSource;
      this.$nextTick(() => {
        this.dialogObj.modelVisible = true;
        this.dialogObj.data = row;
        this.dialogObj.openType = event.openType || "edit";
        this.dialogObj.tag = event.tag;
        this.dialogObj.btnoperat = event.btnoperat;
      })
    },
    // 云仓新品
    ycdetail(row, event) {
      if (!(row && event)) {
        this.productSource = 3;
        this.$nextTick(() => {
          // 添加
          this.addYunCangVisible = true;
          this.yuncangData.title = "创建云仓新品需求";
          this.yuncangData.type = "add";
          this.yuncangData.data = {};
        })
        return;
      }
      this.productSource = row.productSource;
      this.$nextTick(() => {
        // 详情
        if (row.status >= 2 || event.openType === "view") {
          this.yuncangObj.modelVisible = true;
          this.yuncangObj.data = row;
          this.yuncangObj.openType = event.openType || "edit";
          this.yuncangObj.tag = event.tag;
          this.yuncangObj.btnoperat = event.btnoperat;
          return;
        }
        this.yuncangData.data = row;
        this.yuncangData.title = "编辑云仓新品需求";
        this.yuncangData.type = event.name === "提交侵权审核" ? "verify" : "edit";
        this.addYunCangVisible = true;
      })
    },
    // 获取供应商列表
    getSupplierList() {
      this.$axios.get(api.queryAllSupplierInfo).then((res) => {
        if (res.code === 0) {
          this.supplyList = res.datas || [];
        } else {
          this.supplyList = [];
        }
      });
    },
    // 获取商品末级分类列表
    getCategoryList() {
      this.$axios.get(api.productCategoryqueryAll).then(({ code, datas }) => {
        if (code !== 0) return;
        this.operatList = datas || [];
      });
    },
    // 处理图片
    handlePic(url) {
      return url ? url.split(",")[0] : "";
    },
    statusShow(row) {
      let status = false;
      let { userId } = this.userInfo;
      (row.productSource == 5 ? this.statusButton : this.statusList).forEach((k) => {
        if (row.status === 5) {
          if (!(k.btn && k.btn.length)) return;
          k.btn.forEach((j) => {
            let picObj = {
              0: "requireVerifyBy",
              1: "pictureCompleteBy",
              2: "pictureVerifyBy",
            };
            let textObj = {
              0: "requireVerifyBy",
              1: "textCompleteBy",
              2: "textVerifyBy",
            };
            if ("text" + row.textVerifyStatus === j.value) {
              if (
                textObj[row.textVerifyStatus] &&
                row[textObj[row.textVerifyStatus]] === userId
              )
                status = true;
            }
            if ("pic" + row.pictureVerifyStatus === j.value) {
              if (
                picObj[row.pictureVerifyStatus] &&
                row[picObj[row.pictureVerifyStatus]] === userId
              )
                status = true;
            }
          });
        } else {
          if (row.status === k.value && k.btn && row.requireVerifyBy === userId)
            status = true;
        }
      });
      return status;
    },
  },
};
</script>