export namespace C2C {
  interface AdItem {
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
}
