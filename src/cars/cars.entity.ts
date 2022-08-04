import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'
import { Users } from '../users/users.entity'
import { Orders } from '../order/order.entity'

@Index('users_id', ['usersId'], {})
@Entity('cars', { schema: 'parkingspace' })
export class Cars {
  @PrimaryGeneratedColumn({ type: 'int', name: 'cars_id', unsigned: true })
    carsId: number

  @Column('int', { name: 'users_id', unsigned: true })
    usersId: number

  @Column('varchar', { name: 'cars_alias', length: 10 })
    carsAlias: string

  @Column('varchar', { name: 'cars_num', length: 8 })
    carsNum: string

  @Column('int', { name: 'cars_type', default: () => "'0'" })
    carsType: number

  @ManyToOne(() => Users, (users) => users.cars, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT'
  })
  @JoinColumn([{ name: 'users_id', referencedColumnName: 'usersId' }])
    users: Users

  @OneToMany(() => Orders, (orders) => orders.cars)
    orders: Orders[]
}
