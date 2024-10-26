<template >
  <div class="shipping_method_box" v-if="upOrDown">
    <Card title="选择邮寄方式">
      <div class="option_btn" @click="switchBtn">
        <Icon size="20" type="ios-arrow-back" />
      </div>
      <div style="cursor: pointer; margin: 0 0 0 18px; color: #2D8CF0;" v-if="treeData.length > 0"
        @click="exchangeTree">
        {{ showTree ? '全部收起' : '全部展开' }}
      </div>
      <Tree :data="treeData" v-if="showCheckbox" :show-checkbox="showCheckbox" @on-check-change="selectCheckBox"
        @on-select-change="selectChange" @on-toggle-expand="changeExpand" :check-directly="true"
        :render="renderCheckContent"></Tree>
      <Tree :data="treeData" v-else :show-checkbox="showCheckbox" @on-select-change="selectChange"
        @on-toggle-expand="changeExpand" :render="renderContent" :check-directly="true"></Tree>
    </Card>
  </div>
</template>

<style lang="less" scoped>
.shipping_method_box {
  width: 22%;
  position: relative;

  :deep(.ivu-card) {
    // max-height: 652px;
    // overflow-y: auto;
    height: 100%;
    display: flex;
    flex-direction: column;

    .ivu-card-body {
      flex: 1;
      overflow: auto;

    }
  }

  .option_btn {
    height: 50px;
    position: absolute;
    top: 0;
    right: 0;
    background-color: #2b85e4;
    color: #fff;
    width: 25px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
}
</style>

<script type="text/ecmascript-6">
export default {
  props: {
    upOrDown: {
      // 默认展示邮寄方式
      type: Boolean,
      default: true
    },
    treeData: {
      // tree的数据
      type: Array,
      default: () => {
        return [];
      }
    },
    showCheckbox: {
      // 设置对节点进行勾选
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      showTree: true
    };
  },
  methods: {
    // 展开与收起邮寄方式
    switchBtn () {
      this.$emit('switchOption', !this.upOrDown);
    },
    // 选中的邮寄方式--复选框模式
    selectCheckBox (arr) {
      this.$emit('selectCheckBox', arr);
    },
    // 选中的邮寄方式--非复选框模式
    selectChange (data) {
      this.$emit('selectChange', data);
    },
    // 处理checkbox--tree节点的数据
    renderCheckContent (h, { root, node, data }) {
      let number = data.pickingNumber ? '(' + data.pickingNumber + ')' : '';
      let title = data.title + number;
      let content = [
        h(
          'div',
          {
            style: {
              maxWidth: '240px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }
          },
          [
            h('span', data.title),
            h(
              'span',
              {
                style: {
                  marginLeft: '2px',
                  display: data.pickingNumber ? 'inline-block' : 'none',
                  color: '#f00'
                }
              },
              '(' + data.pickingNumber + ')'
            )
          ]
        )
      ];
      // eslint-disable-next-line no-control-regex
      let showTooltip = data.title.replace(/[^\x00-\xff]/gi, '**').length > 30;
      let ordinary = [
        h('span', data.title),
        h(
          'span',
          {
            style: {
              marginLeft: '2px',
              display: data.pickingNumber ? 'inline-block' : 'none',
              color: '#f00'
            }
          },
          '(' + data.pickingNumber + ')'
        )
      ];
      let Tooltip = h(
        'Tooltip',
        {
          props: {
            placement: 'top',
            maxWidth: 250,
            transfer: true
          }
        },
        [
          content,
          h(
            'span',
            {
              slot: 'content',
              style: {
                whiteSpace: 'normal',
                wordBreak: 'break-all'
              }
            },
            title
          )
        ]
      );
      return h(
        'div',
        {
          style: {
            cursor: 'pointer',
            whiteSpace: 'initial'
          }
        },
        [showTooltip ? Tooltip : ordinary]
      );
    },
    // 处理tree节点的数据
    renderContent (h, { root, node, data }) {
      let content = [
        h(
          'div',
          {
            style: {
              maxWidth: '240px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }
          },
          [h('span', data.title)]
        )
      ];
      // eslint-disable-next-line no-control-regex
      let showTooltip = data.title.replace(/[^\x00-\xff]/gi, '**').length > 40;
      let ordinary = [h('span', data.title)];
      let Tooltip = h(
        'Tooltip',
        {
          props: {
            placement: 'top',
            maxWidth: 250,
            transfer: true
          }
        },
        [
          content,
          h(
            'span',
            {
              slot: 'content',
              style: {
                whiteSpace: 'normal',
                wordBreak: 'break-all'
              }
            },
            data.title
          )
        ]
      );
      return h(
        'div',
        {
          style: {
            cursor: 'pointer',
            whiteSpace: 'initial'
          }
        },
        [showTooltip ? Tooltip : ordinary]
      );
    },
    changeExpand (data) {
      if (data.nodeKey === 0) {
        this.showTree = data.expand;
      }
    },
    // 展开或合并树，当flag为true时全部展开，flag为false时全部合并
    exchangeTree () {
      this.showTree = !this.showTree;
      this.treeData = this.treeChangeExpand(this.treeData, this.showTree);
    },
    // 递归给树设置expand
    treeChangeExpand (treeData, flag) {
      let v = this;
      for (let i = 0; i < treeData.length; i++) {
        v.$set(treeData[i], 'expand', flag);
        if (treeData[i].children) {
          treeData[i].children = v.treeChangeExpand(treeData[i].children, flag);
        }
      }
      return treeData;
    }
  }
};
</script>
