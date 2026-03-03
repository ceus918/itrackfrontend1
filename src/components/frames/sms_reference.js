//api key: sk-650cafc9601f119c4a5540a9
//# I-Track SMS Handoff Bundle (Frontend + Backend)

//Use this as the complete reference package for SMS notifications.



//## 1) Required Modules

//### Frontend (`itrack/package.json`)
//- `expo` / `react-native` (already present)
//- `@react-native-async-storage/async-storage` (used by related screens)
//- `@expo/vector-icons` (used by related screens)

//### Backend (`itrack-backend/package.json`)
// - `express`
// - `nodemailer`
// - `cors`
// - `mongoose`
// - `axios` ✅ **required for SMS API call**

// Install missing backend SMS dependency:

// ```bash
// cd itrack-backend
// npm install axios
// ```



// ## 2) Frontend SMS Module

// Create/replace: `itrack/utils/notificationService.js`
// javascript
// notificationService.js - SMS notification system for I-Track
// Using official Isuzu Pasig SMS templates
import { buildApiUrl } from '../constants/api';

// SMS-only notification service with official Isuzu Pasig templates
export class NotificationService {
  
	// Main SMS notification method
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

			const result = await response.json();
      
			if (result.success) {
				console.log('✅ SMS sent successfully');
				return {
					success: true,
					smsSent: result.smsSent !== false,
					message: result.message || 'SMS notification sent successfully'
				};
			} else {
				console.warn('⚠️ SMS not sent:', result.message);
				return {
					success: false,
					smsSent: false,
					message: result.message || 'Failed to send SMS'
				};
			}
		} catch (error) {
			console.error('❌ SMS notification error:', error);
			return {
				success: false,
				message: `Network error: ${error.message}`
			};
		}
	}

	// Send SMS notification with status update
	static async sendStatusNotification(customerPhone, customerName, vehicleData, status = '', customMessage = '') {
		let message = customMessage;
    
		if (!customMessage) {
			message = this.getSMSTemplate(status, customerName, vehicleData);
		}

		return this.sendSMSOnlyNotification(customerPhone, customerName, vehicleData, message);
	}

	// Status-specific SMS notifications
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

	// Get SMS template for status (max 120 chars)
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
// ```

// ---

// ## 3) Backend SMS Endpoint

// Add this in backend server (`itrack-backend/server.js`) with `axios` available.

