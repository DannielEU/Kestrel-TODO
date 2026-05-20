import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { WorkComment } from './comment.entity';
import { CreateCommentInput } from './dto/create-comment.input';
import { PasetoGuard } from 'src/auth/guard/paseto.guard';

type GqlCtx = { req: { user: { sub: string } } };

@Resolver(() => WorkComment)
export class CommentsResolver {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(PasetoGuard)
  @Query(() => [WorkComment], { name: 'workComments' })
  findByWork(@Args('workId') workId: string) {
    return this.commentsService.findByWork(workId);
  }

  @UseGuards(PasetoGuard)
  @Mutation(() => WorkComment)
  createComment(
    @Args('createCommentInput') input: CreateCommentInput,
    @Context() ctx: GqlCtx,
  ) {
    return this.commentsService.create(input, ctx.req.user.sub);
  }
}
