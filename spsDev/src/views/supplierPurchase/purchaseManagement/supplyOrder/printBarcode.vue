<template>
  <div>
    <Modal
      class="modal-main"
      v-model="dialogObj.modelVisible"
      :mask-closable="false"
      title="你将打印以下订单条码"
      :width="800"
      class-name="edit-modal-box"
    >

      <div class="content">
        <Form ref="form" class="fmb0" :model="formValidate" :rules="ruleValidate">
          <div class="tips">
            <p>注意：</p>
            <p>1、条码如打印不清晰，边框有断线、有虚线、模糊、呈波浪形会影响仓库收货，请重新打印；</p>
            <p>2、同款商品由于打印批次不同，打印出来的条码也会有差异；</p>
          </div>
          <div style="padding: 20px 0;">
            <RadioGroup v-model="formValidate.type" @on-change="sortList">
              <Radio :label="1">按货号排序：货号相近的订单排在一起</Radio>
              <Radio :label="2">按下单时间排序：下单时间越早排序越靠前</Radio>
            </RadioGroup>
          </div>
          <div>
            <Alert type="error" class="alertSty">打印总数：{{total}}</Alert>
            <Table highlight-row max-height="580" :columns="columns" :data="formValidate.tableList" :border="true">
              <template slot-scope="{ row }" slot="salesTime">
                <div>{{getDataToLocalTime(row.salesTime, 'fulltime',true)}}</div>
              </template>
              <template slot-scope="{ index }" slot="print">
                <FormItem
                  :rules="ruleValidate.printNum"
                  :prop="`tableList.${index}.printNum`"
                  :show-message="false"
                >
                  <Input v-model="formValidate.tableList[index].printNum" placeholder="请输入" clearable number></Input>
                </FormItem>
              </template>
              <template slot-scope="{ row }" slot="fileName">
               <div @click="previewPdfFile(row)" 
                :style="{
                  color: row.filePath ? '#4e6ef2' : 'black',
                  textDecoration: row.filePath ? 'underline' : 'none'
                }">
                {{  row.fileName ? row.fileName : row.platformSubject ? `${row.platformSubject}-${row.accountCode}` : 'LAPA标签' }}
               </div>
              </template>
              <template slot="tagSize">
                <span>
                  70mm*20mm
                </span>
              </template>
            </Table>
          </div>
        </Form>
        <Spin size="large" fix v-if="beingCreatePrint">
          <div style="text-align: left;">
            正在处理打印数据中，数据量越多需要时间越久，请不要关闭窗口，请耐心等待...
          </div>
        </Spin>
      </div>

      <div slot="footer" style="text-align: center;">
        <Button type="primary" @click="handleSubmit('form')" :loading="loading || beingCreatePrint">确定</Button>
        <Button @click="dialogObj.modelVisible = false">关闭</Button>
      </div>
    </Modal>

    <!-- <Modal class="modal-main" v-model="codeData.modelVisible" :mask-closable="false" title="打印条码" :width="800">
      <div class="content" id="code">
        <div class="content_border">
          <div v-for="(pitem,pindex) in formValidate.tableList" class="autopage">
            <div v-for="(item,index) in pitem.printNum" :key="pindex+' '+index" class="barcode" style="page-break-after:always">
              <div class="barcode-item">
                <div class="barcode-tit">
                  <span>{{pitem.supplierNo || ''}}</span>
                  <span>Made In China</span>
                </div>
                <barcode :option="{id: 'barcode'+index, content: pitem.skuNo}" :config="{height: 20}"></barcode>
                <div class="barcode-tit">
                  <span>{{pitem.purchaseNumber || ''}}</span>
                </div>
                <div class="barcode-tit">
                  <span>{{pitem.skuNo || ''}}</span>
                  <span>{{pitem.specifications || ''}}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div slot="footer" style="text-align: center;">
        <Button type="primary" @click="pintContent()">打印</Button>
        <Button @click="codeData.modelVisible = false">关闭</Button>
      </div>
    </Modal> -->

    <!-- <print ref="print" :printData="printData"></print> -->
  </div>
</template>

<script>
// import barcode from '@/components/Barcode';
import { tagTypeMap } from './configFile'; 
import regular from '@/utils/regular.js';
import Mixin from '@/components/mixin/common_mixin';
import { print_PDF_and_sendLabel, getLodopInstance } from '@/utils/clodop';
let Lodop;
import { getPrintPdf } from '@/utils/printTagCommon';
// import print from "./print";

