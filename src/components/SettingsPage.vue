<script setup>
const pageData = ref({
  open: false,
  formData: {
    appid_baidu: window.settingsDb.appid_baidu,
    sk_baidu: window.settingsDb.sk_baidu
  }
})
function open () {
  pageData.value.open = true;
}
function saveSettings () {
  window.saveSettingsDb(pageData.value.formData);
  pageData.value.open = false;
}
defineExpose({ open });
</script>
<template>
  <el-dialog v-model="pageData.open" title="设置" width="30%" draggable>
    <el-form :model="pageData.formData">
      <el-form-item label="百度appid">
        <el-input v-model="pageData.formData.appid_baidu" autocomplete="off" />
      </el-form-item>
      <el-form-item label="百度密钥">
        <el-input v-model="pageData.formData.sk_baidu" type="password" autocomplete="off" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="pageData.open = false">取消</el-button>
        <el-button type="primary" @click="saveSettings">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<style scoped>
</style>