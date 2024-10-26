<template >
  <div style="background-color: #ccc;" >
    <div class="stock_form" >
      <div class="info_box" id="printBox" >
        <div v-if="type === 'single'" >
          <div class="info_title" >
            <h2 >归库单{{'：' + details.regressProductNumber}}</h2 >
            <font style="font-family: IDAutomationC128S; margin-left: 15px;" >ÌPLÇ44$&lt;ÂÂÂ$VÎ</font >
          </div >
          <div class="info_center" >
            <p class="line_txt" >仓库{{'：' + details.warehouseName}}</p >
            <p class="line_txt" >创建时间{{'：' + details.createdTime}}</p >
            <p class="line_txt" >创建人{{'：' + details.userName}}</p >
          </div >
          <table align='center' style="border-collapse:collapse;" class="stock_table" >
            <thead >
            <tr class="title" >
              <th >所在库区</th >
              <th >所在库位</th >
              <th >产品图片</th >
              <th >SKU</th >
              <th >中文描述</th >
              <th >英文描述</th >
              <th >批次号</th >
              <th >归库数量</th >
            </tr >
            </thead >
            <tbody class="table_body" >
            <tr v-for="(item, index) in cancelData" :key="index" >
              <td >{{item.warehouseBlockNames != null ? item.warehouseBlockNames.join(',') : item.warehouseBlockName}}</td >
              <td >{{item.warehouseLocationName}}</td >
              <td >
                <img :src="item.url" alt="" width="46" height="46" >
              </td >
              <td >{{item.goodsSku}}</td >
              <td >{{item.goodsCnDesc}}</td >
              <td >{{item.goodsEnDesc}}</td >
              <td >{{item.receiptBatchNo}}</td >
              <td >{{item.quantity}}</td >
            </tr >
            </tbody >
          </table >
          <div class="footer_boxs" >
            <p class="text" >制单人（签字/日期）：</p >
            <p class="text" >归库人（签字/日期）：</p >
            <p class="text" ></p >
          </div >
        </div >
        <div v-if="type === 'all'" v-for="(item, index) in cancelData" :key="index" >
          <div v-if="item.data.length > 1" >
            <div class="info_title" >
              <h2 >归库单{{'：' + item.data[0].details.regressProductNumber}}</h2 >
              <font style="font-family: IDAutomationC128S; margin-left: 15px;" >ÌPLÇ44$&lt;ÂÂÂ$VÎ</font >
            </div >
            <div class="info_center" >
              <p class="line_txt" >仓库{{'：' + item.data[0].details.warehouseName}}</p >
              <p class="line_txt" >创建时间{{'：' + item.data[0].details.createdTime}}</p >
              <p class="line_txt" >创建人{{'：' + item.data[0].details.userName}}</p >
            </div >
            <table align='center' style="border-collapse:collapse;" class="stock_table" >
              <thead >
              <tr class="title" >
                <th >所在库区</th >
                <th >所在库位</th >
                <th >产品图片</th >
                <th >SKU</th >
                <th >中文描述</th >
                <th >英文描述</th >
                <th >批次号</th >
                <th >归库数量</th >
              </tr >
              </thead >
              <tbody class="table_body" >
              <tr v-for="(ele, idx) in item.data" :key="idx" >
                <td >{{ele.warehouseBlockNames != null ? ele.warehouseBlockNames.join(',') : ele.warehouseBlockName}}</td >
                <td >{{ele.warehouseLocationName}}</td >
                <td >
                  <img :src="ele.url" alt="" width="46" height="46" >
                </td >
                <td >{{ele.goodsSku}}</td >
                <td >{{ele.goodsCnDesc}}</td >
                <td >{{ele.goodsEnDesc}}</td >
                <td >{{ele.receiptBatchNo}}</td >
                <td >{{ele.quantity}}</td >
              </tr >
              </tbody >
            </table >
            <div class="footer_boxs" >
              <p class="text" >制单人（签字/日期）：</p >
              <p class="text" >归库人（签字/日期）：</p >
              <p class="text" ></p >
            </div >
            <div class="min_height" ></div >
          </div >
          <div v-if="item.data.length > 0 && item.data.length <= 1" >
            <div class="info_title" >
              <h2 >归库单{{'：' + item.regressProductNumber}}</h2 >
              <font style="font-family: IDAutomationC128S; margin-left: 15px;" >ÌPLÇ44$&lt;ÂÂÂ$VÎ</font >
            </div >
            <div class="info_center" >
              <p class="line_txt" >仓库{{'：' + item.data[0].details.warehouseName}}</p >
              <p class="line_txt" >创建时间{{'：' + item.data[0].details.createdTime}}</p >
              <p class="line_txt" >创建人{{'：' + item.data[0].details.userName}}</p >
            </div >
            <table align='center' style="border-collapse:collapse;" class="stock_table" >
              <thead >
              <tr class="title" >
                <th >所在库区</th >
                <th >所在库位</th >
                <th >产品图片</th >
                <th >SKU</th >
                <th >中文描述</th >
                <th >英文描述</th >
                <th >批次号</th >
                <th >归库数量</th >
              </tr >
              </thead >
              <tbody class="table_body" >
              <tr >
                <td >{{item.data[0].warehouseBlockNames != null ? item.data[0].warehouseBlockNames.join(',') : item.data[0].warehouseBlockName}}</td >
                <td >{{item.data[0].warehouseLocationName}}</td >
                <td >
                  <img :src="item.data[0].url" alt="" width="46" height="46" >
                </td >
                <td >{{item.data[0].goodsSku}}</td >
                <td >{{item.data[0].goodsCnDesc}}</td >
                <td >{{item.data[0].goodsEnDesc}}</td >
                <td >{{item.data[0].receiptBatchNo}}</td >
                <td >{{item.data[0].quantity}}</td >
              </tr >
              </tbody >
            </table >
            <div class="footer_boxs" >
              <p class="text" >制单人（签字/日期）：</p >
              <p class="text" >归库人（签字/日期）：</p >
              <p class="text" ></p >
            </div >
            <div class="min_height" ></div >
          </div >
        </div >
        <div class="option_btn" >
          <Button class="stock_btn" @click="downloadBtn" type="primary" >下载</Button >
          <Button class="stock_btn" @click="printingBtn" type="primary" >打印</Button >
          <Button class="stock_btn" @click="cancelBtn" type="primary" >取消打印</Button >
        </div >
      </div >
    </div >
  </div >
