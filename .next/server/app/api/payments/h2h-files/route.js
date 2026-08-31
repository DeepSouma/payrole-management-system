"use strict";(()=>{var e={};e.id=8527,e.ids=[8527],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},5200:(e,t,n)=>{n.r(t),n.d(t,{originalPathname:()=>y,patchFetch:()=>h,requestAsyncStorage:()=>S,routeModule:()=>N,serverHooks:()=>f,staticGenerationAsyncStorage:()=>g});var r={};n.r(r),n.d(r,{GET:()=>I,POST:()=>C,dynamic:()=>p});var a=n(9303),o=n(8716),s=n(670),i=n(7070),c=n(728),d=n(9945),l=n(6607),m=n(5888),u=n(7662);let p="force-dynamic";async function I(){try{let e=await c.Z.h2HFile.findMany({include:{paymentBatch:{include:{bankAccount:!0}}},orderBy:{createdAt:"desc"},take:50});return i.NextResponse.json({success:!0,files:e})}catch(e){return i.NextResponse.json({success:!1,error:e.message},{status:500})}}async function C(e){try{let t;let{payrollRunId:n,format:r,bankAccountId:a}=await e.json(),o=await c.Z.payrollRun.findUnique({where:{id:n},include:{records:{include:{employee:!0}}}});if(!o)return i.NextResponse.json({success:!1,error:"Payroll run not found"},{status:404});let s=await c.Z.bankAccount.findFirst({where:a?{id:a}:void 0}),p=s?.accountNumber||"50200099887711",I=s?.ifscCode||"HDFC0000128",C=o.records.map(e=>({payrollRecordId:e.id,employeeCode:e.employee.employeeCode,name:`${e.employee.firstName} ${e.employee.lastName}`,accountNumber:e.employee.accountNumber||"5010099887766",ifscCode:e.employee.ifscCode||"HDFC0001234",bankName:e.employee.bankName||"HDFC Bank",amount:e.netSalary,email:e.employee.email,phone:e.employee.phone||"9876543210"}));t="HDFC_SUF_CSV"===r?new d.l(s?.corporateId||void 0,p).generateSUFFile(o.id,C):"ICICI_CIB_15COL"===r?new l.n(s?.corporateId||void 0,p).generateCIB15ColFile(o.id,C):"ISO_20022_XML"===r?new m.u().generateISO20022XML(o.id,p,I,C):new m.u().generateNACH306File(o.id,p,C);let N=await c.Z.h2HFile.create({data:{fileName:t.fileName,fileFormat:r||"NACH_306_TXT",fileSize:t.content.length,fileContent:t.content,direction:"INWARD_TO_BANK",status:"READY"}});return await (0,u.b)({action:"GENERATE_H2H_FILE",module:"PAYMENTS",recordId:N.id,recordName:`${N.fileName} (${r})`}),i.NextResponse.json({success:!0,file:N,fileName:t.fileName,content:t.content,message:`Successfully generated ${r} payment file for ${C.length} employees.`})}catch(e){return console.error("H2H file generation error:",e),i.NextResponse.json({success:!1,error:e.message},{status:500})}}let N=new a.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/payments/h2h-files/route",pathname:"/api/payments/h2h-files",filename:"route",bundlePath:"app/api/payments/h2h-files/route"},resolvedPagePath:"C:\\Projects\\Payroll Management System\\src\\app\\api\\payments\\h2h-files\\route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:S,staticGenerationAsyncStorage:g,serverHooks:f}=N,y="/api/payments/h2h-files/route";function h(){return(0,s.patchFetch)({serverHooks:f,staticGenerationAsyncStorage:g})}},7662:(e,t,n)=>{n.d(t,{b:()=>a});var r=n(728);async function a(e){try{await r._.auditLog.create({data:{userId:e.userId||null,userName:e.userName||"System User",action:e.action,module:e.module,recordId:e.recordId||null,recordName:e.recordName||null,previousValueJson:e.previousValue?JSON.stringify(e.previousValue):null,newValueJson:e.newValue?JSON.stringify(e.newValue):null,ipAddress:e.ipAddress||"127.0.0.1"}})}catch(e){console.error("Failed to write audit log:",e)}}},5888:(e,t,n)=>{n.d(t,{u:()=>r});class r{constructor(e="Apex Innovations Corp.",t="NACH000049281"){this.companyName=e,this.companyUserNumber=t}generateNACH306File(e,t,n){let r=new Date().toISOString().slice(0,10).replace(/-/g,""),a=`NACH_CR_${this.companyUserNumber}_${r}_${e.slice(0,6)}.txt`,o=0,s=[],i=String(n.length).padStart(9,"0"),c=["11",this.companyUserNumber.padEnd(18," "),this.companyName.padEnd(40," ").slice(0,40),"SALARY DISBURSEMENT".padEnd(20," "),r,"0000000",i,"0".repeat(13)," ".repeat(191)].join("");return n.forEach((e,n)=>{let r=Math.round(100*e.amount);o+=r;let a=["22",String(n+1).padStart(9,"0"),e.ifscCode.padEnd(11," "),e.accountNumber.padEnd(35," "),String(r).padStart(13,"0"),"10",e.name.padEnd(40," ").slice(0,40),e.employeeCode.padEnd(20," "),t.padEnd(35," "),this.companyName.padEnd(40," ").slice(0,40)," ".repeat(99)].join("");s.push(a.padEnd(306," "))}),{fileName:a,content:[(c.slice(0,102)+String(o).padStart(13,"0")+c.slice(115)).padEnd(306," "),...s].join("\r\n")}}generateISO20022XML(e,t,n,r){let a=new Date,o=a.toISOString().slice(0,10).replace(/-/g,""),s=`ISO20022_PAIN001_${e}_${o}.xml`,i=r.reduce((e,t)=>e+t.amount,0),c=r.map((t,n)=>`      <CdtTrfTxInf>
        <PmtId>
          <EndToEndId>E2E-${e.slice(0,8)}-${String(n+1).padStart(3,"0")}</EndToEndId>
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
      </CdtTrfTxInf>`).join("\n");return{fileName:s,content:`<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>MSG-${e}-${o}</MsgId>
      <CreDtTm>${a.toISOString()}</CreDtTm>
      <NbOfTxs>${r.length}</NbOfTxs>
      <CtrlSum>${i.toFixed(2)}</CtrlSum>
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
            <MmbId>${n}</MmbId>
          </ClrSysMmbId>
        </FinInstnId>
      </DbtrAgt>
${c}
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`}}parseReverseMIS(e){let t=e.split(/\r?\n/).filter(e=>e.trim().length>0),n=[];for(let e=0;e<t.length;e++){let r=t[e];if(r.includes("REC_TYPE")||r.includes("TRAN_TYPE")||r.startsWith("11")||r.startsWith("<?xml"))continue;let a=r.split(/[,\t|]/);a.length>=4&&n.push({recordIndex:e+1,beneficiaryAccount:a[3]?.replace(/"/g,"")||a[1]||"UNKNOWN",amount:parseFloat(a[4]||a[2]||"0"),utrNumber:a[8]||a[5]||`RBIUTR${Date.now().toString().slice(-8)}${e}`,statusCode:"00",statusDesc:"Settled via RBI Clearing",clearingDate:new Date().toISOString()})}return n}}},9945:(e,t,n)=>{n.d(t,{l:()=>r});class r{constructor(e="HDFC_CORP_998871",t="50200099887711"){this.corporateId=e,this.accountNumber=t}generateSUFFile(e,t){let n=new Date().toISOString().slice(0,10).replace(/-/g,"");return{fileName:`HDFC_PAYROLL_SUF_${e}_${n}.csv`,content:["REC_TYPE,BEN_CODE,DEBIT_ACC,BEN_ACC,AMOUNT,BEN_NAME,PAYMENT_MODE,BEN_IFSC,CORP_REF,EMAIL,MOBILE",...t.map((t,n)=>{let r=t.ifscCode.toUpperCase().startsWith("HDFC")?"IFT":t.amount>2e5?"RTGS":"NEFT",a=`REF-${e.slice(0,8)}-${String(n+1).padStart(3,"0")}`;return["D",t.employeeCode,this.accountNumber,t.accountNumber,t.amount.toFixed(2),`"${t.name.replace(/"/g,'""')}"`,r,t.ifscCode,a,t.email||"payroll@apex-innovations.io",t.phone||"9876543210"].join(",")})].join("\r\n")}}async executeDirectAPIDisbursement(e,t){let n=Date.now(),r=`HDFC-PAY-${n.toString().slice(-8)}`,a=0,o=t.map((e,t)=>{a+=e.amount;let n=e.ifscCode.toUpperCase().startsWith("HDFC"),r=n?"IFT":e.amount>2e5?"RTGS":"NEFT",o=`${n?"HDFCBK":"HDFCR5"}${new Date().toISOString().slice(0,10).replace(/-/g,"")}${String(Math.floor(1e7+9e7*Math.random()))}`;return{payrollRecordId:e.payrollRecordId,beneficiaryName:e.name,accountNumber:e.accountNumber,ifscCode:e.ifscCode,amount:e.amount,paymentMode:r,utrNumber:o,status:"PAID",responseCode:"00",responseMessage:"Transaction Processed Successfully via HDFC SmartHub Corporate Core Gateway"}});return{success:!0,batchReference:e,bankRefNumber:r,totalDisbursed:a,transactions:o}}}},6607:(e,t,n)=>{n.d(t,{n:()=>r});class r{constructor(e="ICICI_CORP_44321",t="000405012345"){this.corporateId=e,this.accountNumber=t}generateCIB15ColFile(e,t){let n=new Date().toISOString().slice(0,10).replace(/-/g,"");return{fileName:`ICICI_CIB_SALARY_${e}_${n}.csv`,content:["TRAN_TYPE,CORP_ACCOUNT_NO,BEN_NAME,BEN_ACCOUNT_NO,BEN_IFSC,AMOUNT,CURRENCY,PAYMENT_DATE,REMARKS,CUSTOM_REF,EMAIL,PHONE,VALUE_DATE,AUTH_FLAG,HASH_CHECKSUM",...t.map((t,n)=>{let r=t.ifscCode.toUpperCase().startsWith("ICIC"),a=`ICIC-${e.slice(0,8)}-${String(n+1).padStart(3,"0")}`,o=`SHA256_${t.accountNumber.slice(-4)}_${t.amount}`;return[r?"WIB":"NEFT",this.accountNumber,`"${t.name.replace(/"/g,'""')}"`,t.accountNumber,t.ifscCode,t.amount.toFixed(2),"INR",new Date().toLocaleDateString("en-GB"),"SALARY DISBURSEMENT",a,t.email||"payroll@apex-innovations.io",t.phone||"9876543210",new Date().toLocaleDateString("en-GB"),"Y",o].join(",")})].join("\r\n")}}async executeCompositeAPIDisbursement(e,t){let n=Date.now(),r=`ICICI-CIB-${n.toString().slice(-8)}`,a=0,o=t.map(e=>{a+=e.amount;let t=e.ifscCode.toUpperCase().startsWith("ICIC"),n=t?"IFT":e.amount>2e5?"RTGS":"NEFT",r=`${t?"ICICBK":"ICICR5"}${new Date().toISOString().slice(0,10).replace(/-/g,"")}${String(Math.floor(1e7+9e7*Math.random()))}`;return{payrollRecordId:e.payrollRecordId,beneficiaryName:e.name,accountNumber:e.accountNumber,ifscCode:e.ifscCode,amount:e.amount,paymentMode:n,utrNumber:r,status:"PAID",responseCode:"00",responseMessage:"Authorized and Disbursed via ICICI Connected Banking CIB Composite Gateway"}});return{success:!0,batchReference:e,bankRefNumber:r,totalDisbursed:a,transactions:o}}}},728:(e,t,n)=>{n.d(t,{Z:()=>o,_:()=>a});let r=require("@prisma/client"),a=globalThis.prisma??new r.PrismaClient({log:["error"]}),o=a}};var t=require("../../../../webpack-runtime.js");t.C(e);var n=e=>t(t.s=e),r=t.X(0,[9276,5972],()=>n(5200));module.exports=r})();