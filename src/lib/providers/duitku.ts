import crypto from 'crypto';

interface DuitkuConfig {
  merchantCode: string;
  apiKey: string;
  sandbox: boolean;
}

interface TransactionResponse {
  paymentUrl: string;
  transactionId: string;
  statusCode: string;
  statusMessage: string;
  qrCode?: string;
}

interface StatusResponse {
  statusCode: string;
  statusMessage: string;
  transactionStatus: string;
  paymentAmount: number;
  paymentMethod: string;
}

export class DuitkuProvider {
  private baseUrl: string;
  private merchantCode: string;
  private apiKey: string;

  constructor(config: DuitkuConfig) {
    this.merchantCode = config.merchantCode;
    this.apiKey = config.apiKey;
    this.baseUrl = config.sandbox 
      ? 'https://sandbox.duitku.com/api' 
      : 'https://passport.duitku.com/api';
  }

  async createTransaction(data: {
    amount: number;
    transactionId: string;
    customerName: string;
    customerEmail: string;
    paymentMethod: string;
    returnUrl?: string;
    callbackUrl?: string;
  }): Promise<TransactionResponse> {
    const body = {
      merchantCode: this.merchantCode,
      paymentAmount: data.amount,
      paymentMethod: data.paymentMethod,
      merchantOrderId: data.transactionId,
      productDetails: `Payment ${data.transactionId}`,
      email: data.customerEmail,
      customerName: data.customerName,
      returnUrl: data.returnUrl || `${process.env.NEXTAUTH_URL}/payment/success`,
      callbackUrl: data.callbackUrl || `${process.env.NEXTAUTH_URL}/api/webhook/duitku`,
      signature: this.generateSignature(data.amount, data.transactionId),
      expiryPeriod: 24, // 24 jam
    };

    const response = await fetch(`${this.baseUrl}/v2/inquiry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    
    return {
      paymentUrl: result.paymentUrl,
      transactionId: result.merchantOrderId,
      statusCode: result.statusCode,
      statusMessage: result.statusMessage,
      qrCode: result.qrCode,
    };
  }

  async checkStatus(merchantOrderId: string): Promise<StatusResponse> {
    const body = {
      merchantCode: this.merchantCode,
      merchantOrderId: merchantOrderId,
    };

    const response = await fetch(`${this.baseUrl}/v2/check-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    return await response.json();
  }

  async webhookHandler(payload: any): Promise<{ success: boolean; status: string; amount: number }> {
    const { merchantOrderId, paymentAmount, statusCode } = payload;
    
    const isSuccess = statusCode === "00" || statusCode === "0000";
    
    return {
      success: isSuccess,
      status: isSuccess ? "SUCCESS" : "FAILED",
      amount: paymentAmount,
    };
  }

  async refundHandler(transactionId: string, amount: number): Promise<{ success: boolean; message: string }> {
    const body = {
      merchantCode: this.merchantCode,
      merchantOrderId: transactionId,
      refundAmount: amount,
    };

    const response = await fetch(`${this.baseUrl}/v2/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    
    return {
      success: result.statusCode === "00",
      message: result.statusMessage,
    };
  }

  private generateSignature(amount: number, merchantOrderId: string): string {
    const hash = crypto.createHash('md5');
    const signatureString = this.merchantCode + merchantOrderId + amount + this.apiKey;
    return hash.update(signatureString).digest('hex');
  }
  }
