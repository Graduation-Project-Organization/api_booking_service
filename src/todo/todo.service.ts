import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { CreateTodoDto, UpdateTodoDto, TodoQuery } from './dto/create-todo.dto';
import { TypeOrmApiService } from 'src/core/api/typeorm-api.service';

@Injectable()
export class TodoService {
  private readonly apiService: TypeOrmApiService<Todo>;

  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
  ) {
    this.apiService = new TypeOrmApiService<Todo>();
  }

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const todo = this.todoRepository.create(createTodoDto);
    return await this.todoRepository.save(todo);
  }

  async findAll(query: TodoQuery) {
    const queryBuilder = this.todoRepository.createQueryBuilder('todo');
    const searchFields = ['todo.title', 'todo.description'];
    const { query: finalQuery, pagination } = await this.apiService.getAllDocs(
      queryBuilder,
      query,
      {},
      searchFields
    );

    const todos = await finalQuery.getMany();
    return {
      data: todos,
      pagination,
    };
  }

  async findOne(id: number): Promise<Todo> {
    return await this.todoRepository.findOneOrFail({ where: { id } });
  }

  async update(id: number, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    await this.todoRepository.update(id, updateTodoDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.todoRepository.delete(id);
  }
}
