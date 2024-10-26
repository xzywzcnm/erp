<template>
  <div class="mainBody freightTemplateDetail">
    <div
      style="font-size: 15px; display: flex; align-items: center"
      class="mt10 ml10"
    >
      <Icon type="md-arrow-back" style="cursor: pointer" @click="back" />
      <span style="font-weight: 500; cursor: pointer" class="ml10" @click="back"
        >返回</span
      >
      <div
        style="width: 2px; height: 20px; background: #dcdfe6"
        class="ml10"
      ></div>
      <Button type="primary" class="ml10" @click="saveData" v-if="editStatus"
        >保存</Button
      >
    </div>
    <Form
      :model="formData"
      :label-width="150"
      class="mt20"
      :rules="rules"
      ref="formData"
    >
      <Form-item label="费用模版名称：" prop="templateName">
        <dyt-input
          v-model="formData.templateName"
          style="width: 200px"
          :disabled="!editStatus"
        >
        </dyt-input>
      </Form-item>
      <Form-item label="费用币种：" prop="currency">
        <dyt-select
          v-model="formData.currency"
          style="width: 200px"
          :disabled="!editStatus"
        >
          <Option
            v-for="(item, index) in currencyList"
            :key="index"
            :label="item.targetCurrencyCode"
            :value="item.targetCurrencyCode"
          ></Option>
        </dyt-select>
      </Form-item>
      <Form-item label="总折扣：" prop="discount">
        <dyt-input
          v-model="formData.discount"
          style="width: 200px"
          :disabled="!editStatus"
        >
        </dyt-input>
        <span class="ml10">%</span>
      </Form-item>
      <Form-item label="">
        <Checkbox v-model="checked" :disabled="!editStatus"
          >计算体积重</Checkbox
        >
        <span
          v-if="
            [0, 1].includes(formData.freightTemplateQO.weightComparisonMethod)
          "
          >大于重量(kg)：
          <dyt-input
            v-model="formData.freightTemplateQO.volumeRestartWeight"
            style="width: 100px"
            v-if="
              [0, 1].includes(formData.freightTemplateQO.weightComparisonMethod)
            "
            :disabled="!editStatus"
          ></dyt-input>
        </span>
        <span
          v-if="
            [0, 1].includes(formData.freightTemplateQO.weightComparisonMethod)
          "
          >体积重因子：
          <dyt-input
            v-model="formData.freightTemplateQO.volumeWeightFactor"
            style="width: 100px"
            v-if="
              [0, 1].includes(formData.freightTemplateQO.weightComparisonMethod)
            "
            :disabled="!editStatus"
          ></dyt-input>
        </span>
        <RadioGroup
          v-model="formData.freightTemplateQO.weightComparisonMethod"
          v-if="
            [0, 1].includes(formData.freightTemplateQO.weightComparisonMethod)
          "
        >
          <Radio :label="0" class="ml20" :disabled="!editStatus"
            >重量与体积重，之间的较大者</Radio
          >
          <Radio :label="1" class="ml20" :disabled="!editStatus"
            ><span>重量 与 (体积重 - 重量 * </span>
            <dyt-input
              v-model="formData.freightTemplateQO.weightProportion"
              style="width: 50px"
              :disabled="!editStatus"
            ></dyt-input>
            <span> % ),之间的较大者</span>
          </Radio>
        </RadioGroup>
        <!-- <Radio
          v-model="formData.freightTemplateQO.weightComparisonMethod"
          :label="0"
          class="ml20"
          >重量与体积重，之间的较大者</Radio
        >
        <Radio
          v-model="formData.freightTemplateQO.weightComparisonMethod"
          :label="1"
          class="ml20"
          ><span>重量 与 (体积重 - 重量 * </span>
          <dyt-input
            v-model="formData.freightTemplateQO.weightProportion"
            style="width: 50px"
          ></dyt-input>
          <span> % ),之间的较大者</span>
        </Radio> -->
      </Form-item>
      <Form-item label="计算方式：">
        <div
          :style="{
            width: cardView1 ? '1100px' : cardView2 ? '806px' : '1006px',
          }"
        >
          <div class="computedWay mb10">
            <RadioGroup
              v-model="formData.freightTemplateQO.segmentType"
              @on-change="tableChange"
            >
              <Radio label="0" :disabled="!editStatus">分段单价收费</Radio>
              <Radio label="1" :disabled="!editStatus">分段总价收费</Radio>
              <Radio label="2" :disabled="!editStatus">分段首续重收费</Radio>
            </RadioGroup>
            <Button
              icon="el-icon-upload2"
              @click="importEvent"
              v-if="editStatus"
              >导入</Button
            >
          </div>
          <Card :dis-hover="true" :bordered="true" v-if="cardView1">
            <Table
              border
              :columns="columns1"
              :data="
                formData.freightTemplateQO.freightTemplateSegmentedUnitPriceQOS
              "
            >
              <template slot-scope="scope" slot="condition">
                <div class="dstyle">
                  <Form-item
                    class="mt10"
                    :rules="tableRules"
                    :prop="
                      'freightTemplateQO.freightTemplateSegmentedUnitPriceQOS[' +
                      scope.index +
                      '].weightLowerLimit'
                    "
                  >
                    <dyt-input
                      style="width: 100px"
                      v-model="
                        formData.freightTemplateQO
                          .freightTemplateSegmentedUnitPriceQOS[scope.index]
                          .weightLowerLimit
                      "
                      :disabled="scope.index > 0 || !editStatus"
                      @on-change="
                        inputLimit(
                          scope.index,
                          'weightLowerLimit',
                          'freightTemplateSegmentedUnitPriceQOS'
                        )
                      "
                    ></dyt-input>
                  </Form-item>
                  <span class="ml10">{{
                    scope.row.weightLowerLimitOperator == 1 ? " ≤" : " <"
                  }}</span>
                  <span class="ml10 mr10">{{ " kg " }}</span>
                  <Form-item
                    class="mt10"
                    :rules="typeRules"
                    :prop="
                      'freightTemplateQO.freightTemplateSegmentedUnitPriceQOS[' +
                      scope.index +
                      '].weightUpperLimitOperator'
                    "
                  >
                    <dyt-select
                      style="width: 50px"
                      v-model="
                        formData.freightTemplateQO
                          .freightTemplateSegmentedUnitPriceQOS[scope.index]
                          .weightUpperLimitOperator
                      "
                      placeholder=""
                      :disabled="!editStatus"
                      @on-change="
                        operatorChanged(
                          scope,
                          'freightTemplateSegmentedUnitPriceQOS'
                        )
                      "
                    >
                      <Option label="<" :value="0"></Option>
                      <Option label="≤" :value="1"></Option>
                    </dyt-select>
                  </Form-item>
                  <Form-item
                    class="mt10 ml10"
                    :rules="tableRules"
                    :prop="
                      'freightTemplateQO.freightTemplateSegmentedUnitPriceQOS[' +
                      scope.index +
                      '].weightUpperLimit'
                    "
                  >
                    <dyt-input
                      style="width: 100px"
                      v-model="
                        formData.freightTemplateQO
                          .freightTemplateSegmentedUnitPriceQOS[scope.index]
                          .weightUpperLimit
                      "
                      @on-change="
                        inputLimit(
                          scope.index,
                          'weightUpperLimit',
                          'freightTemplateSegmentedUnitPriceQOS'
                        )
                      "
                      :disabled="!editStatus"
                    ></dyt-input>
                  </Form-item>
                  <span class="ml20">每：</span>
                  <Form-item
                    class="mt10 ml10"
                    :rules="tableRules"
                    :prop="
                      'freightTemplateQO.freightTemplateSegmentedUnitPriceQOS[' +
                      scope.index +
                      '].kg'
                    "
                  >
                    <dyt-input
                      style="width: 100px"
                      v-model="
                        formData.freightTemplateQO
                          .freightTemplateSegmentedUnitPriceQOS[scope.index].kg
                      "
                      @on-change="
                        inputLimit(
                          scope.index,
                          'kg',
                          'freightTemplateSegmentedUnitPriceQOS'
                        )
                      "
                      :disabled="!editStatus"
                    ></dyt-input>
                  </Form-item>
                  <span class="ml20">kg</span>
                </div>
              </template>
              <template slot-scope="scope" slot="storageFee">
                <div class="dstyle">
                  <Form-item
                    class="mt10"
                    :rules="tableRules"
                    :prop="
                      'freightTemplateQO.freightTemplateSegmentedUnitPriceQOS[' +
                      scope.index +
                      '].price'
                    "
                  >
                    <dyt-input
                      style="width: 90px"
                      v-model="
                        formData.freightTemplateQO
                          .freightTemplateSegmentedUnitPriceQOS[scope.index]
                          .price
                      "
                      @on-change="
                        inputLimit(
                          scope.index,
                          'price',
                          'freightTemplateSegmentedUnitPriceQOS'
                        )
                      "
                      :disabled="!editStatus"
                    ></dyt-input>
                  </Form-item>
                </div>
              </template>
              <template slot-scope="scope" slot="additionFee">
                <div class="dstyle">
                  <Form-item
                    class="mt10"
                    :rules="tableRules"
                    :prop="
                      'freightTemplateQO.freightTemplateSegmentedUnitPriceQOS[' +
                      scope.index +
                      '].operationFee'
                    "
                  >
                    <dyt-input
                      style="width: 90px"
                      v-model="
                        formData.freightTemplateQO
                          .freightTemplateSegmentedUnitPriceQOS[scope.index]
                          .operationFee
                      "
                      @on-change="
                        inputLimit(
                          scope.index,
                          'operationFee',
                          'freightTemplateSegmentedUnitPriceQOS'
                        )
                      "
                      :disabled="!editStatus"
                    ></dyt-input>
                  </Form-item>
                </div>
              </template>
              <template slot-scope="scope" slot="operate">
                <Button
                  type="text"
                  style="color: #fd6b6f"
                  :disabled="
                    !editStatus || !getPermission('freightTemplate_remove')
                  "
                  @click="deleteRow(scope.index, 0)"
                  >删除</Button
                >
              </template>
            </Table>
            <Button
              type="text"
              style="font-size: 13px; color: #1a98ee"
              @click="addRow(1)"
              v-if="editStatus"
              >+增加条件</Button
            >
          </Card>
          <Card :dis-hover="true" :bordered="true" v-if="cardView2">
            <Table
              border
              :columns="columns2"
              :data="
                formData.freightTemplateQO.freightTemplateSectionalTotalPriceQOS
              "
            >
              <template slot-scope="scope" slot="condition">
                <div class="dstyle">
                  <Form-item
                    class="mt10"
                    :rules="tableRules"
                    :prop="
                      'freightTemplateQO.freightTemplateSectionalTotalPriceQOS[' +
                      scope.index +
                      '].weightLowerLimit'
                    "
                  >
                    <dyt-input
                      style="width: 100px"
                      v-model="
                        formData.freightTemplateQO
                          .freightTemplateSectionalTotalPriceQOS[scope.index]
                          .weightLowerLimit
                      "
                      @on-change="
                        inputLimit(
                          scope.index,
                          'weightLowerLimit',
                          'freightTemplateSectionalTotalPriceQOS'
                        )
                      "
                      :disabled="scope.index > 0 || !editStatus"
                    ></dyt-input>
                  </Form-item>
                  <span class="ml10">{{
                    scope.row.weightLowerLimitOperator == 1 ? " ≤" : " <"
                  }}</span>
                  <span class="ml10 mr10">{{ " kg " }}</span>
                  <Form-item
                    class="mt10"
                    :rules="typeRules"
                    :prop="
                      'freightTemplateQO.freightTemplateSectionalTotalPriceQOS[' +
                      scope.index +
                      '].weightUpperLimitOperator'
                    "
                  >
                    <dyt-select
                      style="width: 50px"
                      v-model="
                        formData.freightTemplateQO
                          .freightTemplateSectionalTotalPriceQOS[scope.index]
                          .weightUpperLimitOperator
                      "
                      placeholder=""
                      :disabled="!editStatus"
                      @on-change="
                        operatorChanged(
                          scope,
                          'freightTemplateSectionalTotalPriceQOS'
                        )
                      "
                    >
                      <Option label="<" :value="0"></Option>
                      <Option label="≤" :value="1"></Option>
                    </dyt-select>
                  </Form-item>
                  <Form-item
                    class="mt10 ml10"
                    :rules="tableRules"
                    :prop="
                      'freightTemplateQO.freightTemplateSectionalTotalPriceQOS[' +
                      scope.index +
                      '].weightUpperLimit'
                    "
                  >
                    <dyt-input
                      style="width: 100px"
                      v-model="
                        formData.freightTemplateQO
                          .freightTemplateSectionalTotalPriceQOS[scope.index]
                          .weightUpperLimit
                      "
                      @on-change="
                        inputLimit(
                          scope.index,
                          'weightUpperLimit',
                          'freightTemplateSectionalTotalPriceQOS'
                        )
                      "
                      :disabled="!editStatus"
                    ></dyt-input>
                  </Form-item>
                </div>
              </template>
              <template slot-scope="scope" slot="storageFee">
                <div class="dstyle">
                  <Form-item
                    class="mt10"
                    :rules="tableRules"
                    :prop="
                      'freightTemplateQO.freightTemplateSectionalTotalPriceQOS[' +
                      scope.index +
                      '].price'
                    "
                  >
                    <dyt-input
                      style="width: 90px"
                      v-model="
                        formData.freightTemplateQO
                          .freightTemplateSectionalTotalPriceQOS[scope.index]
                          .price
                      "
                      @on-change="
                        inputLimit(
                          scope.index,
                          'price',
                          'freightTemplateSectionalTotalPriceQOS'
                        )
                      "
                      :disabled="!editStatus"
                    ></dyt-input>
                  </Form-item>
                </div>
              </template>

              <template slot-scope="scope" slot="operate">
                <Button
                  type="text"
                  style="color: #fd6b6f"
                  :disabled="
                    !editStatus || !getPermission('freightTemplate_remove')
                  "
                  @click="deleteRow(scope.index, 1)"
                  >删除</Button
                >
              </template>
            </Table>
            <Button
              type="text"
              style="font-size: 13px; color: #1a98ee"
              @click="addRow(2)"
              v-if="editStatus"
              >+增加条件</Button
            >
          </Card>
          <Card :dis-hover="true" :bordered="true" v-if="cardView3">
            <Table
              border
              :columns="columns3"
              :data="formData.freightTemplateQO.freightTemplateFirstWeightContinuedWeightQOS"
            >
              <template slot-scope="scope" slot="condition">
                <div class="dstyle">
                  <div style="width: 300px" class="dstyle">
                    <Form-item
                      v-if="scope.index != 0"
                      :rules="tableRules"
                      :prop="`freightTemplateQO.freightTemplateFirstWeightContinuedWeightQOS[${scope.index}].weightLowerLimit`"
                    >
                      <dyt-input
                        style="width: 80px"
                        v-model="formData.freightTemplateQO.freightTemplateFirstWeightContinuedWeightQOS[scope.index].weightLowerLimit"
                        @on-change="
                          inputLimit(
                            scope.index,
                            'weightLowerLimit',
                            'freightTemplateFirstWeightContinuedWeightQOS'
                          )
                        "
                        :disabled="scope.index > 1 || !editStatus"
                      ></dyt-input>
                    </Form-item>
                    <span v-if="scope.index != 0">{{
                      scope.row.weightLowerLimitOperator == 1 ? " ≤" : " <"
                    }}</span>
                    <span class="ml10 mr10" v-if="scope.index != 0">{{
                      "kg "
                    }}</span>
                    <Form-item
                      v-if="scope.index != 0"
                      :rules="typeRules"
                      :prop="`freightTemplateQO.freightTemplateFirstWeightContinuedWeightQOS[${scope.index}].weightUpperLimitOperator`"
                    >
                      <dyt-select
                        v-model="formData.freightTemplateQO.freightTemplateFirstWeightContinuedWeightQOS[scope.index].weightUpperLimitOperator"
                        @on-change="
                          operatorChanged(
                            scope,
                            'freightTemplateFirstWeightContinuedWeightQOS'
                          )
                        "
                        placeholder=""
                        style="width: 50px"
                        :disabled="!editStatus"
                      >
                        <Option label="<" :value="0"></Option>
                        <Option label="≤" :value="1"></Option>
                      </dyt-select>
                    </Form-item>
                    <Form-item
                      v-if="scope.index != 0"
                      :rules="tableRules"
                      :prop="`freightTemplateQO.freightTemplateFirstWeightContinuedWeightQOS[${scope.index}].weightUpperLimit`"
                    >
                      <dyt-input
                        style="width: 80px"
                        v-model="formData.freightTemplateQO.freightTemplateFirstWeightContinuedWeightQOS[scope.index].weightUpperLimit"
                        @on-change="
                          inputLimit(
                            scope.index,
                            'weightUpperLimit',
                            'freightTemplateFirstWeightContinuedWeightQOS'
                          )
                        "
                        class="ml10 mr20"
                        :disabled="!editStatus"
                      ></dyt-input>
                    </Form-item>
                  </div>
                  <span v-if="scope.index == 0" class="ml10">首重：</span>
                  <Form-item
                    v-if="scope.index == 0"
                    :rules="tableRules"
                    :prop="`freightTemplateQO.freightTemplateFirstWeightContinuedWeightQOS[${scope.index}].firstWeight`"
                  >
                    <dyt-input
                      style="width: 80px"
                      v-model="formData.freightTemplateQO.freightTemplateFirstWeightContinuedWeightQOS[scope.index].firstWeight"
                      @on-change="
                        inputLimit(
                          scope.index,
                          'firstWeight',
                          'freightTemplateFirstWeightContinuedWeightQOS'
                        )
                      "
                      :disabled="!editStatus"
                    ></dyt-input>
                  </Form-item>
                  <span v-if="scope.index != 0">续重每：</span>
                  <Form-item
                    v-if="scope.index != 0"
                    :rules="tableRules"
                    :prop="`freightTemplateQO.freightTemplateFirstWeightContinuedWeightQOS[${scope.index}].weight`"
                  >
                    <dyt-input
                      style="width: 80px"
                      v-model="formData.freightTemplateQO.freightTemplateFirstWeightContinuedWeightQOS[scope.index].weight
                      "
                      @on-change="
                        inputLimit(
                          scope.index,
                          'weight',
                          'freightTemplateFirstWeightContinuedWeightQOS'
                        )
                      "
                      :disabled="!editStatus"
                    ></dyt-input>
                  </Form-item>
                  <span class="ml10 mr10" v-if="scope.index != 0">kg</span>
                </div>
              </template>
              <template slot-scope="scope" slot="storageFee">
                <div class="dstyle">
                  <Form-item
                    :rules="tableRules"
                    :prop="`freightTemplateQO.freightTemplateFirstWeightContinuedWeightQOS[${scope.index}].price`"
                  >
                    <dyt-input
                      style="width: 90px"
                      v-model="formData.freightTemplateQO.freightTemplateFirstWeightContinuedWeightQOS[scope.index].price"
                      @on-change="
                        inputLimit(
                          scope.index,
                          'price',
                          'freightTemplateFirstWeightContinuedWeightQOS'
                        )
                      "
                      :disabled="!editStatus"
                    ></dyt-input>
                  </Form-item>
                </div>
              </template>
              <template slot-scope="scope" slot="operate">
                <Button
                  type="text"
                  style="color: #fd6b6f"
                  v-if="scope.index > 0"
                  :disabled="
                    !editStatus || !getPermission('freightTemplate_remove')
                  "
                  @click="deleteRow(scope.index, 2)"
                  >删除</Button
                >
              </template>
            </Table>
            <Button
              type="text"
              style="font-size: 13px; color: #1a98ee"
              @click="addRow(3)"
              v-if="editStatus"
              >+增加条件</Button
            >
          </Card>
        </div>
      </Form-item>
      <div style="display: flex">
        <Form-item label="挂号费：" prop="freightTemplateQO.registrationFee" :rules="validateNumber">
          <dyt-input
            v-model="formData.freightTemplateQO.registrationFee"
            style="width: 100px"
            :disabled="!editStatus"
          >
          </dyt-input>
        </Form-item>
        <Form-item label="带电费：" prop="freightTemplateQO.electrificationCharge" :rules="validateNumber">
          <dyt-input
            v-model="formData.freightTemplateQO.electrificationCharge"
            style="width: 100px"
            :disabled="!editStatus"
          >
          </dyt-input>
        </Form-item>
        <Form-item label="附加费：" prop="freightTemplateQO.surchargeRatio" :rules="validateNumber">
          <dyt-input
            v-model="formData.freightTemplateQO.surchargeRatio"
            style="width: 100px"
            :disabled="!editStatus"
          >
          </dyt-input>
          %
        </Form-item>
      </div>
    </Form>
    <!-- 导入 -->
    <Modal v-model="importVisible" title="导入设置数据">
      <importDialog
        v-if="importVisible"
        ref="importDialog"
        :segmentType="formData.freightTemplateQO.segmentType"
        @importData="importData"
      ></importDialog>
      <div slot="footer">
        <Button @click="confirm" type="primary">确认 </Button>
        <Button @click="importVisible = false">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from "@/api/api";
