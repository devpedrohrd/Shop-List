import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsEmail } from 'class-validator'

export class LoginUserDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The email of the user',
    example: 'john.doe@example.com',
  })
  email: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The password of the user',
    example: 'password123',
  })
  password: string
}

export class SendEmail {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The email address to send the reset password link',
    example: 'user@example.com',
  })
  email: string
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The new password for the user',
    example: 'newpassword123',
  })
  newPassword: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The reset token for password reset',
    example: '123456',
  })
  token: string
  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string
}
