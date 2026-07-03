<template>
  <t-space direction="vertical" style="width: 100%">
    <t-space>
      <t-button @click="displayWordRandom">随机显示单词</t-button>
      <t-button @click="exportToPDF">导出为PDF</t-button>
    </t-space>
  </t-space>
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
          <t-collapse-panel header="备注">
            <t-textarea v-model="detail.note" placeholder="添加个性化记忆点..." @blur="saveNote"></t-textarea>
          </t-collapse-panel>
        </t-collapse>
      </t-drawer >
</template>
<script lang="jsx" setup>
import {MessagePlugin} from "tdesign-vue-next";
import {jsPDF} from "jspdf";
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
    title: '备注',
    width: '100',
    cell: (h, { row }) => {
      return (<span>{row.note || '无'}</span>)
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
const saveNote = () => {
  let words = JSON.parse(window.utools.dbStorage.getItem("wordBook")) || []
  const index = words.findIndex(w => w.word === detail.value.word && w.time === detail.value.time)
  if (index !== -1) {
    words[index].note = detail.value.note
    window.utools.dbStorage.setItem("wordBook", JSON.stringify(words))
    MessagePlugin.success("备注已保存")
  }
}
const exportToPDF = () => {
  const words = JSON.parse(window.utools.dbStorage.getItem("wordBook")) || []
  if (words.length === 0) {
    MessagePlugin.info("暂无单词可导出")
    return
  }
  MessagePlugin.info("正在生成PDF...")

  const CW = [30, 130, 280, 160]
  const PAGE_W = 600
  const FONT_SZ = 12
  const LINE_H = 18
  const HEAD_H = 28
  const TITLE_H = 38
  const PAD = 4
  const S = 3
  const MARGIN = 10
  const mmPerPx = 190 / PAGE_W
  const pageMaxY = Math.floor(277 / mmPerPx)

  const tC = document.createElement('canvas')
  tC.width = 1; tC.height = 1
  const tCtx = tC.getContext('2d')
  tCtx.font = `${FONT_SZ}px "Microsoft YaHei","SimSun",sans-serif`

  const wrapText = (text, maxW) => {
    if (!text) return ['']
    const lines = []
    let line = ''
    for (const ch of text) {
      const test = line + ch
      if (tCtx.measureText(test).width > maxW && line) {
        lines.push(line)
        line = ch
      } else {
        line = test
      }
    }
    if (line) lines.push(line)
    return lines.length ? lines : ['']
  }

  const rowMeta = words.map((w, i) => {
    const lines = [
      [String(i + 1)],
      [w.word],
      wrapText(w.translations?.map(t => `${t.pos} ${t.tran_cn}`).join('；') || '', CW[2] - PAD * 2),
      wrapText(w.note || '', CW[3] - PAD * 2)
    ]
    const maxLines = Math.max(...lines.map(l => l.length))
    return { lines, rh: Math.max(LINE_H, maxLines * LINE_H) }
  })

  const drawTitleHeader = (ctx, yStart) => {
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, yStart, PAGE_W, TITLE_H + HEAD_H)
    ctx.font = `bold 18px "Microsoft YaHei","SimSun",sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#333'
    ctx.fillText('单词本', PAGE_W / 2, yStart + 16)

    let y = yStart + TITLE_H
    ctx.font = `bold 13px "Microsoft YaHei","SimSun",sans-serif`
    ctx.fillStyle = '#e8e8e8'
    ctx.fillRect(0, y, PAGE_W, HEAD_H)
    ctx.strokeStyle = '#999'
    ctx.lineWidth = 1
    const headers = ['#', '单词', '翻译', '备注']
    let cx = 0
    headers.forEach((h, i) => {
      ctx.strokeRect(cx, y, CW[i], HEAD_H)
      ctx.textAlign = 'center'
      ctx.fillStyle = '#333'
      ctx.fillText(h, cx + CW[i] / 2, y + HEAD_H / 2)
      cx += CW[i]
    })
  }

  const newPage = (ctx) => {
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, ctx.canvas.width / S, ctx.canvas.height / S)
    drawTitleHeader(ctx, 0)
  }

  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
  let pageIdx = 0
  let globalRowIdx = 0

  while (pageIdx >= 0) {
    const canvas = document.createElement('canvas')
    canvas.width = PAGE_W * S
    canvas.height = pageMaxY * S
    const ctx = canvas.getContext('2d')
    ctx.scale(S, S)
    newPage(ctx)

    let y = TITLE_H + HEAD_H
    while (rowMeta.length > 0) {
      const row = rowMeta[0]
      if (y + row.rh > pageMaxY) break
      rowMeta.shift()

      ctx.fillStyle = globalRowIdx % 2 === 0 ? '#fff' : '#f0f4ff'
      ctx.fillRect(0, y, PAGE_W, row.rh)
      ctx.strokeStyle = '#bbb'
      ctx.lineWidth = 0.5

      ctx.font = `${FONT_SZ}px "Microsoft YaHei","SimSun",sans-serif`
      ctx.textBaseline = 'middle'
      let cx = 0
      for (let j = 0; j < 4; j++) {
        ctx.strokeRect(cx, y, CW[j], row.rh)
        ctx.fillStyle = '#333'
        ctx.textAlign = j < 2 ? 'center' : 'left'
        const lines = row.lines[j]
        const totalTextH = lines.length * LINE_H
        const startY = y + (row.rh - totalTextH) / 2 + LINE_H / 2
        lines.forEach((line, li) => {
          ctx.fillText(line, j < 2 ? cx + CW[j] / 2 : cx + PAD, startY + li * LINE_H)
        })
        cx += CW[j]
      }
      y += row.rh
      globalRowIdx++
    }

    if (pageIdx > 0) doc.addPage()
    doc.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', MARGIN, MARGIN, 190, 277)
    pageIdx++
    if (rowMeta.length === 0) break
  }

  doc.save('单词本.pdf')
  MessagePlugin.success("导出成功")
}
</script>

<style>
</style>