// 定义通用的业务类型

export interface CalculationHistory {
  id: string;
  name?: string;
  timestamp: number;
  price: number;
  amount: number;
  total: number;
  isFavorite?: boolean;
}

export interface C2CAdItem {
  adv: {
    price: string;
    // 其他字段按需添加
  };
  advertiser: {
    nickName: string;
    // 其他字段按需添加
  };
}

// Auth Types
export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    username: string;
  };
}
