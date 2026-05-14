/**
 * Automated Crash Testing Script
 * This script is intended to be run in the staging environment before production promotion.
 */
import puppeteer from 'puppeteer';

const STAGING_URL = process.argv[2] || 'https://resumeapp-staging.vercel.app';

const testScenarios = [
  { name: 'Dashboard load', url: '/dashboard', expect: '.dashboard-container' },
  { name: 'Impact Scanner', url: '/scanner', expect: '.scanner-view' },
  { name: 'Profile Form', url: '/profile', expect: 'form' },
];

async function runCrashTests() {
  console.log(`🚀 Starting crash tests on: ${STAGING_URL}`);
  let browser;

  try {
    browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    for (const scenario of testScenarios) {
      console.log(`🔍 Testing Scenario: ${scenario.name}...`);
      await page.goto(`${STAGING_URL}${scenario.url}`, { waitUntil: 'networkidle0' });
      
      const element = await page.$(scenario.expect);
      if (!element) {
        throw new Error(`CRASH DETECTED: Expected element "${scenario.expect}" not found on ${scenario.url}`);
      }
      console.log(`✅ ${scenario.name} passed.`);
    }

    console.log('🏆 All crash tests passed! Ready for production.');
    process.exit(0);
  } catch (error) {
    console.error('❌ CRITICAL FAILURE during crash tests:');
    console.error(error.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

runCrashTests();
