// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

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
