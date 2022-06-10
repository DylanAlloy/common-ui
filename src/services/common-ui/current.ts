// @ts-ignore
/* eslint-disable */
import { request } from 'umi';

/** Get logged in user's information. GET /user/current */
export async function currentUser(options?: { [key: string]: any }) {
  return request<API.CurrentUser>('/user/current', {
    method: 'GET',
    ...(options || {}),
  });
}
