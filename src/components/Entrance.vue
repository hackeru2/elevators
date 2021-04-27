<template>
  <el-card body-style="padding:8px" class="i-block">
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="Floors">
        <el-input-number
          v-model="formInline.floors"
          placeholder="default 10"
        ></el-input-number>
      </el-form-item>
      <el-form-item label="Elevators">
        <el-input-number v-model="formInline.elevators" placeholder="default 5">
        </el-input-number>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">Start!</el-button>
      </el-form-item>
    </el-form></el-card
  >
</template>

<script>
export default {
  data() {
    return {
      formInline: {
        floors: "",
        elevators: "",
      },
    };
  },
  methods: {
    onSubmit() {
      console.log("submit!");
      this.$emit("submit", this.formInline);
    },
  },
};
</script>



<style>
.demo-form-inline {
}
.i-block {
  display: inline-block;
}
.el-form-item {
  margin-bottom: 5px !important;
}
</style>