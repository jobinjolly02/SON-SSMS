import React from 'react';
import * as XLSX from 'xlsx';
import axios from 'axios';
import './ExportToExcel.css';

const ExportToExcel = ({ fileName }) => {
  const exportToExcel = async () => {
    try {
      const response = await axios.get('http://192.168.0.111:3001/get-applications');
      const data = response.data;
      
      const worksheet = XLSX.utils.json_to_sheet(data);

      const range = XLSX.utils.decode_range(worksheet['!ref']);

      const headers = Object.keys(data[0]);
      headers.forEach((header, index) => {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: index });
        if (!worksheet[cellAddress].s) {
          worksheet[cellAddress].s = {};
        }
        worksheet[cellAddress].s.font = { bold: true };
      });

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

      XLSX.writeFile(workbook, `${fileName}.xlsx`);
    } catch (error) {
      console.error('Error exporting data to Excel:', error);
    }
  };

  return (
    <button onClick={exportToExcel} className="export-button">
      Export to Excel
    </button>
  );
};

export default ExportToExcel;
