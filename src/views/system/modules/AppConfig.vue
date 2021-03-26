<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form>
        <a-tabs defaultActiveKey="1">
          <a-tab-pane tab="基本设置" key="1" forceRender>
            <a-form-item label="App名称" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input placeholder="请输入" v-model="obj.appName" style="width: 200px"></a-input>
            </a-form-item>
            <a-form-item label="分享域名" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input placeholder="请输入" v-model="obj.webUrl" style="width: 200px"></a-input>
            </a-form-item>
            <a-form-item label="安卓APP下载地址" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input placeholder="请输入" v-model="obj.appUrl" style="width: 200px"></a-input>
            </a-form-item>
            <a-form-item label="苹果APP下载地址" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input placeholder="请输入" v-model="obj.iosUrl" style="width: 200px"></a-input>
            </a-form-item>

            <a-form-item label="漫画默认金币" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-number placeholder="漫画默认消费金币" v-model="obj.defGolds" style="width: 200px"></a-input-number>
            </a-form-item>



            <a-form-item label="客服链接" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input placeholder="请输入" v-model="obj.kfUrl" style="width: 200px"></a-input>
              <span style="margin-left: 10px">带http或https全称</span>
            </a-form-item>

            <a-form-item label="充值页面说明" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-textarea :rows="5" placeholder="请输入" v-model="obj.payPageNote" style="width: 300px"/>
            </a-form-item>

            <a-form-item label="广告购买页面说明" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-textarea :rows="5" placeholder="请输入" v-model="obj.advPageNote" style="width: 300px"/>
            </a-form-item>

           <a-form-item label="分享内容" :labelCol="labelCol" :wrapperCol="wrapperCol">
             <a-input placeholder="请输入" v-model="obj.shareTxt" style="width: 300px"></a-input>
             <span style="margin-left: 5px">无需输入域名</span>
            </a-form-item>

            <a-form-item label="自动清理" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-select v-model="obj.clearMonth" placeholder="请选择" style="width: 100px">
                <a-select-option :value="item" v-for="(item,idx) in 12" :key="idx">{{item}}个月</a-select-option>
              </a-select>
              <span style="margin-left: 5px">前的统计记录</span>
            </a-form-item>

          <a-form-item label="注册送金币" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input-number placeholder="请输入" v-model="obj.regCoin" style="width: 100px"></a-input-number>
          </a-form-item>


          <a-form-item label="同IP注册数" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input-number placeholder="请输入" v-model="obj.userRegCount" style="width: 100px"></a-input-number>
          </a-form-item>

            <a-form-item label="最低提现金额" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input placeholder="最低提现金额" v-model="obj.cashLower" style="width: 100px"></a-input>

            </a-form-item>

          <a-form-item label="漫画搜索关键字" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input placeholder="请输入" v-model="obj.comicKeys" style="width: 800px"></a-input>
            <span style="margin-left: 10px">多个关键字用,号(半角)分割</span>
          </a-form-item>



          <a-form-item label="静态资源地址" :labelCol="labelCol" :wrapperCol="wrapperCol">
            <a-input placeholder="静态资源地址" v-model="obj.resUrl" style="width: 800px"></a-input>

          </a-form-item>



          </a-tab-pane>

          <a-tab-pane tab="短信设置(云之讯)" key="2" >

            <a-form-item label="短信密钥" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input placeholder="短信密钥" v-model="obj.smsAppKey" style="width: 800px"></a-input>

            </a-form-item>
            <a-form-item label="appId" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input placeholder="appId" v-model="obj.smsAppId" style="width: 800px"></a-input>
            </a-form-item>
            <a-form-item label="sid" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input placeholder="sid" v-model="obj.smsSid" style="width: 800px"></a-input>
            </a-form-item>

            <a-form-item label="短信模板ID" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input placeholder="短信模板ID" v-model="obj.smsTemplateid" style="width: 800px"></a-input>
            </a-form-item>

            <a-form-item label="发送限制" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input-number placeholder="发送限制" v-model="obj.smsSendCount" style="width: 100px"></a-input-number>
              <span style="margin-left: 10px">同手机号每天发送数</span>
            </a-form-item>
          </a-tab-pane>

          <a-tab-pane tab="支付设置(易支付)" key="3" >
            <a-form-item label="API地址" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input placeholder="请输入" v-model="obj.payApiUrl" style="width: 70%"></a-input>
            </a-form-item>

            <a-form-item label="商户ID" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input placeholder="请输入" v-model="obj.payPid" style="width: 70%"></a-input>
            </a-form-item>

            <a-form-item label="商户密钥" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input placeholder="请输入" v-model="obj.payKey" style="width: 70%"></a-input>
            </a-form-item>


            <a-form-item label="易支付异步通知地址" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input placeholder="请输入" v-model="obj.notifyUrl" style="width: 70%"></a-input>
            </a-form-item>

            <a-form-item label="完成跳转地址" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input placeholder="请输入" v-model="obj.returnUrl" style="width: 70%"></a-input>
            </a-form-item>
          </a-tab-pane>
          <a-tab-pane tab="采集设置(羞羞漫画)" key="4" >
            <a-form-item label="采集域名" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input placeholder="采集域名" v-model="obj.cjUrl" style="width: 800px"></a-input>

            </a-form-item>
            <a-form-item label="采集帐号" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input placeholder="采集帐号" v-model="obj.cjUserName" style="width: 800px"></a-input>

            </a-form-item>
            <a-form-item label="采集密码" :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-input placeholder="采集密码" v-model="obj.cjPwd" style="width: 800px"></a-input>

            </a-form-item>
          </a-tab-pane>


        </a-tabs>
        <a-form-item label="" :labelCol="labelCol" :wrapperCol="wrapperCol">
          <a-button @click="save" type="primary" icon="save">保存</a-button>
        </a-form-item>

      </a-form>
    </div>
  </a-card>
