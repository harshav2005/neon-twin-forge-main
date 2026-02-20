// src/hooks/use-avatar.js

import { useState, useEffect } from "react";

const AVATAR_KEY = "user_avatar_url";

export function useAvatar() {
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem(AVATAR_KEY) || "/person.png");

  // Function to handle image file and convert it to a Data URL
  const updateAvatar = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newUrl = reader.result;
      localStorage.setItem(AVATAR_KEY, newUrl);
      setAvatarUrl(newUrl);
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    localStorage.removeItem(AVATAR_KEY);
    setAvatarUrl("/person.png");
  };

  // Ensure the latest stored value is used if the component remounts
  useEffect(() => {
    setAvatarUrl(localStorage.getItem(AVATAR_KEY) || "/person.png");
  }, []);

  return { avatarUrl, updateAvatar, removeAvatar };
}