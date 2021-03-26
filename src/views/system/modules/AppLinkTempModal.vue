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
            <a-button class="sel-btn" @click="showNovelListModal" icon="book" >选择</a-button>
          </a-form-item>
        </div>
        <div v-else>
          <a-form-item label="推广漫画" :labelCol="labelCol" :wrapperCol="wrapperCol" style="position: relative" >
            <a-input v-decorator="[ 'novelName', validatorRules.novelName]" disabled="disabled"  placeholder="请选择推广漫画" ></a-input>
            <a-button class="sel-btn" @click="showComicListModal" icon="book" >选择</a-button>
          </a-form-item>
        </div>
        <a-form-item label="模板名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input v-decorator="[ 'tempName', validatorRules.tempName]" placeholder="请输入模板名称" ></a-input>
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
    <a-button type="primary" @click="handleOk">生成模板</a-button>
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
        title:"推广模板",
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
        type:1,

        confirmLoading: false,
        validatorRules:{
        tempName:{rules: [{ required: true, message: '请输入模板名称!' }]},
        novelId:{},
        novelName:{rules: [{ required: true, message: '请选择推广小说!' }]},
        contentTitle:{rules: [{ required: true, message: '请输入文案标题!' }]},
        payMoney:{},
        userCount:{},
        imgUrl:{rules: [{ required: true, message: '请选择文案图片!' }]},
        note:{},

        },
        loadEnd:0,

        isDef:0,
        userId:"",
        novelInfo:{},
        url: {
          add: "/app/appLinkTemp/add",
          edit: "/app/appLinkTemp/edit",
        }
     
      }
    },
    created () {
    },
    watch:{
      type(val){
        if(this.loadEnd==0)return
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
      showComicListModal(){this.$refs.comicListForm.show();},
      showNovelListModal(){
        this.$refs.novelListForm.show();
      },
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
        if(record.type) {
          this.type = record.type
        }

        if(this.type==1){
          this.$nextTick(() => {
            this.form.setFieldsValue(pick(this.model,'tempName','imgUrl','novelName','contentTitle','note'))
          })
        }else{
          this.$nextTick(() => {
            this.form.setFieldsValue(pick(this.model,'tempName','novelName','contentTitle','note'))
          })
        }
        let t = this;
        setTimeout(()=>{ t.loadEnd = 1;},500)


      },
      close () {
        this.$emit('close');
        this.visible = false;
        this.userId=""
        this.loadEnd =0;
        this.type = 1;
      },
      showTgPage(){
        const that = this;
        this.form.validateFields((err, values) => {
          if (!err) {
            let formData = Object.assign(this.model, values);
            formData.novelId = that.novelInfo.id;
            formData.type = this.type
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
            formData.type = that.type;
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