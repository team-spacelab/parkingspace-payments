import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'
import { Users } from '../users/users.entity'
import { Cars } from '../cars/cars.entity'
import { Zones } from '../zones/zones.entity'
import { Reserves } from '../reserves/reserves.entity'

@Index('users_id', ['usersId'], {})
@Index('cars_id', ['carsId'], {})
@Index('zones_id', ['zonesId'], {})
@Index('reserves_id', ['reservesId'], {})
@Entity('orders', { schema: 'parkingspace' })
export class Orders {
  @PrimaryGeneratedColumn({ type: 'int', name: 'orders_id', unsigned: true })
    ordersId: number

  @Column('int', { name: 'users_id', unsigned: true })
    usersId: number

  @Column('int', { name: 'cars_id', unsigned: true })
    carsId: number

  @Column('int', { name: 'zones_id', unsigned: true })
    zonesId: number

  @Column('int', { name: 'reserves_id', unsigned: true })
    reservesId: number

  @Column('int', { name: 'orders_amount', unsigned: true })
    ordersAmount: number

  @Column('int', { name: 'orders_point', unsigned: true })
    ordersPoint: number

  @Column('varchar', { name: 'orders_method', length: 4 })
    ordersMethod: string

  @Column('varchar', { name: 'orders_receipt', nullable: true, length: 256 })
    ordersReceipt: string | null

  @Column('varchar', {
    name: 'orders_status',
    length: 19,
    default: () => "'READY'"
  })
    ordersStatus: string

  @ManyToOne(() => Users, (users) => users.orders, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT'
  })
  @JoinColumn([{ name: 'users_id', referencedColumnName: 'usersId' }])
    users: Users

  @ManyToOne(() => Cars, (cars) => cars.orders, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT'
  })
  @JoinColumn([{ name: 'cars_id', referencedColumnName: 'carsId' }])
    cars: Cars

  @ManyToOne(() => Zones, (zones) => zones.orders, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT'
  })
  @JoinColumn([{ name: 'zones_id', referencedColumnName: 'zonesId' }])
    zones: Zones

  @ManyToOne(() => Reserves, (reserves) => reserves.orders, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT'
  })
  @JoinColumn([{ name: 'reserves_id', referencedColumnName: 'reservesId' }])
    reserves: Reserves
}
