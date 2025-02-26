import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ITypeOrmQuery } from 'src/core/api/typeorm-api.service';

export class CreateTodoDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}

export class UpdateTodoDto extends CreateTodoDto {}

export class TodoQuery implements ITypeOrmQuery {
  @IsOptional()
  page?: string;

  @IsOptional()
  sort?: string;

  @IsOptional()
  select?: string;

  @IsOptional()
  limit?: string;

  @IsOptional()
  keyword?: string;
  @IsOptional()
  filters?: Record<string, any>;
}
