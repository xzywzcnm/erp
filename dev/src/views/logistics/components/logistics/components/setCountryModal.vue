<template>
  <Modal v-model="pageVisible" width="1000" title="国家选择" class="page-modal-main">
    <div class="page-modal-body">
      <Spin fix v-if="modalLoading"></Spin>
      <Form ref="modalFormRef" :model="modalFormData" :rules="modalFormRule" label-position="right" :label-width="0" @submit.native.prevent>
        <div class="country-chose-body">
          <div class="tag-content">
            <span class="tag-chose" @click="switchoverTag('allType')" :class="{ 'tagChoseActive': chooseTag == 'allType' }">全部</span>
            <span
              class="tag-chose"
              v-for="(item, index) in countryData"
              :key="index"
              :class="{ 'tagChoseActive': chooseTag == item.zoneCode }"
              @click="switchoverTag(item.zoneCode)"
            >{{ item.zoneCnName }}</span>
            <Input v-model="searchStr"  placeholder="支持中文、英文、二字码搜索" @on-enter="searchCountryHandel" style="width: 190px;" clearable />
          </div>
          <div class="country-chose-content">
            <div class="mb10" v-if="visibleCountryList.length != 0">
              <Button type="primary" size="small" @click="setAllCountryList">{{ isAllChecked ? '取消全选' : '全选' }}</Button>
            </div>
            <CheckboxGroup v-model="modalFormData.choseCountryId" v-if="visibleCountryList.length != 0">
              <template v-for="(item, index) in visibleCountryList">
                <Tooltip
                  v-if="disableCountry.includes(item.countryId)"
                  placement="right-start"
                  :transfer="true"
                  max-width="200px"
                  :key="`${item.countryId}-${index}`"
                >
                  <Checkbox :label="item.countryId" :disabled="true">
                    <span>{{ item.cnName }}</span>
                  </Checkbox>
                  <div slot="content">该国家已存在物流限制</div>
                </Tooltip>
                <Checkbox v-else :label="item.countryId" :key="`c-${item.countryId}-${index}`">
                  <span>{{ item.cnName }}</span>
                </Checkbox>
              </template>
            </CheckboxGroup>
            <div v-else style="color: #979797;">
              <span v-if="!$common.isEmpty(confirmStr)">
                <span>暂无与</span>
                <span style="color: #f20;"> {{ confirmStr }} </span>
                <span>相关的国家地区</span>
              </span>
              <span v-else>暂无数据！</span>
            </div>
            <div class="mt20 chosed-country">
              <div class="mb10">已选中国家：</div>
              <CheckboxGroup v-model="modalFormData.choseCountryId" v-if="choseCountryInfo.length != 0">
                <Checkbox v-for="(item, index) in choseCountryInfo" :label="item.countryId" :key="`cd-${item.countryId}-${index}`">
                  <span>{{ item.cnName }}</span>
                </Checkbox>
              </CheckboxGroup>
              <div style="color: #979797;" v-if="choseCountryInfo.length == 0">未选中任何国家地区</div>
              <div class="mt10" v-if="choseCountryInfo.length != 0" style="text-align: right;">
                <Button type="primary" size="small" @click="clearChoseCountry">清空已选</Button>
              </div>
            </div>
          </div>
        </div>
      </Form>
    </div>
    <div slot="footer">
      <Button @click="pageVisible = false">取消</Button>
      <Button type="primary" @click="saveModalInfo" :disabled="modalLoading">确定</Button>
    </div>
  </Modal>
</template>
<script>
// import api from '@/api/api';