import importDialog from "./importDialog.vue";
import Mixin from "@/components/mixin/common_mixin";

export default {
  mixins: [Mixin],

  props: {
    editStatus: {
      type: Boolean,
      default: () => {
        return false;
      },
    },
    templateId: {
      type: String,
      default: () => {
        return "";
      },
    },
  },
  components: { importDialog },
  data() {
    return {
      checked: true,
      nextValidate: {},
      formData: {
        templateType: "3",
        freightTemplateQO: {
          weightComparisonMethod: 0,
          registrationFee: "",
          electrificationCharge: "",
          surchargeRatio: "",
          segmentType: "0",
          freightTemplateSegmentedUnitPriceQOS: [
            {
              weightLowerLimitOperator: 0,
            },
          ],
          freightTemplateSectionalTotalPriceQOS: [
            { weightLowerLimitOperator: 0 },
          ],
          freightTemplateFirstWeightContinuedWeightQOS: [
            {},
            { weightLowerLimitOperator: 0 },
          ],
        },
      },
      columns1: [
        {
          title: "序号",
          type: "index",
          width: 70,
          align: "center",
        },
        {
          title: "条件",
          key: "name",
          slot: "condition",
          width: 550,
        },
        {
          title: "金额",
          key: "storageFee",
          slot: "storageFee",
          width: 200,
        },
        {
          title: "操作费",
          key: "additionFee",
          slot: "additionFee",
        },
        {
          title: "操作",
          key: "address",
          slot: "operate",
          width: 100,
        },
      ],
      columns2: [
        {
          title: "序号",
          type: "index",
          width: 70,
          align: "center",
        },
        {
          title: "条件",
          key: "name",
          slot: "condition",
          width: 400,
        },
        {
          title: "金额",
          key: "storageFee",
          slot: "storageFee",
          width: 200,
        },
        {
          title: "操作",
          key: "address",
          slot: "operate",
          width: 100,
        },
      ],
      columns3: [
        {
          title: "序号",
          type: "index",
          width: 70,
          align: "center",
        },
        {
          title: "条件",
          key: "name",
          slot: "condition",
          width: 600,
        },
        {
          title: "金额",
          key: "storageFee",
          slot: "storageFee",
          width: 200,
        },
        {
          title: "操作",
          key: "address",
          slot: "operate",
          width: 100,
        },
      ],
      data1: [],
      rules: {
        templateName: [
          {
            required: true,
            message: "请输入费用模版名称",
            trigger: "blur",
          },
        ],
        currency: [
          {
            required: true,
            message: "请选择费用币种",
            trigger: "change",
          },
        ],
        discount: [
          { validator: this.validateDiscount, trigger: "change" }
        ]
      },
      typeRules: [
        { required: true, message: " ", trigger: "change", type: "number" },
      ],
      validateNumber: [
        { validator: this.validateDiscount, trigger: "change" }
      ],
      tableRules: [
        { required: true, validator: this.validateTableNumber, trigger: "change" },
        { required: true, validator: this.validateTableNumber, trigger: "blur" }
      ],
      single: false,
      cardView1: true,
      cardView2: false,
      cardView3: false,
      currencyList: [], // 币种列表
      importVisible: false,
    };
  },
  watch: {
    checked: {
      handler(val) {
        if (val) {
          this.formData.freightTemplateQO.weightComparisonMethod = 0;
        } else {
          this.formData.freightTemplateQO.weightComparisonMethod = 2;
        }
      },
    },
  },
  mounted() {
    this.getData();
    this.queryCurrency();
  },
  methods: {
    getData() {
      if (this.templateId) {
        this.axios
          .get(
            `${api.queryTemplateDetail}?templateId=${this.templateId}&templateType=3`
          )
          .then((res) => {
            this.formData = res.data.datas;
            this.tableChange(this.formData.freightTemplateQO.segmentType);
          });
      }
    },
    // 查询货币
    queryCurrency() {
      let date = this.formatDate();
      this.axios.post(`${api.queryCurrency}?date=${date}`).then((res) => {
        this.currencyList = res.data.datas;
      });
    },
    formatDate() {
      let d = new Date();
      let y = d.getFullYear();
      let month = d.getMonth() + 1;
      if (month < 10) {
        month = "0" + month
      }
      return y + "-" + month;
    },
    addRow(type) {
      if (type === 1) {
        // ,weightLowerLimit:temp[length].weightUpperLimit
        let temp =
          this.formData.freightTemplateQO.freightTemplateSegmentedUnitPriceQOS;
        let length = temp.length - 1;
        let num = 0;
        if (temp[length].weightUpperLimitOperator == 0) {
          num = 1;
        }
        temp.push({
          weightLowerLimitOperator: num,
          weightLowerLimit: temp[length].weightUpperLimit,
        });
      }
      if (type === 2) {
        let temp =
          this.formData.freightTemplateQO.freightTemplateSectionalTotalPriceQOS;
        let length = temp.length - 1;
        let num = 0;
        if (temp[length].weightUpperLimitOperator == 0) {
          num = 1;
        }
        temp.push({
          weightLowerLimitOperator: num,
          weightLowerLimit: temp[length].weightUpperLimit,
        });
      }
      if (type === 3) {
        let temp =
          this.formData.freightTemplateQO
            .freightTemplateFirstWeightContinuedWeightQOS;
        let length = temp.length - 1;
        let num = 0;
        if (temp[length].weightUpperLimitOperator == 0) {
          num = 1;
        }
        temp.push({
          weightLowerLimitOperator: num,
          weightLowerLimit: temp[length].weightUpperLimit,
        });
      }
    },
    deleteRow(index, type) {
      if (type == 0) {
        this.formData.freightTemplateQO.freightTemplateSegmentedUnitPriceQOS.splice(
          index,
          1
        );
      }
      if (type == 1) {
        this.formData.freightTemplateQO.freightTemplateSectionalTotalPriceQOS.splice(
          index,
          1
        );
      }
      if (type == 2) {
        this.formData.freightTemplateQO.freightTemplateFirstWeightContinuedWeightQOS.splice(
          index,
          1
        );
      }
    },
    // 保存数据
    saveData() {
      this.formData.templateType = "3";
      this.$refs["formData"].validate((valid) => {
        if (valid) {
          if (
            JSON.stringify(
              this.formData.freightTemplateQO
                .freightTemplateSegmentedUnitPriceQOS[0]
            ) == "{}"
          ) {
            this.formData.freightTemplateQO.freightTemplateSegmentedUnitPriceQOS =
              [];
          }
          // 判断区间值是否连惯
          let status = this.judgeAreaNum();
          if (status == false) {
            return this.$Message.error("连续区间值不连贯,请检查");
          }
          if (this.templateId != "") {
            // 保存
            this.formData.templateId = this.templateId;
            if (
              this.formData.freightTemplateQO
                .freightTemplateSegmentedUnitPriceQOS[0]
                .weightLowerLimitOperator == null
            ) {
              this.formData.freightTemplateQO.freightTemplateSegmentedUnitPriceQOS[0].weightLowerLimitOperator = 0;
            }

            this.axios({
              method: "post",
              url: api.updateFreightTemplate,
              data: this.formData,
            }).then((res) => {
              if (res.msg == "模板名称重复") {
                return this.$Message.warning("模板名称重复");
              }
              this.$Message.success("保存成功");
              this.back();
            });
            return;
          }
          // 新建
          this.axios({
            method: "post",
            url: api.addFreightTemplate,
            data: this.formData,
          }).then((res) => {
            if (res.msg == "模板名称重复") {
              return this.$Message.warning("模板名称重复");
            }
            this.$Message.success("保存成功");
            this.back();
          });
        }
      });
    },
    // 判断区间是否连贯
    judgeAreaNum() {
      let status = true;
      if (this.formData.freightTemplateQO.segmentType == 0) {
        this.formData.freightTemplateQO.freightTemplateSegmentedUnitPriceQOS.forEach(
          (item, index, array) => {
            if (index > 0) {
              if (
                array[index].weightLowerLimit !=
                array[index - 1].weightUpperLimit
              ) {
                status = false;
              }
            }
          }
        );
      }
      if (this.formData.freightTemplateQO.segmentType == 1) {
        this.formData.freightTemplateQO.freightTemplateSectionalTotalPriceQOS.forEach(
          (item, index, array) => {
            if (index > 0) {
              if (
                array[index].weightLowerLimit !=
                array[index - 1].weightUpperLimit
              ) {
                status = false;
              }
            }
          }
        );
        if (status == false) {
          this.$Message.error("连续区间值不连贯,请检查");
        }
      }
      if (this.formData.freightTemplateQO.segmentType == 2) {
        // this.$message.error('连续区间值不连贯,请检查')
        this.formData.freightTemplateQO.freightTemplateFirstWeightContinuedWeightQOS.forEach(
          (item, index, array) => {
            if (index > 1) {
              if (
                array[index].weightLowerLimit !=
                array[index - 1].weightUpperLimit
              ) {
                // this.$message.error('连续区间值不连贯,请检查')
                status = false;
              }
            }
          }
        );
        if (status == false) {
          this.$Message.error("连续区间值不连贯,请检查");
        }
      }
      return status;
    },
    back() {
      this.$emit("back");
    },
    tableChange(val) {
      if (val == "0") {
        this.cardView1 = true;
        this.cardView2 = false;
        this.cardView3 = false;
      }
      if (val == "1") {
        this.cardView1 = false;
        this.cardView2 = true;
        this.cardView3 = false;
      }
      if (val == "2") {
        this.cardView1 = false;
        this.cardView2 = false;
        this.cardView3 = true;
      }
    },
    // 导入模板
    importEvent() {
      this.importVisible = true;
    },
    // 递归获取对象值
    getJsonVal (obj, key) {
      if (this.$common.isEmpty(key)) return obj;
      if (this.$common.isString(key)) return obj[key];
      if (this.$common.isArray(key)) {
        return this.getJsonVal(obj[key[0]], key.slice(1));
      }
    },
    // 验证总折扣
    validateDiscount (rule, value, callback) {
      if (!this.editStatus) return callback();
      this.$nextTick(() => {
        let val = null;
        if (rule.field.includes('.')) {
          const keys = rule.field.split('.');
          val = this.getJsonVal(this.formData, keys);
        } else {
          val = this.formData[rule.field]
        }
        if (!this.$common.isEmpty(val) && this.$common.isEmpty(Number(val))) {
          return callback(new Error('请输入数字'));
        }
        callback();
      })
    },
    // 验证重量、金额
    validateTableNumber (rule, value, callback) {
      this.$nextTick(() => {
        if (!this.editStatus) return callback();
        const index = Number(rule.field.substring(rule.field.indexOf('[') + 1, rule.field.lastIndexOf(']')));
        const key = rule.field.substring(rule.field.lastIndexOf('].') + 2, rule.field.length);
        const getV = this.formData.freightTemplateQO.freightTemplateFirstWeightContinuedWeightQOS[index][key];
        const val = (this.$common.isEmpty(getV) ? '' : getV).toString();
        if (this.$common.isEmpty(val) || this.$common.isEmpty(Number(val)) || Number(val) < 0) {
          return callback(new Error('请输入不小于 0 的数字'));
        }
        if (Number(val) > 1000000) {
          return callback(new Error('请输入小于 1000000 的数字'));
        }
        if (val.includes('.')) {
          const suffix = val.substring(val.lastIndexOf('.') + 1, val.length);
          if (suffix.length > 2) {
            return callback(new Error('请输入最多 2 位小数的数字'));
          }
        }
        if (key.includes('LowerLimit')) {
          const lKey = key.replace('LowerLimit', 'UpperLimit');
          const getVal = this.formData.freightTemplateQO.freightTemplateFirstWeightContinuedWeightQOS[index][lKey];
          const uVal = (this.$common.isEmpty(getVal) ? '' : getVal).toString();
          if (!this.$common.isEmpty(uVal) && !this.$common.isEmpty(Number(uVal)) && Number(uVal) < Number(val)) {
            return callback(new Error(`不能大于${uVal}`));
          }
        } else if (key.includes('UpperLimit')) {
          const lKey = key.replace('UpperLimit', 'LowerLimit');
          const getVal = this.formData.freightTemplateQO.freightTemplateFirstWeightContinuedWeightQOS[index][lKey];
          const uVal = (this.$common.isEmpty(getVal) ? '' : getVal).toString();
          if (!this.$common.isEmpty(uVal) && !this.$common.isEmpty(Number(uVal)) && Number(uVal) > Number(val)) {
            return callback(new Error(`不能小于${uVal}`));
          }
        }
        if (rule.trigger === 'blur') {
          if (!this.$common.isEmpty(this.nextValidate[`${rule.trigger}-${rule.field}`])) {
            delete this.nextValidate[`${rule.trigger}-${rule.field}`];
            return callback();
          };
          if (key.includes('LowerLimit')) {
            const nKey = rule.field.replace('LowerLimit', 'UpperLimit');
            this.$set(this.nextValidate, `${rule.trigger}-${nKey}`, true);
            this.$refs.formData.validateField(nKey);
          } else if (key.includes('UpperLimit')) {
            const nKey = rule.field.replace('UpperLimit', 'LowerLimit');
            this.$set(this.nextValidate, `${rule.trigger}-${nKey}`, true);
            this.$refs.formData.validateField(nKey);
          }
        }
        callback();
      })
    },
    // 返回导入数据
    importData(data) {
      this.importVisible = false;
      this.$Message.success("操作成功~");
      this.formData.freightTemplateQO.segmentType =
        data.freightTemplateQO.segmentType;
      this.tableChange(data.freightTemplateQO.segmentType);
      let temp = {
        cardView1: {
          index: "freightTemplateSegmentedUnitPriceQOS", // formData.freightTemplateQO 下标
          // 需要比较是否相同的字段
          sameArr: [
            // "kg",
            "weightLowerLimit",
            "weightLowerLimitOperator",
            "weightUpperLimit",
            "weightUpperLimitOperator",
            // "operationFee",
            // "price",
          ],
          diffArr: ["kg", "operationFee", "price"],
        },
        cardView2: {
          index: "freightTemplateSectionalTotalPriceQOS",
          sameArr: [
            "weightLowerLimit",
            "weightLowerLimitOperator",
            "weightUpperLimit",
            "weightUpperLimitOperator",
            // "price",
          ],
          diffArr: ["price"],
        },
        cardView3: {
          index: "freightTemplateFirstWeightContinuedWeightQOS",
          sameArr: [
            "weightLowerLimit",
            "weightLowerLimitOperator",
            "weightUpperLimit",
            "weightUpperLimitOperator",
            // "weight",
            // "price",
          ],
          diffArr: ["weight", "price", "firstWeight"],
        },
      };
      Object.keys(temp).forEach((item) => {
        if (!(this[item] && temp[item])) {
          return;
        }
        let { index, sameArr } = temp[item] || {};
        // console.log(temp[item], 'temp[item]');
        let tempList = this.formData.freightTemplateQO[index] || [];
        let addList = data.freightTemplateQO[index] || [];
        // console.log(tempList, addList, 66);
        // sameSkuStrategy 1: 覆盖 0： 忽略 (这个字段由导入面板所选择)
        if (data.sameSkuStrategy === "1") {
          // addList是要增加的，tempList是formdata的，sameArr是比较相同的，
          addList.forEach((addItem) => {
            let flag = true;
            tempList.forEach((tempItem) => {
              let [addSame, tempSame] = [{}, {}];
              sameArr.forEach((sameItem) => {
                addSame[sameItem] = addItem[sameItem];
                tempSame[sameItem] = tempItem[sameItem];
              });
              // console.log(addSame, 'addSame');
              // console.log(tempSame, 'tempSame');
              // 比较对应的字段
              if (JSON.stringify(addSame) === JSON.stringify(tempSame)) {
                flag = false;
                temp[item].diffArr.forEach((diffItem) => {
                  tempItem[diffItem] = addItem[diffItem];
                });
              }
            });
            // console.log(flag, 88);
            if (flag) {
              this.formData.freightTemplateQO[index].push(addItem);
            }
          });
        } else {
          this.formData.freightTemplateQO[index].push(...addList);
        }
        if (
          Object.keys(this.formData.freightTemplateQO[index][0]).length <= 1
        ) {
          this.formData.freightTemplateQO[index].splice(0, 1);
          if (
            Object.keys(this.formData.freightTemplateQO[index][0]).length <= 1
          ) {
            this.formData.freightTemplateQO[index].splice(0, 1);
          }
        }
      });
    },
    confirm() {
      this.$refs["importDialog"].confirm();
    },
    inputLimit(index, key, type) {
      // freightTemplateQO.freightTemplateSegmentedUnitPriceQOS['+scope.$index+'].weightLowerLimit'
      let temp = this.formData.freightTemplateQO[type][index][key];
      let value = temp.replace(/[^0-9]{0,1}(\d*(?:\.\d{0,3})?).*$/g, "$1");
      if (value > 1000000) {
        value = value.slice(0, 6);
      }
      value = Number(value);
      this.$set(this.formData.freightTemplateQO[type][index], key, value);
    },
    operatorChanged(scope, type) {
      let temp = this.formData.freightTemplateQO[type];
      if (temp.length > scope.index + 1) {
        if (temp[scope.index].weightUpperLimitOperator == 1) {
          temp[scope.index + 1].weightLowerLimitOperator = 0;
        } else {
          temp[scope.index + 1].weightLowerLimitOperator = 1;
        }
      }
    },
  },
};
</script>

<style lang="less" >
.freightTemplateDetail {
  .ivu-btn {
    height: 28px;
  }
  .dstyle {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    .itemOption.ivu-form-item .ivu-form-item-content {
      margin-left: 80px !important;
    }
  }
  .computedWay {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
