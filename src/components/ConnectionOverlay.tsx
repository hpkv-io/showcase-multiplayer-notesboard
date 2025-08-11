import React, { memo, useEffect, useRef } from 'react';
import { useConnectionStatus } from '@/contexts/BoardContext';
import { ConnectionState } from '@hpkv/websocket-client';
import { FiWifiOff, FiLoader, FiAlertCircle } from 'react-icons/fi';

const ConnectionOverlayComponent: React.FC = () => {
  const connectionState = useConnectionStatus();
  const hasBeenConnectedRef = useRef(false);
  const isUnloadingRef = useRef(false);
  
  useEffect(() => {
    if (connectionState === ConnectionState.CONNECTED) {
      hasBeenConnectedRef.current = true;
    }
  }, [connectionState]);
  
  useEffect(() => {
    const handleBeforeUnload = () => {
      isUnloadingRef.current = true;
    };
    
    const handleUnload = () => {
      isUnloadingRef.current = true;
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, []);
  
  const shouldShowOverlay = 
    !isUnloadingRef.current && (
      !connectionState || 
      connectionState === ConnectionState.CONNECTING ||
      connectionState === ConnectionState.DISCONNECTED ||
      connectionState === ConnectionState.DISCONNECTING
    );

  if (!shouldShowOverlay) {
    return null;
  }

  let icon: React.ReactNode;
  let title: string;
  let message: string;
  let overlayBg = '';
  let iconColorValue = 'rgb(107, 114, 128)';

  if (!connectionState) {
    icon = <FiLoader className="animate-spin" size={48} />;
    title = 'Loading Board';
    message = 'Connecting to collaborative workspace...';
    overlayBg = 'linear-gradient(135deg, rgba(107, 114, 128, 0.9), rgba(75, 85, 99, 0.9))';
    iconColorValue = 'rgb(75, 85, 99)';
  } else {
    switch (connectionState) {
      case ConnectionState.CONNECTING:
        icon = <FiLoader className="animate-spin" size={48} />;
        title = 'Connecting';
        message = 'Establishing connection to the board...';
        overlayBg = 'linear-gradient(135deg, rgba(107, 114, 128, 0.9), rgba(75, 85, 99, 0.9))';
        iconColorValue = 'rgb(75, 85, 99)';
        break;
      
      case ConnectionState.DISCONNECTED:
        if (hasBeenConnectedRef.current) {
          icon = <FiWifiOff size={48} />;
          title = 'Connection Lost';
          message = 'Attempting to reconnect to the collaborative board...';
          overlayBg = 'linear-gradient(135deg, rgba(75, 85, 99, 0.9), rgba(55, 65, 81, 0.9))';
          iconColorValue = 'rgb(55, 65, 81)';
        } else {
          icon = <FiLoader className="animate-spin" size={48} />;
          title = 'Loading Board';
          message = 'Setting up your collaborative workspace...';
          overlayBg = 'linear-gradient(135deg, rgba(107, 114, 128, 0.9), rgba(75, 85, 99, 0.9))';
          iconColorValue = 'rgb(75, 85, 99)';
        }
        break;
      
      case ConnectionState.DISCONNECTING:
        icon = <FiLoader className="animate-spin" size={48} />;
        title = 'Disconnecting';
        message = 'Closing connection...';
        overlayBg = 'linear-gradient(135deg, rgba(156, 163, 175, 0.9), rgba(107, 114, 128, 0.9))';
        iconColorValue = 'rgb(107, 114, 128)';
        break;
      case undefined:
        icon = <FiLoader className="animate-spin" size={48} />;
        title = 'Loading Board';
        message = 'Connecting to collaborative workspace...';
        overlayBg = 'linear-gradient(135deg, rgba(107, 114, 128, 0.9), rgba(75, 85, 99, 0.9))';
        iconColorValue = 'rgb(75, 85, 99)';
        break;
      default:
        icon = <FiAlertCircle size={48} />;
        title = 'Connection Issue';
        message = 'Checking connection status...';
        overlayBg = 'linear-gradient(135deg, rgba(75, 85, 99, 0.9), rgba(55, 65, 81, 0.9))';
        iconColorValue = 'rgb(55, 65, 81)';
    }
  }

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-[10000] backdrop-blur-md fade-in"
      style={{ background: overlayBg }}
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="connection-title"
    >
      <div 
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '48px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgb(229, 231, 235)',
          textAlign: 'center',
          maxWidth: '500px',
          width: '90%',
          animation: 'slideIn 0.4s ease-out',
          minWidth: '320px'
        }}
      >
        <div style={{ marginBottom: '24px', color: iconColorValue }}>
          {icon}
        </div>
        
        <h2 
          id="connection-title" 
          style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'rgb(30, 41, 59)',
            margin: '0 0 16px 0',
            lineHeight: '1.3',
            whiteSpace: 'normal',
            wordBreak: 'normal'
          }}
        >
          {title}
        </h2>
        
        <p style={{
          fontSize: '1rem',
          color: 'rgb(100, 116, 139)',
          margin: '0 0 32px 0',
          lineHeight: '1.5',
          maxWidth: '400px',
          marginLeft: 'auto',
          marginRight: 'auto',
          whiteSpace: 'normal',
          wordBreak: 'normal'
        }}>
          {message}
        </p>
        
        <div style={{ marginTop: '24px' }}>
          <div style={{
            width: '100%',
            height: '4px',
            background: 'rgb(229, 231, 235)',
            borderRadius: '2px',
            overflow: 'hidden',
            marginBottom: '12px'
          }}>
            <div 
              style={{
                height: '100%',
                borderRadius: '2px',
                background: 'linear-gradient(90deg, rgb(107, 114, 128), rgb(75, 85, 99))',
                animation: 'progressSlide 2s ease-in-out infinite'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ConnectionOverlay = memo(ConnectionOverlayComponent);
ConnectionOverlay.displayName = 'ConnectionOverlay';

export default ConnectionOverlay; 