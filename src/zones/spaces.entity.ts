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
import { Zones } from './zones.entity'

@Index('users_id', ['usersId'], {})
@Entity('spaces', { schema: 'parkingspace' })
export class Spaces {
  @PrimaryGeneratedColumn({ type: 'int', name: 'spaces_id', unsigned: true })
    spacesId: number

  @Column('int', { name: 'users_id', unsigned: true })
    usersId: number

  @Column('varchar', { name: 'spaces_name', length: 30 })
    spacesName: string

  @Column('float', { name: 'spaces_lat', precision: 12 })
    spacesLat: number

  @Column('float', { name: 'spaces_lng', precision: 12 })
    spacesLng: number

  @Column('int', { name: 'spaces_default_cost', unsigned: true })
    spacesDefaultCost: number

  @Column('int', { name: 'spaces_type', unsigned: true, default: () => "'0'" })
    spacesType: number

  @Column('int', { name: 'spaces_unit', unsigned: true })
    spacesUnit: number

  @Column('timestamp', {
    name: 'spaces_createdat',
    default: () => 'CURRENT_TIMESTAMP'
  })
    spacesCreatedat: Date

  @Column('int', {
    name: 'spaces_status',
    unsigned: true,
    default: () => "'0'"
  })
    spacesStatus: number

  @Column('varchar', {
    name: 'spaces_description',
    nullable: true,
    length: 300
  })
    spacesDescription: string | null

  @ManyToOne(() => Users, (users) => users.spaces, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT'
  })
  @JoinColumn([{ name: 'users_id', referencedColumnName: 'usersId' }])
    users: Users

  @OneToMany(() => Zones, (zones) => zones.spaces)
    zones: Zones[]
}
