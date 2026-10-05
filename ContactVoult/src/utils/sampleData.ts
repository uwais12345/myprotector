// ============================================================
// ConnectDesk — Sample / Demo Contacts
// ============================================================

import type { Contact } from '@/types';
import { getAvatarColor } from '@/utils/contacts';

function makeContact(
  id: string,
  first: string,
  last: string,
  org: string,
  title: string,
  phones: { value: string; type: 'mobile' | 'work' | 'home'; isPrimary: boolean }[],
  email: string,
  options: { isFavorite?: boolean; isEmergency?: boolean } = {}
): Contact {
  const fullName = `${first} ${last}`.trim();
  return {
    id,
    firstName: first,
    lastName: last,
    fullName,
    displayName: fullName,
    organization: org || undefined,
    jobTitle: title || undefined,
    phones,
    emails: email ? [{ value: email, type: 'work', isPrimary: true }] : [],
    addresses: [],
    notes: undefined,
    avatarInitials: `${first[0]}${last[0]}`.toUpperCase(),
    avatarColor: getAvatarColor(fullName + id),
    isFavorite: options.isFavorite ?? false,
    isEmergency: options.isEmergency ?? false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export const SAMPLE_CONTACTS: Contact[] = [
  makeContact('c-001','Aisha','Rahman','Acme Corp','Senior Product Manager',[{value:'+911234567801',type:'mobile',isPrimary:true},{value:'+911234567802',type:'work',isPrimary:false}],'a.rahman@acmecorp.com',{isFavorite:true}),
  makeContact('c-002','Benjamin','Carter','GlobalTech Ltd','Principal Engineer',[{value:'+911234567803',type:'mobile',isPrimary:true}],'b.carter@globaltech.io',{isFavorite:true}),
  makeContact('c-003','Chen','Wei','Innovate Solutions','Data Scientist',[{value:'+911234567804',type:'mobile',isPrimary:true}],'chen.wei@innovate.co'),
  makeContact('c-004','Diana','Patel','MNC Systems','VP Engineering',[{value:'+911234567805',type:'mobile',isPrimary:true},{value:'+911234567806',type:'work',isPrimary:false}],'d.patel@mncsystems.com',{isFavorite:true}),
  makeContact('c-005','Edward','Kowalski','StartupX','Co-founder',[{value:'+911234567807',type:'mobile',isPrimary:true}],'ed@startupx.io'),
  makeContact('c-006','Fatima','Al-Rashid','Atlas Finance','Head of Risk',[{value:'+911234567808',type:'mobile',isPrimary:true}],'f.alrashid@atlas.com'),
  makeContact('c-007','George','Nkemdirim','Precision Mfg','Operations Manager',[{value:'+911234567809',type:'mobile',isPrimary:true}],'g.nkemdirim@precision.com'),
  makeContact('c-008','Hannah','Lee','MediaGroup','Creative Director',[{value:'+911234567810',type:'mobile',isPrimary:true}],'h.lee@mediagroup.com'),
  makeContact('c-009','Ivan','Petrov','CyberShield','Security Architect',[{value:'+911234567811',type:'mobile',isPrimary:true}],'i.petrov@cybershield.net'),
  makeContact('c-010','Jasmine','Okafor','BioVentures','Research Scientist',[{value:'+911234567812',type:'mobile',isPrimary:true}],'j.okafor@bioventures.org'),
  makeContact('c-011','Kenji','Tanaka','Nexus Corp','Product Designer',[{value:'+911234567813',type:'mobile',isPrimary:true}],'k.tanaka@nexus.jp'),
  makeContact('c-012','Laila','Hassan','Emirates AI','ML Engineer',[{value:'+911234567814',type:'mobile',isPrimary:true}],'l.hassan@eai.ae'),
  makeContact('c-013','Marcus','Thompson','Urban Dev','Project Director',[{value:'+911234567815',type:'mobile',isPrimary:true},{value:'+911234567816',type:'home',isPrimary:false}],'m.thompson@urbandev.com'),
  makeContact('c-014','Natasha','Volkova','Quantum Labs','Physicist',[{value:'+911234567817',type:'mobile',isPrimary:true}],'n.volkova@quantum.ru'),
  makeContact('c-015','Oliver','Mendez','Horizon Bank','Branch Manager',[{value:'+911234567818',type:'mobile',isPrimary:true}],'o.mendez@horizonbank.com'),
  makeContact('c-016','Priya','Sharma','TechIndia','Software Architect',[{value:'+911234567819',type:'mobile',isPrimary:true}],'p.sharma@techindia.com',{isFavorite:true}),
  makeContact('c-017','Quentin','Dubois','EuroConsult','Strategy Lead',[{value:'+911234567820',type:'mobile',isPrimary:true}],'q.dubois@euroconsult.fr'),
  makeContact('c-018','Rachael','Kim','Samsung SDS','Cloud Architect',[{value:'+911234567821',type:'mobile',isPrimary:true}],'r.kim@samsungsds.com'),
  makeContact('c-019','Samuel','Adeyemi','Lagos Tech','CTO',[{value:'+911234567822',type:'mobile',isPrimary:true}],'s.adeyemi@lagostech.ng'),
  makeContact('c-020','Tanya','Ivanova','Siemens AG','Electrical Engineer',[{value:'+911234567823',type:'mobile',isPrimary:true}],'t.ivanova@siemens.com'),
  makeContact('c-021','Umar','Farooq','Gulf Petroleum','Logistics Head',[{value:'+911234567824',type:'mobile',isPrimary:true}],'u.farooq@gulfpetro.ae'),
  makeContact('c-022','Victoria','Nguyen','VietSoft','Frontend Lead',[{value:'+911234567825',type:'mobile',isPrimary:true}],'v.nguyen@vietsoft.vn'),
  makeContact('c-023','William','Schmidt','Bosch','Mechatronics Eng',[{value:'+911234567826',type:'mobile',isPrimary:true}],'w.schmidt@bosch.com'),
  makeContact('c-024','Xin','Zhang','Alibaba Cloud','Cloud Engineer',[{value:'+911234567827',type:'mobile',isPrimary:true}],'x.zhang@alibabacloud.com'),
  makeContact('c-025','Yasmin','Bakr','WHO','Health Analyst',[{value:'+911234567828',type:'mobile',isPrimary:true}],'y.bakr@who.int'),
  makeContact('c-026','Zara','Abebe','AfriTech','DevOps Engineer',[{value:'+911234567829',type:'mobile',isPrimary:true}],'z.abebe@afritech.et'),
  makeContact('c-em1','Mother','(Family)','Family','',[{value:'+919876543201',type:'mobile',isPrimary:true}],'',{isEmergency:true,isFavorite:true}),
  makeContact('c-em2','Brother','(Family)','Family','',[{value:'+919876543202',type:'mobile',isPrimary:true}],'',{isEmergency:true}),
  makeContact('c-em3','Dr. Ramesh','Krishnan','Apollo Hospital','General Physician',[{value:'+919876543203',type:'mobile',isPrimary:true}],'dr.krishnan@apollo.in',{isEmergency:true}),
];
