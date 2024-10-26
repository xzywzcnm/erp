<template>
  <div class="outerboxInfoPage">
    <div v-if="pickingTypeName">
      <!-- 睿邑达 -->
      <template v-if="detailData.pickingType === 'O17'">
        <div>
          <div v-if="canEdit">
            <div class="flexCenter mb10">
              <span class="span_label">睿邑达入库单号：</span>
              <dyt-input type="text" v-model="riyidInfo.orderCode" placeholder="请输入睿邑达入库单号" style="width: 240px">
              </dyt-input>
            </div>
            <div class="flexCenter mb10">
              <span class="span_label">睿邑达目标仓库：</span>
              <dyt-input type="text" v-model="riyidInfo.targetWarehouse" maxlength="20" show-word-limit
                placeholder="请输入睿邑达目标仓库" style="width: 240px">
              </dyt-input>
            </div>
          </div>
          <div class="flexCenter">
            <span class="span_label"></span>
            <Button type="primary" @click="rinidLabel" :loading="loading">生成睿邑达标签</Button>
            <!-- <div v-if="fbaOutBox.labelUrl" class="pdl150">
              <a :href="fbaOutBox.labelUrl" target="_self">
                <Icon type="md-pricetags" style="transform: rotate(-90deg)" />
                {{ fbaOutBox.labelName || "下载链接" }}
              </a>
              <div v-if="getPermission('wmsFbaPicking_printOuterBoxLabel')" class="right_btn">
                <Button type="primary" @click="print('fbaOutBox')">打印{{ pickingTypeName }}外箱标签</Button>
              </div>
            </div> -->
            <!-- 更改为多个文件 -->
            <div v-if="fbaOutBox.labelList.length" class="pdl150 flexWrap">
              <div v-for="(item, index) in fbaOutBox.labelList" :key="index" class="mr20 mb10">
                <a :href="item.labelUrl" target="_self">
                  <Icon type="md-pricetags" style="transform: rotate(-90deg)" />
                  {{ item.labelName || "下载链接" }}
                </a>
                <div v-if="getPermission('wmsFbaPicking_printOuterBoxLabel')" class="right_btn">
                  <Button type="primary" @click="print('fbaOutBox', index)">打印{{ pickingTypeName }}外箱标签</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <!-- 其余出库单类型 -->
      <template v-else>
        <div class="flexCenter mb10">
          <div class="flexCenter" v-if="canEdit">
            <span class="span_label">上传{{ pickingTypeName }}外箱标签：</span>
            <upload-common v-model="fbaOutBox.fileList" :uploadApi="fbaOutBox.uploadApi" @successUpload="successUpload"
              :options="{ name: 'pdfFile', format: ['pdf'], maxSize: 40960 }"></upload-common>
          </div>
          <!-- 链接 -->
          <!-- <div v-if="fbaOutBox.labelUrl" class="pdl150">
            <a :href="fbaOutBox.labelUrl" target="_self">
              <Icon type="md-pricetags" style="transform: rotate(-90deg)" />
              {{ fbaOutBox.labelName || "下载链接" }}
            </a>
            <div v-if="getPermission('wmsFbaPicking_printOuterBoxLabel')" class="right_btn">
              <Button type="primary" @click="print('fbaOutBox')">打印{{ pickingTypeName }}外箱标签</Button>
            </div>
          </div> -->
          <!-- 更改为多个文件 -->
          <div v-if="fbaOutBox.labelList.length" class="pdl150 flexWrap">
            <div v-for="(item, index) in fbaOutBox.labelList" :key="index" class="mr20">
              <a :href="item.labelUrl" target="_self">
                <Icon type="md-pricetags" style="transform: rotate(-90deg)" />
                {{ item.labelName || "下载链接" }}
              </a>
              <i class="ivu-icon ivu-icon-ios-trash-outline deleteBtn" @click="deleteFile(index)"></i>
              <div v-if="getPermission('wmsFbaPicking_printOuterBoxLabel')" class="right_btn">
                <Button type="primary" @click="print('fbaOutBox', index)">打印该{{ pickingTypeName }}外箱标签</Button>
              </div>
            </div>
          </div>
        </div>
      </template>
      <!-- FBP额外上传文件 -->
      <template v-if="detailData.pickingType === 'O18'">
        <div class="mb10 flexCenter">
          <div class="flexCenter" v-if="canEdit">
            <span class="span_label">上传发货交接单：</span>
            <upload-common v-model="deliveryInfo.fileList" :uploadApi="deliveryInfo.uploadApi"
              @successUpload="successUpload" :data="deliveryInfo.data" :options="{
                name: 'pdfFile',
                format: ['pdf', 'xls', 'xlsx', 'xlsm'],
                maxSize: 40960,
              }"></upload-common>
          </div>
          <div v-if="deliveryInfo.labelUrl" class="pdl150">
            <a :href="deliveryInfo.labelUrl" target="_self">
              <Icon type="md-pricetags" style="transform: rotate(-90deg)" />
              {{ deliveryInfo.labelName || "下载链接" }}
            </a>
            <div v-if="pdfToPrint('deliveryInfo')" class="right_btn">
              <Button type="primary" @click="print('deliveryInfo')">打印FBP发货交接单</Button>
            </div>
          </div>
        </div>
        <div class="mb10 flexCenter">
          <div class="flexCenter" v-if="canEdit">
            <span class="span_label">上传发货清单：</span>
            <upload-common v-model="shippingInfo.fileList" :uploadApi="shippingInfo.uploadApi"
              @successUpload="successUpload" :data="shippingInfo.data" :options="{
                name: 'pdfFile',
                format: ['pdf', 'xls', 'xlsx', 'xlsm'],
                maxSize: 40960,
              }"></upload-common>
          </div>
          <div v-if="shippingInfo.labelUrl" class="pdl150">
            <a :href="shippingInfo.labelUrl" target="_self">
              <Icon type="md-pricetags" style="transform: rotate(-90deg)" />
              {{ shippingInfo.labelName || "下载链接" }}
            </a>
            <div v-if="pdfToPrint('shippingInfo')" class="right_btn">
              <Button type="primary" @click="print('shippingInfo')">打印FBP发货清单</Button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import api from "@/api/api";
