import re

with open('src/app/pages/landing-page/landing-page.component.html', 'r') as f:
    lp_html = f.read()

# Extract Trust bar, PDF preview, About
match1 = re.search(r'(<!-- Trust bar -->.*?)<!-- Products / Combo Offers -->', lp_html, re.DOTALL)
section1 = match1.group(1).strip() if match1 else ""

# Extract Benefits
match2 = re.search(r'(<!-- Benefits Section -->.*?)<!-- Checkout -->', lp_html, re.DOTALL)
section2 = match2.group(1).strip() if match2 else ""

# Extract Gallery
match3 = re.search(r'(<!-- Inside pages gallery -->.*?)<!-- Footer CTA -->', lp_html, re.DOTALL)
section3 = match3.group(1).strip() if match3 else ""

with open('src/app/pages/landing-page-3/landing-page-3.component.html', 'r') as f:
    lp3_html = f.read()

# Wrap sections in <div class="landing-page"> to ensure styles apply if they depend on it.
# Actually, since we imported the SCSS, it might be fine without the wrapper.
# Let's wrap them in a container to be safe and structured.
wrapper_start = '\n    <!-- Added dynamic sections from LP -->\n    <div class="landing-page">\n'
wrapper_end = '\n    </div>\n'

# We'll insert section1 right after <!-- 3. Flash Sale Countdown --> block
# Let's find `<div class="lp3-container lp3-main-layout">`
insert_point_1 = '<div class="lp3-container lp3-main-layout">'
lp3_html = lp3_html.replace(insert_point_1, wrapper_start + section1 + wrapper_end + '\n  ' + insert_point_1)

# We'll insert section2 and section3 right before <!-- 9. Bottom Sections -->
insert_point_2 = '<!-- 9. Bottom Sections -->'
lp3_html = lp3_html.replace(insert_point_2, wrapper_start + section2 + '\n\n' + section3 + wrapper_end + '\n  ' + insert_point_2)

with open('src/app/pages/landing-page-3/landing-page-3.component.html', 'w') as f:
    f.write(lp3_html)

print("Update completed.")
