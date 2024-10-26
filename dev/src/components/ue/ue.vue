<template>
  <div >
    <script :id=id type="text/plain" ></script >
  </div >
</template>
<script>
export default {
  name: 'UE',
  data () {
    return {
      editor: null,
      tableType: {
        1: { name: '女装常规款', val: 'sizeOne' },
        2: { name: '女装下装', val: 'sizeTwo' },
        3: { name: '女装大码常规款', val: 'sizeThree' },
        4: { name: '女装大码下装', val: 'sizeFour' },
        5: { name: '男装常规款', val: 'sizeFive' },
        6: { name: '男装下装', val: 'sizeSix' },
        7: { name: '童装常规款', val: 'sizeSeven' },
        8: { name: "女鞋常规款", val: "sizeEight" },
      },
      visible: false,
      type: null
    };
  },
  props: {
    config: {
      type: Object
    },
    id: {
      type: String
    },
    content: String,
    htmlStatus: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    disabled: {
      handler (a, b) {
        if (a) {
          this.editor.setDisabled()
        }
      }
    },
    isVisible: {
      handler (val) {
        this.visible = val;
      }
    },
    visible: {
      handler (val) {
        this.$emit('update:isVisible', val)
      }
    }
  },
  mounted () {
    const _this = this;
    let UE = window.UE;
    this.addCustomButtom();
    this.editor = UE.getEditor(this.id, this.config); // 初始化UE
    this.editor.addListener('ready', function () {
      _this.editor.setContent(_this.content); // 确保UE加载完成后，放入内容。
      /* if (_this.disabled) {
        _this.editor.setDisabled();
      } */
    });
    this.$nextTick(function () {
      _this.editor.addListener('keyup', function () {
        if (this.htmlStatus) {
          _this.$emit('update:content', _this.getUEContent());
        } else {
          _this.$emit('update:content', _this.getContentTxt());
        }
      });
    });
  },
  methods: {
    setUEContent (data) {
      this.editor.setContent(data); // 放入内容。
    },
    getUEContent () { // 获取内容方法
      return this.editor.getContent();
    },
    getContentTxt () { // 获取不带HTML标签，纯文本
      return this.editor.getContentTxt();
    },
    addCustomButtom (editorId) {
      let v = this;
      window.UE.registerUI(
        'mulinsertable',
        function (editor, uiName) {
          // 用于下拉默认值显示
          let selector = {
            label: '表格模版',
            value: ''
          };
          // 注册按钮执行时的command命令,用uiName作为command名字，使用命令默认就会带有回退操作
          editor.registerCommand(uiName, {
            execCommand: function (cmdName, value) {
              v.visible = true;
              // v.type = Number(value);
              v.$emit('childType', Number(value))
            },
            queryCommandValue: function () {
              // 查询结果并返回
              return selector.label;
            }
          });

          let items = [];
          for (let ci in v.tableType) {
            items.push({
              // 显示的条目
              label: v.tableType[ci].name,
              // 选中条目后的返回值
              value: ci,
              // 针对每个条目进行特殊的渲染
              renderLabelHtml: function () {
                // 这个是希望每个条目的字体是不同的
                return `<div class="edui-label %%-label" style="line-height:20px;">${this.label || ''}</div>`;
              }
            });
          }

          // 创建下拉框
          // eslint-disable-next-line no-undef
          let mulinsertable = new UE.ui.Combox({
            // 需要指定当前的编辑器实例
            editor: editor,
            // 添加条目
            items: items,
            // 当选中时要做的事情
            onselect: function (t, index) {
              let label = this.items[index].value;
              selector.label = label;
              selector.value = index;
              // 拿到选中条目的值
              editor.execCommand(uiName, label);
            },
            // 提示
            title: '表格模版',
            // 当编辑器没有焦点时，combox默认显示的内容
            initValue: '表格模版'
          });
          // 当点到编辑内容上时，按钮要做的状态反射
          editor.addListener(
            'selectionchange',
            function (type, causeByUi, uiReady) {
              if (!uiReady) {
                var state = editor.queryCommandState(uiName);
                if (state == -1) {
                  mulinsertable.setDisabled(true);
                } else {
                  mulinsertable.setDisabled(false);
                  var value = editor.queryCommandValue(uiName);
                  if (!value) {
                    mulinsertable.setValue(uiName);
                    return;
                  }
                  // ie下从源码模式切换回来时，字体会带单引号，而且会有逗号
                  value && (value = value.replace(/['"]/g, '').split(',')[0]);
                  mulinsertable.setValue(value);
                }
              }
            }
          );
          // 因为你是添加mulinsertable,所以需要返回这个mulinsertable
          return mulinsertable;
        },
        79 /* 指定添加到工具栏上的哪个位置，默认时追加到最后 */,
        editorId /* 指定这个 UI 是哪个编辑器实例上的，默认是页面上所有的编辑器都会添加这个按钮 */
      );
    },
    tableEditcontent (html) {
      /* let editFooter = document.querySelector('.edui-editor-bottomContainer');
      let breadcrumb = editFooter ? editFooter.querySelectorAll('.edui-editor-breadcrumb') : '';
      let spans = breadcrumb ? breadcrumb[0].querySelectorAll('span') : '';
      if (!(spans && spans.length)) return;
      let flag = false;
      spans.forEach(k => {
        ['table', 'tr', 'td'].includes(k.innerText) ? flag = true : '';
      })
      if (flag) {
        this.$Message.error('请把光标移除表格外')
        return;
      } */
      // 插入表格内容
      this.editor.execCommand('inserthtml', html);
    }
  },
  destroyed () {
    this.editor.destroy();
  }

};
</script>

<style scoped>
</style>
