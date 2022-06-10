// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

/** The endpoint for authentication. POST /api/login */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
