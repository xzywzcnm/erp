<template>
  <div class="commonFilter">
    <div style="background: #fff;" class="ebayMail">
      <Row>
        <!-- 站内信文件夹 -->
        <Col span='3' style="padding: 10px">
        <div class="messageFolderTree">
          <Tree ref="messageFolderTree" :data="messageFolderTree" children-key="childrenRe"
            @on-select-change="changeMessageFolder"></Tree>
        </div>
        </Col>
        <Col span='10' style="padding: 10px 0 10px 10px; border-left: 1px solid #d7dde4; ">
        <div style="padding-bottom: 10px;">
          <Input v-model.trim="pageParams.searchValue" prefix="ios-search" size="small" style="width: 200px;" @on-enter="searchMessage" clearAble />
          <dyt-select size="small" style="width:80px;margin-left: 2px;" v-model="pageParams.done" @on-change="searchMessage" :filterable="false">
            <Option value="all" label="全部" />
            <Option value="true" label="已处理" />
            <Option value="false" label="未处理" />
          </dyt-select>
          <div style="display: inline-block; padding-left: 5px; width:calc(100% - 290px); min-width: 295px;"
            v-if="isVisibleLastReceiveTime">
            <span style="width: 90px;">回复时间：</span>
            <Date-picker transfer size="small" type="datetimerange" style="width:calc(100% - 100px);" :clearable="true"
              format="yyyy-MM-dd HH:mm:ss" :options="dateOptions" placement="bottom-end" placeholder="请选择回复时间"
              v-model="pageParams.lastReceiveTime" @on-change="lastReceiveTimeChange" />
          </div>
        </div>
        <div class="mb10">
          <div class="mb10">
            <div class="mb10" v-if="currentMessageFolder.folderType === 'ebayMessage'">
              <span class="label-span">接收时间：</span>
              <DatePicker v-model="dateValue" placeholder="选择日期" @on-change="handelChangeDate" type="datetimerange"
                size="small" format="yyyy-MM-dd HH:mm:ss" placement="bottom-end" style="width: 300px"></DatePicker>
            </div>
            <div>
              <span class="label-span">店铺：</span>
              <div style="width:225px; display: inline-block; vertical-align: middle;">
                <dytStoreSelect
                  v-model="pageParams.saleAccountIds"
                  :option-data="shopList"
                  :replace-option-key="{value: 'saleAccountId', label: 'accountCode'}"
                  placeholder="请选择店铺，可输入搜索"
                  input-placeholder="请输入店铺，多个店铺可用逗号或换行隔开"
                  @change="searchMessage"
                />
              </div>
              <Checkbox v-model="pageParams.prioritySort" style="margin-left:20px;" @on-change="searchMessage">站内信优先级参与排序</Checkbox>
            </div>
          </div>
          <div style="padding-bottom: 0px;">
            <Button v-if="!currentMessageFolder.tableType" type="primary" @click="modifyTheSort('receiveTimeSort')"
              size="small">
              {{ pageParams.receiveTimeSort === 'lastReceiveTime' ? '最早时间' : '最晚时间' }}
              <Icon
                :type="pageParams.receiveTimeSort === 'lastReceiveTime' ? 'md-arrow-round-down' : 'md-arrow-round-up'">
              </Icon>
            </Button>
            <Button type="primary" style="margin-left:2px;" @click="modifyTheSort('upDown')" size="small">
              {{ pageParams.upDown === 'down' ? '由新到旧' : '由旧到新' }}
              <Icon :type="pageParams.upDown === 'down' ? 'md-arrow-round-down' : 'md-arrow-round-up'"></Icon>
            </Button>
            <Dropdown style="margin-left: 20px" v-if="getPermission('messageInfo_reSend')">
              <Button type="primary" size="small">
                批量重新发送
                <Icon type="ios-arrow-down"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem @click.native="batchSendmail('check')" :disabled="batchSending">
                  选中重新发送
                </DropdownItem>
                <DropdownItem @click.native="batchSendmail('all')" :disabled="batchSending">
                  所有重新发送
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Button v-if="!currentMessageFolder.tableType && getPermission('messageInfo_markMessageRead')" type="primary"
              style="margin-left:2px;" size="small" @click="ignoreMessage('batch')">批量忽略
            </Button>
            <Button v-if="!currentMessageFolder.tableType && getPermission('messageGroup_batchAssign')" type="primary"
              style="margin-left:2px;" size="small" @click="showBatchRepeat">批量转发
            </Button>
            <Button v-if="!currentMessageFolder.tableType" type="primary" style="margin-left:2px;" size="small" @click="expandOrShorten(false)">全部收起</Button>
            <Button v-if="!currentMessageFolder.tableType" type="primary" style="margin-left:2px;" size="small" @click="expandOrShorten(true)">全部展开</Button>
          </div>
          <div class="normalTop">
            <Table v-if="!currentMessageFolder.tableType" highlight-row :height="tableHeight"
              @on-selection-change="selectMessateGroup" :loading="tableLoading" :columns="groupColumn" :data="groupData"
              @on-row-click="selectMessage" />
            <Table v-if="currentMessageFolder.tableType" highlight-row :height="tableHeight" :loading="tableLoading"
              :columns="nogroupColumn" :data="nogroupData" @on-row-click="selectMessage"
              @on-selection-change="getSelectValue" />
            <div class="table-page flexBox" style="margin-bottom:0;">
              <keep-alive>
                <Page :total="total" @on-change="changePage" show-total size="small" :page-size="pageParams.pageSize"
                  show-elevator :current="curPage" show-sizer @on-page-size-change="changePageSize" placement="top"
                  :page-size-opts="pageArray">
                </Page>
              </keep-alive>
            </div>
          </div>
          <div class="normalTop">
            <p>历史订单及当前交易(绿色三角标志)</p>
            <Table highlight-row border size="small" :columns="columns1" max-height="150" :data="data1" />
          </div>
        </div>
        </Col>
        <Col v-show="currentMessage || currentMessageGroup" span='11' class="content-right">
          <!-- <div style="position: sticky; top: 5px;"> -->
          <div>
            <div class="detailBox"
              :style="{ 'max-height': !replyIsShow ? 'calc(100vh - 105px)' : (tableHeight - 100 + 'px') }">
              <template
                v-for="(item, index) in currentMessage ? [currentMessage] : currentMessageGroup ? currentMessageGroup.childrenRe || [] : []">
                <Card v-if="item.messageBody" style="margin:10px;" :key="index" dis-hover>
                  <div v-for="(n, i) in item.remarkList" :key="i" class="remarkBox">
                    <div>
                      <Row>
                        <Col span="10">
                        <Icon type="md-document" />
                        {{ n.messageRemark }}
                        </Col>
                        <Col span="12" offset="1" style="text-align: right">
                        {{ setTimeHandel(getDataToLocalTime(n.createdTime, 'fulltime')) }}
                        <Icon v-if="getPermission('messageRemark_delete')" type="md-close-circle" color="red"
                          style="margin-left:5px;cursor:pointer;"
                          @click="deleteMessageRemark(n.messageRemarkId, item.messageId)" />
                        {{ n.createdBy === userInfo.userId ? '我' : getUserName(n.createdBy) }}
                        </Col>
                      </Row>
                    </div>
                  </div>
                  <div>
                    <a :href='ebayBaseUrl + item.itemId' target="_blank" class="gotoItem"> {{ item.subject }}</a>
                  </div>
                  <Row>
                    <Col span="18">
                    <span style="color: #f60;">{{ item.sender }}</span>
                    <Icon style="margin: 0 5px;" type="md-arrow-round-forward" />
                    <span style="color: #45cf5b;">{{ item.receiver }}</span> <span v-if="item.disposeUser"
                      class="bggreenBlock">{{ item.disposeUser === userInfo.userId ? '我' : getUserName(item.disposeUser)
                      }}</span>
                    <Button v-if="item.webstoreMessageId && getPermission('messageRemark_save')" type="primary"
                      style="margin-left:5px;" icon="md-create" size="small" @click="addRemark(item.messageId)">备注
                    </Button>
                    <Button v-if="currentMessage && currentMessage.dealStatus === 4 && getPermission('messageInfo_reSend')"
                      size="small" type="primary" @click="reSend" class="mr10">重新发送
                    </Button>
                    <Button v-if="currentMessage && currentMessage.dealStatus !== 1 && currentMessageFolder.tableType"
                      size="small" style="margin-left:10px;" type="primary" @click="deleteMessage">删除
                    </Button>
                    </Col>
                    <Col span="6">
                    {{ item.receiveTime ? setTimeHandel(getDataToLocalTime(item.receiveTime, 'fulltime')) :
                      setTimeHandel(getDataToLocalTime(item.sendTime, 'fulltime')) }}
                    </Col>
                  </Row>
                  <div v-if="item.messageMediaList">
                    <Poptip v-for="(imgItem, index) in item.messageMediaList" :key="index" transfer class="ml10 mt10"
                      trigger="hover" content="content">
                      <img :src="imgItem.mediaUrl" width="60" height="60" />
                      <div slot="content">
                        <img :src="imgItem.mediaUrl" width="400" />
                      </div>
                    </Poptip>

                  </div>
                  <div style="margin:10px;" class="messageContent">
                    <iframe width="100%" v-if="currentMessageFolder && currentMessageFolder.folderType === 'ebayMessage'"
                      frameborder="0" style="border: 0px; overflow: auto;height: 720px" :id="'messageIframe' + index">
                    </iframe>
                    <div v-else v-html="item.messageBody ? item.messageBody.messageContent : ''"></div>
                  </div>
                </Card>
              </template>
            </div>
          </div>
          <div
            v-show="showReplyLetter"
            style="margin: 10px;"
          >
            <div>
              <div style="padding:5px;background:#448aca;color:#fff;overflow:auto;">
                <span>常用模板：</span>
                <div class="ofenTempBox" v-for="(item, index) in customMessageTemplateList" :key="index">
                  <span @click="selectTemplate(item.messageContent)" class="ofenTemp">{{ item.messageTemplateName }}</span>
                </div>
              </div>
              <Row style="margin: 5px 0px;">
                <!-- <Col span="13" v-if="getPermission('messageTemplate_queryByTemplateCode')">
                <span>模板编号：</span> <Input v-model.trim="templateCode" size="small" style="width: 250px;margin-left:20px;"
                  @on-enter="searchTemplateByCode" clearable></Input>
                </Col> -->
                <Col span="11">
                  <Checkbox v-model="sendToEmail">抄送到邮箱</Checkbox>
                  <Button
                    v-if="currentMessageGroup && getPermission('messageGroup_batchAssign')"
                    size="small"
                    @click="repeatModalStatus = true; isBatchRepeat = false;"
                    class="ml10"
                  >转发</Button>
                  <Button size="small" class="ml10" v-if="getPermission('messageInfo_replyMessage')" @click="replyMessage">回复</Button>
                </Col>
              </Row>
              <div class="choose-message-template" v-if="getPermission('messageTemplate_queryByPlatformId')">
                <span>全部模板：</span>
                <erpTreeSelect
                  style="flex: 100; max-width: 400px;"
                  v-model="messageTemplateValue"
                  :multiple="false"
                  :normalizer="treeNormalizer"
                  :options="allMessageTemplateList"
                  :default-expand-level="0"
                  :appendToBody="true"
                  :disableBranchNodes="true"
                  placeholder="请选择回复模板"
                  noResultsText="无匹配数据"
                  @input="selectTemplate"
                />
              </div>
              <div v-if="getPermission('messageInfo_uploadPicture')">
                <div class="demo-upload-list" v-for="(item, index) in uploadedImgList" :key="index">
                  <template v-if="item.status === 'finished'">
                    <img :src="item.url">
                    <div class="demo-upload-list-cover">
                      <Icon type="ios-trash-outline" @click.native="handleRemove(item, index)"></Icon>
                    </div>
                  </template>
                  <template v-else>
                    <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
                  </template>
                </div>
                <dytUpload ref="upload" :show-upload-list="false" :default-file-list="defaultList"
                  :on-success="handleSuccess" :format="['JPG', 'JPEG', 'GIF', 'PNG', 'BMP', 'SVG']" :max-size="2048"
                  :on-progress="handleProgress"
                  :on-error="handleError"
                  accept="image/JPG,image/JPEG,image/GIF,image/PNG,image/BMP,image/SVG"
                  :on-format-error="handleFormatError" :on-exceeded-size="handleMaxSize"
                  :before-upload="handleBeforeUpload" :headers="uploadImgHeader" name='files' :data='{
                    messageId: currentMessage ? currentMessage.messageId : currentMessageGroup ?
                      currentMessageGroup.childrenRe && currentMessageGroup.childrenRe[0] ? currentMessageGroup.childrenRe[0].messageId : null
                      : null
                  }' multiple type="drag" :action="uploadPath" style="display: inline-block;width:58px;">
                  <div style="width: 58px;height:58px;line-height: 58px;">
                    <Icon type="ios-camera" size="20"></Icon>
                  </div>
                </dytUpload>
              </div>
              <div>
                <textarea class="textarea-mail" v-model="replyMessageBo.messageContent" @input="msgContentChange" />
                <!-- <Input  type="textarea" :maxlength="5000" style="width:90%;" :autosize="{minRows: 5,maxRows: 5}"></Input>-->
              </div>
              <div class="reply-button-operate">
                <div>
                  <Button class="item-content-btn" type="text" size="small" :disabled="transtionLoading" @click="translationText">译</Button>
                </div>
                <div>
                  <Button
                    class="ml10"
                    size="small"
                    v-if="getPermission('messageInfo_delete') || getPermission('messageGroup_delete')"
                    @click="deleteMessage"
                    type="warning"
                    ghost
                  >删除</Button>
                  <Button
                    size="small"
                    class="ml10"
                    v-if="getPermission('messageInfo_markMessageRead')"
                    @click="ignoreMessage"
                    type="warning"
                    ghost
                  >忽略</Button>
                </div>
              </div>
              <div class="mt10" style="line-height: 1.4em;white-space: pre-wrap;">{{ messageContentTranslation }}</div>
            </div>
          </div>
          <Spin v-if="eMailLoading" fix></Spin>
        </Col>
      </Row>
    </div>
    <!-- 添加备注 -->
    <Modal v-model="addRemarkModalStatus" title="添加站内信备注" @on-ok="addRemarkOk" @on-cancel="addRemarkModalStatus = false">
      <div style="margin: 20px;font-size: 14px;">
        <Input v-model="addMessageRemarkBo.messageRemark" type="textarea" :autosize="{ minRows: 5, maxRows: 7 }"></Input>
      </div>
    </Modal>
    <Modal v-model="orderSelectModelStatus" title="相同的交易，请选择" width="600">
      <dTable :columns="orderColumns" height="600" :data="orderList"></dTable>
    </Modal>
    <Modal v-model="repeatModalStatus" title="转发信息">
      <Form ref="formInline" :model="batchRepeatParamsBo" style="height: 300px">
        <FormItem label="分派到用户">
          <dyt-select v-model="batchRepeatParamsBo.messageHandler" style="width: 200px">
            <Option v-for="item in $store.state.userInfoList" :key="item.userId" :value="item.userId" :label="item.userName" />
          </dyt-select>
        </FormItem>
        <FormItem label="分派到eBay消息文件夹">
          <treeSelect style="width:200px" ref="eBayMessageFolderTree" :treeData="messageFolderTree" :transfer="false"
            v-model="batchRepeatParamsBo.folderId" filterable></treeSelect>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button v-if="isBatchRepeat" @click="batchRepeat" type="primary">保存
        </Button>
        <Button v-if="!isBatchRepeat" @click="singleGroupRepeat" type="primary">保存
        </Button>
        <Button @click="repeatModalStatus = false; model10 = false">取消</Button>
      </div>
    </Modal>
    <sliderModal v-model="orderDetails" :spinShow="spinShow" :styles="{}" class="slider-model">
      <orderDetails
        :orderDetailsId="orderDetailsId"
        :orderRowsDetail="orderRowsDetail"
        @reloadTag="reloadTag"
        :timestamp="timestamp"
        :orderNo="orderNo"
        @spinLoading="spinLoading"
        @resetSpinShow="resetSpinShow"
        :orderTagList="orderTagList"
        :webstoreItemSite="webstoreItemSite"
        :moal-visible.sync="orderDetails"
      />
    </sliderModal>
  </div>
