<template >
  <div >
    <Card class="mt10" dis-hover >
      <Row >
        <Col span="7" >
          <div >
            <div class="big-img-box" >
              <local-img-zoom :src="imgSrc" :bigsrc="imgSrc" ></local-img-zoom >
            </div >
            <div class="carousel-box" >
              <div class="img-box-prev" @click="prev" ></div >
              <div style="padding:  0 15px;" >
                <div style="overflow: hidden;position: relative;height: 60px;" ref="carousel" >
                  <div :style="{ width: list.length * 66 + 'px' }" class="carousel-img-box" ref="carouselItem" >
                    <img
                        class="img-item fl"
                        v-for="(item, imgIndex) in list"
                        :src="item.src"
                        width="60"
                        height="60"
                        :key="imgIndex"
                        @click="activeImg(item.src)" />
                  </div >
                </div >
              </div >
              <div class="img-box-next" @click="next" >></div >
            </div >
          </div >
        </Col >
        <Col span="16" offset="1" >
          <Card dis-hover title="商品信息" >
            <Row >
              <Col span="6" class="receipt-top-box" >
                <p class="receipt-top-label" >入库单号：</p >
                <p class="receipt-top-text" :title="detail.receiptNo" >
                  {{ detail.receiptNo }} </p >
              </Col >
              <Col span="6" class="receipt-top-box" >
                <p class="receipt-top-label" >批次号：</p >
                <p class="receipt-top-text" :title="detail.receiptNo" >
                  {{ detail.receiptBatchNo }} </p >
              </Col >
              <Col span="6" class="receipt-top-box" >
                <p class="receipt-top-label" >收货库区：</p >
                <p class="receipt-top-text" >收货库区</p >
              </Col >
              <Col span="6" class="receipt-top-box" >
                <p class="receipt-top-label" >收货库位：</p >
                <p class="receipt-top-text" :title="detail.warehouseLocationName" >
                  {{ detail.warehouseLocationName }} </p >
              </Col >
              <Col span="6" class="receipt-top-box" >
                <p class="receipt-top-label" >SKU：</p >
                <p class="receipt-top-text" :title="detail.goodsSku" >
                  {{ detail.goodsSku }} </p >
              </Col >
              <Col span="6" class="receipt-top-box" >
                <p class="receipt-top-label" >中文描述：</p >
                <p class="receipt-top-text" :title="detail.goodsCnDesc" >
                  {{ detail.goodsCnDesc }} </p >
              </Col >
              <Col span="6" class="receipt-top-box" >
                <p class="receipt-top-label" >英文描述：</p >
                <p class="receipt-top-text" :title="detail.goodsEnDesc" >
                  {{ detail.goodsEnDesc }} </p >
              </Col >
              <Col span="6" class="receipt-top-box" >
                <p class="receipt-top-label" >重量(g)：</p >
                <p class="receipt-top-text" :title="detail.goodsWeight" >
                  {{ detail.goodsWeight }} </p >
              </Col >
              <Col span="6" class="receipt-top-box" >
                <p class="receipt-top-label" >长宽高(cm)：</p >
                <p
                    class="receipt-top-text" :title="
                    detail.goodsLength +
                      '*' +
                      detail.goodsWidth +
                      '*' +
                      detail.goodsHeight
                  " >
                  {{ detail.goodsLength }}*{{ detail.goodsWidth }}*{{ detail.goodsHeight }} </p >
              </Col >
              <Col span="6" class="receipt-top-box" >
                <p class="receipt-top-label" >质检状态：</p >
                <p class="receipt-top-text" >
                  <span style="color:green;" v-if="detail.checkStatus === '0'" >待质检</span > <span
                    style="color:green;"
                    v-if="detail.checkStatus === '1'" >部分质检</span > <span
                    style="color:green;"
                    v-if="detail.checkStatus === '2'" >质检完成</span >
                </p >
              </Col >
              <!-- <Col span="6">
                              <p><span class="receipt-top-label">SKU：</span>{{detail.goodsSku}}</p>
                              <p><span class="receipt-top-label">重量(g)：</span>{{detail.goodsWeight}}</p>
                          </Col>
                          <Col span="6">
                              <p><span class="receipt-top-label"></span>{{detail.receiptBatchNo}}</p>
                              <p><span class="receipt-top-label">SKU属性：</span>{{detail.goodsAttributes}}</p>
                              <p><span class="receipt-top-label">长宽高(cm)：</span>{{detail.goodsLength}}*{{detail.goodsWidth}}*{{detail.goodsHeight}}</p>
                          </Col>

                          <Col span="6">
                              <p><span class="receipt-top-label">收货库区：</span>收货库区</p>
                              <p><span class="receipt-top-label">中文描述：</span>{{detail.goodsCnDesc}}</p>
                              <p><span class="receipt-top-label">质检状态：</span> <span style="color:green;" v-if="detail.checkStatus==='0'">待质检</span>
                                  <span style="color:green;" v-if="detail.checkStatus==='1'">部分质检</span>
                                  <span style="color:green;" v-if="detail.checkStatus==='2'">质检完成</span></p>
                          </Col>
                          <Col span="6">
                              <p><span class="receipt-top-label">收货库位：</span>{{detail.warehouseLocationName}}</p>
                              <p><span class="receipt-top-label">英文描述：</span>{{detail.goodsEnDesc}}</p>
                          </Col>-->
            </Row >
          </Card >
          <Card dis-hover title="质检标准" class="mt10" >
            <div class="qc-box" >
              <Row type="flex" justify="center" align="middle" class="quality-item" >
                <Col span="6" >
                  <div class="quality-tit" >外观</div >
                </Col >
                <Col span="18" >
                  <Row class="row-i" >
                    <Col span="10" >接缝</Col >
                    <Col span="14" >均匀且小于0.5mm</Col >
                  </Row >
                  <Row class="row-i" >
                    <Col span="10" >接缝</Col >
                    <Col span="14" >均匀且小于0.5mm</Col >
                  </Row >
                  <Row class="row-i" >
                    <Col span="10" >接缝</Col >
                    <Col span="14" >均匀且小于0.5mm</Col >
                  </Row >
                </Col >
              </Row >
              <Row type="flex" justify="center" align="middle" class="quality-item" >
                <Col span="6" >
                  <div >外观</div >
                </Col >
                <Col span="18" >
                  <Row class="row-i" >
                    <Col span="10" >接缝</Col >
                    <Col span="14" >均匀且小于0.5mm</Col >
                  </Row >
                  <Row class="row-i" >
                    <Col span="10" >接缝</Col >
                    <Col span="14" >均匀且小于0.5mm</Col >
                  </Row >
                </Col >
              </Row >
              <Row type="flex" justify="center" align="middle" class="quality-item" >
                <Col span="6" >
                  <div >安慰人群无若群无若</div >
                </Col >
                <Col span="18" >
                  <Row class="row-i" >
                    <Col span="10" >接缝</Col >
                    <Col span="14" >均匀且小于0.5mm</Col >
                  </Row >
                </Col >
              </Row >
            </div >
          </Card >
        </Col >
      </Row >
      <Card title="质检图片" class="mt10" >
        <div class="demo-upload-list" v-for="(item, dIndex) in uploadList" :key="`dviv-${dIndex}`">
          <template v-if="item.status === 'finished'" >
            <img :src="item.url" />
            <div class="demo-upload-list-cover" >
              <Icon type="ios-eye-outline" @click.native="handleView(item.name)" ></Icon >
              <Icon type="ios-trash-outline" @click.native="handleRemove(item)" ></Icon >
            </div >
          </template >
          <template v-else >
            <Progress v-if="item.showProgress" :percent="item.percentage" hide-info ></Progress >
          </template >
        </div >
        <dytUpload
            ref="upload"
            :show-upload-list="false"
            :default-file-list="defaultList"
            :on-success="handleSuccess"
            :format="['jpg', 'jpeg', 'png']"
            :max-size="2048"
            :on-format-error="handleFormatError"
            :on-exceeded-size="handleMaxSize"
            :before-upload="handleBeforeUpload"
            multiple
            type="drag"
            action="//jsonplaceholder.typicode.com/posts/"
            style="display: inline-block;width:58px;" >
          <div style="width: 58px;height:58px;line-height: 58px;" >
            <Icon type="md-camera" size="20" ></Icon >
          </div >
        </dytUpload >
      </Card >
      <Card title="质检记录" class="mt10" >
        <Table :columns="columns6" :data="data6" ></Table >
      </Card >
    </Card >
    <div class="fix-submit" >
      <p class="amount" >
        <span >送检数量：50</span > <span >已检数量：20</span > <span >待检数量：30</span >
      </p >

      <Form ref="formInline" :model="formInline" :rules="ruleInline" inline >
        <Row >
          <Col span="6" >
            <FormItem prop="user" label="良品数量" >
              <Input type="text" v-model="formInline.user" placeholder="Username" ></Input ></FormItem >
          </Col >
          <Col span="6" >
            <FormItem prop="password" label="不良品数量" >
              <Input type="text" v-model="formInline.password" placeholder="Password" ></Input >
            </FormItem >
          </Col >
          <Col span="6" >
            <FormItem label="备注" >
              <Input type="textarea" v-model="formInline.a" placeholder="Password" ></Input >
            </FormItem >
          </Col >
          <Col span="6" >
            <FormItem >
              <Button type="primary" >提交结果</Button >
            </FormItem >
          </Col >
        </Row >
      </Form >
    </div >
  </div>
