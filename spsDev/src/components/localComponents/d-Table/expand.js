export default {
  name: 'TableExpand',
  functional: true,
  props: {
    row: Object,
    render: Function,
    index: Number,
    column: {
      type: Object,
      default: null
    }
  },
  render: (h, ctx) => {
    const params = {
      row: ctx.props.row,
      index: ctx.props.index
    };
    if (ctx.props.column) params.column = ctx.props.column;
    if (ctx.props.render(h, params) === undefined || ctx.props.render(h, params) === null) return;
    if (Object.prototype.hasOwnProperty.call(ctx.props.render(h, params), 'childrens') && ctx.props.render(h, params).childrens !== undefined) {
      var cp = ctx.props.render(h, params).childrens;
      if (typeof cp === 'object') {
        var pos = [];
        for (let i = 0; i < cp.length; i++) {
          var str = h(cp[i][0], {
            props: Object.prototype.hasOwnProperty.call(cp[i][1], 'props') ? cp[i][1].props : '',
            class: Object.prototype.hasOwnProperty.call(cp[i][1], 'class') ? cp[i][1].class : '',
            on: Object.prototype.hasOwnProperty.call(cp[i][1], 'on') ? cp[i][1].on : ''
          }, cp[i][2]);
          pos.push(str);
        }
        return pos;
      } else {
        return ctx.props.render(h, params).childrens;
      }
    } else if (typeof ctx.props.render(h, params) !== 'object') {
      return h('span', ctx.props.render(h, params));
    } else {
      return ctx.props.render(h, params);
    }
  }
};
