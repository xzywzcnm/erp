<template>
  <div class="pricetAddListPage">
    <Form ref="formData" :model="formData" :label-width="0" class="fmb0">
      <FormItem :label="`${priceTitle}:`" :label-width="90">
        <div>{{ totalPrice }} 元</div>
      </FormItem>
      <Table highlight-row :columns="columns" :data="formData.tableList" border class="tableStyle">
        <template slot-scope="{ row,index }" slot="price">
          <FormItem :prop="'tableList.' + index + '.deductionPrice'"
            :rules="{ validator: validatePrices, trigger: 'blur' }" v-if="isEdit">
            <Input v-model.number="formData.tableList[index].deductionPrice" type="number" />
          </FormItem>
          <div v-else>{{ row.deductionPrice || 0 }}</div>
        </template>
        <template slot-scope="{ row,index }" slot="picture">
          <div class="uploadStyle">
            <large-picture :url="row.pictureUrl" imageHigh="60px" v-if="row.pictureUrl" class="mr10">
            </large-picture>
            <Button @click="uploadImg(index)" :loading="row.imgLoading" v-if="isEdit">上传图片</Button>
          </div>
        </template>
        <template slot-scope="{ row,index }" slot="remarks">
          <FormItem v-if="isEdit">
            <Input v-model="formData.tableList[index].remark" maxlength="200" show-word-limit />
          </FormItem>
          <Tooltip :content="row.remark" :disabled="!row.remark" max-width="400" placement="top" transfer v-else>
            <div class="textOverTwo">{{ row.remark }}</div>
          </Tooltip>
        </template>
        <template slot-scope="{ row,index }" slot="operator">
          <span class="errorText" @click="delRow(index)">删除</span>
        </template>
      </Table>
      <div class="mt10" v-if="isEdit">
        <Button type="primary" @click="addRows">新增</Button>
      </div>
    </Form>
    <!-- 图片上传 -->
    <dyt-upload ref="priceUpload" name="file" :show-upload-list="false" :before-upload="fileUploadBefore"
      :action="uploadApi" :headers="headObj" :accept="accepts.toString()" :format="imgTypes" v-show="false">
      <Button type="primary" :id="uploadKey">上传图片</Button>
    </dyt-upload>
  </div>
</template>
<script>
import api from "../../../../../api/api";
import largePicture from "@/components/largePicture";
import Mixin from "@/components/mixin/common_mixin";
import regular from '@/utils/regular.js';
export default {
  name: "pricetAddList",
  components: { largePicture },
  mixins: [Mixin],
  props: {
    priceTitle: {
      type: String,
      default() {
        return '';
      },
    },
    list: {
      type: Array,
      default() {
        return [];
      },
    },
    deductType: {
      type: String,
      default() {
        return null;
      },
    },
  },
  data() {
    return {
      formData: {
        tableList: [],
      },
      defaultRows: {
        deductionPrice: '',
        pictureUrl: '',
        remark: '',
        imgLoading: false,
      },
      imgTypes: ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif', 'svg'],
      accepts: ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif', '.svg'],
      uploadApi: api.fileUpLoad,
      imgIndex: null,
      uploadKey: 'uploadKey' + parseInt(Math.random() * 1000000),
    };
  },
  computed: {
    totalPrice() {
      let list = this.formData.tableList;
      return list.reduce((pre, sub) => {
        return this.$common.add(pre, (sub.deductionPrice || 0))
      }, 0);
    },
    isDetail() {
      return ['detail'].includes(this.deductType);
    },
    isEdit() {
      return ['add', 'edit'].includes(this.deductType);
    },
    columns() {
      let list = [];
      if (this.isEdit) {
        list.push({
          title: "操作",
          slot: "operator",
          width: 120,
          align: 'center',
        })
      }
      return [
        {
          title: "金额(元)",
          slot: "price",
          minWidth: 120,
          align: 'center',
        },
        {
          title: "图片说明",
          slot: "picture",
          minWidth: 120,
          align: 'center',
        },
        {
          title: "备注说明",
          slot: "remarks",
          minWidth: 200,
          align: 'center',
        },
        ...list,
      ]
    },
  },
  watch: {
    list: {
      handler(newVal, oldVal) {
        this.formData.tableList = this.$common.copy(newVal || []).map(k => {
          k.imgLoading = false;
          return k;
        });
      },
      immediate: true
    }
  },
  methods: {
    addRows() {
      let item = this.$common.copy(this.defaultRows);
      this.formData.tableList.push(item);
    },
    uploadImg(index) {
      let dom = document.querySelector('#' + this.uploadKey);
      if (!dom) return;
      this.imgIndex = index;
      dom.click();
    },
    // 上传excel
    fileUploadBefore(file) {
      const fileType = file.type.substring(file.type.lastIndexOf('/') + 1, file.type.length);
      if (!(fileType && this.imgTypes.includes(fileType.toLowerCase()))) {
        this.$Message.error('请上传图片，格式为' + this.imgTypes.toString());
        return;
      }
      let imgIndex = this.imgIndex;
      let newForm = new FormData(); // 创建form对象
      newForm.append('files', file);
      this.$set(this.formData.tableList[imgIndex], 'imgLoading', true);
      this.axios.post(this.uploadApi, newForm).then(({ data }) => {
        if (data.code !== 0) return;
        let imgList = data.datas || [];
        this.$set(this.formData.tableList[imgIndex], 'pictureUrl', imgList[0] || '');
        this.imgIndex = null;
      }).finally(() => {
        this.$set(this.formData.tableList[imgIndex], 'imgLoading', false);
      })
      return false;
    },
    // 删除
    delRow(index) {
      this.formData.tableList.splice(index, 1);
    },
    validatePrices(rule, value, callback) {
      if (['', null, undefined].includes(value)) {
        callback(new Error('请填写金额!'));
        return;
      }
      if (!regular.positiveFloat.test(value)) {
        callback(new Error('大于0的浮点数，小数点后不超过两位'));
        return;
      }
      callback();
    },
    async handleForm() {
      return new Promise((resolve, reject) => {
        this.$refs['formData'].validate((valid) => {
          if (!valid) {
            reject();
            return;
          }
          resolve(this.formData.tableList);
        })
      })
    },
  },
};
</script>
<style lang="less">
.pricetAddListPage {
  .tableStyle {

    // width: 600px;
    .ivu-form-item,
    .ivu-form-item-content {
      width: 100% !important;
    }
  }

  .errorText {
    display: inline-block;
    cursor: pointer;
    color: #ed4014;
  }

  .uploadStyle {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px 0;
  }

  /* 超出两行用省略号表示 */
  .textOverTwo {
    overflow: hidden;
    -webkit-line-clamp: 2;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
  }
}
</style>