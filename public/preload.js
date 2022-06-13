/**
 * @file 基于百度的图片翻译nodeJs Demo，node 8 版本
 */

const fs = require('fs')
const md5 = require('md5')
const path = require('path')
const urllib = require('urllib')

const salt = getRandomInt(1000001, 10000000).toString()
const from = 'auto'
const to = 'zh'
// TODO: 改成自己的APPID
let appid = utools.dbStorage.getItem('appid_baidu') || ''
// TODO: 改成自己的密钥
let sk = utools.dbStorage.getItem('sk_baidu') || ''
window.settingsDb = { appid_baidu: appid, sk_baidu: sk }
const cuid = 'APICUID'
const paste = '1'
const mac = 'mac'
const version = '3'

// 这里使用urllib库作为请求客户端， 你可以使用自己常用的库， 发送的请求符合RFC 1867 规范即可
// https://www.ietf.org/rfc/rfc1867.txt
window.transImg = function (file, cb) {
  const sign = md5(`${appid}${md5(file)}${salt}${cuid}${mac}${sk}`)

  const data = {
    from,
    to,
    appid,
    salt,
    cuid,
    mac,
    version,
    paste,
    sign,
  }
  urllib.request(
    'https://fanyi-api.baidu.com/api/trans/sdk/picture',
    {
      method: 'POST',
      data: data,
      files: {
        image: file,
      },
      contentType: 'multipart/form-data',
      dataType: 'json',
    },
    function (err, data, res) {
      if (data && data.error_code != 0) {
        cb({ code: data.error_code, text: data.error_msg })
        return
      }
      if (err) {
        cb({ code: -1, text: err })
        return
      }
      cb({
        code: data.error_code,
        text: data.data.sumDst,
        img: data.data.pasteImg,
      })
    }
  )
}

// 得到一个两数之间的随机整数
function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min //不含最大值，含最小值
}
// 读取图片文件数据
window.readImgFile = function (path) {
  return fs.readFileSync(path)
}
// 打开文件选择窗口
window.openFileDialog = function () {
  return utools.showOpenDialog({
    title: '选择图片',
  })
}

// 将 base64 编码数据转换为 Buffer 数据
window.baseToBuffer = function (img) {
  return Buffer.from(img.replace(/^data:image\/png;base64,/, ''), 'base64')
}

// 使用 utools 保存数据
window.saveSettingsDb = function (data) {
  data = JSON.parse(JSON.stringify(data))
  Object.keys(data).forEach((key) => {
    utools.dbStorage.setItem(key, data[key])
  })
}

// 使用 utools 复制图片数据
window.copyImg = function (img) {
  return utools.copyImage(baseToBuffer(img))
}

// 使用 utools 将图片保存到本地
window.saveImg = function (img) {
  const path = utools.showSaveDialog({
    title: '保存图片',
    defaultPath: utools.getPath('pictures') + '/' + Date.now() + '.png',
  })
  if (path) {
    fs.writeFileSync(path, baseToBuffer(img))
  }
}

utools.onPluginEnter(({ code, type, payload }) => {
  window.enterCode = code
  if (type === 'img') {
    // 将base64数据传入全局变量
    window.enterImg = payload
  }
  if (code === 'screenAndTransl') {
    // 调用截图功能
    window.utools.screenCapture(function (baseData) {
      // 将base64数据传入全局变量
      window.enterImg = baseData
    })
  }
})