import uploadCommon from "./uploadCommon";
import { outListTypeList } from "./fileData";
import common from "@/components/mixin/common_mixin";
export default {
  name: "outerboxInfo",
  mixins: [common],
  components: { uploadCommon },
  props: {
    detailData: {
      type: Object,
      default() {
        return {};
      },
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    detailData: {
      handler(val) {
        if (!val.pickingId) return;
        this.setData(JSON.parse(JSON.stringify(val)));
        this.outListTypeList.forEach((k) => {
          if (k.value === val.pickingType) {
            this.pickingTypeName = k.oname || "";
          }
        });
      },
      deep: true,
      immediate: true,
    },
  },
  computed: {
    canEdit() {
      let power = this.getPermission("wmsFbaPicking_uploadFbaOutBoxLabel");
      return this.isEdit && power;
    },
  },
  data() {
    return {
      deliveryList: [],
      shippingList: [],
      fbaOutBox: {
        fileList: [],
        // labelUrl: "",
        // labelName: "",
        labelList: [],
        uploadApi: "", // 上传接口
      },
      deliveryInfo: {
        fileList: [],
        labelUrl: "",
        labelName: "",
        uploadApi: api.uploadFbaDeliveryLabel, // 上传接口
        data: {},
      },
      shippingInfo: {
        fileList: [],
        labelUrl: "",
        labelName: "",
        uploadApi: api.uploadFbaDeliveryLabel, // 上传接口
        data: {},
      },
      outListTypeList: outListTypeList,
      pickingTypeName: "", // 类型名称
      riyidInfo: {
        orderCode: "", //睿邑达入库单号
        targetWarehouse: "", //睿邑达目标仓库
      },
      loading: false,
    };
  },
  methods: {
    setData(val) {
      this.fbaOutBox.uploadApi = `${api.uploadFbaOutBoxLabel}?pickingId=${val.pickingId}`;
      this.deliveryInfo.data = {
        pickingId: val.pickingId,
        uploadType: 1,
      };
      this.shippingInfo.data = {
        pickingId: val.pickingId,
        uploadType: 2,
      };

      let erpCommon = this.$store.state.erpConfig;
      let prex = erpCommon.filenodeViewTargetUrl;
      let fun = (url) => {
        return url ? prex + url : url;
      }
      // this.fbaOutBox.labelUrl = fun(val.fbaOutBoxLabelUrl);
      // this.fbaOutBox.labelName = val.fbaOutBoxLabelName || '';
      // 需 求海外仓出库单外箱标签变更为允许上传多个文件 相关需求：http://192.168.91.3/www/index.php?m=task&f=view&taskID=9768
      this.fbaOutBox.labelList = []
      let outBoxLabelUrlList = !this.$common.isEmpty(val.fbaOutBoxLabelUrl) ? val.fbaOutBoxLabelUrl.split(',') : []
      let outBoxLabelNameList = !this.$common.isEmpty(val.fbaOutBoxLabelName) ? val.fbaOutBoxLabelName.split(',') : []
      outBoxLabelUrlList.forEach((item, index) => {
        this.fbaOutBox.labelList.push({
          labelName: outBoxLabelNameList[index],
          labelUrl: fun(item)
        })
      })
      // 发货交接单
      this.deliveryInfo.labelUrl = fun(val.deliveryJoinUrl);
      this.deliveryInfo.labelName = val.deliveryJoinName || '';
      // 发货清单
      this.shippingInfo.labelUrl = fun(val.deliveryDetailedUrl);
      this.shippingInfo.labelName = val.deliveryDetailedName || '';
    },
    // 导入成功
    successUpload(res) {
      if (res.code !== 0) {
        this.$Message.error(res.message || "系统错误!");
        return;
      }
      this.$Message.success("上传成功!");
      this.$emit("searchData");
    },
    // 打印外箱标签(labelUrl外箱标签链接)
    print(type, index) {
      let labelUrl = type === "fbaOutBox" && !this.$common.isEmpty(index) ? this[type].labelList[index].labelUrl : this[type].labelUrl
      let url =
        window.location.origin +
        "/wms-service/" +
        labelUrl;
      window.open("/wms-service/static/pdf/web/viewer.html?file=" + url);
    },
    // 生成睿邑达标签
    rinidLabel() {
      let riyidInfo = this.riyidInfo;
      if (!riyidInfo.orderCode) {
        this.$Message.error("请填写睿邑达入库单号!");
        return;
      }
      let { pickingId } = this.detailData || {};
      let rqApi = `${api.genRuiYiDaBoxLabel}${pickingId}`;
      Object.keys(riyidInfo).forEach((k, i) => {
        if (!riyidInfo[k]) return;
        let str = rqApi.indexOf('?') >= 0 ? '&' : '?';
        rqApi += `${str}${k}=${riyidInfo[k]}`;
      })
      this.loading = true;
      this.axios.post(rqApi).then(({ data }) => {
        let { code } = data || {};
        if (code !== 0) return;
        this.$Message.success("操作成功!");
        this.$emit("searchData");
      }).finally(() => {
        this.loading = false;
        Object.keys(this.riyidInfo).forEach((k, i) => {
          this.riyidInfo[i] = '';
        })
      });
    },
    pdfToPrint(type) {
      let power = this.getPermission('wmsFbaPicking_printOuterBoxLabel');
      let url = this[type].labelUrl;
      let isPdf = /^.+(\.pdf)$/.test(url);
      return power && isPdf;
    },
    deleteFile(index) {
      let { pickingId, fbaOutBoxLabelName, fbaOutBoxLabelUrl } = this.detailData || {};
      let labelUrlList = fbaOutBoxLabelUrl.split(',')
      let labelNameList = fbaOutBoxLabelName.split(',')
      labelUrlList.splice(index, 1)
      labelNameList.splice(index, 1)
      let obj = {
        pickingId: pickingId,
        fbaOutBoxLabelUrl: labelUrlList.join(','),
        fbaOutBoxLabelName: labelNameList.join(',')
      }
      this.loading = true
      this.axios.post(api.updateFbaOutBoxLabel, obj).then(res => {
        let { code } = res.data || {};
        if (code !== 0) return;
        this.$Message.success("操作成功!");
        this.$emit("searchData");
      }).finally(() => {
        this.loading = false;
      })
    }
  },
};
</script>
<style lang="less" scoped>
.outerboxInfoPage {
  .span_label {
    width: 180px;
    text-align: right;
  }

  .right_btn {
    margin-left: 20px;
    display: inline-block;
  }

  .pdl150 {
    padding-left: 30px;
  }

  .flexWrap {
    display: flex;
    flex-wrap: wrap;
    /* 在空间不足时换行 */
  }

  .deleteBtn {
    font-size: 20px;
    cursor: pointer;
  }
}
</style>
