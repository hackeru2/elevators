<template>
  <div>
    <p>Elevator Excersize</p>
  </div>
  <transition name="el-fade-in" mode="out-in">
    <Entrance v-if="!form" @submit="(f) => (form = f)" />
    <Layout :form="form" v-else @reset="form = ''" />
  </transition>
</template>

<script>
import Layout from "./components/Layout";
import Entrance from "./components/Entrance";

export default {
  name: "App",
  data() {
    return {
      form: "",
    };
  },
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
  padding: 20px;
  min-height: 80vh;
  background-color: lightgray;
}
p {
  font-weight: 700;
}
</style>
