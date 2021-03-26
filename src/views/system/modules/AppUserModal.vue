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

        <a-form-item label="帐号" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'account', validatorRules.account]" placeholder="请输入帐号"></a-input>
        </a-form-item>
        <a-form-item label="密码" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'pwd', validatorRules.pwd]" placeholder="请输入密码"></a-input>
        </a-form-item>
        <a-form-item label="手机号" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="[ 'mobile', validatorRules.mobile]" placeholder="请输入手机号" style="width: 100%"/>
        </a-form-item>
        <a-form-item label="书币" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="[ 'point', validatorRules.point]" placeholder="请输入书币" style="width: 100%"/>
        </a-form-item>

        <a-form-item label="余额" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="[ 'balance', validatorRules.balance]" placeholder="请输入" style="width: 100%"/>
        </a-form-item>

        <a-form-item label="支付宝帐号" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="[ 'aliPayAccount', validatorRules.aliPayAccount]" placeholder="请输入" style="width: 100%"/>
        </a-form-item>

        <a-form-item label="支付宝姓名" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="[ 'aliPayName', validatorRules.aliPayName]" placeholder="请输入" style="width: 100%"/>
        </a-form-item>
        <a-form-item label="VIP到期时间" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <j-date placeholder="请选择VIP到期时间" v-decorator="[ 'vipDueTime', validatorRules.vipDueTime]" showTime style="width: 100%" dateFormat="YYYY-MM-DD HH:mm:ss"/>
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
  import JDate from '@/components/jeecg/JDate'  
  
  export default {
    name: "AppUserModal",
    components: { 
      JDate,
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
        account:{rules: [{ required: true, message: '请输入帐号!' }]},
        pwd:{rules: [{ required: true, message: '请输入密码!' }]},
        headPic:{},
        nickName:{},
        point:{rules: [{ required: true, validator: this.validatePoint }]},
        firstPay:{rules: [{ required: true, message: '请输入首充（0否，1是）!' }]},
        vipDueTime:{},
        dujiaLock:{rules: [{ required: true, message: '请输入独家解锁(0否，1是)!' }]},
        lastLoginTime:{},
        lastLoginIp:{},
        status:{},
        mobile:{rules: [{ validator: this.validatePhone }]},
        },
        url: {
          add: "/app/appUser/add",
          edit: "/app/appUser/edit",
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
        /*if(this.model.firstPay || this.model.firstPay>=0) {
          this.model.firstPay = this.model.firstPay + ""
        }else{
          this.model.firstPay = "0"
        }*/

        this.visible = true;
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'account','pwd','point','firstPay','vipDueTime','dujiaLock','mobile','balance','aliPayAccount','aliPayName'))
        })
      },
      validatePoint(rule, value, callback){
        if(!value || value<0){
          callback("书币不能小于0")
        }
        callback()
      },
      validatePhone(rule, value, callback){
        let reg = /^[1]([3-9])[0-9]{9}$/;
          if(value && !reg.test(value)){
              callback("手机格式不正确")
            }
        callback()
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
        this.form.setFieldsValue(pick(row,'account','pwd','headPic','nickName','point','firstPay','vipDueTime','dujiaLock','lastLoginTime','lastLoginIp','status'))
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