export default {
  name: 'setCountryModal',
  props: {
    modalVisible: { type: Boolean, default: false },
    modalData: {
      type: Object,
      default: () => {
        return {};
      }
    },
  },
  data () {
    return {
      modalLoading: false,
      pageVisible: false,
      chooseTag: 'allType',
      modalFormData: {
        choseCountryId: []
      },
      modalFormRule: {},
      searchStr: '',
      confirmStr: '',
    };
  },
  computed: {
    // 地区信息
    countryData () {
      if (this.$common.isEmpty(this.modalData) || this.$common.isEmpty(this.modalData.countryData)) return [];
      return this.modalData.countryData;
    },
    // 全部国家信息
    allCountryInfoList () {
      if (this.$common.isEmpty(this.countryData)) return [];
      let list = [];
      this.countryData.forEach(item => {
        if (item.countries) {
          list.push(item.countries);
        }
      });
      list = this.$common.flat(list);
      return list;
    },
    // 禁用的国家
    disableCountry () {
      if (this.$common.isEmpty(this.modalData) || this.$common.isEmpty(this.modalData.disableId)) return [];
      return this.modalData.disableId;
    },
    // 当前数据
    pageRes () {
      if (this.$common.isEmpty(this.modalData) || this.$common.isEmpty(this.modalData.data)) return {};
      return this.modalData.data;
    },
    // 可见国家
    visibleCountryList () {
      let dataList = [];
      if (this.chooseTag == 'allType') {
        dataList = this.allCountryInfoList;
      } else {
        dataList = this.countryData.find(f => this.chooseTag == f.zoneCode);
        dataList = this.$common.isEmpty(dataList) ? [] : (dataList.countries || []);
      }
      if (this.$common.isEmpty(this.confirmStr)) {
        return dataList;
      }
      dataList = dataList.filter(item => {
        return item.cnName.includes(this.confirmStr) || item.twoCode.includes(this.confirmStr) || item.enName.includes(this.confirmStr)
      });
      return dataList;
    },
    // 当前可见国家是否全选
    isAllChecked () {
      const notCheck = this.visibleCountryList.find(item => !this.modalFormData.choseCountryId.includes(item.countryId));
      return this.$common.isEmpty(notCheck);
    },
    // 已选中的国家
    choseCountryInfo () {
      const choseInfo = this.allCountryInfoList.filter(item => this.modalFormData.choseCountryId.includes(item.countryId));
      return choseInfo;
    }

  },
  watch: {
    modalVisible: {
      deep: true,
      immediate: true,
      handler (val) {
        if (!val) return;
        this.openWarnModal();
      }
    },
    pageVisible: {
      deep: true,
      immediate: true,
      handler (val) {
        this.$emit('update:modalVisible', val);
        if (val) return;
        this.closeWarnModal();
      }
    }
  },
  created () {},
  mounted () {},
  methods: {
    // 打开弹窗
    openWarnModal () {
      this.pageVisible = true;
      this.modalLoading = true;
      this.modalFormData.choseCountryId = [];
      this.$nextTick(() => {
        this.initData().finally(() => {
          this.modalLoading = false;
        })
      });
    },
    // 获取数据或初始化数据
    initData () {
      return new Promise((resolve) => {
        this.modalFormData.choseCountryId = (this.pageRes.countryList || []).map(m => m.countryId);
        resolve({ state: 'finally' });
      });
    },
    // 关闭弹窗
    closeWarnModal () {
      this.modalLoading = false;
      this.pageVisible = false;
    },
    // 切换地区标签
    switchoverTag (tabName) {
      this.searchStr = '';
      this.confirmStr = '';
      this.chooseTag = tabName;
    },
    // 搜索国家地区
    searchCountryHandel () {
      this.confirmStr = this.searchStr;
    },
    // 全选当前可是国家
    setAllCountryList () {
      const choseId = this.visibleCountryList.map(m => m.countryId);
      if (this.isAllChecked) {
        this.modalFormData.choseCountryId = this.modalFormData.choseCountryId.filter(id => !choseId.includes(id));
        return;
      }
      this.modalFormData.choseCountryId = this.$common.arrRemoveRepeat([...this.modalFormData.choseCountryId, ...choseId]);
    },
    // 清空已选国家
    clearChoseCountry () {
      this.modalFormData.choseCountryId = [];
    },
    // 保存信息
    saveModalInfo () {
      if (this.$common.isEmpty(this.choseCountryInfo)) return this.$Message.error('国家(地区)不能为空，请选中国家(地区)');
      this.$emit('countryConfirm', {
        data: this.$common.copy(this.choseCountryInfo),
        key: this.modalData.key || ''
      });
      this.$nextTick(() => {
        this.pageVisible = false;
      })
    },
  }
};
</script>
<style lang="less" scoped>
.page-modal-body{
  position: relative;
  .country-chose-body{
    position: relative;
    height: calc(100vh - 320px);
    overflow: auto;
  }
  .country-chose-content{
    padding: 10px 15px;
    :deep(.ivu-checkbox-group) {
      display: grid;
      grid-template-columns: repeat(6, auto);
      gap: 0;
    }
  }
  .chosed-country {
    padding: 10px;
    box-shadow: 0 0 5px 1px #ccc;
    border-radius: 5px;
  }
  .tag-content{
    position: sticky;
    display: flex;
    top: 0;
    width: 100%;
    padding: 5px 8px;
    align-items: center;
    background: #fff;
    box-shadow: 0 1px 5px 1px #ccc;
    z-index: 10;
  }
  .tag-chose{
    line-height: 1.4em;
  }
}
.page-modal-main {
  :deep(.ivu-modal-body) {
    margin: 0;
    padding: 0;
  }
}
</style>
