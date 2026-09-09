import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: any) {
    const { name, email, password } = registerDto;
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const newUser = await this.usersService.create({
      name,
      email,
      password_hash,
    });

    const payload = { sub: newUser.id, email: newUser.email };
    return {
      success: true,
      data: {
        access_token: this.jwtService.sign(payload),
        user: { id: newUser.id, name: newUser.name, email: newUser.email },
      },
    };
  }

  async login(loginDto: any) {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    return {
      success: true,
      data: {
        access_token: this.jwtService.sign(payload),
        user: { id: user.id, name: user.name, email: user.email },
      },
    };
  }
}
