import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { IUser } from '@modules/user/interface/user.interface';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupService } from '@modules/group/services/group.service';
import { CBadRequestException } from '@shared/custom-http-exception';
import { ApiResponseCode } from '@shared/constants/api-response-code.constant';
import { GroupMemberService } from '@modules/group/services/groupMember.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly groupService: GroupService,
    private readonly groupMemberService: GroupMemberService,
  ) {}
  async create(createPostDto: CreatePostDto, user: IUser) {
    // Check group exists and user is member
    await this.groupService.findOne(createPostDto.groupId, user);
    return await this.postRepository.save({
      ...createPostDto,
      user: { id: user.id },
      group: { id: createPostDto.groupId },
    });
  }

  async findAll(
    groupId: number,
    user: IUser,
    offset = 1,
    limit = 10,
    startId?: number,
  ) {
    const skip = (offset - 1) * limit;
    const take = limit;
    // Check group exists and user is member
    await this.groupService.findOne(groupId, user);
    // Get posts in group
    const query = this.postRepository
      .createQueryBuilder('post')
      .innerJoinAndSelect('post.user', 'user')
      .innerJoinAndSelect('post.group', 'group')
      .select([
        'post',
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
      ])
      .addSelect(['group.id', 'group.name'])
      .where('group.id = :groupId', { groupId });
    if (startId) {
      query.andWhere('post.id < :startId', { startId });
    }
    const [posts, total] = await query.skip(skip).take(take).getManyAndCount();
    return {
      total,
      page: offset,
      pageSize: limit,
      data: posts,
    };
  }

  async findOne(id: number, user: IUser) {
    const query = this.postRepository
      .createQueryBuilder('post')
      .innerJoinAndSelect('post.user', 'user')
      .innerJoinAndSelect('post.group', 'group')
      .select([
        'post',
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
      ])
      .addSelect(['group.id', 'group.name'])
      .where('post.id = :id', { id });
    const post = await query.getOne();

    if (!post) {
      throw new CBadRequestException(
        PostService.name,
        'Post not found',
        ApiResponseCode.POST_NOT_FOUND,
        'Post not found',
      );
    }
    const userMember = await this.groupMemberService.findAll(post.group.id);
    const isMember = userMember.data.some(
      (member) => member.user.id === user.id,
    );

    if (!isMember) {
      throw new CBadRequestException(
        PostService.name,
        'Post not permission',
        ApiResponseCode.POST_NOT_PERMISSION,
        'You do not have permission to access this post',
      );
    }
    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    return await this.postRepository.update(
      { id },
      {
        ...updatePostDto,
        group: { id: updatePostDto.groupId },
      },
    );
  }

  async remove(id: number) {
    return await this.postRepository.update(id, {
      deletedAt: new Date(),
    });
  }
}
