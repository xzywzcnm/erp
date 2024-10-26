<template>
  <div>
    <Modal v-model="isVisible" title="质检问题产品详情" :width="1140" :mask-closable="false" :closable="modalClose"
      class="qualityProblemProducts-fully formDetail">
      <div>
        <Form ref="formCustom" :model="formData" :label-width="0" class="fmb0">
          <div class="mb10">
            <FormItem label="问题件处理状态:" :label-width="120">
              <div class="flexCenter">
                <div v-if="problemStatusList[formData.questionHandStatus]">
                  {{ problemStatusList[formData.questionHandStatus].label }}
                </div>
              </div>
            </FormItem>
          </div>

          <Table highlight-row border :columns="columns" :data="formData.tableList" :loading="tableLoading"
            maxHeight="600">
            <template slot-scope="{ row }" slot="basicInfo">
              <div class="order-item" v-if="row.skuInfo">
                <div class="order-li">SKU：{{ row.skuInfo.goodsSku || "" }}</div>
                <div class="order-li--text">
                  <Tooltip :content="row.skuInfo.goodsCnDesc" :disabled="!row.skuInfo.goodsCnDesc" placement="top">
                    {{ row.skuInfo.goodsCnDesc || "" }}</Tooltip>
                </div>
                <div class="order-li order-li--tag">
                  {{ row.skuInfo.goodsAttributes || "" }}
                </div>
              </div>
            </template>
            <template slot-scope="{ row }" slot="checkAttachment">
              <div class="picture-width">
                <dyt-previewImg :fileList="returnList(row)"
                  :imgOption="{ listWidth: 50, listHeight: 50, mode: 'multiple' }">
                </dyt-previewImg>
              </div>
            </template>
            <template slot-scope="{ row, index }" slot="operator">
              <FormItem label="" :prop="'tableList.' + index + '.questionType'" style="padding: 4px 0" v-if="!isDisabled">
                <dyt-select v-model="formData.tableList[index].questionType">
                  <Option v-for="item in handleOpinions" :value="item.value" :key="item.value" :label="item.label">
                  </Option>
                </dyt-select>
              </FormItem>
              <span v-else>{{ handleOpinions[row.questionType] && handleOpinions[row.questionType].label }}</span>
              <div v-if="handleOpinions[row.questionType]" class="tips mt6">
                提示：{{ handleOpinions[row.questionType].tips }}
              </div>
            </template>
            <template slot-scope="{ row, index }" slot="handleRemark">
              <FormItem label="" :prop="'tableList.' + index + '.handleRemark'" v-if="!isDisabled">
                <dyt-input v-model.trim="formData.tableList[index].handleRemark" type="textarea"></dyt-input>
              </FormItem>
              <Tooltip max-width="400" :content="row.handleRemark"
                :disabled="!(row.handleRemark && row.handleRemark.length)" placement="top" transfer v-else>
                <div class="textOverThree" v-html="row.handleRemark" style="white-space: pre-line;"></div>
              </Tooltip>
            </template>
          </Table>
        </Form>
      </div>
      <div slot="footer">
        <template v-if="isEdit">
          <Button type="primary" @click="submitProblem" :disabled="btnLoading" v-if="[1, '1'].includes(formData.questionHandStatus) &&
            getPermission('fullTrusteeshipPicking_finishHandlerQuestion')
            ">标记已处理</Button>
          <Button type="primary" @click="save" class="ml20" :loading="saveLoading" v-if="[0, '0'].includes(formData.questionHandStatus) &&
            getPermission('fullTrusteeshipPicking_updateCheckQuestion')
            ">保存</Button>
        </template>
        <Button @click="isVisible = false">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from "@/api/api";
