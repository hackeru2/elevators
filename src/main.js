import { createApp } from 'vue'
import App from './App.vue'
import installElementPlus from './plugins/element'

const app = createApp(App)
app.config.devtools = true

console.log(app.config)
installElementPlus(app)
app.mount('#app')

