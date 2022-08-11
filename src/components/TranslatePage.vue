<script setup>
import { Picture as IconPicture, Setting as IconSetting, Scissor as IconScissor, Right as IconRight, Refresh as IconRefresh } from '@element-plus/icons-vue';
defineEmits(['changePage']);

let img = '';
const originSrc = ref(''), // 原图
  loading = ref(false), // 加载中
  targetSrc = ref(''), // 翻译图
  srcList = ref([]), // 图片列表(原图、翻译图)
  targetText = ref(''), // 翻译结果(文本)
  targetShow = ref('img'), // 选择结果展示图片还是文字
  fromLang = ref('auto'), // 源语言
  toLang = ref('zh'), // 目标语言
  langSelectList = ref([]), // 语言选择列表
  sp = ref() // 设置页;

// 获取拖拽的图片
function dropImg (e) {
  let file = e.dataTransfer.files[0]
  img = readImgFile(file.path);
  originSrc.value = file.path;
  srcList.value[0] = file.path;
  sendTrans(img);
}

function selectImg () {
  // 选择图片
  let path = window.openFileDialog()[0];
  img = readImgFile(path);
  originSrc.value = path;
  srcList.value[0] = path;
  sendTrans(img);
}

// 发送翻译请求
function sendTrans (img) {
  if (!img || !(window.isBuffer(img))) {
    targetText.value = '请提供图片';
    targetShow.value = 'text';
    return;
  }
  loading.value = true;
  window.transImg(img, (data) => {
    targetText.value = data.text;
    if (data.code != 0) {
      targetShow.value = 'text';
      return;
    }
    const targetImgSrc = `data:image/png;base64,${data.img}`;
    loading.value = false;
    targetSrc.value = targetImgSrc;
    srcList.value[1] = targetImgSrc;
    setTimeout(() => {
      imgAutoHeight();
    });
  }, { from: fromLang.value, to: toLang.value });
}

// 获取传入的 Base64 数据
function getBaseInput () {
  const img = window.enterImg;
  if (img) {
    originSrc.value = img;
    srcList.value[0] = img;
    // 将 base64 图片转换为Buffer
    const imgFile = window.baseToBuffer(img);
    sendTrans(imgFile);
  }
  return img;
}

// 打开翻译的文本结果
function openTextBox () {
  targetShow.value = 'text';
  setTimeout(() => {
    imgAutoHeight();
  });
}

// 复制翻译得到的图片结果
function copyTargetImg () {
  window.copyImg(targetSrc.value);
  window.utools.outPlugin();
}

// 将翻译得到的图片结果保存为文件
function saveTargetImg () {
  window.saveImg(targetSrc.value);
  window.utools.hideMainWindow();
  window.utools.outPlugin();
}

// 点击截图按钮
function scissorShot () {
  window.utools.screenCapture((img) => {
    originSrc.value = img;
    srcList.value[0] = img;
    window.enterCode = "translate";
    window.enterImg = '';
    // 将 base64 图片转换为Buffer
    const imgFile = window.baseToBuffer(img);
    sendTrans(imgFile);
    if (!window.isDetach) {
      window.utools.redirect('图片翻译');
    }
  })
}

// 重新翻译
function translateRefresh () {
  if (originSrc.value) {
    img = window.baseToBuffer(originSrc.value);
    sendTrans(img);
  }
}

