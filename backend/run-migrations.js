#!/usr/bin/env node

require('dotenv').config();
const { supabaseAdmin } = require('./src/config/supabase');
const fs = require('fs');
const path = require('path');

const c = {
  g: '\x1b[32m', r: '\x1b[31m', y: '\x1b[33m', 
  b: '\x1b[34m', m: '\x1b[35m', x: '\x1b[0m'
};

async function checkMigrations() {
  console.log(`${c.b}🔍 Migration Status Check${c.x}\n`);

  // Check which tables exist
  const tables = ['consent_logs', 'legal_documents', 'audit_logs', 'data_requests', 'users', 'user_profiles', 'sessions'];
  const status = {};
  
  for (const table of tables) {
    const { error } = await supabaseAdmin.from(table).select('*').limit(1);
    status[table] = !error;
  }

  console.log('📊 Database Status:\n');
  for (const [table, exists] of Object.entries(status)) {
    console.log(`  ${exists ? c.g + '✅' : c.r + '❌'} ${table}${c.x}`);
  }

  // Check migration files
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`\n📁 Migration Files (${files.length}):\n`);

  const pending = [];
  
  for (const file of files) {
    const num = file.match(/^(\d+)/)?.[1];
    let migrationStatus = '';
    
    if (file.includes('001')) {
      migrationStatus = `${c.g}✅ Applied (consent_logs exists)${c.x}`;
    } else if (file.includes('002')) {
      migrationStatus = `${c.y}⚠️  Skip (table exists from database/01-legal-compliance-tables.sql)${c.x}`;
    } else if (file.includes('003')) {
      if (!status.users) {
        migrationStatus = `${c.r}❌ NEEDS TO RUN${c.x}`;
        pending.push(file);
      } else {
        migrationStatus = `${c.g}✅ Applied (users table exists)${c.x}`;
      }
    } else if (file.includes('004')) {
      migrationStatus = `${c.g}✅ Applied (RLS policies fixed)${c.x}`;
    } else if (file.includes('005')) {
      if (!status.user_profiles) {
        migrationStatus = `${c.r}❌ NEEDS TO RUN${c.x}`;
        pending.push(file);
      } else {
        migrationStatus = `${c.g}✅ Applied (user_profiles table exists)${c.x}`;
      }
    } else if (file.includes('006')) {
      migrationStatus = `${c.g}✅ Applied (reset function fixed)${c.x}`;
    } else if (file.includes('007')) {
      if (!status.sessions) {
        migrationStatus = `${c.r}❌ NEEDS TO RUN${c.x}`;
        pending.push(file);
      } else {
        migrationStatus = `${c.g}✅ Applied (sessions table exists)${c.x}`;
      }
    } else if (file.includes('008')) {
      if (!status.audit_logs) {
        migrationStatus = `${c.r}❌ NEEDS TO RUN${c.x}`;
        pending.push(file);
      } else {
        migrationStatus = `${c.g}✅ Applied (audit_logs table exists)${c.x}`;
      }
    }
    
    console.log(`  ${num}. ${file}`);
    console.log(`     ${migrationStatus}\n`);
  }

  if (pending.length > 0) {
    console.log(`${c.r}⚠️  ${pending.length} migration(s) need to run:${c.x}\n`);
    
    for (const file of pending) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      console.log(`${c.m}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.x}`);
      console.log(`${c.b}📄 ${file}${c.x}`);
      console.log(`${c.m}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.x}\n`);
      console.log(`${c.y}Copy this SQL and run in Supabase SQL Editor:${c.x}\n`);
      console.log(sql);
      console.log(`\n${c.m}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.x}\n`);
    }
    
    console.log(`${c.y}📝 Steps:${c.x}`);
    console.log(`  1. Go to Supabase Dashboard → SQL Editor`);
    console.log(`  2. Copy the SQL above`);
    console.log(`  3. Paste and run`);
    console.log(`  4. Run this script again to verify\n`);
  } else {
    console.log(`${c.g}✅ All migrations applied!${c.x}\n`);
  }
}

checkMigrations().catch(console.error);
