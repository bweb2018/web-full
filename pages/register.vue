<template>
  <div class="login-container">
    <el-form
      ref="formRef"
      :rules="rules"
      :model="form"
      label-width="120px"
      class="login-form"
    >
      <el-form-item prop="email" label="邮箱">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item prop="nickname" label="呢称">
        <el-input v-model="form.nickname" placeholder="请输入昵称" />
      </el-form-item>
      <el-form-item prop="captcha" label="验证码" class="captcha-container">
        <div class="captcha">
          <img :src="code.captcha" @click="resetCaptcha">
        </div>
        <el-input v-model="form.captcha" placeholder="请输入验证码" class="captch-input" />
      </el-form-item>
      <el-form-item prop="passwd" label="密码">
        <el-input v-model="form.passwd" type="password" placeholder="请输入密码" />
      </el-form-item>
      <el-form-item prop="repasswd" label="确认密码">
        <el-input
          v-model="form.repasswd"
          type="password"
          placeholder="请再次输入密码"
        />
      </el-form-item>
      <el-form-item label=" ">
        <!-- <button @clikc.prevent></button> -->
        <el-button type="primary" @click.native.prevent="handleRegister">
          注册
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import md5 from 'md5'
export default {
  layout: 'login',
  data () {
    return {
      form: {
        email: '121881358@qq.com',
        nickname: '蚂蚁',
        passwd: '123456',
        repasswd: '123456',
        captcha: ''
      },
      rules: {
        email: [
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入正确的邮箱' }
        ],
        nickname: { required: true, message: '请输入呢称' },
        captcha: { required: true, message: '请输入验证码' },
        passwd: { required: true, message: '请输入密码' },
        repasswd: [{ required: true, message: '请再次输入密码' },
          {
            validator: (rule, value, callback) => {
              if (value !== this.form.passwd) {
                callback(new Error('输入两次密码不一致'))
              }
              callback()
            }
          }
        ]
      },
      code: {
        captcha: '/api/captcha'
      }
    }
  },
  methods: {
    resetCaptcha () {
      this.code.captcha = '/api/captcha?_t=' + new Date().getTime()
    },
    handleRegister () {
      this.$refs.formRef.validate(async (valid) => {
        if (valid) {
          const obj = {
            email: this.form.email,
            captcha: this.form.captcha,
            nickname: this.form.nickname,
            passwd: md5(this.form.passwd)
          }
          const res = await this.$http.post('/user/register', obj)
          if (res.code === 0) {
            this.$alert('注册成功', '成功', {
              confirmButtonText: '去登录',
              callback: () => {
                this.$router.push('/login')
              }
            })
          } else {
            this.$message.error(res.message)
          }
        } else {
          this.$alert('校验失败')
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped></style>
