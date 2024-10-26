<template>
  <Modal
    class="amazonMdl"
    v-model="$store.state.addAmazonAccount"
    :title="
      workType === 'add'
        ? '添加amazon账户'
        : workType === 'edit'
        ? '编辑amazon账户'
        : '查看amazon账户'
    "
  >
    <Form
      ref="formValidate"
      :model="formValidate"
      :rules="ruleValidate"
      :label-width="100"
    >
      <FormItem label="帐号名称：" prop="storeName">
        <Input
          v-model="formValidate.storeName"
          placeholder=""
          :disabled="disabled"
        ></Input>
      </FormItem>
      <FormItem label="账号：" prop="account">
        <Input
          v-model="formValidate.account"
          placeholder=""
          :disabled="disabled"
        ></Input>
      </FormItem>
      <FormItem label="市场：" prop="mark">
        <dyt-select v-model="formValidate.mark" :disabled="disabled">
          <template v-for="(v, i) in siteArr">
            <OptionGroup
              :key="i"
              :label="v.siteCountry"
              v-if="Chinese"
            >
              <Option
                v-for="item in v.childSite"
                :value="item.amazonSiteBaseDataId"
                :key="item.amazonSiteBaseDataId"
                >{{ item.siteCountry }}</Option
              >
            </OptionGroup>
          </template>
          <template v-for="(v, i) in siteArr">
            <OptionGroup
              :key="i"
              :label="v.siteArea"
              v-if="English"
            >
              <Option
                v-for="item in v.childSite"
                :value="item.amazonSiteBaseDataId"
                :key="item.amazonSiteBaseDataId"
                >{{ item.siteArea }}</Option
              >
            </OptionGroup>
          </template>
        </dyt-select>
      </FormItem>
      <!--<FormItem label="">-->
      <!--<RadioGroup v-model="formValidate.country">-->
      <!--<Radio label="1"><span>美国</span></Radio>-->
      <!--<Radio label="2"><span>加拿大</span></Radio>-->
      <!--<Radio label="3"><span>墨西哥</span></Radio>-->
      <!--</RadioGroup>-->
      <!--</FormItem>-->

      <FormItem label="Seller ID：" prop="sellerId">
        <Input
          v-model="formValidate.sellerId"
          placeholder=""
          :disabled="disabled"
        ></Input>
      </FormItem>
      <FormItem label="AWS  Access Key ID：" prop="accessKeyId">
        <Input
          v-model="formValidate.accessKeyId"
          placeholder=""
          :disabled="disabled"
        ></Input>
      </FormItem>
      <FormItem label="Secret Key：" prop="secretKey">
        <Input
          v-model="formValidate.secretKey"
          placeholder=""
          :disabled="disabled"
        ></Input>
      </FormItem>

      <FormItem label="绑定邮箱">
        <span>注意：</span
        ><span
          >为保证买家能正常收到邮件，请绑定amazon后台配置中的“客服邮箱”</span
        >
      </FormItem>

      <!--<FormItem>-->
      <!--<RadioGroup v-model="formValidate.emailType" prop="emailType">-->
      <!--<Radio label="1"><span>系统内置</span></Radio>-->
      <!--<Radio label="2"><span>其他邮箱</span></Radio>-->
      <!--</RadioGroup>-->
      <!--</FormItem>-->

      <FormItem label="邮箱地址：">
        <Row>
          <Col span="10">
            <FormItem prop="addressEmail">
              <Input
                v-model="formValidate.addressEmail"
                placeholder=""
                :disabled="disabled"
              ></Input>
            </FormItem>
          </Col>
          <Col span="1">
            <span style="display: block; padding-left: 5px">@</span>
          </Col>
          <Col span="8">
            <FormItem prop="emailPlatType">
              <dyt-select v-model="formValidate.emailPlatType" :disabled="disabled">
                <Option
                  :value="v.code"
                  v-for="v in emailTypeList"
                  :key="v.code"
                  >{{ v.label }}</Option
                >
              </dyt-select>
            </FormItem>
          </Col>
        </Row>
      </FormItem>

      <Row>
        <Col span="19">
          <FormItem
            :label="
              this.formValidate.emailPlatType === 'qq.com' ||
              this.formValidate.emailPlatType === '163.com'
                ? '邮箱授权码' + '：'
                : '邮箱密码' + '：'
            "
            prop="emailPwd"
          >
            <Row>
              <Col span="2">
                <span @click="goToAuthCodeUrl"
                  ><Icon
                    type="help-circled"
                    v-if="
                      this.formValidate.emailPlatType === 'qq.com' ||
                      this.formValidate.emailPlatType === '163.com'
                    "
                    style="font-size: 16px; cursor: pointer"
                  ></Icon
                ></span>
              </Col>
              <Col span="22">
                <Input
                  v-model="formValidate.emailPwd"
                  placeholder=""
                  type="password"
                  :disabled="disabled"
                ></Input>
              </Col>
            </Row>
          </FormItem>
        </Col>
        <Col span="3">
          <a
            href="javascripr:;"
            style="display: inline-block; padding-top: 8px; padding-left: 10px"
            @click="validateEmail"
            v-if="!(editAuth === '1' || editAuth === '4')"
            >验证邮箱</a
          >
          <!--<a href="javascripr:;" style='display: inline-block;padding-top: 8px;padding-left: 14px' >邮箱授权码?</a>-->
        </Col>
      </Row>
    </Form>
    <div style="padding-left: 30px">
      <Button
        type="primary"
        @click="handleSubmit('formValidate')"
        v-if="!(editAuth === '1' || editAuth === '4')"
        :disabled="editAuth === '1' || editAuth === '4' ? true : false"
        >确定</Button
      >
      <Button type="ghost" @click="cancel">取消</Button>
    </div>
  </Modal>
