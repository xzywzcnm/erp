<template>
  <div class="mainBox create-require">
    <Card shadow class="card-self-style">
      <div class="list-page">
        <Form
          ref="searchCriteria"
          class="formSearch resetIvu"
          :model="searchCriteria"
          inline
          :label-width="90"
        >
          <FormItem label="处理状态">
            <RadioGroup
              v-model="searchCriteria.queryStatus"
              type="button"
              @on-change="search()"
            >
              <template v-for="item in totalStatusList">
                <Radio
                  :label="item.value"
                  :key="item.value"
                  v-if="!item.display"
                >
                  <span>{{ item.label }}</span>
                  <span v-if="listCount[item.num]"
                    >({{ listCount[item.num] || 0 }})</span
                  >
                </Radio>
              </template>
            </RadioGroup>
          </FormItem>
          <dyt-filter :filter-row="1">
            <FormItem label="款号">
              <dyt-inputTag
                v-model="searchCriteria.modelNo"
                :string="true"
                :limit="1"
                type="textarea"
              />
            </FormItem>
            <FormItem label="SPU">
              <dyt-inputTag
                v-model="searchCriteria.referenceSpu"
                :string="true"
                :limit="1"
                type="textarea"
              />
            </FormItem>
            <FormItem label="创建人">
              <dyt-select v-model="searchCriteria.createdBy">
                <Option
                  v-for="item in purchaserArr"
                  :key="item.userId"
                  :value="item.userId"
                  >{{ item.userName }}
                </Option>
              </dyt-select>
            </FormItem>
            <FormItem label="供应商">
              <dyt-select v-model="searchCriteria.supplierId">
                <Option
                  v-for="item in supplyList"
                  :key="item.supplierId"
                  :value="item.supplierId"
                >{{ item.supplierName }}</Option>
              </dyt-select>
            </FormItem>
            <FormItem label="最后操作人">
              <dyt-select v-model="searchCriteria.updatedBy">
                <Option
                  v-for="item in purchaserArr"
                  :key="item.userId"
                  :value="item.userId"
                  >{{ item.userName }}
                </Option>
              </dyt-select>
            </FormItem>
            <FormItem label="开发类型">
              <dyt-select
                v-model="searchCriteria.developmentType"
                @on-change="search()"
              >
                <Option
                  v-for="item in developTypeList"
                  :key="'developTypeList' + item.value"
                  :value="item.value"
                >
                  {{ item.label }}</Option
                >
              </dyt-select>
            </FormItem>
            <FormItem label="创建时间">
              <DatePicker
                type="daterange"
                :options="options"
                placement="bottom-start"
                placeholder="请选择"
                @on-change="createTimeChange"
                :value="createdTime"
                transfer
              ></DatePicker>
            </FormItem>
            <FormItem label="最后更新时间">
              <DatePicker
                type="daterange"
                :options="options"
                placement="bottom-start"
                placeholder="请选择"
                @on-change="updateTimeChange"
                :value="updatedTime"
                transfer
              ></DatePicker>
            </FormItem>
            <FormItem label="供方货号">
              <dyt-input
                v-model.trim="searchCriteria.supplierNo"
                placeholder="请输入供方货号"
              ></dyt-input>
            </FormItem>
            <FormItem label="款式名称">
              <dyt-input
                v-model.trim="searchCriteria.styleName"
                placeholder="请输入款式名称"
              ></dyt-input>
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
          <Button type="primary" class="mr10" @click="add()">备货新建</Button>
          <Button type="primary" class="mr10" @click="ycdetail()"
            >云仓新建</Button
          >
          <Dropdown>
            <Button type="primary"
              >导出<Icon type="ios-arrow-down"></Icon
            ></Button>
            <DropdownMenu slot="list">
              <DropdownItem @click.native="exporTOut()">导出选中</DropdownItem>
              <!-- <DropdownItem @click.native="exporTOutall()">导出所有结果集</DropdownItem> -->
              <DropdownItem @click.native="exportInfringement()"
                >导出侵权审查结果</DropdownItem
              >
            </DropdownMenu>
          </Dropdown>
          <Checkbox v-model="checked" class="ml20"> 选中所有结果集 </Checkbox>
        </div>

        <div class="table-main mt10">
          <div :class="['table-list', tableClass]">
            <Table
              ref="createRequire"
              :columns="columns"
              :data="tableData"
              border
              :loading="tableLoading"
              highlight-row
              @on-selection-change="selectChange"
              :height="tableHeight"
            >
              <template slot-scope="{ row }" slot="basic">
                <div class="flexCenter">
                  <large-picture
                    :url="handlePic(row.pictureUrl)"
                    class="mr10"
                  ></large-picture>
                  <!-- <div v-if="[1,2].includes(row.productSource)"> -->
                  <div>
                    <div>供方货号</div>
                    <span>{{
                      row.supplierNo || row.productSupplierNo || "-"
                    }}</span>
                    <div>{{ row.styleName || "-" }}</div>
                  </div>
                  <!-- <span v-if="[0,3,4].includes(row.productSource)">{{row.styleName || '-'}}</span> -->
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
              <template slot-scope="{ row }" slot="status">
                <span v-for="(item, index) in statusList" :key="index + 'tag'">
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
              <!-- 待办人 -->
              <template slot-scope="{ row }" slot="requireVerifyBy">
                <div v-if="row.requireVerifyList && row.requireVerifyList.length > 0">
                  <div v-for="(verify, index) in row.requireVerifyList" :key="`verify-${index}`">
                    {{ userDataList[verify] ? userDataList[verify].userName || '' : '' }}
                  </div>
                </div>
              </template>
              <template slot-scope="{ row }" slot="productSource">
                <span>{{
                  sourceTypelist[row.productSource] &&
                  sourceTypelist[row.productSource].name
                }}</span>
              </template>
              <template slot-scope="{ row }" slot="referenceSpu">
                <span>{{ row.referenceSpu }}</span>
              </template>

              <template slot-scope="{ row }" slot="action">
                <div class="action-btns">
                  <Button
                    @click="
                      seeDetail(row, { tag: 'basicData', openType: 'view' })
                    "
                    class="abtn-left"
                    >查看</Button
                  >
                  <Dropdown
                    trigger="click"
                    class="dropdown-list"
                    :transfer="true"
                    v-if="statusShow(row)"
                  >
                    <Button class="abtn-right">
                      <Icon type="ios-arrow-down drop-button"></Icon>
                    </Button>
                    <DropdownMenu slot="list">
                      <template v-for="(item, index) in statusList">
                        <template
                          v-if="
                            row.status === item.value &&
                            item.btn &&
                            item.productSource.includes(row.productSource)
                          "
                        >
                          <template v-for="(citem, cIndex) in item.btn">
                            <template v-if="row.status === 5">
                              <template
                                v-if="
                                  'pic' + row.pictureVerifyStatus ===
                                  citem.value
                                "
                              >
                                <template v-if="row.pictureVerifyStatus === 0">
                                  <DropdownItem
                                    @click.native="seeDetail(row, citem)"
                                    v-if="
                                      row.requireVerifyBy === userInfo.userId
                                    "
                                    :key="`item1-${index}-${cIndex}`"
                                  >
                                    {{ citem.name }}
                                  </DropdownItem>
                                </template>
                                <template v-if="row.pictureVerifyStatus === 1">
                                  <DropdownItem
                                    @click.native="seeDetail(row, citem)"
                                    v-if="
                                      row.pictureCompleteBy === userInfo.userId
                                    "
                                    :key="`item2-${index}-${cIndex}`"
                                  >
                                    {{ citem.name }}
                                  </DropdownItem>
                                </template>
                                <template v-if="row.pictureVerifyStatus === 2">
                                  <DropdownItem
                                    @click.native="seeDetail(row, citem)"
                                    v-if="
                                      row.pictureVerifyBy === userInfo.userId
                                    "
                                    :key="`item3-${index}-${cIndex}`"
                                  >
                                    {{ citem.name }}
                                  </DropdownItem>
                                </template>
                              </template>
                              <template
                                v-if="
                                  'text' + row.textVerifyStatus === citem.value
                                "
                              >
                                <template v-if="row.textVerifyStatus === 0">
                                  <DropdownItem
                                    @click.native="seeDetail(row, citem)"
                                    v-if="
                                      row.requireVerifyBy === userInfo.userId
                                    "
                                    :key="`item4-${index}-${cIndex}`"
                                  >
                                    {{ citem.name }}
                                  </DropdownItem>
                                </template>
                                <template v-if="row.textVerifyStatus === 1">
                                  <DropdownItem
                                    @click.native="seeDetail(row, citem)"
                                    v-if="
                                      row.textCompleteBy === userInfo.userId
                                    "
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
                            <template
                              v-else-if="
                                !(
                                  row.productSource === 1 &&
                                  row.status === 0 &&
                                  citem.name === '修改'
                                )
                              "
                            >
                              <DropdownItem
                                @click.native="seeDetail(row, citem)"
                                :key="`item7-${index}-${cIndex}`"
                              >
                                {{ citem.name }}</DropdownItem
                              >
                            </template>
                            <!-- <template v-else>
                          <DropdownItem @click.native="seeDetail(row,citem)" :key="`item7-${index}-${cIndex}`">{{citem.name}}</DropdownItem>
                        </template> -->
                          </template>
                        </template>
                      </template>
                    </DropdownMenu>
                  </Dropdown>
                </div>
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
                <span v-if="row.isStock || row.isStock === 0">{{
                  row.isStock === 0 ? "有" : "否"
                }}</span>
              </template> -->
              <template slot-scope="{ row }" slot="create">
                <span v-if="row.createdBy && userDataList[row.createdBy]">{{ userDataList[row.createdBy].userName || '' }}</span>
                <div>
                  {{
                    row.createdTime
                      ? getDataToLocalTime(row.createdTime, "fulltime")
                      : ""
                  }}
                </div>
              </template>
              <template slot-scope="{ row }" slot="finally">
                <span v-if="row.updatedBy && userDataList[row.updatedBy]">{{ userDataList[row.updatedBy].userName || '' }}</span>
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
      :dialogObj.sync="dialogObj"
      :purchaserArr="purchaserArr"
      :operatList="operatList"
      :supplyList="supplyList"
      @fetch="fetchList"
      :productSource="productSource"
    ></require-detail>
    <!-- 添加新品 -->
    <add-products
      :dialogObj="dialogAdd"
      :operatList="operatList"
      :supplyList="supplyList"
      @fetch="fetchList"
      :productSource="productSource"
    ></add-products>
    <!-- 新建云仓 -->
    <addYunCangPopupTab
      :model-visible.sync="addYunCangVisible"
      :purchaserArr="purchaserArr"
      :supplyList="supplyList"
      :operatList="operatList"
      @fetch="fetchList"
      :yuncangData="yuncangData"
      :productSource="productSource"
    />
    <!-- 云仓详情 -->
    <yuncang-detail
      :dialogObj.sync="yuncangObj"
      :purchaserArr="purchaserArr"
      :operatList="operatList"
      :supplyList="supplyList"
      @fetch="fetchList"
      :productSource="productSource"
    ></yuncang-detail>
  </div>
