<template>
  <Form :model="data" :label-width="90" class="fmb10 form-contain-disabled">
    <FormItem label="供应商名称:">
      <span>{{gooDetail.supplierName || '-'}}</span>
    </FormItem>
    <FormItem label="供方货号:">
      <span>{{gooDetail.suppliernNo || '-'}}</span>
    </FormItem>
    <FormItem label="商品末级分类:">
      <span>{{gooDetail.goodType || '-'}}</span>
    </FormItem>
    <FormItem label="是否有库存:">
      <span v-if="typeof gooDetail.isStock == 'number'">
        {{gooDetail.isStock === 1 ? '否' : '是'}}
      </span>
      <span v-else>-</span>
    </FormItem>
    <template v-if="gooDetail.isStock === 1">
      <FormItem label="货期（天）:">
        <span>{{gooDetail.goodDate || 0}}</span>
      </FormItem>
      <FormItem label="起订量:">
        <span>{{typeof gooDetail.minimumOrderQuantity == 'number' ? gooDetail.minimumOrderQuantity : 0}}</span>
      </FormItem>
    </template>
    <FormItem label="尺码类型:">
      <span>{{sizeTypeJson[gooDetail.sizeType] || '-'}}</span>
    </FormItem>
    <FormItem label="分尺码定价:">
      <span v-if="typeof gooDetail.isSize == 'number'">
        {{gooDetail.isSize === 1 ? '否' : '是'}}
      </span>
      <span v-else>-</span>
    </FormItem>

    <FormItem label="可售尺码:">
      <div v-for="(item,key) in sizeTypeList" :key="'xy'+key">
        <div style="display:flex;" v-if="item.list&&item.list.length">
          <span style="width: 60px;overflow:hidden;">{{item.sizeName}}：</span>
          <CheckboxGroup v-model="item.sizeList" style="flex:1;">
            <Checkbox :label="item.sizeId" disabled v-for="(item,index) in item.list" :key="`${item.sizeId}-${index}`">
              {{item.size}}
            </Checkbox>
          </CheckboxGroup>
        </div>
      </div>

      <!-- <span v-else>-</span> -->
    </FormItem>

    <FormItem label="尺码表:">
      <large-picture :url="handlePic(gooDetail.sizeImageUrl)" :smallStyle="{width: '60px',height: '60px'}" :config="{trigger: 'click'}" class="mr10" />
      <a href="javascript:;" @click="download({color: '尺码表'},gooDetail.sizeImageUrl)">下载</a>
    </FormItem>

    <FormItem label="价格:">
      <table v-if="rowSpanMerge.list.length > 0" border="1" bordercolor="#333" width="300" cellspacing="0" cellpadding="0" class="tablePrice">
        <thead>
          <tr>
            <th>尺码</th>
            <th>价格（人民币）</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item,index) in rowSpanMerge.list" :key="'x'+index">
            <td>{{item.size}}</td>
            <td v-if="rowSpanMerge.span[index] && rowSpanMerge.span[index].includes(index)" :rowspan="rowSpanMerge.span[index].length">
              {{typeof item.price == 'number' ? item.price : !item.price ? '' : item.price}}
            </td>
          </tr>
        </tbody>
      </table>
      <span v-else>-</span>
    </FormItem>
    <FormItem label="备注:">
      <span>{{gooDetail.remark || '-'}}</span>
    </FormItem>
    <FormItem label="颜色及图片:" v-if="Object.values(laPaColorVOList).length">
      <span>第1颜色至少上传2张图，其他颜色至少上传1张，每个颜色最多可上传5张图片，每张图片大小不超过5M</span>
    </FormItem>
    <template v-if="Object.values(laPaColorVOList).length">
      <FormItem label="颜色:">
        <div v-for="(item,index) in Object.values(laPaColorVOList)" :key="`y${index}`">
          <div>{{item.color}}</div>
          <div class="flexCenter">
            <div v-for="(child, childIndex) in item.pictureUrllist" :key="`child_${childIndex}`">
              <large-picture :url="handlePic(child)" :smallStyle="{width: '60px',height: '60px'}" :config="{trigger: 'click'}" class="mr10" />
              <a href="javascript:;" @click="download(item,child)">下载</a>
            </div>
          </div>
        </div>
      </FormItem>
    </template>
  </Form>
</template>

