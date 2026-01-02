import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Team } from '../../teams/entities/team.entity';
import { TournamentDivision } from '../../tournaments/entities/tournament-division.entity';

export enum ParticipationStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
    UNPAID = 'UNPAID',
    PAID = 'PAID',
    REFUNDED = 'REFUNDED'
}

@Entity()
export class Participation {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Team, { onDelete: 'CASCADE' })
    team: Team;

    @ManyToOne(() => TournamentDivision, { onDelete: 'CASCADE' })
    division: TournamentDivision;

    @Column({
        type: 'enum',
        enum: ParticipationStatus,
        default: ParticipationStatus.PENDING
    })
    status: ParticipationStatus;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.UNPAID
    })
    paymentStatus: PaymentStatus;

    // Snapshot of the roster at the time of application/confirmation
    // Stores array of Player IDs or Full Player Objects
    @Column({ type: 'json', nullable: true })
    rosterSnapshot: any;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
