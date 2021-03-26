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
        <a-form-item label="推广类型" :labelCol="labelCol" :wrapperCol="wrapperCol" style="position: relative" v-has="'user:edit'">
          <a-select v-model="type" placeholder="请选择" >
            <a-select-option :value="1">小说</a-select-option>
            <a-select-option :value="2">漫画</a-select-option>
          </a-select>
        </a-form-item>
        <div v-if="type==1">
          <a-form-item  label="推广小说" :labelCol="labelCol" :wrapperCol="wrapperCol" style="position: relative" >
            <a-input v-decorator="[ 'novelName', validatorRules.novelName]" disabled="disabled"  placeholder="请选择推广小说" ></a-input>
            <a-button class="sel-btn" @click="showNovelListModal" icon="book" v-if="isDef==1">选择</a-button>
          </a-form-item>
        </div>
        <div v-else>
          <a-form-item label="推广漫画" :labelCol="labelCol" :wrapperCol="wrapperCol" style="position: relative" >
            <a-input v-decorator="[ 'novelName', validatorRules.novelName]" disabled="disabled"  placeholder="请选择推广漫画" ></a-input>
            <a-button class="sel-btn" @click="showComicListModal" icon="book" v-if="isDef==1">选择</a-button>
          </a-form-item>
        </div>
        <a-form-item label="链接名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'linkName', validatorRules.linkName]" placeholder="请输入链接名称" ></a-input>
        </a-form-item>

        <a-form-item label="文案标题" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'contentTitle', validatorRules.contentTitle]"  placeholder="请输入文案标题"></a-input>
        </a-form-item>

        <a-form-item label="文案图片" :labelCol="labelCol" :wrapperCol="wrapperCol" style="position: relative" v-if="type==1">
          <a-input v-decorator="[ 'imgUrl', validatorRules.imgUrl]" disabled="disabled"  placeholder="请选择文案图片">

          </a-input>
          <a-button class="sel-btn" @click="showImgModel" icon="picture">选择</a-button>
        </a-form-item>
        <a-form-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'note', validatorRules.note]" placeholder="请输入备注"></a-input>
        </a-form-item>
        <a-form-item label="其它" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-button  @click="showTgPage" icon="search" type="primary">预览推广页面</a-button>
        </a-form-item>

      </a-form>
    </a-spin>
    <a-button type="primary" @click="handleOk">生成链接</a-button>
    <a-button type="primary" @click="handleCancel">取消</a-button>
    <sysImg-modal ref="sysImgModalForm" @ok="modalFormOk"></sysImg-modal>
    <tuiGuangView-modal ref="tuiGuangModalForm" @ok="modalFormOk"></tuiGuangView-modal>
    <appNovelSelectList-modal ref="novelListForm" @ok="listModalFormOk"></appNovelSelectList-modal>
    <appComicSelectList-modal ref="comicListForm" @ok="listModalFormOk"></appComicSelectList-modal>
  </a-drawer>
</template>

<script>

  import { httpAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import SysImgModal from  './SysImgModal'
  import TuiGuangViewModal from './TuiGuangViewModal'
  import AppNovelSelectListModal from '../AppNovelSelectList'
  import AppComicSelectListModal from '../AppComicSelectList'
  export default {
    name: "AppLinkModal",
    components: {
      SysImgModal,
      TuiGuangViewModal,
      AppNovelSelectListModal,
      AppComicSelectListModal
    },
    data () {
      return {
        form: this.$form.createForm(this),
        title:"生成链接",
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
        linkName:{rules: [{ required: true, message: '请输入链接名称!' }]},
        novelId:{},
        novelName:{rules: [{ required: true, message: '请选择推广内容!' }]},
        contentTitle:{rules: [{ required: true, message: '请输入文案标题!' }]},
        payMoney:{},
        userCount:{},
        imgUrl:{rules: [{ required: true, message: '请选择文案图片!' }]},
        note:{},

        },
        isDef:0,
        userId:"",
        type:1,
        novelInfo:{},
        url: {
          add: "/app/appLink/add",
          edit: "/app/appLink/edit",

        }
     
      }
    },
    created () {
    },
    watch:{
      type(val){
        this.model.novelId = "";
        this.model.novelName = "";
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'novelName'))
        })
      }
    },
    methods: {
      listModalFormOk(record){
        if(record.novelTitle){
          this.model.novelName = record.novelTitle;
          this.novelInfo = record
          this.$nextTick(() => {
            this.form.setFieldsValue(pick(this.model,'novelName'))
          })
        }
      },
      showNovelListModal(){
        this.$refs.novelListForm.show();
      },
      showComicListModal(){this.$refs.comicListForm.show();},
      show(record,userId){

        this.form.resetFields();
        this.visible = true;
        this.novelInfo = record;
        if(record.novelTitle){
          this.model.novelName = record.novelTitle;

          this.$nextTick(() => {
            this.form.setFieldsValue(pick(this.model,'novelName'))
          })
        }
        if(record.isDef) this.isDef = record.isDef;

        if(userId) this.userId = userId;
        if(record.type) this.type = record.type;

      },

      modalFormOk(url){
        if(url){
          this.model.imgUrl = url;
          this.$nextTick(() => {
            this.form.setFieldsValue(pick(this.model,'imgUrl'))
          })
        }
      },
      showImgModel(){
        this.$refs.sysImgModalForm.show();
      },
      add () {
        this.edit({});
      },
      edit (record) {
        this.form.resetFields();
        this.model = Object.assign({}, record);
        this.visible = true;
        if(record.novelId) this.novelInfo.id = record.novelId;
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'linkName','imgUrl','novelName','contentTitle','note'))
        })
      },
      close () {
        this.$emit('close');
        this.visible = false;
        this.userId=""
      },
      showTgPage(){
        const that = this;
        this.form.validateFields((err, values) => {
          if (!err) {
            let formData = Object.assign(this.model, values);
            formData.novelId = that.novelInfo.id;
            formData.type=this.type
            this.$refs.tuiGuangModalForm.show(formData);
          }

        })
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
            formData.novelName = that.novelInfo.novelTitle
            formData.novelId = that.novelInfo.id;
            formData.isDef = that.isDef;
            formData.type = that.type;
            if(this.userId) formData.userId = this.userId
            console.log("表单提交数据",formData)

            httpAction(httpurl,formData,method).then((res)=>{
              if(res.success){
                that.$message.success("生成链接成功");
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
        this.form.setFieldsValue(pick(row,'linkName','novelId','novelName','contentTitle','payMoney','userCount','imgId','note'))
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
  .sel-btn{
    position: absolute;
    right: 0;
    top: -6px;
  }
</style>