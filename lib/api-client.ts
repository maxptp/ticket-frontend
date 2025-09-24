import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";

// API client configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const DEFAULT_TIMEOUT = 30000; // 30 seconds

// API response and error types
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: any;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    // Create axios instance with default config
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: DEFAULT_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Setup request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Get token from localStorage or other storage method
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("auth_token")
            : null;

        // Add authorization header if token exists
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Setup response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError) => {
        const response = error.response;

        // Handle authentication errors
        if (response?.status === 401) {
          // Redirect to login or refresh token
          if (typeof window !== "undefined") {
            // Optional: localStorage.removeItem('auth_token');
            // Optional: window.location.href = '/login';
          }
        }

        // Format error for consistent handling
        const apiError: ApiError = {
          message:
            response?.data &&
            typeof response.data === "object" &&
            "message" in response.data
              ? String(response.data.message)
              : error.message || "An unexpected error occurred",
          statusCode: response?.status || 500,
          error: response?.data || error,
        };

        return Promise.reject(apiError);
      }
    );
  }

  // Generic request method
  private async request<T>(
    config: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.client(config);
      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error) {
      throw error;
    }
  }

  // HTTP methods
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.request<T>({ method: "GET", url, params });
    return response.data;
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.request<T>({
      method: "POST",
      url,
      data,
      ...config,
    });
    return response.data;
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.request<T>({
      method: "PUT",
      url,
      data,
      ...config,
    });
    return response.data;
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.request<T>({
      method: "PATCH",
      url,
      data,
      ...config,
    });
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.request<T>({
      method: "DELETE",
      url,
      ...config,
    });
    return response.data;
  }

  // // Method to set auth token programmatically
  // setAuthToken(token: string | null): void {
  //   if (token) {
  //     localStorage.setItem("auth_token", token);
  //   } else {
  //     localStorage.removeItem("auth_token");
  //   }
  // }

  // setRefreshToken(token: string | null): void {
  //   if (token) {
  //     localStorage.setItem("refresh_token", token);
  //   } else {
  //     localStorage.removeItem("refresh_token");
  //   }
  // }
}

// Create a single instance to use throughout the app
const apiClient = new ApiClient();
export default apiClient;
