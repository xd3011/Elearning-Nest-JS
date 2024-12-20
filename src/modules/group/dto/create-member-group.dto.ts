import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AddMemberDto {
  @IsNumber()
  groupId: number;

  @IsNumber()
  memberId: number;
}

export class MemberJoinGroup {
  @IsString()
  codeJoin: string;
}
