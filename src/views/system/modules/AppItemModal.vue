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

        <a-form-item label="商品类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select v-model="itemType" placeholder="请选择" >
            <a-select-option :value="1">书币</a-select-option>
            <a-select-option :value="2">VIP充值</a-select-option>

          </a-select>
        </a-form-item>
        <a-form-item label="商品标签(最多3字)" :labelCol="labelCol" :wrapperCol="wrapperCol" >
          <a-input v-decorator="[ 'itemTag', validatorRules.itemTag]" placeholder="请输入商品标签"></a-input>
        </a-form-item>
        <a-form-item label="充值书币" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="itemType == 1">
          <a-input-number v-decorator="[ 'golds', validatorRules.golds]" placeholder="请输入充值书币" style="width: 100%"/>
        </a-form-item>
        <a-form-item label="VIP充值类型" :labelCol="labelCol" :wrapperCol="wrapperCol" v-else>
          <a-select v-decorator="[ 'vipType', validatorRules.vipType]" placeholder="请选择">
            <a-select-option :value="3">日卡</a-select-option>
            <a-select-option :value="4">周卡</a-select-option>
            <a-select-option :value="1">月卡</a-select-option>
            <a-select-option :value="5">季卡</a-select-option>
            <a-select-option :value="6">半年卡</a-select-option>
            <a-select-option :value="2">年卡</a-select-option>
            <a-select-option :value="7">终身卡</a-select-option>
          </a-select>

        </a-form-item>
        <a-form-item label="商品金额" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="[ 'price', validatorRules.price]" placeholder="请输入商品金额" style="width: 100%"/>
        </a-form-item>
        <a-form-item label="商品描述" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'itemDescribe', validatorRules.itemDescribe]" placeholder="请输入商品描述"></a-input>
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
    name: "AppItemModal",
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
        itemType:1,

        confirmLoading: false,
        validatorRules:{
        itemType:{rules: [{ required: true, message: '请输入商品类型!' }]},
        itemTag:{},
        golds:{rules: [{required: true,validator: this.validateGolds}]},
        vipType:{rules: [{ required: true, message: '请选择VIP类型' }]},
        price:{rules: [{required: true,validator: this.validatePrice}]},
        itemDescribe:{},
        status:{},
        isDel:{},
        },
        url: {
          add: "/app/appItem/add",
          edit: "/app/appItem/edit",
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
        if(record.itemType) this.itemType = record.itemType
        this.visible = true;
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'itemType','itemTag','golds','vipType','price','itemDescribe'))
        })
      },
      close () {
        this.$emit('close');
        this.visible = false;
      },

      validateGolds(rule, value, callback){
        if(!value || value<0){
          callback("书币不能小于0")
        }
        callback()
      },

      validatePrice(rule, value, callback){
        if(!value || value<0){
          callback("金额不能小于0")
        }
        callback()
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
            formData.itemType = that.itemType;
            if(formData.itemType==1){
              formData.vipType = 0;
            }else{
              formData.golds= 0;
            }
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
        this.form.setFieldsValue(pick(row,'itemType','itemTag','golds','vipType','price','itemDescribe','isDel'))
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