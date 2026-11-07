from pathlib import Path
import re, zlib
b = next(Path('S:/Network_Fianl').glob('*.pdf')).read_bytes()
objects = {int(m[1]):m[2] for m in re.finditer(rb'(\d+)\s+0\s+obj(.*?)endobj', b, re.S)}
def stream(obj):
    raw = re.split(rb'stream\r?\n', obj, maxsplit=1)[1].split(b'endstream')[0].rstrip(b'\r\n')
    return zlib.decompress(raw) if b'/FlateDecode' in obj else raw
maps = {}
for name, ref in re.findall(rb'/(TT\d+)\s+(\d+) 0 R', objects[4]):
    font=objects[int(ref)]
    u=re.search(rb'/ToUnicode (\d+) 0 R',font)
    mapping={}
    if u:
        cmap=stream(objects[int(u[1])])
        for a,z,d in re.findall(rb'<([\da-f]+)>\s*<([\da-f]+)>\s*<([\da-f]+)>', cmap):
            for c in range(int(a,16),int(z,16)+1):
                mapping[c]=chr(int(d,16)+c-int(a,16))
    maps[name]=mapping
def unescape(s):
    def convert(m):
        x=m[1]
        if x[:1] in b'01234567':return bytes([int(x,8)])
        return {b'n':b'\n',b'r':b'\r',b't':b'\t',b'b':b'\b',b'f':b'\f'}.get(x,x)
    return re.sub(rb'\\([0-7]{1,3}|.)',convert,s)
out=[]
for page, objid in enumerate([3,18,21,24,27],1):
    out.append('\n===== PAGE '+str(page)+' =====\n')
    data=stream(objects[objid]); font=b'TT1'
    for t in re.finditer(rb'/(TT\d+)\s+[\d.]+\s+Tf|\(((?:\\.|[^\\)])*)\)|\bET\b',data,re.S):
        if t[1]:font=t[1]
        elif t[2] is not None:
            out.append(''.join(maps[font].get(c,chr(c) if not maps[font] else '') for c in unescape(t[2])))
        else:out.append('\n')
text=''.join(out)
Path('S:/Network_Fianl/tmp/scope.txt').write_text(text,encoding='utf-8')
print(text)
