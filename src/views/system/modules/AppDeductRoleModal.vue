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
        <a-form-item label="规则名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'roleName', validatorRules.roleName]" placeholder="请输入规则名称"></a-input>
        </a-form-item>
        <a-form-item label="规则参数（新用户）" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'roleTxt', validatorRules.roleTxt]" placeholder="请输入规则参数"></a-input>
          <span>请用 '参数1 ,(小写)  参数2' 形式表示，参数不能小于0</span>
        </a-form-item>
        <a-form-item label="规则参数（老用户）" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'roleTxt2', validatorRules.roleTxt]" placeholder="请输入规则参数"></a-input>
          <span>请用 '参数1 ,(小写)  参数2' 形式表示，参数不能小于0</span>
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
    name: "AppDeductRoleModal",
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
        roleName:{rules: [{ required: true, message: '请输入规则名称' }]},
        roleTxt:{rules: [{ required: true, validator: this.validateRole }]},
        },
        url: {
          add: "/app/appDeductRole/add",
          edit: "/app/appDeductRole/edit",
        }
     
      }
    },
    created () {
    },
    methods: {
      validateRole(rule, value, callback){
        if(!value){
          callback("请输入规则参数")
        }
        let strs = value.split(",")
        if(!strs || strs.length!=2 || isNaN(strs[0]) || isNaN(strs[1]) || strs[0]<0 || strs[1]<0){
          callback("规则参数不正确")
        }
        callback()
      },
      add () {
        this.edit({});
      },
      edit (record) {
        this.form.resetFields();
        this.model = Object.assign({}, record);
        this.visible = true;
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'roleTxt','roleName','roleTxt2'))
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
        this.form.setFieldsValue(pick(row,'roleTxt'))
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