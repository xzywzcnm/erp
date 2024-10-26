<template>
  <div class="dyt-upload">
    <!-- :default-file-list.sync="defaultList" -->
    <dyt-view-upload
      :action="uploadAction"
      :data="uploadData"
      v-model="defaultList"
      :show-upload-list="true"
      :format="['jpg','jpeg','png']"
      :multiple="true"
      :view-type="false"
      :is-drag-sort="true"
      :is-check-file="true"
      :is-file-title="true"
      :is-delete="true"
      :before-upload="beforeUpload"
      :on-success="onSuccess"
      :on-progress="onProgress"
      :on-error="onError"
      :on-remove="onRemove"
      :disabled="false"
      view-width="100px"
      view-height="100px"
    >
      <!-- <div slot="tip">1233</div> -->
      <!-- <Button icon="ios-cloud-upload-outline">Upload files</Button> -->
    </dyt-view-upload>
    <div style="margin-top: 10px;">
      <Button @click="upload" type="primary" :loading="loading" :disabled="uploadFile.length === 0">{{ loading ? '上传中...' : '点击上传' }}</Button>
    </div>
  </div>
</template>

<script>
// 绑定默认上传文件列表可使用2种方式：v-model="defaultList" 和:default-file-list.sync="defaultList"
// 增加参数
// is-drag-sort: 是否可拖拽排序，默认 false
// view-type: 是否查看模式(不可上传和删除)，默认false, 基本等同 disabled 效果
// is-check-file: 是否可以选中文件列表中的文件， 默认 false
// is-file-title: 是否显示文件名称， 默认 true
// is-delete: 是否可移除已上传文件，默认 true, 只能在view-type 为true时生效
// view-width: 列表图片宽度，默认 60px
// view-height:列表图片高度，默认 60px
// 新增方法
// file-check-change: 选项框选中后回调，返回 { list: '文件列表', oldList: '选中(取消)前列表', item: '当前操作的数据' }
// drag-sort-change: 拖拽完成后回调 { list: '拖拽完成后文件列表', oldList: '拖拽前列表' }
// 其他方法、参数、插槽都和 iviewui 一样

import api from '@/api/api';
export default {
  name: 'dytUploadDome',
  data () {
    return {
      uploadAction: `${api.productImport_inport}`,
      defaultList: [
        {
          name: '图片1',
          url: 'http://testing.lapa.com.cn/product-service/filenode/s/product-service/000035/2021-06-10/F44DBCB04CA3C887D521ED19ADE91B3E.jpg'
        },
        {
          checked: true,
          name: '图片2',
          url: 'http://testing.lapa.com.cn/product-service/filenode/s/product-service/000035/2021-07-24/A51582E6C7F9653363E64959D6281D29.jpg'
        },
        {
          checked: true,
          name: '图片3',
          url: 'http://testing.lapa.com.cn/product-service/filenode/s/product-service/000035/2021-06-10/2676EACD083F868292DFDD3974F59B13.jpg'
        },
        {
          name: '图片4',
          url: 'http://testing.lapa.com.cn/product-service/filenode/s/product-service/000035/2021-08-17/BEDEBD580B7878EA64227CEBE51E7D5D.jpg'
        }
      ],
      uploadData: {
        a: 'a',
        b: 'b'
      },
      uploadFile: [],
      loading: false
    }
  },
  watch: {
    defaultList: {
      deep: true,
      handler (val) {
        // 文件列表数据改变
        console.log('defaultList', val)
      }
    }
  },
  mounted () {
    // 加载后追加
    // setTimeout(() => {
    //   this.defaultList.push({
    //     checked: true,
    //     name: '图片5',
    //     url: 'http://testing.lapa.com.cn/product-service/filenode/s/product-service/000035/2021-06-10/F44DBCB04CA3C887D521ED19ADE91B3E.jpg'
    //   })
    // }, 5000)
  },
  methods: {
    // 上传文件之前的钩子，参数为上传的文件，若返回 false 或者 Promise 则停止上传
    beforeUpload (file) {
      this.uploadFile.push(file);
      return true
    },
    // 上传成功后
    onSuccess (response, file, fileList) {
      this.uploadFile = [];
      console.log('onSuccess', response, file, fileList)
    },
    // 文件上传时的钩子，返回字段为 event, file, fileList
    onProgress (response, file, fileList) {
      console.log('onProgress', response, file, fileList)
    },
    // 文件上传失败时的钩子，返回字段为 error, file, fileList
    onError (error, file, fileList) {
      this.uploadFile = [];
      console.log('onError', error, file, fileList)
    },
    // 自定义上传方法，需在 beforeUpload 方法处返回 false 停止自动上传功能
    upload () {
      this.loading = true;
      const allUpload = this.uploadFile.map(file => {
        return new Promise((resolve, reject) => {
          let formData = new FormData();
          formData.append('files', file);
          // 额外参数
          Object.keys(this.uploadData).forEach(key => {
            formData.append(key, this.uploadData[key]);
          })
          this.axios({
            method: 'post',
            url: this.uploadAction,
            data: formData,
            headers: this.$common.requestHeaders(),
            isFile: true
          }).then(res => {
            resolve(res);
          }).catch((err) => {
            reject(err)
          })
        })
      })
      //
      Promise.all(allUpload).then(res => {
        this.loading = false;
        this.uploadFile = [];
        console.log(res)
        // this.$Message.success('上传成功')
      }).catch(e => {
        this.loading = false;
        console.error(e)
      })
    },
    // 返回 true 移除文件，支持 Promise,
    onRemove (file, list) {
      console.log('onRemove', file, list)
      return true
    }
  }
};
</script>

<style lang="less" scoped>
.dyt-upload {
  display: inline-block;
  padding: 50px;
}
</style>
