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
          <a-input v-decorator="[ 'imgTitlte', validatorRules.imgTitlte]" placeholder="请输入标题"></a-input>
        </a-form-item>
        <a-form-item label="封面" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-upload
            listType="picture-card"
            class="avatar-uploader"
            :showUploadList="false"
            :action="uploadAction"
            :data="{'isup':1}"
            :headers="headers"
            :beforeUpload="beforeUpload"
            @change="handleChange"
          >
            <img v-if="model.imgUrl" :src="getAvatarView()" alt="封面" style="height:104px;max-width:300px"/>
            <div v-else>
              <a-icon :type="uploadLoading ? 'loading' : 'plus'" />
              <div class="ant-upload-text">上传</div>
            </div>
          </a-upload>
          <span>推荐尺寸:750 x 420 像素</span>
        </a-form-item>
        <a-form-item label="链接地址" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'hrefUrl', validatorRules.hrefUrl]" placeholder="请输入链接地址"></a-input>
        </a-form-item>
        <a-form-item label="排序" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="[ 'sort', validatorRules.sort]" placeholder="请输入排序" style="width: 100%"/>
        </a-form-item>

        <a-form-item label="位置" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select v-decorator="[ 'type', validatorRules.type]" placeholder="请选择">
            <a-select-option :value="2">首页</a-select-option>
            <a-select-option :value="1">小说</a-select-option>
            <a-select-option :value="4">抖漫</a-select-option>
          </a-select>
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
  import { ACCESS_TOKEN } from "@/store/mutation-types"
  import Vue from 'vue'
  
  export default {
    name: "AppBannerModal",
    components: { 
    },
    data () {
      return {
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
        imgTitlte:{rules: [{ required: true, message: '请输入标题!' }]},
        imgUrl:{rules: [{ required: true, message: '请输入图片地址!' }]},
        hrefUrl:{rules: [{ required: true, message: '请输入链接地址!' }]},
        sort:{rules: [{ required: true, message: '请输入排序!' }]},
        type:{rules: [{ required: true, message: '请选择类型!' }]},
        },
        url: {
          add: "/app/appBanner/add",
          edit: "/app/appBanner/edit",
          fileUpload: window._CONFIG['domianURL']+"/sys/common/upload",
          imgerver: window._CONFIG['domianURL']+"/sys/common/view",
        }
     
      }
    },
    created () {
      const token = Vue.ls.get(ACCESS_TOKEN);
      this.headers = {"X-Access-Token":token}
    },
    computed:{
      uploadAction:function () {
        return this.url.fileUpload;
      }
    },
    methods: {
      add () {
        this.edit({});
      },
      getAvatarView(){
        return this.url.imgerver +"/"+ this.model.imgUrl;
      },
      beforeUpload: function(file){
        var fileType = file.type;
        if(fileType.indexOf('image')<0){
          this.$message.warning('请上传图片');
          return false;
        }
        //TODO 验证文件大小
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
            this.model.imgUrl = response.message;

            this.picUrl = "Has no pic url yet";
          }else{
            this.$message.warning(response.message);
          }
        }
      },
      edit (record) {
        this.form.resetFields();
        this.model = Object.assign({}, record);
        this.visible = true;
        if(!this.model.sort) this.model.sort = 99
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'imgTitlte','imgUrl','hrefUrl','sort','status','type'))
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
            let imgUrl = this.model.imgUrl
            if(!imgUrl){
              that.$message.warning('请上传封面');
              that.confirmLoading = false;
              return;
            }
            let formData = Object.assign(this.model, values);
            formData.imgUrl = imgUrl;
            this.model.imgUrl = imgUrl;
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
        this.form.setFieldsValue(pick(row,'imgTitlte','hrefUrl','sort','type'))
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