#!/usr/bin/env node

/**
 * Portfolio API Setup Script
 * This script helps you set up the portfolio contact form API server
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Portfolio API Setup');
console.log('====================\n');

// Check if we're in the right directory
const apiDir = path.join(__dirname);
const packageJsonPath = path.join(apiDir, 'package.json');

if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ Error: package.json not found in current directory');
    console.log('Please run this script from the /api directory');
    process.exit(1);
}

console.log('✅ Found package.json');

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
    execSync('npm install', { stdio: 'inherit', cwd: apiDir });
    console.log('✅ Dependencies installed successfully');
} catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
}

// Check for .env file
const envPath = path.join(apiDir, '.env');
const envExamplePath = path.join(apiDir, '.env.example');

if (!fs.existsSync(envPath)) {
    console.log('\n⚙️  Creating .env file...');
    
    if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ Created .env file from .env.example');
        console.log('⚠️  Please edit .env file with your actual values');
    } else {
        console.log('❌ .env.example not found');
    }
} else {
    console.log('\n✅ .env file already exists');
}

// Instructions
console.log('\n📋 Setup Instructions:');
console.log('======================');

console.log('\n1. 📧 Configure Email Settings:');
console.log('   - Edit the .env file');
console.log('   - Set SMTP_HOST, SMTP_USER, SMTP_PASS');
console.log('   - Set ADMIN_EMAIL to dean@deanforantdesigns.com');

console.log('\n2. 🔐 Set Admin Password:');
console.log('   - Run: node -e "const bcrypt=require(\'bcryptjs\'); console.log(\'ADMIN_PASSWORD_HASH=\' + bcrypt.hashSync(\'your_password\', 12));"');
console.log('   - Copy the output to your .env file');

console.log('\n3. 🚀 Start the Server:');
console.log('   - Development: npm run dev');
console.log('   - Production: npm start');

console.log('\n4. 🛡️  Access Admin Dashboard:');
console.log('   - Open: http://localhost:3001/admin');
console.log('   - Login with your admin password');

console.log('\n5. 🔧 Update Frontend:');
console.log('   - Ensure your contact form posts to /api/contact/submit');
console.log('   - The form JavaScript is already updated');

console.log('\n📚 Additional Information:');
console.log('==========================');

console.log('\n• Spam Detection: Automatically analyzes form submissions');
console.log('• Rate Limiting: Prevents abuse (3 submissions per 15 minutes per IP)');
console.log('• Data Sanitization: Cleans all input data');
console.log('• Auto-Reply: Sends confirmation emails to users');
console.log('• Admin Dashboard: Monitor and configure the system');

console.log('\n🔗 API Endpoints:');
console.log('• POST /api/contact/submit - Submit contact form');
console.log('• GET  /api/contact/health - Check service status');
console.log('• POST /api/admin/login - Admin authentication');
console.log('• GET  /api/admin/settings - Get admin settings');
console.log('• PUT  /api/admin/settings - Update admin settings');

console.log('\n⚠️  Important Notes:');
console.log('• Keep your .env file secure and never commit it to version control');
console.log('• Use strong passwords for admin access');
console.log('• Configure your SMTP settings for email functionality');
console.log('• Test the system thoroughly before going live');

console.log('\n🎉 Setup Complete!');
console.log('You can now start the API server and begin testing.\n');

// Check if nodemon is available for development
try {
    execSync('npx nodemon --version', { stdio: 'ignore' });
    console.log('💡 Tip: Use "npm run dev" for development with auto-restart');
} catch (error) {
    console.log('💡 Tip: Install nodemon globally for better development experience');
    console.log('   npm install -g nodemon');
}

console.log('\n🆘 Need Help?');
console.log('• Check the README.md file for detailed documentation');
console.log('• Verify your .env configuration');
console.log('• Test email settings using the admin dashboard');
console.log('• Monitor the console logs for any errors');
