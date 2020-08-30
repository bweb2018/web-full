self.importScripts('spark-md5.min.js')

self.onmessage = (e) => {
  const { chunks } = e.data
  const spark = new self.SparkMD5()
  const reader = new FileReader()
  let count = 0
  let progress = 0
  const loadNext = (index) => {
    reader.readAsArrayBuffer(chunks[index].file)
    reader.onload = (e) => {
      count++
      spark.append(e.target.result)
      if (count === chunks.length) {
        self.postMessage({
          progress: 100,
          hash: spark.end()
        })
        return
      } else {
        progress += 100 / chunks.length
        self.postMessage({
          progress
        })
      }

      loadNext(count)
    }
  }
  loadNext(0)
}
