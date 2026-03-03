import json
import re

def extract_placeholders(s):
    return set(re.findall(r'\{([^{}]+)\}', s))

def check_placeholders(ar_path, en_path):
    with open(ar_path, 'r', encoding='utf-8') as f:
        ar_data = json.load(f)
    with open(en_path, 'r', encoding='utf-8') as f:
        en_data = json.load(f)

    mismatches = []
    for key, ar_value in ar_data.items():
        if key in en_data:
            en_value = en_data[key]
            ar_placeholders = extract_placeholders(ar_value)
            en_placeholders = extract_placeholders(en_value)

            if ar_placeholders != en_placeholders:
                mismatches.append((key, en_value, ar_value))

    return mismatches

mismatches = check_placeholders('ar_008451.json', 'webapp/channels/src/i18n/en.json')
if mismatches:
    print(f"Found {len(mismatches)} placeholder mismatches:")
    for key, en_v, ar_v in mismatches[:20]: # Print first 20
        print(f"Key: {key}\nEN: {en_v}\nAR: {ar_v}\n")
else:
    print("No placeholder mismatches found.")
