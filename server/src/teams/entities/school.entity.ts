import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Team } from './team.entity';

@Entity()
export class School {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    region: string; // e.g. 'Seoul', 'Gyeonggi'

    @Column({ nullable: true })
    address: string;

    @OneToMany(() => Team, (team) => team.school)
    teams: Team[];
}
