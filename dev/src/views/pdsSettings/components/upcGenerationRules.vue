<template >
  <div class="upcGenerationRules_box">
    <h2 class="title">商品SKU识别码(UPC)生成规则</h2>
    <p class="text">
      <span>商品识别码(UPC)生成示例：</span> <span class="color_red">商品大类+开发年份+适用季节+流水号</span>
    </p>
    <Button type="primary" @click="AddCodeTtem" v-if="getPermission('productUpcSetting_insert')" style="margin: 10px 0;">添加编码项</Button>
    <Table highlight-row border :loading="tableLoading" draggable @on-drag-drop="dragDrop" :columns="columns" :data="codeData"></Table>
    <!--添加编码项弹窗-->
    <Modal v-model="codeTtemTalg" :mask-closable="false" :title="code_txt" class-name="modal_codeStyle" :transfer="false" @on-visible-change="visibleChange" width="700">
      <div class="line_box">
        <span class="redDot" style="margin-right: 8px;">属性项</span> <dyt-input v-model.trim="upcCodeName" style="width: 200px;" :disabled="!is_edit"></dyt-input>
      </div>
      <Button type="primary" @click="AddAttribute" style="margin-bottom: 10px;" v-show="is_edit">添加</Button>
      <div class="attribute_line" v-for="(item, index) in attribute_data" :key="index">
        <span class="redDot" style="margin-right: 8px;">属性</span> <dyt-input v-model.trim="item.upcCodeName" :disabled="!is_edit" style="width: 200px;"></dyt-input>
        <span style="margin: 0 10px;">—</span> <span class="redDot" style="margin-right: 8px;">编码</span> <dyt-input v-model.trim="item.upcCode" :disabled="!is_edit" style="width: 200px;"></dyt-input>
        <Icon type="ios-remove-circle-outline" v-show="is_edit" class="deleteIcon" @click="deleteCode(index)" />
      </div>
      <div slot="footer" style="text-align: center;">
        <Button @click="setCode" type="primary" v-show="is_edit">确认</Button>
        <Button @click="codeTtemTalg = false">取消</Button>
      </div>
    </Modal>

    <!-- 删除确认弹窗 -->
    <Modal v-model="deleteTalg" width="400" :title="code_txt" @on-visible-change="visibleChange">
      <div style="text-align:center">
        <span style="font-size:15px;font-weight:bold">是否确认删除?</span>
      </div>
      <div slot="footer">
        <Button @click="deleteTalg = false">取消</Button>
        <Button type="error" @click="deleteQuery">确定</Button>
      </div>
    </Modal>

    <!--流水号弹窗-->
    <Modal v-model="serialNumberTalg" width="360" :mask-closable="false" @on-visible-change="visibleChange" :title="code_txt">
      <div style="display: flex; align-items: center; margin-bottom: 10px;">
        <span style="margin-right: 8px;">流水号字符数</span>
        <dyt-inputNumber v-model="initIdCount" :min="0" :max="10" :disabled="!is_edit" style="width: 150px;"></dyt-inputNumber>
      </div>
      <div slot="footer" style="text-align: center;">
        <Button @click="serialNumberTalg = false">取消</Button>
        <Button type="primary" @click="setCode" v-show="is_edit">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<style lang='less' scoped>
.upcGenerationRules_box {
  padding: 10px 15px;
  background-color: #fff;

  .title {
    margin: 0px 0 5px 0;
    font-size: 20px;
    color: #333;
  }

  .text {
    color: #666;
    font-size: 14px;
  }

  .color_red {
    color: #ef0c0c;
  }
  :deep(.modal_codeStyle) {
    padding: 10px;

    .ivu-modal-body {
      .line_box {
        display: flex;
        align-items: center;
        padding-bottom: 12px;
        margin-bottom: 8px;
        border-bottom: 1px solid #dddddd;
      }

      .attribute_line {
        display: flex;
        align-items: center;
        margin: 12px 0;

        .deleteIcon {
          font-size: 22px;
          cursor: pointer;
          margin-left: 10px;
        }
      }
    }
  }
}
</style>

