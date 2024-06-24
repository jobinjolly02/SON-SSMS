import React, { useState, useEffect, useContext } from 'react';
import FormValidation from './FormValidation'; 
import countries from "./countries";
import quitIcon from "../assets/remove.png";
import { useNavigate } from 'react-router-dom';
import { DataContext } from '../DataContext';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FaCalendarAlt } from 'react-icons/fa';
import "./ApplicationForm.css";
import ApplicationPreviewModal from './ApplicationPreviewModal'; 
import LoadingSpinner from './LoadingSpinner';
import ConfirmationModal from './ConfirmationModal';

const ApplicationForm = () => {
  const [errors, setErrors] = useState({});
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [additionalSubject, setAdditionalSubject] = useState("");
  const [showCorrespondenceAddress, setShowCorrespondenceAddress] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [additionalSubjectMarks, setAdditionalSubjectMarks] = useState("");
  const [otherSubject, setOtherSubject] = useState('');
  const [otherSubjectError, setOtherSubjectError] = useState('');
  const [showOtherCategory, setShowOtherCategory] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false); 
  const [isLoading, setIsLoading] = useState(false); 
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false); 


    const [formData, setFormData] = useState(() => {
        const savedFormData = localStorage.getItem('formData');
        return savedFormData ? JSON.parse(savedFormData) : {

        firstName: "",
        lastName: "",
        contactNumber: "",
        email: "",
        gender: "Female",
        studentPhoto: null,
        studentPhotoName: "",
        fathersFirstName: "",
        fathersLastName: "",
        fathersOccupation: "",
        mothersFirstName: "",
        mothersLastName: "",
        mothersOccupation: "",
        presentAddressLine1: "",
        presentAddressLine2: "",
        presentCity: "",
        presentState: "",
        presentPostalCode: "",
        presentCountry: "India", 
        correspondenceAddressLine1: "",
        correspondenceAddressLine2: "",
        correspondenceCity: "",
        correspondenceState: "",
        correspondencePostalCode: "",
        correspondenceCountry: "", 
        guardianName: "",
        guardianRelationship: "",
        guardianContactNumber: "",
        guardianResidentialAddress: "",
        guardianOfficialAddress: "",
        religion: "",
        nationality: "",
        maritalStatus: "Unmarried",
        dob: new Date(),
        category: "General",
        class10SchoolName: "",
        class10BoardName: "",
        class10Year: "",
        class10Percentage: "",
        class10Subjects: Array(5).fill(""), 
        class10Marks: Array(5).fill(""), 
        class12SchoolName: "",
        class12BoardName: "",
        class12Year: "",
        class12Subjects: ["English", "", "", "", ""], 
        class12Marks: ["", "", "", "", ""], 
        additionalSubject: "",
        additionalSubjectMarks: "",
        class12Percentage: "",
        class10Certificate: null,
        class10CertificateName: "", 
        class12MarkSheet: null,
        class12MarkSheetName: "",
        academicSportsDistinction: "",
        informationAffirmation: false,
    };
});

 

    useEffect(() => {
        localStorage.setItem('formData', JSON.stringify(formData));
    }, [formData]);


    const handlePreview = () => {
        setIsPreviewModalOpen(true);
      };
    
      const closePreviewModal = () => {
        setIsPreviewModalOpen(false);
      };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value
        }));
    
        const updatedFormData = {
            ...formData,
            [name]: value
        };
        const newErrors = FormValidation(updatedFormData);
    
        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: newErrors[name]
        }));
    };

    const formatDate = (date) => {
        if (!(date instanceof Date)) {
          date = new Date(date);
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
    const handleDateChange = (date) => {
        setFormData(prevFormData => ({
            ...prevFormData,
            dob: date
        }));
        setShowCalendar(false);
    
        const updatedFormData = { ...formData, dob: date };
        const newErrors = FormValidation(updatedFormData);
        setErrors(prevErrors => ({
            ...prevErrors,
            dob: newErrors.dob
        }));
    };
       
    const toggleCalendar = () => {
        setShowCalendar(!showCalendar);
    };
    
    const handleBlur = (e) => {
        const { name, value } = e.target;
        const updatedFormData = {
            ...formData,
            [name]: value
        };
        const newErrors = FormValidation(updatedFormData);
    
        setErrors(prevErrors => ({
            ...prevErrors,
            [name]: newErrors[name]
        }));
    
        if (name === 'additionalSubjectMarks') {
            handleAdditionalSubjectMarksBlur(e);
        }
    };
    
    
    
    
            // Function to handle file changes
            const handleFileChange = (e) => {
                const { name, files } = e.target;
                if (files.length > 0) {
                    const file = files[0];
                    const isImage = file.type.startsWith("image/");
                    const isPDF = file.type === "application/pdf";
            
                    if ((name === "studentPhoto" && isImage) || (name !== "studentPhoto" && isPDF)) {
                        if (file.size <= 204800) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                setFormData(prevFormData => ({
                                    ...prevFormData,
                                    [name]: file,
                                    [`${name}Name`]: file.name,
                                }));
                                if (isImage) {
                                    setImagePreviewUrl(reader.result);
                                }
                            };
                            reader.readAsDataURL(file);
                        } else {
                            alert("File size exceeds the maximum limit of 200KB.");
                        }
                    } else {
                        alert(`Invalid file format for ${name}. Accepted formats: ${name === "studentPhoto" ? "JPG/JPEG" : "PDF"} only.`);
                    }
                }
            };
            

        const handleDragOver = (e) => {
            e.preventDefault();
            setIsDragging(true);
        };

        const handleDrop = (e, fileType) => {
            e.preventDefault();
            setIsDragging(false);
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                const isImage = file.type.startsWith("image/");
                const isPDF = file.type === "application/pdf";
        
                if ((fileType === "studentPhoto" && isImage) || (fileType !== "studentPhoto" && isPDF)) {
                    if (file.size <= 204800) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            setFormData(prevFormData => ({
                                ...prevFormData,
                                [fileType]: file,
                                [`${fileType}Name`]: file.name,
                            }));
                            if (isImage) {
                                setImagePreviewUrl(reader.result);
                            }
                        };
                        reader.readAsDataURL(file);
                    } else {
                        alert("File size exceeds the maximum limit of 200KB.");
                    }
                } else {
                    alert(`Invalid file format for ${fileType}. Accepted formats: ${fileType === "studentPhoto" ? "JPG/JPEG" : "PDF"} only.`);
                }
            }
        };
        
        const handleCategoryChange = (e) => {
            const { name, value } = e.target;
            setFormData(prevFormData => ({
                ...prevFormData,
                [name]: value,
                otherCategory: value === 'Others' ? prevFormData.otherCategory : ''
            }));
            if (value === 'Others') {
                setShowOtherCategory(true);
            } else {
                setShowOtherCategory(false);
            }
        };
        
    const handleDelete = () => {
        setFormData({ ...formData, studentPhoto: null});
        setImagePreviewUrl(null);
        setFileUploaded(false);
    };

    const navigate = useNavigate();
    const { addSubmission } = useContext(DataContext);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true); 
    
        let updatedFormData = { ...formData };
    
        updatedFormData.dob = formatDate(updatedFormData.dob);
    
        // If the category is "Others", replace it with the actual specified category
        if (formData.category === 'Others') {
            updatedFormData.category = formData.otherCategory;
        }
    
        // If the fifth subject is "other", replace it with the actual subject name
        if (updatedFormData.class12Subjects[4] === "other") {
            updatedFormData.class12Subjects[4] = otherSubject;
        }
    
        // Convert formData arrays to strings for database storage
        const class10SubjectsString = updatedFormData.class10Subjects.join(',');
        const class10MarksString = updatedFormData.class10Marks.join(',');
        const class12SubjectsString = updatedFormData.class12Subjects.join(',');
        const class12MarksString = updatedFormData.class12Marks.join(',');
    
        // Perform validation with the original array structures
        const validationErrors = FormValidation({
            ...updatedFormData,
            class10Subjects: updatedFormData.class10Subjects,
            class10Marks: updatedFormData.class10Marks,
            class12Subjects: updatedFormData.class12Subjects,
            class12Marks: updatedFormData.class12Marks,
        }, showCorrespondenceAddress);
    
        if (!updatedFormData.informationAffirmation) {
            validationErrors.informationAffirmation = "You must affirm the information to submit the form.";
        }
    
        setErrors(validationErrors);
    
        if (Object.keys(validationErrors).length > 0) {
            const firstErrorKey = Object.keys(validationErrors).find(key => validationErrors[key]);
            const errorElement = document.querySelector(`[name="${firstErrorKey}"]`);
    
            if (errorElement) {
                errorElement.focus();
            }
    
            console.log('Validation errors:', validationErrors);
            alert('Please correct the errors before submitting.');
            setIsLoading(false); // Set loading to false if there are validation errors
            return;
        }
    
        // Convert current date and time to IST and format it correctly
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
        const istDate = new Date(now.getTime() + istOffset);
        const year = istDate.getUTCFullYear();
        const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(istDate.getUTCDate()).padStart(2, '0');
        const hours = String(istDate.getUTCHours()).padStart(2, '0');
        const minutes = String(istDate.getUTCMinutes()).padStart(2, '0');
        const seconds = String(istDate.getUTCSeconds()).padStart(2, '0');
        const formattedISTDateForMySQL = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    
        // Update form data with stringified arrays for database storage
        updatedFormData = {
            ...updatedFormData,
            class10Subjects: class10SubjectsString,
            class10Marks: class10MarksString,
            class12Subjects: class12SubjectsString,
            class12Marks: class12MarksString,
            submissionDate: formattedISTDateForMySQL,
        };
    
        // Remove unnecessary fields
        delete updatedFormData.otherSubject;
    
        // Create form data to send
        const formDataToSend = new FormData();
        for (const key in updatedFormData) {
            if (updatedFormData.hasOwnProperty(key) && key !== 'informationAffirmation' && key !== 'otherCategory') {
                if (key === 'studentPhoto' || key === 'class10Certificate' || key === 'class12MarkSheet') {
                    if (updatedFormData[key] instanceof File) {
                        formDataToSend.append(key, updatedFormData[key], updatedFormData[key].name);
                        formDataToSend.append(`${key}Name`, updatedFormData[key].name);
                    }
                } else {
                    if (showCorrespondenceAddress || !key.startsWith('correspondence')) {
                        formDataToSend.append(key, updatedFormData[key]);
                    }
                }
            }
        }
    
        fetch('http://192.168.0.111:3001/submit-application', {
            method: 'POST',
            body: formDataToSend
        })
        .then(response => response.json())
        .then(data => {
            console.log('Submission successful:', data);
            setIsLoading(false); 
            setConfirmationMessage('Your details have been successfully submitted. Thanks!');
            setIsConfirmationModalOpen(true); 
        })
        .catch(error => {
            console.error('Error submitting form:', error);
            setIsLoading(false); 
            setConfirmationMessage('Error submitting form');
            setIsConfirmationModalOpen(true); 
        });
    };
         
        const handleImageRemove = () => {
            setFormData(prevFormData => ({
                ...prevFormData,
                studentPhoto: null,
                studentPhotoName: ""
            }));
            setImagePreviewUrl(null);
        };


    const showGuardianFields = formData.guardianName.length > 0;

    const toggleCorrespondenceAddress = (e) => {
        const isChecked = e.target.checked;
        setShowCorrespondenceAddress(!isChecked);
    
        if (isChecked) {
            setFormData(prevFormData => ({
                ...prevFormData,
                correspondenceAddressLine1: "",
                correspondenceAddressLine2: "",
                correspondenceCity: "",
                correspondenceState: "",
                correspondencePostalCode: "",
                correspondenceCountry: "India"
            }));
        }
    };
    

    const class12Subjects = [
        "Physics",
        "Chemistry",
        "Biology",
        "Mathematics",
        "Commerce",
        "Accountancy",
        "Economics",
        "English",
        "Business Studies",
        "Computer Science",
        "Informatics Practice",
        "Word Processing",
        "Multimedia",
        "History",
        "Geography",
        "Civics Sociology",
        "Psychology",
        "Political Science",
        "Home Science",
    ];      
        
        const handleClass10Change = (e, index) => {
            const { name, value } = e.target;
            let newErrors = { ...errors };
            newErrors.class10Subjects = newErrors.class10Subjects || Array(5).fill("");
            newErrors.class10Marks = newErrors.class10Marks || Array(5).fill("");
        
            if (name.startsWith("class10Subjects")) {
                const updatedSubjects = [...formData.class10Subjects];
                updatedSubjects[index] = value;
                setFormData({ ...formData, class10Subjects: updatedSubjects });
        
                // Clear the error if the input is valid
                if (value.trim()) {
                    newErrors.class10Subjects[index] = "";
                } else {
                    newErrors.class10Subjects[index] = `Subject ${index + 1} is required`;
                }
            } else if (name.startsWith("class10Marks")) {
                const updatedMarks = [...formData.class10Marks];
                updatedMarks[index] = value;
                setFormData({ ...formData, class10Marks: updatedMarks });
        
                // Clear the error if the input is valid
                if (value && !isNaN(Number(value)) && Number(value) >= 0 && Number(value) <= 100) {
                    newErrors.class10Marks[index] = "";
                } else {
                    newErrors.class10Marks[index] = !value ? `Marks for Subject ${index + 1} are required` :
                        isNaN(Number(value)) || Number(value) < 0 || Number(value) > 100 ? `Marks for Subject ${index + 1} must be between 0 and 100` : '';
                }
            }
        
            setErrors(newErrors);
        };
        
        const handleClass10Blur = (e, index) => {
            const { name, value } = e.target;
            let newErrors = { ...errors };
            newErrors.class10Subjects = newErrors.class10Subjects || Array(5).fill("");
            newErrors.class10Marks = newErrors.class10Marks || Array(5).fill("");
        
            if (name.startsWith("class10Subjects")) {
                newErrors.class10Subjects[index] = value.trim() ? '' : `Subject ${index + 1} is required`;
            } else if (name.startsWith("class10Marks")) {
                newErrors.class10Marks[index] = !value ? `Marks for Subject ${index + 1} are required` :
                    isNaN(Number(value)) || Number(value) < 0 || Number(value) > 100 ? `Marks for Subject ${index + 1} must be between 0 and 100` : '';
            }
        
            setErrors(newErrors);
        };
        
        
        
        const handleClass12SubjectChange = (e, index) => {
            const newSubjects = [...formData.class12Subjects];
            const selectedSubject = e.target.value;
        
            if (selectedSubject === "other" && index === 4) {
                setOtherSubject('');
            }
            newSubjects[index] = selectedSubject;
        
            setFormData({
                ...formData,
                class12Subjects: newSubjects
            });
        };
        
        const renderClass12SubjectFields = () => {
            return formData.class12Subjects.slice(0, 5).map((subject, index) => (
                <div className="subject-row" key={`class12-subject-${index}`}>
                    <label style={{ marginRight: "12px" }} htmlFor={`class12Subject-${index}`}>
                        Subject {index + 1}
                    </label>
                    <select
                        id={`class12Subject-${index}`}
                        name={`class12Subjects[${index}]`}
                        value={subject}
                        onChange={(e) => handleClass12SubjectChange(e, index)}
                        onBlur={(e) => handleClass12Blur(e, index)}
                        style={{ width: "20em", marginRight: "20px", opacity: '1' }}
                        required={index === 0}
                        disabled={index === 0} // Disable the first subject dropdown
                    >
                        {index === 0 ? (
                            <option value="English">English</option> // Only option for the first subject
                        ) : (
                            <>
                                <option value="">Select Subject</option>
                                {class12Subjects.filter(s => !formData.class12Subjects.includes(s) || s === subject).map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                                {index === 4 && <option value="other">Any other subject</option>}
                            </>
                        )}
                    </select>
                    {subject && (
                        <>
                            {index === 4 && subject === "other" && (
                                <>
                                    <input
                                        type="text"
                                        placeholder="Enter subject name"
                                        value={otherSubject}
                                        onChange={(e) => handleOtherSubjectChange(e)}
                                        onBlur={(e) => handleClass12Blur(e, index)}
                                        style={{ width: "15em", marginRight: "12px" }}
                                    />
                                    {otherSubjectError && (
                                        <p className="error-text">{otherSubjectError}</p>
                                    )}
                                </>
                            )}
                            <label style={{ marginRight: "12px" }} htmlFor={`class12Marks-${index}`}>
                                {`Subject ${index + 1} Marks`}
                            </label>
                            <input
                                type="number"
                                id={`class12Marks-${index}`}
                                name={`class12Marks[${index}]`}
                                value={formData.class12Marks[index]}
                                onChange={(e) => handleClass12MarksChange(e, index)}
                                onBlur={(e) => handleClass12Blur(e, index)}
                                style={{ width: "9em", marginRight: "15px" }}
                                required={subject !== ""}
                            />
                            {errors[`class12Marks[${index}]`] && (
                                <p className="error-text">{errors[`class12Marks[${index}]`]}</p>
                            )}
                        </>
                    )}
                </div>
            ));
        };

        const handleOtherSubjectChange = (e) => {
            const inputSubject = e.target.value; // Keep the original case and trim any whitespace
            setOtherSubject(inputSubject); // Maintain the original input in state for display
            
            const trimmedInput = inputSubject.trim(); // Trim spaces for the duplicate check
            
            if (trimmedInput.length === 0) {
                setOtherSubjectError('');
                return;
            }
        
            const isDuplicate = formData.class12Subjects
                .slice(0, 4) // Check only the first four subjects
                .some(subject => subject.toLowerCase() === trimmedInput.toLowerCase());
        
            if (isDuplicate) {
                setOtherSubjectError("Subject Already Selected Above. Please fill any other Subject.");
            } else {
                setOtherSubjectError('');
            }
        };
        
        const handleClass12MarksChange = (e, index) => {
            const updatedMarks = [...formData.class12Marks];
            updatedMarks[index] = e.target.value;
            setFormData({ ...formData, class12Marks: updatedMarks });
        
            setErrors(prevErrors => ({
                ...prevErrors,
                [`class12Marks[${index}]`]: ""
            }));
        };
        
        const handleClass12Blur = (e, index) => {
            const { value } = e.target;
            let error = "";
        
            if (!value) {
                error = `Marks for Subject ${index + 1} are required`;
            } else if (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 100) {
                error = `Marks for Subject ${index + 1} must be between 0 and 100`;
            }
        
            setErrors(prevErrors => ({
                ...prevErrors,
                [`class12Marks[${index}]`]: error
            }));
        };
        
        
    
        const handleAdditionalSubjectChange = (e) => {
            const inputSubject = e.target.value.trim(); 
        
            setFormData(prevFormData => ({
                ...prevFormData,
                additionalSubject: inputSubject
            }));
        
            const isDuplicate = formData.class12Subjects.some(
                subject => subject.toLowerCase() === inputSubject.toLowerCase()
            );
        
            if (isDuplicate && inputSubject) {
                setErrors(prevErrors => ({
                    ...prevErrors,
                    additionalSubject: "Subject Already Selected Above. Please fill any other Subject."
                }));
            } else {
                setErrors(prevErrors => ({
                    ...prevErrors,
                    additionalSubject: ""
                }));
            }
        }; 
        
        const handleAdditionalSubjectMarksChange = (e) => {
            const { value } = e.target;
        
            setFormData(prevFormData => ({
                ...prevFormData,
                additionalSubjectMarks: value
            }));
        
            handleAdditionalSubjectMarksBlur(e); // Trigger validation on change
        };

        const handleAdditionalSubjectMarksBlur = (e) => {
            const { value } = e.target;
            const updatedFormData = {
                ...formData,
                additionalSubjectMarks: value
            };
            const newErrors = FormValidation(updatedFormData);
        
            setErrors(prevErrors => ({
                ...prevErrors,
                additionalSubjectMarks: newErrors.additionalSubjectMarks
            }));
        };
        
        
        
    return (
        <form onSubmit={handleSubmit} className="application-form" encType="multipart/form-data" style={{border: '1px solid black', borderRadius: '0'}}>
            <header className="form-header">
                <div className="header-content">
                    <h1>School of Nursing Admission Test</h1>
                </div>
                <p>
                    Application for Admissions (General Nursing & Midwifery Course
                    2024)
                </p>
            </header>
            <div className="form-section">
                <div className="multi-input-group">
                    <div className="input-with-label">
                        <label htmlFor="firstName">First Name</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="First Name"
                            className={errors.firstName ? 'error-input' : ''}
                        />
                        {errors.firstName && <p className="error-text">{errors.firstName}</p>}
                    </div>
                    <div className="input-with-label">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Last Name"
                            className={errors.lastName ? 'error-input' : ''}
                            />
                            {errors.lastName && <p className="error-text">{errors.lastName}</p>}
                    </div>
                    <div className="input-with-label">
                        <label htmlFor="contactNumber">Contact Number</label>
                        <input
                            type="tel"
                            id="contactNumber"
                            name="contactNumber"
                            value={formData.contactNumber}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Phone"
                            style={{marginTop: '7px'}}
                            className={errors.contactNumber ? 'input-error' : ''}
                            />
                            {errors.contactNumber && <p className="error-text">{errors.contactNumber}</p>}
                    </div>
                </div>
            </div>

            <div className="form-section">
                <div className="multi-input-group">
                    <div className="input-with-label">
                        <label htmlFor="gender">Gender</label>
                        <select
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                        >
                            <option value="">Select your Gender</option>
                            <option value="Female">Female</option>
                            
                        </select>
                        {formData.gender === "" && (
                            <p className="gender-note">
                                Only female candidates can apply.
                            </p>
                        )}
                    </div>
                    <div className="input-with-label">
                        <label htmlFor="email">Email ID</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Your Email Address"
                            className={errors.email ? 'input-error' : ''}
                            />
                            {errors.email && <p className="error-text">{errors.email}</p>}
                    </div>
                </div>
            </div>

            <div className="input-group photo-upload">
            <label htmlFor="studentPhoto">
                Student Passport Size Photograph *
            </label>
            <div className={`file-upload-wrapper ${isDragging ? "dragging" : ""}`} onDragOver={handleDragOver} onDragLeave={() => setIsDragging(false)} onDrop={(e) => handleDrop(e, "studentPhoto")}>
                <button type="button" onClick={() => document.getElementById("studentPhoto").click()} className="upload-button">
                    {formData.studentPhotoName || "Upload image"}
                </button>
                {isDragging && (
                    <span className="drag-text">Release to upload the image</span>
                )}
                <input
                    type="file"
                    id="studentPhoto"
                    name="studentPhoto"
                    className="file-input"
                    onChange={handleFileChange}
                    accept=".jpg, .jpeg"
                    required
                />

                {imagePreviewUrl && (
                    <div className="image-preview-container">
                        <img
                            src={imagePreviewUrl}
                            alt="Student Passport Size"
                            className="passport-photo-preview"
                        />
                            <img
                                src={quitIcon}
                                alt="Remove"
                                className="remove-image-button"
                                style={{display: 'none'}}
                            />
                    </div>
                )}
            </div>
            <p className="file-size-info">
                Maximum Size 200 KB. Accepted formats: JPG/JPEG only.
            </p>
        </div>

            <div className="form-section">
                <div className="multi-input-group">
                    <div className="input-with-label">
                        <label htmlFor="fathersFirstName">Father's Name *</label>
                        <input
                            type="text"
                            id="fathersFirstName"
                            name="fathersFirstName"
                            placeholder="Father's First Name"
                            value={formData.fathersFirstName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={errors.fathersFirstName ? 'input-error' : ''}
                            />
                            {errors.fathersFirstName && <p className="error-text">{errors.fathersFirstName}</p>}
                    </div>
                    <div className="input-with-label">
                        <label htmlFor="fathersLastName">&nbsp;</label>
                        <input
                            type="text"
                            id="fathersLastName"
                            name="fathersLastName"
                            placeholder="Father's Last Name"
                            value={formData.fathersLastName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={errors.fathersLastName ? 'input-error' : ''}
                            />
                            {errors.fathersLastName && <p className="error-text">{errors.fathersLastName}</p>}
                    </div>
                    <div className="input-with-label">
                        <label htmlFor="fathersOccupation">Occupation *</label>
                        <input
                            type="text"
                            id="fathersOccupation"
                            name="fathersOccupation"
                            placeholder="Father's Occupation"
                            value={formData.fathersOccupation}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={errors.fathersOccupation ? 'input-error' : ''}
                            />
                            {errors.fathersOccupation && <p className="error-text">{errors.fathersOccupation}</p>}
                    </div>
                </div>
            </div>
            <div className="form-section">
                <div className="multi-input-group">
                    <div className="input-with-label">
                        <label htmlFor="mothersFirstName">Mother's Name *</label>
                        <input
                            type="text"
                            id="mothersFirstName"
                            name="mothersFirstName"
                            placeholder="Mother's First Name"
                            value={formData.mothersFirstName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={errors.mothersFirstName ? 'input-error' : ''}
                            />
                            {errors.mothersFirstName && <p className="error-text">{errors.mothersFirstName}</p>}
                    </div>
                    <div className="input-with-label">
                        <label htmlFor="mothersLastName">&nbsp;</label>
                        <input
                            type="text"
                            id="mothersLastName"
                            name="mothersLastName"
                            placeholder="Mother's Last Name"
                            value={formData.mothersLastName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={errors.mothersLastName ? 'input-error' : ''}
                            />
                            {errors.mothersLastName && <p className="error-text">{errors.mothersLastName}</p>}
                    </div>
                    <div className="input-with-label">
                        <label htmlFor="mothersOccupation">Occupation *</label>
                        <input
                            type="text"
                            id="mothersOccupation"
                            name="mothersOccupation"
                            placeholder="Mother's Occupation"
                            value={formData.mothersOccupation}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={errors.mothersOccupation ? 'input-error' : ''}
                            />
                            {errors.mothersOccupation && <p className="error-text">{errors.mothersOccupation}</p>}
                    </div>
                </div>
            </div>
            <hr />
            <div className="form-section">
                <div className="address-title">
                    <label>Present Address *</label>
                </div>
                <div className="multi-input-group-2">
                    <div className="input-with-label-2">
                        <input
                            type="text"
                            id="presentAddressLine1"
                            name="presentAddressLine1"
                            value={formData.presentAddressLine1}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Address Line 1"
                            style={{ width: "96%", marginBottom: "23px" }}
                            className={errors.presentAddressLine1 ? 'input-error' : ''}
                            />
                            {errors.presentAddressLine1 && <p className="error-text">{errors.presentAddressLine1}</p>}
                    </div>
                    <div className="input-with-label-2">
                        <input
                            type="text"
                            id="presentAddressLine2"
                            name="presentAddressLine2"
                            value={formData.presentAddressLine2}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Address Line 2"
                            style={{ width: "96%", marginBottom: "10px" }}
                        />
                    </div>
                    <div className="input-with-label">
                        <label htmlFor="presentCity"></label>
                        <input
                            type="text"
                            id="presentCity"
                            name="presentCity"
                            value={formData.presentCity}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="City"
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                width: "10em",
                            }}
                            className={errors.presentCity ? 'input-error' : ''}
                            />
                            {errors.presentCity && <p className="error-text">{errors.presentCity}</p>}
                    </div>
                    <div className="input-with-label">
                        <label htmlFor="presentState"></label>
                        <input
                            type="text"
                            id="presentState"
                            name="presentState"
                            value={formData.presentState}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="State / Province / Region"
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                width: "12em",
                            }}
                            className={errors.presentState ? 'input-error' : ''}
                            />
                            {errors.presentState && <p className="error-text">{errors.presentState}</p>}
                    </div>
                    <div className="input-with-label">
                        <label htmlFor="presentPostalCode"></label>
                        <input
                            type="text"
                            id="presentPostalCode"
                            name="presentPostalCode"
                            value={formData.presentPostalCode}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Postal / Zip Code"
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                width: "10em",
                            }}
                            className={errors.presentPostalCode ? 'input-error' : ''}
                        />
                        {errors.presentPostalCode && <p className="error-text">{errors.presentPostalCode}</p>}
                    </div>
                    <div className="input-with-label">
                        <label htmlFor="presentCountry"></label>
                        <select
                            id="presentCountry"
                            name="presentCountry"
                            value={formData.presentCountry}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                width: "12em",
                                marginTop: '9px'
                            }}
                            required
                        >
                            {countries.map((country, index) => (
                                <option key={index} value={country}>
                                    {country}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="form-section">
                {showCorrespondenceAddress && (
                    <>
                        <div className="address-title">
                            <label>Correspondence Address </label>
                        </div>
                        <div className="multi-input-group-2">
                            <div className="input-with-label-2">
                                <input
                                    type="text"
                                    id="correspondenceAddressLine1"
                                    name="correspondenceAddressLine1"
                                    value={formData.correspondenceAddressLine1}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="Address Line 1"
                                    style={{ width: "96%", marginBottom: "5px" }}
                                />
                            </div>
                            <div className="input-with-label-2">
                                <input
                                    type="text"
                                    id="correspondenceAddressLine2"
                                    name="correspondenceAddressLine2"
                                    value={formData.correspondenceAddressLine2}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="Address Line 2"
                                    style={{ width: "96%", marginBottom: "10px" }}
                                />
                            </div>
                            <div className="input-with-label">
                                <label htmlFor="correspondenceCity"></label>
                                <input
                                    type="text"
                                    id="correspondenceCity"
                                    name="correspondenceCity"
                                    value={formData.correspondenceCity}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="City"
                                    style={{ display: "flex", flexDirection: "column", width: "10em" }}
                                    className={errors.correspondenceCity ? 'input-error' : ''}
                                />
                                {errors.correspondenceCity && <p className="error-text">{errors.correspondenceCity}</p>}
                            </div>
                            <div className="input-with-label">
                                <label htmlFor="correspondenceState"></label>
                                <input
                                    type="text"
                                    id="correspondenceState"
                                    name="correspondenceState"
                                    value={formData.correspondenceState}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="State / Province / Region"
                                    style={{ display: "flex", flexDirection: "column", width: "12em" }}
                                    className={errors.correspondenceState ? 'input-error' : ''}
                                />
                                {errors.correspondenceState && <p className="error-text">{errors.correspondenceState}</p>}
                            </div>
                            <div className="input-with-label">
                                <label htmlFor="correspondencePostalCode"></label>
                                <input
                                    type="text"
                                    id="correspondencePostalCode"
                                    name="correspondencePostalCode"
                                    value={formData.correspondencePostalCode}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="Postal / Zip Code"
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        width: "10em",
                                    }}
                                    className={errors.correspondencePostalCode ? 'input-error' : ''}
                                />
                                {errors.correspondencePostalCode && <p className="error-text">{errors.correspondencePostalCode}</p>}
                            </div>
                            <div className="input-with-label">
                                <label htmlFor="correspondenceCountry"></label>
                                <select
                                    id="correspondenceCountry"
                                    name="correspondenceCountry"
                                    value={formData.correspondenceCountry}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    style={{ display: "flex", flexDirection: "column", width: "12em", marginTop: '9px' }}
                                    required
                                >
                                    {countries.map((country, index) => (
                                        <option key={index} value={country}>
                                            {country}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </>
                )}
                <div className="checkbox-container" style={{ marginTop: "10px" }}>
                    <input
                        type="checkbox"
                        id="sameAsPresent"
                        onChange={toggleCorrespondenceAddress}
                        style={{width: '3%'}}
                    />
                    <label htmlFor="sameAsPresent">Same as Present Address</label>
                </div>
            </div>
            <br/>
            <hr />
            {/* Guardian Information Section */}
            <div className="form-section">
                <div className="address-title">
                    <label>
                        Information about Local Guardians (If family is not residing
                        in Delhi/NCR)
                    </label>
                </div>
                <br />
                {/* Guardian Name, Relationship, Contact Number */}
                <div className="input-row-guardian">
                    <div className="input-with-label-guardian">
                        <label htmlFor="guardianName">Guardian Name </label>
                        <input
                            type="text"
                            id="guardianName"
                            name="guardianName"
                            value={formData.guardianName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Name of the Guardian"
                            style={{ display: "flex", flexDirection: "column" }}
                        />
                    </div>
                    {showGuardianFields && (
                        <>
                            <div className="input-with-label-guardian">
                                <label htmlFor="guardianRelationship">
                                    Relationship *
                                </label>
                                <input
                                    type="text"
                                    id="guardianRelationship"
                                    name="guardianRelationship"
                                    value={formData.guardianRelationship}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="Relationship with the candidate"
                                    style={{ width: "17em" }}
                                    className={errors.guardianRelationship ? 'input-error' : ''}
                                    />
                                    {errors.guardianRelationship && <p className="error-text">{errors.guardianRelationship}</p>}
                            </div>
                            <div className="input-with-label-guardian">
                                <label htmlFor="guardianContactNumber">
                                    Contact No. *
                                </label>
                                <input
                                    type="tel"
                                    id="guardianContactNumber"
                                    name="guardianContactNumber"
                                    value={formData.guardianContactNumber}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="Contact Number"
                                    style={{marginTop: '7px'}}
                                    className={errors.guardianContactNumber ? 'input-error' : ''}
                                    />
                                    {errors.guardianContactNumber && <p className="error-text">{errors.guardianContactNumber}</p>}
                            </div>
                        </>
                    )}
                </div>

                {/* Guardian's Residential and Official Addresses */}
                {showGuardianFields && (
                    <div className="input-row-guardian-address">
                        <div className="input-with-label-guardian-address">
                            <label htmlFor="guardianResidentialAddress">
                                Guardian’s Residential Address *
                            </label>
                            <input
                                type="text"
                                id="guardianResidentialAddress"
                                name="guardianResidentialAddress"
                                value={formData.guardianResidentialAddress}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Enter the Guardian's Residential Address"
                                style={{ width: "22em" }}
                                className={errors.guardianResidentialAddress ? 'input-error' : ''}
                            />
                            {errors.guardianResidentialAddress && <p className="error-text">{errors.guardianResidentialAddress}</p>}
                        </div>
                        <div className="input-with-label-guardian-address">
                            <label htmlFor="guardianOfficialAddress">
                                Guardian’s Official Address *
                            </label>
                            <input
                                type="text"
                                id="guardianOfficialAddress"
                                name="guardianOfficialAddress"
                                value={formData.guardianOfficialAddress}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Enter the Guardian's Official Address"
                                style={{ width: "22em" }}
                                className={errors.guardianOfficialAddress ? 'input-error' : ''}
                                />
                                {errors.guardianOfficialAddress && <p className="error-text">{errors.guardianOfficialAddress}</p>}
                        </div>
                    </div>
                )}
            </div>

            <hr />
            <div className="form-section">
                <div className="form-row-custom">
                    <div className="input-group-custom">
                        <label htmlFor="religion">Religion</label>
                        <input
                            type="text"
                            id="religion"
                            name="religion"
                            value={formData.religion}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Enter your religion"
                            style={{ width: "23em" }}
                        />
                    </div>
                    <div className="input-group-custom">
                        <label htmlFor="nationality">Nationality *</label>
                        <input
                            type="text"
                            id="nationality"
                            name="nationality"
                            value={formData.nationality}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Enter your nationality"
                            style={{ width: "23em" }}
                            className={errors.nationality ? 'input-error' : ''}
                            />
                            {errors.nationality && <p className="error-text">{errors.nationality}</p>}
                    </div>
                </div>

                <div className="form-row-custom">
                    <div className="input-group-custom">
                        <label>Marital Status</label>
                        <div className="radio-group-custom">
                            <label className="container">
                                Married
                                <input
                                    type="radio"
                                    id="married"
                                    name="maritalStatus"
                                    value="Married"
                                    checked={formData.maritalStatus === "Married"}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <span className="checkmark"></span>
                            </label>

                            <label className="container">
                                Unmarried
                                <input
                                    type="radio"
                                    id="unmarried"
                                    name="maritalStatus"
                                    value="Unmarried"
                                    checked={formData.maritalStatus === "Unmarried"}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                                <span className="checkmark"></span>
                            </label>
                        </div>
                    </div>
                    <div className="input-group-custom">
                        <label htmlFor="dob">Date Of Birth *</label>
                        <div className={`date-picker-container ${errors.dob ? 'input-error' : ''}`}>
                        <input
                                type="text"
                                value={formData.dob ? formatDate(formData.dob) : ''}
                                readOnly
                                onClick={toggleCalendar}
                                className={`date-input ${errors.dob ? 'input-error' : ''}`}
                            />
                            <FaCalendarAlt onClick={toggleCalendar} className="calendar-icon" />
                            {showCalendar && (
                                <div className="calendar-popup">
                                    <Calendar
                                        onChange={handleDateChange}
                                        value={formData.dob}
                                    />
                                </div>
                            )}
                        </div>
                        {errors.dob && <p className="error-text">{errors.dob}</p>}
                    </div>
                </div>

                <div className="form-row-custom">
        <div className="input-group-custom">
            <label htmlFor="category">Category *</label>
            <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleCategoryChange}
                onBlur={handleBlur}
                required
            >
                <option value="General">General</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="OBC">OBC</option>
                <option value="Others">Others</option>
            </select>
        </div>
        {showOtherCategory && (
            <div className="input-group-custom">
                <label htmlFor="otherCategory">Please specify</label>
                <input
                    type="text"
                    id="otherCategory"
                    name="otherCategory"
                    value={formData.otherCategory || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    style={{marginTop: "0px", padding: '14px'}}
                    placeholder="Specify your category"
                    className={errors.otherCategory ? 'input-error' : ''}
                />
                {errors.otherCategory && <p className="error-text">{errors.otherCategory}</p>}
            </div>
        )}
                </div>
            </div>
            <div className="form-section unique-class10-details">
                <h3 style={{ textAlign: "center" }}>Educational Qualifications</h3>
                <h3 style={{ textAlign: "center" }}>Class 10th Details</h3>
                <div className="class10-inputs">
                    <div className="input-group unique-input-group">
                        <label htmlFor="class10SchoolName">School Name *</label>
                        <input
                            type="text"
                            id="class10SchoolName"
                            name="class10SchoolName"
                            value={formData.class10SchoolName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            style={{ width: "15em" }}
                            className={errors.class10SchoolName ? 'input-error' : ''}
                        />
                        {errors.class10SchoolName && <p className="error-text">{errors.class10SchoolName}</p>}
                    </div>
                    <div className="input-group unique-input-group">
                        <label htmlFor="class10BoardName">Board Name *</label>
                        <input
                            type="text"
                            id="class10BoardName"
                            name="class10BoardName"
                            value={formData.class10BoardName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            style={{ width: "15em" }}
                            className={errors.class10BoardName ? 'input-error' : ''}
                        />
                        {errors.class10BoardName && <p className="error-text">{errors.class10BoardName}</p>}
                    </div>
                    <div className="input-group unique-input-group">
                        <label htmlFor="class10Year">Year of Passing *</label>
                        <input
                            type="text"
                            id="class10Year"
                            name="class10Year"
                            value={formData.class10Year}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            style={{ width: "8em" }}
                            className={errors.class10Year ? 'input-error' : ''}
                        />
                        {errors.class10Year && <p className="error-text">{errors.class10Year}</p>}
                    </div>
                    <div className="input-group unique-input-group">
                        <label htmlFor="class10Percentage">%age in Aggr/CGPA</label>
                        <input
                            type="text"
                            id="class10Percentage"
                            name="class10Percentage"
                            value={formData.class10Percentage}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            style={{ width: "8em" }}
                            className={errors.class10Percentage ? 'input-error' : ''}
                        />
                        {errors.class10Percentage && <p className="error-text">{errors.class10Percentage}</p>}
                    </div>

                    <div className="class10-subjects-row" style={{ display: "flex", flexWrap: "wrap", gap: "10px", width: "100%",justifyContent: 'space-between' }}>
                        {formData.class10Subjects.map((subject, index) => (
                            <div className="input-group" key={`subject-${index}`}>
                                <label htmlFor={`class10Subject${index}`}>
                                    Subject {index + 1} *
                                </label>
                                <input
                                    type="text"
                                    id={`class10Subject${index}`}
                                    name={`class10Subjects[${index}]`}
                                    value={formData.class10Subjects[index]}
                                    onChange={(e) => handleClass10Change(e, index)}
                                    onBlur={(e) => handleClass10Blur(e, index)}
                                    style={{ width: '9em' }}
                                    className={errors.class10Subjects && errors.class10Subjects[index] ? 'input-error' : ''}
                                />
                                {errors.class10Subjects && errors.class10Subjects[index] && <p className="error-text">{errors.class10Subjects[index]}</p>}
                            </div>
                        ))}
                    </div>
                    <div className="class10-marks-row" style={{ display: "flex", flexWrap: "wrap", gap: "10px", width: "100%",justifyContent: 'space-between' }}>
                        {formData.class10Subjects.map((subject, index) => subject && (
                            <div className="input-group" key={`marks-${index}`}>
                                <label htmlFor={`class10Marks${index}`}>
                                    Subject {index + 1} Marks *
                                </label>
                                <input
                                    type="number"
                                    id={`class10Marks${index}`}
                                    name={`class10Marks[${index}]`}
                                    value={formData.class10Marks[index]}
                                    onChange={(e) => handleClass10Change(e, index)}
                                    onBlur={(e) => handleClass10Blur(e, index)}
                                    style={{ width: "9em" }}
                                    className={errors.class10Marks && errors.class10Marks[index] ? 'input-error' : ''}
                                />
                                {errors.class10Marks && errors.class10Marks[index] && <p className="error-text">{errors.class10Marks[index]}</p>}
                            </div>
                        ))}
                    </div>


                </div>
            </div>

            <div className="form-section unique-class12-details">
                <h3 style={{ textAlign: "center" }}>Class 12th Details</h3>
                <div className="class12-inputs">
                    <div className="input-group unique-input-group">
                        <label htmlFor="class12SchoolName">School Name *</label>
                        <input
                            type="text"
                            id="class12SchoolName"
                            name="class12SchoolName"
                            value={formData.class12SchoolName}
                            onChange={handleChange}
                            style={{ width: "15em" }}
                            onBlur={(e) => handleClass12Blur(e, index)}
                            className={errors.class12SchoolName ? 'input-error' : ''}
                            />
                            {errors.class12SchoolName && <p className="error-text">{errors.class12SchoolName}</p>}
                    </div>
                    <div className="input-group unique-input-group">
                        <label htmlFor="class12BoardName">Board Name *</label>
                        <input
                            type="text"
                            id="class12BoardName"
                            name="class12BoardName"
                            value={formData.class12BoardName}
                            onChange={handleChange}
                            style={{ width: "15em" }}
                            className={errors.class12BoardName ? 'input-error' : ''}
                            />
                            {errors.class12BoardName && <p className="error-text">{errors.class12BoardName}</p>}
                    </div>
                    <div className="input-group unique-input-group">
                        <label htmlFor="class12Year">Year of Passing *</label>
                        <input
                            type="text"
                            id="class12Year"
                            name="class12Year"
                            value={formData.class12Year}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            style={{ width: "8em" }}
                            className={errors.class12Year ? 'input-error' : ''}
                        />
                        {errors.class12Year && <p className="error-text">{errors.class12Year}</p>}
                    </div>
                    <div className="input-group unique-input-group">
                        <label htmlFor="class12Percentage">%age in Aggr/CGPA</label>
                        <input
                            type="text"
                            id="class12Percentage"
                            name="class12Percentage"
                            value={formData.class12Percentage}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            style={{ width: "8em" }}
                            className={errors.class12Percentage ? 'input-error' : ''}
                        />
                        {errors.class12Percentage && <p className="error-text">{errors.class12Percentage}</p>}
                    </div>
                </div>
                <div
                    className="class12-subjects-row"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        marginLeft: "-10px",
                    }}
                >
                    {renderClass12SubjectFields()}
                </div>

                <div className="input-group-additional" style={{ display: "flex", flexDirection: "row", marginRight: "12px" }}>
                    <div style={{ width: "20em" }}>
                        <label style={{ marginRight: "12px" }} htmlFor="class12AdditionalSubject">
                            Additional Subject 6
                        </label>
                        <input
                            type="text"
                            id="class12AdditionalSubject"
                            name="additionalSubject"
                            value={formData.additionalSubject}
                            onChange={handleAdditionalSubjectChange} 
                        />
                        {errors.additionalSubject && <p className="error-text">{errors.additionalSubject}</p>}
                    </div>

                    {formData.additionalSubject && (
                        <div style={{ width: "20em" }}>
                            <label style={{ marginRight: "12px" }} htmlFor="class12AdditionalMarks">
                                Additional Subject 6 Marks
                            </label>
                            <input
                                type="number"
                                id="class12AdditionalMarks"
                                name="additionalSubjectMarks"
                                value={formData.additionalSubjectMarks}
                                onChange={handleAdditionalSubjectMarksChange}
                                onBlur={handleAdditionalSubjectMarksBlur}
                                style={{ width: "9em", marginRight: "15px" }}
                            />
                            {errors.additionalSubjectMarks && (
                                <p className="error-text">{errors.additionalSubjectMarks}</p>
                            )}
                        </div>
                    )}
                </div>

              </div>  
            <div className="form-section file-input-group">
                <label htmlFor="10thCertificate">
                    10th Certificate / Date of Birth *
                </label>
                <div className={`file-upload-wrapper ${isDragging ? "dragging" : ""}`} onDragOver={handleDragOver} onDragLeave={() => setIsDragging(false)} onDrop={(e) => handleDrop(e, "class10Certificate")}>
                   <button type="button" onClick={() => document.getElementById("10thCertificate").click()} className="upload-button">
                    {formData.class10CertificateName || "Upload document"}
                        </button>
                    {isDragging && (
                        <span className="drag-text">
                            Release to upload the document
                        </span>
                    )}
                    <input
                        type="file"
                        id="10thCertificate"
                        name="class10Certificate"
                        className="file-input"
                        onChange={(e) => handleFileChange(e, "10thCertificate")}
                        accept=".pdf"
                        required

                    />
                    {formData["10thCertificate"] &&
                        formData["10thCertificate"].type.startsWith("image/") && (
                            <div className="image-preview-container">
                                <img
                                    src={formData["10thCertificate"].preview}
                                    alt="10th Certificate Preview"
                                    className="document-photo-preview"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleImageRemove("10thCertificate")}
                                >
                                    <img
                                        src={quitIcon}
                                        alt="Remove"
                                        className="remove-image-button"
                                    />
                                </button>
                            </div>
                        )}
                </div>
                <p className="file-size-info">
                    Maximum Size 200 KB. Accepted formats: PDF only.
                </p>
            </div>
            <div className="form-section file-input-group">
    <label htmlFor="12thMarkSheet">12th Mark Sheet *</label>
    <div className={`file-upload-wrapper ${isDragging ? "dragging" : ""}`} onDragOver={handleDragOver} onDragLeave={() => setIsDragging(false)} onDrop={(e) => handleDrop(e, "class12MarkSheet")}>
        <button type="button" onClick={() => document.getElementById('12thMarkSheet').click()} className="upload-button">
            {formData.class12MarkSheetName || "Upload document"}
        </button>
        <input
            type="file"
            id="12thMarkSheet"
            name="class12MarkSheet"
            className="file-input"
            onChange={handleFileChange}
            accept=".pdf"
            required
        />
        {formData.class12MarkSheet && (
            <div className="image-preview-container">
            </div>
        )}
    </div>
    <p className="file-size-info">
        Maximum Size 200 KB. Accepted formats: PDF only.
    </p>
</div>

            <div className="form-section">
                <label htmlFor="academicSportsDistinction">
                    Any Academic / Sports Distinction
                </label>
                <textarea
                    id="academicSportsDistinction"
                    name="academicSportsDistinction"
                    value={formData.academicSportsDistinction}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter Details"
                    style={{ width: "100%", height: "5em", marginBottom: "-0px" }}
                />
            </div>

            <div className="form-section affirmation-section">
                <input
                    type="checkbox"
                    id="informationAffirmation"
                    name="informationAffirmation"
                    checked={formData.informationAffirmation}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`checkbox ${errors.informationAffirmation ? 'input-error' : ''}`}
                />
                {errors.informationAffirmation && <p className="error-text">{errors.informationAffirmation}</p>}
                <label htmlFor="informationAffirmation" className="affirmation-label">
                    I solemnly affirm that the information furnished above is true and correct in all respects. I have not concealed any information. I abide by the rules and regulations of the institution.
                </label>
            </div>
            <button type="button" onClick={handlePreview} className="preview-button">
                Preview Application
            </button>
            <button type="submit" className="submit-button">
                Submit Application
            </button>
            {isLoading && <LoadingSpinner />}
            <ConfirmationModal 
            isOpen={isConfirmationModalOpen} 
            onClose={() => setIsConfirmationModalOpen(false)} 
            message={confirmationMessage} 
        />
            <ApplicationPreviewModal
                isOpen={isPreviewModalOpen}
                onClose={closePreviewModal}
                formData={formData}
            />
            </form>   
    );
};

export default ApplicationForm;