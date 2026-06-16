#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Simples conversor de JUnit XML para HTML
const xmlFile = process.argv[2] || 'reports/node-results.xml';
const htmlFile = process.argv[3] || 'reports/node-report.html';

if (!fs.existsSync(xmlFile)) {
  console.error(`Arquivo não encontrado: ${xmlFile}`);
  process.exit(1);
}

const xml = fs.readFileSync(xmlFile, 'utf8');

// Parse XML simples usando regex (alternativa ao xml2js para evitar dependências)
const testsuiteMatch = xml.match(/<testsuites|<testsuite/);
const testsuites = xml.match(/<testsuites[\s\S]*?<\/testsuites>|<testsuite[\s\S]*?<\/testsuite>/g) || [];

let totalTests = 0;
let totalFailures = 0;
let totalSkipped = 0;
let totalTime = 0;

// Extrai informações dos testes
const suites = testsuites.map(suite => {
  const testsMatch = suite.match(/tests="(\d+)"/);
  const failuresMatch = suite.match(/failures="(\d+)"/);
  const skippedMatch = suite.match(/skipped="(\d+)"/);
  const timeMatch = suite.match(/time="([\d.]+)"/);
  const nameMatch = suite.match(/name="([^"]*)"/);

  const tests = parseInt(testsMatch?.[1] || 0);
  const failures = parseInt(failuresMatch?.[1] || 0);
  const skipped = parseInt(skippedMatch?.[1] || 0);
  const time = parseFloat(timeMatch?.[1] || 0);

  totalTests += tests;
  totalFailures += failures;
  totalSkipped += skipped;
  totalTime += time;

  // Extrai casos de teste
  const caseRegex = /<testcase[\s\S]*?(?=<testcase|<\/testsuite|$)/g;
  const cases = (suite.match(caseRegex) || []).map(testcase => {
    const nameMatch = testcase.match(/name="([^"]*)"/);
    const classMatch = testcase.match(/classname="([^"]*)"/);
    const timeMatch = testcase.match(/time="([\d.]+)"/);
    const failureMatch = testcase.match(/<failure[^>]*>([\s\S]*?)<\/failure>/);

    return {
      name: nameMatch?.[1] || 'Unknown',
      class: classMatch?.[1] || 'Unknown',
      time: parseFloat(timeMatch?.[1] || 0),
      failed: !!failureMatch,
      message: failureMatch?.[1]?.trim() || ''
    };
  });

  return {
    name: nameMatch?.[1] || 'Default',
    tests,
    failures,
    skipped,
    time,
    cases
  };
});

// Gera HTML
const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Testes - Node.js</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f5f5f5;
      color: #333;
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 30px; }
    h1 { color: #222; margin-bottom: 10px; font-size: 28px; }
    .subtitle { color: #666; margin-bottom: 20px; font-size: 14px; }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
    }
    .stat {
      padding: 15px;
      border-radius: 6px;
      text-align: center;
      background: #f9f9f9;
      border: 1px solid #e0e0e0;
    }
    .stat-value { font-size: 32px; font-weight: bold; margin-bottom: 5px; }
    .stat-label { font-size: 12px; color: #999; text-transform: uppercase; }
    .stat-value.passed { color: #4caf50; }
    .stat-value.failed { color: #f44336; }
    .stat-value.skipped { color: #ff9800; }
    .stat-value.total { color: #2196f3; }
    .suites { margin-bottom: 20px; }
    .suite {
      margin-bottom: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      overflow: hidden;
    }
    .suite-header {
      background: #f5f5f5;
      padding: 15px;
      cursor: pointer;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .suite-header:hover { background: #efefef; }
    .suite-title { font-weight: 600; }
    .suite-stats { font-size: 12px; color: #999; }
    .suite-cases {
      padding: 10px 0;
    }
    .testcase {
      padding: 12px 15px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .testcase:last-child { border-bottom: none; }
    .testcase.failed { background: #ffebee; }
    .testcase.passed { background: #f1f8e9; }
    .testcase-name { font-size: 13px; word-break: break-word; flex: 1; }
    .testcase-time { font-size: 12px; color: #999; margin-left: 10px; white-space: nowrap; }
    .testcase-status {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
      margin-left: 10px;
    }
    .testcase-status.passed { background: #4caf50; }
    .testcase-status.failed { background: #f44336; }
    .failure-message {
      padding: 10px 15px;
      background: #fff3e0;
      border-top: 1px solid #ffe0b2;
      font-size: 12px;
      color: #e65100;
      font-family: 'Courier New', monospace;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Relatório de Testes - Node.js</h1>
    <div class="subtitle">Testes Unitários com node:test</div>
    
    <div class="summary">
      <div class="stat">
        <div class="stat-value total">${totalTests}</div>
        <div class="stat-label">Total de Testes</div>
      </div>
      <div class="stat">
        <div class="stat-value passed">${totalTests - totalFailures - totalSkipped}</div>
        <div class="stat-label">Testes Passaram</div>
      </div>
      <div class="stat">
        <div class="stat-value failed">${totalFailures}</div>
        <div class="stat-label">Testes Falharam</div>
      </div>
      <div class="stat">
        <div class="stat-value skipped">${totalSkipped}</div>
        <div class="stat-label">Testes Pulados</div>
      </div>
      <div class="stat">
        <div class="stat-value">${totalTime.toFixed(2)}s</div>
        <div class="stat-label">Tempo Total</div>
      </div>
    </div>

    <div class="suites">
      ${suites.map((suite, idx) => `
        <div class="suite">
          <div class="suite-header">
            <div class="suite-title">${suite.name}</div>
            <div class="suite-stats">
              ${suite.tests} testes | ${suite.failures} falhas | ${suite.time.toFixed(2)}s
            </div>
          </div>
          <div class="suite-cases">
            ${suite.cases.map(tc => `
              <div class="testcase ${tc.failed ? 'failed' : 'passed'}">
                <div style="flex: 1;">
                  <div class="testcase-name">${tc.class}.${tc.name}</div>
                  ${tc.message ? `<div class="failure-message">${tc.message}</div>` : ''}
                </div>
                <div class="testcase-time">${tc.time.toFixed(3)}s</div>
                <div class="testcase-status ${tc.failed ? 'failed' : 'passed'}">
                  ${tc.failed ? '✕' : '✓'}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>

    <div class="footer">
      Gerado em ${new Date().toLocaleString('pt-BR')}
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync(htmlFile, html);
console.log(`✓ Relatório HTML gerado: ${htmlFile}`);