</template>
<script>
import api from '@/api/api';
import Mixin from '@/components/mixin/common_mixin';
import expandRow from './tableExpand.vue';
import md5 from 'blueimp-md5';
// import { getToken } from '@/utils/cookie';
import orderDetails from "@/views/commonOrder/components/commonOrder/orderDetails";

export default {
  mixins: [Mixin],
  components: { expandRow, orderDetails },
  data() {
    let v = this;
    let end = new Date();
    let start = new Date();
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 3);
    return {
      // isKeepUrlParams: true,
      selectMessageList: [],
      batchSending: false,
      messageByGroupJson: {},
      eMailLoading: false,
      isCancelPending: false,
      messageContentTranslation: '',
      messageTemplateValue: null,
      transtionLoading: false,
      columns1: [
        {
          title: '订单号',
          key: 'accountCode',
          align: 'center',
          minWidth: 130,
          render: (h, { row }) => {
            // <Icon type="md-arrow-dropright" />
            return h('p', {}, [
              row.cur + '' !== '1' || h('Icon', {
                props: {
                  type: 'md-arrow-dropright',
                  size: 18
                },
                style: {
                  color: '#35ff02'
                }
              }), h('span', {
                style: {
                  color: 'rgb(0, 84, 166)',
                  cursor: 'pointer'
                },
                on: {
                  'click': () => {
                    this.show(row);
                  }
                }
              }, row.accountCode + '-' + row.salesRecordNumber),
              h('Icon', {
                props: {
                  type: 'ios-create-outline',
                  size: 18
                },
                style: {
                  color: 'rgb(0, 84, 166)',
                  cursor: 'pointer',
                  'padding': '0 0 0 5px'
                },
                on: {
                  'click': () => {
                    if (this.$common.isEmpty(row.accountCode) || this.$common.isEmpty(row.salesRecordNumber)) {
                      this.$Message.error('订单信息不全');
                      return;
                    }
                    const openUrl = `/order-service/commonOrder.html#/orderToRetrieve?platform=ebay&orderId=${row.accountCode}-${row.salesRecordNumber}`;
                    // window.open(openUrl, 'ebayMailToorderToRetrieve');
                    window.open(openUrl);
                  }
                }
              })
            ]);
          }
        }, {
          title: '国家/地区',
          align: 'center',
          width: 90,
          key: 'buyerCountryCode'
        }, {
          title: '金额', // 金额
          width: 120,
          render: (h, { row }) => {
            let totalPrice = this.$common.isEmpty(Number(row.totalPrice)) ? 0 : Number(row.totalPrice);
            let actualPrice = this.$common.isEmpty(Number(row.actualAmountReceivedTotal)) ? 0 : Number(row.actualAmountReceivedTotal);
            totalPrice = `总：${totalPrice.toFixed(2)}${this.$common.isEmpty(row.totalPriceCurrency) ? '' : `(${row.totalPriceCurrency})`}`;
            actualPrice = `实：${actualPrice.toFixed(2)}${this.$common.isEmpty(row.transactionPriceCurrency) ? '' : `(${row.transactionPriceCurrency})`}`;
            return h('div', {}, [
              h('p', totalPrice),
              h('p', actualPrice)
            ]);
          }
        }, {
          title: '状态', // 状态
          align: 'center',
          key: 'orderStatus'
        }, {
          title: '评价', // 评价
          align: 'center',
          key: 'feedBackLevel'
        }, {
          title: '纠纷',
          align: 'center',
          key: 'ebayCase'
        }, {
          title: '退换货',
          align: 'center',
          key: 'afterSales'
        }
      ],
      selcctMessage: {},
      orderDetails: false,
      timestamp: null,
      orderDetailsBegin: false,
      orderDetailsId: null,
      orderRowsDetail: {},
      orderTagList: null,
      webstoreItemSite: null,
      orderNo: null,
      data1: [],
      orderLength: {},
      platformId: 'ebay',
      totalPage: 0,
      total: 0,
      curPage: 1,
      defaultList: [],
      sendToEmail: false, // 是否抄送到邮箱
      templateCode: null, // 邮编模版编号查询条件
      pageParamsStatus: false, // 是否触发刷新
      currentMessageFolder: null, // 当前选中的站内信文件夹
      currentMessage: null, // 当前选中的站内信
      currentMessageGroup: null, // 当前站内信组
      addRemarkModalStatus: false, // 添加备注模态窗口状态
      customMessageTemplateList: [], // 常用模板列表
      allMessageTemplateList: [], // 所有模板列表
      allMessageTemplateJson: {},
      selectedMessateGroupList: [], // 已选站内信组列表
      repeatModalStatus: false, // 转发模态窗口状态
      isBatchRepeat: false, // 是否批量转发
      messageGroupIdToMessageGroup: {}, // 分组ID映射分组
      ebayBaseUrl: 'https://www.ebay.com/itm/', // ebay基础路径
      uploadPath: api.ebay_messageUpload, // 上传图片地址
      uploadedImgList: [], // 已上传图片列表
      addMessageRemarkBo: { // 备注入参
        messageId: null,
        messageRemark: null,
        platformId: 'ebay'
      },
      batchRepeatParamsBo: { // 转发入参
        folderId: '',
        messageHandler: ''
      },
      replyMessageBo: { // 回复消息入参
        messageContent: null,
        tempMessageContent: null, // 存在多交易是临时存放回复内容
        messageId: null,
        messageGroupId: null,
        messageMediaList: [],
        sendToEmail: 0
      },
      dateValue: [start, end],
      pageParams: { // 筛选站内信列表入参
        searchValue: null,
        done: 'false',
        saleAccountIds: [],
        prioritySort: true,
        folderId: null,
        receiveStartTime: null,
        receiveEndTime: null,
        priorLevel: null,
        unassigned: false,
        platformId: 'ebay',
        receiveTimeSort: 'lastReceiveTime',
        upDown: 'down',
        lastReceiveTime: [], // 回复时间
        pageNum: 1,
        pageSize: 20
      },
      messageFolderTree: [
        { // 收件箱
          title: '收件箱',
          expand: false,
          selected: true,
          folderType: 'inbox',
          childrenRe: [],
          totalUntreatedCount: null
        },
        { // 发件箱
          title: '发件箱',
          tableType: 'nogroup',
          folderType: 'sending',
          totalUntreatedCount: null
        },
        { // ebay来信
          title: 'ebay来信',
          tableType: 'nogroup',
          folderType: 'ebayMessage',
          totalUntreatedCount: null
        },
        { // 已发送信件
          title: '已发送信件',
          tableType: 'nogroup',
          folderType: 'sended',
          totalUntreatedCount: null
        },
        { // 未分派
          title: '未分派',
          expand: false,
          folderType: 'unassigned',
          childrenRe: [],
          totalUntreatedCount: null
        },
        { // 优先的
          title: '优先的',
          expand: true,
          folderType: 'priorLevel',
          childrenRe: [],
          totalUntreatedCount: null
        }
      ],
      orderList: [], // 匹配模版订单数据
      orderSelectModelStatus: false, // 选择订单模态窗口状态
      orderColumns: [
        { // 匹配模版订单表头
          title: '订单',
          key: 'orderId',
          align: 'center',
          combine: true,
          render: (h, params) => {
            const obj = {
              childrens: [
                [
                  'div', {
                    class: 'combiePackageCode',
                    style: {
                      textAlign: 'center'
                    }
                  }, params.row.accountCode + '-' + params.row.salesRecordNumber
                ]
              ],
              props: {}
            };
            if (params.row.rowIndex) {
              obj.props.rowSpan = v.orderLength[params.row.orderId];
            }
            return obj;
          }
        }, {
          title: '出库单',
          align: 'center',
          key: 'packageCode'/*,
        combine: true,
        render: (h, params) => {
          const obj = {
            childrens: [['div', { class: 'combiePackageCode' }, params.row.packageCode]],
            props: {}
          };
          if (params.row.packageCodeIndex) {
            obj.props.rowSpan = v.orderLength['i' + params.row.packageCode];
          }
          return obj;
        } */
        }, {
          title: '交易号',
          key: '-',
          align: 'center',
          render: (h, params) => {
            return params.row.accountCode + '-' + params.row.transSalesRecordNumber;
          }
        }, {
          title: 'ItemID',
          key: 'webstoreItemId',
          align: 'center',
          render(h, params) {
            return h('span', {
              class: 'webstoremItem',
              on: {
                'click'() {
                  v.replaceTemplatePlaceholders(params.row);
                  v.orderSelectModelStatus = false;
                }
              }
            }, params.row.webstoreItemId);
          }
        }
      ],
      nogroupData: [], // 不分组站内信是数据
      nogroupColumn: [ // 不分组站内信表头
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          title: '邮件',
          key: 'sender',
          render: (h, params) => {
            let dealStatus = params.row.dealStatus === 1 ? '发送中' : params.row.dealStatus === 3
              ? '发送成功'
              : '发送失败';
            let showTime = params.row.sender === 'ebay' ? params.row.receiveTime : params.row.sendTime;
            return h('div', {}, [
              h('span', [
                h('Icon', {
                  class: 'mail-icon ivu-icon' + (params.row.sender === 'ebay' ? ' ivu-icon-ios-mail-outline'
                    : ' ivu-icon-ios-mail-open-outline')
                }, ''), params.row.sender + '—>' + params.row.receiver
              ]),
              h('span', {
                style: {
                  float: 'right'
                }
              }, [
                params.row.dealStatus === 4 ? h('Tooltip', {
                  props: {
                    content: params.row.dealFailReason
                  }
                }, [
                  h('span', {
                    style: {
                      color: 'red',
                      marginRight: '5px'
                    }
                  }, dealStatus)
                ]) : h('span', {
                  style: {
                    color: 'green',
                    marginRight: '5px'
                  }
                }, params.row.dealStatus === 0 ? '' : dealStatus),

                h('span', {}, v.setTimeHandel(v.getDataToLocalTime(showTime, 'fulltime')))
              ]),
              h('div', {
                style: {
                  margin: '10px'
                }
              }, params.row.subject)
            ]);
          }
        }
      ],
      groupData: [], // 分组站内信是数据
      groupColumn: [ // 分组站内信表头
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          type: 'expand',
          width: 50,
          render: (h, params) => {
            return h(expandRow, {
              props: {
                row: params.row
              },
              on: {
                'click': (obj) => {
                  v.currentMessage = obj;
                  // v.currentMessageGroup = null;
                  v.currentMessageGroup = this.messageByGroupJson[obj.messageGroupId];
                  v.queryMessageOrder(params.row);
                  v.getRemarkList([obj.messageId]);
                }
              }
            });
          }
        },
        {
          title: '邮件',
          key: 'buyerAccount',
          render: (h, params) => {
            let rowData = params.row;
            let receiveTime = v.pageParams.receiveTimeSort === 'firstReceiveTime' ? rowData.firstReceiveTime
              : rowData.lastReceiveTime;
            let priorLevelList = v.messageFolderTree[5].childrenRe;
            let currentLevelColor = null;
            priorLevelList.forEach((n, i) => {
              if (n.priorLevel === rowData.priorLevel) {
                currentLevelColor = n.priorityImage;
              }
            });
            return h('div', [
              h('span', {
                class: rowData.untreatedCount > 0 ? 'boldFont' : ''
              }, rowData.buyerAccount + ' ' + rowData.itemId + ' (' + rowData.messageCount + ')'),
              !v.getPermission('messageGroup_markLevel') ||
              h('Dropdown', {
                style: {
                  width: '50px',
                  float: 'right'
                },
                on: {
                  'on-click': (value) => {
                    v.$Modal.confirm({
                      title: '温馨提示',
                      content: '是否确认修改优先级？',
                      onOk: (e) => {
                        v.markLevel(params.row.messageGroupId, value);
                      }
                    });
                  }
                }
              }, [
                h('Icon', {
                  props: {
                    type: 'md-flag'
                  },
                  style: {
                    color: currentLevelColor,
                    fontSize: '20px'
                  }
                }),
                h('DropdownMenu', {
                  slot: 'list'
                }, v.messageFolderTree[5].childrenRe.map(j => {
                  return h('DropdownItem', {
                    props: {
                      name: j.priorLevel
                    }
                  }, [
                    h('Icon', {
                      props: {
                        type: 'md-flag'
                      },
                      style: {
                        color: j.levelColor,
                        fontSize: '20px'
                      }
                    })
                  ]);
                }))
              ]),
              h('span', {
                style: {
                  float: 'right',
                  margin: '0 10px'
                }
              }, v.setTimeHandel(v.getDataToLocalTime(receiveTime, 'fulltime'))),
              h('span', {
                style: {
                  float: 'right'
                },
                class: !rowData.messageHandler ? 'bgorangeBlock' : 'bggreenBlock'
              }, !rowData.messageHandler ? '未分派' : rowData.messageHandler === v.userInfo.userId
                ? '我'
                : v.getUserName(rowData.messageHandler))
            ]);
          }
        }
      ],
      pageUrlParams: {}
    };
  },
  watch: {
    pageParamsStatus(n, o) {
      if (n) {
        let v = this;
        v.$Loading.start();
        Promise.resolve(
          v.getPermission('messageGroup_query') ? v.searchMessage() : v.gotoError()
        )
          .then(() => {
            v.$Loading.finish();
          });
        v.pageParamsStatus = false;
      }
    },
    currentMessage(n, o) {
      if (n) {
        this.getMessageBodyByMessageIds([n.messageId]);
      }
    },
    currentMessageGroup(n, o) {
      if (n) {
        let messageIds = [];
        (this.currentMessageGroup.childrenRe || []).forEach((n, i) => {
          messageIds.push(n.messageId);
        });
        this.getMessageBodyByMessageIds(messageIds);
      }
    },
    // 'pageParams.searchValue': {
    //   deep: true,
    //   handler (val) {
    //     const urlParams = this.$common.getUrlParams();
    //     if (this.isKeepUrlParams && val !== urlParams.customerId) {
    //       this.isKeepUrlParams = false;
    //     }
    //   }
    // },
    $route: {
      deep: true,
      handler(val) {
        if (val.path !== '/ebayMail') return;
        // this.isKeepUrlParams = true;
        this.handUrlParams();
      }
    }
  },
  computed: {
    uploadImgHeader() {
      return {
        ...this.$store.getters.erpRequestHeaders,
        ...this.$store.getters.dytRequestHeaders
      }
    },
    replyIsShow() {
      let valid = false;
      if (this.currentMessageGroup) {
        (this.currentMessageGroup.childrenRe || []).forEach(i => {
          if (i.webstoreMessageId !== null) {
            valid = true;
          }
        });
      } else if (this.currentMessage) {
        if (this.currentMessage.webstoreMessageId !== null) {
          valid = true;
        }
      }
      return valid;
    },
    // 是否显示回复
    showReplyLetter () {
      if (this.$common.isEmpty(this.getBuyerAccount)) return false;
      // 收件箱和发件箱都可以回复
      if (!this.$common.isEmpty(this.currentMessageFolder.folderType) && ['inbox', 'sending'].includes(this.currentMessageFolder.folderType)) {
        return true;
      }
      // 旧逻辑不变
      if (this.$common.isEmpty(this.currentMessageFolder.tableType)) {
        if ((this.currentMessageGroup || (this.currentMessage && this.currentMessage.webstoreMessageId)) && this.replyIsShow) {
          return true;
        }
      }
      return false;
    },
    // 返回买家店铺 ID 和 itemId
    getBuyerAccount () {
      if (!this.$common.isEmpty(this.currentMessageGroup)) return this.currentMessageGroup;
      if (!this.$common.isEmpty(this.currentMessage)) {
        return {
          ...this.currentMessage,
          buyerAccount: this.currentMessage.sender
        }
      }
      return {}
    },
    tableHeight() {
      return this.getTableHeight(400);
    },
    // 是否显示回复时间
    isVisibleLastReceiveTime() {
      if (!this.$common.isEmpty(this.currentMessageFolder.folderType) && this.currentMessageFolder.folderType === 'inbox') {
        if (!this.$common.isEmpty(this.pageParams.priorLevel)) return false;
        return this.$common.isEmpty(this.pageParams.unassigned) || !this.pageParams.unassigned
      }
      return false;
    }
  },
  created() {
    // const urlParams = this.$common.getUrlParams();
    let urlParams = localStorage.getItem('erp-order-stockoutOrder');
    urlParams = this.$common.isEmpty(urlParams) ? {} : JSON.parse(urlParams);
    this.pageUrlParams = urlParams;
    this.currentMessageFolder = this.messageFolderTree[0]; // 默认查询第一条
    this.getTreeData();
    this.searchMessage();
    this.searchCustomMessageTemplate();
    this.searchAllTemplate();
    this.getShopList(null, '/cs-service/erpCommon');
    this.handelChangeDate(this.dateValue);
    this.$nextTick(() => {
      localStorage.removeItem('erp-order-stockoutOrder');
    })
  },
  mounted() {
    var contentFrame = null;
    if (document.getElementById('content') && document.getElementById('content').contentWindow) {
      contentFrame = document.getElementById('content').contentWindow.document;
    } else {
      contentFrame = document.getElementById('content') && document.getElementById('content').contentDocument;
    }
    this.handUrlParams();
    if (!contentFrame) return;
    contentFrame.open();
    contentFrame.write(this.dataJson.datas['466104061159014618'].messageContent);
    contentFrame.close();
    this.uploadedImgList = this.$refs.upload.fileList;
  },
  methods: {
    handUrlParams() {
      this.$nextTick(() => {
        // if (!this.isKeepUrlParams) return;
        if (this.$common.isEmpty(this.pageUrlParams) || this.$common.isEmpty(this.pageUrlParams.buyerAccountId)) return;
        this.$set(this.pageParams, 'searchValue', this.pageUrlParams.buyerAccountId);
        // buyerAccountId 使用之后，移除 buyerAccountId
        delete this.pageUrlParams.buyerAccountId;
        this.$nextTick(() => {
          this.searchMessage(false, false);
        })
      })
    },
    // 批量发送邮件
    batchSendmail(type) {
      if (this.batchSending) return;
      let params = {};
      if (type === 'check') {
        if (this.selectMessageList.length == 0) {
          this.$Message.error('请选择 "发送失败" 的邮件！');
          return;
        }
        params['messageIds'] = this.selectMessageList.filter(item => {
          return [4, '4'].includes(item.dealStatus);
        }).map(m => m.messageId);
        if (params['messageIds'].length == 0) {
          this.$Message.error('选中的邮件中不包含 "发送失败" 的邮件！');
        }
      } else {
        params = this.getPageParams();
      }
      this.batchSending = true;
      this.axios.post(api.batch_batchReSend, params).then(res => {
        if (res.data && res.data.code === 0) {
          this.$Message.success('操作成功');
          this.batchSending = false;
          // 刷新发件箱数据
          this.querySendingMessage();
        }
      }).catch(() => {
        this.batchSending = false;
      })
    },
    show(row) {
      this.orderDetailsBegin = true;
      const date = new Date().getTime();
      this.orderDetailsId = row.orderId;
      this.orderNo = `${row.accountCode || ''}-${row.salesRecordNumber || ''}`;
      this.orderRowsDetail = this.$common.copy(row);
      this.$nextTick(() => {
        this.orderDetails = true;
        this.timestamp = date;
      });
    },
    getAccountCode(pos, saleAccountIdPos) { // get accountcode common method
      return new Promise(resolve => {
        this.axios.post(api.get_saleAccountById + '?saleAccountIds=' + this.$common.arrRemoveRepeat(saleAccountIdPos)).then(response => {
          if (response.data.code === 0) {
            let list = response.data.datas;
            if (list.length > 0) {
              for (let i = 0; i < list.length; i++) {
                for (let t = 0; t < pos.length; t++) {
                  if (pos[t].saleAccountId === list[i].saleAccountId) {
                    pos[t].accountCode = list[i].accountCode;
                  }
                  if (i === list.length - 1 && t === pos.length - 1) {
                    resolve(pos);
                  }
                }
              }
            } else {
              resolve(pos);
            }
          }
        })
      });
    },
    getProductList(pos, orderIdPos) {
      let v = this;
      return new Promise(resolve => {
        v.axios.post(api.get_orderProductList + '?orderIds=' + orderIdPos)
          .then(response => {
            if (response.data.code === 0) {
              let list = response.data.datas;
              if (list.length > 0) {
                for (let i = 0; i < list.length; i++) {
                  for (let t = 0; t < pos.length; t++) {
                    if (pos[t].orderId === list[i].orderId) {
                      if (list[i].pictureUrl === '' || list[i].pictureUrl === null) {
                        list[i].pictureUrl = v.placeholderSrc;
                      }
                      if (!pos[t].productList) {
                        pos[t].productList = [];
                      }
                      pos[t].productList.push(list[i]);
                      if (i === list.length - 1) {
                        resolve(pos);
                      }
                    }
                  }
                }
              } else {
                resolve(pos);
              }
            }
          });
      });
    },
    selectMessage(currentRow, aaa) { // 选择站内信表格行(有可能是站内信组、站内信）
      if (currentRow.childrenRe) {
        this.currentMessageGroup = currentRow;
        this.currentMessage = null;
      } else {
        this.currentMessage = currentRow;
        this.currentMessageGroup = null;
        this.getRemarkList();
      }
      this.queryMessageOrder(currentRow);
    },
    getSelectValue(value) {
      this.selectMessageList = value;
    },
    queryMessageOrder (row) {
      this.selcctMessage = this.$common.copy(row || {});
      if (this.$common.isEmpty(row)) return;
      this.isCancelPending && this.cancelQuery(api.get_messageOrder);
      this.data1 = [];
      // 获取站内信订单
      this.axios.get(api.get_messageOrder + '?itemId=' + row.itemId + '&buyerAccount=' + row.buyerAccount).then(response => {
        if (response.data.code === 0) {
          let pos = [];
          let orderIdPos = [];
          let saleAccountIdPos = [];
          let data = response.data.datas;
          if (data !== null) {
            pos = this.deepCopy(data);
            data.forEach((n, i) => {
              saleAccountIdPos.push(n.saleAccountId);
              orderIdPos.push(n.orderId);
            });
            if (saleAccountIdPos.length > 0) { // 匹配订单号
              const getData = async () => {
                const Arr = await this.getAccountCode(pos, saleAccountIdPos);
                const newArr = await this.getProductList(Arr, orderIdPos);
                this.data1 = newArr || [];
              }
              getData();
            }
          }
        }
      });
    },
    handelChangeDate(value) { // 选择日期
      if (!value) return false;
      if (value[0] && value[1]) {
        this.pageParams.receiveStartTime = this.getUniversalTime(new Date(value[0]).getTime(), 'fulltime');
        this.pageParams.receiveEndTime = this.getUniversalTime(new Date(value[1]).getTime(), 'fulltime');
      } else {
        this.pageParams.receiveStartTime = null;
        this.pageParams.receiveEndTime = null;
      }
    },
    // 取消请求
    cancelQuery (apiKey, callback) {
      // 再次请求时，如果上一次请求还未来返回，取消上一次请求
      typeof callback == 'function' && callback();
      this.$store.commit('cancelPending', apiKey);
    },
    searchMessage (isAutoExpand, firstSearch) { // 查询站内信( isAutoExpand = true 全部展开，否则默认 为 false)
      const autoExpand = typeof isAutoExpand === 'boolean' ? isAutoExpand : false;
      const isFirstSearch = typeof firstSearch === 'boolean' ? firstSearch : !!firstSearch;
      if (this.currentMessageFolder.folderType === 'sending') {
        // 发信箱
        this.querySendingMessage();
      } else if (this.currentMessageFolder.folderType === 'sended') {
        // 已发送
        this.querySendedMessage();
      } else if (this.currentMessageFolder.folderType === 'ebayMessage') {
        // 查询ebay来信
        if (!isFirstSearch) {
          this.queryEbayMessage();
        } else {
          this.total = 0;
          this.totalPage = 0;
          this.tableLoading = false;
          this.selectMessageList = [];
          this.nogroupData = [];
        }
      } else {
        // 再次请求时，如果上一次请求还未来返回，取消上一次请求
        this.cancelQuery(api.get_messageGroup, () => {
          this.isCancelPending = true;
        });
        // 查询优先的未分派未处理数据
        this.axios.post(api.get_messageGroup, {
          ...this.getPageParams(),
          ...(this.pageUrlParams.messageGroupId ? { messageGroupId: this.pageUrlParams.messageGroupId } : {})
        }).then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            let messageGroupIds = [];
            if (data.list.length) {
              let newDataList = [];
              let otherList = {};
              data.list.forEach((n, i) => {
                this.$set(this.messageByGroupJson, n.messageGroupId, n);
                // 当是指定分组时只查指定分组
                if (n.messageGroupId === this.pageUrlParams.messageGroupId) {
                  otherList = n;
                } else {
                  newDataList.push(n);
                  messageGroupIds.push(n.messageGroupId);
                }
              });
              if (!this.$common.isEmpty(otherList)) {
                newDataList.splice(0, 0, otherList);
                messageGroupIds.splice(0, 0, otherList.messageGroupId);
              }
              this.getMessageByGroupIds(messageGroupIds, newDataList, autoExpand);
              this.queryMessageOrder(newDataList[0]);
              this.tableLoading = false;
              this.total = Number(data.total);
              this.totalPage = Number(data.pages);
            } else {
              this.groupData = [];
              this.currentMessage = null;
              this.currentMessageGroup = null;
              this.total = 0;
              this.totalPage = 0;
              this.tableLoading = false;
            }
            // messageGroupId 使用完之后，直接移除 messageGroupId 值
            delete this.pageUrlParams.messageGroupId;
          }
        }).finally(() => {
          this.isCancelPending = false;
        });
      }
    },
    // 查询所有模板
    searchAllTemplate() {
      return new Promise((resolve) => {
        this.allMessageTemplateJson = {};
        this.axios.get(api.query_allTemp + '?platformId=' + this.platformId).then(response => {
          if (response.data.code === 0) {
            let obj = {};
            let arr = [];
            let mdStr = '';
            (response.data.datas || []).forEach((item) => {
              mdStr = md5(item.categoryName);
              this.$set(this.allMessageTemplateJson, item.messageTemplateId, item);
              if (this.$common.isUndefined(obj[mdStr])) {
                obj[mdStr] = [];
              }
              obj[mdStr].push(item);
            });
            Object.keys(obj).forEach(key => {
              arr.push({
                ...obj[key][0],
                childrenRe: obj[key],
                messageTemplateId: obj[key][0].templateCategoryId,
                messageTemplateName: obj[key][0].categoryName,
              })
            });
            this.allMessageTemplateList = arr;
          }
        }).finally(() => {
          resolve({ state: 'finally' });
        })
      })
    },
    // 处理树节点
    treeNormalizer(node) {
      return {
        id: node.messageTemplateId,
        label: node.messageTemplateName,
        children: node.childrenRe
      }
    },
    // 获取参数
    getPageParams() {
      let params = this.$common.copy(this.pageParams);
      if (!this.$common.isEmpty(params.lastReceiveTime, true) && this.isVisibleLastReceiveTime) {
        params.lastReceiveTimeStart = this.$common.dayjs(params.lastReceiveTime[0]).format('YYYY-MM-DD HH:mm:ss');
        params.lastReceiveTimeEnd = this.$common.dayjs(params.lastReceiveTime[1]).format('YYYY-MM-DD HH:mm:ss');
      }
      if (!['ebayMessage'].includes(this.currentMessageFolder.folderType)) {
        params.receiveStartTime = null;
        params.receiveEndTime = null;
      }
      delete params.lastReceiveTime;
      return params;
    },
    querySendingMessage () { // 查询发件箱站内信
      this.pageParams.sendSuccess = false;
      // 再次请求时，如果上一次请求还未来返回，取消上一次请求
      this.cancelQuery(api.query_outBox, () => {
        this.isCancelPending = true;
      })
      this.axios.post(api.query_outBox, this.getPageParams()).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          this.selectMessageList = [];
          if (data.list) {
            this.tableLoading = false;
            this.nogroupData = data.list;
            this.currentMessage = data.list[0];
            this.queryMessageOrder(data.list[0]);
            this.total = data.total;
            this.totalPage = data.pages;
            this.getRemarkList();
          } else {
            this.tableLoading = false;
            this.total = 0;
            this.totalPage = 0;
            this.groupData = [];
          }
        }
      }).finally(() => {
        this.isCancelPending = false;
      });
    },
    querySendedMessage () { // 查询已发件箱站内信
      this.pageParams.sendSuccess = true;
      // 再次请求时，如果上一次请求还未来返回，取消上一次请求
      this.cancelQuery(api.query_outBox, () => {
        this.isCancelPending = true;
      })
      this.axios.post(api.query_outBox, this.getPageParams()).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          this.selectMessageList = [];
          if (data.list) {
            this.tableLoading = false;
            this.nogroupData = data.list;
            this.currentMessage = data.list[0];
            this.queryMessageOrder(data.list[0]);
            this.total = data.total;
            this.totalPage = data.pages;
            this.getRemarkList();
          } else {
            this.tableLoading = false;
            this.total = 0;
            this.totalPage = 0;
            this.nogroupData = [];
          }
        }
      }).finally(() => {
        this.isCancelPending = false;
      });
    },
    queryEbayMessage () { // 查询ebay来信
      // 再次请求时，如果上一次请求还未来返回，取消上一次请求
      this.cancelQuery(api.get_ebayMessage, () => {
        this.isCancelPending = true;
      })
      this.axios.post(api.get_ebayMessage, this.getPageParams()).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          this.selectMessageList = [];
          if (data.list) {
            this.tableLoading = false;
            this.nogroupData = data.list;
            this.currentMessage = data.list[0];
            this.queryMessageOrder(data.list[0]);
            this.total = Number(data.total);
            this.totalPage = Number(data.pages);
            this.getRemarkList();
          } else {
            this.total = 0;
            this.totalPage = 0;
            this.tableLoading = false;
            this.nogroupData = [];
          }
        }
      }).finally(() => {
        this.isCancelPending = false;
      });
    },
    getMessageByGroupIds(groupIds, list, autoExpand) { // 根据分组Ids查询分组下的站内信
      let tempMessageGroupIdToMessageGroup = this.deepCopy(this.messageGroupIdToMessageGroup);
      let tempCurrentMessageGroup = this.deepCopy(this.currentMessageGroup);
      let tempCurrentMessage = this.deepCopy(this.currentMessage);
      this.messageGroupIdToMessageGroup = {};
      this.currentMessageGroup = null;
      this.currentMessage = null;
      this.isCancelPending && this.cancelQuery(api.get_messageInfo);
      this.axios.get(`${api.get_messageInfo}?groupIds=${groupIds}&upDown=${this.pageParams.upDown}`).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          list.forEach((n, i) => {
            if (autoExpand) {
              n._expanded = autoExpand;
            } else if (tempMessageGroupIdToMessageGroup[n.messageGroupId]) {
              n._expanded = tempMessageGroupIdToMessageGroup[n.messageGroupId]._expanded;
            } else {
              n._expanded = false;
            }
            this.messageGroupIdToMessageGroup[n.messageGroupId] = n;
            n.childrenRe = data[n.messageGroupId];
            if (tempCurrentMessage) {
              n.childrenRe.forEach((n, i) => {
                if (n.messageId === tempCurrentMessage.messageId) {
                  this.currentMessage = n;
                }
              });
            }
            // 刷新的时候获取之前选择的分组,否则备注会不显示
            if (tempCurrentMessageGroup && tempCurrentMessageGroup.messageGroupId === n.messageGroupId) {
              this.currentMessageGroup = n;
            }
          });
          if (!this.$common.isEmpty(list)) {
            this.groupData = list;
          }
          if (!this.currentMessage) {
            this.currentMessageGroup = this.currentMessageGroup ? this.currentMessageGroup : list[0];
          }
          this.getRemarkList();
        }
      });
    },
    writeIframe(id, content) {
      this.$nextTick(() => {
        const dome = document.getElementById(id);
        if (dome) {
          let contentFrame = dome.contentWindow ? (dome.contentWindow.document || dome.contentDocument) : dome.contentDocument;
          contentFrame.open();
          contentFrame.write(content);
          contentFrame.close();
        }
      });
    },
    setIframeContent() {
      /**
       * @Description: 設置站內信內容  未用v-html  IDY-6402
       * @author gan
       * @date: 2020/11/12 11:37
       * @params:
       */
      let v = this;
      let length = 0;
      // 是否選擇了組
      let data = [];
      if (v.currentMessage) {
        length = 1;
        data = [v.currentMessage];
      } else {
        if (v.currentMessageGroup) {
          data = v.currentMessageGroup.childrenRe || [];
          length = data.length;
        }
      }
      if (length) {
        for (let i = 0; i <= length; i++) {
          if (data[i] && data[i].messageBody) {
            v.writeIframe('messageIframe' + i, data[i].messageBody.messageContent);
          }
        }
      }
    },
    getMessageBodyByMessageIds(messageIds) { // 根据消息Ids查询分组下的站内信Body
      let v = this;
      return new Promise(resolve => {
        v.axios.get(api.get_queryMessageBodyByMessageIds + '?messageIds=' + messageIds)
          .then(response => {
            if (response.data.code === 0) {
              let data = response.data.datas;
              if (v.currentMessage) {
                v.currentMessage.messageBody = data[v.currentMessage.messageId];
              } else {
                (v.currentMessageGroup ? v.currentMessageGroup.childrenRe || [] : []).forEach((n, i) => {
                  n.messageBody = data[n.messageId];
                });
              }
              v.setIframeContent();
              resolve();
            }
          });
      });
    },
    // 获取站内信文件夹
    getTreeData() {
      // 收件箱
      this.axios.get(api.get_inBox + '?platformId=' + this.platformId).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            let inBox = data.splice(0, 1);
            this.messageFolderTree[0].title = '收件箱' + ' (' + inBox[0].totalUntreatedCount + ')';
            this.messageFolderTree[0].childrenRe = this.assemblyFolderTreeData(data, null, this.messageFolderTree[0].folderType || 'inbox');
          }
        }
      });
      // 未分派
      this.axios.get(api.get_undistributed + '?platformId=' + this.platformId).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          // 加上未分派标识字段
          data.forEach((m, t) => {
            m.unassigned = true;
          });
          if (data) {
            let notAllot = data.splice(0, 1);
            this.messageFolderTree[4].title = '未分派' + ' (' + notAllot[0].totalUntreatedCount + ')';
            this.messageFolderTree[4].childrenRe = this.assemblyFolderTreeData(data, null, this.messageFolderTree[0].folderType || 'unassigned');
          }
        }
      });
      // 优先的
      this.axios.get(api.get_firstLetter + '?platformId=' + this.platformId).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          let total = 0;
          data.forEach((n, i) => {
            n.parentFolderId = null;
            n.folderName = n.priorityName;
            n.levelColor = n.priorityImage;
            total += n.totalUntreatedCount;
          });
          this.messageFolderTree[5].title = '优先的' + ' (' + total + ')';
          this.messageFolderTree[5].childrenRe = this.assemblyFolderTreeData(data, null, this.messageFolderTree[0].folderType || 'priorLevel');
        }
      });
      // 发件箱 查询数量
      this.getSenderToal();
    },
    // 发件箱 查询数量
    getSenderToal () {
      return new Promise((resolve) => {
        this.axios.get(api.get_outBox + '?platformId=' + this.platformId).then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            this.messageFolderTree[1].title = '发件箱' + ' (' + data + ')';
            return resolve(true);
          }
          resolve(false);
        }).catch(() => {
          resolve(false);
        });
      })
    },
    assemblyFolderTreeData(data, parentFolderId, type) { // 组装文件夹树数据
      let tree = [];
      let temp;
      for (let i = 0; i < data.length; i++) {
        if (data[i].parentFolderId === parentFolderId) {
          let obj = data[i];
          obj.title = obj.folderName + ' (' + obj.totalUntreatedCount + ')';
          obj.expand = true;
          if (!this.$common.isEmpty(type)) {
            obj.folderType = type;
          }
          temp = this.assemblyFolderTreeData(data, data[i].folderId, type);
          if (temp.length > 0) {
            obj.childrenRe = temp;
          }
          tree.push(obj);
        }
      }
      return tree;
    },
    getRemarkList (msgIds) { // 获取备注列表
      let v = this;
      let messageIds = [];
      let messageList = v.currentMessage ? [v.currentMessage] : v.currentMessageGroup ? v.currentMessageGroup.childrenRe || [] : [];
      if (!msgIds) {
        messageList.forEach((n, i) => {
          messageIds.push(n.messageId);
        });
      } else {
        messageIds = msgIds;
      }
      if (this.$common.isEmpty(messageIds)) return;
      this.isCancelPending && this.cancelQuery(api.get_remarkList);
      v.axios.post(api.get_remarkList + '?messageIds=' + messageIds).then(response => {
        if (response.data.code === 0) {
          let data = response.data.datas;
          if (data) {
            messageList.forEach((n, i) => {
              if (data[n.messageId]) {
                v.$set(n, 'remarkList', data[n.messageId]);
              } else {
                v.$set(n, 'remarkList', []);
              }
            });
          }
        }
      });
    },
    searchCustomMessageTemplate() { // 查询常用模板
      let v = this;
      let obj = {
        categoryType: '1',
        platformId: v.platformId
      };
      v.axios.post(api.query_ofenTemp, obj)
        .then(response => {
          if (response.data.code === 0) {
            let data = response.data.datas;
            if (data) {
              v.customMessageTemplateList = data;
            }
          }
        });
    },
    addRemark(messageId) { // 添加备注弹窗
      let v = this;
      v.addRemarkModalStatus = true;
      v.addMessageRemarkBo.messageId = messageId;
    },
    addRemarkOk() { // 确认添加备注
      let v = this;
      if (v.addMessageRemarkBo.messageRemark) {
        v.axios.post(api.add_remarkCs, v.addMessageRemarkBo)
          .then(response => {
            if (response.data.code === 0) {
              v.$Message.success('新增成功');
              v.addRemarkModalStatus = false;
            }
            v.addMessageRemarkBo.messageId = null;
            v.addMessageRemarkBo.messageRemark = null;
            v.searchMessage(false);
          });
      } else {
        v.$Message.error('不能为空');
      }
    },
    singleGroupRepeat() { // 单个站内信组转发
      let v = this;
      v.commonRepeat([v.currentMessageGroup.messageGroupId]);
    },
    showBatchRepeat() { // 展示批量转发接口
      let v = this;
      if (v.selectedMessateGroupList.length) {
        v.repeatModalStatus = true;
        v.isBatchRepeat = true;
      } else {
        v.$Message.error('请选择需要转发的消息组');
      }
    },
    batchRepeat() { // 批量站内信组转发
      let v = this;
      let messageGroupIds = [];
      v.selectedMessateGroupList.forEach((n, i) => {
        messageGroupIds.push(n.messageGroupId);
      });
      v.commonRepeat(messageGroupIds);
    },
    commonRepeat(messageGroupIds) { // 转发通用方法
      let v = this;
      if (v.batchRepeatParamsBo.folderId === '') {
        v.$Message.error('请选择文件夹');
        return;
      }
      if (v.batchRepeatParamsBo.messageHandler === '') {
        v.$Message.error('请选择分配用户');
        return;
      }
      let obj = {
        'folderId': v.batchRepeatParamsBo.folderId[0].folderId,
        'messageGroupIds': messageGroupIds,
        'messageHandler': v.batchRepeatParamsBo.messageHandler
      };
      v.axios.post(api.get_batchAssign, obj)
        .then(response => {
          if (response.data.code === 0) {
            v.repeatModalStatus = false;
            v.$Message.success('操作成功');
            v.searchMessage(false);
            v.tableLoading = true;
          }
        });
    },
    // 删除站内信(组或者站内信)
    deleteMessage () {
      if (this.currentMessageGroup) {
        // 删除站内信组
        this.$Modal.confirm({
          title: '删除确认',
          content: '是否确认删除该组邮件？',
          onOk: () => {
            this.eMailLoading = true;
            this.tableLoading = true;
            this.axios.delete(api.del_messageGroup + '?messageGroupId=' + this.currentMessageGroup.messageGroupId).then(response => {
              if (response && response.data && response.data.code === 0) {
                this.$Message.success('删除成功');
                this.searchMessage(false);
              } else {
                this.tableLoading = false;
              }
            }).catch(() => {
              this.tableLoading = false;
            }).finally(() => {
              this.eMailLoading = false;
            })
          }
        })
      } else {
        // 删除单条站内信
        this.$Modal.confirm({
          title: '删除确认',
          content: '是否确认删除该邮件？',
          onOk: () => {
            this.eMailLoading = true;
            this.tableLoading = true;
            this.axios.delete(api.del_messageInfo + this.currentMessage.messageId).then(response => {
              if (response && response.data && response.data.code === 0) {
                this.$Message.success('删除成功');
                this.searchMessage(false);
              } else {
                this.tableLoading = false;
              }
            }).catch(() => {
              this.tableLoading = false;
            }).finally(() => {
              this.eMailLoading = false;
            })
          }
        })
      }
    },
    deleteMessageRemark(id, messageId) { // 删除站内信备注
      this.axios.delete(api.del_remarkCs + id).then(response => {
        if (response && response.data && response.data.code === 0) {
          this.$Message.success('操作成功');
          this.searchMessage(false);
          this.tableLoading = true;
        }
      });
    },
    // 回复时间改变时
    lastReceiveTimeChange(val) {
      this.$nextTick(() => {
        this.searchMessage();
      })
    },
    // 忽略站内信(type == batch则是批量忽略)
    ignoreMessage (type) {
      let obj = {};
      let tips = '';
      if (type === 'batch') {
        tips = '是否确认忽略选中的消息组邮件？';
        // 忽略站内信组
        if (this.selectedMessateGroupList.length) {
          let pos = [];
          this.selectedMessateGroupList.forEach((n, i) => {
            pos.push(n.messageGroupId);
          });
          obj = {
            messageGroupIds: pos,
            messageId: null
          };
        } else {
          this.$Message.error('请选择需要忽略的消息组');
          return;
        }
      } else {
        // 忽略单个组或者单条站内信
        tips = this.currentMessageGroup ? '是否确认忽略该组邮件？' : '是否确认忽略该邮件？';
        obj = {
          messageGroupIds: this.currentMessageGroup ? [this.currentMessageGroup.messageGroupId] : null,
          messageId: this.currentMessage ? this.currentMessage.messageId : null
        };
      }
      this.$Modal.confirm({
        title: '忽略确认',
        content: tips,
        onOk: () => {
          this.eMailLoading = true;
          this.tableLoading = true;
          this.axios.put(api.update_messageRead, obj).then(response => {
            if (response.data.code === 0) {
              this.$Message.success('操作成功');
              this.searchMessage(false);
            } else {
              this.tableLoading = false;
            }
          }).catch(() => {
            this.tableLoading = false;
          }).finally(() => {
            this.eMailLoading = false;
          })
        }
      })
    },
    selectMessateGroup(selectedMessateGroupList) { // 表格站内信组数据
      this.selectedMessateGroupList = selectedMessateGroupList;
    },
    // 内容改变时
    msgContentChange () {
      this.messageContentTranslation = '';
      this.transtionLoading = false;
    },
    // 翻译
    translationText () {
      if (this.$common.isEmpty(this.replyMessageBo.messageContent, true)) {
        this.messageContentTranslation = '';
        return;
      }
      if (this.transtionLoading) return;
      this.transtionLoading = true;
      this.axios.post(api.aliTranslate, this.replyMessageBo.messageContent).then(res => {
        this.transtionLoading = false;
        if (!res || !res.data || res.data.code != 0) {
          this.messageContentTranslation = '';
          return;
        }
        this.messageContentTranslation = res.data.datas;
      }).catch(() => {
        this.messageContentTranslation = '';
        this.transtionLoading = false;
      })
    },
    // 选择常用模板
    selectTemplate(messageId) {
      this.msgContentChange();
      if (this.$common.isEmpty(messageId)) return;
      let messageContent = messageId;
      if (!this.$common.isEmpty(this.allMessageTemplateJson[messageId])) {
        messageContent = this.allMessageTemplateJson[messageId].messageContent || '';
      }
      this.getOrderBuyerIdAndItemId().then(res => {
        this.replyMessageBo.tempMessageContent = messageContent;
        if (this.orderList.length === 0) {
          this.replyMessageBo.messageContent = messageContent;
        } else if (this.orderList.length === 1) {
          this.replaceTemplatePlaceholders(this.orderList[0]);
        } else {
          this.orderSelectModelStatus = true;
        }
      });
    },
    replaceTemplatePlaceholders(orderData) { // 替换模版占位符
      let v = this;
      let tempMessageContent = v.replyMessageBo.tempMessageContent;
      tempMessageContent = tempMessageContent.replace('${sellerEbayId}', orderData.account);
      tempMessageContent = tempMessageContent.replace('${buyerId}', orderData.buyerAccountId);
      tempMessageContent = tempMessageContent.replace('${itemTitle}', orderData.title);
      tempMessageContent = tempMessageContent.replace('${quantity}', orderData.quantity);
      tempMessageContent = tempMessageContent.replace('${amount}', orderData.productsPrice);
      let recipientAddress = orderData.buyerName + ' ' + (orderData.buyerPhone ? orderData.buyerPhone
        : '') + ' ' + (orderData.buyerMobile
          ? orderData.buyerMobile
          : '') + ' ' + (orderData.buyerAddress1
            ? orderData.buyerAddress1
            : '') + ' ' + (orderData.buyerAddress2
              ? orderData.buyerAddress2
              : '') + (orderData.buyerCity
                ? orderData.buyerCity
                : '') + '' + (orderData.buyerState
                  ? orderData.buyerState
                  : '') + ' ' + (orderData.buyerPostalCode
                    ? orderData.buyerPostalCode
                    : '');
      // eslint-disable-next-line no-template-curly-in-string
      tempMessageContent = tempMessageContent.replace('${recipientAddress}', recipientAddress);
      tempMessageContent = tempMessageContent.replace('${deliveryDate}', orderData.despatchTime
        ? orderData.despatchTime
        : '未发货');
      tempMessageContent = tempMessageContent.replace('${trackNumber}', orderData.trackingNumber
        ? orderData.trackingNumber
        : '无跟踪号');
      v.replyMessageBo.messageContent = tempMessageContent;
      v.replyMessageBo.tempMessageContent = '';
    },
    getOrderBuyerIdAndItemId() { // 根据买家ID、ITEMId查询订单信息
      let v = this;
      v.orderList = [];
      return new Promise(resolve => {
        v.axios.get(api.queryByBuyerIdAndItemId + '?buyerAccountId=' + v.getBuyerAccount.buyerAccount + '&itemId=' + v.getBuyerAccount.itemId)
          .then(res => {
            if (res.data.code === 0) {
              let arr = res.data.datas;
              let arr1 = [];
              if (arr) {
                arr.forEach(i => {
                  i.orderShippingInfos.forEach(j => {
                    j.orderShippingDetailBos.forEach(k => {
                      k.orderLen = i.orderShippingInfos.length;
                      k.packageLen = j.orderShippingDetailBos.length;
                      k.accountCode = i.accountCode;
                      arr1.push(k);
                    });
                  });
                });
                let arr2 = arr1.sort(v.compare('orderId', 'packageCode'));
                arr2.forEach((i) => {
                  if (!v.orderLength['i' + i.packageCode]) {
                    v.orderLength['i' + i.packageCode] = 1;
                    i.packageCodeIndex = true;
                  } else {
                    v.orderLength['i' + i.packageCode] += 1;
                  }
                  if (!v.orderLength[i.orderId]) {
                    v.orderLength[i.orderId] = 1;
                    i.rowIndex = true;
                  } else {
                    v.orderLength[i.orderId] += 1;
                  }
                });
                v.orderList = arr2;
              }
              resolve();
            }
          })
          .catch(() => {
          });
      });
    },
    compare(property, property1) {
      return function (a, b) {
        let at = a[property];
        let bt = b[property];
        let an = a[property1];
        let bn = b[property1];
        if (at > bt) {
          return 1;
        } else if (at < bt) {
          return -1;
        } else {
          if (an > bn) {
            return -1;
          } else if (an < bn) {
            return 1;
          } else {
            return 0;
          }
        }
      };
    },
    getGroupWebstoreMessageId () {
      if (this.$common.isEmpty(this.currentMessageGroup) || this.$common.isEmpty(this.currentMessageGroup.childrenRe)) return '';
      return this.currentMessageGroup.childrenRe.filter(f => {
        return !this.$common.isEmpty(f.webstoreMessageId)
      })
    },
    replyMessage () { // 回复站内信
      if (this.replyMessageBo.messageContent) {
        /* let valid = false;
          if (this.currentMessageGroup) {
            this.currentMessageGroup.childrenRe.forEach(i => {
              if (i.webstoreMessageId !== null) {
                valid = true;
              }
            });
          } else {
            if (this.currentMessage.webstoreMessageId !== null) {
              valid = true;
            }
          }
          if (!valid) {
            this.$Message.error('webstoreMessageId 为空，不能回复');
            return;
          }
        */
        let messageItem = this.$common.copy(this.currentMessage || {});
        this.replyMessageBo.messageId = messageItem ? messageItem.messageId : null;
        let isEmailMessage = false;
        if (['inbox', 'sending'].includes(this.currentMessageFolder.folderType)) {
          const isWebstoreMessageId = this.getGroupWebstoreMessageId();
          if (!this.$common.isEmpty(messageItem)) {
            isEmailMessage = this.$common.isEmpty(messageItem.webstoreMessageId);
          } else if (!this.$common.isEmpty(this.currentMessageGroup) && this.$common.isEmpty(isWebstoreMessageId)) {
            isEmailMessage = true;
            // messageItem.receiver = this.currentMessageGroup.buyerAccount;
            if (this.currentMessageGroup.childrenRe) {
              messageItem = this.currentMessageGroup.childrenRe[0];
            }
          }
        }
        if (isEmailMessage) {
          let isSender = false;
          if (this.$common.isEmpty(this.selcctMessage.buyerAccount) && ['sending'].includes(this.currentMessageFolder.folderType)) {
            isSender = true;
          } else {
            isSender = this.selcctMessage.buyerAccount == messageItem.receiver;
          }
          if (this.$common.isEmpty(messageItem.sender) || this.$common.isEmpty(messageItem.receiver)) {
            this.$Message.error('系统无法获取到发送人账号或接收信息账号');
            return;
          }
          let requestBo = {
            itemId: messageItem.itemId,
            itemTitle: messageItem.subject, // item标题
            sender: messageItem[isSender ? 'sender' : 'receiver'], // 发送人
            messageContent: this.replyMessageBo.messageContent, // 回复的内容
            tempMessageContent: this.replyMessageBo.tempMessageContent, // 存在多交易 存放
            receiver: messageItem[isSender ? 'receiver' : 'sender'], // 接收人
            saleAccountId: messageItem.saleAccountId, // 帐号编号
            // 站内信附件列表
            messageMediaList: this.uploadedImgList.map(i => {
              return {
                mediaName: i.response.datas.mediaName,
                mediaUrl: i.response.datas.mediaUrl
              };
            }),
            sendToEmail: this.sendToEmail ? 1 : 0 // 站内信附件列表
          };
          this.axios.post(api.update_ebaySendBuyerMessage, requestBo).then(response => {
            if (response.data.code === 0) {
              this.$Message.success('操作成功');
              this.replyMessageBo.messageContent = '';
              this.searchMessage(false);
              this.getSenderToal();
            }
          });
          return;
        }
        this.replyMessageBo.messageGroupId = !this.$common.isEmpty(this.currentMessageGroup) ? this.currentMessageGroup.messageGroupId : null;
        this.sendToEmail = this.sendToEmail ? 1 : 0;
        this.replyMessageBo.messageMediaList = this.uploadedImgList.map(i => {
          return {
            mediaName: i.response.datas.mediaName,
            mediaUrl: i.response.datas.mediaUrl
          };
        });
        this.axios.post(api.reply_emailMessage, this.replyMessageBo).then(response => {
          if (response.data.code === 0) {
            this.$Message.success('操作成功');
            this.replyMessageBo.messageContent = '';
            this.searchMessage(false);
            this.getSenderToal();
          }
        });
      } else {
        this.$Message.error('回复内容为空');
      }
    },
    searchTemplateByCode() { // 根据模版编号查询模版内容
      let v = this;
      if (v.templateCode) {
        v.axios.get(api.query_tempCode + '?platformId=' + v.platformId + '&templateCode=' + v.templateCode)
          .then(response => {
            if (response.data.code === 0) {
              let data = response.data.datas;
              if (data) {
                v.replyMessageBo.tempMessageContent = data.messageContent;
                v.getOrderBuyerIdAndItemId()
                  .then(res => {
                    v.replyMessageBo.tempMessageContent = data.messageContent;
                    if (v.orderList.length === 0) {
                      v.replyMessageBo.messageContent = data.messageContent;
                    } else if (v.orderList.length === 1) {
                      v.replaceTemplatePlaceholders(v.orderList[0]);
                    } else {
                      v.orderSelectModelStatus = true;
                    }
                  });
              } else {
                v.$Message.error('未找到模板');
              }
              v.templateCode = '';
            }
          });
      }
    },
    reSend() { // 重发站内信
      let v = this;
      v.axios.put(api.set_reSend + '?messageId=' + v.currentMessage.messageId)
        .then(response => {
          if (response.data.code === 0) {
            v.$Message.success('发送成功');
          }
        });
    },
    changeMessageFolder(messageFolder) { // 切换文件夹
      if (messageFolder.length === 0) {
        this.currentMessageFolder.selected = true;
        return;
      }
      this.currentMessage = null;
      this.currentMessageGroup = null;
      this.currentMessageFolder = messageFolder[0];
      this.pageParams.folderId = this.currentMessageFolder.folderId;
      if (['unassigned'].includes(this.currentMessageFolder.folderType)) {
        this.pageParams.unassigned = true;
      } else if (!this.$common.isEmpty(this.currentMessageFolder.unassigned)) {
        this.pageParams.unassigned = this.currentMessageFolder.unassigned;
      } else {
        this.pageParams.unassigned = false;
      }
      if (['priorLevel'].includes(this.currentMessageFolder.folderType)) {
        this.pageParams.priorLevel = 99;
      } else if (!this.$common.isEmpty(this.currentMessageFolder.priorLevel)) {
        this.pageParams.priorLevel = this.currentMessageFolder.priorLevel;
      } else {
        delete this.pageParams.priorLevel;
      }
      this.$nextTick(() => {
        this.searchMessage(false, false);
      })
    },
    markLevel(messageGroupId, level) { // 更新优先级
      let v = this;
      v.axios.put(api.update_markLevel + '?messageGroupId=' + messageGroupId + '&level=' + level)
        .then(res => {
          if (res.data.code === 0) {
            v.$Message.success('修改成功');
            v.search();
          }
        });
    },
    reset() { // 重置状态

    },
    // 全部展开(收起)
    expandOrShorten(type) {
      this.groupData = this.groupData.map((m) => {
        return { ...m, _expanded: type }
      });
    },
    modifyTheSort(type) { // 排序
      let v = this;
      if (type === 'receiveTimeSort') {
        if (v.pageParams.receiveTimeSort === 'lastReceiveTime') {
          v.pageParams.receiveTimeSort = 'firstReceiveTime';
        } else {
          v.pageParams.receiveTimeSort = 'lastReceiveTime';
        }
      } else {
        if (v.pageParams.upDown === 'up') {
          v.pageParams.upDown = 'down';
        } else {
          v.pageParams.upDown = 'up';
        }
      }
      v.pageParamsStatus = true;
    },
    handleRemove(file, index) {
      const fileList = this.$refs.upload.fileList;
      this.$refs.upload.fileList.splice(fileList.indexOf(file), 1);
      this.uploadedImgList.splice(index, 1);
    },
    handleSuccess(res, file, fileList) {
      if (res.datas) {
        file.url = res.datas.mediaUrl;
        this.uploadedImgList = fileList;
        this.$Message.success('上传图片成功！');
      }
    },
    handleProgress (event, file, fileList) {
      this.uploadedImgList = fileList;
    },
    handleError (errorInfo, file, fileList) {
      this.uploadedImgList = fileList;
    },
    handleFormatError(file) {
      this.$Notice.warning({
        title: 'The file format is incorrect',
        desc: 'File format of ' + file.name + ' is incorrect, please select jpg or png.'
      });
    },
    handleMaxSize(file) {
      this.$Notice.warning({
        title: 'Exceeding file size limit',
        desc: 'File  ' + file.name + ' is too large, no more than 2M.'
      });
    },
    handleBeforeUpload() {
      const fileList = this.$refs.upload.fileList;
      const check = fileList.length < 6;
      if (!check) {
        this.$Notice.warning({
          title: 'Up to five pictures can be uploaded.'
        });
        this.uploadedImgList = fileList.filter(item => {
          return item.status == 'finished' && !item.showProgress;
        });
      }
      return check;
    }
  }
};
</script>
<style lang="less">
.ebayMail .combiePackageCode {
  float: none
}

