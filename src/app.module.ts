import { Module } from '@nestjs/common'
import { AuthModule } from './modules/auth/auth.module'
import { PrismaService } from './config/Database/Prisma.service'
import { EmailModule } from './modules/email/email.module'
import { ListModule } from './modules/list/list.module'

@Module({
  imports: [AuthModule, EmailModule, ListModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
