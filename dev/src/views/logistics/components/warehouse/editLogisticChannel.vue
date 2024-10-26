<template >
  <div >
    <Form :label-width='160' >
      <Card
          :bordered="false" dis-hover >
        <p slot="title" >基本信息</p >
        <FormItem label="邮寄方式名称：" ></FormItem >
        <FormItem label="邮寄方式代码：" ></FormItem >
      </Card >
      <Card
          :bordered="false" dis-hover >
        <p slot="title" >适用范围</p >
        <FormItem label="适用仓库：" ></FormItem >
        <Row >
          <Col :span='12' >
            <FormItem label="适用平台/账号：" ></FormItem >
          </Col >
          <Col :span='12' >
            <FormItem label="适用货品标签：" ></FormItem >
          </Col >
        </Row >
        <Row >
          <Col :span='12' >
            <FormItem label="适用包裹金额（$）：" >
              <InputNumber ></InputNumber >
              <span style='margin: 0 10px' >到</span >
              <InputNumber ></InputNumber >
            </FormItem >
          </Col >
          <Col :span='12' >
            <FormItem label="买家支付的运费范围（$）：" >
              <InputNumber ></InputNumber >
              <span style='margin: 0 10px' >到</span >
              <InputNumber ></InputNumber >
            </FormItem >
          </Col >
        </Row >
        <Row >
          <Col :span='12' >
            <FormItem label="包裹包含SKU：" >
              <Input
                  type="textarea" :rows="4" />
            </FormItem >
          </Col >
          <Col :span='12' >
            <FormItem label="商品总数量范围：" >
              <InputNumber ></InputNumber >
              <span style='margin: 0 10px' >到</span >
              <InputNumber ></InputNumber >
            </FormItem >
          </Col >
        </Row >
      </Card >
      <Card
          :bordered="false" dis-hover >
        <p slot="title" >平台标发设置</p >
        <Row >
          <Col :span='2' >
            <Checkbox
                v-model="single" style='height: 32px;line-height: 32px' >Ebay
            </Checkbox >
          </Col >
          <Col :span='10' >
            <span style='font-size: 12px' >物流服务商(Carrier)：</span > <dyt-select
              v-model="model1" style="width:150px" > <Option value="0" >123</Option > </dyt-select >
          </Col >
          <Col :span='8' >
            <span style='font-size: 12px' >运单号：</span > <dyt-select
              v-model="model1" style="width:150px" > <Option value="0" >123</Option > </dyt-select >
            <span style='font-size: 12px' >(默认)</span >
          </Col >
          <Col :span='4' >
            <a
                href="javascript:;" style='font-size: 12px;height: 32px;line-height: 32px' >添加特例国家</a >
          </Col >
        </Row >
        <Row >
          <Col :span='6' >

          </Col >
          <Col :span='6' >

          </Col >
          <Col :span='6' >

          </Col >
          <Col :span='6' >

          </Col >
        </Row >
      </Card >
    </Form >
  </div >
</template >

<script >
export default {
  data () {
    return {
      name: ''
    };
  }
};
</script >

<style scoped >

</style >
