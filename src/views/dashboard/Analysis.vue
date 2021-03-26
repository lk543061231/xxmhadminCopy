<template>
  <div class="page-header-index-wide">
    <a-row :gutter="24">
      <a-col :sm="24" :md="12" :xl="6" :style="{ marginBottom: '24px' }">
        <chart-card :loading="loading" title="今日销售额" :total=" orderCount.moneyToday?'￥' + orderCount.moneyToday:'￥'+0">
          <a-tooltip title="今日销售额" slot="action">
            <a-icon type="info-circle-o" />
          </a-tooltip>
          <div>

            <span slot="term">本周销售</span>
            {{orderCount.moneyWeek?'￥' +orderCount.moneyWeek.toFixed(2):'￥' +0}}
          </div>
          <template slot="footer">本月销售<span>{{orderCount.moneyMonth?'￥' + orderCount.moneyMonth.toFixed(2):'￥'+0}}</span></template>
        </chart-card>
      </a-col>
      <a-col :sm="24" :md="12" :xl="6" :style="{ marginBottom: '24px' }">
        <chart-card :loading="loading" title="漫画总数" :total="comicCount.comicTotal? comicCount.comicTotal +'本':'0'" >
          <a-tooltip title="漫画总数" slot="action" >
            <a-icon type="info-circle-o" />
          </a-tooltip>
          <div>
            <trend flag="up" style="margin-right: 16px;">
              <span slot="term">章节总数</span>
              {{comicCount.comicChapterTotal?comicCount.comicChapterTotal:0}}
            </trend>
          </div>
          <template slot="footer">今日新增<span> {{comicCount.comicToday?comicCount.comicToday:0}} 本</span></template>
        </chart-card>
      </a-col>


      <a-col :sm="24" :md="12" :xl="6" :style="{ marginBottom: '24px' }">
        <chart-card :loading="loading" title="用户数" :total="userCount.userTotal? userCount.userTotal +'人':'0'">
          <a-tooltip title="新增用户数" slot="action">
            <a-icon type="info-circle-o" />
          </a-tooltip>
          <div>

            <trend flag="up" style="margin-right: 16px;">
              <span slot="term">已开通VIP</span>
              {{userCount.vipCount?userCount.vipCount:0}} 人
            </trend>
          </div>
          <template slot="footer">今日新增<span> {{userCount.userlToday?userCount.userlToday:0}}</span></template>
        </chart-card>
      </a-col>
      <a-col :sm="24" :md="12" :xl="6" :style="{ marginBottom: '24px' }">
        <chart-card :loading="loading" title="今日支付笔数" :total="orderCount.today?orderCount.today + '笔':'0笔'">
          <a-tooltip title="今日支付笔数" slot="action">
            <a-icon type="info-circle-o" />
          </a-tooltip>
          <div>
            <trend flag="" style="margin-right: 5%;">
              <span slot="term">普通商品</span>
              {{orderCount.type1?orderCount.type1 + '':'0'}}笔，
            </trend>
            <trend flag="" style="margin-right: 5%;">
              <span slot="term">VIP</span>
              {{orderCount.type2?orderCount.type2 + '':'0'}}笔，
            </trend>
            <trend flag="" style="margin-right: 5%;">
              <span slot="term">代理开通</span>
              {{orderCount.type3?orderCount.type3 + '':'0'}}笔，
            </trend>
          </div>
          <template slot="footer">
            失败 <span style="margin-right: 20px">{{orderCount.fail?orderCount.fail + '':'0'}} 笔</span>
            成功率 <span >{{orderCount.rate?orderCount.rate + '':'0'}} %</span>
          </template>
        </chart-card>
      </a-col>



    </a-row>
    <a-row :gutter="24">


      <a-col :sm="24" :md="12" :xl="6" :style="{ marginBottom: '24px' }">
        <chart-card :loading="loading" title="总结算金额" :total=" settelCount.all?'￥' + settelCount.all:'￥'+0">
          <a-tooltip title="待结算金额" slot="action">
            <a-icon type="info-circle-o" />
          </a-tooltip>
          <div>


          </div>
          <template slot="footer">待结算金额 <span>{{settelCount.wait?'￥' + settelCount.wait:'￥'+0}} </span></template>
        </chart-card>
      </a-col>
    </a-row>

    <a-card :loading="loading" :bordered="false" :body-style="{padding: '0'}">
      <div class="salesCard">
        <a-tabs default-active-key="1" size="large" :tab-bar-style="{marginBottom: '24px', paddingLeft: '16px'}">

          <a-tab-pane loading="true" tab="销售额" key="1">
            <a-row>
              <a-col :xl="24" :lg="24" :md="24" :sm="24" :xs="24">
                <bar title="本月销售统计" :dataSource="barData" :yaxisText="'销售额'" v-if="showBar"/>
              </a-col>

            </a-row>
          </a-tab-pane>

        </a-tabs>
      </div>
    </a-card>

    <a-row>
      <a-col :span="24">
        <a-card :loading="loading" :bordered="false" title="当月访问次数统计" :style="{ marginTop: '24px' }">
          <a-row>
            <a-col :span="8">

            </a-col>
            <a-col :span="6">
              <head-info title="访问总次数" :content="total"></head-info>
            </a-col>
            <a-col :span="2">
              <a-spin class='circle-cust'>
                <a-icon slot="indicator" type="rise" style="font-size: 24px"  />
              </a-spin>
            </a-col>
            <a-col :span="8">

            </a-col>

          </a-row>
          <line-chart-multid :fields="visitFields" :dataSource="visitInfo"></line-chart-multid>
        </a-card>
      </a-col>
    </a-row>

    <a-card :bordered="false">


      <a-table
        rowKey="id"
        size="middle"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="false"
        :loading="tableLoading"
        style="margin-top: 20px;">

        <template slot="param" slot-scope="text, record">
          <a-tag :color="textInfo[record.param].color">{{ text }}</a-tag>
        </template>

        <template slot="text" slot-scope="text, record">
          {{ textInfo[record.param].text }}
        </template>

        <template slot="value" slot-scope="text, record">
          {{ text }} {{ textInfo[record.param].unit }}
        </template>

      </a-table>
    </a-card>
  </div>