.webstoremItem {
  color: #2b85e4;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.boldFont {
  font-weight: bold;
  margin-top: 20px;
}

.bgorangeBlock {
  color: white;
  background: #FF6600;
}

.bggreenBlock {
  color: white;
  background: #00CC33;
  margin-left: 10px;
}

.mail-icon {
  font-size: 16px;
  color: #ff7800;
  margin-right: 5px;
}
</style>
<style lang="less" scoped>
.label-span {
  width: 100px;
}
.content-right{
  position: relative;
}
.textarea-mail {
  width: 100%;
  height: 200px;
  line-height: 1.5;
  padding: 4px 7px;
  font-size: 12px;
  border: 1px solid #dcdee2;
  border-radius: 4px;
  color: #515a6e;
  background-color: #fff;
  background-image: none;
  position: relative;
  cursor: text;
  -webkit-transition: border .2s ease-in-out, background .2s ease-in-out, -webkit-box-shadow .2s ease-in-out;
  transition: border .2s ease-in-out, background .2s ease-in-out, -webkit-box-shadow .2s ease-in-out;
  transition: border .2s ease-in-out, background .2s ease-in-out, box-shadow .2s ease-in-out;
  transition: border .2s ease-in-out, background .2s ease-in-out, box-shadow .2s ease-in-out, -webkit-box-shadow .2s ease-in-out;
}

