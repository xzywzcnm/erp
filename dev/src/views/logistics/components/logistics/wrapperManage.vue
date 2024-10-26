<template >
  <div>
    <!--筛选条件-->
    <div class="commonFilter">
      <div class="card-container">
        <div class="card-content">
          <Form class="normalTop" :model="pageParams" :label-width="80" label-position="right">
            <dyt-filter :filter-row="1">
              <!-- 状态 -->
              <FormItem label="状态" :label-width="40">
                <dyt-select v-model="pageParams.status">
                  <Option
                    v-for="(item,index) in enableList"
                    :key="index"
                    :value="item.status"
                  >{{ item.title }}</Option>
                </dyt-select>
              </FormItem>
              <!-- 包材名称 -->
              <Form-item label="包材名称">
                <dyt-input style="width:200px" placeholder="请输入包材名称" v-model.trim="pageParams.wrapperName"></dyt-input>
              </Form-item>
              <div slot="operation">
                <Button style="marginLeft:10px;" type="primary" :disabled="SearchDisabled" icon="md-search" @click="search" v-if="getPermission('wmsPackageMaterial_list')">查询 </Button>
                <Button @click="reset" v-once icon="md-refresh">重置 </Button>
              </div>
            </dyt-filter>
          </Form>
        </div>
      </div>
    </div>

    <!-- 操作 -->
    <div class="tableControl" style="display: flex;">
      <div style="flex: 100;">
        <Button style="margin-right:10px;" type="primary" v-if="getPermission('wmsPackageMaterial_create')" @click="addWrapper" class="iconbuttons">
          新建包材 </Button>
        <Button style="margin-left:10px;margin-right:10px;" type="primary" v-if="getPermission('wmsPackageMaterial_excelImport')" @click="importExcel" class="iconbuttons">
          EXCEL导入 </Button>
        <Buttons type="primary" style="margin-left:10px" v-if="getPermission('wmsPackageMaterial_exportPackageMaterial')" trigger="click" @on-click="exportExcel">
          <Button type="primary" @click="exportExcel(0)">
            EXCEL导出 </Button>
          <Buttons-menu slot="list">
            <Buttons-item :name="1">导出（所有结果集）</Buttons-item>
          </Buttons-menu>
        </Buttons>
      </div>
      <!-- 排序 -->
      <div class="dataSort grayBg" style="display: inline-block;background: none;border: none;padding: 0;margin: 0;">
        <span>排序：</span>
        <Button-group>
          <template v-for="(item, index) in buttonGroupModel">
            <Button v-if="item.selected" type="primary" @click="modifyTheSort(index,item.status)" :key="index">
              {{ item.title }}
              <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
              <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
            </Button>
            <Button v-if="!item.selected" @click="modifyTheSort(index,item.status)" :key="index">
              {{ item.title }}
              <Icon type="md-arrow-round-up" v-if="item.status && item.selected"></Icon>
              <Icon type="md-arrow-round-down" v-if="!item.status && item.selected"></Icon>
            </Button>
          </template>
        </Button-group>
      </div>
    </div>
    <!-- 表格 -->
    <div class="normalPadding normalTop">
      <Table highlight-row border :height="tableHeight"
        :loading="tableLoading" :columns="wrapperColumn" :data="wrapperData" @on-selection-change="getSelectValue"
      ></Table>
      <div class="table-page">
        <div class="table-page-right">
          <Page :total="total" @on-change="changePage" show-total :page-size="pageParams.pageSize" show-elevator show-sizer @on-page-size-change="changePageSize" placement="top" :page-size-opts="pageArray" :current="curPage"></Page>
        </div>
      </div>
    </div>
    <!-- 包材模态框 -->
    <keep-alive>
      <Modal v-model="wrapperModal" width="600" v-if="wrapperModalStatus" :title="modalTitle" @on-ok="save" @on-cancel="cancel" :loading="wrapLoading">
        <Form ref="warpperModal" class="normalTop" :model="pageParamsModal" :label-width="80" label-position="left" :rules="ruleValidate">
          <!-- 包材名称 -->
          <Form-item label="包材名称" prop="packageMaterialName">
            <dyt-input :maxlength="30" style="width:300px" :disabled="disableStatus" v-model.trim="pageParamsModal.packageMaterialName"></dyt-input>
          </Form-item>
          <!-- 成本 -->
          <Form-item label="成本" prop="packageMaterialCost">
            <dyt-select :disabled="disableStatus" v-model="pageParamsModal.currency" style="width:100px;">
              <Option v-for="item in currencyList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </dyt-select>
            <InputNumber :min="0" style="width:190px;marginLeft:10px;" :disabled="disableStatus" v-model.trim="pageParamsModal.packageMaterialCost"></InputNumber>
            <!-- <span style="marginLeft:10px;color:#FF0000;">*保存时将转化成 CNY</span> -->
          </Form-item>
          <!-- 重量 -->
          <Row>
            <Col span="1" style="line-height:35px;color:#ed4014;font-size:14px;">*
            </Col>
            <Col span="23" style="marginLeft:-14px;">
            <Form-item label="重量" prop="weight">
              <dyt-select :disabled="disableStatus" v-model="pageParamsModal.weightUnit" style="width:100px;marginLeft:-10px;">
                <Option value="g">g</Option>
                <Option value="oz">oz</Option>
                <Option value="lb">lb</Option>
              </dyt-select>
              <InputNumber :min="0" style="width:190px;marginLeft:10px;" :disabled="disableStatus" v-model.trim="pageParamsModal.packageMaterialWeight"></InputNumber>
              <span style="marginLeft:10px;color:#FF0000;">*保存时将转换成克(g)</span>
            </Form-item>
            </Col>
          </Row>
          <!-- 尺寸 -->
          <Row>
            <Col span="1" style="line-height:35px;color:#ed4014;font-size:14px;">*
            </Col>
            <Col span="23" style="marginLeft:-14px;">
            <Form-item label="尺寸" prop="size">
              <dyt-select :disabled="disableStatus" v-model="pageParamsModal.sizeUnit" style="width:100px;marginLeft:-10px;">
                <Option value="cm">cm</Option>
                <Option value="mm">mm</Option>
                <Option value="inch">inch</Option>
              </dyt-select>
              <InputNumber :min="0" style="width:56px;marginLeft:10px;" :disabled="disableStatus" placeholder="长" v-model.trim="pageParamsModal.packageMaterialLength"></InputNumber>
              <InputNumber :min="0" style="width:56px;marginLeft:10px;" :disabled="disableStatus" placeholder="宽" v-model.trim="pageParamsModal.packageMaterialWidth"></InputNumber>
              <InputNumber :min="0" style="width:56px;marginLeft:10px;" :disabled="disableStatus" placeholder="高" v-model.trim="pageParamsModal.packageMaterialHeight"></InputNumber>
              <span style="marginLeft:10px;color:#FF0000;">*保存时将转换成厘米(cm)</span>
            </Form-item>
            </Col>
          </Row>
          <!-- 状态 -->
          <Row>
            <Col span="1" style="line-height:35px;color:#ed4014;font-size:14px;">*
            </Col>
            <Col span="23" style="marginLeft:-14px;">
            <Form-item label="状态" prop="status">
              <dyt-select :disabled="disableStatus" v-model="pageParamsModal.status " style="width:100px;marginLeft:-10px;">
                <Option value="1">可用</Option>
                <Option value="0">停用</Option>
              </dyt-select>
            </Form-item>
            </Col>
          </Row>
          <!-- 包材编号 -->
          <Form-item label="包材编号" prop="packageMaterialNumber">
            <dyt-input :maxlength="1" style="width:100px" :disabled="disableStatus" v-model.trim="pageParamsModal.packageMaterialNumber"></dyt-input>
          </Form-item>
          <!-- 备注 -->
          <Form-item label="备注">
            <dyt-input :maxlength="100" :disabled="disableStatus" style="width:300px" v-model="pageParamsModal.packageMaterialDescription" type="textarea" :autosize="{minRows: 6,maxRows: 9}"></dyt-input>
          </Form-item>
        </Form>
      </Modal>
    </keep-alive>
    <!-- 导入 -->
    <Modal v-model="importModal" v-if="importModalStatus" title="导入" :loading="importModalLoading" @on-ok="upload" @on-cancel="uploadCancel">
      <p style="margin-top: 20px;float: left;">选择导入文件：</p>
      <div>
        <dytUpload ref="upload" name="files" :headers="headObj" :show-upload-list="false" :on-success="handleSuccess" :on-format-error="handleFormatError" :action="uploadFiles" :format="['xlsx','xls']" :before-upload="handleUpload" style='display: inline-block'>
          <Button style="marginLeft:10px;marginTop:10px;">选择文件</Button>
        </dytUpload>
        <a href="javascript:;" style='margin-left: 20px' @click='download'>下载模板</a>
        <div v-if="file !== null" style="marginTop:10px"> 上传文件：{{ file.name }}
        </div>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
