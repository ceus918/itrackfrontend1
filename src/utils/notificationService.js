/**
 * NotificationService - SMS notification system for I-Track
 * Using official Isuzu Pasig SMS templates
 */

import { buildApiUrl } from '../constants/api';

export class NotificationService {
  /**
   * Main SMS notification method
   * @param {string} customerPhone - Customer phone number (+63..., 63..., or 09...)
   * @param {string} customerName - Customer full name
   * @param {object} vehicleData - Vehicle information {unitId, unitName, model}
   * @param {string} customMessage - Custom SMS message (optional, max 120 chars)
   * @returns {Promise<object>} - {success, smsSent, message}
   */
  static async sendSMSOnlyNotification(customerPhone, customerName, vehicleData, customMessage = '') {
    console.log('📱 Sending SMS notification:', { customerPhone, customerName, vehicleData });

    try {
      if (!customerPhone) {
        throw new Error('Customer phone number is required');
      }

      if (!customerName) {
        throw new Error('Customer name is required');
      }

      // Build the SMS message (max 120 chars for SMS API)
      let smsMessage = customMessage;
      if (!customMessage) {
        const unit = vehicleData?.unitName || vehicleData?.unitId || 'your vehicle';
        smsMessage = `Hi ${customerName}! Your ${unit} is ready for release. Contact your agent for details. -Isuzu Pasig`;
      }
      smsMessage = smsMessage.substring(0, 120);

      const notificationData = {
        customerPhone: customerPhone,
        customerName: customerName,
        vehicleModel: vehicleData?.unitName || vehicleData?.model || vehicleData?.unitId,
        vin: vehicleData?.unitId || vehicleData?.vin,
        message: smsMessage,
        smsOnly: true,
        timestamp: new Date().toISOString()
      };

      console.log('📤 Sending SMS notification to backend:', notificationData);

      const response = await fetch(buildApiUrl('/api/send-notification'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData)
      });

      console.log('📨 Backend Response Status:', response.status);

      const result = await response.json();
      
      console.log('📨 Backend Response Data:', result);

      if (result.success) {
        console.log('✅ SMS sent successfully');
        return {
          success: true,
          smsSent: result.smsSent !== false,
          message: result.message || 'SMS notification sent successfully'
        };
      } else {
        const errorMessage = result.message || result.error || 'Failed to send SMS';
        console.warn('⚠️ SMS not sent:', errorMessage);
        return {
          success: false,
          smsSent: false,
          message: errorMessage
        };
      }
    } catch (error) {
      console.error('❌ SMS notification error:', error);
      
      // Check if it's a network/service error
      if (error.message.includes('503') || error.message.includes('Service Unavailable')) {
        return {
          success: true, // Mark as success since request was sent
          smsSent: false,
          message: 'SMS service temporarily unavailable. Your vehicle has been marked as released.'
        };
      }
      
      return {
        success: false,
        message: `Network error: ${error.message}`
      };
    }
  }

  /**
   * Send SMS with status-based template
   */
  static async sendStatusNotification(customerPhone, customerName, vehicleData, status = '', customMessage = '') {
    let message = customMessage;

    if (!customMessage) {
      message = this.getSMSTemplate(status, customerName, vehicleData);
    }

    return this.sendSMSOnlyNotification(customerPhone, customerName, vehicleData, message);
  }

  /**
   * Status-specific SMS notifications
   */
  static async notifyVehiclePreparation(customerPhone, customerName, vehicleData, process = '') {
    const unit = vehicleData?.unitName || vehicleData?.unitId || 'your vehicle';
    const message = `Hi ${customerName}, your ${unit} is undergoing: ${process || 'Preparation'}. -Isuzu Pasig`.substring(0, 120);
    return this.sendSMSOnlyNotification(customerPhone, customerName, vehicleData, message);
  }

  static async notifyDispatchArrival(customerPhone, customerName, vehicleData, driverName = '') {
    const unit = vehicleData?.unitName || vehicleData?.unitId || 'your vehicle';
    const message = `Hi ${customerName}, your ${unit} is arriving shortly. -Isuzu Pasig`.substring(0, 120);
    return this.sendSMSOnlyNotification(customerPhone, customerName, vehicleData, message);
  }

  static async notifyReadyForRelease(customerPhone, customerName, vehicleData) {
    const unit = vehicleData?.unitName || vehicleData?.unitId || 'your vehicle';
    const message = `Hi ${customerName}! Your ${unit} is ready for release. Contact your agent for details. -Isuzu Pasig`.substring(0, 120);
    return this.sendSMSOnlyNotification(customerPhone, customerName, vehicleData, message);
  }

  static async notifyTinting(customerPhone, customerName, vehicleData) {
    const unit = vehicleData?.unitName || vehicleData?.unitId || 'your vehicle';
    const message = `Hi ${customerName}, your ${unit} is undergoing: Tinting. -Isuzu Pasig`.substring(0, 120);
    return this.sendSMSOnlyNotification(customerPhone, customerName, vehicleData, message);
  }

  static async notifyCarWash(customerPhone, customerName, vehicleData) {
    const unit = vehicleData?.unitName || vehicleData?.unitId || 'your vehicle';
    const message = `Hi ${customerName}, your ${unit} is undergoing: Car Wash. -Isuzu Pasig`.substring(0, 120);
    return this.sendSMSOnlyNotification(customerPhone, customerName, vehicleData, message);
  }

  static async notifyRustProof(customerPhone, customerName, vehicleData) {
    const unit = vehicleData?.unitName || vehicleData?.unitId || 'your vehicle';
    const message = `Hi ${customerName}, your ${unit} is undergoing: Rust Proof. -Isuzu Pasig`.substring(0, 120);
    return this.sendSMSOnlyNotification(customerPhone, customerName, vehicleData, message);
  }

  static async notifyAccessories(customerPhone, customerName, vehicleData) {
    const unit = vehicleData?.unitName || vehicleData?.unitId || 'your vehicle';
    const message = `Hi ${customerName}, your ${unit} is undergoing: Accessories. -Isuzu Pasig`.substring(0, 120);
    return this.sendSMSOnlyNotification(customerPhone, customerName, vehicleData, message);
  }

  static async notifyCeramicCoating(customerPhone, customerName, vehicleData) {
    const unit = vehicleData?.unitName || vehicleData?.unitId || 'your vehicle';
    const message = `Hi ${customerName}, your ${unit} is undergoing: Ceramic Coating. -Isuzu Pasig`.substring(0, 120);
    return this.sendSMSOnlyNotification(customerPhone, customerName, vehicleData, message);
  }

  /**
   * Get SMS template for status (max 120 chars)
   * @param {string} status - Vehicle status
   * @param {string} customerName - Customer name
   * @param {object} vehicleData - Vehicle data
   * @returns {string} - Formatted SMS message
   */
  static getSMSTemplate(status, customerName, vehicleData) {
    const unit = vehicleData?.unitName || vehicleData?.unitId || 'your vehicle';
    const name = customerName || 'Customer';

    const templates = {
      'Vehicle Preparation': `Hi ${name}, your ${unit} is being prepared. -Isuzu Pasig`,
      'Tinting': `Hi ${name}, your ${unit} is undergoing: Tinting. -Isuzu Pasig`,
      'Car Wash': `Hi ${name}, your ${unit} is undergoing: Car Wash. -Isuzu Pasig`,
      'Rust Proof': `Hi ${name}, your ${unit} is undergoing: Rust Proof. -Isuzu Pasig`,
      'Accessories': `Hi ${name}, your ${unit} is undergoing: Accessories. -Isuzu Pasig`,
      'Ceramic Coating': `Hi ${name}, your ${unit} is undergoing: Ceramic Coating. -Isuzu Pasig`,
      'Dispatch & Arrival': `Hi ${name}, your ${unit} is being dispatched and arriving shortly. -Isuzu Pasig`,
      'Ready for Release': `Hi ${name}! Your ${unit} is ready for release. Contact your agent for details. -Isuzu Pasig`,
      'In Preparation': `Hi ${name}, your ${unit} is being prepared for delivery. -Isuzu Pasig`,
      'Done': `Hi ${name}, your ${unit} has been delivered. Thank you! -Isuzu Pasig`
    };

    const msg = templates[status] || `Hi ${name}, your ${unit} status: ${status}. -Isuzu Pasig`;
    return msg.substring(0, 120);
  }
}

export default NotificationService;
