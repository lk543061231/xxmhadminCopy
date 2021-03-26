<template>
  <a-modal
    :title="'二维码'"
    :width="400"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    :maskClosable="false"
    @cancel="handleCancel"
    cancelspan="关闭">
    <a-spin :spinning="confirmLoading">
        <div class="main" v-if="linkUrl">
          <img :src="url.imgerver + 'getQRCcode?url=' + linkUrl ">
        </div>
    </a-spin>
  </a-modal>
</template>

<script>
  let Base64 = require('js-base64').Base64;
  export default {
    name: 'SysQrCodeModal',
    data(){
      return{
        visible:false,
        confirmLoading:false,
        objData:{},
        loadEnd:0,
        linkUrl:"",
        url:{
          imgerver: window._CONFIG['domianURL']+"/sys/qrcode/",
        },

      }
    },
    methods:{
      show(url){

        this.visible= true;
        if(!url){
          this.$message.warning("参数出错");
        }else{
          this.linkUrl = Base64.encode(url);
        }


      },
      handleOk(){
        this.handleCancel()
      },
      handleCancel(){
        this.visible = false;
        this.linkUrl = "";

      },
    }
  }
</script>

<style scoped>
    .main{
      width: 300px;
      height: 300px;
      padding: 10px;
      text-align: center;
      line-height: 280px;
      margin: 0 auto;
    }

    .main img{
      width: 100%;
      height: 100%;
    }
</style>