import { AuthService } from './auth.service.js';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: any): Promise<{
        success: boolean;
        data: {
            access_token: string;
            user: {
                id: string;
                name: string;
                email: string;
            };
        };
    }>;
    login(loginDto: any): Promise<{
        success: boolean;
        data: {
            access_token: string;
            user: {
                id: string;
                name: string;
                email: string;
            };
        };
    }>;
    logout(): Promise<{
        success: boolean;
        message: string;
    }>;
    getProfile(req: any): {
        success: boolean;
        data: any;
    };
}
