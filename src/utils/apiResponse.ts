import type { ApiSuccessResponse, ApiErrorResponse } from '../types/index.js';

export function successResponse<T>(
  data: T,
  meta?: ApiSuccessResponse<T>['meta'],
): ApiSuccessResponse<T> {
  return meta ? { success: true, data, meta } : { success: true, data };
}

export function errorResponse(
  code: string,
  message: string,
  details?: unknown,
): ApiErrorResponse {
  return {
    success: false,
    error: { code, message, ...(details !== undefined ? { details } : {}) },
  };
}

export function toIdString(id: unknown): string {
  return String(id);
}

export function isObjectId(value: string): boolean {
  return /^[a-f\d]{24}$/i.test(value);
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

export function calculateGrade(percentage: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}
