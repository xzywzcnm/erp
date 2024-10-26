<template>
  <div>
    <Form
      ref="formValidate"
      class="fmb18"
      :model="formValidate"
      :label-width="80"
      :rules="ruleValidate"
    >
      <Row>
        <Col span="12">
          <FormItem label="地址名称:" prop="addressName">
            <Input
              v-model="formValidate.addressName"
              placeholder="请输入"
              clearable
            ></Input>
          </FormItem>
          <!-- <FormItem label="地址信息:" prop="warehouseAddress">
            <Input
              v-model="formValidate.warehouseAddress"
              placeholder="请输入"
              clearable
            ></Input>
          </FormItem>
          <FormItem label="详细地址:" prop="warehouseDetailAddress">
            <Input
              v-model="formValidate.warehouseDetailAddress"
              placeholder="请输入"
              clearable
            ></Input>
          </FormItem> -->
          <FormItem label="街道地址:" prop="streetAddress">
            <Input
              v-model="formValidate.streetAddress"
              placeholder="请输入"
              clearable
            ></Input>
          </FormItem>
          <FormItem label="详细地址:" prop="detailedAddress">
            <Input
              v-model="formValidate.detailedAddress"
              placeholder="请输入"
              clearable
            ></Input>
          </FormItem>
          <FormItem label="邮编:" prop="zipCode">
            <Input
              v-model="formValidate.zipCode"
              placeholder="请输入"
              clearable
            ></Input>
          </FormItem>
        </Col>
        <Col span="12">
          <FormItem label="联系人:" prop="contacts">
            <Input
              v-model="formValidate.contacts"
              placeholder="请输入"
              clearable
            ></Input>
          </FormItem>
          <FormItem label="手机:" prop="phone">
            <Input
              v-model="formValidate.phone"
              placeholder="请输入"
              clearable
            ></Input>
          </FormItem>
          <FormItem label="地址:" prop="rAddress">
            <Cascader
              :data="addressList"
              v-model="formValidate.rAddress"
              :filterable="true"
              :load-data="loadAreaData"
              :change-on-select="true"
            ></Cascader>
          </FormItem>
          <!-- <FormItem label="采购员:" prop="purchaserId">
            <dyt-select v-model="formValidate.purchaserId" clearable filterable>
              <Option
                v-for="(item, index) in purchaserArrData"
                :value="item.userId"
                :key="index"
                >{{ item.name }}
              </Option>
            </dyt-select>
          </FormItem> -->
          <FormItem>
            <Button
              type="primary"
              :loading="loading"
              @click="handleSubmit('formValidate')"
              v-if="getPermission('warereceAddress_keep')"
              >保存</Button
            >
          </FormItem>
        </Col>
      </Row>
    </Form>
  </div>
</template>

