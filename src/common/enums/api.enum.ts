export enum StatusCode {
    SUCCESS = 200,
    CREATED = 201,
    NOT_MODIFIED = 304,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    INTERNAL_SERVER = 500
}

export enum ResponseMessage {
    SUCCESS = 'Thành công',
    CREATED = 'Tạo mới thành công',
    NOT_MODIFIED = 'Dữ liệu không thay đổi',
    BAD_REQUEST = 'Yêu cầu không hợp lệ',
    UNAUTHORIZED = 'Không được phép truy cập',
    FORBIDDEN = 'Truy cập bị cấm',
    NOT_FOUND = 'Không tìm thấy dữ liệu',
    CONFLICT = 'Xung đột dữ liệu',
    INTERNAL_SERVER = 'Lỗi hệ thống'
}