<template >
  <div >
    <div class="enterRoleName" >
      <Form ref="roleParmas" label-position="right" :label-width="66" >
        <Form-item label="角色名称" >
          <Input v-model.trim="roleName" @on-change='roleNameChange' ></Input >
        </Form-item >
      </Form >
    </div >
    <div class="roleContainer" >
      <div class="modalItemContent clear" >
        <div class="modalItem modalModule fl" >
          <div class="modalItemHeader" >
            <h6 >模块</h6 >
          </div >
          <div class="modalItemcontent" >
            <ul style='list-style-type: none' >
              <li v-for="(item,index) in moduleList" :key="index">
                <a @click="selectMenuTwo(index)" :class='{"activeBlue":clickIndex===index}' >{{ item.mainTitle }}</a >
              </li >
            </ul >
          </div >
        </div >
        <div class="modalName" >
          <Collapse v-model="value1" >
            <template> <!--v-for-->
              <div v-for='(item,i) in currentShowAuth' class="modalNameContainer" :key='item.menuKey' >
                <!--moduleList的第二层checked--->
                <Checkbox :value="item.checked" @click.stop.native="handleCheckSubAll(i)" >全选
                </Checkbox >
                <Panel :name='String(i)' >
                  {{ item.mainTitle }}
                  <p slot="content" >
                    <template >
                      <section >
                        <div class="modalNameItem" >
                          <Checkbox-group v-model='item.checkGroup' @on-change="v=>{checkAllGroupChange(v,i)}" >
                            <template>
                              <div v-for='(v,index) in item.children' class="roleItem roleItemTwo" :key="index">
                                <Checkbox :label="v.operId" >
                                  <span >{{ v.operName }}</span >
                                </Checkbox >
                              </div >
                            </template >
                          </Checkbox-group >
                        </div >
                      </section >
                    </template >
                  </p >
                </Panel >
              </div >
            </template >
          </Collapse >
        </div >
      </div >
    </div >
  </div >
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
// eslint-disable-next-line no-unused-vars
import spsMenu from '@/api/spsMenu';
import setCenterMenu from '@/api/menuSetCenter';

