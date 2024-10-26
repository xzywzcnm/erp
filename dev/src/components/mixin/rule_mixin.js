import api from '@/api/api';

export default {
  data () {
    return {
      greaterSign: [{
        label: '≥',
        value: '0'
      }, {
        label: '>',
        value: '1'
      }, {
        label: '=',
        value: '2'
      }],
      LessSign: [{
        label: '<',
        value: '0'
      }, {
        label: '≤',
        value: '1'
      }],
      andOr: [
        {
          label: '并且',
          value: '0'
        },
        {
          label: '或者',
          value: '1'
        }
      ],
      isBy: [
        {
          label: '以',
          value: '0'
        },
        {
          label: '不以',
          value: '1'
        }
      ],
      platform: [
        {
          platformId: 'all',
          value: '',
          name: '全部'
        }
      ],
      shipmentPlatformList: [],
      sitesList: [],
      platformAccountList: [],
      sitesArr: [],
      accountSite: [],
      countryData: [],
      countryCodes: [],
      postcodeArea: '',
      countryCodesName: '',
      sourceText: {
        platformIds: [],
        siteIds: [],
        saleAccountIds: []
      },
      postcodeArr: [
        {
          postcode1: '',
          postcode2: ''
        }
      ]
    };
  },
  methods: {
    /**
     * @date: 2021/10/19 16:14
     * @param obj  object [id  values]
     */
    OnRuleTempAbnormalConfirm (obj) {
      this.rules.forEach(i => {
        if (i.id === obj.id) {
          i.values = Object.assign(i.values, obj.values);
        }
      });
    },
    /**
     * 获取平台
     * */
    getEnablePlatform () {
      let v = this;
      return new Promise(resolve => {
        v.axios.get(api.get_queryEnablePlatform).then(response => {
          if (response.data.code === 0) {
            resolve(response.data.datas);
          }
        });
      });
    },
    getSites (platformArr) {},
    streetsRemove (index, sIndex) {
      this.rules[index].values['streets'].splice(sIndex, 1);
    },
    streetsAdd (index) {
      if (!this.rules[index].values['streets']) {
        this.rules[index].values['streets'] = [];
      }
      this.rules[index].values['streets'].push({
        value: ''
      });
    },
    getTreeData (val, id) {
      let v = this;
      let nodesArr = v.$refs['treeSelectRef1'][0].getCheckedNodes();
      let arr = [];
      nodesArr.forEach((n, i) => {
        // eslint-disable-next-line no-prototype-builtins
        if (n.hasOwnProperty('zoneCode')) {
          arr.push(n.zoneCode);
        }
      });
      v.rules.forEach(i => {
        if (i.id === id) {
          i.values['countryCodes'] = arr;
        }
      });
    },
    countryCodesAndPostCodeIO (type, id, obj) {
      let v = this;
      if (type === 'input') {
        let arr = [];
        if (obj.values['postalCodeType'] === 0) {
          v.postcodeArr.forEach(i => {
            arr.push({
              value: i.postcode1 + '-' + i.postcode2
            });
          });
        } else {
          arr = [
            {
              value: v.postcodeArea
            }
          ];
        }
        v.rules.forEach(i => {
          if (i.id === id) {
            i.values['buyerPostalCodes'] = arr;
          }
        });
      } else if (type === 'output') {
        v.rules.forEach(i => {
          if (i.id === id) {
            if (obj.values['postalCodeType'] === 0) {
              v.postcodeArr = [];
              i.values['buyerPostalCodes'].forEach(j => {
                v.postcodeArr.push(
                  {
                    postcode1: j.value.split('-')[0],
                    postcode2: j.value.split('-')[1]
                  }
                );
              });
            } else {
              v.postcodeArea = i.values['buyerPostalCodes'][0].value;
            }
          }
        });
      }
    },
    getPostCodeType (value) {
      let v = this;
      v.postcodeOne = '';
      v.postcodeTwo = '';
      v.postcodeArea = '';
      v.postcodeArr = [
        {
          postcode1: '',
          postcode2: ''
        }
      ];
    },
    // 增加邮编
    addPostcodeFn () {
      let canAdd = true;
      this.postcodeArr.forEach(item => {
        if (item.postcode1 === '' || item.postcode2 === '') {
          canAdd = false;
        }
      });
      if (!canAdd) {
        this.$Message.error('请将邮编段填写完整');
        return false;
      }
      let obj = {
        postcode1: '',
        postcode2: ''
      };
      this.postcodeArr.push(obj);
    }, // 删除邮编
    deletePostcodeFn (index) {
      this.postcodeArr.splice(index, 1);
    },
    getCommonCountry (selectArr) { // 国家 树
      let v = this;
      return new Promise(resolve => {
        if (sessionStorage.getItem('countryData') && JSON.parse(sessionStorage.getItem('countryData')).length > 0) {
          makeTree(JSON.parse(sessionStorage.getItem('countryData')));
        } else {
          v.axios.get(api.erpServiceCommon + api.commonService + api.get_commonCountry).then(response => {
            if (response.data.code === 0) {
              const data = response.data.datas;
              sessionStorage.setItem('countryData', JSON.stringify(data));
              makeTree(data);
            }
          });
        }

        function makeTree (data) {
          if (!selectArr) selectArr = [];
          let arr = [
            {
              title: '全部',
              check: false,
              expand: true,
              children: []
            }
          ];
          data.forEach((n, i) => {
            let checked = false;
            selectArr.forEach((k, g) => {
              k = k.value;
              if (k === n.zoneCode) {
                checked = true;
              }
            });
            let obj = {
              title: n.zoneCnName,
              expand: false,
              checked: checked,
              zoneCode: n.zoneCode,
              children: []
            };
            if (n.countries.length > 1) {
              n.countries.forEach((m, t) => {
                let checked = false;
                selectArr.forEach((k, g) => {
                  k = k.value;
                  if (k.indexOf('.') > 0) {
                    if (m.hasOwnProperty('twoCode') && k.split('.')[1] === m.twoCode) {
                      checked = true;
                    }
                  }
                });
                let subObj = {
                  title: m.cnName,
                  expand: false,
                  checked: checked,
                  zoneCode: n.zoneCode + '.' + m.twoCode,
                  children: []
                };
                obj.children.push(subObj);
              });
            } else if (n.countries.length === 1) {
              n.countries.forEach(i => {
                selectArr.forEach(j => {
                  if (i.zoneCode + '.' + i.zoneCode === j.value) {
                    obj.checked = true;
                  }
                });
              });

              obj.zoneCode = n.zoneCode + '.' + n.countries[0].twoCode;
            }
            arr[0].children.push(obj);
          });
          v.$nextTick(function () {
            v.countryData = arr;
            resolve(true);
          });
        }
      });
    },
    getCommonCountryName (selectArr) { // 获取对应国家名字
      let v = this;
      if (!selectArr || selectArr.length === 0) return false;
      return new Promise(resolve => {
        if (sessionStorage.getItem('countryData') && JSON.parse(sessionStorage.getItem('countryData')).length > 0) {
          makeTreeName(JSON.parse(sessionStorage.getItem('countryData')));
        } else {
          v.axios.get(api.erpServiceCommon + api.commonService + api.get_commonCountry).then(response => {
            if (response.data.code === 0) {
              const data = response.data.datas;
              sessionStorage.setItem('countryData', JSON.stringify(data));
              makeTreeName(data);
            }
          });
        }

        function makeTreeName (data) {
          let arr = [];
          data.forEach((n, i) => {
            selectArr.forEach((k, g) => {
              k = k.value;
              if (k.indexOf('.') > 0) {
                if (n.zoneCode === k.split('.')[0]) {
                  if (n.countries && n.countries.length > 0) {
                    n.countries.forEach((g, l) => {
                      if (k.split('.')[1] === g.twoCode) {
                        arr.push(g.cnName);
                      }
                    });
                  }
                }
              } else {
                if (k === n.zoneCode) {
                  arr.push(n.zoneCnName);
                }
              }
            });
          });
          v.countryCodesName = arr.toString();
        }
      });
    }
  },
  watch: {

  }
};
