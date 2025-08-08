#!/usr/bin/env -S bun run

import { Database } from "bun:sqlite";

let activeReqs = 0;
const db = new Database("twwsd.db", { readonly: true });
const html = await Bun.file("index.html").bytes();
const css = await Bun.file("selfdestruct_vue-e54e0db4.css").bytes();
const letterCount = (db.query("SELECT count(*) AS count FROM letters").get() as {count: number}).count;
const getLetter = db.query("SELECT * FROM letters WHERE id = ?");
Bun.serve({
    routes: {
        "/": new Response(html, {
            headers: { "Content-Type": "text/html" }
        }),
        "/selfdestruct_vue-e54e0db4.css": new Response(css, {
            headers: { "Content-Type": "text/css" }
        }),
        "/api/get_letter": async(req) => {
            if (activeReqs >= 5) {
                return new Response("429 too many requests", { status: 429 });
            }
            ++activeReqs;
            try {
                await new Promise<void>((resolve) =>
                    setTimeout(()=>resolve(), 250 + Math.random() * 500));
                const id = Math.floor(Math.random() * letterCount) + 1;
                const letter = getLetter.get(id) as { twwsd_id: number,
                    body: string };
                return Response.json({
                    code: "200",
                    id: letter.twwsd_id,
                    body: letter.body
                });
            }
            finally {
                --activeReqs;
            }
        }
    },
    port: 8080,
    fetch(req) {
        return new Response("404 not found", { status: 404 });
    }
});
