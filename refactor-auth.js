import fs from 'fs';
import path from 'path';

const rootDir = 'd:/OneDrive - Inflow Technologies Pvt Ltd/Desktop/p2c/src/app/api';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir(rootDir, (filePath) => {
    if (filePath.endsWith('route.js') || filePath.endsWith('route.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        // Regex to match imports of authOptions from:
        // 1. subdirectories of auth/[...nextauth]/route (relative)
        // 2. @/app/api/auth/[...nextauth]/route (alias)
        const regex = /import\s+\{\s*authOptions\s*\}\s+from\s+['"]((\.\.\/)+auth\/\[\.\.\.nextauth\]\/route|@\/app\/api\/auth\/\[\.\.\.nextauth\]\/route)['"];?/g;

        if (regex.test(content)) {
            console.log(`Updating ${filePath}`);
            const newContent = content.replace(regex, 'import { authOptions } from "@/lib/auth";');
            fs.writeFileSync(filePath, newContent);
        }
    }
});
