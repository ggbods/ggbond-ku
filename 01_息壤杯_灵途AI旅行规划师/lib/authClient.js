// 前端认证助手：token 存 localStorage，供登录弹窗 / 表单 / 历史同步使用
const TOKEN_KEY = "lingtu_token_v1";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* 隐私模式静默失败 */
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* 忽略 */
  }
}

export function isLoggedIn() {
  return !!getToken();
}

export function authHeaders() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}
