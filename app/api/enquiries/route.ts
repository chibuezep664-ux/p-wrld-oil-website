import {NextRequest,NextResponse} from 'next/server';import {enquirySchema} from '@/lib/validation';import {allowed} from '@/lib/security/rate-limit';import {readJsonBody} from '@/lib/security/read-json-body';import {supabaseAdmin} from '@/lib/supabase/admin';
export const runtime='nodejs';
export async function POST(request:NextRequest){
 const body=await readJsonBody(request,12_000);
 if(!body.ok)return NextResponse.json({error:body.status===413?'Request is too large.':'Invalid request body.'},{status:body.status});
 const ip=request.headers.get('x-real-ip')||request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';
 const limit=await allowed(`enquiry:${ip}`,5,3600);
 if(!limit.available)return NextResponse.json({error:'Enquiry service is not configured or temporarily unavailable. Please contact us by WhatsApp or email.'},{status:503});
 if(!limit.allowed)return NextResponse.json({error:'Too many enquiry attempts. Please try again later or contact us directly.'},{status:429});
 const parsed=enquirySchema.safeParse(body.value);
 if(!parsed.success)return NextResponse.json({error:'Please check the highlighted information and try again.',fields:parsed.error.flatten().fieldErrors},{status:400});
 if(parsed.data.website)return NextResponse.json({error:'Unable to accept this enquiry.'},{status:400});
 const {website,...enquiry}=parsed.data;void website;
 try{
  const {error}=await supabaseAdmin().from('enquiries').insert({...enquiry,status:'new'});
  if(error){console.error('Enquiry persistence failed:',error.code);return NextResponse.json({error:'We could not save your enquiry right now. Please try WhatsApp or email.'},{status:503})}
  return NextResponse.json({ok:true},{status:201});
 }catch(error){console.error('Enquiry endpoint unavailable:',error instanceof Error?error.message:'unknown');return NextResponse.json({error:'Enquiry service is not configured or is temporarily unavailable. Please contact us by WhatsApp or email.'},{status:503})}
}
