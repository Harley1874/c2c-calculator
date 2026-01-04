import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface RequestOptions extends RequestInit {
  skipErrorToast?: boolean;
}

export async function request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('auth_token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    if (!response.ok) {
        let errorMessage = `请求失败: ${response.status}`;
        try {
            const errorBody = await response.json();
            const msg = errorBody.message || errorBody.error;
            if (msg) {
                errorMessage = Array.isArray(msg) ? msg.join(', ') : msg;
            }
        } catch (e) {
            // ignore
        }
        
        // Handle 401 specifically if needed (e.g. redirect to login)
        // But for now just throw
        if (response.status === 401) {
            errorMessage = '认证失效，请重新登录';
            // Optional: trigger logout event
        }

        throw new Error(errorMessage);
    }

    if (response.status === 204) {
        return {} as T;
    }

    const text = await response.text();
    if (!text) return {} as T;
    
    try {
        return JSON.parse(text);
    } catch (e) {
        return text as unknown as T;
    }

  } catch (error: any) {
    const msg = error.message || '网络请求错误';
    if (!options.skipErrorToast) {
        toast.error(msg);
    }
    throw error;
  }
}


