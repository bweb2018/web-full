<template>
  <div>
    <h3>欢迎{{userinfo.email}}归来</h3>
    <n-link to="/">首页</n-link>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userinfo: {}
    };
  },
  async mounted() {
    const ret = await this.$http.get("/user/info");
    if (ret) {
      this.userinfo = ret.data;
    }
  }
};
</script>

<style lang="scss" scoped></style>
