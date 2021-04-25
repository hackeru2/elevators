<template>
  <!-- <img src="./assets/logo.png" /> -->
  <!-- <SomeIcon /> -->
  <div>
    <p>Elevator Excersize</p>
    <!-- <p>
      If Element Plus is successfully added to this project, you'll see an
      <code v-text="'<el-button>'"></code>
      below
    </p>
    <el-button type="primary">el-button</el-button> -->
  </div>
  <Layout msg="Welcome to Your Vue.js App" />
</template>

<script>
// import HelloWorld from "./components/HelloWorld.vue";
import Layout from "./components/Layout.vue";
// import SomeIcon from "./assets/SomeIcon";

export default {
  name: "App",
  components: {
    Layout,
    // SomeIcon,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
