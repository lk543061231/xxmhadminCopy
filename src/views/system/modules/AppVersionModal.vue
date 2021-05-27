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

        <a-form-item label="版本号" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'version', validatorRules.version]" placeholder="请输入版本号"></a-input>
        </a-form-item>
       
        <a-form-item label="更新说明" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'content', validatorRules.content]" placeholder="请输入更新说明"></a-input>
        </a-form-item>
        <a-form-item label="是否强制更新" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-radio-group  v-decorator="[ 'isEnforceUpdate', {initialValue:0}]">
                <a-radio :value="1">是</a-radio>
                <a-radio :value="0">否</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item v-if="fromType=='android'"  label="上传apk" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-upload
            listType="text"

            class="avatar-uploader"
            name="file"
            :action="uploadAction"
            :headers="headers"
            :beforeUpload="beforeUpload"
            @change="handleChange"
          >
          <a-button class="ant-upload-text"> <a-icon type="upload" /> 上传pak </a-button>
            <!-- <div v-if="model.file"  style="height:104px;max-width:300px">{{model.file}}</div>
            <div v-else>
              <a-icon :type="uploadLoading ? 'loading' : 'plus'" />
              <div class="ant-upload-text">上传</div>
            </div> -->
          </a-upload>
        </a-form-item>
        <a-form-item v-if="fromType=='ios'" label="TF链接" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'appPath', validatorRules.appPath]" placeholder="请输入TF链接"></a-input>
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
  import JUpload from '@/components/jeecg/JUpload'
  import JDictSelectTag from "@/components/dict/JDictSelectTag"
  import { ACCESS_TOKEN } from "@/store/mutation-types"
  import Vue from 'vue'
  export default {
    components: { 
      JDate,
      JUpload,
      JDictSelectTag,
    },
    props:{
       
    },
    data () {
      return {
        fromType:'',
        form: this.$form.createForm(this),
        title:"操作",
        width:800,
        visible: false,
        headers:{},
        picUrl:"",
        uploadLoading:false,
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
            version:{rules: [{ required: true, message: '请输入版本号!' }]},
            content:{rules: [{ required: true, message: '请输入更新说明!' }]},
            isEnforceUpdate:{rules: [{ required: true, message: '请输入版本号!' }]},
            appPath:{rules: [{ required: true, message: '请输入TF链接!' }]},
        
        },
        url: {
          add: "/app/update/insert",
          edit: "/app/update/edit",
          fileUpload: window._CONFIG['domianURL']+"/app/aliyun/upload",
          imgerver: window._CONFIG['domianURL']+"/sys/common/view",
        }
     
      }
    },
    created () {
      const token = Vue.ls.get(ACCESS_TOKEN);
      this.headers = {"X-Access-Token":token}
    //   if(this.fromType=='ios'){
    //       this.model.clientType=2
    //   }else{
    //      this.model.clientType=1 
    //   }
    },
    computed:{
      uploadAction:function () {
        return this.url.fileUpload;
      }
    },
    methods: {
      getAvatarView(){
        return this.url.imgerver +"/"+ this.model.taskIco;
      },
      beforeUpload: function(file){
        var fileType = file.type;
      },
      handleChange (info) {
        this.picUrl = "";
        if (info.file.status === 'uploading') {
          this.uploadLoading = true;
          return
        }
        if (info.file.status === 'done') {
          var response = info.file.response;
          this.uploadLoading = false;

          if(response.success){
            this.model.appPath = response.result.imgUrl;

            this.picUrl = "Has no pic url yet";
          }else{
            this.$message.warning(response.message);
          }
        }
      },
      add (val) {
        this.fromType=val || ''
        this.edit({});
      },
      edit (record) {
        if(!this.fromType){
          // 编辑
          if(record.clientType==1){
            this.fromType='android'
          }else{
            this.fromType='ios'
          }
        }
        
        this.form.resetFields();
        this.visible = true;
        
        this.model = Object.assign({}, record);
        if(this.model.id) this.model.taskType = this.model.taskType + ""
        this.model.clientType= this.fromType=='android'?1:this.fromType=='ios'?2: record.clientType

        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'version','content','isEnforceUpdate','appPath','clientType'))
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
        this.form.setFieldsValue(pick(row,'taskName','taskNo','taskSub','taskIco','taskType','giveCoin','giveVip','cateType','createTime'))
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