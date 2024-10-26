<template>
  <div class="mainBox managePage">
    <div class="rowBox">
      <ButtonGroup>
        <Button v-for="(item, index) in sortChoseDate" :key="item.id" :class="item.selected ? 'ivu-btn-primary' : ''" @click="sortChose(item, index, sortChoseDate)" @click.b="sortChoseB(item, index)">{{ item.tit }}</Button>
      </ButtonGroup>
    </div>
    <Card v-if="isBtnChecked">
      <div class="p15">
        <label>是否同步至listing：</label>
        <RadioGroup v-model="pushNode" @on-change="setMerchantDataSetting">
          <Radio label="0">
            <span>不同步</span>
          </Radio>
          <Radio label="1">
            <span>同步</span>
          </Radio>
        </RadioGroup>
      </div>
      <div class="p15">
        <label>图片是否同步至erp：</label>
        <RadioGroup v-model="pushErp" @on-change="setMerchantDataSetting">
          <Radio label="0">
            <span>不同步</span>
          </Radio>
          <Radio label="1">
            <span>同步</span>
          </Radio>
        </RadioGroup>
        <!--<i-switch v-model="pushErp"  @on-change="setMerchantDataSetting"></i-switch>-->
      </div>
    </Card>
    <div v-else>
      <Row class="cardBox">
        <Col span="5" style="min-width: 240px; margin-bottom: 50px" v-for="(item, index) in manageDate" :key="item.uuid" ref="manage" :class="{ mlv50: isSortChoseDate == 'LC0001' && index == 4 }">
        <Row style="position: relative">
          <Col span="20">
          <Card :bordered="false" :class="{
                  isEnabled: item.enableFlag === 0,
                  isRed:
                    (item.executor === '' || item.executor === null) &&
                    (item.executorRole === '' || item.executorRole === null),
                }">
            <p slot="title">{{ item.nodeName }}</p>
            <ButtonGroup>
              <Button @click="lookMethod(item)">查看</Button>
              <Button @click="editMethod(item)">编辑</Button>
              <Button v-show="item.neccessaryFlag == 0" @click="isEnble(item)">{{ isStart(item.enableFlag) }}</Button>
            </ButtonGroup>
            <div v-show="(index + 1) % 4 == 0 && index !== 11" class="cardArr1">
              <Icon type="md-arrow-down" style="font-size: 30px; color: #999"></Icon>
            </div>
          </Card>
          </Col>
          <Col span="4" style="position: relative" v-show="
                (index + 1) % 4 != 0 &&
                index < 3 &&
                index != manageDate.length - 1
              ">
          <div class="cardArr">
            <Icon type="md-arrow-forward" style="font-size: 30px; color: #999" />
          </div>
          </Col>
          <Col span="4" style="position: relative" v-show="
                (index + 1) % 4 != 0 && index > 3 && index != 6 && index != 14
              ">
          <div class="cardArr" v-show="index == 10 || index == 9 || index == 8">
            <Icon type="md-arrow-back" :class="{ color1: isSortChoseDate == 'QB' }" style="font-size: 30px; color: #999" />
          </div>
          <div class="cardArr" v-show="index == 5 || index == 4">
            <Icon type="md-arrow-back" v-show="index == 4 || isSortChoseDate != 'LC0001'" :class="{ color2: isSortChoseDate == 'QB' }" style="font-size: 30px; color: #999"></Icon>
          </div>
          <div class="cardArr" v-show="index == 12 || index == 13">
            <Icon type="md-arrow-back" :class="{ color3: isSortChoseDate == 'QB' }" style="font-size: 30px; color: #999"></Icon>
          </div>
          <div class="cardArr cardArrTopLeft" v-show="index == 10">
            <Icon type="md-arrow-back" style="font-size: 30px; color: #19be6b !important"></Icon>
          </div>
          <div class="cardArr cardArrTopRight" v-show="index == 10">
            <Icon type="md-arrow-back" style="font-size: 30px; color: #fb5757 !important"></Icon>
          </div>
          </Col>
        </Row>
        </Col>
      </Row>
      <nodata :listDate="manageDate"></nodata>
      <!-- <Row class="cardBox">
           <Col span="5"
                style="min-width: 240px;margin-bottom: 50px;"
                v-for="(item,index) in manageDate"
                :key="item.uuid"
                ref="manage"
                :class="{mlv50:isSortChoseDate=='LC0001'&&index==4}">
             <Row style="position: relative" >
               <Col span="20">
                 <Card :bordered="false" :class="{isEnabled:item.enableFlag === 0}">
                   <p slot="title">{{item.nodeName}}</p>
                   <ButtonGroup>
                     <Button @click="lookMethod(item)">查看</Button>
                     <Button @click="editMethod(item)">编辑</Button>
                     <Button v-show="item.neccessaryFlag == 0" @click="isEnble(item)">{{isStart(item.enableFlag)}}</Button>
                   </ButtonGroup>
                   <div v-show="(index+1) % 4 ==0 && index !==11" class="cardArr1"><Icon type="arrow-down-c" style="font-size: 30px;color: #999"></Icon></div>
                 </Card>
               </Col>
               <Col span="4" style="position: relative" v-show="(index+1) % 4 !=0 && index<3 &&index !=manageDate.length-1">
                 <div class="cardArr"><Icon type="arrow-right-c" style="font-size: 30px;color: #999"></Icon></div>
               </Col>
               <Col span="4" style="position: relative" v-show="(index+1) % 4 !=0 && index>3 && index!=6 && index !=14">
                 <div class="cardArr"
                      v-show="index==10||index==9||index==8">
                   <Icon type="arrow-left-c" :class="{color1:isSortChoseDate == 'QB'}"  style="font-size: 30px;color: #999"></Icon>
                 </div>
                 <div class="cardArr"
                      v-show=" index==5 || index==4 ">
                   <Icon type="arrow-left-c" v-show="index ==4 || isSortChoseDate!='LC0001'"  :class="{color2:isSortChoseDate == 'QB'}" style="font-size: 30px;color: #999"></Icon>
                 </div>
                 <div class="cardArr" v-show=" index==12 || index==13 ">
                   <Icon type="arrow-left-c" :class="{color3:isSortChoseDate == 'QB'}" style="font-size: 30px;color: #999"></Icon>
                 </div>
                 <div class="cardArr cardArrTopLeft" v-show="index==10 "><Icon type="arrow-left-c" style="font-size: 30px;color: #19be6b!important;"></Icon></div>
                 <div class="cardArr cardArrTopRight" v-show="index==10"><Icon type="arrow-left-c" style="font-size: 30px;color: #fb5757!important;"></Icon></div>
               </Col>
             </Row>
           </Col>
         </Row>
         <nodata :listDate="manageDate"></nodata>-->
    </div>

    <Modal v-model="editManageModel" class="clearMarginAuto" @on-visible-change="visibleManage">
      <p slot="header" @mousedown="moveMt" class="moveHead">
        <span>{{ manageTitle }}</span>
      </p>
      <Form ref="formValidate" :model="formValidate" :rules="formValidateRules" :label-width="110">
        <FormItem label="名称" style="margin-bottom: 10px">
          {{ formValidate.nodeName }}
        </FormItem>
        <FormItem label="执行人类型" prop="executorType">
          <dyt-select v-model="formValidate.executorType" style="width: 150px" @on-change="executorTypeChange" :disabled="!idEdit">
            <Option v-for="item in typeSelect" :value="item.value" :key="item.value" :label="item.label"></Option>
          </dyt-select>
        </FormItem>
        <FormItem label="执行人角色" prop="executorRole" v-show="formValidate.executorType == 0">
          <dyt-select filterable v-model="formValidate.executorRole" multiple style="width: 260px" ref="executorRoleRef" :disabled="!idEdit">
            <Option v-for="item in executorRoleList" :disabled="isMax" :value="item.roleId" :key="item.roleId" :label="item.roleName"></Option>
          </dyt-select>
          <span v-show="isMax" class="red">最多能选10个角色</span>
          <!-- <Input v-model="formValidate.executorRole" :maxlength="20"/>-->
        </FormItem>
        <FormItem label="执行人" prop="executor" v-show="formValidate.executorType == 1">
          <dyt-select filterable v-model="formValidate.executor" style="width: 260px" ref="executorRef" :disabled="!idEdit">
            <Option v-for="item in executorList" :value="item.userId" :key="item.userId">{{ item.userName }}</Option>
          </dyt-select>
        </FormItem>
        <FormItem label="是否启用" v-show="formValidate.neccessaryFlag == 0">
          <i-switch v-model="formValidate.enableFlag" :disabled="!idEdit"></i-switch>
        </FormItem>
        <FormItem v-if="nodeId === 5" label="跳第三方URL生成SKU" prop="thirdCreateSkuUrl">
          <i-switch v-model="formValidate.thirdCreateSkuCheck" :disabled="!idEdit" @on-change="changeSwitch"></i-switch>
          <Input v-if="formValidate.thirdCreateSkuCheck" style="width: 315px" v-model="formValidate.thirdCreateSkuUrl" :disabled="!idEdit" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="primary" size="large" long :loading="modal_loading" @click="save">{{ saveTit }}</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from "@/api/api";
