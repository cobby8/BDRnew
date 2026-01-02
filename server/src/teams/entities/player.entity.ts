import { Column, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Team } from './team.entity';

@Entity()
export class Player {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    backNumber: number;

    @Column({ nullable: true })
    birthDate: string; // YYYY-MM-DD for identification

    @Column({ nullable: true, type: 'float' })
    height: number; // cm

    @Column({ nullable: true, type: 'float' })
    weight: number; // kg

    @Column({ nullable: true })
    position: string; // G, F, C

    @Column({ nullable: true })
    profileImageUrl: string;

    @Column({ nullable: true })
    country: string;

    @Column({ nullable: true })
    lastAttended: string; // School or University name

    @Column({ nullable: true })
    experience: string; // e.g. '16 Years' or 'Rookie'

    @ManyToOne(() => Team, (team) => team.players, { onDelete: 'CASCADE' })
    team: Team;

    @DeleteDateColumn()
    deletedAt: Date;
}
