import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class SyncLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'json' })
  data: JSON;

  @CreateDateColumn()
  createdAt: string;
}
