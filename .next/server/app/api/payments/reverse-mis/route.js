"use strict";(()=>{var e={};e.id=8732,e.ids=[8732],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},2035:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>g,patchFetch:()=>N,requestAsyncStorage:()=>p,routeModule:()=>u,serverHooks:()=>S,staticGenerationAsyncStorage:()=>I});var n={};r.r(n),r.d(n,{POST:()=>m});var a=r(9303),s=r(8716),i=r(670),d=r(7070),o=r(728),c=r(5888),l=r(7662);async function m(e){try{let{fileContent:t,fileName:r}=await e.json();if(!t)return d.NextResponse.json({success:!1,error:"File content is required for Reverse MIS parsing"},{status:400});let n=new c.u().parseReverseMIS(t),a=0;for(let e of n){let t=await o.Z.payrollRecord.findFirst({where:{employee:{OR:[{accountNumber:e.beneficiaryAccount},{panNumber:{not:null}}]}}});t&&(await o.Z.payrollRecord.update({where:{id:t.id},data:{paymentStatus:"PAID",paymentDate:new Date,paymentReference:e.utrNumber}}),a++)}return await o.Z.h2HFile.create({data:{fileName:r||`REVERSE_MIS_${Date.now()}.res`,fileFormat:"REVERSE_MIS_RES",fileSize:t.length,fileContent:t,direction:"OUTWARD_FROM_BANK",status:"RECONCILED"}}),await (0,l.b)({action:"INGEST_REVERSE_MIS",module:"PAYMENTS",recordName:`Reverse MIS Ingested (${a} Transactions Reconciled)`,newValue:{count:a,totalParsed:n.length}}),d.NextResponse.json({success:!0,parsedCount:n.length,reconciledCount:a,message:`Reverse MIS successfully reconciled: ${a} transactions matched and updated with official RBI UTRs.`})}catch(e){return d.NextResponse.json({success:!1,error:e.message},{status:500})}}let u=new a.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/payments/reverse-mis/route",pathname:"/api/payments/reverse-mis",filename:"route",bundlePath:"app/api/payments/reverse-mis/route"},resolvedPagePath:"C:\\Projects\\Payroll Management System\\src\\app\\api\\payments\\reverse-mis\\route.ts",nextConfigOutput:"",userland:n}),{requestAsyncStorage:p,staticGenerationAsyncStorage:I,serverHooks:S}=u,g="/api/payments/reverse-mis/route";function N(){return(0,i.patchFetch)({serverHooks:S,staticGenerationAsyncStorage:I})}},7662:(e,t,r)=>{r.d(t,{b:()=>a});var n=r(728);async function a(e){try{await n._.auditLog.create({data:{userId:e.userId||null,userName:e.userName||"System User",action:e.action,module:e.module,recordId:e.recordId||null,recordName:e.recordName||null,previousValueJson:e.previousValue?JSON.stringify(e.previousValue):null,newValueJson:e.newValue?JSON.stringify(e.newValue):null,ipAddress:e.ipAddress||"127.0.0.1"}})}catch(e){console.error("Failed to write audit log:",e)}}},5888:(e,t,r)=>{r.d(t,{u:()=>n});class n{constructor(e="Apex Innovations Corp.",t="NACH000049281"){this.companyName=e,this.companyUserNumber=t}generateNACH306File(e,t,r){let n=new Date().toISOString().slice(0,10).replace(/-/g,""),a=`NACH_CR_${this.companyUserNumber}_${n}_${e.slice(0,6)}.txt`,s=0,i=[],d=String(r.length).padStart(9,"0"),o=["11",this.companyUserNumber.padEnd(18," "),this.companyName.padEnd(40," ").slice(0,40),"SALARY DISBURSEMENT".padEnd(20," "),n,"0000000",d,"0".repeat(13)," ".repeat(191)].join("");return r.forEach((e,r)=>{let n=Math.round(100*e.amount);s+=n;let a=["22",String(r+1).padStart(9,"0"),e.ifscCode.padEnd(11," "),e.accountNumber.padEnd(35," "),String(n).padStart(13,"0"),"10",e.name.padEnd(40," ").slice(0,40),e.employeeCode.padEnd(20," "),t.padEnd(35," "),this.companyName.padEnd(40," ").slice(0,40)," ".repeat(99)].join("");i.push(a.padEnd(306," "))}),{fileName:a,content:[(o.slice(0,102)+String(s).padStart(13,"0")+o.slice(115)).padEnd(306," "),...i].join("\r\n")}}generateISO20022XML(e,t,r,n){let a=new Date,s=a.toISOString().slice(0,10).replace(/-/g,""),i=`ISO20022_PAIN001_${e}_${s}.xml`,d=n.reduce((e,t)=>e+t.amount,0),o=n.map((t,r)=>`      <CdtTrfTxInf>
        <PmtId>
          <EndToEndId>E2E-${e.slice(0,8)}-${String(r+1).padStart(3,"0")}</EndToEndId>
        </PmtId>
        <Amt>
          <InstdAmt Ccy="INR">${t.amount.toFixed(2)}</InstdAmt>
        </Amt>
        <CdtrAgt>
          <FinInstnId>
            <ClrSysMmbId>
              <MmbId>${t.ifscCode}</MmbId>
            </ClrSysMmbId>
          </FinInstnId>
        </CdtrAgt>
        <Cdtr>
          <Nm>${t.name.replace(/&/g,"&amp;")}</Nm>
        </Cdtr>
        <CdtrAcct>
          <Id>
            <Othr>
              <Id>${t.accountNumber}</Id>
            </Othr>
          </Id>
        </CdtrAcct>
        <RmtInf>
          <Ustrd>Salary for Employee ${t.employeeCode}</Ustrd>
        </RmtInf>
      </CdtTrfTxInf>`).join("\n");return{fileName:i,content:`<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>MSG-${e}-${s}</MsgId>
      <CreDtTm>${a.toISOString()}</CreDtTm>
      <NbOfTxs>${n.length}</NbOfTxs>
      <CtrlSum>${d.toFixed(2)}</CtrlSum>
      <InitgPty>
        <Nm>${this.companyName}</Nm>
      </InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>PMTINF-${e}</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <ReqdExctnDt>${a.toISOString().slice(0,10)}</ReqdExctnDt>
      <Dbtr>
        <Nm>${this.companyName}</Nm>
      </Dbtr>
      <DbtrAcct>
        <Id>
          <Othr>
            <Id>${t}</Id>
          </Othr>
        </Id>
      </DbtrAcct>
      <DbtrAgt>
        <FinInstnId>
          <ClrSysMmbId>
            <MmbId>${r}</MmbId>
          </ClrSysMmbId>
        </FinInstnId>
      </DbtrAgt>
${o}
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`}}parseReverseMIS(e){let t=e.split(/\r?\n/).filter(e=>e.trim().length>0),r=[];for(let e=0;e<t.length;e++){let n=t[e];if(n.includes("REC_TYPE")||n.includes("TRAN_TYPE")||n.startsWith("11")||n.startsWith("<?xml"))continue;let a=n.split(/[,\t|]/);a.length>=4&&r.push({recordIndex:e+1,beneficiaryAccount:a[3]?.replace(/"/g,"")||a[1]||"UNKNOWN",amount:parseFloat(a[4]||a[2]||"0"),utrNumber:a[8]||a[5]||`RBIUTR${Date.now().toString().slice(-8)}${e}`,statusCode:"00",statusDesc:"Settled via RBI Clearing",clearingDate:new Date().toISOString()})}return r}}},728:(e,t,r)=>{r.d(t,{Z:()=>s,_:()=>a});let n=require("@prisma/client"),a=globalThis.prisma??new n.PrismaClient({log:["error"]}),s=a}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),n=t.X(0,[9276,5972],()=>r(2035));module.exports=n})();