const TESTSPRITE_API_KEY = import.meta.env.VITE_TESTSPRITE_API_KEY;
const TESTSPRITE_API_URL = import.meta.env.VITE_TESTSPRITE_API_URL || 'https://api.testsprite.com';

export interface TestSpriteError {
  type?: string;
  message?: string;
  stack?: string;
  componentStack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  error?: string;
  reason?: string;
  timestamp: string;
  url?: string;
  userAgent?: string;
}

export interface TestSpriteTestResult {
  testId: string;
  status: 'passed' | 'failed' | 'error';
  errors: TestSpriteError[];
  screenshots?: string[];
  video?: string;
  duration: number;
}

export interface TestSpriteTestConfig {
  url: string;
  testName?: string;
  instructions?: string;
  timeout?: number;
  screenshots?: boolean;
  video?: boolean;
}

class TestSpriteClient {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = TESTSPRITE_API_KEY || '';
    this.apiUrl = TESTSPRITE_API_URL;
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  async logError(error: TestSpriteError): Promise<void> {
    if (!this.isConfigured()) {
      console.warn('TestSprite API key not configured');
      return;
    }

    try {
      const errorData = {
        ...error,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      };

      await fetch(`${this.apiUrl}/v1/errors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(errorData),
      });
    } catch (err) {
      console.error('Failed to log error to TestSprite:', err);
    }
  }

  async runTest(config: TestSpriteTestConfig): Promise<TestSpriteTestResult> {
    if (!this.isConfigured()) {
      throw new Error('TestSprite API key not configured');
    }

    try {
      const response = await fetch(`${this.apiUrl}/v1/tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          url: config.url,
          test_name: config.testName || 'Automated Test',
          instructions: config.instructions || 'Run comprehensive error inspection',
          timeout: config.timeout || 30000,
          screenshots: config.screenshots !== false,
          video: config.video !== false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`TestSprite API error: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      console.error('Failed to run TestSprite test:', err);
      throw err;
    }
  }

  async getTestResult(testId: string): Promise<TestSpriteTestResult | null> {
    if (!this.isConfigured()) {
      throw new Error('TestSprite API key not configured');
    }

    try {
      const response = await fetch(`${this.apiUrl}/v1/tests/${testId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`TestSprite API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Failed to get TestSprite test result:', err);
      return null;
    }
  }

  async listErrors(filters?: {
    startDate?: string;
    endDate?: string;
    type?: string;
  }): Promise<TestSpriteError[]> {
    if (!this.isConfigured()) {
      throw new Error('TestSprite API key not configured');
    }

    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('start_date', filters.startDate);
      if (filters?.endDate) params.append('end_date', filters.endDate);
      if (filters?.type) params.append('type', filters.type);

      const response = await fetch(`${this.apiUrl}/v1/errors?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`TestSprite API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Failed to list TestSprite errors:', err);
      return [];
    }
  }
}

export const testSpriteClient = new TestSpriteClient();

// Setup window.testsprite untuk backward compatibility
if (typeof window !== 'undefined') {
  (window as any).testsprite = {
    logError: (error: TestSpriteError) => {
      testSpriteClient.logError(error);
    },
  };
}

