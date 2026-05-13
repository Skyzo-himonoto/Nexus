import crypto from 'crypto';

interface MidtransConfig {
  serverKey: string;
  clientKey: string;
  sandbox: boolean;
}

interface TransactionResponse {
  paymentUrl: string;
  transactionId: string;
  statusCode: string;
  statusMessage: string;
  qrCode?: string;
}

export class MidtransProvider {
  private baseUrl: string;
  private serverKey: string;
  private clientKey: string;

  constructor(config: MidtransConfig) {
    this.serverKey = config.serverKey;
    this.clientKey = config.clientKey;
    this.baseUrl = config.sandbox 
      ? 'https://api.sandbox.midtrans.com/v2' 
      : 'https://api.midtrans.com/v2';
  }

  async createTransaction(data: {
    amount: number;
    transactionId: string;
    customerName: string;
    customerEmail: string;
    paymentMethod: string;
    returnUrl?: string;
  }): Promise<TransactionResponse> {
    const body = {
      transaction_details: {
        order_id: data.transactionId,
        gross_amount: data.amount,
      },
      customer_details: {
        first_name: data.customerName,
        email: data.customerEmail,
      },
      credit_card: {
        secure: true,
      },
      item_details: [
        {
          id: data.transactionId,
          price: data.amount,
          quantity: 1,
          name: `Payment ${data.transactionId}`,
        },
      ],
      callbacks: {
        finish: data.returnUrl || `${process.env.NEXTAUTH_URL}/payment/success`,
        error: `${process.env.NEXTAUTH_URL}/payment/error`,
      },
    };

    const authString = Buffer.from(`${this.serverKey}:`).toString('base64');

    const response = await fetch(`${this.baseUrl}/charge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    
    return {
      paymentUrl: result.redirect_url,
      transactionId: result.order_id,
      statusCode: result.status_code,
      statusMessage: result.status_message,
    };
  }

  async createVABank(data: {
    amount: number;
    transactionId: string;
    customerName: string;
    customerEmail: string;
    bank: string;
  }): Promise<TransactionResponse> {
    const body = {
      payment_type: 'bank_transfer',
      transaction_details: {
        order_id: data.transactionId,
        gross_amount: data.amount,
      },
      customer_details: {
        first_name: data.customerName,
        email: data.customerEmail,
      },
      bank_transfer: {
        bank: data.bank.toLowerCase(),
        va_number: this.generateVANumber(),
      },
    };

    const authString = Buffer.from(`${this.serverKey}:`).toString('base64');

    const response = await fetch(`${this.baseUrl}/charge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    
    return {
      paymentUrl: `https://simulator.sandbox.midtrans.com/bca/va/index?va=${result.va_numbers[0].va_number}`,
      transactionId: result.order_id,
      statusCode: result.status_code,
      statusMessage: result.status_message,
    };
  }

  async checkStatus(orderId: string): Promise<any> {
    const authString = Buffer.from(`${this.serverKey}:`).toString('base64');

    const response = await fetch(`${this.baseUrl}/${orderId}/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`,
      },
    });

    return await response.json();
  }

  async webhookHandler(payload: any): Promise<{ success: boolean; status: string; amount: number }> {
    const { order_id, transaction_status, gross_amount } = payload;
    
    let status = 'PENDING';
    let success = false;

    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      status = 'SUCCESS';
      success = true;
    } else if (transaction_status === 'deny' || transaction_status === 'cancel' || transaction_status === 'expire') {
      status = 'FAILED';
      success = false;
    } else if (transaction_status === 'pending') {
      status = 'PENDING';
      success = false;
    }

    return {
      success,
      status,
      amount: gross_amount,
    };
  }

  async refundHandler(transactionId: string, amount: number): Promise<{ success: boolean; message: string }> {
    const authString = Buffer.from(`${this.serverKey}:`).toString('base64');
    const body = {
      refund_amount: amount,
    };

    const response = await fetch(`${this.baseUrl}/${transactionId}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    
    return {
      success: result.status_code === '200',
      message: result.status_message,
    };
  }

  private generateVANumber(): string {
    return `9888${Math.floor(Math.random() * 10000000000)}`;
  }
  }
