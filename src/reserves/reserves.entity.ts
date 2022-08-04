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
import { Zones } from '../zones/zones.entity'
import { Users } from '../users/users.entity'

@Index('zones_id', ['zonesId'], {})
@Index('users_id', ['usersId'], {})
@Entity('reserves', { schema: 'parkingspace' })
export class Reserves {
  @PrimaryGeneratedColumn({ type: 'int', name: 'reserves_id', unsigned: true })
    reservesId: number

  @Column('int', { name: 'zones_id', unsigned: true })
    zonesId: number

  @Column('int', { name: 'users_id', unsigned: true })
    usersId: number

  @Column('timestamp', {
    name: 'reserves_startat',
    default: () => 'CURRENT_TIMESTAMP'
  })
    reservesStartat: Date

  @Column('timestamp', {
    name: 'reserves_endat',
    default: () => "'0000-00-00 00:00:00'"
  })
    reservesEndat: Date

  @Column('int', { name: 'reserves_status', default: () => "'0'" })
    reservesStatus: number

  @OneToMany(() => Orders, (orders) => orders.reserves)
    orders: Orders[]

  @ManyToOne(() => Zones, (zones) => zones.reserves, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT'
  })
  @JoinColumn([{ name: 'zones_id', referencedColumnName: 'zonesId' }])
    zones: Zones

  @ManyToOne(() => Users, (users) => users.reserves, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT'
  })
  @JoinColumn([{ name: 'users_id', referencedColumnName: 'usersId' }])
    users: Users
}
