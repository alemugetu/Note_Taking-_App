# 🔧 Troubleshooting Guide

## ❌ Error: "next is not a function"

### **Problem:**

When testing in Postman, you get:

```json
{
  "success": false,
  "message": "next is not a function"
}
```

### **Root Cause:**

This error occurs when there's a syntax error in the controller files, specifically in the `authController.js` file. There was a malformed comment in the response object.

### **Solution Applied:**

✅ **Fixed the syntax error** in `server/controllers/authController.js`
✅ **Improved error handling** in `server/server.js`
✅ **Restarted the server**

---

## 🔍 Common Postman Errors & Solutions

### **Error 1: "Could not get response"**

**Symptoms:**

- Postman shows "Could not get response"
- No status code shown

**Causes & Solutions:**

1. **Server not running**
   - Check terminal: Is `npm run dev` running?
   - Look for: `🚀 Server running on port 5000`
   - **Fix:** Run `npm run dev` in server folder

2. **Wrong URL**
   - Check URL: `http://localhost:5000/api/auth/register`
   - **Fix:** Make sure port is 5000, not 5173

3. **Firewall/Antivirus blocking**
   - **Fix:** Temporarily disable firewall/antivirus

---

### **Error 2: "401 Unauthorized"**

**Symptoms:**

```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**Causes & Solutions:**

1. **Missing Authorization header**
   - **Fix:** Add `Authorization: Bearer YOUR_TOKEN`

2. **Wrong token format**
   - ❌ Wrong: `BearereyJhbG...` (no space)
   - ❌ Wrong: `bearer eyJhbG...` (lowercase)
   - ✅ Correct: `Bearer eyJhbG...`

3. **Expired token**
   - **Fix:** Login again to get new token

4. **Invalid token**
   - **Fix:** Copy token correctly, no extra characters

---

### **Error 3: "400 Bad Request"**

**Symptoms:**

```json
{
  "success": false,
  "message": "Please provide email and password"
}
```

**Causes & Solutions:**

1. **Missing required fields**
   - **Fix:** Include email and password in body

2. **Wrong Content-Type header**
   - **Fix:** Add `Content-Type: application/json`

3. **Invalid JSON format**
   - **Fix:** Check JSON syntax (commas, quotes, brackets)

---

### **Error 4: "500 Internal Server Error"**

**Symptoms:**

```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

**Causes & Solutions:**

1. **Database connection issue**
   - Check server logs for MongoDB errors
   - **Fix:** Verify MongoDB Atlas connection string

2. **Code syntax error**
   - Check server terminal for error details
   - **Fix:** Fix syntax errors and restart server

3. **Missing environment variables**
   - **Fix:** Check `.env` file has all required variables

---

## 🚀 Quick Fixes

### **Fix 1: Restart Server**

```bash
# Stop server (Ctrl+C in terminal)
# Then restart:
cd server
npm run dev
```

### **Fix 2: Check Server Logs**

Look at terminal where server is running:

```
🚀 Server running on port 5000
✅ MongoDB Connected: ...
POST /api/auth/register 201 150ms  ← Success
POST /api/auth/login 500 80ms      ← Error here!
```

### **Fix 3: Test Basic Endpoint**

Before testing auth, test basic endpoint:

```
GET http://localhost:5000
```

Should return:

```json
{
  "message": "Note Taking App API",
  "version": "1.0.0",
  "status": "running"
}
```

### **Fix 4: Check MongoDB Connection**

In server terminal, look for:

```
✅ MongoDB Connected: ac-ztsmvoh-shard-00-00.ce49zrw.mongodb.net
📊 Database: test
```

If you see connection errors, check your `.env` file.

---

## 📋 Debugging Checklist

When you get an error in Postman:

- [ ] **Check server is running** (`npm run dev`)
- [ ] **Check server logs** in terminal
- [ ] **Verify URL** is correct
- [ ] **Check HTTP method** (GET, POST, PUT)
- [ ] **Verify headers** (Content-Type, Authorization)
- [ ] **Check JSON syntax** in body
- [ ] **Test basic endpoint** first (`GET /`)
- [ ] **Check MongoDB connection** in logs

---

## 🔧 Server Status Commands

### **Check if server is running:**

```bash
curl http://localhost:5000
```

### **Test database connection:**

```bash
cd server
npm run test:db
```

### **View server logs:**

Look at terminal where `npm run dev` is running

### **Restart server:**

```bash
# Press Ctrl+C to stop
npm run dev  # Start again
```

---

## 📞 Getting Help

### **What to check when asking for help:**

1. **Server status:** Is it running? Any errors in terminal?
2. **Request details:** Method, URL, headers, body
3. **Response details:** Status code, response body
4. **Error logs:** What does server terminal show?

### **Provide this info:**

- Exact error message
- Request you're trying to make
- Server logs from terminal
- Screenshots of Postman setup

---

## ✅ Current Status

**Server:** ✅ Running on http://localhost:5000
**Database:** ✅ Connected to MongoDB Atlas
**Error:** ✅ Fixed - "next is not a function"

**You can now test in Postman successfully!**

---

## 🎯 Next Steps

1. **Test basic endpoint:** `GET http://localhost:5000`
2. **Test registration:** `POST /api/auth/register`
3. **Test login:** `POST /api/auth/login`
4. **Test protected route:** `GET /api/auth/profile`

If you encounter any other errors, refer to this guide!
