import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
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
}
