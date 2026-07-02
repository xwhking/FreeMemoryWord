// 导入axios库
import axios from 'axios';

// 创建一个新的axios实例
const Axios = axios.create({
    // baseURL: 'https://api.example.com', // 设置基本URL
    timeout: 1000000, // 设置超时时间，单位为毫秒
    headers: {
        'Content-Type': 'application/json', // 设置请求头
    },
});

// 添加请求拦截器
Axios.interceptors.request.use(
    (config) => {
        // 在发送请求之前做些什么，例如添加认证信息
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // 对请求错误做些什么
        return Promise.reject(error);
    }
);

// 添加响应拦截器
Axios.interceptors.response.use(
    (response) => {
        // 对响应数据做些什么，例如处理统一的错误码
        // response.data.code = response.status;
        return response.data;
     },
    (error) => {
        // 检查是否有响应对象
        if (error.response) {
            // 如果有响应，直接返回响应对象
            return Promise.resolve(error.response);  // 返回 response 而不是拒绝
        } else {
            // 如果没有响应（如网络错误等），处理错误
            return Promise.reject(error);
        }
    }
);

// 导出axios实例
export default Axios;