import { useEffect, useState } from 'react';

const TypewriterText = ({ text = '', speed = 18, className = '', onComplete, as: Tag = 'p' }) => {
  const characters = Array.from(text);
  const [visibleCount, setVisibleCount] = useState(0);
  const isComplete = visibleCount >= characters.length;

  useEffect(() => {
    if (characters.length === 0) return undefined;

    const timer = window.setInterval(() => {
      setVisibleCount(current => {
        const next = Math.min(current + 1, characters.length);
        if (next === characters.length) window.clearInterval(timer);
        return next;
      });
    }, speed);

    return () => window.clearInterval(timer);
  }, [text, speed]);

  useEffect(() => {
    if (isComplete && characters.length > 0) onComplete?.();
  }, [isComplete, text]);

  const revealAll = () => {
    if (!isComplete) setVisibleCount(characters.length);
  };

  return (
    <Tag
      className={className}
      onClick={revealAll}
      onKeyDown={event => {
        if (!isComplete && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          revealAll();
        }
      }}
      role={isComplete ? undefined : 'button'}
      tabIndex={isComplete ? undefined : 0}
    >
      {characters.slice(0, visibleCount).join('')}
      {!isComplete && <span className="ml-0.5 inline-block animate-pulse text-amber-200">▍</span>}
    </Tag>
  );
};

export default TypewriterText;
