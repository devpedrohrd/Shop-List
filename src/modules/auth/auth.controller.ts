import { Controller, Post, Body, Req, Get, Patch } from '@nestjs/common'
import { AuthService } from './auth.service'
import { CreateUserDto, UpdateUserDTO } from './dto/create-user.dto'
import { LoginUserDto, ResetPasswordDto, SendEmail } from './dto/login-user.dto'
import { ApiResponse, ApiTags } from '@nestjs/swagger'

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
  })
  @ApiResponse({
    status: 409,
    description: 'User already exists',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto)
  }

  @Post('login')
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginWithCredentials(loginUserDto)
  }

  @Post('forgot-password')
  @ApiResponse({
    status: 200,
    description: 'Reset password email sent',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async forgotPassword(@Body() email: SendEmail) {
    return this.authService.sendResetPasswordEmail(email)
  }

  @Post('reset-password')
  @ApiResponse({
    status: 200,
    description: 'Password successfully reset',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto)
  }

  @Get('userInfo')
  @ApiResponse({
    status: 200,
    description: 'User info retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async userInfo(@Req() req: Request) {
    return this.authService.getUserInfo(req['user'].id)
  }

  @Patch('updateUserInfo')
  @ApiResponse({
    status: 200,
    description: 'User info updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async updateUserInfo(@Req() req: Request, @Body() updateData: UpdateUserDTO) {
    return this.authService.updateUserInfo(req['user'].id, updateData)
  }
}
