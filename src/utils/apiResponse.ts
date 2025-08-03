import { Response } from 'express';

// Fonctions helpers avec typage correct
export const badRequest = (res: Response, message: string) => {
  return res.status(400).json({ success: false, message });
};

export const unauthorized = (res: Response, message: string) => {
  return res.status(401).json({ success: false, message });
};

export const created = (res: Response, data: any, message: string) => {
  return res.status(201).json({ success: true, data, message });
};

export const success = (res: Response, data: any, message?: string) => {
  if (message) {
    return res.status(200).json({ success: true, data, message });
  }
  return res.status(200).json({ success: true, data });
};

export const notFound = (res: Response, message: string) => {
  return res.status(404).json({ success: false, message });
};

export const error = (res: Response, message: string, statusCode: number = 500) => {
  return res.status(statusCode).json({ success: false, message });
};