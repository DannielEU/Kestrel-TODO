import { registerEnumType } from '@nestjs/graphql';

export enum Level {
  Low = 'low',
  Medium = 'normal',
  High = 'high',
}

registerEnumType(Level, {
    name: 'Level',
})