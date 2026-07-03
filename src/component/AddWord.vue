<script setup>
import { reactive } from 'vue';
import {MessagePlugin} from "tdesign-vue-next";

const formData = reactive({
  word: '',
  translations: '',
  note: '',
});
const submitData = ()=>{
  // console.log(formData);
  if(formData.word===''|| formData.translations===''){
    MessagePlugin.error("请输入正确的单词或者翻译")
    return;
  }
  let oneWord = {
    "translations":[
      {
        "pos":"用户自建",
        "tran_cn":formData.translations,
      }
    ],
    phrases: [],
    relWords:[],
    synonyms:[],
    sentences:[],
    note: formData.note,
    time:Date.now(),
    word:formData.word,
  }
  let wordBook = JSON.parse(window.utools.dbStorage.getItem("wordBook")) || [];
  wordBook.push(oneWord);
  wordBook.sort((a, b) => b.time - a.time);
  window.utools.dbStorage.setItem("wordBook", JSON.stringify(wordBook));
  MessagePlugin.success("添加成功！")
  formData.word = '';
  formData.translations = '';
  formData.note = '';
}
</script>

<template>
  <t-form :data="formData" :label-align="'right'" :label-width="60" @submit="submitData">
    <t-form-item label="单词" name="word">
      <t-input v-model="formData.word"></t-input>
    </t-form-item>
    <t-form-item label="翻译" name="translations">
      <t-input v-model="formData.translations"></t-input>
    </t-form-item>
    <t-form-item label="备注" name="note">
      <t-textarea v-model="formData.note" placeholder="添加个性化记忆点..."></t-textarea>
    </t-form-item>
    <t-form-item>
      <t-button theme="primary" type="submit">录入</t-button>
    </t-form-item>
  </t-form>
</template>

<style scoped>

</style>