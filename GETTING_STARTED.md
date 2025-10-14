# MarkSure AOI System - Getting Started Guide

## 🚀 Quick Start

This guide will help you set up and run the MarkSure Automated Optical Inspection (AOI) system for IC marking verification.

## 📋 Prerequisites

### Required Software

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **Python 3.10+** - [Download here](https://python.org/)
3. **MongoDB** - [Download Community Edition](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/atlas)
4. **Git** - [Download here](https://git-scm.com/)

### Optional
- **Docker** - For containerized deployment
- **Tesseract OCR** - For additional OCR support

## 🛠️ Installation

### Option 1: Automated Setup (Windows)
```bash
# Run the automated setup script
./setup.bat
```

### Option 2: Manual Setup

#### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
```

#### 3. AI Service Setup
```bash
cd ai-service
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python main.py
```

#### 4. Database Setup
```bash
# Make sure MongoDB is running
# For local MongoDB:
mongod

# Seed the database
cd database/seed
node seed.js
```

## ⚙️ Configuration

### Backend Environment (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/marksure
JWT_SECRET=your_secure_jwt_secret_here
AI_SERVICE_URL=http://localhost:8000
```

### AI Service Environment (.env)
```env
PYTHON_ENV=development
API_PORT=8000
OCR_ENGINE=easyocr
OCR_CONFIDENCE_THRESHOLD=0.8
SIMILARITY_THRESHOLD=0.9
```

## 🎯 Testing the System

### 1. System Health Check

**Backend API:**
```bash
curl http://localhost:5000/health
```

**AI Service:**
```bash
curl http://localhost:8000/health
```

**Frontend:**
Open http://localhost:3000

### 2. Default Login Credentials

| Role | Username | Email | Password |
|------|----------|-------|----------|
| Admin | admin | admin@marksure.com | admin123 |
| Operator | operator1 | operator1@marksure.com | operator123 |

### 3. Test IC Image Analysis

1. **Login** to the system
2. **Navigate** to "Inspect IC" page
3. **Upload** a test IC image
4. **Review** the analysis results

### Sample Test Images
Create test images with text markings:
- `ATMEGA328P-PU 2241 AVR`
- `STM32F103C8T6 945 CHN 517`
- `NE555P TI 2241`

## 📱 User Interface Guide

### Dashboard
- **Inspection Statistics** - View recent analysis metrics
- **Quick Actions** - Access main features
- **System Status** - Monitor service health

### IC Inspection Page
1. **Upload Image** - Drag & drop or browse for IC images
2. **Select OCR Engine** - Choose between EasyOCR/Tesseract
3. **Add Metadata** - Location, station, notes
4. **Analyze** - Process the image
5. **Review Results** - Check classification and confidence

### Inspection History
- **Filter by Date Range** - View inspections by time period
- **Search by Text** - Find specific IC markings
- **Classification Filter** - Show genuine/fake/suspicious only
- **Export Results** - Download inspection data

### OEM Database
- **View Markings** - Browse all reference markings
- **Add New Marking** - Create new OEM references
- **Edit Existing** - Update marking information
- **Search & Filter** - Find specific manufacturers/parts

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check if MongoDB is running
mongod --version

# For Windows services:
net start MongoDB

# Check connection:
mongosh "mongodb://localhost:27017/marksure"
```

#### 2. AI Service Not Starting
```bash
# Check Python version
python --version

# Activate virtual environment
cd ai-service
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt
```

#### 3. Frontend Build Errors
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

#### 4. OCR Not Working
- **Install Tesseract**: Download from [GitHub](https://github.com/UB-Mannheim/tesseract/wiki)
- **Check EasyOCR**: May need to download models on first run
- **Image Quality**: Ensure images are clear and well-lit

### Port Conflicts
If default ports are in use:

**Change Backend Port (.env):**
```env
PORT=5001
```

**Change AI Service Port (.env):**
```env
API_PORT=8001
```

**Update Frontend Proxy (package.json):**
```json
"proxy": "http://localhost:5001"
```

## 🚢 Production Deployment

### Using Docker
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d
```

### Manual Production Setup
1. **Use MongoDB Atlas** for database
2. **Set NODE_ENV=production**
3. **Configure reverse proxy** (Nginx)
4. **Enable HTTPS**
5. **Set up monitoring**

## 📊 System Monitoring

### Health Endpoints
- **Backend**: `GET /health`
- **AI Service**: `GET /health`
- **Database**: Check MongoDB logs

### Log Files
- **Backend**: `backend/logs/app.log`
- **AI Service**: `ai-service/logs/ai_service.log`
- **MongoDB**: System-specific location

## 🔐 Security Best Practices

### Production Security
1. **Change Default Passwords**
2. **Use Strong JWT Secrets**
3. **Enable HTTPS**
4. **Restrict CORS Origins**
5. **Set Up Rate Limiting**
6. **Regular Security Updates**

### API Security
- All endpoints require authentication
- File upload restrictions enforced
- Input validation on all requests
- Audit trail for all actions

## 🤝 Getting Help

### Documentation
- **API Docs**: http://localhost:5000/api/docs
- **AI Service Docs**: http://localhost:8000/docs

### Support Channels
1. **GitHub Issues** - Report bugs and feature requests
2. **Documentation Wiki** - Detailed technical guides
3. **System Logs** - Check application logs for errors

## 📈 Performance Optimization

### Image Processing
- **Optimize Image Size**: 1024x768 recommended maximum
- **Image Format**: JPEG/PNG for best compatibility
- **Lighting**: Ensure even illumination
- **Focus**: Sharp, clear images for better OCR

### System Performance
- **Database Indexing**: Automatic indexes created
- **Caching**: Redis optional for improved performance
- **Load Balancing**: Multiple backend instances
- **CDN**: For static assets in production

## 🎯 Success Metrics

### Target Performance
- **Processing Speed**: ≤ 3 seconds per IC
- **OCR Accuracy**: ≥ 95% for clear images
- **System Uptime**: ≥ 99%
- **False Positive Rate**: ≤ 5%

### Monitoring KPIs
- Total inspections per day
- Genuine vs. fake detection rates
- Average processing time
- User accuracy rates
- System error rates

---

## 🎉 You're Ready!

The MarkSure AOI system is now ready for IC marking verification. Start by logging in and uploading your first IC image for analysis.

For advanced features like multispectral imaging, logo detection, and anomaly detection, refer to the advanced configuration guide.

**Happy inspecting! 🔍**