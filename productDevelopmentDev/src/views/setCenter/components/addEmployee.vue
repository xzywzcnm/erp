<template>
  <div>
    <div class="modalItem">
      <div class="modalItemHeader">
        <h6>基本资料</h6>
      </div>
      <div class="modalItemContent">
        <div class="addEmpolyeeData">
          <Form
            :model="newEmployeeParams"
            :rules="ruleCustom"
            label-position="right"
            :label-width="100"
            ref="newEmployeeParams"
          >
            <Form-item label="邮箱" prop="email">
              {{ newEmployeeParams.email }}
            </Form-item>
            <Form-item label="电话" prop="mobile">
              <Input v-model.trim="newEmployeeParams.mobile"></Input>
            </Form-item>
            <Form-item label="姓名" prop="userName">
              <Input v-model.trim="newEmployeeParams.userName"></Input>
            </Form-item>
            <Form-item label="密码" prop="password">
              <Row>
                <Col span="12">
                  <Input
                    v-model="newEmployeeParams.password"
                    :autofocus="passwordFocus"
                  ></Input>
                </Col>
                <Col span="5" offset="1">
                  <Button @click="getStrongPassword">重新生成</Button>
                </Col>
                <!-- <Col span="4" offset="2">
                    <Button @click="copyPassword">复制</Button>
                  </Col> -->
              </Row>
            </Form-item>
          </Form>
        </div>
      </div>
    </div>
    <div class="modalItem" v-if="isAdmin != '1'">
      <div class="modalItemHeader">
        <h6>角色</h6>
      </div>
      <div class="modalItemContent maxHeightEmplyee">
        <div class="roleData clear">
          <Checkbox-group v-model="role" @on-change="selectRoleItem">
            <div class="roleItem" v-for="(item, index) in changeRoleList" :key="index">
              <Checkbox :label="item.roleId">
                <span>{{ item.title }}</span>
              </Checkbox>
            </div>
          </Checkbox-group>
        </div>
      </div>
    </div>
    <Spin size="large" fix v-if="spinShow"></Spin>
  </div>
</template>
<script>
import api from "../../../api/api";
import Mixin from "../../../components/mixin/commonMixin";

