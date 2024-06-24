import React, { createContext, useState } from 'react';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [submissions, setSubmissions] = useState([]);

  const addSubmission = (newSubmission) => {
    setSubmissions([...submissions, newSubmission]);
  };

  return (
    <DataContext.Provider value={{ submissions, addSubmission }}>
      {children}
    </DataContext.Provider>
  );
};
