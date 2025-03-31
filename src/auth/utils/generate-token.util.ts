export const generateVerificationCode = (): string => {
    // Tạo số ngẫu nhiên từ 1000000 đến 9999999 (7 chữ số)
    return Math.floor(1000000 + Math.random() * 9000000).toString();
};