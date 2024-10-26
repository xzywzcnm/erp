<template>
  <div>
    <div class="commonFilter">
      <div class="card-container">
        <div class="card-content">
          <Form class="normalTop" :model="pageParams" :label-width="90" label-position="right">
            <dyt-filter :filter-row="1">
              <!-- 状态 -->
              <FormItem label="状态" :label-width="40">
                <dyt-select ref="productGoodsTagsSelect" v-model="pageParams.status">
                  <Option
                    v-for="(item,index) in enableList"
                    :key="index"
                    :value="item.status"
                  >{{ item.title }}</Option>
                </dyt-select>
              </FormItem>
              <!-- 包材名称 -->
              <Form-item label="分区方案名称">
                <dyt-input style="width:200px" v-model.trim="pageParams.name"></dyt-input>
              </Form-item>
              <div slot="operation">
                <Button
                  v-if="getPermission('wmsWarehouseAreaProgram_query')"
                  type="primary"
                  :disabled="SearchDisabled"
                  icon="md-search"
                  @click="search">查询 </Button>
                <Button @click="reset" style="margin-left:10px;" v-once icon="md-refresh">重置 </Button>
              </div>
            </dyt-filter>
          </Form>
        </div>
      </div>
    </div>
    <div class="dataSort" style="display: flex;">
      <div style="flex: 100;">
        <Button type="primary" @click="addDate" v-if="getPermission('wmsWarehouseAreaProgram_insert')">新建分区方案 </Button>
      </div>
      <div class="dataSort grayBg" style="display: inline-block;background: none;border: none;padding: 0;margin: 0;">
        <span>排序：</span>
        <Button-group>
          <template v-for="(item, index) in buttonGroupModel">
            <Button v-if="item.selected" :disabled="SearchDisabled" type="primary" @click="modifyTheSort(index,item.status);getList()" :key="index">
              {{ item.title }}
              <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
              <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
            </Button>
          </template>
        </Button-group>
      </div>
    </div>
    <div class="normalPadding normalTop">
      <Table
        highlight-row
        :height="tableHeight"
        :loading="tableLoading"
        border
        :columns="column"
        :data="data"
        @on-selection-change="getSelectValue"></Table>
      <div class="table-page">
        <div class="table-page-right">
          <Page
            :total="total"
            @on-change="changePage"
            show-total
            :page-size="pageParams.pageSize"
            show-elevator
            show-sizer
            @on-page-size-change="changePageSize"
            placement="top"
            :page-size-opts="pageArray"
            :current="curPage"></Page>
        </div>
      </div>
    </div>

    <Modal :title="modelTitle" v-model="model1">
      <Form ref="formCustom" :model="formCustom" :rules="ruleCustom" :label-width="120">
        <FormItem label="方案名称" prop="name">
          <Input v-model="formCustom.name" :maxlength="100"></Input>
        </FormItem>
        <FormItem label="备注：">
          <Input type="textarea" v-model="formCustom.remark" :maxlength="500"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="savePartition">保存 </Button>
        <Button @click="model1=false">取消</Button>
      </div>
    </Modal>

    <Modal title="编辑分区方案" v-model="model2" width="1100" :mask-closable="false" @on-visible-change="visable">
      <div class="mb10">
        <span class="fontWeight">{{ partitionFrom.name }}</span><span style="margin-left: 50px;">{{ partitionFrom.remark }}</span>
      </div>
      <Row>
        <Col span="11">
          <div class="mb10">
            <Button
              class="mr10"
              v-if="getPermission('wmsWarehouseArea_insert')"
              @click="openAreaModel('add')">新建分区 </Button>
            <Button
              class="mr10"
              @click="deleteHandel('area')"
              v-if="getPermission('wmsWarehouseArea_delete')">删除 </Button>
            <Button
              class="mr10"
              @click="openAreaModel('edit')"
              v-if="getPermission('wmsWarehouseArea_update')">编辑 </Button>
            <Button
              class="mr10"
              @click="model5=true;downType='01'"
              v-if="getPermission('wmsWarehouseArea_importWarehouseArea')">批量上传 </Button>
          </div>
          <Table
            highlight-row
            border
            :columns="column2"
            :data="data2"
            max-height="400"
            :loading="tableLoading"
            @on-row-click="clickTable2"
            @on-selection-change="checkedDateMt1"></Table>
        </Col>
        <Col span="11" offset="2">
          <div class="mb10">
            <Button
              class="mr10"
              @click="openMailModel('add')"
              v-if="getPermission('wmsWarehouseAreaDetail_insert')">新建组 </Button>
            <Button
              class="mr10"
              @click="deleteHandel('mail')"
              v-if="getPermission('wmsWarehouseAreaDetail_delete')">删除 </Button>
            <Button
              class="mr10"
              @click="openMailModel('edit')"
              v-if="getPermission('wmsWarehouseAreaDetail_update')">编辑 </Button>
            <Button
              @click="model5=true;downType='02'"
              class="mr10"
              v-if="getPermission('wmsWarehouseAreaDetail_importWarehouseAreaDetail')">批量上传 </Button>
          </div>
          <Table
            border
            highlight-row
            :columns="column3"
            :data="data3"
            height="400"
            :loading="tableLoading"
            @on-row-click="clickTable3"
            @on-selection-change="checkedDateMt2"></Table>
        </Col>
      </Row>
    </Modal>

    <Modal :title="model2Title" v-model="model3" :mask-closable="false">
      <Form ref="formArea" :model="formArea" :rules="ruleArea" :label-width="120">
        <FormItem label="分区代码：" prop="code">
          <Input v-model="formArea.code" :maxlength="100"></Input>
        </FormItem>
        <FormItem label="分区名称：" prop="name">
          <Input v-model="formArea.name" :maxlength="100"></Input>
        </FormItem>
        <FormItem label="备注：">
          <Input type="textarea" v-model="formArea.remark" :maxlength="500"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="saveArea">保存 </Button>
        <Button @click="model3=false">取消</Button>
      </div>
    </Modal>

    <Modal :title="model3Title" v-model="model4" :mask-closable="false" @on-visible-change="visible">
      <Form ref="formMail" :model="formMail" :rules="ruleMail" :label-width="120">
        <FormItem label="国家：" prop="countryTwoCode">
          <dyt-select ref="select1" style="width: 100px" v-model="formMail.countryTwoCode" filterable><Option
            v-for="(item, index) in formValidate.country"
            :key="index"
            :value="item.twoCode"
            :v="item.cnName">{{ item.enName }}</Option></dyt-select>
        </FormItem>
        <FormItem label="地区/城市：">
          <Input v-model="formMail.city" :maxlength="100"></Input>
        </FormItem>
        <FormItem label="开始邮编：" prop="startPostalCode">
          <Input v-model="formMail.startPostalCode" :maxlength="100"></Input>
        </FormItem>
        <FormItem label="结束邮编：" prop="endPostalCode">
          <Input v-model="formMail.endPostalCode" :maxlength="500"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" @click="saveMail">保存 </Button>
        <Button @click="model4=false">取消</Button>
      </div>
    </Modal>

    <Modal title="批量上传" v-model="model5" :mask-closable="false" @on-visible-change="visable1">
      <div v-if="downType === '01'">
        <span class="fl line32">导入模板：</span>
        <dytUpload
          style="display: inline-block"
          :headers="headObj"
          ref="uploadRef"
          name='excleFile'
          :data="{wmsWarehouseAreaProgramId:activeId}"
          :action="uploadFilesAction"
          :on-success="uploadSuccess"
          :on-error="uploadError"
          :on-format-error="handleFormatError"
          :max-size="uploadFilesMaxSize"
          :format="['xls', 'xlsx']">
          <Button class="mr10">批量上传</Button>
        </dytUpload>
        <a class="line32 fr" @click="download">下载</a>
      </div>
      <div v-else-if="downType === '02'">
        <span class="fl line32">导入模板：</span>
        <dytUpload
          style="display: inline-block"
          :headers="headObj"
          ref="uploadRef1"
          :data="{wmsWarehouseAreaProgramId:activeId}"
          name='excleFile'
          v-if="getPermission('wmsWarehouseAreaDetail_importWarehouseAreaDetail')"
          :on-success="uploadSuccess"
          :on-error="uploadError"
          :max-size="uploadFilesMaxSize"
          :format="['xls', 'xlsx']"
          :action="uploadFilesAction1">
          <Button class="mr10">批量上传</Button>
        </dytUpload>
        <a class="line32 fr" @click="download">下载</a>
      </div>
      <div slot="footer">
        <Button @click="model5=false">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
