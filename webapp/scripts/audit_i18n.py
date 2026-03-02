import json
import re
from collections import Counter
import os

def find_duplicates(filepath):
    keys = []
    # Match keys at the start of the line, possibly preceded by whitespace
    key_regex = re.compile(r'^\s*"([^"]+)"\s*:')
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                match = key_regex.search(line)
                if match:
                    keys.append(match.group(1))
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return []

    counts = Counter(keys)
    return [key for key, count in counts.items() if count > 1]

def audit():
    # Adjusted paths for script location in webapp/scripts/
    en_path = 'channels/src/i18n/en.json'
    ar_path = 'channels/src/i18n/ar.json'

    # Ensure paths are correct relative to webapp/ directory
    if not os.path.exists(en_path):
        en_path = '../webapp/channels/src/i18n/en.json'
        ar_path = '../webapp/channels/src/i18n/ar.json'

    if not os.path.exists(en_path):
        # Fallback for root execution
        en_path = 'webapp/channels/src/i18n/en.json'
        ar_path = 'webapp/channels/src/i18n/ar.json'

    print(f"Auditing {en_path} and {ar_path}...")

    # 1. Duplicates
    en_duplicates = find_duplicates(en_path)
    ar_duplicates = find_duplicates(ar_path)

    # Load JSON for further comparison
    try:
        with open(en_path, 'r', encoding='utf-8') as f:
            en_data = json.load(f)
        with open(ar_path, 'r', encoding='utf-8') as f:
            ar_data = json.load(f)
    except Exception as e:
        print(f"Error loading JSON: {e}")
        return

    en_keys = set(en_data.keys())
    ar_keys = set(ar_data.keys())

    # 2. Missing keys
    only_en = sorted(list(en_keys - ar_keys))
    only_ar = sorted(list(ar_keys - en_keys))

    # 3. Identical translations
    common_keys = en_keys.intersection(ar_keys)
    identical = []
    for key in common_keys:
        if en_data[key] == ar_data[key]:
            identical.append(key)
    identical.sort()

    # Generate report
    report_path = 'TRANSLATION_AUDIT.md'
    # If running from webapp/scripts, put report in root (assuming ../../)
    if 'webapp/scripts' in os.getcwd():
         report_path = '../../TRANSLATION_AUDIT.md'
    elif 'webapp' in os.getcwd() and not os.getcwd().endswith('webapp'): # e.g. webapp/scripts
         report_path = '../TRANSLATION_AUDIT.md'

    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("# Translation Audit Report\n\n")

        f.write("## 1. Duplicate Keys within each file\n")
        f.write("These keys appear more than once in the same file.\n\n")

        f.write(f"### en.json ({len(en_duplicates)})\n")
        if en_duplicates:
            for key in en_duplicates:
                f.write(f"- `{key}`\n")
        else:
            f.write("No duplicates found in en.json.\n")

        f.write(f"\n### ar.json ({len(ar_duplicates)})\n")
        if ar_duplicates:
            for key in ar_duplicates:
                f.write(f"- `{key}`\n")
        else:
            f.write("No duplicates found in ar.json.\n")

        f.write("\n## 2. Missing Keys\n")
        f.write("Keys that exist in one file but not the other.\n\n")

        f.write(f"### Present in en.json but missing in ar.json ({len(only_en)})\n")
        if only_en:
            for key in only_en:
                f.write(f"- `{key}`\n")
        else:
            f.write("None\n")

        f.write(f"\n### Present in ar.json but missing in en.json ({len(only_ar)})\n")
        if only_ar:
            for key in only_ar:
                f.write(f"- `{key}`\n")
        else:
            f.write("None\n")

        f.write("\n## 3. Identical Translations\n")
        f.write("Keys where the translation in ar.json is identical to the value in en.json.\n")
        f.write("(Note: This may be intended for technical terms, IDs, or placeholders.)\n\n")
        f.write(f"Count: {len(identical)}\n")
        if identical:
            for key in identical:
                f.write(f"- `{key}` (Value: `{en_data[key]}`)\n")
        else:
            f.write("None\n")

    print(f"Audit complete. Report generated at {report_path}")

if __name__ == "__main__":
    audit()
