<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :md="4" :sm="8" >
            <a-form-item label="订单号">
              <a-input placeholder="请输入订单号" v-model="queryParam.orderNum"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="8">
            <a-form-item label="用户帐号">
              <a-input placeholder="请输入用户帐号" v-model="queryParam.userAccout"></a-input>
            </a-form-item>
          </a-col>
          <a-col :md="4" :sm="6">
            <a-form-item label="支付方式">
              <a-select v-model="queryParam.type" placeholder="请选择">
                <a-select-option :value="'1'">支付宝</a-select-option>
                <a-select-option :value="'2'">微信</a-select-option>
                <a-select-option :value="'3'">后台充值</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="3" :sm="4">
            <a-form-item label="状态">
              <a-select v-model="queryParam.orderState" placeholder="请选择">
                <a-select-option value="0">未支付</a-select-option>
                <a-select-option value="1">已支付</a-select-option>

              </a-select>
            </a-form-item>
          </a-col>

          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="8">
              <a-form-item label="日期" >
                <j-date v-model="queryParam.createTime_begin"  date-format="YYYY-MM-DD " style="width:45%" placeholder="请选择开始时间" ></j-date>
                <span style="width: 10px;">~</span>
                <j-date v-model="queryParam.createTime_end"  date-format="YYYY-MM-DD " style="width:45%" placeholder="请选择结束时间"></j-date>
              </a-form-item>
            </a-col>
            <a-col :md="4" :sm="6">
            <a-form-item label="三方流水号">
              <a-input placeholder="三方流水号" v-model="queryParam.tradeNo"></a-input>
            </a-form-item>
            </a-col>
          </template>
          <a-col :md="6" :sm="8">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
              <a-button type="primary" @click="showPay" icon="property-safety" style="margin-left: 8px">批量充值</a-button>
               <a @click="handleToggleSearch" style="margin-left: 8px">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'"/>
              </a>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->
    
    <!-- 操作按钮区域 -->
    <div class="table-operator">

    </div>

    <!-- table区域-begin -->
    <div>


      <a-table
        ref="table"
        size="middle"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"

        @change="handleTableChange">
        
        <template slot="imgSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无此图片</span>
          <img v-else :src="getImgView(text)" height="25px" alt="图片不存在" style="max-width:80px;font-size: 12px;font-style: italic;"/>
        </template>
        <template slot="fileSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无此文件</span>
          <a-button
            v-else
            :ghost="true"
            type="primary"
            icon="download"
            size="small"
            @click="uploadFile(text)">
            下载
          </a-button>
        </template>

        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>

          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>

              </a-menu-item>
              <a-menu-item v-if="record.status==1">
                                                           <a-popconfirm title="确定冻结吗?" @confirm="() => handleFrozen(record.id,2)">
                                                             <a>冻结</a>
                                                           </a-popconfirm>
                                                         </a-menu-item>

                                                         <a-menu-item v-if="record.status==2">
                                                           <a-popconfirm title="确定解冻吗?" @confirm="() => handleFrozen(record.id,1)">
                                                             <a>解冻</a>
                                                           </a-popconfirm>
                                                         </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>

    <appOrder-modal ref="modalForm" @ok="modalFormOk"></appOrder-modal>
    <custom-user-pay-modal ref="modalForm2" @ok="modalFormOk"></custom-user-pay-modal>
  </a-card>
</template>

<script>

  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import AppOrderModal from './modules/AppOrderModal'
  import { axios } from '@/utils/request'
  import JDate from '@/components/jeecg/JDate'
  import CustomUserPayModal from './modules/CustomUserPayModal'

  export default {
    name: "AppOrderList",
    mixins:[JeecgListMixin],
    components: {
      AppOrderModal,
      CustomUserPayModal,
      JDate
    },
    data () {
      return {
        description: '订单管理管理页面',
        // 表头
        columns: [

          {
            title:'订单号',
            align:"center",
            dataIndex: 'orderNum'
          },
          {
            title:'三方流水号',
            align:"center",
            dataIndex: 'tradeNo'
          },

          {
            title:'商品名称',
            align:"center",
            dataIndex: 'itemName'
          },
          {
            title:'用户帐号',
            align:"center",
            dataIndex: 'userAccout'
          },
          {
            title:'订单状态',
            align:"center",
            dataIndex: 'orderState',
            sorter:true,
            customRender:function (t,r,index) {
              return t==0?"未支付" : t==1?"已支付":"支付错误"
            }
          },
          {
            title:'支付金额',
            align:"center",
            dataIndex: 'money',
            sorter:true
          },


          {
            title:'支付方式',
            align:"center",
            dataIndex: 'type',
            sorter:true,
            customRender:function (t,r,index) {
              return t=="1"?"支付宝" : t=="1"?"微信":"后台充值"
            }
          },
          {
            title:'完成交易时间',
            align:"center",
            dataIndex: 'payTime',
            sorter:true
          },

          {
            title:'建立时间',
            align:"center",
            dataIndex: 'createTime'
          },
          {
            title:'备注',
            align:"center",
            dataIndex: 'errorMessage'
          },



        ],
        url: {
          list: "/app/appOrder/list",
          delete: "/app/appOrder/delete",
          deleteBatch: "/app/appOrder/deleteBatch",
          exportXlsUrl: "/app/appOrder/exportXls",
          importExcelUrl: "app/appOrder/importExcel",
        },
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
      showPay(){
        this.$refs.modalForm2.show();
      },
        batchFrozen: function (status) {
                        if (this.selectedRowKeys.length <= 0) {
                          this.$message.warning('请选择一条记录！');
                          return false;
                        } else {
                          let ids = "";
                          let that = this;
                          that.selectedRowKeys.forEach(function (val) {
                            ids += val + ",";
                          });
                          that.$confirm({
                            title: "确认操作",
                            content: "是否" + (status == 1 ? "解冻" : "冻结") + "选中数据?",
                            onOk: function () {
                              that.changeState(ids,status);
                            }
                          });
                        }
                      },
          handleFrozen: function (id, status) {
                         this.changeState(id,status);
                       },
       changeState(ids,status){
                             let that = this;
                             axios({
                               url: "/app/appOrder/changeState",
                               method:'post' ,
                               data: {ids: ids, status: status}
                             }).then((res) =>{
                               if (res.success) {
                                 that.$message.success(res.message);
                                 that.loadData();
                                 that.onClearSelected();
                               } else {
                                 that.$message.warning(res.message);
                               }
                             })
                           },
      initDictConfig(){
      }
       
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>