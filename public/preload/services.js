const fs = require('node:fs')
const path = require('node:path')

// 通过 window 对象向渲染进程注入 nodejs 能力
window.services = {
  // 读文件
  readFile (file) {
    return fs.readFileSync(file, { encoding: 'utf-8' })
  },
  // 文本写入到下载目录
  writeTextFile (text) {
    const filePath = path.join(window.utools.getPath('downloads'), Date.now().toString() + '.txt')
    fs.writeFileSync(filePath, text, { encoding: 'utf-8' })
    return filePath
  },
  // 图片写入到下载目录
  writeImageFile (base64Url) {
    const matchs = /^data:image\/([a-z]{1,20});base64,/i.exec(base64Url)
    if (!matchs) return
    const filePath = path.join(window.utools.getPath('downloads'), Date.now().toString() + '.' + matchs[1])
    fs.writeFileSync(filePath, base64Url.substring(matchs[0].length), { encoding: 'base64' })
    return filePath
  },
  // 创建悬浮窗口
  createFloatWindow() {
    // 获取屏幕尺寸
    const display = utools.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = display.workAreaSize;
    const windowWidth = 300;
    const windowHeight = 300;
    
    // 计算右下角位置
    const x = screenWidth - windowWidth - 20; // 距离右边20像素
    const y = screenHeight - windowHeight - 40; // 距离底部40像素（留出任务栏空间）
  
    const floatWindow = utools.createBrowserWindow('float.html', {
      width: windowWidth,
      height: windowHeight,
      x: x,
      y: y,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true, // 不在任务栏显示
      show: false, // 初始时不显示窗口
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    }, () => {
      // 页面加载完成后的回调
      floatWindow.show(); // 显示窗口
      floatWindow.setAlwaysOnTop(true, 'screen-saver'); // 设置置顶
    });
  
    return floatWindow;
  }
}
