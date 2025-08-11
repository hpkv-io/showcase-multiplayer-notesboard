import { NextApiRequest, NextApiResponse } from 'next'
import { TokenHelper } from '@hpkv/zustand-multiplayer'
import { handleAPIError, getUserFriendlyErrorMessage } from '@/lib/utils'
import { validateHttpMethod, validateContentType, validateRequestBody, runValidations, validateTurnstile } from '@/lib/utils/security'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const turnstileToken = req.query.turnstileToken as string;
    
    const validation = runValidations(
      validateHttpMethod(req.method, ['POST']),
      validateContentType(req.headers['content-type']),
      validateRequestBody(req.body, 10000),
      await validateTurnstile(turnstileToken)
    );

    if (!validation.isValid && validation.error) {
      return res.status(validation.error.status).json({
        error: validation.error.error,
        message: validation.error.message
      });
    }

    //const { HPKV_API_KEY, HPKV_API_BASE_URL } = await getEnvironmentConfig();
    const HPKV_API_KEY = process.env.HPKV_API_KEY!;
    const HPKV_API_BASE_URL = process.env.HPKV_API_BASE_URL!;
    const tokenHelper = new TokenHelper(HPKV_API_KEY, HPKV_API_BASE_URL);
    const body = await req.body;
    const token = await tokenHelper.processTokenRequest(body);
  
    res.status(200).json(token);
  } catch (error) {
    handleAPIError('generate-token', error);
    res.status(500).json({ 
      error: 'Failed to generate token',
      message: getUserFriendlyErrorMessage(error)
    });
  }
}