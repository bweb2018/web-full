<template>
  <div>
    <h1>用户中心</h1>
    <div style="margin-bottom: 20px">
      欢迎<b>{{ userinfo && userinfo.email }}</b> <n-link to="/">
        去首页
      </n-link>
    </div>
    <div ref="drag" class="file-container">
      <input type="file" @change="handleFileChange">
    </div>
    <el-progress :text-inside="true" :stroke-width="20" :percentage="uploadProgress" />
    <el-button type="primary" @click="uploadFile">
      上传
    </el-button>
  </div>
</template>

<script>
export default {
  data () {
    return {
      userinfo: null,
      file: null,
      uploadProgress: 0
    }
  },
  async mounted () {
    const ret = await this.$http.get('/user/info')
    if (ret) {
      this.userinfo = ret.data
    }
    this.bindEvents()
  },
  methods: {
    blobToString (blob) {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => {
          const ret = reader.result.split('')
            .map(v => v.charCodeAt())
            .map(v => v.toString(16).toUpperCase())
            .join(' ')
          resolve(ret)
        }
        reader.readAsBinaryString(blob)
      })
    },
    async isPng (file) {
      const ret = await this.blobToString(file.slice(0, 6))
      return ret === '47 49 46 38 39 61' || ret === '47 49 46 38 37 61'
    },
    async isImage (file) {
      const isPng = await this.isPng(file)
      return isPng
    },
    bindEvents () {
      const drag = this.$refs.drag
      drag.addEventListener('dragover', (e) => {
        e.preventDefault()
        drag.style.borderColor = 'red'
      })
      drag.addEventListener('dragleave', (e) => {
        e.preventDefault()
        drag.style.borderColor = '#eee'
      })
      drag.addEventListener('drop', (e) => {
        e.preventDefault()
        drag.style.borderColor = '#eee'
        const list = e.dataTransfer.files
        this.file = list[0]
      })
    },
    async uploadFile () {
      if (this.file) {
        if (!await this.isImage(this.file)) {
          return
        }
        const form = new FormData()
        form.append('name', 'file')
        form.append('file', this.file)
        const ret = await this.$http.post('/uploadfile', form, {
          onUploadProgress: (progress) => {
            this.uploadProgress = Number((progress.loaded / progress.total * 100).toFixed(2))
          }
          // contentType:"application/x-www-form-urlencoded"
        })
        if (ret.code === 0) {
          this.$message({
            message: '恭喜你，上传成功',
            type: 'success'
          })
        }
      } else {
        this.$message.error('未选择图片')
      }
    },
    handleFileChange (e) {
      const [file] = e.target.files
      if (!file) {
        return
      }
      this.file = file
    }
  }

}
</script>

<style lang="stylus">
  .file-container
    height 100px
    border 4px dashed #eee
    text-align center
    line-height 100px
</style>
