<template>
  <div
    class="dyt-filter-dome"
    :style="`${!isExpand ? 'max-height:'+defaultHeight * filterRow+'px;' : ''}`"
    :ref="`dome-${dytRefFilter}`"
    :class="{'dyt-filter-expand': isExpand}"
    @scroll="dytFilterDomeScroll"
  >
    <Spin fix v-if="loading"></Spin>
    <div class="filter-search-btn" :ref="`filter-btn-${dytRefFilter}`">
      <div :ref="`serach-${dytRefFilter}`">
        <slot name="operation">
          <Button type="primary" icon="md-search" @click="btnsHand('submit')" class="operation-button">查询</Button>
          <Button style="marginLeft:10px;" icon="md-refresh" @click="btnsHand('refresh')" class="operation-button">重置</Button>
        </slot>
      </div>
      <Button type="primary" class="expand-button" @click="expandHand" v-show="showMoreBtn" :title="`${isExpand?'收起':'展开'}`">
        <Icon v-if="!isExpand" type="md-arrow-dropdown" />
        <Icon v-else type="md-arrow-dropup" />
      </Button>
    </div>
    <div class="filter-main" :ref="`dytFilter-${dytRefFilter}`">
      <slot />
    </div>
  </div>
</template>
<script>

export default {
  name: 'dytFilter',
  components: {},
  data () {
    return {
      dytRefFilter: `${new Date().getTime()}`,
      loading: false,
      isExpand: false,
      showMoreBtn: true,
      defaultHeight: 43,
      tableHeight: null,
      fixedScrollTopTime: null
    }
  },
  computed: {},
  props: {
    filterRow: {
      type: Number,
      default: 1
    },
    // 当前页如有多个表格，请增加表格标识，并将标识名传过来
    tableClassName: {
      type: String,
      default: '#app'
    },
    handleTable: {
      type: Boolean,
      default: true
    }
  },
  watch: {},
  created () {},
  activated() {
    this.resizeHand();
    this.setFixedScrollTop();
  },
  mounted () {
    this.init();
    // 订阅 resize 事件
    window.addEventListener('resize', this.resizeHand);
    this.setFixedScrollTop();
  },
  // 组件销毁前
  beforeDestroy () {
    this.fixedScrollTopTime && clearInterval(this.fixedScrollTopTime);
    // 通过有名函数 解除事件订阅
    window.removeEventListener('resize', this.resizeHand);
    const tableDome = document.querySelectorAll(`${this.tableClassName ? `${this.tableClassName} .ivu-table-wrapper` : '.ivu-table-wrapper'}`);
    tableDome.forEach(item => {
      item.querySelector('.ivu-table-body') && item.querySelector('.ivu-table-body').removeEventListener('scroll', this.documentScroll);
    })
  },
  methods: {
    // 固定列滚动位置保持和主列表滚动位置一致
    setFixedScrollTop () {
      this.fixedScrollTopTime && clearInterval(this.fixedScrollTopTime);
      this.fixedScrollTopTime = setInterval(() => {
        const tableDome = document.querySelectorAll(`${this.tableClassName ? `${this.tableClassName} .ivu-table-wrapper` : '.ivu-table-wrapper'}`);
        if (this.$common.isEmpty(tableDome)) return;
        let body = null;
        let fixedBody = null;
        tableDome.forEach(item => {
          body = item.querySelector('.ivu-table-body');
          if (!this.$common.isEmpty(body)) {
            fixedBody = item.querySelectorAll('.ivu-table-fixed-body');
            if (!this.$common.isEmpty(fixedBody)) {
              fixedBody.forEach(item => {
                item.scrollTop = body.scrollTop || 0;
              });
            }
          }
        })
      }, 200);
    },
    // 初始化模块
    init () {
      this.$nextTick(() => {
        // this.$slots.default && this.$slots.default.forEach(solt => {
        //   console.log('修改前：', solt.elm.className)
        //   if (solt.elm.className && !solt.elm.className.includes('filter-main-item')) {
        //     solt.elm.className = `${solt.elm.className} filter-main-item`;
        //   }
        //   console.log('修改后：', solt.elm.className)
        // })
        this.resizeHand();
      })
    },
    // 展开收起
    expandHand () {
      this.isExpand = !this.isExpand;
      this.$nextTick(() => {
        const dome = this.$refs[`dome-${this.dytRefFilter}`];
        if (dome) {
          // this.btnDistance();
          // this.$emit('width-change', {
          //   isExpand: this.isExpand,
          //   filterWidth: dome.offsetWidth,
          //   filterHeigth: dome.offsetHeight
          // })
          this.$nextTick(() => {
            // this.init(true);
            this.tableHeightHand(this.tableClassName);
            // this.resizeHand();
            this.$nextTick(() => {
              this.$emit('expand', {
                isExpand: this.isExpand,
                filterWidth: dome.offsetWidth,
                filterHeigth: dome.offsetHeight
              })
            })
          })
        }
      })
    },
    // 当展开时，设置适应的表格高度
    tableHeightHand (domeClass, type = false) {
      if (!this.handleTable) return;
      const dome = this.$refs[`dome-${this.dytRefFilter}`];
      let tableDome = document.querySelectorAll(`${domeClass ? `${domeClass} .ivu-table-wrapper` : '.ivu-table-wrapper'}`);
      if (dome && tableDome.length > 0) {
        tableDome.forEach(item => {
          const fixedBody = item.querySelectorAll('.ivu-table-fixed-body');
          // 获取初始高度
          const changeHeight = [
            item.querySelector('.ivu-table-body'),
            item.querySelector('.ivu-table-tip'),
            item.querySelector('.ivu-table-tip>table>tbody>tr>td')
          ].filter(dom => !!dom)
          if (!changeHeight[0]) return;
          !type && changeHeight[0].removeEventListener('scroll', this.documentScroll);
          !type && changeHeight[0].addEventListener('scroll', this.documentScroll);
          if (!item.tableHeight && this.isExpand) {
            const headDom = item.querySelector('.ivu-table-header');
            item.tableHeight = item.offsetHeight || parseInt(item.style.height || '0');
            const headDomH = headDom ? headDom.offsetHeight || parseInt(item.style.height || '0') : 0;
            changeHeight.forEach(cDome => {
              if (cDome && !cDome.tableHeight) {
                cDome.tableHeight = (item.tableHeight - headDomH > 200 ? item.tableHeight - headDomH : 200);
              }
            });
            fixedBody.forEach(cDome => {
              if (cDome && !cDome.tableHeight) {
                cDome.tableHeight = (item.tableHeight - headDomH > 200 ? item.tableHeight - headDomH : 200);
              }
            })
          }
          const difference = (dome.offsetHeight - this.defaultHeight * this.filterRow);
          if (item.tableHeight) {
            item.style.height = `${item.tableHeight - difference}px`;
            changeHeight.forEach(cDome => {
              if (cDome && cDome.tableHeight) {
                cDome.style.height = `${cDome.tableHeight - difference}px`;
              }
            })
            // 固定列高度设置
            fixedBody.forEach(cDome => {
              if (cDome && cDome.tableHeight) {
                cDome.style.height = `${cDome.tableHeight - difference - 10}px`;
              }
            })
          }
        })
      }
    },
    // 每次点击展开或收起都会绑定一次, 满足条件时解除绑定
    documentScroll (dom) {
      const doms = dom.target.parentNode.querySelector('.ivu-table-fixed-body');
      if (!doms || dom.target.parentNode.offsetHeight > doms.offsetHeight) {
        dom.target.removeEventListener('scroll', this.documentScroll);
        return;
      }
      this.tableHeightHand(this.tableClassName, true);
    },
    // 窗口大小变化处理
    resizeHand (type) {
      this.$nextTick(() => {
        const dome = this.$refs[`dome-${this.dytRefFilter}`];
        const main = this.$refs[`dytFilter-${this.dytRefFilter}`];
        this.showMoreBtn = main.offsetHeight > (this.defaultHeight * (this.filterRow + 0.3));
        this.$nextTick(() => {
          this.btnDistance();
          this.tableHeightHand(this.tableClassName);
          this.$nextTick(() => {
            this.$emit('width-change', {
              isExpand: this.isExpand,
              filterWidth: dome.offsetWidth,
              filterHeigth: dome.offsetHeight
            })
          })
        })
      })
    },
    btnDistance () {
      const tool = {
        hand: () => {
          this.$nextTick(() => {
            const dome = this.$refs[`dome-${this.dytRefFilter}`];
            const btnDome = this.$refs[`filter-btn-${this.dytRefFilter}`];
            if (this.$slots.default && dome && btnDome) {
              let leftBistance = 0;
              this.$slots.default.forEach(solt => {
                if (solt.elm !== '<!---->' && this.$slots.default[0].elm.offsetTop == solt.elm.offsetTop) {
                  leftBistance += (solt.elm.offsetWidth + 10);
                }
              })
              leftBistance = leftBistance + btnDome.offsetWidth - dome.offsetWidth;
              this.$refs[`serach-${this.dytRefFilter}`].style.transform = `translateX(${leftBistance}px)`;
            }
          })
        }
      }
      // 由于页面渲染问题，，目前没有找到对应解决方法，暂时使用定时器，后续优化
      this.$nextTick(() => {
        tool.hand();
        setTimeout(() => {
          tool.hand()
        }, 100)
        setTimeout(() => {
          tool.hand()
        }, 200)
        setTimeout(() => {
          tool.hand()
        }, 400)
        setTimeout(() => {
          tool.hand()
        }, 800)
      })
    },
    btnsHand (str) {
      this.$emit('operation', str)
    },
    // 当发生滚动时，重置为0
    dytFilterDomeScroll (e) {
      if (!this.isExpand && e.target.scrollTop !== 0) {
        e.target.scrollTop = 0
      }
    }
  }
};
</script>
<style scoped lang="less">
.dyt-filter-dome{
  // padding-top: 10px;
  overflow: hidden;
  .filter-search-btn{
    position: relative;
    display: flex;
    float: right;
    margin: 0;
    padding-left: 17px;
    margin-bottom: 11px;
    z-index: 10;
    .operation-button{
      i{
        font-size: 25px;
      }
    }
    .expand-button{
      margin-left:10px;
      padding: 0 5px;
      font-size: 25px;
      i {
        vertical-align: 0;
      }
    }
  }
  .filter-main{
    position: relative;
    z-index: 9;
    .ivu-form-item{
      position: relative;
      display: inline-block;
      margin: 0 10px 11px 0;
      vertical-align: top;
    }
  }
}
</style>
<style lang="less">
.dyt-filter-dome{
  .filter-main{
    .ivu-form-item-error-tip{
      top: auto;
      bottom: -13px;
      font-size: 12px;
      transform: scale(0.9);
    }
  }
}

