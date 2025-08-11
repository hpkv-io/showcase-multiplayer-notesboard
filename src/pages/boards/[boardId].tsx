import React from 'react';
import { GetServerSideProps } from 'next';
import { BoardProvider } from '@/contexts/BoardContext';
import { BoardErrorBoundary } from '@/components/Board/BoardErrorBoundary';
import NotesBoard from '@/components/Board/NotesBoard';
import { SEOHead } from '@/components/SEOHead';
import { TurnstileProtection } from '@/components/TurnstileProtection';
import { logError, ErrorSeverity, validateUuid } from '@/lib/utils';

interface BoardPageProps {
  boardId: string;
}

const BoardPage: React.FC<BoardPageProps> = ({ boardId }) => {
  const handleBoardError = (error: Error) => {
    logError(error, {
      message: 'Board initialization error',
      code: 'BOARD_INIT_FAILED',
      severity: ErrorSeverity.HIGH,
      context: { boardId, page: 'board-page' }
    });
  };

  return (
    <>
      <SEOHead 
        title={`Board ${boardId.slice(0, 8)}... | Notes Board`}
        description={`Collaborative notes board ${boardId.slice(0, 8)}. Create, edit, and share notes in real-time with your team.`}
        pageType="board"
        boardId={boardId}
      />
      <TurnstileProtection skipInitialVerification>
        <BoardErrorBoundary onError={handleBoardError}>
          <BoardProvider 
            boardId={boardId} 
            onError={handleBoardError}
          >
            <NotesBoard />
          </BoardProvider>
        </BoardErrorBoundary>
      </TurnstileProtection>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { boardId } = context.params!;
  
  const validation = validateUuid(boardId as string, 'Board ID');
  
  if (!validation.isValid) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      boardId,
    },
  };
};

export default BoardPage; 