</template>

<script>

  import { axios } from '@/utils/request'
  import SplitPanel from '../../jeecg/SplitPanel'
  import { getAction, putAction } from '@/api/manage'
  import JMultiSelectTag from '@/components/dict/JMultiSelectTag'

  export default {
    name: 'AppConfig',
    components: { SplitPanel, JMultiSelectTag },
    data() {
      return {
        description: '系统设置',
        obj: {
          golds: 0,
          keys: '',
          kfLink: '',
          appName: '',
          smsSid:"",
          smsTemplateid:"",
          smsAppId:"",
        },
        dictOptions: [{
          label: '支付宝',
          value: '1'
        }, {
          label: '微信',
          value: '2'
        }
        ],

        labelCol: {
          xs: { span: 12 },
          sm: { span: 3 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 }
        }
      }
    },
    computed: {
      importExcelUrl: function() {
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
      }
    },
    created() {

      this.loadConfig()
    },
    methods: {
      loadConfig() {
        let that = this
        getAction('/app/appSysConfig/queryById', { id: 1 }).then((res) => {

          if (res.success && res.result) {
            if (res.result.payPageNote)
              res.result.payPageNote = res.result.payPageNote.replace(/<br\/>/g, '\r\n')
            if (res.result.msgBox)
              res.result.msgBox = res.result.msgBox.replace(/<br\/>/g, '\r\n')
            that.obj = res.result
          } else {
            that.$message.warning('配置获取失败')
          }
        })


      },
      save() {
        let that = this
        /*if (!this.obj.payType) {
          that.$message.warning('支付方式请至少选择一项')
          return
        }
        if (this.obj.commission > 100) {
          that.$message.warning('手续费率不能大于100')
          return
        }
        if (this.obj.commission < 0) {
          that.$message.warning('手续费率不能小于0')
          return
        }*/


        putAction('/app/appSysConfig/edit', that.obj).then((res) => {

          if (res.code == 200) {
            that.$message.success('保存成功')
          } else {
            console.log(res)
            that.$message.warning('保存配置失败')
          }
        }).catch(res => {
          that.$message.warning(res.message)
        })
      }

    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>