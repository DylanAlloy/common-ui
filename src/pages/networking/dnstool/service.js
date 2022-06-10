import { request } from 'umi';
const config = require('../../../../config.json');

export async function getPowergslbHealth() {
  return request(`${config.microservices.powergslb.moduleHost}`);
}
export async function getPhpipamHealth() {
  return request(`${config.microservices.phpipam.moduleHost}`);
}