</template>

<style lang="less" scoped >
.stock_form {
  margin: 0 auto;
  width: 100%;
  height: 100%;
  padding: 40px 0;

  .info_box {
    margin: 0 auto;
    padding: 0 30px 30px 30px;
    width: 1000px;
    background-color: #fff;
    position: relative;

    .info_title {
      font-size: 20px;
      color: #000;
      font-weight: bold;
      display: flex;
      align-items: center;
      padding-bottom: 15px;
      border-bottom: 1px solid #E3E3E3;
      padding-top: 40px;
    }

    .info_center {
      padding: 15px 0;
      border-bottom: 1px solid #E3E3E3;
      color: #333;
      font-size: 14px;
      line-height: 30px;
    }

    .stock_table {
      margin: 20px auto;
      width: 100%;
      border: 1px solid #9a9a9a;
      box-sizing: border-box;

      .title {
        font-size: 15px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        color: #000;
        background-color: #D7D7D7;
        border: none;

        th {
          border: 1px solid #9a9a9a;
        }
      }

      .table_body {
        tr {
          text-align: center;

          td {
            padding: 10px 15px;
            color: #333;
            font-size: 14px;
            border: 1px solid #9a9a9a;
            word-wrap: break-word;
            word-break: break-all;
          }
        }
      }

    }

    .footer_boxs {
      padding: 30px 0 20px 0;
      border-top: 1px solid #E3E3E3;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      color: #333;
      margin-bottom: 100px;
    }

    .option_btn {
      position: absolute;
      top: 0;
      right: -160px;
      display: flex;
      flex-direction: column;

      .stock_btn {
        margin-bottom: 12px;
      }
    }
  }
}
</style >

<style media="print" >
@page {
  size: auto;
  margin: 0mm;
}

@media print {
  html, body, #app {
    min-width: auto;
  }

  html, body {
    margin: 0;
    padding: 0;
  }

  * {
    margin: 0;
    padding: 0;
  }

  .option_btn {
    display: none;
  }

  .min_height {
    page-break-after: always;
  }
}

* {
  margin: 0;
  padding: 0;
}
</style>

<script>
import api from '@/api/api';
import JsPDF from 'jspdf';
import { getAllWarehouse } from '@/utils/user';
import Mixin from '@/components/mixin/common_mixin';
import printMixin from '@/components/mixin/print_mixin';
import { getWarehouseId } from '@/utils/getService';

