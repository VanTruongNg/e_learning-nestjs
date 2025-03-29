// Interface cho response thành công
export interface SuccessResponse<T> {
  status: number;
  message: string;
  data: T;
}

// Interface cho response lỗi
export interface ErrorResponse {
  status: number;
  message: string;
}