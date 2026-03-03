# I-Track SMS Notification Implementation Guide

## ✅ Implementation Status

### Frontend ✅ COMPLETE
- [x] Created `src/utils/notificationService.js` - Reusable SMS notification service
- [x] Created `src/constants/api.js` - API configuration with endpoints
- [x] Updated `src/components/frames/ServiceRequest.js` - Integrated NotificationService into handleSMSRelease()
- [x] SMS notification UI already exists in ServiceRequest.js (SMS modal & release button)

### Backend ✅ COMPLETE
- [x] Enhanced `server/server.js` - Complete SMS + Email notification endpoint
- [x] Added `axios` import for SMS API calls
- [x] Phone number normalization function
- [x] SMS-only and Email+SMS notification modes
- [x] Status-based email templates (Vehicle Preparation, Dispatch, Ready for Release)
- [x] SMS message templates for all statuses

---

## 🔧 Backend Setup (Next Steps)

### 1. Install Required Dependencies

```bash
cd server
npm install axios
```

### 2. Configure Environment Variables

Create/update `.env` in your `server/` directory:

```env
# SMS API Configuration
SMS_API_URL=https://sms-api-ph-gceo.onrender.com/send
SMS_API_KEY=your_sms_api_key_here
SMS_SENDER_ID=I-Track_Pasig

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here

# MongoDB & Session
MONGO_URI=your_mongo_connection_string
SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret
NODE_ENV=production
```

### 3. SMS API Key Setup

To get your SMS API key:
1. Go to: https://sms-api-ph-gceo.onrender.com/
2. Register/Login to get your API key
3. Copy the key to `SMS_API_KEY` in `.env`
4. Set `SMS_SENDER_ID` to `I-Track_Pasig` (or your preferred name)

### 4. Email Configuration (Using Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Create an App Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Google will generate a 16-character password
3. Use that password as `EMAIL_PASS` in `.env`

---

## 📱 Frontend Configuration

### 1. Update API Base URL (if needed)

In `src/constants/api.js`, update the API_BASE_URL if deploying to a different backend:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://itrack-web-backend.onrender.com';
```

Or set in your `.env.local`:
```
REACT_APP_API_URL=your_backend_url
```

### 2. Verify NotificationService Integration

The `handleSMSRelease()` function in ServiceRequest.js now uses:

```javascript
const result = await NotificationService.notifyReadyForRelease(
  smsData.customerPhone,
  smsData.customerName,
  {
    unitId: editRequest.unitId,
    unitName: editRequest.unitName
  }
);
```

---

## 📋 SMS Notification Methods Available

The `NotificationService` provides these methods:

### SMS-Only Notifications

```javascript
import NotificationService from '../../utils/notificationService';

// Generic SMS
await NotificationService.sendSMSOnlyNotification(
  '+639171234567',
  'Juan Dela Cruz',
  { unitId: 'V001', unitName: 'Isuzu D-Max' },
  'Custom message'
);

// Status-specific
await NotificationService.notifyReadyForRelease(phone, name, vehicleData);
await NotificationService.notifyVehiclePreparation(phone, name, vehicleData, 'Tinting');
await NotificationService.notifyCarWash(phone, name, vehicleData);
await NotificationService.notifyTinting(phone, name, vehicleData);
await NotificationService.notifyRustProof(phone, name, vehicleData);
await NotificationService.notifyAccessories(phone, name, vehicleData);
await NotificationService.notifyCeramicCoating(phone, name, vehicleData);
```

---

## 🧪 Testing

### 1. Test SMS-Only Mode

In ServiceRequest.js, when clicking "Mark as Released":

```
✅ Expected Flow:
1. Modal opens asking for customer name & phone
2. Click "Send SMS & Release"
3. Request updates with status: "Completed"
4. SMS sent to phone (if API key configured)
5. Toast shows: "Vehicle marked as Released and SMS sent successfully!"
```

### 2. Test Phone Number Formats

All these formats are automatically normalized to `+63xxxxxxxxx`:
- `09171234567` → `+639171234567`
- `639171234567` → `+639171234567`
- `+639171234567` → `+639171234567` (unchanged)

### 3. Monitor Backend Logs

When SMS sends:

```
📱 Sending notification: { customerName: '...', customerPhone: '...', ... }
✅ SMS notification sent successfully to: +639171234567
```

If SMS API key not configured:

```
⚠️  SMS_API_KEY not set — skipping SMS send
✅ SMS skipped: API key not configured
```

---

## 🚀 Deployment Checklist

- [ ] Install axios: `npm install axios`
- [ ] Set all required `.env` variables
- [ ] Test SMS API Key works (visit SMS provider)
- [ ] Test Email credentials
- [ ] Deploy backend with updated server.js
- [ ] Verify frontend NotificationService imports correctly
- [ ] Test SMS release flow end-to-end
- [ ] Monitor server logs for any errors

---

## 📧 Email + SMS Mode (Future Use)

The backend also supports combined Email + SMS notifications:

```javascript
// Not yet integrated in UI, but available via API
POST /api/send-notification

{
  "customerEmail": "customer@email.com",
  "customerName": "Juan Dela Cruz",
  "customerPhone": "+639171234567",
  "vehicleModel": "Isuzu D-Max",
  "vin": "V001",
  "status": "Ready for Release",
  "smsOnly": false  // ← triggers both email + SMS
}
```

---

## 🐛 Troubleshooting

### SMS not sending
- Check `SMS_API_KEY` is set in `.env`
- Verify phone number format (must start with 0, 63, or +63)
- Check backend logs for API errors

### Email not sending
- Verify `EMAIL_USER` and `EMAIL_PASS` are correct
- Check Gmail has 2FA enabled and app password generated
- Verify customer email in database is valid

### API Connection Error
- Check `REACT_APP_API_URL` points to correct backend
- Verify CORS settings allow frontend domain
- Backend should be running and accessible

---

## 📞 API Reference

### POST /api/send-notification

**SMS-Only Request:**
```json
{
  "customerPhone": "+639171234567",
  "customerName": "Juan Dela Cruz",
  "vehicleModel": "Isuzu D-Max",
  "vin": "V001",
  "message": "Custom SMS message (max 120 chars)",
  "smsOnly": true
}
```

**Response:**
```json
{
  "success": true,
  "smsSent": true,
  "message": "SMS notification sent successfully"
}
```

---

## 📝 Files Modified/Created

### Created:
- ✅ `src/utils/notificationService.js` - SMS notification service class
- ✅ `src/constants/api.js` - API configuration

### Modified:
- ✅ `src/components/frames/ServiceRequest.js` - Added NotificationService import & integration
- ✅ `server/server.js` - Enhanced SMS/Email endpoint with axios

---

## 💡 Key Features Implemented

1. **Phone Normalization**: Converts +63, 63, or 09 formats to standard +63 format
2. **SMS-Only Mode**: Sends SMS without email (useful for quick notifications)
3. **Email + SMS Mode**: Sends both email and SMS with rich templates
4. **Status Templates**: Pre-built messages for different vehicle statuses
5. **Error Handling**: Graceful fallback if SMS API is unavailable
6. **Logging**: Detailed console logs for debugging

---

## 🔒 Security Notes

- SMS API keys stored in environment variables (not in code)
- Phone numbers validated before sending
- Email credentials using app passwords (not main password)
- All requests use HTTPS API endpoints
- Sensitive data logged to console only (remove in production if needed)

---

Good luck with your SMS implementation! 🎉
