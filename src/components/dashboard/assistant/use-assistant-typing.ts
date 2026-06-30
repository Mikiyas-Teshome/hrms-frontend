'use client';

import * as React from 'react';

const getTypingInterval = (length: number) => {
  if (length > 2000) return 5;
  if (length > 1000) return 7;
  if (length > 500) return 10;
  return 12;
};

const getTypingChunkSize = (length: number) => {
  if (length > 1500) return 6;
  if (length > 800) return 4;
  if (length > 400) return 3;
  return 2;
};

export function useAssistantTyping(
  text: string,
  enabled: boolean,
  onProgress?: () => void,
) {
  const [displayedLength, setDisplayedLength] = React.useState(enabled ? 0 : text.length);
  const [isComplete, setIsComplete] = React.useState(!enabled);
  const onProgressRef = React.useRef(onProgress);

  React.useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  React.useEffect(() => {
    if (!enabled) {
      setDisplayedLength(text.length);
      setIsComplete(true);
      return;
    }

    if (!text) {
      setDisplayedLength(0);
      setIsComplete(true);
      return;
    }

    setDisplayedLength(0);
    setIsComplete(false);

    const chunkSize = getTypingChunkSize(text.length);
    const intervalMs = getTypingInterval(text.length);
    let currentLength = 0;

    const timer = window.setInterval(() => {
      currentLength = Math.min(currentLength + chunkSize, text.length);
      setDisplayedLength(currentLength);
      onProgressRef.current?.();

      if (currentLength >= text.length) {
        window.clearInterval(timer);
        setIsComplete(true);
      }
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [text, enabled]);

  return {
    displayedText: text.slice(0, displayedLength),
    isTyping: enabled && !isComplete,
    isComplete,
  };
}
