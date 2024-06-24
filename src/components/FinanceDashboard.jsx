import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FinanceDashboard.css';

const FinanceDashboard = ({ setStatusFilter }) => {
  const [financeDashboardData, setFinanceDashboardData] = useState({
    total: 0,
    financeApproved: 0,
    financeRejected: 0,
    financePending: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        const response = await axios.get('http://192.168.0.111:3001/api/finance-dashboard');
        setFinanceDashboardData({
          total: response.data.total,
          financeApproved: response.data.financeApproved,
          financeRejected: response.data.financeRejected,
          financePending: response.data.financePending
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching finance dashboard data:', error);
        setError('Failed to load finance data.');
        setLoading(false);
      }
    };

    fetchFinanceData();
  }, []);

  if (loading) {
    return <div>Loading finance data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="finance-dashboard">
      <div className="dashboard-stats">
        <div className="stat-item-5" onClick={() => setStatusFilter('ALL')} title="View All Financial Records">
          <span className="stat-count">{financeDashboardData.total}</span>
          <span className="stat-label">Students Registered</span>
        </div>
        <div className="stat-item-6" onClick={() => setStatusFilter('APPROVED')} title="View Finance Approved">
          <span className="stat-count">{financeDashboardData.financeApproved}</span>
          <span className="stat-label">Finance Approved</span>
        </div>
        <div className="stat-item-7" onClick={() => setStatusFilter('REJECTED')} title="View Finance Rejected">
          <span className="stat-count">{financeDashboardData.financeRejected}</span>
          <span className="stat-label">Finance Rejected</span>
        </div>
        <div className="stat-item-8" onClick={() => setStatusFilter('PENDING')} title="View Finance Pending">
          <span className="stat-count">{financeDashboardData.financePending}</span>
          <span className="stat-label">Action Pending</span>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
