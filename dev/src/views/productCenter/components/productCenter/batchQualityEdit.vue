<template >
  <Modal v-model="isVisible" title="批量编辑质检模板" width="800">
    <div class="quality-edit">
      <Form
        class="quality-edit-form"
        ref="batchQualityEdit"
        :model="formData"
        :label-width="80"
        label-position="right"
      >
        <Form-item label="质检模板：">
          <dyt-select v-model="formData.qualityTemplateId" :transfer="false" placeholder="请选择质检项目">
            <Option
              v-for="(option, index) in qualityTemplateList"
              :value='option.qualityClassificationId'
              :key="`b_${index}`"
            >{{option.qualityClassification}}</Option>
          </dyt-select>
        </Form-item>
        <div style="padding: 0 0 15px 20px;">
          <Table highlight-row border :height="tableHeight" :columns="tableColumns" :data="tableData" />
          <div style="padding: 15px 20px 0 0; text-align: right;">质检价格合计：{{ editModalTotal.toFixed(2) }}</div>
        </div>
      </Form>
      <Spin v-if="pageLoading" fix></Spin>
    </div>
    <div slot="footer">
      <Button @click="isVisible = false">取 消</Button>
      <Button type="primary" @click="saveQuality" :disabled="pageLoading">确 定</Button>
    </div>
  </Modal>
</template>

<script>
import api from '@/api/api';

export default {
  name: 'batchQualityEdit',
  props: {
    modalVisible: { type: Boolean, default: false },
    refreshTable: { type: Boolean, default: false },
    classificationId: { type: [Number, String], default: null },
    spuTotal: { type: Number, default: null },
    qualityEditData: { type: Array, default: () => { return [] } },
    selectAll: { type: Boolean, default: false },
    searchParams: { type: Function, default: () => { return {} } },
  },
  data () {
    return {
      isVisible: false,
      // 表单数据组
      formData: {
        classificationId: '',
        qualityTemplateId: ''
      },
      // 表单验证规则
      formRule: {},
      oldFormData: {},
      qualityTemplateList: [],
      tableHeight: 450,
      tableColumns: [
        {
          title: '质检项目',
          key: 'qualityProject',
          width: 150,
          align: 'left',
          render: (h, { row }) => {
            if (this.priceDisabled(row.price)) {
              return h('span', {
                style: {
                  color: '#f20'
                }
              }, row.qualityProject || '')
            }
            return h('span', {}, row.qualityProject || '');
          }
        },
        {
          title: '质检内容描述',
          key: 'qualityDescription',
          minWidth: 200,
          align: 'left',
          render: (h, { row }) => {
            if (this.priceDisabled(row.price)) {
              return h('span', {
                style: {
                  color: '#f20'
                }
              }, row.qualityDescription || '')
            }
            return h('span', {}, row.qualityDescription || '');
          }
        },
        {
          title: '价格',
          key: 'price',
          width: 120,
          render: (h, { row }) => {
            if (this.priceDisabled(row.price)) {
              return h('Poptip', {
                props: {
                  placement: 'right',
                  trigger: 'hover',
                  transfer: true
                }
              }, [
                h('div', {
                  style: {
                    color: '#f20'
                  }
                }, '不可用'),
                h('div', {
                  slot: 'content',
                  props: {},
                  attrs: {},
                }, '质检价格为空，不可用，请先完善价格信息')
              ]);
            }
            return h('span', row.price);
          }
        }
      ],
      qualityTemplateJson: {},
      pageLoading: false
    }
  },
  watch: {
    modalVisible: {
      immediate: true,
      handler (val) {
        this.isVisible = val;
        val ? this.initData() : this.restData();
      }
    },
    isVisible: {
      handler (val) {
        this.$emit('update:modalVisible', val);
      }
    }
  },
  created () {},
  computed: {
    tableData () {
      return this.qualityTemplateJson[this.formData.qualityTemplateId] || [];
    },
    editModalTotal () {
      if (this.$common.isEmpty(this.tableData)) return 0;
      let priceTotal = 0;
      this.tableData.forEach(row => {
        if (!this.priceDisabled(row.price)) {
          priceTotal += row.price;
        }
      })
      return priceTotal;
    }
  },
  methods: {
    // 初始化页面数据
    initData () {
      this.pageLoading = true;
      this.oldFormData = this.$common.copy(this.formData);
      this.formData.classificationId = this.classificationId;
      const getDataArray = [() => {
        return this.getAllQuality()
      }];
      // 初始化需要获取的数据
      this.$common.allSettled(getDataArray).then((arr) => {
        this.pageLoading = false;
      }).catch(() => {
        this.pageLoading = false;
      })
    },
    // 保存
    saveQuality () {
      let formParams = {
        selectAll: this.selectAll === true ? 1 : 0,
      };
      this.$Modal.confirm({
        title: '确认是否批量修改数据？',
        content: `这次修改数据：${this.selectAll === true ? this.spuTotal : this.qualityEditData.length} 条`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          this.pageLoading = true;
          if (this.selectAll) {
            formParams = {
              ...formParams,
              ...this.searchParams()
            }
          } else {
            formParams.productIdList = this.qualityEditData.map(p => p.productId);
          }
          this.axios.post(`${api.batchUpdateProductQualityTemplate}${this.formData.qualityTemplateId}`, formParams).then(res => {
            this.pageLoading = false;
            if (res.data && res.data.code == 0) {
              this.$Message.success('修改成功！');
              // 当关闭弹窗时去刷新列表
              this.$emit('update:refreshTable', true);
              this.$nextTick(() => {
                this.isVisible = false;
              })
            } else {
              this.$Message.error('修改失败!');
            }
          }).catch(() => {
            this.$Message.error('修改失败!');
            this.pageLoading = false;
          })
          // this.$Modal.remove();
        }
      });
    },
    priceDisabled (price) {
      return (this.$common.isEmpty(price) || price < 0);
    },
    // 重置页面数据
    restData () {
      !this.$common.isEmpty(this.oldFormData) && (this.formData = this.$common.copy(this.oldFormData));
      this.qualityTemplateList = [];
    },
    // 获取所有质检模板
    getAllQuality () {
      return new Promise((resolve) => {
        this.qualityTemplateJson = {};
        this.axios.get(api.getAllQualityTemplate).then((res) => {
          if (res && res.data && res.data.code === 0) {
            resolve(res.data.datas || []);
            this.qualityTemplateList = res.data.datas || [];
            (res.data.datas || []).forEach(item => {
              this.$set(this.qualityTemplateJson, item.qualityClassificationId, item.qualityProjectVOList);
            })
          } else {
            resolve([]);
          }
        }).catch(() => {
          resolve([]);
        })
      })
    }
  }
};
</script>
