<template>
  <a-drawer
    :title="title"
    :width="width"
    placement="right"
    :closable="false"
    @close="close"
    :visible="visible">
  
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">

        <a-form-item label="订单号" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'orderNum', validatorRules.orderNum]" placeholder="请输入订单号"></a-input>
        </a-form-item>
        <a-form-item label="订单状态：0未支付，1已支付" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="[ 'orderState', validatorRules.orderState]" placeholder="请输入订单状态：0未支付，1已支付" style="width: 100%"/>
        </a-form-item>
        <a-form-item label="三方流水号" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'tradeNo', validatorRules.tradeNo]" placeholder="请输入三方流水号"></a-input>
        </a-form-item>
        <a-form-item label="支付方式" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'type', validatorRules.type]" placeholder="请输入支付方式"></a-input>
        </a-form-item>
        <a-form-item label="支付日期" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="[ 'payTime', validatorRules.payTime]" placeholder="请输入支付日期" style="width: 100%"/>
        </a-form-item>
        <a-form-item label="商品名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'itemName', validatorRules.itemName]" placeholder="请输入商品名称"></a-input>
        </a-form-item>
        <a-form-item label="支付金额" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="[ 'money', validatorRules.money]" placeholder="请输入支付金额" style="width: 100%"/>
        </a-form-item>
        <a-form-item label="商品id" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'itemId', validatorRules.itemId]" placeholder="请输入商品id"></a-input>
        </a-form-item>
        <a-form-item label="用户id" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'userId', validatorRules.userId]" placeholder="请输入用户id"></a-input>
        </a-form-item>
        <a-form-item label="用户帐号" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'userAccout', validatorRules.userAccout]" placeholder="请输入用户帐号"></a-input>
        </a-form-item>
        
      </a-form>
    </a-spin>
    <a-button type="primary" @click="handleOk">确定</a-button>
    <a-button type="primary" @click="handleCancel">取消</a-button>
  </a-drawer>
</template>

<script>

  import { httpAction } from '@/api/manage'
  import pick from 'lodash.pick'
  
  export default {
    name: "AppOrderModal",
    components: { 
    },
    data () {
      return {
        form: this.$form.createForm(this),
        title:"操作",
        width:800,
        visible: false,
        model: {},
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },

        confirmLoading: false,
        validatorRules:{
        orderNum:{rules: [{ required: true, message: '请输入订单号!' }]},
        orderState:{rules: [{ required: true, message: '请输入订单状态：0未支付，1已支付!' }]},
        tradeNo:{},
        type:{rules: [{ required: true, message: '请输入支付方式!' }]},
        payTime:{},
        itemName:{rules: [{ required: true, message: '请输入商品名称!' }]},
        money:{rules: [{ required: true, message: '请输入支付金额!' }]},
        itemId:{rules: [{ required: true, message: '请输入商品id!' }]},
        userId:{rules: [{ required: true, message: '请输入用户id!' }]},
        userAccout:{rules: [{ required: true, message: '请输入用户帐号!' }]},
        },
        url: {
          add: "/app/appOrder/add",
          edit: "/app/appOrder/edit",
        }
     
      }
    },
    created () {
    },
    methods: {
      add () {
        this.edit({});
      },
      edit (record) {
        this.form.resetFields();
        this.model = Object.assign({}, record);
        this.visible = true;
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'orderNum','orderState','tradeNo','type','payTime','itemName','money','itemId','userId','userAccout'))
        })
      },
      close () {
        this.$emit('close');
        this.visible = false;
      },
      handleOk () {
        const that = this;
        // 触发表单验证
        this.form.validateFields((err, values) => {
          if (!err) {
            that.confirmLoading = true;
            let httpurl = '';
            let method = '';
            if(!this.model.id){
              httpurl+=this.url.add;
              method = 'post';
            }else{
              httpurl+=this.url.edit;
               method = 'put';
            }
            let formData = Object.assign(this.model, values);
            console.log("表单提交数据",formData)
            httpAction(httpurl,formData,method).then((res)=>{
              if(res.success){
                that.$message.success(res.message);
                that.$emit('ok');
              }else{
                that.$message.warning(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
              that.close();
            })
          }
         
        })
      },
      handleCancel () {
        this.close()
      },
      popupCallback(row){
        this.form.setFieldsValue(pick(row,'orderNum','orderState','tradeNo','type','payTime','itemName','money','itemId','userId','userAccout'))
      }
      
    }
  }
</script>

<style lang="less" scoped>
/** Button按钮间距 */
  .ant-btn {
    margin-left: 30px;
    margin-bottom: 30px;
    float: right;
  }
</style>