export default {
  mixins: [Mixin],
  data () {
    return {
      spinShow: true,
      newEmployeeParams: {
        roleIdList: [],
        saleAccountIdList: [],
        password: "",
        userName: "",
        mobile: ""
      },
      ruleCustom: {
        password: [
          {
            validator: this.validatePass(),
            trigger: "blur"
          }
        ],
        userName: [
          {
            validator: this.validateUserName(),
            trigger: "blur"
          }
        ]
      },
      passwordFocus: false,
      role: [],
      platformTypeList: [],
      shopPermissionList: [],
      roleStatus: [true, true, false],
      indeterminate: [],
      checkAll: [],
      checkAllGroup: [],
      catchAllGroup: [],
      accountIdGroup: [],
      changeRoleList: []
    };
  },
  props: {
    modalRoleList: {
      type: Array,
      default: null
    },
    uid: {
      type: String,
      default: null
    },
    isAdmin: {
      default: null
    },
    timestamp: null
  },
  computed: {
    addEmployeeStatus () {
      return this.$store.state.addEmployeeStatus;
    }
  },
  watch: {
    addEmployeeStatus (n) {
      if (n && this.uid == null) {
        this.addNewEmployee();
      } else if (n && this.uid != null) {
        this.editEmployee();
      }
    },
    timestamp (n, o) {
      let v = this;
      if (n != o) {
        v.getUserMes();
      }
    }
  },
  created () {
    var v = this;
    v.changeRoleList = v.modalRoleList.slice(1, v.modalRoleList.length);
    if (v.uid == null) {
      v.getStrongPassword();
    } else {
      v.getUserMes();
    }
  },
  methods: {
    getUserMes () {
      let v = this;
      v.$axios
        .post(api.check_user + v.uid)
        .then(function (response) {
          if (response.code == 0) {
            var data = response.datas;
            // let roleGroup = [];
            console.log("roleIdList:", data.roleIdList);
            v.role = data.roleIdList;
            v.newEmployeeParams.roleIdList = data.roleIdList;
            v.newEmployeeParams.email = data.email;
            v.newEmployeeParams.mobile = data.mobile;
            v.newEmployeeParams.userName = data.userName;
            v.newEmployeeParams.password = "";
            v.spinShow = false;
          } else {
            v.spinShow = false;
            v.$Message.error("系统繁忙，请稍后再试");
          }
        })
        .catch(() => {
          v.spinShow = false;
          v.$Message.error("系统繁忙，请稍后再试");
        });
    },
    getStrongPassword () {
      // 强密码生成
      var v = this,
        length = 16;
      var chars =
        "abcdefghijkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789*&%$#@!";
      var randomChars = "";
      for (var x = 0; x < length; x++) {
        var i = Math.floor(Math.random() * chars.length);
        randomChars += chars.charAt(i);
      }
      v.newEmployeeParams.password = randomChars;
    },
    getShopList () {
      var v = this;
      v.$axios
        .get(api.get_shopList)
        .then(function (response) {
          if (response.code == 0) {
            var data = response.datas;
            v.makePermisssionList(data);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    makePermisssionList (list) {
      // 解构权限数据
      var v = this,
        pos = [], // 平台类别数组
        groupPos = {}; // 平台权限组合
      Promise.resolve(
        list.map(function (n) {
          if (pos.indexOf(n.platformId) < 0 && n.platformId != null) {
            pos.push(n.platformId);
            groupPos[n.platformId] = [n.saleAccountId];
          } else if (pos.indexOf(n.platformId) >= 0) {
            groupPos[n.platformId].push(n.saleAccountId);
          }
        })
      ).then(function () {
        v.platformTypeList = pos;
        v.getGroup(groupPos);
        v.shopPermissionList = list;
      });
    },
    getGroup (groupPos) {
      var v = this;
      v.platformTypeList.forEach(function (n) {
        v.indeterminate.push(false);
        v.checkAll.push(false);
        v.checkAllGroup.push([]);
        v.catchAllGroup.push(groupPos[n]);
      });
    },
    selectRoleItem () {
      var v = this;
      v.newEmployeeParams.roleIdList = v.role;
    },
    addNewEmployee () {
      // 保存员工数据
      var v = this;
      Promise.all([
        v.handleSubmit("newEmployeeParams"),
        v.integrateSaleAccountId()
      ]).then(function (result) {
        if (result[0]) {
          v.$axios
            .post(api.add_user, JSON.stringify(v.newEmployeeParams))
            .then(function (response) {
              if (response.code == 0) {
                v.$Message.success("添加成功");
                v.$emit("saveSuccess");
                v.$parent.$parent.modal9 = false;
              } else if (response.code == "102010") {
                v.$Message.error("保存失败，邮箱已被占用");
              } else {
                v.$Message.error("保存失败，请重新尝试");
              }
              v.$emit("resetLoading");
              v.$store.commit("addEmployeeStatus", false);
            })
            .catch(function () {
              v.$emit("resetLoading");
              v.$store.commit("addEmployeeStatus", false);
            });
        } else {
          v.$Message.error("表单验证失败!");
          v.$emit("resetLoading");
          v.$store.commit("addEmployeeStatus", false);
        }
      });
      // console.log(this.newEmployeeParams)
    },
    editEmployee () {
      // 保存员工数据
      var v = this;
      Promise.all([
        v.handleSubmit("newEmployeeParams"),
        v.integrateSaleAccountId()
      ]).then(function (result) {
        if (result[0]) {
          var obj = JSON.parse(JSON.stringify(v.newEmployeeParams));
          obj.userId = v.uid;
          if (obj.password == "") {
            delete obj.password;
          }
          v.$axios
            .put(api.add_user, JSON.stringify(obj))
            .then(function (response) {
              if (response.success) {
                v.$Message.success("保存成功");
                v.$parent.$parent.modal9 = false;
              } else {
                v.$Message.error(response.message);
              }
              v.$emit("resetLoading");
              v.$store.commit("addEmployeeStatus", false);
            })
            .catch(function () {
              v.$emit("resetLoading");
              v.$store.commit("addEmployeeStatus", false);
            });
        } else {
          v.$Message.error("表单验证失败!");
          v.$emit("resetLoading");
          v.$store.commit("addEmployeeStatus", false);
        }
      });
      // console.log(this.newEmployeeParams)
    },
    handleSubmit (name) {
      var v = this,
        result = true;
      console.log("name:", name);
      this.$refs[name].validate(function (valid) {
        console.log("valid:", valid);
        if (valid) {
          result = true;
        } else {
          result = false;
          v.$nextTick(function () {
            v.$parent.loadingStatus = false;
          });
        }
      });
      return result;
    },
    authEmail (value) {
      var v = this;
      return Promise.resolve(
        v.$axios
          .get(api.check_email + "?email=" + value)
          .then(function (response) {
            if (response.success && response.datas.data == 0) {
              return true;
            } else {
              return false;
            }
          })
          .catch(function () {
            return false;
          })
      );
    },
    integrateSaleAccountId () {
      let  pos = []
      // str = "";
      this.checkAllGroup.map(function (n) {
        pos = pos.concat(n);
      });
      this.newEmployeeParams.saleAccountIdList = pos;
      return pos;
    },
    validatePass () {
      // 密码校验
      let v = this;
      var validatePass = function (rule, value, callback) {
        if (value === "" && v.uid == null) {
          callback(new Error("请输入密码"));
        } else {
          callback();
        }
      };
      return validatePass;
    },
    validateUserName () {
      // 用户名校验，非空判断
      var validateUserName = function (rule, value, callback) {
        if (value === "") {
          callback(new Error("请输入姓名"));
        } else {
          callback();
        }
      };
      return validateUserName;
    },
    handleCheckAll (index) {
      var v = this;
      if (v.indeterminate[index]) {
        v.checkAll.splice(index, 1, false);
      } else {
        v.checkAll.splice(index, 1, !v.checkAll[index]);
      }
      v.indeterminate.splice(index, 1, false);
      if (v.checkAll[index]) {
        v.checkAllGroup.splice(index, 1, v.catchAllGroup[index]);
      } else {
        v.checkAllGroup.splice(index, 1, []);
      }
    },
    checkAllGroupChange (index) {
      var v = this,
        data = v.checkAllGroup[index];
      if (data.length === v.catchAllGroup[index].length) {
        v.indeterminate[index] = false;
        v.checkAll[index] = true;
      } else if (data.length > 0) {
        v.indeterminate.splice(index, 1, true);
        v.checkAll.splice(index, 1, false);
      } else {
        v.indeterminate.splice(index, 1, false);
        v.checkAll.splice(index, 1, false);
      }
    }
  }
};
</script>
<style>
.maxHeightEmplyee {
  max-height: 246px;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
