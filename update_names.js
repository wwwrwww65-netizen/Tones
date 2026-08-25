const fs = require('fs');
const path = require('path');

const filesToUpdate = {
    'config/config.js': [
        { old: /"network-name"\s*:\s*" BH-NET ",/g, new: '"network-name": " شبكة البرق نت اللاسلكية ",' },
        { old: /"service-number"\s*:\s*"738348945",/g, new: '"service-number": "773127677",' },
        { old: /"redirect-to-mobasher"\s*:\s*"https:\/\/kor\.fntvs\.net\/channel\.php",/g, new: '"redirect-to-mobasher": "fiberlive/live.html",' }
    ],
    'index.html': [
        { old: /BH-NET/g, new: 'البرق نت' },
        { old: /738348945/g, new: '773127677' },
        { old: /%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%20%D8%AE%D8%AF%D9%85%D8%A9%20%D8%B9%D9%85%D9%84%D8%A7%D8%A1%20%D8%B4%D8%A8%D9%83%D8%A9%20BH-NET%20%D8%A7%D9%84%D9%84%D8%A7%D8%B3%D9%84%D9%83%D9%8A%D8%A9/g, new: '%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%20%D8%AE%D8%AF%D9%85%D8%A9%20%D8%B9%D9%85%D9%84%D8%A7%D8%A1%20%D8%B4%D8%A8%D9%83%D8%A9%20%D8%A7%D9%84%D8%A8%D8%B1%D9%82%20%D9%86%D8%AA%20%D8%A7%D9%84%D9%84%D8%A7%D8%B3%D9%84%D9%83%D9%8A%D8%A9' }
    ],
    'js/security.min.js': [
        { old: /BH-NET/g, new: 'البرق نت' }
    ],
    'server.ts': [
        { old: /BH-NET/g, new: 'Barq-Net' }
    ],
    'css/theme-colors.css': [
        { old: /BH-NET/g, new: 'البرق نت' }
    ]
};

function update() {
    const basePath = __dirname;
    for (const [relPath, replacements] of Object.entries(filesToUpdate)) {
        const filepath = path.join(basePath, relPath);
        if (!fs.existsSync(filepath)) {
            console.log(`File note found: ${filepath}`);
            continue;
        }
        let content = fs.readFileSync(filepath, 'utf-8');
        
        for (const { old: oldPattern, new: newStr } of replacements) {
            content = content.replace(oldPattern, newStr);
        }
        
        fs.writeFileSync(filepath, content, 'utf-8');
        console.log(`Updated ${filepath}`);
    }
}

update();
console.log("Done!");
