import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Layout, Menu, Table, Tag, Space, DatePicker, Button, Modal, Form, Input, Select, Card, Statistic } from 'antd';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  HomeOutlined,
  CalendarOutlined,
  UserOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Header, Content, Sider } = Layout;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [fields, setFields] = useState([]);
  const [financialReports, setFinancialReports] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [blockedDates, setBlockedDates] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch initial data based on selected menu
    fetchData();
  }, [selectedMenu]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin');
        return;
      }

      let response;
      switch (selectedMenu) {
        case 'bookings':
          response = await axios.get('/api/admin/bookings', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setBookings(response.data);
          break;
        case 'finance':
          response = await axios.get('/api/admin/financial-reports', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setFinancialReports(response.data);
          break;
        case 'rooms':
          response = await axios.get('/api/admin/rooms', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setRooms(response.data);
          break;
        case 'buildings':
          response = await axios.get('/api/admin/buildings', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setBuildings(response.data);
          break;
        case 'fields':
          response = await axios.get('/api/admin/fields', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setFields(response.data);
          break;
        case 'blocked-dates':
          response = await axios.get('/api/admin/blocked-dates', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setBlockedDates(response.data);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const handleBlockDates = async () => {
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem('adminToken');
      
      await axios.post('/api/admin/block-dates', values, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIsModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      console.error('Error blocking dates:', error);
    }
  };

  const columns = {
    bookings: [
      {
        title: 'Booking ID',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: 'Client',
        dataIndex: 'client_name',
        key: 'client_name',
      },
      {
        title: 'Facility',
        dataIndex: 'facility_name',
        key: 'facility_name',
      },
      {
        title: 'Dates',
        key: 'dates',
        render: (_, record) => (
          `${dayjs(record.start_date).format('DD/MM/YYYY')} - ${dayjs(record.end_date).format('DD/MM/YYYY')}`
        ),
      },
      {
        title: 'Payment',
        dataIndex: 'payment_status',
        key: 'payment_status',
        render: status => (
          <Tag color={status === 'paid' ? 'green' : 'red'}>
            {status.toUpperCase()}
          </Tag>
        ),
      },
      {
        title: 'Amount',
        dataIndex: 'amount',
        key: 'amount',
        render: amount => `Rp ${amount.toLocaleString()}`,
      },
      {
        title: 'Action',
        key: 'action',
        render: (_, record) => (
          <Space size="middle">
            <Button type="link" onClick={() => console.log('View details', record.id)}>
              Details
            </Button>
          </Space>
        ),
      },
    ],
    finance: [
      {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
        render: date => dayjs(date).format('DD/MM/YYYY'),
      },
      {
        title: 'Total Income',
        dataIndex: 'total_income',
        key: 'total_income',
        render: amount => `Rp ${amount.toLocaleString()}`,
      },
      {
        title: 'Total Bookings',
        dataIndex: 'total_bookings',
        key: 'total_bookings',
      },
      {
        title: 'QRIS Payments',
        dataIndex: 'qris_payments',
        key: 'qris_payments',
      },
    ],
    rooms: [
      {
        title: 'Room Number',
        dataIndex: 'room_number',
        key: 'room_number',
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: status => (
          <Tag color={status === 'available' ? 'green' : 'red'}>
            {status.toUpperCase()}
          </Tag>
        ),
      },
      {
        title: 'Price',
        dataIndex: 'price',
        key: 'price',
        render: price => `Rp ${price.toLocaleString()}/night`,
      },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div className="logo" style={{ height: '32px', margin: '16px', background: 'rgba(255, 255, 255, 0.3)' }} />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedMenu]}
          onSelect={({ key }) => setSelectedMenu(key)}
        >
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
            Dashboard
          </Menu.Item>
          <Menu.Item key="bookings" icon={<ShoppingCartOutlined />}>
            Bookings
          </Menu.Item>
          <Menu.Item key="finance" icon={<DollarOutlined />}>
            Financial Reports
          </Menu.Item>
          <Menu.Item key="rooms" icon={<HomeOutlined />}>
            Room Management
          </Menu.Item>
          <Menu.Item key="buildings" icon={<HomeOutlined />}>
            Building Management
          </Menu.Item>
          <Menu.Item key="fields" icon={<HomeOutlined />}>
            Field Management
          </Menu.Item>
          <Menu.Item key="blocked-dates" icon={<CalendarOutlined />}>
            Block Dates
          </Menu.Item>
          <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout className="site-layout">
        <Header style={{ padding: 0, background: '#fff' }} />
        <Content style={{ margin: '16px' }}>
          {selectedMenu === 'dashboard' && (
            <div>
              <h2>Admin Dashboard</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <Card>
                  <Statistic title="Total Bookings" value={bookings.length} />
                </Card>
                <Card>
                  <Statistic
                    title="Total Revenue"
                    value={financialReports.reduce((sum, report) => sum + report.total_income, 0)}
                    formatter={value => `Rp ${value.toLocaleString()}`}
                  />
                </Card>
                <Card>
                  <Statistic title="Available Rooms" value={rooms.filter(r => r.status === 'available').length} />
                </Card>
                <Card>
                  <Statistic title="Blocked Dates" value={blockedDates.length} />
                </Card>
              </div>
            </div>
          )}

          {selectedMenu === 'bookings' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2>Booking Management</h2>
                <Button type="primary">Export Data</Button>
              </div>
              <Table
                columns={columns.bookings}
                dataSource={bookings}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </div>
          )}

          {selectedMenu === 'finance' && (
            <div>
              <h2>Financial Reports</h2>
              <Table
                columns={columns.finance}
                dataSource={financialReports}
                rowKey="date"
                pagination={{ pageSize: 10 }}
              />
            </div>
          )}

          {selectedMenu === 'rooms' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2>Room Management</h2>
                <Button type="primary">Add New Room</Button>
              </div>
              <Table
                columns={columns.rooms}
                dataSource={rooms}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </div>
          )}

          {selectedMenu === 'blocked-dates' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2>Blocked Dates Management</h2>
                <Button type="primary" onClick={() => setIsModalVisible(true)}>
                  Block New Dates
                </Button>
              </div>
              <Table
                columns={[
                  {
                    title: 'Facility',
                    dataIndex: 'facility_name',
                    key: 'facility_name',
                  },
                  {
                    title: 'Blocked Dates',
                    key: 'dates',
                    render: (_, record) => (
                      `${dayjs(record.start_date).format('DD/MM/YYYY')} - ${dayjs(record.end_date).format('DD/MM/YYYY')}`
                    ),
                  },
                  {
                    title: 'Reason',
                    dataIndex: 'reason',
                    key: 'reason',
                  },
                  {
                    title: 'Action',
                    key: 'action',
                    render: (_, record) => (
                      <Button danger onClick={() => console.log('Unblock', record.id)}>
                        Unblock
                      </Button>
                    ),
                  },
                ]}
                dataSource={blockedDates}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </div>
          )}
        </Content>
      </Layout>

      <Modal
        title="Block Dates"
        visible={isModalVisible}
        onOk={handleBlockDates}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="facility_type"
            label="Facility Type"
            rules={[{ required: true, message: 'Please select facility type' }]}
          >
            <Select placeholder="Select facility type">
              <Option value="room">Room</Option>
              <Option value="building">Building</Option>
              <Option value="field">Field</Option>
              <Option value="all">All Facilities</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="facility_id"
            label="Specific Facility (if applicable)"
          >
            <Select placeholder="Select specific facility" allowClear>
              {selectedMenu === 'rooms' && rooms.map(room => (
                <Option key={room.id} value={room.id}>{room.room_number}</Option>
              ))}
              {selectedMenu === 'buildings' && buildings.map(building => (
                <Option key={building.id} value={building.id}>{building.name}</Option>
              ))}
              {selectedMenu === 'fields' && fields.map(field => (
                <Option key={field.id} value={field.id}>{field.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="date_range"
            label="Date Range"
            rules={[{ required: true, message: 'Please select date range' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="reason"
            label="Reason"
            rules={[{ required: true, message: 'Please provide a reason' }]}
          >
            <Input.TextArea rows={3} placeholder="Enter reason for blocking these dates" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Dashboard;