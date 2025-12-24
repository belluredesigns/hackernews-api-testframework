import { HttpClient, HttpResponse } from '../http/HttpClient';
import { ResponseValidator } from '../http/ResponseValidator';
import logger from '../utils/Logger';
import configManager from '../config/ConfigManager';

/**
 * Abstract base class for all API services
 * Provides common HTTP methods and validation utilities for API interactions
 */
export abstract class BaseAPI {
  protected httpClient: HttpClient;
  protected baseUrl: string;
  protected serviceName: string;

  /**
   * Initializes the API service with base URL and HTTP client
   * @param serviceName - Name of the service for logging purposes
   * @param baseUrl - Optional base URL, defaults to config manager URL
   * @param headers - Optional default headers for all requests
   */
  constructor(
    serviceName: string,
    baseUrl?: string,
    headers?: Record<string, string>
  ) {
    this.serviceName = serviceName;
    this.baseUrl = baseUrl || configManager.getBaseUrl();
    this.httpClient = new HttpClient(this.baseUrl, headers);
    logger.info(`${this.serviceName} API initialized with base URL: ${this.baseUrl}`);
  }

  /**
   * Performs an HTTP GET request to the specified endpoint
   * @param endpoint - API endpoint path
   * @param headers - Optional headers for this request
   * @returns Promise resolving to HTTP response with typed data
   */
  protected async get<T = unknown>(
    endpoint: string,
    headers?: Record<string, string>
  ): Promise<HttpResponse<T>> {
    logger.debug(`[${this.serviceName}] GET ${endpoint}`);
    return this.httpClient.get<T>(endpoint, headers);
  }

  /**
   * Performs an HTTP POST request to the specified endpoint
   * @param endpoint - API endpoint path
   * @param body - Optional request body payload
   * @param headers - Optional headers for this request
   * @returns Promise resolving to HTTP response with typed data
   */
  protected async post<T = unknown>(
    endpoint: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<HttpResponse<T>> {
    logger.debug(`[${this.serviceName}] POST ${endpoint}`, body);
    return this.httpClient.post<T>(endpoint, body, headers);
  }

  /**
   * Performs an HTTP PUT request to the specified endpoint
   * @param endpoint - API endpoint path
   * @param body - Optional request body payload
   * @param headers - Optional headers for this request
   * @returns Promise resolving to HTTP response with typed data
   */
  protected async put<T = any>(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<HttpResponse<T>> {
    logger.debug(`[${this.serviceName}] PUT ${endpoint}`, body);
    return this.httpClient.put<T>(endpoint, body, headers);
  }

  /**
   * Performs an HTTP DELETE request to the specified endpoint
   * @param endpoint - API endpoint path
   * @param headers - Optional headers for this request
   * @returns Promise resolving to HTTP response with typed data
   */
  protected async delete<T = any>(
    endpoint: string,
    headers?: Record<string, string>
  ): Promise<HttpResponse<T>> {
    logger.debug(`[${this.serviceName}] DELETE ${endpoint}`);
    return this.httpClient.delete<T>(endpoint, headers);
  }

  /**
   * Performs an HTTP PATCH request to the specified endpoint
   * @param endpoint - API endpoint path
   * @param body - Optional request body payload
   * @param headers - Optional headers for this request
   * @returns Promise resolving to HTTP response with typed data
   */
  protected async patch<T = any>(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<HttpResponse<T>> {
    logger.debug(`[${this.serviceName}] PATCH ${endpoint}`, body);
    return this.httpClient.patch<T>(endpoint, body, headers);
  }

  /**
   * Validates the HTTP response status code against expected values
   * @param response - HTTP response to validate
   * @param expectedStatus - Expected status code(s)
   */
  protected validateResponse(
    response: HttpResponse,
    expectedStatus?: number | number[]
  ): void {
    if (expectedStatus) {
      ResponseValidator.validateStatus(response, expectedStatus);
    }
  }

  /**
   * Validates that required fields are present in the response data
   * @param data - Response data to validate
   * @param fields - Array of required field names
   */
  protected validateRequired<T = any>(data: T, fields: string[]): void {
    ResponseValidator.validateRequired(data, fields);
  }

  /**
   * Validates that a field in the response data has the expected type
   * @param data - Response data containing the field
   * @param field - Name of the field to validate
   * @param expectedType - Expected type of the field
   */
  protected validateType<T = any>(data: T, field: string, expectedType: string): void {
    ResponseValidator.validateType(data, field, expectedType);
  }

  /**
   * Returns the name of this API service
   * @returns Service name
   */
  getServiceName(): string {
    return this.serviceName;
  }

  /**
   * Returns the base URL for this API service
   * @returns Base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}
