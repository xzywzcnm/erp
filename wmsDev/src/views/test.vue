<template >
  <div >
    {{obj}} <B ></B >
  </div >
</template>

<script>
import B from './test/B';
import C from './test/C';
import mixin from '@/components/mixin/common_mixin';
import { getWarehouseId } from '@/utils/getService';

export default {
  name: 'printds',
  mixins: [mixin],
  data () {
    return {
      printItemModel: 1,
      obj: {
        warehouseId: this.getWarehouseId(),
        abc: 'abc'
      },
      printList: [
        {
          refName: 'PRINT_001',
          content: '123',
          align: 0, // 0 左对齐 1 居中 2 右对齐
          left: 0,
          top: 0,
          fontSize: 12
        }, {
          refName: 'PRINT_002',
          content: 'D.36',
          align: 0, // 0 左对齐 1 居中 2 右对齐
          left: 0,
          right: 0,
          top: 0
        }
      ],
      printItem: {
        align: 0, // 0 左对齐 1 居中 2 右对齐
        left: 0,
        right: 0,
        top: 0
      },
      printAgainList: [
        {
          label: '左对齐',
          value: 0
        }, {
          label: '居中',
          value: 1
        }, {
          label: '右对齐',
          value: 2
        }
      ]
    };
  },
  created () {
  },
  mounted () {

  },
  components: {
    B,
    C
  },
  props: {},
  watch: {},
  methods: {
    getWarehouseId () {
      return getWarehouseId();
    },
    getT () {
      return '1234444';
    },
    dragentHandel (e) {
      console.log(e);
    },
    handlePrintItem (item) {
      /**
       * 设置打印的属性
       * item 打印的组件
       * */
      for (let key in this.printItem) {
        this.printItem[key] = item[key];
      }
    },
    printInit () {
      /**
       * 拖拽初始化
       * */
      let v = this;
      let arr = [];
      v.printList.forEach((n, i) => {
        let drag;
        // eslint-disable-next-line no-undef
        drag = new Draggabilly(v.$refs[n.refName][0], {
          // 选项...
          containment: true,
          axis: 'xy'
        });
        arr.push({
          el: drag, ...n
        });
      });
      arr.forEach((i, index) => {
        i.el.on('dragEnd', (e) => {
          // 设置位置
          console.log(e.target.style.left);
          let data = localStorage.getItem('printSetting') ? JSON.parse(localStorage.getItem('printSetting')) : [];
          if (v.arrHasAttrs(data, 'refName', i.refName)) {
            data.forEach(j => {
              if (j.refName === i.refName) {
                j.left = e.target.style.left;
                j.top = e.target.style.top;
                j.align = i.align;
              }
            });
          } else {
            data.push({
              refName: i.refName,
              left: e.target.style.left,
              top: e.target.style.top
            });
          }
          localStorage.setItem('positionPrint', JSON.stringify(data));
        });
      });
    },
    arrHasAttrs (arr, key, value) {
      /**
       * 判读是否存在这个值
       * */
      let obj = {};
      arr.forEach(i => {
        obj[i.key] = true;
      });
      return obj[value];
    }
  }
};
</script >

<style scoped >
.box {
  width: 500px;
  height: 500px;
  background-color: #999999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.print-box {
  width: 300px;
  height: 300px;
  background-color: #ffffff;
}

.print-operation {
  height: 100px;
  width: 500px;
  background-color: #999999;
}

.print-operation .ipt {
  width: 100px;
}

.draggable {
  cursor: move;
}

.draggable.is-pointer-down {
  background: #09F;
  z-index: 2; /* above other draggies */
}

.draggable.is-dragging {
  opacity: 0.7;
}
</style >
