// Format number => 1.000.000
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("en-US").format(num);
};

// Format Vietnamese currency => 1.200.000 ₫
export const formatVnCurrency = (num: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num);
};

// Format datetime => DD/MM/YYYY HH:mm
export const formatDateTime = (date: string | Date | number): string => {
  return new Date(date).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
