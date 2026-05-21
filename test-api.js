const testApi = async () => {
    try {
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers:{ 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: "learner@test.com", password: "password123" }) // assuming dummy user
        });
        
        let token = "";
        
        if (loginRes.ok) {
            const data = await loginRes.json();
            token = data.token;
            console.log("Logged in!");
        } else {
            console.log("Login failed", await loginRes.text());
            // register
            const regRes = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers:{ 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: "Tester", email: "test@test.com", password: "password123", role: "Learner" })
            });
            const data = await regRes.json();
            token = data.token;
            console.log("Registered!");
        }

        // Test POST /api/activity/log
        const logRes = await fetch('http://localhost:5000/api/activity/log', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ activity: "course_completed" })
        });
        
        console.log("POST /log status:", logRes.status);
        console.log("POST /log body:", await logRes.json());
        
        // Test GET /api/activity/streak
        const streakRes = await fetch('http://localhost:5000/api/activity/streak', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log("GET /streak status:", streakRes.status);
        console.log("GET /streak body:", await streakRes.json());
        
    } catch(err) {
        console.error(err);
    }
};

testApi();
