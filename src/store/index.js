import Vue from 'vue'
import Vuex from 'vuex'

import app from './modules/app'
import user from './modules/user'
import permission from './modules/permission'
import getters from './getters'
import createLogger from 'vuex/dist/logger'
Vue.use(Vuex)
const isProd = process.env.NODE_ENV === 'production'
export default new Vuex.Store({
  modules: {
    app,
    user,
    permission
  },
  state: {},
  mutations: {},
  actions: {},
  getters,
  plugins: isProd ? [] : [createLogger()]
})
