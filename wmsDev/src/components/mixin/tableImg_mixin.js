// 权限
export default {
  data() {
    return {
      normalPic: './static/images/placeholder.jpg', // 默认图片路径
    }
  },
  methods: {
    tableImg(h, url) {
      let imgUrl = this.urlSetting(url);
      const isNormalPic = this.normalPic === imgUrl;
      return h(
        "Poptip",
        {
          props: {
            placement: "right",
            trigger: "hover",
            transfer: true,
            disabled: isNormalPic,
          },
          style: {
            width: "46px",
            height: "46px",
            objectFit: "cover",
            verticalAlign: "middle",
          },
        },
        [
          h("div", {}, [
            h("img", {
              attrs: {
                src: imgUrl,
                // onerror: "javascript:this.src='./static/images/placeholder.jpg'",
              },
              style: {
                width: "46px",
                height: "46px",
                objectFit: "cover",
                verticalAlign: "middle",
                cursor: isNormalPic ? 'unset' : 'pointer',
              },
            }),
          ]),
          h("img", {
            slot: "content",
            props: {},
            attrs: {
              src: imgUrl,
            },
            style: {
              width: "400px",
              height: "auto",
              verticalAlign: "middle",
            },
          }),
        ]
      );
    },
    // 图片路径配置
    urlSetting(url) {
      if (!url) return this.normalPic;
      let exp = /(http|https):\/\/([\w.]+\/?)\S*/;
      let { filenodeViewTargetUrl } = this.$store.state.erpConfig || {};
      let isBase64 = !!(url.indexOf('data:image') >= 0);
      if (exp.test(url) || !filenodeViewTargetUrl || (url.indexOf(filenodeViewTargetUrl) >= 0) || isBase64) {
        return this.addSizeToImageUrl(url);
      }
      return this.addSizeToImageUrl(filenodeViewTargetUrl + url);
    },
    addSizeToImageUrl(url, size = { width: '45', height: '45' }) {
      // 检查URL中是否已经存在问号（?），如果不存在则添加
      const hasQuery = url.includes('?');
      const separator = hasQuery ? '&' : '?';
      // 拼接新的尺寸参数
      return `${url}${separator}width=${size.width}&height=${size.height}`;
    }
  },
}