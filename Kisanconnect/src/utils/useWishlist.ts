import { useState, useEffect } from 'react';

export function useWishlist() {
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const local = localStorage.getItem('kisan_wishlist');
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('kisan_wishlist', JSON.stringify(savedIds));
    } catch (e) {
      console.error('Failed to save wishlist', e);
    }
  }, [savedIds]);

  const toggleWishlist = (id: string) => {
    setSavedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const isSaved = (id: string) => savedIds.includes(id);

  return { savedIds, toggleWishlist, isSaved };
}