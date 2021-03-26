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

        <a-form-item label="公告标题" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'title', validatorRules.title]" placeholder="请输入公告标题"></a-input>
        </a-form-item>

        <a-form-item label="公告类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select v-model="noteType" placeholder="请选择">
            <a-select-option :value="1">文字</a-select-option>
            <a-select-option :value="2">图片</a-select-option>
          </a-select>

        </a-form-item>
        <a-form-item label="公告类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select @change="postionChange" v-decorator="[ 'postion', validatorRules.postion]" placeholder="请选择">
            <a-select-option :value="1">首页弹窗</a-select-option>
            <a-select-option :value="2">公告列表</a-select-option>
          </a-select>

        </a-form-item>

        <a-form-item label="图片" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="noteType==2 ">
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
            <img v-if="model.imgUrl" :src="getAvatarView()" alt="图片" style="height:104px;max-width:300px"/>
            <div v-else>
              <a-icon :type="uploadLoading ? 'loading' : 'plus'" />
              <div class="ant-upload-text">上传</div>
            </div>
          </a-upload>
          <span></span>
        </a-form-item>

        <a-form-item label="文字内容" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="noteType==1 || postion==2">

          <j-editor v-decorator="[ 'content', validatorRules.content]" triggerChange></j-editor>


        </a-form-item>

        <a-form-item label="跳转地址" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="postion==1">
          <a-input v-decorator="[ 'hrefUrl', validatorRules.hrefUrl]" placeholder="请输入跳转地址"></a-input>
        </a-form-item>
        <a-form-item label="排序" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="[ 'sort', validatorRules.sort]" placeholder="请输入首页弹出" style="width: 100%"/>
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
  import JEditor from '@/components/jeecg/JEditor'

  export default {
    name: "AppNoticesModal",
    components: {
      JEditor
    },
    data () {
      return {
        form: this.$form.createForm(this),
        title:"操作",
        width:800,
        headers:{},
        picUrl:"",
        uploadLoading:false,
        visible: false,
        model: {},
        postion:1,
        noteType:1,
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
        status:{},
        noteType:{},
        content:{rules: [{ required: true, message: '请输入内容!' }]},
        imgUrl:{},
          postion:{rules: [{ required: true, message: '请选择位置!' }]},
        hrefUrl:{},
        isOpen:{},
        },
        url: {
          add: "/app/appNotices/add",
          edit: "/app/appNotices/edit",
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
      postionChange(e){
        this.postion = e;
      },
      add () {
        this.edit({});
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
      getAvatarView(){
        return this.url.imgerver +"/"+ this.model.imgUrl;
      },
      edit (record) {
        if(record.postion) this.postion =record.postion
        this.form.resetFields();
        this.model = Object.assign({}, record);
        if(this.model.noteType) this.noteType = this.model.noteType;
        if(this.model.content) this.model.content = this.model.content.replace(/<br\/>/g, '\r\n')
        this.visible = true;
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'title','status','noteType','content','imgUrl','hrefUrl','isOpen','postion'))
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
            if(formData.noteType==2){
              let imgUrl = this.model.imgUrl
              if(!imgUrl){
                that.$message.warning('请上传图片');
                that.confirmLoading = false;
                return;
              }
            }
            formData.noteType = this.noteType

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
        this.form.setFieldsValue(pick(row,'title','status','noteType','content','imgUrl','hrefUrl','isOpen'))
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