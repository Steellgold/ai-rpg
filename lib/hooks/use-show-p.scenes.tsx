import { useState, useCallback, useEffect } from 'react';

const useShowScenes = () => {
  const [showPrevious, setShowPrevious] = useState(() => {
    const savedShowPrevious = localStorage.getItem('showPreviousScenes');
    return savedShowPrevious ? JSON.parse(savedShowPrevious) : false;
  });

  useEffect(() => {
    localStorage.setItem('showPreviousScenes', JSON.stringify(showPrevious));
  }, [showPrevious]);

  const toggle = useCallback(() => {
    setShowPrevious((prevState: any) => !prevState);
  }, []);

  return {
    showPreviousScenes: showPrevious,
    toggle,
  };
};

export default useShowScenes;