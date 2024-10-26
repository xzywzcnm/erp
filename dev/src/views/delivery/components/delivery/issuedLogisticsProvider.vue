<template >
  <div>
    <div v-if="storeStatus && allStorelist !== [] && allStorelist !== null" class="selectStore">
      请选择仓库： <dyt-select v-model="selectStore" style="width:200px">
        <Option v-for="(item,index) in allStorelist" :value="item.warehouseId" :key="index">{{ item.warehouseName }}</Option>
      </dyt-select>
    </div>
    <div class="tabContainer commonFilter">
      <Tabs :animated="false">
        <Tab-pane :label="label1">
          <!-- <pending></pending> -->
          <pending :choiceStore="selectStore" :storeListDal="allStorelist"></pending>
        </Tab-pane>
        <Tab-pane :label="label2">
          <!-- <noPackageNum></noPackageNum> -->
          <noPackageNum :choiceStore="selectStore" :storeListDal="allStorelist"></noPackageNum>
        </Tab-pane>
      </Tabs>
    </div>
  </div>
</template>
<script>
import api from '@/api/api';
import pending from './pending';
import noPackageNum from './noPackageNum';
import Mixin from '@/components/mixin/common_mixin';
import publicService from '@/components/mixin/publicService_mixin';

export default {
  mixins: [Mixin, publicService],
  components: {
    pending,
    noPackageNum
  },
  data () {
    var self = this;
    return {
      pendingNum: 0,
      noPackageNum: 0,
      label1 (h) {
        return h('div', [
          h('span', '待申请'), h('Badge', {
            props: {
              dot: true,
              count: self.pendingNum
            }
          })
        ]);
      },
      label2 (h) {
        return h('div', [
          h('span', '运单号未获取'), h('Badge', {
            props: {
              dot: true,
              count: self.noPackageNum
            }
          })
        ]);
      }
    };
  },
  watch: {
    selectStore (n, o) {
      if (n !== o) {
        this.getBadge();
        sessionStorage.setItem('warehouseId', n);
      }
    }
  },
  methods: {
    getBadge () {
      let v = this;
      v.axios.get(api.get_issuedBadge + '?warehouseId=' + v.selectStore).then(response => {
        if (response.data.code === 0) {
          v.pendingNum = response.data.datas.notAddPackage;
          v.noPackageNum = response.data.datas.noTrackingNumber;
        }
      });
    }
  },
  mounted () {
    let v = this;
    v.getAllstore(0, 1).then(respones => {
      v.getBadge();
      sessionStorage.setItem('warehouseId', v.selectStore);
    });
  }
};
</script>