import { handleOpinions, arrayToObj, problemStatusList } from "./fileData";
import permission_mixin from "@/components/mixin/permission_mixin";
export default {
  name: "qualityProblemProducts",
  mixins: [permission_mixin],
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return false;
      },
    },
    modalData: {
      //出库单信息
      type: Object,
      default() {
        return {};
      },
    },
    totalCheckBatchInfo: {
      //质检总信息
      type: Object,
      default() {
        return {};
      },
    },
    isEdit: {
      //是否可编辑
      type: Boolean,
      default() {
        return false;
      },
    },
  },
  data() {
    return {
      isVisible: false,
      handleOpinions: arrayToObj(handleOpinions),
      problemStatusList: arrayToObj(problemStatusList),
      formData: {
        questionHandStatus: null,
        tableList: [],
      },
      columns: [
        {
          title: "基本信息",
          slot: "basicInfo",
          align: "left",
          minWidth: 240,
        },
        {
          title: "问题原因",
          key: "reason",
          align: "left",
          minWidth: 120,
          tooltip: true,
        },
        {
          title: "质检图片",
          slot: "checkAttachment",
          align: "left",
          width: 150,
        },
        {
          title: "问题数量",
          key: "questionNumber",
          align: "left",
          width: 100,
        },
        {
          title: "处理方式",
          slot: "operator",
          align: "left",
          minWidth: 120,
        },
        {
          title: "备注",
          slot: "handleRemark",
          align: "left",
          minWidth: 180,
        },
      ],
      tableLoading: false, // 表格加载
      btnLoading: false, // 表单提交加载
      saveLoading: false, // 表单提交加载
      isChange: false, //是否改动过
    };
  },
  watch: {
    modelVisible: {
      handler(val) {
        val && this.open();
      },
      deep: true,
    },
    isVisible: {
      handler(val) {
        if (val) return;
        this.$emit("update:modelVisible", false);
        this.isChange && this.$emit("backReturnList");
      },
      deep: true,
    },
  },
  computed: {
    modalClose() {
      return !this.$store.getters.getSelfPreviewDialog;
    },
    isDisabled() {
      return !(this.isEdit && [0, "0"].includes(this.formData.questionHandStatus));
    },
  },
  methods: {
    // 窗口打开
    open() {
      this.resetData();
      this.isVisible = true;
      this.isChange = false;
      this.getDetail();
    },
    resetData() {
      this.formData.questionHandStatus = null;
      this.formData.tableList = [];
      this.btnLoading = false;
    },
    // 获取质检问题产品详情数据
    getDetail() {
      let { pickingId } = this.modalData;
      this.tableLoading = true;
      this.axios
        .post(api.fullManage_getCheckQuestionBatch, { pickingId })
        .then(({ data }) => {
          if (data.code !== 0) return;
          let temp = data.datas || {};
          this.formData.questionHandStatus = temp.questionHandStatus;
          this.formData.tableList = temp.fullTrusteeshShipCheckQuestionVOS || [];
        })
        .finally(() => {
          this.tableLoading = false;
        });
    },
    // 处理图片列表
    returnList(row) {
      let checkAttachment = row.checkAttachment ? row.checkAttachment.split(",") : [];
      let list = checkAttachment.map((k, i) => {
        return { url: k };
      });
      return list;
    },
    // 保存
    save() {
      this.$refs["formCustom"].validate((valid) => {
        if (!valid) return;
        let { pickingId } = this.modalData;
        let temp = {};
        temp.pickingId = pickingId;
        temp.trusteeshipPickingQualityCheckQuestions = this.formData.tableList.map(
          (k) => {
            return {
              checkQuestionId: k.checkQuestionId,
              questionType: k.questionType,
              handleRemark: k.handleRemark,
            };
          }
        );
        // console.log(temp);
        // return;
        this.saveLoading = true;
        this.axios
          .post(api.fullManage_updateCheckQuestionInfo, temp)
          .then(({ data }) => {
            if (data.code !== 0) return;
            this.$Message.success("操作成功");
            this.$emit("backReturnList");
            this.isVisible = false;
          })
          .finally(() => {
            this.saveLoading = false;
          });
      });
    },
    // 提交
    submitProblem() {
      let { pickingId } = this.modalData;
      if (this.formData.tableList.length && !(this.formData.questionHandStatus == 1)) {
        this.$Message.warning("问题件的处理方式还没分配，不能标记完成！");
        return;
      }
      this.btnLoading = true;
      this.axios
        .post(api.fullManage_finishHandlerQuestion + pickingId)
        .then(({ data }) => {
          if (data.code !== 0) return;
          this.$Message.success("操作成功");
          this.$emit("backReturnList");
          this.isVisible = false;
        })
        .finally(() => {
          this.btnLoading = false;
        });
    },
  },
};
</script>

<style lang="less">
.qualityProblemProducts-fully {
  .tips {
    color: #8f8a8a;
    line-height: 14px;
    font-size: 12px;
    padding-top: 4px;
  }
}
</style>
