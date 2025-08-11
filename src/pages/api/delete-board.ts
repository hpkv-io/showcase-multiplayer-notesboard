import { NextApiRequest, NextApiResponse } from 'next'
import { HPKVRestClient } from '@hpkv/rest-client'
import { handleAPIError, getUserFriendlyErrorMessage, getEnvironmentConfig } from '@/lib/utils'
import { validateHttpMethod, validateUuid, validateTurnstile, runValidations } from '@/lib/utils/security'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const boardId = req.query.boardId as string;
    const turnstileToken = req.query.turnstileToken as string;
    
    const validation = runValidations(
      validateHttpMethod(req.method, ['DELETE']),
      validateUuid(boardId, 'Board ID'),
      await validateTurnstile(turnstileToken)
    );

    if (!validation.isValid && validation.error) {
      return res.status(validation.error.status).json({
        error: validation.error.error,
        message: validation.error.message
      });
    }

    const { HPKV_API_KEY, HPKV_API_BASE_URL } = await getEnvironmentConfig();
    
    const hpkvRestClient = new HPKVRestClient(
      HPKV_API_BASE_URL, 
      "https://nexus.hpkv.io", 
      HPKV_API_KEY
    );
    let currentStart = `notes-board-${boardId}`;
    let hasMore = true;
    let deletedCount = 0;
    
    while (hasMore) {
      const batchResult = await hpkvRestClient.range(currentStart, `notes-board-${boardId}\xff`, 100);
      if (!batchResult || !batchResult.records || batchResult.records.length === 0) {
        hasMore = false;
        break;
      }
      
      const deletePromises = batchResult.records.map(async (item) => {  
        await hpkvRestClient.delete(item.key);
        deletedCount++;
      });
      await Promise.all(deletePromises);

      if (batchResult.truncated) {
        const lastKey = batchResult.records[batchResult.records.length - 1].key;
        currentStart = lastKey;
      } else {
        hasMore = false;
      }
    }
    
    res.status(200).json({message: `Board deleted. ${deletedCount} items deleted.`});
  } catch (error) {
    handleAPIError('delete-board', error);
    res.status(500).json({ 
      error: 'Failed to delete board',
      message: getUserFriendlyErrorMessage(error)
    });
  }
}