// import { getToken } from '@/utils/cookie';

export default {
  mixins: [Mixin],
  data () {
    return {
      tableHeight: 500,
      pageParamsStatus: false, // 刷新
      pageParams: {
        status: 3, // 状态
        wrapperName: null, // 包材名称
        orderBy: 'createdTime', // 排序
        upDown: 'up',
        pageNum: 1,
        pageSize: 10
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
        }, {
          type: 'status',
          selected: false,
          status: true, // true up false down
          title: '按状态'
        }
      ],
      total: 0,
      curPage: 1,
      wrapperData: [], // 包材表格数据
      wrapperColumn: [
        {
          type: 'selection',
          width: 60,
          fixed: 'left',
          align: 'center'
        }, {
          title: 'NO',
          width: 60,
          align: 'center',
          render: (h, params) => {
            return h('span', params.index + 1);
          }
        }, {
          title: '包材名称',
          key: 'packageMaterialName',
          width: 160,
          align: 'center'
        }, {
          title: '包材编号',
          key: 'packageMaterialNumber',
          width: 100,
          align: 'center'
        }, {
          title: '包材尺寸（长*宽*高(cm)）',
          key: 'packageMaterialSize',
          width: 200,
          align: 'center',
          render: (h, params) => {
            return h('span', params.row.packageMaterialLength + '*' + params.row.packageMaterialWidth + '*' + params.row.packageMaterialHeight);
          }
        }, {
          title: '包材重量(g)',
          key: 'packageMaterialWeight',
          width: 160,
          align: 'center'
        }, {
          title: '成本',
          key: 'packageMaterialCost',
          width: 160,
          align: 'center'
        }, {
          title: '币种',
          key: 'currency',
          width: 160,
          align: 'center'
        }, {
          title: '备注',
          key: 'packageMaterialDescription',
          minWidth: 160,
          align: 'center'
        }, {
          title: '状态',
          key: 'status',
          minWidth: 160,
          align: 'center',
          render: (h, params) => {
            if (params.row.status) {
              return h('span', {
                style: {
                  color: '#008000'
                }
              }, '可用');
            } else {
              return h('span', {
                style: {
                  color: '#FF0000'
                }
              }, '停用');
            }
          }
        }, {
          title: '创建时间',
          key: 'createdTime',
          minWidth: 160,
          align: 'center',
          render: (h, params) => {
            return h('div', this.getDataToLocalTime(params.row.createdTime, 'fulltime'));
          }
        }, {
          title: '操作',
          width: 227,
          fixed: 'right',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Button', {
                style: {
                  marginRight: '10px',
                  display: (() => {
                    return this.getPermission('wmsPackageMaterial_detail') ? 'inline-block' : 'none';
                  })()
                },
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.seeWrapper(params.row);
                  }
                }
              }, '查看'), h('Button', {
                style: {
                  display: (() => {
                    return this.getPermission('wmsPackageMaterial_edit') ? 'inline-block' : 'none';
                  })()
                },
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.editWrapper(params.row);
                  }
                }
              }, '编辑'), params.row.status ? h('Button', {
                style: {
                  marginLeft: '10px',
                  display: (() => {
                    return this.getPermission('wmsPackageMaterial_disableStatus') ? 'inline-block' : 'none';
                  })()
                },
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.enableOrStopStatus(params.row);
                  }
                }
              }, '停用') : h('Button', {
                style: {
                  marginLeft: '10px',
                  display: (() => {
                    return this.getPermission('wmsPackageMaterial_openStatus') ? 'inline-block' : 'none';
                  })()
                },
                props: {
                  size: 'small'
                },
                on: {
                  click: () => {
                    this.enableOrStopStatus(params.row);
                  }
                }
              }, '启用')
            ]);
          }
        }
      ],
      addStatus: false, // 新增时用来初始化数据
      wrapperModal: false, // 弹框
      wrapperModalStatus: false,
      modalTitle: '新建包材',
      pageParamsModal: {
        packageMaterialName: null,
        packageMaterialNumber: null,
        packageMaterialCost: null,
        packageMaterialWeight: null,
        currency: 'CNY',
        weightUnit: 'g',
        sizeUnit: 'cm',
        status: '1',
        packageMaterialLength: null,
        packageMaterialWidth: null,
        packageMaterialHeight: null,
        packageMaterialDescription: null
      },
      paramsModalrest: null, // 关闭模态框 初始化数据用
      disableStatus: false,
      currencyList: [ // 币种
        {
          label: 'CNY' + '人民币',
          value: 'CNY'
        }, {
          label: 'GBP' + '英镑',
          value: 'GBP'
        }, {
          label: 'USD' + '美金',
          value: 'USD'
        }
      ],
      ruleValidate: { // 校验
        packageMaterialName: [
          {
            required: true,
            message: '包材名称' + '不能为空',
            trigger: 'blur'
          }
        ],
        packageMaterialNumber: [
          {
            required: true,
            message: '包材编号' + '不能为空',
            trigger: 'blur'
          }
        ]
      },
      wrapLoading: true,
      selectData: [], // 表格选中数据
      importModal: false, // 导入
      importModalStatus: false,
      importModalLoading: true,
      confirmUpload: false,
      file: null,
      uploadFiles: api.wmsService + api.import_wrapper // 上传文件
    };
  },
  computed: {
    headObj () {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    }
  },
  methods: {
    search () { // 查询
      let v = this;
      v.pageParamsStatus = true;
      v.curPage = 1;
      v.pageParams.pageNum = 1;
    },
    reset () { // 重置
      let v = this;
      v.pageParams.wrapperName = null;
    },
    addWrapper () { // 新建包材
      let v = this;
      v.pageParamsModal = v.deepCopy(v.paramsModalrest);
      v.addStatus = true;
      v.disableStatus = false;
      v.wrapperModal = true;
      v.wrapperModalStatus = true;
    },
    exportExcel (val) { // 导出
      let v = this;
      let obj = {};
      if (!val) { // 选中
        let list = [];
        if (v.selectData.length) {
          v.selectData.forEach((n, i) => {
            list.push(n.packageMaterialId);
          });
          obj = {
            exportType: 0,
            packageMaterialIds: list,
            orderBy: v.pageParams.orderBy === 'createdTime' ? 'CT' : 'ZT',
            orderSeq: v.pageParams.upDown === 'up' ? 'ASC' : 'DESC'
          };
        } else {
          v.$Message.error('请先选择数据');
          return false;
        }
      } else { // 所有
        if (!v.wrapperData.length) {
          v.$Message.error('无数据');
          return false;
        }
        obj = {
          exportType: 1,
          orderBy: v.pageParams.orderBy === 'createdTime' ? 'CT' : 'ZT',
          orderSeq: v.pageParams.upDown === 'up' ? 'ASC' : 'DESC',
          packageMaterialName: v.pageParams.wrapperName,
          pageNum: v.pageParams.pageNum,
          pageSize: v.pageParams.pageSize,
          status: v.pageParams.status,
          packageMaterialIds: []
        };
      }
      let newTab = window.open('about:blank');
      v.axios.post(api.wmsService + api.export_wrapper, obj).then(response => {
        if (response.data.code === 0) {
          newTab.location.href = '/wms-service/' + this.$store.state.erpConfig.filenodeViewTargetUrl.replace('./', '') + response.data.datas;
          setTimeout(function () {
            newTab.close();
          }, 1000);
        } else {
          newTab.close();
          (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('系统繁忙，请重新尝试');
        }
      }).catch(() => {
        newTab.close();
      });
    },
    importExcel () { // 导入
      let v = this;
      v.importModal = true;
      v.importModalStatus = true;
    },
    getList () { // 包材列表数据
      let v = this;
      if (!v.getPermission('wmsPackageMaterial_list')) return;
      let obj = {
        orderBy: v.pageParams.orderBy === 'createdTime' ? 'CT' : 'ZT',
        orderSeq: v.pageParams.upDown === 'up' ? 'ASC' : 'DESC',
        packageMaterialName: v.pageParams.wrapperName,
        status: v.pageParams.status,
        pageNum: v.pageParams.pageNum,
        pageSize: v.pageParams.pageSize
      };
      v.loadingTrue();
      v.axios.post(api.erpServiceCommon + api.get_packMeterial, obj).then(response => {
        if (response.data.code === 0) {
          v.loadingFalse();
          let data = response.data.datas;
          v.wrapperData = data.list;
          v.total = Number(data.total);
        }
      }).catch(() => {
        v.loadingFalse();
      });
    },
    save () { // 模态框 确定 重量单位1oz(盎司)=28.35g(克) 1lb(磅)=453.59g(克)
      let v = this;
      if (!v.disableStatus) {
        // 校验
        if (!v.pageParamsModal.packageMaterialName) {
          v.$Message.error('包材名称' + '不能为空');
          v.wrapLoading = false;
          v.$nextTick(function () {
            v.wrapLoading = true;
          });
          return false;
        } else if (!v.pageParamsModal.packageMaterialCost) {
          v.$Message.error('成本' + '不能为空');
          v.wrapLoading = false;
          v.$nextTick(function () {
            v.wrapLoading = true;
          });
          return false;
        } else if (!v.pageParamsModal.packageMaterialWeight) {
          v.$Message.error('重量' + '不能为空');
          v.wrapLoading = false;
          v.$nextTick(function () {
            v.wrapLoading = true;
          });
          return false;
        } else if (!v.pageParamsModal.packageMaterialLength || !v.pageParamsModal.packageMaterialWidth || !v.pageParamsModal.packageMaterialHeight) {
          v.$Message.error('尺寸' + '不能为空');
          v.wrapLoading = false;
          v.$nextTick(function () {
            v.wrapLoading = true;
          });
          return false;
        } else if (!v.pageParamsModal.packageMaterialNumber) {
          v.$Message.error('包材编号' + '不能为空');
          v.wrapLoading = false;
          v.$nextTick(function () {
            v.wrapLoading = true;
          });
          return false;
        }
        // 换算单位
        let weight = 0;
        if (v.pageParamsModal.weightUnit === 'oz') {
          weight = (28.35 * v.pageParamsModal.packageMaterialWeight).toFixed(2);
        } else if (v.pageParamsModal.weightUnit === 'lb') {
          weight = (453.59 * v.pageParamsModal.packageMaterialWeight).toFixed(2);
        } else {
          weight = v.pageParamsModal.packageMaterialWeight;
        }
        let length = 0;
        let width = 0;
        let height = 0;
        if (v.pageParamsModal.sizeUnit === 'mm') {
          length = (v.pageParamsModal.packageMaterialLength / 10).toFixed(2);
          width = (v.pageParamsModal.packageMaterialWidth / 10).toFixed(2);
          height = (v.pageParamsModal.packageMaterialHeight / 10).toFixed(2);
        } else if (v.pageParamsModal.sizeUnit === 'inch') { // 1 inch(英寸) = 2.54 cm
          length = (v.pageParamsModal.packageMaterialLength * 2.54).toFixed(2);
          width = (v.pageParamsModal.packageMaterialWidth * 2.54).toFixed(2);
          height = (v.pageParamsModal.packageMaterialHeight * 2.54).toFixed(2);
        } else {
          length = v.pageParamsModal.packageMaterialLength;
          width = v.pageParamsModal.packageMaterialWidth;
          height = v.pageParamsModal.packageMaterialHeight;
        }
        if (v.addStatus) { // 创建
          let obj = {
            packageMaterialName: v.pageParamsModal.packageMaterialName,
            packageMaterialNumber: v.pageParamsModal.packageMaterialNumber,
            currency: v.pageParamsModal.currency,
            packageMaterialCost: v.pageParamsModal.packageMaterialCost,
            packageMaterialWeight: weight,
            packageMaterialLength: length,
            packageMaterialWidth: width,
            packageMaterialHeight: height,
            status: Number(v.pageParamsModal.status),
            packageMaterialDescription: v.pageParamsModal.packageMaterialDescription
          };
          obj.cover = 0;
          v.axios.post(api.wmsService + api.cerated_packMeterial, obj).then(response => {
            if (response.data.code === 0) {
              v.wrapperModal = false;
              v.pageParamsStatus = true;
              v.pageParamsModal = v.deepCopy(v.paramsModalrest);
            } else {
              (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('系统繁忙，请重新尝试');
              v.wrapLoading = false;
              v.$nextTick(function () {
                v.wrapLoading = true;
              });
            }
          });
        } else { // 编辑
          v.pageParamsModal.packageMaterialWeight = weight;
          v.pageParamsModal.packageMaterialLength = length;
          v.pageParamsModal.packageMaterialWidth = width;
          v.pageParamsModal.packageMaterialHeight = height;
          v.axios.post(api.wmsService + api.edit_wrapper, v.pageParamsModal).then(response => {
            if (response.data.code === 0) {
              v.wrapperModal = false;
              v.pageParamsStatus = true;
              v.pageParamsModal = v.deepCopy(v.paramsModalrest);
            } else {
              (!response.data || ![999993, '999993'].includes(response.data.code)) && v.$Message.error('系统繁忙，请重新尝试');
              v.wrapLoading = false;
              v.$nextTick(function () {
                v.wrapLoading = true;
              });
            }
          });
        }
      } else {
        v.wrapLoading = false;
        v.wrapperModal = false;
      }
    },
    cancel () { // 模态框 取消
      let v = this;
      if (!v.disableStatus) {
        v.wrapperModal = false;
        v.$refs['warpperModal'].resetFields();
      }
    },
    seeWrapper (val) { // 查看
      let v = this;
      v.modalTitle = '查看';
      let obj = {
        packageMaterialName: val.packageMaterialName,
        packageMaterialNumber: val.packageMaterialNumber,
        currency: val.currency,
        packageMaterialCost: val.packageMaterialCost,
        packageMaterialWeight: val.packageMaterialWeight,
        packageMaterialLength: val.packageMaterialLength,
        packageMaterialWidth: val.packageMaterialWidth,
        packageMaterialHeight: val.packageMaterialHeight,
        status: val.status,
        packageMaterialDescription: val.packageMaterialDescription
      };
      v.pageParamsModal = obj;
      v.pageParamsModal.weightUnit = 'g';
      v.pageParamsModal.sizeUnit = 'cm';
      v.pageParamsModal.status = val.status.toString();
      v.addStatus = false;
      v.disableStatus = true;
      v.wrapperModal = true;
      v.wrapperModalStatus = true;
    },
    editWrapper (val) { // 编辑
      let v = this;
      v.modalTitle = '编辑';
      let obj = {
        packageMaterialId: val.packageMaterialId,
        packageMaterialName: val.packageMaterialName,
        packageMaterialNumber: val.packageMaterialNumber,
        currency: val.currency,
        packageMaterialCost: val.packageMaterialCost,
        packageMaterialWeight: val.packageMaterialWeight,
        packageMaterialLength: val.packageMaterialLength,
        packageMaterialWidth: val.packageMaterialWidth,
        packageMaterialHeight: val.packageMaterialHeight,
        status: val.status,
        packageMaterialDescription: val.packageMaterialDescription
      };
      v.pageParamsModal = obj;
      v.pageParamsModal.weightUnit = 'g';
      v.pageParamsModal.sizeUnit = 'cm';
      v.pageParamsModal.status = val.status.toString();
      v.addStatus = false;
      v.disableStatus = false;
      v.wrapperModal = true;
      v.wrapperModalStatus = true;
    },
    // 启用(停用)
    enableOrStopStatus (row) {
      const obj = {
        packageMaterialId: row.packageMaterialId,
        status: row.status ? 0 : 1
      };
      this.$Modal.confirm({
        title: '操作确认',
        content: `确认${row.status ? '停' : '启'}用：<span style="color: #f20;">${row.packageMaterialName || ''}</span>`,
        onOk: () => {
          this.axios.post(`${api.wmsService}${row.status ? api.disable_status : api.enable_status}`, obj).then(response => {
            if (response && response.data && response.data.code === 0) {
              this.$Message.success('操作成功');
              this.pageParamsStatus = true;
            }
          });
        }
      })
    },
    upload () { // 导入模态框 确认
      if (this.file !== null) {
        this.confirmUpload = true;
        this.$refs.upload.upload(this.file);
      } else {
        this.importModalLoading = false;
        this.$nextTick(function () {
          this.importModalLoading = true;
        });
        this.$Message.error('请选择文件');
      }
    },
    uploadCancel () { // 导入模态框 取消
      this.file = null;
    },
    handleSuccess (res, file, fileList) { // 上传成功
      if (res.code === 0) {
        this.file = null;
        this.$Message.success('已生成导入任务，可在“查看导入任务”中查询导入结果');
        this.confirmUpload = false;
        this.importModal = false;
        this.pageParamsStatus = true;
      } else if (res.code === 310008) {
        this.importModalLoading = false;
        this.$nextTick(function () {
          this.importModalLoading = true;
        });
        this.$Message.error('包材名称存在空值');
      } else if (res.code === 310002) {
        this.importModalLoading = false;
        this.$nextTick(function () {
          this.importModalLoading = true;
        });
        this.$Message.error('包材名称存在重复');
      } else if (res.code === 310001) {
        this.importModalLoading = false;
        this.$nextTick(function () {
          this.importModalLoading = true;
        });
        this.$Message.error('数据库中存在包材名称');
      } else {
        this.importModalLoading = false;
        this.$nextTick(function () {
          this.importModalLoading = true;
        });
        (!res || ![999993, '999993'].includes(res.code)) && this.$Message.error('操作失败，请重新尝试');
      }
    },
    handleFormatError () { // 上传失败
      this.$Message.error('文件格式有误');
      this.importModalLoading = false;
      this.$nextTick(function () {
        this.importModalLoading = true;
        this.confirmUpload = false;
      });
    },
    handleUpload (file) { // Excel 导入
      this.file = file;
      return this.confirmUpload;
    },
    getSelectValue (value) { // table获取所选值
      let v = this;
      v.selectData = value;
    },
    download () { // 下载模板
      let v = this;
      v.axios.get(api.wmsService + api.get_wrapperTemp).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          // let url = v.filenodeViewTargetUrl.replace('setting-service', 'wms-service');
          // window.open(url + data, '_self');
          window.open(api.wmsService + v.filenodeViewTargetUrl + data, '_self');
        }
      });
    }
  },
  created () {
    let v = this;
    this.tableHeight = this.getTableHeight(290);
    v.getPermissionCallback('logistics_wrapperManage').then(() => {
      v.getList();
      v.paramsModalrest = v.deepCopy(v.pageParamsModal);
    });
  },
  watch: {
    pageParamsStatus (n) {
      let v = this;
      if (n) {
        v.getList();
        v.pageParamsStatus = false;
      }
    }
  }
};
</script >

<style scoped ></style >
