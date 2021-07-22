import App from './components/App.vue';

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#vue-todo-app',
  template: '<App/>',
  components: { App }
})
