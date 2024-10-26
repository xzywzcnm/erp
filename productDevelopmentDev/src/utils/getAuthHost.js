import { envObj, envConstant, appointTestHost, appointDevHost } from '../envConfig/evnConfig';
import { appointEnv } from '../envConfig/envVariableVal';

export const getEnv = () => {
  const location = window.location;
  if (process.env.NODE_ENV === 'development') {
    return appointEnv || 'dev';
  }
  if (appointDevHost.includes(location.host)) {
    return 'dev';
  }
  if (appointTestHost.includes(location.host) || location.port) {
    return 'test';
  }
  return 'prod';
}
const nowEnv = getEnv();
// 返回对应环境设置的 host
export const getEnvHost = () => {
  let newEnv = {};
  Object.keys(envObj[nowEnv]).forEach(key => {
    newEnv[key] = `${window.location.protocol}//${envObj[nowEnv][key]}`;
  })
  return newEnv;
}

// 返回对应环境设置的常量
export const getEnvConstant = () => {
  return envConstant[nowEnv];
}
