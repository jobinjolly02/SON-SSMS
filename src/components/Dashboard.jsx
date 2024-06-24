import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = ({ setStatusFilter }) => {
  const [dashboardData, setDashboardData] = useState({
    registered: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    financePending: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://192.168.0.111:3001/api/dashboard');
        setDashboardData({
          registered: response.data.registered,
          approved: response.data.approved,
          rejected: response.data.rejected,
          pending: response.data.pending,
          financePending: response.data.financePending
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-stats">
        <div className="stat-item-1" onClick={() => setStatusFilter('ALL')} title="View All Students">
          <span className="stat-count">{dashboardData.registered}</span>
          <span className="stat-label">Students Registered</span>
        </div>
        <div className="stat-item-2" onClick={() => setStatusFilter('APPROVED')} title="View Approved Students">
          <span className="stat-count">{dashboardData.approved}</span>
          <span className="stat-label">Students Approved</span>
        </div>
        <div className="stat-item-3" onClick={() => setStatusFilter('REJECTED')} title="View Rejected Students">
          <span className="stat-count">{dashboardData.rejected}</span>
          <span className="stat-label">Students Rejected</span>
        </div>
        <div className="stat-item-4" onClick={() => setStatusFilter('PENDING')} title="View Pending Students">
          <span className="stat-count">{dashboardData.pending}</span>
          <span className="stat-label">Action Pending</span>
        </div>
        <div className="stat-item-9" onClick={() => setStatusFilter('FINANCE_PENDING')} title="View Finance Pending Students">
          <span className="stat-count">{dashboardData.financePending}</span>
          <span className="stat-label">Finance Pending</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
