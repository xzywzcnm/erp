<template>
  <div style="background-color: #f5f5f5; padding: 20px 0 100px 0">
    <Form :model="addSupplierForm" label-position="right" :label-width="100">
      <Row type="flex" justify="center">
        <Col :xs="{ span: 24 }" :lg="{ span: 10 }">
          <transition
            appear
            appear-class="animated fadeInRight"
            appear-to-class="animated fadeInRight"
            appear-active-class="animated fadeInRight"
          >
            <Card title="基本资料" dis-hover class="mb15">
              <Row>
                <Col span="20">
                  <FormItem label="名称">
                    <Input v-model="addSupplierForm.input0">
                      <dyt-select
                        v-model="addSupplierForm.input1"
                        slot="append"
                        style="width: 200px"
                      >
                        <Option value="1">1688供应商</Option>
                        <Option value="2">非1688供应商</Option>
                      </dyt-select>
                    </Input>
                  </FormItem>
                  <FormItem label="代码">
                    <Input v-model="addSupplierForm.input2"></Input>
                  </FormItem>
                  <FormItem label="等级">
                    <dyt-select v-model="addSupplierForm.input3">
                      <Option>124</Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="分配采购员">
                    <dyt-select v-model="addSupplierForm.input3">
                      <Option>124</Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="介绍">
                    <Input v-model="addSupplierForm.input4" :rows="2"></Input>
                  </FormItem>
                </Col>
              </Row>
            </Card>
          </transition>
          <transition
            appear
            appear-class="animated fadeInRight1"
            appear-to-class="animated fadeInRight1"
            appear-active-class="animated fadeInRight1"
          >
            <Card title="财富结算" dis-hover class="mb15">
              <Row>
                <Col span="20">
                  <FormItem label="结算方式">
                    <dyt-select v-model="addSupplierForm.input5">
                      <Option :value="1">1</Option>
                    </dyt-select>
                  </FormItem>
                  <FormItem label="结算方式备注">
                    <Input v-model="addSupplierForm.input6" :rows="4"></Input>
                  </FormItem>
                  <FormItem label="支付方式">
                    <dyt-select v-model="addSupplierForm.input5">
                      <Option :value="1">1</Option>
                    </dyt-select>
                  </FormItem>
                </Col>
              </Row>
            </Card>
          </transition>
          <transition
            appear
            appear-class="animated fadeInRight2"
            appear-to-class="animated fadeInRight2"
            appear-active-class="animated fadeInRight2"
          >
            <Card title="联系方式" dis-hover class="mb15">
              <FormItem label="联系人">
                <Input v-model="addSupplierForm.input7"></Input>
              </FormItem>
              <FormItem label="联系电话">
                <Input v-model="addSupplierForm.input8"></Input>
              </FormItem>
              <FormItem label="传真号">
                <Input v-model="addSupplierForm.input9"></Input>
              </FormItem>
              <FormItem label="Email">
                <Input v-model="addSupplierForm.input10"></Input>
              </FormItem>
              <FormItem label="QQ号">
                <Input v-model="addSupplierForm.input10"></Input>
              </FormItem>
              <FormItem label="阿里旺旺">
                <Input v-model="addSupplierForm.input10"></Input>
              </FormItem>
              <FormItem label="QQ号">
                <Input v-model="addSupplierForm.input10"></Input>
              </FormItem>
              <FormItem label="邮箱">
                <Input v-model="addSupplierForm.input10"></Input>
              </FormItem>
              <FormItem label="地址">
                <Input v-model="addSupplierForm.input10"></Input>
              </FormItem>
              <FormItem label="详细地址">
                <Input v-model="addSupplierForm.input10" :rows="4"></Input>
              </FormItem>
            </Card>
          </transition>
        </Col>
      </Row>
    </Form>
    <transition
      appear
      appear-class="animated fadeUpL"
      appear-to-class="animated fadeUpL"
      appear-active-class="animated fadeUpL"
    >
      <div
        style="
          position: fixed;
          bottom: 0;
          right: 0;
          width: 100%;
          height: 100px;
          background-color: rgb(0, 0, 0, 0.2);
          text-align: center;
          display: flex;
          justify-content: center;
          align-items: center;
        "
      >
        <Button type="primary">保存</Button>
      </div>
    </transition>
  </div>
</template>

<script>
import CommonMixin from "@/components/mixin/commonMixin";
// import { mapState, mapGetters, mapMutations, mapActions } from "vuex";

export default {
  name: "addSupplierM",
  mixins: [CommonMixin],
  components: {},
  data () {
    return {
      addSupplierForm: {
        input0: "",
        input1: "1",
        input2: "",
        input3: "",
        input4: "",
        input5: "",
        input6: "",
        input7: "",
        input8: "",
        input9: "",
        input10: "",
        input11: "",
        input12: "",
        input13: "",
        input14: "",
        input15: "",
        input16: "",
        input17: "",
        input18: "",
        input19: ""
      }
    };
  },
  methods: {},
  computed: {}
};
</script>

<style scoped>
@-webkit-keyframes fadeUpL {
  0% {
    bottom: -100px;
  }
  to {
    bottom: 0px;
  }
}

@keyframes fadeUpL {
  0% {
    bottom: -100px;
  }
  to {
    bottom: 0px;
  }
}

.fadeUpL {
  -webkit-animation-name: fadeUpL;
  animation-name: fadeUpL;
}

@-webkit-keyframes fadeInRight {
  0% {
    opacity: 0;
    -webkit-transform: translate3d(33%, 0, 0);
    transform: translate3d(33%, 0, 0);
  }
  to {
    opacity: 1;
    -webkit-transform: none;
    transform: none;
  }
}

@keyframes fadeInRight {
  0% {
    opacity: 0;
    -webkit-transform: translate3d(33%, 0, 0);
    transform: translate3d(33%, 0, 0);
  }
  to {
    opacity: 1;
    -webkit-transform: none;
    transform: none;
  }
}

.fadeInRight {
  -webkit-animation-name: fadeInRight;
  animation-name: fadeInRight;
}

@-webkit-keyframes fadeInRight1 {
  0% {
    opacity: 0;
    -webkit-transform: translate3d(66%, 0, 0);
    transform: translate3d(66%, 0, 0);
  }
  to {
    opacity: 1;
    -webkit-transform: none;
    transform: none;
  }
}

@keyframes fadeInRight1 {
  0% {
    opacity: 0;
    -webkit-transform: translate3d(66%, 0, 0);
    transform: translate3d(66%, 0, 0);
  }
  to {
    opacity: 1;
    -webkit-transform: none;
    transform: none;
  }
}

.fadeInRight1 {
  -webkit-animation-name: fadeInRight1;
  animation-name: fadeInRight1;
}

@-webkit-keyframes fadeInRight2 {
  0% {
    opacity: 0;
    -webkit-transform: translate3d(100%, 0, 0);
    transform: translate3d(100%, 0, 0);
  }
  to {
    opacity: 1;
    -webkit-transform: none;
    transform: none;
  }
}

@keyframes fadeInRight2 {
  0% {
    opacity: 0;
    -webkit-transform: translate3d(100%, 0, 0);
    transform: translate3d(100%, 0, 0);
  }
  to {
    opacity: 1;
    -webkit-transform: none;
    transform: none;
  }
}

.fadeInRight2 {
  -webkit-animation-name: fadeInRight2;
  animation-name: fadeInRight2;
}
</style>
