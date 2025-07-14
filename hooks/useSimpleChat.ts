/**
 * @file hooks/useSimpleChat.ts
 * @description Simple chat hook for mobile responsiveness
 */

import { useState } from 'react';

export function useSimpleChat() {
  const [chatText, setChatText] = useState('');

  const handleSubmit = () => {
    if (chatText.trim()) {
      console.log('Sending message:', chatText);
      // Here you would typically send the message to your backend
      setChatText(''); // Clear input after sending
    }
  };

  return {
    chatText,
    setChatText,
    handleSubmit,
  };
}