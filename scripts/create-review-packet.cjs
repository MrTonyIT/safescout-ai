const fs=require('node:fs'),path=require('node:path');
const {readPack}=require('./curriculum-lib.cjs');
const {pack,registry,sources}=readPack();
const dir=path.resolve(__dirname,'../docs/research-2026-09-27');fs.mkdirSync(dir,{recursive:true});
const lines=['# Hồ sơ 12 bài Milo — CHƯA DUYỆT','',pack.notice,'','Phiên bản: '+pack.version+'. Nhóm tuổi đề xuất: 7–10. Ngày đối chiếu nguồn: '+registry.checkedAt+'.',
'','Không tự điền tên chuyên gia. Chuyên gia cần kiểm tra đúng phiên bản nội dung và câu hỏi, ghi ý kiến sửa, họ tên/vai trò, ngày, độ tuổi và phạm vi đồng ý. Duyệt trên giấy chưa tự làm bài xuất hiện trong bản gia đình.',
'','## Hướng dẫn người duyệt','',
'- Kiểm tra tính đúng, ngoại lệ, độ tuổi, mức đọc, nguy cơ gây sợ/đổ lỗi và phù hợp tại Việt Nam.',
'- Kiểm tra từng đáp án và lời giải; điểm bài không chứng nhận khả năng xử trí ngoài đời.',
'- Kiểm tra hoạt động không dùng nguy hiểm thật, không ép tiết lộ hay tiếp xúc cơ thể.',
'- Xác định cách người lớn phản hồi khi trẻ kể chuyện bị hại; không để AI tự xử lý tiết lộ.',
'- Ghi đồng ý / cần sửa / loại bỏ cho từng bài; chưa đủ chuyên môn thì chuyển người phù hợp.',
'- Thay nội dung sau duyệt phải duyệt lại phiên bản; cần pilot có phụ huynh trước phát hành.',''];
for(const l of pack.lessons){
 lines.push('## '+l.id+' — '+l.title,'','**Chủ đề:** '+pack.topics[l.topic],'','**Mục tiêu:** '+l.objective,'','**Tình huống:** '+l.story,'',...l.keyPoints.map(x=>'- '+x),'');
 l.questions.forEach((q,i)=>lines.push('### Câu '+(i+1),'',q.prompt,'',...q.options.map((o,j)=>String.fromCharCode(65+j)+'. '+o),'','Đáp án: '+String.fromCharCode(65+q.correct)+'. '+q.explanation,''));
 lines.push('**Thực hành:** '+l.activity,'','**Kể lại:** '+l.teachBack,'','**Cần chuyên gia kiểm tra:** '+l.reviewFocus,'','**Nguồn đối chiếu:**',...l.sourceIds.map(id=>{const s=sources.get(id);return '- ['+s.publisher+' — '+s.title+']('+s.url+')';}),'','**Kết luận người duyệt:** Chưa có.','Họ tên / chuyên môn / ngày / phiên bản / độ tuổi / ý kiến sửa: __________________','');
}
lines.push('## Danh mục nguồn và phạm vi đã đọc','',registry.method,'',registry.rights,'');
for(const s of registry.sources)lines.push('### '+s.id+' — '+s.publisher,'','['+s.title+']('+s.url+')','',s.region+' · '+s.readDepth+' · '+s.ageFit,'','Sử dụng: '+s.use,'','Giới hạn: '+s.limits,'');
fs.writeFileSync(path.join(dir,'12-BAI-CHO-DUYET.md'),lines.join('\n'));
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const html=lines.map(line=>{
 if(line.startsWith('### '))return '<h3>'+escape(line.slice(4))+'</h3>';
 if(line.startsWith('## '))return '<h2>'+escape(line.slice(3))+'</h2>';
 if(line.startsWith('# '))return '<h1>'+escape(line.slice(2))+'</h1>';
 return line?'<p>'+escape(line).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\[([^\]]+)\]\((https:\/\/[^)]+)\)/g,'<a href="$2" rel="noreferrer">$1</a>')+'</p>':'';
}).join('\n');
fs.writeFileSync(path.join(dir,'12-BAI-CHO-DUYET.html'),'<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>12 bài Milo chờ duyệt</title><style>body{font:18px/1.6 system-ui;max-width:860px;margin:32px auto;padding:20px;color:#17384d;background:#fffdf7}h1,h2,h3{line-height:1.3}h2{border-top:2px solid #b5cbd3;padding-top:24px}a{color:#14517a;overflow-wrap:anywhere}p{white-space:pre-wrap}@media print{body{font-size:12pt}h2{break-before:page}h2,h3{break-after:avoid}}</style><body>'+html+'</body></html>');
console.log('Review packet written: '+dir);