import commonMixix from "../../../components/mixin/commonMixin";
import nodata from "../common/nodata";

export default {
  name: "ProcessManage", // 流程配置
  components: {
    nodata
  },
  mixins: [commonMixix],
  data () {
    let v = this;
    return {
      pushNode: "0",
      pushErp: "1",
      manageTitle: "查看流程",
      executorRoleList: [],
      executorList: [],
      idEdit: false,
      executorRole: [],
      executor: "",
      executorType: "",
      executorRoleIsShow: true,
      editManageModel: false,
      lookManageModel: false,
      modal_loading: false,
      manageDateT: [],
      saveTit: "保存",
      isSortChoseDate: "QB",
      sortChoseDate: [
        {
          tit: "全部",
          id: "QB",
          selected: true
        },
        {
          tit: "询价",
          id: "LC0001",
          selected: false
        },
        {
          tit: "取样",
          id: "LC0003",
          selected: false
        },
        {
          tit: "图片处理",
          id: "LC0002",
          selected: false
        },
        {
          tit: "编辑描述",
          id: "LC0004",
          selected: false
        },
        {
          tit: "同步设置",
          id: "00001",
          selected: false
        }
      ],
      manageDate: [
        /* {
       nodeId:"001",      //流程节点ID （字符串）
       nodeName:"015",    //流程节点名称（字符串）
       flowId:"012",      //流程ID（字符串）
       enableFlag:0,      //是否启用 （数字）  0停用 1启用
       executorType:"",   //执行人类型 （数字） 1 执行人  0 执行人角色
       executor:"01",     //执行人（字符串）
       executorRole:"15", //执行人角色（字符串）
       lastNodeId:"15",   //上一节点ID（字符串）
       nextNodeId:"01",   //下一节点ID（字符串）
       createdTime:"2018-6-5 15:13:51",  //创建时间 (日期)
       createdBy:"02",   //创建人（字符串）
       updatedTime:"2018-6-5 15:14:14",  //修改时间 （日期）
       updatedBy:"02"    //修改人（字符串）
       } */
      ],
      typeSelect: [
        {
          value: 0,
          label: "固定角色"
        },
        {
          value: 1,
          label: "固定执行人"
        }
      ],
      formValidate: {
        thirdCreateSkuCheck: false,
        thirdCreateSkuUrl: "",
        uuid: "", // 主键ID
        nodeName: "",
        nodeId: "",
        executorType: 1, // 执行人类型
        executorRole: [], // 执行人角色
        executor: "", // 执行人
        enableFlag: true, // 是否启动
        //  createdBy:'',//创建人
        // updatedBy:'',//修改人
        neccessaryFlag: 0 // 是否显示启动按钮
      },
      formValidateRules: {
        executorRole: {
          validator: v.validateExecutor,
          trigger: "change"
        },
        executor: {
          validator: v.validateExecutorRole,
          trigger: "change"
        },
        thirdCreateSkuUrl: {
          validator: v.validateThirdCreateSkuUrl,
          trigger: "blur"
        }
      },
      nodeId: null,
      firDate: [],
      endDate: [],
      otherConfigJson: {},
      dataSettingId: null
    };
  },
  created () {
    // let v = this;
    // window.document.title = "流程配置";
    this.getList();
  },
  mounted () {
    this.getRoleQuery();
    this.getAllUser();
    this.getQueryMerchantDataSetting();
  },
  methods: {
    changeSwitch () {
      this.$refs.formValidate.validateField("thirdCreateSkuUrl");
    },
    getQueryMerchantDataSetting () {
      let v = this;
      v.$axios.get(api.queryMerchantDataSetting).then((res) => {
        if (res.code === 0) {
          v.pushErp = res.datas[0].sendErpPicture.toString();
          v.pushNode = res.datas[0].sendToListing.toString();
          v.dataSettingId = res.datas[0].dataSettingId;
        }
      });
    },
    setMerchantDataSetting () {
      let v = this;
      let obj = {
        dataSettingId: v.dataSettingId,
        sendErpPicture: v.pushErp,
        sendToListing: v.pushNode
      };
      v.$axios
        .post(api.merchantDataSetting, obj)
        .then((res) => {
          if (res.code === 0) {
            v.$msg.success({
              content: "保存成功",
              level: 5
            });
          }
        })
        .catch(() => { });
    },
    validateExecutorRole (rule, value, callback) {
      let v = this;
      if (v.formValidate.executorType === 0) {
        callback();
      } else if (v.formValidate.executorType === 1) {
        if (value === "" || value === null || value === undefined) {
          callback(new Error("执行人不能为空"));
        } else {
          callback();
        }
      } else {
        callback();
      }
    },
    validateThirdCreateSkuUrl (rule, value, callback) {
      let v = this;
      if (v.formValidate.thirdCreateSkuCheck) {
        if (!v.formValidate.thirdCreateSkuUrl) {
          callback(new Error("第三方跳转地址不能为空"));
        } else {
          callback();
        }
      } else {
        callback();
      }
    },
    validateExecutor (rule, value, callback) {
      let v = this;
      if (v.formValidate.executorType === 1) {
        callback();
      } else if (v.formValidate.executorType === 0) {
        if (
          value === "" ||
          value.length === 0 ||
          value === null ||
          value === undefined
        ) {
          callback(new Error("执行人角色不能为空"));
        } else {
          callback();
        }
      } else {
        callback();
      }
    },
    visibleManage (n) {
      if (n) {
        this.$refs.formValidate.resetFields();
        if (this.$refs.executorRoleRef) {
          this.$refs.executorRoleRef.reset();
        }
        if (this.$refs.executorRef) {
          this.$refs.executorRef.reset();
        }
        setTimeout(() => {
          if (this.executorType == null) {
            this.executorType = 1;
          }
          this.formValidate.executorType = this.executorType;
          this.formValidate.executorRole = this.executorRole;
          this.formValidate.executor = this.executor;
          if (this.otherConfigJson) {
            let obj = JSON.parse(this.otherConfigJson);
            this.formValidate.thirdCreateSkuCheck = obj.thirdCreateSkuCheck;
            this.formValidate.thirdCreateSkuUrl = obj.thirdCreateSkuUrl;
          }
        }, 30);
      }
    },
    getRoleQuery (callback) {
      let v = this;
      v.$axios
        .post(api.queryAllRolesByAppid)
        .then((res) => {
          if (res.code === 0) {
            v.executorRoleList = res.datas;
            callback && callback();
          }
        })
        .catch(() => { });
    },
    getAllUser () {
      let v = this;
      v.$axios
        .get(api.get_userInfoCommon)
        .then((res) => {
          if (res.code === 0) {
            v.executorList = [];
            for (let key in res.datas) {
              v.executorList.push(res.datas[key]);
            }
          }
        })
        .catch(() => { });
    },
    isEnble (params) {
      // 启动与停用
      let v = this;
      v.$axios
        .post(api.manageUpdate, {
          uuid: params.uuid,
          enableFlag: params.enableFlag === 1 ? 0 : 1
        })
        .then((res) => {
          if (res.code === 0) {
            v.$msg.success("保存成功");
            v.getList(v.isSortChoseDate);
          }
        });
    },
    executorTypeChange (item) {
      if (item === 1) {
        this.formValidate.executor = "";
        this.executorRoleIsShow = false;
      } else {
        this.formValidate.executorRole = "";
        this.executorRoleIsShow = true;
      }
    },
    validateExecutorType () {
      let v = this;
      return function (rule, value, callback) {
        if (value === "" || value === null) {
          callback(new Error("执行人类型不能为空"));
        } else if (value === 1) {
          if (v.formValidate.executor === "") {
            callback(new Error("执行人不能为空"));
          } else {
            callback();
          }
        } else {
          callback();
        }
      };
    },
    getList (id = "QB") {
      let v = this;
      v.$axios.get(api.manageList + "?flowId=" + id).then((res) => {
        if (res.code === 0) {
          v.manageDate = res.datas;
          v.isSortChoseDate = id;
          if (id === "QB") {
            [v.manageDate[4], v.manageDate[7]] = [
              v.manageDate[7],
              v.manageDate[4]
            ];
            [v.manageDate[5], v.manageDate[11]] = [
              v.manageDate[11],
              v.manageDate[5]
            ];
            [v.manageDate[4], v.manageDate[5]] = [
              v.manageDate[5],
              v.manageDate[4]
            ];
            [v.manageDate[4], v.manageDate[8]] = [
              v.manageDate[8],
              v.manageDate[4]
            ];
            [v.manageDate[9], v.manageDate[10]] = [
              v.manageDate[10],
              v.manageDate[9]
            ];
            [v.manageDate[12], v.manageDate[14]] = [
              v.manageDate[14],
              v.manageDate[12]
            ];
          } else if (id === "LC0001") {
            [v.manageDate[5], v.manageDate[4]] = [
              v.manageDate[4],
              v.manageDate[5]
            ];
          }
        }
      });
    },
    lookMethod (params) {
      // 查看
      let v = this;
      v.manageTitle = "查看流程";
      v.saveTit = "关闭";
      v.idEdit = false;
      v.fixDate(params, function () {
        // v.setVRule(params);
        v.editManageModel = true;
      });
    },
    editMethod (params) {
      // 编辑
      let v = this;
      v.idEdit = true;
      v.manageTitle = "编辑流程";
      v.saveTit = "保存";
      v.fixDate(params, function () {
        // v.setVRule(params);
        v.editManageModel = true;
      });
    },
    setVRule (params) {
      let v = this;
      if (params.executorType === 1) {
        v.executorRoleIsShow = false;
      } else {
        v.executorRoleIsShow = true;
      }
      if (params.flowId === "LC0001" && params.nodeId === 0) {
        v.typeSelect = [
          {
            value: 0,
            label: "发起者指定"
          },
          {
            value: 1,
            label: "固定执行人"
          }
        ];
      } else {
        v.typeSelect = [
          {
            value: 0,
            label: "发起者指定"
          },
          {
            value: 1,
            label: "固定执行人"
          },
          {
            value: 2,
            label: "上级指定"
          }
        ];
      }
    },
    save () {
      // 编辑保存
      let v = this;
      if (!v.idEdit) {
        v.editManageModel = false;
        return;
      }
      v.$refs["formValidate"].validate((valid) => {
        if (valid) {
          v.modal_loading = true;
          // formValidate.executorRole
          var params = {
            enableFlag: v.formValidate.enableFlag ? 1 : 0,
            otherConfigJson: JSON.stringify({
              thirdCreateSkuCheck: v.formValidate.thirdCreateSkuCheck,
              thirdCreateSkuUrl: v.formValidate.thirdCreateSkuUrl
            }),
            uuid: v.formValidate.uuid, // 主键ID
            nodeName: v.formValidate.nodeName,
            executorType: v.formValidate.executorType, // 执行人类型
            executorRole: v.formValidate.executorRole.join(","), // 执行人角色
            executor: v.formValidate.executor // 执行人
          };
          v.$axios
            .post(api.manageUpdate, params)
            .then((res) => {
              if (res.code === 0) {
                v.$msg.success("保存成功");
                v.editManageModel = false;
                v.modal_loading = false;
                v.getList(v.isSortChoseDate);
              } else {
                v.modal_loading = false;
              }
            })
            .catch(() => {
              v.modal_loading = false;
            });
        }
      });
    },
    fixDate (rowDate, callback) {
      let v = this;
      if (rowDate === "undefined") {
        return;
      }
      if (rowDate.executorRole && rowDate.executorRole.indexOf(",") > -1) {
        v.executorRole = rowDate.executorRole.split(",");
      } else if (rowDate.executorRole === null) {
        v.executorRole = [];
      } else {
        v.executorRole = [rowDate.executorRole];
      }
      v.executor = rowDate.executor;
      v.executorType = rowDate.executorType;
      v.otherConfigJson = rowDate.otherConfigJson;
      v.nodeId = rowDate.nodeId;
      for (let key in v.formValidate) {
        if (key === "enableFlag") {
          if (rowDate[key] === 0) {
            v.formValidate[key] = false;
          } else {
            v.formValidate[key] = true;
          }
        } else {
          v.formValidate[key] = rowDate[key];
        }
      }

      if (
        v.formValidate.executorType != 0 &&
        v.formValidate.executorType != 1
      ) {
        v.formValidate.executorType = 1;
      }
      callback && callback();
    },
    reset () {
      let v = this;
      for (let key in v.formValidate) {
        if (key === "enableFlag") {
          v.formValidate[key] = false;
        } else {
          v.formValidate[key] = "";
        }
      }
    },
    sortChoseB (item) {
      let v = this;
      v.getList(item.id);
    },
    isStart (data) {
      // let v = this;
      if (data === 0) {
        return "启用";
      } else if (data === 1) {
        return "停用";
      }
    }
  },
  computed: {
    isMax () {
      let v = this;
      if (v.formValidate.executorRole === null) {
        return false;
      } else if (
        v.formValidate.executorRole &&
        v.formValidate.executorRole.length > 9
      ) {
        return true;
      } else {
        return false;
      }
    },
    enableFlag () {
      let v = this;
      return v.formValidate.enableFlag === 0 ? "停用" : "启动";
    },
    isBtnChecked () {
      let v = this;
      let vaild = false;
      v.sortChoseDate.forEach((item) => {
        if (item.selected && item.id === "00001") {
          vaild = true;
        }
      });
      return vaild;
    }
  }
};
</script>

