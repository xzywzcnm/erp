<template>
  <div class="technologicalRequirePage">
    <div class="tech-picture">
      <h4 class="h4sty">工艺图片</h4>
      <div class="tech-picture-main" :class="{'tech-picture-no-drop': !isEdit}">
        <upload-img v-model="fileList" :options="{ limit: 10, accept: 'image/*' }" />
        <div class="no-drop-mask"></div>
      </div>
    </div>
    <div>
      <h4 class="h4sty mb10">工艺要求</h4>
      <div class="mb10">
        <Button type="primary" @click="add" v-if="isEdit">新增</Button>
      </div>
      <Table border :columns="technoColumns" :data="tableData"></Table>
    </div>
    <Spin v-if="pageLoading" fix></Spin>
    <Modal v-model="productInfo.dialogVisible" width="800" title="新增工艺" :mask-closable="false" :closable="false">
      <div>
        <Form ref="productInfo" :model="productInfo.formValidate" inline :label-width="80" class="fmb16 formSearch">
          <FormItem label="工艺类型:" prop="technologyType">
            <dyt-select v-model="productInfo.formValidate.technologyType" placeholder="请选择" multiple :max-tag-count="1">
              <Option v-for="(item, index) in productInfo.techTypeList" :key="`b-${index}`" :value="item.value">
                {{ item.label }}</Option>
            </dyt-select>
          </FormItem>
          <FormItem label="工艺名称:" prop="technologyName">
            <Input v-model="productInfo.formValidate.technologyName" placeholder="请输入" />
          </FormItem>
          <FormItem label="" :label-width="0">
            <Button type="primary" @click="search">查询</Button>
          </FormItem>
        </Form>
        <Table border :columns="productInfo.modalTableColumns" :data="productInfo.modalTableData" max-height="460"
          @on-selection-change="selectChange" ref="selection" :loading="productInfo.tableLoading"></Table>
        <div style="text-align:right;" class="mt10"><page-common :pageConfig="productInfo.proPage"
            @ChangePage="ChangePage" @ChangePageSize="ChangePageSize"></page-common></div>
      </div>
      <div slot="footer">
        <Button @click="productInfo.dialogVisible = false">取消</Button>
        <Button type="primary" @click="handleNext">保存</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import api from '@/api/api.js';
import UploadImg from '@/components/uploadImg';
import pageCommon from '@/components/pageCommon';
import { craftType } from '@/utils/pdsSettingConstant';

