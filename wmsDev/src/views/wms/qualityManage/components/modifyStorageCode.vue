<template>
  <div>
    <Modal v-model="isVisible" title="修改存放编码" :width="1200" :mask-closable="false" class="modifyStorageCodeDialog">
      <div>
        <commonForm :data="storageCodeInfo">
          <div class="mt10 autoLong">
            <FormItem label="存放编码:">
              <div class="code-table">
                <div v-for="(trList, listIndex) in list" :key="listIndex" class="code-item"
                  :class="{ mt20: listIndex == 2 }">
                  <div class="code-tr" :class="{ mb10: listIndex < 2 }" v-for="(tdList, trIndex) in trList"
                    :key="trIndex">
                    <!-- 框占用后不可选，架位占用可选 -->
                    <div class="code-td" v-for="(item, index) in tdList" :key="index"
                      :class="{ 'code-td-active': item.checked == 1, 'code-top-none': item.slotType == 1 && trIndex > 0, 'code-unclick': item.slotType == 1 && item.slotStatus == 1 }"
                      @click="tdClick(listIndex, trIndex, index)">
                      {{ storageCodeShow(item) }}
                    </div>
                  </div>
                </div>
              </div>
            </FormItem>
          </div>
        </commonForm>
        <Spin size="large" fix v-if="pageLoading"></Spin>
      </div>
      <div slot="footer">
        <Button type="primary" @click="confirm" :loading="loading">确 定</Button>
        <Button @click="isVisible = false">取 消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import api from '@/api/api';
import { getWarehouseId } from '@/utils/getService';
import commonForm from './commonForm';
export default {
  name: 'modifyStorageCode',
  components: { commonForm },
  props: {
    modelVisible: {
      type: Boolean,
      default() {
        return false
      }
    },
    data: {
      type: Object,
      default() {
        return {}
      }
    },
  },
  data() {
    return {
      loading: false,
      isVisible: false,
      purchaserList: {}, // 采购人员
      list: [],
      warehouseId: getWarehouseId(), // 仓库id
      storageCodeInfo: {}, // 编码信息
      pageLoading: false,
      activeItem: {},
    }
  },
  watch: {
    modelVisible: {
      handler(val) {
        val && this.open();
      },
      deep: true
    },
    isVisible: {
      handler(val) {
        if (val) return;
        this.$emit('update:modelVisible', val);
      },
      deep: true
    },
  },
  methods: {
    // 窗口打开
    open() {
      this.isVisible = true;
      this.reset();
      this.getPurchaserList().then(() => {
        this.getDetail();
      })
    },
    reset() {
      this.list = [];
      this.activeItem = this.storageCodeInfo = {};
    },
    // 获取采购人员列表
    getPurchaserList() {
      return new Promise((resolve) => {
        this.$store.dispatch('getPurchaserList').then(res => {
          this.purchaserList = res || {};
        }).finally(() => {
          resolve();
        })
      })
    },
    // 获取详情
    getDetail() {
      this.pageLoading = true;
      let { receiptCheckId, slotId } = this.data;
      this.axios.get(`${api.getGoodsShelfSlot}/${this.warehouseId}`, { params: { receiptCheckId } })
        .then(({ data }) => {
          if (!(data && data.code === 0)) return;
          let temp = data.datas || {};
          // 处理采购员
          let receiptInfoVO = temp.receiptCheckStoreInfoVO || {};
          if (receiptInfoVO.purchaserId && this.purchaserList[receiptInfoVO.purchaserId]) {
            receiptInfoVO.purchaserId = this.purchaserList[receiptInfoVO.purchaserId].userName;
          }
          this.storageCodeInfo = receiptInfoVO;
          // 处理框展示
          let boxList = temp.goodsShelfSlots || [];
          let [newList, index] = [[], 0];
          let fun = () => {
            let pageSize = index * 10;
            let list = boxList.slice(pageSize, pageSize + 10);
            if (list.length) {
              newList.push(list);
              index++;
              fun();
            }
          }
          fun();
          let item = {};
          let allList = [...temp.goodsShelfList || [], newList];
          this.list = allList.map(trList => {
            trList.map(tdList => {
              tdList.map(td => {
                let slot = slotId === td.slotId;
                td.checked = slot;
                slot && (item = this.$common.copy(td));
                return td;
              })
              return tdList;
            })
            return trList;
          })
          this.activeItem = item;
        }).finally(() => {
          this.pageLoading = false;
        })
    },
    // 保存
    confirm() {
      let { slotId } = this.activeItem || {};
      if (!slotId) {
        this.$Message.error('必须要选择一个存放编码~');
        return false;
      }
      let data = this.data || {};
      if (slotId === data.slotId) {
        this.$Message.warning('存放编码未变更~');
        return false;
      }
      // console.log(this.data);
      this.loading = true;
      this.axios.put(api.updateReceiptCheckStoreCode, { slotId, receiptCheckId: data.receiptCheckId }).then(({ data }) => {
        if (data.code !== 0) return;
        this.isVisible = false;
        this.$Message.success('操作成功~');
        let { returnStorageCode, checkSearch } = this.$listeners;
        returnStorageCode && this.$emit('returnStorageCode', this.activeItem);
        checkSearch && this.$emit('checkSearch');
      }).finally(() => {
        this.loading = false;
      });
    },
    // 点击
    tdClick(listIndex, trIndex, index) {
      let item = this.list[listIndex][trIndex][index];
      if (item.slotType == 1 && item.slotStatus == 1) return;// 框不可选
      this.activeItem = this.$common.copy(item);
      this.list.forEach((trList, trIndex) => {
        trList.forEach((tdList, tdIndex) => {
          tdList.forEach((td, index) => {
            this.$set(this.list[trIndex][tdIndex][index], 'checked', 0);
          })
        })
      })
      this.$set(this.list[listIndex][trIndex][index], 'checked', 1);
    },
    // 处理要显示的编码
    storageCodeShow(row) {
      if (row.slotType == 1 && row.slotCode) {
        return (row.slotCode < 10 ? '0' + row.slotCode : row.slotCode) + '框';
      }
      return row.slotCode || '';
    }
  }
}
</script>

<style lang="less">
.modifyStorageCodeDialog {
  .code-table {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -20px;

    .code-item {
      margin-left: 20px;
      margin-right: 20px;
    }

    .code-tr {
      display: flex;
      // margin-bottom: 10px;
    }

    .code-td {
      border: 1px solid #ccc;
      padding: 0px 2px;
      width: 80px;
      box-sizing: border-box;
      text-align: center;
      cursor: pointer;

      &:not(:last-child) {
        border-right: none;
      }
    }

    .code-top-none {
      border-top: none;
    }

    .code-unclick {
      color: #c5c8ce;
      background-color: #f7f7f7;
      border-color: #dcdee2;
    }

    .code-td-active {
      background-color: #2d8cf0;
      color: #fff;
    }
  }
}
</style>
