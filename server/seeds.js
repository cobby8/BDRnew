const http = require('http');

const createTeam = () => {
    const data = JSON.stringify({
        name: "Golden Warriors",
        teacherName: "Steve Kerr",
        divisionCategory: "Pro",
        description: "Sample Team for Verification",
        logoUrl: "https://via.placeholder.com/150"
    });

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
        console.log(`Team Status: ${res.statusCode}`);
        res.on('data', d => {
            const team = JSON.parse(d);
            console.log("Team Created:", team);
            createPlayer(team.id);
        });
    });

    req.on('error', error => {
        console.error(error);
    });

    req.write(data);
    req.end();
};

const createPlayer = (teamId) => {
    const data = JSON.stringify({
        name: "Steph Curry",
        backNumber: 30,
        birthDate: "1988-03-14",
        height: 188,
        weight: 84,
        position: "G",
        profileImageUrl: "https://via.placeholder.com/100"
    });

    const options = {
        hostname: 'localhost',
        port: 8081,
        path: `/teams/${teamId}/players`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, res => {
        console.log(`Player Status: ${res.statusCode}`);
        res.on('data', d => process.stdout.write(d));
    });

    req.write(data);
    req.end();
}

createTeam();
