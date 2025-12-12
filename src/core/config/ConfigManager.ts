import { ErrorHandler } from '../utils/ErrorHandler';

/**
 * Environment configuration interface.
 * Defines the structure for environment-specific settings.
 */
export interface Environment {
  /** Environment name (e.g., 'dev', 'staging', 'production') */
  name: string;
  /** Base URL for the API */
  baseUrl: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Number of retry attempts for failed requests */
  retries?: number;
  /** Custom headers to include in all requests */
  headers?: Record<string, string>;
}

/**
 * Test configuration interface.
 * Defines the complete test framework configuration structure.
 */
export interface TestConfig {
  /** Environment configuration */
  environment: Environment;
  /** Logging configuration */
  logging: {
    /** Log level (e.g., 'DEBUG', 'INFO', 'WARN', 'ERROR') */
    level: string;
    /** Whether logging is enabled */
    enabled: boolean;
  };
  /** Test reporting configuration */
  reporting: {
    /** Directory path for test reports */
    outputDir: string;
    /** Report formats (e.g., ['html', 'json']) */
    format: string[];
  };
}

/**
 * Configuration Manager (Singleton).
 * Manages environment-specific configurations and test settings.
 * Provides centralized access to configuration values across the test framework.
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: TestConfig;
  private environments: Map<string, Environment> = new Map();

  /**
   * Private constructor to enforce singleton pattern.
   * Initializes environments and configuration on instantiation.
   */
  private constructor() {
    this.loadEnvironments();
    this.config = this.initializeConfig();
  }

  /**
   * Gets the singleton instance of ConfigManager.
   * Creates a new instance if one doesn't exist.
   * @returns The ConfigManager singleton instance
   */
  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Loads predefined environment configurations.
   * Initializes dev, staging, and production environments with their respective settings.
   * @private
   */
  private loadEnvironments(): void {
    const dev: Environment = {
      name: 'dev',
      baseUrl: 'https://hacker-news.firebaseio.com/v0',
      timeout: 30000,
      retries: 2
    };

    const staging: Environment = {
      name: 'staging',
      baseUrl: 'https://hacker-news.firebaseio.com/v0',
      timeout: 30000,
      retries: 2
    };

    const production: Environment = {
      name: 'production',
      baseUrl: 'https://hacker-news.firebaseio.com/v0',
      timeout: 30000,
      retries: 1
    };

    this.environments.set('dev', dev);
    this.environments.set('staging', staging);
    this.environments.set('production', production);
  }

  /**
   * Initializes the test configuration from environment variables.
   * Reads TEST_ENV, LOG_LEVEL, LOGGING_ENABLED, REPORT_DIR, and REPORT_FORMAT.
   * @private
   * @returns Initialized TestConfig object
   * @throws ConfigurationError if the specified environment is not found
   */
  private initializeConfig(): TestConfig {
    const envName = process.env.TEST_ENV || 'dev';
    const environment = this.environments.get(envName);

    if (!environment) {
      ErrorHandler.handleConfigurationError(
        `Environment '${envName}' not found. Available: ${Array.from(this.environments.keys()).join(', ')}`
      );
    }

    return {
      environment: environment!,
      logging: {
        level: process.env.LOG_LEVEL || 'INFO',
        enabled: process.env.LOGGING_ENABLED !== 'false'
      },
      reporting: {
        outputDir: process.env.REPORT_DIR || './reports',
        format: (process.env.REPORT_FORMAT || 'html,json').split(',')
      }
    };
  }

  /**
   * Gets the complete test configuration.
   * @returns The current TestConfig object
   */
  getConfig(): TestConfig {
    return this.config;
  }

  /**
   * Gets the current environment configuration.
   * @returns The current Environment object
   */
  getEnvironment(): Environment {
    return this.config.environment;
  }

  /**
   * Gets the base URL for the current environment.
   * @returns The base URL string
   */
  getBaseUrl(): string {
    return this.config.environment.baseUrl;
  }

  /**
   * Gets the request timeout for the current environment.
   * @returns Timeout in milliseconds (defaults to 30000 if not configured)
   */
  getTimeout(): number {
    return this.config.environment.timeout || 30000;
  }

  /**
   * Gets the number of retry attempts for the current environment.
   * @returns Number of retries (defaults to 0 if not configured)
   */
  getRetries(): number {
    return this.config.environment.retries || 0;
  }

  /**
   * Gets custom headers for the current environment.
   * @returns Object containing header key-value pairs (empty object if not configured)
   */
  getHeaders(): Record<string, string> {
    return this.config.environment.headers || {};
  }

  /**
   * Sets the active environment by name.
   * @param envName - Name of the environment to activate ('dev', 'staging', 'production')
   * @throws ConfigurationError if the specified environment is not found
   */
  setEnvironment(envName: string): void {
    const environment = this.environments.get(envName);
    if (!environment) {
      ErrorHandler.handleConfigurationError(
        `Environment '${envName}' not found. Available: ${Array.from(this.environments.keys()).join(', ')}`
      );
    }
    this.config.environment = environment!;
  }
}

export default ConfigManager.getInstance();
