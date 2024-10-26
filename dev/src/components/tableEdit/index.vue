<template>
  <div>
    <Modal :title="title" v-model="modelVisible" width="80%" :mask-closable="false">
      <div class="table-template">
        <div id="content"></div>
        <div class="mt10" style="text-align:center;">
          <Button type="primary" size="small" class="mr10" @click="insertHtmlAtCursor('left')">左插入列</Button>
          <Button type="primary" size="small" class="mr10" @click="insertHtmlAtCursor('right')">右插入列</Button>
          <Button type="error" size="small" class="mr10" @click="insertHtmlAtCursor('del')">列删除</Button>
          <Button type="primary" size="small" class="mr10" @click="insertHtmlAtCursor('top')">上插入行</Button>
          <Button type="primary" size="small" class="mr10" @click="insertHtmlAtCursor('bott')">下插入行</Button>
          <Button type="error" size="small" class="mr10" @click="insertHtmlAtCursor('delSpan')">行删除</Button>
        </div>
      </div>
      <div slot="footer">
        <Button @click="modelVisible = false">取消</Button>
        <Button type="primary" @click="confirmTable">确认</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import tableData from './tableData';
import getTableData from './getTableData';
export default {
  name: 'tableEdit',
  props: {
    type: {
      type: Number,
      default () { return 0 }
    },
    isVisible: {
      type: Boolean,
      default () { return false }
    },
    languageType: {
      type: String,
      default () {
        return '';
      }
    }
  },
  data () {
    return {
      modelVisible: false,
      title: '表格模板',
      tableType: {
        1: { name: '女装常规款', val: 'sizeOne' },
        2: { name: '女装下装', val: 'sizeTwo' },
        3: { name: '女装大码常规款', val: 'sizeThree' },
        4: { name: '女装大码下装', val: 'sizeFour' },
        5: { name: '男装常规款', val: 'sizeFive' },
        6: { name: '男装下装', val: 'sizeSix' },
        7: { name: '童装常规款', val: 'sizeSeven' },
        8: { name: "女鞋常规款", val: "sizeEight" },
      }
    };
  },
  watch: {
    isVisible (nV, oV) {
      if (nV) this.openDialog();
    },
    modelVisible (nV, oV) {
      this.$emit('update:isVisible', nV);
    }
  },
  methods: {
    openDialog () {
      this.modelVisible = this.isVisible;
      this.createTable(this.type);
      this.addTdfun();
    },
    // 创建表格
    createTable (value) {
      let { name, val } = this.tableType[value] || {};
      if (!val) return;
      this.title = name;
      let content = document.getElementById('content');
      content && (content.innerHTML = tableData[val]);
      if (this.languageType == 'GER') {
        content && (content.innerHTML = getTableData[val]);
      }

      this.keyChange();
    },
    // 上下左右键盘事件
    keyChange () {
      let table = document.getElementById('table-self');
      let tr = table.querySelector('tbody').querySelectorAll('tr');
      if (!table) return;
      let [rnum, spanum, pos, colPos] = [0, 0, null, null];
      tr.forEach((k, i) => {
        let isnextTr = rnum > 0;// 合并行处理
        if (isnextTr) {
          spanum = rnum;
          rnum = 0;
          pos = i;
        }
        let td = k.querySelectorAll('td');
        td.forEach((ck, ci) => {
          let rowspan = ck.getAttribute('rowspan');
          let colspan = ck.getAttribute('colspan');
          if (rowspan) rnum++;
          if (colspan) colPos = i;
        })
      })

      let tableKeydown = function (event) {
        var e = event || window.event;
        let codelist = [37, 38, 39, 40]; // 左、上、右、下
        if (e && !codelist.includes(e.keyCode)) return;
        tr.forEach((k, i) => {
          let td = k.querySelectorAll('td');
          td.forEach((ck, ci) => {
            if (ck === e.target.parentNode) {
              let isSingle = ci - spanum;
              if (e.keyCode == 38) {
                let trindex = i <= 0 ? 0 : i - 1;
                if (trindex === pos) {
                  ci = ci - spanum;
                }
                if (trindex === colPos) {
                  ci = parseInt(ci / 2) + spanum;
                }
                if (trindex === 0) {
                  ci = 0;
                }
                ci < 0 && (ci = 0);
                trindex < 0 && (trindex = 0);
                try {
                  tr[trindex].querySelectorAll('td')[ci].querySelector('div').focus();
                } catch (e) {
                  console.log('拿不到对象');
                }
              }
              if (e.keyCode == 37) {
                ck.previousElementSibling && ck.previousElementSibling.querySelector('div').focus();
              }
              if (e.keyCode == 40) {
                let trindex = i + 1;
                let rowspan = ck.getAttribute('rowspan') || 0;
                if (isSingle < 0 && rowspan > 1) {
                  trindex += (rowspan - 1);
                  ci = ci - spanum;
                }
                if (trindex === pos) {
                  ci = ci - spanum;
                  ci += ci;
                }
                if (trindex === pos + 1) {
                  ci += spanum;
                }
                ci < 0 && (ci = 0);
                trindex < 0 && (trindex = 0);
                try {
                  tr[trindex].querySelectorAll('td')[ci].querySelector('div').focus();
                } catch (e) {
                  console.log('拿不到对象');
                }
              }
              if (e.keyCode == 39) {
                ck.nextElementSibling && ck.nextElementSibling.querySelector('div').focus();
              }
            }
          })
        })
      };

      table.removeEventListener('keydown', (e) => {
        tableKeydown(e);
      }, false);
      setTimeout(() => {
        table.addEventListener('keydown', (e) => {
          tableKeydown(e)
        }, false);
      }, 0)
    },
    // 给td绑定事件
    addTdfun () {
      let table = document.getElementById('table-self');
      let tdlist = table.querySelectorAll('td');
      let list = Object.values(tdlist).filter(k => {
        return k.innerText === 'cm';
      });
      let tr = table.querySelector('tbody').querySelectorAll('tr');
      let pos = [];
      tr.forEach((k, i) => {
        let td = k.querySelectorAll('td');
        td.forEach((ck, ci) => {
          if (list.indexOf(ck) >= 0) {
            pos.push(ci);
          }
        })
      })
      let tdlister = [];
      let rnum = 0;
      let spanum = null;
      tr.forEach((k, i) => {
        if (i === 0) return; // 除去第一行(第一行是标题不需要复制插入)
        let td = k.querySelectorAll('td');
        // 合并行处理
        let isnextTr = rnum > 0;
        if (isnextTr) {
          spanum = rnum;
          rnum = 0;
        }
        td.forEach((ck, ci) => {
          let rowspan = ck.getAttribute('rowspan');
          let colspan = ck.getAttribute('colspan');
          if (rowspan) { rnum++; return; }
          if (isnextTr || colspan || !pos.includes(ci - spanum)) return;
          if (ck.innerText === 'cm') return;
          tdlister.push(ck);
        })
      })
      let rate = 0.3937;
      let reg = /^\d*[.]?\d{1,4}$/;
      let inputChange = (e, k) => {
        if (!reg.test(k.innerText)) return;
        let inch = k.nextElementSibling.firstChild;
        inch.innerText = (k.innerText * rate).toFixed(2);
      }

      tdlister.forEach(k => {
        k.querySelector('div').removeEventListener('input', (e) => {
          inputChange(e, k);
        }, false);
        setTimeout(() => {
          k.querySelector('div').addEventListener('input', (e) => {
            inputChange(e, k);
          }, false);
        }, 0);
      })
    },
    insertHtmlAtCursor (type) {
      // chrome opera safari兼容
      if (window.getSelection && window.getSelection().getRangeAt) {
        let range = window.getSelection().getRangeAt(0);
        let target = range.endContainer;
        let targetClass = ['td'];
        try {
          if (targetClass.includes(target.getAttribute('class'))) {
            this.addHtml(target, type);
          }
        } catch (e) {
          if (targetClass.includes(target.parentNode.getAttribute('class'))) {
            this.addHtml(target.parentNode, type);
          }
        }
      } else if (document.selection && document.selection.createRange) { // ie 9以下
      }
    },
    addHtml (obj, type) {
      let table = document.getElementById('table-self');
      let tr = table.querySelector('tbody').querySelectorAll('tr');
      let pos = { tr: '', td: '', isCol: false };
      // 找到光标所在的对应的位置
      tr.forEach((k, i) => {
        let td = k.querySelectorAll('td');
        td.forEach((ck, ci) => {
          if (obj.parentNode === ck) {
            pos.tr = i;
            pos.td = ci;
            pos.isCol = ck.getAttribute('colspan');
          }
        })
      })
      let rowslist = ['top', 'bott', 'delSpan'];
      let colslist = ['left', 'right', 'del'];
      if (rowslist.includes(type)) {
        this.rowsClick(tr, pos, type);
      }
      if (colslist.includes(type)) {
        this.colsClick(tr, pos, type);
      }
    },
    // 行点击
    rowsClick (tr, pos, type) {
      let rnum = '';
      tr.forEach((k, i) => {
        if (i === 0) return; // 除去第一行(第一行是标题不需要复制插入)
        let td = k.querySelectorAll('td');
        td.forEach((ck, ci) => {
          let colspan = ck.getAttribute('colspan');
          if (colspan && !rnum) { rnum = i + 1; }
        })
        if (pos.tr !== i) return;
        if (type === 'delSpan') {
          k.parentNode.removeChild(k);
          return;
        }
        let tr = document.createElement('tr'); // 创建节点
        td.forEach((ck, ci) => {
          let colspan = ck.getAttribute('colspan');
          if (colspan) {
            for (let i = 0; i < colspan; i++) {
              let newNode = document.createElement('td'); // 创建节点
              newNode.innerHTML = `<div class="td"  contenteditable="true"></div>`;
              newNode.setAttribute('style', 'border:1px solid black;')
              tr.appendChild(newNode);
            }
            return;
          }
          let newNode = document.createElement('td'); // 创建节点
          newNode.innerHTML = `<div class="td"  contenteditable="true"></div>`;
          newNode.setAttribute('style', 'border:1px solid black;')
          tr.appendChild(newNode);
        })
        let dom = type === 'top' ? k : k.nextElementSibling;
        if (type === 'bott' && (pos.tr === rnum - 1)) { dom = dom.nextElementSibling }
        if (type === 'top' && (pos.tr === rnum)) { dom = dom.previousElementSibling }
        k.parentNode.insertBefore(tr, dom);
        // 重新添加单位换算
        this.addTdfun();
        this.keyChange();
      })
    },
    // 列点击
    colsClick (tr, pos, type) {
      let [fun, rnum, rpos, tdp, spanum, colnum, trpos, rspanFlag] = ['', 0, null, null, 0, 0, null, false];
      tr.forEach((k, i) => {
        if (i === 0) return; // 除去第一行(第一行是标题不需要复制插入)
        let td = k.querySelectorAll('td');
        let isnextTr = rnum > 0;// 合并行处理
        let isRowspan = colnum > 0;
        if (isnextTr) {
          spanum = rnum;
          !rpos && (rpos = i);
        }
        if (isRowspan) {
          tdp = pos.td - colnum;
        }
        if (rspanFlag && pos.tr === (trpos + 1)) {
          // 合并行存在增加一列，下一行不需要增加列
          fun = 'colspanChild';
        } else {
          // 单行点击
          if (tdp < 0) {
            fun = 'singleSpan';
          } else if (pos.isCol) {
            // 合并列添加（合并列点击）
            fun = 'colspanClick';
          } else {
            // 单格点击
            fun = 'tdspanClick';
          }
        }
        td.forEach(ck => {
          let rowspan = ck.getAttribute('rowspan');
          let colspan = ck.getAttribute('colspan');
          if (colspan) trpos = i;
          if (rowspan) rspanFlag = true;

          if (!isnextTr && (rowspan || !colspan)) rnum++; // 存在行合并进行记录位置
          if (isRowspan) return;
          if (!colspan) colnum++; // 判断是否单独列
        })
      })
      if (!fun) return;
      this[fun](tr, pos, spanum, type);
    },
    // 单行列点击
    singleSpan (tr, pos, spanum, type) {
      let cnum = 0;
      tr.forEach((k, i) => {
        if (i === 0) return; // 除去第一行(第一行是标题不需要复制插入)
        let td = k.querySelectorAll('td');
        let isRowspan = cnum > 0;
        if (isRowspan) cnum = 0;
        td.forEach((ck, ci) => {
          let rowspan = ck.getAttribute('rowspan');
          let colspan = ck.getAttribute('colspan');
          if (rowspan) cnum++;
          if (isRowspan) return;
          if (pos.td !== ci) return;// 筛除掉不需要增加的位置
          // 删除节点
          if (type === 'del') {
            ck.parentNode.removeChild(ck);
            return;
          }
          let newNode = document.createElement('td'); // 创建节点
          newNode.setAttribute('style', 'border:1px solid black;')
          if (rowspan) {
            newNode.setAttribute('rowspan', rowspan);
            newNode.setAttribute('style', 'border:1px solid black;')
          }
          if (colspan) {
            newNode.setAttribute('colspan', colspan);
            newNode.setAttribute('style', 'border:1px solid black;')
          }
          // 给新插入的节点添加文本内容
          newNode.innerHTML = `<div class="td" contenteditable="true"></div>`;
          let dom = type === 'left' ? ck : ck.nextElementSibling;
          ck.parentNode.insertBefore(newNode, dom);
        })
      })
      this.firspanCol(tr);
      this.keyChange();
    },
    // 合并列点击
    colspanClick (tr, pos, spanum, type) {
      let rnum = 0;
      tr.forEach((k, i) => {
        if (i === 0) return; // 除去第一行(第一行是标题不需要复制插入)
        let td = k.querySelectorAll('td');
        let danwei = k.getAttribute('data-danwei');
        // 合并行处理
        let isnextTr = rnum > 0;
        let tdp = null;
        if (isnextTr) {
          tdp = pos.td - rnum;
          rnum = 0;
        }
        td.forEach((ck, ci) => {
          let rowspan = ck.getAttribute('rowspan');
          let colspan = ck.getAttribute('colspan');
          if (rowspan) { rnum++; } // 存在行合并进行记录位置
          if (isnextTr && tdp >= 0) {
            if ((tdp + tdp) !== ci) return;// 筛除掉不需要增加的位置
            // 删除节点
            if (type === 'del') {
              ck.parentNode.removeChild(ck.nextElementSibling);
              ck.parentNode.removeChild(ck);
              return;
            }
            let newNodeo = document.createElement('td'); // 创建节点
            let newNodet = document.createElement('td'); // 创建节点
            // 给新插入的节点添加文本内容
            newNodeo.innerHTML = `<div class="td" contenteditable="true">cm</div>`;
            newNodet.innerHTML = `<div class="td" contenteditable="true">inch</div>`;
            newNodeo.setAttribute('style', 'border:1px solid black;')
            newNodet.setAttribute('style', 'border:1px solid black;')
            let dom = type === 'left' ? ck : ck.nextElementSibling.nextElementSibling;
            ck.parentNode.insertBefore(newNodeo, dom);
            ck.parentNode.insertBefore(newNodet, dom);
          } else {
            let key = null;
            if (colspan) {
              key = pos.td;
            } else {
              key = ((pos.td - spanum) * 2) + spanum;
            }
            if (key !== ci) return;// 筛除掉不需要增加的位置
            // 删除节点
            if (type === 'del') {
              if (colspan) {
                ck.parentNode.removeChild(ck);
              } else {
                ck.parentNode.removeChild(ck.nextElementSibling);
                ck.parentNode.removeChild(ck);
              }
              return;
            }
            let newNodeo = document.createElement('td'); // 创建节点
            let newNodet = document.createElement('td'); // 创建节点
            newNodeo.setAttribute('style', 'border:1px solid black;')
            newNodet.setAttribute('style', 'border:1px solid black;')
            let dom = null;
            if (colspan) {
              newNodeo.setAttribute('colspan', colspan);
              dom = type === 'left' ? ck : ck.nextElementSibling;
            } else {
              dom = type === 'left' ? ck : ck.nextElementSibling.nextElementSibling;
            }
            // 给新插入的节点添加文本内容
            newNodeo.innerHTML = `<div class="td" contenteditable="true">${danwei ? 'cm' : ''}</div>`;
            ck.parentNode.insertBefore(newNodeo, dom);
            if (!colspan) {
              newNodet.innerHTML = `<div class="td" contenteditable="true">${danwei ? 'cm' : ''}</div>`;
              ck.parentNode.insertBefore(newNodet, dom);
            }
          }
        })
      })
      this.firspanCol(tr);
    },
    // 合并行点击
    colspanChild (tr, pos, spanum, type) {
      tr.forEach((k, i) => {
        if (i === 0) return; // 除去第一行(第一行是标题不需要复制插入)
        let td = k.querySelectorAll('td');
        let danwei = k.getAttribute('data-danwei');
        td.forEach((ck, ci) => {
          let colspan = ck.getAttribute('colspan');
          if (pos.tr === i) {
            let key = pos.td % 2 === 1 ? pos.td - 1 : pos.td;
            if (key !== ci) return;// 筛除掉不需要增加的位置

            // 删除节点
            if (type === 'del') {
              ck.parentNode.removeChild(ck.nextElementSibling);
              ck.parentNode.removeChild(ck);
              return;
            }

            let newNodeo = document.createElement('td'); // 创建节点
            let newNodet = document.createElement('td'); // 创建节点
            newNodeo.setAttribute('style', 'border:1px solid black;')
            newNodet.setAttribute('style', 'border:1px solid black;')
            // 给新插入的节点添加文本内容
            newNodeo.innerHTML = `<div class="td" contenteditable="true">cm</div>`;
            newNodet.innerHTML = `<div class="td" contenteditable="true">inch</div>`;
            let dom = type === 'left' ? ck : ck.nextElementSibling.nextElementSibling;
            ck.parentNode.insertBefore(newNodeo, dom);
            ck.parentNode.insertBefore(newNodet, dom);
          } else {
            let key = parseInt(pos.td / 2) + spanum;
            if (!colspan) {
              key = ((key - spanum) * 2) + spanum;
            }
            if (key !== ci) return;// 筛除掉不需要增加的位置

            // 删除节点
            if (type === 'del') {
              if (colspan) {
                ck.parentNode.removeChild(ck);
              } else {
                ck.parentNode.removeChild(ck.nextElementSibling);
                ck.parentNode.removeChild(ck);
              }
              return;
            }

            let newNodeo = document.createElement('td'); // 创建节点
            let newNodet = document.createElement('td'); // 创建节点
            newNodeo.setAttribute('style', 'border:1px solid black;')
            newNodet.setAttribute('style', 'border:1px solid black;')
            let dom = null;
            if (colspan) {
              newNodeo.setAttribute('colspan', colspan);
              dom = type === 'left' ? ck : ck.nextElementSibling;
            } else {
              dom = type === 'left' ? ck : ck.nextElementSibling.nextElementSibling;
            }
            // 给新插入的节点添加文本内容
            newNodeo.innerHTML = `<div class="td" contenteditable="true">${danwei ? 'cm' : ''}</div>`;
            ck.parentNode.insertBefore(newNodeo, dom);
            if (!colspan) {
              newNodet.innerHTML = `<div class="td" contenteditable="true">${danwei ? 'cm' : ''}</div>`;
              ck.parentNode.insertBefore(newNodet, dom);
            }
          }
        })
      })
      this.firspanCol(tr);
    },
    // 并行普通td点击
    tdspanClick (tr, pos, spanum, type) {
      let rnum = 0;
      tr.forEach((k, i) => {
        if (i === 0) return; // 除去第一行(第一行是标题不需要复制插入)
        let td = k.querySelectorAll('td');
        let danwei = k.getAttribute('data-danwei');

        // 合并行处理
        let isnextTr = rnum > 0;
        let tdp = null;
        if (isnextTr) {
          tdp = pos.td - rnum;
          rnum = 0;
        }

        td.forEach((ck, ci) => {
          let rowspan = ck.getAttribute('rowspan');
          let colspan = ck.getAttribute('colspan');
          if (rowspan) { rnum++; } // 存在行合并进行记录位置

          if (isnextTr && tdp >= 0) {
            let key = tdp % 2 === 1 ? tdp - 1 : tdp;
            if (key !== ci) return;// 筛除掉不需要增加的位置

            // 删除节点
            if (type === 'del') {
              ck.parentNode.removeChild(ck.nextElementSibling);
              ck.parentNode.removeChild(ck);
              return;
            }

            let newNodeo = document.createElement('td'); // 创建节点
            let newNodet = document.createElement('td'); // 创建节点

            // 给新插入的节点添加文本内容
            newNodeo.innerHTML = `<div class="td" contenteditable="true">cm</div>`;
            newNodet.innerHTML = `<div class="td" contenteditable="true">inch</div>`;
            newNodeo.setAttribute('style', 'border:1px solid black;')
            newNodet.setAttribute('style', 'border:1px solid black;')
            let dom = type === 'left' ? ck : ck.nextElementSibling.nextElementSibling;
            ck.parentNode.insertBefore(newNodeo, dom);
            ck.parentNode.insertBefore(newNodet, dom);
          } else {
            let key = pos.td % 2 === (spanum % 2 === 0 ? 1 : 0) ? pos.td - 1 : pos.td;
            if (colspan) {
              key = (key - spanum) / 2 + spanum;
            }

            if (key !== ci) return;// 筛除掉不需要增加的位置

            // 删除节点
            if (type === 'del') {
              if (colspan) {
                ck.parentNode.removeChild(ck);
              } else {
                ck.parentNode.removeChild(ck.nextElementSibling);
                ck.parentNode.removeChild(ck);
              }
              return;
            }

            let newNodeo = document.createElement('td'); // 创建节点
            let newNodet = document.createElement('td'); // 创建节点
            newNodeo.setAttribute('style', 'border:1px solid black;')
            newNodet.setAttribute('style', 'border:1px solid black;')
            let dom = null;
            if (colspan) {
              newNodeo.setAttribute('colspan', colspan);
              dom = type === 'left' ? ck : ck.nextElementSibling;
            } else {
              dom = type === 'left' ? ck : ck.nextElementSibling.nextElementSibling;
            }
            // 给新插入的节点添加文本内容
            newNodeo.innerHTML = `<div class="td" contenteditable="true">${danwei ? 'cm' : ''}</div>`;
            ck.parentNode.insertBefore(newNodeo, dom);
            if (!colspan) {
              newNodet.innerHTML = `<div class="td" contenteditable="true">${danwei ? 'inch' : ''}</div>`;
              ck.parentNode.insertBefore(newNodet, dom);
            }
          }
        })
      })
      this.firspanCol(tr);
    },
    // 第一行合并列
    firspanCol (tr) {
      let num = 0;
      let pos = null;
      tr.forEach((k, i) => {
        let td = k.querySelectorAll('td');
        td.forEach((ck, ci) => {
          let colspan = ck.getAttribute('colspan');
          if (colspan) {
            pos = i;
          }
        })
      })
      if (!pos) return;
      let list = tr[pos].querySelectorAll('td');
      list.forEach(ck => {
        let colspan = ck.getAttribute('colspan');
        if (colspan) {
          num += (colspan - 0);
        } else {
          num++;
        }
      })
      let friTr = tr[0].querySelector('td');
      friTr.setAttribute('colspan', num);

      // 重新添加单位换算
      this.addTdfun();
      this.keyChange();
    },
    // 表格内容返回富文本当中
    confirmTable () {
      let dom = document.getElementById('content')
      this.$emit('tableEditcontent', dom.innerHTML);
      this.modelVisible = false;
    }
  }
};
</script>
<style>
.table-template table,
.table-template table tr,
.table-template table td,
.table-template table td div {
  outline: none;
  text-align: center;
}

.table-template table {
  width: 100%;
  text-align: center;
}
.table-template table td {
  min-width: 60px;
}
#content {
  overflow: auto;
}
</style>
