export class CreateTeamDto {
    name: string;
    teacherName?: string;
    logoUrl?: string;
    divisionCategory?: string;
    description?: string;
    // schoolId?: number; // Future use
}
