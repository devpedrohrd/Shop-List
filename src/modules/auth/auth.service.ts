import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { PrismaService } from 'src/config/Database/Prisma.service'
import { CreateUserDto, UserRole } from './dto/create-user.dto'
import { compare, hash } from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { LoginUserDto, ResetPasswordDto, SendEmail } from './dto/login-user.dto'
import { EmailService } from '../email/email.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
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

    const token = this.jwtService.sign(
      { id: user.id, email: user.email },
      {
        secret: process.env.JWT_RESET_PASSWORD_SECRET,
        expiresIn: process.env.JWT_RESET_PASSWORD_EXPIRATION_15_MINUTES,
      },
    )

    const resetLink = `${process.env.APP_URL}/auth/reset-password?token=${token}`

    await this.emailService.send({
      to: user.email,
      subject: 'Redefinição de senha',
      html: `<p>Clique no link para redefinir sua senha: <a href="${resetLink}">${resetLink}</a></p>`,
    })

    return `Email sended to ${user.email} with reset instructions`
  }

  async resetPassword({ token, newPassword }: ResetPasswordDto) {
    let payload: any
    try {
      payload = this.jwtService.verify(token, {
        secret: process.env.JWT_RESET_PASSWORD_SECRET,
      })
    } catch (error) {
      throw new BadRequestException('Invalid or expired token')
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
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
}
