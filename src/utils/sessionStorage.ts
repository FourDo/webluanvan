// Utility functions cho session storage

export const saveToSessionStorage = (key: string, data: any) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Lỗi khi lưu vào session storage:', error);
  }
};

export const getFromSessionStorage = (key: string) => {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Lỗi khi đọc từ session storage:', error);
    return null;
  }
};

export const removeFromSessionStorage = (key: string) => {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error('Lỗi khi xóa từ session storage:', error);
  }
};

export const clearSessionStorage = () => {
  try {
    sessionStorage.clear();
  } catch (error) {
    console.error('Lỗi khi xóa toàn bộ session storage:', error);
  }
};

// Kiểm tra xem dữ liệu có cũ không (quá 30 phút)
export const isDataStale = (timestamp: number, maxAgeMinutes: number = 30) => {
  const maxAge = maxAgeMinutes * 60 * 1000; // Chuyển đổi thành milliseconds
  return Date.now() - timestamp > maxAge;
};

// Lưu dữ liệu với timestamp
export const saveWithTimestamp = (key: string, data: any) => {
  const dataWithTimestamp = {
    data,
    timestamp: Date.now()
  };
  saveToSessionStorage(key, dataWithTimestamp);
};

// Lấy dữ liệu với timestamp
export const getWithTimestamp = (key: string, maxAgeMinutes: number = 30) => {
  const item = getFromSessionStorage(key);
  if (!item || !item.timestamp) return null;
  
  if (isDataStale(item.timestamp, maxAgeMinutes)) {
    removeFromSessionStorage(key);
    return null;
  }
  
  return item.data;
};

// Xóa dữ liệu navbar cũ
export const clearNavbarData = () => {
  removeFromSessionStorage('navbar_categories');
  removeFromSessionStorage('navbar_products');
  removeFromSessionStorage('navbar_timestamp');
}; 