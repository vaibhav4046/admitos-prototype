const fs = require('fs');
const path = require('path');

function replaceColors(content) {
  let newContent = content;
  
  // Backgrounds
  newContent = newContent.replace(/bg-white/g, 'bg-[var(--color-lucid-surface)]');
  newContent = newContent.replace(/bg-\[\#fafafa\]/g, 'bg-[var(--color-lucid-base)]');
  newContent = newContent.replace(/bg-zinc-50\/50/g, 'bg-[var(--color-lucid-surface-hover)]');
  newContent = newContent.replace(/bg-zinc-50/g, 'bg-[var(--color-lucid-surface-hover)]');
  newContent = newContent.replace(/bg-zinc-100/g, 'bg-[var(--color-lucid-surface-hover)]');
  newContent = newContent.replace(/bg-zinc-900/g, 'bg-[var(--color-lucid-surface)]'); // Dark cards
  
  // Borders
  newContent = newContent.replace(/border-zinc-100/g, 'border-[var(--color-lucid-border)]');
  newContent = newContent.replace(/border-zinc-200\/[0-9]+/g, 'border-[var(--color-lucid-border)]');
  newContent = newContent.replace(/border-zinc-200/g, 'border-[var(--color-lucid-border)]');
  newContent = newContent.replace(/border-zinc-300/g, 'border-[var(--color-lucid-border)]');
  
  // Text
  newContent = newContent.replace(/text-zinc-900/g, 'text-[var(--color-lucid-text)]');
  newContent = newContent.replace(/text-zinc-800/g, 'text-[var(--color-lucid-text)]');
  newContent = newContent.replace(/text-zinc-700/g, 'text-[var(--color-lucid-text-muted)]');
  newContent = newContent.replace(/text-zinc-600/g, 'text-[var(--color-lucid-text-muted)]');
  newContent = newContent.replace(/text-zinc-500/g, 'text-[var(--color-lucid-text-muted)]');
  newContent = newContent.replace(/text-zinc-400/g, 'text-[var(--color-lucid-text-muted)]');
  newContent = newContent.replace(/text-zinc-300/g, 'text-[var(--color-lucid-text-muted)]');
  newContent = newContent.replace(/text-black/g, 'text-[var(--color-lucid-text)]');
  
  // Hovers
  newContent = newContent.replace(/hover:bg-zinc-50/g, 'hover:bg-[var(--color-lucid-surface-hover)]');
  newContent = newContent.replace(/hover:bg-zinc-100/g, 'hover:bg-[var(--color-lucid-surface-hover)]');
  newContent = newContent.replace(/hover:bg-zinc-200\/[0-9]+/g, 'hover:bg-[var(--color-lucid-surface-hover)]');
  newContent = newContent.replace(/hover:bg-zinc-200/g, 'hover:bg-[var(--color-lucid-surface-hover)]');
  newContent = newContent.replace(/hover:text-zinc-900/g, 'hover:text-[var(--color-lucid-text)]');
  newContent = newContent.replace(/hover:text-zinc-700/g, 'hover:text-[var(--color-lucid-text)]');
  newContent = newContent.replace(/hover:text-zinc-600/g, 'hover:text-[var(--color-lucid-text)]');
  
  // Accents (Indigo to Teal)
  newContent = newContent.replace(/bg-indigo-600/g, 'bg-[var(--color-lucid-accent)]');
  newContent = newContent.replace(/hover:bg-indigo-700/g, 'hover:bg-[var(--color-lucid-accent-hover)]');
  newContent = newContent.replace(/text-indigo-600/g, 'text-[var(--color-lucid-accent)]');
  newContent = newContent.replace(/text-indigo-500/g, 'text-[var(--color-lucid-accent)]');
  newContent = newContent.replace(/text-indigo-700/g, 'text-[var(--color-lucid-accent)]');
  newContent = newContent.replace(/bg-indigo-100/g, 'bg-[var(--color-lucid-surface-hover)]');
  newContent = newContent.replace(/border-indigo-200/g, 'border-[var(--color-lucid-accent)]');
  newContent = newContent.replace(/ring-indigo-50/g, 'ring-[var(--color-lucid-accent)]/20');
  newContent = newContent.replace(/focus-within:ring-indigo-500\/20/g, 'focus-within:ring-[var(--color-lucid-accent)]/20');
  newContent = newContent.replace(/focus-within:border-indigo-300/g, 'focus-within:border-[var(--color-lucid-accent)]');
  
  // Warnings (Amber)
  newContent = newContent.replace(/bg-amber-50/g, 'bg-[var(--color-lucid-warn-bg)]');
  newContent = newContent.replace(/border-amber-100/g, 'border-[var(--color-lucid-warn)]/20');
  newContent = newContent.replace(/text-amber-800/g, 'text-[var(--color-lucid-warn)]');
  newContent = newContent.replace(/text-amber-700\/80/g, 'text-[var(--color-lucid-warn)]/80');
  newContent = newContent.replace(/bg-amber-600/g, 'bg-[var(--color-lucid-warn)] text-[var(--color-lucid-base)]');
  newContent = newContent.replace(/hover:bg-amber-700/g, 'hover:bg-[var(--color-lucid-warn)]/80');
  
  return newContent;
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const newContent = replaceColors(content);
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

const targetDir = process.argv[2] ? path.join(__dirname, process.argv[2]) : path.join(__dirname, 'src/pages');
processDirectory(targetDir);
