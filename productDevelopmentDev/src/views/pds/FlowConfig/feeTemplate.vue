<template>
  <div class="mainBox">
    <Card shadow class="card-self-style">
      <div class="list-page">
        <div class="pb15">
          <Button @click="openModal1('add')">新增</Button>
        </div>
        <div class="table-main mt10">
          <div :class="['table-list',tableClass]">
            <Table :columns="columns1" :loading="tableLoading" :data="tableList" :height="tableHeight"></Table>
          </div>
          <page-common :pageConfig="proPage" @ChangePage="ChangePage" @ChangePageSize="ChangePageSize"></page-common>
        </div>
      </div>
    </Card>
    <Modal v-model="modal1" class="fee-temp-modal" :mask-closable="false" width="800" :on-visible-change="visible" :title="modal1Title">
      <feeTemplateContent :editStatus="editStatus" @emitCloseModal="emitCloseModal" ref="feeTemplateContent"></feeTemplateContent>
      <div slot="footer">
        <Button type="text" @click="modal1 = false">取消</Button>
        <Button type="primary" @click="saveFeeTemplate" v-show="editStatus !== 'look'">保存</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from "@/api/api";
import pageMixin from '@/components/mixin/page_mixin';
import feeTemplateContent from "./components/feeTemplateContent";
import table_highly_adaptive from '@/components/mixin/table_highly_adaptive';
export default {
  name: "feeTemplate",
  mixins: [pageMixin, table_highly_adaptive],
  components: {
    feeTemplateContent
  },
  data () {
    let v = this;
    return {
      editStatus: "edit",
      columns1: [
        {
          title: "操作",
          key: "name",
          render (h, params) {
            return h("local-down-button", {
              props: {
                data: {
                  btn: {
                    text: "编辑",
                    clickFn: () => {
                      let data = JSON.parse(JSON.stringify(params.row));
                      v.openModal1("edit");
                      v.$refs.feeTemplateContent.setFrom(data);
                    }
                  },
                  list: [
                    {
                      text: "查看",
                      value: 1,
                      clickFn: () => {
                        let data = JSON.parse(JSON.stringify(params.row));
                        v.openModal1("look").then(() => {
                          v.$refs.feeTemplateContent.setFrom(data);
                        });
                      }
                    },
                    {
                      text: "复制",
                      value: 3,
                      clickFn: () => {
                        let data = JSON.parse(JSON.stringify(params.row));
                        v.openModal1("add").then(() => {
                          v.$refs.feeTemplateContent.setFrom(data, "copy");
                        });
                      }
                    },
                    {
                      text: "删除",
                      value: 2,
                      clickFn: () => {
                        v.isDelModal(() => {
                          v.$refs.feeTemplateContent.delTempate(
                            params.row.chargeTemplateId
                          );
                        });
                      }
                    }
                  ]
                }
              }
            });
          }
        },
        {
          title: "模板名称",
          key: "templateName" // 模板名称
        },
        {
          title: "是否海外仓发货",
          key: "overseaDeliveryFlag", // 是否海外仓发货(0否,1是)
          render (h, params) {
            if (params.row.overseaDeliveryFlag === 0) {
              return h("span", "否");
            } else {
              return h("span", "是");
            }
          }
        },
        {
          title: "适用平台",
          key: "platformName" // 适用平台名称
        }
      ],
      modal1: false
    };
  },
  created () {
    this.fetch(api.chargeTemplateList, 'post');
  },
  methods: {
    emitCloseModal () {
      this.modal1 = false;
      this.fetch();
    },
    visible (open) {
      if (open) {
        this.editStatus = "";
      }
    },
    saveFeeTemplate () {
      this.$refs.feeTemplateContent.operating();
    },
    openModal1 (status) {
      return new Promise((resolve) => {
        status === "add" ? this.$refs.feeTemplateContent.resetFields() : "";
        this.editStatus = status;
        this.modal1 = true;
        resolve();
      });
    }
  },
  computed: {
    modal1Title () {
      return this.editStatus === "edit" ? "编辑费用模板" : "新增费用模板";
    }
  }
};
</script>

<style>
.fee-temp-modal .ivu-modal-body {
  max-height: initial;
}
</style>
