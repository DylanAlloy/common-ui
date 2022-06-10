import {
  Avatar,
  Card,
  Col,
  Skeleton,
  Row,
  Statistic,
  Badge,
  Table,
  Tag,
  Segmented,
  Button,
  notification,
} from 'antd';
import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import styles from './style.less';
import { useModel, history } from 'umi';
import { SaveOutlined, ArrowUpOutlined, FileDoneOutlined } from '@ant-design/icons';
import { getPowergslbHealth, getPhpipamHealth } from './service';

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
          Hello, {currentUser.email.split('.')[0]}, its time to focus!
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
  const { initialState, loading, error, refresh, setInitialState } = useModel('@@initialState');
  const currentUser = initialState.currentUser;
  const [objects, setObjects] = useState([]);
  const [stateError, setError] = useState('');
  const [selection, setSelection] = useState([]);
  const [saving, setSaving] = useState(false);
  const [tableLoading, setLoading] = useState(true);
  const [micro, setMicroHealth] = useState([]);
  const getHealth = () => {
    powergslbHealth.then((res) => microHealth.push({ service: 'powergslb', health: res }));
    phpipamHealth.then((res) => microHealth.push({ service: 'phpipam', health: res }));
    setMicroHealth(microHealth);
  };
  let powergslbHealth = getPowergslbHealth();
  let phpipamHealth = getPhpipamHealth();
  let microHealth = [];
  const openNotification = (message, placement, title) => {
    notification.info({
      message: title,
      description: message,
      placement,
    });
  };
  function payLoad(event, content) {
    setSelection([...selection, { context: content, region: event }]);
  }
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Domain',
      dataIndex: 'domain',
      key: 'domain',
    },
    {
      title: 'IPs',
      key: 'ips',
      dataIndex: 'content',
      render: (_, { content }) => (
        <>
          {content.map((ips) => {
            let color = ips['weight'] == 1 ? 'green' : 'geekblue';
            return (
              <Tag color={color} key={ips['ip']}>
                {ips['ip'].toUpperCase()}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      title: 'Region',
      key: 'region',
      render: (_, { content }) => (
        <>
          {content.reduce((before, after) => {
            if (before.region == 'NCW' && before.weight == 1) {
              return (
                <center>
                  <Segmented
                    options={['NCW', 'NCE', 'Both']}
                    defaultValue={'NCW'}
                    onChange={(target) => {
                      payLoad(target, content);
                    }}
                  />
                </center>
              );
            } else if (before.region == 'NCE' && before.weight != after.weight) {
              return (
                <center>
                  <Segmented
                    options={['NCW', 'NCE', 'Both']}
                    defaultValue={'NCE'}
                    onChange={(target) => {
                      payLoad(target, content);
                    }}
                  />
                </center>
              );
            } else if (after.weight == before.weight) {
              return (
                <center>
                  <Segmented
                    options={['NCW', 'NCE', 'Both']}
                    defaultValue={'Both'}
                    onChange={(target) => {
                      payLoad(target, content);
                    }}
                  />
                </center>
              );
            }
          })}
        </>
      ),
    },
  ];
  const loadData = () => {
    var processed = [];
    var res = fetch(`${config.microservices.powergslb.moduleHost}/api/search`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => response.json())
      .then((data) => {
        let newdata = data.records;
        var groupToValues = newdata.reduce(function (obj, item) {
          obj[item.name] = obj[item.name] || [];
          obj[item.name].push(Object.assign({}, item));
          return obj;
        }, {});
        for (let record in groupToValues) {
          if (groupToValues[record].length > 1) {
            for (let item in groupToValues[record]) {
              var body = { ip: groupToValues[record][item].content };
              var res = fetch(`${config.microservices.phpipam.moduleHost}/api/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
              })
                .then((ipResponse) => ipResponse.json())
                .then((ipData) => {
                  var ipData = JSON.parse(ipData).data[0];
                  var body = { subnet: ipData.subnetId };
                  var res = fetch(`${config.microservices.phpipam.moduleHost}/api/subnet`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                  })
                    .then((subnetResponse) => subnetResponse.json())
                    .then((subnetData) => {
                      var subnetData = JSON.parse(subnetData).data;
                      processed.push({
                        content: groupToValues[record][item].content,
                        region: subnetData.description.split(' ')[0],
                        domain: groupToValues[record][item].domain,
                        name: groupToValues[record][item].name,
                        weight: groupToValues[record][item].weight,
                        recId: groupToValues[record][item].recid,
                      });
                      let newProcessed = processed.reduce(
                        (item, { name, content, region, domain, recId, weight }) => {
                          item[name] = item[name] || new Set();
                          item[name].add(domain);
                          item[name].add({
                            ip: content,
                            region: region,
                            recId: recId,
                            weight: weight,
                            domain: domain,
                            name: name,
                          });
                          return item;
                        },
                        {},
                      );
                      newProcessed = Object.entries(newProcessed).map(([name, contents]) => ({
                        name,
                        content: [[...contents][1], [...contents][2]],
                        domain: [...contents][0],
                      }));
                      if (processed.length / 2 == Object.keys(newProcessed).length) {
                        setObjects(newProcessed);
                        setLoading(false);
                        isLoading(false);
                      }
                    })
                    .catch((e) => {
                      setError(`phpIPAM subnet search ${e}`);
                      return;
                    });
                })
                .catch((e) => {
                  console.log(e);
                  setError(`phpIPAM IP search ${e}`);
                  return;
                });
            }
          }
        }
      })
      .catch((e) => {
        setError(`PowerGSLB connection ${e}`);
        setLoading(false);
        return;
      });
  };
  const sendUpdate = () => {
    if (selection) {
      for (let each in selection) {
        var updateRes = fetch(`${config.microservices.powergslb.moduleHost}/api/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selection[each]),
        })
          .then((response) => response.json())
          .then((data) => {
            let newChange = fetch(`${config.db.moduleHost}/api/changes/new`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ service: 'DNS Tool', content: selection[each] }),
            });
            if (!data.code) {
              openNotification(
                'Your DNS change was successful. Refreshing in...',
                'bottom',
                'PowerGSLB',
              );
              setTimeout(() => {
                setSelection([]);
                if (!history) return;
                const { query } = history.location;
                const { redirect } = query;
                history.push(redirect || '/networking/dnstool');
              }, 2000);
            } else {
              console.log('error');
              //addToast("Error", "danger", "help", "Your DNS change was not successful.")
              return;
            }
          })
          .catch((e) => {
            console.log(e);
            setError(`PowerGSLB update ${e}`);
            return;
          });
      }
    } else {
      //addToast("Error", "danger", "help", "Please make a selection.")
    }
  };
  const serviceColumns = [
    {
      title: 'Name',
      dataIndex: 'service',
      render: (text) => <b>{text}</b>,
    },
    {
      title: 'Uptime',
      dataIndex: 'health',
      render: (_) => (
        <>{[<ArrowUpOutlined />, ' ', (_.isUp.uptime / 60 / 60).toFixed(2) + ' hours']}</>
      ),
    },
    {
      title: 'Config',
      dataIndex: 'health',
      render: (_) => <>{[<FileDoneOutlined />, ' ', _.config.keys + ' keys found']}</>,
    },
    {
      title: 'Status',
      dataIndex: 'health',
      render: (_) => (
        <>
          <Badge status="processing" text={_.isUp.message} />
        </>
      ),
    },
  ];
  React.useEffect(() => {
    loadData();
    getHealth();
  }, []);
  return (
    <PageContainer
      content={<PageHeaderContent currentUser={currentUser} />}
      extraContent={<ExtraContent />}
    >
      <Row gutter={24}>
        <Col xl={16} lg={24} md={24} sm={24} xs={24}>
          <Table loading={tableLoading} columns={columns} pagination={false} dataSource={objects} />
          <Button
            size="large"
            loading={saving}
            icon={<SaveOutlined />}
            style={{
              marginTop: 24,
              float: 'right',
            }}
            onClick={() => sendUpdate()}
          >
            Save
          </Button>
        </Col>

        <Col xl={8} lg={24} md={24} sm={24} xs={24}>
          <Badge.Ribbon text={micro.length} color="purple">
            <Card
              style={{
                marginBottom: 24,
              }}
              bordered={false}
              title="Related Microservices"
              loading={micro.length == 0}
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
                <Table
                  showHeader={false}
                  pagination={false}
                  dataSource={micro}
                  columns={serviceColumns}
                  scroll={scroll}
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
