import { Resolver, Query, Args } from '@nestjs/graphql';
import { HistoryService } from './history.service';
import { HistoryEntry } from './history.entity';
import { PasetoGuard } from 'src/auth/guard/paseto.guard';
import { UseGuards } from '@nestjs/common';

@Resolver(() => HistoryEntry)
export class HistoryResolver {
  constructor(private readonly historyService: HistoryService) {}

  @UseGuards(PasetoGuard)
  @Query(() => [HistoryEntry], { name: 'history' })
  findByEntity(
    @Args('entityId') entityId: string,
    @Args('entityType') entityType: string,
  ) {
    return this.historyService.findByEntity(
      entityId,
      entityType as 'project' | 'work',
    );
  }
}
