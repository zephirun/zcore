async function run() {
    try {
        const res = await fetch("http://localhost:5173/api/sync-cache");
        const json = await res.json();
        console.log("Status:", json.status);
        if (json.data && json.data.length > 0) {
            console.log(JSON.stringify({ client: json.data[0].client, months: json.data[0].months }, null, 2));
        }
    } catch (e) { console.error(e); }
}
run();