export default {
  mixins: [Mixin, printMixin],
  data () {
    return {
      details: {},
      cancelData: [],
      type: '',
      AllWarehouse: []
    };
  },
  created () {
    this.PrintStockData();
    this.GetAllWarehouse();
    this.type = this.$route.query.type;
  },
  methods: {
    // 下载按钮
    downloadBtn () {
      var pdf = new JsPDF('p', 'pt', 'a4');
      console.log(pdf);
      if (pdf.internal) {
        pdf.internal.scaleFactor = 1.5;
      }
      var options = {
        pagesplit: true
      };
      let node = document.querySelector('#printBox');
      node.style.backgroundColor = '#fff';
      node.style.padding = '20px 40px';
      node.style.margin = '0 auto';
      pdf.addHTML(node, options, function () {
        pdf.save('web.pdf');
      });
    }, // 打印
    printingBtn () {
      window.print();
    }, // 取消打印
    cancelBtn () {
      window.location.href = '#/abnormalPackageStorage?warehouseId=' + getWarehouseId();
    }, // 获取列表的数据
    PrintStockData () {
      let v = this;
      let type = v.$route.query.type;
      let data = {};
      let userInfoList = JSON.parse(localStorage.getItem('userInfoList'));
      if (type === 'all') {
        data = v.$route.query.regressProductNumber.split(',');
        v.axios.post(api.export_ProductNumbers, JSON.stringify(data)).then(response => {
          if (response.data.code === 0) {
            if (response.data.datas != null && response.data.datas.length > 0) {
              response.data.datas.map((item, index) => {
                let details = {
                  regressProductNumber: response.data.datas[index].regressProductNumber,
                  status: response.data.datas[index].status === 0 ? '等待归库' : response.data.datas[index].status === 1
                                                                             ? '归库完成'
                                                                             : '',
                  createdTime: v.$uDate.getDataToLocalTime(response.data.datas[index].createdTime, 'fulltime'),
                  userName: response.data.datas[index].createdBy != null
                            ? userInfoList[response.data.datas[index].createdBy].userName
                            : ''
                };
                if (v.AllWarehouse.length > 0) {
                  v.AllWarehouse.map((ele, index) => {
                    if (ele.warehouseId === item.warehouseId) {
                      details.warehouseName = ele.warehouseName;
                    }
                  });
                }
                item['details'] = details;
                item['url'] = localStorage.getItem('imgUrlPrefix') + item.goodsUrl;
              });
              let arr = response.data.datas;
              let map = {};
              let dest = [];
              for (let i = 0; i < arr.length; i++) {
                let ai = arr[i];
                if (!map[ai.regressProductNumber]) {
                  dest.push({
                    regressProductNumber: ai.regressProductNumber,
                    data: [ai]
                  });
                  map[ai.regressProductNumber] = ai;
                } else {
                  for (var j = 0; j < dest.length; j++) {
                    var dj = dest[j];
                    if (dj.regressProductNumber === ai.regressProductNumber) {
                      dj.data.push(ai);
                      break;
                    }
                  }
                }
              }
              v.cancelData = dest;
            }
          }
        });
      } else if (type === 'single') {
        data = v.$route.query.regressProductNumber;
        v.axios.get(api.get_InventoryDetails + data).then(response => {
          if (response.data.code === 0) {
            if (response.data.datas != null && response.data.datas.length > 0) {
              let details = {
                regressProductNumber: response.data.datas[0].regressProductNumber,
                status: response.data.datas[0].status === 0 ? '等待归库' : response.data.datas[0].status === 1
                                                                       ? '归库完成'
                                                                       : '',
                createdTime: v.$uDate.getDataToLocalTime(response.data.datas[0].createdTime, 'fulltime'),
                userName: response.data.datas[0].createdBy != null
                          ? userInfoList[response.data.datas[0].createdBy].userName
                          : ''
              };
              v.details = Object.assign({}, details);
              if (v.AllWarehouse.length > 0) {
                v.AllWarehouse.map((item, index) => {
                  if (item.warehouseId === response.data.datas[0].warehouseId) {
                    let name = {
                      warehouseName: item.warehouseName
                    };
                    v.details = Object.assign({}, v.details, name);
                  }
                });
              }
              response.data.datas.map((item) => {
                item['url'] = localStorage.getItem('imgUrlPrefix') + item.goodsUrl;
              });
              v.cancelData = response.data.datas;
            }
          }
        });
      }
    }, // 获取仓库数据
    GetAllWarehouse () {
      let v = this;
      getAllWarehouse().then((res) => {
        v.AllWarehouse = res;
      });
    }
  }
};

</script >