</template>

<script>
// import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';

export default {
  mixins: [Mixin],
  data () {
    return {
      /* 上传 */
      defaultList: [
        {
          name: 'a42bdcc1178e62b4694c830f028db5c0',
          url: 'https://o5wwk8baw.qnssl.com/a42bdcc1178e62b4694c830f028db5c0/avatar'
        }, {
          name: 'bc7521e033abdd1e92222d733590f104',
          url: 'https://o5wwk8baw.qnssl.com/bc7521e033abdd1e92222d733590f104/avatar'
        }
      ],
      imgName: '',
      visible: false,
      uploadList: [], /* 详情图 */
      imgSrc: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1555596613496&di=189f838eb81bd9b828584e47a3fcc514&imgtype=0&src=http%3A%2F%2Fi2.hdslb.com%2Fbfs%2Farchive%2F14680a4416682f02b9d489f7545087a218d96b85.jpg',
      list: [
        {
          id: 1,
          src: 'https://raw.githubusercontent.com/zhangxiaoshang/va-carousel/master/static/images/1.jpg'
        }, {
          id: 2,
          src: 'https://raw.githubusercontent.com/zhangxiaoshang/va-carousel/master/static/images/2.jpg'
        }, {
          id: 3,
          src: 'https://raw.githubusercontent.com/zhangxiaoshang/va-carousel/master/static/images/3.jpg'
        }, {
          id: 4,
          src: 'https://raw.githubusercontent.com/zhangxiaoshang/va-carousel/master/static/images/4.jpg'
        }, {
          id: 5,
          src: 'https://raw.githubusercontent.com/zhangxiaoshang/va-carousel/master/static/images/5.jpg'
        }, {
          id: 6,
          src: 'https://raw.githubusercontent.com/zhangxiaoshang/va-carousel/master/static/images/6.jpg'
        }, {
          id: 7,
          src: 'https://raw.githubusercontent.com/zhangxiaoshang/va-carousel/master/static/images/7.jpg'
        }, {
          id: 8,
          src: 'https://raw.githubusercontent.com/zhangxiaoshang/va-carousel/master/static/images/8.jpg'
        }, {
          id: 9,
          src: 'https://raw.githubusercontent.com/zhangxiaoshang/va-carousel/master/static/images/9.jpg'
        }, {
          id: 10,
          src: 'https://raw.githubusercontent.com/zhangxiaoshang/va-carousel/master/static/images/10.jpg'
        }, {
          id: 11,
          src: 'https://raw.githubusercontent.com/zhangxiaoshang/va-carousel/master/static/images/11.jpg'
        }, {
          id: 12,
          src: 'https://raw.githubusercontent.com/zhangxiaoshang/va-carousel/master/static/images/12.jpg'
        }, {
          id: 13,
          src: 'https://raw.githubusercontent.com/zhangxiaoshang/va-carousel/master/static/images/13.jpg'
        }, {
          id: 14,
          src: 'https://raw.githubusercontent.com/zhangxiaoshang/va-carousel/master/static/images/14.jpg'
        }
      ], /* fixed */
      formInline: {
        user: '',
        password: '',
        a: ''
      },
      ruleInline: {
        user: [
          {
            required: true,
            message: 'Please fill in the user name',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: 'Please fill in the password.',
            trigger: 'blur'
          }, {
            type: 'string',
            min: 6,
            message: 'The password length cannot be less than 6 bits',
            trigger: 'blur'
          }
        ]
      }, /* 质检记录 */
      columns6: [
        {
          type: 'index',
          title: '序号',
          width: 120,
          align: 'center',
          fixed: 'left'
        }, {
          title: '质检记录',
          key: 'receiptBatchCheckDetailNo',
          align: 'center',
          minWidth: 150
        }, {
          title: '本次质检数量',
          key: 'expectedCheckNumber',
          align: 'center',
          minWidth: 80
        }, {
          title: '合格数量',
          key: 'passCheckNumber',
          align: 'center',
          minWidth: 80
        }, {
          title: '不合格数量',
          key: 'problemCheckNumber',
          align: 'center',
          minWidth: 80
        }, {
          title: '备注',
          key: 'remark',
          align: 'center',
          minWidth: 160
        }, {
          title: '质检时间',
          key: 'createdTime',
          align: 'center',
          minWidth: 160
        }, {
          title: '质检人',
          key: 'createdBy',
          align: 'center',
          minWidth: 120
        }
      ],
      data6: [], /* end */
      detail: {
        receiptNo: '', // 入库单号
        goodsSku: '', // SKU
        goodsWeight: '', // goodsWeight
        receiptBatchNo: '', // 批次号
        goodsAttributes: '', // SKU属性
        goodsLength: '', // 长
        goodsWidth: '', // 宽
        goodsHeight: '', // 高
        warehouseLocationName: '', // 收货库区
        goodsCnDesc: '', // 中文描述
        checkStatus: '', // 质检状态
        goodsEnDesc: '' // 英文描述
      }
    };
  },
  props: {
    curObj: {
      default: null
    },
    open: {
      default: null
    },
    qualityDataList: {
      default: {}
    },
    qcData: {
      default: []
    }
  },
  created () {
    this.detail = Object.assign(this.detail, this.curObj, this.qualityDataList);
    this.data6 = this.qcData;
  },
  methods: {
    /* 上传 */
    handleView (name) {
      this.imgName = name;
      this.visible = true;
    },
    handleRemove (file) {
      const fileList = this.$refs.upload.fileList;
      this.$refs.upload.fileList.splice(fileList.indexOf(file), 1);
    },
    handleSuccess (res, file) {
      file.url = 'https://o5wwk8baw.qnssl.com/7eb99afb9d5f317c912f08b5212fd69a/avatar';
      file.name = '7eb99afb9d5f317c912f08b5212fd69a';
    },
    handleFormatError (file) {
      this.$Notice.warning({
        title: 'The file format is incorrect',
        desc: 'File format of ' + file.name + ' is incorrect, please select jpg or png.'
      });
    },
    handleMaxSize (file) {
      this.$Notice.warning({
        title: 'Exceeding file size limit',
        desc: 'File  ' + file.name + ' is too large, no more than 2M.'
      });
    },
    handleBeforeUpload () {
      const check = this.uploadList.length < 5;
      if (!check) {
        this.$Notice.warning({
          title: 'Up to five pictures can be uploaded.'
        });
      }
      return check;
    }, /* 详情图 */
    prev () {
      let left = this.$refs.carouselItem.style.left;
      left = left ? parseInt(left) + 60 : 0;
      if (left <= 0) {
        this.$refs.carouselItem.style.left = left + 'px';
      } else {
        this.$refs.carouselItem.style.left = 0 + 'px';
      }
    },
    next () {
      let width = this.$refs.carousel.offsetWidth;
      let widthItem = this.$refs.carouselItem.offsetWidth;
      let left = this.$refs.carouselItem.style.left;
      left = left ? parseInt(left) - 60 : -60;
      if (left < -(widthItem - width)) {
        this.$refs.carouselItem.style.left = -(widthItem - width) + 'px';
      } else {
        this.$refs.carouselItem.style.left = left + 'px';
      }
    },
    activeImg (item) {
      this.imgSrc = item;
    }
    /* 1 */
  },
  mounted () {
    this.uploadList = this.$refs.upload.fileList;
  }
};
</script>