.ivu-form {
  .dyt-filter-dome{
    // .ivu-form-item-label{
    //   position: absolute;
    //   width: auto !important;
    //   top: 0;
    //   left: 10px;
    //   z-index: 1;
    //   padding: 0 .2em;
    //   font-size: 12px;
    //   line-height: 12px;
    //   color: #888;
    //   white-space: nowrap;
    //   cursor: default;
    //   background-color: #fff;
    //   opacity: 1;
    //   transform: translateY(-50%) scale(.9);
    //   transform-origin: center bottom;
    // }
    // .ivu-form-item-content{
    //   margin-left: 0 !important;
    // }
    // select - satrt
    .ivu-select-default.ivu-select-multiple{
      .ivu-select-selection{
        height: 32px;
        overflow: hidden;
      }
    }
    // end
    // treeSelect  start
    .vue-treeselect {
      height: 33px;
      border: 1px solid #ddd;
      border-radius: 5px;
      overflow: hidden;
    }
    .vue-treeselect__control{
      border: none;
    }
    // end
    .filter-search-btn{
      .operation-button{
        i{
          font-size: 18px;
        }
      }
    }
    textarea.ivu-input{
      height: 32px;
    }
    // 展开
    &.dyt-filter-expand{
      .ivu-select-default.ivu-select-multiple{
        .ivu-select-selection{
          height: auto;
        }
      }
      .vue-treeselect {
        height: auto;
      }
      textarea.ivu-input{
        height: auto;
      }
    }
  }
}
</style>