.textarea-mail:hover {
  border-color: #57a3f3;
}

.messageFolderTree {
  position: sticky;
  top: 0;
  height: calc(100vh - 103px);
  overflow: auto;
  /* overflow-y: auto; */
}

.remarkBox {
  width: 85%;
  height: 35px;
  overflow: auto;
  line-height: 35px;
  border-radius: 10px;
  padding-left: 10px;
  margin-bottom: 10px;
  background-color: #C6DDF4;
}

.detailBox {
  overflow: auto;
}

.ofenTempBox {
  display: inline-block;
  margin-left: 10px;
}

.ofenTemp {
  cursor: pointer;
  position: relative;
  z-index: 2;

  &:hover {
    color: #ff6600;
    text-decoration: underline;
  }
}

.demo-upload-list {
  display: inline-block;
  width: 60px;
  height: 60px;
  text-align: center;
  line-height: 60px;
  border: 1px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  position: relative;
  box-shadow: 0 1px 1px rgba(0, 0, 0, .2);
  margin-right: 4px;

  img {
    width: 100%;
    height: 100%;
  }

  &:hover {
    .demo-upload-list-cover {
      display: block;
    }
  }
}

.demo-upload-list-cover {
  display: none;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, .6);

  i {
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    margin: 0 2px;
  }
}
.choose-message-template{
  display: flex;
  align-items: center;
}
.reply-button-operate{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.item-content-btn{
  display: inline-block;
  height: auto;
  margin-left: 15px;
  padding: 4px 6px;
  line-height: normal;
  background: #8700ff;
  color: #fff;
}
</style>
