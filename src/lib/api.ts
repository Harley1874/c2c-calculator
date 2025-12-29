import { invoke } from '@tauri-apps/api/core';

export interface C2CResponse {
  code: string;
  message: string | null;
  messageDetail: string | null;
  data: C2CAd[];
  total: number;
  success: boolean;
}

export interface C2CAd {
  adv: {
    advNo: string;
    classify: string;
    tradeType: string;
    asset: string;
    fiatUnit: string;
    price: string;
    initAmount: string;
    surplusAmount: string;
    amountAfterEditing: string;
    maxSingleTransAmount: string;
    minSingleTransAmount: string;
    // Add other fields as needed
  };
  advertiser: {
    userNo: string;
    realName: string | null;
    nickName: string;
    // Add other fields as needed
  };
}

export const getC2CList = async (): Promise<C2CResponse> => {
  const params = {
    fiat: 'CNY',
    page: 1,
    rows: 10,
    tradeType: 'SELL',
    asset: 'USDT',
    countries: [],
    proMerchantAds: false,
    shieldMerchantAds: true,
    filterType: 'tradable',
    periods: [],
    additionalKycVerifyFilter: 0,
    publisherType: null,
    payTypes: [],
    classifies: ['mass', 'profession', 'fiat_trade'],
    tradedWith: false,
    followed: false,
  };

  const response = await invoke<C2CResponse>('fetch_c2c_list', { payload: params });
  return response;
};
