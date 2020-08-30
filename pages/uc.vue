<template>
  <div>
    <h1>用户中心</h1>
    <div style="margin-bottom: 20px">
      欢迎<b>{{ userinfo && userinfo.email }}</b>
      <n-link to="/">
        去首页
      </n-link>
    </div>
    <div ref="drag" class="file-container">
      <input type="file" @change="handleFileChange">
    </div>
    <el-progress
      :text-inside="true"
      :stroke-width="20"
      :percentage="uploadProgress"
    />
    <el-progress
      :text-inside="true"
      :stroke-width="20"
      :percentage="hashProgress"
    />
    <el-button type="primary" @click="uploadFile">
      上传
    </el-button>
  </div>
</template>

<script>
import SparkMD5 from 'spark-md5'
const CHUNK_SIZE = 0.1 * 1024 * 1024
export default {
  data () {
    return {
      userinfo: null,
      file: null,
      uploadProgress: 0,
      hashProgress: 0
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
          const ret = reader.result
            .split('')
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
    createFileChunks (file, size = CHUNK_SIZE) {
      const chunks = []
      let cur = 0
      while (cur < file.size) {
        chunks.push({ index: cur, file: file.slice(cur, cur + size) })
        cur += size
      }
      return chunks
    },
    async calculateHashWorker (chunks) {
      return await new Promise((resolve, reject) => {
        const worker = new Worker('/hash.js')
        worker.postMessage({ chunks })
        worker.onmessage = (e) => {
          const { progress, hash } = e.data
          this.hashProgress = Number(progress.toFixed(2))
          if (hash) {
            resolve(hash)
          }
        }
      })
    },
    calculateHashIdle (chunks) {
      return new Promise((resolve) => {
        const spark = new SparkMD5()
        let count = 0
        const appendToSpark = (file) => {
          return new Promise((resolve) => {
            const reader = new FileReader()
            reader.readAsArrayBuffer(file)
            reader.onload = (e) => {
              spark.append(e.target.result)
              resolve()
            }
          })
        }
        const workloop = async (deadline) => {
          while (count < chunks.length && deadline.timeRemaining() > 1) {
            await appendToSpark(chunks[count].file)
            count++
            if (count < chunks.length) {
              this.hashProgress = Number(
                ((count / chunks.length) * 100).toFixed(2)
              )
            } else {
              this.hashProgress = 100
              resolve(spark.end())
            }
          }
          window.requestIdleCallback(workloop)
        }
        window.requestIdleCallback(workloop)
      })
    },
    calculateHashSample (file) {
      return new Promise((resolve) => {
        const spark = new SparkMD5.ArrayBuffer()
        const reader = new FileReader()
        const offset = 0.1 * 1024 * 1024
        const chunks = [file.slice(0, offset)]
        const size = file.size
        let cur = offset
        while (cur < size) {
          if (cur + offset === size) {
            chunks.push(cur, cur + offset)
          } else {
            const mid = (cur + offset) / 2
            const end = cur + offset
            chunks.push(cur, cur + 2)
            chunks.push(mid, mid + 2)
            chunks.push(end - 2, end)
          }
          cur += offset
        }
        reader.readAsArrayBuffer(new Blob(chunks))
        reader.onload = (e) => {
          spark.append(e.target.result)
          this.hashProgress = 100
          resolve(spark.end())
        }
      })
    },
    async uploadFile () {
      if (this.file) {
        // if (!await this.isImage(this.file)) {
        //   return
        // }
        // 文件切片
        const chunks = this.createFileChunks(this.file)
        // 计算hash
        const hash = await this.calculateHashWorker(chunks)
        const hash1 = await this.calculateHashIdle(chunks)
        const hash2 = await this.calculateHashSample(this.file)
        const form = new FormData()
        form.append('name', 'file')
        form.append('file', this.file)
        const ret = await this.$http.post('/uploadfile', form, {
          onUploadProgress: (progress) => {
            this.uploadProgress = Number(
              ((progress.loaded / progress.total) * 100).toFixed(2)
            )
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
