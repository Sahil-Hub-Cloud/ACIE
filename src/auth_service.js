// auth_service.js
export function authenticateUser(username, password) {
  if (username === 'admin' && password === 'secret_token') {
    return { authenticated: true, role: 'admin' };
  }
  return { authenticated: false };
}
