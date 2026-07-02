<script setup>
import { ref } from 'vue';
import SearchTab from "../component/SearchTab.vue";
import WordTableTab from "../component/WordTableTab.vue";
import AddWord from "../component/AddWord.vue";

const value = ref('first');
const theme = ref('card');

const handlerChange = (newValue) => {
  value.value = newValue;
};
</script>

<template>
  <div class="layout">
    <t-space class="main-space" direction="vertical">
      <div>
        <t-layout>
          <t-content class="content">
            <t-space direction="vertical">
              <t-tabs :value="value" :theme="theme" @change="handlerChange">
                <t-tab-panel class="tab" value="first">
                  <template #label> <t-icon name="home" class="tabs-icon-margin" /> 单词查询 </template>
                  <p style="padding: 25px">
                    <SearchTab></SearchTab>
                  </p>
                </t-tab-panel>
                <t-tab-panel class="tab" value="second" >
                  <template #label> <t-icon name="calendar" class="tabs-icon-margin" /> 单词表 </template>
                  <WordTableTab></WordTableTab>
                </t-tab-panel>
                <t-tab-panel class="tab" value="third" >
                  <template #label> <t-icon name="calendar" class="tabs-icon-margin" /> 添加单词 </template>
                  <AddWord></AddWord>
                </t-tab-panel>
              </t-tabs>
            </t-space>
          </t-content>
          <t-footer class="footer">
            <a href="https://www.github.com/xwhking" target="_blank">©️Created By Xwhking</a> 个人博客：https://blog.csdn.net/Go_ahead_forever
          </t-footer>
        </t-layout>
      </div>
    </t-space>
  </div>
</template>

<style scoped>
*{
  margin: 0;
  padding: 0;
}
.main-space {
  width: 95vw;
  height: 95vh;
}

.tabs-icon-margin {
  margin-right: 4px;
}

.content {
  height: 90vh;
  width: 95vw;
  overflow: auto;
}

.footer {
  height: 5vh;
  text-align: center;
  position: sticky;
}

.tab{
  width: 95vw;
  height: 80vh;
  overflow: auto;
}
.layout{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

}
</style>