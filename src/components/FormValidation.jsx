const FormValidation = (formData, showCorrespondenceAddress) => {
    let errors = {};

    const currentYear = new Date().getFullYear();
    const earliestYear = currentYear - 10;

    // First Name - Required and should only contain alphabets
    if (!formData.firstName.trim()) {
        errors.firstName = 'First name is required. Don\'t be shy!';
    } else if (!/^[a-zA-Z.\s]+$/i.test(formData.firstName.trim())) {
        errors.firstName = 'First name must only contain characters. No funny business!';
    }

    // Last Name - Required and should only contain alphabets and dots
    if (formData.lastName.trim() && !/^[a-zA-Z.\s]+$/.test(formData.lastName.trim())) {
        errors.lastName = 'Last name must only contain characters. Keep it simple!';
    }

    // Contact Number - Required and should be a valid Indian mobile number
    if (!formData.contactNumber.trim()) {
        errors.contactNumber = 'Contact number is required. We promise not to spam! 😉';
    } else if (!/^\d{10}$/.test(formData.contactNumber.trim())) {
        errors.contactNumber = 'Contact number must be 10 digits. No more, no less.';
    }

    // Email - Required and must be a valid email address
    if (!formData.email.trim()) {
        errors.email = 'Email is required. How else will we reach you?';
    } else if (!/^\S+@\S+\.com$/.test(formData.email.trim())) {
        errors.email = 'Email must be a valid email address. No fake emails, please!';
    }

    // Gender - Required
    if (!formData.gender) {
        errors.gender = 'Gender is required. It\'s just a dropdown, pick one!';
    }

    // Student Photo - Required
    if (!formData.studentPhoto) {
        errors.studentPhoto = "Student photo is required. We need to see your lovely face!";
    }

    // Father's First Name - Required
    if (!formData.fathersFirstName.trim()) {
        errors.fathersFirstName = 'Father\'s first name is required. He won\'t mind!';
    } else if (!/^[a-zA-Z.\s]+$/i.test(formData.fathersFirstName.trim())) {
        errors.fathersFirstName = 'Father\'s name must only contain alphabets. No special characters allowed!';
    }

    // Father's Last Name - Required
    if (!formData.fathersLastName.trim()) {
        errors.fathersLastName = 'Father\'s last name is required. Don\'t forget him!';
    } else if (!/^[a-zA-Z.\s]+$/i.test(formData.fathersLastName.trim())) {
        errors.fathersLastName = 'Father\'s name must only contain alphabets. Keep it clean!';
    }

    // Father's Occupation - Required
    if (!formData.fathersOccupation.trim()) {
        errors.fathersOccupation = 'Father\'s occupation is required. What does he do?';
    }

    // Mother's First Name - Required
    if (!formData.mothersFirstName.trim()) {
        errors.mothersFirstName = 'Mother\'s first name is required. She deserves a mention!';
    } else if (!/^[a-zA-Z.\s]+$/i.test(formData.mothersFirstName.trim())) {
        errors.mothersFirstName = 'Mother\'s name must only contain alphabets. No numbers, please!';
    }

    // Mother's Last Name - Required
    if (!formData.mothersLastName.trim()) {
        errors.mothersLastName = 'Mother\'s last name is required. Don\'t leave it blank!';
    } else if (!/^[a-zA-Z.\s]+$/i.test(formData.mothersLastName.trim())) {
        errors.mothersLastName = 'Mother\'s name must only contain alphabets. Keep it simple!';
    }

    // Mother's Occupation - Required
    if (!formData.mothersOccupation.trim()) {
        errors.mothersOccupation = 'Mother\'s occupation is required. What does she do?';
    }

    // Present Address - All fields required
    if (!formData.presentAddressLine1.trim()) {
        errors.presentAddressLine1 = 'Present address line 1 is required. We need your address!';
    }
    if (!formData.presentCity.trim()) {
        errors.presentCity = 'City is required. Don\'t leave us guessing!';
    }
    if (!formData.presentState.trim()) {
        errors.presentState = 'State is required. Which state are you in?';
    }
    if (!formData.presentCountry.trim()) {
        errors.presentCountry = 'Country is required. Don\'t be mysterious!';
    }

    if (!formData.presentPostalCode.trim()) {
        errors.presentPostalCode = 'Postal code is required. Where\'s your mail going?';
    } else if (!/^\d{6}$/.test(formData.presentPostalCode.trim())) {
        errors.presentPostalCode = 'Postal code must be exactly 6 digits. No more, no less!';
    }

    if (showCorrespondenceAddress) {
        if (!formData.correspondenceAddressLine1.trim()) {
            errors.correspondenceAddressLine1 = 'Correspondence address line 1 is required. We need your address!';
        }
        if (!formData.correspondenceCity.trim()) {
            errors.correspondenceCity = 'City is required. Don\'t leave us guessing!';
        }
        if (!formData.correspondenceState.trim()) {
            errors.correspondenceState = 'State is required. Which state are you in?';
        }
        if (!formData.correspondencePostalCode.trim()) {
            errors.correspondencePostalCode = 'Postal code is required. Where\'s your mail going?';
        } else if (!/^\d{6}$/.test(formData.correspondencePostalCode.trim())) {
            errors.correspondencePostalCode = 'Postal code must be exactly 6 digits. No more, no less!';
        }
    }

    // Guardian Information - Required if fields are shown
    if (formData.guardianName) {
        if (!formData.guardianRelationship.trim()) {
            errors.guardianRelationship = 'Guardian relationship is required. Who are they to you?';
        }
        if (!formData.guardianContactNumber.trim()) {
            errors.guardianContactNumber = 'Guardian contact number is required. How do we call them?';
        } else if (!/^\d{10}$/.test(formData.guardianContactNumber.trim())) {
            errors.guardianContactNumber = 'Contact number must be 10 digits. No more, no less!';
        }
        if (!formData.guardianResidentialAddress.trim()) {
            errors.guardianResidentialAddress = "Guardian's residential address is required. Where do they live?";
        }
        if (!formData.guardianOfficialAddress.trim()) {
            errors.guardianOfficialAddress = "Guardian's official address is required. Where do they work?";
        }
    }

    if (!formData.category) {
        errors.category = 'Category is required. Don\'t leave this blank!';
    }

    if (formData.category === 'Others' && !formData.otherCategory.trim()) {
        errors.otherCategory = 'Please specify your category. We\'re all ears!';
    }

    if (!formData.nationality.trim()) {
        errors.nationality = 'Nationality is required. Which country are you from?';
    }
    if (!formData.dob) {
        errors.dob = 'Date of birth is required. We need to know your age!';
    } else {
        const selectedDate = new Date(formData.dob);
        const today = new Date();
        const minAgeDate = new Date('2007-12-31');

        if (selectedDate > today) {
            errors.dob = 'Are you from the Future? 😶';
        } else if (selectedDate > minAgeDate) {
            errors.dob = 'Minimum age should be 17 years as on 31st December 2024. You must be a teenager!';
        }
    }

    if (!formData.maritalStatus) {
        errors.maritalStatus = 'Marital status is required. Just a simple yes or no!';
    }

    if (!formData.class10SchoolName.trim()) {
        errors.class10SchoolName = 'Class 10 school name is required. Where did you study?';
    }
    if (!formData.class10BoardName.trim()) {
        errors.class10BoardName = 'Class 10 board name is required. We need to know!';
    }
    if (!formData.class10Year.trim()) {
        errors.class10Year = 'Class 10 YOP is required.';
    } else if (!/^\d{4}$/.test(formData.class10Year.trim())) {
        errors.class10Year = 'Class 10 YOP must be 4 digits. No more, no less!';
    } else if (Number(formData.class10Year) < earliestYear || Number(formData.class10Year) > currentYear) {
        errors.class10Year = `Class 10 YOP must be between ${earliestYear} and ${currentYear}.`;
    }

    // Class 10 Percentage Validation
    if (!formData.class10Percentage.trim()) {
        errors.class10Percentage = 'Class 10 %age is required. How well did you do?';
    } else if (isNaN(Number(formData.class10Percentage)) || Number(formData.class10Percentage) < 0 || Number(formData.class10Percentage) > 100) {
        errors.class10Percentage = 'Class 10 %age must be between 0 and 100. No exaggerations!';
    }

    // Class 10 Subjects and Marks
    formData.class10Subjects.forEach((subject, index) => {
        if (!subject.trim()) {
            errors[`class10Subjects[${index}]`] = `Subject ${index + 1} is required. What did you study?`;
        }

        const marks = formData.class10Marks[index];
        if (!marks || isNaN(Number(marks))) {
            errors[`class10Marks[${index}]`] = `Marks for Subject ${index + 1} are required. How did you score?`;
        } else if (marks < 0 || marks > 100) {
            errors[`class10Marks[${index}]`] = `Marks for Subject ${index + 1} must be between 0 and 100. No overachieving!`;
        }
    });

    if (!formData.class12SchoolName.trim()) {
        errors.class12SchoolName = 'Class 12 school name is required. Where did you finish your schooling?';
    }
    if (!formData.class12BoardName.trim()) {
        errors.class12BoardName = 'Class 12 board name is required. We need to know!';
    }
    if (!formData.class12Year.trim()) {
        errors.class12Year = 'Class 12 YOP is required.';
    } else if (!/^\d{4}$/.test(formData.class12Year.trim())) {
        errors.class12Year = 'Class 12 YOP must be 4 digits. No more, no less!';
    } else if (Number(formData.class12Year) < earliestYear || Number(formData.class12Year) > currentYear) {
        errors.class12Year = `Class 12 YOP must be between ${earliestYear} and ${currentYear}.`;
    }

    // Class 12 Percentage Validation
    if (!formData.class12Percentage.trim()) {
        errors.class12Percentage = 'Class 12 %age is required. How well did you do?';
    } else if (isNaN(Number(formData.class12Percentage)) || Number(formData.class12Percentage) < 0 || Number(formData.class12Percentage) > 100) {
        errors.class12Percentage = 'Class 12 %age must be between 0 and 100. No exaggerations!';
    }

    // Class 12 Subjects and Marks
    const subjectSet = new Set();
    formData.class12Subjects.forEach((subject, index) => {
        if (!subject.trim()) {
            errors[`class12Subjects[${index}]`] = `Subject ${index + 1} is required. What did you study?`;
        }

        if (subject && subjectSet.has(subject.toLowerCase())) {
            errors[`class12Subjects[${index}]`] = 'Subject Already Selected Above. Please fill any other Subject.';
        } else {
            subjectSet.add(subject.toLowerCase());
        }

        const marks = formData.class12Marks[index];
        if (subject && (!marks || isNaN(Number(marks)))) {
            errors[`class12Marks[${index}]`] = `Marks for Subject ${index + 1} are required. How did you score?`;
        } else if (subject && (marks < 0 || marks > 100)) {
            errors[`class12Marks[${index}]`] = `Marks for Subject ${index + 1} must be between 0 and 100. No overachieving!`;
        }
    });

    // Validate otherSubject (fifth subject)
    if (formData.class12Subjects[4] === "other" && !formData.otherSubject.trim()) {
        errors.otherSubject = 'Please specify the other subject for Subject 5.';
    }

    // Validate otherSubjectMarks (fifth subject marks)
    if (formData.class12Subjects[4] === "other" && (!formData.class12Marks[4] || isNaN(Number(formData.class12Marks[4])) || formData.class12Marks[4] < 0 || formData.class12Marks[4] > 100)) {
        errors[`class12Marks[4]`] = 'Marks for the specified other subject must be between 0 and 100.';
    }

    // Additional Subject validation
    if (formData.additionalSubject.trim() && !formData.additionalSubjectMarks) {
        errors.additionalSubjectMarks = 'Marks for Additional Subject 6 are required. How did you score?';
    } else if (formData.additionalSubjectMarks && (isNaN(Number(formData.additionalSubjectMarks)) || formData.additionalSubjectMarks < 0 || formData.additionalSubjectMarks > 100)) {
        errors.additionalSubjectMarks = 'Marks for Additional Subject 6 must be between 0 and 100. No exaggerations!';
    }

    // Check for duplicate additionalSubject
    if (formData.additionalSubject.trim() && subjectSet.has(formData.additionalSubject.toLowerCase())) {
        errors.additionalSubject = 'Subject Already Selected Above. Please fill any other Subject.';
    }

    // Information Affirmation - Required
    if (!formData.informationAffirmation) {
        errors.informationAffirmation = 'You must affirm the information to submit the form. Honesty is the best policy!';
    }

    return errors;
};

export default FormValidation;
