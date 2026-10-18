import re
import sys

file_path = '/Users/softlabit/Documents/gurdian/Guardian-Publication-UI-2.0/src/app/pages/landing-page/landing-page.component.scss'
html_path = '/Users/softlabit/Documents/gurdian/Guardian-Publication-UI-2.0/src/app/pages/landing-page/landing-page.component.html'

def replace_in_file(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Define replacements
        replacements = [
            (r'(?i)#16a34a', 'var(--lp-primary)'),
            (r'(?i)#15803d', 'var(--lp-primary-dark)'),
            (r'(?i)#166534', 'var(--lp-primary-dark)'),
            (r'(?i)#14532d', 'var(--lp-primary-dark)'),
            (r'(?i)#1a4d2e', 'var(--lp-primary-dark)'),
            (r'(?i)#1a3c2e', 'var(--lp-primary-dark)'),
        ]

        original_content = content
        for pattern, replacement in replacements:
            content = re.sub(pattern, replacement, content)

        if content != original_content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {path}")
        else:
            print(f"No changes in {path}")
    except Exception as e:
        print(f"Error processing {path}: {e}")

replace_in_file(file_path)
replace_in_file(html_path)
