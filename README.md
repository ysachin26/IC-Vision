# MarkSure - Automated Optical IC Marking Verification System

## 🎯 Project Overview

MarkSure is an AI-powered Automated Optical Inspection (AOI) system designed to detect counterfeit IC components by analyzing their markings. The system captures IC marking images, extracts text and logos using OCR and computer vision, and compares them against an OEM reference database to classify components as genuine or fake.

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │◄──►│  Node.js API    │◄──►│  Python AI      │
│   Dashboard      │    │  Server         │    │  Microservice   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │  MongoDB        │
                       │  Database       │
                       └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend (React)
- **React 18** - UI Framework
- **Material-UI** - Component library
- **Axios** - HTTP client
- **React Router** - Navigation
- **Chart.js** - Data visualization

### Backend (Node.js)
- **Node.js 18+** - Runtime
- **Express.js** - Web framework
- **Multer** - File upload handling
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Sharp** - Image processing (Node.js native)

### Database
- **MongoDB** - Main database
- **MongoDB Atlas** - Cloud database option

### AI/ML Processing
- **Python 3.10+** - AI processing service
- **OpenCV** - Computer vision
- **EasyOCR/Tesseract** - Text recognition
- **TensorFlow/PyTorch** - Deep learning
- **FastAPI** - Python API service
- **RapidFuzz** - Text similarity

### DevOps & Deployment
- **Docker** - Containerization
- **PM2** - Process management
- **Nginx** - Reverse proxy

## 📁 Project Structure

```
IC-Vision/
├── README.md
├── docker-compose.yml
├── frontend/                 # React Application
│   ├── package.json
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.js
│   └── build/
├── backend/                  # Node.js API Server
│   ├── package.json
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── server.js
│   └── uploads/
├── ai-service/              # Python AI Microservice
│   ├── requirements.txt
│   ├── main.py
│   ├── src/
│   │   ├── ocr/
│   │   ├── preprocessing/
│   │   ├── comparison/
│   │   └── models/
│   └── temp/
├── database/
│   └── seed/               # Sample data
└── docs/                   # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.10+
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd IC-Vision
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
npm start
```

4. **AI Service Setup**
```bash
cd ../ai-service
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python main.py
```

5. **Database Setup**
```bash
# Make sure MongoDB is running locally or configure Atlas connection
cd ../database/seed
node seed.js
```

## 📖 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### IC Inspection
- `POST /api/inspect/upload` - Upload and inspect IC image
- `GET /api/inspect/history` - Get inspection history
- `GET /api/inspect/:id` - Get specific inspection details

### OEM Database
- `GET /api/oem/markings` - Get all OEM markings
- `POST /api/oem/markings` - Add new OEM marking
- `PUT /api/oem/markings/:id` - Update OEM marking
- `DELETE /api/oem/markings/:id` - Delete OEM marking

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/marksure
JWT_SECRET=your_jwt_secret
AI_SERVICE_URL=http://localhost:8000
UPLOAD_PATH=./uploads
```

**AI Service (.env)**
```
PYTHON_ENV=development
API_PORT=8000
TEMP_PATH=./temp
OCR_CONFIDENCE_THRESHOLD=0.8
SIMILARITY_THRESHOLD=0.9
```

## 🧪 Features

### Core Features ✅
- [x] Image upload and preprocessing
- [x] OCR text extraction
- [x] OEM marking database
- [x] Text similarity comparison
- [x] Genuine/Fake classification
- [x] Inspection history and reports
- [x] Dashboard UI

### Advanced Features 🚧
- [ ] Logo detection and matching
- [ ] Anomaly detection
- [ ] Multispectral imaging support
- [ ] Super-resolution enhancement
- [ ] Automated datasheet parsing
- [ ] Real-time camera integration

## 📊 Success Metrics

- **Detection Accuracy**: ≥ 95% for clear images
- **Processing Speed**: ≤ 3 seconds per IC
- **False Positive Rate**: ≤ 5%
- **System Uptime**: ≥ 99%

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Support

For support and questions, please open an issue in the GitHub repository.