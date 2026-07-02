<script setup>
import {computed, ref} from "vue";
import Axios from "../requests/axios.js";
import {MessagePlugin} from "tdesign-vue-next";
import translate from "./function/trans.js";
// function getPartOfSpeechMapping(pos, lang) {
//   const mapping = {
//     noun: {eng: "名词", zh: "noun"},
//     verb: {eng: "动词", zh: "verb"},
//     adjective: {eng: "形容词", zh: "adjective"},
//     adverb: {eng: "副词", zh: "adverb"},
//     pronoun: {eng: "代词", zh: "pronoun"},
//     preposition: {eng: "介词", zh: "preposition"},
//     conjunction: {eng: "连词", zh: "conjunction"},
//     interjection: {eng: "感叹词", zh: "interjection"},
//     determiner: {eng: "限定词", zh: "determiner"},
//     article: {eng: "冠词", zh: "article"},
//     numeral: {eng: "数词", zh: "numeral"},
//     unknown:{eng:'未知', zh: 'unknown'},
//   };
//   return mapping[pos]?.[lang] || pos;
// }
const responseData = ref(null)
const word = ref('');
const audioPlayer1 = ref(null)
const audioPlayer2 = ref(null)
// 翻译的临时存储，因为找不到（在词典中），所以直接翻译代替
const standbyTrans = ref('')
const fetchData = async () => {
  word.value = word.value.trim()
  const res = await Axios.get("https://v2.xxapi.cn/api/englishwords?word=" + word.value)
  currentItem.value = 0;
  if (res.code === 200) {
    responseData.value =res.data
    responseData.value['time'] = Date.now()
    if (audioPlayer1.value) {
      audioPlayer1.value.load()
    }
    if (audioPlayer2.value) {
      audioPlayer2.value.load()
    }
    isSearch.value = true;
    console.log(responseData.value)
  } else {
    MessagePlugin.error("请求错误，单词可能不在库中，后续我们会升级！")
    MessagePlugin.info("我们将直接显示意思供您参考！")
    standbyTrans.value = await translate(word.value)
    responseData.value = {
      "translations":[
        {
          "pos":"来自有道翻译",
          "tran_cn":standbyTrans.value,
        }
      ],
      phrases: [],
      relWords:[],
      synonyms:[],
      sentences:[],
      time:Date.now(),
      word:word.value,
    }
    isSearch.value = true;
  }
}
const isSearch = ref(false);
const currentItem = ref(0);
const handlePanelChange = (val) => {
  currentItem.value = val;
}
const saveWordToWordBook = () => {
  if(word.value!==responseData.value.word){
    MessagePlugin.info("请先搜索，再保存")
    return;
  }
  let wordBook = JSON.parse(window.utools.dbStorage.getItem("wordBook")) || [];
  for (let existWord of wordBook) {
    if(existWord.word === word.value) {
      MessagePlugin.info("单词已保存");
      let modifyWord = wordBook.find(w => w.word === word.value);
      modifyWord.time = Date.now();
      wordBook.sort((a, b) => b.time - a.time);
      utools.dbStorage.setItem("wordBook", JSON.stringify(wordBook));
      return;
    }
  }
  wordBook.push(responseData.value);
  wordBook.sort((a, b) => b.time - a.time);
  window.utools.dbStorage.setItem("wordBook", JSON.stringify(wordBook));
  MessagePlugin.success("收藏成功！")
}
const keyDownHandler = () => {
  // console.log("enter")
  fetchData()
}
</script>

<template>
  <t-space direction="horizontal">
    <t-input v-model=word :onEnter="keyDownHandler"></t-input>
    <t-button @click="fetchData">点击查询</t-button>
    <t-button v-if="isSearch" @click="saveWordToWordBook">收藏单词</t-button>
  </t-space>
  <t-divider></t-divider>
  <div id="displayWord" v-if="isSearch">
<!--    todo 制作单词展示卡片-->
  </div>
  <div id="searchResult" v-if="isSearch">
    <t-collapse :default-value="[0]" v-model="currentItem" expand-mutex @change="handlePanelChange">
      <t-collapse-panel header="单词翻译">
        <t-list :split="true">
          <t-list-item v-for="trans in responseData.translations">
            单词词性：{{trans.pos}} ; 中文释义：{{trans["tran_cn"]}}
          </t-list-item>
        </t-list>
      </t-collapse-panel>
      <t-collapse-panel v-if="responseData.ukphone || responseData.usphone" header="单词发音">
        <t-list :split="true">
          <t-list-item>
            英音音标：{{ responseData.ukphone }} ;        <audio controls ref="audioPlayer1"> <source :src="responseData.ukspeech" type="audio/mpeg"> </audio>
          </t-list-item>
          <t-list-item>
            美音音标：{{ responseData.usphone }} ;        <audio controls ref="audioPlayer2"> <source :src="responseData.usspeech" type="audio/mpeg"> </audio>
          </t-list-item>
        </t-list>
      </t-collapse-panel>
      <t-collapse-panel v-if="responseData.phrases?.length > 0" header="短语">
        <t-list :split="true">
          <t-list-item v-for="phrase in responseData.phrases">
            短语：{{phrase.p_content}} ; 翻译： {{phrase.p_cn}}
          </t-list-item>
        </t-list>
      </t-collapse-panel>
      <t-collapse-panel v-if="responseData.relWords?.length > 0" header="同根词">
        <t-list :split="true"v-for="datas in responseData.relWords">
          <t-divider>{{datas.Pos}}</t-divider>
          <t-list-item v-for="data in datas.Hwds">
            同根词：{{data.hwd}} ; 翻译： {{data.tran}}
          </t-list-item>
        </t-list>
      </t-collapse-panel>
      <t-collapse-panel v-if="responseData.synonyms?.length > 0" header="近义词">
        <t-list :split="true"v-for="datas in responseData.synonyms">
          <t-divider>{{"词性: "+datas.pos+" ; 翻译："+datas.tran}}</t-divider>
          <t-list-item v-for="data in datas.Hwds">
           {{data.word}}
          </t-list-item>
        </t-list>
      </t-collapse-panel>
      <t-collapse-panel v-if="responseData.sentences?.length > 0" header="例句">
        <t-list :split="true">
        <t-list-item v-for="data in responseData.sentences">
          {{data.s_content}} ; {{data.s_cn}}
        </t-list-item>
        </t-list>
      </t-collapse-panel>
    </t-collapse>
  </div>
</template>

<style scoped>

</style>