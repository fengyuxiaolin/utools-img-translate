<script setup>
import { ref, onMounted, watch } from 'vue';
import { Picture as IconPicture, Setting as IconSetting, Scissor as IconScissor } from '@element-plus/icons-vue';
defineEmits(['changePage']);

let img = '';
const originSrc = ref(''),
  targetSrc = ref(''),
  srcList = ref([]),
  targetText = ref(''),
  targetShow = ref('img'),
  sp = ref();

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
  window.transImg(img, (data) => {
    targetText.value = data.text;
    if (data.code != 0) {
      targetShow.value = 'text';
      return;
    }
    const targetImgSrc = `data:image/png;base64,${data.img}`;
    targetSrc.value = targetImgSrc;
    srcList.value[1] = targetImgSrc;
  });
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
    // 将 base64 图片转换为Buffer
    const imgFile = window.baseToBuffer(img);
    sendTrans(imgFile);
  })
}

function pageEnter () {
  const enterCode = window.enterCode;
  if (enterCode === 'screenAndTransl') {
    const gt = setInterval(() => {
      const img = getBaseInput();
      if (img) {
        clearInterval(gt);
      }
    }, 600)
  } else if (enterCode === 'translate') {
    getBaseInput();
  }
}

function openSettingsPage () {
  sp.value.open();
}

onMounted(pageEnter);
</script>

<template>
  <div class="page_translate" @drop="dropImg" @dragover.prevent>
    <div class="upload-demo" @click="selectImg">
      <div class="el-upload__text">
        拖拽图片至此或点击选择图片进行翻译
      </div>
    </div>
    <div class="imgBox">
      <el-image :src="originSrc" :preview-src-list="srcList" fit="scale-down">
        <template #error>
          <div class="image-slot">
            <el-icon>
              <icon-picture />
            </el-icon>
          </div>
        </template>
      </el-image>
      <el-divider direction="vertical" />
      <el-image v-if="targetShow == 'img'" :src="targetSrc" :preview-src-list="srcList" :initial-index="1"
        fit="scale-down">
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
      <div class='settingsBtn' @click="openSettingsPage">
        <el-icon>
          <icon-setting />
        </el-icon>
      </div>
      <div class='scissorBtn' @click="scissorShot">
        <el-icon>
          <icon-scissor />
        </el-icon>
      </div>
      <div v-if="originSrc != ''">
        <el-button v-if="targetShow == 'text'" @click="targetShow = 'img'">
          图片结果
        </el-button>
        <el-button v-if="targetShow == 'img'" @click="targetShow = 'text'">
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
:deep(.el-upload__text) {
  text-align: center;
  line-height: 80px;
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
  height: 340px;
  background: #d9d9d9;
  text-align: center;
  line-height: 340px;
}
.imgBox .text-box {
  display: inline-block;
  position: relative;
  width: 48%;
  max-height: 340px;
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
.imgBox .el-divider {
  margin-top: -340px;
  height: 330px;
}
.footer {
  float: left;
  margin-top: -10px;
  margin-left: 10px;
}

.settingsBtn .el-icon,
.scissorBtn .el-icon {
  font-size: 24px;
}
.settingsBtn :hover,
.scissorBtn :hover {
  cursor: pointer;
  color: #31c2a5;
}
.settingsBtn {
  position: absolute;
  right: 20px;
  bottom: 16px;
}
.scissorBtn {
  position: absolute;
  right: 60px;
  bottom: 16px;
}
</style>
