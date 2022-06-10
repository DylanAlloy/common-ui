import { LikeOutlined, FieldTimeOutlined, KeyOutlined, FileSyncOutlined } from '@ant-design/icons';
import { Avatar, Card, Col, List, Skeleton, Row, Statistic, Badge } from 'antd';
import { useRequest } from 'umi';
import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import styles from './style.less';
import { useModel } from 'umi';
import { fakeChartData } from './service';
const config = require('../../../../config.json');
const PageHeaderContent = ({ currentUser }) => {
  const loading = currentUser && Object.keys(currentUser).length;
  if (!loading) {
    return (
      <Skeleton
        avatar
        paragraph={{
          rows: 1,
        }}
        active
      />
    );
  }

  return (
    <div className={styles.pageHeaderContent}>
      <div className={styles.avatar}>
        <Avatar size="large" src="/defaultavatar.png" />
      </div>
      <div className={styles.content}>
        <div className={styles.contentTitle}>
          Hello, {currentUser.email.split('.')[0]}, it&#39;s time to focus!
        </div>
        <div>{currentUser.isAdmin ? 'You are logged in as an admin' : 'You are logged in'}</div>
      </div>
    </div>
  );
};

const ExtraContent = () => (
  <div className={styles.extraContent}>
    <div className={styles.statItem}>
      <Statistic title="Microservices" value={Object.keys(config.microservices).length} />
    </div>
    <div className={styles.statItem}>
      <Statistic title="Pending Jobs" value={0} />
    </div>
    <div className={styles.statItem}>
      <Statistic title="Log Size" value="2.1 gb" />
    </div>
  </div>
);

const Workplace = ({}) => {
  const { data } = useRequest(fakeChartData);
  const { initialState, loading, error, refresh, setInitialState } = useModel('@@initialState');
  const currentUser = initialState.currentUser;
  const [authHealth, setAuthHealth] = useState({});
  const [dbHealth, setDbHealth] = useState({});
  const healthCheck = () => {
    fetch(`${config.auth.moduleHost}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.isUp) {
          data.isUp['uptime'] = (data.isUp['uptime'] / 60 / 60).toFixed(2);
          setAuthHealth(data);
        }
      })
      .catch((e) => {
        console.log(e);
      });
    fetch(`${config.db.moduleHost}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.isUp) {
          data.isUp['uptime'] = (data.isUp['uptime'] / 60 / 60).toFixed(2);
          setDbHealth(data);
        }
      })
      .catch((e) => {
        console.log(e);
      });
  };
  React.useEffect(() => {
    healthCheck();
  }, []);
  return (
    <PageContainer
      content={<PageHeaderContent currentUser={currentUser} />}
      extraContent={<ExtraContent />}
    >
      <Row gutter={24}>
        <Col xl={16} lg={24} md={24} sm={24} xs={24}>
          <Card
            bodyStyle={{
              paddingTop: 12,
              paddingBottom: 12,
            }}
            bordered={false}
            title={
              authHealth
                ? [<Badge status="success" />, 'Authentication Health']
                : [<Badge status="danger" />, 'Authentication Health']
            }
            loading={authHealth.length}
          >
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Authentication Status"
                  value={authHealth?.isUp?.message}
                  prefix={<LikeOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Authentication Uptime"
                  value={authHealth?.isUp?.uptime + ' hours'}
                  prefix={<FieldTimeOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Authentication Config"
                  value={authHealth?.config?.keys + ' keys discovered'}
                  prefix={<KeyOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Authentication Filesystem"
                  value={authHealth?.config?.status}
                  prefix={<FileSyncOutlined />}
                />
              </Col>
            </Row>
          </Card>

          <Card
            bodyStyle={{
              paddingTop: 12,
              paddingBottom: 12,
            }}
            bordered={false}
            title={
              dbHealth
                ? [<Badge status="success" />, 'Database Health']
                : [<Badge status="danger" />, 'Database Health']
            }
            loading={dbHealth.length}
          >
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Database Status"
                  value={dbHealth?.isUp?.message}
                  prefix={<LikeOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Database Uptime"
                  value={dbHealth?.isUp?.uptime + ' hours'}
                  prefix={<FieldTimeOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Database Config"
                  value={dbHealth?.config?.keys + ' keys discovered'}
                  prefix={<KeyOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Database Filesystem"
                  value={dbHealth?.config?.status}
                  prefix={<FileSyncOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xl={8} lg={24} md={24} sm={24} xs={24}>
          <Badge.Ribbon text={currentUser.groups.length} color="purple">
            <Card
              style={{
                marginBottom: 24,
              }}
              bordered={false}
              title="Groups You Belong To"
              loading={loading}
            >
              <div
                id="scrollableDiv"
                style={{
                  height: 400,
                  overflow: 'auto',
                  padding: '0 16px',
                  border: '1px solid rgba(140, 140, 140, 0.35)',
                }}
              >
                <List
                  size="small"
                  dataSource={currentUser.groups.map((item) => item['cn'])}
                  renderItem={(item) => <List.Item>{item}</List.Item>}
                />
              </div>
            </Card>
          </Badge.Ribbon>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Workplace;
