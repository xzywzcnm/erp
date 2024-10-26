<template>
  <!-- 审样模块 -->
  <div class="form-contain form-contain-disabled">
    <Form ref="formValidate" :model="formValidate" :label-width="90" class="fmb16">
      <FormItem label="质检模板:">
        <span>{{ qualityTemplateName }}</span>
      </FormItem>
      <div v-for="(item,index) in formValidate.formData" :key="`div-${index}`">
        <div class="form-line-flex">
          <FormItem label="项目:">
            <p style="width:100px; overflow: hidden;text-overflow:ellipsis;white-space: nowrap;">{{item.qualityProject}}</p>
          </FormItem>
          <FormItem label="内容:">
            <Tooltip :content='item.qualityDescription' max-width="800">
              <p style="width:500px; overflow: hidden;text-overflow:ellipsis;white-space: nowrap;">
                {{item.qualityDescription}}
              </p>
            </Tooltip>
          </FormItem>
        </div>

        <div class="form-line-flex">
          <FormItem
            label="质检结果:"
            :key="`form-${index}`"
            :prop="'formData.' + index + '.results'"
            :rules="{ required: true, message: '质检结果必填', trigger: 'blur' }"
          >
            <Input
              v-model="item.results"
              type="textarea"
              :autosize="{minRows: 2,maxRows: 5}"
              placeholder="请输入"
              :disabled="!permissionStatus"
              style="width:500px"
            />
          </FormItem>
          <FormItem>
            <upload-img v-model="item.fileList" :options="{ limit:5, accept: 'image/*' }" :isDisabled="picEdit"></upload-img>
          </FormItem>
        </div>

      </div>

      <FormItem label="审样核价备注:">
        <Button type="primary" size="small" @click="addMark()" v-if="permissionStatus">添加备注</Button>
      </FormItem>

      <Table :columns="columns" :data="descTablelist" border highlight-row maxHeight="200">
        <template slot-scope="{ row }" slot="createdBy">
          <span v-for="litem in purchaserArr" :key="litem.userId">{{row.createdBy === litem.userId ? litem.userName : ''}}</span>
        </template>
      </Table>

    </Form>

    <Modal v-model="dialogForm.dialogVisible" title="审样核价备注" :mask-closable="false">
      <Form ref="dialogForm" :model="dialogForm.formValidate" :rules="dialogForm.ruleValidate" :label-width="0">
        <FormItem prop="remarks">
          <Input v-model="dialogForm.formValidate.remarks" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="dialogForm.dialogVisible=false">取消</Button>
        <Button type="primary" :loading="dialogForm.loading" @click="addMarkok()">确定</Button>
      </div>
    </Modal>
  </div>
</template> 

