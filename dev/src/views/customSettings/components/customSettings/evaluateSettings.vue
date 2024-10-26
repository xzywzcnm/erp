<template>
  <div :class="wrap">
    <Tabs class="normalLRMargin">
      <TabPane label="Ebay">
        <Card shadow class="normalLRMargin">
          <Row type="flex" :gutter="20">
            <Col>
              <Button
                type="primary"
                icon="ios-add"
                @click="showNewModel"
                v-if="getPermission('feedbackTemplate_create')">新增评价模板 </Button>
            </Col>
            <Col>
              <Button
                type="error"
                icon="ios-close"
                @click="delMoreFeedback"
                v-if="getPermission('feedbackTemplate_delete')">删除 </Button>
            </Col>
            <Col>
              <Row type="flex" :gutter="20">
                <Col>
                  <Input v-model.trim="pageParams.searchWords"/>
                </Col>
                <Col>
                  <Button type="primary" :disabled="SearchDisabled" icon="ios-search" @click="search">查询 </Button>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
        <!-- <Card shadow class="normalMargin">
          <Button type="primary" icon="ios-keypad">删除</Button>
        </Card> -->
        <Card shadow class="normalLRMargin">
          <keep-alive>
            <Table
              :columns="columns"
              :loading="tableLoading"
              highlight-row
              border
              :data="tableData"
              @on-selection-change="getSelectValue"></Table>
          </keep-alive>
          <Row type="flex" justify="end" class="normalTop">
            <keep-alive>
              <Page
                :total="total"
                @on-change="changePage"
                show-total
                :page-size="pageParams.pageSize"
                show-elevator
                :current="curPage"
                show-sizer
                @on-page-size-change="changePageSize"
                placement="top"
                :page-size-opts="pageArray"></Page>
            </keep-alive>
          </Row>
        </Card>
      </TabPane>
    </Tabs>
    <keep-alive>
      <Modal
        v-model="newModel"
        :title="newModelTitle"
        :mask-closable="false"
        :loading="modelLoading"
        :width="600"
        v-if="newModelStatus"
        @on-ok="addNewModel">
        <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="80">
          <FormItem label="模版名称" prop="name">
            <Input v-model="formValidate.name" :maxlength="50" placeholder="请输入模板名称"></Input>
          </FormItem>
          <FormItem label="内容" prop="content">
            <Input v-model="formValidate.content" :maxlength="200" type="textarea" placeholder="请输入内容"></Input>
          </FormItem>
          <FormItem label="备注" prop="remark">
            <Input v-model="formValidate.remark" :maxlength="200" type="textarea" placeholder="请输入备注"></Input>
          </FormItem>
        </Form>
      </Modal>
    </keep-alive>
  </div>
</template>
<style>
.formItem label.ivu-radio-wrapper-checked {
  background-color: #2d8cf0 !important;
  color: #FFF !important;
}
</style>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

