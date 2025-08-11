import React from 'react';
import { FiPlus, FiZap } from 'react-icons/fi';
import { 
  ActionCard, 
  RecentBoards, 
  LoadingButton,
  Header,
  Footer,
  GitHubIcon
} from '../components/HomePage';
import { useHomePage } from '../hooks/useHomePage';
import { SEOHead } from '../components/SEOHead';
import { TurnstileProtection } from '@/components/TurnstileProtection';

export default function HomePage() {
  const {
    isLoading,
    createNewBoard,
  } = useHomePage();
  
  return (
    <>
      <SEOHead 
        title="Notes Board - Real-time Collaborative Workspace"
        description="Create and collaborate on digital notes in real-time. Powered by HPKV's ultra-fast WebSocket API and Zustand state management. Share boards instantly with your team."
        pageType="homepage"
      />
      <TurnstileProtection>
      <div className="min-h-screen flex items-center justify-center p-6 relative">
        <GitHubIcon />
        <div className="max-w-6xl w-full text-center" style={{ minWidth: 0 }}>
          <div className="flex flex-col items-center gap-8" style={{ minWidth: 0, width: '100%' }}>
            
            <Header />

            <div className="w-full max-w-md">
              <ActionCard
                icon={<FiPlus size={24} />}
                title="Create New Board"
                description="Start fresh with a new collaborative board"
              >
                <LoadingButton
                  onClick={createNewBoard}
                  isLoading={isLoading}
                  loadingText="Creating..."
                  variant="primary"
                  aria-label="Create a new collaborative board"
                >
                  <FiZap size={18} />
                  Create Board
                </LoadingButton>
              </ActionCard>
            </div>
            
            <RecentBoards />
            
            <Footer />

          </div>
        </div>
      </div>
      </TurnstileProtection>
    </>
  );
}