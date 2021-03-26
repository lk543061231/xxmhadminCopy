<template>
  <a-drawer
    :title="title"
    :width="width"
    placement="right"
    :closable="false"
    :maskClosable="false"
    @close="close"
    :visible="visible">
  
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">

        <a-form-item label="书名" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'novelTitle', validatorRules.novelTitle]" placeholder="请输入书名"></a-input>
        </a-form-item>
        <a-form-item label="作者" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'author', validatorRules.author]" placeholder="请输入作者"></a-input>
        </a-form-item>
        <a-form-item label="简介" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-textarea :rows="5" placeholder="请输入简介" v-decorator="[ 'introduction', validatorRules.introduction]" />

        </a-form-item>
        <a-form-item label="标签" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'tags', {}]"  placeholder="请输入标签" style="width: 100%"/>
          <span>多个标签用,(小写)分隔</span>
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
          <span>推荐尺寸:225 x 300 像素（文件名不能有中文）</span>
        </a-form-item>
        <a-form-item label="点赞数" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="[ 'praiseCount', {}]"  placeholder="请输入点赞数" style="width: 100%"/>
        </a-form-item>

        <a-form-item label="所属分类" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select v-decorator="[ 'categoryId', validatorRules.categoryId]" placeholder="请选择">
            <a-select-option v-for="(item,idx) in cateList" :key="idx" :value="item.id">{{item.categoryName}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="连载类型" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select v-decorator="[ 'overType', validatorRules.overType]" placeholder="请选择">
            <a-select-option :value="1">连载</a-select-option>
            <a-select-option :value="2">完结</a-select-option>

          </a-select>
        </a-form-item>

        <a-form-item label="首页属性" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select
            mode="multiple"
            style="width: 100%"
            placeholder="请选择首页属性"
            optionFilterProp = "children"
            v-decorator="[ 'indexColId', validatorRules.indexColId]">
            <a-select-option v-for="(item,idx) in colList" :key="idx" :value="item.id" >
              {{ item.title }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="排序" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="[ 'sort', validatorRules.sort]" placeholder="请输入排序" style="width: 100%"/>
        </a-form-item>
        <a-form-item label="小说ID" :labelCol="labelCol" :wrapperCol="wrapperCol" v-if="novelId">
          <span>{{novelId}}</span>
          <a @click="copyId" href="javascript:;" style="margin-left: 20px">复制到粘贴板</a>
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
  import { ACCESS_TOKEN } from "@/store/mutation-types"
  import Vue from 'vue'
  export default {
    name: "AppNovelModal",
    components: { 
      JDate,
    },
    data () {
      return {
        form: this.$form.createForm(this),
        title:"操作",
        cateList:[],
        headers:{},
        width:800,
        visible: false,
        colList:[],
        model: {},
        novelId:"",
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
        novelTitle:{rules: [{ required: true, message: '请输入书名!' }]},
        author:{rules: [{ required: true, message: '请输入作者!' }]},
        introduction:{rules: [{ required: true, message: '请输入简介!' }]},
        categoryId:{rules: [{ required: true, message: '请选择分类!' }]},
        channel:{rules: [{ required: true, message: '请选择所属频道!' }]},
        overType:{rules: [{ required: true, message: '请选择连载类型!' }]},
        sort:{},

        },
        picUrl:"",
        uploadLoading:false,
        url: {
          add: "/app/appNovel/add",
          edit: "/app/appNovel/edit",
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


      copyId(){
        let t =this;
        try {
          var input = document.createElement('input');
          input.setAttribute('readonly', 'readonly');
          input.setAttribute('value', t.novelId);
          document.body.appendChild(input);

          input.select();
          var res = document.execCommand('copy');
          document.body.removeChild(input);
          t.$message.success("复制到粘贴板成功");
          t.close()
          return res;
        }catch (e) {
          t.$message.error("复制到粘贴板失败，请手动复制");
        }
      },
      add (cateList,colList) {
        this.cateList =cateList;
        this.colList = colList;
        this.edit({});
      },
      edit (record,cateList,colList) {

        if(cateList) this.cateList =cateList;
        if(colList) this.colList = colList;
        this.form.resetFields();
        if(record.id) {
          this.novelId = record.id;
        }else{
          this.novelId = "";
        }

        this.model = Object.assign({}, record);
        if(!this.model.sort)this.model.sort=99
        if(this.model.isReco>=0) this.model.isReco = this.model.isReco *1
        this.visible = true;
        if(!this.model.channel)this.model.channel=1;
        if(this.model.introduction) this.model.introduction = this.model.introduction.replace(/<br\/>/g,'\r\n');
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'novelTitle','author','praiseCount','introduction','categoryId','sort','overType','isReco','tags'))
        })
        if(record.indexColId){
          this.model.indexColId = this.model.indexColId.split(",")
          this.$nextTick(() => {
            this.form.setFieldsValue(pick(this.model,'indexColId'))
          })
        }

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
            formData.indexColId = formData.indexColId?formData.indexColId.join(","):'';

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
      getAvatarView(){
        return this.url.imgerver +"/"+ this.model.imgUrl;
      },
      popupCallback(row){
        this.form.setFieldsValue(pick(row,'createBy','createTime','novelTitle','author','introduction','imgUrl','praiseCount','clickCount','categoryId','channel','sort','status','categoryName'))
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