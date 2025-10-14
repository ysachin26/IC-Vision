#!/usr/bin/env python3
"""
MarkSure AOI System - Comprehensive Testing Script
This script tests all system components and their integration
"""

import os
import sys
import time
import requests
import subprocess
import json
from pathlib import Path
from datetime import datetime

# Configuration
BASE_DIR = Path(__file__).parent
BACKEND_URL = "http://localhost:5000"
FRONTEND_URL = "http://localhost:3000"
AI_SERVICE_URL = "http://localhost:8000"

class SystemTester:
    def __init__(self):
        self.test_results = []
        self.start_time = datetime.now()
        
    def log(self, message, status="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {status}: {message}")
        
    def test_result(self, test_name, passed, message=""):
        self.test_results.append({
            "test": test_name,
            "passed": passed,
            "message": message,
            "timestamp": datetime.now().isoformat()
        })
        status = "✅ PASS" if passed else "❌ FAIL"
        self.log(f"{test_name}: {status} {message}")
    
    def test_python_environment(self):
        """Test Python environment and dependencies"""
        self.log("Testing Python environment...")
        
        # Check Python version
        python_version = sys.version_info
        if python_version.major >= 3 and python_version.minor >= 8:
            self.test_result("Python Version", True, f"Python {python_version.major}.{python_version.minor}")
        else:
            self.test_result("Python Version", False, f"Python {python_version.major}.{python_version.minor} < 3.8")
        
        # Check key Python packages
        packages = ["fastapi", "uvicorn", "opencv-python", "easyocr", "numpy", "rapidfuzz"]
        for package in packages:
            try:
                __import__(package.replace("-", "_"))
                self.test_result(f"Python Package: {package}", True)
            except ImportError:
                self.test_result(f"Python Package: {package}", False, "Not installed")
    
    def test_node_environment(self):
        """Test Node.js environment"""
        self.log("Testing Node.js environment...")
        
        # Check Node.js version
        try:
            result = subprocess.run(["node", "--version"], capture_output=True, text=True)
            if result.returncode == 0:
                version = result.stdout.strip()
                self.test_result("Node.js Version", True, version)
            else:
                self.test_result("Node.js Version", False, "Not found")
        except FileNotFoundError:
            self.test_result("Node.js Version", False, "Node.js not installed")
        
        # Check npm version
        try:
            result = subprocess.run(["npm", "--version"], capture_output=True, text=True)
            if result.returncode == 0:
                version = result.stdout.strip()
                self.test_result("npm Version", True, version)
            else:
                self.test_result("npm Version", False, "Not found")
        except FileNotFoundError:
            self.test_result("npm Version", False, "npm not installed")
    
    def test_project_structure(self):
        """Test project structure and files"""
        self.log("Testing project structure...")
        
        # Key files to check
        key_files = [
            "backend/package.json",
            "backend/src/server.js",
            "frontend/package.json", 
            "frontend/src/App.js",
            "ai-service/main.py",
            "ai-service/requirements.txt",
            "docker-compose.yml"
        ]
        
        for file_path in key_files:
            full_path = BASE_DIR / file_path
            exists = full_path.exists()
            self.test_result(f"File: {file_path}", exists)
    
    def test_backend_dependencies(self):
        """Test backend dependencies"""
        self.log("Testing backend dependencies...")
        
        backend_dir = BASE_DIR / "backend"
        package_json = backend_dir / "package.json"
        node_modules = backend_dir / "node_modules"
        
        if package_json.exists():
            self.test_result("Backend package.json", True)
            
            if node_modules.exists():
                self.test_result("Backend node_modules", True)
            else:
                self.test_result("Backend node_modules", False, "Run 'npm install' in backend/")
        else:
            self.test_result("Backend package.json", False)
    
    def test_frontend_dependencies(self):
        """Test frontend dependencies"""
        self.log("Testing frontend dependencies...")
        
        frontend_dir = BASE_DIR / "frontend"
        package_json = frontend_dir / "package.json"
        node_modules = frontend_dir / "node_modules"
        
        if package_json.exists():
            self.test_result("Frontend package.json", True)
            
            if node_modules.exists():
                self.test_result("Frontend node_modules", True)
            else:
                self.test_result("Frontend node_modules", False, "Run 'npm install' in frontend/")
        else:
            self.test_result("Frontend package.json", False)
    
    def test_ai_service_health(self):
        """Test AI service health (if running)"""
        self.log("Testing AI service health...")
        
        try:
            response = requests.get(f"{AI_SERVICE_URL}/health", timeout=5)
            if response.status_code == 200:
                data = response.json()
                self.test_result("AI Service Health", True, f"Status: {data.get('status', 'unknown')}")
                
                # Check individual services
                services = data.get('services', {})
                for service, status in services.items():
                    self.test_result(f"AI Service: {service}", status == "healthy", f"Status: {status}")
            else:
                self.test_result("AI Service Health", False, f"HTTP {response.status_code}")
        except requests.exceptions.ConnectionError:
            self.test_result("AI Service Health", False, "Service not running")
        except requests.exceptions.Timeout:
            self.test_result("AI Service Health", False, "Timeout")
        except Exception as e:
            self.test_result("AI Service Health", False, str(e))
    
    def test_backend_health(self):
        """Test backend health (if running)"""
        self.log("Testing backend health...")
        
        try:
            response = requests.get(f"{BACKEND_URL}/health", timeout=5)
            if response.status_code == 200:
                self.test_result("Backend Health", True, "Service responsive")
            else:
                self.test_result("Backend Health", False, f"HTTP {response.status_code}")
        except requests.exceptions.ConnectionError:
            self.test_result("Backend Health", False, "Service not running")
        except requests.exceptions.Timeout:
            self.test_result("Backend Health", False, "Timeout")
        except Exception as e:
            self.test_result("Backend Health", False, str(e))
    
    def test_frontend_health(self):
        """Test frontend health (if running)"""
        self.log("Testing frontend health...")
        
        try:
            response = requests.get(FRONTEND_URL, timeout=5)
            if response.status_code == 200:
                self.test_result("Frontend Health", True, "Service responsive")
            else:
                self.test_result("Frontend Health", False, f"HTTP {response.status_code}")
        except requests.exceptions.ConnectionError:
            self.test_result("Frontend Health", False, "Service not running")
        except requests.exceptions.Timeout:
            self.test_result("Frontend Health", False, "Timeout")
        except Exception as e:
            self.test_result("Frontend Health", False, str(e))
    
    def check_mongodb(self):
        """Check if MongoDB is accessible"""
        self.log("Checking MongoDB availability...")
        
        # Try to connect to MongoDB using Python
        try:
            from pymongo import MongoClient
            client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=5000)
            client.server_info()  # This will raise an exception if not connected
            self.test_result("MongoDB Connection", True)
            client.close()
        except ImportError:
            self.test_result("MongoDB Connection", False, "pymongo not installed")
        except Exception as e:
            self.test_result("MongoDB Connection", False, str(e))
    
    def generate_report(self):
        """Generate test report"""
        end_time = datetime.now()
        duration = (end_time - self.start_time).total_seconds()
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['passed'])
        failed_tests = total_tests - passed_tests
        
        print("\n" + "="*80)
        print("MARKSURE AOI SYSTEM - TEST REPORT")
        print("="*80)
        print(f"Test Duration: {duration:.2f} seconds")
        print(f"Total Tests: {total_tests}")
        print(f"Passed: ✅ {passed_tests}")
        print(f"Failed: ❌ {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%")
        print("\n" + "-"*80)
        print("DETAILED RESULTS:")
        print("-"*80)
        
        for result in self.test_results:
            status = "✅ PASS" if result['passed'] else "❌ FAIL"
            message = f" - {result['message']}" if result['message'] else ""
            print(f"{status} {result['test']}{message}")
        
        print("\n" + "-"*80)
        print("QUICK START RECOMMENDATIONS:")
        print("-"*80)
        
        if failed_tests > 0:
            print("❌ Some tests failed. Please address the issues above.")
            print("\n🔧 Common fixes:")
            print("1. Install missing dependencies:")
            print("   - Backend: cd backend && npm install")
            print("   - Frontend: cd frontend && npm install") 
            print("   - AI Service: cd ai-service && pip install -r requirements.txt")
            print("2. Start services:")
            print("   - Backend: cd backend && npm run dev")
            print("   - Frontend: cd frontend && npm start")
            print("   - AI Service: cd ai-service && python main.py")
            print("3. Install MongoDB if needed for full functionality")
        else:
            print("✅ All tests passed! Your system is ready.")
            print("\n🚀 To start the system:")
            print("1. Terminal 1: cd backend && npm run dev")
            print("2. Terminal 2: cd frontend && npm start")
            print("3. Terminal 3: cd ai-service && python main.py")
            print("\n🌐 Access points:")
            print(f"   - Frontend: {FRONTEND_URL}")
            print(f"   - Backend API: {BACKEND_URL}")
            print(f"   - AI Service: {AI_SERVICE_URL}/docs")
        
        print("\n" + "="*80)
        
        # Save report to file
        report_file = BASE_DIR / "test_report.json"
        with open(report_file, 'w') as f:
            json.dump({
                'timestamp': end_time.isoformat(),
                'duration': duration,
                'summary': {
                    'total': total_tests,
                    'passed': passed_tests,
                    'failed': failed_tests,
                    'success_rate': passed_tests/total_tests*100
                },
                'results': self.test_results
            }, f, indent=2)
        
        print(f"📋 Detailed report saved to: {report_file}")

def main():
    print("🔍 MARKSURE AOI SYSTEM - COMPREHENSIVE TEST")
    print("="*60)
    
    tester = SystemTester()
    
    # Run all tests
    tester.test_python_environment()
    tester.test_node_environment()
    tester.test_project_structure()
    tester.test_backend_dependencies()
    tester.test_frontend_dependencies()
    tester.check_mongodb()
    tester.test_ai_service_health()
    tester.test_backend_health()
    tester.test_frontend_health()
    
    # Generate report
    tester.generate_report()

if __name__ == "__main__":
    main()