export default {
  mixins: [Mixin],
  data () {
    return {
      roleName: '',
      currentShowAuth: '',
      clickIndex: 0,
      roleIdList: [],
      moduleList: [
        {
          mainTitle: '设置中心',
          menuId: 'generalSettings',
          checked: false,
          children: []
        }, {
          mainTitle: '采购管理系统',
          menuId: 'sps',
          checked: false,
          children: []
        }
      ],
      moduleListCopy: [
        {
          mainTitle: '设置中心',
          menuId: 'generalSettings',
          checked: false,
          children: []
        }, {
          mainTitle: '采购管理系统',
          menuId: 'sps',
          checked: false,
          children: []
        }
      ],
      value1: '0', // 折叠面板打开的位置
      num: 0
    };
  },
  props: {
    roleId: {
      type: String,
      default: null
    },
    merchantId: String,
    addOrEdit: null,
    roleTitle: {
      type: String,
      default: ''
    },
    timestamp: null
  },
  computed: {},
  watch: {
    '$parent.$parent.modal10': function (bool) {
      // 将菜单数据放入到moduleList中
      if (bool && this.addOrEdit === 'edit') {
        this.roleName = this.roleTitle;
        this.moduleList = this.moduleListCopy;
        this.init(this.roleId);
      } else if (bool && this.addOrEdit === 'add') {
        this.roleName = '';
        this.moduleList = this.moduleListCopy;
        this.init();
      } else {
        this.currentShowAuth = '';
        this.clickIndex = 0;
        this.value1 = '0';
      }
    },
    '$store.state.ADDOREDITSTATUS': function () {
      if (!this.roleName) {
        this.$Message.warning('请填写角色名称');
        return;
      }
      this.$parent.$parent.addRoleLoading = true;
      let arr = [];
      this.moduleList.forEach(val => {
        val.children.forEach(val2 => {
          if (Object.prototype.hasOwnProperty.call(val2, 'checkGroup')) {
            arr = [...arr, ...val2.checkGroup];
          }
        });
      });
      arr.forEach(item => {
        this.roleIdList.forEach((val, index) => {
          if (item === val) {
            this.roleIdList.splice(index, 1);
          }
        });
      });
      let delOperIdList = this.roleIdList;
      let obj = {
        delOperIdList: delOperIdList.length === 0 ? ['123'] : delOperIdList,
        operIdList: arr,
        merchantId: this.merchantId,
        roleId: this.roleId,
        roleName: this.roleTitle
      };
      if (this.addOrEdit === 'edit') {
        this.axios.put(api.edit_auth, obj).then(res => {
          this.$parent.$parent.addRoleLoading = false;
          this.$parent.$parent.loadingRoleStatus = false;
          if (res.data.code === 0) {
            this.$Message.success('编辑成功');
            this.$parent.$parent.modal10 = false;
            this.$emit('resetLoading');
          } else {
            this.$Message.warning(res.data.message);
          }
        });
      } else if (this.addOrEdit === 'add') {
        delete obj.merchantId;
        delete obj.roleId;
        obj.roleName = this.roleName;
        this.axios.post(api.edit_auth, obj).then(res => {
          this.$parent.$parent.loadingRoleStatus = false;
          this.$parent.$parent.addRoleLoading = false;
          if (res.data.code === 0) {
            this.$Message.success('新增成功');
            this.$parent.$parent.modal10 = false;
            this.$emit('resetLoading');
          } else {
            this.$Message.warning(res.data.message);
          }
        });
      }
    }
  },
  created () {
  },
  methods: {
    init (params) {
      // 静态菜单数据
      this.moduleList.forEach(val => {
        if (val.menuId === 'sps') {
          let spsChild = [];
          let spsMenu = spsMenu.menu;
          spsMenu.forEach(item => {
            if (!item.type) {
              spsChild.push(item);
            }
          });
          val.children = spsChild;
        } else {
          let setCenterChild = [];
          setCenterMenu.menu.forEach(item => {
            if (!item.type) {
              setCenterChild.push(item);
            }
          });
          val.children = setCenterChild;
        }
      });
      if (this.addOrEdit) {
        this.buttonAuth(params).then(res => {
          let obj = this.moduleList[0].children;
          let obj2 = this.moduleList[1].children;
          // 绑定每条数据的checkboxGroup变量 即 组合选中的变量
          let arr = [];
          let arr2 = [];
          obj.forEach(val => {
            arr = [];
            val.children.forEach(val2 => {
              if (val2.checked) {
                arr.indexOf(val2.operId) === -1 ? arr.push(val2.operId) : '';
              }
              this.$set(val, 'checkGroup', arr);
            });
            if (val.children.length === val.checkGroup.length) {
              val.checked = true;
            } else {
              val.checked = false;
            }
          });
          obj2.forEach(val3 => {
            arr2 = [];
            val3.children.forEach(val4 => {
              if (val4.checked) {
                arr2.indexOf(val4.operId) === -1 ? arr2.push(val4.operId) : '';
              }
              this.$set(val3, 'checkGroup', arr2);
            });
            if (Object.prototype.hasOwnProperty.call(val3, 'checkGroup')) {
              if (val3.children.length === val3.checkGroup.length) {
                val3.checked = true;
              } else {
                val3.checked = false;
              }
            }
          });
          this.currentShowAuth = obj;
          console.log(this.currentShowAuth);
        });
      }
    }, // 两个系统的切换
    selectMenuTwo (idx) {
      this.currentShowAuth;
      let node = document.querySelector('.modalName .modalNameContainer');
      node.classList.add('modal' + this.num++);
      this.clickIndex = idx;
      this.$nextTick(() => {
        this.currentShowAuth = this.moduleList.find((val, i) => {
          return i === idx;
        }).children;
      });
    }, // 右侧复选框的勾选
    handleCheckSubAll (idx) {
      this.currentShowAuth[+idx].checked = !this.currentShowAuth[+idx].checked;
      if (this.currentShowAuth[+idx].checked) {
        // 如果全部选中
        this.$set(this.currentShowAuth[+idx], 'checkGroup', this.currentShowAuth[+idx].children.map(val => val.operId));
      } else {
        // 如果全部没选中
        this.$set(this.currentShowAuth[+idx], 'checkGroup', []);
      }
    }, // 子项复选框变化
    checkAllGroupChange (data, idx) {
      if (this.currentShowAuth[idx].children.length === data.length) {
        this.$set(this.currentShowAuth[idx], 'checked', true);
      } else {
        this.$set(this.currentShowAuth[idx], 'checked', false);
      }
      data.forEach(val => {
        this.currentShowAuth[idx].children.forEach((val2, index) => {
          if (val === val2.operId) {
            this.$set(val2, 'checked', true);
            this.currentShowAuth[idx].children[index].checked = true;
          }
        });
      });
      this.$set(this.currentShowAuth[idx], 'checkGroup', data);
      console.log(this.currentShowAuth[idx]);
    },
    buttonAuth (params) {
      this.moduleList[0].children.forEach(val => {
        val.children = [];
      });
      this.moduleList[1].children.forEach(val => {
        val.children = [];
      });
      return new Promise((resolve, reject) => {
        this.axios.get(api.role_authList + params).then(res => {
          if (res.data.code === 0) {
            res.data.datas.forEach(val => {
              if (val.checked && (val.menuId.indexOf('sps') > -1)) {
                this.roleIdList.push(val.operId);
              }
              if (val.menuId.indexOf('sps') > -1) {
                this.moduleList[1].children.forEach(it => {
                  if (it.menuKey === val.menuId) {
                    it.children.push(val);
                  }
                });
              } else if (val.menuId.indexOf('generalSettings') > -1) {
                this.moduleList[0].children.forEach(it => {
                  if (it.menuKey === val.menuId) {
                    it.children.push(val);
                  }
                });
              }
            });
            resolve();
            console.log(this.moduleList);
          } else {
            this.$Message.warning(res.data.message);
          }
        });
      });
    },
    roleNameChange (e) {
      this.roleName = e.target.value;
    }
  }
};
</script>

<style>
.activeBlue {
  color: #2db7f5 !important;
}

.modalName .modalNameContainer .ivu-collapse-content {
  display: block !important;
}
</style>
