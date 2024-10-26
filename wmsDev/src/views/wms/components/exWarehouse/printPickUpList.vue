<template >
  <div class="printPickUpList-page">
    <div class="print-n-box">
      <div id="printBox">
        <div style="page-break-before:always" class="print-mb100" v-for="(item, index) in printData" :key="index">
          <div style="font-size: 24px;font-weight: 600;border-bottom: 1px solid
          #ccc;padding-bottom: 15px;line-height: 40px; margin-top: 20px;">{{ '补拣单：' + item.supplementPickingNo }}
          </div>
          <div class="information">
            <p style="margin: 7px 0;">{{ '仓库：' + item.warehouseName }}</p>
            <p style="margin: 7px 0;">{{ '创建时间：' + $uDate.getDataToLocalTime(item.createdTime, 'fulltime') }}</p>
            <p style="margin: 7px 0;">{{ '补拣人员：' + item.userName }}</p>
          </div>
          <table width="100%" class="local-table">
            <thead style="background-color: #ccc">
              <tr>
                <th style="padding: 6px 0">出库单号</th>
                <th style="padding: 6px 0">产品图片</th>
                <th style="padding: 6px 0">SKU</th>
                <th style="padding: 6px 0">中文描述</th>
                <th style="padding: 6px 0">英文描述</th>
                <th style="padding: 6px 0">库区</th>
                <th style="padding: 6px 0">库位</th>
                <th style="padding: 6px 0">补拣数量</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(talg, idx) in item.details_data" :key="idx">
                <td :rowspan="talg.rowspanLength" v-if="talg.rowspan">{{ talg.packageCode }}</td>
                <td v-if="!talg.rowspanLength && !talg.rowspan">{{ talg.packageCode }}</td>
                <td>
                  <img :src="imgUrlPrefix + talg.goodsUrl" alt="" width="46" height="46">
                </td>
                <td>{{ talg.goodsSku }}</td>
                <td>{{ talg.goodsCnDesc }}</td>
                <td>{{ talg.goodsEnDesc }}</td>
                <td>{{ talg.warehouseBlockCode }}</td>
                <td>{{ talg.warehouseLocationCode }}</td>
                <td>{{ talg.expectPickingNumber }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="print-none right-action-bar">
          <Button type="primary" style="display: block" @click="download">下载</Button>
          <Button type="primary" style="display: block; ;margin-top: 15px" @click="print">打印</Button>
          <Button type="primary" style="display: block;margin-top: 15px;" @click="cancelPrint">取消打印</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script >
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import JsPDF from 'jspdf';
import { getAllWarehouse } from '@/utils/user';
import { getWarehouseId } from '@/utils/getService';

export default {
  name: 'printPickUpList',
  components: {},
  mixins: [Mixin],
  data () {
    return {
      printData: [],
      AllWarehouse: [],
      imgUrlPrefix: localStorage.getItem('imgUrlPrefix')
    };
  },
  created () {
    this.GetAllWarehouse();
    this.GetpickUpData();
  },
  props: {},
  watch: {},
  methods: {
    // 获取仓库数据
    GetAllWarehouse () {
      let v = this;
      getAllWarehouse().then((res) => {
        v.AllWarehouse = res;
      });
    }, // 获取打印补拣单的数据
    GetpickUpData () {
      let v = this;
      let obj = v.$route.query.data.split(',');
      let list = JSON.parse(localStorage.getItem('userInfoList'));
      v.axios.post(api.post_queryPrintSupplementPickingDetail, obj).then(res => {
        if (res.data.code === 0) {
          let info = res.data.datas;
          if (info.length > 0) {
            info.map((item) => {
              // 仓库
              if (v.AllWarehouse.length > 0) {
                v.AllWarehouse.map((talg, index) => {
                  if (talg.warehouseId === item.warehouseId) {
                    item.warehouseName = talg.warehouseName;
                  }
                });
              }
              // 补拣人员
              if (Object.keys(list).length > 0) {
                item.userName = list[item.supplementPickingUserId] ? list[item.supplementPickingUserId].userName : '';
              }
              // 表格数据
              let new_arr = v.handerGrouping(item.detailRelateRsList, function (item) {
                return [item.packageCode]; // 可添加多个属性 rowspan
              }, 'packageCode');
              let new_data = [];
              if (new_arr.length > 0) {
                new_arr.map((row) => {
                  if (row.data.length > 1) {
                    row.data.map((ele) => {
                      ele.rowspanLength = row.data.length;
                    });
                    row.data[0].rowspan = true;
                  }
                  new_data = [...new_data, ...row.data];
                });
              }
              item.details_data = new_data;
            });
          }
          this.printData = info;
        } else {
          this.$Message.warning({
            content: '操作失败',
            duration: 3
          });
        }
      });
    }, // 打印
    print () {
      window.print();
    }, // 取消打印
    cancelPrint () {
      window.location.href = '#/abnormalPicking?warehouseId=' + getWarehouseId(); ;
    }, // 下载
    download () {
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
    }
  }
};
</script >
<style lang="less">
.printPickUpList-page {
  padding: 50px;
  min-height: 960px;
  background-color: #ccc;
  #printBox {
    padding: 20px;
    position: relative;
  }
  .right-action-bar {
    position: absolute;
    right: -170px;
    top: 0;
    width: 160px;
  }
  .print-n-box {
    width: 1000px;
    margin: 0 auto;
    background-color: #ffffff;
  }
  .local-table {
    -webkit-border-horizontal-spacing: 0px;
    -webkit-border-vertical-spacing: 0px;
    border-top-width: 0px;
    border-right-width: 0px;
    border-bottom-width: 0px;
    border-left-width: 0px;
    border-top: 1px solid #9a9a9a;
    border-left: 1px solid #9a9a9a;
    table-layout: fixed;
  }

  .local-table td,
  .local-table th {
    text-align: center;
    border-bottom: 1px solid #9a9a9a;
    border-right: 1px solid #9a9a9a;
  }

  .information {
    padding: 10px 0;
  }
}

@media print {
  * {
    margin: 0;
    padding: 0;
    font-weight: bold;
  }

  html,
  body,
  #app {
    min-width: auto;
  }

  #printBox {
    padding: 10px;
    position: relative;
  }

  .printPickUpList-page {
    padding: 0px;
  }

  .print-none {
    display: none;
  }

  .print-n-box,
  .printPickUpList-page {
    background-color: #ffffff;
    margin: 0 auto;
  }
}
</style >
