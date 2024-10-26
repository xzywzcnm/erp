<template>
  <div class="mainBox paneMain create-require">
    <Card shadow>

      <Card class="box-card">
        <p slot="title">预览图片</p>
        <div class="flex-div">
          <div class="mr10">
            <div>预览：</div>
            <preview-img :fileList="filePiclist" :isDisabled="true"></preview-img>
          </div>
          <div class="mr10">
            <div>预览/删除：</div>
            <preview-img :fileList="filePiclist"></preview-img>
          </div>
          <div class="mr10">
            <div>可勾选：</div>
            <preview-img :fileList="filePiclist" :isChecked="true"></preview-img>
          </div>
          <div class="mr10">
            <div>插入自定义内容：</div>
            <preview-img :fileList="filePiclist">
              <div class="upload-imgsty">
                <Icon type="ios-camera" size="30"></Icon>
              </div>
            </preview-img>
          </div>
          <div class="mr10">
            <div>图片拖拽：</div>
            <preview-img :fileList="filePiclist" :sort="true" @dragList="dragFun"></preview-img>
          </div>
        </div>
      </Card>

      <Card class="box-card">
        <p slot="title">上传图片</p>
        <div class="flex-div">
          <div class="mr10">
            <div>图片上传：</div>
            <button-upload type="pic" v-model="uploadList" :options="{limit:10}"></button-upload>
          </div>
          <div class="mr10">
            <div>按钮上传：</div>
            <!-- type 可不传 默认为按钮 -->
            <button-upload type="btn" v-model="uploadList" :options="{limit:10}"></button-upload>
          </div>
          <div class="mr10">
            <div>按钮自定义文本：</div>
            <!-- type 可不传 默认为按钮 -->
            <button-upload type="btn" v-model="uploadList" :options="{limit:10}" :isDisabled="true">上传</button-upload>
          </div>
        </div>
      </Card>

      <Card class="box-card">
        <p slot="title">预览和上传一起</p>
        <div class="flex-div">
          <div class="mr10">
            <div>图片单张上传：</div>
            <upload-img v-model="singleList" :options="{ accept: 'image/*' }"></upload-img>
          </div>
          <div class="mr10">
            <div>图片多张上传：</div>
            <upload-img v-model="fileList" :options="{limit:10, accept: 'image/*'}"></upload-img>
          </div>
          <div class="mr10">
            <div>图片多张上传不可编辑：</div>
            <upload-img v-model="fileList" :options="{limit:10, accept: 'image/*'}" :isDisabled="true"></upload-img>
          </div>
          <div class="mr10">
            <div>图片拖拽：</div>
            <upload-img v-model="dragList" :options="{limit:10, accept: 'image/*'}" :sort="true" @dragFun="dragreturnList"></upload-img>
          </div>
        </div>
      </Card>

    </Card>
  </div>
</template>

<script>
import previewImg from '@/components/uploadImg/previewImg';
import buttonUpload from '@/components/uploadImg/buttonUpload';
import UploadImg from '@/components/uploadImg';
export default {
  name: "basic",
  components: { previewImg, buttonUpload, UploadImg },
  data () {
    return {
      filePiclist: [
        { url: 'http://testing.lapa.com.cn/pds-service/filenode/r/pds/permanentImg/000035/all/20210817/07/000035-f4f0a92a-af35-48d7-a822-d20c0305d90b.PNG' },
        { url: 'http://testing.lapa.com.cn/pds-service/filenode/r/pds/permanentImg/000035/all/20210817/07/000035-f4f0a92a-af35-48d7-a822-d20c0305d90b.PNG' }
      ],
      uploadList: [],
      fileList: [
        { url: 'http://testing.lapa.com.cn/pds-service/filenode/r/pds/permanentImg/000035/all/20210817/07/000035-f4f0a92a-af35-48d7-a822-d20c0305d90b.PNG' }
      ],
      singleList: [],
      dragList: [
        { url: 'http://testing.lapa.com.cn/pds-service/filenode/r/pds/permanentImg/000035/all/20210817/07/000035-f4f0a92a-af35-48d7-a822-d20c0305d90b.PNG' }
      ],
    };
  },
  methods: {
    // 拖拽改变顺序返回列表
    dragFun (list) {
      console.log(list, "拖拽列表")
    },
    dragreturnList (list) {
      this.dragList = this.$common.copy(list);
    }
  },
};
</script>

<style lang="less" scoped>
.flex-div {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
</style>