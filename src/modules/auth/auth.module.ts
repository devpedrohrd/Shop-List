import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { PrismaService } from 'src/config/Database/Prisma.service'
import { JwtModule, JwtService } from '@nestjs/jwt'
import { EmailService } from '../email/email.service'
import { EmailModule } from '../email/email.module'
import { RedisService } from 'src/config/Redis/redis.service'

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: {
        expiresIn: '15m',
      },
    }),
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtService, EmailService, RedisService],
})
export class AuthModule {}
