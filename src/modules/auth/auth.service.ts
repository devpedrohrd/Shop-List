import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { PrismaService } from 'src/config/Database/Prisma.service'
import { CreateUserDto, UpdateUserDTO, UserRole } from './dto/create-user.dto'
import { compare, hash } from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { LoginUserDto, ResetPasswordDto, SendEmail } from './dto/login-user.dto'
import { EmailService } from '../email/email.service'
import { RedisService } from 'src/config/Redis/redis.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly redisService: RedisService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    })

    if (existingUser) {
      throw new ConflictException('User already exists')
    }

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: await hash(createUserDto.password, 10),
      },
      omit: {
        password: true,
        createdAt: true,
        type: true,
      },
    })
  }

  private async generateTokens(payload: {
    id: string
    email: string
    type: UserRole
  }): Promise<{ accessToken: string }> {
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRATION_THREE_DAYS,
    })

    return { accessToken }
  }

  async login(user: any) {
    const payload = {
      id: user.id,
      email: user.email,
      type: user.type,
    }

    const { accessToken } = await this.generateTokens(payload)

    return {
      access_token: accessToken,
    }
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })

    if (!user) {
      return null
    }

    const isPasswordValid = await compare(password, user.password)

    if (!isPasswordValid) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      type: user.type,
    }
  }

  async loginWithCredentials(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto

    const user = await this.validateUser(email, password)

    if (!user) {
      throw new UnauthorizedException('Invalid email or password')
    }

    return this.login(user)
  }

  async sendResetPasswordEmail({ email }: SendEmail) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    })
    if (!user) throw new NotFoundException('USER_NOT_FOUND')

    const code = Math.floor(100000 + Math.random() * 900000).toString()

    await this.redisService.set(`reset-password-code:${code}`, code, 15 * 60)

    await this.emailService.send({
      to: user.email,
      subject: 'Redefinição de Senha - Smart List',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px; background: #fafbfc;">
        <h2 style="color: #2d3748;">Olá, ${user.name || 'usuário'}!</h2>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Smart List</strong>.</p>
        <p>Para continuar, utilize o código abaixo:</p>
        <div style="text-align: center; margin: 32px 0;">
        <span style="display: inline-block; font-size: 2rem; letter-spacing: 8px; background: #f1f5f9; padding: 16px 32px; border-radius: 6px; color: #2563eb; font-weight: bold;">
          ${code}
        </span>
        </div>
        <p>Se você não solicitou a redefinição de senha, ignore este e-mail. Seu acesso permanecerá seguro.</p>
        <hr style="margin: 32px 0; border: none; border-top: 1px solid #e0e0e0;">
        <p style="font-size: 0.95em; color: #6b7280;">Atenciosamente,<br>Equipe Smart List</p>
      </div>
      `,
    })
  }

  async resetPassword({ token, newPassword, email }: ResetPasswordDto) {
    const storedToken = await this.redisService.get(
      `reset-password-code:${token}`,
    )

    if (storedToken !== token) {
      throw new BadRequestException('Invalid or expired reset token')
    }

    await this.redisService.delete(`reset-password-code:${token}`)

    const user = await this.prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    const hashedPassword = await hash(newPassword, 10)

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    return 'Password reset successfully'
  }

  async getUserInfo(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  async updateUserInfo(userId: string, updateData: UpdateUserDTO) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    return 'User info updated successfully'
  }
}
