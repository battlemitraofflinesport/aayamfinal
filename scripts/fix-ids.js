const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fullPath));
        } else {
            results.push(fullPath);
        }
    });
    return results;
}

const viewFiles = walk(path.join(__dirname, '../views'));
const routesFiles = [path.join(__dirname, '../routes/authRoutes.js')];

const allFiles = [...viewFiles, ...routesFiles];

allFiles.forEach(file => {
    if (file.endsWith('.ejs') || file.endsWith('.js')) {
        let content = fs.readFileSync(file, 'utf8');
        if (content.includes('._id')) {
            // Replace all occurrences of ._id with .id
            content = content.replace(/\._id\b/g, '.id');
            fs.writeFileSync(file, content);
            console.log('Fixed IDs in:', file);
        }
    }
});
