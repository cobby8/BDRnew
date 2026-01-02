import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { Player } from '../../teams/entities/player.entity';
import { Team } from '../../teams/entities/team.entity';
import { Tournament } from './tournament.entity';

export enum RegistrationStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

@Entity()
export class Registration {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Tournament, (tournament) => tournament.registrations, { onDelete: 'CASCADE' })
    tournament: Tournament;

    @ManyToOne(() => Team, { onDelete: 'CASCADE' })
    team: Team;

    @ManyToMany(() => Player)
    @JoinTable({
        name: 'registration_players', // Specific join table for roster snapshots
        joinColumn: { name: 'registration_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'player_id', referencedColumnName: 'id' }
    })
    roster: Player[];

    @Column({
        type: 'enum',
        enum: RegistrationStatus,
        default: RegistrationStatus.PENDING
    })
    status: RegistrationStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
