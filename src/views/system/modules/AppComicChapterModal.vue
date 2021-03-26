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
              <img v-if="model.imgUrl" :src="getAvatarView(1)" alt="封面" style="height:104px;max-width:300px"/>
              <div v-else>
                <a-icon :type="uploadLoading ? 'loading' : 'plus'" />
                <div class="ant-upload-text">上传</div>
              </div>
            </a-upload>
            <span>推荐尺寸:200 x 100 像素（文件名不能有中文）</span>
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
          
        <a-form-item label="章节图片" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <div class="img_list" >
            <div class="i_list_item" v-for="(item,idx ) in imgList " :key='idx' >
              <a :href="getImgSrc(item)" target="_blank" v-if="!item.file">
                <img  :src="getImgSrc(item)"  :title="item.sort"/>
              </a>
              <a  v-else @click="showErrorMsg()">

                <img :src="getImgSrc(item)"  :title="item.imgUrl"/>
              </a>
              <a-popconfirm title="确定删除吗?" @confirm="() => delImage(idx)" v-if="viewModel==1">
                <div class="del-btn">删除</div>
              </a-popconfirm>
              <div class="m-left" @click="changeSort(1,idx)" v-if="idx>0 && viewModel==1"> < </div>
              <div class="m-right" @click="changeSort(2,idx) " v-if="idx<imgList.length-1 && viewModel==1"> > </div>
            </div>

            <div class="i_list_item" v-if="viewModel==1">
              <a-upload
                listType="picture-card"
                class="avatar-uploader"
                :showUploadList="false"

                :headers="headers"

                :beforeUpload="beforeUpload2"
                :multiple="true"

              >

                <div >
                  <a-icon :type="uploadLoading ? 'loading' : 'plus'" />
                  <div class="ant-upload-text">上传</div>
                </div>
              </a-upload>
            </div>
          </div>

        </a-form-item>
          
        
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>

  import { httpAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import { axios } from '@/utils/request'
  import { ACCESS_TOKEN } from "@/store/mutation-types"
  import Vue from 'vue'

  let timer;
  export default {
    name: "AppComicChapterModal",
    components: { 
    },
    data () {
      return {
        form: this.$form.createForm(this),
        title:"操作",
        headers:{},
        content:"",
        width:800,
        visible: false,
        loadEnd:0,
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
        validatorRules: {
          chapterName: { rules: [{ required: true, message: '请输入章节名称!' }] },

          needGold: { rules: [{ required: true, message: '请输入收费模式（1，免费 2收费）!' }] },
          golds: { rules: [{ validator: this.validateGolds }] },
        },
        sort:{},
        status:{},
        picUrl:"",
        uploadLoading:false,
        novelId:"",
        imgList:[],

        url: {
          add: "/app/appComicChapter/add",
          edit: "/app/appComicChapter/edit",
          fileUpload: window._CONFIG['domianURL']+"/sys/common/upload",
          imgerver: window._CONFIG['domianURL']+"/sys/common/view/",
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
      getImgSrc(item){

        if(item.blobUrl) {
          return item.blobUrl;
        }else if(item.imgUrl.indexOf("data:")>=0){
          return item.imgUrl;
        }
        return this.url.imgerver + "/" + item.imgUrl;
      },
      changeSort(type,i){

        if(type==1){
          if(i<=0) return;
        }else{
          if(i>=this.imgList.length-1) return;

        }



        let nextIdx = type==1? i-1 : i*1+1*1
        this.alterItem(this.imgList,i,nextIdx)

      },
      alterItem(arr, index1, index2) {

        arr[index1] = arr.splice(index2, 1, arr[index1])[0]

        return arr

      },

      delImage(idx){
        let tem = [];
        for(let i in this.imgList)
          if(i!=idx) tem.push(this.imgList[i]);
        this.imgList = tem;

      },
      getAvatarView(){
        return this.url.imgerver +"/"+ this.model.imgUrl;
      },

      add (novelId) {
        this.novelId = novelId;
        this.getLastSort(novelId);

      },
      showErrorMsg(){
        this.$message.warning("该图片未上传，不能预览，请先保存");
      },
      edit (record,sort) {
        if(record.viewModel) this.viewModel = record.viewModel
        this.form.resetFields();
        this.model = Object.assign({}, record);

        if(!this.model.comicId)this.model.comicId = this.novelId;
        if(record.needGold) this.needGold = record.needGold
        if(sort || sort ==0) this.model.sort = sort;

        this.visible = true;
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'chapterName','golds','sort'))
        })

        if(record.content) {
          this.confirmLoading = true;
            let imgJson = JSON.parse(record.content);
            for(let i in imgJson){

              if(imgJson[i]){

                let s = imgJson[i].url.split(".")
                if(s[s.length-1] == "data"){
                  this.parseImg(imgJson[i]);

                }else{
                  this.imgList.push({"file":"","imgUrl": imgJson[i].url,"sort":imgJson[i].sort});
                }

              }


            }
            let t = this;
            timer = setInterval(()=>{

              if(t.imgList.length >= imgJson.length){

                this.confirmLoading = false;
                t.imgList.sort(function(a,b) {

                  var an = a.sort
                  var bn = b.sort
                  return an - bn;
                });

                clearInterval(timer)
              }
            },200)

        }

      },

       parseImg(imgObj){
        let t = this;
        if(imgObj.url.indexOf("blob:")>=0) {
          t.imgList.push({"file":"","blobUrl": imgObj.url,"imgUrl": imgObj.url,"sort":imgObj.sort,"id":imgObj.id});
          return;
        }
        axios({
          url: window._CONFIG['domianURL'] + "/"+imgObj.url,
          method:'get' ,
          responseType: "arraybuffer"
        }).then((res) =>{
          console.log(1)
          var n = new Uint8Array(res);

          var c = new Blob([n.subarray(3,n.length)], {
            type: "image/jpg"
          })
          let r = (window.URL || window.webkitURL).createObjectURL(c);

          t.imgList.push({"file":"","blobUrl": r,"imgUrl": imgObj.url,"sort":imgObj.sort,"id":imgObj.id})
        }).catch(res =>{
          t.imgList.push({"file":"","blobUrl": "error","imgUrl": imgObj.url,"sort":imgObj.sort,"id":imgObj.id})
          console.log(res)
        })
      },
      getLastSort(novelId){
        let that = this;
        this.confirmLoading = true;
        this.visible = true;
        axios({
          url: "/app/appComicChapter/getLastSort",
          data:{comicId:novelId},
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

      close () {
        this.$emit('close');
        this.visible = false;
        this.content ="";
        this.needGold = 1;
        this.imgList =[];
        this.loadEnd = 0;
        if(timer) clearInterval(timer)

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

            formData.content = that.content;
            if(!formData.comicId){
              that.$message.warning("参数出错：comicId为空");
              that.confirmLoading=false;
              return;
            }
            if(!that.model.imgUrl){
              that.$message.warning("请上传封面");
              that.confirmLoading=false;
              return;
            }
            if(that.imgList.length<=0){
              that.$message.warning("请上传内容图片");
              that.confirmLoading=false;
              return;
            }

            console.log("表单提交数据",formData)
            var imgData = new FormData();

            for(let i in that.imgList){
              if(that.imgList[i].file){
                imgData.append("files",that.imgList[i].file);

              }

            }

            axios({
              url: "/app/appComicChapter/uploadFile",
              method:'post' ,
              data:imgData,

            }).then((res) =>{
               if(res.code==0){
                 let imgJson = [];

                 for(let i in that.imgList){
                   let file = that.imgList[i].file;
                   if(!file) continue;
                   for(let j in res.result){
                     let fileName = res.result[j].split("/")[2];
                     let strs = fileName.split("_");
                     if(strs.length<3) continue;
                     let s = strs[0] + strs[2];
                     let fs = file.name.split(".");
                     fs[fs.length-1] = ".data";
                     let ds = "";
                     for(let i in fs){
                       ds += fs[i];
                     }

                     if(s == ds){
                       that.imgList[i].file = "";
                       that.imgList[i].imgUrl = res.result[j];
                       break;
                     }
                   }
                 }

                 for(let i in that.imgList){

                   imgJson.push({sort:i,url:that.imgList[i].imgUrl,"id":that.imgList[i].id?that.imgList[i].id:new Date().getTime()})
                 }

                  console.log(imgJson)

                 formData.content = JSON.stringify(imgJson);
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
               }else{
                 that.$message.warning(res.message);
                 that.confirmLoading = false;
               }

            }).catch((res)=>{
              console.log(res)
              that.$message.warning("文件上传错误");
              that.confirmLoading = false;
            })



          }
         
        })
      },


      handleCancel () {
        this.close()
      },
      beforeUpload: function(file){
        var fileType = file.type;
        if(fileType.indexOf('image')<0){
          this.$message.warning('请上传图片');
          return false;
        }

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
            this.model.imgUrl="";
            this.model.imgUrl = response.message;

            this.picUrl = "Has no pic url yet";
          }else{
            this.$message.warning(response.message);
          }
        }
      },

      beforeUpload2: function(file){
        let t = this;
        if(file.name.indexOf("_")>=0){
          this.$message.warning('文件名不能带有下划线');
          return false;
        }

        var fileType = file.type;
        if(fileType.indexOf('image')<0){
          this.$message.warning('请上传图片');
          return false;
        }

        let reader = new FileReader();
        if(!window.FileReader){
          this.$message.warning('当前浏览不支持预览模式上传图片');
          return false;
        }

        reader.readAsDataURL(file)

        reader.onload = e => {

           t.imgList.push({"file":file,"imgUrl":e.target.result,"name":file.name})

           t.imgList.sort(function(a,b) {
            if(!a.name || !b.name) return 0;
            var an = a.name.replace(/[^0-9]/ig,"");
            var bn = b.name.replace(/[^0-9]/ig,"");
            return an - bn;
          });
        }


      },


      popupCallback(row){
        this.form.setFieldsValue(pick(row,'chapterName','golds','sort'))
      }
      
    }
  }
