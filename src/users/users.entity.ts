import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Cars } from '../cars/cars.entity'
import { Orders } from '../order/order.entity'
import { Reserves } from '../reserves/reserves.entity'
import { Spaces } from '../zones/spaces.entity'
import { Zones } from '../zones/zones.entity'

@Entity('users', { schema: 'parkingspace' })
export class Users {
  @PrimaryGeneratedColumn({ type: 'int', name: 'users_id', unsigned: true })
    usersId: number

  @Column('varchar', { name: 'users_login', length: 30 })
    usersLogin: string

  @Column('varchar', { name: 'users_nickname', nullable: true, length: 15 })
    usersNickname: string | null

  @Column('char', { name: 'users_password', length: 128 })
    usersPassword: string

  @Column('char', { name: 'users_salt', length: 8 })
    usersSalt: string

  @Column('char', { name: 'users_phone', nullable: true, length: 11 })
    usersPhone: string | null

  @Column('tinyint', {
    name: 'users_isverified',
    width: 1,
    default: () => "'0'"
  })
    usersIsverified: boolean

  @Column('varchar', { name: 'users_realname', length: 20 })
    usersRealname: string

  @Column('date', { name: 'users_birth', nullable: true })
    usersBirth: string | null

  @Column('int', { name: 'users_point', unsigned: true, default: () => "'0'" })
    usersPoint: number

  @Column('timestamp', {
    name: 'users_createdat',
    default: () => 'CURRENT_TIMESTAMP'
  })
    usersCreatedat: Date

  @Column('int', { name: 'users_status', unsigned: true, default: () => "'0'" })
    usersStatus: number

  @OneToMany(() => Cars, (cars) => cars.users)
    cars: Cars[]

  @OneToMany(() => Orders, (orders) => orders.users)
    orders: Orders[]

  @OneToMany(() => Reserves, (reserves) => reserves.users)
    reserves: Reserves[]

  @OneToMany(() => Spaces, (spaces) => spaces.users)
    spaces: Spaces[]

  @OneToMany(() => Zones, (zones) => zones.users)
    zones: Zones[]
}
