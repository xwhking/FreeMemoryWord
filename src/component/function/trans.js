import CryptoJS from "crypto-js";
import Axios from "../../requests/axios.js";
import {MessagePlugin} from "tdesign-vue-next";

const truncate = (q) => {
    const len = q.length
    return len <= 20 ? q : q.substring(0, 10) + len + q.substring(len - 10, len)
}
const translate = async (sentence) => {
    // 配置参数
    const appKey = '21e8bc446bcf8ba5' // 替换为你的应用ID
    const appSecret = 'KAFTWVPRRlhuoHQ6BvxkcyDV3R2mmo1B' // 替换为你的应用密钥
    const from = 'en'
    const to = 'zh-CHS'
    try {
        const salt = Date.now()
        const curtime = Math.round(Date.now() / 1000)

        // 生成签名
        const signStr = appKey + truncate(sentence) + salt + curtime + appSecret
        const sign = CryptoJS.SHA256(signStr).toString(CryptoJS.enc.Hex)

        // 请求参数
        const params = {
            q: sentence,
            appKey: appKey,
            salt: salt,
            from: from,
            to: to,
            sign: sign,
            signType: "v3",
            curtime: curtime,
        }

        // 发送请求
        const response = await Axios.post(
            'https://openapi.youdao.com/api',
            null, // post 请求体为空
            {
                params, // 参数放在查询字符串
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        )
        console.log(response)
        if (response) {
            console.log(response.translation[0])
            return response.translation[0]
        } else {
            MessagePlugin.error("请求错误"+response)
        }

    } catch (error) {
        console.error('翻译失败:', error)
    }
}
export default translate