import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Team } from '../../teams/entities/team.entity';
import { TournamentDivision } from '../../tournaments/entities/tournament-division.entity';

export enum GameStatus {
    SCHEDULED = 'SCHEDULED',
    LIVE = 'LIVE',
    FINAL = 'FINAL'
}

export enum GameStage {
    GROUP = 'GROUP',
    TOURNAMENT = 'TOURNAMENT'
}

@Entity()
export class Game {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => TournamentDivision, { onDelete: 'CASCADE' })
    division: TournamentDivision;

    @Column({
        type: 'enum',
        enum: GameStage,
        default: GameStage.TOURNAMENT
    })
    stage: GameStage;

    @Column({ nullable: true })
    groupName: string; // 'A', 'B', etc.

    // e.g. 16 (Round of 16), 8 (Quarter-Finals), 4 (Semi-Finals), 2 (Final)
    @Column()
    roundOf: number;

    // Horizontal index in the bracket (0-based)
    @Column()
    matchIndex: number;

    @ManyToOne(() => Team, { nullable: true })
    homeTeam: Team;

    @ManyToOne(() => Team, { nullable: true })
    awayTeam: Team;

    @Column({ nullable: true })
    homeScore: number;

    @Column({ nullable: true })
    awayScore: number;

    @Column({ type: 'timestamp', nullable: true })
    startTime: Date;

    @Column({ nullable: true })
    courtNumber: number;

    // ID of the game that the winner advances to
    @Column({ nullable: true })
    nextGameId: number;

    @Column({
        type: 'enum',
        enum: GameStatus,
        default: GameStatus.SCHEDULED
    })
    status: GameStatus;
}
