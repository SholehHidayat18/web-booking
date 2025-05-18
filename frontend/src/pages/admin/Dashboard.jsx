import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Layout, Menu, Table, Tag, Space, Button, Card, Statistic, message, Modal, Form, Input, Select, DatePicker, Spin, Divider } from 'antd';
import { DashboardOutlined, ShoppingCartOutlined, DollarOutlined, HomeOutlined, CalendarOutlined, UserOutlined, LogoutOutlined, FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { API_URL } from '../../../constant';
import { useUser } from '../../components/context/UserContext'; 

const { Header, Content, Sider } = Layout;
const { RangePicker } = DatePicker;
const { Option } = Select;
const BASE_URL = 'http://localhost:5000/api/v1';

const Dashboard = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const { logout } = useUser();

  // Data States
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingPayments: 0
  });
  
  // Modal States
  const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);
  const [isBlockDateModalVisible, setIsBlockDateModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [form] = Form.useForm();
  const [apiError, setApiError] = useState(null);

  // Create authenticated axios instance
  const createAuthAxios = useCallback((token, cancelToken) => {
    return axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        Authorization: `Bearer ${token}`
      },
      cancelToken
    });
  }, []);

  const handleLogout = useCallback(async () => {
    // Clear all admin-specific data first
    localStorage.removeItem('adminToken');
    
    // Reset all states
    setBookings([]);
    setPayments([]);
    setFilteredPayments([]);
    setUsers([]);
    setStats({
      totalBookings: 0,
      totalRevenue: 0,
      activeUsers: 0,
      pendingPayments: 0
    });
    setBlockedDates([]);
    setApiError(null);
  
    // Call the context logout
    await logout();
  
    // Force a hard redirect to completely reset the app state
    window.location.href = '/login';
  }, [logout]); 

  // Handle API errors
  const handleApiError = useCallback((error, defaultMessage) => {
    if (axios.isCancel(error)) {
      console.log('Request canceled:', error.message);
      return;
    }
  
    console.error('API error:', error);
    setApiError(error.response?.data?.message || error.message);
  
    if (error.response?.status === 401) {
      message.error('Session expired, please login again.');
      handleLogout();
    } else {
      message.error(defaultMessage);
    }
  }, [handleLogout]);
  

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async (token, cancelToken) => {
    try {
      setLoading(true);
      setApiError(null);
      
      const authAxios = createAuthAxios(token, cancelToken);
  
      const [bookingsRes, paymentsRes, usersRes] = await Promise.all([
        authAxios.get('/admin/bookings'),
        authAxios.get('/admin/payments'),
        authAxios.get('/admin/users')
      ]);
  
      setBookings(bookingsRes.data.data || []);
      setPayments(paymentsRes.data.data || []);
      setFilteredPayments(paymentsRes.data.data || []); // Add this line
      setUsers(usersRes.data.data || []);
  
      setStats({
        totalBookings: bookingsRes.data.data?.length || 0,
        totalRevenue: paymentsRes.data.data?.reduce((sum, p) => sum + (p.status === 'paid' ? p.amount : 0), 0) || 0,
        activeUsers: usersRes.data.data?.length || 0,
        pendingPayments: paymentsRes.data.data?.filter(p => p.status !== 'paid').length || 0
      });
    } catch (error) {
      handleApiError(error, 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [createAuthAxios, handleApiError]);

  // Fetch bookings data
  const fetchBookings = useCallback(async (token, cancelToken) => {
    try {
      setLoading(true);
      const authAxios = createAuthAxios(token, cancelToken);
      
      const response = await authAxios.get('/admin/bookings');
      setBookings(response.data.data || []);
    } catch (error) {
      handleApiError(error, 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [createAuthAxios, handleApiError]);

  // Fetch payments data
  const fetchPayments = useCallback(async (token, cancelToken) => {
    try {
      setLoading(true);
      const authAxios = createAuthAxios(token, cancelToken);
      const response = await authAxios.get('/payments');
      setPayments(response.data.data || []);
      setFilteredPayments(response.data.data || []); // Set filteredPayments here
    } catch (error) {
      handleApiError(error, 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [createAuthAxios, handleApiError]);

  // Fetch users data
  const fetchUsers = useCallback(async (token, cancelToken) => {
    try {
      setLoading(true);
      const authAxios = createAuthAxios(token, cancelToken);
      
      const response = await authAxios.get('/admin/users');
      setUsers(response.data.data || []);
    } catch (error) {
      handleApiError(error, 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [createAuthAxios, handleApiError]);

  const fetchBlockedDates = useCallback(async (token, cancelToken) => {
    try {
      setLoading(true);
      const authAxios = createAuthAxios(token, cancelToken);
  
      const response = await authAxios.get('/admin/block-dates');
      setBlockedDates(response.data.data || []);
    } catch (error) {
      handleApiError(error, 'Failed to load blocked dates');
    } finally {
      setLoading(false);
    }
  }, [createAuthAxios, handleApiError]);  

  // Main data fetching effect
  useEffect(() => {
    window.scrollTo(0, 0);
    const token = localStorage.getItem('adminToken');
    if (!token) {
      handleLogout();
      return;
    }
  
    const cancelTokenSource = axios.CancelToken.source();
  
    const fetchData = async () => {
      try {
        if (selectedMenu === 'dashboard') {
          await fetchDashboardData(token, cancelTokenSource.token);
        } else if (selectedMenu === 'bookings') {
          await fetchBookings(token, cancelTokenSource.token);
        } else if (selectedMenu === 'payments') {
          await fetchPayments(token, cancelTokenSource.token);
        } else if (selectedMenu === 'users') {
          await fetchUsers(token, cancelTokenSource.token);
        } else if (selectedMenu === 'block-dates') {
          await fetchBlockedDates(token, cancelTokenSource.token);  
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          handleApiError(error, 'Failed to load data');
        }
      }
    };
  
    fetchData();
  
    return () => {
      cancelTokenSource.cancel('Component unmounted');
    };
  }, [
    navigate,
    selectedMenu,
    fetchDashboardData,
    fetchBookings,
    fetchPayments,
    fetchUsers,
    fetchBlockedDates,   
    handleApiError
  ]);

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setIsBookingModalVisible(true);
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        handleLogout();
        return;
      }
      
      const cancelTokenSource = axios.CancelToken.source();
      const authAxios = createAuthAxios(token, cancelTokenSource.token);
      
      await authAxios.delete(`/admin/bookings/${bookingId}`);
      message.success('Booking cancelled successfully');
      await fetchBookings(token, cancelTokenSource.token);
    } catch (error) {
      handleApiError(error, 'Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockDates = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        handleLogout();
        return;
      }
  
      // Mapping facility_type ke place_id
      const placeMapping = {
        room: 1,
        building: 2,
        field: 3,
        all: null, // null = semua fasilitas
      };
      const place_id = placeMapping[values.facility_type];
  
      // Format tanggal jadi 'YYYY-MM-DD'
      const start_date = values.date_range[0].format('YYYY-MM-DD');
      const end_date = values.date_range[1].format('YYYY-MM-DD');
  
      const authAxios = createAuthAxios(token);
      await authAxios.post(
        `${BASE_URL}/admin/block-dates`,
        {
          place_id,
          start_date,
          end_date,
          reason: values.reason,
        }
      );
  
      message.success('Dates blocked successfully.');
      setIsBlockDateModalVisible(false);
      form.resetFields();
  
      // Refresh list block dates if in the correct menu
      if (selectedMenu === 'block-dates') {
        const cancelTokenSource = axios.CancelToken.source();
        await fetchBlockedDates(token, cancelTokenSource.token);
      }
  
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        config: error.config,
      });
  
      const errorMsg = error.response?.data?.message || 'Failed to block dates. Please try again.';
      message.error(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Table Columns
  const bookingColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.full_name}</div>
          <div className="text-sm text-gray-500">{record.email}</div>
          <div className="text-sm text-gray-500">{record.phone_number}</div>
        </div>
      )
    },
    {
      title: 'Booking Date',
      dataIndex: 'booking_date',
      key: 'booking_date',
      render: (date) => dayjs(date).format('DD MMM YYYY HH:mm')
    },
    {
      title: 'Period',
      key: 'period',
      render: (_, record) => (
        <div>
          {dayjs(record.start_date).format('DD MMM YYYY')} - {dayjs(record.end_date).format('DD MMM YYYY')}
        </div>
      )
    },
    {
      title: 'Total',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (price) => `Rp ${price?.toLocaleString('id-ID') || '0'}`,
      align: 'right'
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.payment?.status === 'paid' ? 'green' : 'orange'}>
          {record.payment?.status?.toUpperCase() || 'PENDING'}
        </Tag>
      )
    },
    {
      title: 'Action',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small"
            onClick={() => handleViewBooking(record)}
          >
            View
          </Button>
          <Button 
            danger 
            type="text" 
            size="small"
            onClick={() => handleCancelBooking(record.id)}
          >
            Cancel
          </Button>
        </Space>
      )
    }
  ];

  const paymentColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (amount) => `Rp ${amount?.toLocaleString('id-ID') || '0'}`,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Paid', value: 'paid' },
        { text: 'Pending', value: 'pending' },
        { text: 'Failed', value: 'failed' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        let color = 'red';
        if (status === 'paid') color = 'green';
        else if (status === 'pending') color = 'orange';
        return <Tag color={color}>{status?.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      render: (date) => dayjs(date).format('DD MMM YYYY HH:mm'),
    },
  ];

  const userColumns = [
    {
      title: 'ID',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 80
    },
    {
      title: 'Name',
      dataIndex: 'full_name',
      key: 'full_name'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Phone',
      dataIndex: 'phone_number',
      key: 'phone_number'
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Space>
          <Tag color={record.is_verified ? 'green' : 'orange'}>
            {record.is_verified ? 'VERIFIED' : 'UNVERIFIED'}
          </Tag>
          {record.is_admin && <Tag color="blue">ADMIN</Tag>}
        </Space>
      )
    }
  ];

  const blockedDateColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (date) => dayjs(date).format('DD MMM YYYY')
    },
    {
      title: 'End Date',
      dataIndex: 'end_date',
      key: 'end_date',
      render: (date) => dayjs(date).format('DD MMM YYYY')
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason'
    }
  ];  
  
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'bookings',
      icon: <ShoppingCartOutlined />,
      label: 'Bookings',
    },
    {
      key: 'payments',
      icon: <DollarOutlined />,
      label: 'Payments',
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: 'Users',
    },
    {
      key: 'block-dates',
      icon: <CalendarOutlined />,
      label: 'Block Dates',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: handleLogout,
    },
  ];
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        theme="light"
      >
        <div className="logo p-4 text-center">
          <h1 className="text-xl font-bold text-blue-600">
            {collapsed ? 'BKPP' : 'BKPP Admin'}
          </h1>
        </div>

        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[selectedMenu]}
          onSelect={({ key }) => {
            if (key !== 'logout') {
              setSelectedMenu(key);
            }
          }}
          items={menuItems}
        />
      </Sider>

      <Layout>
        <Header style={{ padding: 0, background: '#fff', boxShadow: '0 1px 4px rgba(0,21,41,.08)' }} />
        
        <Content className="p-6">
          <Spin spinning={loading}>
            {selectedMenu === 'dashboard' && (
              <div>
                <h1 className="text-2xl font-my-custom-font mb-6">Admin Dashboard</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <Statistic 
                      title="Total Bookings" 
                      value={stats.totalBookings} 
                      prefix={<ShoppingCartOutlined />}
                    />
                  </Card>
                  <Card>
                    <Statistic
                      title="Total Revenue"
                      value={stats.totalRevenue}
                      prefix={<DollarOutlined />}
                      formatter={value => `Rp ${value.toLocaleString('id-ID')}`}
                    />
                  </Card>
                  <Card>
                    <Statistic 
                      title="Active Users" 
                      value={stats.activeUsers} 
                      prefix={<UserOutlined />}
                    />
                  </Card>
                  <Card>
                    <Statistic 
                      title="Pending Payments" 
                      value={stats.pendingPayments} 
                      prefix={<FileTextOutlined />}
                    />
                  </Card>
                </div>

                <Divider orientation="left">Recent Bookings</Divider>
                <Table
                  columns={bookingColumns}
                  dataSource={bookings.slice(0, 5)}
                  rowKey="id"
                  pagination={false}
                  size="middle"
                />
              </div>
            )}

            {selectedMenu === 'bookings' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-2xl font-bold">Booking Management</h1>
                  <Button type="primary">Export Data</Button>
                </div>
                <Table
                  columns={bookingColumns}
                  dataSource={bookings}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 1200 }}
                />
              </div>
            )}

            {selectedMenu === 'payments' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-2xl font-bold">Payment Management</h1>
                  <Button type="primary">Export Data</Button>
                </div>
                <Table
                  columns={paymentColumns}
                  dataSource={filteredPayments}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </div>
            )}

            {selectedMenu === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-2xl font-bold">User Management</h1>
                  <Button type="primary">Export Data</Button>
                </div>
                <Table
                  columns={userColumns}
                  dataSource={users}
                  rowKey="user_id"
                  pagination={{ pageSize: 10 }}
                />
              </div>
            )}

            {selectedMenu === 'block-dates' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-2xl font-bold">Blocked Dates Management</h1>
                  <Button 
                    type="primary" 
                    onClick={() => setIsBlockDateModalVisible(true)}
                  >
                    Add Blocked Dates
                  </Button>
                </div>
                <Table 
                  dataSource={blockedDates} 
                  columns={blockedDateColumns} 
                  rowKey="id"
                  loading={loading}
                />
              </div>
            )}
          </Spin>
        </Content>
      </Layout>

      {/* Booking Detail Modal */}
      <Modal
        title="Booking Details"
        open={isBookingModalVisible}
        onCancel={() => setIsBookingModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedBooking && (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-semibold">Customer Information</h3>
                <p>{selectedBooking.full_name}</p>
                <p>{selectedBooking.email}</p>
                <p>{selectedBooking.phone_number}</p>
              </div>
              <div>
                <h3 className="font-semibold">Booking Information</h3>
                <p>ID: {selectedBooking.id}</p>
                <p>Date: {dayjs(selectedBooking.booking_date).format('DD MMM YYYY HH:mm')}</p>
                <p>
                  Period: {dayjs(selectedBooking.start_date).format('DD MMM YYYY')} - {dayjs(selectedBooking.end_date).format('DD MMM YYYY')}
                </p>
              </div>
            </div>

            <Divider orientation="left">Payment</Divider>
            {selectedBooking.payment ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p>Status: <Tag color={selectedBooking.payment.status === 'paid' ? 'green' : 'orange'}>
                    {selectedBooking.payment.status?.toUpperCase()}
                  </Tag></p>
                  <p>Amount: Rp {selectedBooking.payment.amount?.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  {selectedBooking.payment.qr_code_url && (
                    <img 
                      src={selectedBooking.payment.qr_code_url} 
                      alt="QR Code" 
                      className="w-32 h-32"
                    />
                  )}
                </div>
              </div>
            ) : (
              <p>No payment information available</p>
            )}
          </div>
        )}
      </Modal>

      {/* Block Dates Modal */}
      <Modal
        title="Block Dates"
        open={isBlockDateModalVisible}
        onCancel={() => {
          setIsBlockDateModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={loading}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleBlockDates}>
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
            name="date_range"
            label="Date Range"
            rules={[
              { 
                required: true, 
                message: 'Please select date range' 
              },
              {
                validator: (_, value) => {
                  if (value && value[0] && value[1] && value[0].isAfter(value[1])) {
                    return Promise.reject('End date must be after start date');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <RangePicker 
              style={{ width: '100%' }} 
              disabledDate={current => {
                // Disable dates before today
                return current && current < dayjs().startOf('day');
              }}
            />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Reason"
            rules={[
              { required: true, message: 'Please provide a reason' },
              { max: 255, message: 'Reason must be less than 255 characters' }
            ]}
          >
            <Input.TextArea rows={3} placeholder="Enter reason for blocking these dates" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Dashboard;