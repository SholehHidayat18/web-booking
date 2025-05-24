import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Layout, Menu, Table, Tag, Space, Button, Card, Statistic, message, Modal, Form, Input, Select, DatePicker, Spin, Divider, Empty } from 'antd';
import { DashboardOutlined, ShoppingCartOutlined, DollarOutlined, HomeOutlined, CalendarOutlined, UserOutlined, LogoutOutlined, FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { API_URL } from '../../../constant';
import { useUser } from '../../components/context/UserContext'; 
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
  const requestSources = useRef([]);

  // Data States
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [paymentStats, setPaymentStats] = useState({
    totalRevenue: 0,
    paidPayments: 0,
    pendingPayments: 0,
    failedPayments: 0
  });
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [financialData, setFinancialData] = useState([]);
  const [reportPeriod, setReportPeriod] = useState('month');
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
    // Explicitly check for cancellation errors
    if (axios.isCancel(error)) {
      console.log('Request was canceled:', error.message);
      return; // Exit silently for canceled requests
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

  const calculatePaymentStats = useCallback((payments) => {
    const stats = {
      totalRevenue: 0,
      paidPayments: 0,
      pendingPayments: 0,
      failedPayments: 0
    };
  
    payments.forEach(payment => {
      if (payment.status === 'paid') {
        stats.totalRevenue += payment.amount;
        stats.paidPayments++;
      } else if (payment.status === 'pending') {
        stats.pendingPayments++;
      } else if (payment.status === 'failed') {
        stats.failedPayments++;
      }
    });
  
    return stats;
  }, []);
  
  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async (token) => {
    const source = axios.CancelToken.source();
    requestSources.current.push(source);
  
    try {
      setLoading(true);
      setApiError(null);
      
      const authAxios = createAuthAxios(token, source.token);
  
      // Make sure all API calls are properly included in Promise.all
      const [bookingsRes, paymentsRes, usersRes, financialRes] = await Promise.all([
        authAxios.get('/admin/bookings'),
        authAxios.get('/admin/payments/reports', {
          params: { page_size: 1000 }
        }),
        authAxios.get('/admin/users'),
        authAxios.get('/admin/financial-reports', {
          params: { period: 'month' }
        })
      ]);
  
      const currentMonthIncome = financialRes.data.data?.[0]?.total_income || 0;
  
      setBookings(bookingsRes.data.data || []);
      setPayments(paymentsRes.data.data || []);
      setFilteredPayments(paymentsRes.data.data || []);
      setUsers(usersRes.data.data || []);
      setFinancialData(financialRes.data.data || []); // Make sure to set financial data
  
      setStats({
        totalBookings: bookingsRes.data.data?.length || 0,
        totalRevenue: currentMonthIncome,
        activeUsers: usersRes.data.data?.filter(u => u.is_verified).length || 0,
        pendingPayments: paymentsRes.data.data?.filter(p => p.status === 'pending').length || 0
      });
    } catch (error) {
      handleApiError(error, 'Failed to load data');
    } finally {
      requestSources.current = requestSources.current.filter(s => s !== source);
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
      const response = await authAxios.get('/admin/payments/reports', {
        params: {
          page: 1,
          page_size: 100,
          sort_by: 'payment_date',
          sort_order: 'desc'
        }
      });
      
      const paymentsData = response.data.data || [];
      setPayments(paymentsData);
      setFilteredPayments(paymentsData);
      setPaymentStats(calculatePaymentStats(paymentsData));
      
    } catch (error) {
      handleApiError(error, 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [createAuthAxios, handleApiError, calculatePaymentStats]);

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

  const fetchFinancialReports = useCallback(async (token, cancelToken) => {
    try {
      setLoading(true);
      const authAxios = createAuthAxios(token, cancelToken);
      const response = await authAxios.get('/admin/financial-reports', {
        params: {
          period: reportPeriod,
          start_date: dayjs().subtract(1, 'year').format('YYYY-MM-DD'),
          end_date: dayjs().format('YYYY-MM-DD')
        }
      });
      setFinancialData(response.data.data || []);
    } catch (error) {
      handleApiError(error, 'Failed to load financial reports');
    } finally {
      setLoading(false);
    }
  }, [createAuthAxios, handleApiError, reportPeriod]);

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
          await fetchFinancialReports(token, cancelTokenSource.token);
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
      cancelTokenSource.cancel('Component unmounted - cleanup');
    };
  }, [
    navigate,
    selectedMenu,
    fetchDashboardData,
    fetchBookings,
    fetchPayments,
    fetchUsers,
    fetchBlockedDates,
    fetchFinancialReports,   
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

  const handlePaymentTableChange = (pagination, filters, sorter) => {
    if (filters.status) {
      const filtered = payments.filter(p => filters.status.includes(p.status));
      setFilteredPayments(filtered);
      setPaymentStats(calculatePaymentStats(filtered));
    } else {
      setFilteredPayments(payments);
      setPaymentStats(calculatePaymentStats(payments));
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
      dataIndex: 'payment_id',
      key: 'payment_id',
      width: 80,
      sorter: (a, b) => a.payment_id - b.payment_id,
    },
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <div className="text-xs text-gray-500">{record.customer_email}</div>
        </div>
      )
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
      title: 'Payment Date',
      dataIndex: 'payment_date',
      key: 'payment_date',
      sorter: (a, b) => new Date(a.payment_date) - new Date(b.payment_date),
      render: (date) => dayjs(date).format('DD MMM YYYY HH:mm'),
    },
    {
      title: 'Place',
      dataIndex: 'place_name',
      key: 'place_name'
    }
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

              <Divider orientation="left">Financial Overview</Divider>
                  <div className="mb-4">
                    <Select 
                      value={reportPeriod}
                      onChange={setReportPeriod}
                      style={{ width: 120 }}
                    >
                      <Option value="day">Daily</Option>
                      <Option value="month">Monthly</Option>
                      <Option value="year">Yearly</Option>
                    </Select>
                  </div>
                  <Card>
                  <div style={{ height: '400px', width: '100%' }}>
                      <Bar
                        data={{
                          labels: financialData.map(item => item.period),
                          datasets: [
                            {
                              label: 'Income',
                              data: financialData.map(item => item.total_income),
                              backgroundColor: 'rgba(54, 162, 235, 0.6)',
                              borderColor: 'rgba(54, 162, 235, 1)',
                              borderWidth: 1
                            },
                            {
                              label: 'Transactions',
                              data: financialData.map(item => item.transaction_count),
                              backgroundColor: 'rgba(75, 192, 192, 0.6)',
                              borderColor: 'rgba(75, 192, 192, 1)',
                              borderWidth: 1
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                            },
                            title: {
                              display: true,
                              text: 'Financial Performance'
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                callback: function(value) {
                                  return 'Rp ' + value.toLocaleString('id-ID');
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </Card>
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
                </div>        
                {/* Financial Overview Cards */}
                  <div className="mb-4">
                    <Select 
                      value={reportPeriod}
                      onChange={setReportPeriod}
                      style={{ width: 120 }}
                    >
                      <Option value="day">Daily</Option>
                      <Option value="month">Monthly</Option>
                      <Option value="year">Yearly</Option>
                    </Select>
                  </div>
                  <Card>
                  <div style={{ height: '400px', width: '100%' }}>
                      <Bar
                        data={{
                          labels: financialData.map(item => item.period),
                          datasets: [
                            {
                              label: 'Income',
                              data: financialData.map(item => item.total_income),
                              backgroundColor: 'rgba(54, 162, 235, 0.6)',
                              borderColor: 'rgba(54, 162, 235, 1)',
                              borderWidth: 1
                            },
                            {
                              label: 'Transactions',
                              data: financialData.map(item => item.transaction_count),
                              backgroundColor: 'rgba(75, 192, 192, 0.6)',
                              borderColor: 'rgba(75, 192, 192, 1)',
                              borderWidth: 1
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                            },
                            title: {
                              display: true,
                              text: 'Financial Performance'
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                callback: function(value) {
                                  return 'Rp ' + value.toLocaleString('id-ID');
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </Card>
                <div className="flex justify-between items-center mb-4">
                <Divider orientation="left"><Button type="primary">Export Data</Button></Divider>
                </div>
                <Table
                  columns={paymentColumns}
                  dataSource={filteredPayments}
                  rowKey="payment_id"
                  pagination={{ pageSize: 10 }}
                  onChange={handlePaymentTableChange}
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
                // Disable dates before todayfull_name
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