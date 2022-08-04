import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'
import { Orders } from '../order/order.entity'
import { Reserves } from '../reserves/reserves.entity'
import { Spaces } from './spaces.entity'
import { Users } from '../users/users.entity'

@Index('spaces_id', ['spacesId'], {})
@Index('users_id', ['usersId'], {})
@Entity('zones', { schema: 'parkingspace' })
export class Zones {
  @PrimaryGeneratedColumn({ type: 'int', name: 'zones_id', unsigned: true })
    zonesId: number

  @Column('int', { name: 'spaces_id', unsigned: true })
    spacesId: number

  @Column('int', { name: 'users_id', unsigned: true })
    usersId: number

  @Column('int', { name: 'zones_cost', nullable: true, unsigned: true })
    zonesCost: number | null

  @Column('int', { name: 'zones_status', unsigned: true, default: () => "'0'" })
    zonesStatus: number

  @OneToMany(() => Orders, (orders) => orders.zones)
    orders: Orders[]

  @OneToMany(() => Reserves, (reserves) => reserves.zones)
    reserves: Reserves[]

  @ManyToOne(() => Spaces, (spaces) => spaces.zones, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT'
  })
  @JoinColumn([{ name: 'spaces_id', referencedColumnName: 'spacesId' }])
    spaces: Spaces

  @ManyToOne(() => Users, (users) => users.zones, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT'
  })
  @JoinColumn([{ name: 'users_id', referencedColumnName: 'usersId' }])
    users: Users
}
