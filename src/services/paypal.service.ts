import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

interface IBody {
  price: number;
  refId: string;
  description: string;
  user: string;
  name: string;
}
@Injectable()
export class PayPalService {
  private readonly paypalBaseUrl = process.env.PAYPAL_BASE_URL;
  private readonly clientId = process.env.PAYPAL_CLIENT_ID;
  private readonly clientSecret = process.env.PAYPAL_SECRET;

  // Function to generate PayPal access token
  private async generateAccessToken(): Promise<string> {
    try {
      const response = await axios({
        url: `${this.paypalBaseUrl}/v1/oauth2/token`,
        method: 'post',
        data: 'grant_type=client_credentials',
        auth: {
          username: this.clientId,
          password: this.clientSecret,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.data.access_token;
    } catch (error) {
      throw new HttpException(
        'Failed to generate access token',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  public async createOrder(body: IBody) {
    const accessToken = await this.generateAccessToken();
    try {
      const response = await axios({
        url: `${this.paypalBaseUrl}/v2/checkout/orders`,
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        data: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              items: [
                {
                  name: body.name,
                  description: body.description,
                  quantity: 1,
                  unit_amount: {
                    currency_code: 'USD',
                    value: body.price,
                  },
                },
              ],
              amount: {
                currency_code: 'USD',
                value: body.price,
                breakdown: {
                  item_total: {
                    currency_code: 'USD',
                    value: body.price,
                  },
                },
              },
            },
          ],
          application_context: {
            return_url: `${process.env.BASE_URL}/paypal/success`,
            cancel_url: `${process.env.BASE_URL}/paypal/cancel`,
            shipping_preference: 'NO_SHIPPING',
            user_action: 'PAY_NOW',
            brand_name: 'manfra.io',
          },
        }),
      });
      const result = {
        item: body.refId,
        user: body.user,
        orderId: response.data.id,
      };

      console.log(result);

      const approvalUrl = response.data.links.find(
        (link) => link.rel === 'approve',
      ).href;
      return {
        url: approvalUrl,
        orderId: response.data.id,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Failed to create PayPal order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  public async capturePayment(orderId: string): Promise<any> {
    const accessToken = await this.generateAccessToken();

    try {
      const response = await axios({
        url: `${this.paypalBaseUrl}/v2/checkout/orders/${orderId}/capture`,
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data.status != 'COMPLETED') {
        return { status: 'fail' };
      }
      const result = response.data.id;
      return result;
    } catch (error) {
      throw new HttpException(
        'Failed to capture PayPal payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
