/**
 * 封装的fetch函数，自动添加认证token
 * 用于替代原生fetch，简化API调用
 */

/**
 * 发送带有认证token的请求
 * @param {string} url - 请求URL
 * @param {Object} options - fetch选项
 * @returns {Promise} - fetch响应
 */
export async function fetchWithAuth(url, options = {}) {
  // 获取存储在localStorage中的token
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // 准备请求头
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // 如果有token，添加到Authorization头
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // 合并选项
  const fetchOptions = {
    ...options,
    headers,
  };
  
  // 发送请求
  const response = await fetch(url, fetchOptions);
  
  // 处理401错误（未授权），可能是token过期
  if (response.status === 401) {
    console.warn('认证失败，可能需要重新登录');
    // 如果在浏览器环境，清除token并重定向到登录页
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token'); // 删除失效的token
      window.location.href = '/login'; // 重定向到登录页
    }
  }
  
  return response;
}

/**
 * 发送GET请求
 * @param {string} url - 请求URL
 * @param {Object} options - 额外选项
 * @returns {Promise} - fetch响应
 */
export function get(url, options = {}) {
  return fetchWithAuth(url, {
    method: 'GET',
    ...options,
  });
}

/**
 * 发送POST请求
 * @param {string} url - 请求URL
 * @param {Object} data - 请求体数据
 * @param {Object} options - 额外选项
 * @returns {Promise} - fetch响应
 */
export function post(url, data, options = {}) {
  return fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * 发送PUT请求
 * @param {string} url - 请求URL
 * @param {Object} data - 请求体数据
 * @param {Object} options - 额外选项
 * @returns {Promise} - fetch响应
 */
export function put(url, data, options = {}) {
  return fetchWithAuth(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * 发送DELETE请求
 * @param {string} url - 请求URL
 * @param {Object} options - 额外选项
 * @returns {Promise} - fetch响应
 */
export function del(url, options = {}) {
  return fetchWithAuth(url, {
    method: 'DELETE',
    ...options,
  });
}

/**
 * 发送PATCH请求
 * @param {string} url - 请求URL
 * @param {Object} data - 请求体数据
 * @param {Object} options - 额外选项
 * @returns {Promise} - fetch响应
 */
export function patch(url, data, options = {}) {
  return fetchWithAuth(url, {
    method: 'PATCH',
    body: JSON.stringify(data),
    ...options,
  });
} 