// @ts-ignore
/* eslint-disable */
import { request } from 'umi';
const config = require('../../../config.json');

/** Get logged in user's information. GET /user/current */
export async function currentUser(options?: { [key: string]: any }) {
  return { data: options };
}

/** The endpoint for authentication. POST /user/login */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>(`${config.auth.moduleHost}/api`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** The endpoint for logging out. POST /user/logout */
export async function logout(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>('/user/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
