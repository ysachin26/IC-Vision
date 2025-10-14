// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string | string[];
}

// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: 'admin' | 'operator' | 'viewer';
  username: string;
  department?: string;
  isActive: boolean;
  lastLogin: string | null;
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
  accuracyRate: string;
  createdAt: string;
  updatedAt: string;
}

// Authentication Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  token: string | null;
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

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

// Inspection Types
export interface Inspection {
  _id: string;
  inspectionId: string;
  userId: string | User;
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
    boundingBoxes: BoundingBox[];
    alternatives: string[];
    processingTime: number;
    engine: 'easyocr' | 'tesseract';
  };
  matching: {
    query: string;
    bestMatch?: {
      oemId: string;
      partNumber: string;
      manufacturer: string;
    };
    similarity: {
      overallSimilarity: number;
      textSimilarity: number;
      structureSimilarity?: number;
    };
    allMatches: Array<{
      oemId: string;
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
    verifiedBy?: string;
    verificationDate?: string;
    humanClassification?: 'genuine' | 'fake' | 'suspicious' | 'inconclusive';
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BoundingBox {
  text: string;
  confidence: number;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface InspectionRequest {
  image: File;
  ocrEngine?: 'easyocr' | 'tesseract' | 'auto';
  enhanceImage?: boolean;
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
    boundingBoxes?: BoundingBox[];
  };
}

// OEM Marking Types
export interface OemMarking {
  _id: string;
  icPartNumber: string;
  manufacturer: string;
  series?: string;
  packageType: PackageType;
  category: ICCategory;
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
  createdAt: string;
  updatedAt: string;
}

export interface OemMarkingRequest {
  icPartNumber: string;
  manufacturer: string;
  series?: string;
  packageType: PackageType;
  category: ICCategory;
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
  validationRules?: {
    minSimilarity?: number;
    requiredElements?: string[];
    forbiddenElements?: string[];
    caseSensitive?: boolean;
  };
  notes?: string;
  tags?: string[];
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

export interface DashboardStats {
  todayInspections: number;
  weeklyInspections: number;
  monthlyInspections: number;
  accuracyRate: number;
  averageProcessingTime: number;
  systemHealth: 'healthy' | 'warning' | 'error';
  recentInspections: Inspection[];
  quickStats: {
    genuine: number;
    fake: number;
    suspicious: number;
    inconclusive: number;
  };
}

// UI Component Types
export interface Theme {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
}

export interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  autoHideDuration?: number;
}

export interface LoadingState {
  loading: boolean;
  message?: string;
}

export interface FilterState {
  dateRange: {
    start: string | null;
    end: string | null;
  };
  classification: 'all' | 'genuine' | 'fake' | 'suspicious' | 'inconclusive';
  manufacturer: string;
  sortBy: 'date' | 'confidence' | 'classification' | 'processingTime';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Form Types
export interface FormErrors {
  [key: string]: string | undefined;
}

export interface FormState<T> {
  data: T;
  errors: FormErrors;
  loading: boolean;
  touched: { [K in keyof T]?: boolean };
}

// Utility Types
export type UserRole = 'admin' | 'operator' | 'viewer';
export type ClassificationResult = 'genuine' | 'fake' | 'suspicious' | 'inconclusive';
export type InspectionStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type PackageType = 'BGA' | 'QFP' | 'SOIC' | 'TSSOP' | 'LQFP' | 'DFN' | 'QFN' | 'SOP' | 'SSOP' | 'PLCC' | 'DIP' | 'OTHER';
export type ICCategory = 'microcontroller' | 'memory' | 'processor' | 'analog' | 'power' | 'interface' | 'logic' | 'sensor' | 'other';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// Chart Types
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio?: boolean;
  plugins?: {
    legend?: {
      display?: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
    };
    tooltip?: {
      enabled?: boolean;
      mode?: string;
      intersect?: boolean;
    };
  };
  scales?: {
    x?: {
      display?: boolean;
      title?: {
        display?: boolean;
        text?: string;
      };
    };
    y?: {
      display?: boolean;
      title?: {
        display?: boolean;
        text?: string;
      };
      beginAtZero?: boolean;
    };
  };
}

// Route Types
export interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  title: string;
  icon?: React.ComponentType<any>;
  requireAuth: boolean;
  allowedRoles?: UserRole[];
  exact?: boolean;
}

// Table Types
export interface TableColumn<T = any> {
  id: keyof T | string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => string;
  sortable?: boolean;
}

export interface TableRow {
  [key: string]: any;
}

// File Upload Types
export interface FileUploadState {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  progress: number;
  error: string | null;
}

// Search Types
export interface SearchState {
  query: string;
  filters: FilterState;
  results: any[];
  loading: boolean;
  total: number;
}

// Modal Types
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  fullScreen?: boolean;
}

// Context Types
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: RegisterRequest) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
}

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export interface NotificationContextType {
  showNotification: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
  hideNotification: () => void;
}