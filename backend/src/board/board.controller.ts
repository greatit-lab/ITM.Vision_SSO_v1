// backend/src/board/board.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Delete,
  Put,
  Patch,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { BoardService } from "./board.service";
import { CreatePostDto, CreateCommentDto } from "./dto/board.dto";

@Controller("board")
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  /**
   * 팝업 공지 조회 (복구됨)
   */
  @Get('popups')
  async getPopupNotices(): Promise<any> {
    return this.boardService.getPopupNotices();
  }

  /**
   * 게시글 목록 조회
   */
  @Get()
  async getPosts(
    @Query("page") page = 1,
    @Query("limit") limit = 15,
    @Query("category") category = "ALL",
    @Query("search") search = "",
  ): Promise<any> {
    return this.boardService.getPosts({
      page: Number(page),
      limit: Number(limit),
      category,
      search,
    });
  }

  /**
   * 게시글 상세 조회
   */
  @Get(":id")
  async getPost(@Param("id", ParseIntPipe) id: number): Promise<any> {
    return this.boardService.getPost(id);
  }

  /**
   * 게시글 작성
   */
  @Post()
  @UsePipes(new ValidationPipe())
  async createPost(@Body() createPostDto: CreatePostDto): Promise<any> {
    return this.boardService.createPost(createPostDto);
  }

  /**
   * 게시글 수정
   * eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
   */
  @Put(":id")
  async updatePost(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateData: any,
  ): Promise<any> {
    return this.boardService.updatePost(id, updateData);
  }

  /**
   * 게시글 상태 변경
   */
  @Patch(":id/status")
  async updateStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body("status") status: string,
  ): Promise<any> {
    return this.boardService.updateStatus(id, status);
  }

  /**
   * 게시글 삭제
   */
  @Delete(":id")
  async deletePost(@Param("id", ParseIntPipe) id: number): Promise<any> {
    return this.boardService.deletePost(id);
  }

  /**
   * 댓글 작성
   */
  @Post("comment")
  @UsePipes(new ValidationPipe())
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<any> {
    return this.boardService.createComment(createCommentDto);
  }

  @Put('comment/:id')
  async updateComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: { content: string },
  ): Promise<any> {
    return this.boardService.updateComment(id, updateData.content);
  }

  @Delete('comment/:id')
  async deleteComment(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.boardService.deleteComment(id);
  }
}
