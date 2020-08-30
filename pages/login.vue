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
      <el-form-item
        prop="sendemail"
        label="邮箱验证码"
        class="captcha-container"
      >
        <div class="sendemail">
          <el-button type="primary" @click.native.prevent="onSendemail">
            {{
              sendText
            }}
          </el-button>
        </div>
        <el-input
          v-model="form.sendemail"
          placeholder="请输入邮箱验证码"
        />
      </el-form-item>
      <el-form-item prop="passwd" label="密码">
        <el-input
          v-model="form.passwd"
          type="password"
          placeholder="请输入密码"
        />
      </el-form-item>
      <el-form-item label=" ">
        <!-- <button @clikc.prevent></button> -->
        <el-button
          type="primary"
          @click.native.prevent="handleLogin"
        >
          登录
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
        passwd: '123456',
        sendemail: ''
      },
      rules: {
        email: [
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入正确的邮箱' }
        ],
        passwd: { required: true, message: '请输入密码' },
        sendemail: { required: true, message: '请输入邮箱验证码' }
      },
      send: {
        timer: 0
      }
    }
  },
  computed: {
    sendText () {
      return this.send.timer > 0
        ? `${this.send.timer}s后发送`
        : '发\xA0\xA0\xA0送'
    }
  },
  methods: {
    async onSendemail () {
      await this.$http.get('/sendcode?email=' + this.form.email)
      this.send.timer = 10
      this.timer = setInterval(() => {
        this.send.timer -= 1
        if (this.send.timer <= 0) {
          clearInterval(this.timer)
        }
      }, 1000)
    },
    handleLogin () {
      this.$refs.formRef.validate(async (valid) => {
        if (valid) {
          const obj = {
            email: this.form.email,
            passwd: md5(this.form.passwd),
            sendcode: this.form.sendemail
          }
          const res = await this.$http.post('/user/login', obj)
          if (res.code === 0) {
            this.$message({
              message: '恭喜你，登录成功',
              type: 'success'
            })
            setTimeout(() => {
              this.$router.push('/')
            }, 500)
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
