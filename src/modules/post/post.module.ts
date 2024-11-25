import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { GroupModule } from '@modules/group/group.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post]), GroupModule],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
