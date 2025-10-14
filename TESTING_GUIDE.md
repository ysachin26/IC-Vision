# 🧪 MARKSURE AOI - COMPLETE TESTING GUIDE

## 🚀 **SYSTEM IS NOW RUNNING!**

Your browser should now be open to: **http://localhost:3000**

---

## 📋 **STEP-BY-STEP TESTING CHECKLIST**

### 🔐 **STEP 1: CREATE YOUR ACCOUNT**

1. **Access the Application:**
   - URL: http://localhost:3000
   - You should see the MarkSure AOI login page

2. **Register New Account:**
   - Click "Register" or "Sign Up"
   - Fill in your details:
     - **Name:** Your name
     - **Email:** your-email@example.com
     - **Password:** Choose a secure password
     - **Role:** Admin (for full access)
   - Click "Create Account"

3. **Login:**
   - Use your new credentials to login
   - You should be redirected to the dashboard

---

### 🏠 **STEP 2: EXPLORE THE DASHBOARD**

Once logged in, you'll see:

- **📊 Analytics Cards:** System statistics
- **📈 Charts:** Performance metrics
- **🎯 Recent Activity:** Latest inspections
- **⚡ System Status:** Service health indicators

**What to Test:**
- ✅ Dashboard loads quickly
- ✅ All widgets display data
- ✅ Navigation menu works
- ✅ User profile shows in top right

---

### 🔍 **STEP 3: TEST IC INSPECTION (CORE FEATURE)**

1. **Navigate to "Inspect IC":**
   - Click on "Inspect IC" in the sidebar
   - You should see the image upload interface

2. **Upload an Image:**
   - **Option 1:** Drag and drop any image with text
   - **Option 2:** Click "Choose File" and select an image
   - **Good Test Images:**
     - Screenshot of text
     - Photo of any electronic component
     - Image with printed text/numbers

3. **Start Analysis:**
   - Click "Analyze IC Marking"
   - Watch the real-time processing:
     - ✅ Image preprocessing
     - ✅ OCR text extraction
     - ✅ Similarity matching
     - ✅ Classification result

4. **Review Results:**
   - **Extracted Text:** What the AI read from the image
   - **Confidence Score:** How confident the AI is
   - **Classification:** Genuine/Fake/Suspicious/Inconclusive
   - **Processing Time:** How long it took
   - **Best Match:** Closest OEM reference (if any)

---

### 📚 **STEP 4: EXPLORE OEM DATABASE**

1. **Go to "OEM Database":**
   - Click "Database" in the sidebar
   - View the reference IC markings

2. **Test Database Features:**
   - ✅ Search for specific ICs
   - ✅ Filter by manufacturer
   - ✅ Add new OEM references
   - ✅ Edit existing entries
   - ✅ Delete test entries

3. **Add Sample OEM Entry:**
   - Click "Add New IC"
   - Fill in details:
     - **Part Number:** STM32F103C8T6
     - **Manufacturer:** STMicroelectronics
     - **Package:** LQFP48
     - **Description:** 32-bit ARM Cortex-M3 MCU
   - Save and verify it appears in the list

---

### 📊 **STEP 5: CHECK INSPECTION HISTORY**

1. **Visit "History" Page:**
   - Click "History" in the sidebar
   - You should see your previous inspections

2. **Test History Features:**
   - ✅ View inspection details
   - ✅ Filter by date range
   - ✅ Search by part number
   - ✅ Export data (CSV/JSON)
   - ✅ Delete old inspections

---

### 📈 **STEP 6: ANALYTICS & REPORTING**

1. **Go to "Analytics":**
   - Click "Analytics" in the sidebar
   - View comprehensive system metrics

2. **Explore Analytics:**
   - ✅ **Classification Breakdown:** Pie chart of results
   - ✅ **Performance Metrics:** Processing times
   - ✅ **Trend Analysis:** Daily/weekly patterns
   - ✅ **User Activity:** Inspection counts
   - ✅ **System Health:** Service status

---

### 👤 **STEP 7: USER PROFILE & SETTINGS**

1. **Access Profile:**
   - Click on your name in the top right
   - Select "Profile" or "Settings"

2. **Test Profile Features:**
   - ✅ Update personal information
   - ✅ Change password
   - ✅ Set preferences
   - ✅ View account activity
   - ✅ Logout functionality

---

## 🎯 **ADVANCED TESTING SCENARIOS**

### 🔬 **Test Different Image Types:**

1. **Clear Text Images:**
   - Screenshot of code
   - Document with printed text
   - Should get high confidence scores (>90%)

2. **Blurry/Low Quality:**
   - Blurred photos
   - Low resolution images
   - Test preprocessing enhancement

3. **Multiple Text Elements:**
   - Images with several text blocks
   - Test bounding box detection
   - Verify all text is captured

### 🎭 **Test User Roles:**

1. **Create Different User Types:**
   - Admin (full access)
   - Operator (inspection only)
   - Viewer (read-only)

2. **Verify Role Permissions:**
   - Different menu options
   - Feature restrictions
   - Data access levels

### 🚀 **Performance Testing:**

1. **Upload Multiple Images:**
   - Test concurrent processing
   - Monitor processing times
   - Check system responsiveness

2. **Large File Uploads:**
   - Test file size limits
   - Upload validation
   - Error handling

---

## 🐛 **TROUBLESHOOTING**

### If Something Doesn't Work:

1. **Check Browser Console:**
   - Press F12 to open developer tools
   - Look for JavaScript errors in Console tab

2. **Verify Services:**
   ```powershell
   Get-Job  # Check all services running
   ```

3. **Test Individual Services:**
   - AI Service: http://localhost:8000/docs
   - Backend API: http://localhost:5000/health
   - Frontend: http://localhost:3000

4. **Restart if Needed:**
   ```powershell
   Get-Job | Stop-Job; Get-Job | Remove-Job
   # Then restart services
   ```

---

## 🎉 **SUCCESS INDICATORS**

You'll know the system is working perfectly when:

- ✅ **Account Creation:** Smooth registration process
- ✅ **Login:** JWT authentication works
- ✅ **Dashboard:** Real-time data displays
- ✅ **IC Analysis:** <3 second processing time
- ✅ **OCR Recognition:** Text extracted accurately
- ✅ **Database Operations:** CRUD operations work
- ✅ **History Tracking:** Inspections saved and searchable
- ✅ **Analytics:** Charts and metrics update
- ✅ **User Management:** Profile updates persist

---

## 📞 **READY TO DEMO**

This system is now ready for:

- ✅ **Live Demonstrations**
- ✅ **Customer Presentations**
- ✅ **Technical Evaluations**
- ✅ **Production Deployment**
- ✅ **Further Development**

**Happy Testing! 🔍✨**