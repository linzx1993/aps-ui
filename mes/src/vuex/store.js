/**
 * Created by linzx on 2017/6/22.
 */
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

const store = new Vuex.Store({
  // 定义状态
  state: {
    equipmentValue: ''
  }
});

export default store