</template>

<script>
import api from "@/api/api";
import Mixin from "@/components/mixin/commonMixin";

export default {
  props: ["curobj", "workType", "siteDataList", "editAuth"],
  mixins: [Mixin],
  data () {
    // 验证@符号
    var ctxValidate = function (rule, value, callback) {
      if (!this.formValidate.addressEmail.trim()) {
        callback(new Error("cannot be empty"));
      } else if (/[@]/.test(this.formValidate.addressEmail)) {
        callback(new Error("不能包含@"));
      } else {
        callback();
      }
    }.bind(this);
    return {
      formValidate: {
        storeName: "",
        account: "",
        mark: "", //                country:'1',
        sellerId: "",
        accessKeyId: "",
        secretKey: "",
        addressEmail: "",
        emailPlatType: "",
        emailPwd: ""
      },
      ruleValidate: {
        storeName: [
          {
            required: true,
            message: "cannot be empty",
            trigger: "blur"
          }
        ],
        account: [
          {
            required: true,
            message: "cannot be empty",
            trigger: "blur"
          }
        ],
        mark: [
          {
            required: true,
            message: "cannot be empty",
            trigger: "change"
          }
        ], //                country:[{ required: true, message: 'cannot be empty', trigger: 'change' }],
        sellerId: [
          {
            required: true,
            message: "cannot be empty",
            trigger: "blur"
          }
        ],
        accessKeyId: [
          {
            required: true,
            message: "cannot be empty",
            trigger: "blur"
          }
        ],
        secretKey: [
          {
            required: true,
            message: "cannot be empty",
            trigger: "blur"
          }
        ],
        addressEmail: [
          {
            required: true,
            validator: ctxValidate,
            trigger: "blur"
          }
        ],
        emailPlatType: [
          {
            required: true,
            message: "cannot be empty",
            trigger: "change"
          }
        ],
        emailPwd: [
          {
            required: true,
            message: "cannot be empty",
            trigger: "blur"
          }
        ]
      },
      emailTypeList: [
        {
          label: "qq.com",
          code: "qq.com"
        },
        {
          label: "hotmail.com",
          code: "hotmail.com"
        },
        {
          label: "gmail.com",
          code: "gmail.com"
        },
        {
          label: "sina.com",
          code: "sina.com"
        },
        {
          label: "163.com",
          code: "163.com"
        },
        {
          label: "126.com",
          code: "126.com"
        },
        {
          label: "outlook.com",
          code: "outlook.com"
        },
        {
          label: "tom.com",
          code: "tom.com"
        }
      ]
    };
  },
  computed: {
    siteArr () {
      if (this.siteDataList) {
        return this.siteDataList.filter((val) => {
          return !val.parentId;
        })
      }
      return [];
    },
    English () {
      return localStorage.getItem("lang") === "en-US";
    },
    Chinese () {
      return localStorage.getItem("lang") === "zh-CN";
    },
    disabled () {
      return this.editAuth === "1" || this.editAuth === "4";
    }
  },
  methods: {
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          var obj = {
            emailAddress:
              this.formValidate.addressEmail +
              "@" +
              this.formValidate.emailPlatType,
            emailPassword: this.formValidate.emailPwd,
            pageNum: 1,
            pageSize: 10,
            shopName: this.formValidate.storeName,
            shopAccount: this.formValidate.account,
            amazonSiteBaseDataId: this.formValidate.mark,
            sellerId: this.formValidate.sellerId,
            accessKeyId: this.formValidate.accessKeyId,
            secretKey: this.formValidate.secretKey,
            amazonAccountId:
              this.workType === "add" ? "" : this.curobj.amazonAccountId,
            merchantId: this.workType === "add" ? "" : this.curobj.merchantId
          };
          if (this.workType === "add") {
            // 新增
            this.axios.post(api.addShopAccount, obj).then((res) => {
              if (res.data.code === 0) {
                this.$msg.success("新增成功");
                this.$store.commit("addAmazonAccount", false);
                this.$emit("addsucc");
              } else {
                this.$msg.warning("新增失败");
              }
            });
          } else {
            // 编辑
            this.axios.post(api.editShopAccount, obj).then((res) => {
              if (res.data.code === 0) {
                this.$msg.success("修改成功");
                this.$emit("addsucc");
                this.$store.commit("addAmazonAccount", false);
              } else {
                this.$msg.warning("修改失败");
              }
            });
          }
        } else {
          this.$msg.error("Fail!");
        }
      });
    },
    cancel () {
      this.$store.commit("addAmazonAccount", false);
    },
    goToAuthCodeUrl () {
      if (this.formValidate.emailPlatType === "qq.com") {
        window.open(
          "http://service.mail.qq.com/cgi-bin/help?subtype=1&&no=1001256&&id=28"
        );
      } else if (this.formValidate.emailPlatType === "163.com") {
        window.open("http://help.mail.163.com/faq.do?m=list&categoryID=197");
      }
    },
    validateEmail () {
      if (this.formValidate.addressEmail === "") {
        this.$msg.warning("请填写邮件地址");
        return;
      } else if (this.formValidate.emailPlatType === "") {
        this.$msg.warning("请填写邮箱类型");
        return;
      } else if (this.formValidate.emailPwd === "") {
        this.$msg.warning("请填写邮箱密码");
        return;
      }
      let obj = {
        emailAddress:
          this.formValidate.addressEmail +
          "@" +
          this.formValidate.emailPlatType,
        emailPassword: this.formValidate.emailPwd
        //                sendPort:this.curobj.sendPort,
        //                sendProtocol:this.curobj.sendProtocol,
        //                sendSmtpAddress:this.curobj.sendSmtpAddress,
        //                securityProtocol:this.curobj.securityProtocol
      };
      this.axios.post(api.validateEm, obj).then((res) => {
        if (res.data.code === 0) {
          this.$msg.success("验证邮箱成功");
        } else if (res.data.code === 9999) {
          this.$msg.warning("验证邮箱失败");
        }
      });
    }
  },
  watch: {
    "$store.state.addAmazonAccount": function (val) {
      if (val) {
        if (this.workType === "edit" || this.workType === "watch") {
          (this.formValidate.storeName = this.curobj.shopName),
          (this.formValidate.account = this.curobj.shopAccount),
          (this.formValidate.mark = this.curobj.amazonSiteBaseDataId),
          (this.formValidate.sellerId = this.curobj.sellerId),
          (this.formValidate.accessKeyId = this.curobj.accessKeyId),
          (this.formValidate.secretKey = this.curobj.secretKey),
          (this.formValidate.emailPlatType = this.curobj.emailSuffix
            ? this.deepCopy(this.curobj.emailSuffix).split("@")[0]
            : ""), // 邮箱后缀
          (this.formValidate.addressEmail = this.curobj.emailAccount),
          (this.formValidate.emailPwd = this.curobj.emailPassword);
        } else {
          this.$refs["formValidate"].resetFields();
        }
      }
    }
  }
};
</script>

<style>
.amazonMdl .ivu-modal-footer {
  display: none;
}
</style>
