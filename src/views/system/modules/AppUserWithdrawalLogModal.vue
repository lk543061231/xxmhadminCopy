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

        <a-form-item label="姓名" :labelCol="labelCol" :wrapperCol="wrapperCol" >
          <a-input v-decorator="[ 'realName', validatorRules.realName]" placeholder="请输入姓名" disabled="disabled"></a-input>
        </a-form-item>
        <a-form-item label="帐号" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'account', validatorRules.account]" placeholder="请输入帐号" disabled="disabled"></a-input>
        </a-form-item>
        <a-form-item label="支付宝姓名" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'alipayName', validatorRules.alipayName]" placeholder="请输入支付宝姓名" disabled="disabled"></a-input>
        </a-form-item>
        <a-form-item label="支付宝帐号" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'alipayAccount', validatorRules.alipayAccount]" placeholder="请输入支付宝帐号" disabled="disabled"></a-input>
        </a-form-item>
        <a-form-item label="提现金额" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="[ 'money', validatorRules.money]" placeholder="请输入提现金额" style="width: 100%" disabled="disabled"/>
        </a-form-item>
   
        <a-form-item label="状态" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <j-dict-select-tag type="list" v-decorator="['cashState']" :trigger-change="true" dictCode="cash_state" placeholder="请选择状态"/>
        </a-form-item>
       
        <a-form-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'note', validatorRules.note]" placeholder="失败请输入备注"></a-input>
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
  import JDictSelectTag from "@/components/dict/JDictSelectTag"
  import { axios } from '@/utils/request'
  
  export default {
    name: "AppUserWithdrawalLogModal",
    components: { 
      JDate,
      JDictSelectTag,
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
        realName:{},
        account:{},
        alipayName:{},
        alipayAccount:{},
        money:{},
        createTime:{},
        cashState:{},
        userId:{},
        note:{},
        },
        url: {
          add: "/app/appUserWithdrawalLog/add",
          edit: "/app/appUserWithdrawalLog/edit",
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
        if(record.cashState)record.cashState = record.cashState + ""
        this.form.resetFields();
        this.model = Object.assign({}, record);
        this.visible = true;
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'realName','account','alipayName','alipayAccount','money','cashState','note'))
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
            that.changeState(formData.id,formData.cashState,formData.note)
          }
         
        })
      },
      changeState(ids, status,note) {
        let that = this
        axios({
          url: '/app/appUserWithdrawalLog/changeState',
          method: 'post',
          data: { ids: ids, cashState: status ,note:note}
        }).then((res) => {
          that.confirmLoading = false;
          if (res.success) {
            that.$message.success("操作成功")
            that.$emit('ok');

            that.close();
          } else {

            that.$message.warning(res.message)
          }
        })
      },
      handleCancel () {
        this.close()
      },
      popupCallback(row){
        this.form.setFieldsValue(pick(row,'realName','account','alipayName','alipayAccount','money','createTime','cashState','userId','note'))
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