<script type="text/ecmascript-6">
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  data () {
    let v = this;
    return {
      upcId: null,
      codeData: [],
      columns: [
        {
          title: '编码项',
          key: 'upcCodeName',
          align: 'center'
        }, {
          title: '最后修改人',
          key: 'name',
          align: 'center',
          render: (h, params) => {
            let name = v.getUserName(params.row.updatedBy);
            return h('div', name);
          }
        }, {
          title: '最后修改时间',
          key: '',
          align: 'center',
          render: (h, params) => {
            return h('div', v.getDataToLocalTime(params.row.updatedTime, 'fulltime'));
          }
        }, {
          title: '排序',
          align: 'center',
          render: (h, params) => {
            return h('Icon', {
              props: {
                type: 'md-move',
                size: 18
              },
              attrs: {
                title: '拖拽排序'
              },
              style: {
                marginLeft: '5px',
                position: 'relative',
                top: '-2px'
              },
              class: 'cursor-move grayColor'
            });
          }
        }, {
          title: '操作',
          align: 'center',
          render: (h, params) => {
            let talg = params.row.isInitId;
            return h('div', [
              h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '8px'
                },
                on: {
                  click: () => {
                    if (talg === 1) {
                      v.code_txt = '查看流水号';
                      v.serialNumberTalg = true;
                      v.is_edit = false;
                      v.initIdCount = Number(params.row.initIdCount);
                      v.editData.isInitId = talg;
                    } else {
                      v.codeTtemTalg = true;
                      v.code_txt = '查看编码项';
                      v.is_edit = false;
                      v.editCodeData(params.row.upcId);
                    }
                  }
                }
              }, '查看'), v.getPermission('productUpcSetting_update') ? h('Button', {
                props: {
                  size: 'small'
                },
                style: {
                  marginRight: '8px'
                },
                on: {
                  click: () => {
                    v.isTalg = 'edit';
                    if (talg === 1) {
                      v.code_txt = '编辑流水号';
                      v.serialNumberTalg = true;
                      v.is_edit = true;
                      v.initIdCount = Number(params.row.initIdCount);
                      v.editData.isInitId = talg;
                      v.upcId = params.row.upcId;
                      v.upcCodeName = params.row.upcCodeName;
                    } else {
                      v.codeTtemTalg = true;
                      v.code_txt = '编辑编码项';
                      v.is_edit = true;
                      v.editCodeData(params.row.upcId);
                    }
                  }
                }
              }, '编辑') : '', talg !== 1 && v.getPermission('productUpcSetting_delete') ? h('Button', {
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    v.code_txt = '删除编码项';
                    v.deleteTalg = true;
                    v.upcId = params.row.upcId;
                  }
                }
              }, '删除') : ''
            ]);
          }
        }
      ],
      codeTtemTalg: false,
      code_txt: '',
      upcCodeName: '',
      attribute_data: [
        {
          upcCodeName: '',
          upcCode: ''
        }
      ],
      is_edit: true,
      deleteTalg: false,
      serialNumberTalg: false,
      initIdCount: 0,
      isTalg: 'add',
      editData: {}
    };
  },
  created () {
    this.queryProductUpcAll();
  },
  methods: {
    // 添加编码项按钮
    AddCodeTtem () {
      this.codeTtemTalg = true;
      this.code_txt = '添加编码项';
      this.is_edit = true;
      this.isTalg = 'add';
    },

    // 获取列表的编码项
    queryProductUpcAll () {
      let query = {
        initIdCount: null,
        isInitId: null,
        sort: null,
        upcCode: null,
        upcCodeName: '',
        upcId: null
      };
      if (this.getPermission('productUpcSetting_select')) {
        this.axios.post(api.post_queryProductUpcAll, query).then((response) => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            this.codeData = data;
          }
        });
      } else {
        this.gotoError();
      }
    },

    // 列表拖拽排序
    dragDrop (start, end) {
      let v = this;
      let upcId = '';
      let sort = '';
      if (v.codeData.length > 0) {
        v.codeData.map((item, index) => {
          if (index === Number(start)) {
            upcId = item.upcId;
          }
          if (index === end) {
            sort = item.sort;
          }
        });
      }
      let query = {
        upcId: upcId,
        sort: sort
      };
      v.axios.put(api.put_sortProductUpcSetting, query).then((response) => {
        if (response.data.code === 0) {
          v.queryProductUpcAll();
        }
      });
    },

    // 添加编码项弹窗的确定按钮
    setCode () {
      let v = this;
      let query = {};
      let url = '';
      let text = '';
      if (v.editData.isInitId !== 1) {
        if (this.upcCodeName === '') {
          v.$Message.error('属性项不能为空！');
          return false;
        }

        if (v.attribute_data.length > 0) {
          for (let i = 0; i < v.attribute_data.length; i++) {
            let upcCodeName = v.attribute_data[i].upcCodeName;
            let upcCode = v.attribute_data[i].upcCode;
            if (upcCodeName === '') {
              v.$Message.error('属性不能为空！');
              return false;
            }
            if (upcCode === '') {
              v.$Message.error('编码不能为空！');
              return false;
            }
          }
          for (let i = 0; i < v.attribute_data.length - 1; i++) {
            for (let j = i + 1; j < v.attribute_data.length; j++) {
              if (v.attribute_data[i].upcCodeName === v.attribute_data[j].upcCodeName) {
                v.$Message.error('属性名称不能重复！');
                return false;
              }
              if (v.attribute_data[i].upcCode === v.attribute_data[j].upcCode) {
                v.$Message.error('编码值不能重复！');
                return false;
              }
            }
          }
        } else {
          v.$Message.error('请添加属性和编码！');
          return false;
        }
      }
      // 编辑编码项
      if (v.isTalg === 'edit') {
        url = api.put_updateProductUpc;
        text = '编辑成功！';
        // 流水号
        if (v.editData.isInitId === 1) {
          query = {
            initIdCount: v.initIdCount,
            isInitId: 1,
            upcCodeName: v.upcCodeName,
            upcId: v.upcId,
            upcSettingItemBoList: null
          };
        } else {
          // 编码项
          query = {
            initIdCount: v.editData.initIdCount,
            isInitId: 0,
            upcCodeName: v.upcCodeName,
            upcId: v.editData.upcId,
            upcSettingItemBoList: v.attribute_data
          };
        }
      } else if (v.isTalg === 'add') {
        // 新增编码项
        url = api.put_insertProductUpc;
        text = '新增成功！';
        query = {
          upcCodeName: v.upcCodeName,
          upcSettingItemBoList: v.attribute_data
        };
      }
      v.axios.put(url, query).then((response) => {
        if (response.data.code === 0) {
          v.queryProductUpcAll();
          v.codeTtemTalg = false;
          v.serialNumberTalg = false;
          v.code_txt = '';
          v.is_edit = false;
          v.initIdCount = 0;
          v.$Message.success(text);
        }
      });
    },

    // 添加属性项
    AddAttribute () {
      let item = {
        upcCodeName: '',
        upcCode: ''
      };
      this.attribute_data.push(item);
    },

    // 移除属性项
    deleteCode (index) {
      this.attribute_data.splice(index, 1);
    },

    // 删除编码项
    deleteQuery () {
      this.axios.delete(api.delete_deleteProductUpcById, { params: { upcId: this.upcId } }).then((response) => {
        if (response.data.code === 0) {
          this.$Message.success('删除成功');
          this.deleteTalg = false;
          this.queryProductUpcAll();
        }
      });
    },

    // 查看、编辑编码项
    editCodeData (upcId) {
      this.axios.get(api.get_queryProductUpcById, { params: { upcId: upcId } }).then((response) => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            this.upcCodeName = data.upcCodeName;
            this.attribute_data = data.upcSettingItemBoList;
            this.editData = data;
          }
        }
      });
    },

    // 监听弹窗的是否打开
    visibleChange (value) {
      if (!value) {
        this.code_txt = '';
        this.is_edit = false;
        this.initIdCount = 0;
        this.upcCodeName = '';
        this.attribute_data = [
          {
            upcCodeName: '',
            upcCode: ''
          }
        ];
        this.upcId = null;
        this.isTalg = 'add';
        this.editData = {};
      }
    }
  }
};
</script>
