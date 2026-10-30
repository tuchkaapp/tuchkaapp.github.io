export async function submitContactRequest({name,email,token,botcheck=false,endpoint},{fetchImpl=fetch,signal}={}) {
  const target=new URL(endpoint);
  if(target.protocol!=='https:' || target.hostname!=='tuchka-contact-api.eveoks.workers.dev' || target.pathname!=='/contact') throw new Error('configuration');
  const response=await fetchImpl(target.href,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},signal,
    body:JSON.stringify({name:name.trim(),email:email.trim(),token,botcheck})});
  const result=await response.json();
  if(!response.ok || result.success!==true) throw new Error(result.error==='challenge'?'challenge':'delivery');
}