import common from '@/components/mixin/common_mixin';

export default {
  name: 'zoningScheme',
  mixins: [common],
  data () {
    let v = this;
    return {
      tableHeight: 600,
      downType: '01',
      model5: false,
      uploadFilesAction: api.wmsService + api.importWarehouseArea,
      uploadFilesAction1: api.wmsService + api.importWarehouseAreaDetail,
      temp: '',
      temp1: '',
      areaDate: {
        wmsWarehouseAreaProgramId: ''
      },
      mailDate: {
        wmsWarehouseAreaProgramId: ''
      },
      activeTable2Data: null,
      activeTable3Data: null,
      activeId: '',
      model3: false,
      model4: false,
      formAreaType: 'add',
      formMailType: 'add',
      formArea: {
        code: '',
        name: '',
        remark: '',
        wmsWarehouseAreaDetailId: ''
      },
      formMail: {
        city: '',
        countryTwoCode: '',
        endPostalCode: '',
        startPostalCode: '',
        wmsWarehouseAreaId: ''
      },
      ruleMail: {
        countryTwoCode: [
          {
            required: true,
            message: '国家不能为空',
            trigger: 'change'
          }
        ],
        startPostalCode: [
          {
            required: true,
            message: '开始邮编不能为空',
            trigger: 'blur'
          }
        ],
        endPostalCode: [
          {
            required: true,
            message: '结束邮编不能为空',
            trigger: 'blur'
          }
        ]
      },
      ruleArea: {
        code: [
          {
            required: true,
            message: '分区代码不能为空',
            trigger: 'blur'
          }
        ],
        name: [
          {
            required: true,
            message: '方案名称不能为空',
            trigger: 'blur'
          }
        ]
      },
      column2: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          type: 'index',
          width: 70,
          align: 'center',
          title: '序号'
        }, {
          title: '分区代码',
          align: 'center',
          key: 'code'
        }, {
          title: '分区名称',
          align: 'center',
          width: 120,
          key: 'name'
        }, {
          title: '备注',
          align: 'center',
          key: 'remark'
        }
      ],
      data2: [],
      column3: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          type: 'index',
          width: 70,
          align: 'center',
          title: '序号'
        }, {
          title: '国家',
          align: 'center',
          key: 'countryTwoCode'
        }, {
          key: 'city',
          align: 'center',
          title: '城市'
        }, {
          key: 'startPostalCode',
          align: 'center',
          title: '开始邮编'
        }, {
          key: 'endPostalCode',
          align: 'center',
          title: '结束邮编'
        }
      ],
      data3: [],
      partitionFrom: {
        name: '',
        remark: '',
        id: ''
      },
      modelType: 'add',
      model2: false,
      model1: false,
      formCustom: {
        name: '',
        remark: '',
        status: 1
      },
      pageParams: {
        status: 3, // 状态
        name: null, // 包材名称
        orderBy: 'createdTime', // 排序
        upDown: 'up',
        pageNum: 1,
        pageSize: 10
      },
      ruleCustom: {
        name: [
          {
            required: true,
            message: '方案名称不能为空',
            trigger: 'blur'
          }
        ]
      },
      enableList: [ // 状态
        {
          selected: true,
          status: 3,
          title: '全部'
        }, {
          selected: false,
          status: 1,
          title: '可用'
        }, {
          selected: false,
          status: 0,
          title: '停用'
        }
      ],
      buttonGroupModel: [ // 排序
        {
          type: 'createdTime',
          selected: true,
          status: true, // true up false down
          title: '按创建时间'
        }
      ],
      column: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        }, {
          type: 'index',
          width: 70,
          title: '序号',
          align: 'center'
        }, {
          title: '分区方案名称',
          align: 'center',
          width: 150,
          key: 'name'
        }, {
          title: '包含分区',
          align: 'center',
          render: (h, params) => {
            if (params.row.wmsWarehouseAreaName) {
              return h('div', {}, params.row.wmsWarehouseAreaName.join('、'));
            }
          }
        }, {
          title: '备注',
          align: 'center',
          resizable: true,
          width: 250,
          key: 'remark'
        }, {
          title: '状态',
          align: 'center',
          width: 120,
          render: (h, params) => {
            return params.row.status === 0
              ? h('span', { style: { color: 'red' } }, '停用')
              : h('span', { style: { color: 'green' } }, '可用');
          }
        }, {
          title: '创建时间',
          align: 'center',
          width: 160,
          render: (h, params) => {
            return h('div', this.getDataToLocalTime(params.row.createdTime, 'fulltime'));
          }
        }, {
          title: '操作',
          align: 'center',
          width: 240,
          render: (h, params) => {
            return h('div', {}, [
              h('Button', {
                style: {
                  display: (() => {
                    return v.getPermission('wmsWarehouseAreaProgram_update') ? 'inline-block' : 'none';
                  })()
                },
                props: {
                  type: 'primary',
                  size: 'small'
                },
                on: {
                  'click': () => {
                    v.formCustom.name = params.row.name;
                    v.formCustom.remark = params.row.remark;
                    v.formCustom.status = params.row.status;
                    v.formCustom.wmsWarehouseAreaProgramId = params.row.wmsWarehouseAreaProgramId;
                    v.modelType = 'edit';
                    v.model1 = true;
                  }
                }
              }, '编辑'), h('Button', {
                props: {
                  type: 'primary',
                  size: 'small'
                },
                style: {
                  marginLeft: '5px',
                  display: (() => {
                    return v.getPermission('wmsWarehouseArea_queryByWmsWarehouseAreaProgramId')
                      ? 'inline-block'
                      : 'none';
                  })()
                },
                on: {
                  'click' () {
                    v.model2 = true;
                    v.partitionFrom.name = params.row.name;
                    v.partitionFrom.remark = params.row.remark;
                    v.activeId = params.row.wmsWarehouseAreaProgramId;
                    v.getAreaDetail();
                  }
                }
              }, '分区管理'), h('Button', {
                props: {
                  type: 'error',
                  size: 'small'
                },
                style: {
                  marginLeft: '5px',
                  display: (() => {
                    return v.getPermission('wmsWarehouseAreaProgram_disable') ? 'inline-block' : 'none';
                  })()
                },
                class: (() => {
                  return params.row.status === 0 ? 'none' : '';
                })(),
                on: {
                  'click' () {
                    v.putDisableOrEnable('disabled', params.row);
                  }
                }
              }, '停用'), h('Button', {
                props: {
                  type: 'info',
                  size: 'small'
                },
                style: {
                  marginLeft: '5px',
                  display: (() => {
                    return v.getPermission('wmsWarehouseAreaProgram_enable') ? 'inline-block' : 'none';
                  })()
                },
                class: (() => {
                  return params.row.status === 1 ? 'none' : '';
                })(),
                on: {
                  'click' () {
                    v.putDisableOrEnable('enabled', params.row);
                  }
                }
              }, '启用')
            ]);
          }
        }
      ],
      areaType: 'add',
      mailType: 'add',
      data: [],
      selectData: [],
      total: 0,
      curPage: 1,
      checkedData1: [],
      checkedData2: []
    };
  },
  methods: {
    visible (open) {
      if (!open) {
        this.$refs.select1.reset();
        this.$refs.formMail.resetFields();
      }
    },
    download () { // 下载模板
      let v = this;
      let apiUrl;
      if (this.downType === '01') {
        apiUrl = api.wmsService + api.getAreaTemplet;
      } else if (this.downType === '02') {
        apiUrl = api.wmsService + api.getAreaDetailTemplet;
      }
      v.axios.get(apiUrl).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          // let url = v.filenodeViewTargetUrl.replace('setting-service', 'wms-service');
          // window.open(url + data, '_self');
          window.open(api.wmsService + v.filenodeViewTargetUrl + data, '_self');
        }
      });
    },
    uploadSuccess (res, file, fileList) {
      let v = this;
      if (res.code === 0) {
        v.$Message.success('上传成功');
        v.getAreaDetail();
      } else {
        let text = '';
        if (res.code === 554104) {
          text = '分区代码为空';
        } else if (res.code === 554105) {
          text = '分区名称为空';
        } else if (res.code === 554106) {
          text = '分区代码重复';
        } else if (res.code === 554107) {
          text = '分区组国家为空';
        } else if (res.code === 554108) {
          text = '分区组开始邮编为空';
        } else if (res.code === 554109) {
          text = '分区组结束邮编为空';
        } else if (res.code === 554110) {
          text = '分区为空';
        } else if (res.code === 554111) {
          text = '分区代码错误';
        } else if (res.code === 554112) {
          text = '分区组国家错误';
        } else if (res.code === 554113) {
          text = '分区组邮编已存在';
        } else if (res.code === 554114) {
          text = '分区组邮编范围错误';
        }
        v.$Message.error(text);
      }
    },
    uploadError () {
      let v = this;
      v.$Message.error('操作失败，请重新尝试');
    },
    deleteHandel (type) {
      let v = this;
      let apia = '';
      let params = '';
      if (type === 'area') {
        if (v.checkedData1.length === 0) {
          v.$Message.error('请选择要删除的数据');
          return;
        }
        apia = api.delete_wmsWarehouseArea;
        let id = v.checkedData1.map(i => {
          return i.wmsWarehouseAreaId;
        });
        params = id;
      } else {
        if (v.checkedData2.length === 0) {
          v.$Message.error('请选择要删除的数据');
          return;
        }
        apia = api.delete_wmsWarehouseAreaDetail;
        let id = v.checkedData2.map(i => {
          return i.wmsWarehouseAreaDetailId;
        });
        params = id;
      }
      v.$Modal.confirm({
        title: '温馨提示',
        content: '是否删除',
        onOk: () => {
          v.axios.post(api.wmsService + apia, params).then(res => {
            if (res.data.code === 0) {
              v.$Message.success('删除成功');
              v.getAreaDetail();
              v.getList();
            } else {
              (!res.data || ![999993, '999993'].includes(res.data.code)) && v.$Message.error('删除失败,请重新尝试');
            }
          });
        },
        onCancel: () => {

        }
      });
    },
    checkedDateMt1 (data) {
      this.checkedData1 = data;
    },
    checkedDateMt2 (data) {
      this.checkedData2 = data;
    },
    visable1 (open) {
      if (open) {
        this.$nextTick(() => {
          if (this.$refs.uploadRef) {
            this.$refs.uploadRef.clearFiles();
          }
          if (this.$refs.uploadRef1) {
            this.$refs.uploadRef1.clearFiles();
          }
        });
      }
    },
    visable (open) {
      if (open) {
        this.getCountrys();
      }
    },
    clickTable2 (data) {
      let v = this;
      v.activeTable2Data = data;
      if (data.wmsWarehouseAreaDetailList) {
        v.data3 = data.wmsWarehouseAreaDetailList;
        if (v.data3.length > 0) {
          v.data3[0]._highlight = true;
          v.activeTable3Data = v.data3[0];
        }
      } else {
        v.data3 = [];
      }
    },
    clickTable3 (data) {
      this.activeTable3Data = data;
    },
    saveArea () {
      let v = this;
      // let text = '操作失败，请重新尝试';
      v.$refs.formArea.validate((valid) => {
        if (valid) {
          if (v.areaType === 'add') {
            v.formArea.wmsWarehouseAreaProgramId = v.activeId;
            delete v.formArea.wmsWarehouseAreaId;
          } else {
            v.formArea.wmsWarehouseAreaId = v.activeTable2Data.wmsWarehouseAreaId;
            delete v.formArea.wmsWarehouseAreaProgramId;
          }
          v.axios[v.areaType === 'add' ? 'post' : 'put'](api.wmsService + api.wmsWarehouseArea, v.formArea).then(res => {
            if (res.data.code === 0) {
              v.$Message.success('操作成功');
              v.model3 = false;
              v.getAreaDetail();
            }
          }).catch(() => {

          });
        }
      });
    },
    saveMail () {
      let v = this;
      v.$refs.formMail.validate((valid) => {
        if (valid) {
          if (v.mailType === 'add') {
            v.formMail.wmsWarehouseAreaId = v.activeTable2Data.wmsWarehouseAreaId;
            delete v.formMail.wmsWarehouseAreaDetailId;
          } else {
            v.formMail.wmsWarehouseAreaDetailId = v.activeTable3Data.wmsWarehouseAreaDetailId;
            delete v.formMail.wmsWarehouseAreaId;
          }

          v.axios[v.mailType === 'add' ? 'post' : 'put'](api.wmsService + api.wmsWarehouseAreaDetail, v.formMail).then(res => {
            if (res.data.code === 0) {
              v.$Message.success('操作成功');
              v.model4 = false;
              v.getAreaDetail();
            } else {
              (!res.data || ![999993, '999993'].includes(res.data.code)) && v.$Message.error('操作失败，请重新尝试');
            }
          }).catch(() => {
          });
        }
      });
    },
    openAreaModel (type) {
      let v = this;
      v.areaType = type;
      if (type === 'add') {
        v.formArea.code = '';
        v.formArea.name = '';
        v.formArea.remark = '';
      } else {
        v.formArea.code = v.activeTable2Data.code;
        v.formArea.name = v.activeTable2Data.name;
        v.formArea.remark = v.activeTable2Data.remark;
      }
      v.model3 = true;
    },
    openMailModel (type) {
      let v = this;
      v.mailType = type;
      if (type === 'add') {
        v.formMail.countryTwoCode = '';
        v.formMail.city = '';
        v.formMail.startPostalCode = '';
        v.formMail.endPostalCode = '';
      } else {
        v.formMail.countryTwoCode = v.activeTable3Data.countryTwoCode;
        v.formMail.city = v.activeTable3Data.city;
        v.formMail.startPostalCode = v.activeTable3Data.startPostalCode;
        v.formMail.endPostalCode = v.activeTable3Data.endPostalCode;
      }
      v.model4 = true;
    },
    getAreaDetail () {
      let v = this;
      v.data2 = [];
      v.data3 = [];
      v.activeTable2Data = null;
      v.activeTable3Data = null;
      v.tableLoading = true;
      v.axios.get(api.wmsService + api.get_queryByWmsWarehouseAreaProgramId + '?wmsWarehouseAreaProgramId=' + v.activeId).then(res => {
        v.tableLoading = false;
        if (res.data.code === 0) {
          v.data2 = res.data.datas;
          if (v.data2.length > 0) {
            // v.data2[0]._highlight = true;
            // v.activeTable2Data = v.data2[0];
            // 获取当前分区对应的分组数据
            if (v.data2.length > 0) {
              v.data2.forEach((item, index) => {
                if (item.wmsWarehouseAreaProgramId === v.activeId) {
                  v.$nextTick(() => {
                    v.data2[index]._highlight = true;
                    v.activeTable2Data = v.data2[index];
                  });
                  if (item.wmsWarehouseAreaDetailList && item.wmsWarehouseAreaDetailList.length > 0) {
                    v.$nextTick(() => {
                      v.data3 = item.wmsWarehouseAreaDetailList;
                      v.data3[0]._highlight = true;
                      v.activeTable3Data = v.data3[0];
                    });
                  } else {
                    v.activeTable3Data = null;
                    v.data3 = [];
                  }
                }
              });
            }
          } else {
            v.activeTable2Data = null;
            v.data3 = [];
          }
        }
      }).catch(() => {
      });
    },
    addDate () {
      this.model1 = true;
      this.modelType = 'add';
      this.formCustom.name = '';
      this.formCustom.remark = '';
    },
    search () { // 查询
      let v = this;
      v.pageParamsStatus = true;
      v.curPage = 1;
      v.pageParams.pageNum = 1;
      v.getList();
    },
    reset () { // 重置
      let v = this;
      v.pageParams.status = 3;
      v.pageParams.name = null;
    },
    getSelectValue (value) { // table获取所选值
      let v = this;
      v.selectData = value;
    },
    putDisableOrEnable (type, row) {
      const id = row.wmsWarehouseAreaProgramId;
      let putApi = type === 'disabled' ? api.put_wmsWarehouseAreaProgramDisable : api.put_wmsWarehouseAreaProgramEnable;
      this.$Modal.confirm({
        title: '操作确认',
        content: `确认${type === 'disabled' ? '停' : '启'}用：<span style="color: #f20;">${row.name}</span>`,
        onOk: () => {
          this.axios.put(api.wmsService + putApi + '?wmsWarehouseAreaProgramId=' + id).then((res) => {
            if (res.data.code === 0) {
              this.$Message.success('操作成功');
              this.getList();
            }
          });
        }
      });
    },
    changePage (page) {
      var v = this;
      v.pageParams.pageNum = page;
      v.getList();
    }, // 切换每页条数
    changePageSize (size) {
      var v = this;
      v.pageParams.pageSize = size;
      v.getList();
    },
    getList () { // 包材列表数据
      let v = this;
      if (!v.getPermission('wmsWarehouseAreaProgram_query')) return;
      let obj = {
        orderBy: v.pageParams.orderBy === 'createdTime' ? 'CT' : 'ZT',
        orderSeq: v.pageParams.upDown === 'up' ? 'ASC' : 'DESC',
        name: v.pageParams.name,
        status: v.pageParams.status == 3 ? null : v.pageParams.status,
        pageNum: v.pageParams.pageNum,
        pageSize: v.pageParams.pageSize
      };
      v.loadingTrue();
      v.axios.post(api.wmsService + api.get_wmsWarehouseAreaProgram, obj).then(response => {
        if (response.data.code === 0) {
          v.loadingFalse();
          let data = response.data.datas;
          if (!data) {
            v.data = [];
            v.total = 0;
          }
          v.data = data.list;
          v.total = Number(data.total);
        }
      }).catch(() => {
        v.loadingFalse();
      });
    },
    savePartition () {
      let v = this;
      this.$refs.formCustom.validate((valid) => {
        if (valid) {
          if (v.modelType === 'add') {
            delete v.formCustom.wmsWarehouseAreaProgramId;
          }
          v.axios[v.modelType === 'add' ? 'post' : 'put'](api.wmsService + api.wmsWarehouseAreaProgram, v.formCustom).then(res => {
            if (res.data.code === 0) {
              v.$Message.success('添加成功');
              v.model1 = false;
              v.getList();
            } else {
              v.$Message.error('修改失败');
            }
          }).catch(() => {
          });
        }
      });
    }
  },
  created () {
    let v = this;
    this.tableHeight = this.getTableHeight(310);
    v.getPermissionCallback('logistics_zoningScheme').then(() => {
      v.getList();
    });
  },
  computed: {
    'modelTitle' () {
      return this.modelType === 'add' ? '新建分区方案' : '修改分区方案';
    },
    'model2Title' () {
      return this.formAreaType === 'add' ? '新建分区' : '修改分区';
    },
    'model3Title' () {
      return this.formMailType === 'add' ? '新建邮编' : '编辑邮编';
    }
  }
};
</script>
