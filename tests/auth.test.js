import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { createProgressStorage } from "../backend/storage.js";
import { createAuthService } from "../backend/authService.js";
import { createServer } from "../backend/server.js";

async function fixture(t) {
  const directory = await mkdtemp(path.join(tmpdir(),"maru-auth-"));
  const storage = createProgressStorage(directory);
  let payload, instant = Date.now(), seenOptions;
  const client = {
    generateCodeVerifierAsync: async()=>({codeVerifier:"private-verifier",codeChallenge:"challenge"}),
    generateAuthUrl(options) { seenOptions=options;payload={sub:"google-person-1",email_verified:true,email:"learner@example.test",name:"Pessoa",nonce:options.nonce};return "https://accounts.google.com/o/oauth2/v2/auth?state="+options.state; },
    async getToken(options) { assert.equal(options.codeVerifier,"private-verifier");return {tokens:{id_token:"verified-by-library"}}; },
    async verifyIdToken(options) { assert.equal(options.audience,"test-client");return {getPayload:()=>payload}; }
  };
  const auth=createAuthService(storage,{client,clientId:"test-client",clientSecret:"test-secret",origin:"https://maru.example",now:()=>instant});
  t.after(async()=>{storage.close();await rm(directory,{recursive:true,force:true});});
  const login=async()=>{
    const begin=await auth.begin();
    const params=new URLSearchParams({state:new URL(begin.url).searchParams.get("state"),code:"test-code"});
    const result=await auth.callback({headers:{cookie:begin.cookie.split(";")[0]}},params);
    return {...result,request:{headers:{cookie:result.cookies[0].split(";")[0]}},params,begin};
  };
  return {storage,auth,login,setPayload:fn=>{payload=fn(payload);},expire:()=>{instant+=31*86400000;},options:()=>seenOptions};
}

test("Google login uses state, PKCE and nonce; sessions hold only a token hash",async t=>{
  const {storage,auth,login,options,expire}=await fixture(t);
  const result=await login();
  assert.deepEqual(options().scope,["openid","email","profile"]);
  assert.equal(options().code_challenge_method,"S256");
  assert.equal(auth.account(result.request).email,"learner@example.test");
  assert.match(result.cookies[0],/HttpOnly; SameSite=Lax/);
  assert.match(result.cookies[0],/Secure/);
  const row=storage.db.prepare("SELECT * FROM sessions").get();
  assert.equal(row.token_hash.length,64);
  assert.ok(!result.cookies[0].includes(row.token_hash));
  assert.equal(storage.db.prepare("SELECT count(*) AS count FROM oauth_states").get().count,0);
  await assert.rejects(()=>auth.callback({headers:{cookie:result.begin.cookie.split(";")[0]}},result.params));
  expire();
  assert.equal(auth.account(result.request),null);
});

test("mismatched OAuth state and nonce cannot create a login session",async t=>{
  const {auth,storage,setPayload}=await fixture(t);
  const begin=await auth.begin();
  const params=new URLSearchParams({state:new URL(begin.url).searchParams.get("state"),code:"code"});
  await assert.rejects(()=>auth.callback({headers:{cookie:"maru_oauth=forged"}},params));
  setPayload(p=>({...p,nonce:"invalid"}));
  await assert.rejects(()=>auth.callback({headers:{cookie:begin.cookie.split(";")[0]}},params));
  assert.equal(storage.db.prepare("SELECT count(*) AS count FROM sessions").get().count,0);
});

test("accounts ignore spoofed browser IDs, merge progress and reject stale or cross-site writes",async t=>{
  const {storage,auth,login}=await fixture(t);
  const signed=await login();
  const server=createServer({storage,auth});
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const url="http://127.0.0.1:"+server.address().port;
  const headers={"Content-Type":"application/json",Cookie:signed.request.headers.cookie,"x-maru-account":signed.user.id,"x-maru-user":"different-browser",Origin:"https://maru.example"};
  const put=body=>fetch(url+"/api/progress",{method:"PUT",headers,body:JSON.stringify(body)});
  assert.equal((await put({xp:{total:30},lessons:{welcome:{completedAt:10}},updatedAt:10})).status,200);
  assert.equal((await put({xp:{total:40},lessons:{sounds:{completedAt:20}},updatedAt:20})).status,200);
  const stored=await fetch(url+"/api/progress",{headers}).then(r=>r.json());
  assert.equal(stored.xp.total,40);
  assert.equal(Object.keys(stored.lessons).length,2);
  assert.equal((await storage.read("different-browser")).xp.total,0);
  assert.equal((await fetch(url+"/api/progress",{method:"PUT",headers:{...headers,Origin:"https://elsewhere.example"},body:"{}"})).status,403);
  assert.equal((await fetch(url+"/api/progress",{method:"PUT",headers:{...headers,"x-maru-account":"wrong"},body:"{}"})).status,409);
  const logout=await fetch(url+"/api/auth/logout",{method:"POST",headers});
  assert.equal(logout.status,200);
  assert.equal(auth.account(signed.request),null);
  assert.equal((await fetch(url+"/api/progress",{headers})).status,409);
  assert.equal((await fetch(url+"/api/progress",{headers:{"x-maru-user":"account:"+signed.user.id}})).status,400);
});
