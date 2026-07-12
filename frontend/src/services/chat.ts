import { supabase } from './supabase'
import { currentUserId } from './modules'

export type ChatType = 'text' | 'voice' | 'image' | 'pdf' | 'video'
export type ChatMessage = { id:string;conversation_id:string;sender_id:string;type:ChatType;body:string|null;attachment_path:string|null;sent_at:string;delivered_at:string|null;read_at:string|null;status:'sent'|'delivered'|'read';file_name:string|null;file_size:number|null;mime_type:string|null;duration_seconds:number|null;mediaUrl?:string }
export type ChatConversation = { id:string;patient_id:string;doctor_id:string;updated_at:string;otherName:string;otherRole:string;lastMessage:string;unread:number }

export async function listChats():Promise<{userId:string;conversations:ChatConversation[]}> {
  const userId=await currentUserId()
  const {data:me,error:meError}=await supabase.from('profiles').select('role').eq('id',userId).single();if(meError)throw meError
  const {data:rows,error}=await supabase.from('conversations').select('id,patient_id,doctor_id,updated_at').eq('status','open').order('updated_at',{ascending:false});if(error)throw error
  await Promise.all((rows??[]).map(c=>supabase.from('messages').update({status:'delivered',delivered_at:new Date().toISOString()}).eq('conversation_id',c.id).neq('sender_id',userId).eq('status','sent')))
  const ids=(rows??[]).map(c=>c.patient_id===userId?c.doctor_id:c.patient_id)
  let names=new Map<string,string>()
  if(me.role==='patient'){const {data}=await supabase.rpc('list_verified_doctors');for(const p of data??[])names.set(p.id,p.full_name)}
  else if(ids.length){const {data}=await supabase.from('profiles').select('id,full_name').in('id',ids);for(const p of data??[])names.set(p.id,p.full_name)}
  const conversations:ChatConversation[]=await Promise.all((rows??[]).map(async c=>{const otherId=c.patient_id===userId?c.doctor_id:c.patient_id;const {data:last}=await supabase.from('messages').select('body,type,file_name').eq('conversation_id',c.id).order('sent_at',{ascending:false}).limit(1).maybeSingle();const {count}=await supabase.from('messages').select('id',{count:'exact',head:true}).eq('conversation_id',c.id).neq('sender_id',userId).is('read_at',null);return {...c,otherName:names.get(otherId)||`${me.role==='patient'?'Doctor':'Patient'} ${otherId.slice(0,6)}`,otherRole:me.role==='patient'?'Doctor':'Patient',lastMessage:last?.body||last?.file_name||`${last?.type||'No'} message`,unread:count??0}}))
  return {userId,conversations}
}

async function addUrls(items:ChatMessage[]){return Promise.all(items.map(async m=>{if(!m.attachment_path)return m;const {data}=await supabase.storage.from('chat-files').createSignedUrl(m.attachment_path,3600);return {...m,mediaUrl:data?.signedUrl}}))}
export async function loadChat(conversationId:string){const {data,error}=await supabase.from('messages').select('*').eq('conversation_id',conversationId).order('sent_at');if(error)throw error;return addUrls((data??[]) as ChatMessage[])}
export async function sendText(conversationId:string,body:string){const sender_id=await currentUserId();const {data,error}=await supabase.from('messages').insert({conversation_id:conversationId,sender_id,type:'text',body:body.trim(),status:'sent'}).select().single();if(error)throw error;return data as ChatMessage}
export async function sendMedia(conversationId:string,file:File,type:Exclude<ChatType,'text'>,duration?:number){const sender_id=await currentUserId();const path=`${conversationId}/${sender_id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;const {error:uploadError}=await supabase.storage.from('chat-files').upload(path,file,{cacheControl:'3600'});if(uploadError)throw uploadError;const {data,error}=await supabase.from('messages').insert({conversation_id:conversationId,sender_id,type,attachment_path:path,file_name:file.name,file_size:file.size,mime_type:file.type,duration_seconds:duration??null,status:'sent'}).select().single();if(error){await supabase.storage.from('chat-files').remove([path]);throw error}return (await addUrls([data as ChatMessage]))[0]}
export async function markChatRead(conversationId:string,userId:string){const now=new Date().toISOString();const {error}=await supabase.from('messages').update({status:'read',delivered_at:now,read_at:now}).eq('conversation_id',conversationId).neq('sender_id',userId).is('read_at',null);if(error)throw error}
export async function setTyping(conversationId:string,is_typing:boolean){const user_id=await currentUserId();const {error}=await supabase.from('typing_indicators').upsert({conversation_id:conversationId,user_id,is_typing,updated_at:new Date().toISOString()});if(error)throw error}
export function subscribeChat(conversationId:string,onMessage:()=>void,onTyping:()=>void){const channel=supabase.channel(`chat-${conversationId}`).on('postgres_changes',{event:'*',schema:'public',table:'messages',filter:`conversation_id=eq.${conversationId}`},onMessage).on('postgres_changes',{event:'*',schema:'public',table:'typing_indicators',filter:`conversation_id=eq.${conversationId}`},onTyping).subscribe();return()=>{supabase.removeChannel(channel)}}
export async function otherIsTyping(conversationId:string,userId:string){const cutoff=new Date(Date.now()-7000).toISOString();const {data}=await supabase.from('typing_indicators').select('is_typing,updated_at').eq('conversation_id',conversationId).neq('user_id',userId).eq('is_typing',true).gte('updated_at',cutoff).maybeSingle();return Boolean(data)}
