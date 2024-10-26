<template>
  <div>
    <!-- 指派人员 -->
    <Modal v-model="nextForm.dialogVisible" width="600" :title="nextForm.title" :mask-closable="false" :closable="false">
      <Form ref="nextForm" class="form-min-height form-contain-disabled" :model="nextForm.formValidate" :rules="nextForm.ruleValidate" :label-width="90">
        <FormItem label="下一阶段:">
          <span>{{nextForm.content||''}}</span>
        </FormItem>
        <FormItem label="指派人员:" prop="requireVerifyBy">
          <!-- <dyt-select v-model="nextForm.formValidate.requireVerifyBy" filterable clearable :disabled="nextForm.disabled">
            <Option v-for="item in userList" :key="item.userId" :value="item.userId">{{item.userName}}</Option>
          </dyt-select> -->
          <dyt-select
            v-model="nextForm.formValidate.requireVerifyBy"
            :option="userList"
            :replaceKey="{value: 'userId', label: 'userName'}"
            :top-item="erpUserId"
            :sort-key="`requireVerifyBy-${erpUserId}`"
          />
        </FormItem>
        <FormItem label="给供应商意见:" v-if="nextForm.advinceForSupply && (productData.productSource===1)">
          <Input v-model="nextForm.formValidate.supplierRemark" type="textarea" :rows="6" placeholder="请输入"></Input>
        </FormItem>
        <FormItem label="备注:" prop="remark" v-if="nextForm.remarkShow ">
          <Input v-model="nextForm.formValidate.remark" type="textarea" :rows="6" placeholder=" 请输入"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" :loading="nextForm.loading" @click="handleNext()">确定</Button>
        <Button @click="closeNextForm()">取消</Button>
      </div>
    </Modal>
        <!-- 指派图片/文本 -->
      <Modal v-model="picAndText.dialogVisible" width="600" :title="picAndText.title" :mask-closable="false" :closable="false">
      <Form ref="picAndText" class="form-min-height form-contain-disabled" :model="picAndText.formValidate" :rules="picAndText.ruleValidate" :label-width="90">
        <FormItem label="下一阶段:">
          <span>{{picAndText.content||''}}</span>
        </FormItem>
        <FormItem label="指派完善图片:" prop="requireVerifyBy" :label-width = "120">
          <!-- <dyt-select v-model="picAndText.formValidate.requireVerifyBy" filterable clearable :disabled="picAndText.disabled">
            <Option v-for="item in userList" :key="item.userId" :value="item.userId">{{item.userName}}</Option>
          </dyt-select> -->
          <dyt-select
            v-model="picAndText.formValidate.requireVerifyBy"
            :option="userList"
            :replaceKey="{value: 'userId', label: 'userName'}"
            :top-item="erpUserId"
            :sort-key="`requireVerifyBy-${erpUserId}`"
          />
        </FormItem>
         <FormItem label="指派完善文本:" prop="textRequireVerifyBy" :label-width = '120'>
          <!-- <dyt-select v-model="picAndText.formValidate.textRequireVerifyBy" filterable clearable :disabled="picAndText.disabled">
            <Option v-for="item in userList" :key="item.userId" :value="item.userId">{{item.userName}}</Option>
          </dyt-select> -->
          <dyt-select
            v-model="picAndText.formValidate.textRequireVerifyBy"
            :option="userList"
            :replaceKey="{value: 'userId', label: 'userName'}"
            :top-item="erpUserId"
            :sort-key="`textRequireVerifyBy-${erpUserId}`"
          />
        </FormItem>
        <FormItem label="给供应商意见:" v-if="picAndText.advinceForSupply && (productData.productSource===1)">
          <Input v-model="picAndText.formValidate.supplierRemark" type="textarea" :rows="6" placeholder="请输入"></Input>
        </FormItem>
        <FormItem label="备注:" v-if="picAndText.remarkShow" prop="remark">
          <Input v-model="picAndText.formValidate.remark" type="textarea" :rows="6" placeholder=" 请输入"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" :loading="picAndText.loading" @click="handleNext1()">确定</Button>
        <Button @click="picAndText.dialogVisible = false">取消</Button>
      </div>
    </Modal>

    <!-- 驳回提交 -->
    <Modal v-model="rejectForm.dialogVisible" width="600" title="驳回提交人" :mask-closable="false" :closable="false">
      <Form ref="rejectForm" :model="rejectForm.formValidate" :rules="rejectForm.ruleValidate" :label-width="0">
        <FormItem prop="remark">
          <Input v-model="rejectForm.formValidate.remark" type="textarea" :rows="6" placeholder="请输入"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" :loading="rejectForm.loading" @click="handleReject()">确定</Button>
        <Button @click="rejectForm.dialogVisible=false">取消</Button>
      </div>
    </Modal>

    <!-- 审核意见 -->
    <Modal v-model="verifyForm.dialogVisible" :title="verifyForm.title" :mask-closable="false" :closable="false" width="600">
      <Form ref="verifyForm" class="labelposiTop form-min-height form-contain-disabled" :model="verifyForm.formValidate" :rules="verifyForm.ruleValidate" label-position="top">
        <div class="mb15" v-if="verifyForm.showNextContent">
          {{`${verifyForm.nextLabel || ''}：${verifyForm.nextContent || ''}`}}
        </div>
        <FormItem :label="verifyForm.labelAssign+':'" prop="requireVerifyBy" v-if="verifyForm.assignMan">
          <!-- <dyt-select v-model="verifyForm.formValidate.requireVerifyBy" filterable clearable :disabled="verifyForm.disabled">
            <Option v-for="item in userList" :key="item.userId" :value="item.userId">{{item.userName}}</Option>
          </dyt-select> -->
          <dyt-select
            v-model="verifyForm.formValidate.requireVerifyBy"
            :option="userList"
            :replaceKey="{value: 'userId', label: 'userName'}"
            :top-item="erpUserId"
            :sort-key="`requireVerifyBy-${erpUserId}`"
          />
        </FormItem>
        <div class="mb10" style="font-size:16px;" v-else>{{verifyForm.content}}</div>
        <FormItem label="备注:" prop="remark">
          <Input v-model="verifyForm.formValidate.remark" type="textarea" :rows="6" placeholder=" 请输入"></Input>
        </FormItem>
        <FormItem label="给供应商意见:" prop="supplierRemark" v-if="verifyForm.advinceForSupply&&(productData.productSource===1)">
          <Input v-model="verifyForm.formValidate.supplierRemark" type="textarea" :rows="6" placeholder="请输入"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" :loading="verifyForm.loading" @click="handleVerify()">确定</Button>
        <Button @click="verifyForm.dialogVisible=false">取消</Button>
      </div>
    </Modal>

    <!-- 转交 -->
    <Modal v-model="transferForm.dialogVisible" width="600" title="转交" :mask-closable="false" :closable="false">
      <Form ref="transferForm" class="form-min-height" :model="transferForm.formValidate" :rules="transferForm.ruleValidate" :label-width="100">
        <FormItem label="指派人员:" prop="requireVerifyBy">
          <!-- <dyt-select v-model="transferForm.formValidate.requireVerifyBy" filterable clearable>
            <Option v-for="item in userList" :key="item.userId" :value="item.userId">{{item.userName}}</Option>
          </dyt-select> -->
          <dyt-select
            v-model="transferForm.formValidate.requireVerifyBy"
            :option="userList"
            :replaceKey="{value: 'userId', label: 'userName'}"
            :top-item="erpUserId"
            :sort-key="`requireVerifyBy-${erpUserId}`"
          />
        </FormItem>
        <FormItem label="备注:">
          <Input v-model="transferForm.formValidate.remark" type="textarea" :rows="6" placeholder="请输入"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" :loading="transferForm.loading" @click="handleTransfer()">确定</Button>
        <Button @click="transferForm.dialogVisible = false">取消</Button>
      </div>
    </Modal>

    <!-- 作废 -->
    <Modal v-model="voidForm.dialogVisible" width="500" title="作废" :mask-closable="false" :closable="false">
      <Form ref="voidForm" :model="voidForm.formValidate" :rules="voidForm.ruleValidate" :label-width="90">
        <FormItem label="作废原因:" prop="giveUpRemark">
          <dyt-select v-model="voidForm.formValidate.giveUpRemark" filterable clearable>
            <Option v-for="item in voidReasonlist" :key="item.value" :value="item.value">{{item.label}}</Option>
          </dyt-select>
        </FormItem>
        <FormItem label="作废说明:">
          <Input v-model="voidForm.formValidate.remark" type="textarea" :rows="6" placeholder="请输入"></Input>
        </FormItem>
        <FormItem label="给供应商意见:" prop="supplierRemark" v-if="productData.status>1 && (productData.productSource===1)">
          <Input v-model="voidForm.formValidate.supplierRemark" type="textarea" :rows="6" placeholder="请输入"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" :loading="voidForm.loading" @click="handleVoid()">确定</Button>
        <Button @click="voidForm.dialogVisible = false">取消</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
