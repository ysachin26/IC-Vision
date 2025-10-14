import { Document, Types } from 'mongoose';
import { Request } from 'express';
// import { File } from 'multer';

// User Types
export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'operator' | 'viewer';
  department?: string;
  isActive: boolean;
  lastLogin: Date | null;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    defaultOcrEngine: 'easyocr' | 'tesseract' | 'auto';
  };
  stats: {
    totalInspections: number;
    totalFakeDetected: number;
    totalGenuineDetected: number;
    averageProcessingTime: number;
  };
  fullName: string;
  accuracyRate: string;
  correctPassword(candidatePassword: string, userPassword: string): Promise<boolean>;
  updateLastLogin(): Promise<IUser>;
  createdAt: Date;
  updatedAt: Date;
}

// OEM Marking Types
export interface IOemMarking extends Document {
  _id: Types.ObjectId;
  icPartNumber: string;
  manufacturer: string;
  series?: string;
  packageType: 'BGA' | 'QFP' | 'SOIC' | 'TSSOP' | 'LQFP' | 'DFN' | 'QFN' | 'SOP' | 'SSOP' | 'PLCC' | 'DIP' | 'OTHER';
  category: 'microcontroller' | 'memory' | 'processor' | 'analog' | 'power' | 'interface' | 'logic' | 'sensor' | 'other';
  marking: {
    text: string;
    format: 'alphanumeric' | 'numeric' | 'mixed' | 'logo+text' | 'qr_code' | 'barcode';
    lines: number;
    font: 'laser_etched' | 'ink_printed' | 'embossed' | 'screen_printed';
    size: 'very_small' | 'small' | 'medium' | 'large';
  };
  logo?: {
    hasLogo: boolean;
    logoName?: string;
    logoPosition: 'top' | 'bottom' | 'left' | 'right' | 'center';
  };
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  validationRules: {
    minSimilarity: number;
    requiredElements?: string[];
    forbiddenElements?: string[];
    caseSensitive: boolean;
  };
  notes?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Inspection Types
export interface IInspection extends Document {
  _id: Types.ObjectId;
  inspectionId: string;
  userId: Types.ObjectId | IUser;
  imageMetadata: {
    filename: string;
    originalName: string;
    size: number;
    mimetype: string;
    uploadPath: string;
  };
  ocrResults: {
    extractedText: string;
    confidence: number;
    boundingBoxes: Array<{
      text: string;
      confidence: number;
      coordinates: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    }>;
    alternatives: string[];
    processingTime: number;
    engine: 'easyocr' | 'tesseract';
  };
  matching: {
    query: string;
    bestMatch?: {
      oemId: Types.ObjectId;
      partNumber: string;
      manufacturer: string;
    };
    similarity: {
      overallSimilarity: number;
      textSimilarity: number;
      structureSimilarity?: number;
    };
    allMatches: Array<{
      oemId: Types.ObjectId;
      similarity: number;
      partNumber: string;
    }>;
  };
  result: {
    classification: 'genuine' | 'fake' | 'suspicious' | 'inconclusive';
    confidence: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    reasoning: string;
  };
  qualityMetrics: {
    imageQuality: number;
    textClarity: number;
    overallScore: number;
  };
  processingTime: {
    total: number;
    ocr: number;
    analysis: number;
    classification: number;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  humanVerification?: {
    isVerified: boolean;
    verifiedBy?: Types.ObjectId;
    verificationDate?: Date;
    humanClassification?: 'genuine' | 'fake' | 'suspicious' | 'inconclusive';
    notes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Request Types
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'admin' | 'operator' | 'viewer';
  department?: string;
}

export interface InspectionRequest {
  image: any; // Will be Express.Multer.File
  ocrEngine?: 'easyocr' | 'tesseract' | 'auto';
  enhanceImage?: boolean;
}

// Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string | string[];
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      fullName: string;
    };
  };
}

export interface InspectionResponse {
  success: boolean;
  message: string;
  data: {
    inspectionId: string;
    classification: string;
    confidence: number;
    processingTime: number;
    extractedText: string;
    similarity?: number;
    bestMatch?: {
      partNumber: string;
      manufacturer: string;
    };
  };
}

// Analytics Types
export interface AnalyticsData {
  totalInspections: number;
  classificationsBreakdown: {
    genuine: number;
    fake: number;
    suspicious: number;
    inconclusive: number;
  };
  averageProcessingTime: number;
  accuracyRate: number;
  dailyStats: Array<{
    date: string;
    inspections: number;
    classifications: {
      genuine: number;
      fake: number;
      suspicious: number;
      inconclusive: number;
    };
  }>;
  topManufacturers: Array<{
    manufacturer: string;
    count: number;
  }>;
  performanceMetrics: {
    ocrAccuracy: number;
    systemUptime: number;
    averageImageQuality: number;
  };
}

// Error Types
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export interface ValidationError {
  field: string;
  message: string;
  value: any;
}

// Environment Types
export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  HOST: string;
  MONGODB_URI: string;
  DB_NAME: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  BCRYPT_ROUNDS: number;
  AI_SERVICE_URL: string;
  AI_SERVICE_TIMEOUT: number;
  UPLOAD_PATH: string;
  MAX_FILE_SIZE: number;
  ALLOWED_FILE_TYPES: string;
  RATE_LIMIT_WINDOW: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  LOG_LEVEL: string;
  LOG_FILE: string;
  ALLOWED_ORIGINS: string;
}

// Utility Types
export type UserRole = 'admin' | 'operator' | 'viewer';
export type ClassificationResult = 'genuine' | 'fake' | 'suspicious' | 'inconclusive';
export type InspectionStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type PackageType = 'BGA' | 'QFP' | 'SOIC' | 'TSSOP' | 'LQFP' | 'DFN' | 'QFN' | 'SOP' | 'SSOP' | 'PLCC' | 'DIP' | 'OTHER';
export type ICCategory = 'microcontroller' | 'memory' | 'processor' | 'analog' | 'power' | 'interface' | 'logic' | 'sensor' | 'other';