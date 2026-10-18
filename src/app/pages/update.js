const fs = require('fs');
const path = require('path');

const baseDir = '/Users/softlabit/Documents/gurdian/Guardian-Publication-UI-2.0/src/app/pages';
const lpScssPath = path.join(baseDir, 'landing-page/landing-page.component.scss');
const lp3ScssPath = path.join(baseDir, 'landing-page-3/landing-page-3.component.scss');

let lpScss = fs.readFileSync(lpScssPath, 'utf8');
let lp3Scss = fs.readFileSync(lp3ScssPath, 'utf8');

const commerceStart = lp3Scss.indexOf('/* ---- Commerce Section ---- */');
const afterMainStart = lp3Scss.indexOf('/* ============================================================', commerceStart + 10);
const commerceCss = lp3Scss.substring(commerceStart, afterMainStart);

const responsiveStart = lp3Scss.indexOf('/* ============================================================', afterMainStart + 10);
const responsiveCss = lp3Scss.substring(responsiveStart);

const finalScssToAppend = commerceCss + '\n' + responsiveCss;

let newLpScss = lpScss + '\n' + finalScssToAppend;
fs.writeFileSync(lpScssPath, newLpScss);
console.log('SCSS updated');

const lpPath = path.join(baseDir, 'landing-page/landing-page.component.html');
const lp3Path = path.join(baseDir, 'landing-page-3/landing-page-3.component.html');

let lp = fs.readFileSync(lpPath, 'utf8');
let lp3 = fs.readFileSync(lp3Path, 'utf8');

const mainStart = lp3.indexOf('<main class="main" id="order">');
const mainEnd = lp3.indexOf('</main>', mainStart) + 7;
const mainContent = lp3.substring(mainStart, mainEnd);

const prodStart = lp.indexOf('  <!-- Products / Combo Offers -->');
const indivStart = lp.indexOf('  @if (showIndividualProducts()) {');
let indivEnd = lp.indexOf('  </section>\n  }', indivStart) + 15;

const checkoutStart = lp.indexOf('  <!-- Checkout -->');
const checkoutEnd = lp.indexOf('  </section>', checkoutStart) + 12;

const benefitStart = lp.indexOf('  <!-- Benefits Section -->');
const benefitEnd = lp.indexOf('  </section>\n  }', benefitStart) + 15;
const benefitContent = lp.substring(benefitStart, benefitEnd);

const beforeProd = lp.substring(0, prodStart);
const afterCheckout = lp.substring(checkoutEnd);

const newLp = beforeProd + '\n' + mainContent + '\n\n' + benefitContent + '\n' + afterCheckout;

fs.writeFileSync(lpPath, newLp);
console.log('HTML updated');
