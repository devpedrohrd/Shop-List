import { SetMetadata } from '@nestjs/common'
import { UserRole } from 'src/modules/auth/dto/create-user.dto'

export const Roles = (...roles: UserRole[]) => SetMetadata('type', roles)