</template>
<script>
import api from "@/api/api.js";
import { downFile } from "@/utils/comConfig.js";
import { timeOption } from "@/utils/comConfig.js";
import {
  columns,
  totalStatusList,
  statusList,
  sourceTypelist,
  developTypeList,
} from "../components/configFile.js";
import pageMixin from "@/components/mixin/page_mixin";
import largePicture from "@/components/largePicture";
import requireDetail from "../stockUp/requireDetail";
import addProducts from "../stockUp/addProducts";
import addYunCangPopupTab from "../yuncang/addYunCangPopupTab";
import yuncangDetail from "../yuncang/yuncangDetail";
import html2canvas from "html2canvas";
import table_highly_adaptive from "@/components/mixin/table_highly_adaptive";

export default {
  name: "createRequire",
  mixins: [pageMixin, table_highly_adaptive],
  components: {
    requireDetail,
    largePicture,
    addProducts,
    addYunCangPopupTab,
    yuncangDetail,
  },
  data() {
    return {
      addYunCangVisible: false,
      searchCriteria: {
        productSourceList: [0, 1, 2, 3, 4],
        queryStatus: 0,
        developmentType: 0,
        createdBy: "",
        updatedBy: "",
        supplierId: "",
        modelNo: "",
        referenceSpu: "",
        createdStartTime: "",
        createdEndTime: "",
        updatedStartTime: "",
        updatedEndTime: "",
        supplierNo: "",
        styleName: "",
        businessDeptIds: "", //部门id
      },
      totalStatusList: totalStatusList,
      statusList: statusList,
      developTypeList: (() => {
        const newVal = this.$common.copy(developTypeList);
        delete newVal[3];
        return newVal;
      })(),
      purchaserArr: [],
      operatList: [],
      supplyList: [],
      options: timeOption,
      columns: columns,
      dialogObj: {
        modelVisible: false,
        data: {},
        tag: "",
        btnoperat: "",
      },
      dialogAdd: {
        modelVisible: false,
      },
      supplyLoading: false,
      listCount: {},
      createdTime: [],
      updatedTime: [],
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
      checked: false,
      isMounted: false,
    };
  },
  computed: {
    authUserInfo () {
      return this.$store.getters["authUserInfo"] || {}
    },
    // 表格数据处理
    tableData () {
      let list =  this.$common.copy(this.tableList);
      let requireVerifyList = [];
      list.forEach(row => {
        requireVerifyList = [];
        if (![8, 9, 10, '8', '9', '10'].includes(row.status)) {
          if ([5, '5'].includes(row.status)) {
            if ((row.pictureVerifyStatus == 0 || row.textVerifyStatus == 0) && row.requireVerifyBy) {
              requireVerifyList.push(row.requireVerifyBy);
            }
            if (row.pictureVerifyStatus == 1 && row.pictureCompleteBy) {
              requireVerifyList.push(row.pictureCompleteBy);
            }
            if (row.pictureVerifyStatus == 2 && row.pictureVerifyBy) {
              requireVerifyList.push(row.pictureVerifyBy);
            }
            if (row.textVerifyStatus == 1 && row.textCompleteBy) {
              requireVerifyList.push(row.textCompleteBy);
            }
            if (row.textVerifyStatus == 2 && row.textVerifyBy) {
              requireVerifyList.push(row.textVerifyBy);
            }
          } else {
            requireVerifyList = [row.requireVerifyBy];
          }
          row.requireVerifyList = this.$common.arrRemoveRepeat(requireVerifyList);
        }
      })
      return list;
    },
    securityUser() {
      return this.authUserInfo.securityUser || {};
    },
  },
  created() {
    this.returnBusinessID();
    this.fetch(api.queryLaPaProductInfoList, "post");
    this.init();
    this.userInfo =
      this.$store.state.erpConfig && this.$store.state.erpConfig.userInfo;
  },
  deactivated() {
    this.dialogObj.modelVisible = false;
  },
  watch: {
    checked(newVal) {
      if (newVal === true) {
        for (let i = 0; i <= 9; i++) {
          this.$refs.createRequire.$refs.tbody.objData[i]._isChecked = true;
        }
      }
    },
  },
  methods: {
    init() {
      // 获取创建人列表
      this.getUserMesCommon().then((result) => {
        if (result) {
          this.purchaserArr = Object.values(this.$store.state.userInfoList);
          this.userDataList = this.$common.copy(this.$store.state.userInfoList || {});
        }
      });
      this.getSupplierList();
      this.getCategoryList();
      // 由于数据更改，导致布局高度变化，所以放在这里
      this.getStiticNum().finally(() => {
        this.computedTableHeight();
      });
    },
    // 重置查询条件
    resetForm() {
      this.reset();
      this.returnBusinessID();
      this.searchCriteria.queryStatus = 0;
      this.searchCriteria.developmentType = 0;
      this.createdTime = [];
      this.updatedTime = [];
    },
    // 部分导出
    exporTOut() {
      if (this.checked == true) {
        let temp = {};
        Object.assign(temp, this.searchCriteria);
        temp.productIds = null;
        this.$Spin.show();
        this.$axios({
          method: "post",
          url: api.exportProductInfoList,
          responseType: "blob",
          timeout: 600000,
          data: temp,
        })
          .then(({ resData, filename }) => {
            downFile(resData, filename);
          })
          .finally(() => {
            this.$Spin.hide();
          });
        return;
      }
      let list = this.columnList || [];
      if (!list.length) {
        this.$Message.error("请勾选款式");
        return;
      }
      let [temp, arr] = [{}, []];
      list.forEach((k) => {
        arr.push(k.productId);
      });
      temp.productIds = arr;
      temp.businessDeptIds = this.securityUser.businessDeptIds || "";
      this.$Spin.show();
      this.$axios({
        method: "post",
        url: api.exportProductInfoList,
        responseType: "blob",
        timeout: 600000,
        data: temp,
      })
        .then(({ resData, filename }) => {
          downFile(resData, filename);
        })
        .finally(() => {
          this.$Spin.hide();
        });
    },
    // 导出全部
    exporTOutall() {
      let temp = this.searchCriteria;
      this.$Spin.show();
      this.$axios({
        method: "post",
        url: api.exportProductInfoList,
        responseType: "blob",
        timeout: 600000,
        data: temp,
      })
        .then(({ resData, filename }) => {
          downFile(resData, filename);
        })
        .finally(() => {
          this.$Spin.hide();
        });
    },
    // 添加/详情
    seeDetail(row, event) {
      if (row.productSource < 2) {
        this.detail(row, event);
      }
      if (row.productSource >= 2) {
        this.ycdetail(row, event);
      }
    },
    // 备货新品
    detail(row, event) {
      this.dialogObj.modelVisible = true;
      this.dialogObj.data = row;
      this.dialogObj.openType = event.openType || "edit";
      this.dialogObj.tag = event.tag;
      this.dialogObj.btnoperat = event.btnoperat;
      this.productSource = row.productSource;
    },
    // 云仓新品
    ycdetail(row, event) {
      if (!(row && event)) {
        // 添加
        this.addYunCangVisible = true;
        this.yuncangData.title = "创建云仓新品需求";
        this.yuncangData.type = "add";
        this.yuncangData.data = {};
        this.productSource = 3;
        return;
      }
      // 详情
      if (row.status >= 2 || event.openType === "view") {
        this.yuncangObj.modelVisible = true;
        this.yuncangObj.data = row;
        this.yuncangObj.openType = event.openType || "edit";
        this.yuncangObj.tag = event.tag;
        this.yuncangObj.btnoperat = event.btnoperat;
        this.productSource = row.productSource;
        return;
      }
      this.yuncangData.data = row;
      this.yuncangData.title = "编辑云仓新品需求";
      this.yuncangData.type = event.name === "提交侵权审核" ? "verify" : "edit";
      this.addYunCangVisible = true;
      this.productSource = row.productSource;
    },
    // 添加新品
    add() {
      this.dialogAdd.modelVisible = true;
      this.productSource = 0;
    },
    // 创建时间
    createTimeChange(e) {
      this.searchCriteria.createdStartTime = e[0] ? e[0] + " 00:00:00" : "";
      this.searchCriteria.createdEndTime = e[1] ? e[1] + " 23:59:59" : "";
    },
    // 更新时间
    updateTimeChange(e) {
      this.searchCriteria.updatedStartTime = e[0] ? e[0] + " 00:00:00" : "";
      this.searchCriteria.updatedEndTime = e[1] ? e[1] + " 23:59:59" : "";
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
    // 获取统计数量（只需要传可查看事业部即可，不需要传所属事业部）
    getStiticNum() {
      return new Promise((resolve, reject) => {
        let businessDeptIds = this.searchCriteria.businessDeptIds;
        if (!businessDeptIds) {
          resolve();
          return;
        }
        this.$axios.post(api.queryLaPaProductListCount, {
          productSourceList: [0, 1, 2, 3, 4],
          businessDeptIds: businessDeptIds
        }).then(({ code, datas }) => {
          if (code !== 0) return;
          this.listCount = datas;
        }).finally(() => {
          resolve();
        });
      });
    },
    // 刷新列表和统计数量
    fetchList() {
      this.fetch();
      this.getStiticNum().finally(() => {
        this.computedTableHeight();
      });
    },
    statusShow(row) {
      let status = false;
      let { userId } = this.userInfo;
      this.statusList.forEach((k) => {
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
    createPic() {
      html2canvas(this.$refs.createRequire.$el, {
        // 是否支持跨域内容渲染到 canvas
        allowTaint: true,
        // 是否支持 canvas 中跨域资源转为 base64
        useCORS: true,
        // 渲染 canvas 和截图后的清晰度，数组越大越清晰
        scale: 1,
        // 渲染 canvas 样式可以在此方法做调整
        onclone: (doc) => {
          doc.querySelector(".ivu-table-wrapper-with-border").style.height =
            "auto";
          doc.querySelector(".ivu-table-overflowY").style.height = "auto";
        },
      }).then((canvas) => {
        // 将 canvas渲染到 document.body, 实际使用中不需要此步骤
        document.body.appendChild(canvas);
        //图片地址
        let base64 = canvas.toDataURL();
        // 将base64转为文件格式
        let file = this.$common.base64ToFile(base64, "");
        let formData = new FormData();
        formData.append("files", file);
        // 上传文件
        this.$axios({
          method: "post",
          url: api.upload,
          data: formData,
          isFile: true,
        }).then((res) => {
          // console.log(res)
        });
      });
    },
    //侵权导出
    exportInfringement() {
      //如果勾选了导出所有集
      if (this.checked == true) {
        let temp = {};
        Object.assign(temp, this.searchCriteria);
        temp.productIds = null;
        this.$Spin.show();
        this.$axios({
          method: "post",
          url: api.exportProductTortInfoList,
          responseType: "blob",
          timeout: 600000,
          data: temp,
        })
          .then(({ resData, filename }) => {
            downFile(resData, filename);
          })
          .finally(() => {
            this.$Spin.hide();
          });
        return;
      }
      let list = this.columnList || [];
      if (!list.length) {
        this.$Message.error("请勾选款式");
        return;
      }
      let [temp, arr] = [{}, []];
      list.forEach((k) => {
        arr.push(k.productId);
      });
      temp.productIds = arr;
      temp.businessDeptIds = this.securityUser.businessDeptIds || "";
      this.$Spin.show();
      this.$axios({
        method: "post",
        url: api.exportProductTortInfoList,
        responseType: "blob",
        timeout: 600000,
        data: temp,
      })
        .then(({ resData, filename }) => {
          downFile(resData, filename);
        })
        .finally(() => {
          this.$Spin.hide();
        });
    },
    // 用户所具有的部门
    returnBusinessID() {
      this.searchCriteria.businessDeptIds = this.securityUser.businessDeptIds || "";
      this.searchCriteria.businessDeptId = this.securityUser.businessDeptId || "";
    },
  },
};
</script>
<style lang="less" scoped>
.create-require {
  .ivu-radio-group-button .ivu-radio-wrapper {
    padding: 0 6px;
  }
}
</style>