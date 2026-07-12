const appConfig = {
  getAPIRoot: () => import.meta.env.VITE_API_ROOT || 'http://localhost:5000/api',
  getAppId: () => import.meta.env.VITE_APP_ID || 'STUDENT_MOBILE_APP',
  getTimeout: () => parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  exemptPaths: ['/login', '/login/exchangeAccessToken', '/forgetPassword/sendVerificationCode'],
}

export default appConfig
