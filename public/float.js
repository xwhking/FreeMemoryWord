// 获取并显示存储的数据
function displayStoredData() {
    const dataList = document.getElementById('dataList');
    if (!dataList) return;
    // 获取所有存储的数据
    const allData = JSON.parse(utools.dbStorage.getItem("wordBook"));
    // 清空现有内容
    dataList.innerHTML = JSON.stringify(allData[0]);
}

// 页面加载完成后显示数据
document.addEventListener('DOMContentLoaded', () => {
    displayStoredData();
});

// 监听窗口关闭事件
window.addEventListener('beforeunload', () => {
    if (window.close) {
        window.close();
    }
});