// ```javascript
// Email + SMS Notification System
// POST /api/send-notification - Send SMS (and optional email) notification to customer
app.post('/api/send-notification', async (req, res) => {
	try {
		const { customerEmail, customerName, customerPhone, vehicleModel, vin, status, processDetails, smsOnly, message } = req.body;

		console.log('📱 Sending notification:', { customerName, customerPhone, vehicleModel, status, smsOnly });

		const normalizePhone = (phone) => {
			if (!phone) return '';
			const trimmed = `${phone}`.trim();
			if (trimmed.startsWith('+')) return trimmed;
			if (trimmed.startsWith('0')) return `+63${trimmed.slice(1)}`;
			if (trimmed.startsWith('63')) return `+${trimmed}`;
			return trimmed;
		};

		const smsApiUrl = process.env.SMS_API_URL || 'https://sms-api-ph-gceo.onrender.com/send';
		const smsApiKey = process.env.SMS_API_KEY;
		const smsSenderId = process.env.SMS_SENDER_ID || 'I-Track_Pasig';

		// ── SMS-only path ──────────────────────────────────────────────────────────
		if (smsOnly) {
			if (!customerPhone || !customerName) {
				return res.status(400).json({
					success: false,
					message: 'Missing required fields: customerPhone, customerName'
				});
			}

			const normalizedPhone = normalizePhone(customerPhone);
			const smsMessage = message || `Hi ${customerName}, your vehicle ${vin || vehicleModel || ''} status has been updated. Thank you for choosing Isuzu Pasig.`;

			if (!smsApiKey) {
				console.warn('⚠️  SMS_API_KEY not set — skipping SMS send');
				return res.json({
					success: true,
					smsSent: false,
					message: 'SMS skipped: API key not configured'
				});
			}

			try {
				await axios.post(
					smsApiUrl,
					{ senderId: smsSenderId, recipient: normalizedPhone, message: smsMessage },
					{ headers: { 'Content-Type': 'application/json', 'x-api-key': smsApiKey } }
				);
				console.log('✅ SMS sent successfully to:', normalizedPhone);
				return res.json({ success: true, smsSent: true, message: 'SMS notification sent successfully' });
			} catch (smsErr) {
				console.error('❌ SMS send error:', smsErr.message || smsErr);
				return res.status(500).json({ success: false, message: `Failed to send SMS: ${smsErr.message || 'Unknown error'}` });
			}
		}

		// ── Email + optional SMS path ──────────────────────────────────────────────
		if (!customerEmail || !customerName || !vehicleModel || !status) {
			return res.status(400).json({
				success: false,
				message: 'Missing required fields: customerEmail, customerName, vehicleModel, status'
			});
		}

		const getNotificationTemplate = (status, processDetails = '') => {
			switch (status.toLowerCase()) {
				case 'vehicle preparation':
				case 'in preparation':
				case 'tinting':
				case 'car wash':
				case 'rust proof':
				case 'accessories':
				case 'ceramic coating':
					return {
						subject: `Vehicle Preparation Update - ${vehicleModel}`,
						html: `
							<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
								<h2 style="color: #ff1e1e; text-align: center;">Isuzu Pasig - Vehicle Update</h2>
								<div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
									<p><strong>Dear ${customerName},</strong></p>
									<p>Hi ${customerName}, this is Isuzu Pasig. Your vehicle <strong>${vehicleModel}</strong> is now undergoing: <strong>${processDetails || status}</strong>.</p>
									<p>Thank you for choosing Isuzu Pasig.</p>
								</div>
								<div style="margin-top: 30px; padding: 15px; background-color: #e8f4f8; border-radius: 5px;">
									<p style="margin: 0;"><strong>Vehicle Details:</strong></p>
									<p style="margin: 5px 0;">Model: ${vehicleModel}</p>
									${vin ? `<p style="margin: 5px 0;">VIN: ${vin}</p>` : ''}
									<p style="margin: 5px 0;">Status: ${status}</p>
								</div>
								<p style="text-align: center; margin-top: 30px; color: #666;">
									<em>Thank you for choosing Isuzu Pasig</em><br>
									I-Track Vehicle Management System
								</p>
							</div>
						`
					};

				case 'dispatch & arrival':
				case 'in transit':
				case 'arriving':
					return {
						subject: `Vehicle Dispatch Update - ${vehicleModel}`,
						html: `
							<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
								<h2 style="color: #ff1e1e; text-align: center;">Isuzu Pasig - Dispatch Alert</h2>
								<div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
									<p><strong>Dear ${customerName},</strong></p>
									<p>The vehicle <strong>${vehicleModel}</strong>, driven by [Driver] is arriving shortly at Isuzu Pasig.</p>
								</div>
								<div style="margin-top: 30px; padding: 15px; background-color: #e8f4f8; border-radius: 5px;">
									<p style="margin: 0;"><strong>Vehicle Details:</strong></p>
									<p style="margin: 5px 0;">Model: ${vehicleModel}</p>
									${vin ? `<p style="margin: 5px 0;">VIN: ${vin}</p>` : ''}
									<p style="margin: 5px 0;">Status: ${status}</p>
								</div>
								<p style="text-align: center; margin-top: 30px; color: #666;">
									<em>Thank you for choosing Isuzu Pasig</em><br>
									I-Track Vehicle Management System
								</p>
							</div>
						`
					};

				case 'ready for release':
				case 'done':
				case 'completed':
				case 'ready':
					return {
						subject: `Vehicle Ready for Release - ${vehicleModel}`,
						html: `
							<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
								<h2 style="color: #ff1e1e; text-align: center;">Isuzu Pasig - Vehicle Release</h2>
								<div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
									<p><strong>Dear ${customerName},</strong></p>
									<p>Good news! Your vehicle is now ready for release. Please proceed to Isuzu Pasig or contact your sales agent for pickup details.</p>
									<p>Thank you for choosing Isuzu Pasig.</p>
								</div>
								<div style="margin-top: 30px; padding: 15px; background-color: #e8f4f8; border-radius: 5px;">
									<p style="margin: 0;"><strong>Vehicle Details:</strong></p>
									<p style="margin: 5px 0;">Model: ${vehicleModel}</p>
									${vin ? `<p style="margin: 5px 0;">VIN: ${vin}</p>` : ''}
									<p style="margin: 5px 0;">Status: Ready for Release</p>
								</div>
								<p style="text-align: center; margin-top: 30px; color: #666;">
									<em>Thank you for choosing Isuzu Pasig</em><br>
									I-Track Vehicle Management System
								</p>
							</div>
						`
					};

				default:
					return {
						subject: `Vehicle Status Update - ${vehicleModel}`,
						html: `
							<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
								<h2 style="color: #ff1e1e; text-align: center;">Isuzu Pasig - Status Update</h2>
								<div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
									<p><strong>Dear ${customerName},</strong></p>
									<p>Your vehicle <strong>${vehicleModel}</strong> status has been updated to: <strong>${status}</strong></p>
									<p>Thank you for choosing Isuzu Pasig.</p>
								</div>
								<div style="margin-top: 30px; padding: 15px; background-color: #e8f4f8; border-radius: 5px;">
									<p style="margin: 0;"><strong>Vehicle Details:</strong></p>
									<p style="margin: 5px 0;">Model: ${vehicleModel}</p>
									${vin ? `<p style="margin: 5px 0;">VIN: ${vin}</p>` : ''}
									<p style="margin: 5px 0;">Status: ${status}</p>
								</div>
								<p style="text-align: center; margin-top: 30px; color: #666;">
									<em>Thank you for choosing Isuzu Pasig</em><br>
									I-Track Vehicle Management System
								</p>
							</div>
						`
					};
			}
		};

		const template = getNotificationTemplate(status, processDetails);

		const getSmsTemplate = (statusValue, processDetailsValue = '') => {
			const normalizedStatus = (statusValue || '').toLowerCase();
			const vinOrModel = vin || vehicleModel;

			if ([
				'vehicle preparation',
				'in preparation',
				'tinting',
				'car wash',
				'rust proof',
				'accessories',
				'ceramic coating'
			].includes(normalizedStatus)) {
				return `Hi ${customerName}, this is Isuzu Pasig. Your vehicle ${vinOrModel} is now undergoing ${processDetailsValue || statusValue}. Thank you for choosing Isuzu Pasig.`;
			}

			if (['dispatch & arrival', 'in transit', 'arriving'].includes(normalizedStatus)) {
				const driverName = processDetailsValue || '[Driver]';
				return `The vehicle ${vinOrModel} driven by ${driverName} is arriving shortly at Isuzu Pasig.`;
			}

			if (['ready for release', 'done', 'completed', 'ready'].includes(normalizedStatus)) {
				return 'Good news! Your vehicle is now ready for release. Please proceed to Isuzu Pasig or contact your sales agent for pickup details. Thank you for choosing Isuzu.';
			}

			return `Your vehicle ${vinOrModel} status is now ${statusValue}.`;
		};
    
		// Configure email
		const mailOptions = {
			from: process.env.EMAIL_USER || 'itrack@isuzupasig.com',
			to: customerEmail,
			subject: template.subject,
			html: template.html
		};

		// Send email
		await transporter.sendMail(mailOptions);
    
		console.log('✅ Email notification sent successfully to:', customerEmail);

		// Send SMS (optional if API key and phone are available)
		let smsSent = false;
		let smsError = null;
		const normalizedPhone = normalizePhone(customerPhone);

		if (smsApiUrl && smsApiKey && normalizedPhone) {
			try {
				const smsMessage = getSmsTemplate(status, processDetails);
				await axios.post(
					smsApiUrl,
					{
						senderId: smsSenderId,
						recipient: normalizedPhone,
						message: smsMessage
					},
					{
						headers: {
							'Content-Type': 'application/json',
							'x-api-key': smsApiKey
						}
					}
				);
				smsSent = true;
				console.log('✅ SMS notification sent successfully to:', normalizedPhone);
			} catch (smsErr) {
				smsError = smsErr.message || 'Failed to send SMS';
				console.error('❌ SMS notification error:', smsErr.message || smsErr);
			}
		}
    
		res.json({
			success: true,
			message: 'Notification sent successfully',
			emailSent: true,
			smsSent,
			smsError,
			notificationMethod: smsSent ? 'email+sms' : 'email'
		});
    
	} catch (error) {
		console.error('❌ Email notification error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to send notification',
			error: error.message
		});
	}
});
// ```

// ---

// ## 4) Required Backend ENV

// Set these in backend environment:

// ```env
// SMS_API_URL=https://sms-api-ph-gceo.onrender.com/send
// SMS_API_KEY=your_sms_api_key_here
// SMS_SENDER_ID=I-Track_Pasig

// EMAIL_USER=your_email@domain.com
// EMAIL_PASS=your_email_app_password
// ```

// ---

// ## 5) Minimal Usage Example (Frontend)

// ```javascript
// import NotificationService from '../utils/notificationService';

// const result = await NotificationService.sendSMSOnlyNotification(
// 	'+639171234567',
// 	'Juan Dela Cruz',
// 	{ unitId: 'V001', unitName: 'Isuzu D-Max' },
// 	'Good news! Your vehicle is now ready for release.'
// );

// console.log(result);
// ```

// ---

// ## 6) Quick Test Checklist

// 1. Backend running and reachable from app (`buildApiUrl`).
// 2. `SMS_API_KEY` is set.
// 3. Phone format test: `09XXXXXXXXX`, `63XXXXXXXXXX`, `+63XXXXXXXXXX`.
// 4. Trigger from `ServiceRequestScreen` or call usage example.
// 5. Confirm response has `success: true` and `smsSent: true`.



