import os
import re

files_to_update = {
    'config/config.js': [
        (r'"network-name": " BH-NET ",', r'"network-name": " شبكة البرق نت اللاسلكية ",'),
        (r'"service-number": "738348945",', r'"service-number": "773127677",'),
        (r'"redirect-to-mobasher": "https://kor.fntvs.net/channel.php",', r'"redirect-to-mobasher": "fiberlive/live.html",')
    ],
    'index.html': [
        (r'BH-NET', r'البرق نت'),
        (r'738348945', r'773127677'),
        (r'%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%20%D8%AE%D8%AF%D9%85%D8%A9%20%D8%B9%D9%85%D9%84%D8%A7%D8%A1%20%D8%B4%D8%A8%D9%83%D8%A9%20BH-NET%20%D8%A7%D9%84%D9%84%D8%A7%D8%B3%D9%84%D9%83%D9%8A%D8%A9', r'%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%20%D8%AE%D8%AF%D9%85%D8%A9%20%D8%B9%D9%85%D9%84%D8%A7%D8%A1%20%D8%B4%D8%A8%D9%83%D8%A9%20%D8%A7%D9%84%D8%A8%D8%B1%D9%82%20%D9%86%D8%AA%20%D8%A7%D9%84%D9%84%D8%A7%D8%B3%D9%84%D9%83%D9%8A%D8%A9')
    ],
    'js/security.min.js': [
        (r'BH-NET', r'البرق نت')
    ],
    'server.ts': [
        (r'BH-NET', r'Barq-Net')
    ],
    'css/theme-colors.css': [
        (r'BH-NET', r'البرق نت')
    ]
}

def update():
    base_path = r'c:\Users\هاشم\Desktop\Tones'
    for rel_path, replacements in files_to_update.items():
        filepath = os.path.join(base_path, rel_path)
        if not os.path.exists(filepath):
            continue
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for old, new in replacements:
            content = re.sub(old, new, content)
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {filepath}')

update()
print("Done!")
