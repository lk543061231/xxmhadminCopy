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

        <a-form-item label="标题" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'title', validatorRules.title]" placeholder="请输入标题"></a-input>
        </a-form-item>

        <a-form-item label="位置" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select v-decorator="[ 'position', validatorRules.position]" placeholder="请选择" >
            <a-select-option :value="1">启动</a-select-option>
            <a-select-option :value="2">随机插入</a-select-option>
            <a-select-option :value="3">小横幅</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="图片地址" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="type==1" >
          <a-input v-decorator="[ 'imgUrl', validatorRules.imgUrl]" placeholder="请输入图片地址"></a-input>
        </a-form-item>
        <a-form-item label="跳转链接" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'hrefUrl', validatorRules.hrefUrl]" placeholder="请输入跳转链接"></a-input>
        </a-form-item>

        <a-form-item label="点击数" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="[ 'clickCount', validatorRules.clickCount]" placeholder="请输入点击数" style="width: 30%"/>
        </a-form-item>

        <a-form-item label="排序" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="[ 'sort', validatorRules.sort]" placeholder="请输入排序" style="width: 30%"/>
        </a-form-item>
        <a-form-item label="到期时间" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <j-date placeholder="请选择到期时间" v-decorator="[ 'endTime', validatorRules.endTime]" showTime style="width: 100%" dateFormat="YYYY-MM-DD HH:mm:ss"/>
        </a-form-item>

        <a-form-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-textarea v-decorator="[ 'note', {}]"></a-textarea>
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
  import ATextarea from 'ant-design-vue/es/input/TextArea'
  import JDate from '@/components/jeecg/JDate'


  export default {
    name: "AppAdvModal",
    components: {
      ATextarea,
      JDate

     },
    data () {
      return {
        form: this.$form.createForm(this),
        title:"操作",
        width:800,
        visible: false,
        model: {},
        type:1,
        appIds:[],
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
        title:{rules: [{ required: true, message: '请输入标题!' }]},

        clickCount:{},
        imgUrl:{rules: [{ required: true, message: '请输入图片地址!' }]},
          position :{rules: [{ required: true, message: '请选择广告位置!' }]},
        hrefUrl:{},
        sort:{},
        status:{},


        },
        appList:[],
        url: {
          add: "/app/appAdv/add",
          edit: "/app/appAdv/edit",
        }
     
      }
    },
    created () {
    },
    methods: {
      typeChange(e){
        this.type = e;
      },
      add () {


        this.edit({});
      },
      edit (record) {

        this.form.resetFields();
        this.model = Object.assign({}, record);

        this.visible = true;
        if(record.appIds){
          let s = record.appIds.split(",")
          for(let i in s){
            this.appIds.push(s[i])
          }
        }
        if(record.type) {
          this.type = record.type;

        }

        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'title','clickCount','imgUrl','hrefUrl','sort','note','position','endTime'))
        })
      },
      close () {
        this.$emit('close');
        this.visible = false;
        this.appIds = [];
        this.type = 1;
      },
      handleOk () {
        const that = this;
        // 触发表单验证
        this.form.validateFields((err, values) => {
          if (!err) {

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


            that.confirmLoading = true;
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
        this.form.setFieldsValue(pick(row,'title','type','clickCount','imgUrl','position','hrefUrl','note','position'))
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