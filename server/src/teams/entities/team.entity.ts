import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Player } from './player.entity';
import { School } from './school.entity';

@Entity()
export class Team {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string; // e.g. 'Varsity Team'

    @ManyToOne(() => School, (school) => school.teams, { nullable: true })
    school: School;

    @OneToMany(() => Player, (player) => player.team)
    players: Player[];

    @Column({ nullable: true })
    teacherName: string; // Teacher who manages this team

    @Column({ nullable: true })
    logoUrl: string;

    @Column({ nullable: true })
    divisionCategory: string; // e.g. 'Elementary', 'Middle', 'General'

    @Column({ nullable: true, type: 'text' })
    description: string;
}