export default {
  // components: { print },
  mixins: [Mixin],
  data () {
    return {
      columns: [
        {
          title: '订单号',
          key: 'purchaseNumber'
        },
        {
          title: '供方货号',
          key: 'supplierNo'
        },
        {
          title: '规格',
          key: 'specifications'
        },
        {
          title: '标签名称',
          slot: 'fileName',
        },
        {
          title: '标签大小',
          slot: 'tagSize'
        },
        {
          title: '下单数量',
          key: 'salesNumber'
        },
        {
          title: '下单时间',
          slot: 'salesTime',
          width: 100,
        },
        {
          title: '打印数量',
          slot: 'print'
        },
      ],
      printProgress: 0,
      formValidate: {
        type: 1,
        tableList: [],
      },
      ruleValidate: {
        printNum: [
          { type: 'number', pattern: regular.validateInteger, message: '请输入正整数', trigger: 'blur' },
        ],
      },
      codeData: {
        modelVisible: false
      },
      printObj: {
        id: "code",    // 这里是要打印元素的ID
        popTitle: '打印条码',  // 打印的标题
      },
      loading: false,
      beingCreatePrint: false,
      printData: [],
      tagTypeMap: tagTypeMap
    };
  },
  props: {
    dialogObj: {
      type: Object,
      default () {
        return {
          modelVisible: false,
          list: []
        };
      }
    }
  },
  watch: {
    "dialogObj.modelVisible": {
      handler (newVal, oldVal) {
        if (newVal) this.handleReset();
      },
      immediate: true
    }
  },
  computed: {
    total () {
      let num = 0;
      this.formValidate.tableList.forEach(k => {
        num += Number(k.printNum);
      });
      return num;
    }
  },
  created () {
  },
  methods: {
    // 提交
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (!valid) return;
        this.$Modal.confirm({
          title: '打印提示', 
          content: '批量打印，以第一条数据的张纸尺寸初始化，如有尺寸大于初始纸张可能存在变形或打印不全',
          onOk: () => {
            Lodop = Lodop || getLodopInstance();
            let tagSizeList = {
              widthList:[],
              heightList:[]
            }
            this.formValidate.tableList.forEach((item,index) => {
              if(item.tagSize) {
                const [width, height] = item.tagSize.split(" * ")
                tagSizeList.widthList.push(Number(width.slice(0, -2)))
                tagSizeList.heightList.push(Number(height.slice(0, -2)))
              } else {
                tagSizeList.widthList.push(70)
                tagSizeList.heightList.push(20)
              }

            })
            tagSizeList.widthList = [... new Set(tagSizeList.widthList)]
            tagSizeList.heightList = [... new Set(tagSizeList.heightList)]
            const maxWidth = Math.max(...tagSizeList.widthList)
            const maxHeight = Math.max(...tagSizeList.heightList)
            print_PDF_and_sendLabel(Lodop ,this.formValidate.tableList,{width: maxWidth+ 'mm' ,height: maxHeight+'mm'})
            // this.formValidate.tableList.forEach(item => {
            //   this.$set(item, 'width', item.platformSubject ? 70 : 60)
            //   this.$set(item, 'height', item.platformSubject ? 20 : 40)
            // })
            // getPrintPdf(
            //   this.formValidate.tableList,{
            //     replaceKey: {
            //       tagType: 'platformSubject',
            //       page: 'printNum',
            //       specification: 'specificationslist',
            //     }
            //   },
            //   true
            // ).then(res => {
            //   this.beingCreatePrint = false
            // })
          },
          // 处理进度， 返回百分比
          progress: (percent) => {
            this.printProgress = percent;
          }
        }).then(() => {
          this.beingCreatePrint = false;
        })
        // this.codeData.modelVisible = true;
        // this.printData = this.formValidate.tableList;
        // this.$refs.print.printModal = true;
      });
    },
    // 重置
    handleReset () {
      let list = JSON.parse(JSON.stringify(this.dialogObj.list));
      let attrList = [];
      let tagSize = [];
      list.forEach((k, i) => {
        if (!this.$common.isEmpty(list[i].filePath)) {
          list[i].filePath = `${window.location.origin}/sps-service/filenode/s${list[i].filePath}`;
          tagSize = (list[i].tagSize || '').split('*').map(m => parseInt(m.trim()));
          list[i].width = this.$common.isEmpty(Number(tagSize[0])) ? 70 : Number(tagSize[0]);
          list[i].height = this.$common.isEmpty(Number(tagSize[1])) ? 20 : Number(tagSize[1]);
        }
        attrList = [];
        (k.specifications || '').split(' ').forEach((j, y) => {
          if (j && (y < 2)) attrList.push(j.split(':')[1]);
        });
        list[i].specificationslist = attrList;
        list[i].printNum = k.salesNumber || 0; //打印的数量默认等于下单的数量
      });
      this.formValidate.tableList = list;
      this.formValidate.tableList.forEach(item => {
        let tagOption = this.tagTypeMap[item.platformSubject];
        let obj = this.$common.copy(item)
        if(!this.$common.isEmpty(item.platformSubject)){
          obj.countryName = this.$common.isEmpty(item.countryName) ?  'CHINA' : item.countryName
          this.beingCreatePrint = true
          getPrintPdf(
            [obj],tagOption
          ).then(res => {
            item.canvasData = res.canvasData[0]
          }).finally(() => {
            this.beingCreatePrint = false
          })     
        }
      })
    },
    sortList (val) {
      if (val === 1) {
        this.formValidate.tableList.sort(this.sortTable('purchaseId', true));
      }
      if (val === 2) {
        this.formValidate.tableList.sort(this.sortTable('salesTime', true));
      }
    },
    // 预览 PDF
    previewPdfFile (row) {
      if (this.$common.isEmpty(row.filePath)) {
        return this.$Message.error('当前数据无标签文件，无法预览');
      }
      const filePath = this.$common.isUrl(row.filePath) ? row.filePath : `${window.location.origin}/sps-service/filenode/s${row.filePath}`;
      const postfix = (row.filePath.substring(row.filePath.lastIndexOf('.') + 1, row.filePath.length)).toLocaleLowerCase();
      this.axios.get(filePath, { responseType: 'blob' }).then(res => {
        if (this.$common.isEmpty(res.data) && this.$common.isEmpty(res.resData)) {
          this.$Message.error('获取标签文件失败');
          return;
        }
        this.$common.blobToBase64(res.data || res.resData).then(data => {
          if (postfix !== 'pdf') {
            // let pageSze = row.tagSize.split('*');
            // pageSze[0] = parseInt(pageSze[0]);
            // pageSze[1] = parseInt(pageSze[1])
            // const doc = new JsPdf(pageSze[0] > pageSze[1] ? 'landscape' : 'portrait', 'mm', pageSze);
            // doc.addImage(data, 'JPEG', 0, 0, pageSze[0], pageSze[1]);
            // this.$common.previewFile(doc.output('blob'));
            const img = new Image();
            img.src = window.URL.createObjectURL(res.data || res.resData);
            img.onload = () => {
              let pageSze = row.tagSize.split('*');
              pageSze[0] = img.width ? this.$common.pxToMm(img.width) : parseInt(pageSze[0]);
              pageSze[1] = img.height ? this.$common.pxToMm(img.height) : parseInt(pageSze[1])
              const doc = new JsPdf(pageSze[0] > pageSze[1] ? 'landscape' : 'portrait', 'mm', pageSze);
              doc.addImage(data, 'JPEG', 0, 0, pageSze[0], pageSze[1]);
              this.$common.previewFile(doc.output('blob'));
            }
          } else {
            const fileBold = this.$common.base64ToBlob(data, 'application/pdf');
            this.$common.previewFile(fileBold);
          }
        }).catch((err) => {
          this.$Message.error('获取标签文件失败');
          console.error(err);
        })
      }).catch((err) => {
        this.$Message.error('获取标签文件失败');
        console.error(err);
      })
    },
    sortTable (attr, rev) {
      // * 使用例子：newArray.sort(sortBy('number',false)) //表示根据number属性降序排列;若第二个参数不传递，默认表示升序排序
      // * @param attr 排序的属性 如number属性
      // * @param rev true表示升序排列，false降序排序
      // * */
      //第二个参数没有传递 默认升序排列
      if (rev == undefined) {
        rev = 1;
      } else {
        rev = (rev) ? 1 : -1;
      }
      return function (a, b) {
        a = a[attr];
        b = b[attr];
        if (a < b) {
          return rev * -1;
        }
        if (a > b) {
          return rev * 1;
        }
        return 0;
      };
    },

    // 打印内容
    pintContent () {
      this.printData = this.formValidate.tableList;
      this.$refs.print.printModal = true;
    }
  }
};
</script>
<style lang="less" scoped>
/* 纸张大小 70*20cm 1pt = 0.353mm 1mm=（10/43）px≈0.2325px */
/*打印媒体查询去除页眉页脚*/
@media print {
  @page {
    margin: 3mm;
    size: 700mm 200mm;
  }
}

.tips {
  color: #cc3300;
}
.alertSty {
  margin: 0;
  border: none;
}
.content {
  position: relative;
  display: flex;
  padding: 10px 20px 0 20px;
  flex-direction: column;
  align-items: center;
  page-break-before: always;
}
.content_border {
  border-bottom: none;
}
.barcode {
  border: 1px solid #e8eaec;
  margin-bottom: 8pt;
  border-radius: 4pt;
  /* border-bottom: none; */
}
/* .barcode:last-child {
  border-bottom: 1px solid #e8eaec;
} */
.barcode-item {
  padding: 2pt 6pt;
  font-size: 8pt;
  line-height: 11pt;
  min-width: 183pt;
  .barcode-tit {
    display: flex;
    align-items: center;
    justify-content: space-between;
    /* padding-right: 6pt; */
    > span:first-child {
      margin-right: 6pt;
    }
  }
}
:deep(.edit-modal-box){
  .ivu-modal{
    top: 50px;
    width: 80% !important;
    max-width: 1400px;
    min-width: 900px;
    .ivu-modal-body{
      max-height: calc(100vh - 190px);
    }
  }
  .ivu-modal-body{
    padding: 0;
  }
  .ivu-modal-footer{
    border-top: none;
  }
}
</style>