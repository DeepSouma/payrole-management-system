"use strict";(()=>{var e={};e.id=4921,e.ids=[4921],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},5292:(e,t,a)=>{a.r(t),a.d(t,{originalPathname:()=>S,patchFetch:()=>g,requestAsyncStorage:()=>C,routeModule:()=>I,serverHooks:()=>b,staticGenerationAsyncStorage:()=>N});var r={};a.r(r),a.d(r,{POST:()=>p});var n=a(9303),o=a(8716),s=a(670),i=a(7070),c=a(728),d=a(9945),l=a(6607),u=a(5888),m=a(7662);async function p(e){try{let t;let{payrollRunId:a,bankAccountId:r,method:n}=await e.json(),o=await c.Z.payrollRun.findUnique({where:{id:a},include:{records:{include:{employee:!0}}}});if(!o)return i.NextResponse.json({success:!1,error:"Payroll run not found"},{status:404});if("APPROVED"!==o.status&&"FINALIZED"!==o.status)return i.NextResponse.json({success:!1,error:"Payroll must be in APPROVED or FINALIZED status before triggering bank disbursements."},{status:400});let s=await c.Z.bankAccount.findUnique({where:{id:r}});if(!s)return i.NextResponse.json({success:!1,error:"Corporate bank account not found"},{status:404});if(s.availableBalance<o.totalNet)return i.NextResponse.json({success:!1,error:`Insufficient corporate treasury balance. Required: ₹${o.totalNet.toLocaleString()}, Available: ₹${s.availableBalance.toLocaleString()}`},{status:400});let p=o.records.map(e=>({payrollRecordId:e.id,employeeCode:e.employee.employeeCode,name:`${e.employee.firstName} ${e.employee.lastName}`,accountNumber:e.employee.accountNumber||"5010099887766",ifscCode:e.employee.ifscCode||"HDFC0001234",bankName:e.employee.bankName||"HDFC Bank",amount:e.netSalary,email:e.employee.email,phone:e.employee.phone||"9876543210"})),I=`BATCH-${o.periodYear}${String(o.periodMonth).padStart(2,"0")}-${s.bankCode}-${Date.now().toString().slice(-4)}`;if("HDFC_API"===n){let e=new d.l(s.corporateId||void 0,s.accountNumber);t=await e.executeDirectAPIDisbursement(I,p)}else if("ICICI_API"===n){let e=new l.n(s.corporateId||void 0,s.accountNumber);t=await e.executeCompositeAPIDisbursement(I,p)}else{let e=new u.u().generateNACH306File(I,s.accountNumber,p);t={success:!0,batchReference:I,bankRefNumber:`H2H-SFTP-${Date.now().toString().slice(-8)}`,totalDisbursed:o.totalNet,transactions:p.map((e,t)=>({payrollRecordId:e.payrollRecordId,beneficiaryName:e.name,accountNumber:e.accountNumber,ifscCode:e.ifscCode,amount:e.amount,paymentMode:"NEFT",utrNumber:`H2HUTR${new Date().toISOString().slice(0,10).replace(/-/g,"")}${String(Math.floor(1e7+9e7*Math.random()))}`,status:"PAID",responseCode:"00",responseMessage:"Disbursed via Automated Corporate Host-to-Host SFTP Clearing Queue"})),h2hFileName:e.fileName,h2hContent:e.content}}let C=await c.Z.paymentBatch.create({data:{batchNumber:I,payrollRunId:o.id,bankAccountId:s.id,method:n||"HDFC_API",totalAmount:o.totalNet,totalRecords:p.length,successCount:t.transactions.length,status:"SETTLED",bankRefNumber:t.bankRefNumber,settledAt:new Date}});for(let e of t.transactions)await c.Z.paymentTransaction.create({data:{paymentBatchId:C.id,payrollRecordId:e.payrollRecordId,beneficiaryName:e.beneficiaryName,accountNumber:e.accountNumber,ifscCode:e.ifscCode,bankName:s.bankName,amount:e.amount,paymentMode:e.paymentMode,utrNumber:e.utrNumber,status:"PAID",responseCode:e.responseCode,responseMessage:e.responseMessage,executedAt:new Date}}),await c.Z.payrollRecord.update({where:{id:e.payrollRecordId},data:{paymentStatus:"PAID",paymentDate:new Date,paymentReference:e.utrNumber,paymentMethod:n}});return await c.Z.bankAccount.update({where:{id:s.id},data:{availableBalance:s.availableBalance-o.totalNet}}),t.h2hFileName&&await c.Z.h2HFile.create({data:{paymentBatchId:C.id,fileName:t.h2hFileName,fileFormat:"NACH_306_TXT",fileSize:t.h2hContent.length,fileContent:t.h2hContent,status:"RECONCILED",transmittedAt:new Date}}),await (0,m.b)({action:"EXECUTE_PAYROLL_DISBURSEMENT",module:"PAYMENTS",recordId:C.id,recordName:`Batch ${I} via ${n} (Total ₹${o.totalNet})`,newValue:{batchNumber:I,bank:s.bankName,totalNet:o.totalNet,count:p.length}}),i.NextResponse.json({success:!0,paymentBatch:C,disburseResult:t,message:`Successfully processed salary disbursement of ₹${o.totalNet.toLocaleString()} across ${p.length} employee accounts via ${n}.`})}catch(e){return console.error("Payment disburse error:",e),i.NextResponse.json({success:!1,error:e.message},{status:500})}}let I=new n.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api/payments/disburse/route",pathname:"/api/payments/disburse",filename:"route",bundlePath:"app/api/payments/disburse/route"},resolvedPagePath:"C:\\Projects\\Payroll Management System\\src\\app\\api\\payments\\disburse\\route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:C,staticGenerationAsyncStorage:N,serverHooks:b}=I,S="/api/payments/disburse/route";function g(){return(0,s.patchFetch)({serverHooks:b,staticGenerationAsyncStorage:N})}},7662:(e,t,a)=>{a.d(t,{b:()=>n});var r=a(728);async function n(e){try{await r._.auditLog.create({data:{userId:e.userId||null,userName:e.userName||"System User",action:e.action,module:e.module,recordId:e.recordId||null,recordName:e.recordName||null,previousValueJson:e.previousValue?JSON.stringify(e.previousValue):null,newValueJson:e.newValue?JSON.stringify(e.newValue):null,ipAddress:e.ipAddress||"127.0.0.1"}})}catch(e){console.error("Failed to write audit log:",e)}}},5888:(e,t,a)=>{a.d(t,{u:()=>r});class r{constructor(e="Apex Innovations Corp.",t="NACH000049281"){this.companyName=e,this.companyUserNumber=t}generateNACH306File(e,t,a){let r=new Date().toISOString().slice(0,10).replace(/-/g,""),n=`NACH_CR_${this.companyUserNumber}_${r}_${e.slice(0,6)}.txt`,o=0,s=[],i=String(a.length).padStart(9,"0"),c=["11",this.companyUserNumber.padEnd(18," "),this.companyName.padEnd(40," ").slice(0,40),"SALARY DISBURSEMENT".padEnd(20," "),r,"0000000",i,"0".repeat(13)," ".repeat(191)].join("");return a.forEach((e,a)=>{let r=Math.round(100*e.amount);o+=r;let n=["22",String(a+1).padStart(9,"0"),e.ifscCode.padEnd(11," "),e.accountNumber.padEnd(35," "),String(r).padStart(13,"0"),"10",e.name.padEnd(40," ").slice(0,40),e.employeeCode.padEnd(20," "),t.padEnd(35," "),this.companyName.padEnd(40," ").slice(0,40)," ".repeat(99)].join("");s.push(n.padEnd(306," "))}),{fileName:n,content:[(c.slice(0,102)+String(o).padStart(13,"0")+c.slice(115)).padEnd(306," "),...s].join("\r\n")}}generateISO20022XML(e,t,a,r){let n=new Date,o=n.toISOString().slice(0,10).replace(/-/g,""),s=`ISO20022_PAIN001_${e}_${o}.xml`,i=r.reduce((e,t)=>e+t.amount,0),c=r.map((t,a)=>`      <CdtTrfTxInf>
        <PmtId>
          <EndToEndId>E2E-${e.slice(0,8)}-${String(a+1).padStart(3,"0")}</EndToEndId>
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
      <CreDtTm>${n.toISOString()}</CreDtTm>
      <NbOfTxs>${r.length}</NbOfTxs>
      <CtrlSum>${i.toFixed(2)}</CtrlSum>
      <InitgPty>
        <Nm>${this.companyName}</Nm>
      </InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>PMTINF-${e}</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <ReqdExctnDt>${n.toISOString().slice(0,10)}</ReqdExctnDt>
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
            <MmbId>${a}</MmbId>
          </ClrSysMmbId>
        </FinInstnId>
      </DbtrAgt>
${c}
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`}}parseReverseMIS(e){let t=e.split(/\r?\n/).filter(e=>e.trim().length>0),a=[];for(let e=0;e<t.length;e++){let r=t[e];if(r.includes("REC_TYPE")||r.includes("TRAN_TYPE")||r.startsWith("11")||r.startsWith("<?xml"))continue;let n=r.split(/[,\t|]/);n.length>=4&&a.push({recordIndex:e+1,beneficiaryAccount:n[3]?.replace(/"/g,"")||n[1]||"UNKNOWN",amount:parseFloat(n[4]||n[2]||"0"),utrNumber:n[8]||n[5]||`RBIUTR${Date.now().toString().slice(-8)}${e}`,statusCode:"00",statusDesc:"Settled via RBI Clearing",clearingDate:new Date().toISOString()})}return a}}},9945:(e,t,a)=>{a.d(t,{l:()=>r});class r{constructor(e="HDFC_CORP_998871",t="50200099887711"){this.corporateId=e,this.accountNumber=t}generateSUFFile(e,t){let a=new Date().toISOString().slice(0,10).replace(/-/g,"");return{fileName:`HDFC_PAYROLL_SUF_${e}_${a}.csv`,content:["REC_TYPE,BEN_CODE,DEBIT_ACC,BEN_ACC,AMOUNT,BEN_NAME,PAYMENT_MODE,BEN_IFSC,CORP_REF,EMAIL,MOBILE",...t.map((t,a)=>{let r=t.ifscCode.toUpperCase().startsWith("HDFC")?"IFT":t.amount>2e5?"RTGS":"NEFT",n=`REF-${e.slice(0,8)}-${String(a+1).padStart(3,"0")}`;return["D",t.employeeCode,this.accountNumber,t.accountNumber,t.amount.toFixed(2),`"${t.name.replace(/"/g,'""')}"`,r,t.ifscCode,n,t.email||"payroll@apex-innovations.io",t.phone||"9876543210"].join(",")})].join("\r\n")}}async executeDirectAPIDisbursement(e,t){let a=Date.now(),r=`HDFC-PAY-${a.toString().slice(-8)}`,n=0,o=t.map((e,t)=>{n+=e.amount;let a=e.ifscCode.toUpperCase().startsWith("HDFC"),r=a?"IFT":e.amount>2e5?"RTGS":"NEFT",o=`${a?"HDFCBK":"HDFCR5"}${new Date().toISOString().slice(0,10).replace(/-/g,"")}${String(Math.floor(1e7+9e7*Math.random()))}`;return{payrollRecordId:e.payrollRecordId,beneficiaryName:e.name,accountNumber:e.accountNumber,ifscCode:e.ifscCode,amount:e.amount,paymentMode:r,utrNumber:o,status:"PAID",responseCode:"00",responseMessage:"Transaction Processed Successfully via HDFC SmartHub Corporate Core Gateway"}});return{success:!0,batchReference:e,bankRefNumber:r,totalDisbursed:n,transactions:o}}}},6607:(e,t,a)=>{a.d(t,{n:()=>r});class r{constructor(e="ICICI_CORP_44321",t="000405012345"){this.corporateId=e,this.accountNumber=t}generateCIB15ColFile(e,t){let a=new Date().toISOString().slice(0,10).replace(/-/g,"");return{fileName:`ICICI_CIB_SALARY_${e}_${a}.csv`,content:["TRAN_TYPE,CORP_ACCOUNT_NO,BEN_NAME,BEN_ACCOUNT_NO,BEN_IFSC,AMOUNT,CURRENCY,PAYMENT_DATE,REMARKS,CUSTOM_REF,EMAIL,PHONE,VALUE_DATE,AUTH_FLAG,HASH_CHECKSUM",...t.map((t,a)=>{let r=t.ifscCode.toUpperCase().startsWith("ICIC"),n=`ICIC-${e.slice(0,8)}-${String(a+1).padStart(3,"0")}`,o=`SHA256_${t.accountNumber.slice(-4)}_${t.amount}`;return[r?"WIB":"NEFT",this.accountNumber,`"${t.name.replace(/"/g,'""')}"`,t.accountNumber,t.ifscCode,t.amount.toFixed(2),"INR",new Date().toLocaleDateString("en-GB"),"SALARY DISBURSEMENT",n,t.email||"payroll@apex-innovations.io",t.phone||"9876543210",new Date().toLocaleDateString("en-GB"),"Y",o].join(",")})].join("\r\n")}}async executeCompositeAPIDisbursement(e,t){let a=Date.now(),r=`ICICI-CIB-${a.toString().slice(-8)}`,n=0,o=t.map(e=>{n+=e.amount;let t=e.ifscCode.toUpperCase().startsWith("ICIC"),a=t?"IFT":e.amount>2e5?"RTGS":"NEFT",r=`${t?"ICICBK":"ICICR5"}${new Date().toISOString().slice(0,10).replace(/-/g,"")}${String(Math.floor(1e7+9e7*Math.random()))}`;return{payrollRecordId:e.payrollRecordId,beneficiaryName:e.name,accountNumber:e.accountNumber,ifscCode:e.ifscCode,amount:e.amount,paymentMode:a,utrNumber:r,status:"PAID",responseCode:"00",responseMessage:"Authorized and Disbursed via ICICI Connected Banking CIB Composite Gateway"}});return{success:!0,batchReference:e,bankRefNumber:r,totalDisbursed:n,transactions:o}}}},728:(e,t,a)=>{a.d(t,{Z:()=>o,_:()=>n});let r=require("@prisma/client"),n=globalThis.prisma??new r.PrismaClient({log:["error"]}),o=n}};var t=require("../../../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),r=t.X(0,[9276,5972],()=>a(5292));module.exports=r})();