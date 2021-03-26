<template>
  <a-modal
    :title="'推广预览'"
    :width="425"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    :maskClosable="false"
    @cancel="handleCancel"
    cancelspan="关闭">
    <a-spin :spinning="confirmLoading">
      <div class="content" v-if="loadEnd==1">
        <div class="main">
          <div class="c-t">{{objData.link.contentTitle}}</div>
          <div class="c-c mt30" style="margin-top: 15px" v-if="type==1">
            <img :src="url.imgerver + objData.link.imgUrl">
          </div>
          <div class="c-content mt40" style="margin-top: 20px" >
            <div v-for="(item,idx) in objData.chapterList" :key="idx">
              <div class="c-col-t ">
                <div class="c-col-text" style="border-left: 4px solid #F96E57">{{item.chapterName}}</div>
              </div>

              <div class="c-col-txt " >

                <span v-html="item.content" v-if="type==1">
                </span>
                <div class="imgs-list" v-else>
                  <img :src="getImgSrc(item2)" v-for="(item2,idx2) in item.content" :key="idx2"/>
                </div>
              </div>
            </div>
            <div class="c-end mt30" style="margin-top: 15px">
              <span>
                未完待续……
                点击下方【阅读原文】继续阅读哦~~~
              </span>
            </div>
            <div class="c-btn " style="margin-top: 10px">
              阅读原文
            </div>
          </div>
        </div>
      </div>
    </a-spin>


  </a-modal>
</template>

<script>
  let timer;
  import { axios } from '@/utils/request'
  export default {
    name: 'TuiGuanViewModal',
    data(){
      return{
        visible:false,
        confirmLoading:false,
        objData:{},
        loadEnd:0,
        imgs:[],

        type:1,
        url:{
          imgerver: window._CONFIG['domianURL']+"/sys/common/view/",
        },

      }
    },
    methods:{
      getImgSrc(item){
        if(item.blobUrl) return item.blobUrl;
        return this.url.imgerver + item.url;

      },
      handleOk(){
        this.handleCancel()
      },
      handleCancel(){
        this.visible = false;
        this.data = {};
        this.loadEnd = 0;
        if(timer) clearInterval(timer)
      },
      show(data){
        this.visible= true;
        this.initData(data);
        window.scrollTo(0,0);

      },
      initData(data){
        this.type = data.type;

        let that = this;
        this.confirmLoading=true
        axios({
          url: "/app/api/getTuiGuangDataView",
          method:'post' ,
          data:data,
        }).then((res) =>{

          if (res.code==0 && res.success) {

            if(that.type==1){
              that.objData = res.result
              that.loadEnd = 1;
              that.confirmLoading=false

            }else{
              that.objData = res.result
              for(let i in res.result.chapterList){

                if(res.result.chapterList[i].content) {
                  let imgJson = JSON.parse(res.result.chapterList[i].content);
                  let over = 0;

                  for(let j in imgJson){

                    let s = imgJson[j].url.split(".")
                    if(s[s.length-1] == "data"){
                      axios({
                        url: imgJson[j].url,
                        method:'get' ,
                        responseType: "arraybuffer"
                      }).then((res) =>{

                        var n = new Uint8Array(res);

                        var c = new Blob([n.subarray(3,n.length)], {
                          type: "image/jpg"
                        })
                        let r = (window.URL || window.webkitURL).createObjectURL(c);

                        imgJson[j].blobUrl = r;
                        over++;
                      }).catch(res =>{
                        over++;
                        console.log(res)
                      })

                    }else{
                      over++;
                    }
                  }
                  timer = setInterval(()=>{
                    if(over >= imgJson.length){
                      res.result.chapterList[i].content = imgJson;
                      that.loadEnd = 1;
                      that.confirmLoading=false
                    }
                  },200)





                }



              }


            }
            ;

          } else {
            that.$message.warning(res.message?res.message:"预览失败");
          }
        })
      },

    }

  }
</script>

<style scoped>
  div{
    width: 100%;
  }
  span{
    display: inline;
  }
  .modal-div{
    height: 700px;
    width: 100%;

    border: none;
  }

  .content{
    padding: 10px;
    overflow-y: scroll;
    background: #f3f3f3;
    padding-top: 0;
    height: 600px;


  }
  .c-col-text{
    font-size: 17px;
    color: #4a4a4a;
    font-weight: 600;
    padding-left: 6px;
    border-left: 5px  solid #7372F8;
    height: 16px;
    line-height: 16px;
    margin: 15px 0;
  }
  .main{
    background: #fff;
    padding: 0 10px;
    padding-top: 10px;

  }
  .c-t{
    padding-bottom: 10px;
    font-size: 24px;
    font-weight: 400;
    color: #333;
    border-bottom: 1px solid #eee;
    overflow: hidden;
   text-align: center;
  }
  .c-c{
    height: 180px;

  }
  .c-c img{
    height: 100%;
    width: 100%;
  }
  .c-col-txt{
    text-align: justify;
    color: #555;
    line-height: 24px;
    letter-spacing: 1px;
    font-size: 16px;
    padding: 10px;
    border: 1px solid #F96E57;
    position: relative;
  }
  .c-col-txt span{

  }

  .c-end{
    color: #F96E57;
    font-size: 16px;
    font-weight: 600;
  }
  .c-btn{
    height: 40px;
    line-height: 40px;
    font-size: 18px;
    color: #FFFFFF;
    letter-spacing: 0.29px;
    font-weight: 500;
    background: #1AAE8B;
    margin-top: 20px;
    text-align: center;
  }

  .imgs-list img{
    width: 100%;
  }
</style>