import { APIError, ErrorHandler } from '../utils/ErrorHandler';
import logger from '../utils/Logger';
import configManager from '../config/ConfigManager';

/**
 * HTTP request configuration interface.
 * Defines the structure for making HTTP requests.
 */
export interface HttpRequestConfig {
  /** HTTP method for the request */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  /** URL or path for the request */
  url: string;
  /** Optional custom headers */
  headers?: Record<string, string>;
  /** Optional request body (will be JSON stringified) */
  body?: any;
  /** Optional timeout in milliseconds */
  timeout?: number;
  /** Optional number of retry attempts */
  retries?: number;
}

/**
 * HTTP response interface.
 * Represents the structure of HTTP responses.
 * @template T - The expected type of the response data
 */
export interface HttpResponse<T = any> {
  /** HTTP status code */
  status: number;
  /** HTTP status text */
  statusText: string;
  /** Response headers */
  headers: Record<string, string>;
  /** Response data (parsed from JSON or text) */
  data: T;
  /** True if status is in the 200-299 range */
  ok: boolean;
}

/**
 * HTTP Client for making API requests.
 * Provides a wrapper around fetch with retry logic, timeout handling, and error management.
 */
export class HttpClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;
  private retries: number;

  /**
   * Creates a new HttpClient instance.
   * Falls back to ConfigManager values for any parameters not provided.
   * @param baseUrl - Optional base URL for all requests
   * @param headers - Optional default headers to include in all requests
   * @param timeout - Optional default timeout in milliseconds
   * @param retries - Optional default number of retry attempts
   */
  constructor(
    baseUrl?: string,
    headers?: Record<string, string>,
    timeout?: number,
    retries?: number
  ) {
    this.baseUrl = baseUrl || configManager.getBaseUrl();
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...configManager.getHeaders(),
      ...headers
    };
    this.timeout = timeout || configManager.getTimeout();
    this.retries = retries ?? configManager.getRetries();
  }

  /**
   * Makes an HTTP request with retry logic and timeout handling.
   * Automatically parses JSON responses or returns text content.
   * @template T - The expected type of the response data
   * @param config - Request configuration object
   * @returns Promise resolving to HttpResponse with typed data
   * @throws {APIError} If the request fails after all retry attempts
   */
  async request<T = any>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
    const url = this.buildUrl(config.url);
    const headers = { ...this.defaultHeaders, ...config.headers };
    const timeout = config.timeout || this.timeout;
    const maxRetries = config.retries ?? this.retries;

    logger.debug(`${config.method} ${url}`, { headers, body: config.body });

    let lastError: any;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (attempt > 0) {
        logger.warn(`Retry attempt ${attempt} for ${config.method} ${url}`);
        await this.delay(1000 * attempt);
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          method: config.method,
          headers,
          body: config.body ? JSON.stringify(config.body) : undefined,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        let data: T;
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          data = await response.json() as T;
        } else {
          data = (await response.text()) as T;
        }

        const httpResponse: HttpResponse<T> = {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          data,
          ok: response.ok
        };

        if (!response.ok) {
          throw new APIError(
            response.status,
            `HTTP ${response.status}: ${response.statusText}`,
            url,
            data
          );
        }

        logger.debug(`${config.method} ${url} - ${response.status}`, { data });
        return httpResponse;

      } catch (error: any) {
        lastError = error;

        if (error.name === 'AbortError') {
          logger.error(`Request timeout after ${timeout}ms: ${url}`);
        } else if (attempt === maxRetries) {
          logger.error(`Request failed after ${maxRetries + 1} attempts: ${url}`, error);
        }

        if (attempt === maxRetries) {
          ErrorHandler.handleAPIError(error, url);
        }
      }
    }

    throw lastError;
  }

  /**
   * Makes a GET request.
   * @template T - The expected type of the response data
   * @param url - URL or path for the request
   * @param headers - Optional custom headers
   * @returns Promise resolving to HttpResponse with typed data
   */
  async get<T = any>(url: string, headers?: Record<string, string>): Promise<HttpResponse<T>> {
    return this.request<T>({ method: 'GET', url, headers });
  }

  /**
   * Makes a POST request.
   * @template T - The expected type of the response data
   * @param url - URL or path for the request
   * @param body - Optional request body
   * @param headers - Optional custom headers
   * @returns Promise resolving to HttpResponse with typed data
   */
  async post<T = any>(url: string, body?: any, headers?: Record<string, string>): Promise<HttpResponse<T>> {
    return this.request<T>({ method: 'POST', url, body, headers });
  }

  /**
   * Makes a PUT request.
   * @template T - The expected type of the response data
   * @param url - URL or path for the request
   * @param body - Optional request body
   * @param headers - Optional custom headers
   * @returns Promise resolving to HttpResponse with typed data
   */
  async put<T = any>(url: string, body?: any, headers?: Record<string, string>): Promise<HttpResponse<T>> {
    return this.request<T>({ method: 'PUT', url, body, headers });
  }

  /**
   * Makes a DELETE request.
   * @template T - The expected type of the response data
   * @param url - URL or path for the request
   * @param headers - Optional custom headers
   * @returns Promise resolving to HttpResponse with typed data
   */
  async delete<T = any>(url: string, headers?: Record<string, string>): Promise<HttpResponse<T>> {
    return this.request<T>({ method: 'DELETE', url, headers });
  }

  /**
   * Makes a PATCH request.
   * @template T - The expected type of the response data
   * @param url - URL or path for the request
   * @param body - Optional request body
   * @param headers - Optional custom headers
   * @returns Promise resolving to HttpResponse with typed data
   */
  async patch<T = any>(url: string, body?: any, headers?: Record<string, string>): Promise<HttpResponse<T>> {
    return this.request<T>({ method: 'PATCH', url, body, headers });
  }

  /**
   * Builds a complete URL from a path.
   * Returns the path as-is if it's already a full URL.
   * @private
   * @param path - URL path or full URL
   * @returns Complete URL string
   */
  private buildUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const base = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const endpoint = path.startsWith('/') ? path : `/${path}`;
    return `${base}${endpoint}`;
  }

  /**
   * Creates a delay promise for retry backoff.
   * @private
   * @param ms - Number of milliseconds to delay
   * @returns Promise that resolves after the specified delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
