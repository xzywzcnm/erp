<template>
  <div>
    <Form
      ref="otherInfo"
      :model="baseInfoParam"
      :rules="basicRuleValidate"
      :label-width="120"
    >
      <Row>
        <Col span="10">
          <FormItem label="SKU编号">
            <Input
              v-model.trim="baseInfoParam.productCode"
              disabled
              :maxlength="100"
            />
          </FormItem>
        </Col>
        <Col span="10">
          <FormItem label="采购员">
            <dyt-select v-model="baseInfoParam.purchaseUser" disabled filterable>
              <Option
                v-for="(item, index) in $store.state.purchaseUserList"
                :key="index"
                :value="item.userId"
                >{{ item.userName }}</Option
              >
            </dyt-select>
          </FormItem>
        </Col>
        <Col span="10">
          <FormItem label="是否带电">
            <RadioGroup v-model="baseInfoParam.isElectriferous">
              <Radio label="0" disabled class="fl">
                <span>带电</span>
              </Radio>
              <Radio label="1" disabled class="fl">
                <span>不带电</span>
              </Radio>
            </RadioGroup>
          </FormItem>
        </Col>
        <Col span="10">
          <FormItem label="中文配货名称">
            <Input
              v-model.trim="baseInfoParam.distributionCnName"
              disabled
              :maxlength="100"
            /> </FormItem
        ></Col>
        <Col span="10">
          <FormItem label="英文配货名称">
            <Input
              v-model.trim="baseInfoParam.distributionEnName"
              disabled
              :maxlength="100"
            />
          </FormItem>
        </Col>
        <Col span="10">
          <FormItem label="商品中文报关名称">
            <Input
              v-model.trim="baseInfoParam.declareCnName"
              disabled
              :maxlength="100"
            />
          </FormItem>
        </Col>
        <Col span="10">
          <FormItem label="商品英文报关名称">
            <Input
              v-model.trim="baseInfoParam.declareEnName"
              disabled
              :maxlength="100"
            />
          </FormItem>
        </Col>
        <Col span="10">
          <FormItem label="海关编码">
            <Input
              v-model.trim="baseInfoParam.customCode"
              disabled
              :maxlength="100"
            />
          </FormItem>
        </Col>
        <Col span="10">
          <FormItem label="开发员">
            <dyt-select v-model="baseInfoParam.developerBy" disabled filterable>
              <Option
                v-for="(item, index) in $store.state.developerUserList"
                :key="index"
                :value="item.userId"
                >{{ item.userName }}</Option
              >
            </dyt-select>
          </FormItem>
        </Col>
        <Col span="18">
          <FormItem label="特性标签">
            <dyt-select
              v-model="baseInfoParam.featureTags"
              multiple
              disabled
              filterable
            >
              <Option
                v-for="item in $store.state.labelList"
                :key="item.labelId"
                :value="item.labelId"
                >{{ item.labelName }}</Option
              >
            </dyt-select>
          </FormItem>
        </Col>
        <Col span="24">
          <!-- 产品类型-->
          <FormItem label="产品类型">
            <CheckboxGroup
              v-model="baseInfoParam.productGoodsAcceptableTc"
              style="width: 510px"
            >
              <Checkbox
                v-for="(item, index) in productTypeList"
                :disabled="true"
                :key="index"
                :label="item.value"
              >
                <span>{{ item.name }}</span>
              </Checkbox>
            </CheckboxGroup>
          </FormItem>
        </Col>
        <Col span="24">
          <FormItem label="来源URL">
            <Input
              v-model.trim="baseInfoParam.monitorLink"
              disabled
              style="width: 510px"
            />
          </FormItem>
        </Col>
        <!--<Col span="10">
          <FormItem label="特性标签">
            <Input v-model.trim="baseInfoParam.featureTags" disabled  :maxlength="300"/>
          </FormItem>
        </Col>-->
      </Row>
    </Form>
  </div>
</template>

<script>
import CommonMixin from "@/components/mixin/commonMixin";
// import api from "@/api/api";

export default {
  name: "otherInfo",
  mixins: [CommonMixin],
  components: {},
  data () {
    return {
      purchaseUserList: [],
      baseInfoParam: {
        productCode: "", // sku编号
        distributionCnName: "", // 中文配货名称
        distributionEnName: "", // 英文配货名称
        declareCnName: "", // 商品中文报关名称
        declareEnName: "", // 商品英文报关名称
        customCode: "", // 海关编码
        featureTags: [], // 特性标签
        isElectriferous: "1",
        productGoodsAcceptableTc: [],
        monitorLink: "" // 来源URL
      },
      basicRuleValidate: {}
    };
  },
  created () {},
  methods: {},
  watch: {
    "$store.state.baseInfo" () {
      Object.assign(this.baseInfoParam, this.$store.state.baseInfo);
      if (this.baseInfoParam.isElectriferous !== null) {
        this.baseInfoParam.isElectriferous = this.baseInfoParam.isElectriferous.toString();
      }
      if (this.baseInfoParam.productGoodsAcceptableTc) {
        this.baseInfoParam.productGoodsAcceptableTc = this.baseInfoParam.productGoodsAcceptableTc.split(
          ","
        );
      } else {
        this.baseInfoParam.productGoodsAcceptableTc = [];
      }
      if (this.baseInfoParam.featureTags) {
        this.baseInfoParam.featureTags = this.baseInfoParam.featureTags.split(
          ","
        );
      }
    }
  }
};
</script>

<style scoped></style>
