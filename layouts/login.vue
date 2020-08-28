<template>
  <div>
    <div></div>
    <Nuxt></Nuxt>
    <div></div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="stylus">
.login-container
    width 100%
    min-height 100%
    .login-form
        width: 520px
        padding 160px 35px 0
        margin 0 auto
        .captcha-container
            width: 340px
            text-aline: center
            position: relative
            .sendemail
              position absolute
              top 0px
              right -110px
              .el-button
                width 100px
            .captcha
                position absolute
                top: 0px
                right: -110px
                cursor: pointer
</style>
