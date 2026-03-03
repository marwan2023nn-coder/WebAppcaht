import json

def check_mismatched_braces(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    mismatches = []
    for key, value in data.items():
        if isinstance(value, str):
            if value.count('{') != value.count('}'):
                mismatches.append((key, value))

    return mismatches

mismatches = check_mismatched_braces('webapp/channels/src/i18n/ar.json')
if mismatches:
    print(f"Found {len(mismatches)} strings with mismatched braces:")
    for key, value in mismatches:
        print(f"Key: {key}\nValue: {value}\n")
else:
    print("No mismatched braces found in values.")
