<template>
  <a-modal
    :title="'图片选择'"
    :width="width"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    :maskClosable="false"
    @cancel="handleCancel"
    cancelText="关闭">
    <a-spin :spinning="confirmLoading"></a-spin>
    <div class="img-item" v-for="(item,idx) in imgList" :idx="idx" @click="selectImg(item.imgUrl)" >
      <img :src="url.imgerver + item.imgUrl"/>
    </div>

  </a-modal>
</template>

<script>
  import { axios } from '@/utils/request'

  export default {
    name: 'SysImgModal',
    data(){
      return{
        width:800,
        visible: false,
        confirmLoading:false,
        url:{
          imgerver: window._CONFIG['domianURL']+"/sys/common/view/",
        },
        imgList:[],
      }
    },
    methods:{
      handleOk(){
        this.$message.warning("请选择一张图片");
      },
      handleCancel(){
        this.visible = false;
      },
      show(){
        this.visible = true
        this.initData();
      },
      selectImg(url){
        this.$emit('ok',url);
        this.visible = false;
      },
      initData(){
        if(this.imgList.length>0) return;
        let that = this;
        this.confirmLoading=true
        axios({
          url: "/app/appImage/listAll",
          method:'post' ,
        }).then((res) =>{
          that.confirmLoading=false
          if (res.code==0 && res.success) {
            that.imgList = res.result;
          } else {
            that.$message.warning("图片列表获取失败");
          }
        })
      }
    }
  }
</script>

<style scoped>
  .img-item{
    width: 30.33%;
    height: 115px;
    margin-right: 4%;
    margin-bottom: 20px;
    display: inline-block;
    cursor: pointer;
  }
  .img-item img{
    width: 100%;
    height: 100%;
  }
  .img-item:nth-child(3n+1){
    margin-right: 0;

  }
</style>