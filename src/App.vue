<template>
  <div>
    <p>Elevator Excersize</p>
  </div>
  <Entrance />
  <Layout msg="Welcome to Your Vue.js App" />
</template>

<script>
import Layout from "./components/Layout";
import Entrance from "./components/Entrance";

export default {
  name: "App",
  components: {
    Entrance,
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