<script>
import api from "@/api/api";
import { time_now } from '@/utils/comConfig';
import UploadImg from '@/components/uploadImg';
export default {
  name: "basicData",
  components: { UploadImg },
  data () {
    return {
      formValidate: {
        descList: [],
        formData: []
      },
      qualityTemplateJson: {},
      descTablelist: [],
      columns: [
        {
          title: '时间',
          key: 'createdTime',
          width: 200
        },
        {
          title: '备注内容',
          key: 'remarks',
        },
        {
          title: '添加人',
          slot: 'createdBy',
          width: 200
        },
      ],
      dialogForm: {
        dialogVisible: false,
        formValidate: {
          remarks: ''
        },
        ruleValidate: {
          remarks: [
            { required: true, message: '核价备注必填', trigger: 'blur' }
          ]
        },
        loading: false
      },
      // projectIdList: [],//项目id列表
      qualityClassificationId: '',
      picEdit: true

    };
  },
  props: {
    productData: {
      type: Object,
      default () {
        return {};
      }
    },
    purchaserArr: {
      type: Array,
      default () {
        return [];
      }
    },
    openType: {
      type: String,
      default () {
        return '';
      }
    }
  },
  computed: {
    // 是否可编辑
    permissionStatus () {
      let userInfo = this.$store.state.erpConfig && this.$store.state.erpConfig.userInfo;
      return this.productData.status === 4 && this.productData.requireVerifyBy === userInfo.userId && this.openType !== 'view';
    },
    // 质检项目
    qualityTemplateName () {
      const qualityTemplate = this.qualityTemplateJson[this.qualityClassificationId];
      return  this.$common.isEmpty(qualityTemplate) ? '暂无' : qualityTemplate.qualityClassification || '';
    }
  },
  created () {
    this.getAllQuality();
    this.getQualityList()
  },

  methods: {
    //获取质检分类和项目内容
    getQualityList () {
      if (this.openType === 'edit' && this.productData.status === 4) this.picEdit = false
      let { productId } = this.productData;
      this.$Spin.show();
      this.$axios.get(api.qualitySampleReview + '?productId=' + productId).then(({ code, datas }) => {
        this.qualityClassificationId = '';
        if (!this.$common.isEmpty(datas.laPaProductQualityInspectionList) && !this.$common.isEmpty(datas.laPaProductQualityInspectionList[0])) {
          this.qualityClassificationId = datas.laPaProductQualityInspectionList[0].qualityClassificationId;
        }
        // let projectIdList = [];
        // (datas.laPaProductQualityInspectionList || []).forEach((item, index) => {
        //   projectIdList.push(item.qualityProjectId);
        //   //取分类id
        //   if (index === 0) {
        //     this.qualityClassificationId = item.qualityClassificationId;
        //   }
        // })
        // this.projectIdList = projectIdList;
        
        this.formValidate.formData = datas.laPaProductQualityInspectionList || [];
        this.descTablelist = (datas.laPaProductSampleRemarkList || []).map(item => {
          return {
            ...item,
            // 根据系统时区转换为本地时间
            createdTime: this.$common.toLocaleDate(item.createdTime, 'fulltime')
          }
        });
      }).then(res => {
        // 表单信息处理
        this.handleFormImageUrl();
        //获取分类项目名字及内容
        // this.getProjectListById();
      }).finally(() => {
        this.$Spin.hide();
      });
    },
    // 获取所有质检模板
    getAllQuality () {
      return new Promise((resolve) => {
        this.axios.get(api.getAllQualityTemplate).then((res) => {
          if (res && res.code === 0) {
            (res.datas || []).forEach(item => {
              this.$set(this.qualityTemplateJson, item.qualityClassificationId, item);
            })
            resolve(res.datas || []);
          } else {
            resolve([]);
          }
        }).catch(() => {
          resolve([]);
        })
      })
    },
    handleFormImageUrl () {
      this.formValidate.formData.forEach((item, index) => {
        //第一次进入 imgurl 为空进行判断
        if (item.imageUrl) {
          let array = item.imageUrl.split(",")
          let tempArray = []
          array.forEach(item => {
            let temp = {}
            temp.url = item
            tempArray.push(temp)
          })
          this.$set(this.formValidate.formData[index], 'fileList', tempArray)
        } else {
          //第一次进入
          this.$set(this.formValidate.formData[index], 'fileList', [])
        }
      })
    },
    // 根据项目id和分类id匹配出分类项目的名字和项目的内容
    // getProjectListById () {
    //   let temp = {
    //     productQualityProjectIdList: this.projectIdList,
    //     status: 0
    //   }
    //   this.$axios.post(api.queryProductQualityProjectListById, temp).then(res => {
    //     let list = res.datas
    //     if (list.length === 0) {
    //       this.formValidate.formData.forEach((item, index) => {
    //         //第一次进入 imgurl 为空进行判断
    //         if (item.imageUrl) {
    //           let array = item.imageUrl.split(",")
    //           let tempArray = []
    //           array.forEach(item => {
    //             let temp = {}
    //             temp.url = item
    //             tempArray.push(temp)
    //           })
    //           this.$set(this.formValidate.formData[index], 'fileList', tempArray)
    //         } else {
    //           //第一次进入
    //           this.$set(this.formValidate.formData[index], 'fileList', [])
    //         }
    //       })
    //       return
    //     }
    //     this.formValidate.formData.forEach((item, index) => {
    //       this.$set(this.formValidate.formData[index], 'qualityClassification', list[index].qualityClassification || '')
    //       this.$set(this.formValidate.formData[index], 'qualityDescription', list[index].qualityDescription || '')
    //       this.$set(this.formValidate.formData[index], 'qualityProject', list[index].qualityProject || '')
    //       //第一次进入 imgurl 为空进行判断
    //       if (item.imageUrl) {
    //         let array = item.imageUrl.split(",")
    //         let tempArray = []
    //         array.forEach(item => {
    //           let temp = {}
    //           temp.url = item
    //           tempArray.push(temp)
    //         })
    //         this.$set(this.formValidate.formData[index], 'fileList', tempArray)
    //       } else {
    //         //第一次进入
    //         this.$set(this.formValidate.formData[index], 'fileList', [])
    //       }
    //     })
    //   })
    // },
    // 提交 1:审核 2:保存
    handleData (type, callBack) {
      if (type == 2) {
        this.handleForm(type, callBack);
        return
      }
      this.$refs['formValidate'].validate((valid) => {
        if (valid) {
          this.handleForm(type, callBack);
        }
      });
    },
    handleForm (type, callBack) {
      let { productId } = this.productData;
      let [temp, productSampleRemarkList, productQualityInspectionList] = [{}, [], []];
      this.formValidate.formData.forEach(item => {
        item.imageUrl = item.fileList.map(itema => {
          return itema.url
        })
      })
      productSampleRemarkList = this.descTablelist.map(k => {
        return { createdTime: k.createdTime, productId: productId, remarks: k.remarks, createdBy: k.createdBy };
      });
      productQualityInspectionList = this.formValidate.formData.map(k => {
        return {
          results: k.results,
          imageUrl: k.imageUrl.join(','),
          productId: this.productData.productId,
          qualityClassificationId: k.qualityClassificationId,
          qualityProjectId: k.qualityProjectId
        }
      });
      temp.productId = productId;
      temp.productSampleRemarkList = productSampleRemarkList;//备注的
      temp.productQualityInspectionList = productQualityInspectionList;
      // return;
      this.$Spin.show();

      this.$axios.post(api.saveSampleReviewData, temp).then(({ code }) => {
        if (code === 0) {
          if (type === 1) {
            this.$emit('verifyFormValidate');//审样核价通过
          } else {
            typeof callBack != 'function' && this.$Message.success('操作成功~');
          }
        }
        typeof callBack == 'function' && callBack(code === 0);
      }).finally(() => {
        this.$Spin.hide();
      }).catch(() => {
        typeof callBack == 'function' && callBack(false);
      })
    },
    // 添加备注
    addMark () {
      this.$refs['dialogForm'].resetFields();
      this.dialogForm.dialogVisible = true;
    },
    // 提交备注
    addMarkok () {
      this.$refs['dialogForm'].validate((valid) => {
        if (valid) {
          let userInfo = this.$store.state.erpConfig.userInfo || {};
          this.descTablelist.push(
            {
              createdTime: time_now(),
              remarks: this.dialogForm.formValidate.remarks,
              createdBy: userInfo.userId || ''
            }
          );
          this.cancel();
        }
      });
    },
    // 取消弹框
    cancel () {
      this.dialogForm.dialogVisible = false;
    }
  }
};
</script>

<style>
.form-contain .form-flex {
  display: flex;
}
.form-contain .form-flex .form-flex__titile {
  margin-right: 20px;
}
.form-contain .quote-sty .ivu-select-selection {
  border-radius: 4px 0 0 4px;
  border-right: none;
}
.form-contain .quote-sty .ivu-input {
  border-radius: 0 4px 4px 0;
}
.form-contain .icon-sty {
  cursor: pointer;
  font-weight: bold;
}
</style>