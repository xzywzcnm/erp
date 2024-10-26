<template>
  <ColorPicker
    class="theme-picker"
    :recommend="true"
    transfer
    v-model="theme"></ColorPicker>
</template>

<script>
const ORIGINAL_THEME = '#2d8cf0' // 默认颜色
export default {
  data () {
    return {
      chalk: '', // content of theme-chalk css
      theme: ORIGINAL_THEME
    }
  },
  props: {
    colorValue: {
      type: String,
      default: '#2d8cf0'
    }
  },
  watch: {
    colorValue: {
      handler (n, o) {
        if (n !== o) {
          console.log('n:', n)
          this.$nextTick(function () {
            this.theme = n
          })
        }
      },
      immediate: true
    },
    theme (val, oldVal) {
      if (typeof val !== 'string') return
      this.setThemeStorage(val);
      const themeCluster = this.getThemeCluster(val.replace('#', ''))
      const originalCluster = this.getThemeCluster(oldVal.replace('#', ''))
      const getHandler = (variable, id) => {
        return () => {
          const originalCluster = this.getThemeCluster(ORIGINAL_THEME.replace('#', ''))
          const newStyle = this.updateStyle(this[variable], originalCluster, themeCluster)
          let styleTag = document.getElementById(id)
          if (!styleTag) {
            styleTag = document.createElement('style')
            styleTag.setAttribute('id', id)
            document.head.appendChild(styleTag)
          }
          styleTag.innerText = newStyle
        }
      }
      const chalkHandler = getHandler('chalk', 'chalk-style')
      window.aa = '2021年2月2日18:03:13'
      if (!this.chalk) {
        const url = `./static/css/theme/index.css`
        this.getCSSString(url, chalkHandler, 'chalk',originalCluster)
      } else {
        chalkHandler()
      }
      this.$emit('changeSuccess', val)
    }
  },

  methods: {
    /**
     *
     * @author gan
     * @date: 2021/1/15 9:31
     * @param value 主题色
     */
    setThemeStorage (value) {
      let data = {};
      if (localStorage.getItem('theme')) {
        data = JSON.parse(localStorage.getItem('theme'));
        data.themeColor = value;
        localStorage.setItem('theme',JSON.stringify(data));
      } else {
        data.themeColor = value;
        localStorage.setItem('theme',JSON.stringify(data));
      }
    },
    /**
     * 更新样式
     * @author gan
     * @date: 2021/1/15 9:31
     * @param style 样式
     * @param oldCluster 原样式
     * @param newCluster 新样式
     */
    updateStyle (style, oldCluster, newCluster) {
      let newStyle = style
      oldCluster.forEach((color, index) => {
        newStyle = newStyle.replace(new RegExp(color, 'ig'), newCluster[index])
      })
      return newStyle
    },
    /**
     * 获取原始样式
     * @author gan
     * @date: 2021/1/15 9:33
     * @param url
     * @param callback
     * @param variable 样式
     * @param colorList 需匹配的样式
     */
    getCSSString (url, callback, variable, colorList) {
      const xhr = new XMLHttpRequest()
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
           let regexp = new RegExp('\\.[^\\{}]*?\\{[^\\{]*?('+ ORIGINAL_THEME+'|'+ colorList.join('|')+')[^\\{]*?}','gi')
          this[variable] = xhr.responseText.match(regexp).join('')
          callback()
        }
      }
      xhr.open('GET', url)
      xhr.send()
    },

    getThemeCluster (theme) {
      const tintColor = (color, tint) => {
        let red = parseInt(color.slice(0, 2), 16)
        let green = parseInt(color.slice(2, 4), 16)
        let blue = parseInt(color.slice(4, 6), 16)

        if (tint === 0) { // when primary color is in its rgb space
          return [red, green, blue].join(',')
        } else {
          red += Math.round(tint * (255 - red))
          green += Math.round(tint * (255 - green))
          blue += Math.round(tint * (255 - blue))

          red = red.toString(16)
          green = green.toString(16)
          blue = blue.toString(16)

          return `#${red}${green}${blue}`
        }
      }

      const shadeColor = (color, shade) => {
        let red = parseInt(color.slice(0, 2), 16)
        let green = parseInt(color.slice(2, 4), 16)
        let blue = parseInt(color.slice(4, 6), 16)

        red = Math.round((1 - shade) * red)
        green = Math.round((1 - shade) * green)
        blue = Math.round((1 - shade) * blue)

        red = red.toString(16)
        green = green.toString(16)
        blue = blue.toString(16)

        return `#${red}${green}${blue}`
      }

      const clusters = [theme]
      for (let i = 0; i <= 9; i++) {
        clusters.push(tintColor(theme, Number((i / 10).toFixed(2))))
      }
      clusters.push(shadeColor(theme, 0.1))
      return clusters
    }
  }
}
</script>

<style>
.theme-picker .el-color-picker__trigger {
  vertical-align: middle;
}

.theme-picker-dropdown .el-color-dropdown__link-btn {
  display: none;
}
</style>
