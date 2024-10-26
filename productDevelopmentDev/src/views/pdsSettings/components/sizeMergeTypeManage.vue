<template>
  <div class="sizeMergeTypeManage">
    <Tabs :value="activeTab" type="card" @on-click="tabSwitchHand">
      <TabPane label="尺码管理" name="sizeManage">
        <!-- <div>
          <sizeManage v-if="visibleTab.sizeManage" /> 
        </div> -->
      </TabPane>
      <TabPane label="尺码类型管理" name="sizeTypeManage">
        <!-- <div>
          <sizeTypeManage v-if="visibleTab.sizeTypeManage" />
        </div> -->
      </TabPane>
      <TabPane label="尺码图片管理" name="sizePictureManage">
        <!-- <div>
          <sizePictureManage v-if="visibleTab.sizePictureManage" />
        </div> -->
      </TabPane>
      <TabPane label="尺码部位管理" name="sizePartsManage">
        <!-- <div>
          <sizePartsManage v-if="visibleTab.sizePartsManage" />
        </div> -->
      </TabPane>
      <TabPane label="分类尺码管理" name="sizeClassManage">
        <!-- <div>
          <sizeClassManage v-if="visibleTab.sizeClassManage && activeTab == 'sizeClassManage'" />
        </div> -->
      </TabPane>
    </Tabs>
    <div class="tab-pane-content">
      <div v-for="(item, index) in Object.keys(visibleTab)" :key="`${item}-${index}`" class="tab-pane-item"
        :class="{ 'tab-pane-item-visible': activeTab === item }">

        <!-- 尺码管理 -->
        <sizeManage v-if="item === 'sizeManage' && visibleTab.sizeManage" />
        <!-- 尺码类型管理 -->
        <sizeTypeManage v-if="item === 'sizeTypeManage' && visibleTab.sizeTypeManage" />
        <!-- 尺码图片管理 -->
        <sizePictureManage v-if="item === 'sizePictureManage' && visibleTab.sizePictureManage" />
        <!-- 尺码部位管理 -->
        <sizePartsManage v-if="item === 'sizePartsManage' && visibleTab.sizePartsManage" />
        <!-- 分类尺码管理 -->
        <sizeClassManage
          v-if="item === 'sizeClassManage' && visibleTab.sizeClassManage && activeTab == 'sizeClassManage'" />
      </div>
    </div>
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
  data() {
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
  activated() { },
  methods: {
    tabSwitchHand(name) {
      this.activeTab = name;
      this.visibleTab[name] = true;
    }
  }
}
</script>
<style lang="less">
.sizeMergeTypeManage {
  margin: 0 12px;

  .ivu-tabs-nav {
    .ivu-tabs-tab-active {
      color: #fff;
      background: #2d8cf0;
    }
  }

  .ivu-tabs {
    &.ivu-tabs-card {
      &>.ivu-tabs-bar {
        .ivu-tabs-tab-active {
          color: #fff;
          background: #2d8cf0;
        }
      }
    }
  }
}

.modal-custom {
  .ivu-modal {
    max-width: 1200px;
    // top: 50%;
    // transform: translate(0, -50%);
  }

  .ivu-modal-body {
    max-height: calc(100vh - 300px);
    overflow: auto;
  }
}
</style>
<style lang="less" scoped>
.sizeMergeTypeManage {
  height: 100%;
}

.tab-pane-content {
  position: relative;
  height: calc(100% - 48px);

  .tab-pane-item {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background: #fff;
    z-index: 1;
  }

  .tab-pane-item-visible {
    visibility: visible;
    z-index: 2;
  }
}
</style>
