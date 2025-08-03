import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { AuthGuard } from '@nestjs/passport'
import { UserRole } from '../dto/create-user.dto'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {
    super()
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()

    const authorization = request.headers['authorization']

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new ForbiddenException('AUTHORIZATION_HEADER_NOT_FOUND')
    }

    const token = authorization.replace('Bearer ', '')
    let user: any

    try {
      user = await this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      })
      request['user'] = user
    } catch (error) {
      console.error('JwtAuthGuard: Error verifying token:', error)
      throw new ForbiddenException('INVALID_TOKEN')
    }

    try {
      const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
        'type',
        [context.getHandler(), context.getClass()],
      )

      if (!requiredRoles || requiredRoles.length === 0) {
        return true
      }

      if (!user.type) {
        throw new ForbiddenException('USER_LACKS_PERMISSION')
      }

      const hasRole = requiredRoles.includes(user.type)
      if (!hasRole) {
        throw new ForbiddenException(
          `USER_LACKS_PERMISSION: ${user.type} does not have access to this resource.`,
        )
      }

      return true
    } catch (err) {
      console.error('JwtAuthGuard: Error verifying roles:', err)
      throw new UnauthorizedException('Invalid or expired token.')
    }
  }
}
