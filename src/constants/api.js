// API Configuration for I-Track
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://itrack-web-backend.onrender.com';

export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

export const API_ENDPOINTS = {
  // Notification
  SEND_NOTIFICATION: '/api/send-notification',
  
  // Service Requests
  GET_REQUESTS: '/api/getRequest',
  CREATE_REQUEST: '/api/createRequest',
  UPDATE_REQUEST: '/api/updateRequest',
  DELETE_REQUEST: '/api/deleteRequest',
  
  // Inventory
  GET_STOCK: '/api/getStock',
  
  // Users
  GET_USERS: '/api/getUsers',
  UPDATE_USER: '/api/updateUser',
  
  // Audit
  GET_AUDIT_TRAIL: '/api/getAuditTrail'
};

export default API_BASE_URL;