// 初始化语言选择列表
function initLangSelectList () {
  langSelectList.value = [
    {
      value: 'auto',
      label: '自动检测'
    }, {
      value: 'zh',
      label: '中文'
    }, {
      value: 'en',
      label: '英语'
    }, {
      value: 'jp',
      label: '日语'
    }, {
      value: 'kor',
      label: '韩语'
    }, {
      value: 'fra',
      label: '法语'
    }, {
      value: 'spa',
      label: '西班牙语'
    }, {
      value: 'ru',
      label: '俄语'
    }, {
      value: 'pt',
      label: '葡萄牙语'
    }, {
      value: 'de',
      label: '德语'
    }, {
      value: 'it',
      label: '意大利语'
    }, {
      value: 'dan',
      label: '丹麦语'
    }, {
      value: 'nl',
      label: '荷兰语'
    }, {
      value: "may",
      label: "马来语"
    }, {
      value: "swe",
      label: "瑞典语"
    }, {
      value: "id",
      label: "印尼语"
    }, {
      value: "pl",
      label: "波兰语"
    }, {
      value: "rom",
      label: "罗马尼亚语"
    }, {
      value: "tr",
      label: "土耳其语"
    }, {
      value: "el",
      label: "希腊语"
    }, {
      value: "hu",
      label: "匈牙利语"
    }
  ]
}

// img 高度根据窗口高度自适应
function imgAutoHeight () {
  let widowHeight = window.innerHeight;
  const imgHeight = widowHeight - 200;
  console.log('wh: ', widowHeight);

  // 图片高度设置
  const imgBox = document.querySelectorAll('.imgHeight');
  imgBox.forEach((item) => {
    item.style.height = imgHeight + 'px';
    item.style.lineHeight = imgHeight + 'px';
  })

  // 分割线高度设置
  const divider = document.querySelectorAll('.imgBox .el-divider');
  divider.forEach((item) => {
    item.style.marginTop = `-${imgHeight - 6}px`;
    item.style.height = imgHeight - 12 + 'px';
  })

  // 文本高度设置
  const textBox = document.querySelectorAll('.imgBox .text-box');
  textBox.forEach((item) => {
    item.style.maxHeight = imgHeight + 'px';
    item.style.lineHeight = 1.2 + 'rem';
  })
}

function pageEnter () {
  let timer = setInterval(() => {
    const enterCode = window.enterCode;
    if (enterCode) {
      clearInterval(timer);
      if (enterCode === 'screenAndTransl') {
        scissorShot();
      } else if (enterCode === 'translate') {
        getBaseInput();
      }
    }
  }, 600)
}

function openSettingsPage () {
  sp.value.open();
}

onMounted(() => {
  // img 高度根据窗口高度自适应(用 js 做样式是可耻的!!! ...但我不会别的/狗头)
  setTimeout(() => {
    imgAutoHeight();
  })
  window.onresize = imgAutoHeight;

  // 初始化语言选择列表
  initLangSelectList();

  // 插件功能
  pageEnter();
});

window.utools.onPluginEnter((action) => {
  window.pluginEnter(action);
  pageEnter();
})
</script>

