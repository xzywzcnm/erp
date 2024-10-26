export default {
  data() {
    return {
      isCheck: false,
      isAgain: false,
    };
  },
  methods: {
    inventDifferenceModal(row) {
      this.isCheck = false;
      this.isAgain = false;
      // console.log(row)
      // isReplay: 是否复盘单（0 或 null：不是，1：是）
      const isReplay = [1, "1"].includes(row.isReplay);
      let title = "";
      if (isReplay) {
        title = "复盘单完成盘点";
      } else {
        title = "首次盘完成盘点";
      }
      let v = this;
      return new Promise((resolve) => {
        v.$Modal.confirm({
          title: title, // '盘点完成',
          render(h) {
            return h("div", {}, [
              h(
                "p",
                {
                  style: {
                    margin: "10px 0 5px",
                  },
                },
                "当前盘点结果存在盘亏/盘盈数据，完成盘点后差异数据会自动生成库存调整单并执行调整，是否继续"
              ),
              h(
                "Checkbox",
                {
                  props: {
                    value: v.isCheck,
                  },
                  on: {
                    "on-change"(val) {
                      v.isCheck = val;
                      if (val) v.isAgain = false;
                    },
                  },
                },
                "差异数据自动生成调整单"
              ),
              h(
                "Checkbox",
                {
                  props: {
                    value: v.isAgain,
                  },
                  style: {
                    display: !isReplay ? "block" : "none",
                    marginTop: "5px",
                  },
                  on: {
                    "on-change"(val) {
                      v.isAgain = val;
                      if (val) v.isCheck = false;
                    },
                  },
                },
                "差异数据自动生成复盘单"
              ),
            ]);
          },
          closable: true,
          onOk() {
            resolve({ isCheck: v.isCheck, isAgain: v.isAgain });
          },
        });
      });
    },
  },
};
