export interface User {
  username: string;
  isLoggedIn: boolean;
  isAdmin: boolean;
}

export interface Monument {
  id: string;
  name: string;
  location: string;
  builtBy: string;
  architecture: string;
  history: string;
  famousFacts: string[];
  visitingHours: string;
  ticketPrice: string;
  bestTimeToVisit: string;
  image?: string;
  confidence?: number;
  latitude?: number;
  longitude?: number;
}

export interface DatasetCategory {
  id: string;
  name: string;
  imageCount: number;
  architectureType: string;
  description: string;
  imageUrls: string[];
}

export interface PreprocessingStep {
  name: string;
  description: string;
  imageContent?: string; // Base64 or placeholder canvas representation
  outputSize: string;
  status: 'pending' | 'success' | 'failed';
}

export interface ModelLayer {
  layerName: string;
  type: string;
  outputShape: string;
  params: number;
  purpose: string;
}

export interface PredictionHistory {
  id: string;
  timestamp: string;
  imageName: string;
  imageBytes: string;
  detectedName: string;
  confidence: number;
  location: string;
  classificationTimeMs: number;
}

export interface TrainingParams {
  epochs: number;
  batchSize: number;
  learningRate: number;
  optimizer: 'Adam' | 'SGD' | 'RMSprop';
  baseModel: 'Custom CNN' | 'ResNet50' | 'EfficientNetB0' | 'InceptionV3';
  augmentation: {
    rotation: boolean;
    flipping: boolean;
    zooming: boolean;
    brightness: boolean;
  };
}

export interface EpochLog {
  epoch: number;
  loss: number;
  valLoss: number;
  accuracy: number;
  valAccuracy: number;
  durationMs: number;
}
