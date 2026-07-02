<template>
  <t-divider><t-button @click="displayWordRandom">随机显示单词</t-button></t-divider>
  <t-space direction="vertical" class="t-table-demo__select-without-handler">
    <t-table
        row-key="index"
        :columns="columns"
        :data="data"
        rowKey="id"
        lazy-load
        :size="'small'"
        :pagination="pagination"
    >
    </t-table>
  </t-space>
  <!--  查看详情对话框-->
      <t-drawer :footer="false" closeBtn  :size="'80%'"  v-if="visible" v-model:visible="visible">
        <template #header>单词详情</template>
        <t-collapse :default-value="[0]" v-model="currentItem" expand-mutex @change="handlePanelChange">
          <t-collapse-panel header="单词翻译">
            <t-list :split="true">
              <t-list-item v-for="trans in detail.translations">
                单词词性：{{trans.pos}} ; 中文释义：{{trans["tran_cn"]}}
              </t-list-item>
            </t-list>
          </t-collapse-panel>
          <t-collapse-panel v-if="detail && detail.ukphone || detail && detail.usphone" header="单词发音">
            <t-list :split="true">
              <t-list-item>
                英音音标：{{ detail.ukphone }} ;        <audio controls ref="audioPlayer1"> <source :src="detail.ukspeech" type="audio/mpeg"> </audio>
              </t-list-item>
              <t-list-item>
                美音音标：{{ detail.usphone }} ;        <audio controls ref="audioPlayer2"> <source :src="detail.usspeech" type="audio/mpeg"> </audio>
              </t-list-item>
            </t-list>
          </t-collapse-panel>
          <t-collapse-panel v-if="detail.phrases?.length > 0" header="短语">
            <t-list :split="true">
              <t-list-item v-for="phrase in detail.phrases">
                短语：{{phrase.p_content}} ; 翻译： {{phrase.p_cn}}
              </t-list-item>
            </t-list>
          </t-collapse-panel>
          <t-collapse-panel v-if="detail.relWords?.length > 0" header="同根词">
            <t-list :split="true"v-for="datas in detail.relWords">
              <t-divider>{{datas.Pos}}</t-divider>
              <t-list-item v-for="data in datas.Hwds">
                同根词：{{data.hwd}} ; 翻译： {{data.tran}}
              </t-list-item>
            </t-list>
          </t-collapse-panel>
          <t-collapse-panel v-if="detail.synonyms?.length > 0" header="近义词">
            <t-list :split="true"v-for="datas in detail.synonyms">
              <t-divider>{{"词性: "+datas.pos+" ; 翻译："+datas.tran}}</t-divider>
              <t-list-item v-for="data in datas.Hwds">
                {{data.word}}
              </t-list-item>
            </t-list>
          </t-collapse-panel>
          <t-collapse-panel v-if="detail.sentences?.length > 0" header="例句">
            <t-list :split="true">
              <t-list-item v-for="data in detail.sentences">
                {{data.s_content}} ; {{data.s_cn}}
              </t-list-item>
            </t-list>
          </t-collapse-panel>
        </t-collapse>
      </t-drawer >

</template>
<script lang="jsx" setup>
import {MessagePlugin} from "tdesign-vue-next";
const currentItem = ref(0);
const handlePanelChange = (val) => {
  currentItem.value = val;
}
const GetWordData = () => {
  let words = JSON.parse(window.utools.dbStorage.getItem("wordBook")) || [];
  if (words.length > 0) {
    data.value = words;
    pagination.value.total = words.length;
  } else {
    MessagePlugin.info('暂无数据')
  }
}
const pagination = ref({
  defaultPageSize: 5,
  total: 0,
  defaultCurrent: 1,
});
import {onMounted, ref} from 'vue';
import translate from "./function/trans.js";

const data = ref([]);
const columns = [
  {colKey: 'word', title: '单词', width: '100'},
  {
    title: '翻译',
    width: '100',
    cell: (h, { row }) => {
      return (<span>{row.translations?.[0].tran_cn || '无翻译'}</span>)
    },
  },
  {
    title: '操作',
    width: '100',
    // 注意这种 JSX 写法需设置 <script lang="jsx" setup>
    cell: (h, {row}) => {
      return ([
          <t-button onClick={() => lookDetail(row)} variant="text">
            {"详情"}
          </t-button>,
          <t-popconfirm  content="确认删除吗？" onConfirm={({ e }) => deleteData(row)}><t-button theme="danger"  variant="text">
        {"删除"}
          </t-button></t-popconfirm>,
      ]
      )
    },
  },
];
const visible = ref(false);
const detail = ref({})
const lookDetail = (row) => {
  visible.value = true;
  detail.value = row
}
const deleteData = (row) => {
  let words = JSON.parse(window.utools.dbStorage.getItem("wordBook"))
  words = words.filter(item => item.word!==row.word)
  data.value = words;
  pagination.value.total = data.value.length;
  window.utools.dbStorage.setItem("wordBook", JSON.stringify(words));
}
onMounted(() => {
  GetWordData()
})
// 随机显示单词开始按钮：
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const displayWordRandom = () => {
    const words = JSON.parse(window.utools.dbStorage.getItem("wordBook"))
    if(words.length >= 10){
      window.services.createFloatWindow()
    }else{
      MessagePlugin.info("收藏单词数超过10个即可记忆单词")
    }
}
</script>

<style>
</style>