<script>
import largePicture from '@/components/largePicture';
import api from '@/api/api.js';
import { compareFun } from '@/views/pds/newProducts/components/sizeCompare.js';
// import {urlSetting} from "@/utils/urlSet.js";
export default {
  components: { largePicture },
  data () {
    return {
      columns: [
        {
          title: '尺码',
          key: 'num'
        },
        {
          title: '价格（人民币）',
          key: 'price'
        },
      ],
      gooDetail: {},
      categoryList: [],
      // 尺码价格列表
      rowSpanMerge: {
        list: [],
        span: {}
      },
      laPaColorVOList: {},
      sizeTypeJson: {},
      sizeTypeDefualt: [
        { typeName: '大码女装', sizeTypeId: 0 },
        { typeName: '标准女装', sizeTypeId: 1 },
        { typeName: '男装', sizeTypeId: 2 },
        { typeName: '童装', sizeTypeId: 3 }
      ],
      sizeTypeList: {}
    };
  },
  props: {
    data: {
      type: Object,
      default () {
        return {};
      }
    },
    otherData: {
      type: Object,
      default () {
        return {};
      }
    }
  },
  watch: {
    data: {
      handler (newVal) {
        if (newVal && (JSON.stringify(newVal) !== '{}')) {
          this.init(JSON.parse(JSON.stringify(newVal)));
        }
      },
      deep: true,
      immediate: true
    },
    otherData: {
      deep: true,
      handler (newVal = {}) {
        this.categoryList = newVal.categoryList || []; //末级分类列表
      }
    }
  },
  created () {
    this.getTypelist();
  },
  methods: {
    // 初始化数据
    init (temp) {
      // temp.checkedsizeList = temp.laPaGoodsSizeVOList ? temp.laPaGoodsSizeVOList.map(k => {
      //   return k.sizeId;
      // }) : [];

      // 价格行合并处理（不做排序和相同价格筛选，只是顺序上统一价格合并）
      if (temp.laPaGoodsSizeVOList) {
        let rowSpan = { index: 1, rows: [0] };
        temp.laPaGoodsSizeVOList.forEach((item, index) => {
          if (index > 0) {
            if (temp.laPaGoodsSizeVOList[index - 1].price === item.price) {
              rowSpan.index++;
              rowSpan.rows.push(index);
            } else {
              this.rowSpanMerge.span[index - rowSpan.index] = rowSpan.rows;
              rowSpan.index = 1;
              rowSpan.rows = [index];
            }
          }
          if (temp.laPaGoodsSizeVOList.length == 1) {
            this.rowSpanMerge.span[index] = rowSpan.rows;
          } else if (index + 1 == temp.laPaGoodsSizeVOList.length) {
            this.rowSpanMerge.span[index - rowSpan.index + 1] = rowSpan.rows;
          }
        });
      }
      // 颜色图片列处理
      let colorObj = {};
      if (temp.laPaColorVOList && temp.laPaColorVOList.length) {
        temp.laPaColorVOList.forEach(item => {
          item.pictureUrllist = [];
          const pictureUrl = item.pictureUrl ? item.pictureUrl.split(',') : [];
          if (colorObj[item.colorId]) {
            colorObj[item.colorId].pictureUrllist = colorObj[item.colorId].pictureUrllist.concat(pictureUrl);
          } else {
            colorObj[item.colorId] = { ...item, pictureUrllist: pictureUrl };
          }
        });
      }
      this.laPaColorVOList = colorObj;
      this.gooDetail = temp; //详情
      this.rowSpanMerge.list = temp.laPaGoodsSizeVOList;  // 尺码价格

      this.queryProductSizeList(temp);
    },
    // 下载图片
    download (item, url) {
      const name = `${item.color || ''}-${typeof item.firstPicture == 'undefined' ? '' : item.firstPicture}`;
      this.$Spin.show({
        render: (h) => {
          return h('div', '正在下载...');
        }
      });
      let xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);    // 也可用POST方式
      xhr.responseType = "blob";
      xhr.onload = () => {
        if (xhr.status === 200) {
          const blob = xhr.response;
          if (navigator.msSaveBlob == null) {
            let a = document.createElement('a');
            a.download = name;
            a.href = window.URL.createObjectURL(blob);
            // eslint-disable-next-line no-undef
            $("body").append(a);    // 修复firefox中无法触发click
            a.click();
            URL.revokeObjectURL(a.href);
            // eslint-disable-next-line no-undef
            $(a).remove();
          } else {
            navigator.msSaveBlob(blob, 'name');
          }
          this.$Message.success('下载成功~');
        } else {
          this.$Message.error('下载失败~');
        }
      };
      xhr.send && xhr.send();
      this.$Spin.hide();
    },
    // 获取尺码类型
    getTypelist () {
      this.$axios.get(api.queryProductSizeTypeList).then(({ datas, code }) => {
        if (code === 0) {
          // this.sizeList = datas || [];
          (datas.length > 0 ? datas : this.sizeTypeDefualt).forEach(item => {
            this.$set(this.sizeTypeJson, item.sizeTypeId, item.typeName);
          });
        }
      });
    },
    // 根据尺码类型获取尺码组
    queryProductSizeList (temp) {
      let { sizeType } = temp;
      this.$axios
        .get(api.queryProductSizeTypeRel, { params: { sizeTypeId: sizeType } })
        .then(({ code, datas }) => {
          if (code !== 0) return;
          let list = this.sortSize(datas || []);
          let type = { 1: "尺码组1", 2: "尺码组2" };
          let obj = {};
          list.forEach(k => {
            if (!obj[k.sizeGroupNo]) {
              obj[k.sizeGroupNo] = { sizeList: [], sizeName: type[k.sizeGroupNo], list: [] };
            }
            obj[k.sizeGroupNo].list = obj[k.sizeGroupNo].list.concat(k.sizeList || []);
          });

          temp.laPaGoodsSizeVOList.forEach(k => {
            Object.keys(obj).forEach(item => {
              if (k.sizeGroupNo === (item - 0)) {
                obj[item].sizeList.push(k.sizeId);
              }
            });
          });

          // 标准女装现由尺码组一二改为现款和打版，但是推款是不存在打版的，所以这里屏蔽掉尺码组二
          if (sizeType == 1) {
            delete obj[2];
          }

          this.sizeTypeList = obj;
        });
    },
    // 对尺码排序
    sortSize (list) {
      list.forEach(k => {
        if (!(k.sizeList && k.sizeList.length)) return;
        const newList = k.sizeList.filter(item => {
          return typeof item.sortNo == 'number'
        })
        const noSortList = k.sizeList.filter(item => {
          return typeof item.sortNo != 'number'
        })
        noSortList.sort(compareFun('sizeId'));
        newList.sort(compareFun('sortNo'));
        k.sizeList = [...newList, ...noSortList];
      })
      return list
    },
    // 处理图片
    handlePic (url) {
      return url ? url.split(',')[0] : '';
      //return urlSetting(url);
    },
  }
};
</script>
<style scoped>
.tablePrice th,
.tablePrice td {
  text-align: center;
  padding: 6px 10px;
  height: 20px;
  line-height: 20px;
}
</style>