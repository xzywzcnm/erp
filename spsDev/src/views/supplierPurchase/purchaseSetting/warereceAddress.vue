<template>
  <div class="mainBody ware-add">
    <div class="cards">
      <div class="title">
        <h2>默认地址</h2>
        <span class="tips"
          >不是其它地址绑定的收货仓库，都使用默认地址做为商家系统的收货地址</span
        >
      </div>
      <top-form :purchaserArrData="purchaserArr"></top-form>
    </div>
    <div class="cards">
      <div class="title">
        <h2>其它地址信息</h2>
        <span class="tips">收货仓库按绑定的地址，做为商家系统的收货地址</span>
      </div>
      <div class="operatBtn mb10">
        <Button
          type="primary"
          @click="setAddress(1)"
          v-if="getPermission('warereceAddress_new')"
          >新建地址</Button
        >
      </div>
      <div class="table-box">
        <Table
          highlight-row
          max-height="460"
          :columns="columns"
          :data="tableList"
          :border="true"
          :loading="Tableloading"
        >
          <template slot-scope="{ row }" slot="store">
            <a
              href="javascript:;"
              style="text-decoration: underline"
              @click="setStore(row)"
            >
              <template v-if="row.warehouseIds && row.warehouseIds.length">
                <span v-for="(item, index) in row.warehouseIds" :key="index">
                  {{ warehouseArr[item] && warehouseArr[item].warehouseName }}
                  {{ index === row.warehouseIds.length - 1 ? "" : "," }}
                </span>
              </template>
              <template v-else>未绑定</template>
            </a>
          </template>
          <template slot-scope="{ row }" slot="detailAddress">
            <span :style="{ color: '#009999' }">{{
              row.warehouseDetailAddress || "-"
            }}</span>
          </template>
          <template slot-scope="{ row }" slot="phone">
            <span :style="{ color: '#009999' }">{{ row.phone || "-" }}</span>
          </template>
          <template slot-scope="{ row }" slot="action">
            <Button
              size="small"
              style="margin-right: 5px"
              @click="setAddress(2, row)"
              v-if="getPermission('warereceAddress_updata')"
              >修改</Button
            >
            <Button
              size="small"
              @click="dels(row)"
              v-if="getPermission('warereceAddress_delete')"
              >删除</Button
            >
          </template>
        </Table>
        <div class="table-page clear">
          <div class="table-page-right">
            <Page
              :total="proPage.total"
              @on-change="proChangePage"
              show-total
              :page-size="proPage.pageSize"
              show-elevator
              :current="proPage.pageNum"
              show-sizer
              @on-page-size-change="proChangePageSize"
              placement="top"
              :page-size-opts="pageArray"
            ></Page>
          </div>
        </div>
      </div>
      <edit
        :dialogObj="dialogObj"
        @fetch="search"
        v-if="dialogObj.modelVisible"
      ></edit>
      <set-store :dialogObj="storeObj" @fetch="search"></set-store>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";
import pagemixin from "@/components/mixin/page_mixin";
import Mixin from "@/components/mixin/common_mixin";
import topForm from "./warereceAddress/topForm.vue";
import edit from "./warereceAddress/edit.vue";
import setStore from "./warereceAddress/setStore.vue";
import { titleList } from "./warereceAddress/configFile";
import Qs from "qs";

export default {
  mixins: [pagemixin, Mixin],
  components: { topForm, edit, setStore },
  data() {
    return {
      columns: titleList,
      searchCriteria: {
        status: "",
        searchKey: "",
        type: "",
      },
      dialogObj: {
        modelVisible: false,
        title: "",
        data: {},
      },
      storeObj: {
        modelVisible: false,
        data: {},
        warehouseArr: [],
      },
      warehouseArr: {},
      purchaserArr: [], //采购人员列表
    };
  },
  created() {
    this.getwarehouse();
    this.getPurchaserArr();
  },
  methods: {
    // post请求
    axiosPost(reqParams) {
      let api = this.api;
      if (Object.keys(this.searchFix).length) {
        api += `?${Qs.stringify(this.searchFix)}`; //有后端要求将某参数放到url后面的要求
      }
      return this.axios.post(api, reqParams).then(({ data }) => {
        if (data.code == 0) {
          this.tableList = data.datas.list;
          // let purchaserInfo = {};
          // this.tableList.forEach((itema) => {
          //   let userList = [];
          //   itema.purchaserIdList.forEach((itemb) => {
          //     purchaserInfo = this.purchaserArr.find((itemc) => itemb == itemc.userId);
          //     if (!this.$common.isEmpty(purchaserInfo)) {
          //       userList.push(purchaserInfo.name);
          //     }
          //   });
          //   itema.purchaserId = userList.join(",");
          // });
          this.proPage.total = data.datas.total;
        }
      }).finally(() => {
        this.Tableloading = false;
      });
    },
    // 获取仓库
    getwarehouse() {
      this.axios.post(api.warehouse, { pageParams: 1 }).then(({ data }) => {
        if (data.code == 0) {
          let obj = {};
          let list = data.datas || [];
          list.forEach((k) => {
            obj[k.warehouseId] = k;
          });
          this.warehouseArr = obj;
          this.storeObj.warehouseArr = list;
        }
      });
    },
    // 删除地址
    dels(row) {
      this.$Modal.confirm({
        title: "操作提示",
        content: `确认是否要删除地址: ${row.addressName}`,
        loading: true,
        onOk: () => {
          // .delete(api.addressDel, { addressList: 1 })
          this.axios({
            url: api.addressDel,
            method: "delete",
            data: row.addressIdList,
          })
            .then(({ data }) => {
              if (data.code == 0) {
                this.$Message.info("操作成功");
                this.search();
              }
            })
            .finally(() => {
              this.$Modal.remove();
            });
        },
      });
    },
    // 新建/修改地址
    setAddress(title, row) {
      this.dialogObj.modelVisible = true;
      this.dialogObj.title = title;
      row ? (this.dialogObj.data = row) : "";
    },
    // 设置仓库
    setStore(row) {
      this.storeObj.modelVisible = true;
      this.storeObj.data = row;
    },
    // 采购人员列表
    getPurchaserArr() {
      let v = this;
      // return this.axios
      //   .post(`/sps-service/sps/setting/address/queryAllPurchaserId`)
      //   .then((res) => {
      //     let arry = res.data.datas;
      return v.axios.get(api.userList).then((res) => {
        if (res.data.code == 0) {
          let arr = [];
          let datas = res.data.datas;
          for (let i in datas) {
            if (i != "service") {
              arr.push({
                userId: datas[i].userId,
                name: datas[i].userName,
              });
            }
          }
          v.purchaserArr = arr;
          //筛选purchaseid
          // arry.forEach((itema, indexa) => {
          //   v.purchaserArr.forEach((itemb, indexb) => {
          //     if (itema == itemb.userId) {
          //       v.purchaserArr.splice(indexb, 1);
          //     }
          //   });
          // });
        }
        this.fetch(api.addressList, "post", "");
      });
      // });
    },
  },
};
</script>

<style scoped>
.ware-add {
  background-color: #fff;
}
.ware-add .title {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #f3f3f3;
  margin-bottom: 14px;
}
.ware-add .title h2 {
  font-size: 16px;
}
.ware-add .title .tips {
  color: #ed4014;
  margin-left: 20px;
}

.ware-add .cards {
  padding: 10px;
  border-bottom: 1px solid #f3f3f3;
}
</style>