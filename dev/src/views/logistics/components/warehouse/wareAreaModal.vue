<template >
  <div >
    <div class="modalItemContent" >
      <div class="addModalData" >
        <Form
            :model="newWareAreaParams"
            label-position="right"
            :label-width="90"
            ref="newWareAreaParams"
            :rules="ruleWareArea" >
          <Form-item label="库区代码：" prop="wareAreaCode" >
            <Input
                :disabled="disabledStatus || editType === 'look'"
                v-model.trim="newWareAreaParams.wareAreaCode"
                style="width:250px"
                placeholder="请输入库区代码"
                :maxlength="15" ></Input >
          </Form-item >
          <Form-item label="库区名称：" prop="wareAreaName" >
            <Input
                v-model.trim="newWareAreaParams.wareAreaName"
                :disabled="editType === 'look'"
                style="width:250px"
                placeholder="请输入库区名称"
                :maxlength="50" ></Input >
          </Form-item >
          <Form-item label="拣货优先级：" prop="sortId" >
            <!--<Input v-model.trim="newWareAreaParams.sortId" style="width:250px" placeholder="请输入SortID"></Input>-->
            <InputNumber
                :min="1"
                :disabled="editType === 'look'"
                v-model.trim="newWareAreaParams.sortId"
                style="width:250px"
                :max="99999999999" ></InputNumber >
          </Form-item >
          <Form-item label="仓库：" prop="selectWareHouse" >
            <dyt-select
                filterable
                :disabled="disabledStatus || editType === 'look'"
                v-model="newWareAreaParams.selectWareHouse"
                style="width:250px"
                @on-change="changeWarehouse" > <Option
                v-for="item in wareHouseTypeList"
                :value="item.warehouseId"
                :key="item.warehouseId" >{{ item.warehouseName }}</Option> </dyt-select >
          </Form-item >
          <Form-item label="库区类型：" prop="selectWareAreaType" >
            <dyt-select v-model="newWareAreaParams.selectWareAreaType" :disabled="editType === 'look'" style="width:250px" >
            <Option value="00" >收货区</Option > <Option value="10" >标准区</Option > <Option value="11" >良品区</Option >
            <Option value="12" >不良品区</Option > <Option value="30" >异常处理库区</Option >
            <!-- <Option value="20">退货区</Option> -->
            </dyt-select >
          </Form-item >
          <Form-item label="状态：" prop="selectStatus" >
            <dyt-select v-model="newWareAreaParams.selectStatus" :disabled="editType === 'look'" style="width:250px" >
            <Option value="0" >可用</Option > <Option value="1" >停用</Option > </dyt-select >
          </Form-item >
          <Form-item label="库区组：" prop="wareAreaGroup" >
            <dyt-select
                v-model="newWareAreaParams.warehouseBlockGroupId"
                :disabled="editType === 'look'"
                style="width:250px"
                clearable
                @on-open-change="getWareAreaGroup" > <Option
                v-for="item in wareAreaGroupList"
                :value="item.warehouseBlockGroupId"
                :key="item.warehouseBlockGroupId" >{{ item.name }}</Option> </dyt-select >
          </Form-item >
          <Form-item
              label="上架绑定分类"
              v-if="newWareAreaParams.selectWareAreaType === '10' || newWareAreaParams.selectWareAreaType === '11'" >
            <treeSelect
                :disabled="editType === 'look'"
                refs="categoryTree"
                :treeData="productCategoryTree"
                style="width:250px"
                v-model="productCategoryIdList"
                filterable
                showCheckbox ></treeSelect >
          </Form-item >
          <Form-item label="上架绑定产品" >
            <Input v-model="newWareAreaParams.skuList" placeholder="输入SKU号，多个SKU用换行分隔" type="textarea" />
          </Form-item >
        </Form >
      </div >
    </div >
  </div >
