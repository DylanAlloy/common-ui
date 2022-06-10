import { request } from 'umi';
const config = require('../../../../config.json');
export async function queryProjectNotice() {
  return [];
}
export async function queryActivities() {
  return [];
}
export async function fakeChartData() {
  return [];
}
export async function getDbHealth() {
  return request(`${config.db.moduleHost}`);
}
export async function getAuthHealth() {
  return request(`${config.auth.moduleHost}`);
}
