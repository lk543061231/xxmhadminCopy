<template>
  <a-modal
    :title="title"
    :width="width"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    :maskClosable="false"
    @cancel="handleCancel"
    cancelText="关闭">
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <div v-if="viewModel==1">
        <a-form-item label="章节名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'chapterName', validatorRules.chapterName]" placeholder="请输入章节名称"></a-input>
        </a-form-item>

        <a-form-item label="计费模式" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select v-model="needGold" placeholder="请选择">
            <a-select-option :value="1">免费</a-select-option>
            <a-select-option :value="2">收费</a-select-option>
            <a-select-option :value="3">会员免费</a-select-option>
          </a-select>

        </a-form-item>
          
        <a-form-item label="书币" v-if="needGold==2"  :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="[ 'golds', validatorRules.golds]" placeholder="请输入书币" style="width: 100%"/>
          <span>书币为0或空取系统默认值</span>
        </a-form-item>

        <a-form-item label="序号" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input-number v-decorator="[ 'sort', validatorRules.sort]" placeholder="请输入序号" style="width: 100%"/>
        </a-form-item>
        </div>
          
        <a-form-item label="章节内容" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-textarea :rows="viewModel==1?13:23" placeholder="请输入内容" v-model="content" />

        </a-form-item>
          
        
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>

  import { httpAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import { axios } from '@/utils/request'
  
  export default {
    name: "AppNovelChapterModal",
    components: { 
    },
    data () {
      return {
        form: this.$form.createForm(this),
        title:"操作",
        content:"",
        width:800,
        visible: false,
        model: {},
        disableSubmit:true,
        viewModel:1,
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        needGold:1,

        confirmLoading: false,
        validatorRules:{
        chapterName:{rules: [{ required: true, message: '请输入章节名称!' }]},
        novelId:{rules: [{ required: true, message: '请输入小说ID!' }]},
        needGold:{rules: [{ required: true, message: '请输入收费模式（1，免费 2收费）!' }]},
        golds:{rules: [{validator: this.validateGolds}]},
        sort:{},
        status:{},

        contentUrl:{rules: [{ required: true, message: '请输入内容地址!' }]},
        },
        novelId:"",
        url: {
          add: "/app/appNovelChapter/add",
          edit: "/app/appNovelChapter/edit",
        }
     
      }
    },
    created () {
    },
    methods: {
      add (novelId) {
        this.novelId = novelId;

        this.getLastSort(novelId);

      },
      edit (record,sort) {
        if(record.viewModel) this.viewModel = record.viewModel
        this.form.resetFields();
        this.model = Object.assign({}, record);
        if(!this.model.novelId)this.model.novelId = this.novelId;
        if(record.needGold) this.needGold = record.needGold
        if(sort || sort ==0) this.model.sort = sort;

        this.visible = true;
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'chapterName','golds','sort'))
        })
        if(this.model.id)
        this.getChapterContent(this.model.novelId,this.model.id);


      },
      getLastSort(novelId){
        let that = this;
        this.confirmLoading = true;
        this.visible = true;
        axios({
          url: "/app/appNovelChapter/getLastSort",
          data:{novelId:novelId},
          method:'post' ,

        }).then((res) =>{
          this.confirmLoading = false;
          if (res.code==0 && res.success) {
            that.edit({},res.result)
          }else{
            that.edit({})
          }
        })
      },
      getChapterContent(novelId,id){
        let that = this;
        this.confirmLoading = true;
        this.visible = true;
        axios({
          url: "/app/appNovelChapter/getChapterContent",
          data:{novelId:novelId,id:id},
          method:'post' ,

        }).then((res) =>{
          this.confirmLoading = false;
          if (res.code==0 && res.success) {

            that.content = res.result.replace(/<br\/>/g,'\r\n');;
          }
        })
      },
      close () {
        this.$emit('close');
        this.visible = false;
        this.content ="";
        this.needGold = 1;
      },
      validateGolds(rule, value, callback){
        if(value && value<0){
          callback("书币不能小于0")
        }
        callback()
      },
      handleOk () {

        if(this.viewModel==2) {
          this.close()
          return;
        }
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
            formData.needGold = that.needGold;
            if(!that.content){
              that.$message.warning("请输入小说内容");
              that.confirmLoading=false;
              return;
            }
            formData.content = that.content;
            if(!formData.novelId){
              that.$message.warning("参数出错：novelId为空");
              that.confirmLoading=false;
              return;
            }

            console.log("表单提交数据",formData)
            httpAction(httpurl,formData,method).then((res)=>{
              if(res.success){
                that.$message.success(res.message);
                that.$emit('ok');
                that.close();
              }else{
                that.$message.warning(res.message);

              }
            }).finally(() => {
              that.confirmLoading = false;

            })
          }
         
        })
      },
      handleCancel () {
        this.close()
      },
      popupCallback(row){
        this.form.setFieldsValue(pick(row,'chapterName','golds','sort'))
      }
      
    }
  }
</script>