<style>
.cardBox .ivu-btn {
  color: #2d8cf0;
}

.isRed .ivu-card-head {
  background-color: #efc2d1;
  position: relative;
}

.isRed .ivu-card-head:before {
  content: "未配置";
  position: absolute;
  top: 0;
  right: 0;
  color: red;
  text-align: right;
  font-size: 0.75em;
  padding: 5px 10px 0;
  line-height: 15px;
  height: 15px;
  font-weight: 600;
}

.isEnabled .ivu-card-head {
  background-color: #e9eaec;
  position: relative;
}

.isEnabled .ivu-card-head:before {
  content: "未启用";
  position: absolute;
  top: 0;
  right: 0;
  color: #666;
  text-align: right;
  font-size: 0.75em;
  padding: 5px 10px 0;
  line-height: 15px;
  height: 15px;
  font-weight: 600;
}
</style>
<style scoped>
.managePage .ivu-card {
  height: auto;
}
.w-80 {
  width: 80px;
  display: inline-block;
}

.cardBox {
  width: 1220px;
  margin: 20px 0 0 0;
}

.cardArr {
  height: 100%;
  text-align: center;
  width: 100%;
  margin-top: 36px;
}

.cardArr1 {
  position: absolute;
  left: 50%;
  bottom: -40px;
}

.cardArrTopLeft {
  top: 80px;
  position: absolute;
  transform: rotate(-45deg);
  left: 12px;
}

.cardArrTopRight {
  bottom: 50px;
  position: absolute;
  left: -12px;
  transform: rotate(45deg);
}

.color2 {
  color: #fb5757 !important;
}

.color1 {
  color: #2b85e4 !important;
}

.color3 {
  color: #19be6b !important;
}

.mlv50 {
  margin-left: 50%;
}
</style>
