<template>
  <div>
    <Table
      border
      :columns="columns1"
      :data="problemDetailList"
      max-height="700"
    >
      <template slot-scope="{ row }" slot="picture">
        <div style="display: flex; flex-wrap: wrap">
          <div
            v-for="(item, index) in row.checkAttachmentList"
            :key="index"
            style="margin-right: 5px"
          >
            <large-picture :url="item" imageHigh="60px">
              <slot name="picslot"></slot>
            </large-picture>
          </div>
        </div>
        <!-- <large-picture :url="row.imgUrl || row.thumbUrl">
              <slot name="picslot"></slot>
            </large-picture> -->
      </template>
    </Table>
  </div>
</template>

<script>
import largePicture from "@/components/largePicture";
export default {
  components: { largePicture },
  props: {
    problemDetailList: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  data() {
    return {
      columns1: [
        {
          title: "基本信息",
          key: "age",
          width: "300px",
          render: (h, params) => {
            return h("div", [
              h(
                "div",
                {
                  style: { display: "flex", margin: "4px 0 1px 0" },
                },
                [
                  h(
                    "div",
                    {
                      style: {},
                    },
                    "质检记录号："
                  ),
                  h(
                    "span",
                    {
                      style: {},
                    },
                    params.row.receiptBatchCheckDetailNo
                  ),
                ]
              ),
              h(
                "div",
                {
                  style: { display: "flex", margin: "4px 0 1px 0" },
                },
                [
                  h(
                    "div",
                    {
                      style: {},
                    },
                    "SKU："
                  ),
                  h(
                    "span",
                    {
                      style: {},
                    },
                    params.row.sku
                  ),
                ]
              ),
              h(
                "div",
                {
                  style: { margin: "4px 0 1px 0" },
                  class: "",
                  attrs: { title: params.row.supplierName },
                },
                params.row.description
              ),
              h(
                "div",
                {
                  style: { display: "flex", margin: "4px 0 1px 0" },
                },
                [
                  h(
                    "div",
                    {
                      style: { color: "#538f41" },
                    },
                    params.row.goodsAttributes
                  ),
                  // h(
                  //   "span",
                  //   {
                  //     style: { color: "#538f41" },
                  //   },
                  //   "紫色"
                  // ),
                  // h(
                  //   "div",
                  //   {
                  //     style: { marginLeft: "5px", color: "#538f41" },
                  //   },
                  //   "Size："
                  // ),
                  // h(
                  //   "span",
                  //   {
                  //     style: { color: "#538f41" },
                  //   },
                  //   "4XL"
                  // ),
                ]
              ),
            ]);
          },
        },
        {
          title: "问题原因",
          key: "address",
          width: 150,
          render: (h, params) => {
            return h(
              "div",
              {
                style: { margin: "4px 0 1px 0" },
                class: "",
                attrs: { title: params.row.supplierName },
              },
              params.row.problemCheckReason
            );
          },
        },
        {
          title: "质检图片",
          key: "image",
          slot: "picture",
          width: "240px",
        },
        {
          title: "备注",
          key: "remark",
        },
        {
          title: "问题数量",
          key: "problemCheckNumber",
          width: 90,
        },
        {
          title: "退货数量",
          key: "refundNumber",
          width: 90,
        },
        {
          title: "销毁数量",
          key: "destructionNumber",
          width: 90,
        },
        {
          title: "剩余数量",
          key: "remainNumber",
          width: 90,
        },
      ],
      data1: [
        {
          name: "John Brown",
          age: 18,
          address: "New York No. 1 Lake Park",
          date: "2016-10-03",
          imgUrlList: [
            {
              imgUrl:
                "https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fpic1.win4000.com%2Fwallpaper%2F2019-01-08%2F5c34353d16f4b.jpg&refer=http%3A%2F%2Fpic1.win4000.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1665905867&t=bc58d6c34f857ce8a0dbdd0fe744d5eb",
            },
            {
              imgUrl:
                "https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fpic1.win4000.com%2Fwallpaper%2F2019-01-08%2F5c34353d16f4b.jpg&refer=http%3A%2F%2Fpic1.win4000.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1665905867&t=bc58d6c34f857ce8a0dbdd0fe744d5eb",
            },
            {
              imgUrl:
                "https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fpic1.win4000.com%2Fwallpaper%2F2019-01-08%2F5c34353d16f4b.jpg&refer=http%3A%2F%2Fpic1.win4000.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1665905867&t=bc58d6c34f857ce8a0dbdd0fe744d5eb",
            },
          ],
        },
        {
          name: "Jim Green",
          age: 24,
          address: "London No. 1 Lake Park",
          date: "2016-10-01",
        },
        {
          name: "Joe Black",
          age: 30,
          address: "Sydney No. 1 Lake Park",
          date: "2016-10-02",
        },
        {
          name: "Jon Snow",
          age: 26,
          address: "Ottawa No. 2 Lake Park",
          date: "2016-10-04",
        },
        {
          name: "Jon Snow",
          age: 26,
          address: "Ottawa No. 2 Lake Park",
          date: "2016-10-04",
        },
      ],
    };
  },
};
</script>

<style>
</style>