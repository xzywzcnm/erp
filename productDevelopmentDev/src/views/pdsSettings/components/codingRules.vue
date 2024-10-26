<template >
  <div class="codingRules_box">
    <RadioGroup v-model="pageParams.isDefined" vertical @on-change="changeRadio" class="radioBlock mb5">
      <Radio :label="1" :disabled="!isEdit">系统默认编号</Radio>
      <Radio :label="0" :disabled="!isEdit">用户自定义自动编号</Radio>
    </RadioGroup>

    <div class="encoded_box" v-show="pageParams.isDefined === 0">
      <h2 class="title">商品SPU/SKU编码生成规则</h2>
      <p class="text" v-for="(item, index) in encoded_text" :key="index">
        <span>{{ item.default_txt }}</span> <span class="color_red">{{ item.red_txt }}</span>
      </p>
      <Form ref="pageParams" :model="pageParams" :rules="ruleInline" :label-width="140">
        <Row type="flex" style="margin-top: 12px; flex-direction: column;">
          <Col>
          <Form-item label="SPU编码前缀" prop="spuPrefix">
            <dyt-input v-model.trim="pageParams.spuPrefix" style="width: 120px;" :disabled="!isEdit"></dyt-input>
          </Form-item>
          </Col>
          <Col>
          <Form-item label="SPU数字位数数量" prop="spuNumberSize">
            <dyt-inputNumber v-model.trim="pageParams.spuNumberSize" :min="0" style="width: 120px;"
              :disabled="!isEdit"></dyt-inputNumber>
          </Form-item>
          </Col>
          <Col>
          <Form-item label="起始数值" prop="initNumber">
            <dyt-inputNumber v-model.trim="pageParams.initNumber" :min="0" style="width: 120px;"
              :disabled="initNumberTalg || !isEdit"></dyt-inputNumber>
            <span class="color_red" style="font-size: 12px; margin-left: 6px;">仅在首次启用时可以设置初始值</span>
          </Form-item>
          </Col>
        </Row>
        <Button type="primary" @click="preservation" style="margin: 0 0 5px 155px;" :disabled="!isEdit">保存</Button>
      </Form>
    </div>
  </div>
</template>

<style lang='less' scoped>
.codingRules_box {
  margin: 0 12px;
  padding: 10px 15px;
  background-color: #fff;

  .encoded_box {
    display: flex;
    flex-direction: column;

    .title {
      margin: 10px 0 5px 0;
      font-size: 20px;
      color: #333;
    }

    .text {
      color: #666;
      font-size: 14px;
    }

    .color_red {
      color: #ef0c0c;
    }

    :deep(.ivu-form) {
      .ivu-form-item-label {
        font-size: 14px;
      }
    }

    :deep(.ivu-input) {
      font-size: 14px;
    }
  }

  .radioBlock {
    .ivu-radio-wrapper {
      display: inline-block;

      &:first-child {
        margin-right: 30px;
      }
    }
  }
}
</style>

<script type="text/ecmascript-6" >
import api from '@/api/api';
import CommonMixin from "@/components/mixin/commonMixin";

export default {
  mixins: [CommonMixin],
  data() {
    return {
      encoded_text: [
        {
          default_txt: '商品SPU生成示例：',
          red_txt: 'SPU编码前缀+六位递增数'
        }, {
          default_txt: '商品SKU生成示例：',
          red_txt: 'SPU编码前缀+六位递增数+两位递增数'
        }
      ],
      ruleInline: {
        spuPrefix: [
          {
            required: true,
            message: 'SPU编码前缀不能为空',
            trigger: 'blur'
          }
        ]
      },
      pageParams: {
        isDefined: 1,
        spuPrefix: '',
        spuNumberSize: 0,
        initNumber: 0
      },
      initNumberTalg: false
    };
  },
  computed: {
    isEdit() {
      return this.perm.select;
    },
    perm() {
      return {
        select: this.getPermission('productSpuSetting_select')
      }
    }
  },
  created() {
    this.queryProductSpu();
  },
  methods: {
    // 获取商户编号信息
    queryProductSpu() {
      if (this.perm.select) {
        this.axios.get(api.get_queryProductSpu).then((response) => {
          if (response.code === 0) {
            if (response.datas) {
              let obj = Object.assign({}, response.datas);
              if (obj.initNumber > 0) {
                this.initNumberTalg = true;
              } else {
                this.initNumberTalg = false;
              }
              this.pageParams = obj;
            }
          }
        });
      } else {
        this.gotoNoAccess();
      }
    },

    // 保存按钮
    preservation() {
      if (!this.isEdit) return;
      let v = this;
      v.$refs.pageParams.validate((valid) => {
        if (valid) {
          v.axios.post(api.post_createProductSpu, JSON.stringify(v.pageParams)).then((response) => {
            if (response.code === 0) {
              this.$Message.success('保存成功');
              this.queryProductSpu();
            }
          });
        }
      });
    },

    // 切换radio时，修改商户的编码类型
    changeRadio() {
      this.preservation();
    }
  }
};
</script>