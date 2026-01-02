const http = require('http');

const teams = [
    { name: "Seoul Elementary", teacherName: "Coach Kim", divisionCategory: "Elementary", logoUrl: "https://placehold.co/150x150/orange/white?text=Elem" },
    { name: "Busan Middle", teacherName: "Coach Lee", divisionCategory: "Middle", logoUrl: "https://placehold.co/150x150/blue/white?text=Mid" },
    { name: "Daegu High", teacherName: "Coach Park", divisionCategory: "High", logoUrl: "https://placehold.co/150x150/red/white?text=High" },
    { name: "Yonsei Univ", teacherName: "Coach Choi", divisionCategory: "University", logoUrl: "https://placehold.co/150x150/green/white?text=Univ" },
    { name: "Pro All-Stars", teacherName: "Coach Kang", divisionCategory: "Pro", logoUrl: "https://placehold.co/150x150/black/white?text=Pro" },
];

const createTeam = (teamData) => {
    const data = JSON.stringify(teamData);

    const options = {
        hostname: 'localhost',
        port: 8081,
        path: '/teams',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, res => {
        console.log(`Created ${teamData.name}: ${res.statusCode}`);
    });

    req.on('error', error => {
        console.error(`Error creating ${teamData.name}:`, error);
    });

    req.write(data);
    req.end();
};

teams.forEach(team => createTeam(team));
