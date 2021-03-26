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


        <a-form-item label="用户帐号" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'username', validatorRules.username]" disabled="disabled" placeholder="请输入用户帐号"></a-input>
        </a-form-item>
        <a-form-item label="渠道名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'realname', validatorRules.realname]" disabled="disabled" placeholder="请输入用户名"></a-input>
        </a-form-item>

        <a-form-item label="结算方式" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select @change="payTypeChange($event)" v-decorator="[ 'settlementType', validatorRules.settlementType]" placeholder="请选择" >
            <a-select-option :value="1">支付宝</a-select-option>
            <a-select-option :value="2">银行</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="收款人帐号" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input placeholder="请输入收款人帐号" v-decorator="[ 'payAccount', validatorRules.payAccount]" />
        </a-form-item>

        <a-form-item label="收款人姓名" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input placeholder="收款人姓名" v-decorator="[ 'payName', validatorRules.payName]" />
        </a-form-item>

        <a-form-item label="结算银行" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="model.settlementType==2">
          <a-input placeholder="请输入结算银行" v-decorator="[ 'bankName', validatorRules.bankName]" />
        </a-form-item>

        <a-form-item label="结算金额" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="[ 'money', validatorRules.money]" placeholder="请输入结算金额" style="width: 40%"/>
        </a-form-item>
        <a-form-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'note', validatorRules.note]" placeholder="请输入备注"></a-input>
        </a-form-item>
        
      </a-form>
    </a-spin>
    <a-popconfirm :title="'确定结算吗?'" @confirm="handleOk">
      <a-button type="primary" >确定</a-button>
    </a-popconfirm>

    <a-button type="primary" @click="handleCancel">取消</a-button>
  </a-drawer>
</template>

<script>

  import { httpAction } from '@/api/manage'
  import pick from 'lodash.pick'
  
  export default {
    name: "SysUserSettleLogModal",
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
          settlementType:{rules: [{ required: true, message: '请选择支结算方式!' }]},
          payAccount:{rules: [{ required: true, message: '请输入收款人帐号!' }]},
          payName:{rules: [{ required: true, message: '请输入收款人姓名!' }]},
          bankName:{rules: [{ required: true, message: '请输入银行名称!' }]},
          money:{rules: [{ required: true, validator:this.validateMoney }]},
        note:{},
        userInfo:{},
        },
        url: {
          add: "/system/sysUserSettleLog/add",
          edit: "/system/sysUserSettleLog/edit",
        }
     
      }
    },
    created () {
    },
    methods: {
      payTypeChange(e){
        this.model.settlementType = e;
        if(e==2){
          this.$nextTick(() => {
            this.form.setFieldsValue(pick(this.model,'settlementType','bankName'))
          })
        }
      },
      validateMoney(rule, value, callback){
        if(!value || value<=0){
          callback("结算金额不能少于0")
        }
        if(value>this.userInfo.money){
          callback("结算金额不能大于该用户可结算金额")
        }
        callback();
      },
      add (record) {
        this.edit(record);
      },
      edit (record) {
        if(!record.id){
          this.$message.warning("参数错误");
          return;
        }
        this.userInfo = record;
        this.form.resetFields();
        this.model = Object.assign({}, record);
        delete this.model['id']
        this.visible = true;

        if(this.model.settlementType == 2){

          this.$nextTick(() => {
            this.form.setFieldsValue(pick(this.model,'settlementType','username','realname','money','payAccount','payName','bankName'))
          })
        }else{
          this.$nextTick(() => {
            this.form.setFieldsValue(pick(this.model,'username','realname','money','payAccount','payName','settlementType'))
          })
        }

      },
      close () {
        this.$emit('close');
        this.visible = false;
        this.userInfo={}
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
            formData.userAccount = that.userInfo.username
            formData.userName = that.userInfo.realname
            formData.userId = that.userInfo.id
            if(formData.settlementType==1)formData.bankName = ''
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
        this.form.setFieldsValue(pick(row,'userId','userAccount','userName','channelId','money','note'))
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