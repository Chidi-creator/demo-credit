# Logging System Usage Guide

## Overview
The logging system uses **Winston** for professional logging with file output, performance tracking, and structured logs.

## Import the Logger
```typescript
import logger from "@services/logger.service";
```

## Basic Logging Methods

### Standard Log Levels
```typescript
// Info: General information
logger.info("User profile updated", { userId: 123 });

// Warning: Something unexpected but handled
logger.warn("Email sending took longer than expected", { duration: "3.2s" });

// Error: Something went wrong
logger.error("Failed to process payment", error, { userId: 123, amount: 5000 });

// Debug: Detailed development info
logger.debug("Cache hit for user data", { key: "user_123" });
```

### HTTP Request Logging
```typescript
// Automatically logged by middleware, but you can also log manually:
logger.logRequest("POST", "/api/auth/login", 200, 1500, 123);
```

### Authentication Logging
```typescript
// Login attempts
logger.logAuth('LOGIN_ATTEMPT', 'user@example.com', true, { method: 'OTP' });
logger.logAuth('LOGIN_FAILED', 'user@example.com', false, { reason: 'Invalid OTP' });

// OTP operations
logger.logAuth('SEND_OTP', 'user@example.com', true, { duration: 3200 });
logger.logAuth('VALIDATE_OTP', 'user@example.com', false, { reason: 'Expired' });
```

### Performance Logging
```typescript
// Track slow operations
const startTime = Date.now();
await someSlowOperation();
const duration = Date.now() - startTime;
logger.logPerformance('Database Query', duration, { table: 'users', operation: 'SELECT' });

// Or use timing
console.time('operation'); // Still works for development
// ... operation
console.timeEnd('operation');
logger.logPerformance('Custom Operation', Date.now() - startTime);
```

### Database Operations
```typescript
// Database queries
logger.logDatabase('SELECT', 'users', 150); // 150ms query
logger.logDatabase('INSERT', 'transactions', 50);
logger.logDatabase('UPDATE', 'accounts', 1200); // Will warn about slow query
logger.logDatabase('DELETE', 'sessions', undefined, new Error('Foreign key constraint'));
```

### Cache Operations
```typescript
// Redis/Cache operations
logger.logCache('GET', 'user_123', true, 5); // Cache hit in 5ms
logger.logCache('SET', 'otp_user@example.com', undefined, 220);
logger.logCache('DELETE', 'session_456', undefined, 12);
```

### Email Operations
```typescript
// Email sending
logger.logEmail('user@example.com', 'OTP Code', true, 3200);
logger.logEmail('user@example.com', 'Welcome Email', false, 5000, new Error('SMTP timeout'));
```

### Business Logic Logging
```typescript
// Financial transactions
logger.logTransaction('TRANSFER', 50000, 123, 'SUCCESS', { 
  fromAccount: 'ACC001', 
  toAccount: 'ACC002' 
});
logger.logTransaction('WITHDRAWAL', 25000, 123, 'FAILED', { 
  reason: 'Insufficient funds' 
});

// User actions
logger.logUserAction(123, 'PROFILE_UPDATE', { field: 'phone_number' });
logger.logUserAction(123, 'KYC_SUBMISSION', { level: 'tier_2' });
```

## Log Output Locations

### Console (Development)
- Colored, formatted logs for easy reading
- All log levels displayed

### Files (Production)
- `logs/combined.log` - All logs in JSON format
- `logs/error.log` - Only errors and warnings
- Files created automatically

### Log Format
```
2024-10-17 14:30:25 [info]: 📥 POST /api/auth/login
Meta: {
  "method": "POST",
  "url": "/api/auth/login", 
  "statusCode": 200,
  "responseTime": "1500ms",
  "userId": 123
}
```

## Performance Benefits

### What Gets Logged
✅ **All HTTP requests** with timing  
✅ **Authentication events** with success/failure  
✅ **Database queries** with slow query warnings  
✅ **Email operations** with SMTP timing  
✅ **Cache operations** with hit/miss status  
✅ **Business transactions** with amounts and status  

### Automatic Warnings
- 🐌 HTTP requests > 1000ms
- ⚠️ Database queries > 500ms  
- 📧 Email sending > 3000ms
- 🔍 Failed authentication attempts

## Example in Your Auth Handler
```typescript
import logger from "@services/logger.service";

login = async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { email, otp } = req.body;

  try {
    if (!otp) {
      // Send OTP step
      await this.authService.sendOTPEmail(email);
      logger.logAuth('SEND_OTP', email, true);
      return responseManager.success(res, {}, "OTP sent");
    }

    // Validate OTP step  
    const valid = await this.authService.validateOTP(email, otp);
    if (!valid) {
      logger.logAuth('VALIDATE_OTP', email, false, { otp: '***' });
      throw new ValidationError("Invalid OTP");
    }

    logger.logAuth('LOGIN_SUCCESS', email, true, { 
      totalTime: Date.now() - startTime 
    });

    // ... rest of login logic
  } catch (error) {
    logger.logAuth('LOGIN_FAILED', email, false, { 
      error: error.message,
      totalTime: Date.now() - startTime 
    });
    throw error;
  }
};
```

## Environment Configuration
Add to your `.env`:
```env
NODE_ENV=development  # Controls log level (debug in dev, info in prod)
```

The logging system is now fully integrated and will automatically track all your API performance!