<script>
import api from "@/api/api";
import regular from "@/utils/regular.js";
import Mixin from "@/components/mixin/common_mixin";
export default {
  mixins: [Mixin],
  props: {
    purchaserArrData: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  data() {
    return {
      formValidate: {
        addressName: "",
        // warehouseAddress: "",
        // warehouseDetailAddress: "",
        contacts: "",
        phone: "",
        zipCode: "", //邮编
        // purchaserId: "", //采购员
        rAddress: [], //地址
        detailedAddress: "", //详细地址
        streetAddress: "", //街道地址
      },
      ruleValidate: {
        addressName: [
          { required: true, message: "请输入地址名称", trigger: "blur" },
          { max: 50, message: "最多只能输入50个字符", trigger: "blur" },
        ],
        streetAddress: [
          { required: true, message: "请输入地址信息", trigger: "blur" },
          { max: 50, message: "最多只能输入50个字符", trigger: "blur" },
        ],
        detailedAddress: [
          { required: true, message: "请输入详细地址", trigger: "blur" },
          { max: 50, message: "最多只能输入50个字符", trigger: "blur" },
        ],
        contacts: [
          { required: true, message: "请输入联系人", trigger: "blur" },
          { max: 20, message: "最多只能输入20个字符", trigger: "blur" },
        ],
        phone: [
          { required: true, message: "请输入电话号码", trigger: "blur" },
          { max: 20, message: "最多只能输入20个字符", trigger: "blur" },
          {
            type: "string",
            pattern: regular.isPhone,
            message: "请输入正确的手机号码",
            trigger: "blur",
          },
        ],
        zipCode: [
          {
            required: true,
            message: "请输入邮编",
            trigger: "blur",
          },
          {
            max: 20,
            message: "最多只能输入20个字符",
            trigger: "blur",
          },
        ],
        // purchaserId: [
        //   { required: true, message: "请选择采购员", trigger: "blur" },
        // ],
        rAddress: [
          { type: "array", required: true, message: "请选择", trigger: "blur" },
        ],
      },
      loading: false,
      addressList: [], //新增地址列表
    };
  },
  activated() {
    this.handleReset();
    this.getDetail();
  },
  created() {},
  methods: {
    // 获取默认地址信息
    getDetail() {
      this.axios.post(api.addressDefault).then(({ data }) => {
        if (data.code == 0) {
          let obj = data.datas || {};
          Object.keys(this.formValidate).forEach((k) => {
            Object.keys(obj).forEach((j) => {
              this.formValidate[k] = obj[k] || "";
            });
          });
          this.formValidate.rAddress = obj.totalAddressName.split(",");
          this.getAddressInfo();
        }
      });
    },
    // 提交
    handleSubmit(name) {
      let temp = this.saveAddress();
      this.$refs[name].validate((valid) => {
        if (valid) {
          // let temp = {};
          // temp = Object.assign({}, this.formValidate);
          temp.flag = 0; // 标识(0:默认地址 1:其他地址)
          this.loading = true;
          this.axios
            .post(api.addressSave, temp)
            .then(({ data }) => {
              if (data.code == 0) {
                this.$Message.info("操作成功");
                this.getDetail();
              }
            })
            .finally(() => {
              this.loading = false;
            });
        }
      });
    },
    // 重置表单
    handleReset() {
      this.$refs["formValidate"].resetFields();
    },
    //请求地址接口
    getAddress(parentId) {
      return new Promise((resolve) => {
        this.axios
          .get(`/dyt-cloud-upms-admin/district/treeList?parentId=${parentId}`)
          .then((res) => {
            let temp = res.data.data;
            let circle = (temp) => {
              temp.forEach((item) => {
                item.children = item.childrenDistrictList;
                item.label = item.districtCnName;
                item.value = item.districtCnName;
                if ([0, "0"].includes(item.isLastNode)) {
                  item.loading = false;
                }
                delete item.childrenDistrictList;
                if (item.children) circle(item.children);
              });
            };
            circle(temp);
            resolve(temp);
          })
          .catch(() => {
            resolve([]);
          });
      });
    },
    getDetailsAddress(topAreaList, addressArr = []) {
      return new Promise((resolve) => {
        let treeList = this.$common.copy(topAreaList);
        const hand = (data, index = 0, allData) => {
          let obj = {};
          let treeIndex = 0;
          data.forEach((item, tIndex) => {
            if (item.label === addressArr[index]) {
              obj = item;
              treeIndex = tIndex;
            }
          });

          if (this.$common.isEmpty(obj)) {
            return resolve({ list: treeList, val: addressArr });
          }
          this.getAddress(obj.id).then((res) => {
            allData[treeIndex].children = res;
            if (addressArr.length - 1 > index) {
              hand(res || [], index + 1, allData[treeIndex].children);
            } else {
              return resolve({ list: treeList, val: addressArr });
            }
          });
        };
        hand(topAreaList, 0, treeList);
      });
    },
    getAddressInfo() {
      const info = this.$common.copy(this.formValidate);
      const arrKey = ["rAddress"];
      const number = [];
      this.getAddress(1).then((temp) => {
        this.getDetailsAddress(
          temp,
          this.$common.isEmpty(info.rAddress) ? [] : info.rAddress
        ).then((res) => {
          this.addressList = res.list;
          this.$nextTick(() => {
            this.$nextTick(() => {
              Object.keys(info).forEach((key) => {
                if (arrKey.includes(key)) {
                  this.$set(
                    this.formValidate,
                    key,
                    this.$common.isArray(info[key])
                      ? info[key]
                      : this.$common.isEmpty(info[key])
                      ? []
                      : [info[key]]
                  );
                } else if (number.includes(key)) {
                  const newNumber = Number(info[key]);
                  this.$set(
                    this.formValidate,
                    key,
                    this.$common.isEmpty(newNumber) ? null : newNumber
                  );
                } else {
                  this.$set(this.formValidate, key, info[key]);
                }
              });
            });
            this.formValidate.rAddress = res.val;
          });
        });
      });
    },
    // 展开子级加载
    loadAreaData(item, callback) {
      item.loading = true;
      if (item.isLastNode == 1) {
        item.loading = false;
        callback();
        return;
      }
      this.axios
        .get(`/dyt-cloud-upms-admin/district/treeList?parentId=${item.id}`)
        .then((res) => {
          let temp = res.data.data;
          let circle = (temp) => {
            temp.forEach((itema) => {
              itema.children = itema.childrenDistrictList;
              itema.label = itema.districtCnName;
              itema.value = itema.districtCnName;
              //加了不会退出
              if (itema.isLastNode == 0) {
                itema.loading = false;
              }
              delete itema.childrenDistrictList;
              if (itema.children) circle(itema.children);
            });
          };
          circle(temp);
          item.children = temp;
          item.loading = false;
          callback();
        });
    },
    saveAddress() {
      let temp = JSON.parse(JSON.stringify(this.formValidate));
      if (temp.rAddress) {
        temp.rAddress = temp.rAddress.join(",");
      }
      temp.rCityName = temp.rAddress;

      temp.rCityName = temp.rCityName.split(",");
      let rCityId = [];

      let f1 = (rCityName, addressList, index) => {
        addressList.forEach((item) => {
          if (item.districtCnName == rCityName[index]) {
            rCityId.push(item.id);
            index = index + 1;
            if (index < rCityName.length) f1(rCityName, item.children, index);
          }
        });
      };
      f1(temp.rCityName, this.addressList, 0);
      temp.rCityId = rCityId.join(",");
      temp.rCityName = temp.rCityName.join(",");
      temp.totalAddressId = temp.rCityId;
      temp.totalAddressName = temp.rCityName;
      delete temp.rAddress;
      delete temp.rCityId;
      delete temp.rCityName;
      return temp;
    },
  },
};
</script>