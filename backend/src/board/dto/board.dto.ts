// backend/src/board/dto/board.dto.ts
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsString()
  @IsNotEmpty()
  authorId!: string;

  // 신규 게시글 알림 메일 표시용 (DB에는 저장하지 않고 itm-data-api로도 전달하지 않음)
  @IsString()
  @IsOptional()
  authorName?: string;

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
  postId!: number;

  @IsString()
  @IsNotEmpty()
  authorId!: string;

  // 답변 알림 메일 표시용 (DB에는 저장하지 않고 itm-data-api로도 전달하지 않음)
  @IsString()
  @IsOptional()
  authorRole?: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  parentId?: number;

  // 답변 완료 처리 시 itm-data-api로 함께 전달되는 상태값 (예: 'ANSWERED')
  @IsString()
  @IsOptional()
  status?: string;
}
