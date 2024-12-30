interface User {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
    updatedAt: Date;
    token: string;
}

interface Goal {
    id: string;
    name: string;
    description: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}


interface SuccessResponse<T> {
    data: T;
}


interface ErrorResponse {
    error: string;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
export type { User, Goal, SuccessResponse, ErrorResponse};