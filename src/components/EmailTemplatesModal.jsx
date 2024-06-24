import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EmailTemplatesModal.css'; 

const EmailTemplatesModal = ({ onClose }) => {
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateBody, setTemplateBody] = useState('');

  useEffect(() => {
    const fetchEmailTemplates = async () => {
      try {
        const response = await axios.get('http://192.168.0.111:3001/get-email-templates');
        setEmailTemplates(response.data);
      } catch (error) {
        console.error('Error fetching email templates:', error);
      }
    };

    fetchEmailTemplates();
  }, []);

  const handleEditTemplate = (template) => {
    setEditingTemplate(template.id);
    setTemplateSubject(template.subject);
    setTemplateBody(template.body);
  };

  const handleCancelEdit = () => {
    setEditingTemplate(null);
    setTemplateSubject('');
    setTemplateBody('');
  };

  const handleSaveTemplate = async () => {
    try {
      const response = await axios.put(`http://192.168.0.111:3001/update-email-template/${editingTemplate}`, {
        subject: templateSubject,
        body: templateBody,
      });
      if (response.data.status === 'success') {
        setEmailTemplates(emailTemplates.map(t => t.id === editingTemplate ? { ...t, subject: templateSubject, body: templateBody } : t));
        handleCancelEdit();
      } else {
        alert('Failed to update template');
      }
    } catch (error) {
      console.error('Error updating template:', error);
      alert('Failed to update template');
    }
  };

  return (
    <div className="email-templates-modal-backdrop">
      <div className="email-templates-modal-content">
        <button onClick={onClose} className="email-templates-close-button">X</button>
        <h2>Email Templates</h2>
        <table className="email-templates-table">
          <tbody>
            {emailTemplates.map(template => (
              <tr key={template.id} className="email-templates-item">
                <td className="email-templates-info">
                  <p><strong>Event:</strong> {template.event_trigger}</p>
                  <p><strong>User Type:</strong> {template.user_type}</p>
                </td>
                <td className="email-templates-content">
                  {editingTemplate === template.id ? (
                    <>
                      <label>
                        Subject:
                        <input
                          type="text"
                          value={templateSubject}
                          style={{width: '100%'}}
                          onChange={(e) => setTemplateSubject(e.target.value)}
                        />
                      </label>
                      <label>
                        Body:
                        <textarea
                          value={templateBody}
                          style={{height: '10em', width: '100%'}}
                          onChange={(e) => setTemplateBody(e.target.value)}
                        />
                      </label>
                      <button onClick={handleSaveTemplate} className="email-templates-save-button">Save</button>
                      <button onClick={handleCancelEdit} className="email-templates-cancel-button">Cancel</button>
                    </>
                  ) : (
                    <>
                      <div className="email-template-section">
                        <p><strong>Subject:</strong></p>
                        <p>{template.subject}</p>
                      </div>
                      <div className="email-template-section">
                        <p><strong>Body:</strong></p>
                        <p style={{ whiteSpace: 'pre-line' }}>{template.body}</p>
                      </div>
                      <button onClick={() => handleEditTemplate(template)} className="email-templates-edit-button">Edit</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmailTemplatesModal;
