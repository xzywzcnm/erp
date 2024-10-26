<!-- 按钮上传 -->
<template>
  <div class="disflex button-upload--main">
    <!-- eslint-disable-next-line vue/no-duplicate-attributes -->
    <dytUpload
      ref="buttonUpload"
      :before-upload="handleBeforeUpload"
      :on-exceeded-size="handleMaxSize"
      :on-format-error="handleFormatError"
      :on-success="handleSuccess"
      :on-error="handleError"
      :name="config.name"
      :show-upload-list="config.showUploadList"
      :format="config.format"
      :accept="config.accept"
      :max-size="config.maxSize"
      :action="config.uploadApi"
      :multiple="config.limit>1?true:false"
      type="drag" class="disinline"
      v-if="!isDisabled && (uploadList.length<config.limit)"
      :disabled="loading"
      :headers="headObj"
      v-bind="$attrs"
    >
      <div class="pic-normal" v-if="type === 'pic'" @click="controlPic()">
        <Icon type="ios-camera" size="30"></Icon>
        <Spin size="large" fix v-if="loading"></Spin>
      </div>
      <Button type="primary" :loading="loading" @click="controlPic()" :size="config.sizes" v-else>
        <slot>上传图片</slot>
      </Button>
    </dytUpload>
  </div>
</template>

<script>
import api from '@/api/api';
export default {
  name: "ButtonUpload",
  model: {
    prop: 'uploadList',
    event: 'change',
  },
  props: {
    options: {//图片配置
      type: Object,
      default () {
        return {};
      }
    },
    isSort: {//是否禁用
      type: Boolean,
      default: false
    },
    uploadList: {//图片列表
      type: Array,
      default () {
        return [];
      }
    },
    type: {//决定按钮上传(btn)还是图框上传(pic)
      type: String,
      default () {
        return 'btn';
      }
    },
    isDisabled: {//是否禁用
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      uploadFilesList: [],
      oldFilesList: [],
      isUploading: false,
      uploadFilesTime: null,
      uploadFilesCalLback: () => {},
      loading: false,
      num: 0,
      finishnum: 0,
      config: {
        name: "files", // 设置图片上传的参数名称
        showUploadList: false,
        format: ['jpg', 'jpeg', 'png', 'gif', 'bmp'], //接受上传的文件类型
        maxSize: 1024 * 5,
        limit: 1, //设置可上传的图片数量
        sizes: 'default',
        headers: {},//接口头部
        uploadApi: api.upload,//上传图片接口
      },
      totalNum: 0,
      messageFlag: false,
    };
  },
  computed: {
    headObj () {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    }
  },
  created () {
    Object.keys(this.options).forEach(k => {
      this.config[k] = this.options[k];
    });
  },
  watch: {
    // 发货物流方式
    uploadList: {
      handler (data) {
        this.totalNum = data.length;
      },
      deep: true,
      immediate: true
    },
    isUploading (val) {
      val && this.uploadFilesListHand();
    }
  },
  methods: {
    // 上传成功
    handleSuccess (res, file) {
      this.handleError();
      if (res.code !== 0) {
        this.$Message.error(res.message || '系统错误!');
        return;
      }
      let obj = {
        url: res.datas && res.datas[0],
        name: file.name,
        selected: false,
      }
      // eslint-disable-next-line vue/no-mutating-props
      this.uploadList.push(obj);
    },
    // 上传失败
    handleError () {
      this.finishnum++;
      if (this.totalNum > 0) {
        this.totalNum--;
      }
      if (this.finishnum >= this.num) {
        this.loading = false;
        this.num = 0;
        this.finishnum = 0;
      }
    },
    // 图片格式限制
    handleFormatError (file) {
      this.$Message.error({
        content: file.name + `文件格式不正确, 请选择${this.config.format.toString()}格式的文件~`,
        duration: 2
      });
      this.handleError();
    },
    // 图片大小限制
    handleMaxSize (file) {
      this.$Message.error(file.name + '文件大小不能超过5M');
      this.handleError();
    },
    // 图片上传前 // 限制张数
    handleBeforeUpload (file) {
      let limit = this.config.limit;
      const fileName = file.name;
      const fileSuffix = fileName.substring(fileName.lastIndexOf('.') + 1);
      if (this.$common.isEmpty(fileSuffix) || !this.config.format.includes(fileSuffix.toLocaleLowerCase())) {
        this.$Message.error({
          content: file.name + `文件格式不正确, 请选择${this.config.format.toString()}格式的文件~`,
          duration: 2
        });
        return false;
      }
      this.totalNum++;
      if (this.totalNum > limit) {
        if (!this.messageFlag) {
          this.$Message.error(`最多可上传${limit}张图片`);
          this.messageFlag = true;
        }
        this.totalNum = limit;
        return false;
      }
      this.num++;
      this.loading = true;
      if (this.isSort) {
        let newForm = new FormData(); // 创建form对象
        newForm.append('files', file);
        this.uploadFilesTime && clearTimeout(this.uploadFilesTime);
        this.uploadFilesList.push(newForm);
        this.oldFilesList.push(file);
        this.uploadFilesTime = setTimeout(() => {
          this.isUploading = true;
          this.uploadFilesCalLback = (arr) => {
            this.handleError();
            let obj = {};
            arr.forEach((newres, index) => {
              obj = {
                url: newres.datas && newres.datas[0],
                name: this.oldFilesList[index] ? this.oldFilesList[index].name : '',
                selected: false,
              }
              // eslint-disable-next-line vue/no-mutating-props
              this.uploadList.push(obj);
            });
            this.$nextTick(() => {
              this.oldFilesList = [];
              this.uploadFilesCalLback = () => {}
            })
          }
        }, 300);
        return false;
      }
    },
    // 按顺序上传
    uploadFilesListHand () {
      const awaitList = this.uploadFilesList.map(file => {
        return this.axios.post(`${this.config.uploadApi}?random=${(Math.random()).toString().substring(2)}`, file)
      })
      Promise.all(awaitList).then(arr => {
        this.uploadFilesCalLback(arr);
        this.uploadFilesList = [];
        this.isUploading = false;
        this.loading = false;
      }).catch(() => {
        // this.$Message.error('系统繁忙，请重新尝试');
        this.uploadFilesList = [];
        this.isUploading = false;
        this.loading = false;
      })
    },
    // 控制图片弹框
    controlPic () {
      this.messageFlag = false;
    }
  }
};
</script>
<style lang="less" scoped>
.disinline {
  display: inline-block;
}
.disflex {
  display: flex;
}

.pic-normal {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #dcdee2;
}
</style>
<style>
.button-upload--main .ivu-upload-drag {
  border: none;
}
</style>