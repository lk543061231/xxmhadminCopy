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
      <a-form :form="form">

        <a-form-item label="用户帐号" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-input  placeholder="多个帐号用 , 号(小写)分割" v-model="userId"></a-input>
        </a-form-item>

        <a-form-item label="充值商品" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-select v-model="itemId" placeholder="请选择" style="width: 60%" v-if="itemList.length>0">
            <a-select-option :value="item.id" v-for="(item,idx) in itemList" :key="idx" v-if="item.itemType!=3">{{item.itemType==1? item.golds + "书币":item.itemType==2?item.name:item.itemTag}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-textarea placeholder="备注" v-model="note"></a-textarea>
        </a-form-item>



      </a-form>




    </a-card>
  </a-modal>
</template>

<script>

  import ATextarea from 'ant-design-vue/es/input/TextArea'
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
    name: "CustomUserPayModal",
    components: { ATextarea },
    data () {
      return {
        form: this.$form.createForm(this),
        description: '用户充值',
        visible:false,
        title:"用户充值",
        confirmLoading: false,
        excelLoading:false,
        viewModel:1,
        itemId:"",
        userId:"",
        note:"",
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
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
          url: "/app/appOrder/batchOrderPay",
          method:'post',
          data:{userId:that.userId,itemId:that.itemId,note:that.note},
        }).then((res) =>{

          if (res.success) {
            that.$message.success("成功处理 " + res.result + "条数据");
            this.userId = "";
            this.note = "";
            this.itemId = "";
            this.$emit('ok');
            this.visible = false;

          } else {
            that.$message.warning(res.message);
          }
        })


      },

      show(record){
        this.visible = true;

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