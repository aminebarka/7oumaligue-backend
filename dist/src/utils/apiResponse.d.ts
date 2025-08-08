import { Response } from 'express';
export declare const badRequest: (res: Response, message: string) => any;
export declare const unauthorized: (res: Response, message: string) => any;
export declare const created: (res: Response, data: any, message: string) => any;
export declare const success: (res: Response, data: any, message?: string) => any;
export declare const notFound: (res: Response, message: string) => any;
export declare const error: (res: Response, message: string, statusCode?: number) => any;
//# sourceMappingURL=apiResponse.d.ts.map