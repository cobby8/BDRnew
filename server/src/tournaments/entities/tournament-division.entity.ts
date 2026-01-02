import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Tournament } from './tournament.entity';

@Entity()
export class TournamentDivision {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    category: string; // e.g., '일반부', '유소년'

    @Column()
    divisionName: string; // e.g., 'A조', 'B조', 'U12'

    @Column({ nullable: true })
    displayName: string; // Custom display name

    @Column({ nullable: true, type: 'text' })
    description: string; // Detailed description

    @ManyToOne(() => Tournament, (tournament) => tournament.divisions, { onDelete: 'CASCADE' })
    tournament: Tournament;
}
