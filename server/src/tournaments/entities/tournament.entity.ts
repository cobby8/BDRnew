import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Registration } from './registration.entity';
import { TournamentDivision } from './tournament-division.entity';

@Entity()
export class Tournament {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string; // e.g. 'National School League 2025'

    @Column({ type: 'date' })
    startDate: string;

    @Column({ type: 'date' })
    endDate: string;

    @Column({ nullable: true })
    posterUrl: string;

    @Column({ type: 'json', nullable: true })
    places: string[]; // e.g. ["강남구민체육관"]

    @Column({ nullable: true })
    status: string; // 'PLANNING', 'RECRUITING', 'ACTIVE', 'COMPLETED'

    @Column({ type: 'timestamp', nullable: true })
    regStart: Date;

    @Column({ type: 'timestamp', nullable: true })
    regEnd: Date;

    @OneToMany(() => TournamentDivision, (division) => division.tournament, { cascade: true })
    divisions: TournamentDivision[];

    @ManyToOne(() => Tournament, (tournament) => tournament.subTournaments, { nullable: true })
    parentTournament: Tournament; // Link to upper league (e.g. Regional -> National)

    @OneToMany(() => Tournament, (tournament) => tournament.parentTournament)
    subTournaments: Tournament[];

    @OneToMany(() => Registration, (registration) => registration.tournament)
    registrations: Registration[];
}