<template>
  <div class="page_translate" @drop="dropImg" @dragover.prevent>
    <div class="upload-demo" @click="selectImg">
      <div class="el-upload__text">
        拖拽图片至此或点击选择图片进行翻译
      </div>
    </div>
    <div class="imgBox imgHeight">
      <el-image :src="originSrc" class="imgHeight" :preview-src-list="srcList" fit="scale-down">
        <template #error>
          <div class="image-slot">
            <el-icon>
              <icon-picture />
            </el-icon>
          </div>
        </template>
      </el-image>
      <el-divider direction="vertical" />
      <el-image v-loading="loading" class="imgHeight" v-if="targetShow == 'img'" :src="targetSrc" hide-on-click-modal
        :preview-src-list="srcList" :initial-index="1" fit="contain">
        <template #error>
          <div class="image-slot">
            <el-icon>
              <icon-picture />
            </el-icon>
          </div>
        </template>
      </el-image>
      <div v-else class="text-box" contenteditable>
        {{ targetText }}
      </div>
    </div>
    <el-divider />
    <div class="footer">
      <el-tooltip popper-class="tooltip" :teleported="false" effect="light" content="打开设置" placement="top">
        <div class='settingsBtn' @click="openSettingsPage">
          <el-icon>
            <icon-setting />
          </el-icon>
        </div>
      </el-tooltip>
      <el-tooltip popper-class="tooltip" :teleported="false" effect="light" content="截图并翻译" placement="top">
        <div class='scissorBtn' @click="scissorShot">
          <el-icon>
            <icon-scissor />
          </el-icon>
        </div>
      </el-tooltip>
      <el-tooltip popper-class="tooltip" :teleported="false" effect="light" content="重新翻译" placement="top">
        <div class='transBtn' @click="translateRefresh">
          <el-icon>
            <icon-refresh />
          </el-icon>
        </div>
      </el-tooltip>
      <div class='transLangBox'>
        <el-select v-model="fromLang" class="langSelect" placeholder="源语言" size="small">
          <el-option v-for="item in langSelectList" :key="item.value" :label="item.value" :value="item.value">
            <span style="float: left">{{ item.label }}</span>
            <span style="float: right; color: #6666; font-size: 13px; ">{{ item.value }}</span>
          </el-option>
        </el-select>
        <el-icon class="rightArrow">
          <icon-right />
        </el-icon>
        <el-select v-model="toLang" class="langSelect" placeholder="目标语言" size="small">
          <el-option v-for="item in langSelectList.slice(1)" :key="item.value" :label="item.value" :value="item.value">
            <span style="float: left">{{ item.label }}</span>
            <span style="float: right; color: #6666; font-size: 13px; ">{{ item.value }}</span>
          </el-option>
        </el-select>
      </div>
      <div v-if="originSrc != ''">
        <el-button v-if="targetShow == 'text'" @click="targetShow = 'img'">
          图片结果
        </el-button>
        <el-button v-if="targetShow == 'img'" @click="openTextBox">
          文本结果
        </el-button>
        <el-button v-if="targetShow == 'img'" @click="copyTargetImg">
          复制图片
        </el-button>
        <el-button v-if="targetShow == 'img'" @click="saveTargetImg">
          保存图片
        </el-button>
      </div>
    </div>
  </div>
  <settings-page ref="sp" />
</template>

<style scoped>
.page_translate {
  width: 100%;
  height: 100%;
}
.el-upload__text {
  text-align: center;
  line-height: 80px;
  font-size: 16px;
}
.upload-demo {
  width: 100%;
  height: 80px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
}
.imgBox {
  margin-top: 28px;
  width: 100%;
  height: 340px;
  text-align: center;
}
.imgBox .el-image {
  width: 48%;
  background: #8f8d8d44;
  text-align: center;
  position: relative !important;
}
.imgBox .text-box {
  display: inline-block;
  position: relative;
  width: 48%;
  overflow: scroll;
  text-align: start;
  white-space: pre-wrap;
  outline: none;
}
.imgBox .el-icon {
  width: 60px;
  height: 60px;
  font-size: 36px;
}

.footer {
  float: left;
  margin-top: -10px;
  margin-left: 10px;
}

.settingsBtn .el-icon,
.scissorBtn .el-icon,
.transBtn .el-icon {
  font-size: 24px;
}
.settingsBtn :hover,
.scissorBtn :hover,
.transBtn :hover {
  cursor: pointer;
  color: #31c2a5;
}

.settingsBtn,
.scissorBtn,
.transBtn {
  position: absolute;
  bottom: 16px;
}
.settingsBtn {
  right: 20px;
}
.scissorBtn {
  right: 60px;
}
.transBtn {
  right: 100px;
}

.transLangBox {
  position: absolute;
  right: 142px;
  bottom: 20px;
}
.langSelect {
  width: 38px;
  margin-left: 10px;
}
.langSelect :hover {
  box-shadow: none;
  border: none;
}
.langSelect :deep(.el-input__inner) {
  padding-right: 7px;
  text-align: center;
  box-shadow: none;
}
.langSelect :deep(.el-input__suffix) {
  border: none;
  display: none;
}
.rightArrow {
  vertical-align: middle;
  margin-left: 10px;
}
.el-button {
  background: #f3f4f1dd;
}
:deep(.tooltip) {
  color: #353636;
}
</style>