</template >
<script >
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  data () {
    return {
      productCategoryTree: [ // 商品分类树
        {
          title: '全部',
          expand: true,
          children: []
        }
      ],
      wareHouseTypeList: [], // 选择仓库
      productCategoryIdList: [], // 库区下绑定的商品分类列表
      newWareAreaParams: {
        skuList: '', // 库区下绑定的商品列表
        productCategoryIdList: [], // 库区下绑定的商品分类列表
        wareAreaCode: '', // 库区代码
        wareAreaName: '', // 库区名称
        sortId: null, // SortID
        selectWareHouse: '', // 选择仓库
        selectWareAreaType: '', // 选择库区类型
        selectStatus: '', // 选择状态
        warehouseBlockGroupId: 'null' // 库组组
      },
      disabledStatus: false, // 编辑时库区代码不能修改
      warehouseBlockGroupId: '',
      ruleWareArea: {
        wareAreaCode: [
          {
            required: true,
            message: '库区代码不能为空',
            trigger: 'blur'
          }, {
            type: 'string',
            max: 15,
            message: '超出最大长度限制',
            trigger: 'blur'
          }
        ],
        wareAreaName: [
          {
            required: true,
            message: '库区名称不能为空',
            trigger: 'blur'
          }, {
            type: 'string',
            max: 50,
            message: '超出最大长度限制',
            trigger: 'blur'
          }
        ],
        selectWareHouse: [
          {
            required: true,
            message: '仓库不能为空',
            trigger: 'change'
          }
        ],
        selectWareAreaType: [
          {
            required: true,
            message: '库区类型不能为空',
            trigger: 'change'
          }
        ],
        selectStatus: [
          {
            required: true,
            message: '库区状态不能为空',
            trigger: 'change'
          }
        ]
      },
      wareAreaGroupList: []
    };
  },
  props: {
    editType: { // 查看仓库数据的标记
      default: 'look'
    },
    curSingleDtl: { // 查看仓库数据的标记
      default: null
    },
    openFlag: { // 打开模态框的标记
      default: null
    },
    wareId: { // 编辑当前哪个仓库信息的标记
      default: null
    },
    wareBlockId: {
      default: null
    },
    wareAreaModalStatus: { // 状态 add edit
      default: null
    }
  },
  watch: {
    // 查看当前库区信息
    '$store.state.wareAreaWatchFlag': function (bool) {
      let v = this;
      v.setTreeDate([]); // 清空分类选中
      if (v.wareAreaModalStatus === 'edit') {
        if (bool) {
          v.newWareAreaParams.wareAreaCode = v.curSingleDtl.warehouseBlockCode; // 库区代码
          v.newWareAreaParams.wareAreaName = v.curSingleDtl.warehouseBlockName; // 库区名称
          v.newWareAreaParams.sortId = v.curSingleDtl.sortId; // SortID
          v.newWareAreaParams.selectWareHouse = v.curSingleDtl.warehouseId; // 选择仓库
          v.newWareAreaParams.selectWareAreaType = v.curSingleDtl.warehouseBlockType; // 选择库区类型
          v.newWareAreaParams.selectStatus = v.curSingleDtl.warehouseBlockStatus; // 选择状态
          v.newWareAreaParams.warehouseBlockGroupId = v.curSingleDtl.warehouseBlockGroupId
                                                      ? v.curSingleDtl.warehouseBlockGroupId
                                                      : 'null'; // 库区组
          v.validCategoryIdMt(v.curSingleDtl.productCategoryIdList);
          v.setTreeDate(v.curSingleDtl.productCategoryIdList); // 分类赋值
          v.getEditGroupData();
          if (v.curSingleDtl.skuList) {
            v.newWareAreaParams.skuList = v.curSingleDtl.skuList.join('\n');
          }
        } else {
          v.newWareAreaParams.wareAreaCode = '';
          v.newWareAreaParams.wareAreaName = '';
          v.newWareAreaParams.sortId = '';
          v.newWareAreaParams.selectWareHouse = '';
          v.newWareAreaParams.selectWareAreaType = '';
          v.newWareAreaParams.selectStatus = '';
          v.newWareAreaParams.warehouseBlockGroupId = '';
          v.newWareAreaParams.skuList = '';
          v.productCategoryIdList = [];
        }
      }
      if (!bool) {
        this.$refs['newWareAreaParams'].resetFields();
      }
    }
  },
  created () {
    this.getWareAreaName(); // 渲染仓库列表
    this.getProductCategoryList(); // 加载库区组下拉列表
  },
  methods: {
    getProductCategoryList () { // 获取商品分类(筛选下拉)
      let v = this;
      v.getProductCategoryListMt().then(() => {
        v.productCategoryList = v.$store.state.productCategoryList;
        let productCategoryTree = v.getProductCategoryTree(v.productCategoryList, null);
        v.$set(v.productCategoryTree[0], 'children', []);
        v.$nextTick(function () {
          v.$set(v.productCategoryTree[0], 'children', productCategoryTree);
        });
      });
      /* self.axios.get('/wms-service/erpCommon' + api.get_productCategory, { hiddenError: true })
       .then(response => {
       if (response.data.code === 0) {

       }
       }); */
    },
    validCategoryIdMt (selectId) {
      let v = this;
      // 这里是为了处理原本A父类有2个子类 全选，后面A父类添加了一个子类但是因为父Id传过去了 全选问题
      let arr = v.productCategoryTree[0].children;

      function makeTree (a) {
        a.forEach((i) => {
          v.$set(i, '_setChecked', false);
          if (selectId) {
            selectId.forEach(j => {
              if (i.productCategoryId === j) {
                v.$set(i, '_setChecked', true);
              }
            });
          }
          if (i.children) {
            makeTree(i.children);
          }
        });
      }

      makeTree(arr);
    },
    setTreeDate (selectId) {
      let v = this;
      let arr = v.productCategoryTree[0].children;
      let item = [];

      function makeTree (a) {
        a.forEach((i) => {
          v.$set(i, 'checked', false);
          if (selectId) {
            selectId.forEach(j => {
              if (i.productCategoryId === j) {
                if (i.children) {
                  /* if (i.children.length === i.children.filter(i => i._setChecked).length) {
                   v.$set(i, 'checked', true);
                   if (!i.pisChecked) {
                   item.push(i);
                   }
                   } */
                } else {
                  v.$set(i, 'checked', true);
                  if (!i.pisChecked) {
                    item.push(i);
                  }
                }
              }
            });
          }
          if (i.children) {
            i.children.forEach(j => {
              j.pisChecked = i.checked;
            });
            makeTree(i.children);
          }
        });
      }

      makeTree(arr);
      v.$nextTick(() => {
        v.productCategoryIdList = item;
      });
    }, // 获取仓库下拉列表
    getWareAreaName () {
      var v = this;
      v.axios.get(api.wmsService + api.query_warehouse).then(res => {
        if (res.data.code === 0) {
          v.$nextTick(() => {
            v.wareHouseTypeList = res.data.datas;
          });
        }
      });
    },
    getIds (data, id) {
      // 获取分类id
      data.forEach(i => {
        if (i.productCategoryId) {
          id.push(i.productCategoryId);
        }
        if (i.children) {
          this.getIds(i.children, id);
        }
      });
      return [...new Set(id)];
    },
    paramsObj () {
      let v = this;
      let obj = {};
      let skuList = [];
      if (v.newWareAreaParams.skuList.includes(',')) {
        skuList = v.newWareAreaParams.skuList.split(',');
      } else if (v.newWareAreaParams.skuList.includes('\n')) {
        skuList = v.newWareAreaParams.skuList.split('\n');
      } else if (!v.newWareAreaParams.skuList) {
        skuList = null;
      } else {
        skuList = [v.newWareAreaParams.skuList];
      }

      if (v.wareAreaModalStatus === 'add') { // 新增
        obj = {
          warehouseId: v.newWareAreaParams.selectWareHouse, // 仓库标记
          warehouseBlockCode: v.newWareAreaParams.wareAreaCode,
          warehouseBlockName: v.newWareAreaParams.wareAreaName,
          sortId: v.newWareAreaParams.sortId,
          warehouseBlockType: v.newWareAreaParams.selectWareAreaType,
          warehouseBlockStatus: v.newWareAreaParams.selectStatus,
          warehouseBlockGroupId: v.newWareAreaParams.warehouseBlockGroupId !== 'null'
                                 ? v.newWareAreaParams.warehouseBlockGroupId
                                 : '',
          productCategoryIdList: v.getIds(v.productCategoryIdList, []),
          skuList: skuList
        };
      } else { // 编辑
        obj = {
          warehouseId: v.newWareAreaParams.selectWareHouse, // 编辑当前行仓库ID
          warehouseBlockId: v.wareBlockId, // 编辑当前行库区ID
          warehouseBlockCode: v.newWareAreaParams.wareAreaCode,
          warehouseBlockName: v.newWareAreaParams.wareAreaName,
          sortId: v.newWareAreaParams.sortId,
          warehouseBlockType: v.newWareAreaParams.selectWareAreaType,
          warehouseBlockStatus: v.newWareAreaParams.selectStatus,
          warehouseBlockGroupId: v.newWareAreaParams.warehouseBlockGroupId !== 'null'
                                 ? v.newWareAreaParams.warehouseBlockGroupId
                                 : '',
          productCategoryIdList: v.getIds(v.productCategoryIdList, []),
          skuList: skuList
        };
      }
      if (v.newWareAreaParams.selectWareAreaType !== '10' && v.newWareAreaParams.selectWareAreaType !== '11') {
        // 只有“标准区”和“良品区”允许绑定分类
        obj.productCategoryIdList = [];
      }

      return obj;
    },
    getCreateParams (name) {
      var v = this;
      var obj = this.paramsObj();
      v.$refs[name].validate((valid) => {
        let params = {
          warehouseId: obj.warehouseId,
          warehouseBlockCode: obj.warehouseBlockCode,
          warehouseBlockName: obj.warehouseBlockName,
          warehouseBlockGroupId: obj.warehouseBlockGroupId
        };
        if (valid) {
          v.axios.post(api.wmsService + api.check_wareArea, params).then(response => {
            if (response.data.code === 0) {
              if (response.data.datas) {
                v.$emit('createFail');
                v.$Message.error('库区代码或者库区名称已存在！' + '！');
              } else {
                v.axios.post(api.wmsService + api.addWareAreaData, obj).then(res => {
                  if (res.data.code === 0) {
                    v.$emit('createSuccess');
                    // this.$store.commit('wareAreaWatchFlag', true);
                    v.$Message.success('新增库区成功' + '！');
                  } else {
                    v.$emit('createFail');
                    v.$Message.warning('新增库区失败' + '！');
                  }
                });
              }
            }
          });
        } else {
          v.$Message.warning('新增库区失败' + '！');
        }
      });
    },
    getEditParams (name) {
      var v = this;
      var obj = this.paramsObj();
      v.$refs[name].validate((valid) => {
        if (valid) {
          v.axios.post(api.wmsService + api.wareAreaWatchDtl, obj).then(res => {
            if (res.data.code === 0) {
              v.$emit('editSuccess');
              v.$Message.success('编辑库区成功' + '！');
            } else if (res.data.code === 610007) {
              v.$emit('createFail');
              let sku = res.data.message.replace(/.*SKU：{(.*?)}[\s\S]*/g, '$1'); // .replace(/.*SKU：{(.*?)}.*/g,'$1')
              v.$Message.warning('(' + sku + ')' + 'sku已经绑定在其库区' + '！');
            } else {
              v.$emit('editFail');
              v.$Message.warning('编辑库区失败' + '！');
            }
          });
        } else {
          v.$Message.warning('编辑库区失败' + '！');
        }
      });
    },
    handleReset (name) {
      this.$refs[name].resetFields();
    }, // 新增库区
    addNewWareArea () {
      this.getCreateParams('newWareAreaParams');
    }, // 查看和编辑库区
    editOrWatchWareBlock () {
      this.getEditParams('newWareAreaParams');
    }, // 重置表单
    resetNewWareArea () {
      this.handleReset('newWareAreaParams');
    },
    getWareAreaGroup (val) { // 获取库区组下拉
      let v = this;
      if (val) {
        v.getEditGroupData();
      }
    },
    getEditGroupData () { // 新增或编辑时获取库区组
      let v = this;
      let pos = [];
      if (v.newWareAreaParams.selectWareHouse) {
        v.axios.get(api.wmsService + api.get_wareAreaGroupList + '?warehouseId=').then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            if (data) {
              data.forEach((n, i) => {
                if (n.warehouseId === v.newWareAreaParams.selectWareHouse) {
                  pos.push(n);
                }
              });
              v.wareAreaGroupList = pos;
            }
          }
        });
      } else {
        v.$Message.warning('请选择仓库' + '！');
      }
    },
    changeWarehouse () { // 改变仓库时，清空选择的库区组数据
      // let v = this;
      // v.newWareAreaParams.warehouseBlockGroupId = null;
    }
  }
};
</script >
