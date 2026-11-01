export type JsonBodyResult={ok:true;value:unknown}|{ok:false;status:400|413};

export async function readJsonBody(request:Request,maxBytes:number):Promise<JsonBodyResult>{
 const declaredLength=Number(request.headers.get('content-length')||0);
 if(declaredLength>maxBytes)return {ok:false,status:413};
 const reader=request.body?.getReader();
 if(!reader)return {ok:false,status:400};
 const chunks:Uint8Array[]=[];let total=0;
 try{
  while(true){
   const {done,value}=await reader.read();
   if(done)break;
   total+=value.byteLength;
   if(total>maxBytes){await reader.cancel();return {ok:false,status:413}}
   chunks.push(value);
  }
  const bytes=new Uint8Array(total);let offset=0;
  for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength}
  return {ok:true,value:JSON.parse(new TextDecoder().decode(bytes))};
 }catch{return {ok:false,status:400}}
}
