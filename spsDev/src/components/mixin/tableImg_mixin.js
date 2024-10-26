// 权限
export default {
  methods: {
    tableImg(h, params, imgKey, no) {
      let productPic = params.row[imgKey];
      let pic = (no || productPic) ? productPic : this.placeholderSrc;
      // sps 有些接口没带前缀 - -、
      if (pic && !pic.includes('filenode') && !pic.includes('http://') && !pic.includes('https://')) {
        pic = `${this.filenodeViewTargetUrl}${pic}`;
      }
      return h('Poptip', {
        props: {
          placement: 'right',
          trigger: 'hover',
          transfer: true
        },
        style: {
          width: '46px',
          height: '46px',
          objectFit: 'cover',
          verticalAlign: 'middle'
        }
      }, [
        h('div', {}, [
          h('img', {
            attrs: {
              src: pic ? pic : placeholder
            },
            on: {
              error: (event) => {
                let img = event.target || event.srcElement || (event.path && event.path[0] ? event.path[0] : null);
                if (this.$common.isEmpty(img)) return;
                img.src = placeholder;
                img.onerror = null;
              }
            },
            style: {
              width: '46px',
              height: '46px',
              objectFit: 'cover',
              verticalAlign: 'middle',
              cursor: 'pointer'
            }
          })
        ]), h('img', {
          slot: 'content',
          props: {},
          attrs: {
            src: pic
          },
          on: {
            error: (event) => {
              let img = event.target || event.srcElement || (event.path && event.path[0] ? event.path[0] : null);
              if (this.$common.isEmpty(img)) return;
              img.src = '';
              img.onerror = null;
              img.style.width = '0px';
            }
          },
          style: {
            width: pic ? '400px' : '0px',
            height: 'auto',
            verticalAlign: 'middle'
          }
        })
      ]);
    },
  },
}