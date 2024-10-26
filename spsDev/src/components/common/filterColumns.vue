<template >
  <div class="filterColumns" >
    <Button size="small" class="fr" @click.stop="toggleFilterColumns" >
      <Icon type="ios-settings" style="margin-right: 5px;" ></Icon >
      <Icon :type="filterColumnsIcon" size="small" ></Icon >
    </Button >
    <transition name="slide-fade" >
      <Card
          class="filterColumnsBox"
          v-show="filterColumnsIcon!='ios-arrow-up'"
          @click.native.stop="hideCardStop"
          ref="filterCard" >
        <Row >
          <Col span="24" >
            <p style="border-bottom: 1px solid #ddd;" >自定义列显示<span
                style="color: #2d8cf0;cursor: pointer;float: right" @click="filterColumsReset" >恢复默认</span ></p >
          </Col >
          <Col span="12" v-for="(item,index) in columnsInit" :key="index" >
            <Checkbox
                v-model="item.check" :disabled="!!item.requiredCheck" @on-change="filterColumsChange" >{{ item.title }}
            </Checkbox >
          </Col >

        </Row >
      </Card >
    </transition>
  </div>
</template>

<script>
import Mixin from '@/components/mixin/common_mixin';
// filterHide 是否隐藏
export default {
  name: 'filterColumns',
  props: ['columns', 'filterName'], // table 列  本地缓存名字
  mixins: [Mixin],
  components: {},
  data () {
    return {
      locolColumus: [],
      columnsInit: [],
      filterColumnsIcon: 'ios-arrow-up'
    };
  },
  mounted () {
    let v = this;
    v.init();
  },
  watch: {
    filterName (n, o) {
      if (n && n !== o) {
        this.init();
      }
    }
  },
  methods: {
    init () {
      let v = this;
      v.columnsInit = v.columns;
      v.columnsInit.forEach(item => {
        item.check = false;
      });
      v.locolColumus = [];
      if (localStorage.getItem(v.filterName)) {
        let arr = JSON.parse(localStorage.getItem(v.filterName));
        // 由于双重循环的时候，遇到undefined会判断多一遍，所以需要一个标志来进行判断
        let isUndefinedExecuted = 0
        arr.forEach(item => {
          v.columnsInit.forEach(column => {
            if (item.key === column.key) {
              if(item.key === undefined) {
                isUndefinedExecuted++
              }
              // 当isUndefinedExecuted = 3或者= 2 的时候的情况下判断是否push进数组
              if (isUndefinedExecuted !== 3 && !(isUndefinedExecuted === 2 && column.key === undefined)) {
                column.check = true;
                v.locolColumus.push(column);
              }
            }
          });
        });
      } else {
        let arr = [];
        v.columns.forEach(item => {
          if (!item.filterHide || item.requiredCheck) {
            arr.push(item);
          }
        });
        v.locolColumus = arr;
        v.locolColumus.forEach(item => {
          item.check = true;
        });
      }
      v.$emit('setTableColumns', v.locolColumus);
      document.addEventListener('click', v.hideCard);
    },
    toggleFilterColumns () {
      let v = this;
      v.filterColumnsIcon === 'ios-arrow-down'
      ? v.filterColumnsIcon = 'ios-arrow-up'
      : v.filterColumnsIcon = 'ios-arrow-down';
    },
    hideCardStop () {
    },
    hideCard () {
      let v = this;
      v.filterColumnsIcon = 'ios-arrow-up';
    },
    filterColumsReset () {
      let v = this;
      v.columnsInit = [];
      setTimeout(() => {
        let arr = [];
        v.columnsInit = v.columns;
        v.columnsInit.forEach(item => {
          if (!item.filterHide) {
            item.check = true;
            arr.push(item);
          } else {
            item.check = false;
          }
        });
        localStorage.setItem(v.filterName, JSON.stringify(arr));
        v.$emit('setTableColumns', arr);
      }, 10);
    },
    filterColumsChange () {
      let arr = [];
      let v = this;
      v.columnsInit.forEach(item => {
        if (item.check) {
          arr.push(item);
        }
      });
      localStorage.setItem(v.filterName, JSON.stringify(arr));
      v.$emit('setTableColumns', arr);
    }
  },
  destroyed () {
    document.removeEventListener('click', this.hideCard);
  }
};
</script>

<style scoped >
.filterColumns {
  position: absolute;
  right: 10px;
  bottom: 8px;
  width: 100px;
  height: 32px;
}

.filterColumnsBox {
  position: absolute;
  right: 0;
  top: 26px;
  z-index: 10;
  width: 300px;
  background-color: #ffffff;
}
</style>
