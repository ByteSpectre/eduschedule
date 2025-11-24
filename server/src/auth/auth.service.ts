import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { BranchType, OrganizationType, User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AuthResponse } from './interfaces/auth-response.interface';
import { RegisterOrganizationDto } from './dto/register-organization.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async registerOrganization(
    dto: RegisterOrganizationDto,
  ): Promise<AuthResponse> {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: dto.organizationName,
          email: dto.email,
          city: dto.city,
          type: dto.organizationType ?? OrganizationType.UNIVERSITY,
        },
      });

      await tx.branch.create({
        data: {
          name: dto.branchName ?? 'Главный филиал',
          organizationId: organization.id,
          type: dto.organizationType as unknown as BranchType,
          city: dto.city,
          address: '—',
        },
      });

      return tx.user.create({
        data: {
          email: dto.email,
          passwordHash: hashedPassword,
          role: UserRole.ORG_ADMIN,
          organizationId: organization.id,
        },
      });
    });

    return this.buildAuthResponse(user);
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    return user;
  }

  login(user: User): AuthResponse {
    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: User): AuthResponse {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      user: this.sanitizeUser(user),
      accessToken: this.jwtService.sign(payload, this.getJwtOptions()),
    };
  }

  private getJwtOptions(): JwtSignOptions {
    const expiresIn =
      (this.configService.get<string>('JWT_EXPIRES_IN') ?? '3600s') as StringValue;
    return {
      secret: this.configService.get<string>(
        'JWT_SECRET',
        'super-secret-jwt-key',
      ),
      expiresIn,
    };
  }

  private sanitizeUser(user: User) {
    // Expose minimal info to clients
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _passwordHash, ...rest } = user;
    return rest;
  }
}
