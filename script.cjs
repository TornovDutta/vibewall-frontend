const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  let files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        filelist.push(path.join(dir, file));
      }
    }
  });
  return filelist;
};

const files = walkSync(path.join(__dirname, 'src'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/className=(['"])(.*?)\1/g, (match, p1, p2) => {
    let classes = p2.split(/\s+/);
    const hasDarkBg = classes.some(c => c.startsWith('bg-violet') || c.startsWith('bg-gradient') || c.startsWith('bg-red') || c.startsWith('from-') || c.startsWith('bg-black'));
    if (!hasDarkBg) {
      classes = classes.map(c => c === 'text-white' ? 'text-gray-900' : c);
    }
    return 'className=' + p1 + classes.join(' ') + p1;
  });

  content = content.replace(/className=\{\`(.*?)\`\}/g, (match, p1) => {
    let classes = p1.split(/\s+/);
    const hasDarkBg = classes.some(c => c.startsWith('bg-violet') || c.startsWith('bg-gradient') || c.startsWith('bg-red') || c.startsWith('from-') || c.startsWith('bg-black'));
    if (!hasDarkBg) {
      classes = classes.map(c => c === 'text-white' ? 'text-gray-900' : c);
    }
    return 'className={`' + classes.join(' ') + '`}';
  });

  fs.writeFileSync(file, content, 'utf8');
});
console.log('Fixed text-white');
