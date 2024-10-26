<template>
  <div class="sizeMergeTypeManage">
    <Tabs :value="activeTab" type="card" @on-click="tabSwitchHand">
      <TabPane label="尺码管理" name="sizeManage">
        <div>
          <sizeManage v-if="visibleTab.sizeManage" />
        </div>
      </TabPane>
      <TabPane label="尺码类型管理" name="sizeTypeManage">
        <div>
          <sizeTypeManage v-if="visibleTab.sizeTypeManage" />
        </div>
      </TabPane>
      <TabPane label="尺码图片管理" name="sizePictureManage">
        <div>
          <sizePictureManage v-if="visibleTab.sizePictureManage" />
        </div>
      </TabPane>
      <TabPane label="尺码部位管理" name="sizePartsManage">
        <div>
          <sizePartsManage v-if="visibleTab.sizePartsManage" />
        </div>
      </TabPane>
      <TabPane label="分类尺码管理" name="sizeClassManage">
        <div>
          <sizeClassManage v-if="visibleTab.sizeClassManage && activeTab == 'sizeClassManage'" />
        </div>
      </TabPane>
    </Tabs>
  </div>
</template>

<script>
import sizeManage from './sizeManage';
import sizeTypeManage from './sizeTypeManage';
import sizePictureManage from './pictureManage/sizePictureManage';
import sizePartsManage from './partsManage/sizePartsManage';
import sizeClassManage from './classManage/sizeClassManage';

export default {
  name: 'sizeMergeTypeManage',
  components: { sizeManage, sizeTypeManage, sizePictureManage, sizePartsManage, sizeClassManage },
  data () {
    return {
      activeTab: 'sizeManage',
      visibleTab: {
        sizeManage: true,
        sizeTypeManage: false,
        sizePictureManage: false,
        sizePartsManage: false,
        sizeClassManage: false
      }
    }
  },
  activated () {},
  methods: {
    tabSwitchHand (name) {
      this.activeTab = name;
      this.visibleTab[name] = true;
    }
  }
}
</script>
<style lang="less">
.sizeMergeTypeManage{
  .ivu-tabs-nav{
    .ivu-tabs-tab-active{
      color: #fff;
      background: #2d8cf0;
    }
  }
  .ivu-tabs{
    &.ivu-tabs-card{
      &>.ivu-tabs-bar{
        .ivu-tabs-tab-active{
          color: #fff;
          background: #2d8cf0;
        }
      }
    }
  }
}
.modal-custom{
  .ivu-modal{
    max-width: 1200px;
    // top: 50%;
    // transform: translate(0, -50%);
  }
  .ivu-modal-body{
    max-height: calc(100vh - 300px);
    overflow: auto;
  }
}
</style>
