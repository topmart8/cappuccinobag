import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../public/site/assets/script.js',import.meta.url),'utf8');
test('legacy lead forms lock pending/saved requests, preserve retry ID and persist receipt',async()=>{
 const handlers={};const button={disabled:false};let status;let resolve;let calls=0;let uuid=0;const ids=[];
 const form={dataset:{},querySelector:()=>button,appendChild:x=>status=x,setAttribute(){},addEventListener:(k,f)=>handlers[k]=f};
 const context={forms:[form],document:{createElement:()=>({setAttribute(){}})},window:{crypto:{randomUUID:()=>`ID-${++uuid}`}},FormData:class {entries(){return [['name','QA']]}},getAttribution:()=>({}),fetch:async(_url,options)=>{calls++;ids.push(JSON.parse(options.body).submission_id);return new Promise(r=>resolve=r)}};
 vm.runInNewContext(source.slice(source.indexOf('function submissionIdFor'),source.indexOf('function setInquiryStatus')),context);
 const event={preventDefault(){}};const first=handlers.submit(event);await handlers.submit(event);assert.equal(calls,1);assert.equal(button.disabled,true);
 resolve({ok:true,json:async()=>{throw Error('invalid JSON')}});await first;assert.equal(button.disabled,false);
 const retry=handlers.submit(event);assert.equal(ids[1],ids[0]);resolve({ok:true,json:async()=>({ok:true,inquiryNumber:'TEST-ONLY',submissionId:ids[1],notification:{status:'pending'}})});await retry;
 await handlers.submit(event);assert.equal(calls,2);assert.equal(button.disabled,true);assert.match(status.textContent,/TEST-ONLY.*Notification needs review/);
 handlers.input();assert.equal(button.disabled,false);const next=handlers.submit(event);assert.notEqual(ids[2],ids[1]);resolve({ok:false,json:async()=>({})});await next;
});
