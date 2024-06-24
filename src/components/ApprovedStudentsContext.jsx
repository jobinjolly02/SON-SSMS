import React, { createContext, useContext, useState } from 'react';

const ApprovedStudentsContext = createContext();

export const useApprovedStudents = () => useContext(ApprovedStudentsContext);

export const ApprovedStudentsProvider = ({ children }) => {
    const [approvedStudents, setApprovedStudents] = useState([]);

    const addApprovedStudent = (student) => {
        setApprovedStudents(prevStudents => [...prevStudents, student]);
    };

    return (
        <ApprovedStudentsContext.Provider value={{ approvedStudents, addApprovedStudent }}>
            {children}
        </ApprovedStudentsContext.Provider>
    );
};
