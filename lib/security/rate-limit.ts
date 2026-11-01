import { supabaseAdmin } from '@/lib/supabase/admin';
/** Uses an atomic PostgreSQL RPC so limits are shared across serverless instances. */
export async function allowed(key:string,limit:number,windowSeconds:number):Promise<{allowed:boolean;available:boolean}>{try{const {data,error}=await supabaseAdmin().rpc('consume_rate_limit',{p_key:key,p_limit:limit,p_window_seconds:windowSeconds});if(error)return {allowed:false,available:false};return {allowed:data===true,available:true}}catch{return {allowed:false,available:false}}}
