import { DeliveryRecord, RecordType } from "./types";

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(value);
};

export const calculateIndividualValue = (parcels: number, collections: number): number => {
  // 1 pound per parcel, 0.80 per collection (80 pi)
  return (parcels * 1.0) + (collections * 0.80);
};

export const calculateDailyValue = (numberOfIds: number, totalParcels: number): number => {
  if (numberOfIds === 1) {
    return 180;
  }
  
  // Logic for 2 IDs
  if (totalParcels < 150) {
    return 260;
  } else if (totalParcels <= 250) {
    return 300;
  } else {
    // Above 250
    return 360;
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};
