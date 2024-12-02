import { PartialType } from '@nestjs/mapped-types';
import { CreateSubPostDto } from './create-sub-post.dto';

export class UpdateSubPostDto extends PartialType(CreateSubPostDto) {}