</script>
<style >

  .img_list{
    border: 1px solid #D9D9D9;
    border-radius: 4px;
    padding: 20px ;

  }
  .i_list_item{
    width: 106px;
    height: 104px;
    vertical-align:top;
    display: inline-block;
    margin-right: 11px;
    margin-bottom: 15px;
    text-align: center;
    overflow: hidden;
    position: relative;
    opacity: 0.9;
    cursor: pointer;
  }
  .i_list_item:hover{
    opacity: 1;
  }
  .i_list_item:nth-child(4n){
    margin-right: 0;
  }
  .i_list_item img{
    width: 100%;

  }
  .del-btn{
    height: 18px;
    line-height: 18px;
    background: #E74343;
    width: 40%;
    text-align: center;
    color: white;
    opacity: 0.8;
    position: absolute;
    bottom: 0;
    right: 0;
    font-size: 11px;
    cursor: pointer;
  }
  .del-btn:hover{
    opacity: 1;
    background: #CD3A3A;
  }
  .m-left,.m-right{
    height: 100%;
    line-height: 104px;
    font-size: 25px;
    color: white;
    text-shadow: 3px 3px 6px #555;
    position: absolute;
    bottom: 0;
    left: 0;
  }
  .m-right{
    left: auto;
    right: 0;
  }
  .m-left:hover{
     color: #F34949;
   }
  .m-right:hover{
    color: #F34949;
  }
</style>