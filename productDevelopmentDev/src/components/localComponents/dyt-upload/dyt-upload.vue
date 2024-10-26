<template>
  <Upload
    ref="fileUploadRef"
    :before-upload="fileUploadBefore"
    :on-progress="fileProgress"
    :on-success="fileSuccess"
    :on-error="fileError"
    :on-format-error="fileFormatError"
    :on-exceeded-size="fileExceededSize"
    :max-size="maxSize"
    :action="action"
    :name="name"
    :accept="newAccept"
    :data="data"
    class="dyt-view-upload"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <!-- 默认插槽 触发上传组件的控件 -->
    <slot />
    <!-- tip 插槽 辅助提示内容 -->
    <slot name="tip" />
  </Upload>
</template>
<script>

export default {
  name: 'dytUpload',
  components: {},
  model: {},
  props: {
    // 上传的文件字段名
    name: { type: String, default: 'files' },
    // 上传的地址，必填
    action: { type: String, default: '' },
    // 接受上传的文件类型
    accept: { type: String },
    // 上传时附带的额外参数
    data: { type: Object },
    // 文件大小限制，单位 kb
    maxSize: { type: Number },
    // 支持的文件类型
    format: { type: Array, default: () => { return [] } },
    // 上传前 参数为上传的文件，若返回 false 或者 Promise 则停止上传
    beforeUpload: { type: Function },
    // 文件上传时 返回字段为 event, file, fileList
    onProgress: { type: Function },
    // 文件上传成功时 返回字段为 response, file, fileList
    onSuccess: { type: Function },
    // 文件上传失败时 返回字段为 error, file, fileList
    onError: { type: Function },
    // 文件格式验证失败时 返回字段为 file, fileList
    onFormatError: { type: Function },
    // 文件超出指定大小限制时 返回字段为 file, fileList
    onExceededSize: { type: Function },
  },
  data () {
    return {
      fileList: []
    }
  },
  computed: {
    defaultFileList () {
      return this.$attrs['default-file-list'] || [];
    },
    // 自定义文件格式
    newAccept () {
      if (this.$common.isEmpty(this.accept) && !this.$common.isEmpty(this.format)) {
        if (this.$common.isString(this.format)) {
          if ((this.format.trim()).substring(0, 1) == '.') {
            return this.format;
          }
          return `.${this.format}`;
        }
        return this.format.map(m => `.${m}`).join(',');
      }
      return  this.accept;
    },
    isMultiple () {
      let isMultiple = false;
      if (!this.$common.isUndefined(this.$attrs.multiple)) {
        if (this.$common.isBoolean(this.$attrs.multiple)) {
          isMultiple = this.$attrs.multiple;
        } else if (this.$common.isEmpty(this.$attrs.multiple)) {
          isMultiple = true;
        }
      }
      return isMultiple;
    }
  },
  watch: {
    defaultFileList: {
      immediate: true,
      deep: true,
      handler (val) {
        let addList = [];
        (val || []).forEach(item => {
          if (this.fileList.indexOf(item) == -1) {
            addList.push(item);
          }
        })
        if (!this.$common.isEmpty(addList)) {
          this.fileList = [...this.fileList, ...addList];
          if (this.$refs.fileUploadRef) {
            this.$refs.fileUploadRef.fileList = this.fileList;
          }
        }
      }
    }
  },
  created () {},
  mounted () {
    if (!this.$refs.fileUploadRef) return;
    this.$set(this.$refs, 'input', this.$refs.fileUploadRef.$refs.input);
  },
  methods: {
    upload (file) {
      if (!this.$refs.fileUploadRef) return;
      // this.$refs.fileUploadRef.upload(file);
      this.fileUploadHand(file, false);
      // console.log(this.$refs.fileUploadRef);
    },
    // 上传之前
    fileUploadBefore (file) {
      return this.fileUploadHand(file, true);
    },
    // 改造之后，改为这里上传文件
    fileUploadHand (file, type = true) {
      const oldList = this.$common.copy(this.fileList);
      if (this.$common.isEmpty(this.$refs.input)) {
        this.$set(this.$refs, 'input', this.$refs.fileUploadRef.$refs.input);
      } else {
        this.$refs.input = this.$refs.fileUploadRef.$refs.input;
      }
      if (this.$common.isEmpty(this.fileList) || !this.isMultiple) {
        this.fileList = [file];
      } else if (this.fileList.indexOf(file) == -1 && this.isMultiple) {
        this.fileList.push(file);
      }
      file.showProgress = true;
      file.percentage = 0;
      const suffix = file.name.substring(file.name.lastIndexOf('.'), file.name.length);
      if (!this.$common.isEmpty(this.accept)) {
        const accept = this.accept.split(',');
        let fileType = file.type;
        if (this.$common.isEmpty(fileType)) {
          fileType = suffix;
        }
        let tLowerCaseType = '';
        fileType = accept.find(type => {
          tLowerCaseType = type.trim().toLocaleLowerCase();
          if (tLowerCaseType.includes('/*')) {
            tLowerCaseType = tLowerCaseType.substring(0, tLowerCaseType.indexOf('/*') + 1);
            return fileType.substring(0, tLowerCaseType.length) == tLowerCaseType;
          }
          if (tLowerCaseType.substring(0, 1) == '.') {
            return tLowerCaseType == suffix || tLowerCaseType == fileType;
          }
          return tLowerCaseType == fileType;
        });
        if (this.$common.isEmpty(fileType)) {
          file.status = 'error';
          this.$nextTick(() => {
            this.fileList = this.fileList.filter(item => {
              return item.status == 'finished' && !item.showProgress;
            });
            this.fileFormatError(file, this.fileList);
          })
          return false;
        }
      }
      if (!this.$common.isEmpty(this.format)) {
        const fileSuffix = this.format.find(type => {
          return (`.${type}`).toLocaleLowerCase() == suffix;
        })
        if (this.$common.isEmpty(fileSuffix)) {
          file.status = 'error';
          this.$nextTick(() => {
            this.fileList = this.fileList.filter(item => {
              return item.status == 'finished' && !item.showProgress;
            });
            this.fileFormatError(file, this.fileList);
          })
          return false;
        }
      }
      const maxSize = Number(this.maxSize);
      if (!this.$common.isEmpty(maxSize) && (file.size / 1024) > maxSize) {
        file.status = 'error';
        this.$nextTick(() => {
          this.fileList = this.fileList.filter(item => {
            return item.status == 'finished' && !item.showProgress;
          });
          this.fileExceededSize(file, this.fileList);
        })
        return false;
      }
      if (type && !this.$common.isEmpty(this.beforeUpload)) {
        this.$refs.fileUploadRef.fileList = this.fileList;
        const isAutoUplod = this.beforeUpload(file);
        if ((this.$common.isBoolean(isAutoUplod) && !isAutoUplod) || this.$common.isPromise(isAutoUplod)) {
          this.$refs.fileUploadRef.fileList = oldList;
          this.fileList = oldList;
          return false;
        }
      }
      this.fileList = this.fileList.filter(item => {
        return item.status != 'error';
      });
      // 上传的文件
      this.$nextTick(() => {
        this.fileProgress(this.$refs.fileUploadRef, file, this.fileList);
      })
      const perTime = setInterval(() => {
        file.percentage += 10;
        this.$nextTick(() => {
          this.fileProgress(this.$refs.fileUploadRef, file, this.fileList);
        })
        if (file.percentage >= 100) {
          clearInterval(perTime);
          file.showProgress = false;
        }
      }, 200)

      let newForm = new FormData(); // 创建form对象
      newForm.append(this.name, file);
      if (!this.$common.isEmpty(this.data)) {
        if (this.$common.isJson(this.data)) {
          const addKey = Object.keys(this.data);
          addKey.forEach(key => {
            if (this.$common.isObject(this.data[key])) {
              newForm.append(key, JSON.stringify(this.data[key]));
            } else {
              newForm.append(key, this.data[key]);
            }
          });
        } else if (this.$common.isArray(this.data)) {
          this.data.forEach((item, index) => {
            if (this.$common.isObject(item)) {
              newForm.append(`array[${index}]`, JSON.stringify(item));
            } else {
              newForm.append(`array[${index}]`, item);
            }
          });
        }
      }
      // 上传
      this.axios.post(this.action, newForm, { isCache: false }).then(res => {
        clearInterval(perTime);
        file.showProgress = false;
        file.percentage = 100;
        file.response = res || {};
        if (!res || res.code != 0) {
          file.status = 'error';
          this.$nextTick(() => {
            this.fileList.splice(this.fileList.indexOf(file), 1);
            this.fileError(res, file, this.fileList);
          })
          return
        }
        file.status = 'finished';
        this.$nextTick(() => {
          this.fileList = this.fileList.filter(item => {
            return item;
          })
          this.$refs.fileUploadRef.fileList = this.fileList;
          this.$nextTick(() => {
            this.fileSuccess(res, file, this.fileList);
          })
        })
      }).catch((err) => {
        clearInterval(perTime);
        file.showProgress = false;
        file.percentage = 100;
        file.status = 'error';
        this.$nextTick(() => {
          this.fileList.splice(this.fileList.indexOf(file), 1);
          this.fileError(err, file, this.fileList);
        })
      })
      return false;
    },
    fileProgress (event, file, fileList) {
      if (this.$common.isEmpty(this.onProgress)) return;
      this.onProgress(event, file, fileList);
    },
    fileSuccess (response, file, fileList) {
      if (this.$common.isEmpty(this.onSuccess)) return;
      this.onSuccess(response, file, fileList);
    },
    fileError (error, file, fileList) {
      if (this.$common.isEmpty(this.onError)) return;
      this.onError(error, file, fileList);
    },
    fileFormatError (file, fileList) {
      if (this.$common.isEmpty(this.onFormatError)) return;
      this.onFormatError(file, fileList);
    },
    fileExceededSize (file, fileList) {
      if (this.$common.isEmpty(this.onExceededSize)) return;
      this.onExceededSize(file, fileList);
    },
    // 清空已上传的文件列表
    clearFiles () {
      if (!this.$refs.fileUploadRef) {
        this.$refs.fileUploadRef.fileList = [];
        this.fileList = [];
        return;
      }
      this.$refs.fileUploadRef.clearFiles();
      this.$nextTick(() => {
        this.$refs.fileUploadRef.fileList = [];
        this.fileList = [];
      })
    },
    getFile (file) {
      if (!this.$refs.fileUploadRef) return null;
      return this.$refs.fileUploadRef.getFile(file);
    },
    uploadFiles (files) {
      let postFiles = Array.prototype.slice.call(files);
      if (!this.isMultiple) postFiles = postFiles.slice(0, 1);
      if (postFiles.length === 0) return;
      postFiles.forEach((file) => {
        this.upload(file);
      });
    },
    // 上传文件，同 upload
    post (file) {
      // this.$refs.fileUploadRef.post(file);
      this.upload(file);
    }
  }
};
</script>
