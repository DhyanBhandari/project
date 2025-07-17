import { AuthService } from './authService';

class ApiClient {
  private baseURL = process.env.EXPO_PUBLIC_API_URL;

  private async getHeaders() {
    const token = await AuthService.getIdToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async post(endpoint: string, data: any) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async get(endpoint: string) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: await this.getHeaders(),
    });
    return response.json();
  }
}

export const apiClient = new ApiClient();
