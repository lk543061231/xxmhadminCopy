<template>
  <a-modal
    :title="title"
    :width="800"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @cancel="handleCancel"
    @ok="handleOk"
    cancelText="关闭">
    <a-card :bordered="false">
      <h3 style="margin-bottom: 20px">请选择充值商品</h3>
      <a-select v-model="itemId" placeholder="请选择" style="width: 60%" v-if="itemList.length>0">
        <a-select-option :value="item.id" v-for="(item,idx) in itemList" :key="idx">{{item.itemType==1? item.golds + "书币":item.itemType==2?item.name:item.itemTag}}</a-select-option>
      </a-select>


    </a-card>
  </a-modal>
</template>

<script>

  function getVipType(type) {
    switch (type){
      case 1 : return "月卡";
      case 2 : return "年卡";
      case 3 : return "日卡";
      case 4 : return "周卡";
      case 5 : return "季卡";
      case 6 : return "半年卡";
      case 7 : return "终身卡";
      default: return "无";
    }
  }

  import { axios } from '@/utils/request'
  import { getAction } from '@/api/manage'

  export default {
    name: "UserPayModal",

    data () {
      return {
        description: '用户充值',
        visible:false,
        title:"用户充值",
        confirmLoading: false,
        excelLoading:false,
        viewModel:1,
        itemId:"",
        userId:"",
        itemList:[],
        url: {

        },
        novelId:"",
        dictOptions:{
        }
      }
    },
    computed: {
      importExcelUrl: function(){
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
      }
    },
    methods: {
      handleCancel(){
        this.visible = false;
        this.userId = "";;
      },

      handleOk(){
        let that  = this;
        if(!this.itemId){
          that.$message.warning("请选择商品");
          return;
        }

        axios({
          url: "/app/appItem/userPay",
          method:'post',
          data:{userId:that.userId,itemId:that.itemId},
        }).then((res) =>{

          if (res.success) {
            that.$message.success("充值成功")
            this.$emit('ok');
            this.visible = false;

          } else {
            that.$message.warning(res.message);
          }
        })


      },

      show(record){
        this.visible = true;
        if(!record.id){
          this.$message.warning("参数出错");
        }
        this.userId = record.id
        this.title = this.title + " " + record.account
        this.getItemList()
      },

      getItemList(){
        let that = this;
        getAction('/app/appItem/list',{pageNo:1,pageSize:999,type:11}).then((res) => {

          if (res.success) {

            let list = res.result.records;
            if(list && list.length>0){
              for(let i in list){
                if(list[i].itemType==2){
                  list[i].name = getVipType(list[i].vipType)

                }
              }
              that.itemList = list;
            }
          } else {
            that.$message.warning('商品列表获取失败')
          }
        })


      },


    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less'

</style>