export default {
  name: "technologicalRequire",
  components: { UploadImg, pageCommon },
  props: {
    openType: {type: String, default: 'info'},
    btnoperat: {type: String, default: ''},
    modelVisible: { type: Boolean, default: false },
    productData: {
      type: Object,
      default() {
        return {};
      }
    },
  },
  data() {
    const commonColumns = [
      {
        title: '工艺名称',
        key: 'technologyName',
        align: 'center',
        width: '160',
      },
      {
        title: '工艺类型',
        key: 'technologyType',
        align: 'center',
        width: '160',
        render: (h, params) => {
          let item = craftType[params.row.technologyType] || {};
          return h('span', item.label || '');
        }
      },
      {
        title: '工艺描述',
        key: 'description',
        align: 'center',
      }
    ]
    return {
      pageLoading: false,
      fileList: [],
      tableData: [],
      tableTecColumns: commonColumns,
      productInfo: {
        dialogVisible: false,
        formValidate: { technologyType: [], technologyName: '' },
        modalTableColumns: [
          {
            type: 'selection',
            width: 60,
            align: 'center'
          },
          ...commonColumns,
        ],
        modalTableData: [],
        checkedList: [],
        techTypeList: craftType,
        proPage: {
          total: 0,
          pageNum: 1,
          pageSize: 10,
        },
        tableLoading: false,
      },
    };
  },
  watch: {
    modelVisible: {
      immediate: true,
      handler (val) {
        this.$nextTick(() => {
          setTimeout(() => {
            val && this.pageInit();
          }, 300);
        })
      }
    }
  },
  computed: {
    // 是否可编辑
    isEdit () {
      return ['edit'].includes(this.openType) && ['pEvaluationConfirm'].includes(this.btnoperat);
    },
    // 列表列设置
    technoColumns () {
      const operation = {
        title: '操作',
        key: 'index',
        width: '120',
        align: 'center',
        render: (h, { row, index }) => {
          return h('div', {
            style: {
              display: 'inline-block',
              cursor: 'pointer',
              color: '#2d8cf0',
            },
            on: {
              'click': () => {
                this.$Modal.confirm({
                  title: '操作',
                  content: `<p>确认移除该工艺：${row.technologyName || ''}？</p>`,
                  loading: true,
                  onOk: () => {
                    this.$Modal.remove();
                    this.tableData.splice(index, 1);
                  }
                });
              }
            }
          }, '移除')
        },
      };
      return this.isEdit ? [operation, ...this.tableTecColumns] : this.tableTecColumns;
    }
  },
  created() {},
  methods: {
    pageInit () {
      this.pageLoading = true;
      let awaitRes = [this.detail];
      this.$common.promiseAll(awaitRes).then(resArr => {
        this.pageLoading = false;
        // console.log(resArr);
      }).catch(() => {
        this.pageLoading = false;
      })
    },
    detail() {
      return new Promise((resolve) => {
        const rqApi = `${api.queryProductTechnology}?productId=${this.productData.productId}`;
        this.axios.get(rqApi).then((data) => {
          if (data && data.datas) {
            let temps = data.datas || {};
            this.fileList = (temps.laPaProductTechnologyImages || []).map(item => {
              return {
                url: item.fileUrl || '',
                name: item.fileName,
                selected: false
              }
            });
            this.tableData = (temps.laPaProductTechnologyRequests || []).map(k => {
              return {
                description: k.technologyDesc,
                ...k,
              }
            })
            return resolve(temps);
          }
          resolve({});
        }).catch((err) => {
          console.error(err);
          resolve({});
        })
      })
    },
    // 返回表单值 type 为 1 时验证， 其他值不验证
    getFormData (type) {
      return new Promise((resolve) => {
        let temp = {
          laPaProductTechnologyImages: []
        };
        if (!this.$common.isEmpty(this.fileList)) {
          temp.laPaProductTechnologyImages = this.fileList.map(item => {
            return {
              fileUrl: item.url,
              fileName: item.name
            }
          });
        }
        temp.productId = this.productData.productId;
        temp.laPaProductTechnologyRequests =  this.tableData.map(k => {
          return {
            technologyName: k.technologyName,
            technologyId: k.technologyId,
            technologyType: k.technologyType,
            technologyDesc: k.description,
          }
        })
        if (type == 1) {
          if (this.$common.isEmpty(temp.laPaProductTechnologyRequests)) {
            this.$Message.error('“工艺要求”工艺至少选一个');
            return resolve({ success: false, message: '“工艺要求”工艺至少选一个' });
          }
          resolve({ success: true, data: temp });
          return;
        }
        resolve({ success: true, data: temp });
      })
    },
    // 保存当前值 type 为 1 时验证， 其他值不验证
    saveFormData (type) {
      return new Promise((resolve) => {
        this.getFormData(type).then(res => {
          if (!res.success) return resolve({ success: false, message: '表单验证不通过' });
          this.pageLoading = true;
          this.axios.post(api.saveProductTechnology, res.data).then(({ code, datas }) => {
            if (code != 0) return resolve({ success: false, message: '请求失败' });
            resolve({ success: true, data: datas, isColose: type != 1  });
          }).catch(err => {
            resolve({ success: false, data: err  });
          }).finally(() => {
            this.pageLoading = false;
          })
        })
      })
    },
    add() {
      this.productInfo.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs['productInfo'].resetFields();
        this.$refs.selection.selectAll(false);
      })
      this.search();
    },
    search() {
      this.productInfo.proPage.pageNum = 1;
      this.getList();
    },
    getList() {
      let temp = this.$common.removeEmpty({ ...this.productInfo.formValidate, ...this.productInfo.proPage });
      delete temp.total;
      this.productInfo.tableLoading = true;
      this.axios.post(api.queryProductTechnologyList, temp).then((data) => {
        if (data && data.datas) {
          this.productInfo.modalTableData = data.datas.list || [];
          this.productInfo.proPage.total = data.datas.total || 0;
          this.$refs.selection.selectAll(false);
          this.productInfo.checkedList = [];
        }
      }).finally(() => {
        this.productInfo.tableLoading = false;
      });
    },
    handleNext() {
      let list = this.productInfo.checkedList;
      if (!list.length) {
        this.$Message.warning('请勾选要添加的工艺!');
        return;
      }
      let temp = {};
      let arr = [...this.tableData, ...list];
      arr.forEach(k => { temp[k.technologyId] = k });
      this.tableData = Object.values(temp);
      this.productInfo.dialogVisible = false;
    },
    // 表格多项选择
    selectChange(list) {
      this.productInfo.checkedList = list;
    },
    // 返回pageSize
    ChangePageSize(pageSize) {
      this.productInfo.proPage.pageSize = pageSize;
      this.getList();
    },
    // 返回page
    ChangePage(page) {
      this.productInfo.proPage.pageNum = page;
      this.getList();
    },
  }
};
</script>
<style lang="less" scoped>
.technologicalRequirePage {
  position: relative;
  .h4sty {
    font-weight: bold;
    width: 80px;
  }

  .tech-picture {
    display: flex;
    margin-bottom: 30px;
    .tech-picture-main{
      position: relative;
      .no-drop-mask{
        display: none;
      }
      &.tech-picture-no-drop{
        .no-drop-mask{
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          cursor: no-drop;
        }
      }
    }
  }

  // .table-footer {
  //   display: flex;
  //   align-items: center;
  //   padding: 10px 0;
  //   border: 1px solid #dcdee2;
  //   border-top: none;
  //   background-color: #f8f8f9;

  //   .seat {
  //     width: 120px;
  //   }

  //   .flex1 {
  //     flex: 1;
  //     display: flex;
  //     justify-content: center;
  //   }
  // }
}
</style>