const prefixCls = 'tongtool-customerCenter-evaluate';
export default {
  mixins: [Mixin],
  data () {
    let v = this;
    return {
      modelLoading: true,
      newModelTitle: '新增模板',
      ruleValidate: {
        name: [
          {
            required: true,
            message: '模板名称不能为空',
            trigger: 'blur'
          }
        ],
        content: [
          {
            required: true,
            message: '模板内容不能为空',
            trigger: 'blur'
          }
        ],
        remark: [
          {
            required: true,
            message: '备注不能为空',
            trigger: 'blur'
          }
        ]
      },
      formValidate: {
        name: '',
        content: '',
        platformId: 'ebay',
        remark: ''
      },
      moreParams: {
        selectInContent: false,
        model: '',
        textModel: ''
      },
      newModelStatus: false,
      newModel: false,
      curPage: 1,
      total: 0,
      totalPage: 0,
      pageParamsStatus: false,
      pageParams: {
        pageSize: 10,
        pageNum: 1,
        searchWords: '',
        platformId: 'ebay'
      },
      feedbackTemplateId: '',
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          title: '模版名称',
          align: 'center',
          key: 'name'
        }, {
          title: '评价内容',
          align: 'center',
          key: 'content'
        }, {
          title: '备注',
          align: 'center',
          key: 'remark'
        }, {
          title: '操作',
          key: 'operation',
          align: 'center',
          render: (h, params) => {
            return h('Button', {
              props: {
                type: 'primary',
                size: 'small',
                disabled: !v.getPermission('feedbackTemplate_update')
              },
              on: {
                click: () => {
                  this.newModelTitle = '修改模板';
                  this.newModelStatus = true;
                  this.feedbackTemplateId = params.row.feedbackTemplateId;
                  this.formValidate.name = params.row.name;
                  this.formValidate.content = params.row.content;
                  this.formValidate.remark = params.row.remark;
                  this.$nextTick(function () {
                    this.newModel = true;
                  });
                }
              }
            }, '修改');
          }
        }
      ],
      tableData: [],
      idArr: []
    };
  },
  computed: {
    wrap () {
      return `${prefixCls}`;
    }
  },
  watch: {
    pageParamsStatus (n, o) {
      let v = this;
      if (n) {
        v.$Loading.start();
        Promise.resolve(v.getPermission('feedbackTemplate_queryAll') ? v.getList() : v.gotoError()).then(() => {
          v.$Loading.finish();
        });
        v.pageParamsStatus = false;
      }
    }
  },
  methods: {
    showNewModel () {
      let v = this;
      for (let key in v.formValidate) {
        v.formValidate[key] = '';
      }
      v.formValidate.platformId = 'ebay';
      v.newModelTitle = '新增模板';
      v.feedbackTemplateId = '';
      v.newModelStatus = true;
      v.$nextTick(function () {
        v.newModel = true;
      });
    },
    handlerSubmit (name) {
      let v = this;
      return new Promise(resolve => {
        v.$refs[name].validate((valid) => {
          if (valid) {
            resolve(true);
          } else {
            v.modelLoading = false;
            v.$nextTick(function () {
              v.modelLoading = true;
            });
          }
        });
      });
    },
    addNewModel () {
      let v = this;
      v.handlerSubmit('formValidate').then(result => {
        if (result) {
          let params = v.formValidate;
          let url = api.set_newTemplateModel;
          if (v.feedbackTemplateId !== '') {
            params.feedbackTemplateId = v.feedbackTemplateId;
          }
          const obj = {
            url: url,
            data: params,
            type: v.feedbackTemplateId !== '' ? 'put' : 'post'
          };
          v.ajaxData(obj).then(response => {
            if (response.data.code === 0) {
              v.$Message.success(v.feedbackTemplateId !== '' ? '修改成功' : '新增模板成功');
              v.$refs['formValidate'].resetFields();
              v.newModel = false;
              v.modelLoading = false;
              v.$nextTick(function () {
                v.modelLoading = true;
              });
              v.pageParamsStatus = true;
            } else {
              v.modelLoading = false;
              v.$nextTick(function () {
                v.modelLoading = true;
              });
            }
          });
        }
      });
    },
    getSelectValue (value) {
      let arr = value.map(n => {
        return n.feedbackTemplateId;
      });
      this.idArr = arr;
    },
    delMoreFeedback () {
      let v = this;
      if (v.idArr.length === 0) {
        v.$Message.error('请选择要删除的模板');
        return false;
      }
      const obj = {
        url: api.set_deleteTemplate + v.idArr.toString(),
        type: 'delete'
      };
      v.isDelModal(() => {
        v.ajaxData(obj).then(response => {
          if (response.data.code === 0) {
            v.$Message.success('删除成功');
            v.idArr = [];
            v.pageParamsStatus = true;
          }
        });
      });
    },
    getList () {
      let v = this;
      const obj = {
        url: api.get_templateModel,
        data: v.pageParams
      };
      v.loadingTrue();
      v.tableData = [];
      v.ajaxData(obj).then(response => {
        v.loadingFalse();
        if (response.data.code === 0) {
          let data = response.data.datas;
          v.tableData = data.list;
          v.$nextTick(function () {
            v.total = Number(data.total);
            v.totalPage = Number(data.pages);
          });
        } else {
          v.tableData = [];
          v.$nextTick(function () {
            v.total = 0;
            v.totalPage = 0;
          });
        }
      });
    }
  },
  mounted () {
    let v = this;
    v.getList();
  }
};
</script>