// 审核类型:0-提交审核 1-驳回提交人 2-驳回图片编辑 3-驳回文本编辑 4-审核通过 5-通过无需审样核价 6-图片审核通过 7-文本审核通过 8-转交 9-作废 10-同步上架
import api from '@/api/api.js';
import CommonMixin from "@/components/mixin/commonMixin";
export default {
  name: "assignUser",
  mixins: [CommonMixin],
  data () {
    return {
      nextForm: {
        dialogVisible: false,
        formValidate: {
          requireVerifyBy: '',
          supplierRemark: '',
          remark:''
        },
        ruleValidate: {
          requireVerifyBy: [
            { required: true, validator: this.validateVerifyBy, vKey: 'nextForm.formValidate', msg: '请选择指派人员', trigger: 'change' }
          ]
        },
        loading: false,
        title: '',//标题
        content: '', // 自定义显示文本内容
        type: '', //1 保存;2 提款审核
        advinceForSupply: false,//给供应商意见
        remarkShow:false,//备注
        status: '',//审核状态
        productId: '', //这里多传一个productId 是因为新建新品返回新品id且立马提交审核时用的
        disabled: false,//禁用状态
      },
      //文本和图片审核
      picAndText: {
        dialogVisible: false,
        formValidate: {
          //图片用之前的
          requireVerifyBy: '',
          supplierRemark: '',
          textRequireVerifyBy:'',
          remark:"",
          remarkShow:false
        },
        ruleValidate: {
          // requireVerifyBy: [
          //   { required: true, message: '请选择指派人员', trigger: 'change' }
          // ],
          requireVerifyBy:[
            { required: true, validator: this.validateVerifyBy, vKey: 'picAndText.formValidate', msg: '请选择指派人员', trigger: 'change' }
          ],
          textRequireVerifyBy:[
            { required: true, validator: this.validateVerifyBy, vKey: 'picAndText.formValidate', msg: '请选择指派人员', trigger: 'change' }
          ]
        },
        loading: false,
        title: '',//标题
        content: '', // 自定义显示文本内容
        type: '', //1 保存;2 提款审核
        advinceForSupply: false,//给供应商意见
        status: '',//审核状态
        productId: '', //这里多传一个productId 是因为新建新品返回新品id且立马提交审核时用的
        disabled: false,//禁用状态
      },
      rejectForm: {
        dialogVisible: false,
        formValidate: {
          remark: ''
        },
        ruleValidate: {
          remark: [
            { required: true, message: '备注必填', trigger: 'blur' }
          ]
        },
        loading: false,
        status: null
      },
      verifyForm: {
        dialogVisible: false,
        formValidate: {
          remark: '',
          supplierRemark: '',
          requireVerifyBy: ''
        },
        ruleValidate: {
          requireVerifyBy: [
            { required: true, validator: this.validateVerifyBy, vKey: 'verifyForm.formValidate', msg: '请指派侵权审核', trigger: 'blur' }
          ],
          remark: [
            { required: false, message: '备注必填', trigger: 'blur' }
          ],
          supplierRemark: [
            { required: false, message: '给供应商意见必填', trigger: 'blur' }
          ]
        },
        loading: false,
        title: '',
        content: '',
        showNextContent: false,
        createdBy: '',
        nextLabel: '',
        nextContent: '',
        assignMan: false,//是否指派人员
        advinceForSupply: false,//给供应商意见
        labelAssign: '',//表单label
        productSource: '',//用来判断是否推款给供应商意见
        status: '',//审核状态
        disabled: false,//禁用状态
      },
      transferForm: {
        dialogVisible: false,
        formValidate: {
          remark: '',
          requireVerifyBy: ''
        },
        ruleValidate: {
          requireVerifyBy: [
            { required: true, validator: this.validateVerifyBy, vKey: 'transferForm.formValidate', msg: '请选择指派人员', trigger: 'change' }
          ],
          remark: [
            { required: true, message: '备注必填', trigger: 'blur' }
          ]
        },
        loading: false,
        status: '',
      },
      voidForm: {
        dialogVisible: false,
        formValidate: {
          remark: '',
          giveUpRemark: '',
          supplierRemark: '',
        },
        ruleValidate: {
          giveUpRemark: [
            { required: true, message: '作废原因必填', trigger: 'blur' }
          ]
        },
        loading: false,
        advinceForSupply: false,
      },
      userList: [],
      voidReasonlist: [
        { label: '审款不通过', value: '审款不通过' },
        { label: '审款核价不通过', value: '审款核价不通过' },
      ],
      productId: '',
      approverSettings: {},
      process: ''
    };
  },
  props: {
    submitBefore: {
      type: Function,
      default: (callBack) => {
        callBack(true)
      }
    },
    productData: {
      type: Object,
      default () {
        return {};
      }
    },
    productSource: {
      type: Number,
      default: null
    },
    dialogObj: {
      type: Object,
      default () {
        return {};
      }
    },
  },
  watch: {
    productSource: {
      immediate: true,
      deep: true,
      handler (val) {
        if ([0, 1].includes(val)) {
          this.process = 1;
        }
        if ([2, 3, 4].includes(val)) {
          this.process = 0;
        }
      }
    },
    // productData: {
    //   immediate: true,
    //   deep: true,
    //   handler (val) {
    //     console.log(val, "productData")
    //   }
    // },
  },
  computed: {
    securityUser() {
      const authUserInfo = this.$store.getters["authUserInfo"];
      if (this.$common.isEmpty(authUserInfo)) return {};
      return authUserInfo.securityUser || {};
    },
    erpUserId () {
      return this.securityUser.erpUserId || '';
    }
  },
  methods: {
    // 打开指派弹框
    nextDialogOpen (temp) {
      this.$nextTick(() => {
        if(temp.isModelVisiable){
          this.picAndText.dialogVisible = true;
          Object.keys(temp).forEach(k => {
            k in this.picAndText ? this.picAndText[k] = temp[k] : '';
          })
          this.getuserList();
          this.clearForm('picAndText');

          this.getVerifyMansetting().then(() => {
            this.defaultVerifySet('picAndText', temp.status);
            return
          })
          return
        }
        this.nextForm.dialogVisible = true;
        Object.keys(temp).forEach(k => {
        k in this.nextForm ? this.nextForm[k] = temp[k] : '';
        })
        this.getuserList();
        this.clearForm('nextForm');

        this.getVerifyMansetting().then(() => {
          this.defaultVerifySet('nextForm', temp.status);
        })
      })
    },
    
    // 指派人员
    handleNext () {
      this.$refs['nextForm'].validate((valid) => {
        if (valid) {
          let temp = this.nextForm.formValidate;
          temp.productId = this.nextForm.productId || this.productData.productId;
          temp.type = this.nextForm.status;
          if (!this.nextForm.advinceForSupply) delete temp.supplierRemark;
          // console.log(temp);
          // return;
          this.nextForm.loading = true;
          this.$axios
            .post(api.productVerify, temp)
            .then(({ code }) => {
              if (code === 0) {
                this.$Message.success('操作成功~');
                this.nextForm.dialogVisible = false;
                this.$emit('closeDialog');
              }
            })
            .finally(() => {
              this.nextForm.loading = false;
            });
        }
      });
    },
    //指派文本和图片审核人
    handleNext1 () {
      this.$refs['picAndText'].validate((valid) => {
        if (valid) {
          let temp = this.picAndText.formValidate;
          temp.productId = this.picAndText.productId || this.productData.productId;
          temp.type = 19;
          if (!this.picAndText.advinceForSupply) delete temp.supplierRemark;
          // console.log(temp);
          // return;
          this.picAndText.loading = true;
          this.$axios
            .post(api.productVerify, temp)
            .then(({ code }) => {
              if (code === 0) {
                this.$Message.success('操作成功~');
                this.picAndText.dialogVisible = false;
                this.$emit('closeDialog');
              }
            })
            .finally(() => {
              this.picAndText.loading = false;
            });
        }
      });
    },
    // 打开驳回弹框
    rejectDialogOpen (status) {
      this.rejectForm.dialogVisible = true;
      this.rejectForm.status = status;
      this.clearForm('rejectForm');
    },
    // 驳回提交人
    handleReject () {
      this.$refs['rejectForm'].validate((valid) => {
        if (valid) {
          let temp = this.rejectForm.formValidate;
          temp.productId = this.productData.productId;
          temp.type = this.rejectForm.status || 1;//驳回
          // console.log(temp)
          // return;
          this.rejectForm.loading = true;
          this.$axios
            .post(api.productVerify, temp)
            .then(({ code }) => {
              if (code === 0) {
                this.$Message.success('操作成功~');
                this.rejectForm.dialogVisible = false;
                this.$emit('closeDialog');
              }
            })
            .finally(() => {
              this.rejectForm.loading = false;
            });

        }
      });
    },
    // 打开意见弹框
    verifyDialogOpen (temp) {
      this.$nextTick(() => {
        this.verifyForm.dialogVisible = true;
        Object.keys(temp).forEach(k => {
          k in this.verifyForm ? this.verifyForm[k] = temp[k] : '';
        });
        if (temp.assignMan) {
          this.getuserList();
        }
        this.clearForm('verifyForm');
        if(temp.productType == 0 || temp.productType == 1) this.verifyForm.formValidate.productType = temp.productType;
        this.getVerifyMansetting().then(() => {
          this.defaultVerifySet('verifyForm');
          if (!this.$common.isEmpty(this.verifyForm) && !this.$common.isEmpty(this.verifyForm.createdBy)) {
            this.verifyForm.formValidate.requireVerifyBy = this.verifyForm.createdBy;
          }
        })
      })
    },
    // 提交审样核价意见
    handleVerify () {
      this.$refs['verifyForm'].validate((valid) => {
        if (valid) {
          let temp = this.verifyForm.formValidate;
          temp.productId = this.productData.productId;
          temp.type = this.verifyForm.status;// 审核通过
          if (!this.verifyForm.assignMan) {
            delete temp.requireVerifyBy;
          }
          // console.log(temp)
          // return;
          this.verifyForm.loading = true;
          this.$axios
            .post(api.productVerify, temp)
            .then(({ code }) => {
              if (code === 0) {
                this.$Message.success('操作成功~');
                this.verifyForm.dialogVisible = false;
                this.$emit('closeDialog');
              }
            })
            .finally(() => {
              this.verifyForm.loading = false;
            });
        }
      });
    },
    // 打开转交人弹框
    transferDialogOpen (status) {
      this.transferForm.dialogVisible = true;
      this.transferForm.status = status;
      this.getuserList();
      this.clearForm('transferForm');
    },
    // 提交转让数据
    handleTransfer () {
      const hand = {
        saveInfo: () => {
          this.submitBefore((res) => {
            if (res) {
              hand.nextTransfer();
            } else {
              this.$Modal.confirm({
                render: (h) => {
                  return h('div', '信息保存不成功，是否继续转交');
                },
                onOk: () => {
                  hand.nextTransfer();
                },
                onCancel: () => { }
              })
            }
          })
        },
        // 转交操作
        nextTransfer: () => {
          let temp = this.transferForm.formValidate;
          temp.productId = this.productData.productId;
          temp.type = this.transferForm.status || 8; //转交
          if(this.dialogObj.btnoperat == "verifyPic") temp.type = 20;
          if(this.dialogObj.btnoperat == "verifyData") temp.type = 21
          this.transferForm.loading = true;
          this.$axios.post(api.productVerify, temp).then(({ code }) => {
            if (code === 0) {
              this.$Message.success('操作成功~');
              this.transferForm.dialogVisible = false;
              this.$emit('closeDialog');
            }
          }).finally(() => {
            this.transferForm.loading = false;
          })
        }
      };
      this.$refs['transferForm'].validate((valid) => {
        if (valid) {
          hand.saveInfo();
        }
      })
    },
    // 打开作废弹框
    voidDialogOpen () {
      this.voidForm.dialogVisible = true;
      this.clearForm('voidForm');
    },
    // 提交作废数据
    handleVoid () {
      this.$refs['voidForm'].validate((valid) => {
        if (valid) {
          let temp = this.voidForm.formValidate;
          temp.productId = this.productData.productId;
          temp.type = 9; //作废
          // console.log(temp)
          // return;
          this.voidForm.loading = true;
          this.$axios
            .post(api.productVerify, temp)
            .then(({ code }) => {
              if (code === 0) {
                this.$Message.success('操作成功~');
                this.voidForm.dialogVisible = false;
                this.$emit('closeDialog');
              }
            })
            .finally(() => {
              this.voidForm.loading = false;
            });
        }
      });
    },
    // 获取创建人列表
    getuserList () {
      return this.$axios
        .get(api.userList, { params: { module: "pds" } })
        .then((res) => {
          if (res.code === 0) {
            let a = Object.values(res.datas)
            this.userList = a
          }
        })
    },
    // 关闭指派人员弹框
    closeNextForm () {
      this.nextForm.dialogVisible = false;
      if (this.nextForm.type === 1) {
        this.$emit('closeDialog');
      }
    },
    // 表单清空
    clearForm (type) {
      Object.keys(this[type].formValidate).forEach(k => {
        this[type].formValidate[k] = '';
      });
    },
    // 获取审核人员配置（1-指定审款操作人 2-指定侵权审核操作人 3-指定审核商品资料操作人 4-指定审样核价操作人 5-指定完善图片操作人 6-指定完善文本操作人）flowtype
    getVerifyMansetting () {
      this.$Spin.show();
      return this.$axios
        .get(api.queryProductDefaulReviewer)
        .then((res) => {
          if (res.code !== 0) return;
          let obj = {};
          let list = res.datas || [];
          list.forEach(k => {
            if (!obj[k.process]) {
              obj[k.process] = [];
            }
            obj[k.process].push(k);
          })
          this.approverSettings = this.$common.copy(obj);
        }).finally(() => {
          this.$Spin.hide();
        });
    },
    getObjVal (obj, key) {
      if (this.$common.isEmpty(key) || !this.$common.isJson(obj)) return obj;
      if (key.includes('.')) {
        const beforKey = key.substring(0, key.indexOf('.'));
        const afterKey = key.substring(key.indexOf('.') + 1, key.length);
        if (this.$common.isEmpty(afterKey)) {
          return obj[key];
        }
        if (this.$common.isEmpty(beforKey)) {
          return this.getObjVal(obj['.'], afterKey);
        }
        return this.getObjVal(obj[beforKey], afterKey);
      }
      return obj[key];
    },
    // 指派人验证
    validateVerifyBy (rule, value, callback) {
      this.$nextTick(() => {
        let validVal = value;
        if (this.$common.isEmpty(validVal) && !this.$common.isEmpty(rule.vKey)) {
          validVal = this.getObjVal(this, `${rule.vKey}.${rule.field}`);
        }
        if (this.$common.isEmpty(validVal)) return callback(rule.msg || '必填项不能为!');
        callback();
      })
    },
    // 默认审核人员反显(formType:表单名称)
    defaultVerifySet (formType, assignStatus) {
      // console.log(assignStatus)
      let obj = this[formType];
      if (Object.prototype.toString.call(obj) !== '[object Object]') return;
      let status = null;
      // console.log(this.productData.status,'this.productData.status');
      if (JSON.stringify(this.productData) === '{}') {
        status = 0;//备货新增提交审核
      } else {
        status = this.productData.status;
      }
      let list = this.approverSettings[this.process] || [];
      let statusObj = {
        0: {
          2: { status: 5 },
          5: { status: 2, assignStatus: 11 },
          6: { status: 2, assignStatus: 12 }
        },//云仓 前面的数字是flowtype
        1: {
          1: { status: 0 },
          2: { status: 5 },
          3: { status: 2 },
          4: { status: 3 },
          5: { status: 5, assignStatus: 11 },
          6: { status: 5, assignStatus: 12 }
        },//备货
      }
      let statusList = statusObj[this.process] || {};
      this[formType].disabled = false;
      list.forEach(k => {
        if (!this.$common.isEmpty(statusList[k.flowType]) && status === statusList[k.flowType].status) {
          // console.log(k, "k")
          //非图片文本审核
          if (!statusList[k.flowType].assignStatus) {
            this[formType].formValidate.requireVerifyBy = k.requireVerifyBy;
            this[formType].disabled = k.requireVerifyBy ? true : false;
            
          }
          //备货图片文本审核
          if (statusList[k.flowType].assignStatus && statusList[k.flowType].assignStatus === assignStatus) {
            this[formType].formValidate.requireVerifyBy = k.requireVerifyBy;
            this[formType].disabled = k.requireVerifyBy ? true : false;
          
          }
          if( statusList[k.flowType].assignStatus == 11 && assignStatus == 23){
            this[formType].formValidate.requireVerifyBy = k.requireVerifyBy;
            this[formType].disabled = k.requireVerifyBy ? true : false;
          }
          if( statusList[k.flowType].assignStatus == 12 && assignStatus == 23){
            this[formType].formValidate.textRequireVerifyBy = k.requireVerifyBy;
            this[formType].disabled = k.requireVerifyBy ? true : false;
          }
        }
      })
    },
  }
};
</script>
<style>
.labelposiTop .ivu-form-item-label {
  width: auto;
}
.form-min-height {
  min-height: 300px;
}
</style>