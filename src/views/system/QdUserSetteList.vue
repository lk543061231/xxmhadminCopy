<template>
  <a-card :bordered="false">

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @submit.prevent="searchQuery">
        <a-row :gutter="24">

          <a-col :md="6" :sm="8">
            <a-form-item label="账号 / 名称">
              <a-input placeholder="请输入账号 / 名称 / 手机 查询" v-model="queryParam.key"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="8" >
            <a-form-item label="渠道标识">
              <a-select v-model="queryParam.channelId" placeholder="请选择">
                <a-select-option :value="1">一级</a-select-option>
                <a-select-option :value="2">二级</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="8" >
            <a-form-item label="结算方式">
              <a-select v-model="queryParam.settlementType" placeholder="请选择">
                <a-select-option :value="1">支付宝</a-select-option>
                <a-select-option :value="2">银行</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>



          <a-col :md="6" :sm="8">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>

            </span>
          </a-col>

        </a-row>
      </a-form>
    </div>

      <div>

      <a-table
        ref="table"
        bordered
        size="middle"
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"

        @change="handleTableChange">
        <template slot="spanSlot" slot-scope="text">
          <span  style="color: red">￥{{text?text.toFixed(2):0}}</span>

        </template>


        <span slot="action" slot-scope="text, record">

          <a @click="handleAdd(record)" >金额结算</a>

        </span>


      </a-table>
    </div>
    <!-- table区域-end -->

    <sysUserSettleLog-modal ref="modalForm" @ok="modalFormOk"></sysUserSettleLog-modal>

  </a-card>
</template>

<script>
  import SysUserSettleLogModal from './modules/SysUserSettleLogModal'
  import { axios } from '@/utils/request'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import {getAction } from '@/api/manage'

  export default {
    name: "UserList",
    mixins: [JeecgListMixin],
    components: {

      SysUserSettleLogModal,

    },
    data() {
      return {
        description: '渠道商结算管理',
        queryParam: {},
        deductList:[],
        columns: [
          /*{
            title: '#',
            dataIndex: '',
            key:'rowIndex',
            width:60,
            align:"center",
            customRender:function (t,r,index) {
              return parseInt(index)+1;
            }
          },*/
          {
            title: '用户账号',
            align: "center",
            dataIndex: 'username',
            width: 120
          },
          {
            title: '手机号码',
            align: "center",
            width: 110,
            dataIndex: 'phone'
          },
          {
            title: '渠道名称',
            align: "center",
            width: 100,
            dataIndex: 'realname',
          },
          {
            title:'渠道标识',
            align:"center",
            dataIndex: 'channelId',
            sorter:true,
            customRender:function (t,r,index) {
              return t == 1?"一级":t==2?"二级":"未知"
            }
          },
          {
            title:'结算方式',
            align:"center",
            dataIndex: 'settlementType',

            customRender:function (t,r,index) {
              return t == 1?"支付宝":t==2?"银行":"未知"
            }
          },
          {
            title:'结算帐户',
            align:"center",
            dataIndex: 'payAccount',

          },
          {
            title:'收款人姓名',
            align:"center",
            dataIndex: 'payName',

          },
          {
            title:'结算银行',
            align:"center",
            dataIndex: 'bankName',

          },


          {
            title: '余额',
            align: "center",
            width:100,
            dataIndex: 'accountBalance',
            sorter:true,
            customRender:function (t,r,index) {
              return '￥' + t;
            }
          },
          {
            title: '待结算金额',
            align: "center",
            width:110,
            dataIndex: 'money',
            sorter:true,
            scopedSlots: {customRender: "spanSlot"}

          },

          {
            title: '操作',
            dataIndex: 'action',
            scopedSlots: {customRender: 'action'},
            align: "center",
            width: 100
          }

        ],
        url: {
          imgerver: window._CONFIG['domianURL'] + "/sys/common/view",
          syncUser: "/process/extActProcess/doSyncUser",
          list: "/system/sysUserSettleLog/getSettleUserList"
        },
      }
    },
    created(){

    },
    computed: {
      importExcelUrl: function(){
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
      }
    },
    methods: {

      loadData(arg) {

        if(!this.url.list){
          this.$message.error("请设置url.list属性!")
          return
        }

        //加载数据 若传入参数1则加载第一页的内容
        if (arg === 1) {
          this.ipagination.current = 1;
        }
        var params = this.getQueryParams();//查询条件
        this.loading = true;
        getAction(this.url.list, params).then((res) => {
          if (res.success) {

            this.dataSource = res.result.records;

            this.ipagination.total = res.result.total;
          }
          if(res.code===510){
            this.$message.warning(res.message)
          }
          this.loading = false;
        })
      },


      handleAdd: function (record) {

        this.$refs.modalForm.add(record);
        this.$refs.modalForm.title = "渠道结算";
        this.$refs.modalForm.disableSubmit = false;
      },

      modalFormOk(){this.loadData()},

      getAvatarView: function (avatar) {
        return this.url.imgerver + "/" + avatar;
      },


    }

  }
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>