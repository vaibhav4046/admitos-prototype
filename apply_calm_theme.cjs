const fs = require('fs');
const path = require('path');

function replaceTheme(content) {
  let newContent = content;
  
  // Base/Surface
  newContent = newContent.replace(/bg-\[var\(--color-lucid-base\)]/g, 'bg-calm-bg');
  newContent = newContent.replace(/bg-\[var\(--color-lucid-surface\)]/g, 'bg-calm-surface');
  newContent = newContent.replace(/bg-\[var\(--color-lucid-surface-hover\)]/g, 'bg-calm-surface-2');
  newContent = newContent.replace(/hover:bg-\[var\(--color-lucid-surface-hover\)]/g, 'hover:bg-calm-surface-2');
  newContent = newContent.replace(/hover:bg-\[var\(--color-lucid-surface\)]/g, 'hover:bg-calm-surface');
  
  // Border
  newContent = newContent.replace(/border-\[var\(--color-lucid-border\)]/g, 'border-calm-border');
  newContent = newContent.replace(/hover:border-\[var\(--color-lucid-border\)]/g, 'hover:border-calm-border');
  newContent = newContent.replace(/divide-\[var\(--color-lucid-border\)]/g, 'divide-calm-border');
  
  // Text
  newContent = newContent.replace(/text-\[var\(--color-lucid-text\)]/g, 'text-calm-text');
  newContent = newContent.replace(/text-\[var\(--color-lucid-text-muted\)]/g, 'text-calm-text-muted');
  newContent = newContent.replace(/hover:text-\[var\(--color-lucid-text\)]/g, 'hover:text-calm-text');
  newContent = newContent.replace(/hover:text-\[var\(--color-lucid-text-muted\)]/g, 'hover:text-calm-text-muted');
  
  // Accent (Primary)
  newContent = newContent.replace(/bg-\[var\(--color-lucid-accent\)]/g, 'bg-calm-primary');
  newContent = newContent.replace(/hover:bg-\[var\(--color-lucid-accent-hover\)]/g, 'hover:bg-calm-primary-hover');
  newContent = newContent.replace(/text-\[var\(--color-lucid-accent\)]/g, 'text-calm-primary');
  newContent = newContent.replace(/border-\[var\(--color-lucid-accent\)]/g, 'border-calm-primary');
  newContent = newContent.replace(/ring-\[var\(--color-lucid-accent\)]/g, 'ring-calm-primary');
  
  // AI (Accent / Purple)
  newContent = newContent.replace(/bg-\[var\(--color-lucid-ai\)]/g, 'bg-calm-accent');
  newContent = newContent.replace(/text-\[var\(--color-lucid-ai\)]/g, 'text-calm-accent');
  newContent = newContent.replace(/border-\[var\(--color-lucid-ai\)]/g, 'border-calm-accent');
  
  // Warn
  newContent = newContent.replace(/bg-\[var\(--color-lucid-warn-bg\)]/g, 'bg-calm-warning/10');
  newContent = newContent.replace(/bg-\[var\(--color-lucid-warn\)]/g, 'bg-calm-warning');
  newContent = newContent.replace(/text-\[var\(--color-lucid-warn\)]/g, 'text-calm-warning');
  newContent = newContent.replace(/border-\[var\(--color-lucid-warn\)]/g, 'border-calm-warning');
  
  // Raw vars in style attributes or complex classes
  newContent = newContent.replace(/var\(--color-lucid-base\)/g, 'var(--calm-bg)');
  newContent = newContent.replace(/var\(--color-lucid-surface\)/g, 'var(--calm-surface)');
  newContent = newContent.replace(/var\(--color-lucid-surface-hover\)/g, 'var(--calm-surface-2)');
  newContent = newContent.replace(/var\(--color-lucid-border\)/g, 'var(--calm-border)');
  newContent = newContent.replace(/var\(--color-lucid-text\)/g, 'var(--calm-text)');
  newContent = newContent.replace(/var\(--color-lucid-text-muted\)/g, 'var(--calm-text-muted)');
  newContent = newContent.replace(/var\(--color-lucid-accent\)/g, 'var(--calm-primary)');
  newContent = newContent.replace(/var\(--color-lucid-accent-hover\)/g, 'var(--calm-primary-hover)');
  newContent = newContent.replace(/var\(--color-lucid-ai\)/g, 'var(--calm-accent)');
  newContent = newContent.replace(/var\(--color-lucid-warn\)/g, 'var(--calm-warning)');
  
  // Also replace some hardcoded colors that might still be there
  newContent = newContent.replace(/text-emerald-400/g, 'text-calm-success');
  newContent = newContent.replace(/text-emerald-500/g, 'text-calm-success');
  newContent = newContent.replace(/text-emerald-600/g, 'text-calm-success');
  newContent = newContent.replace(/text-emerald-700/g, 'text-calm-success');
  newContent = newContent.replace(/bg-emerald-500\/20/g, 'bg-calm-success/20');
  newContent = newContent.replace(/bg-emerald-500/g, 'bg-calm-success');
  newContent = newContent.replace(/bg-emerald-50/g, 'bg-calm-success/10');
  newContent = newContent.replace(/border-emerald-200/g, 'border-calm-success/30');
  
  newContent = newContent.replace(/text-rose-400/g, 'text-calm-error');
  newContent = newContent.replace(/text-rose-500/g, 'text-calm-error');
  newContent = newContent.replace(/text-rose-600/g, 'text-calm-error');
  newContent = newContent.replace(/text-rose-700/g, 'text-calm-error');
  newContent = newContent.replace(/bg-rose-500\/20/g, 'bg-calm-error/20');
  newContent = newContent.replace(/bg-rose-500/g, 'bg-calm-error');
  newContent = newContent.replace(/bg-rose-50/g, 'bg-calm-error/10');
  newContent = newContent.replace(/border-rose-200/g, 'border-calm-error/30');
  
  newContent = newContent.replace(/text-amber-400/g, 'text-calm-warning');
  newContent = newContent.replace(/text-amber-500/g, 'text-calm-warning');
  newContent = newContent.replace(/text-amber-600/g, 'text-calm-warning');
  newContent = newContent.replace(/text-amber-700/g, 'text-calm-warning');
  newContent = newContent.replace(/bg-amber-500\/20/g, 'bg-calm-warning/20');
  newContent = newContent.replace(/bg-amber-500/g, 'bg-calm-warning');
  newContent = newContent.replace(/bg-amber-50/g, 'bg-calm-warning/10');
  newContent = newContent.replace(/border-amber-200/g, 'border-calm-warning/30');
  
  newContent = newContent.replace(/text-blue-400/g, 'text-calm-info');
  newContent = newContent.replace(/text-blue-500/g, 'text-calm-info');
  newContent = newContent.replace(/text-blue-600/g, 'text-calm-info');
  newContent = newContent.replace(/text-blue-700/g, 'text-calm-info');
  newContent = newContent.replace(/bg-blue-500\/20/g, 'bg-calm-info/20');
  newContent = newContent.replace(/bg-blue-500/g, 'bg-calm-info');
  newContent = newContent.replace(/bg-blue-50/g, 'bg-calm-info/10');
  newContent = newContent.replace(/border-blue-200/g, 'border-calm-info/30');

  return newContent;
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const newContent = replaceTheme(content);
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

const targetDir = path.join(__dirname, 'src');
processDirectory(targetDir);
