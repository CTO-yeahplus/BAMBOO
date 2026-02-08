const fs = require('fs');
const path = require('path');

// 1. 저장할 파일 이름
const outputFileName = 'project_snapshot_by_NODE.txt';
const outputPath = path.join(process.cwd(), outputFileName);

// 2. 확인이 필요한 핵심 파일 목록
const targetFiles = [
    'app/types.ts',
    'app/page.tsx',
    'app/hooks/useBambooEngine.ts',
    // useSoulData가 별도 파일인지, hook 안에 있는지 확인하기 위해
    'app/hooks/engine/useSoulData.ts', 
    'app/hooks/useSoulData.ts',
    'app/components/modals/SettingsModal.tsx'
];

console.log(`🚀 진단을 시작합니다... 결과는 '${outputFileName}'에 저장됩니다.`);

// 3. 파일 초기화 (기존 내용 삭제)
fs.writeFileSync(outputPath, `PROJECT SNAPSHOT [${new Date().toLocaleString()}]\n\n`, 'utf8');

// 4. 파일 읽어서 저장하기
targetFiles.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    
    let logContent = `\n========================================\n`;
    logContent += `📄 FILE: ${filePath}\n`;
    logContent += `========================================\n`;

    if (fs.existsSync(fullPath)) {
        try {
            const content = fs.readFileSync(fullPath, 'utf8');
            logContent += content + '\n';
        } catch (err) {
            logContent += `❌ Error reading file: ${err.message}\n`;
        }
    } else {
        logContent += `⚠️ FILE NOT FOUND (파일이 이 경로에 없습니다)\n`;
    }

    // 파일에 내용 추가 (Append)
    fs.appendFileSync(outputPath, logContent, 'utf8');
    console.log(`- 확인 완료: ${filePath}`);
});

console.log(`\n✅ 완료되었습니다! 생성된 '${outputFileName}' 파일을 업로드해주세요.`);