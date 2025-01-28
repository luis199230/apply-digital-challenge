import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  InsertResult,
  IsNull,
  Not,
  Repository,
  UpdateResult,
} from 'typeorm';

import { Product } from './product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  public updateOrCreate(product: Partial<Product>): Promise<InsertResult> {
    return this.productRepository.upsert(product, ['sku']);
  }

  public updateDeleted({ sku }: Partial<Product>) {
    return this.productRepository.update({ sku }, { deletedAt: new Date() });
  }

  public findByPage(page: number, limit = 5): Promise<[Product[], number]> {
    return this.productRepository
      .createQueryBuilder('product')
      .limit(limit)
      .offset(limit * page - limit)
      .getManyAndCount();
  }

  public findBySku(sku: string): Promise<Product | null> {
    return this.productRepository.findOneBy({ sku });
  }

  public softDelete(id: number): Promise<UpdateResult> {
    return this.productRepository.softDelete(id);
  }

  public count() {
    return this.productRepository.count();
  }

  public countDeleted() {
    return this.productRepository.count({
      where: { deletedAt: Not(IsNull()) },
      withDeleted: true,
    });
  }

  public countWithPrice(): Promise<number> {
    return this.productRepository.count({
      where: { price: Not(IsNull()) },
    });
  }

  public countWithoutPrice(): Promise<number> {
    return this.productRepository.count({
      where: { price: IsNull() },
    });
  }

  public countInRange(min: Date, max: Date): Promise<number> {
    return this.productRepository.count({
      where: { createdAt: Between(min, max) },
    });
  }

  public getCategoryCounts(): Promise<{ count: number; category: string }[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .select('product.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('product.category')
      .orderBy('count', 'DESC')
      .getRawMany();
  }
}
