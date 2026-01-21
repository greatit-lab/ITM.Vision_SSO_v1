// backend/src/board/dto/board.dto.ts
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  authorId: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  isSecret?: string;

  // [추가] 팝업 여부 필드
  @IsString()
  @IsOptional()
  isPopup?: string;
}

export class CreateCommentDto {
  @IsNotEmpty()
  postId: number;

  @IsString()
  @IsNotEmpty()
  authorId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  parentId?: number;
}