<style scoped>
.mt10 {
  margin-top: 10px;
}

.pd10 {
  padding: 10px;
}

.big-img-box {
  width: 100%;
  height: 300px;
  border: 1px solid #ddd;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.carousel-box {
  width: 100%;
  margin-top: 10px;
  position: relative;
  height: 60px;
  transition: left 0.3s ease;
}

.carousel-img-box {
  height: 60px;
  position: absolute;
  left: 0;
  top: 0;
}

.carousel-box .img-box-prev,
.carousel-box .img-box-next {
  position: absolute;
  width: 15px;
  line-height: 57px;
  font-weight: bold;
  top: 0;
  height: 60px;
  cursor: pointer;
}

.carousel-box .img-box-prev:hover,
.carousel-box .img-box-next:hover {
  color: #2baee9;
}

.carousel-box .img-box-prev {
  left: 0;
}

.carousel-box .img-box-next {
  right: 0;
  text-align: right;
}

.img-item {
  object-fit: cover;
  margin: 0 3px;
}

.tabs-p10 {
  padding: 0 10px;
}

.receipt-top-box {
  padding-bottom: 10px;
}

.receipt-top-label {
  display: inline-block;
  width: 33%;
  float: left;
  text-align: right;
}

.receipt-top-text {
  width: 66%;
  float: left;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.quality-item {
  border-bottom: 1px solid #ddd;
  padding: 10px 0;
}

.quality-item .row-i {
  margin: 7px 0;
}

.quality-item .row-i:first-child {
  display: flex;
  justify-content: center;
  align-items: center;
}

.quality-item:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.quality-item:first-child {
  padding-top: 0;
}

.fix-submit {
  position: fixed;
  bottom: 0;
  height: 150px;
  width: 100%;
  background-color: rgba(154, 154, 154, 0.7);
  z-index: 9;
  padding-left: 30px;
  padding-left: 30px;
}

.fix-submit .amount {
  font-size: 18px;
  margin-top: 10px;
}

.fix-submit .amount span {
  margin-right: 50px;
}

.qc-box {
  max-height: 300px;
  overflow-y: auto;
}

.pb150 {
  padding-bottom: 150px;
}
</style >
