import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';

export interface ITypeOrmQuery {
  page?: string;
  sort?: string;
  select?: string;
  limit?: string;
  keyword?: string;
  filters?: Record<string, any>;
}

export interface Pagination {
  currentPage: number;
  previousPage: number | null;
  nextPage: number | null;
  numOfPages: number;
  skip: number;
  limit: number;
  count: number;
}

@Injectable()
export class TypeOrmApiService<T> {
  private queryBuilder: SelectQueryBuilder<T>;
  private queryObj: ITypeOrmQuery;
  public paginationObj: Pagination = {
    currentPage: 1,
    previousPage: null,
    nextPage: null,
    numOfPages: 1,
    skip: 0,
    limit: 10,
    count: 0
  };

  private transformFilters(filters: Record<string, any>): Record<string, any> {
    const transformed: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(filters)) {
      if (value === null || value === undefined) continue;

      if (typeof value === 'object') {
        if (['gt', 'gte', 'lt', 'lte', 'eq', 'ne'].some(op => op in value)) {
          transformed[key] = value;
        } else {
          Object.entries(value).forEach(([subKey, subValue]) => {
            transformed[`${key}.${subKey}`] = subValue;
          });
        }
      } else {
        transformed[key] = value;
      }
    }
    
    return transformed;
  }

  private handleFilter(filters: Record<string, any> = {}) {
    const transformedFilters = this.transformFilters({ ...this.queryObj.filters, ...filters });

    Object.entries(transformedFilters).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value as Record<string, any>).forEach(([operator, operatorValue]) => {
          const paramKey = `${key}_${operator}`;
          const columnName = `${this.queryBuilder.alias}.${key}`;
          
          switch (operator) {
            case 'gt':
              this.queryBuilder.andWhere(`${columnName} > :${paramKey}`, { [paramKey]: operatorValue });
              break;
            case 'gte':
              this.queryBuilder.andWhere(`${columnName} >= :${paramKey}`, { [paramKey]: operatorValue });
              break;
            case 'lt':
              this.queryBuilder.andWhere(`${columnName} < :${paramKey}`, { [paramKey]: operatorValue });
              break;
            case 'lte':
              this.queryBuilder.andWhere(`${columnName} <= :${paramKey}`, { [paramKey]: operatorValue });
              break;
            case 'eq':
              this.queryBuilder.andWhere(`${columnName} = :${paramKey}`, { [paramKey]: operatorValue });
              break;
            case 'ne':
              this.queryBuilder.andWhere(`${columnName} != :${paramKey}`, { [paramKey]: operatorValue });
              break;
          }
        });
      } else {
        const columnName = `${this.queryBuilder.alias}.${key}`;
        this.queryBuilder.andWhere(`${columnName} = :${key}`, { [key]: value });
      }
    });

    return this;
  }

  private handleSort() {
    if (this.queryObj.sort) {
      const sortFields = this.queryObj.sort.split(',');
      sortFields.forEach((field) => {
        const order = field.startsWith('-') ? 'DESC' : 'ASC';
        const cleanField = field.replace('-', '');
        const columnName = `${this.queryBuilder.alias}.${cleanField}`;
        this.queryBuilder.addOrderBy(columnName, order);
      });
    } else {
      this.queryBuilder.orderBy(`${this.queryBuilder.alias}.createdAt`, 'DESC');
    }
    return this;
  }

  private handleSearch(searchFields?: string[]) {
    if (this.queryObj.keyword && searchFields?.length) {
      const conditions = searchFields.map((field) => {
        return `LOWER(${field}) LIKE LOWER(:keyword)`;
      });
      this.queryBuilder.andWhere(`(${conditions.join(' OR ')})`, {
        keyword: `%${this.queryObj.keyword}%`,
      });
    }
    return this;
  }

  private handleSelect() {
    if (this.queryObj.select) {
      const selectFields = this.queryObj.select.split(',')
        .map(field => field.trim())
        .map(field => `${this.queryBuilder.alias}.${field}`);
      this.queryBuilder.select(selectFields);
    }
    return this;
  }

  private async handlePagination() {
    // Get total count before applying pagination
    this.paginationObj.count = await this.queryBuilder.getCount();
    
    // Parse pagination parameters
    this.paginationObj.currentPage = this.queryObj.page ? Math.max(1, parseInt(this.queryObj.page)) : 1;
    this.paginationObj.limit = this.queryObj.limit ? Math.min(100, Math.max(1, parseInt(this.queryObj.limit))) : 10;
    
    // Calculate pagination values
    this.paginationObj.numOfPages = Math.ceil(this.paginationObj.count / this.paginationObj.limit);
    this.paginationObj.skip = (this.paginationObj.currentPage - 1) * this.paginationObj.limit;
    
    // Set previous and next pages
    this.paginationObj.previousPage = this.paginationObj.currentPage > 1 ? this.paginationObj.currentPage - 1 : null;
    this.paginationObj.nextPage = this.paginationObj.currentPage < this.paginationObj.numOfPages ? this.paginationObj.currentPage + 1 : null;

    // Apply pagination to query
    this.queryBuilder
      .skip(this.paginationObj.skip)
      .take(this.paginationObj.limit);

    return this;
  }

  async getAllDocs(
    queryBuilder: SelectQueryBuilder<T>,
    queryObj: ITypeOrmQuery,
    additionalFilters: Record<string, any> = {},
    searchFields?: string[]
  ): Promise<{ query: SelectQueryBuilder<T>; pagination: Pagination }> {
    this.queryBuilder = queryBuilder;
    this.queryObj = queryObj;

    await this.handleFilter(additionalFilters)
      .handleSort()
      .handleSelect()
      .handleSearch(searchFields)
      .handlePagination();

    return { 
      query: this.queryBuilder, 
      pagination: this.paginationObj 
    };
  }
}