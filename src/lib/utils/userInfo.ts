import type { ClientInfo } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { handleStorageError } from './errorHandling';

const USER_NAMES = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry',
  'Ivy', 'Jack', 'Kate', 'Leo', 'Maya', 'Noah', 'Olivia', 'Paul',
  'Quinn', 'Ruby', 'Sam', 'Tara', 'Uma', 'Victor', 'Wendy', 'Xander',
  'Yara', 'Zoe', 'Alex', 'Blake', 'Casey', 'Drew', 'Emery', 'Finley'
];

const USER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
  '#10AC84', '#EE5A24', '#0984E3', '#6C5CE7', '#A29BFE',
  '#FD79A8', '#E84393', '#2D3436', '#636E72', '#74B9FF'
];

const generateUserName = (): string => {
  const randomIndex = Math.floor(Math.random() * USER_NAMES.length);
  const randomSuffix = Math.floor(Math.random() * 100);
  return `${USER_NAMES[randomIndex]}${randomSuffix}`;
};

const generateUserColor = (): string => {
  const randomIndex = Math.floor(Math.random() * USER_COLORS.length);
  return USER_COLORS[randomIndex];
};

const generateClientInfo = (): ClientInfo => {
  const id = uuidv4();
  return {
    id,
    name: generateUserName(),
    color: generateUserColor(),
    position: { x: 0, y: 0, lastUpdate: Date.now() },
    hidden: false
  };
};

declare global {
  interface Window {
    __notesClientInfo?: ClientInfo;
  }
}

export const getStoredClientInfo = (): ClientInfo => {
  if (typeof window !== 'undefined' && window.__notesClientInfo) {
    return window.__notesClientInfo;
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem('notesClientInfo');
      if (stored) {
        const parsedInfo = JSON.parse(stored);
        window.__notesClientInfo = parsedInfo;
        return parsedInfo;
      }
    } catch (error) {
      handleStorageError('parseStoredClientInfo', error);
    }
  }
  
  const clientInfo = generateClientInfo();

  if (typeof window !== 'undefined') {
    window.__notesClientInfo = clientInfo;
    try {
      sessionStorage.setItem('notesClientInfo', JSON.stringify(clientInfo));
    } catch (error) {
      handleStorageError('storeClientInfo', error);
    }
  }
  
  return clientInfo;
}; 