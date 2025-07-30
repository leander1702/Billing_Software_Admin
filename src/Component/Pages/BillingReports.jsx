import React, { useState, useEffect } from 'react';
import { Table, Select, DatePicker, Card, Statistic, Row, Col, Divider, Button, message, Descriptions, Input } from 'antd';
import moment from 'moment';
import Api from '../../service/api';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Search } = Input;

const BillingReports = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [cashiers, setCashiers] = useState([]);
  const [counters, setCounters] = useState([]);
  const [selectedCounter, setSelectedCounter] = useState('all');
  const [dateRangeType, setDateRangeType] = useState('today');
  const [customDateRange, setCustomDateRange] = useState([moment().startOf('day'), moment().endOf('day')]);
  const [billData, setBillData] = useState([]);
  const [filteredBillData, setFilteredBillData] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [topProducts, setTopProducts] = useState([]);

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Date Range' }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchBillData();
  }, [selectedCounter, dateRangeType, customDateRange]);

  useEffect(() => {
    // Filter bills based on search term whenever billData or searchTerm changes
    if (searchTerm) {
      const filtered = billData.filter(bill => {
        const billNumberMatch = bill.billNumber?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        const customerNameMatch = bill.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const customerPhoneMatch = bill.customer?.contact?.toLowerCase().includes(searchTerm.toLowerCase());

        return billNumberMatch || customerNameMatch || customerPhoneMatch;
      });
      setFilteredBillData(filtered);
    } else {
      setFilteredBillData(billData);
    }
  }, [searchTerm, billData]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const res = await Api.get("/credentials/users");

      if (!res.data) {
        throw new Error("No data received from server");
      }

      let cashiersData = [];
      if (Array.isArray(res.data)) {
        cashiersData = res.data;
      } else if (Array.isArray(res.data.cashiers)) {
        cashiersData = res.data.cashiers;
      } else {
        throw new Error("Invalid cashiers data format");
      }

      const processedCashiers = cashiersData.map(cashier => ({
        _id: cashier._id,
        cashierName: cashier.cashierName,
        cashierId: cashier.cashierId,
        counterNum: cashier.counterNum?.toString().trim(),
        contactNumber: cashier.contactNumber
      }));

      setCashiers(processedCashiers);

      const uniqueCounters = [...new Set(
        processedCashiers
          .filter(cashier => cashier.counterNum)
          .map(cashier => cashier.counterNum)
      )];

      setCounters(uniqueCounters);

      if (user?.counterId) {
        setSelectedCounter(user.counterId.toString().trim());
      } else if (uniqueCounters.length > 0) {
        setSelectedCounter('all');
      }
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      message.error("Failed to load cashiers and counters data");
      setCashiers([]);
      setCounters([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBillData = async () => {
    try {
      setLoading(true);

      let startDate, endDate;
      switch (dateRangeType) {
        case 'today':
          startDate = moment().startOf('day');
          endDate = moment().endOf('day');
          break;
        case 'week':
          startDate = moment().startOf('week');
          endDate = moment().endOf('week');
          break;
        case 'month':
          startDate = moment().startOf('month');
          endDate = moment().endOf('month');
          break;
        case 'year':
          startDate = moment().startOf('year');
          endDate = moment().endOf('year');
          break;
        case 'custom':
          startDate = customDateRange[0];
          endDate = customDateRange[1];
          break;
        default:
          startDate = moment().startOf('day');
          endDate = moment().endOf('day');
      }

      const params = {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD')
      };

      // Add counter filter only if not 'all'
      if (selectedCounter !== 'all') {
        params.counterNum = selectedCounter.toString().trim();
      }

      const res = await Api.get("/bills", {
        params,
        validateStatus: function (status) {
          return status >= 200 && status < 300;
        }
      });

      let billsData = [];
      if (res.data) {
        billsData = Array.isArray(res.data) ? res.data : [res.data];

        // Additional client-side filtering if needed
        if (selectedCounter !== 'all') {
          billsData = billsData.filter(bill =>
            bill.cashier?.counterNum === selectedCounter.toString().trim()
          );
        }
      }

      setBillData(billsData);
      setFilteredBillData(billsData);
      calculateTopProducts(billsData);

      if (billsData.length === 0) {
        message.info(selectedCounter === 'all'
          ? 'No bills found for all counters'
          : `No bills found for Counter ${selectedCounter}`);
      }

    } catch (error) {
      console.error("API Error Details:", error);
      message.error("Failed to load bill data");
      setBillData([]);
      setFilteredBillData([]);
      setTopProducts([]);
    }
    finally {
      setLoading(false);
    }
  };

  const calculateTopProducts = (bills) => {
    const productMap = {};

    bills.forEach(bill => {
      if (bill.products && Array.isArray(bill.products)) {
        bill.products.forEach(product => {
          if (!product._id) return;

          if (!productMap[product._id]) {
            productMap[product._id] = {
              ...product,
              totalQuantity: 0,
              totalAmount: 0
            };
          }

          productMap[product._id].totalQuantity += product.quantity || 0;
          productMap[product._id].totalAmount += (product.price || 0) * (product.quantity || 0);
        });
      }
    });

    const productsArray = Object.values(productMap);
    productsArray.sort((a, b) => b.totalQuantity - a.totalQuantity);

    setTopProducts(productsArray.slice(0, 5)); // Top 5 products
  };

  const calculateSummary = () => {
    const dataToUse = searchTerm ? filteredBillData : billData;
    const totalAmount = dataToUse.reduce((sum, bill) => sum + (bill.grandTotal || 0), 0);
    const totalBills = dataToUse.length;
    const totalPaid = dataToUse.reduce((sum, bill) => sum + (bill.status === 'paid' ? (bill.grandTotal || 0) : 0), 0);
    const totalPending = dataToUse.reduce((sum, bill) => sum + (bill.status !== 'paid' ? (bill.grandTotal || 0) : 0), 0);

    return { totalAmount, totalBills, totalPaid, totalPending };
  };

  const summary = calculateSummary();

  const getCounterCashiers = () => {
    if (selectedCounter === 'all') return cashiers;
    return cashiers.filter(c => c.counterNum === selectedCounter);
  };

  // const printBill = (bill) => {
  //   message.success(`Printing bill ${bill.billNumber}`);
  //   console.log('Printing bill:', bill);
  // };

  const billColumns = [
    {
      title: 'Bill Number',
      dataIndex: 'billNumber',
      key: 'billNumber',
      render: billNumber => billNumber || 'N/A'
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: date => date ? moment(date).format('DD-MM-YYYY HH:mm') : 'N/A'
    },
    {
      title: 'Customer',
      dataIndex: ['customer', 'name'],
      key: 'customerName',
      render: (name) => name || 'N/A'
    },
    {
      title: 'Customer Phone',
      dataIndex: ['customer', 'contact'],
      key: 'customerPhone',
      render: (phone) => phone || 'N/A'
    },
    {
      title: 'Cashier',
      dataIndex: ['cashier', 'cashierName'],
      key: 'cashierName',
      render: (name) => name || 'N/A'
    },
    {
      title: 'Counter',
      dataIndex: ['cashier', 'counterNum'],
      key: 'counterNum',
      render: (counter) => counter || 'N/A'
    },
    {
      title: 'Amount (₹)',
      dataIndex: 'grandTotal',
      key: 'amount',
      render: amount => (amount || 0).toFixed(2)
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: method => method ? method.charAt(0).toUpperCase() + method.slice(1) : 'N/A'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <span style={{ color: status === 'paid' ? 'green' : 'red' }}>
          {status ? status.toUpperCase() : 'N/A'}
        </span>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => setSelectedBill(record)}>
          View Details
        </Button>
      )
    }
  ];

  return (
    <div className="billing-reports p-4">
      {/* Filter controls */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <Row gutter={16}>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Select Counter"
              value={selectedCounter}
              onChange={setSelectedCounter}
              loading={loading}
            >
              <Option key="all" value="all">
                All Counters
              </Option>
              {counters.map(counter => (
                <Option key={counter} value={counter}>
                  Counter {counter}
                </Option>
              ))}
            </Select>
          </Col>

          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              value={dateRangeType}
              onChange={(value) => {
                setDateRangeType(value);
                if (value !== 'custom') {
                  setCustomDateRange([moment().startOf('day'), moment().endOf('day')]);
                }
              }}
            >
              {dateRangeOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Col>

          {dateRangeType === 'custom' && (
            <Col span={6}>
              <RangePicker
                style={{ width: '100%' }}
                format="DD-MM-YYYY"
                value={customDateRange}
                onChange={setCustomDateRange}
                disabledDate={(current) => current && current > moment().endOf('day')}
              />
            </Col>
          )}
        </Row>
      </div>

      {/* Counter Information - Only shown when a specific counter is selected */}
      {selectedCounter !== 'all' && (
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <Divider orientation="left">Counter Information</Divider>
          <Descriptions bordered>
            <Descriptions.Item label="Counter Number">{selectedCounter}</Descriptions.Item>
            <Descriptions.Item label="Total Cashiers">{getCounterCashiers().length}</Descriptions.Item>
            <Descriptions.Item label="Active Cashiers">
              {getCounterCashiers().map(c => c.cashierName).join(', ')}
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}

      {/* Summary Cards */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Revenue"
                value={summary.totalAmount}
                precision={2}
                prefix="₹"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Bills"
                value={summary.totalBills}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Paid Amount"
                value={summary.totalPaid}
                precision={2}
                prefix="₹"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Pending Amount"
                value={summary.totalPending}
                precision={2}
                prefix="₹"
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Top Selling Products */}
      {topProducts.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <Divider orientation="left">Top Selling Products</Divider>
          <Table
            columns={[
              { title: 'Product Name', dataIndex: 'name', key: 'name' },
              { title: 'Quantity Sold', dataIndex: 'totalQuantity', key: 'quantity' },
              { title: 'Unit', dataIndex: 'unit', key: 'unit' },
              { title: 'Price', dataIndex: 'price', key: 'price', render: val => `₹${(val || 0).toFixed(2)}` },
              { title: 'Total Amount', dataIndex: 'totalAmount', key: 'amount', render: val => `₹${(val || 0).toFixed(2)}` },
            ]}
            dataSource={topProducts}
            rowKey="_id"
            pagination={false}
            size="small"
          />
        </div>
      )}

      {/* Bill Details Modal */}
      {selectedBill && (
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <Divider orientation="left">Bill Details</Divider>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Bill Number">{selectedBill.billNumber || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Date">
              {selectedBill.date ? moment(selectedBill.date).format('DD-MM-YYYY HH:mm') : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Customer Name">{selectedBill.customer?.name || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Customer Contact">{selectedBill.customer?.contact || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Cashier Name">{selectedBill.cashier?.cashierName || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Counter Number">{selectedBill.cashier?.counterNum || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Payment Method">
              {selectedBill.paymentMethod ? selectedBill.paymentMethod.charAt(0).toUpperCase() + selectedBill.paymentMethod.slice(1) : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <span style={{ color: selectedBill.status === 'paid' ? 'green' : 'red' }}>
                {selectedBill.status ? selectedBill.status.toUpperCase() : 'N/A'}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Grand Total">₹{(selectedBill.grandTotal || 0).toFixed(2)}</Descriptions.Item>
          </Descriptions>

          <Divider orientation="left">Products</Divider>
          <Table
            columns={[
              { title: 'Product', dataIndex: 'name', key: 'name' },
              { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
               { title: 'Unit', dataIndex: 'unit', key: 'unit' },
              { title: 'Price', dataIndex: 'price', key: 'price', render: val => `₹${(val || 0).toFixed(2)}` },             
              { title: 'Total', key: 'total', render: (_, item) => `₹${((item.price || 0) * (item.quantity || 0)).toFixed(2)}` }
            ]}
            dataSource={selectedBill.products || []}
            rowKey="_id"
            pagination={false}
          />

          <div className="mt-4">
            {/* <Button type="primary" onClick={() => printBill(selectedBill)} className="mr-2">
              Print Bill
            </Button> */}
            <Button onClick={() => setSelectedBill(null)}>
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Bills Table */}
      <div className="bg-white p-4 rounded-lg shadow">
        <Divider orientation="left">
          {selectedCounter === 'all'
            ? 'All Counters Bill History'
            : `Bill History (Counter ${selectedCounter})`}
        </Divider>

        <div className="mb-4">
          <Search
            placeholder="Search by bill number, customer name, or phone"
            allowClear
            enterButton="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 400 }}
          />
        </div>

        <Table
          columns={billColumns}
          dataSource={filteredBillData}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
          locale={{
            emptyText: searchTerm
              ? 'No matching bills found'
              : selectedCounter === 'all'
                ? 'No bills found for all counters'
                : `No bills found for Counter ${selectedCounter}`
          }}
        />
      </div>
    </div>
  );
};

export default BillingReports;