import { Module } from '@nestjs/common';
import { GroupService } from './services/group.service';
import { GroupController } from './controllers/group.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/groupMember.entity';
import { UserModule } from '@modules/user/user.module';
import { GroupMemberController } from './controllers/groupMember.controller';
import { GroupMemberService } from './services/groupMember.service';

@Module({
  imports: [TypeOrmModule.forFeature([Group, GroupMember]), UserModule],
  controllers: [GroupController, GroupMemberController],
  providers: [GroupService, GroupMemberService],
  exports: [GroupService, GroupMemberService],
})
export class GroupModule {}