</template>

<script>
  import ChartCard from '@/components/ChartCard'
  import ACol from "ant-design-vue/es/grid/Col"
  import ATooltip from "ant-design-vue/es/tooltip/Tooltip"
  import MiniArea from '@/components/chart/MiniArea'
  import MiniBar from '@/components/chart/MiniBar'
  import MiniProgress from '@/components/chart/MiniProgress'
  import RankList from '@/components/chart/RankList'
  import Bar from '@/components/chart/Bar'
  import LineChartMultid from '@/components/chart/LineChartMultid'
  import HeadInfo from '@/components/tools/HeadInfo.vue'
  import moment from 'moment'
  import Trend from '@/components/Trend'
  import { getLoginfo,getVisitInfo } from '@/api/api'
  import { getAction,postAction } from '@/api/manage'

  const rankList = []

  const barData = []

  export default {
    name: "Analysis",
    components: {
      ATooltip,
      ACol,
      ChartCard,
      MiniArea,
      MiniBar,
      MiniProgress,
      RankList,
      Bar,
      Trend,
      LineChartMultid,
      HeadInfo
    },
    data() {
      return {
        loading: true,
        center: null,
        comicCount:{},

        rankList,
        barData,
        loginfo:{},
        total:0,
        visitFields:['访问量'],
        visitInfo:[],
        time: '',
        showBar:false,
        novelCount:{},
        userCount:{},
        orderCount:{},
        qdUserCount:{},

        settelCount:{},
        tableLoading: true,
        columns: [{
          title: '参数',
          width: '30%',
          dataIndex: 'param',
          scopedSlots: { customRender: 'param' }
        }, {
          title: '描述',
          width: '40%',
          dataIndex: 'text',
          scopedSlots: { customRender: 'text' }
        }, {
          title: '当前值',
          width: '30%',
          dataIndex: 'value',
          scopedSlots: { customRender: 'value' }
        }],
        dataSource: [],
        // 列表通过 textInfo 渲染出颜色、描述和单位
        textInfo: {
          'system.cpu.count': { color: 'green', text: 'CPU 数量', unit: '核' },
          'system.cpu.usage': { color: 'green', text: '系统 CPU 使用率', unit: '%' },
          'process.start.time': { color: 'purple', text: '应用启动时间点', unit: '' },
          'process.uptime': { color: 'purple', text: '应用已运行时间', unit: '秒' },
          'process.cpu.usage': { color: 'purple', text: '当前应用 CPU 使用率', unit: '%' }
        },
        // 当一条记录中需要取出多条数据的时候需要配置该字段
        moreInfo: {},

        indicator: <a-icon type="loading" style="font-size: 24px" spin />

      }
    },
    mounted() {
      this.loadTomcatInfo()
    },
    created() {
      setTimeout(() => {
        this.loading = !this.loading
      }, 1000)
      this.initLogInfo();
      this.getNovelCount();
      this.getUserCount();
      this.getOrderCount();
      this.getQdUserCount();
      //this.getDeductCount();
      this.getSettelCount();
      this.getComicCount();

    },
    watch:{
      $route(val){

        if(val && val.name == 'dashboard-analysis'){

          this.initLogInfo();
          this.getNovelCount();
          this.getUserCount();
          this.getOrderCount();
          //this.getQdUserCount();
          this.getDeductCount();
          this.getSettelCount();
          this.getComicCount();
        }
      }
    },
    methods: {
      getSettelCount(){
        postAction("/app/appUserWithdrawalLog/countByWithdrawalLog").then(res=>{

          if(res.code == 0 && res.result){

            this.settelCount = res.result;
          }
        })
      },
      getDeductCount(){
        postAction("app/appLinkLog/totalByIndex").then(res=>{
          if(res.code == 0 && res.result){
            this.deductCount = res.result;
          }
        })
      },

      getQdUserCount(){
        postAction("sys/user/totalByIndex").then(res=>{
          if(res.code == 0 && res.result){
            if(! res.result.c1)res.result.c1 = 0;
            if(! res.result.c2)res.result.c2 = 0;
            res.result.total = res.result.c1 *1 + res.result.c2 *1

            this.qdUserCount = res.result;
          }
        })
      },
      getNovelCount(){
        postAction("app/appNovel/totalByIndex").then(res=>{
            if(res.code == 0 && res.result){

              this.novelCount = res.result;
            }
        })
      },

      getComicCount(){

        postAction("app/appComic/totalByIndex").then(res=>{

          if(res.code == 0 && res.result){

            this.comicCount = res.result;
          }
        })
      },
      getUserCount(){
        postAction("app/appUser/totalByIndex").then(res=>{
          if(res.code == 0 && res.result){

            this.userCount = res.result;
          }
        })
      },
      getOrderCount(){
        postAction("app/appOrder/indexTotal").then(res=>{

          if(res.code == 0 && res.result){

            if(res.result.sumByMonth){
              for (let i in  res.result.sumByMonth){
                let days = res.result.sumByMonth[i].days
                this.barData.push({x:days + "日",y:res.result.sumByMonth[i].money})
              }


            }
            this.orderCount = res.result;
            this.showBar = true


          }
        }).catch(res => {
          console.log(res)

        })
      },

      loadTomcatInfo() {
        this.tableLoading = true;
        Promise.all([
          getAction('actuator/metrics/system.cpu.count'),
          getAction('actuator/metrics/system.cpu.usage'),
          getAction('actuator/metrics/process.start.time'),
          getAction('actuator/metrics/process.uptime'),
          getAction('actuator/metrics/process.cpu.usage')
        ]).then((res) => {
          let info = []
          res.forEach((value, id) => {
            let more = this.moreInfo[value.name]
            if (!(more instanceof Array)) {
              more = ['']
            }
            more.forEach((item, idx) => {
              let param = value.name + item
              let val = value.measurements[idx].value
              if (param === 'system.cpu.usage' || param === 'process.cpu.usage') {
                val = this.convert(val, Number)
              }
              if (param === 'process.start.time') {
                val = this.convert(val, Date)
              }
              info.push({ id: param + id, param, text: 'false value', value: val })
            })
          })
          this.dataSource = info
        }).catch((e) => {
          console.error(e)
          this.$message.error('获取服务器信息失败')
        }).finally(() => {

          this.tableLoading = false;
        })
      },
      convert(value, type) {
        if (type === Number) {
          return Number(value * 100).toFixed(2)
        } else if (type === Date) {
          return moment(value * 1000).format('YYYY-MM-DD HH:mm:ss')
        }
        return value
      },
      initLogInfo () {
        getLoginfo(null).then((res)=>{
          if(res.success){
            /*Object.keys(res.result).forEach(key=>{
              res.result[key] =res.result[key]+""
            })*/
            if(res.result && res.result.list){
              let list = res.result.list;
              for(let i in list){
                if(!list[i].createTime) continue;
                let s = list[i].createTime.split("-");

                this.visitInfo.push({
                  tian:list[i].createTime,
                  '访问量':list[i].count,
                  type:s[s.length-1] *1 + "号",
                })
              }
            }

            if(res.result.total) this.total = res.result.total +"";
            //this.loginfo = res.result;
          }
        })

      },
    }
  }
</script>

<style lang="scss" scoped>
  .circle-cust{
    position: relative;
    top: 28px;
    left: -100%;
  }
  .extra-wrapper {
    line-height: 55px;
    padding-right: 24px;

    .extra-item {
      display: inline-block;
      margin-right: 24px;

      a {
        margin-left: 24px;
      }
    }
  }

  /* 首页访问量统计 */
  .head-info {
    position: relative;
    text-align: left;
    padding: 0 32px 0 0;
    min-width: 125px;

    &.center {
      text-align: center;
      padding: 0 32px;
    }

    span {
      color: rgba(0, 0, 0, .45);
      display: inline-block;
      font-size: .95rem;
      line-height: 42px;
      margin-bottom: 4px;
    }
    p {
      line-height: 42px;
      margin: 0;
      a {
        font-weight: 600;
        font-size: 1rem;
      }
    }
  }
</style>